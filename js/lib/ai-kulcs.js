// A hallgató saját Gemini API-kulcsának tárolása – csak a saját böngészőben.
// Alapból a kulcs csak a böngészőmunkamenetben (sessionStorage) marad; ha a hallgató kéri,
// a saját eszközén megjegyezzük (localStorage). A kulcs sehová máshová nem kerül, csak a Google felé megy.

const KULCS_MUNKAMENET = 'gmgy-gemini-kulcs-munkamenet';
const KULCS_TARTOS = 'gmgy-gemini-kulcs-tartos';

let tarolok; // tesztekhez cserélhető: { munkamenet, tartos }

function alap() {
  const vedett = (nev) => { try { return globalThis[nev] || null; } catch { return null; } };
  return { munkamenet: vedett('sessionStorage'), tartos: vedett('localStorage') };
}
const t = () => tarolok || alap();

function olvas(tar, kulcs) { try { return tar ? tar.getItem(kulcs) || '' : ''; } catch { return ''; } }
function ir(tar, kulcs, ertek) { try { if (tar) tar.setItem(kulcs, ertek); } catch { /* privát mód: nem baj */ } }
function torol(tar, kulcs) { try { if (tar) tar.removeItem(kulcs); } catch { /* nem baj */ } }

/** Tesztekhez: { munkamenet, tartos } getItem/setItem/removeItem objektumok, vagy null (= böngésző). */
export function beallitKulcsTarolo(x) { tarolok = x || undefined; }

export function kulcsOlvas() {
  const { munkamenet, tartos } = t();
  return olvas(munkamenet, KULCS_MUNKAMENET) || olvas(tartos, KULCS_TARTOS);
}

export function kulcsMegjegyezve() {
  return !!olvas(t().tartos, KULCS_TARTOS);
}

export function kulcsMent(kulcs, megjegyez) {
  const { munkamenet, tartos } = t();
  const tiszta = String(kulcs || '').trim();
  if (megjegyez) { ir(tartos, KULCS_TARTOS, tiszta); torol(munkamenet, KULCS_MUNKAMENET); }
  else { ir(munkamenet, KULCS_MUNKAMENET, tiszta); torol(tartos, KULCS_TARTOS); }
}

export function kulcsTorol() {
  const { munkamenet, tartos } = t();
  torol(munkamenet, KULCS_MUNKAMENET);
  torol(tartos, KULCS_TARTOS);
}

/** Gyors alakellenőrzés (nem garancia): a Google-kulcsok „AIza…” kezdetűek, ~39 karakteresek. */
export function kulcsAlakja(kulcs) {
  const k = String(kulcs || '').trim();
  if (!k) return { ok: false, uzenet: 'Még nem írt be kulcsot.' };
  if (/\s/.test(k)) return { ok: false, uzenet: 'A kulcsban nem lehet szóköz – másolja be újra, felesleges karakterek nélkül.' };
  if (!/^AIza[0-9A-Za-z_-]{30,}$/.test(k)) return { ok: false, uzenet: 'Ez nem úgy néz ki, mint egy Gemini API-kulcs. A kulcs „AIza” betűkkel kezdődik, és kb. 39 karakter hosszú.' };
  return { ok: true, uzenet: '' };
}
