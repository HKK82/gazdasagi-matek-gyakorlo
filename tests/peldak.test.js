// A SPEC 5. fejezetének kidolgozott példái: a végeredményeknek pontosan ki kell jönniük.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMAK } from '../js/temak/index.js';

for (const tema of TEMAK) {
  test(`${tema.cim}: a kidolgozott példák végeredményei egyeznek a SPEC-kel`, () => {
    const lista = tema.peldaEllenorzes();
    assert.ok(lista.length >= 8);
    for (const { nev, kapott, vart } of lista) {
      assert.ok(Math.abs(kapott - vart) < 1e-9, `${nev}: kapott ${kapott}, várt ${vart}`);
    }
  });

  test(`${tema.cim}: a téma adatai teljesek`, () => {
    assert.ok(tema.id && tema.cim && tema.rovid && tema.kulcskeplet);
    assert.ok(tema.elmelet.length >= 3 && tema.elmelet.length <= 8);
    assert.ok(tema.peldak.length >= 3);
    for (const p of tema.peldak) assert.ok(p.cim && p.feladat && p.lepesek.length >= 2);
    const idk = tema.tipusok.map((t) => t.id);
    assert.equal(new Set(idk).size, idk.length, 'egyedi típusazonosítók');
  });
}

test('a kidolgozott példák szövegében a SPEC végeredményei szerepelnek', () => {
  const szoveg = (id) => TEMAK.find((t) => t.id === id).peldak.map((p) => p.lepesek.join(' ')).join(' ');
  const sz = szoveg('szazalek');
  for (const v of ['26 $', '250 $', '35 %-kal nőtt', '138 $', '47 $', '16 %-kal csökkent', '45,2 %-kal nőtt', '25,2 %-kal csökkent', '9000', '6048', '8748', '−2,8 %', '990 000 €', '122,2 €', '+11,1 %']) {
    assert.ok(sz.includes(v), v);
  }
  const li = szoveg('linearis');
  for (const v of ['x = 5,25 kg', '400 $', 'x = 13 év', 'V(x) = −120x + 1160', '9,7 év', 'F(x) = 0,15x + 4,2', 'x = 22 év', 'y = 2x − 1', 'y = −⅓x + 2']) {
    assert.ok(li.includes(v), v);
  }
  const p = szoveg('penzugy');
  for (const v of ['86 400 Ft', '93 312 Ft', '100 777 Ft', '372 877 Ft', '123 967 Ft', '9 év', '4,5 %', '207 106 Ft',
    '118 810', '119 252', '119 562', '18,81 %', '19,25 %', '19,56 %', '19,72 %', '5 400 000 Ft', '8,5 %', '10 563 035 Ft', '7 év', '7 439 998 Ft', '12,68 %']) {
    assert.ok(p.includes(v), v);
  }
  const e = szoveg('exponencialis');
  for (const v of ['19', '18,05', '17,15', '1036 Ft', '≈ 5,93', '6 év', '11,9 év', '17,8 év', '69 év', '118,3', '2099-ben', '2003-ban', '+3,1 %/év', '12,0 millió tonna', '−0,64 %/év', '65,9 millió Ft']) {
    assert.ok(e.includes(v), v);
  }
  const g = szoveg('fuggvenyvizsgalat');
  for (const v of ['50 db, 24 000 €', '10 db (−8 000 €)', '10 &lt; x &lt; 50', '23,05', '67,6', '24–67 db', '41,2', '57,7', '42–57 db', '70 db, 19 500 €', '20 &lt; x &lt; 70', '52–84 db', '58–80 db', '50 db, 850 €/db', '19,1', '130,9', '20–130 db', '851,7', '867,8', '+16,1 €/db', '+1,9 %']) {
    assert.ok(g.includes(v), v);
  }
  const v7 = szoveg('valoszinuseg');
  for (const v of ['1/36', '0,16', '0,48', '0,36', '6 €', '3,2 €', '0,05', '0,45', '0,5', '−9 €', '0,3', '0,21', '0,49', '−10,4 €', '0,25', '10,4 €', '0,0625', '0,375', '0,5625', '−6 €', '0,2', '0,16', '0,64', '−9,6 €']) {
    assert.ok(v7.includes(v), v);
  }
  const k = szoveg('kozgazdasag');
  for (const v of ['x = 2,5 km', '2830 Ft', '2900 Ft', 'x = 5 km', '1850 Ft', 'x < 5 km', 'D(p) = −2p + 1500', '1100 liter', 'p = 150 Ft', 'x = 3 $/kg', '4 t', '12 000 $', '8750 $', '12 480 $']) {
    assert.ok(k.includes(v), v);
  }
});
