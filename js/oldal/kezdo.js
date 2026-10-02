// Kezdőoldal: témakártyák saját haladással, legjobb teszteredmény.
import { el } from './kozos.js';
import { TEMAK } from '../temak/index.js';
import { temaSzazalek, legjobbTeszt, torol } from '../lib/haladas.js';

function kartyak() {
  const hely = document.getElementById('temaKartyak');
  hely.replaceChildren(...TEMAK.map((t, i) => {
    const sz = temaSzazalek(t);
    return el('article', { class: 'kartya' },
      el('p', { class: 'kartya-szam', text: `${i + 1}. téma` }),
      el('h3', { text: t.cim }),
      el('p', { text: t.rovid }),
      el('div', { class: 'haladas' },
        el('div', { class: 'haladas-sav', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(sz), 'aria-label': `${t.cim}: haladás` },
          el('span', { style: `width:${sz}%` })),
        el('span', { text: `${sz} %` })),
      el('a', { class: 'gomb elsodleges', href: `tema.html?t=${t.id}` }, 'Megnyitás'));
  }));
  const l = legjobbTeszt();
  document.getElementById('legjobb').textContent = l
    ? `Az Ön legjobb eredménye: ${l.pont}/${l.ossz} pont (${l.szazalek} %).`
    : 'Még nem töltött ki próbatesztet ebben a böngészőben.';
}

document.getElementById('haladasTorles').addEventListener('click', () => {
  if (!window.confirm('Biztosan törli a haladást és a legjobb teszteredményt ebből a böngészőből?')) return;
  torol();
  kartyak();
  document.getElementById('torlesUzenet').textContent = 'A haladás törölve.';
});

kartyak();
