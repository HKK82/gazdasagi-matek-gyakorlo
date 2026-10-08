// 9. téma – Normális eloszlás: a helyes válaszokat a feladat szövegéből visszaolvasott számokból, a generátortól
// és az eloszlas.js-től függetlenül (Simpson-integrálással és felezéssel) számoljuk újra.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz } from '../js/lib/szam.js';
import { ellenoriz, helyesE } from '../js/lib/ellenorzo.js';
import tema, { HELYZETEK } from '../js/temak/normalis.js';
import { sima } from './segito.js';

const MINTA = 250;
const tipus = (id) => tema.tipusok.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
const elfogad = (m, be) => helyesE(ellenoriz(m, be));

// ---- független számolás: Φ(z) Simpson-integrállal, kvantilis felezéssel ----
function Phi(z) {
  if (z < -9) return 0;
  if (z > 9) return 1;
  const n = 4000, a = -9, h = (z - a) / n;
  const g = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  let s = g(a) + g(z);
  for (let i = 1; i < n; i++) s += g(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}
const Fx = (x, mu, sg) => Phi((x - mu) / sg);
function Q(p, mu, sg) {
  let lo = -9, hi = 9;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; }
  return mu + sg * ((lo + hi) / 2);
}
const kozel = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

function alap(szoveg) {
  const s = sima(szoveg);
  const r = s.match(/átlaga ([\d,]+) (\S+), szórása ([\d,]+) /);
  return { s, mu: szam(r[1]), egyseg: r[2].replace(',', ''), sg: szam(r[3]) };
}

const SZAMOLO = {
  N1: ({ s, mu, sg }) => { const r = s.match(/(kevesebb|több) mint ([\d,]+) /); const a = szam(r[2]); const bal = Fx(a, mu, sg); return [r[1] === 'kevesebb' ? bal : 1 - bal]; },
  N2: ({ s, mu, sg }) => { const r = s.match(/hogy .*? ([\d,]+) és ([\d,]+) \S+ között van/); return [Fx(szam(r[2]), mu, sg) - Fx(szam(r[1]), mu, sg)]; },
  N3: ({ s, mu, sg }) => { const d = elt(s, sg); return [Fx(mu + d, mu, sg) - Fx(mu - d, mu, sg)]; },
  N4: ({ s, mu, sg }) => { const d = elt(s, sg); return [1 - (Fx(mu + d, mu, sg) - Fx(mu - d, mu, sg))]; },
  N5: () => [0],
  N6: ({ s, mu, sg }) => { const p = +s.match(/(\d+) % valószínűséggel kisebb/)[1] / 100; return [Q(p, mu, sg)]; },
  N7: ({ s, mu, sg }) => { const p = +s.match(/(\d+) % valószínűséggel nagyobb/)[1] / 100; return [Q(1 - p, mu, sg)]; },
  N8: ({ s, mu, sg }) => { const p = +s.match(/(\d+) % valószínűséggel esik/)[1] / 100; return [Q((1 - p) / 2, mu, sg), Q((1 + p) / 2, mu, sg), (Q((1 + p) / 2, mu, sg) - mu) / sg]; },
};
/** „legfeljebb 1,5 szórásnyi” vagy „legfeljebb 0,9 dl” → az eltérés mértékegységben */
function elt(s, sg) {
  const r = s.match(/(?:legfeljebb|több mint) ([\d,]+) (szórásnyi|\S+)\?/);
  return r[2] === 'szórásnyi' ? szam(r[1]) * sg : szam(r[1]);
}

for (const id of ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8']) {
  test(`normalis / ${id}: ${MINTA} generált feladat helyes (a szövegből újraszámolva)`, () => {
    const rng = ujRng(9200 + Number(id.slice(1)));
    const szovegek = new Set();
    for (let i = 0; i < MINTA; i++) {
      const f = tipus(id).general(rng);
      szovegek.add(f.szoveg);
      const nev = `${id}: ${sima(f.szoveg)}`;
      const o = alap(f.szoveg);
      const vart = SZAMOLO[id](o);
      assert.equal(vart.length, f.mezok.length, nev);
      f.mezok.forEach((m, k) => {
        const eps = m.tizedes === 4 ? 1e-6 : 0.0051;
        assert.ok(kozel(vart[k], m.helyes, eps), `${nev} / ${m.cimke}: generált ${m.helyes}, újraszámolt ${vart[k]}`);
        assert.ok(elfogad(m, formaz(vart[k], m.tizedes)), `elfogadva: ${formaz(vart[k], m.tizedes)} – ${nev}`);
        assert.ok(elfogad(m, formaz(vart[k], m.tizedes).replace(',', '.')), nev);
        if (m.tizedes === 4) {
          assert.ok(m.helyes >= 0 && m.helyes <= 1);
          // százalék alak (kivéve a 0-t, ahol nincs mit nézni) és ±0,0001
          const szaz = ellenoriz(m, formaz(Math.round(vart[k] * 1e6) / 1e4, 4));
          assert.ok(['jo', 'jo-megjegyzes'].includes(szaz.allapot), `százalék alak: ${nev} → ${szaz.allapot}`);
          if (id !== 'N5') assert.ok(elfogad(m, formaz(vart[k] + 0.00009, 6)) || vart[k] + 0.00009 > 1, nev);
        } else {
          assert.ok(elfogad(m, formaz(vart[k] + 0.009, 3)), `±0,01 tűrés a határokra – ${nev}`);
          assert.ok(!elfogad(m, formaz(vart[k] + 0.2, 2)), nev);
        }
        for (const h of m.hibak) {
          const r = ellenoriz(m, formaz(h.ertek, Math.max(m.tizedes, 2)));
          if (r.allapot === 'tipikus') assert.equal(r.uzenet, h.uzenet);
        }
      });
      assert.ok(f.geogebra && f.geogebra.sorok.length >= 1);
      for (const sor of f.geogebra.sorok) assert.ok(!/\d,\d/.test(sor) && !/http/.test(sor) && /^Normális · μ: /.test(sor), sor);
      assert.match(f.geogebra.megjegyzes, /Valószínűség-számítás/);
      assert.match(f.abraMegoldas, /<svg class="abra"/);
      assert.match(f.abraMegoldas, /abra-gorbe/);
      assert.ok(!/NaN|undefined|Infinity/.test(f.abraMegoldas + f.megoldas.join() + f.magyarazat.join()), nev);
      if (id !== 'N5') assert.match(f.abraMegoldas, /abra-terulet/, 'kiszínezett terület');
    }
    assert.ok(szovegek.size > ({ N5: 30, N6: 80, N7: 80, N8: 30 }[id] ?? MINTA * 0.5), `változatos feladatok (${szovegek.size})`);
  });
}

test('N1: a komplementer (rossz irány) célzott visszajelzést kap; N2: csak F(b) → „le kell vonni”; N5: bármi más → 0', () => {
  const rng = ujRng(9210);
  let n1 = 0, n2 = 0;
  for (let i = 0; i < MINTA; i++) {
    const f1 = tipus('N1').general(rng);
    const m1 = f1.mezok[0];
    const rossz = 1 - m1.helyes;
    if (Math.abs(rossz - m1.helyes) > 3e-4) {
      const r = ellenoriz(m1, formaz(rossz, 4));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Becsüljön/); assert.match(r.ellenproba, new RegExp(formaz(rossz, 4)));
      n1++;
    }
    const f2 = tipus('N2').general(rng);
    const s = sima(f2.szoveg);
    const [, , a, b] = s.match(/hogy .*? ([\d,]+) és ([\d,]+) \S+ között van/).map((x, j) => (j > 1 ? szam(x) : x)) && [0, 0, 0, 0];
    void a; void b;
    const o = alap(f2.szoveg);
    const r2 = s.match(/hogy .*? ([\d,]+) és ([\d,]+) \S+ között van/);
    const Fb = Fx(szam(r2[2]), o.mu, o.sg);
    if (Math.abs(Fb - f2.mezok[0].helyes) > 3e-4) {
      const r = ellenoriz(f2.mezok[0], formaz(Fb, 4));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /A b alatti részből le kell vonni az a alattit/); n2++;
    }
  }
  assert.ok(n1 > 200 && n2 > 200, `${n1} ${n2}`);
  const f5 = tipus('N5').general(rng);
  for (const be of ['0,5', '0,0123', '1', '0,3989']) {
    const r = ellenoriz(f5.mezok[0], be);
    assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Folytonos változónál egy konkrét érték valószínűsége 0/); assert.match(r.ellenproba, /^Ellenpróba: /);
  }
  assert.ok(elfogad(f5.mezok[0], '0') && elfogad(f5.mezok[0], '0,0000'));
});

test('N3: t·σ helyett t-vel számolt eltérés; N4: a középső rész és az egyik szél célzott hiba', () => {
  const rng = ujRng(9213);
  let tHiba = 0, kozepsoHiba = 0;
  for (let i = 0; i < 400; i++) {
    const f3 = tipus('N3').general(rng);
    const s3 = sima(f3.szoveg);
    const o3 = alap(f3.szoveg);
    const r3 = s3.match(/legfeljebb ([\d,]+) szórásnyi\?/);
    if (r3) {
      const t = szam(r3[1]);
      const rossz = Fx(o3.mu + t, o3.mu, o3.sg) - Fx(o3.mu - t, o3.mu, o3.sg);
      if (Math.abs(rossz - f3.mezok[0].helyes) > 3e-4) {
        const r = ellenoriz(f3.mezok[0], formaz(rossz, 4));
        assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /Előbb számolja ki a tényleges eltérést/); assert.match(r.uzenet, new RegExp(`${formaz(t, 2).replace('.', ',')} · ${formaz(o3.sg, 2)}`)); tHiba++;
      }
    }
    const f4 = tipus('N4').general(rng);
    const m4 = f4.mezok[0];
    const kozep = 1 - m4.helyes;
    if (Math.abs(kozep - m4.helyes) > 3e-4) {
      const r = ellenoriz(m4, formaz(kozep, 4));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.uzenet, /két szélső rész/); kozepsoHiba++;
    }
  }
  assert.ok(tHiba > 50 && kozepsoHiba > 300, `${tHiba} ${kozepsoHiba}`);
});

test('N6/N7: a rossz irány (kvantilis(1 − p)) célzott hiba; N8: az egy oldali (1 − p) kimaradás célzott hiba', () => {
  const rng = ujRng(9216);
  for (let i = 0; i < MINTA; i++) {
    const f6 = tipus('N6').general(rng);
    const o6 = alap(f6.szoveg);
    const p6 = +sima(f6.szoveg).match(/(\d+) % valószínűséggel kisebb/)[1] / 100;
    const r6 = ellenoriz(f6.mezok[0], formaz(Q(1 - p6, o6.mu, o6.sg), 2));
    assert.equal(r6.allapot, 'tipikus'); assert.match(r6.uzenet, /Kisebb értékekről van szó/);
    const f7 = tipus('N7').general(rng);
    const o7 = alap(f7.szoveg);
    const p7 = +sima(f7.szoveg).match(/(\d+) % valószínűséggel nagyobb/)[1] / 100;
    const r7 = ellenoriz(f7.mezok[0], formaz(Q(p7, o7.mu, o7.sg), 2));
    assert.equal(r7.allapot, 'tipikus'); assert.match(r7.uzenet, /Nagyobb értékekről van szó/);
    const f8 = tipus('N8').general(rng);
    const o8 = alap(f8.szoveg);
    const p8 = +sima(f8.szoveg).match(/(\d+) % valószínűséggel esik/)[1] / 100;
    const r8 = ellenoriz(f8.mezok[0], formaz(Q(1 - p8, o8.mu, o8.sg), 2));
    assert.equal(r8.allapot, 'tipikus'); assert.match(r8.uzenet, /A kimaradó rész fele alul, fele felül/);
  }
});

test('N9: a becslés választós feladatok jó választ jelölnek meg', () => {
  const rng = ujRng(9219);
  const latott = new Set();
  for (let i = 0; i < MINTA; i++) {
    const f = tipus('N9').general(rng);
    const s = sima(f.szoveg);
    const m = f.mezok[0];
    const helyes = m.opciok.find((o) => o.helyes).szoveg;
    assert.equal(m.opciok.filter((o) => o.helyes).length, 1);
    if (/Számolás nélkül/.test(s)) {
      const o = alap(f.szoveg);
      const a = szam(s.match(/több mint ([\d,]+) /)[1]);
      assert.equal(helyes, 1 - Fx(a, o.mu, o.sg) > 0.5 ? 'több mint 50 %' : 'kevesebb mint 50 %', s);
      latott.add('fel');
    } else if (/Melyik lesz szélesebb/.test(s)) {
      const [p1, p2] = s.match(/a ([\d]+) %-ot, a másik a ([\d]+) %-ot/).slice(1).map(Number);
      assert.equal(helyes, `a ${Math.max(p1, p2)} %-os`);
      latott.add('szelesseg');
    } else {
      assert.equal(helyes, 'kisebb lenne', s);
      latott.add('szoras');
    }
    for (const [k, o] of m.opciok.entries()) if (!o.helyes) {
      const r = ellenoriz(m, String(k));
      assert.equal(r.allapot, 'tipikus'); assert.match(r.ellenproba, /^Ellenpróba: /);
    }
  }
  assert.equal(latott.size, 3);
});

test('a helyzetek „kerek” paraméterekkel adottak, a SPEC értékei szerepelnek (160/10, 200/5, 25/1,5, 20/0,5, 1/0,3, 28/8)', () => {
  for (const [mu, sg] of [[160, 10], [200, 5], [25, 1.5], [20, 0.5], [1, 0.3], [28, 8]]) {
    assert.ok(HELYZETEK.some((h) => h.mu === mu && h.sigma === sg), `${mu}/${sg}`);
  }
});

test('a kidolgozott példák szövegében a SPEC végeredményei szerepelnek; az ábrák kiszínezett területet mutatnak', () => {
  const sz = tema.peldak.map((p) => p.lepesek.join(' ')).join(' ');
  for (const v of ['50 %', '6,68 %', '93,57 %', '23,01 %', '147,18 g', '156,15 g', '147,2–172,8 g', '0,6554', '0,5793', '0,6827', '0,0455',
    '0,7475', '0,8176', '26,92 g', '25,38 g', '0,9281', '20,26 dl', '19,36 dl', '19,02–20,98 dl', '18,84–21,16 dl', '0,4950', '0,2611',
    '0,507–1,493 liter', '0,384–1,616 liter', '2,054σ', '0,2113', '0,9109', '0,1336']) assert.ok(sz.includes(v), v);
  for (const p of tema.peldak.filter((x) => x.abra)) {
    const svg = p.abra();
    assert.match(svg, /abra-terulet/); assert.match(svg, /μ = 160/); assert.ok(!/NaN|undefined/.test(svg));
  }
  // a szimmetrikus kérdésnél a két kimaradó „fecni” más színnel
  assert.match(tema.peldak[1].abra(), /abra-terulet masik/);
});
