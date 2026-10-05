// 6. téma – Közgazdasági függvények vizsgálata: a függvényt a feladat szövegéből olvassuk vissza, és a
// válaszokat egész értékek behelyettesítésével, a generátortól függetlenül ellenőrizzük (SPEC: egész darabszám-határok).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz, kerekit } from '../js/lib/szam.js';
import { ellenoriz, egyezik, helyesE } from '../js/lib/ellenorzo.js';
import tema, * as G from '../js/temak/fuggvenyvizsgalat.js';
import { sima } from './segito.js';

const MINTA = 300;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace(',', '.'));

/** A profitfüggvény visszaolvasása: pr(x) = −x³ + A x² − B x ± C */
function profitSzovegbol(szoveg) {
  const r = sima(szoveg).match(/pr\(x\) = −x³ \+ ([\d ]+)x² − ([\d ]+)x ([−+]) ([\d ]+) függvény/);
  if (!r) return null;
  const A = szam(r[1]), B = szam(r[2]), c = (r[3] === '−' ? -1 : 1) * szam(r[4]);
  return { A, B, c, fn: (x) => -(x ** 3) + A * x * x - B * x + c };
}
function atlagSzovegbol(szoveg) {
  const r = sima(szoveg).match(/ac\(x\) = x \+ ([\d ]+) \+ ([\d ]+)\/x függvény/);
  if (!r) return null;
  const b = szam(r[1]), k2 = szam(r[2]);
  return { b, k2, k: Math.sqrt(k2), fn: (x) => x + b + k2 / x };
}
/** Egész számok közül az első összefüggő sor, ahol a feltétel igaz – kizárólag behelyettesítéssel. */
function hataros(fn, felt, tol = 0, ig = 600) {
  let lo = null, hi = null;
  for (let n = tol; n <= ig; n++) { if (felt(fn(n))) { lo ??= n; hi = n; } else if (lo !== null) break; }
  return { lo, hi };
}
const argmax = (fn, a, b) => { let m = a; for (let x = a; x <= b; x++) if (fn(x) > fn(m)) m = x; return m; };
const argmin = (fn, a, b) => { let m = a; for (let x = a; x <= b; x++) if (fn(x) < fn(m)) m = x; return m; };

function profitInvariansok(P, nev) {
  // a függvény a csúcsokból épült: pr'(x) = −3(x − m1)(x − m2), egész csúcsokkal, negatív fix költséggel
  assert.ok(P.c < 0, `negatív fix költség – ${nev}`);
  assert.equal((2 * P.A) % 3, 0);
  const S = (2 * P.A) / 3, Pr = P.B / 3;           // m1 + m2 és m1 · m2
  assert.ok(Number.isInteger(S) && S % 2 === 0, `m1 + m2 páros egész – ${nev}`);
  const disc = S * S - 4 * Pr, w = Math.sqrt(disc);
  assert.ok(Number.isInteger(w), `egész csúcsok – ${nev}`);
  const m1 = (S - w) / 2, m2 = (S + w) / 2;
  assert.ok(P.fn(m1) < 0, 'a minimumban veszteség');
  assert.ok(P.fn(m2) > 0 && P.fn(m2) % 50 === 0, 'a maximumban kerek nyereség');
  return { m1, m2 };
}

const FUGGETLEN = {
  G1: (f) => { const P = profitSzovegbol(f.szoveg); const { m1, m2 } = profitInvariansok(P, f.szoveg); const x = argmax(P.fn, 0, 400); assert.equal(x, m2); return [x, P.fn(x)]; },
  G2: (f) => { const P = profitSzovegbol(f.szoveg); const { m2 } = profitInvariansok(P, f.szoveg); const mx = argmax(P.fn, 0, 400); assert.equal(mx, m2); return [argmin(P.fn, 0, mx), mx]; },
  G3: (f) => { const P = profitSzovegbol(f.szoveg); profitInvariansok(P, f.szoveg); const h = hataros(P.fn, (y) => y > 0); hatarEllenorzes(P.fn, (y) => y > 0, h); return [h.lo, h.hi]; },
  G4: (f) => {
    const P = profitSzovegbol(f.szoveg); profitInvariansok(P, f.szoveg);
    const K = szam(sima(f.szoveg).match(/több, mint ([\d ]+) €/)[1]);
    const h = hataros(P.fn, (y) => y > K); hatarEllenorzes(P.fn, (y) => y > K, h); return [h.lo, h.hi];
  },
  G5: (f) => {
    const s = sima(f.szoveg);
    const P = profitSzovegbol(f.szoveg);
    if (P) return [P.fn(Number(s.match(/profit (\d+) darab/)[1]))];
    const A = atlagSzovegbol(f.szoveg);
    return [kerekit(A.fn(Number(s.match(/átlagköltség (\d+) darab/)[1])), 2)];
  },
  G6: (f) => { const A = atlagSzovegbol(f.szoveg); assert.ok(Number.isInteger(A.k)); const x = argmin(A.fn, 1, 800); assert.equal(x, A.k); return [x, A.fn(x)]; },
  G7: (f) => {
    const A = atlagSzovegbol(f.szoveg);
    const K = szam(sima(f.szoveg).match(/kisebb, mint ([\d ]+) €\/db/)[1]);
    const h = hataros(A.fn, (y) => y < K, 1, 900); hatarEllenorzes(A.fn, (y) => y < K, h, 1); return [h.lo, h.hi];
  },
  G8: (f) => {
    const A = atlagSzovegbol(f.szoveg);
    const [, x1, x2] = sima(f.szoveg).match(/(\d+) darabról (\d+) darabra/).map(Number);
    return [A.fn(x2) - A.fn(x1), ((A.fn(x2) - A.fn(x1)) / A.fn(x1)) * 100];
  },
};

/** SPEC: a határokat egész értékek behelyettesítésével kell ellenőrizni (pl. pr(23) < 0, pr(24) > 0). */
function hatarEllenorzes(fn, felt, h, tol = 0) {
  assert.ok(h.lo !== null && h.hi > h.lo, 'van tartomány');
  assert.ok(felt(fn(h.lo)), `a(z) ${h.lo} teljesíti`);
  if (h.lo - 1 >= tol) assert.ok(!felt(fn(h.lo - 1)), `a(z) ${h.lo - 1} már nem teljesíti`);
  assert.ok(felt(fn(h.hi)), `a(z) ${h.hi} teljesíti`);
  assert.ok(!felt(fn(h.hi + 1)), `a(z) ${h.hi + 1} már nem teljesíti`);
}

for (const t of tema.tipusok) {
  test(`fuggvenyvizsgalat / ${t.id} – ${t.nev}: ${MINTA} generált feladat helyes`, () => {
    const rng = ujRng(9600 + Number(t.id.slice(1)));
    const szovegek = new Set();
    for (let i = 0; i < MINTA; i++) {
      const f = t.general(rng);
      szovegek.add(f.szoveg);
      const nev = `${t.id}: ${sima(f.szoveg)}`;
      assert.ok(!/NaN|undefined|Infinity/.test(f.szoveg + f.megoldas.join() + f.magyarazat.join()), nev);
      const vart = FUGGETLEN[t.id](f);
      assert.equal(vart.length, f.mezok.length, nev);
      f.mezok.forEach((m, k) => {
        const v = vart[k];
        assert.ok(Number.isFinite(v), nev);
        assert.ok(egyezik(v, m.helyes, m.tizedes) && Math.abs(v - m.helyes) < 0.06 + (m.tizedes === 0 ? 1e-6 : 0), `${nev}: generált ${m.helyes}, újraszámolt ${v}`);
        for (const be of [formaz(m.helyes, m.tizedes), formaz(m.helyes, m.tizedes).replace(',', '.').replace(/\s/g, '')]) assert.ok(helyesE(ellenoriz(m, be)), `„${be}” elfogadva – ${nev}`);
        for (const h of m.hibak) {
          assert.ok(!egyezik(h.ertek, m.helyes, m.tizedes), `a hiba (${h.ertek}) különbözik a jótól (${m.helyes})`);
          const r = ellenoriz(m, formaz(h.ertek, Math.max(m.tizedes, 2)));
          if (r.allapot === 'tipikus') assert.equal(r.uzenet, h.uzenet);
        }
      });
      // darabszám-mezők egészek
      if (['G3', 'G4', 'G7'].includes(t.id)) for (const m of f.mezok) assert.ok(Number.isInteger(m.helyes) && m.tizedes === 0);
    }
    assert.ok(szovegek.size > MINTA * 0.6, `változatos feladatok (${szovegek.size})`);
  });
}

test('G3: a kerekített (nem felfelé kerekített) alsó határ felismert, ellenpróbával (pr(23) < 0)', () => {
  const rng = ujRng(9703);
  let db = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('G3').general(rng);
    const P = profitSzovegbol(f.szoveg);
    const [lo] = f.mezok.map((m) => m.helyes);
    const xa = G.gyok(P.fn, 1, P.fn(lo) > 0 ? lo : lo + 1);
    const kerekitett = Math.round(xa);
    if (kerekitett === lo) continue;
    const r = ellenoriz(f.mezok[0], String(kerekitett));
    assert.equal(r.allapot, 'tipikus');
    assert.ok(r.ellenproba.includes(`pr(${kerekitett}) = `), r.ellenproba);
    assert.ok(P.fn(kerekitett) <= 0 && /veszteséges/.test(r.ellenproba), r.ellenproba);
    db++;
  }
  assert.ok(db > 30, `legalább 30 ilyen eset (${db})`);
});

test('G1: a minimum helye és az intervallum széle tipikus hiba; G2: a két határ felcserélése', () => {
  const rng = ujRng(9701);
  for (let i = 0; i < MINTA; i++) {
    const f1 = tipus('G1').general(rng);
    const P = profitSzovegbol(f1.szoveg), { m1, m2 } = profitInvariansok(P, f1.szoveg);
    assert.equal(ellenoriz(f1.mezok[0], String(m1)).allapot, 'tipikus');
    if (m2 !== 100) assert.equal(ellenoriz(f1.mezok[0], '100').allapot, 'tipikus');
    assert.equal(ellenoriz(f1.mezok[1], String(P.fn(m1))).allapot, 'tipikus');
    const f2 = tipus('G2').general(rng);
    const [lo, hi] = f2.mezok.map((m) => m.helyes);
    const r = ellenoriz(f2.mezok[0], String(hi));
    assert.equal(r.allapot, 'tipikus');
    assert.match(r.uzenet, /Felcserélte/);
    assert.equal(ellenoriz(f2.mezok[1], String(lo)).allapot, 'tipikus');
  }
});

test('G5: a −x³ előjelhiba és az osztás nélküli átlagköltség felismert; G8: a későbbi értékkel osztás felismert', () => {
  const rng = ujRng(9705);
  let a = 0, b = 0, c = 0;
  for (let i = 0; i < 600; i++) {
    const f = tipus('G5').general(rng);
    const P = profitSzovegbol(f.szoveg);
    if (P) {
      const x = Number(sima(f.szoveg).match(/profit (\d+) darab/)[1]);
      const rossz = x ** 3 + P.A * x * x - P.B * x + P.c;
      const r = ellenoriz(f.mezok[0], String(rossz));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /−x³ azt jelenti: −\(x³\)/); a++;
    } else {
      const A = atlagSzovegbol(f.szoveg);
      const x = Number(sima(f.szoveg).match(/átlagköltség (\d+) darab/)[1]);
      const r = ellenoriz(f.mezok[0], formaz(x + A.b + A.k2, 2));
      assert.equal(r.allapot, 'tipikus'); b++;
    }
    const f8 = tipus('G8').general(rng);
    const A8 = atlagSzovegbol(f8.szoveg);
    const [, x1, x2] = sima(f8.szoveg).match(/(\d+) darabról (\d+) darabra/).map(Number);
    const rossz = ((A8.fn(x2) - A8.fn(x1)) / A8.fn(x2)) * 100;
    const r8 = ellenoriz(f8.mezok[1], formaz(rossz, 2));
    assert.equal(r8.allapot, 'tipikus'); assert.match(r8.uzenet, /korábbi/); c++;
  }
  assert.ok(a > 100 && b > 100 && c > 500);
});

test('GeoGebra-sorok: tizedespont, a beírt függvény azonos a feladat függvényével', () => {
  const rng = ujRng(9800);
  for (const t of tema.tipusok) {
    for (let i = 0; i < 80; i++) {
      const f = t.general(rng);
      assert.ok(f.geogebra && f.geogebra.sorok.length >= 2, `${t.id}: van GeoGebra-doboz`);
      for (const sor of f.geogebra.sorok) assert.ok(!/\d,\d/.test(sor) && !/http/.test(sor), `${t.id}: ${sor}`);
      const sor0 = f.geogebra.sorok[0];
      const P = profitSzovegbol(f.szoveg), A = atlagSzovegbol(f.szoveg);
      if (P) assert.equal(sor0, `pr(x)=-x^3+${P.A}x^2-${P.B}x${P.c < 0 ? '-' : '+'}${Math.abs(P.c)}`);
      if (A) assert.equal(sor0, `ac(x)=x+${A.b}+${A.k2}/x`);
    }
  }
  const g3 = tipus('G3').general(rng);
  assert.ok(g3.geogebra.sorok.includes('Metszéspont(pr, xTengely)'));
  assert.ok(tipus('G1').general(rng).geogebra.sorok.some((s) => /^Maximum\(pr, 0, \d+\)$/.test(s)));
  assert.ok(tipus('G6').general(rng).geogebra.sorok.some((s) => /^Minimum\(ac, 1, \d+\)$/.test(s)));
});

test('ábrák: görbe, kiemelt pontok, színezett sáv és szaggatott y = K vonal, hibák nélkül', () => {
  const rng = ujRng(9900);
  for (const id of ['G1', 'G2', 'G3', 'G4', 'G6', 'G7']) {
    for (let i = 0; i < 40; i++) {
      const f = tipus(id).general(rng);
      assert.ok(f.abraMegoldas, `${id}: van ábra`);
      assert.match(f.abraMegoldas, /<polyline class="abra-vonal/);
      assert.match(f.abraMegoldas, /<circle class="abra-pont"/);
      assert.ok(!/NaN|undefined|Infinity/.test(f.abraMegoldas), id);
      if (['G2', 'G3', 'G4', 'G7'].includes(id)) assert.match(f.abraMegoldas, /class="abra-sav"/);
      if (['G4', 'G7'].includes(id)) assert.match(f.abraMegoldas, /class="abra-seged"/);
    }
  }
  for (const p of tema.peldak.filter((x) => x.abra)) assert.ok(!/NaN|undefined/.test(p.abra()));
});

test('a SPEC példái: a gyökök nem egészek, az egész határok behelyettesítéssel adódnak', () => {
  const pr = G.profitFv({ m1: 10, m2: 50, c: -1000 });
  assert.ok(pr(23) < 0 && Math.round(pr(24)) === 1016 && Math.round(pr(67)) === 1747 && pr(68) < 0);
  const kerekpar = G.profitFv({ m1: 20, m2: 70, c: -5000 });
  assert.ok(kerekpar(51) < 0 && kerekpar(52) > 0 && kerekpar(84) > 0 && kerekpar(85) < 0);
  assert.ok(kerekpar(57) <= 10000 && kerekpar(58) > 10000 && kerekpar(80) > 10000 && kerekpar(81) <= 10000);
  const ac = G.atlagFv({ b: 750, k: 50 });
  assert.ok(ac(19) >= 900 && ac(20) < 900 && ac(130) < 900 && ac(131) >= 900);
});
