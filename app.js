// --- State ---
const state = {
  teams: [
    { name: 'Nosotros', score: 0 },
    { name: 'Ellos', score: 0 }
  ],
  TARGET: 30
};

// --- DOM References ---
const board = document.getElementById('board');
const controls = document.getElementById('controls');
const toggleGalloBtn = document.getElementById('toggleGallo');
const resetBtn = document.getElementById('resetBtn');
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');

// --- Element Cache ---
let teamElements = [];

// --- Persistence ---
function saveState() {
  localStorage.setItem('trucoState', JSON.stringify(state.teams));
}

function loadState() {
  const saved = localStorage.getItem('trucoState');
  if (saved) {
    try {
      state.teams = JSON.parse(saved);
    } catch (e) {
      // Ignore corrupt data
    }
  }
}

// --- Theme Toggle ---
function loadTheme() {
  if (localStorage.getItem('lightMode') === 'true') {
    document.body.classList.add('light');
  }
  updateThemeButton();
}

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('lightMode', document.body.classList.contains('light'));
  updateThemeButton();
}

function updateThemeButton() {
  const isLight = document.body.classList.contains('light');
  toggleDarkModeBtn.textContent = isLight ? '◐' : '◑';
}

// --- DOM Building ---
function buildTeamElement(team, index) {
  const el = document.createElement('div');
  el.className = 'team';

  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'name';
  nameInput.value = team.name;
  nameInput.addEventListener('input', (e) => {
    state.teams[index].name = e.target.value;
    saveState();
  });

  const totalDisplay = document.createElement('div');
  totalDisplay.className = 'total-display';
  totalDisplay.textContent = team.score;

  headerRow.appendChild(nameInput);
  headerRow.appendChild(totalDisplay);
  el.appendChild(headerRow);

  const segments = [];

  // Build Malas and Buenas sections
  ['Malas', 'Buenas'].forEach((label, i) => {
    const section = document.createElement('div');
    section.className = i === 0 ? 'section section-malas' : 'section section-buenas';

    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'section-label';
    sectionLabel.textContent = label;
    section.appendChild(sectionLabel);

    const row = document.createElement('div');
    row.className = 'row';

    for (let cell = 0; cell < 3; cell++) {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';

      for (let seg = 1; seg <= 5; seg++) {
        const segDiv = document.createElement('div');
        segDiv.className = 'seg p' + seg;
        cellDiv.appendChild(segDiv);
        segments.push(segDiv);
      }

      row.appendChild(cellDiv);
    }

    section.appendChild(row);
    el.appendChild(section);
  });

  // Build team controls (buttons)
  const teamControls = document.createElement('div');
  teamControls.className = 'team-controls';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn-action btn-minus';
  minusBtn.textContent = '-';
  minusBtn.addEventListener('click', () => addPoints(index, -1));

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn-action btn-plus';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => addPoints(index, 1));

  teamControls.appendChild(plusBtn);
  teamControls.appendChild(minusBtn);
  el.appendChild(teamControls);

  // Store refs for efficient updates
  el._refs = { nameInput, totalDisplay, segments };

  return el;
}

function buildControlGroup(index) {
  const group = document.createElement('div');
  group.className = 'btn-group';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'btn-action btn-minus';
  minusBtn.textContent = '-';
  minusBtn.addEventListener('click', () => addPoints(index, -1));

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn-action btn-plus';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => addPoints(index, 1));

  group.appendChild(minusBtn);
  group.appendChild(plusBtn);

  return group;
}

// --- Update Functions ---
function updateSegments(segmentEls, totalScore) {
  for (let section = 0; section < 2; section++) {
    const offset = section * 15;
    const pointsInSection = Math.max(0, Math.min(15, totalScore - offset));

    for (let cell = 0; cell < 3; cell++) {
      const cellPoints = Math.max(0, Math.min(5, pointsInSection - cell * 5));

      for (let seg = 0; seg < 5; seg++) {
        const el = segmentEls[section * 15 + cell * 5 + seg];
        el.classList.toggle('on', (seg + 1) <= cellPoints);
      }
    }
  }
}

function updateScore(index) {
  const refs = teamElements[index]._refs;
  const score = state.teams[index].score;

  refs.totalDisplay.textContent = score;

  // Trigger bump animation
  refs.totalDisplay.classList.remove('bump');
  void refs.totalDisplay.offsetWidth; // force reflow
  refs.totalDisplay.classList.add('bump');

  updateSegments(refs.segments, score);
}

// --- Full Render (only on team count change) ---
function render() {
  board.innerHTML = '';
  controls.innerHTML = '';
  teamElements = [];

  const isGallo = state.teams.length === 3;
  board.className = isGallo ? 'board gallo' : 'board';
  controls.className = isGallo ? 'controls-bar gallo' : 'controls-bar';
  toggleGalloBtn.textContent = isGallo ? '- Quitar Gallo' : '+ Agregar Gallo';

  state.teams.forEach((team, index) => {
    const teamEl = buildTeamElement(team, index);
    board.appendChild(teamEl);
    teamElements.push(teamEl);

    controls.appendChild(buildControlGroup(index));

    // Set initial segment state
    updateSegments(teamEl._refs.segments, team.score);
  });
}

// --- Actions ---
function addPoints(index, delta) {
  const team = state.teams[index];
  team.score = Math.max(0, Math.min(state.TARGET, team.score + delta));
  updateScore(index);
  saveState();
}

function resetAll() {
  if (confirm('¿Reiniciar puntos?')) {
    state.teams.forEach(t => t.score = 0);
    // Remove Gallo if present
    if (state.teams.length === 3) {
      state.teams.pop();
    }
    render();
    saveState();
  }
}

// --- Event Listeners ---
toggleGalloBtn.addEventListener('click', () => {
  if (state.teams.length === 2) {
    state.teams.push({ name: 'Gallo', score: 0 });
  } else {
    state.teams.pop();
  }
  render();
  saveState();
});

resetBtn.addEventListener('click', resetAll);
toggleDarkModeBtn.addEventListener('click', toggleTheme);

// --- Init ---
loadTheme();
loadState();
render();
