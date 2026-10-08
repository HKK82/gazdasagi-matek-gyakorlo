// 8. téma – Mintavételek és eloszlásuk: a helyes válaszokat a feladat szövegéből visszaolvasott számokból,
// a generátortól (és az eloszlas.js-től) függetlenül, BigInt-es kombinációkkal számoljuk újra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz, kerekit } from '../js/lib/szam.js';
import { ellenoriz, egyezik, helyesE } from '../js/lib/ellenorzo.js';
import tema, { ggDiszkret, hiperEl } from '../js/temak/mintavetel.js';
import { sima } from './segito.js';

const MINTA = 300;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));

// ---- független számolás ----
const C = (n, k) => {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1n; i <= BigInt(k); i++) r = (r * (BigInt(n) - BigInt(k) + i)) / i;
  return r;
};
const hipPmf = (N, M, n, k) => Number(C(M, k) * C(N - M, n - k)) / Number(C(N, n));
const binPmf = (n, p, k) => Number(C(n, k)) * p ** k * (1 - p) ** (n - k);
const osszeg = (pmf, a, b, n) => { let s = 0; for (let k = Math.max(0, a); k <= Math.min(n, b); k++) s += pmf(k); return s; };

/** A feladat szövegéből a szituáció: { fajta: 'hiper'|'binom', N, M, n, p, kulcs, k } */
function olvas(szoveg) {
  const s = sima(szoveg);
  let r, o = {};
  if ((r = s.match(/(\d+) lapos magyar kártyában (\d+) [^.]*? van\. Visszatevés nélkül kihúzunk (\d+) lapot/))) o = { fajta: 'hiper', N: +r[1], M: +r[2], n: +r[3] };
  else if ((r = s.match(/(\d+) bonbon van, ebből (\d+) mogyorós\. [^.]*kiveszünk (\d+) bonbont/))) o = { fajta: 'hiper', N: +r[1], M: +r[2], n: +r[3] };
  else if ((r = s.match(/(\d+) tétel közül lehet húzni, ebből (\d+) tételt tanult meg a hallgató\. Visszatevés nélkül húz (\d+) tételt/))) o = { fajta: 'hiper', N: +r[1], M: +r[2], n: +r[3] };
  else if ((r = s.match(/(\d+) boríték van, ebből (\d+) nyerő\. Visszatevés nélkül kihúzunk (\d+) borítékot/))) o = { fajta: 'hiper', N: +r[1], M: +r[2], n: +r[3] };
  else if ((r = s.match(/(\d+) tojás van, ebből (\d+) régi\. [^.]*kiveszünk (\d+) tojást/))) o = { fajta: 'hiper', N: +r[1], M: +r[2], n: +r[3] };
  else if ((r = s.match(/(\d+) tulipánhagyma van, ennek (\d+) %-a sárga virágú, a többi piros\. Visszatevés nélkül kiültetünk (\d+) hagymát/))) o = { fajta: 'hiper', N: +r[1], M: (+r[1] * +r[2]) / 100, n: +r[3], pct: +r[2] };
  else if ((r = s.match(/(\d+) muskátli van, ennek (\d+) %-a fehér virágú, a többi piros\. Visszatevés nélkül kiveszünk (\d+) muskátlit/))) o = { fajta: 'hiper', N: +r[1], M: (+r[1] * +r[2]) / 100, n: +r[3], pct: +r[2] };
  else if ((r = s.match(/(\d+) lapos magyar kártyában (\d+) [^.]*? van\. (\d+) alkalommal húzunk egy lapot, és minden húzás után visszatesszük/))) o = { fajta: 'binom', n: +r[3], p: +r[2] / +r[1] };
  else if ((r = s.match(/(\d+) boríték van, ebből (\d+) nyerő\. Visszatevéssel kihúzunk (\d+) borítékot/))) o = { fajta: 'binom', n: +r[3], p: +r[2] / +r[1] };
  else if ((r = s.match(/(\d+) %-a [^.]*\. (?:Találomra (?:kiválasztunk|megkérdezünk|kiveszünk)|Kiválasztunk) (\d+) /))) o = { fajta: 'binom', n: +r[2], p: +r[1] / 100, pct: +r[1] };
  else throw new Error('ismeretlen szituáció: ' + s);
  if (!o.p && o.fajta === 'hiper') o.p = o.M / o.N;
  if ((r = s.match(/között (pontosan|több mint|kevesebb mint|legalább|legfeljebb) (\d+) /))) { o.kulcs = r[1]; o.k = +r[2]; }
  return o;
}
const pmfDe = (o) => (k) => (o.fajta === 'hiper' ? hipPmf(o.N, o.M, o.n, k) : binPmf(o.n, o.p, k));
const tartomany = ({ kulcs, k, n }) => ({
  pontosan: [k, k], 'több mint': [k + 1, n], 'kevesebb mint': [0, k - 1], legalább: [k, n], legfeljebb: [0, k],
})[kulcs];
const kozel = (a, b) => Math.abs(a - b) <= 1e-9;
const elfogad = (m, be) => helyesE(ellenoriz(m, be));

for (const id of ['M2', 'M3', 'M7']) {
  test(`mintavetel / ${id}: ${MINTA} generált feladat helyes (a szövegből újraszámolva)`, () => {
    const rng = ujRng(8100 + Number(id.slice(1)));
    const szovegek = new Set();
    let vanSzazalek = 0;
    for (let i = 0; i < MINTA; i++) {
      const f = tipus(id).general(rng);
      szovegek.add(f.szoveg);
      const nev = `${id}: ${sima(f.szoveg)}`;
      const o = olvas(f.szoveg);
      if (id === 'M2') assert.equal(o.kulcs, 'pontosan');
      if (id === 'M2' && o.fajta !== 'hiper') assert.fail('M2 hipergeometrikus');
      if (id === 'M3') assert.equal(o.fajta, 'hiper');
      if (id === 'M7') assert.equal(o.fajta, 'binom');
      if (o.pct && id === 'M2') vanSzazalek++;
      const [a, b] = tartomany({ ...o });
      const P = osszeg(pmfDe(o), a, b, o.n);
      const m = f.mezok[0];
      assert.ok(Math.abs(m.helyes - P) < 1e-9, `${nev}: generált ${m.helyes}, újraszámolt ${P}`);
      assert.ok(m.helyes >= 0 && m.helyes <= 1);
      // a helyes válasz minden formában elfogadott: 4 tizedes, tizedespont, százalék, ±0,0001
      assert.ok(elfogad(m, formaz(P, 4)), nev);
      assert.ok(elfogad(m, formaz(P, 4).replace(',', '.')), nev);
      assert.ok(elfogad(m, formaz(P, 6)), nev);
      const szaz = ellenoriz(m, formaz(kerekit(P * 100, 4), 4));
      assert.ok(['jo', 'jo-megjegyzes'].includes(szaz.allapot), `százalék alak: ${nev} ${szaz.allapot}`);
      assert.ok(elfogad(m, formaz(P + 0.00009, 6)) || P + 0.00009 > 1, `±0,0001 tűrés: ${nev}`);
      assert.ok(!elfogad(m, formaz(P + 0.01, 4)) || P + 0.01 > 1, nev);
      // a határ-félreértés (a „félreértett” tartomány) célzott visszajelzést kap
      const [fa, fb] = { pontosan: [0, o.k], 'több mint': [o.k, o.n], 'kevesebb mint': [0, o.k], legalább: [o.k + 1, o.n], legfeljebb: [0, o.k - 1] }[o.kulcs];
      const rossz = osszeg(pmfDe(o), fa, fb, o.n);
      if (!egyezik(rossz, P, 4) && Math.abs(rossz - P) > 2e-4) {
        const r = ellenoriz(m, formaz(rossz, 4));
        assert.equal(r.allapot, 'tipikus', `${nev} (félreértés ${formaz(rossz, 4)})`);
        assert.match(r.ellenproba, /^Ellenpróba: /);
      }
      assert.ok(f.geogebra && f.geogebra.sorok.length === 1, 'van GeoGebra-doboz');
      assert.ok(!/\d,\d/.test(f.geogebra.sorok[0]), 'tizedespont a GeoGebra-sorban: ' + f.geogebra.sorok[0]);
      assert.ok(f.abraMegoldas && /role="img"/.test(f.abraMegoldas) && !/NaN|undefined|Infinity/.test(f.abraMegoldas));
      assert.ok((f.abraMegoldas.match(/abra-oszlop kiemelt/g) || []).length >= 1, 'kiszínezett oszlop az ábrán');
    }
    assert.ok(szovegek.size > MINTA * 0.5, `változatos feladatok (${szovegek.size})`);
    if (id === 'M2') assert.ok(vanSzazalek > 20, `százalékos változat is előfordul (${vanSzazalek})`);
  });
}

test('M2: a binomiális érték és a „M helyett %” tipikus hiba; M3: a határ („több mint 2” → ≥ 2) célzott üzenetet kap', () => {
  const rng = ujRng(8120);
  let binom = 0, szazalek = 0, hatar = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M2').general(rng);
    const o = olvas(f.szoveg);
    const m = f.mezok[0];
    const b = binPmf(o.n, o.M / o.N, olvas(f.szoveg).k);
    if (!egyezik(b, m.helyes, 4) && Math.abs(b - m.helyes) > 2e-4) {
      const r = ellenoriz(m, formaz(b, 4));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /hipergeometrikus/); binom++;
    }
    if (o.pct && o.pct < o.N) {
      const x = hipPmf(o.N, o.pct, o.n, o.k);
      if (Number.isFinite(x) && Math.abs(x - m.helyes) > 2e-4 && x > 0) {
        const r = ellenoriz(m, formaz(x, 4));
        assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Darabszám kell, nem százalék/); assert.match(r.uzenet, new RegExp(`${o.pct} %-a = ${o.M}`)); szazalek++;
      }
    }
    const f3 = tipus('M3').general(rng);
    const o3 = olvas(f3.szoveg);
    if (o3.kulcs === 'tobb mint'.replace('tobb', 'több') || o3.kulcs === 'több mint') {
      const rossz = osszeg(pmfDe(o3), o3.k, o3.n, o3.n);
      const r = ellenoriz(f3.mezok[0], formaz(rossz, 4));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, new RegExp(`${o3.k + 1} vagy több`)); assert.match(r.ellenproba, new RegExp(formaz(rossz, 4))); hatar++;
    }
  }
  assert.ok(binom > 100 && szazalek > 5 && hatar > 30, `${binom} ${szazalek} ${hatar}`);
});

test('M4: módusz és valószínűsége (két mező), a várható érték megadása célzott üzenetet kap', () => {
  const rng = ujRng(8104);
  let mu = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M4').general(rng);
    const o = olvas(f.szoveg);
    const ps = Array.from({ length: o.n + 1 }, (_, k) => pmfDe(o)(k));
    const max = Math.max(...ps);
    assert.equal(ps.filter((x) => Math.abs(x - max) < 1e-12).length, 1, 'egyértelmű módusz');
    const [mod, val] = f.mezok;
    assert.equal(mod.helyes, ps.indexOf(max));
    assert.ok(Math.abs(val.helyes - max) < 1e-9);
    assert.ok(elfogad(mod, String(ps.indexOf(max))) && elfogad(val, formaz(max, 4)));
    assert.equal(ellenoriz(mod, '1,5').allapot, 'tipikus', 'nem egész módusz');
    const varhato = o.fajta === 'hiper' ? (o.n * o.M) / o.N : o.n * o.p;
    if (Math.round(varhato) !== ps.indexOf(max)) {
      const r = ellenoriz(mod, String(Math.round(varhato)));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /nem a várható érték/); mu++;
    }
  }
  assert.ok(mu > 5, `előfordul, hogy a módusz ≠ kerekített várható érték (${mu})`);
});

test('M5: μ és σ (4 tizedes), σ² célzott hiba', () => {
  const rng = ujRng(8105);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M5').general(rng);
    const o = olvas(f.szoveg);
    const [mu, sg] = f.mezok;
    const m = o.fajta === 'hiper' ? (o.n * o.M) / o.N : o.n * o.p;
    const s = o.fajta === 'hiper' ? Math.sqrt(o.n * (o.M / o.N) * (1 - o.M / o.N) * ((o.N - o.n) / (o.N - 1))) : Math.sqrt(o.n * o.p * (1 - o.p));
    assert.ok(Math.abs(mu.helyes - m) < 1e-9 && Math.abs(sg.helyes - s) < 1e-9, sima(f.szoveg));
    assert.ok(elfogad(mu, formaz(m, 4)) && elfogad(sg, formaz(s, 4)));
    const r = ellenoriz(sg, formaz(s * s, 4));
    if (!egyezik(s * s, s, 4)) { assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /szórásnégyzet/); assert.match(r.ellenproba, /^Ellenpróba: /); }
  }
});

test('M6: a [μ − tσ; μ + tσ] egész határai és a valószínűség; rossz irányú kerekítés és nem egész határ célzott hiba', () => {
  const rng = ujRng(8106);
  let alsoHiba = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M6').general(rng);
    const s = sima(f.szoveg);
    const t = szam(s.match(/legfeljebb ([\d,]+) szórással tér el/)[1]);
    const o = olvas(f.szoveg.replace(/Mennyi a valószínűsége, hogy.*$/, 'Mennyi a valószínűsége, hogy a között pontosan 0 x van?'));
    const m = o.fajta === 'hiper' ? (o.n * o.M) / o.N : o.n * o.p;
    const sg = o.fajta === 'hiper' ? Math.sqrt(o.n * (o.M / o.N) * (1 - o.M / o.N) * ((o.N - o.n) / (o.N - 1))) : Math.sqrt(o.n * o.p * (1 - o.p));
    const lo = Math.ceil(m - t * sg - 1e-9), hi = Math.floor(m + t * sg + 1e-9);
    const [a, b, p] = f.mezok;
    assert.equal(a.helyes, lo, s); assert.equal(b.helyes, hi, s);
    const P = osszeg(pmfDe(o), lo, hi, o.n);
    assert.ok(Math.abs(p.helyes - P) < 1e-9, s);
    assert.ok(elfogad(a, String(lo)) && elfogad(b, String(hi)) && elfogad(p, formaz(P, 4)));
    const tort = formaz(m - t * sg, 2);
    if (!Number.isInteger(szam(tort))) { const nemEgesz = ellenoriz(a, tort); assert.equal(nemEgesz.allapot, 'tipikus'); assert.match(nemEgesz.uzenet, /Egész érték kell/); }
    const le = Math.floor(m - t * sg);
    if (le !== lo) { const r = ellenoriz(a, String(le)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /első egész szám/); alsoHiba++; }
    const fel = Math.ceil(m + t * sg);
    if (fel !== hi) assert.equal(ellenoriz(b, String(fel)).allapot, 'tipikus');
  }
  assert.ok(alsoHiba > 100);
});

test('M7: darabszám / százalék a valószínűség helyén és a legfeljebb ↔ legalább csere célzott hiba', () => {
  const rng = ujRng(8107);
  let darab = 0, csere = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M7').general(rng);
    const o = olvas(f.szoveg);
    const m = f.mezok[0];
    const dsz = o.pct ?? Math.round(o.p * (sima(f.szoveg).match(/(\d+) (?:lapos|boríték)/)?.[1] ?? 1));
    const r = ellenoriz(m, String(dsz));
    if (Math.abs(dsz / 100 - m.helyes) > 2e-4) { // (ha véletlenül éppen a %-os alak a jó válasz, azt elfogadjuk)
      assert.equal(r.allapot, 'tipikus', `${sima(f.szoveg)} / ${dsz}`);
      assert.match(r.uzenet, /arány|valószínűség|esély/);
    }
    darab++;
    if (o.kulcs === 'legfeljebb' || o.kulcs === 'legalább') {
      const x = o.kulcs === 'legfeljebb' ? osszeg(pmfDe(o), o.k, o.n, o.n) : osszeg(pmfDe(o), 0, o.k, o.n);
      if (Math.abs(x - m.helyes) > 2e-4 && Math.abs(x / 100 - m.helyes) > 2e-4) { const rr = ellenoriz(m, formaz(x, 4)); assert.equal(rr.allapot, 'tipikus'); assert.match(rr.uzenet, /Olvassa el még egyszer/); csere++; }
    }
  }
  assert.equal(darab, MINTA);
  assert.ok(csere > 50, `${csere}`);
});

test('M8: a kitüntetett cseréje (fiú 45 % → lány 0,55), a 0,45-tel számolt érték célzott hiba', () => {
  const rng = ujRng(8108);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M8').general(rng);
    const s = sima(f.szoveg);
    const r = s.match(/(\d+) (?:% eséllyel fiú|%-a selejtes|%-a támogatja)/);
    const pct = +r[1];
    const n = +s.match(/(?:(\d+) gyermek születik|kiválasztunk (\d+) alkatrészt|megkérdezünk (\d+) választót)/).slice(1).find(Boolean);
    const q = s.match(/hogy (pontosan|több mint|kevesebb mint|legalább|legfeljebb) (\d+) /);
    const [a, b] = tartomany({ kulcs: q[1], k: +q[2], n });
    const p = 1 - pct / 100;
    const P = osszeg((k) => binPmf(n, p, k), a, b, n);
    const m = f.mezok[0];
    assert.ok(Math.abs(m.helyes - P) < 1e-9, s);
    assert.ok(elfogad(m, formaz(P, 4)));
    const rossz = osszeg((k) => binPmf(n, pct / 100, k), a, b, n);
    const x = ellenoriz(m, formaz(rossz, 4));
    assert.equal(x.allapot, 'tipikus'); assert.match(x.uzenet, new RegExp(`1 − ${formaz(pct / 100, 2)} = ${formaz(p, 2)}`));
  }
});

test('M9: visszatevéssel és nélküle (két érték) + „mikor közelebb?” (választós); a SPEC 100 / 24 / 8 / 2 példája', () => {
  const rng = ujRng(8109);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M9').general(rng);
    const s = sima(f.szoveg);
    const [, N, M, n, k] = s.match(/(\d+) boríték van, ebből (\d+) nyerő\. Kihúzunk (\d+) borítékot\. Mennyi a valószínűsége, hogy pontosan (\d+) nyerő/).map(Number);
    const [a, b, c] = f.mezok;
    assert.ok(Math.abs(a.helyes - hipPmf(N, M, n, k)) < 1e-9 && Math.abs(b.helyes - binPmf(n, M / N, k)) < 1e-9, s);
    assert.equal(ellenoriz(a, formaz(b.helyes, 4)).allapot, 'tipikus');
    assert.equal(ellenoriz(b, formaz(a.helyes, 4)).allapot, 'tipikus');
    assert.equal(c.opciok.filter((o) => o.helyes).length, 1);
    assert.match(c.opciok.find((o) => o.helyes).szoveg, /sokkal nagyobb a mintánál/);
    assert.equal(f.geogebra.sorok.length, 2);
  }
  // a SPEC példája
  assert.equal(formaz(hipPmf(100, 24, 8, 2), 4), '0,3242');
  assert.equal(formaz(binPmf(8, 0.24, 2), 4), '0,3108');
  assert.equal(formaz(hipPmf(25, 6, 8, 2), 4), '0,3763');
});

test('M1: melyik eloszlás? – a szöveg alapján hipergeometrikus vagy binomiális; a nagy sokaság hibájának SPEC-üzenete', () => {
  const rng = ujRng(8101);
  const lattak = new Set();
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('M1').general(rng);
    const s = sima(f.szoveg);
    const [el, par] = f.mezok;
    const helyes = el.opciok.find((o) => o.helyes).szoveg;
    const vart = /isszatevés nélkül/.test(s) ? 'hipergeometrikus' : 'binomiális';
    assert.equal(helyes, vart, s);
    lattak.add(/nagyon nagy/.test(s) ? 'nagy' : vart);
    const rossz = el.opciok.findIndex((o) => !o.helyes);
    const r = ellenoriz(el, String(rossz));
    assert.equal(r.allapot, 'tipikus');
    if (/nagyon nagy/.test(s)) assert.match(r.uzenet, /Nem ismerjük a sokaság méretét – nagy sokaságnál binomiálissal becsülünk/);
    if (vart === 'hipergeometrikus') assert.match(r.uzenet, /Visszatevés nélkül húzunk és ismert a sokaság → hipergeometrikus/);
    assert.equal(par.opciok.filter((o) => o.helyes).length, 1);
    assert.equal(new Set(par.opciok.map((o) => o.szoveg)).size, 3, 'három különböző paraméterválasz');
  }
  assert.equal(lattak.size, 3);
});

test('GeoGebra Valószínűség-számítás nézet: a SPEC beírandó sora és a tizedespont', () => {
  const g = ggDiszkret(hiperEl(32, 4, 8), 2, 2);
  assert.equal(g.sorok[0], 'Hipergeometrikus · populáció: 32 · n: 4 · minta: 8 · két érték között: 2 ≤ X ≤ 2');
  assert.match(g.megjegyzes, /Valószínűség-számítás/);
  assert.match(g.megjegyzes, /kisebb \(≤\)/);
  assert.match(ggDiszkret(hiperEl(32, 8, 8), 3, 8).sorok[0], /nagyobb \(≥\): X ≥ 3$/);
  assert.match(ggDiszkret(hiperEl(30, 18, 10), 0, 5).sorok[0], /kisebb \(≤\): X ≤ 5$/);
});

test('a kidolgozott példák szövegében a SPEC végeredményei szerepelnek', () => {
  const sz = tema.peldak.map((p) => p.lepesek.join(' ')).join(' ');
  for (const v of ['0,2149', '0,4503', '0,3085', '1,0776', '0,8478', '12', '0,2259', '0,35', '0,3441', '1,2865', '0,7647', '0,8922', '0,5882',
    '0,0879', '0,8862', '0,4533', '1,3229', '0,9593', '0,8675', '0,4069', '0,55', '5,5', '0,5044', '0,0017', '0,3242', '0,3108', '0,3763',
    '0,8113', '0,6597', '0,4344', '1,3565', '0,9549']) assert.ok(sz.includes(v), v);
  // az ábrák: oszlopdiagram kiszínezett oszlopokkal
  for (const p of tema.peldak.filter((x) => x.abra)) {
    const svg = p.abra();
    assert.match(svg, /abra-oszlop kiemelt/); assert.match(svg, /abra-oszlop szurke/); assert.match(svg, /μ = /);
  }
});
