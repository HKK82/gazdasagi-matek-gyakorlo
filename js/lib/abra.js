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
 * Diszkrét eloszláshoz (8. téma) bővítve: `diszkret` (szorosan álló oszlopok), `kiemelt` / `masik` (kiszínezett oszlopok:
 * a kérdezett, illetve a hallgató által tévesen beleértett oszlop), `cimkek` ('mind' | 'kiemelt' | 'nincs'),
 * `felirat` (pl. „P(X ≥ 3) = 0,3085”), `jelmagyarazat` ([{ osztaly: 'kiemelt'|'masik', szoveg }]), `varhatoCimke`.
 * @param {{ ertekek: Array<{x:number,p:number}>, varhato?: number, xfelirat?: string, leiras?: string, szel?: number, mag?: number,
 *   diszkret?: boolean, kiemelt?: number[], masik?: number[], cimkek?: string, felirat?: string,
 *   jelmagyarazat?: Array<{osztaly:string,szoveg:string}>, varhatoCimke?: string }} o
 */
export function eloszlasAbra(o) {
  const {
    ertekek, varhato, xfelirat = 'érték', leiras = 'Eloszlás oszlopdiagramja', szel = 520, mag = 340,
    diszkret = false, kiemelt = [], masik = [], felirat = '', jelmagyarazat = [], varhatoCimke,
  } = o;
  const cimkek = o.cimkek || (ertekek.length > 8 && (o.kiemelt || o.masik) ? 'kiemelt' : ertekek.length > 12 ? 'kiemelt' : 'mind');
  const id = 'elo' + (++szamlalo);
  void id;
  const bal = 56, jobb = 24, fent = felirat || jelmagyarazat.length ? 54 : 34, lent = 54;
  const W = szel - bal - jobb, H = mag - fent - lent;
  const xs = ertekek.map((e) => e.x);
  const kozep = varhato === undefined ? xs : [...xs, varhato];
  const kicsi = Math.min(...kozep), nagy = Math.max(...kozep);
  const tav = Math.max(nagy - kicsi, 1);
  const pad = diszkret ? 0.8 : tav * 0.2;
  const xmin = kicsi - pad, xmax = nagy + pad;
  const pmax = Math.max(...ertekek.map((e) => e.p));
  const ymax = Math.min(1, Math.ceil((pmax + 0.05) * 10) / 10);
  const px = (x) => bal + ((x - xmin) / (xmax - xmin)) * W;
  const py = (p) => fent + H - (p / ymax) * H;
  const sav = diszkret
    ? Math.max(2, Math.min(70, (0.82 * W) / (xmax - xmin)))
    : Math.min(W / (ertekek.length * 2.2), 70);
  const r = [];
  r.push(`<svg class="abra" viewBox="0 0 ${szel} ${mag}" role="img" aria-label="${esc(leiras)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(leiras)}</title>`);
  const lepes = ymax <= 0.5 ? 0.1 : 0.2;
  for (let p = 0; p <= ymax + 1e-9; p = tisztit(p + lepes)) {
    r.push(`<line class="abra-racs" x1="${bal}" y1="${py(p)}" x2="${bal + W}" y2="${py(p)}"/>`);
    r.push(`<text class="abra-skala" x="${bal - 8}" y="${py(p) + 5}" text-anchor="end">${formaz(p, 2)}</text>`);
  }
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${py(0)}" x2="${bal + W}" y2="${py(0)}"/>`);
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${fent - 6}" x2="${bal}" y2="${py(0)}"/>`);
  // sok oszlopnál nem minden x-érték kap feliratot
  const xlepes = ertekek.length > 24 ? 5 : ertekek.length > 12 ? 2 : 1;
  const szinezett = kiemelt.length > 0 || masik.length > 0;
  ertekek.forEach((e, i) => {
    const osztaly = masik.includes(e.x) ? ' masik' : kiemelt.includes(e.x) ? ' kiemelt' : szinezett ? ' szurke' : '';
    r.push(`<rect class="abra-oszlop${osztaly}" x="${px(e.x) - sav / 2}" y="${py(e.p)}" width="${sav}" height="${Math.max(0, py(0) - py(e.p))}"><title>${esc(`${formaz(e.x, 2)}: ${formaz(e.p, 4)}`)}</title></rect>`);
    const cimkezett = cimkek === 'mind' || (cimkek === 'kiemelt' && (kiemelt.includes(e.x) || masik.includes(e.x)));
    if (cimkezett && e.p > 0) r.push(`<text class="abra-cimke" x="${px(e.x)}" y="${py(e.p) - 7}" text-anchor="middle">${formaz(e.p, 4)}</text>`);
    if (!diszkret || i % xlepes === 0 || kiemelt.includes(e.x) || masik.includes(e.x)) {
      r.push(`<text class="abra-skala" x="${px(e.x)}" y="${py(0) + 18}" text-anchor="middle">${formaz(e.x, 2)}</text>`);
    }
  });
  if (varhato !== undefined) {
    r.push(`<line class="abra-seged" x1="${px(varhato)}" y1="${fent - 6}" x2="${px(varhato)}" y2="${py(0)}"/>`);
    r.push(`<text class="abra-cimke v2" x="${px(varhato) + 5}" y="${fent + 8}">${esc(varhatoCimke || `M(X) = ${formaz(varhato, 2)}`)}</text>`);
  }
  r.push(`<text class="abra-felirat" x="${bal + W / 2}" y="${mag - 8}" text-anchor="middle">${esc(xfelirat)}</text>`);
  r.push(`<text class="abra-felirat" x="${bal}" y="${fent - 16}">valószínűség</text>`);
  if (felirat) r.push(`<text class="abra-felirat" x="${bal + W}" y="${fent - 30}" text-anchor="end">${esc(felirat)}</text>`);
  // jelmagyarázat: kis színes négyzetek a felirat alatt
  let jx = bal + W;
  for (const j of [...jelmagyarazat].reverse()) {
    const szel2 = 22 + j.szoveg.length * 6.6;
    jx -= szel2;
    r.push(`<rect class="abra-oszlop ${esc(j.osztaly)}" x="${jx}" y="${fent - 24}" width="12" height="12"/>`);
    r.push(`<text class="abra-skala" x="${jx + 17}" y="${fent - 13}">${esc(j.szoveg)}</text>`);
  }
  r.push('</svg>');
  return r.join('');
}

/**
 * Normális eloszlás harangja: a sűrűségfüggvény görbéje, kiszínezett területekkel (a kérdezett rész: `kiemelt`,
 * a másik – pl. a szimmetrikus kérdésnél a két kimaradó „fecni” – `masik`), μ és a határok feliratozva.
 * @param {{ mu: number, sigma: number, savok?: Array<{a:number,b:number,osztaly?:string}>, hatarok?: Array<{x:number,cimke?:string}>,
 *   xfelirat?: string, felirat?: string, leiras?: string, szel?: number, mag?: number, tizedes?: number }} o
 */
export function haranAbra(o) {
  const { mu, sigma, savok = [], hatarok = [], xfelirat = 'érték', felirat = '', leiras = 'Normális eloszlás sűrűségfüggvénye', szel = 520, mag = 300, tizedes = 2 } = o;
  const bal = 24, jobb = 24, fent = felirat ? 46 : 30, lent = 52;
  const W = szel - bal - jobb, H = mag - fent - lent;
  const kezd = mu - 3.6 * sigma, veg = mu + 3.6 * sigma;
  const fmax = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const px = (x) => bal + ((x - kezd) / (veg - kezd)) * W;
  const py = (y) => fent + H - (y / (fmax * 1.12)) * H;
  const sur = (x) => fmax * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  const r = [];
  r.push(`<svg class="abra" viewBox="0 0 ${szel} ${mag}" role="img" aria-label="${esc(leiras)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(leiras)}</title>`);
  // kiszínezett területek a görbe alatt (poligon a görbe és a tengely között)
  for (const b of savok) {
    const a = Math.max(b.a, kezd), c = Math.min(b.b, veg);
    if (c <= a) continue;
    const pts = [`${px(a).toFixed(2)},${py(0).toFixed(2)}`];
    const n = 80;
    for (let i = 0; i <= n; i++) { const x = a + ((c - a) * i) / n; pts.push(`${px(x).toFixed(2)},${py(sur(x)).toFixed(2)}`); }
    pts.push(`${px(c).toFixed(2)},${py(0).toFixed(2)}`);
    r.push(`<polygon class="abra-terulet ${esc(b.osztaly || 'kiemelt')}" points="${pts.join(' ')}"/>`);
  }
  // a görbe
  const gorbe = [];
  for (let i = 0; i <= 200; i++) { const x = kezd + ((veg - kezd) * i) / 200; gorbe.push(`${px(x).toFixed(2)},${py(sur(x)).toFixed(2)}`); }
  r.push(`<polyline class="abra-gorbe" points="${gorbe.join(' ')}"/>`);
  r.push(`<line class="abra-tengely" x1="${bal}" y1="${py(0)}" x2="${bal + W}" y2="${py(0)}"/>`);
  // skála: μ ± kσ (k = 0…3)
  for (let k = -3; k <= 3; k++) {
    const x = mu + k * sigma;
    r.push(`<line class="abra-tengely" x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${py(0) + 5}"/>`);
    r.push(`<text class="abra-skala" x="${px(x)}" y="${py(0) + 19}" text-anchor="middle">${formaz(x, 3)}</text>`);
  }
  // μ és a határok
  r.push(`<line class="abra-seged" x1="${px(mu)}" y1="${py(sur(mu))}" x2="${px(mu)}" y2="${py(0)}"/>`);
  r.push(`<text class="abra-cimke" x="${px(mu)}" y="${py(sur(mu)) - 8}" text-anchor="middle">μ = ${formaz(mu, 3)}</text>`);
  for (const h of hatarok) {
    r.push(`<line class="abra-seged v2" x1="${px(h.x)}" y1="${py(sur(h.x))}" x2="${px(h.x)}" y2="${py(0)}"/>`);
    r.push(`<text class="abra-cimke v2" x="${px(h.x)}" y="${py(0) - 8}" text-anchor="middle">${esc(h.cimke ?? formaz(h.x, tizedes))}</text>`);
  }
  r.push(`<text class="abra-felirat" x="${bal + W / 2}" y="${mag - 8}" text-anchor="middle">${esc(xfelirat)}</text>`);
  if (felirat) r.push(`<text class="abra-felirat" x="${bal + W}" y="${fent - 22}" text-anchor="end">${esc(felirat)}</text>`);
  r.push('</svg>');
  return r.join('');
}
