// Segédfüggvények a tesztekhez: a feladatszövegből visszaolvassuk a számokat,
// hogy a helyes választ a generátortól függetlenül újra kiszámolhassuk.

export function sima(html) {
  return String(html).replace(/<[^>]+>/g, '').replace(/ /g, ' ');
}

/** Magyar formátumú szám szövegből: „1 069 200”, „39,95”, „−0,5”. */
export function szam(s) {
  return Number(s.replace(/−\s?/, '-').replace(/ /g, '').replace(',', '.'));
}

/** Az összes szám a szövegben, sorrendben (a közvetlenül előttük álló mínuszjellel). */
export function szamok(html) {
  const t = sima(html);
  const re = /(−\s?)?\d{1,3}(?: \d{3})+(?:,\d+)?|(−\s?)?\d+(?:,\d+)?/g;
  return (t.match(re) || []).map(szam);
}

/** Lineáris kifejezés („−0,5x + 5,5”, „x + 1”, „−p + 2000”, „2,5x − 6,75”) → { m, b } */
export function linearis(kif, valtozo = 'x') {
  const s = kif.replace(/\s/g, '').replace(/−/g, '-');
  const re = new RegExp(`^([+-]?[\\d.,]*)${valtozo}(?:([+-])([\\d.,]+))?$`);
  const r = s.match(re);
  if (!r) {
    if (/^[+-]?[\d.,]+$/.test(s)) return { m: 0, b: Number(s.replace(',', '.')) };
    throw new Error('Nem értelmezhető kifejezés: ' + kif);
  }
  let m;
  if (r[1] === '' || r[1] === '+') m = 1;
  else if (r[1] === '-') m = -1;
  else m = Number(r[1].replace(',', '.'));
  const b = r[2] ? (r[2] === '-' ? -1 : 1) * Number(r[3].replace(',', '.')) : 0;
  return { m, b };
}

export const kozel = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));
