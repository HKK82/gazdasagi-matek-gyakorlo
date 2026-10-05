// 5. téma – Exponenciális függvények (v4)
import { egesz, valaszt, lepeskoz, kever } from '../lib/rng.js';
import { szep, kerekit } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { koordinataRendszer, szepLepes } from '../lib/abra.js';
import { probal, f, fe, sup, hatv, kezelheto, tisztit, az, gg, kisbetus, evben } from './seged.js';

// ---- Tiszta számolófüggvények (a példák és a tesztek is ezt használják) ----
/** Éves szorzó: növekedés p %-kal → 1 + p/100, csökkenés → 1 − p/100. */
export const szorzo = (p, irany = 1) => tisztit(1 + (irany * p) / 100);
export const ertek = (a, q, x) => a * Math.pow(q, x);
/** Hány év alatt éri el az a · qˣ a célértéket? x = lg(cél/a) / lg q */
export const idoig = (a, q, cel) => Math.log(cel / a) / Math.log(q);
/** Éves szorzó két adatból: q = ⁿ√(b/a) */
export const evesSzorzo = (a, b, n) => Math.pow(b / a, 1 / n);
/** Két exponenciális függvény metszéspontja: a₁q₁ˣ = a₂q₂ˣ → x = lg(a₁/a₂) / lg(q₂/q₁) */
export const metszes = (a1, q1, a2, q2) => Math.log(a1 / a2) / Math.log(q2 / q1);

const ALANYOK = [
  { nev: 'Egy cég éves profitja', egys: 'millió Ft' },
  { nev: 'Egy termék ára', egys: 'Ft' },
  { nev: 'Egy város lakossága', egys: 'ezer fő' },
  { nev: 'Egy webáruház forgalma', egys: 'millió Ft' },
  { nev: 'Egy befektetés értéke', egys: 'ezer Ft' },
  { nev: 'Egy ország exportja', egys: 'milliárd Ft' },
];
const KEZDOK = [5, 10, 12, 20, 25, 40, 50, 75, 80, 100, 150, 200, 250, 400, 500, 800, 1000];
const kozepso = (rng) => lepeskoz(rng, 0.1, 25, 0.1);
const irany = (rng) => (rng() < 0.5 ? 1 : -1);
const novSzo = (i) => (i > 0 ? 'nő' : 'csökken');
const nyomtat = (x) => f(x, 4);

/** Az érték kiírása: nagy számnál egészre, egyébként két tizedesre kerekítve. */
const tiz = (x) => (Math.abs(x) >= 1000 ? 0 : 2);

/** Exponenciális görbe(k) ábrája a releváns tartományon, kiemelt pontokkal és vízszintes vonallal. */
function gorbeAbra({ gorbek, pontok = [], vizsz = [], xmax, leiras, yfelirat = 'érték' }) {
  const ymaxNyers = Math.max(...gorbek.flatMap((g) => [g.fn(0), g.fn(xmax)]), ...vizsz.map((v) => v.y), ...pontok.map((p) => p.y)) * 1.12;
  const xl = szepLepes(xmax, 6), yl = szepLepes(ymaxNyers, 5);
  return koordinataRendszer({
    xmin: 0, xmax: Math.ceil(xmax / xl) * xl, ymin: 0, ymax: Math.ceil(ymaxNyers / yl) * yl,
    xlepes: xl, ylepes: yl, gorbek, pontok, vizszintesek: vizsz,
    xfelirat: 'x (év)', yfelirat, leiras, szel: 520, mag: 380, bal: 64,
  });
}

// =====================================================================
// E1 – éves szorzó
// =====================================================================
function E1(rng) {
  return probal(() => {
    const i = irany(rng), p = kozepso(rng), q = szorzo(p, i);
    const al = valaszt(rng, ALANYOK);
    const rossz0 = [tisztit(1 + (i * p) / 10), tisztit(1 + (i * p) / 1000)];
    return {
      szoveg: `${al.nev} évente ${f(p)} %-kal ${novSzo(i)}. Mennyi az éves szorzó (q)?`,
      mezok: [szamMezo({
        cimke: 'Éves szorzó (q, négy tizedesig)', helyes: q, tizedes: 4,
        ellenproba: (w) => `Ellenpróba: ha a szorzó ${f(w, 4)} lenne, akkor 100-ból egy év múlva 100 · ${f(w, 4)} = ${f(100 * w, 2)} lenne, ez ${f(100 * w - 100, 2)} %-os változás – a feladat szerint ${i > 0 ? '+' : '−'}${f(p)} %.`,
        hibak: [
          { ertek: tisztit(p / 100), uzenet: `Ez csak a változás (${f(p)} % = ${f(p / 100, 5)}); a szorzó a megmaradó rész (1, vagyis 100 %) és a változás együtt: ${nyomtat(q)}.` },
          i < 0
            ? { ertek: tisztit(1 + p / 100), uzenet: 'Csökkenésnél kevesebb, mint 100 % marad: q = 1 − p/100, nem 1 + p/100.' }
            : { ertek: tisztit(1 - p / 100), uzenet: 'Növekedésnél több, mint 100 % van: q = 1 + p/100, nem 1 − p/100.' },
          { ertek: rossz0[0], uzenet: `Eggyel kevesebb nullát írt: ${f(p)} % = ${f(p / 100, 5)} → a szorzó ${nyomtat(q)} (a %-jel két nullát jelent: 0,3 % → 0,997).` },
          { ertek: rossz0[1], uzenet: `Eggyel több nullát írt: ${f(p)} % = ${f(p / 100, 5)} → a szorzó ${nyomtat(q)}.` },
        ],
      })],
      tippek: [
        'Ha az érték 100 volt, mennyi lesz egy év múlva? Hányszorosa ez a 100-nak?',
        `A ${f(p)} % = ${f(p)}/100 = ${f(p / 100, 5)} (a %-jel két nullát jelent). A megmaradó rész (1) ${i > 0 ? 'mellé jön' : 'alól megy el'} a változás.`,
        `q = 1 ${i > 0 ? '+' : '−'} ${f(p)}/100 = ${nyomtat(q)}.`,
      ],
      megoldas: [
        `Évente ${f(p)} %-kal ${novSzo(i)}: a megmaradó rész 100 % ${i > 0 ? '+' : '−'} ${f(p)} % = ${f(100 + i * p, 2)} %.`,
        `q = 1 ${i > 0 ? '+' : '−'} ${f(p)}/100 = <strong>${nyomtat(q)}</strong>.`,
        `Ellenőrzés: 100 · ${nyomtat(q)} = ${f(100 * q, 3)}, vagyis ${f(p)} %-os ${i > 0 ? 'növekedés' : 'csökkenés'} ✓`,
      ],
      magyarazat: [
        'Az éves szorzót (q) keressük, vagyis azt a számot, amellyel az értéket egy év alatt meg kell szorozni.',
        `Képzelje el, hogy az érték 100 volt. Egy év után ${f(100 + i * p, 3)} lesz: a 100-ból ${f(p)} ${i > 0 ? 'hozzájön' : 'elmegy'}. A ${f(100 + i * p, 3)} a 100 ${nyomtat(q)}-szorosa, tehát q = ${nyomtat(q)}.`,
        `Ugyanez képlettel: a megmaradó rész az 1 (100 %), a változás pedig ${f(p)} % = ${f(p / 100, 5)}. A százalékjel „század részt” jelent, ezért kell elosztani 100-zal. Így q = 1 ${i > 0 ? '+' : '−'} ${f(p / 100, 5)} = ${nyomtat(q)}.`,
        `Vigyázat a nullákkal: 0,3 % = 0,003, ezért a csökkenés szorzója 0,997 (nem 0,97).`,
        `Józan ésszel: ${i > 0 ? 'növekedésnél a szorzó 1-nél nagyobb' : 'csökkenésnél a szorzó 1-nél kisebb'} (${nyomtat(q)}), és ${f(p)} % kis változásnál csak kicsit tér el az 1-től.`,
      ],
      jegyezze: 'Az éves szorzó: q = 1 + p/100 (növekedés) vagy q = 1 − p/100 (csökkenés). Nem p, és nem p/100!',
    };
  });
}

// =====================================================================
// E2 – függvényérték
// =====================================================================
function E2(rng) {
  return probal(() => {
    const i = irany(rng), p = kozepso(rng), q = szorzo(p, i), a = valaszt(rng, KEZDOK), al = valaszt(rng, ALANYOK);
    const evekkel = rng() < 0.5;
    const Y1 = egesz(rng, 1980, 2010);
    const x = evekkel ? egesz(rng, 2, 30) : egesz(rng, 1, 60);
    const Y2 = Y1 + x;
    const v = ertek(a, q, x);
    if (v < 1 || v > 1e6) return null;
    const d = tiz(v);
    const helyes = kerekit(v, d);
    const lin = a * (1 + (i * x * p) / 100);
    if (lin <= 0) return null;
    const szoveg = evekkel
      ? `${al.nev} ${evben(Y1)} ${fe(a, al.egys)} volt, azóta évente ${f(p)} %-kal ${novSzo(i)}. Mennyi lesz ${evben(Y2)}?`
      : `${al.nev} jelenleg ${fe(a, al.egys)}, és évente ${f(p)} %-kal ${novSzo(i)}. Mennyi lesz ${x} év múlva?`;
    return {
      szoveg,
      mezok: [szamMezo({
        cimke: `Az érték (${al.egys}, ${d === 0 ? 'egészre' : 'két tizedesre'} kerekítve)`, helyes, tizedes: d,
        ellenproba: (w) => `Ellenpróba: ha az érték ${f(w, 2)} ${al.egys} lenne, akkor visszafelé osztva ${f(w, 2)} : ${hatv(q, x)} = ${f(w / Math.pow(q, x), 2)} lenne a kiinduló érték – de ${f(a)} volt.`,
        hibak: [
          { ertek: lin, uzenet: 'Ez akkor lenne, ha minden évben ugyanannyival változna; itt minden évben ugyanannyi %-kal → szorzás ugyanazzal a szorzóval → hatvány.' },
          { ertek: ertek(a, q, x - 1), uzenet: evekkel ? 'Hány év telt el? Az évszámok különbsége: a kitevő ennyi.' : `A kitevő a(z) ${x} (az eltelt évek száma), nem eggyel kevesebb.` },
          { ertek: ertek(a, q, x + 1), uzenet: evekkel ? 'Hány év telt el? Az évszámok különbsége, nem eggyel több.' : `A kitevő a(z) ${x}, nem eggyel több.` },
        ],
      })],
      tippek: [
        evekkel ? 'Hány év telt el a két évszám között? És mennyi az éves szorzó?' : 'Mennyi az éves szorzó, és hányszor szorzunk vele?',
        `„Tegyen fel egy könnyebb kérdést”: 1 év múlva ${f(a)} · q, 2 év múlva ${f(a)} · q², x év múlva ${f(a)} · qˣ. A szorzó: q = ${nyomtat(q)}.`,
        `f(${x}) = ${f(a)} · ${hatv(q, x)} = ${f(a)} · ${f(Math.pow(q, x), 6)}.`,
      ],
      megoldas: [
        `Kiinduló érték: a = ${f(a)}; q = 1 ${i > 0 ? '+' : '−'} ${f(p)}/100 = ${nyomtat(q)}; eltelt idő: x = ${evekkel ? `${Y2} − ${Y1} = ` : ''}${x} év.`,
        `f(x) = a · qˣ = ${f(a)} · ${hatv(q, x)} = ${f(a)} · ${f(Math.pow(q, x), 6)} ≈ <strong>${fe(helyes, al.egys, d)}</strong>.`,
        `GeoGebrában ugyanez: f(x)=${gg(a)}*${gg(q)}^x, majd f(${x}).`,
      ],
      magyarazat: [
        `Az értéket keressük ${x} év múlva. A kiinduló érték ${f(a)} ${al.egys}, évente ${f(p)} %-kal ${novSzo(i)}.`,
        `Tegyen fel egy könnyebb kérdést: mennyi lesz 1 év múlva? ${f(a)} · ${nyomtat(q)} = ${f(a * q, 4)}. És 2 év múlva? Ezt az új értéket szorozzuk újra: ${f(a)} · ${nyomtat(q)}² = ${f(a * q * q, 4)}.`,
        `Ugyanazzal a %-kal változik, ezért évről évre ugyanazzal a számmal szorzunk, ${x}-szer egymás után. Az ismételt szorzást hatványként írjuk: ${f(a)} · ${hatv(q, x)}.`,
        `Képzelje el, hogy a kiinduló érték 100: ${x} év múlva ${f(100 * Math.pow(q, x), 2)} lenne. A mi értékünk ennek ${f(a / 100, 4)}-szorosa, így ${f(a)} · ${f(Math.pow(q, x), 6)} ≈ ${f(helyes, d)}.`,
        `Józan ésszel: ${i > 0 ? 'növekedésnél nagyobb' : 'csökkenésnél kisebb'} lett, mint a kiinduló érték (${f(helyes, d)} ${i > 0 ? '>' : '<'} ${f(a)}). Ha minden évben ugyanannyi egységgel változna, ${f(lin, 2)} jönne ki, de itt a változás %-os, ezért hatvány kell.`,
      ],
      geogebra: { sorok: [`f(x)=${gg(a)}*${gg(q)}^x`, `f(${x})`], megjegyzes: 'A függvényérték a beírt <code>f(…)</code> sorból az algebra-ablakban olvasható le.' },
      abraMegoldas: gorbeAbra({
        gorbek: [{ fn: (t) => ertek(a, q, t), osztaly: 'v1', cimke: 'f(x)', cimkeX: x * 0.55 }], xmax: x * 1.15,
        pontok: [{ x, y: v, cimke: `(${x}; ${f(helyes, d)})` }], leiras: `Az f(x) = ${f(a)} · ${f(q, 4)}^x függvény ${x} évig; a keresett érték ${f(helyes, d)}.`,
      }),
      jegyezze: 'Függvényérték: f(x) = a · qˣ – ugyanannyi %-os változásnál hatványozunk (nem szorzunk x-szel).',
    };
  });
}

// =====================================================================
// E3 – növekvő/csökkenő, értelmezés
// =====================================================================
const FV_NEVEK = [['f', 'x'], ['N', 't'], ['P', 'x'], ['B', 't']];
function E3(rng) {
  return probal(() => {
    const i = irany(rng), p = kozepso(rng), q = szorzo(p, i), a = lepeskoz(rng, 1, 200, 0.5);
    const [nev, v] = valaszt(rng, FV_NEVEK);
    const al = valaszt(rng, ALANYOK);
    const nyom = 100 * q;
    const ellenQ = `Ellenpróba: ${nev}(0) = ${f(a)} · ${f(q, 4)}⁰ = ${f(a)}, ${nev}(1) = ${f(a * q, 4)} – az érték ${q > 1 ? 'nő' : 'csökken'}, mert a szorzó ${f(q, 4)} ${q > 1 ? '>' : '<'} 1.`;
    return {
      szoveg: `${al.nev} (${al.egys}) a(z) ${v} években mérve: ${nev}(${v}) = ${f(a)} · ${f(q, 4)}<sup>${v}</sup>. Értelmezze a függvényt!`,
      mezok: [
        valasztoMezo({
          id: 'irany', cimke: 'Növekvő vagy csökkenő a függvény?',
          opciok: [
            { szoveg: 'növekvő', helyes: q > 1, uzenet: q > 1 ? '' : 'Nézze meg a szorzót: q < 1, ilyenkor minden évben kevesebb marad → csökkenő.', ellenproba: q > 1 ? '' : ellenQ },
            { szoveg: 'csökkenő', helyes: q < 1, uzenet: q < 1 ? '' : 'Nézze meg a szorzót: q > 1, ilyenkor minden évben több lesz → növekvő.', ellenproba: q < 1 ? '' : ellenQ },
          ],
        }),
        szamMezo({
          id: 'a', cimke: `Mennyi a kiinduló érték (${al.egys})?`, helyes: a, tizedes: 2,
          ellenproba: (w) => `Ellenpróba: ${v} = 0-nál ${f(q, 4)}⁰ = 1, ezért ${nev}(0) = a · 1 = a. Ha ${f(w)} lenne a kiinduló érték, akkor ${nev}(0) = ${f(w)} lenne, de a képletben ${f(a)} áll.`,
          hibak: [{ ertek: q, uzenet: 'Ez a szorzó (q). A kiinduló érték az a, amellyel a hatvány meg van szorozva – az x = 0-nál mért érték.' }],
        }),
        szamMezo({
          id: 'p', cimke: 'Hány %-kal változik évente? (előjellel, egy tizedesre)', helyes: tisztit(i * p), tizedes: 1, egyseg: '%', elojel: 'elojeles',
          ellenproba: (w) => `Ellenpróba: ha évente ${f(w)} %-kal változna, a szorzó ${f(1 + w / 100, 4)} lenne, nem ${f(q, 4)}.`,
          hibak: [{ ertek: tisztit(nyom), uzenet: `A ${f(nyom, 2)} % az, ami megmarad az előző értékből; a változás ennél 100-zal kevesebb: ${f(i * p)} %.` }],
        }),
      ],
      tippek: [
        'Melyik szám a szorzó, vagyis az, ami a kitevős rész alapja? Nagyobb vagy kisebb 1-nél?',
        `${nev}(${v}) = a · q${v}: az a a kiinduló érték (${v} = 0-nál q⁰ = 1), q = ${f(q, 4)} az éves szorzó. q < 1 → csökkenő, q > 1 → növekvő.`,
        `A változás: q − 1 = ${f(q, 4)} − 1 = ${f(q - 1, 4)} → ${f(i * p)} %.`,
      ],
      megoldas: [
        `A képletben a = ${f(a)}, q = ${f(q, 4)}.`,
        `q ${q > 1 ? '> 1' : '< 1'} → a függvény <strong>${q > 1 ? 'növekvő' : 'csökkenő'}</strong>.`,
        `Kiinduló érték: ${nev}(0) = ${f(a)} · q⁰ = <strong>${f(a)} ${al.egys}</strong>.`,
        `Éves változás: (q − 1) · 100 = (${f(q, 4)} − 1) · 100 = <strong>${f(i * p)} %</strong> (a ${f(nyom, 2)} % az, ami megmarad).`,
      ],
      magyarazat: [
        `A függvény ${nev}(${v}) = ${f(a)} · ${f(q, 4)}${sup(v === 'x' ? '' : '')}${v}. Az a szám (${f(a)}) és a q szám (${f(q, 4)}) mást jelent, ezt kell megfejteni.`,
        `A kiinduló érték: x = 0-nál a hatvány q⁰ = 1, ezért ${nev}(0) = ${f(a)} · 1 = ${f(a)} ${al.egys}. A q azt mondja meg, hányszorosára változik az érték egy év alatt.`,
        `Képzelje el, hogy a kiinduló érték 100: egy év után ${f(100 * q, 3)} lesz. ${q > 1 ? 'Ez több 100-nál, ezért a függvény növekvő' : 'Ez kevesebb 100-nál, ezért a függvény csökkenő'}.`,
        `A változás nem a ${f(nyom, 2)}, hanem ennek a 100-hoz képesti eltérése: ${f(nyom, 2)} − 100 = ${f(nyom - 100, 2)}, vagyis ${f(i * p)} % évente. A ${f(nyom, 2)} % az, ami az előző értékből megmarad.`,
        `Józan ésszel: q = ${f(q, 4)} ${q > 1 ? '> 1' : '< 1'} és ${f(i * p)} % ${i > 0 ? 'pozitív' : 'negatív'} változás – a kettő egymásnak megfelel ✓.`,
      ],
      jegyezze: 'f(x) = a · qˣ: az a a kiinduló érték (x = 0), q > 1 növekvő, 0 < q < 1 csökkenő; az éves változás (q − 1) · 100 %.',
    };
  });
}

// =====================================================================
// E4 – kétszereződés / feleződés
// =====================================================================
function E4(rng) {
  return probal(() => {
    const i = irany(rng), p = lepeskoz(rng, 1, 25, 0.1), q = szorzo(p, i), al = valaszt(rng, ALANYOK);
    const cel = i > 0 ? 2 : 0.5;
    const x = idoig(1, q, cel);
    if (x < 1 || x > 120) return null;
    const lin = i > 0 ? 100 / p : 50 / p;
    const szo = i > 0 ? 'duplázódik' : 'feleződik';
    return {
      szoveg: `${al.nev} évente ${f(p)} %-kal ${novSzo(i)}. Hány év alatt ${szo} meg az értéke? (egy tizedesre kerekítve)`,
      mezok: [szamMezo({
        cimke: `Hány év alatt ${szo}? (egy tizedesre)`, helyes: x, tizedes: 1, egyseg: 'év',
        ellenproba: (w) => `Ellenpróba: ${f(w, 2)} év alatt az érték ${hatv(q, w)} = ${f(Math.pow(q, w), 4)}-szeresére változik, nem ${f(cel, 1)}-szeresére (${i > 0 ? 'kétszeresére' : 'felére'}).`,
        hibak: [{ ertek: lin, uzenet: 'Ez lineáris becslés (egyszerű kamat logikája). Itt a változás %-os, és a %-os változás hatványozás: logaritmus vagy GeoGebra-metszéspont kell.' }],
      })],
      tippek: [
        `Mennyivel kell megszorozni az értéket, hogy ${i > 0 ? 'kétszeres' : 'fele'} legyen? Mi az ismeretlen: az alap vagy a kitevő?`,
        `A kiinduló érték mindegy (100 → ${f(100 * cel, 1)} ugyanannyi idő, mint 200 → ${f(200 * cel, 1)}): ${f(q, 4)}ˣ = ${f(cel, 1)}.`,
        `A kitevőt a logaritmus „csalogatja le”: x = lg ${f(cel, 1)} : lg ${f(q, 4)}.`,
      ],
      megoldas: [
        `q = 1 ${i > 0 ? '+' : '−'} ${f(p)}/100 = ${nyomtat(q)}. A kiinduló érték nem számít, ezért ${nyomtat(q)}ˣ = ${f(cel, 1)}.`,
        `Logaritmus mindkét oldalon: x · lg ${nyomtat(q)} = lg ${f(cel, 1)} → x = ${f(Math.log10(cel), 5)} : ${f(Math.log10(q), 5)} = ${f(x, 3)}.`,
        `x ≈ <strong>${f(x, 1)} év</strong>. Papíron is megoldható (lg vagy ln is jó); GeoGebrában: f(x)=${gg(q)}^x, g(x)=${f(cel, 1)}, Metszéspont(f, g).`,
      ],
      magyarazat: [
        `Azt keressük, mennyi idő alatt ${i > 0 ? 'lesz az érték a kétszerese' : 'csökken az érték a felére'}. A kiinduló értéket nem ismerjük, de nem is kell: a ${szo} idő nem függ attól.`,
        `Képzelje el, hogy az érték 100, és ${i > 0 ? 'meg kell kétszereződnie (100 → 200)' : 'meg kell feleződnie (100 → 50)'}. Ha az érték 200 lenne, ugyanez ${i > 0 ? '200 → 400' : '200 → 100'} – ugyanannyi idő alatt, mert ugyanazzal a szorzóval szorzunk.`,
        `Ezért elég a szorzót hatványozni: ${nyomtat(q)}ˣ = ${f(cel, 1)}. Az ismeretlen a kitevőben van, ezért logaritmus kell: lg(qˣ) = x · lg q, vagyis x = lg ${f(cel, 1)} : lg ${nyomtat(q)} = ${f(x, 3)}.`,
        `Józan ésszel: egyszerű (lineáris) becsléssel ${f(lin, 1)} év jönne ki, de itt a %-os változás hatványozás, ezért az eredmény eltér: ${f(x, 1)} év. Ellenpróba: ${hatv(q, x, 4)} ≈ ${f(Math.pow(q, x), 3)} ✓.`,
      ],
      geogebra: { sorok: [`f(x)=${gg(q)}^x`, `g(x)=${gg(cel)}`, 'Metszéspont(f, g)'], megjegyzes: 'A metszéspont x-koordinátája a keresett idő.' },
      abraMegoldas: gorbeAbra({
        gorbek: [{ fn: (t) => Math.pow(q, t), osztaly: 'v1', cimke: `${f(q, 4)}^x`, cimkeX: x * 0.45 }],
        xmax: x * 1.6, vizsz: [{ y: cel, cimke: `y = ${f(cel, 1)}` }],
        pontok: [{ x, y: cel, cimke: `(${f(x, 1)}; ${f(cel, 1)})` }], yfelirat: 'érték (a kiinduló érték többszöröse)',
        leiras: `A ${f(q, 4)}^x görbe és az y = ${f(cel, 1)} egyenes metszéspontja ${f(x, 1)} évnél.`,
      }),
      jegyezze: 'Kétszereződés / feleződés: qˣ = 2 (vagy 0,5) → x = lg 2 : lg q; a kiinduló értéktől nem függ.',
    };
  });
}

// =====================================================================
// E5 – mikor éri el?
// =====================================================================
function E5(rng) {
  return probal(() => {
    const i = irany(rng), p = lepeskoz(rng, 0.2, 25, 0.1), q = szorzo(p, i), al = valaszt(rng, ALANYOK);
    const a = valaszt(rng, KEZDOK);
    const evbeli = rng() < 0.5;
    const nyers = i > 0 ? a * (1.2 + rng() * 6) : a * (0.15 + rng() * 0.7);
    const cel = Number(nyers.toPrecision(2));
    if (!szep(cel, 2) || cel === a || (i > 0) !== (cel > a)) return null;
    const x = idoig(a, q, cel);
    if (evbeli ? (x < 3 || x > 150) : (x < 1.5 || x > 60)) return null;
    const frakcio = x - Math.floor(x);
    if (frakcio < 0.08 || frakcio > 0.92) return null;
    const lin = i > 0 ? ((cel / a - 1) * 100) / p : ((1 - cel / a) * 100) / p;
    const Y1 = egesz(rng, 1950, 2000);
    const Y = Y1 + Math.ceil(x);
    const kerdes = i > 0 ? `legalább ${f(cel)} ${al.egys}` : `${f(cel)} ${al.egys} alá`;
    const ige = i > 0 ? 'lesz' : 'csökken';
    const szamitas = [
      `q = ${nyomtat(q)}; keressük azt az x-et, amelyre ${f(a)} · ${nyomtat(q)}ˣ ${i > 0 ? '≥' : '≤'} ${f(cel)}.`,
      `Osztás a kiinduló értékkel: ${nyomtat(q)}ˣ = ${f(cel)} : ${f(a)} = ${f(cel / a, 5)}.`,
      `Logaritmus: x = lg ${f(cel / a, 5)} : lg ${nyomtat(q)} = ${f(Math.log10(cel / a), 5)} : ${f(Math.log10(q), 5)} = ${f(x, 3)}.`,
    ];
    const abra = gorbeAbra({
      gorbek: [{ fn: (t) => ertek(a, q, t), osztaly: 'v1', cimke: 'f(x)', cimkeX: x * 0.5 }], xmax: x * 1.4,
      vizsz: [{ y: cel, cimke: `y = ${f(cel)}` }], pontok: [{ x, y: cel, cimke: `(${f(x, 1)}; ${f(cel)})` }],
      leiras: `Az f(x) = ${f(a)} · ${f(q, 4)}^x görbe eléri a ${f(cel)} értéket x = ${f(x, 1)} évnél.`,
    });
    const gegebra = { sorok: [`f(x)=${gg(a)}*${gg(q)}^x`, `g(x)=${gg(cel)}`, 'Metszéspont(f, g)'], megjegyzes: 'A metszéspont x-koordinátája az idő években.' };
    const magyar = (veg) => [
      `Azt keressük, mikor ${ige} ${kisbetus(al.nev)} ${kerdes}. Kiinduló érték: ${f(a)} ${al.egys}, évente ${f(p)} %-kal ${novSzo(i)}.`,
      `Képzelje el, hogy a kiinduló érték 100 volt: a célnak ${f(100 * cel / a, 2)} felel meg, ez ${f(cel / a, 4)}-szeres változás. A ${f(cel)} : ${f(a)} = ${f(cel / a, 4)} hányados ugyanennyi.`,
      `A szorzó ${nyomtat(q)}, tehát ${nyomtat(q)}ˣ = ${f(cel / a, 4)}. Az x a kitevőben van, ezért logaritmus kell: x = lg ${f(cel / a, 4)} : lg ${nyomtat(q)} = ${f(x, 3)}.`,
      ...veg,
    ];
    if (!evbeli) {
      return {
        szoveg: `${al.nev} jelenleg ${fe(a, al.egys)}, és évente ${f(p)} %-kal ${novSzo(i)}. Hány év múlva ${ige} ${kerdes}? (egy tizedesre kerekítve)`,
        mezok: [szamMezo({
          cimke: 'Az idő (év, egy tizedesre)', helyes: x, tizedes: 1, egyseg: 'év',
          ellenproba: (w) => `Ellenpróba: ${f(w, 2)} év múlva az érték ${f(a)} · ${hatv(q, w)} = ${f(ertek(a, q, w), 2)} ${al.egys} lenne, nem ${f(cel)} ${al.egys}.`,
          hibak: [{ ertek: lin, uzenet: 'Ez lineáris becslés. A %-os változás hatványozás, ezért logaritmus (vagy GeoGebra-metszéspont) kell.' }],
        })],
        tippek: [
          'Melyik betű az ismeretlen az a · qˣ = cél egyenletben – a tényező vagy a kitevő?',
          `Először osszon a kiinduló értékkel: ${f(cel)} : ${f(a)} = ${f(cel / a, 5)} = ${nyomtat(q)}ˣ.`,
          `A kitevőt a logaritmus „csalogatja le”: x = lg ${f(cel / a, 5)} : lg ${nyomtat(q)}.`,
        ],
        megoldas: [...szamitas, `x ≈ <strong>${f(x, 1)} év</strong>.`],
        magyarazat: magyar([`Józan ésszel: ${x > 1 ? `${f(x, 1)} év` : 'az idő'} ${i > 0 ? 'alatt nő' : 'alatt csökken'} annyit az érték; ellenpróba: ${f(a)} · ${hatv(q, x, 4)} ≈ ${f(ertek(a, q, x), 2)} ✓.`]),
        geogebra: gegebra, abraMegoldas: abra,
        jegyezze: 'Mikor éri el? a · qˣ = cél → osztás a-val → logaritmus: x = lg(cél/a) : lg q.',
      };
    }
    return {
      szoveg: `${al.nev} ${evben(Y1)} ${fe(a, al.egys)} volt, azóta évente ${f(p)} %-kal ${novSzo(i)}. Melyik évben ${ige} ${kerdes}? (Egész évszámot adjon meg.)`,
      mezok: [szamMezo({
        cimke: 'Melyik évben? (évszám)', helyes: Y, tizedes: 0,
        ellenproba: (w) => `Ellenpróba: ${f(w, 0)}-ig ${f(w - Y1, 0)} év telt el, az érték ${f(a)} · ${hatv(q, w - Y1)} = ${f(ertek(a, q, w - Y1), 2)} ${al.egys}${i > 0 ? (ertek(a, q, w - Y1) >= cel ? ' – ez már eléri a célt, de az előző évben még nem' : ' – ez még nem éri el a célt') : (ertek(a, q, w - Y1) <= cel ? ' – ez már a cél alatt van, de az előző évben még nem' : ' – ez még nem csökkent a cél alá')}; a cél ${f(cel)}.`,
        hibak: [
          { ertek: Y1 + Math.floor(x), uzenet: `Ha ${f(x, 1)} év kell, a ${Math.floor(x)}. év végén ${i > 0 ? 'még nincs elérve' : 'még nincs alatta'} → a következő évben lesz meg. Felfelé kell kerekíteni.` },
          { ertek: Math.ceil(x), uzenet: 'Ez az eltelt évek száma. A kérdés évszámot kér, ezért a kezdőévhez hozzá kell adni.' },
        ],
      })],
      tippek: [
        'Hány év kell ahhoz, hogy elérje a célt? És ebből hogyan lesz évszám?',
        `Először osszon a kiinduló értékkel: ${f(cel)} : ${f(a)} = ${f(cel / a, 5)} = ${nyomtat(q)}ˣ → logaritmus: x = lg ${f(cel / a, 5)} : lg ${nyomtat(q)} = ${f(x, 2)}.`,
        `Felfelé kerekítve ${Math.ceil(x)} év; a kezdőév ${Y1}, tehát ${Y1} + ${Math.ceil(x)}.`,
      ],
      megoldas: [...szamitas, `x ≈ ${f(x, 2)} → felfelé kerekítve ${Math.ceil(x)} év (a ${Math.floor(x)}. év végén még ${i > 0 ? 'nincs elérve' : 'nincs alatta'}).`, `Az évszám: ${Y1} + ${Math.ceil(x)} = <strong>${Y}</strong>.`],
      magyarazat: magyar([`Az x nem egész (${f(x, 2)}): a ${Math.floor(x)}. év végén az érték még ${f(ertek(a, q, Math.floor(x)), 3)} ${i > 0 ? '< ' : '> '}${f(cel)}, a ${Math.ceil(x)}. év végén már ${f(ertek(a, q, Math.ceil(x)), 3)} ${i > 0 ? '≥ ' : '≤ '}${f(cel)}. Ezért ${Y1} + ${Math.ceil(x)} = ${Y} az az év, amikor ez teljesül.`, `Józan ésszel: ellenpróbaként a ${Y} előtti évben (${Y - 1}) még ${i > 0 ? 'nincs elérve' : 'nincs alatta'} a cél, a ${Y}. évben már igen.`]),
      geogebra: gegebra, abraMegoldas: abra,
      jegyezze: 'Ha évszámot kérdeznek: az eltelt évek számát felfelé kerekítjük, és hozzáadjuk a kezdőévhez.',
    };
  });
}

// =====================================================================
// E6 – éves ütem két adatból
// =====================================================================
function E6(rng) {
  return probal(() => {
    const i = irany(rng), p0 = lepeskoz(rng, 0.3, 20, 0.1), q0 = szorzo(p0, i), al = valaszt(rng, ALANYOK);
    const a = valaszt(rng, [3.2, 5, 8.5, 10, 12, 20, 25, 40, 50, 75, 80, 100, 150, 200, 250, 400, 500]);
    const n = egesz(rng, 2, 30);
    const Y1 = egesz(rng, 1960, 2000), Y2 = Y1 + n;
    const b = kerekit(a * Math.pow(q0, n), 2);
    if (b <= 0 || !szep(b, 2) || b === a) return null;
    const p = (evesSzorzo(a, b, n) - 1) * 100;
    const p10 = p * 10;
    if (Math.abs(Math.abs(p10 - Math.trunc(p10)) - 0.5) < 0.12) return null;
    const helyes = kerekit(p, 1);
    if (helyes === 0) return null;
    const q = evesSzorzo(a, b, n);
    const rossz = [
      { ertek: ((b - a) / n), uzenet: 'Ez lineáris lenne (minden évben ugyanannyi egységgel változna). Azonos arányú változásnál n-edik gyököt kell vonni.' },
      { ertek: (b / a - 1) * 100, uzenet: 'Ez az egész időszak alatti változás, nem az éves. Az éves szorzó a ' + n + '. gyök.' },
      { ertek: (Math.pow(Math.max(b - a, 0), 1 / n) - 1) * 100, uzenet: 'A szorzás ellentéte az osztás, nem a kivonás: qⁿ = b : a, nem b − a.' },
    ];
    return {
      szoveg: `${al.nev} ${evben(Y1)} ${fe(a, al.egys)}, ${evben(Y2)} ${fe(b, al.egys)} volt. Átlagosan hány %-kal változott évente, ha azonos arányú éves változást feltételezünk?`,
      mezok: [szamMezo({
        cimke: 'Éves változás (%, előjellel, egy tizedesre)', helyes, tizedes: 1, egyseg: '%', elojel: 'elojeles',
        ellenproba: (w) => `Ellenpróba: ha évente ${f(w, 2)} %-kal változna, ${n} év alatt ${f(a)} · ${hatv(1 + w / 100, n)} = ${f(a * Math.pow(1 + w / 100, n), 2)} ${al.egys} lenne, nem ${f(b)} ${al.egys}.`,
        hibak: rossz,
      })],
      tippek: [
        `Hány év telt el, és hányszorosára változott az érték? Melyik szám a 100 % – a régi vagy az új?`,
        `a · qⁿ = b → osztás a-val (nem kivonás!): qⁿ = ${f(b)} : ${f(a)} = ${f(b / a, 5)}.`,
        `${n}. gyök: q = ${f(q, 5)}; utána (q − 1) · 100.`,
      ],
      megoldas: [
        `Eltelt idő: ${Y2} − ${Y1} = ${n} év. a = ${f(a)}, b = ${f(b)}.`,
        `a · qⁿ = b → qⁿ = b : a = ${f(b)} : ${f(a)} = ${f(b / a, 5)}.`,
        `${n}. gyök: q = ${f(q, 5)}; az éves változás (q − 1) · 100 = <strong>${f(helyes, 1)} %</strong> (GeoGebrában: (${gg(b)}/${gg(a)})^(1/${n})).`,
      ],
      magyarazat: [
        `Az éves változást keressük, ha minden évben ugyanannyi %-kal változott az érték. Két adatunk van, ${n} év különbséggel.`,
        `Képzelje el, hogy a kezdőérték 100 volt: ${n} év alatt ${f(100 * b / a, 2)} lett. Ez ${f(b / a, 4)}-szeres változás ${n} év alatt, vagyis minden évben ugyanazzal a q számmal szoroztunk ${n}-szer: qⁿ = ${f(b / a, 4)}.`,
        `A b : a hányadost osztással kapjuk (a szorzás ellentéte az osztás, nem a kivonás), a kitevőt pedig gyökvonással bontjuk le: q = ${n}. gyök alatt ${f(b / a, 4)} = ${f(q, 5)}.`,
        `A q az éves szorzó, a változás ebből (q − 1) · 100 = ${f(helyes, 1)} %.`,
        `Józan ésszel: ${i > 0 ? 'nőtt' : 'csökkent'} az érték, ezért ${i > 0 ? 'pozitív' : 'negatív'} lett az éves változás. Ellenpróba: ${f(a)} · ${hatv(q, n, 4)} ≈ ${f(a * Math.pow(q, n), 2)} ✓. A teljes változás ${f((b / a - 1) * 100, 1)} % – ez nem az éves.`,
      ],
      geogebra: { sorok: [`q=(${gg(b)}/${gg(a)})^(1/${n})`, '(q-1)*100'], megjegyzes: 'Az n-edik gyök a virtuális billentyűzet f(x) fülén is megtalálható; tizedespontot használjon.' },
      jegyezze: 'Éves ütem két adatból: osztunk (b : a), n-edik gyököt vonunk, majd (q − 1) · 100 %.',
    };
  });
}

// =====================================================================
// E7 – előrejelzés
// =====================================================================
function E7(rng) {
  return probal(() => {
    const i = irany(rng), p0 = lepeskoz(rng, 0.5, 15, 0.1), q0 = szorzo(p0, i), al = valaszt(rng, ALANYOK);
    const a = valaszt(rng, [10, 20, 25, 40, 50, 80, 100, 150, 200, 250, 400, 500]);
    const n = egesz(rng, 3, 12), tavolsag = egesz(rng, 3, 25);
    const Y1 = egesz(rng, 1980, 2005), Y2 = Y1 + n, Y3 = Y2 + tavolsag;
    const b = kerekit(a * Math.pow(q0, n), 2);
    if (!szep(b, 2) || b === a) return null;
    const q = evesSzorzo(a, b, n);
    const v = b * Math.pow(q, Y3 - Y2);
    if (v < 1 || v > 1e6) return null;
    const d = tiz(v) === 0 ? 0 : 1;
    const helyes = kerekit(v, d);
    const lin = b + ((b - a) / n) * (Y3 - Y2);
    if (lin <= 0) return null;
    return {
      szoveg: `${al.nev} ${evben(Y1)} ${fe(a, al.egys)}, ${evben(Y2)} ${fe(b, al.egys)} volt. Ha az éves változás azonos arányú marad, mennyi lesz ${evben(Y3)}?`,
      mezok: [szamMezo({
        cimke: `Az érték (${al.egys}, ${d === 0 ? 'egészre' : 'egy tizedesre'} kerekítve)`, helyes: v, tizedes: d, egyseg: al.egys, relTures: 0.005,
        ellenproba: (w) => `Ellenpróba: ha ${f(w, d)} lenne az érték ${evben(Y3)}, akkor a ${Y3 - Y2} év alatti éves szorzó (${f(w, d)} : ${f(b)})^(1/${Y3 - Y2}) = ${f(Math.pow(w / b, 1 / (Y3 - Y2)), 4)} lenne, nem ${f(q, 4)}.`,
        hibak: [
          { ertek: lin, uzenet: 'Ez lineáris előrejelzés (minden évben ugyanannyi egység). Azonos arányú változásnál a szorzó hatványa kell.' },
          { ertek: a * Math.pow(q, Y3 - Y2), uzenet: `A kiinduló érték a ${Y2}-es (${f(b)}), nem a ${Y1}-es: onnan ${Y3 - Y2} évet haladunk.` },
        ],
      })],
      tippek: [
        `Mi az éves szorzó, és onnan hány évet kell előre menni?`,
        `Először a szorzó: q = ${n}. gyök alatt (${f(b)} : ${f(a)}) = ${f(q, 5)}.`,
        `Aztán a ${Y2}-es értékből ${Y3 - Y2} évet előre: ${f(b)} · q${sup(Y3 - Y2)}.`,
      ],
      megoldas: [
        `Az éves szorzó: q = (${f(b)} : ${f(a)})^(1/${n}) = ${f(q, 5)}.`,
        `${Y3} − ${Y2} = ${Y3 - Y2} év telik el a ${Y2}-es adat után: ${f(b)} · ${f(q, 5)}${sup(Y3 - Y2)} = ${f(b)} · ${f(Math.pow(q, Y3 - Y2), 5)} ≈ <strong>${fe(helyes, al.egys, d)}</strong>.`,
        `A kerekített q-val (${f(q, 3)}) számolt érték is elfogadott (±0,5 %), de a pontos q-val pontosabb.`,
      ],
      magyarazat: [
        `Két adatból kell előrejelezni. Először az éves ütemet kell megtudni, utána ezzel haladunk tovább a ${Y2}-es adattól.`,
        `Az ütem: ${n} év alatt ${f(b / a, 4)}-szeres változás, ezért a q az ${n}. gyök alatt ${f(b / a, 4)} = ${f(q, 5)}.`,
        `A ${Y3 - Y2} további évre ugyanezzel a szorzóval szorzunk, ${Y3 - Y2}-szer: ${f(b)} · ${hatv(q, Y3 - Y2, 5)} ≈ ${f(helyes, d)}. Képzelje el: ha az utolsó adat 100 lenne, ${Y3 - Y2} év múlva ${f(100 * Math.pow(q, Y3 - Y2), 2)} lenne.`,
        `Józan ésszel: ${i > 0 ? 'nőtt' : 'csökkent'} az érték, ezért a későbbi érték is ${i > 0 ? 'nagyobb' : 'kisebb'}, mint ${f(b)}. Lineárisan ${f(lin, 1)} jönne ki – az nem azonos arányú változás.`,
      ],
      geogebra: { sorok: [`q=(${gg(b)}/${gg(a)})^(1/${n})`, `${gg(b)}*q^${Y3 - Y2}`], megjegyzes: 'A pontos q-val számoljon (ne kerekítse közben).' },
      jegyezze: 'Előrejelzés két adatból: q = ⁿ√(b/a), majd az utolsó adatból a hátralévő évek számával hatványozunk.',
    };
  });
}

// =====================================================================
// E8 – két függvény metszéspontja
// =====================================================================
function E8(rng) {
  return probal(() => {
    const p1 = lepeskoz(rng, 5, 25, 0.1), dp = lepeskoz(rng, 0.2, 3, 0.1);
    const p2 = tisztit(p1 + dp);
    const q1 = szorzo(p1), q2 = szorzo(p2);
    const a2 = valaszt(rng, [20, 25, 40, 50, 60, 75, 80, 100, 120]);
    const a1 = a2 + valaszt(rng, [3, 5, 8, 10, 15, 20, 25, 30]);
    const x = metszes(a1, q1, a2, q2);
    if (x < 2 || x > 40 || Math.abs(x - Math.round(x)) < 0.1) return null;
    const Y0 = valaszt(rng, [1990, 1993, 1995, 2000, 2005]);
    const Y = Y0 + Math.ceil(x);
    const [n1, n2] = valaszt(rng, [['Az egyik márka', 'a másik márka'], ['A benzin', 'a gázolaj'], ['A bérleti díj', 'a lakásár']]);
    return {
      szoveg: `${n1} ára ${evben(Y0)} ${fe(a1, 'Ft')} volt, és évente ${f(p1)} %-kal nő, ${kisbetus(n2)} ára ugyanekkor ${fe(a2, 'Ft')}, és évente ${f(p2)} %-kal nő. Hány év múlva éri utol ${kisbetus(n2)} ára ${kisbetus(n1)} árát, és melyik évben?`,
      mezok: [
        szamMezo({
          id: 'x', cimke: 'Hány év múlva? (egy tizedesre)', helyes: x, tizedes: 1, egyseg: 'év',
          ellenproba: (w) => `Ellenpróba: ${f(w, 2)} év múlva az egyik ár ${f(a1)} · ${hatv(q1, w)} = ${f(ertek(a1, q1, w), 2)} Ft, a másik ${f(a2)} · ${hatv(q2, w)} = ${f(ertek(a2, q2, w), 2)} Ft – ${Math.abs(ertek(a1, q1, w) - ertek(a2, q2, w)) < 0.05 ? 'egyenlők' : 'nem egyenlők'}.`,
          hibak: [
            { ertek: (a1 - a2) / ((a2 * (q2 - 1)) - (a1 * (q1 - 1))), uzenet: 'Ez lineáris közelítés (minden évben ugyanannyi forinttal változnának az árak). Itt %-os változás van: exponenciális egyenlet.' },
          ].filter((h) => Number.isFinite(h.ertek) && h.ertek > 0),
        }),
        szamMezo({
          id: 'ev', cimke: 'Melyik évben éri utol? (évszám)', helyes: Y, tizedes: 0,
          ellenproba: (w) => `Ellenpróba: ${f(w, 0)}-ig ${f(w - Y0, 0)} év telt el: az egyik ár ${f(ertek(a1, q1, w - Y0), 2)} Ft, a másik ${f(ertek(a2, q2, w - Y0), 2)} Ft – ${ertek(a2, q2, w - Y0) >= ertek(a1, q1, w - Y0) ? 'itt már utolérte (de az előző évben még nem)' : 'itt még nem érte utol'}.`,
          hibak: [{ ertek: Y0 + Math.floor(x), uzenet: `Ha ${f(x, 1)} év kell, a ${Math.floor(x)}. év végén még nem érte utol → a következő évben. Felfelé kell kerekíteni.` }],
        }),
      ],
      tippek: [
        'Mit jelent, hogy utoléri? Mi igaz ekkor a két árra?',
        `Utoléri → a két érték egyenlő: ${f(a1)} · ${nyomtat(q1)}ˣ = ${f(a2)} · ${nyomtat(q2)}ˣ. Az x-es hatványokat az egyik oldalra, a számokat a másikra vigye.`,
        `(${nyomtat(q2)} : ${nyomtat(q1)})ˣ = ${f(a1)} : ${f(a2)} → x = lg(${f(a1 / a2, 5)}) : lg(${f(q2 / q1, 6)}).`,
      ],
      megoldas: [
        `${f(a1)} · ${nyomtat(q1)}ˣ = ${f(a2)} · ${nyomtat(q2)}ˣ.`,
        `Osztás ${f(a2)}-vel és ${nyomtat(q1)}ˣ-nel: (${nyomtat(q2)} : ${nyomtat(q1)})ˣ = ${f(a1)} : ${f(a2)} = ${f(a1 / a2, 5)}.`,
        `x = lg ${f(a1 / a2, 5)} : lg ${f(q2 / q1, 6)} = ${f(x, 3)} ≈ <strong>${f(x, 1)} év</strong>.`,
        `Felfelé kerekítve ${Math.ceil(x)} év → ${Y0} + ${Math.ceil(x)} = <strong>${Y}</strong>.`,
      ],
      magyarazat: [
        `Azt keressük, mikor lesz a két ár egyenlő. Az egyik drágábban indul, de a másik gyorsabban nő, ezért egyszer utoléri.`,
        `Egyenlő ár: ${f(a1)} · ${nyomtat(q1)}ˣ = ${f(a2)} · ${nyomtat(q2)}ˣ. Az x mindkét oldalon kitevőben van, ezért a hatványokat egy oldalra gyűjtjük: (${nyomtat(q2)} : ${nyomtat(q1)})ˣ = ${f(a1)} : ${f(a2)}.`,
        `Az ismeretlen a kitevőben van, ezért logaritmus kell: x = lg ${f(a1 / a2, 5)} : lg ${f(q2 / q1, 6)} = ${f(x, 3)} év.`,
        `Ez nem egész év: a ${Math.floor(x)}. év végén a gyorsabban növő még elmarad, a ${Math.ceil(x)}. év végére már utoléri, ezért ${Y0} + ${Math.ceil(x)} = ${Y}.`,
        `Józan ésszel: az indulásnál a második ár kisebb (${f(a2)} < ${f(a1)}), a ${Math.ceil(x)}. évben ${f(ertek(a2, q2, Math.ceil(x)), 2)} ≥ ${f(ertek(a1, q1, Math.ceil(x)), 2)} ✓.`,
      ],
      geogebra: { sorok: [`f(x)=${gg(a1)}*${gg(q1)}^x`, `g(x)=${gg(a2)}*${gg(q2)}^x`, 'Metszéspont(f, g)'], megjegyzes: 'A tengelyarányt a rajzlapon jobb klikkel állíthatja; a kurzort az origóra téve görgessen.' },
      abraMegoldas: gorbeAbra({
        gorbek: [
          { fn: (t) => ertek(a1, q1, t), osztaly: 'v1', cimke: 'első', cimkeX: x * 0.3 },
          { fn: (t) => ertek(a2, q2, t), osztaly: 'v2', cimke: 'második', cimkeX: x * 1.35 },
        ], xmax: x * 1.5, pontok: [{ x, y: ertek(a1, q1, x), cimke: `(${f(x, 1)}; ${f(ertek(a1, q1, x), 1)})` }],
        yfelirat: 'ár (Ft)', leiras: `A két exponenciális görbe ${f(x, 1)} évnél metszi egymást.`,
      }),
      jegyezze: 'Két exponenciális függvény metszéspontja: a₁q₁ˣ = a₂q₂ˣ → (q₂ : q₁)ˣ = a₁ : a₂ → x = lg(a₁/a₂) : lg(q₂/q₁).',
    };
  });
}

// =====================================================================
// E9 – exponenciális-e? (választós)
// =====================================================================
function E9(rng) {
  const csokkeno = rng() < 0.5;
  const a = valaszt(rng, [2, 3, 4, 5, 10]);
  const qn = valaszt(rng, [2, 3, 1.5, 4]), qc = valaszt(rng, [0.5, 0.6, 0.8, 0.25, 0.9]);
  const jo = csokkeno ? { sz: `f(x) = ${f(a)} · ${f(qc)}<sup>x</sup>`, q: qc } : { sz: `f(x) = ${f(a)} · ${f(qn)}<sup>x</sup>`, q: qn };
  const m = valaszt(rng, [2, 3, 5]), n = valaszt(rng, [1, 2, 4]);
  const csalik = [
    { sz: `f(x) = ${f(a)} · x<sup>2</sup>`, uz: 'Itt az x az alap, nem a kitevő – ez másodfokú függvény, nem exponenciális.', ell: (x) => `Ellenpróba: f(1) = ${f(a)}, f(2) = ${f(a * 4)}, f(3) = ${f(a * 9)} – a változás nem azonos arányú (${f(4)}-szeres, majd ${f(9 / 4, 2)}-szeres).` },
    { sz: `f(x) = x<sup>3</sup> + ${f(m)}`, uz: 'Itt az x az alap, nem a kitevő – ez harmadfokú függvény, nem exponenciális.', ell: () => `Ellenpróba: f(1) = ${f(1 + m)}, f(2) = ${f(8 + m)}, f(3) = ${f(27 + m)} – a hányadosok nem egyformák.` },
    { sz: `f(x) = ${f(m)}x + ${f(n)}`, uz: 'Ez lineáris: minden lépésben ugyanannyival változik, nem ugyanannyiszorosára.', ell: () => `Ellenpróba: f(0) = ${f(n)}, f(1) = ${f(m + n)}, f(2) = ${f(2 * m + n)} – a különbség állandó (${f(m)}), nem a hányados.` },
  ];
  if (csokkeno) csalik.push({ sz: `f(x) = ${f(a)} · ${f(qn)}<sup>x</sup>`, uz: 'Ez exponenciális, de a szorzó 1-nél nagyobb → növekvő, nem csökkenő.', ell: () => `Ellenpróba: f(0) = ${f(a)}, f(1) = ${f(a * qn)}, f(2) = ${f(a * qn * qn)} – az érték nő.` });
  const rossz = kever(rng, csalik).slice(0, 3);
  const opciok = kever(rng, [
    { szoveg: jo.sz, helyes: true },
    ...rossz.map((c) => ({ szoveg: c.sz, helyes: false, uzenet: c.uz, ellenproba: c.ell() })),
  ]);
  return {
    szoveg: csokkeno ? 'Melyik függvény exponenciális ÉS csökkenő?' : 'Melyik függvény exponenciális?',
    mezok: [valasztoMezo({ cimke: 'Válasszon!', opciok })],
    tippek: [
      'Hol áll az x: az alapban vagy a kitevőben?',
      `Exponenciális: a · qˣ, az x a kitevőben van. ${csokkeno ? 'Csökkenő, ha 0 < q < 1.' : 'Növekvő, ha q > 1.'}`,
    ],
    megoldas: [
      'Exponenciális függvénynél az x a kitevőben van, az alap egy konkrét szám.',
      `A helyes: ${jo.sz} (q = ${f(jo.q)} ${jo.q > 1 ? '> 1: növekvő' : '< 1: csökkenő'}).`,
    ],
    magyarazat: [
      'Azt kérdezik, melyik képlet exponenciális. Ezt egyetlen dolog dönti el: az x a kitevőben van, vagy az alapban?',
      'Az x² vagy x³ nem exponenciális (az másod-, harmadfokú), mert az x az alap. A 3x + 2 lineáris: ugyanannyival nő, nem ugyanannyiszorosára.',
      `Képzelje el, hogy x = 0, 1, 2 értéket írunk be a ${jo.sz.replace(/<[^>]+>/g, 'ˣ')} képletbe: az értékek mindig ugyanannyiszorosára változnak (${f(jo.q)}-szeresére).`,
      csokkeno ? `Csökkenő, ha a szorzó 1-nél kisebb: itt q = ${f(jo.q)} < 1.` : `Növekvő, ha a szorzó 1-nél nagyobb: itt q = ${f(jo.q)} > 1.`,
      `Józan ésszel: a ${f(a)}-szoros kiinduló érték után a kitevős függvény gyorsabban változik, mint bármelyik lineáris – ellenpróbaként írjon be x = 0, 1, 2 értéket.`,
    ],
    jegyezze: 'Exponenciális: az x a kitevőben van (a · qˣ). Az x² vagy x³ másod-, harmadfokú; q > 1 növekvő, 0 < q < 1 csökkenő.',
  };
}

// =====================================================================
// Kidolgozott példák ábrái
// =====================================================================
const abraProfit = () => gorbeAbra({ gorbek: [{ fn: (x) => 20 * Math.pow(0.95, x), osztaly: 'v1', cimke: '20 · 0,95^x', cimkeX: 7 }], xmax: 12, yfelirat: 'profit (millió Ft)', leiras: 'A p(x) = 20 · 0,95^x csökkenő exponenciális függvény: a csökkenés egyre lassúbb.' });
const abraAr = () => gorbeAbra({ gorbek: [{ fn: (x) => 100 * Math.pow(1.124, x), osztaly: 'v1', cimke: '100 · 1,124^x', cimkeX: 14 }, { fn: () => 200, osztaly: 'v2' }], xmax: 22, vizsz: [{ y: 200, cimke: 'y = 200' }], pontok: [{ x: idoig(100, 1.124, 200), y: 200, cimke: '(5,9; 200)' }], yfelirat: 'ár (Ft)', leiras: 'A 100 · 1,124^x görbe 5,9 évnél éri el a 200 Ft-ot (kétszereződés).' });

// =====================================================================
// A téma leírása
// =====================================================================
export default {
  id: 'exponencialis',
  cim: 'Exponenciális függvények',
  rovid: 'Éves szorzó, növekedés és csökkenés, kétszereződés, előrejelzés – egy a · qˣ alakú függvénnyel.',
  kulcskeplet: '<span class="keplet-nagy">f(x) = a · q<sup>x</sup></span>',
  kulcsMagyarazat: [
    'a = kiinduló érték (x = 0-nál, mert q⁰ = 1), q = <strong>éves szorzó</strong> (növekedési tényező), x = eltelt évek száma.',
    'Növekedés p %-kal évente: q = 1 + p/100 (12,4 % → 1,124). Csökkenés p %-kal: q = 1 − p/100 (1 % → 0,99; 0,3 % → 0,997).',
  ],
  elmelet: [
    'Már találkoztunk vele: a <strong>kamatos kamat</strong> is exponenciális függvény. Exponenciális = az <strong>x a kitevőben</strong> van, az alap egy konkrét szám (2<sup>x</sup>, 0,6<sup>x</sup>). Az x² vagy x³ <strong>nem</strong> exponenciális (az másod-, harmadfokú).',
    'q &gt; 1: <strong>növekvő</strong>; 0 &lt; q &lt; 1: <strong>csökkenő</strong>; q = 1: konstans (nem fordul elő). Csak pozitív alappal foglalkozunk.',
    'Csökkenésnél a csökkenés <strong>lassul</strong> (egyre kisebb számnak vesszük ugyanannyi %-át): 20 · 0,95<sup>x</sup> → 1; 0,95; 0,90 millió csökkenés.',
    '<strong>„Tegyen fel egy könnyebb kérdést”:</strong> 1 év múlva · q, 2 év múlva · q², x év múlva · q<sup>x</sup>.',
    '<strong>A paraméterek értelmezése („faggassuk a függvényt”):</strong> N(t) = 10,7 · 0,997<sup>t</sup> → 10,7 millió a kiinduló évben, évente <strong>0,3 %-kal</strong> (3 ezrelékkel) csökken.',
    '<strong>Kétszereződés / feleződés:</strong> q<sup>x</sup> = 2 (vagy 0,5) → x = lg 2 : lg q. A kétszereződési idő <strong>nem függ a kiinduló értéktől</strong>: 100-ból 200 ugyanannyi idő, mint 200-ból 400.',
    '<strong>Az éves ütem két adatból:</strong> a · qⁿ = b → <strong>osztás</strong> (nem kivonás!) → qⁿ = b/a → <strong>n-edik gyök</strong> → q → (q − 1) · 100 %.',
    '<strong>Lineáris vagy exponenciális?</strong> „Minden évben ugyanannyi <strong>forinttal</strong>” → lineáris; „minden évben ugyanannyi <strong>százalékkal</strong> / azonos arányban” → exponenciális.',
  ],
  peldak: [
    { cim: 'Profit – csökkenő exponenciális', feladat: 'Egy cég profitja 20 millió Ft, és évente 5 %-kal csökken. Mennyi lesz 1, 2, 3 év múlva? Írja fel a függvényt!',
      abra: abraProfit,
      lepesek: ['q = 1 − 5/100 = 0,95.', '1 év: 20 · 0,95 = <strong>19</strong>; 2 év: 20 · 0,95² = <strong>18,05</strong>; 3 év: 20 · 0,95³ = 17,1475 ≈ <strong>17,15</strong> millió Ft.', 'A függvény: <strong>p(x) = 20 · 0,95<sup>x</sup></strong>, csökkenő (q &lt; 1).', 'A csökkenés lassul: 1; 0,95; 0,90 millió – mert egyre kisebb számnak vesszük az 5 %-át.'] },
    { cim: 'Élelmiszerár – kétszereződés', feladat: 'Az élelmiszerár 1990-ben 100 Ft volt, azóta évente 12,4 %-kal nő. Írja fel a függvényt! Mennyi lesz 2010-ben? Mikor lesz kétszer (400 Ft, 800 Ft) annyi?',
      abra: abraAr,
      lepesek: ['q = 1 + 12,4/100 = 1,124 → <strong>p(x) = 100 · 1,124<sup>x</sup></strong>.', '2010-ben x = 20: 100 · 1,124²⁰ ≈ <strong>1036 Ft</strong>.', 'Kétszereződés: 1,124<sup>x</sup> = 2 → x = lg 2 : lg 1,124 ≈ 5,93 ≈ <strong>6 év</strong>.', 'Négyszeres (400 Ft): x = lg 4 : lg 1,124 ≈ 11,9 év; nyolcszoros (800 Ft): x = lg 8 : lg 1,124 ≈ 17,8 év – a kétszereződési idő nem függ a kiinduló értéktől.'] },
    { cim: 'Népesség – feleződés', feladat: 'Egy ország népessége 25 millió volt 1980-ban, és évente 1 %-kal csökken. Írja fel a függvényt! Mennyi idő alatt feleződik meg?',
      lepesek: ['q = 1 − 1/100 = 0,99 → <strong>P(x) = 25 · 0,99<sup>x</sup></strong>.', 'Feleződés: 0,99<sup>x</sup> = 0,5.', 'x = lg 0,5 : lg 0,99 ≈ 68,97 ≈ <strong>69 év</strong>.'] },
    { cim: 'Magyarország népessége – a függvény értelmezése', feladat: 'Magyarország népességét (millió fő) az N(t) = 10,7 · 0,997<sup>t</sup> függvény írja le, t = 0 az 1980-as év. Értelmezze a függvényt! Melyik évben csökken 7,5 millió alá?',
      lepesek: ['A kiinduló érték 1980-ban <strong>10,7 millió</strong>; q = 0,997 &lt; 1 → csökkenő, évente <strong>0,3 %-kal</strong>.', '10,7 · 0,997<sup>t</sup> = 7,5 → 0,997<sup>t</sup> = 7,5 : 10,7 = 0,7009.', 't = lg 0,7009 : lg 0,997 ≈ 118,3.', 'A 118. év végén még nincs 7,5 alatt, ezért a 119. évben: 1980 + 119 = <strong>2099-ben</strong>.'] },
    { cim: 'Üzemanyagárak – ki éri utol a másikat?', feladat: 'A benzin ára 1993-ban 80 Ft, a gázolajé 75 Ft. Az árak évente 17,8 %-kal, illetve 18,6 %-kal nőnek: B(t) = 80 · 1,178<sup>t</sup>, G(t) = 75 · 1,186<sup>t</sup>. Mikor éri utol a gázolaj a benzint?',
      lepesek: ['A benzin: 80 Ft, +17,8 %/év; a gázolaj: 75 Ft, +18,6 %/év.', '80 · 1,178<sup>t</sup> = 75 · 1,186<sup>t</sup> → (1,186 : 1,178)<sup>t</sup> = 80 : 75.', 't = lg(80/75) : lg(1,186/1,178) ≈ 9,5.', '1993 + 10 = <strong>2003-ban</strong> éri utol.'] },
    { cim: 'Platina – az éves ütem két adatból', feladat: 'A platina világtermelése 1988-ban 3,32, 1993-ban 3,87 millió tonna volt. Hány %-kal nőtt évente? Írja fel a függvényt, és becsülje meg a 2030-as termelést!',
      lepesek: ['q⁵ = 3,87 : 3,32 = 1,166 → osztás, nem kivonás!', 'q = <sup>5</sup>√1,166 ≈ 1,031 → <strong>+3,1 %/év</strong>.', 'f(x) = 3,32 · 1,031<sup>x</sup>.', '2030-ban x = 42: 3,32 · 1,031⁴² ≈ <strong>12,0 millió tonna</strong>.'] },
    { cim: 'Nyereség – csökkenő ütem két adatból', feladat: 'Egy cég nyeresége 2000-ben 80, 2010-ben 75 millió Ft volt. Hány %-kal változott évente? Mennyi lesz 2030-ban?',
      lepesek: ['q¹⁰ = 75 : 80 = 0,9375.', 'q = <sup>10</sup>√0,9375 ≈ 0,9936 → <strong>≈ −0,64 %/év</strong>.', '2030-ban x = 30: 80 · 0,9375³ ≈ <strong>65,9 millió Ft</strong>.'] },
  ],
  tipusok: [
    { id: 'E1', nev: 'Éves szorzó', general: E1 },
    { id: 'E2', nev: 'Függvényérték', general: E2 },
    { id: 'E3', nev: 'Növekvő/csökkenő, értelmezés', general: E3 },
    { id: 'E4', nev: 'Kétszereződés / feleződés', general: E4 },
    { id: 'E5', nev: 'Mikor éri el?', general: E5 },
    { id: 'E6', nev: 'Éves ütem két adatból', general: E6 },
    { id: 'E7', nev: 'Előrejelzés két adatból', general: E7 },
    { id: 'E8', nev: 'Két függvény metszéspontja', general: E8 },
    { id: 'E9', nev: 'Exponenciális-e? (választós)', general: E9, tesztbe: false },
  ],
  /** A SPEC kidolgozott példáinak végeredményei újraszámolva – a tesztek ezt vetik össze a SPEC-kel. */
  peldaEllenorzes() {
    const q6 = evesSzorzo(3.32, 3.87, 5);
    const q7 = evesSzorzo(80, 75, 10);
    const t4 = idoig(10.7, 0.997, 7.5);
    return [
      { nev: '1. példa: 1 év', kapott: kerekit(ertek(20, 0.95, 1), 2), vart: 19 },
      { nev: '1. példa: 2 év', kapott: kerekit(ertek(20, 0.95, 2), 2), vart: 18.05 },
      { nev: '1. példa: 3 év (két tizedes)', kapott: kerekit(ertek(20, 0.95, 3), 2), vart: 17.15 },
      { nev: '2. példa: q', kapott: szorzo(12.4), vart: 1.124 },
      { nev: '2. példa: 2010-ben (egészre)', kapott: kerekit(ertek(100, 1.124, 20), 0), vart: 1036 },
      { nev: '2. példa: kétszereződés (1 tizedes)', kapott: kerekit(idoig(100, 1.124, 200), 1), vart: 5.9 },
      { nev: '2. példa: kétszereződés (egészre)', kapott: kerekit(idoig(100, 1.124, 200), 0), vart: 6 },
      { nev: '2. példa: 400 Ft (1 tizedes)', kapott: kerekit(idoig(100, 1.124, 400), 1), vart: 11.9 },
      { nev: '2. példa: 800 Ft (1 tizedes)', kapott: kerekit(idoig(100, 1.124, 800), 1), vart: 17.8 },
      { nev: '3. példa: q', kapott: szorzo(1, -1), vart: 0.99 },
      { nev: '3. példa: feleződés (egészre)', kapott: kerekit(idoig(25, 0.99, 12.5), 0), vart: 69 },
      { nev: '3. példa: feleződés (2 tizedes)', kapott: kerekit(idoig(25, 0.99, 12.5), 2), vart: 68.97 },
      { nev: '4. példa: 7,5 alá (1 tizedes)', kapott: kerekit(t4, 1), vart: 118.3 },
      { nev: '4. példa: évszám', kapott: 1980 + Math.ceil(t4), vart: 2099 },
      { nev: '4. példa: q (0,3 %)', kapott: szorzo(0.3, -1), vart: 0.997 },
      { nev: '5. példa: utoléri (1 tizedes)', kapott: kerekit(metszes(80, 1.178, 75, 1.186), 1), vart: 9.5 },
      { nev: '5. példa: évszám', kapott: 1993 + Math.ceil(metszes(80, 1.178, 75, 1.186)), vart: 2003 },
      { nev: '6. példa: q⁵', kapott: kerekit(3.87 / 3.32, 3), vart: 1.166 },
      { nev: '6. példa: q', kapott: kerekit(q6, 3), vart: 1.031 },
      { nev: '6. példa: éves ütem (1 tizedes)', kapott: kerekit((q6 - 1) * 100, 1), vart: 3.1 },
      { nev: '6. példa: 2030 (1 tizedes)', kapott: kerekit(ertek(3.32, 1.031, 42), 1), vart: 12.0 },
      { nev: '7. példa: q¹⁰', kapott: 75 / 80, vart: 0.9375 },
      { nev: '7. példa: éves ütem (2 tizedes)', kapott: kerekit((q7 - 1) * 100, 2), vart: -0.64 },
      { nev: '7. példa: 2030 (1 tizedes)', kapott: kerekit(ertek(80, q7, 30), 1), vart: 65.9 },
    ];
  },
};
