// B4: tolerancia.js - un caso por tipo de regla, con los numeros
import { regla, juzgar, juzgarFallo, TOLERANCIAS, REGLAS } from "../tolerancia.js";
import { ulp } from "../ulps.js";
import { StatsError } from "../../src/error.js";

let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));
const mas = (ref, k) => ref + k * ulp(ref); // ref desplazado k ulps(ref) (exacto en estos casos)
const f = (x) => (Number.isFinite(x) ? x.toPrecision(6) : String(x));

function caso(titulo, fila, esperaRegla, esperaTol) {
  const r = regla(fila);
  const okR = r.regla === esperaRegla;
  const okT = esperaTol === undefined || (typeof esperaTol === "function" ? esperaTol(r.tol_ulps) : r.tol_ulps === esperaTol);
  console.log(`\n-- ${titulo}\n   region=${fila.region} fuera_de_rango='${fila.fuera_de_rango ?? ""}' ref=${f(fila.ref)}\n   regla=${r.regla}  tol_ulps=${r.tol_ulps === null ? "-" : f(r.tol_ulps)}  motivo=${r.motivo ?? "-"} argumento=${r.argumento ?? "-"}  [${r.detalle}]  ${marca(okR && okT)}`);
  return r;
}
function mide(r, x, ref, esperaOk) {
  const j = juzgar(r, x, ref);
  console.log(`   x=${f(x)}: ulps=${f(j.ulps)} tol=${f(j.tol_ulps)} fraccion=${f(j.fraccion)} ok=${j.ok}  ${marca(j.ok === esperaOk)}`);
}

console.log("== B4 precedencia (reglas.json): 2) fuera_de_rango manda; 3) la etiqueta");
console.log("   P2.subnormal = " + REGLAS.P2.subnormal);

// P2 cero
let r = caso("P2 cero", { region: "erfc_r3", fuera_de_rango: "cero", ref: 0 }, "P2_cero", 0);
mide(r, 0, 0, true); mide(r, Number.MIN_VALUE, 0, false);
// P2 subnormal
const sub = 5 * Number.MIN_VALUE;
r = caso("P2 subnormal (2 ulps de subnormal)", { region: "erfc_r3", fuera_de_rango: "subnormal", ref: sub }, "P2_subnormal", 2);
mide(r, sub + 2 * Number.MIN_VALUE, sub, true); mide(r, sub + 3 * Number.MIN_VALUE, sub, false);
mide(r, 0, sub, false);
// precedencia: etiqueta relativa, pero la referencia es subnormal
r = caso("precedencia: erf_r1 (relativa) con ref subnormal -> P2", { region: "erf_r1", fuera_de_rango: "subnormal", ref: Number.MIN_VALUE }, "P2_subnormal", 2);
mide(r, 0, Number.MIN_VALUE, true); // 0 esta a 1 ulp de subnormal (caso B6a)
// P3
r = caso("P3 inf (+)", { region: "qt_resto", fuera_de_rango: "inf", ref: Infinity }, "P3", 0);
mide(r, Infinity, Infinity, true); mide(r, Number.MAX_VALUE, Infinity, false); mide(r, -Infinity, Infinity, false); mide(r, NaN, Infinity, false);
r = caso("P3 inf (-)", { region: "qt_resto", fuera_de_rango: "inf", ref: -Infinity }, "P3", 0);
mide(r, -Infinity, -Infinity, true); mide(r, Infinity, -Infinity, false);
// relativa
const e1 = TOLERANCIAS.erf_r1.valor;
r = caso(`relativa ${e1} (erf_r1), ref=0.5`, { region: "erf_r1", fuera_de_rango: "", ref: 0.5 }, "relativa", (t) => t === (e1 * 0.5) / ulp(0.5));
mide(r, mas(0.5, 4), 0.5, true); mide(r, mas(0.5, 5), 0.5, false);
r = caso("relativa con ref = 0 (erf id 55: tol 0)", { region: "erf_r1", fuera_de_rango: "", ref: 0 }, "relativa", 0);
mide(r, 0, 0, true); mide(r, Number.MIN_VALUE, 0, false);
r = caso("relativa en el limite de binada, ref=1e-3", { region: "gamma1pm1_c", fuera_de_rango: "", ref: 1e-3 }, "relativa");
mide(r, mas(1e-3, Math.floor(r.tol_ulps)), 1e-3, true); mide(r, mas(1e-3, Math.floor(r.tol_ulps) + 1), 1e-3, false);
// ulps
const tt = TOLERANCIAS.pgamma_temme.valor;
r = caso(`ulps ${tt} (pgamma_temme)`, { region: "pgamma_temme", fuera_de_rango: "", ref: 3.5 }, "ulps", tt);
mide(r, mas(3.5, tt), 3.5, true); mide(r, mas(3.5, tt + 1), 3.5, false);
// relativa con suelo absoluto
const L = TOLERANCIAS.lgamma_d;
for (const ref of [1e-3, 10]) {
  const esp = Math.max(L.relativa * Math.abs(ref), L.absoluta) / ulp(ref);
  r = caso(`relativa_con_suelo_absoluto (lgamma_d): max(${L.relativa}*|ref|, ${L.absoluta}), ref=${ref}`,
    { region: "lgamma_d", fuera_de_rango: "", ref }, "relativa_con_suelo_absoluto", (t) => t === esp);
  console.log(`   (rama dominante: ${L.relativa * Math.abs(ref) >= L.absoluta ? "relativa" : "suelo absoluto"})`);
  mide(r, mas(ref, Math.floor(r.tol_ulps)), ref, true); mide(r, mas(ref, Math.floor(r.tol_ulps) + 1), ref, false);
}
// tramos_por_a (gamma_fuera)
const astar = TOLERANCIAS.gamma_fuera.tramos[2].a_max;
const T = (a, fr = "", ref = 1) => ({ region: "gamma_fuera", fuera_de_rango: fr, args: { a }, ref });
caso("tramos_por_a: a=0.5 -> tramo (0,0.8) relativa 1e-14", T(0.5), "relativa", (1e-14 * 1) / ulp(1));
caso("tramos_por_a: a=0.8 (no pertenece a (0,0.8)) -> sin tramo", T(0.8), "sin_regla");
caso("tramos_por_a: a=2.25 (excluido de (2.25,40]) -> sin tramo", T(2.25), "sin_regla");
caso("tramos_por_a: a=2.2500000000000004 -> tramo (2.25,40]", T(2.2500000000000004), "relativa");
caso("tramos_por_a: a=40 (incluido) -> tramo (2.25,40]", T(40), "relativa");
r = caso("tramos_por_a: a=40.00000000000001 -> lanza pendiente en 'a'", T(40.00000000000001), "lanza");
console.log(`   motivo=${r.motivo} argumento=${r.argumento} ${marca(r.motivo === "pendiente" && r.argumento === "a")}`);
caso("tramos_por_a: a justo bajo a* -> lanza", T(171.62437695630271), "lanza");
caso("tramos_por_a: a >= a* con fuera_de_rango=inf -> P3 (por precedencia)", T(astar, "inf", Infinity), "P3", 0);
// lanza: juicio de la excepcion
console.log("\n-- juzgarFallo (lanza / pendiente en a)");
const rl = regla(T(100));
const mk = (motivo, arg) => new StatsError({ funcion: "gamma", motivo, argumento: arg, valor: 100, region: "gamma_fuera" });
for (const [t, e, d, esp] of [
  ["StatsError pendiente/a", mk("pendiente", "a"), undefined, true],
  ["StatsError dominio/a", mk("dominio", "a"), undefined, false],
  ["StatsError pendiente/x", mk("pendiente", "x"), undefined, false],
  ["TypeError", new TypeError("boom"), undefined, false],
  ["no lanzo (devolvio 1)", undefined, 1, false],
  ["no lanzo (devolvio NaN)", undefined, NaN, false],
]) {
  const j = juzgarFallo(rl, e, d);
  console.log(`   ${t.padEnd(26)} -> ok=${j.ok} clase='${j.clase}'  ${marca(j.ok === esp)}`);
}
// informa_fallo
r = caso("informa_fallo (pgamma_indet)", { region: "pgamma_indet", fuera_de_rango: "", ref: 0 }, "informa_fallo");
console.log(`   motivo=${r.motivo} ${marca(r.motivo === "indeterminado")}`);
// P1
caso("P1 (qnorm_centro)", { region: "qnorm_centro", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
caso("P1 (qt_ngt2)", { region: "qt_ngt2", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
// desconocidas
caso("etiqueta desconocida", { region: "inventada", fuera_de_rango: "", ref: 1 }, "sin_regla");
caso("fuera_de_rango desconocido", { region: "erf_r1", fuera_de_rango: "otro", ref: 1 }, "sin_regla");

console.log(`\nRESULTADO B4: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + ")"}`);
process.exit(fallos ? 1 : 0);
