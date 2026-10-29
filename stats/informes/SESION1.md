# Sesión 1 · cierre (26/10/2026, hora local de Carlos, UTC−5)

Rama `construccion`, commit de partida `d3b2c84`. Node v24.22.1 (V8 de Windows). Los nueve SHA-256 de «Congelado arnes-v1» se comprobaron al inicio y otra vez al final de la sesión: coinciden. Nada se escribió fuera de `stats/` (`git status --short` solo lista rutas bajo `stats/`). Nada de `stats/harness/` ni de `stats/src/error.js` se tocó.

## Las nueve etapas

| etapa | estado | iteraciones | ambigüedades | diferencia máxima con el expediente |
|---|---|---|---|---|
| primitivas | VERDE (los cinco casos del encargo coinciden al bit) | 1 | 1 (#11) | los 5 valores del encargo: 0 |
| erf | VERDE | 1 | 2 (#12, #13) | sin tabla |
| erfc | VERDE | 1 | 2 (#12, #13) | sin tabla |
| pnorm | VERDE | 1 | 2 (#12, #13) | 0 (pnorm_r2: 6 ulps frente a 6); r1 y cola: sin tabla |
| lgamma | VERDE | 1 | 1 (#12, ampliada) | sin tabla |
| gamma | VERDE | 1 | 0 | sin tabla |
| gamma1pm1 | VERDE | 1 | 1 (#12, ampliada) | sin tabla |
| pgamma | VERDE | 1 | 1 (#14) | 0 (temme 917, lejos 184, n19 44) |
| pchisq | VERDE | 1 | 0 propias (hereda #14) | 0 en el máximo (temme 917, lejos 93); p99 de lejos 21 frente a 23 |
| pbeta | VERDE | 1 | 2 (#15, #16) | 8 ulps (bupbgrat15: 57 frente a 49); el resto de las diez etiquetas entre 0 y 3 |

(Son diez filas porque erf, erfc y pnorm van por separado; el encargo cuenta «primitivas y ocho funciones»: erf, erfc, pnorm, lgamma, gamma, gamma1pm1, pgamma/pchisq y pbeta; pchisq tiene su propio informe.) Ninguna etapa llegó a PARADA. Los informes están en `stats/informes/<funcion>_1.md`, cada uno con la salida completa del arnés y, al final, las cuatro cifras de CLAUDE.md §10.

## Ambigüedades de esta sesión (copia completa en `notas/ambiguedades.md`; #1 a #10 son de las sesiones 0 a 0d)

| # | sección del expediente | tema | lectura tomada |
|---|---|---|---|
| 11 | C7 (l. 1392) y D6.2 paso 8 | corte de la serie de φ₁ («hasta el primer término ≤ 2⁻⁵³·suma») | el término que cumple se incluye en la suma |
| 12 | 6.4, T1 (Cody, Ap. C y D) | orden de producto y cociente en las razones racionales | la razón primero: x·(num/den) |
| 13 | diseño de e^(−x²), l. 237-243 | e^(−x_hi²) = 0 con x cerca de DBL_MAX daría 0·NaN | si el primer factor es 0, el producto es 0 (no se añade umbral) |
| 14 | DM86 (11), C3 y D6.1 | Q = R·CF con R = 0 y x enorme daría ∞/∞ | si R = 0, Q = 0 sin evaluar la fracción |
| 15 | 3a.5, B22, C35, C34, 3a.6 | cómo se forman q^m y b^(2n) en (28); orden de las reducciones de BETALN | productos corrientes; primero a, luego b |
| 16 | D6b.6, 3a.4, C33, B26, #T2-6 | ln 2⁻¹⁰⁷⁴ en double; qué términos cuentan en el corte de BASYM y BGRAT | −1074·Math.LN2; n = 0 no cuenta; el contador de BASYM se reinicia |

Ninguna cambia un veredicto del arnés ni un valor donde el texto está definido. #13 y #14 existen porque D4 v2 prohíbe devolver NaN con argumentos válidos y el texto supone rangos (x < 27; x < ~745) que el dominio público no tiene.

## Pruebas propias fuera de los fixtures (scripts en `stats/notas/`)

- `prueba_primitivas.mjs`: los cinco casos de primitivas.
- `prueba_cola.mjs <f>`: valor por omisión de `lowerTail` con tres filas del CSV (pnorm, pgamma, pchisq, pbeta); 1, "true", null, 0 y "" lanzan `tipo`.
- `prueba_dominio.mjs <f> [extras.json]`: NaN, ±Infinity, cadena, undefined y null en cada argumento, más casos propios (a ≤ 0, −0, x < 0, x > 1, ν < 2⁻¹⁰⁷³): `funcion`, `motivo`, `argumento` y `valor` correctos.
- `prueba_gamma.mjs`: gamma(40) por la recurrencia, gamma(a\*) y gamma(a_low) = +Infinity, a\* − 1 ulp y 40 + 1 ulp lanzan `pendiente`, a_low + 1 ulp finito.
- `prueba_pgamma.mjs`: `pgamma_indet` (pgamma y pchisq lanzan `indeterminado` con argumento `a` / `nu`, región `pgamma_indet`, valor original) y barrido de 1 950 combinaciones de extremos.
- `prueba_pbeta.mjs`: bordes x = 0 y x = 1 y barrido de 11 664 combinaciones con P + Q = 1.
- `prueba_extremos.mjs`: erf, erfc y pnorm en ±DBL_MAX, sin NaN.
- Auditoría de `src/` por grep (la misma que hará el supervisor): `node:fs` solo en `error.js` y `constantes.js`; ningún `require`, `import(`, `globalThis`, `defineProperty`, `process.`, asignación a `Math.*`/`Number.*`/`Object.*`/prototipos; cada `StatsError(` fuera de `error.js` es `throw new StatsError({` con literal; las asignaciones a campos de error están solo en `error.js`; los archivos de `src/` importan solo otros de `src/`.

## Lo que no pude comprobar, y por qué

- **Un solo entorno.** Todo se midió en Windows con Node 24.22.1; la corrida en un segundo entorno (otra PC o el contenedor de Cowork) sigue pendiente (tolerancias.md, «Pendientes»).
- **Parámetros por encima de los fixtures** (máx(a, b) > 10⁵ en pbeta, a > 10⁵ en pgamma): no se añadió ninguna guarda (D7). Los barridos solo comprueban que no haya NaN, excepción ni valor fuera de [0, 1]; no hay referencia que juzgue su precisión.
- **Las rutas de la guarda de rango de D6.2 (x + a ≥ 2⁹⁹⁵) y de 5.5** se ejercitan con el barrido (a hasta 1.79·10³⁰⁸, x hasta 1.79·10³⁰⁸), pero sin valores de referencia.
- **`message`** de `StatsError` no lo juzga el arnés; solo vi a ojo los de `pendiente` e `indeterminado`. Queda para la auditoría de código.
- **pt, qt, qnorm, qgamma, qchisq, qbeta:** fuera de esta sesión (decisiones abiertas y `arnes-v2`).
- **Criterio de la «peor fila»:** el arnés da las 10 peores filas por etiqueta; los máximos de esta sesión son los de esa salida, en Node/V8 de Windows.

## Incidencias de proceso

- Un comando de shell con varios heredocs largos falló al analizarse y no escribió nada; se rehizo archivo por archivo con la herramienta de escritura.
- Un `node -e` incluido por descuido al final de un comando fue denegado por las reglas; no se reintentó (no hacía falta).
- No se pidió nada a nadie fuera de `stats/`, no se usó git salvo `rev-parse` y `status`, no se instaló ningún paquete.

## Tiempo aproximado por etapa

Lectura del expediente y los JSON: 35 min · primitivas: 10 min · erf, erfc y pnorm: 25 min · lgamma, gamma y gamma1pm1: 15 min · pgamma y pchisq: 35 min · pbeta: 40 min · informes y cierre: 15 min. Total ≈ 2 h 55 min.

SESION1.md está en `stats/informes/SESION1.md`.
