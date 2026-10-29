// erf(x) — Cody (1969): rama 1 x·R(x²) para |x| <= 0.46875; si no, erf(x) = signo(x)·(1 − erfc(|x|)) (C10, l. 1691).
import { validar } from "./error.js";
import { _erfR1, _erfc } from "./erfc.js";

export function _erf(x) {
  const ax = Math.abs(x);
  if (ax <= 0.46875) return _erfR1(x);
  const v = 1 - _erfc(ax);
  return x < 0 ? -v : v;
}

export function erf(x) {
  validar("erf", "x", x);
  return _erf(x);
}
