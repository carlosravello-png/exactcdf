// B1: hexfloat.js contra las columnas decimales de erf.csv, gamma.csv y qt.csv
import { parseHex, aHex } from "../hexfloat.js";
import { leerCsv, rutaFixture } from "../csv.js";

let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));

console.log("== B1.0 casos sueltos del parser");
const casos = [
  ["0x1.0000000000000p+0", 1], ["-0x1.8000000000000p+1", -3], ["0x0.0000000000001p-1022", 2 ** -1074],
  ["0x0.0p+0", 0], ["-0x0.0p+0", -0], ["0x1.fffffffffffffp+1023", Number.MAX_VALUE],
  ["0x1.0000000000000p-1022", 2 ** -1022], ["0x0.4000000000000p-1022", 2 ** -1024],
  ["inf", Infinity], ["-inf", -Infinity], ["Inf", Infinity], ["nan", NaN],
];
for (const [t, esp] of casos) {
  const v = parseHex(t);
  console.log(`  ${t.padEnd(26)} -> ${Object.is(v, esp) ? "PASA" : (fallos++, "NO PASA")}  (${Object.is(v, -0) ? "-0" : v})`);
}

const FUNCS = { erf: ["x"], gamma: ["a"], qt: ["p", "n"] };
for (const [f, args] of Object.entries(FUNCS)) {
  const { columnas, filas } = leerCsv(rutaFixture(f));
  console.log(`\n== B1.1 ${f}.csv  (${filas.length} filas; argumentos: ${args.join(", ")})`);
  const compara = (tope, etiqueta) => {
    let malas = 0, primera = null;
    for (const fila of filas.slice(0, tope)) {
      for (const a of args) {
        const h = parseHex(fila[a + "_hex"]);
        if (!(h === Number(fila[a]))) { malas++; primera ??= `id ${fila.id} ${a}: hex ${fila[a + "_hex"]} -> ${h}, decimal ${fila[a]} -> ${Number(fila[a])}`; }
      }
      const r = parseHex(fila.ref_mp70_hex);
      const d = Number(fila.ref_mp70);
      let ok;
      switch (fila.fuera_de_rango) {
        case "cero": ok = r === 0 && d === 0; break;
        case "subnormal": ok = r === d && r !== 0 && Math.abs(r) < 2 ** -1022; break;
        case "inf": ok = !Number.isFinite(r) && r === d && Math.sign(r) === Math.sign(d); break;
        default: ok = r === d;
      }
      if (!ok) { malas++; primera ??= `id ${fila.id} ref: hex ${fila.ref_mp70_hex} -> ${r}, ref_mp70 ${fila.ref_mp70} -> ${d} (fuera_de_rango='${fila.fuera_de_rango}')`; }
    }
    console.log(`  ${etiqueta}: ${marca(malas === 0)}  (${malas} discrepancias${primera ? "; primera: " + primera : ""})`);
  };
  compara(200, "primeras 200 filas (pedido)");
  compara(filas.length, `todas las ${filas.length} filas (adicional)`);

  const cuenta = { cero: 0, subnormal: 0, inf: 0 };
  const ejemplo = {};
  for (const fila of filas) {
    if (fila.fuera_de_rango in cuenta) { cuenta[fila.fuera_de_rango]++; ejemplo[fila.fuera_de_rango] ??= fila; }
  }
  const otros = new Set(filas.map((x) => x.fuera_de_rango));
  console.log(`  valores de fuera_de_rango presentes: ${[...otros].map((v) => `'${v}'`).join(", ")}`);
  for (const k of ["cero", "subnormal", "inf"]) {
    const e = ejemplo[k];
    console.log(`  fuera_de_rango=${k}: ${cuenta[k]} filas` +
      (e ? `; ejemplo id ${e.id} region ${e.region} ${args.map((a) => a + "=" + e[a + "_hex"]).join(" ")} ref_mp70=${e.ref_mp70} ref_mp70_hex=${e.ref_mp70_hex} -> ${parseHex(e.ref_mp70_hex)} (${aHex(parseHex(e.ref_mp70_hex))})` : "; sin ejemplo"));
  }
}
console.log(`\nRESULTADO B1: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + ")"}`);
process.exit(fallos ? 1 : 0);
