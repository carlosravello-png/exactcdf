# erfc · iteración 1

1. Función: `erfc` (`stats/src/erfc.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Rama 1: 1 − erf(x) para |x| ≤ 0.46875; rama 2 (≤ 4) y rama 3 con los coeficientes de Cody (Tablas III y IV) por Horner y la exponencial firmada e^(−x_hi²)·e^(−del) con x_hi = trunc(16x)/16; negativos por 2 − erfc(−x). Orden del producto de la rama 3 según C2 y constantes según C9. Exporta la erfc escalada S(v) = e^(v²)·erfc(v) como `_erfcScaled` (ramas 2 y 3 con E = 1) para D6.2, D6.3 y D6b.7.

3. Salida del arnés:

@@ARNES@@

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna. (Las 43 filas subnormales y las 195 de cero de erfc_r3 pasan P2.)

5. No aplica.

6. Ambigüedades de esta iteración: **#12** y **#13** (ver `notas/ambiguedades.md`).

7. Comparación con la tabla del expediente: sin tabla.

8. Tiempo aproximado: incluido en el de erf.

## Cierre de erfc
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 2 (#12, #13).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: sin tabla.
- Pruebas propias: `prueba_dominio.mjs erfc` → VERDE; `prueba_extremos.mjs` → VERDE (erfc(DBL_MAX) = 0, erfc(−DBL_MAX) = 2, sin NaN).
