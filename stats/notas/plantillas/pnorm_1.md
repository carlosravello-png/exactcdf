# pnorm · iteración 1

1. Función: `pnorm(z, lowerTail)` (`stats/src/pnorm.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Φ(w) con w = z (cola inferior) o −z (superior). Rama decidida con `Math.abs(z)/Math.SQRT2 <= 0.46875` (C11); en las ramas 2 y 3 la parte racional de Cody recibe x = |z|/√2 y la exponencial se calcula desde z (paquete 4, 4.1), no solo en la cola. `lowerTail` omitido o `undefined` vale `true`.

3. Salida del arnés:

@@ARNES@@

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
