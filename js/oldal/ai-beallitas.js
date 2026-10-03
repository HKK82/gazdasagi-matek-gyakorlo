// AI-asszisztens beállítása: kulcs mentése / kipróbálása / törlése.
import './kozos.js';
import { kulcsOlvas, kulcsMent, kulcsTorol, kulcsMegjegyezve, kulcsAlakja } from '../lib/ai-kulcs.js';
import { kulcsProba, GeminiHiba } from '../lib/gemini.js';

const $ = (id) => document.getElementById(id);
const mezo = $('kulcsMezo');
const allapot = $('kulcsAllapot');

function uzen(szoveg, fajta = 'info') {
  allapot.className = `vj-${fajta}`;
  allapot.textContent = (fajta === 'jo' ? '✔ ' : fajta === 'tipikus' ? '⚠ ' : '') + szoveg;
}

function betolt() {
  mezo.value = kulcsOlvas();
  $('kulcsMegjegyez').checked = kulcsMegjegyezve();
  if (mezo.value) uzen('Mentett kulcs betöltve. A „Kulcs kipróbálása” gombbal ellenőrizheti.');
}

function ment() {
  const a = kulcsAlakja(mezo.value);
  if (!a.ok) { uzen(a.uzenet, 'tipikus'); return false; }
  kulcsMent(mezo.value, $('kulcsMegjegyez').checked);
  uzen(`Elmentve${$('kulcsMegjegyez').checked ? ' ezen az eszközön' : ' a böngésző bezárásáig'}.`, 'jo');
  return true;
}

$('kulcsUrlap').addEventListener('submit', (e) => { e.preventDefault(); ment(); });
$('kulcsMutat').addEventListener('click', (e) => {
  const mutat = mezo.type === 'password';
  mezo.type = mutat ? 'text' : 'password';
  e.currentTarget.textContent = mutat ? 'Elrejt' : 'Megmutat';
  e.currentTarget.setAttribute('aria-pressed', String(mutat));
});
$('kulcsTorol').addEventListener('click', () => { kulcsTorol(); mezo.value = ''; $('kulcsMegjegyez').checked = false; uzen('A kulcs törölve erről a böngészőről.', 'jo'); });
$('kulcsProba').addEventListener('click', async (e) => {
  if (!ment()) return;
  const gomb = e.currentTarget;
  gomb.disabled = true;
  uzen('Kipróbálom…');
  try {
    const r = await kulcsProba(kulcsOlvas());
    uzen(`Működik! A kulcs használható (modell: ${r.modell}). Menjen a Gyakorlás fülre, és nyissa meg a feladat alatti AI-panelt.`, 'jo');
  } catch (h) {
    uzen(h instanceof GeminiHiba ? h.message : 'Váratlan hiba a kipróbálásnál.', 'tipikus');
  } finally { gomb.disabled = false; }
});

betolt();
