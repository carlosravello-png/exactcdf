# arnes_3 · segunda corrección del arnés tras su auditoría (sesión 0c)

Fecha: 2026-10-26 (hora local de Carlos, UTC−5; convención 7.4). Node v24.22.1. Rama construccion, HEAD 055bb8cc5a6c1fdbf31b594919027e52db941e5b, `git status --short` vacío al empezar. Solo `git rev-parse` y `git status --short`; el diff se sacó con `diff -u` contra copias de respaldo hechas en el directorio temporal (fuera del repo) antes de editar.

## Cambios (solo `tolerancia.js`, `run.js` y `ulps.js`; más `arnes_2.md` para la fecha)
1. **`juzgarFallo` con las seis comprobaciones** de `reglas.json › arnes_fallos` v2, en ese orden: clase (`e instanceof RangeError`), `name`, `funcion`, `motivo`, `argumento`, `Object.is(e.valor, v)`. Firma nueva: `juzgarFallo(r, e, devuelto, funcion, valor)`. `run.js` pasa la función pública probada y el valor que el arnés pasó en el argumento nombrado (`argsNum[nombres.indexOf(r.argumento)]`; en pchisq es ν, no ν/2, porque el arnés pasa los argumentos tal cual los parsea de `<arg>_hex`). **Parte de (1):** si `r.argumento` no está en `nombres` (`indexOf = −1`), la fila es `sin_regla` → fallo (ROJO) con detalle que nombra el argumento y la firma; nunca se calcula `undefined` como valor esperado. Una clase de fallo por comprobación (las dos primeras comparten «excepcion no StatsError», como antes).
2. `run.js` exige las columnas `id`, `region`, `fuera_de_rango` y `ref_mp70_hex`; si falta una, ROJO con mensaje que la nombra (salida 1, escribe `_ultimo_<f>.json`), antes de juzgar nada.
3. `lanza` de primer nivel sin `argumento` de tipo cadena → `sin_regla`. La comprobación pasó a `reglaPorEntrada` (vale para primer nivel y para tramos); se borró la comprobación equivalente que había solo en el camino de tramos.
4. La etiqueta de `tolerancias.json` debe ser de la función probada: `entrada.funcion === funcion`, o `reglas.json › familias[funcion]` igual a la frase completa `usa las etiquetas de <entrada.funcion>`; si no, `sin_regla`. Se comprobó en lectura que todas las etiquetas de las 14 fixtures cumplen esto (incluidas pchisq→pgamma y qchisq→qgamma).
5. `lower_tail` distinto de `""`, `"0"` y `"1"` en las filas seleccionadas → ROJO (mensaje con la primera fila y el valor).
6. `ulps.js` y `tolerancia.js` guardan, al cargarse, copias locales de `Math.abs` y `Number.isNaN` (ulps.js) y de `Math.abs`, `Number.isNaN` y `Object.is` (tolerancia.js) y usan solo esas. `run.js` importa estáticamente ambos módulos antes de cargar el módulo probado (`import()` dinámico).
7. `arnes_2.md`: la fecha 2026-10-26 pasa a 2026-10-25 con una línea que lo dice (convención 7.4).

## Puntos abiertos para el revisor
1. **(4) compara texto.** `reglas.json › familias` es texto libre, no un campo estructurado; el arnés compara `familias[<f>]` con la frase completa «usa las etiquetas de <funcion>» (con `<funcion>` = `entrada.funcion`). Si la frase no coincide exactamente, falla hacia ROJO (`sin_regla`). Una reformulación del texto en `reglas.json` pondría en rojo pchisq y qchisq hasta que se corrija la frase o se estructure el campo. No se anotó en `ambiguedades.md` por indicación expresa.
2. **Copias locales (6) limitadas a lo pedido.** `ulps.js` sigue llamando a `Number.isFinite`, y `tolerancia.js` a `Math.max`, `Array.prototype.find` y a la global `RangeError` (comprobación 1, `instanceof`), todos sin copia local. En `ulps.js` no se copió `Object.is` porque ese módulo no la usa. Si el revisor quiere cerrar también esos usos, es un cambio aparte.
3. **(5) mira solo las filas seleccionadas** (con `--region`, solo las de esa etiqueta), no todo el CSV.
4. **Orden de las comprobaciones de `run.js`:** columnas obligatorias → filas vacías → P1 → carga del módulo → firma/`_hex` → `lower_tail`. Un CSV sin `fuera_de_rango` se rechaza antes de la prueba P1.
5. **`prueba_b4.js` y `prueba_b4_0b.js` no se tocaron.** `prueba_b4_0c.js` es copia de `_0b` con el mínimo cambio: `funcion` en las llamadas a `regla()` que consultan una etiqueta (necesario por (4)) y los dos argumentos nuevos de `juzgarFallo`. Los casos nuevos de las seis comprobaciones van aparte, en `prueba_fallos_0c.js`.
6. **Fecha (resuelto, nota).** La convención 7.4 usa la hora local de Carlos (UTC−5): la sesión 0b corrió la noche del 25 (por eso `arnes_2.md` pasa a 2026-10-25) y esta sesión corre la mañana del 26 (este informe lleva 2026-10-26). Explicación dada por Carlos en el chat.

### Diff de tolerancia.js (antes → ahora)
```diff
--- tolerancia.js (antes)
+++ tolerancia.js (ahora)
@@ -3,6 +3,11 @@
 import { readFileSync } from "node:fs";
 import { ulp, ulps } from "./ulps.js";
 
+// Copias locales, tomadas al cargar (antes de que run.js importe el modulo probado); solo se usan estas.
+const abs = Math.abs;
+const esNaN = Number.isNaN;
+const mismo = Object.is;
+
 const leer = (n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8"));
 export const TOLERANCIAS = leer("./tolerancias.json");
 export const REGLAS = leer("./reglas.json");
@@ -22,15 +27,18 @@
 function reglaPorEntrada(entrada, ref, funcion) {
   switch (entrada.tipo) {
     case "relativa":
-      return { regla: "relativa", tol_ulps: (entrada.valor * Math.abs(ref)) / ulp(ref),
+      return { regla: "relativa", tol_ulps: (entrada.valor * abs(ref)) / ulp(ref),
         detalle: `relativa ${entrada.valor}` };
     case "ulps":
       return { regla: "ulps", tol_ulps: entrada.valor, detalle: `${entrada.valor} ulps` };
     case "relativa_con_suelo_absoluto":
       return { regla: "relativa_con_suelo_absoluto",
-        tol_ulps: Math.max(entrada.relativa * Math.abs(ref), entrada.absoluta) / ulp(ref),
+        tol_ulps: Math.max(entrada.relativa * abs(ref), entrada.absoluta) / ulp(ref),
         detalle: `max(${entrada.relativa}*|ref|, ${entrada.absoluta})` };
     case "lanza":
+      if (typeof entrada.argumento !== "string") {
+        return { regla: "sin_regla", tol_ulps: null, detalle: "lanza sin tolerancias.json › argumento de tipo cadena" };
+      }
       return { regla: "lanza", tol_ulps: null, motivo: entrada.motivo, argumento: entrada.argumento,
         detalle: `lanza ${entrada.motivo}` };
     case "informa_fallo": {
@@ -70,15 +78,16 @@
   // precedencia 3: la entrada de la etiqueta
   const entrada = TOLERANCIAS[region];
   if (entrada === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `etiqueta '${region}' no esta en tolerancias.json` };
+  // la etiqueta debe ser de la funcion probada (entrada.funcion) o de su familia (reglas.json › familias)
+  if (entrada.funcion !== funcion && REGLAS.familias?.[funcion] !== `usa las etiquetas de ${entrada.funcion}`) {
+    return { regla: "sin_regla", tol_ulps: null, detalle: `etiqueta '${region}' es de '${entrada.funcion}', no de '${funcion}'` };
+  }
   if (entrada.tipo === "tramos_por_a") {
     const arg = entrada.tipo.slice("tramos_por_".length); // AMBIGÜEDAD #10: variable de los tramos = sufijo del nombre del tipo
     const v = args?.[arg];
     const tramo = entrada.tramos.find((t) => dentro(v, t));
     if (tramo === undefined) return { regla: "sin_regla", tol_ulps: null, detalle: `${region}: ${arg}=${v} no cae en ningun tramo` };
     const r = reglaPorEntrada(tramo, ref, funcion);
-    if (r.regla === "lanza" && typeof r.argumento !== "string") {
-      return { regla: "sin_regla", tol_ulps: null, detalle: `${region} tramo ${tramo.a}: falta tolerancias.json › tramos[].argumento` };
-    }
     r.detalle = `${region} tramo ${tramo.a}: ${r.detalle}`;
     return r;
   }
@@ -90,21 +99,35 @@
 export function juzgar(r, x, ref) {
   const u = ulps(x, ref);
   const t = r.tol_ulps;
-  const ok = typeof x === "number" && !Number.isNaN(x) && u <= t;
+  const ok = typeof x === "number" && !esNaN(x) && u <= t;
   const fraccion = t > 0 ? u / t : u === 0 ? 0 : Infinity;
   return { ok, ulps: u, tol_ulps: t, fraccion };
 }
 
-// Juicio de una fila 'lanza' / 'informa_fallo': e = excepcion capturada (o undefined si no lanzo).
-export function juzgarFallo(r, e, devuelto) {
+// Juicio de una fila 'lanza' / 'informa_fallo': e = excepcion capturada (o undefined si no lanzo);
+// funcion = la publica que se prueba; valor = lo que el arnes paso en el argumento nombrado.
+// reglas.json › arnes_fallos v2: seis comprobaciones, en ese orden.
+export function juzgarFallo(r, e, devuelto, funcion, valor) {
   if (e === undefined) {
     return { ok: false, clase: "no lanzo", detalle: `devolvio ${String(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
   }
-  if (e === null || e.name !== "StatsError") {
-    return { ok: false, clase: "excepcion no StatsError", detalle: `${e?.name ?? typeof e}: ${e?.message ?? e}` };
+  if (e === null || !(e instanceof RangeError)) { // 1 clase
+    return { ok: false, clase: "excepcion no StatsError", detalle: `no es RangeError: ${e?.name ?? typeof e}: ${e?.message ?? e}` };
+  }
+  if (e.name !== "StatsError") { // 2 name
+    return { ok: false, clase: "excepcion no StatsError", detalle: `${e.name}: ${e.message}` };
+  }
+  if (e.funcion !== funcion) { // 3 funcion
+    return { ok: false, clase: "StatsError con funcion distinta", detalle: `funcion=${e.funcion} (esperado ${funcion})` };
+  }
+  const motivoOk = e.motivo === r.motivo; // 4 motivo
+  const argOk = e.argumento === r.argumento; // 5 argumento
+  if (!(motivoOk && argOk)) {
+    return { ok: false, clase: "StatsError con motivo o argumento distinto",
+      detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
+  }
+  if (!mismo(e.valor, valor)) { // 6 valor (distingue -0 y NaN)
+    return { ok: false, clase: "StatsError con valor distinto", detalle: `valor=${String(e.valor)} (esperado ${String(valor)})` };
   }
-  const motivoOk = e.motivo === r.motivo;
-  const argOk = e.argumento === r.argumento; // los tres campos (name, motivo, argumento), en lanza e informa_fallo
-  return { ok: motivoOk && argOk, clase: motivoOk && argOk ? "ok" : "StatsError con motivo o argumento distinto",
-    detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
+  return { ok: true, clase: "ok", detalle: `motivo=${e.motivo} argumento=${e.argumento} valor=${String(e.valor)}` };
 }
```

### Diff de run.js (antes → ahora)
```diff
--- run.js (antes)
+++ run.js (ahora)
@@ -46,6 +46,8 @@
   const ruta = rutaFixture(funcion);
   if (!existsSync(ruta)) rojo(`no existe tests/fixtures/${funcion}.csv`);
   const { columnas, filas: todas } = leerCsv(ruta);
+  const faltan = ["id", "region", "fuera_de_rango", "ref_mp70_hex"].filter((c) => !columnas.includes(c));
+  if (faltan.length) rojo(`el CSV de ${funcion} no tiene la(s) columna(s) ${faltan.join(", ")} que exige el arnes`);
   const filas = base.region_filtrada ? todas.filter((f) => f.region === base.region_filtrada) : todas;
   if (filas.length === 0) rojo(`ninguna fila${base.region_filtrada ? " con la etiqueta " + base.region_filtrada : ""}`);
 
@@ -75,6 +77,8 @@
   if (!dom && nombres.length !== 1) rojo(`${funcion} no tiene entrada en reglas.json › dominios y sus columnas _hex no son un unico argumento`);
   for (const n of nombres) if (!columnas.includes(n + "_hex")) rojo(`el CSV no tiene la columna ${n}_hex que exige reglas.json › dominios.${funcion}`);
   const conTail = columnas.includes("lower_tail");
+  const malTail = conTail ? filas.find((f) => f.lower_tail !== "" && f.lower_tail !== "0" && f.lower_tail !== "1") : undefined;
+  if (malTail) rojo(`lower_tail='${malTail.lower_tail}' en la fila id ${malTail.id}: solo se admite vacio, 0 o 1`);
 
   // juicio fila por fila
   const porEtiqueta = new Map();
@@ -92,10 +96,14 @@
     let devuelto, excepcion;
     try { devuelto = fn(...llamada); } catch (e) { excepcion = e ?? new Error("lanzo un valor falsy"); }
 
-    if (r.regla === "sin_regla") {
+    const sinArg = (r.regla === "lanza" || r.regla === "informa_fallo") && !nombres.includes(r.argumento);
+    if (r.regla === "sin_regla" || sinArg) {
+      if (sinArg) r.detalle = `argumento '${r.argumento}' no esta en la firma de ${funcion} (${nombres.join(", ")})`;
       ok = false; clase = "sin regla en el arnes"; detalle = r.detalle; ulpsMedido = Infinity;
+      if (sinArg) r.regla = "sin_regla";
     } else if (r.regla === "lanza" || r.regla === "informa_fallo") {
-      const j = juzgarFallo(r, excepcion, devuelto);
+      // valor que el arnes paso en el argumento nombrado (en pchisq es nu, no nu/2)
+      const j = juzgarFallo(r, excepcion, devuelto, funcion, argsNum[nombres.indexOf(r.argumento)]);
       ok = j.ok; clase = j.clase; detalle = j.detalle;
       if (!ok) ulpsMedido = Infinity;
     } else if (excepcion !== undefined) {
```

### Diff de ulps.js (antes → ahora)
```diff
--- ulps.js (antes)
+++ ulps.js (ahora)
@@ -1,6 +1,10 @@
 // Medida unica del arnes (reglas.json › medida): ulps(x, ref) = |x - ref| / ulp(ref).
 // Todo por bits (Float64Array / BigUint64Array), sin aritmetica decimal.
 
+// Copias locales, tomadas al cargar (antes de que run.js importe el modulo probado); solo se usan estas.
+const abs = Math.abs;
+const esNaN = Number.isNaN;
+
 const F = new Float64Array(1);
 const U = new BigUint64Array(F.buffer);
 
@@ -11,22 +15,22 @@
 
 // ulp(ref): para 2^e <= |ref| < 2^(e+1), 2^(e-52); en 0 y subnormales, 2^-1074.
 export function ulp(ref) {
-  if (Number.isNaN(ref)) return NaN;
+  if (esNaN(ref)) return NaN;
   if (!Number.isFinite(ref)) return Infinity;
   const e = Number((bits(ref) >> 52n) & 0x7ffn); // campo de exponente; 0 = cero o subnormal
   return e === 0 ? MIN_SUBNORMAL : 2 ** (e - 1075);
 }
 
 export function ulps(x, ref) {
-  if (typeof x !== "number" || Number.isNaN(x) || Number.isNaN(ref)) return Infinity;
+  if (typeof x !== "number" || esNaN(x) || esNaN(ref)) return Infinity;
   if (x === ref) return 0;
   if (!Number.isFinite(x) || !Number.isFinite(ref)) return Infinity;
-  return Math.abs(x - ref) / ulp(ref);
+  return abs(x - ref) / ulp(ref);
 }
 
 // Siguiente double desde x hacia `hacia` (+-Infinity o cualquier numero).
 export function nextafter(x, hacia) {
-  if (Number.isNaN(x) || Number.isNaN(hacia)) return NaN;
+  if (esNaN(x) || esNaN(hacia)) return NaN;
   if (x === hacia) return hacia;
   if (x === 0) return hacia > 0 ? MIN_SUBNORMAL : -MIN_SUBNORMAL;
   const b = bits(x);
```

### Diff de arnes_2.md (punto 7)
```diff
--- arnes_2.md (antes)
+++ arnes_2.md (ahora)
@@ -1,6 +1,6 @@
 # arnes_2 · corrección del arnés antes de congelarlo (sesión 0b)
 
-Fecha: 2026-10-26. Node v24.22.1. Rama construccion, HEAD 0c6010c95eb1febbc5c1885d82364171c7bf5a57, `git status --short` vacío al empezar. Sin más git.
+Fecha: 2026-10-25 (corregida en la sesión 0c; decía 2026-10-26; convención 7.4). Node v24.22.1. Rama construccion, HEAD 0c6010c95eb1febbc5c1885d82364171c7bf5a57, `git status --short` vacío al empezar. Sin más git.
 
 ## Cambios (solo `tolerancia.js` y `run.js`)
 1. P2 subnormal: el límite sale de `reglas.json › P2.subnormal_ulps` (6.1).
```

### Diff entre prueba_b4_0b.js y prueba_b4_0c.js
```diff
--- prueba_b4_0b.js
+++ prueba_b4_0c.js
@@ -41,28 +41,28 @@
 mide(r, -Infinity, -Infinity, true); mide(r, Infinity, -Infinity, false);
 // relativa
 const e1 = TOLERANCIAS.erf_r1.valor;
-r = caso(`relativa ${e1} (erf_r1), ref=0.5`, { region: "erf_r1", fuera_de_rango: "", ref: 0.5 }, "relativa", (t) => t === (e1 * 0.5) / ulp(0.5));
+r = caso(`relativa ${e1} (erf_r1), ref=0.5`, { funcion: "erf", region: "erf_r1", fuera_de_rango: "", ref: 0.5 }, "relativa", (t) => t === (e1 * 0.5) / ulp(0.5));
 mide(r, mas(0.5, 4), 0.5, true); mide(r, mas(0.5, 5), 0.5, false);
-r = caso("relativa con ref = 0 (erf id 55: tol 0)", { region: "erf_r1", fuera_de_rango: "", ref: 0 }, "relativa", 0);
+r = caso("relativa con ref = 0 (erf id 55: tol 0)", { funcion: "erf", region: "erf_r1", fuera_de_rango: "", ref: 0 }, "relativa", 0);
 mide(r, 0, 0, true); mide(r, Number.MIN_VALUE, 0, false);
-r = caso("relativa en el limite de binada, ref=1e-3", { region: "gamma1pm1_c", fuera_de_rango: "", ref: 1e-3 }, "relativa");
+r = caso("relativa en el limite de binada, ref=1e-3", { funcion: "gamma1pm1", region: "gamma1pm1_c", fuera_de_rango: "", ref: 1e-3 }, "relativa");
 mide(r, mas(1e-3, Math.floor(r.tol_ulps)), 1e-3, true); mide(r, mas(1e-3, Math.floor(r.tol_ulps) + 1), 1e-3, false);
 // ulps
 const tt = TOLERANCIAS.pgamma_temme.valor;
-r = caso(`ulps ${tt} (pgamma_temme)`, { region: "pgamma_temme", fuera_de_rango: "", ref: 3.5 }, "ulps", tt);
+r = caso(`ulps ${tt} (pgamma_temme)`, { funcion: "pgamma", region: "pgamma_temme", fuera_de_rango: "", ref: 3.5 }, "ulps", tt);
 mide(r, mas(3.5, tt), 3.5, true); mide(r, mas(3.5, tt + 1), 3.5, false);
 // relativa con suelo absoluto
 const L = TOLERANCIAS.lgamma_d;
 for (const ref of [1e-3, 10]) {
   const esp = Math.max(L.relativa * Math.abs(ref), L.absoluta) / ulp(ref);
   r = caso(`relativa_con_suelo_absoluto (lgamma_d): max(${L.relativa}*|ref|, ${L.absoluta}), ref=${ref}`,
-    { region: "lgamma_d", fuera_de_rango: "", ref }, "relativa_con_suelo_absoluto", (t) => t === esp);
+    { funcion: "lgamma", region: "lgamma_d", fuera_de_rango: "", ref }, "relativa_con_suelo_absoluto", (t) => t === esp);
   console.log(`   (rama dominante: ${L.relativa * Math.abs(ref) >= L.absoluta ? "relativa" : "suelo absoluto"})`);
   mide(r, mas(ref, Math.floor(r.tol_ulps)), ref, true); mide(r, mas(ref, Math.floor(r.tol_ulps) + 1), ref, false);
 }
 // tramos_por_a (gamma_fuera)
 const astar = TOLERANCIAS.gamma_fuera.tramos[2].a_max;
-const T = (a, fr = "", ref = 1) => ({ region: "gamma_fuera", fuera_de_rango: fr, args: { a }, ref });
+const T = (a, fr = "", ref = 1) => ({ funcion: "gamma", region: "gamma_fuera", fuera_de_rango: fr, args: { a }, ref });
 caso("tramos_por_a: a=0.5 -> tramo (0,0.8) relativa 1e-14", T(0.5), "relativa", (1e-14 * 1) / ulp(1));
 caso("tramos_por_a: a=0.8 (no pertenece a (0,0.8)) -> sin tramo", T(0.8), "sin_regla");
 caso("tramos_por_a: a=2.25 (excluido de (2.25,40]) -> sin tramo", T(2.25), "sin_regla");
@@ -84,15 +84,15 @@
   ["no lanzo (devolvio 1)", undefined, 1, false],
   ["no lanzo (devolvio NaN)", undefined, NaN, false],
 ]) {
-  const j = juzgarFallo(rl, e, d);
+  const j = juzgarFallo(rl, e, d, "gamma", 100);
   console.log(`   ${t.padEnd(26)} -> ok=${j.ok} clase='${j.clase}'  ${marca(j.ok === esp)}`);
 }
 // informa_fallo
 r = caso("informa_fallo (pgamma_indet)", { funcion: "pgamma", region: "pgamma_indet", fuera_de_rango: "", ref: 0 }, "informa_fallo");
 console.log(`   motivo=${r.motivo} ${marca(r.motivo === "indeterminado")}`);
 // P1
-caso("P1 (qnorm_centro)", { region: "qnorm_centro", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
-caso("P1 (qt_ngt2)", { region: "qt_ngt2", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
+caso("P1 (qnorm_centro)", { funcion: "qnorm", region: "qnorm_centro", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
+caso("P1 (qt_ngt2)", { funcion: "qt", region: "qt_ngt2", fuera_de_rango: "", ref: 1 }, "no_implementado_en_arnes_v1");
 // desconocidas
 caso("etiqueta desconocida", { region: "inventada", fuera_de_rango: "", ref: 1 }, "sin_regla");
 caso("fuera_de_rango desconocido", { region: "erf_r1", fuera_de_rango: "otro", ref: 1 }, "sin_regla");
```

## Salidas completas

### A · node stats/harness/_fakes/prueba_error.js
```
== 1. Un StatsError por motivo, con todos sus campos
motivos leidos de reglas.json: dominio, tipo, indeterminado, pendiente
{"name":"StatsError","funcion":"pgamma","motivo":"dominio","argumento":"a","valor":0,"dominio":{"min":0,"max":null,"incluye_min":false,"incluye_max":false},"region":null,"message":"pgamma: argument 'a' = 0 is outside the domain (0, Infinity)"}
  motivo dominio: PASA
{"name":"StatsError","funcion":"erf","motivo":"tipo","argumento":"x","valor":"0.5","dominio":null,"region":null,"message":"erf: argument 'x' has the wrong type (got \"0.5\"; expected number)"}
  motivo tipo: PASA
{"name":"StatsError","funcion":"pgamma","motivo":"indeterminado","argumento":"x","valor":1e+300,"dominio":null,"region":"pgamma_indet","message":"pgamma: result cannot be resolved in double precision for argument 'x' = 1e+300 (region pgamma_indet)"}
  motivo indeterminado: PASA
{"name":"StatsError","funcion":"gamma","motivo":"pendiente","argumento":"a","valor":100,"dominio":null,"region":"gamma_fuera","message":"gamma: no method is signed yet for argument 'a' = 100 (region gamma_fuera)"}
  motivo pendiente: PASA
motivos cubiertos == los de reglas.json: PASA

== 2. validar(...)
  rechaza erf.x = NaN (dominio): PASA  -> erf: argument 'x' = NaN is outside the domain (-Infinity, Infinity)
  rechaza erf.x = Infinity (dominio): PASA  -> erf: argument 'x' = Infinity is outside the domain (-Infinity, Infinity)
  rechaza erf.x = -Infinity (dominio): PASA  -> erf: argument 'x' = -Infinity is outside the domain (-Infinity, Infinity)
  rechaza erf.x = "0.5" (tipo): PASA  -> erf: argument 'x' has the wrong type (got "0.5"; expected number)
  rechaza erf.x = null (tipo): PASA  -> erf: argument 'x' has the wrong type (got null; expected number)
  acepta  erf.x = -0: PASA
  acepta  erf.x = 0: PASA
  rechaza gamma.a = -0 (dominio): PASA  -> gamma: argument 'a' = -0 is outside the domain (0, Infinity)
  rechaza gamma.a = 0 (dominio): PASA  -> gamma: argument 'a' = 0 is outside the domain (0, Infinity)
  rechaza gamma.a = -1 (dominio): PASA  -> gamma: argument 'a' = -1 is outside the domain (0, Infinity)
  acepta  gamma.a = 5e-324: PASA
  acepta  pgamma.x = -0: PASA
  acepta  pgamma.x = 0: PASA
  rechaza pgamma.x = -5e-324 (dominio): PASA  -> pgamma: argument 'x' = -5e-324 is outside the domain [0, Infinity)
  acepta  pbeta.x = 1: PASA
  rechaza pbeta.x = 1.0000000000000002 (dominio): PASA  -> pbeta: argument 'x' = 1.0000000000000002 is outside the domain [0, 1]
  rechaza qnorm.p = 0 (dominio): PASA  -> qnorm: argument 'p' = 0 is outside the domain (0, 1)
  rechaza qnorm.p = 1 (dominio): PASA  -> qnorm: argument 'p' = 1 is outside the domain (0, 1)
  acepta  qnorm.p = 0.5: PASA
  2**-1073 === parametro_min.valor de reglas.json: PASA
  acepta  pchisq.nu = 1e-323: PASA
  rechaza pchisq.nu = 5e-324 (dominio): PASA  -> pchisq: argument 'nu' = 5e-324 is outside the domain [1e-323, Infinity)
  acepta  pt.n = 1e-323: PASA
  rechaza pt.n = 5e-324 (dominio): PASA  -> pt: argument 'n' = 5e-324 is outside the domain [1e-323, Infinity)
  dominio explicito [0,3) acepta 2.5: PASA
  dominio explicito [0,3) rechaza 3: PASA  -> prueba: argument 'z' = 3 is outside the domain [0, 3)
  funcion sin dominio en reglas.json lanza Error comun (defecto del llamador): PASA

== 3. validarLowerTail(...)
  acepta undefined -> true: PASA
  acepta true -> true: PASA
  acepta false -> false: PASA
  rechaza 1 (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got 1; expected boolean)
  rechaza "true" (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got "true"; expected boolean)
  rechaza null (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got null; expected boolean)
  rechaza 0 (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got 0; expected boolean)
  rechaza NaN (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got NaN; expected boolean)

RESULTADO: PASA
```

### B1 · prueba_b1.js
```
== B1.0 casos sueltos del parser
  0x1.0000000000000p+0       -> PASA  (1)
  -0x1.8000000000000p+1      -> PASA  (-3)
  0x0.0000000000001p-1022    -> PASA  (5e-324)
  0x0.0p+0                   -> PASA  (0)
  -0x0.0p+0                  -> PASA  (-0)
  0x1.fffffffffffffp+1023    -> PASA  (1.7976931348623157e+308)
  0x1.0000000000000p-1022    -> PASA  (2.2250738585072014e-308)
  0x0.4000000000000p-1022    -> PASA  (5.562684646268003e-309)
  inf                        -> PASA  (Infinity)
  -inf                       -> PASA  (-Infinity)
  Inf                        -> PASA  (Infinity)
  nan                        -> PASA  (NaN)

== B1.1 erf.csv  (1575 filas; argumentos: x)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1575 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: '', 'subnormal'
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 2 filas; ejemplo id 56 region erf_r1 x=-0x0.0000000000001p-1022 ref_mp70=-5.57493381944852271267550929624e-324 ref_mp70_hex=-0x0.0000000000001p-1022 -> -5e-324 (-0x0.0000000000001p-1022)
  fuera_de_rango=inf: 0 filas; sin ejemplo

== B1.1 gamma.csv  (1018 filas; argumentos: a)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1018 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: ''
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 0 filas; sin ejemplo
  fuera_de_rango=inf: 0 filas; sin ejemplo

== B1.1 qt.csv  (1560 filas; argumentos: p, n)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1560 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: '', 'inf'
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 0 filas; sin ejemplo
  fuera_de_rango=inf: 120 filas; ejemplo id 1063 region qt_resto p=0x1.4e8031fc7cb72p-387 n=0x1.065a51eca88bap-9 ref_mp70=7.32290524273104261460169365545e+57992 ref_mp70_hex=inf -> Infinity (inf)

RESULTADO B1: PASA
```

### B2 · prueba_b2.js
```
== B2.1 ulps(nextafter(r, +inf), r) === 1
  r=1                        nextafter=1.0000000000000002       ulp(r)=2.220446049250313e-16    ulps=1  PASA
  r=0.1                      nextafter=0.10000000000000002      ulp(r)=1.3877787807814457e-17   ulps=1  PASA
  r=3.5                      nextafter=3.5000000000000004       ulp(r)=4.440892098500626e-16    ulps=1  PASA
  r=1e+300                   nextafter=1.0000000000000002e+300  ulp(r)=1.487016908477783e+284   ulps=1  PASA
  r=9.332636185032189e-302   nextafter=9.33263618503219e-302    ulp(r)=2.0722615e-317           ulps=1  PASA
  r=2.2250738585072014e-308  nextafter=2.225073858507202e-308   ulp(r)=5e-324                   ulps=1  PASA
  r=5e-324                   nextafter=1e-323                   ulp(r)=5e-324                   ulps=1  PASA
  r=0                        nextafter=5e-324                   ulp(r)=5e-324                   ulps=1  PASA
  r=-7.25                    nextafter=-7.249999999999999       ulp(r)=8.881784197001252e-16    ulps=1  PASA

== B2.2 ulps(r, r) === 0
  r=1  ulps=0  PASA
  r=0.1  ulps=0  PASA
  r=-7.25  ulps=0  PASA
  r=0  ulps=0  PASA
  r=5e-324  ulps=0  PASA
  r=1e+300  ulps=0  PASA

== B2.3 cruce de binada (la medida usa el ulp de la referencia)
  ulps(nextafter(2,-inf), 2) = 0.5  (esperado 0.5 = 2^-52 / 2^-51)  PASA
  ulps(2, nextafter(2,-inf)) = 1  (esperado 1 = 2^-52 / ulp(2-2^-52)=2^-52)  PASA
  ulps(mayor subnormal, 2^-1022) = 1  PASA

== B2.4 no finitos
  ulps(Infinity, 1) = Infinity  PASA
  ulps(NaN, 1) = Infinity  PASA
  ulps(-Infinity, 1) = Infinity  PASA
  ulps(Infinity, Infinity) = 0  PASA

== B2.5 ulp(ref) por casos (potencias de 2: 2^(e-52); cero y subnormales 2^-1074)
  ulp(1) = 2.220446049250313e-16  PASA
  ulp(1.5) = 2.220446049250313e-16  PASA
  ulp(2) = 4.440892098500626e-16  PASA
  ulp(0.5) = 1.1102230246251565e-16  PASA
  ulp(0) = 5e-324  PASA
  ulp(5e-324) = 5e-324  PASA
  ulp(2.2250738585072014e-308) = 5e-324  PASA
  ulp(1.7976931348623157e+308) = 1.99584030953472e+292  PASA
  ulp(-7.25) = 8.881784197001252e-16  PASA

== B2.6 nextafter hacia abajo y por el cero
  nextafter(2^-1074, -inf) = 0  PASA
  nextafter(0, -inf) = -5e-324  PASA
  nextafter(-7.25, +inf) hacia cero; ulps = 1  PASA
  nextafter(MAX_VALUE, +inf) = Infinity  PASA

RESULTADO B2: PASA
```

### B3 · prueba_b3.js
```
== B3.1 CSV de tests/fixtures cuyo nombre no empieza por '_': 14  PASA
  erf        filas= 1575  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  erfc       filas= 3448  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  gamma      filas= 1018  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  gamma1pm1  filas=  516  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  lgamma     filas= 1542  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  pbeta      filas= 8266  lineas '#'=10  columnas=27  ids 1..n correlativos: true  ancho uniforme: true
  pchisq     filas= 2170  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  pgamma     filas= 7902  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  pnorm      filas= 4870  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  pt         filas=  500  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qchisq     filas= 1244  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qgamma     filas= 1544  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qnorm      filas= 1027  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  qt         filas= 1560  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  suma total de filas = 37182  (esperado 37182)  PASA

== B3.2 cabecera '#' como texto (erf.csv)
# funcion: erf
# fecha_generacion: 2026-10-13
# python: 3.13.16   mpmath: 1.3.0   backend: gmpy   gmpy2: 2.3.2
# R: R version 4.6.1 (2026-06-24 ucrt)   (sessionInfo() completo en tests/fixtures/_sessioninfo_R.txt)
# semilla: 2026101301
# sha256_gen_puntos.py: 65e4263b41ae71f15897bf5311481cf4bffde93fb1c5c3e03bbabf4dc61db9eb
# sha256_ref_r.R: 895a6eb5fa09b49becbb470290d5306edd1be9894197800ac593fe5ff070c56a
# sha256_ref_mpmath.py: 326e37f92c0cdfb7932f3a0254026abeded4795357d2745d40afb6167563b788
# K_ulps: 64   umbral_cifras_50_70: 25   cifras_quad: 20
# filas_ok: 1575   filas_dificil: 0   filas_r_discrepa: 0   filas_dps_adaptativo: 14

== B3.3 filas por nombre de columna (erf, id 56)
{"id":"56","region":"erf_r1","x":"-4.9406564584124654e-324","lower_tail":"","ref_mp50":"-5.57493381944852271267550929624e-324","ref_mp70":"-5.57493381944852271267550929624e-324","ref_r":"","dps_usado":"374","cifras_50_70":"30","ulps_r":"","r_discrepa":"","tercera_via":"COINCIDE","ref_quad":"-5.57493381944852271267550929624e-324","err_quad":"1.1284e-423","decision_manual":"","origen":"frontera","estado":"OK","valor_fuente":"","cifras_fuente":"","fuera_de_rango":"subnormal","x_hex":"-0x0.0000000000001p-1022","ref_mp70_hex":"-0x0.0000000000001p-1022","ref_r_hex":""}

== B3.4 '_dificiles.csv' y carpetas '_*' no se leen
  listarFixtures() no incluye nada con '_': PASA

RESULTADO B3: PASA
```

### B4 · prueba_b4_0c.js (exit 0)
```
== B4 precedencia (reglas.json): 2) fuera_de_rango manda; 3) la etiqueta
   P2.subnormal = |x - double de la referencia| <= 2 ulps de subnormal (2 * 2^-1074)

-- P2 cero
   region=erfc_r3 fuera_de_rango='cero' ref=0.00000
   regla=P2_cero  tol_ulps=0.00000  motivo=- argumento=-  [P2: 0 exacto]  PASA
   x=0.00000: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=4.94066e-324: ulps=1.00000 tol=0.00000 fraccion=Infinity ok=false  PASA

-- P2 subnormal (2 ulps de subnormal)
   region=erfc_r3 fuera_de_rango='subnormal' ref=2.47033e-323
   regla=P2_subnormal  tol_ulps=2.00000  motivo=- argumento=-  [P2: 2 ulps de subnormal]  PASA
   x=3.45846e-323: ulps=2.00000 tol=2.00000 fraccion=1.00000 ok=true  PASA
   x=3.95253e-323: ulps=3.00000 tol=2.00000 fraccion=1.50000 ok=false  PASA
   x=0.00000: ulps=5.00000 tol=2.00000 fraccion=2.50000 ok=false  PASA

-- precedencia: erf_r1 (relativa) con ref subnormal -> P2
   region=erf_r1 fuera_de_rango='subnormal' ref=4.94066e-324
   regla=P2_subnormal  tol_ulps=2.00000  motivo=- argumento=-  [P2: 2 ulps de subnormal]  PASA
   x=0.00000: ulps=1.00000 tol=2.00000 fraccion=0.500000 ok=true  PASA

-- P3 inf (+)
   region=qt_resto fuera_de_rango='inf' ref=Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA
   x=Infinity: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=1.79769e+308: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA
   x=-Infinity: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA
   x=NaN: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA

-- P3 inf (-)
   region=qt_resto fuera_de_rango='inf' ref=-Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA
   x=-Infinity: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=Infinity: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA

-- relativa 1e-15 (erf_r1), ref=0.5
   region=erf_r1 fuera_de_rango='' ref=0.500000
   regla=relativa  tol_ulps=4.50360  motivo=- argumento=-  [relativa 1e-15]  PASA
   x=0.500000: ulps=4.00000 tol=4.50360 fraccion=0.888178 ok=true  PASA
   x=0.500000: ulps=5.00000 tol=4.50360 fraccion=1.11022 ok=false  PASA

-- relativa con ref = 0 (erf id 55: tol 0)
   region=erf_r1 fuera_de_rango='' ref=0.00000
   regla=relativa  tol_ulps=0.00000  motivo=- argumento=-  [relativa 1e-15]  PASA
   x=0.00000: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=4.94066e-324: ulps=1.00000 tol=0.00000 fraccion=Infinity ok=false  PASA

-- relativa en el limite de binada, ref=1e-3
   region=gamma1pm1_c fuera_de_rango='' ref=0.00100000
   regla=relativa  tol_ulps=92.2337  motivo=- argumento=-  [relativa 2e-14]  PASA
   x=0.00100000: ulps=92.0000 tol=92.2337 fraccion=0.997466 ok=true  PASA
   x=0.00100000: ulps=93.0000 tol=92.2337 fraccion=1.00831 ok=false  PASA

-- ulps 1232 (pgamma_temme)
   region=pgamma_temme fuera_de_rango='' ref=3.50000
   regla=ulps  tol_ulps=1232.00  motivo=- argumento=-  [1232 ulps]  PASA
   x=3.50000: ulps=1232.00 tol=1232.00 fraccion=1.00000 ok=true  PASA
   x=3.50000: ulps=1233.00 tol=1232.00 fraccion=1.00081 ok=false  PASA

-- relativa_con_suelo_absoluto (lgamma_d): max(1e-14*|ref|, 2.9e-16), ref=0.001
   region=lgamma_d fuera_de_rango='' ref=0.00100000
   regla=relativa_con_suelo_absoluto  tol_ulps=1337.39  motivo=- argumento=-  [max(1e-14*|ref|, 2.9e-16)]  PASA
   (rama dominante: suelo absoluto)
   x=0.00100000: ulps=1337.00 tol=1337.39 fraccion=0.999709 ok=true  PASA
   x=0.00100000: ulps=1338.00 tol=1337.39 fraccion=1.00046 ok=false  PASA

-- relativa_con_suelo_absoluto (lgamma_d): max(1e-14*|ref|, 2.9e-16), ref=10
   region=lgamma_d fuera_de_rango='' ref=10.0000
   regla=relativa_con_suelo_absoluto  tol_ulps=56.2950  motivo=- argumento=-  [max(1e-14*|ref|, 2.9e-16)]  PASA
   (rama dominante: relativa)
   x=10.0000: ulps=56.0000 tol=56.2950 fraccion=0.994760 ok=true  PASA
   x=10.0000: ulps=57.0000 tol=56.2950 fraccion=1.01252 ok=false  PASA

-- tramos_por_a: a=0.5 -> tramo (0,0.8) relativa 1e-14
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (0, 0.8): relativa 1e-14]  PASA

-- tramos_por_a: a=0.8 (no pertenece a (0,0.8)) -> sin tramo
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [gamma_fuera: a=0.8 no cae en ningun tramo]  PASA

-- tramos_por_a: a=2.25 (excluido de (2.25,40]) -> sin tramo
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [gamma_fuera: a=2.25 no cae en ningun tramo]  PASA

-- tramos_por_a: a=2.2500000000000004 -> tramo (2.25,40]
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (2.25, 40]: relativa 1e-14]  PASA

-- tramos_por_a: a=40 (incluido) -> tramo (2.25,40]
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (2.25, 40]: relativa 1e-14]  PASA

-- tramos_por_a: a=40.00000000000001 -> lanza pendiente en 'a'
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=lanza  tol_ulps=-  motivo=pendiente argumento=a  [gamma_fuera tramo (40, a*): lanza pendiente]  PASA
   motivo=pendiente argumento=a PASA

-- tramos_por_a: a justo bajo a* -> lanza
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=lanza  tol_ulps=-  motivo=pendiente argumento=a  [gamma_fuera tramo (40, a*): lanza pendiente]  PASA

-- tramos_por_a: a >= a* con fuera_de_rango=inf -> P3 (por precedencia)
   region=gamma_fuera fuera_de_rango='inf' ref=Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA

-- juzgarFallo (lanza / pendiente en a)
   StatsError pendiente/a     -> ok=true clase='ok'  PASA
   StatsError dominio/a       -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   StatsError pendiente/x     -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   TypeError                  -> ok=false clase='excepcion no StatsError'  PASA
   no lanzo (devolvio 1)      -> ok=false clase='no lanzo'  PASA
   no lanzo (devolvio NaN)    -> ok=false clase='no lanzo'  PASA

-- informa_fallo (pgamma_indet)
   region=pgamma_indet fuera_de_rango='' ref=0.00000
   regla=informa_fallo  tol_ulps=-  motivo=indeterminado argumento=a  [informa fallo (indeterminado, argumento a)]  PASA
   motivo=indeterminado PASA

-- P1 (qnorm_centro)
   region=qnorm_centro fuera_de_rango='' ref=1.00000
   regla=no_implementado_en_arnes_v1  tol_ulps=-  motivo=- argumento=-  [P1]  PASA

-- P1 (qt_ngt2)
   region=qt_ngt2 fuera_de_rango='' ref=1.00000
   regla=no_implementado_en_arnes_v1  tol_ulps=-  motivo=- argumento=-  [P1]  PASA

-- etiqueta desconocida
   region=inventada fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [etiqueta 'inventada' no esta en tolerancias.json]  PASA

-- fuera_de_rango desconocido
   region=erf_r1 fuera_de_rango='otro' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [fuera_de_rango desconocido 'otro']  PASA

RESULTADO B4: PASA
```

### B6 (a) erf siempre 0 (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_cero.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=3  fallan=530
  max ulps=8.99883e+15  p99 ulps=8.91067e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 59)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: fuera de tolerancia=530
  10 peores: id 338: 8.99883e+15 (fuera de tolerancia); id 256: 8.98541e+15 (fuera de tolerancia); id 462: 8.95915e+15 (fuera de tolerancia); id 540: 8.95779e+15 (fuera de tolerancia); id 92: 8.92766e+15 (fuera de tolerancia); id 195: 8.91067e+15 (fuera de tolerancia); id 539: 8.90756e+15 (fuera de tolerancia); id 334: 8.89007e+15 (fuera de tolerancia); id 1: 8.87414e+15 (fuera de tolerancia); id 10: 8.87414e+15 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0 ref=0.49261347321793797 ulps=8.87414e+15 tol=8.87414

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=9.00720e+15  p99 ulps=9.00720e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: fuera de tolerancia=534
  10 peores: id 37: 9.00720e+15 (fuera de tolerancia); id 44: 9.00720e+15 (fuera de tolerancia); id 46: 9.00720e+15 (fuera de tolerancia); id 54: 9.00720e+15 (fuera de tolerancia); id 38: 9.00720e+15 (fuera de tolerancia); id 47: 9.00720e+15 (fuera de tolerancia); id 40: 9.00720e+15 (fuera de tolerancia); id 49: 9.00720e+15 (fuera de tolerancia); id 629: 9.00720e+15 (fuera de tolerancia); id 1024: 9.00720e+15 (fuera de tolerancia)
  ejemplo de fallo: id 3: x=0 ref=0.49261389780837755 ulps=8.87414e+15 tol=8.87414

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=9.00720e+15  p99 ulps=9.00720e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: fuera de tolerancia=508
  10 peores: id 1098: 9.00720e+15 (fuera de tolerancia); id 1113: 9.00720e+15 (fuera de tolerancia); id 1160: 9.00720e+15 (fuera de tolerancia); id 1167: 9.00720e+15 (fuera de tolerancia); id 1177: 9.00720e+15 (fuera de tolerancia); id 1178: 9.00720e+15 (fuera de tolerancia); id 1203: 9.00720e+15 (fuera de tolerancia); id 1345: 9.00720e+15 (fuera de tolerancia); id 1434: 9.00720e+15 (fuera de tolerancia); id 1444: 9.00720e+15 (fuera de tolerancia)
  ejemplo de fallo: id 39: x=0 ref=0.99999998458325 ulps=9.00720e+15 tol=9.0072

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=0; ulps=1; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=0; ulps=1; tol_ulps=2

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (b) erf tramposa (exit 0)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_tramposa.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: pasa
  n=534  pasan=534  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=-5e-324; ulps=0; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=5e-324; ulps=0; tol_ulps=2

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (c) +1 ulp (exit 0)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_mas1.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.5 (id 56)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 1; id 2: 1; id 4: 1; id 6: 1; id 8: 1; id 10: 1; id 11: 1; id 13: 1; id 15: 1; id 18: 1

Etiqueta erf_r2: pasa
  n=534  pasan=534  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.220547 (id 1073)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  10 peores: id 3: 1; id 5: 1; id 7: 1; id 9: 1; id 12: 1; id 14: 1; id 16: 1; id 17: 1; id 19: 1; id 20: 1

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.222045 (id 1076)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 1; id 41: 1; id 43: 1; id 45: 1; id 48: 1; id 50: 1; id 52: 1; id 53: 1; id 1076: 1; id 1078: 1

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=0; ulps=1; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=1e-323; ulps=1; tol_ulps=2

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (c) x20 (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_mas20.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=1  fallan=532
  max ulps=20  p99 ulps=20
  fraccion de la tolerancia (peor fila)=10 (id 56)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: fuera de tolerancia=532
  10 peores: id 1: 20 (fuera de tolerancia); id 2: 20 (fuera de tolerancia); id 4: 20 (fuera de tolerancia); id 6: 20 (fuera de tolerancia); id 8: 20 (fuera de tolerancia); id 10: 20 (fuera de tolerancia); id 11: 20 (fuera de tolerancia); id 13: 20 (fuera de tolerancia); id 15: 20 (fuera de tolerancia); id 18: 20 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0.4926134732179391 ref=0.49261347321793797 ulps=20 tol=8.87414

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=20  p99 ulps=20
  fraccion de la tolerancia (peor fila)=4.41094 (id 1073)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: fuera de tolerancia=534
  10 peores: id 3: 20 (fuera de tolerancia); id 5: 20 (fuera de tolerancia); id 7: 20 (fuera de tolerancia); id 9: 20 (fuera de tolerancia); id 12: 20 (fuera de tolerancia); id 14: 20 (fuera de tolerancia); id 16: 20 (fuera de tolerancia); id 17: 20 (fuera de tolerancia); id 19: 20 (fuera de tolerancia); id 20: 20 (fuera de tolerancia)
  ejemplo de fallo: id 3: x=0.49261389780837866 ref=0.49261389780837755 ulps=20 tol=8.87414

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=39  p99 ulps=39
  fraccion de la tolerancia (peor fila)=4.44089 (id 1076)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: fuera de tolerancia=508
  10 peores: id 1098: 39 (fuera de tolerancia); id 1113: 39 (fuera de tolerancia); id 1160: 39 (fuera de tolerancia); id 1167: 39 (fuera de tolerancia); id 1177: 39 (fuera de tolerancia); id 1203: 39 (fuera de tolerancia); id 1434: 39 (fuera de tolerancia); id 1137: 38 (fuera de tolerancia); id 1352: 38 (fuera de tolerancia); id 1454: 38 (fuera de tolerancia)
  ejemplo de fallo: id 39: x=0.9999999845832522 ref=0.99999998458325 ulps=20 tol=9.0072

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): FALLA; regla=P2_subnormal; ref=-5e-324; devolvio=9.4e-323; ulps=20; tol_ulps=2; fuera de tolerancia
  fila id 57 (erf_r1, subnormal): FALLA; regla=P2_subnormal; ref=5e-324; devolvio=1.04e-322; ulps=20; tol_ulps=2; fuera de tolerancia

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (d) TypeError (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_typeerror.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=0  fallan=533
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: excepcion no StatsError=533
  10 peores: id 1: Infinity (excepcion no StatsError); id 2: Infinity (excepcion no StatsError); id 4: Infinity (excepcion no StatsError); id 6: Infinity (excepcion no StatsError); id 8: Infinity (excepcion no StatsError); id 10: Infinity (excepcion no StatsError); id 11: Infinity (excepcion no StatsError); id 13: Infinity (excepcion no StatsError); id 15: Infinity (excepcion no StatsError); id 18: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 1: TypeError: fake: x is not a function

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=534
  10 peores: id 3: Infinity (excepcion no StatsError); id 5: Infinity (excepcion no StatsError); id 7: Infinity (excepcion no StatsError); id 9: Infinity (excepcion no StatsError); id 12: Infinity (excepcion no StatsError); id 14: Infinity (excepcion no StatsError); id 16: Infinity (excepcion no StatsError); id 17: Infinity (excepcion no StatsError); id 19: Infinity (excepcion no StatsError); id 20: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 3: TypeError: fake: x is not a function

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: excepcion no StatsError=508
  10 peores: id 39: Infinity (excepcion no StatsError); id 41: Infinity (excepcion no StatsError); id 43: Infinity (excepcion no StatsError); id 45: Infinity (excepcion no StatsError); id 48: Infinity (excepcion no StatsError); id 50: Infinity (excepcion no StatsError); id 52: Infinity (excepcion no StatsError); id 53: Infinity (excepcion no StatsError); id 1076: Infinity (excepcion no StatsError); id 1077: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 39: TypeError: fake: x is not a function

Filas pedidas con --ids:
  fila id 55 (erf_r1): FALLA; regla=relativa; ref=0; devolvio=TypeError; ulps=Infinity; tol_ulps=0; excepcion no StatsError

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (e) gamma pendiente (exit 0)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_pendiente.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  10 peores: id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 520: 0; id 521: 0

VERDE
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (e) gamma dominio (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_dominio.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: StatsError con motivo o argumento distinto=120
  10 peores: id 519: Infinity (StatsError con motivo o argumento distinto); id 522: Infinity (StatsError con motivo o argumento distinto); id 527: Infinity (StatsError con motivo o argumento distinto); id 538: Infinity (StatsError con motivo o argumento distinto); id 548: Infinity (StatsError con motivo o argumento distinto); id 551: Infinity (StatsError con motivo o argumento distinto); id 552: Infinity (StatsError con motivo o argumento distinto); id 555: Infinity (StatsError con motivo o argumento distinto); id 556: Infinity (StatsError con motivo o argumento distinto); id 559: Infinity (StatsError con motivo o argumento distinto)
  ejemplo de fallo: id 519: motivo=dominio argumento=a (esperado motivo=pendiente argumento=a)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (e) gamma número (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_numero.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: no lanzo=120
  10 peores: id 519: Infinity (no lanzo); id 522: Infinity (no lanzo); id 527: Infinity (no lanzo); id 538: Infinity (no lanzo); id 548: Infinity (no lanzo); id 551: Infinity (no lanzo); id 552: Infinity (no lanzo); id 555: Infinity (no lanzo); id 556: Infinity (no lanzo); id 559: Infinity (no lanzo)
  ejemplo de fallo: id 519: devolvio 1; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (f) erfc ceros (exit 1)
```
Funcion: erfc   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erfc_sub0.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erfc_neg: pasa
  n=504  pasan=504  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=504; tol_ulps 4.5036-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 8: 0; id 1449: 0; id 1450: 0; id 1451: 0; id 1452: 0; id 1453: 0; id 1454: 0

Etiqueta erfc_r1: pasa
  n=511  pasan=511  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=511; tol_ulps 4.52719-9.00662]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta erfc_r2: pasa
  n=682  pasan=682  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 12)
  tolerancia aplicada: relativa 1e-15 [n=682; tol_ulps 4.50584-9.00079]
  10 peores: id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 19: 0; id 20: 0; id 21: 0; id 22: 0; id 23: 0; id 25: 0

Etiqueta erfc_r3: ROJA
  n=1751  pasan=1710  fallan=41
  max ulps=1.70799e+15  p99 ulps=2.57210e+9
  fraccion de la tolerancia (peor fila)=8.53997e+14 (id 3199)
  tolerancia aplicada: relativa 1e-15 [n=1513; tol_ulps 4.50405-9.00576] | P2: 2 ulps de subnormal [n=43; tol_ulps 2] | P2: 0 exacto [n=195; tol_ulps 0]
  fallos por clase: fuera de tolerancia=41
  10 peores: id 3199: 1.70799e+15 (fuera de tolerancia); id 1118: 1.61982e+15 (fuera de tolerancia); id 1117: 1.61982e+15 (fuera de tolerancia); id 1119: 1.61982e+15 (fuera de tolerancia); id 3399: 7.90608e+13 (fuera de tolerancia); id 1121: 5.81779e+13 (fuera de tolerancia); id 1120: 5.81779e+13 (fuera de tolerancia); id 1122: 5.81779e+13 (fuera de tolerancia); id 1123: 2.07328e+12 (fuera de tolerancia); id 1124: 2.07328e+12 (fuera de tolerancia)
  ejemplo de fallo: id 1117: x=0 ref=8.00298579263671e-309 ulps=1.61982e+15 tol=2

ROJO (etiquetas rojas: erfc_r3)
(escrito stats/informes/_ultimo_erfc.json)
```

### B6 (f) erfc tramposa (exit 0)
```
Funcion: erfc   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erfc_tramposa.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erfc_neg: pasa
  n=504  pasan=504  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=504; tol_ulps 4.5036-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 8: 0; id 1449: 0; id 1450: 0; id 1451: 0; id 1452: 0; id 1453: 0; id 1454: 0

Etiqueta erfc_r1: pasa
  n=511  pasan=511  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=511; tol_ulps 4.52719-9.00662]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta erfc_r2: pasa
  n=682  pasan=682  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 12)
  tolerancia aplicada: relativa 1e-15 [n=682; tol_ulps 4.50584-9.00079]
  10 peores: id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 19: 0; id 20: 0; id 21: 0; id 22: 0; id 23: 0; id 25: 0

Etiqueta erfc_r3: pasa
  n=1751  pasan=1751  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 30)
  tolerancia aplicada: relativa 1e-15 [n=1513; tol_ulps 4.50405-9.00576] | P2: 2 ulps de subnormal [n=43; tol_ulps 2] | P2: 0 exacto [n=195; tol_ulps 0]
  10 peores: id 30: 0; id 32: 0; id 34: 0; id 36: 0; id 37: 0; id 38: 0; id 39: 0; id 40: 0; id 41: 0; id 42: 0

VERDE
(escrito stats/informes/_ultimo_erfc.json)
```

### B6 (g) qt (exit 1)
```
Funcion: qt
P1 no implementado en arnes-v1 (etiquetas P1: qt_resto, qt_ngt2); P1 llega con arnes-v2 en la sesion 2
ROJO
(escrito stats/informes/_ultimo_qt.json)
```

### (h) módulo que exporta solo _erf (exit 1)
```
Funcion: erf
el modulo file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_solo_guion.js no exporta 'erf'
ROJO
(escrito stats/informes/_ultimo_erf.json)
```

## Pruebas nuevas

### Seis comprobaciones · node stats/harness/_fakes/prueba_fallos_0c.js (exit 0)
```
regla=lanza motivo=pendiente argumento=a
   todo correcto                          -> ok=true clase='ok'  PASA
   2 name distinto                        -> ok=false clase='excepcion no StatsError'  PASA
   1 objeto plano con name StatsError     -> ok=false clase='excepcion no StatsError'  PASA
   1 Error comun con campos copiados      -> ok=false clase='excepcion no StatsError'  PASA
   3 funcion lgamma                       -> ok=false clase='StatsError con funcion distinta'  PASA
   3 funcion interna _gamma               -> ok=false clase='StatsError con funcion distinta'  PASA
   4 motivo dominio                       -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   5 argumento x                          -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   6 valor 99                             -> ok=false clase='StatsError con valor distinto'  PASA
   6 valor "100" (cadena)                 -> ok=false clase='StatsError con valor distinto'  PASA
   6 valor undefined                      -> ok=false clase='StatsError con valor distinto'  PASA
   valor -0 esperado -0                   -> ok=true  PASA
   valor 0 con esperado -0                -> ok=false  PASA
   valor -0 con esperado 0                -> ok=false  PASA
   valor NaN esperado NaN                 -> ok=true  PASA
   valor NaN esperado 0                   -> ok=false  PASA
   no lanzo -> clase='no lanzo'  PASA

RESULTADO fallos_0c: PASA
```

### (i) objeto plano {name:"StatsError", motivo, argumento, funcion, valor} · FAKE_MODO=plano, --funcion gamma --modulo _fakes/fake_gamma_malos.js (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_malos.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: excepcion no StatsError=120
  10 peores: id 519: Infinity (excepcion no StatsError); id 522: Infinity (excepcion no StatsError); id 527: Infinity (excepcion no StatsError); id 538: Infinity (excepcion no StatsError); id 548: Infinity (excepcion no StatsError); id 551: Infinity (excepcion no StatsError); id 552: Infinity (excepcion no StatsError); id 555: Infinity (excepcion no StatsError); id 556: Infinity (excepcion no StatsError); id 559: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 519: no es RangeError: StatsError: [object Object]

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### (j) StatsError auténtico con funcion:"lgamma" · FAKE_MODO=funcion (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_malos.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: StatsError con funcion distinta=120
  10 peores: id 519: Infinity (StatsError con funcion distinta); id 522: Infinity (StatsError con funcion distinta); id 527: Infinity (StatsError con funcion distinta); id 538: Infinity (StatsError con funcion distinta); id 548: Infinity (StatsError con funcion distinta); id 551: Infinity (StatsError con funcion distinta); id 552: Infinity (StatsError con funcion distinta); id 555: Infinity (StatsError con funcion distinta); id 556: Infinity (StatsError con funcion distinta); id 559: Infinity (StatsError con funcion distinta)
  ejemplo de fallo: id 519: funcion=lgamma (esperado gamma)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### (j) StatsError auténtico con valor como cadena · FAKE_MODO=valorcadena (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_malos.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: StatsError con valor distinto=120
  10 peores: id 519: Infinity (StatsError con valor distinto); id 522: Infinity (StatsError con valor distinto); id 527: Infinity (StatsError con valor distinto); id 538: Infinity (StatsError con valor distinto); id 548: Infinity (StatsError con valor distinto); id 551: Infinity (StatsError con valor distinto); id 552: Infinity (StatsError con valor distinto); id 555: Infinity (StatsError con valor distinto); id 556: Infinity (StatsError con valor distinto); id 559: Infinity (StatsError con valor distinto)
  ejemplo de fallo: id 519: valor=94.46696655137501 (esperado 94.46696655137501)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### (k) CSV sin la columna fuera_de_rango
Copia temporal, fuera del repo (scratchpad de Claude Code, no pertenece al repo):
`C:/Users/RAVELL~1/AppData/Local/Temp/claude/C--Users-RAVELLO-CAMACHO-Documents-statsjs-build-researchingmind/91c79843-e90f-4055-a35a-76072e234820/scratchpad/k`
con `stats/` entera copiada y `tests/fixtures/gamma.csv` reescrito sin la columna `fuera_de_rango` (23 → 22 columnas, 1018 filas; cabecera `#` conservada; es el único archivo de fixtures de la copia). SHA-256 de los `.js` copiados (comparados con los de `stats/harness/` y `stats/src/error.js` del repo, todos IGUAL):
```
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac *stats/harness/csv.js  copia=repo: IGUAL
f09bf37143153f2bfa25ae6554c6200ff8164bc9b38e608f0836d4493cc6afd0 *stats/harness/hexfloat.js  copia=repo: IGUAL
4b1cdffc7a2e4eb2afdeb1c75fe3d2022b4c854d450acb73304061c2e77402d7 *stats/harness/run.js  copia=repo: IGUAL
719f1ada4e082d601770934aa30fb0c7cdaec1c0b2cb686b18e759ef564d9aac *stats/harness/tolerancia.js  copia=repo: IGUAL
cfc423e2598f37ba2a11096c3c116e88e741eb19e75d77e4a5ae24e1278bea04 *stats/harness/ulps.js  copia=repo: IGUAL
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979 *stats/src/error.js  copia=repo: IGUAL
```
Salida de `node stats/harness/run.js --funcion gamma` ejecutado dentro de la copia (exit 1):
```
Funcion: gamma
el CSV de gamma no tiene la(s) columna(s) fuera_de_rango que exige el arnes
ROJO
(escrito stats/informes/_ultimo_gamma.json)
```

Comprobaciones adicionales: con las fixtures reales, las etiquetas de las 14 CSV pasan (4) (comprobado leyendo cada CSV y aplicando la misma condición, fuera del arnés).

## Resumen

| caso | esperado | obtenido |
|---|---|---|
| A, B1, B2, B3 | PASA | PASA |
| B4 con `prueba_b4_0c.js` | PASA | PASA |
| B6 a / c(x20) / d | ROJO | ROJO (exit 1) |
| B6 b / c(+1) | VERDE | VERDE |
| B6 e pendiente / dominio / número | VERDE / ROJO 120 / ROJO 120 | igual |
| B6 f ceros / ref | ROJO erfc_r3 / VERDE | igual |
| B6 g | P1 no implementado | igual |
| (h) | se niega | ROJO: no exporta 'erf' |
| seis comprobaciones (`prueba_fallos_0c.js`) | PASA | PASA |
| (i) objeto plano | ROJO | ROJO, 120 filas «excepcion no StatsError» |
| (j) funcion lgamma / valor cadena | ROJO | ROJO, 120 filas cada una |
| (k) sin `fuera_de_rango` | ROJO nombrando la columna | ROJO, nombra `fuera_de_rango` |

Las corridas escribieron `stats/informes/_ultimo_*.json`; se borraron al terminar (en el repo; la copia temporal conserva el suyo).

## SHA-256 nuevos
```
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac *stats/harness/csv.js
f09bf37143153f2bfa25ae6554c6200ff8164bc9b38e608f0836d4493cc6afd0 *stats/harness/hexfloat.js
4b1cdffc7a2e4eb2afdeb1c75fe3d2022b4c854d450acb73304061c2e77402d7 *stats/harness/run.js
719f1ada4e082d601770934aa30fb0c7cdaec1c0b2cb686b18e759ef564d9aac *stats/harness/tolerancia.js
cfc423e2598f37ba2a11096c3c116e88e741eb19e75d77e4a5ae24e1278bea04 *stats/harness/ulps.js
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979 *stats/src/error.js
```

Archivos de prueba nuevos (no congelados con el arnés):
```
7210425ed90bda2251f08cd5d68bb9156de021c99e8ec183f439cfe97d293ac1 *stats/harness/_fakes/prueba_b4_0c.js
3db64d6d5a6701d4fcb7812fffa194331855de4388ceb3da5f61e5699c26f75b *stats/harness/_fakes/prueba_fallos_0c.js
3f36c78c4e46cadbdcbb55161d8842893e2b0d693eeb93dd4b7fc0a142afe555 *stats/harness/_fakes/fake_gamma_malos.js
```

---

## Añadido tras la revisión de Cowork

Regla del revisor: todo global que referencie el camino de juicio de `tolerancia.js`, `ulps.js` y `hexfloat.js` se captura al cargar el módulo, antes de que `run.js` importe el módulo probado. `hexfloat.js` entra en los archivos permitidos solo para esto (respaldo previo: `$TEMP/s0c/hexfloat.js`; para `tolerancia.js`, `ulps.js` y `run.js` se hizo además una segunda copia, `$TEMP/s0c/r1/`, con el estado posterior a la primera parte de este informe, para que los diffs de abajo muestren solo lo añadido ahora). Esta sección **sustituye** al punto abierto 2 de arriba (que decía que `Number.isFinite`, `Math.max` y `RangeError` quedaban sin copia) y a los SHA-256 de la primera parte; las salidas de A, B1–B6, (h), (i), (j) y (k) se repitieron y son **idénticas byte a byte** a las de arriba (`cmp` sobre los archivos de salida).

### Lista del grep (global → copia → archivo)
Búsqueda: `grep -n -o -E "\b(Math|Number|Object|JSON|Array|String|BigInt|BigUint64Array|Float64Array|DataView|RangeError|Error|TypeError|Symbol|Map|Set|parseInt|parseFloat|isNaN|isFinite)\b[.A-Za-z_]*"` sobre los tres archivos, antes de este añadido (salida literal más abajo).

| global | copia | archivo | estado |
|---|---|---|---|
| `BigInt` | `Big` | hexfloat.js | nueva |
| `Number` | `Num` | hexfloat.js | nueva |
| `String` | `Txt` | hexfloat.js | nueva |
| `Error` | `Err` | hexfloat.js | nueva (solo en las rutas de rechazo del parser) |
| `Number.isNaN` | `esNaN` | hexfloat.js | nueva (solo `aHex`) |
| `Float64Array` | `F64` | hexfloat.js | nueva (solo `aHex`) |
| `BigUint64Array` | `U64` | hexfloat.js | nueva (solo `aHex`) |
| `Math.abs` | `abs` | ulps.js | ya estaba (parte 1) |
| `Number.isNaN` | `esNaN` | ulps.js | ya estaba (parte 1) |
| `Number.isFinite` | `esFinito` | ulps.js | nueva |
| `Number` | `Num` | ulps.js | nueva |
| `Float64Array`, `BigUint64Array` | instancias `F`, `U` creadas al cargar | ulps.js | ya capturadas por uso al cargar |
| `Number.MIN_VALUE` | constante `MIN_SUBNORMAL` leída al cargar | ulps.js | ya capturada por uso al cargar |
| `Math.abs`, `Number.isNaN`, `Object.is` | `abs`, `esNaN`, `mismo` | tolerancia.js | ya estaban (parte 1) |
| `Math.max` | `max` | tolerancia.js | nueva |
| `RangeError` | `ErrorRango` | tolerancia.js | nueva |
| `String` | `Txt` | tolerancia.js | nueva |
| `JSON.parse`, `Error`, `Number.MIN_VALUE` | sin copia | tolerancia.js | se ejecutan solo al cargar (`leer(...)`, comprobaciones de `reglas.json`, constante `SUBNORMAL_ULP`), antes de importar el módulo probado |

`Infinity`, `NaN` y `undefined` son propiedades no escribibles del global y no se copian. Quedan fuera, como límite documentado, los prototipos (`Float64Array.prototype`, `Array.prototype.find`, `String.prototype.trim`, `RegExp.prototype.exec`, …).

#### Grep literal antes de este añadido
```
== hexfloat.js
3:BigInt
16:String
22:Error
25:BigInt
26:Number
29:Error
30:Number
36:Number.isNaN
39:Float64Array
40:BigUint64Array
42:Number
== ulps.js
2:Float64Array
2:BigUint64Array
5:Math.abs
6:Number.isNaN
8:Float64Array
9:BigUint64Array
11:Number.MIN_VALUE
19:Number.isFinite
20:Number
27:Number.isFinite
27:Number.isFinite
== tolerancia.js
7:Math.abs
8:Number.isNaN
9:Object.is
11:JSON.parse
15:Number.MIN_VALUE
19:Error
21:Error
36:Math.max
112:String
114:RangeError
115:RangeError
130:String
130:String
132:String
```

#### Grep literal después (restos que no son uso del camino de juicio: capturas al cargar y comentarios)
```
stats/harness/hexfloat.js:11:const esNaN = Number.isNaN;
stats/harness/hexfloat.js:12:const F64 = Float64Array;
stats/harness/hexfloat.js:13:const U64 = BigUint64Array;
stats/harness/hexfloat.js:53:  const frac = (b & ((1n << 52n) - 1n)).toString(16).padStart(13, "0");
stats/harness/ulps.js:2:// Todo por bits (Float64Array / BigUint64Array), sin aritmetica decimal.
stats/harness/ulps.js:5:const abs = Math.abs;
stats/harness/ulps.js:6:const esNaN = Number.isNaN;
stats/harness/ulps.js:7:const esFinito = Number.isFinite;
stats/harness/ulps.js:10:const F = new Float64Array(1);
stats/harness/ulps.js:11:const U = new BigUint64Array(F.buffer);
stats/harness/ulps.js:13:const MIN_SUBNORMAL = Number.MIN_VALUE; // 2^-1074
stats/harness/tolerancia.js:7:const abs = Math.abs;
stats/harness/tolerancia.js:8:const esNaN = Number.isNaN;
stats/harness/tolerancia.js:9:const mismo = Object.is;
stats/harness/tolerancia.js:10:const max = Math.max;
stats/harness/tolerancia.js:11:const ErrorRango = RangeError;
stats/harness/tolerancia.js:14:const leer = (n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8"));
stats/harness/tolerancia.js:18:const SUBNORMAL_ULP = Number.MIN_VALUE; // 2^-1074 (reglas.json › medida.ulp)
stats/harness/tolerancia.js:22:if (typeof P2_SUBNORMAL_ULPS !== "number") throw new Error("reglas.json › P2.subnormal_ulps no es un numero");
stats/harness/tolerancia.js:24:if (typeof MOTIVO_INFORMA_FALLO !== "string") throw new Error("reglas.json › informa_fallo.motivo no es una cadena");
stats/harness/tolerancia.js:118:    return { ok: false, clase: "excepcion no StatsError", detalle: `no es RangeError: ${e?.name ?? typeof e}: ${e?.message ?? e}` };
```

#### Punto abierto: `run.js`
Fuera de la regla (que nombra tres archivos), `run.js` sigue usando globales en su propio código mientras el módulo probado ya está cargado. No se tocó (su diff es vacío). Grep literal:
```
22:Number.isFinite
22:Math.abs
22:Math.abs
22:String
22:Number
22:String
23:Number.isFinite
23:String
27:JSON.stringify
55:Set
75:Object.keys
84:Map
85:Set
89:Object.fromEntries
97:Error
114:Number.isNaN
127:Map
134:Math.min
134:Math.max
147:Math.max
147:Math.ceil
149:Number
149:Number
151:Number.isFinite
154:Number
162:Object.entries
```

Nota sobre `csv.js`: no se tocó ni se revisó contra la regla (no está entre los archivos nombrados); su SHA no cambia.

#### Diff de hexfloat.js (copia de respaldo de la sesión → ahora)
```diff
--- hexfloat.js (antes)
+++ hexfloat.js (ahora)
@@ -2,6 +2,16 @@
 // 0x0.0p+0, -0x0.0p+0, inf, -inf, nan (sin distinguir mayusculas: ref_r_hex trae "Inf").
 // Exacto: la mantisa se lee como BigInt y el valor se arma con potencias de 2.
 
+// Copias locales de los globales del camino de juicio, tomadas al cargar (antes de que run.js importe el
+// modulo probado); solo se usan estas.
+const Big = BigInt;
+const Num = Number;
+const Txt = String;
+const Err = Error;
+const esNaN = Number.isNaN;
+const F64 = Float64Array;
+const U64 = BigUint64Array;
+
 const RE = /^([+-]?)0x([0-9a-f]+)(?:\.([0-9a-f]*))?p([+-]?\d+)$/i;
 
 // m * 2^e, con m entero que cabe en 53 bits; se escala en pasos para no pasar por 2^e fuera de rango.
@@ -13,33 +23,33 @@
 }
 
 export function parseHex(texto) {
-  const s = String(texto).trim();
+  const s = Txt(texto).trim();
   const bajo = s.toLowerCase();
   if (bajo === "inf" || bajo === "+inf" || bajo === "infinity" || bajo === "+infinity") return Infinity;
   if (bajo === "-inf" || bajo === "-infinity") return -Infinity;
   if (bajo === "nan" || bajo === "+nan" || bajo === "-nan") return NaN;
   const m = RE.exec(s);
-  if (m === null) throw new Error(`hex-float ilegible: '${texto}'`);
+  if (m === null) throw new Err(`hex-float ilegible: '${texto}'`);
   const signo = m[1] === "-" ? -1 : 1;
   const frac = m[3] ?? "";
-  let mant = BigInt("0x" + m[2] + frac);
-  let exp = Number(m[4]) - 4 * frac.length;
+  let mant = Big("0x" + m[2] + frac);
+  let exp = Num(m[4]) - 4 * frac.length;
   if (mant === 0n) return signo < 0 ? -0 : 0;
   while ((mant & 1n) === 0n) { mant >>= 1n; exp += 1; } // quita ceros finales: la mantisa minima
-  if (mant >= 1n << 53n) throw new Error(`hex-float con mas de 53 bits significativos: '${texto}'`);
-  const valor = ldexp(Number(mant), exp);
+  if (mant >= 1n << 53n) throw new Err(`hex-float con mas de 53 bits significativos: '${texto}'`);
+  const valor = ldexp(Num(mant), exp);
   return signo * valor;
 }
 
 // Inverso, para mensajes: double -> hex-float al estilo de los fixtures (sin relleno).
 export function aHex(x) {
-  if (Number.isNaN(x)) return "nan";
+  if (esNaN(x)) return "nan";
   if (x === Infinity) return "inf";
   if (x === -Infinity) return "-inf";
-  const f = new Float64Array([x]);
-  const b = new BigUint64Array(f.buffer)[0];
+  const f = new F64([x]);
+  const b = new U64(f.buffer)[0];
   const signo = b >> 63n ? "-" : "";
-  const e = Number((b >> 52n) & 0x7ffn);
+  const e = Num((b >> 52n) & 0x7ffn);
   const frac = (b & ((1n << 52n) - 1n)).toString(16).padStart(13, "0");
   return e === 0 ? `${signo}0x0.${frac}p-1022` : `${signo}0x1.${frac}p${e - 1023 >= 0 ? "+" : ""}${e - 1023}`;
 }
```

#### Diff de ulps.js (estado previo a este añadido → ahora)
```diff
--- ulps.js (antes de este añadido)
+++ ulps.js (ahora)
@@ -4,6 +4,8 @@
 // Copias locales, tomadas al cargar (antes de que run.js importe el modulo probado); solo se usan estas.
 const abs = Math.abs;
 const esNaN = Number.isNaN;
+const esFinito = Number.isFinite;
+const Num = Number;
 
 const F = new Float64Array(1);
 const U = new BigUint64Array(F.buffer);
@@ -16,15 +18,15 @@
 // ulp(ref): para 2^e <= |ref| < 2^(e+1), 2^(e-52); en 0 y subnormales, 2^-1074.
 export function ulp(ref) {
   if (esNaN(ref)) return NaN;
-  if (!Number.isFinite(ref)) return Infinity;
-  const e = Number((bits(ref) >> 52n) & 0x7ffn); // campo de exponente; 0 = cero o subnormal
+  if (!esFinito(ref)) return Infinity;
+  const e = Num((bits(ref) >> 52n) & 0x7ffn); // campo de exponente; 0 = cero o subnormal
   return e === 0 ? MIN_SUBNORMAL : 2 ** (e - 1075);
 }
 
 export function ulps(x, ref) {
   if (typeof x !== "number" || esNaN(x) || esNaN(ref)) return Infinity;
   if (x === ref) return 0;
-  if (!Number.isFinite(x) || !Number.isFinite(ref)) return Infinity;
+  if (!esFinito(x) || !esFinito(ref)) return Infinity;
   return abs(x - ref) / ulp(ref);
 }
 
```

#### Diff de tolerancia.js (estado previo a este añadido → ahora)
```diff
--- tolerancia.js (antes de este añadido)
+++ tolerancia.js (ahora)
@@ -7,6 +7,9 @@
 const abs = Math.abs;
 const esNaN = Number.isNaN;
 const mismo = Object.is;
+const max = Math.max;
+const ErrorRango = RangeError;
+const Txt = String;
 
 const leer = (n) => JSON.parse(readFileSync(new URL(n, import.meta.url), "utf8"));
 export const TOLERANCIAS = leer("./tolerancias.json");
@@ -33,7 +36,7 @@
       return { regla: "ulps", tol_ulps: entrada.valor, detalle: `${entrada.valor} ulps` };
     case "relativa_con_suelo_absoluto":
       return { regla: "relativa_con_suelo_absoluto",
-        tol_ulps: Math.max(entrada.relativa * abs(ref), entrada.absoluta) / ulp(ref),
+        tol_ulps: max(entrada.relativa * abs(ref), entrada.absoluta) / ulp(ref),
         detalle: `max(${entrada.relativa}*|ref|, ${entrada.absoluta})` };
     case "lanza":
       if (typeof entrada.argumento !== "string") {
@@ -109,9 +112,9 @@
 // reglas.json › arnes_fallos v2: seis comprobaciones, en ese orden.
 export function juzgarFallo(r, e, devuelto, funcion, valor) {
   if (e === undefined) {
-    return { ok: false, clase: "no lanzo", detalle: `devolvio ${String(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
+    return { ok: false, clase: "no lanzo", detalle: `devolvio ${Txt(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
   }
-  if (e === null || !(e instanceof RangeError)) { // 1 clase
+  if (e === null || !(e instanceof ErrorRango)) { // 1 clase
     return { ok: false, clase: "excepcion no StatsError", detalle: `no es RangeError: ${e?.name ?? typeof e}: ${e?.message ?? e}` };
   }
   if (e.name !== "StatsError") { // 2 name
@@ -127,7 +130,7 @@
       detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
   }
   if (!mismo(e.valor, valor)) { // 6 valor (distingue -0 y NaN)
-    return { ok: false, clase: "StatsError con valor distinto", detalle: `valor=${String(e.valor)} (esperado ${String(valor)})` };
+    return { ok: false, clase: "StatsError con valor distinto", detalle: `valor=${Txt(e.valor)} (esperado ${Txt(valor)})` };
   }
-  return { ok: true, clase: "ok", detalle: `motivo=${e.motivo} argumento=${e.argumento} valor=${String(e.valor)}` };
+  return { ok: true, clase: "ok", detalle: `motivo=${e.motivo} argumento=${e.argumento} valor=${Txt(e.valor)}` };
 }
```

#### Diff de run.js (estado previo a este añadido → ahora)
```diff
(vacío: run.js no cambió)
```

### Pruebas nuevas (l) y (m)
Módulos falsos nuevos: `_fakes/fake_gamma_rango.js` y `_fakes/fake_lgamma_max.js`. Control: las mismas dos pruebas contra los `.js` de antes de este añadido (copia temporal `scratchpad/pre`, con los respaldos de `r1` y el `hexfloat.js` original) **pasan**, es decir, las pruebas pueden fallar y detectan la vulnerabilidad.

#### (l) globalThis.RangeError = Object; lanza objeto plano con los cinco campos en 40 < a < a* · node stats/harness/run.js --funcion gamma --modulo stats/harness/_fakes/fake_gamma_rango.js (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_rango.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: excepcion no StatsError=120
  10 peores: id 519: Infinity (excepcion no StatsError); id 522: Infinity (excepcion no StatsError); id 527: Infinity (excepcion no StatsError); id 538: Infinity (excepcion no StatsError); id 548: Infinity (excepcion no StatsError); id 551: Infinity (excepcion no StatsError); id 552: Infinity (excepcion no StatsError); id 555: Infinity (excepcion no StatsError); id 556: Infinity (excepcion no StatsError); id 559: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 519: no es RangeError: StatsError: [object Object]

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### (m) Math.max = () => Infinity; lgamma devuelve ref·(1+1e-13) · node stats/harness/run.js --funcion lgamma --modulo stats/harness/_fakes/fake_lgamma_max.js (exit 1)
```
Funcion: lgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_lgamma_max.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta lgamma_d: ROJA
  n=516  pasan=15  fallan=501
  max ulps=900  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=10.0018 (id 394)
  tolerancia aplicada: max(1e-14*|ref|, 2.9e-16) [n=516; tol_ulps 45.1798-Infinity]
  fallos por clase: fuera de tolerancia=501
  10 peores: id 321: 900 (fuera de tolerancia); id 10: 899 (fuera de tolerancia); id 11: 899 (fuera de tolerancia); id 17: 899 (fuera de tolerancia); id 404: 899 (fuera de tolerancia); id 168: 897 (fuera de tolerancia); id 13: 890 (fuera de tolerancia); id 241: 886 (fuera de tolerancia); id 374: 886 (fuera de tolerancia); id 423: 883 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0.15205967839985274 ref=0.15205967839983756 ulps=547 tol=54.7853

Etiqueta lgamma_delta: ROJA
  n=505  pasan=0  fallan=505
  max ulps=897  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=10.0028 (id 1130)
  tolerancia aplicada: relativa 1e-14 [n=505; tol_ulps 45.1572-Infinity]
  fallos por clase: fuera de tolerancia=505
  10 peores: id 1174: 897 (fuera de tolerancia); id 1321: 895 (fuera de tolerancia); id 1416: 893 (fuera de tolerancia); id 1460: 893 (fuera de tolerancia); id 1394: 892 (fuera de tolerancia); id 1129: 891 (fuera de tolerancia); id 1087: 890 (fuera de tolerancia); id 1260: 889 (fuera de tolerancia); id 1093: 888 (fuera de tolerancia); id 1408: 888 (fuera de tolerancia)
  ejemplo de fallo: id 19: x=25.1912211827412 ref=25.19122118273868 ulps=709 tol=70.907

Etiqueta lgamma_red: ROJA
  n=521  pasan=0  fallan=521
  max ulps=900  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=10.0025 (id 751)
  tolerancia aplicada: relativa 1e-14 [n=521; tol_ulps 45.2431-Infinity]
  fallos por clase: fuera de tolerancia=521
  10 peores: id 1036: 900 (fuera de tolerancia); id 12: 899 (fuera de tolerancia); id 18: 899 (fuera de tolerancia); id 589: 899 (fuera de tolerancia); id 963: 899 (fuera de tolerancia); id 828: 898 (fuera de tolerancia); id 602: 897 (fuera de tolerancia); id 851: 897 (fuera de tolerancia); id 766: 896 (fuera de tolerancia); id 649: 894 (fuera de tolerancia)
  ejemplo de fallo: id 2: x=0.15206045040744195 ref=0.15206045040742677 ulps=547 tol=54.7856

ROJO (etiquetas rojas: lgamma_d, lgamma_delta, lgamma_red)
(escrito stats/informes/_ultimo_lgamma.json)
```

Lectura de (m): en `lgamma_d`, 501 de 516 filas fallan; las 15 que pasan deben ser las de |ref| pequeño, donde la tolerancia es el suelo absoluto 2,9·10⁻¹⁶ y el error inyectado 10⁻¹³·|ref| cae por debajo (explicación por construcción de la regla; no se comprobó fila a fila). Las etiquetas `lgamma_red` y `lgamma_delta` salen ROJO también en el control porque el módulo falso devuelve la referencia por 1+10⁻¹³ en todas; lo que distingue las dos corridas es `lgamma_d`.

#### Control (l) con los .js previos al añadido (debe PASAR, VERDE)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/claude/C--Users-RAVELLO-CAMACHO-Documents-statsjs-build-researchingmind/91c79843-e90f-4055-a35a-76072e234820/scratchpad/pre/stats/harness/_fakes/fake_gamma_rango.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  10 peores: id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 520: 0; id 521: 0

VERDE
(escrito stats/informes/_ultimo_gamma.json)
```

#### Control (m) con los .js previos al añadido (lgamma_d debe PASAR)
```
Funcion: lgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/claude/C--Users-RAVELLO-CAMACHO-Documents-statsjs-build-researchingmind/91c79843-e90f-4055-a35a-76072e234820/scratchpad/pre/stats/harness/_fakes/fake_lgamma_max.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta lgamma_d: pasa
  n=516  pasan=516  fallan=0
  max ulps=900  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: max(1e-14*|ref|, 2.9e-16) [n=516]
  10 peores: id 321: 900; id 10: 899; id 11: 899; id 17: 899; id 404: 899; id 168: 897; id 13: 890; id 241: 886; id 374: 886; id 423: 883

Etiqueta lgamma_delta: ROJA
  n=505  pasan=0  fallan=505
  max ulps=897  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=10.0028 (id 1130)
  tolerancia aplicada: relativa 1e-14 [n=505; tol_ulps 45.1572-Infinity]
  fallos por clase: fuera de tolerancia=505
  10 peores: id 1174: 897 (fuera de tolerancia); id 1321: 895 (fuera de tolerancia); id 1416: 893 (fuera de tolerancia); id 1460: 893 (fuera de tolerancia); id 1394: 892 (fuera de tolerancia); id 1129: 891 (fuera de tolerancia); id 1087: 890 (fuera de tolerancia); id 1260: 889 (fuera de tolerancia); id 1093: 888 (fuera de tolerancia); id 1408: 888 (fuera de tolerancia)
  ejemplo de fallo: id 19: x=25.1912211827412 ref=25.19122118273868 ulps=709 tol=70.907

Etiqueta lgamma_red: ROJA
  n=521  pasan=0  fallan=521
  max ulps=900  p99 ulps=undefined
  fraccion de la tolerancia (peor fila)=10.0025 (id 751)
  tolerancia aplicada: relativa 1e-14 [n=521; tol_ulps 45.2431-Infinity]
  fallos por clase: fuera de tolerancia=521
  10 peores: id 1036: 900 (fuera de tolerancia); id 12: 899 (fuera de tolerancia); id 18: 899 (fuera de tolerancia); id 589: 899 (fuera de tolerancia); id 963: 899 (fuera de tolerancia); id 828: 898 (fuera de tolerancia); id 602: 897 (fuera de tolerancia); id 851: 897 (fuera de tolerancia); id 766: 896 (fuera de tolerancia); id 649: 894 (fuera de tolerancia)
  ejemplo de fallo: id 2: x=0.15206045040744195 ref=0.15206045040742677 ulps=547 tol=54.7856

ROJO (etiquetas rojas: lgamma_delta, lgamma_red)
(escrito stats/informes/_ultimo_lgamma.json)
```

### Repetición de A, B1–B6, (h)–(k)
Salidas idénticas a las de la sección anterior (comparadas con `cmp`). (k) se repitió con una copia nueva de `stats/` en `scratchpad/k`:
```
Funcion: gamma
el CSV de gamma no tiene la(s) columna(s) fuera_de_rango que exige el arnes
ROJO
(escrito stats/informes/_ultimo_gamma.json)
stats/harness/csv.js  copia=repo: IGUAL
stats/harness/hexfloat.js  copia=repo: IGUAL
stats/harness/run.js  copia=repo: IGUAL
stats/harness/tolerancia.js  copia=repo: IGUAL
stats/harness/ulps.js  copia=repo: IGUAL
stats/src/error.js  copia=repo: IGUAL
```

### SHA-256 nuevos
```
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac *stats/harness/csv.js
d5ae489702a94e00a4ed3709ec79fb523ac7236f88a0f730fee1117266f2544c *stats/harness/hexfloat.js
4b1cdffc7a2e4eb2afdeb1c75fe3d2022b4c854d450acb73304061c2e77402d7 *stats/harness/run.js
1709500ad9a64c3e77aced52b2cf509ef2b6b03faa1d18ddc1cddd5df007a65d *stats/harness/tolerancia.js
4561caeeb76e2bb7c4e6e9678e0d4469aa02ea0064fb8d06e1b860968c919578 *stats/harness/ulps.js
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979 *stats/src/error.js
```

Archivos de prueba nuevos de este añadido:
```
1bfa49d8e4c910a05acd42c7a6a9d141e3c46196240afcc452c62d89212809c2 *stats/harness/_fakes/fake_gamma_rango.js
03ff9ea29dee400e43745935fc6bf4e5b92205d9fb531f98e248a99d68965ac5 *stats/harness/_fakes/fake_lgamma_max.js
```

### Último añadido: la regla vale también para `run.js`

Decisión del revisor: todo global que `run.js` use después del `import()` del módulo probado se captura al principio de `run.js`, antes del `import()`. Respaldo previo: `$TEMP/s0c/r2/run.js`. Cambio mínimo: solo copias y cambios de nombre (el diff está más abajo, contra ese respaldo). **Desviación declarada:** se pidió agrupar las sustituciones en una o dos ediciones; la tarea se hizo con 15 llamadas de edición (una para el bloque de copias y 14 para las sustituciones), todas aplicadas sin error. El resultado es el mismo diff, pero no se agrupó como se pidió.

#### Lista del grep de `run.js` (global → copia → uso)

| global | copia | uso en `run.js` |
|---|---|---|
| `Object.keys` | `claves` | después del `import()` (orden de los argumentos) |
| `Object.fromEntries` | `deEntradas` | después |
| `Object.entries` | `entradasDe` | después (resumen por etiqueta) |
| `Number.isNaN` | `esNaN` | después (NaN devuelto) |
| `Number.isFinite` | `esFinito` | después (`fmt`, `jsonSeguro`, resumen) |
| `Number` | `Num` | después (`fmt`, ordenación de ids, `peores_10`) |
| `Math.abs` | `abs` | después (`fmt`) |
| `Math.min`, `Math.max`, `Math.ceil` | `min`, `max`, `techo` | después (rangos de tolerancia y p99) |
| `String` | `Txt` | después (`fmt`, `jsonSeguro`) |
| `Set` | `Conj` | después (`--ids`) |
| `Map` | `Mapa` | después (`porEtiqueta`, reglas) |
| `Error` | `Err` | después (excepción falsy) |
| `URL` | `Url` | después (`terminar`, ruta del `_ultimo_<f>.json`) |
| `JSON.stringify` | `jsonStr` | después (`terminar`) |
| `console.log` | `log` | después (`terminar`) |
| `console.error` | `logErr` | después (`main().catch`) |
| `process.exit` | `salir` | después (`terminar`, `main().catch`) |
| `URL` (`DIR_INFORMES`, `MODULO_POR_DEFECTO`), `Date`, `Set` (`etiquetasP1`), `console.error` y `process.exit(2)` (uso), `process.argv` | sin copia | **solo antes del `import()`** |
| `Infinity`, `NaN` | sin copia | no son reasignables |

Quedan fuera, como límite documentado, los prototipos (`Array.prototype.map`, `filter`, `sort`, `find`, `slice`, `String.prototype.startsWith`, …) y las funciones importadas de módulos de Node (`writeFileSync`, `existsSync`, `resolve`, `pathToFileURL`).

#### Grep literal antes (respaldo r2)
```
11:URL
12:URL
22:Number.isFinite
22:Math.abs
22:Math.abs
22:String
22:Number
22:String
23:Number.isFinite
23:String
26:URL
27:JSON.stringify
28:console.log
29:console.log
30:process.exit
34:process.argv.slice
37:console.error
38:process.exit
41:Date
55:Set
75:Object.keys
84:Map
85:Set
89:Object.fromEntries
97:Error
114:Number.isNaN
127:Map
134:Math.min
134:Math.max
147:Math.max
147:Math.ceil
149:Number
149:Number
151:Number.isFinite
154:Number
162:Object.entries
174:console.error
174:process.exit
```

#### Grep literal después (las líneas con global son capturas al principio o usos anteriores al import())
```
13:// URL (DIR_INFORMES, MODULO_POR_DEFECTO), Date (base.generado), Set (etiquetasP1), console.error y process.exit(2)
14:// (uso), process.argv; Infinity y NaN no son reasignables.
15:const claves = Object.keys;
16:const deEntradas = Object.fromEntries;
17:const entradasDe = Object.entries;
18:const esNaN = Number.isNaN;
19:const esFinito = Number.isFinite;
20:const Num = Number;
21:const abs = Math.abs;
22:const min = Math.min;
23:const max = Math.max;
24:const techo = Math.ceil;
25:const Txt = String;
26:const Conj = Set;
27:const Mapa = Map;
28:const Err = Error;
29:const Url = URL;
30:const jsonStr = JSON.stringify;
31:const log = console.log;
32:const logErr = console.error;
33:const salir = process.exit;
35:const DIR_INFORMES = new URL("../informes/", import.meta.url);
36:const MODULO_POR_DEFECTO = new URL("../src/stats.js", import.meta.url);
58:  const o = opciones(process.argv.slice(2));
61:    console.error("uso: node stats/harness/run.js --funcion <nombre> [--region <etiqueta>] [--modulo <ruta>]");
62:    process.exit(2);
65:    generado: new Date().toISOString(), archivo_json: `stats/informes/_ultimo_${funcion}.json` };
79:  const etiquetasP1 = [...new Set(filas.map((f) => f.region))].filter((e) => TOLERANCIAS[e]?.tipo === "P1");
```

#### Diff de run.js (respaldo r2 → ahora)
```diff
--- run.js (respaldo r2)
+++ run.js (ahora)
@@ -8,6 +8,30 @@
 import { parseHex } from "./hexfloat.js";
 import { regla, juzgar, juzgarFallo, TOLERANCIAS, REGLAS } from "./tolerancia.js";
 
+// Copias locales de los globales que run.js usa despues del import() del modulo probado, tomadas aqui
+// (antes del import()); despues del import() solo se usan estas. Solo se usan antes del import() y no se copian:
+// URL (DIR_INFORMES, MODULO_POR_DEFECTO), Date (base.generado), Set (etiquetasP1), console.error y process.exit(2)
+// (uso), process.argv; Infinity y NaN no son reasignables.
+const claves = Object.keys;
+const deEntradas = Object.fromEntries;
+const entradasDe = Object.entries;
+const esNaN = Number.isNaN;
+const esFinito = Number.isFinite;
+const Num = Number;
+const abs = Math.abs;
+const min = Math.min;
+const max = Math.max;
+const techo = Math.ceil;
+const Txt = String;
+const Conj = Set;
+const Mapa = Map;
+const Err = Error;
+const Url = URL;
+const jsonStr = JSON.stringify;
+const log = console.log;
+const logErr = console.error;
+const salir = process.exit;
+
 const DIR_INFORMES = new URL("../informes/", import.meta.url);
 const MODULO_POR_DEFECTO = new URL("../src/stats.js", import.meta.url);
 
@@ -19,15 +43,15 @@
   return o;
 }
 
-const fmt = (x) => (x === Infinity ? "Infinity" : Number.isFinite(x) ? (Math.abs(x) >= 1e9 || (x !== 0 && Math.abs(x) < 1e-4) ? x.toExponential(5) : String(Number(x.toPrecision(6)))) : String(x));
-const jsonSeguro = (_k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : v);
+const fmt = (x) => (x === Infinity ? "Infinity" : esFinito(x) ? (abs(x) >= 1e9 || (x !== 0 && abs(x) < 1e-4) ? x.toExponential(5) : Txt(Num(x.toPrecision(6)))) : Txt(x));
+const jsonSeguro = (_k, v) => (typeof v === "number" && !esFinito(v) ? Txt(v) : v);
 
 function terminar(funcion, resultado, informe) {
-  const salida = new URL(`_ultimo_${funcion}.json`, DIR_INFORMES);
-  writeFileSync(salida, JSON.stringify(resultado, jsonSeguro, 2) + "\n");
-  console.log(informe);
-  console.log(`(escrito ${resultado.archivo_json})`);
-  process.exit(resultado.veredicto === "VERDE" ? 0 : 1);
+  const salida = new Url(`_ultimo_${funcion}.json`, DIR_INFORMES);
+  writeFileSync(salida, jsonStr(resultado, jsonSeguro, 2) + "\n");
+  log(informe);
+  log(`(escrito ${resultado.archivo_json})`);
+  salir(resultado.veredicto === "VERDE" ? 0 : 1);
 }
 
 async function main() {
@@ -72,7 +96,7 @@
 
   // orden de los argumentos: claves de reglas.json › dominios (gamma1pm1: un solo argumento 'a')
   const dom = REGLAS.dominios[funcion];
-  const nombres = dom ? Object.keys(dom).filter((k) => !k.startsWith("_"))
+  const nombres = dom ? claves(dom).filter((k) => !k.startsWith("_"))
     : columnas.filter((k) => k.endsWith("_hex") && !k.startsWith("ref_")).map((k) => k.slice(0, -4));
   if (!dom && nombres.length !== 1) rojo(`${funcion} no tiene entrada en reglas.json › dominios y sus columnas _hex no son un unico argumento`);
   for (const n of nombres) if (!columnas.includes(n + "_hex")) rojo(`el CSV no tiene la columna ${n}_hex que exige reglas.json › dominios.${funcion}`);
@@ -81,12 +105,12 @@
   if (malTail) rojo(`lower_tail='${malTail.lower_tail}' en la fila id ${malTail.id}: solo se admite vacio, 0 o 1`);
 
   // juicio fila por fila
-  const porEtiqueta = new Map();
-  const verIds = typeof o.ids === "string" ? new Set(o.ids.split(",")) : null; // depuracion: --ids 55,56,57
+  const porEtiqueta = new Mapa();
+  const verIds = typeof o.ids === "string" ? new Conj(o.ids.split(",")) : null; // depuracion: --ids 55,56,57
   const detalleIds = [];
   for (const fila of filas) {
     const argsNum = nombres.map((n) => parseHex(fila[n + "_hex"]));
-    const args = Object.fromEntries(nombres.map((n, i) => [n, argsNum[i]]));
+    const args = deEntradas(nombres.map((n, i) => [n, argsNum[i]]));
     const ref = parseHex(fila.ref_mp70_hex);
     const llamada = [...argsNum];
     if (conTail && fila.lower_tail !== "") llamada.push(fila.lower_tail === "1");
@@ -94,7 +118,7 @@
 
     let ok, ulpsMedido = null, fraccion = null, clase = "ok", detalle = "";
     let devuelto, excepcion;
-    try { devuelto = fn(...llamada); } catch (e) { excepcion = e ?? new Error("lanzo un valor falsy"); }
+    try { devuelto = fn(...llamada); } catch (e) { excepcion = e ?? new Err("lanzo un valor falsy"); }
 
     const sinArg = (r.regla === "lanza" || r.regla === "informa_fallo") && !nombres.includes(r.argumento);
     if (r.regla === "sin_regla" || sinArg) {
@@ -111,7 +135,7 @@
       clase = excepcion.name === "StatsError" ? "StatsError donde la referencia es un numero" : "excepcion no StatsError";
     } else if (typeof devuelto !== "number") {
       ok = false; ulpsMedido = Infinity; clase = "no devolvio number"; detalle = `devolvio ${typeof devuelto}`;
-    } else if (Number.isNaN(devuelto)) {
+    } else if (esNaN(devuelto)) {
       ok = false; ulpsMedido = Infinity; clase = "NaN"; detalle = "devolvio NaN";
     } else {
       const j = juzgar(r, devuelto, ref);
@@ -124,14 +148,14 @@
     }
 
     let e = porEtiqueta.get(fila.region);
-    if (!e) porEtiqueta.set(fila.region, (e = { n: 0, pasan: 0, fallan: 0, ulps: [], fracciones: [], peores: [], clases: {}, reglas: new Map() }));
+    if (!e) porEtiqueta.set(fila.region, (e = { n: 0, pasan: 0, fallan: 0, ulps: [], fracciones: [], peores: [], clases: {}, reglas: new Mapa() }));
     e.n++;
     if (ok) e.pasan++; else { e.fallan++; e.clases[clase] = (e.clases[clase] ?? 0) + 1; }
     if (ulpsMedido !== null) { e.ulps.push(ulpsMedido); e.peores.push({ id: fila.id, ulps: ulpsMedido, ok, clase, detalle }); }
     if (fraccion !== null) e.fracciones.push({ id: fila.id, fraccion });
     const g = e.reglas.get(r.detalle) ?? { n: 0, min: Infinity, max: -Infinity };
     g.n++;
-    if (r.tol_ulps !== null) { g.min = Math.min(g.min, r.tol_ulps); g.max = Math.max(g.max, r.tol_ulps); }
+    if (r.tol_ulps !== null) { g.min = min(g.min, r.tol_ulps); g.max = max(g.max, r.tol_ulps); }
     e.reglas.set(r.detalle, g);
   }
 
@@ -144,14 +168,14 @@
   for (const [etq, e] of [...porEtiqueta.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
     const orden = [...e.ulps].sort((a, b) => a - b);
     const maxUlps = orden.length ? orden[orden.length - 1] : null;
-    const p99 = orden.length ? orden[Math.max(0, Math.ceil(0.99 * orden.length) - 1)] : null;
+    const p99 = orden.length ? orden[max(0, techo(0.99 * orden.length) - 1)] : null;
     const peorFraccion = e.fracciones.reduce((m, x) => (m === null || x.fraccion > m.fraccion ? x : m), null);
-    const peores = [...e.peores].sort((a, b) => b.ulps - a.ulps || Number(a.id) - Number(b.id)).slice(0, 10);
+    const peores = [...e.peores].sort((a, b) => b.ulps - a.ulps || Num(a.id) - Num(b.id)).slice(0, 10);
     const tolerancia = [...e.reglas.entries()].map(([d, g]) =>
-      `${d} [n=${g.n}${Number.isFinite(g.min) ? `; tol_ulps ${fmt(g.min)}${g.max !== g.min ? "-" + fmt(g.max) : ""}` : ""}]`);
+      `${d} [n=${g.n}${esFinito(g.min) ? `; tol_ulps ${fmt(g.min)}${g.max !== g.min ? "-" + fmt(g.max) : ""}` : ""}]`);
     etiquetas[etq] = { n: e.n, pasan: e.pasan, fallan: e.fallan, max_ulps: maxUlps, p99_ulps: p99,
       fraccion_tolerancia_peor_fila: peorFraccion, tolerancia_aplicada: tolerancia, fallos_por_clase: e.clases,
-      peores_10: peores.map((p) => ({ id: Number(p.id), ulps: p.ulps, ok: p.ok, clase: p.clase })) };
+      peores_10: peores.map((p) => ({ id: Num(p.id), ulps: p.ulps, ok: p.ok, clase: p.clase })) };
     if (e.fallan > 0) rojas.push(etq);
     lineas.push("");
     lineas.push(`Etiqueta ${etq}: ${e.fallan === 0 ? "pasa" : "ROJA"}`);
@@ -159,7 +183,7 @@
     lineas.push(`  max ulps=${maxUlps === null ? "-" : fmt(maxUlps)}  p99 ulps=${p99 === null ? "-" : fmt(p99)}`);
     lineas.push(`  fraccion de la tolerancia (peor fila)=${peorFraccion ? `${fmt(peorFraccion.fraccion)} (id ${peorFraccion.id})` : "-"}`);
     lineas.push(`  tolerancia aplicada: ${tolerancia.join(" | ")}`);
-    if (e.fallan) lineas.push(`  fallos por clase: ${Object.entries(e.clases).map(([k, v]) => `${k}=${v}`).join("; ")}`);
+    if (e.fallan) lineas.push(`  fallos por clase: ${entradasDe(e.clases).map(([k, v]) => `${k}=${v}`).join("; ")}`);
     lineas.push(`  10 peores: ${peores.length ? peores.map((p) => `id ${p.id}: ${fmt(p.ulps)}${p.ok ? "" : " (" + p.clase + ")"}`).join("; ") : "(sin filas numericas)"}`);
     const primerFallo = e.peores.find((p) => !p.ok);
     if (primerFallo) lineas.push(`  ejemplo de fallo: id ${primerFallo.id}: ${primerFallo.detalle}`);
@@ -171,4 +195,4 @@
   terminar(funcion, { ...base, veredicto, etiquetas_rojas: rojas, etiquetas }, lineas.join("\n"));
 }
 
-main().catch((e) => { console.error("ERROR DEL ARNES:", e); process.exit(2); });
+main().catch((e) => { logErr("ERROR DEL ARNES:", e); salir(2); });
```

### Prueba (n) y su control
`_fakes/fake_pgamma_invertida.js`: `pgamma(a, x, lowerTail)` (argumentos invertidos respecto a la firma pública `(x, a, lowerTail)`), que al cargarse hace que `Object.keys` devuelva sus claves invertidas. Con un `run.js` que llame a `Object.keys` tras el `import()`, el arnés ordena los argumentos como `(a, x)` y la función falsa los recibe bien; con `Object.keys` capturado, el orden es el de `reglas.json` (`x`, `a`) y la función recibe los argumentos cambiados.

**Resultado:** con el `run.js` actual, ROJO en las 11 etiquetas de pgamma (casi todas las filas devuelven NaN, al no encontrar la función falsa la combinación de argumentos; unas pocas caen fuera de tolerancia). **Control** con el `run.js` anterior (respaldo r2, resto de archivos actuales): **VERDE**, o sea, el arnés anterior no detectaba la inversión; la prueba puede fallar.

#### (n) node stats/harness/run.js --funcion pgamma --modulo stats/harness/_fakes/fake_pgamma_invertida.js (exit 1)
```
Funcion: pgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_pgamma_invertida.js
argumentos (orden de reglas.json): x, a [+ lower_tail cuando la columna no esta vacia]

Etiqueta pgamma_a05: ROJA
  n=528  pasan=0  fallan=528
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=2.85590e+13 (id 170)
  tolerancia aplicada: relativa 1e-13 [n=511; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=11; tol_ulps 2] | P2: 0 exacto [n=6; tol_ulps 0]
  fallos por clase: NaN=524; fuera de tolerancia=4
  10 peores: id 145: Infinity (NaN); id 146: Infinity (NaN); id 151: Infinity (NaN); id 152: Infinity (NaN); id 157: Infinity (NaN); id 158: Infinity (NaN); id 175: Infinity (NaN); id 176: Infinity (NaN); id 181: Infinity (NaN); id 182: Infinity (NaN)
  ejemplo de fallo: id 145: devolvio NaN

Etiqueta pgamma_asin16: ROJA
  n=626  pasan=0  fallan=626
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-13 [n=612; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=9; tol_ulps 2] | P2: 0 exacto [n=5; tol_ulps 0]
  fallos por clase: NaN=626
  10 peores: id 109: Infinity (NaN); id 110: Infinity (NaN); id 113: Infinity (NaN); id 114: Infinity (NaN); id 117: Infinity (NaN); id 118: Infinity (NaN); id 121: Infinity (NaN); id 122: Infinity (NaN); id 125: Infinity (NaN); id 126: Infinity (NaN)
  ejemplo de fallo: id 109: devolvio NaN

Etiqueta pgamma_cf11_med: ROJA
  n=814  pasan=8  fallan=806
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0.0141767 (id 1460)
  tolerancia aplicada: relativa 1e-13 [n=814; tol_ulps 450.495-900.72]
  fallos por clase: NaN=806
  10 peores: id 95: Infinity (NaN); id 96: Infinity (NaN); id 99: Infinity (NaN); id 100: Infinity (NaN); id 103: Infinity (NaN); id 104: Infinity (NaN); id 107: Infinity (NaN); id 108: Infinity (NaN); id 557: Infinity (NaN); id 558: Infinity (NaN)
  ejemplo de fallo: id 95: devolvio NaN

Etiqueta pgamma_cf11_peq: ROJA
  n=608  pasan=0  fallan=608
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-13 [n=593; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=3; tol_ulps 2] | P2: 0 exacto [n=12; tol_ulps 0]
  fallos por clase: NaN=608
  10 peores: id 57: Infinity (NaN); id 58: Infinity (NaN); id 61: Infinity (NaN); id 62: Infinity (NaN); id 65: Infinity (NaN); id 66: Infinity (NaN); id 69: Infinity (NaN); id 70: Infinity (NaN); id 75: Infinity (NaN); id 76: Infinity (NaN)
  ejemplo de fallo: id 57: devolvio NaN

Etiqueta pgamma_lejos: ROJA
  n=776  pasan=0  fallan=776
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: 788 ulps [n=547; tol_ulps 788] | P2: 0 exacto [n=229; tol_ulps 0]
  fallos por clase: NaN=776
  10 peores: id 515: Infinity (NaN); id 516: Infinity (NaN); id 519: Infinity (NaN); id 520: Infinity (NaN); id 523: Infinity (NaN); id 524: Infinity (NaN); id 527: Infinity (NaN); id 528: Infinity (NaN); id 531: Infinity (NaN); id 532: Infinity (NaN)
  ejemplo de fallo: id 515: devolvio NaN

Etiqueta pgamma_n19: ROJA
  n=578  pasan=2  fallan=576
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 569)
  tolerancia aplicada: relativa 1e-13 [n=578; tol_ulps 450.649-900.142]
  fallos por clase: NaN=576
  10 peores: id 573: Infinity (NaN); id 574: Infinity (NaN); id 585: Infinity (NaN); id 586: Infinity (NaN); id 1469: Infinity (NaN); id 1470: Infinity (NaN); id 1473: Infinity (NaN); id 1474: Infinity (NaN); id 1485: Infinity (NaN); id 1486: Infinity (NaN)
  ejemplo de fallo: id 573: devolvio NaN

Etiqueta pgamma_q10: ROJA
  n=626  pasan=0  fallan=626
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-13 [n=626; tol_ulps 450.525-900.552]
  fallos por clase: NaN=626
  10 peores: id 199: Infinity (NaN); id 200: Infinity (NaN); id 203: Infinity (NaN); id 204: Infinity (NaN); id 207: Infinity (NaN); id 208: Infinity (NaN); id 211: Infinity (NaN); id 212: Infinity (NaN); id 217: Infinity (NaN); id 218: Infinity (NaN)
  ejemplo de fallo: id 199: devolvio NaN

Etiqueta pgamma_s15: ROJA
  n=794  pasan=40  fallan=754
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=1.84610e+18 (id 525)
  tolerancia aplicada: relativa 1e-13 [n=794; tol_ulps 450.36-900.72]
  fallos por clase: NaN=738; fuera de tolerancia=16
  10 peores: id 1: Infinity (NaN); id 2: Infinity (NaN); id 5: Infinity (NaN); id 6: Infinity (NaN); id 9: Infinity (NaN); id 10: Infinity (NaN); id 13: Infinity (NaN); id 14: Infinity (NaN); id 17: Infinity (NaN); id 18: Infinity (NaN)
  ejemplo de fallo: id 1: devolvio NaN

Etiqueta pgamma_serie9: ROJA
  n=754  pasan=2  fallan=752
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=1.35556e+13 (id 498)
  tolerancia aplicada: relativa 1e-13 [n=754; tol_ulps 451.627-900.688]
  fallos por clase: NaN=736; fuera de tolerancia=16
  10 peores: id 3: Infinity (NaN); id 4: Infinity (NaN); id 7: Infinity (NaN); id 8: Infinity (NaN); id 11: Infinity (NaN); id 12: Infinity (NaN); id 15: Infinity (NaN); id 16: Infinity (NaN); id 21: Infinity (NaN); id 22: Infinity (NaN)
  ejemplo de fallo: id 3: devolvio NaN

Etiqueta pgamma_suma14: ROJA
  n=818  pasan=90  fallan=728
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=1.18788e+17 (id 1122)
  tolerancia aplicada: relativa 1e-13 [n=818; tol_ulps 450.856-900.72]
  fallos por clase: fuera de tolerancia=8; NaN=720
  10 peores: id 73: Infinity (NaN); id 74: Infinity (NaN); id 91: Infinity (NaN); id 92: Infinity (NaN); id 561: Infinity (NaN); id 562: Infinity (NaN); id 579: Infinity (NaN); id 580: Infinity (NaN); id 597: Infinity (NaN); id 598: Infinity (NaN)
  ejemplo de fallo: id 55: x=0.5891809618706484 ref=0.6671289163019205 ulps=7.02093e+14 tol=600.896

Etiqueta pgamma_temme: ROJA
  n=980  pasan=0  fallan=980
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: 1232 ulps [n=907; tol_ulps 1232] | P2: 0 exacto [n=72; tol_ulps 0] | P2: 2 ulps de subnormal [n=1; tol_ulps 2]
  fallos por clase: NaN=980
  10 peores: id 533: Infinity (NaN); id 534: Infinity (NaN); id 551: Infinity (NaN); id 552: Infinity (NaN); id 555: Infinity (NaN); id 556: Infinity (NaN); id 559: Infinity (NaN); id 560: Infinity (NaN); id 563: Infinity (NaN); id 564: Infinity (NaN)
  ejemplo de fallo: id 533: devolvio NaN

ROJO (etiquetas rojas: pgamma_a05, pgamma_asin16, pgamma_cf11_med, pgamma_cf11_peq, pgamma_lejos, pgamma_n19, pgamma_q10, pgamma_s15, pgamma_serie9, pgamma_suma14, pgamma_temme)
(escrito stats/informes/_ultimo_pgamma.json)
```

#### Control (n) con el run.js anterior (exit 0)
```
Funcion: pgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/claude/C--Users-RAVELLO-CAMACHO-Documents-statsjs-build-researchingmind/91c79843-e90f-4055-a35a-76072e234820/scratchpad/pre2/stats/harness/_fakes/fake_pgamma_invertida.js
argumentos (orden de reglas.json): a, x [+ lower_tail cuando la columna no esta vacia]

Etiqueta pgamma_a05: pasa
  n=528  pasan=528  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 145)
  tolerancia aplicada: relativa 1e-13 [n=511; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=11; tol_ulps 2] | P2: 0 exacto [n=6; tol_ulps 0]
  10 peores: id 145: 0; id 146: 0; id 151: 0; id 152: 0; id 157: 0; id 158: 0; id 163: 0; id 164: 0; id 169: 0; id 170: 0

Etiqueta pgamma_asin16: pasa
  n=626  pasan=626  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 109)
  tolerancia aplicada: relativa 1e-13 [n=612; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=9; tol_ulps 2] | P2: 0 exacto [n=5; tol_ulps 0]
  10 peores: id 109: 0; id 110: 0; id 113: 0; id 114: 0; id 117: 0; id 118: 0; id 121: 0; id 122: 0; id 125: 0; id 126: 0

Etiqueta pgamma_cf11_med: pasa
  n=814  pasan=814  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 95)
  tolerancia aplicada: relativa 1e-13 [n=814; tol_ulps 450.495-900.72]
  10 peores: id 95: 0; id 96: 0; id 99: 0; id 100: 0; id 103: 0; id 104: 0; id 107: 0; id 108: 0; id 557: 0; id 558: 0

Etiqueta pgamma_cf11_peq: pasa
  n=608  pasan=608  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 57)
  tolerancia aplicada: relativa 1e-13 [n=593; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=3; tol_ulps 2] | P2: 0 exacto [n=12; tol_ulps 0]
  10 peores: id 57: 0; id 58: 0; id 61: 0; id 62: 0; id 65: 0; id 66: 0; id 69: 0; id 70: 0; id 75: 0; id 76: 0

Etiqueta pgamma_lejos: pasa
  n=776  pasan=776  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 515)
  tolerancia aplicada: 788 ulps [n=547; tol_ulps 788] | P2: 0 exacto [n=229; tol_ulps 0]
  10 peores: id 515: 0; id 516: 0; id 519: 0; id 520: 0; id 523: 0; id 524: 0; id 527: 0; id 528: 0; id 531: 0; id 532: 0

Etiqueta pgamma_n19: pasa
  n=578  pasan=578  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 569)
  tolerancia aplicada: relativa 1e-13 [n=578; tol_ulps 450.649-900.142]
  10 peores: id 569: 0; id 570: 0; id 573: 0; id 574: 0; id 585: 0; id 586: 0; id 1469: 0; id 1470: 0; id 1473: 0; id 1474: 0

Etiqueta pgamma_q10: pasa
  n=626  pasan=626  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 199)
  tolerancia aplicada: relativa 1e-13 [n=626; tol_ulps 450.525-900.552]
  10 peores: id 199: 0; id 200: 0; id 203: 0; id 204: 0; id 207: 0; id 208: 0; id 211: 0; id 212: 0; id 217: 0; id 218: 0

Etiqueta pgamma_s15: pasa
  n=794  pasan=794  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-13 [n=794; tol_ulps 450.36-900.72]
  10 peores: id 1: 0; id 2: 0; id 5: 0; id 6: 0; id 9: 0; id 10: 0; id 13: 0; id 14: 0; id 17: 0; id 18: 0

Etiqueta pgamma_serie9: pasa
  n=754  pasan=754  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-13 [n=754; tol_ulps 451.627-900.688]
  10 peores: id 3: 0; id 4: 0; id 7: 0; id 8: 0; id 11: 0; id 12: 0; id 15: 0; id 16: 0; id 21: 0; id 22: 0

Etiqueta pgamma_suma14: pasa
  n=818  pasan=818  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 37)
  tolerancia aplicada: relativa 1e-13 [n=818; tol_ulps 450.856-900.72]
  10 peores: id 37: 0; id 38: 0; id 55: 0; id 56: 0; id 73: 0; id 74: 0; id 91: 0; id 92: 0; id 561: 0; id 562: 0

Etiqueta pgamma_temme: pasa
  n=980  pasan=980  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 533)
  tolerancia aplicada: 1232 ulps [n=907; tol_ulps 1232] | P2: 0 exacto [n=72; tol_ulps 0] | P2: 2 ulps de subnormal [n=1; tol_ulps 2]
  10 peores: id 533: 0; id 534: 0; id 551: 0; id 552: 0; id 555: 0; id 556: 0; id 559: 0; id 560: 0; id 563: 0; id 564: 0

VERDE
(escrito stats/informes/_ultimo_pgamma.json)
```

### Regresión completa tras el cambio en `run.js`
Se repitieron A, B1–B6, (h), (i), (j), (k), (l), (m) y las seis comprobaciones. Salidas comparadas con `cmp` contra la corrida inmediatamente anterior: **todas idénticas salvo (m)**. La diferencia en (m) es el efecto buscado: antes, `Math.max = () => Infinity` también afectaba al propio `run.js` y corrompía su resumen (`p99 ulps=undefined`, `tol_ulps 45.1798-Infinity`); ahora el resumen sale correcto (p99 numérico y rangos de tolerancia reales; el máximo 5,87·10³⁰⁷ de `lgamma_d` es el suelo absoluto sobre filas con ref = 0, ulp = 2⁻¹⁰⁷⁴). Veredicto y número de filas fallidas de (m) no cambian.

#### (m) tras el cambio · lgamma con Math.max = () => Infinity (exit 1)
```
Funcion: lgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_lgamma_max.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta lgamma_d: ROJA
  n=516  pasan=15  fallan=501
  max ulps=900  p99 ulps=897
  fraccion de la tolerancia (peor fila)=10.0018 (id 394)
  tolerancia aplicada: max(1e-14*|ref|, 2.9e-16) [n=516; tol_ulps 45.1798-5.86967e+307]
  fallos por clase: fuera de tolerancia=501
  10 peores: id 321: 900 (fuera de tolerancia); id 10: 899 (fuera de tolerancia); id 11: 899 (fuera de tolerancia); id 17: 899 (fuera de tolerancia); id 404: 899 (fuera de tolerancia); id 168: 897 (fuera de tolerancia); id 13: 890 (fuera de tolerancia); id 241: 886 (fuera de tolerancia); id 374: 886 (fuera de tolerancia); id 423: 883 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0.15205967839985274 ref=0.15205967839983756 ulps=547 tol=54.7853

Etiqueta lgamma_delta: ROJA
  n=505  pasan=0  fallan=505
  max ulps=897  p99 ulps=891
  fraccion de la tolerancia (peor fila)=10.0028 (id 1130)
  tolerancia aplicada: relativa 1e-14 [n=505; tol_ulps 45.1572-89.7605]
  fallos por clase: fuera de tolerancia=505
  10 peores: id 1174: 897 (fuera de tolerancia); id 1321: 895 (fuera de tolerancia); id 1416: 893 (fuera de tolerancia); id 1460: 893 (fuera de tolerancia); id 1394: 892 (fuera de tolerancia); id 1129: 891 (fuera de tolerancia); id 1087: 890 (fuera de tolerancia); id 1260: 889 (fuera de tolerancia); id 1093: 888 (fuera de tolerancia); id 1408: 888 (fuera de tolerancia)
  ejemplo de fallo: id 19: x=25.1912211827412 ref=25.19122118273868 ulps=709 tol=70.907

Etiqueta lgamma_red: ROJA
  n=521  pasan=0  fallan=521
  max ulps=900  p99 ulps=898
  fraccion de la tolerancia (peor fila)=10.0025 (id 751)
  tolerancia aplicada: relativa 1e-14 [n=521; tol_ulps 45.2431-90.0699]
  fallos por clase: fuera de tolerancia=521
  10 peores: id 1036: 900 (fuera de tolerancia); id 12: 899 (fuera de tolerancia); id 18: 899 (fuera de tolerancia); id 589: 899 (fuera de tolerancia); id 963: 899 (fuera de tolerancia); id 828: 898 (fuera de tolerancia); id 602: 897 (fuera de tolerancia); id 851: 897 (fuera de tolerancia); id 766: 896 (fuera de tolerancia); id 649: 894 (fuera de tolerancia)
  ejemplo de fallo: id 2: x=0.15206045040744195 ref=0.15206045040742677 ulps=547 tol=54.7856

ROJO (etiquetas rojas: lgamma_d, lgamma_delta, lgamma_red)
(escrito stats/informes/_ultimo_lgamma.json)
```

#### (l) tras el cambio (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_rango.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: excepcion no StatsError=120
  10 peores: id 519: Infinity (excepcion no StatsError); id 522: Infinity (excepcion no StatsError); id 527: Infinity (excepcion no StatsError); id 538: Infinity (excepcion no StatsError); id 548: Infinity (excepcion no StatsError); id 551: Infinity (excepcion no StatsError); id 552: Infinity (excepcion no StatsError); id 555: Infinity (excepcion no StatsError); id 556: Infinity (excepcion no StatsError); id 559: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 519: no es RangeError: StatsError: [object Object]

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### (k) tras el cambio (exit 1)
```
Funcion: gamma
el CSV de gamma no tiene la(s) columna(s) fuera_de_rango que exige el arnes
ROJO
(escrito stats/informes/_ultimo_gamma.json)
```

### SHA-256 nuevos (tras el último añadido)
```
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac *stats/harness/csv.js
d5ae489702a94e00a4ed3709ec79fb523ac7236f88a0f730fee1117266f2544c *stats/harness/hexfloat.js
cbf7371c7379155ab8153e28ecb37002785b65542e93325139108ca314ed3066 *stats/harness/run.js
1709500ad9a64c3e77aced52b2cf509ef2b6b03faa1d18ddc1cddd5df007a65d *stats/harness/tolerancia.js
4561caeeb76e2bb7c4e6e9678e0d4469aa02ea0064fb8d06e1b860968c919578 *stats/harness/ulps.js
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979 *stats/src/error.js
```

Archivo de prueba nuevo:
```
c494dafd4cb4cfc3ccd256f7ad1eadb47270e043da60dce2dec82f5710da6396 *stats/harness/_fakes/fake_pgamma_invertida.js
```
