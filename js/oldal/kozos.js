// Minden oldalon közös: „Nagy betű” kapcsoló és apró DOM-segédek.

const NAGY_KULCS = 'gmgy-nagybetu';

export function nagyBetuInit() {
  const gomb = document.getElementById('nagyBetu');
  if (!gomb) return;
  const allit = (be) => {
    document.documentElement.classList.toggle('nagy-betu', be);
    gomb.setAttribute('aria-pressed', String(be));
    try { localStorage.setItem(NAGY_KULCS, be ? '1' : '0'); } catch { /* nem baj */ }
  };
  gomb.setAttribute('aria-pressed', String(document.documentElement.classList.contains('nagy-betu')));
  gomb.addEventListener('click', () => allit(!document.documentElement.classList.contains('nagy-betu')));
}

/** Tördelés: a „12 %-kal” ne törjön szét (nem törhető szóköz és kötőjel). */
export function tordeles(s) {
  return String(s)
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ') // 1 069 200
    .replace(/(\d) %/g, '$1 %')
    .replace(/%-/g, '%‑');
}

/**
 * Elem létrehozása: el('p', { class: 'x', text: '…' }, gyerek1, gyerek2)
 * Az `html` attribútum belső (megbízható, saját) tartalomhoz való.
 */
export function el(tag, attr = {}, ...gyerekek) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attr)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') e.textContent = tordeles(v);
    else if (k === 'html') e.innerHTML = tordeles(v);
    else if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const g of gyerekek.flat()) if (g !== null && g !== undefined && g !== false) e.append(g);
  return e;
}

nagyBetuInit();
