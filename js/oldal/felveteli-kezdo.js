// Felvételi kezdőoldal: témakártyák saját haladással, a próba felvételi legjobb eredménye.
import { el } from './kozos.js';
import { FELVETELI_TEMAK } from '../temak/index.js';
import { temaSzazalek, legjobbTeszt, torolFelveteli } from '../lib/haladas.js';

function kartyak() {
  const hely = document.getElementById('temaKartyak');
  hely.replaceChildren(...FELVETELI_TEMAK.map((t, i) => {
    const sz = temaSzazalek(t);
    return el('article', { class: 'kartya' },
      el('p', { class: 'kartya-szam', text: `${i + 1}. témakör` }),
      el('h3', { text: t.cim }),
      el('p', { text: t.rovid }),
      el('div', { class: 'haladas' },
        el('div', { class: 'haladas-sav', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(sz), 'aria-label': `${t.cim}: haladás` },
          el('span', { style: `width:${sz}%` })),
        el('span', { text: `${sz} %` })),
      el('a', { class: 'gomb elsodleges', href: `tema.html?t=${t.id}` }, 'Megnyitás'));
  }));
  const l = legjobbTeszt('felvTeszt');
  document.getElementById('legjobb').textContent = l
    ? `A legjobb eredményed: ${l.pont}/${l.ossz} pont (${l.szazalek} %).`
    : 'Még nem csináltál próba felvételit ebben a böngészőben.';
}

document.getElementById('haladasTorles').addEventListener('click', () => {
  if (!window.confirm('Biztosan törlöd a felvételi haladást és a próba felvételi eredményét ebből a böngészőből?')) return;
  torolFelveteli(FELVETELI_TEMAK.map((t) => t.id));
  kartyak();
  document.getElementById('torlesUzenet').textContent = 'A felvételi haladás törölve.';
});

kartyak();
