// Egyszerű SVG koordináta-rendszer egyenesekkel és pontokkal (külső könyvtár nélkül).
import { formaz, tisztit } from './szam.js';

let szamlalo = 0;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @param {object} o
 *  xmin, xmax, ymin, ymax, xlepes, ylepes – tartomány és rácsköz
 *  egyenesek: [{ m, b, cimke, osztaly: 'v1'|'v2'|'v3', tol, ig }]
 *  pontok: [{ x, y, cimke }]
 *  fuggolegesek: [{ x, cimke }] – szaggatott függőleges vonal
 *  xfelirat, yfelirat, leiras (akadálymentes szöveg)
 */
export function koordinataRendszer(o) {
  const {
    xmin, xmax, ymin, ymax, xlepes = 1, ylepes = 1,
    egyenesek = [], pontok = [], fuggolegesek = [],
    xfelirat = 'x', yfelirat = 'y', leiras = 'Koordináta-rendszer',
    szel = 520, mag = 400, minden = 1,
  } = o;
  const id = 'vag' + (++szamlalo);
  const bal = 52, jobb = 22, fent = 26, lent = 42;
  const W = szel - bal - jobb, H = mag - fent - lent;
  const px = (x) => bal + ((x - xmin) / (xmax - xmin)) * W;
  const py = (y) => fent + ((ymax - y) / (ymax - ymin)) * H;
  const r = [];
  r.push(`<svg class="abra" viewBox="0 0 ${szel} ${mag}" role="img" aria-label="${esc(leiras)}" xmlns="http://www.w3.org/2000/svg">`);
  r.push(`<title>${esc(leiras)}</title>`);
  r.push(`<defs><clipPath id="${id}"><rect x="${bal}" y="${fent}" width="${W}" height="${H}"/></clipPath></defs>`);

  // rács + skála
  const xTengelyY = ymin <= 0 && ymax >= 0 ? 0 : ymin;
  const yTengelyX = xmin <= 0 && xmax >= 0 ? 0 : xmin;
  let i = 0;
  for (let x = Math.ceil(xmin / xlepes) * xlepes; x <= xmax + 1e-9; x = tisztit(x + xlepes), i++) {
    r.push(`<line class="abra-racs" x1="${px(x)}" y1="${fent}" x2="${px(x)}" y2="${fent + H}"/>`);
    if (Math.abs(x - yTengelyX) > 1e-9 && i % minden === 0) {
      r.push(`<text class="abra-skala" x="${px(x)}" y="${Math.min(py(xTengelyY) + 18, fent + H + 18)}" text-anchor="middle">${formaz(x, 2)}</text>`);
    }
  }
  i = 0;
  for (let y = Math.ceil(ymin / ylepes) * ylepes; y <= ymax + 1e-9; y = tisztit(y + ylepes), i++) {
    r.push(`<line class="abra-racs" x1="${bal}" y1="${py(y)}" x2="${bal + W}" y2="${py(y)}"/>`);
    if (Math.abs(y - xTengelyY) > 1e-9 && i % minden === 0) {
      r.push(`<text class="abra-skala" x="${Math.max(px(yTengelyX) - 7, bal - 7)}" y="${py(y) + 5}" text-anchor="end">${formaz(y, 2)}</text>`);
    }
  }
  if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) {
    r.push(`<text class="abra-skala" x="${px(0) - 7}" y="${py(0) + 18}" text-anchor="end">0</text>`);
  }
  // tengelyek nyíllal
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${py(xTengelyY)}" x2="${bal + W + 12}" y2="${py(xTengelyY)}"/>`);
  r.push(`<path class="abra-nyil" d="M${bal + W + 14},${py(xTengelyY)} l-9,-5 v10 z"/>`);
  r.push(`<text class="abra-felirat" x="${bal + W + 10}" y="${py(xTengelyY) - 9}" text-anchor="end">${esc(xfelirat)}</text>`);
  r.push(`<line class="abra-tengely" x1="${px(yTengelyX)}" y1="${fent + H}" x2="${px(yTengelyX)}" y2="${fent - 12}"/>`);
  r.push(`<path class="abra-nyil" d="M${px(yTengelyX)},${fent - 14} l-5,9 h10 z"/>`);
  r.push(`<text class="abra-felirat" x="${px(yTengelyX) + 9}" y="${fent - 4}">${esc(yfelirat)}</text>`);

  // függőleges segédvonalak
  for (const f of fuggolegesek) {
    r.push(`<line class="abra-seged" x1="${px(f.x)}" y1="${fent}" x2="${px(f.x)}" y2="${fent + H}"/>`);
    if (f.cimke) r.push(`<text class="abra-cimke" x="${px(f.x) + 5}" y="${fent + 16}">${esc(f.cimke)}</text>`);
  }

  // egyenesek
  egyenesek.forEach((e, k) => {
    const tol = e.tol ?? xmin, ig = e.ig ?? xmax;
    const osztaly = e.osztaly || 'v' + (k + 1);
    r.push(`<line class="abra-vonal ${osztaly}" clip-path="url(#${id})" x1="${px(tol)}" y1="${py(e.m * tol + e.b)}" x2="${px(ig)}" y2="${py(e.m * ig + e.b)}"/>`);
    if (e.cimke) {
      // a címke a látható szakasz jobb vége közelébe
      let xc = ig;
      for (let t = 0; t < 40; t++) {
        const y = e.m * xc + e.b;
        if (y >= ymin && y <= ymax) break;
        xc -= (ig - tol) / 40;
      }
      const yc = Math.max(ymin, Math.min(ymax, e.m * xc + e.b));
      r.push(`<text class="abra-cimke ${osztaly}" x="${px(xc) - 6}" y="${py(yc) + (e.m > 0 ? 18 : -8)}" text-anchor="end">${esc(e.cimke)}</text>`);
    }
  });

  // pontok
  for (const p of pontok) {
    r.push(`<circle class="abra-pont" cx="${px(p.x)}" cy="${py(p.y)}" r="5.5"/>`);
    if (p.cimke) r.push(`<text class="abra-cimke" x="${px(p.x) + 9}" y="${py(p.y) - 9}">${esc(p.cimke)}</text>`);
  }
  r.push('</svg>');
  return r.join('');
}
