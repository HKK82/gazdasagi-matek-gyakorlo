// Véletlenszám-generátor (mulberry32) – a tesztekhez magot (seed) is lehet adni,
// így a generált feladatok reprodukálhatók.

export function ujRng(mag) {
  let a = (mag === undefined ? Math.floor(Math.random() * 2 ** 32) : mag) >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Egész szám a és b között (mindkettő benne van). */
export function egesz(rng, a, b) {
  return a + Math.floor(rng() * (b - a + 1));
}

/** a, a+lepes, …, b közül egy (lebegőpontos zaj nélkül). */
export function lepeskoz(rng, a, b, lepes) {
  const n = Math.round((b - a) / lepes);
  const k = egesz(rng, 0, n);
  return Number((a + k * lepes).toPrecision(12));
}

export function valaszt(rng, tomb) {
  return tomb[Math.floor(rng() * tomb.length)];
}

export function kever(rng, tomb) {
  const t = tomb.slice();
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}
