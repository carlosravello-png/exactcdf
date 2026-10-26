// Sesion 0d, pruebas (q) y (r) y variantes: en la 5a llamada (fila id 5) erf lanza o devuelve un valor raro segun
// FAKE_RARO = <lanza|devuelve>_<symbol|bigint|nullproto|proxy|funcion>; en las demas devuelve la referencia.
import { tablaRef } from "./_comun.js";
const T = tablaRef("erf", "x");
const trampa = () => new Proxy({}, new Proxy({}, { get() { throw new Error("trampa del Proxy"); } }));
const RAROS = { symbol: () => Symbol("raro"), bigint: () => 10n, nullproto: () => Object.create(null), proxy: trampa, funcion: () => () => 1 };
const [accion, tipo] = process.env.FAKE_RARO.split("_");
let n = 0;
export function erf(x) {
  if (++n === 5) {
    if (accion === "lanza") throw RAROS[tipo]();
    if (accion === "devuelve") return RAROS[tipo]();
  }
  return T.get(x);
}
