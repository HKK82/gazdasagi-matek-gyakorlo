# CLAUDE.md – útmutató a felhős (és helyi) Claude Code munkamenetekhez

Böngészőben futó gyakorlóoldal a Kodolányi János Egyetem „Gazdasági matematika” tárgyához. Felhasználók: felnőtt, levelezős hallgatók, sokan nem matematikusok. **A követelmények és a teljes szakmai tartalom a [SPEC.md](SPEC.md)-ben vannak – abból dolgozz**, ez a fájl csak a munkamódot és a tanulságokat rögzíti. A hallgatóknak szóló szövegek magyarul, barátságos, **semleges felszólító formában** íródnak („Írja be…”, „Nézze meg…”), magázás nélkül; rövid mondatok, túlzott lelkesedés nélkül.

## Felépítés

```
index.html, tema.html?t=<id>, teszt.html, ai.html    oldalak (statikus, GitHub Pages a main gyökeréről)
felveteli.html, felveteli-teszt.html                  a „Felvételi (8. évf.)” szekció: kezdőlap és próba felvételi (a témák a tema.html-en nyílnak)
css/style.css                                         megjelenés (világos/sötét, „Nagy betű”)
js/temak/                                             témák: szazalek, linearis, kozgazdasag, penzugy, exponencialis, fuggvenyvizsgalat, valoszinuseg (+ index.js, seged.js)
js/felveteli/                                         felvételi-témák (8. évf.): szamok, mertekegyseg, szoveges, geometria, kombinatorika, aranyok (+ index.js, seged.js)
js/lib/                                               szam, ellenorzo, abra (koordinataRendszer: görbék/sávok/vízszintes vonal, eloszlasAbra), haladas, teszt-osszeallito, gemini, ai-kulcs, markdown-lite
js/oldal/                                             oldalkezelők (tema.js, teszt.js, kezdo.js, ai-panel.js, ai-beallitas.js, feladat-nezet.js, kozos.js)
tests/                                                node --test egységtesztek
```

- Csak HTML + CSS + vanilla JS (ES modulok). **Nincs build lépés, nincs npm-függőség.** Nincs belépés, nincs analitika. Kivétel: az opcionális AI-asszisztens (SPEC 9.), amely csak a hallgató saját API-kulcsával küld adatot a Google Gemini felé.
- Új téma = új modul a `js/temak/` alatt + felvétel az `index.js` `TEMAK` listájába (a modul szerkezete a README-ben).

## Tesztek és ellenőrzés

- `node --test` (Node 20+), jelenleg 289 teszt, mind zöld legyen push előtt. Futásidő ~1–2 perc; hosszabb parancsnál adj elég időkorlátot.
- A generált feladatok helyes válaszát a tesztek **a feladat szövegéből visszaolvasott számokból, a generátortól függetlenül** számolják újra (`tests/generatorok.test.js` az 1–3. témára; a 4–7. témának külön, toleranciát kezelő fájlja van: `penzugy`, `exponencialis`, `fuggvenyvizsgalat`, `valoszinuseg`). A 6. témánál a darabszám-határokat egész értékek behelyettesítésével ellenőrizzük, nem a generátor képletével.
- `tests/magyarazat.test.js` minden feladattípusra ellenőrzi a „Miért így?” magyarázatot, az ellenpróbát és a kérdés formájú első tippet. Új típusnál ezek kötelezők.
- UI-ellenőrzés böngészőben: `python3 -m http.server 8765` a repo gyökerében, majd Playwright (Chromium előre telepítve: `$PLAYWRIGHT_BROWSERS_PATH/chromium`, modul: `/opt/node-tools/node_modules/playwright`; ESM-ből `import pkg from '…/playwright/index.js'; const { chromium } = pkg;`, `executablePath` megadásával). Nézd meg asztali (1280 px) és mobil (375 px) nézetben, ellenőrizd, hogy nincs vízszintes görgetés és konzolhiba. Ne futtass `playwright install`-t.

## Új feladattípus szabályai (SPEC 3.2)

Minden típus kapjon: `magyarazat` (3–5 bekezdés, a feladat konkrét számaival, 100-zal szemléltetés, „Józan ésszel” zárás), számmezőnként `ellenproba: (v) => 'Ellenpróba: …'` (a hallgató saját számával számol), tippeket úgy, hogy **az első tipp kérdés** legyen (2–3 szint), és `jegyezze` mondatot. A képletes levezetés (`megoldas`) marad, a magyarázat kiegészíti.

### Magyar nyelvi csapdák (teszt őrzi)
- **Számok után ne tegyél toldalékot** (`6-ed`, `60-at`, `1,08-del`): a toldalék a kiejtéstől függ. Fogalmazz át („a szorzóval (1,08)”). Kivétel: 0, 1, 100 és a rögzített évek (`2023-ban`).
- Kiírt mértékegység után sincs kötőjeles toldalék (`perc-ot` helytelen).
- Névelő számok előtt: használd a `az()` / `Az()` segédet (`seged.js`).

## Munkamenet és git

- A munkamenet kijelölt ágán dolgozz (a rendszerprompt megmondja), `main`-re közvetlenül ne pusholj. **Pull requestet csak kérésre nyiss, összevonni (merge) csak kifejezett engedéllyel**: a `main` az élő oldal. Ha a kijelölt ág PR-ja már össze van vonva, indítsd újra az ágat a friss `main`-ből (`git fetch origin main && git checkout -B <ág> origin/main`).
- A GitHub-műveletek az `mcp__github__*` eszközökkel mennek (`gh` nincs). A commit üzenetek végére kerül a rendszerüzenet szerinti attribúció.
- A felhős környezetből **nem érhető el** az élő oldal (github.io) és a Google dokumentáció (ai.google.dev): az élő működést nem tudod ellenőrizni, ezt mondd ki a felhasználónak.
- Ne használj `pkill -f`-t a saját parancsod szövegére, és ne hagyj olvasásra váró parancsot (`cat > fájl` bemenet nélkül) – lefagyasztja a shellt.

## Üzemeltetési tanulságok

- **Gyorsítótár:** a GitHub Pages ~10 percig engedi gyorsítótárazni a fájlokat. Frissítés után a böngészőben egy ideig keveredhet a régi és az új modul (pl. az új `tema.js` olyan függvényt importál, ami a régi `kozos.js`-ben nincs), ilyenkor az oldal üres marad („Téma” cím, nincs tartalom). Megoldás a felhasználónak: Ctrl+F5 vagy ~10 perc várakozás. Nagyobb szerkezeti változásnál fontold meg a verziószámot a modulok után.
- **Tálalás helyben:** az ES modulok miatt fájlként megnyitva nem működik, webszerver kell.
- A haladás és a legjobb teszteredmény `localStorage`-ban van; ha nem elérhető, memóriába esik vissza – az oldalnak enélkül is működnie kell.

## AI-asszisztens (Gemini)

- Kód: `js/lib/gemini.js` (kliens, rendszerutasítás), `js/lib/ai-kulcs.js` (kulcstárolás), `js/oldal/ai-panel.js` (panel a Gyakorlás fülön), `ai.html` + `js/oldal/ai-beallitas.js` (útmutató és beállítás).
- A kulcs csak a böngészőben marad (alapból `sessionStorage`), a Google felé a `x-goog-api-key` **fejlécben** megy, soha nem az URL-ben vagy a törzsben. Az AI-válasz megjelenítése csak `textContent`-tel (nincs `innerHTML`).
- A kulcs alakellenőrzése **szándékosan engedékeny** (a Google kulcsformátuma változik; egy szigorú `AIza…` ellenőrzés valódi kulcsot is elutasított). Az érvényességet a „Kulcs kipróbálása” (valódi hívás) dönti el.
- A modellnevek (`MODELLEK`: `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.5-flash-lite`) a Python-vizsgafelkészítő repóból származnak, **élő hívással nem lettek ellenőrizve**. Kvótahiba (429) és elérhetetlen modell (404/5xx) esetén a következő modellre lép. Ha a Google átnevez egy modellt, a listát kell módosítani.
- A modell a helyes végeredményt csak a rendszerutasításban kapja meg, és csak a megoldás megnézése után / kérésre árulhatja el. A próbatesztben nincs AI.

## v4 témák (5–7.) – tanulságok

- **GeoGebra**: az oldal nem ágyazza be (nincs külső kérés); a feladat `geogebra: { sorok, megjegyzes }` mezője a „GeoGebrában így” dobozt adja (`geogebraElem`, a Gyakorlásban és a próbatesztben is). A beírandó sorokban **tizedespont** van, a tesztek ezt ellenőrzik.
- **Évszám + toldalék** (`1993-ban`, `2010-ben`): a `seged.js` `evben()` adja a helyes toldalékot a kiejtés szerint; a nyelvi teszt csak ezt a formát engedi évszám után.
- **6. téma generátora**: a profitfüggvény a csúcsokból épül (pr'(x) = −3(x − m₁)(x − m₂), m₁ + m₂ páros), a metszéspontok nem egészek, a maximum kerek. A darabszám-határok mindig egész behelyettesítésből jönnek (`egeszHatarok`), nem a metszéspont kerekítéséből.
- **Tűrések**: `abszTures` (±1 Ft), `relTures` (±0,5 %, az E7 kerekített szorzójához), hibánként `tures` (pl. a százalék alakban kerekítve beírt valószínűség). A tört alak (`3/5`) az `ertelmez`-ben van; a csonka tört (`3/`) érvénytelen.
- **Változatválasztás `probal`-on kívül**: ha egy típus több története közül választ (pl. profit vagy átlagköltség), a változatot a `probal` *előtt* sorsold, különben a gyakrabban érvényes változat felülreprezentált lesz.
- **Menü**: a témák a fejléc „Témák” lenyílójában vannak (`.nav-temak`); új téma = új link mind az 5 HTML-ben (index, tema, teszt, ai) – a `tema.js` az aktív linket magától jelöli.
- **Próbateszt**: 7 témából legalább 1, legfeljebb 2 feladat; a csak választós típusok (`E9`, `V8`, `L8`) `tesztbe: false`.

## Felvételi szekció (8. évfolyam, `js/felveteli/`)

- A tartalom a központi írásbeli felvételi matematika feladatsorok (Mat1/Mat2, 2004–2023; a PDF-ek a felhasználó zip-jében voltak, nincsenek a repóban) visszatérő feladattípusaiból készült, **generált, véletlen számokkal** – nem az eredeti feladatok másolata. Ábrás/táblázatos eredeti feladatok szövegesen jelennek meg.
- Ugyanaz a modulszerkezet, mint a `js/temak/`-ban; a témák `id`-je `fv-` előtagú, és `sor: 'felveteli'` mezőt kapnak. `temaKeres` mindkét listában keres, így a `tema.html?t=fv-…` változtatás nélkül működik. A `tema.js` a `sor` alapján tegező szöveget használ, a vissza-link `felveteli.html`-re mutat, és a `sor` az AI-asszisztensnek is átmegy (tegező, 8. osztályos hangnem).
- **Tegező forma** (a felhasználók 13–14 évesek, mint a valódi feladatlapon: „Határozd meg…”), a gazdasági részek semleges felszólító formájával szemben. A megosztott `ellenorzo.js` hibaüzenetei (pl. „Még nem írt be választ”) viszont a gazdasági részével közösek, ezek maradtak.
- Próba felvételi: `felveteli-teszt.html` (`<body data-sor="felveteli">`) ugyanazt a `teszt.js`-t használja, mint a `teszt.html`; 12 feladat (mind a 6 témából 2), 45 perc (`FELV_TESZT_*`), külön legjobb eredmény (`haladas.js`: `legjobbTeszt('felvTeszt')`). A felvételi haladás törlése (`torolFelveteli`) a gazdasági haladást nem érinti.
- Tört alakú eredmény (pl. 7/6) a `szam.js` `ertelmez`-ével megy; ilyenkor `tizedes: 3` és `TORT_UTASITAS` a gyakorlásban.
- Tesztek: `tests/felveteli.test.js` (a szövegből visszaolvasott számokkal, nyers erővel/szimulációval újraszámolva: sorrendek felsorolása, kis kockák felszíne, percenkénti mozgás-szimuláció stb.); a „Miért így?” és a nyelvi csapdák tesztje (`magyarazat.test.js`) és a példák tesztje (`peldak.test.js`) a felvételi témákra is fut.
- **Nyelvi csapda a szövegekben:** a „−” művelet-jel a `segito.js` `szamok()`-jában előjelként olvasódik (a felvételi tesztek `Math.abs`-t használnak); évszámos/egységes mondatoknál a számok után nincs toldalék (`6-ed` helyett átfogalmazás).

## Ismert nyitott pontok
- Az AI élő kipróbálása valódi kulccsal még nem történt meg a fejlesztői környezetből (hálózati korlát miatt).
- A „Miért így?” magyarázatok a SPEC 4–8 mondatánál kissé hosszabbak (5–11, a szállodás összetett feladaté 16); a teszt legfeljebb 14, illetve 18 mondatot enged.
