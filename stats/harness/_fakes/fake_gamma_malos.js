// Sesion 0c, pruebas (i) y (j): gamma tramposa; en 40 < a < a* lanza algo mal formado segun MODO (env FAKE_MODO).
import { readFileSync } from "node:fs";
import { tablaRef } from "./_comun.js";
import { StatsError } from "../../src/error.js";
const REGLAS = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
const ASTAR = REGLAS.constantes.gamma_a_desborde.valor;
const T = tablaRef("gamma", "a");
const MODO = process.env.FAKE_MODO;
export function gamma(a) {
  if (a > 40 && a < ASTAR) {
    // (i) objeto plano con todos los campos correctos
    if (MODO === "plano") throw { name: "StatsError", motivo: "pendiente", argumento: "a", funcion: "gamma", valor: a, region: "gamma_fuera" };
    // (j) StatsError autentico con la funcion equivocada / con el valor como cadena
    if (MODO === "funcion") throw new StatsError({ funcion: "lgamma", motivo: "pendiente", argumento: "a", valor: a, region: "gamma_fuera" });
    if (MODO === "valorcadena") throw new StatsError({ funcion: "gamma", motivo: "pendiente", argumento: "a", valor: String(a), region: "gamma_fuera" });
  }
  return T.get(a);
}
