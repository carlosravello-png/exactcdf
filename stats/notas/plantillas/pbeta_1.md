# pbeta · iteración 1

1. Función: `pbeta(x, a, b, lowerTail)` (`stats/src/pbeta.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Árbol de §3 con sus 21 condiciones y la marca B29 (p = a/(a + b), «x > p» en double); BPSER, BUP, BGRAT (con el paso 0, M en doble-doble y J₀ por la fracción (11) si u ≥ 1.1 o por el árbol de pgamma con Q = 1 − P si no), BFRAC (B26, C29) y BASYM (z² por D6b.7, cₙ por C33); el par (x, y) con su marca de exactitud a través de los intercambios (D6b.1); prefactores en logaritmos de doble-doble (D6b.4), BRCOMP con mín ≥ 8 por D6b.5; ALGDIV, BCORR y BETALN con 3a.5, 3a.6, 5.1 y (28) con los cₙ de (24); G con mín < 1 por 3a.6 (B19). Cada hoja da J y C37 decide si se devuelve J o 1 − J.

3. Salida del arnés:

@@ARNES@@

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
