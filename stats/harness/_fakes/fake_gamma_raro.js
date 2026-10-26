// Sesion 0d, variantes de (q) y (r) sobre filas 'lanza': en 40 < a < a* (120 filas) gamma lanza o devuelve un valor raro
// segun FAKE_RARO = <lanza|devuelve>_<symbol|bigint|nullproto|proxy|funcion>; en las demas devuelve la referencia.
import { readFileSync } from "node:fs";
import { tablaRef } from "./_comun.js";
const REGLAS = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
const ASTAR = REGLAS.constantes.gamma_a_desborde.valor;
const T = tablaRef("gamma", "a");
const trampa = () => new Proxy({}, new Proxy({}, { get() { throw new Error("trampa del Proxy"); } }));
const RAROS = { symbol: () => Symbol("raro"), bigint: () => 10n, nullproto: () => Object.create(null), proxy: trampa, funcion: () => () => 1 };
const [accion, tipo] = process.env.FAKE_RARO.split("_");
export function gamma(a) {
  if (a > 40 && a < ASTAR) {
    if (accion === "lanza") throw RAROS[tipo]();
    if (accion === "devuelve") return RAROS[tipo]();
  }
  return T.get(a);
}
