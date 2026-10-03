# Gazdasági matematika gyakorló – fejlesztési leírás

Ez a fájl a megrendelő (oktató) igényeit és a teljes szakmai tartalmat írja le. A fejlesztés ebből dolgozzon.

## 1. Cél és közönség

- Böngészőben futó **gyakorlóoldal** a Kodolányi János Egyetem „Gazdasági matematika” tárgyához.
- Felhasználók: felnőtt, levelezős hallgatók, sokan **nem matematikusok**. A hangnem barátságos, türelmes, magázó („Önök/Ön” helyett elég a semleges, felszólító forma: „Írja be…”, „Nézze meg…”).
- Az oktató **online órán** is használja, ezért kivetítve is jól olvasható legyen (nagy betű, tiszta elrendezés).
- Első verzió (v1, kész): **3 téma**. **v2: 4. téma – Pénzügyi számítások (kamatos kamat)**, lásd 5.4. Később újabb témák jönnek → a tartalom legyen könnyen bővíthető (téma = külön adatfájl/modul).

## 2. Technikai keretek

- **Statikus oldal**, GitHub Pages-en fut a repo gyökeréből (`main` / root). Kezdőoldal: `index.html`.
- Csak HTML + CSS + vanilla JavaScript (ES modulok). **Nincs build lépés, nincs npm-függőség** a futtatáshoz.
- Külső könyvtár nem kell. Ha mégis (pl. képletekhez KaTeX), csak megbízható CDN-ről, rögzített verzióval – de előnyben a sima HTML (`<sub>`, `·`, `−`).
- **Belépés nincs.** A haladás csak a hallgató saját böngészőjében (`localStorage`) mentődik; ha nem elérhető, az oldal akkor is működjön.
- **Nincs adatgyűjtés**, nincs analitika, nincs külső kérés – kivéve az opcionális AI-asszisztenst (9. fejezet), amely csak a hallgató saját API-kulcsával, az ő kérésére küld adatot a Google Gemini felé.
- Magyar felület, magyar számformátum (tizedesvessző a kijelzésben).
- Reszponzív: telefonon is használható (min. 360 px szélesség), vízszintes görgetés nélkül.
- Világos és sötét téma (`prefers-color-scheme`).
- Akadálymentesség: billentyűzettel kezelhető, látható fókusz, megfelelő kontraszt, `aria-live` a visszajelzésekhez.
- Tesztek: a feladatgenerátorokhoz és a válaszellenőrzőhöz **`node --test`** alapú egységtesztek (`tests/`), függőség nélkül. A tesztek ellenőrizzék, hogy minden generált feladat helyes, „szép” számokat ad, és a tipikus hibás válaszokat felismeri.

## 3. Oldalszerkezet

1. **Kezdőoldal** (`index.html`): rövid bemutatkozás, a 3 téma kártyája (cím, rövid leírás, saját haladás %), és a **Próbateszt** gomb.
2. **Témaoldal** (pl. `tema.html?t=szazalek` vagy külön oldalak), fülekkel vagy szakaszokkal:
   - **Elmélet röviden** – a kulcsképlet kiemelve, 3–6 pontban a lényeg (lásd 5. fejezet).
   - **Kidolgozott példák** – a lenti példafeladatok lépésenként, „Következő lépés” gombbal kinyitható megoldással.
   - **Gyakorlás** – véletlenszámos feladatok feladattípusonként; egyszerre egy feladat; „Ellenőrzés”, „Tipp”, „Megoldás mutatása”, „Új feladat”.
3. **Próbateszt** (`teszt.html`): Moodle-szerű vizsgagyakorlás (lásd 4.3).

### 3.1 Gyakorlás működése

- Feladattípusonként válogatható, vagy „vegyes” mód.
- Ellenőrzéskor:
  - **jó válasz** → rövid megerősítés + egy „Ezt jegyezze meg” mondat a típushoz;
  - **ismert tipikus hiba** (lásd az egyes típusoknál) → **célzott** visszajelzés, ami megmondja, mi a gondolkodási hiba (nem csak „rossz”);
  - egyéb rossz válasz → általános tipp, újrapróbálás.
- **Tipp** gomb: lépcsőzetes, 2–3 szintű rávezetés (pl. 1. „Ki a 100 %?”, 2. „Régi értéket keres → osztás”, 3. a konkrét művelet).
- **Megoldás mutatása**: teljes, lépésenkénti levezetés.
- A haladás feladattípusonként: hány jó megoldás (pl. 3 egymás utáni jó után a típus „megy” jelzést kap).

### 3.2 Részletes, szöveges magyarázatok (v2 – MINDEN témára, a meglévő 1–3. témára is)

A hallgatók nagy része nem matematikus. A v1 megoldásai helyesek, de túl tömörek és képletszerűek („P₀ = P₁ : q”). Minden feladattípushoz kell egy **érthető, hétköznapi nyelvű magyarázat** is – úgy, ahogy egy türelmes tanár élőszóban elmondaná.

Minden feladattípus kapja meg:

1. **„Miért így?” magyarázat** (külön gomb/lenyitható rész a megoldás mellett, a megoldás után automatikusan is felkínálva): 4–8 rövid mondat, **szavakkal**, a feladat konkrét számaival. Szerkezete:
   - **Mit kérdeznek, és mi az ismeretlen?** (pl. „A régi árat keressük – ez a 100 %.”)
   - **A gondolat hétköznapi nyelven** (pl. „Az engedmény után a régi árnak csak egy részét fizetjük…”).
   - **Szemléltetés 100-zal vagy kerek számmal**, ahol lehet (a tanár kedvenc trükkje): „Ha a régi ár 100 € lenne, most 95 €-t fizetnénk…”.
   - **Miért ez a művelet** (szorzás/osztás/hatvány/gyök/logaritmus) – egy mondatban, képlet nélkül is.
   - **Józan ész ellenőrzés**: nagyobb vagy kisebb lett-e, mint vártuk, és miért.
2. **Hibás válasznál számszerű ellenpróba**: ne csak azt írja ki, hogy rossz, hanem **mutassa meg a hallgató saját számával**, miért nem stimmel (pl. „Ha az eredeti ár 4588,5 € lett volna, az 5 %-os engedmény után 4588,5 · 0,95 = 4359,08 € lenne, nem 4370 €.”).
3. **Lépcsőzetes tippek**: az első tipp mindig **kérdés** legyen, ami rávezet (pl. „Ki a 100 %?”, „Melyik betű az ismeretlen a képletben?”), ne rögtön a képlet.
4. A meglévő képletes levezetés maradjon meg – a szöveges magyarázat **kiegészíti**, nem helyettesíti.
5. Nyelv: rövid mondatok, magázás nélküli semleges felszólító forma, szakszó csak magyarázattal (pl. „kamattényező, vagyis amivel szorzunk”). Kerülje a túlzott lelkesedést és a töltelékszöveget.

**Minta – T5 (csökkenés, régi érték): „Egy laptop ára 5 %-os árengedmény után 4370 €. Mennyi volt az eredeti ára?”**

> **Miért így?**
> A régi, eredeti árat keressük – ez a 100 %. Az engedmény után nem a teljes árat fizetjük, hanem annak csak a 95 %-át (100 % − 5 %).
> Képzelje el, hogy a régi ár 100 € volt: akkor most 95 €-t fizetnénk. A 95 € tehát mindig kevesebb, mint a régi ár.
> Ezt tudjuk: a régi ár 95 %-a = 4370 €. Ha a 95 %-ból akarunk visszajutni a 100 %-hoz, **osztunk** 0,95-dal: 4370 : 0,95 = 4600 €.
> Józan ésszel: engedmény előtt drágább volt, és a 4600 € valóban több, mint 4370 €. Visszaszámolva: 4600 · 0,95 = 4370 ✓.
>
> **Ha 4588,5 €-t írt (4370 · 1,05):** ilyenkor a 4370 €-hoz adta hozzá az 5 %-ot. Csakhogy az 5 % a *régi* árból járt le, nem a 4370-ből. Ellenpróba: 4588,5 · 0,95 = 4359,08 €, ami nem 4370 €.

**Minta – P2 (jelenérték): „10 %-os kamat mellett 2 év múlva 150 000 Ft lett a számlán. Mennyit tettünk be?”**

> **Miért így?**
> A betett összeget, a mai pénzt (jelenérték) keressük. A bank minden évben a meglévő összeg 110 %-át adja (·1,1), két év alatt kétszer egymás után: ·1,1 · 1,1 = ·1,21.
> Most visszafelé haladunk az időben: a 150 000 Ft-ból kell visszajutni a kezdőösszeghez, ezért az ellenkező művelet jön, **osztás**: 150 000 : 1,21 ≈ 123 967 Ft.
> Józan ésszel: a betett pénz kevesebb, mint ami két év múlva lett belőle.
> Ellenpróba: 123 967 · 1,1 = 136 364 Ft (1 év múlva), · 1,1 = 150 000 Ft (2 év múlva) ✓.
>
> **Ha 125 000 Ft-ot írt (150 000 : 1,2):** ez az egyszerű kamat logikája (2 év · 10 % = 20 %). Kamatos kamatnál a második évben már az első év kamata is kamatozik, ezért 1,1 · 1,1 = 1,21-gyel kell osztani, nem 1,2-del. Ellenpróba: 125 000 · 1,1 · 1,1 = 151 250 Ft, nem 150 000 Ft.

## 4. Válaszellenőrzés szabályai (FONTOS)

A régi Excel-munkafüzet hibáiból tanulva:

1. **Tizedesvessző és tizedespont is elfogadott** (`8,2` és `8.2`). Szóköz mint ezres elválasztó elfogadott (`1 069 200`).
2. **Mértékegység / % jel** a válasz végén ne okozzon hibát: a `%`, `$`, `€`, `Ft`, `kg`, `km`, `liter`, `év`, `tonna` stb. utótagot az ellenőrző levágja. (A tesztben viszont kiírjuk, hogy csak szám kell.)
3. **Tűrés**: a feladat definiálja a kért pontosságot (pl. „egy tizedesre kerekítve”). Elfogadás, ha a kerekített érték egyezik, vagy az eltérés ≤ a kért pontosság fele. Pontosabb válasz (pl. 11,11 a 11,1 helyett) is legyen **jó**.
4. **Előjel egységesen**: a „hány százalékkal csökkent” típusú kérdésre a **pozitív** szám a jó (16), de a −16-ot is fogadja el egy megjegyzéssel („A csökkenés mértéke 16 %; a kérdés »mennyivel csökkent«, ezért elég a 16.”). A „változás (%)” típusú kérdésnél (előjeles) a negatív a jó, a pozitívra figyelmeztessen.
5. Képletet (`=280/1,12`) nem kell értelmezni.

### 4.3 Próbateszt

- 10 véletlen feladat az összes témából (arányosan; 4 témánál pl. 3/3/2/2), **20 perc** időkorlát az egész tesztre (nem feladatonként – ezt ki is írja).
- Minden feladat végén: „Eredményként csak egyetlen számot adjon meg, pl. 8,2 (ha 8,2 %-ot szeretne beírni).”
- Feladatok közt szabadon lehet lépkedni (bal oldali/felső sáv számokkal).
- „Teszt beadása” → megerősítés → eredmény: pontszám, %, és feladatonként a helyes válasz + a megoldás levezetése.
- Akárhányszor újraindítható, mindig új számokkal.
- A legjobb eredmény elmentődik (localStorage).

---

## 5. Szakmai tartalom

A feladatok szövege és számai az eredeti diákat követik; a gyakorló generátorok ezek mintájára **új számokat** adnak. A generátor csak olyan számokat válasszon, amelyekkel a végeredmény „szép” (pl. legfeljebb 2 tizedes), és a tipikus hibás válasz **különbözik** a jótól.

### 5.1 Téma 1 – Százalékszámítás

**Kulcsképlet (kiemelve, piros keretben – a hallgatók „kályhának” ismerik):**

> **P₀ · q = P₁** – P₀ = régi (eredeti) érték, P₁ = új érték, q = szorzó.
> Növekedés p %-kal: q = 1 + p/100 (pl. +4 % → 1,04). Csökkenés p %-kal: q = 1 − p/100 (pl. −8 % → 0,92).

**Elmélet röviden:**
- Az 1 % a század rész. Ha csak a változás kell: érték · p/100. Ha az új érték: érték · q (egy lépésben).
- Három kérdéstípus, ugyanaz a képlet: új érték → **szorzás** (P₁ = P₀ · q); régi érték → **osztás** (P₀ = P₁ : q); változás %-a → q = P₁ : P₀, majd (q − 1) · 100.
- **„Mint a ház alapja”:** amihez viszonyítunk (a 100 %), az mindig **lent**, a nevezőben van.
- Az egyenletrendezésnél mindig az **ellenkező műveletet** végezzük.
- **Többszöri változásnál a szorzókat összeszorozzuk**, a százalékokat nem adjuk össze. A kiinduló érték mindegy → számoljunk 100-ból.
- „Hány százaléka” ≠ „hány százalékkal változott” (0,84 → a régi 84 %-a, tehát 16 %-kal csökkent).

**Kidolgozott példák (az eredeti diák):**
1. 25 $, +4 % → 25 · 1,04 = **26 $**
2. Új ár 280 $, +12 % volt → P₀ = 280 : 1,12 = **250 $**
3. 2500 $ → 3375 $ → q = 1,35 → **+35 %**
4. 150 $, −8 % → 150 · 0,92 = **138 $**
5. −15 % után 39,95 $ → 39,95 : 0,85 = **47 $**
6. 240 $ → 201,6 $ → q = 0,84 → **16 %-kal csökkent**
7. +32 %, majd +10 % → 1,32 · 1,1 = 1,452 → **+45,2 %**
8. −12 %, majd −15 % → 0,88 · 0,85 = 0,748 → **25,2 %-kal csökkent**

**Feladattípusok (generátorok) és tipikus hibák:**

| Típus | Kérdés | Helyes | Tipikus hibás válasz → visszajelzés |
|---|---|---|---|
| T1 növekedés, új érték | P₀, p → P₁ | P₀·(1+p/100) | csak a növekedés (P₀·p/100) → „Ez csak a növekedés, az új ár a régi + növekedés.” |
| T2 növekedés, régi érték | P₁, p → P₀ | P₁ : (1+p/100) | P₁·(1−p/100) → „A P₁ nem a 100 %, hanem a (100+p) %. Régi értéket keres → osztás.” |
| T3 növekedés %-a | P₀, P₁ → p | (P₁/P₀−1)·100 | P₀/P₁ alapú érték, vagy a hányados·100 (pl. 135) → „Ki a 100 %? A régi érték a nevezőben.” / „Ez a P₀ hány százaléka, a változás ennél 100-zal kevesebb.” |
| T4 csökkenés, új érték | P₀, p → P₁ | P₀·(1−p/100) | csak a csökkenés (P₀·p/100) |
| T5 csökkenés, régi érték | P₁, p → P₀ | P₁ : (1−p/100) | P₁·(1+p/100) → „A megadott ár már a (100−p) %.” |
| T6 csökkenés %-a | P₀, P₁ → p | (1−P₁/P₀)·100 | a megmaradó rész (P₁/P₀·100, pl. 84) → „Ez azt mutatja, hány százaléka maradt; a kérdés, hány százalékkal csökkent.” |
| T7 két növekedés | p₁, p₂ → össz. % | ((1+p₁/100)(1+p₂/100)−1)·100 | p₁+p₂ → „A százalékokat nem adjuk össze, a szorzókat szorozzuk.” |
| T8 két csökkenés | p₁, p₂ → össz. csökkenés % | (1−(1−p₁/100)(1−p₂/100))·100 | p₁+p₂ (ugyanaz) |
| T9 vegyes (+ majd −) | p₁, p₂ → változás % (előjeles) | ((1+p₁/100)(1−p₂/100)−1)·100 | p₁−p₂ → pl. „+20 % majd −20 % nem 0 %, hanem −4 %.” |

Számtartományok: árak 10–5000 között, p 2–40 % (egész vagy fél), végeredmény legfeljebb 2 tizedes; pontosság: 2 tizedes, a % 1 tizedes.

**Összetett feladat (kidolgozott példaként + egy változatban gyakorlásra) – szálloda:**
- 2023-ban 3600 belföldi vendég, a vendégek 40 %-a belföldi → összes 3600 : 0,4 = 9000, külföldi 5400.
- 2024-ben 25 %-kal kevesebb belföldi (2700) és **12 %-kal** több külföldi (6048) → összes 8748 → −2,8 %.
- 2024-ben 1 069 200 € bevétel, 8 %-kal több, mint 2023-ban → 2023: 1 069 200 : 1,08 = 990 000 €.
- Egy vendégre jutó bevétel: 110 € → 122,2 € → **+11,1 %** (gyorsabban: 1,08 : 0,972 ≈ 1,111).
- Táblázatos kitöltés: a cellák egyenként ellenőrizve, a 4. fejezet szabályaival.

### 5.2 Téma 2 – Lineáris függvények

**Kulcsképlet:** **y = m·x + b** – m = meredekség (az x szorzója), b = y-tengelymetszet (a konstans tag).
**Meredekség két pontból:** m = Δy / Δx = (y₂ − y₁) / (x₂ − x₁) („függőleges változás per vízszintes változás”, előjelhelyesen).

**Elmélet röviden:**
- Lineáris függvény: „valahányszor x, plusz vagy mínusz egy szám”; a grafikonja egyenes.
- m > 0: szigorúan monoton nő; m < 0: csökken; m = 0: konstans (vízszintes egyenes, pl. y = 4).
- A meredekség jelentése: ha x 1-gyel nő, y ennyivel változik.
- x-tengelyen lévő pont: y = 0; y-tengelyen lévő pont: x = 0. „Mikor lesz nulla?” → y = 0, x-re rendezünk.
- **Egyenes két pontból, 3 lépés:** ① m = Δy/Δx ② egy pont koordinátáit az y = mx + b-be (x helyére az első, y helyére a második koordináta), b kifejezése ③ visszaírás.
- Ha y ismert és x a kérdés: y helyére a szám, rendezés az ellentétes műveletekkel.
- Független változó (amitől függ) → x, vízszintes tengely; függő változó → y.
- „Értelmezze a paramétereket”: m és b jelentését kell szavakban, a feladat nyelvén elmondani.

**Kidolgozott példák:**
1. Csomag: alapdíj 2 €, tömegdíj 3 €/kg → C(x) = 3x + 2; 1, 2, 3 kg → 5, 8, 11 €; 17,75 € → 3x + 2 = 17,75 → **x = 5,25 kg**; b = alapdíj, m = 1 kg-mal nehezebb → 3 €-val drágább.
2. Gép: 520 $, évente −40 $ → V(x) = 520 − 40x; 3 év → 400 $; 0 → **13 év**; két pontból m = −120/3 = −40.
3. Gép két pontból: 3 évesen 800 $, 8 évesen 200 $ → m = −600/5 = −120; 800 = −120·3 + b → b = 1160; V(x) = −120x + 1160; 0 → 1160/120 ≈ **9,7 év**.
4. Autó: 4 évesen 4,8 l, 12 évesen 6 l /100 km (0–24 év) → m = 1,2/8 = 0,15; b = 4,2; F(x) = 0,15x + 4,2; m: évente 0,15 literrel nő; b: új autó fogyasztása; 7,5 l → **x = 22 év**.
5. Grafikonról: (0; −1) és 1-et jobbra 2-t fel → y = 2x − 1; (0; 2) és 3-at jobbra 1-et le → y = −⅓x + 2.

**Feladattípusok és tipikus hibák:**

| Típus | Feladat | Tipikus hiba → visszajelzés |
|---|---|---|
| L1 alapdíj + egységdíj | függvényérték adott x-re | csak az egységdíj · x (alapdíj kimaradt) |
| L2 alapdíj + egységdíj, fordítva | y adott → x | (y)/egységdíj az alapdíj levonása nélkül → „Előbb az alapdíjat vonja le.” |
| L3 csökkenő (amortizáció) | érték adott évben; mikor 0 | előjelhiba / a példa évszámával szoroz |
| L4 meredekség két pontból | m | Δx/Δy (fordítva) → „függőleges per vízszintes”; előjel hiány csökkenésnél |
| L5 y-tengelymetszet két pontból | b | — (tipp: a 3 lépés) |
| L6 x-tengelymetszet | mikor y = 0 | kerekítés nélkül / rossz kerekítés |
| L7 grafikon leolvasás | SVG rácson megrajzolt egyenes → m és b (két mező) | −1 a −⅓ helyett (csak a függőleges lépés) |
| L8 jelentés (feleletválasztós) | „Mit jelent a 0,15?”, „Növő/csökkenő/konstans?” | — |

A grafikonos feladatnál a rácsot és az egyenest **SVG**-vel rajzoljuk, tengelyfeliratokkal, egész rácspontokon átmenő egyenessel.

### 5.3 Téma 3 – Lineáris függvények közgazdasági alkalmazása

**Elmélet röviden:**
- Két lineáris függvény **metszéspontja**: a két kifejezést egyenlővé tesszük (pl. két taxitársaság díja, kereslet = kínálat).
- „Mikor olcsóbb az egyik?” → **egyenlőtlenség**, ugyanúgy rendezzük, mint az egyenletet.
- **Kereslet (D, demand):** mennyit hajlandók vásárolni adott áron – általában csökkenő. **Kínálat (S, supply):** mennyit hajlandók termelni/eladni – általában növekvő. Az ár a független változó (x).
- **Egyensúlyi ár és mennyiség:** ahol kereslet = kínálat (a két egyenes metszéspontja).
- **Eladott mennyiség** nem egyensúlyi árnál: a kereslet és a kínálat közül a **kisebb**.
- **Bevétel = ár · eladott mennyiség** – figyelni a mértékegységekre (ár $/kg, mennyiség tonna → 1 t = 1000 kg).
- A modell csak a **vizsgált tartományban** érvényes (pl. tejár 120–240 Ft között); a b = „ingyen ár melletti kereslet” közgazdaságilag nem értelmezhető, ha kívül esik.

**Kidolgozott példák:**
1. Taxi: Elviszlek e(x) = 450 + 280x, Utasokért u(x) = 350 + 300x. 1150 Ft → x = 2,5 km. 8,5 km → 2830 vs 2900 Ft (Elviszlek). Egyforma: 20x = 100 → **5 km** (1850 Ft). Utasokért olcsóbb: **x < 5 km**.
2. Tej: (120 Ft; 1260 l), (240 Ft; 1020 l) → m = −2, b = 1500 → D(p) = −2p + 1500 (120 ≤ p ≤ 240); 1 Ft áremelés → 2 literrel kisebb kereslet; 200 Ft → 1100 l; 1200 l → 150 Ft.
3. Kenyér: hétfő 2,8 $/kg (kínálat 3,8 t, kereslet 4,1 t), péntek 3,4 $/kg (kínálat 4,4 t, kereslet 3,8 t) → D: y = −0,5x + 5,5; S: y = x + 1; egyensúly 3 $/kg, 4 t; bevétel 3 · 4000 = 12 000 $; 2,5 $/kg: D 4,25, S 3,5 → eladás 3,5 t → 8750 $; 3,2 $/kg: D 3,9, S 4,2 → eladás 3,9 t → 12 480 $.

**Feladattípusok és tipikus hibák:**

| Típus | Feladat | Tipikus hiba → visszajelzés |
|---|---|---|
| K1 két tarifa | adott díjnál km; adott km-nél melyik olcsóbb (választós) | — |
| K2 két tarifa metszéspont | hány km-nél egyforma; mennyi akkor a díj | — |
| K3 két tarifa egyenlőtlenség | „hány km alatt olcsóbb X?” | fordított irány → „Nézze meg, melyik egyenes van lejjebb 0 km-nél.” |
| K4 keresleti függvény két pontból | m, b | előjel |
| K5 kereslet értéke / ár adott keresletnél | y vagy x | x és y felcserélése |
| K6 egyensúly | egyensúlyi ár és mennyiség (két mező) | — |
| K7 bevétel adott áron | $ | a nagyobb mennyiséggel szoroz → „Csak annyit tudnak eladni, amennyi a kevesebb.”; tonna–kg váltás kimarad (1000-szeres eltérés) → „Az ár kg-ra vonatkozik.” |

A kereslet–kínálat feladatnál egy **SVG ábra** mutassa a két egyenest és az egyensúlyi pontot (a megoldás után).

---

### 5.4 Téma 4 – Pénzügyi számítások (kamatos kamat)  *(v2)*

**Kulcsképlet (kiemelve, piros keretben – ez ennek a témának a „kályhája”, mindig ide térünk vissza):**

> **PV · (1 + r/100)ⁿ = FV**
> PV = jelenérték (*present value*, a mai pénz: betett összeg / felvett kölcsön), FV = jövőérték (*future value*: felnövekedett összeg / visszafizetendő összeg), r = éves kamatláb (%), n = kamatozó periódusok (évek) száma.
> **(1 + r/100)** a **kamattényező** – nem r és nem r/100! (8 % → 1,08; 0,5 % → 1,005.)

**Elmélet röviden:**
- **Kamatos kamat:** a második évtől a korábbi kamat is kamatozik. Ezért évről évre a kamattényezővel szorzunk tovább: n év után a kamattényező **n-edik hatványával**.
- A függvény **nem lineáris, hanem exponenciális**: a grafikonon a lépcsők (az éves kamatok) egyre nagyobbak, mert egyre nagyobb összegnek vesszük a 8 %-át. (Ábra: a 80 000 Ft · 1,08ⁿ értékei 0–20 évre, SVG-n, oszlopok vagy pontok.)
- Mindig tudni kell, **melyik betű az ismeretlen**, és mit hová helyettesítünk – egy képlet, négy kérdéstípus:
  1. **FV** ismeretlen → szorzás a kamattényező hatványával.
  2. **PV** ismeretlen → **visszafelé haladunk az időben → osztás** a kamattényező hatványával (kisebb szám jön ki, mint FV).
  3. **n** ismeretlen → osztás PV-vel, majd **logaritmus** („lecsalogatja a kitevőt”: lg(qⁿ) = n · lg q): n = lg(FV/PV) / lg(1 + r/100). Járható út a **próbálgatás** egész n-ekkel is.
  4. **r** ismeretlen → osztás PV-vel, majd **n-edik gyök**: 1 + r/100 = ⁿ√(FV/PV); utána −1, ·100.
- Egyenletnél **minden műveletet mindkét oldalon** el kell végezni (logaritmust is).
- **Hitelnél ugyanez a képlet:** a felvett kölcsön a PV, a futamidő végén egy összegben visszafizetett összeg az FV.
- **Évközi kamatozás:** az éves (**névleges**) kamatlábat **arányosítjuk**: havonta r/12, negyedévente r/4, félévente r/2; a periódusok száma ennyiszer több (pl. 7 hónap → 7. hatvány). Vigyázat a nullákkal: **fél % → 1,005** (két nulla), 5 % → 1,05, 0,05 % → 1,0005.
- **Tényleges (effektív) éves kamatláb:** ha gyakrabban tőkésítenek, kicsit többet kapunk, mert hamarabb kezd kamatozni a kamat: r_tényleges = ((1 + r/(100·m))^m − 1) · 100. Gyakoribb tőkésítés → nagyobb, **de nem nő a végtelenségig** (18 %-nál a határ ≈ 19,72 %, e^0,18 − 1).
- **Excelben:**
  - jövőérték: `=80000*HATVÁNY(1,08;A2)` vagy soronként `=előző*1,08`;
  - periódusszám: `=PER.SZÁM(ráta; részlet; jelenérték; jövőérték)`, pl. `=PER.SZÁM(0,05;0;-120000;186160)` → 9;
  - kamatláb: `=RÁTA(időszakok; részlet; jelenérték; jövőérték)`, pl. `=RÁTA(6;0;-400000;520904)` → 4,5 %;
  - **a jelenértéket és a jövőértéket ellentétes előjellel kell megadni** (az egyik pénz befelé, a másik kifelé áramlik), különben hibát ad;
  - a rátát tizedes törtként (0,05) vagy %-ként (5%) kell beírni; a részlet itt 0 vagy üres.
- **GeoGebrában** gyökvonás: a beviteli billentyűzet *f(x)* részén az n-edik gyök; tizedes**pont**tal (1.3022).

**Kidolgozott példák (az eredeti diák és feladatlap):**
1. **Jövőérték:** 80 000 Ft, 8 % → 1 év: 86 400 Ft; 2 év: 80 000 · 1,08² = **93 312 Ft**; 3 év: 100 776,96 ≈ **100 777 Ft**; n év: 80 000 · 1,08ⁿ; 20 év: ≈ **372 877 Ft** (a betét ~4,7-szerese). Exponenciális függvény.
2. **Jelenérték:** 10 %, 2 év múlva 150 000 Ft → PV = 150 000 : 1,1² = 123 966,94 ≈ **123 967 Ft**.
3. **Periódusszám:** 120 000 Ft, 5 %, kifizetés 186 160 Ft → 1,05ⁿ = 1,5513 → n = lg 1,5513 / lg 1,05 ≈ **9 év**. Excel: `=PER.SZÁM(0,05;0;-120000;186160)`.
4. **Kamatláb:** 400 000 Ft → 6 év múlva 520 904 Ft → 1 + r/100 = ⁶√1,30226 ≈ 1,045 → **4,5 %**. Excel: `=RÁTA(6;0;-400000;520904)`.
5. **Havi kamatozás:** 200 000 Ft, éves névleges 6 %, havonta → havi 0,5 % → 200 000 · 1,005⁷ = 207 105,88 ≈ **207 106 Ft** (7. hónap végén).
6. **Tényleges kamatláb:** 100 000 Ft, névleges 18 %:

   | tőkésítés | periódus-kamatláb | 1 év múlva | tényleges éves kamatláb |
   |---|---|---|---|
   | évente | 18 % | 118 000 Ft | 18 % |
   | félévente | 9 % (2×) | 118 810 Ft | 18,81 % |
   | negyedévente | 4,5 % (4×) | **119 252 Ft** | 19,25 % |
   | havonta | 1,5 % (12×) | 119 562 Ft | 19,56 % |
7. **Összetett – banki ajánlatok (13. feladat):** a) 12 %, 6 év, visszafizetés 10 658 643 Ft → PV = **5 400 000 Ft**; b) 6 millió, 4 év, 8 315 152 Ft → **8,5 %**; c) 5 millió, 9,8 %, 8 év → **10 563 035 Ft**; d) 5,8 millió, 10,2 %, 11 447 197 Ft → **7 év**; e) 5,2 millió, 3 év, havi kamatozás, névleges 12 % → 5,2 millió · 1,01³⁶ ≈ **7 439 998 Ft**, tényleges kamatláb **12,68 %**.

**Gyakorló párok (a feladatlap páros feladatai – fix számokkal is legyenek elérhetők, ellenőrzött végeredménnyel):** 50 000 Ft, 3 %, 20 év → 90 305,56 ≈ 90 306 Ft; kölcsön 4 %, 5 év múlva 210 000 Ft → **172 605 Ft**; hitel 800 000 Ft, 3,5 %, visszafizetés 918 000 Ft → **4 év**; hitel 700 000 Ft, 5 év, 959 061 Ft → **6,5 %**; hitel 300 000 Ft, havi kamatozás, névleges 9,6 %, 5 hónap → 300 000 · 1,008⁵ ≈ **312 194 Ft**; 400 000 Ft, névleges 8,4 % → évente 433 600 (8,4 %), félévente 434 306 (8,58 %), negyedévente 434 673 (8,67 %), havonta 434 924 (8,73 %).

**Feladattípusok (generátorok) és tipikus hibák:**

| Típus | Feladat | Helyes | Tipikus hibás válasz → visszajelzés |
|---|---|---|---|
| P1 jövőérték | PV, r, n → FV (Ft, egészre) | PV·(1+r/100)ⁿ | **egyszerű kamat** PV·(1 + n·r/100) → „Ez egyszerű kamat lenne; kamatos kamatnál a kamat is kamatozik → hatvány.”; PV·(1+r)ⁿ (r nem osztva 100-zal) → „A kamattényező 1 + r/100, pl. 8 % → 1,08, nem 9.”; csak 1 év (PV·(1+r/100)) |
| P2 jelenérték (betét vagy kölcsön) | FV, r, n → PV (Ft, egészre) | FV : (1+r/100)ⁿ | FV·(1+r/100)ⁿ → „Visszafelé halad az időben → osztás; a jelenérték kisebb, mint a jövőérték.”; FV·(1−r/100)ⁿ → „Nem csökkenéssel szorzunk, hanem a kamattényező hatványával osztunk.” |
| P3 periódusszám | PV, FV, r → n (év, egészre) | lg(FV/PV)/lg(1+r/100) | FV/PV/(r/100)-féle lineáris becslés → „Kamatos kamatnál logaritmus (vagy próbálgatás egész évekkel).” |
| P4 kamatláb | PV, FV, n → r (% , 1 tizedes) | (ⁿ√(FV/PV) − 1)·100 | (FV/PV − 1)·100/n (átlagos egyszerű kamat) → „Ez az évi átlagos növekedés egyszerű kamattal; kamatos kamatnál n-edik gyököt kell vonni.”; (FV/PV−1)·100 (a teljes növekedés) → „Ez az egész időszak alatti növekedés, nem az éves kamatláb.” |
| P5 évközi kamatozás | PV, éves névleges r, havi/negyedéves/féléves tőkésítés, időtartam hónapokban → FV (Ft, egészre) | PV·(1+r/(100m))^k | éves r-rel számol periódusonként → „Az éves kamatlábat arányosítani kell: havonta r/12.”; rossz tizedes nullák (pl. 1,05 vagy 1,0005 a 1,005 helyett) → „Fél százalék = 0,005 → 1,005 (két nulla).”; egyszerű kamat PV·(1+r·t) |
| P6 tényleges kamatláb | névleges r, tőkésítések száma m → tényleges % (2 tizedes) | ((1+r/(100m))^m − 1)·100 | a névleges r → „Ez a névleges kamatláb; gyakoribb tőkésítésnél a tényleges egy kicsit több.” |
| P7 kamattényező | „p %-os kamat/növekedés → mennyi a szorzó?” (gyors, egy szám) | 1 + p/100 | p/100 vs. rossz nullák → célzott üzenet (Ilona kedvenc csapdája: 0,5 % → 1,005) |
| P8 vegyes „banki ajánlat” | véletlenszerűen P1–P6 egy hitel-történetbe ágyazva | — | a megfelelő típus üzenetei |

**Számtartományok és kerekítés:** PV 10 000 – 10 000 000 Ft (szép, kerek számok), r 1–20 % (egész vagy fél), n 1–30 év, évközi m ∈ {2, 4, 12}. Ft-ban **egészre kerekítve**, kamatláb **1 tizedesre**, tényleges kamatláb **2 tizedesre**, periódusszám **egészre**. A P3/P4 generátor úgy készüljön, hogy FV-t egész n-ből / szép r-ből számolja és Ft-ra kerekíti; az ellenőrzés a kerekített FV-ből visszaszámolt értékre is legyen toleráns (pl. 3,9994 → 4 év). A Ft-os válaszoknál ±1 Ft eltérés is elfogadható (kerekítési különbség), egy megjegyzéssel.

**Ábra:** a témaoldalon (Elmélet) egy SVG mutassa a kamatos kamat (exponenciális) és az egyszerű kamat (lineáris) növekedését ugyanarra a betétre, 0–20 évre – így látszik, hogy a kamatos kamat lépcsői egyre nagyobbak.

## 6. Megjelenés

- Letisztult, „füzet” jellegű, nyugodt színvilág; a kulcsképlet piros keretes kiemelése visszatérő motívum.
- Visszajelzések színe: jó (zöld), tipikus hiba (narancs), egyéb (semleges) – nem csak színnel, ikonnal/szöveggel is.
- Kivetíthetőség: alap betűméret legalább 18 px, „Nagy betű” kapcsoló.

## 7. Mi NE kerüljön bele

- Személyes adat, nevek, e-mail címek.
- Az eredeti előadásvideók átirata vagy szövege.
- Külső követő/analitika, bejelentkezés, szerveroldal.

## 8. Átadás

- `README.md`: rövid leírás, a GitHub Pages link helye, hogyan lehet új témát hozzáadni (adatfájl szerkezete), hogyan futnak a tesztek (`node --test`).
- A munka egy külön ágon készüljön, és **pull request** formájában kerüljön a `main` ágra, rövid magyar leírással és képernyőképekkel/leírással arról, mi készült el.

## 9. AI-asszisztens (v3, opcionális)

- A Gyakorlás fülön feladatonként nyitható „🤖 AI-asszisztens” panel: gyorsgombok („Magyarázd el másképp”, „Miért hibás a válaszom?”, „Adj egy tippet”) és szabad kérdés.
- **Saját, ingyenes Gemini API-kulcs** kell. Az `ai.html` oldalon magyar útmutató (Google AI Studio → API-kulcs létrehozása), kulcs mentése / kipróbálása / törlése, adatvédelmi és hibaelhárítási tudnivalók.
- A kulcs csak a böngészőben marad (alapból munkamenetben, kérésre megjegyezve), csak a Google felé megy, fejlécben. Nincs szerver, nincs automatikus hívás, a próbatesztben nincs AI.
- Az ingyenes szinten legtöbb kérést adó „flash-lite” modellek; kvótahibánál automatikus váltás a következő modellre.
- Az AI a 3.2 szerinti hangnemben és szerkezetben magyaráz (konkrét számok, 100-zal szemléltetés, józan ész ellenőrzés, saját számmal ellenpróba, első lépésben rávezető kérdés), a végeredményt csak a megoldás megnézése után vagy kérésre mondja meg. A helyességet továbbra is az oldal ellenőrzője dönti el.
- Az AI-válasz megjelenítése nem HTML: csak szöveg, **vastag**, `kód`, felsorolás.
