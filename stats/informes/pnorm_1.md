# pnorm · iteración 1

1. Función: `pnorm(z, lowerTail)` (`stats/src/pnorm.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Φ(w) con w = z (cola inferior) o −z (superior). Rama decidida con `Math.abs(z)/Math.SQRT2 <= 0.46875` (C11); en las ramas 2 y 3 la parte racional de Cody recibe x = |z|/√2 y la exponencial se calcula desde z (paquete 4, 4.1), no solo en la cola. `lowerTail` omitido o `undefined` vale `true`.

3. Salida del arnés:

```
Funcion: pnorm   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): z [+ lower_tail cuando la columna no esta vacia]

Etiqueta pnorm_cola: pasa
  n=3814  pasan=3814  fallan=0
  max ulps=6  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.723652 (id 1449)
  tolerancia aplicada: relativa 1e-15 [n=3557; tol_ulps 4.5-9.0072] | P2: 2 ulps de subnormal [n=97; tol_ulps 2] | P2: 0 exacto [n=160; tol_ulps 0]
  10 peores: id 1425: 6; id 3073: 6; id 1431: 5; id 3079: 5; id 597: 4; id 1359: 4; id 1365: 4; id 1377: 4; id 1419: 4; id 1449: 4

Etiqueta pnorm_r1: pasa
  n=520  pasan=520  fallan=0
  max ulps=2  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.431862 (id 3634)
  tolerancia aplicada: relativa 1e-15 [n=520; tol_ulps 4.51118-8.99595]
  10 peores: id 3524: 2; id 3632: 2; id 3634: 2; id 2: 1; id 8: 1; id 12: 1; id 15: 1; id 16: 1; id 19: 1; id 25: 1

Etiqueta pnorm_r2: pasa
  n=536  pasan=536  fallan=0
  max ulps=6  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.726422 (id 3895)
  tolerancia aplicada: relativa 1e-15 [n=536; tol_ulps 4.51031-9.0072]
  10 peores: id 3895: 6; id 4121: 6; id 4134: 5; id 4082: 4; id 4178: 4; id 3877: 3; id 3881: 3; id 3930: 3; id 3972: 3; id 3997: 3

VERDE
(escrito stats/informes/_ultimo_pnorm.json)
```

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: **#13** (cortocircuito e^(−z_h²/2) = 0) y, por la rama 1 y la parte racional, **#12**.

7. Comparación con la tabla del expediente: `pnorm_r2`: el expediente (4.1) da «0 fallos, máximo 6 ulps» con la exponencial desde z en las dos ramas; aquí 6 ulps, 0 fallos → diferencia 0. `pnorm_r1` y `pnorm_cola`: sin tabla.

8. Tiempo aproximado: incluido en el de erf.

## Cierre de pnorm
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 2 (#12, #13).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: 0 (pnorm_r2: 6 frente a 6); pnorm_r1 y pnorm_cola, sin tabla.
- Prueba propia de `lowerTail` por omisión (`node stats/notas/prueba_cola.mjs pnorm`), con las filas id 1, 2436 y 4870 del CSV:
  - `pnorm(z)`, `pnorm(z, true)` y `pnorm(z, undefined)` devuelven el mismo double al bit en las tres filas;
  - `lowerTail` = 1, "true", null (y además 0 y "") lanzan `StatsError` con motivo `tipo`, argumento `lowerTail`, función `pnorm` y `valor` original.
  Salida: VERDE.
- Otras pruebas propias: `prueba_dominio.mjs pnorm` → VERDE; `prueba_extremos.mjs` → VERDE (pnorm(±DBL_MAX) sin NaN).
