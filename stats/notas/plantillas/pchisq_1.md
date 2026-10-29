# pchisq · iteración 1

1. Función: `pchisq(x, nu, lowerTail)` (`stats/src/pchisq.js`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. pchisq(x, ν) = pgamma(x/2, ν/2) con las divisiones en double (C26), llamando al núcleo interno `_pgamma`. Validación propia (x, ν ≥ 2⁻¹⁰⁷³, `lowerTail`); el fallo `indeterminado` lo lanza pchisq con `funcion` "pchisq", `argumento` "nu" y `valor` ν (no ν/2).

3. Salida del arnés:

@@ARNES@@

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
