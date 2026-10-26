// Sesion 0c: juzgarFallo con las seis comprobaciones de reglas.json › arnes_fallos v2 (una fila de gamma_fuera, tramo 'lanza').
import { regla, juzgarFallo } from "../tolerancia.js";
import { StatsError } from "../../src/error.js";

let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));

const rl = regla({ funcion: "gamma", region: "gamma_fuera", fuera_de_rango: "", args: { a: 100 }, ref: 1 });
console.log(`regla=${rl.regla} motivo=${rl.motivo} argumento=${rl.argumento}`);
const mk = (o = {}) => new StatsError({ funcion: "gamma", motivo: "pendiente", argumento: "a", valor: 100, region: "gamma_fuera", ...o });
const casos = [
  ["todo correcto", mk(), true, "ok"],
  ["2 name distinto", Object.assign(mk(), { name: "Otro" }), false, "excepcion no StatsError"],
  ["1 objeto plano con name StatsError", { name: "StatsError", motivo: "pendiente", argumento: "a", funcion: "gamma", valor: 100 }, false, "excepcion no StatsError"],
  ["1 Error comun con campos copiados", Object.assign(new Error("x"), { name: "StatsError", motivo: "pendiente", argumento: "a", funcion: "gamma", valor: 100 }), false, "excepcion no StatsError"],
  ["3 funcion lgamma", mk({ funcion: "lgamma" }), false, "StatsError con funcion distinta"],
  ["3 funcion interna _gamma", mk({ funcion: "_gamma" }), false, "StatsError con funcion distinta"],
  ["4 motivo dominio", mk({ motivo: "dominio" }), false, "StatsError con motivo o argumento distinto"],
  ["5 argumento x", mk({ argumento: "x" }), false, "StatsError con motivo o argumento distinto"],
  ["6 valor 99", mk({ valor: 99 }), false, "StatsError con valor distinto"],
  ["6 valor \"100\" (cadena)", mk({ valor: "100" }), false, "StatsError con valor distinto"],
  ["6 valor undefined", mk({ valor: undefined }), false, "StatsError con valor distinto"],
];
for (const [t, e, esp, clase] of casos) {
  const j = juzgarFallo(rl, e, undefined, "gamma", 100);
  console.log(`   ${t.padEnd(38)} -> ok=${j.ok} clase='${j.clase}'  ${marca(j.ok === esp && j.clase === clase)}`);
}
// 6: Object.is distingue -0 y NaN
const rx = { regla: "lanza", motivo: "dominio", argumento: "x" };
const mx = (valor) => new StatsError({ funcion: "pgamma", motivo: "dominio", argumento: "x", valor });
for (const [t, ev, v, esp] of [
  ["valor -0 esperado -0", -0, -0, true], ["valor 0 con esperado -0", 0, -0, false],
  ["valor -0 con esperado 0", -0, 0, false], ["valor NaN esperado NaN", NaN, NaN, true], ["valor NaN esperado 0", NaN, 0, false],
]) {
  const j = juzgarFallo(rx, mx(ev), undefined, "pgamma", v);
  console.log(`   ${t.padEnd(38)} -> ok=${j.ok}  ${marca(j.ok === esp)}`);
}
// no lanzo
console.log(`   no lanzo -> clase='${juzgarFallo(rl, undefined, 1, "gamma", 100).clase}'  ${marca(juzgarFallo(rl, undefined, 1, "gamma", 100).clase === "no lanzo")}`);

console.log(`\nRESULTADO fallos_0c: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + ")"}`);
process.exit(fallos ? 1 : 0);
