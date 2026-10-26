// D4 v2 (FIRMADA 21/10/2026): un solo mecanismo, lanzar StatsError; nunca NaN.
// Los dominios y los motivos se leen de stats/harness/reglas.json en tiempo de ejecucion.
import { readFileSync } from "node:fs";

const reglas = JSON.parse(
  readFileSync(new URL("../harness/reglas.json", import.meta.url), "utf8"),
);

// D4 v2 punto 2: los cuatro motivos son constantes de la API (reglas.json › fallo_informado.motivos).
export const MOTIVOS = Object.freeze(Object.keys(reglas.fallo_informado.motivos));

function mostrar(v) {
  if (typeof v === "number") return Object.is(v, -0) ? "-0" : String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function intervalo(d) {
  const lo = d.min === null ? "-Infinity" : String(d.min);
  const hi = d.max === null ? "Infinity" : String(d.max);
  return `${d.incluye_min ? "[" : "("}${lo}, ${hi}${d.incluye_max ? "]" : ")"}`;
}

// D4 v2 punto 2: campos y message en ingles armado desde los campos.
export class StatsError extends RangeError {
  constructor({ funcion, motivo, argumento, valor, dominio = null, region = null }) {
    let message;
    switch (motivo) {
      case "dominio":
        message =
          `${funcion}: argument '${argumento}' = ${mostrar(valor)} is outside the domain` +
          (dominio ? ` ${intervalo(dominio)}` : "");
        break;
      case "tipo":
        message =
          `${funcion}: argument '${argumento}' has the wrong type` +
          ` (got ${mostrar(valor)}; expected ${argumento === "lowerTail" ? "boolean" : "number"})`;
        break;
      case "indeterminado":
        message =
          `${funcion}: result cannot be resolved in double precision` +
          ` for argument '${argumento}' = ${mostrar(valor)}` +
          (region ? ` (region ${region})` : "");
        break;
      case "pendiente":
        message =
          `${funcion}: no method is signed yet for argument '${argumento}' = ${mostrar(valor)}` +
          (region ? ` (region ${region})` : "");
        break;
      default:
        message = `${funcion}: failure with unknown reason '${motivo}' on argument '${argumento}'`;
    }
    super(message);
    this.name = "StatsError"; // fijado en el constructor (D4 v2 punto 2)
    this.funcion = funcion;
    this.motivo = motivo;
    this.argumento = argumento;
    this.valor = valor;
    this.dominio = dominio;
    this.region = region;
  }
}

// reglas.json › dominios: busca el dominio declarado de (funcion, argumento).
export function dominioDe(funcion, nombreArg) {
  const d = reglas.dominios[funcion];
  if (d === undefined || nombreArg.startsWith("_") || !(nombreArg in d)) {
    throw new Error(`reglas.json no declara dominio para ${funcion}.${nombreArg}`);
  }
  return d[nombreArg];
}

// reglas.json › dominios: orden de la firma publica de `funcion`.
export function argumentosDe(funcion) {
  const d = reglas.dominios[funcion];
  return d === undefined ? null : Object.keys(d).filter((k) => !k.startsWith("_"));
}

// Validacion de un argumento numerico (reglas.json › validacion): typeof -> tipo;
// double finito dentro del intervalo, en forma positiva, -0 pertenece si y solo si 0 pertenece.
// `dominio` es opcional: si se omite se lee de reglas.json.
export function validar(funcion, nombreArg, valor, dominio = dominioDe(funcion, nombreArg)) {
  if (typeof valor !== "number") {
    throw new StatsError({ funcion, motivo: "tipo", argumento: nombreArg, valor, dominio });
  }
  const { min, max, incluye_min, incluye_max } = dominio;
  const dentro =
    Number.isFinite(valor) &&
    (min === null || (incluye_min ? valor >= min : valor > min)) &&
    (max === null || (incluye_max ? valor <= max : valor < max));
  if (!dentro) {
    throw new StatsError({ funcion, motivo: "dominio", argumento: nombreArg, valor, dominio });
  }
  return valor;
}

// D4 v2 punto 2: lowerTail omitido o undefined vale true; presente y no booleano -> tipo.
export function validarLowerTail(funcion, valor) {
  if (valor === undefined) return true;
  if (typeof valor !== "boolean") {
    throw new StatsError({ funcion, motivo: "tipo", argumento: "lowerTail", valor });
  }
  return valor;
}
