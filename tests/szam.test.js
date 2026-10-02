import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ertelmez, formaz, formazFix, kerekit, szep } from '../js/lib/szam.js';

test('kerekít: fél felfelé, lebegőpontos zaj nélkül', () => {
  assert.equal(kerekit(9.666, 1), 9.7);
  assert.equal(kerekit(1.005, 2), 1.01);
  assert.equal(kerekit(9.65, 1), 9.7);
  assert.equal(kerekit(-2.5, 0), -3);
  assert.equal(kerekit(0.1 + 0.2, 2), 0.3);
  assert.equal(kerekit(122.2222, 1), 122.2);
});

test('szép szám: legfeljebb d tizedes', () => {
  assert.ok(szep(39.95, 2));
  assert.ok(szep(25 * 1.04, 2));
  assert.ok(szep(1.452 * 100 - 100, 1));
  assert.ok(!szep(1 / 3, 2));
  assert.ok(!szep(9.666, 1));
  assert.ok(szep(1069200, 0));
});

test('magyar formázás', () => {
  assert.equal(formaz(8.2), '8,2');
  assert.equal(formaz(26), '26');
  assert.equal(formaz(1069200), '1 069 200');
  assert.equal(formaz(3600), '3600');
  assert.equal(formaz(12000), '12 000');
  assert.equal(formaz(-2.8, 1), '−2,8');
  assert.equal(formaz(1 / 3, 2), '0,33');
  assert.equal(formaz(-0.0001, 2), '0');
  assert.equal(formazFix(39.9, 2), '39,90');
});

test('értelmezés: tizedesvessző és tizedespont', () => {
  assert.equal(ertelmez('8,2').ertek, 8.2);
  assert.equal(ertelmez('8.2').ertek, 8.2);
  assert.equal(ertelmez(' 0,15 ').ertek, 0.15);
  assert.equal(ertelmez(',5').ertek, 0.5);
  assert.equal(ertelmez('.5').ertek, 0.5);
});

test('értelmezés: szóköz mint ezres elválasztó', () => {
  assert.equal(ertelmez('1 069 200').ertek, 1069200);
  assert.equal(ertelmez('1 069 200').ertek, 1069200);
  assert.equal(ertelmez('12 480 $').ertek, 12480);
  assert.equal(ertelmez('1 069 200,5').ertek, 1069200.5);
  assert.equal(ertelmez('1.069.200').ertek, 1069200);
  assert.equal(ertelmez('12 34').hiba, 'ervenytelen');
});

test('értelmezés: mértékegység, % és pénznem levágása', () => {
  for (const [be, ki] of [
    ['8,2 %', 8.2], ['8,2%', 8.2], ['26 $', 26], ['$26', 26], ['47€', 47], ['€ 47', 47],
    ['1850 Ft', 1850], ['5,25 kg', 5.25], ['5 km', 5], ['7,5 liter', 7.5], ['22 év', 22],
    ['3,5 tonna', 3.5], ['3,5 t', 3.5], ['0,15 l/100 km', 0.15], ['3 $/kg', 3], ['9000 fő', 9000],
  ]) {
    assert.equal(ertelmez(be).ertek, ki, be);
  }
});

test('értelmezés: előjel, tört, „x =” alak', () => {
  assert.equal(ertelmez('-16').ertek, -16);
  assert.equal(ertelmez('−16 %').ertek, -16);
  assert.equal(ertelmez('– 4').ertek, -4);
  assert.equal(ertelmez('+35').ertek, 35);
  assert.ok(Math.abs(ertelmez('-1/3').ertek + 1 / 3) < 1e-12);
  assert.equal(ertelmez('x = 5').ertek, 5);
  assert.equal(ertelmez('m=-2').ertek, -2);
});

test('értelmezés: üres, képlet, értelmetlen', () => {
  assert.equal(ertelmez('').hiba, 'ures');
  assert.equal(ertelmez('   ').hiba, 'ures');
  assert.equal(ertelmez('=280/1,12').hiba, 'keplet');
  assert.equal(ertelmez('280/1,12').hiba, 'ervenytelen');
  assert.equal(ertelmez('2*3').hiba, 'keplet');
  assert.equal(ertelmez('abc').hiba, 'ervenytelen');
  assert.equal(ertelmez('1/0').hiba, 'ervenytelen');
});
