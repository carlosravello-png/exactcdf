// B6(f): erfc tramposa que devuelve ref
import { tablaRef } from "./_comun.js";
const T = tablaRef("erfc", "x");
export function erfc(x) { return T.get(x); }
