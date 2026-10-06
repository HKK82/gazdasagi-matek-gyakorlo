// SPEC 3.2 – minden feladattípushoz (mind a 4 témában): „Miért így?” magyarázat, számszerű
// ellenpróba a hibás válaszokhoz, és kérdés formájú első tipp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz } from '../js/lib/szam.js';
import { ellenoriz, valasztoMezo } from '../js/lib/ellenorzo.js';
import { FELVETELI_TEMAK } from '../js/temak/index.js';
import { sima, szamok } from './segito.js';
import { evben } from '../js/temak/seged.js';

const MINTA = 120;
const mondatSzam = (szoveg) => (sima(szoveg).match(/[.!?](?=\s|$)/g) || []).length;
const tiszta = (v) => !/NaN|undefined|Infinity|\[object/.test(String(v));

const NBSP = /\u00a0/g;
const normal = (s) => String(s).replace(NBSP, ' ');
const szamErtek = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));

// A számok után tilos a ragozás (pl. „6-ed”, „60-at”): a magyar toldalék a szám kiejtésétől függ, ezért
// a szövegek kerülik (kivétel: 0, 1 és 100, ahol a toldalék egyértelmű: „1-et”, „0-ból”, „100-ból”). Kiírt mértékegység után
// sem állhat kötőjeles toldalék („perc-ot”, „óra-nak”).
const SZAM_RAGOZAS = /(?<![\d,.])(\d+)-(ed|ad|et|at|ot|ból|ből|ba|be|ban|ben|nak|nek|ra|re|ért|val|vel|tal|tel)(?![\p{L}])/gu;
const EGYSEG_RAGOZAS = /\b(perc|óra|liter|tonna|hónap)-\p{L}+/u;
const rosszRagozas = (szoveg) => {
  const t = sima(szoveg);
  for (const m of t.matchAll(SZAM_RAGOZAS)) {
    if (['0', '1', '100'].includes(m[1]) || ['2023-ban', '2024-ben'].includes(m[0])) continue;
    if (/^(19|20)\d\d$/.test(m[1]) && ['ban', 'ben'].includes(m[2]) && evben(Number(m[1])) === m[0]) continue; // évszám: a toldalék a kiejtés szerint helyes
    return m[0];
  }
  return t.match(EGYSEG_RAGOZAS)?.[0] || null;
};

for (const tema of FELVETELI_TEMAK) {
  for (const tipus of tema.tipusok) {
    test(`${tema.id} / ${tipus.id} – ${tipus.nev}: magyarázat, ellenpróba, rávezető tipp`, () => {
      const rng = ujRng(31000 + tipus.id.charCodeAt(0) * 100 + Number(tipus.id.slice(1)));
      for (let i = 0; i < MINTA; i++) {
        const f = tipus.general(rng);
        const nev = `${tipus.id}: ${sima(f.szoveg)}`;

        // ---- 1. „Miért így?” ----
        assert.ok(Array.isArray(f.magyarazat) && f.magyarazat.length >= 3, `van magyarázat – ${nev}`);
        const szoveg = f.magyarazat.join(' ');
        for (const p of f.magyarazat) assert.ok(p.trim().length > 20, 'nem üres bekezdés');
        assert.ok(tiszta(szoveg), `nincs NaN/undefined a magyarázatban – ${nev}`);
        const db = mondatSzam(szoveg);
        const maximum = tipus.id === 'T10' ? 18 : 14;
        assert.ok(db >= 4 && db <= maximum, `a magyarázat 4–${maximum} mondat (most ${db}) – ${nev}`);
        assert.match(sima(szoveg), /Józan ésszel/, `józan ész ellenőrzés – ${nev}`);
        assert.equal(rosszRagozas(szoveg), null, `hibás ragozás a magyarázatban (${rosszRagozas(szoveg)}) – ${nev}`);
        // a feladat konkrét számaival: a szövegből vagy a helyes válaszokból legalább egy szerepel
        const sz = normal(sima(szoveg));
        const feladatSzamok = szamok(f.szoveg).map((v) => formaz(v, 2));
        const valaszok = f.mezok.filter((m) => m.tipus === 'szam').map((m) => formaz(m.helyes, m.tizedes));
        const talalat = [...feladatSzamok, ...valaszok].some((s) => sz.includes(s));
        assert.ok(talalat || f.mezok.every((m) => m.tipus === 'valasztas'), `a magyarázat a feladat számaival – ${nev}`);
        // a képletes levezetés megmarad, a magyarázat kiegészíti
        assert.ok(f.megoldas.length >= 1);

        // ---- 2. rávezető első tipp: kérdés ----
        assert.ok(f.tippek.length >= 2 && f.tippek.length <= 3, 'lépcsőzetes tipp');
        assert.ok(f.tippek[0].trim().endsWith('?'), `az első tipp kérdés – ${nev}: „${f.tippek[0]}”`);
        for (const t of f.tippek) assert.ok(tiszta(t) && rosszRagozas(t) === null, `tipp: ${t}`);

        // ---- 3. számszerű ellenpróba ----
        for (const m of f.mezok) {
          if (m.tipus === 'valasztas') {
            for (const o of m.opciok.filter((x) => !x.helyes && x.uzenet)) {
              assert.ok(o.ellenproba && o.ellenproba.length > 20, `a választós hibához is van ellenpróba – ${nev}`);
              assert.ok(tiszta(o.ellenproba));
              const r = ellenoriz(m, String(m.opciok.indexOf(o)));
              assert.equal(r.allapot, 'tipikus');
              assert.equal(r.ellenproba, o.ellenproba);
            }
            continue;
          }
          assert.equal(typeof m.ellenproba, 'function', `minden számmezőnek van ellenpróbája – ${nev} / ${m.cimke}`);
          const probaSzamok = [...m.hibak.map((h) => h.ertek), m.helyes * 1.37 + 3.1];
          for (const ertek of probaSzamok) {
            const be = formaz(ertek, Math.max(m.tizedes, 2));
            const r = ellenoriz(m, be);
            if (r.allapot !== 'tipikus' && r.allapot !== 'rossz') continue; // véletlenül helyes / előjelhiba
            assert.ok(r.ellenproba && r.ellenproba.startsWith('Ellenpróba:'), `ellenpróba a ${be} válaszra – ${nev} / ${m.cimke}`);
            assert.ok(tiszta(r.ellenproba), `tiszta ellenpróba: ${r.ellenproba}`);
            // a hallgató saját számával számol: az ellenpróba szövegében szerepel a beírt szám
            const v = szamErtek(be);
            const sajat = [formaz(v, m.tizedes), formaz(v, 2), formaz(v, 4), formaz(v, 0)].map(normal);
            assert.ok(sajat.some((s) => normal(r.ellenproba).includes(s)),
              `az ellenpróba a beírt számmal (${be}) számol: ${r.ellenproba}`);
            assert.equal(rosszRagozas(r.ellenproba), null, `ragozás: ${r.ellenproba}`);
          }
        }
      }
    });
  }
}

