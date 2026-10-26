# arnes_4 · tercera corrección del arnés tras su segunda auditoría (sesión 0d)

Fecha: 2026-10-26. Rama construccion, HEAD 93b3256b291ab9af553d60e5c38b9ef0affb30f4, `git status --short` vacío al empezar. Solo `git rev-parse` y `git status --short`. Respaldos de `tolerancia.js` y `run.js` hechos en `$TEMP/s0d/` antes de editar; los diffs de abajo son contra esos respaldos (SHA-256 de los respaldos = los de `arnes_3.md`, «tras el último añadido»: `run.js` cbf7371c…, `tolerancia.js` 1709500a…).

## Cambios (solo `tolerancia.js` y `run.js`, con la herramienta de edición)
1. **Congelado en profundidad.** `TOLERANCIAS` y `REGLAS` se congelan recursivamente (objetos y arrays) al final de `tolerancia.js`, al cargarse el módulo, es decir antes de que `run.js` importe el módulo probado. Copias locales de `Object.getOwnPropertyNames` y `Object.freeze`. Un módulo probado que intente cambiar un tramo, una regla o el orden de `dominios` recibe `TypeError` (los módulos ES son estrictos) y no carga: ROJO con el mensaje.
2. **Borrado de `_ultimo_<f>.json` al arrancar, y solo con nombre simple.** `run.js` borra `stats/informes/_ultimo_<f>.json` a nivel de módulo, antes de `main()` y del `import()` del módulo probado. **Declaración de la precisión pedida:** el borrado, y por tanto toda escritura de `_ultimo_<f>.json`, solo ocurre si `<f>` es un nombre simple: no vacío, solo letras ASCII, dígitos y `_` (comprobado por códigos de carácter, sin expresiones regulares). Si `--funcion` no lo es (`/`, `..`, espacio, punto, vacío…), `main()` imprime un mensaje y `ROJO` y sale con 1 **antes** de cualquier `rojo()` o `terminar()`, de modo que no se borra, no se escribe ni se pisa ningún archivo (ni `_ultimo_<f>.json` ni otro `.json`). La prueba (t) lo comprueba con un `.json` centinela. El caso sin `--funcion` sigue siendo el de uso (exit 2, sin tocar nada).
3. **Valores raros de una fila = fallo de esa fila.** `describir(v)` (exportada de `tolerancia.js`) escribe las primitivas con `String` y los objetos y funciones solo con `typeof`, sin invocar métodos. `juzgarFallo` se divide en un envoltorio con `try/catch` (clase «valor no juzgable») y `juzgarFalloInterno`, que usa `describir` en todos los mensajes. En `run.js` el juicio de cada fila va dentro de un `try/catch` con el mismo criterio, `nombreDe(e)` lee `e.name` sin dejar escapar excepciones, y la línea de `--ids` usa `describir`. El arnés ya no puede terminar con exit 2 por un valor de una fila.
4. **`lanza` sin `motivo` de tipo cadena → `sin_regla`**, igual que sin `argumento` (`reglaPorEntrada`; el detalle nombra qué falta).

## Notas y desviaciones
- **Mensajes de (i) y (l).** Por (3), el mensaje de un objeto plano lanzado pasa de `[object Object]` (que invocaba `toString`) a `object`. Es una diferencia buscada en una línea («ejemplo de fallo») de (i) y (l); la sección «Diferencias» lista las que hubo de verdad.
- **Lectura de `arnes_3.md`.** Se leyeron cambios, diffs, salidas, resumen, SHA y las secciones finales ((n), (m), (l), (k), regresión completa); no se leyeron línea a línea las listas de grep de «Añadido tras la revisión de Cowork» (≈1141–1541 y 1576–1830).
- **Ediciones.** `tolerancia.js`: 2 ediciones. `run.js`: 5 (más una abortada por falta de permiso y repetida). Todas pequeñas, sin reescribir archivos.
- **Pruebas añadidas a las pedidas** (en `_fakes/`, además de (o)–(s)): variantes (q)/(r) con BigInt, `Object.create(null)`, Proxy con trampas que lanzan y función, tanto en `erf` (una fila) como en `gamma` (las 120 filas `lanza`, donde el arnés anterior sí se caía); (t) nombre simple de `--funcion`; (u) `motivo` ausente en un tramo `lanza`.
- **Regresión «idéntica».** Se compara la salida nueva con la del respaldo re-ejecutado hoy (rutas normalizadas a `<RAIZ>`) y, aparte, la salida del respaldo con `arnes_3.md` línea a línea.

Node v24.22.1. Corrida de la tanda completa: 2026-10-26T14:58:03 (hora local).

## Resultados

### Regresión: código nuevo contra el respaldo (mismas órdenes, salidas normalizadas)

| caso | exit respaldo | exit nuevo | veredicto nuevo | salida idéntica |
|---|---|---|---|---|
| A | 0 | 0 | RESULTADO: PASA | idéntica |
| B1 | 0 | 0 | RESULTADO B1: PASA | idéntica |
| B2 | 0 | 0 | RESULTADO B2: PASA | idéntica |
| B3 | 0 | 0 | RESULTADO B3: PASA | idéntica |
| B4 | 0 | 0 | RESULTADO B4: PASA | idéntica |
| B6a | 1 | 1 | ROJO | idéntica |
| B6b | 0 | 0 | VERDE | idéntica |
| B6c_mas1 | 0 | 0 | VERDE | idéntica |
| B6c_x20 | 1 | 1 | ROJO | idéntica |
| B6d | 1 | 1 | ROJO | idéntica |
| B6e_pendiente | 0 | 0 | VERDE | idéntica |
| B6e_dominio | 1 | 1 | ROJO | idéntica |
| B6e_numero | 1 | 1 | ROJO | idéntica |
| B6f_ceros | 1 | 1 | ROJO | idéntica |
| B6f_tramposa | 0 | 0 | VERDE | idéntica |
| B6g | 1 | 1 | ROJO | idéntica |
| h | 1 | 1 | ROJO | idéntica |
| fallos_0c | 0 | 0 | RESULTADO fallos_0c: PASA | idéntica |
| i | 1 | 1 | ROJO | **DIFIERE** |
| j_funcion | 1 | 1 | ROJO | idéntica |
| j_valorcadena | 1 | 1 | ROJO | idéntica |
| k | 1 | 1 | ROJO | idéntica |
| l | 1 | 1 | ROJO | **DIFIERE** |
| m | 1 | 1 | ROJO | idéntica |
| n | 1 | 1 | ROJO | idéntica |

### Diferencias entre la salida del respaldo y la nueva

#### i
```
18c18
<   ejemplo de fallo: id 519: no es RangeError: StatsError: [object Object]
---
>   ejemplo de fallo: id 519: no es RangeError: StatsError: object
```
#### l
```
18c18
<   ejemplo de fallo: id 519: no es RangeError: StatsError: [object Object]
---
>   ejemplo de fallo: id 519: no es RangeError: StatsError: object
```

### El respaldo, re-ejecutado hoy, reproduce arnes_3.md

Líneas de la salida del respaldo que no aparecen como línea entera en `arnes_3.md` (ambos con rutas normalizadas):

| caso | líneas ausentes |
|---|---|
| A | 0 |
| B1 | 0 |
| B2 | 0 |
| B3 | 0 |
| B4 | 0 |
| B6a | 0 |
| B6b | 0 |
| B6c_mas1 | 0 |
| B6c_x20 | 0 |
| B6d | 0 |
| B6e_pendiente | 0 |
| B6e_dominio | 0 |
| B6e_numero | 0 |
| B6f_ceros | 0 |
| B6f_tramposa | 0 |
| B6g | 0 |
| h | 0 |
| fallos_0c | 0 |
| i | 0 |
| j_funcion | 0 |
| j_valorcadena | 0 |
| k | 0 |
| l | 0 |
| m | 0 |
| n | 0 |

### Pruebas nuevas: código nuevo contra control (respaldo)

| prueba | nuevo: veredicto / fallan / exit | control: veredicto / fallan / exit |
|---|---|---|
| o | ROJO / 0 / 1 | VERDE / 0 / 0 |
| p | ROJO / 0 / 1 | VERDE / 0 / 0 |
| u | ROJO / 120 / 1 | ROJO / 120 / 1 |
| raro_erf_lanza_symbol | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_lanza_symbol | ROJO / 120 / 1 | (sin veredicto) / 0 / 2 |
| raro_erf_lanza_bigint | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_lanza_bigint | ROJO / 120 / 1 | ROJO / 120 / 1 |
| raro_erf_lanza_nullproto | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_lanza_nullproto | ROJO / 120 / 1 | (sin veredicto) / 0 / 2 |
| raro_erf_lanza_proxy | ROJO / 1 / 1 | (sin veredicto) / 0 / 2 |
| raro_gamma_lanza_proxy | ROJO / 120 / 1 | (sin veredicto) / 0 / 2 |
| raro_erf_lanza_funcion | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_lanza_funcion | ROJO / 120 / 1 | ROJO / 120 / 1 |
| raro_erf_devuelve_symbol | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_devuelve_symbol | ROJO / 120 / 1 | ROJO / 120 / 1 |
| raro_erf_devuelve_bigint | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_devuelve_bigint | ROJO / 120 / 1 | ROJO / 120 / 1 |
| raro_erf_devuelve_nullproto | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_devuelve_nullproto | ROJO / 120 / 1 | (sin veredicto) / 0 / 2 |
| raro_erf_devuelve_proxy | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_devuelve_proxy | ROJO / 120 / 1 | (sin veredicto) / 0 / 2 |
| raro_erf_devuelve_funcion | ROJO / 1 / 1 | ROJO / 1 / 1 |
| raro_gamma_devuelve_funcion | ROJO / 120 / 1 | ROJO / 120 / 1 |

Equivalencias con los nombres del encargo: (o) = o; (p) = p; (q) = raro_erf_lanza_symbol; (r) = raro_erf_devuelve_nullproto; (u) = motivo ausente en el tramo lanza (clase de fallo esperada en el nuevo: «sin regla en el arnes»; en el respaldo: «StatsError con motivo o argumento distinto»).

#### (q) y (r): `_ultimo_erf.json` recién escrito

| prueba | nuevo | control |
|---|---|---|
| raro_erf_lanza_symbol | reciente | reciente |
| raro_erf_devuelve_nullproto | reciente | reciente |

#### (s) módulo que hace process.exit(0) al cargar

Antes de (s) se corrió una prueba normal de erf (`s_pre`) que deja un `_ultimo_erf.json`.

| | existía tras s_pre | exit de (s) | existe tras (s) |
|---|---|---|---|
| nuevo | existe | 0 | no existe |
| control (respaldo) | existe | 0 | existe |

Nota: el exit del arnés es el del módulo falso (0): el módulo termina el proceso y el arnés no llega a emitir veredicto; lo que cambia es que ya no queda un veredicto viejo en `_ultimo_erf.json`.

#### (t) `--funcion` que no es un nombre simple (centinela `stats/informes/_sentinela_0d.json`)

| --funcion | nuevo: exit / estado / segunda línea de la salida | control: exit / estado |
|---|---|---|
| `../_sentinela_0d` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 2 / intacto |
| `x/../_sentinela_0d` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 1 / MODIFICADO |
| `..` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 1 / MODIFICADO |
| `a b` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 1 / MODIFICADO |
| `erf.x` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 1 / MODIFICADO |
| `` | 1 / intacto / --funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se es | 1 / MODIFICADO |

«estado» compara el listado de `stats/informes/` y el contenido del centinela antes y después de la orden.

## Diff contra los respaldos

### tolerancia.js
```diff
--- respaldo/tolerancia.js
+++ stats/harness/tolerancia.js
@@ -39,8 +39,9 @@
         tol_ulps: max(entrada.relativa * abs(ref), entrada.absoluta) / ulp(ref),
         detalle: `max(${entrada.relativa}*|ref|, ${entrada.absoluta})` };
     case "lanza":
-      if (typeof entrada.argumento !== "string") {
-        return { regla: "sin_regla", tol_ulps: null, detalle: "lanza sin tolerancias.json › argumento de tipo cadena" };
+      if (typeof entrada.argumento !== "string" || typeof entrada.motivo !== "string") { // sesion 0d, cambio 4
+        return { regla: "sin_regla", tol_ulps: null,
+          detalle: `lanza sin tolerancias.json › ${typeof entrada.argumento !== "string" ? "argumento" : "motivo"} de tipo cadena` };
       }
       return { regla: "lanza", tol_ulps: null, motivo: entrada.motivo, argumento: entrada.argumento,
         detalle: `lanza ${entrada.motivo}` };
@@ -107,30 +108,54 @@
   return { ok, ulps: u, tol_ulps: t, fraccion };
 }
 
+// Descripcion de un valor ajeno (devuelto o lanzado por el modulo probado), sesion 0d, cambio 3: las primitivas con String;
+// los objetos y las funciones solo con typeof, sin invocar ninguno de sus metodos.
+export const describir = (v) => ((typeof v === "object" && v !== null) || typeof v === "function" ? typeof v : Txt(v));
+
 // Juicio de una fila 'lanza' / 'informa_fallo': e = excepcion capturada (o undefined si no lanzo);
 // funcion = la publica que se prueba; valor = lo que el arnes paso en el argumento nombrado.
 // reglas.json › arnes_fallos v2: seis comprobaciones, en ese orden.
 export function juzgarFallo(r, e, devuelto, funcion, valor) {
+  try {
+    return juzgarFalloInterno(r, e, devuelto, funcion, valor);
+  } catch { // Proxy con trampas que lanzan, getter que lanza...: fallo de la fila, sin usar el valor
+    return { ok: false, clase: "valor no juzgable", detalle: `el valor lanzado (${typeof e}) no se pudo juzgar sin usar sus metodos` };
+  }
+}
+
+function juzgarFalloInterno(r, e, devuelto, funcion, valor) {
   if (e === undefined) {
-    return { ok: false, clase: "no lanzo", detalle: `devolvio ${Txt(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
+    return { ok: false, clase: "no lanzo", detalle: `devolvio ${describir(devuelto)}; se esperaba StatsError motivo=${r.motivo}` };
   }
   if (e === null || !(e instanceof ErrorRango)) { // 1 clase
-    return { ok: false, clase: "excepcion no StatsError", detalle: `no es RangeError: ${e?.name ?? typeof e}: ${e?.message ?? e}` };
+    return { ok: false, clase: "excepcion no StatsError", detalle: `no es RangeError: ${describir(e?.name ?? typeof e)}: ${describir(e?.message ?? e)}` };
   }
   if (e.name !== "StatsError") { // 2 name
-    return { ok: false, clase: "excepcion no StatsError", detalle: `${e.name}: ${e.message}` };
+    return { ok: false, clase: "excepcion no StatsError", detalle: `${describir(e.name)}: ${describir(e.message)}` };
   }
   if (e.funcion !== funcion) { // 3 funcion
-    return { ok: false, clase: "StatsError con funcion distinta", detalle: `funcion=${e.funcion} (esperado ${funcion})` };
+    return { ok: false, clase: "StatsError con funcion distinta", detalle: `funcion=${describir(e.funcion)} (esperado ${funcion})` };
   }
   const motivoOk = e.motivo === r.motivo; // 4 motivo
   const argOk = e.argumento === r.argumento; // 5 argumento
   if (!(motivoOk && argOk)) {
     return { ok: false, clase: "StatsError con motivo o argumento distinto",
-      detalle: `motivo=${e.motivo} argumento=${e.argumento} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
+      detalle: `motivo=${describir(e.motivo)} argumento=${describir(e.argumento)} (esperado motivo=${r.motivo} argumento=${r.argumento})` };
   }
   if (!mismo(e.valor, valor)) { // 6 valor (distingue -0 y NaN)
-    return { ok: false, clase: "StatsError con valor distinto", detalle: `valor=${Txt(e.valor)} (esperado ${Txt(valor)})` };
+    return { ok: false, clase: "StatsError con valor distinto", detalle: `valor=${describir(e.valor)} (esperado ${describir(valor)})` };
   }
-  return { ok: true, clase: "ok", detalle: `motivo=${e.motivo} argumento=${e.argumento} valor=${Txt(e.valor)}` };
+  return { ok: true, clase: "ok", detalle: `motivo=${describir(e.motivo)} argumento=${describir(e.argumento)} valor=${describir(e.valor)}` };
+}
+
+// Congelado en profundidad (sesion 0d, cambio 1), al cargarse el modulo y antes de que run.js importe el modulo probado:
+// ningun modulo probado puede cambiar una regla, un tramo ni el orden de los dominios.
+const propiedadesDe = Object.getOwnPropertyNames;
+const congelarObjeto = Object.freeze;
+function congelar(v) {
+  if (typeof v !== "object" || v === null) return v;
+  for (const k of propiedadesDe(v)) congelar(v[k]);
+  return congelarObjeto(v);
 }
+congelar(TOLERANCIAS);
+congelar(REGLAS);
```

### run.js
```diff
--- respaldo/run.js
+++ stats/harness/run.js
@@ -1,12 +1,12 @@
 // Arnes: node stats/harness/run.js --funcion <f> [--region <etiqueta>] [--modulo <ruta>]
 // Lee tests/fixtures/<f>.csv, llama a la funcion con los argumentos de las columnas <arg>_hex
 // (en el orden de reglas.json › dominios), juzga con tolerancia.js y resume por etiqueta.
-import { writeFileSync, existsSync } from "node:fs";
+import { writeFileSync, existsSync, rmSync } from "node:fs";
 import { resolve } from "node:path";
 import { pathToFileURL } from "node:url";
 import { leerCsv, rutaFixture } from "./csv.js";
 import { parseHex } from "./hexfloat.js";
-import { regla, juzgar, juzgarFallo, TOLERANCIAS, REGLAS } from "./tolerancia.js";
+import { regla, juzgar, juzgarFallo, describir, TOLERANCIAS, REGLAS } from "./tolerancia.js";
 
 // Copias locales de los globales que run.js usa despues del import() del modulo probado, tomadas aqui
 // (antes del import()); despues del import() solo se usan estas. Solo se usan antes del import() y no se copian:
@@ -35,6 +35,24 @@
 const DIR_INFORMES = new URL("../informes/", import.meta.url);
 const MODULO_POR_DEFECTO = new URL("../src/stats.js", import.meta.url);
 
+// Sesion 0d, cambio 2: se borra el _ultimo_<f>.json anterior al arrancar, antes del import() del modulo probado, para que un
+// modulo que termine el proceso no deje un veredicto viejo pasando por el de esta corrida. Solo si <f> es un nombre simple
+// (letras ASCII, digitos y _; sin expresiones regulares): con '/', '..' u otro caracter no se borra ni se escribe ningun archivo.
+const esNombreSimple = (s) => {
+  if (s.length === 0) return false;
+  for (let i = 0; i < s.length; i++) {
+    const c = s.charCodeAt(i);
+    if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95)) return false;
+  }
+  return true;
+};
+{
+  const f = opciones(process.argv.slice(2)).funcion;
+  if (typeof f === "string" && esNombreSimple(f)) rmSync(new Url(`_ultimo_${f}.json`, DIR_INFORMES), { force: true });
+}
+// Nombre de una excepcion ajena para los mensajes, sin invocar sus metodos (sesion 0d, cambio 3).
+const nombreDe = (e) => { try { return describir(e.name); } catch { return typeof e; } };
+
 function opciones(argv) {
   const o = {};
   for (let i = 0; i < argv.length; i++) {
@@ -61,6 +79,10 @@
     console.error("uso: node stats/harness/run.js --funcion <nombre> [--region <etiqueta>] [--modulo <ruta>]");
     process.exit(2);
   }
+  if (!esNombreSimple(funcion)) { // sesion 0d, cambio 2: ROJO sin tocar ningun archivo (ni _ultimo_<f>.json ni otro .json)
+    log(`Funcion: ${funcion}\n--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo\nROJO`);
+    salir(1);
+  }
   const base = { funcion, region_filtrada: typeof o.region === "string" ? o.region : null,
     generado: new Date().toISOString(), archivo_json: `stats/informes/_ultimo_${funcion}.json` };
   const rojo = (motivo, extra = {}) => terminar(funcion, { ...base, veredicto: "ROJO", motivo, etiquetas_rojas: [], etiquetas: {}, ...extra },
@@ -120,31 +142,38 @@
     let devuelto, excepcion;
     try { devuelto = fn(...llamada); } catch (e) { excepcion = e ?? new Err("lanzo un valor falsy"); }
 
-    const sinArg = (r.regla === "lanza" || r.regla === "informa_fallo") && !nombres.includes(r.argumento);
-    if (r.regla === "sin_regla" || sinArg) {
-      if (sinArg) r.detalle = `argumento '${r.argumento}' no esta en la firma de ${funcion} (${nombres.join(", ")})`;
-      ok = false; clase = "sin regla en el arnes"; detalle = r.detalle; ulpsMedido = Infinity;
-      if (sinArg) r.regla = "sin_regla";
-    } else if (r.regla === "lanza" || r.regla === "informa_fallo") {
-      // valor que el arnes paso en el argumento nombrado (en pchisq es nu, no nu/2)
-      const j = juzgarFallo(r, excepcion, devuelto, funcion, argsNum[nombres.indexOf(r.argumento)]);
-      ok = j.ok; clase = j.clase; detalle = j.detalle;
-      if (!ok) ulpsMedido = Infinity;
-    } else if (excepcion !== undefined) {
-      ok = false; ulpsMedido = Infinity; detalle = `${excepcion.name}: ${excepcion.message}`;
-      clase = excepcion.name === "StatsError" ? "StatsError donde la referencia es un numero" : "excepcion no StatsError";
-    } else if (typeof devuelto !== "number") {
-      ok = false; ulpsMedido = Infinity; clase = "no devolvio number"; detalle = `devolvio ${typeof devuelto}`;
-    } else if (esNaN(devuelto)) {
-      ok = false; ulpsMedido = Infinity; clase = "NaN"; detalle = "devolvio NaN";
-    } else {
-      const j = juzgar(r, devuelto, ref);
-      ok = j.ok; ulpsMedido = j.ulps; fraccion = j.fraccion;
-      if (!ok) { clase = "fuera de tolerancia"; detalle = `x=${devuelto} ref=${ref} ulps=${fmt(j.ulps)} tol=${fmt(j.tol_ulps)}`; }
+    // Sesion 0d, cambio 3: cualquier valor raro devuelto o lanzado por el modulo probado (Symbol, BigInt, Object.create(null),
+    // Proxy, funcion...) se juzga como fallo de esta fila; los mensajes usan solo typeof y String de primitivas (describir).
+    try {
+      const sinArg = (r.regla === "lanza" || r.regla === "informa_fallo") && !nombres.includes(r.argumento);
+      if (r.regla === "sin_regla" || sinArg) {
+        if (sinArg) r.detalle = `argumento '${r.argumento}' no esta en la firma de ${funcion} (${nombres.join(", ")})`;
+        ok = false; clase = "sin regla en el arnes"; detalle = r.detalle; ulpsMedido = Infinity;
+        if (sinArg) r.regla = "sin_regla";
+      } else if (r.regla === "lanza" || r.regla === "informa_fallo") {
+        // valor que el arnes paso en el argumento nombrado (en pchisq es nu, no nu/2)
+        const j = juzgarFallo(r, excepcion, devuelto, funcion, argsNum[nombres.indexOf(r.argumento)]);
+        ok = j.ok; clase = j.clase; detalle = j.detalle;
+        if (!ok) ulpsMedido = Infinity;
+      } else if (excepcion !== undefined) {
+        ok = false; ulpsMedido = Infinity; detalle = `${nombreDe(excepcion)}: ${describir(excepcion.message)}`;
+        clase = excepcion.name === "StatsError" ? "StatsError donde la referencia es un numero" : "excepcion no StatsError";
+      } else if (typeof devuelto !== "number") {
+        ok = false; ulpsMedido = Infinity; clase = "no devolvio number"; detalle = `devolvio ${typeof devuelto}`;
+      } else if (esNaN(devuelto)) {
+        ok = false; ulpsMedido = Infinity; clase = "NaN"; detalle = "devolvio NaN";
+      } else {
+        const j = juzgar(r, devuelto, ref);
+        ok = j.ok; ulpsMedido = j.ulps; fraccion = j.fraccion;
+        if (!ok) { clase = "fuera de tolerancia"; detalle = `x=${devuelto} ref=${ref} ulps=${fmt(j.ulps)} tol=${fmt(j.tol_ulps)}`; }
+      }
+    } catch {
+      ok = false; ulpsMedido = Infinity; fraccion = null; clase = "valor no juzgable";
+      detalle = `el valor ${excepcion === undefined ? "devuelto" : "lanzado"} (${typeof (excepcion === undefined ? devuelto : excepcion)}) no se pudo juzgar sin usar sus metodos`;
     }
 
     if (verIds?.has(fila.id)) {
-      detalleIds.push(`  fila id ${fila.id} (${fila.region}${fila.fuera_de_rango ? ", " + fila.fuera_de_rango : ""}): ${ok ? "pasa" : "FALLA"}; regla=${r.regla}; ref=${ref}; devolvio=${excepcion ? excepcion.name : devuelto}; ulps=${ulpsMedido === null ? "-" : fmt(ulpsMedido)}; tol_ulps=${r.tol_ulps === null ? "-" : fmt(r.tol_ulps)}${ok ? "" : "; " + clase}`);
+      detalleIds.push(`  fila id ${fila.id} (${fila.region}${fila.fuera_de_rango ? ", " + fila.fuera_de_rango : ""}): ${ok ? "pasa" : "FALLA"}; regla=${r.regla}; ref=${ref}; devolvio=${excepcion ? nombreDe(excepcion) : describir(devuelto)}; ulps=${ulpsMedido === null ? "-" : fmt(ulpsMedido)}; tol_ulps=${r.tol_ulps === null ? "-" : fmt(r.tol_ulps)}${ok ? "" : "; " + clase}`);
     }
 
     let e = porEtiqueta.get(fila.region);
```

## Salidas completas (código nuevo)

### Regresión

#### A (exit 0)
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

#### B1 (exit 0)
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

#### B2 (exit 0)
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

#### B3 (exit 0)
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

#### B4 (exit 0)
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

#### B6a (exit 1)
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

#### B6b (exit 0)
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

#### B6c_mas1 (exit 0)
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

#### B6c_x20 (exit 1)
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

#### B6d (exit 1)
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

#### B6e_pendiente (exit 0)
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

#### B6e_dominio (exit 1)
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

#### B6e_numero (exit 1)
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

#### B6f_ceros (exit 1)
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

#### B6f_tramposa (exit 0)
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

#### B6g (exit 1)
```
Funcion: qt
P1 no implementado en arnes-v1 (etiquetas P1: qt_resto, qt_ngt2); P1 llega con arnes-v2 en la sesion 2
ROJO
(escrito stats/informes/_ultimo_qt.json)
```

#### h (exit 1)
```
Funcion: erf
el modulo file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_solo_guion.js no exporta 'erf'
ROJO
(escrito stats/informes/_ultimo_erf.json)
```

#### fallos_0c (exit 0)
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

#### i (exit 1)
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
  ejemplo de fallo: id 519: no es RangeError: StatsError: object

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### j_funcion (exit 1)
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

#### j_valorcadena (exit 1)
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

#### k (exit 1)
```
Funcion: gamma
el CSV de gamma no tiene la(s) columna(s) fuera_de_rango que exige el arnes
ROJO
(escrito stats/informes/_ultimo_gamma.json)
```

#### l (exit 1)
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
  ejemplo de fallo: id 519: no es RangeError: StatsError: object

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### m (exit 1)
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

#### n (exit 1)
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

### Pruebas nuevas

#### o (exit 1)
```
Funcion: gamma
no se pudo cargar el modulo file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_tramo_infinito.js: Cannot assign to read only property 'tipo' of object '#<Object>'
ROJO
(escrito stats/informes/_ultimo_gamma.json)
```

#### p (exit 1)
```
Funcion: pgamma
no se pudo cargar el modulo file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_pgamma_dominios.js: Cannot assign to read only property 'pgamma' of object '#<Object>'
ROJO
(escrito stats/informes/_ultimo_pgamma.json)
```

#### u (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/k_new-u/stats/harness/_fakes/fake_gamma_pendiente.js
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
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza sin tolerancias.json › motivo de tipo cadena [n=120]
  fallos por clase: sin regla en el arnes=120
  10 peores: id 519: Infinity (sin regla en el arnes); id 522: Infinity (sin regla en el arnes); id 527: Infinity (sin regla en el arnes); id 538: Infinity (sin regla en el arnes); id 548: Infinity (sin regla en el arnes); id 551: Infinity (sin regla en el arnes); id 552: Infinity (sin regla en el arnes); id 555: Infinity (sin regla en el arnes); id 556: Infinity (sin regla en el arnes); id 559: Infinity (sin regla en el arnes)
  ejemplo de fallo: id 519: gamma_fuera tramo (40, a*): lanza sin tolerancias.json › motivo de tipo cadena

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_lanza_symbol (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_lanza_symbol (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: symbol: Symbol(raro)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_lanza_bigint (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_lanza_bigint (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: bigint: 10

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_lanza_nullproto (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_lanza_nullproto (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: object: object

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_lanza_proxy (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: valor no juzgable=1
  10 peores: id 5: Infinity (valor no juzgable); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: el valor lanzado (object) no se pudo juzgar sin usar sus metodos

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_lanza_proxy (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  fallos por clase: valor no juzgable=120
  10 peores: id 519: Infinity (valor no juzgable); id 522: Infinity (valor no juzgable); id 527: Infinity (valor no juzgable); id 538: Infinity (valor no juzgable); id 548: Infinity (valor no juzgable); id 551: Infinity (valor no juzgable); id 552: Infinity (valor no juzgable); id 555: Infinity (valor no juzgable); id 556: Infinity (valor no juzgable); id 559: Infinity (valor no juzgable)
  ejemplo de fallo: id 519: el valor lanzado (object) no se pudo juzgar sin usar sus metodos

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_lanza_funcion (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: : undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_lanza_funcion (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: : function

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_devuelve_symbol (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio symbol

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_devuelve_symbol (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio Symbol(raro); se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_devuelve_bigint (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio bigint

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_devuelve_bigint (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio 10; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_devuelve_nullproto (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio object

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_devuelve_nullproto (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio object; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_devuelve_proxy (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio object

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_devuelve_proxy (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio object; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### raro_erf_devuelve_funcion (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio function

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### raro_gamma_devuelve_funcion (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio function; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### s_pre (exit 0)
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

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

#### s (exit 0)
```
```

#### t1 --funcion "../_sentinela_0d" (exit 1)
```
Funcion: ../_sentinela_0d
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

#### t2 --funcion "x/../_sentinela_0d" (exit 1)
```
Funcion: x/../_sentinela_0d
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

#### t3 --funcion ".." (exit 1)
```
Funcion: ..
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

#### t4 --funcion "a b" (exit 1)
```
Funcion: a b
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

#### t5 --funcion "erf.x" (exit 1)
```
Funcion: erf.x
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

#### t6 --funcion "" (exit 1)
```
Funcion: 
--funcion debe ser un nombre simple (solo letras ASCII, digitos y _); no se borra ni se escribe ningun archivo
ROJO
```

## Salidas completas de los controles (respaldo)

#### control o (exit 0)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_tramo_infinito.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: pasa
  n=508  pasan=508  fallan=0
  max ulps=8.98832e+15  p99 ulps=8.65292e+15
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): Infinity ulps [n=120]
  10 peores: id 1013: 8.98832e+15; id 934: 8.86850e+15; id 898: 8.81674e+15; id 793: 8.80823e+15; id 785: 8.71471e+15; id 633: 8.65292e+15; id 624: 8.64984e+15; id 882: 8.62452e+15; id 625: 8.57790e+15; id 931: 8.34794e+15

VERDE
(escrito stats/informes/_ultimo_gamma.json)
```

#### control p (exit 0)
```
Funcion: pgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_pgamma_dominios.js
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

#### control u (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/k_old-u/stats/harness/_fakes/fake_gamma_pendiente.js
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
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza undefined [n=120]
  fallos por clase: StatsError con motivo o argumento distinto=120
  10 peores: id 519: Infinity (StatsError con motivo o argumento distinto); id 522: Infinity (StatsError con motivo o argumento distinto); id 527: Infinity (StatsError con motivo o argumento distinto); id 538: Infinity (StatsError con motivo o argumento distinto); id 548: Infinity (StatsError con motivo o argumento distinto); id 551: Infinity (StatsError con motivo o argumento distinto); id 552: Infinity (StatsError con motivo o argumento distinto); id 555: Infinity (StatsError con motivo o argumento distinto); id 556: Infinity (StatsError con motivo o argumento distinto); id 559: Infinity (StatsError con motivo o argumento distinto)
  ejemplo de fallo: id 519: motivo=pendiente argumento=a (esperado motivo=undefined argumento=a)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control raro_erf_lanza_symbol (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_lanza_symbol (exit 2)
```
ERROR DEL ARNES: TypeError: Cannot convert a Symbol value to a string
    at juzgarFallo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/tolerancia.js:118:127)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:130:17)
```

#### control raro_erf_lanza_bigint (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_lanza_bigint (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: bigint: 10

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control raro_erf_lanza_nullproto (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: undefined: undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_lanza_nullproto (exit 2)
```
ERROR DEL ARNES: TypeError: Cannot convert object to primitive value
    at juzgarFallo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/tolerancia.js:118:127)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:130:17)
```

#### control raro_erf_lanza_proxy (exit 2)
```
ERROR DEL ARNES: Error: trampa del Proxy
    at Object.get (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js:5:66)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:134:65)
```

#### control raro_gamma_lanza_proxy (exit 2)
```
ERROR DEL ARNES: Error: trampa del Proxy
    at Object.get (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js:8:66)
    at [Symbol.hasInstance] (<anonymous>)
    at juzgarFallo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/tolerancia.js:117:25)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:130:17)
```

#### control raro_erf_lanza_funcion (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=1
  10 peores: id 5: Infinity (excepcion no StatsError); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: : undefined

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_lanza_funcion (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: no es RangeError: : () => 1

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control raro_erf_devuelve_symbol (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio symbol

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_devuelve_symbol (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio Symbol(raro); se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control raro_erf_devuelve_bigint (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio bigint

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_devuelve_bigint (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio 10; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control raro_erf_devuelve_nullproto (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio object

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_devuelve_nullproto (exit 2)
```
ERROR DEL ARNES: TypeError: Cannot convert object to primitive value
    at String (<anonymous>)
    at juzgarFallo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/tolerancia.js:115:65)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:130:17)
```

#### control raro_erf_devuelve_proxy (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio object

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_devuelve_proxy (exit 2)
```
ERROR DEL ARNES: Error: trampa del Proxy
    at Object.get (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js:8:66)
    at String (<anonymous>)
    at juzgarFallo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/tolerancia.js:115:65)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:130:17)
```

#### control raro_erf_devuelve_funcion (exit 1)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_raro.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: ROJA
  n=534  pasan=533  fallan=1
  max ulps=Infinity  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: no devolvio number=1
  10 peores: id 5: Infinity (no devolvio number); id 3: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0
  ejemplo de fallo: id 5: devolvio function

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

ROJO (etiquetas rojas: erf_r2)
(escrito stats/informes/_ultimo_erf.json)
```

#### control raro_gamma_devuelve_funcion (exit 1)
```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_gamma_raro.js
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
  ejemplo de fallo: id 519: devolvio () => 1; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

#### control s_pre (exit 0)
```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/_fakes/fake_erf_mas1.js
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

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

#### control s (exit 0)
```
```

#### control t1 --funcion "../_sentinela_0d" (exit 2)
```
ERROR DEL ARNES: Error: ENOENT: no such file or directory, open 'C:\Users\RAVELLO CAMACHO\AppData\Local\Temp\s0d\old\stats\informes\_ultimo_..\_sentinela_0d.json'
    at writeFileSync (node:fs:2482:20)
    at terminar (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:51:3)
    at rojo (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:66:40)
    at main (file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:71:26)
    at file:///C:/Users/RAVELLO%20CAMACHO/AppData/Local/Temp/s0d/old/stats/harness/run.js:198:1
    at ModuleJob.run (node:internal/modules/esm/module_job:561:25)
    at async node:internal/modules/esm/loader:647:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\RAVELLO CAMACHO\\AppData\\Local\\Temp\\s0d\\old\\stats\\informes\\_ultimo_..\\_sentinela_0d.json'
}
```

#### control t2 --funcion "x/../_sentinela_0d" (exit 1)
```
Funcion: x/../_sentinela_0d
no existe tests/fixtures/x/../_sentinela_0d.csv
ROJO
(escrito stats/informes/_ultimo_x/../_sentinela_0d.json)
```

#### control t3 --funcion ".." (exit 1)
```
Funcion: ..
no existe tests/fixtures/...csv
ROJO
(escrito stats/informes/_ultimo_...json)
```

#### control t4 --funcion "a b" (exit 1)
```
Funcion: a b
no existe tests/fixtures/a b.csv
ROJO
(escrito stats/informes/_ultimo_a b.json)
```

#### control t5 --funcion "erf.x" (exit 1)
```
Funcion: erf.x
no existe tests/fixtures/erf.x.csv
ROJO
(escrito stats/informes/_ultimo_erf.x.json)
```

#### control t6 --funcion "" (exit 1)
```
Funcion: 
no existe tests/fixtures/.csv
ROJO
(escrito stats/informes/_ultimo_.json)
```

## SHA-256 nuevos
```
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac *stats/harness/csv.js
d5ae489702a94e00a4ed3709ec79fb523ac7236f88a0f730fee1117266f2544c *stats/harness/hexfloat.js
521449160a37c6f8e6820207d36387580cf173b545052e75a55655fa6b889263 *stats/harness/run.js
1752074fe4304e4da29b4fc23090cd6ddf26d7f8ed7ec17008cfb8c50be2fbab *stats/harness/tolerancia.js
4561caeeb76e2bb7c4e6e9678e0d4469aa02ea0064fb8d06e1b860968c919578 *stats/harness/ulps.js
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979 *stats/src/error.js
```

Archivos de prueba nuevos (no congelados con el arnés):
```
23fb80fbf747a0a91143b1799cac0f8327be793cd3b982ebe89f9c84dca92731 *stats/harness/_fakes/fake_gamma_tramo_infinito.js
d8fc17c93496af60b6fab8d36f946031f700b5d2f5dea005209e8b25e8114208 *stats/harness/_fakes/fake_pgamma_dominios.js
4b9d9fdeea20061a51a25641fec89d895074a1c7017e4a7b34ac95851937f937 *stats/harness/_fakes/fake_erf_raro.js
3f42d0e9fe7cd597e581ad97a9357b21484ec436aeea9dd133a426799fb9069a *stats/harness/_fakes/fake_gamma_raro.js
1b7848c3987e226c628b30366697b8fb73d79ee87e13512598c5089d6e8cd6bd *stats/harness/_fakes/fake_exit_cero.js
```

## Tiempo

Corrida de las dos tandas y armado del informe: 55 s.

## Script ejecutado
El script ejecutado es la versión unida en un solo archivo (`corrida_0d.txt`, escrito con una sola escritura y ejecutado con `bash`, sin cambios), no el comando en línea mostrado antes, que el intérprete cortó por longitud. Tiene cuatro diferencias menores respecto a ese comando: (1) `local m f` declarado en `tanda`; (2) `if/else` en lugar de `[ ] && ... || ...` en la comprobación de (s); (3) el encabezado de la columna de (t) dice «segunda línea de la salida»; (4) un comentario quitado. Tras la corrida el archivo se movió a `$TEMP/s0d/corrida_0d.txt`; no queda en el repo.
