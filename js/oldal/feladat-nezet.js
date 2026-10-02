// Egy feladat beviteli mezőinek kirajzolása (gyakorlás és próbateszt közösen).
import { el } from './kozos.js';

let sorszam = 0;

const IKON = { jo: '✔', 'jo-megjegyzes': '✔', tipikus: '⚠', rossz: '✖', ervenytelen: 'ℹ', ures: 'ℹ' };
const OSZTALY = { jo: 'jo', 'jo-megjegyzes': 'jo', tipikus: 'tipikus', rossz: 'rossz', ervenytelen: 'info', ures: 'info' };

/**
 * „Miért így?” – szöveges magyarázat a feladat konkrét számaival (SPEC 3.2).
 * Lenyitható; a `nyitva` megadja, hogy kinyitva jelenjen-e meg.
 */
export function miertElem(feladat, nyitva = false) {
  if (!feladat.magyarazat || !feladat.magyarazat.length) return null;
  return el('details', { class: 'miert', open: nyitva },
    el('summary', { text: 'Miért így? – magyarázat szavakkal' }),
    el('div', { class: 'miert-szoveg' }, feladat.magyarazat.map((p) => el('p', { html: p }))));
}

export function abraElem(svg) {
  if (!svg) return null;
  return el('div', { class: 'abra-tarto', html: typeof svg === 'function' ? svg() : svg });
}

/**
 * @returns {{ elem: HTMLElement, mezok: Array<{ mezo, ertek: () => string, beallit: (e, opciok) => void, torol: () => void, fokusz: () => void, onValtozas: (fn) => void }> }}
 */
export function mezokRajzol(feladat, { visszajelzes = true } = {}) {
  const prefix = 'f' + (++sorszam);
  const tarto = el('div', { class: feladat.tablazat ? 'mezok tablazat' : 'mezok' });
  const lista = feladat.mezok.map((m, i) => {
    const id = `${prefix}-${i}`;
    const vj = el('p', { class: 'mezo-vj', id: `${id}-vj`, 'aria-live': visszajelzes ? 'polite' : null });
    let sor, ertek, fokusz, onValtozas, bemenetek;
    if (m.tipus === 'szam') {
      const input = el('input', {
        type: 'text', id, name: id, autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off',
        inputmode: m.negativ ? 'text' : 'decimal', 'aria-describedby': `${id}-vj`,
      });
      sor = el('div', { class: 'mezo' },
        el('label', { for: id, text: m.cimke }),
        el('div', { class: 'bevitel-sor' }, input, m.egyseg ? el('span', { class: 'egyseg', text: m.egyseg, 'aria-hidden': 'true' }) : null),
        vj);
      ertek = () => input.value;
      fokusz = () => input.focus();
      onValtozas = (fn) => input.addEventListener('input', fn);
      bemenetek = [input];
    } else {
      const legend = el('legend', { text: m.cimke });
      const radiok = m.opciok.map((o, k) => {
        const r = el('input', { type: 'radio', name: id, value: String(k), id: `${id}-${k}` });
        return { r, cimke: el('label', { class: 'opcio', for: `${id}-${k}` }, r, el('span', { text: o.szoveg })) };
      });
      sor = el('div', { class: 'mezo' },
        el('fieldset', { 'aria-describedby': `${id}-vj` }, legend, radiok.map((x) => x.cimke)), vj);
      ertek = () => radiok.find((x) => x.r.checked)?.r.value ?? '';
      fokusz = () => radiok[0].r.focus();
      onValtozas = (fn) => radiok.forEach((x) => x.r.addEventListener('change', fn));
      bemenetek = radiok.map((x) => x.r);
    }
    tarto.append(sor);
    return {
      mezo: m, ertek, fokusz, onValtozas,
      beallit(eredmeny) {
        sor.className = 'mezo allapot-' + OSZTALY[eredmeny.allapot];
        const szoveg = eredmeny.allapot === 'jo' ? 'Helyes.' : eredmeny.uzenet;
        vj.className = 'mezo-vj vj-' + OSZTALY[eredmeny.allapot];
        vj.replaceChildren(`${IKON[eredmeny.allapot]} ${szoveg}`);
        if (eredmeny.ellenproba) vj.append(el('span', { class: 'ellenproba', text: eredmeny.ellenproba }));
        const rossz = !(eredmeny.allapot === 'jo' || eredmeny.allapot === 'jo-megjegyzes');
        for (const b of bemenetek) {
          if (rossz) b.setAttribute('aria-invalid', 'true'); else b.removeAttribute('aria-invalid');
        }
      },
      torol() {
        sor.className = 'mezo';
        vj.textContent = '';
        for (const b of bemenetek) b.removeAttribute('aria-invalid');
      },
      letilt(be = true) { for (const b of bemenetek) b.disabled = be; },
    };
  });
  return { elem: tarto, mezok: lista };
}
