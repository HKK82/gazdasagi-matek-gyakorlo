# Gazdasági matematika – gyakorló

Böngészőben futó gyakorlóoldal a Kodolányi János Egyetem *Gazdasági matematika* tárgyához.
Tíz téma: **százalékszámítás**, **lineáris függvények**, **lineáris függvények közgazdasági alkalmazása**,
**pénzügyi számítások (kamatos kamat)**, **exponenciális függvények**, **közgazdasági függvények vizsgálata**
(harmadfokú profit-, átlagköltség-függvény) **klasszikus valószínűség / várható érték**, **mintavételek és eloszlásuk** (hipergeometrikus, binomiális), **normális eloszlás** és **döntéselmélet**, valamint egy 10 feladatos, 20 perces **próbateszt**.

**Élő oldal (GitHub Pages):** https://hkk82.github.io/gazdasagi-matek-gyakorlo/

- Nincs belépés, nincs adatgyűjtés, nincs külső kérés. A haladás csak a hallgató böngészőjében (`localStorage`) mentődik.
- Az 5., 6., 8. és 9. téma feladatainál lenyitható **„GeoGebrában így”** doboz mutatja a kimásolható beírandó sorokat (a GeoGebra nincs beágyazva, nincs külső kérés); a megoldás után SVG-ábra mutatja a függvényt és a keresett pontot.
- Minden feladattípushoz **„Miért így?” szöveges magyarázat**, hibás válaszra **számszerű ellenpróba** (a hallgató saját számával), és kérdés formájú első tipp tartozik.
- Statikus HTML + CSS + vanilla JavaScript (ES modulok); nincs build lépés és nincs npm-függőség.
- A részletes megrendelői leírás: [SPEC.md](SPEC.md).

## AI-asszisztens (opcionális)

A Gyakorlás fülön minden feladat alatt megnyitható egy AI-panel (Google Gemini), amely a feladat és a hallgató beírt válasza alapján magyaráz, rávezet, megmutatja számokkal a hiba okát. Működéséhez a hallgatónak **saját, ingyenes Gemini API-kulcs** kell; az `ai.html` oldal lépésről lépésre bemutatja, hogyan kérhet ilyet, és itt lehet kipróbálni.

- A kulcs csak a hallgató böngészőjében marad (alapból `sessionStorage`, kérésre `localStorage`), a kérés fejlécében megy a Google felé. Szervert nem használunk, adatot nem gyűjtünk. Automatikus hívás nincs, a próbatesztben nincs AI.
- Modellek (`js/lib/gemini.js`, `MODELLEK`): olcsó „flash-lite” modellek sorban, mert ezekhez tartozik a legtöbb ingyenes kérés; 429/404/5xx esetén a következő modellt próbálja. A Google modellnevei változhatnak: ilyenkor elég a listát módosítani.
- A rendszerutasítás a SPEC 3.2 hangnemében íródott; a helyes végeredményt csak a rendszerutasításban kapja meg a modell, és csak a megoldás megnézése után / kérésre árulhatja el.
- A válasz megjelenítése biztonságos (`textContent`, csak **vastag**, `kód` és felsorolás jelölés).

## Felépítés

```
index.html            kezdőoldal (témakártyák, haladás, próbateszt)
tema.html?t=<id>      témaoldal: Elmélet röviden / Kidolgozott példák / Gyakorlás
teszt.html            próbateszt
felveteli.html        felvételi gyakorló (8. évfolyam): hat témakör, próba felvételi (felveteli-teszt.html, 45 perc)
ai.html               AI-asszisztens: útmutató az API-kulcshoz és beállítás
css/style.css         megjelenés (világos/sötét téma, „Nagy betű” mód)
js/lib/               számkezelés, válaszellenőrző, eloszlások (binomiális, hipergeometrikus, normális), SVG-ábra, haladás, tesztösszeállító, Gemini-kliens, kulcstárolás
js/temak/             témák (egy téma = egy modul: szazalek, linearis, kozgazdasag, penzugy, exponencialis, fuggvenyvizsgalat, valoszinuseg, mintavetel, normalis, donteselmelet) + index.js
js/felveteli/         a felvételi-gyakorló témái (ugyanaz a modulszerkezet, id: fv-…) + index.js
js/oldal/             az egyes oldalak kezelőkódja
tests/                node --test egységtesztek
```

## Kipróbálás helyben

Az ES modulok miatt az oldalt webszerverről kell megnyitni (fájlként dupla kattintással nem működik), pl.:

```
python -m http.server 8000
```

majd a böngészőben: http://localhost:8000/

## Tesztek

Node.js 20 vagy újabb kell, függőség nincs:

```
node --test
```

A tesztek ellenőrzik:

- a válaszellenőrzőt: tizedesvessző/-pont, ezres szóköz, mértékegység- és %-utótag, tűrés (a pontosabb válasz is jó), előjelszabályok, képlet elutasítása;
- **minden feladattípusból 300 generált feladatot**: a helyes választ a feladat *szövegéből* (a grafikonos feladatnál az SVG-ábrából) visszaolvasott számokból, a generátortól függetlenül újraszámolják; a szövegben csak „szép” (legfeljebb 2 tizedes) számok vannak; a tipikus hibás válaszok különböznek a jótól, és beírva a célzott visszajelzést adják;
- a SPEC kidolgozott példáinak végeredményeit (a 4. témánál a gyakorló párok és a banki ajánlatok fix feladatait is);
- minden típus magyarázatát, ellenpróbáját és rávezető első tippjét (`tests/magyarazat.test.js`), a pénzügyi téma generátorait külön (`tests/penzugy.test.js`);
- az AI-klienst hálózat nélkül (`tests/gemini.test.js`): a kulcs csak a fejlécben megy, modellváltás kvótahibánál, hibaüzenetek, kulcstárolás, biztonságos megjelenítés;
- a 4–7. témát a saját, független fájljában (`penzugy`, `exponencialis`, `fuggvenyvizsgalat`, `valoszinuseg`): a darabszám-határokat egész értékek behelyettesítésével, a valószínűségeket tört alakban is;
- a 8–10. témát (`eloszlas`, `mintavetel`, `normalis`, `donteselmelet`): a helyes választ a szövegből (a döntési táblázatot a HTML-ből) visszaolvasva, független számolással;
- a próbateszt összeállítását (10 feladat, 10 témából pontosan 1, egyetlen számmező) és a haladás mentését (tároló nélkül is).

## Új téma hozzáadása

1. Hozzon létre egy modult a `js/temak/` mappában (minta: `szazalek.js`), amelynek alapértelmezett exportja:

```js
export default {
  id: 'uj-tema',                 // URL-ben: tema.html?t=uj-tema
  cim: 'A téma címe',
  rovid: 'Egy mondatos leírás a kártyára.',
  kulcskeplet: '<span class="keplet-nagy">…</span>',   // piros keretben jelenik meg
  kulcsMagyarazat: ['…'],         // a képlet alatti magyarázó sorok (HTML)
  elmelet: ['…', '…'],            // 3–6 pont (HTML)
  peldak: [{ cim, feladat, lepesek: ['1. lépés', '2. lépés'], abra? }],
  tipusok: [{ id: 'U1', nev: 'Típus neve', general: (rng) => feladat, tesztbe?: false }],
  elmeletAbra?: () => '<svg …>', elmeletAbraFelirat?: '…',   // az Elmélet fül ábrája
  fixek?: [{ id, nev, epit: () => feladat }],                // fix számokkal elérhető feladatok
  peldaEllenorzes: () => [{ nev, kapott, vart }],   // a kidolgozott példák végeredményei
};
```

2. A `general(rng)` egy feladatot ad vissza:

```js
{
  szoveg: 'A feladat szövege (HTML).',
  utasitas?: 'Csak a gyakorlásban megjelenő kiegészítő utasítás.',
  abra?: '<svg …>',               // feladathoz tartozó ábra (pl. koordinataRendszer(...))
  abraMegoldas?: '<svg …>',       // a megoldás után megjelenő ábra
  mezok: [
    szamMezo({ id, cimke, helyes, tizedes, egyseg, elojel: 'sima' | 'nagysag' | 'elojeles',
               hibak: [{ ertek, uzenet }] }),          // tipikus hibák célzott üzenettel
    valasztoMezo({ id, cimke, opciok: [{ szoveg, helyes, uzenet? }] }),
  ],
  tippek: ['1. szint – mindig kérdés, ami rávezet', '2. szint', '3. szint'],
  magyarazat: ['„Miért így?” – 3–5 bekezdés szavakkal, a feladat számaival (HTML)'],
  geogebra?: { sorok: ['f(x)=100*1.124^x', 'f(20)'], megjegyzes?: '…' },   // „GeoGebrában így” doboz (tizedespont!)
  megoldas: ['1. lépés', '2. lépés'],
  jegyezze: '„Ezt jegyezze meg” mondat a típushoz.',
}
```

   - `tizedes`: a kért pontosság (a tűrés ennek fele);
   - `elojel: 'nagysag'` – „hány százalékkal csökkent”: a pozitív a jó, a negatívat megjegyzéssel elfogadja;
   - `elojel: 'elojeles'` – „változás (%)”: az előjel számít, a rossz előjelre figyelmeztet.

3. Vegye fel a modult a `js/temak/index.js` `TEMAK` listájába, és a `tests/generatorok.test.js` `VARHATO`
   táblájába írjon független ellenőrzést az új típusokhoz. Futtassa: `node --test`.
