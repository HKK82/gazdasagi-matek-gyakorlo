# Feladat: v4 – három új téma (5–7.)

> **Feltétel a munka megkezdéséhez:** ezt a munkát a **Claude Code felhős (cloud) kerete terhére** kell elvégezni. Ha a munkamenet nem a felhős környezetben fut (hanem pl. helyi gépen, az előfizetéses keretből), **ne kezdj bele**, csak írd ki: „Ezt a feladatot a felhős munkamenetben indítsd el.”

## Mit kell csinálni

Olvasd el a **CLAUDE.md**-t (munkamód, tesztek, tanulságok), majd valósítsd meg a **SPEC.md** alábbi részeit:

1. **5.5 Téma 5 – Exponenciális függvények** (`js/temak/exponencialis.js`, E1–E9 típusok)
2. **5.6 Téma 6 – Közgazdasági függvények vizsgálata** (`js/temak/fuggvenyvizsgalat.js`, G1–G8 típusok)
3. **5.7 Téma 7 – Klasszikus valószínűség, valószínűségi változó** (`js/temak/valoszinuseg.js`, V1–V9 típusok)
4. A **„Közös szabályok a v4 témáihoz”** szakasz: „GeoGebrában így” doboz, SVG-ábrák (az `abra.js` bővítése: exponenciális görbe, harmadfokú/átlagköltség-függvény szélsőértékkel és metszéspontokkal, eloszlás-oszlopdiagram), egész darabszámos határok.
5. **Próbateszt** (4.3): 7 témából 10 feladat, minden témából legalább 1, egy témából legfeljebb 2.
6. A kezdőoldalon a három új téma kártyája, a `js/temak/index.js` `TEMAK` listájában a sorrend: 1–7.
7. A valószínűségeknél az ellenőrző fogadja el a **tört alakot** is (`3/5`, `1/16`) – ez a `js/lib/ellenorzo.js` bővítése, teszttel.

## Követelmények

- Minden új típus kapja meg: „Miért így?” magyarázat (konkrét számokkal, 100-zal szemléltetés, „Józan ésszel”), számmezőnként ellenpróba a hallgató saját számával, első tipp kérdés formában, „Ezt jegyezze meg” mondat (SPEC 3.2).
- A SPEC táblázataiban felsorolt **tipikus hibás válaszokat** az ellenőrző ismerje fel, és célzott visszajelzést adjon.
- A **kidolgozott példák** pontosan a SPEC-ben megadott számokkal szerepeljenek (ezek ellenőrzött végeredmények).
- Tesztek (`node --test`): minden generátorra a helyes válasz **a feladat szövegéből visszaolvasott számokból, a generátortól függetlenül** újraszámolva; a 6. témánál a darabszám-határokat egész értékek behelyettesítésével ellenőrizd; a magyar nyelvi csapdák (számok utáni toldalék) tesztje az új témákra is fusson. Push előtt minden teszt legyen zöld.
- UI-ellenőrzés Playwright-tal asztali (1280 px) és mobil (375 px) nézetben: nincs vízszintes görgetés, nincs konzolhiba, az SVG-k teljesen látszanak.
- Nincs új külső függőség, nincs GeoGebra-beágyazás, nincs külső kérés.
- A CLAUDE.md-t frissítsd (témalista, tesztszám, új tanulságok).

## Átadás

- A kijelölt ágon dolgozz, a végén nyiss **pull requestet** a `main`-re rövid magyar leírással (mi készült el, hány teszt, mit nem tudtál ellenőrizni). **Ne vond össze (merge)** – azt az oktató hagyja jóvá.
