// F3 – Szöveges feladatok, egyenletek
import { egesz, valaszt } from '../lib/rng.js';
import { szep } from '../lib/szam.js';
import { probal, f, tisztit } from '../temak/seged.js';
import { egyMezos, gcd } from './seged.js';

// ---- Tiszta megoldók ----
/** (2x + p % · x + c) · k = R → x */
export const gondoltSzam = (R, p, c, k) => tisztit((R / k - c) / (2 + p / 100));
/** a : b arányú osztás, összeg S → a nagyobb rész és a kisebb rész különbsége */
export const aranyKulonbseg = (a, b, S) => ((a - b) * S) / (a + b);
export const kigyok = (T, k) => T / (2 + 6 * k);
export const szamokDarab = (A1, A2, h, S) => (S - h * A2) / (A1 - A2);
export const harmadikEpulet = (T, a, b, c) => (T - 2 * b - a - c) / 4;
export const otvenesek = (n, V, kis, nagy) => (V - kis * n) / (nagy - kis);

const KSZR = { 2: 'kétszeresére', 3: 'háromszorosára', 4: 'négyszeresére', 5: 'ötszörösére' };
const KSZ2 = { 2: 'kétszerese', 3: 'háromszorosa', 4: 'négyszerese', 5: 'ötszöröse' };
const SZO = { 2: 'kétszer', 3: 'háromszor', 4: 'négyszer' };

// ---- Z1: gondoltam egy számot ----
function Z1(rng) {
  return probal(() => {
    const x = 10 * egesz(rng, 1, 12);
    const p = valaszt(rng, [10, 20, 25, 30, 40, 50, 60]);
    const c = egesz(rng, 2, 12), k = egesz(rng, 2, 5);
    const R = k * ((2 + p / 100) * x + c);
    if (!szep(R, 0)) return null;
    const bel = tisztit((2 + p / 100) * x + c);
    return egyMezos({
      szoveg: `Gondoltam egy számot. A kétszereséhez hozzáadtam a gondolt szám ${p} %-át és még ${c} egységet. Az így kapott összeget ${KSZR[k]} növeltem, és ${f(R)} lett az eredmény. Melyik számra gondoltam?`,
      cimke: 'A gondolt szám', helyes: x, tizedes: 0,
      hibak: [
        { ertek: tisztit((R / k - c) / 2), uzenet: `A gondolt szám ${p} %-át is hozzáadtuk, nemcsak a kétszeresét: együtt a szám ${f(2 + p / 100, 2)} szorosa lett.` },
        { ertek: tisztit((R - c) / (2 + p / 100)), uzenet: `A hozzáadás a szorzás előtt történt, ezért előbb a szorzást kell visszafordítani (osztani kell a szorzóval).` },
      ],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} lenne a gondolt szám, akkor (2 · ${f(w)} + ${p} %-a + ${f(c)}) · ${k} = ${f(((2 + p / 100) * w + c) * k, 2)} jönne ki, de ${f(R)} kellene.`,
      tippek: [
        'Melyik műveletet végezték el utoljára, és hogyan lehet azt visszacsinálni?',
        `Az utolsó lépés a ${KSZR[k]} növelés. Visszafelé osszuk el a szorzóval (${k}): ${f(R)} : ${k} = ${f(R / k)}.`,
        `Most ${f(R / k)} = (2 + ${f(p / 100, 2)}) · x + ${f(c)}, vagyis ${f(2 + p / 100, 2)}x + ${f(c)} = ${f(R / k)}.`,
      ],
      megoldas: [
        `Legyen a gondolt szám x. A szám ${p} %-a ${f(p / 100, 2)}x, így az összeg: 2x + ${f(p / 100, 2)}x + ${f(c)} = ${f(2 + p / 100, 2)}x + ${f(c)}.`,
        `Ennek a ${KSZ2[k]} ${f(R)}: (${f(2 + p / 100, 2)}x + ${f(c)}) · ${k} = ${f(R)}.`,
        `Osztunk a szorzóval (${k}): ${f(2 + p / 100, 2)}x + ${f(c)} = ${f(R / k)}; kivonunk ${f(c)} egységet: ${f(2 + p / 100, 2)}x = ${f(bel - c)}.`,
        `x = ${f(bel - c)} : ${f(2 + p / 100, 2)} = <strong>${f(x)}</strong>.`,
      ],
      magyarazat: [
        `A feladat egy kitalálós játék: ismerjük az utolsó eredményt, és visszafelé haladunk. Minden műveletet az ellenkezőjével kell visszacsinálni.`,
        `Az utolsó művelet a ${KSZR[k]} növelés, ezért osztunk a szorzóval (${k}): ${f(R)} : ${k} = ${f(R / k)}. Előtte hozzáadtunk ${f(c)} egységet, ezért kivonjuk: ${f(R / k)} − ${f(c)} = ${f(bel - c)}.`,
        `Mielőtt a ${f(c)} egységet hozzáadtuk, a szám a kétszeres plusz a szám ${p} %-a volt. Ez összesen a gondolt szám ${f(2 + p / 100, 2)} szorosa (100-ból például ${f(200 + p)} lenne). Ezért ${f(bel - c)} : ${f(2 + p / 100, 2)} = ${f(x)}.`,
        `Józan ésszel: ellenőrizzünk előre. 2 · ${f(x)} = ${f(2 * x)}, ennek a ${p} %-át ${f(tisztit((p / 100) * x))} adjuk hozzá, és még ${f(c)}: ${f(bel)}. Ennek a ${KSZ2[k]} ${f(R)}, ahogy a feladat mondja.`,
      ],
      jegyezze: 'Gondoltam egy számot: fordítsd meg a műveleteket a végétől visszafelé, vagy írj fel egyenletet x-szel.',
    });
  });
}

// ---- Z2: arányos osztás ----
function Z2(rng) {
  return probal(() => {
    const a = egesz(rng, 3, 9), b = egesz(rng, 2, a - 1);
    if (gcd(a, b) !== 1) return null;
    const x = egesz(rng, 3, 15);
    const S = (a + b) * x;
    const h = (a - b) * x;
    return egyMezos({
      szoveg: `Bandi és Gizi almát szedett. A szedett mennyiségük aránya ${a} : ${b}, összesen ${f(S)} kg almát szedtek. Hány kilogrammal szedett több Bandi, mint Gizi?`,
      cimke: 'A különbség', egyseg: 'kg', helyes: h, tizedes: 0,
      hibak: [
        { ertek: a * x, uzenet: 'Ez Bandi almája. A kérdés a két mennyiség különbsége.' },
        { ertek: b * x, uzenet: 'Ez Gizi almája. A kérdés a két mennyiség különbsége.' },
        { ertek: a - b, uzenet: 'Az arányszámok különbsége még nem kilogramm: meg kell szorozni egy „egység” súlyával.' },
      ],
      ellenproba: (w) => `Ellenpróba: ha a különbség ${f(w)} kg, akkor az egy arányszám ${f(w / (a - b), 2)} kg, és az összeg (${a} + ${b}) · ${f(w / (a - b), 2)} = ${f(((a + b) * w) / (a - b), 2)} kg lenne, de ${f(S)} kg kellene.`,
      tippek: [
        `Hány egyenlő részre oszlik az összes alma, ha Bandi ${a} részt, Gizi ${b} részt szedett?`,
        `Összesen ${a + b} rész, ezért 1 rész ${f(S)} : ${a + b} = ${f(x)} kg.`,
        `Bandi ${a - b} résszel szedett több.`,
      ],
      megoldas: [
        `Összesen ${a} + ${b} = ${a + b} rész.`,
        `1 rész: ${f(S)} : ${a + b} = ${f(x)} kg.`,
        `A különbség ${a} − ${b} = ${a - b} rész: ${a - b} · ${f(x)} = <strong>${f(h)}</strong> kg.`,
      ],
      magyarazat: [
        `Az ${a} : ${b} arány azt jelenti, hogy Bandi ${a} egyforma adagot, Gizi ${b} ugyanakkora adagot szedett. Együtt ${a + b} adag az összes alma.`,
        `Egy adag súlya: ${f(S)} : ${a + b} = ${f(x)} kg. Bandi ${f(a * x)} kg-ot, Gizi ${f(b * x)} kg-ot szedett.`,
        `A különbség ${a - b} adag, azaz ${f(h)} kg. Józan ésszel: ${f(a * x)} + ${f(b * x)} = ${f(S)}, és ${f(a * x)} − ${f(b * x)} = ${f(h)}.`,
      ],
      jegyezze: 'Arányos osztás: add össze az arányszámokat, oszd el velük az összeget (ez az egy rész), és szorozd azzal, ahány rész kell.',
    });
  });
}

// ---- Z3: békák és kígyók ----
function Z3(rng) {
  return probal(() => {
    const k = egesz(rng, 2, 4), s = egesz(rng, 3, 20);
    const T = s * (2 + 6 * k);
    return egyMezos({
      szoveg: `Egy nádasban ${SZO[k]} annyi béka él, mint kígyó. Az állatok szemeinek és lábainak száma összesen ${f(T)}. (Minden békának 2 szeme és 4 lába van, a kígyóknak 2 szemük van, lábuk nincs.) Hány kígyó él a nádasban?`,
      cimke: 'A kígyók száma', helyes: s, tizedes: 0,
      hibak: [
        { ertek: s * k, uzenet: 'Ez a békák száma. A kérdés a kígyók száma.' },
        { ertek: T / (2 + 4 * k), uzenet: 'A békának a 2 szeme is számít (2 szem + 4 láb = 6), és a kígyók szeme is.' },
      ],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} kígyó lenne, akkor ${k} · ${f(w)} = ${f(k * w)} béka lenne, és a szemek és lábak száma ${f(2 * w + 6 * k * w)} lenne, de ${f(T)} kellene.`,
      tippek: [
        'Hány szeme és lába van egy kígyóra és hozzá tartozó békákra együtt?',
        `Egy kígyóra ${k} béka jut. A kígyónak 2 szeme van, a ${k} békának ${k} · 6 = ${6 * k} szeme és lába együtt.`,
        `Egy „csoport” (1 kígyó és ${k} béka) ${2 + 6 * k} szemet és lábat jelent.`,
      ],
      megoldas: [
        `Egy kígyó 2 szem; egy béka 2 + 4 = 6 szem és láb.`,
        `${k} béka ${6 * k}, plusz a kígyó 2: egy csoportban ${2 + 6 * k}.`,
        `${f(T)} : ${2 + 6 * k} = <strong>${f(s)}</strong> kígyó.`,
      ],
      magyarazat: [
        `Érdemes csoportokban gondolkodni: egy kígyóhoz ${k} béka tartozik. A kígyó egyedül 2 szemet ad.`,
        `Egy béka 2 szemet és 4 lábat, tehát 6 darabot ad. ${k} béka ${6 * k}, ezért a csoport összesen ${2 + 6 * k} szemet és lábat tartalmaz.`,
        `Az összes darabszámból megkapjuk a csoportok számát: ${f(T)} : ${2 + 6 * k} = ${f(s)}. Józan ésszel: ${f(s)} kígyó mellett ${f(k * s)} béka él, és ${f(s)} · 2 + ${f(k * s)} · 6 = ${f(T)}.`,
      ],
      jegyezze: 'Ha egy csoportban több fajta él, számold ki, mennyit ad egy csoport, és oszd el vele az összeget.',
    });
  });
}

// ---- Z4: átlag, törölt számok ----
function Z4(rng) {
  return probal(() => {
    const n = egesz(rng, 10, 24), h = egesz(rng, 3, 8);
    if (n - h < 3) return null;
    const A2 = egesz(rng, 8, 16), d = egesz(rng, 1, 4);
    const A1 = A2 + d;
    const S = n * A1 - (n - h) * A2;
    return egyMezos({
      szoveg: `Zsófi felírt a táblára néhány számot, az átlaguk ${f(A1)} lett. Letörölt közülük ${h} számot, amelyeknek az összege ${f(S)} volt. A táblán maradt számok átlaga ${f(A2)}. Hány számot írt fel Zsófi eredetileg?`,
      cimke: 'Az eredeti számok száma', helyes: n, tizedes: 0,
      hibak: [
        { ertek: n - h, uzenet: 'Ez a táblán maradt számok darabszáma. A kérdés az eredeti darabszám.' },
        { ertek: tisztit(S / A1), uzenet: 'A törölt számok összegét nem az eredeti átlaggal kell osztani: a törölt számok átlaga más.' },
      ],
      ellenproba: (w) => (w > h
        ? `Ellenpróba: ha ${f(w)} számot írt fel, az összegük ${f(w)} · ${f(A1)} = ${f(w * A1)}. A maradék ${f(w - h)} szám összege ${f(w * A1 - S)}, átlaguk ${f(((w * A1 - S) / (w - h)), 2)}, de ${f(A2)} kellene.`
        : `Ellenpróba: ${f(w)} számból nem lehet ${h} számot letörölni úgy, hogy még maradjon szám a táblán.`),
      tippek: [
        'Mi az átlag és az összeg kapcsolata? Hogyan kapod meg a számok összegét, ha ismered az átlagot és a darabszámot?',
        `Ha n számot írt fel, az összegük n · ${f(A1)}; a maradék n − ${h} szám összege (n − ${h}) · ${f(A2)}.`,
        `A kettő különbsége a törölt számok összege: n · ${f(A1)} − (n − ${h}) · ${f(A2)} = ${f(S)}.`,
      ],
      megoldas: [
        `Az eredeti összeg: ${f(A1)} · n. A maradék összege: ${f(A2)} · (n − ${h}).`,
        `${f(A1)}n − ${f(A2)}(n − ${h}) = ${f(S)}, azaz ${f(d)}n + ${f(A2 * h)} = ${f(S)}.`,
        `${f(d)}n = ${f(S - A2 * h)}, tehát n = <strong>${f(n)}</strong>.`,
      ],
      magyarazat: [
        `Az átlag az összeg osztva a darabszámmal, ezért az összeg = átlag · darabszám. Ezt kétszer is felhasználjuk: a törlés előtt és után.`,
        `Ha n számot írt fel, az összegük ${f(A1)} · n. A törlés után n − ${h} szám maradt, összegük ${f(A2)} · (n − ${h}). A kettő különbsége a törölt ${f(S)}.`,
        `Az egyenletből n = ${f(n)}. Józan ésszel: ${f(n)} szám összege ${f(n * A1)}, ebből ${f(S)} törölve ${f(n * A1 - S)} marad, és ${f(n * A1 - S)} : ${f(n - h)} = ${f(A2)}.`,
      ],
      jegyezze: 'Átlagos feladatban az összeg az átlag és a darabszám szorzata. Írd fel az összeget a változtatás előtt és után.',
    });
  });
}

// ---- Z5: kollégium négy épülete ----
function Z5(rng) {
  return probal(() => {
    const x = egesz(rng, 40, 95), a = egesz(rng, 6, 14), b = egesz(rng, 4, 12), c = egesz(rng, 3, 10);
    if (a === b || a === c || b === c) return null;
    const T = 4 * x + 2 * b + a + c;
    return egyMezos({
      szoveg: `Egy kollégium négy épületében összesen ${f(T)} diák lakik. Az első épületben ${a} diákkal többen laknak, mint a negyedikben, a negyedikben ${b} diákkal többen, mint a harmadikban. A második épületben ${c} diákkal többen laknak, mint a harmadikban. Hány diák lakik a harmadik épületben?`,
      cimke: 'A harmadik épület lakói', helyes: x, tizedes: 0,
      hibak: [
        { ertek: tisztit(T / 4), uzenet: 'Az épületekben nem egyenlő a létszám, ezért az összeget nem lehet egyszerűen néggyel osztani.' },
        { ertek: x + b, uzenet: 'Ez a negyedik épület létszáma. A harmadik épületben ennél kevesebben laknak.' },
      ],
      ellenproba: (w) => `Ellenpróba: ha a harmadik épületben ${f(w)} diák lakna, akkor a negyedikben ${f(w + b)}, az elsőben ${f(w + b + a)}, a másodikban ${f(w + c)}, összesen ${f(4 * w + 2 * b + a + c)} diák, de ${f(T)} kellene.`,
      tippek: [
        'Melyik épületet érdemes alapnak venni, és hogyan fejezhető ki belőle a többi épület létszáma?',
        `Legyen a harmadikban x diák. Akkor a negyedikben x + ${b}, az elsőben x + ${b} + ${a}, a másodikban x + ${c}.`,
        `Az összeg: x + (x + ${b}) + (x + ${a + b}) + (x + ${c}) = ${f(T)}.`,
      ],
      megoldas: [
        `Harmadik: x; negyedik: x + ${b}; első: x + ${a + b}; második: x + ${c}.`,
        `4x + ${b + a + b + c} = ${f(T)}, azaz 4x = ${f(T - (2 * b + a + c))}.`,
        `x = <strong>${f(x)}</strong>.`,
      ],
      magyarazat: [
        `A legkisebb létszámú épület alapján írjuk fel a többit. A harmadik épületben x diák lakik, a többi épület létszáma ehhez képest ${b}, ${a + b}, illetve ${c} diákkal több.`,
        `Az összeg: 4 darab x, plusz a „többletek” együtt: ${b} + ${a + b} + ${c} = ${2 * b + a + c}. Így 4x + ${f(2 * b + a + c)} = ${f(T)}.`,
        `Az egyenletből 4x = ${f(T - (2 * b + a + c))}, vagyis x = ${f(x)}. Józan ésszel: ${f(x)} + ${f(x + b)} + ${f(x + a + b)} + ${f(x + c)} = ${f(T)}.`,
      ],
      jegyezze: 'Ha több mennyiséget egymáshoz képest adnak meg, válaszd a legkisebbet x-nek, és fejezd ki belőle a többit.',
    });
  });
}

// ---- Z6: két fajta érme ----
function Z6(rng) {
  return probal(() => {
    const n = egesz(rng, 15, 40), x = egesz(rng, 3, n - 3);
    const V = 20 * (n - x) + 50 * x;
    return egyMezos({
      szoveg: `Eszter perselyében csak húszforintos és ötvenforintos érmék vannak, összesen ${n} darab. Az érmék összértéke ${f(V)} Ft. Hány darab ötvenforintos érme van a perselyben?`,
      cimke: 'Az ötvenforintosok száma', helyes: x, tizedes: 0,
      hibak: [
        { ertek: n - x, uzenet: 'Ez a húszforintosok száma. A kérdés az ötvenforintosoké.' },
        { ertek: tisztit(V / 70), uzenet: 'A két érmefajta darabszáma nem ugyanannyi, ezért az összeget nem lehet az érmék összegével (20 + 50) osztani.' },
      ],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} ötvenforintos lenne, akkor ${f(n - w)} húszforintos maradna, az összérték ${f(50 * w + 20 * (n - w))} Ft lenne, de ${f(V)} Ft kellene.`,
      tippek: [
        `Mennyi lenne az érmék értéke, ha mind a ${n} érme húszforintos lenne?`,
        `${n} · 20 = ${f(20 * n)} Ft lenne. A tényleges összeg ${f(V - 20 * n)} Ft-tal több.`,
        `Minden ötvenforintos 30 Ft-tal többet ér, mint egy húszforintos.`,
      ],
      megoldas: [
        `Ha mind húszforintos lenne: ${n} · 20 = ${f(20 * n)} Ft.`,
        `A különbség: ${f(V)} − ${f(20 * n)} = ${f(V - 20 * n)} Ft; minden csere 50 − 20 = 30 Ft többletet ad.`,
        `${f(V - 20 * n)} : 30 = <strong>${f(x)}</strong> ötvenforintos.`,
      ],
      magyarazat: [
        `Képzeljük el, hogy minden érme húszforintos. Akkor az összeg ${f(20 * n)} Ft lenne, de valójában ${f(V)} Ft, vagyis ${f(V - 20 * n)} Ft-tal több.`,
        `Ha egy húszforintost ötvenforintosra cserélünk, az összeg 30 Ft-tal nő. Annyi cserét kell csinálnunk, hogy a többlet kijöjjön: ${f(V - 20 * n)} : 30 = ${f(x)}.`,
        `Józan ésszel: ${f(x)} ötvenforintos ${f(50 * x)} Ft, a maradék ${f(n - x)} húszforintos ${f(20 * (n - x))} Ft, együtt ${f(V)} Ft.`,
      ],
      jegyezze: 'Két fajtájú dolgok: tegyük fel, hogy mind az egyik fajta, és nézzük meg, mennyivel tér el az összeg – minden csere ugyanannyival változtat.',
    });
  });
}

export default {
  id: 'fv-szoveges',
  sor: 'felveteli',
  cim: 'Szöveges feladatok, egyenletek',
  rovid: 'Gondoltam egy számot, arányos osztás, átlag, egyenlet felírása szöveg alapján.',
  kulcskeplet: '<span class="keplet-nagy">Ismeretlen = x → egyenlet → x = …</span>',
  kulcsMagyarazat: ['Jelöld x-szel azt, amit kérdeznek (vagy a legkisebb mennyiséget), írd fel a többit x-szel, majd az egyenletet.'],
  elmelet: [
    '<strong>Gondoltam egy számot:</strong> a műveleteket a végétől visszafelé kell megfordítani (szorzás ↔ osztás, összeadás ↔ kivonás), vagy írj fel egyenletet x-szel.',
    '<strong>Arányos osztás:</strong> az a : b arány azt jelenti, hogy az egész (a + b) egyenlő részre oszlik. Egy rész = összeg : (a + b).',
    '<strong>Átlag:</strong> az átlag = összeg : darabszám, vagyis az összeg = átlag · darabszám. Törlésnél, hozzáadásnál írd fel az összeget előtte és utána.',
    '<strong>Egyenlet felírása:</strong> a legkisebb mennyiséget jelöld x-szel, a többit fejezd ki belőle (x + 4, 2x, …), majd az összegekből vagy különbségekből írd fel az egyenletet.',
    '<strong>Két fajta tárgy:</strong> tegyük fel, hogy mind az egyik fajta; a különbséget minden „csere” ugyanannyival változtatja.',
  ],
  peldak: [
    { cim: 'Gondoltam egy számot', feladat: 'Gondoltam egy számot. A kétszereséhez hozzáadtam a gondolt szám 30 %-át és még 4 egységet. Az összeget 4-szeresére növeltem, és 154 lett az eredmény. Melyik számra gondoltam?',
      lepesek: ['Visszafelé: 154 : 4 = 38,5; 38,5 − 4 = 34,5.', '2x + 0,3x = 2,3x = 34,5, tehát x = 34,5 : 2,3 = 15.', 'Ellenőrzés: 2 · 15 = 30, 30 + 4,5 + 4 = 38,5, és 38,5 · 4 = 154.'] },
    { cim: 'Arányos osztás', feladat: 'Bandi és Gizi almát szedett 8 : 5 arányban, összesen 91 kg-ot. Hány kg-mal szedett több Bandi?',
      lepesek: ['8 + 5 = 13 rész, 1 rész: 91 : 13 = 7 kg.', 'Bandi 56 kg-ot, Gizi 35 kg-ot szedett.', 'A különbség 3 rész: 3 · 7 = 21 kg.'] },
    { cim: 'Békák és kígyók', feladat: 'Egy nádasban kétszer annyi béka él, mint kígyó. A szemek és lábak száma összesen 224. Hány kígyó van?',
      lepesek: ['Egy csoport: 1 kígyó (2 szem) + 2 béka (2 · 6 = 12) = 14.', '224 : 14 = 16 kígyó.', 'Ellenőrzés: 16 kígyó 32 szem, 32 béka 192 szem és láb, együtt 224.'] },
  ],
  tipusok: [
    { id: 'Z1', nev: 'Gondoltam egy számot', general: Z1 },
    { id: 'Z2', nev: 'Arányos osztás', general: Z2 },
    { id: 'Z3', nev: 'Szemek és lábak (békák, kígyók)', general: Z3 },
    { id: 'Z4', nev: 'Átlag, törölt számok', general: Z4 },
    { id: 'Z5', nev: 'Négy épület (egyenlet felírása)', general: Z5 },
    { id: 'Z6', nev: 'Kétféle érme', general: Z6 },
  ],
  peldaEllenorzes() {
    return [
      { nev: '1. példa: gondolt szám', kapott: gondoltSzam(154, 30, 4, 4), vart: 15 },
      { nev: '1. példa: 154 : 4', kapott: 154 / 4, vart: 38.5 },
      { nev: '1. példa: ellenőrzés', kapott: (2 * 15 + 4.5 + 4) * 4, vart: 154 },
      { nev: '2. példa: 1 rész', kapott: 91 / 13, vart: 7 },
      { nev: '2. példa: különbség', kapott: aranyKulonbseg(8, 5, 91), vart: 21 },
      { nev: '2. példa: Bandi', kapott: 8 * 7, vart: 56 },
      { nev: '3. példa: kígyók', kapott: kigyok(224, 2), vart: 16 },
      { nev: '3. példa: csoport', kapott: 2 + 6 * 2, vart: 14 },
      { nev: '3. példa: ellenőrzés', kapott: 16 * 2 + 32 * 6, vart: 224 },
    ];
  },
};
