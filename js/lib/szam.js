// Számok kerekítése, „szépség” vizsgálata, magyar formázás és a beírt válasz értelmezése.

/** Lebegőpontos zaj eltávolítása (pl. 0.1 + 0.2 → 0.3). */
export function tisztit(x) {
  return Number(Number(x).toPrecision(12));
}

/** Kerekítés d tizedesre, előjeltől függetlenül „fél felfelé” (a nagyság szerint). */
export function kerekit(x, d = 0) {
  const f = 10 ** d;
  const s = x < 0 ? -1 : 1;
  const y = tisztit(Math.abs(x) * f);
  return tisztit((s * Math.round(y)) / f);
}

/** Igaz, ha x legfeljebb d tizedesjegyű (lebegőpontos zajt figyelmen kívül hagyva). */
export function szep(x, d = 2) {
  if (!Number.isFinite(x)) return false;
  const y = tisztit(x * 10 ** d);
  return Math.abs(y - Math.round(y)) < 1e-6;
}

const NBSP = ' ';

/**
 * Magyar formátum: tizedesvessző, 10 000 felett szóköz az ezresek között,
 * valódi mínuszjel. A felesleges záró nullák elhagyva (legfeljebb d tizedes).
 */
export function formaz(x, d = 2) {
  if (!Number.isFinite(x)) return String(x);
  let r = kerekit(x, d);
  if (Object.is(r, -0)) r = 0;
  const negativ = r < 0;
  let s = Math.abs(r).toFixed(d);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  let [egeszResz, tort] = s.split('.');
  if (egeszResz.length >= 5) {
    egeszResz = egeszResz.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  }
  return (negativ ? '−' : '') + egeszResz + (tort ? ',' + tort : '');
}

/** Formázás pontosan d tizedessel (pl. pénz: 39,95). */
export function formazFix(x, d = 2) {
  const s = formaz(x, d);
  if (d === 0) return s;
  const [e, t = ''] = s.split(',');
  return e + ',' + t.padEnd(d, '0');
}

// A válasz végéről levágható mértékegységek / jelek (kisbetűsítve hasonlítjuk).
const UTOTAG_SZAMMAL = /\s*(l|liter|litert?)?\s*\/\s*100\s*km\.?$/i;
const UTOTAG = /^[\s\p{L}%$€£\/.°²³]*$/u;

/**
 * A beírt szöveg értelmezése számként.
 * Elfogad: tizedesvessző és -pont, szóköz mint ezres elválasztó, előjel (− is),
 * mértékegység/%/pénznem a végén vagy pénznem az elején, egyszerű tört (pl. -1/3),
 * „x = 5” alakot. Képletet (=280/1,12) nem értelmez.
 * Visszaad: { ertek } vagy { hiba: 'ures' | 'keplet' | 'ervenytelen' }.
 */
export function ertelmez(bevitel) {
  if (bevitel === null || bevitel === undefined) return { hiba: 'ures' };
  let s = String(bevitel)
    .replace(/[−–‒]/g, '-')
    .replace(/[   ]/g, ' ')
    .trim();
  if (s === '') return { hiba: 'ures' };
  if (s.startsWith('=')) return { hiba: 'keplet' };
  // „x = 5”, „p=12”, „m = -2” – a változónév és az egyenlőségjel elhagyható
  s = s.replace(/^\p{L}{1,2}\s*[=≈]\s*/u, '');
  // pénznem elöl: $26, € 47
  s = s.replace(/^[$€£]\s*/, '');
  // számot tartalmazó mértékegység a végén (l/100 km)
  s = s.replace(UTOTAG_SZAMMAL, '');
  // a számrész és a (betűs) utótag szétválasztása
  const m = s.match(/^([+-]?\s*[\d\s.,]*\d(?:\s*\/\s*\d+)?)(.*)$/u);
  if (!m) return { hiba: 'ervenytelen' };
  const szamResz = m[1].replace(/^([+-])\s+/, '$1').trim();
  const utotag = m[2];
  if (!UTOTAG.test(utotag)) return { hiba: utotag.match(/[*+\-:/()^]/) ? 'keplet' : 'ervenytelen' };

  // egyszerű tört: -1/3
  const tort = szamResz.match(/^([+-]?)(\d+)\s*\/\s*(\d+)$/);
  if (tort) {
    const nev = Number(tort[3]);
    if (nev === 0) return { hiba: 'ervenytelen' };
    const v = Number(tort[2]) / nev;
    return { ertek: tort[1] === '-' ? -v : v };
  }

  let t = szamResz;
  let elojel = 1;
  if (t.startsWith('-')) { elojel = -1; t = t.slice(1); } else if (t.startsWith('+')) { t = t.slice(1); }

  // szóköz csak ezres elválasztóként
  if (/\s/.test(t)) {
    if (!/^\d{1,3}( \d{3})+([.,]\d+)?$/.test(t)) return { hiba: 'ervenytelen' };
    t = t.replace(/ /g, '');
  }
  const pontok = (t.match(/\./g) || []).length;
  const vesszok = (t.match(/,/g) || []).length;
  if (pontok + vesszok === 0) {
    // egész szám
  } else if (pontok + vesszok === 1) {
    t = t.replace(',', '.');
  } else if (vesszok === 0 && /^\d{1,3}(\.\d{3})+$/.test(t)) {
    t = t.replace(/\./g, ''); // 1.069.200
  } else if (vesszok === 1 && /^\d{1,3}(\.\d{3})+,\d+$/.test(t)) {
    t = t.replace(/\./g, '').replace(',', '.'); // 1.069,5
  } else if (pontok === 1 && /^\d{1,3}(,\d{3})+\.\d+$/.test(t)) {
    t = t.replace(/,/g, ''); // 1,069.5
  } else {
    return { hiba: 'ervenytelen' };
  }
  if (!/^(\d+\.?\d*|\.\d+)$/.test(t)) return { hiba: 'ervenytelen' };
  const v = Number(t);
  if (!Number.isFinite(v)) return { hiba: 'ervenytelen' };
  return { ertek: elojel * v };
}
