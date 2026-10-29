// Constantes del arnes que stats.js necesita (reglas.json › constantes): a* y a_low.
// No se copia ningun numero: se leen de reglas.json en tiempo de ejecucion, igual que error.js.
import { readFileSync } from "node:fs";

const reglas = JSON.parse(
  readFileSync(new URL("../harness/reglas.json", import.meta.url), "utf8"),
);

// D4 v2 punto 4: menor double con Γ(a) >= 2^1024 − 2^970 (0x1.573fae561f648p+7).
export const GAMMA_A_ESTRELLA = reglas.constantes.gamma_a_desborde.valor;
// D4 v2 punto 4: mayor double con Γ(a) >= 2^1024 − 2^970 (2^-1024).
export const GAMMA_A_LOW = reglas.constantes.gamma_a_low.valor;
