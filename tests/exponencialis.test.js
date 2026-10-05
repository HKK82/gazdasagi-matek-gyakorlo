// 5. téma – Exponenciális függvények: a helyes választ a feladat szövegéből visszaolvasott számokból,
// a generátortól függetlenül számoljuk újra; a tipikus hibák és a GeoGebra-sorok ellenőrzése.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { szep, formaz, kerekit } from '../js/lib/szam.js';
import { ellenoriz, egyezik, helyesE } from '../js/lib/ellenorzo.js';
import tema, * as E from '../js/temak/exponencialis.js';
import { sima, szamok } from './segito.js';

const MINTA = 300;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const nov = (szoveg) => /(?<![\p{L}])nő(?![\p{L}])/u.test(sima(szoveg));
const q = (p, szoveg) => 1 + ((nov(szoveg) ? 1 : -1) * p) / 100;
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));

const FUGGETLEN = {
  E1: (f) => { const [p] = szamok(f.szoveg); return [q(p, f.szoveg)]; },
  E2: (f) => {
    const n = szamok(f.szoveg);
    const [a, p, x] = n.length === 4 ? [n[1], n[2], n[3] - n[0]] : n;
    const v = a * q(p, f.szoveg) ** x;
    return [kerekit(v, Math.abs(v) >= 1000 ? 0 : 2)]; // a kért kerekítés: ezer fölött egész, alatta két tizedes
  },
  E3: (f) => {
    const s = sima(f.szoveg);
    const r = s.match(/= ([\d ,]+) · ([\d,]+)[xt]\./);
    const a = Number(r[1].replace(/\s/g, '').replace(',', '.')), qq = Number(r[2].replace(',', '.'));
    return { valasztas: qq > 1 ? 'növekvő' : 'csökkenő', 1: a, 2: (qq - 1) * 100 };
  },
  E4: (f) => {
    const [p] = szamok(f.szoveg);
    const qq = q(p, f.szoveg);
    return [Math.log(/duplázódik/.test(sima(f.szoveg)) ? 2 : 0.5) / Math.log(qq)];
  },
  E5: (f) => {
    const n = szamok(f.szoveg);
    const evbeli = /Melyik évben/.test(sima(f.szoveg));
    const [Y1, a, p, cel] = evbeli ? n : [0, ...n];
    const x = Math.log(cel / a) / Math.log(q(p, f.szoveg));
    return [evbeli ? Y1 + Math.ceil(x) : x];
  },
  E6: (f) => {
    const [Y1, a, Y2, b] = szamok(f.szoveg);
    return [kerekit(((b / a) ** (1 / (Y2 - Y1)) - 1) * 100, 1)];
  },
  E7: (f) => {
    const [Y1, a, Y2, b, Y3] = szamok(f.szoveg);
    return [a * (b / a) ** ((Y3 - Y1) / (Y2 - Y1))];
  },
  E8: (f) => {
    const [Y0, a1, p1, a2, p2] = szamok(f.szoveg);
    const x = Math.log(a1 / a2) / Math.log((1 + p2 / 100) / (1 + p1 / 100));
    return [x, Y0 + Math.ceil(x)];
  },
};

function ellenorizSzam(m, vart, nev) {
  assert.ok(Number.isFinite(vart), 'van várt érték');
  assert.ok(close(m.helyes, vart, 1e-9), `${nev}: generált ${m.helyes}, újraszámolt ${vart}`);
  for (const be of [formaz(m.helyes, m.tizedes), formaz(m.helyes, m.tizedes).replace(',', '.').replace(/\s/g, '')]) {
    assert.ok(helyesE(ellenoriz(m, be)), `„${be}” elfogadva (${nev})`);
  }
}

for (const t of tema.tipusok) {
  if (t.id === 'E9') continue;
  test(`exponencialis / ${t.id} – ${t.nev}: ${MINTA} generált feladat helyes`, () => {
    const rng = ujRng(9100 + Number(t.id.slice(1)));
    const szovegek = new Set();
    let vanTipikus = 0;
    for (let i = 0; i < MINTA; i++) {
      const f = t.general(rng);
      szovegek.add(f.szoveg);
      const nev = `${t.id}: ${sima(f.szoveg)}`;
      for (const v of szamok(f.szoveg)) assert.ok(szep(v, t.id === 'E3' ? 4 : 2), `szép szám a szövegben: ${v} – ${nev}`);
      assert.ok(!/NaN|undefined|Infinity/.test(f.szoveg + f.megoldas.join() + f.magyarazat.join()), nev);
      const vart = FUGGETLEN[t.id](f);
      f.mezok.forEach((m, k) => {
        if (m.tipus === 'valasztas') {
          assert.equal(m.opciok.filter((o) => o.helyes).length, 1);
          assert.equal(m.opciok.find((o) => o.helyes).szoveg, vart.valasztas, nev);
          return;
        }
        ellenorizSzam(m, Array.isArray(vart) ? vart[k] : vart[k], nev);
        for (const h of m.hibak) {
          assert.ok(!egyezik(h.ertek, m.helyes, m.tizedes), 'a hiba különbözik a jótól');
          const r = ellenoriz(m, formaz(h.ertek, Math.max(m.tizedes, 2)));
          if (r.allapot === 'tipikus') { assert.equal(r.uzenet, h.uzenet); vanTipikus++; }
        }
      });
    }
    assert.ok(szovegek.size > MINTA * (['E1', 'E4'].includes(t.id) ? 0.2 : 0.5), `változatos feladatok (${szovegek.size})`);
    if (['E1', 'E2', 'E4', 'E6'].includes(t.id)) assert.ok(vanTipikus > MINTA * 0.5, `tipikus hibák felismerése (${vanTipikus})`);
  });
}

test('E9: pontosan egy helyes opció, az x a kitevőben; a csalik felismert hibák', () => {
  const rng = ujRng(9199);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('E9').general(rng);
    const m = f.mezok[0];
    const csokkeno = /csökkenő/.test(sima(f.szoveg));
    const exp = (s) => sima(s).match(/^f\(x\) = ([\d,]+) · ([\d,]+)x$/);
    const jok = m.opciok.filter((o) => { const r = exp(o.szoveg); return r && (!csokkeno || Number(r[2].replace(',', '.')) < 1); });
    assert.equal(jok.length, 1, sima(f.szoveg) + ' | ' + m.opciok.map((o) => sima(o.szoveg)).join(' ; '));
    assert.equal(m.opciok.filter((o) => o.helyes).length, 1);
    assert.equal(sima(m.opciok.find((o) => o.helyes).szoveg), sima(jok[0].szoveg));
    for (const [k, o] of m.opciok.entries()) {
      if (o.helyes) continue;
      const r = ellenoriz(m, String(k));
      assert.equal(r.allapot, 'tipikus');
      assert.match(r.ellenproba, /^Ellenpróba: f\(/);
    }
    // a másodfokú csali üzenete a SPEC szerinti
    const masod = m.opciok.find((o) => /x2$/.test(sima(o.szoveg)));
    if (masod) assert.match(masod.uzenet, /az x az alap, nem a kitevő – ez másodfokú/);
  }
});

test('E1: a SPEC tipikus hibái (p/100, csökkenésnél 1 + p/100, rossz nullák) felismerve', () => {
  const rng = ujRng(9201);
  let nulla = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('E1').general(rng);
    const [p] = szamok(f.szoveg);
    const m = f.mezok[0], ir = nov(f.szoveg) ? 1 : -1;
    const eset = [[p / 100, /Ez csak a változás/], [1 - ir * p / 100, ir > 0 ? /Növekedésnél/ : /Csökkenésnél/], [1 + ir * p / 10, /kevesebb nullát/], [1 + ir * p / 1000, /több nullát/]];
    for (const [ertek, minta] of eset) {
      if (egyezik(ertek, m.helyes, 4)) continue;
      const r = ellenoriz(m, formaz(ertek, 4));
      assert.equal(r.allapot, 'tipikus', `${ertek} (p = ${p})`);
      assert.match(r.uzenet, minta);
      if (/nullát/.test(r.uzenet)) nulla++;
    }
  }
  assert.ok(nulla > 100);
  // a SPEC példái: 0,3 % csökkenés → 0,997; 12,4 % → 1,124
  assert.equal(E.szorzo(0.3, -1), 0.997);
  assert.equal(E.szorzo(12.4), 1.124);
});

test('E2: lineáris és „rossz kitevő” hibák, E5: lefelé kerekítés, E6: lineáris / teljes változás / kivonás', () => {
  const rng = ujRng(9202);
  for (let i = 0; i < MINTA; i++) {
    const f2 = tipus('E2').general(rng);
    const n = szamok(f2.szoveg);
    const [a, p, x] = n.length === 4 ? [n[1], n[2], n[3] - n[0]] : n;
    const ir = nov(f2.szoveg) ? 1 : -1;
    const lin = a * (1 + ir * x * p / 100);
    const m2 = f2.mezok[0];
    if (!egyezik(lin, m2.helyes, m2.tizedes)) assert.equal(ellenoriz(m2, formaz(lin, 2)).allapot, 'tipikus');
    const f6 = tipus('E6').general(rng);
    const [Y1, a6, Y2, b6] = szamok(f6.szoveg);
    const m6 = f6.mezok[0], n6 = Y2 - Y1;
    for (const rossz of [(b6 - a6) / n6, (b6 / a6 - 1) * 100]) {
      if (!egyezik(rossz, m6.helyes, 1)) assert.equal(ellenoriz(m6, formaz(rossz, 1)).allapot, 'tipikus');
    }
  }
});

test('E7: a kerekített szorzóval számolt érték (±0,5 %) elfogadott, megjegyzéssel', () => {
  const rng = ujRng(9207);
  let db = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('E7').general(rng);
    const [Y1, a, Y2, b, Y3] = szamok(f.szoveg);
    const m = f.mezok[0];
    const q3 = Math.round((b / a) ** (1 / (Y2 - Y1)) * 1000) / 1000;
    const kerekitett = b * q3 ** (Y3 - Y2);
    const r = ellenoriz(m, formaz(kerekitett, m.tizedes));
    if (Math.abs(kerekitett - m.helyes) <= 0.005 * m.helyes) { assert.ok(helyesE(r), `${kerekitett} vs ${m.helyes}`); db++; }
  }
  assert.ok(db > 50);
});

test('E5: évszámos feladatnál a „lefelé kerekítés” és a „kezdőév kimarad” hiba felismert (2099-es SPEC példa)', () => {
  const rng = ujRng(9205);
  let db = 0;
  for (let i = 0; i < 600 && db < 40; i++) {
    const f = tipus('E5').general(rng);
    if (!/Melyik évben/.test(sima(f.szoveg))) continue;
    const [Y1, a, p, cel] = szamok(f.szoveg);
    const x = Math.log(cel / a) / Math.log(q(p, f.szoveg));
    const m = f.mezok[0];
    assert.equal(ellenoriz(m, String(Y1 + Math.floor(x))).allapot, 'tipikus');
    assert.match(ellenoriz(m, String(Y1 + Math.floor(x))).uzenet, /Felfelé kell kerekíteni/);
    assert.equal(ellenoriz(m, String(Math.ceil(x))).allapot, 'tipikus');
    db++;
  }
  assert.equal(db, 40);
  // SPEC 4. példa: t ≈ 118,3 → 2099
  assert.equal(1980 + Math.ceil(E.idoig(10.7, 0.997, 7.5)), 2099);
});

test('GeoGebra-sorok: tizedespont, a beírt függvény egyezik a feladattal, nincs külső kérés', () => {
  const rng = ujRng(9300);
  for (const t of tema.tipusok.filter((x) => ['E2', 'E4', 'E5', 'E6', 'E7', 'E8'].includes(x.id))) {
    for (let i = 0; i < 100; i++) {
      const f = t.general(rng);
      assert.ok(f.geogebra && f.geogebra.sorok.length >= 2, `${t.id}: van GeoGebra-doboz`);
      for (const sor of f.geogebra.sorok) {
        assert.ok(!/\d,\d/.test(sor), `${t.id}: tizedespont kell, nem vessző: ${sor}`);
        assert.ok(!/http|www\./.test(sor));
      }
      if (t.id === 'E2') {
        const n = szamok(f.szoveg);
        const [a, p, x] = n.length === 4 ? [n[1], n[2], n[3] - n[0]] : n;
        const r = f.geogebra.sorok[0].match(/^f\(x\)=([\d.]+)\*([\d.]+)\^x$/);
        assert.ok(close(Number(r[1]), a) && close(Number(r[2]), q(p, f.szoveg), 1e-6));
        assert.equal(f.geogebra.sorok[1], `f(${x})`);
      }
      if (t.id === 'E8') {
        const [, a1, p1, a2, p2] = szamok(f.szoveg);
        assert.ok(f.geogebra.sorok[0].startsWith(`f(x)=${a1}*${1 + p1 / 100 > 0 ? String(Number((1 + p1 / 100).toFixed(6))) : ''}^x`));
        assert.equal(f.geogebra.sorok[2], 'Metszéspont(f, g)');
        assert.ok(f.geogebra.sorok[1].startsWith(`g(x)=${a2}*`));
      }
    }
  }
});

test('az ábrák: a megoldás után SVG a görbével és a keresett ponttal, szám- és tengelyfelirat nélküli hiba nélkül', () => {
  const rng = ujRng(9400);
  for (const id of ['E2', 'E4', 'E5', 'E8']) {
    for (let i = 0; i < 60; i++) {
      const f = tipus(id).general(rng);
      assert.ok(f.abraMegoldas, `${id}: van ábra`);
      assert.match(f.abraMegoldas, /<polyline class="abra-vonal/);
      assert.match(f.abraMegoldas, /<circle class="abra-pont"/);
      assert.match(f.abraMegoldas, /role="img"/);
      assert.ok(!/NaN|undefined|Infinity/.test(f.abraMegoldas), id);
    }
  }
  for (const p of tema.peldak.filter((x) => x.abra)) assert.ok(!/NaN|undefined/.test(p.abra()));
});

test('papíron is megoldható: az E4–E8 megoldásában a logaritmus / gyökvonás levezetése is szerepel', () => {
  const rng = ujRng(9500);
  for (const id of ['E4', 'E5', 'E6', 'E8']) {
    const f = tipus(id).general(rng);
    assert.match(f.megoldas.join(' ').replace(/<[^>]+>/g, ''), /lg|gyök|\^\(1\/|ˣ/, id);
  }
});
