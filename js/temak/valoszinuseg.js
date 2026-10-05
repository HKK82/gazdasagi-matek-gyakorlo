// 7. téma – Klasszikus valószínűség, valószínűségi változó (v4)
import { egesz, valaszt } from '../lib/rng.js';
import { kerekit } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { eloszlasAbra } from '../lib/abra.js';
import { probal, f, tisztit } from './seged.js';

// ---- Tiszta számolófüggvények (a példák és a tesztek is ezt használják) ----
export const vsz = (kedvezo, osszes) => kedvezo / osszes;
/** Várható érték: M(X) = Σ xᵢ · pᵢ */
export const varhato = (xs, ps) => xs.reduce((o, x, i) => o + x * ps[i], 0);
/** Szórás: D(X) = √(Σ xᵢ² · pᵢ − M²) */
export const szoras = (xs, ps) => Math.sqrt(xs.reduce((o, x, i) => o + x * x * ps[i], 0) - varhato(xs, ps) ** 2);
/** Két kocka összegének kedvező esetei (a 36 közül). */
export const kockaOsszeg = (s) => 6 - Math.abs(s - 7);
/** Módusz: a legvalószínűbb érték. */
export const modusz = (xs, ps) => xs[ps.indexOf(Math.max(...ps))];

const p4 = (x) => f(x, 4);
const eur = (x) => `${x < 0 ? '−' : ''}${f(Math.abs(x))} €`;
const eurElojel = (x) => `${x < 0 ? '−' : '+'}${f(Math.abs(x))} €`;

/**
 * Valószínűség-mező: a közös tipikus hibákkal (százalék alakban, 1 fölötti érték) és a „100 kísérlet”
 * szemléltetésű ellenpróbával. A tört alak (3/5, 1/16) az ellenőrzőben elfogadott.
 */
function valMezo({ id, cimke, helyes, hibak = [], esemeny, szamitas }) {
  return szamMezo({
    id, cimke: `${cimke} (tizedes tört vagy tört alak)`, helyes, tizedes: 4,
    ellenproba: (w) => (w > 1
      ? `Ellenpróba: ha a valószínűség ${p4(w)} lenne, 100 kísérletből ${f(100 * w, 1)}-szor következne be az esemény – ez nem lehet, mert legfeljebb 100-szor következhet be.`
      : `Ellenpróba: ha ${esemeny} valószínűsége ${p4(w)} lenne, 100 kísérletből kb. ${f(100 * w, 1)}-szor következne be; a ${szamitas} = ${p4(helyes)} alapján viszont kb. ${f(100 * helyes, 1)}-szor.`),
    hibak: [
      ...hibak,
      { ertek: helyes * 100, tures: Math.max(0.01, helyes * 2), uzenet: `A valószínűség 0 és 1 közötti szám (legfeljebb 1), nem százalék: ${f(helyes * 100, 2)} % → ${p4(helyes)}.` },
    ],
  });
}

const MAGYAR_KARTYA = [
  { sz: 'ász', db: 4, leiras: 'az ászok: 4 szín × 1' },
  { sz: 'piros színű', db: 8, leiras: 'a piros színből 8 lap van' },
  { sz: 'piros ász', db: 1, leiras: 'egyetlen piros ász van' },
  { sz: 'figurás lap (alsó, felső, király vagy ász)', db: 16, leiras: '4 színben 4 figura' },
];

// =====================================================================
// V1 – klasszikus valószínűség
// =====================================================================
function V1(rng) {
  const sablon = valaszt(rng, ['pakli', 'kocka', 'kartya']);
  let szoveg, kedvezo, osszes, esemeny, magy, tipp1;
  if (sablon === 'pakli') {
    osszes = egesz(rng, 4, 20); kedvezo = egesz(rng, 1, osszes - 1);
    szoveg = `Egy ${osszes} lapos pakliban ${kedvezo} nyerő lap van. Egy lapot húzunk. Mennyi a valószínűsége, hogy nyerőt húzunk?`;
    esemeny = 'a nyerő lap húzásának'; tipp1 = `Hány lapot húzhatunk összesen, és ezek közül hány a kedvező (nyerő)?`;
    magy = `Az ${osszes} lapból ${kedvezo} nyerő; mindegyik lap húzása egyformán valószínű.`;
  } else if (sablon === 'kocka') {
    const s = egesz(rng, 2, 12);
    kedvezo = kockaOsszeg(s); osszes = 36;
    szoveg = `Két kockával dobunk. Mennyi a valószínűsége, hogy az összeg ${s}?`;
    esemeny = `a(z) ${s} összegű dobásnak`; tipp1 = `Mi az elemi esemény két kockánál – és hány egyformán valószínű dobáspár van? Hány ad ${s} összeget?`;
    magy = `Két kockánál az elemi esemény a dobás<strong>pár</strong> (az első és a második kocka értéke): 6 · 6 = 36 egyformán valószínű pár van. A ${s} összeget ${kedvezo} pár adja.`;
  } else {
    const k = valaszt(rng, MAGYAR_KARTYA);
    kedvezo = k.db; osszes = 32;
    szoveg = `Egy 32 lapos magyar kártyából egy lapot húzunk. Mennyi a valószínűsége, hogy ${k.sz} lesz? (4 szín × 8 figura: VII, VIII, IX, X, alsó, felső, király, ász.)`;
    esemeny = `a(z) ${k.sz} húzásának`; tipp1 = 'Hány lap van összesen, és ezek közül hány a kedvező?';
    magy = `A paklit 32 lap alkotja (4 szín × 8 figura), mindegyik húzása egyformán valószínű. Kedvező lap: ${kedvezo} (${k.leiras}).`;
  }
  const p = vsz(kedvezo, osszes);
  return {
    szoveg,
    mezok: [valMezo({
      cimke: 'Valószínűség', helyes: p, esemeny, szamitas: `${kedvezo} : ${osszes}`,
      hibak: [
        { ertek: kedvezo / (osszes - kedvezo), uzenet: 'A nem kedvező esetekhez viszonyított (kedvező : nem kedvező). Kedvező per összes: az összesbe a kedvezők is beleszámítanak.' },
        { ertek: osszes / kedvezo, uzenet: 'A valószínűség legfeljebb 1: a törtben a kedvező van felül, az összes alul (kedvező : összes).' },
      ],
    })],
    tippek: [
      tipp1,
      'A klasszikus valószínűség: P(A) = kedvező : összes, ha minden elemi esemény egyformán valószínű.',
      `P = ${kedvezo} : ${osszes}.`,
    ],
    megoldas: [
      `Összes (egyformán valószínű) eset: ${osszes}; kedvező eset: ${kedvezo}.`,
      `P = kedvező : összes = ${kedvezo} : ${osszes} = <strong>${p4(p)}</strong> (tört alakban ${kedvezo}/${osszes}).`,
    ],
    magyarazat: [
      `Azt keressük, mekkora eséllyel következik be az esemény. Először meg kell számolni, hány egyformán valószínű eset lehetséges összesen, és ezek közül hány kedvező. ${magy}`,
      `A valószínűség a kedvező és az összes esetek hányadosa: ${kedvezo} : ${osszes} = ${p4(p)}. Osztunk, mert azt kérdezzük, hányad része a kedvező az összesnek; az összesben a kedvezők is benne vannak, ezért az összes kerül a nevezőbe.`,
      `Képzelje el, hogy a kísérletet 100-szor megismételjük: kb. ${f(100 * p, 1)}-szor következik be az esemény. A valószínűség ennek a százada (a relatív gyakoriság e körül ingadozik).`,
      `Józan ésszel: a valószínűség mindig 0 és 1 között van. Itt ${p4(p)} ${p < 0.5 ? 'kicsit kevesebb, mint egy fél – ritkábban, mint minden második esetben' : 'legalább egy fél – legalább minden második esetben'}. Ellenpróba: ${p4(p)} · ${osszes} = ${f(p * osszes, 2)} = a kedvező esetek száma ✓.`,
    ],
    jegyezze: 'Klasszikus valószínűség: P(A) = kedvező : összes (egyformán valószínű esetek), mindig 0 ≤ P ≤ 1. A kedvező az összesből vett rész, nem a nem kedvezőkhöz viszonyítunk.',
  };
}

// =====================================================================
// V2 – komplementer
// =====================================================================
function V2(rng) {
  const sablon = valaszt(rng, ['erme', 'ellentett', 'kocka', 'pakli', 'kartya']);
  let szoveg, p, rossz, esemeny, szam, tipp1, magyarazat;
  if (sablon === 'erme') {
    const n = egesz(rng, 2, 4);
    const mind = 0.5 ** n;
    p = 1 - mind; rossz = mind;
    szoveg = `${n} érmét dobunk fel. Mennyi a valószínűsége, hogy van köztük írás?`;
    esemeny = 'az „van köztük írás” esemény'; szam = `1 − (1/2)${'⁰¹²³⁴'[n]}`;
    tipp1 = `Mi az „van köztük írás” ellentéte (komplementere)? Mennyi annak a valószínűsége?`;
    magyarazat = `A „van köztük írás” ellentéte az „egyik sem írás”, vagyis mind a(z) ${n} fej. Ennek valószínűsége 1/2 · … · 1/2 = ${p4(mind)} (${n} független dobás). A komplementer minden más: ${p4(1)} − ${p4(mind)} = ${p4(p)}.`;
  } else if (sablon === 'ellentett') {
    const pa = egesz(rng, 1, 19) * 0.05;
    const q = tisztit(pa);
    p = tisztit(1 - q); rossz = q;
    szoveg = `Egy esemény valószínűsége ${f(q, 2)}. Mennyi az ellentétének (komplementerének) valószínűsége?`;
    esemeny = 'az ellentett esemény'; szam = `1 − ${f(q, 2)}`;
    tipp1 = 'Mennyi a két esemény (az esemény és az ellentéte) valószínűségének összege?';
    magyarazat = `Az esemény és az ellentéte együtt minden lehetőséget lefed, és nem fedik át egymást, ezért a valószínűségük összege 1. Így az ellentéte: 1 − ${f(q, 2)} = ${f(p, 2)}.`;
  } else if (sablon === 'pakli') {
    const n = egesz(rng, 4, 20), k = egesz(rng, 1, n - 1);
    p = (n - k) / n; rossz = k / n;
    szoveg = `Egy ${n} lapos pakliban ${k} nyerő lap van. Egy lapot húzunk. Mennyi a valószínűsége, hogy nem nyerőt húzunk?`;
    esemeny = 'a nem nyerő lap húzásának'; szam = `1 − ${k}/${n}`;
    tipp1 = 'Mi a „nem nyerő” ellentéte? Mennyi annak a valószínűsége, és hogyan jön ki ebből a kérdezett?';
    magyarazat = `A „nem nyerő” ellentéte a „nyerő”: ${k} : ${n} = ${p4(rossz)}. A komplementer minden más lap: 1 − ${p4(rossz)} = ${p4(p)}. (Közvetlenül is megkapható: ${n - k} vesztő lap : ${n} lap.)`;
  } else if (sablon === 'kartya') {
    const k = valaszt(rng, MAGYAR_KARTYA);
    p = 1 - k.db / 32; rossz = k.db / 32;
    szoveg = `Egy 32 lapos magyar kártyából egy lapot húzunk. Mennyi a valószínűsége, hogy nem ${k.sz.replace(' színű', '')} lesz?`;
    esemeny = `a „nem ${k.sz.replace(' színű', '')}” esemény`; szam = `1 − ${k.db}/32`;
    tipp1 = `Mi a „nem ${k.sz.replace(' színű', '')}” ellentéte? Hány lap tartozik hozzá a 32 lap közül?`;
    magyarazat = `Az ellentét az, hogy ${k.sz.replace(' színű', '')} lesz: ${k.db} lap a 32 lap közül, ${k.db} : 32 = ${p4(rossz)}. A komplementer minden más lap: 1 − ${p4(rossz)} = ${p4(p)}.`;
  } else {
    const s = egesz(rng, 1, 6);
    p = 35 / 36; rossz = 1 / 36;
    szoveg = `Két kockával dobunk. Mennyi a valószínűsége, hogy nem mindkét kockán ${s} lesz?`;
    esemeny = `a „nem mindkettő ${s}” esemény`; szam = '1 − 1/36';
    tipp1 = `Mi a „nem mindkettő ${s}” ellentéte? Mennyi annak a valószínűsége?`;
    magyarazat = `Az ellentét az, hogy mindkét kockán ${s} van: ez 1 dobáspár a 36 közül, 1/36 = ${p4(1 / 36)}. A „nem mindkettő” minden más eset: 1 − 1/36 = ${p4(p)}.`;
  }
  return {
    szoveg,
    mezok: [valMezo({
      cimke: 'Valószínűség', helyes: p, esemeny, szamitas: szam,
      hibak: [{ ertek: rossz, uzenet: 'Ez nem a komplementer, hanem a „fordított” (vagy az ellentét) esemény valószínűsége. A komplementer minden más: P(Ā) = 1 − P(A) – pl. mindkét fej ellentéte: van köztük írás, nem a mindkettő írás.' }],
    })],
    tippek: [
      tipp1,
      'Komplementer: P(Ā) = 1 − P(A). Az „ellentéte” minden más eset.',
      `P = ${szam} = ${p4(p)}.`,
    ],
    megoldas: [
      'Az esemény és a komplementere együtt a teljes esemény: P(A) + P(Ā) = 1.',
      `P = ${szam} = <strong>${p4(p)}</strong>.`,
    ],
    magyarazat: [
      'Azt keressük, mekkora eséllyel következik be az, amit kérdeznek – de ezt egyszerűbb az ellentétén keresztül kiszámolni.',
      magyarazat,
      `Képzelje el, hogy 100-szor megismételjük a kísérletet: az ellentét kb. ${f(100 * rossz, 1)}-szor következik be, tehát az esemény kb. ${f(100 * p, 1)}-szor.`,
      `Józan ésszel: a két valószínűség összege 1 (${p4(p)} + ${p4(rossz)} = ${p4(p + rossz)}), és az esemény ${p > 0.5 ? 'valószínűbb, mint az ellentéte' : 'ritkább, mint az ellentéte'}. Nem a „fordított” eseményt (${p4(rossz)}) kérdezik.`,
    ],
    jegyezze: 'Komplementer: P(Ā) = 1 − P(A). Az ellentét minden más eset („mindkettő fej” ellentéte: van köztük írás).',
  };
}

// =====================================================================
// V3 – független események együtt
// =====================================================================
function V3(rng) {
  const sablon = valaszt(rng, ['kocka', 'kupac', 'visszatevessel']);
  let szoveg, p1, p2, esemeny, szam, magy;
  if (sablon === 'kocka') {
    const a = egesz(rng, 1, 6), b = egesz(rng, 1, 6);
    p1 = 1 / 6; p2 = 1 / 6;
    szoveg = `Két kockával dobunk. Mennyi a valószínűsége, hogy az elsőn ${a}, a másodikon ${b} lesz?`;
    esemeny = 'a két adott szám együttes dobásának'; szam = '1/6 · 1/6';
    magy = `Az első kockán az adott szám (${a}) 1/6 eséllyel jön ki, a másodikon (${b}) is 1/6 eséllyel.`;
  } else if (sablon === 'kupac') {
    const n1 = egesz(rng, 8, 20), a1 = egesz(rng, 1, n1 - 1), n2 = egesz(rng, 8, 20), a2 = egesz(rng, 1, n2 - 1);
    p1 = a1 / n1; p2 = a2 / n2;
    szoveg = `Két kupacban magyar kártya lapok vannak: az elsőben ${n1} lap, ebből ${a1} piros; a másodikban ${n2} lap, ebből ${a2} piros. Mindkét kupacból húzunk egy lapot. Mennyi a valószínűsége, hogy mindkettő piros?`;
    esemeny = 'a két piros lap együttes húzásának'; szam = `${a1}/${n1} · ${a2}/${n2}`;
    magy = `Az első kupacból ${a1} : ${n1} = ${p4(p1)} az esély pirosra, a másodikból ${a2} : ${n2} = ${p4(p2)}; a két kupac független.`;
  } else {
    const n = egesz(rng, 4, 20), k = egesz(rng, 1, n - 1);
    p1 = k / n; p2 = k / n;
    szoveg = `Egy dobozban ${n} lap van, ebből ${k} nyerő. Kétszer húzunk egymás után, minden húzás után visszatesszük a lapot. Mennyi a valószínűsége, hogy mindkétszer nyerőt húzunk?`;
    esemeny = 'a két egymás utáni nyerő húzásnak'; szam = `${k}/${n} · ${k}/${n}`;
    magy = `Visszatevéssel minden húzásnál ugyanaz a ${n} lap van: nyerőt ${k} : ${n} = ${p4(p1)} eséllyel húzunk, és ez a második húzásnál is ugyanennyi (két külön, egyforma pakli).`;
  }
  const p = p1 * p2;
  return {
    szoveg,
    mezok: [valMezo({
      cimke: 'Valószínűség', helyes: p, esemeny, szamitas: szam,
      hibak: [
        { ertek: p1 + p2, uzenet: 'Összeadás helyett szorozni kell: együtt bekövetkezés, független események → P(A és B) = P(A) · P(B).' },
        { ertek: p1, uzenet: 'Ez csak az első esemény valószínűsége; mindkettő együtt ennél ritkább: szorozni kell a másodikéval is.' },
      ],
    })],
    tippek: [
      'Függetlenek az események? Mit jelent az „és” (mindkettő bekövetkezik) a valószínűségnél?',
      'Független események együtt: P(A és B) = P(A) · P(B). Számolja ki külön-külön a két valószínűséget.',
      `P = ${p4(p1)} · ${p4(p2)}.`,
    ],
    megoldas: [
      `Az első esemény: ${p4(p1)}; a második: ${p4(p2)}; függetlenek.`,
      `P(mindkettő) = ${p4(p1)} · ${p4(p2)} = <strong>${p4(p)}</strong> (törtekkel: ${szam}).`,
    ],
    magyarazat: [
      `Azt keressük, mekkora az esélye, hogy mindkét esemény bekövetkezik. ${magy}`,
      `A két esemény egymástól független, ezért az együttes esély a kettő szorzata: ${p4(p1)} · ${p4(p2)} = ${p4(p)}. Szorzunk, mert a második esemény a kedvező első esetek ${p4(p2)}-részén következik be.`,
      `Képzelje el, hogy 100 próbát végzünk: az első esemény kb. ${f(100 * p1, 1)}-szor következik be, és ezekből kb. ${f(100 * p1 * p2, 2)}-szor jön a második is. Ez ${f(100 * p, 2)} a 100-ból.`,
      `Józan ésszel: az együttes esély kisebb, mint bármelyik külön (${p4(p)} ≤ ${p4(Math.min(p1, p2))}). Összeadásnál ${p4(p1 + p2)} jönne ki – az nem lehet kisebb a külön-külön eseteknél.`,
    ],
    jegyezze: 'Független események együtt: P(A és B) = P(A) · P(B) – szorzunk, nem adunk össze.',
  };
}

// =====================================================================
// V4 – nyeremény-eloszlás (két húzás visszatevéssel)
// =====================================================================
function jatekAdatok(rng) {
  return probal(() => {
    const n = egesz(rng, 4, 12), k = egesz(rng, 1, n - 1), l = n - k;
    const w = egesz(rng, 1, 100), v = egesz(rng, 1, 100);
    const X = [2 * w, w - v, -2 * v];
    if (new Set(X).size < 3 || X.includes(0)) return null;
    const p = k / n;
    return { n, k, l, w, v, X, P: [p * p, 2 * p * (1 - p), (1 - p) * (1 - p)], p };
  });
}

function V4(rng) {
  const { n, k, l, w, v, X, P, p } = jatekAdatok(rng);
  const [x1, x2, x3] = X;
  const [p1, p2, p3] = P;
  const nev = ['mindkét lap nyerő', 'egy nyerő és egy vesztő lap (bármilyen sorrendben)', 'mindkét lap vesztő'];
  const szamit = [`(${k}/${n})²`, `2 · ${k}/${n} · ${l}/${n}`, `(${l}/${n})²`];
  const nyerEllen = (w2, i, mit) => `Ellenpróba: ha ${mit} ${f(w2)} € lenne, az nem egyezik a lapok értékeivel: ${nev[i]} esetén ${i === 0 ? `${eurElojel(w)} + ${eurElojel(w)}` : i === 1 ? `${eurElojel(w)} + (${eurElojel(-v)})` : `${eurElojel(-v)} + (${eurElojel(-v)})`} = ${eur(X[i])}.`;
  return {
    szoveg: `Egy dobozban ${n} lap van: ${k} nyerő (${eurElojel(w)}) és ${l} vesztő (${eurElojel(-v)}). Kétszer húzunk egymás után, minden húzás után visszatesszük a lapot, és a két lap értékét összeadjuk. Töltse ki az eloszlás táblázatát: a három lehetséges nyereményt és valószínűségüket!`,
    tablazat: true,
    mezok: [
      szamMezo({ id: 'x1', cimke: 'Nyeremény, ha mindkét lap nyerő (€)', helyes: x1, tizedes: 0, egyseg: '€', negativ: true, ellenproba: (a) => nyerEllen(a, 0, 'a nyeremény'), hibak: [{ ertek: w, uzenet: 'Ez egy lap értéke; két húzásnál a két lap értékét összeadjuk.' }] }),
      valMezo({ id: 'p1', cimke: 'Ennek valószínűsége', helyes: p1, esemeny: 'a két nyerő lap húzásának', szamitas: szamit[0], hibak: [{ ertek: p, uzenet: 'Ez az egy húzásra vonatkozó valószínűség; mindkét húzásnál nyerni a szorzat: p · p.' }] }),
      szamMezo({ id: 'x2', cimke: 'Nyeremény, ha egy nyerő és egy vesztő lap (€)', helyes: x2, tizedes: 0, egyseg: '€', negativ: true, ellenproba: (a) => nyerEllen(a, 1, 'a nyeremény'), hibak: [{ ertek: w, uzenet: 'A vesztő lap értékét (negatív) is hozzá kell adni.' }] }),
      valMezo({ id: 'p2', cimke: 'Ennek valószínűsége', helyes: p2, esemeny: 'az egy nyerő és egy vesztő lap húzásának', szamitas: szamit[1], hibak: [{ ertek: p * (1 - p), uzenet: 'Két sorrend lehetséges: nyerő-vesztő vagy vesztő-nyerő – ezért kétszer annyi: 2 · p · (1 − p).' }] }),
      szamMezo({ id: 'x3', cimke: 'Nyeremény, ha mindkét lap vesztő (€)', helyes: x3, tizedes: 0, egyseg: '€', negativ: true, ellenproba: (a) => nyerEllen(a, 2, 'a nyeremény'), hibak: [{ ertek: -v, uzenet: 'Ez egy lap értéke; két húzásnál a két lap értékét összeadjuk.' }] }),
      valMezo({ id: 'p3', cimke: 'Ennek valószínűsége', helyes: p3, esemeny: 'a két vesztő lap húzásának', szamitas: szamit[2], hibak: [{ ertek: 1 - p, uzenet: 'Ez az egy húzásra vonatkozó valószínűség; mindkét húzásnál veszíteni a szorzat: (1 − p) · (1 − p).' }] }),
    ],
    tippek: [
      'Hányféle kimenetele lehet két húzásnak, és melyik nyereményt adja? Függetlenek a húzások?',
      `Visszatevéssel a húzások függetlenek, szorzunk: P(nyerő) = ${k}/${n}. A vegyes eset két sorrendben jöhet létre.`,
      `A három valószínűség összege 1 kell legyen: ${p4(p1)} + ${p4(p2)} + ${p4(p3)}.`,
    ],
    megoldas: [
      `Egy húzásnál P(nyerő) = ${k}/${n} = ${p4(p)}, P(vesztő) = ${l}/${n} = ${p4(1 - p)}.`,
      `Két nyerő: ${eurElojel(w)} + ${eurElojel(w)} = <strong>${eur(x1)}</strong>, P = ${p4(p)}² = <strong>${p4(p1)}</strong>.`,
      `Egy nyerő, egy vesztő: ${eurElojel(w)} ${eurElojel(-v)} → <strong>${eur(x2)}</strong>, P = 2 · ${p4(p)} · ${p4(1 - p)} = <strong>${p4(p2)}</strong> (két sorrend).`,
      `Két vesztő: <strong>${eur(x3)}</strong>, P = ${p4(1 - p)}² = <strong>${p4(p3)}</strong>. Összeg: ${p4(p1)} + ${p4(p2)} + ${p4(p3)} = ${p4(p1 + p2 + p3)} ✓.`,
    ],
    magyarazat: [
      `A két húzásnak háromféle eredménye lehet: mindkét lap nyerő, egy nyerő és egy vesztő, mindkét lap vesztő. A nyeremény a két lap értékének összege.`,
      `Visszatevéssel mindkét húzás ugyanabból a ${n} lapból történik, ezért a húzások függetlenek: P(nyerő) = ${k} : ${n} = ${p4(p)}. Két nyerő: ${p4(p)} · ${p4(p)} = ${p4(p1)}; két vesztő: ${p4(1 - p)} · ${p4(1 - p)} = ${p4(p3)}.`,
      `A vegyes eset kétféleképp jöhet ki: elsőre nyerő, másodikra vesztő, vagy fordítva. Mindkettő ${p4(p * (1 - p))}, együtt ${p4(p2)}. Ha csak az egyik sorrendet számolná, hiányozna a fele.`,
      `Képzelje el, hogy 100 játékot játszunk: kb. ${f(100 * p1, 1)}-szor kapunk ${eur(x1)}-t, kb. ${f(100 * p2, 1)}-szor ${eur(x2)}-t, kb. ${f(100 * p3, 1)}-szor ${eur(x3)}-t.`,
      `Józan ésszel: a három valószínűség összege 1 (${p4(p1)} + ${p4(p2)} + ${p4(p3)} = ${p4(p1 + p2 + p3)}), és mindegyik 0 és 1 között van.`,
    ],
    abraMegoldas: eloszlasAbra({ ertekek: X.map((x, i) => ({ x, p: P[i] })), varhato: varhato(X, P), xfelirat: 'nyeremény (€)', leiras: `A nyeremény eloszlása: ${X.map((x, i) => `${x} €: ${p4(P[i])}`).join('; ')}.` }),
    jegyezze: 'Két húzás visszatevéssel: független húzások → szorzunk; a vegyes eset két sorrendben jöhet létre: 2p(1 − p).',
  };
}

// =====================================================================
// V5 – „legfeljebb kétszer húz”
// =====================================================================
function V5(rng) {
  const n = egesz(rng, 4, 20), k = egesz(rng, 1, n - 1), p = k / n;
  const P = [p, (1 - p) * p, (1 - p) * (1 - p)];
  const nev = ['elsőre nyer', 'csak másodikra nyer', 'egyik húzás sem nyerő'];
  const szamit = [`${k}/${n}`, `${n - k}/${n} · ${k}/${n}`, `(${n - k}/${n})²`];
  const ossz = (i, w) => `Ellenpróba: a három eset kimerítő, az összegük 1 kell legyen: ${P.map((x, j) => (j === i ? p4(w) : p4(x))).join(' + ')} = ${p4(P.reduce((o, x, j) => o + (j === i ? w : x), 0))}.`;
  return {
    szoveg: `Frédi legfeljebb kétszer húz egy ${n} lapos pakliból (${k} nyerő lap), a lapot minden húzás után visszateszi. Ha elsőre nyerőt húz, megáll; ha nem, még egyszer húz. Mennyi a valószínűsége, hogy (a) elsőre nyer, (b) csak másodikra nyer, (c) egyik húzása sem nyerő?`,
    mezok: [
      valMezo({ id: 'a', cimke: '(a) elsőre nyer', helyes: P[0], esemeny: 'az elsőre nyerésnek', szamitas: szamit[0] }),
      valMezo({
        id: 'b', cimke: '(b) csak másodikra nyer', helyes: P[1], esemeny: 'a csak másodikra nyerésnek', szamitas: szamit[1],
        hibak: [{ ertek: p, uzenet: 'Másodszor csak akkor húz, ha elsőre vesztett: (1 − p) · p. Ez csak az egy húzásra vonatkozó valószínűség.' }],
      }),
      valMezo({
        id: 'c', cimke: '(c) egyik húzása sem nyerő', helyes: P[2], esemeny: 'az egyik húzás sem nyerő esemény', szamitas: szamit[2],
        hibak: [{ ertek: 1 - p, uzenet: 'Ez az egy húzásra vonatkozó valószínűség; kétszer egymás után vesztésnél szorozni kell: (1 − p)².' }],
      }),
    ].map((m, i) => ({ ...m, ellenproba: (w) => `${m.ellenproba(w)} ${ossz(i, w)}` })),
    tippek: [
      'Mikor húz másodszor? Mi történik elsőre, ha második húzásra sor kerül?',
      `Visszatevéssel a húzások függetlenek. Csak másodikra nyer: elsőre veszít, és másodikra nyer – szorzunk: (1 − p) · p, ahol p = ${k}/${n}.`,
      `A három eset kimerítő: összegük 1 (${nev.join(', ')}).`,
    ],
    megoldas: [
      `p = ${k}/${n} = ${p4(p)} (egy húzásra nyerő), 1 − p = ${p4(1 - p)}.`,
      `(a) elsőre nyer: <strong>${p4(P[0])}</strong>.`,
      `(b) elsőre veszít, másodikra nyer: ${p4(1 - p)} · ${p4(p)} = <strong>${p4(P[1])}</strong>.`,
      `(c) kétszer veszít: ${p4(1 - p)}² = <strong>${p4(P[2])}</strong>. Összeg: ${p4(P[0] + P[1] + P[2])} ✓.`,
    ],
    magyarazat: [
      `Frédi húzása háromféleképp végződhet: elsőre nyer (és megáll), elsőre veszít és másodikra nyer, vagy kétszer veszít. A kérdés ezek valószínűsége.`,
      `Elsőre nyerni egy húzásnyi esély: ${k} : ${n} = ${p4(p)}. A „csak másodikra nyer” esethez két dolog kell: előbb veszít (${p4(1 - p)}), azután nyer (${p4(p)}) – független, tehát szorzunk: ${p4(P[1])}. Ha csak ${p4(p)}-t írna, kihagyná azt a feltételt, hogy másodszor csak vesztés után húz.`,
      `Kétszer vesztésnél a két vesztés egymás után történik: ${p4(1 - p)} · ${p4(1 - p)} = ${p4(P[2])}.`,
      `Képzelje el, hogy 100 játékot játszunk: kb. ${f(100 * P[0], 1)}-szor nyer elsőre, ${f(100 * P[1], 1)}-szor csak másodikra, ${f(100 * P[2], 1)}-szor egyik húzása sem nyerő.`,
      `Józan ésszel: a három eset minden lehetőséget lefed, ezért összegük 1: ${p4(P[0])} + ${p4(P[1])} + ${p4(P[2])} = ${p4(P[0] + P[1] + P[2])}.`,
    ],
    jegyezze: 'Legfeljebb kétszer húz: elsőre p; csak másodikra (1 − p) · p; egyik sem (1 − p)². A három eset összege 1.',
  };
}

// =====================================================================
// V6 – hiányzó valószínűség
// =====================================================================
function V6(rng) {
  return probal(() => {
    const a = egesz(rng, 2, 17), b = egesz(rng, 2, 17);
    if (a + b > 19) return null;
    const p1 = tisztit(a * 0.05), p2 = tisztit(b * 0.05), h = tisztit(1 - p1 - p2);
    if (h < 0.04) return null;
    return {
      szoveg: `Egy játékban három kimenetel lehetséges. Az elsőé ${f(p1, 2)}, a másodiké ${f(p2, 2)} valószínűségű. Mennyi a harmadik kimenetel valószínűsége?`,
      mezok: [szamMezo({
        cimke: 'A harmadik valószínűsége (tizedes tört vagy tört alak)', helyes: h, tizedes: 2,
        ellenproba: (w) => `Ellenpróba: a három valószínűség összege ${f(p1, 2)} + ${f(p2, 2)} + ${f(w, 2)} = ${f(p1 + p2 + w, 2)}, de ennek 1-nek kell lennie.`,
        hibak: [
          { ertek: p1 + p2, uzenet: 'Ez az első kettő összege. A három kimenetel együtt mindent lefed, ezért a maradék: 1 − az első kettő összege.' },
          { ertek: 1 - p1, uzenet: 'Csak az első valószínűségét vonta le. A másodikét is le kell vonni az 1-ből.' },
          { ertek: 1 - p2, uzenet: 'Csak a második valószínűségét vonta le. Az elsőét is le kell vonni az 1-ből.' },
        ],
      })],
      tippek: [
        'Mennyi a három lehetséges kimenetel valószínűségének összege?',
        'A kimenetelek mindent lefednek: p₁ + p₂ + p₃ = 1, tehát a harmadik a maradék.',
        `p₃ = 1 − ${f(p1, 2)} − ${f(p2, 2)}.`,
      ],
      megoldas: [`A három valószínűség összege 1: p₃ = 1 − p₁ − p₂ = 1 − ${f(p1, 2)} − ${f(p2, 2)} = <strong>${f(h, 2)}</strong>.`],
      magyarazat: [
        `Azt keressük, mekkora eséllyel következik be a harmadik kimenetel. A játéknak csak ez a három kimenetele van, tehát valamelyik biztosan bekövetkezik.`,
        `A „biztosan” a 100 %-ot, vagyis az 1-et jelenti: a három valószínűség összege 1. Képzelje el 100 játékot: az elsőből kb. ${f(100 * p1, 1)}, a másodikból kb. ${f(100 * p2, 1)} van, a maradék ${f(100 * h, 1)} a harmadiké.`,
        `Ezért kivonunk az 1-ből: 1 − ${f(p1, 2)} − ${f(p2, 2)} = ${f(h, 2)}. Kivonunk, mert a maradékot keressük.`,
        `Józan ésszel: ${f(p1, 2)} + ${f(p2, 2)} + ${f(h, 2)} = ${f(p1 + p2 + h, 2)}, és mindegyik 0 és 1 között van ✓.`,
      ],
      jegyezze: 'Ha az összes kimenetel valószínűsége adott, az összeg 1: a hiányzó valószínűség = 1 − a többi összege.',
    };
  });
}

// =====================================================================
// Játék három kimenetellel (V7–V9)
// =====================================================================
function jatek(rng, { igazsagos = false } = {}) {
  return probal(() => {
    const a = egesz(rng, 2, 16), b = egesz(rng, 2, 16);
    if (a + b > 19) return null;
    const P = [tisztit(a * 0.05), tisztit(b * 0.05), tisztit(1 - a * 0.05 - b * 0.05)];
    if (P[2] < 0.04) return null;
    const x1 = egesz(rng, 1, 100), x2 = egesz(rng, -100, 100);
    let x3;
    if (igazsagos) {
      const sz = -(x1 * P[0] + x2 * P[1]) / P[2];
      if (Math.abs(sz - Math.round(sz)) > 1e-9 || Math.round(sz) === 0 || Math.abs(sz) > 100) return null;
      x3 = Math.round(sz);
    } else {
      x3 = egesz(rng, -100, 100);
    }
    const X = [x1, x2, x3];
    if (new Set(X).size < 3 || X.includes(0)) return null;
    const M = tisztit(varhato(X, P));
    if ((M === 0) !== igazsagos) return null;
    return { X, P, M };
  });
}
const jatekSzoveg = (X, P, veg) => `Egy játékban három kimenetel lehetséges: ${X.map((x, i) => `${eur(x)}${x < 0 ? ' (veszteség)' : ' nyeremény'} ${f(P[i], 2)} valószínűséggel`).join(', ')}. ${veg}`;

// =====================================================================
// V7 – várható érték
// =====================================================================
function V7(rng) {
  const { X, P, M } = jatek(rng);
  const abs = X.reduce((o, x, i) => o + Math.abs(x) * P[i], 0);
  const atlag = X.reduce((o, x) => o + x, 0) / 3;
  const tagok = X.map((x, i) => `${x < 0 ? '(' : ''}${x < 0 ? '−' : ''}${f(Math.abs(x))}${x < 0 ? ')' : ''} · ${f(P[i], 2)}`);
  return {
    szoveg: jatekSzoveg(X, P, 'Mennyi a játék várható értéke (M(X)), vagyis egy játékra jutó átlagos nyeremény?'),
    mezok: [szamMezo({
      cimke: 'Várható érték M(X) (€, előjellel, két tizedesre)', helyes: M, tizedes: 2, egyseg: '€', elojel: 'elojeles',
      ellenproba: (w) => `Ellenpróba: ha M(X) = ${f(w, 2)} € lenne, 100 játékra átlagosan ${f(100 * w, 1)} € nyereség jutna; a valószínűségekkel súlyozva viszont ${X.map((x, i) => `${f(100 * P[i], 1)} · ${eur(x)}`).join(' + ')} = ${f(100 * M, 1)} €, vagyis játékonként ${f(M, 2)} €.`,
      hibak: [
        { ertek: abs, uzenet: 'A veszteség negatív nyeremény: −60 € azt jelenti, hogy fizetni kell, ezért a szorzat is negatív.' },
        { ertek: atlag, uzenet: 'Ez az értékek átlaga a valószínűségek nélkül. Súlyozni kell a valószínűségekkel: minden értéket a saját valószínűségével szorzunk.' },
      ],
    })],
    tippek: [
      'Mit jelent a várható érték? Hányszor nyer az egyes kimenetelekből, ha sokszor játszik?',
      'Minden nyereményt megszorzunk a saját valószínűségével, és az eredményeket összeadjuk: M(X) = x₁ · p₁ + x₂ · p₂ + x₃ · p₃. A veszteség negatív szám.',
      `M(X) = ${tagok.join(' + ')}.`,
    ],
    megoldas: [
      `M(X) = x₁ · p₁ + x₂ · p₂ + x₃ · p₃ = ${tagok.join(' + ')}.`,
      `= ${X.map((x, i) => f(x * P[i], 2)).join(' + ').replace(/\+ −/g, '− ')} = <strong>${f(M, 2)} €</strong>.`,
      `Értelmezés: ${M > 0 ? 'pozitív, a játék a játékosnak kedvező' : M < 0 ? 'negatív, a játék a játékosnak kedvezőtlen' : 'nulla, a játék igazságos'}.`,
    ],
    magyarazat: [
      'A játék várható értékét keressük, vagyis azt, hogy egy játékra átlagosan mennyi nyeremény jut, ha nagyon sokszor játsszuk.',
      `Képzelje el, hogy 100 játékot játszunk. A valószínűségek szerint kb. ${X.map((x, i) => `${f(100 * P[i], 1)}-szor kapunk ${eur(x)}-t`).join(', ')}. Ez összesen ${X.map((x, i) => `${f(100 * P[i], 1)} · ${eur(x)}`).join(' + ')} = ${f(100 * M, 1)} €.`,
      `Egy játékra jutó átlag ennek a századrésze: ${f(100 * M, 1)} : 100 = ${f(M, 2)} €. Ugyanezt kapjuk, ha minden értéket a saját valószínűségével szorzunk és összeadunk – ezért szorzunk és adunk össze, nem átlagolunk simán.`,
      `A veszteség negatív szám, mert fizetni kell: ${X.filter((x) => x < 0).length ? 'a negatív tagok csökkentik az összeget' : 'itt nincs veszteséges kimenetel'}.`,
      `Józan ésszel: ${M > 0 ? 'a nyereményes kimenetelek súlya nagyobb, ezért pozitív' : M < 0 ? 'a veszteséges kimenetelek súlya nagyobb, ezért negatív' : 'a nyeremények és a veszteségek kiegyenlítik egymást'} az átlag (${f(M, 2)} €); az értékek átlaga valószínűségek nélkül ${f(atlag, 2)} lenne – az hibás.`,
    ],
    abraMegoldas: eloszlasAbra({ ertekek: X.map((x, i) => ({ x, p: P[i] })), varhato: M, xfelirat: 'nyeremény (€)', leiras: `A nyeremény eloszlása és a várható érték: M(X) = ${f(M, 2)} €.` }),
    jegyezze: 'Várható érték: M(X) = x₁p₁ + x₂p₂ + … – súlyozott átlag; > 0 kedvező, < 0 kedvezőtlen, = 0 igazságos. A veszteség negatív.',
  };
}

// =====================================================================
// V8 – kedvező-e? (választós)
// =====================================================================
function V8(rng) {
  const igazsagos = rng() < 0.25;
  const { X, P, M } = jatek(rng, { igazsagos });
  const helyes = M > 0 ? 0 : M < 0 ? 1 : 2;
  const nevek = ['a játékosnak kedvező', 'a játékosnak kedvezőtlen', 'igazságos'];
  const ell = `Ellenpróba: M(X) = ${X.map((x, i) => `${eur(x)} · ${f(P[i], 2)}`).join(' + ')} = ${f(M, 2)} €, ${M > 0 ? 'pozitív' : M < 0 ? 'negatív' : 'nulla'} – tehát a játék ${nevek[helyes]}.`;
  const uz = M > 0 ? 'A várható érték pozitív, vagyis átlagosan nyer a játékos.' : M < 0 ? 'A várható érték negatív, vagyis átlagosan veszít a játékos.' : 'A várható érték nulla, ezért igazságos a játék.';
  return {
    szoveg: jatekSzoveg(X, P, 'Kinek kedvez a játék? (Számolja ki a várható értéket!)'),
    mezok: [valasztoMezo({
      cimke: 'Válasszon!',
      opciok: nevek.map((sz, i) => ({ szoveg: sz, helyes: i === helyes, uzenet: i === helyes ? '' : uz, ellenproba: i === helyes ? '' : ell })),
    })],
    tippek: [
      'Mi dönti el, hogy egy játék kedvező-e? Melyik számot kell kiszámolni?',
      'A várható érték előjele dönt: pozitív → kedvező, negatív → kedvezőtlen, nulla → igazságos.',
    ],
    megoldas: [
      `M(X) = ${X.map((x, i) => `${eur(x)} · ${f(P[i], 2)}`).join(' + ')} = ${f(M, 2)} €.`,
      `${M > 0 ? 'M(X) &gt; 0' : M < 0 ? 'M(X) &lt; 0' : 'M(X) = 0'} → a játék <strong>${nevek[helyes]}</strong>.`,
    ],
    magyarazat: [
      'Azt kérdezik, kinek kedvez a játék. Erre a várható érték, vagyis az egy játékra jutó átlagos nyeremény ad választ.',
      `Képzelje el, hogy 100 játékot játszunk: ${X.map((x, i) => `kb. ${f(100 * P[i], 1)}-szor kapunk ${eur(x)}-t`).join(', ')}. Ez összesen ${f(100 * M, 1)} €.`,
      `Egy játékra ennek századrésze jut: ${f(M, 2)} €. ${M > 0 ? 'Ez pozitív, tehát a játékos átlagosan nyer.' : M < 0 ? 'Ez negatív, tehát a játékos átlagosan veszít.' : 'Ez nulla, tehát sem a játékos, sem a szervező nem nyer átlagosan.'}`,
      `Józan ésszel: ${M > 0 ? 'több a súlyozott nyereség, mint a súlyozott veszteség' : M < 0 ? 'a súlyozott veszteség nagyobb a súlyozott nyereségnél' : 'a súlyozott nyereség és veszteség egyenlő'} – ez egyezik a ${f(M, 2)} € előjelével.`,
    ],
    jegyezze: 'Kedvező-e? A várható érték előjele dönt: M(X) > 0 kedvező, < 0 kedvezőtlen, = 0 igazságos.',
  };
}

// =====================================================================
// V9 – módusz
// =====================================================================
function V9(rng) {
  return probal(() => {
    const { X, P } = jatek(rng);
    const maxP = Math.max(...P);
    if (P.filter((x) => Math.abs(x - maxP) < 1e-9).length !== 1) return null;
    const m = modusz(X, P), maxX = Math.max(...X);
    if (m === maxX) return null;
    return {
      szoveg: `A nyeremény eloszlása: ${X.map((x, i) => `${eur(x)} ${f(P[i], 2)} valószínűséggel`).join(', ')}. Mennyi a nyeremény módusza (a legvalószínűbb érték)?`,
      mezok: [szamMezo({
        cimke: 'A módusz (€)', helyes: m, tizedes: 0, egyseg: '€', negativ: true,
        ellenproba: (w) => `Ellenpróba: ${f(w)} € valószínűsége ${X.includes(w) ? f(P[X.indexOf(w)], 2) : 'nem szerepel a táblázatban'}, a legnagyobb valószínűség viszont ${f(maxP, 2)}, ez a ${eur(m)} értéké.`,
        hibak: [
          { ertek: maxX, uzenet: 'A módusz a legvalószínűbb, nem a legnagyobb érték.' },
          { ertek: maxP, uzenet: 'Ez a legnagyobb valószínűség; a módusz az az érték (nyeremény), amelyhez ez a valószínűség tartozik.' },
        ],
      })],
      tippek: [
        'Mit jelent a „legvalószínűbb”? Melyik számot kell nézni a táblázatban?',
        'A módusz az az érték (nyeremény), amelyiknek a valószínűsége a legnagyobb.',
      ],
      megoldas: [
        `A valószínűségek: ${X.map((x, i) => `${eur(x)}: ${f(P[i], 2)}`).join('; ')}.`,
        `A legnagyobb valószínűség ${f(maxP, 2)}, ez a ${eur(m)} nyereményhez tartozik → módusz: <strong>${eur(m)}</strong>.`,
      ],
      magyarazat: [
        'A módusz a legvalószínűbb érték: az, amelyik a legtöbbször fordul elő, ha sokszor megismételjük a játékot.',
        `Képzelje el, hogy 100 játékot játszunk: ${X.map((x, i) => `kb. ${f(100 * P[i], 1)}-szor kapunk ${eur(x)}-t`).join(', ')}. A legtöbbször a ${eur(m)} fordul elő (${f(100 * maxP, 1)}-szor).`,
        `Ezért a legnagyobb valószínűséghez tartozó értéket választjuk: ${f(maxP, 2)} → ${eur(m)}. Nem a legnagyobb nyereményt (${eur(maxX)}), mert az kisebb valószínűségű, és nem a valószínűséget (${f(maxP, 2)}) magát, mert az nem nyeremény.`,
        `Józan ésszel: a ${eur(m)} valószínűsége (${f(maxP, 2)}) nagyobb a másik kettőénél, tehát valóban ez a leggyakoribb kimenetel.`,
      ],
      abraMegoldas: eloszlasAbra({ ertekek: X.map((x, i) => ({ x, p: P[i] })), xfelirat: 'nyeremény (€)', leiras: `A nyeremény eloszlása; a legmagasabb oszlop a ${m} € értéknél van (módusz).` }),
      jegyezze: 'Módusz: a legvalószínűbb érték – a legnagyobb valószínűséghez tartozó nyeremény, nem a legnagyobb nyeremény.',
    };
  });
}

// =====================================================================
// Kidolgozott példák
// =====================================================================
const P2 = [0.16, 0.48, 0.36], X2 = [20, 6, -8];
const abra2 = () => eloszlasAbra({ ertekek: X2.map((x, i) => ({ x, p: P2[i] })), varhato: varhato(X2, P2), xfelirat: 'nyeremény (€)', leiras: 'A nyeremény eloszlása: 20 € 0,16; 6 € 0,48; −8 € 0,36; M(X) = 3,2 €.' });

export default {
  id: 'valoszinuseg',
  cim: 'Valószínűség, várható érték',
  rovid: 'Klasszikus valószínűség, független események, nyeremény-eloszlás és várható érték.',
  kulcskeplet: '<span class="keplet-nagy">P(A) = kedvező / összes</span>',
  kulcsMagyarazat: [
    'Ha minden elemi esemény egyformán valószínű; mindig <strong>0 ≤ P(A) ≤ 1</strong>.',
    '<strong>Független</strong> események együtt: <strong>P(A és B) = P(A) · P(B)</strong>. <strong>Egymást kizáró</strong> események: <strong>P(A vagy B) = P(A) + P(B)</strong>. <strong>Komplementer:</strong> P(Ā) = 1 − P(A).',
    '<strong>Várható érték:</strong> <strong>M(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ</strong> – egy játékra jutó átlagos nyeremény. &gt; 0: kedvező, &lt; 0: kedvezőtlen, = 0: igazságos.',
  ],
  elmelet: [
    'A valószínűség azt jelenti: nagyon sok, azonos körülmények közti kísérletben a <strong>relatív gyakoriság</strong> (bekövetkezések / kísérletek) e körül ingadozik.',
    '<strong>Elemi esemény</strong> két érménél egy dobás<strong>pár</strong> (ff, fi, if, ii) – mind 1/4.',
    '<strong>Komplementer = „minden más”</strong>: „mindkettő fej” ellentéte <strong>„van köztük írás”</strong>, nem „mindkettő írás”.',
    '<strong>Visszatevéses húzás</strong> = két külön, egyforma pakli → a húzások <strong>függetlenek</strong>, szorzunk.',
    'Ha a lehetséges esetek közül kettőnek megvan a valószínűsége, a harmadik a <strong>maradék</strong> (az összeg 1).',
    '<strong>Módusz</strong> = a legvalószínűbb érték. A <strong>szórás</strong> a várható érték körüli ingadozást méri (egyszer megmutatjuk, nem gyakoroltatjuk).',
    '<strong>Magyar kártya:</strong> 4 szín (piros, tök, zöld, makk) × 8 figura (VII, VIII, IX, X, alsó, felső, király, ász) = 32 lap.',
  ],
  peldak: [
    { cim: 'Két kocka – mindkettő kettes', feladat: 'Két kockával dobunk. Mennyi a valószínűsége, hogy mindkettő kettes?',
      lepesek: ['Az elemi esemény a dobáspár: 6 · 6 = 36 egyformán valószínű pár, ebből 1 kedvező.', 'P = 1/36. Ugyanez szorzással: a két kocka független, 1/6 · 1/6 = <strong>1/36</strong>.'] },
    { cim: 'Nyeremény-eloszlás és várható érték', feladat: 'Egy dobozban 5 lap van: 2 nyerő (+10 €) és 3 vesztő (−4 €). Kétszer húzunk visszatevéssel, a két lap értékét összeadjuk. Mi a nyeremény eloszlása, a módusz és a várható érték?',
      abra: abra2,
      lepesek: [
        'P(nyerő) = 2/5 = 0,4; P(vesztő) = 3/5 = 0,6; a húzások függetlenek.',
        'Két nyerő: 20 €, P = 0,4² = <strong>0,16</strong>. Egy nyerő, egy vesztő: 6 €, P = 2 · 0,4 · 0,6 = <strong>0,48</strong>. Két vesztő: −8 €, P = 0,6² = <strong>0,36</strong>.',
        'Módusz: a legvalószínűbb érték, <strong>6 €</strong> (0,48).',
        'M(X) = 20 · 0,16 + 6 · 0,48 + (−8) · 0,36 = 3,2 + 2,88 − 2,88 = <strong>3,2 €</strong>. 100 játékra kivetítve: 16 · 20 + 48 · 6 − 36 · 8 = 320 € → 3,2 €/játék.',
        'A szórás: D(X) = √(Σ x² · p − M²) = √(94,08) ≈ 9,7 (a várható érték körüli ingadozás).',
      ] },
    { cim: 'Magyar kártya – két kupac', feladat: 'Két kupac magyar kártya: az elsőben 20 lap (2 piros), a másodikban 12 lap (6 piros). Mindkettőből húzunk egy lapot. Fogadás: két piros +100 €, egy piros −10 €, nulla piros −20 €. Kedvező a fogadás?',
      lepesek: ['2 piros: 2/20 · 6/12 = <strong>0,05</strong>; 0 piros: 18/20 · 6/12 = <strong>0,45</strong>; 1 piros: 1 − 0,05 − 0,45 = <strong>0,5</strong>.', 'M(X) = 100 · 0,05 + (−10) · 0,5 + (−20) · 0,45 = 5 − 5 − 9 = <strong>−9 €</strong>.', 'Negatív a várható érték → a fogadás <strong>nem kedvező</strong>.'] },
    { cim: 'Frédi – legfeljebb kétszer húz', feladat: 'Frédi legfeljebb kétszer húz visszatevéssel egy 10 lapos pakliból (3 nyerő). Elsőre nyer: +40 €; csak másodikra: +10 €; egyik sem: −50 €. Kinek kedvez a játék?',
      lepesek: ['Elsőre nyer: <strong>0,3</strong>. Csak másodikra: 0,7 · 0,3 = <strong>0,21</strong>. Egyik sem: 0,7 · 0,7 = <strong>0,49</strong>.', 'M(X) = 40 · 0,3 + 10 · 0,21 − 50 · 0,49 = 12 + 2,1 − 24,5 = <strong>−10,4 €</strong>.', 'Frédinek nem kedvező; Béni (a szervező) átlagosan 10,4 €-t nyer.'] },
    { cim: 'Moodle-gyakorlók', feladat: 'a) Nyeremények 40 / 20 / −60 €, valószínűségek 0,52 / 0,23 / ?. b) 8 lap (2 db +12 €, 6 db −8 €), két húzás. c) 5 lap, 1 nyerő, legfeljebb két húzás (20 / 15 / −25 €).',
      lepesek: ['a) A hiányzó valószínűség: 1 − 0,52 − 0,23 = <strong>0,25</strong>; M = 40 · 0,52 + 20 · 0,23 − 60 · 0,25 = <strong>10,4 €</strong>.', 'b) 24 / 4 / −16 € → 0,0625 / 0,375 / 0,5625; M = 24 · 0,0625 + 4 · 0,375 − 16 · 0,5625 = <strong>−6 €</strong>.', 'c) 20 / 15 / −25 € → 0,2 / 0,16 / 0,64; M = 4 + 2,4 − 16 = <strong>−9,6 €</strong>.'] },
  ],
  tipusok: [
    { id: 'V1', nev: 'Klasszikus valószínűség', general: V1 },
    { id: 'V2', nev: 'Komplementer', general: V2 },
    { id: 'V3', nev: 'Független események együtt', general: V3 },
    { id: 'V4', nev: 'Nyeremény-eloszlás (két húzás visszatevéssel)', general: V4 },
    { id: 'V5', nev: 'Legfeljebb kétszer húz', general: V5 },
    { id: 'V6', nev: 'Hiányzó valószínűség', general: V6 },
    { id: 'V7', nev: 'Várható érték', general: V7 },
    { id: 'V8', nev: 'Kedvező-e? (választós)', general: V8, tesztbe: false },
    { id: 'V9', nev: 'Módusz', general: V9 },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva. */
  peldaEllenorzes() {
    const k2 = (x) => kerekit(x, 2);
    const k4 = (x) => kerekit(x, 4);
    const m3 = varhato([100, -10, -20], [0.05, 0.5, 0.45]);
    const fredi = varhato([40, 10, -50], [0.3, 0.7 * 0.3, 0.49]);
    return [
      { nev: '1. példa: két kettes', kapott: vsz(1, 36), vart: 1 / 36 },
      { nev: '1. példa: szorzattal', kapott: (1 / 6) * (1 / 6), vart: 1 / 36 },
      { nev: '2. példa: P(NN)', kapott: k4(0.4 * 0.4), vart: 0.16 },
      { nev: '2. példa: P(vegyes)', kapott: k4(2 * 0.4 * 0.6), vart: 0.48 },
      { nev: '2. példa: P(VV)', kapott: k4(0.6 * 0.6), vart: 0.36 },
      { nev: '2. példa: módusz', kapott: modusz(X2, P2), vart: 6 },
      { nev: '2. példa: M(X)', kapott: k2(varhato(X2, P2)), vart: 3.2 },
      { nev: '2. példa: 100 játékra', kapott: 16 * 20 + 48 * 6 - 36 * 8, vart: 320 },
      { nev: '2. példa: D(X)', kapott: kerekit(szoras(X2, P2), 1), vart: 9.7 },
      { nev: '3. példa: 2 piros', kapott: k4((2 / 20) * (6 / 12)), vart: 0.05 },
      { nev: '3. példa: 0 piros', kapott: k4((18 / 20) * (6 / 12)), vart: 0.45 },
      { nev: '3. példa: 1 piros', kapott: k4(1 - 0.05 - 0.45), vart: 0.5 },
      { nev: '3. példa: M(X)', kapott: k2(m3), vart: -9 },
      { nev: '4. példa: elsőre', kapott: 0.3, vart: 0.3 },
      { nev: '4. példa: csak másodikra', kapott: k4(0.7 * 0.3), vart: 0.21 },
      { nev: '4. példa: egyik sem', kapott: k4(0.7 * 0.7), vart: 0.49 },
      { nev: '4. példa: M(X)', kapott: k2(fredi), vart: -10.4 },
      { nev: '5. példa: hiányzó valószínűség', kapott: k2(1 - 0.52 - 0.23), vart: 0.25 },
      { nev: '5. példa: M(X) (40/20/−60)', kapott: k2(varhato([40, 20, -60], [0.52, 0.23, 0.25])), vart: 10.4 },
      { nev: '5. példa: 8 lap, P(NN)', kapott: k4(0.25 * 0.25), vart: 0.0625 },
      { nev: '5. példa: 8 lap, P(vegyes)', kapott: k4(2 * 0.25 * 0.75), vart: 0.375 },
      { nev: '5. példa: 8 lap, P(VV)', kapott: k4(0.75 * 0.75), vart: 0.5625 },
      { nev: '5. példa: 8 lap, M(X)', kapott: k2(varhato([24, 4, -16], [0.0625, 0.375, 0.5625])), vart: -6 },
      { nev: '5. példa: 5 lap, M(X)', kapott: k2(varhato([20, 15, -25], [0.2, 0.16, 0.64])), vart: -9.6 },
    ];
  },
};
