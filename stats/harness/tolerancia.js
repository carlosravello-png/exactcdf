// Reglas y umbrales del arnes. Todo numero sale de reglas.json o tolerancias.json
// (precedencia: reglas.json › precedencia); aqui no hay tolerancias copiadas a mano.
import { readFileSync } from "node:fs";
import { ulp, ulps } from "./ulps.js";

const leer = (n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8"));
export const TOLERANCIAS = leer("./tolerancias.json");
export const REGLAS = leer("./reglas.json");

const SUBNORMAL_ULP = Number.MIN_VALUE; // 2^-1074 (reglas.json › medida.ulp)

// reglas.json › P2.subnormal: "|x - ...| <= 2 ulps de subnormal (2 * 2^-1074)": se lee el factor del texto.
const P2_SUBNORMAL_ULPS = (() => {
  const m = /\(\s*(\d+(?:\.\d+)?)\s*\*\s*2\^-1074\s*\)/.exec(REGLAS.P2.subnormal);
  if (m === null) throw new Error("reglas.json › P2.subnormal no tiene la forma '(N * 2^-1074)'");
  return Number(m[1]);
})();

// reglas.json › informa_fallo: "... lance StatsError con motivo indeterminado (D4 v2)"
const MOTIVO_INFORMA_FALLO = (() => {
  const m = /motivo\s+(\w+)/.exec(REGLAS.informa_fallo);
  if (m === null) throw new Error("reglas.json › informa_fallo no nombra un motivo");
  return m[1];
})();

const dentro = (a, t) =>
  (t.a_min === null || (t.incluye_min ? a >= t.a_min : a > t.a_min)) &&
  (t.a_max === null || (t.incluye_max ? a <= t.a_max : a < t.a_max));

function reglaPorEntrada(entrada, ref) {
  switch (entrada.tipo) {
    case "relativa":
      return { regla: "relativa", tol_ulps: (entrada.valor * Math.abs(ref)) / ulp(ref),
        detalle: `relativa ${entrada.valor}` };
    case "ulps":
      return { regla: "ulps", tol_ulps: entrada.valor, detalle: `${entrada.valor} ulps` };
    case "relativa_con_suelo_absoluto":
      return { regla: "relativa_con_suelo_absoluto",
        tol_ulps: Math.max(entrada.relativa * Math.abs(ref), entrada.absoluta) / ulp(ref),
        detalle: `max(${entrada.relativa}*|ref|, ${entrada.absoluta})` };
    case "lanza":
      return { regla: "lanza", tol_ulps: null, motivo: entrada.motivo, detalle: `lanza ${entrada.motivo}` };
    case "informa_fallo":
      return { regla: "informa_fallo", tol_ulps: null, motivo: MOTIVO_INFORMA_FALLO,
        detalle: `informa fallo (${MOTIVO_INFORMA_FALLO})` };
    case "P1":
      return { regla: "no_implementado_en_arnes_v1", tol_ulps: null, detalle: "P1" };
    case "P2":
      return ref === 0 ? reglaP2("cero", ref) : reglaP2("subnormal", ref);
    default:
      return { regla: "sin_regla", tol_ulps: null, detalle: `tipo desconocido '${entrada.tipo}'` };
  }
}

function reglaP2(clase, ref) {
  return clase === "cero"
    ? { regla: "P2_cero", tol_ulps: 0, detalle: "P2: 0 exacto" }
    : { regla: "P2_subnormal", tol_ulps: (P2_SUBNORMAL_ULPS * SUBNORMAL_ULP) / ulp(ref),
        detalle: `P2: ${P2_SUBNORMAL_ULPS} ulps de subnormal` };
}

// fila = {region, fuera_de_rango, args: {nombre: valor}, ref}. Devuelve {regla, tol_ulps, ...}.
export function regla({ region, fuera_de_rango, args, ref }) {
  // precedencia 2: lo decide la referencia
  if (fuera_de_rango === "cero") return reglaP2("cero", ref);
  if (fuera_de_rango === "subnormal") return reglaP2("subnormal", ref);
  if (fuera_de_rango === "inf") return { regla: "P3", tol_ulps: 0, detalle: "P3: +-Infinity exacto" };
  if (fuera_de_rango) return { regla: "sin_regla", tol_ulps: null, detalle: `fuera_de_rango desconocido '${fuera_de_rango}'` };
  // precedencia 3: la entrada de la etiqueta
  const entrada = TOLERANCIAS[region];
  if (entrada === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `etiqueta '${region}' no esta en tolerancias.json` };
  if (entrada.tipo === "tramos_por_a") {
    const arg = /_por_(\w+)$/.exec(entrada.tipo)[1]; // 'a'
    const v = args?.[arg];
    const tramo = entrada.tramos.find((t) => dentro(v, t));
    if (tramo === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `${region}: ${arg}=${v} no cae en ningun tramo` };
    const r = reglaPorEntrada(tramo, ref);
    if (r.regla === "lanza") r.argumento = arg;
    r.detalle = `${region} tramo ${tramo.a}: ${r.detalle}`;
    return r;
  }
  return reglaPorEntrada(entrada, ref);
}

// Juicio de una fila numerica: devuelve {ok, ulps, tol_ulps, fraccion}.
// fraccion = ulps medidos / tol_ulps (0 si ambos son 0; Infinity si tol_ulps = 0 y hay error).
export function juzgar(r, x, ref) {
  const u = ulps(x, ref);
  const t = r.tol_ulps;
  const ok = typeof x === "number" && !Number.isNaN(x) && u <= t;
  const fraccion = t > 0 ? u / t : u === 0 ? 0 : Infinity;
  return { ok, ulps: u, tol_ulps: t, fraccion };
}

// Juicio de una fila 'lanza' / 'informa_fallo': e = excepcion capturada (o undefined si no lanzo).
export function juzgarFallo(r, e, devuelto) {
  if (e === undefined) {
    return { ok: false, clase: "no lanzo", detalle: `devolvio ${String(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
  }
  if (e === null || e.name !== "StatsError") {
    return { ok: false, clase: "excepcion no StatsError", detalle: `${e?.name ?? typeof e}: ${e?.message ?? e}` };
  }
  const motivoOk = e.motivo === r.motivo;
  const argOk = r.argumento === undefined || e.argumento === r.argumento;
  return { ok: motivoOk && argOk, clase: motivoOk && argOk ? "ok" : "StatsError con motivo o argumento distinto",
    detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo}${r.argumento === undefined ? "" : " argumento=" + r.argumento})` };
}
