// 10. téma – Döntéselmélet: a döntési táblázatot a feladat HTML-szövegéből olvassuk vissza, és a helyes döntést,
// illetve a döntő értéket a generátortól függetlenül, a tesztben írt képletekkel számoljuk újra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz } from '../js/lib/szam.js';
import { ellenoriz, helyesE } from '../js/lib/ellenorzo.js';
import tema, { tablaHtml } from '../js/temak/donteselmelet.js';
import { sima } from './segito.js';

const MINTA = 400;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
const elfogad = (m, be) => helyesE(ellenoriz(m, be));

/** A feladatszöveg HTML-táblázata → { oszlopok, sorok: [{ nev, ert }], valsz } */
function tablaOlvas(szoveg) {
  const t = szoveg.match(/<table[\s\S]*?<\/table>/)[0];
  const sorok = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  const fej = [...sorok[0].matchAll(/<th[^>]*>(.*?)<\/th>/g)].map((m) => m[1]);
  const adat = [];
  let valsz = null;
  for (const r of sorok.slice(1)) {
    const nev = r.match(/<th scope="row">(.*?)<\/th>/)[1];
    const tdk = [...r.matchAll(/<td[^>]*>(.*?)<\/td>/g)].map((m) => m[1]);
    if (nev === 'esély') valsz = tdk.map((x) => (x === '?' ? null : szam(x.replace(' %', ''))));
    else adat.push({ nev, ert: tdk.map(szam) });
  }
  return { oszlopok: fej.slice(1), nevek: adat.map((x) => x.nev), E: adat.map((x) => x.ert), valsz };
}

// ---- független képletek ----
const sum = (a) => a.reduce((x, y) => x + y, 0);
const R = {
  optimista: ({ E }) => E.map((s) => Math.max(...s)),
  pesszimista: ({ E }) => E.map((s) => Math.min(...s)),
  elmulasztott: ({ E }) => { const om = E[0].map((_, j) => Math.max(...E.map((s) => s[j]))); return E.map((s) => Math.max(...s.map((v, j) => om[j] - v))); },
  laplace: ({ E }) => E.map((s) => sum(s) / s.length),
  bayes: ({ E }, p) => E.map((s) => sum(s.map((v, j) => (v * p[j]) / 100))),
  hurwitz: ({ E }, a) => E.map((s) => a * Math.max(...s) + (1 - a) * Math.min(...s)),
};
function legjobb(ertekek, kicsi = false) {
  const cel = kicsi ? Math.min(...ertekek) : Math.max(...ertekek);
  return { cel, idxs: ertekek.map((v, i) => (Math.abs(v - cel) < 1e-9 ? i : -1)).filter((i) => i >= 0) };
}
const vagy = (T, idxs) => idxs.map((i) => T.nevek[i]).join(' vagy ');

const ELVEK = {
  D1: { elv: 'optimista', par: () => null, kicsi: false },
  D2: { elv: 'pesszimista', par: () => null, kicsi: false },
  D4: { elv: 'elmulasztott', par: () => null, kicsi: true },
  D5: { elv: 'laplace', par: () => null, kicsi: false },
  D7: { elv: 'hurwitz', par: (s) => szam(sima(s).match(/α = ([\d,]+) \(/)[1]), kicsi: false },
};

for (const id of ['D1', 'D2', 'D4', 'D5', 'D7']) {
  test(`donteselmelet / ${id}: ${MINTA} generált feladat helyes (a táblázatból újraszámolva), holtverseny „X vagy Y”`, () => {
    const rng = ujRng(10100 + Number(id.slice(1)));
    const E = ELVEK[id];
    let holtverseny = 0, szovegek = new Set();
    for (let i = 0; i < MINTA; i++) {
      const f = tipus(id).general(rng);
      szovegek.add(f.szoveg);
      const nev = `${id}: ${sima(f.szoveg)}`;
      const T = tablaOlvas(f.szoveg);
      assert.ok(T.nevek.length >= 3 && T.nevek.length <= 4 && T.oszlopok.length === 3, nev);
      for (const s of T.E) for (const v of s) assert.ok(Number.isInteger(v) && v >= -10 && v <= 500, nev);
      const ertekek = R[E.elv](T, E.par(f.szoveg));
      const ny = legjobb(ertekek, E.kicsi);
      assert.ok(ny.idxs.length <= 2, 'legfeljebb kétszeres holtverseny');
      if (ny.idxs.length === 2) holtverseny++;
      const [dontes, ertek] = f.mezok;
      assert.equal(dontes.tipus, 'valasztas'); assert.equal(ertek.tipus, 'szam');
      const jo = dontes.opciok.filter((o) => o.helyes);
      assert.equal(jo.length, 1);
      assert.equal(jo[0].szoveg, vagy(T, ny.idxs), nev);
      assert.ok(Math.abs(ertek.helyes - ny.cel) < 1e-9, `${nev}: generált ${ertek.helyes}, újraszámolt ${ny.cel}`);
      assert.ok(elfogad(ertek, formaz(ny.cel, 2)) && elfogad(ertek, formaz(ny.cel, 2).replace(',', '.')), nev);
      assert.equal(dontes.opciok.filter((o) => / vagy /.test(o.szoveg)).length, 1, 'mindig van „X vagy Y” opció');
      // holtversenynél az egyedi név rossz, de a visszajelzés magyarázza a holtversenyt
      if (ny.idxs.length === 2) {
        for (const k of ny.idxs) {
          const r = ellenoriz(dontes, String(dontes.opciok.findIndex((o) => o.szoveg === T.nevek[k])));
          assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Holtverseny/);
        }
      } else {
        const par = dontes.opciok.findIndex((o) => / vagy /.test(o.szoveg));
        const r = ellenoriz(dontes, String(par));
        assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Itt nincs holtverseny/);
      }
      // táblázat az ábrán: a választott sor kiemelve
      assert.match(f.abraMegoldas, /<table class="tabla dontes">/);
      assert.equal((f.abraMegoldas.match(/<tr class="valasztott">/g) || []).length, ny.idxs.length, nev);
      assert.ok(!/NaN|undefined|Infinity/.test(f.abraMegoldas + f.megoldas.join() + f.magyarazat.join()));
    }
    assert.ok(szovegek.size > MINTA * 0.9, `változatos (${szovegek.size})`);
    if (['D1', 'D2', 'D5'].includes(id)) assert.ok(holtverseny > 20, `előfordul holtverseny (${holtverseny})`);
  });
}

test('D2: a minimumok minimuma („a legrosszabbak közül a legrosszabb”) célzott hiba (érték és döntés)', () => {
  const rng = ujRng(10102);
  let db = 0, dontesHiba = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D2').general(rng);
    const T = tablaOlvas(f.szoveg);
    const mins = R.pesszimista(T);
    const rossz = Math.min(...mins);
    const r = ellenoriz(f.mezok[1], String(rossz));
    assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Pesszimista, de nem buta/); db++;
    const idx = mins.map((v, k) => (v === rossz ? k : -1)).filter((k) => k >= 0);
    if (idx.length === 1 && !legjobb(mins).idxs.includes(idx[0])) {
      const rr = ellenoriz(f.mezok[0], String(f.mezok[0].opciok.findIndex((o) => o.szoveg === T.nevek[idx[0]])));
      assert.equal(rr.allapot, 'tipikus'); assert.match(rr.uzenet, /legkevésbé rosszat/); dontesHiba++;
    }
  }
  assert.equal(db, MINTA); assert.ok(dontesHiba > 100);
});

test('D3: a veszteségtábla cellái – oszlopmaximum − érték; a negatív értéknél a rossz előjel célzott hiba', () => {
  const rng = ujRng(10103);
  let negativ = 0, soronkent = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D3').general(rng);
    const T = tablaOlvas(f.szoveg);
    const om = T.E[0].map((_, j) => Math.max(...T.E.map((s) => s[j])));
    assert.ok(f.mezok.length >= 2 && f.mezok.length <= 3);
    const sorok = new Set(), oszlopok = new Set();
    for (const m of f.mezok) {
      const c = m.cimke.match(/Elmaradt nyereség: (.+?) \/ (.+?) \(/);
      const si = T.nevek.indexOf(c[1]), oj = T.oszlopok.indexOf(c[2]);
      assert.ok(si >= 0 && oj >= 0, m.cimke);
      sorok.add(si); oszlopok.add(oj);
      const v = T.E[si][oj];
      assert.equal(m.helyes, om[oj] - v, `${sima(f.szoveg)} / ${m.cimke}`);
      assert.ok(elfogad(m, String(om[oj] - v)));
      assert.equal(ellenoriz(m, '2,5').allapot, 'tipikus', 'nem egész szám');
      if (v < 0) {
        const r = ellenoriz(m, String(om[oj] + v));
        if (om[oj] + v !== om[oj] - v) { assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /negatív értéknél vigyázzon az előjellel/); assert.match(r.ellenproba, /^Ellenpróba: /); negativ++; }
      }
      const sm = Math.max(...T.E[si]) - v;
      if (sm !== om[oj] - v && !(v < 0 && sm === om[oj] + v)) { const r = ellenoriz(m, String(sm)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Oszloponként keressük/); soronkent++; }
    }
    assert.equal(sorok.size, f.mezok.length); assert.equal(oszlopok.size, f.mezok.length);
    assert.match(f.abraMegoldas, /Veszteségtábla/);
  }
  assert.ok(negativ > 100 && soronkent > 100, `${negativ} ${soronkent}`);
});

test('D4: a legnagyobb elmaradások maximuma célzott hiba („a legkisebbet választjuk”)', () => {
  const rng = ujRng(10104);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D4').general(rng);
    const T = tablaOlvas(f.szoveg);
    const e = R.elmulasztott(T);
    const r = ellenoriz(f.mezok[1], String(Math.max(...e)));
    assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /a legkisebbet választjuk/);
  }
});

test('D5: az összeg (osztás nélkül) célzott hiba; az átlag két tizedesre, ±0,01', () => {
  const rng = ujRng(10105);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D5').general(rng);
    const T = tablaOlvas(f.szoveg);
    const l = R.laplace(T);
    const ny = legjobb(l);
    const osszeg = Math.max(...T.E.map(sum));
    const r = ellenoriz(f.mezok[1], String(osszeg));
    assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /osztani kell a körülmények számával/);
    assert.ok(elfogad(f.mezok[1], formaz(ny.cel + 0.009, 3)));
  }
});

test('D6: a hiányzó valószínűség kiegészítése, a Bayes-döntés és -érték; a 0-val számolt hiányzó célzott hiba', () => {
  const rng = ujRng(10106);
  let nullaHiba = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D6').general(rng);
    const T = tablaOlvas(f.szoveg);
    assert.equal(T.valsz.filter((x) => x === null).length, 1, 'pontosan egy hiányzó valószínűség');
    const h = T.valsz.indexOf(null);
    const p = T.valsz.map((x, j) => (j === h ? 100 - sum(T.valsz.filter((y) => y !== null)) : x));
    assert.ok(p[h] >= 10 && sum(p) === 100);
    const [hiany, dontes, ertek] = f.mezok;
    assert.equal(hiany.helyes, p[h]);
    assert.ok(elfogad(hiany, String(p[h])));
    const nullaE = R.bayes(T, T.valsz.map((x) => x ?? 0));
    const e = R.bayes(T, p);
    const ny = legjobb(e);
    assert.equal(ny.idxs.length, 1);
    assert.equal(dontes.opciok.find((o) => o.helyes).szoveg, T.nevek[ny.idxs[0]]);
    assert.ok(Math.abs(ertek.helyes - ny.cel) < 1e-9, sima(f.szoveg));
    const r0 = ellenoriz(hiany, '0');
    assert.equal(r0.allapot, 'tipikus'); assert.match(r0.uzenet, /A valószínűségek összege 1 \(100 %\)/);
    const re = ellenoriz(ertek, formaz(nullaE[ny.idxs[0]], 2));
    if (Math.abs(nullaE[ny.idxs[0]] - ny.cel) > 0.02) { assert.equal(re.allapot, 'tipikus'); assert.match(re.uzenet, /A valószínűségek összege 1/); nullaHiba++; }
  }
  assert.ok(nullaHiba > 300);
});

test('D7: a sor legnagyobb/legkisebb értéke (nem az első/utolsó oszlop) és az α/1 − α csere célzott hiba', () => {
  const rng = ujRng(10107);
  let elsoUtolso = 0, csere = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D7').general(rng);
    const T = tablaOlvas(f.szoveg);
    const a = szam(sima(f.szoveg).match(/α = ([\d,]+) \(/)[1]);
    const e = R.hurwitz(T, a);
    const ny = legjobb(e);
    const i0 = ny.idxs[0];
    const eu = a * T.E[i0][0] + (1 - a) * T.E[i0][2];
    const cs = (1 - a) * Math.max(...T.E[i0]) + a * Math.min(...T.E[i0]);
    if (Math.abs(eu - ny.cel) > 0.02) { const r = ellenoriz(f.mezok[1], formaz(eu, 2)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /bárhol vannak/); elsoUtolso++; }
    if (Math.abs(cs - ny.cel) > 0.02 && Math.abs(cs - eu) > 0.02) { const r = ellenoriz(f.mezok[1], formaz(cs, 2)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Az α a legnagyobb érték súlya/); csere++; }
  }
  assert.ok(elsoUtolso > 300 && csere > 300, `${elsoUtolso} ${csere}`);
});

test('D8: a leírásból az elv neve; minden elv előfordul, a hibás elv célzott visszajelzést kap', () => {
  const rng = ujRng(10108);
  const lattak = new Set();
  const kulcsok = [
    ['Hurwitz', /α/], ['Elmulasztott nyereség', /megbán|elmaradás|Veszteségtáblát/], ['Bayes', /valószínűségei|megadott valószínűségével/],
    ['Laplace', /egyformán|azonos súllyal/], ['Pesszimista', /legrosszabb|minimumot|biztonság/], ['Optimista', /legnagyobb nyereséget|maximumot|legkedvezőbb/],
  ];
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('D8').general(rng);
    const s = sima(f.szoveg);
    const vart = kulcsok.find(([, re]) => re.test(s))[0];
    const m = f.mezok[0];
    assert.equal(m.opciok.find((o) => o.helyes).szoveg, vart, s);
    assert.equal(m.opciok.length, 6);
    lattak.add(vart);
    for (const [k, o] of m.opciok.entries()) if (!o.helyes) {
      const r = ellenoriz(m, String(k));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.ellenproba, /^Ellenpróba: /);
    }
  }
  assert.equal(lattak.size, 6);
  assert.equal(tipus('D8').tesztbe, false);
  assert.equal(tipus('D1').tesztbe, false, 'az optimista elv nem kerül a próbatesztbe');
});

test('a táblázat HTML-je: fejléc, sorok, kiemelések; a szöveg számai szóközzel elválasztva olvashatók', () => {
  const html = tablaHtml({ sorok: ['a', 'b'], oszlopok: ['x', 'y', 'z'], E: [[1, -2, 3], [4, 5, 6]] }, { kiemelt: new Set(['0,2']), valasztott: new Set([1]), extra: ['3', '6'], extraCim: 'max' });
  assert.match(html, /<td class="kiemelt">3<\/td>/);
  assert.match(html, /<tr class="valasztott"><th scope="row">b<\/th>/);
  assert.match(html, /−2/);
  assert.ok(/<td>1<\/td> <td>/.test(html));
  assert.equal(sima(html).includes('−2'), true);
});

test('a SPEC példái: a gabonás és a kertes táblázat összes döntése', () => {
  const sz = tema.peldak.map((p) => p.lepesek.join(' ')).join(' ');
  for (const v of ['napraforgó', 'lucerna', '14 · 11 · 16 · 17', 'búza', '5 · 17/3 · 4 · 17/3', 'búza vagy rizs', '9,1 · 6,9 · 4 · 4,9', '−0,8 · 1,8 · 4 · 4', 'lucerna vagy rizs',
    'borsó', 'paradicsom', '450', '230', '238 · 219 · 158 · 260,5', '120 · 150 · 250 · 100', '134 · 174 · 116 · 149']) assert.ok(sz.includes(v), v);
  assert.ok(tema.peldak.every((p) => /<table class="tabla dontes">/.test(p.abra())));
});
