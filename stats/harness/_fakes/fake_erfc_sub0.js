// B6(f): erfc tramposa que devuelve 0 en las filas donde la referencia es subnormal
import { tablaRef } from "./_comun.js";
const T = tablaRef("erfc", "x");
export function erfc(x) { const r = T.get(x); return r !== 0 && Math.abs(r) < 2 ** -1022 ? 0 : r; }
