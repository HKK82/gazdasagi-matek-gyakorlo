// Egyszerű SVG koordináta-rendszer egyenesekkel és pontokkal (külső könyvtár nélkül).
import { formaz, tisztit } from './szam.js';

let szamlalo = 0;

/** „Szép” skálalépés (1, 2 vagy 5 · 10ᵏ), hogy kb. `db` osztás férjen a [0, max] tartományra. */
export function szepLepes(max, db = 5) {
  const nyers = Math.abs(max) / db || 1;
  const nagysag = 10 ** Math.floor(Math.log10(nyers));
  const m = nyers / nagysag;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * nagysag;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @param {object} o
 *  xmin, xmax, ymin, ymax, xlepes, ylepes – tartomány és rácsköz
 *  egyenesek: [{ m, b, cimke, osztaly: 'v1'|'v2'|'v3', tol, ig }]
 *  pontok: [{ x, y, cimke }]
 *  fuggolegesek: [{ x, cimke }] – szaggatott függőleges vonal
 *  gorbek: [{ fn, osztaly, cimke, tol, ig }] – tetszőleges függvény (mintavételezett görbe)
 *  vizszintesek: [{ y, cimke }] – szaggatott vízszintes vonal (pl. y = K)
 *  savok: [{ x1, x2, cimke }] – színezett függőleges sáv (pl. a „nyereséges” tartomány)
 *  bal – a bal margó (nagy számú y-skálánál növelhető), yminden – az y-skála feliratainak ritkítása
 *  xfelirat, yfelirat, leiras (akadálymentes szöveg)
 */
export function koordinataRendszer(o) {
  const {
    xmin, xmax, ymin, ymax, xlepes = 1, ylepes = 1,
    egyenesek = [], pontok = [], fuggolegesek = [],
    xfelirat = 'x', yfelirat = 'y', leiras = 'Koordináta-rendszer',
    szel = 520, mag = 400, minden = 1, yminden = minden,
    gorbek = [], vizszintesek = [], savok = [], bal = 52,
  } = o;
  const id = 'vag' + (++szamlalo);
  const jobb = 22, fent = 26, lent = 42;
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
    if (Math.abs(y - xTengelyY) > 1e-9 && i % yminden === 0) {
      r.push(`<text class="abra-skala" x="${Math.max(px(yTengelyX) - 7, bal - 7)}" y="${py(y) + 5}" text-anchor="end">${formaz(y, 2)}</text>`);
    }
  }
  if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) {
    r.push(`<text class="abra-skala" x="${px(0) - 7}" y="${py(0) + 18}" text-anchor="end">0</text>`);
  }
  // színezett sávok (a rács fölött, a görbék alatt)
  for (const b of savok) {
    const x1 = Math.max(b.x1, xmin), x2 = Math.min(b.x2, xmax);
    if (x2 <= x1) continue;
    r.push(`<rect class="abra-sav" x="${px(x1)}" y="${fent}" width="${px(x2) - px(x1)}" height="${H}"/>`);
    if (b.cimke) r.push(`<text class="abra-cimke" x="${(px(x1) + px(x2)) / 2}" y="${fent + H - 8}" text-anchor="middle">${esc(b.cimke)}</text>`);
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

  // vízszintes segédvonalak (pl. y = K)
  for (const v of vizszintesek) {
    r.push(`<line class="abra-seged" x1="${bal}" y1="${py(v.y)}" x2="${bal + W}" y2="${py(v.y)}"/>`);
    if (v.cimke) r.push(`<text class="abra-cimke" x="${bal + W - 4}" y="${py(v.y) - 6}" text-anchor="end">${esc(v.cimke)}</text>`);
  }

  // görbék (tetszőleges függvény): mintavételezett törött vonal, a rajzterületre vágva
  gorbek.forEach((g, k) => {
    const tol = g.tol ?? xmin, ig = g.ig ?? xmax, n = g.minta ?? 200;
    const pontok = [];
    for (let i = 0; i <= n; i++) {
      const x = tol + ((ig - tol) * i) / n, y = g.fn(x);
      if (Number.isFinite(y)) pontok.push(`${px(x).toFixed(2)},${Math.max(-1e4, Math.min(1e4, py(y))).toFixed(2)}`);
    }
    const osztaly = g.osztaly || 'v' + (k + 1);
    r.push(`<polyline class="abra-vonal ${osztaly}" clip-path="url(#${id})" points="${pontok.join(' ')}"/>`);
    if (g.cimke) {
      const xc = g.cimkeX ?? ig;
      const yc = Math.max(ymin, Math.min(ymax, g.fn(xc)));
      r.push(`<text class="abra-cimke ${osztaly}" x="${Math.min(px(xc), bal + W - 4)}" y="${py(yc) - 8}" text-anchor="end">${esc(g.cimke)}</text>`);
    }
  });

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

/**
 * Eloszlás oszlopdiagramja: x = a változó értékei (pl. nyeremény), magasság = valószínűség,
 * a várható érték függőleges szaggatott vonallal.
 * @param {{ ertekek: Array<{x:number,p:number}>, varhato?: number, xfelirat?: string, leiras?: string, szel?: number, mag?: number }} o
 */
export function eloszlasAbra(o) {
  const { ertekek, varhato, xfelirat = 'érték', leiras = 'Eloszlás oszlopdiagramja', szel = 520, mag = 340 } = o;
  const id = 'elo' + (++szamlalo);
  void id;
  const bal = 56, jobb = 24, fent = 34, lent = 54;
  const W = szel - bal - jobb, H = mag - fent - lent;
  const xs = ertekek.map((e) => e.x);
  const kozep = varhato === undefined ? xs : [...xs, varhato];
  const kicsi = Math.min(...kozep), nagy = Math.max(...kozep);
  const tav = Math.max(nagy - kicsi, 1);
  const xmin = kicsi - tav * 0.2, xmax = nagy + tav * 0.2;
  const pmax = Math.max(...ertekek.map((e) => e.p));
  const ymax = Math.min(1, Math.ceil((pmax + 0.05) * 10) / 10);
  const px = (x) => bal + ((x - xmin) / (xmax - xmin)) * W;
  const py = (p) => fent + H - (p / ymax) * H;
  const sav = Math.min(W / (ertekek.length * 2.2), 70);
  const r = [];
  r.push(`<svg class="abra" viewBox="0 0 ${szel} ${mag}" role="img" aria-label="${esc(leiras)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(leiras)}</title>`);
  const lepes = ymax <= 0.5 ? 0.1 : 0.2;
  for (let p = 0; p <= ymax + 1e-9; p = tisztit(p + lepes)) {
    r.push(`<line class="abra-racs" x1="${bal}" y1="${py(p)}" x2="${bal + W}" y2="${py(p)}"/>`);
    r.push(`<text class="abra-skala" x="${bal - 8}" y="${py(p) + 5}" text-anchor="end">${formaz(p, 2)}</text>`);
  }
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${py(0)}" x2="${bal + W}" y2="${py(0)}"/>`);
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${fent - 6}" x2="${bal}" y2="${py(0)}"/>`);
  for (const e of ertekek) {
    r.push(`<rect class="abra-oszlop" x="${px(e.x) - sav / 2}" y="${py(e.p)}" width="${sav}" height="${py(0) - py(e.p)}"><title>${esc(`${formaz(e.x, 2)}: ${formaz(e.p, 4)}`)}</title></rect>`);
    r.push(`<text class="abra-cimke" x="${px(e.x)}" y="${py(e.p) - 7}" text-anchor="middle">${formaz(e.p, 4)}</text>`);
    r.push(`<text class="abra-skala" x="${px(e.x)}" y="${py(0) + 18}" text-anchor="middle">${formaz(e.x, 2)}</text>`);
  }
  if (varhato !== undefined) {
    r.push(`<line class="abra-seged" x1="${px(varhato)}" y1="${fent - 6}" x2="${px(varhato)}" y2="${py(0)}"/>`);
    r.push(`<text class="abra-cimke v2" x="${px(varhato) + 5}" y="${fent + 8}">M(X) = ${formaz(varhato, 2)}</text>`);
  }
  r.push(`<text class="abra-felirat" x="${bal + W / 2}" y="${mag - 8}" text-anchor="middle">${esc(xfelirat)}</text>`);
  r.push(`<text class="abra-felirat" x="${bal}" y="${fent - 16}">valószínűség</text>`);
  r.push('</svg>');
  return r.join('');
}
