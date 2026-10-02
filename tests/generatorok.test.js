// Minden feladattípusból sok véletlen feladatot generálunk, és a helyes választ
// a feladat SZÖVEGÉBŐL (ill. az ábrából) visszaolvasott számokból, a generátortól
// függetlenül újraszámoljuk. Ellenőrizzük a „szép” számokat és a tipikus hibákat is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { szep, formaz } from '../js/lib/szam.js';
import { ellenoriz, egyezik } from '../js/lib/ellenorzo.js';
import { TEMAK } from '../js/temak/index.js';
import { sima, szam, szamok, linearis, kozel } from './segito.js';

const MINTA = 300; // ennyi feladat típusonként

// ---- Független újraszámolás típusonként: { mezőindex: várt érték } vagy { valasztas: helyes szöveg } ----
const tarifak = (html) => {
  const re = /<strong>([^<]+)<\/strong>: \S\(x\) = ([\d ]+) \+ ([\d ]+)x/g;
  const t = {};
  for (const r of String(html).replace(/ /g, ' ').matchAll(re)) t[r[1]] = { a: szam(r[2]), c: szam(r[3]) };
  return t;
};
const piacFv = (szoveg) => {
  const s = sima(szoveg);
  const r = s.match(/D\(x\) = (.+?), a kínálati függvény S\(x\) = (.+?)\. /);
  if (r) return { D: linearis(r[1]), S: linearis(r[2]) };
  const n = szamok(s); // hétfő: p1, s1, d1; péntek: p2, s2, d2
  const [p1, s1, d1, p2, s2, d2] = n;
  const mD = (d2 - d1) / (p2 - p1), mS = (s2 - s1) / (p2 - p1);
  return { D: { m: mD, b: d1 - mD * p1 }, S: { m: mS, b: s1 - mS * p1 } };
};
const ertek = (f, x) => f.m * x + f.b;

const VARHATO = {
  T1: (f) => { const [P0, p] = szamok(f.szoveg); return [P0 * (1 + p / 100)]; },
  T2: (f) => { const [p, P1] = szamok(f.szoveg); return [P1 / (1 + p / 100)]; },
  T3: (f) => { const [P0, P1] = szamok(f.szoveg); return [(P1 / P0 - 1) * 100]; },
  T4: (f) => { const [P0, p] = szamok(f.szoveg); return [P0 * (1 - p / 100)]; },
  T5: (f) => { const [p, P1] = szamok(f.szoveg); return [P1 / (1 - p / 100)]; },
  T6: (f) => { const [P0, P1] = szamok(f.szoveg); return [(1 - P1 / P0) * 100]; },
  T7: (f) => { const [a, b] = szamok(f.szoveg); return [((1 + a / 100) * (1 + b / 100) - 1) * 100]; },
  T8: (f) => { const [a, b] = szamok(f.szoveg); return [(1 - (1 - a / 100) * (1 - b / 100)) * 100]; },
  T9: (f) => { const [a, b] = szamok(f.szoveg); return [((1 + a / 100) * (1 - b / 100) - 1) * 100]; },
  T10: (f) => {
    const [, D0, s, , d, fk, , R1, g] = szamok(f.szoveg);
    const N0 = (D0 * 100) / s, K0 = N0 - D0, D1 = D0 * (1 - d / 100), K1 = K0 * (1 + fk / 100), N1 = D1 + K1;
    const R0 = R1 / (1 + g / 100), r0 = R0 / N0, r1 = R1 / N1;
    return [N0, K0, D1, K1, N1, (N1 / N0 - 1) * 100, R0, r0, r1, (r1 / r0 - 1) * 100];
  },
  L1: (f) => { const [b, m, x] = szamok(f.szoveg); return [m * x + b]; },
  L2: (f) => { const [b, m, y] = szamok(f.szoveg); return [(y - b) / m]; },
  L3: (f) => {
    const [V0, d] = szamok(f.szoveg);
    const n = szamok(f.mezok[0].cimke)[0];
    return [V0 - d * n, V0 / d];
  },
  L4: (f) => { const [x1, y1, x2, y2] = szamok(f.szoveg); return [(y2 - y1) / (x2 - x1)]; },
  L5: (f) => { const [x1, y1, x2, y2] = szamok(f.szoveg); const m = (y2 - y1) / (x2 - x1); return [y1 - m * x1]; },
  L6: (f) => { const [m, b] = szamok(f.szoveg); return [-b / m]; },
  L7: (f) => {
    // a kiemelt rácspontok visszaolvasása az SVG-ből (440×440, margók: bal 52, jobb 22, fent 26, lent 42; −6…6)
    const pontok = [...f.abra.matchAll(/<circle class="abra-pont" cx="([\d.]+)" cy="([\d.]+)"/g)]
      .map((r) => ({ x: -6 + ((Number(r[1]) - 52) / 366) * 12, y: 6 - ((Number(r[2]) - 26) / 372) * 12 }));
    assert.equal(pontok.length, 2);
    for (const p of pontok) { assert.ok(kozel(p.x, Math.round(p.x)) && kozel(p.y, Math.round(p.y)), 'rácspont'); }
    const [A, B] = pontok.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }));
    const m = (B.y - A.y) / (B.x - A.x);
    return [m, A.y - m * A.x];
  },
  L8: (f) => {
    const s = sima(f.szoveg);
    const mono = s.match(/f\(x\) = (.+) függvény/);
    if (mono) {
      const { m } = linearis(mono[1]);
      return { valasztas: m > 0 ? 'szigorúan monoton nő' : m < 0 ? 'szigorúan monoton csökken' : 'konstans' };
    }
    const kerdezett = s.match(/Mit jelent a függvényben az? ([\d,]+)/)[1];
    return { tartalmaz: kerdezett };
  },
  K1: (f) => {
    const t = tarifak(f.szoveg);
    const c = sima(f.mezok[0].cimke).match(/A\(z\) (.+) taxival ([\d ,]+) Ft/);
    const T = t[c[1]], Y = szam(c[2]);
    const d = szam(sima(f.mezok[1].cimke).match(/egy ([\d,]+) km-es/)[1]);
    const [n1, n2] = Object.keys(t);
    const k1 = t[n1].a + t[n1].c * d, k2 = t[n2].a + t[n2].c * d;
    return { 0: (Y - T.a) / T.c, valasztas1: k1 < k2 ? n1 : n2 };
  },
  K2: (f) => {
    const [A, B] = Object.values(tarifak(f.szoveg));
    const x = (A.a - B.a) / (B.c - A.c);
    return [x, A.a + A.c * x];
  },
  K3: (f) => {
    const t = tarifak(f.szoveg);
    const [A, B] = Object.values(t);
    const x = (A.a - B.a) / (B.c - A.c);
    const nev = sima(f.szoveg).match(/olcsóbb a\(z\) (.+)\?$/)[1];
    const X = t[nev], Y = X === A ? B : A;
    return { 0: x, valasztas1: X.a < Y.a ? 'ha az út rövidebb a határnál (x kisebb)' : 'ha az út hosszabb a határnál (x nagyobb)' };
  },
  K4: (f) => { const [p1, q1, p2, q2] = szamok(f.szoveg); const m = (q2 - q1) / (p2 - p1); return [m, q1 - m * p1]; },
  K5: (f) => {
    const s = sima(f.szoveg);
    const D = linearis(s.match(/D\(p\) = (.+?) \(/)[1], 'p');
    const ar = s.match(/kereslet ([\d,]+) (?:Ft-os|\$\/kg-os) árnál/);
    if (ar) return [ertek(D, szam(ar[1]))];
    const q = szam(s.match(/lesz a kereslet ([\d ,]+?) (?:liter|t)\?/)[1]);
    return [(q - D.b) / D.m];
  },
  K6: (f) => {
    const { D, S } = piacFv(f.szoveg);
    const x = (S.b - D.b) / (D.m - S.m);
    return [x, ertek(D, x)];
  },
  K7: (f) => {
    const { D, S } = piacFv(f.szoveg);
    const p = szam(sima(f.szoveg).match(/ára ([\d,]+) \$\/kg\?/)[1]);
    return [p * Math.min(ertek(D, p), ertek(S, p)) * 1000];
  },
};

// Típusok, amelyeknél a SPEC tipikus hibát ír elő – ezeknél minden feladatban kell lennie felismert hibának.
const KELL_TIPIKUS = new Set(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'L1', 'L2', 'L3', 'L4', 'L6', 'L7', 'K1', 'K3', 'K4', 'K5', 'K7']);

for (const tema of TEMAK) {
  for (const tipus of tema.tipusok) {
    test(`${tema.id} / ${tipus.id} – ${tipus.nev}: ${MINTA} generált feladat helyes`, () => {
      assert.ok(VARHATO[tipus.id], 'van független ellenőrzés');
      const rng = ujRng(1000 + tipus.id.charCodeAt(0) * 100 + Number(tipus.id.slice(1)));
      const szovegek = new Set();
      for (let i = 0; i < MINTA; i++) {
        const f = tipus.general(rng);
        szovegek.add(f.szoveg + (f.abra || '') + f.mezok.map((m) => m.cimke).join());
        // szerkezet
        assert.equal(typeof f.szoveg, 'string');
        assert.ok(f.mezok.length >= 1);
        assert.ok(f.tippek.length >= 2 && f.tippek.length <= 3, 'lépcsőzetes tipp (2–3 szint)');
        assert.ok(f.megoldas.length >= 1);
        assert.ok(f.jegyezze && f.jegyezze.length > 10);
        assert.ok(!/NaN|undefined|Infinity/.test(f.szoveg + f.megoldas.join() + f.tippek.join() + f.mezok.map((m) => m.cimke).join()), 'nincs NaN/undefined a szövegben: ' + f.szoveg);

        // „szép” számok a feladat szövegében
        for (const v of szamok(f.szoveg)) assert.ok(szep(v, 2), `szép szám a szövegben: ${v} – ${sima(f.szoveg)}`);

        const varhato = VARHATO[tipus.id](f);
        let vanTipikus = false;
        f.mezok.forEach((m, k) => {
          if (m.tipus === 'valasztas') {
            const helyesek = m.opciok.filter((o) => o.helyes);
            assert.equal(helyesek.length, 1, 'pontosan egy helyes opció');
            assert.equal(new Set(m.opciok.map((o) => o.szoveg)).size, m.opciok.length, 'különböző opciók');
            const vart = varhato[`valasztas${k}`] ?? varhato.valasztas;
            if (vart) assert.equal(helyesek[0].szoveg, vart, sima(f.szoveg));
            if (varhato.tartalmaz) assert.ok(helyesek[0].szoveg.includes(varhato.tartalmaz), `${helyesek[0].szoveg} ⊇ ${varhato.tartalmaz}`);
            const jo = m.opciok.indexOf(helyesek[0]);
            assert.equal(ellenoriz(m, String(jo)).allapot, 'jo');
            if (m.opciok.some((o) => !o.helyes && o.uzenet)) vanTipikus = true;
            return;
          }
          // a helyes válasz tényleg helyes (független újraszámolás)
          const vart = varhato[k];
          assert.ok(Number.isFinite(vart), 'van várt érték');
          assert.ok(kozel(m.helyes, vart, 1e-9), `${tipus.id} ${m.cimke}: generált ${m.helyes}, újraszámolt ${vart} – ${sima(f.szoveg)}`);

          // a végeredmény szép, vagy a feladat kifejezetten kerekítést kér
          const kerekitest_ker = /tizedesre/.test(m.cimke + f.szoveg + (f.utasitas || ''));
          assert.ok(szep(m.helyes, 2) || kerekitest_ker, `szép végeredmény: ${m.helyes} (${m.cimke})`);

          // a helyes választ többféle írásmóddal is elfogadja
          const kiirt = formaz(m.helyes, m.tizedes);
          for (const be of [kiirt, kiirt.replace(',', '.').replace(/ /g, ''), `${kiirt} ${m.egyseg || ''}`.trim()]) {
            assert.equal(ellenoriz(m, be).allapot, 'jo', `„${be}” elfogadva (${m.cimke}, helyes: ${m.helyes})`);
          }
          // előjel-szabályok
          if (m.elojel === 'nagysag') assert.equal(ellenoriz(m, formaz(-m.helyes, m.tizedes)).allapot, 'jo-megjegyzes');
          if (m.elojel === 'elojeles') assert.equal(ellenoriz(m, formaz(-m.helyes, m.tizedes)).allapot, 'tipikus');

          // a tipikus hibák különböznek a jótól, és beírva célzott visszajelzést adnak
          for (const h of m.hibak) {
            assert.ok(!egyezik(h.ertek, m.helyes, m.tizedes), `a tipikus hiba (${h.ertek}) különbözik a helyestől (${m.helyes})`);
            const r = ellenoriz(m, formaz(h.ertek, m.tizedes));
            assert.equal(r.allapot, 'tipikus', `tipikus hiba felismerve: ${h.ertek} (${m.cimke}) – ${sima(f.szoveg)}`);
            assert.equal(r.uzenet, h.uzenet);
            vanTipikus = true;
          }
        });
        if (KELL_TIPIKUS.has(tipus.id)) assert.ok(vanTipikus, `${tipus.id}: van felismert tipikus hiba – ${sima(f.szoveg)}`);
      }
      assert.ok(szovegek.size > MINTA * 0.5, `változatos feladatok (${szovegek.size} különböző)`);
    });
  }
}

test('a SPEC tipikus hibái konkrét példákon', async () => {
  // T3: 2500 → 3375; a hányados·100 (135) és a rossz alap is felismert
  const { default: sz } = await import('../js/temak/szazalek.js');
  assert.ok(sz.tipusok.length >= 9);
  // T9: +20 % majd −20 % = −4 %, a 0 tipikus hiba
  const { osszetett } = await import('../js/temak/szazalek.js');
  assert.ok(kozel(osszetett([20, -20]), -4));
});
