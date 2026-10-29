# pgamma · iteración 1

1. Función: `pgamma(x, a, lowerTail)` (`stats/src/pgamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Árbol de la Fig. 2 con las nueve hojas (8), (9), (10), (11), (14), (15), (16), (17) y (19) y los cortes de 3a.4 (2⁻⁵³; topes 10 000, 20 000 y 200); R con D6.1 (x > 700) y C23 para a < 20, y con (4) y D6.2 para a ≥ 20; secuencia de 12 pasos dentro de [.25a, 4a] y de 8 pasos (lectura C del paquete 4, 4.2) fuera; erfc escalada en (8), (17); T(a, λ) con los D_k(n) recalculados del expediente por Horner (C1, C18); 5.5 y la guarda de rango de D6.2 antes de ramificar; (20) con ε = 2⁻⁵³ lo comprueba el envoltorio público y lanza `indeterminado`; 1/Γ(a + 1) = 1 + H(a) (B8); la cola que no calcula la hoja se obtiene como 1 − v (C5); x = 0 da P = 0, Q = 1 (C6).

3. Salida del arnés:

```
Funcion: pgamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): x, a [+ lower_tail cuando la columna no esta vacia]

Etiqueta pgamma_a05: pasa
  n=528  pasan=528  fallan=0
  max ulps=4  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.5 (id 2414)
  tolerancia aplicada: relativa 1e-13 [n=511; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=11; tol_ulps 2] | P2: 0 exacto [n=6; tol_ulps 0]
  10 peores: id 2658: 4; id 182: 3; id 2462: 3; id 2538: 3; id 2619: 3; id 2631: 3; id 2866: 3; id 184: 2; id 2422: 2; id 2430: 2

Etiqueta pgamma_asin16: pasa
  n=626  pasan=626  fallan=0
  max ulps=12  p99 ulps=6
  fraccion de la tolerancia (peor fila)=0.5 (id 6172)
  tolerancia aplicada: relativa 1e-13 [n=612; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=9; tol_ulps 2] | P2: 0 exacto [n=5; tol_ulps 0]
  10 peores: id 674: 12; id 658: 10; id 662: 10; id 2006: 7; id 2336: 7; id 666: 6; id 2332: 6; id 2348: 6; id 122: 5; id 720: 5

Etiqueta pgamma_cf11_med: pasa
  n=814  pasan=814  fallan=0
  max ulps=10  p99 ulps=7
  fraccion de la tolerancia (peor fila)=0.0132539 (id 5727)
  tolerancia aplicada: relativa 1e-13 [n=814; tol_ulps 450.495-900.72]
  10 peores: id 2334: 10; id 2068: 9; id 1270: 8; id 5410: 8; id 5546: 8; id 1336: 7; id 1354: 7; id 2008: 7; id 2342: 7; id 5634: 7

Etiqueta pgamma_cf11_peq: pasa
  n=608  pasan=608  fallan=0
  max ulps=15  p99 ulps=9
  fraccion de la tolerancia (peor fila)=0.0218752 (id 206)
  tolerancia aplicada: relativa 1e-13 [n=593; tol_ulps 450.36-900.72] | P2: 2 ulps de subnormal [n=3; tol_ulps 2] | P2: 0 exacto [n=12; tol_ulps 0]
  10 peores: id 206: 15; id 242: 15; id 238: 13; id 4328: 10; id 214: 9; id 220: 9; id 232: 9; id 62: 8; id 2198: 8; id 4160: 8

Etiqueta pgamma_lejos: pasa
  n=776  pasan=776  fallan=0
  max ulps=184  p99 ulps=71
  fraccion de la tolerancia (peor fila)=0.233503 (id 7668)
  tolerancia aplicada: 788 ulps [n=547; tol_ulps 788] | P2: 0 exacto [n=229; tol_ulps 0]
  10 peores: id 7668: 184; id 7697: 168; id 7832: 157; id 1952: 93; id 7580: 90; id 7551: 78; id 7728: 73; id 7731: 71; id 7861: 69; id 7562: 68

Etiqueta pgamma_n19: pasa
  n=578  pasan=578  fallan=0
  max ulps=44  p99 ulps=43
  fraccion de la tolerancia (peor fila)=0.0519395 (id 570)
  tolerancia aplicada: relativa 1e-13 [n=578; tol_ulps 450.649-900.142]
  10 peores: id 570: 44; id 574: 44; id 586: 44; id 1486: 44; id 1470: 43; id 1598: 43; id 1610: 43; id 1474: 42; id 1596: 42; id 6596: 36

Etiqueta pgamma_q10: pasa
  n=626  pasan=626  fallan=0
  max ulps=19  p99 ulps=11
  fraccion de la tolerancia (peor fila)=0.0319985 (id 218)
  tolerancia aplicada: relativa 1e-13 [n=626; tol_ulps 450.525-900.552]
  10 peores: id 218: 19; id 226: 18; id 3454: 13; id 3618: 13; id 230: 11; id 3591: 11; id 3852: 11; id 3616: 10; id 3644: 10; id 3698: 10

Etiqueta pgamma_s15: pasa
  n=794  pasan=794  fallan=0
  max ulps=9  p99 ulps=6
  fraccion de la tolerancia (peor fila)=0.0143561 (id 78)
  tolerancia aplicada: relativa 1e-13 [n=794; tol_ulps 450.36-900.72]
  10 peores: id 908: 9; id 1308: 9; id 78: 7; id 890: 7; id 912: 7; id 1168: 6; id 1202: 6; id 1214: 6; id 5044: 6; id 5198: 6

Etiqueta pgamma_serie9: pasa
  n=754  pasan=754  fallan=0
  max ulps=17  p99 ulps=11
  fraccion de la tolerancia (peor fila)=0.022934 (id 312)
  tolerancia aplicada: relativa 1e-13 [n=754; tol_ulps 451.627-900.688]
  10 peores: id 312: 17; id 272: 13; id 428: 13; id 172: 12; id 330: 12; id 412: 12; id 434: 12; id 438: 11; id 244: 10; id 326: 10

Etiqueta pgamma_suma14: pasa
  n=818  pasan=818  fallan=0
  max ulps=5  p99 ulps=4
  fraccion de la tolerancia (peor fila)=0.00723114 (id 4629)
  tolerancia aplicada: relativa 1e-13 [n=818; tol_ulps 450.856-900.72]
  10 peores: id 4849: 5; id 598: 4; id 1424: 4; id 4495: 4; id 4536: 4; id 4549: 4; id 4629: 4; id 4651: 4; id 4860: 4; id 910: 3

Etiqueta pgamma_temme: pasa
  n=980  pasan=980  fallan=0
  max ulps=917  p99 ulps=211
  fraccion de la tolerancia (peor fila)=0.744318 (id 1729)
  tolerancia aplicada: 1232 ulps [n=907; tol_ulps 1232] | P2: 0 exacto [n=72; tol_ulps 0] | P2: 2 ulps de subnormal [n=1; tol_ulps 2]
  10 peores: id 1729: 917; id 1737: 916; id 533: 915; id 1725: 915; id 1733: 501; id 1739: 212; id 1743: 211; id 1747: 211; id 1753: 211; id 1755: 211

VERDE
(escrito stats/informes/_ultimo_pgamma.json)
```

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: **#14** (hoja (11) con R = 0; D6.1 y C3). Copia en `notas/ambiguedades.md`.

7. Comparación de los máximos con la tabla del expediente (D6, 4.2; máx / p99):

| etiqueta | expediente | aquí | diferencia en el máximo |
|---|---|---|---|
| pgamma_temme | 917 / 211 | 917 / 211 | 0 |
| pgamma_lejos | 184 / 71 (lectura C, 4.2) | 184 / 71 | 0 |
| pgamma_n19 | 44 / 43 | 44 / 43 | 0 |
| las otras ocho | sin tabla | — | sin tabla |

8. Tiempo aproximado: 30 minutos (con pchisq).

## Cierre de pgamma
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 1 (#14).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: 0 (temme, lejos y n19 coinciden en máximo y p99).
- Prueba propia de `lowerTail` por omisión (`node stats/notas/prueba_cola.mjs pgamma`, filas id 1, 3952 y 7902): `pgamma(x, a)`, `pgamma(x, a, true)` y `pgamma(x, a, undefined)` devuelven el mismo double al bit en las tres; `lowerTail` = 1, "true", null (y 0, "") lanzan `tipo`. VERDE.
- Prueba propia de `pgamma_indet` (`node stats/notas/prueba_pgamma.mjs`): `pgamma(1e30, 1e30)` y `pgamma(1e300, 1e300)`, con `lowerTail` verdadero, falso y omitido, lanzan `StatsError` con `motivo` `indeterminado`, `argumento` `a`, `region` `pgamma_indet`, `funcion` `pgamma` y `valor` igual al `a` recibido. `pgamma(1e28, 1e28)` (aε² < 3.28·10⁻³) devuelve número. Barrido de 1 950 combinaciones de extremos (a de 5·10⁻³²⁴ a 1.79·10³⁰⁸, x de 0 a 1.79·10³⁰⁸, ambas colas, pgamma y pchisq): ninguna da NaN ni sale de [0, 1]; las únicas excepciones son `indeterminado`. Bordes x = 0 y x = −0: P = 0, Q = 1.
- `prueba_dominio.mjs pgamma extras_pgamma.json` → VERDE (17 casos: NaN, ±Infinity, tipo, x < 0, a = 0, a = −0, a < 0).
