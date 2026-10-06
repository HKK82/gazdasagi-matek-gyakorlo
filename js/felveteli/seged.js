// A felvételi-gyakorló témamodulok közös segédje.
import { szamMezo } from '../lib/ellenorzo.js';

/**
 * Egyetlen számmezős feladat (a felvételi feladatok többsége ilyen).
 * A mezőben szereplő `hibak` és az `ellenproba` ugyanúgy működik, mint a gazdasági témáknál.
 */
export function egyMezos({
  szoveg, utasitas, abra, abraMegoldas, cimke = 'Az eredmény', helyes, tizedes = 0, egyseg = '',
  hibak = [], alternativ = [], ellenproba, tippek, megoldas, magyarazat, jegyezze,
}) {
  return {
    szoveg, utasitas, abra, abraMegoldas,
    mezok: [szamMezo({ cimke, helyes, tizedes, egyseg, hibak, alternativ, ellenproba })],
    tippek, megoldas, magyarazat, jegyezze,
  };
}

/** Utasítás a törtként is megadható válaszokhoz (csak a gyakorlásban jelenik meg). */
export const TORT_UTASITAS = 'Az eredményt megadhatod egyszerűsített törtként (pl. 7/6) vagy három tizedesre kerekített tizedes törtként (pl. 1,167).';

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lnko = gcd;
export const lkkt = (a, b) => (a / gcd(a, b)) * b;

/** Egyszerűsített tört szövege: 14/12 → „7/6”, 8/2 → „4”. */
export function tortSzoveg(szamlalo, nevezo) {
  const g = gcd(szamlalo, nevezo) || 1;
  const s = szamlalo / g, n = nevezo / g;
  return n === 1 ? String(s) : `${s}/${n}`;
}
