// Reglas y umbrales del arnes. Todo numero sale de reglas.json o tolerancias.json
// (precedencia: reglas.json › precedencia); aqui no hay tolerancias copiadas a mano.
import { readFileSync } from "node:fs";
import { ulp, ulps } from "./ulps.js";

const leer = (n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8"));
export const TOLERANCIAS = leer("./tolerancias.json");
export const REGLAS = leer("./reglas.json");

const SUBNORMAL_ULP = Number.MIN_VALUE; // 2^-1074 (reglas.json › medida.ulp)

// Paquete 6 (6.1, 6.2): los campos estructurados de reglas.json; si faltan, el arnes no arranca.
const P2_SUBNORMAL_ULPS = REGLAS.P2.subnormal_ulps;
if (typeof P2_SUBNORMAL_ULPS !== "number") throw new Error("reglas.json › P2.subnormal_ulps no es un numero");
const MOTIVO_INFORMA_FALLO = REGLAS.informa_fallo.motivo;
if (typeof MOTIVO_INFORMA_FALLO !== "string") throw new Error("reglas.json › informa_fallo.motivo no es una cadena");

const dentro = (a, t) =>
  (t.a_min === null || (t.incluye_min ? a >= t.a_min : a > t.a_min)) &&
  (t.a_max === null || (t.incluye_max ? a <= t.a_max : a < t.a_max));

function reglaPorEntrada(entrada, ref, funcion) {
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
      return { regla: "lanza", tol_ulps: null, motivo: entrada.motivo, argumento: entrada.argumento,
        detalle: `lanza ${entrada.motivo}` };
    case "informa_fallo": {
      // reglas.json › informa_fallo.argumento[<funcion publica que se prueba>] (paquete 6, 6.3)
      const argumento = REGLAS.informa_fallo.argumento[funcion];
      if (argumento === undefined) {
        return { regla: "sin_regla", tol_ulps: null,
          detalle: `reglas.json › informa_fallo.argumento no tiene entrada para '${funcion}'` };
      }
      return { regla: "informa_fallo", tol_ulps: null, motivo: MOTIVO_INFORMA_FALLO, argumento,
        detalle: `informa fallo (${MOTIVO_INFORMA_FALLO}, argumento ${argumento})` };
    }
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

// fila = {funcion, region, fuera_de_rango, args: {nombre: valor}, ref}; funcion = la publica que se prueba
// (pchisq usa las etiquetas de pgamma, pero su argumento de indeterminado es otro). Devuelve {regla, tol_ulps, ...}.
export function regla({ funcion, region, fuera_de_rango, args, ref }) {
  // precedencia 2: lo decide la referencia
  if (fuera_de_rango === "cero") return reglaP2("cero", ref);
  if (fuera_de_rango === "subnormal") return reglaP2("subnormal", ref);
  if (fuera_de_rango === "inf") return { regla: "P3", tol_ulps: 0, detalle: "P3: +-Infinity exacto" };
  if (fuera_de_rango) return { regla: "sin_regla", tol_ulps: null, detalle: `fuera_de_rango desconocido '${fuera_de_rango}'` };
  // precedencia 3: la entrada de la etiqueta
  const entrada = TOLERANCIAS[region];
  if (entrada === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `etiqueta '${region}' no esta en tolerancias.json` };
  if (entrada.tipo === "tramos_por_a") {
    const arg = entrada.tipo.slice("tramos_por_".length); // AMBIGÜEDAD #10: variable de los tramos = sufijo del nombre del tipo
    const v = args?.[arg];
    const tramo = entrada.tramos.find((t) => dentro(v, t));
    if (tramo === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `${region}: ${arg}=${v} no cae en ningun tramo` };
    const r = reglaPorEntrada(tramo, ref, funcion);
    if (r.regla === "lanza" && typeof r.argumento !== "string") {
      return { regla: "sin_regla", tol_ulps: null, detalle: `${region} tramo ${tramo.a}: falta tolerancias.json › tramos[].argumento` };
    }
    r.detalle = `${region} tramo ${tramo.a}: ${r.detalle}`;
    return r;
  }
  return reglaPorEntrada(entrada, ref, funcion);
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
  const argOk = e.argumento === r.argumento; // los tres campos (name, motivo, argumento), en lanza e informa_fallo
  return { ok: motivoOk && argOk, clase: motivoOk && argOk ? "ok" : "StatsError con motivo o argumento distinto",
    detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
}
