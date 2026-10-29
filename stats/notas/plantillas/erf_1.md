# erf · iteración 1

1. Función: `erf` (`stats/src/erf.js`, con el núcleo de Cody en `erfc.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Rama 1 (|x| ≤ 0.46875): x·R(x²) con los coeficientes de Cody (Tabla II) por Horner. Ramas 2 y 3: erf(x) = signo(x)·(1 − erfc(|x|)) (C10), con erfc como función interna (su prueba propia es el informe de erfc). Validación de entrada solo en el envoltorio público.

3. Salida del arnés:

@@ARNES@@

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: **#12** (orden de x·R(x²); expediente 6.4 y T1) y **#13** (cortocircuito de e^(−x_hi²) = 0, expediente l. 237-243, usado vía erfc). Copia en `notas/ambiguedades.md`.

7. Comparación con la tabla del expediente: sin tabla (el expediente no trae máximos para erf).

8. Tiempo aproximado: 20 minutos (con erfc y pnorm).

## Cierre de erf
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 2 (#12, #13).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: sin tabla.
- Pruebas propias: `node stats/notas/prueba_dominio.mjs erf` → VERDE (6 casos: NaN, ±Infinity, cadena, undefined, null); `node stats/notas/prueba_extremos.mjs` → VERDE (erf(±DBL_MAX) = ±1, erf(±0) = 0).
