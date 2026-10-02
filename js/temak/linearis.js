// 2. téma – Lineáris függvények
import { egesz, valaszt, lepeskoz, kever } from '../lib/rng.js';
import { szep, kerekit } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { koordinataRendszer } from '../lib/abra.js';
import { probal, f, fe, fz, az, linKif, tisztit } from './seged.js';

// ---- Tiszta számolófüggvények ----
export const ertek = (m, b, x) => tisztit(m * x + b);
export const xAdottY = (m, b, y) => tisztit((y - b) / m);
export const zerushely = (m, b) => tisztit(-b / m);
export function ketPontbol(x1, y1, x2, y2) {
  const m = tisztit((y2 - y1) / (x2 - x1));
  return { m, b: tisztit(y1 - ((y2 - y1) / (x2 - x1)) * x1) };
}
const csonkit1 = (x) => tisztit(Math.trunc(tisztit(x * 10)) / 10);
const kisbetus = (sz) => sz.charAt(0).toLowerCase() + sz.slice(1);

// ---- L1 / L2: alapdíj + egységdíj ----
const DIJAK = [
  { fv: 'C', xe: 'kg', ye: '€', xnev: 'A csomag tömege',
    bev: (b, m) => `Egy futárszolgálat a csomagküldésért ${fe(b, '€')} alapdíjat és kilogrammonként ${fe(m, '€')} tömegdíjat számol fel.`,
    kerd: (x) => `Mennyibe kerül egy ${f(x)} kg-os csomag feladása?`,
    vissza: (y) => `Hány kg-os az a csomag, amelynek feladása ${fe(y, '€')}?`,
    b: [1, 6, 0.5], m: [1, 5, 0.25], x: [0.5, 20, 0.25] },
  { fv: 'T', xe: 'km', ye: 'Ft', xnev: 'Az út hossza',
    bev: (b, m) => `Egy taxi alapdíja ${fe(b, 'Ft')}, és kilométerenként ${fe(m, 'Ft')}-ot számol fel.`,
    kerd: (x) => `Mennyit kell fizetni egy ${f(x)} km-es útért?`,
    vissza: (y) => `Hány km-es volt az az út, amelyért ${fe(y, 'Ft')}-ot fizettünk?`,
    b: [400, 1000, 50], m: [250, 450, 10], x: [1, 30, 0.5] },
  { fv: 'M', xe: 'perc', ye: 'Ft', xnev: 'A beszélgetési idő',
    bev: (b, m) => `Egy mobiltarifa havidíja ${fe(b, 'Ft')}, és minden lebeszélt percért ${fe(m, 'Ft')}-ot kell fizetni.`,
    kerd: (x) => `Mennyi a havi számla, ha ${f(x)} percet beszéltünk?`,
    vissza: (y) => `Hány percet beszéltünk, ha a havi számla ${fe(y, 'Ft')}?`,
    b: [1500, 5000, 100], m: [10, 40, 1], x: [10, 300, 1] },
  { fv: 'K', xe: 'óra', ye: 'Ft', xnev: 'A kölcsönzés ideje',
    bev: (b, m) => `Egy kerékpárkölcsönző ${fe(b, 'Ft')} alapdíjat és óránként ${fe(m, 'Ft')}-ot kér.`,
    kerd: (x) => `Mennyibe kerül a kölcsönzés ${f(x)} órára?`,
    vissza: (y) => `Hány órára kölcsönöztük a kerékpárt, ha ${fe(y, 'Ft')}-ot fizettünk?`,
    b: [1000, 3000, 500], m: [400, 900, 50], x: [1, 10, 0.5] },
];

function dijParameterek(rng) {
  return probal(() => {
    const c = valaszt(rng, DIJAK);
    const b = lepeskoz(rng, ...c.b);
    const m = lepeskoz(rng, ...c.m);
    const x = lepeskoz(rng, ...c.x);
    const y = ertek(m, b, x);
    if (!szep(y, 2)) return null;
    return { c, b, m, x, y };
  });
}

function L1(rng) {
  const { c, b, m, x, y } = dijParameterek(rng);
  return {
    szoveg: `${c.bev(b, m)} ${c.kerd(x)}`,
    mezok: [szamMezo({
      cimke: `Fizetendő összeg (${c.ye})`, helyes: y, tizedes: 2, egyseg: c.ye,
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} ${c.ye} lenne a díj, akkor az alapdíjat (${f(b)}) levonva a változó rész ${f(w)} − ${f(b)} = ${f(w - b)} ${c.ye} lenne; x = ${f(x)} esetén viszont ${f(m)} · ${f(x)} = ${f(m * x)} ${c.ye} a változó rész.`,
      hibak: [
        { ertek: tisztit(m * x), uzenet: `Kimaradt az alapdíj: a díj = alapdíj + egységdíj · x = ${f(b)} + ${f(m)} · ${f(x)}.` },
        { ertek: ertek(b, m, x), uzenet: 'Felcserélte a két számot: x szorzója az egységdíj (m), a konstans tag az alapdíj (b).' },
      ],
    })],
    tippek: [
      'Melyik szám az x szorzója, és melyik a konstans tag? Mit jelent ez a díjszabásban?',
      `Írja fel a függvényt: ${c.fv}(x) = egységdíj · x + alapdíj = ${linKif(m, b)}; x helyére ${f(x)} kerül.`,
      `${c.fv}(${f(x)}) = ${f(m)} · ${f(x)} + ${f(b)}.`,
    ],
    megoldas: [
      `A függvény: ${c.fv}(x) = ${linKif(m, b)} (m = ${f(m)} ${c.ye}/${c.xe}, b = ${fe(b, c.ye)} alapdíj).`,
      `${c.fv}(${f(x)}) = ${f(m)} · ${f(x)} + ${f(b)} = ${f(m * x)} + ${f(b)} = <strong>${fe(y, c.ye)}</strong>.`,
    ],
    magyarazat: [
      `A fizetendő összeget keressük ${f(x)} ${c.xe} esetén. A díj két részből áll: egy fix összegből (${fe(b, c.ye)} alapdíj), amit mindenképp ki kell fizetni, és egy változó részből (${fe(m, c.ye)} minden ${c.xe} után).`,
      `Képzelje el, hogy x = 0: akkor is ${f(b)} ${c.ye} a díj, ez az alapdíj. Minden további ${c.xe} után ${f(m)} ${c.ye} jön hozzá: x = 1 esetén ${f(b + m)} ${c.ye}, x = 2 esetén ${f(b + 2 * m)} ${c.ye}.`,
      `${f(x)} ${c.xe} esetén a változó rész ${f(m)} · ${f(x)} = ${f(m * x)} ${c.ye}. Itt szorzunk, mert minden egységért ugyanannyit fizetünk. Ehhez jön az alapdíj: ${f(m * x)} + ${f(b)} = ${f(y)} ${c.ye}. Az alapdíjat nem szorozzuk x-szel, mert csak egyszer kell kifizetni.`,
      `Józan ésszel: a díj nagyobb, mint az alapdíj (${f(y)} > ${f(b)}), és nagyobb, mint a változó rész önmagában (${f(y)} > ${f(m * x)}).`,
    ],
    jegyezze: 'Függvényérték: x helyére beírjuk a számot. Az alapdíj (b) mindig hozzáadódik.',
  };
}

function L2(rng) {
  const { c, b, m, x, y } = dijParameterek(rng);
  return {
    szoveg: `${c.bev(b, m)} ${c.vissza(y)}`,
    mezok: [szamMezo({
      cimke: `${c.xnev} (${c.xe})`, helyes: x, tizedes: 2, egyseg: c.xe,
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} ${c.xe} lenne, a díj ${f(m)} · ${f(w)} + ${f(b)} = ${f(m * w + b)} ${c.ye} lenne, nem ${f(y)} ${c.ye}.`,
      hibak: [
        { ertek: tisztit(y / m), uzenet: 'Előbb az alapdíjat vonja le, és csak utána osszon az egységdíjjal.' },
        { ertek: tisztit((y + b) / m), uzenet: 'Rendezésnél az ellenkező műveletet végezze: a „+ alapdíj” kivonással kerül át a másik oldalra.' },
      ],
    })],
    tippek: [
      `Melyik betű az ismeretlen a ${c.fv}(x) = ${linKif(m, b)} függvényben – az x vagy az y?`,
      `A díj (y) ismert: ${linKif(m, b)} = ${f(y)} → előbb vonja le az alapdíjat, aztán osszon.`,
      `${f(m)}x = ${f(y)} − ${f(b)} = ${f(y - b)}.`,
    ],
    megoldas: [
      `${c.fv}(x) = ${linKif(m, b)} = ${f(y)}.`,
      `Az alapdíj levonása: ${f(m)}x = ${f(y)} − ${f(b)} = ${f(y - b)}.`,
      `Osztás után: x = ${f(y - b)} : ${f(m)} = <strong>${fe(x, c.xe)}</strong>.`,
    ],
    magyarazat: [
      `Most a fizetett összeg ismert (${fe(y, c.ye)}), és azt keressük, ${kisbetus(c.xnev)} mennyi (x).`,
      `Az összeg két részből áll: alapdíj (${f(b)} ${c.ye}) + változó rész (${f(m)} ${c.ye} · x). Az alapdíjat mindenképp ki kellett fizetni, ezért ha ezt levonjuk, megkapjuk, mennyi jutott a változó részre: ${f(y)} − ${f(b)} = ${f(y - b)} ${c.ye}.`,
      `A változó részre jutó ${f(y - b)} ${c.ye}-ból azt kell megtudni, hányszor jön ki az egységdíj (${f(m)} ${c.ye}). Erre való az osztás: ${f(y - b)} : ${f(m)} = ${f(x)} ${c.xe}.`,
      `Visszafelé haladunk: a díj kiszámításánál először szoroztunk, aztán összeadtuk; most fordított sorrendben, az ellenkező műveletekkel először kivonunk, aztán osztunk.`,
      `Józan ésszel: x = ${f(x)} esetén a díj ${f(m)} · ${f(x)} + ${f(b)} = ${f(y)} ${c.ye}, vagyis visszajutunk a megadott összeghez ✓.`,
    ],
    jegyezze: 'Ha y ismert és x a kérdés: y helyére a szám, majd rendezés az ellentétes műveletekkel (először kivonás, aztán osztás).',
  };
}

// ---- L3: csökkenő függvény (értékcsökkenés) ----
const GEPEK = [
  { nev: 'gép', e: '$', szo: 'dollárral' }, { nev: 'számítógép', e: '€', szo: 'euróval' },
  { nev: 'teherautó', e: '$', szo: 'dollárral' }, { nev: 'nyomdagép', e: '€', szo: 'euróval' },
];

function L3(rng) {
  return probal(() => {
    const g = valaszt(rng, GEPEK);
    const d = valaszt(rng, [20, 25, 30, 40, 50, 60, 80, 100, 120, 150]);
    const V0 = 20 * egesz(rng, 10, 150);
    const x0 = tisztit(V0 / d);
    if (x0 < 4 || x0 > 25) return null;
    const n = egesz(rng, 1, Math.floor(x0) - 1);
    const Vn = ertek(-d, V0, n);
    return {
      szoveg: `Egy ${g.nev} beszerzési ára ${fe(V0, g.e)}, az értéke évente ${f(d)} ${g.szo} csökken (lineáris értékcsökkenés).`,
      mezok: [
        szamMezo({ id: 'a', cimke: `Mennyi az értéke ${n} év múlva? (${g.e})`, helyes: Vn, tizedes: 2, egyseg: g.e,
          ellenproba: (w) => `Ellenpróba: ha ${n} év múlva ${f(w)} ${g.e} lenne az érték, akkor ${f(V0)} − ${f(w)} = ${f(V0 - w)} ${g.e} lenne a csökkenés, vagyis évente ${f((V0 - w) / n)} ${g.e}; a feladat szerint évente ${f(d)} ${g.e}.`,
          hibak: [
            { ertek: ertek(d, V0, n), uzenet: 'Előjelhiba: az érték évente csökken, ezért V(x) = beszerzési ár − csökkenés · x (a meredekség negatív).' },
            { ertek: tisztit(d * n), uzenet: `Ez csak az ${n} év alatti értékcsökkenés; az érték: ${f(V0)} − ${f(d)} · ${n}.` },
          ] }),
        szamMezo({ id: 'b', cimke: 'Hány év múlva lesz az értéke 0? (egy tizedesre kerekítve)', helyes: x0, tizedes: 1, egyseg: 'év',
          ellenproba: (w) => `Ellenpróba: ${f(w)} év alatt az érték ${f(V0)} − ${f(d)} · ${f(w)} = ${f(V0 - d * w)} ${g.e}-ra változna, nem 0-ra.`,
          hibak: [
            { ertek: csonkit1(x0), uzenet: 'Kerekítésnél a második tizedesjegyet nézze: ha 5 vagy nagyobb, felfelé kerekítünk.' },
            { ertek: tisztit(d / V0), uzenet: 'Fordítva osztott: −' + f(d) + 'x + ' + f(V0) + ' = 0 → x = ' + f(V0) + ' : ' + f(d) + '.' },
          ] }),
      ],
      tippek: [
        'Melyik szám az x szorzója, és milyen előjellel? Növekszik vagy csökken az érték?',
        `V(x) = beszerzési ár − évi csökkenés · x = ${linKif(-d, V0)}. a) x helyére ${n}; b) V(x) = 0, rendezzen x-re.`,
        `b) ${f(d)}x = ${f(V0)} → x = ${f(V0)} : ${f(d)}.`,
      ],
      megoldas: [
        `A függvény: V(x) = ${linKif(-d, V0)} (m = −${f(d)}: évente ennyivel csökken; b = ${f(V0)}: az új ${g.nev} ára).`,
        `a) V(${n}) = ${f(V0)} − ${f(d)} · ${n} = <strong>${fe(Vn, g.e)}</strong>.`,
        `b) ${linKif(-d, V0)} = 0 → ${f(d)}x = ${f(V0)} → x = ${f(V0)} : ${f(d)} ${szep(x0, 1) ? '=' : '≈'} <strong>${f(x0, 1)} év</strong>.`,
      ],
      magyarazat: [
        `Két kérdés van: mennyi az érték ${n} év múlva, és mikor lesz nulla. Az érték évente ugyanannyit (${f(d)} ${g.e}) veszít, ezért lineáris a függvény.`,
        `Induláskor az érték ${f(V0)} ${g.e} (ez a konstans tag). Minden évben ${f(d)} ${g.e} a csökkenés: 1 év után ${f(V0 - d)}, 2 év után ${f(V0 - 2 * d)}. Ezért a meredekség negatív: m = −${f(d)}.`,
        `a) ${n} év alatt ${n} · ${f(d)} = ${f(d * n)} ${g.e} a csökkenés – szorzunk, mert minden évben ugyanannyi. Ezt kivonjuk a kezdőértékből: ${f(V0)} − ${f(d * n)} = ${f(Vn)} ${g.e}.`,
        `b) A nulla érték azt jelenti, hogy a teljes kezdőértéket (${f(V0)} ${g.e}) elvesztettük. Azt kérdezzük, hány évig tart ez, ha évente ${f(d)} ${g.e} a csökkenés – ezért osztunk: ${f(V0)} : ${f(d)} = ${f(x0, 3)} ≈ ${f(x0, 1)} év.`,
        `Józan ésszel: ${n} év múlva még van értéke (${f(Vn)} > 0), és ${n} kisebb, mint ${f(x0, 1)} ✓. Visszaszámolva: ${f(d)} · ${f(x0, 1)} = ${f(d * x0, 2)}, ami közel van a kezdőértékhez (${f(V0)}).`,
      ],
      jegyezze: 'Csökkenő lineáris függvénynél a meredekség negatív. „Mikor lesz nulla?” → y = 0, és x-re rendezünk.',
    };
  });
}

// ---- L4: meredekség két pontból ----
function L4(rng) {
  return probal(() => {
    let x1, y1, x2, y2, szoveg, szo = '';
    if (rng() < 0.5) {
      const dx = valaszt(rng, [1, 2, 4, 5]);
      const dy = egesz(rng, -12, 12);
      x1 = egesz(rng, -6, 6); y1 = egesz(rng, -8, 8);
      x2 = x1 + dx; y2 = y1 + dy;
      if (rng() < 0.3) { [x1, y1, x2, y2] = [x2, y2, x1, y1]; }
      szoveg = `Mennyi az A(${f(x1)}; ${f(y1)}) és a B(${f(x2)}; ${f(y2)}) pontokon átmenő egyenes meredeksége?`;
    } else {
      const g = valaszt(rng, GEPEK);
      x1 = egesz(rng, 1, 6); x2 = x1 + egesz(rng, 2, 6);
      const m = -10 * egesz(rng, 2, 25);
      y2 = 50 * egesz(rng, 2, 20);
      y1 = y2 - m * (x2 - x1);
      szo = g.szo;
      szoveg = `Egy ${g.nev} értéke ${x1} évesen ${fe(y1, g.e)}, ${x2} évesen ${fe(y2, g.e)}. Az érték lineárisan csökken. Mennyi az értékcsökkenést leíró lineáris függvény meredeksége (m)?`;
    }
    const dx = x2 - x1, dy = y2 - y1;
    if (dy === 0) return null;
    const m = tisztit(dy / dx);
    if (!szep(m, 2) || Math.abs(m) === 1) return null;
    return {
      szoveg,
      mezok: [szamMezo({
        cimke: 'Meredekség (m)', helyes: m, tizedes: 2, negativ: true,
        ellenproba: (w) => `Ellenpróba: ha a meredekség ${f(w)} lenne, akkor ${fz(dx)} egységnyi vízszintes lépésnél a függőleges változás ${f(w)} · ${fz(dx)} = ${f(w * dx)} lenne, de a két pont között ${f(dy)} a függőleges változás (y: ${fz(y1)} → ${fz(y2)}).`,
        hibak: [
          { ertek: tisztit(dx / dy), uzenet: 'Fordítva osztott: a meredekség „függőleges per vízszintes”, m = Δy / Δx.' },
          { ertek: -m, uzenet: m < 0
            ? 'Hiányzik az előjel: ha x nő és y csökken, a meredekség negatív.'
            : 'Előjelhiba: a számlálóban és a nevezőben ugyanabban a sorrendben vonjon ki (y₂ − y₁ és x₂ − x₁).' },
          { ertek: dy, uzenet: `Ne felejtse el elosztani a vízszintes változással: Δx = ${f(dx)}.` },
        ],
      })],
      tippek: [
        'Melyik változás kerül a törtben a számlálóba: a vízszintes vagy a függőleges?',
        'A meredekség: m = Δy / Δx = (y₂ − y₁) / (x₂ − x₁) – „függőleges változás per vízszintes változás”.',
        `Δy = ${f(y2)} − ${fz(y1)} = ${f(dy)}; Δx = ${f(x2)} − ${fz(x1)} = ${f(dx)}; m = ${f(dy)} / ${fz(dx)}.`,
      ],
      megoldas: [
        `Δy = y₂ − y₁ = ${f(y2)} − ${fz(y1)} = ${f(dy)}.`,
        `Δx = x₂ − x₁ = ${f(x2)} − ${fz(x1)} = ${f(dx)}.`,
        `m = Δy / Δx = ${f(dy)} / ${fz(dx)} = <strong>${f(m)}</strong>${szo ? ` (az érték évente ${f(Math.abs(m))} ${szo} csökken)` : ''}.`,
      ],
      magyarazat: [
        'A meredekséget keressük: azt, hogy ha x 1-gyel nő, mennyivel változik y.',
        `Két pontunk van: (${f(x1)}; ${f(y1)}) és (${f(x2)}; ${f(y2)}). Megnézzük, mennyit változott y (függőlegesen): ${f(y2)} − ${fz(y1)} = ${f(dy)}, és mennyit változott x (vízszintesen): ${f(x2)} − ${fz(x1)} = ${f(dx)}.`,
        `Ha ${fz(dx)} vízszintes lépésre ${f(dy)} a függőleges változás, akkor egyetlen lépésre ennek egyenlő része jut: ${f(dy)} : ${fz(dx)} = ${f(m)}. Ezért osztunk: függőleges per vízszintes.`,
        `Az előjel az irányt mutatja: x növekedésével y ${m < 0 ? 'csökken, ezért m negatív' : 'nő, ezért m pozitív'}. A két kivonásnál ugyanabban a sorrendben haladunk (mindkétszer a második pontból vonjuk ki az elsőt).`,
        `Józan ésszel: ${fz(dx)} · ${fz(m)} = ${f(dy)}, vagyis a vízszintes lépéseknek megfelelő függőleges változást kapjuk vissza ✓.`,
      ],
      jegyezze: 'Meredekség két pontból: m = Δy / Δx – a függőleges változás kerül a számlálóba, előjelhelyesen.',
    };
  });
}

// ---- L5: y-tengelymetszet két pontból ----
function L5(rng) {
  return probal(() => {
    let x1, x2, m, b, szoveg, egys = '';
    if (rng() < 0.6) {
      const dx = valaszt(rng, [1, 2, 4, 5]);
      m = tisztit(egesz(rng, -10, 10) / dx);
      b = lepeskoz(rng, -10, 10, 0.5);
      x1 = egesz(rng, -6, 6); x2 = x1 + dx * egesz(rng, 1, 2);
      if (m === 0 || x1 === 0 || x2 === 0) return null;
      szoveg = (y1, y2) => `Egy egyenes átmegy az A(${f(x1)}; ${f(y1)}) és a B(${f(x2)}; ${f(y2)}) pontokon. Mennyi az y-tengelymetszete (b)? (Az egyenes egyenlete y = m·x + b alakú.)`;
    } else {
      m = valaszt(rng, [0.05, 0.1, 0.15, 0.2, 0.25]);
      b = lepeskoz(rng, 3.5, 7, 0.1);
      x1 = egesz(rng, 2, 8); x2 = x1 + egesz(rng, 2, 10);
      egys = 'liter';
      szoveg = (y1, y2) => `Egy autótípus fogyasztása lineárisan nő az autó korával: ${x1} évesen ${f(y1)} liter, ${x2} évesen ${f(y2)} liter 100 km-en. Mennyi a lineáris modell szerint egy új (0 éves) autó fogyasztása, vagyis a b? (liter / 100 km)`;
    }
    const y1 = ertek(m, b, x1), y2 = ertek(m, b, x2);
    if (!szep(y1, 2) || !szep(y2, 2)) return null;
    return {
      szoveg: szoveg(y1, y2),
      mezok: [szamMezo({
        cimke: 'y-tengelymetszet (b)', helyes: b, tizedes: 2, egyseg: egys, negativ: true,
        ellenproba: (w) => `Ellenpróba: ha b = ${f(w)} lenne, akkor az egyenes x = ${fz(x1)} helyen y = ${f(m, 4)} · ${fz(x1)} + ${f(w)} = ${f(m * x1 + w, 4)} lenne, de az első pont y-koordinátája ${f(y1)}.`,
        hibak: [
          { ertek: tisztit(y1 + m * x1), uzenet: 'Rendezésnél az ellenkező műveletet végezze: b = y₁ − m · x₁.' },
          { ertek: tisztit(x1 - m * y1), uzenet: 'A pont első koordinátája az x, a második az y – x helyére az elsőt, y helyére a másodikat írja.' },
          { ertek: m, uzenet: 'Ez a meredekség (m). A b-hez még be kell helyettesíteni egy pontot az y = m·x + b-be.' },
        ],
      })],
      tippek: [
        'Melyik két számot kell előbb kiszámolni, hogy a b-hez eljussunk – és melyiket ismerjük már?',
        'Három lépés: ① m = Δy / Δx ② egy pont koordinátáit beírja az y = m·x + b-be, és kifejezi b-t ③ visszaírás.',
        `① m = (${f(y2)} − ${fz(y1)}) / (${f(x2)} − ${fz(x1)}) = ${f(m, 4)}. ② ${f(y1)} = ${f(m, 4)} · ${fz(x1)} + b → b = ${f(y1)} − ${fz(m * x1, 4)}.`,
      ],
      megoldas: [
        `① m = Δy / Δx = (${f(y2)} − ${fz(y1)}) / (${f(x2)} − ${fz(x1)}) = ${f(y2 - y1)} / ${f(x2 - x1)} = ${f(m, 4)}.`,
        `② Az A pontot beírva: ${f(y1)} = ${f(m, 4)} · ${fz(x1)} + b = ${f(m * x1, 4)} + b.`,
        `b = ${f(y1)} − ${fz(m * x1, 4)} = <strong>${f(b)}</strong>.`,
        `③ Az egyenes: y = ${linKif(m, b)}.`,
      ],
      magyarazat: [
        'Az y-tengelymetszetet (b) keressük: az egyenes y-értékét ott, ahol x = 0.',
        `Először a meredekség kell, mert enélkül nem tudjuk, merre halad az egyenes: m = (${f(y2)} − ${fz(y1)}) : (${f(x2)} − ${fz(x1)}) = ${f(m, 4)}.`,
        `Most az első pontot (${f(x1)}; ${f(y1)}) beírjuk az y = m·x + b képletbe: x helyére az első koordinátát, y helyére a másodikat: ${f(y1)} = ${f(m, 4)} · ${fz(x1)} + b.`,
        `A b-t ki kell fejezni az ellenkező művelettel: kivonjuk mindkét oldalból az m · x = ${f(m * x1, 4)} szorzatot: b = ${f(y1)} − ${fz(m * x1, 4)} = ${f(b)}.`,
        `Józan ésszel: a másik pontot is ellenőrizzük: ${f(m, 4)} · ${fz(x2)} + ${fz(b)} = ${f(y2)} ✓.`,
      ],
      jegyezze: 'Egyenes két pontból: ① m = Δy/Δx ② egy pont beírása, b kifejezése ③ visszaírás.',
    };
  });
}

// ---- L6: x-tengelymetszet (zérushely), kerekítéssel ----
function L6(rng) {
  return probal(() => {
    let m, b, szoveg, cimke, egys = '';
    if (rng() < 0.5) {
      const d = valaszt(rng, [30, 40, 60, 70, 80, 90, 110, 120, 130, 140, 150, 160]);
      b = 10 * egesz(rng, 30, 200);
      m = -d;
      szoveg = `Egy gép értéke x év múlva V(x) = ${linKif(m, b)} dollár. Hány év múlva lesz a gép értéke 0?`;
      cimke = 'Évek száma (egy tizedesre kerekítve)';
      egys = 'év';
    } else {
      m = valaszt(rng, [-12, -11, -9, -7, -6, -3, 3, 6, 7, 9, 11, 12]);
      b = egesz(rng, -40, 40);
      szoveg = `Hol metszi az x-tengelyt az y = ${linKif(m, b)} egyenes? Adja meg a metszéspont x-koordinátáját.`;
      cimke = 'x (egy tizedesre kerekítve)';
    }
    const x0 = zerushely(m, b);
    if (Math.abs(x0) < 1 || Math.abs(x0) > 25) return null;
    if (egys && (x0 < 3 || x0 > 25)) return null;
    // csak olyan szám, ahol a csonkolás és a helyes kerekítés eltér
    if (szep(x0, 1) || Math.abs(x0 - csonkit1(x0)) <= 0.05 + 1e-6) return null;
    return {
      szoveg,
      mezok: [szamMezo({
        cimke, helyes: x0, tizedes: 1, egyseg: egys, negativ: true,
        ellenproba: (w) => `Ellenpróba: ha x = ${f(w)} lenne, akkor y = ${f(m)} · ${fz(w)} + ${fz(b)} = ${f(m * w + b)} lenne, nem 0.`,
        hibak: [
          { ertek: csonkit1(x0), uzenet: 'Kerekítésnél a második tizedesjegyet nézze: ha 5 vagy nagyobb, felfelé kerekítünk.' },
          { ertek: tisztit(b / m), uzenet: `Előjelhiba: ${linKif(m, b)} = 0 → ${f(m)}x = ${f(-b)} → x = ${f(-b)} : ${fz(m)}.` },
          { ertek: tisztit(m / b), uzenet: `Fordítva osztott: x = −b : m = ${f(-b)} : ${fz(m)}.` },
        ],
      })],
      tippek: [
        'Mi igaz az x-tengelyen lévő pontok y-koordinátájára?',
        `Az x-tengelyen y = 0: ${linKif(m, b)} = 0 → rendezzen x-re az ellentétes műveletekkel.`,
        `${f(m)}x = ${f(-b)} → x = ${f(-b)} : ${fz(m)} ≈ ${f(x0, 3)}; most kerekítsen egy tizedesre.`,
      ],
      megoldas: [
        `y = 0: ${linKif(m, b)} = 0.`,
        `${f(m)}x = ${f(-b)} → x = ${f(-b)} : ${fz(m)} = ${f(x0, 4)}…`,
        `Egy tizedesre kerekítve (a második tizedesjegy ${Math.floor(Math.abs(x0) * 100) % 10} ≥ 5, felfelé): <strong>${f(x0, 1)}</strong>.`,
      ],
      magyarazat: [
        `Azt keressük, hol lesz a függvény értéke nulla – az x-tengelyen lévő pontban y = 0.`,
        `Az y helyére 0-t írunk: ${linKif(m, b)} = 0. Most x-re kell rendezni, az ellenkező műveletekkel.`,
        `Először a konstans tagot (${fz(b)}) visszük át a másik oldalra (${b < 0 ? 'hozzáadunk' : 'kivonunk'}): ${f(m)}x = ${f(-b)}.`,
        `Aztán osztunk az x szorzójával: x = ${f(-b)} : ${fz(m)} = ${f(x0, 4)}. Egy tizedesre kerekítve ${f(x0, 1)}: a második tizedesjegyet nézzük, és ha 5 vagy nagyobb, felfelé kerekítünk.`,
        `Józan ésszel: visszahelyettesítve ${f(m)} · ${fz(x0, 3)} + ${fz(b)} ≈ 0 ✓.`,
      ],
      jegyezze: '„Mikor lesz nulla?” → y = 0, x-re rendezünk. Kerekítésnél az utolsó megtartott jegy utáni számjegyet nézzük.',
    };
  });
}

// ---- L7: grafikon leolvasása ----
function L7(rng) {
  return probal(() => {
    const b = egesz(rng, -4, 4);
    const run = valaszt(rng, [1, 2, 3, 3]);
    const rise = egesz(rng, -4, 4);
    if (rise === 0) return null;
    const y2 = b + rise;
    if (y2 < -6 || y2 > 6 || run > 6) return null;
    const m = tisztit(rise / run);
    if (Math.abs(m) === 1 && run === 1 && rng() < 0.5) return null;
    const pontok = [{ x: 0, y: b }, { x: run, y: y2 }];
    const abra = koordinataRendszer({
      xmin: -6, xmax: 6, ymin: -6, ymax: 6, egyenesek: [{ m, b }], pontok,
      leiras: 'Egy egyenes grafikonja négyzetrácson, két kiemelt rácsponttal.',
      szel: 440, mag: 440,
    });
    const irany = rise > 0 ? 'fel' : 'le';
    return {
      szoveg: 'Olvassa le a grafikonról az egyenes meredekségét (m) és y-tengelymetszetét (b)! A meredekség törtként is beírható, pl. -1/3.',
      abra,
      mezok: [
        szamMezo({ id: 'm', cimke: 'Meredekség (m) – törtként vagy két tizedesre kerekítve', helyes: m, tizedes: 2, negativ: true,
          ellenproba: (w) => `Ellenpróba: ha a meredekség ${f(w, 3)} lenne, akkor a (0; ${f(b)}) pontból ${run} egységet jobbra lépve ${f(w * run, 3)} egységet kellene ${w * run >= 0 ? 'felfelé' : 'lefelé'} lépni, de a grafikonon ${Math.abs(rise)} egység ${irany}.`,
          hibak: [
            ...(run !== 1 ? [{ ertek: rise, uzenet: `Csak a függőleges lépést írta be. m = függőleges lépés / vízszintes lépés = ${rise} / ${run}.` }] : []),
            { ertek: tisztit(run / rise), uzenet: 'Fordítva osztott: függőleges lépés per vízszintes lépés.' },
            { ertek: -m, uzenet: m < 0 ? 'Előjel: ha balról jobbra haladva az egyenes lefelé megy, m negatív.' : 'Előjel: ha balról jobbra haladva az egyenes felfelé megy, m pozitív.' },
          ] }),
        szamMezo({ id: 'b', cimke: 'y-tengelymetszet (b)', helyes: b, tizedes: 2, negativ: true,
          ellenproba: (w) => `Ellenpróba: ha b = ${f(w)} lenne, az egyenes a (0; ${f(w)}) pontban metszené az y-tengelyt, de a grafikonon a (0; ${f(b)}) pont látszik.`,
          hibak: [{ ertek: zerushely(m, b), uzenet: 'Ez az x-tengellyel való metszéspont. A b ott van, ahol az egyenes az y-tengelyt metszi (x = 0).' }] }),
      ],
      tippek: [
        'Hol metszi az egyenes az y-tengelyt – és mekkora lépés vezet innen a következő rácspontig, amelyen az egyenes átmegy?',
        'Az y-tengelyen való metszéspont a b. Az y-tengelyen lévő pontból lépjen jobbra a következő olyan pontig, ahol az egyenes pontosan rácsponton megy át.',
        `Jobbra ${run} egységet lépve ${Math.abs(rise)} egységet megy ${irany} → m = ${rise > 0 ? '' : '−'}${Math.abs(rise)}/${run}.`,
      ],
      megoldas: [
        `Az egyenes az y-tengelyt a (0; ${f(b)}) pontban metszi → <strong>b = ${f(b)}</strong>.`,
        `Innen jobbra ${run} egységet lépve ${Math.abs(rise)} egységet megyünk ${irany} → m = ${rise}/${run}${run !== 1 ? ` ≈ ${f(m)}` : ''} → <strong>m = ${f(m)}</strong>.`,
        `Az egyenes egyenlete: y = ${run === 1 ? linKif(m, b) : `${rise < 0 ? '−' : ''}${Math.abs(rise)}/${run}·x${b === 0 ? '' : (b < 0 ? ' − ' : ' + ') + f(Math.abs(b))}`}.`,
      ],
      magyarazat: [
        'Két számot kell leolvasni: b-t (hol metszi az egyenes az y-tengelyt) és m-et (mennyire meredek).',
        `b: az y-tengelyen (ahol x = 0) az egyenes a (0; ${f(b)}) pontban halad át, tehát b = ${f(b)}.`,
        `m: az y-tengelyen lévő pontból jobbra lépünk ${run} egységet (vízszintes változás), és megnézzük, mennyit megyünk ${irany}: ${Math.abs(rise)} egységet (függőleges változás).`,
        `A meredekség a függőleges per vízszintes: ${rise} / ${run}${run !== 1 ? ` ≈ ${f(m)}` : ''}. Ha az egyenes balról jobbra lefelé megy, a meredekség negatív.`,
        `Józan ésszel: az egyenes ${m > 0 ? 'emelkedik' : 'lejt'}, ezért m ${m > 0 ? 'pozitív' : 'negatív'} ✓; ha 1 egységet lépünk jobbra, y ${f(Math.abs(m))} egységgel ${m > 0 ? 'nő' : 'csökken'}.`,
      ],
      jegyezze: 'Grafikonról: b az y-tengelyen olvasható le; m = függőleges lépés / vízszintes lépés (lefelé haladva negatív).',
    };
  });
}

// ---- L8: jelentés, monotonitás (feleletválasztós) ----
function jelentesKontextus(rng) {
  const k = egesz(rng, 0, 2);
  if (k === 0) {
    const m = valaszt(rng, [0.1, 0.15, 0.2, 0.25]);
    const b = lepeskoz(rng, 4, 6.5, 0.1);
    return {
      m, b, fv: `F(x) = ${linKif(m, b)}`,
      leiras: 'Egy autótípus fogyasztását (liter / 100 km) az autó korának (x, években) függvényében',
      mJo: `Ha az autó 1 évvel idősebb, a fogyasztása ${f(m)} literrel nő (100 km-en).`,
      bJo: `Az új (0 éves) autó fogyasztása ${f(b)} liter 100 km-en.`,
      mMint_b: `Az új autó fogyasztása ${f(m)} liter 100 km-en.`,
      bMint_m: `Ha az autó 1 évvel idősebb, a fogyasztása ${f(b)} literrel nő.`,
      ford: (v) => `Ha a fogyasztás 1 literrel nő, az autó ${f(v)} évvel idősebb.`,
    };
  }
  if (k === 1) {
    const m = 10 * egesz(rng, 25, 39);
    const b = 50 * egesz(rng, 8, 20); // 400–1000: mindig nagyobb, mint m, így a kérdés egyértelmű
    return {
      m, b, fv: `T(x) = ${linKif(m, b)}`,
      leiras: 'Egy taxi viteldíját (Ft) a megtett út (x, km) függvényében',
      mJo: `Minden további kilométer ${f(m)} Ft-tal növeli a viteldíjat.`,
      bJo: `Az alapdíj ${f(b)} Ft (ezt 0 km-nél is ki kell fizetni).`,
      mMint_b: `Az alapdíj ${f(m)} Ft.`,
      bMint_m: `Minden további kilométer ${f(b)} Ft-tal növeli a viteldíjat.`,
      ford: (v) => `Minden további forintért ${f(v)} km-t lehet utazni.`,
    };
  }
  const d = 10 * egesz(rng, 3, 15);
  const b = 20 * egesz(rng, 20, 100);
  return {
    m: -d, b, fv: `V(x) = ${linKif(-d, b)}`,
    leiras: 'Egy gép értékét (dollár) az eltelt évek (x) függvényében',
    mJo: `A gép értéke évente ${f(d)} dollárral csökken.`,
    bJo: `A gép beszerzési (új) ára ${f(b)} dollár.`,
    mMint_b: `A gép beszerzési ára ${f(d)} dollár.`,
    bMint_m: `A gép értéke évente ${f(b)} dollárral csökken.`,
    ford: (v) => `${f(Math.abs(v))} év alatt csökken 1 dollárral az érték.`,
  };
}

function L8(rng) {
  const fajta = valaszt(rng, ['m', 'b', 'mono']);
  if (fajta === 'mono') {
    const m = valaszt(rng, [-3, -2, -0.5, 0.5, 2, 3, 0]);
    let b = egesz(rng, -8, 8);
    if (m !== 0 && rng() < 0.6) b = (m > 0 ? -1 : 1) * egesz(rng, 1, 8); // csapda: b előjele ellentétes
    if (m === 0 && b === 0) b = 4;
    const helyes = m > 0 ? 0 : m < 0 ? 1 : 2;
    const tipp = 'Az x szorzóját (m) nézze: m > 0 → nő, m < 0 → csökken, m = 0 → konstans. A konstans tag (b) előjele nem számít.';
    const nevek = ['szigorúan monoton nő', 'szigorúan monoton csökken', 'konstans'];
    return {
      szoveg: `Milyen az f(x) = ${linKif(m, b)} függvény?`,
      mezok: [valasztoMezo({
        cimke: 'Válasszon!',
        opciok: nevek.map((sz, i) => ({
          szoveg: sz, helyes: i === helyes, uzenet: i === helyes ? '' : tipp,
          ellenproba: i === helyes ? '' : `Ellenpróba: f(0) = ${f(b)}, f(1) = ${f(m + b)}, f(2) = ${f(2 * m + b)} – az értékek ${m > 0 ? 'nőnek' : m < 0 ? 'csökkennek' : 'nem változnak'}, ezért a függvény ${nevek[helyes]}, nem „${sz}”.`,
        })),
      })],
      tippek: ['Melyik szám dönti el, hogy az egyenes emelkedik vagy lejt – az x szorzója vagy a konstans tag?', tipp],
      megoldas: [
        `A meredekség m = ${f(m)}${m === 0 ? ' (nincs x-es tag)' : ''}.`,
        `${m > 0 ? 'm > 0' : m < 0 ? 'm < 0' : 'm = 0'} → a függvény <strong>${nevek[helyes]}</strong>${m === 0 ? ' (vízszintes egyenes)' : ''}.`,
      ],
      magyarazat: [
        'Azt kérdezik, hogy a függvény értéke nő, csökken vagy nem változik, ha x nő.',
        `Ezt egyetlen szám dönti el: az x szorzója, a meredekség (m = ${f(m)}). A konstans tag (${f(b)}) csak azt mondja meg, hol metszi az egyenes az y-tengelyt – a meredekségre nincs hatása.`,
        `Próbáljunk ki három értéket: f(0) = ${f(b)}, f(1) = ${f(m + b)}, f(2) = ${f(2 * m + b)}. Az értékek ${m > 0 ? 'nőnek' : m < 0 ? 'csökkennek' : 'nem változnak'}.`,
        `Józan ésszel: ${m > 0 ? 'pozitív m esetén az egyenes balról jobbra emelkedik' : m < 0 ? 'negatív m esetén az egyenes balról jobbra lejt' : 'ha nincs x-es tag, az egyenes vízszintes'}, vagyis a függvény ${nevek[helyes]}.`,
      ],
      jegyezze: 'm > 0: nő, m < 0: csökken, m = 0: konstans (vízszintes egyenes).',
    };
  }
  const k = jelentesKontextus(rng);
  const kerdezett = fajta === 'm' ? k.m : k.b;
  const nev = k.fv.split('(')[0];
  const ellenMB = `Ellenpróba: ${nev}(0) = ${f(k.b)} (ez a konstans tag), ${nev}(1) = ${f(k.m + k.b)} (1-gyel nagyobb x-nél) – a változás ${f(k.m)}, ez az x szorzója.`;
  const opciok = fajta === 'm'
    ? [
      { szoveg: k.mJo, helyes: true },
      { szoveg: k.mMint_b, helyes: false, uzenet: 'Ez a konstans tag (b) jelentése lenne: az x = 0-hoz tartozó érték. Az x szorzója (m) a változás mértéke.', ellenproba: ellenMB },
      { szoveg: k.ford(Math.abs(k.m)), helyes: false, uzenet: 'Fordítva: a meredekség azt mutatja, mennyivel változik y, ha x 1-gyel nő.', ellenproba: ellenMB },
    ]
    : [
      { szoveg: k.bJo, helyes: true },
      { szoveg: k.bMint_m, helyes: false, uzenet: 'Ez a meredekség (m) jelentése lenne. A konstans tag (b) az x = 0-hoz tartozó érték.', ellenproba: ellenMB },
      { szoveg: k.ford(k.b), helyes: false, uzenet: 'A konstans tag (b) az x = 0-hoz tartozó érték – a feladat nyelvén a „kiinduló” érték.', ellenproba: ellenMB },
    ];
  return {
    szoveg: `${k.leiras} a ${k.fv} függvény írja le. Mit jelent a függvényben ${az(fajta === 'm' ? Math.abs(kerdezett) : kerdezett)}${fajta === 'm' && k.m < 0 ? ' (a −' + f(Math.abs(k.m)) + ' meredekség)' : ''}?`,
    mezok: [valasztoMezo({ cimke: 'Válasszon!', opciok: kever(rng, opciok) })],
    tippek: [
      'Melyik betű a kérdezett szám – az x szorzója (m) vagy a konstans tag (b)?',
      'm (az x szorzója): ha x 1-gyel nő, y ennyivel változik. b (konstans tag): az x = 0-hoz tartozó érték. ' +
        (fajta === 'm' ? 'A kérdezett szám az x szorzója → ez a meredekség.' : 'A kérdezett szám a konstans tag → ez az x = 0-hoz tartozó érték.'),
    ],
    megoldas: [
      `A ${k.fv} függvényben m = ${f(k.m)}, b = ${f(k.b)}.`,
      `A helyes értelmezés: <strong>${fajta === 'm' ? k.mJo : k.bJo}</strong>`,
    ],
    magyarazat: [
      `A függvény: ${k.fv}. Két szám van benne: az x szorzója (m = ${f(k.m)}) és a konstans tag (b = ${f(k.b)}).`,
      'Az x szorzója azt mutatja, mennyivel változik az érték, ha x 1-gyel nő. A konstans tag az x = 0-hoz tartozó érték, vagyis a kiinduló érték.',
      `Kipróbálva: ${nev}(0) = ${f(k.b)}, ${nev}(1) = ${f(k.m + k.b)}; a változás ${f(k.m)}.`,
      `A kérdezett szám (${f(kerdezett)}) ${fajta === 'm' ? 'az x szorzója, ezért a változás mértékét jelenti' : 'a konstans tag, ezért a kiinduló értéket jelenti'}: ${fajta === 'm' ? k.mJo : k.bJo}`,
      'Józan ésszel: a változás mértékegysége a kimenet egysége per a bemenet egysége, a konstans tag mértékegysége a kimenet egysége – a helyes állítás ezt tükrözi.',
    ],
    jegyezze: '„Értelmezze a paramétereket”: m és b jelentését a feladat nyelvén, szavakban kell elmondani.',
  };
}

// ---- Kidolgozott példák ábrája ----
function peldaAbra5() {
  return koordinataRendszer({
    xmin: -4, xmax: 6, ymin: -4, ymax: 6,
    egyenesek: [{ m: 2, b: -1, cimke: 'y = 2x − 1' }, { m: -1 / 3, b: 2, cimke: 'y = −⅓x + 2' }],
    pontok: [{ x: 0, y: -1 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 3, y: 1 }],
    leiras: 'Két egyenes: y = 2x − 1 és y = −⅓x + 2, a leolvasáshoz használt rácspontokkal.',
    szel: 440, mag: 440,
  });
}

export default {
  id: 'linearis',
  cim: 'Lineáris függvények',
  rovid: 'Meredekség, tengelymetszet, egyenes két pontból, grafikon leolvasása és a paraméterek jelentése.',
  kulcskeplet: '<span class="keplet-nagy">y = m · x + b</span>',
  kulcsMagyarazat: [
    'm = meredekség (az x szorzója), b = y-tengelymetszet (a konstans tag).',
    'Meredekség két pontból: m = Δy / Δx = (y<sub>2</sub> − y<sub>1</sub>) / (x<sub>2</sub> − x<sub>1</sub>) – „függőleges változás per vízszintes változás”, előjelhelyesen.',
  ],
  elmelet: [
    'Lineáris függvény: „valahányszor x, plusz vagy mínusz egy szám”; a grafikonja egyenes.',
    'm > 0: szigorúan monoton nő; m < 0: csökken; m = 0: konstans (vízszintes egyenes, pl. y = 4).',
    'A meredekség jelentése: ha x 1-gyel nő, y ennyivel változik.',
    'Az x-tengelyen lévő pontban y = 0; az y-tengelyen lévő pontban x = 0. „Mikor lesz nulla?” → y = 0, és x-re rendezünk.',
    '<strong>Egyenes két pontból, 3 lépés:</strong> ① m = Δy/Δx ② egy pont koordinátáit az y = mx + b-be (x helyére az első, y helyére a második koordináta), b kifejezése ③ visszaírás.',
    'Ha y ismert és x a kérdés: y helyére a szám, rendezés az ellentétes műveletekkel.',
    'Független változó (amitől függ) → x, vízszintes tengely; függő változó → y.',
    '„Értelmezze a paramétereket”: m és b jelentését szavakban, a feladat nyelvén kell elmondani.',
  ],
  peldak: [
    { cim: 'Csomagküldés', feladat: 'A csomagküldés alapdíja 2 €, a tömegdíj 3 €/kg. Írja fel a díjat a tömeg függvényében! Mennyibe kerül 1, 2, 3 kg? Hány kg-os a csomag, ha a díj 17,75 €?',
      lepesek: ['C(x) = 3x + 2 (m = 3 €/kg, b = 2 € alapdíj).', 'C(1) = 5 €, C(2) = 8 €, C(3) = 11 €.', '3x + 2 = 17,75 → 3x = 15,75 → <strong>x = 5,25 kg</strong>.', 'Értelmezés: b = az alapdíj; m: 1 kg-mal nehezebb csomag 3 €-val drágább.'] },
    { cim: 'Gép értékcsökkenése', feladat: 'Egy gép 520 $-ba került, értéke évente 40 $-ral csökken. Mennyit ér 3 év múlva? Mikor lesz az értéke 0?',
      lepesek: ['V(x) = 520 − 40x.', 'V(3) = 520 − 120 = 400 $.', '520 − 40x = 0 → 40x = 520 → <strong>x = 13 év</strong>.', 'Két pontból ellenőrizve: (0; 520) és (3; 400) → m = −120/3 = −40.'] },
    { cim: 'Gép – egyenes két pontból', feladat: 'Egy gép 3 évesen 800 $-t, 8 évesen 200 $-t ér (lineáris csökkenés). Írja fel a függvényt! Mikor lesz az értéke 0?',
      lepesek: ['① m = (200 − 800) / (8 − 3) = −600 / 5 = −120.', '② 800 = −120 · 3 + b → b = 800 + 360 = 1160.', '③ V(x) = −120x + 1160.', 'V(x) = 0 → 120x = 1160 → x = 9,67… ≈ <strong>9,7 év</strong>.'] },
    { cim: 'Autó fogyasztása', feladat: 'Egy autó 4 évesen 4,8 l, 12 évesen 6 l / 100 km-t fogyaszt (0–24 év között lineáris). Írja fel és értelmezze a függvényt! Hány évesen fogyaszt 7,5 litert?',
      lepesek: ['① m = (6 − 4,8) / (12 − 4) = 1,2 / 8 = 0,15.', '② 4,8 = 0,15 · 4 + b → b = 4,2.', '③ F(x) = 0,15x + 4,2.', 'm: évente 0,15 literrel nő a fogyasztás; b: az új autó fogyasztása 4,2 l.', '0,15x + 4,2 = 7,5 → 0,15x = 3,3 → <strong>x = 22 év</strong>.'] },
    { cim: 'Egyenes grafikonról', feladat: 'Olvassa le a két egyenes egyenletét!', abra: peldaAbra5,
      lepesek: ['Kék egyenes: az y-tengelyt a (0; −1) pontban metszi → b = −1.', 'Innen 1-et jobbra, 2-t fel → m = 2/1 = 2 → <strong>y = 2x − 1</strong>.', 'Narancs egyenes: (0; 2) → b = 2; innen 3-at jobbra, 1-et le → m = −1/3.', '<strong>y = −⅓x + 2</strong> (nem −1: a függőleges lépést el kell osztani a vízszintessel!).'] },
  ],
  tipusok: [
    { id: 'L1', nev: 'Alapdíj + egységdíj: függvényérték', general: L1 },
    { id: 'L2', nev: 'Alapdíj + egységdíj: x visszakeresése', general: L2 },
    { id: 'L3', nev: 'Csökkenő függvény (értékcsökkenés)', general: L3 },
    { id: 'L4', nev: 'Meredekség két pontból', general: L4 },
    { id: 'L5', nev: 'y-tengelymetszet két pontból', general: L5 },
    { id: 'L6', nev: 'x-tengelymetszet (mikor lesz 0?)', general: L6 },
    { id: 'L7', nev: 'Grafikon leolvasása', general: L7 },
    { id: 'L8', nev: 'A paraméterek jelentése', general: L8, tesztbe: false },
  ],
  peldaEllenorzes() {
    const g3 = ketPontbol(3, 800, 8, 200);
    const a4 = ketPontbol(4, 4.8, 12, 6);
    const e1 = ketPontbol(0, -1, 1, 1);
    const e2 = ketPontbol(0, 2, 3, 1);
    return [
      { nev: 'Csomag 1 kg', kapott: ertek(3, 2, 1), vart: 5 },
      { nev: 'Csomag 2 kg', kapott: ertek(3, 2, 2), vart: 8 },
      { nev: 'Csomag 3 kg', kapott: ertek(3, 2, 3), vart: 11 },
      { nev: 'Csomag 17,75 € → kg', kapott: xAdottY(3, 2, 17.75), vart: 5.25 },
      { nev: 'Gép 3 év', kapott: ertek(-40, 520, 3), vart: 400 },
      { nev: 'Gép 0 → év', kapott: zerushely(-40, 520), vart: 13 },
      { nev: 'Gép két pontból: m', kapott: g3.m, vart: -120 },
      { nev: 'Gép két pontból: b', kapott: g3.b, vart: 1160 },
      { nev: 'Gép két pontból: 0 → év (1 tizedes)', kapott: kerekit(zerushely(g3.m, g3.b), 1), vart: 9.7 },
      { nev: 'Autó: m', kapott: a4.m, vart: 0.15 },
      { nev: 'Autó: b', kapott: a4.b, vart: 4.2 },
      { nev: 'Autó: 7,5 l → év', kapott: xAdottY(a4.m, a4.b, 7.5), vart: 22 },
      { nev: 'Grafikon 1: m', kapott: e1.m, vart: 2 },
      { nev: 'Grafikon 1: b', kapott: e1.b, vart: -1 },
      { nev: 'Grafikon 2: m', kapott: e2.m, vart: tisztit(-1 / 3) },
      { nev: 'Grafikon 2: b', kapott: e2.b, vart: 2 },
    ];
  },
};
