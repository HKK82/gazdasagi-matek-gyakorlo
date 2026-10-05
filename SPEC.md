# Gazdasági matematika gyakorló – fejlesztési leírás

Ez a fájl a megrendelő (oktató) igényeit és a teljes szakmai tartalmat írja le. A fejlesztés ebből dolgozzon.

## 1. Cél és közönség

- Böngészőben futó **gyakorlóoldal** a Kodolányi János Egyetem „Gazdasági matematika” tárgyához.
- Felhasználók: felnőtt, levelezős hallgatók, sokan **nem matematikusok**. A hangnem barátságos, türelmes, magázó („Önök/Ön” helyett elég a semleges, felszólító forma: „Írja be…”, „Nézze meg…”).
- Az oktató **online órán** is használja, ezért kivetítve is jól olvasható legyen (nagy betű, tiszta elrendezés).
- Első verzió (v1, kész): **3 téma**. **v2 (kész): 4. téma – Pénzügyi számítások (kamatos kamat)**, lásd 5.4. **v4: 5. Exponenciális függvények, 6. Közgazdasági függvények vizsgálata, 7. Klasszikus valószínűség és valószínűségi változó**, lásd 5.5–5.7. Később újabb témák jönnek (mintavétel, normális eloszlás, döntéselmélet) → a tartalom legyen könnyen bővíthető (téma = külön adatfájl/modul).

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

- 10 véletlen feladat az összes témából (arányosan; 4 témánál pl. 3/3/2/2; 7 témánál minden témából legalább 1, a maradék 3 véletlenszerűen, egy témából legfeljebb 2), **20 perc** időkorlát az egész tesztre (nem feladatonként – ezt ki is írja).
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

---

### Közös szabályok a v4 témáihoz (5.5–5.7)

- Mindhárom témánál érvényes a **3.2** (Miért így?, ellenpróba a hallgató saját számával, első tipp kérdés) és a **4.** fejezet (válaszellenőrzés).
- Az órán a hallgatók **GeoGebrában** dolgoznak (5. és 6. téma). Az oldal **nem ágyazza be** a GeoGebrát (nincs külső kérés), de:
  - minden ilyen feladatnál legyen egy lenyitható **„GeoGebrában így”** doboz, a konkrét beírandó sorokkal (tizedes**pont**tal!), pl. `p(x)=100*1.124^x`, `y=200`, `Metszéspont(p, f)` – a hallgató ezt kimásolhatja;
  - a megoldás után egy **SVG ábra** mutassa a függvényt és a keresett pontot (metszéspont, szélsőérték), feliratozott tengelyekkel – a meglévő `js/lib/abra.js` bővítésével.
- **Papíron is megoldható**: az 5. témánál a logaritmusos/gyökös levezetés is jelenjen meg a megoldásban (Ilona: „a dolgozatban szabadon választható”).
- **Darabszám = egész szám** (6. téma): ha a kérdés darabszámra vonatkozik, a válasz a megfelelő **egész** határ; a nem egész metszéspontot a „Miért így?” magyarázza el a szomszédos egészek behelyettesítésével (pl. pr(23) < 0, pr(24) > 0).

### 5.5 Téma 5 – Exponenciális függvények  *(v4)*

**Kulcsképlet (kiemelve, piros keretben):**

> **f(x) = a · qˣ** – a = kiinduló érték (x = 0-nál, mert q⁰ = 1), q = **éves szorzó** (növekedési tényező), x = eltelt évek száma.
> Növekedés p %-kal évente: q = 1 + p/100 (12,4 % → 1,124). Csökkenés p %-kal: q = 1 − p/100 (1 % → 0,99; 0,3 % → 0,997).

**Elmélet röviden:**
- Már találkoztunk vele: a **kamatos kamat** is exponenciális függvény. Exponenciális = az **x a kitevőben** van, az alap egy konkrét szám (2ˣ, 0,6ˣ). Az x² vagy x³ **nem** exponenciális (az másod-, harmadfokú).
- q > 1: **növekvő**; 0 < q < 1: **csökkenő**; q = 1: konstans (nem fordul elő). Csak pozitív alappal foglalkozunk.
- Csökkenésnél a csökkenés **lassul** (egyre kisebb számnak vesszük ugyanannyi %-át): 20 · 0,95ˣ → 1; 0,95; 0,90 millió csökkenés.
- **„Tegyen fel egy könnyebb kérdést”:** 1 év múlva · q, 2 év múlva · q², x év múlva · qˣ.
- **A paraméterek értelmezése („faggassuk a függvényt”):** N(t) = 10,7 · 0,997ᵗ → 10,7 millió a kiinduló évben, évente **0,3 %-kal** (3 ezrelékkel) csökken.
- **Kétszereződés / feleződés:** qˣ = 2 (vagy 0,5) → x = lg 2 / lg q. A kétszereződési idő **nem függ a kiinduló értéktől**: 100-ból 200 ugyanannyi idő, mint 200-ból 400.
- **Az éves ütem két adatból:** a · qⁿ = b → **osztás** (nem kivonás!) → qⁿ = b/a → **n-edik gyök** → q → (q − 1) · 100 %.
- **Lineáris vagy exponenciális?** „Minden évben ugyanannyi **forinttal**” → lineáris; „minden évben ugyanannyi **százalékkal** / azonos arányban” → exponenciális.

**Kidolgozott példák (az eredeti diák):**
1. Profit 20 millió Ft, évente −5 % → 19; 18,05; ≈ 17,15 millió; **p(x) = 20 · 0,95ˣ** (csökkenő).
2. Élelmiszerár 1990-ben 100 Ft, évente +12,4 % → **p(x) = 100 · 1,124ˣ**; 2010-ben 100 · 1,124²⁰ ≈ **1036 Ft**; kétszereződés: x = lg 2 / lg 1,124 ≈ 5,93 ≈ **6 év** (400 Ft: ≈ 11,9 év, 800 Ft: ≈ 17,8 év).
3. Népesség 25 millió (1980), évente −1 % → **P(x) = 25 · 0,99ˣ**; feleződés: 0,99ˣ = 0,5 → ≈ 68,97 ≈ **69 év**.
4. Magyarország: N(t) = 10,7 · 0,997ᵗ → 1980-ban 10,7 millió; évente −0,3 %; 7,5 millió alá: t ≈ 118,3 → **2099-ben**.
5. Üzemanyag: B(t) = 80 · 1,178ᵗ, G(t) = 75 · 1,186ᵗ (1993-tól) → 80 Ft, +17,8 %/év; 75 Ft, +18,6 %/év; utoléri: t = lg(80/75) / lg(1,186/1,178) ≈ 9,5 → **2003-ban**.
6. Platina: 1988: 3,32, 1993: 3,87 millió t → q⁵ = 1,166 → q ≈ 1,031 → **+3,1 %/év**; f(x) = 3,32 · 1,031ˣ; 2030 (x = 42): ≈ **12,0 millió t**.
7. Nyereség: 2000: 80, 2010: 75 millió Ft → q¹⁰ = 0,9375 → q ≈ 0,9936 → **≈ −0,64 %/év**; 2030 (x = 30): ≈ **65,9 millió Ft**.

**Feladattípusok és tipikus hibák:**

| Típus | Feladat | Helyes | Tipikus hibás válasz → visszajelzés |
|---|---|---|---|
| E1 szorzó | „évente p %-kal nő/csökken → mennyi q?” | 1 ± p/100 | p/100 (pl. 0,124) → „Ez csak a változás; a szorzó a megmaradó + a változás: 1,124.”; csökkenésnél 1 + p/100 → „Csökkenésnél kevesebb, mint 100 % marad.”; rossz nullák (0,3 % → 0,97 a 0,997 helyett) |
| E2 függvényérték | a, p, x év → f(x) (2 tizedes vagy egész) | a · qˣ | **lineáris** a · (1 + x·p/100) → „Ez akkor lenne, ha minden évben ugyanannyival változna; itt ugyanannyi %-kal → hatvány.”; rossz kitevő (évszám-különbség ± 1) → „Hány év telt el? Az évszámok különbsége.” |
| E3 növő/csökkenő, értelmezés | f(x) = a · qˣ → „növekvő vagy csökkenő?”, „mennyi a kiinduló érték?”, „hány %-kal változik évente?” (választós + szám) | q > 1 / q < 1; a; (q − 1) · 100 | 0,997 → „0,3 % csökkenés”, nem „99,7 %” → „A 99,7 % az, ami megmarad.” |
| E4 kétszereződés / feleződés | p → hány év alatt duplázódik / feleződik (1 tizedes) | lg 2 / lg q, ill. lg 0,5 / lg q | 100 / p (lineáris becslés) → „Kamatos jellegű növekedés: logaritmus vagy GeoGebra-metszéspont.” |
| E5 mikor éri el? | a, q, cél → x (1 tizedes, vagy „melyik évben”: egész évszám) | lg(cél/a) / lg q | évszámnál a kezdőév kimarad, vagy lefelé kerekít → „Ha 118,3 év kell, a 118. év végén még nincs alatta → a 119. évben.” |
| E6 éves ütem két adatból | a, b, n év → p % (1 tizedes, előjeles a „változás”-nál) | (ⁿ√(b/a) − 1) · 100 | (b − a)/n (forintban egyenletes) → „Ez lineáris lenne; azonos arányban → n-edik gyök.”; (b/a − 1) · 100 (a teljes változás) → „Ez az egész időszak alatti változás, nem az éves.”; b − a-val kezd → „Szorzás ellentéte az osztás, nem a kivonás.” |
| E7 előrejelzés | két adat → q, majd érték egy későbbi évre | a · q^(x) | a kerekített q-val számolt érték is legyen elfogadott (±0,5 %), megjegyzéssel |
| E8 két függvény metszéspontja | a₁ · q₁ˣ = a₂ · q₂ˣ → melyik évben éri utol? | lg(a₁/a₂) / lg(q₂/q₁) | — (tipp: GeoGebrában mindkét függvény + Metszéspont) |
| E9 exponenciális-e? (választós) | 4 képlet közül melyik exponenciális / melyik csökkenő | x a kitevőben | x² kiválasztása → „Itt az x az alap, nem a kitevő – ez másodfokú.” |

**Számtartományok:** a 1–1000 (kerek), p 0,1–25 % (1 tizedes), x 1–60 év. Pénz és népesség: 2 tizedes vagy egész; %: 1 tizedes (a 4. fejezet tűrésével); évek: 1 tizedes, ill. „melyik évben” kérdésnél egész évszám.

**„GeoGebrában így” (minta):** `p(x)=100*1.124^x` · tengelyarány (jobb klikk a rajzlapon → xTengely : yTengely) **1:100** · `y=200` · `Metszéspont(p, f)` (vagy kattintás a két alakzatra) · n-edik gyök: virtuális billentyűzet → f(x) fül. Tanács: az **origóra** téve a kurzort görgessen, így nem csúszik el a koordináta-rendszer.

### 5.6 Téma 6 – Közgazdasági függvények vizsgálata  *(v4)*

Az órán **kizárólag GeoGebrával** oldják meg (harmadfokú profitfüggvény, átlagköltség-függvény). A gyakorlóban a hallgató GeoGebrában (vagy az oldal ábráján leolvasva) dolgozik, és **számokat** ír be.

**Kulcsgondolatok (kiemelve):**

> **Maximum / minimum** → `Maximum(f, kezdő x, záró x)` / `Minimum(…)` – az intervallumot úgy adja meg, hogy a szélsőérték biztosan beleessen.
> **Nyereséges** = a profit pozitív = a grafikon az **x-tengely fölött**. **Több mint K** = a grafikon az **y = K** egyenes fölött.
> **Darabszám egész szám** → a nem egész metszéspont utáni / előtti első egész a határ.

**Elmélet röviden:**
- Mindig olvassa végig a feladatot: mi az x (pl. naponta eladott autók), mi a függvényérték (profit €-ban).
- A függvény beírása: beszédes név (`pr(x)=…`), kitevő után a **jobbra nyíllal** vissza; **mindig ellenőrizze az algebra-ablakban**, mit írt be.
- **Tengelyarány:** profitnál 1:1000, átlagköltségnél 1:20 – utána görgessen kifelé, amíg látszik a függvény.
- **Rossz intervallum = rossz válasz:** 0–41 között a 41 „a legmagasabb pont” – a gép jól válaszolt, csak rosszul kérdeztünk.
- **Nő / csökken:** balról jobbra haladva a minimumig csökken, a maximumig nő, utána megint csökken.
- **Átlagköltség** = egy termékre jutó költség (100 db, 100 000 € → 1000 €/db). ac(x) = x + 750 + 2500/x; a „per x” osztásjel: `2500/x`.
- **Változás %-ban:** a viszonyítási alap (100 %) a **korábbi** érték, az kerül a nevezőbe (mint a ház alapja – 1. téma).

**Kidolgozott példák:**
1. Autó: pr(x) = −x³ + 90x² − 1500x − 1000 (x: napi eladott autó, profit €) → a) max **50 db, 24 000 €**; b) minimum 10 db (−8000 €), **nő, ha 10 < x < 50**, egyébként csökken; c) x-tengelymetszetek ≈ 23,05 és 67,6 → nyereséges **24–67 db** között (pr(23) < 0, pr(24) ≈ 1016 €, pr(67) ≈ 1747 €, pr(68) < 0); d) y = 20 000 metszéspontjai ≈ 41,2 és 57,7 → **42–57 db**.
2. Kerékpár (PPT 7–11. dia): pr(x) = −x³ + 135x² − 4200x − 5000 → max **70 db, 19 500 €**; nő, ha **20 < x < 70**; nyereséges **52–84 db**; > 10 000 €: **58–80 db** (a dián: „57 db-nál több, de 81 db-nál kevesebb”).
3. Átlagköltség: ac(x) = x + 750 + 2500/x → a) 50 db alatt csökken, felette nő; b) min **50 db, 850 €/db**; c) < 900 €/db: metszéspontok ≈ 19,1 és 130,9 → **20–130 db**; d) 60 → 90 db: 851,7 → 867,8 €/db, **+16,1 €/db, +1,9 %**.

**Feladattípusok és tipikus hibák:**

| Típus | Feladat | Helyes | Tipikus hibás válasz → visszajelzés |
|---|---|---|---|
| G1 maximális profit | pr(x) harmadfokú → hány db, mennyi a profit (két mező) | a lokális maximum | egy intervallum szélén lévő érték → „Az intervallum széle nem csúcs; adjon meg szélesebb intervallumot.” |
| G2 nő / csökken | mettől meddig nő (két mező: alsó, felső) | lokális min. és max. helye | a két érték felcserélése; a metszéspontok megadása → „Ezek a nyereségesség határai, nem a csúcsok.” |
| G3 nyereséges | hány db-tól hány db-ig (egész, két mező) | ⌈x₁⌉ … ⌊x₂⌋ | a kerekített (nem felfelé) alsó határ (pl. 23) → „Ellenpróba: pr(23) = … < 0, ott még veszteséges.” |
| G4 több mint K | y = K metszéspontjai → egész határok | mint G3 | mint G3 |
| G5 függvényérték | pr(x) vagy ac(x) adott x-re | behelyettesítés | előjelhiba a −x³ tagnál → „A −x³ azt jelenti: −(x³).” |
| G6 minimális átlagköltség | ac(x) = x + b + c/x → hány db, mennyi (két mező) | x = √c, ac(√c) = 2√c + b | — |
| G7 átlagköltség < K | egész határok | mint G3 | mint G3 |
| G8 változás két darabszám között | € és % (két mező, 1 tizedes) | (ac(x₂) − ac(x₁)) és ÷ ac(x₁) | a későbbi értékkel oszt → „Mihez viszonyítunk? A korábbi (x₁ darabos) érték a 100 %.” |

**Generátor:** a profitfüggvényt a csúcsok helyéből építse fel, hogy a szélsőértékek egészek legyenek: pr'(x) = −3(x − m₁)(x − m₂) → pr(x) = −x³ + 1,5(m₁ + m₂)x² − 3m₁m₂x + c, ahol m₁ < m₂ egész, m₁ + m₂ páros (pl. 10 és 50 → 90x² − 1500x), c negatív (fix költség), és úgy választva, hogy a minimumban veszteség, a maximumban szép kerek nyereség legyen, és két pozitív x-tengelymetszet legyen. Átlagköltségnél c = k² (négyzetszám) → a minimum egész helyen van. A G3/G4/G7 határokat a teszt **egész értékek behelyettesítésével** ellenőrizze.

**Ábra:** a megoldás után SVG: a függvény a releváns tartományon (x ≥ 0), a szélsőérték(ek) és a metszéspontok kiemelve, a vízszintes y = K egyenes szaggatottal; a „nyereséges” sáv színezve.

**„GeoGebrában így” (minta):** `pr(x)=-x^3+90x^2-1500x-1000` · tengelyarány **1:1000** · `Maximum(pr, 0, 100)` · `Minimum(pr, 0, 20)` · `Metszéspont(pr, xTengely)` · `y=20000` · `pr(24)`.

A **kereslet–kínálat** feladat (PPT 16–20. dia) a dolgozatban nem szerepel – ebbe a témába **ne** kerüljön gyakorló típusként.

### 5.7 Téma 7 – Klasszikus valószínűség, valószínűségi változó  *(v4)*

**Kulcsképletek (kiemelve):**

> **P(A) = kedvező / összes** (ha minden elemi esemény egyformán valószínű); mindig **0 ≤ P(A) ≤ 1**.
> **Független** események együtt: **P(A és B) = P(A) · P(B)**. **Egymást kizáró** események: **P(A vagy B) = P(A) + P(B)**. **Komplementer:** P(Ā) = 1 − P(A).
> **Várható érték:** **M(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ** – egy játékra jutó átlagos nyeremény. > 0: kedvező, < 0: kedvezőtlen, = 0: igazságos.

**Elmélet röviden:**
- A valószínűség azt jelenti: nagyon sok, azonos körülmények közti kísérletben a **relatív gyakoriság** (bekövetkezések / kísérletek) e körül ingadozik.
- **Elemi esemény** két érménél egy dobás**pár** (ff, fi, if, ii) – mind 1/4.
- **Komplementer = „minden más”**: „mindkettő fej” ellentéte **„van köztük írás”**, nem „mindkettő írás”.
- **Visszatevéses húzás** = két külön, egyforma pakli → a húzások **függetlenek**, szorzunk.
- Ha a lehetséges esetek közül kettőnek megvan a valószínűsége, a harmadik a **maradék** (az összeg 1).
- **Módusz** = a legvalószínűbb érték. A **szórás** a várható érték körüli ingadozást méri (egyszer megmutatjuk, nem gyakoroltatjuk).
- **Magyar kártya:** 4 szín (piros, tök, zöld, makk) × 8 figura (VII, VIII, IX, X, alsó, felső, király, ász) = 32 lap.

**Kidolgozott példák:**
1. Két kocka, mindkettő kettes: 1/36 = 1/6 · 1/6.
2. 5 lap (2 nyerő: +10 €, 3 vesztő: −4 €), két húzás visszatevéssel → X: 20 / 6 / −8 € → P: **0,16 / 0,48 / 0,36**; módusz 6 €; M(X) = **3,2 €** (100 játékra kivetítve: 16 · 20 + 48 · 6 − 36 · 8 = 320 € → 3,2 €/játék); D(X) ≈ 9,7.
3. Magyar kártya, két kupac (20 lap: 2 piros; 12 lap: 6 piros), mindkettőből egy lap → 2 piros: 2/20 · 6/12 = **0,05**; 0 piros: 18/20 · 6/12 = **0,45**; 1 piros: **0,5**; fogadás +100 / −10 / −20 → M(X) = **−9** → nem kedvező.
4. Frédi legfeljebb kétszer húz visszatevéssel 10 lapból (3 nyerő): elsőre nyer +40 (0,3), csak másodikra +10 (0,7 · 0,3 = 0,21), egyik sem −50 (0,49) → M(X) = **−10,4** → Frédinek nem kedvező, Béni átlagosan 10,4-et nyer.
5. Moodle-gyakorlók: 40 / 20 / −60 €, P = 0,52 / 0,23 / ? → 0,25, M = **10,4**; 8 lap (2 db +12 €, 6 db −8 €), két húzás → 24 / 4 / −16 € → 0,0625 / 0,375 / 0,5625 → M = **−6**; 5 lap, 1 nyerő, legfeljebb két húzás: 20 / 15 / −25 € → 0,2 / 0,16 / 0,64 → M = **−9,6**.

**Feladattípusok és tipikus hibák:**

| Típus | Feladat | Helyes | Tipikus hibás válasz → visszajelzés |
|---|---|---|---|
| V1 klasszikus valószínűség | kocka/érme/kártya: „mennyi az esélye…” (tizedes tört, 4 tizedes) | kedvező/összes | a nem kedvezőkhöz viszonyít (2/18 a 2/20 helyett) → „Kedvező per **összes**.”; > 1 → „A valószínűség legfeljebb 1.” |
| V2 komplementer | P(A) adott vagy számolható → P(Ā) | 1 − P(A) | a „fordított” esemény valószínűsége (két fej → két írás: 0,25) → „A komplementer minden más: van köztük írás.” |
| V3 független együtt | két kocka / két kupac / két húzás → P(mindkettő) | p₁ · p₂ | összeadás → „Együtt bekövetkezés, függetlenek → szorzunk.” |
| V4 nyeremény-eloszlás (két húzás visszatevéssel) | k nyerő + l vesztő lap, két húzás → a 3 lehetséges nyeremény és valószínűségük (táblázat: 3 + 3 mező) | P(NN) = p², P(VV) = (1−p)², P(vegyes) = 2p(1−p) | a vegyes esetnél csak p(1−p) → „Két sorrend lehetséges: nyerő-vesztő **vagy** vesztő-nyerő.” |
| V5 „legfeljebb kétszer húz” | elsőre / csak másodikra / egyik sem → valószínűségek | p; (1−p)·p; (1−p)² | a „csak másodikra” esetnél p → „Másodszor csak akkor húz, ha elsőre vesztett: (1−p) · p.” |
| V6 hiányzó valószínűség | két valószínűség adott → a harmadik | 1 − p₁ − p₂ | — |
| V7 várható érték | értékek és valószínűségek → M(X) (2 tizedes, előjeles) | Σ xᵢ · pᵢ | a veszteség pozitív előjellel → „A veszteség negatív nyeremény.”; az értékek átlaga (valószínűségek nélkül) → „Súlyozni kell a valószínűségekkel.” |
| V8 kedvező-e? (választós) | M(X) alapján kinek kedvez / igazságos-e | előjel | — |
| V9 módusz | eloszlásból a legvalószínűbb érték | max pᵢ-hez tartozó xᵢ | a legnagyobb nyeremény → „A módusz a **legvalószínűbb**, nem a legnagyobb érték.” |

**Számtartományok:** lapok száma 4–20, nyerő lapok 1–(n−1); nyeremények 1–100 (egész, a veszteség negatív); valószínűség **4 tizedesre** (pl. 0,0625), elfogadott tört alak is (`1/16`); várható érték **2 tizedesre**. Az ellenőrző a tört alakot (`3/5`) is fogadja el a valószínűségeknél.

**Ábra:** az eloszlás oszlopdiagramja SVG-n (x: nyeremény, magasság: valószínűség), a várható érték függőleges szaggatott vonallal.

**„Kivetítés 100 játékra”** mint magyarázó elem: a V7 „Miért így?” szövege a 100-zal szemléltetést így használja („100 játékból kb. 16-szor nyerünk 20-at…”).

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
