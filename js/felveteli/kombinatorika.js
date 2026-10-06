// F5 – Kombinatorika, valószínűség, statisztika
import { egesz, valaszt } from '../lib/rng.js';
import { probal, f, tisztit } from '../temak/seged.js';
import { egyMezos, TORT_UTASITAS, tortSzoveg } from './seged.js';

// ---- Tiszta számolók ----
export const fakt = (n) => (n <= 1 ? 1 : n * fakt(n - 1));
export const kombinacio = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const variacio = (n, k) => fakt(n) / fakt(n - k);
export const valoszinuseg = (kedvezo, osszes) => tisztit(kedvezo / osszes);
/** Binomiális eloszlás: P(k fej n érmével). */
export const binom = (n, k) => kombinacio(n, k) / 2 ** n;
/** Anna na, Barnabás nb érmét dob: P(Anna több fejet dob), P(egyenlő). */
export function ermeJatek(na, nb) {
  let nyer = 0, dontetlen = 0;
  for (let i = 0; i <= na; i++) for (let j = 0; j <= nb; j++) {
    const p = binom(na, i) * binom(nb, j);
    if (i > j) nyer += p; else if (i === j) dontetlen += p;
  }
  return { nyer: tisztit(nyer), dontetlen: tisztit(dontetlen) };
}
export const atlag = (t) => tisztit(t.reduce((a, b) => a + b, 0) / t.length);
export function median(t) {
  const r = [...t].sort((a, b) => a - b), n = r.length;
  return n % 2 ? r[(n - 1) / 2] : (r[n / 2 - 1] + r[n / 2]) / 2;
}
export function modusz(t) {
  const db = new Map();
  for (const x of t) db.set(x, (db.get(x) || 0) + 1);
  const max = Math.max(...db.values());
  const lista = [...db].filter(([, v]) => v === max).map(([k]) => k);
  return lista.length === 1 ? lista[0] : null;
}
export const terjedelem = (t) => Math.max(...t) - Math.min(...t);

// ---- K1: sorrendek ----
function K1(rng) {
  const valt = egesz(rng, 0, 1);
  return probal(() => {
    const n = egesz(rng, 3, 6);
    if (valt === 1 && n < 4) return null;
    const helyes = valt === 0 ? fakt(n) : 2 * fakt(n - 1);
    return egyMezos({
      szoveg: valt === 0
        ? `Hányféle sorrendben állhat sorba ${n} gyerek?`
        : `${n} gyerek áll sorba. Közülük kettő (Anna és Béla) mindig egymás mellett áll. Hányféle sorrend lehetséges?`,
      cimke: 'A sorrendek száma', helyes, tizedes: 0,
      hibak: valt === 0
        ? [{ ertek: n * n, uzenet: 'Az n · n azt jelentené, hogy ugyanaz a gyerek többször is sorra kerülhet. Minden gyerek csak egyszer áll sorba, ezért a lehetőségek száma minden helyen eggyel csökken.' }, { ertek: n * (n - 1), uzenet: 'Itt csak két helyre számoltál. Mind a ' + n + ' helyre kell: n · (n − 1) · … · 1.' }]
        : [{ ertek: fakt(n), uzenet: 'Ez a feltétel nélküli sorrendek száma. Itt a két gyerek mindig egymás mellett áll.' }, { ertek: fakt(n - 1), uzenet: 'A két gyerek egymás közti sorrendje is számít (Anna, Béla vagy Béla, Anna), ezért ezt még meg kell szorozni kettővel.' }],
      ellenproba: (w) => valt === 0
        ? `Ellenpróba: ha ${f(w)} sorrend lenne, az első helyre ${f(n)}, a másodikra ${f(n - 1)}, … gyerek kerülhetne, és ezek szorzata ${f(helyes)} lenne, nem ${f(w)}.`
        : `Ellenpróba: a blokkal ${f(n - 1)}! · 2 = ${f(helyes)} sorrend jön ki, nem ${f(w)}.`,
      tippek: valt === 0
        ? [`Hányféle gyerek állhat az első helyre, és hányféle a másodikra, ha az első már leállt?`, `Az első helyre ${n}, a másodikra ${n - 1}, és így tovább.`, `Szorozd össze: ${n} · ${n - 1} · … · 1.`]
        : [`Hogyan lehet a két egymás melletti gyereket egyetlen „blokként” kezelni?`, `A blokk egyetlen helyet foglal, így ${n - 1} dolgot kell sorba állítani: ${n - 1}! lehetőség.`, `A blokkon belül a két gyerek két sorrendben állhat.`],
      megoldas: valt === 0
        ? [`Az első helyre ${n}, a másodikra ${n - 1}, … a végén 1 gyerek kerülhet.`, `${Array.from({ length: n }, (_, i) => n - i).join(' · ')} = <strong>${f(helyes)}</strong>.`]
        : [`A két gyereket egy blokknak vesszük, így ${n - 1} „elemet” állítunk sorba: ${n - 1}! = ${f(fakt(n - 1))} féleképpen.`, `A blokkon belül 2 sorrend lehet: ${f(fakt(n - 1))} · 2 = <strong>${f(helyes)}</strong>.`],
      magyarazat: valt === 0 ? [
        `Az első helyre mind a ${n} gyerek közül választhatunk. A másodikra már csak ${n - 1} marad, a harmadikra ${Math.max(n - 2, 1)}, és így tovább.`,
        `A választási lehetőségeket összeszorozzuk: ${Array.from({ length: n }, (_, i) => n - i).join(' · ')} = ${f(helyes)}. Ezt a szorzatot ${n}! (n faktoriális) jelöli.`,
        `Józan ésszel: egy gyerekkel 1, kettővel 2, hárommal 6 sorrend van. Minden új gyerek az eddigi sorrendek számát megszorozza a gyerekek számával.`,
      ] : [
        `Ha a két gyerek mindig egymás mellett áll, akkor úgy tekinthetjük őket, mintha egyetlen nagyobb „blokk” lenne. Így ${n - 1} dolgot kell sorba állítanunk: ez ${f(fakt(n - 1))} lehetőség.`,
        `A blokkon belül a két gyerek kétféleképpen állhat: Anna, Béla vagy Béla, Anna. Ezért a lehetőségek száma ${f(fakt(n - 1))} · 2 = ${f(helyes)}.`,
        `Józan ésszel: a feltétel nélkül ${f(fakt(n))} sorrend lenne, a feltétellel kevesebb, és ${f(helyes)} < ${f(fakt(n))}.`,
      ],
      jegyezze: 'n dolog sorrendje: n! = n · (n − 1) · … · 1. Egymás mellé kerülő elemeket kezelj egy blokként.',
    });
  });
}

// ---- K2: kiválasztás sorrend nélkül ----
function K2(rng) {
  return probal(() => {
    const n = egesz(rng, 5, 9), k = egesz(rng, 2, 4);
    if (k >= n - 1) return null;
    const helyes = kombinacio(n, k);
    return egyMezos({
      szoveg: `A matematika-szakkör ${n} tagja közül hányféleképpen választhatunk ki ${k} fős csapatot, ha a kiválasztás sorrendje nem számít?`,
      cimke: 'A csapatok száma', helyes, tizedes: 0,
      hibak: [
        { ertek: variacio(n, k), uzenet: `Ez az az eset, amikor a sorrend is számít (pl. ki az első, ki a második). A csapatnál ugyanaz a ${k} ember csak egy csapatot jelent, ezért el kell osztani a kiválasztottak sorrendjeinek számával (${f(fakt(k))}).` },
        { ertek: n * k, uzenet: 'A választások nem összeadódnak és nem szorzódnak ilyen egyszerűen: a kiválasztott embereket nem lehet újra kiválasztani.' },
      ],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} csapat lenne, és mindegyik ${k} főből áll, akkor a ${f(fakt(k))} lehetséges sorrenddel együtt ${f(w * fakt(k))} sorrendes választás lenne, de ${f(n)} emberből ${f(k)} főt sorrenddel ${f(variacio(n, k))} féleképpen lehet kiválasztani.`,
      tippek: [
        `Hányféleképpen választhatunk ki ${k} embert sorrenddel, és hányszor számoltuk így ugyanazt a csapatot?`,
        `Sorrenddel: ${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = ${f(variacio(n, k))}.`,
        `Ugyanazt a ${k} fős csapatot ${f(fakt(k))}-féle sorrendben számoltuk, ezért osztani kell.`,
      ],
      megoldas: [`Sorrenddel kiválasztva: ${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = ${f(variacio(n, k))}.`, `Egy csapatot ${k}! = ${f(fakt(k))}-féle sorrendben számoltunk: ${f(variacio(n, k))} : ${f(fakt(k))} = <strong>${f(helyes)}</strong>.`],
      magyarazat: [
        `Ha a sorrend is számítana, az első helyre ${n}, a másodikra ${n - 1} ember jöhetne, és így tovább: ${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = ${f(variacio(n, k))} lehetőség.`,
        `A csapatnál viszont mindegy, hogy ki melyik sorrendben került be. Ugyanazt a ${k} embert ${f(fakt(k))}-féle sorrendben is kiválaszthattuk, ezért a végeredményt osztjuk ennyivel.`,
        `A csapatok száma ${f(variacio(n, k))} : ${f(fakt(k))} = ${f(helyes)}. Józan ésszel: a csapatok száma kisebb, mint a sorrendes választásoké (${f(helyes)} < ${f(variacio(n, k))}).`,
      ],
      jegyezze: 'Sorrend nélküli kiválasztás: előbb számold ki a sorrenddel való kiválasztást, aztán oszd el a kiválasztottak sorrendjeinek számával (k!).',
    });
  });
}

// ---- K3: számjegyekből képzett számok ----
function K3(rng) {
  const valt = egesz(rng, 0, 2); // 0: ismétlés nélkül, 1: ismétlés nélkül, páros, 2: ismétléssel
  return probal(() => {
    const n = egesz(rng, 4, 6), k = egesz(rng, 2, 3);
    if (valt === 1 && k !== 3) return null;
    const jegyek = Array.from({ length: n }, (_, i) => i + 1).join(', ');
    const paros = Math.floor(n / 2);
    const helyes = valt === 0 ? variacio(n, k) : valt === 1 ? paros * variacio(n - 1, k - 1) : n ** k;
    const szoveg = valt === 0
      ? `Az ${jegyek} számjegyekből egy-egy számjegyet legfeljebb egyszer felhasználva hány ${k} jegyű szám írható fel?`
      : valt === 1
        ? `Az ${jegyek} számjegyekből egy-egy számjegyet legfeljebb egyszer felhasználva hány ${k} jegyű páros szám írható fel?`
        : `Az ${jegyek} számjegyekből (a számjegyek ismétlődhetnek) hány ${k} jegyű szám írható fel?`;
    return egyMezos({
      szoveg,
      cimke: 'A számok száma', helyes, tizedes: 0,
      hibak: valt === 0
        ? [{ ertek: n ** k, uzenet: 'Itt a számjegyek nem ismétlődhetnek, ezért minden helyiértéken eggyel kevesebb számjegy közül választhatsz.' }, { ertek: n * k, uzenet: 'A választások száma szorzódik, nem összeadódik.' }]
        : valt === 1
          ? [{ ertek: variacio(n, k), uzenet: 'Ez az összes szám (páros és páratlan együtt). A páros számokhoz az utolsó számjegy csak páros lehet.' }, { ertek: paros * (n - 1) * (n - 1), uzenet: 'Itt a számjegyek nem ismétlődhetnek: az utolsó számjegy után a többi helyre eggyel kevesebb lehetőség marad.' }]
          : [{ ertek: variacio(n, k), uzenet: 'Itt a számjegyek ismétlődhetnek, ezért minden helyiértéken mind a ' + n + ' számjegy közül választhatsz.' }, { ertek: n * k, uzenet: 'A választások száma szorzódik, nem összeadódik.' }],
      ellenproba: (w) => `Ellenpróba: ha ${f(w)} szám lenne, a helyiértékenkénti lehetőségek szorzatának is ${f(w)} kellene lennie, de a szorzat ${f(helyes)}.`,
      tippek: [
        valt === 1 ? 'Melyik helyiértéken van megkötés, és ott hány számjegy közül választhatsz, ha ezt a helyet töltöd ki először?' : 'Hány számjegy közül választhatsz az első helyiértékre, és hányból a következőre?',
        valt === 0 ? `Az első helyre ${n}, a másodikra ${n - 1} számjegy közül.` : valt === 1 ? `Az utolsó számjegy páros: ${paros} lehetőség, az első két helyre a maradék ${n - 1} számjegyből ${n - 1} · ${n - 2}.` : `Mindegyik helyiértékre ${n} számjegy közül választhatsz.`,
        'Szorozd össze az egyes helyiértékekhez tartozó lehetőségek számát.',
      ],
      megoldas: valt === 0
        ? [`Az 1. helyiértékre ${n}, a 2.-ra ${n - 1}${k === 3 ? `, a 3.-ra ${n - 2}` : ''} számjegy közül választhatunk.`, `${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = <strong>${f(helyes)}</strong>.`]
        : valt === 1
          ? [`Az utolsó számjegy páros: ${paros} lehetőség.`, `Az első helyre ${n - 1}, a másodikra ${n - 2} számjegy marad: ${paros} · ${n - 1} · ${n - 2} = <strong>${f(helyes)}</strong>.`]
          : [`Mindegyik helyiértékre ${n} lehetőség van.`, `${Array.from({ length: k }, () => n).join(' · ')} = ${f(n)}${k === 2 ? '²' : '³'} = <strong>${f(helyes)}</strong>.`],
      magyarazat: valt === 0 ? [
        `Sorban töltjük ki a helyiértékeket. Az elsőre ${n} számjegy közül választhatunk, a másodikra már csak ${n - 1} közül, mert az elsőt nem használhatjuk újra${k === 3 ? `, a harmadikra ${n - 2} közül` : ''}.`,
        `A lehetőségeket összeszorozzuk: ${Array.from({ length: k }, (_, i) => n - i).join(' · ')} = ${f(helyes)}.`,
        `Józan ésszel: ha a számjegyek ismétlődhetnének, ${f(n ** k)} szám lenne. Az ismétlés nélküli szám kevesebb: ${f(helyes)} < ${f(n ** k)}.`,
      ] : valt === 1 ? [
        `A páros szám utolsó számjegye páros kell legyen. Az ${jegyek} számjegyek között ${paros} páros van, ezért az utolsó helyiértékre ${paros} lehetőség adódik. Ezt töltjük ki először.`,
        `A hátralévő két helyiértékre a megmaradt ${n - 1} számjegy közül választunk: az elsőre ${n - 1}, a másodikra ${n - 2} lehetőség. A szorzat ${paros} · ${n - 1} · ${n - 2} = ${f(helyes)}.`,
        `Józan ésszel: az összes számnak (${f(variacio(n, 3))}) csak egy része páros, ez kevesebb: ${f(helyes)} < ${f(variacio(n, 3))}.`,
      ] : [
        `Mivel a számjegyek ismétlődhetnek, minden helyiértékre ugyanannyi, ${n} lehetőség van. A helyiértékek egymástól függetlenek.`,
        `${k} helyiérték esetén ${Array.from({ length: k }, () => n).join(' · ')} = ${f(helyes)} szám írható fel.`,
        `Józan ésszel: ismétléssel több szám írható, mint ismétlés nélkül (${f(helyes)} > ${f(variacio(n, k))}).`,
      ],
      jegyezze: 'Helyiértékenként szorozd össze a lehetőségek számát. Ha van megkötés (páros, kisebb), azt a helyet töltsd ki először.',
    });
  });
}

// ---- K4: golyóhúzás ----
function K4(rng) {
  const valt = egesz(rng, 0, 2);
  return probal(() => {
    const pir = egesz(rng, 2, 6), feh = egesz(rng, 2, 7), zol = egesz(rng, 2, 7);
    const ossz = pir + feh + zol;
    let kedvezo, osszes, szoveg, magyar;
    if (valt === 0) {
      kedvezo = feh; osszes = ossz;
      szoveg = `Egy dobozban ${pir} piros, ${feh} fehér és ${zol} zöld golyó van. Egy golyót kihúzunk véletlenszerűen. Mennyi a valószínűsége, hogy fehér golyót húzunk?`;
      magyar = `A kedvező esetek száma a fehér golyók száma (${feh}), az összes eset a golyók száma (${ossz}).`;
    } else if (valt === 1) {
      kedvezo = feh + zol; osszes = ossz;
      szoveg = `Egy dobozban ${pir} piros, ${feh} fehér és ${zol} zöld golyó van. Egy golyót kihúzunk véletlenszerűen. Mennyi a valószínűsége, hogy nem piros golyót húzunk?`;
      magyar = `A kedvező esetek száma a nem piros golyók száma (${feh} + ${zol} = ${feh + zol}), az összes eset ${ossz}.`;
    } else {
      kedvezo = pir * (pir - 1); osszes = ossz * (ossz - 1);
      szoveg = `Egy dobozban ${pir} piros, ${feh} fehér és ${zol} zöld golyó van. Két golyót húzunk egymás után visszatevés nélkül. Mennyi a valószínűsége, hogy mindkettő piros?`;
      magyar = `Az első húzásnál ${pir}/${ossz} az esély pirosra, a másodiknál ${pir - 1}/${ossz - 1}, mert eggyel kevesebb piros és eggyel kevesebb golyó van.`;
    }
    const helyes = tisztit(kedvezo / osszes);
    const eredmeny = tortSzoveg(kedvezo, osszes);
    return egyMezos({
      szoveg, utasitas: TORT_UTASITAS,
      cimke: 'A valószínűség', helyes, tizedes: 3,
      hibak: valt === 2
        ? [{ ertek: (pir / ossz) ** 2, uzenet: 'Visszatevés nélkül a második húzásnál már eggyel kevesebb golyó van a dobozban (és eggyel kevesebb piros).' }, { ertek: (2 * pir) / ossz, uzenet: 'Az „és” kapcsolatú eseményeknél szorzunk, nem összeadunk.' }]
        : [{ ertek: kedvezo / (osszes - kedvezo), uzenet: 'Az összes esetek számához a kedvezőt is hozzá kell számolni: valószínűség = kedvező : összes.' }, { ertek: kedvezo, uzenet: 'A valószínűség 0 és 1 közé esik: a kedvező esetek számát el kell osztani az összes esetek számával.' }],
      ellenproba: (w) => `Ellenpróba: ha a valószínűség ${f(w, 3)} lenne, akkor ${f(osszes)} egyformán valószínű eset közül ${f(w * osszes, 2)} lenne a kedvező, de ${f(kedvezo)} kellene.`,
      tippek: [
        valt === 2 ? 'Mennyi az esélye, hogy az első golyó piros, és mi változik a doboz tartalmában, mielőtt a másodikat húzod?' : 'Hány golyó van összesen, és hány közülük a kedvező?',
        valt === 2 ? `Az első húzás: ${pir}/${ossz}. A második: ${pir - 1}/${ossz - 1}.` : `Összesen ${ossz} golyó van, ebből ${kedvezo} a kedvező.`,
        valt === 2 ? 'Szorozd össze a két valószínűséget.' : 'A valószínűség = kedvező esetek száma osztva az összes esettel.',
      ],
      megoldas: valt === 2
        ? [`P(1. piros) = ${pir}/${ossz}, P(2. piros) = ${pir - 1}/${ossz - 1}.`, `${pir}/${ossz} · ${pir - 1}/${ossz - 1} = ${kedvezo}/${osszes} = <strong>${eredmeny}</strong> ≈ ${f(helyes, 3)}.`]
        : [`Kedvező esetek: ${kedvezo}, összes eset: ${osszes}.`, `P = ${kedvezo}/${osszes} = <strong>${eredmeny}</strong> ≈ ${f(helyes, 3)}.`],
      magyarazat: [
        valt === 2 ? 'Két húzás következik egymás után, ezért a két valószínűséget össze kell szorozni. A második húzásnál azonban már megváltozott a doboz tartalma.' : 'A valószínűség azt mutatja meg, hogy az összes lehetséges eset közül hány kedvező.',
        magyar,
        `A valószínűség ${kedvezo}/${osszes}, egyszerűsítve ${eredmeny}, ami körülbelül ${f(helyes, 3)}. Józan ésszel: a valószínűség 0 és 1 között van, és ez az érték ${helyes > 0.5 ? 'nagyobb, mint a fele, vagyis inkább bekövetkezik' : 'kisebb, mint a fele, vagyis inkább nem következik be'}.`,
      ],
      jegyezze: 'Valószínűség = kedvező esetek száma : összes esetek száma. Visszatevés nélküli húzásnál a második húzás előtt módosítsd a darabszámokat.',
    });
  });
}

// ---- K5: érmék, Anna és Barnabás ----
function K5(rng) {
  const dontetlenE = egesz(rng, 0, 1) === 1;
  return probal(() => {
    const na = egesz(rng, 1, 3), nb = egesz(rng, 1, 3);
    const r = ermeJatek(na, nb);
    const helyes = dontetlenE ? r.dontetlen : r.nyer;
    return egyMezos({
      szoveg: `Anna ${na} érmét, Barnabás ${nb} érmét dob fel egyszerre. Az nyer, aki több fejet dob; ha ugyanannyi fejet dobnak, a játék döntetlen. Mennyi a valószínűsége, hogy ${dontetlenE ? 'a játék döntetlen' : 'Anna nyer'}?`,
      utasitas: TORT_UTASITAS,
      cimke: 'A valószínűség', helyes, tizedes: 3,
      hibak: [{ ertek: 0.5, uzenet: 'Nem fele-fele az esély: az egyes kimeneteleket (hány fej) külön kell számolni, és nem egyformán valószínűek.' }, { ertek: dontetlenE ? r.nyer : r.dontetlen, uzenet: 'Ez a másik esemény valószínűsége. Olvasd el újra, mit kérdeznek.' }],
      ellenproba: (w) => `Ellenpróba: az összes lehetséges kimenetel ${f(2 ** (na + nb))}, ezért ${f(w, 3)} · ${f(2 ** (na + nb))} = ${f(w * 2 ** (na + nb), 2)} kedvező kimenetel lenne, de ${f(helyes * 2 ** (na + nb))} kellene.`,
      tippek: [
        'Hányféle kimenetele lehet az érmék feldobásának, és mindegyik egyformán valószínű?',
        `${na + nb} érme feldobásánál 2 · 2 · … = ${f(2 ** (na + nb))} egyformán valószínű kimenetel van (fej vagy írás mindegyiknél).`,
        'Számold meg, hány kimenetelnél teljesül a feltétel (mennyi fejet dob Anna, mennyit Barnabás).',
      ],
      megoldas: [
        `Összes kimenetel: 2^${na + nb} = ${f(2 ** (na + nb))}.`,
        `Anna ${na} érméjével k fejet C(${na}, k) féleképpen dobhat, Barnabás ${nb} érméjével j fejet C(${nb}, j) féleképpen; ezeket összeszorozzuk a feltételnek megfelelő (k, j) párokra.`,
        `A kedvező kimenetelek száma ${f(helyes * 2 ** (na + nb))}, így P = ${f(helyes * 2 ** (na + nb))}/${f(2 ** (na + nb))} = <strong>${tortSzoveg(Math.round(helyes * 2 ** (na + nb)), 2 ** (na + nb))}</strong> ≈ ${f(helyes, 3)}.`,
      ],
      magyarazat: [
        `Minden érme fej vagy írás lehet, ezért ${na + nb} érménél ${f(2 ** (na + nb))} egyformán valószínű kimenetel van.`,
        `Összeszámoljuk azokat a kimeneteleket, ahol ${dontetlenE ? 'Anna és Barnabás ugyanannyi fejet dob' : 'Anna több fejet dob, mint Barnabás'}. Egy adott fejszámhoz az érmék kombinációinak száma a kombinációk száma (pl. 2 érménél 1 fej 2-féleképpen lehet).`,
        `A kedvező kimenetelek száma ${f(helyes * 2 ** (na + nb))}, így a valószínűség ${f(helyes, 3)}. Józan ésszel: a valószínűség 0 és 1 közé esik, és a ${f(helyes, 3)} ide esik. Visszaszámolva: ${f(helyes * 2 ** (na + nb))} : ${f(2 ** (na + nb))} = ${f(helyes, 3)}.`,
      ],
      jegyezze: 'Érmeféle kérdésnél számold meg az összes kimenetelt (az érmék számának hatványa 2-ből), majd azt, amelyik megfelel a feltételnek; ne feltételezz fele-fele esélyt.',
    });
  });
}

// ---- K6: statisztika ----
function K6(rng) {
  const valt = valaszt(rng, ['atlag', 'median', 'modusz', 'terjedelem']);
  return probal(() => {
    const n = egesz(rng, 7, 9);
    const adatok = Array.from({ length: n }, () => egesz(rng, 1, 5));
    if (new Set(adatok).size < 4) return null;
    const mod = modusz(adatok);
    if (valt === 'modusz' && mod === null) return null;
    const lista = adatok.join(', ');
    const rendezett = [...adatok].sort((a, b) => a - b);
    const ertekek = { atlag: atlag(adatok), median: median(adatok), modusz: mod, terjedelem: terjedelem(adatok) };
    const helyes = ertekek[valt];
    const osszeg = adatok.reduce((a, b) => a + b, 0);
    const kerd = { atlag: 'Mennyi az adatok átlaga? (Két tizedesre kerekítve add meg.)', median: 'Mennyi az adatok mediánja?', modusz: 'Mennyi az adatok módusza?', terjedelem: 'Mennyi az adatok terjedelme?' }[valt];
    return egyMezos({
      szoveg: `Egy dolgozat ${n} osztályzata: ${lista}. ${kerd}`,
      cimke: { atlag: 'Az átlag', median: 'A medián', modusz: 'A módusz', terjedelem: 'A terjedelem' }[valt],
      helyes, tizedes: valt === 'atlag' ? 2 : 1,
      hibak: [
        { ertek: ertekek.atlag, uzenet: valt === 'atlag' ? '' : 'Ez az átlag. Más mutatót kérdeznek.' },
        { ertek: ertekek.median, uzenet: valt === 'median' ? '' : 'Ez a medián (a rendezett lista közepe). Más mutatót kérdeznek.' },
        { ertek: ertekek.terjedelem, uzenet: valt === 'terjedelem' ? '' : 'Ez a terjedelem (legnagyobb − legkisebb). Más mutatót kérdeznek.' },
      ].filter((h) => h.uzenet),
      ellenproba: (w) => valt === 'atlag'
        ? `Ellenpróba: ${f(w, 2)} · ${n} = ${f(w * n, 2)}, de az adatok összege ${f(osszeg)}.`
        : valt === 'median'
          ? `Ellenpróba: a rendezett lista (${rendezett.join(', ')}) közepén ${f(helyes, 1)} áll, nem ${f(w, 2)}.`
          : valt === 'modusz'
            ? `Ellenpróba: a ${f(w, 2)} ${adatok.filter((x) => x === w).length}-szer fordul elő, de a leggyakoribb érték ${adatok.filter((x) => x === helyes).length}-szer.`
            : `Ellenpróba: a legnagyobb adat ${Math.max(...adatok)}, ebből kivonva ${f(w, 2)} értéket ${f(Math.max(...adatok) - w, 2)} jönne ki a legkisebb adatra, de az ${Math.min(...adatok)}.`,
      tippek: [
        { atlag: 'Mi az átlag, és mit kell előbb kiszámolnod hozzá?', median: 'Mit kell csinálni az adatokkal, mielőtt a közepüket keresed?', modusz: 'Melyik érték fordul elő a legtöbbször?', terjedelem: 'Melyik a legnagyobb és melyik a legkisebb adat?' }[valt],
        { atlag: `Add össze az adatokat: ${adatok.join(' + ')} = ${f(osszeg)}.`, median: `Rendezd növekvő sorrendbe: ${rendezett.join(', ')}.`, modusz: 'Számold meg, hányszor szerepel az egyes érték.', terjedelem: 'A terjedelem = legnagyobb adat − legkisebb adat.' }[valt],
        { atlag: `Oszd el az összeget az adatok számával (${n}).`, median: n % 2 ? 'Páratlan számú adatnál a középső adat a medián.' : 'Páros számú adatnál a két középső adat átlaga a medián.', modusz: 'A leggyakoribb érték a módusz.', terjedelem: `${Math.max(...adatok)} − ${Math.min(...adatok)}.` }[valt],
      ],
      megoldas: {
        atlag: [`Az adatok összege: ${adatok.join(' + ')} = ${f(osszeg)}.`, `Átlag: ${f(osszeg)} : ${n} = <strong>${f(helyes, 2)}</strong>.`],
        median: [`Rendezve: ${rendezett.join(', ')}.`, n % 2 ? `${n} adat van, a középső (${(n + 1) / 2}.) adat <strong>${f(helyes, 1)}</strong>.` : `${n} adat van, a két középső (${n / 2}. és ${n / 2 + 1}.) átlaga <strong>${f(helyes, 1)}</strong>.`],
        modusz: [`Gyakoriságok: ${[...new Set(rendezett)].map((x) => `${x}: ${adatok.filter((y) => y === x).length}×`).join(', ')}.`, `A leggyakoribb érték a <strong>${f(helyes)}</strong>.`],
        terjedelem: [`Legnagyobb: ${Math.max(...adatok)}, legkisebb: ${Math.min(...adatok)}.`, `${Math.max(...adatok)} − ${Math.min(...adatok)} = <strong>${f(helyes)}</strong>.`],
      }[valt],
      magyarazat: {
        atlag: [
          `Az átlag azt mutatja, mekkora lenne mindenki jegye, ha egyformán osztanánk szét az összes pontot.`,
          `Az adatok összege ${f(osszeg)}, és ${n} adat van. Ezért az átlag ${f(osszeg)} : ${n} = ${f(helyes, 2)}.`,
          `Józan ésszel: az átlag a legkisebb (${Math.min(...adatok)}) és a legnagyobb adat (${Math.max(...adatok)}) között van, és a ${f(helyes, 2)} valóban ide esik.`,
        ],
        median: [
          `A medián a rendezett adatsor közepe: a felénél kevesebb, a másik felénél több adat van tőle jobbra és balra. Ezért előbb sorba kell rendezni az adatokat.`,
          `A rendezett sor: ${rendezett.join(', ')}. ${n % 2 ? `Az ${n} adat közül a ${(n + 1) / 2}. a középső.` : `${n} adatnál a ${n / 2}. és ${n / 2 + 1}. adat átlaga a medián.`}`,
          `Józan ésszel: a medián ${f(helyes, 1)}, és a rendezett lista felénél kisebb vagy egyenlő, felénél nagyobb vagy egyenlő számok állnak.`,
        ],
        modusz: [
          `A módusz a leggyakoribb adat. Ehhez meg kell számolni, hányszor fordul elő az egyes érték.`,
          `Az előfordulások: ${[...new Set(rendezett)].map((x) => `${x} → ${adatok.filter((y) => y === x).length} db`).join(', ')}. A legtöbbször a ${f(helyes)} szerepel.`,
          `Józan ésszel: a módusz mindig az adatsor egyik eleme, és a ${f(helyes)} tényleg szerepel a listában.`,
        ],
        terjedelem: [
          `A terjedelem azt mutatja, mekkora távolságra van egymástól a legkisebb és a legnagyobb adat.`,
          `A legnagyobb adat ${Math.max(...adatok)}, a legkisebb ${Math.min(...adatok)}, így a terjedelem ${Math.max(...adatok)} − ${Math.min(...adatok)} = ${f(helyes)}.`,
          `Józan ésszel: a terjedelem nem lehet negatív, és nem nagyobb, mint a legnagyobb adat. A ${f(helyes)} megfelel ennek.`,
        ],
      }[valt],
      jegyezze: 'Átlag: összeg : darabszám. Medián: a rendezett sor közepe. Módusz: a leggyakoribb adat. Terjedelem: legnagyobb − legkisebb.',
    });
  });
}


export default {
  id: 'fv-kombinatorika',
  sor: 'felveteli',
  cim: 'Kombinatorika, valószínűség, statisztika',
  rovid: 'Sorrendek, kiválasztás, számjegyekből képzett számok, valószínűség, átlag, medián, módusz.',
  kulcskeplet: '<span class="keplet-nagy">P = kedvező esetek száma : összes esetek száma</span>',
  kulcsMagyarazat: ['Számold meg az összes lehetséges esetet és a kedvezőket; a lehetőségek számát helyenként szorozd össze.'],
  elmelet: [
    '<strong>Sorrendek:</strong> n különböző dolgot n! = n · (n − 1) · … · 1 féleképpen állíthatsz sorba. Ha két elem mindig egymás mellett áll, kezeld őket egy blokként, és szorozd meg a blokkon belüli sorrendek számával.',
    '<strong>Kiválasztás sorrend nélkül:</strong> előbb számold ki a sorrenddel való kiválasztást (n · (n − 1) · …), aztán oszd el k!-sal.',
    '<strong>Számok képzése:</strong> helyiértékenként számold meg a lehetőségeket, és szorozd össze őket. A megkötéssel rendelkező helyet (pl. páros utolsó számjegy) töltsd ki először.',
    '<strong>Valószínűség:</strong> kedvező esetek : összes eset. Visszatevés nélküli húzásnál a második húzás előtt csökkennek a darabszámok; egymás utáni húzásoknál a valószínűségeket szorozzuk.',
    '<strong>Statisztika:</strong> átlag = összeg : darabszám; medián = a rendezett sor közepe; módusz = a leggyakoribb adat; terjedelem = legnagyobb − legkisebb.',
  ],
  peldak: [
    { cim: 'Sorrend és kiválasztás', feladat: 'a) Hányféleképpen állhat sorba 5 gyerek? b) 7 tanuló közül hányféleképpen választható 3 fős csapat?',
      lepesek: ['a) 5 · 4 · 3 · 2 · 1 = 120.', 'b) Sorrenddel 7 · 6 · 5 = 210, egy csapatot 3! = 6-féle sorrendben számoltunk: 210 : 6 = 35.', 'Ellenőrzés: a csapatok száma kisebb a sorrendes választásoknál: 35 < 210.'] },
    { cim: 'Számjegyek', feladat: 'Az 1, 2, 3, 4, 5 számjegyekből egy-egy számjegyet legfeljebb egyszer felhasználva hány háromjegyű páros szám írható fel?',
      lepesek: ['Az utolsó számjegy páros (2 vagy 4): 2 lehetőség.', 'Az első helyre a maradék 4, a másodikra 3 számjegy közül választunk: 4 · 3 = 12.', '2 · 12 = 24 háromjegyű páros szám.'] },
    { cim: 'Valószínűség és statisztika', feladat: 'a) Egy dobozban 3 piros, 4 fehér és 5 zöld golyó van. Mennyi a valószínűsége, hogy fehéret húzunk? b) Adatok: 2, 5, 3, 5, 4, 5, 1. Mennyi az átlag, a medián és a módusz?',
      lepesek: ['a) 4 kedvező eset 12 közül: 4/12 = 1/3 ≈ 0,333.', 'b) Az összeg 25, 7 adat: átlag = 25 : 7 ≈ 3,57.', 'Rendezve: 1, 2, 3, 4, 5, 5, 5 → medián 4, módusz 5.'] },
  ],
  tipusok: [
    { id: 'K1', nev: 'Sorrendek száma', general: K1 },
    { id: 'K2', nev: 'Kiválasztás sorrend nélkül', general: K2 },
    { id: 'K3', nev: 'Számjegyekből képzett számok', general: K3 },
    { id: 'K4', nev: 'Golyóhúzás, valószínűség', general: K4 },
    { id: 'K5', nev: 'Érmedobás, győzelem esélye', general: K5 },
    { id: 'K6', nev: 'Átlag, medián, módusz, terjedelem', general: K6 },
  ],
  peldaEllenorzes() {
    return [
      { nev: '1. példa: 5!', kapott: fakt(5), vart: 120 },
      { nev: '1. példa: 7 · 6 · 5', kapott: variacio(7, 3), vart: 210 },
      { nev: '1. példa: C(7, 3)', kapott: kombinacio(7, 3), vart: 35 },
      { nev: '2. példa: háromjegyű páros', kapott: 2 * variacio(4, 2), vart: 24 },
      { nev: '2. példa: 4 · 3', kapott: variacio(4, 2), vart: 12 },
      { nev: '3. példa: P(fehér)', kapott: valoszinuseg(4, 12), vart: tisztit(1 / 3) },
      { nev: '3. példa: összeg', kapott: [2, 5, 3, 5, 4, 5, 1].reduce((a, b) => a + b, 0), vart: 25 },
      { nev: '3. példa: medián', kapott: median([2, 5, 3, 5, 4, 5, 1]), vart: 4 },
      { nev: '3. példa: módusz', kapott: modusz([2, 5, 3, 5, 4, 5, 1]), vart: 5 },
      { nev: '3. példa: átlag (2 tizedes)', kapott: Math.round(atlag([2, 5, 3, 5, 4, 5, 1]) * 100) / 100, vart: 3.57 },
    ];
  },
};
