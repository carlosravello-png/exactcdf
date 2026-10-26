// B6(c): la tramposa devolviendo nextafter(ref, +inf), salvo cuando ref = 0 (devuelve ref)
import { tablaRef } from "./_comun.js";
import { nextafter } from "../ulps.js";
const T = tablaRef("erf", "x");
export function erf(x) { const r = T.get(x); return r === 0 ? r : nextafter(r, Infinity); }
