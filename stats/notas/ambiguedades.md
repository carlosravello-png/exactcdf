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

## #11 · Corte de la serie de C7 (sesión 1, primitivas)
- Sección: expediente C7 (l. 1392) y D6.2 paso 8 (l. 1457): «sumada hasta el primer término ≤ 2⁻⁵³·suma».
- Cita: «por la serie Σ_{n≥0} rh²ⁿ/(2n + 3) (folio 379, C7), sumada hasta el primer término ≤ 2⁻⁵³·suma».
- Lecturas: (a) el término que cumple el criterio se incluye en la suma y se corta; (b) se corta antes de sumarlo.
- Tomada (provisional, la más literal para «sumada hasta»): (a). `// AMBIGÜEDAD #11` en `phi1_serie` de `primitivas.js`. La diferencia es de 2⁻⁵³ relativo en f, que entra multiplicado por r³: no afecta ningún fixture previsible.

## #12 · Orden de producto y cociente dentro de las razones racionales de Cody (sesión 1, erf/erfc/pnorm)
- Sección: expediente 6.4 (l. 234) y T1 (l. 817, 831, 853): «erf(x) ≈ x·Σ pⱼx²ʲ / Σ qⱼx²ʲ»; «(1/x²)·Σ pⱼx⁻²ʲ / Σ qⱼx⁻²ʲ». C1 fija Horner, no el orden del producto con el cociente.
- Lecturas: (a) razón primero: x·(num/den), w·(num/den); (b) producto primero: (x·num)/den.
- Tomada (provisional): (a), la razón R(x²) como objeto y luego el factor, que es como el texto nombra «x·R(x²)». `// AMBIGÜEDAD #12` en `_erfR1` y en `corcheteR3` de `erfc.js`. Diferencia esperada: ≤ 1 ulp; el arnés da VERDE con (a).

## #13 · Cortocircuito e^(−x_hi²) = 0 en la exponencial de la cola (sesión 1, erfc/pnorm)
- Sección: expediente l. 237-243 (diseño de e^(−x²)): «e^(−x²) = e^(−x_hi²)·e^(−del)»; «erfc desborda a cero antes de x ≈ 27 → 16·x < 432».
- Hueco: el texto supone x < 27. Con x finito cerca de DBL_MAX, x + x_hi desborda a Infinity y (x − x_hi)·(x + x_hi) = 0·Infinity = NaN, y D4 v2 prohíbe devolver NaN con argumentos válidos.
- Lecturas: (a) calcular del solo si e^(−x_hi²) ≠ 0 (el producto con un factor 0 vale 0 de todos modos); (b) añadir un umbral explícito (x > 27 → 0), que el texto no escribe y CLAUDE.md §4 prohíbe.
- Tomada (provisional): (a). No cambia ningún valor donde el texto está definido. `// AMBIGÜEDAD #13` en `_expMenosX2` (erfc.js) y en `fi` (pnorm.js).

## #12 (ampliación, lgamma/gamma1pm1) · mismo orden «razón primero» en los Apéndices C y D
- Los Apéndices C y D (DM86) escriben `lnΓ(1 + x)/x = −P/Q`, `H(a) = a(ω + 1)`, `(t/a)ω`, etc. Se evalúan con la razón P/Q completa primero y después el factor (x, a, t/a), igual que en #12. `// AMBIGÜEDAD #12` en `_lgammaApD` y `_gamma1pm1`. El arnés da VERDE con esta lectura.

## #14 · Hoja (11) con R = 0 (sesión 1, pgamma)
- Sección: DM86 (11) `Q(a, x) = R(a, x)·[fracción continua]` (expediente l. 1004) y C3 (l. 1381, reescalado de Aₙ y Bₙ), D6.1 (l. 1428: «si x/2 también se hunde, R es en verdad menor que el menor double»).
- Hueco: con x enorme (a < 1, x ≥ 1.1 va por (11) sin tope superior) los Bₙ crecen como xⁿ y desbordan antes de que el reescalado de C3 (solo después de cada par de pasos) actúe: ∞/∞ = NaN, que D4 v2 prohíbe devolver. Pasa solo cuando R es 0 (x > ~745).
- Lecturas: (a) si R = 0, Q = 0 sin evaluar la fracción (el producto es 0 para cualquier fracción finita); (b) añadir un umbral explícito en x, que el texto no escribe.
- Tomada (provisional): (a). `// AMBIGÜEDAD #14` en `hoja11` de `pgamma.js`. No cambia ningún valor donde la fracción es finita.

## #15 · Evaluación de (28) y de las reducciones de BETALN (sesión 1, pbeta)
- Sección: expediente 3a.5 (l. 1586), B22 (l. 1986), C35 (l. 1918) y C34 (l. 1917); 3a.6 (l. 1597).
- Cita: «(28) se suma con n ascendente, con S acumulada: S₁ = 1 y S_{m+2} = S_m + q^m + q^(m+1)»; «BETALN multiplica los factores de la reducción de a, y de la de b (3a.6), y toma un solo logaritmo».
- Hueco: el texto no fija cómo se forman q^m y b^(2n) (potencia directa o producto corriente), ni en qué orden se aplican las reducciones de a y de b, ni la forma exacta de cada factor.
- Lecturas: (a) productos corrientes (qm ← qm·q², bp ← bp·b²) y reducción primero de a y luego de b, con el factor (a − 1)/(a + b − 1) escrito como a′/(a′ + b), a′ = a − 1; (b) `Math.pow` y otra forma de factor.
- Tomada (provisional): (a). `// AMBIGÜEDAD #15` en `wDelta` y `betaln` de `pbeta.js`. Con (a) el arnés da VERDE (diferencia máxima con la tabla de D6b: 8 ulps).

## #16 · Contabilidad de los bucles de BGRAT, BFRAC y BASYM (sesión 1, pbeta)
- Sección: expediente D6b.6 (l. 1837-1849), 3a.4 (l. 1562-1567), C33 (l. 1916), B26 (l. 1988), #T2-6.
- Hueco: (a) «ln 2⁻¹⁰⁷⁴» del paso 3 de D6b.6 no dice cómo se escribe en double; (b) en BASYM, «dos términos seguidos bajo 100ε·|suma|» no dice si el término n = 0 cuenta y si el contador se reinicia; (c) en BGRAT, el corte «|término| ≤ 15ε·|suma|» no dice si p₀J₀ cuenta.
- Tomadas (provisionales): (a) `-1074 * Math.LN2`; (b) el término n = 0 no cuenta, y el contador se reinicia a 0 si un término supera el umbral; (c) p₀J₀ entra en la suma pero el corte se evalúa desde n = 1. `// AMBIGÜEDAD #16` en `bgrat` y `basym`. No cambian ningún veredicto del arnés.
