# gamma · iteración 1

1. Función: `gamma(a)` (`stats/src/gamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. 0.8 ≤ a ≤ 2.25: exp(lnΓ) con el Ap. D; (0, 0.8): Γ(a + 1)/a; (2.25, 40]: Γ(núcleo) y después los factores (a − 1)(a − 2)⋯(a − n), k ascendente (D1, 3a.3). 40 < a < a\* lanza `StatsError` `pendiente` (argumento `a`, región `gamma_fuera`); a ≥ a\* y 0 < a ≤ a_low devuelven +Infinity, con las constantes leídas de `reglas.json` por `constantes.js`.

3. Salida del arnés:

@@ARNES@@

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna. (Las 120 filas del tramo (40, a\*) pasan las seis comprobaciones de fallo.)

5. No aplica.

6. Ambigüedades de esta iteración: ninguna nueva (D1, 3a.3 y C15 fijan método, orden y n).

7. Comparación con la tabla del expediente: sin tabla.

8. Tiempo aproximado: incluido en el de lgamma.

## Cierre de gamma
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 0.
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: sin tabla.
- Prueba propia de las fronteras que `gamma.csv` no tiene (`node stats/notas/prueba_gamma.mjs`, VERDE):
  - gamma(40) = 2.0397882081197447e+46 (número, por la recurrencia; 39! = 2.0397882081197443e46);
  - gamma(a\*) = +Infinity; gamma(a_low) = +Infinity (a\* y a_low leídos de `reglas.json`);
  - gamma(a\* − 1 ulp) y gamma(40 + 1 ulp) lanzan `pendiente`; gamma(a_low + 1 ulp) = 1.7976931348623143e+308 (finito);
  - a = 0, −0, −1, NaN, ±Infinity lanzan `dominio` con `funcion` "gamma" y `valor` original.
- `prueba_dominio.mjs gamma` → VERDE.
