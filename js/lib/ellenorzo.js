// Válaszellenőrzés a SPEC 4. fejezete szerint.
import { ertelmez, kerekit, formaz } from './szam.js';

/** A kért pontosság fele: 1 tizedesnél 0,05. */
export function tures(tizedes) {
  return 0.5 * 10 ** -tizedes;
}

/**
 * Elfogadjuk, ha a kerekített érték egyezik, vagy az eltérés legfeljebb a kért pontosság fele.
 * Így a pontosabb válasz (11,11 a 11,1 helyett) is jó.
 */
export function egyezik(v, cel, tizedes) {
  if (!Number.isFinite(v) || !Number.isFinite(cel)) return false;
  if (Math.abs(kerekit(v, tizedes) - kerekit(cel, tizedes)) < 1e-9) return true;
  return Math.abs(v - cel) <= tures(tizedes) + 1e-9;
}

/**
 * Számmező összeállítása. A tipikus hibák közül kiszűri azokat, amelyek
 * a kért pontosság mellett összetéveszthetők a helyes válasszal (vagy egymással).
 */
export function szamMezo({
  id = 'v', cimke, helyes, tizedes = 2, elojel = 'sima', egyseg = '', hibak = [],
  alternativ = [], elojelUzenet = '', negativ = false, abszTures = 0, relTures = 0, ellenproba = null,
}) {
  const tiszta = [];
  // egy tipikus hiba csak akkor marad, ha a kért pontosság mellett nem fogadnánk el helyesnek
  const kozel = (a, b) => egyezik(a, b, tizedes) || egyezik(b, a, tizedes);
  // abszTures: kerekítési eltérés (pl. ±1 Ft), amit megjegyzéssel elfogadunk – a hibák ettől is távol legyenek
  const abszKozel = (a, b) => (abszTures > 0 && Math.abs(a - b) <= abszTures + tures(tizedes) + 1e-9)
    // relTures: a kerekített köztes értékkel számolt eredmény (pl. ±0,5 %) is elfogadott
    || (relTures > 0 && Math.abs(a - b) <= relTures * Math.abs(b) + tures(tizedes) + 1e-9);
  for (const h of hibak) {
    if (!Number.isFinite(h.ertek)) continue;
    if (kozel(h.ertek, helyes) || abszKozel(h.ertek, helyes)) continue;
    if (alternativ.some((a) => kozel(h.ertek, a))) continue;
    if (elojel !== 'sima' && kozel(h.ertek, -helyes)) continue;
    if (tiszta.some((t) => kozel(t.ertek, h.ertek))) continue;
    tiszta.push(h);
  }
  return {
    tipus: 'szam', id, cimke, helyes, tizedes, elojel, egyseg, hibak: tiszta,
    alternativ, elojelUzenet, abszTures, relTures,
    // ellenproba(v): a hallgató saját számával mutatja meg szövegesen, miért nem stimmel (lásd SPEC 3.2)
    ellenproba: typeof ellenproba === 'function' ? ellenproba : null,
    negativ: negativ || helyes < 0 || elojel !== 'sima',
  };
}

/** Feleletválasztós mező. opciok: [{ szoveg, helyes, uzenet? }] */
export function valasztoMezo({ id = 'v', cimke, opciok }) {
  return { tipus: 'valasztas', id, cimke, opciok };
}

export const UZENET = {
  ures: 'Még nem írt be választ.',
  keplet: 'Az ellenőrző képletet nem számol ki – kérem, a kiszámolt végeredményt írja be (egyetlen számot).',
  ervenytelen: 'Ezt nem tudom számként értelmezni. Írjon be egyetlen számot, pl. 8,2 vagy 1 069 200.',
  rossz: 'Ez még nem jó. Nézze meg a tippet, és próbálja újra!',
};

/**
 * Egy mező ellenőrzése.
 * Eredmény: { allapot: 'jo' | 'jo-megjegyzes' | 'tipikus' | 'rossz' | 'ervenytelen' | 'ures', uzenet, ertek, ellenproba? }
 * Tipikus és egyéb hibás válasznál az `ellenproba` a hallgató saját számával végzett számszerű ellenpróba.
 * A 'jo' és 'jo-megjegyzes' számít helyesnek.
 */
function ellenprobaSzoveg(mezo, v) {
  if (typeof mezo.ellenproba !== 'function') return '';
  try { return mezo.ellenproba(v) || ''; } catch { return ''; }
}

export function ellenoriz(mezo, bevitel) {
  if (mezo.tipus === 'valasztas') {
    if (bevitel === '' || bevitel === null || bevitel === undefined) {
      return { allapot: 'ures', uzenet: 'Még nem választott.' };
    }
    const o = mezo.opciok[Number(bevitel)];
    if (!o) return { allapot: 'ervenytelen', uzenet: UZENET.ervenytelen };
    if (o.helyes) return { allapot: 'jo', uzenet: '' };
    return o.uzenet
      ? { allapot: 'tipikus', uzenet: o.uzenet, ellenproba: o.ellenproba || '' }
      : { allapot: 'rossz', uzenet: 'Nem ez a helyes válasz. Gondolja végig újra!', ellenproba: o.ellenproba || '' };
  }

  const p = ertelmez(bevitel);
  if (p.hiba) return { allapot: p.hiba === 'ures' ? 'ures' : 'ervenytelen', uzenet: UZENET[p.hiba] };
  const v = p.ertek;
  const d = mezo.tizedes;

  if (egyezik(v, mezo.helyes, d) || (mezo.alternativ || []).some((a) => egyezik(v, a, d))) {
    return { allapot: 'jo', uzenet: '', ertek: v };
  }
  if (mezo.helyes !== 0 && egyezik(-v, mezo.helyes, d)) {
    if (mezo.elojel === 'nagysag') {
      return {
        allapot: 'jo-megjegyzes', ertek: v,
        uzenet: mezo.elojelUzenet ||
          `Elfogadva. A változás mértéke ${formaz(mezo.helyes, d)}; a kérdés az, hogy mennyivel változott, ezért elég a pozitív szám.`,
      };
    }
    if (mezo.elojel === 'elojeles') {
      return {
        allapot: 'tipikus', ertek: v,
        uzenet: mezo.elojelUzenet || (mezo.helyes < 0
          ? 'Figyeljen az előjelre: itt csökkenés történt, ezért a változás negatív szám.'
          : 'Figyeljen az előjelre: itt növekedés történt, ezért a változás pozitív szám.'),
        ellenproba: ellenprobaSzoveg(mezo, v),
      };
    }
  }
  if (mezo.abszTures > 0 && Math.abs(v - mezo.helyes) <= mezo.abszTures + 1e-9) {
    return {
      allapot: 'jo-megjegyzes', ertek: v,
      uzenet: `Elfogadva. A kerekítés miatt ±${formaz(mezo.abszTures, 0)}${mezo.egyseg ? ' ' + mezo.egyseg : ''} eltérés előfordulhat; a pontos érték ${formaz(mezo.helyes, d)}${mezo.egyseg ? ' ' + mezo.egyseg : ''}.`,
    };
  }
  if (mezo.relTures > 0 && Math.abs(v - mezo.helyes) <= mezo.relTures * Math.abs(mezo.helyes) + 1e-9) {
    return {
      allapot: 'jo-megjegyzes', ertek: v,
      uzenet: `Elfogadva. Ez a kerekített köztes értékkel számolt eredmény (±${formaz(mezo.relTures * 100, 1)} % eltérés megengedett); a pontos érték ${formaz(mezo.helyes, d)}${mezo.egyseg ? ' ' + mezo.egyseg : ''}.`,
    };
  }
  const ellenproba = ellenprobaSzoveg(mezo, v);
  for (const h of mezo.hibak || []) {
    // h.tures: a hibához tartozó saját tűrés (pl. százalék alakban kerekítve beírt érték)
    if (egyezik(v, h.ertek, d) || (h.tures > 0 && Math.abs(v - h.ertek) <= h.tures)) return { allapot: 'tipikus', uzenet: h.uzenet, ertek: v, ellenproba };
  }
  return { allapot: 'rossz', uzenet: UZENET.rossz, ertek: v, ellenproba };
}

export function helyesE(eredmeny) {
  return eredmeny.allapot === 'jo' || eredmeny.allapot === 'jo-megjegyzes';
}

/** A mező helyes válasza szövegesen (eredménylapra). */
export function helyesValaszSzoveg(mezo) {
  if (mezo.tipus === 'valasztas') return mezo.opciok.find((o) => o.helyes)?.szoveg ?? '';
  return formaz(mezo.helyes, mezo.tizedes) + (mezo.egyseg ? ' ' + mezo.egyseg : '');
}
