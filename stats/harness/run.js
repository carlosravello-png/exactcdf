// Arnes: node stats/harness/run.js --funcion <f> [--region <etiqueta>] [--modulo <ruta>]
// Lee tests/fixtures/<f>.csv, llama a la funcion con los argumentos de las columnas <arg>_hex
// (en el orden de reglas.json › dominios), juzga con tolerancia.js y resume por etiqueta.
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { leerCsv, rutaFixture } from "./csv.js";
import { parseHex } from "./hexfloat.js";
import { regla, juzgar, juzgarFallo, TOLERANCIAS, REGLAS } from "./tolerancia.js";

// Copias locales de los globales que run.js usa despues del import() del modulo probado, tomadas aqui
// (antes del import()); despues del import() solo se usan estas. Solo se usan antes del import() y no se copian:
// URL (DIR_INFORMES, MODULO_POR_DEFECTO), Date (base.generado), Set (etiquetasP1), console.error y process.exit(2)
// (uso), process.argv; Infinity y NaN no son reasignables.
const claves = Object.keys;
const deEntradas = Object.fromEntries;
const entradasDe = Object.entries;
const esNaN = Number.isNaN;
const esFinito = Number.isFinite;
const Num = Number;
const abs = Math.abs;
const min = Math.min;
const max = Math.max;
const techo = Math.ceil;
const Txt = String;
const Conj = Set;
const Mapa = Map;
const Err = Error;
const Url = URL;
const jsonStr = JSON.stringify;
const log = console.log;
const logErr = console.error;
const salir = process.exit;

const DIR_INFORMES = new URL("../informes/", import.meta.url);
const MODULO_POR_DEFECTO = new URL("../src/stats.js", import.meta.url);

function opciones(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) o[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") || argv[i + 1] === undefined ? true : argv[++i];
  }
  return o;
}

const fmt = (x) => (x === Infinity ? "Infinity" : esFinito(x) ? (abs(x) >= 1e9 || (x !== 0 && abs(x) < 1e-4) ? x.toExponential(5) : Txt(Num(x.toPrecision(6)))) : Txt(x));
const jsonSeguro = (_k, v) => (typeof v === "number" && !esFinito(v) ? Txt(v) : v);

function terminar(funcion, resultado, informe) {
  const salida = new Url(`_ultimo_${funcion}.json`, DIR_INFORMES);
  writeFileSync(salida, jsonStr(resultado, jsonSeguro, 2) + "\n");
  log(informe);
  log(`(escrito ${resultado.archivo_json})`);
  salir(resultado.veredicto === "VERDE" ? 0 : 1);
}

async function main() {
  const o = opciones(process.argv.slice(2));
  const funcion = o.funcion;
  if (typeof funcion !== "string") {
    console.error("uso: node stats/harness/run.js --funcion <nombre> [--region <etiqueta>] [--modulo <ruta>]");
    process.exit(2);
  }
  const base = { funcion, region_filtrada: typeof o.region === "string" ? o.region : null,
    generado: new Date().toISOString(), archivo_json: `stats/informes/_ultimo_${funcion}.json` };
  const rojo = (motivo, extra = {}) => terminar(funcion, { ...base, veredicto: "ROJO", motivo, etiquetas_rojas: [], etiquetas: {}, ...extra },
    `Funcion: ${funcion}\n${motivo}\nROJO`);

  // fixtures
  const ruta = rutaFixture(funcion);
  if (!existsSync(ruta)) rojo(`no existe tests/fixtures/${funcion}.csv`);
  const { columnas, filas: todas } = leerCsv(ruta);
  const faltan = ["id", "region", "fuera_de_rango", "ref_mp70_hex"].filter((c) => !columnas.includes(c));
  if (faltan.length) rojo(`el CSV de ${funcion} no tiene la(s) columna(s) ${faltan.join(", ")} que exige el arnes`);
  const filas = base.region_filtrada ? todas.filter((f) => f.region === base.region_filtrada) : todas;
  if (filas.length === 0) rojo(`ninguna fila${base.region_filtrada ? " con la etiqueta " + base.region_filtrada : ""}`);

  // P1: el arnes-v1 no lo juzga
  const etiquetasP1 = [...new Set(filas.map((f) => f.region))].filter((e) => TOLERANCIAS[e]?.tipo === "P1");
  if (etiquetasP1.length) {
    rojo(`P1 no implementado en arnes-v1 (etiquetas P1: ${etiquetasP1.join(", ")}); P1 llega con arnes-v2 en la sesion 2`,
      { etiquetas_p1: etiquetasP1 });
  }

  // modulo y funcion
  const rutaModulo = typeof o.modulo === "string" ? pathToFileURL(resolve(o.modulo)) : MODULO_POR_DEFECTO;
  let mod;
  try { mod = await import(rutaModulo.href); } catch (e) {
    rojo(`no se pudo cargar el modulo ${rutaModulo.href}: ${e.message}`);
  }
  // la reserva '_<f>' vale solo para gamma1pm1 (interna); para las demas, sin '<f>' publica es ROJO
  const fn = typeof mod[funcion] === "function" ? mod[funcion]
    : funcion === "gamma1pm1" && typeof mod["_" + funcion] === "function" ? mod["_" + funcion] : null;
  if (fn === null) rojo(`el modulo ${rutaModulo.href} no exporta '${funcion}'${funcion === "gamma1pm1" ? " ni '_gamma1pm1'" : ""}`);
  base.modulo = rutaModulo.href;

  // orden de los argumentos: claves de reglas.json › dominios (gamma1pm1: un solo argumento 'a')
  const dom = REGLAS.dominios[funcion];
  const nombres = dom ? claves(dom).filter((k) => !k.startsWith("_"))
    : columnas.filter((k) => k.endsWith("_hex") && !k.startsWith("ref_")).map((k) => k.slice(0, -4));
  if (!dom && nombres.length !== 1) rojo(`${funcion} no tiene entrada en reglas.json › dominios y sus columnas _hex no son un unico argumento`);
  for (const n of nombres) if (!columnas.includes(n + "_hex")) rojo(`el CSV no tiene la columna ${n}_hex que exige reglas.json › dominios.${funcion}`);
  const conTail = columnas.includes("lower_tail");
  const malTail = conTail ? filas.find((f) => f.lower_tail !== "" && f.lower_tail !== "0" && f.lower_tail !== "1") : undefined;
  if (malTail) rojo(`lower_tail='${malTail.lower_tail}' en la fila id ${malTail.id}: solo se admite vacio, 0 o 1`);

  // juicio fila por fila
  const porEtiqueta = new Mapa();
  const verIds = typeof o.ids === "string" ? new Conj(o.ids.split(",")) : null; // depuracion: --ids 55,56,57
  const detalleIds = [];
  for (const fila of filas) {
    const argsNum = nombres.map((n) => parseHex(fila[n + "_hex"]));
    const args = deEntradas(nombres.map((n, i) => [n, argsNum[i]]));
    const ref = parseHex(fila.ref_mp70_hex);
    const llamada = [...argsNum];
    if (conTail && fila.lower_tail !== "") llamada.push(fila.lower_tail === "1");
    const r = regla({ funcion, region: fila.region, fuera_de_rango: fila.fuera_de_rango, args, ref });

    let ok, ulpsMedido = null, fraccion = null, clase = "ok", detalle = "";
    let devuelto, excepcion;
    try { devuelto = fn(...llamada); } catch (e) { excepcion = e ?? new Err("lanzo un valor falsy"); }

    const sinArg = (r.regla === "lanza" || r.regla === "informa_fallo") && !nombres.includes(r.argumento);
    if (r.regla === "sin_regla" || sinArg) {
      if (sinArg) r.detalle = `argumento '${r.argumento}' no esta en la firma de ${funcion} (${nombres.join(", ")})`;
      ok = false; clase = "sin regla en el arnes"; detalle = r.detalle; ulpsMedido = Infinity;
      if (sinArg) r.regla = "sin_regla";
    } else if (r.regla === "lanza" || r.regla === "informa_fallo") {
      // valor que el arnes paso en el argumento nombrado (en pchisq es nu, no nu/2)
      const j = juzgarFallo(r, excepcion, devuelto, funcion, argsNum[nombres.indexOf(r.argumento)]);
      ok = j.ok; clase = j.clase; detalle = j.detalle;
      if (!ok) ulpsMedido = Infinity;
    } else if (excepcion !== undefined) {
      ok = false; ulpsMedido = Infinity; detalle = `${excepcion.name}: ${excepcion.message}`;
      clase = excepcion.name === "StatsError" ? "StatsError donde la referencia es un numero" : "excepcion no StatsError";
    } else if (typeof devuelto !== "number") {
      ok = false; ulpsMedido = Infinity; clase = "no devolvio number"; detalle = `devolvio ${typeof devuelto}`;
    } else if (esNaN(devuelto)) {
      ok = false; ulpsMedido = Infinity; clase = "NaN"; detalle = "devolvio NaN";
    } else {
      const j = juzgar(r, devuelto, ref);
      ok = j.ok; ulpsMedido = j.ulps; fraccion = j.fraccion;
      if (!ok) { clase = "fuera de tolerancia"; detalle = `x=${devuelto} ref=${ref} ulps=${fmt(j.ulps)} tol=${fmt(j.tol_ulps)}`; }
    }

    if (verIds?.has(fila.id)) {
      detalleIds.push(`  fila id ${fila.id} (${fila.region}${fila.fuera_de_rango ? ", " + fila.fuera_de_rango : ""}): ${ok ? "pasa" : "FALLA"}; regla=${r.regla}; ref=${ref}; devolvio=${excepcion ? excepcion.name : devuelto}; ulps=${ulpsMedido === null ? "-" : fmt(ulpsMedido)}; tol_ulps=${r.tol_ulps === null ? "-" : fmt(r.tol_ulps)}${ok ? "" : "; " + clase}`);
    }

    let e = porEtiqueta.get(fila.region);
    if (!e) porEtiqueta.set(fila.region, (e = { n: 0, pasan: 0, fallan: 0, ulps: [], fracciones: [], peores: [], clases: {}, reglas: new Mapa() }));
    e.n++;
    if (ok) e.pasan++; else { e.fallan++; e.clases[clase] = (e.clases[clase] ?? 0) + 1; }
    if (ulpsMedido !== null) { e.ulps.push(ulpsMedido); e.peores.push({ id: fila.id, ulps: ulpsMedido, ok, clase, detalle }); }
    if (fraccion !== null) e.fracciones.push({ id: fila.id, fraccion });
    const g = e.reglas.get(r.detalle) ?? { n: 0, min: Infinity, max: -Infinity };
    g.n++;
    if (r.tol_ulps !== null) { g.min = min(g.min, r.tol_ulps); g.max = max(g.max, r.tol_ulps); }
    e.reglas.set(r.detalle, g);
  }

  // resumen por etiqueta
  const etiquetas = {};
  const lineas = [];
  lineas.push(`Funcion: ${funcion}   modulo: ${rutaModulo.href}${base.region_filtrada ? "   region: " + base.region_filtrada : ""}`);
  lineas.push(`argumentos (orden de reglas.json): ${nombres.join(", ")}${conTail ? " [+ lower_tail cuando la columna no esta vacia]" : ""}`);
  const rojas = [];
  for (const [etq, e] of [...porEtiqueta.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const orden = [...e.ulps].sort((a, b) => a - b);
    const maxUlps = orden.length ? orden[orden.length - 1] : null;
    const p99 = orden.length ? orden[max(0, techo(0.99 * orden.length) - 1)] : null;
    const peorFraccion = e.fracciones.reduce((m, x) => (m === null || x.fraccion > m.fraccion ? x : m), null);
    const peores = [...e.peores].sort((a, b) => b.ulps - a.ulps || Num(a.id) - Num(b.id)).slice(0, 10);
    const tolerancia = [...e.reglas.entries()].map(([d, g]) =>
      `${d} [n=${g.n}${esFinito(g.min) ? `; tol_ulps ${fmt(g.min)}${g.max !== g.min ? "-" + fmt(g.max) : ""}` : ""}]`);
    etiquetas[etq] = { n: e.n, pasan: e.pasan, fallan: e.fallan, max_ulps: maxUlps, p99_ulps: p99,
      fraccion_tolerancia_peor_fila: peorFraccion, tolerancia_aplicada: tolerancia, fallos_por_clase: e.clases,
      peores_10: peores.map((p) => ({ id: Num(p.id), ulps: p.ulps, ok: p.ok, clase: p.clase })) };
    if (e.fallan > 0) rojas.push(etq);
    lineas.push("");
    lineas.push(`Etiqueta ${etq}: ${e.fallan === 0 ? "pasa" : "ROJA"}`);
    lineas.push(`  n=${e.n}  pasan=${e.pasan}  fallan=${e.fallan}`);
    lineas.push(`  max ulps=${maxUlps === null ? "-" : fmt(maxUlps)}  p99 ulps=${p99 === null ? "-" : fmt(p99)}`);
    lineas.push(`  fraccion de la tolerancia (peor fila)=${peorFraccion ? `${fmt(peorFraccion.fraccion)} (id ${peorFraccion.id})` : "-"}`);
    lineas.push(`  tolerancia aplicada: ${tolerancia.join(" | ")}`);
    if (e.fallan) lineas.push(`  fallos por clase: ${entradasDe(e.clases).map(([k, v]) => `${k}=${v}`).join("; ")}`);
    lineas.push(`  10 peores: ${peores.length ? peores.map((p) => `id ${p.id}: ${fmt(p.ulps)}${p.ok ? "" : " (" + p.clase + ")"}`).join("; ") : "(sin filas numericas)"}`);
    const primerFallo = e.peores.find((p) => !p.ok);
    if (primerFallo) lineas.push(`  ejemplo de fallo: id ${primerFallo.id}: ${primerFallo.detalle}`);
  }
  if (detalleIds.length) { lineas.push(""); lineas.push("Filas pedidas con --ids:"); lineas.push(...detalleIds); }
  lineas.push("");
  const veredicto = rojas.length === 0 ? "VERDE" : "ROJO";
  lineas.push(veredicto === "VERDE" ? "VERDE" : `ROJO (etiquetas rojas: ${rojas.join(", ")})`);
  terminar(funcion, { ...base, veredicto, etiquetas_rojas: rojas, etiquetas }, lineas.join("\n"));
}

main().catch((e) => { logErr("ERROR DEL ARNES:", e); salir(2); });
