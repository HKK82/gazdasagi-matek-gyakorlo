# Felvételi gyakorló – 8. évfolyam matematika

Böngészőben futó gyakorlóoldal a központi írásbeli felvételi (Mat1/Mat2) mintájára: hat témakör (számok és törtek, mértékegységek, szöveges feladatok, geometria, kombinatorika/valószínűség/statisztika, százalék/arány/mozgás), 32 feladattípus véletlen számokkal, tippek, számszerű ellenpróba, „Miért így?” magyarázat, 45 perces próba felvételi.

Csak HTML + CSS + vanilla JS (ES modulok), nincs build lépés, nincs belépés, nincs adatgyűjtés. A haladás a böngésző `localStorage`-ában van. Az AI-asszisztens opcionális: csak a diák saját Gemini API-kulcsával küld adatot a Google felé.

## Kipróbálás helyben
Az ES modulok miatt webszerver kell: `python3 -m http.server 8765`, majd http://localhost:8765/

## Tesztek
`node --test` (Node 20+). A generált feladatok helyes válaszát a tesztek a feladat szövegéből visszaolvasott számokból, a generátortól függetlenül számolják újra.

## Új téma
Új modul a `js/felveteli/` alatt (minta: `szamok.js`), felvétel a `js/felveteli/index.js` listájába, link a három HTML menüjébe.

## Közzététel
GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`. Cím: https://hkk82.github.io/matek_felveteli/
