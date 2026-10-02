# Gazdasági matematika – gyakorló

Böngészőben futó gyakorlóoldal a Kodolányi János Egyetem *Gazdasági matematika* tárgyához.
Három téma: **százalékszámítás**, **lineáris függvények**, **lineáris függvények közgazdasági alkalmazása**,
valamint egy 10 feladatos, 20 perces **próbateszt**.

**Élő oldal (GitHub Pages):** https://hkk82.github.io/gazdasagi-matek-gyakorlo/

- Nincs belépés, nincs adatgyűjtés, nincs külső kérés. A haladás csak a hallgató böngészőjében (`localStorage`) mentődik.
- Statikus HTML + CSS + vanilla JavaScript (ES modulok); nincs build lépés és nincs npm-függőség.
- A részletes megrendelői leírás: [SPEC.md](SPEC.md).

## Felépítés

```
index.html            kezdőoldal (témakártyák, haladás, próbateszt)
tema.html?t=<id>      témaoldal: Elmélet röviden / Kidolgozott példák / Gyakorlás
teszt.html            próbateszt
css/style.css         megjelenés (világos/sötét téma, „Nagy betű” mód)
js/lib/               számkezelés, válaszellenőrző, SVG-ábra, haladás, tesztösszeállító
js/temak/             témák (egy téma = egy modul) + index.js (nyilvántartás)
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
- a SPEC kidolgozott példáinak végeredményeit;
- a próbateszt összeállítását (10 feladat, 4/3/3 arány, egyetlen számmező) és a haladás mentését (tároló nélkül is).

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
  tippek: ['1. szint', '2. szint', '3. szint'],
  megoldas: ['1. lépés', '2. lépés'],
  jegyezze: '„Ezt jegyezze meg” mondat a típushoz.',
}
```

   - `tizedes`: a kért pontosság (a tűrés ennek fele);
   - `elojel: 'nagysag'` – „hány százalékkal csökkent”: a pozitív a jó, a negatívat megjegyzéssel elfogadja;
   - `elojel: 'elojeles'` – „változás (%)”: az előjel számít, a rossz előjelre figyelmeztet.

3. Vegye fel a modult a `js/temak/index.js` `TEMAK` listájába, és a `tests/generatorok.test.js` `VARHATO`
   táblájába írjon független ellenőrzést az új típusokhoz. Futtassa: `node --test`.
