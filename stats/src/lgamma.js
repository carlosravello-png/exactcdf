// lgamma(a) = ln Γ(a), a > 0 (D4 v2).
// Regiones: lgamma_d (0.8 ≤ a ≤ 2.25, DM86 Ap. D con 3a.2), lgamma_red (a < 0.8 y 2.25 < a < 15, 3a.1 y C15),
// lgamma_delta (a ≥ 15, DM92 (24) con C12-C14).
import { validar } from "./error.js";

// DM86 Apéndice D (bloque dm86_apD, folios 389-390): lnΓ(1 + x)/x = −(p₀ + … + p₆x⁶)/(q₀ + … + q₆x⁶), −0.2 ≤ x ≤ 0.6
const D_P0 = .577215664901533E+00;
const D_P1 = .844203922187225E+00;
const D_P2 = -.168860593646662E+00;
const D_P3 = -.780427615533591E+00;
const D_P4 = -.402055799310489E+00;
const D_P5 = -.673562214325671E-01;
const D_P6 = -.271935708322958E-02;
const D_Q0 = .100000000000000E+01;
const D_Q1 = .288743195473681E+01;
const D_Q2 = .312755088914843E+01;
const D_Q3 = .156875193295039E+01;
const D_Q4 = .361951990101499E+00;
const D_Q5 = .325038868253937E-01;
const D_Q6 = .667465618796164E-03;
// lnΓ(2 + x)/x = (r₀ + … + r₅x⁵)/(s₀ + … + s₅x⁵), −0.4 ≤ x ≤ 0.25
const D_R0 = .422784335098467E+00;
const D_R1 = .848044614534529E+00;
const D_R2 = .565221050691933E+00;
const D_R3 = .156513060486551E+00;
const D_R4 = .170502484022650E-01;
const D_R5 = .497958207639485E-03;
const D_S0 = .100000000000000E+01;
const D_S1 = .124313399877507E+01;
const D_S2 = .548042109832463E+00;
const D_S3 = .101552187439830E+00;
const D_S4 = .713309612391000E-02;
const D_S5 = .116165475989616E-03;

// DM92 (24), bloque dm92_24 (folio 370): Δ(a) = Σₙ₌₀⁴ cₙ/a²ⁿ⁺¹, a ≥ 15
const C0 = .833333333333333E-01;
const C1 = -.277777777770481E-02;
const C2 = .793650663183693E-03;
const C3 = -.595156336428591E-03;
const C4 = .820756370353826E-03;

// Apéndice D para 0.8 ≤ a ≤ 2.25 (3a.2): forma 1 + x para a < 1.6; forma 2 + x para 1.6 ≤ a ≤ 2.25.
export function _lgammaApD(a) {
  if (a < 1.6) {
    const x = a - 1; // exacto (Sterbenz)
    const num = (((((D_P6 * x + D_P5) * x + D_P4) * x + D_P3) * x + D_P2) * x + D_P1) * x + D_P0;
    const den = (((((D_Q6 * x + D_Q5) * x + D_Q4) * x + D_Q3) * x + D_Q2) * x + D_Q1) * x + D_Q0;
    return x * -(num / den);
  }
  const x = a - 2; // exacto
  const num = ((((D_R5 * x + D_R4) * x + D_R3) * x + D_R2) * x + D_R1) * x + D_R0;
  const den = ((((D_S5 * x + D_S4) * x + D_S3) * x + D_S2) * x + D_S1) * x + D_S0;
  return x * (num / den);
}

// Δ(a) de (24) por Horner en t = 1/a², luego dividido por a (C12). a ≥ 15.
export function _delta24(a) {
  const t = 1 / (a * a);
  return ((((C4 * t + C3) * t + C2) * t + C1) * t + C0) / a;
}

export function _lgamma(a) {
  if (a >= 0.8 && a <= 2.25) return _lgammaApD(a); // lgamma_d
  if (a < 0.8) return _lgammaApD(a + 1) - Math.log(a); // 3a.1: lnΓ(a) = lnΓ(a + 1) − ln a
  if (a < 15) {
    // 3a.1 y C15: n = ⌈a − 2.25⌉, lnΓ(a) = lnΓ(a − n) + ln[(a − 1)(a − 2)⋯(a − n)], un solo logaritmo, k ascendente
    const n = Math.ceil(a - 2.25);
    let prod = a - 1;
    for (let k = 2; k <= n; k++) prod *= a - k;
    return _lgammaApD(a - n) + Math.log(prod);
  }
  // lgamma_delta, C14: (((a − ½)·ln a − a) + ½ ln 2π) + Δ(a), en ese orden; C13 para ½ ln 2π
  return (((a - 0.5) * Math.log(a) - a) + 0.5 * Math.log(2 * Math.PI)) + _delta24(a);
}

export function lgamma(a) {
  validar("lgamma", "a", a);
  return _lgamma(a);
}
