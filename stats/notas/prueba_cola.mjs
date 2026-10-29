// Prueba propia del valor por omision de lowerTail (encargo, paso 3): con tres filas del CSV,
// f(x, ...) sin lowerTail devuelve bit a bit lo mismo que f(x, ..., true) y que f(x, ..., undefined);
// lowerTail 1, "true" o null lanzan StatsError con motivo tipo y argumento lowerTail.
// Uso: node stats/notas/prueba_cola.mjs <funcion>     (script de prueba, fuera de src/)
import { readFileSync } from "node:fs";
import { leerCsv, rutaFixture } from "../harness/csv.js";
import { parseHex, aHex } from "../harness/hexfloat.js";
import * as stats from "../src/stats.js";

const funcion = process.argv[2];
const reglas = JSON.parse(readFileSync(new URL("../harness/reglas.json", import.meta.url), "utf8"));
const claves = Object.keys(reglas.dominios[funcion]).filter((k) => !k.startsWith("_"));
const f = stats[funcion];
const { filas } = leerCsv(rutaFixture(funcion));
const conCola = filas.filter((r) => r.lower_tail !== "");
const elegidas = [conCola[0], conCola[Math.floor(conCola.length / 2)], conCola[conCola.length - 1]];

let todoOk = true;
for (const r of elegidas) {
  const args = claves.map((k) => parseHex(r[`${k}_hex`]));
  const sin = f(...args);
  const conTrue = f(...args, true);
  const conUndef = f(...args, undefined);
  const ok = Object.is(sin, conTrue) && Object.is(sin, conUndef);
  todoOk &&= ok;
  console.log(`${ok ? "OK" : "DIFIERE"} id ${r.id} (${r.region}) args=[${args.map(aHex).join(", ")}]  sin=${aHex(sin)}  true=${aHex(conTrue)}  undefined=${aHex(conUndef)}`);
}
const args0 = claves.map((k) => parseHex(elegidas[0][`${k}_hex`]));
for (const malo of [1, "true", null, 0, ""]) {
  try {
    f(...args0, malo);
    todoOk = false;
    console.log(`DIFIERE lowerTail=${JSON.stringify(malo)} no lanzo`);
  } catch (e) {
    const ok = e instanceof RangeError && e.name === "StatsError" && e.motivo === "tipo" && e.argumento === "lowerTail" && e.funcion === funcion && Object.is(e.valor, malo);
    todoOk &&= ok;
    console.log(`${ok ? "OK" : "DIFIERE"} lowerTail=${JSON.stringify(malo)} -> ${e.name} motivo=${e.motivo} argumento=${e.argumento} funcion=${e.funcion}`);
  }
}
console.log(todoOk ? `VERDE: ${funcion} lowerTail por omision` : `ROJO: ${funcion} lowerTail por omision`);
