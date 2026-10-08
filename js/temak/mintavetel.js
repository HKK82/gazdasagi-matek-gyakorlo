// 8. téma – Mintavételek és eloszlásuk: hipergeometrikus és binomiális eloszlás (v5)
import { egesz, valaszt } from '../lib/rng.js';
import { kerekit } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { eloszlasAbra } from '../lib/abra.js';
import * as E from '../lib/eloszlas.js';
import { probal, f, az, gg, tisztit } from './seged.js';

const p4 = (x) => f(x, 4);

// ---- Az eloszlás mint adat: pmf, μ, σ, módusz egységesen ----
export const hiperEl = (N, M, n) => ({
  fajta: 'hiper', N, M, n,
  pmf: (k) => E.hiperPmf(N, M, n, k), mu: E.hiperVarhato(N, M, n), sigma: E.hiperSzoras(N, M, n), moduszok: E.hiperModuszok(N, M, n),
});
export const binomEl = (n, p) => ({
  fajta: 'binom', n, p,
  pmf: (k) => E.binomPmf(n, p, k), mu: E.binomVarhato(n, p), sigma: E.binomSzoras(n, p), moduszok: E.binomModuszok(n, p),
});
/** P(a ≤ X ≤ b) az eloszláson (a határok benne vannak). */
export function tart(el, a, b) {
  let s = 0;
  for (let k = Math.max(0, a); k <= Math.min(el.n, b); k++) s += el.pmf(k);
  return Math.min(1, s);
}
/** A tényleg lehetséges értékek tartománya. */
const tamasz = (el) => (el.fajta === 'hiper' ? [Math.max(0, el.n - (el.N - el.M)), Math.min(el.n, el.M)] : [0, el.n]);

// ---- „több mint / kevesebb mint / legalább / legfeljebb / pontosan” ----
export const FELTETELEK = {
  pontosan: { szoveg: (k) => `pontosan ${k}`, hatar: (k) => [k, k], felre: (k, n) => [0, k], jel: (k) => `X = ${k}` },
  tobb: { szoveg: (k) => `több mint ${k}`, hatar: (k, n) => [k + 1, n], felre: (k, n) => [k, n], jel: (k) => `X ≥ ${k + 1}` },
  kevesebb: { szoveg: (k) => `kevesebb mint ${k}`, hatar: (k) => [0, k - 1], felre: (k) => [0, k], jel: (k) => `X ≤ ${k - 1}` },
  legalabb: { szoveg: (k) => `legalább ${k}`, hatar: (k, n) => [k, n], felre: (k, n) => [k + 1, n], jel: (k) => `X ≥ ${k}` },
  legfeljebb: { szoveg: (k) => `legfeljebb ${k}`, hatar: (k) => [0, k], felre: (k) => [0, k - 1], jel: (k) => `X ≤ ${k}` },
};
const felteletUzenet = (kulcs, k, n) => ({
  pontosan: `A „pontosan ${k}” egyetlen oszlop (X = ${k}); nem az addigi oszlopok összege.`,
  tobb: `A „több mint ${k}” azt jelenti: ${k + 1} vagy több. Maga ${az(k, 0)} már nem számít bele.`,
  kevesebb: `A „kevesebb mint ${k}” azt jelenti: legfeljebb ${k - 1}. Maga ${az(k, 0)} már nem számít bele.`,
  legalabb: `A „legalább ${k}” azt jelenti: ${k} vagy több, tehát ${az(k, 0)} még beleszámít.`,
  legfeljebb: `Olvassa el még egyszer: a „legfeljebb ${k}” azt jelenti: 0 és ${k} között minden érték, a ${k} is.`,
})[kulcs];
const sorrend = ['pontosan', 'tobb', 'kevesebb', 'legalabb', 'legfeljebb'];

/** Egy kiválasztott feltétel (kulcs, k) és a hozzá tartozó helyes és „félreértett” tartomány. */
function feltetel(kulcs, k, n) {
  const F = FELTETELEK[kulcs];
  return { kulcs, k, szoveg: F.szoveg(k), hatar: F.hatar(k, n), felre: F.felre(k, n), jel: F.jel(k) };
}

/** A tartomány jelölése: „X = 2”, „1 ≤ X ≤ 3”, „X ≥ 3”. */
function tartJel(a, b, n) {
  if (a === b) return `X = ${a}`;
  if (a <= 0) return `X ≤ ${b}`;
  if (b >= n) return `X ≥ ${a}`;
  return `${a} ≤ X ≤ ${b}`;
}

// ---- „GeoGebrában így” (Valószínűség-számítás nézet) ----
const GG_LEPESEK = 'Hamburger menü → <strong>Valószínűség-számítás</strong>. Az eloszlást a legördülő listából válassza ki (a hipergeometrikus a lista alján van), töltse ki a paramétereket, alul pedig válassza a megfelelő gombot: <strong>kisebb (≤)</strong>, <strong>két érték között</strong>, <strong>nagyobb (≥)</strong>. A kért valószínűség a görbe (oszlopok) alatt jelenik meg.';
export function ggDiszkret(el, a, b) {
  const param = el.fajta === 'hiper'
    ? `Hipergeometrikus · populáció: ${el.N} · n: ${el.M} · minta: ${el.n}`
    : `Binomiális · n: ${el.n} · p: ${gg(el.p, 4)}`;
  const [lo, hi] = tamasz(el);
  let gomb;
  if (a === b) gomb = `két érték között: ${a} ≤ X ≤ ${b}`;
  else if (a <= lo && b < hi) gomb = `kisebb (≤): X ≤ ${b}`;
  else if (b >= hi && a > lo) gomb = `nagyobb (≥): X ≥ ${a}`;
  else gomb = `két érték között: ${a} ≤ X ≤ ${b}`;
  return {
    bevezeto: 'A GeoGebra Valószínűség-számítás nézetében állítsa be (tizedesponttal!):',
    sorok: [`${param} · ${gomb}`],
    megjegyzes: `${GG_LEPESEK} A „Statisztika” jelölőnégyzet bekapcsolásával a várható érték és a szórás is látszik. A Hipergeometrikusnál „n” a kitüntetettek száma a sokaságban, a „minta” a kihúzott elemek száma.`,
  };
}
function ggStat(el) {
  const g = ggDiszkret(el, 0, el.n);
  g.sorok = [g.sorok[0].replace(/ · (kisebb|nagyobb|két érték).*$/, ' · Statisztika bekapcsolva')];
  return g;
}

// ---- Ábra: oszlopdiagram kiszínezett oszlopokkal ----
function abraDiszkret(el, a, b, { felre = null, felirat = '', xfelirat = 'X', leiras = '' } = {}) {
  const [lo, hi] = tamasz(el);
  const ertekek = [];
  for (let k = 0; k <= el.n; k++) ertekek.push({ x: k, p: el.pmf(k) });
  const kiemelt = [], masik = [];
  for (let k = Math.max(a, 0); k <= Math.min(b, el.n); k++) if (k >= lo && k <= hi) kiemelt.push(k);
  if (felre) {
    for (let k = Math.max(felre[0], 0); k <= Math.min(felre[1], el.n); k++) {
      if (!kiemelt.includes(k) && k >= lo && k <= hi) masik.push(k);
    }
  }
  const jelmagyarazat = [{ osztaly: 'kiemelt', szoveg: 'kért oszlopok' }];
  if (masik.length) jelmagyarazat.push({ osztaly: 'masik', szoveg: 'nem számít bele' });
  return eloszlasAbra({
    ertekek, varhato: el.mu, varhatoCimke: `μ = ${f(el.mu, 4)}`, diszkret: true, kiemelt, masik,
    felirat, jelmagyarazat, xfelirat, leiras: leiras || `Az eloszlás oszlopdiagramja; a kért oszlopok kiszínezve (${tartJel(a, b, el.n)}).`,
  });
}

// ---- A valószínűség-mező közös hibái és ellenpróbája ----
/** Hány oszlopot kell összeadni – szöveges lista az ellenpróbához. */
function oszlopLista(el, a, b) {
  const ks = [];
  const [lo, hi] = tamasz(el);
  for (let k = Math.max(a, lo); k <= Math.min(b, hi); k++) ks.push(k);
  if (ks.length <= 4) return ks.map((k) => `P(X = ${k}) = ${p4(el.pmf(k))}`).join(' + ');
  return `${ks.length} oszlop, X = ${ks[0]} … ${ks[ks.length - 1]}`;
}

function pEllenproba(el, a, b, helyes, felre = null) {
  return (w) => {
    if (w > 1) {
      return `Ellenpróba: a valószínűség legfeljebb 1 lehet, az Ön ${p4(w)} értéke ennél nagyobb; a kért oszlopok (${tartJel(a, b, el.n)}) összege ${p4(helyes)}.`;
    }
    let s = `Ellenpróba: a kért oszlopok (${tartJel(a, b, el.n)}: ${oszlopLista(el, a, b)}) összege ${p4(helyes)}, az Ön ${p4(w)} értéke ${w > helyes ? 'ennél nagyobb' : 'ennél kisebb'}.`;
    if (felre) {
      const rossz = tart(el, felre[0], felre[1]);
      if (Math.abs(w - rossz) <= 1.5e-4) {
        // az az egy oszlop, amelyben a két tartomány eltér
        let kk = null;
        for (let k = 0; k <= el.n && kk === null; k++) {
          if ((k >= a && k <= b) !== (k >= felre[0] && k <= felre[1])) kk = k;
        }
        s += ` Az Ön ${p4(w)} a(z) ${tartJel(felre[0], felre[1], el.n)} tartomány valószínűsége: ez ${rossz > helyes ? 'több' : 'kevesebb'} a kértnél, mert egy oszlopban (X = ${kk}, P = ${p4(el.pmf(kk))}) eltér.`;
      }
    }
    return s;
  };
}

function pMezo({ id = 'p', cimke = 'A valószínűség', el, a, b, helyes, felre = null, felreUzenet = '', hibak = [] }) {
  return szamMezo({
    id, cimke: `${cimke} (4 tizedesre)`, helyes, tizedes: 4, abszTures: 0.0001, szazalek: true,
    maximum: 1, maximumUzenet: 'A valószínűség legfeljebb 1.',
    ellenproba: pEllenproba(el, a, b, helyes, felre),
    hibak: [...hibak, ...(felre ? [{ ertek: tart(el, felre[0], felre[1]), uzenet: felreUzenet }] : [])],
  });
}

// =====================================================================
// Szituációk
// =====================================================================
const KARTYA_FAJTAK = [
  { db: 4, nev: 'ász', egy: 'ász' },
  { db: 8, nev: 'piros lap', egy: 'piros lap' },
  { db: 8, nev: 'tök lap', egy: 'tök lap' },
  { db: 16, nev: 'figurás lap (alsó, felső, király vagy ász)', egy: 'figurás lap' },
];

/** Hipergeometrikus szituációk (visszatevés nélkül). */
const HIPER_HELYZETEK = [
  {
    id: 'kartya', N: () => 32,
    fajta: (rng) => valaszt(rng, KARTYA_FAJTAK),
    M: (rng, N, faj) => faj.db,
    intro: (N, M, n, faj) => `Egy ${N} lapos magyar kártyában ${M} ${faj.nev} van. Visszatevés nélkül kihúzunk ${n} lapot.`,
    kivett: 'a kihúzott lapok', egy: (faj) => faj.egy, elem: 'lap',
  },
  {
    id: 'doboz', N: (rng) => egesz(rng, 10, 40), fajta: () => ({ egy: 'mogyorós bonbon' }),
    M: (rng, N) => egesz(rng, 2, N - 2),
    intro: (N, M, n) => `Egy dobozban ${N} bonbon van, ebből ${M} mogyorós. Találomra, visszatevés nélkül kiveszünk ${n} bonbont.`,
    kivett: 'a kivett bonbonok', egy: () => 'mogyorós bonbon', elem: 'bonbon',
  },
  {
    id: 'tetel', N: (rng) => egesz(rng, 12, 40), fajta: () => ({}),
    M: (rng, N) => egesz(rng, Math.ceil(N * 0.3), N - 2),
    intro: (N, M, n) => `Egy vizsgán ${N} tétel közül lehet húzni, ebből ${M} tételt tanult meg a hallgató. Visszatevés nélkül húz ${n} tételt.`,
    kivett: 'a kihúzott tételek', egy: () => 'megtanult tétel', elem: 'tétel',
  },
  {
    id: 'boriték', N: (rng) => valaszt(rng, [20, 25, 40, 50, 80, 100, 150, 200]), fajta: () => ({}),
    M: (rng, N) => Math.max(2, Math.round(N * valaszt(rng, [0.1, 0.15, 0.2, 0.24, 0.3, 0.4]))),
    intro: (N, M, n) => `Egy dobozban ${N} boríték van, ebből ${M} nyerő. Visszatevés nélkül kihúzunk ${n} borítékot.`,
    kivett: 'a kihúzott borítékok', egy: () => 'nyerő boríték', elem: 'boríték',
  },
  {
    id: 'tojas', N: (rng) => egesz(rng, 12, 60), fajta: () => ({}),
    M: (rng, N) => egesz(rng, 2, Math.max(3, Math.round(N * 0.4))),
    intro: (N, M, n) => `Egy tálcán ${N} tojás van, ebből ${M} régi. Találomra, visszatevés nélkül kiveszünk ${n} tojást.`,
    kivett: 'a kivett tojások', egy: () => 'régi tojás', elem: 'tojás',
  },
];
/** A darabszám helyett százalékban megadott kitüntetett (M2 hibájához: „M helyett %”). */
const HIPER_SZAZALEKOS = [
  {
    id: 'tulipan',
    intro: (N, pct, n) => `Egy zsákban ${N} tulipánhagyma van, ennek ${pct} %-a sárga virágú, a többi piros. Visszatevés nélkül kiültetünk ${n} hagymát.`,
    kivett: 'a kiültetett hagymák', egy: 'sárga virágú hagyma', nev: 'hagyma',
  },
  {
    id: 'virag', intro: (N, pct, n) => `Egy ládában ${N} muskátli van, ennek ${pct} %-a fehér virágú, a többi piros. Visszatevés nélkül kiveszünk ${n} muskátlit.`,
    kivett: 'a kivett muskátlik', egy: 'fehér virágú muskátli', nev: 'muskátli',
  },
];

/**
 * Hipergeometrikus feladatadatok. opcio: { szazalek: igaz → a kitüntetettek aránya %-ban szerepel a szövegben, ok(el, h) → további feltétel }.
 * Vissza: { el, N, M, n, intro, kivett, egy, pct?, elem }
 */
function hiperAdat(rng, { szazalek = false, ok = () => true, nMin = 3, nMax = 10 } = {}) {
  const h = szazalek ? valaszt(rng, HIPER_SZAZALEKOS) : valaszt(rng, HIPER_HELYZETEK);
  return probal(() => {
    if (szazalek) {
      const N = valaszt(rng, [20, 25, 30, 40, 50]);
      const pct = valaszt(rng, [10, 20, 30, 40, 60, 70, 80]);
      if ((N * pct) % 100 !== 0) return null;
      const M = (N * pct) / 100;
      const n = egesz(rng, nMin, Math.min(nMax, N - 1));
      const el = hiperEl(N, M, n);
      if (!ok(el, h)) return null;
      return { el, N, M, n, pct, intro: h.intro(N, pct, n), kivett: h.kivett, egy: h.egy, elem: h.nev, nev: h.nev };
    }
    const N = h.N(rng);
    const faj = h.fajta(rng);
    const M = h.M(rng, N, faj);
    if (M < 1 || M >= N) return null;
    const n = egesz(rng, nMin, Math.min(nMax, N - 1));
    const el = hiperEl(N, M, n);
    if (!ok(el, h)) return null;
    return { el, N, M, n, pct: null, intro: h.intro(N, M, n, faj), kivett: h.kivett, egy: h.egy(faj), elem: h.elem };
  });
}

const BINOM_ARANYOK = [
  {
    id: 'selejt', pctok: [5, 8, 10, 12, 15, 20],
    intro: (pct, n) => `Egy gyártósoron az alkatrészek ${pct} %-a selejtes, a gyártott mennyiség nagyon nagy. Találomra kiválasztunk ${n} alkatrészt.`,
    kivett: 'a kiválasztott alkatrészek', egy: 'selejtes alkatrész',
  },
  {
    id: 'facebook', pctok: [30, 35, 40, 45, 50],
    intro: (pct, n) => `A hallgatók ${pct} %-a használja naponta a közösségi oldalt, a hallgatók száma nagyon nagy. Találomra megkérdezünk ${n} hallgatót.`,
    kivett: 'a megkérdezettek', egy: 'naponta használó hallgató',
  },
  {
    id: 'mentok', pctok: [10, 15, 20, 25],
    intro: (pct, n) => `A mentők hívásainak ${pct} %-a indokolatlan, a hívások száma nagyon nagy. Kiválasztunk ${n} hívást.`,
    kivett: 'a kiválasztott hívások', egy: 'indokolatlan hívás',
  },
  {
    id: 'tojas', pctok: [8, 10, 12, 15],
    intro: (pct, n) => `Egy nagy szállítmányban a tojások ${pct} %-a régi. Találomra kiveszünk ${n} tojást.`,
    kivett: 'a kivett tojások', egy: 'régi tojás',
  },
];
const BINOM_DARABOK = [
  {
    id: 'kartya-vissza', S: () => 32,
    M: (rng, S, faj) => faj.db, fajta: (rng) => valaszt(rng, KARTYA_FAJTAK),
    intro: (S, M, n, faj) => `Egy ${S} lapos magyar kártyában ${M} ${faj.nev} van. ${n} alkalommal húzunk egy lapot, és minden húzás után visszatesszük.`,
    kivett: 'a kihúzott lapok', egy: (faj) => faj.egy,
  },
  {
    id: 'boriték-vissza', S: (rng) => valaszt(rng, [20, 25, 40, 50, 100]),
    M: (rng, S) => Math.round(S * valaszt(rng, [0.1, 0.15, 0.2, 0.24, 0.25, 0.3, 0.4, 0.5])), fajta: () => ({}),
    intro: (S, M, n) => `Egy dobozban ${S} boríték van, ebből ${M} nyerő. Visszatevéssel kihúzunk ${n} borítékot.`,
    kivett: 'a kihúzott borítékok', egy: () => 'nyerő boríték',
  },
];

/**
 * Binomiális feladatadatok: { el, n, p, intro, kivett, egy, S?, M?, pct?, mod: 'darab' | 'arany' }.
 * mod: 'darab' → a p darabszámokból adódik (M/S), 'arany' → %-ban adott, nagy sokaság.
 */
function binomAdat(rng, { mod = valaszt(rng, ['darab', 'arany', 'arany']), nMin = 3, nMax = 30, pMin = 0.05, pMax = 0.6, ok = () => true } = {}) {
  const h = mod === 'darab' ? valaszt(rng, BINOM_DARABOK) : valaszt(rng, BINOM_ARANYOK);
  return probal(() => {
    const n = egesz(rng, nMin, nMax);
    if (mod === 'darab') {
      const S = h.S(rng);
      const faj = h.fajta(rng);
      const M = h.M(rng, S, faj);
      const p = tisztit(M / S);
      if (M < 1 || p < pMin - 1e-9 || p > pMax + 1e-9 || n === S || n === M) return null;
      const el = binomEl(n, p);
      if (!ok(el)) return null;
      return { el, n, p, S, M, pct: null, mod, intro: h.intro(S, M, n, faj), kivett: h.kivett, egy: h.egy(faj) };
    }
    const pct = valaszt(rng, h.pctok);
    const p = tisztit(pct / 100);
    if (p < pMin - 1e-9 || p > pMax + 1e-9 || n === pct) return null;
    const el = binomEl(n, p);
    if (!ok(el)) return null;
    return { el, n, p, S: null, M: null, pct, mod, intro: h.intro(pct, n), kivett: h.kivett, egy: h.egy };
  });
}

/** Véletlen feltétel (kulcs, k) úgy, hogy a kért tartomány valószínűsége se túl kicsi, se túl nagy. */
function feltetelValaszt(rng, el, { kulcsok = sorrend, pMin = 0.03, pMax = 0.97, felreKulonbseg = 1e-3 } = {}) {
  const kulcs = valaszt(rng, kulcsok);
  const [lo, hi] = tamasz(el);
  const kLo = Math.max(lo, kulcs === 'kevesebb' ? lo + 1 : lo), kHi = Math.min(hi, el.n - (kulcs === 'tobb' ? 1 : 0));
  if (kLo > kHi) return null;
  const k = egesz(rng, kLo, kHi);
  const fe = feltetel(kulcs, k, el.n);
  const [a, b] = fe.hatar;
  if (a > b || b < lo || a > hi) return null;
  const P = tart(el, a, b);
  if (P < pMin || P > pMax) return null;
  const rossz = tart(el, fe.felre[0], fe.felre[1]);
  if (Math.abs(rossz - P) < felreKulonbseg) return null;
  return { ...fe, a, b, P, rossz };
}

const kerdesSzoveg = (h, fe) => `Mennyi a valószínűsége, hogy ${h.kivett} között ${fe.szoveg} ${h.egy} van?`;

const sorok = (el) => (el.fajta === 'hiper'
  ? `${el.N} elemű sokaság, ebből ${el.M} kitüntetett, ${el.n} elemű minta`
  : `${el.n} kísérlet, egy-egy kísérletnél p = ${p4(el.p)}`);

// Közös magyarázat-építő a P(X…) típusú feladatokhoz
function pMagyarazat(h, fe, el) {
  const [a, b] = [fe.a, fe.b];
  const P = fe.P;
  const jel = tartJel(a, b, el.n);
  const oszlopok = [];
  const [lo, hi] = tamasz(el);
  for (let k = Math.max(a, lo); k <= Math.min(b, hi); k++) oszlopok.push(k);
  const kepletSzoveg = el.fajta === 'hiper'
    ? `Egy oszlop (X = k): C(${el.M}, k) · C(${el.N - el.M}, ${el.n} − k) / C(${el.N}, ${el.n}) – a kedvező minták számát osztjuk az összes lehetséges minta számával (összesen ${f(E.kombinacio(el.N, el.n), 0)} minta van).`
    : `Egy oszlop (X = k): C(${el.n}, k) · ${p4(el.p)}ᵏ · ${p4(1 - el.p)}^(${el.n} − k); a C(${el.n}, k) azt számolja meg, hányféle sorrendben jöhet ki a k kitüntetett.`;
  const eloszlasIndok = el.fajta === 'hiper'
    ? `Visszatevés nélkül húzunk, és ismert a sokaság mérete (${el.N}), a kitüntetettek száma (${el.M}) és a minta mérete (${el.n}): ez a hipergeometrikus eloszlás. A húzások nem függetlenek, mert minden húzás után megváltozik az arány.`
    : `${h.pct !== null && h.pct !== undefined ? `Nagyon nagy sokaságból húzunk és csak az arány ismert (${h.pct} %), ezért a binomiálissal becsüljük a visszatevés nélküli húzást is: ` : 'Visszatevéssel húzunk, ezért minden húzásnál ugyanakkora az esély, a kísérletek függetlenek: '}n = ${el.n}, p = ${p4(el.p)}.`;
  const szamitas = oszlopok.length === 1
    ? `A kért oszlop: ${jel}. P(X = ${oszlopok[0]}) = ${p4(el.pmf(oszlopok[0]))}.`
    : oszlopok.length <= 5
      ? `A kért oszlopok: ${jel}, vagyis X = ${oszlopok.join(', ')}. Összeadva: ${oszlopok.map((k) => p4(el.pmf(k))).join(' + ')} = ${p4(P)}.`
      : `A kért oszlopok: ${jel}, vagyis ${oszlopok.length} oszlop (X = ${oszlopok[0]} … ${oszlopok[oszlopok.length - 1]}). Az oszlopok összege ${p4(P)}.`;
  const hatarMondat = fe.kulcs === 'pontosan' ? '' : ` ${felteletUzenet(fe.kulcs, fe.k, el.n)}`;
  return [
    `Azt keressük, mekkora eséllyel ${h.kivett} között ${fe.szoveg} ${h.egy} van – vagyis a(z) ${jel} tartomány valószínűségét.${hatarMondat}`,
    `${eloszlasIndok} ${kepletSzoveg}`,
    szamitas,
    `Képzelje el, hogy 100 ilyen mintát veszünk: kb. ${f(100 * P, 1)} esetben jön ki a kért eredmény. A valószínűség ennek a százada: ${p4(P)}.`,
    `Józan ésszel: a minta átlagosan ${f(el.mu, 2)} kitüntetett elemet tartalmaz (μ), és a kért tartomány (${jel}) ${a <= el.mu && el.mu <= b ? 'tartalmazza ezt az átlagot, ezért nem elhanyagolható a valószínűsége' : 'az átlagtól távolabb esik, ezért kisebb a valószínűsége, mint a legmagasabb oszlopé'}. A valószínűség 0 és 1 közötti: ${p4(P)} ✓.`,
  ];
}
function pMegoldas(h, fe, el) {
  const jel = tartJel(fe.a, fe.b, el.n);
  const lepesek = [
    el.fajta === 'hiper'
      ? `Hipergeometrikus eloszlás: N = ${el.N}, M = ${el.M}, n = ${el.n} (visszatevés nélkül, ismert sokaság).`
      : `Binomiális eloszlás: n = ${el.n}, p = ${p4(el.p)} (független kísérletek).`,
    `A kérdés: „${fe.szoveg}” → ${jel}${fe.kulcs === 'pontosan' ? '' : ` (${felteletUzenet(fe.kulcs, fe.k, el.n)})`}.`,
  ];
  const ks = [];
  const [lo, hi] = tamasz(el);
  for (let k = Math.max(fe.a, lo); k <= Math.min(fe.b, hi); k++) ks.push(k);
  if (ks.length === 1) {
    lepesek.push(el.fajta === 'hiper'
      ? `P(X = ${ks[0]}) = C(${el.M}, ${ks[0]}) · C(${el.N - el.M}, ${el.n - ks[0]}) / C(${el.N}, ${el.n}) = <strong>${p4(fe.P)}</strong>.`
      : `P(X = ${ks[0]}) = C(${el.n}, ${ks[0]}) · ${p4(el.p)}^${ks[0]} · ${p4(1 - el.p)}^${el.n - ks[0]} = <strong>${p4(fe.P)}</strong>.`);
  } else {
    lepesek.push(`${ks.length <= 6 ? ks.map((k) => `P(X = ${k}) = ${p4(el.pmf(k))}`).join('; ') + '. ' : ''}A kért oszlopok összege: <strong>${p4(fe.P)}</strong>.`);
  }
  return lepesek;
}

// =====================================================================
// M1 – melyik eloszlás? (választós)
// =====================================================================
function M1(rng) {
  const eset = valaszt(rng, ['hiper', 'vissza', 'nagy']);
  const opciok2 = [];
  let szoveg, helyesEloszlas, par, rosszEll, magyarazat, megoldas, tipp;
  if (eset === 'hiper') {
    const h = probal(() => { const x = hiperAdat(rng, { nMin: 3, nMax: 9 }); return x.M !== x.n && x.N !== x.n ? x : null; });
    szoveg = `${h.intro} Melyik eloszlással számolhatjuk ki annak a valószínűségét, hogy ${h.kivett} között hány ${h.egy} van?`;
    helyesEloszlas = 0;
    par = [
      { szoveg: `N = ${h.N}, M = ${h.M}, n = ${h.n}`, helyes: true },
      { szoveg: `N = ${h.n}, M = ${h.M}, n = ${h.N}`, uzenet: 'N a teljes sokaság, n pedig a kihúzott minta elemszáma – a sokaság a nagyobb szám.', ellenproba: `Ellenpróba: a mintából (${h.n}) nem húzhatunk ki ${h.N} elemet, ha a minta kisebb a sokaságnál: ${h.n} < ${h.N}, tehát n = ${h.N} nem lehet.` },
      { szoveg: `N = ${h.N}, M = ${h.n}, n = ${h.M}`, uzenet: 'M a kitüntetettek darabszáma a sokaságban, n a minta elemszáma – ezeket nem szabad felcserélni.', ellenproba: `Ellenpróba: a szövegben ${h.M} kitüntetett van a sokaságban, és ${h.n} elemet húzunk; az „M = ${h.n}” ezt a kettőt cserélné fel.` },
    ];
    rosszEll = [
      { uzenet: 'Visszatevés nélkül húzunk és ismert a sokaság → hipergeometrikus.', ellenproba: `Ellenpróba: visszatevés nélkül minden húzás után kevesebb elem marad (${h.N} → ${h.N - 1}), és az arány is változik (${p4(h.M / h.N)}, majd ${p4((h.M - 1) / (h.N - 1))} vagy ${p4(h.M / (h.N - 1))}), tehát a húzások nem függetlenek – a binomiális nem pontos.` },
    ];
    magyarazat = [
      `Azt kérdezik, melyik eloszlás írja le a kitüntetettek számát a mintában. Ehhez először azt kell eldönteni: visszatesszük-e a kihúzott elemet?`,
      `Itt nem tesszük vissza (visszatevés nélkül húzunk), és ismerjük a sokaság méretét: ${h.N}. Ilyenkor az arány húzásról húzásra változik (például ${h.M}/${h.N} = ${p4(h.M / h.N)}, majd ${p4((h.M - 1) / (h.N - 1))} vagy ${p4(h.M / (h.N - 1))}), ezért a hipergeometrikus eloszlás a megfelelő.`,
      `A paraméterek: N = ${h.N} (a sokaság), M = ${h.M} (a kitüntetettek darabszáma – nem százalék), n = ${h.n} (a minta elemszáma).`,
      `Józan ésszel: a sokaság (${h.N}) nagyobb a mintánál (${h.n}), és a kitüntetettek száma (${h.M}) kisebb a sokaságnál. Ha visszatennénk az elemeket, binomiálist használnánk.`,
    ];
    megoldas = [`Visszatevés nélkül, ismert sokaság → <strong>hipergeometrikus</strong>.`, `Paraméterek: N = ${h.N}, M = ${h.M}, n = ${h.n}.`];
    tipp = ['Visszatesszük-e a kihúzott elemet? Ismerjük-e a sokaság méretét?', 'Visszatevés nélkül húzunk, és ismert a sokaság → hipergeometrikus. Binomiális: visszatevéssel vagy független kísérletekkel.'];
  } else if (eset === 'vissza') {
    const h = binomAdat(rng, { mod: 'darab' });
    szoveg = `${h.intro} Melyik eloszlással számolhatjuk ki annak a valószínűségét, hogy ${h.kivett} között hány ${h.egy} van?`;
    helyesEloszlas = 1;
    par = [
      { szoveg: `n = ${h.n}, p = ${p4(h.p)}`, helyes: true },
      { szoveg: `n = ${h.n}, p = ${h.M}`, uzenet: `A p arány, 0 és 1 közötti szám: egy-egy húzásnál az esély ${h.M}/${h.S} = ${p4(h.p)}.`, ellenproba: `Ellenpróba: a valószínűség legfeljebb 1 lehet, ezért p = ${h.M} nem lehet; ${h.M}/${h.S} = ${p4(h.p)}.` },
      { szoveg: `n = ${h.S}, p = ${p4(h.p)}`, uzenet: 'n a kísérletek (húzások) száma, nem a sokaság elemszáma.', ellenproba: `Ellenpróba: ${h.n} alkalommal húzunk, nem ${h.S}-szor; a(z) ${h.S} a pakli/doboz elemszáma, ami csak a p kiszámításához kell (${h.M}/${h.S}).` },
    ];
    rosszEll = [
      { uzenet: 'Visszatevéssel minden húzásnál ugyanakkora az esély és a húzások függetlenek → binomiális.', ellenproba: `Ellenpróba: visszatevéssel mindig ugyanannyi elemből húzunk (${h.S}), az esély minden húzásnál ugyanannyi: ${h.M}/${h.S} = ${p4(h.p)} – ez a binomiális eloszlás feltétele.` },
    ];
    magyarazat = [
      `Azt kérdezik, melyik eloszlás írja le a kitüntetettek számát. Ehhez azt kell megnézni: visszatesszük-e a kihúzott elemet?`,
      `Itt igen (visszatevéssel húzunk), ezért minden húzásnál ugyanakkora az esély: ${h.M}/${h.S} = ${p4(h.p)}, és a húzások egymástól függetlenek. Független, azonos esélyű kísérletek száma alapján a binomiális eloszlás a megfelelő.`,
      `A paraméterek: n = ${h.n} (a húzások száma) és p = ${p4(h.p)} (egy-egy húzásnál a kitüntetett aránya – nem darabszám).`,
      `Józan ésszel: a p valószínűség, tehát 0 és 1 között van; a ${h.M} darabszám (a ${h.S} elemből ${h.M} kitüntetett), a belőle számolt arány pedig ${p4(h.p)}.`,
    ];
    megoldas = [`Visszatevéssel, független kísérletek → <strong>binomiális</strong>.`, `Paraméterek: n = ${h.n}, p = ${h.M}/${h.S} = ${p4(h.p)}.`];
    tipp = ['Visszatesszük-e a kihúzott elemet? Ugyanakkora-e az esély minden húzásnál?', 'Visszatevéssel (független kísérletek, állandó p) → binomiális.'];
  } else {
    const h = binomAdat(rng, { mod: 'arany' });
    szoveg = `${h.intro} Melyik eloszlással számolhatjuk ki annak a valószínűségét, hogy ${h.kivett} között hány ${h.egy} van?`;
    helyesEloszlas = 1;
    par = [
      { szoveg: `n = ${h.n}, p = ${p4(h.p)}`, helyes: true },
      { szoveg: `n = ${h.n}, p = ${h.pct}`, uzenet: `A p arány, 0 és 1 közötti szám: ${h.pct} % = ${p4(h.p)}.`, ellenproba: `Ellenpróba: a valószínűség legfeljebb 1 lehet, ezért p = ${h.pct} nem lehet; ${h.pct} % = ${h.pct}/100 = ${p4(h.p)}.` },
      { szoveg: `n = ${h.pct}, p = ${p4(h.n / 100)}`, uzenet: 'n a kiválasztott minta elemszáma, a százalék pedig az arány (p) – ezeket nem szabad felcserélni.', ellenproba: `Ellenpróba: a mintában ${h.n} elem van, az arány pedig ${h.pct} % = ${p4(h.p)}; fordítva (n = ${h.pct}, p = ${p4(h.n / 100)}) a feladat adatai felcserélődnének.` },
    ];
    rosszEll = [
      { uzenet: 'Nem ismerjük a sokaság méretét – nagy sokaságnál binomiálissal becsülünk.', ellenproba: `Ellenpróba: a hipergeometrikus eloszláshoz kellene a sokaság elemszáma (N) és a kitüntetettek darabszáma (M); itt csak az arány (${h.pct} %) ismert, és ${h.n} elem kicsi a nagyon nagy sokasághoz képest, így a binomiális jó közelítést ad.` },
    ];
    magyarazat = [
      `Azt kérdezik, melyik eloszlás írja le a kitüntetettek számát a mintában. Itt a sokaság nagyon nagy, és csak az arány ismert: ${h.pct} %.`,
      `Nem tudjuk a sokaság pontos méretét, ezért hipergeometrikus eloszlást nem is tudnánk felírni (N és M kellene). Nagy sokaságnál a kivett elemek alig változtatják meg az arányt, ezért a visszatevés nélküli húzást is binomiálissal becsüljük.`,
      `A paraméterek: n = ${h.n} (a minta elemszáma) és p = ${p4(h.p)} (${h.pct} % tizedes törtként).`,
      `Józan ésszel: ${h.n} elem kiválasztása után a nagyon nagy sokaság aránya gyakorlatilag ugyanaz marad, ezért mindegy, hogy visszatesszük-e az elemeket.`,
    ];
    megoldas = [`Nagy sokaság, csak az arány ismert → <strong>binomiális</strong> (becslés).`, `Paraméterek: n = ${h.n}, p = ${h.pct} % = ${p4(h.p)}.`];
    tipp = ['Ismerjük-e a sokaság pontos méretét? Mi ismert: darabszám vagy arány?', 'Nagy sokaság, csak az arány ismert → binomiálissal becsülünk.'];
  }
  const nevek = ['hipergeometrikus', 'binomiális'];
  return {
    szoveg,
    mezok: [
      valasztoMezo({
        id: 'eloszlas', cimke: 'Melyik eloszlás?',
        opciok: nevek.map((sz, i) => (i === helyesEloszlas
          ? { szoveg: sz, helyes: true }
          : { szoveg: sz, helyes: false, uzenet: rosszEll[0].uzenet, ellenproba: rosszEll[0].ellenproba })),
      }),
      valasztoMezo({ id: 'parameterek', cimke: 'Melyek a paraméterek?', opciok: par.map((o, i) => ({ ...o, helyes: !!o.helyes })) }),
    ],
    tippek: [tipp[0], tipp[1], `A válasz: ${nevek[helyesEloszlas]}.`],
    megoldas,
    magyarazat,
    jegyezze: 'Visszatevés nélkül (ismert sokaság: N, M, n) → hipergeometrikus; visszatevéssel vagy független kísérletekkel (n, p) → binomiális. Nagy sokaságnál, ha csak az arány ismert, a binomiálissal becslünk.',
  };
}

// =====================================================================
// M2 – hipergeometrikus, pontos érték
// =====================================================================
function M2(rng) {
  const szazalek = rng() < 0.3;
  let k, h;
  h = probal(() => {
    const x = hiperAdat(rng, { szazalek, nMin: 3, nMax: 10 });
    const [lo, hi] = tamasz(x.el);
    k = egesz(rng, lo, hi);
    const P = x.el.pmf(k);
    return P >= 0.02 && P <= 0.9 ? x : null;
  });
  const { el } = h;
  const P = el.pmf(k);
  const binomHiba = binomEl(h.n, h.M / h.N).pmf(k);
  const szazalekHiba = h.pct !== null && h.pct !== undefined && h.pct < h.N ? E.hiperPmf(h.N, h.pct, h.n, k) : NaN;
  const fe = { kulcs: 'pontosan', k, szoveg: `pontosan ${k}`, a: k, b: k, P, jel: `X = ${k}` };
  const mezo = pMezo({
    el, a: k, b: k, helyes: P, felre: [0, k], felreUzenet: felteletUzenet('pontosan', k, h.n),
    hibak: [
      { ertek: binomHiba, uzenet: 'Ez a binomiális érték (az arányból számolva). Visszatevés nélkül húzunk és ismert a sokaság → hipergeometrikus.' },
      ...(Number.isFinite(szazalekHiba) ? [{ ertek: szazalekHiba, uzenet: `Darabszám kell, nem százalék: ${az(h.N, 0)} ${h.nev} ${h.pct} %-a = ${h.M}.` }] : []),
    ],
  });
  const kepl = `C(${h.M}, ${k}) · C(${h.N - h.M}, ${h.n - k}) / C(${h.N}, ${h.n})`;
  return {
    szoveg: `${h.intro} ${kerdesSzoveg(h, fe)}`,
    mezok: [mezo],
    tippek: [
      'Visszatesszük-e a kihúzott elemet? Ismerjük-e a sokaság méretét, és mi a kitüntetettek darabszáma?',
      `Hipergeometrikus eloszlás: N = ${h.N}, M = ${h.M} (darabszám!), n = ${h.n}; a kért érték X = ${k}.`,
      `P(X = ${k}) = ${kepl}.`,
    ],
    megoldas: [
      h.pct !== null && h.pct !== undefined ? `A kitüntetettek darabszáma: ${h.pct} % · ${h.N} = ${h.M}.` : `A paraméterek: N = ${h.N}, M = ${h.M}, n = ${h.n}.`,
      `P(X = ${k}) = ${kepl}.`,
      `= ${f(E.kombinacio(h.M, k) * E.kombinacio(h.N - h.M, h.n - k), 0)} / ${f(E.kombinacio(h.N, h.n), 0)} = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: pMagyarazat(h, { ...fe, a: k, b: k }, el),
    abraMegoldas: abraDiszkret(el, k, k, { felirat: `P(X = ${k}) = ${p4(P)}` }),
    geogebra: ggDiszkret(el, k, k),
    jegyezze: 'Hipergeometrikus: N (sokaság), M (kitüntetettek DARABSZÁMA), n (minta); P(X = k) = C(M,k) · C(N−M, n−k) / C(N,n). A százalékból előbb darabszámot kell számolni.',
  };
}

// =====================================================================
// M3 – hipergeometrikus, intervallum
// =====================================================================
function M3(rng) {
  let fe, h;
  h = probal(() => {
    const x = hiperAdat(rng, { nMin: 3, nMax: 10 });
    fe = feltetelValaszt(rng, x.el, { kulcsok: ['tobb', 'tobb', 'kevesebb', 'kevesebb', 'legalabb', 'legfeljebb'] });
    return fe ? x : null;
  });
  const { el } = h;
  const jel = felteletUzenet(fe.kulcs, fe.k, el.n);
  const mezo = pMezo({ el, a: fe.a, b: fe.b, helyes: fe.P, felre: fe.felre, felreUzenet: jel }); // a határ-félreértés célzott üzenete
  // komplementer irány (a másik oldal): 1 − P
  const komp = 1 - fe.P;
  if (!mezo.hibak.some((x) => Math.abs(x.ertek - komp) < 1e-4) && Math.abs(komp - fe.P) > 1e-3) {
    mezo.hibak.push({ ertek: komp, uzenet: `Ez a kért tartomány komplementere (a másik oldal). A kérdés: ${fe.szoveg} → ${tartJel(fe.a, fe.b, el.n)}.` });
  }
  return {
    szoveg: `${h.intro} ${kerdesSzoveg(h, fe)}`,
    mezok: [mezo],
    tippek: [
      `Melyik értékeket jelenti pontosan, hogy „${fe.szoveg}”? Beleszámít-e a határ?`,
      `${jel} Tehát a kért tartomány: ${tartJel(fe.a, fe.b, el.n)}. Hipergeometrikus eloszlás: N = ${h.N}, M = ${h.M}, n = ${h.n}.`,
      `Adja össze a kért oszlopok valószínűségét (vagy használja a GeoGebrát: ${fe.a === 0 ? 'kisebb (≤)' : fe.b >= el.n ? 'nagyobb (≥)' : 'két érték között'}).`,
    ],
    megoldas: pMegoldas(h, fe, el),
    magyarazat: pMagyarazat(h, fe, el),
    abraMegoldas: abraDiszkret(el, fe.a, fe.b, { felre: fe.felre, felirat: `P(${tartJel(fe.a, fe.b, el.n)}) = ${p4(fe.P)}` }),
    geogebra: ggDiszkret(el, fe.a, fe.b),
    jegyezze: 'Diszkrét eloszlásnál a határ számít: „k-nál több” → X ≥ k + 1; „k-nál kevesebb” → X ≤ k − 1; „legalább k” → X ≥ k; „legfeljebb k” → X ≤ k.',
  };
}

// =====================================================================
// M4 – módusz és valószínűsége
// =====================================================================
function M4(rng) {
  const hiper = rng() < 0.5;
  const adat = probal(() => {
    const x = hiper ? hiperAdat(rng, { nMin: 3, nMax: 12 }) : binomAdat(rng, { nMin: 5, nMax: 30 });
    if (x.el.moduszok.length !== 1) return null;
    const m = x.el.moduszok[0];
    // legyen a várható érték nem egész, és a kerekítése is más, mint a módusz, vagy legalább nem egyezzen
    return x;
  });
  const { el } = adat;
  const m = el.moduszok[0];
  const pm = el.pmf(m);
  const mu = el.mu;
  const szovegAlap = `${adat.intro} Mennyi a ${adat.egy} darabszámának módusza (a legvalószínűbb érték) ${adat.kivett} között, és mennyi ennek a valószínűsége?`;
  const elteroMu = [Math.round(mu), tisztit(mu)].filter((x) => x !== m);
  return {
    szoveg: szovegAlap,
    mezok: [
      szamMezo({
        id: 'modusz', cimke: 'A módusz (egész szám)', helyes: m, tizedes: 0, egesz: true,
        egeszUzenet: 'A módusz a legvalószínűbb érték, a legmagasabb oszlop – egész szám, nem a várható érték.',
        ellenproba: (w) => `Ellenpróba: az oszlopdiagramon X = ${f(w, 2)} valószínűsége ${Number.isInteger(w) && w >= 0 && w <= el.n ? p4(el.pmf(w)) : '0 (nem egész érték)'}, a legmagasabb oszlop viszont X = ${m} (${p4(pm)}).`,
        hibak: elteroMu.map((ertek) => ({ ertek, uzenet: 'A módusz a legvalószínűbb érték, a legmagasabb oszlop – nem a várható érték.' })),
      }),
      pMezo({ id: 'pm', cimke: 'A módusz valószínűsége', el, a: m, b: m, helyes: pm, hibak: [{ ertek: m, uzenet: 'Ez maga a módusz (az érték). A kérdés a valószínűsége: P(X = módusz).' }].filter((x) => x.ertek > 1) }),
    ],
    tippek: [
      'Mit jelent a „legvalószínűbb érték”? Melyik oszlop a legmagasabb?',
      `Számolja ki (vagy a GeoGebrával olvassa le) a P(X = k) értékeket k = 0, 1, 2, … -re, és keresse a legnagyobbat. A várható érték ${f(mu, 4)}, de az nem feltétlenül a módusz.`,
      `A legmagasabb oszlop X = ${m} körül van.`,
    ],
    megoldas: [
      el.fajta === 'hiper' ? `Hipergeometrikus eloszlás: N = ${el.N}, M = ${el.M}, n = ${el.n}.` : `Binomiális eloszlás: n = ${el.n}, p = ${p4(el.p)}.`,
      `A valószínűségek közül a legnagyobb X = ${m} esetén van: P(X = ${m}) = <strong>${p4(pm)}</strong>, tehát a módusz <strong>${m}</strong>.`,
    ],
    magyarazat: [
      `A módusz a legvalószínűbb érték: az az X, amelynél a valószínűség a legnagyobb, vagyis a legmagasabb oszlop. A valószínűségét is kérdezik.`,
      `${el.fajta === 'hiper' ? 'Visszatevés nélkül húzunk, ezért hipergeometrikus eloszlásról van szó' : 'Független kísérletekről van szó, ezért az eloszlás binomiális'} (${sorok(el)}). Végigszámoljuk az oszlopokat: a legmagasabb X = ${m}, ahol P = ${p4(pm)}.`,
      `Képzelje el, hogy 100 mintát veszünk: a(z) ${m} kitüntetett elem kb. ${f(100 * pm, 1)} mintában fordul elő, többször, mint bármelyik másik darabszám.`,
      `Józan ésszel: a várható érték ${f(mu, 4)}, a módusz ${m}; ezek közel vannak egymáshoz, de nem feltétlenül egyeznek meg (a várható érték lehet tört, a módusz mindig egész). A módusz valószínűsége ${p4(pm)} ✓.`,
    ],
    abraMegoldas: eloszlasAbra({
      ertekek: Array.from({ length: el.n + 1 }, (_, k) => ({ x: k, p: el.pmf(k) })), varhato: mu, varhatoCimke: `μ = ${f(mu, 4)}`, diszkret: true, kiemelt: [m],
      felirat: `módusz: X = ${m}, P = ${p4(pm)}`, jelmagyarazat: [{ osztaly: 'kiemelt', szoveg: 'legmagasabb oszlop' }],
      leiras: `Az eloszlás oszlopdiagramja; a legmagasabb oszlop az X = ${m} értéknél van.`,
    }),
    geogebra: ggDiszkret(el, m, m),
    jegyezze: 'A módusz a legvalószínűbb érték (a legmagasabb oszlop) – nem azonos a várható értékkel, és mindig egész szám.',
  };
}

// =====================================================================
// M5 – várható érték, szórás
// =====================================================================
function M5(rng) {
  const hiper = rng() < 0.5;
  const adat = hiper ? hiperAdat(rng, { nMin: 4, nMax: 12 }) : binomAdat(rng, { nMin: 5, nMax: 30 });
  const { el } = adat;
  const { mu, sigma } = el;
  const ellMu = (w) => `Ellenpróba: ${f(w, 4)} kitüntetett elem várható mintánként; ${adat.n} elemből álló mintánál a kitüntetettek aránya ${f(w / adat.n, 4)} lenne, a sokaságban viszont ${el.fajta === 'hiper' ? `${adat.M}/${adat.N}` : p4(el.p)} = ${p4(el.fajta === 'hiper' ? adat.M / adat.N : el.p)}.`;
  const arany = el.fajta === 'hiper' ? adat.M / adat.N : el.p;
  const ellSigma = (w) => `Ellenpróba: ha σ = ${f(w, 4)} lenne, akkor σ² = ${f(w * w, 4)} volna, a valódi szórásnégyzet viszont ${f(sigma * sigma, 4)}; a szórás ennek a négyzetgyöke, ${f(sigma, 4)}.`;
  const sigmaBinom = el.fajta === 'hiper' ? Math.sqrt(adat.n * arany * (1 - arany)) : NaN;
  return {
    szoveg: `${adat.intro} Mennyi a ${adat.egy} darabszámának várható értéke (μ) és szórása (σ) ${adat.kivett} között?`,
    mezok: [
      szamMezo({
        id: 'mu', cimke: 'Várható érték μ (4 tizedesre)', helyes: mu, tizedes: 4, abszTures: 0.0001, ellenproba: ellMu,
        hibak: [{ ertek: arany, uzenet: `Ez az arány (${p4(arany)}). A várható érték a mintában várható darabszám: n · arány.` }],
      }),
      szamMezo({
        id: 'sigma', cimke: 'Szórás σ (4 tizedesre)', helyes: sigma, tizedes: 4, abszTures: 0.0001, ellenproba: ellSigma,
        hibak: [
          { ertek: sigma * sigma, uzenet: 'Ez a szórásnégyzet, gyököt kell vonni.' },
          ...(el.fajta === 'hiper' && Number.isFinite(sigmaBinom) ? [{ ertek: sigmaBinom, uzenet: 'Ez a binomiális szórás. Visszatevés nélkül a szórás kisebb: a hipergeometrikusra szorozni kell a √((N − n)/(N − 1)) tényezővel (a GeoGebra ezt adja).' }] : []),
        ],
      }),
    ],
    tippek: [
      el.fajta === 'hiper' ? 'Melyik eloszlás ez, és mi a várható érték képlete?' : 'Melyik eloszlás ez, és mi a binomiális várható érték és szórás képlete?',
      el.fajta === 'hiper'
        ? `Hipergeometrikus: μ = n · M / N = ${adat.n} · ${adat.M} / ${adat.N}. A szórást a GeoGebra Statisztika részénél olvashatja le, vagy a képlettel számolja.`
        : `Binomiális: μ = n · p, σ = √(n · p · (1 − p)) = √(${el.n} · ${p4(el.p)} · ${p4(1 - el.p)}).`,
      `μ = ${f(mu, 4)}.`,
    ],
    megoldas: [
      el.fajta === 'hiper'
        ? `μ = n · M / N = ${adat.n} · ${adat.M} / ${adat.N} = <strong>${f(mu, 4)}</strong>; σ = √(n · M/N · (1 − M/N) · (N − n)/(N − 1)) = <strong>${f(sigma, 4)}</strong>.`
        : `μ = n · p = ${el.n} · ${p4(el.p)} = <strong>${f(mu, 4)}</strong>; σ = √(n · p · (1 − p)) = √(${el.n} · ${p4(el.p)} · ${p4(1 - el.p)}) = <strong>${f(sigma, 4)}</strong>.`,
    ],
    magyarazat: [
      `Azt keressük, átlagosan hány kitüntetett elem lesz a mintában (μ), és mekkora az ingadozás körülötte (σ).`,
      `Az átlag egyszerű: a minta ${adat.n} elemű, és minden elem ${p4(arany)} eséllyel kitüntetett, ezért átlagosan ${adat.n} · ${p4(arany)} = ${f(mu, 4)} kitüntetett elem jut egy mintára. Az átlag lehet tört is, hiszen sok minta átlagáról van szó.`,
      `A szórás azt mutatja, mennyire térnek el a minták ettől az átlagtól. ${el.fajta === 'hiper' ? 'Visszatevés nélkül a szórás kicsit kisebb, mint visszatevéssel, mert a mintavétel „kimeríti” a sokaságot.' : 'Binomiális eloszlásnál σ = √(n · p · (1 − p)).'} Itt σ = ${f(sigma, 4)}. A szórásnégyzet ${f(sigma * sigma, 4)}, abból gyököt vonva kapjuk a szórást.`,
      `Képzelje el, hogy 100 mintát veszünk: összesen kb. ${f(100 * mu, 1)} kitüntetett elemet találunk, vagyis mintánként átlagosan ${f(mu, 4)} kitüntetett elemet.`,
      `Józan ésszel: a várható érték (${f(mu, 4)}) 0 és ${adat.n} között van, a szórás (${f(sigma, 4)}) pedig kisebb a minta méreténél ✓.`,
    ],
    abraMegoldas: eloszlasAbra({
      ertekek: Array.from({ length: el.n + 1 }, (_, k) => ({ x: k, p: el.pmf(k) })), varhato: mu, varhatoCimke: `μ = ${f(mu, 4)}`, diszkret: true,
      felirat: `σ = ${f(sigma, 4)}`, leiras: `Az eloszlás oszlopdiagramja a várható értékkel (μ = ${f(mu, 4)}).`,
    }),
    geogebra: ggStat(el),
    jegyezze: 'Hipergeometrikus: μ = n · M / N; binomiális: μ = n · p, σ = √(n · p · (1 − p)). A szórásnégyzet gyöke a szórás.',
  };
}

// =====================================================================
// M6 – „a várható értéktől legfeljebb t szórással tér el”
// =====================================================================
function M6(rng) {
  const hiper = rng() < 0.5;
  const t = valaszt(rng, [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2]);
  const adat = probal(() => {
    const x = hiper ? hiperAdat(rng, { nMin: 6, nMax: 12 }) : binomAdat(rng, { nMin: 8, nMax: 30 });
    const { mu, sigma, n } = x.el;
    const also = mu - t * sigma, felso = mu + t * sigma;
    if (Math.abs(also - Math.round(also)) < 1e-6 || Math.abs(felso - Math.round(felso)) < 1e-6) return null;
    const [lo, hi] = tamasz(x.el);
    const a = Math.max(Math.ceil(also), lo), b = Math.min(Math.floor(felso), hi);
    if (a > b || also < 0 || felso > n) return null;
    const P = tart(x.el, a, b);
    if (P < 0.1 || P > 0.995) return null;
    // a rossz irányú kerekítés más eredményt adjon
    if (Math.abs(tart(x.el, Math.floor(also), Math.ceil(felso)) - P) < 1e-3) return null;
    return { ...x, also, felso, a, b, P };
  });
  const { el } = adat;
  const { also, felso, a, b, P } = adat;
  const jel = `${a} ≤ X ≤ ${b}`;
  const rosszP = tart(el, Math.floor(also), Math.ceil(felso));
  const ellP = (w) => `Ellenpróba: a határok ${f(also, 4)} és ${f(felso, 4)}, a közéjük eső egész értékek X = ${a} … ${b}; ezek oszlopainak összege ${p4(P)}, az Ön ${p4(w)} értéke ${w > P ? 'ennél nagyobb' : 'ennél kisebb'}.`;
  return {
    szoveg: `${adat.intro} Mennyi a valószínűsége, hogy ${adat.kivett} között a ${adat.egy} darabszáma a várható értéktől legfeljebb ${f(t, 2)} szórással tér el? Adja meg az intervallum két egész határát és a valószínűséget!`,
    mezok: [
      szamMezo({
        id: 'also', cimke: 'Legkisebb megengedett egész érték', helyes: a, tizedes: 0, egesz: true,
        egeszUzenet: `Egész érték kell: az alsó határ ${f(also, 2)}, fölötte az első egész szám ${a}.`,
        ellenproba: (w) => `Ellenpróba: a határ μ − ${f(t, 2)} · σ = ${f(also, 4)}; ennél nem kisebb első egész szám ${a}, az Ön ${f(w, 2)} értéke ${w < a ? 'ennél kisebb, tehát kilógna az intervallumból' : 'ennél nagyobb, így kihagyna egy megengedett értéket'}.`,
        hibak: [{ ertek: Math.floor(also), uzenet: `Az alsó határ ${f(also, 2)}; fölötte az első egész szám ${a}. Lefelé kerekítve olyan érték is bekerülne, amely kívül esik az intervallumon.` }].filter((x) => x.ertek !== a),
      }),
      szamMezo({
        id: 'felso', cimke: 'Legnagyobb megengedett egész érték', helyes: b, tizedes: 0, egesz: true,
        egeszUzenet: `Egész érték kell: a felső határ ${f(felso, 2)}, alatta az utolsó egész szám ${b}.`,
        ellenproba: (w) => `Ellenpróba: a határ μ + ${f(t, 2)} · σ = ${f(felso, 4)}; ennél nem nagyobb utolsó egész szám ${b}, az Ön ${f(w, 2)} értéke ${w > b ? 'ennél nagyobb, tehát kilógna az intervallumból' : 'ennél kisebb, így kihagyna egy megengedett értéket'}.`,
        hibak: [{ ertek: Math.ceil(felso), uzenet: `A felső határ ${f(felso, 2)}; alatta az utolsó egész szám ${b}. Felfelé kerekítve olyan érték is bekerülne, amely kívül esik az intervallumon.` }].filter((x) => x.ertek !== b),
      }),
      pMezo({
        id: 'p', cimke: 'A valószínűség', el, a, b, helyes: P,
        hibak: [{ ertek: rosszP, uzenet: 'A határokat egészre kell kerekíteni a megengedett irányban: csak azok az egész értékek számítanak, amelyek még az intervallumban vannak.' }],
      }),
    ],
    tippek: [
      'Mik az intervallum határai? Mennyi μ és σ, és mi lesz μ − t · σ meg μ + t · σ?',
      `μ = ${f(el.mu, 4)}, σ = ${f(el.sigma, 4)}, t = ${f(t, 2)}: a határok ${f(also, 4)} és ${f(felso, 4)}. Csak egész X értékek lehetnek, és csak azok, amelyek az intervallumon belül vannak.`,
      `Az egész értékek: ${a} … ${b}. Adja össze az oszlopaikat.`,
    ],
    megoldas: [
      `μ = ${f(el.mu, 4)}, σ = ${f(el.sigma, 4)}.`,
      `Az intervallum: μ ± ${f(t, 2)} · σ = [${f(also, 4)}; ${f(felso, 4)}]. A benne lévő egész értékek: ${a} … ${b}.`,
      `P(${jel}) = <strong>${p4(P)}</strong>.`,
    ],
    magyarazat: [
      `Az intervallum a várható érték körül ${f(t, 2)} szórásnyi sugarú: [μ − ${f(t, 2)} · σ; μ + ${f(t, 2)} · σ] = [${f(also, 4)}; ${f(felso, 4)}]. A kitüntetettek száma csak egész lehet, ezért a határokat egészre kerekítjük.`,
      `A kerekítés iránya számít: az alsó határnál (${f(also, 4)}) az utána következő első egész kell, vagyis ${a}, mert ami kisebb, az már kívül van; a felső határnál (${f(felso, 4)}) az előtte lévő utolsó egész, ${b}.`,
      `Így a kérdés: P(${jel}) = ${p4(P)}. Az oszlopokat (${oszlopLista(el, a, b)}) összeadjuk.`,
      `Képzelje el, hogy 100 mintát veszünk: kb. ${f(100 * P, 1)} esetben esik a kitüntetettek száma ebbe a sávba.`,
      `Józan ésszel: a sáv a várható érték (${f(el.mu, 4)}) körül van, ezért a valószínűsége nagy, ${p4(P)} ✓. Minél több szórásnyira engedjük az eltérést, annál nagyobb a valószínűség.`,
    ],
    abraMegoldas: abraDiszkret(el, a, b, { felre: [Math.floor(also), Math.ceil(felso)], felirat: `P(${jel}) = ${p4(P)}` }),
    geogebra: ggDiszkret(el, a, b),
    jegyezze: 'Legfeljebb t szórás: az intervallum [μ − tσ; μ + tσ], és csak az ebbe eső EGÉSZ értékek számítanak: az alsó határnál felfelé, a felsőnél lefelé kerekítünk.',
  };
}

// =====================================================================
// M7 – binomiális, pontos érték / intervallum
// =====================================================================
function M7(rng) {
  let fe, h;
  h = probal(() => {
    const x = binomAdat(rng, { nMin: 3, nMax: 30 });
    fe = feltetelValaszt(rng, x.el, { kulcsok: ['pontosan', 'legalabb', 'legfeljebb', 'tobb', 'kevesebb', 'legalabb', 'legfeljebb'], pMin: 0.01 });
    return fe ? x : null;
  });
  const { el } = h;
  const jel = felteletUzenet(fe.kulcs, fe.k, el.n);
  const mezo = pMezo({ el, a: fe.a, b: fe.b, helyes: fe.P, felre: fe.felre, felreUzenet: jel });
  // legfeljebb ↔ legalább csere
  const csere = fe.kulcs === 'legfeljebb' ? tart(el, fe.k, el.n) : fe.kulcs === 'legalabb' ? tart(el, 0, fe.k) : NaN;
  if (Number.isFinite(csere) && Math.abs(csere - fe.P) > 1e-3 && !mezo.hibak.some((x) => Math.abs(x.ertek - csere) < 1e-4)) {
    mezo.hibak.push({ ertek: csere, uzenet: fe.kulcs === 'legfeljebb'
      ? `Olvassa el még egyszer: legfeljebb ${fe.k} = ${Array.from({ length: Math.min(fe.k, 3) + 1 }, (_, i) => i).join(', ')}${fe.k > 3 ? ' … ' + fe.k : ''}, vagyis alulról számolunk, nem felülről.`
      : `Olvassa el még egyszer: legalább ${fe.k} = ${fe.k} vagy több, vagyis felülről számolunk, nem alulról.` });
  }
  // darabszám / százalék a valószínűség helyett
  const darab = h.mod === 'darab' ? h.M : h.pct;
  mezo.hibak.push({
    ertek: darab, tures: 1e-9,
    uzenet: h.mod === 'darab' ? `Egy-egy húzásnál az esély: ${h.M}/${h.S} = ${p4(h.p)} – a p arány, nem darabszám.` : `A ${h.pct} % tizedes törtként ${p4(h.p)}: a p arány, nem a százalék.`,
  });
  mezo.hibak = mezo.hibak.filter((x, i, t) => t.findIndex((y) => Math.abs(y.ertek - x.ertek) < 1e-9) === i);
  return {
    szoveg: `${h.intro} ${kerdesSzoveg(h, fe)}`,
    mezok: [mezo],
    tippek: [
      'Mi az egy-egy húzásnál (kísérletnél) a kitüntetett esélye, és hány kísérletünk van? Független-e a kísérletek?',
      `Binomiális eloszlás: n = ${h.n}, p = ${h.mod === 'darab' ? `${h.M}/${h.S}` : `${h.pct} % `}= ${p4(h.p)}. A kérdés: „${fe.szoveg}” → ${tartJel(fe.a, fe.b, el.n)}.`,
      `P(X = k) = C(${h.n}, k) · ${p4(h.p)}ᵏ · ${p4(1 - h.p)}^(${h.n} − k); adja össze a kért oszlopokat.`,
    ],
    megoldas: pMegoldas(h, fe, el),
    magyarazat: pMagyarazat(h, fe, el),
    abraMegoldas: abraDiszkret(el, fe.a, fe.b, { felre: fe.felre, felirat: `P(${tartJel(fe.a, fe.b, el.n)}) = ${p4(fe.P)}` }),
    geogebra: ggDiszkret(el, fe.a, fe.b),
    jegyezze: 'Binomiális: n kísérlet, p az ARÁNY egy-egy kísérletnél (0 és 1 között); P(X = k) = C(n,k) · pᵏ · (1 − p)ⁿ⁻ᵏ. A határok számítanak: legfeljebb k = 0…k, legalább k = k…n.',
  };
}

// =====================================================================
// M8 – kitüntetett csere (fiú 45 % → lány 0,55)
// =====================================================================
const CSERE_HELYZETEK = [
  {
    id: 'szules', pctok: [40, 45, 48, 52],
    intro: (pct, n) => `Egy családban a születendő gyermek ${pct} % eséllyel fiú, a születések egymástól függetlenek. ${n} gyermek születik.`,
    egy: 'lány', kerdes: (fe) => `Mennyi a valószínűsége, hogy ${fe.szoveg} lány van köztük?`, elem: 'a lány születésének',
  },
  {
    id: 'minoseg', pctok: [5, 8, 10, 12, 15],
    intro: (pct, n) => `Egy üzemben az alkatrészek ${pct} %-a selejtes, a gyártott mennyiség nagyon nagy. Találomra kiválasztunk ${n} alkatrészt.`,
    egy: 'hibátlan alkatrész', kerdes: (fe) => `Mennyi a valószínűsége, hogy ${fe.szoveg} hibátlan alkatrész van köztük?`, elem: 'a hibátlan alkatrész kiválasztásának',
  },
  {
    id: 'szavazat', pctok: [35, 40, 45, 55],
    intro: (pct, n) => `A választók ${pct} %-a támogatja a javaslatot, a választók száma nagyon nagy. Találomra megkérdezünk ${n} választót.`,
    egy: 'nem támogató', kerdes: (fe) => `Mennyi a valószínűsége, hogy ${fe.szoveg} megkérdezett nem támogatja a javaslatot?`, elem: 'a nem támogató választó megkérdezésének',
  },
];
function M8(rng) {
  const hely = valaszt(rng, CSERE_HELYZETEK);
  let fe, pct, n, el;
  probal(() => {
    pct = valaszt(rng, hely.pctok);
    n = egesz(rng, 4, 12);
    const p = tisztit(1 - pct / 100);
    el = binomEl(n, p);
    fe = feltetelValaszt(rng, el, { kulcsok: ['pontosan', 'legalabb', 'legfeljebb', 'tobb', 'kevesebb'], pMin: 0.02 });
    if (!fe) return null;
    const rossz = tart(binomEl(n, pct / 100), fe.a, fe.b);
    return Math.abs(rossz - fe.P) > 1e-3 ? true : null;
  });
  const p = el.p, pa = pct / 100;
  const rossz = tart(binomEl(n, pa), fe.a, fe.b);
  const mezo = pMezo({
    el, a: fe.a, b: fe.b, helyes: fe.P, felre: fe.felre, felreUzenet: felteletUzenet(fe.kulcs, fe.k, el.n),
    hibak: [{ ertek: rossz, uzenet: `${hely.elem.charAt(0).toUpperCase() + hely.elem.slice(1)} esélye 1 − ${p4(pa)} = ${p4(p)}: a kitüntetett az, amiről a kérdés szól.` }],
  });
  const ellOrig = mezo.ellenproba;
  mezo.ellenproba = (w) => (Math.abs(w - rossz) <= 1.5e-4
    ? `Ellenpróba: az Ön ${p4(w)} értéke annak a valószínűsége, ha p = ${p4(pa)} lenne; a kérdezett esemény esélye viszont 1 − ${p4(pa)} = ${p4(p)}, és ezzel ${p4(fe.P)} jön ki.`
    : ellOrig(w));
  return {
    szoveg: `${hely.intro(pct, n)} ${hely.kerdes(fe)}`,
    mezok: [mezo],
    tippek: [
      'Mi az, amiről a kérdés szól – és mennyi annak az esélye egy-egy kísérletnél?',
      `A megadott ${pct} % a másik eseményé; a kérdezetté ennek komplementere: p = 1 − ${p4(pa)} = ${p4(p)}.`,
      `Binomiális eloszlás: n = ${n}, p = ${p4(p)}; a kért tartomány: ${tartJel(fe.a, fe.b, n)}.`,
    ],
    megoldas: [
      `A kitüntetett az, amiről a kérdés szól: ${hely.egy}. Esélye egy-egy kísérletnél p = 1 − ${p4(pa)} = ${p4(p)}.`,
      `Binomiális eloszlás: n = ${n}, p = ${p4(p)}. A kérdés: „${fe.szoveg}” → ${tartJel(fe.a, fe.b, n)}.`,
      `P(${tartJel(fe.a, fe.b, n)}) = <strong>${p4(fe.P)}</strong>.`,
    ],
    magyarazat: [
      `A megadott ${pct} % nem azé az eseményé, amelyről a kérdés szól. A kérdés a(z) ${hely.egy} darabszámára vonatkozik, ezért ennek az esélyét kell használni.`,
      `Egy-egy kísérletnél a másik esemény esélye ${p4(pa)}, a kérdezetté ennek komplementere: 1 − ${p4(pa)} = ${p4(p)}. A kísérletek függetlenek, tehát binomiális eloszlással számolunk: n = ${n}, p = ${p4(p)}.`,
      `A kérdés: „${fe.szoveg}” → ${tartJel(fe.a, fe.b, n)}. ${fe.kulcs === 'pontosan' ? '' : felteletUzenet(fe.kulcs, fe.k, n) + ' '}A kért oszlopok összege ${p4(fe.P)}.`,
      `Képzelje el, hogy 100 ilyen mintát veszünk: kb. ${f(100 * fe.P, 1)} esetben teljesül a feltétel.`,
      `Józan ésszel: a várható darabszám n · p = ${n} · ${p4(p)} = ${f(el.mu, 4)}; ha p-nek a ${p4(pa)} értéket használnánk, a másik esemény darabszámát számolnánk ki, nem a kérdezettet.`,
    ],
    abraMegoldas: abraDiszkret(el, fe.a, fe.b, { felre: fe.felre, felirat: `P(${tartJel(fe.a, fe.b, n)}) = ${p4(fe.P)}` }),
    geogebra: ggDiszkret(el, fe.a, fe.b),
    jegyezze: 'A kitüntetett az, amiről a kérdés szól. Ha a másik esemény aránya adott, a kérdezetté 1 − p (fiú 0,45 → lány 1 − 0,45 = 0,55).',
  };
}

// =====================================================================
// M9 – összehasonlítás: visszatevéssel és nélküle
// =====================================================================
function M9(rng) {
  const h = probal(() => {
    const nagy = rng() < 0.5;
    const N = nagy ? valaszt(rng, [100, 150, 200]) : valaszt(rng, [20, 25, 30, 40]);
    const arany = valaszt(rng, [0.2, 0.24, 0.25, 0.3]);
    const M = Math.round(N * arany);
    const n = egesz(rng, 5, 9);
    const hipe = hiperEl(N, M, n);
    const bin = binomEl(n, M / N);
    const k = egesz(rng, 1, Math.min(n, M));
    const h1 = hipe.pmf(k), b1 = bin.pmf(k);
    if (h1 < 0.03 || Math.abs(h1 - b1) < 0.0006) return null;
    return { N, M, n, k, hipe, bin, h1, b1, nagy };
  });
  const { N, M, n, k, hipe, bin, h1, b1 } = h;
  const p = M / N;
  const opciok = [
    { szoveg: 'ha a sokaság sokkal nagyobb a mintánál', helyes: true },
    { szoveg: 'ha a minta a sokaság jelentős része', helyes: false, uzenet: 'Éppen fordítva: kis sokaságnál a kihúzott elem sokat változtat az arányon, ezért nagyobb a különbség.', ellenproba: `Ellenpróba: ${N} elemű sokaságból egy borítékot kihúzva az arány ${p4(p)} helyett ${p4((M - 1) / (N - 1))} vagy ${p4(M / (N - 1))} lesz; minél nagyobb a sokaság, annál kisebb ez a változás, tehát nagy sokaságnál kisebb a különbség a két módszer között.` },
    { szoveg: 'mindig ugyanakkora a különbség', helyes: false, uzenet: 'A különbség a sokaság méretétől függ: minél nagyobb a sokaság, annál kisebb.', ellenproba: `Ellenpróba: ennél a feladatnál a két érték ${p4(h1)} és ${p4(b1)}, a különbség ${p4(Math.abs(h1 - b1))}; ugyanennyi arány mellett ${N < 100 ? N * 5 : Math.round(N / 5)} elemű sokaságnál ez a különbség ${N < 100 ? 'kisebb' : 'nagyobb'} lenne.` },
  ];
  return {
    szoveg: `Egy dobozban ${N} boríték van, ebből ${M} nyerő. Kihúzunk ${n} borítékot. Mennyi a valószínűsége, hogy pontosan ${k} nyerő van köztük, ha (a) nem tesszük vissza a kihúzott borítékot, (b) minden húzás után visszatesszük? Utána válaszoljon: mikor lesz a két érték közelebb egymáshoz?`,
    mezok: [
      pMezo({
        id: 'a', cimke: '(a) visszatevés nélkül', el: hipe, a: k, b: k, helyes: h1,
        hibak: [{ ertek: b1, uzenet: 'Ez a visszatevéses (binomiális) érték. Visszatevés nélkül ismert a sokaság → hipergeometrikus.' }],
      }),
      pMezo({
        id: 'b', cimke: '(b) visszatevéssel', el: bin, a: k, b: k, helyes: b1,
        hibak: [{ ertek: h1, uzenet: `Ez a visszatevés nélküli (hipergeometrikus) érték. Visszatevéssel minden húzásnál ugyanannyi boríték van, az esély állandó: ${M}/${N} = ${p4(p)} → binomiális.` }],
      }),
      valasztoMezo({ id: 'kozelebb', cimke: 'Mikor lesz a két érték közelebb egymáshoz?', opciok }),
    ],
    tippek: [
      'Melyik esetben változik az arány húzásról húzásra, és melyikben marad ugyanaz?',
      `(a) hipergeometrikus: N = ${N}, M = ${M}, n = ${n}; (b) binomiális: n = ${n}, p = ${M}/${N}. Mindkettőnél X = ${k}.`,
      `(a) ${p4(h1)}, (b) ${p4(b1)} körüli érték – a különbségük ${p4(Math.abs(h1 - b1))}.`,
    ],
    megoldas: [
      `(a) Hipergeometrikus: P(X = ${k}) = C(${M}, ${k}) · C(${N - M}, ${n - k}) / C(${N}, ${n}) = <strong>${p4(h1)}</strong>.`,
      `(b) Binomiális: p = ${M}/${N} = ${p4(p)}, P(X = ${k}) = C(${n}, ${k}) · ${p4(p)}^${k} · ${p4(1 - p)}^${n - k} = <strong>${p4(b1)}</strong>.`,
      `A különbség: ${p4(Math.abs(h1 - b1))}. Ha a sokaság sokkal nagyobb a mintánál (N ≫ n), a visszatevés nélküli és a visszatevéses húzás gyakorlatilag azonos.`,
    ],
    magyarazat: [
      `Ugyanazt a helyzetet két módon számoljuk: visszatevés nélkül (a kihúzott boríték kikerül a dobozból) és visszatevéssel (minden húzás előtt ugyanannyi boríték van).`,
      `Visszatevés nélkül az arány húzásról húzásra változik (${M}/${N}, majd ${M - 1}/${N - 1} vagy ${M}/${N - 1}), ezért hipergeometrikus eloszlással számolunk: ${p4(h1)}. Visszatevéssel az esély végig ${M}/${N} = ${p4(p)}, ezért binomiális: ${p4(b1)}.`,
      `Képzelje el, hogy 100 ilyen húzássorozatot végzünk: visszatevés nélkül kb. ${f(100 * h1, 1)}, visszatevéssel kb. ${f(100 * b1, 1)} esetben lesz pontosan ${k} nyerő.`,
      `Nagy sokaságnál (${N} boríték, csak ${n} húzás) a kihúzott borítékok alig változtatják meg az arányt, ezért a két érték közel van egymáshoz; kis sokaságnál nagyobb a különbség.`,
      `Józan ésszel: a két valószínűség ${p4(h1)} és ${p4(b1)}, a különbségük ${p4(Math.abs(h1 - b1))}; ${N >= 100 ? 'a nagy sokaság miatt kicsi' : 'a kis sokaság miatt jól látható'}.`,
    ],
    abraMegoldas: eloszlasAbra({
      ertekek: Array.from({ length: n + 1 }, (_, i) => ({ x: i, p: hipe.pmf(i) })), diszkret: true, kiemelt: [k],
      felirat: `visszatevés nélkül: P(X = ${k}) = ${p4(h1)}`, jelmagyarazat: [{ osztaly: 'kiemelt', szoveg: 'kért oszlop' }],
      leiras: `A visszatevés nélküli (hipergeometrikus) eloszlás oszlopdiagramja; a kért oszlop kiszínezve (X = ${k}).`,
    }),
    geogebra: {
      bevezeto: 'A GeoGebra Valószínűség-számítás nézetében két eloszlást is beállíthat (tizedesponttal!):',
      sorok: [ggDiszkret(hipe, k, k).sorok[0], ggDiszkret(bin, k, k).sorok[0]],
      megjegyzes: GG_LEPESEK,
    },
    jegyezze: 'Visszatevés nélkül hipergeometrikus, visszatevéssel binomiális. Ha a sokaság sokkal nagyobb a mintánál (N ≫ n), a két érték szinte azonos.',
  };
}

// =====================================================================
// Kidolgozott példák (SPEC 5.8, ellenőrzött értékek)
// =====================================================================
const kartyaEl = hiperEl(32, 4, 8), pirosEl = hiperEl(32, 8, 8);
const abraKartya = () => abraDiszkret(kartyaEl, 2, 2, { felirat: 'P(X = 2) = 0,2149' });
const abraPiros = () => abraDiszkret(pirosEl, 3, 8, { felirat: 'P(X ≥ 3) = 0,3085' });

export default {
  id: 'mintavetel',
  cim: 'Mintavételek és eloszlásuk',
  rovid: 'Hipergeometrikus és binomiális eloszlás: visszatevés nélküli és visszatevéses mintavétel, módusz, várható érték, szórás.',
  kulcskeplet: '<span class="keplet-nagy">Visszatevés nélkül → hipergeometrikus · visszatevéssel → binomiális</span>',
  kulcsMagyarazat: [
    '<strong>Visszatevés nélkül → hipergeometrikus:</strong> N (sokaság), M (kitüntetettek száma – <strong>darab</strong>, nem %), n (minta).',
    '<strong>Visszatevéssel / független kísérletek → binomiális:</strong> n (kísérletek száma), p (a kitüntetett <strong>aránya</strong> egy-egy húzásnál).',
    '<strong>Nagy sokaság, csak az arány ismert</strong> (pl. „nagyon sok alkatrész, 8 % selejtes”) → <strong>binomiálissal becsüljük</strong> a visszatevés nélkülit is.',
  ],
  elmelet: [
    'Visszatevés nélkül egyesével vagy egyszerre húzunk, a kihúzottat nem tesszük vissza – az arányok húzásról húzásra változhatnak. Visszatevéssel mindig ugyanannyi elemből húzunk, minden húzásnál ugyanakkora az esély.',
    'A klasszikus út (kombinációk): P(2 ász a 8 lap között) = C(4,2) · C(28,6) / C(32,8) = 2 260 440 / 10 518 300 = 0,2149 – a GeoGebra ugyanezt adja.',
    'Binomiális képlet: P(X = k) = C(n,k) · pᵏ · (1 − p)ⁿ⁻ᵏ (a „sorrendi szorzó” a C(n,k)).',
    '<strong>Kitüntetett az, amiről a kérdés szól</strong> (piros vagy sárga, fiú vagy lány – lánynál p = 0,55, ha a fiú 0,45).',
    '<strong>Diszkrét eloszlásnál nem mindegy a határ:</strong> „k-nál több” → X ≥ k + 1; „k-nál kevesebb” → X ≤ k − 1; „legalább k” → X ≥ k; „legfeljebb k” → X ≤ k; „van (hibás)” → X ≥ 1.',
    '<strong>Pontjellemzők:</strong> módusz = a legvalószínűbb érték (legmagasabb oszlop); várható érték (μ) – lehet tört (5,5)!; szórás (σ). Hipergeometrikus: μ = n·M/N; binomiális: μ = n·p, σ = √(n·p·(1 − p)).',
    '„A várható értéktől legfeljebb t szórással tér el” → az [μ − tσ; μ + tσ] intervallumba eső <strong>egész</strong> értékek.',
  ],
  peldak: [
    {
      cim: 'Magyar kártya – 8 lap visszatevés nélkül', feladat: 'Egy 32 lapos magyar kártyából visszatevés nélkül kihúzunk 8 lapot. Mennyi a valószínűsége, hogy pontosan 2 ász van köztük? Mennyi a módusz? A pirosakra: mennyi μ, P(X ≥ 3) és az 1 ≤ X ≤ 3 valószínűsége?',
      abra: abraKartya,
      lepesek: [
        'Hipergeometrikus eloszlás: N = 32, M = 4 (ász), n = 8. P(X = 2) = C(4,2) · C(28,6) / C(32,8) = 2 260 440 / 10 518 300 = <strong>0,2149</strong>.',
        'A módusz a legmagasabb oszlop: X = <strong>1</strong> (P = <strong>0,4503</strong>).',
        'Pirosak: N = 32, M = 8, n = 8. μ = 8 · 8 / 32 = <strong>2</strong>. P(X ≥ 3) = 1 − P(X ≤ 2) = <strong>0,3085</strong>.',
        'σ = <strong>1,0776</strong>; az 1 ≤ X ≤ 3 valószínűsége <strong>0,8478</strong>. (A GeoGebrában a „két érték között” gombbal.)',
      ],
    },
    {
      cim: 'Tulipán – hány sárga?', feladat: '30 tulipánhagyma közül 40 % sárga. Kiültetünk 10 hagymát (visszatevés nélkül). P(pontosan 5 sárga)? Piros hagymák: módusz, P(X ≥ 7), μ és P(X ≤ 5). Sárgák: μ, σ és 3 ≤ X ≤ 5.',
      abra: () => abraDiszkret(hiperEl(30, 12, 10), 5, 5, { felirat: 'P(X = 5) = 0,2259' }),
      lepesek: [
        'A sárgák <strong>darabszáma</strong>: 40 % · 30 = <strong>12</strong>, a pirosak 18. (A GeoGebrába darabszámot írunk, nem %-ot.)',
        'Sárga, X = 5: N = 30, M = 12, n = 10 → P = <strong>0,2259</strong>.',
        'Piros (M = 18): a módusz <strong>6</strong>, P(X ≥ 7) = <strong>0,35</strong>; μ = 10 · 18 / 30 = <strong>6</strong>, P(X ≤ 5) = <strong>0,3441</strong>.',
        'Sárga: μ = 10 · 12 / 30 = <strong>4</strong>, σ = <strong>1,2865</strong>; a 3 ≤ X ≤ 5 valószínűsége <strong>0,7647</strong>.',
      ],
    },
    {
      cim: 'Tételhúzás', feladat: '18 tétel van, 14-et tanult meg a hallgató. Hármat húz (visszatevés nélkül). Mennyi a valószínűsége, hogy legalább 2 tételt tud? És ha csak 10-et tanult meg?',
      lepesek: [
        'Hipergeometrikus: N = 18, M = 14, n = 3. „Legalább 2” → X ≥ 2 (a 2 is benne van).',
        'P(X ≥ 2) = P(X = 2) + P(X = 3) = <strong>0,8922</strong>.',
        'Ha csak 10 tételt tanult meg (M = 10): P(X ≥ 2) = <strong>0,5882</strong>.',
      ],
    },
    {
      cim: 'Kártya visszatevéssel', feladat: 'Egy 32 lapos magyar kártyából minden húzás után visszatesszük a lapot. 5 húzásból pontosan 3 piros? 8 húzásból legfeljebb 3 piros? Ász (p = 0,125), 12 húzás: módusz, P(X ≥ 2)? 16 húzás: μ, σ, 0 ≤ X ≤ 4?',
      lepesek: [
        'Binomiális, p = 8/32 = 0,25. 5 húzás, X = 3: P = C(5,3) · 0,25³ · 0,75² = <strong>0,0879</strong>.',
        '8 húzás, <strong>legfeljebb</strong> 3 (0, 1, 2 vagy 3): P(X ≤ 3) = <strong>0,8862</strong>.',
        'Ász: p = 4/32 = 0,125, 12 húzás: a módusz <strong>1</strong> (P = 0,3), P(X ≥ 2) = <strong>0,4533</strong>.',
        '16 húzás, p = 0,125: μ = <strong>2</strong>, σ = <strong>1,3229</strong>; P(0 ≤ X ≤ 4) = <strong>0,9593</strong>.',
      ],
    },
    {
      cim: 'Születés – a kitüntetett cseréje', feladat: 'A gyermek 45 % eséllyel fiú. 4 gyermek: fiú is, lány is (1–3 fiú)? 5 gyermek: több fiú, mint lány? 10 gyermek, a lányok száma: μ és P(X ≥ 6)? 8 gyermek: nincs lány?',
      lepesek: [
        '4 gyermek, p(fiú) = 0,45: 1–3 fiú: <strong>0,8675</strong>. 5 gyermek, „több fiú” → 3–5 fiú: <strong>0,4069</strong>.',
        '<strong>Lányokra</strong> p = 1 − 0,45 = <strong>0,55</strong>. 10 gyermek: μ = <strong>5,5</strong> (lehet tört!), P(X ≥ 6) = <strong>0,5044</strong>.',
        '8 gyermek, nincs lány (X = 0): <strong>0,0017</strong>.',
      ],
    },
    {
      cim: 'Boríték – visszatevéssel és nélküle', feladat: '100 borítékból 24 nyerő, 8-at húzunk. Mennyi a valószínűsége, hogy pontosan 2 nyerő van köztük visszatevés nélkül és visszatevéssel? És 25 borítéknál (6 nyerő)?',
      lepesek: [
        'Visszatevés nélkül (hipergeometrikus, N = 100, M = 24): <strong>0,3242</strong>. Visszatevéssel (binomiális, p = 24/100 = 0,24): <strong>0,3108</strong>.',
        'A két érték szinte azonos, mert a sokaság (100) sokkal nagyobb a mintánál (8).',
        '25 borítéknál (M = 6) visszatevés nélkül <strong>0,3763</strong> – már nagyobb az eltérés, mert kicsi a sokaság.',
      ],
    },
    {
      cim: 'Selejt – nagy sokaság, csak az arány ismert', feladat: 'Egy nagy tételben 8 % a selejt. 20 darabból van-e hibás? 15 darabból legfeljebb 1? 10 darabból módusz? 25 darabból μ, σ és 0 ≤ X ≤ 4?',
      lepesek: [
        'A sokaság mérete nem ismert, csak az arány → binomiális, p = 0,08.',
        '20 darab: van hibás → X ≥ 1 → 1 − P(X = 0) = <strong>0,8113</strong>. 15 darab: P(X ≤ 1) = <strong>0,6597</strong>.',
        '10 darab: módusz <strong>0</strong> (P = <strong>0,4344</strong>). 25 darab: μ = <strong>2</strong>, σ = <strong>1,3565</strong>; P(0 ≤ X ≤ 4) = <strong>0,9549</strong>.',
      ],
    },
  ],
  tipusok: [
    { id: 'M1', nev: 'Melyik eloszlás? (választós)', general: M1, tesztbe: false },
    { id: 'M2', nev: 'Hipergeometrikus – pontos érték', general: M2 },
    { id: 'M3', nev: 'Hipergeometrikus – intervallum (több mint, legalább…)', general: M3 },
    { id: 'M4', nev: 'Módusz és valószínűsége', general: M4 },
    { id: 'M5', nev: 'Várható érték és szórás', general: M5 },
    { id: 'M6', nev: 'Legfeljebb t szórással tér el', general: M6 },
    { id: 'M7', nev: 'Binomiális – pontos érték és intervallum', general: M7 },
    { id: 'M8', nev: 'Kitüntetett csere (fiú → lány)', general: M8 },
    { id: 'M9', nev: 'Visszatevéssel és nélküle – összehasonlítás', general: M9 },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva. */
  peldaEllenorzes() {
    const k4 = (x) => kerekit(x, 4);
    const hp = (N, M, n, k) => k4(E.hiperPmf(N, M, n, k));
    const hc = (N, M, n, a, b) => k4(E.hiperTartomany(N, M, n, a, b));
    const bc = (n, p, a, b) => k4(E.binomTartomany(n, p, a, b));
    return [
      { nev: '1. példa: 2 ász', kapott: hp(32, 4, 8, 2), vart: 0.2149 },
      { nev: '1. példa: módusz valószínűsége', kapott: hp(32, 4, 8, 1), vart: 0.4503 },
      { nev: '1. példa: piros μ', kapott: E.hiperVarhato(32, 8, 8), vart: 2 },
      { nev: '1. példa: piros X ≥ 3', kapott: hc(32, 8, 8, 3, 8), vart: 0.3085 },
      { nev: '1. példa: σ', kapott: k4(E.hiperSzoras(32, 8, 8)), vart: 1.0776 },
      { nev: '1. példa: 1 ≤ X ≤ 3', kapott: hc(32, 8, 8, 1, 3), vart: 0.8478 },
      { nev: '2. példa: 5 sárga', kapott: hp(30, 12, 10, 5), vart: 0.2259 },
      { nev: '2. példa: piros X ≥ 7', kapott: hc(30, 18, 10, 7, 10), vart: 0.35 },
      { nev: '2. példa: piros X ≤ 5', kapott: hc(30, 18, 10, 0, 5), vart: 0.3441 },
      { nev: '2. példa: sárga σ', kapott: k4(E.hiperSzoras(30, 12, 10)), vart: 1.2865 },
      { nev: '2. példa: sárga 3–5', kapott: hc(30, 12, 10, 3, 5), vart: 0.7647 },
      { nev: '3. példa: legalább 2', kapott: hc(18, 14, 3, 2, 3), vart: 0.8922 },
      { nev: '3. példa: 10 megtanult', kapott: hc(18, 10, 3, 2, 3), vart: 0.5882 },
      { nev: '4. példa: 3 piros', kapott: k4(E.binomPmf(5, 0.25, 3)), vart: 0.0879 },
      { nev: '4. példa: legfeljebb 3', kapott: bc(8, 0.25, 0, 3), vart: 0.8862 },
      { nev: '4. példa: ász X ≥ 2', kapott: bc(12, 0.125, 2, 12), vart: 0.4533 },
      { nev: '4. példa: σ', kapott: k4(E.binomSzoras(16, 0.125)), vart: 1.3229 },
      { nev: '4. példa: 0–4', kapott: bc(16, 0.125, 0, 4), vart: 0.9593 },
      { nev: '5. példa: 1–3 fiú', kapott: bc(4, 0.45, 1, 3), vart: 0.8675 },
      { nev: '5. példa: 3–5 fiú', kapott: bc(5, 0.45, 3, 5), vart: 0.4069 },
      { nev: '5. példa: lány μ', kapott: E.binomVarhato(10, 0.55), vart: 5.5 },
      { nev: '5. példa: lány X ≥ 6', kapott: bc(10, 0.55, 6, 10), vart: 0.5044 },
      { nev: '5. példa: nincs lány', kapott: k4(E.binomPmf(8, 0.55, 0)), vart: 0.0017 },
      { nev: '6. példa: visszatevés nélkül', kapott: hp(100, 24, 8, 2), vart: 0.3242 },
      { nev: '6. példa: visszatevéssel', kapott: k4(E.binomPmf(8, 0.24, 2)), vart: 0.3108 },
      { nev: '6. példa: 25 boríték', kapott: hp(25, 6, 8, 2), vart: 0.3763 },
      { nev: '7. példa: van hibás', kapott: bc(20, 0.08, 1, 20), vart: 0.8113 },
      { nev: '7. példa: legfeljebb 1', kapott: bc(15, 0.08, 0, 1), vart: 0.6597 },
      { nev: '7. példa: módusz', kapott: k4(E.binomPmf(10, 0.08, 0)), vart: 0.4344 },
      { nev: '7. példa: σ', kapott: k4(E.binomSzoras(25, 0.08)), vart: 1.3565 },
      { nev: '7. példa: 0–4', kapott: bc(25, 0.08, 0, 4), vart: 0.9549 },
    ];
  },
};
