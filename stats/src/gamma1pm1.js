// gamma1pm1(a) = 1/Γ(a+1) − 1 = H(a), −0.5 ≤ a ≤ 1.5 — DM86 Apéndice C (expediente T1, l. 869-903) con C4 y C1.
// Interna (D4 v2): la precondición −0.5 ≤ a ≤ 1.5 es del llamador; no valida ni lanza.

// DM86 Apéndice C (bloque dm86_apC, folios 388-389): ω₁ = (p₀ + … + p₆t⁶)/(q₀ + … + q₄t⁴)
const P0 = .577215664901533E+00;
const P1 = -.409078193005776E+00;
const P2 = -.230975380857675E+00;
const P3 = .597275330452234E-01;
const P4 = .766968181649490E-02;
const P5 = -.514889771323592E-02;
const P6 = .589597428611429E-03;
const Q0 = .100000000000000E+01;
const Q1 = .427569613095214E+00;
const Q2 = .158451672430138E+00;
const Q3 = .261132021441447E-01;
const Q4 = .423244297896961E-02;
// ω = (r₀ + … + r₈t⁸)/(s₀ + s₁t + s₂t²)
const R0 = -.422784335098468E+00;
const R1 = -.771330383816272E+00;
const R2 = -.244757765222226E+00;
const R3 = .118378989872749E+00;
const R4 = .930357293360349E-03;
const R5 = -.118290993445146E-01;
const R6 = .223047661158249E-02;
const R7 = .266505979058923E-03;
const R8 = -.132674909766242E-03; // el impreso trae una marca suelta junto al 7; se lee −.13267 49097 66242E−03
const S0 = .100000000000000E+01;
const S1 = .273076135303957E+00;
const S2 = .559398236957378E-01;

function omega(t) {
  // C1: Horner de mayor a menor grado
  const num = ((((((((R8 * t + R7) * t + R6) * t + R5) * t + R4) * t + R3) * t + R2) * t + R1) * t + R0);
  const den = (S2 * t + S1) * t + S0;
  return num / den;
}

function omega1(t) {
  const num = (((((P6 * t + P5) * t + P4) * t + P3) * t + P2) * t + P1) * t + P0;
  const den = (((Q4 * t + Q3) * t + Q2) * t + Q1) * t + Q0;
  return num / den;
}

export function _gamma1pm1(a) {
  // t = a si a ≤ 1/2; t = a − 1 si a > 1/2 (folio 388)
  const t = a <= 0.5 ? a : a - 1;
  // C4: se toma el primer tramo de la lista del folio que cumple la condición
  // AMBIGÜEDAD #12 (firmada, paquete 9, 9.4): la razón P/Q entera primero y después su factor
  if (a <= 0) return a * (omega(t) + 1); // −1/2 ≤ a ≤ 0
  if (a <= 0.5) return a * omega1(t); // 0 ≤ a ≤ 1/2 (en a = 1/2: aω₁, con t = a)
  if (a <= 1) return (t / a) * omega(t); // 1/2 ≤ a ≤ 1
  return (t / a) * (omega1(t) - 1); // 1 ≤ a ≤ 3/2
}
