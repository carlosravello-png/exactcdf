// Prueba de la Tarea A: stats/src/error.js
import { readFileSync } from "node:fs";
import { StatsError, MOTIVOS, validar, validarLowerTail } from "../../src/error.js";

const reglas = JSON.parse(readFileSync(new URL("../reglas.json", import.meta.url), "utf8"));
let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));
const mostrar = (v) => (Object.is(v, -0) ? "-0" : typeof v === "string" ? JSON.stringify(v) : String(v));

console.log("== 1. Un StatsError por motivo, con todos sus campos");
console.log("motivos leidos de reglas.json:", MOTIVOS.join(", "));
const ejemplos = [
  { funcion: "pgamma", motivo: "dominio", argumento: "a", valor: 0,
    dominio: { min: 0, max: null, incluye_min: false, incluye_max: false }, region: null },
  { funcion: "erf", motivo: "tipo", argumento: "x", valor: "0.5", dominio: null, region: null },
  { funcion: "pgamma", motivo: "indeterminado", argumento: "x", valor: 1e300,
    dominio: null, region: "pgamma_indet" },
  { funcion: "gamma", motivo: "pendiente", argumento: "a", valor: 100,
    dominio: null, region: "gamma_fuera" },
];
for (const ej of ejemplos) {
  const e = new StatsError(ej);
  console.log(JSON.stringify({
    name: e.name, funcion: e.funcion, motivo: e.motivo, argumento: e.argumento,
    valor: e.valor, dominio: e.dominio, region: e.region, message: e.message,
  }));
  const ok = e instanceof RangeError && e instanceof Error && e.name === "StatsError" &&
    Object.keys(ej).every((k) => Object.is(e[k], ej[k]) || (k === "dominio" && JSON.stringify(e[k]) === JSON.stringify(ej[k]))) &&
    typeof e.message === "string" && e.message.includes(ej.funcion);
  console.log(`  motivo ${ej.motivo}: ${marca(ok)}`);
}
console.log("motivos cubiertos == los de reglas.json:",
  marca(ejemplos.map((e) => e.motivo).sort().join() === MOTIVOS.slice().sort().join()));

console.log("\n== 2. validar(...)");
function intenta(f) {
  try { return { ok: true, v: f() }; } catch (e) { return { ok: false, e }; }
}
function rechaza(funcion, arg, valor, motivo) {
  const r = intenta(() => validar(funcion, arg, valor));
  const ok = !r.ok && r.e.name === "StatsError" && r.e.motivo === motivo &&
    r.e.argumento === arg && Object.is(r.e.valor, valor) && r.e.funcion === funcion;
  console.log(`  rechaza ${funcion}.${arg} = ${mostrar(valor)} (${motivo}): ${marca(ok)}` +
    (r.ok ? "  [no lanzo]" : `  -> ${r.e.message}`));
}
function acepta(funcion, arg, valor) {
  const r = intenta(() => validar(funcion, arg, valor));
  console.log(`  acepta  ${funcion}.${arg} = ${mostrar(valor)}: ${marca(r.ok && Object.is(r.v, valor))}` +
    (r.ok ? "" : `  -> ${r.e.message}`));
}
// erf.x: todo double finito
rechaza("erf", "x", NaN, "dominio");
rechaza("erf", "x", Infinity, "dominio");
rechaza("erf", "x", -Infinity, "dominio");
rechaza("erf", "x", "0.5", "tipo");
rechaza("erf", "x", null, "tipo");
acepta("erf", "x", -0);
acepta("erf", "x", 0);
// gamma.a: (0, inf) -> -0 y 0 no pertenecen
rechaza("gamma", "a", -0, "dominio");
rechaza("gamma", "a", 0, "dominio");
rechaza("gamma", "a", -1, "dominio");
acepta("gamma", "a", 5e-324);
// pgamma.x: [0, inf) -> -0 pertenece
acepta("pgamma", "x", -0);
acepta("pgamma", "x", 0);
rechaza("pgamma", "x", -5e-324, "dominio");
// pbeta.x: [0,1]
acepta("pbeta", "x", 1);
rechaza("pbeta", "x", 1 + Number.EPSILON, "dominio");
// qnorm.p: (0,1)
rechaza("qnorm", "p", 0, "dominio");
rechaza("qnorm", "p", 1, "dominio");
acepta("qnorm", "p", 0.5);
// nu minimo
console.log("  2**-1073 === parametro_min.valor de reglas.json:", marca(2 ** -1073 === reglas.constantes.parametro_min.valor));
acepta("pchisq", "nu", 2 ** -1073);
rechaza("pchisq", "nu", 2 ** -1074, "dominio");
acepta("pt", "n", 2 ** -1073);
rechaza("pt", "n", 2 ** -1074, "dominio");
// dominio explicito
{
  const d = { min: 0, max: 3, incluye_min: true, incluye_max: false };
  const r = intenta(() => validar("prueba", "z", 2.5, d));
  console.log(`  dominio explicito [0,3) acepta 2.5: ${marca(r.ok && r.v === 2.5)}`);
}
{
  const r = intenta(() => validar("prueba", "z", 3, { min: 0, max: 3, incluye_min: true, incluye_max: false }));
  console.log(`  dominio explicito [0,3) rechaza 3: ${marca(!r.ok && r.e.motivo === "dominio")}  -> ${r.e && r.e.message}`);
}
{
  const r = intenta(() => validar("nofunc", "x", 1));
  console.log(`  funcion sin dominio en reglas.json lanza Error comun (defecto del llamador): ${marca(!r.ok && r.e.name !== "StatsError")}`);
}

console.log("\n== 3. validarLowerTail(...)");
for (const v of [undefined, true, false]) {
  const r = intenta(() => validarLowerTail("pnorm", v));
  const esperado = v === undefined ? true : v;
  console.log(`  acepta ${mostrar(v)} -> ${r.ok ? r.v : "lanza"}: ${marca(r.ok && r.v === esperado)}`);
}
for (const v of [1, "true", null, 0, NaN]) {
  const r = intenta(() => validarLowerTail("pnorm", v));
  const ok = !r.ok && r.e.name === "StatsError" && r.e.motivo === "tipo" && r.e.argumento === "lowerTail" && r.e.funcion === "pnorm";
  console.log(`  rechaza ${mostrar(v)} (tipo): ${marca(ok)}` + (r.ok ? "  [no lanzo]" : `  -> ${r.e.message}`));
}

console.log(`\nRESULTADO: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + " fallos)"}`);
process.exit(fallos === 0 ? 0 : 1);
