// === STATE ===
const state = {
  teams: [
    { name: 'Nosotros', score: 0 },
    { name: 'Ellos',    score: 0 }
  ],
  TARGET: 30,
  mano: 0
};

let rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
let gameHistory  = [];

// === DOM REFS ===
const board            = document.getElementById('board');
const controls         = document.getElementById('controls');
const toggleGalloBtn   = document.getElementById('toggleGallo');
const siguienteManoBtn = document.getElementById('siguienteMano');
const resetBtn         = document.getElementById('resetBtn');
const toggleDarkBtn    = document.getElementById('toggleDarkMode');
const toggleTargetBtn  = document.getElementById('toggleTarget');
const byPointsBtn      = document.getElementById('byPointsBtn');
const historyBtn       = document.getElementById('historyBtn');
const setupModal       = document.getElementById('setupModal');
const winnerOverlay    = document.getElementById('winnerOverlay');
const historyOverlay   = document.getElementById('historyOverlay');
const confirmModal     = document.getElementById('confirmModal');

// === ELEMENT CACHE ===
let teamElements       = [];
let savedGallo         = null;
let pendingWinnerIndex = -1;
let setupSize          = 1;

// === PERSISTENCE ===
function saveState() {
  localStorage.setItem('trucoState', JSON.stringify({
    teams:  state.teams,
    mano:   state.mano,
    target: state.TARGET,
    ranked: rankedConfig
  }));
}

function loadState() {
  const saved = localStorage.getItem('trucoState');
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    if (Array.isArray(data)) {
      state.teams = data; // legacy format
    } else {
      state.teams  = data.teams  ?? state.teams;
      state.mano   = data.mano   ?? 0;
      state.TARGET = data.target ?? 30;
      rankedConfig = data.ranked ?? rankedConfig;
    }
  } catch(e) {}
}

function loadHistory() {
  try {
    gameHistory = JSON.parse(localStorage.getItem('trucoHistory') || '[]');
  } catch(e) { gameHistory = []; }
}

function saveHistory() {
  localStorage.setItem('trucoHistory', JSON.stringify(gameHistory));
}

// === THEME ===
function loadTheme() {
  if (localStorage.getItem('lightMode') === 'true') document.body.classList.add('light');
  updateThemeBtn();
}

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('lightMode', document.body.classList.contains('light'));
  updateThemeBtn();
}

function updateThemeBtn() {
  toggleDarkBtn.textContent = document.body.classList.contains('light') ? '◐' : '◑';
}

// === TARGET TOGGLE ===
function toggleTarget() {
  state.TARGET = state.TARGET === 30 ? 15 : 30;
  state.teams.forEach(t => { t.score = 0; });
  updateTargetBtn();
  render();
  saveState();
}

function updateTargetBtn() {
  toggleTargetBtn.textContent = state.TARGET === 15 ? '30' : '15';
}

// === SOUND ===
let audioCtx = null;

function playTone(freq, duration, type = 'sine', gainVal = 0.3) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

function soundAdd()    { playTone(660, 0.12); }
function soundRemove() { playTone(220, 0.1, 'sine', 0.2); }

// === HELPERS ===
function teamKey(players) {
  return [...players].sort().join('+');
}

function teamLabel(players) {
  if (!players?.length) return '';
  if (players.length === 1) return players[0];
  if (players.length === 2) return `${players[0]} y ${players[1]}`;
  return `${players.slice(0, -1).join(', ')} y ${players[players.length - 1]}`;
}

function teamInitials(players) {
  if (!players?.length) return '';
  return players.map(p => (p.trim()[0] || '?').toUpperCase()).join('·');
}

// === GALLO PAIR ===
function getGalloPair() {
  const galloIdx = [2, 0, 1][state.mano % 3];
  return { galloIdx, pairIdx: [0, 1, 2].filter(i => i !== galloIdx) };
}

// === SEGMENTS ===
function updateSegments(segmentEls, totalScore) {
  const numSections = segmentEls.length / 15;
  for (let section = 0; section < numSections; section++) {
    const offset    = section * 15;
    const inSection = Math.max(0, Math.min(15, totalScore - offset));
    for (let cell = 0; cell < 3; cell++) {
      const cellPts = Math.max(0, Math.min(5, inSection - cell * 5));
      for (let seg = 0; seg < 5; seg++) {
        segmentEls[section * 15 + cell * 5 + seg]
          .classList.toggle('on', (seg + 1) <= cellPts);
      }
    }
  }
}

function updateScore(index) {
  const refs = teamElements[index]?._refs;
  if (!refs) return;
  const score = state.teams[index].score;
  refs.totalDisplay.textContent = score;
  refs.totalDisplay.classList.remove('bump');
  void refs.totalDisplay.offsetWidth;
  refs.totalDisplay.classList.add('bump');
  updateSegments(refs.segments, score);
}

// === DOM BUILDING ===
function buildSections(container) {
  const segments = [];
  const defs = state.TARGET === 15
    ? [{ label: null, cls: 'section section-single' }]
    : [
        { label: 'Malas',  cls: 'section section-malas'  },
        { label: 'Buenas', cls: 'section section-buenas' }
      ];

  defs.forEach(({ label, cls }) => {
    const section = document.createElement('div');
    section.className = cls;

    if (label) {
      const lbl = document.createElement('div');
      lbl.className = 'section-label';
      lbl.textContent = label;
      section.appendChild(lbl);
    }

    const row = document.createElement('div');
    row.className = 'row';
    for (let cell = 0; cell < 3; cell++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      for (let seg = 1; seg <= 5; seg++) {
        const s = document.createElement('div');
        s.className = 'seg p' + seg;
        cellDiv.appendChild(s);
        segments.push(s);
      }
      row.appendChild(cellDiv);
    }
    section.appendChild(row);
    container.appendChild(section);
  });
  return segments;
}

function buildTeamElement(team, index) {
  const el = document.createElement('div');
  el.className = 'team';

  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'name';
  nameInput.value = team.name;
  nameInput.addEventListener('input', e => {
    state.teams[index].name = e.target.value;
    saveState();
  });

  const totalDisplay = document.createElement('div');
  totalDisplay.className = 'total-display';
  totalDisplay.textContent = team.score;

  headerRow.append(nameInput, totalDisplay);
  el.appendChild(headerRow);

  const segments = buildSections(el);

  const teamControls = document.createElement('div');
  teamControls.className = 'team-controls';

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn-action btn-plus';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => addPoints(index, 1));

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn-action btn-minus';
  minusBtn.textContent = '-';
  minusBtn.addEventListener('click', () => addPoints(index, -1));

  teamControls.append(plusBtn, minusBtn);
  el.appendChild(teamControls);

  el._refs = { nameInput, totalDisplay, segments };
  return el;
}

function buildPlayerColumn(team, index) {
  const el = document.createElement('div');
  el.className = 'dupla-player';

  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'name';
  nameInput.value = team.name;
  nameInput.addEventListener('input', e => {
    state.teams[index].name = e.target.value;
    saveState();
  });

  const totalDisplay = document.createElement('div');
  totalDisplay.className = 'total-display';
  totalDisplay.textContent = team.score;

  headerRow.append(nameInput, totalDisplay);
  el.appendChild(headerRow);

  const segments = buildSections(el);
  el._refs = { nameInput, totalDisplay, segments };
  return el;
}

function buildDuplaCard(pairIdx) {
  const card = document.createElement('div');
  card.className = 'dupla-card';

  const playersRow = document.createElement('div');
  playersRow.className = 'dupla-players';

  pairIdx.forEach((idx, i) => {
    if (i > 0) {
      const div = document.createElement('div');
      div.className = 'dupla-divider';
      playersRow.appendChild(div);
    }
    const col = buildPlayerColumn(state.teams[idx], idx);
    playersRow.appendChild(col);
    teamElements[idx] = col;
    updateSegments(col._refs.segments, state.teams[idx].score);
  });

  card.appendChild(playersRow);

  const sharedControls = document.createElement('div');
  sharedControls.className = 'team-controls';

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn-action btn-plus';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => addPointsDupla(1));

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn-action btn-minus';
  minusBtn.textContent = '-';
  minusBtn.addEventListener('click', () => addPointsDupla(-1));

  sharedControls.append(plusBtn, minusBtn);
  card.appendChild(sharedControls);
  return card;
}

function buildControlGroup(index) {
  const group = document.createElement('div');
  group.className = 'btn-group';
  const minus = document.createElement('button');
  minus.className = 'btn-action btn-minus';
  minus.textContent = '-';
  minus.addEventListener('click', () => addPoints(index, -1));
  const plus = document.createElement('button');
  plus.className = 'btn-action btn-plus';
  plus.textContent = '+';
  plus.addEventListener('click', () => addPoints(index, 1));
  group.append(minus, plus);
  return group;
}

// === RENDER ===
function render() {
  board.innerHTML = '';
  controls.innerHTML = '';
  teamElements = [];

  const isGallo = state.teams.length === 3;
  toggleGalloBtn.textContent        = isGallo ? '- Gallo' : '+ Gallo';
  siguienteManoBtn.style.display    = isGallo ? '' : 'none';
  byPointsBtn.style.display         = isGallo ? 'none' : '';
  historyBtn.style.display          = isGallo ? 'none' : '';

  if (isGallo) {
    board.className = 'board gallo';
    renderGalloBoard();
  } else {
    board.className = 'board';
    state.teams.forEach((team, index) => {
      const teamEl = buildTeamElement(team, index);
      board.appendChild(teamEl);
      teamElements[index] = teamEl;
      controls.appendChild(buildControlGroup(index));
      updateSegments(teamEl._refs.segments, team.score);
    });
  }
}

function renderGalloBoard() {
  const { pairIdx, galloIdx } = getGalloPair();
  board.appendChild(buildDuplaCard(pairIdx));

  const galloCard = buildTeamElement(state.teams[galloIdx], galloIdx);
  board.appendChild(galloCard);
  teamElements[galloIdx] = galloCard;
  updateSegments(galloCard._refs.segments, state.teams[galloIdx].score);
}

// === ACTIONS ===
function addPoints(index, delta) {
  const team = state.teams[index];
  const prev = team.score;
  team.score = Math.max(0, Math.min(state.TARGET, team.score + delta));
  if (team.score !== prev) delta > 0 ? soundAdd() : soundRemove();
  updateScore(index);
  saveState();
  if (team.score === state.TARGET && state.teams.length === 2 && rankedConfig.active) {
    showWinnerOverlay(index);
  }
}

function addPointsDupla(delta) {
  getGalloPair().pairIdx.forEach(idx => addPoints(idx, delta));
}

function siguienteMano() {
  state.mano += 1;
  render();
  saveState();
}

function doReset() {
  state.teams.forEach((t, i) => {
    t.score = 0;
    t.name  = i === 0 ? 'Nosotros' : 'Ellos';
  });
  if (state.teams.length === 3) state.teams.pop();
  state.mano   = 0;
  savedGallo   = null;
  rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
  render();
  saveState();
}

function resetAll() {
  confirmModal.classList.remove('hidden');
}

// === SETUP MODAL ===
function openSetupModal() {
  setupSize = 1;
  refreshSizeBtns();
  refreshPlayerInputs();
  setupModal.classList.remove('hidden');
}

function refreshSizeBtns() {
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.size) === setupSize);
  });
}

function refreshPlayerInputs() {
  [1, 2].forEach(teamNum => {
    const container = document.getElementById(`team${teamNum}Inputs`);
    container.innerHTML = '';
    for (let i = 0; i < setupSize; i++) {
      const input = document.createElement('input');
      input.type        = 'text';
      input.className   = 'player-input';
      input.placeholder = `Jugador ${i + 1}`;
      input.maxLength   = 15;
      container.appendChild(input);
    }
  });
  setTimeout(() => setupModal.querySelector('.player-input')?.focus(), 50);
}

function confirmSetup() {
  const getNames = n =>
    [...document.querySelectorAll(`#team${n}Inputs .player-input`)]
      .map(i => i.value.trim());

  const names1 = getNames(1);
  const names2 = getNames(2);

  // Highlight empty fields
  let hasEmpty = false;
  document.querySelectorAll('.player-input').forEach(input => {
    if (!input.value.trim()) { input.classList.add('input-error'); hasEmpty = true; }
  });
  if (hasEmpty) return;

  rankedConfig          = { active: true, teamSize: setupSize, teams: [names1, names2] };
  state.teams[0].name   = setupSize === 1 ? teamLabel(names1) : teamInitials(names1);
  state.teams[1].name   = setupSize === 1 ? teamLabel(names2) : teamInitials(names2);

  setupModal.classList.add('hidden');
  render();
  saveState();
}

// === WINNER OVERLAY ===
function showWinnerOverlay(winnerIndex) {
  pendingWinnerIndex = winnerIndex;
  const winner = rankedConfig.teams[winnerIndex];
  const loser  = rankedConfig.teams[1 - winnerIndex];

  document.getElementById('winnerLabel').textContent =
    rankedConfig.teamSize === 1 ? 'Gan\u00f3' : 'Ganaron';
  document.getElementById('winnerName').textContent  = teamLabel(winner);
  document.getElementById('winnerScore').textContent =
    `${state.teams[winnerIndex].score}\u2013${state.teams[1 - winnerIndex].score}`;

  winnerOverlay.classList.remove('hidden');
}

function saveGame(winnerIndex) {
  gameHistory.unshift({
    date:      new Date().toISOString(),
    teamSize:  rankedConfig.teamSize,
    teams:     rankedConfig.teams.map((players, i) => ({
      players,
      score: state.teams[i].score
    })),
    winnerKey: teamKey(rankedConfig.teams[winnerIndex])
  });
  saveHistory();
}

// === HISTORY VIEW ===
function openHistory() {
  renderHistoryView();
  historyOverlay.classList.remove('hidden');
}

function renderHistoryView() {
  const content = document.getElementById('historyContent');

  if (gameHistory.length === 0) {
    content.innerHTML = '<p class="history-empty">Todav\u00eda no hay partidas registradas.</p>';
    return;
  }

  // Group games by teamSize
  const byMode = {};
  gameHistory.forEach(game => {
    const size = game.teamSize || 1;
    if (!byMode[size]) byMode[size] = [];
    byMode[size].push(game);
  });

  let html = '';

  [1, 2, 3].forEach(size => {
    const games = byMode[size];
    if (!games) return;

    const modeLabel = `${size}v${size}`;

    // Aggregate stats for this mode
    const stats = {};
    games.forEach(game => {
      game.teams.forEach(team => {
        const key = teamKey(team.players);
        if (!stats[key]) stats[key] = { label: teamLabel(team.players), wins: 0, games: 0 };
        stats[key].games++;
        if (key === game.winnerKey) stats[key].wins++;
      });
    });

    Object.keys(stats).forEach(key => {
      let streak = 0;
      for (const game of games) {
        if (!game.teams.some(t => teamKey(t.players) === key)) continue;
        if (game.winnerKey === key) streak++;
        else break;
      }
      stats[key].streak  = streak;
      stats[key].winRate = stats[key].games
        ? Math.round(stats[key].wins / stats[key].games * 100) : 0;
    });

    const sorted = Object.values(stats).sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);

    html += `<div class="history-section-title">${modeLabel} \u2014 Estad\u00edsticas</div>`;
    html += '<div class="history-stats">';
    sorted.forEach(s => {
      const streak = s.streak >= 2
        ? `<span class="stat-streak">${s.streak} seguidas</span>` : '';
      html += `
        <div class="stat-row">
          <span class="stat-name">${s.label}</span>
          <span class="stat-record">${s.wins}G&nbsp;${s.games - s.wins}P</span>
          <span class="stat-rate">${s.winRate}%</span>
          ${streak}
        </div>`;
    });
    html += '</div>';

    html += `<div class="history-section-title" style="margin-top:16px">${modeLabel} \u2014 Partidas</div>`;
    html += '<div class="history-games">';
    games.slice(0, 20).forEach(game => {
      const d       = new Date(game.date);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      const winner  = game.teams.find(t => teamKey(t.players) === game.winnerKey);
      const loser   = game.teams.find(t => teamKey(t.players) !== game.winnerKey);
      html += `
        <div class="game-row">
          <span class="game-date">${dateStr}</span>
          <span class="game-result">
            <span class="game-winner">${teamLabel(winner?.players)}</span>
            <span class="game-vs"> vs </span>
            <span class="game-loser">${teamLabel(loser?.players)}</span>
          </span>
          <span class="game-score">${winner?.score ?? 0}\u2013${loser?.score ?? 0}</span>
        </div>`;
    });
    html += '</div>';
  });

  content.innerHTML = html;
}

// === EVENT LISTENERS ===
toggleGalloBtn.addEventListener('click', () => {
  if (state.teams.length === 2) {
    state.teams.push(savedGallo || { name: 'Gallo', score: 0 });
    savedGallo   = null;
    state.mano   = 0;
  } else {
    savedGallo = state.teams.pop();
  }
  render();
  saveState();
});

siguienteManoBtn.addEventListener('click', siguienteMano);
resetBtn.addEventListener('click', resetAll);
toggleDarkBtn.addEventListener('click', toggleTheme);
toggleTargetBtn.addEventListener('click', toggleTarget);
byPointsBtn.addEventListener('click', openSetupModal);
historyBtn.addEventListener('click', openHistory);

// Size selector
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setupSize = parseInt(btn.dataset.size);
    refreshSizeBtns();
    refreshPlayerInputs();
  });
});

document.getElementById('confirmSetup').addEventListener('click', confirmSetup);
document.getElementById('cancelSetup').addEventListener('click', () => {
  setupModal.classList.add('hidden');
});

// Clear input error on typing
document.addEventListener('input', e => {
  if (e.target.classList.contains('player-input')) e.target.classList.remove('input-error');
});

// Winner overlay
document.getElementById('saveGameBtn').addEventListener('click', () => {
  if (pendingWinnerIndex >= 0) {
    saveGame(pendingWinnerIndex);
    pendingWinnerIndex = -1;
  }
  winnerOverlay.classList.add('hidden');
  state.teams.forEach((t, i) => { t.score = 0; t.name = i === 0 ? 'Nosotros' : 'Ellos'; });
  rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
  render();
  saveState();
});

document.getElementById('skipSaveBtn').addEventListener('click', () => {
  pendingWinnerIndex = -1;
  winnerOverlay.classList.add('hidden');
});

// History overlay
document.getElementById('closeHistory').addEventListener('click', () => {
  historyOverlay.classList.add('hidden');
});

// Confirm reset modal
document.getElementById('confirmModalOk').addEventListener('click', () => {
  confirmModal.classList.add('hidden');
  doReset();
});
document.getElementById('confirmModalCancel').addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

// Close any modal on backdrop click
[setupModal, winnerOverlay, historyOverlay, confirmModal].forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      if (modal === winnerOverlay) pendingWinnerIndex = -1;
      modal.classList.add('hidden');
    }
  });
});

// === INIT ===
loadTheme();
loadState();
loadHistory();
updateTargetBtn();
render();
