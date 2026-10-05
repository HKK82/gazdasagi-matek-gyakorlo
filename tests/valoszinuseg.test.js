// 7. téma – Valószínűség, várható érték: a helyes válaszokat a feladat szövegéből visszaolvasott
// számokból, a generátortól függetlenül újraszámoljuk; a tört alak és a tipikus hibák ellenőrzése.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz, kerekit, ertelmez } from '../js/lib/szam.js';
import { ellenoriz, egyezik, helyesE, szamMezo } from '../js/lib/ellenorzo.js';
import tema, * as V from '../js/temak/valoszinuseg.js';
import { sima } from './segito.js';

const MINTA = 300;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/** (x €, p valószínűség) párok a játék szövegéből: „56 € nyeremény 0,15 valószínűséggel”, „−11 € (veszteség) 0,1 valószínűséggel”. */
function jatekSzovegbol(szoveg) {
  const re = /(−?[\d ]+) €(?: nyeremény| \(veszteség\))? (\d,\d+) valószínűséggel/g;
  const X = [], P = [];
  for (const m of sima(szoveg).matchAll(re)) { X.push(szam(m[1])); P.push(szam(m[2])); }
  return { X, P };
}
const waysKartya = (s) => (/piros ász/.test(s) ? 1 : /figurás/.test(s) ? 16 : /piros színű/.test(s) ? 8 : /ász/.test(s) ? 4 : NaN);

const FUGGETLEN = {
  V1: (f) => {
    const s = sima(f.szoveg);
    let r;
    if ((r = s.match(/(\d+) lapos pakliban (\d+) nyerő lap/))) return [Number(r[2]) / Number(r[1])];
    if ((r = s.match(/az összeg (\d+)\?/))) { let db = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === Number(r[1])) db++; return [db / 36]; }
    if ((r = s.match(/hogy (.+?) lesz\?/))) return [waysKartya(r[1]) / 32];
    throw new Error('ismeretlen V1 szöveg: ' + s);
  },
  V2: (f) => {
    const s = sima(f.szoveg);
    let r;
    if ((r = s.match(/(\d) érmét dobunk/))) return [1 - 0.5 ** Number(r[1])];
    if ((r = s.match(/valószínűsége ([\d,]+)\. Mennyi az ellentétének/))) return [1 - szam(r[1])];
    if (/nem mindkét kockán/.test(s)) return [1 - 1 / 36];
    if ((r = s.match(/(\d+) lapos pakliban (\d+) nyerő lap van\. Egy lapot húzunk\. Mennyi a valószínűsége, hogy nem nyerőt/))) return [1 - Number(r[2]) / Number(r[1])];
    if ((r = s.match(/magyar kártyából egy lapot húzunk\. Mennyi a valószínűsége, hogy nem (.+?) lesz\?/))) return [1 - waysKartya(r[1].replace(/^piros$/, 'piros színű')) / 32];
    throw new Error('ismeretlen V2 szöveg: ' + s);
  },
  V3: (f) => {
    const s = sima(f.szoveg);
    let r;
    if (/az elsőn \d, a másodikon \d lesz/.test(s)) return [1 / 36];
    if ((r = s.match(/az elsőben (\d+) lap, ebből (\d+) piros; a másodikban (\d+) lap, ebből (\d+) piros/))) return [(r[2] / r[1]) * (r[4] / r[3])];
    if ((r = s.match(/(\d+) lap van, ebből (\d+) nyerő\. Kétszer/))) return [(r[2] / r[1]) ** 2];
    throw new Error('ismeretlen V3 szöveg: ' + s);
  },
  V4: (f) => {
    const [, n, k, w, l, v] = sima(f.szoveg).match(/(\d+) lap van: (\d+) nyerő \(\+(\d+) €\) és (\d+) vesztő \(−(\d+) €\)/).map(Number);
    assert.equal(n, k + l);
    const p = k / n;
    return [2 * w, p * p, w - v, 2 * p * (1 - p), -2 * v, (1 - p) ** 2];
  },
  V5: (f) => { const r = sima(f.szoveg).match(/(\d+) lapos pakliból \((\d+) nyerő lap\)/); const p = r[2] / r[1]; return [p, (1 - p) * p, (1 - p) ** 2]; },
  V6: (f) => { const r = sima(f.szoveg).match(/Az elsőé ([\d,]+), a másodiké ([\d,]+) valószínűségű/); return [1 - szam(r[1]) - szam(r[2])]; },
  V7: (f) => { const { X, P } = jatekSzovegbol(f.szoveg); assert.equal(X.length, 3); assert.ok(close(P.reduce((a, b) => a + b, 0), 1)); return [kerekit(X.reduce((o, x, i) => o + x * P[i], 0), 2)]; },
  V9: (f) => { const { X, P } = jatekSzovegbol(f.szoveg); assert.equal(X.length, 3); return [X[P.indexOf(Math.max(...P))]]; },
};

for (const t of tema.tipusok.filter((x) => x.id !== 'V8')) {
  test(`valoszinuseg / ${t.id} – ${t.nev}: ${MINTA} generált feladat helyes`, () => {
    const rng = ujRng(9100 + Number(t.id.slice(1)));
    const szovegek = new Set();
    let vanTipikus = 0;
    for (let i = 0; i < MINTA; i++) {
      const f = t.general(rng);
      szovegek.add(f.szoveg);
      const nev = `${t.id}: ${sima(f.szoveg)}`;
      assert.ok(!/NaN|undefined|Infinity/.test(f.szoveg + f.megoldas.join() + f.magyarazat.join()), nev);
      const vart = FUGGETLEN[t.id](f);
      assert.equal(vart.length, f.mezok.length, nev);
      f.mezok.forEach((m, k) => {
        assert.ok(egyezik(vart[k], m.helyes, m.tizedes) || close(vart[k], m.helyes, 1e-9), `${nev} / ${m.cimke}: generált ${m.helyes}, újraszámolt ${vart[k]}`);
        if (m.tizedes === 4) assert.ok(m.helyes >= 0 && m.helyes <= 1, 'a valószínűség 0 és 1 között van');
        for (const be of [formaz(m.helyes, m.tizedes), formaz(m.helyes, m.tizedes).replace(',', '.').replace(/\s/g, '')]) assert.ok(helyesE(ellenoriz(m, be)), `„${be}” elfogadva – ${nev}`);
        for (const h of m.hibak) {
          assert.ok(!egyezik(h.ertek, m.helyes, m.tizedes), 'a hiba különbözik a jótól');
          const r = ellenoriz(m, formaz(h.ertek, Math.max(m.tizedes, 2)));
          if (r.allapot === 'tipikus') { assert.equal(r.uzenet, h.uzenet); vanTipikus++; }
        }
      });
      if (t.id === 'V4') assert.ok(close(f.mezok[1].helyes + f.mezok[3].helyes + f.mezok[5].helyes, 1, 1e-9), 'az eloszlás összege 1');
      if (t.id === 'V5') assert.ok(close(f.mezok.reduce((o, m) => o + m.helyes, 0), 1, 1e-9));
    }
    assert.ok(szovegek.size > MINTA * (t.id === 'V2' ? 0.1 : 0.3), `változatos feladatok (${szovegek.size})`);
    if (['V1', 'V3', 'V4', 'V7'].includes(t.id)) assert.ok(vanTipikus > MINTA * 0.5, `tipikus hibák (${vanTipikus})`);
  });
}

test('V8: a várható érték előjele dönt (kedvező / kedvezőtlen / igazságos), minden eset előfordul', () => {
  const rng = ujRng(9108);
  const lattak = new Set();
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V8').general(rng);
    const { X, P } = jatekSzovegbol(f.szoveg);
    const M = kerekit(X.reduce((o, x, j) => o + x * P[j], 0), 6);
    const m = f.mezok[0];
    const helyes = m.opciok.find((o) => o.helyes).szoveg;
    assert.equal(helyes, M > 0 ? 'a játékosnak kedvező' : M < 0 ? 'a játékosnak kedvezőtlen' : 'igazságos', sima(f.szoveg));
    lattak.add(helyes);
    for (const [k, o] of m.opciok.entries()) if (!o.helyes) { const r = ellenoriz(m, String(k)); assert.equal(r.allapot, 'tipikus'); assert.match(r.ellenproba, /^Ellenpróba: M\(X\) = /); }
  }
  assert.equal(lattak.size, 3);
});

test('V1–V3, V5: a tört alak (3/5, 1/16, 1/36) elfogadott, a tizedes tört is', () => {
  const rng = ujRng(9150);
  for (let i = 0; i < MINTA; i++) {
    const f1 = tipus('V1').general(rng);
    const s = sima(f1.szoveg);
    let r, tort;
    if ((r = s.match(/(\d+) lapos pakliban (\d+) nyerő lap/))) tort = `${r[2]}/${r[1]}`;
    else if ((r = s.match(/az összeg (\d+)\?/))) tort = `${6 - Math.abs(Number(r[1]) - 7)}/36`;
    else tort = `${waysKartya(s.match(/hogy (.+?) lesz\?/)[1])}/32`;
    assert.ok(helyesE(ellenoriz(f1.mezok[0], tort)), `${tort} elfogadva: ${s}`);
    assert.ok(helyesE(ellenoriz(f1.mezok[0], tort.replace('/', ' / '))), 'szóközös tört is jó');
    const f3 = tipus('V3').general(rng);
    if (/az elsőn \d, a másodikon \d lesz/.test(sima(f3.szoveg))) assert.ok(helyesE(ellenoriz(f3.mezok[0], '1/36')));
    const f5 = tipus('V5').general(rng);
    const [, n, k] = sima(f5.szoveg).match(/(\d+) lapos pakliból \((\d+) nyerő lap\)/).map(Number);
    assert.ok(helyesE(ellenoriz(f5.mezok[0], `${k}/${n}`)));
  }
});

test('az ellenőrző törtfeldolgozása: 3/5, 1/16, szóköz, negatív, hibás tört', () => {
  const m = szamMezo({ cimke: 'p', helyes: 0.6, tizedes: 4 });
  for (const be of ['3/5', '3 / 5', ' 3/5 ', '0,6', '0.6', '6/10', '0,6000']) assert.ok(helyesE(ellenoriz(m, be)), be);
  assert.ok(helyesE(ellenoriz(szamMezo({ cimke: 'p', helyes: 0.0625, tizedes: 4 }), '1/16')));
  assert.ok(helyesE(ellenoriz(szamMezo({ cimke: 'p', helyes: 1 / 3, tizedes: 4 }), '1/3')));
  assert.ok(helyesE(ellenoriz(szamMezo({ cimke: 'p', helyes: 1 / 36, tizedes: 4 }), '1/36')));
  assert.equal(ellenoriz(m, '3/4').allapot, 'rossz');
  assert.equal(ellenoriz(m, '2/0').allapot, 'ervenytelen');
  assert.equal(ellenoriz(m, '3/').allapot, 'ervenytelen');
  assert.equal(ellenoriz(m, '/5').allapot, 'ervenytelen');
  assert.equal(ertelmez('-1/3').ertek, -1 / 3);
  assert.equal(ertelmez('7/5').ertek, 1.4);
});

test('a valószínűség > 1 és a százalék alakban beírt érték célzott visszajelzést kap', () => {
  const rng = ujRng(9160);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V1').general(rng);
    const m = f.mezok[0];
    const [, kedvezo, osszes] = [0, ...(() => { const s = sima(f.szoveg); let r; if ((r = s.match(/(\d+) lapos pakliban (\d+) nyerő lap/))) return [Number(r[2]), Number(r[1])]; return [Math.round(m.helyes * (/32/.test(s) ? 32 : 36)), /32/.test(s) ? 32 : 36]; })()];
    const over = ellenoriz(m, formaz(osszes / kedvezo, 4));
    assert.equal(over.allapot, 'tipikus');
    assert.match(over.uzenet, /legfeljebb 1/);
    const szazalek = ellenoriz(m, formaz(m.helyes * 100, 2));
    assert.ok(['tipikus', 'jo-megjegyzes', 'jo'].includes(szazalek.allapot));
  }
  // „kedvező per nem kedvező” (2/18 a 2/20 helyett)
  const m = tipus('V1').general(ujRng(1)).mezok[0];
  assert.ok(m.hibak.some((h) => /Kedvező per összes/.test(h.uzenet)));
});

test('V2: a „fordított esemény” (két fej → két írás: 0,25) tipikus hiba a SPEC üzenetével', () => {
  const rng = ujRng(9102);
  let db = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V2').general(rng);
    const r = sima(f.szoveg).match(/(\d) érmét dobunk/);
    if (!r) continue;
    const mind = 0.5 ** Number(r[1]);
    const res = ellenoriz(f.mezok[0], formaz(mind, 4));
    assert.equal(res.allapot, 'tipikus');
    assert.match(res.uzenet, /A komplementer minden más/);
    db++;
  }
  assert.ok(db > 30);
});

test('V3: az összeadás tipikus hiba; V4: a vegyes eset egy sorrendje (p(1−p)) tipikus hiba; V5: „csak másodikra” → p', () => {
  const rng = ujRng(9103);
  for (let i = 0; i < MINTA; i++) {
    const f3 = tipus('V3').general(rng);
    const m3 = f3.mezok[0];
    const hiba = m3.hibak.find((h) => /Összeadás helyett szorozni kell/.test(h.uzenet));
    assert.ok(hiba, 'van összeadás-hiba');
    assert.equal(ellenoriz(m3, formaz(hiba.ertek, 4)).allapot, 'tipikus');
    const f4 = tipus('V4').general(rng);
    const [, n, k] = sima(f4.szoveg).match(/(\d+) lap van: (\d+) nyerő/).map(Number);
    const p = k / n;
    const r4 = ellenoriz(f4.mezok[3], formaz(p * (1 - p), 4));
    if (!egyezik(p * (1 - p), f4.mezok[3].helyes, 4)) { assert.equal(r4.allapot, 'tipikus'); assert.match(r4.uzenet, /Két sorrend/); }
    const f5 = tipus('V5').general(rng);
    const [, n5, k5] = sima(f5.szoveg).match(/(\d+) lapos pakliból \((\d+) nyerő lap\)/).map(Number);
    const r5 = ellenoriz(f5.mezok[1], formaz(k5 / n5, 4));
    assert.equal(r5.allapot, 'tipikus'); assert.match(r5.uzenet, /Másodszor csak akkor húz, ha elsőre vesztett/);
  }
});

test('V7: a veszteség pozitív előjele és az átlagolás valószínűségek nélkül felismert; a magyarázat „100 játék” szemléltetésű', () => {
  const rng = ujRng(9107);
  let neg = 0;
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V7').general(rng);
    const { X, P } = jatekSzovegbol(f.szoveg);
    const m = f.mezok[0];
    const abs = X.reduce((o, x, j) => o + Math.abs(x) * P[j], 0);
    if (X.some((x) => x < 0)) {
      if (!egyezik(abs, m.helyes, 2)) { const r = ellenoriz(m, formaz(abs, 2)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /veszteség negatív nyeremény/); neg++; }
    }
    const atlag = X.reduce((o, x) => o + x, 0) / 3;
    if (!egyezik(atlag, m.helyes, 2)) { const r = ellenoriz(m, formaz(atlag, 2)); assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Súlyozni kell a valószínűségekkel/); }
    const mag = sima(f.magyarazat.join(' '));
    assert.match(mag, /100 játékot játszunk/);
    assert.match(mag, /kb\. [\d,]+-szor kapunk/);
    // az előjeles válasz: a −x helyett +x előjelhiba
    const elojel = ellenoriz(m, formaz(-m.helyes, 2));
    if (m.helyes !== 0) assert.equal(elojel.allapot, 'tipikus');
  }
  assert.ok(neg > 100);
});

test('V9: a legnagyobb nyeremény és a legnagyobb valószínűség tipikus hiba', () => {
  const rng = ujRng(9109);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V9').general(rng);
    const { X, P } = jatekSzovegbol(f.szoveg);
    const m = f.mezok[0];
    const r = ellenoriz(m, String(Math.max(...X)));
    assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /a legvalószínűbb, nem a legnagyobb érték/);
    assert.equal(ellenoriz(m, formaz(Math.max(...P), 2)).allapot, 'tipikus');
  }
});

test('V6: a három valószínűség összege 1; az összeg és az egyik kivonása tipikus hiba', () => {
  const rng = ujRng(9106);
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('V6').general(rng);
    const [, p1, p2] = sima(f.szoveg).match(/Az elsőé ([\d,]+), a másodiké ([\d,]+)/).map(szam).map((x, j) => (j ? x : 0));
    const m = f.mezok[0];
    assert.ok(close(p1 + p2 + m.helyes, 1, 1e-9));
    assert.equal(ellenoriz(m, formaz(p1 + p2, 2)).allapot, p1 + p2 === m.helyes ? 'jo' : 'tipikus');
    assert.match(ellenoriz(m, formaz(1 - p1, 2)).ellenproba ?? 'Ellenpróba', /Ellenpróba/);
  }
});

test('ábrák: az eloszlás oszlopdiagramja a várható értékkel (V4, V7, V9), hibák nélkül', () => {
  const rng = ujRng(9200);
  for (const id of ['V4', 'V7', 'V9']) {
    for (let i = 0; i < 40; i++) {
      const f = tipus(id).general(rng);
      assert.ok(f.abraMegoldas, `${id}: van ábra`);
      assert.equal((f.abraMegoldas.match(/<rect class="abra-oszlop"/g) || []).length, 3, `${id}: 3 oszlop`);
      assert.match(f.abraMegoldas, /role="img"/);
      assert.ok(!/NaN|undefined|Infinity/.test(f.abraMegoldas), id);
      if (id !== 'V9') assert.match(f.abraMegoldas, /M\(X\) = /);
      if (id !== 'V9') assert.match(f.abraMegoldas, /class="abra-seged"/);
    }
  }
  assert.match(tema.peldak.find((p) => p.abra).abra(), /M\(X\) = 3,2/);
});

test('a SPEC példái: M(X) = 3,2; D(X) ≈ 9,7; −9; −10,4; 10,4; −6; −9,6', () => {
  assert.equal(kerekit(V.varhato([20, 6, -8], [0.16, 0.48, 0.36]), 2), 3.2);
  assert.equal(kerekit(V.szoras([20, 6, -8], [0.16, 0.48, 0.36]), 1), 9.7);
  assert.equal(kerekit(V.varhato([100, -10, -20], [0.05, 0.5, 0.45]), 2), -9);
  assert.equal(kerekit(V.varhato([40, 10, -50], [0.3, 0.21, 0.49]), 2), -10.4);
  assert.equal(kerekit(V.varhato([40, 20, -60], [0.52, 0.23, 0.25]), 2), 10.4);
  assert.equal(kerekit(V.varhato([24, 4, -16], [0.0625, 0.375, 0.5625]), 2), -6);
  assert.equal(kerekit(V.varhato([20, 15, -25], [0.2, 0.16, 0.64]), 2), -9.6);
  assert.equal(V.modusz([20, 6, -8], [0.16, 0.48, 0.36]), 6);
});
