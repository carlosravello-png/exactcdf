// pbeta(x, a, b, lowerTail) — DiDonato y Morris (1992), TOMS 708, con las técnicas en doble precisión de D6b.1-D6b.7,
// 3a.4-3a.7, 5.1-5.4 y C27-C39 (expediente l. 1128-1338, 1714-1943, 1945-2016).
// El árbol de §3 (l. 1231-1267) elige entre BPSER (7), BUP (8), BGRAT (9), BFRAC (10) y BASYM (11); cada hoja da J,
// la cola inferior o superior del problema original según los intercambios (C37).
import { validar, validarLowerTail } from "./error.js";
import { two_sum, two_prod, dd_add, dd_mul, dd_div, exp_dd, ln_dd, ln1m_dd, phi1_apE, phi1_serie } from "./primitivas.js";
import { _erfc, _erfcScaled } from "./erfc.js";
import { _gamma, } from "./gamma.js";
import { _gamma1pm1 } from "./gamma1pm1.js";
import { _lgamma, _delta24 } from "./lgamma.js";
import { _gratio, _cf11, _Rpequeno } from "./pgamma.js";

// 3a.4 y C39: ε = máx(ε₀, 10⁻¹⁵) = 10⁻¹⁵. BPSER y BUP: ε; BGRAT y BFRAC: 15ε; BASYM: 100ε.
const EPS = Math.max(Number.EPSILON, 1e-15);
const ESCALA = 2 ** 600; // C29
const ESCALA_INV = 2 ** -600;
const LN_MIN = -1074 * Math.LN2; // ln(2⁻¹⁰⁷⁴), paso 0 de BGRAT (D6b.6 paso 3)

// DM92 (24), bloque dm92_24 (folio 370): cₙ para (28) con b ≥ 15 (3a.5, B22)
const C_24 = [.833333333333333E-01, -.277777777770481E-02, .793650663183693E-03, -.595156336428591E-03, .820756370353826E-03];

const neg = (d) => [-d[0], -d[1]];

// ---------------------------------------------------------------------------------------------------------------
// Par (x, y) con su marca de exactitud (D6b.1): x es exacto al entrar; y lo es solo si x ≥ 1/2.
// Los intercambios de §3 intercambian también la marca.
function inv(par) {
  return { x: par.y, y: par.x, xe: par.ye, ye: par.xe };
}
// ln x y ln y en doble-doble (D6b.1, D6b.2): si el miembro es exacto, ln_dd; si no, ln1m_dd del otro (exacto y ≤ 1/2).
function lnX(par) {
  return par.xe ? ln_dd(par.x) : ln1m_dd(par.y);
}
function lnY(par) {
  return par.ye ? ln_dd(par.y) : ln1m_dd(par.x);
}

// ---------------------------------------------------------------------------------------------------------------
// Funciones auxiliares (§4, folios 369-372).

// Δ(a), a ≥ 8 (3a.5, 5.1): a ≥ 15 por (24); 8 ≤ a < 15 por lnΓ − Stirling en el orden de 5.1 (A1).
function Delta(a) {
  if (a >= 15) return _delta24(a);
  return _lgamma(a) - (((a - 0.5) * Math.log(a) - a) + 0.5 * Math.log(2 * Math.PI));
}

// w = Δ(b) − Δ(a + b), b ≥ 8, a ≥ 0 (3a.5): b ≥ 15 por (28) con los cₙ de (24), n = 0 … 4 ascendente (B22, C35); si no, directo.
function wDelta(a, b) {
  if (b >= 15) {
    const p = a / (a + b);
    const q = b / (a + b);
    const bb = b * b;
    // AMBIGÜEDAD #15: q^m y b^(2n) como productos corrientes (firmada, paquete 9, 9.4)
    let S = 1; // S₁
    let qm = q; // q^m con m = 2n + 1
    let bp = 1; // b^(2n)
    let suma = 0;
    for (let n = 0; n <= 4; n++) {
      suma += (C_24[n] * S) / bp;
      S = S + qm + qm * q; // S_{m+2} = S_m + q^m + q^(m+1)
      qm = qm * q * q;
      bp = bp * bb;
    }
    return (p / b) * suma; // (28)
  }
  return Delta(b) - Delta(a + b);
}

// ALGDIV(a, b) = ln[Γ(b)/Γ(a + b)], a ≥ 0, b ≥ 8 — (26): w − (a + b − .5)ln(1 + a/b) − a(ln b − 1)
function algdiv(a, b) {
  const w = wDelta(a, b);
  return (w - (a + b - 0.5) * Math.log1p(a / b)) - a * (Math.log(b) - 1);
}

// BCORR(a, b) = Δ(a₀) + [Δ(b₀) − Δ(a₀ + b₀)], a₀ = mín, b₀ = máx, a, b ≥ 8
function bcorr(a, b) {
  const a0 = Math.min(a, b);
  const b0 = Math.max(a, b);
  return Delta(a0) + wDelta(a0, b0);
}

// BETALN(a, b) = ln B(a, b), mín(a, b) ≥ 1 (folio 371, 3a.6, C34): factores de la reducción de a y de b, un solo logaritmo.
function betaln(a, b) {
  let a0 = Math.min(a, b);
  let b0 = Math.max(a, b);
  if (a0 >= 8) {
    const u = -(a0 - 0.5) * Math.log(a0 / (a0 + b0));
    const v = b0 * Math.log1p(a0 / b0);
    return (((0.5 * Math.log(2 * Math.PI) - 0.5 * Math.log(b0)) + bcorr(a0, b0)) - u) - v;
  }
  let prod = 1;
  // AMBIGÜEDAD #15: se reduce primero a y luego b, con cada factor escrito como a′/(a′ + b), a′ = a − 1 (firmada, paquete 9, 9.4)
  while (a0 > 2) { // B(a, b) = ((a − 1)/(a + b − 1))·B(a − 1, b)
    a0 = a0 - 1;
    prod = prod * (a0 / (a0 + b0));
  }
  let base;
  if (b0 >= 8) {
    base = _lgamma(a0) + algdiv(a0, b0);
  } else {
    while (b0 > 2) { // B(a, b) = ((b − 1)/(a + b − 1))·B(a, b − 1) (3a.6)
      b0 = b0 - 1;
      prod = prod * (b0 / (a0 + b0));
    }
    base = (_lgamma(a0) + _lgamma(b0)) - _lgamma(a0 + b0);
  }
  return Math.log(prod) + base;
}

// ln G(a, b) = −ln B(a, b): mín ≥ 1 → −BETALN; mín < 1 → 3a.6 con G formado primero (B19, C36).
function lnG(a, b) {
  const s = Math.min(a, b);
  const l = Math.max(a, b);
  if (s >= 1) return -betaln(a, b);
  const razon = l < 8 ? _gamma(s + l) / _gamma(l) : Math.exp(-algdiv(s, l)); // Γ(s + l)/Γ(l)
  const G = (s * (1 + _gamma1pm1(s))) * razon; // G = [s(1 + H(s))]·Γ(s + l)/Γ(l)
  return Math.log(G);
}

// D6b.4 "Combinación con el factor f > 0".
function combina(h, l, f) {
  if (!(f > 0)) throw new Error("pbeta: factor f <= 0 en D6b.4 (defecto, no un 0)");
  if (h > -969 * Math.LN2) return exp_dd(h, l) * f;
  const [h2, l2] = dd_add([h, l], [Math.log(f), 0]);
  return exp_dd(h2, l2);
}

// D6b.3: λ = a − (a + b)x en doble-doble (con x exacto) o (a + b)y − b (con y exacto).
function lamDD(a, b, par) {
  const [sh, sl] = two_sum(a, b);
  if (par.xe) {
    const [ph, pe] = dd_mul([sh, sl], par.x);
    return dd_add([a, 0], [-ph, -pe]);
  }
  const [ph, pe] = dd_mul([sh, sl], par.y);
  return dd_add([ph, pe], [-b, 0]);
}

// D6b.5 paso 4: c·φ(1 + δ) en doble-doble, con δ = (dh, dl) y ln w en doble-doble.
function cphi(c, d, lnw) {
  const w1 = 1 + d[0];
  if (w1 >= 0.25 && w1 <= 4) {
    let [sh, sl] = two_sum(2, d[0]);
    sl = sl + d[1];
    const rh = d[0] / sh;
    const [p, e] = two_prod(rh, sh);
    const rl = ((d[0] - p) - e + d[1] - rh * sl) / sh; // r = δ/(2 + δ) = rh + rl
    // D6.2 pasos 5 a 12, con 2c en lugar de 2a
    const [qh, ql0] = two_prod(rh, rh); // paso 5
    const ql = ql0 + 2 * rh * rl;
    const [uh, ul0] = two_sum(1, -rh); // paso 6
    const ul = ul0 - rl;
    const ih = 1 / uh; // paso 7
    const [p2, e2] = two_prod(ih, uh);
    const il = ((1 - p2) - e2 - ih * ul) / uh;
    const f1 = (w1 >= 0.82 && w1 <= 1.18) ? phi1_apE(rh) : phi1_serie(rh); // paso 8
    const [bh, bl0] = two_sum(ih, -rh * f1); // paso 9
    const bl = bl0 + il - rl * f1;
    const [ph, pe0] = two_prod(qh, bh); // paso 10
    const pe = pe0 + qh * bl + ql * bh;
    const [yh0, ye0] = two_prod(2 * c, ph); // paso 11
    const ye = ye0 + 2 * c * pe;
    return two_sum(yh0, ye); // paso 12
  }
  // lectura C con ln w en doble-doble
  const [s, e0] = two_sum(d[0], -lnw[0]);
  const e = e0 + d[1] - lnw[1];
  const [yh, ye0] = two_prod(c, s);
  return two_sum(yh, ye0 + c * e);
}

// D6b.5 pasos 1 a 5: z² = aφ(x/p) + bφ(y/q) en doble-doble (con λ en doble-doble).
function z2DD(a, b, par, lam) {
  const da = dd_div(neg(lam), a); // paso 2
  const db = dd_div(lam, b);
  const [sh, sl] = two_sum(a, b); // paso 3
  const lnab = dd_add(ln_dd(sh), [sl / sh, 0]);
  const lnp = dd_add(ln_dd(a), neg(lnab));
  const lnq = dd_add(ln_dd(b), neg(lnab));
  const lnwa = dd_add(lnX(par), neg(lnp));
  const lnwb = dd_add(lnY(par), neg(lnq));
  const ta = cphi(a, da, lnwa); // paso 4
  const tb = cphi(b, db, lnwb);
  return dd_add(ta, tb); // paso 5
}

// BRCOMP(a, b, x, y)·f. mín(a, b) < 8: D6b.4 (logaritmo del prefactor en doble-doble y combinación con f).
// mín(a, b) ≥ 8: D6b.5 (pasos 1 a 6).
function brcompPor(a, b, par, f) {
  if (Math.min(a, b) < 8) {
    let hl = dd_add(dd_mul(lnX(par), a), dd_mul(lnY(par), b));
    hl = dd_add(hl, [lnG(a, b), 0]);
    return combina(hl[0], hl[1], f);
  }
  const lam = lamDD(a, b, par); // paso 1
  const [zh, zl] = z2DD(a, b, par, lam);
  const [th, tl] = two_sum(zh, bcorr(a, b)); // paso 6
  const brcomp = Math.sqrt((a * b) / (2 * Math.PI * (a + b))) * (Math.exp(-th) * (1 - (tl + zl)));
  return brcomp * f;
}

// ---------------------------------------------------------------------------------------------------------------
// BPSER (7). Prefactor G·xᵃ/a en logaritmos (D6b.4); factor = el corchete 1 + aΣ. Corte C31.
function bpser(a, b, par) {
  let cx = 1; // cⱼxʲ con cⱼ = (1 − b)(2 − b)⋯(j − b)/j!
  let suma = 0;
  let corchete = 1;
  for (let j = 1; j <= 500; j++) {
    cx = (cx * par.x) * ((j - b) / j);
    const t = cx / (a + j);
    suma += t;
    corchete = 1 + a * suma;
    if (Math.abs(a * t) <= EPS * Math.abs(corchete)) break;
  }
  const hl = dd_add(dd_mul(lnX(par), a), [lnG(a, b) - Math.log(a), 0]);
  return combina(hl[0], hl[1], corchete);
}

// BUP (8): I_x(a, b) − I_x(a + n, b) = [xᵃyᵇ/B(a, b)]·(Σ/a), Σ = Σ_{i=0}^{n−1} dᵢxⁱ. Corte del folio 362 con C32.
function bup(a, b, par, n) {
  const x = par.x;
  const k = b > 1 ? Math.floor(((b - 1) * x) / par.y - a) : -Infinity;
  let h = 1;
  let suma = 1;
  for (let m = 0; m <= n - 1; m++) {
    if (m > 0) {
      h = (h * ((a + b + (m - 1)) / (a + 1 + (m - 1)))) * x; // h_{i+1} = h_i·x·(a + b + i)/(a + 1 + i)
      suma += h;
    }
    if (m === n - 1) break;
    if (m > k && h <= EPS * suma) break;
  }
  return brcompPor(a, b, par, suma / a);
}

// BGRAT (9), con a > b, M y J₀ de D6b.6, paso 0 de BGRAT. Devuelve w = w₀ + I_x(a, b).
function bgrat(a, b, par, w0) {
  // D6b.6 paso 1: u = −T ln x, T = a + (b − 1)/2
  const [Th, Tl] = two_sum(a, (b - 1) / 2);
  const [lh, ll] = lnX(par);
  let [uh, ul] = two_prod(Th, -lh);
  ul = ul - (Th * ll + Tl * lh);
  [uh, ul] = two_sum(uh, ul);
  // paso 2: ln M = −u + b ln(−ln x) − lnΓ(b) − ALGDIV(b, a), en doble-doble y en este orden
  let hl = dd_add([-uh, -ul], two_prod(b, Math.log(-lh)));
  hl = dd_add(hl, [-_lgamma(b), 0]);
  hl = dd_add(hl, [-algdiv(b, a), 0]);
  // paso 3 (paso 0 de BGRAT, correcciones del 22/10): si ln M < ln 2⁻¹⁰⁷⁴, w = w₀   // AMBIGÜEDAD #16 (a) (firmada, paquete 9, 9.4)
  if (hl[0] + hl[1] < LN_MIN) return w0;
  const M = exp_dd(hl[0], hl[1]); // paso 4
  // paso 5: J₀ = Q(b, u)/H(b, u), u = uh
  let J0;
  if (uh >= 1.1) {
    J0 = _cf11(b, uh); // fracción (11) de DM86 con (13) y C3: Q/R exacto
  } else {
    const [v, esP] = _gratio(b, uh); // árbol de pgamma (Fig. 2 con D6)
    const Q = esP ? 1 - v : v; // 5.3 (B25)
    J0 = Q / _Rpequeno(b, uh); // H(b, u) = R(b, u) de DM86 (3)
  }
  // paso 6: serie (9) con la recurrencia (9.6); 4T² y (ln x/2)²ⁿ con Th y lh, u = uh (B23); 15ε, tope 30
  const cuatroT2 = 4 * Th * Th;
  const l2 = (lh / 2) * (lh / 2);
  const p = [1]; // p_n de (9.3)
  const invFact = []; // 1/(2k + 1)!
  let f = 1;
  for (let k = 0; k <= 30; k++) {
    if (k > 0) f = f * ((2 * k) * (2 * k + 1));
    invFact.push(1 / f);
  }
  let J = J0;
  let pot = 1; // (ln x/2)^(2n)
  let suma = J0; // p₀J₀
  for (let n = 1; n <= 30; n++) {
    J = (((b + 2 * (n - 1)) * (b + 2 * (n - 1) + 1)) / cuatroT2) * J + ((uh + b + 2 * (n - 1) + 1) / cuatroT2) * pot; // J_n a partir de J_{n−1}
    pot = pot * l2;
    let pn = (b - 1) * invFact[n]; // (9.3)
    let s = 0;
    for (let m = 1; m <= n - 1; m++) s += ((m * b - n) * invFact[m]) * p[n - m];
    pn = pn + s / n;
    p.push(pn);
    const termino = pn * J;
    suma += termino;
    if (Math.abs(termino) <= 15 * EPS * Math.abs(suma)) break; // AMBIGÜEDAD #16 (c): el corte se evalúa desde n = 1 (firmada, paquete 9, 9.4)
  }
  return w0 + M * suma;
}

// BFRAC (10), con (10.1)-(10.3), (10.9), B26 (cambio relativo en cada paso), C29, tope 1000; 15ε.
function bfrac(a, b, par) {
  const x = par.x;
  const y = par.y;
  const lamdd = lamDD(a, b, par);
  const lam = lamdd[0] + lamdd[1]; // en α y β basta λh + λl en double
  let Am = 0;
  let Bm = 1;
  let A = 1; // α₁
  let B = (a / (a + 1)) * (lam + 1); // β₁
  let r = A / B;
  for (let n = 1; n <= 1000; n++) {
    const d = a + 2 * n - 1;
    const alfa = (((a + n - 1) * (a + b + n - 1)) / (d * d)) * (n * (b - n)) * (x * x); // (10.2): α_{n+1}
    const beta = n + (n * (b - n) * x) / d + ((a + n) / (a + 2 * n + 1)) * (lam + 1 + n * (1 + y)); // (10.3): β_{n+1}
    const An = beta * A + alfa * Am;
    const Bn = beta * B + alfa * Bm;
    Am = A;
    Bm = B;
    A = An;
    B = Bn;
    if (Math.abs(B) > ESCALA) { // C29
      A *= ESCALA_INV;
      B *= ESCALA_INV;
      Am *= ESCALA_INV;
      Bm *= ESCALA_INV;
    }
    const rn = A / B;
    const cambio = Math.abs(rn - r) <= 15 * EPS * Math.abs(rn);
    r = rn;
    if (cambio) break;
  }
  return brcompPor(a, b, par, r);
}

// BASYM (11), con z² por D6b.7, aₙ (11.4)/(11.5), bₙ^(r), cₙ (C33), eₙ (11.7), Lₙ (11.21); 100ε, dos términos seguidos, tope 20.
function basym(a, b, par) {
  const N = 20;
  const p = a / (a + b);
  const q = b / (a + b);
  const lam = lamDD(a, b, par);
  const [zh, zl] = z2DD(a, b, par, lam); // D6b.7: z² = (zh, zl)
  const z = Math.sqrt(zh);
  const [th, tl] = two_sum(zh, bcorr(a, b)); // ln U = −BCORR (11.20)
  const prefactor = (2 / Math.sqrt(Math.PI)) * (Math.exp(-th) * (1 - (tl + zl)));
  // aₙ, n = 0 … N − 1
  const an = [];
  for (let n = 0; n < N; n++) {
    const sg = n % 2 === 0 ? 1 : -1;
    if (a <= b) an.push((2 / (n + 2)) * q * (1 + sg * Math.pow(a / b, n + 1))); // (11.4)
    else an.push((2 / (n + 2)) * p * (sg + Math.pow(b / a, n + 1))); // (11.5)
  }
  // cₙ = (1/n)·b_{n−1}^(−n/2), n = 1 … N (C33)
  const c = [0];
  for (let n = 1; n <= N; n++) {
    const r = -n / 2;
    const bs = [1]; // b₀
    if (n - 1 >= 1) bs.push(r * an[1]); // b₁ = r a₁
    for (let j = 2; j <= n - 1; j++) {
      let s = 0;
      for (let i = 1; i <= j - 1; i++) s += (((j - i) * r - i) * bs[i]) * an[j - i];
      bs.push(r * an[j] + s / j);
    }
    c.push(bs[n - 1] / n);
  }
  // eₙ (11.7), n = 0 … N − 1
  const e = [1];
  for (let n = 1; n < N; n++) {
    let s = 0;
    for (let i = 0; i <= n - 1; i++) s += e[i] * c[n - i + 1];
    e.push(-s);
  }
  // Lₙ(z) (11.21)
  const Sz = z > 0.46875 ? _erfcScaled(z) : Math.exp(z * z) * _erfc(z);
  const dosR32 = Math.pow(2, -1.5);
  const L = [(Math.sqrt(Math.PI) / 4) * Sz, dosR32];
  const bg = a <= b ? Math.sqrt(q / a) : Math.sqrt(p / b); // (11.3)
  let suma = L[0];
  let pot = 1; // (βγ)ⁿ
  let potz = 1; // (√2 z)^(n−1)
  let bajo = 0;
  for (let n = 1; n < N; n++) {
    if (n >= 2) {
      potz = potz * (Math.SQRT2 * z);
      L.push(dosR32 * potz + (n - 1) * L[n - 2]);
    }
    pot = pot * bg;
    const termino = e[n] * L[n] * pot;
    suma += termino;
    if (Math.abs(termino) <= 100 * EPS * Math.abs(suma)) { // AMBIGÜEDAD #16 (b): el término n = 0 no cuenta; el contador se reinicia (firmada, paquete 9, 9.4)
      bajo += 1;
      if (bajo >= 2) break;
    } else {
      bajo = 0;
    }
  }
  return prefactor * suma;
}

// ---------------------------------------------------------------------------------------------------------------
// Árbol de §3. Devuelve [J, JesInferior] (C37).
function arbol(x, a, b) {
  let par = { x, y: 1 - x, xe: true, ye: x >= 0.5 }; // D6b.1
  let inf = true;
  const mn = Math.min(a, b);
  const mx = Math.max(a, b);
  if (mn <= 1) {
    if (par.x > 0.5) { // si x > 1/2 se intercambian a↔b y x↔y
      [a, b] = [b, a];
      par = inv(par);
      inf = !inf;
    }
    const xx = par.x;
    let hoja;
    if (mx <= 1) {
      if (a >= Math.min(0.2, b)) hoja = 12;
      else if (Math.pow(xx, a) <= 0.9) hoja = 12;
      else if (xx >= 0.3) hoja = 13;
      else hoja = 15;
    } else if (b <= 1) {
      hoja = 12;
    } else if (xx < 0.1) {
      if (Math.pow(b * xx, a) <= 0.7) hoja = 12;
      else hoja = b > 15 ? 14 : 15;
    } else if (xx < 0.3) {
      hoja = b > 15 ? 14 : 15;
    } else {
      hoja = 13;
    }
    switch (hoja) {
      case 12: return [bpser(a, b, par), inf]; // (12) BPSER(a, b, x)
      case 13: return [bpser(b, a, inv(par)), !inf]; // (13) BPSER(b, a, y)
      case 14: return [bgrat(b, a, inv(par), 0), !inf]; // (14) BGRAT(b, a, y, x, w₀ = 0)
      default: { // (15) BGRAT(b + n, a, y, x, w), w₀ = BUP(b, a, y, x, n), n = 20
        const w0 = bup(b, a, inv(par), 20);
        return [bgrat(b + 20, a, inv(par), w0), !inf];
      }
    }
  }
  // mín(a, b) > 1: B29, p = a/(a + b) y q = b/(a + b) en double; «x > p» se compara en double
  let p = a / (a + b);
  if (par.x > p) {
    [a, b] = [b, a];
    par = inv(par);
    inf = !inf;
    p = a / (a + b);
  }
  const q = b / (a + b);
  const xx = par.x;
  const yy = par.y;
  if (b < 40) {
    const n = Math.ceil(b) - 1; // mayor entero menor que b
    const bb = b - n;
    if (b * xx <= 0.7) return [bpser(a, b, par), inf]; // (16)
    if (xx <= 0.7) return [bpser(a, bb, par) + bup(bb, a, inv(par), n), inf]; // (17)
    if (a > 15) return [bgrat(a, bb, par, bup(bb, a, inv(par), n)), inf]; // (18)
    const w0 = bup(bb, a, inv(par), n) + bup(a, bb, par, 20); // (19), m = 20
    return [bgrat(a + 20, bb, par, w0), inf];
  }
  const bfracoSi = a <= b ? (a <= 100 || xx < 0.97 * p) : (b <= 100 || yy > 1.03 * q);
  if (bfracoSi) return [bfrac(a, b, par), inf]; // (20)
  return [basym(a, b, par), inf]; // (21)
}

// Núcleo: x ∈ [0, 1], a > 0, b > 0 (sin validar, sin lanzar).
export function _pbeta(x, a, b, lowerTail) {
  if (x === 0) return lowerTail ? 0 : 1; // C38
  if (x === 1) return lowerTail ? 1 : 0;
  const [J, inf] = arbol(x, a, b);
  return inf === lowerTail ? J : 1 - J; // C37
}

export function pbeta(x, a, b, lowerTail) {
  validar("pbeta", "x", x);
  validar("pbeta", "a", a);
  validar("pbeta", "b", b);
  const lt = validarLowerTail("pbeta", lowerTail);
  return _pbeta(x, a, b, lt);
}
