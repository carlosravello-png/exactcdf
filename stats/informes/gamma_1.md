# gamma · iteración 1

1. Función: `gamma(a)` (`stats/src/gamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. 0.8 ≤ a ≤ 2.25: exp(lnΓ) con el Ap. D; (0, 0.8): Γ(a + 1)/a; (2.25, 40]: Γ(núcleo) y después los factores (a − 1)(a − 2)⋯(a − n), k ascendente (D1, 3a.3). 40 < a < a\* lanza `StatsError` `pendiente` (argumento `a`, región `gamma_fuera`); a ≥ a\* y 0 < a ≤ a_low devuelven +Infinity, con las constantes leídas de `reglas.json` por `constantes.js`.

3. Salida del arnés:

```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=2  p99 ulps=2
  fraccion de la tolerancia (peor fila)=0.0389596 (id 220)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 2; id 165: 2; id 220: 2; id 224: 2; id 277: 2; id 293: 2; id 419: 2; id 3: 1; id 5: 1; id 9: 1

Etiqueta gamma_fuera: pasa
  n=508  pasan=508  fallan=0
  max ulps=6  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.0689266 (id 705)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  10 peores: id 705: 6; id 823: 3; id 930: 3; id 969: 3; id 599: 2; id 648: 2; id 670: 2; id 675: 2; id 684: 2; id 700: 2

VERDE
(escrito stats/informes/_ultimo_gamma.json)
```

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
