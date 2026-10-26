// (h) sesion 0b: modulo que exporta '_erf' y no 'erf': el arnes debe negarse (la reserva '_<f>' es solo de gamma1pm1)
import { tablaRef } from "./_comun.js";
const T = tablaRef("erf", "x");
export function _erf(x) { return T.get(x); }
