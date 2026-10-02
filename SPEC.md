# Gazdasági matematika gyakorló – fejlesztési leírás

Ez a fájl a megrendelő (oktató) igényeit és a teljes szakmai tartalmat írja le. A fejlesztés ebből dolgozzon.

## 1. Cél és közönség

- Böngészőben futó **gyakorlóoldal** a Kodolányi János Egyetem „Gazdasági matematika” tárgyához.
- Felhasználók: felnőtt, levelezős hallgatók, sokan **nem matematikusok**. A hangnem barátságos, türelmes, magázó („Önök/Ön” helyett elég a semleges, felszólító forma: „Írja be…”, „Nézze meg…”).
- Az oktató **online órán** is használja, ezért kivetítve is jól olvasható legyen (nagy betű, tiszta elrendezés).
- Első verzió: **3 téma** (lent). Később újabb témák jönnek → a tartalom legyen könnyen bővíthető (téma = külön adatfájl/modul).

## 2. Technikai keretek

- **Statikus oldal**, GitHub Pages-en fut a repo gyökeréből (`main` / root). Kezdőoldal: `index.html`.
- Csak HTML + CSS + vanilla JavaScript (ES modulok). **Nincs build lépés, nincs npm-függőség** a futtatáshoz.
- Külső könyvtár nem kell. Ha mégis (pl. képletekhez KaTeX), csak megbízható CDN-ről, rögzített verzióval – de előnyben a sima HTML (`<sub>`, `·`, `−`).
- **Belépés nincs.** A haladás csak a hallgató saját böngészőjében (`localStorage`) mentődik; ha nem elérhető, az oldal akkor is működjön.
- **Nincs adatgyűjtés**, nincs analitika, nincs külső kérés.
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

## 4. Válaszellenőrzés szabályai (FONTOS)

A régi Excel-munkafüzet hibáiból tanulva:

1. **Tizedesvessző és tizedespont is elfogadott** (`8,2` és `8.2`). Szóköz mint ezres elválasztó elfogadott (`1 069 200`).
2. **Mértékegység / % jel** a válasz végén ne okozzon hibát: a `%`, `$`, `€`, `Ft`, `kg`, `km`, `liter`, `év`, `tonna` stb. utótagot az ellenőrző levágja. (A tesztben viszont kiírjuk, hogy csak szám kell.)
3. **Tűrés**: a feladat definiálja a kért pontosságot (pl. „egy tizedesre kerekítve”). Elfogadás, ha a kerekített érték egyezik, vagy az eltérés ≤ a kért pontosság fele. Pontosabb válasz (pl. 11,11 a 11,1 helyett) is legyen **jó**.
4. **Előjel egységesen**: a „hány százalékkal csökkent” típusú kérdésre a **pozitív** szám a jó (16), de a −16-ot is fogadja el egy megjegyzéssel („A csökkenés mértéke 16 %; a kérdés »mennyivel csökkent«, ezért elég a 16.”). A „változás (%)” típusú kérdésnél (előjeles) a negatív a jó, a pozitívra figyelmeztessen.
5. Képletet (`=280/1,12`) nem kell értelmezni.

### 4.3 Próbateszt

- 10 véletlen feladat a 3 témából (arányosan), **20 perc** időkorlát az egész tesztre (nem feladatonként – ezt ki is írja).
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
