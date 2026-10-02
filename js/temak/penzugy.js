// 4. téma – Pénzügyi számítások (kamatos kamat)
import { egesz, valaszt, lepeskoz } from '../lib/rng.js';
import { kerekit, szep } from '../lib/szam.js';
import { szamMezo } from '../lib/ellenorzo.js';
import { probal, f, fe, sup, hatv, kezelheto, tisztit, az, Az } from './seged.js';

// ---- Tiszta számolófüggvények (a példák és a tesztek is ezt használják) ----
/** Kamattényező: 1 + r/(100·m). Pl. 8 % → 1,08; havi 0,5 % → 1,005. */
export const katenyezo = (r, m = 1) => 1 + r / (100 * m);
export const jovoertek = (PV, r, n) => PV * Math.pow(1 + r / 100, n);
export const jelenertek = (FV, r, n) => FV / Math.pow(1 + r / 100, n);
export const periodusszam = (PV, FV, r) => Math.log(FV / PV) / Math.log(1 + r / 100);
export const kamatlab = (PV, FV, n) => (Math.pow(FV / PV, 1 / n) - 1) * 100;
/** Évközi tőkésítés: éves névleges r, évi m tőkésítés, k periódus. */
export const evkozi = (PV, r, m, k) => PV * Math.pow(1 + r / (100 * m), k);
export const tenyleges = (r, m) => (Math.pow(1 + r / (100 * m), m) - 1) * 100;
export const egyszeruKamat = (PV, r, n) => PV * (1 + (n * r) / 100);

const ft0 = (x) => kerekit(x, 0);
const ft = (x) => fe(x, 'Ft', 0);
const f0 = (x) => f(x, 0);
const q4 = (q) => f(q, 4);
/** Nagyon nagy / végtelen szám szövegesen (az ellenpróbában a rossz válaszok miatt). */
const nagy = (x, d = 0) => (kezelheto(x, 1e15) ? f(x, d) : 'csillagászati');

// ---- Számpárok véletlenszerűen ----
function osszeg(rng) {
  return rng() < 0.7 ? 10000 * egesz(rng, 1, 99) : 100000 * egesz(rng, 10, 100);
}
/** Éves kamatláb: 1–20 %, többnyire egész, néha fél. */
function kamat(rng) {
  return rng() < 0.7 ? egesz(rng, 1, 20) : lepeskoz(rng, 1.5, 19.5, 1);
}
const GYAKORISAG = { 2: 'félévente', 4: 'negyedévente', 12: 'havonta' };
const GYAKORISAG_MELL = { 2: 'féléves', 4: 'negyedéves', 12: 'havi' };
/**
 * Éves névleges kamatláb úgy, hogy a periódusonkénti kamat legfeljebb 2 tizedes legyen
 * (így a kamattényező legfeljebb 4 tizedes: pl. 9,6 % : 12 = 0,8 % → 1,008).
 */
function nevlegesKamat(rng, m) {
  if (m === 12) return Number((0.6 * egesz(rng, 2, 32)).toPrecision(12)); // 1,2 … 19,2 (0,6 többszörösei)
  if (m === 4) return egesz(rng, 2, 20);
  return rng() < 0.7 ? egesz(rng, 2, 20) : lepeskoz(rng, 2.5, 19.5, 1);
}

// =====================================================================
// P1 – jövőérték
// =====================================================================
function p1Param(rng) {
  return probal(() => {
    const PV = osszeg(rng), r = kamat(rng), n = egesz(rng, 2, 30);
    const FV = ft0(jovoertek(PV, r, n));
    if (FV > 3e8 || Math.abs(egyszeruKamat(PV, r, n) - FV) < 5) return null;
    return { PV, r, n };
  });
}

function p1Epit({ PV, r, n }, h = false) {
  const q = katenyezo(r), qn = Math.pow(q, n), FV = ft0(PV * qn);
  const egy = PV * (1 + (n * r) / 100);
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const lancElo = (w) => `Ellenpróba: ha ${ft(w)} lenne ${n} év múlva, akkor visszafelé a kamattényezővel osztva ${f0(w)} : ${hatv(q, n)} = ${nagy(w / qn)} Ft jönne ki kezdőösszegnek – de ${ft(PV)} volt.`;
  return {
    szoveg: h
      ? `Egy bank ${ft(PV)}-ot hitelez évi ${f(r)} %-os kamattal; a kölcsönt és a kamatot a futamidő végén, egy összegben kell visszafizetni. Mennyit kell visszafizetni ${n} év múlva?`
      : `Egy bankszámlára ${ft(PV)}-ot helyezünk el évi ${f(r)} %-os kamatos kamatra (a kamatot évente jóváírják). Mennyi pénz lesz a számlán ${n} év múlva?`,
    mezok: [szamMezo({
      cimke: h ? 'Visszafizetendő összeg (Ft)' : 'Összeg a számlán (Ft)', helyes: FV, tizedes: 0, egyseg: 'Ft', abszTures: 1,
      ellenproba: lancElo,
      hibak: [
        { ertek: tiz(egy), uzenet: `Ez egyszerű kamat lenne (${n} · ${f(r)} % = ${f(n * r)} % egyszerűen hozzáadva). Kamatos kamatnál a kamat is kamatozik → hatvány: ${hatv(q, n)}.` },
        { ertek: tiz(PV * Math.pow(1 + r, n)), uzenet: `A kamattényező 1 + r/100, pl. 8 % → 1,08, nem 9. Itt ${f(r)} % → ${q4(q)}, nem ${f(1 + r)}.` },
        { ertek: tiz(PV * q), uzenet: `Ez csak 1 év után lenne ennyi. ${n} évig kamatozik a pénz, ezért a kamattényező ${n}. hatványa kell.` },
      ],
    })],
    tippek: [
      `Melyik betű az ismeretlen a PV · (1 + r/100)ⁿ = FV képletben – és hová kerül a ${f0(PV)}?`,
      `Kamatos kamat → minden évben ugyanazzal a kamattényezővel szorzunk: 1 + r/100 = 1 + ${f(r)}/100 = ${q4(q)}.`,
      `${n} év → ${hatv(q, n)} = ${f(qn, 4)}; FV = ${f0(PV)} · ${f(qn, 4)}.`,
    ],
    megoldas: [
      `Az ismeretlen a jövőérték (FV); PV = ${ft(PV)}, r = ${f(r)} %, n = ${n} év.`,
      `Kamattényező: 1 + ${f(r)}/100 = ${q4(q)}.`,
      `FV = PV · ${hatv(q, n)} = ${f0(PV)} · ${f(qn, 6)} ≈ <strong>${ft(FV)}</strong>.`,
      `Ellenőrzés: több, mint a kezdőösszeg ✓ (egyszerű kamattal csak ${ft(ft0(egy))} lenne).`,
    ],
    magyarazat: [
      `${h ? 'A futamidő végén visszafizetendő összeget' : `A számlán ${n} év múlva lévő összeget`} keressük – ez a jövőérték (FV). A ${ft(PV)} a mai pénz, a jelenérték (PV).`,
      `A bank minden évben a meglévő összeg ${f(100 + r)} %-át adja vissza, vagyis évente ugyanazzal a számmal szorzunk (${q4(q)}) – ez a kamattényező. Kamatos kamatnál a második évtől már az előző évek kamata is kamatozik, ezért évről évre ugyanazzal a számmal szorzunk tovább: ${n} év alatt ${n}-szor.`,
      `Képzelje el, hogy 100 Ft-ot teszünk be: egy év után ${f(100 * q, 2)} Ft, két év után ${f(100 * q * q, 2)} Ft lesz, és így tovább, ${n} év után ${f(100 * qn, 2)} Ft. A ${n} egymás utáni szorzást hatványként írjuk: ${hatv(q, n)} = ${f(qn, 4)}.`,
      `Ezért a ${f0(PV)} Ft-ot megszorozzuk a hatvánnyal: ${f0(PV)} · ${f(qn, 4)} ≈ ${f0(FV)} Ft.`,
      `Józan ésszel: kamatot kapunk, ezért többnek kell lennie, mint a kezdőösszeg – és tényleg ${f0(FV)} > ${f0(PV)}. Az egyszerű kamat (${n} · ${f(r)} % = ${f(n * r)} %) csak ${f0(ft0(egy))} Ft-ot adna; a kamatos kamat ennél több, mert a kamat is kamatozik.`,
    ],
    jegyezze: 'Jövőérték: FV = PV · (1 + r/100)ⁿ – a kamattényezőt annyiszor szorozzuk, ahány évig kamatozik a pénz (hatvány, nem n · r %).',
  };
}
const P1 = (rng) => p1Epit(p1Param(rng));

// =====================================================================
// P2 – jelenérték (betét vagy kölcsön)
// =====================================================================
function p2Param(rng) {
  return probal(() => {
    const PV = osszeg(rng), r = kamat(rng), n = egesz(rng, 2, 30);
    const FV = ft0(jovoertek(PV, r, n));
    if (FV > 3e8 || PV < 1000) return null;
    return { FV, r, n };
  });
}

function p2Epit({ FV, r, n }, h = false) {
  const q = katenyezo(r), qn = Math.pow(q, n), PVx = FV / qn, PV = ft0(PVx);
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const elore = (w) => {
    const lanc = n <= 3 ? `${f0(w)} · ${Array(n).fill(q4(q)).join(' · ')}` : `${f0(w)} · ${hatv(q, n)}`;
    return `Ellenpróba: ha ${ft(w)} lett volna a kezdőösszeg, akkor ${n} év múlva ${lanc} = ${nagy(w * qn)} Ft lenne, nem ${ft(FV)}.`;
  };
  return {
    szoveg: h
      ? `Valaki évi ${f(r)} %-os kamatra kölcsönt vett fel; ${n} év múlva egy összegben ${ft(FV)}-ot kell visszafizetnie. Mekkora a felvett kölcsön összege?`
      : `Évi ${f(r)} %-os kamat mellett ${n} év múlva ${ft(FV)} lett a számlán. Mennyit tettünk be?`,
    mezok: [szamMezo({
      cimke: h ? 'A felvett kölcsön (Ft)' : 'A betett összeg (Ft)', helyes: PV, tizedes: 0, egyseg: 'Ft', abszTures: 1,
      ellenproba: elore,
      hibak: [
        { ertek: tiz(FV * qn), uzenet: 'Visszafelé haladunk az időben → osztás. A jelenérték kisebb, mint a jövőérték.' },
        { ertek: tiz(FV * Math.pow(1 - r / 100, n)), uzenet: 'Nem csökkenéssel szorzunk, hanem a kamattényező hatványával osztunk.' },
        { ertek: tiz(FV / (1 + (n * r) / 100)), uzenet: `Ez az egyszerű kamat logikája (${n} · ${f(r)} % = ${f(n * r)} %). Kamatos kamatnál a kamat is kamatozik, ezért a hatvánnyal (${hatv(q, n)}) kell osztani.` },
        { ertek: tiz(FV / q), uzenet: `Ez csak 1 év kamatát vonja le. ${n} évig kamatozott a pénz, ezért a kamattényező ${n}. hatványával osztunk.` },
      ],
    })],
    tippek: [
      `Melyik betű az ismeretlen – a mai pénz (PV) vagy a jövőbeli (FV)? Melyik irányba megyünk az időben?`,
      `Visszafelé haladunk az időben → az ellenkező művelet: osztás a kamattényező hatványával. Kamattényező: ${q4(q)}.`,
      `PV = ${f0(FV)} : ${hatv(q, n)} = ${f0(FV)} : ${f(qn, 4)}.`,
    ],
    megoldas: [
      `Az ismeretlen a jelenérték (PV); FV = ${ft(FV)}, r = ${f(r)} %, n = ${n} év.`,
      `PV · ${hatv(q, n)} = FV → PV = FV : ${hatv(q, n)} (az ellenkező művelet: osztás).`,
      `PV = ${f0(FV)} : ${f(qn, 6)} ≈ <strong>${ft(PV)}</strong>.`,
      `Ellenőrzés: ${f0(PV)} · ${hatv(q, n)} ≈ ${f0(ft0(PV * qn))} ✓`,
    ],
    magyarazat: [
      `${h ? 'A felvett kölcsönt' : 'A betett összeget'}, vagyis a mai pénzt (jelenérték, PV) keressük. A bank minden évben a meglévő összeg ${f(100 + r)} %-át adja (· ${q4(q)}), ${n} év alatt ${n}-szor egymás után: ${hatv(q, n)} = ${f(qn, 4)}.`,
      `Most visszafelé haladunk az időben: a ${f0(FV)} Ft-ból kell visszajutni a kezdőösszeghez, ezért az ellenkező művelet jön, osztás: ${f0(FV)} : ${f(qn, 4)} ≈ ${f0(PV)} Ft.`,
      `Képzelje el, hogy a kezdőösszeg 100 Ft lenne: ${n} év múlva ${f(100 * qn, 2)} Ft lenne belőle. A mi végösszegünk ennek ${f(FV / (100 * qn), 2)}-szorosa, ezért a kezdőösszeg is 100 Ft ${f(FV / (100 * qn), 2)}-szorosa, vagyis ${f0(PV)} Ft.`,
      `Józan ésszel: a ${h ? 'felvett kölcsön' : 'betett pénz'} kevesebb, mint amennyi ${n} év múlva lett belőle (${f0(PV)} < ${f0(FV)}).`,
      `Ellenpróba: ${f0(PV)} · ${hatv(q, n)} ≈ ${f0(ft0(PV * qn))} Ft ✓.`,
    ],
    jegyezze: 'Jelenérték: PV = FV : (1 + r/100)ⁿ – visszafelé haladunk az időben, ezért osztunk; a jelenérték mindig kisebb, mint a jövőérték.',
  };
}
const P2 = (rng) => p2Epit(p2Param(rng), rng() < 0.5);

// =====================================================================
// P3 – periódusszám (futamidő)
// =====================================================================
function p3Param(rng) {
  return probal(() => {
    const PV = osszeg(rng), r = kamat(rng), n = egesz(rng, 3, 30);
    const FV = ft0(jovoertek(PV, r, n));
    const arany = FV / PV;
    const linBecsles = ((arany - 1) * 100) / r;
    if (FV > 3e8 || Math.abs(linBecsles - n) < 1.5 || Math.abs(Math.log10(arany) / (r / 100) - n) < 1.5) return null;
    return { PV, FV, r, n };
  });
}

function p3Epit({ PV, FV, r, n }, h = false) {
  const q = katenyezo(r), arany = FV / PV;
  const lgA = Math.log10(arany), lgQ = Math.log10(q);
  const nx = lgA / lgQ;
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const elore = (w) => `Ellenpróba: ha ${f(w)} évig kamatozott volna a pénz, akkor ${f0(PV)} · ${hatv(q, w)} = ${nagy(PV * Math.pow(q, w))} Ft lenne, nem ${f0(FV)} Ft.`;
  const elozo = Math.pow(q, n - 1);
  return {
    szoveg: h
      ? `${ft(PV)} hitelt vettünk fel évi ${f(r)} %-os kamatra; a futamidő végén, egy összegben ${ft(FV)}-ot kellett visszafizetni. Hány éves volt a futamidő?`
      : `${ft(PV)}-ot helyeztünk el évi ${f(r)} %-os kamatra, és a lejáratkor ${ft(FV)}-ot kaptunk. Hány évig állt a pénz a számlán?`,
    mezok: [szamMezo({
      cimke: h ? 'A futamidő (év, egészre)' : 'Az eltelt idő (év, egészre)', helyes: n, tizedes: 0, egyseg: 'év',
      ellenproba: elore,
      hibak: [
        { ertek: tiz(((arany - 1) * 100) / r), uzenet: 'Ez lineáris becslés (egyszerű kamat logikája). Kamatos kamatnál logaritmus kell (vagy próbálgatás egész évekkel).' },
        { ertek: tiz(Math.log10(arany) / (r / 100)), uzenet: `Az osztóban is logaritmus kell: n = lg(FV/PV) : lg(1 + r/100) = lg ${f(arany, 4)} : lg ${q4(q)}.` },
      ],
    })],
    tippek: [
      `Melyik betű az ismeretlen a PV · (1 + r/100)ⁿ = FV képletben – és hol áll: a tényezőben vagy a kitevőben?`,
      `Először osszon PV-vel: ${f0(FV)} : ${f0(PV)} = ${f(arany, 4)}. Ez azt mutatja, hányszorosára nőtt a pénz: ${q4(q)}ⁿ = ${f(arany, 4)}.`,
      `A kitevőt a logaritmus „csalogatja le”: n = lg ${f(arany, 4)} : lg ${q4(q)}. (Vagy próbálgasson egész évekkel: ${q4(q)}^n.)`,
    ],
    megoldas: [
      `Az ismeretlen az időtartam (n); PV = ${ft(PV)}, FV = ${ft(FV)}, r = ${f(r)} %.`,
      `Osztás PV-vel: ${q4(q)}ⁿ = ${f0(FV)} : ${f0(PV)} = ${f(arany, 4)}.`,
      `Logaritmus mindkét oldalon: n · lg ${q4(q)} = lg ${f(arany, 4)} → n = ${f(lgA, 5)} : ${f(lgQ, 5)} = ${f(nx, 3)}${Math.abs(nx - n) < 5e-4 ? '' : ' ≈'} <strong>${n} év</strong>.`,
      `Ellenőrzés próbálgatással: ${hatv(q, n - 1)} = ${f(elozo, 4)}, ${hatv(q, n)} = ${f(elozo * q, 4)} ✓ (Excelben: =PER.SZÁM(${f(r / 100, 4)};0;−${f0(PV)};${f0(FV)}) → ${n}).`,
    ],
    magyarazat: [
      `Az időtartamot (n) keressük: hány évig kamatozott a ${f0(PV)} Ft, amíg ${f0(FV)} Ft lett belőle.`,
      `A pénz minden évben ${q4(q)}-szeresére nő. Először megnézzük, hányszorosára nőtt összesen: ${f0(FV)} : ${f0(PV)} = ${f(arany, 4)}. Ennyi ${az(q, 4)} n-edik hatványa.`,
      `Próbálgatással: ${hatv(q, n - 1)} = ${f(elozo, 4)} még kevés, ${hatv(q, n)} = ${f(elozo * q, 4)} – ez az, tehát ${n} év.`,
      `Az ismeretlen a kitevőben van, ezért logaritmus kell: az lg „lecsalogatja” a kitevőt (lg(qⁿ) = n · lg q). Így n = lg ${f(arany, 4)} : lg ${q4(q)} = ${f(nx, 3)}${Math.abs(nx - n) < 5e-4 ? '' : ` ≈ ${n}`}.`,
      `Józan ésszel: a pénz ${f(arany, 2)}-szorosára nőtt, és ${f(r)} %-os kamatnál ${n} év alatt ennyi jön ki. Egyszerű kamattal ${f(((arany - 1) * 100) / r, 1)} év kellene, de kamatos kamatnál a kamat is kamatozik, ezért gyorsabb.`,
    ],
    jegyezze: 'Ha az idő az ismeretlen: osztunk PV-vel, majd logaritmust veszünk: n = lg(FV/PV) : lg(1 + r/100) – vagy próbálgatunk egész évekkel.',
  };
}
const P3 = (rng) => p3Epit(p3Param(rng), rng() < 0.5);

// =====================================================================
// P4 – kamatláb
// =====================================================================
function p4Param(rng) {
  return probal(() => {
    const PV = osszeg(rng), r = kamat(rng), n = egesz(rng, 2, 30);
    const FV = ft0(jovoertek(PV, r, n));
    const arany = FV / PV;
    if (FV > 3e8 || Math.abs(((arany - 1) * 100) / n - r) < 0.3) return null;
    return { PV, FV, n, r };
  });
}

function p4Epit({ PV, FV, n, r }, h = false) {
  const arany = FV / PV, q = katenyezo(r);
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const elore = (w) => `Ellenpróba: ha az éves kamatláb ${f(w)} % lenne, akkor ${f0(PV)} · ${hatv(1 + w / 100, n)} = ${nagy(PV * Math.pow(1 + w / 100, n))} Ft lenne ${n} év múlva, nem ${f0(FV)} Ft.`;
  const atlag = ((arany - 1) * 100) / n;
  return {
    szoveg: h
      ? `${ft(PV)} hitelt vettünk fel; ${n} év múlva egy összegben ${ft(FV)}-ot kellett visszafizetni. Mekkora volt az éves kamatláb?`
      : `${ft(PV)}-ot helyeztünk el, és ${n} év múlva ${ft(FV)}-ot vehettünk fel. Mekkora az éves kamatláb?`,
    mezok: [szamMezo({
      cimke: 'Éves kamatláb (%, egy tizedesre)', helyes: r, tizedes: 1, egyseg: '%',
      ellenproba: elore,
      hibak: [
        { ertek: tiz(atlag), uzenet: 'Ez az évi átlagos növekedés egyszerű kamattal számolva. Kamatos kamatnál n-edik gyököt kell vonni.' },
        { ertek: tiz((arany - 1) * 100), uzenet: 'Ez az egész időszak alatti növekedés, nem az éves kamatláb.' },
        { ertek: tiz(q), uzenet: 'Ez a kamattényező. A kamatláb ebből úgy lesz, hogy kivonunk 1-et, majd szorzunk 100-zal.' },
        { ertek: tiz(q * 100), uzenet: 'Ebből még ki kell vonni a 100 %-ot (a kiinduló összeget): a kamatláb a kamattényező mínusz 1, szorozva 100-zal.' },
      ],
    })],
    tippek: [
      `Melyik betű az ismeretlen a PV · (1 + r/100)ⁿ = FV képletben – és mit kapunk meg elsőként: az r-et vagy a kamattényezőt?`,
      `Osszon PV-vel: ${f0(FV)} : ${f0(PV)} = ${f(arany, 5)} = (1 + r/100)${sup(n)}. Az ellenkező művelet a ${n}. gyök.`,
      `1 + r/100 = ${n}. gyök alatt ${f(arany, 5)} ≈ ${q4(q)}; utána −1, ·100.`,
    ],
    megoldas: [
      `Az ismeretlen a kamatláb (r); PV = ${ft(PV)}, FV = ${ft(FV)}, n = ${n} év.`,
      `Osztás PV-vel: (1 + r/100)${sup(n)} = ${f0(FV)} : ${f0(PV)} = ${f(arany, 5)}.`,
      `${n}. gyök: 1 + r/100 = ${f(Math.pow(arany, 1 / n), 5)} ≈ ${q4(q)} (GeoGebrában tizedespontot használjon).`,
      `r = (${q4(q)} − 1) · 100 = <strong>${f(r)} %</strong>. (Excelben: =RÁTA(${n};0;−${f0(PV)};${f0(FV)}) → ${f(r / 100, 4)}.)`,
      `Ellenőrzés: ${f0(PV)} · ${hatv(q, n)} ≈ ${f0(ft0(PV * Math.pow(q, n)))} ✓`,
    ],
    magyarazat: [
      `Az éves kamatlábat keressük: évente hány %-kal nő a pénz, ha ${n} év alatt a ${f0(PV)} Ft-ból ${f0(FV)} Ft lett.`,
      `A pénz ${n} év alatt ${f(arany, 4)}-szeresére nőtt (${f0(FV)} : ${f0(PV)}). Ez ${n} egyforma lépés eredménye: minden évben ugyanazzal a kamattényezővel szorzunk, ${n}-szer egymás után.`,
      `Képzelje el, hogy 100 Ft-ból ${f(100 * arany, 2)} Ft lett. Olyan számot keresünk, amelyet önmagával ${n}-szer összeszorozva ${f(arany, 4)} jön ki.`,
      `A hatványozás ellentéte a gyökvonás, ezért ${n}. gyököt vonunk: ${n}. gyök alatt ${f(arany, 4)} ≈ ${q4(q)}. Ez a kamattényező; az 1 a meglévő összeg, a többlet a kamat: ${q4(q)} − 1 = ${f(q - 1, 4)}, vagyis ${f(r)} %.`,
      `Józan ésszel: egyszerű kamattal ${f(atlag, 1)} % (${f(arany * 100 - 100, 1)} : ${n}) jönne ki évente, de a kamatos kamatnál a kamat is kamatozik, ezért kisebb az éves kamatláb: ${f(r)} %. Ellenpróba: ${f0(PV)} · ${hatv(q, n)} ≈ ${f0(ft0(PV * Math.pow(q, n)))} Ft ✓.`,
    ],
    jegyezze: 'Ha a kamatláb az ismeretlen: osztunk PV-vel, n-edik gyököt vonunk, majd kivonunk 1-et és szorzunk 100-zal: r = (ⁿ√(FV/PV) − 1) · 100.',
  };
}
const P4 = (rng) => p4Epit(p4Param(rng), rng() < 0.5);

// =====================================================================
// P5 – évközi kamatozás
// =====================================================================
function p5Param(rng) {
  return probal(() => {
    const m = valaszt(rng, [2, 4, 12]);
    const r = nevlegesKamat(rng, m);
    const PV = osszeg(rng);
    const hossz = 12 / m;
    const k = m === 12 ? egesz(rng, 2, 48) : egesz(rng, 1, 36 / hossz) * 1;
    const months = k * hossz;
    const p = r / m;
    if (!szep(p, 2) || months > 48 || k < 2) return null;
    const FV = evkozi(PV, r, m, k);
    if (FV > 3e8 || Math.abs(PV * Math.pow(1 + r / 100, k) - FV) < 5) return null;
    return { PV, r, m, months };
  });
}

function p5Epit({ PV, r, m, months }, h = false) {
  const k = months / (12 / m), p = r / m, q = katenyezo(r, m);
  const qk = Math.pow(q, k), FV = ft0(PV * qk);
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const visszafele = (w) => `Ellenpróba: ha ${ft(w)} lett volna a végösszeg, akkor visszafelé osztva ${f0(w)} : ${hatv(q, k)} = ${nagy(w / qk)} Ft jönne ki kezdőösszegnek – de ${ft(PV)} volt.`;
  const novekedes = (qk - 1) * 100, aranyos = (r * months) / 12;
  return {
    szoveg: h
      ? `Egy bank ${ft(PV)}-ot hitelez éves névleges ${f(r)} %-os kamattal, ${GYAKORISAG[m]} számítva a kamatot; a teljes összeget ${months} hónap múlva kell visszafizetni. Mennyit kell visszafizetni?`
      : `${ft(PV)}-ot helyezünk el egy bankban éves névleges ${f(r)} %-os kamatra, ${GYAKORISAG_MELL[m]} tőkésítéssel. Mennyi pénz lesz a számlán ${months} hónap múlva?`,
    mezok: [szamMezo({
      cimke: h ? 'Visszafizetendő összeg (Ft)' : 'Összeg a számlán (Ft)', helyes: FV, tizedes: 0, egyseg: 'Ft', abszTures: 1,
      ellenproba: visszafele,
      hibak: [
        { ertek: tiz(PV * Math.pow(1 + r / 100, k)), uzenet: `Az éves kamatlábat arányosítani kell: ${GYAKORISAG[m]} ${f(r)} % : ${m} = ${f(p, 3)} %, nem a teljes ${f(r)} %.` },
        { ertek: tiz(PV * Math.pow(1 + p / 10, k)), uzenet: `Eggyel kevesebb nullát írt. ${f(p, 3)} % = ${f(p / 100, 5)} → a kamattényező ${q4(q)} (a %-jel két nullát jelent: fél százalék = 0,005 → 1,005).` },
        { ertek: tiz(PV * Math.pow(1 + p / 1000, k)), uzenet: `Eggyel több nullát írt. ${f(p, 3)} % = ${f(p / 100, 5)} → a kamattényező ${q4(q)} (fél százalék = 0,005 → 1,005, nem 1,0005).` },
        { ertek: tiz(PV * (1 + (r / 100) * (months / 12))), uzenet: 'Ez egyszerű kamat lenne. Évközi kamatozásnál is kamatos kamat jár: a periódusonkénti kamattényezőt a periódusok számára emeljük.' },
      ],
    })],
    tippek: [
      `Mennyi a periódusonkénti kamatláb, ha az éves névleges ${f(r)} %-ot ${m} egyenlő részre osztjuk – és hány periódus van ${months} hónapban?`,
      `Arányosítunk: ${f(r)} % : ${m} = ${f(p, 3)} % periódusonként; a kamattényező ${q4(q)}. A periódusok száma: ${months} hónap = ${k}.`,
      `FV = ${f0(PV)} · ${hatv(q, k)} = ${f0(PV)} · ${f(qk, 6)}.`,
    ],
    megoldas: [
      `A névleges éves kamatlábat arányosítjuk: ${f(r)} % : ${m} = ${f(p, 3)} % ${m === 12 ? 'havonta' : m === 4 ? 'negyedévente' : 'félévente'}.`,
      `Kamattényező: 1 + ${f(p, 3)}/100 = ${q4(q)} (vigyázat a nullákkal: ${f(p, 3)} % = ${f(p / 100, 5)}).`,
      `Periódusok száma: ${months} hónap = ${k} periódus.`,
      `FV = PV · ${hatv(q, k)} = ${f0(PV)} · ${f(qk, 6)} ≈ <strong>${ft(FV)}</strong>.`,
    ],
    magyarazat: [
      `A bank az éves ${f(r)} %-ot nem egyben írja jóvá, hanem ${GYAKORISAG[m]}, és a kamat minden periódus végén hozzáadódik a tőkéhez (tőkésítés). ${Az(months)} hónap végén lévő összeget keressük.`,
      `Az éves (névleges) kamatlábat arányosítjuk: ${f(r)} % : ${m} = ${f(p, 3)} % periódusonként. A kamattényező: 1 + ${f(p, 3)}/100 = ${q4(q)}. Vigyázat a nullákkal: ${f(p, 3)} % = ${f(p / 100, 5)}, ezért a kamattényező ${q4(q)}.`,
      `${months} hónap ${k} periódus, ezért a kamattényezőt a ${k}. hatványra emeljük: ${hatv(q, k)} = ${f(qk, 6)}.`,
      `Képzelje el, hogy 100 Ft-ot teszünk be: ${months} hónap múlva ${f(100 * qk, 2)} Ft lesz belőle. A ${f0(PV)} Ft ennek ${f(PV / 100, 0)}-szorosa, ezért ${f0(PV)} · ${f(qk, 6)} ≈ ${f0(FV)} Ft.`,
      `Józan ésszel: több, mint a kezdőösszeg, de a növekedés (${f(novekedes, 2)} %) csak kicsit több, mint az időarányos éves kamat (${f(r)} % · ${months}/12 = ${f(aranyos, 2)} %), mert a kamat is kamatozik.`,
    ],
    jegyezze: 'Évközi kamatozásnál az éves névleges kamatlábat arányosítjuk (havonta r/12, negyedévente r/4, félévente r/2), és a periódusok számára hatványozunk. Fél százalék → 1,005.',
  };
}
const P5 = (rng) => p5Epit(p5Param(rng), rng() < 0.5);

// =====================================================================
// P6 – tényleges (effektív) éves kamatláb
// =====================================================================
function p6Param(rng) {
  return probal(() => {
    const m = valaszt(rng, [2, 4, 12]);
    const r = nevlegesKamat(rng, m);
    if (!szep(r / m, 2)) return null;
    const t = tenyleges(r, m);
    if (t - r < 0.1) return null; // legyen érezhetően több a névlegesnél
    return { r, m };
  });
}

function p6Epit({ r, m }, h = false) {
  const p = r / m, q = katenyezo(r, m), qm = Math.pow(q, m), t = tenyleges(r, m);
  const T = kerekit(t, 2);
  const ellen = (w) => `Ellenpróba: ha a tényleges éves kamatláb ${f(w)} % lenne, akkor 100 Ft egy év alatt 100 · ${f(1 + w / 100, 4)} = ${f(100 + w, 2)} Ft-ra nőne. A ${f(p, 3)} %-os periódusonkénti kamattal viszont ${m}-szor tőkésítve 100 · ${hatv(q, m)} = ${f(100 * qm, 2)} Ft lesz egy év alatt.`;
  return {
    szoveg: h
      ? `Egy hitel éves névleges kamata ${f(r)} %, a kamatot ${GYAKORISAG[m]} számítják fel. Mekkora a hitel tényleges éves kamatlába?`
      : `Egy bank éves névleges ${f(r)} %-os kamatot ígér a betétre, és a kamatot ${GYAKORISAG[m]} tőkésíti. Mekkora a tényleges (effektív) éves kamatláb?`,
    mezok: [szamMezo({
      cimke: 'Tényleges éves kamatláb (%, két tizedesre)', helyes: T, tizedes: 2, egyseg: '%',
      ellenproba: ellen,
      hibak: [
        { ertek: r, uzenet: 'Ez a névleges kamatláb. Gyakoribb tőkésítésnél a kamat is hamarabb kezd kamatozni, ezért a tényleges kamatláb egy kicsit több.' },
        { ertek: kerekit(qm * 100, 2), uzenet: `Ebből még ki kell vonni az 1-et (a 100 %-ot): ${f(qm * 100, 2)} % az év végi összeg a kezdőösszeg %-ában, a kamatláb ${f(qm * 100 - 100, 2)} %.` },
        { ertek: kerekit(qm - 1, 4), uzenet: 'Ez még tizedes tört alakban van; százalékban kifejezve szorozni kell 100-zal.' },
      ],
    })],
    tippek: [
      `Mennyi lenne 100 Ft egy év múlva, ha a ${f(r)} %-ot ${m} egyenlő részre osztva ${m}-szor tőkésítenék?`,
      `Periódusonként ${f(r)} % : ${m} = ${f(p, 3)} %, kamattényező ${q4(q)}; ${m} periódus van egy évben.`,
      `r_tényleges = (${q4(q)}${sup(m)} − 1) · 100.`,
    ],
    megoldas: [
      `Periódusonkénti kamatláb: ${f(r)} % : ${m} = ${f(p, 3)} %; kamattényező: ${q4(q)}.`,
      `Egy év alatt ${m} periódus telik el: ${hatv(q, m)} = ${f(qm, 6)}.`,
      `r_tényleges = (${f(qm, 6)} − 1) · 100 = <strong>${f(T, 2)} %</strong> (nagyobb, mint a névleges ${f(r)} %).`,
    ],
    magyarazat: [
      `A tényleges éves kamatlábat keressük: egyetlen szám, amely megmondja, mennyit nő a pénz egy év alatt, ha a ${GYAKORISAG[m]} tőkésítéssel jóváírt kamatot is beleszámoljuk.`,
      `Tegyünk be 100 Ft-ot. Periódusonként ${f(r)} % : ${m} = ${f(p, 3)} % a kamat, a kamattényező ${q4(q)}, és egy évben ${m} periódus van: 100 · ${hatv(q, m)} = ${f(100 * qm, 2)} Ft.`,
      `Ez ${f(100 * qm - 100, 2)} Ft kamat egy év alatt 100 Ft-ra, vagyis ${f(T, 2)} %. A tényleges kamatláb azért több a névlegesnél (${f(r)} %), mert a kamat hamarabb kezd kamatozni.`,
      `Józan ésszel: a tényleges kamatláb nagyobb a névlegesnél, de nem sokkal. Gyakoribb tőkésítésnél is van egy határ, a névleges kamatláb ${f(r)} %-ánál ez ${f((Math.exp(r / 100) - 1) * 100, 2)} %.`,
    ],
    jegyezze: 'Tényleges éves kamatláb: r_tényleges = ((1 + r/(100·m))ᵐ − 1) · 100. Gyakoribb tőkésítésnél nagyobb a névlegesnél, de nem nő a végtelenségig.',
  };
}
const P6 = (rng) => p6Epit(p6Param(rng), rng() < 0.5);

// =====================================================================
// P7 – kamattényező (gyors, egy szám)
// =====================================================================
function p7Param(rng) {
  return probal(() => {
    if (rng() < 0.65) {
      const p = valaszt(rng, [0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.5, 0.75, 0.8, 1.2, 1.5, 2.5, 3, 4, 5, 6, 7.5, 8, 9, 12, 15]);
      return { fajta: 'egyszeru', p };
    }
    const m = valaszt(rng, [2, 4, 12]);
    const r = nevlegesKamat(rng, m);
    if (!szep(r / m, 2)) return null;
    return { fajta: 'nevleges', r, m, p: r / m };
  });
}

const P7_KONTEXT = [
  (p) => `Egy bank a betétre ${f(p)} %-os kamatot fizet egy évre. Mennyi a kamattényező, vagyis az a szám, amivel a betétet egy év alatt szorozni kell?`,
  (p) => `Egy befektetés évente ${f(p)} %-kal gyarapodik. Mennyi a kamattényező (az évenkénti szorzó)?`,
  (p) => `Egy hitel éves kamata ${f(p)} %. Mennyi a kamattényező, amivel a tartozást évente szorozni kell?`,
];

function p7Epit({ fajta, p, r, m }, sorsz = 0) {
  const q = 1 + p / 100;
  const tiz = (x) => (kezelheto(x) ? x : NaN);
  const ellen = (w) => (w < 1
    ? `Ellenpróba: ha a kamattényező ${f(w, 4)} lenne, akkor 100 Ft egy periódus után 100 · ${f(w, 4)} = ${f(100 * w, 2)} Ft lenne – kevesebb, mint a betett 100 Ft, pedig kamatot kapunk. ${f(p, 3)} %-nál 100 Ft után ${f(p, 3)} Ft kamat jár, így ${f(100 + p, 3)} Ft lesz a végén.`
    : `Ellenpróba: ha a kamattényező ${f(w, 4)} lenne, akkor 100 Ft egy periódus után 100 · ${f(w, 4)} = ${f(100 * w, 2)} Ft lenne, vagyis ${f(100 * w - 100, 2)} Ft kamat járna. ${f(p, 3)} %-nál viszont 100 Ft után ${f(p, 3)} Ft kamat jár, így ${f(100 + p, 3)} Ft lesz a végén.`);
  const hibak = [
    { ertek: tiz(p / 100), uzenet: 'Ez csak a kamat tizedes tört alakban. A kamattényező az 1-et (a meglévő összeget) is tartalmazza: 1 + p/100.' },
    { ertek: tiz(p), uzenet: 'Ez a kamatláb százalékban. A kamattényező 1 + p/100: pl. 8 % → 1,08.' },
    { ertek: tiz(1 + p), uzenet: `A kamatlábat el kell osztani 100-zal: ${f(p)} % → ${q4(q)}, nem ${f(1 + p, 3)}.` },
    { ertek: tiz(1 + p / 10), uzenet: `Eggyel kevesebb nullát írt. ${f(p, 3)} % = ${f(p / 100, 5)} → ${q4(q)} (fél százalék = 0,005 → 1,005, két nulla).` },
    { ertek: tiz(1 + p / 1000), uzenet: `Eggyel több nullát írt. ${f(p, 3)} % = ${f(p / 100, 5)} → ${q4(q)} (fél százalék = 0,005 → 1,005, nem 1,0005).` },
  ];
  if (fajta === 'nevleges') hibak.push({ ertek: tiz(1 + r / 100), uzenet: `Az éves kamatlábat előbb arányosítani kell: ${GYAKORISAG[m]} ${f(r)} % : ${m} = ${f(p, 3)} %, és csak ez kerül a kamattényezőbe.` });
  const szoveg = fajta === 'egyszeru'
    ? P7_KONTEXT[sorsz % P7_KONTEXT.length](p)
    : `Egy betét éves névleges kamata ${f(r)} %, a kamatot ${GYAKORISAG[m]} tőkésítik. Mennyi a ${m === 12 ? 'havi' : m === 4 ? 'negyedéves' : 'féléves'} kamattényező?`;
  return {
    szoveg,
    mezok: [szamMezo({
      cimke: 'Kamattényező (négy tizedesig)', helyes: tisztit(q), tizedes: 4,
      ellenproba: ellen, hibak,
    })],
    tippek: [
      fajta === 'egyszeru'
        ? 'Ha 100 Ft-ot teszünk be, mennyi lesz belőle egy év után? Hányszorosa ez a 100 Ft-nak?'
        : `Mennyi a periódusonkénti kamatláb, ha az éves ${f(r)} %-ot ${m} részre osztjuk? Utána: ha 100 Ft-ot teszünk be, mennyi lesz belőle egy periódus után?`,
      fajta === 'egyszeru'
        ? `A ${f(p, 3)} % = ${f(p, 3)}/100 = ${f(p / 100, 5)} (a %-jel két nullát jelent). A meglévő összeg (1) mellé jön a kamat.`
        : `${f(r)} % : ${m} = ${f(p, 3)} % periódusonként = ${f(p / 100, 5)}; a meglévő összeg (1) mellé jön a kamat.`,
      `Kamattényező = 1 + ${f(p, 3)}/100 = 1 + ${f(p / 100, 5)}.`,
    ],
    megoldas: [
      ...(fajta === 'nevleges' ? [`Arányosítás: ${f(r)} % : ${m} = ${f(p, 3)} % periódusonként.`] : []),
      `A kamat: ${f(p, 3)} % = ${f(p, 3)}/100 = ${f(p / 100, 5)}.`,
      `Kamattényező: 1 + ${f(p / 100, 5)} = <strong>${q4(q)}</strong>.`,
      `Ellenőrzés: 100 Ft-ból ${f(100 * q, 4)} Ft lesz, vagyis ${f(p, 3)} Ft a kamat ✓.`,
    ],
    magyarazat: [
      `A kamattényezőt keressük: azt a számot, amivel a pénzt egy ${fajta === 'egyszeru' ? 'év' : 'periódus'} alatt meg kell szorozni.`,
      `${fajta === 'nevleges' ? `Először arányosítunk: ${f(r)} % : ${m} = ${f(p, 3)} % periódusonként. ` : ''}Ha 100 Ft-ot teszünk be, ${f(p, 3)} % kamat ${f(p, 3)} Ft, így ${f(100 + p, 3)} Ft lesz belőle. Ez a 100 Ft ${f(q, 5)}-szorosa.`,
      `Ezt röviden így írjuk: a meglévő összeg (az 1) plusz a kamat (${f(p, 3)} % = ${f(p / 100, 5)}), tehát 1 + ${f(p / 100, 5)} = ${q4(q)}. A százalékjel „század részt” jelent, ezért kell a 100-zal osztás.`,
      `Józan ésszel: kamatnál a tényező 1-nél nagyobb, és ${f(p, 3)} % esetén csak kicsivel: ${q4(q)}. Vigyázat a nullákkal: fél százalék → 0,005 → 1,005 (két nulla).`,
    ],
    jegyezze: 'Kamattényező = 1 + p/100 – nem p és nem p/100! (8 % → 1,08; 0,5 % → 1,005; 0,05 % → 1,0005).',
  };
}
let p7Szamlalo = 0;
const P7 = (rng) => p7Epit(p7Param(rng), p7Szamlalo++);

// =====================================================================
// P8 – vegyes „banki ajánlat” (hitel-történetbe ágyazott P1–P6)
// =====================================================================
const P8_ALTIPUSOK = [
  ['P1', (rng) => p1Epit(p1Param(rng), true)],
  ['P2', (rng) => p2Epit(p2Param(rng), true)],
  ['P3', (rng) => p3Epit(p3Param(rng), true)],
  ['P4', (rng) => p4Epit(p4Param(rng), true)],
  ['P5', (rng) => p5Epit(p5Param(rng), true)],
  ['P6', (rng) => p6Epit(p6Param(rng), true)],
];
function P8(rng) {
  const [alTipus, gen] = valaszt(rng, P8_ALTIPUSOK);
  const t = gen(rng);
  return { ...t, alTipus, szoveg: `<strong>Banki ajánlat.</strong> ${t.szoveg}` };
}

// =====================================================================
// Fix számokkal elérhető feladatok (a feladatlap párosai és a „banki ajánlatok”)
// =====================================================================
function osszehasonlitas() {
  const PV = 400000, r = 8.4;
  const sorok = [[1, 'évente'], [2, 'félévente'], [4, 'negyedévente'], [12, 'havonta']];
  const fv = (m) => ft0(evkozi(PV, r, m, m));
  const mezok = [];
  for (const [m, nev] of sorok) {
    mezok.push(szamMezo({ id: `fv${m}`, cimke: `Összeg 1 év múlva, ${nev} tőkésítve (Ft)`, helyes: fv(m), tizedes: 0, egyseg: 'Ft', abszTures: 1,
      ellenproba: (w) => `Ellenpróba: ${f0(w)} Ft ${f(w / PV, 4)}-szeres növekedés; a ${nev} tőkésítés ${m} periódusa ${hatv(katenyezo(r, m), m)} = ${f(Math.pow(katenyezo(r, m), m), 6)}-szoros növekedést ad, vagyis ${f0(PV)} · ${f(Math.pow(katenyezo(r, m), m), 6)} ≈ ${f0(fv(m))} Ft.` }));
  }
  for (const [m, nev] of sorok.slice(1)) {
    mezok.push(szamMezo({ id: `t${m}`, cimke: `Tényleges éves kamatláb, ${nev} tőkésítve (%, két tizedesre)`, helyes: kerekit(tenyleges(r, m), 2), tizedes: 2, egyseg: '%',
      ellenproba: (w) => `Ellenpróba: ha a tényleges kamatláb ${f(w)} % lenne, 100 Ft egy év múlva ${f(100 + w, 2)} Ft lenne; a ${nev} tőkésítéssel 100 · ${hatv(katenyezo(r, m), m)} = ${f(100 * Math.pow(katenyezo(r, m), m), 2)} Ft jön ki.` }));
  }
  return {
    szoveg: `Egy ${ft(PV)}-os betét éves névleges kamata ${f(r)} %. Számolja ki, mennyi pénz lesz a számlán 1 év múlva, ha a kamatot évente, félévente, negyedévente vagy havonta tőkésítik, és mekkora a tényleges éves kamatláb a három gyakoribb tőkésítésnél!`,
    utasitas: 'Töltse ki a táblázatot! Az összegek egész forintban, a kamatlábak két tizedesre kerekítve (évente tőkésítve a tényleges kamatláb a névlegessel egyezik: 8,4 %).',
    tablazat: true,
    mezok,
    tippek: [
      'Hány tőkésítési periódus van egy évben, és mennyi a periódusonkénti kamatláb mindegyik esetben?',
      `Periódusonkénti kamatláb: ${f(r)} % : m, kamattényező: 1 + ${f(r)}/(100·m); m = 1, 2, 4, 12. Egy évben m periódus van.`,
      'Az összeg: 400 000 · (kamattényező)ᵐ; a tényleges kamatláb: (kamattényező^m − 1) · 100.',
    ],
    megoldas: sorok.map(([m, nev]) => {
      const q = katenyezo(r, m);
      return `${nev[0].toUpperCase() + nev.slice(1)}: kamattényező ${q4(q)}, ${m} periódus → ${f0(PV)} · ${hatv(q, m)} = ${f0(PV)} · ${f(Math.pow(q, m), 6)} ≈ <strong>${ft(fv(m))}</strong>; tényleges kamatláb: <strong>${f(tenyleges(r, m), 2)} %</strong>.`;
    }),
    magyarazat: [
      `Mind a négy esetben ugyanazt a ${ft(PV)}-ot kamatoztatjuk egy évig, az éves névleges ${f(r)} %-kal. A különbség csak az, hogy a kamatot hányszor írják jóvá egy év alatt (m = 1, 2, 4, 12).`,
      `Minden esetben arányosítunk: periódusonként ${f(r)} % : m, a kamattényező 1 + ${f(r)}/(100·m), és m periódus van egy évben. Évente: ${q4(katenyezo(r, 1))}¹, félévente ${q4(katenyezo(r, 2))}², negyedévente ${q4(katenyezo(r, 4))}⁴, havonta ${q4(katenyezo(r, 12))}¹².`,
      `Minél gyakrabban írják jóvá a kamatot, annál hamarabb kezd el kamatozni maga a kamat is, ezért az összeg és a tényleges kamatláb is egyre nagyobb: ${f(tenyleges(r, 1), 2)} % → ${f(tenyleges(r, 2), 2)} % → ${f(tenyleges(r, 4), 2)} % → ${f(tenyleges(r, 12), 2)} %.`,
      `Józan ésszel: a növekedés lassul – az évente és félévente közötti különbség nagyobb, mint a negyedévente és havonta közötti. Gyakoribb tőkésítésnél van egy határ.`,
    ],
    jegyezze: 'Gyakoribb tőkésítés → nagyobb tényleges kamatláb (de nem a végtelenségig): r_tényleges = ((1 + r/(100·m))ᵐ − 1) · 100.',
  };
}

function banki_e() {
  const a = p5Epit({ PV: 5200000, r: 12, m: 12, months: 36 }, true);
  const b = p6Epit({ r: 12, m: 12 }, true);
  const [mezoA] = a.mezok, [mezoB] = b.mezok;
  return {
    szoveg: `Valaki ${ft(5200000)} hitelt vesz fel 3 évre, éves névleges 12 %-os kamattal, havi kamatszámítással; a teljes összeget a futamidő végén kell visszafizetni. Mennyit kell visszafizetnie, és mekkora a hitel tényleges éves kamatlába?`,
    tablazat: true,
    mezok: [{ ...mezoA, id: 'fv', cimke: 'Visszafizetendő összeg (Ft)' }, { ...mezoB, id: 'tenyl', cimke: 'Tényleges éves kamatláb (%, két tizedesre)' }],
    tippek: [
      'Hány hónap a 3 év, és mennyi a havi kamatláb, ha az éves névleges kamat 12 %?',
      ...a.tippek.slice(1, 2), b.tippek[2],
    ],
    megoldas: [...a.megoldas, ...b.megoldas.slice(1)],
    magyarazat: [...a.magyarazat.slice(0, 4), ...b.magyarazat.slice(1, 3)],
    jegyezze: 'Évközi kamatozás: arányosítunk, és a periódusok számára hatványozunk; a tényleges kamatláb ennél a névlegesnél nagyobb.',
  };
}

export const FIX_FELADATOK = [
  { id: 'F1', nev: '50 000 Ft, 3 %, 20 év', epit: () => p1Epit({ PV: 50000, r: 3, n: 20 }) },
  { id: 'F2', nev: 'Kölcsön 4 %, 5 év múlva 210 000 Ft', epit: () => p2Epit({ FV: 210000, r: 4, n: 5 }, true) },
  { id: 'F3', nev: 'Hitel 800 000 Ft, 3,5 %, visszafizetés 918 000 Ft', epit: () => p3Epit({ PV: 800000, FV: 918000, r: 3.5, n: 4 }, true) },
  { id: 'F4', nev: 'Hitel 700 000 Ft, 5 év, 959 061 Ft', epit: () => p4Epit({ PV: 700000, FV: 959061, n: 5, r: 6.5 }, true) },
  { id: 'F5', nev: 'Hitel 300 000 Ft, havi kamatozás, névleges 9,6 %, 5 hónap', epit: () => p5Epit({ PV: 300000, r: 9.6, m: 12, months: 5 }, true) },
  { id: 'F6', nev: '400 000 Ft, névleges 8,4 % – különböző tőkésítések', epit: osszehasonlitas },
  { id: 'F7', nev: 'Banki ajánlat a): 12 %, 6 év, 10 658 643 Ft', epit: () => p2Epit({ FV: 10658643, r: 12, n: 6 }, true) },
  { id: 'F8', nev: 'Banki ajánlat b): 6 millió, 4 év, 8 315 152 Ft', epit: () => p4Epit({ PV: 6000000, FV: 8315152, n: 4, r: 8.5 }, true) },
  { id: 'F9', nev: 'Banki ajánlat c): 5 millió, 9,8 %, 8 év', epit: () => p1Epit({ PV: 5000000, r: 9.8, n: 8 }, true) },
  { id: 'F10', nev: 'Banki ajánlat d): 5,8 millió, 10,2 %, 11 447 197 Ft', epit: () => p3Epit({ PV: 5800000, FV: 11447197, r: 10.2, n: 7 }, true) },
  { id: 'F11', nev: 'Banki ajánlat e): 5,2 millió, 3 év, havi kamatozás, 12 %', epit: banki_e },
];

// =====================================================================
// Ábra: kamatos (exponenciális) és egyszerű (lineáris) kamat – 80 000 Ft, 8 %, 0–20 év
// =====================================================================
export function kamatAbra({ PV = 80000, r = 8, evek = 20 } = {}) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const W = 560, H = 380, bal = 74, jobb = 16, fent = 54, lent = 52;
  const iw = W - bal - jobb, ih = H - fent - lent;
  const ymax = 400000;
  const lepes = iw / (evek + 1);
  const py = (v) => fent + ih - (v / ymax) * ih;
  const kozep = (i) => bal + lepes * (i + 0.5);
  const kamatos = (i) => PV * Math.pow(1 + r / 100, i);
  const egyszeru = (i) => PV * (1 + (i * r) / 100);
  const leiras = `${f0(PV)} Ft értéke 0–${evek} évig ${f(r)} %-os kamattal: a kamatos kamat oszlopai egyre gyorsabban nőnek (${evek} év után ${f0(kamatos(evek))} Ft), az egyszerű kamat egyenesen halad (${f0(egyszeru(evek))} Ft).`;
  const s = [];
  s.push(`<svg class="abra" style="max-width:640px" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(leiras)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(leiras)}</title>`);
  for (let v = 0; v <= ymax; v += 100000) {
    s.push(`<line class="abra-racs" x1="${bal}" y1="${py(v)}" x2="${W - jobb}" y2="${py(v)}"/>`);
    s.push(`<text class="abra-skala" x="${bal - 8}" y="${py(v) + 5}" text-anchor="end">${esc(f0(v))}</text>`);
  }
  for (let i = 0; i <= evek; i++) {
    s.push(`<rect class="abra-oszlop" x="${(kozep(i) - lepes * 0.36).toFixed(2)}" y="${py(kamatos(i)).toFixed(2)}" width="${(lepes * 0.72).toFixed(2)}" height="${(fent + ih - py(kamatos(i))).toFixed(2)}"><title>${i}. év: ${esc(f0(kamatos(i)))} Ft</title></rect>`);
    if (i % 5 === 0) s.push(`<text class="abra-skala" x="${kozep(i)}" y="${fent + ih + 20}" text-anchor="middle">${i}</text>`);
  }
  s.push(`<line class="abra-tengely" x1="${bal}" y1="${fent + ih}" x2="${W - jobb}" y2="${fent + ih}"/>`);
  s.push(`<line class="abra-tengely" x1="${bal}" y1="${fent - 6}" x2="${bal}" y2="${fent + ih}"/>`);
  const pontok = Array.from({ length: evek + 1 }, (_, i) => `${kozep(i).toFixed(2)},${py(egyszeru(i)).toFixed(2)}`).join(' ');
  s.push(`<polyline class="abra-vonal v2" points="${pontok}"/>`);
  for (let i = 0; i <= evek; i += 5) s.push(`<circle class="abra-pont-v2" cx="${kozep(i)}" cy="${py(egyszeru(i))}" r="4"/>`);
  s.push(`<text class="abra-cimke" x="${kozep(evek) - 2}" y="${py(kamatos(evek)) - 9}" text-anchor="end">${esc(f0(ft0(kamatos(evek))))} Ft</text>`);
  s.push(`<text class="abra-cimke v2" x="${kozep(evek) - 4}" y="${py(egyszeru(evek)) + 24}" text-anchor="end">${esc(f0(egyszeru(evek)))} Ft</text>`);
  s.push(`<text class="abra-felirat" x="${bal + iw / 2}" y="${H - 8}" text-anchor="middle">idő (év)</text>`);
  s.push(`<text class="abra-felirat" x="${bal}" y="${fent - 26}" text-anchor="start">összeg (Ft)</text>`);
  // jelmagyarázat
  s.push(`<rect class="abra-oszlop" x="${bal + 150}" y="${fent - 38}" width="14" height="12"/>`);
  s.push(`<text class="abra-skala" x="${bal + 170}" y="${fent - 28}">kamatos kamat (exponenciális)</text>`);
  s.push(`<line class="abra-vonal v2" x1="${bal + 150}" y1="${fent - 14}" x2="${bal + 164}" y2="${fent - 14}"/>`);
  s.push(`<text class="abra-skala" x="${bal + 170}" y="${fent - 10}">egyszerű kamat (lineáris)</text>`);
  s.push('</svg>');
  return s.join('');
}

const abraFelirat = (() => {
  const l20 = 80000 * Math.pow(1.08, 20), l19 = 80000 * Math.pow(1.08, 19);
  return `Az első évben a kamat ${f0(6400)} Ft (a 80 000 Ft 8 %-a), a huszadik évben már ${f0(l20 - l19)} Ft (a ${f0(l19)} Ft 8 %-a): a kamatos kamat „lépcsői” egyre nagyobbak, mert egyre nagyobb összegnek vesszük a 8 %-át. Az egyszerű kamatnál minden évben ugyanannyi, ${f0(6400)} Ft a lépcső.`;
})();

// =====================================================================
// A téma leírása
// =====================================================================
export default {
  id: 'penzugy',
  cim: 'Pénzügyi számítások (kamatos kamat)',
  rovid: 'Jövőérték, jelenérték, futamidő és kamatláb, évközi kamatozás és tényleges kamatláb – egyetlen képlettel.',
  kulcskeplet: '<span class="keplet-nagy">PV · (1 + r/100)<sup>n</sup> = FV</span>',
  kulcsMagyarazat: [
    'PV = jelenérték (<em>present value</em>, a mai pénz: betett összeg / felvett kölcsön), FV = jövőérték (<em>future value</em>: felnövekedett összeg / visszafizetendő összeg), r = éves kamatláb (%), n = kamatozó periódusok (évek) száma.',
    '<strong>(1 + r/100)</strong> a <strong>kamattényező</strong> – nem r és nem r/100! (8 % → 1,08; 0,5 % → 1,005.)',
  ],
  elmelet: [
    '<strong>Kamatos kamat:</strong> a második évtől a korábbi kamat is kamatozik. Ezért évről évre a kamattényezővel szorzunk tovább: n év után a kamattényező <strong>n-edik hatványával</strong>. <strong>Hitelnél ugyanez a képlet:</strong> a felvett kölcsön a PV, a futamidő végén egy összegben visszafizetett összeg az FV.',
    'A függvény <strong>nem lineáris, hanem exponenciális</strong>: a grafikonon a lépcsők (az éves kamatok) egyre nagyobbak, mert egyre nagyobb összegnek vesszük a 8 %-át. (Lásd az ábrát: a 80 000 Ft · 1,08<sup>n</sup> értékei 0–20 évre, az egyszerű kamattal összevetve.)',
    '<strong>Egy képlet, négy kérdéstípus</strong> – mindig tudni kell, melyik betű az ismeretlen, és mit hová helyettesítünk:<ol><li><strong>FV</strong> ismeretlen → szorzás a kamattényező hatványával.</li><li><strong>PV</strong> ismeretlen → visszafelé haladunk az időben → <strong>osztás</strong> a kamattényező hatványával (kisebb szám jön ki, mint FV).</li><li><strong>n</strong> ismeretlen → osztás PV-vel, majd <strong>logaritmus</strong> („lecsalogatja a kitevőt”: lg(q<sup>n</sup>) = n · lg q): n = lg(FV/PV) : lg(1 + r/100). Járható út a <strong>próbálgatás</strong> egész n-ekkel is.</li><li><strong>r</strong> ismeretlen → osztás PV-vel, majd <strong>n-edik gyök</strong>: 1 + r/100 = <sup>n</sup>√(FV/PV); utána −1, ·100.</li></ol>Egyenletnél <strong>minden műveletet mindkét oldalon</strong> el kell végezni (a logaritmust is).',
    '<strong>Évközi kamatozás:</strong> az éves (<strong>névleges</strong>) kamatlábat <strong>arányosítjuk</strong>: havonta r/12, negyedévente r/4, félévente r/2; a periódusok száma ennyiszer több (pl. 7 hónap → 7. hatvány). Vigyázat a nullákkal: <strong>fél % → 1,005</strong> (két nulla), 5 % → 1,05, 0,05 % → 1,0005.',
    '<strong>Tényleges (effektív) éves kamatláb:</strong> ha gyakrabban tőkésítenek, kicsit többet kapunk, mert hamarabb kezd kamatozni a kamat: r<sub>tényleges</sub> = ((1 + r/(100·m))<sup>m</sup> − 1) · 100. Gyakoribb tőkésítés → nagyobb, <strong>de nem nő a végtelenségig</strong> (18 %-nál a határ ≈ 19,72 %, e<sup>0,18</sup> − 1).',
    '<strong>Eszközök.</strong> <em>Excelben:</em> jövőérték: <code>=80000*HATVÁNY(1,08;A2)</code> vagy soronként <code>=előző*1,08</code>; periódusszám: <code>=PER.SZÁM(0,05;0;-120000;186160)</code> → 9; kamatláb: <code>=RÁTA(6;0;-400000;520904)</code> → 4,5 %. <strong>A jelenértéket és a jövőértéket ellentétes előjellel kell megadni</strong> (az egyik pénz befelé, a másik kifelé áramlik), különben hibát ad; a rátát tizedes törtként (0,05) vagy %-ként (5%) kell beírni; a részlet itt 0 vagy üres. <em>GeoGebrában</em> gyökvonás: a beviteli billentyűzet <em>f(x)</em> részén az n-edik gyök; tizedes<strong>pont</strong>tal (1.3022).',
  ],
  elmeletAbra: () => kamatAbra(),
  elmeletAbraFelirat: abraFelirat,
  peldak: [
    { cim: 'Jövőérték – 80 000 Ft, 8 %', feladat: '80 000 Ft-ot teszünk be évi 8 %-os kamatra. Mennyi lesz a számlán 1, 2, 3 év múlva, és mennyi 20 év múlva?',
      abra: () => kamatAbra(),
      lepesek: ['Kamattényező: 1 + 8/100 = 1,08.', '1 év: 80 000 · 1,08 = <strong>86 400 Ft</strong>.', '2 év: 80 000 · 1,08² = <strong>93 312 Ft</strong>.', '3 év: 80 000 · 1,08³ = 100 776,96 ≈ <strong>100 777 Ft</strong>.', 'n év: 80 000 · 1,08<sup>n</sup>; 20 év: 80 000 · 1,08²⁰ ≈ <strong>372 877 Ft</strong> (a betét kb. 4,7-szerese). Ez exponenciális függvény: a lépcsők egyre nagyobbak.'] },
    { cim: 'Jelenérték', feladat: '10 %-os kamat mellett 2 év múlva 150 000 Ft lett a számlán. Mennyit tettünk be?',
      lepesek: ['Az ismeretlen a jelenérték (PV); kamattényező: 1,1.', 'Visszafelé haladunk az időben → osztás: PV = 150 000 : 1,1².', 'PV = 150 000 : 1,21 = 123 966,94 ≈ <strong>123 967 Ft</strong>.'] },
    { cim: 'Periódusszám', feladat: '120 000 Ft-ot 5 %-os kamatra helyeztünk el, és 186 160 Ft-ot vehettünk fel. Hány évig állt a pénz a számlán?',
      lepesek: ['Osztás PV-vel: 1,05<sup>n</sup> = 186 160 : 120 000 = 1,5513.', 'Logaritmus mindkét oldalon: n · lg 1,05 = lg 1,5513.', 'n = lg 1,5513 : lg 1,05 ≈ <strong>9 év</strong>.', 'Excelben: <code>=PER.SZÁM(0,05;0;-120000;186160)</code> → 9.'] },
    { cim: 'Kamatláb', feladat: '400 000 Ft-ot helyeztünk el, és 6 év múlva 520 904 Ft-ot vehettünk fel. Mekkora az éves kamatláb?',
      lepesek: ['Osztás PV-vel: (1 + r/100)⁶ = 520 904 : 400 000 = 1,30226.', 'Hatodik gyök: 1 + r/100 = <sup>6</sup>√1,30226 ≈ 1,045.', 'r = (1,045 − 1) · 100 = <strong>4,5 %</strong>.', 'Excelben: <code>=RÁTA(6;0;-400000;520904)</code> → 4,5 %.'] },
    { cim: 'Havi kamatozás', feladat: '200 000 Ft-ot helyezünk el éves névleges 6 %-os kamatra, havi tőkésítéssel. Mennyi lesz a számlán 7 hónap múlva?',
      lepesek: ['Arányosítás: 6 % : 12 = 0,5 % havonta.', 'Kamattényező: 1 + 0,5/100 = 1,005 (két nulla!).', '7 hónap = 7 periódus: 200 000 · 1,005⁷ = 207 105,88 ≈ <strong>207 106 Ft</strong>.'] },
    { cim: 'Tényleges kamatláb', feladat: '100 000 Ft, éves névleges kamat 18 %. Mennyi lesz 1 év múlva, és mekkora a tényleges éves kamatláb, ha a kamatot évente, félévente, negyedévente, havonta tőkésítik?',
      lepesek: [
        'Periódusonkénti kamatláb: évente 18 %, félévente 9 %, negyedévente 4,5 %, havonta 1,5 %.',
        'Egy év múlva: 100 000 · 1,18 = 118 000; · 1,09² = 118 810; · 1,045⁴ = <strong>119 252</strong> (negyedévente); · 1,015¹² = 119 562.',
        `<table class="tabla"><thead><tr><th>tőkésítés</th><th>periódus-kamatláb</th><th>1 év múlva</th><th>tényleges éves kamatláb</th></tr></thead><tbody><tr><td>évente</td><td>18 %</td><td>118 000 Ft</td><td>18 %</td></tr><tr><td>félévente</td><td>9 % (2×)</td><td>118 810 Ft</td><td>18,81 %</td></tr><tr><td>negyedévente</td><td>4,5 % (4×)</td><td><strong>119 252 Ft</strong></td><td>19,25 %</td></tr><tr><td>havonta</td><td>1,5 % (12×)</td><td>119 562 Ft</td><td>19,56 %</td></tr></tbody></table>`,
        'Gyakoribb tőkésítés → nagyobb tényleges kamatláb, de nem nő a végtelenségig: a határ 18 %-nál ≈ 19,72 % (e<sup>0,18</sup> − 1).',
      ] },
    { cim: 'Összetett – banki ajánlatok', feladat: 'a) 12 %, 6 év, visszafizetés 10 658 643 Ft – mekkora a kölcsön? b) 6 millió Ft, 4 év, 8 315 152 Ft – mekkora a kamatláb? c) 5 millió Ft, 9,8 %, 8 év – mennyi a visszafizetés? d) 5,8 millió Ft, 10,2 %, 11 447 197 Ft – hány év? e) 5,2 millió Ft, 3 év, havi kamatozás, névleges 12 % – mennyi a visszafizetés és mekkora a tényleges kamatláb?',
      lepesek: [
        'a) PV = 10 658 643 : 1,12⁶ = <strong>5 400 000 Ft</strong>.',
        'b) (1 + r/100)⁴ = 8 315 152 : 6 000 000 = 1,385859 → 1 + r/100 = <sup>4</sup>√1,385859 = 1,085 → <strong>8,5 %</strong>.',
        'c) FV = 5 000 000 · 1,098⁸ ≈ <strong>10 563 035 Ft</strong>.',
        'd) 1,102<sup>n</sup> = 11 447 197 : 5 800 000 = 1,973655 → n = lg 1,973655 : lg 1,102 ≈ <strong>7 év</strong>.',
        'e) Havi kamat 12 % : 12 = 1 % → tényező 1,01; 3 év = 36 hónap: 5 200 000 · 1,01³⁶ ≈ <strong>7 439 998 Ft</strong>. Tényleges kamatláb: (1,01¹² − 1) · 100 ≈ <strong>12,68 %</strong>.',
      ] },
  ],
  fixek: FIX_FELADATOK,
  tipusok: [
    { id: 'P1', nev: 'Jövőérték', general: P1 },
    { id: 'P2', nev: 'Jelenérték (betét vagy kölcsön)', general: P2 },
    { id: 'P3', nev: 'Periódusszám (futamidő)', general: P3 },
    { id: 'P4', nev: 'Kamatláb', general: P4 },
    { id: 'P5', nev: 'Évközi kamatozás', general: P5 },
    { id: 'P6', nev: 'Tényleges éves kamatláb', general: P6 },
    { id: 'P7', nev: 'Kamattényező', general: P7 },
    { id: 'P8', nev: 'Vegyes „banki ajánlat”', general: P8 },
  ],
  /** A SPEC kidolgozott példáinak és gyakorló feladatainak végeredményei – a tesztek ezt vetik össze a SPEC-kel. */
  peldaEllenorzes() {
    const kerek = (x) => kerekit(x, 0);
    const k2 = (x) => kerekit(x, 2);
    const k1 = (x) => kerekit(x, 1);
    return [
      { nev: '1. példa: 80 000 Ft, 8 %, 1 év', kapott: kerek(jovoertek(80000, 8, 1)), vart: 86400 },
      { nev: '1. példa: 2 év', kapott: kerek(jovoertek(80000, 8, 2)), vart: 93312 },
      { nev: '1. példa: 3 év (két tizedes)', kapott: k2(jovoertek(80000, 8, 3)), vart: 100776.96 },
      { nev: '1. példa: 3 év (egészre)', kapott: kerek(jovoertek(80000, 8, 3)), vart: 100777 },
      { nev: '1. példa: 20 év', kapott: kerek(jovoertek(80000, 8, 20)), vart: 372877 },
      { nev: '1. példa: 20 év / betét ≈ 4,7', kapott: k1(jovoertek(80000, 8, 20) / 80000), vart: 4.7 },
      { nev: '2. példa: jelenérték', kapott: k2(jelenertek(150000, 10, 2)), vart: 123966.94 },
      { nev: '2. példa: jelenérték (egészre)', kapott: kerek(jelenertek(150000, 10, 2)), vart: 123967 },
      { nev: '3. példa: periódusszám', kapott: kerek(periodusszam(120000, 186160, 5)), vart: 9 },
      { nev: '3. példa: hányados', kapott: kerekit(186160 / 120000, 4), vart: 1.5513 },
      { nev: '4. példa: kamatláb', kapott: k1(kamatlab(400000, 520904, 6)), vart: 4.5 },
      { nev: '4. példa: hányados', kapott: kerekit(520904 / 400000, 5), vart: 1.30226 },
      { nev: '5. példa: havi kamatozás', kapott: kerek(evkozi(200000, 6, 12, 7)), vart: 207106 },
      { nev: '5. példa: két tizedes', kapott: k2(evkozi(200000, 6, 12, 7)), vart: 207105.88 },
      { nev: '6. példa: évente', kapott: kerek(evkozi(100000, 18, 1, 1)), vart: 118000 },
      { nev: '6. példa: félévente', kapott: kerek(evkozi(100000, 18, 2, 2)), vart: 118810 },
      { nev: '6. példa: negyedévente', kapott: kerek(evkozi(100000, 18, 4, 4)), vart: 119252 },
      { nev: '6. példa: havonta', kapott: kerek(evkozi(100000, 18, 12, 12)), vart: 119562 },
      { nev: '6. példa: tényleges évente', kapott: k2(tenyleges(18, 1)), vart: 18 },
      { nev: '6. példa: tényleges félévente', kapott: k2(tenyleges(18, 2)), vart: 18.81 },
      { nev: '6. példa: tényleges negyedévente', kapott: k2(tenyleges(18, 4)), vart: 19.25 },
      { nev: '6. példa: tényleges havonta', kapott: k2(tenyleges(18, 12)), vart: 19.56 },
      { nev: '6. példa: határ (e^0,18 − 1)', kapott: k2((Math.exp(0.18) - 1) * 100), vart: 19.72 },
      { nev: '7/a: kölcsön', kapott: kerek(jelenertek(10658643, 12, 6)), vart: 5400000 },
      { nev: '7/b: kamatláb', kapott: k1(kamatlab(6000000, 8315152, 4)), vart: 8.5 },
      { nev: '7/c: visszafizetés', kapott: kerek(jovoertek(5000000, 9.8, 8)), vart: 10563035 },
      { nev: '7/d: futamidő', kapott: kerek(periodusszam(5800000, 11447197, 10.2)), vart: 7 },
      { nev: '7/e: visszafizetés', kapott: kerek(evkozi(5200000, 12, 12, 36)), vart: 7439998 },
      { nev: '7/e: tényleges kamatláb', kapott: k2(tenyleges(12, 12)), vart: 12.68 },
      { nev: 'Pár 1: 50 000 Ft, 3 %, 20 év', kapott: kerek(jovoertek(50000, 3, 20)), vart: 90306 },
      { nev: 'Pár 1: két tizedes', kapott: k2(jovoertek(50000, 3, 20)), vart: 90305.56 },
      { nev: 'Pár 2: kölcsön 4 %, 5 év, 210 000 Ft', kapott: kerek(jelenertek(210000, 4, 5)), vart: 172605 },
      { nev: 'Pár 3: hitel 800 000 Ft, 3,5 %, 918 000 Ft', kapott: kerek(periodusszam(800000, 918000, 3.5)), vart: 4 },
      { nev: 'Pár 4: hitel 700 000 Ft, 5 év, 959 061 Ft', kapott: k1(kamatlab(700000, 959061, 5)), vart: 6.5 },
      { nev: 'Pár 5: hitel 300 000 Ft, havi 9,6 %, 5 hónap', kapott: kerek(evkozi(300000, 9.6, 12, 5)), vart: 312194 },
      { nev: 'Pár 6: 400 000 Ft, 8,4 % – évente', kapott: kerek(evkozi(400000, 8.4, 1, 1)), vart: 433600 },
      { nev: 'Pár 6: félévente', kapott: kerek(evkozi(400000, 8.4, 2, 2)), vart: 434306 },
      { nev: 'Pár 6: negyedévente', kapott: kerek(evkozi(400000, 8.4, 4, 4)), vart: 434673 },
      { nev: 'Pár 6: havonta', kapott: kerek(evkozi(400000, 8.4, 12, 12)), vart: 434924 },
      { nev: 'Pár 6: tényleges évente', kapott: k2(tenyleges(8.4, 1)), vart: 8.4 },
      { nev: 'Pár 6: tényleges félévente', kapott: k2(tenyleges(8.4, 2)), vart: 8.58 },
      { nev: 'Pár 6: tényleges negyedévente', kapott: k2(tenyleges(8.4, 4)), vart: 8.67 },
      { nev: 'Pár 6: tényleges havonta', kapott: k2(tenyleges(8.4, 12)), vart: 8.73 },
    ];
  },
};
