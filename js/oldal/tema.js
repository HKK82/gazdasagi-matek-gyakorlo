// Témaoldal: Elmélet röviden – Kidolgozott példák – Gyakorlás (fülekkel).
import { el, szovegbol } from './kozos.js';
import { aiPanel } from './ai-panel.js';
import { mezokRajzol, abraElem, miertElem, geogebraElem } from './feladat-nezet.js';
import { temaKeres, TEMAK } from '../temak/index.js';
import { ellenoriz, helyesE, helyesValaszSzoveg } from '../lib/ellenorzo.js';
import { ujRng, valaszt } from '../lib/rng.js';
import { rogzit, tipusAllapot, megy, MEGY_HATAR } from '../lib/haladas.js';

const rng = ujRng();
const parameterek = new URLSearchParams(location.search);
const tema = temaKeres(parameterek.get('t')) || TEMAK[0];
const tartalom = document.getElementById('temaTartalom');

// A felvételi-gyakorló témái tegezve szólnak a diákhoz (a js/felveteli/ mappa moduljai, tema.sor === 'felveteli').
const FV = tema.sor === 'felveteli';
const SZ = FV ? {
  peldaBevezeto: 'Próbáld meg először önállóan, majd nyisd ki a megoldást lépésenként a „Következő lépés” gombbal.',
  jegyezd: 'Ezt jegyezd meg',
  nemSzamit: 'Ez a feladat nem számít bele a „3 egymás után jó” sorozatba. Próbálj ki egy új feladatot!',
  tipikus: 'Olvasd el a mező alatti magyarázatot, javítsd, és ellenőrizd újra!',
  meg: 'Próbáld újra, vagy kérj tippet a „Tipp” gombbal!',
  kitolt: 'ℹ Töltsd ki az összes mezőt egy-egy számmal, és ellenőrizd újra.',
  reszben: 'ℹ Néhány válasz jó – a többit nézd meg még egyszer.',
} : {
  peldaBevezeto: 'Próbálja meg először önállóan, majd nyissa ki a megoldást lépésenként a „Következő lépés” gombbal.',
  jegyezd: 'Ezt jegyezze meg',
  nemSzamit: 'Ez a feladat nem számít bele a „3 egymás után jó” sorozatba. Próbáljon ki egy új feladatot!',
  tipikus: 'Olvassa el a mező alatti magyarázatot, javítsa, és ellenőrizze újra!',
  meg: 'Próbálja újra, vagy kérjen tippet a „Tipp” gombbal!',
  kitolt: 'ℹ Töltse ki az összes mezőt egy-egy számmal, és ellenőrizze újra.',
  reszben: 'ℹ Néhány válasz jó – a többit nézze meg még egyszer.',
};

document.title = `${tema.cim} – ${FV ? 'Felvételi gyakorló' : 'Gazdasági matematika gyakorló'}`;
document.getElementById('temaCim').textContent = tema.cim;
for (const a of document.querySelectorAll('.fejlec nav a')) {
  if (a.getAttribute('href') === `tema.html?t=${tema.id}` || (FV && a.getAttribute('href') === 'felveteli.html')) a.setAttribute('aria-current', 'page');
}
if (FV) {
  const vissza = document.getElementById('vissza');
  vissza.href = 'felveteli.html';
  vissza.textContent = '← Vissza a felvételi témákhoz';
}

// ---------- Elmélet ----------
function kulcskepletDoboz(kicsi = false) {
  return el('div', { class: 'kulcskeplet' + (kicsi ? ' kicsi' : '') },
    el('div', { html: tema.kulcskeplet }),
    ...(kicsi ? [] : tema.kulcsMagyarazat.map((m) => el('p', { html: m }))));
}

function elmeletPanel() {
  return [
    el('h2', { text: 'Elmélet röviden' }),
    kulcskepletDoboz(),
    el('ul', { class: 'elmelet-lista' }, tema.elmelet.map((p) => el('li', { html: p }))),
    tema.elmeletAbra ? el('figure', { class: 'elmelet-abra' },
      abraElem(tema.elmeletAbra),
      tema.elmeletAbraFelirat ? el('figcaption', { html: tema.elmeletAbraFelirat }) : null) : null,
    el('div', { class: 'gombsor' },
      el('button', { type: 'button', class: 'gomb', onclick: () => fulValt('peldak') }, 'Kidolgozott példák →'),
      el('button', { type: 'button', class: 'gomb elsodleges', onclick: () => fulValt('gyakorlas') }, 'Gyakorlás →')),
  ];
}

// ---------- Kidolgozott példák ----------
function peldaKartya(p, i) {
  const lista = el('ol', { class: 'lepesek' });
  let lathato = 0;
  const kov = el('button', { type: 'button', class: 'gomb elsodleges' }, 'Következő lépés');
  const mind = el('button', { type: 'button', class: 'gomb halk' }, 'Összes lépés');
  const elolrol = el('button', { type: 'button', class: 'gomb halk', hidden: true }, 'Elölről');
  const allapot = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  const frissit = () => {
    lista.replaceChildren(...p.lepesek.slice(0, lathato).map((l) => el('li', { html: l })));
    const vege = lathato >= p.lepesek.length;
    kov.hidden = vege; mind.hidden = vege; elolrol.hidden = !vege;
    allapot.textContent = lathato ? `${lathato}. lépés: ${lista.lastElementChild.textContent}` : '';
  };
  kov.addEventListener('click', () => { lathato++; frissit(); if (lathato >= p.lepesek.length) elolrol.focus(); });
  mind.addEventListener('click', () => { lathato = p.lepesek.length; frissit(); elolrol.focus(); });
  elolrol.addEventListener('click', () => { lathato = 0; frissit(); kov.focus(); });
  frissit();
  return el('article', { class: 'pelda' },
    el('h3', { text: `${i + 1}. ${p.cim}` }),
    el('p', { class: 'pelda-feladat', html: p.feladat }),
    abraElem(p.abra),
    lista, allapot,
    el('div', { class: 'gombsor' }, kov, mind, elolrol));
}

function peldakPanel() {
  return [
    el('h2', { text: 'Kidolgozott példák' }),
    el('p', { class: 'bevezeto', text: SZ.peldaBevezeto }),
    kulcskepletDoboz(true),
    ...tema.peldak.map(peldaKartya),
  ];
}

// ---------- Gyakorlás ----------
const gy = { valasztott: 'vegyes', tipus: null, feladat: null, nezet: null, rogzitve: false, tippSzint: 0, megoldasLatta: false, fixSorszam: 0 };
const fixek = tema.fixek || [];
const FIX_ELOTAG = 'fix:';
let gyakorlasHely, tipusSelect, tipusLista;

function tipusFelirat(t) {
  return `${t.id} – ${t.nev}${megy(tema.id, t.id) ? ' ✓ megy' : ''}`;
}

function tipusListaFrissit() {
  if (!tipusSelect) return;
  for (const o of tipusSelect.options) {
    const t = tema.tipusok.find((x) => x.id === o.value);
    if (t) o.textContent = tipusFelirat(t);
  }
  tipusLista.replaceChildren(...tema.tipusok.map((t) => {
    const a = tipusAllapot(tema.id, t.id);
    return el('li', {},
      el('span', { text: `${t.id} – ${t.nev}` }),
      megy(tema.id, t.id)
        ? el('span', { class: 'cimke-megy', text: '✓ megy' })
        : el('span', { class: 'cimke-gyakorol', text: a.probalt ? `${a.jo}/${a.probalt} jó, sorozat: ${a.sorozat}` : 'még nem gyakorolta' }));
  }));
}

function ujFeladat(fokuszal = true) {
  const tipusok = tema.tipusok;
  let tipus;
  gy.fix = gy.valasztott.startsWith(FIX_ELOTAG);
  if (gy.fix) {
    // fix számokkal megadott feladat (a feladatlap páros feladatai, banki ajánlatok)
    const fx = fixek.find((x) => x.id === gy.valasztott.slice(FIX_ELOTAG.length)) || fixek[0];
    gy.tipus = { id: fx.id, nev: fx.nev };
    gy.feladat = fx.epit();
    gy.rogzitve = true; // a fix feladatok nem számítanak bele a „megy” sorozatba
    gy.tippSzint = 0;
    gy.megoldasLatta = false;
    feladatRajzol();
    if (fokuszal) gy.nezet.mezok[0].fokusz();
    return;
  }
  if (gy.valasztott === 'vegyes') {
    const tobbi = tipusok.filter((t) => t !== gy.tipus);
    tipus = valaszt(rng, tobbi.length ? tobbi : tipusok);
  } else {
    tipus = tipusok.find((t) => t.id === gy.valasztott);
  }
  gy.tipus = tipus;
  gy.feladat = tipus.general(rng);
  gy.rogzitve = false;
  gy.tippSzint = 0;
  gy.megoldasLatta = false;
  feladatRajzol();
  if (fokuszal) gy.nezet.mezok[0].fokusz();
}

/** Az AI-asszisztensnek átadott kontextus: a feladat és a hallgató aktuális állapota. */
function aiKontextus() {
  const f = gy.feladat;
  const valaszok = gy.nezet.mezok.map((m) => {
    const v = String(m.ertek()).trim();
    return v ? `${m.mezo.cimke} = ${v}` : '';
  }).filter(Boolean).join('; ');
  const mutatva = gy.megoldasMutatva;
  return {
    temaCim: tema.cim,
    sor: tema.sor,
    tipusNev: `${gy.tipus.id} – ${gy.tipus.nev}`,
    kulcskeplet: szovegbol(tema.kulcskeplet),
    feladat: szovegbol(`${f.szoveg} ${f.utasitas || ''}`),
    mezok: f.mezok.map((m) => m.cimke),
    valaszok,
    visszajelzes: gy.utolsoVisszajelzes,
    probalkozasok: gy.hibas,
    segitsegiSzint: Math.min(5, 1 + gy.hibas + Math.min(gy.tippSzint, 2)),
    megoldasLatta: mutatva,
    helyesValasz: f.mezok.map((m) => `${m.cimke}: ${helyesValaszSzoveg(m)}`).join('; '),
    megoldasLepesek: f.megoldas.map((l, i) => `${i + 1}. ${szovegbol(l)}`).join('\n'),
    hivatalosMagyarazat: (f.magyarazat || []).map(szovegbol).join('\n'),
  };
}

function feladatRajzol() {
  const f = gy.feladat;
  gy.hibas = 0;
  gy.utolsoVisszajelzes = '';
  gy.megoldasMutatva = false;
  const nezet = mezokRajzol(f);
  gy.nezet = nezet;
  const osszesito = el('div', { class: 'osszesito', role: 'status', 'aria-live': 'polite' });
  const tippLista = el('ol', { class: 'tippek', 'aria-live': 'polite' });
  const megoldas = el('div', { class: 'megoldas', hidden: true });
  const tippGomb = el('button', { type: 'button', class: 'gomb' }, 'Tipp');
  const megoldasGomb = el('button', { type: 'button', class: 'gomb' }, 'Megoldás mutatása');
  const ujGomb = el('button', { type: 'button', class: 'gomb halk' }, gy.fix ? 'Következő fix feladat' : 'Új feladat');
  const miert = miertElem(f);
  if (miert) miert.hidden = true;

  const urlap = el('form', { novalidate: true, 'aria-label': 'Feladat' },
    nezet.elem,
    el('div', { class: 'gombsor' },
      el('button', { type: 'submit', class: 'gomb elsodleges' }, 'Ellenőrzés'),
      tippGomb, megoldasGomb, ujGomb));

  urlap.addEventListener('submit', (e) => {
    e.preventDefault();
    ellenorzes(osszesito);
  });
  for (const m of nezet.mezok) m.onValtozas(() => m.torol());

  tippGomb.addEventListener('click', () => {
    if (gy.tippSzint >= f.tippek.length) return;
    gy.tippSzint++;
    tippLista.append(el('li', { html: `<strong>${gy.tippSzint}. tipp:</strong> ${f.tippek[gy.tippSzint - 1]}` }));
    if (gy.tippSzint >= f.tippek.length) { tippGomb.disabled = true; tippGomb.textContent = 'Nincs több tipp'; }
    else tippGomb.textContent = 'Következő tipp';
  });

  megoldasGomb.addEventListener('click', () => {
    megoldas.hidden = false;
    megoldasGomb.disabled = true;
    gy.megoldasMutatva = true;
    if (miert) { miert.hidden = false; miert.open = true; }
    if (!gy.rogzitve) {
      gy.megoldasLatta = true;
      gy.rogzitve = true;
      rogzit(tema.id, gy.tipus.id, false);
      tipusListaFrissit();
    }
    megoldas.querySelector('h3').focus();
  });

  ujGomb.addEventListener('click', () => {
    if (gy.fix) {
      const i = fixek.findIndex((x) => FIX_ELOTAG + x.id === gy.valasztott);
      gy.valasztott = FIX_ELOTAG + fixek[(i + 1) % fixek.length].id;
      if (tipusSelect) tipusSelect.value = gy.valasztott;
    }
    ujFeladat();
  });

  megoldas.append(
    el('h3', { tabindex: '-1', text: 'Megoldás lépésenként' }),
    el('ol', { class: 'lepesek' }, f.megoldas.map((l) => el('li', { html: l }))),
    abraElem(f.abraMegoldas),
    el('p', { class: 'jegyezze', html: `${SZ.jegyezd}: ${f.jegyezze}` }),
    gy.fix ? null : el('p', { class: 'figyelmeztetes', text: SZ.nemSzamit }));

  gyakorlasHely.replaceChildren(el('article', { class: 'feladat', 'aria-labelledby': 'feladatCim' },
    el('div', { class: 'feladat-fej' },
      el('h3', { class: 'feladat-tipus', id: 'feladatCim', text: `${gy.tipus.id} – ${gy.tipus.nev}` })),
    el('p', { class: 'feladat-szoveg', html: f.szoveg }),
    f.utasitas ? el('p', { class: 'utasitas', text: f.utasitas }) : null,
    abraElem(f.abra),
    geogebraElem(f),
    urlap, osszesito, tippLista, megoldas, miert, aiPanel(aiKontextus)));
  gy.miert = miert;
}

function ellenorzes(osszesito) {
  const f = gy.feladat;
  const eredmenyek = gy.nezet.mezok.map((m) => ellenoriz(m.mezo, m.ertek()));
  const hianyos = eredmenyek.some((e) => e.allapot === 'ures' || e.allapot === 'ervenytelen');
  const hibas = eredmenyek.some((e) => e.allapot === 'tipikus' || e.allapot === 'rossz');
  const mindJo = eredmenyek.every(helyesE);
  gy.nezet.mezok.forEach((m, i) => {
    if (eredmenyek[i].allapot === 'ures' && eredmenyek.length > 1) m.torol();
    else m.beallit(eredmenyek[i]);
  });

  gy.utolsoVisszajelzes = eredmenyek.map((e, i) => {
    const cimke = gy.nezet.mezok[i].mezo.cimke;
    if (helyesE(e)) return `${cimke}: helyes`;
    return `${cimke}: ${e.allapot === 'tipikus' ? 'tipikus hiba – ' + e.uzenet : e.allapot === 'rossz' ? 'hibás' : e.uzenet}${e.ellenproba ? ' ' + e.ellenproba : ''}`;
  }).join(' | ');
  if (hibas) gy.hibas++;
  osszesito.className = 'osszesito';
  if (mindJo) {
    let sorozatUzenet = '';
    if (!gy.rogzitve) {
      gy.rogzitve = true;
      const voltMegy = megy(tema.id, gy.tipus.id);
      const a = rogzit(tema.id, gy.tipus.id, true);
      if (!voltMegy && a.legjobbSorozat >= MEGY_HATAR) sorozatUzenet = `Ez a feladattípus már megy: ${MEGY_HATAR} egymás utáni jó megoldás! ✓`;
      else if (a.sorozat < MEGY_HATAR && !voltMegy) sorozatUzenet = `Egymás után ${a.sorozat} jó megoldás (${MEGY_HATAR} kell a „megy” jelzéshez).`;
      tipusListaFrissit();
    }
    osszesito.classList.add('jo');
    if (gy.miert) { gy.miert.hidden = false; }
    osszesito.replaceChildren(...[
      el('p', {}, el('span', { class: 'ikon', text: '✔ ' }), el('strong', { text: valaszt(rng, ['Helyes!', 'Szép munka, ez jó!', 'Pontosan így van!']) })),
      el('p', { class: 'jegyezze', html: `${SZ.jegyezd}: ${f.jegyezze}` }),
      sorozatUzenet ? el('p', { text: sorozatUzenet }) : null,
      gy.miert ? el('p', {}, el('button', { type: 'button', class: 'gomb halk', onclick: () => { gy.miert.hidden = false; gy.miert.open = true; gy.miert.querySelector('summary').focus(); } }, 'Miért így? – magyarázat szavakkal')) : null,
    ].filter(Boolean));
    return;
  }
  if (hibas && !gy.rogzitve) {
    gy.rogzitve = true;
    rogzit(tema.id, gy.tipus.id, false);
    tipusListaFrissit();
  }
  if (eredmenyek.some((e) => e.allapot === 'tipikus')) {
    osszesito.classList.add('tipikus');
    osszesito.replaceChildren(el('p', {}, el('span', { class: 'ikon', text: '⚠ ' }),
      el('strong', { text: 'Tipikus hiba. ' }), el('span', { text: SZ.tipikus })));
  } else if (hibas) {
    osszesito.classList.add('rossz');
    osszesito.replaceChildren(el('p', {}, el('span', { class: 'ikon', text: '✖ ' }),
      el('strong', { text: 'Még nem jó. ' }), el('span', { text: SZ.meg })));
  } else if (hianyos) {
    osszesito.classList.add('info');
    osszesito.replaceChildren(el('p', { text: SZ.kitolt }));
  } else {
    osszesito.classList.add('info');
    osszesito.replaceChildren(el('p', { text: SZ.reszben }));
  }
}

function gyakorlasPanel() {
  tipusSelect = el('select', { id: 'tipusValaszto' },
    el('option', { value: 'vegyes' }, 'Vegyes (minden típus)'),
    tema.tipusok.map((t) => el('option', { value: t.id }, tipusFelirat(t))),
    fixek.length ? el('optgroup', { label: 'Fix számokkal (feladatlap, banki ajánlatok)' },
      fixek.map((x) => el('option', { value: FIX_ELOTAG + x.id }, `${x.id} – ${x.nev}`))) : null);
  tipusSelect.value = gy.valasztott;
  tipusSelect.addEventListener('change', () => { gy.valasztott = tipusSelect.value; ujFeladat(false); });
  tipusLista = el('ul', { class: 'tipus-lista' });
  gyakorlasHely = el('div');
  const panel = [
    el('h2', { text: 'Gyakorlás' }),
    el('div', { class: 'tipus-valaszto' }, el('label', { for: 'tipusValaszto', text: 'Feladattípus:' }), tipusSelect),
    gyakorlasHely,
    el('details', { class: 'doboz' }, el('summary', { text: 'Haladás feladattípusonként' }),
      el('p', { class: 'figyelmeztetes', text: `Egy típus akkor „megy”, ha ${MEGY_HATAR} feladatot egymás után elsőre jól old meg (tipp használható, a megoldás megnézése nem).` }),
      tipusLista),
    kulcskepletDoboz(true),
  ];
  ujFeladat(false);
  tipusListaFrissit();
  return panel;
}

// ---------- Fülek ----------
const FULEK = [
  { id: 'elmelet', cim: 'Elmélet röviden', panel: elmeletPanel },
  { id: 'peldak', cim: 'Kidolgozott példák', panel: peldakPanel },
  { id: 'gyakorlas', cim: 'Gyakorlás', panel: gyakorlasPanel },
];
const fulGombok = {};
const panelek = {};

function fulValt(id, fokusz = true) {
  for (const f of FULEK) {
    const aktiv = f.id === id;
    fulGombok[f.id].setAttribute('aria-selected', String(aktiv));
    fulGombok[f.id].tabIndex = aktiv ? 0 : -1;
    panelek[f.id].hidden = !aktiv;
  }
  if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
  if (fokusz) fulGombok[id].focus();
}

const fulsor = el('div', { class: 'fulek', role: 'tablist', 'aria-label': 'A téma részei' });
for (const f of FULEK) {
  const gomb = el('button', { type: 'button', class: 'ful', role: 'tab', id: `ful-${f.id}`, 'aria-controls': `panel-${f.id}`, 'aria-selected': 'false', tabindex: '-1' }, f.cim);
  gomb.addEventListener('click', () => fulValt(f.id));
  gomb.addEventListener('keydown', (e) => {
    const i = FULEK.findIndex((x) => x.id === f.id);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % FULEK.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + FULEK.length) % FULEK.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = FULEK.length - 1;
    if (j !== null) { e.preventDefault(); fulValt(FULEK[j].id); }
  });
  fulGombok[f.id] = gomb;
  fulsor.append(gomb);
  panelek[f.id] = el('section', { class: 'ful-panel', role: 'tabpanel', id: `panel-${f.id}`, 'aria-labelledby': `ful-${f.id}`, hidden: true });
}
tartalom.append(fulsor, ...FULEK.map((f) => panelek[f.id]));
for (const f of FULEK) panelek[f.id].append(...f.panel());

const kezdo = FULEK.find((f) => '#' + f.id === location.hash)?.id || 'elmelet';
fulValt(kezdo, false);
window.addEventListener('hashchange', () => {
  const f = FULEK.find((x) => '#' + x.id === location.hash);
  if (f) fulValt(f.id, false);
});
