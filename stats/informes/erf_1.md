# erf · iteración 1

1. Función: `erf` (`stats/src/erf.js`, con el núcleo de Cody en `erfc.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Rama 1 (|x| ≤ 0.46875): x·R(x²) con los coeficientes de Cody (Tabla II) por Horner. Ramas 2 y 3: erf(x) = signo(x)·(1 − erfc(|x|)) (C10), con erfc como función interna (su prueba propia es el informe de erfc). Validación de entrada solo en el envoltorio público.

3. Salida del arnés:

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=2  p99 ulps=2
  fraccion de la tolerancia (peor fila)=0.372239 (id 509)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 77: 2; id 105: 2; id 107: 2; id 128: 2; id 137: 2; id 144: 2; id 147: 2; id 153: 2; id 155: 2; id 158: 2

Etiqueta erf_r2: pasa
  n=534  pasan=534  fallan=0
  max ulps=4  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.444288 (id 877)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  10 peores: id 877: 4; id 9: 2; id 17: 2; id 689: 2; id 783: 2; id 3: 1; id 5: 1; id 7: 1; id 12: 1; id 14: 1

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

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
