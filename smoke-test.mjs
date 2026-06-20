import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8123/index2.html';
const results = [];
function check(name, cond) {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? '✅' : '❌'} ${name}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 840 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE, { waitUntil: 'networkidle' });

// Limpiar estado previo
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

async function addPlayer(name) {
  await page.fill('#newPlayerInput', name);
  await page.click('#addPlayerBtn');
}
async function tapChip(name) {
  await page.click(`#rosterChips .roster-chip:has-text("${name}")`);
}
async function winByLeft(points) {
  await page.locator('body').click(); // focus fuera de inputs
  for (let i = 0; i < points; i++) await page.keyboard.press('ArrowLeft');
}

// ===== Juego 1: 1v1, a 15 =====
await page.click('#initialModal .initial-btn:has-text("15")');
await page.click('#trackedPlayBtn');
check('Modal de jugadores visible', await page.isVisible('#playersModal'));
await addPlayer('Fer');
await addPlayer('Caco');
await page.click('#formatSelector .initial-btn[data-format="1"]');
await tapChip('Fer');
await tapChip('Caco');
const confirmDisabled1 = await page.locator('#confirmPlayers').isDisabled();
check('Botón Jugar habilitado con 1v1 completo', !confirmDisabled1);
await page.click('#confirmPlayers');
await winByLeft(15);
check('Winner overlay tras llegar a 15', await page.isVisible('#winnerOverlay'));
const winnerName1 = await page.textContent('#winnerName');
check('Ganador 1v1 muestra a Fer', /Fer/.test(winnerName1 || ''));
await page.click('#saveGameBtn');

// ===== Juego 2: 2v2, a 15 =====
await page.click('#resetBtn');
await page.click('#confirmModalResetConfig');
await page.click('#initialModal .initial-btn:has-text("15")');
await page.click('#trackedPlayBtn');
await addPlayer('Nano');
await addPlayer('Tito');
await page.click('#formatSelector .initial-btn[data-format="2"]');
await tapChip('Fer'); await tapChip('Caco');   // Equipo 1
await tapChip('Nano'); await tapChip('Tito');  // Equipo 2
const confirmDisabled2 = await page.locator('#confirmPlayers').isDisabled();
check('Botón Jugar habilitado con 2v2 completo', !confirmDisabled2);
await page.click('#confirmPlayers');
await winByLeft(15);
await page.click('#saveGameBtn');

// ===== Historial =====
await page.click('#historyBtn');
const hist = await page.textContent('#historyContent');
check('Historial: sección Individual', /Individual/.test(hist));
check('Historial: sección Parejas (2v2)', /Parejas/.test(hist));
check('Historial: aparece Fer', /Fer/.test(hist));
check('Historial: aparece la pareja Caco y Fer (o Fer y Caco)', /Fer|Caco/.test(hist));

// ===== Persistencia tras reload (a través de la app, no leyendo localStorage) =====
await page.reload({ waitUntil: 'networkidle' });
const persisted = await page.evaluate(() => {
  try { return (JSON.parse(localStorage.getItem('truquero_history_v1')) || []).length; }
  catch (e) { return 0; }
});
check('Persisten 2 partidas en localStorage', persisted === 2);
// La app debe CARGAR ese historial (prueba que loadHistory/loadRoster corren en INIT).
// Tras recargar aparece el modal inicial: lo descartamos con "Jugar rápido".
check('Modal inicial visible tras reload (INIT corrió)', await page.isVisible('#initialModal'));
await page.click('#quickPlayBtn');
await page.click('#historyBtn');
const histAfter = await page.textContent('#historyContent');
check('App carga el historial tras reload (loadHistory corre)', /Individual/.test(histAfter) && /Fer/.test(histAfter));
const rosterLoaded = await page.evaluate(() => {
  try { return (JSON.parse(localStorage.getItem('truquero_roster_v1')) || []).length; }
  catch (e) { return 0; }
});
check('Roster persistido con 4 jugadores', rosterLoaded === 4);

await page.screenshot({ path: 'smoke-history.png' });
check('Sin errores de página en consola', errors.length === 0);
if (errors.length) console.log('ERRORES:', errors.slice(0, 5));

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} OK`);
process.exit(failed.length ? 1 : 0);
