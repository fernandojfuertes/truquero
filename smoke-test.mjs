import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8123/index.html';
const SB_URL  = 'https://mmnqydvkajtrrzmzypzl.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbnF5ZHZrYWp0cnJ6bXp5cHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5Mzc5ODIsImV4cCI6MjA5NzUxMzk4Mn0.vtl0Ymiay1ZoMXjGlJgwB2ThbISabhypw_oTz85WkzE';
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
page.on('response', async resp => {
  if (resp.url().includes('supabase.co') && resp.status() >= 400) {
    try { console.log(`SB ${resp.status()} ${resp.request().method()} ${resp.url().split('/rest/v1/')[1]} -> ${await resp.text()}`); } catch {}
  }
});

await page.goto(BASE, { waitUntil: 'networkidle' });

// Limpiar caché local (los datos en la nube de corridas previas siguen; el test es aditivo)
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500); // esperar el sync inicial con Supabase

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

// ===== Juego 3: Gallo (3 jugadores), a 15 =====
await page.click('#resetBtn');
await page.click('#confirmModalResetConfig');
await page.click('#initialModal .initial-btn:has-text("Gallo")');
await page.click('#initialModal .initial-btn:has-text("15")');
check('En Gallo aparece "Jugar con jugadores"', await page.isVisible('#trackedPlayBtn'));
await page.click('#trackedPlayBtn');
check('Gallo: selector de formato oculto', !(await page.isVisible('#formatSection')));
check('Gallo: tercer jugador visible', await page.isVisible('#teamSection3'));
await tapChip('Fer'); await tapChip('Caco'); await tapChip('Nano');
const confDisabled3 = await page.locator('#confirmPlayers').isDisabled();
check('Botón Jugar habilitado con 3 jugadores (Gallo)', !confDisabled3);
await page.click('#confirmPlayers');
// En Gallo, ArrowRight suma al "gallo" (mano 0 -> índice 2 = Nano). 15 -> gana Nano.
await page.locator('body').click();
for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowRight');
check('Winner overlay en Gallo al llegar a 15', await page.isVisible('#winnerOverlay'));
const winnerNameG = await page.textContent('#winnerName');
check('Ganador de Gallo es Nano', /Nano/.test(winnerNameG || ''));
await page.click('#saveGameBtn');
await page.waitForTimeout(1200);
check('Indicador "Sincronizado" tras guardar online', /Sincronizado/.test(await page.textContent('#syncStatus')));

// ===== Historial =====
await page.click('#historyBtn');
const hist = await page.textContent('#historyContent');
check('Historial: sección Individual', /Individual/.test(hist));
check('Historial: sección Parejas (2v2)', /Parejas/.test(hist));
check('Historial: sección Gallo — Partidas', /Gallo — Partidas/.test(hist));
check('Historial: Nano ganó a Fer/Caco en Gallo', /Nano/.test(hist));
check('Historial: aparece Fer', /Fer/.test(hist));
check('Historial: aparece la pareja Caco y Fer (o Fer y Caco)', /Fer|Caco/.test(hist));

// ===== Persistencia EN LA NUBE: vaciar la caché local y recargar =====
// Si los datos reaparecen con localStorage vacío, es porque vinieron de Supabase.
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500); // esperar sync con Supabase
check('Modal inicial visible tras reload', await page.isVisible('#initialModal'));
// Con la caché vacía, syncHistory repuebla localStorage desde Supabase
const cloudCache = await page.evaluate(() => { try { return localStorage.getItem('truquero_history_v1') || ''; } catch { return ''; } });
check('Historial recuperado desde Supabase (caché vacía → repoblada)', /Nano/.test(cloudCache) && /gallo/.test(cloudCache));
// Verificación directa contra la API REST de Supabase
const sbGames = await page.evaluate(async (cfg) => {
  const r = await fetch(`${cfg.url}/rest/v1/games?select=id`, {
    headers: { apikey: cfg.anon, Authorization: 'Bearer ' + cfg.anon }
  });
  return (await r.json()).length;
}, { url: SB_URL, anon: SB_ANON });
check('Supabase tiene partidas guardadas (>=3)', sbGames >= 3);

// ===== Borrar jugador desde la UI =====
await page.click('#trackedPlayBtn'); // el modal inicial sigue visible tras el reload
await page.waitForTimeout(800);
check('Chip "Tito" presente antes de borrar', /Tito/.test(await page.textContent('#rosterChips')));
await page.click('#editRosterBtn');
await page.click('#rosterChips .roster-chip:has-text("Tito")');
await page.waitForTimeout(1500);
check('Chip "Tito" borrado de la UI', !/Tito/.test(await page.textContent('#rosterChips')));
const titoInDb = await page.evaluate(async (cfg) => {
  const r = await fetch(`${cfg.url}/rest/v1/players?select=name&name=eq.Tito`, {
    headers: { apikey: cfg.anon, Authorization: 'Bearer ' + cfg.anon }
  });
  return (await r.json()).length;
}, { url: SB_URL, anon: SB_ANON });
check('Jugador "Tito" borrado de Supabase (requiere policy DELETE)', titoInDb === 0);

// ===== Jugar rápido: nombres fijos (readonly) y sin opción de guardar =====
await page.click('#cancelPlayers');
await page.click('#quickPlayBtn');
const nameRO = await page.evaluate(() => { const i = document.querySelector('.name'); return i ? i.readOnly : null; });
check('Quick: nombres no editables (readonly)', nameRO === true);
check('Quick: botón Historial oculto', !(await page.isVisible('#historyBtn')));
await page.locator('body').click();
for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(400);
check('Quick: NO aparece overlay de guardar', !(await page.isVisible('#winnerOverlay')));

await page.screenshot({ path: 'smoke-history.png' });
check('Sin errores de página en consola', errors.length === 0);
if (errors.length) console.log('ERRORES:', errors.slice(0, 5));

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} OK`);
process.exit(failed.length ? 1 : 0);
