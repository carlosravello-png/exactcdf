# pgamma · iteración 1

1. Función: `pgamma(x, a, lowerTail)` (`stats/src/pgamma.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Árbol de la Fig. 2 con las nueve hojas (8), (9), (10), (11), (14), (15), (16), (17) y (19) y los cortes de 3a.4 (2⁻⁵³; topes 10 000, 20 000 y 200); R con D6.1 (x > 700) y C23 para a < 20, y con (4) y D6.2 para a ≥ 20; secuencia de 12 pasos dentro de [.25a, 4a] y de 8 pasos (lectura C del paquete 4, 4.2) fuera; erfc escalada en (8), (17); T(a, λ) con los D_k(n) recalculados del expediente por Horner (C1, C18); 5.5 y la guarda de rango de D6.2 antes de ramificar; (20) con ε = 2⁻⁵³ lo comprueba el envoltorio público y lanza `indeterminado`; 1/Γ(a + 1) = 1 + H(a) (B8); la cola que no calcula la hoja se obtiene como 1 − v (C5); x = 0 da P = 0, Q = 1 (C6).

3. Salida del arnés:

@@ARNES@@

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
