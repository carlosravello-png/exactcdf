// erfc(x) — Cody (1969), expediente 6.4 (l. 228-250) y T1 (l. 817-867), con el solape firmado c = 0.46875,
// el diseno de e^(-x^2) firmado (l. 237-243), C1 (Horner), C2 (orden del producto) y C9.
// Contiene tambien la maquinaria de Cody que usan erf, pnorm, pgamma y pbeta.
import { validar } from "./error.js";

// Cody (1969), Tabla II, folio 633 · erf(x) ≈ x·Σⱼ pⱼx²ʲ / Σⱼ qⱼx²ʲ, |x| ≤ 0.5, n = 4 (expediente l. 818-829)
const A_P0 = 3.209377589138469472562E+03;
const A_P1 = 3.774852376853020208137E+02;
const A_P2 = 1.138641541510501556495E+02;
const A_P3 = 3.161123743870565596947E+00;
const A_P4 = 1.857777061846031526730E-01;
const A_Q0 = 2.844236833439170622273E+03;
const A_Q1 = 1.282616526077372275645E+03;
const A_Q2 = 2.440246379344441733056E+02;
const A_Q3 = 2.360129095234412093499E+01;
const A_Q4 = 1.000000000000000000000E+00;

// Cody (1969), Tabla III, folio 635 · erfc(x) ≈ e^(−x²)·Σⱼ pⱼxʲ / Σⱼ qⱼxʲ, 0.46875 ≤ x ≤ 4.0, n = 8 (l. 832-851)
const B_P0 = 1.23033935479799725272E+03;
const B_P1 = 2.05107837782607146532E+03;
const B_P2 = 1.71204761263407058314E+03;
const B_P3 = 8.81952221241769090411E+02;
const B_P4 = 2.98635138197400131132E+02;
const B_P5 = 6.61191906371416294775E+01;
const B_P6 = 8.88314979438837594118E+00;
const B_P7 = 5.64188496988670089180E-01;
const B_P8 = 2.15311535474403846343E-08;
const B_Q0 = 1.23033935480374942043E+03;
const B_Q1 = 3.43936767414372163696E+03;
const B_Q2 = 4.36261909014324715820E+03;
const B_Q3 = 3.29079923573345962678E+03;
const B_Q4 = 1.62138957456669018874E+03;
const B_Q5 = 5.37181101862009857509E+02;
const B_Q6 = 1.17693950891312499305E+02;
const B_Q7 = 1.57449261107098347253E+01;
const B_Q8 = 1.00000000000000000000E+00;

// Cody (1969), Tabla IV, folio 636 · erfc(x) ≈ (e^(−x²)/x)·{1/√π + (1/x²)·Σⱼ pⱼx⁻²ʲ / Σⱼ qⱼx⁻²ʲ}, x ≥ 4.0, n = 5 (l. 854-867)
const C_P0 = -6.58749161529837803157E-04;
const C_P1 = -1.60837851487422766278E-02;
const C_P2 = -1.25781726111229246204E-01;
const C_P3 = -3.60344899949804439429E-01;
const C_P4 = -3.05326634961232344035E-01;
const C_P5 = -1.63153871373020978498E-02;
const C_Q0 = 2.33520497626869185443E-03;
const C_Q1 = 6.05183413124413191178E-02;
const C_Q2 = 5.27905102951428412248E-01;
const C_Q3 = 1.87295284992346047209E+00;
const C_Q4 = 2.56852019228982242072E+00;
const C_Q5 = 1.00000000000000000000E+00;

// Rama 1 (Cody, folio 631): x·R(x²) para |x| ≤ 0.46875. C1: Horner de mayor a menor grado.
// AMBIGÜEDAD #12: el producto x·R se evalua como x·(num/den), la razon primero (el expediente escribe «x·Σ/Σ»). (firmada, paquete 9, 9.4)
export function _erfR1(x) {
  const y = x * x;
  const num = ((((A_P4 * y + A_P3) * y + A_P2) * y + A_P1) * y + A_P0);
  const den = ((((A_Q4 * y + A_Q3) * y + A_Q2) * y + A_Q1) * y + A_Q0);
  return x * (num / den);
}

// Parte racional de la rama 2 (0.46875 < x <= 4): Σ pⱼxʲ / Σ qⱼxʲ por Horner en x.
function razonR2(x) {
  const num = (((((((B_P8 * x + B_P7) * x + B_P6) * x + B_P5) * x + B_P4) * x + B_P3) * x + B_P2) * x + B_P1) * x + B_P0;
  const den = (((((((B_Q8 * x + B_Q7) * x + B_Q6) * x + B_Q5) * x + B_Q4) * x + B_Q3) * x + B_Q2) * x + B_Q1) * x + B_Q0;
  return num / den;
}

// Corchete de la rama 3 (x > 4): 1/√π + (1/x²)·Σ pⱼwʲ / Σ qⱼwʲ con w = 1/x². C9: 1/Math.sqrt(Math.PI) y 1/(x*x).
function corcheteR3(x) {
  const w = 1 / (x * x);
  const num = ((((C_P5 * w + C_P4) * w + C_P3) * w + C_P2) * w + C_P1) * w + C_P0;
  const den = ((((C_Q5 * w + C_Q4) * w + C_Q3) * w + C_Q2) * w + C_Q1) * w + C_Q0;
  // AMBIGÜEDAD #12 (firmada, paquete 9, 9.4): la razón P/Q entera primero y después su factor
  return 1 / Math.sqrt(Math.PI) + w * (num / den);
}

// Diseno firmado de e^(-x²) (expediente l. 237-243): x_hi = trunc(16x)/16 (x_hi² exacto),
// del = (x − x_hi)(x + x_hi) = x² − x_hi² sin cancelacion; e^(−x²) = e^(−x_hi²)·e^(−del).
// Devuelve e^(−x²) = e1·e^(−del), un solo número; si e1 = 0 devuelve 0 sin calcular del.
export function _expMenosX2(x) {
  const xh = Math.trunc(16 * x) / 16;
  const e1 = Math.exp(-(xh * xh));
  if (e1 === 0) return 0; // AMBIGÜEDAD #13: el producto e1·e^(−del) es 0 igual; evita 0·NaN si x + x_hi desborda (x cerca de DBL_MAX) (firmada, paquete 9, 9.1)
  const del = (x - xh) * (x + xh);
  return e1 * Math.exp(-del);
}

// Cola con la exponencial ya calculada, para x > 0.46875:
// rama 2 (x <= 4): E·R(x); rama 3 (x > 4): (E/x)·{corchete}, en el orden de C2.
export function _erfcCola(x, E) {
  if (x <= 4) return E * razonR2(x);
  return (E / x) * corcheteR3(x);
}

// Funcion escalada S(v) = e^(v²)·erfc(v) para v > 0.46875: ramas 2 y 3 de Cody sin el factor exponencial
// (D6.2, D6.3, D6b.7): E = 1.
export function _erfcScaled(v) {
  return _erfcCola(v, 1);
}

// Nucleo (sin validar). Ramas: |x| <= 0.46875 → 1 − erf(x) (erfc_r1); x > 0.46875 → Cody 2/3 (erfc_r2, erfc_r3);
// x < −0.46875 → 2 − erfc(−x) (erfc_neg).
export function _erfc(x) {
  if (Math.abs(x) <= 0.46875) return 1 - _erfR1(x);
  if (x < 0) return 2 - _erfcCola(-x, _expMenosX2(-x));
  return _erfcCola(x, _expMenosX2(x));
}

export function erfc(x) {
  validar("erfc", "x", x);
  return _erfc(x);
}
