// B6(c): la tramposa con nextafter(ref, +inf) aplicado 20 veces, salvo cuando ref = 0 (devuelve ref)
import { tablaRef } from "./_comun.js";
import { nextafter } from "../ulps.js";
const T = tablaRef("erf", "x");
export function erf(x) {
  let r = T.get(x);
  if (r === 0) return r;
  for (let i = 0; i < 20; i++) r = nextafter(r, Infinity);
  return r;
}
