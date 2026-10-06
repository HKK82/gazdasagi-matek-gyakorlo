// A témák nyilvántartása. Új téma: új modul a js/temak/ mappában (lásd README), majd ide felvenni.
// A felvételi-gyakorló témái a js/felveteli/ mappában vannak (ugyanaz a modulszerkezet).
import szazalek from './szazalek.js';
import linearis from './linearis.js';
import kozgazdasag from './kozgazdasag.js';
import penzugy from './penzugy.js';
import exponencialis from './exponencialis.js';
import fuggvenyvizsgalat from './fuggvenyvizsgalat.js';
import valoszinuseg from './valoszinuseg.js';
import { FELVETELI_TEMAK } from '../felveteli/index.js';

export const TEMAK = [szazalek, linearis, kozgazdasag, penzugy, exponencialis, fuggvenyvizsgalat, valoszinuseg];
export { FELVETELI_TEMAK };

export function temaKeres(id) {
  return TEMAK.find((t) => t.id === id) || FELVETELI_TEMAK.find((t) => t.id === id) || null;
}
