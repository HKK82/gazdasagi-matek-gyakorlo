import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ellenoriz, szamMezo, valasztoMezo, helyesE, egyezik, helyesValaszSzoveg } from '../js/lib/ellenorzo.js';

const allapot = (mezo, be) => ellenoriz(mezo, be).allapot;

test('tizedesvessző és -pont is jó', () => {
  const m = szamMezo({ cimke: 'x', helyes: 8.2, tizedes: 1 });
  assert.equal(allapot(m, '8,2'), 'jo');
  assert.equal(allapot(m, '8.2'), 'jo');
  assert.equal(allapot(m, '8,20'), 'jo');
});

test('mértékegység / % a válasz végén nem okoz hibát', () => {
  const m = szamMezo({ cimke: 'x', helyes: 8.2, tizedes: 1, egyseg: '%' });
  for (const be of ['8,2 %', '8,2%', '8.2 %']) assert.equal(allapot(m, be), 'jo', be);
  const p = szamMezo({ cimke: 'x', helyes: 1069200, tizedes: 0, egyseg: '€' });
  for (const be of ['1 069 200', '1069200 €', '1 069 200 €', '€1069200']) assert.equal(allapot(p, be), 'jo', be);
});

test('tűrés: kerekített érték vagy eltérés ≤ a pontosság fele; pontosabb válasz is jó', () => {
  const m = szamMezo({ cimke: 'x', helyes: 100 / 9, tizedes: 1 }); // 11,111…
  assert.equal(allapot(m, '11,1'), 'jo');
  assert.equal(allapot(m, '11,11'), 'jo');
  assert.equal(allapot(m, '11,111'), 'jo');
  assert.equal(allapot(m, '11'), 'rossz');
  assert.equal(allapot(m, '11,2'), 'rossz');
  const g = szamMezo({ cimke: 'x', helyes: 1160 / 120, tizedes: 1 }); // 9,666…
  assert.equal(allapot(g, '9,7'), 'jo');
  assert.equal(allapot(g, '9,67'), 'jo');
  assert.equal(allapot(g, '9,6'), 'rossz');
  assert.ok(egyezik(0.33, -(-1 / 3), 2));
  assert.ok(!egyezik(0.3, 1 / 3, 2));
});

test('előjel: „mennyivel csökkent” – a pozitív jó, a negatív is elfogadva megjegyzéssel', () => {
  const m = szamMezo({ cimke: 'x', helyes: 16, tizedes: 1, elojel: 'nagysag',
    elojelUzenet: 'A csökkenés mértéke 16 %; a kérdés „mennyivel csökkent”, ezért elég a 16.' });
  assert.equal(allapot(m, '16'), 'jo');
  const r = ellenoriz(m, '-16');
  assert.equal(r.allapot, 'jo-megjegyzes');
  assert.ok(helyesE(r));
  assert.match(r.uzenet, /elég a 16/);
  assert.equal(allapot(m, '−16 %'), 'jo-megjegyzes');
});

test('előjel: előjeles változásnál a negatív a jó, a pozitívra figyelmeztet', () => {
  const m = szamMezo({ cimke: 'x', helyes: -4, tizedes: 1, elojel: 'elojeles' });
  assert.equal(allapot(m, '-4'), 'jo');
  assert.equal(allapot(m, '−4 %'), 'jo');
  const r = ellenoriz(m, '4');
  assert.equal(r.allapot, 'tipikus');
  assert.match(r.uzenet, /előjel/);
  assert.ok(!helyesE(r));
});

test('sima mezőnél az ellentett előjel nem jó', () => {
  const m = szamMezo({ cimke: 'x', helyes: 35, tizedes: 1 });
  assert.equal(allapot(m, '-35'), 'rossz');
});

test('tipikus hiba felismerése célzott üzenettel', () => {
  const m = szamMezo({ cimke: 'x', helyes: 26, tizedes: 2, hibak: [{ ertek: 1, uzenet: 'Ez csak a növekedés' }] });
  const r = ellenoriz(m, '1');
  assert.equal(r.allapot, 'tipikus');
  assert.equal(r.uzenet, 'Ez csak a növekedés');
  // kerekítve beírt tipikus hiba is felismerhető
  const g = szamMezo({ cimke: 'x', helyes: 35, tizedes: 1, hibak: [{ ertek: 25.9259259, uzenet: 'Ki a 100 %?' }] });
  assert.equal(allapot(g, '25,9'), 'tipikus');
  assert.equal(allapot(g, '25,93'), 'tipikus');
});

test('a helyessel összetéveszthető „tipikus hiba” kiszűrődik', () => {
  const m = szamMezo({ cimke: 'x', helyes: 2, tizedes: 1, hibak: [
    { ertek: 1.96, uzenet: 'túl közel' }, { ertek: 50, uzenet: 'a' }, { ertek: 50.01, uzenet: 'duplikátum' },
  ] });
  assert.deepEqual(m.hibak.map((h) => h.uzenet), ['a']);
});

test('alternatív (közbülső kerekítésből adódó) érték is elfogadott', () => {
  const m = szamMezo({ cimke: 'x', helyes: 11.11, tizedes: 1, alternativ: [11.0909] });
  assert.equal(allapot(m, '11,1'), 'jo');
  assert.equal(allapot(m, '11,09'), 'jo');
});

test('üres, képlet és értelmezhetetlen válasz', () => {
  const m = szamMezo({ cimke: 'x', helyes: 250, tizedes: 2 });
  assert.equal(allapot(m, ''), 'ures');
  assert.equal(allapot(m, '=280/1,12'), 'ervenytelen');
  assert.match(ellenoriz(m, '=280/1,12').uzenet, /képlet/);
  assert.equal(allapot(m, 'kétszázötven'), 'ervenytelen');
});

test('feleletválasztós mező', () => {
  const v = valasztoMezo({ cimke: 'x', opciok: [
    { szoveg: 'A', helyes: false, uzenet: 'Fordított irány' }, { szoveg: 'B', helyes: true }, { szoveg: 'C', helyes: false },
  ] });
  assert.equal(allapot(v, '1'), 'jo');
  assert.equal(allapot(v, 1), 'jo');
  assert.equal(ellenoriz(v, '0').uzenet, 'Fordított irány');
  assert.equal(allapot(v, '0'), 'tipikus');
  assert.equal(allapot(v, '2'), 'rossz');
  assert.equal(allapot(v, ''), 'ures');
  assert.equal(helyesValaszSzoveg(v), 'B');
});

test('helyes válasz szövege', () => {
  assert.equal(helyesValaszSzoveg(szamMezo({ cimke: 'x', helyes: 9.666, tizedes: 1, egyseg: 'év' })), '9,7 év');
});
