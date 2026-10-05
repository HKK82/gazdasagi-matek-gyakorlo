// 6. téma – Közgazdasági függvények vizsgálata (v4): harmadfokú profitfüggvény és átlagköltség-függvény
import { egesz } from '../lib/rng.js';
import { szep, kerekit } from '../lib/szam.js';
import { szamMezo } from '../lib/ellenorzo.js';
import { koordinataRendszer, szepLepes } from '../lib/abra.js';
import { probal, f, gg } from './seged.js';

// ---- Tiszta számolófüggvények (a példák és a tesztek is ezt használják) ----
/**
 * Harmadfokú profitfüggvény a csúcsok helyéből: pr'(x) = −3(x − m₁)(x − m₂)
 * → pr(x) = −x³ + 1,5(m₁ + m₂)x² − 3m₁m₂x + c  (m₁ a minimum, m₂ a maximum helye).
 */
export const profitFv = ({ m1, m2, c }) => (x) => -(x ** 3) + 1.5 * (m1 + m2) * x * x - 3 * m1 * m2 * x + c;
/** Átlagköltség: ac(x) = x + b + k²/x; a minimum x = k-nál van, értéke 2k + b. */
export const atlagFv = ({ b, k }) => (x) => x + b + (k * k) / x;
/** Gyök keresése felezéssel egy előjelváltó [a, b] szakaszon. */
export function gyok(fn, a, b) {
  let lo = a, hi = b;
  const flo = fn(lo);
  for (let i = 0; i < 200; i++) {
    const kozep = (lo + hi) / 2, fk = fn(kozep);
    if ((fk > 0) === (flo > 0)) lo = kozep; else hi = kozep;
  }
  return (lo + hi) / 2;
}
/** A feltételt kielégítő egymás utáni egészek első összefüggő sora: { lo, hi } vagy null. */
export function egeszHatarok(fn, feltetel, tol = 0, ig = 400) {
  let lo = null, hi = null;
  for (let n = tol; n <= ig; n++) {
    if (feltetel(fn(n))) { if (lo === null) lo = n; hi = n; } else if (lo !== null) break;
  }
  return lo === null ? null : { lo, hi };
}

const toredek = (x) => x - Math.floor(x);
const nemEgesz = (x) => toredek(x) > 0.06 && toredek(x) < 0.94;
const fvSzoveg = ({ m1, m2, c }) => `pr(x) = −x³ + ${f(1.5 * (m1 + m2))}x² − ${f(3 * m1 * m2)}x ${c < 0 ? '−' : '+'} ${f(Math.abs(c))}`;
const acSzoveg = ({ b, k }) => `ac(x) = x + ${f(b)} + ${f(k * k)}/x`;
const fvGG = ({ m1, m2, c }) => `pr(x)=-x^3+${gg(1.5 * (m1 + m2))}x^2-${gg(3 * m1 * m2)}x${c < 0 ? '-' : '+'}${gg(Math.abs(c))}`;
const acGG = ({ b, k }) => `ac(x)=x+${gg(b)}+${gg(k * k)}/x`;

const VALLALKOZASOK = [
  { nev: 'Egy autókereskedés', mit: 'naponta eladott autók száma' },
  { nev: 'Egy kerékpárbolt', mit: 'naponta eladott kerékpárok száma' },
  { nev: 'Egy bútorgyár', mit: 'naponta legyártott és eladott szekrények száma' },
  { nev: 'Egy laptopműhely', mit: 'naponta összeszerelt és eladott laptopok száma' },
];

/** Harmadfokú profitfüggvény paraméterei (a csúcsok egészek, a metszéspontok nem egészek, a maximum kerek). */
function profitParam(rng) {
  return probal(() => {
    const m1 = egesz(rng, 5, 35);
    const m2 = m1 + 2 * egesz(rng, 8, 30);
    const base = 0.5 * m2 ** 3 - 1.5 * m1 * m2 * m2;
    if (!Number.isInteger(base) || base % 50 !== 0) return null;
    const c = -50 * egesz(rng, 1, 200);
    const T = base + c;
    if (T < 2000 || T > 40000) return null;
    const P = { m1, m2, c };
    const fn = profitFv(P);
    const x1 = gyok(fn, m1, m2), x2 = gyok(fn, m2, 6 * m2);
    if (!nemEgesz(x1) || !nemEgesz(x2) || x2 > 160) return null;
    const v = VALLALKOZASOK[egesz(rng, 0, VALLALKOZASOK.length - 1)];
    const xmax = Math.ceil((x2 + 10) / 10) * 10;
    return { ...P, fn, T, min: fn(m1), x1, x2, xmax, v };
  });
}
const profitSzoveg = (P) => `${P.v.nev} napi profitját (euróban) a ${fvSzoveg(P)} függvény írja le, ahol x a ${P.v.mit} (0 ≤ x ≤ ${P.xmax}).`;

/** Átlagköltség paraméterei: a minimum egész helyen van (k egész). */
function atlagParam(rng) {
  return probal(() => {
    const k = egesz(rng, 8, 60), b = 50 * egesz(rng, 4, 30);
    const fn = atlagFv({ b, k });
    return { b, k, fn, min: 2 * k + b, xmax: Math.ceil((4 * k) / 10) * 10 + 10 };
  });
}
const atlagSzoveg = (A) => `Egy üzem x darab termék gyártásánál az egy termékre jutó átlagköltséget (euró/db) az ${acSzoveg(A)} függvény írja le (x ≥ 1).`;

// ---- Ábrák ----
function profitAbra({ P, vizsz = [], savok = [], pontok = [], xmax = P.xmax, leiras }) {
  const alja = Math.min(P.min, ...pontok.map((p) => p.y), 0), teteje = Math.max(P.T, ...vizsz.map((v) => v.y)) * 1.12;
  const yl = szepLepes(teteje - alja, 6), xl = szepLepes(xmax, 8);
  return koordinataRendszer({
    xmin: 0, xmax: Math.ceil(xmax / xl) * xl, ymin: Math.floor((alja * 1.1) / yl) * yl, ymax: Math.ceil(teteje / yl) * yl,
    xlepes: xl, ylepes: yl, gorbek: [{ fn: P.fn, osztaly: 'v1', cimke: 'pr(x)', cimkeX: xmax * 0.97 }],
    vizszintesek: vizsz, savok, pontok, xfelirat: 'x (db)', yfelirat: 'profit (€)', leiras, szel: 540, mag: 400, bal: 72,
  });
}
function atlagAbra({ A, vizsz = [], savok = [], pontok = [], xmax = A.xmax, leiras }) {
  const tetejeNyers = Math.max(A.fn(Math.max(1, xmax * 0.06)), ...vizsz.map((v) => v.y)) * 1.1;
  const teteje = Math.min(tetejeNyers, A.min * 2.2), yl = szepLepes(teteje, 6), xl = szepLepes(xmax, 8);
  return koordinataRendszer({
    xmin: 0, xmax: Math.ceil(xmax / xl) * xl, ymin: 0, ymax: Math.ceil(teteje / yl) * yl, xlepes: xl, ylepes: yl,
    gorbek: [{ fn: A.fn, tol: Math.max(0.5, xmax * 0.01), osztaly: 'v1', cimke: 'ac(x)', cimkeX: xmax * 0.97 }],
    vizszintesek: vizsz, savok, pontok, xfelirat: 'x (db)', yfelirat: 'átlagköltség (€/db)', leiras, szel: 540, mag: 400, bal: 64,
  });
}

// ---- Ellenpróba-segédek: a hallgató saját számával ----
const ftk = (x) => f(x, 2);
/** Csúcs/völgy ellenpróba: a szomszédos egészek behelyettesítésével. */
function csucsEllen(fn, nev, tipus) {
  return (w) => {
    const elo = fn(w - 1), mo = fn(w), ut = fn(w + 1);
    const ok = tipus === 'max' ? mo > elo && mo > ut : mo < elo && mo < ut;
    const mutat = `${nev}(${f(w - 1)}) = ${ftk(elo)}, ${nev}(${f(w)}) = ${ftk(mo)}, ${nev}(${f(w + 1)}) = ${ftk(ut)}`;
    if (ok) return `Ellenpróba: ${mutat} – itt ${tipus === 'max' ? 'valóban csúcs' : 'valóban völgy'} van.`;
    const jobb = tipus === 'max' ? ut > mo : ut < mo;
    return `Ellenpróba: ${mutat} – ${jobb ? 'jobbra' : 'balra'} még ${tipus === 'max' ? 'nagyobb' : 'kisebb'} az érték, tehát ez nem a ${tipus === 'max' ? 'csúcs' : 'minimum'}.`;
  };
}
/** Határ-ellenpróba (nyereséges / több mint K / kisebb mint K): a hallgató egész határának behelyettesítése. */
function hatarEllen({ fn, nev, felt, igaz, hamis, fajta }) {
  return (w) => {
    const v = fn(w), ok = felt(v);
    const alap = `Ellenpróba: ${nev}(${f(w)}) = ${ftk(v)}`;
    if (!ok) return `${alap} – ${hamis}, tehát ${fajta === 'also' ? 'az alsó határ ennél nagyobb' : 'a felső határ ennél kisebb'}.`;
    const szomszed = fajta === 'also' ? w - 1 : w + 1;
    if (felt(fn(szomszed))) return `${alap} – ${igaz}, de ${nev}(${f(szomszed)}) = ${ftk(fn(szomszed))} is ${igaz}, tehát ${fajta === 'also' ? 'az alsó határ ennél kisebb' : 'a felső határ ennél nagyobb'}.`;
    return `${alap} – ${igaz}, és a szomszédos egész már nem: ez a határ.`;
  };
}

// =====================================================================
// G1 – maximális profit
// =====================================================================
function G1(rng) {
  const P = profitParam(rng), { m1, m2, T, fn } = P;
  return {
    szoveg: `${profitSzoveg(P)} Hány darabnál maximális a profit, és mennyi ekkor a profit?`,
    mezok: [
      szamMezo({
        id: 'db', cimke: 'Hány darabnál maximális a profit?', helyes: m2, tizedes: 0, egyseg: 'db', ellenproba: csucsEllen(fn, 'pr', 'max'),
        hibak: [
          { ertek: m1, uzenet: 'Ez a minimum helye (a görbe völgye). A maximumot a Maximum parancs adja, olyan intervallummal, amelyben a csúcs benne van.' },
          { ertek: 100, uzenet: 'Az intervallum széle nem csúcs; adjon meg szélesebb intervallumot, vagy nézze meg, hol fordul meg a grafikon.' },
        ],
      }),
      szamMezo({
        id: 'pr', cimke: 'Mennyi ekkor a profit?', helyes: T, tizedes: 0, egyseg: '€',
        ellenproba: (w) => `Ellenpróba: a legnagyobb profit pr(${m2}) = ${f(T)} €; ${f(w)} € ${w > T ? 'ennél több, ezt a függvény nem éri el' : 'nem a maximum: a csúcsnál nagyobb az érték'}.`,
        hibak: [{ ertek: P.min, uzenet: 'Ez a minimum értéke (veszteség). A maximumhoz a csúcs helyét kell behelyettesíteni.' }],
      }),
    ],
    tippek: [
      'Olvassa végig a feladatot: mi az x, és mi a függvényérték? Melyik pontja a grafikonnak a legmagasabb?',
      `A legmagasabb pont (csúcs) a Maximum(pr, kezdő x, záró x) paranccsal keresendő; az intervallumot úgy adja meg, hogy a csúcs biztosan beleessen (pl. 0 és ${P.xmax} között).`,
      `A csúcs helye az x-koordináta, a profit az y-koordináta: pr(x) a csúcsnál.`,
    ],
    megoldas: [
      `A függvény: ${fvSzoveg(P)}; x a ${P.v.mit}, a függvényérték a profit (€).`,
      `GeoGebrában: Maximum(pr, 0, ${P.xmax}) → a csúcs: (${m2}; ${f(T)}).`,
      `Ellenőrzés: pr(${m2 - 1}) = ${f(fn(m2 - 1))}, pr(${m2}) = ${f(T)}, pr(${m2 + 1}) = ${f(fn(m2 + 1))} → a ${m2} a csúcs.`,
      `Válasz: <strong>${m2} db</strong>, a profit <strong>${f(T)} €</strong>.`,
    ],
    magyarazat: [
      `Azt keressük, hány darabnál a legnagyobb a profit, és mennyi ez a profit. Az x a ${P.v.mit}, a függvényérték a profit euróban.`,
      `A grafikon egy hullámos görbe: eleinte veszteséges, aztán felmegy egy csúcsig, majd újra lecsökken. A legmagasabb pont, a csúcs adja a legnagyobb profitot. A gép a csúcsot megtalálja, ha jól kérdezünk: a Maximum parancsnak olyan intervallumot kell adni, amelyben a csúcs benne van.`,
      `A csúcs x-koordinátája a keresett darabszám (${m2}), az y-koordinátája a profit (${f(T)} €). Képzelje el, hogy a görbén ${m2} darabnál állunk: innen mindkét irányba lefelé visz az út.`,
      `Józan ésszel: a minimumnál (${m1} db) a profit ${f(P.min)} €, a csúcsnál ${f(T)} € – tényleg a ${m2} a legmagasabb pont, mert mellette (${m2 - 1}: ${f(fn(m2 - 1))}, ${m2 + 1}: ${f(fn(m2 + 1))}) kisebb az érték. Rossz intervallum rossz választ ad: ha a ${m2} kívül esik rajta, a gép az intervallum szélét mondja „csúcsnak”.`,
    ],
    geogebra: { sorok: [fvGG(P), `Maximum(pr, 0, ${P.xmax})`], megjegyzes: 'Tengelyarány: jobb klikk a rajzlapon → xTengely : yTengely → 1:1000; utána görgessen kifelé, amíg látszik a függvény. A kitevő után a jobbra nyíllal lépjen vissza.' },
    abraMegoldas: profitAbra({ P, pontok: [{ x: m2, y: T, cimke: `max (${m2}; ${f(T)})` }, { x: m1, y: P.min, cimke: `min (${m1}; ${f(P.min)})` }], leiras: `A profitfüggvény grafikonja: a maximum ${m2} db-nál ${f(T)} €, a minimum ${m1} db-nál ${f(P.min)} €.` }),
    jegyezze: 'Maximum: Maximum(f, kezdő x, záró x) – az intervallumban a csúcs benne legyen. A csúcs x-e a darabszám, y-ja a profit.',
  };
}

// =====================================================================
// G2 – nő / csökken
// =====================================================================
function G2(rng) {
  const P = profitParam(rng), { m1, m2, fn } = P;
  return {
    szoveg: `${profitSzoveg(P)} Mettől meddig nő a profit a darabszám növelésével? (A két határ: a minimum és a maximum helye.)`,
    mezok: [
      szamMezo({
        id: 'also', cimke: 'Innentől nő a profit (db)', helyes: m1, tizedes: 0, egyseg: 'db', ellenproba: csucsEllen(fn, 'pr', 'min'),
        hibak: [
          { ertek: m2, uzenet: 'Felcserélte a két határt: a profit a minimumtól a maximumig nő, tehát az alsó határ a minimum helye.' },
          { ertek: Math.ceil(P.x1), uzenet: 'Ez a nyereségesség határa (itt lesz a profit nulla fölött), nem a minimum helye.' },
        ],
      }),
      szamMezo({
        id: 'felso', cimke: 'Idáig nő a profit (db)', helyes: m2, tizedes: 0, egyseg: 'db', ellenproba: csucsEllen(fn, 'pr', 'max'),
        hibak: [
          { ertek: m1, uzenet: 'Felcserélte a két határt: a profit a maximum helyéig nő, tehát a felső határ a csúcs.' },
          { ertek: Math.floor(P.x2), uzenet: 'Ez a nyereségesség felső határa, nem a csúcs helye. Ezek a nyereségesség határai, nem a csúcsok.' },
        ],
      }),
    ],
    tippek: [
      'Hol vannak a grafikon csúcsai, a völgy és a hegy? Melyik irányba megy a görbe a kettő között?',
      `Balról jobbra haladva a minimumig csökken, a maximumig nő, utána megint csökken. A Minimum(pr, 0, ${m2}) és a Maximum(pr, 0, ${P.xmax}) adja a két helyet.`,
      'Az alsó határ a minimum x-koordinátája, a felső határ a maximum x-koordinátája.',
    ],
    megoldas: [
      `GeoGebrában: Minimum(pr, 0, ${m2}) → (${m1}; ${f(P.min)}); Maximum(pr, 0, ${P.xmax}) → (${m2}; ${f(P.T)}).`,
      `A görbe a minimumig csökken, a maximumig nő, utána megint csökken.`,
      `A profit <strong>${m1} és ${m2} darab között nő</strong> (${m1} &lt; x &lt; ${m2}).`,
    ],
    magyarazat: [
      'Azt keressük, melyik szakaszon megy felfelé a görbe, vagyis hol nő a profit, ha egy darabbal többet adnak el.',
      `Balról jobbra haladva a görbe először lefelé megy a völgyig (minimum), onnan felfelé a hegycsúcsig (maximum), utána megint lefelé. A felfelé menő szakasz a két csúcs között van: ${m1} és ${m2} között.`,
      `Ezt a két helyet a Minimum és a Maximum paranccsal találjuk meg, mindegyiknek olyan intervallumot adva, amelyben az adott csúcs benne van. A minimum (${m1} db) az alsó, a maximum (${m2} db) a felső határ.`,
      `Józan ésszel: pr(${m1}) = ${f(P.min)} € a völgy, pr(${m2}) = ${f(P.T)} € a hegy, a kettő között tényleg nő az érték (pl. pr(${(m1 + m2) / 2}) = ${f(fn((m1 + m2) / 2))} €). A nyereségesség határai nem ezek: azok az x-tengelynél vannak.`,
    ],
    geogebra: { sorok: [fvGG(P), `Minimum(pr, 0, ${m2})`, `Maximum(pr, 0, ${P.xmax})`], megjegyzes: 'Tengelyarány: 1:1000.' },
    abraMegoldas: profitAbra({ P, savok: [{ x1: m1, x2: m2, cimke: 'nő' }], pontok: [{ x: m1, y: P.min, cimke: `min ${m1}` }, { x: m2, y: P.T, cimke: `max ${m2}` }], leiras: `A profit ${m1} és ${m2} darab között nő.` }),
    jegyezze: 'Nő / csökken: a minimumtól a maximumig nő, a minimumig és a maximum után csökken a függvény.',
  };
}

// =====================================================================
// G3 / G4 – nyereséges, illetve több mint K (egész darabszám-határok)
// =====================================================================
function hataros(rng, { kell }) {
  return probal(() => {
    const P = profitParam(rng);
    const K = kell ? 500 * egesz(rng, 1, Math.floor(P.T / 500) - 1) : 0;
    const felt = (y) => y > K;
    const xa = gyok((x) => P.fn(x) - K, P.m1, P.m2), xb = gyok((x) => P.fn(x) - K, P.m2, 6 * P.m2);
    if (!nemEgesz(xa) || !nemEgesz(xb)) return null;
    const h = egeszHatarok(P.fn, felt, 0, 400);
    if (!h || h.hi - h.lo < 2) return null;
    return { P, K, xa, xb, ...h };
  });
}
function G34(rng, kell) {
  const { P, K, xa, xb, lo, hi } = hataros(rng, { kell });
  const { fn } = P;
  const mit = kell ? `több, mint ${f(K)} €` : 'nyereséges';
  const igaz = kell ? `nagyobb, mint ${f(K)}` : 'nyereséges';
  const hamis = kell ? `nem nagyobb, mint ${f(K)}` : 'veszteséges (vagy nulla)';
  const felt = (y) => y > K;
  const eHatar = (fajta) => hatarEllen({ fn, nev: 'pr', felt, igaz, hamis, fajta });
  const kerekitett = Math.round(xa);
  const vonal = kell ? `g(x)=${gg(K)}` : null;
  const metszesSor = kell ? 'Metszéspont(pr, g)' : 'Metszéspont(pr, xTengely)';
  return {
    szoveg: `${profitSzoveg(P)} Hány darabnál ${mit === 'nyereséges' ? 'nyereséges a működés' : `lesz a napi profit ${mit}`}? Adja meg az alsó és a felső határt egész darabszámként!`,
    mezok: [
      szamMezo({
        id: 'alsó', cimke: 'Legalább hány darabnál? (egész)', helyes: lo, tizedes: 0, egyseg: 'db', ellenproba: eHatar('also'),
        hibak: [
          kerekitett !== lo ? { ertek: kerekitett, uzenet: `A darabszám egész, és a metszéspont (${f(xa, 2)}) után kell az első egész, amelynél már teljesül a feltétel: felfelé kell kerekíteni (${lo}).` } : null,
          { ertek: Math.floor(xa), uzenet: `A ${f(xa, 2)} még nem teljesíti a feltételt; az első egész darabszám, ahol igaz, a ${lo}.` },
          { ertek: P.m1, uzenet: 'Ez a minimum helye, nem a határ. A határ ott van, ahol a grafikon átmegy a ' + (kell ? 'szaggatott egyenesen (y = ' + f(K) + ')' : 'tengelyen') + '.' },
        ].filter(Boolean),
      }),
      szamMezo({
        id: 'felső', cimke: 'Legfeljebb hány darabnál? (egész)', helyes: hi, tizedes: 0, egyseg: 'db', ellenproba: eHatar('felso'),
        hibak: [
          Math.ceil(xb) !== hi ? { ertek: Math.ceil(xb), uzenet: `A ${f(xb, 2)} után már nem teljesül a feltétel; az utolsó egész darabszám, ahol még igaz, a ${hi}: lefelé kell kerekíteni.` } : null,
          { ertek: P.m2, uzenet: 'Ez a maximum helye (a csúcs), nem a felső határ. A felső határ a csúcs utáni metszéspont.' },
        ].filter(Boolean),
      }),
    ],
    tippek: [
      kell ? 'Hol van a grafikon az y-tengelyen megadott érték fölött? Mit kell a görbével metszeni?' : 'Mikor pozitív a profit? Hol van ilyenkor a grafikon az x-tengelyhez képest?',
      kell ? `A „több mint ${f(K)}” azt jelenti: a grafikon az y = ${f(K)} egyenes fölött van. Keresse meg a két metszéspontot (GeoGebra: Metszéspont).` : 'Nyereséges = a grafikon az x-tengely fölött van. Keresse meg a két metszéspontot az x-tengellyel.',
      `A darabszám egész: a nem egész metszéspont (${f(xa, 1)}) utáni első egész az alsó, a ${f(xb, 1)} előtti utolsó egész a felső határ. Helyettesítsen be a szomszédos egészekkel.`,
    ],
    megoldas: [
      `GeoGebrában: ${fvGG(P)}${vonal ? `, ${vonal}` : ''}, ${metszesSor} → x ≈ ${f(xa, 2)} és x ≈ ${f(xb, 2)}.`,
      `Alsó határ: pr(${lo - 1}) = ${f(fn(lo - 1))} ${kell ? '≤' : '≤'} ${f(K)}, pr(${lo}) = ${f(fn(lo))} &gt; ${f(K)} → <strong>${lo} db</strong>.`,
      `Felső határ: pr(${hi}) = ${f(fn(hi))} &gt; ${f(K)}, pr(${hi + 1}) = ${f(fn(hi + 1))} ≤ ${f(K)} → <strong>${hi} db</strong>.`,
      `Tehát <strong>${lo} és ${hi} darab között</strong> ${kell ? `a profit több, mint ${f(K)} €` : 'nyereséges a működés'}.`,
    ],
    magyarazat: [
      `${kell ? `Azt keressük, mikor több a profit ${f(K)} €-nál` : 'Azt keressük, mikor nyereséges a működés, vagyis mikor pozitív a profit'}: ${kell ? `a grafikon az y = ${f(K)} egyenes fölött van` : 'a grafikon az x-tengely fölött van'}.`,
      `A görbe ${kell ? 'az egyenest' : 'a tengelyt'} két helyen metszi: ${f(xa, 2)} és ${f(xb, 2)} darabnál. Ezek között van a görbe ${kell ? 'az egyenes' : 'a tengely'} fölött.`,
      `A darabszám egész szám, ezért a nem egész metszéspontból az egész határt a szomszédos egészek behelyettesítésével kapjuk: pr(${lo - 1}) = ${f(fn(lo - 1))} (még nem teljesül), pr(${lo}) = ${f(fn(lo))} (már igen), így az alsó határ ${lo}. Felül: pr(${hi}) = ${f(fn(hi))} (még igen), pr(${hi + 1}) = ${f(fn(hi + 1))} (már nem), így a felső határ ${hi}.`,
      `Józan ésszel: a ${lo}-nál egy darabbal kevesebb már nem elég, a ${hi}-nál egy darabbal több már túl sok. Ha csak kerekítene (${f(xa, 0)}), az alsó határnál rossz választ kapna.`,
    ],
    geogebra: { sorok: [fvGG(P), ...(vonal ? [vonal] : []), metszesSor, `pr(${lo})`], megjegyzes: 'A metszéspontok x-koordinátáját olvassa le, majd a szomszédos egészekre a pr(x) sorral ellenőrizzen.' },
    abraMegoldas: profitAbra({
      P, vizsz: kell ? [{ y: K, cimke: `y = ${f(K)}` }] : [], savok: [{ x1: xa, x2: xb, cimke: kell ? `> ${f(K)}` : 'nyereséges' }],
      pontok: [{ x: xa, y: K, cimke: `${f(xa, 1)}` }, { x: xb, y: K, cimke: `${f(xb, 1)}` }],
      leiras: `A profitfüggvény ${kell ? `az y = ${f(K)} egyenes` : 'az x-tengely'} fölött van ${f(xa, 1)} és ${f(xb, 1)} darab között; az egész határok ${lo} és ${hi}.`,
    }),
    jegyezze: 'Nyereséges / több mint K: a grafikon az x-tengely / az y = K egyenes fölött van. Darabszámnál a nem egész metszéspont utáni / előtti első egész a határ.',
  };
}
const G3 = (rng) => G34(rng, false);
const G4 = (rng) => G34(rng, true);

// =====================================================================
// G5 – függvényérték (profit vagy átlagköltség)
// =====================================================================
function G5(rng) {
  const profitValtozat = rng() < 0.5; // a változatot a próbálkozásokon kívül választjuk, hogy mindkettő egyformán gyakori legyen
  return probal(() => {
    if (profitValtozat) {
      const P = profitParam(rng), { fn } = P;
      const x = egesz(rng, 5, Math.floor(P.m2 * 1.3));
      const v = fn(x);
      const rossz = x ** 3 + 1.5 * (P.m1 + P.m2) * x * x - 3 * P.m1 * P.m2 * x + P.c;
      return {
        szoveg: `${profitSzoveg(P)} Mennyi a profit ${x} darab eladásakor?`,
        mezok: [szamMezo({
          cimke: 'A profit (€)', helyes: v, tizedes: 0, egyseg: '€',
          ellenproba: (w) => `Ellenpróba: pr(${x}) = −${x}³ + ${f(1.5 * (P.m1 + P.m2))} · ${x}² − ${f(3 * P.m1 * P.m2)} · ${x} ${P.c < 0 ? '−' : '+'} ${f(Math.abs(P.c))} = ${f(-(x ** 3))} + ${f(1.5 * (P.m1 + P.m2) * x * x)} − ${f(3 * P.m1 * P.m2 * x)} ${P.c < 0 ? '−' : '+'} ${f(Math.abs(P.c))} = ${f(v)}, nem ${f(w)}.`,
          hibak: [{ ertek: rossz, uzenet: 'A −x³ azt jelenti: −(x³), vagyis előbb hatványozunk, aztán negatívvá tesszük.' }],
        })],
        tippek: [
          'Melyik szám az x ebben a feladatban, és mit kell a függvénybe írni a helyére?',
          `Írja be az x helyére a ${x} értéket mindenhol, és ügyeljen az előjelekre: −x³ = −(${x}³).`,
          `pr(${x}) = −${x}³ + ${f(1.5 * (P.m1 + P.m2))} · ${x}² − ${f(3 * P.m1 * P.m2)} · ${x} ${P.c < 0 ? '−' : '+'} ${f(Math.abs(P.c))}.`,
        ],
        megoldas: [
          `x = ${x}: ${x}³ = ${f(x ** 3)}, ${x}² = ${f(x * x)}.`,
          `pr(${x}) = −${f(x ** 3)} + ${f(1.5 * (P.m1 + P.m2) * x * x)} − ${f(3 * P.m1 * P.m2 * x)} ${P.c < 0 ? '−' : '+'} ${f(Math.abs(P.c))} = <strong>${f(v)} €</strong>.`,
          `GeoGebrában: a pr(${x}) beírása után az algebra-ablakban látszik.`,
        ],
        magyarazat: [
          `A profitot keressük ${x} darabnál: a függvényben az x helyére a ${x} értéket kell írni.`,
          `A függvény tagjai: −x³ (a legnagyobb hatvány), ${f(1.5 * (P.m1 + P.m2))}x², −${f(3 * P.m1 * P.m2)}x és a fix költség (${f(P.c)}). A −x³ azt jelenti: −(x³), tehát ${x}³ = ${f(x ** 3)}, és ezt vesszük negatívan.`,
          `Összeadva: ${f(-(x ** 3))} + ${f(1.5 * (P.m1 + P.m2) * x * x)} − ${f(3 * P.m1 * P.m2 * x)} ${P.c < 0 ? '−' : '+'} ${f(Math.abs(P.c))} = ${f(v)} €.`,
          `Józan ésszel: ${v > 0 ? 'pozitív, tehát nyereséges' : 'negatív, tehát veszteséges'} (a ${f(P.x1, 1)} és ${f(P.x2, 1)} darab között nyereséges a működés, ${x} ${x > P.x1 && x < P.x2 ? 'ezek között van' : 'ezeken kívül van'}). Ha +x³-t számolna, ${f(rossz)} jönne ki – az hibás.`,
        ],
        geogebra: { sorok: [fvGG(P), `pr(${x})`] },
        jegyezze: 'Függvényérték: az x helyére behelyettesítünk. A −x³ jelentése −(x³), előbb hatványozunk.',
      };
    }
    const A = atlagParam(rng), { fn } = A;
    const x = egesz(rng, 3, A.k * 3);
    const v = fn(x);
    if (!szep(v, 2)) return null;
    const rosszV = x + A.b + A.k * A.k;
    return {
      szoveg: `${atlagSzoveg(A)} Mennyi az átlagköltség ${x} darab gyártásakor?`,
      mezok: [szamMezo({
        cimke: 'Az átlagköltség (€/db)', helyes: v, tizedes: 2, egyseg: '€/db',
        ellenproba: (w) => `Ellenpróba: ha az átlagköltség ${f(w, 2)} €/db lenne, a teljes költség ${f(x)} · ${f(w, 2)} = ${f(x * w, 2)} € lenne; ac(${x}) = ${f(x)} + ${f(A.b)} + ${f(A.k * A.k)} : ${f(x)} = ${f(v, 2)} €/db.`,
        hibak: [{ ertek: rosszV, uzenet: 'Kimaradt az osztás: a darabonkénti költséghez a(z) k²/x tagot kell kiszámolni, vagyis a fix költséget osztani x-szel.' }],
      })],
      tippek: [
        'Melyik szám az x, és hová kell beírni? Mit jelent a törtvonal a függvényben?',
        `A „per x” a törtvonalat jelenti: ${f(A.k * A.k)}/x = ${f(A.k * A.k)} : ${f(x)}. Az egész: ${f(x)} + ${f(A.b)} + ${f(A.k * A.k)}/${f(x)}.`,
        `${f(A.k * A.k)} : ${f(x)} = ${f(A.k * A.k / x, 4)}.`,
      ],
      megoldas: [`ac(${x}) = ${f(x)} + ${f(A.b)} + ${f(A.k * A.k)}/${f(x)} = ${f(x)} + ${f(A.b)} + ${f(A.k * A.k / x, 4)} = <strong>${f(v, 2)} €/db</strong>.`],
      magyarazat: [
        `Az egy darabra jutó költséget keressük ${x} darabnál. Az ac(x) függvényben az x helyére a ${x} értéket kell írni.`,
        `A függvényben van egy törtes tag: ${f(A.k * A.k)}/x. Ez a fix költség szétosztva x darabra: ${f(A.k * A.k)} : ${f(x)} = ${f(A.k * A.k / x, 4)}. Minél több darabot gyártunk, annál kevesebb jut egy darabra.`,
        `Összeadva: ${f(x)} + ${f(A.b)} + ${f(A.k * A.k / x, 4)} = ${f(v, 2)} €/db.`,
        `Józan ésszel: az átlagköltség nagyobb az állandó tagnál (${f(v, 2)} > ${f(A.b)}), és nem lehet kisebb a minimumnál (${f(A.min)} €/db). Osztás nélkül ${f(rosszV)} jönne ki – az hibás.`,
      ],
      geogebra: { sorok: [acGG(A), `ac(${x})`], megjegyzes: 'A „per x” osztásjelet a törtvonallal írja be: 2500/x.' },
      jegyezze: 'Átlagköltség: az ac(x) = … + c/x „per x”: a fix költséget osztjuk a darabszámmal.',
    };
  });
}

// =====================================================================
// G6 – minimális átlagköltség
// =====================================================================
function G6(rng) {
  const A = atlagParam(rng), { b, k, fn } = A;
  return {
    szoveg: `${atlagSzoveg(A)} Hány darabnál minimális az átlagköltség, és mennyi ez a minimum?`,
    mezok: [
      szamMezo({
        id: 'db', cimke: 'Hány darabnál minimális?', helyes: k, tizedes: 0, egyseg: 'db', ellenproba: csucsEllen(fn, 'ac', 'min'),
        hibak: [
          { ertek: k * k, uzenet: `A ${f(k * k)} a törtben álló fix költség, nem a darabszám. A minimum helye ennek a négyzetgyöke: √${f(k * k)} = ${f(k)}.` },
          { ertek: b, uzenet: 'Ez az állandó tag, nem a darabszám. A minimum helyét a Minimum parancs adja.' },
        ],
      }),
      szamMezo({
        id: 'ac', cimke: 'Mennyi a minimális átlagköltség?', helyes: 2 * k + b, tizedes: 0, egyseg: '€/db',
        ellenproba: (w) => `Ellenpróba: a minimum ac(${k}) = ${f(k)} + ${f(b)} + ${f(k * k)} : ${f(k)} = ${f(2 * k + b)} €/db; ${f(w)} ${w < 2 * k + b ? 'ennél kisebb értéket a függvény nem vesz fel' : 'nem a legkisebb érték'}.`,
        hibak: [{ ertek: b, uzenet: `Ez csak az állandó tag; a minimumnál még ${f(2 * k)} (az x és a k²/x tag) is hozzáadódik.` }],
      }),
    ],
    tippek: [
      'Mit jelent az, hogy minimális? Melyik pontja a grafikonnak a legalacsonyabb?',
      `A legalacsonyabb pontot a Minimum(ac, 1, ${A.xmax}) adja; az intervallum tartalmazza a minimumot.`,
      'A darabszám az x-, az átlagköltség az y-koordináta.',
    ],
    megoldas: [
      `Minimum(ac, 1, ${A.xmax}) → (${k}; ${f(2 * k + b)}).`,
      `Papíron: a minimum x = √(${f(k * k)}) = ${k} helyen van, ott ac(${k}) = ${f(k)} + ${f(b)} + ${f(k * k)} : ${f(k)} = ${f(2 * k + b)}.`,
      `Válasz: <strong>${k} db</strong>, <strong>${f(2 * k + b)} €/db</strong>.`,
    ],
    magyarazat: [
      'Azt keressük, hány darabnál a legkisebb az egy darabra jutó költség. Ez a görbe legalacsonyabb pontja.',
      `A görbe eleinte lefelé megy (a fix költség egyre több darabra oszlik), aztán felfelé (az x tag miatt a termelés drágul). A két hatás találkozik a minimumnál: ${k} darabnál.`,
      `A minimum helyét a GeoGebra Minimum parancsa adja, olyan intervallummal, amelyben a mélypont benne van. A minimum értéke: ac(${k}) = ${f(k)} + ${f(b)} + ${f(k * k)} : ${f(k)} = ${f(2 * k + b)} €/db.`,
      `Józan ésszel: a szomszédos darabszámoknál az átlagköltség nagyobb (ac(${k - 1}) = ${f(fn(k - 1), 2)}, ac(${k + 1}) = ${f(fn(k + 1), 2)}), és a ${f(b)} állandó tag önmagában kevés: a minimumnál még ${f(2 * k)} hozzáadódik.`,
    ],
    geogebra: { sorok: [acGG(A), `Minimum(ac, 1, ${A.xmax})`], megjegyzes: 'Tengelyarány: 1:20 – utána görgessen kifelé, amíg látszik a függvény.' },
    abraMegoldas: atlagAbra({ A, pontok: [{ x: k, y: 2 * k + b, cimke: `min (${k}; ${f(2 * k + b)})` }], leiras: `Az átlagköltség minimuma ${k} darabnál ${f(2 * k + b)} €/db.` }),
    jegyezze: 'Minimális átlagköltség: Minimum(ac, 1, …); ha c = k², a minimum x = k-nál van, értéke 2k + b.',
  };
}

// =====================================================================
// G7 – átlagköltség < K
// =====================================================================
function G7(rng) {
  return probal(() => {
    const A = atlagParam(rng), { b, k, fn } = A;
    const K = A.min + 5 * egesz(rng, 2, 40);
    const disz = (K - b) ** 2 - 4 * k * k;
    if (disz <= 0) return null;
    const xa = ((K - b) - Math.sqrt(disz)) / 2, xb = ((K - b) + Math.sqrt(disz)) / 2;
    if (!nemEgesz(xa) || !nemEgesz(xb) || xa < 1) return null;
    const h = egeszHatarok(fn, (y) => y < K, 1, 800);
    if (!h || h.hi - h.lo < 2) return null;
    const { lo, hi } = h;
    const felt = (y) => y < K;
    const eHatar = (fajta) => hatarEllen({ fn, nev: 'ac', felt, igaz: `kisebb, mint ${f(K)}`, hamis: `nem kisebb, mint ${f(K)}`, fajta });
    return {
      szoveg: `${atlagSzoveg(A)} Hány darabnál lesz az átlagköltség kisebb, mint ${f(K)} €/db? Adja meg az alsó és a felső határt egész darabszámként!`,
      mezok: [
        szamMezo({
          id: 'alsó', cimke: 'Legalább hány darabnál? (egész)', helyes: lo, tizedes: 0, egyseg: 'db', ellenproba: eHatar('also'),
          hibak: [{ ertek: Math.floor(xa), uzenet: `A ${f(xa, 2)} még nem teljesíti a feltételt; az első egész darabszám, ahol az átlagköltség már ${f(K)} alatt van, a ${lo}.` }, { ertek: A.k, uzenet: 'Ez a minimum helye, nem a határ. A határ a görbe és az y = ' + f(K) + ' egyenes metszéspontja.' }],
        }),
        szamMezo({
          id: 'felső', cimke: 'Legfeljebb hány darabnál? (egész)', helyes: hi, tizedes: 0, egyseg: 'db', ellenproba: eHatar('felso'),
          hibak: [{ ertek: Math.ceil(xb), uzenet: `A ${f(xb, 2)} után már nem teljesül; az utolsó egész, ahol még igaz, a ${hi}: lefelé kell kerekíteni.` }],
        }),
      ],
      tippek: [
        'Mikor kisebb az átlagköltség a megadott értéknél? Hol van ilyenkor a grafikon az y = K egyeneshez képest?',
        `A feltétel azt jelenti: a görbe az y = ${f(K)} egyenes alatt van. Keresse meg a két metszéspontot (GeoGebra: Metszéspont).`,
        `A darabszám egész: a ${f(xa, 1)} utáni első és a ${f(xb, 1)} előtti utolsó egész a határ. Helyettesítsen be.`,
      ],
      megoldas: [
        `GeoGebrában: ${acGG(A)}, g(x)=${gg(K)}, Metszéspont(ac, g) → x ≈ ${f(xa, 2)} és x ≈ ${f(xb, 2)}.`,
        `Alsó: ac(${lo - 1}) = ${f(fn(lo - 1), 2)} ≥ ${f(K)}, ac(${lo}) = ${f(fn(lo), 2)} &lt; ${f(K)} → <strong>${lo} db</strong>.`,
        `Felső: ac(${hi}) = ${f(fn(hi), 2)} &lt; ${f(K)}, ac(${hi + 1}) = ${f(fn(hi + 1), 2)} ≥ ${f(K)} → <strong>${hi} db</strong>.`,
      ],
      magyarazat: [
        `Azt keressük, mikor kisebb az egy darabra jutó költség ${f(K)} €/db-nál: a görbe az y = ${f(K)} egyenes alatt van.`,
        `A görbe az egyenest két helyen metszi (${f(xa, 2)} és ${f(xb, 2)}), a kettő között van az egyenes alatt – a minimum (${f(A.k)} db, ${f(A.min)} €/db) ebben a sávban van.`,
        `A darabszám egész: ac(${lo - 1}) = ${f(fn(lo - 1), 2)} még nem kisebb ${f(K)}-nál, ac(${lo}) = ${f(fn(lo), 2)} már igen → alsó határ ${lo}. Felül: ac(${hi}) = ${f(fn(hi), 2)} még igen, ac(${hi + 1}) = ${f(fn(hi + 1), 2)} már nem → felső határ ${hi}.`,
        `Józan ésszel: a minimumnál (${f(A.k)} db) biztosan teljesül a feltétel, hiszen ott a legkisebb az átlagköltség (${f(A.min)} &lt; ${f(K)}); a határokon kívül nagyobb.`,
      ],
      geogebra: { sorok: [acGG(A), `g(x)=${gg(K)}`, 'Metszéspont(ac, g)', `ac(${lo})`], megjegyzes: 'Tengelyarány: 1:20.' },
      abraMegoldas: atlagAbra({
        A, xmax: Math.max(A.xmax, xb * 1.15), vizsz: [{ y: K, cimke: `y = ${f(K)}` }], savok: [{ x1: xa, x2: xb, cimke: `< ${f(K)}` }],
        pontok: [{ x: xa, y: K, cimke: f(xa, 1) }, { x: xb, y: K, cimke: f(xb, 1) }, { x: A.k, y: A.min, cimke: `min ${f(A.min)}` }],
        leiras: `Az átlagköltség ${f(xa, 1)} és ${f(xb, 1)} darab között kisebb ${f(K)} €/db-nál; az egész határok ${lo} és ${hi}.`,
      }),
      jegyezze: 'Átlagköltség < K: a görbe az y = K egyenes alatt van; a darabszám-határ a metszéspontok melletti egészek.',
    };
  });
}

// =====================================================================
// G8 – változás két darabszám között
// =====================================================================
function G8(rng) {
  return probal(() => {
    const A = atlagParam(rng), { b, k, fn } = A;
    const x1 = egesz(rng, 10, 3 * k), x2 = x1 + 5 * egesz(rng, 2, 12);
    const v1 = fn(x1), v2 = fn(x2);
    const dv = v2 - v1, szaz = (dv / v1) * 100;
    if (Math.abs(dv) < 0.5 || Math.abs(szaz) < 0.3) return null;
    const rosszSzaz = (dv / v2) * 100;
    if (Math.abs(rosszSzaz - szaz) < 0.15) return null;
    const dvR = kerekit(dv, 1), szazR = kerekit(szaz, 1);
    if (Math.abs(Math.abs(dv * 10 - Math.trunc(dv * 10)) - 0.5) < 0.1 || Math.abs(Math.abs(szaz * 10 - Math.trunc(szaz * 10)) - 0.5) < 0.1) return null;
    return {
      szoveg: `${atlagSzoveg(A)} Hogyan változik az átlagköltség, ha a termelést ${x1} darabról ${x2} darabra növelik? Adja meg a változást €/db-ban és %-ban is, egy tizedesre kerekítve!`,
      mezok: [
        szamMezo({
          id: 'euro', cimke: 'A változás (€/db, előjellel, egy tizedesre)', helyes: dv, tizedes: 1, egyseg: '€/db', elojel: 'elojeles',
          ellenproba: (w) => `Ellenpróba: ac(${x1}) = ${f(v1, 3)}, ac(${x2}) = ${f(v2, 3)} → a különbség ${f(v2, 3)} − ${f(v1, 3)} = ${f(dv, 3)}, nem ${f(w, 2)}.`,
          hibak: [],
        }),
        szamMezo({
          id: 'szaz', cimke: 'A változás (%, előjellel, egy tizedesre)', helyes: szaz, tizedes: 1, egyseg: '%', elojel: 'elojeles',
          ellenproba: (w) => `Ellenpróba: ha a változás ${f(w, 2)} %, akkor ${f(v1, 3)} · ${f(1 + w / 100, 4)} = ${f(v1 * (1 + w / 100), 3)} lenne az új átlagköltség, nem ${f(v2, 3)}.`,
          hibak: [{ ertek: rosszSzaz, uzenet: `Mihez viszonyítunk? A korábbi (${x1} darabos) érték a 100 %, az kerül a nevezőbe.` }],
        }),
      ],
      tippek: [
        'Melyik érték a korábbi, és melyik a későbbi? Melyik a 100 %?',
        `Számolja ki mindkét átlagköltséget: ac(${x1}) és ac(${x2}). A változás: későbbi − korábbi.`,
        `A %-os változás: a különbséget a korábbi értékhez (ac(${x1})) viszonyítjuk: (ac(${x2}) − ac(${x1})) : ac(${x1}).`,
      ],
      megoldas: [
        `ac(${x1}) = ${f(x1)} + ${f(b)} + ${f(k * k)} : ${f(x1)} = ${f(v1, 3)}; ac(${x2}) = ${f(x2)} + ${f(b)} + ${f(k * k)} : ${f(x2)} = ${f(v2, 3)}.`,
        `Változás: ${f(v2, 3)} − ${f(v1, 3)} = ${f(dv, 3)} ≈ <strong>${f(dvR, 1)} €/db</strong>.`,
        `Százalékban: ${f(dv, 3)} : ${f(v1, 3)} = ${f(dv / v1, 5)} ≈ <strong>${f(szazR, 1)} %</strong> (a korábbi érték a 100 %).`,
      ],
      magyarazat: [
        `Két darabszám átlagköltségét kell összehasonlítani: ${x1} db és ${x2} db.`,
        `Először kiszámoljuk mindkettőt: ac(${x1}) = ${f(v1, 3)} €/db, ac(${x2}) = ${f(v2, 3)} €/db. A változás a későbbi mínusz a korábbi: ${f(dv, 3)} €/db (${dv > 0 ? 'drágább' : 'olcsóbb'} lett).`,
        `A százalékhoz azt kérdezzük: hány %-a ez a változás a kiinduló értéknek? A korábbi érték a 100 % (mint a ház alapja, a nevezőben): ${f(dv, 3)} : ${f(v1, 3)} = ${f(dv / v1, 5)}, vagyis ${f(szazR, 1)} %.`,
        `Képzelje el, hogy a korábbi érték 100 volt: akkor az új ${f(100 + szaz, 2)} lenne. Józan ésszel: ${dv > 0 ? 'nőtt' : 'csökkent'} az átlagköltség, ezért ${dv > 0 ? 'pozitív' : 'negatív'} mindkét szám; a későbbi értékkel osztva ${f(rosszSzaz, 1)} %-ot kapna, az hibás.`,
      ],
      geogebra: { sorok: [acGG(A), `ac(${x1})`, `ac(${x2})`, `(ac(${x2})-ac(${x1}))/ac(${x1})*100`], megjegyzes: 'A %-os változást a negyedik sor adja.' },
      jegyezze: 'Változás %-ban: a korábbi érték a 100 %, az kerül a nevezőbe: (új − régi) : régi.',
    };
  });
}

// =====================================================================
// Kidolgozott példák és ábrák
// =====================================================================
const PELDA1 = { m1: 10, m2: 50, c: -1000, xmax: 80, T: 24000, min: -8000, v: VALLALKOZASOK[0] };
PELDA1.fn = profitFv(PELDA1);
const PELDA2 = { m1: 20, m2: 70, c: -5000, xmax: 100, T: 19500, min: profitFv({ m1: 20, m2: 70, c: -5000 })(20), v: VALLALKOZASOK[1] };
PELDA2.fn = profitFv(PELDA2);
const PELDA3 = { b: 750, k: 50, xmax: 150, min: 850 };
PELDA3.fn = atlagFv(PELDA3);

const pelda1Abra = () => {
  const x1 = gyok(PELDA1.fn, 10, 50), x2 = gyok(PELDA1.fn, 50, 300);
  return profitAbra({ P: PELDA1, savok: [{ x1, x2, cimke: 'nyereséges' }], pontok: [{ x: 50, y: 24000, cimke: 'max (50; 24 000)' }, { x: 10, y: -8000, cimke: 'min (10; −8 000)' }], leiras: 'Az autókereskedés profitfüggvénye: maximum 50 db-nál 24 000 €, nyereséges 23,05 és 67,6 db között.' });
};
const pelda3Abra = () => atlagAbra({ A: PELDA3, vizsz: [{ y: 900, cimke: 'y = 900' }], savok: [{ x1: 19.1, x2: 130.9, cimke: '< 900' }], pontok: [{ x: 50, y: 850, cimke: 'min (50; 850)' }], leiras: 'Az ac(x) = x + 750 + 2500/x minimuma 50 db-nál 850 €/db; 900 alatt 19,1 és 130,9 db között van.' });

export default {
  id: 'fuggvenyvizsgalat',
  cim: 'Közgazdasági függvények vizsgálata',
  rovid: 'Harmadfokú profitfüggvény és átlagköltség: maximum, minimum, nyereséges tartomány – GeoGebrával.',
  kulcskeplet: '<span class="keplet-nagy">nyereséges: pr(x) &gt; 0</span>',
  kulcsMagyarazat: [
    '<strong>Maximum / minimum</strong> → <code>Maximum(f, kezdő x, záró x)</code> / <code>Minimum(…)</code> – az intervallumot úgy adja meg, hogy a szélsőérték biztosan beleessen.',
    '<strong>Nyereséges</strong> = a profit pozitív = a grafikon az <strong>x-tengely fölött</strong>. <strong>Több mint K</strong> = a grafikon az <strong>y = K</strong> egyenes fölött.',
    '<strong>Darabszám egész szám</strong> → a nem egész metszéspont utáni / előtti első egész a határ.',
  ],
  elmelet: [
    'Mindig olvassa végig a feladatot: mi az x (pl. naponta eladott autók), mi a függvényérték (profit €-ban).',
    'A függvény beírása: beszédes név (<code>pr(x)=…</code>), kitevő után a <strong>jobbra nyíllal</strong> vissza; <strong>mindig ellenőrizze az algebra-ablakban</strong>, mit írt be.',
    '<strong>Tengelyarány:</strong> profitnál 1:1000, átlagköltségnél 1:20 – utána görgessen kifelé, amíg látszik a függvény.',
    '<strong>Rossz intervallum = rossz válasz:</strong> 0–41 között a 41 „a legmagasabb pont” – a gép jól válaszolt, csak rosszul kérdeztünk.',
    '<strong>Nő / csökken:</strong> balról jobbra haladva a minimumig csökken, a maximumig nő, utána megint csökken.',
    '<strong>Átlagköltség</strong> = egy termékre jutó költség (100 db, 100 000 € → 1000 €/db). ac(x) = x + 750 + 2500/x; a „per x” osztásjel: <code>2500/x</code>.',
    '<strong>Változás %-ban:</strong> a viszonyítási alap (100 %) a <strong>korábbi</strong> érték, az kerül a nevezőbe (mint a ház alapja – 1. téma).',
  ],
  peldak: [
    { cim: 'Autókereskedés – harmadfokú profitfüggvény', feladat: 'Egy autókereskedés napi profitját a pr(x) = −x³ + 90x² − 1500x − 1000 függvény írja le (x: naponta eladott autók száma, profit €-ban). a) Mikor maximális a profit? b) Mettől meddig nő? c) Hány autónál nyereséges? d) Hány autónál több a profit 20 000 €-nál?',
      abra: pelda1Abra,
      lepesek: [
        'a) <code>Maximum(pr, 0, 100)</code> → <strong>50 db, 24 000 €</strong>.',
        'b) <code>Minimum(pr, 0, 20)</code> → 10 db (−8 000 €); a profit <strong>10 &lt; x &lt; 50</strong> között nő, egyébként csökken.',
        'c) x-tengelymetszetek ≈ 23,05 és 67,6 → pr(23) &lt; 0, pr(24) ≈ 1016 €, pr(67) ≈ 1747 €, pr(68) &lt; 0 → nyereséges <strong>24–67 db</strong> között.',
        'd) y = 20 000 metszéspontjai ≈ 41,2 és 57,7 → <strong>42–57 db</strong>.',
      ] },
    { cim: 'Kerékpár – ugyanaz a gondolatmenet', feladat: 'Egy kerékpárbolt napi profitja: pr(x) = −x³ + 135x² − 4200x − 5000. Mikor maximális a profit, mettől meddig nő, hány kerékpárnál nyereséges, és mikor több 10 000 €-nál?',
      lepesek: ['Maximum: <strong>70 db, 19 500 €</strong>.', 'Nő, ha <strong>20 &lt; x &lt; 70</strong>.', 'Nyereséges <strong>52–84 db</strong> között.', 'Több 10 000 €-nál: <strong>58–80 db</strong> között (a dián: „57 db-nál több, de 81 db-nál kevesebb”).'] },
    { cim: 'Átlagköltség', feladat: 'Az ac(x) = x + 750 + 2500/x függvény az egy termékre jutó átlagköltséget adja meg (€/db). a) Mikor csökken, mikor nő? b) Mikor minimális, és mennyi ekkor? c) Mikor kisebb 900 €/db-nál? d) Hogyan változik 60-ról 90 db-ra?',
      abra: pelda3Abra,
      lepesek: [
        'a) 50 db alatt csökken, felette nő.',
        'b) <code>Minimum(ac, 1, 200)</code> → <strong>50 db, 850 €/db</strong> (papíron: √2500 = 50; 50 + 750 + 2500 : 50 = 850).',
        'c) y = 900 metszéspontjai ≈ 19,1 és 130,9 → <strong>20–130 db</strong> között.',
        'd) ac(60) ≈ 851,7 €/db, ac(90) ≈ 867,8 €/db → <strong>+16,1 €/db</strong>, ez <strong>+1,9 %</strong> (a 60 darabos érték a 100 %).',
      ] },
  ],
  tipusok: [
    { id: 'G1', nev: 'Maximális profit', general: G1 },
    { id: 'G2', nev: 'Mettől meddig nő?', general: G2 },
    { id: 'G3', nev: 'Nyereséges tartomány (egész határok)', general: G3 },
    { id: 'G4', nev: 'Több mint K (egész határok)', general: G4 },
    { id: 'G5', nev: 'Függvényérték (profit vagy átlagköltség)', general: G5 },
    { id: 'G6', nev: 'Minimális átlagköltség', general: G6 },
    { id: 'G7', nev: 'Átlagköltség kisebb, mint K', general: G7 },
    { id: 'G8', nev: 'Változás két darabszám között', general: G8 },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva. */
  peldaEllenorzes() {
    const p1 = PELDA1.fn, p2 = PELDA2.fn, a = PELDA3.fn;
    const hat = (fn, felt) => egeszHatarok(fn, felt, 0, 400);
    const h1 = hat(p1, (y) => y > 0), h1d = hat(p1, (y) => y > 20000), h2 = hat(p2, (y) => y > 0), h2k = hat(p2, (y) => y > 10000);
    const h3 = egeszHatarok(a, (y) => y < 900, 1, 800);
    return [
      { nev: '1/a: maximum helye', kapott: 50, vart: 50 },
      { nev: '1/a: maximum értéke', kapott: p1(50), vart: 24000 },
      { nev: '1/b: minimum értéke (x = 10)', kapott: p1(10), vart: -8000 },
      { nev: '1/c: gyök 1 (2 tizedes)', kapott: kerekit(gyok(p1, 10, 50), 2), vart: 23.05 },
      { nev: '1/c: gyök 2 (1 tizedes)', kapott: kerekit(gyok(p1, 50, 300), 1), vart: 67.6 },
      { nev: '1/c: pr(24) ≈ 1016', kapott: kerekit(p1(24), 0), vart: 1016 },
      { nev: '1/c: pr(67) ≈ 1747', kapott: kerekit(p1(67), 0), vart: 1747 },
      { nev: '1/c: alsó határ', kapott: h1.lo, vart: 24 },
      { nev: '1/c: felső határ', kapott: h1.hi, vart: 67 },
      { nev: '1/d: y = 20 000, 1. metszéspont (1 tizedes)', kapott: kerekit(gyok((x) => p1(x) - 20000, 10, 50), 1), vart: 41.2 },
      { nev: '1/d: y = 20 000, 2. metszéspont (1 tizedes)', kapott: kerekit(gyok((x) => p1(x) - 20000, 50, 300), 1), vart: 57.7 },
      { nev: '1/d: alsó határ', kapott: h1d.lo, vart: 42 },
      { nev: '1/d: felső határ', kapott: h1d.hi, vart: 57 },
      { nev: '2: maximum értéke (x = 70)', kapott: p2(70), vart: 19500 },
      { nev: '2: nyereséges alsó határ', kapott: h2.lo, vart: 52 },
      { nev: '2: nyereséges felső határ', kapott: h2.hi, vart: 84 },
      { nev: '2: > 10 000 alsó határ', kapott: h2k.lo, vart: 58 },
      { nev: '2: > 10 000 felső határ', kapott: h2k.hi, vart: 80 },
      { nev: '3/b: minimum értéke', kapott: a(50), vart: 850 },
      { nev: '3/c: metszéspont 1 (1 tizedes)', kapott: kerekit(gyok((x) => a(x) - 900, 1, 50), 1), vart: 19.1 },
      { nev: '3/c: metszéspont 2 (1 tizedes)', kapott: kerekit(gyok((x) => a(x) - 900, 50, 400), 1), vart: 130.9 },
      { nev: '3/c: alsó határ', kapott: h3.lo, vart: 20 },
      { nev: '3/c: felső határ', kapott: h3.hi, vart: 130 },
      { nev: '3/d: ac(60) (1 tizedes)', kapott: kerekit(a(60), 1), vart: 851.7 },
      { nev: '3/d: ac(90) (1 tizedes)', kapott: kerekit(a(90), 1), vart: 867.8 },
      { nev: '3/d: változás (1 tizedes)', kapott: kerekit(a(90) - a(60), 1), vart: 16.1 },
      { nev: '3/d: változás %-ban (1 tizedes)', kapott: kerekit(((a(90) - a(60)) / a(60)) * 100, 1), vart: 1.9 },
    ];
  },
};
