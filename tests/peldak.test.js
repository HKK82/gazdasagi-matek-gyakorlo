// A SPEC 5. fejezetének kidolgozott példái: a végeredményeknek pontosan ki kell jönniük.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FELVETELI_TEMAK } from '../js/temak/index.js';

for (const tema of FELVETELI_TEMAK) {
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

