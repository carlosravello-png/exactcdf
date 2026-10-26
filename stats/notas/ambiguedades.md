# Ambigüedades · sesión 0 (error.js y arnés)

Cada apunte: fuente, cita, lecturas posibles, y la que se toma provisionalmente (la más literal).

## #1 · Módulos ES sin `package.json` en `stats/`
- Fuente: `CLAUDE.md` §8 («módulos ES `export function erf(x)`») y §3 («no se crean archivos de configuración en la raíz»).
- Hueco: un `.js` con `import`/`export` solo se carga como ES si hay un `package.json` con `"type": "module"` en la ruta (Node 20.0–20.18 no detecta ESM por sintaxis; P2 pide «20 o superior»).
- Lecturas: (a) confiar en la detección automática de Node ≥ 22.7 / 20.19; (b) crear `stats/package.json` con `{"type":"module"}`.
- Tomada: (b), dentro de `stats/` (no es la raíz). Sin dependencias ni scripts. Si el supervisor lo considera prohibido, se borra y se exige Node ≥ 20.19.

## #2 · `argumento` esperado en `informa_fallo` (pgamma_indet)
- **RESUELTA** por el paquete 6 (6.2, 6.3: `reglas.json › informa_fallo.argumento`, `a` en pgamma, `nu` en pchisq) y la sesión 0b: el arnés exige `name`, `motivo` y `argumento` (ver `informes/arnes_2.md`).
- Fuente: `reglas.json › informa_fallo`: «no tiene numero: se prueba que lance StatsError con motivo indeterminado (D4 v2)». `tolerancias.json › pgamma_indet`: `clase: vacia`, `tipo: informa_fallo`, sin argumento.
- Lecturas: (a) exigir solo `name` y `motivo`; (b) exigir además un `argumento` (¿`x`? ¿`a`?), que ningún texto fija.
- Tomada: (a). `tolerancia.js` devuelve `argumento` indefinido y no se compara. `arnes_fallos` exige `argumento` «iguales a los esperados»: aquí no hay esperado. Ningún fixture tiene la etiqueta `pgamma_indet`, así que hoy no afecta.

## #3 · Números dentro de textos de `reglas.json`
- **RESUELTA** por el paquete 6 (6.1, 6.2: `P2.subnormal_ulps`, `informa_fallo.motivo`) y la sesión 0b: `tolerancia.js` lee los campos y ya no tiene expresiones regulares (`informes/arnes_2.md`).
- Fuente: `reglas.json › P2.subnormal` («<= 2 ulps de subnormal (2 * 2^-1074)») e `informa_fallo` («con motivo indeterminado»). No son campos estructurados.
- Lecturas: copiar el 2 y el motivo a mano (prohibido por la sesión: «ningún número de tolerancia ni constante copiado a mano») o extraerlos del texto.
- Tomada: extraerlos del texto con una expresión regular (`tolerancia.js`); si el texto cambia de forma, el arnés lanza error al cargar. Se sugiere al supervisor estructurar esos campos (`"subnormal_ulps": 2`, `"motivo": "indeterminado"`).

## #4 · Signo del cero y P2 «cero»
- Fuente: `reglas.json › P2.cero`: «0 exacto»; D4 v2 punto 3: «No se exige el signo del cero en el resultado: el arnés mide |x − ref|».
- Tomada: `-0` y `0` son iguales (`ulps(-0, 0) = 0`).

## #5 · Huecos entre tramos de `gamma_fuera`
- Fuente: `tolerancias.json › gamma_fuera.tramos`: (0, 0.8), (2.25, 40], (40, a*). Los valores 0.8 ≤ a ≤ 2.25 no pertenecen a ningún tramo (son de `gamma_d`).
- Tomada: una fila `gamma_fuera` con `a` fuera de los tramos y sin `fuera_de_rango` se cuenta como fallo del arnés (`sin regla en el arnes`). En `gamma.csv` no ocurre (508 filas de `gamma_fuera`: 262 + 126 + 120 en los tres tramos).

## #6 · Cuándo se niega el arnés por P1
- Fuente: `CLAUDE.md` §5 («`run.js` se niega a juzgar una función con etiquetas P1») y prompt B5.
- Lecturas: (a) negarse si el CSV tiene alguna fila P1; (b) negarse si las filas seleccionadas tienen alguna.
- Tomada: (b). `--funcion qt` sin `--region` se niega; `--funcion qt --region qt_cerradas` (tipo `ulps`, no P1) se juzga.

## #7 · Etiquetas `*_sub` e `indet` sin filas
- Fuente: `tolerancias.json` (`erfc_sub`, `pnorm_sub`, `pgamma_sub`, `pbeta_sub`, `pgamma_indet`). Ningún CSV usa esas etiquetas en la columna `region`; las filas subnormales llevan la etiqueta de su tramo y `fuera_de_rango = subnormal`.
- Tomada: rige la precedencia de `reglas.json` (la referencia decide); las etiquetas `*_sub` (`tipo P2`) se resuelven por la referencia (0 → cero; otro → subnormal) por si algún día aparecen.

## #8 · B6(f): cuántas filas subnormales de erfc fallan con una función que devuelve 0
- Fuente: prompt B6(f) («ROJO en esas filas») y `reglas.json › P2.subnormal`.
- Observación: de las 43 filas `subnormal` de `erfc.csv`, fallan 41; las otras 2 tienen referencia de ≤ 2 ulps de subnormal y 0 está dentro de P2. No es un defecto: es lo que dice P2.

## #9 · Ampliaciones del arnés no pedidas
- **RESUELTA** (ver también #10) en la sesión 0b: las ampliaciones se mantienen tal cual y quedan registradas en `informes/arnes_1.md`/`arnes_2.md` para la auditoría; la reserva `_<f>` queda restringida a gamma1pm1 (`run.js`).
- `run.js --ids <lista>` (depuración: detalle de filas concretas), `hexfloat.aHex`, y en `error.js` `MOTIVOS`, `dominioDe`, `argumentosDe`. No cambian ningún juicio.

## #10 · Qué argumento selecciona el tramo en `gamma_fuera` (sesión 0b)
- Fuente: `tolerancias.json › gamma_fuera.tipo = "tramos_por_a"`; el paquete 6 (6.4) estructura solo el `argumento` del tramo que lanza, no la variable que elige el tramo.
- Hueco: ningún campo dice por qué argumento se parte; solo lo dice el sufijo del nombre del tipo.
- Lecturas: (a) sufijo del tipo (`"tramos_por_".length`, sin expresión regular); (b) fijar `a` en el código.
- Tomada: (a), comentada `// AMBIGÜEDAD #10` en `tolerancia.js`. Se sugiere al supervisor un campo `variable` en `gamma_fuera`.
