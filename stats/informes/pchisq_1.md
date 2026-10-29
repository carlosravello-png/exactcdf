# pchisq · iteración 1

1. Función: `pchisq(x, nu, lowerTail)` (`stats/src/pchisq.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. pchisq(x, ν) = pgamma(x/2, ν/2) con las divisiones en double (C26), llamando al núcleo interno `_pgamma`. Validación propia (x, ν ≥ 2⁻¹⁰⁷³, `lowerTail`); el fallo `indeterminado` lo lanza pchisq con `funcion` "pchisq", `argumento` "nu" y `valor` ν (no ν/2).

3. Salida del arnés:

```
Funcion: pchisq   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): x, nu [+ lower_tail cuando la columna no esta vacia]

Etiqueta pgamma_a05: pasa
  n=51  pasan=51  fallan=0
  max ulps=3  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.00347306 (id 182)
  tolerancia aplicada: relativa 1e-13 [n=49; tol_ulps 450.36-900.713] | P2: 2 ulps de subnormal [n=1; tol_ulps 2] | P2: 0 exacto [n=1; tol_ulps 0]
  10 peores: id 182: 3; id 184: 2; id 2067: 2; id 2109: 2; id 151: 1; id 163: 1; id 164: 1; id 169: 1; id 170: 1; id 176: 1

Etiqueta pgamma_asin16: pasa
  n=102  pasan=102  fallan=0
  max ulps=12  p99 ulps=10
  fraccion de la tolerancia (peor fila)=0.0137874 (id 674)
  tolerancia aplicada: relativa 1e-13 [n=102; tol_ulps 450.36-900.72]
  10 peores: id 674: 12; id 658: 10; id 662: 10; id 666: 6; id 122: 5; id 720: 5; id 136: 4; id 620: 4; id 712: 4; id 1978: 3

Etiqueta pgamma_cf11_med: pasa
  n=308  pasan=308  fallan=0
  max ulps=8  p99 ulps=6
  fraccion de la tolerancia (peor fila)=0.0124674 (id 602)
  tolerancia aplicada: relativa 1e-13 [n=308; tol_ulps 457.369-900.72]
  10 peores: id 1270: 8; id 1336: 7; id 1354: 7; id 100: 6; id 602: 6; id 722: 6; id 940: 6; id 1044: 6; id 1362: 6; id 1468: 6

Etiqueta pgamma_cf11_peq: pasa
  n=104  pasan=104  fallan=0
  max ulps=15  p99 ulps=15
  fraccion de la tolerancia (peor fila)=0.0218752 (id 206)
  tolerancia aplicada: relativa 1e-13 [n=104; tol_ulps 450.36-900.72]
  10 peores: id 206: 15; id 242: 15; id 238: 13; id 214: 9; id 220: 9; id 232: 9; id 62: 8; id 94: 7; id 216: 7; id 250: 7

Etiqueta pgamma_lejos: pasa
  n=191  pasan=191  fallan=0
  max ulps=93  p99 ulps=21
  fraccion de la tolerancia (peor fila)=0.11802 (id 1952)
  tolerancia aplicada: 788 ulps [n=167; tol_ulps 788] | P2: 0 exacto [n=24; tol_ulps 0]
  10 peores: id 1952: 93; id 1940: 21; id 1793: 19; id 1781: 18; id 519: 17; id 1785: 10; id 1870: 9; id 1930: 9; id 1934: 9; id 1789: 8

Etiqueta pgamma_n19: pasa
  n=93  pasan=93  fallan=0
  max ulps=44  p99 ulps=44
  fraccion de la tolerancia (peor fila)=0.0519395 (id 570)
  tolerancia aplicada: relativa 1e-13 [n=93; tol_ulps 450.649-900.142]
  10 peores: id 570: 44; id 574: 44; id 586: 44; id 1486: 44; id 1470: 43; id 1598: 43; id 1610: 43; id 1474: 42; id 1596: 42; id 1488: 29

Etiqueta pgamma_q10: pasa
  n=130  pasan=130  fallan=0
  max ulps=19  p99 ulps=18
  fraccion de la tolerancia (peor fila)=0.0319985 (id 218)
  tolerancia aplicada: relativa 1e-13 [n=130; tol_ulps 460.108-900.552]
  10 peores: id 218: 19; id 226: 18; id 230: 11; id 222: 7; id 478: 7; id 418: 6; id 440: 6; id 472: 6; id 468: 5; id 346: 4

Etiqueta pgamma_s15: pasa
  n=251  pasan=251  fallan=0
  max ulps=9  p99 ulps=7
  fraccion de la tolerancia (peor fila)=0.0143561 (id 78)
  tolerancia aplicada: relativa 1e-13 [n=251; tol_ulps 450.36-900.72]
  10 peores: id 908: 9; id 1308: 9; id 78: 7; id 890: 7; id 912: 7; id 1168: 6; id 1202: 6; id 1214: 6; id 2073: 6; id 60: 5

Etiqueta pgamma_serie9: pasa
  n=208  pasan=208  fallan=0
  max ulps=17  p99 ulps=13
  fraccion de la tolerancia (peor fila)=0.022934 (id 312)
  tolerancia aplicada: relativa 1e-13 [n=208; tol_ulps 456.941-898.093]
  10 peores: id 312: 17; id 272: 13; id 428: 13; id 172: 12; id 330: 12; id 412: 12; id 434: 12; id 438: 11; id 244: 10; id 326: 10

Etiqueta pgamma_suma14: pasa
  n=319  pasan=319  fallan=0
  max ulps=4  p99 ulps=3
  fraccion de la tolerancia (peor fila)=0.0055922 (id 2094)
  tolerancia aplicada: relativa 1e-13 [n=319; tol_ulps 453.576-900.72]
  10 peores: id 598: 4; id 1424: 4; id 910: 3; id 1400: 3; id 1454: 3; id 1990: 3; id 2094: 3; id 874: 2; id 888: 2; id 892: 2

Etiqueta pgamma_temme: pasa
  n=413  pasan=413  fallan=0
  max ulps=917  p99 ulps=501
  fraccion de la tolerancia (peor fila)=0.744318 (id 1729)
  tolerancia aplicada: 1232 ulps [n=396; tol_ulps 1232] | P2: 0 exacto [n=17; tol_ulps 0]
  10 peores: id 1729: 917; id 1737: 916; id 533: 915; id 1725: 915; id 1733: 501; id 1739: 212; id 1743: 211; id 1747: 211; id 1753: 211; id 1755: 211

VERDE
(escrito stats/informes/_ultimo_pchisq.json)
```

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: ninguna nueva (hereda #14 por pgamma).

7. Comparación de los máximos con la tabla del expediente (D6 y 4.2, pchisq; máx / p99):

| etiqueta | expediente | aquí | diferencia en el máximo |
|---|---|---|---|
| pgamma_temme | 917 / 501 | 917 / 501 | 0 |
| pgamma_lejos | 93 / 23 | 93 / 21 | 0 (p99: 2) |
| las otras nueve | sin tabla | — | sin tabla |

8. Tiempo aproximado: incluido en el de pgamma.

## Cierre de pchisq
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 0 propias (#14 heredada).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: 0 en el máximo (temme y lejos).
- Prueba propia de `lowerTail` por omisión (`prueba_cola.mjs pchisq`, filas id 1, 1086 y 2170): `pchisq(x, nu)`, `pchisq(x, nu, true)` y `pchisq(x, nu, undefined)` idénticos al bit; 1, "true", null, 0 y "" lanzan `tipo` con `funcion` "pchisq". VERDE.
- Prueba propia de `indeterminado` (`prueba_pgamma.mjs`): `pchisq(2e30, 2e30)` y `pchisq(2e300, 2e300)` lanzan `indeterminado`, `argumento` `nu`, `valor` = ν recibido (no ν/2), `region` `pgamma_indet`, `funcion` `pchisq`.
- `prueba_dominio.mjs pchisq extras_pchisq.json` → VERDE (16 casos, incluido ν = 5·10⁻³²⁴ < 2⁻¹⁰⁷³ → `dominio` en `nu`).
