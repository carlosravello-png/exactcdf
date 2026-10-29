# pbeta · iteración 1

1. Función: `pbeta(x, a, b, lowerTail)` (`stats/src/pbeta.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Árbol de §3 con sus 21 condiciones y la marca B29 (p = a/(a + b), «x > p» en double); BPSER, BUP, BGRAT (con el paso 0, M en doble-doble y J₀ por la fracción (11) si u ≥ 1.1 o por el árbol de pgamma con Q = 1 − P si no), BFRAC (B26, C29) y BASYM (z² por D6b.7, cₙ por C33); el par (x, y) con su marca de exactitud a través de los intercambios (D6b.1); prefactores en logaritmos de doble-doble (D6b.4), BRCOMP con mín ≥ 8 por D6b.5; ALGDIV, BCORR y BETALN con 3a.5, 3a.6, 5.1 y (28) con los cₙ de (24); G con mín < 1 por 3a.6 (B19). Cada hoja da J y C37 decide si se devuelve J o 1 − J.

3. Salida del arnés:

```
Funcion: pbeta   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): x, a, b [+ lower_tail cuando la columna no esta vacia]

Etiqueta pbeta_basym_agtb: pasa
  n=594  pasan=594  fallan=0
  max ulps=9  p99 ulps=6
  fraccion de la tolerancia (peor fila)=0.00291451 (id 7904)
  tolerancia aplicada: 3088 ulps [n=594; tol_ulps 3088]
  10 peores: id 7904: 9; id 8199: 8; id 7791: 7; id 8217: 7; id 8107: 6; id 8137: 6; id 8214: 6; id 7779: 5; id 7938: 5; id 8023: 5

Etiqueta pbeta_basym_aleb: pasa
  n=610  pasan=610  fallan=0
  max ulps=9  p99 ulps=5
  fraccion de la tolerancia (peor fila)=0.00238474 (id 7335)
  tolerancia aplicada: 3774 ulps [n=610; tol_ulps 3774]
  10 peores: id 7335: 9; id 1956: 7; id 7604: 7; id 1942: 6; id 1947: 6; id 7725: 6; id 1944: 5; id 7539: 5; id 7562: 5; id 1591: 4

Etiqueta pbeta_bfrac20: pasa
  n=1178  pasan=1178  fallan=0
  max ulps=121  p99 ulps=41
  fraccion de la tolerancia (peor fila)=0.0313147 (id 6806)
  tolerancia aplicada: 3864 ulps [n=1029; tol_ulps 3864] | P2: 0 exacto [n=149; tol_ulps 0]
  10 peores: id 6806: 121; id 7263: 117; id 7193: 77; id 6914: 72; id 1889: 53; id 6885: 53; id 6843: 52; id 1901: 49; id 6793: 48; id 6842: 47

Etiqueta pbeta_bgrat14: pasa
  n=730  pasan=730  fallan=0
  max ulps=16  p99 ulps=10
  fraccion de la tolerancia (peor fila)=0.0207719 (id 942)
  tolerancia aplicada: relativa 1e-13 [n=610; tol_ulps 450.36-900.72] | P2: 0 exacto [n=116; tol_ulps 0] | P2: 2 ulps de subnormal [n=4; tol_ulps 2]
  10 peores: id 4236: 16; id 942: 12; id 4257: 12; id 936: 10; id 1000: 10; id 1258: 10; id 2520: 10; id 4140: 10; id 130: 9; id 932: 9

Etiqueta pbeta_bpser12: pasa
  n=1182  pasan=1182  fallan=0
  max ulps=70  p99 ulps=57
  fraccion de la tolerancia (peor fila)=0.0847471 (id 874)
  tolerancia aplicada: relativa 1e-13 [n=1050; tol_ulps 450.36-900.72] | P2: 0 exacto [n=132; tol_ulps 0]
  10 peores: id 874: 70; id 826: 67; id 884: 67; id 868: 66; id 882: 65; id 842: 62; id 870: 62; id 886: 62; id 750: 59; id 840: 58

Etiqueta pbeta_bpser13: pasa
  n=668  pasan=668  fallan=0
  max ulps=48  p99 ulps=19
  fraccion de la tolerancia (peor fila)=0.0783425 (id 3288)
  tolerancia aplicada: relativa 1e-13 [n=518; tol_ulps 450.36-900.72] | P2: 0 exacto [n=150; tol_ulps 0]
  10 peores: id 3324: 48; id 3288: 37; id 3522: 24; id 3521: 22; id 3541: 22; id 3611: 22; id 3392: 19; id 3342: 18; id 3460: 18; id 3625: 17

Etiqueta pbeta_bpser16: pasa
  n=602  pasan=602  fallan=0
  max ulps=53  p99 ulps=25
  fraccion de la tolerancia (peor fila)=0.0607987 (id 1301)
  tolerancia aplicada: relativa 1e-13 [n=400; tol_ulps 450.36-900.72] | P2: 0 exacto [n=202; tol_ulps 0]
  10 peores: id 1301: 53; id 1297: 52; id 1295: 51; id 1309: 50; id 1305: 35; id 4883: 27; id 5125: 25; id 1283: 23; id 4780: 22; id 1287: 19

Etiqueta pbeta_bup2bgrat19: pasa
  n=576  pasan=576  fallan=0
  max ulps=102  p99 ulps=56
  fraccion de la tolerancia (peor fila)=0.138821 (id 6673)
  tolerancia aplicada: relativa 1e-13 [n=576; tol_ulps 451.198-889.101]
  10 peores: id 6673: 102; id 2711: 60; id 2703: 59; id 2699: 58; id 6644: 58; id 6360: 56; id 6418: 54; id 6714: 54; id 6596: 53; id 6752: 53

Etiqueta pbeta_bupbgrat15: pasa
  n=736  pasan=736  fallan=0
  max ulps=57  p99 ulps=24
  fraccion de la tolerancia (peor fila)=0.111072 (id 4641)
  tolerancia aplicada: relativa 1e-13 [n=736; tol_ulps 451.649-900.652]
  10 peores: id 4641: 57; id 4574: 49; id 4606: 33; id 1130: 31; id 1142: 30; id 1234: 29; id 1138: 28; id 1134: 24; id 4467: 23; id 4654: 21

Etiqueta pbeta_bupbgrat18: pasa
  n=666  pasan=666  fallan=0
  max ulps=81  p99 ulps=21
  fraccion de la tolerancia (peor fila)=0.122752 (id 5825)
  tolerancia aplicada: relativa 1e-13 [n=514; tol_ulps 450.36-900.72] | P2: 0 exacto [n=152; tol_ulps 0]
  10 peores: id 5825: 81; id 5967: 57; id 5832: 33; id 2089: 24; id 2029: 23; id 2027: 21; id 2037: 21; id 1481: 20; id 1489: 20; id 2025: 20

Etiqueta pbeta_bupbpser17: pasa
  n=724  pasan=724  fallan=0
  max ulps=60  p99 ulps=29
  fraccion de la tolerancia (peor fila)=0.0748526 (id 2701)
  tolerancia aplicada: relativa 1e-13 [n=534; tol_ulps 450.36-900.72] | P2: 0 exacto [n=190; tol_ulps 0]
  10 peores: id 2701: 60; id 2695: 59; id 2697: 58; id 2709: 57; id 2705: 39; id 5750: 34; id 5299: 31; id 1463: 29; id 5732: 25; id 1499: 23

VERDE
(escrito stats/informes/_ultimo_pbeta.json)
```

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna. La peor fila de todo pbeta usa el 13.9 % de su tolerancia (`pbeta_bup2bgrat19`, id 6673), igual que la cifra de D6b.

5. No aplica.

6. Ambigüedades de esta iteración: **#15** (evaluación de (28) y reducciones de BETALN) y **#16** (contabilidad de los bucles de BGRAT, BFRAC y BASYM). Copia en `notas/ambiguedades.md`.

7. Comparación de los máximos por etiqueta con la tabla «Resultado» de D6b (ulps; el expediente da el de la corrida de Cowork en Linux):

| etiqueta | expediente | aquí | diferencia |
|---|---|---|---|
| bpser12 | 67 | 70 | +3 |
| bpser13 | 48 | 48 | 0 |
| bgrat14 | 18 | 16 | −2 |
| bupbgrat15 | 49 | 57 | +8 |
| bpser16 | 53 (Linux; 27 en la corrida de Carlos en Windows) | 53 | 0 |
| bupbpser17 | 60 | 60 | 0 |
| bupbgrat18 | 81 | 81 | 0 |
| bup2bgrat19 | 102 | 102 | 0 |
| bfrac20 | 121 | 121 | 0 |
| basym_aleb | 9 | 9 | 0 |
| basym_agtb | 9 | 9 | 0 |

   La diferencia máxima es de 8 ulps (bupbgrat15), dentro de lo que el expediente atribuye a la libm (hasta 40 ulps por fila entre construcciones independientes). No hace falta diagnóstico.

8. Tiempo aproximado: 40 minutos.

## Cierre de pbeta
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 2 (#15, #16).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: 8 (bupbgrat15: 57 frente a 49).
- Prueba propia de `lowerTail` por omisión (`node stats/notas/prueba_cola.mjs pbeta`, filas id 1, 4134 y 8266): `pbeta(x, a, b)`, `pbeta(x, a, b, true)` y `pbeta(x, a, b, undefined)` devuelven el mismo double al bit en las tres; `lowerTail` = 1, "true", null (y 0, "") lanzan `tipo` con `funcion` "pbeta". VERDE.
- Pruebas propias de bordes y extremos (`node stats/notas/prueba_pbeta.mjs`, VERDE): x = 0 y x = −0 dan 0 (inferior) y 1 (superior); x = 1 da 1 y 0; barrido de 11 664 combinaciones (a y b de 10⁻³⁰⁰ a 10⁵, x de 10⁻³²⁰ a 1 − 2⁻⁵²), en las dos colas: ninguna da NaN, lanza o sale de [0, 1], y P + Q = 1 con error absoluto ≤ 10⁻¹¹ en todas. El factor f ≤ 0 de D6b.4 (defecto) no se produce nunca.
- `prueba_dominio.mjs pbeta extras_pbeta.json` → VERDE (25 casos: NaN, ±Infinity, tipo, x < 0, x > 1, a o b = 0, −0, negativos).
