// === CONSTANTS ===
const POINTS_PER_CELL    = 5;
const CELLS_PER_SECTION  = 3;
const SEGMENTS_PER_SECTION = POINTS_PER_CELL * CELLS_PER_SECTION; // 15
const GALLO_ROTATION     = [2, 0, 1];
const MAX_HISTORY_PAGE   = 20;
const UNDO_LIMIT         = 10;
const DEFAULT_NAMES      = ['Nosotros', 'Ellos'];

// === STATE ===
const state = {
  teams: [
    { name: DEFAULT_NAMES[0], score: 0 },
    { name: DEFAULT_NAMES[1], score: 0 }
  ],
  TARGET: 30,
  mano: 0
};

let rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
let gameHistory  = [];
let undoStack    = [];

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
let historyPage        = {};

// === PERSISTENCE ===
function saveState() {
  try {
    localStorage.setItem('trucoState', JSON.stringify({
      teams:  state.teams,
      mano:   state.mano,
      target: state.TARGET,
      ranked: rankedConfig
    }));
  } catch(e) {
    console.warn('No se pudo guardar el estado:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('trucoState');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (Array.isArray(data)) {
      state.teams = data; // legacy format
    } else {
      state.teams  = data.teams  ?? state.teams;
      state.mano   = data.mano   ?? 0;
      state.TARGET = data.target ?? 30;
      rankedConfig = data.ranked ?? rankedConfig;
    }
  } catch(e) {
    console.error('No se pudo cargar el estado:', e);
  }
  // Inicializar AudioContext temprano para evitar lag en el primer sonido
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {
    console.warn('AudioContext no disponible:', e);
  }
}

function loadHistory() {
  try {
    gameHistory = JSON.parse(localStorage.getItem('trucoHistory') || '[]');
  } catch(e) {
    console.error('No se pudo cargar el historial:', e);
    gameHistory = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('trucoHistory', JSON.stringify(gameHistory));
  } catch(e) {
    console.warn('No se pudo guardar el historial:', e);
  }
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
  undoStack = [];
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
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {
    console.warn('Error reproduciendo sonido:', e);
  }
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
  const galloIdx = GALLO_ROTATION[state.mano % GALLO_ROTATION.length];
  return { galloIdx, pairIdx: [0, 1, 2].filter(i => i !== galloIdx) };
}

// === SEGMENTS ===
function updateSegments(segmentEls, totalScore) {
  const numSections = segmentEls.length / SEGMENTS_PER_SECTION;
  for (let section = 0; section < numSections; section++) {
    const offset    = section * SEGMENTS_PER_SECTION;
    const inSection = Math.max(0, Math.min(SEGMENTS_PER_SECTION, totalScore - offset));
    for (let cell = 0; cell < CELLS_PER_SECTION; cell++) {
      const cellPts = Math.max(0, Math.min(POINTS_PER_CELL, inSection - cell * POINTS_PER_CELL));
      for (let seg = 0; seg < POINTS_PER_CELL; seg++) {
        segmentEls[section * SEGMENTS_PER_SECTION + cell * POINTS_PER_CELL + seg]
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
  refs.totalDisplay.setAttribute('aria-label', `Puntos: ${score}`);
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
    for (let cell = 0; cell < CELLS_PER_SECTION; cell++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      for (let seg = 1; seg <= POINTS_PER_CELL; seg++) {
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

// Shared builder para team cards y dupla player columns (DRY)
function buildScorePanel(team, index, { className, showControls }) {
  const el = document.createElement('div');
  el.className = className;

  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'name';
  nameInput.value = team.name;
  nameInput.setAttribute('aria-label', `Nombre del equipo ${index + 1}`);
  nameInput.addEventListener('input', e => {
    state.teams[index].name = e.target.value;
    saveState();
  });

  const totalDisplay = document.createElement('div');
  totalDisplay.className = 'total-display';
  totalDisplay.textContent = team.score;
  totalDisplay.setAttribute('aria-live', 'polite');
  totalDisplay.setAttribute('aria-label', `Puntos: ${team.score}`);

  headerRow.append(nameInput, totalDisplay);
  el.appendChild(headerRow);

  const segments = buildSections(el);

  if (showControls) {
    const teamControls = document.createElement('div');
    teamControls.className = 'team-controls';

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn-action btn-plus';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', `Sumar punto a ${team.name}`);
    plusBtn.addEventListener('click', () => addPoints(index, 1));

    const minusBtn = document.createElement('button');
    minusBtn.className = 'btn-action btn-minus';
    minusBtn.textContent = '-';
    minusBtn.setAttribute('aria-label', `Restar punto a ${team.name}`);
    minusBtn.addEventListener('click', () => addPoints(index, -1));

    teamControls.append(plusBtn, minusBtn);
    el.appendChild(teamControls);
  }

  el._refs = { nameInput, totalDisplay, segments };
  return el;
}

function buildTeamElement(team, index) {
  return buildScorePanel(team, index, { className: 'team', showControls: true });
}

function buildPlayerColumn(team, index) {
  return buildScorePanel(team, index, { className: 'dupla-player', showControls: false });
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
  plusBtn.setAttribute('aria-label', 'Sumar punto a la dupla');
  plusBtn.addEventListener('click', () => addPointsDupla(1));

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn-action btn-minus';
  minusBtn.textContent = '-';
  minusBtn.setAttribute('aria-label', 'Restar punto a la dupla');
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
  minus.setAttribute('aria-label', `Restar punto a ${state.teams[index].name}`);
  minus.addEventListener('click', () => addPoints(index, -1));
  const plus = document.createElement('button');
  plus.className = 'btn-action btn-plus';
  plus.textContent = '+';
  plus.setAttribute('aria-label', `Sumar punto a ${state.teams[index].name}`);
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

// === UNDO ===
function pushUndo() {
  undoStack.push(JSON.stringify({
    teams: state.teams.map(t => ({ ...t })),
    mano: state.mano
  }));
  if (undoStack.length > UNDO_LIMIT) undoStack.shift();
}

function undo() {
  if (!undoStack.length) return;
  const snapshot = JSON.parse(undoStack.pop());
  // Guard: si el team count cambió (e.g. toggle Gallo), ignorar el snapshot
  if (snapshot.teams.length !== state.teams.length) { undoStack = []; return; }
  snapshot.teams.forEach((t, i) => {
    state.teams[i].score = t.score;
    state.teams[i].name  = t.name;
  });
  state.mano = snapshot.mano;
  state.teams.forEach((_, i) => updateScore(i));
  saveState();
}

// === ACTIONS ===
function addPoints(index, delta, { skipUndo = false } = {}) {
  const team = state.teams[index];
  const prev = team.score;
  const next = Math.max(0, Math.min(state.TARGET, team.score + delta));
  if (next === prev) return;
  if (!skipUndo) pushUndo();
  team.score = next;
  delta > 0 ? soundAdd() : soundRemove();
  updateScore(index);
  saveState();
  if (team.score === state.TARGET && state.teams.length === 2 && rankedConfig.active && state.TARGET === 30) {
    showWinnerOverlay(index);
  }
}

function addPointsDupla(delta) {
  // Push un único snapshot para que Ctrl+Z deshaga la dupla de forma atómica
  pushUndo();
  getGalloPair().pairIdx.forEach(idx => addPoints(idx, delta, { skipUndo: true }));
}

function siguienteMano() {
  state.mano += 1;
  render();
  saveState();
}

function doReset() {
  state.teams.forEach((t, i) => {
    t.score = 0;
    t.name  = DEFAULT_NAMES[i] ?? `Equipo ${i + 1}`;
  });
  if (state.teams.length === 3) state.teams.pop();
  state.mano   = 0;
  state.TARGET = 30;
  savedGallo   = null;
  undoStack    = [];
  rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
  updateTargetBtn();
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
      input.placeholder = setupSize === 1 ? `Jugador ${teamNum}` : `Jugador ${i + 1}`;
      input.maxLength   = 15;
      input.setAttribute('aria-label', `Nombre del jugador ${i + 1} del equipo ${teamNum}`);
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

  document.getElementById('winnerLabel').textContent =
    rankedConfig.teamSize === 1 ? 'Ganó' : 'Ganaron';
  document.getElementById('winnerName').textContent  = teamLabel(winner);
  document.getElementById('winnerScore').textContent =
    `${state.teams[winnerIndex].score}–${state.teams[1 - winnerIndex].score}`;

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
  historyPage = {};
  renderHistoryView();
  historyOverlay.classList.remove('hidden');
}

function renderHistoryView() {
  const content = document.getElementById('historyContent');

  if (gameHistory.length === 0) {
    content.innerHTML = '<p class="history-empty">Todavía no hay partidas registradas.</p>';
    return;
  }

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
    const page      = historyPage[size] || 1;
    const shown     = page * MAX_HISTORY_PAGE;

    // Estadísticas agregadas
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

    html += `<div class="history-section-title">${modeLabel} — Estadísticas</div>`;
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

    html += `<div class="history-section-title" style="margin-top:16px">${modeLabel} — Partidas</div>`;
    html += '<div class="history-games">';
    games.slice(0, shown).forEach(game => {
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
          <span class="game-score">${winner?.score ?? 0}–${loser?.score ?? 0}</span>
        </div>`;
    });

    if (games.length > shown) {
      html += `<button class="history-load-more" data-mode="${size}">Ver más (${games.length - shown} restantes)</button>`;
    }

    html += '</div>';
  });

  content.innerHTML = html;

  // Paginación: "Ver más"
  content.querySelectorAll('.history-load-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = parseInt(btn.dataset.mode);
      historyPage[mode] = (historyPage[mode] || 1) + 1;
      renderHistoryView();
    });
  });
}

// === KEYBOARD SHORTCUTS ===
// ← / → sumar punto al equipo izquierdo / derecho
// Shift+← / Shift+→ restar punto
// Ctrl+Z / Cmd+Z deshacer
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if ([setupModal, winnerOverlay, confirmModal].some(m => !m.classList.contains('hidden'))) return;

  const isGallo = state.teams.length === 3;

  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      if (isGallo) {
        e.shiftKey ? addPointsDupla(-1) : addPointsDupla(1);
      } else {
        e.shiftKey ? addPoints(0, -1) : addPoints(0, 1);
      }
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (isGallo) {
        const { galloIdx } = getGalloPair();
        e.shiftKey ? addPoints(galloIdx, -1) : addPoints(galloIdx, 1);
      } else {
        e.shiftKey ? addPoints(1, -1) : addPoints(1, 1);
      }
      break;
    case 'z':
    case 'Z':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        undo();
      }
      break;
  }
});

// === EVENT LISTENERS ===
toggleGalloBtn.addEventListener('click', () => {
  if (state.teams.length === 2) {
    state.teams.push(savedGallo || { name: 'Gallo', score: 0 });
    savedGallo = null;
    state.mano = 0;
  } else {
    savedGallo = state.teams.pop();
  }
  undoStack = [];
  render();
  saveState();
});

siguienteManoBtn.addEventListener('click', siguienteMano);
resetBtn.addEventListener('click', resetAll);
toggleDarkBtn.addEventListener('click', toggleTheme);
toggleTargetBtn.addEventListener('click', toggleTarget);
byPointsBtn.addEventListener('click', openSetupModal);
historyBtn.addEventListener('click', openHistory);

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

document.addEventListener('input', e => {
  if (e.target.classList.contains('player-input')) e.target.classList.remove('input-error');
});

document.getElementById('saveGameBtn').addEventListener('click', () => {
  if (pendingWinnerIndex >= 0) {
    saveGame(pendingWinnerIndex);
    pendingWinnerIndex = -1;
  }
  winnerOverlay.classList.add('hidden');
  state.teams.forEach((t, i) => { t.score = 0; t.name = DEFAULT_NAMES[i] ?? `Equipo ${i + 1}`; });
  rankedConfig = { active: false, teamSize: 1, teams: [[], []] };
  render();
  saveState();
});

document.getElementById('skipSaveBtn').addEventListener('click', () => {
  pendingWinnerIndex = -1;
  winnerOverlay.classList.add('hidden');
});

document.getElementById('closeHistory').addEventListener('click', () => {
  historyOverlay.classList.add('hidden');
});

document.getElementById('confirmModalOk').addEventListener('click', () => {
  confirmModal.classList.add('hidden');
  doReset();
});
document.getElementById('confirmModalCancel').addEventListener('click', () => {
  confirmModal.classList.add('hidden');
});

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
