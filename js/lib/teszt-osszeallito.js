// A próbateszt feladatsorának összeállítása (böngészőtől független, így tesztelhető).
import { kever, valaszt } from './rng.js';

/** n feladat elosztása a témák között arányosan (a maradékot véletlen témák kapják). */
export function elosztas(rng, temaSzam, n) {
  const alap = Math.floor(n / temaSzam);
  const db = Array(temaSzam).fill(alap);
  const sorrend = kever(rng, [...Array(temaSzam).keys()]);
  for (let i = 0; i < n - alap * temaSzam; i++) db[sorrend[i]]++;
  return db;
}

/**
 * Egy tesztfeladat: a generált feladatból egyetlen számmezőt tartunk meg
 * (a tesztben mindig egyetlen számot kell beírni).
 */
export function tesztFeladat(rng, tipus) {
  const feladat = tipus.general(rng);
  const szamMezok = feladat.mezok.filter((m) => m.tipus === 'szam');
  if (!szamMezok.length) return null;
  const mezo = valaszt(rng, szamMezok);
  return { ...feladat, mezok: [mezo], utasitas: '' };
}

export function tesztFeladatok(rng, temak, n = 10) {
  const db = elosztas(rng, temak.length, n);
  const lista = [];
  temak.forEach((tema, i) => {
    const tipusok = kever(rng, tema.tipusok.filter((t) => t.tesztbe !== false));
    for (let k = 0; k < db[i]; k++) {
      const tipus = tipusok[k % tipusok.length];
      const feladat = tesztFeladat(rng, tipus);
      if (!feladat) throw new Error(`A(z) ${tipus.id} típusnak nincs számmezője.`);
      lista.push({ temaId: tema.id, temaCim: tema.cim, tipusId: tipus.id, tipusNev: tipus.nev, feladat });
    }
  });
  return lista;
}

export const TESZT_PERC = 20;
export const TESZT_DB = 10;
// A próba felvételi: a valódi írásbeli is 45 perces.
export const FELV_TESZT_PERC = 45;
export const FELV_TESZT_DB = 12;
