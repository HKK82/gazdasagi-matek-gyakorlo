// 9. téma – Normális eloszlás (v5)
import { egesz, valaszt } from '../lib/rng.js';
import { kerekit } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { haranAbra } from '../lib/abra.js';
import * as E from '../lib/eloszlas.js';
import { probal, f, gg, tisztit } from './seged.js';

const p4 = (x) => f(x, 4);
const F = E.normalisF;
const Z = (x, mu, sigma) => (x - mu) / sigma;

/**
 * Helyzetek: „Egy <egyed> <tulaj> normális eloszlású, átlaga μ <egység>, szórása σ <egység>.”
 * nev: a névelő a kérdésekben („a paradicsom tömege”, „az alma tömege”).
 */
export const HELYZETEK = [
  { id: 'paradicsom', mu: 160, sigma: 10, egyseg: 'g', nev: 'a', egyed: 'paradicsom', tulaj: 'tömege' },
  { id: 'viz', mu: 200, sigma: 5, egyseg: 'ml', nev: 'az', egyed: 'ásványvizes palack', tulaj: 'töltete' },
  { id: 'szelet', mu: 25, sigma: 1.5, egyseg: 'g', nev: 'a', egyed: 'Balaton szelet', tulaj: 'tömege' },
  { id: 'narancsle', mu: 20, sigma: 0.5, egyseg: 'dl', nev: 'a', egyed: 'doboz narancslé', tulaj: 'térfogata' },
  { id: 'vizfogyasztas', mu: 1, sigma: 0.3, egyseg: 'liter', nev: 'az', egyed: 'ember', tulaj: 'napi vízfogyasztása' },
  { id: 'alma', mu: 28, sigma: 8, egyseg: 'dkg', nev: 'az', egyed: 'alma', tulaj: 'tömege' },
  { id: 'csoki', mu: 100, sigma: 2, egyseg: 'g', nev: 'a', egyed: 'tábla csokoládé', tulaj: 'tömege' },
  { id: 'futar', mu: 40, sigma: 6, egyseg: 'perc', nev: 'a', egyed: 'futár', tulaj: 'kiszállítási ideje' },
  { id: 'tojas', mu: 60, sigma: 4, egyseg: 'g', nev: 'a', egyed: 'tojás', tulaj: 'tömege' },
];
const intro = (h) => `Egy ${h.egyed} ${h.tulaj} normális eloszlású, átlaga ${f(h.mu)} ${h.egyseg}, szórása ${f(h.sigma)} ${h.egyseg}.`;
const valtozo = (h) => `${h.nev} ${h.egyed} ${h.tulaj}`;
const ert = (h, x) => `${f(x)} ${h.egyseg}`;

/** μ + zσ „kerek” határ (legfeljebb 2 tizedes). */
const hatar = (h, z) => tisztit(h.mu + z * h.sigma);
const zErtek = (rng, kicsi = 2, nagy = 25) => (egesz(rng, kicsi, nagy) / 10) * (rng() < 0.5 ? -1 : 1);

// ---- Mezők ----
function pMezo({ id = 'p', cimke = 'A valószínűség', helyes, ellenproba, hibak = [] }) {
  return szamMezo({
    id, cimke: `${cimke} (4 tizedesre)`, helyes, tizedes: 4, abszTures: 0.0001, szazalek: true,
    maximum: 1, maximumUzenet: 'A valószínűség legfeljebb 1: a görbe alatti teljes terület 1.',
    ellenproba, hibak,
  });
}
function hatarMezo({ id = 'x', cimke, helyes, ellenproba, hibak = [], egyseg }) {
  return szamMezo({
    id, cimke: `${cimke} (${egyseg}, két tizedesre)`, helyes, tizedes: 2, abszTures: 0.01, egyseg, ellenproba, hibak,
  });
}

// ---- „GeoGebrában így” (Valószínűség-számítás nézet) ----
const GG_LEPESEK = 'Hamburger menü → <strong>Valószínűség-számítás</strong>. A legördülő listából válassza a <strong>Normális</strong> eloszlást, írja be a μ és σ értékét, alul pedig válassza a megfelelő gombot: <strong>kisebb (≤)</strong>, <strong>két érték között</strong>, <strong>nagyobb (≥)</strong>. A kért valószínűség a harang színezett része alatt jelenik meg.';
const GG_FORDITOTT = 'Fordított kérdésnél a határt nem kell beírni: a valószínűség mezőbe írja be a megadott valószínűséget (tizedes törtként), és a GeoGebra kiszámolja a hozzá tartozó határt.';
const ggNorm = (h) => `Normális · μ: ${gg(h.mu)} · σ: ${gg(h.sigma)}`;
const geogebra = (sorok, megjegyzes = '') => ({
  bevezeto: 'A GeoGebra Valószínűség-számítás nézetében állítsa be (tizedesponttal!):',
  sorok, megjegyzes: `${GG_LEPESEK} ${megjegyzes}`.trim(),
});

// ---- Ellenpróbák ----
/** Becslés az átlaghoz képest: melyik oldalon van a határ, és ez mit jelent a kérdezett oldal valószínűségére. */
function becsles(h, x, irany, P, w) {
  const alatt = x < h.mu;
  const mondat = `a(z) ${ert(h, x)} ${alatt ? 'az átlag (' + ert(h, h.mu) + ') alatt' : 'az átlag (' + ert(h, h.mu) + ') fölött'} van, ezért a(z) ${irany} rész ${P > 0.5 ? 'több' : 'kevesebb'} 50 %-nál`;
  const joIrany = (w > 0.5) === (P > 0.5);
  return `Ellenpróba: ${mondat}. Az Ön ${p4(w)} értéke ${w > 0.5 ? 'több' : 'kevesebb'} 50 %-nál, ${joIrany ? `jó irányba mutat, de nem pontos: a helyes érték ${p4(P)}` : `ez tehát nem lehet jó; a helyes érték ${p4(P)}`}.`;
}
/** Tartományra: F(b) − F(a) alakú ellenpróba. */
function teruletEllen(h, a, b, P, leiras) {
  return (w) => `Ellenpróba: ${leiras} területe F(${f(b)}) − F(${f(a)}) = ${p4(F(b, h.mu, h.sigma))} − ${p4(F(a, h.mu, h.sigma))} = ${p4(P)}; az Ön ${p4(w)} értéke ${w > P ? 'ennél nagyobb' : 'ennél kisebb'}, a harang alatti teljes terület pedig 1.`;
}

// =====================================================================
// N1 – kisebb / nagyobb
// =====================================================================
function N1(rng) {
  const h = valaszt(rng, HELYZETEK);
  const kisebb = rng() < 0.5;
  const z = zErtek(rng);
  const a = hatar(h, z);
  const bal = F(a, h.mu, h.sigma);
  const P = kisebb ? bal : 1 - bal;
  const irany = kisebb ? 'kisebb' : 'nagyobb';
  const rossz = kisebb ? 1 - bal : bal;
  const gomb = kisebb ? `kisebb (≤): X ≤ ${gg(a)}` : `nagyobb (≥): X ≥ ${gg(a)}`;
  return {
    szoveg: `${intro(h)} Mennyi a valószínűsége, hogy ${valtozo(h)} ${kisebb ? 'kevesebb' : 'több'} mint ${ert(h, a)}?`,
    mezok: [pMezo({
      helyes: P, ellenproba: (w) => becsles(h, a, irany, P, w),
      hibak: [{ ertek: rossz, uzenet: kisebb
        ? `Kisebb értékeket kérdez: a bal oldali területet kell venni (F(${f(a)}) = ${p4(bal)}), nem a komplementerét. Becsüljön: a ${f(a)} ${a > h.mu ? 'az átlag fölött van, ezért a nála kisebb rész több, mint 50 %' : 'az átlag alatt van, ezért a nála kisebb rész kevesebb, mint 50 %'}.`
        : `Nagyobb értékeket kérdez: 1 − F(${f(a)}). Becsüljön: ${a > h.mu ? 'a > μ esetén 50 %-nál kevesebb' : 'a < μ esetén 50 %-nál több'} a nála nagyobb rész.` }],
    })],
    tippek: [
      `Hol van a ${f(a)} az átlaghoz (${f(h.mu)}) képest, és a kisebb vagy a nagyobb oldal területe kell?`,
      'A GeoGebra (és az eloszlásfüggvény) mindig a bal oldali területet adja: F(x) = P(X < x). A nagyobb oldal: 1 − F(x). Folytonos eloszlásnál mindegy, hogy < vagy ≤.',
      `${kisebb ? `P(X < ${f(a)}) = F(${f(a)})` : `P(X > ${f(a)}) = 1 − F(${f(a)})`}; z = (${f(a)} − ${f(h.mu)}) / ${f(h.sigma)} = ${f(Z(a, h.mu, h.sigma), 2)}.`,
    ],
    megoldas: [
      `Normális eloszlás: μ = ${f(h.mu)}, σ = ${f(h.sigma)}. A határ: ${f(a)}, ami ${f(Math.abs(Z(a, h.mu, h.sigma)), 2)} szórásnyira van az átlagtól (z = ${f(Z(a, h.mu, h.sigma), 2)}).`,
      `F(${f(a)}) = P(X < ${f(a)}) = ${p4(bal)}.`,
      kisebb ? `A kért valószínűség: P(X < ${f(a)}) = <strong>${p4(P)}</strong>.` : `A kért valószínűség: P(X > ${f(a)}) = 1 − ${p4(bal)} = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, mekkora része esik a harang alatti területnek a ${f(a)} ${h.egyseg} ${kisebb ? 'bal' : 'jobb'} oldalára: ${valtozo(h)} ${kisebb ? 'kisebb' : 'nagyobb'}, mint ${ert(h, a)}.`,
      `A normális eloszlás szimmetrikus harang, a csúcsa az átlagnál (${ert(h, h.mu)}) van. A ${f(a)} ${h.egyseg} ${f(Math.abs(Z(a, h.mu, h.sigma)), 2)} szórásnyira van az átlagtól, ${a > h.mu ? 'fölötte' : 'alatta'}. A bal oldali terület (F) ${p4(bal)}${kisebb ? '' : ', ezért a jobb oldali 1 − ' + p4(bal) + ' = ' + p4(P)}.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${f(100 * P, 1)} lesz ${kisebb ? 'kisebb' : 'nagyobb'} a megadott értéknél.`,
      `Józan ésszel: ${a > h.mu ? 'az átlag fölötti határnál a kisebb oldal 50 %-nál több, a nagyobb oldal kevesebb' : 'az átlag alatti határnál a kisebb oldal 50 %-nál kevesebb, a nagyobb oldal több'}; a kapott ${p4(P)} ${P > 0.5 ? 'több' : 'kevesebb'} 50 %-nál ✓.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [kisebb ? { a: -1e9, b: a } : { a, b: 1e9 }], hatarok: [{ x: a }], xfelirat: `${h.tulaj} (${h.egyseg})`,
      felirat: `P = ${p4(P)}`, leiras: `Normális harang: a ${f(a)} ${h.egyseg} ${kisebb ? 'alatti' : 'feletti'} terület kiszínezve, ${p4(P)}.`,
    }),
    geogebra: geogebra([`${ggNorm(h)} · ${gomb}`]),
    jegyezze: 'Normális eloszlásnál a valószínűség a görbe alatti terület. A kisebb oldal F(x), a nagyobb oldal 1 − F(x); folytonosnál mindegy, hogy < vagy ≤.',
  };
}

// =====================================================================
// N2 – két érték között
// =====================================================================
function N2(rng) {
  const h = valaszt(rng, HELYZETEK);
  const { z1, z2 } = probal(() => {
    const x = zErtek(rng), y = zErtek(rng);
    const lo = Math.min(x, y), hi = Math.max(x, y);
    if (hi - lo < 0.4) return null;
    const P = E.standardF(hi) - E.standardF(lo);
    return P >= 0.05 && P <= 0.97 ? { z1: lo, z2: hi } : null;
  });
  const a = hatar(h, z1), b = hatar(h, z2);
  const Fa = F(a, h.mu, h.sigma), Fb = F(b, h.mu, h.sigma), P = Fb - Fa;
  return {
    szoveg: `${intro(h)} Mennyi a valószínűsége, hogy ${valtozo(h)} ${f(a)} és ${ert(h, b)} között van?`,
    mezok: [pMezo({
      helyes: P, ellenproba: teruletEllen(h, a, b, P, `a ${f(a)} és ${f(b)} ${h.egyseg} közötti rész`),
      hibak: [
        { ertek: Fb, uzenet: 'A b alatti részből le kell vonni az a alattit: P(a < X < b) = F(b) − F(a).' },
        { ertek: 1 - Fa, uzenet: 'Ez az a feletti rész; a b feletti részt is le kell vonni belőle (vagy a b alattiból az a alattit).' },
      ],
    })],
    tippek: [
      `Melyik két terület különbsége a kért rész? Mennyi F(${f(b)}) és F(${f(a)})?`,
      `P(a < X < b) = F(b) − F(a): a b alatti részből levonjuk az a alattit. Itt a = ${f(a)}, b = ${f(b)}.`,
      `F(${f(b)}) = ${p4(Fb)}, F(${f(a)}) = ${p4(Fa)}.`,
    ],
    megoldas: [
      `Normális eloszlás: μ = ${f(h.mu)}, σ = ${f(h.sigma)}.`,
      `F(${f(b)}) = ${p4(Fb)}; F(${f(a)}) = ${p4(Fa)}.`,
      `P(${f(a)} < X < ${f(b)}) = ${p4(Fb)} − ${p4(Fa)} = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, a harang alatti terület mekkora része esik a ${f(a)} és ${f(b)} ${h.egyseg} közötti sávra.`,
      `Az eloszlásfüggvény (F) mindig a bal oldali területet adja. A b alatti rész (${p4(Fb)}) tartalmazza az a alatti részt (${p4(Fa)}) is, ezért kivonunk: ${p4(Fb)} − ${p4(Fa)} = ${p4(P)}. Ha csak F(b)-t írná, az a alatti rész is benne maradna.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${f(100 * P, 1)} esik a két érték közé.`,
      `Józan ésszel: a sáv ${Math.abs(Z(a, h.mu, h.sigma)) < 1 && Math.abs(Z(b, h.mu, h.sigma)) < 1 ? 'az átlag közelében van, ezért a valószínűsége nagy' : 'nem a legsűrűbb rész, ezért a valószínűsége kisebb'}; ${p4(P)} 0 és 1 közötti, és kisebb, mint F(${f(b)}) = ${p4(Fb)} ✓.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [{ a, b }], hatarok: [{ x: a }, { x: b }], xfelirat: `${h.tulaj} (${h.egyseg})`,
      felirat: `P = ${p4(P)}`, leiras: `Normális harang: a ${f(a)} és ${f(b)} ${h.egyseg} közötti terület kiszínezve, ${p4(P)}.`,
    }),
    geogebra: geogebra([`${ggNorm(h)} · két érték között: ${gg(a)} ≤ X ≤ ${gg(b)}`]),
    jegyezze: 'Két érték között: P(a < X < b) = F(b) − F(a). A b alatti részből le kell vonni az a alattit.',
  };
}

// =====================================================================
// N3 / N4 – eltérés az átlagtól (legfeljebb / több mint)
// =====================================================================
function eltAdat(rng) {
  const h = valaszt(rng, HELYZETEK);
  const szorasos = rng() < 0.5;
  const t = valaszt(rng, [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.5]);
  const z = szorasos ? t : egesz(rng, 2, 25) / 10;
  const d = tisztit(z * h.sigma);
  return { h, szorasos, t, z, d };
}
const eltSzoveg = (h, szorasos, t, d) => (szorasos ? `${f(t)} szórásnyi` : ert(h, d));

function N3(rng) {
  const { h, szorasos, t, z, d } = eltAdat(rng);
  const a = tisztit(h.mu - d), b = tisztit(h.mu + d);
  const Fa = F(a, h.mu, h.sigma), Fb = F(b, h.mu, h.sigma), P = Fb - Fa;
  const egyOldal = Fb;
  // a t-vel (a tényleges t·σ eltérés helyett) számolt eltérés
  const tHiba = szorasos ? F(h.mu + t, h.mu, h.sigma) - F(h.mu - t, h.mu, h.sigma) : NaN;
  return {
    szoveg: `${intro(h)} Mennyi a valószínűsége, hogy ${valtozo(h)} az átlagtól való eltérése legfeljebb ${eltSzoveg(h, szorasos, t, d)}?`,
    mezok: [pMezo({
      helyes: P, ellenproba: teruletEllen(h, a, b, P, `a ${f(a)} és ${f(b)} ${h.egyseg} közötti rész (μ ± ${f(d)})`),
      hibak: [
        ...(Number.isFinite(tHiba) ? [{ ertek: tHiba, uzenet: `Előbb számolja ki a tényleges eltérést: ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}. A ${f(t)} csak a szórások száma, nem ${h.egyseg}.` }] : []),
        { ertek: egyOldal, uzenet: `Két oldalra kell: a ${f(a)} és a ${f(b)} ${h.egyseg} között, nem csak a ${f(b)} alatt.` },
        { ertek: Fb - 0.5, uzenet: 'Ez csak az átlag és az egyik határ közötti rész; a „legfeljebb d eltérés” mindkét irányban számít, ezért a kétszerese kell.' },
      ],
    })],
    tippek: [
      `Mely értékek között van a megengedett sáv, ha az eltérés legfeljebb ${eltSzoveg(h, szorasos, t, d)}?`,
      szorasos ? `Előbb számolja ki a tényleges eltérést: ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}. A sáv: μ − d és μ + d között.` : `A sáv: μ − d és μ + d között: ${f(h.mu)} ± ${f(d)}.`,
      `P(${f(a)} < X < ${f(b)}) = F(${f(b)}) − F(${f(a)}).`,
    ],
    megoldas: [
      szorasos ? `Az eltérés: ${f(t)} · σ = ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}.` : `Az eltérés: ${f(d)} ${h.egyseg}.`,
      `A sáv: μ ± d = ${f(h.mu)} ± ${f(d)} → ${f(a)} … ${f(b)}.`,
      `P = F(${f(b)}) − F(${f(a)}) = ${p4(Fb)} − ${p4(Fa)} = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, mekkora az esélye, hogy ${valtozo(h)} legfeljebb ${eltSzoveg(h, szorasos, t, d)} tér el az átlagtól – fölfelé vagy lefelé, mindegy.`,
      szorasos
        ? `Először ki kell számolni a tényleges eltérést: ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}. (A ${f(t)} csak a szórások száma; ha közvetlenül mértékegységnek venné, egész más sávot kapna.) A megengedett sáv: ${f(h.mu)} ± ${f(d)}, vagyis ${f(a)} … ${f(b)}.`
        : `A megengedett sáv az átlag körül szimmetrikus: ${f(h.mu)} ± ${f(d)}, vagyis ${f(a)} … ${f(b)}.`,
      `A sávba eső terület a két határhoz tartozó bal oldali területek különbsége: ${p4(Fb)} − ${p4(Fa)} = ${p4(P)}.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${f(100 * P, 1)} esik ebbe a sávba.`,
      `Józan ésszel: a sáv ${f(z, 2)} szórásnyi sugarú (±${f(z, 2)}σ). A ±1σ sáv kb. 68 %, a ±2σ kb. 95 %; a mi ${p4(P)} értékünk ${z < 1 ? 'a 68 % alatt van (szűkebb a sáv)' : z <= 2 ? 'a 68 % és a 95 % között van' : 'a 95 % körül vagy fölötte van'} ✓.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [{ a, b }], hatarok: [{ x: a }, { x: b }], xfelirat: `${h.tulaj} (${h.egyseg})`,
      felirat: `P = ${p4(P)}`, leiras: `Normális harang: az átlag körüli ± ${f(d)} ${h.egyseg} sáv kiszínezve, ${p4(P)}.`,
    }),
    geogebra: geogebra([`${ggNorm(h)} · két érték között: ${gg(a)} ≤ X ≤ ${gg(b)}`], 'A határokat előbb számolja ki: μ − d és μ + d.'),
    jegyezze: '„Legfeljebb d eltérés az átlagtól” → μ − d és μ + d között. Szórásnyi eltérésnél előbb szorozzon: d = t · σ. (μ ± 1σ ≈ 68 %, μ ± 2σ ≈ 95 %.)',
  };
}

function N4(rng) {
  const { h, szorasos, t, z, d } = eltAdat(rng);
  const a = tisztit(h.mu - d), b = tisztit(h.mu + d);
  const kozep = F(b, h.mu, h.sigma) - F(a, h.mu, h.sigma);
  const P = 1 - kozep;
  const tHiba = szorasos ? 1 - (F(h.mu + t, h.mu, h.sigma) - F(h.mu - t, h.mu, h.sigma)) : NaN;
  return {
    szoveg: `${intro(h)} Mennyi a valószínűsége, hogy ${valtozo(h)} az átlagtól való eltérése több mint ${eltSzoveg(h, szorasos, t, d)}?`,
    mezok: [pMezo({
      helyes: P,
      ellenproba: (w) => `Ellenpróba: a középső rész (${f(a)} … ${f(b)}) területe ${p4(kozep)}, a két szélső részé együtt 1 − ${p4(kozep)} = ${p4(P)}; az Ön ${p4(w)} értéke ${w > P ? 'ennél nagyobb' : 'ennél kisebb'}, a kettő összege (${p4(w)} + ${p4(kozep)} = ${p4(w + kozep)}) pedig ${Math.abs(w + kozep - 1) < 1e-3 ? 'éppen 1' : 'nem 1'}.`,
      hibak: [
        { ertek: kozep, uzenet: 'Ez a legfeljebb d eltérés (a középső rész); a kérdés a két szélső rész, vagyis 1 − középső rész.' },
        { ertek: P / 2, uzenet: 'Ez csak az egyik szélső rész. Az átlagtól mindkét irányban lehet több mint d az eltérés, ezért mindkét szélső rész kell.' },
        ...(Number.isFinite(tHiba) ? [{ ertek: tHiba, uzenet: `Előbb számolja ki a tényleges eltérést: ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}.` }] : []),
      ],
    })],
    tippek: [
      'Melyik két részre esik a „több mint d eltérés”, és hogyan jön ki ezekből a középső rész komplementere?',
      `A középső sáv: ${f(h.mu)} ± ${f(d)} (${f(a)} … ${f(b)}). A két szélső rész együtt: 1 − középső rész.`,
      `P = 1 − (F(${f(b)}) − F(${f(a)})).`,
    ],
    megoldas: [
      szorasos ? `Az eltérés: ${f(t)} · ${f(h.sigma)} = ${f(d)} ${h.egyseg}.` : `Az eltérés: ${f(d)} ${h.egyseg}.`,
      `A középső sáv: ${f(a)} … ${f(b)}; területe F(${f(b)}) − F(${f(a)}) = ${p4(kozep)}.`,
      `A több mint d eltérés a két szélső rész: 1 − ${p4(kozep)} = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, mekkora az esélye, hogy ${valtozo(h)} az átlagtól több mint ${eltSzoveg(h, szorasos, t, d)} eltér – akár lefelé, akár fölfelé.`,
      `A „több mint d” a középső sávon (${f(a)} … ${f(b)}) kívüli két szélső rész. Ezt úgy számoljuk, hogy a teljes területből (1) kivonjuk a középső sáv területét: 1 − ${p4(kozep)} = ${p4(P)}.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${f(100 * kozep, 1)} esik a középső sávba, és kb. ${f(100 * P, 1)} a két szélére.`,
      `Józan ésszel: a két szélső rész együtt a középső rész komplementere, ezért ${p4(P)} + ${p4(kozep)} = 1. ${z >= 2 ? 'Két szórásnál nagyobb eltérés ritka (5 % körüli vagy kisebb).' : 'Minél kisebb a megengedett sáv, annál nagyobb a rajta kívüli rész.'}`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [{ a: -1e9, b: a }, { a: b, b: 1e9 }], hatarok: [{ x: a }, { x: b }], xfelirat: `${h.tulaj} (${h.egyseg})`,
      felirat: `P = ${p4(P)}`, leiras: `Normális harang: a két szélső rész (több mint ${f(d)} ${h.egyseg} eltérés) kiszínezve, ${p4(P)}.`,
    }),
    geogebra: geogebra([
      `${ggNorm(h)} · kisebb (≤): X ≤ ${gg(a)}`,
      `${ggNorm(h)} · nagyobb (≥): X ≥ ${gg(b)}`,
    ], 'A két szélső rész valószínűségét adja össze, vagy a két határ közötti részt vonja ki 1-ből.'),
    jegyezze: '„Több mint d eltérés” = a két szélső rész = 1 − (a középső sáv területe). Mindkét irány számít.',
  };
}

// =====================================================================
// N5 – pontos érték
// =====================================================================
function N5(rng) {
  const h = valaszt(rng, HELYZETEK);
  const a = hatar(h, zErtek(rng, 0, 20));
  const suruseg = E.normalisSuruseg(a, h.mu, h.sigma);
  const kicsi = F(a + h.sigma * 0.01, h.mu, h.sigma) - F(a - h.sigma * 0.01, h.mu, h.sigma);
  return {
    szoveg: `${intro(h)} Mennyi a valószínűsége, hogy ${valtozo(h)} pontosan ${ert(h, a)}?`,
    mezok: [szamMezo({
      id: 'p', cimke: 'A valószínűség (4 tizedesre)', helyes: 0, tizedes: 4,
      egyebUzenet: 'Folytonos változónál egy konkrét érték valószínűsége 0.',
      ellenproba: (w) => `Ellenpróba: ha egyetlen érték valószínűsége ${p4(w)} lenne, akkor a végtelen sok különböző érték együtt végtelen nagy összeget adna, de a teljes valószínűség csak 1. Már a ${f(a - h.sigma * 0.01, 3)} és ${f(a + h.sigma * 0.01, 3)} ${h.egyseg} közötti nagyon keskeny sáv is csak ${p4(kicsi)}, egyetlen vonal pedig még keskenyebb.`,
    })],
    tippek: [
      'Hány különböző értéket vehet fel a változó egy intervallumon belül, és mekkora a terület egyetlen függőleges vonal alatt?',
      'Folytonos eloszlásnál a valószínűség a görbe alatti terület; egy vonalnak nincs szélessége, ezért nincs területe sem.',
    ],
    megoldas: [
      `Folytonos változónál P(X = ${f(a)}) = 0, mert egyetlen vonal alatt nincs terület.`,
      `Ezért mindegy is, hogy P(X < ${f(a)}) vagy P(X ≤ ${f(a)}): a válasz <strong>0</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, mekkora az esélye, hogy ${valtozo(h)} éppen ${ert(h, a)} legyen, egyetlen konkrét érték.`,
      `A normális eloszlás folytonos: bármilyen értéket felvehet, és a mérés pontosságától függően végtelen sok érték lehetséges. A valószínűség a görbe alatti terület; egyetlen érték egy függőleges vonal, amelynek nincs szélessége, ezért a területe 0.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: a ${f(a)} ${h.egyseg} körüli, ${f(a - h.sigma * 0.01, 3)} és ${f(a + h.sigma * 0.01, 3)} közötti keskeny sávba kb. ${f(100 * kicsi, 2)} esne; ha a sáv egyetlen vonalra szűkül, ez 0-ra csökken.`,
      `Józan ésszel: egy tökéletesen pontos érték (például pontosan ${f(a)}, végtelen sok tizedessel) gyakorlatilag soha nem fordul elő, ezért a valószínűség 0. A sűrűségfüggvény értéke (${f(suruseg, 4)}) nem valószínűség.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, hatarok: [{ x: a }], xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: 'P(X = a) = 0',
      leiras: `Normális harang: a ${f(a)} ${h.egyseg} egyetlen függőleges vonal, alatta nincs terület.`,
    }),
    geogebra: geogebra([`${ggNorm(h)} · két érték között: ${gg(a)} ≤ X ≤ ${gg(a)}`], 'A két határ megegyezik, ezért a terület és a valószínűség 0.'),
    jegyezze: 'Folytonos változónál egy konkrét érték valószínűsége 0 – ezért itt mindegy, hogy < vagy ≤ (diszkrét eloszlásnál nem!).',
  };
}

// =====================================================================
// N6 / N7 – fordított kérdés: a valószínűség adott, a határ a kérdés
// =====================================================================
const PCTK = [5, 10, 15, 20, 25, 30, 35, 40, 60, 65, 70, 75, 80, 85, 90, 95];
function fordított(rng, kisebb) {
  const h = valaszt(rng, HELYZETEK);
  const pct = valaszt(rng, PCTK);
  const p = pct / 100;
  const x = E.kvantilis(kisebb ? p : 1 - p, h.mu, h.sigma);
  const rosszX = E.kvantilis(kisebb ? 1 - p : p, h.mu, h.sigma);
  const bal = kisebb ? p : 1 - p;
  const irany = kisebb ? 'kisebb' : 'nagyobb';
  return {
    szoveg: `${intro(h)} Adja meg azt az x értéket (${h.egyseg}), amelyre ${valtozo(h)} ${pct} % valószínűséggel ${irany}, mint x.`,
    mezok: [hatarMezo({
      id: 'x', cimke: 'Az x határ', helyes: x, egyseg: h.egyseg,
      ellenproba: (w) => `Ellenpróba: ha x = ${f(w, 2)} ${h.egyseg} lenne, akkor a nála kisebb értékek valószínűsége F(${f(w, 2)}) = ${p4(F(w, h.mu, h.sigma))}, a nála nagyobbaké ${p4(1 - F(w, h.mu, h.sigma))}; ${kisebb ? 'kisebb' : 'nagyobb'} értékekre a kért valószínűség ${f(p, 2)}, ${Math.abs((kisebb ? F(w, h.mu, h.sigma) : 1 - F(w, h.mu, h.sigma)) - p) < 0.02 ? 'ez közel van, de nem pontos' : 'ettől ez messze van'}.`,
      hibak: [{ ertek: rosszX, uzenet: `${kisebb ? 'Kisebb' : 'Nagyobb'} értékekről van szó: ${kisebb ? 'a kisebb gombnál írja be a valószínűséget (a bal oldali terület ' + f(p, 2) + ')' : 'a bal oldali terület 1 − ' + f(p, 2) + ' = ' + f(1 - p, 2) + ', ezt kell a kisebb gombnál megadni'}.` }],
    })],
    tippek: [
      `Melyik oldalon van a ${pct} %, és mekkora az x-től balra eső terület?`,
      `Az x-től balra eső terület: ${f(bal, 2)}. (${kisebb ? 'Kisebb értékek: éppen ez a megadott valószínűség.' : 'Nagyobb értékek: 1 − ' + f(p, 2) + ' = ' + f(bal, 2) + '.'})`,
      `x = kvantilis(${f(bal, 2)}): a GeoGebrában a valószínűség mezőbe a ${f(bal, 2)} kerül, és a határ kiszámolódik. A z-érték ${f(E.standardKvantilis(bal), 3)}.`,
    ],
    megoldas: [
      `A keresett határtól balra eső terület: ${kisebb ? `${f(p, 2)} (kisebb értékek)` : `1 − ${f(p, 2)} = ${f(bal, 2)} (a nagyobb rész ${f(p, 2)})`}.`,
      `z = ${f(E.standardKvantilis(bal), 4)}, így x = μ + z · σ = ${f(h.mu)} + ${f(E.standardKvantilis(bal), 4)} · ${f(h.sigma)} = <strong>${f(x, 2)} ${h.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Itt fordítva kérdeznek: a valószínűség (${pct} %) adott, és azt a határt keressük, amely mellett ennyi a ${irany} rész.`,
      `A GeoGebra és az eloszlásfüggvény a bal oldali területet kezeli. ${kisebb ? `A ${pct} % „kisebb” rész éppen a bal oldali terület, így a határ a ${f(p, 2)} kvantilise.` : `A ${pct} % „nagyobb” rész a jobb oldali terület, ezért a bal oldali terület 1 − ${f(p, 2)} = ${f(bal, 2)}, és a határ a ${f(bal, 2)} kvantilise.`} Ez ${f(E.standardKvantilis(bal), 3)} szórásnyira van az átlagtól, vagyis x = ${f(x, 2)} ${h.egyseg}.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: ${kisebb ? 'kb. ' + pct + ' kisebb' : 'kb. ' + pct + ' nagyobb'} lesz a ${f(x, 2)} ${h.egyseg} értéknél.`,
      `Józan ésszel: ${bal < 0.5 ? 'a bal oldali terület 50 %-nál kisebb, ezért a határ az átlag (' + ert(h, h.mu) + ') alatt van' : 'a bal oldali terület 50 %-nál nagyobb, ezért a határ az átlag (' + ert(h, h.mu) + ') fölött van'}; a kapott ${f(x, 2)} ${h.egyseg} ${x < h.mu ? 'valóban kisebb' : 'valóban nagyobb'} az átlagnál ✓.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [kisebb ? { a: -1e9, b: x } : { a: x, b: 1e9 }], hatarok: [{ x, cimke: `x = ${f(x, 2)}` }],
      xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: `P = ${f(p, 2)}`, leiras: `Normális harang: a ${f(x, 2)} ${h.egyseg} ${kisebb ? 'alatti' : 'feletti'} terület kiszínezve (${pct} %).`,
    }),
    geogebra: geogebra([`${ggNorm(h)} · kisebb (≤): P(X ≤ x) = ${gg(bal)} → x = ${gg(x, 2)}`], GG_FORDITOTT),
    jegyezze: 'Fordított kérdés: a valószínűséget írjuk be, a határ az eredmény. A GeoGebra a bal oldali területtel dolgozik: „nagyobb, mint x” esetén 1 − p a bal oldali terület.',
  };
}
const N6 = (rng) => fordított(rng, true);
const N7 = (rng) => fordított(rng, false);

// =====================================================================
// N8 – szimmetrikus intervallum
// =====================================================================
function N8(rng) {
  const h = valaszt(rng, HELYZETEK);
  const pct = valaszt(rng, [80, 90, 95, 96, 98]);
  const p = pct / 100;
  const kimarad = 1 - p;
  const zz = E.standardKvantilis((1 + p) / 2);
  const alsoX = E.kvantilis(kimarad / 2, h.mu, h.sigma), felsoX = E.kvantilis(1 - kimarad / 2, h.mu, h.sigma);
  const rosszAlso = E.kvantilis(kimarad, h.mu, h.sigma), rosszFelso = E.kvantilis(p, h.mu, h.sigma);
  const egy = (w, tipus) => `Ellenpróba: ha a ${tipus} határ ${f(w, 2)} ${h.egyseg} lenne, akkor a ${tipus === 'alsó' ? 'nála kisebb' : 'nála nagyobb'} rész ${p4(tipus === 'alsó' ? F(w, h.mu, h.sigma) : 1 - F(w, h.mu, h.sigma))} volna; a kimaradó ${f(100 * kimarad, 1)} % fele alul, fele felül ${f(50 * kimarad, 2)} %, vagyis ${f(kimarad / 2, 3)}.`;
  return {
    szoveg: `${intro(h)} Adja meg az átlag körüli szimmetrikus intervallumot, amelybe ${valtozo(h)} ${pct} % valószínűséggel esik: az alsó és a felső határt (${h.egyseg}), valamint azt, hány szórásnyira vannak a határok az átlagtól!`,
    mezok: [
      hatarMezo({ id: 'also', cimke: 'Alsó határ', helyes: alsoX, egyseg: h.egyseg, ellenproba: (w) => egy(w, 'alsó'), hibak: [{ ertek: rosszAlso, uzenet: 'A kimaradó rész fele alul, fele felül: alul nem ' + f(100 * kimarad, 1) + ' %, hanem ' + f(50 * kimarad, 2) + ' % marad ki.' }] }),
      hatarMezo({ id: 'felso', cimke: 'Felső határ', helyes: felsoX, egyseg: h.egyseg, ellenproba: (w) => egy(w, 'felső'), hibak: [{ ertek: rosszFelso, uzenet: 'A kimaradó rész fele alul, fele felül: a felső határtól fölfelé ' + f(50 * kimarad, 2) + ' % marad ki, nem ' + f(100 * kimarad, 1) + ' %.' }] }),
      szamMezo({
        id: 'z', cimke: 'Hány szórásnyira (két tizedesre)', helyes: zz, tizedes: 2, abszTures: 0.01,
        ellenproba: (w) => `Ellenpróba: ha a határok ${f(w, 2)} szórásnyira lennének, a közbezárt rész ${p4(E.standardF(w) - E.standardF(-w))} volna, a kért ${f(p, 2)} helyett.`,
        hibak: [{ ertek: E.standardKvantilis(p), uzenet: 'Ez az egyoldali kvantilis (a bal oldali terület ' + f(p, 2) + '). Szimmetrikus intervallumnál a bal oldali terület (1 + p)/2 = ' + f((1 + p) / 2, 3) + ' a felső határig.' }],
      }),
    ],
    tippek: [
      `Mekkora része marad ki az intervallumból, és mennyi ennek a fele alul, fele felül?`,
      `A kimaradó rész: 1 − ${f(p, 2)} = ${f(kimarad, 2)}; alul ${f(kimarad / 2, 3)}, felül ${f(kimarad / 2, 3)}. Az alsó határ a ${f(kimarad / 2, 3)} kvantilise, a felső a ${f(1 - kimarad / 2, 3)} kvantilise.`,
      `A szórások száma a z-érték: ${f(zz, 3)}.`,
    ],
    megoldas: [
      `A kimaradó rész: 1 − ${f(p, 2)} = ${f(kimarad, 2)}; ennek fele alul (${f(kimarad / 2, 3)}), fele felül (${f(kimarad / 2, 3)}).`,
      `Alsó határ: kvantilis(${f(kimarad / 2, 3)}) = <strong>${f(alsoX, 2)} ${h.egyseg}</strong>; felső határ: kvantilis(${f(1 - kimarad / 2, 3)}) = <strong>${f(felsoX, 2)} ${h.egyseg}</strong>.`,
      `A határok az átlagtól z = <strong>${f(zz, 3)}</strong> szórásnyira vannak (${f(h.mu)} ± ${f(zz, 3)} · ${f(h.sigma)}).`,
    ],
    magyarazat: [
      `Az átlag körüli, szimmetrikus intervallumot keressük, amely a valószínűség ${pct} %-át tartalmazza. A kimaradó ${f(100 * kimarad, 1)} % kerül a két szélére.`,
      `A harang szimmetrikus, ezért a kimaradó rész fele (${f(50 * kimarad, 2)} %) az alsó, fele a felső szélre esik. Az alsó határtól balra ${f(kimarad / 2, 3)} terület van, a felső határtól jobbra szintén ${f(kimarad / 2, 3)}. Ezekből kvantilissel kapjuk a határokat: ${f(alsoX, 2)} és ${f(felsoX, 2)} ${h.egyseg}.`,
      `A határok az átlagtól ${f(zz, 3)} szórásnyira vannak: ${f(h.mu)} ± ${f(zz, 3)} · ${f(h.sigma)} = ${f(h.mu)} ± ${f(zz * h.sigma, 3)}.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${pct} esik az intervallumba, és kb. ${f(50 * kimarad, 1)} marad ki alul, ${f(50 * kimarad, 1)} felül.`,
      `Józan ésszel: a ${pct} % ${pct >= 95 ? 'az ismert kb. 2 szórásnyi (95 %) környékén van' : 'kisebb, mint a 95 %, ezért az intervallum kevesebb mint 2 szórásnyi sugarú'}; a ${f(zz, 2)} ${pct >= 95 ? '≈ 2' : '< 2'} ✓.`,
    ],
    abraMegoldas: haranAbra({
      mu: h.mu, sigma: h.sigma, savok: [{ a: alsoX, b: felsoX }, { a: -1e9, b: alsoX, osztaly: 'masik' }, { a: felsoX, b: 1e9, osztaly: 'masik' }],
      hatarok: [{ x: alsoX }, { x: felsoX }], xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: `${pct} % + 2 · ${f(50 * kimarad, 2)} %`,
      leiras: `Normális harang: a középső ${pct} % kék, a két kimaradó szél narancssárga.`,
    }),
    geogebra: geogebra([
      `${ggNorm(h)} · kisebb (≤): P(X ≤ x) = ${gg(kimarad / 2, 4)} → alsó határ`,
      `${ggNorm(h)} · kisebb (≤): P(X ≤ x) = ${gg(1 - kimarad / 2, 4)} → felső határ`,
    ], GG_FORDITOTT),
    jegyezze: 'Szimmetrikus intervallum p %-hoz: a kimaradó (1 − p) fele alul, fele felül marad ki. A határok: kvantilis((1 − p)/2) és kvantilis((1 + p)/2).',
  };
}

// =====================================================================
// N9 – becslés (választós)
// =====================================================================
function N9(rng) {
  const h = valaszt(rng, HELYZETEK);
  const valtozat = valaszt(rng, ['fel', 'szelesseg', 'szoras']);
  if (valtozat === 'fel') {
    const z = zErtek(rng, 3, 20);
    const a = hatar(h, z);
    const P = 1 - F(a, h.mu, h.sigma);
    const tobb = P > 0.5;
    const nevek = ['több mint 50 %', 'kevesebb mint 50 %', 'pontosan 50 %'];
    const helyes = tobb ? 0 : 1;
    return {
      szoveg: `${intro(h)} Számolás nélkül, becsléssel: a valószínűsége annak, hogy ${valtozo(h)} több mint ${ert(h, a)}, nagyobb vagy kisebb 50 %-nál?`,
      mezok: [valasztoMezo({
        cimke: 'Válasszon!',
        opciok: nevek.map((sz, i) => (i === helyes ? { szoveg: sz, helyes: true }
          : { szoveg: sz, helyes: false, uzenet: a > h.mu ? 'A határ az átlag fölött van, ezért a nála nagyobb rész kisebb, mint a fele.' : (a < h.mu ? 'A határ az átlag alatt van, ezért a nála nagyobb rész több, mint a fele.' : 'Az átlagnál pontosan fele-fele.'),
            ellenproba: `Ellenpróba: a harang szimmetrikus, az átlag (${ert(h, h.mu)}) két oldalán 50–50 % van. A ${f(a)} ${h.egyseg} ${a > h.mu ? 'fölötte' : 'alatta'} van, ezért a nála nagyobb rész ${P > 0.5 ? 'nagyobb' : 'kisebb'} 50 %-nál (pontosan ${p4(P)}).` })),
      })],
      tippek: [`Hol van a ${f(a)} az átlaghoz (${f(h.mu)}) képest? Hány százalék van az átlagtól jobbra?`, 'A normális eloszlás szimmetrikus: az átlagtól jobbra és balra is 50 % van.'],
      megoldas: [`Az átlag ${f(h.mu)}, a határ ${f(a)}: ${a > h.mu ? 'az átlag fölött' : 'az átlag alatt'}.`, `A nála nagyobb rész <strong>${nevek[helyes]}</strong> (pontosan ${p4(P)}).`],
      magyarazat: [
        `Azt kérdezik, számolás nélkül, hogy a ${f(a)} ${h.egyseg} feletti rész 50 %-nál több vagy kevesebb.`,
        `A harang szimmetrikus, a közepe az átlag (${ert(h, h.mu)}): az átlagtól jobbra és balra is a terület fele, 50 % van. A ${f(a)} ${h.egyseg} ${a > h.mu ? 'az átlagtól jobbra' : 'az átlagtól balra'} esik, így a tőle jobbra eső rész ${a > h.mu ? 'a jobb oldali fél része, tehát 50 %-nál kisebb' : 'a jobb oldali fél egésze és még egy darab a bal oldaliból, tehát 50 %-nál nagyobb'}.`,
        `Képzelje el, hogy 100 ${h.egyed} közül választunk: kb. ${f(100 * P, 1)} lesz a megadott értéknél nagyobb.`,
        `Józan ésszel: a pontos érték ${p4(P)}, ami ${P > 0.5 ? 'több' : 'kevesebb'} 50 %-nál – a becslésünk jó irányt mutatott ✓.`,
      ],
      abraMegoldas: haranAbra({ mu: h.mu, sigma: h.sigma, savok: [{ a, b: 1e9 }], hatarok: [{ x: a }], xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: `P = ${p4(P)}`, leiras: `Normális harang: a ${f(a)} ${h.egyseg} feletti terület kiszínezve.` }),
      jegyezze: 'Becslés: az átlagtól jobbra és balra is 50 % van. Ha a határ az átlag fölött van, a nála nagyobb rész 50 %-nál kisebb.',
    };
  }
  if (valtozat === 'szelesseg') {
    const [p1, p2] = valaszt(rng, [[90, 95], [80, 90], [95, 99], [90, 98]]);
    const z1 = E.standardKvantilis((1 + p1 / 100) / 2), z2 = E.standardKvantilis((1 + p2 / 100) / 2);
    const nevek = [`a ${p2} %-os`, `a ${p1} %-os`, 'egyforma széles'];
    const szel1 = 2 * z1 * h.sigma, szel2 = 2 * z2 * h.sigma;
    return {
      szoveg: `${intro(h)} Két, az átlag körüli szimmetrikus intervallumot képezünk: az egyik a ${p1} %-ot, a másik a ${p2} %-ot tartalmazza. Melyik lesz szélesebb?`,
      mezok: [valasztoMezo({
        cimke: 'Válasszon!',
        opciok: nevek.map((sz, i) => (i === 0 ? { szoveg: sz, helyes: true }
          : { szoveg: sz, helyes: false, uzenet: 'Minél nagyobb valószínűséget akarunk lefedni, annál szélesebb intervallum kell.',
            ellenproba: `Ellenpróba: a ${p1} %-os intervallum szélessége 2 · ${f(z1, 3)} · ${f(h.sigma)} = ${f(szel1, 2)} ${h.egyseg}, a ${p2} %-osé 2 · ${f(z2, 3)} · ${f(h.sigma)} = ${f(szel2, 2)} ${h.egyseg}, ez a szélesebb.` })),
      })],
      tippek: ['Melyik intervallumnak kell több valószínűséget (nagyobb területet) lefednie a harang alatt?', 'Minél nagyobb valószínűséget akarunk, annál messzebbre kell menni az átlagtól.'],
      megoldas: [`${p1} %: ±${f(z1, 3)}σ → szélesség ${f(szel1, 2)} ${h.egyseg}; ${p2} %: ±${f(z2, 3)}σ → szélesség ${f(szel2, 2)} ${h.egyseg}.`, `A <strong>${nevek[0]}</strong> intervallum a szélesebb.`],
      magyarazat: [
        `Azt kérdezik, melyik szimmetrikus intervallum szélesebb: amelyik a ${p1} %-ot vagy amelyik a ${p2} %-ot tartalmazza.`,
        `A harang középen a legmagasabb, a szélek felé elvékonyodik. Hogy több valószínűséget (nagyobb területet) fedjünk le, az átlagtól messzebbre kell menni, mindkét irányban. A ${p2} %-hoz ±${f(z2, 3)}σ, a ${p1} %-hoz ±${f(z1, 3)}σ kell.`,
        `Képzelje el, hogy 100 ${h.egyed} közül választunk: a ${p1} %-os sávba kb. ${p1}, a ${p2} %-osba kb. ${p2} esik; a nagyobb szám messzebbre nyúlik.`,
        `Józan ésszel: ${f(szel2, 2)} ${h.egyseg} > ${f(szel1, 2)} ${h.egyseg}, tehát a ${p2} %-os intervallum a szélesebb ✓.`,
      ],
      abraMegoldas: haranAbra({
        mu: h.mu, sigma: h.sigma, savok: [{ a: h.mu - z2 * h.sigma, b: h.mu + z2 * h.sigma, osztaly: 'masik' }, { a: h.mu - z1 * h.sigma, b: h.mu + z1 * h.sigma }],
        hatarok: [{ x: h.mu - z2 * h.sigma }, { x: h.mu + z2 * h.sigma }], xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: `${p1} % (kék) és ${p2} % (narancs)`, leiras: `Normális harang: a ${p1} %-os és a ${p2} %-os szimmetrikus intervallum.`,
      }),
      jegyezze: 'Nagyobb lefedett valószínűség → szélesebb szimmetrikus intervallum (kb. 68 % ≈ ±1σ, 95 % ≈ ±2σ, 99,7 % ≈ ±3σ).',
    };
  }
  // szórás hatása
  const z = valaszt(rng, [0.5, 1, 1.5]);
  const d = tisztit(z * h.sigma);
  const P1 = E.standardF(z) - E.standardF(-z);
  const ujSigma = h.sigma * 1.5;
  const P2 = E.standardF(d / ujSigma) - E.standardF(-d / ujSigma);
  const nevek = ['kisebb lenne', 'nagyobb lenne', 'ugyanakkora maradna'];
  return {
    szoveg: `${intro(h)} Az átlag körüli ± ${ert(h, d)} sávba esés valószínűsége egy bizonyos érték. Ha a szórás nagyobb lenne (az átlag ugyanennyi maradna), ez a valószínűség nagyobb vagy kisebb lenne?`,
    mezok: [valasztoMezo({
      cimke: 'Válasszon!',
      opciok: nevek.map((sz, i) => (i === 0 ? { szoveg: sz, helyes: true }
        : { szoveg: sz, helyes: false, uzenet: 'Nagyobb szórásnál laposabb, szélesebb a harang: a terület nagyobb része esik a szélekre, a középső sávba kevesebb.',
          ellenproba: `Ellenpróba: σ = ${f(h.sigma)} mellett a ±${f(d)} sáv ${f(z, 2)} szórásnyi, valószínűsége ${p4(P1)}; σ = ${f(ujSigma, 2)} mellett ugyanez csak ${f(d / ujSigma, 2)} szórásnyi, valószínűsége ${p4(P2)}.` })),
    })],
    tippek: ['Hogyan változik a harang alakja, ha a szórás nagyobb? Hány szórásnyi a sáv ekkor?', 'Nagyobb szórásnál a harang laposabb és szélesebb; ugyanaz a sáv kevesebb szórásnyi, tehát kisebb része esik bele.'],
    megoldas: [`σ = ${f(h.sigma)}: a sáv ±${f(z, 2)}σ, valószínűsége ${p4(P1)}.`, `σ = ${f(ujSigma, 2)}: a sáv csak ±${f(d / ujSigma, 2)}σ, valószínűsége ${p4(P2)} → <strong>kisebb lenne</strong>.`],
    magyarazat: [
      `Azt kérdezik, hogyan változik a ± ${ert(h, d)} sávba esés valószínűsége, ha a szórás nagyobb.`,
      `A szórás a harang szélességét adja meg. Nagyobb szórásnál a harang laposabb és szélesebb: több érték esik távol az átlagtól, így az átlag körüli rögzített sávba kevesebb.`,
      `Képzelje el, hogy 100 ${h.egyed} közül választunk: σ = ${f(h.sigma)} mellett kb. ${f(100 * P1, 1)} esik a sávba, σ = ${f(ujSigma, 2)} mellett csak kb. ${f(100 * P2, 1)}.`,
      `Józan ésszel: a sáv ugyanaz maradt, de egyre kisebb része a „testnek”: ${p4(P2)} < ${p4(P1)} ✓.`,
    ],
    abraMegoldas: haranAbra({ mu: h.mu, sigma: h.sigma, savok: [{ a: h.mu - d, b: h.mu + d }], hatarok: [{ x: h.mu - d }, { x: h.mu + d }], xfelirat: `${h.tulaj} (${h.egyseg})`, felirat: `P = ${p4(P1)}`, leiras: `Normális harang: az átlag körüli ± ${f(d)} ${h.egyseg} sáv kiszínezve.` }),
    jegyezze: 'Nagyobb szórás → laposabb, szélesebb harang → egy rögzített, az átlag körüli sávba kisebb valószínűséggel esik az érték.',
  };
}

// =====================================================================
// Kidolgozott példák (SPEC 5.9, ellenőrzött értékek)
// =====================================================================
const P1 = { mu: 160, sigma: 10 };
export default {
  id: 'normalis',
  cim: 'Normális eloszlás',
  rovid: 'Harang alakú eloszlás: kisebb/nagyobb/közötti valószínűség, eltérés az átlagtól, fordított kérdések és szimmetrikus intervallum.',
  kulcskeplet: '<span class="keplet-nagy">Normális eloszlás: μ (átlag) és σ (szórás)</span>',
  kulcsMagyarazat: [
    '<strong>Normális eloszlás = szimmetrikus harang</strong>, két paramétere: <strong>μ (várható érték, a csúcs helye)</strong> és <strong>σ (szórás)</strong>.',
    'A valószínűség a görbe alatti <strong>terület</strong>. Egy konkrét érték valószínűsége <strong>0</strong> → <strong>mindegy, hogy &lt; vagy ≤</strong>.',
    'μ ± 1σ: ≈ 68 %, μ ± 2σ: ≈ 95 %.',
  ],
  elmelet: [
    '<strong>Folytonos változó:</strong> egy intervallumon bármilyen értéket felvehet (tömeg, térfogat, idő). Szemléltetés: dinnyék ládákba válogatva → hisztogram → sűrűségfüggvény; a teljes terület 1.',
    'Alkalmazás: méretingadozás gyártásban (töltőgép, csoki), bevétel, magasság, tömeg.',
    'A szimmetria miatt az átlagnál kisebb és nagyobb értékek aránya 50–50 %.',
    '<strong>Kérdéstípusok:</strong> kisebb / nagyobb / két érték közé esik; „eltér az átlagtól legfeljebb d-vel / t szórással” (μ ± d); „több mint d-vel tér el” (1 − a középső rész); <strong>fordított</strong>: adott a valószínűség, a határ a kérdés (a valószínűséget beírjuk); <strong>szimmetrikus intervallum</strong> p %-hoz: kimarad (1 − p), ennek fele alul, fele felül.',
    'Diszkrét eloszlásnál (8. téma) a határ beleértése számít, itt nem.',
  ],
  peldak: [
    {
      cim: 'Paradicsom – N(160; 10)', feladat: 'A paradicsomok tömege normális eloszlású, átlaga 160 g, szórása 10 g. Mennyi a valószínűsége, hogy egy paradicsom kisebb 160 g-nál? Nehezebb 175 g-nál? A 141,5 és 178,5 g (±1,85σ) közé esik? Több mint 12 g-mal tér el az átlagtól?',
      abra: () => haranAbra({ ...P1, savok: [{ a: 175, b: 1e9 }], hatarok: [{ x: 175 }], xfelirat: 'tömeg (g)', felirat: 'P(X > 175) = 0,0668', leiras: 'Normális harang N(160; 10): a 175 g feletti terület kiszínezve.' }),
      lepesek: [
        'Kisebb, mint 160 g (az átlag): a szimmetria miatt <strong>50 %</strong>.',
        'Nehezebb 175 g-nál: 1 − F(175) = <strong>6,68 %</strong> (a 175 az átlag fölött van 1,5 szórásnyira).',
        '141,5–178,5 g (±1,85σ): F(178,5) − F(141,5) = <strong>93,57 %</strong>.',
        'Több mint 12 g-mal tér el: a középső sáv 148–172 g, a két szélső rész 1 − 0,7699 = <strong>23,01 %</strong>.',
      ],
    },
    {
      cim: 'Paradicsom – fordított kérdések', feladat: 'Ugyanezek a paradicsomok: a 90 %-uk nagyobb, mint hány gramm? A 35 %-uk kisebb, mint hány gramm? Melyik szimmetrikus intervallumba esik a 80 %-uk?',
      abra: () => haranAbra({ ...P1, savok: [{ a: 147.2, b: 172.8 }, { a: -1e9, b: 147.2, osztaly: 'masik' }, { a: 172.8, b: 1e9, osztaly: 'masik' }], hatarok: [{ x: 147.2 }, { x: 172.8 }], xfelirat: 'tömeg (g)', felirat: '80 % + 10 % + 10 %', leiras: 'Normális harang N(160; 10): a középső 80 % és a két kimaradó 10 %.' }),
      lepesek: [
        'A 90 %-uk <strong>nagyobb</strong>: a bal oldali terület 1 − 0,9 = 0,1 → x = <strong>147,18 g</strong>.',
        'A 35 %-uk <strong>kisebb</strong>: a bal oldali terület 0,35 → x = <strong>156,15 g</strong>.',
        '80 % szimmetrikusan: kimarad 20 %, alul 10 %, felül 10 % → <strong>147,2–172,8 g</strong>.',
      ],
    },
    {
      cim: 'Ásványvíz – N(200; 5)', feladat: 'Az ásványvizes palack töltete normális eloszlású, átlaga 200 ml, szórása 5 ml. Mennyi a valószínűsége, hogy több mint 198 ml? Kevesebb mint 201 ml? Pontosan 200 ml? 195 és 205 ml között? Több mint 2σ-val tér el az átlagtól?',
      lepesek: [
        '> 198 ml: <strong>0,6554</strong>; < 201 ml: <strong>0,5793</strong>.',
        'Pontosan 200 ml: folytonos változónál egy konkrét érték valószínűsége <strong>0</strong>.',
        '195–205 ml (±1σ): <strong>0,6827</strong>. Több mint 2σ eltérés (a 190–210 sávon kívül): <strong>0,0455</strong>.',
      ],
    },
    {
      cim: 'Balaton szelet – N(25; 1,5)', feladat: 'Egy Balaton szelet tömege normális eloszlású, átlaga 25 g, szórása 1,5 g. P(több mint 24 g)? P(23–27 g)? A 90 %-uk kisebb, mint? A 40 %-uk nagyobb, mint?',
      lepesek: [
        '> 24 g: <strong>0,7475</strong>; 23–27 g: <strong>0,8176</strong>.',
        'A 90 %-uk kisebb: x = <strong>26,92 g</strong>. A 40 %-uk nagyobb: a bal oldali terület 0,6 → x = <strong>25,38 g</strong>.',
      ],
    },
    {
      cim: 'Narancslé – N(20; 0,5)', feladat: 'A narancslé térfogata normális eloszlású, átlaga 20 dl, szórása 0,5 dl. ±1,8σ valószínűsége? A 70 %-uk kevesebb, mint? A 90 %-uk több, mint? 95 % és 98 % szimmetrikus intervallum?',
      lepesek: [
        '±1,8σ: 1,8 · 0,5 = 0,9 → 19,1–20,9 dl: <strong>0,9281</strong>.',
        'A 70 %-uk kevesebb: <strong>20,26 dl</strong>. A 90 %-uk több: a bal oldali terület 0,1 → <strong>19,36 dl</strong>.',
        '95 % szimmetrikus: <strong>19,02–20,98 dl</strong> (≈ 1,96σ). 98 %: <strong>18,84–21,16 dl</strong> (≈ 2,33σ).',
      ],
    },
    {
      cim: 'Vízfogyasztás – N(1; 0,3)', feladat: 'A napi vízfogyasztás normális eloszlású, átlaga 1 liter, szórása 0,3 liter. P(0,8–1,2 liter)? ±0,1 liter? 90 % és 96 % szimmetrikus intervallum?',
      lepesek: [
        '0,8–1,2 liter: <strong>0,4950</strong>; ±0,1 liter (0,9–1,1): <strong>0,2611</strong>.',
        '90 % szimmetrikus: <strong>0,507–1,493 liter</strong>. 96 %: <strong>0,384–1,616 liter</strong> (≈ 2,054σ).',
      ],
    },
    {
      cim: 'Alma – N(28; 8)', feladat: 'Az alma tömege normális eloszlású, átlaga 28 dkg, szórása 8 dkg. Mennyi a valószínűsége, hogy több mint 10 dkg-mal tér el az átlagtól? Kevesebb mint 1,7σ-val? Több mint 1,5σ-val?',
      lepesek: [
        'Több mint 10 dkg eltérés: a középső sáv 18–38 dkg, a két szélső rész 1 − 0,7887 = <strong>0,2113</strong>.',
        'Kevesebb mint 1,7σ: 1,7 · 8 = 13,6 → 14,4–41,6 dkg: <strong>0,9109</strong>.',
        'Több mint 1,5σ: 1,5 · 8 = 12 → 16–40 dkg, a szélek: <strong>0,1336</strong>.',
      ],
    },
  ],
  tipusok: [
    { id: 'N1', nev: 'Kisebb / nagyobb', general: N1 },
    { id: 'N2', nev: 'Két érték között', general: N2 },
    { id: 'N3', nev: 'Eltérés az átlagtól – legfeljebb', general: N3 },
    { id: 'N4', nev: 'Eltérés az átlagtól – több mint', general: N4 },
    { id: 'N5', nev: 'Pontos érték', general: N5 },
    { id: 'N6', nev: 'Fordított: kisebb, mint?', general: N6 },
    { id: 'N7', nev: 'Fordított: nagyobb, mint?', general: N7 },
    { id: 'N8', nev: 'Szimmetrikus intervallum', general: N8 },
    { id: 'N9', nev: 'Becslés (választós)', general: N9, tesztbe: false },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva. */
  peldaEllenorzes() {
    const k4 = (x) => kerekit(x, 4), k2 = (x) => kerekit(x, 2), k3 = (x) => kerekit(x, 3);
    const t = (a, b, mu, s) => E.normalisTartomany(a, b, mu, s);
    const K = E.kvantilis;
    return [
      { nev: '1. példa: < 160', kapott: k4(F(160, 160, 10)), vart: 0.5 },
      { nev: '1. példa: > 175', kapott: k4(1 - F(175, 160, 10)), vart: 0.0668 },
      { nev: '1. példa: ±1,85σ', kapott: k4(t(141.5, 178.5, 160, 10)), vart: 0.9357 },
      { nev: '1. példa: több mint 12 g', kapott: k4(1 - t(148, 172, 160, 10)), vart: 0.2301 },
      { nev: '1. példa: 90 % nagyobb', kapott: k2(K(0.1, 160, 10)), vart: 147.18 },
      { nev: '1. példa: 35 % kisebb', kapott: k2(K(0.35, 160, 10)), vart: 156.15 },
      { nev: '1. példa: 80 % alsó', kapott: kerekit(K(0.1, 160, 10), 1), vart: 147.2 },
      { nev: '1. példa: 80 % felső', kapott: kerekit(K(0.9, 160, 10), 1), vart: 172.8 },
      { nev: '2. példa: > 198', kapott: k4(1 - F(198, 200, 5)), vart: 0.6554 },
      { nev: '2. példa: < 201', kapott: k4(F(201, 200, 5)), vart: 0.5793 },
      { nev: '2. példa: 195–205', kapott: k4(t(195, 205, 200, 5)), vart: 0.6827 },
      { nev: '2. példa: több mint 2σ', kapott: k4(1 - t(190, 210, 200, 5)), vart: 0.0455 },
      { nev: '3. példa: > 24', kapott: k4(1 - F(24, 25, 1.5)), vart: 0.7475 },
      { nev: '3. példa: 23–27', kapott: k4(t(23, 27, 25, 1.5)), vart: 0.8176 },
      { nev: '3. példa: 90 % kisebb', kapott: k2(K(0.9, 25, 1.5)), vart: 26.92 },
      { nev: '3. példa: 40 % nagyobb', kapott: k2(K(0.6, 25, 1.5)), vart: 25.38 },
      { nev: '4. példa: ±1,8σ', kapott: k4(t(19.1, 20.9, 20, 0.5)), vart: 0.9281 },
      { nev: '4. példa: 70 % kevesebb', kapott: k2(K(0.7, 20, 0.5)), vart: 20.26 },
      { nev: '4. példa: 90 % több', kapott: k2(K(0.1, 20, 0.5)), vart: 19.36 },
      { nev: '4. példa: 95 % alsó', kapott: k2(K(0.025, 20, 0.5)), vart: 19.02 },
      { nev: '4. példa: 95 % felső', kapott: k2(K(0.975, 20, 0.5)), vart: 20.98 },
      { nev: '4. példa: 98 % alsó', kapott: k2(K(0.01, 20, 0.5)), vart: 18.84 },
      { nev: '4. példa: 98 % felső', kapott: k2(K(0.99, 20, 0.5)), vart: 21.16 },
      { nev: '5. példa: 0,8–1,2', kapott: k4(t(0.8, 1.2, 1, 0.3)), vart: 0.495 },
      { nev: '5. példa: ±0,1', kapott: k4(t(0.9, 1.1, 1, 0.3)), vart: 0.2611 },
      { nev: '5. példa: 90 % alsó', kapott: k3(K(0.05, 1, 0.3)), vart: 0.507 },
      { nev: '5. példa: 90 % felső', kapott: k3(K(0.95, 1, 0.3)), vart: 1.493 },
      { nev: '5. példa: 96 % alsó', kapott: k3(K(0.02, 1, 0.3)), vart: 0.384 },
      { nev: '5. példa: 96 % felső', kapott: k3(K(0.98, 1, 0.3)), vart: 1.616 },
      { nev: '5. példa: 96 % z', kapott: k3(E.standardKvantilis(0.98)), vart: 2.054 },
      { nev: '6. példa: több mint 10 dkg', kapott: k4(1 - t(18, 38, 28, 8)), vart: 0.2113 },
      { nev: '6. példa: kevesebb mint 1,7σ', kapott: k4(t(28 - 13.6, 28 + 13.6, 28, 8)), vart: 0.9109 },
      { nev: '6. példa: több mint 1,5σ', kapott: k4(1 - t(16, 40, 28, 8)), vart: 0.1336 },
    ];
  },
};
