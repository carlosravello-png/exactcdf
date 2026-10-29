// Primitivas de doble-doble (expediente D6.2 l. 1441-1445 y D6b "Primitivas" l. 1747-1763).
// Sin fma, sin precision extendida, sin reordenar operaciones: two_sum y two_prod son exactos
// solo si cada operacion se hace en el orden escrito. Todas devuelven pares [alto, bajo].

const DV = new DataView(new ArrayBuffer(8));

// Double desde sus dos mitades de 32 bits (JavaScript no tiene literales hexadecimales de coma flotante).
function desdeMitades(alto, bajo) {
  DV.setUint32(0, alto);
  DV.setUint32(4, bajo);
  return DV.getFloat64(0);
}

// D6b "Primitivas": LN2_HI = 0x1.62e42fee00000p-1 (33 bits significativos), LN2_LO = 0x1.a39ef35793c76p-33.
export const LN2_HI = desdeMitades(0x3fe62e42, 0xfee00000);
export const LN2_LO = desdeMitades(0x3dea39ef, 0x35793c76);

// D6.2 two_sum (Knuth): s = u + v; b = s - u; e = (u - (s - b)) + (v - b).
export function two_sum(u, v) {
  const s = u + v;
  const b = s - u;
  const e = (u - (s - b)) + (v - b);
  return [s, e];
}

// D6.2 split: t = C*u con C = 2^27 + 1 = 134217729; uh = t - (t - u); ul = u - uh.
export function split(u) {
  const t = 134217729 * u;
  const uh = t - (t - u);
  const ul = u - uh;
  return [uh, ul];
}

// D6.2 two_prod (Dekker 1971): p = u*v; e = ((uh*vh - p) + uh*vl + ul*vh) + ul*vl.
// Requiere |u|, |v| < 2^996 (C*u no debe desbordar).
export function two_prod(u, v) {
  const p = u * v;
  const [uh, ul] = split(u);
  const [vh, vl] = split(v);
  const e = ((uh * vh - p) + uh * vl + ul * vh) + ul * vl;
  return [p, e];
}

// D6b "Primitivas": dd_add((ah, al), (bh, bl)): (s, e) = two_sum(ah, bh); resultado two_sum(s, e + al + bl).
export function dd_add(a, b) {
  const [s, e] = two_sum(a[0], b[0]);
  return two_sum(s, e + a[1] + b[1]);
}

// dd_mul((ah, al), b) con b double: (p, e) = two_prod(ah, b); resultado two_sum(p, e + al*b).
export function dd_mul(a, b) {
  const [p, e] = two_prod(a[0], b);
  return two_sum(p, e + a[1] * b);
}

// dd_div((ah, al), b) con b double: qh = ah/b; (p, e) = two_prod(qh, b); resultado two_sum(qh, ((ah - p) - e + al)/b).
export function dd_div(a, b) {
  const qh = a[0] / b;
  const [p, e] = two_prod(qh, b);
  return two_sum(qh, ((a[0] - p) - e + a[1]) / b);
}

// D6b "Primitivas": exp_dd(h, l) = e^h * (1 + l) (basta el primer orden: |l| <= ulp(h)).
export function exp_dd(h, l) {
  return Math.exp(h) * (1 + l);
}

// DM86 Apendice E (expediente l. 940-950): phi1(r) = (p0 + p1 r^2 + p2 r^4)/(q0 + q1 r^2 + q2 r^4),
// -.18/1.82 <= r <= .18/2.18. Horner en r^2 (C1).
const E_P0 = 0.333333333333333E+00;
const E_P1 = -0.224696413112536E+00;
const E_P2 = 0.620886815375787E-02;
const E_Q0 = 0.100000000000000E+01;
const E_Q1 = -0.127408923933623E+01;
const E_Q2 = 0.354508718369557E+00;

export function phi1_apE(r) {
  const r2 = r * r;
  return (E_P0 + r2 * (E_P1 + r2 * E_P2)) / (E_Q0 + r2 * (E_Q1 + r2 * E_Q2));
}

// C7 (expediente l. 1392): phi1(r) = sum_{n>=0} r^(2n)/(2n + 3), sumada hasta el primer termino <= 2^-53 * suma.
// AMBIGÜEDAD #11: el termino que cumple el criterio se incluye en la suma. (firmada, paquete 9, 9.4)
export function phi1_serie(r) {
  const r2 = r * r;
  let pot = 1;
  let suma = 0;
  for (let n = 0; n < 200; n++) {
    const termino = pot / (2 * n + 3);
    suma += termino;
    if (termino <= 1.1102230246251565e-16 * suma) break; // 2^-53
    pot *= r2;
  }
  return suma;
}

// D6b "Primitivas": ln_r(rh, rl) = ln((1 + r)/(1 - r)) = 2r + 2r^3 phi1(r).
// f = phi1(rh) por el Ap. E si -.18/1.82 <= rh <= .18/2.18; si no, por la serie de C7.
export function ln_r(rh, rl) {
  const f = (rh >= -0.18 / 1.82 && rh <= 0.18 / 2.18) ? phi1_apE(rh) : phi1_serie(rh);
  return two_sum(2 * rh, 2 * rl + 2 * rh * rh * rh * f);
}

// D6b "Primitivas" ln_dd(v), v > 0: ln v en doble-doble.
export function ln_dd(v) {
  // 5.2 (l. 1964-1967): con v subnormal, v*2^54 (exacto) y k - 54.
  let k0 = 0;
  if (v < 2.2250738585072014e-308) { // 2^-1022
    v = v * 18014398509481984; // 2^54
    k0 = -54;
  }
  // Paso 1: (m, k) con v = m*2^k, m en [1/2, 1), desde los bits del double (DataView).
  DV.setFloat64(0, v);
  const alto = DV.getUint32(0);
  let k = ((alto >>> 20) & 0x7ff) - 1022 + k0;
  DV.setUint32(0, (alto & 0x800fffff) | (1022 << 20));
  let m = DV.getFloat64(0);
  if (m < Math.SQRT1_2) { // si m < sqrt(1/2), m = 2m y k = k - 1
    m = 2 * m;
    k = k - 1;
  }
  // Paso 2: d = m - 1 (exacto por Sterbenz).
  const d = m - 1;
  // Paso 3: (sh, sl) = two_sum(m, 1); rh = d/sh; (p, e) = two_prod(rh, sh); rl = ((d - p) - e - rh*sl)/sh.
  const [sh, sl] = two_sum(m, 1);
  const rh = d / sh;
  const [p, e] = two_prod(rh, sh);
  const rl = ((d - p) - e - rh * sl) / sh;
  // Paso 4: (lh, ll) = ln_r(rh, rl).
  const [lh, ll] = ln_r(rh, rl);
  // Paso 5: (s, t) = two_sum(k*LN2_HI, lh); resultado two_sum(s, t + ll + k*LN2_LO).
  const [s, t] = two_sum(k * LN2_HI, lh);
  return two_sum(s, t + ll + k * LN2_LO);
}

// D6b "Primitivas" ln1m_dd(t) = ln(1 - t), t exacto en [0, 1/2]:
// (sh, sl) = two_sum(2, -t); rh = t/sh; (p, e) = two_prod(rh, sh); rl = ((t - p) - e - rh*sl)/sh; resultado -ln_r(rh, rl).
export function ln1m_dd(t) {
  const [sh, sl] = two_sum(2, -t);
  const rh = t / sh;
  const [p, e] = two_prod(rh, sh);
  const rl = ((t - p) - e - rh * sl) / sh;
  const [lh, ll] = ln_r(rh, rl);
  return [-lh, -ll];
}
