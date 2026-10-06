// Felvételi-gyakorló (8. évfolyam): a helyes válaszokat a feladat szövegéből visszaolvasott számokból,
// a generátortól függetlenül (nyers erővel, szimulációval) újraszámoljuk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ujRng } from '../js/lib/rng.js';
import { formaz, ertelmez } from '../js/lib/szam.js';
import { ellenoriz, helyesE } from '../js/lib/ellenorzo.js';
import { FELVETELI_TEMAK } from '../js/temak/index.js';
import { tesztFeladatok } from '../js/lib/teszt-osszeallito.js';
import { sima, szamok } from './segito.js';

const MINTA = 300;
const tema = (id) => FELVETELI_TEMAK.find((t) => t.id === id);
const szam = (s) => Number(String(s).replace(/\s/g, '').replace('−', '-').replace(',', '.'));
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/** Egy típus mintavételezése: ellenőrzi, hogy a mező helyes értéke megegyezik az újraszámolttal, és elfogadja. */
function futtat(temaId, tipusId, ujraszamol) {
  const tipus = tema(temaId).tipusok.find((t) => t.id === tipusId);
  const rng = ujRng(7000 + tipusId.charCodeAt(0) * 31 + Number(tipusId.slice(1)));
  for (let i = 0; i < MINTA; i++) {
    const f = tipus.general(rng);
    const s = sima(f.szoveg);
    const vart = ujraszamol(s, szamok(f.szoveg).map(Math.abs)); // a „−” művelet jel, nem előjel
    const m = f.mezok[0];
    assert.ok(close(m.helyes, vart, 1e-9), `${tipusId}: ${s} → generátor ${m.helyes}, újraszámolt ${vart}`);
    assert.equal(ellenoriz(m, formaz(m.helyes, Math.max(m.tizedes, 3))).allapot, 'jo', `a helyes válasz elfogadott – ${s}`);
    for (const h of m.hibak) assert.ok(!helyesE(ellenoriz(m, formaz(h.ertek, 4))) || close(h.ertek, m.helyes, 0.01), `a tipikus hiba nem helyes – ${s}: ${h.ertek}`);
  }
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// ---------- 1. Számok ----------
test('S1 – törtek összege/különbsége', () => futtat('fv-szamok', 'S1', (s) => {
  const m = s.match(/: (\d+)(?:\/(\d+))? ([+−]) (\d+)\/(\d+)$/);
  const bal = m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]);
  const jobb = Number(m[4]) / Number(m[5]);
  return m[3] === '+' ? bal + jobb : bal - jobb;
}));
test('S2 – tört része, négyzete', () => futtat('fv-szamok', 'S2', (s, n) => {
  if (/\)² értéke/.test(s)) return (n[0] / n[1]) ** 2;
  return (n[0] * n[1]) / n[2];
}));
test('S3 – osztók száma', () => futtat('fv-szamok', 'S3', (s, n) => { let d = 0; for (let i = 1; i <= n[0]; i++) if (n[0] % i === 0) d++; return d; }));
test('S4 – LNKO, LKKT', () => futtat('fv-szamok', 'S4', (s, n) => {
  const [a, b] = n;
  if (/legnagyobb közös osztója/.test(s)) { let r = 1; for (let i = 1; i <= Math.min(a, b); i++) if (a % i === 0 && b % i === 0) r = i; return r; }
  let t = Math.max(a, b);
  while (t % a || t % b) t++;
  return t;
}));

// ---------- 2. Mértékegységek ----------
test('E1 – idő', () => futtat('fv-mertek', 'E1', (s, n) => {
  if (/nap \+/.test(s)) return n[0] * 24 + n[1];
  if (/óra − .* perc/.test(s)) return n[0] * 60 - n[1];
  return (n[0] / n[1]) * 60;
}));
test('E2 – hosszúság', () => futtat('fv-mertek', 'E2', (s, n) => {
  if (/km − .* m = … m/.test(s)) return n[0] * 1000 - n[1];
  if (/m \+ .* mm = … cm/.test(s)) return n[0] * 100 + n[1] / 10;
  return (n[0] * 1000 + n[1]) * 10;
}));
test('E3 – űrtartalom', () => futtat('fv-mertek', 'E3', (s, n) => {
  if (/liter − .* cm³/.test(s)) return n[0] * 1000 - n[1];
  if (/m³ − .* liter/.test(s)) return n[0] * 1000 - n[1];
  return n[0] * 100 + n[1];
}));
test('E4 – terület', () => futtat('fv-mertek', 'E4', (s, n) => {
  if (/ha \+ .* m² = … m²/.test(s)) return n[0] * 10000 + n[1];
  if (/m² − .* dm²/.test(s)) return n[0] * 100 - n[1];
  return n[0] * 100;
}));
test('E5 – sebesség', () => futtat('fv-mertek', 'E5', (s, n) => (/m\/s sebességgel halad\. Hány km\/h/.test(s) ? (n[0] * 3600) / 1000 : (n[0] * 1000) / 3600)));

// ---------- 3. Szöveges ----------
const KSZR = { kétszeresére: 2, háromszorosára: 3, négyszeresére: 4, ötszörösére: 5 };
const SZO = { kétszer: 2, háromszor: 3, négyszer: 4 };
test('Z1 – gondoltam egy számot (próbálgatással)', () => futtat('fv-szoveges', 'Z1', (s, n) => {
  const k = KSZR[s.match(/összeget (\p{L}+) növeltem/u)[1]];
  const [p, c, , R] = [n[0], n[1], 0, n[2]];
  for (let x = 1; x <= 1000; x++) if (close(k * ((2 + p / 100) * x + c), R)) return x;
  return NaN;
}));
test('Z2 – arányos osztás', () => futtat('fv-szoveges', 'Z2', (s, n) => {
  const [a, b, S] = n;
  for (let x = 1; x <= 100; x++) if ((a + b) * x === S) return (a - b) * x;
  return NaN;
}));
test('Z3 – békák és kígyók (próbálgatással)', () => futtat('fv-szoveges', 'Z3', (s, n) => {
  const k = SZO[s.match(/nádasban (\p{L}+) annyi/u)[1]];
  const T = n[0];
  for (let kigyo = 1; kigyo < 200; kigyo++) if (2 * kigyo + k * kigyo * 6 === T) return kigyo;
  return NaN;
}));
test('Z4 – átlag (próbálgatással)', () => futtat('fv-szoveges', 'Z4', (s, n) => {
  const [A1, h, S, A2] = n;
  for (let db = h + 1; db < 200; db++) if (close(db * A1 - S, (db - h) * A2)) return db;
  return NaN;
}));
test('Z5 – négy épület (próbálgatással)', () => futtat('fv-szoveges', 'Z5', (s, n) => {
  const [T, a, b, c] = n;
  for (let x = 1; x < 400; x++) if (x + (x + b) + (x + b + a) + (x + c) === T) return x;
  return NaN;
}));
test('Z6 – kétféle érme (próbálgatással)', () => futtat('fv-szoveges', 'Z6', (s, n) => {
  const [db, V] = n;
  for (let x = 0; x <= db; x++) if (50 * x + 20 * (db - x) === V) return x;
  return NaN;
}));

// ---------- 4. Geometria ----------
test('G1 – háromszög szögei', () => futtat('fv-geometria', 'G1', (s, n) => {
  if (/szögfelező/.test(s)) return n[0] / 2;
  if (/külső szög/.test(s)) return 180 - (180 - n[0] - n[1]);
  return 180 - n[0] - n[1];
}));
test('G2 – négyszög szögei (próbálgatással)', () => futtat('fv-geometria', 'G2', (s, n) => {
  const [p, q, d1, d2] = n;
  for (let x = 1; x < 180; x++) if (close(x + (p * x) / q + (x + d1) + (x + d2), 360)) return x;
  return NaN;
}));
test('G3 – szabályos sokszög', () => futtat('fv-geometria', 'G3', (s, n) => {
  const N = n[0];
  if (/átlója/.test(s)) { let db = 0; for (let i = 0; i < N; i++) for (let j = i + 2; j < N; j++) if (!(i === 0 && j === N - 1)) db++; return db; }
  return /külső/.test(s) ? 360 / N : ((N - 2) * 180) / N;
}));
test('G4 – téglalap (próbálgatással)', () => futtat('fv-geometria', 'G4', (s, n) => {
  const [a, x, dT] = n;
  for (let b = 1; b < 200; b++) if ((a + x) * (b + x) - a * b === dT) return b;
  return NaN;
}));
test('G5 – átfúrt kocka (kis kockák számolásával)', () => futtat('fv-geometria', 'G5', (s, n) => {
  const [e, s0] = n;
  const eltol = Math.floor((e - s0) / 2);
  const van = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < e && y < e && z < e
    && !(x >= eltol && x < eltol + s0 && y >= eltol && y < eltol + s0);
  let db = 0, lap = 0;
  for (let x = 0; x < e; x++) for (let y = 0; y < e; y++) for (let z = 0; z < e; z++) {
    if (!van(x, y, z)) continue;
    db++;
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (!van(x + dx, y + dy, z + dz)) lap++;
  }
  return /térfogata/.test(s) ? db : lap;
}));
test('G6 – Pitagorasz-tétel', () => futtat('fv-geometria', 'G6', (s, n) => {
  const [x, y] = n;
  if (/átfogója/.test(s)) { for (let b = 1; b < 200; b++) if (b * b + y * y === x * x) return b; return NaN; }
  for (let c = 1; c < 400; c++) if (c * c === x * x + y * y) return c;
  return NaN;
}));

// ---------- 5. Kombinatorika, valószínűség, statisztika ----------
function permutaciok(t) {
  if (t.length <= 1) return [t];
  return t.flatMap((x, i) => permutaciok([...t.slice(0, i), ...t.slice(i + 1)]).map((r) => [x, ...r]));
}
test('K1 – sorrendek (összes sorrend felsorolása)', () => futtat('fv-kombinatorika', 'K1', (s, n) => {
  const N = n[0];
  const mind = permutaciok([...Array(N).keys()]);
  if (/egymás mellett/.test(s)) return mind.filter((p) => Math.abs(p.indexOf(0) - p.indexOf(1)) === 1).length;
  return mind.length;
}));
test('K2 – csapatválasztás (részhalmazok felsorolása)', () => futtat('fv-kombinatorika', 'K2', (s, n) => {
  const [N, k] = n;
  let db = 0;
  for (let mask = 0; mask < 1 << N; mask++) if (mask.toString(2).replace(/0/g, '').length === k) db++;
  return db;
}));
test('K3 – számjegyekből képzett számok (felsorolással)', () => futtat('fv-kombinatorika', 'K3', (s, n) => {
  const jegyek = (s.match(/^Az ([\d, ]+) számjegyekből/)[1].match(/\d/g)).map(Number);
  const k = Number(s.match(/hány (\d) jegyű/)[1]);
  const ism = /ismétlődhetnek/.test(s), paros = /páros/.test(s);
  let db = 0;
  const rek = (szam, hasznalt) => {
    if (szam.length === k) { if (!paros || szam[k - 1] % 2 === 0) db++; return; }
    for (const j of jegyek) if (ism || !hasznalt.has(j)) rek([...szam, j], new Set([...hasznalt, j]));
  };
  rek([], new Set());
  return db;
}));
test('K4 – golyóhúzás (az összes húzás felsorolásával)', () => futtat('fv-kombinatorika', 'K4', (s, n) => {
  const [pir, feh, zol] = n;
  const golyok = [...Array(pir).fill('p'), ...Array(feh).fill('f'), ...Array(zol).fill('z')];
  if (/[Kk]ét golyót/.test(s)) {
    let jo = 0, ossz = 0;
    for (let i = 0; i < golyok.length; i++) for (let j = 0; j < golyok.length; j++) if (i !== j) { ossz++; if (golyok[i] === 'p' && golyok[j] === 'p') jo++; }
    return jo / ossz;
  }
  const kedvezo = /nem piros/.test(s) ? golyok.filter((g) => g !== 'p').length : golyok.filter((g) => g === 'f').length;
  return kedvezo / golyok.length;
}));
test('K5 – érmedobás (az összes dobás felsorolásával)', () => futtat('fv-kombinatorika', 'K5', (s, n) => {
  const [na, nb] = n;
  let jo = 0;
  for (let mask = 0; mask < 1 << (na + nb); mask++) {
    const fejA = (mask & ((1 << na) - 1)).toString(2).replace(/0/g, '').length;
    const fejB = (mask >> na).toString(2).replace(/0/g, '').length;
    if (/döntetlen\?$/.test(s) ? fejA === fejB : fejA > fejB) jo++;
  }
  return jo / 2 ** (na + nb);
}));
test('K6 – statisztika', () => futtat('fv-kombinatorika', 'K6', (s) => {
  const adatok = s.match(/osztályzata: ([\d, ]+)\./)[1].split(',').map((x) => Number(x.trim()));
  const r = [...adatok].sort((a, b) => a - b);
  if (/átlaga/.test(s)) return adatok.reduce((a, b) => a + b, 0) / adatok.length;
  if (/mediánja/.test(s)) { const m = Math.floor(r.length / 2); return r.length % 2 ? r[m] : (r[m - 1] + r[m]) / 2; }
  if (/módusza/.test(s)) { let legjobb = null, db = 0; for (const x of new Set(r)) { const c = r.filter((y) => y === x).length; if (c > db) { db = c; legjobb = x; } } return legjobb; }
  return r[r.length - 1] - r[0];
}));

// ---------- 6. Arányok ----------
test('A1 – százalék', () => futtat('fv-aranyok', 'A1', (s, n) => {
  if (/hány százaléka/.test(s)) return (n[1] / n[0]) * 100;
  if (/Hány tanuló jár az iskolába/.test(s)) return (n[1] * 100) / n[0];
  return (n[0] * n[1]) / 100;
}));
test('A2 – doboz és golyók (próbálgatással)', () => futtat('fv-aranyok', 'A2', (s, n) => {
  const m = { harmadrésze: 3, negyedrésze: 4, ötödrésze: 5 }[s.match(/golyók (\p{L}+) piros lett/u)[1]];
  const [k, p] = n;
  for (let W = 1; W < 2000; W++) {
    const piros = W / (m - 1);
    if (Number.isInteger(piros) && close(((W + k) / (W + piros + k)) * 100, p, 1e-9)) return W;
  }
  return NaN;
}));
test('A3 – váltakozó futás és séta (percenkénti szimulációval)', () => futtat('fv-aranyok', 'A3', (s, n) => {
  const [t1, v1, t2, v2] = n;
  const D = n[n.length - 1];
  let ut = 0, perc = 0;
  for (;;) {
    for (let i = 0; i < t1; i++) { const lep = (v1 * 1000) / 60; if (ut + lep >= D) return perc + (D - ut) / lep; ut += lep; perc++; }
    for (let i = 0; i < t2; i++) { ut += (v2 * 1000) / 60; perc++; }
  }
}));
test('A4 – találkozás és utolérés (percenkénti szimulációval)', () => futtat('fv-aranyok', 'A4', (s, n) => {
  if (/szembe/.test(s)) {
    const [D, v1, v2] = n;
    for (let t = 1; t < 1000; t++) if (close(((v1 + v2) * t) / 60, D)) return t;
    return NaN;
  }
  const [v1, t0, v2] = n;
  for (let t = 1; t < 2000; t++) if (close((v2 * t) / 60, (v1 * (t + t0)) / 60)) return t;
  return NaN;
}));
test('A5 – méretarány', () => futtat('fv-aranyok', 'A5', (s, n) => {
  const [, M, x] = n;
  return /Hány kilométer/.test(s) ? (x * M) / 100000 : (x * 100000) / M;
}));

// ---------- Tört alakú válasz, próbafelvételi ----------
test('a tört alakú válasz (7/6) és a kerekített tizedes tört is elfogadott', () => {
  const tipus = tema('fv-szamok').tipusok.find((t) => t.id === 'S1');
  const rng = ujRng(11);
  for (let i = 0; i < 200; i++) {
    const m = tipus.general(rng).mezok[0];
    // egyszerűsített tört alakja a helyes válasznak: kereszt-ellenőrzés a nevezőkkel
    for (let nev = 1; nev <= 144; nev++) {
      const sz = m.helyes * nev;
      if (Math.abs(sz - Math.round(sz)) < 1e-9) {
        assert.equal(ellenoriz(m, `${Math.round(sz)}/${nev}`).allapot, 'jo', `tört alak: ${Math.round(sz)}/${nev} (${m.helyes})`);
        break;
      }
    }
    assert.equal(ellenoriz(m, formaz(m.helyes, 3)).allapot, 'jo');
    assert.ok(ertelmez('7/6').ertek > 1.166);
  }
});

test('próbafelvételi: 12 feladat, mind a 6 témából 2, egy témán belül nincs ismétlődő típus', () => {
  for (let mag = 1; mag <= 100; mag++) {
    const lista = tesztFeladatok(ujRng(mag), FELVETELI_TEMAK, 12);
    assert.equal(lista.length, 12);
    for (const t of FELVETELI_TEMAK) {
      const tipusok = lista.filter((x) => x.temaId === t.id).map((x) => x.tipusId);
      assert.equal(tipusok.length, 2, `${t.id}: ${tipusok.length} feladat`);
      assert.equal(new Set(tipusok).size, 2);
    }
    for (const { feladat } of lista) {
      assert.equal(feladat.mezok.length, 1);
      const m = feladat.mezok[0];
      assert.equal(ellenoriz(m, formaz(m.helyes, Math.max(m.tizedes, 3))).allapot, 'jo');
    }
  }
});

test('a felvételi témák adatai teljesek, az azonosítók egyediek', () => {
  const idk = FELVETELI_TEMAK.flatMap((t) => t.tipusok.map((x) => x.id));
  assert.equal(new Set(idk).size, idk.length);
  assert.equal(new Set(FELVETELI_TEMAK.map((t) => t.id)).size, FELVETELI_TEMAK.length);
  for (const t of FELVETELI_TEMAK) {
    assert.equal(t.sor, 'felveteli');
    assert.ok(t.id.startsWith('fv-'));
  }
  void gcd;
});
