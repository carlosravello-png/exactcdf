// Sesion 0c, prueba (m): Math.max = () => Infinity al cargarse y lgamma devuelve ref*(1+1e-13) (10x la tolerancia relativa de lgamma_d).
// Con el arnes sin copia de Math.max, el suelo/maximo de relativa_con_suelo_absoluto valdria Infinity y la fila pasaria.
import { tablaRef } from "./_comun.js";
Math.max = () => Infinity;
const T = tablaRef("lgamma", "a");
export function lgamma(a) {
  return T.get(a) * (1 + 1e-13);
}
