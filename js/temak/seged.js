// Közös segédfüggvények a témamodulokhoz.
import { formaz, tisztit } from '../lib/szam.js';

/** Addig próbálkozik, amíg a függvény nem null értéket ad (véletlen paraméterek szűrése). */
export function probal(fn, max = 5000) {
  for (let i = 0; i < max; i++) {
    const r = fn();
    if (r) return r;
  }
  throw new Error('Nem sikerült megfelelő számokat generálni.');
}

/** Rövid formázó: legfeljebb 2 tizedes (vagy d). */
export const f = (x, d = 2) => formaz(x, d);

/** Szám és mértékegység nem törhető szóközzel. */
export const fe = (x, egys, d = 2) => `${formaz(x, d)}${egys ? ' ' + egys : ''}`;

/** Képletben a negatív szám zárójelben: 3 · (−2). */
export const fz = (x, d = 2) => (x < 0 ? `(${formaz(x, d)})` : formaz(x, d));

/** Lineáris kifejezés szépen: m·x + b → „3x + 2”, „−0,5x + 5,5”, „−x + 4”, „4”. */
export function linKif(m, b, valtozo = 'x', d = 4) {
  m = tisztit(m); b = tisztit(b);
  let s = '';
  if (m !== 0) {
    if (m === 1) s = valtozo;
    else if (m === -1) s = '−' + valtozo;
    else s = formaz(m, d) + valtozo;
  }
  if (b !== 0 || s === '') {
    if (s === '') s = formaz(b, d);
    else s += (b < 0 ? ' − ' : ' + ') + formaz(Math.abs(b), d);
  }
  return s;
}

/**
 * Névelő + szám: „a 16”, „az 5”, „az 1000”, „a 120”.
 * (A névelő a kiejtett számnévtől függ: egy, öt, ezer, egymillió → az.)
 */
export function az(x, d = 2, nagy = false) {
  const s = formaz(x, d);
  let nevelo = 'a';
  if (s.startsWith('5')) nevelo = 'az';
  else if (s.startsWith('1')) {
    const n = s.split(',')[0].replace(/\s/g, '').length;
    if (n % 3 === 1) nevelo = 'az';
  }
  if (nagy) nevelo = nevelo[0].toUpperCase() + nevelo.slice(1);
  return `${nevelo} ${s}`;
}
export const Az = (x, d = 2) => az(x, d, true);

/**
 * Évszám + „-ban/-ben” (az évszám kiejtése szerint): 1993-ban, 2010-ben, 2020-ban.
 * A toldalék az évszám utolsó két számjegyétől függ (három → -ban, négy → -ben, húsz → -ban, ötven → -ben …).
 */
export function evben(ev) {
  const e = Math.abs(Math.round(ev));
  const egyes = e % 10, tizes = Math.floor((e % 100) / 10);
  const mely = { 1: 'ben', 2: 'ben', 3: 'ban', 4: 'ben', 5: 'ben', 6: 'ban', 7: 'ben', 8: 'ban', 9: 'ben' };
  const tizesek = { 1: 'ben', 2: 'ban', 3: 'ban', 4: 'ben', 5: 'ben', 6: 'ban', 7: 'ben', 8: 'ban', 9: 'ben' };
  let t;
  if (e % 100 === 0) t = e % 1000 === 0 ? 'ben' : 'ban'; // kétezerben, de ezerkilencszázban
  else if (egyes === 0) t = tizesek[tizes];
  else t = mely[egyes];
  return `${e}-${t}`;
}

/** Szám GeoGebra-beíráshoz: tizedespont, ezres elválasztó nélkül (pl. 1.124). */
export const gg = (x, d = 6) => String(Number(Number(x).toFixed(d)));

/** Kisbetűs kezdés (mondat közbeni felhasználáshoz). */
export const kisbetus = (sz) => sz.charAt(0).toLowerCase() + sz.slice(1);

/** Felső index számjegyekkel: 1,08³ (sima szövegben és HTML-ben is működik). */
export const sup = (n) => String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);

/** Hatvány szépen: egész kitevő → 1,08³, törtkitevő → 1,05^9,5. */
export const hatv = (alap, kitevo, d = 4) =>
  (Number.isInteger(kitevo) ? `${formaz(alap, d)}${sup(kitevo)}` : `${formaz(alap, d)}^${formaz(kitevo, 2)}`);

/** Igaz, ha a szám még értelmesen kiírható (nem végtelen, nem csillagászati). */
export const kezelheto = (x, hatar = 1e12) => Number.isFinite(x) && Math.abs(x) < hatar;

export { tisztit };
