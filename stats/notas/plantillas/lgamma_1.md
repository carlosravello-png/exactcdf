# lgamma · iteración 1

1. Función: `lgamma(a)` (`stats/src/lgamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. 0.8 ≤ a ≤ 2.25 por el Ap. D (forma 1 + x si a < 1.6 y 2 + x si a ≥ 1.6, 3a.2); a < 0.8 por lnΓ(a + 1) − ln a; 2.25 < a < 15 por la reducción n = ⌈a − 2.25⌉ con un solo logaritmo del producto, k ascendente (3a.1, C15); a ≥ 15 por (((a − ½) ln a − a) + ½ ln 2π) + Δ(a) con Δ de (24) por Horner en 1/a² (C12–C14). Dominio a > 0 estricto.

3. Salida del arnés:

@@ARNES@@

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: **#12** (orden razón/factor en el Ap. D). Las ambigüedades #T2-1 a #T2-3 de los lotes T ya las resolvió 3a.

7. Comparación con la tabla del expediente: sin tabla.

8. Tiempo aproximado: 15 minutos (con gamma y gamma1pm1).

## Cierre de lgamma
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 1 (#12).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: sin tabla.
- Pruebas propias: `prueba_dominio.mjs lgamma` → VERDE; `prueba_gamma.mjs` → VERDE (a = 0, −0, −1, NaN, ±Infinity lanzan `dominio` con `funcion` "lgamma"; lgamma(1) = lgamma(2) = 0 exactos; a subnormal mínimo finito).
