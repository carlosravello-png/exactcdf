// pgamma(x, a, lowerTail) — DiDonato y Morris (1986), IND = 0 (BIG = 20, x0 = 31, e0 = 0.25E-3), con las técnicas
// en doble precisión de D6.1-D6.3, 3a.4, el paquete 4 (4.2, C16-C26), 5.4 (B8) y 5.5.
// Árbol de la Fig. 2 (expediente l. 1023-1038). Cada hoja calcula P o Q; la otra cola es 1 − v (C5).
import { StatsError, validar, validarLowerTail } from "./error.js";
import { two_sum, two_prod, phi1_apE, phi1_serie } from "./primitivas.js";
import { _erf } from "./erf.js";
import { _erfc, _erfcScaled } from "./erfc.js";
import { _gamma } from "./gamma.js";
import { _gamma1pm1 } from "./gamma1pm1.js";
import { _delta24 } from "./lgamma.js";
import { GAMMA_A_LOW } from "./constantes.js";

const BIG = 20; // parámetros (7), IND = 0 (folio 379)
const X0 = 31;
const E0 = 0.25E-3;
const EPS = 2 ** -53; // 3a.4: corte de las series y ε de (20)
const ESCALA = 2 ** 600; // C3
const ESCALA_INV = 2 ** -600;

// Coeficientes de Temme D_k(n) recalculados (expediente, bloque temme_Dkn, l. 1062-1126), k = 0…7.
const D = [
  [
    -3.333333333333333333333333e-1, 8.333333333333333333333333e-2, -1.481481481481481481481481e-2,
    1.157407407407407407407407e-3, 3.527336860670194003527337e-4, -1.787551440329218106995885e-4,
    3.919263178522437781697041e-5, -2.185448510679992161473643e-6, -1.854062210715159960701799e-6,
    8.296711340953086005016242e-7, -1.766595273682607930436005e-7, 6.707853543401498580369397e-9,
    1.026180978424030804257396e-8, -4.382036018453353186552975e-9,
  ],
  [
    -1.851851851851851851851852e-3, -3.472222222222222222222222e-3, 2.645502645502645502645503e-3,
    -9.90226337448559670781893e-4, 2.057613168724279835390947e-4, -4.018775720164609053497942e-7,
    -1.809855033448997783702859e-5, 7.649160916081110084637421e-6, -1.612090089456344600377522e-6,
    4.64712780280743434226135e-9, 1.378633446915720959311875e-7, -5.752545603517704964021945e-8,
    1.195162859977814732430765e-8,
  ],
  [
    4.133597883597883597883598e-3, -2.681327160493827160493827e-3, 7.716049382716049382716049e-4,
    2.009387860082304526748971e-6, -1.073665322636516052153912e-4, 5.292344882912012541642171e-5,
    -1.276063518861872771337792e-5, 3.4235787340961380741902e-8, 1.372195730906293320559439e-6,
    -6.298992138380055022906722e-7, 1.42806142060642417915846e-7,
  ],
  [
    6.494341563786008230452675e-4, 2.294720936213991769547325e-4, -4.691894943952557121281401e-4,
    2.677206320628388529623098e-4, -7.561801671883976410725382e-5, -2.39650511386729665193314e-7,
    1.108265411534730236147703e-5, -5.674952826991596567499631e-6, 1.423090073243588391455189e-6,
  ],
  [
    -8.618882909167116986047027e-4, 7.840392217200666274740349e-4, -2.990724803031901797333896e-4,
    -1.463845257884341817812325e-6, 6.641498215465122186658538e-5, -3.968365047179434664431235e-5,
    1.13757269706784190980552e-5,
  ],
  [
    -3.367985533663581503087676e-4, -6.972813758365857774293988e-5, 2.772753244959392078733643e-4,
    -1.993257051618884770033604e-4, 6.797780477937207838816402e-5,
  ],
  [5.313079364639922231657485e-4, -5.921664373536938828648362e-4, 2.708782096718044827712792e-4],
  [3.443676068923776712542796e-4],
];
// Fig. 1 (folio 382), IND = 0: N = 7; L(k) según σ.
const L_ANCHO = [13, 12, 10, 8, 6, 4, 2, 0]; // 0.001 < σ ≤ 0.4
const L_ESTRECHO = [7, 6, 5, 4, 2, 2, 1, 0]; // σ ≤ 0.001

// (18): T(a, λ) = Σ_{k=0}^{7} c_k(z) a^(−k), c_k(z) = Σ_{n=0}^{L(k)} D_k(n) zⁿ. C1 (Horner en z) y C18 (Horner en 1/a, k = 7 … 0).
function temmeT(a, z, sigma) {
  const L = sigma <= 0.001 ? L_ESTRECHO : L_ANCHO;
  const u = 1 / a;
  let T = 0;
  for (let k = 7; k >= 0; k--) {
    const Dk = D[k];
    let c = Dk[L[k]];
    for (let n = L[k] - 1; n >= 0; n--) c = c * z + Dk[n];
    T = T * u + c;
  }
  return T;
}

// D6.2: y = aφ(x/a) en doble-doble, a ≥ 20, x > 0 (la guarda de rango y 5.5 se aplican antes).
function yDD(a, x) {
  if (x === a) return [0, 0]; // y = 0 exacto, no se ejecuta la secuencia
  if (x >= 0.25 * a && x <= 4 * a) {
    // D6.2, secuencia de 12 pasos, .25a ≤ x ≤ 4a
    const [dh, dl] = two_sum(x, -a); // paso 1: x − a
    const [sh, sl] = two_sum(x, a); // paso 2: x + a
    const rh = dh / sh; // paso 3
    let [p, e] = two_prod(rh, sh); // paso 4
    const rl = ((dh - p) - e + dl - rh * sl) / sh; // r = (x − a)/(x + a) = rh + rl
    const [qh, ql0] = two_prod(rh, rh); // paso 5
    const ql = ql0 + 2 * rh * rl; // r²
    const [uh, ul0] = two_sum(1, -rh); // paso 6
    const ul = ul0 - rl; // 1 − r
    const ih = 1 / uh; // paso 7
    [p, e] = two_prod(ih, uh);
    const il = ((1 - p) - e - ih * ul) / uh; // 1/(1 − r)
    // paso 8: φ₁(rh) por el Ap. E si .82a ≤ x ≤ 1.18a; si no, por la serie de C7
    const f1 = (x >= 0.82 * a && x <= 1.18 * a) ? phi1_apE(rh) : phi1_serie(rh);
    const [bh, bl0] = two_sum(ih, -rh * f1); // paso 9
    const bl = bl0 + il - rl * f1; // B = 1/(1 − r) − rφ₁
    const [ph, pe0] = two_prod(qh, bh); // paso 10
    const pe = pe0 + qh * bl + ql * bh; // r²B
    const [yh0, ye0] = two_prod(2 * a, ph); // paso 11
    const ye = ye0 + 2 * a * pe;
    return two_sum(yh0, ye); // paso 12
  }
  // 4.2, lectura C, secuencia de 8 pasos (fuera de .25a ≤ x ≤ 4a)
  const lam = x / a; // paso 1
  const [p, e] = two_prod(lam, a); // paso 2
  const d = (x - p) - e; // λ verdadero = λ + d/a
  const [s1, e1] = two_sum(lam, -1); // paso 3
  const L = Math.log(lam); // paso 4
  const [s2, e2a] = two_sum(s1, -L); // paso 5
  const e2 = e2a + e1;
  const [yh0, ye0] = two_prod(a, s2); // paso 6
  const ye = ye0 + a * e2 + (1 - 1 / lam) * d;
  return two_sum(yh0, ye); // paso 7
}

// (4) con D6.2 / 4.2 paso 8: R(a, x) = √(a/(2π))·(e^(−th)·(1 − (tl + yl))), a ≥ 20.
function R_grande(a, x) {
  const [yh, yl] = yDD(a, x);
  const [th, tl] = two_sum(yh, _delta24(a));
  return Math.sqrt(a / (2 * Math.PI)) * (Math.exp(-th) * (1 - (tl + yl)));
}

// R(a, x) = e^(−x)·xᵃ/Γ(a), a < 20: C23 (e^(−x)·xᵃ)/Γ(a); D6.1 con x > 700 (C17).
export function _Rpequeno(a, x) {
  if (x > 700) {
    const m = Math.exp(-x / 2);
    if (m === 0) return 0; // D6.1: si x/2 también se hunde, R es menor que el menor double
    return ((Math.pow(x, a) / _gamma(a)) * m) * m; // D6.1: ((xᵃ/Γ(a))·e^(−x/2))·e^(−x/2)
  }
  return (Math.exp(-x) * Math.pow(x, a)) / _gamma(a);
}

function Rfun(a, x) {
  return a < BIG ? _Rpequeno(a, x) : R_grande(a, x);
}

// (11), recurrencias (13): Q/R = lim Aₙ/Bₙ. C21: convergencia en los convergentes pares; 3a.4: |Δ| ≤ 2⁻⁵³|valor|, tope 20000 pasos; C3: reescalado.
export function _cf11(a, x) {
  let Am2 = 0; // A₀
  let Bm2 = 1; // B₀
  let Am1 = 1; // A₁
  let Bm1 = x; // B₁
  let prev = 0;
  for (let n = 1; n <= 10000; n++) {
    const A2n = Am1 + (n - a) * Am2; // A₂ₙ = A₂ₙ₋₁ + (n − a)A₂ₙ₋₂
    const B2n = Bm1 + (n - a) * Bm2;
    const val = A2n / B2n;
    if (Math.abs(val - prev) <= EPS * Math.abs(val)) return val;
    prev = val;
    const A2n1 = x * A2n + n * Am1; // A₂ₙ₊₁ = xA₂ₙ + nA₂ₙ₋₁
    const B2n1 = x * B2n + n * Bm1;
    Am2 = A2n;
    Bm2 = B2n;
    Am1 = A2n1;
    Bm1 = B2n1;
    if (Math.abs(Bm1) > ESCALA) { // C3
      Am2 *= ESCALA_INV;
      Bm2 *= ESCALA_INV;
      Am1 *= ESCALA_INV;
      Bm1 *= ESCALA_INV;
    }
  }
  return prev;
}

// (9)/(10): J = −a Σ_{n≥1} (−x)ⁿ/((a + n)n!). C22: corte relativo a la suma, 3a.4: primer término con |término| ≤ 2⁻⁵³|suma|, tope 10000.
function serieJ(a, x) {
  let c = 1;
  let suma = 0;
  for (let n = 1; n <= 10000; n++) {
    c = (c * -x) / n;
    const t = c / (a + n);
    suma += t;
    if (Math.abs(t) <= EPS * Math.abs(suma)) break;
  }
  return -a * suma;
}

// Hojas: cada una devuelve [valor, esP] (esP = el valor es P; si no, es Q).

// (8) a = 1/2: P = erf √x si x < 1/4; Q = erfc √x si x ≥ 1/4 (D6.3: Q = e^(−x)·S(√x), √x > 0.46875).
function hoja8(x) {
  if (x < 0.25) return [_erf(Math.sqrt(x)), true];
  return [Math.exp(-x) * _erfcScaled(Math.sqrt(x)), false];
}

// (9) P(a, x) = xᵃ(1 − J)/Γ(a + 1), con 1/Γ(a + 1) = 1 + H(a) (5.4, B8)
function hoja9(a, x) {
  const H = _gamma1pm1(a);
  const J = serieJ(a, x);
  return [(Math.pow(x, a) * (1 - J)) * (1 + H), true];
}

// (10) Q(a, x) = [xᵃJ − L(a ln x)]/Γ(a + 1) − H(a), L = expm1 (3a.7), 1/Γ(a + 1) = 1 + H(a) (B8)
function hoja10(a, x) {
  const H = _gamma1pm1(a);
  const J = serieJ(a, x);
  return [((Math.pow(x, a) * J - Math.expm1(a * Math.log(x))) * (1 + H)) - H, false];
}

// (11) Q = R(a, x)·[fracción continua]
function hoja11(a, x) {
  if (a <= GAMMA_A_LOW) {
    // paquete 10, 10.1 (con 10.0): con a ≤ a_low, Γ(a) desborda y R = e⁻ˣxᵃ/Γ(a) no se puede formar; 1/Γ(a) = a(1 + H(a)) (5.4, B8)
    // Q = ((e⁻ˣxᵃ(1 + H(a)))·[fracción (11)])·a, con el factor a al final (un solo redondeo en la zona subnormal)
    const previo = (Math.exp(-x) * Math.pow(x, a)) * (1 + _gamma1pm1(a)); // AMBIGÜEDAD #17: e⁻ˣ directo, sin el desdoblamiento de D6.1 (lectura literal de 10.1)
    if (previo === 0) return [0, false]; // 10.1: x > 745, Q < a·e⁻⁷⁴⁵ < 2⁻¹⁰⁷⁵
    return [(previo * _cf11(a, x)) * a, false];
  }
  const R = Rfun(a, x);
  if (R === 0) return [0, false]; // AMBIGÜEDAD #14: Q = R·CF con R = 0 es 0 (evita ∞/∞ en la fracción con x enorme) (firmada, paquete 9, 9.2)
  return [R * _cf11(a, x), false];
}

// (14) a entero o a = i + 1/2 (2a entero), a ≤ x < x0. C19: erfc(√x) sin escalar.
function hoja14(a, x) {
  if (a === Math.floor(a)) {
    let suma = 1;
    let t = 1;
    for (let n = 1; n <= a - 1; n++) {
      t = (t * x) / n;
      suma += t;
    }
    return [Math.exp(-x) * suma, false];
  }
  const i = a - 0.5;
  let suma = 0;
  let t = 1;
  for (let n = 1; n <= i; n++) {
    t = (t * x) / (n - 0.5);
    suma += t;
  }
  return [_erfc(Math.sqrt(x)) + (Math.exp(-x) / Math.sqrt(Math.PI * x)) * suma, false];
}

// (15) P = (R(a, x)/a)·[1 + Σ_{n≥1} xⁿ/((a + 1)⋯(a + n))]. C22: corte relativo al corchete.
function hoja15(a, x) {
  const R = Rfun(a, x);
  let suma = 1;
  let t = 1;
  for (let n = 1; n <= 10000; n++) {
    t = (t * x) / (a + n);
    suma += t;
    if (t <= EPS * suma) break;
  }
  return [(R / a) * suma, true];
}

// (16) Q = (R(a, x)/x)·[1 + Σ aₙ/xⁿ]: C20, se suma el término mínimo y se corta antes del primer término que crece; tope 200.
function hoja16(a, x) {
  const R = Rfun(a, x);
  let suma = 1;
  let t = 1;
  for (let n = 1; n <= 200; n++) {
    const t2 = (t * (a - n)) / x;
    if (Math.abs(t2) > Math.abs(t)) break;
    t = t2;
    suma += t;
    if (Math.abs(t) <= EPS * Math.abs(suma)) break;
  }
  return [(R / x) * suma, false];
}

// (17), a ≥ 20, E0/√a < σ ≤ 0.4. D6.2 "Dónde entran yh e yl".
function hoja17(a, x, sigma) {
  const [yh, yl] = yDD(a, x);
  const z = (x < a ? -1 : 1) * Math.sqrt((2 * yh) / a);
  const T = temmeT(a, z, sigma);
  const v = Math.sqrt(yh);
  const ey = Math.exp(-yh) * (1 - yl);
  const c = T / Math.sqrt(2 * Math.PI * a);
  const S = v > 0.46875 ? 0.5 * _erfcScaled(v) : 0.5 * Math.exp(yh) * _erfc(v);
  if (x <= a) return [ey * (S - c), true];
  return [ey * (S + c), false];
}

// (19), a ≥ 20, σ ≤ E0/√a (y ≈ 0): E(y) = ½ − (1 − y/3)√(y/π); y = yh + yl.
function hoja19(a, x, sigma) {
  const [yh, yl] = x === a ? [0, 0] : yDD(a, x);
  const y = yh + yl;
  const z = (x < a ? -1 : 1) * Math.sqrt((2 * y) / a);
  const T = temmeT(a, z, sigma);
  const Ey = 0.5 - (1 - y / 3) * Math.sqrt(y / Math.PI);
  const w = ((1 - y) / Math.sqrt(2 * Math.PI * a)) * T;
  if (x <= a) return [Ey - w, true];
  return [Ey + w, false];
}

// (20): σ ≤ 2ε y aε² > 3.28E-3 (ε = 2⁻⁵³, 3a.4 y 6.5). La función pública lanza `indeterminado`.
export function _pgammaIndet(x, a) {
  if (a < BIG) return false;
  const sigma = Math.abs(1 - x / a);
  return sigma <= 2 * EPS && a * EPS * EPS > 3.28e-3;
}

// Árbol de la Fig. 2 (x > 0). Devuelve [valor, esP].
export function _gratio(a, x) {
  if (a < 1) {
    if (a === 0.5) return hoja8(x);
    if (x < 1.1) {
      const alfa = x < 0.5 ? (0.5 * Math.log(0.765)) / Math.log(x) : x / 2.59; // (12), C16
      return a >= alfa ? hoja9(a, x) : hoja10(a, x);
    }
    return hoja11(a, x);
  }
  if (a < BIG) {
    if (x >= a && x < X0 && 2 * a === Math.floor(2 * a)) return hoja14(a, x); // C25
    if (x <= Math.max(a, Math.log(10))) return hoja15(a, x);
    if (x < X0) return hoja11(a, x);
    return hoja16(a, x);
  }
  // a ≥ BIG (C24: primero 5.5 y la guarda de D6.2; (20) la comprueba la función pública antes de llamar al núcleo)
  const lam = x / a;
  if (lam < 2 ** -1022) return [0, true]; // 5.5: P = 0 y Q = 1
  if (x + a >= 2 ** 995) return lam < 1 ? [0, true] : [0, false]; // guarda de rango de D6.2: la cola chica es 0 y la otra es 1
  const sigma = Math.abs(1 - lam);
  if (sigma <= E0 / Math.sqrt(a)) return hoja19(a, x, sigma);
  if (sigma <= 0.4) return hoja17(a, x, sigma);
  if (lam < 0.6) return hoja15(a, x);
  if (x < X0) return hoja11(a, x);
  return hoja16(a, x);
}

// Núcleo: x ≥ 0, a > 0 (sin validar, sin lanzar). C6: x = 0 da P = 0 y Q = 1 sin entrar al árbol.
export function _pgamma(x, a, lowerTail) {
  if (x === 0) return lowerTail ? 0 : 1;
  const [v, esP] = _gratio(a, x);
  return esP === lowerTail ? v : 1 - v; // C5
}

export function pgamma(x, a, lowerTail) {
  validar("pgamma", "x", x);
  validar("pgamma", "a", a);
  const lt = validarLowerTail("pgamma", lowerTail);
  if (_pgammaIndet(x, a)) {
    throw new StatsError({ funcion: "pgamma", motivo: "indeterminado", argumento: "a", valor: a, region: "pgamma_indet" });
  }
  return _pgamma(x, a, lt);
}
