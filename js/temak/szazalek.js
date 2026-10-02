// 1. téma – Százalékszámítás
import { egesz, valaszt, lepeskoz } from '../lib/rng.js';
import { szep, kerekit } from '../lib/szam.js';
import { szamMezo } from '../lib/ellenorzo.js';
import { probal, f, fe, az, Az, tisztit } from './seged.js';

// ---- Tiszta számolófüggvények (a példák ellenőrzéséhez is) ----
export const szorzo = (p, irany = 1) => tisztit(1 + (irany * p) / 100);
export const ujErtek = (P0, p, irany = 1) => tisztit(P0 * szorzo(p, irany));
export const regiErtek = (P1, p, irany = 1) => tisztit(P1 / szorzo(p, irany));
/** Előjeles változás %-ban: (P₁/P₀ − 1)·100 */
export const valtozas = (P0, P1) => tisztit((P1 / P0 - 1) * 100);
/** Több egymás utáni változás (előjeles %-ok) összesített előjeles változása %-ban. */
export const osszetett = (szazalekok) => tisztit((szazalekok.reduce((q, p) => q * (1 + p / 100), 1) - 1) * 100);

/** A szállodás összetett feladat minden cellája. */
export function szalloda({ D0, s, d, fk, R1, g }) {
  const N0 = tisztit(D0 / (s / 100));
  const K0 = tisztit(N0 - D0);
  const D1 = ujErtek(D0, d, -1);
  const K1 = ujErtek(K0, fk, 1);
  const N1 = tisztit(D1 + K1);
  const V = valtozas(N0, N1);
  const R0 = regiErtek(R1, g, 1);
  const r0 = tisztit(R0 / N0);
  const r1 = tisztit(R1 / N1);
  const vr = valtozas(r0, r1);
  return { N0, K0, D1, K1, N1, V, R0, r0, r1, vr };
}

// k: árkategória (0: 10–99, 1: 100–995, 2: 1000–5000)
const TARGYAK = [
  { nev: 'tankönyv', e: '$', k: 0 }, { nev: 'hátizsák', e: '€', k: 0 }, { nev: 'esernyő', e: '€', k: 0 },
  { nev: 'póló', e: '$', k: 0 }, { nev: 'kabát', e: '$', k: 1 }, { nev: 'sportcipő', e: '$', k: 1 },
  { nev: 'kávéfőző', e: '€', k: 1 }, { nev: 'telefon', e: '$', k: 1 }, { nev: 'kerékpár', e: '€', k: 1 },
  { nev: 'mosógép', e: '€', k: 2 }, { nev: 'laptop', e: '€', k: 2 }, { nev: 'televízió', e: '$', k: 2 },
];

function ar(rng, k) {
  if (k === 0) return egesz(rng, 10, 99);
  if (k === 1) return 5 * egesz(rng, 20, 199);
  return 50 * egesz(rng, 20, 100);
}
/** p: 2–40 %, többnyire egész, néha fél. */
function szazalekLab(rng) {
  return rng() < 0.7 ? egesz(rng, 2, 40) : lepeskoz(rng, 2.5, 39.5, 1);
}

const novSzo = (irany) => (irany > 0 ? 'nőtt' : 'csökkent');
const qKeplet = (p, irany) => `q = 1 ${irany > 0 ? '+' : '−'} ${f(p)}/100 = ${f(szorzo(p, irany), 4)}`;

// ---- T1 / T4: új érték ----
function ujErtekTipus(irany) {
  return (rng) => probal(() => {
    const t = valaszt(rng, TARGYAK);
    const P0 = ar(rng, t.k);
    const p = szazalekLab(rng);
    const q = szorzo(p, irany);
    const P1 = ujErtek(P0, p, irany);
    if (!szep(P1, 2)) return null;
    const valt = tisztit((P0 * p) / 100);
    const szazalekos = irany > 0 ? 100 + p : 100 - p;
    return {
      szoveg: irany > 0
        ? `Egy ${t.nev} ára ${fe(P0, t.e)} volt, az árát ${f(p)} %-kal emelték. Mennyi az új ár?`
        : `Egy ${t.nev} ára ${fe(P0, t.e)} volt, az árát ${f(p)} %-kal csökkentették. Mennyi az új ár?`,
      mezok: [szamMezo({
        cimke: 'Új ár (P₁)', helyes: P1, tizedes: 2, egyseg: t.e,
        ellenproba: (w) => `Ellenpróba: ha az új ár ${fe(w, t.e)} lenne, akkor visszaszámolva ${f(w)} : ${f(q, 4)} = ${f(w / q)} ${t.e} jönne ki régi árnak – de a régi ár ${fe(P0, t.e)} volt.`,
        hibak: [{
          ertek: valt,
          uzenet: irany > 0
            ? 'Ez csak a növekedés, az új ár a régi + növekedés. Egy lépésben: P₁ = P₀ · q.'
            : 'Ez csak a csökkenés mértéke; az új ár a régi − csökkenés. Egy lépésben: P₁ = P₀ · q.',
        }, {
          ertek: ujErtek(P0, p, -irany),
          uzenet: irany > 0
            ? 'Növekedésnél a szorzó 1-nél nagyobb: q = 1 + p/100.'
            : 'Csökkenésnél a szorzó 1-nél kisebb: q = 1 − p/100.',
        }],
      })],
      tippek: [
        'Ki a 100 %? Melyik szám az, amihez a százalékot viszonyítjuk – és új vagy régi értéket keresünk?',
        `Új értéket keres → szorzás: P₁ = P₀ · q. A 100 % a régi ár: P₀ = ${fe(P0, t.e)}.`,
        `${qKeplet(p, irany)}, tehát P₁ = ${f(P0)} · ${f(q, 4)}.`,
      ],
      megoldas: [
        `Ki a 100 %? A régi ár: P₀ = ${fe(P0, t.e)}.`,
        `${irany > 0 ? 'Növekedés' : 'Csökkenés'} ${f(p)} %-kal → ${qKeplet(p, irany)}.`,
        `Új értéket keresünk → szorzás: P₁ = P₀ · q = ${f(P0)} · ${f(q, 4)} = <strong>${fe(P1, t.e)}</strong>.`,
      ],
      magyarazat: [
        `Az új árat keressük. A régi ár, ${fe(P0, t.e)}, a 100 % – ehhez viszonyítjuk ${az(p)} %-os ${irany > 0 ? 'emelést' : 'csökkentést'}.`,
        irany > 0
          ? `Az emelés után nemcsak a régi árat fizetjük, hanem még a ${f(p)} %-át is: összesen a régi ár ${f(100 + p)} %-át (100 % + ${f(p)} %).`
          : `A csökkentés után a régi árnak már csak egy részét fizetjük: a ${f(p)} %-ot elvesszük a 100 %-ból, így a régi ár ${f(100 - p)} %-a marad (100 % − ${f(p)} %).`,
        `Képzelje el, hogy a régi ár 100 ${t.e} volt: akkor most ${f(szazalekos)} ${t.e}-t fizetnénk. Minden 100 ${t.e}-ból tehát ${f(szazalekos)} ${t.e} lesz, vagyis az ár ${f(q, 4)}-szorosára változik – ez a szorzó (q).`,
        `Új értéket keresünk, ezért szorzunk: ${f(P0)} · ${f(q, 4)} = ${f(P1)} ${t.e}. Egy lépésben megkapjuk a végeredményt – nem kell külön kiszámolni, hogy mennyi az ${irany > 0 ? 'emelés' : 'csökkentés'} (${f(valt)} ${t.e}).`,
        `Józan ésszel: ${irany > 0 ? 'emelés után drágább' : 'csökkentés után olcsóbb'} lett az áru, és a ${f(P1)} ${t.e} valóban ${irany > 0 ? 'több' : 'kevesebb'}, mint a ${f(P0)} ${t.e}. Visszaszámolva: ${f(P1)} : ${f(q, 4)} = ${f(P0)} ✓.`,
      ],
      jegyezze: 'Új értéket keres → szorzás: P₁ = P₀ · q, egy lépésben (nem kell külön kiszámolni a változást).',
    };
  });
}

// ---- T2 / T5: régi érték ----
function regiErtekTipus(irany) {
  return (rng) => probal(() => {
    const t = valaszt(rng, TARGYAK);
    const P0 = ar(rng, t.k);
    const p = szazalekLab(rng);
    const q = szorzo(p, irany);
    const P1 = ujErtek(P0, p, irany);
    if (!szep(P1, 2)) return null;
    const szaz = irany > 0 ? `(100 + ${f(p)}) % = ${f(100 + p)} %` : `(100 − ${f(p)}) % = ${f(100 - p)} %`;
    const szazErtek = irany > 0 ? 100 + p : 100 - p;
    const valtSzo = irany > 0 ? 'emelés' : 'engedmény';
    return {
      szoveg: irany > 0
        ? `Egy ${t.nev} árát ${f(p)} %-kal emelték, így most ${fe(P1, t.e)}. Mennyi volt az eredeti ára?`
        : `Egy ${t.nev} ára ${f(p)} %-os árengedmény után ${fe(P1, t.e)}. Mennyi volt az eredeti ára?`,
      mezok: [szamMezo({
        cimke: 'Eredeti ár (P₀)', helyes: P0, tizedes: 2, egyseg: t.e,
        ellenproba: (w) => `Ellenpróba: ha az eredeti ár ${fe(w, t.e)} lett volna, ${az(p)} %-os ${valtSzo} után ${f(w)} · ${f(q, 4)} = ${f(w * q)} ${t.e} lenne, nem ${fe(P1, t.e)}.`,
        hibak: [{
          ertek: ujErtek(P1, p, -irany),
          uzenet: irany > 0
            ? `A P₁ nem a 100 %, hanem a ${szaz}. Régi értéket keres → osztás: P₀ = P₁ : q.`
            : `A megadott ár már a ${szaz}. Régi értéket keres → osztás: P₀ = P₁ : q.`,
        }, {
          ertek: ujErtek(P1, p, irany),
          uzenet: 'Szorzott, pedig régi értéket keres → osztás (az ellenkező művelet): P₀ = P₁ : q.',
        }],
      })],
      tippek: [
        'Ki a 100 %? A megadott ár a 100 %, vagy annak csak egy része?',
        `Az eredeti ár (P₀) a 100 %, a megadott ${fe(P1, t.e)} a ${szaz}. Régi értéket keres → osztás: P₀ · q = P₁, ezért P₀ = P₁ : q.`,
        `${qKeplet(p, irany)}, tehát P₀ = ${f(P1)} : ${f(q, 4)}.`,
      ],
      megoldas: [
        `Az új ár P₁ = ${fe(P1, t.e)}, a szorzó: ${qKeplet(p, irany)}.`,
        `P₀ · q = P₁ → P₀ = P₁ : q (az ellenkező művelet: osztás).`,
        `P₀ = ${f(P1)} : ${f(q, 4)} = <strong>${fe(P0, t.e)}</strong>.`,
        `Ellenőrzés: ${f(P0)} · ${f(q, 4)} = ${f(P1)} ✓`,
      ],
      magyarazat: [
        `A régi, eredeti árat keressük – ez a 100 %. ${irany > 0 ? `Az emelés után nem a régi árat fizetjük, hanem annak a ${f(szazErtek)} %-át (100 % + ${f(p)} %)` : `Az engedmény után nem a teljes árat fizetjük, hanem annak csak a ${f(szazErtek)} %-át (100 % − ${f(p)} %)`}.`,
        `Képzelje el, hogy a régi ár 100 ${t.e} volt: akkor most ${f(szazErtek)} ${t.e}-t fizetnénk. A ${f(szazErtek)} ${t.e} tehát mindig ${irany > 0 ? 'több' : 'kevesebb'}, mint a régi ár.`,
        `Ezt tudjuk: a régi ár ${f(szazErtek)} %-a = ${f(P1)} ${t.e}. Ha a ${f(szazErtek)} %-ból akarunk visszajutni a 100 %-hoz, <strong>osztunk</strong> a szorzóval (${f(q, 4)}): ${f(P1)} : ${f(q, 4)} = ${f(P0)} ${t.e}.`,
        `Józan ésszel: ${irany > 0 ? 'emelés előtt olcsóbb' : 'engedmény előtt drágább'} volt, és a ${f(P0)} ${t.e} valóban ${irany > 0 ? 'kevesebb' : 'több'}, mint a ${f(P1)} ${t.e}. Visszaszámolva: ${f(P0)} · ${f(q, 4)} = ${f(P1)} ✓.`,
      ],
      jegyezze: 'Régi (eredeti) értéket keres → osztás: P₀ = P₁ : q. A megadott új érték nem a 100 %.',
    };
  });
}

// ---- T3 / T6: változás %-a ----
function valtozasTipus(irany) {
  return (rng) => probal(() => {
    const t = valaszt(rng, TARGYAK);
    const P0 = ar(rng, t.k);
    const p = szazalekLab(rng);
    const q = szorzo(p, irany);
    const P1 = ujErtek(P0, p, irany);
    if (!szep(P1, 2)) return null;
    const rosszAlap = Math.abs(valtozas(P1, P0));
    return {
      szoveg: `Egy ${t.nev} ára ${fe(P0, t.e)} volt, most ${fe(P1, t.e)}. Hány százalékkal ${novSzo(irany)} az ára?`,
      mezok: [szamMezo({
        cimke: irany > 0 ? 'Növekedés (%)' : 'Csökkenés (%)', helyes: p, tizedes: 1, egyseg: '%',
        elojel: irany > 0 ? 'sima' : 'nagysag',
        elojelUzenet: `Elfogadva. A csökkenés mértéke ${f(p)} %; a kérdés „mennyivel csökkent”, ezért elég ${az(p)}.`,
        ellenproba: (w) => `Ellenpróba: ha az ár ${f(w)} %-kal ${novSzo(irany)} volna, akkor ${f(P0)} · ${f(szorzo(w, irany), 4)} = ${f(ujErtek(P0, w, irany))} ${t.e} lenne az új ár, nem ${fe(P1, t.e)}.`,
        hibak: [irany > 0
          ? { ertek: tisztit(q * 100), uzenet: `Ez azt mutatja, hogy az új ár a régi hány százaléka (${f(q * 100)} %). A változás ennél 100-zal kevesebb.` }
          : { ertek: tisztit(q * 100), uzenet: `Ez azt mutatja, hány százaléka maradt meg a régi árnak (${f(q * 100)} %); a kérdés az, hány százalékkal csökkent: 100 − ${f(q * 100)}.` },
        { ertek: rosszAlap, uzenet: 'Ki a 100 %? A régi érték van a nevezőben (mint a ház alapja: lent): q = P₁ : P₀.' },
        { ertek: tisztit((P0 / P1) * 100), uzenet: 'Fordítva osztott: a régi érték (a 100 %) kerül a nevezőbe, q = P₁ : P₀.' },
        { ertek: tisztit(Math.abs(P1 - P0)), uzenet: 'Ez a változás összege pénzben, nem százalékban. Számolja ki a szorzót: q = P₁ : P₀.' }],
      })],
      tippek: [
        'Ki a 100 %? Melyik ár kerül a törtben a nevezőbe – a régi vagy az új?',
        `A régi ár, P₀ = ${fe(P0, t.e)} a 100 % – ez kerül a nevezőbe. Először a szorzó: q = P₁ : P₀, utána a változás: ` + (irany > 0 ? '(q − 1) · 100.' : '(1 − q) · 100.'),
        `q = ${f(P1)} : ${f(P0)} = ${f(q, 4)}.`,
      ],
      megoldas: [
        `A régi érték a 100 %: P₀ = ${fe(P0, t.e)}, az új érték P₁ = ${fe(P1, t.e)}.`,
        `q = P₁ : P₀ = ${f(P1)} : ${f(P0)} = ${f(q, 4)} (az új ár a régi ${f(q * 100)} %-a).`,
        irany > 0
          ? `(q − 1) · 100 = (${f(q, 4)} − 1) · 100 = <strong>${f(p)}</strong> → ${f(p)} %-kal nőtt.`
          : `(1 − q) · 100 = (1 − ${f(q, 4)}) · 100 = <strong>${f(p)}</strong> → ${f(p)} %-kal csökkent.`,
      ],
      magyarazat: [
        `Azt keressük, hány százalékkal ${novSzo(irany)} az ár. A százalék mindig valamihez viszonyít: itt a régi árhoz, a ${f(P0)} ${t.e}-hoz – ez a 100 %.`,
        `Megnézzük, hányszorosa az új ár a réginek: ${f(P1)} : ${f(P0)} = ${f(q, 4)}. Ez azt jelenti, hogy az új ár a régi ${f(q * 100)} %-a.`,
        `Képzelje el, hogy a régi ár 100 ${t.e} volt: akkor az új ár ${f(q * 100)} ${t.e} lenne. A 100-hoz képest ez ${f(p)} egységgel ${irany > 0 ? 'több' : 'kevesebb'}, ezért a változás ${f(p)} %.`,
        `Osztunk, mert a két ár arányát keressük, és a régi ár kerül lent (a nevezőbe), mint a ház alapja. Utána ${irany > 0 ? 'kivonunk 1-et (a 100 %-ot)' : 'az 1-ből vonjuk ki a hányadost'}, mert csak a változásra vagyunk kíváncsiak, nem arra, hogy hány százaléka az új ár a réginek.`,
        `Józan ésszel: az ár ${irany > 0 ? 'nőtt' : 'csökkent'}, ezért a ${f(q * 100)} % ${irany > 0 ? 'nagyobb' : 'kisebb'}, mint 100, és a változás ${f(p)} %. Visszaszámolva: ${f(P0)} · ${f(q, 4)} = ${f(P1)} ✓.`,
      ],
      jegyezze: '„Hány százaléka” ≠ „hány százalékkal változott”: q = P₁ : P₀, a változás (q − 1) · 100.',
    };
  });
}

// ---- T7 / T8 / T9: két egymás utáni változás ----
const SZOVEG_NOV = [
  (a, b) => `Egy vállalat forgalma az első évben ${a} %-kal, a második évben további ${b} %-kal nőtt.`,
  (a, b) => `Egy termék árát először ${a} %-kal, majd az új árat további ${b} %-kal emelték.`,
  (a, b) => `Egy lakás értéke az egyik évben ${a} %-kal, a következő évben ${b} %-kal nőtt.`,
];
const SZOVEG_CSOKK = [
  (a, b) => `Egy termék árát először ${a} %-kal, majd a csökkentett árat további ${b} %-kal csökkentették.`,
  (a, b) => `Egy autó értéke az első évben ${a} %-kal, a második évben ${b} %-kal csökkent.`,
  (a, b) => `Egy üzlet forgalma két egymást követő hónapban ${a} %-kal, majd ${b} %-kal esett vissza.`,
];
const SZOVEG_VEGYES = [
  (a, b) => `Egy részvény árfolyama hétfőn ${a} %-kal nőtt, kedden ${b} %-kal csökkent.`,
  (a, b) => `Egy termék árát először ${a} %-kal emelték, majd az új árat ${b} %-kal csökkentették.`,
  (a, b) => `Egy szálloda vendégszáma az egyik évben ${a} %-kal nőtt, a következő évben ${b} %-kal csökkent.`,
];

function ketValtozasTipus(fajta) {
  return (rng) => probal(() => {
    const p1 = egesz(rng, 2, 40);
    const p2 = egesz(rng, 2, 40);
    if ((p1 * p2) % 10 !== 0) return null; // így a végeredmény legfeljebb 1 tizedes
    const i1 = fajta === 'csokk' ? -1 : 1;
    const i2 = fajta === 'nov' ? 1 : -1;
    const q1 = szorzo(p1, i1), q2 = szorzo(p2, i2);
    const q = tisztit(q1 * q2);
    const valt = osszetett([i1 * p1, i2 * p2]);
    if (Math.abs(valt) < 0.5) return null;
    let szoveg, mezo, utolso, jegyezze, nevek;
    const szaz = `100 · ${f(q1, 4)} · ${f(q2, 4)} = ${f(q * 100, 2)}`;
    // ellenpróba: 100-ból indulva a két lépés tényleges eredménye vs. a hallgató összesített százaléka
    const ellen = (w) => {
      const vegso = fajta === 'csokk' ? `${f(-valt)} %-kal kevesebb` : `${f(Math.abs(valt))} %-kal ${valt < 0 ? 'kevesebb' : 'több'}`;
      const sajat = fajta === 'csokk' ? 100 - w : 100 + w;
      return `Ellenpróba: 100-ból indulva a két változás után ${szaz} lesz, vagyis ${vegso}. Ha a teljes változás ${f(w)} % lenne, a végeredmény ${f(sajat, 2)} lenne, nem ${f(q * 100, 2)}.`;
    };
    if (fajta === 'nov') {
      szoveg = valaszt(rng, SZOVEG_NOV)(p1, p2) + ' Összesen hány százalékkal nőtt a két változás alatt?';
      mezo = szamMezo({
        cimke: 'Összes növekedés (%)', helyes: valt, tizedes: 1, egyseg: '%', ellenproba: ellen,
        hibak: [{ ertek: p1 + p2, uzenet: 'A százalékokat nem adjuk össze, a szorzókat szorozzuk: q = q₁ · q₂.' },
          { ertek: tisztit(q * 100), uzenet: `Ez azt mutatja, hogy a végén az eredeti ${f(q * 100)} %-a lett; a növekedés ennél 100-zal kevesebb.` }],
      });
      utolso = `(q − 1) · 100 = (${f(q, 4)} − 1) · 100 = <strong>${f(valt)}</strong> → összesen ${f(valt)} %-kal nőtt.`;
      jegyezze = 'Többszöri változásnál a szorzókat összeszorozzuk, a százalékokat nem adjuk össze.';
      nevek = ['növekedés', 'növekedés'];
    } else if (fajta === 'csokk') {
      szoveg = valaszt(rng, SZOVEG_CSOKK)(p1, p2) + ' Összesen hány százalékkal csökkent?';
      mezo = szamMezo({
        cimke: 'Összes csökkenés (%)', helyes: -valt, tizedes: 1, egyseg: '%', elojel: 'nagysag', ellenproba: ellen,
        elojelUzenet: `Elfogadva. A csökkenés mértéke ${f(-valt)} %; a kérdés „mennyivel csökkent”, ezért elég ${az(-valt)}.`,
        hibak: [{ ertek: p1 + p2, uzenet: 'A százalékokat nem adjuk össze, a szorzókat szorozzuk: q = q₁ · q₂. A második csökkenés már a kisebb árból számolódik.' },
          { ertek: tisztit(q * 100), uzenet: `Ez azt mutatja, hány százaléka maradt meg (${f(q * 100)} %); a kérdés az, hány százalékkal csökkent.` }],
      });
      utolso = `(1 − q) · 100 = (1 − ${f(q, 4)}) · 100 = <strong>${f(-valt)}</strong> → összesen ${f(-valt)} %-kal csökkent.`;
      jegyezze = 'Két csökkenés után is a szorzókat szorozzuk; az összes csökkenés kevesebb, mint a két százalék összege.';
      nevek = ['csökkenés', 'csökkenés'];
    } else {
      szoveg = valaszt(rng, SZOVEG_VEGYES)(p1, p2) +
        ' Hány százalékos a teljes változás? (Előjellel adja meg: csökkenésnél negatív szám, pl. −4.)';
      mezo = szamMezo({
        cimke: 'Teljes változás (%), előjellel', helyes: valt, tizedes: 1, egyseg: '%', elojel: 'elojeles', ellenproba: ellen,
        hibak: [{ ertek: p1 - p2, uzenet: `A százalékokat nem lehet egyszerűen összevonni (${p1} − ${p2}). Például +20 % majd −20 % nem 0 %, hanem 1,2 · 0,8 = 0,96 → −4 %. Szorozza a szorzókat!` }],
      });
      utolso = `(q − 1) · 100 = (${f(q, 4)} − 1) · 100 = <strong>${f(valt)}</strong> → a teljes változás ${f(valt)} % (${valt < 0 ? 'csökkenés' : 'növekedés'}).`;
      jegyezze = 'Egy növekedés és egy ugyanakkora csökkenés nem oltja ki egymást: a szorzókat szorozzuk (1,2 · 0,8 = 0,96).';
      nevek = ['növekedés', 'csökkenés'];
    }
    const lepes1 = `Az első lépés ${p1} %-os ${nevek[0]}: a 100-ból ${f(100 * q1, 2)} lesz (szorzó: ${f(q1, 4)}).`;
    const lepes2 = `A második lépés ${p2} %-os ${nevek[1]}, de már az új értékre vonatkozik, nem a 100-ra: ${f(100 * q1, 2)} · ${f(q2, 4)} = ${f(100 * q, 2)}.`;
    return {
      szoveg,
      mezok: [mezo],
      tippek: [
        'Mivel kell megszorozni a kiinduló értéket az első változásnál, és mivel a másodiknál?',
        'Írja fel mindkét változás szorzóját (növekedés: 1 + p/100, csökkenés: 1 − p/100). A kiinduló érték mindegy – számoljon 100-ból.',
        `q = ${f(q1, 4)} · ${f(q2, 4)} = ${f(q, 4)}.`,
      ],
      megoldas: [
        `Szorzók: q₁ = ${f(q1, 4)}, q₂ = ${f(q2, 4)}.`,
        `q = q₁ · q₂ = ${f(q1, 4)} · ${f(q2, 4)} = ${f(q, 4)} (100-ból számolva: 100 · ${f(q, 4)} = ${f(q * 100)}).`,
        utolso,
      ],
      magyarazat: [
        `Azt keressük, mennyi a teljes változás a két lépés után. A kiinduló érték nem számít, ezért számoljunk 100-ból.`,
        lepes1,
        lepes2,
        `Miért szorzunk? Mert a második változás már az első után kialakult értékre vonatkozik – ezért nem adhatjuk össze a ${p1} %-ot és a ${p2} %-ot, hanem a két szorzót szorozzuk: ${f(q1, 4)} · ${f(q2, 4)} = ${f(q, 4)}.`,
        fajta === 'vegyes'
          ? `Józan ésszel: 100-ból ${f(q * 100, 2)} lett, vagyis a teljes változás ${f(valt)} %. A ${p1} − ${p2} = ${f(p1 - p2)} % hibás lenne, mert a két százalék nem ugyanarra az alapra vonatkozik.`
          : `Józan ésszel: 100-ból ${f(q * 100, 2)} lett, vagyis ${f(Math.abs(valt))} %-kal ${fajta === 'nov' ? 'nőtt' : 'csökkent'} az érték. Ez ${fajta === 'nov' ? 'több' : 'kevesebb'}, mint a két százalék összege (${p1 + p2} %), mert a második változás már a megváltozott értékre vonatkozik.`,
      ],
      jegyezze,
    };
  });
}

// ---- T10: szálloda (összetett, táblázatos) ----
function szallodaTipus(rng) {
  return probal(() => {
    const s = valaszt(rng, [20, 25, 30, 40, 50, 60]);
    const N0 = 100 * egesz(rng, 30, 120);
    const D0 = (N0 * s) / 100;
    const d = valaszt(rng, [10, 15, 20, 25, 30]);
    const fk = egesz(rng, 4, 20);
    const g = valaszt(rng, [4, 5, 6, 8, 10, 12, 15]);
    const r0 = 5 * egesz(rng, 16, 40);
    const K0 = N0 - D0;
    if ((D0 * (100 - d)) % 100 !== 0 || (K0 * (100 + fk)) % 100 !== 0) return null;
    const R1 = tisztit(r0 * N0 * (1 + g / 100));
    if (!szep(R1, 0)) return null;
    const c = szalloda({ D0, s, d, fk, R1, g });
    if (Math.abs(c.V) < 0.1 || Math.abs(c.vr) < 0.1) return null;
    const vrKerekbol = valtozas(c.r0, kerekit(c.r1, 1));
    return {
      szoveg: `Egy szálloda 2023-ban ${f(D0)} belföldi vendéget fogadott; a vendégek ${s} %-a volt belföldi. ` +
        `2024-ben ${d} %-kal kevesebb belföldi és ${fk} %-kal több külföldi vendég érkezett. ` +
        `2024-ben a szálloda bevétele ${fe(R1, '€')} volt, ${g} %-kal több, mint 2023-ban.`,
      utasitas: 'Töltse ki a táblázatot! A cellákat egyenként ellenőrizzük. (Vendégszám: egész szám; a bevétel/fő és a százalékok egy tizedesre.)',
      tablazat: true,
      mezok: [
        szamMezo({ id: 'N0', cimke: 'Összes vendég 2023-ban (fő)', helyes: c.N0, tizedes: 0, egyseg: 'fő',
          ellenproba: (w) => `Ellenpróba: ha 2023-ban összesen ${f(w)} vendég lett volna, a ${f(s)} %-uk ${f((w * s) / 100)} belföldi lenne, nem ${f(D0)}.`,
          hibak: [{ ertek: (D0 * s) / 100, uzenet: `${Az(D0)} belföldi vendég nem a 100 %, hanem ${az(s)} %. Az összes vendég a 100 % → osztás: ${f(D0)} : ${f(s / 100)}.` }] }),
        szamMezo({ id: 'K0', cimke: 'Külföldi vendég 2023-ban (fő)', helyes: c.K0, tizedes: 0, egyseg: 'fő',
          ellenproba: (w) => `Ellenpróba: ha ${f(w)} külföldi vendég volt, az összes vendég ${f(w)} + ${f(D0)} = ${f(w + D0)} lenne, és a belföldiek aránya ${f((D0 / (w + D0)) * 100, 1)} % – a feladat szerint ${f(s)} %.`,
          hibak: [{ ertek: D0, uzenet: 'Ez a belföldi vendégek száma. A külföldiek = összes vendég − belföldi vendég.' }] }),
        szamMezo({ id: 'D1', cimke: 'Belföldi vendég 2024-ben (fő)', helyes: c.D1, tizedes: 0, egyseg: 'fő',
          ellenproba: (w) => `Ellenpróba: ${f(D0)} → ${f(w)} vendég ${f(valtozas(D0, w), 1)} %-os változás lenne; a feladat szerint ${f(d)} %-kal kevesebb jött: ${f(D0)} · ${f(szorzo(d, -1), 4)} = ${f(c.D1)}.`,
          hibak: [{ ertek: (D0 * d) / 100, uzenet: 'Ez csak a csökkenés; a 2024-es érték: régi · q (q = 1 − p/100).' }] }),
        szamMezo({ id: 'K1', cimke: 'Külföldi vendég 2024-ben (fő)', helyes: c.K1, tizedes: 0, egyseg: 'fő',
          ellenproba: (w) => `Ellenpróba: ${f(c.K0)} → ${f(w)} vendég ${f(valtozas(c.K0, w), 1)} %-os változás lenne; a feladat szerint ${f(fk)} %-kal több jött: ${f(c.K0)} · ${f(szorzo(fk), 4)} = ${f(c.K1)}.`,
          hibak: [{ ertek: (K0 * fk) / 100, uzenet: 'Ez csak a növekedés; a 2024-es érték: régi · q (q = 1 + p/100).' }] }),
        szamMezo({ id: 'N1', cimke: 'Összes vendég 2024-ben (fő)', helyes: c.N1, tizedes: 0, egyseg: 'fő',
          ellenproba: (w) => `Ellenpróba: a két csoport együtt ${f(c.D1)} + ${f(c.K1)} = ${f(c.N1)} fő, nem ${f(w)}.`,
          hibak: [{ ertek: tisztit(c.D1 + c.K0), uzenet: 'A külföldi vendégek 2024-es létszámát (K₁) kell hozzáadni, nem a 2023-asat.' }] }),
        szamMezo({ id: 'V', cimke: 'Az összes vendégszám változása (%), előjellel', helyes: c.V, tizedes: 1, egyseg: '%', elojel: 'elojeles',
          ellenproba: (w) => `Ellenpróba: ha az összes vendégszám ${f(w)} %-kal változott, akkor ${f(c.N0)} · ${f(szorzo(w), 4)} = ${f(ujErtek(c.N0, w))} vendég lett volna 2024-ben, nem ${f(c.N1)}.`,
          hibak: [{ ertek: fk - d, uzenet: 'A két csoport százalékait nem vonjuk össze, mert különböző nagyságú csoportokra vonatkoznak. Hasonlítsa össze az összes vendégszámot: q = N₁ : N₀.' }] }),
        szamMezo({ id: 'R0', cimke: 'Bevétel 2023-ban (€)', helyes: c.R0, tizedes: 0, egyseg: '€',
          ellenproba: (w) => `Ellenpróba: ha 2023-ban ${fe(w, '€')} volt a bevétel, ${az(g)} %-os növekedés után ${f(w)} · ${f(szorzo(g), 4)} = ${f(w * szorzo(g))} € lenne 2024-ben, nem ${fe(R1, '€')}.`,
          hibak: [{ ertek: ujErtek(R1, g, -1), uzenet: `A 2024-es bevétel nem a 100 %, hanem ${az(100 + g)} %. Régi értéket keres → osztás: ${f(R1)} : ${f(szorzo(g), 4)}.` }] }),
        szamMezo({ id: 'r0', cimke: 'Egy vendégre jutó bevétel 2023-ban (€)', helyes: c.r0, tizedes: 1, egyseg: '€',
          ellenproba: (w) => `Ellenpróba: ${f(w, 2)} € vendégenként ${f(c.N0)} vendégnél ${f(w * c.N0)} € bevétel lenne, nem ${f(c.R0)} €.` }),
        szamMezo({ id: 'r1', cimke: 'Egy vendégre jutó bevétel 2024-ben (€)', helyes: c.r1, tizedes: 1, egyseg: '€',
          ellenproba: (w) => `Ellenpróba: ${f(w, 2)} € vendégenként ${f(c.N1)} vendégnél ${f(w * c.N1)} € bevétel lenne, nem ${f(R1)} €.` }),
        szamMezo({ id: 'vr', cimke: 'Az egy vendégre jutó bevétel változása (%), előjellel', helyes: c.vr, tizedes: 1, egyseg: '%', elojel: 'elojeles',
          alternativ: [vrKerekbol],
          ellenproba: (w) => `Ellenpróba: ha az egy vendégre jutó bevétel ${f(w)} %-kal változott, akkor ${f(c.r0, 2)} · ${f(szorzo(w), 4)} = ${f(c.r0 * szorzo(w), 2)} € lenne 2024-ben, nem ${f(c.r1, 2)} €.`,
          hibak: [{ ertek: g - c.V, uzenet: `A százalékokat itt sem vonjuk ki egymásból; a szorzókat osztjuk: ${f(szorzo(g), 4)} : ${f(c.N1 / c.N0, 4)}.` }] }),
      ],
      tippek: [
        'Ki a 100 %? Melyik számból tudjuk visszaszámolni az összes vendégszámot, és hogyan?',
        `Az összes vendég a 100 %. ${Az(D0)} belföldi ${az(s)} % → összes = ${f(D0)} : ${f(s / 100)}. Minden csoportnál a saját régi értéke a 100 %: új = régi · q. A bevételnél régi értéket keres → osztás.`,
        'Egy vendégre jutó bevétel = bevétel : vendégszám; a változás: (új : régi − 1) · 100.',
      ],
      megoldas: [
        `Összes vendég 2023: ${f(D0)} : ${f(s / 100)} = <strong>${f(c.N0)}</strong>; külföldi: ${f(c.N0)} − ${f(D0)} = <strong>${f(c.K0)}</strong>.`,
        `2024 belföldi: ${f(D0)} · ${f(szorzo(d, -1), 4)} = <strong>${f(c.D1)}</strong>; külföldi: ${f(c.K0)} · ${f(szorzo(fk), 4)} = <strong>${f(c.K1)}</strong>; összesen <strong>${f(c.N1)}</strong>.`,
        `Vendégszám változása: ${f(c.N1)} : ${f(c.N0)} = ${f(c.N1 / c.N0, 4)} → <strong>${f(c.V, 1)} %</strong>.`,
        `Bevétel 2023: ${f(R1)} : ${f(szorzo(g), 4)} = <strong>${fe(c.R0, '€')}</strong>.`,
        `Egy vendégre jutó bevétel: 2023: ${f(c.R0)} : ${f(c.N0)} = <strong>${fe(c.r0, '€', 1)}</strong>; 2024: ${f(R1)} : ${f(c.N1)} ≈ <strong>${fe(c.r1, '€', 1)}</strong>.`,
        `Változás: ${f(c.r1, 4)} : ${f(c.r0)} ≈ ${f(c.r1 / c.r0, 4)} → <strong>${f(c.vr, 1)} %</strong> (gyorsabban: ${f(szorzo(g), 4)} : ${f(c.N1 / c.N0, 4)}).`,
      ],
      magyarazat: [
        `Több kérdést kell egymás után megválaszolni, és minden lépésnél más a 100 %. Mindig azt kérdezzük: mihez viszonyítunk?`,
        `Az összes vendég számát keressük 2023-ban. ${Az(D0)} belföldi vendég nem az összes, hanem annak ${az(s)} %-a. Ha az összes vendég 100 lenne, ${f(s)} lenne a belföldi. Így ${az(D0)} belföldi vendég ${f(s)} %-ot jelent: összes = ${f(D0)} : ${f(s / 100)} = ${f(c.N0)}. A külföldiek a maradék: ${f(c.N0)} − ${f(D0)} = ${f(c.K0)}.`,
        `2024-ben a két csoport külön változik, ezért külön számolunk, mindegyiknél a saját 2023-as létszám a 100 %: belföldi ${f(D0)} · ${f(szorzo(d, -1), 4)} = ${f(c.D1)}, külföldi ${f(c.K0)} · ${f(szorzo(fk), 4)} = ${f(c.K1)}. A két csoport százalékait nem vonhatjuk össze, mert különböző nagyságú csoportokra vonatkoznak. Az összes vendég: ${f(c.N1)}.`,
        `A bevétel 2024-ben ${g} %-kal több a 2023-asnál, vagyis a 2024-es bevétel a 2023-asnak a ${f(100 + g)} %-a. Régi értéket keresünk, ezért osztunk: ${f(R1)} : ${f(szorzo(g), 4)} = ${f(c.R0)} €.`,
        `Az egy vendégre jutó bevétel a bevétel osztva a vendégek számával: 2023-ban ${f(c.R0)} : ${f(c.N0)} = ${f(c.r0, 1)} €, 2024-ben ${f(R1)} : ${f(c.N1)} ≈ ${f(c.r1, 1)} €. A változás ennek a két számnak a hányadosa: ${f(c.r1 / c.r0, 4)}, vagyis ${f(c.vr, 1)} %.`,
        `Józan ésszel: a vendégek száma ${c.V < 0 ? 'csökkent' : 'nőtt'}, a bevétel ${g} %-kal nőtt, ezért vendégenként ${c.vr > 0 ? 'többet' : 'kevesebbet'} költöttek (${f(c.vr, 1)} %). Gyors ellenőrzés: ${f(szorzo(g), 4)} : ${f(c.N1 / c.N0, 4)} = ${f(szorzo(g) / (c.N1 / c.N0), 4)}.`,
      ],
      jegyezze: 'Összetett feladatnál minden lépésnél kérdezze meg: ki a 100 %? Új érték → szorzás, régi érték → osztás.',
    };
  });
}

// ---- A téma leírása ----
export default {
  id: 'szazalek',
  cim: 'Százalékszámítás',
  rovid: 'Új érték, régi érték, a változás százaléka és többszöri változás – egyetlen képlettel.',
  kulcskeplet: '<span class="keplet-nagy">P<sub>0</sub> · q = P<sub>1</sub></span>',
  kulcsMagyarazat: [
    'P<sub>0</sub> = régi (eredeti) érték, P<sub>1</sub> = új érték, q = szorzó.',
    'Növekedés p %-kal: q = 1 + p/100 (pl. +4 % → 1,04). Csökkenés p %-kal: q = 1 − p/100 (pl. −8 % → 0,92).',
  ],
  elmelet: [
    'Az 1 % a század rész. Ha csak a változás kell: érték · p/100. Ha az új érték: érték · q – egy lépésben.',
    'Három kérdéstípus, ugyanaz a képlet: <strong>új érték → szorzás</strong> (P<sub>1</sub> = P<sub>0</sub> · q); <strong>régi érték → osztás</strong> (P<sub>0</sub> = P<sub>1</sub> : q); <strong>a változás %-a</strong> → q = P<sub>1</sub> : P<sub>0</sub>, majd (q − 1) · 100.',
    '<strong>„Mint a ház alapja”:</strong> amihez viszonyítunk (a 100 %), az mindig <strong>lent</strong>, a nevezőben van.',
    'Az egyenletrendezésnél mindig az <strong>ellenkező műveletet</strong> végezzük (szorzás helyett osztás).',
    '<strong>Többszöri változásnál a szorzókat összeszorozzuk</strong>, a százalékokat nem adjuk össze. A kiinduló érték mindegy → számoljon 100-ból.',
    '„Hány százaléka” ≠ „hány százalékkal változott”: q = 0,84 → az új érték a régi 84 %-a, tehát 16 %-kal csökkent.',
  ],
  peldak: [
    { cim: 'Áremelés – új ár', feladat: 'Egy termék ára 25 $, 4 %-kal emelik. Mennyi az új ár?',
      lepesek: ['Ki a 100 %? A régi ár: P₀ = 25 $.', 'Növekedés 4 %-kal → q = 1 + 4/100 = 1,04.', 'Új érték → szorzás: P₁ = 25 · 1,04 = <strong>26 $</strong>.'] },
    { cim: 'Áremelés – régi ár', feladat: 'Egy termék új ára 280 $, ez 12 %-os emelés után alakult ki. Mennyi volt a régi ár?',
      lepesek: ['A 280 $ nem a 100 %, hanem a 112 %. q = 1,12.', 'P₀ · 1,12 = 280 → régi érték → osztás (ellenkező művelet).', 'P₀ = 280 : 1,12 = <strong>250 $</strong>.'] },
    { cim: 'A növekedés százaléka', feladat: 'Egy ár 2500 $-ról 3375 $-ra nőtt. Hány százalékkal nőtt?',
      lepesek: ['Ki a 100 %? A régi ár, 2500 $ – ez kerül a nevezőbe.', 'q = 3375 : 2500 = 1,35 (az új ár a régi 135 %-a).', '(1,35 − 1) · 100 = 35 → <strong>35 %-kal nőtt</strong>.'] },
    { cim: 'Árcsökkentés – új ár', feladat: 'Egy termék ára 150 $, 8 %-kal csökkentik. Mennyi az új ár?',
      lepesek: ['Csökkenés 8 %-kal → q = 1 − 8/100 = 0,92.', 'P₁ = 150 · 0,92 = <strong>138 $</strong>.'] },
    { cim: 'Árcsökkentés – régi ár', feladat: '15 %-os engedmény után egy termék 39,95 $. Mennyi volt az eredeti ár?',
      lepesek: ['A 39,95 $ a (100 − 15) % = 85 %, q = 0,85.', 'Régi érték → osztás: P₀ = 39,95 : 0,85 = <strong>47 $</strong>.'] },
    { cim: 'A csökkenés százaléka', feladat: 'Egy ár 240 $-ról 201,6 $-ra csökkent. Hány százalékkal csökkent?',
      lepesek: ['q = 201,6 : 240 = 0,84 → az új ár a régi 84 %-a.', '„Hány százaléka” ≠ „hány százalékkal”: (1 − 0,84) · 100 = 16.', 'Az ár <strong>16 %-kal csökkent</strong>.'] },
    { cim: 'Két növekedés egymás után', feladat: 'Egy ár először 32 %-kal, majd 10 %-kal nő. Összesen hány százalékkal nőtt?',
      lepesek: ['Szorzók: 1,32 és 1,1.', 'q = 1,32 · 1,1 = 1,452 (100-ból: 145,2).', '(1,452 − 1) · 100 = 45,2 → <strong>45,2 %-kal nőtt</strong> (nem 42 %!).'] },
    { cim: 'Két csökkenés egymás után', feladat: 'Egy ár először 12 %-kal, majd 15 %-kal csökken. Összesen hány százalékkal csökkent?',
      lepesek: ['Szorzók: 0,88 és 0,85.', 'q = 0,88 · 0,85 = 0,748.', '(1 − 0,748) · 100 = 25,2 → <strong>25,2 %-kal csökkent</strong> (nem 27 %!).'] },
    { cim: 'Összetett feladat – szálloda', feladat: '2023-ban 3600 belföldi vendég volt, a vendégek 40 %-a belföldi. 2024-ben 25 %-kal kevesebb belföldi és 12 %-kal több külföldi vendég érkezett. 2024-ben a bevétel 1 069 200 €, 8 %-kal több, mint 2023-ban. Hogyan változott az egy vendégre jutó bevétel?',
      lepesek: [
        'Összes vendég 2023: a 3600 a 40 % → 3600 : 0,4 = 9000; külföldi: 9000 − 3600 = 5400.',
        '2024: belföldi 3600 · 0,75 = 2700; külföldi 5400 · 1,12 = 6048; összesen 8748.',
        'Vendégszám változása: 8748 : 9000 = 0,972 → −2,8 %.',
        'Bevétel 2023: régi érték → osztás: 1 069 200 : 1,08 = 990 000 €.',
        'Egy vendégre jutó bevétel: 990 000 : 9000 = 110 €; 1 069 200 : 8748 ≈ 122,2 €.',
        '122,2 : 110 ≈ 1,111 → <strong>+11,1 %</strong>. Gyorsabban: 1,08 : 0,972 ≈ 1,111.',
      ] },
  ],
  tipusok: [
    { id: 'T1', nev: 'Növekedés – új érték', general: ujErtekTipus(1) },
    { id: 'T2', nev: 'Növekedés – régi érték', general: regiErtekTipus(1) },
    { id: 'T3', nev: 'A növekedés százaléka', general: valtozasTipus(1) },
    { id: 'T4', nev: 'Csökkenés – új érték', general: ujErtekTipus(-1) },
    { id: 'T5', nev: 'Csökkenés – régi érték', general: regiErtekTipus(-1) },
    { id: 'T6', nev: 'A csökkenés százaléka', general: valtozasTipus(-1) },
    { id: 'T7', nev: 'Két növekedés egymás után', general: ketValtozasTipus('nov') },
    { id: 'T8', nev: 'Két csökkenés egymás után', general: ketValtozasTipus('csokk') },
    { id: 'T9', nev: 'Növekedés, majd csökkenés', general: ketValtozasTipus('vegyes') },
    { id: 'T10', nev: 'Összetett feladat (szálloda)', general: szallodaTipus },
  ],
  /** A kidolgozott példák végeredményei újraszámolva – a tesztek ezt ellenőrzik a SPEC-kel szemben. */
  peldaEllenorzes() {
    const sz = szalloda({ D0: 3600, s: 40, d: 25, fk: 12, R1: 1069200, g: 8 });
    return [
      { nev: '1. példa: 25 $ +4 %', kapott: ujErtek(25, 4), vart: 26 },
      { nev: '2. példa: 280 $ / 1,12', kapott: regiErtek(280, 12), vart: 250 },
      { nev: '3. példa: 2500 → 3375', kapott: valtozas(2500, 3375), vart: 35 },
      { nev: '4. példa: 150 $ −8 %', kapott: ujErtek(150, 8, -1), vart: 138 },
      { nev: '5. példa: 39,95 / 0,85', kapott: regiErtek(39.95, 15, -1), vart: 47 },
      { nev: '6. példa: 240 → 201,6', kapott: -valtozas(240, 201.6), vart: 16 },
      { nev: '7. példa: +32 %, +10 %', kapott: osszetett([32, 10]), vart: 45.2 },
      { nev: '8. példa: −12 %, −15 %', kapott: -osszetett([-12, -15]), vart: 25.2 },
      { nev: 'Szálloda: összes 2023', kapott: sz.N0, vart: 9000 },
      { nev: 'Szálloda: külföldi 2023', kapott: sz.K0, vart: 5400 },
      { nev: 'Szálloda: belföldi 2024', kapott: sz.D1, vart: 2700 },
      { nev: 'Szálloda: külföldi 2024', kapott: sz.K1, vart: 6048 },
      { nev: 'Szálloda: összes 2024', kapott: sz.N1, vart: 8748 },
      { nev: 'Szálloda: vendégszám változás', kapott: kerekit(sz.V, 1), vart: -2.8 },
      { nev: 'Szálloda: bevétel 2023', kapott: sz.R0, vart: 990000 },
      { nev: 'Szálloda: bevétel/fő 2023', kapott: sz.r0, vart: 110 },
      { nev: 'Szálloda: bevétel/fő 2024', kapott: kerekit(sz.r1, 1), vart: 122.2 },
      { nev: 'Szálloda: bevétel/fő változás', kapott: kerekit(sz.vr, 1), vart: 11.1 },
    ];
  },
};
