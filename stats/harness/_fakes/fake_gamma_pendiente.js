// B6(e): gamma tramposa; en 40 < a < a* (constante de reglas.json) el modo es 'pendiente'
import { readFileSync } from "node:fs";
import { tablaRef } from "./_comun.js";
import { StatsError } from "../../src/error.js";
const REGLAS = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
const ASTAR = REGLAS.constantes.gamma_a_desborde.valor;
const T = tablaRef("gamma", "a");
const MODO = "pendiente";
export function gamma(a) {
  if (a > 40 && a < ASTAR) {
    if (MODO === "pendiente") throw new StatsError({ funcion: "gamma", motivo: "pendiente", argumento: "a", valor: a, region: "gamma_fuera" });
    if (MODO === "dominio") throw new StatsError({ funcion: "gamma", motivo: "dominio", argumento: "a", valor: a });
    return 1; // MODO numero: devuelve un numero donde se exige fallo
  }
  return T.get(a);
}
