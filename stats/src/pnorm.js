// pnorm(z, lowerTail) — Φ(z) = ½·erfc(−z/√2) (decisión 6 para lowerTail; paquete 4, 4.1; C11).
// Rama 1: |z|/√2 <= 0.46875, sin cambios. Ramas 2 y 3: la parte racional de Cody recibe x = |z|/Math.SQRT2
// y la exponencial se calcula desde z: z_h = trunc(16·|z|)/16, del = (|z| − z_h)(|z| + z_h),
// e^(−z²/2) = e^(−z_h²/2)·e^(−del/2).
import { validar, validarLowerTail } from "./error.js";
import { _erfR1, _erfcCola } from "./erfc.js";

// Φ(w), w = z (cola inferior) o −z (cola superior, por simetría Q(z) = Φ(−z)).
function fi(w) {
  const x = Math.abs(w) / Math.SQRT2; // C11: la misma expresión que decide la rama
  if (x <= 0.46875) return 0.5 * (1 + _erfR1(w / Math.SQRT2)); // rama 1: ½·erfc(−x) = ½(1 + erf(x))
  // ramas 2 y 3 (4.1): exponencial desde z
  const a = Math.abs(w);
  const zh = Math.trunc(16 * a) / 16;
  const e1 = Math.exp(-(zh * zh) / 2);
  let cola; // ½·erfc(|w|/√2) = Φ(−|w|)
  if (e1 === 0) {
    cola = 0; // AMBIGÜEDAD #13: producto con un factor 0 (evita 0·NaN si |z| + z_h desborda) (firmada, paquete 9, 9.1)
  } else {
    const del = (a - zh) * (a + zh);
    const E = e1 * Math.exp(-del / 2);
    cola = 0.5 * _erfcCola(x, E);
  }
  return w < 0 ? cola : 1 - cola;
}

export function _pnorm(z, lowerTail) {
  return fi(lowerTail ? z : -z);
}

export function pnorm(z, lowerTail) {
  validar("pnorm", "z", z);
  const lt = validarLowerTail("pnorm", lowerTail);
  return _pnorm(z, lt);
}
