# erfc · iteración 1

1. Función: `erfc` (`stats/src/erfc.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Rama 1: 1 − erf(x) para |x| ≤ 0.46875; rama 2 (≤ 4) y rama 3 con los coeficientes de Cody (Tablas III y IV) por Horner y la exponencial firmada e^(−x_hi²)·e^(−del) con x_hi = trunc(16x)/16; negativos por 2 − erfc(−x). Orden del producto de la rama 3 según C2 y constantes según C9. Exporta la erfc escalada S(v) = e^(v²)·erfc(v) como `_erfcScaled` (ramas 2 y 3 con E = 1) para D6.2, D6.3 y D6b.7.

3. Salida del arnés:

```
Funcion: erfc   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erfc_neg: pasa
  n=504  pasan=504  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.148762 (id 8)
  tolerancia aplicada: relativa 1e-15 [n=504; tol_ulps 4.5036-9.0072]
  10 peores: id 3: 1; id 7: 1; id 8: 1; id 1505: 1; id 1510: 1; id 1521: 1; id 1537: 1; id 1548: 1; id 1558: 1; id 1571: 1

Etiqueta erfc_r1: pasa
  n=511  pasan=511  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.218812 (id 10)
  tolerancia aplicada: relativa 1e-15 [n=511; tol_ulps 4.52719-9.00662]
  10 peores: id 2: 1; id 10: 1; id 13: 1; id 1950: 1; id 1951: 1; id 1953: 1; id 1956: 1; id 1963: 1; id 1974: 1; id 1982: 1

Etiqueta erfc_r2: pasa
  n=682  pasan=682  fallan=0
  max ulps=4  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.691084 (id 2504)
  tolerancia aplicada: relativa 1e-15 [n=682; tol_ulps 4.50584-9.00079]
  10 peores: id 1438: 4; id 2454: 4; id 2504: 4; id 2611: 4; id 2848: 4; id 2908: 4; id 1325: 3; id 1342: 3; id 1375: 3; id 1378: 3

Etiqueta erfc_r3: pasa
  n=1751  pasan=1751  fallan=0
  max ulps=6  p99 ulps=4
  fraccion de la tolerancia (peor fila)=0.750675 (id 962)
  tolerancia aplicada: relativa 1e-15 [n=1513; tol_ulps 4.50405-9.00576] | P2: 2 ulps de subnormal [n=43; tol_ulps 2] | P2: 0 exacto [n=195; tol_ulps 0]
  10 peores: id 614: 6; id 992: 6; id 356: 5; id 692: 5; id 704: 5; id 764: 5; id 962: 5; id 392: 4; id 578: 4; id 734: 4

VERDE
(escrito stats/informes/_ultimo_erfc.json)
```

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
