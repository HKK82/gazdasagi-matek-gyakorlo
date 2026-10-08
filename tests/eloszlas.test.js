// js/lib/eloszlas.js: a SPEC 5.8–5.9 ellenőrzött értékei (4 tizedesre; a határok 2–3 tizedesre).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/lib/eloszlas.js';
import { kerekit } from '../js/lib/szam.js';

const ell = (nev, kapott, vart, d = 4) => assert.equal(kerekit(kapott, d), vart, `${nev}: ${kapott} ≠ ${vart}`);

test('kombináció és alapok', () => {
  assert.equal(E.kombinacio(4, 2), 6);
  assert.equal(E.kombinacio(32, 8), 10518300);
  assert.equal(E.kombinacio(28, 6) * E.kombinacio(4, 2), 2260440);
  assert.equal(E.kombinacio(5, 7), 0);
  assert.equal(E.kombinacio(200, 100) > 1e58, true);
});

test('hipergeometrikus – kártya, tulipán, tétel, boríték (SPEC 5.8, 1–3. és 6. példa)', () => {
  ell('2 ász', E.hiperPmf(32, 4, 8, 2), 0.2149);
  ell('módusz valószínűsége', E.hiperPmf(32, 4, 8, 1), 0.4503);
  assert.deepEqual(E.hiperModuszok(32, 4, 8), [1]);
  ell('piros, X ≥ 3', 1 - E.hiperCdf(32, 8, 8, 2), 0.3085);
  assert.equal(E.hiperVarhato(32, 8, 8), 2);
  ell('σ', E.hiperSzoras(32, 8, 8), 1.0776);
  ell('1 ≤ X ≤ 3', E.hiperTartomany(32, 8, 8, 1, 3), 0.8478);
  ell('5 sárga', E.hiperPmf(30, 12, 10, 5), 0.2259);
  ell('piros X ≥ 7', 1 - E.hiperCdf(30, 18, 10, 6), 0.35);
  ell('piros X ≤ 5', E.hiperCdf(30, 18, 10, 5), 0.3441);
  ell('sárga σ', E.hiperSzoras(30, 12, 10), 1.2865);
  ell('sárga 3–5', E.hiperTartomany(30, 12, 10, 3, 5), 0.7647);
  ell('tétel, legalább 2', 1 - E.hiperCdf(18, 14, 3, 1), 0.8922);
  ell('tétel, 10 megtanult', 1 - E.hiperCdf(18, 10, 3, 1), 0.5882);
  ell('boríték visszatevés nélkül', E.hiperPmf(100, 24, 8, 2), 0.3242);
  ell('boríték visszatevéssel', E.binomPmf(8, 0.24, 2), 0.3108);
  ell('25 boríték', E.hiperPmf(25, 6, 8, 2), 0.3763);
  // a támasz szélén kívül 0
  assert.equal(E.hiperPmf(10, 8, 5, 1), 0);
  assert.equal(E.hiperPmf(10, 3, 5, 4), 0);
});

test('binomiális – kártya, születés, selejt (SPEC 5.8, 4., 5., 7. példa)', () => {
  ell('5 húzás, 3 piros', E.binomPmf(5, 0.25, 3), 0.0879);
  ell('8 húzás, legfeljebb 3', E.binomCdf(8, 0.25, 3), 0.8862);
  ell('ász, X ≥ 2', 1 - E.binomCdf(12, 0.125, 1), 0.4533);
  assert.deepEqual(E.binomModuszok(12, 0.125), [1]);
  assert.equal(E.binomVarhato(16, 0.125), 2);
  ell('σ', E.binomSzoras(16, 0.125), 1.3229);
  ell('0–4', E.binomTartomany(16, 0.125, 0, 4), 0.9593);
  ell('fiú is, lány is', E.binomTartomany(4, 0.45, 1, 3), 0.8675);
  ell('5 gyermek, 3–5 fiú', E.binomTartomany(5, 0.45, 3, 5), 0.4069);
  assert.equal(E.binomVarhato(10, 0.55), 5.5);
  ell('lány X ≥ 6', 1 - E.binomCdf(10, 0.55, 5), 0.5044);
  ell('nincs lány', E.binomPmf(8, 0.55, 0), 0.0017);
  ell('van hibás', 1 - E.binomPmf(20, 0.08, 0), 0.8113);
  ell('legfeljebb 1', E.binomCdf(15, 0.08, 1), 0.6597);
  ell('módusz 0', E.binomPmf(10, 0.08, 0), 0.4344);
  assert.deepEqual(E.binomModuszok(10, 0.08), [0]);
  ell('σ (25)', E.binomSzoras(25, 0.08), 1.3565);
  ell('0–4 (25)', E.binomTartomany(25, 0.08, 0, 4), 0.9549);
  // az eloszlás összege 1
  let ossz = 0; for (let k = 0; k <= 30; k++) ossz += E.binomPmf(30, 0.37, k);
  assert.ok(Math.abs(ossz - 1) < 1e-12);
});

test('binomiális és hipergeometrikus – a munkafüzet további feladatai (SPEC 5.8, 8. példa)', () => {
  ell('bonbon módusz', E.hiperPmf(12, 5, 3, 1), 0.4773);
  ell('kávés X ≤ 1', E.hiperCdf(12, 7, 3, 1), 0.3636);
  ell('csak kávés', E.hiperPmf(12, 7, 3, 3), 0.1591);
  assert.equal(E.hiperVarhato(12, 7, 3), 1.75);
  ell('facebook 32, legalább 16', 1 - E.binomCdf(32, 0.4, 15), 0.1648);
  ell('facebook 30, X ≥ 14', 1 - E.binomCdf(30, 0.4, 13), 0.2855);
  ell('facebook 25, X ≤ 8', E.binomCdf(25, 0.4, 8), 0.2735);
  assert.deepEqual(E.binomModuszok(25, 0.4), [10]);
  ell('mentők 3–5', E.binomTartomany(30, 0.15, 3, 5), 0.5592);
  ell('mentők X ≤ 2', E.binomCdf(20, 0.15, 2), 0.4049);
  ell('indokolt módusz', E.binomPmf(24, 0.85, 21), 0.2251);
  assert.deepEqual(E.binomModuszok(24, 0.85), [21]);
  ell('tojás, csak friss', E.binomPmf(6, 0.9, 6), 0.5314);
  ell('tojás, legalább 2 régi', 1 - E.binomCdf(10, 0.1, 1), 0.2639);
  ell('tojás, van régi', 1 - E.hiperPmf(15, 2, 4, 0), 0.4762);
  ell('tojás, legfeljebb 1 régi', E.hiperCdf(20, 3, 6, 1), 0.7982);
});

test('hibafüggvény, normális eloszlásfüggvény: abszolút hiba < 10⁻⁷', () => {
  const tabla = [[0, 0.5], [1, 0.8413447460685429], [-1, 0.15865525393145707], [1.96, 0.9750021048517795], [2, 0.9772498680518208],
    [-2.5, 0.006209665325776132], [3, 0.9986501019683699], [-4, 0.00003167124183311992], [0.5, 0.6914624612740131]];
  for (const [z, vart] of tabla) assert.ok(Math.abs(E.standardF(z) - vart) < 1e-9, `Φ(${z})`);
  assert.ok(Math.abs(E.erf(0.5) - 0.5204998778130465) < 1e-12);
  assert.equal(E.erf(8), 1);
  assert.equal(E.erf(-8), -1);
  assert.ok(Math.abs(E.normalisSuruseg(0) - 0.3989422804014327) < 1e-12);
  // szimmetria és monotonitás
  for (let z = -4; z <= 4; z += 0.25) assert.ok(Math.abs(E.standardF(z) + E.standardF(-z) - 1) < 1e-14);
});

test('normális – paradicsom, ásványvíz, szelet, narancslé, víz, alma (SPEC 5.9)', () => {
  const F = E.normalisF, K = E.kvantilis;
  // 1. paradicsom N(160; 10)
  ell('< 160', F(160, 160, 10), 0.5);
  ell('> 175', 1 - F(175, 160, 10), 0.0668);
  ell('±1,85σ', E.normalisTartomany(141.5, 178.5, 160, 10), 0.9357);
  ell('több mint 12 g', 1 - E.normalisTartomany(148, 172, 160, 10), 0.2301);
  ell('90 % nagyobb', K(0.1, 160, 10), 147.18, 2);
  ell('35 % kisebb', K(0.35, 160, 10), 156.15, 2);
  ell('80 % alsó', K(0.1, 160, 10), 147.2, 1);
  ell('80 % felső', K(0.9, 160, 10), 172.8, 1);
  // 2. ásványvíz N(200; 5)
  ell('> 198', 1 - F(198, 200, 5), 0.6554);
  ell('< 201', F(201, 200, 5), 0.5793);
  ell('195–205', E.normalisTartomany(195, 205, 200, 5), 0.6827);
  ell('2σ-nál több', 1 - E.normalisTartomany(190, 210, 200, 5), 0.0455);
  // 3. Balaton szelet N(25; 1,5)
  ell('> 24', 1 - F(24, 25, 1.5), 0.7475);
  ell('23–27', E.normalisTartomany(23, 27, 25, 1.5), 0.8176);
  ell('90 % kisebb', K(0.9, 25, 1.5), 26.92, 2);
  ell('40 % nagyobb', K(0.6, 25, 1.5), 25.38, 2);
  // 4. narancslé N(20; 0,5)
  ell('±1,8σ', E.normalisTartomany(19.1, 20.9, 20, 0.5), 0.9281);
  ell('70 % kevesebb', K(0.7, 20, 0.5), 20.26, 2);
  ell('90 % több', K(0.1, 20, 0.5), 19.36, 2);
  ell('95 % alsó', K(0.025, 20, 0.5), 19.02, 2);
  ell('95 % felső', K(0.975, 20, 0.5), 20.98, 2);
  ell('98 % alsó', K(0.01, 20, 0.5), 18.84, 2);
  ell('98 % felső', K(0.99, 20, 0.5), 21.16, 2);
  ell('98 % z', E.standardKvantilis(0.99), 2.33, 2);
  // 5. vízfogyasztás N(1; 0,3)
  ell('0,8–1,2', E.normalisTartomany(0.8, 1.2, 1, 0.3), 0.495);
  ell('±0,1', E.normalisTartomany(0.9, 1.1, 1, 0.3), 0.2611);
  ell('90 % alsó', K(0.05, 1, 0.3), 0.507, 3);
  ell('90 % felső', K(0.95, 1, 0.3), 1.493, 3);
  ell('96 % alsó', K(0.02, 1, 0.3), 0.384, 3);
  ell('96 % felső', K(0.98, 1, 0.3), 1.616, 3);
  ell('96 % z', E.standardKvantilis(0.98), 2.054, 3);
  // 6. alma N(28; 8)
  ell('több mint 10 dkg', 1 - E.normalisTartomany(18, 38, 28, 8), 0.2113);
  ell('kevesebb mint 1,7σ', E.normalisTartomany(28 - 13.6, 28 + 13.6, 28, 8), 0.9109);
  ell('több mint 1,5σ', 1 - E.normalisTartomany(16, 40, 28, 8), 0.1336);
});

test('kvantilis: az eloszlásfüggvény inverze (körút), szélső értékek', () => {
  for (const p of [0.001, 0.01, 0.025, 0.05, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95, 0.975, 0.99, 0.999]) {
    assert.ok(Math.abs(E.standardF(E.standardKvantilis(p)) - p) < 1e-12, `p = ${p}`);
    assert.ok(Math.abs(E.normalisF(E.kvantilis(p, 160, 10), 160, 10) - p) < 1e-12);
  }
  assert.ok(Math.abs(E.standardKvantilis(0.975) - 1.959963984540054) < 1e-9);
  assert.equal(E.standardKvantilis(0.5), 0);
  assert.equal(E.standardKvantilis(0), -Infinity);
  assert.equal(E.standardKvantilis(1), Infinity);
});
