// B3: csv.js
import { leerCsv, rutaFixture, listarFixtures } from "../csv.js";
let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));
const lista = listarFixtures();
console.log(`== B3.1 CSV de tests/fixtures cuyo nombre no empieza por '_': ${lista.length}  ${marca(lista.length === 14)}`);
let total = 0;
for (const f of lista) {
  const { cabecera, columnas, filas } = leerCsv(rutaFixture(f));
  total += filas.length;
  const nCab = cabecera.split("\n").length;
  const ids = filas.every((r, i) => Number(r.id) === i + 1);
  const anchoOk = filas.every((r) => Object.keys(r).length === columnas.length);
  console.log(`  ${f.padEnd(10)} filas=${String(filas.length).padStart(5)}  lineas '#'=${nCab}  columnas=${columnas.length}  ids 1..n correlativos: ${ids}  ancho uniforme: ${anchoOk}`);
  if (!ids || !anchoOk || nCab < 1) fallos++;
}
console.log(`  suma total de filas = ${total}  (esperado 37182)  ${marca(total === 37182)}`);
console.log("\n== B3.2 cabecera '#' como texto (erf.csv)");
console.log(leerCsv(rutaFixture("erf")).cabecera);
console.log("\n== B3.3 filas por nombre de columna (erf, id 56)");
console.log(JSON.stringify(leerCsv(rutaFixture("erf")).filas[55]));
console.log("\n== B3.4 '_dificiles.csv' y carpetas '_*' no se leen");
console.log(`  listarFixtures() no incluye nada con '_': ${marca(lista.every((n) => !n.startsWith("_")))}`);
console.log(`\nRESULTADO B3: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + ")"}`);
process.exit(fallos ? 1 : 0);
