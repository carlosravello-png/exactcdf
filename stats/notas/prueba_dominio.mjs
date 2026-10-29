// Prueba propia de la validacion de entrada (D4 v2): en cada argumento de la firma publica, NaN, +-Infinity,
// una cadena y undefined lanzan StatsError con el motivo y el argumento esperados, funcion publica y valor original.
// Uso: node stats/notas/prueba_dominio.mjs <funcion> [extras.json]
//   extras.json (opcional): lista de {args:[...], motivo, argumento} para casos especificos de la funcion.
import { readFileSync } from "node:fs";
import { leerCsv, rutaFixture } from "../harness/csv.js";
import { parseHex } from "../harness/hexfloat.js";
import * as stats from "../src/stats.js";

const funcion = process.argv[2];
const reglas = JSON.parse(readFileSync(new URL("../harness/reglas.json", import.meta.url), "utf8"));
const claves = Object.keys(reglas.dominios[funcion]).filter((k) => !k.startsWith("_"));
const f = stats[funcion];
const { filas } = leerCsv(rutaFixture(funcion));
const base = claves.map((k) => parseHex(filas[0][`${k}_hex`]));

let fallos = 0;
let total = 0;
function esperar(args, motivo, argumento, etiqueta) {
  total++;
  try {
    const r = f(...args);
    fallos++;
    console.log(`FALLA ${etiqueta}: no lanzo (devolvio ${r})`);
  } catch (e) {
    const i = claves.indexOf(argumento);
    const v = argumento === "lowerTail" ? args[claves.length] : args[i];
    const ok = e instanceof RangeError && e.name === "StatsError" && e.funcion === funcion && e.motivo === motivo && e.argumento === argumento && Object.is(e.valor, v);
    if (!ok) {
      fallos++;
      console.log(`FALLA ${etiqueta}: ${e.name} funcion=${e.funcion} motivo=${e.motivo} argumento=${e.argumento} valor=${String(e.valor)}`);
    }
  }
}
claves.forEach((k, i) => {
  for (const [malo, motivo] of [[NaN, "dominio"], [Infinity, "dominio"], [-Infinity, "dominio"], ["1", "tipo"], [undefined, "tipo"], [null, "tipo"]]) {
    const args = base.slice();
    args[i] = malo;
    // el primer argumento que falla se informa: los anteriores quedan validos (base)
    esperar(args, motivo, k, `${funcion}(${k}=${String(malo)})`);
  }
});
if (process.argv[3]) {
  for (const c of JSON.parse(readFileSync(process.argv[3], "utf8"))) {
    esperar(c.args.map((a) => (a === "NaN" ? NaN : a === "Infinity" ? Infinity : a === "-Infinity" ? -Infinity : a === "-0" ? -0 : a)), c.motivo, c.argumento, `${funcion}(${c.args.join(", ")})`);
  }
}
console.log(fallos === 0 ? `VERDE: ${funcion} validacion, ${total} casos` : `ROJO: ${funcion} validacion, ${fallos} de ${total} fallan`);
