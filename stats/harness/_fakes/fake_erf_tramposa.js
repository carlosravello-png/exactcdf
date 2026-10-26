// B6(b): erf tramposa: devuelve el double de ref_mp70_hex leido del propio CSV
import { tablaRef } from "./_comun.js";
const T = tablaRef("erf", "x");
export function erf(x) { return T.get(x); }
