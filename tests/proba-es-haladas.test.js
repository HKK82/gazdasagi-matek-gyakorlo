import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { tesztFeladatok, elosztas, TESZT_DB, TESZT_PERC } from '../js/lib/teszt-osszeallito.js';
import { TEMAK } from '../js/temak/index.js';
import * as haladas from '../js/lib/haladas.js';
import { ellenoriz, helyesValaszSzoveg } from '../js/lib/ellenorzo.js';
import { formaz } from '../js/lib/szam.js';

test('próbateszt: 10 feladat, 20 perc, arányos elosztás a 3 témából', () => {
  assert.equal(TESZT_DB, 10);
  assert.equal(TESZT_PERC, 20);
  for (let mag = 1; mag <= 200; mag++) {
    const rng = ujRng(mag);
    const db = elosztas(rng, 3, 10);
    assert.equal(db.reduce((a, b) => a + b, 0), 10);
    assert.deepEqual([...db].sort(), [3, 3, 4]);
    const lista = tesztFeladatok(ujRng(mag), TEMAK, 10);
    assert.equal(lista.length, 10);
    for (const t of TEMAK) {
      const n = lista.filter((x) => x.temaId === t.id).length;
      assert.ok(n === 3 || n === 4);
    }
    for (const { feladat } of lista) {
      assert.equal(feladat.mezok.length, 1, 'egyetlen számot kell beírni');
      assert.equal(feladat.mezok[0].tipus, 'szam');
      const m = feladat.mezok[0];
      assert.equal(ellenoriz(m, formaz(m.helyes, m.tizedes)).allapot, 'jo');
      assert.ok(helyesValaszSzoveg(m).length > 0);
    }
    // egy témán belül nincs ismétlődő típus
    for (const t of TEMAK) {
      const tip = lista.filter((x) => x.temaId === t.id).map((x) => x.tipusId);
      assert.equal(new Set(tip).size, tip.length);
    }
  }
});

test('próbateszt: újraindításkor új számok', () => {
  const a = tesztFeladatok(ujRng(1), TEMAK).map((x) => x.feladat.szoveg).join('|');
  const b = tesztFeladatok(ujRng(2), TEMAK).map((x) => x.feladat.szoveg).join('|');
  assert.notEqual(a, b);
});

function memoriaTarolo() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}

test('haladás: 3 egymás utáni jó után „megy”, hiba nullázza a sorozatot', () => {
  const t = memoriaTarolo();
  haladas.beallitTarolo(t);
  haladas.rogzit('szazalek', 'T1', true);
  haladas.rogzit('szazalek', 'T1', true);
  haladas.rogzit('szazalek', 'T1', false);
  assert.equal(haladas.megy('szazalek', 'T1'), false);
  haladas.rogzit('szazalek', 'T1', true);
  haladas.rogzit('szazalek', 'T1', true);
  haladas.rogzit('szazalek', 'T1', true);
  assert.equal(haladas.megy('szazalek', 'T1'), true);
  const a = haladas.tipusAllapot('szazalek', 'T1');
  assert.equal(a.jo, 5);
  assert.equal(a.probalt, 6);
  // újratöltés után is megvan
  haladas.beallitTarolo(t);
  assert.equal(haladas.megy('szazalek', 'T1'), true);
  const tema = TEMAK[0];
  assert.equal(haladas.temaSzazalek(tema), Math.round(100 / tema.tipusok.length));
});

test('haladás: a legjobb teszteredmény mentődik', () => {
  haladas.beallitTarolo(memoriaTarolo());
  assert.equal(haladas.legjobbTeszt(), null);
  assert.equal(haladas.tesztMentes(6, 10), true);
  assert.equal(haladas.tesztMentes(4, 10), false);
  assert.equal(haladas.legjobbTeszt().pont, 6);
  assert.equal(haladas.tesztMentes(9, 10), true);
  assert.equal(haladas.legjobbTeszt().szazalek, 90);
});

test('haladás: tároló nélkül és hibás tárolóval is működik', () => {
  haladas.beallitTarolo(null);
  haladas.rogzit('linearis', 'L1', true);
  assert.equal(haladas.tipusAllapot('linearis', 'L1').jo, 1);
  haladas.beallitTarolo({ getItem() { throw new Error('tiltva'); }, setItem() { throw new Error('tiltva'); } });
  haladas.rogzit('linearis', 'L1', true);
  assert.equal(haladas.tipusAllapot('linearis', 'L1').jo, 1);
  const rossz = memoriaTarolo();
  rossz.setItem('gmgy-haladas-v1', '{nem json');
  haladas.beallitTarolo(rossz);
  assert.equal(haladas.tipusAllapot('linearis', 'L1').jo, 0);
});
