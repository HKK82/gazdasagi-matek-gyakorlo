// F2 – Mértékegységek átváltása
import { egesz, valaszt } from '../lib/rng.js';
import { probal, f, tisztit } from '../temak/seged.js';
import { egyMezos } from './seged.js';

// ---- Tiszta átváltások (a példák és a tesztek is használják) ----
export const napOraban = (nap, ora) => nap * 24 + ora;
export const oraMasodpercben = (ora, perc) => ora * 60 - perc;
export const kmMeterben = (km, m) => km * 1000 + m;
export const literCm3 = (l) => l * 1000;
export const m3Literben = (m3) => m3 * 1000;
export const haM2 = (ha) => ha * 10000;
export const kmhMs = (kmh) => tisztit(kmh / 3.6);
export const msKmh = (ms) => tisztit(ms * 3.6);

/** Egy átváltós feladat összeállítása a változat leírásából. */
function atvaltas(v) {
  return egyMezos({
    szoveg: v.szoveg, cimke: v.cimke, helyes: v.helyes, tizedes: v.tizedes ?? 0, egyseg: v.egyseg,
    hibak: v.hibak, ellenproba: v.ell, tippek: v.tippek, megoldas: v.megoldas, magyarazat: v.magyarazat, jegyezze: v.jegyezze,
  });
}

// ---- E1: idő ----
function E1(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    if (valt === 0) {
      const a = egesz(rng, 1, 6), b = egesz(rng, 5, 70);
      const h = napOraban(a, b);
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${a} nap + ${b} óra = … óra.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'óra', helyes: h,
        hibak: [{ ertek: a + b, uzenet: 'A napot is át kell váltani órára: 1 nap = 24 óra. Csak azonos mértékegységű számokat adhatunk össze.' }, { ertek: a * 60 + b, uzenet: 'Egy napban 24 óra van, nem 60.' }],
        ell: (w) => `Ellenpróba: ${f(w)} − ${f(b)} = ${f(w - b)} óra jönne ki a napokra, de ${f(a)} nap ${f(a * 24)} óra.`,
        tippek: [`Hány órából áll egy nap, és hány órát jelent így a ${f(a)} nap?`, `${f(a)} nap = ${f(a)} · 24 óra.`, `Add hozzá a ${f(b)} órát.`],
        megoldas: [`${f(a)} nap = ${f(a)} · 24 = ${f(a * 24)} óra.`, `${f(a * 24)} + ${f(b)} = <strong>${f(h)}</strong> óra.`],
        magyarazat: [
          `Összeadni csak azonos mértékegységű mennyiségeket lehet, ezért a napot először órára váltjuk.`,
          `Egy napban 24 óra van, így ${f(a)} nap = ${f(a)} · 24 = ${f(a * 24)} óra. Ehhez jön még a ${f(b)} óra, az összeg ${f(h)} óra.`,
          `Józan ésszel: ${f(h)} óra több, mint ${f(a)} egész nap (${f(a * 24)} óra), és ${f(h)} : 24 ≈ ${f(h / 24, 1)} nap.`,
        ],
        jegyezze: 'Átváltás összeadás előtt: 1 nap = 24 óra, 1 óra = 60 perc, 1 perc = 60 másodperc.',
      });
    }
    if (valt === 1) {
      const a = egesz(rng, 1, 6), b = egesz(rng, 5, 55);
      const perc = oraMasodpercben(a, b);
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${a} óra − ${b} perc = … perc.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'perc', helyes: perc,
        hibak: [{ ertek: a - b, uzenet: 'Az órát át kell váltani percre (1 óra = 60 perc), és csak utána vonhatod ki a percet.' }, { ertek: a * 100 - b, uzenet: 'Egy órában 60 perc van, nem 100.' }],
        ell: (w) => `Ellenpróba: ${f(w)} + ${f(b)} = ${f(w + b)} perc jönne ki az egész időre, de ${f(a)} óra ${f(a * 60)} perc.`,
        tippek: [`Hány percből áll egy óra, és hány perc ${f(a)} óra?`, `${f(a)} óra = ${f(a)} · 60 perc.`, `Vond ki a ${f(b)} percet.`],
        megoldas: [`${f(a)} óra = ${f(a * 60)} perc.`, `${f(a * 60)} − ${f(b)} = <strong>${f(perc)}</strong> perc.`],
        magyarazat: [
          `A kivonás előtt mindkét mennyiséget ugyanabban a mértékegységben kell megadni. Legyen ez a perc.`,
          `Egy órában 60 perc van, ezért ${f(a)} óra = ${f(a * 60)} perc. Ebből kivonva a ${f(b)} percet ${f(perc)} percet kapunk.`,
          `Józan ésszel: ${f(perc)} perc kevesebb, mint ${f(a)} óra (${f(a * 60)} perc), és ${f(perc)} perc ≈ ${f(perc / 60, 2)} óra.`,
        ],
        jegyezze: '1 óra = 60 perc. Kivonás előtt váltsd mindkét mennyiséget ugyanarra az egységre.',
      });
    }
    const q = valaszt(rng, [2, 3, 4, 5, 6, 10, 12]);
    const p = egesz(rng, 1, 2 * q - 1);
    if (p % q === 0) return null;
    const perc = (60 * p) / q;
    return atvaltas({
      szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${p}/${q} óra = … perc.`,
      cimke: 'A hiányzó mérőszám', egyseg: 'perc', helyes: perc,
      hibak: [{ ertek: (100 * p) / q, uzenet: 'Egy óra 60 perc, nem 100. A tizedes törtet nem szabad „százalékként” váltani.' }, { ertek: p / q, uzenet: 'Ez az óra szám, nem perc. Szorozd meg 60-nal.' }],
      ell: (w) => `Ellenpróba: ${f(w)} perc = ${f(w / 60, 3)} óra, de ${p}/${q} ≈ ${f(p / q, 3)} óra.`,
      tippek: [`Mennyi percből áll egy óra, és mennyi az egy rész, ha az órát ${q} egyenlő részre osztod?`, `60 : ${q} = ${f(60 / q)} perc az egy rész.`, `Szorozd meg a számlálóval (${p}).`],
      megoldas: [`60 perc : ${q} = ${f(60 / q)} perc.`, `${p} · ${f(60 / q)} = <strong>${f(perc)}</strong> perc.`],
      magyarazat: [
        `A ${p}/${q} óra azt jelenti, hogy az 1 órát ${q} egyenlő részre osztjuk, és ${p} részt veszünk.`,
        `Az 1 óra 60 perc, ennek ${q} egyenlő része ${f(60 / q)} perc. ${p} ilyen rész ${p} · ${f(60 / q)} = ${f(perc)} perc.`,
        `Józan ésszel: ${p}/${q} ${p < q ? 'kisebb, mint 1, ezért a perc kevesebb, mint 60' : 'nagyobb, mint 1, ezért a perc több, mint 60'}, és a ${f(perc)} ${p < q ? 'tényleg kevesebb' : 'tényleg több'}.`,
      ],
      jegyezze: 'A törtórát úgy váltsd percre, hogy a 60 percet felosztod a nevezővel, és szorzol a számlálóval.',
    });
  });
}

// ---- E2: hosszúság ----
function E2(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    if (valt === 0) {
      const k = egesz(rng, 2, 9), m = 100 * egesz(rng, 1, 9);
      const h = kmMeterben(k, 0) - m;
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${k} km − ${m} m = … m.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'm', helyes: h,
        hibak: [{ ertek: k - m, uzenet: 'Előbb váltsd át a kilométert méterre: 1 km = 1000 m.' }, { ertek: k * 100 - m, uzenet: 'Egy kilométerben 1000 méter van, nem 100.' }],
        ell: (w) => `Ellenpróba: ${f(w)} + ${f(m)} = ${f(w + m)} méter lenne a teljes hossz, de ${f(k)} km ${f(k * 1000)} méter.`,
        tippek: [`Hány méter egy kilométer, és hány méter a ${f(k)} km?`, `${f(k)} km = ${f(k)} · 1000 m.`, `Vond ki a ${f(m)} métert.`],
        megoldas: [`${f(k)} km = ${f(k * 1000)} m.`, `${f(k * 1000)} − ${f(m)} = <strong>${f(h)}</strong> m.`],
        magyarazat: [
          `A kilométert és a métert nem lehet közvetlenül kivonni egymásból, ezért méterre váltunk.`,
          `1 km = 1000 m, tehát ${f(k)} km = ${f(k * 1000)} m. Ebből ${f(m)} m-t elveszünk, marad ${f(h)} m.`,
          `Józan ésszel: ${f(h)} m kevesebb, mint ${f(k)} km, és ${f(h)} m = ${f(h / 1000, 3)} km.`,
        ],
        jegyezze: '1 km = 1000 m, 1 m = 10 dm = 100 cm = 1000 mm.',
      });
    }
    if (valt === 1) {
      const a = egesz(rng, 1, 9), b = 5 * egesz(rng, 2, 40);
      const h = tisztit(a * 100 + b / 10);
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${a} m + ${b} mm = … cm.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'cm', tizedes: 1, helyes: h,
        hibak: [{ ertek: a * 100 + b, uzenet: 'A millimétert is át kell váltani centiméterre: 10 mm = 1 cm.' }, { ertek: a * 10 + b, uzenet: 'Egy méterben 100 centiméter van.' }],
        ell: (w) => `Ellenpróba: ${f(w)} cm − ${f(a * 100)} cm = ${f(w - a * 100, 1)} cm lenne a millimétereknek megfelelő rész, ami ${f((w - a * 100) * 10, 1)} mm, de ennek ${f(b)} mm-nek kellene lennie.`,
        tippek: [`Hány centiméter egy méter, és hány centiméter egy millimétertől számítva?`, `${f(a)} m = ${f(a * 100)} cm; 10 mm = 1 cm, tehát ${f(b)} mm = ${f(b / 10, 1)} cm.`, `Add össze a két centiméter-értéket.`],
        megoldas: [`${f(a)} m = ${f(a * 100)} cm; ${f(b)} mm = ${f(b / 10, 1)} cm.`, `${f(a * 100)} + ${f(b / 10, 1)} = <strong>${f(h, 1)}</strong> cm.`],
        magyarazat: [
          `A méterből és a millimétert is centiméterre váltjuk, mert a kérdés centiméterben szól.`,
          `1 m = 100 cm, ezért ${f(a)} m = ${f(a * 100)} cm. 10 mm = 1 cm, ezért ${f(b)} mm = ${f(b / 10, 1)} cm. Összeg: ${f(h, 1)} cm.`,
          `Józan ésszel: a ${f(b)} mm csak néhány centiméter, ezért a ${f(h, 1)} cm alig több, mint ${f(a * 100)} cm.`,
        ],
        jegyezze: '10 mm = 1 cm, 100 cm = 1 m. Kisebb egységről nagyobbra váltva osztunk.',
      });
    }
    const k = egesz(rng, 1, 8), m = 10 * egesz(rng, 1, 90);
    const h = k * 10000 + m * 10;
    return atvaltas({
      szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${k} km + ${m} m = … dm.`,
      cimke: 'A hiányzó mérőszám', egyseg: 'dm', helyes: h,
      hibak: [{ ertek: k * 1000 + m, uzenet: 'Ez méterben adja meg az összeget. A kérdés deciméterben van: 1 m = 10 dm.' }, { ertek: k * 1000 * 10 + m, uzenet: 'A métert is át kell váltani deciméterre: 1 m = 10 dm.' }],
      ell: (w) => `Ellenpróba: ${f(w)} dm = ${f(w / 10)} m, de ${f(k)} km + ${f(m)} m = ${f(k * 1000 + m)} m.`,
      tippek: [`Hány méter az összeg, és hány deciméter ez, ha 1 m = 10 dm?`, `${f(k)} km + ${f(m)} m = ${f(k * 1000 + m)} m.`, `Szorozd meg 10-zel.`],
      megoldas: [`${f(k)} km + ${f(m)} m = ${f(k * 1000 + m)} m.`, `${f(k * 1000 + m)} m · 10 = <strong>${f(h)}</strong> dm.`],
      magyarazat: [
        `Először közös egységbe, méterbe váltunk. ${f(k)} km = ${f(k * 1000)} m, így az összeg ${f(k * 1000 + m)} m.`,
        `A deciméter a méter tizedrésze, ezért tízszer annyi deciméter van, mint méter. Kisebb egységre váltva szorzunk: ${f(k * 1000 + m)} · 10 = ${f(h)} dm.`,
        `Józan ésszel: a deciméter kisebb egység a méternél, ezért a mérőszámnak nagyobbnak kell lennie: ${f(h)} > ${f(k * 1000 + m)}.`,
      ],
      jegyezze: 'Nagyobb egységről kisebbre váltva a mérőszám nő (szorzunk), kisebbről nagyobbra csökken (osztunk).',
    });
  });
}

// ---- E3: űrtartalom, térfogat ----
function E3(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    if (valt === 0) {
      const l = egesz(rng, 1, 9), cm3 = 100 * egesz(rng, 1, 9) + 50;
      if (cm3 >= l * 1000) return null;
      const h = literCm3(l) - cm3;
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${l} liter − ${cm3} cm³ = … cm³.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'cm³', helyes: h,
        hibak: [{ ertek: l - cm3, uzenet: 'A litert át kell váltani köbcentiméterre: 1 liter = 1000 cm³.' }, { ertek: l * 100 - cm3, uzenet: '1 liter 1000 cm³, nem 100.' }],
        ell: (w) => `Ellenpróba: ${f(w)} + ${f(cm3)} = ${f(w + cm3)} cm³ lenne az egész, de ${f(l)} liter ${f(l * 1000)} cm³.`,
        tippek: [`Hány köbcentiméter egy liter?`, `1 liter = 1 dm³ = 1000 cm³, így ${f(l)} liter = ${f(l * 1000)} cm³.`, `Vond ki a ${f(cm3)} cm³-t.`],
        megoldas: [`${f(l)} liter = ${f(l * 1000)} cm³.`, `${f(l * 1000)} − ${f(cm3)} = <strong>${f(h)}</strong> cm³.`],
        magyarazat: [
          `A liter és a köbcentiméter ugyanannak a mennyiségnek két mértékegysége: 1 liter = 1 dm³ = 1000 cm³.`,
          `Ezért ${f(l)} liter = ${f(l * 1000)} cm³. Ebből elvéve ${f(cm3)} cm³-t ${f(h)} cm³ marad.`,
          `Józan ésszel: a ${f(cm3)} cm³ kevesebb, mint egy liter, ezért ${f(l)} literből alig vettünk el valamit: a ${f(h)} cm³ valamivel kevesebb, mint ${f(l * 1000)} cm³.`,
        ],
        jegyezze: '1 liter = 1 dm³ = 1000 cm³; 1 m³ = 1000 liter.',
      });
    }
    if (valt === 1) {
      const m3 = egesz(rng, 1, 9), l = 100 * egesz(rng, 1, 9);
      const h = m3Literben(m3) - l;
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${m3} m³ − ${l} liter = … liter.`,
        cimke: 'A hiányzó mérőszám', egyseg: 'liter', helyes: h,
        hibak: [{ ertek: m3 * 100 - l, uzenet: '1 m³ = 1000 dm³ = 1000 liter, nem 100.' }, { ertek: m3 - l, uzenet: 'A köbmétert át kell váltani literre: 1 m³ = 1000 liter.' }],
        ell: (w) => `Ellenpróba: ${f(w)} + ${f(l)} = ${f(w + l)} liter lenne az egész, de ${f(m3)} m³ ${f(m3 * 1000)} liter.`,
        tippek: [`Hány 1 dm élű kocka (vagyis hány liter) fér egy 1 m élű kockába?`, `1 m³ = 1000 dm³ = 1000 liter.`, `${f(m3)} m³ = ${f(m3 * 1000)} liter; vond ki a ${f(l)} litert.`],
        megoldas: [`${f(m3)} m³ = ${f(m3 * 1000)} liter.`, `${f(m3 * 1000)} − ${f(l)} = <strong>${f(h)}</strong> liter.`],
        magyarazat: [
          `Egy 1 m élű kockában 10 · 10 · 10 = 1000 darab 1 dm élű kocka fér el, és egy ilyen kocka 1 liter. Ezért 1 m³ = 1000 liter.`,
          `${f(m3)} m³ = ${f(m3 * 1000)} liter. Ebből ${f(l)} litert elveszünk, marad ${f(h)} liter.`,
          `Józan ésszel: a ${f(l)} liter kevesebb, mint egy köbméter, így a ${f(h)} liter kevesebb, mint ${f(m3 * 1000)} liter.`,
        ],
        jegyezze: '1 m³ = 1000 dm³ = 1000 liter.',
      });
    }
    const hl = egesz(rng, 2, 20), l = egesz(rng, 5, 80);
    const h = hl * 100 + l;
    return atvaltas({
      szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${hl} hl + ${l} l = … l.`,
      cimke: 'A hiányzó mérőszám', egyseg: 'l', helyes: h,
      hibak: [{ ertek: hl * 10 + l, uzenet: 'A hektoliter (hl) 100 liter, nem 10.' }, { ertek: hl + l, uzenet: 'A hektolitert át kell váltani literre: 1 hl = 100 l.' }],
      ell: (w) => `Ellenpróba: ${f(w)} − ${f(l)} = ${f(w - l)} liter jönne ki a hektoliterekre, de ${f(hl)} hl ${f(hl * 100)} liter.`,
      tippek: [`Hány liter egy hektoliter (hl), ha a „hekto” előtag százat jelent?`, `1 hl = 100 l, így ${f(hl)} hl = ${f(hl * 100)} l.`, `Add hozzá a ${f(l)} litert.`],
      megoldas: [`${f(hl)} hl = ${f(hl * 100)} l.`, `${f(hl * 100)} + ${f(l)} = <strong>${f(h)}</strong> l.`],
      magyarazat: [
        `A „hekto” előtag százat jelent, ezért 1 hektoliter = 100 liter.`,
        `${f(hl)} hl = ${f(hl)} · 100 = ${f(hl * 100)} l. Ehhez hozzáadjuk a ${f(l)} litert: ${f(h)} l.`,
        `Józan ésszel: a ${f(l)} liter kevesebb, mint egy hektoliter, így a ${f(h)} liter csak valamivel több, mint ${f(hl * 100)} liter.`,
      ],
      jegyezze: 'hekto = 100, kilo = 1000, deci = tized, centi = század, milli = ezred.',
    });
  });
}

// ---- E4: terület ----
function E4(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    if (valt === 0) {
      const ha = egesz(rng, 1, 9), m2 = 100 * egesz(rng, 1, 90);
      const h = haM2(ha) + m2;
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${ha} ha + ${m2} m² = … m².`,
        cimke: 'A hiányzó mérőszám', egyseg: 'm²', helyes: h,
        hibak: [{ ertek: ha * 100 + m2, uzenet: '1 hektár (ha) = 10 000 m² (egy 100 m × 100 m-es négyzet), nem 100.' }, { ertek: ha * 1000 + m2, uzenet: '1 hektár 10 000 m², nem 1000.' }],
        ell: (w) => `Ellenpróba: ${f(w)} − ${f(m2)} = ${f(w - m2)} m² jönne ki a hektárokra, de ${f(ha)} ha ${f(ha * 10000)} m².`,
        tippek: [`Mekkora egy hektár területe négyzetméterben, ha egy hektár egy 100 m × 100 m-es négyzet?`, `1 ha = 100 · 100 = 10 000 m².`, `${f(ha)} ha = ${f(ha * 10000)} m²; add hozzá a ${f(m2)} m²-t.`],
        megoldas: [`${f(ha)} ha = ${f(ha * 10000)} m².`, `${f(ha * 10000)} + ${f(m2)} = <strong>${f(h)}</strong> m².`],
        magyarazat: [
          `Egy hektár egy 100 m oldalú négyzet területe: 100 · 100 = 10 000 m².`,
          `${f(ha)} ha = ${f(ha)} · 10 000 = ${f(ha * 10000)} m². Ehhez a ${f(m2)} m²-t hozzáadva ${f(h)} m² az összeg.`,
          `Józan ésszel: a ${f(m2)} m² csak töredéke egy hektárnak, ezért a ${f(h)} m² alig több, mint ${f(ha * 10000)} m².`,
        ],
        jegyezze: 'Területnél a váltószám az oldal váltószámának négyzete: 1 m² = 100 dm² = 10 000 cm²; 1 ha = 10 000 m².',
      });
    }
    if (valt === 1) {
      const m2 = egesz(rng, 2, 9), dm2 = 50 * egesz(rng, 1, 9);
      const h = m2 * 100 - dm2;
      if (h <= 0) return null;
      return atvaltas({
        szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${m2} m² − ${dm2} dm² = … dm².`,
        cimke: 'A hiányzó mérőszám', egyseg: 'dm²', helyes: h,
        hibak: [{ ertek: m2 * 10 - dm2, uzenet: 'Területnél a váltószám az oldal váltószámának négyzete: 1 m = 10 dm, tehát 1 m² = 100 dm².' }, { ertek: m2 * 1000 - dm2, uzenet: '1 m² = 100 dm², nem 1000.' }],
        ell: (w) => `Ellenpróba: ${f(w)} + ${f(dm2)} = ${f(w + dm2)} dm² lenne az egész, de ${f(m2)} m² ${f(m2 * 100)} dm².`,
        tippek: [`Egy 1 m × 1 m-es négyzet hány darab 1 dm × 1 dm-es négyzetből áll?`, `10 · 10 = 100 darabból, tehát 1 m² = 100 dm².`, `${f(m2)} m² = ${f(m2 * 100)} dm²; vond ki a ${f(dm2)} dm²-t.`],
        megoldas: [`${f(m2)} m² = ${f(m2 * 100)} dm².`, `${f(m2 * 100)} − ${f(dm2)} = <strong>${f(h)}</strong> dm².`],
        magyarazat: [
          `Egy négyzetméter területű négyzet oldala 1 m = 10 dm, ezért 10 · 10 = 100 darab négyzetdeciméter fér bele.`,
          `${f(m2)} m² = ${f(m2 * 100)} dm². Ebből a ${f(dm2)} dm² elvételével ${f(h)} dm² marad.`,
          `Józan ésszel: a ${f(dm2)} dm² kevesebb, mint ${f(m2)} m², ezért az eredmény pozitív és kisebb, mint ${f(m2 * 100)}.`,
        ],
        jegyezze: 'Területnél 1 m² = 100 dm² = 10 000 cm² (nem 10, nem 100 az oldalhoz képest).',
      });
    }
    const km2 = egesz(rng, 2, 40);
    return atvaltas({
      szoveg: `Tedd igazzá az egyenlőséget a hiányzó mérőszám beírásával: ${km2} km² = … ha.`,
      cimke: 'A hiányzó mérőszám', egyseg: 'ha', helyes: km2 * 100,
      hibak: [{ ertek: km2 * 10, uzenet: 'Területnél a váltószám az oldal váltószámának négyzete: 1 km oldalában 10 darab 100 m-es szakasz van, így 10 · 10 = 100 hektáros négyzet fér egy négyzetkilométerbe.' }, { ertek: km2 * 1000, uzenet: '1 km² = 100 ha, nem 1000.' }],
      ell: (w) => `Ellenpróba: ${f(w)} ha = ${f(w / 100)} km², de a feladatban ${f(km2)} km² szerepel.`,
      tippek: [`Egy 1 km × 1 km-es négyzetbe hány darab 100 m × 100 m-es (1 hektáros) négyzet fér?`, `10 · 10 = 100 darab, ezért 1 km² = 100 ha.`, `Szorozd meg a mérőszámot (${f(km2)}) százzal.`],
      megoldas: [`1 km² = 100 ha.`, `${f(km2)} · 100 = <strong>${f(km2 * 100)}</strong> ha.`],
      magyarazat: [
        `Az 1 km = 1000 m, ezért az 1 km² egy 1000 m oldalú négyzet. Az 1 ha egy 100 m oldalú négyzet.`,
        `Egy kilométer oldalába 10 darab 100 m-es szakasz fér, így a négyzetbe 10 · 10 = 100 darab hektáros négyzet. Tehát ${f(km2)} km² = ${f(km2)} · 100 = ${f(km2 * 100)} ha.`,
        `Józan ésszel: a hektár sokkal kisebb egység, mint a négyzetkilométer, ezért a mérőszámnak sokkal nagyobbnak kell lennie: ${f(km2 * 100)} > ${f(km2)}.`,
      ],
      jegyezze: '1 km² = 100 ha; 1 ha = 10 000 m²; 1 km² = 1 000 000 m².',
    });
  });
}

// ---- E5: sebesség (km/h ↔ m/s) ----
function E5(rng) {
  const valt = egesz(rng, 0, 1);
  return probal(() => {
    if (valt === 0) {
      const ms = egesz(rng, 2, 30);
      const kmh = tisztit(ms * 3.6);
      return atvaltas({
        szoveg: `Egy kerékpáros ${f(ms)} m/s sebességgel halad. Hány km/h ez?`,
        cimke: 'Sebesség', egyseg: 'km/h', tizedes: 1, helyes: kmh,
        hibak: [{ ertek: ms * 60, uzenet: 'Ez a percenkénti méterek száma. A km/h-hoz másodpercről órára és méterről kilométerre kell váltani: összesen 3,6-del szorzunk.' }, { ertek: tisztit(ms / 3.6), uzenet: 'Fordítva váltottál: m/s-ról km/h-ra szorozni kell 3,6-del.' }],
        ell: (w) => `Ellenpróba: ${f(w, 1)} km/h = ${f(w / 3.6, 2)} m/s, de a feladatban ${f(ms)} m/s szerepel.`,
        tippek: [`Hány métert tesz meg a kerékpáros egy óra alatt, és hány kilométer ez?`, `Egy óra 3600 másodperc, ezért ${f(ms)} · 3600 métert tesz meg óránként.`, `${f(ms * 3600)} m = ${f(ms * 3.6, 1)} km.`],
        megoldas: [`Egy óra alatt ${f(ms)} · 3600 = ${f(ms * 3600)} métert tesz meg.`, `${f(ms * 3600)} m = ${f(ms * 3.6, 1)} km, tehát <strong>${f(kmh, 1)}</strong> km/h.`],
        magyarazat: [
          `A sebesség azt mondja meg, mennyi utat tesz meg a test egy időegység alatt. A ${f(ms)} m/s azt jelenti: 1 másodperc alatt ${f(ms)} métert.`,
          `Egy órában 3600 másodperc van, így egy óra alatt ${f(ms)} · 3600 = ${f(ms * 3600)} métert halad, ami ${f(ms * 3.6, 1)} km. A rövid szabály: m/s-ról km/h-ra 3,6-del szorzunk.`,
          `Józan ésszel: a km/h mérőszáma nagyobb, mint az m/s-é: ${f(kmh, 1)} > ${f(ms)}.`,
        ],
        jegyezze: 'm/s → km/h: szorozz 3,6-del. km/h → m/s: oszd el 3,6-del.',
      });
    }
    const k = 18 * egesz(rng, 1, 8);
    const msv = k / 3.6;
    return atvaltas({
      szoveg: `Egy autó ${f(k)} km/h sebességgel halad. Hány m/s ez?`,
      cimke: 'Sebesség', egyseg: 'm/s', helyes: msv,
      hibak: [{ ertek: k * 3.6, uzenet: 'Fordítva váltottál: km/h-ról m/s-ra osztani kell 3,6-del.' }, { ertek: k / 60, uzenet: 'Ez a percenként megtett kilométer. Az m/s-hoz másodpercenkénti méter kell: 3,6-del osztunk.' }],
      ell: (w) => `Ellenpróba: ${f(w)} m/s = ${f(w * 3.6, 1)} km/h, de a feladatban ${f(k)} km/h szerepel.`,
      tippek: [`Hány métert tesz meg az autó egy óra alatt, és hány másodperc egy óra?`, `${f(k)} km = ${f(k * 1000)} m egy óra (3600 másodperc) alatt.`, `Oszd el a ${f(k * 1000)} métert 3600 másodperccel.`],
      megoldas: [`${f(k)} km/h = ${f(k * 1000)} m / 3600 s.`, `${f(k * 1000)} : 3600 = <strong>${f(msv)}</strong> m/s.`],
      magyarazat: [
        `A ${f(k)} km/h azt jelenti: egy óra alatt ${f(k)} km, vagyis ${f(k * 1000)} m a megtett út.`,
        `Egy óra 3600 másodperc, ezért a másodpercenkénti út ${f(k * 1000)} : 3600 = ${f(msv)} méter. Rövid szabály: km/h-ról m/s-ra 3,6-del osztunk.`,
        `Józan ésszel: az m/s mérőszáma kisebb, mint a km/h-é: ${f(msv)} < ${f(k)}.`,
      ],
      jegyezze: 'km/h → m/s: oszd el 3,6-del. m/s → km/h: szorozz 3,6-del.',
    });
  });
}


export default {
  id: 'fv-mertek',
  sor: 'felveteli',
  cim: 'Mértékegységek átváltása',
  rovid: 'Idő, hosszúság, űrtartalom, terület és sebesség átváltása – a felvételi minden évben megkérdezi.',
  kulcskeplet: '<span class="keplet-nagy">nagyobb egység → kisebb: szorzás; kisebb → nagyobb: osztás</span>',
  kulcsMagyarazat: ['Összeadás és kivonás előtt mindig hozd közös mértékegységre a mennyiségeket.'],
  elmelet: [
    '<strong>Idő:</strong> 1 nap = 24 óra, 1 óra = 60 perc, 1 perc = 60 másodperc. A tört órát úgy váltod percre, hogy a 60 percet osztod a nevezővel és szorzol a számlálóval.',
    '<strong>Hosszúság:</strong> 1 km = 1000 m, 1 m = 10 dm = 100 cm = 1000 mm.',
    '<strong>Űrtartalom, térfogat:</strong> 1 liter = 1 dm³ = 1000 cm³; 1 m³ = 1000 liter; 1 hl = 100 liter; 1 dl = 0,1 liter.',
    '<strong>Terület:</strong> a váltószám az oldal váltószámának négyzete: 1 m² = 100 dm² = 10 000 cm²; 1 ha = 10 000 m²; 1 km² = 100 ha.',
    '<strong>Sebesség:</strong> m/s → km/h: szorozz 3,6-del; km/h → m/s: oszd el 3,6-del.',
    '<strong>Hogyan ellenőrizd:</strong> ha kisebb egységre váltasz, a mérőszámnak nagyobbnak kell lennie (és fordítva).',
  ],
  peldak: [
    { cim: 'Idő', feladat: 'a) 3 nap + 50 óra = … óra. b) 7/4 óra = … perc.',
      lepesek: ['a) 3 nap = 3 · 24 = 72 óra, 72 + 50 = 122 óra.', 'b) 60 perc : 4 = 15 perc, 7 · 15 = 105 perc.', 'Ellenőrzés: 105 perc = 1 óra 45 perc = 1,75 óra = 7/4 óra.'] },
    { cim: 'Köbcentiméter, liter, hektár', feladat: 'a) 2 liter − 1300 cm³ = … cm³. b) 3 m³ − 600 liter = … liter. c) 4 ha + 700 m² = … m².',
      lepesek: ['a) 2 liter = 2000 cm³, 2000 − 1300 = 700 cm³.', 'b) 3 m³ = 3000 liter, 3000 − 600 = 2400 liter.', 'c) 4 ha = 40 000 m², 40 000 + 700 = 40 700 m².'] },
    { cim: 'Sebesség', feladat: 'a) 10 m/s hány km/h? b) 54 km/h hány m/s?',
      lepesek: ['a) 10 · 3,6 = 36 km/h.', 'b) 54 : 3,6 = 15 m/s.', 'Ellenőrzés: 15 m/s · 3600 = 54 000 m = 54 km egy óra alatt.'] },
  ],
  tipusok: [
    { id: 'E1', nev: 'Idő (nap, óra, perc, tört óra)', general: E1 },
    { id: 'E2', nev: 'Hosszúság', general: E2 },
    { id: 'E3', nev: 'Űrtartalom, térfogat', general: E3 },
    { id: 'E4', nev: 'Terület', general: E4 },
    { id: 'E5', nev: 'Sebesség (km/h és m/s)', general: E5 },
  ],
  peldaEllenorzes() {
    return [
      { nev: '1. példa: 3 nap + 50 óra', kapott: napOraban(3, 50), vart: 122 },
      { nev: '1. példa: 7/4 óra', kapott: (60 / 4) * 7, vart: 105 },
      { nev: '1. példa: ellenőrzés', kapott: 105 / 60, vart: 1.75 },
      { nev: '2. példa: 2 liter − 1300 cm³', kapott: literCm3(2) - 1300, vart: 700 },
      { nev: '2. példa: 3 m³ − 600 liter', kapott: m3Literben(3) - 600, vart: 2400 },
      { nev: '2. példa: 4 ha + 700 m²', kapott: haM2(4) + 700, vart: 40700 },
      { nev: '3. példa: 10 m/s', kapott: msKmh(10), vart: 36 },
      { nev: '3. példa: 54 km/h', kapott: kmhMs(54), vart: 15 },
      { nev: '3. példa: 15 m/s egy óra alatt (m)', kapott: 15 * 3600, vart: 54000 },
    ];
  },
};
