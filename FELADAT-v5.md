# Feladat: v5 – az utolsó három téma (8–10.)

> **Feltétel a munka megkezdéséhez:** ezt a munkát a **Claude Code felhős (cloud) kerete terhére** kell elvégezni. Ha a munkamenet nem a felhős környezetben fut (hanem pl. helyi gépen, az előfizetéses keretből), **ne kezdj bele**, csak írd ki: „Ezt a feladatot a felhős munkamenetben indítsd el.”

## Mit kell csinálni

Olvasd el a **CLAUDE.md**-t (munkamód, tesztek, a v4 tanulságai), majd valósítsd meg a **SPEC.md** alábbi részeit:

1. **Közös szabályok a v5 témáihoz:** új modul `js/lib/eloszlas.js` (binomiális, hipergeometrikus, normális eloszlásfüggvény és inverze – függőség nélkül, egységtesztekkel a SPEC ellenőrzött értékeire).
2. **5.8 Téma 8 – Mintavételek és eloszlásuk** (`js/temak/mintavetel.js`, M1–M9 típusok).
3. **5.9 Téma 9 – Normális eloszlás** (`js/temak/normalis.js`, N1–N9 típusok).
4. **5.10 Téma 10 – Döntéselmélet** (`js/temak/donteselmelet.js`, D1–D8 típusok; a döntés neve választós mezővel, holtversenynél „X vagy Y” is választható).
5. **SVG-ábrák** (`abra.js` bővítése): diszkrét eloszlás oszlopdiagramja kiszínezett oszlopokkal; normális harang kiszínezett területtel; döntési táblázat kiemelésekkel (ez lehet HTML-táblázat is).
6. **„GeoGebrában így” doboz** a 8. és 9. témánál a GeoGebra Valószínűség-számítás nézetének lépéseivel (eloszlás neve, paraméterek, melyik gomb, mit írunk be).
7. **Próbateszt** (4.3): 10 témából 10 feladat, **minden témából pontosan 1**; a 10. témából az optimista elv ne kerüljön a próbatesztbe.
8. A kezdőoldalon és a „Témák” menüben a három új téma, a `TEMAK` listában a sorrend 1–10.

## Követelmények

- Minden új típus kapja meg: „Miért így?” magyarázat (konkrét számokkal, szemléltetés, „Józan ésszel”), számmezőnként ellenpróba a hallgató saját számával, első tipp kérdés formában, „Ezt jegyezze meg” mondat (SPEC 3.2).
- A SPEC táblázataiban felsorolt **tipikus hibás válaszokat** az ellenőrző ismerje fel, és célzott visszajelzést adjon (pl. „több mint 2” → a hallgató a 2-t is beleértette; rossz irányú fordított kérdés; a pesszimista „legrosszabbak legrosszabbja”).
- A **kidolgozott példák** pontosan a SPEC-ben megadott számokkal szerepeljenek (ezek ellenőrzött végeredmények: a munkafüzetek és Python/scipy alapján újraszámolva).
- Tesztek (`node --test`): az `eloszlas.js` függvényei a SPEC példáinak értékeit adják 4 tizedesre; minden generátorra a helyes válasz **a feladat szövegéből visszaolvasott számokból, a generátortól függetlenül** újraszámolva; a magyar nyelvi csapdák tesztje az új témákra is fusson. Push előtt minden teszt legyen zöld.
- UI-ellenőrzés Playwright-tal asztali (1280 px) és mobil (375 px) nézetben: nincs vízszintes görgetés, nincs konzolhiba, az SVG-k és a döntési táblázat teljesen látszanak (mobilon a táblázat ne lógjon ki).
- Nincs új külső függőség, nincs GeoGebra-beágyazás, nincs külső kérés. A meglévő felvételi szekciót (`js/felveteli/`) ne érintsd.
- A CLAUDE.md-t frissítsd (témalista, tesztszám, új tanulságok).

## Átadás

- A kijelölt ágon dolgozz, a végén nyiss **pull requestet** a `main`-re rövid magyar leírással (mi készült el, hány teszt, mit nem tudtál ellenőrizni). **Ne vond össze (merge)** – azt az oktató hagyja jóvá.
