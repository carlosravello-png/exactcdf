# lgamma · iteración 1

1. Función: `lgamma(a)` (`stats/src/lgamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. 0.8 ≤ a ≤ 2.25 por el Ap. D (forma 1 + x si a < 1.6 y 2 + x si a ≥ 1.6, 3a.2); a < 0.8 por lnΓ(a + 1) − ln a; 2.25 < a < 15 por la reducción n = ⌈a − 2.25⌉ con un solo logaritmo del producto, k ascendente (3a.1, C15); a ≥ 15 por (((a − ½) ln a − a) + ½ ln 2π) + Δ(a) con Δ de (24) por Horner en 1/a² (C12–C14). Dominio a > 0 estricto.

3. Salida del arnés:

```
Funcion: lgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta lgamma_d: pasa
  n=516  pasan=516  fallan=0
  max ulps=13  p99 ulps=12
  fraccion de la tolerancia (peor fila)=0.225946 (id 441)
  tolerancia aplicada: max(1e-14*|ref|, 2.9e-16) [n=516; tol_ulps 45.1798-5.86967e+307]
  10 peores: id 158: 13; id 69: 12; id 248: 12; id 259: 12; id 441: 12; id 518: 12; id 1: 11; id 3: 11; id 9: 11; id 226: 11

Etiqueta lgamma_delta: pasa
  n=505  pasan=505  fallan=0
  max ulps=2  p99 ulps=2
  fraccion de la tolerancia (peor fila)=0.0377939 (id 1445)
  tolerancia aplicada: relativa 1e-14 [n=505; tol_ulps 45.1572-89.7605]
  10 peores: id 21: 2; id 1060: 2; id 1076: 2; id 1079: 2; id 1144: 2; id 1157: 2; id 1178: 2; id 1239: 2; id 1248: 2; id 1266: 2

Etiqueta lgamma_red: pasa
  n=521  pasan=521  fallan=0
  max ulps=3  p99 ulps=2
  fraccion de la tolerancia (peor fila)=0.0517715 (id 695)
  tolerancia aplicada: relativa 1e-14 [n=521; tol_ulps 45.2431-90.0699]
  10 peores: id 12: 3; id 673: 3; id 695: 3; id 14: 2; id 16: 2; id 18: 2; id 578: 2; id 637: 2; id 711: 2; id 712: 2

VERDE
(escrito stats/informes/_ultimo_lgamma.json)
```

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
