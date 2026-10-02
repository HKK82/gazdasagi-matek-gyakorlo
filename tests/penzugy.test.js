// 4. téma – Pénzügyi számítások: a generált feladatok helyes válaszát a feladat SZÖVEGÉBŐL
// visszaolvasott számokból, a generátortól függetlenül számoljuk újra (a forintos és %-os válaszok
// kerekítettek, ezért a tűrés a kerekítés fele). A SPEC összes végeredménye és a fix feladatok is itt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { szep, formaz } from '../js/lib/szam.js';
import { ellenoriz, egyezik, helyesE } from '../js/lib/ellenorzo.js';
import penzugy, * as P from '../js/temak/penzugy.js';
import { sima, szamok } from './segito.js';

const MINTA = 300;
const tipus = (id) => penzugy.tipusok.find((t) => t.id === id);

/** Tőkésítések száma évente a szövegben szereplő szóból (a „negyedéves” a „féléves”/„havi” előtt, mert tartalmazza az „éves”-t). */
const gyakorisag = (szoveg) => {
  const s = sima(szoveg);
  if (/havi|havonta/.test(s)) return 12;
  if (/negyedéves|negyedévente/.test(s)) return 4;
  if (/féléves|félévente/.test(s)) return 2;
  throw new Error('nincs gyakoriság a szövegben: ' + s);
};
const kerek0 = (x) => Math.round(x);
const kerek = (x, d) => Math.round(x * 10 ** d + 1e-9) / 10 ** d;

// ---- független újraszámolás: { várt érték, megengedett eltérés } a (egyetlen) számmezőre ----
const FUGGETLEN = {
  P1: (f) => { const [PV, r, n] = szamok(f.szoveg); return PV * (1 + r / 100) ** n; },
  P2: (f) => { const [r, n, FV] = szamok(f.szoveg); return FV / (1 + r / 100) ** n; },
  P3: (f) => { const [PV, r, FV] = szamok(f.szoveg); return Math.log(FV / PV) / Math.log(1 + r / 100); },
  P4: (f) => { const [PV, n, FV] = szamok(f.szoveg); return ((FV / PV) ** (1 / n) - 1) * 100; },
  P5: (f) => {
    const [PV, r, honap] = szamok(f.szoveg);
    const m = gyakorisag(f.szoveg);
    return PV * (1 + r / (100 * m)) ** (honap / (12 / m));
  },
  P6: (f) => { const [r] = szamok(f.szoveg); const m = gyakorisag(f.szoveg); return ((1 + r / (100 * m)) ** m - 1) * 100; },
  P7: (f) => {
    const [x] = szamok(f.szoveg);
    return /névleges/.test(sima(f.szoveg)) ? 1 + x / (100 * gyakorisag(f.szoveg)) : 1 + x / 100;
  },
};
const FUGGETLEN_ALTIPUS = { P1: FUGGETLEN.P1, P2: FUGGETLEN.P2, P3: FUGGETLEN.P3, P4: FUGGETLEN.P4, P5: FUGGETLEN.P5, P6: FUGGETLEN.P6 };

/** A mező kerekítése a kért tizedesre → ennek egyeznie kell a generált helyes válasszal. */
function ellenorizHelyes(f, vart, m, alap) {
  if (m.tizedes === 0 && alap === 'P3') {
    // periódusszám: a FV kerekítése miatt pl. 3,9994 → 4
    assert.ok(Math.abs(vart - m.helyes) < 0.01, `periódusszám ${vart} ≈ ${m.helyes}: ${sima(f.szoveg)}`);
  } else if (alap === 'P4') {
    // kamatláb: a kerekített FV-ből visszaszámolva is a szép (egész vagy fél) érték jön ki
    assert.ok(Math.abs(vart - m.helyes) < 0.02, `kamatláb ${vart} ≈ ${m.helyes}: ${sima(f.szoveg)}`);
    assert.ok(Math.abs(m.helyes * 2 - Math.round(m.helyes * 2)) < 1e-9, 'a kamatláb egész vagy fél %');
  } else {
    assert.ok(Math.abs(kerek(vart, m.tizedes) - m.helyes) < 1e-9, `${alap}: ${vart} kerekítve ≠ ${m.helyes}: ${sima(f.szoveg)}`);
  }
}

for (const t of penzugy.tipusok) {
  test(`penzugy / ${t.id} – ${t.nev}: ${MINTA} generált feladat helyes`, () => {
    const rng = ujRng(7000 + Number(t.id.slice(1)));
    const szovegek = new Set();
    let vanTipikus = 0;
    for (let i = 0; i < MINTA; i++) {
      const f = t.general(rng);
      szovegek.add(f.szoveg);
      assert.equal(f.mezok.length, 1);
      const m = f.mezok[0];
      assert.equal(m.tipus, 'szam');
      assert.ok(!/NaN|undefined|Infinity/.test(f.szoveg + f.megoldas.join() + f.tippek.join() + f.magyarazat.join()), sima(f.szoveg));
      for (const v of szamok(f.szoveg)) assert.ok(szep(v, 2), `szép szám a szövegben: ${v}`);

      const alap = t.id === 'P8' ? f.alTipus : t.id;
      const fv = t.id === 'P8' ? FUGGETLEN_ALTIPUS[f.alTipus] : FUGGETLEN[t.id];
      assert.ok(fv, 'van független ellenőrzés');
      ellenorizHelyes(f, fv(f), m, alap);

      // írásmódok
      const kiirt = formaz(m.helyes, m.tizedes);
      for (const be of [kiirt, kiirt.replace(',', '.').replace(/ /g, ''), `${kiirt} ${m.egyseg || ''}`.trim()]) {
        assert.ok(helyesE(ellenoriz(m, be)), `„${be}” elfogadva`);
      }
      // a SPEC-szerinti ±1 Ft: megjegyzéssel elfogadott
      if (m.abszTures) {
        const r = ellenoriz(m, String(m.helyes + 1));
        assert.equal(r.allapot, 'jo-megjegyzes');
        assert.match(r.uzenet, /kerekítés/);
      }
      // tipikus hibák
      for (const h of m.hibak) {
        assert.ok(!egyezik(h.ertek, m.helyes, m.tizedes), 'a tipikus hiba különbözik a jótól');
        if (m.abszTures) assert.ok(Math.abs(h.ertek - m.helyes) > m.abszTures + 0.5, 'a tipikus hiba az elfogadási sávon kívül van');
        const r = ellenoriz(m, formaz(h.ertek, m.tizedes));
        assert.equal(r.allapot, 'tipikus', `tipikus hiba felismerve: ${h.ertek} – ${sima(f.szoveg)}`);
        assert.equal(r.uzenet, h.uzenet);
        vanTipikus++;
      }
    }
    assert.ok(vanTipikus > MINTA * 0.8, `tipikus hibák felismerése (${vanTipikus})`);
    // a P6/P7 paramétertere kicsi (névleges kamat × tőkésítés), ott kevesebb különböző szöveg is elég
    const minimum = ['P6', 'P7'].includes(t.id) ? MINTA * 0.25 : MINTA * 0.5;
    assert.ok(szovegek.size > minimum, `változatos feladatok (${szovegek.size})`);
  });
}

test('P1: minden feladatban ott van az egyszerű kamat mint felismert hiba; P3/P4 a lineáris becslés', () => {
  const rng = ujRng(11);
  for (let i = 0; i < 100; i++) {
    const f1 = tipus('P1').general(rng);
    const [PV, r, n] = szamok(f1.szoveg);
    const egyszeru = Math.round(PV * (1 + (n * r) / 100));
    assert.equal(ellenoriz(f1.mezok[0], String(egyszeru)).allapot, 'tipikus');
    const f3 = tipus('P3').general(rng);
    const [PV3, r3, FV3] = szamok(f3.szoveg);
    const lin = ((FV3 / PV3 - 1) * 100) / r3;
    assert.equal(ellenoriz(f3.mezok[0], formaz(lin, 0)).allapot, 'tipikus');
    const f4 = tipus('P4').general(rng);
    const [PV4, n4, FV4] = szamok(f4.szoveg);
    assert.equal(ellenoriz(f4.mezok[0], formaz(((FV4 / PV4 - 1) * 100) / n4, 1)).allapot, 'tipikus');
  }
});

test('P5/P7: a „rossz nullák” hibát (1,05 vagy 1,0005 a 1,005 helyett) felismeri', () => {
  const rng = ujRng(12);
  let db = 0;
  for (let i = 0; i < 300; i++) {
    const f = tipus('P7').general(rng);
    const [x] = szamok(f.szoveg);
    const nevl = /névleges/.test(sima(f.szoveg));
    const p = nevl ? x / gyakorisag(f.szoveg) : x;
    for (const rossz of [1 + p / 10, 1 + p / 1000]) {
      const r = ellenoriz(f.mezok[0], formaz(rossz, 4));
      if (egyezik(rossz, f.mezok[0].helyes, 4)) continue;
      assert.equal(r.allapot, 'tipikus', `${rossz} (p = ${p})`);
      assert.match(r.uzenet, /null/);
      db++;
    }
  }
  assert.ok(db > 300);
  // a SPEC példája: fél % → 1,005
  const f = P.katenyezo(6, 12);
  assert.equal(f, 1.005);
});

test('a kamatláb-/periódusszám-ellenőrzés a kerekített FV-ből visszaszámolt értékre is toleráns', () => {
  const rng = ujRng(13);
  for (let i = 0; i < 200; i++) {
    const f3 = tipus('P3').general(rng);
    const [PV, r, FV] = szamok(f3.szoveg);
    assert.equal(ellenoriz(f3.mezok[0], formaz(Math.log(FV / PV) / Math.log(1 + r / 100), 4)).allapot, 'jo');
    const f4 = tipus('P4').general(rng);
    const [PV4, n4, FV4] = szamok(f4.szoveg);
    assert.equal(ellenoriz(f4.mezok[0], formaz(((FV4 / PV4) ** (1 / n4) - 1) * 100, 4)).allapot, 'jo');
  }
  // a SPEC példája: 3,9994 → 4 év
  const mezo = tipus('P3').general(ujRng(1)).mezok[0];
  assert.equal(egyezik(3.9994, 4, mezo.tizedes), true);
});

test('a SPEC „tényleges kamatláb” táblázata és a határérték', () => {
  assert.equal(kerek(P.tenyleges(18, 1), 2), 18);
  assert.equal(kerek(P.tenyleges(18, 2), 2), 18.81);
  assert.equal(kerek(P.tenyleges(18, 4), 2), 19.25);
  assert.equal(kerek(P.tenyleges(18, 12), 2), 19.56);
  assert.equal(kerek(P.tenyleges(18, 1e6), 2), 19.72);
  assert.equal(kerek((Math.exp(0.18) - 1) * 100, 2), 19.72);
  // gyakoribb tőkésítés → nagyobb, de nem nő a végtelenségig
  assert.ok(P.tenyleges(18, 12) > P.tenyleges(18, 4) && P.tenyleges(18, 4) > P.tenyleges(18, 2));
  assert.ok(P.tenyleges(18, 365) < 19.73);
});

// ---- A SPEC fix feladatai: minden végeredménynek pontosan ki kell jönnie ----
const FIX_VART = {
  F1: [90306], F2: [172605], F3: [4], F4: [6.5], F5: [312194],
  F6: [433600, 434306, 434673, 434924, 8.58, 8.67, 8.73],
  F7: [5400000], F8: [8.5], F9: [10563035], F10: [7], F11: [7439998, 12.68],
};

test('a fix feladatok (feladatlap párosai, banki ajánlatok) végeredménye pontosan a SPEC szerinti', () => {
  assert.deepEqual(penzugy.fixek.map((x) => x.id), Object.keys(FIX_VART));
  for (const fx of penzugy.fixek) {
    const f = fx.epit();
    assert.equal(f.mezok.length, FIX_VART[fx.id].length, fx.id);
    f.mezok.forEach((m, k) => {
      assert.equal(m.helyes, FIX_VART[fx.id][k], `${fx.id} ${m.cimke}: ${m.helyes} ≠ ${FIX_VART[fx.id][k]}`);
      assert.ok(helyesE(ellenoriz(m, formaz(m.helyes, m.tizedes))), `${fx.id}: a helyes válasz elfogadva`);
    });
    assert.ok(f.tippek.length >= 2 && f.tippek.length <= 3, `${fx.id}: tippek`);
    assert.ok(f.tippek[0].trim().endsWith('?'), `${fx.id}: az első tipp kérdés`);
    assert.ok(f.magyarazat.length >= 3, `${fx.id}: van magyarázat`);
    assert.ok(f.megoldas.length >= 2 && f.jegyezze.length > 10);
  }
});

test('a fix feladatok szövegében szereplő számok a SPEC számai', () => {
  const szov = (id) => szamok(penzugy.fixek.find((x) => x.id === id).epit().szoveg);
  assert.deepEqual(szov('F1'), [50000, 3, 20]);
  assert.deepEqual(szov('F2'), [4, 5, 210000]);
  assert.deepEqual(szov('F3'), [800000, 3.5, 918000]);
  assert.deepEqual(szov('F4'), [700000, 5, 959061]);
  assert.deepEqual(szov('F5'), [300000, 9.6, 5]);
  assert.deepEqual(szov('F7'), [12, 6, 10658643]);
  assert.deepEqual(szov('F8'), [6000000, 4, 8315152]);
  assert.deepEqual(szov('F9'), [5000000, 9.8, 8]);
  assert.deepEqual(szov('F10'), [5800000, 10.2, 11447197]);
});

test('az elmélet ábrája: 21 oszlop (0–20 év), a kamatos és az egyszerű kamat végértéke szerepel', () => {
  const svg = penzugy.elmeletAbra().replace(/\u00a0/g, ' ');
  assert.equal((svg.match(/<rect class="abra-oszlop"/g) || []).length, 21 + 1, '21 oszlop + 1 jelmagyarázat-jel');
  assert.ok(svg.includes('372 877 Ft') && svg.includes('208 000 Ft'));
  assert.ok(svg.includes('<polyline'));
  assert.match(svg, /role="img"/);
  assert.ok(!/NaN|undefined/.test(svg));
});
