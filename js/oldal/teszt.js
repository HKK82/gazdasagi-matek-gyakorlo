// Próbateszt: szabad lépkedés, beadás, eredmény + levezetés. Két változat ugyanazzal a kóddal:
// a gazdasági próbateszt (10 feladat, 20 perc) és a próba felvételi (12 feladat, 45 perc, <body data-sor="felveteli">).
import { el } from './kozos.js';
import { mezokRajzol, abraElem, miertElem, geogebraElem } from './feladat-nezet.js';
import { TEMAK, FELVETELI_TEMAK } from '../temak/index.js';
import { ujRng } from '../lib/rng.js';
import { tesztFeladatok, TESZT_DB, TESZT_PERC, FELV_TESZT_DB, FELV_TESZT_PERC } from '../lib/teszt-osszeallito.js';
import { ellenoriz, helyesE, helyesValaszSzoveg } from '../lib/ellenorzo.js';
import { tesztMentes, legjobbTeszt } from '../lib/haladas.js';

const hely = document.getElementById('tesztTartalom');
const bejelento = document.getElementById('idoBejelentes');
const dialog = document.getElementById('beadasDialog');

const FELV = document.body.dataset.sor === 'felveteli';
// A felvételi változat tegező (a diákoknak szól), a gazdasági változat semleges felszólító.
const KONF = FELV
  ? { temak: FELVETELI_TEMAK, db: FELV_TESZT_DB, perc: FELV_TESZT_PERC, kulcs: 'felvTeszt', nev: 'felvételi', vissza: 'index.html' }
  : { temak: TEMAK, db: TESZT_DB, perc: TESZT_PERC, kulcs: 'teszt', nev: 'teszt', vissza: 'index.html' };
const SZAM_UTASITAS = FELV
  ? 'Eredményként csak egyetlen számot adj meg, pl. 8,2. Törtet is beírhatsz (pl. 7/6).'
  : 'Eredményként csak egyetlen számot adjon meg, pl. 8,2 (ha 8,2 %-ot szeretne beírni).';

let allapot = null; // { feladatok, valaszok, aktiv, vege, idozito }

function bevezeto() {
  const l = legjobbTeszt(KONF.kulcs);
  const pontok = FELV
    ? [
      `<strong>${KONF.db} feladat</strong> a hat témából (mindből kettő), véletlen számokkal. Zsebszámológép nélkül, papíron számolj.`,
      `Időkorlát: <strong>${KONF.perc} perc az egész feladatsorra</strong> – ennyi a valódi írásbeli felvételi ideje is. Az idő lejártakor a próba automatikusan beadódik.`,
      'A feladatok között szabadon lépkedhetsz a számozott gombokkal; a válaszaid megmaradnak. Ami nehéznek tűnik, hagyd későbbre.',
      SZAM_UTASITAS,
      'Beadás után látod a pontszámot, és feladatonként a helyes választ a levezetéssel.',
      'Akárhányszor újrakezdheted, mindig új számokkal. A legjobb eredményed ebben a böngészőben mentődik.',
    ]
    : [
      `<strong>${KONF.db} feladat</strong> a hét témából, véletlen számokkal.`,
      `Időkorlát: <strong>${KONF.perc} perc az egész tesztre</strong> (nem feladatonként). Az idő lejártakor a teszt automatikusan beadódik.`,
      'A feladatok között szabadon lépkedhet a számozott gombokkal; a válaszai megmaradnak.',
      SZAM_UTASITAS,
      'Beadás után látja a pontszámot, és feladatonként a helyes választ a levezetéssel.',
      'Akárhányszor újraindíthatja, mindig új számokkal. A legjobb eredménye ebben a böngészőben mentődik.',
    ];
  hely.replaceChildren(el('section', { class: 'doboz' },
    el('h2', { text: 'Tudnivalók' }),
    el('ul', {}, pontok.map((p) => el('li', { html: p }))),
    l ? el('p', { class: 'figyelmeztetes', text: `${FELV ? 'Eddigi legjobb eredményed' : 'Eddigi legjobb eredménye'}: ${l.pont}/${l.ossz} pont (${l.szazalek} %).` }) : null,
    el('div', { class: 'gombsor' }, el('button', { type: 'button', class: 'gomb elsodleges', onclick: indit }, FELV ? 'Próba indítása' : 'Teszt indítása'))));
}

function indit() {
  const feladatok = tesztFeladatok(ujRng(), KONF.temak, KONF.db);
  allapot = {
    feladatok,
    valaszok: feladatok.map(() => ''),
    aktiv: 0,
    vege: Date.now() + KONF.perc * 60 * 1000,
    idozito: null,
    bejelentve: new Set(),
  };
  window.addEventListener('beforeunload', elhagyasFigyelo);
  tesztRajzol();
  allapot.idozito = setInterval(oraFrissit, 1000);
  oraFrissit();
}

function elhagyasFigyelo(e) {
  e.preventDefault();
  e.returnValue = '';
}

let oraElem, savElem, feladatHely;

function tesztRajzol() {
  oraElem = el('p', { class: 'ido', role: 'timer', 'aria-live': 'off' });
  savElem = el('ol', { class: 'feladat-sav', 'aria-label': 'Feladatok' });
  feladatHely = el('div');
  const beadGomb = el('button', { type: 'button', class: 'gomb elsodleges', onclick: beadasKerdes }, FELV ? 'Beadás' : 'Teszt beadása');
  hely.replaceChildren(
    el('div', { class: 'teszt-fej' }, savElem, el('div', { class: 'gombsor', style: 'margin:0' }, oraElem, beadGomb)),
    feladatHely);
  savRajzol();
  feladatMutat(0);
}

function savRajzol() {
  savElem.replaceChildren(...allapot.feladatok.map((_, i) => {
    const kitoltve = allapot.valaszok[i].trim() !== '';
    return el('li', {}, el('button', {
      type: 'button', class: kitoltve ? 'kitoltve' : '',
      'aria-current': i === allapot.aktiv ? 'true' : null,
      'aria-label': `${i + 1}. feladat${kitoltve ? ', kitöltve' : ', üres'}`,
      onclick: () => feladatMutat(i),
    }, String(i + 1)));
  }));
}

function feladatMutat(i, fokusz = true) {
  allapot.aktiv = i;
  const { feladat, temaCim } = allapot.feladatok[i];
  const nezet = mezokRajzol(feladat, { visszajelzes: false });
  const mezo = nezet.mezok[0];
  const input = nezet.elem.querySelector('input');
  input.value = allapot.valaszok[i];
  mezo.onValtozas(() => {
    allapot.valaszok[i] = mezo.ertek();
    savRajzol();
  });
  const elozo = el('button', { type: 'button', class: 'gomb halk', disabled: i === 0, onclick: () => feladatMutat(i - 1) }, '← Előző');
  const kov = el('button', { type: 'button', class: 'gomb', disabled: i === allapot.feladatok.length - 1, onclick: () => feladatMutat(i + 1) }, 'Következő →');
  const urlap = el('form', { novalidate: true }, nezet.elem, el('p', { class: 'figyelmeztetes', text: SZAM_UTASITAS }), el('div', { class: 'gombsor' }, elozo, kov));
  urlap.addEventListener('submit', (e) => { e.preventDefault(); if (i < allapot.feladatok.length - 1) feladatMutat(i + 1); });
  feladatHely.replaceChildren(el('article', { class: 'feladat', 'aria-labelledby': 'tfCim' },
    el('div', { class: 'feladat-fej' },
      el('h2', { class: 'feladat-tipus', id: 'tfCim', tabindex: '-1', text: `${i + 1}. feladat (${KONF.db} közül)` }),
      el('span', { class: 'figyelmeztetes', text: temaCim })),
    el('p', { class: 'feladat-szoveg', html: feladat.szoveg }),
    abraElem(feladat.abra),
    geogebraElem(feladat),
    urlap));
  savRajzol();
  if (fokusz) input.focus();
}

function hatralevo() {
  return Math.max(0, allapot.vege - Date.now());
}

function oraFrissit() {
  const ms = hatralevo();
  const mp = Math.ceil(ms / 1000);
  const perc = Math.floor(mp / 60), m = mp % 60;
  oraElem.textContent = `Hátralévő idő: ${perc}:${String(m).padStart(2, '0')}`;
  oraElem.classList.toggle('keves', mp <= 120);
  for (const hatar of [5, 1]) {
    if (perc < hatar && !allapot.bejelentve.has(hatar) && mp > 0) {
      allapot.bejelentve.add(hatar);
      bejelento.textContent = `Figyelem: kevesebb mint ${hatar} perc van hátra.`;
    }
  }
  if (ms <= 0) beadas(true);
}

function beadasKerdes() {
  const ures = allapot.valaszok.filter((v) => v.trim() === '').length;
  document.getElementById('beadasSzoveg').textContent = FELV
    ? (ures ? `${ures} feladatra még nem válaszoltál. A beadás után már nem módosíthatsz.` : 'Minden feladatra válaszoltál. A beadás után már nem módosíthatsz.')
    : (ures ? `${ures} feladatra még nem válaszolt. A beadás után már nem módosíthat.` : 'Minden feladatra válaszolt. A beadás után már nem módosíthat.');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else if (window.confirm(FELV ? 'Beadod a feladatsort?' : 'Beadja a tesztet?')) beadas(false);
}
document.getElementById('beadasMegse').addEventListener('click', () => dialog.close());
document.getElementById('beadasIgen').addEventListener('click', () => { dialog.close(); beadas(false); });

function beadas(idoLejart) {
  if (!allapot || allapot.lezarva) return;
  allapot.lezarva = true;
  clearInterval(allapot.idozito);
  window.removeEventListener('beforeunload', elhagyasFigyelo);
  if (dialog.open) dialog.close();

  const eredmenyek = allapot.feladatok.map((t, i) => ellenoriz(t.feladat.mezok[0], allapot.valaszok[i]));
  const pont = eredmenyek.filter(helyesE).length;
  const ossz = allapot.feladatok.length;
  const szazalek = Math.round((pont / ossz) * 100);
  const ujLegjobb = tesztMentes(pont, ossz, KONF.kulcs);
  const legjobb = legjobbTeszt(KONF.kulcs);

  hely.replaceChildren(
    el('section', { class: 'doboz', 'aria-labelledby': 'eredmenyCim' },
      idoLejart ? el('p', { class: 'figyelmeztetes', text: `Lejárt a ${KONF.perc} perc, a ${FELV ? 'feladatsor' : 'teszt'} automatikusan beadódott.` }) : null,
      el('h2', { id: 'eredmenyCim', text: 'Eredmény' }),
      el('p', { class: 'eredmeny-szam', text: `${pont} / ${ossz} pont (${szazalek} %)` }),
      el('p', { text: ujLegjobb && pont > 0 ? (FELV ? 'Ez az eddigi legjobb eredményed ebben a böngészőben!' : 'Ez az eddigi legjobb eredménye ebben a böngészőben!') : `Eddigi legjobb: ${legjobb.pont}/${legjobb.ossz} pont (${legjobb.szazalek} %).` }),
      el('div', { class: 'gombsor' },
        el('button', { type: 'button', class: 'gomb elsodleges', onclick: () => { allapot = null; indit(); } }, FELV ? 'Új próba (új számokkal)' : 'Új teszt (új számokkal)'),
        el('a', { class: 'gomb halk', href: KONF.vissza }, FELV ? 'Vissza a kezdőlapra' : 'Vissza a kezdőoldalra'))),
    el('h2', { text: 'Feladatonként' }),
    el('ol', { class: 'eredmeny-lista' }, allapot.feladatok.map((t, i) => {
      const e = eredmenyek[i];
      const jo = helyesE(e);
      const m = t.feladat.mezok[0];
      return el('li', { class: jo ? 'jo' : 'rossz' },
        el('h3', { text: `${i + 1}. feladat – ${jo ? '✔ helyes' : '✖ hibás'}` }),
        el('p', { html: t.feladat.szoveg }),
        el('p', { class: 'figyelmeztetes', text: m.cimke }),
        el('dl', {},
          el('dt', { text: FELV ? 'A te válaszod:' : 'Az Ön válasza:' }), el('dd', { text: allapot.valaszok[i].trim() || '(üres)' }),
          el('dt', { text: 'Helyes válasz:' }), el('dd', { text: helyesValaszSzoveg(m) })),
        e.allapot === 'tipikus' ? el('p', { class: 'vj-tipikus', text: `⚠ Tipikus hiba: ${e.uzenet}` }) : null,
        !jo && e.ellenproba ? el('p', { class: 'ellenproba', text: e.ellenproba }) : null,
        e.allapot === 'ervenytelen' ? el('p', { class: 'vj-rossz', text: `ℹ ${e.uzenet}` }) : null,
        jo && e.allapot === 'jo-megjegyzes' ? el('p', { class: 'vj-jo', text: `✔ ${e.uzenet}` }) : null,
        el('details', {},
          el('summary', { text: 'Megoldás lépésenként' }),
          el('ol', { class: 'lepesek' }, t.feladat.megoldas.map((l) => el('li', { html: l }))),
          abraElem(t.feladat.abraMegoldas),
          miertElem(t.feladat, true),
          el('p', { class: 'jegyezze', html: `${FELV ? 'Ezt jegyezd meg' : 'Ezt jegyezze meg'}: ${t.feladat.jegyezze}` })));
    })));
  document.getElementById('eredmenyCim').setAttribute('tabindex', '-1');
  document.getElementById('eredmenyCim').focus();
}

bevezeto();
