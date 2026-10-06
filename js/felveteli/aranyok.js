// F6 – Százalék, arány, mozgás
import { egesz, valaszt } from '../lib/rng.js';
import { szep } from '../lib/szam.js';
import { probal, f, tisztit } from '../temak/seged.js';
import { egyMezos } from './seged.js';

// ---- Tiszta számolók ----
export const szazalekErtek = (alap, p) => tisztit((alap * p) / 100);
export const szazalekAlap = (resz, p) => tisztit((resz * 100) / p);
export const szazalekLab = (resz, alap) => tisztit((resz * 100) / alap);
/** Fehér golyók eredeti száma: piros = fehér/(m−1); k fehér hozzáadása után a fehér p %. */
export function feherGolyo(m, k, p) {
  const q = p / 100;
  return tisztit((k * (q - 1)) / (1 - (q * m) / (m - 1)));
}
/** Váltakozó futás–séta: út D (m), futás t1 perc v1 km/h, séta t2 perc v2 km/h → idő percben (szimuláció percenként). */
export function valtakozoIdo(D, t1, v1, t2, v2) {
  const m1 = (v1 * 1000) / 60, m2 = (v2 * 1000) / 60;
  let ut = 0, perc = 0;
  for (;;) {
    for (let i = 0; i < t1; i++) { if (ut + m1 >= D - 1e-9) return tisztit(perc + (D - ut) / m1); ut += m1; perc++; }
    for (let i = 0; i < t2; i++) { ut += m2; perc++; }
  }
}
export const talalkozas = (D, v1, v2) => tisztit((D / (v1 + v2)) * 60);
export const utolerPerc = (v1, t0, v2) => tisztit(((v1 * t0) / 60 / (v2 - v1)) * 60);
export const meretaranyKm = (cm, M) => tisztit((cm * M) / 100000);
export const meretaranyCm = (km, M) => tisztit((km * 100000) / M);

// ---- A1: százalék ----
function A1(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    const p = valaszt(rng, [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75, 80]);
    const alap = 20 * egesz(rng, 2, 40);
    const resz = (alap * p) / 100;
    if (!szep(resz, 0)) return null;
    if (valt === 0) {
      return egyMezos({
        szoveg: `Egy évfolyamra ${f(alap)} tanuló jár. A tanulók ${p} %-a szakkörre jár. Hány tanuló jár szakkörre?`,
        cimke: 'A szakkörösök száma', helyes: resz, tizedes: 0,
        hibak: [{ ertek: alap - resz, uzenet: 'Ez a szakkörre nem járók száma. A kérdés a szakkörre járóké.' }, { ertek: p, uzenet: 'A százalékláb (a szám a százalékjel előtt) nem a darabszám: ki kell számolnod az alap ennyi századát.' }],
        ellenproba: (w) => `Ellenpróba: ${f(w)} tanuló az ${f(alap)} tanuló ${f((w / alap) * 100, 2)} %-a, de ${p} % kellene.`,
        tippek: [`Mennyi a 100 %, és hány tanuló az 1 %?`, `1 % = ${f(alap)} : 100 = ${f(alap / 100)} tanuló.`, `${p} % = ${p} · ${f(alap / 100)}.`],
        megoldas: [`1 % = ${f(alap)} : 100 = ${f(alap / 100)}.`, `${p} % = ${p} · ${f(alap / 100)} = <strong>${f(resz)}</strong> tanuló.`],
        magyarazat: [
          `A 100 % az egész évfolyam, ${f(alap)} tanuló. A százalék azt mondja meg, hogy minden 100 tanulóból hányat érint.`,
          `Az 1 % az egész századrésze: ${f(alap)} : 100 = ${f(alap / 100)}. A ${p} % ennek ${p}-szerese: ${f(resz)} tanuló.`,
          `Józan ésszel: ${p < 50 ? 'kevesebb, mint a fele' : 'több, mint a fele'} az évfolyamnak, és ${f(resz)} ${p < 50 ? '<' : '>'} ${f(alap / 2)}. Visszaszámolva: ${f(resz)} : ${f(alap)} = ${f(p / 100, 2)}.`,
        ],
        jegyezze: 'A p %-a: oszd el a 100 %-ot százzal (1 %), és szorozd p-vel. Vagy: alap · p/100.',
      });
    }
    if (valt === 1) {
      return egyMezos({
        szoveg: `Egy ${f(alap)} fős évfolyamon ${f(resz)} tanuló jár szakkörre. A tanulók hány százaléka jár szakkörre?`,
        cimke: 'A százalék', egyseg: '%', helyes: p, tizedes: 1,
        hibak: [{ ertek: resz / alap, uzenet: 'Ez a hányados (tizedes tört alakban). A százalékhoz még szorozni kell 100-zal.' }, { ertek: tisztit(100 - p), uzenet: 'Ez a szakkörre nem járók aránya. A kérdés a szakkörre járóké.' }],
        ellenproba: (w) => `Ellenpróba: az ${f(alap)} tanuló ${f(w, 1)} %-a ${f((alap * w) / 100, 2)}, de ${f(resz)} tanuló jár szakkörre.`,
        tippek: [`Mit viszonyítasz mihez: a szakkörösök számát az egész évfolyamhoz?`, `Számold ki a hányadost: ${f(resz)} : ${f(alap)} = ${f(resz / alap, 3)}.`, `A tizedes tört százalék alakja: szorozd 100-zal.`],
        megoldas: [`${f(resz)} : ${f(alap)} = ${f(resz / alap, 3)}.`, `${f(resz / alap, 3)} · 100 = <strong>${f(p)}</strong> %.`],
        magyarazat: [
          `A kérdés az, hogy a rész az egésznek hányad része. A rész ${f(resz)} tanuló, az egész (100 %) ${f(alap)} tanuló.`,
          `A hányados ${f(resz)} : ${f(alap)} = ${f(resz / alap, 3)}. Ezt 100-zal szorozva kapjuk a százalékot: ${f(p)} %.`,
          `Józan ésszel: a ${f(resz)} ${resz < alap / 2 ? 'kevesebb, mint az egész fele' : 'több, mint az egész fele'} (${f(alap / 2)}), és a ${f(p)} % ${p < 50 ? 'kisebb, mint 50 %' : 'nagyobb, mint 50 %'}.`,
        ],
        jegyezze: 'Hány százalék? rész : egész · 100.',
      });
    }
    return egyMezos({
      szoveg: `Egy iskolában a tanulók ${p} %-a, vagyis ${f(resz)} tanuló jár szakkörre. Hány tanuló jár az iskolába?`,
      cimke: 'A tanulók száma', helyes: alap, tizedes: 0,
      hibak: [{ ertek: tisztit((resz * p) / 100), uzenet: 'Itt az egészet keresed, ezért nem szorozni kell a százalékkal, hanem a részt kell osztani a százalékkal (és szorozni 100-zal).' }, { ertek: tisztit(resz + (resz * p) / 100), uzenet: 'A szakkörösök a tanulók egy része; az egész kiszámításához a ' + p + ' %-ból kell 100 %-ra következtetni.' }],
      ellenproba: (w) => `Ellenpróba: ${f(w)} tanuló ${p} %-a ${f((w * p) / 100, 2)}, de ${f(resz)} tanuló jár szakkörre.`,
      tippek: [`Hány tanuló az 1 %, ha a ${p} % ${f(resz)} tanuló?`, `1 % = ${f(resz)} : ${p} = ${f(resz / p, 3)}.`, `A 100 % ennek a százszorosa.`],
      megoldas: [`${p} % = ${f(resz)} tanuló, így 1 % = ${f(resz)} : ${p} = ${f(resz / p, 3)}.`, `100 % = 100 · ${f(resz / p, 3)} = <strong>${f(alap)}</strong> tanuló.`],
      magyarazat: [
        `Az egészet (100 %) keressük. Tudjuk, hogy a ${p} % ${f(resz)} tanulót jelent.`,
        `Az 1 % értéke ${f(resz)} : ${p} = ${f(resz / p, 3)}. A 100 % az 1 % százszorosa, vagyis ${f(alap)}.`,
        `Józan ésszel: az egész nagyobb, mint a rész (${f(alap)} > ${f(resz)}), és a ${p} %-a valóban ${f(resz)}.`,
      ],
      jegyezze: 'Az egészet keresve: előbb az 1 % értékét számold ki (rész : százalékláb), aztán szorozd 100-zal.',
    });
  });
}

// ---- A2: doboz golyók ----
function A2(rng) {
  const NEV = { 3: 'harmadrésze', 4: 'negyedrésze', 5: 'ötödrésze' };
  return probal(() => {
    const m = egesz(rng, 3, 5);
    const W = (m - 1) * egesz(rng, 4, 20), k = egesz(rng, 4, 20);
    const p = (100 * (W + k)) / ((m * W) / (m - 1) + k);
    if (!szep(p, 0) || p >= 100) return null;
    const piros = W / (m - 1);
    const ossz = W + piros;
    return egyMezos({
      szoveg: `Egy dobozban csak fehér golyók vannak. Beletettünk annyi piros golyót, hogy a dobozban lévő golyók ${NEV[m]} piros lett. Ezután még ${k} fehér golyót tettünk a dobozba, így a golyók ${f(p)} %-a fehér lett. Hány fehér golyó volt eredetileg a dobozban?`,
      cimke: 'Az eredeti fehér golyók', helyes: W, tizedes: 0,
      hibak: [{ ertek: piros, uzenet: 'Ez a betett piros golyók száma. A kérdés az eredeti fehér golyók száma.' }, { ertek: ossz, uzenet: 'Ez a golyók száma a piros golyók betétele után. Az eredeti fehér golyókat keressük.' }],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} fehér golyó volt, a piros ${f(w / (m - 1), 2)}, majd ${k} fehér hozzáadása után a fehérek aránya ${f((100 * (w + k)) / (w + w / (m - 1) + k), 2)} %, de ${f(p)} % kellene.`,
      tippek: [
        `Ha a fehérek száma x, hány piros golyó van a dobozban, amikor a golyók ${NEV[m]} piros?`,
        `Ha a golyók ${NEV[m]} piros, akkor a fehér a többi ${m - 1} rész: a piros golyók száma x : ${m - 1}.`,
        `A végén a fehérek száma x + ${k}, az összes golyó x + x : ${m - 1} + ${k}, és a fehérek aránya ${f(p)} %.`,
      ],
      megoldas: [
        `Legyen x a fehér golyók száma. Piros: x : ${m - 1}.`,
        `A második betét után fehér: x + ${k}; összes: x + x : ${m - 1} + ${k}.`,
        `(x + ${k}) = ${f(p / 100, 2)} · (${f(m / (m - 1), 4)}x + ${k}), ebből x = <strong>${f(W)}</strong>.`,
      ],
      magyarazat: [
        `Ha az összes golyó ${NEV[m]} piros, akkor a többi ${m - 1} rész fehér. Ezért a piros golyók száma x : ${m - 1}, ahol x a fehérek száma.`,
        `A végén ${k} fehérrel több van. A fehérek száma x + ${k}, az összes golyó x + x : ${m - 1} + ${k}. Ennek ${f(p)} %-a a fehér: x + ${k} = ${f(p / 100, 2)} · (x + x : ${m - 1} + ${k}).`,
        `Az egyenlet megoldása x = ${f(W)}. Józan ésszel: ekkor ${f(piros)} piros golyó van, a második betét után ${f(W + k)} fehér és ${f(ossz + k)} golyó összesen, és ${f(W + k)} : ${f(ossz + k)} = ${f(p / 100, 2)}.`,
      ],
      jegyezze: 'Ha az arány megadott, fejezd ki a mennyiségeket x-szel, és írd fel az arányt a változtatás után egyenletként.',
    });
  });
}

// ---- A3: váltakozó mozgás ----
function A3(rng) {
  return probal(() => {
    const v1 = valaszt(rng, [12, 15, 18]), v2 = valaszt(rng, [3, 6, 9]);
    const t1 = egesz(rng, 3, 6), t2 = egesz(rng, 1, 3);
    const m1 = (v1 * 1000) / 60, m2 = (v2 * 1000) / 60;
    const ciklus = m1 * t1 + m2 * t2;
    const n = egesz(rng, 4, 10), u = egesz(rng, 1, t1);
    const D = n * ciklus + u * m1;
    const ido = n * (t1 + t2) + u;
    if (D % 100 !== 0) return null;
    return egyMezos({
      szoveg: `Gabi hosszútávfutó. Egy edzésen ${t1} percig fut ${v1} km/h sebességgel, majd ${t2} percig sétál ${v2} km/h sebességgel, aztán újra fut ${t1} percig, majd sétál ${t2} percig, és így váltogatja egészen a célig. Hány perc alatt tesz meg ${f(D)} métert?`,
      cimke: 'Az idő', egyseg: 'perc', helyes: ido, tizedes: 0,
      hibak: [{ ertek: tisztit((D / 1000 / v1) * 60), uzenet: 'Gabi nem végig fut: a séta közben lassabban halad, ezért tovább tart. A ciklusokat külön kell számolni.' }, { ertek: n * (t1 + t2), uzenet: 'A teljes ciklusok után még van hátra egy rövid szakasz, amit még meg kell tenni.' }],
      ellenproba: (w) => `Ellenpróba: ${f(w)} perc alatt ${f(Math.floor(w / (t1 + t2)))} teljes ciklust (${f(ciklus)} m) és még ${f(w % (t1 + t2))} percet tesz meg; ez ${f(Math.floor(w / (t1 + t2)) * ciklus)} méternél több, de a feladatban ${f(D)} m szerepel.`,
      tippek: [
        'Mennyi utat tesz meg Gabi egy futó- és egy sétaszakaszból álló ciklus alatt, és mennyi ideig tart egy ciklus?',
        `Futás: ${t1} perc ${f(m1)} m/perc sebességgel = ${f(m1 * t1)} m; séta: ${t2} perc ${f(m2)} m/perc sebességgel = ${f(m2 * t2)} m. Egy ciklus ${f(ciklus)} m és ${t1 + t2} perc.`,
        `Hány teljes ciklus fér a ${f(D)} méterbe, és mennyi marad hátra?`,
      ],
      megoldas: [
        `${f(v1)} km/h = ${f(m1)} m/perc, ${f(v2)} km/h = ${f(m2)} m/perc.`,
        `Egy ciklus (${t1 + t2} perc) útja: ${f(m1 * t1)} + ${f(m2 * t2)} = ${f(ciklus)} m.`,
        `${n} ciklus: ${f(n * ciklus)} m, ${f(n * (t1 + t2))} perc. A maradék ${f(D - n * ciklus)} m futva ${f(u)} perc.`,
        `Összesen ${f(n * (t1 + t2))} + ${f(u)} = <strong>${f(ido)}</strong> perc.`,
      ],
      magyarazat: [
        `A feladat ismétlődő szakaszokból áll: egy futásból és egy sétából álló „ciklus” mindig ugyanannyi ideig tart és ugyanannyi utat jelent. Először ezt számoljuk ki.`,
        `A ${f(v1)} km/h percenként ${f(m1)} métert jelent, a ${f(v2)} km/h percenként ${f(m2)} métert. Egy ciklus tehát ${f(m1 * t1)} + ${f(m2 * t2)} = ${f(ciklus)} m út, és ${t1 + t2} perc.`,
        `${n} teljes ciklus ${f(n * ciklus)} métert és ${f(n * (t1 + t2))} percet ad. A hátralévő ${f(D - n * ciklus)} métert Gabi futva teszi meg, ez ${f(u)} perc, tehát összesen ${f(ido)} perc.`,
        `Józan ésszel: ha Gabi végig futna, ${f((D / 1000 / v1) * 60, 1)} perc alatt érne célba. A séta lassít, ezért a ${f(ido)} perc ennél több.`,
      ],
      jegyezze: 'Ismétlődő szakaszoknál számold ki egy ciklus útját és idejét, aztán nézd meg, hány teljes ciklus fér az útba, és mi marad.',
    });
  });
}

// ---- A4: találkozás, utolérés ----
function A4(rng) {
  const szembe = egesz(rng, 0, 1) === 0;
  return probal(() => {
    if (szembe) {
      const v1 = egesz(rng, 12, 24), v2 = egesz(rng, 12, 24);
      const T = egesz(rng, 2, 8) * 5; // perc
      const D = ((v1 + v2) * T) / 60;
      if (!szep(D, 0)) return null;
      return egyMezos({
        szoveg: `Két város távolsága ${f(D)} km. Egyszerre indul el egymással szembe egy kerékpáros ${v1} km/h és egy másik ${v2} km/h sebességgel. Hány perc múlva találkoznak?`,
        cimke: 'Az idő', egyseg: 'perc', helyes: T, tizedes: 0,
        hibak: [{ ertek: tisztit((D / v1) * 60), uzenet: 'Így csak az egyik kerékpáros útját vetted figyelembe. Szembe haladnak, ezért a sebességeik összeadódnak.' }, { ertek: tisztit(D / (v1 + v2)), uzenet: 'Ez órában van megadva. A kérdés percben szól: szorozd meg 60-nal.' }],
        ellenproba: (w) => `Ellenpróba: ${f(w)} perc alatt az egyik ${f((v1 * w) / 60, 2)} km-t, a másik ${f((v2 * w) / 60, 2)} km-t tesz meg, együtt ${f(((v1 + v2) * w) / 60, 2)} km, de a távolság ${f(D)} km.`,
        tippek: [`Mennyivel csökken a köztük lévő távolság óránként, ha mindketten haladnak egymás felé?`, `Óránként ${v1} + ${v2} = ${v1 + v2} km-rel kerülnek közelebb.`, `Idő = út : sebesség, és órából perc: szorozz 60-nal.`],
        megoldas: [`A közeledés sebessége: ${v1} + ${v2} = ${v1 + v2} km/h.`, `Idő: ${f(D)} : ${v1 + v2} = ${f(D / (v1 + v2), 3)} óra.`, `${f(D / (v1 + v2), 3)} · 60 = <strong>${f(T)}</strong> perc.`],
        magyarazat: [
          `Ha két jármű egymás felé halad, a köztük lévő távolság mindkettő sebességével csökken. Ezért a sebességeik összeadódnak: ${v1} + ${v2} = ${v1 + v2} km/h.`,
          `A ${f(D)} km megtételéhez ${f(D)} : ${v1 + v2} = ${f(D / (v1 + v2), 3)} óra kell, ami ${f(T)} perc.`,
          `Józan ésszel: ${f(T)} perc alatt az egyik ${f((v1 * T) / 60, 2)} km-t, a másik ${f((v2 * T) / 60, 2)} km-t tesz meg, együtt ${f(D)} km.`,
        ],
        jegyezze: 'Szembe haladva a sebességek összeadódnak; ugyanabba az irányba haladva a sebességek különbsége számít.',
      });
    }
    const v1 = egesz(rng, 10, 18), d = egesz(rng, 3, 8), t0 = 5 * egesz(rng, 2, 6);
    const v2 = v1 + d;
    const T = ((v1 * t0) / 60 / d) * 60;
    if (!szep(T, 0)) return null;
    return egyMezos({
      szoveg: `Anna ${v1} km/h sebességgel kerékpározik. ${t0} perccel később ugyanabból a pontból, ugyanabba az irányba elindul Balázs ${v2} km/h sebességgel. Hány perc múlva éri utol Balázs Annát az ő indulásától számítva?`,
      cimke: 'Az idő', egyseg: 'perc', helyes: T, tizedes: 0,
      hibak: [{ ertek: t0, uzenet: 'Ez az az idő, amennyit Anna már előnyben van. Az utolérés ennél másik időt vesz igénybe.' }, { ertek: tisztit((v1 * t0) / 60 / (v1 + v2) * 60), uzenet: 'Itt egy irányba haladnak, ezért a sebességeik különbsége számít, nem az összegük.' }],
      ellenproba: (w) => `Ellenpróba: ${f(w)} perc alatt Balázs ${f((v2 * w) / 60, 2)} km-t tesz meg, Anna ${f((v1 * (w + t0)) / 60, 2)} km-t; az utolérésnél a kettőnek egyenlőnek kellene lennie.`,
      tippek: [`Mekkora előnye van Annának, amikor Balázs elindul, és mennyivel gyorsabb Balázs?`, `Anna előnye ${t0} perc alatt ${f((v1 * t0) / 60, 3)} km. Balázs óránként ${d} km-rel gyorsabb.`, `Idő = előny : sebességkülönbség.`],
      megoldas: [`Anna előnye: ${v1} · ${t0}/60 = ${f((v1 * t0) / 60, 3)} km.`, `Balázs ${v2} − ${v1} = ${d} km/h sebességgel zár fel.`, `${f((v1 * t0) / 60, 3)} : ${d} = ${f((v1 * t0) / 60 / d, 3)} óra = <strong>${f(T)}</strong> perc.`],
      magyarazat: [
        `Anna már elindult, mielőtt Balázs elindult, ezért van egy előnye. Ezt az előnyt Balázs a sebességkülönbségével hozza be.`,
        `Anna előnye ${t0} perc alatt ${f((v1 * t0) / 60, 3)} km. Balázs ${v2} km/h, Anna ${v1} km/h, így Balázs óránként ${d} km-rel zár fel.`,
        `Az idő ${f((v1 * t0) / 60, 3)} : ${d} = ${f((v1 * t0) / 60 / d, 3)} óra, vagyis ${f(T)} perc. Józan ésszel: ennyi idő alatt Balázs ${f((v2 * T) / 60, 2)} km-t, Anna ${f((v1 * (T + t0)) / 60, 2)} km-t tesz meg, a kettő egyenlő.`,
      ],
      jegyezze: 'Utolérés: előny (km) : sebességkülönbség (km/h) = idő (óra). Szembe haladásnál a sebességeket összeadjuk.',
    });
  });
}

// ---- A5: méretarány ----
function A5(rng) {
  const oda = egesz(rng, 0, 1) === 0;
  return probal(() => {
    const M = valaszt(rng, [25000, 50000, 100000, 200000, 500000]);
    const cm = valaszt(rng, [2, 2.5, 3, 4, 4.5, 5, 6, 7.5, 8, 10, 12]);
    const km = tisztit((cm * M) / 100000);
    if (!szep(km, 2)) return null;
    if (oda) {
      return egyMezos({
        szoveg: `Egy térkép méretaránya 1 : ${f(M)}. Két város távolsága a térképen ${f(cm)} cm. Hány kilométer a valódi távolságuk?`,
        cimke: 'A valódi távolság', egyseg: 'km', helyes: km, tizedes: 2,
        hibak: [{ ertek: tisztit((cm * M) / 100), uzenet: 'Ez méterben adja a távolságot. A kérdés kilométerben szól: oszd el még 1000-rel.' }, { ertek: tisztit((cm * M) / 1000), uzenet: '1 km = 100 000 cm, nem 1000. A centiméterből kilométerre 100 000-rel kell osztani.' }],
        ellenproba: (w) => `Ellenpróba: ${f(w, 2)} km = ${f(w * 100000)} cm, a méretarány számával elosztva ${f((w * 100000) / M, 2)} cm lenne a térképen, de ${f(cm)} cm a mért távolság.`,
        tippek: [`Mit jelent az 1 : ${f(M)} méretarány: mekkora a valóságban 1 cm a térképen?`, `1 cm a térképen ${f(M)} cm a valóságban.`, `${f(cm)} cm · ${f(M)} = ${f(cm * M)} cm; váltsd át kilométerre (1 km = 100 000 cm).`],
        megoldas: [`${f(cm)} cm · ${f(M)} = ${f(cm * M)} cm a valóságban.`, `${f(cm * M)} cm : 100 000 = <strong>${f(km, 2)}</strong> km.`],
        magyarazat: [
          `Az 1 : ${f(M)} méretarány azt jelenti, hogy a térképen 1 cm a valóságban ${f(M)} cm-nek felel meg.`,
          `${f(cm)} cm a térképen ${f(cm)} · ${f(M)} = ${f(cm * M)} cm a valóságban. Egy kilométer 1000 m = 100 000 cm, ezért ${f(cm * M)} : 100 000 = ${f(km, 2)} km.`,
          `Józan ésszel: a valóságos távolság sokkal nagyobb, mint a térképen mért (${f(km, 2)} km a ${f(cm)} cm-hez képest).`,
        ],
        jegyezze: 'Méretarány 1 : M: a valóságban M-szer akkora a távolság. 1 km = 100 000 cm.',
      });
    }
    return egyMezos({
      szoveg: `Egy térkép méretaránya 1 : ${f(M)}. Két város valódi távolsága ${f(km, 2)} km. Hány centiméter a távolságuk a térképen?`,
      cimke: 'A távolság a térképen', egyseg: 'cm', helyes: cm, tizedes: 2,
      hibak: [{ ertek: tisztit((km * 1000) / M), uzenet: 'A méterből is centimétert kell csinálni: 1 km = 100 000 cm.' }, { ertek: tisztit((km * M) / 100000), uzenet: 'Fordítva váltottál: a térképen a távolság kisebb, ezért osztani kell a méretarány számával, nem szorozni.' }],
      ellenproba: (w) => `Ellenpróba: ${f(w, 2)} cm a térképen ${f(w * M)} cm a valóságban, ami ${f((w * M) / 100000, 2)} km, de ${f(km, 2)} km kellene.`,
      tippek: [`Hány centiméter a ${f(km, 2)} km, és hányad része ez a térképen?`, `${f(km, 2)} km = ${f(km * 100000)} cm.`, `Oszd el a méretarány számával (${f(M)}).`],
      megoldas: [`${f(km, 2)} km = ${f(km * 100000)} cm.`, `${f(km * 100000)} : ${f(M)} = <strong>${f(cm, 2)}</strong> cm.`],
      magyarazat: [
        `A méretarány miatt a térképen a távolság a valóságos távolság és a méretarány számának hányadosa. Előbb a kilométert centiméterre váltjuk: ${f(km, 2)} km = ${f(km * 100000)} cm.`,
        `Ezt elosztjuk a méretarány számával: ${f(km * 100000)} : ${f(M)} = ${f(cm, 2)} cm.`,
        `Józan ésszel: a térképen a távolság kisebb, mint a valóságban, és ${f(cm, 2)} cm tényleg kisebb, mint ${f(km * 100000)} cm.`,
      ],
      jegyezze: 'Térképen mért távolság = valódi távolság : M (azonos mértékegységben).',
    });
  });
}

export default {
  id: 'fv-aranyok',
  sor: 'felveteli',
  cim: 'Százalék, arány, mozgás',
  rovid: 'Százalékszámítás, összetett százalékos feladat, váltakozó mozgás, találkozás és utolérés, méretarány.',
  kulcskeplet: '<span class="keplet-nagy">s = v · t</span>',
  kulcsMagyarazat: ['Út = sebesség · idő. A százaléknál mindig tisztázd, melyik a 100 % (az alap).'],
  elmelet: [
    '<strong>Százalék:</strong> a 100 % az egész (az alap). A p %-a = alap · p / 100. Az egészet keresve előbb az 1 %-ot számold ki. Hány százalék: rész : egész · 100.',
    '<strong>Összetett százalékos feladat:</strong> a mennyiségeket fejezd ki x-szel, majd írd fel az arányt a változtatás után egyenletként.',
    '<strong>Mozgás:</strong> út = sebesség · idő. Szembe haladva a sebességek összeadódnak, azonos irányban az utolérésnél a sebességek különbsége számít.',
    '<strong>Váltakozó mozgás:</strong> számold ki egy ciklus idejét és útját, a teljes ciklusok számát, és a maradék szakaszt.',
    '<strong>Méretarány 1 : M:</strong> a valóságban M-szer akkora a távolság, mint a térképen. 1 km = 100 000 cm.',
  ],
  peldak: [
    { cim: 'Hány százalék?', feladat: 'Egy 240 fős évfolyamon 60 tanuló jár szakkörre. Hány százalék?',
      lepesek: ['60 : 240 = 0,25.', '0,25 · 100 = 25 %.', 'Ellenőrzés: 240 · 0,25 = 60.'] },
    { cim: 'Doboz és golyók', feladat: 'Egy dobozban csak fehér golyók vannak. Beletettünk annyi pirosat, hogy a golyók ötödrésze piros lett. Aztán 10 fehéret tettünk bele, így a golyók 84 %-a fehér. Hány fehér golyó volt eredetileg?',
      lepesek: ['Ha x fehér volt, a piros x : 4 (mert a fehér a golyók 4/5 része).', '(x + 10) = 0,84 · (1,25x + 10), vagyis x + 10 = 1,05x + 8,4.', '1,6 = 0,05x, x = 32. Ellenőrzés: 32 fehér, 8 piros; 42 fehér és 50 golyó összesen, 42 : 50 = 0,84.'] },
    { cim: 'Váltakozó mozgás', feladat: 'Gabi 4 percig fut 12 km/h sebességgel, majd 1 percig sétál 6 km/h sebességgel, és így váltogatja. Hány perc alatt tesz meg 10 000 métert?',
      lepesek: ['12 km/h = 200 m/perc, 6 km/h = 100 m/perc. Egy ciklus 5 perc: 4 · 200 + 100 = 900 m.', '10 000 m = 11 · 900 m + 100 m. A 11 ciklus 55 perc, a maradék 100 m futva 0,5 perc.', 'Összesen 55,5 perc.'] },
  ],
  tipusok: [
    { id: 'A1', nev: 'Százalék: rész, egész, százalékláb', general: A1 },
    { id: 'A2', nev: 'Doboz és golyók (összetett százalék)', general: A2 },
    { id: 'A3', nev: 'Váltakozó futás és séta', general: A3 },
    { id: 'A4', nev: 'Találkozás és utolérés', general: A4 },
    { id: 'A5', nev: 'Méretarány', general: A5 },
  ],
  peldaEllenorzes() {
    return [
      { nev: '1. példa: 60 : 240', kapott: 60 / 240, vart: 0.25 },
      { nev: '1. példa: százalék', kapott: szazalekLab(60, 240), vart: 25 },
      { nev: '1. példa: ellenőrzés', kapott: szazalekErtek(240, 25), vart: 60 },
      { nev: '2. példa: fehér golyók', kapott: feherGolyo(5, 10, 84), vart: 32 },
      { nev: '2. példa: piros', kapott: 32 / 4, vart: 8 },
      { nev: '2. példa: arány', kapott: 42 / 50, vart: 0.84 },
      { nev: '3. példa: ciklus útja', kapott: 4 * 200 + 100, vart: 900 },
      { nev: '3. példa: idő', kapott: valtakozoIdo(10000, 4, 12, 1, 6), vart: 55.5 },
      { nev: '3. példa: 11 ciklus', kapott: 11 * 900 + 100, vart: 10000 },
      { nev: '4. példa: méretarány', kapott: meretaranyKm(4, 50000), vart: 2 },
    ];
  },
};
