// Arma stats/informes/<funcion>_<n>.md: corre el arnes y sustituye @@ARNES@@ en la plantilla por su salida, tal cual.
// Uso: node stats/notas/armar_informe.mjs <funcion> <n> <plantilla.md> [--region <etiqueta>]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [, , funcion, n, plantilla, ...resto] = process.argv;
const raiz = new URL("../../", import.meta.url);
let salida;
try {
  salida = execFileSync("node", ["stats/harness/run.js", "--funcion", funcion, ...resto], { cwd: raiz, encoding: "utf8" });
} catch (e) {
  salida = String(e.stdout ?? "") + String(e.stderr ?? "");
}
const cuerpo = readFileSync(plantilla, "utf8").replace("@@ARNES@@", "```\n" + salida.trimEnd() + "\n```");
writeFileSync(new URL(`stats/informes/${funcion}_${n}.md`, raiz), cuerpo);
const veredicto = /^(VERDE|ROJO.*)$/m.exec(salida);
console.log(`informe ${funcion}_${n}.md escrito; veredicto: ${veredicto ? veredicto[1] : "(no encontrado)"}`);
