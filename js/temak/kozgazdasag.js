// 3. téma – Lineáris függvények közgazdasági alkalmazása
import { egesz, valaszt, lepeskoz, kever } from '../lib/rng.js';
import { szep } from '../lib/szam.js';
import { szamMezo, valasztoMezo } from '../lib/ellenorzo.js';
import { koordinataRendszer } from '../lib/abra.js';
import { ertek, xAdottY, ketPontbol } from './linearis.js';
import { probal, f, fe, fz, linKif, tisztit } from './seged.js';

// ---- Tiszta számolófüggvények ----
/** Két egyenes metszéspontja: m1·x + b1 = m2·x + b2 */
export function metszes(m1, b1, m2, b2) {
  const x = tisztit((b2 - b1) / (m1 - m2));
  return { x, y: ertek(m1, b1, x) };
}
/** Eladott mennyiség adott áron: a kereslet és a kínálat közül a kisebb. */
export const eladott = (D, S, p) => Math.min(ertek(D.m, D.b, p), ertek(S.m, S.b, p));
/** Bevétel: ár ($/kg) · mennyiség (tonna) · 1000 */
export const bevetel = (ar, tonna) => tisztit(ar * tonna * 1000);

// ---- Két tarifa (K1–K3) ----
const TAXI_NEVEK = ['Elviszlek', 'Utasokért', 'Gyorstaxi', 'Városi Taxi', 'Sárga Fuvar', 'Éjjel-Nappal Taxi'];

function ketTarifa(rng) {
  return probal(() => {
    const a2 = 50 * egesz(rng, 6, 16);
    const da = 50 * egesz(rng, 1, 6);
    const c1 = 10 * egesz(rng, 22, 34);
    const dc = valaszt(rng, [10, 20, 25, 30, 40, 50]);
    const xs = tisztit(da / dc);
    if (!szep(xs, 2) || xs < 1 || xs > 20 || !szep(ertek(c1, a2 + da, xs), 0)) return null; // a díj egész forint
    const [n1, n2] = kever(rng, TAXI_NEVEK);
    // A: nagyobb alapdíj, kisebb km-díj; B: kisebb alapdíj, nagyobb km-díj
    const A = { nev: n1, a: a2 + da, c: c1 };
    const B = { nev: n2, a: a2, c: c1 + dc };
    A.jel = A.nev[0].toLowerCase();
    B.jel = B.nev[0].toLowerCase() === A.jel ? 'g' : B.nev[0].toLowerCase();
    const ys = ertek(A.c, A.a, xs);
    const sorrend = rng() < 0.5 ? [A, B] : [B, A];
    return { A, B, xs, ys, sorrend };
  });
}
const tarifaKif = (T) => `${T.jel}(x) = ${f(T.a)} + ${f(T.c)}x`;
const tarifaSzoveg = (t) =>
  `Két taxitársaság díjszabása (x = a megtett kilométerek száma, a díj Ft-ban): ${t.sorrend.map((T) => `<strong>${T.nev}</strong>: ${tarifaKif(T)}`).join('; ')}.`;

function tarifaAbra(t, extra = {}) {
  const xmax = Math.max(4, Math.ceil(t.xs * 2));
  const ymax = ertek(t.B.c, t.B.a, xmax);
  const lepes = ymax > 6000 ? 1000 : 500;
  return koordinataRendszer({
    xmin: 0, xmax, ymin: 0, ymax: Math.ceil(ymax / lepes) * lepes,
    xlepes: xmax > 20 ? 5 : xmax > 10 ? 2 : 1, ylepes: lepes,
    egyenesek: [
      { m: t.A.c, b: t.A.a, cimke: t.A.nev, osztaly: 'v1' },
      { m: t.B.c, b: t.B.a, cimke: t.B.nev, osztaly: 'v2' },
    ],
    pontok: [{ x: t.xs, y: t.ys, cimke: `(${f(t.xs)}; ${f(t.ys)})` }],
    xfelirat: 'km', yfelirat: 'Ft',
    leiras: `A két tarifa egyenese; ${f(t.xs)} km-nél metszik egymást.`,
    ...extra,
  });
}

function K1(rng) {
  const t = ketTarifa(rng);
  return probal(() => {
    const T = valaszt(rng, [t.A, t.B]);
    const x = lepeskoz(rng, 1, 20, 0.5);
    const Y = ertek(T.c, T.a, x);
    const d = lepeskoz(rng, 1, Math.max(4, Math.ceil(t.xs * 2)), 0.5);
    if (Math.abs(d - t.xs) < 0.5) return null;
    const dA = ertek(t.A.c, t.A.a, d), dB = ertek(t.B.c, t.B.a, d);
    if (!szep(Y, 0) || !szep(dA, 0) || !szep(dB, 0)) return null; // egész forintok
    const olcsobb = dA < dB ? t.A : t.B;
    const uz = `Helyettesítse be az x = ${f(d)} értéket mindkét függvénybe, és hasonlítsa össze a két díjat.`;
    return {
      szoveg: tarifaSzoveg(t),
      mezok: [
        szamMezo({ id: 'x', cimke: `A(z) ${T.nev} taxival ${fe(Y, 'Ft')}-ot fizettünk. Hány km-t utaztunk?`, helyes: x, tizedes: 2, egyseg: 'km',
          hibak: [
            { ertek: tisztit(Y / T.c), uzenet: 'Előbb az alapdíjat vonja le, és csak utána osszon a kilométerdíjjal.' },
            { ertek: tisztit((Y + T.a) / T.c), uzenet: 'Rendezésnél az ellenkező műveletet végezze: az alapdíjat kivonjuk.' },
          ] }),
        valasztoMezo({ id: 'o', cimke: `Melyik társaság olcsóbb egy ${f(d)} km-es útnál?`,
          opciok: [t.A, t.B].map((T2) => ({ szoveg: T2.nev, helyes: T2 === olcsobb, uzenet: T2 === olcsobb ? '' : uz }))
            .concat([{ szoveg: 'egyforma a díj', helyes: false, uzenet: uz }]) }),
      ],
      tippek: [
        `a) ${tarifaKif(T)} = ${f(Y)} – rendezzen x-re (először az alapdíjat vonja le).`,
        `b) Számolja ki mindkét díjat x = ${f(d)} esetén: ${t.A.jel}(${f(d)}) és ${t.B.jel}(${f(d)}).`,
      ],
      megoldas: [
        `a) ${f(T.a)} + ${f(T.c)}x = ${f(Y)} → ${f(T.c)}x = ${f(Y - T.a)} → x = <strong>${fe(x, 'km')}</strong>.`,
        `b) ${t.A.nev}: ${f(t.A.a)} + ${f(t.A.c)} · ${f(d)} = ${fe(dA, 'Ft')}; ${t.B.nev}: ${f(t.B.a)} + ${f(t.B.c)} · ${f(d)} = ${fe(dB, 'Ft')}.`,
        `${f(d)} km-nél a(z) <strong>${olcsobb.nev}</strong> olcsóbb.`,
      ],
      abraMegoldas: tarifaAbra(t),
      jegyezze: 'Adott díjnál a km: rendezés (alapdíj levonása, osztás). Összehasonlításhoz mindkét függvénybe ugyanazt az x-et írjuk.',
    };
  });
}

function K2(rng) {
  const t = ketTarifa(rng);
  const [P, Q] = t.sorrend;
  return {
    szoveg: tarifaSzoveg(t) + ' Hány km-es útnál fizetünk ugyanannyit a két társaságnál, és mennyit?',
    mezok: [
      szamMezo({ id: 'x', cimke: 'Távolság (km)', helyes: t.xs, tizedes: 2, egyseg: 'km',
        hibak: [{ ertek: tisztit((t.A.a + t.B.a) / (t.B.c - t.A.c)), uzenet: 'Rendezésnél az alapdíjakat kivonjuk egymásból (ellenkező művelet), nem összeadjuk.' }] }),
      szamMezo({ id: 'y', cimke: 'A díj ekkor (Ft)', helyes: t.ys, tizedes: 2, egyseg: 'Ft' }),
    ],
    tippek: [
      'Egyforma díj → a két kifejezést egyenlővé tesszük.',
      `${f(P.a)} + ${f(P.c)}x = ${f(Q.a)} + ${f(Q.c)}x – az x-es tagokat egy oldalra, a számokat a másikra.`,
      `${f(t.B.c - t.A.c)}x = ${f(t.A.a - t.B.a)}. A díjhoz az x-et bármelyik függvénybe visszaírhatja.`,
    ],
    megoldas: [
      `${f(P.a)} + ${f(P.c)}x = ${f(Q.a)} + ${f(Q.c)}x.`,
      `${f(t.B.c)}x − ${f(t.A.c)}x = ${f(t.A.a)} − ${f(t.B.a)} → ${f(t.B.c - t.A.c)}x = ${f(t.A.a - t.B.a)} → x = <strong>${fe(t.xs, 'km')}</strong>.`,
      `A díj: ${t.A.jel}(${f(t.xs)}) = ${f(t.A.a)} + ${f(t.A.c)} · ${f(t.xs)} = <strong>${fe(t.ys, 'Ft')}</strong> (ellenőrzés: ${t.B.jel}(${f(t.xs)}) = ${f(ertek(t.B.c, t.B.a, t.xs))}).`,
    ],
    abraMegoldas: tarifaAbra(t),
    jegyezze: 'Két lineáris függvény metszéspontja: a két kifejezést egyenlővé tesszük.',
  };
}

function K3(rng) {
  const t = ketTarifa(rng);
  const X = valaszt(rng, [t.A, t.B]);
  const rovid = X === t.B; // a kisebb alapdíjú a rövid utaknál olcsóbb
  const uzForditott = 'Fordított irány! Nézze meg, melyik egyenes van lejjebb 0 km-nél: ott a kisebb alapdíjú az olcsóbb, és a metszéspontig az is marad.';
  return {
    szoveg: tarifaSzoveg(t) + ` Milyen hosszú utaknál olcsóbb a(z) ${X.nev}?`,
    mezok: [
      szamMezo({ id: 'x', cimke: 'A határ (km), ahol a két díj egyforma', helyes: t.xs, tizedes: 2, egyseg: 'km' }),
      valasztoMezo({ id: 'irany', cimke: `Mikor olcsóbb a(z) ${X.nev}?`, opciok: [
        { szoveg: 'ha az út rövidebb a határnál (x kisebb)', helyes: rovid, uzenet: rovid ? '' : uzForditott },
        { szoveg: 'ha az út hosszabb a határnál (x nagyobb)', helyes: !rovid, uzenet: rovid ? uzForditott : '' },
        { szoveg: 'mindig', helyes: false, uzenet: 'A két egyenes metszi egymást, ezért a metszéspont után megfordul a sorrend.' },
      ] }),
    ],
    tippek: [
      `„Mikor olcsóbb?” → egyenlőtlenség: ${X.jel}(x) < ${(X === t.A ? t.B : t.A).jel}(x). Ugyanúgy rendezzük, mint az egyenletet.`,
      'Nézze meg, melyik egyenes van lejjebb 0 km-nél (a kisebb alapdíjú) – a metszéspontig az az olcsóbb.',
      'Ha negatív számmal oszt, az egyenlőtlenség iránya megfordul!',
    ],
    megoldas: [
      `${X.jel}(x) < ${(X === t.A ? t.B : t.A).jel}(x): ${f(X.a)} + ${f(X.c)}x < ${f((X === t.A ? t.B : t.A).a)} + ${f((X === t.A ? t.B : t.A).c)}x.`,
      rovid
        ? `${f(t.B.c - t.A.c)}x < ${f(t.A.a - t.B.a)} → x < ${f(t.xs)}.`
        : `${f(t.A.a - t.B.a)} < ${f(t.B.c - t.A.c)}x → x > ${f(t.xs)}.`,
      `A(z) ${X.nev} <strong>${rovid ? `${f(t.xs)} km-nél rövidebb` : `${f(t.xs)} km-nél hosszabb`}</strong> utaknál olcsóbb (a határ: <strong>${fe(t.xs, 'km')}</strong>).`,
    ],
    abraMegoldas: tarifaAbra(t),
    jegyezze: '„Mikor olcsóbb?” → egyenlőtlenség. A kisebb alapdíjú tarifa a metszéspontig olcsóbb, utána a kisebb km-díjú.',
  };
}

// ---- Kereslet (K4, K5) ----
function keresletKontextus(rng) {
  if (rng() < 0.5) {
    return probal(() => {
      const m = -egesz(rng, 1, 5);
      const b = 50 * egesz(rng, 16, 60);
      const p1 = 10 * egesz(rng, 10, 20), p2 = p1 + 10 * egesz(rng, 4, 12);
      const q1 = ertek(m, b, p1), q2 = ertek(m, b, p2);
      if (q2 < 200) return null;
      return { m, b, p1, p2, q1, q2, pmin: p1, pmax: p2, ae: 'Ft', qe: 'liter', arSzo: 'Ft-os', tizedes: 2,
        bev: 'Egy boltban a tej literenkénti ára (p, Ft) és a napi kereslet (liter) között lineáris a kapcsolat.' };
    });
  }
  return probal(() => {
    const m = valaszt(rng, [-0.5, -1, -1.5, -2]);
    const b = lepeskoz(rng, 6, 12, 0.5);
    const p1 = lepeskoz(rng, 1, 3, 0.2), p2 = tisztit(p1 + lepeskoz(rng, 0.4, 2, 0.2));
    const q1 = ertek(m, b, p1), q2 = ertek(m, b, p2);
    if (q2 < 1 || !szep(q1, 2) || !szep(q2, 2)) return null;
    return { m, b, p1, p2, q1, q2, pmin: p1, pmax: p2, ae: '$/kg', qe: 't', arSzo: '$/kg-os', tizedes: 2,
      bev: 'Egy város kenyérpiacán a kenyér ára (p, $/kg) és a napi kereslet (tonna) között lineáris a kapcsolat.' };
  });
}

function K4(rng) {
  const k = keresletKontextus(rng);
  return {
    szoveg: `${k.bev} ${f(k.p1)} ${k.arSzo} árnál ${fe(k.q1, k.qe)}, ${f(k.p2)} ${k.arSzo} árnál ${fe(k.q2, k.qe)} a kereslet. Írja fel a keresleti függvényt D(p) = m·p + b alakban!`,
    mezok: [
      szamMezo({ id: 'm', cimke: 'Meredekség (m)', helyes: k.m, tizedes: 2,
        hibak: [
          { ertek: -k.m, uzenet: 'Előjel: a kereslet az ár növekedésével csökken, ezért a meredekség negatív.' },
          { ertek: tisztit(1 / k.m), uzenet: 'Fordítva osztott: m = Δ(kereslet) / Δ(ár) – az ár az x (független változó).' },
        ] }),
      szamMezo({ id: 'b', cimke: 'Konstans tag (b)', helyes: k.b, tizedes: 2,
        hibak: [
          { ertek: tisztit(k.q1 + k.m * k.p1), uzenet: 'Rendezésnél az ellenkező műveletet végezze: b = y₁ − m · x₁ (m negatív, így itt hozzáadunk).' },
          { ertek: tisztit(k.p1 - k.m * k.q1), uzenet: 'Az ár az x (első koordináta), a kereslet az y (második koordináta) – x helyére az árat írja.' },
        ] }),
    ],
    tippek: [
      'Az ár a független változó (x), a kereslet a függő (y). Két pont: (ár; kereslet).',
      `① m = (${f(k.q2)} − ${f(k.q1)}) / (${f(k.p2)} − ${f(k.p1)}).`,
      `② Az első pontot beírva: ${f(k.q1)} = m · ${f(k.p1)} + b, ebből b.`,
    ],
    megoldas: [
      `① m = Δy / Δx = (${f(k.q2)} − ${f(k.q1)}) / (${f(k.p2)} − ${f(k.p1)}) = ${f(k.q2 - k.q1)} / ${f(k.p2 - k.p1)} = <strong>${f(k.m)}</strong>.`,
      `② ${f(k.q1)} = ${f(k.m)} · ${f(k.p1)} + b = ${f(k.m * k.p1)} + b → b = ${f(k.q1)} + ${f(-k.m * k.p1)} = <strong>${f(k.b)}</strong>.`,
      `③ D(p) = ${linKif(k.m, k.b, 'p')} (${f(k.pmin)} ≤ p ≤ ${f(k.pmax)} között érvényes).`,
      `Jelentés: 1 egységnyi áremelés ${f(-k.m)} ${k.qe === 't' ? 'tonnával' : 'literrel'} csökkenti a keresletet.`,
    ],
    jegyezze: 'A keresleti függvény általában csökkenő (m < 0). Az ár az x, a kereslet az y.',
  };
}

function K5(rng) {
  return probal(() => {
    const k = keresletKontextus(rng);
    const fv = `D(p) = ${linKif(k.m, k.b, 'p')}`;
    const arKerdes = rng() < 0.5;
    const p = k.ae === 'Ft' ? 10 * egesz(rng, k.pmin / 10, k.pmax / 10) : lepeskoz(rng, k.pmin, k.pmax, 0.1);
    const q = ertek(k.m, k.b, p);
    if (!szep(q, 2)) return null;
    const alap = `${k.bev} A keresleti függvény: ${fv} (${f(k.pmin)} ≤ p ≤ ${f(k.pmax)}).`;
    if (!arKerdes) {
      return {
        szoveg: `${alap} Mekkora a kereslet ${f(p)} ${k.arSzo} árnál?`,
        mezok: [szamMezo({ cimke: `Kereslet (${k.qe})`, helyes: q, tizedes: 2, egyseg: k.qe,
          hibak: [
            { ertek: xAdottY(k.m, k.b, p), uzenet: 'Az x és az y felcserélődött: az ár a független változó (x), ezt kell a p helyére írni.' },
            { ertek: tisztit(k.m * p), uzenet: 'Kimaradt a konstans tag (b): D(p) = m · p + b.' },
          ] })],
        tippek: ['Az ár ismert → p helyére írja be.', `D(${f(p)}) = ${f(k.m)} · ${f(p)} + ${f(k.b)}.`],
        megoldas: [`D(${f(p)}) = ${f(k.m)} · ${f(p)} + ${f(k.b)} = ${f(k.m * p)} + ${f(k.b)} = <strong>${fe(q, k.qe)}</strong>.`],
        jegyezze: 'Az ár a független változó (x): adott árnál a keresletet behelyettesítéssel kapjuk.',
      };
    }
    return {
      szoveg: `${alap} Milyen árnál lesz a kereslet ${fe(q, k.qe)}?`,
      mezok: [szamMezo({ cimke: `Ár (${k.ae})`, helyes: p, tizedes: 2, egyseg: k.ae,
        hibak: [
          { ertek: ertek(k.m, k.b, q), uzenet: `A megadott szám a kereslet (y), nem az ár: D(p) = ${f(q)}, és p-re rendezünk.` },
          { ertek: -p, uzenet: 'Előjelhiba: negatív számmal osztva figyeljen az előjelre – az ár pozitív.' },
        ] })],
      tippek: ['A kereslet (y) ismert → D(p) = adott szám, és p-re rendezünk.', `${linKif(k.m, k.b, 'p')} = ${f(q)} → ${f(k.m)}p = ${f(q - k.b)}.`],
      megoldas: [
        `${linKif(k.m, k.b, 'p')} = ${f(q)}.`,
        `${f(k.m)}p = ${f(q)} − ${f(k.b)} = ${f(q - k.b)} → p = ${f(q - k.b)} : ${fz(k.m)} = <strong>${fe(p, k.ae)}</strong>.`,
      ],
      jegyezze: 'Ha a kereslet ismert, az y helyére írjuk, és az árra (x) rendezünk.',
    };
  });
}

// ---- Kereslet–kínálat (K6, K7) ----
function piac(rng) {
  return probal(() => {
    const a = valaszt(rng, [0.5, 1, 1.5, 2]);
    const c = valaszt(rng, [0.5, 1, 1.5, 2, 2.5]);
    const xs = lepeskoz(rng, 2, 6, 0.5);
    const ys = lepeskoz(rng, 2, 10, 0.5);
    const D = { m: -a, b: tisztit(ys + a * xs) };
    const S = { m: c, b: tisztit(ys - c * xs) };
    // a kínálat legyen pozitív az egyensúly alatti, vizsgált árakon is
    if (ertek(S.m, S.b, xs - 1) <= 0) return null;
    return { D, S, xs, ys };
  });
}

function piacAbra(P, p) {
  const xmax = Math.ceil(P.xs + 3);
  const ymax = Math.ceil(Math.max(ertek(P.D.m, P.D.b, Math.max(0, P.xs - 3)), ertek(P.S.m, P.S.b, xmax)) + 1);
  return koordinataRendszer({
    xmin: 0, xmax, ymin: 0, ymax, xlepes: 1, ylepes: ymax > 16 ? 2 : 1,
    egyenesek: [{ ...P.D, cimke: 'D (kereslet)', osztaly: 'v1' }, { ...P.S, cimke: 'S (kínálat)', osztaly: 'v2' }],
    pontok: [{ x: P.xs, y: P.ys, cimke: `E (${f(P.xs)}; ${f(P.ys)})` }],
    fuggolegesek: p !== undefined ? [{ x: p, cimke: `p = ${f(p)}` }] : [],
    xfelirat: 'ár ($/kg)', yfelirat: 'mennyiség (t)',
    leiras: `Keresleti és kínálati egyenes; az egyensúlyi pont: ár ${f(P.xs)} $/kg, mennyiség ${f(P.ys)} tonna.`,
  });
}

const piacSzoveg = (P) =>
  `Egy város kenyérpiacán (x = ár, $/kg; a mennyiség tonnában) a keresleti függvény D(x) = ${linKif(P.D.m, P.D.b)}, a kínálati függvény S(x) = ${linKif(P.S.m, P.S.b)}.`;

function K6(rng) {
  const P = piac(rng);
  let szoveg = piacSzoveg(P);
  const elozetes = [];
  if (rng() < 0.5) {
    // két pontból megadott változat (mint a hétfő–péntek példa)
    const p1 = tisztit(P.xs - lepeskoz(rng, 0.2, 1, 0.2));
    const p2 = tisztit(P.xs + lepeskoz(rng, 0.2, 1, 0.2));
    const d1 = ertek(P.D.m, P.D.b, p1), d2 = ertek(P.D.m, P.D.b, p2);
    const s1 = ertek(P.S.m, P.S.b, p1), s2 = ertek(P.S.m, P.S.b, p2);
    szoveg = `Egy város kenyérpiacán hétfőn ${f(p1)} $/kg árnál a kínálat ${fe(s1, 't')}, a kereslet ${fe(d1, 't')} volt; pénteken ${f(p2)} $/kg árnál a kínálat ${fe(s2, 't')}, a kereslet ${fe(d2, 't')}. A kereslet és a kínálat is lineárisan függ az ártól.`;
    elozetes.push(
      `Kereslet két pontból: m = (${f(d2)} − ${f(d1)}) / (${f(p2)} − ${f(p1)}) = ${f(P.D.m)}, b = ${f(d1)} − ${fz(P.D.m)} · ${f(p1)} = ${f(P.D.b)} → D(x) = ${linKif(P.D.m, P.D.b)}.`,
      `Kínálat két pontból: m = (${f(s2)} − ${f(s1)}) / (${f(p2)} − ${f(p1)}) = ${f(P.S.m)}, b = ${f(s1)} − ${f(P.S.m)} · ${f(p1)} = ${f(P.S.b)} → S(x) = ${linKif(P.S.m, P.S.b)}.`,
    );
  }
  const a = -P.D.m, c = P.S.m;
  return {
    szoveg: szoveg + ' Mennyi az egyensúlyi ár és az egyensúlyi mennyiség?',
    mezok: [
      szamMezo({ id: 'x', cimke: 'Egyensúlyi ár ($/kg)', helyes: P.xs, tizedes: 2, egyseg: '$/kg',
        hibak: [{ ertek: tisztit((P.D.b + P.S.b) / (a + c)), uzenet: 'Rendezésnél figyeljen az előjelekre: a konstans tagokat kivonjuk egymásból.' }] }),
      szamMezo({ id: 'y', cimke: 'Egyensúlyi mennyiség (t)', helyes: P.ys, tizedes: 2, egyseg: 't' }),
    ],
    tippek: [
      ...(elozetes.length ? ['Először írja fel mindkét függvényt két pontból (m = Δy/Δx, majd b).'] : []),
      'Egyensúly: kereslet = kínálat → a két kifejezést egyenlővé tesszük.',
      `${linKif(P.D.m, P.D.b)} = ${linKif(P.S.m, P.S.b)} → x-es tagok egy oldalra, számok a másikra. A mennyiséghez az árat írja vissza.`,
    ],
    megoldas: [
      ...elozetes,
      `D(x) = S(x): ${linKif(P.D.m, P.D.b)} = ${linKif(P.S.m, P.S.b)}.`,
      `${f(P.D.b)} − ${fz(P.S.b)} = ${f(c)}x + ${f(a)}x → ${f(P.D.b - P.S.b)} = ${f(a + c)}x → x = <strong>${f(P.xs)} $/kg</strong>.`,
      `Mennyiség: D(${f(P.xs)}) = ${f(P.D.m)} · ${f(P.xs)} + ${f(P.D.b)} = <strong>${fe(P.ys, 't')}</strong> (ellenőrzés: S(${f(P.xs)}) = ${f(ertek(P.S.m, P.S.b, P.xs))}).`,
    ],
    abraMegoldas: piacAbra(P),
    jegyezze: 'Egyensúlyi ár és mennyiség: ahol a kereslet = kínálat, vagyis a két egyenes metszéspontja.',
  };
}

function K7(rng) {
  return probal(() => {
    const P = piac(rng);
    const p = tisztit(P.xs + valaszt(rng, [-1, 1]) * lepeskoz(rng, 0.2, 1.5, 0.1));
    const d = ertek(P.D.m, P.D.b, p), s = ertek(P.S.m, P.S.b, p);
    if (d <= 0 || s <= 0 || Math.abs(d - s) < 0.01) return null;
    const q = Math.min(d, s), Q = Math.max(d, s);
    const R = bevetel(p, q);
    if (!szep(R, 0)) return null;
    return {
      szoveg: piacSzoveg(P) + ` Mennyi lesz a piac bevétele ($), ha a kenyér ára ${f(p)} $/kg?`,
      mezok: [szamMezo({ cimke: 'Bevétel ($)', helyes: R, tizedes: 0, egyseg: '$',
        hibak: [
          { ertek: bevetel(p, Q), uzenet: 'Csak annyit tudnak eladni, amennyi a kereslet és a kínálat közül a kevesebb.' },
          { ertek: tisztit(p * q), uzenet: 'Az ár kg-ra vonatkozik, a mennyiség tonnában van: 1 t = 1000 kg.' },
          { ertek: tisztit(p * Q), uzenet: 'Két hiba: az eladott mennyiség a kisebbik (kereslet vagy kínálat), és 1 t = 1000 kg.' },
          { ertek: bevetel(P.xs, P.ys), uzenet: `Ez az egyensúlyi bevétel. Most az ár ${f(p)} $/kg, nem az egyensúlyi ár.` },
        ] })],
      tippek: [
        `Számolja ki ${f(p)} $/kg árnál a keresletet és a kínálatot is.`,
        'Eladni csak a kisebbiket lehet: ha kevesebben akarnak venni, a kereslet; ha kevesebbet kínálnak, a kínálat korlátoz.',
        'Bevétel = ár · eladott mennyiség – az ár $/kg, a mennyiség tonna (1 t = 1000 kg).',
      ],
      megoldas: [
        `D(${f(p)}) = ${f(P.D.m)} · ${f(p)} + ${f(P.D.b)} = ${fe(d, 't')}; S(${f(p)}) = ${f(P.S.m)} · ${f(p)} + ${fz(P.S.b)} = ${fe(s, 't')}.`,
        `Eladott mennyiség: a kisebbik, ${fe(q, 't')} = ${f(q * 1000)} kg (${d < s ? 'a kereslet korlátoz' : 'a kínálat korlátoz'}).`,
        `Bevétel = ${f(p)} · ${f(q * 1000)} = <strong>${fe(R, '$', 0)}</strong>.`,
      ],
      abraMegoldas: piacAbra(P, p),
      jegyezze: 'Nem egyensúlyi árnál a kereslet és a kínálat közül a kisebb valósul meg. Bevételnél figyeljen a mértékegységekre!',
    };
  });
}

function peldaKenyerAbra() {
  return piacAbra({ D: { m: -0.5, b: 5.5 }, S: { m: 1, b: 1 }, xs: 3, ys: 4 });
}
function peldaTaxiAbra() {
  const t = { A: { nev: 'Elviszlek', a: 450, c: 280 }, B: { nev: 'Utasokért', a: 350, c: 300 }, xs: 5, ys: 1850 };
  return tarifaAbra(t);
}

export default {
  id: 'kozgazdasag',
  cim: 'Lineáris függvények a közgazdaságtanban',
  rovid: 'Két tarifa összehasonlítása, kereslet és kínálat, egyensúly, bevétel.',
  kulcskeplet: '<span class="keplet-nagy">D(x) = S(x)</span>',
  kulcsMagyarazat: [
    'Két lineáris függvény metszéspontja: a két kifejezést egyenlővé tesszük (két tarifa díja, kereslet = kínálat).',
    'Bevétel = ár · eladott mennyiség (figyeljen a mértékegységekre: 1 t = 1000 kg).',
  ],
  elmelet: [
    'Két lineáris függvény <strong>metszéspontja</strong>: a két kifejezést egyenlővé tesszük (pl. két taxitársaság díja, kereslet = kínálat).',
    '„Mikor olcsóbb az egyik?” → <strong>egyenlőtlenség</strong>, ugyanúgy rendezzük, mint az egyenletet.',
    '<strong>Kereslet (D, demand):</strong> mennyit hajlandók vásárolni adott áron – általában csökkenő. <strong>Kínálat (S, supply):</strong> mennyit hajlandók termelni/eladni – általában növekvő. Az ár a független változó (x).',
    '<strong>Egyensúlyi ár és mennyiség:</strong> ahol kereslet = kínálat (a két egyenes metszéspontja).',
    '<strong>Eladott mennyiség</strong> nem egyensúlyi árnál: a kereslet és a kínálat közül a <strong>kisebb</strong>.',
    '<strong>Bevétel = ár · eladott mennyiség</strong> – figyeljen a mértékegységekre (ár $/kg, mennyiség tonna → 1 t = 1000 kg).',
    'A modell csak a <strong>vizsgált tartományban</strong> érvényes (pl. tejár 120–240 Ft között); a b („ingyen ár melletti kereslet”) közgazdaságilag nem értelmezhető, ha kívül esik.',
  ],
  peldak: [
    { cim: 'Két taxitársaság', feladat: 'Elviszlek: e(x) = 450 + 280x, Utasokért: u(x) = 350 + 300x (x km, díj Ft-ban). a) Az Elviszleknél 1150 Ft-ot fizettünk – hány km-t utaztunk? b) 8,5 km-nél melyik olcsóbb? c) Hány km-nél egyforma a díj? d) Mikor olcsóbb az Utasokért?',
      abra: peldaTaxiAbra,
      lepesek: ['a) 450 + 280x = 1150 → 280x = 700 → <strong>x = 2,5 km</strong>.', 'b) e(8,5) = 2830 Ft, u(8,5) = 2900 Ft → az <strong>Elviszlek</strong> olcsóbb.', 'c) 450 + 280x = 350 + 300x → 100 = 20x → <strong>x = 5 km</strong> (a díj 1850 Ft).', 'd) 350 + 300x < 450 + 280x → 20x < 100 → <strong>x < 5 km</strong>: rövid utaknál az Utasokért olcsóbb (kisebb az alapdíja).'] },
    { cim: 'Tej keresleti függvénye', feladat: '120 Ft-os literenkénti árnál 1260 liter, 240 Ft-nál 1020 liter a napi kereslet (lineáris). Írja fel és értelmezze! Mennyi a kereslet 200 Ft-nál? Milyen árnál lesz 1200 liter?',
      lepesek: ['① m = (1020 − 1260) / (240 − 120) = −240 / 120 = −2.', '② 1260 = −2 · 120 + b → b = 1500.', '③ D(p) = −2p + 1500 (120 ≤ p ≤ 240). 1 Ft áremelés → 2 literrel kisebb kereslet.', 'D(200) = −400 + 1500 = <strong>1100 liter</strong>.', '−2p + 1500 = 1200 → −2p = −300 → <strong>p = 150 Ft</strong>.'] },
    { cim: 'Kenyérpiac: egyensúly és bevétel', feladat: 'Hétfőn 2,8 $/kg árnál a kínálat 3,8 t, a kereslet 4,1 t; pénteken 3,4 $/kg-nál a kínálat 4,4 t, a kereslet 3,8 t. Határozza meg az egyensúlyt és a bevételt, majd a bevételt 2,5 és 3,2 $/kg árnál!',
      abra: peldaKenyerAbra,
      lepesek: [
        'Kereslet: m = (3,8 − 4,1) / (3,4 − 2,8) = −0,5; b = 4,1 + 0,5 · 2,8 = 5,5 → D: y = −0,5x + 5,5.',
        'Kínálat: m = (4,4 − 3,8) / 0,6 = 1; b = 3,8 − 2,8 = 1 → S: y = x + 1.',
        'Egyensúly: −0,5x + 5,5 = x + 1 → 4,5 = 1,5x → <strong>x = 3 $/kg</strong>, y = <strong>4 t</strong>.',
        'Bevétel egyensúlyban: 3 $/kg · 4000 kg = <strong>12 000 $</strong>.',
        '2,5 $/kg: D = 4,25 t, S = 3,5 t → eladás a kisebb: 3,5 t → 2,5 · 3500 = <strong>8750 $</strong>.',
        '3,2 $/kg: D = 3,9 t, S = 4,2 t → eladás 3,9 t → 3,2 · 3900 = <strong>12 480 $</strong>.',
      ] },
  ],
  tipusok: [
    { id: 'K1', nev: 'Két tarifa: km és összehasonlítás', general: K1 },
    { id: 'K2', nev: 'Két tarifa: mikor egyforma?', general: K2 },
    { id: 'K3', nev: 'Két tarifa: mikor olcsóbb?', general: K3 },
    { id: 'K4', nev: 'Keresleti függvény két pontból', general: K4 },
    { id: 'K5', nev: 'Kereslet adott áron / ár adott keresletnél', general: K5 },
    { id: 'K6', nev: 'Egyensúlyi ár és mennyiség', general: K6 },
    { id: 'K7', nev: 'Bevétel adott áron', general: K7 },
  ],
  peldaEllenorzes() {
    const t = metszes(280, 450, 300, 350);
    const tej = ketPontbol(120, 1260, 240, 1020);
    const D = ketPontbol(2.8, 4.1, 3.4, 3.8);
    const S = ketPontbol(2.8, 3.8, 3.4, 4.4);
    const e = metszes(D.m, D.b, S.m, S.b);
    return [
      { nev: 'Taxi: 1150 Ft → km', kapott: xAdottY(280, 450, 1150), vart: 2.5 },
      { nev: 'Taxi: Elviszlek 8,5 km', kapott: ertek(280, 450, 8.5), vart: 2830 },
      { nev: 'Taxi: Utasokért 8,5 km', kapott: ertek(300, 350, 8.5), vart: 2900 },
      { nev: 'Taxi: egyforma km', kapott: t.x, vart: 5 },
      { nev: 'Taxi: egyforma díj', kapott: t.y, vart: 1850 },
      { nev: 'Tej: m', kapott: tej.m, vart: -2 },
      { nev: 'Tej: b', kapott: tej.b, vart: 1500 },
      { nev: 'Tej: D(200)', kapott: ertek(tej.m, tej.b, 200), vart: 1100 },
      { nev: 'Tej: 1200 l → ár', kapott: xAdottY(tej.m, tej.b, 1200), vart: 150 },
      { nev: 'Kenyér: D meredekség', kapott: D.m, vart: -0.5 },
      { nev: 'Kenyér: D b', kapott: D.b, vart: 5.5 },
      { nev: 'Kenyér: S meredekség', kapott: S.m, vart: 1 },
      { nev: 'Kenyér: S b', kapott: S.b, vart: 1 },
      { nev: 'Kenyér: egyensúlyi ár', kapott: e.x, vart: 3 },
      { nev: 'Kenyér: egyensúlyi mennyiség', kapott: e.y, vart: 4 },
      { nev: 'Kenyér: bevétel egyensúlyban', kapott: bevetel(e.x, e.y), vart: 12000 },
      { nev: 'Kenyér: 2,5 $/kg eladott', kapott: eladott(D, S, 2.5), vart: 3.5 },
      { nev: 'Kenyér: 2,5 $/kg bevétel', kapott: bevetel(2.5, eladott(D, S, 2.5)), vart: 8750 },
      { nev: 'Kenyér: 3,2 $/kg eladott', kapott: eladott(D, S, 3.2), vart: 3.9 },
      { nev: 'Kenyér: 3,2 $/kg bevétel', kapott: bevetel(3.2, eladott(D, S, 3.2)), vart: 12480 },
    ];
  },
};
