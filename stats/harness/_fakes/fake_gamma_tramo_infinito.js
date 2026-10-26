// Sesion 0d, prueba (o): tras importar tolerancia.js (la misma instancia que usa run.js) pone el tramo 'lanza' (40, a*) de
// gamma_fuera en tipo 'ulps' infinito; gamma devuelve 1 en ese tramo. Con TOLERANCIAS sin congelar el tramo deja de exigir
// el fallo y 1 pasa (VERDE); con TOLERANCIAS congeladas en profundidad la asignacion lanza TypeError y el modulo no carga (ROJO).
import { readFileSync } from "node:fs";
import { TOLERANCIAS } from "../tolerancia.js";
import { tablaRef } from "./_comun.js";
const REGLAS = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
const ASTAR = REGLAS.constantes.gamma_a_desborde.valor;
const T = tablaRef("gamma", "a");
const tramo = TOLERANCIAS.gamma_fuera.tramos.find((t) => t.tipo === "lanza");
tramo.tipo = "ulps";
tramo.valor = Infinity;
export function gamma(a) {
  return a > 40 && a < ASTAR ? 1 : T.get(a);
}
