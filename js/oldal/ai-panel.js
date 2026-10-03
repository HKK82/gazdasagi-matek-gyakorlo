// AI-asszisztens panel a Gyakorlás fülön: csak akkor küld bármit a Google felé, ha a hallgató saját
// API-kulcsot adott meg, és ő maga kérdez (vagy a gyorsgombot nyomja meg). Nincs automatikus hívás.
import { el } from './kozos.js';
import { GeminiTanar, GeminiHiba } from '../lib/gemini.js';
import { kulcsOlvas } from '../lib/ai-kulcs.js';
import { blokkok } from '../lib/markdown-lite.js';

export const tanar = new GeminiTanar({ kulcs: kulcsOlvas, varakozasMs: 4000 });

/** A biztonságos megjelenítés: csak textContent, a **vastag** és a `kód` jelölést alakítjuk elemmé. */
export function valaszElem(szoveg) {
  const reszek = (db) => db.map((r) => (r.t === 'vastag' ? el('strong', { text: r.s }) : r.t === 'kod' ? el('code', { text: r.s }) : document.createTextNode(r.s)));
  return el('div', { class: 'ai-valasz' }, blokkok(szoveg).map((b) => (b.t === 'lista'
    ? el('ul', {}, b.elemek.map((e) => el('li', {}, reszek(e))))
    : el('p', {}, b.sorok.flatMap((sor, i) => (i ? [document.createElement('br'), ...reszek(sor)] : reszek(sor)))))));
}

const GYORS = [
  ['Magyarázd el másképp', 'Magyarázza el a feladatot a saját szavaival, lépésről lépésre rávezetve. A végeredményt még ne mondja meg.'],
  ['Miért hibás a válaszom?', 'Nézze meg a beírt válaszomat, és mutassa meg számokkal, miért nem stimmel. Mi lehet a gondolkodási hiba?'],
  ['Adj egy tippet', 'Adjon egy rövid rávezető kérdést vagy tippet, ami segít elindulni. A megoldást ne mondja meg.'],
];

/**
 * @param {() => object} kontextus a feladat aktuális állapota (lásd gemini.js: rendszerUtasitas)
 */
export function aiPanel(kontextus) {
  tanar.torolElozmeny();
  const uzenetek = el('div', { class: 'ai-uzenetek', role: 'log', 'aria-live': 'polite', 'aria-label': 'AI-beszélgetés' });
  const bemenet = el('textarea', { id: 'aiKerdes', rows: '2', placeholder: 'Írja le, mit nem ért…', 'aria-label': 'Kérdés az AI-asszisztensnek' });
  const kuld = el('button', { type: 'button', class: 'gomb elsodleges' }, 'Küldés');
  const gyors = el('div', { class: 'gombsor' }, GYORS.map(([cim, szoveg]) =>
    el('button', { type: 'button', class: 'gomb halk', onclick: () => kerdez(szoveg, cim) }, cim)));
  const torles = el('button', { type: 'button', class: 'gomb halk', onclick: () => { tanar.torolElozmeny(); uzenetek.replaceChildren(); } }, 'Beszélgetés törlése');
  const chat = el('div', { class: 'ai-chat' }, gyors, uzenetek,
    el('div', { class: 'ai-bevitel' }, bemenet, kuld), torles,
    el('p', { class: 'figyelmeztetes', text: 'Az AI tévedhet – a végeredményt az oldal ellenőrzője dönti el. Kérdéskor a feladat szövege, a beírt válasza és a kérdése a Google Gemini felé megy; személyes adatot ne írjon.' }));
  const nincsKulcs = el('div', { class: 'ai-nincs-kulcs' },
    el('p', { html: 'Az AI-asszisztenshez <strong>saját, ingyenes Gemini API-kulcs</strong> kell. Néhány perc alatt kérhető, az útmutató végigvezeti.' }),
    el('a', { class: 'gomb elsodleges', href: 'ai.html' }, 'Útmutató és kulcs megadása →'));
  const panel = el('details', { class: 'ai-panel' },
    el('summary', { text: '🤖 AI-asszisztens – kérdezzen a feladatról' }), nincsKulcs, chat);

  const frissit = () => {
    const van = !!kulcsOlvas();
    nincsKulcs.hidden = van;
    chat.hidden = !van;
  };
  panel.addEventListener('toggle', () => { if (panel.open) frissit(); });
  frissit();

  async function kerdez(kerdes, felirat) {
    const szoveg = String(kerdes || '').trim();
    if (!szoveg) return;
    uzenetek.append(el('div', { class: 'ai-sor ai-en' }, el('strong', { text: 'Ön: ' }), el('span', { text: felirat || szoveg })));
    const vart = el('div', { class: 'ai-sor ai-gep' }, el('em', { text: 'Gondolkodom…' }));
    uzenetek.append(vart);
    for (const g of [kuld, ...gyors.querySelectorAll('button')]) g.disabled = true;
    try {
      const r = await tanar.kerdez(kontextus(), szoveg);
      vart.replaceChildren(el('strong', { text: 'AI: ' }), valaszElem(r.szoveg), el('small', { class: 'ai-modell', text: `(${r.modell})` }));
      if (!felirat) bemenet.value = '';
    } catch (h) {
      const uzenet = h instanceof GeminiHiba ? h.message : 'Váratlan hiba az AI-kérésnél.';
      vart.replaceChildren(el('span', { class: 'vj-tipikus', text: `⚠ ${uzenet}` }));
      if (h instanceof GeminiHiba && h.fajta === 'kulcs-hianyzik') frissit();
    } finally {
      for (const g of [kuld, ...gyors.querySelectorAll('button')]) g.disabled = false;
      vart.scrollIntoView?.({ block: 'nearest' });
    }
  }
  kuld.addEventListener('click', () => kerdez(bemenet.value));
  bemenet.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); kerdez(bemenet.value); } });
  return panel;
}
