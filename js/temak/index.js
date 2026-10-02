// A témák nyilvántartása. Új téma: új modul a js/temak/ mappában (lásd README), majd ide felvenni.
import szazalek from './szazalek.js';
import linearis from './linearis.js';
import kozgazdasag from './kozgazdasag.js';
import penzugy from './penzugy.js';

export const TEMAK = [szazalek, linearis, kozgazdasag, penzugy];

export function temaKeres(id) {
  return TEMAK.find((t) => t.id === id) || null;
}
