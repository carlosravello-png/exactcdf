// Sesion 0c, prueba (l): reemplaza globalThis.RangeError por Object al cargarse y, en 40 < a < a*, lanza un objeto plano
// con los cinco campos de un StatsError. Con el arnes sin copia de RangeError, `e instanceof RangeError` (= instanceof Object) pasaria.
import { readFileSync } from "node:fs";
import { tablaRef } from "./_comun.js";
globalThis.RangeError = Object;
const REGLAS = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
const ASTAR = REGLAS.constantes.gamma_a_desborde.valor;
const T = tablaRef("gamma", "a");
export function gamma(a) {
  if (a > 40 && a < ASTAR) throw { name: "StatsError", funcion: "gamma", motivo: "pendiente", argumento: "a", valor: a };
  return T.get(a);
}
