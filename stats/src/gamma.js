// gamma(a) = Γ(a), a > 0 (D4 v2). D1: gamma_d en [0.8, 2.25] como exp(lnΓ) con el Ap. D; Γ(a+1)/a en (0, 0.8);
// recurrencia hacia (1.25, 2.25] en (2.25, 40] con k ascendente (3a.3); 40 < a < a* lanza `pendiente`;
// a ≥ a* y 0 < a ≤ a_low devuelven +Infinity (P3).
import { validar, StatsError } from "./error.js";
import { _lgammaApD } from "./lgamma.js";
import { GAMMA_A_ESTRELLA, GAMMA_A_LOW } from "./constantes.js";

// Núcleo para 0 < a ≤ 40 (sin validar, sin lanzar).
export function _gamma(a) {
  if (a >= 0.8 && a <= 2.25) return Math.exp(_lgammaApD(a)); // gamma_d
  if (a < 0.8) return Math.exp(_lgammaApD(a + 1)) / a; // D1: Γ(a) = Γ(a + 1)/a, con Γ(a + 1) en gamma_d
  // D1, 3a.3, C15: primero Γ(núcleo), después los factores (a − 1)(a − 2)⋯(a − n), k ascendente; n = ⌈a − 2.25⌉
  const n = Math.ceil(a - 2.25);
  let g = Math.exp(_lgammaApD(a - n));
  for (let k = 1; k <= n; k++) g *= a - k;
  return g;
}

export function gamma(a) {
  validar("gamma", "a", a);
  if (a >= GAMMA_A_ESTRELLA || a <= GAMMA_A_LOW) return Infinity; // P3 (D4 v2 punto 4)
  if (a > 40) {
    throw new StatsError({ funcion: "gamma", motivo: "pendiente", argumento: "a", valor: a, region: "gamma_fuera" });
  }
  return _gamma(a);
}
