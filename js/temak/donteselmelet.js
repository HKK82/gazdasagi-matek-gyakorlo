// 10. téma – Döntéselmélet: döntési táblázat, optimista, pesszimista, elmulasztott nyereség, Laplace, Bayes, Hurwitz (v5)
import { egesz, valaszt } from '../lib/rng.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { probal, f, fz, tisztit } from './seged.js';

// ---------------------------------------------------------------------
// Tiszta számolófüggvények (a példák és a tesztek is ezt használják)
// ---------------------------------------------------------------------
export const ELVEK = {
  optimista: { nev: 'optimista', irany: 'max' },
  pesszimista: { nev: 'pesszimista', irany: 'max' },
  elmulasztott: { nev: 'elmulasztott nyereség', irany: 'min' },
  laplace: { nev: 'Laplace', irany: 'max' },
  bayes: { nev: 'Bayes', irany: 'max' },
  hurwitz: { nev: 'Hurwitz', irany: 'max' },
};
const max = (t) => Math.max(...t);
const min = (t) => Math.min(...t);
/** Oszloponkénti maximumok. */
export const oszlopMax = (E) => E[0].map((_, j) => max(E.map((s) => s[j])));
/** Elmulasztott nyereség táblázata: oszlopmaximum − érték. */
export const veszteségTabla = (E) => { const om = oszlopMax(E); return E.map((s) => s.map((v, j) => om[j] - v)); };
/** Soronkénti értékek egy elv szerint. par: { valsz: [0..1 tört, összeg 1], alfa } */
export function sorErtekek(elv, E, par = {}) {
  switch (elv) {
    case 'optimista': return E.map(max);
    case 'pesszimista': return E.map(min);
    case 'elmulasztott': return veszteségTabla(E).map(max);
    case 'laplace': return E.map((s) => tisztit(s.reduce((a, b) => a + b, 0) / s.length));
    case 'bayes': return E.map((s) => tisztit(s.reduce((a, v, j) => a + v * par.valsz[j], 0)));
    case 'hurwitz': return E.map((s) => tisztit(par.alfa * max(s) + (1 - par.alfa) * min(s)));
    default: throw new Error('ismeretlen elv: ' + elv);
  }
}
/** A legjobb sor(ok): az elmulasztott nyereségnél a legkisebb, egyébként a legnagyobb érték. Holtversenynél több index. */
export function nyertesek(elv, ertekek) {
  const cel = ELVEK[elv].irany === 'min' ? min(ertekek) : max(ertekek);
  return { cel, idxs: ertekek.map((v, i) => (Math.abs(v - cel) < 1e-9 ? i : -1)).filter((i) => i >= 0) };
}

// ---------------------------------------------------------------------
// Szituációk
// ---------------------------------------------------------------------
const HELYZETEK = [
  { id: 'gabona', context: 'Egy gazdálkodó négy növény közül választ; a nyereség az időjárástól függ.', sorok: ['napraforgó', 'búza', 'lucerna', 'rizs'], oszlopok: ['napos', 'átlagos', 'esős'], egyseg: 'millió Ft', nagy: false },
  { id: 'kert', context: 'Egy kertes gazda négy zöldség közül választ; a bevétel a tavaszi időjárástól függ.', sorok: ['saláta', 'borsó', 'retek', 'paradicsom'], oszlopok: ['fagyos', 'átlagos', 'napos'], egyseg: 'ezer Ft', nagy: true },
  { id: 'bufe', context: 'Egy strandbüfé négy kínálat közül választ; a bevétel a nyár időjárásától függ.', sorok: ['sütemény', 'szendvics', 'fagylalt', 'tea'], oszlopok: ['hideg', 'enyhe', 'meleg'], egyseg: 'ezer Ft', nagy: true },
  { id: 'webshop', context: 'Egy webshop három kampány közül választ; a haszon a keresletétől függ.', sorok: ['kedvezmény', 'hírlevél', 'hirdetés'], oszlopok: ['gyenge', 'átlagos', 'erős'], egyseg: 'millió Ft', nagy: false },
  { id: 'auto', context: 'Egy autókereskedő három típusból rendel készletet; a haszon az üzemanyag árától függ.', sorok: ['kisautó', 'családi autó', 'terepjáró'], oszlopok: ['drága benzin', 'átlagos ár', 'olcsó benzin'], egyseg: 'millió Ft', nagy: false },
  { id: 'fesztival', context: 'Egy fesztivál szervezője négy beruházás közül választ; a haszon az időjárástól függ.', sorok: ['sátor', 'színpad', 'büfé', 'parkoló'], oszlopok: ['esős', 'felhős', 'napos'], egyseg: 'ezer Ft', nagy: true },
];

/** Véletlen döntési táblázat (egész számok: −10…30 vagy 0…500, utóbbi 10-es lépésekkel). */
function tablaGeneral(rng, helyzet) {
  const sorokSzama = helyzet.sorok.length;
  const E = Array.from({ length: sorokSzama }, () => Array.from({ length: 3 }, () => (helyzet.nagy ? egesz(rng, 0, 50) * 10 : egesz(rng, -10, 30))));
  return { helyzet, sorok: helyzet.sorok, oszlopok: helyzet.oszlopok, egyseg: helyzet.egyseg, E };
}
const uniqSorok = (E) => new Set(E.map((s) => s.join(','))).size === E.length;

/**
 * Táblázat holtverseny-igénnyel: wantTie → pontosan két legjobb sor, egyébként pontosan egy.
 * kell(T): további feltétel (pl. a tipikus hibák értékei különbözzenek).
 */
function tablaTervezett(rng, { elv, par = () => ({}), wantTie = false, kell = () => true, helyzet = valaszt(rng, HELYZETEK) }) {
  return probal(() => {
    const T = tablaGeneral(rng, helyzet);
    if (!uniqSorok(T.E)) return null;
    const p = par(T);
    const ertekek = sorErtekek(elv, T.E, p);
    const ny = nyertesek(elv, ertekek);
    if (ny.idxs.length !== (wantTie ? 2 : 1)) return null;
    if (!kell(T, p, ertekek, ny)) return null;
    return { T, par: p, ertekek, ny };
  });
}

// ---------------------------------------------------------------------
// Megjelenítés: HTML-táblázat
// ---------------------------------------------------------------------
const cella = (v) => f(v, 2);
/**
 * A döntési táblázat. opciok: { valsz: ['50 %','30 %','?'] (Bayes), kiemelt: Set('i,j'), valasztott: Set(i),
 *   extraCim, extra: [érték szöveg soronként], elsoCim }
 */
export function tablaHtml(T, opciok = {}) {
  const { valsz = null, kiemelt = new Set(), valasztott = new Set(), extraCim = '', extra = null, bal = 'Döntés', cellak = null, caption = '' } = opciok;
  const fej = [`<th scope="col">${bal}</th>`, ...T.oszlopok.map((o) => `<th scope="col">${o}</th>`), ...(extra ? [`<th scope="col">${extraCim}</th>`] : [])].join(' ');
  const sorok = T.sorok.map((nev, i) => {
    const osztaly = valasztott.has(i) ? ' class="valasztott"' : '';
    const tdk = (cellak || T.E)[i].map((v, j) => `<td${kiemelt.has(`${i},${j}`) ? ' class="kiemelt"' : ''}>${cella(v)}</td>`);
    if (extra) tdk.push(`<td class="eredmeny">${extra[i]}</td>`);
    return `<tr${osztaly}><th scope="row">${nev}</th> ${tdk.join(' ')}</tr>`;
  });
  const vsor = valsz ? `<tr class="valsz"><th scope="row">esély</th> ${valsz.map((v) => `<td>${v}</td>`).join(' ')}${extra ? ' <td></td>' : ''}</tr>` : '';
  return `<div class="tabla-gorgeto"><table class="tabla dontes">${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${fej}</tr></thead> <tbody>${vsor} ${sorok.join(' ')}</tbody></table></div>`;
}

const nevekSzoveg = (T, idxs) => idxs.map((i) => T.sorok[i]).join(' vagy ');
const sorLista = (T, ertekek, d = 2) => T.sorok.map((n, i) => `${n}: ${f(ertekek[i], d)}`).join('; ');
const egyseg = (T) => T.egyseg;

// ---- döntés (választós) mező holtverseny-kezeléssel ----
/**
 * jo: a helyes sor(ok) indexe; rosszak: [{ idxs, uzenet, ellenproba }] – ismert tipikus tévedések.
 * Mindig szerepel egy „X vagy Y” opció: holtversenynél a helyes, különben egy rossz (nincs holtverseny).
 */
function dontesMezo(rng, T, jo, ertekek, cimke, { rosszak = [], d = 2, irany = 'max' } = {}) {
  const n = T.sorok.length;
  const opciok = T.sorok.map((nev, i) => ({ szoveg: nev, idxs: [i] }));
  const par = jo.length === 2 ? [...jo] : [jo[0], (jo[0] + 1 + egesz(rng, 0, n - 2)) % n].sort((a, b) => a - b);
  opciok.push({ szoveg: nevekSzoveg(T, par), idxs: par });
  const egyenlo = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
  const jav = jo.slice().sort((a, b) => a - b);
  return valasztoMezo({
    id: 'dontes', cimke,
    opciok: opciok.map((o) => {
      if (egyenlo(o.idxs, jav)) return { szoveg: o.szoveg, helyes: true };
      const r = rosszak.find((x) => egyenlo(x.idxs.slice().sort((a, b) => a - b), o.idxs));
      if (r) return { szoveg: o.szoveg, helyes: false, uzenet: r.uzenet, ellenproba: r.ellenproba };
      if (jav.length === 2 && o.idxs.length === 1 && jav.includes(o.idxs[0])) {
        return {
          szoveg: o.szoveg, helyes: false,
          uzenet: `Holtverseny: a(z) ${nevekSzoveg(T, jav)} sora ugyanazt az értéket (${f(ertekek[jav[0]], d)}) adja, ezért mindkettő a legjobb. A válasz „${nevekSzoveg(T, jav)}”.`,
          ellenproba: `Ellenpróba: a(z) ${T.sorok[jav[0]]} értéke ${f(ertekek[jav[0]], d)}, a(z) ${T.sorok[jav[1]]} értéke ${f(ertekek[jav[1]], d)} – egyenlők, tehát egyik sem jobb a másiknál.`,
        };
      }
      if (jav.length === 1 && o.idxs.length === 2 && o.idxs.includes(jav[0])) {
        const masik = o.idxs.find((i) => i !== jav[0]);
        return {
          szoveg: o.szoveg, helyes: false,
          uzenet: `Itt nincs holtverseny: a legjobb érték (${f(ertekek[jav[0]], d)}) csak a(z) ${T.sorok[jav[0]]} sorában szerepel.`,
          ellenproba: `Ellenpróba: a(z) ${T.sorok[jav[0]]} értéke ${f(ertekek[jav[0]], d)}, a(z) ${T.sorok[masik]} értéke ${f(ertekek[masik], d)} – nem egyenlők, tehát nincs holtverseny.`,
        };
      }
      return { szoveg: o.szoveg, helyes: false };
    }),
  });
}

/** A döntő érték mezője. Az egész értékű elveknél csak egész szám a jó. */
function ertekMezo(T, helyes, { cimke = 'A döntő érték', ellen, hibak = [], egeszE = false } = {}) {
  return szamMezo({
    id: 'ertek', cimke: `${cimke} (${egyseg(T)}${egeszE ? '' : ', két tizedesre'})`, helyes, tizedes: egeszE ? 0 : 2, egyseg: egyseg(T),
    abszTures: egeszE ? 0 : 0.01, egesz: egeszE, egeszUzenet: 'Ez a táblázat egész számokból számolt érték; ide egész számot írjon.',
    negativ: true, ellenproba: ellen, hibak,
  });
}

/** Általános ellenpróba: a soronkénti értékek legjobbika. */
function ertekEllen(T, ertekek, ny, szoveg, d = 2) {
  const cel = ny.cel;
  return (w) => `Ellenpróba: a soronkénti értékek (${sorLista(T, ertekek, d)}) közül a ${szoveg} ${f(cel, d)}; az Ön ${f(w, d)} értéke ${w > cel ? 'ennél nagyobb' : 'ennél kisebb'}${ertekek.some((v) => Math.abs(v - w) < 0.005) ? ', és egy másik sor értéke – de az nem a döntő' : ', és egyik sor értéke sem'}.`;
}

const tablaSzoveg = (T, extraMondat = '', opciok = {}) =>
  `${T.helyzet.context} A nyereséget (${T.egyseg}) a döntési táblázat mutatja.${extraMondat ? ' ' + extraMondat : ''} ${tablaHtml(T, opciok)}`;

const kerd = {
  dontes: (T) => `Melyik döntést érdemes választani, és mekkora a döntő érték? (Holtversenynél a „X vagy Y” választ adja meg.)`,
};

// =====================================================================
// D1 – optimista
// =====================================================================
function D1(rng) {
  const { T, ertekek, ny } = tablaTervezett(rng, { elv: 'optimista', wantTie: rng() < 0.2, kell: (T, p, ert) => max(T.E.map(min)) !== max(ert) });
  const pess = sorErtekek('pesszimista', T.E);
  const pessCel = max(pess);
  const kiemelt = new Set(T.E.flatMap((s, i) => s.map((v, j) => (v === ertekek[i] && s.indexOf(v) === j ? `${i},${j}` : null)).filter(Boolean)));
  return {
    szoveg: tablaSzoveg(T, 'Az optimista (maximax) elv szerint döntünk.') + ` ${kerd.dontes(T)}`,
    mezok: [
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?'),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a sorok legnagyobb elemei közül a legnagyobb', egeszE: true,
        ellen: ertekEllen(T, ertekek, ny, 'legnagyobb'),
        hibak: [{ ertek: pessCel, uzenet: 'Ez a pesszimista elv értéke (a sorok minimumainak maximuma). Az optimista elv a sorok legnagyobb elemét nézi.' }],
      }),
    ],
    tippek: [
      'Melyik az a lehetőség, ahol a legjobb esetben a legtöbbet lehet nyerni? Mit nézünk soronként?',
      `Optimista elv: soronként a legnagyobb értéket keressük, majd ezek közül a legnagyobbat választjuk. (${sorLista(T, ertekek, 0)}.)`,
    ],
    megoldas: [
      `Soronként a legnagyobb érték: ${sorLista(T, ertekek, 0)}.`,
      `Ezek közül a legnagyobb: ${f(ny.cel, 0)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>${ny.idxs.length === 2 ? ' (holtverseny)' : ''}, a döntő érték <strong>${f(ny.cel, 0)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntést választja az optimista döntéshozó, és mekkora ennek az értéke. Az optimista abban bízik, hogy a legkedvezőbb körülmény következik be.`,
      `Ezért minden sorban megkeressük a legnagyobb nyereséget: ${sorLista(T, ertekek, 0)}. Ez azt mutatja, mi a legtöbb, amit az adott döntéssel el lehet érni.`,
      `Ezek közül a legnagyobbat választjuk: ${f(ny.cel, 0)} ${T.egyseg}, tehát a(z) ${nevekSzoveg(T, ny.idxs)}${ny.idxs.length === 2 ? ' (két sor ugyanazt az értéket adja, ezért a válasz „X vagy Y”)' : ''}.`,
      `Képzelje el, hogy 100 ilyen döntési helyzetben mindig a legjobb körülmény következne be: ${f(100 * ny.cel, 0)} ${T.egyseg} jönne ki a(z) ${nevekSzoveg(T, ny.idxs)} döntésből – de a valóságban ez csak remény, nem biztos.`,
      `Józan ésszel: az optimista érték nem lehet kisebb egyetlen sor legjobb eleménél sem, és a táblázat legnagyobb eleme (${f(max(T.E.map(max)), 0)}) sem haladhatja meg ✓. A pesszimista elv ugyanezt a ${f(pessCel, 0)} értéket adná.`,
    ],
    abraMegoldas: tablaHtml(T, { kiemelt, valasztott: new Set(ny.idxs), extraCim: 'max', extra: ertekek.map((v) => f(v, 0)), caption: 'A sorok legnagyobb elemei (max) kiemelve, a választott sor jelölve.' }),
    jegyezze: 'Optimista (maximax): soronként a maximum, ezek közül a legnagyobb. Holtversenynél a válasz „X vagy Y”.',
  };
}

// =====================================================================
// D2 – pesszimista
// =====================================================================
function D2(rng) {
  const { T, ertekek, ny } = tablaTervezett(rng, { elv: 'pesszimista', wantTie: rng() < 0.2, kell: (T, p, ert) => min(ert) !== max(ert) });
  const minMin = min(ertekek);
  const rosszIdx = ertekek.map((v, i) => (v === minMin ? i : -1)).filter((i) => i >= 0);
  const rosszak = rosszIdx.length === 1 && !ny.idxs.includes(rosszIdx[0]) ? [{
    idxs: rosszIdx,
    uzenet: 'Pesszimista, de nem buta: a legrosszabbak közül a legkevésbé rosszat választja, nem a legrosszabbat.',
    ellenproba: `Ellenpróba: a(z) ${T.sorok[rosszIdx[0]]} legrosszabb értéke ${f(minMin, 0)}, a(z) ${nevekSzoveg(T, ny.idxs)} legrosszabb értéke ${f(ny.cel, 0)} – ez a nagyobb (kedvezőbb), tehát a pesszimista ezt választja.`,
  }] : [];
  const kiemelt = new Set(T.E.flatMap((s, i) => s.map((v, j) => (v === ertekek[i] && s.indexOf(v) === j ? `${i},${j}` : null)).filter(Boolean)));
  return {
    szoveg: tablaSzoveg(T, 'A pesszimista elv szerint döntünk.') + ` ${kerd.dontes(T)}`,
    mezok: [
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?', { rosszak }),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a sorok legkisebb elemei közül a legnagyobb', egeszE: true,
        ellen: ertekEllen(T, ertekek, ny, 'legnagyobb'),
        hibak: [{ ertek: minMin, uzenet: 'Pesszimista, de nem buta: a legrosszabbak közül a legkevésbé rosszat választja – tehát a sorok minimumai közül a legnagyobbat, nem a legkisebbet.' }],
      }),
    ],
    tippek: [
      'Mi a legrosszabb, ami az egyes döntéseknél történhet? Melyik döntésnél a legjobb ez a legrosszabb eset?',
      `Pesszimista elv: soronként a legkisebb értéket keressük, és ezek közül a legnagyobbat választjuk („a legrosszabbak közül a legkevésbé rosszat”). (${sorLista(T, ertekek, 0)}.)`,
    ],
    megoldas: [
      `Soronként a legkisebb érték: ${sorLista(T, ertekek, 0)}.`,
      `Ezek közül a legnagyobb: ${f(ny.cel, 0)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>${ny.idxs.length === 2 ? ' (holtverseny)' : ''}, a döntő érték <strong>${f(ny.cel, 0)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntést választja a pesszimista döntéshozó, és mekkora ennek az értéke. A pesszimista a legrosszabb körülményre számít, ezért a biztonságot keresi.`,
      `Minden sorban megkeressük a legkisebb nyereséget, vagyis azt, ami a döntésből a legrosszabb esetben lehet: ${sorLista(T, ertekek, 0)}.`,
      `Ezek közül azt választjuk, amelyik a legnagyobb, vagyis a legkevésbé rossz: ${f(ny.cel, 0)} ${T.egyseg}, a(z) ${nevekSzoveg(T, ny.idxs)}${ny.idxs.length === 2 ? ' (holtverseny, ezért „X vagy Y”)' : ''}. Nem a legkisebb minimumot választja, mert az éppen a legrosszabb döntés lenne.`,
      `Képzelje el, hogy 100 helyzetben mindig a legrosszabb körülmény következik be: a(z) ${nevekSzoveg(T, ny.idxs)} döntéssel ekkor is helyzetenként legalább ${f(ny.cel, 0)} ${T.egyseg} jut, bármelyik másik döntéssel ennél kevesebb.`,
      `Józan ésszel: a pesszimista érték (${f(ny.cel, 0)}) nem lehet nagyobb a táblázat egyik elemeként sem, hiszen egy sor minimuma; a legrosszabb minimum ${f(minMin, 0)} lenne, ezt nem választjuk ✓.`,
    ],
    abraMegoldas: tablaHtml(T, { kiemelt, valasztott: new Set(ny.idxs), extraCim: 'min', extra: ertekek.map((v) => f(v, 0)), caption: 'A sorok legkisebb elemei (min) kiemelve, a választott sor jelölve.' }),
    jegyezze: 'Pesszimista: soronként a minimum, ezek közül a legnagyobb („a legrosszabbakból a legkevésbé rosszat”).',
  };
}

// =====================================================================
// D3 – elmulasztott nyereség: a veszteségtábla celláiból
// =====================================================================
function D3(rng) {
  const helyzet = valaszt(rng, HELYZETEK);
  const T = probal(() => {
    const x = tablaGeneral(rng, helyzet);
    // legyen negatív elem is (a rossz különbségképzés célzott hibájához), és ne legyen két egyforma sor
    return uniqSorok(x.E) && x.E.some((s) => s.some((v) => v < 0)) ? x : (helyzet.nagy && uniqSorok(x.E) ? x : null);
  });
  const om = oszlopMax(T.E);
  const V = veszteségTabla(T.E);
  // 2–3 kérdezett cella: különböző sor- és oszlopindexszel; lehetőleg negatív értékűvel is
  const kerdezett = probal(() => {
    const db = egesz(rng, 2, 3);
    const sorok = [];
    const oszlopok = [];
    const cellak = [];
    for (let k = 0; k < db; k++) {
      const i = egesz(rng, 0, T.sorok.length - 1), j = egesz(rng, 0, 2);
      if (sorok.includes(i) || oszlopok.includes(j)) return null;
      sorok.push(i); oszlopok.push(j); cellak.push([i, j]);
    }
    if (!T.helyzet.nagy && !cellak.some(([i, j]) => T.E[i][j] < 0)) return null;
    if (cellak.some(([i, j]) => V[i][j] === 0) && rng() < 0.7) return null;
    return cellak;
  });
  const sorMaxok = T.E.map(max);
  const mezok = kerdezett.map(([i, j]) => {
    const v = T.E[i][j];
    const hibak = [];
    if (v < 0) hibak.push({ ertek: om[j] + v, uzenet: `A negatív értéknél vigyázzon az előjellel: ${fz(om[j], 0)} − ${fz(v, 0)} = ${f(om[j] - v, 0)}.` });
    hibak.push({ ertek: sorMaxok[i] - v, uzenet: 'Oszloponként keressük, melyik lett volna a legjobb – nem a sor legjobb értékéhez mérünk.' });
    return szamMezo({
      id: `c${i}${j}`, cimke: `Elmaradt nyereség: ${T.sorok[i]} / ${T.oszlopok[j]} (${T.egyseg})`, helyes: V[i][j], tizedes: 0, egyseg: T.egyseg, egesz: true,
      egeszUzenet: 'Ez a táblázat egész számaiból számolt különbség; egész számot írjon.',
      ellenproba: (w) => `Ellenpróba: ha az elmaradt nyereség ${f(w, 0)} ${T.egyseg} lenne, akkor a cella értékéhez (${fz(v, 0)}) hozzáadva ${f(v + w, 0)} jönne ki, de az ${T.oszlopok[j]} oszlop legjobb értéke ${f(om[j], 0)}: ${fz(v, 0)} + ${f(V[i][j], 0)} = ${f(om[j], 0)}.`,
      negativ: true, hibak,
    });
  });
  const cellaLista = kerdezett.map(([i, j]) => `${T.sorok[i]} / ${T.oszlopok[j]}`).join('; ');
  return {
    szoveg: tablaSzoveg(T, 'Az elmulasztott nyereség elvéhez a veszteségtáblát (oszloponként a legjobb érték mínusz az adott érték) kell kiszámolni.') + ` Mennyi az elmulasztott nyereség a következő cellákban: ${cellaLista}?`,
    mezok,
    tippek: [
      'Melyik lett volna az adott körülmény (oszlop) mellett a legjobb döntés, és mennyivel kaptunk volna többet?',
      'Oszloponként keressük a legnagyobb értéket, és ebből vonjuk ki a cella értékét: elmaradt nyereség = oszlopmaximum − érték. Negatív értéket kivonva az előjel megfordul.',
      `Oszlopmaximumok: ${T.oszlopok.map((o, j) => `${o}: ${f(om[j], 0)}`).join('; ')}.`,
    ],
    megoldas: [
      `Oszlopmaximumok: ${T.oszlopok.map((o, j) => `${o}: ${f(om[j], 0)}`).join('; ')}.`,
      ...kerdezett.map(([i, j]) => `${T.sorok[i]} / ${T.oszlopok[j]}: ${f(om[j], 0)} − ${fz(T.E[i][j], 0)} = <strong>${f(V[i][j], 0)}</strong>.`),
    ],
    magyarazat: [
      `Az elmulasztott nyereséget keressük: mennyivel kaptunk volna többet, ha az adott körülményhez a legjobb döntést választjuk? Ezt minden oszlopban külön kell megnézni, mert a körülmény oszloponként más.`,
      `Oszloponként megkeressük a legnagyobb nyereséget: ${T.oszlopok.map((o, j) => `${o}: ${f(om[j], 0)}`).join('; ')}. Ebből kivonjuk a kérdezett cella értékét: ${kerdezett.map(([i, j]) => `${f(om[j], 0)} − ${fz(T.E[i][j], 0)} = ${f(V[i][j], 0)}`).join('; ')}.`,
      `Negatív értéknél a kivonás előjelet vált, tehát az elmaradás nagyobb, mint az oszlopmaximum: ez érthető, hiszen az elvesztett pénzt is „elmulasztottuk”.`,
      `Képzelje el, hogy 100 alkalommal ugyanazt a körülményt kapjuk: a jó döntés ${f(100 * om[kerdezett[0][1]], 0)} ${T.egyseg} lenne, a miénk ${f(100 * T.E[kerdezett[0][0]][kerdezett[0][1]], 0)} ${T.egyseg}, a különbség ${f(100 * V[kerdezett[0][0]][kerdezett[0][1]], 0)} ${T.egyseg}.`,
      `Józan ésszel: az elmaradt nyereség sosem negatív (a legjobb döntésnél 0), és az oszlop legjobb értékénél 0-t kapunk. A kapott számok: ${kerdezett.map(([i, j]) => f(V[i][j], 0)).join(', ')} ✓.`,
    ],
    abraMegoldas: tablaHtml({ ...T }, {
      cellak: V, kiemelt: new Set(kerdezett.map(([i, j]) => `${i},${j}`)), bal: 'Veszteségtábla', caption: 'A veszteségtábla (oszlopmaximum − érték), a kérdezett cellák kiemelve.',
    }),
    jegyezze: 'Elmulasztott nyereség: oszloponként a legjobb érték mínusz az adott érték. Negatív értéknél: 8 − (−6) = 14.',
  };
}

// =====================================================================
// D4 – elmulasztott nyereség: a döntés
// =====================================================================
function D4(rng) {
  const { T, ertekek, ny } = tablaTervezett(rng, {
    elv: 'elmulasztott', wantTie: rng() < 0.1,
    kell: (T, p, ert, nyy) => max(ert) !== nyy.cel && ert.indexOf(max(ert)) !== nyy.idxs[0],
  });
  const V = veszteségTabla(T.E);
  const maxMax = max(ertekek);
  const rossz = ertekek.map((v, i) => (v === maxMax ? i : -1)).filter((i) => i >= 0);
  const rosszak = rossz.length === 1 ? [{
    idxs: rossz,
    uzenet: 'Ezek veszteségek: a legkisebbet választjuk, nem a legnagyobbat.',
    ellenproba: `Ellenpróba: a(z) ${T.sorok[rossz[0]]} legnagyobb elmaradása ${f(maxMax, 0)}, a(z) ${nevekSzoveg(T, ny.idxs)} legnagyobb elmaradása csak ${f(ny.cel, 0)} – az elmaradás kisebb, tehát az a jobb döntés.`,
  }] : [];
  const kiemelt = new Set(V.flatMap((s, i) => s.map((v, j) => (v === ertekek[i] && s.indexOf(v) === j ? `${i},${j}` : null)).filter(Boolean)));
  return {
    szoveg: tablaSzoveg(T, 'Az elmulasztott nyereség elve szerint döntünk.') + ` ${kerd.dontes(T)}`,
    mezok: [
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?', { rosszak }),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a legnagyobb elmaradások közül a legkisebb', egeszE: true, ellen: ertekEllen(T, ertekek, ny, 'legkisebb'),
        hibak: [{ ertek: maxMax, uzenet: 'Ezek veszteségek: a legkisebbet választjuk, nem a legnagyobbat.' }],
      }),
    ],
    tippek: [
      'Mennyivel kaptunk volna többet, ha mindig a legjobb döntést választjuk? Hogyan számoljuk ki ezt az elmaradást?',
      `Előbb számolja ki a veszteségtáblát (oszlopmaximum − érték), majd soronként a legnagyobb elmaradást, és ezek közül a legkisebbet válassza. Oszlopmaximumok: ${T.oszlopok.map((o, j) => `${o}: ${f(oszlopMax(T.E)[j], 0)}`).join('; ')}.`,
      `A legnagyobb elmaradások soronként: ${sorLista(T, ertekek, 0)}.`,
    ],
    megoldas: [
      `Oszlopmaximumok: ${T.oszlopok.map((o, j) => `${o}: ${f(oszlopMax(T.E)[j], 0)}`).join('; ')}. Veszteségtábla soronként: ${T.sorok.map((n, i) => `${n}: ${V[i].map((v) => f(v, 0)).join(', ')}`).join('; ')}.`,
      `Soronként a legnagyobb elmaradás: ${sorLista(T, ertekek, 0)}.`,
      `Ezek közül a legkisebb: ${f(ny.cel, 0)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>${ny.idxs.length === 2 ? ' (holtverseny)' : ''}, a döntő érték <strong>${f(ny.cel, 0)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntés okozza a legkisebb legnagyobb elmaradást. Az elmulasztott nyereség elve a megbánás elkerülésére törekszik: azt nézi, mennyivel kaphattunk volna többet, ha jól döntünk.`,
      `Először minden oszlopban megkeressük a legjobb értéket, és kiszámoljuk a veszteségtáblát: oszlopmaximum − érték. Ezután soronként megnézzük a legnagyobb elmaradást: ${sorLista(T, ertekek, 0)}.`,
      `Ezek veszteségek, ezért a legkisebbet választjuk: ${f(ny.cel, 0)} ${T.egyseg}, a(z) ${nevekSzoveg(T, ny.idxs)}${ny.idxs.length === 2 ? ' (holtverseny, „X vagy Y”)' : ''}. A legnagyobbat választani éppen a legnagyobb megbánást jelentené.`,
      `Képzelje el, hogy 100 helyzetben mindig a legrosszabb elmaradás következik be: a(z) ${nevekSzoveg(T, ny.idxs)} döntéssel legfeljebb ${f(100 * ny.cel, 0)} ${T.egyseg} marad el összesen, más döntésnél több.`,
      `Józan ésszel: egy elmaradás sosem negatív, és a legkisebb legnagyobb elmaradás (${f(ny.cel, 0)}) kisebb vagy egyenlő, mint a többi soré (legfeljebb ${f(maxMax, 0)}) ✓.`,
    ],
    abraMegoldas: tablaHtml(T, { cellak: V, kiemelt, valasztott: new Set(ny.idxs), extraCim: 'elm.', extra: ertekek.map((v) => f(v, 0)), bal: 'Veszteségtábla', caption: 'A veszteségtábla: a soronkénti legnagyobb elmaradás (elm.) kiemelve, a választott sor jelölve.' }),
    jegyezze: 'Elmulasztott nyereség: veszteségtábla (oszlopmaximum − érték), soronként a legnagyobb elmaradás, ezek közül a LEGKISEBB döntés.',
  };
}

// =====================================================================
// D5 – Laplace
// =====================================================================
function D5(rng) {
  const { T, ertekek, ny } = tablaTervezett(rng, { elv: 'laplace', wantTie: rng() < 0.25, kell: (T, p, ert, nyy) => nyy.cel !== 0 });
  const osszegek = T.E.map((s) => s.reduce((a, b) => a + b, 0));
  const kiemelt = new Set(T.E.flatMap((s, i) => s.map((_, j) => `${i},${j}`)));
  return {
    szoveg: tablaSzoveg(T, 'A Laplace-elv szerint döntünk (a körülményeket egyformán valószínűnek vesszük).') + ` ${kerd.dontes(T)}`,
    mezok: [
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?'),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a legnagyobb soronkénti átlag', ellen: ertekEllen(T, ertekek, ny, 'legnagyobb'),
        hibak: [{ ertek: Math.max(...osszegek), uzenet: 'Az összeget osztani kell a körülmények számával (itt 3).' }],
      }),
    ],
    tippek: [
      'Ha nem tudjuk, melyik körülmény valószínűbb, mit tehetünk? Hogyan kezelhetjük egyformán őket?',
      `Laplace-elv: a körülményeket egyformán valószínűnek vesszük, ezért soronként a számtani átlagot számoljuk (az összeget osztjuk a körülmények számával), és a legnagyobbat választjuk.`,
      `Soronkénti összegek: ${sorLista(T, osszegek, 0)}.`,
    ],
    megoldas: [
      `Soronként a számtani átlag: ${T.sorok.map((n, i) => `${n}: ${f(osszegek[i], 0)} / 3 = ${f(ertekek[i], 2)}`).join('; ')}.`,
      `A legnagyobb átlag: ${f(ny.cel, 2)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>${ny.idxs.length === 2 ? ' (holtverseny)' : ''}, a döntő érték <strong>${f(ny.cel, 2)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntés a legjobb a Laplace-elv szerint, és mekkora az értéke. Ez az elv akkor hasznos, ha nem tudjuk, melyik körülmény mennyire valószínű.`,
      `Ilyenkor mind a 3 körülményt egyformán valószínűnek vesszük (egyenként egyharmad eséllyel), ezért soronként a számtani átlagot számoljuk: ${T.sorok.map((n, i) => `${n}: ${f(osszegek[i], 0)} : 3 = ${f(ertekek[i], 2)}`).join('; ')}. Elosztjuk a körülmények számával (3), mert az összeg 3 körülményből áll.`,
      `A legnagyobb átlag ${f(ny.cel, 2)} ${T.egyseg}: a(z) ${nevekSzoveg(T, ny.idxs)}${ny.idxs.length === 2 ? ' (holtverseny, ezért „X vagy Y”)' : ''}. A döntés az összeggel is ugyanaz lenne, de az érték nem: az összeget osztani kell.`,
      `Képzelje el, hogy 99 alkalommal élünk át a három körülményből mindegyiket 33-szor: a(z) ${nevekSzoveg(T, ny.idxs)} döntés átlagosan ${f(ny.cel, 2)} ${T.egyseg} nyereséget hozna alkalmanként.`,
      `Józan ésszel: az átlag a sor legkisebb és legnagyobb eleme közé esik; a(z) ${nevekSzoveg(T, [ny.idxs[0]])} sorában ${f(min(T.E[ny.idxs[0]]), 0)} és ${f(max(T.E[ny.idxs[0]]), 0)} között, és a ${f(ny.cel, 2)} valóban ide esik ✓.`,
    ],
    abraMegoldas: tablaHtml(T, { kiemelt, valasztott: new Set(ny.idxs), extraCim: 'átlag', extra: ertekek.map((v) => f(v, 2)), caption: 'A soronkénti átlagok, a választott sor jelölve.' }),
    jegyezze: 'Laplace: a körülményeket egyformán valószínűnek vesszük → soronként a számtani átlag (összeg : a körülmények száma), a legnagyobb döntés.',
  };
}

// =====================================================================
// D6 – Bayes (a hiányzó valószínűség kiegészítésével)
// =====================================================================
function D6(rng) {
  const helyzet = valaszt(rng, HELYZETEK);
  const hianyzo = egesz(rng, 0, 2);
  const { T, par, ertekek, ny, pct } = (() => {
    return probal(() => {
      const p1 = egesz(rng, 2, 12) * 5, p2 = egesz(rng, 2, 12) * 5;
      const p3 = 100 - p1 - p2;
      if (p3 < 10) return null;
      const pct = [p1, p2, p3];
      const T = tablaGeneral(rng, helyzet);
      if (!uniqSorok(T.E)) return null;
      const valsz = pct.map((x) => x / 100);
      const ertekek = sorErtekek('bayes', T.E, { valsz });
      const ny = nyertesek('bayes', ertekek);
      if (ny.idxs.length !== 1) return null;
      // a hiányzó valószínűséget 0-nak véve más értéket kapjunk
      const nullas = valsz.map((x, j) => (j === hianyzo ? 0 : x));
      const hibasE = sorErtekek('bayes', T.E, { valsz: nullas });
      if (Math.abs(hibasE[ny.idxs[0]] - ny.cel) < 0.02) return null;
      return { T, par: { valsz }, ertekek, ny, pct };
    });
  })();
  const hibasValsz = par.valsz.map((x, j) => (j === hianyzo ? 0 : x));
  const hibasE = sorErtekek('bayes', T.E, { valsz: hibasValsz });
  const hibasNy = nyertesek('bayes', hibasE);
  const valszCimke = pct.map((x, j) => (j === hianyzo ? '?' : `${x} %`));
  const rosszak = hibasNy.idxs.length === 1 && hibasNy.idxs[0] !== ny.idxs[0] ? [{
    idxs: hibasNy.idxs,
    uzenet: 'A valószínűségek összege 1 (100 %): a hiányzó valószínűség a maradék, nem 0.',
    ellenproba: `Ellenpróba: a megadott valószínűségek összege ${pct.filter((_, j) => j !== hianyzo).join(' + ')} = ${pct.filter((_, j) => j !== hianyzo).reduce((a, b) => a + b, 0)} %, a hiányzó ${pct[hianyzo]} %-kal lesz 100 %; 0-val számolva a(z) ${T.sorok[hibasNy.idxs[0]]} jönne ki legjobbnak, ami hibás.`,
  }] : [];
  const sulyok = pct.map((x) => f(x / 100, 2));
  const sorSzamitas = (i) => T.E[i].map((v, j) => `${fz(v, 0)} · ${sulyok[j]}`).join(' + ');
  const kiemelt = new Set(T.E.flatMap((s, i) => s.map((_, j) => `${i},${j}`)));
  return {
    szoveg: `${T.helyzet.context} A nyereséget (${T.egyseg}) a döntési táblázat mutatja; a táblázat felső sorában a körülmények valószínűségei vannak (a hiányzót 100 %-ra kell kiegészíteni). A Bayes-elv szerint döntünk. ${tablaHtml(T, { valsz: valszCimke })} Mennyi a hiányzó valószínűség (%)? Melyik döntést érdemes választani, és mekkora a döntő érték?`,
    mezok: [
      szamMezo({
        id: 'hianyzo', cimke: 'A hiányzó valószínűség (százalékban, egész szám)', helyes: pct[hianyzo], tizedes: 0, egyseg: '%',
        egesz: true, egeszUzenet: 'Százalékban és egész számként kérjük (például 20, nem 0,2).',
        ellenproba: (w) => `Ellenpróba: a három valószínűség összege ${pct.filter((_, j) => j !== hianyzo).join(' + ')} + ${f(w, 0)} = ${f(pct.filter((_, j) => j !== hianyzo).reduce((a, b) => a + b, 0) + w, 0)} %, de ennek 100 %-nak kell lennie.`,
        hibak: [
          { ertek: 0, uzenet: 'A valószínűségek összege 1 (100 %): a hiányzó valószínűség a maradék, nem 0.' },
        ],
      }),
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?', { rosszak }),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a legnagyobb várható érték', ellen: ertekEllen(T, ertekek, ny, 'legnagyobb'),
        hibak: [{ ertek: hibasE[ny.idxs[0]], uzenet: 'A valószínűségek összege 1 (100 %): a hiányzó valószínűséget előbb ki kell egészíteni, nem lehet 0.' }],
      }),
    ],
    tippek: [
      'Mennyi a három körülmény valószínűségének összege? Hogyan kapjuk meg a hiányzót?',
      `A hiányzó valószínűség: 100 % − ${pct.filter((_, j) => j !== hianyzo).join(' % − ')} % = ${pct[hianyzo]} %. Utána soronként a várható értéket számoljuk: minden értéket megszorzunk a saját valószínűségével, és összeadjuk.`,
      `Például ${T.sorok[0]}: ${sorSzamitas(0)}.`,
    ],
    megoldas: [
      `A hiányzó valószínűség: 100 % − ${pct.filter((_, j) => j !== hianyzo).join(' % − ')} % = <strong>${pct[hianyzo]} %</strong>. A valószínűségek: ${pct.map((x, j) => `${T.oszlopok[j]}: ${x} %`).join('; ')}.`,
      `Soronként a várható érték: ${T.sorok.map((n, i) => `${n}: ${sorSzamitas(i)} = ${f(ertekek[i], 2)}`).join('; ')}.`,
      `A legnagyobb: ${f(ny.cel, 2)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>, a döntő érték <strong>${f(ny.cel, 2)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntés a legjobb a Bayes-elv szerint, ha ismertek a körülmények valószínűségei. Előbb a hiányzó valószínűséget kell megtalálni.`,
      `A három valószínűség összege 100 %, mert valamelyik körülmény biztosan bekövetkezik. A hiányzó: 100 % − ${pct.filter((_, j) => j !== hianyzo).join(' % − ')} % = ${pct[hianyzo]} %. Ha 0-val számolna, hiányozna az eset súlya.`,
      `Soronként a várható értéket számoljuk: minden nyereséget megszorzunk a körülmény valószínűségével és összeadjuk, vagyis súlyozott átlagot veszünk: ${T.sorok.map((n, i) => `${n}: ${f(ertekek[i], 2)}`).join('; ')}.`,
      `Képzelje el, hogy 100 évet élünk meg: ${pct.map((x, j) => `kb. ${x} évben ${T.oszlopok[j]} lesz`).join(', ')}. Így a(z) ${nevekSzoveg(T, ny.idxs)} döntés évente átlagosan ${f(ny.cel, 2)} ${T.egyseg} nyereséget hoz.`,
      `Józan ésszel: a várható érték egy sor legkisebb és legnagyobb eleme közé esik; a(z) ${nevekSzoveg(T, ny.idxs)} sorában ${f(min(T.E[ny.idxs[0]]), 0)} és ${f(max(T.E[ny.idxs[0]]), 0)} között, és a ${f(ny.cel, 2)} ide esik ✓.`,
    ],
    abraMegoldas: tablaHtml(T, {
      kiemelt, valasztott: new Set(ny.idxs), valsz: pct.map((x) => `${x} %`), extraCim: 'várható', extra: ertekek.map((v) => f(v, 2)),
      caption: 'A kiegészített valószínűségekkel számolt várható értékek, a választott sor jelölve.',
    }),
    jegyezze: 'Bayes: soronként a várható érték a megadott valószínűségekkel (a hiányzót 100 %-ra egészítjük ki), a legnagyobb döntés.',
  };
}

// =====================================================================
// D7 – Hurwitz
// =====================================================================
function D7(rng) {
  const alfa = valaszt(rng, [0.2, 0.3, 0.4, 0.6, 0.7, 0.8]);
  const { T, ertekek, ny } = tablaTervezett(rng, {
    elv: 'hurwitz', par: () => ({ alfa }), wantTie: rng() < 0.12,
    kell: (T, p, ert, nyy) => {
      const i = nyy.idxs[0];
      const s = T.E[i];
      const vegek = tisztit(alfa * s[0] + (1 - alfa) * s[2]);
      const cserelt = tisztit((1 - alfa) * max(s) + alfa * min(s));
      return Math.abs(vegek - nyy.cel) > 0.02 && Math.abs(cserelt - nyy.cel) > 0.02;
    },
  });
  const i0 = ny.idxs[0];
  const elsoUtolso = T.E.map((s) => tisztit(alfa * s[0] + (1 - alfa) * s[2]));
  const csereltAlfa = T.E.map((s) => tisztit((1 - alfa) * max(s) + alfa * min(s)));
  const nyV = nyertesek('hurwitz', elsoUtolso), nyC = nyertesek('hurwitz', csereltAlfa);
  const rosszak = [];
  if (nyV.idxs.length === 1 && nyV.idxs[0] !== i0 && ny.idxs.length === 1) {
    rosszak.push({ idxs: nyV.idxs, uzenet: 'A sor legnagyobb és legkisebb értékét vegye, bárhol vannak – nem az első és az utolsó oszlopét.', ellenproba: `Ellenpróba: ha csak az első és az utolsó oszlop számítana, a(z) ${T.sorok[nyV.idxs[0]]} jönne ki legjobbnak ${f(nyV.cel, 2)} értékkel; de a sorok legnagyobb és legkisebb elemei máshol is lehetnek (például a(z) ${T.sorok[i0]} sorában ${f(max(T.E[i0]), 0)} és ${f(min(T.E[i0]), 0)}).` });
  }
  if (nyC.idxs.length === 1 && nyC.idxs[0] !== i0 && !rosszak.some((x) => x.idxs[0] === nyC.idxs[0]) && ny.idxs.length === 1) {
    rosszak.push({ idxs: nyC.idxs, uzenet: 'Az α a legnagyobb érték súlya, az 1 − α a legkisebbé – nem fordítva.', ellenproba: `Ellenpróba: α = ${f(alfa, 2)}, a legnagyobb érték súlya ${f(alfa, 2)}, a legkisebbé ${f(1 - alfa, 2)}; felcserélve a(z) ${T.sorok[nyC.idxs[0]]} jönne ki ${f(nyC.cel, 2)} értékkel, ami hibás.` });
  }
  const kiemelt = new Set(T.E.flatMap((s, i) => {
    const mx = max(s), mn = min(s);
    return [`${i},${s.indexOf(mx)}`, `${i},${s.indexOf(mn)}`];
  }));
  const kepl = (i) => `${f(alfa, 2)} · ${fz(max(T.E[i]), 0)} + ${f(1 - alfa, 2)} · ${fz(min(T.E[i]), 0)}`;
  return {
    szoveg: tablaSzoveg(T, `A Hurwitz-elv szerint döntünk, α = ${f(alfa, 2)} (a legnagyobb érték súlya).`) + ` ${kerd.dontes(T)}`,
    mezok: [
      dontesMezo(rng, T, ny.idxs, ertekek, 'Melyik döntés?', { rosszak }),
      ertekMezo(T, ny.cel, {
        cimke: 'A döntő érték: a legnagyobb Hurwitz-érték', ellen: ertekEllen(T, ertekek, ny, 'legnagyobb'),
        hibak: [
          { ertek: elsoUtolso[i0], uzenet: 'A sor legnagyobb és legkisebb értékét vegye, bárhol vannak – nem az első és az utolsó oszlopét.' },
          { ertek: csereltAlfa[i0], uzenet: 'Az α a legnagyobb érték súlya, az 1 − α a legkisebbé – nem fordítva.' },
        ],
      }),
    ],
    tippek: [
      `Mi a sorok legjobb és legrosszabb értéke, és melyik súlya α = ${f(alfa, 2)}?`,
      `Hurwitz-elv: soronként α · maximum + (1 − α) · minimum, ahol α = ${f(alfa, 2)} és 1 − α = ${f(1 - alfa, 2)}. A maximum és a minimum a sor bármelyik oszlopában lehet.`,
      `Például ${T.sorok[i0]}: ${kepl(i0)} = ${f(ertekek[i0], 2)}.`,
    ],
    megoldas: [
      `Soronként α · max + (1 − α) · min, α = ${f(alfa, 2)}: ${T.sorok.map((n, i) => `${n}: ${kepl(i)} = ${f(ertekek[i], 2)}`).join('; ')}.`,
      `A legnagyobb: ${f(ny.cel, 2)} → <strong>${nevekSzoveg(T, ny.idxs)}</strong>${ny.idxs.length === 2 ? ' (holtverseny)' : ''}, a döntő érték <strong>${f(ny.cel, 2)} ${T.egyseg}</strong>.`,
    ],
    magyarazat: [
      `Azt kérdezik, melyik döntés a legjobb a Hurwitz-elv szerint α = ${f(alfa, 2)} mellett. Ez az elv az optimista és a pesszimista szemlélet keveréke.`,
      `Minden sorban megkeressük a legnagyobb (a legjobb) és a legkisebb (a legrosszabb) értéket, bárhol vannak a sorban. A legjobbat α = ${f(alfa, 2)}, a legrosszabbat 1 − α = ${f(1 - alfa, 2)} súllyal vesszük: ${T.sorok.map((n, i) => `${n}: ${f(ertekek[i], 2)}`).join('; ')}.`,
      `A legnagyobb érték ${f(ny.cel, 2)} ${T.egyseg}: a(z) ${nevekSzoveg(T, ny.idxs)}${ny.idxs.length === 2 ? ' (holtverseny, „X vagy Y”)' : ''}.`,
      `Képzelje el, hogy a 100 helyzetből ${f(100 * alfa, 0)} a legkedvezőbb, ${f(100 * (1 - alfa), 0)} a legkedvezőtlenebb kimenetelt hozza: a(z) ${nevekSzoveg(T, [i0])} sorában ez ${f(100 * ertekek[i0], 1)} ${T.egyseg} összesen, vagyis helyzetenként ${f(ertekek[i0], 2)}.`,
      `Józan ésszel: a Hurwitz-érték a sor legkisebb és legnagyobb eleme közé esik (${f(min(T.E[i0]), 0)} és ${f(max(T.E[i0]), 0)} között), és ${f(ertekek[i0], 2)} ide esik ✓. Ha α = 1, az optimista, ha α = 0, a pesszimista elvet kapnánk.`,
    ],
    abraMegoldas: tablaHtml(T, { kiemelt, valasztott: new Set(ny.idxs), extraCim: 'érték', extra: ertekek.map((v) => f(v, 2)), caption: 'Soronként a legnagyobb és a legkisebb érték kiemelve (érték = α · max + (1 − α) · min), a választott sor jelölve.' }),
    jegyezze: 'Hurwitz: soronként α · maximum + (1 − α) · minimum (a maximum és a minimum a sor bármelyik oszlopában lehet), a legnagyobb döntés.',
  };
}

// =====================================================================
// D8 – melyik elv? (választós)
// =====================================================================
const LEIRASOK = {
  optimista: [
    'Egy bátor vállalkozó soronként a legnagyobb nyereséget nézi, és azt a döntést választja, ahol ez a legnagyobb.',
    'A döntéshozó mindig a legkedvezőbb körülményre számít, ezért soronként a maximumot veszi, és ezek közül a legnagyobbat választja.',
  ],
  pesszimista: [
    'Egy óvatos döntéshozó soronként a legrosszabb kimenetelt nézi, és a legkevésbé rosszat választja.',
    'A döntéshozó biztonságra törekszik: soronként a minimumot veszi, és ezek közül a legnagyobbat választja.',
  ],
  elmulasztott: [
    'A döntéshozó azt akarja elkerülni, hogy utólag megbánja a döntést: oszloponként a legjobbhoz méri az értékeket, soronként a legnagyobb elmaradást nézi, és a legkisebbet választja.',
    'Veszteségtáblát készítünk (oszlopmaximum − érték), soronként a legnagyobb értéket keressük, és ezek közül a legkisebbet választjuk.',
  ],
  laplace: [
    'A döntéshozó nem tudja, melyik körülmény valószínűbb, ezért mindet egyformán valószínűnek veszi, és soronként számtani átlagot számol.',
    'Minden körülményt azonos súllyal veszünk figyelembe: soronként az értékek átlagát számoljuk, és a legnagyobbat választjuk.',
  ],
  bayes: [
    'Ismertek a körülmények valószínűségei, ezért soronként súlyozott átlagot, vagyis várható értéket számolunk, és a legnagyobbat választjuk.',
    'Minden nyereséget megszorzunk a körülmény megadott valószínűségével, soronként összeadjuk, és a legnagyobb összeget adó döntést választjuk.',
  ],
  hurwitz: [
    'A döntéshozó a legjobb és a legrosszabb kimenetelt is figyelembe veszi: soronként α · maximum + (1 − α) · minimum a mérce.',
    'Optimizmus és óvatosság keveréke: a sor legnagyobb értékét α, a legkisebbet 1 − α súllyal vesszük, és a legnagyobb összeget választjuk.',
  ],
};
const ELV_SORREND = ['optimista', 'pesszimista', 'elmulasztott', 'laplace', 'bayes', 'hurwitz'];
const ELV_ROVID = {
  optimista: 'a sorok maximuma, ezek közül a legnagyobb',
  pesszimista: 'a sorok minimuma, ezek közül a legnagyobb',
  elmulasztott: 'a legnagyobb elmaradások közül a legkisebb',
  laplace: 'soronként a számtani átlag',
  bayes: 'soronként a valószínűségekkel súlyozott átlag (várható érték)',
  hurwitz: 'α · maximum + (1 − α) · minimum',
};
function D8(rng) {
  const kulcs = valaszt(rng, ELV_SORREND);
  const leiras = valaszt(rng, LEIRASOK[kulcs]);
  // egy kis példasor, amelyen az elvek különböznek (a magyarázathoz)
  const sor = [20, 1, -6];
  const peldaErtek = { optimista: 20, pesszimista: -6, laplace: 5, hurwitz: tisztit(0.2 * 20 + 0.8 * -6), bayes: tisztit(20 * 0.5 + 1 * 0.3 + -6 * 0.2) };
  const nevek = ELV_SORREND.map((k) => ({ optimista: 'Optimista', pesszimista: 'Pesszimista', elmulasztott: 'Elmulasztott nyereség', laplace: 'Laplace', bayes: 'Bayes', hurwitz: 'Hurwitz' })[k]);
  const helyes = ELV_SORREND.indexOf(kulcs);
  const peldaMondat = (k) => (k === 'elmulasztott' ? 'az egész táblázat veszteségtábláját használja' : `ezt az értéket számolja: ${f(peldaErtek[k], 1)}`);
  return {
    szoveg: `${leiras} Melyik elvről van szó?`,
    mezok: [valasztoMezo({
      id: 'elv', cimke: 'Melyik elv?',
      opciok: nevek.map((sz, i) => (i === helyes ? { szoveg: sz, helyes: true }
        : {
          szoveg: sz, helyes: false,
          uzenet: `Nem a(z) ${sz} elvről van szó: annak a lényege az, hogy ${ELV_ROVID[ELV_SORREND[i]]}.`,
          ellenproba: `Ellenpróba: egy 20, 1, −6 értékű sorra a(z) ${sz} elv ${peldaMondat(ELV_SORREND[i])}, a leírt elv viszont ${peldaMondat(kulcs)}.`,
        })),
    })],
    tippek: [
      'Mit nézünk egy sorban: a legnagyobbat, a legkisebbet vagy az összes értéket? Ismertek-e a valószínűségek?',
      'Elvek: optimista (max), pesszimista (min), elmulasztott nyereség (veszteségtábla), Laplace (átlag), Bayes (súlyozott átlag), Hurwitz (α · max + (1 − α) · min).',
    ],
    megoldas: [`A leírás szerint ${ELV_ROVID[kulcs]} → <strong>${nevek[helyes]}</strong> elv.`],
    magyarazat: [
      `Azt kérdezik, melyik döntési elvre illik a leírás. Ehhez azt kell megnézni, mit tesz a döntéshozó egy táblázatsorral.`,
      `A leírás szerint ${ELV_ROVID[kulcs]}. Ez a(z) ${nevek[helyes]} elv ismertetőjele.`,
      `Példa egy 20, 1, −6 értékű sorral: az optimista értéke ${f(peldaErtek.optimista, 0)}, a pesszimistáé ${f(peldaErtek.pesszimista, 0)}, a Laplace-elvé ${f(peldaErtek.laplace, 0)}, a Bayes-elvé (50 / 30 / 20 % valószínűséggel) ${f(peldaErtek.bayes, 1)}, a Hurwitz-elvé (α = 0,2 mellett) ${f(peldaErtek.hurwitz, 1)}. Az elmulasztott nyereséghez az egész táblázat kell, mert oszlopokat is össze kell hasonlítani.`,
      `Józan ésszel: a „bátor” az optimista, az „óvatos” a pesszimista, az „egyformán valószínű” a Laplace, a „megadott valószínűségek” a Bayes, a „megbánás” az elmulasztott nyereség, az „α és 1 − α” a Hurwitz ✓.`,
    ],
    jegyezze: 'Elvek: optimista = max; pesszimista = min; elmulasztott nyereség = veszteségtábla; Laplace = átlag; Bayes = súlyozott átlag; Hurwitz = α · max + (1 − α) · min.',
  };
}

// =====================================================================
// Kidolgozott példák (SPEC 5.10, ellenőrzött értékek)
// =====================================================================
const GABONA = { helyzet: HELYZETEK[0], sorok: ['napraforgó', 'búza', 'lucerna', 'rizs'], oszlopok: ['napos', 'átlagos', 'esős'], egyseg: 'millió Ft', E: [[20, 1, -6], [9, 8, 0], [4, 4, 4], [3, 6, 8]] };
const KERT = { helyzet: HELYZETEK[1], sorok: ['saláta', 'borsó', 'retek', 'paradicsom'], oszlopok: ['fagyos', 'átlagos', 'napos'], egyseg: 'ezer Ft', E: [[50, 250, 330], [120, 200, 300], [80, 160, 200], [20, 220, 450]] };
const GABONA_VALSZ = [0.5, 0.3, 0.2], KERT_VALSZ = [0.2, 0.45, 0.35];
const gabonaAbra = () => tablaHtml(GABONA, { caption: 'Gabona – a döntési táblázat (millió Ft).' });
const kertAbra = () => tablaHtml(KERT, { caption: 'Kertes gazda – a döntési táblázat (ezer Ft).' });
const gabonaVeszt = () => tablaHtml(GABONA, { cellak: veszteségTabla(GABONA.E), bal: 'Veszteségtábla', extraCim: 'elm.', extra: sorErtekek('elmulasztott', GABONA.E).map((v) => f(v, 0)), valasztott: new Set([1]), caption: 'Gabona – a veszteségtábla; a legkisebb legnagyobb elmaradás a búzáé.' });

export default {
  id: 'donteselmelet',
  cim: 'Döntéselmélet',
  rovid: 'Döntési táblázat és döntési elvek: optimista, pesszimista, elmulasztott nyereség, Laplace, Bayes, Hurwitz.',
  kulcskeplet: '<span class="keplet-nagy">Döntési táblázat: sorok = döntések, oszlopok = körülmények</span>',
  kulcsMagyarazat: [
    'A cellákban a <strong>nyereség</strong> van; <strong>elvenként más döntés</strong> születhet.',
    '<strong>Optimista (maximax):</strong> soronként a maximum, ezek közül a legnagyobb. <strong>Pesszimista:</strong> soronként a minimum, ezek közül a legnagyobb. <strong>Elmulasztott nyereség:</strong> oszloponként oszlopmaximum − érték; soronként a legnagyobb elmaradás; ezek közül a <strong>legkisebb</strong>.',
    '<strong>Laplace:</strong> soronként számtani átlag, a legnagyobb. <strong>Bayes:</strong> soronként várható érték a megadott valószínűségekkel (a hiányzót 100 %-ra egészítjük ki), a legnagyobb. <strong>Hurwitz (α):</strong> soronként α · max + (1 − α) · min, a legnagyobb.',
  ],
  elmelet: [
    'Egy <strong>döntési táblázatban</strong> a sorok a döntések, az oszlopok a körülmények, a cellák a nyereségek. A döntést az <strong>elv</strong> dönti el – józan ésszel is kitalálható, érdemes vitával kezdeni: ki mit választana, és miért?',
    'Az <strong>optimista</strong> elv a gyakorlóban szerepelhet, de nem vizsgaanyag.',
    'A <strong>Bayes</strong>-elv a legracionálisabb, ha ismertek a gyakoriságok (valószínűségek).',
    '<strong>Holtversenynél</strong> a válasz „X vagy Y” (például „búza vagy rizs”).',
    'A Hurwitz-elv α-tól való függését (grafikon) nem kell tudni.',
  ],
  peldak: [
    {
      cim: 'Gabona – hat elv ugyanarra a táblázatra', feladat: 'Egy gazdálkodó négy növény közül választ; a nyereség (millió Ft) az időjárástól függ (napos / átlagos / esős). Melyik döntést választja az optimista, a pesszimista, az elmulasztott nyereség, a Laplace, a Bayes (50 / 30 / 20 %) és a Hurwitz (α = 0,2) elv szerint?',
      abra: gabonaAbra,
      lepesek: [
        '<strong>Optimista:</strong> soronként a maximum: 20; 9; 4; 8 → a legnagyobb 20 → <strong>napraforgó</strong>.',
        '<strong>Pesszimista:</strong> soronként a minimum: −6; 0; 4; 3 → a legnagyobb 4 → <strong>lucerna</strong>.',
        '<strong>Elmulasztott nyereség:</strong> oszlopmaximumok: 20; 8; 8. Legnagyobb elmaradás soronként: <strong>14 · 11 · 16 · 17</strong> → a legkisebb 11 → <strong>búza</strong>.',
        '<strong>Laplace:</strong> soronkénti átlag: <strong>5 · 17/3 · 4 · 17/3</strong> → a legnagyobb 17/3 (≈ 5,67) → <strong>búza vagy rizs</strong> (holtverseny).',
        '<strong>Bayes</strong> (50 / 30 / 20 %): <strong>9,1 · 6,9 · 4 · 4,9</strong> → <strong>napraforgó</strong>.',
        '<strong>Hurwitz</strong> (α = 0,2): <strong>−0,8 · 1,8 · 4 · 4</strong> → a legnagyobb 4 → <strong>lucerna vagy rizs</strong> (holtverseny).',
      ],
    },
    {
      cim: 'Gabona – a veszteségtábla részletesen', feladat: 'Számolja ki a gabonás példa veszteségtábláját (elmulasztott nyereség), és válassza ki a legjobb döntést!',
      abra: gabonaVeszt,
      lepesek: [
        'Oszlopmaximumok: napos 20, átlagos 8, esős 8.',
        'Veszteségtábla (oszlopmaximum − érték): napraforgó 0 · 7 · 14; búza 11 · 0 · 8; lucerna 16 · 4 · 4; rizs 17 · 2 · 0. Negatív értéknél: 8 − (−6) = <strong>14</strong>.',
        'Soronként a legnagyobb elmaradás: 14 · 11 · 16 · 17. Ezek veszteségek, ezért a <strong>legkisebbet</strong> választjuk: 11 → <strong>búza</strong>.',
      ],
    },
    {
      cim: 'Kertes gazda', feladat: 'Egy kertes gazda négy zöldség közül választ; a bevétel (ezer Ft) fagyos / átlagos / napos tavasztól függ. Melyik döntést választja a pesszimista, az optimista, a Laplace, a Bayes (20 / 45 / 35 %), az elmulasztott nyereség és a Hurwitz (α = 0,3) elv szerint?',
      abra: kertAbra,
      lepesek: [
        '<strong>Pesszimista:</strong> soronként a minimum: 50; 120; 80; 20 → a legnagyobb 120 → <strong>borsó</strong>.',
        '<strong>Optimista:</strong> soronként a maximum: 330; 300; 200; 450 → <strong>paradicsom</strong> (450).',
        '<strong>Laplace:</strong> soronkénti átlag: 210; 206,67; 146,67; <strong>230</strong> → <strong>paradicsom</strong>.',
        '<strong>Bayes</strong> (20 / 45 / 35 %): <strong>238 · 219 · 158 · 260,5</strong> → <strong>paradicsom</strong>.',
        '<strong>Elmulasztott nyereség:</strong> legnagyobb elmaradás soronként <strong>120 · 150 · 250 · 100</strong> → a legkisebb 100 → <strong>paradicsom</strong>.',
        '<strong>Hurwitz</strong> (α = 0,3): <strong>134 · 174 · 116 · 149</strong> → a legnagyobb 174 → <strong>borsó</strong>.',
      ],
    },
  ],
  tipusok: [
    { id: 'D1', nev: 'Optimista elv', general: D1, tesztbe: false },
    { id: 'D2', nev: 'Pesszimista elv', general: D2 },
    { id: 'D3', nev: 'Elmulasztott nyereség – a veszteségtábla cellái', general: D3 },
    { id: 'D4', nev: 'Elmulasztott nyereség – a döntés', general: D4 },
    { id: 'D5', nev: 'Laplace-elv', general: D5 },
    { id: 'D6', nev: 'Bayes-elv', general: D6 },
    { id: 'D7', nev: 'Hurwitz-elv', general: D7 },
    { id: 'D8', nev: 'Melyik elv? (választós)', general: D8, tesztbe: false },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva (a döntés kódja: bitmaszk, 1 = 1. sor, 2 = 2. sor, 4 = 3., 8 = 4.). */
  peldaEllenorzes() {
    const kod = (elv, T, par) => nyertesek(elv, sorErtekek(elv, T.E, par)).idxs.reduce((a, i) => a + 2 ** i, 0);
    const ert = (elv, T, par) => sorErtekek(elv, T.E, par);
    const kElotag = { alfa: 0.3, valsz: KERT_VALSZ };
    return [
      { nev: '1. példa: optimista → napraforgó', kapott: kod('optimista', GABONA), vart: 1 },
      { nev: '1. példa: pesszimista → lucerna', kapott: kod('pesszimista', GABONA), vart: 4 },
      { nev: '1. példa: elmulasztott nyereség 14', kapott: ert('elmulasztott', GABONA)[0], vart: 14 },
      { nev: '1. példa: elmulasztott nyereség 11', kapott: ert('elmulasztott', GABONA)[1], vart: 11 },
      { nev: '1. példa: elmulasztott nyereség 16', kapott: ert('elmulasztott', GABONA)[2], vart: 16 },
      { nev: '1. példa: elmulasztott nyereség 17', kapott: ert('elmulasztott', GABONA)[3], vart: 17 },
      { nev: '1. példa: elmulasztott nyereség → búza', kapott: kod('elmulasztott', GABONA), vart: 2 },
      { nev: '1. példa: Laplace napraforgó', kapott: ert('laplace', GABONA)[0], vart: 5 },
      { nev: '1. példa: Laplace búza', kapott: Math.round(ert('laplace', GABONA)[1] * 3), vart: 17 },
      { nev: '1. példa: Laplace → búza vagy rizs', kapott: kod('laplace', GABONA), vart: 10 },
      { nev: '1. példa: Bayes napraforgó', kapott: ert('bayes', GABONA, { valsz: GABONA_VALSZ })[0], vart: 9.1 },
      { nev: '1. példa: Bayes búza', kapott: ert('bayes', GABONA, { valsz: GABONA_VALSZ })[1], vart: 6.9 },
      { nev: '1. példa: Bayes rizs', kapott: ert('bayes', GABONA, { valsz: GABONA_VALSZ })[3], vart: 4.9 },
      { nev: '1. példa: Bayes → napraforgó', kapott: kod('bayes', GABONA, { valsz: GABONA_VALSZ }), vart: 1 },
      { nev: '1. példa: Hurwitz napraforgó', kapott: ert('hurwitz', GABONA, { alfa: 0.2 })[0], vart: -0.8 },
      { nev: '1. példa: Hurwitz búza', kapott: ert('hurwitz', GABONA, { alfa: 0.2 })[1], vart: 1.8 },
      { nev: '1. példa: Hurwitz → lucerna vagy rizs', kapott: kod('hurwitz', GABONA, { alfa: 0.2 }), vart: 12 },
      { nev: '2. példa: pesszimista → borsó', kapott: kod('pesszimista', KERT), vart: 2 },
      { nev: '2. példa: pesszimista érték', kapott: Math.max(...ert('pesszimista', KERT)), vart: 120 },
      { nev: '2. példa: optimista → paradicsom', kapott: kod('optimista', KERT), vart: 8 },
      { nev: '2. példa: optimista érték', kapott: Math.max(...ert('optimista', KERT)), vart: 450 },
      { nev: '2. példa: Laplace érték', kapott: Math.max(...ert('laplace', KERT)), vart: 230 },
      { nev: '2. példa: Laplace → paradicsom', kapott: kod('laplace', KERT), vart: 8 },
      { nev: '2. példa: Bayes saláta', kapott: ert('bayes', KERT, kElotag)[0], vart: 238 },
      { nev: '2. példa: Bayes borsó', kapott: ert('bayes', KERT, kElotag)[1], vart: 219 },
      { nev: '2. példa: Bayes retek', kapott: ert('bayes', KERT, kElotag)[2], vart: 158 },
      { nev: '2. példa: Bayes paradicsom', kapott: ert('bayes', KERT, kElotag)[3], vart: 260.5 },
      { nev: '2. példa: Bayes → paradicsom', kapott: kod('bayes', KERT, kElotag), vart: 8 },
      { nev: '2. példa: elmulasztott nyereség 120', kapott: ert('elmulasztott', KERT)[0], vart: 120 },
      { nev: '2. példa: elmulasztott nyereség 150', kapott: ert('elmulasztott', KERT)[1], vart: 150 },
      { nev: '2. példa: elmulasztott nyereség 250', kapott: ert('elmulasztott', KERT)[2], vart: 250 },
      { nev: '2. példa: elmulasztott nyereség 100', kapott: ert('elmulasztott', KERT)[3], vart: 100 },
      { nev: '2. példa: elmulasztott nyereség → paradicsom', kapott: kod('elmulasztott', KERT), vart: 8 },
      { nev: '2. példa: Hurwitz saláta', kapott: ert('hurwitz', KERT, kElotag)[0], vart: 134 },
      { nev: '2. példa: Hurwitz borsó', kapott: ert('hurwitz', KERT, kElotag)[1], vart: 174 },
      { nev: '2. példa: Hurwitz retek', kapott: ert('hurwitz', KERT, kElotag)[2], vart: 116 },
      { nev: '2. példa: Hurwitz paradicsom', kapott: ert('hurwitz', KERT, kElotag)[3], vart: 149 },
      { nev: '2. példa: Hurwitz → borsó', kapott: kod('hurwitz', KERT, kElotag), vart: 2 },
    ].map((x) => ({ ...x, kapott: Math.round(x.kapott * 1e6) / 1e6 }));
  },
};
