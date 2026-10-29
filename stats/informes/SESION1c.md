# Sesión 1c · paquete 10 aplicado en `stats/src/`

Fecha: 29/10/2026 (hora local de Carlos, UTC−5). Rama `construccion`, partida en `79ba555`. Nada de git salvo P1 (rama, HEAD y estado limpio, comprobados al empezar).

## 1. Cambios (archivo, línea, subsección del paquete 10)

| Tarea | Archivo · línea | Subsección | Qué hace |
|---|---|---|---|
| T1 | `pgamma.js` · import l. 11; `hoja11` l. 203-211 | 10.0, 10.1 | Con `a <= GAMMA_A_LOW` (importada de `constantes.js`): `previo = (e⁻ˣ·xᵃ)·(1 + H(a))`; si `previo === 0`, Q = 0; si no, `Q = (previo·fracción)·a`, el factor a al final. Con a > a_low, el código de 9.2 queda igual. |
| T2 | `pbeta.js` · `lnG` l. 116-121 | 10.2 | Con `s <= GAMMA_A_LOW`: `ln s + ln[(1 + H(s))·razón]`, y si `l <= GAMMA_A_LOW` la razón es `l/(s + l)`. Con s > a_low sin cambios. |
| T3 | `pbeta.js` · `bgrat`, paso 5, l. 269-281 | 10.3 | Con `b <= GAMMA_A_LOW` y `u < 1.1`: `J₀ = eᵘ·[(−γ − ln u) − Σ(−u)ⁿ/(n·n!)]`, γ = literal p₀ `.577215664901533E+00` (bloque `dm86_apC`, expediente l. 883), corte `2 ** -53` y tope 10 000. Con `u >= 1.1` o `b > a_low` sin cambios. |
| T4 | `pbeta.js` · `bup` l. 240-247 | 10.4 | Con `a <= GAMMA_A_LOW`: `exp(a ln x + b ln y + ln G − ln a)·Σ` por `combina` (D6b.4), con la misma forma que BPSER. Con a > a_low sin cambios. |
| T5 | `primitivas.js` l. 88, 91, 108-109 | 10.6 | Comentario del tope 200 de `phi1_serie`; `2 ** -53`, `2 ** -1022`, `2 ** 54`. |
| T5 | `erfc.js` l. 79 | 10.6 | Comentario de `_expMenosX2` corregido (devuelve e^(−x²), un solo número). |
| T5 | `constantes.js` | 10.6 | Quitados `PARAMETRO_MIN` (comentario y export) y su mención en la cabecera. Sin otros usos en `stats/`. |
| T5 | `pbeta.js` l. 8 | 10.6 | Quitada la coma colgante de `import { _gamma, }`. |
| T5 | `lgamma.js` l. 79 | 10.6 | `lgamma` público devuelve `_lgamma(a) + 0`. |

`pbeta.js` y `pgamma.js` importan `GAMMA_A_LOW` de `constantes.js`; no se introduce ningún número nuevo. `error.js` y `stats/harness/` no se tocan.

## 2. Arnés sobre las nueve funciones (T6)

Veredicto: **VERDE en las nueve** (`erf`, `erfc`, `pnorm`, `lgamma`, `gamma`, `gamma1pm1`, `pgamma`, `pchisq`, `pbeta`). Comparados con los informes de la sesión 1 (`<funcion>_1.md`), **n, pasan, máx ulps y p99 ulps coinciden en todas las etiquetas** (49 etiquetas en total; pchisq usa las etiquetas `pgamma_*`). El paquete 10 no actúa en ninguna fila de los fixtures. Salidas completas en `stats/informes/_ultimo_<funcion>.json`.

Resumen de máximos / p99 (idénticos a la sesión 1):

- erf: r1 2/2, r2 4/1, r3 0/0.
- erfc: neg 1/1, r1 1/1, r2 4/3, r3 6/4.
- pnorm: cola 6/3, r1 2/1, r2 6/3.
- lgamma: d 13/12, delta 2/2, red 3/2.
- gamma: d 2/2, fuera 6/3.
- gamma1pm1: c 20/17.
- pgamma: a05 4/3, asin16 12/6, cf11_med 10/7, cf11_peq 15/9, lejos 184/71, n19 44/43, q10 19/11, s15 9/6, serie9 17/11, suma14 5/4, temme 917/211.
- pchisq: a05 3/3, asin16 12/10, cf11_med 8/6, cf11_peq 15/15, lejos 93/21, n19 44/44, q10 19/18, s15 9/7, serie9 17/13, suma14 4/3, temme 917/501.
- pbeta: basym_agtb 9/6, basym_aleb 9/5, bfrac20 121/41, bgrat14 16/10, bpser12 70/57, bpser13 48/19, bpser16 53/25, bup2bgrat19 102/56, bupbgrat15 57/24, bupbgrat18 81/21, bupbpser17 60/29.

Hallazgos: ninguno.

Nota de orden: tras las nueve corridas añadí un único comentario `// AMBIGÜEDAD #17` en `pgamma.js` (ver §5). Es solo un comentario; el código ejecutable no cambió después de las corridas.

## 3. Prueba propia (T7): `node stats/notas/prueba_p10.mjs`

```
ok    pbeta(5e-324, 5e-324, 5e-324, true) = 0.5000000000000275
ok    pbeta(5e-324, 5e-324, 5e-324, false) = 0.49999999999997247
ok    pbeta(0.2, 5e-324, 5e-324, true) = 0.5000000000000275
ok    pbeta(0.2, 5e-324, 5e-324, false) = 0.49999999999997247
ok    pbeta(0.05, 8.289046e-317, 20, true) = 1
ok    pbeta(0.05, 8.289046e-317, 20, false) = 1.8171473e-317
ok    pbeta(1e-10, 5.562684646268003e-309, 16, true) = 1
ok    pbeta(1e-10, 5.562684646268003e-309, 16, false) = 1.0962728597014597e-307
ok    pbeta(0.99, 2, 5.562684646268003e-309, true) = 2.0110051687242264e-308
ok    pbeta(0.99, 2, 5.562684646268003e-309, false) = 1
ok    pbeta(0.05, 5e-324, 8.095e-320, true) = 0.9999389685688129
ok    pbeta(0.05, 5e-324, 8.095e-320, false) = 0.00006103143118706437
ok    pgamma(1.1, 2**-1024, false) = 1.03460874900813e-309 > 0
ok    pchisq(2.2, 2**-1023, false) = 1.03460874900813e-309 > 0
ok    lgamma(1) = 0 es +0
ok    lgamma(2) = 0 es +0
ok    pgamma(1.1, 2**-1023, false) = 2.069217498016257e-309 (esperado 2.069217498016257e-309, sesión 1)

TODO OK
```

La precisión en esa región no se juzga aquí: la mide el supervisor con su barrido.

## 4. SHA de «Congelado arnes-v1» (T8)

Los nueve coinciden con la tabla del expediente (l. 2153-2161):

| archivo | SHA-256 | coincide |
|---|---|---|
| `stats/harness/csv.js` | `426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac` | sí |
| `stats/harness/hexfloat.js` | `d5ae489702a94e00a4ed3709ec79fb523ac7236f88a0f730fee1117266f2544c` | sí |
| `stats/harness/run.js` | `521449160a37c6f8e6820207d36387580cf173b545052e75a55655fa6b889263` | sí |
| `stats/harness/tolerancia.js` | `1752074fe4304e4da29b4fc23090cd6ddf26d7f8ed7ec17008cfb8c50be2fbab` | sí |
| `stats/harness/ulps.js` | `4561caeeb76e2bb7c4e6e9678e0d4469aa02ea0064fb8d06e1b860968c919578` | sí |
| `stats/harness/reglas.json` | `8e924927ff41a71aeac7b8f1e1c14bc076db22c82accd82153bc97be9be576c3` | sí |
| `stats/harness/tolerancias.json` | `560c42b1ac0f30024b60a67e2831a66eade37b38c9474f3ed56e9a3a3bea1d03` | sí |
| `stats/src/error.js` | `eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979` | sí |
| `stats/package.json` | `3ca9d4afd21425087cf31893b8f9f63c81b0b8408db5e343ca76e5f8aa26ab9a` | sí |

## 5. Ambigüedades

Una nueva, **#17** (copia en `notas/ambiguedades.md`): 10.1 escribe «e⁻ˣxᵃ(1 + H(a))» sin decir si, con x > 700, e⁻ˣ se desdobla como en D6.1. Tomada la lectura literal (`Math.exp(-x)` directo). No cambia ningún valor medible, porque con x ≤ 745 el resultado final cae bajo 2⁻¹⁰⁷⁵ de todos modos. Pendiente de lectura firmada. Comentario `// AMBIGÜEDAD #17` en `pgamma.js`, `hoja11`.

Lectura menor sin ambigüedad: en `bup` (10.4) el cuerpo de la suma no se tocó; solo se bifurca al final, según `a <= GAMMA_A_LOW`, entre `combina(…, Σ)` con −ln a en el logaritmo y el `brcompPor(…, Σ/a)` de siempre.

Archivos creados o editados: los de `stats/src/` listados arriba, `stats/notas/ambiguedades.md`, `stats/notas/prueba_p10.mjs`, `stats/informes/SESION1c.md` y los `_ultimo_*.json` que reescribe el arnés. Nada fuera de `stats/`.

`SESION1c.md` está en `stats/informes/SESION1c.md`.
