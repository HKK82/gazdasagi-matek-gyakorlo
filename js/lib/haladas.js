// Haladás mentése kizárólag a böngészőben (localStorage). Ha a tároló nem elérhető
// (pl. privát mód, letiltott sütik), memóriában tartjuk – az oldal így is működik.

const KULCS = 'gmgy-haladas-v1';
const MEGY = 3; // ennyi egymás utáni jó megoldás után „megy” a típus

let tarolo; // undefined = alapértelmezett localStorage, null = nincs tároló
let memoria = null;

function alapTarolo() {
  try {
    if (typeof globalThis.localStorage !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch { /* nem elérhető */ }
  return null;
}

/** Tesztekhez: tetszőleges getItem/setItem objektum, vagy null (= nincs tároló). */
export function beallitTarolo(t) {
  tarolo = t;
  memoria = null;
}

function aktTarolo() {
  return tarolo === undefined ? alapTarolo() : tarolo;
}

function ures() {
  return { temak: {}, teszt: { legjobb: null, kitoltve: 0 } };
}

export function betolt() {
  if (memoria) return memoria;
  let adat = null;
  try {
    const t = aktTarolo();
    const s = t ? t.getItem(KULCS) : null;
    if (s) adat = JSON.parse(s);
  } catch { adat = null; }
  if (!adat || typeof adat !== 'object' || !adat.temak) adat = ures();
  if (!adat.teszt) adat.teszt = { legjobb: null, kitoltve: 0 };
  memoria = adat;
  return memoria;
}

function ment() {
  try {
    const t = aktTarolo();
    if (t) t.setItem(KULCS, JSON.stringify(memoria));
  } catch { /* csendben: csak memóriában marad */ }
}

export function tipusAllapot(temaId, tipusId) {
  const a = betolt();
  return a.temak[temaId]?.[tipusId] || { jo: 0, probalt: 0, sorozat: 0, legjobbSorozat: 0 };
}

export function megy(temaId, tipusId) {
  return tipusAllapot(temaId, tipusId).legjobbSorozat >= MEGY;
}

/** Egy gyakorlófeladat eredményének rögzítése. */
export function rogzit(temaId, tipusId, jo) {
  const a = betolt();
  a.temak[temaId] ??= {};
  const t = (a.temak[temaId][tipusId] ??= { jo: 0, probalt: 0, sorozat: 0, legjobbSorozat: 0 });
  t.probalt++;
  if (jo) {
    t.jo++;
    t.sorozat++;
    t.legjobbSorozat = Math.max(t.legjobbSorozat, t.sorozat);
  } else {
    t.sorozat = 0;
  }
  ment();
  return t;
}

/** Téma haladása %-ban: típusonként min(legjobb sorozat, 3)/3 átlaga. */
export function temaSzazalek(tema) {
  const tipusok = tema.tipusok;
  if (!tipusok.length) return 0;
  let ossz = 0;
  for (const t of tipusok) ossz += Math.min(tipusAllapot(tema.id, t.id).legjobbSorozat, MEGY) / MEGY;
  return Math.round((ossz / tipusok.length) * 100);
}

/** A legjobb teszteredmény. A kulcs: 'teszt' (gazdasági próbateszt) vagy 'felvTeszt' (próba felvételi). */
export function legjobbTeszt(kulcs = 'teszt') {
  return betolt()[kulcs]?.legjobb ?? null;
}

/** Teszteredmény mentése; igazat ad, ha új legjobb. */
export function tesztMentes(pont, ossz, kulcs = 'teszt') {
  const a = betolt();
  const t = (a[kulcs] ??= { legjobb: null, kitoltve: 0 });
  t.kitoltve = (t.kitoltve || 0) + 1;
  const szazalek = Math.round((pont / ossz) * 100);
  const regi = t.legjobb;
  const uj = !regi || szazalek > regi.szazalek;
  if (uj) t.legjobb = { pont, ossz, szazalek, datum: new Date().toISOString().slice(0, 10) };
  ment();
  return uj;
}

/** Csak a megadott témák haladásának és a próba felvételi eredményének törlése (a többi marad). */
export function torolFelveteli(temaIdk) {
  const a = betolt();
  for (const id of temaIdk) delete a.temak[id];
  delete a.felvTeszt;
  ment();
}

export function torol() {
  memoria = ures();
  ment();
}

export const MEGY_HATAR = MEGY;
