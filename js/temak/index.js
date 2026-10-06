// Önálló felvételi-gyakorló: a témák a js/felveteli/ mappában vannak. A tema.js, teszt.js és a tesztek a TEMAK nevet várják.
import { FELVETELI_TEMAK } from '../felveteli/index.js';

export const TEMAK = FELVETELI_TEMAK;
export { FELVETELI_TEMAK };

export function temaKeres(id) {
  return FELVETELI_TEMAK.find((t) => t.id === id) || null;
}
