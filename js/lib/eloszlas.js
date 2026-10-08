// Eloszlások függőség nélkül: binomiális, hipergeometrikus és normális eloszlás (v5, 8–9. téma).
// A diszkrét eloszlásoknál a határ beleértése számít (X ≤ k, X ≥ k), a normálisnál nem.

/** Kombináció: C(n, k) (egész, n ≤ néhány száz esetén double-ben pontos). */
export function kombinacio(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

// ---------------------------------------------------------------------
// Binomiális eloszlás: n kísérlet, p a kitüntetett aránya
// ---------------------------------------------------------------------
/** P(X = k) = C(n,k) · pᵏ · (1 − p)ⁿ⁻ᵏ */
export function binomPmf(n, p, k) {
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  return kombinacio(n, k) * p ** k * (1 - p) ** (n - k);
}
/** P(X ≤ k) */
export function binomCdf(n, p, k) {
  let s = 0;
  for (let i = 0; i <= Math.min(Math.floor(k), n); i++) s += binomPmf(n, p, i);
  return Math.min(1, s);
}
/** P(a ≤ X ≤ b) (egész határokkal, a határok benne vannak) */
export function binomTartomany(n, p, a, b) {
  let s = 0;
  for (let i = Math.max(0, a); i <= Math.min(n, b); i++) s += binomPmf(n, p, i);
  return Math.min(1, s);
}
export const binomVarhato = (n, p) => n * p;
export const binomSzoras = (n, p) => Math.sqrt(n * p * (1 - p));
/** A legvalószínűbb érték(ek): több elemű, ha holtverseny van. */
export function binomModuszok(n, p) {
  return moduszok(Array.from({ length: n + 1 }, (_, k) => binomPmf(n, p, k)), 0);
}
export const binomModusz = (n, p) => binomModuszok(n, p)[0];

// ---------------------------------------------------------------------
// Hipergeometrikus eloszlás: N elemű sokaság, ebből M kitüntetett, n elemű minta (visszatevés nélkül)
// ---------------------------------------------------------------------
/** P(X = k) = C(M,k) · C(N−M, n−k) / C(N,n) */
export function hiperPmf(N, M, n, k) {
  if (!Number.isInteger(k) || k < Math.max(0, n - (N - M)) || k > Math.min(n, M)) return 0;
  return (kombinacio(M, k) * kombinacio(N - M, n - k)) / kombinacio(N, n);
}
export function hiperCdf(N, M, n, k) {
  let s = 0;
  for (let i = 0; i <= Math.min(Math.floor(k), n); i++) s += hiperPmf(N, M, n, i);
  return Math.min(1, s);
}
export function hiperTartomany(N, M, n, a, b) {
  let s = 0;
  for (let i = Math.max(0, a); i <= Math.min(n, b); i++) s += hiperPmf(N, M, n, i);
  return Math.min(1, s);
}
export const hiperVarhato = (N, M, n) => (n * M) / N;
/** Szórás: √(n · M/N · (1 − M/N) · (N − n)/(N − 1)) */
export const hiperSzoras = (N, M, n) => Math.sqrt(n * (M / N) * (1 - M / N) * ((N - n) / (N - 1)));
export function hiperModuszok(N, M, n) {
  return moduszok(Array.from({ length: n + 1 }, (_, k) => hiperPmf(N, M, n, k)), 0);
}
export const hiperModusz = (N, M, n) => hiperModuszok(N, M, n)[0];

/** Az a(z) értékek (kezdőérték + index), ahol a valószínűség a maximum (egyenlőség 1e-12 relatív tűréssel). */
function moduszok(ps, kezdet) {
  const max = Math.max(...ps);
  const r = [];
  ps.forEach((p, i) => { if (Math.abs(p - max) <= 1e-12 * max) r.push(kezdet + i); });
  return r;
}

// ---------------------------------------------------------------------
// Normális eloszlás
// ---------------------------------------------------------------------
/**
 * Hibafüggvény erf(x): a nemnegatív tagú sor erf(x) = 2/√π · e^(−x²) · Σ 2ⁿ x^(2n+1) / (2n+1)!!,
 * így nincs kiolvadás; |x| ≥ 6 felett a érték 1 (a hiba < 10⁻¹⁶). Abszolút hiba ≈ 10⁻¹⁵.
 */
export function erf(x) {
  const a = Math.abs(x);
  if (a >= 6) return Math.sign(x);
  let tag = a, osszeg = a;
  for (let n = 0; n < 300; n++) {
    tag *= (2 * a * a) / (2 * n + 3);
    osszeg += tag;
    if (tag < 1e-18 * osszeg) break;
  }
  return Math.sign(x) * ((2 / Math.sqrt(Math.PI)) * Math.exp(-a * a) * osszeg);
}

/** Standard normális eloszlásfüggvény Φ(z). */
export const standardF = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

/** N(μ; σ) eloszlásfüggvénye: F(x) = P(X < x) (= P(X ≤ x), a folytonos esetben mindegy). */
export function normalisF(x, mu = 0, sigma = 1) {
  return standardF((x - mu) / sigma);
}
/** Sűrűségfüggvény. */
export function normalisSuruseg(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
/** P(a < X < b) */
export const normalisTartomany = (a, b, mu, sigma) => normalisF(b, mu, sigma) - normalisF(a, mu, sigma);

/** A standard normális kvantilise: Acklam-közelítés, két Halley-lépéssel finomítva (hiba < 10⁻¹²). */
export function standardKvantilis(p) {
  if (!(p > 0 && p < 1)) return p <= 0 ? -Infinity : Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const kozep = 0.02425;
  let x;
  if (p < kozep) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - kozep) {
    const q = p - 0.5, r = q * q;
    x = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  for (let i = 0; i < 2; i++) {
    const e = standardF(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
    x -= u / (1 + (x * u) / 2);
  }
  return x;
}

/** kvantilis(p, μ, σ): az az x, amelyre P(X < x) = p. */
export function kvantilis(p, mu = 0, sigma = 1) {
  return mu + sigma * standardKvantilis(p);
}
