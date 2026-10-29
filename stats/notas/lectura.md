# Índice de lectura · sesión 1 (26/10/2026, hora local de Carlos)

Expediente = `expediente/herramientas/stats-js_expediente.md` (líneas del archivo en esta versión). Capas posteriores enmiendan a las anteriores; rige la marca.

## Transversal
- D4 v2 (l. 694–778): `StatsError`, dominios, orden de validación, `lowerTail` por omisión = true.
- 4.3 (l. 1674–1687): firmas públicas con la variable primero: `erf(x)`, `erfc(x)`, `pnorm(z, lowerTail)`, `lgamma(a)`, `gamma(a)`, `pgamma(x, a, lowerTail)`, `pchisq(x, nu, lowerTail)`, `pbeta(x, a, b, lowerTail)`.
- C1 (l. 1377): Horner de mayor a menor grado en todos los cocientes.
- Paquetes 6 y 7 (l. 2026–2100): argumento de `indeterminado` (`a` / `nu`); seis comprobaciones del arnés.
- Congelado arnes-v1 (l. 2122–2154): tabla de SHA (comprobada al inicio: los nueve coinciden).

## erf (erf_r1, erf_r2, erf_r3)
- Cody 1969: l. 234–248 (tramos, solape firmado c = 0.46875), coeficientes T1 l. 817–867 (`cody_erf_44`, `cody_erfc_88`, `cody_erfc_55`).
- C10 (l. 1691): erf(x) = signo(x)·(1 − erfc(|x|)) para |x| > 0.46875.
- C1 (Horner), C9 (l. 1690).

## erfc (erfc_neg, erfc_r1, erfc_r2, erfc_r3)
- Diseño de e^(−x²) (l. 237–243): x_hi = trunc(16x)/16; del = (x − x_hi)(x + x_hi).
- C2 (l. 1379): orden del producto en la rama 3; C9 (1/Math.sqrt(Math.PI), 1/(x*x)).
- erfc escalada S(v) = e^(v²)·erfc(v) (D6.2, D6.3, D6b.7): ramas 2 y 3 sin factor exponencial.

## pnorm (pnorm_r1, pnorm_r2, pnorm_cola)
- Tolerancias.md l. 50–61; 4.1 (l. 1637–1650); C11 (l. 1692); decisión 6 (`lowerTail`).

## lgamma (lgamma_d, lgamma_red, lgamma_delta)
- DM86 Ap. D (l. 905–938) con 3a.2 (1.6 → forma 2+x); 3a.1 (reducción); C12–C15 (l. 1693–1696); Δ(a) (24) l. 952–963; 3a.5 y 5.1 (Δ para 8 ≤ a < 15, solo para pbeta/pgamma).
- D4 v2: a > 0 estricto.

## gamma (gamma_d, gamma_fuera)
- D1 (l. 682–690), 3a.3 (k ascendente), C15, tolerancias l. 225–252; a* y a_low (reglas.json › constantes).

## gamma1pm1 (gamma1pm1_c)
- Ap. C (l. 869–903) con C4 (l. 1383–1386). Núcleo `_gamma1pm1`.

## pgamma / pchisq
- DM86 T2 parte 1 (l. 973–1126): (3)–(20), árbol (l. 1023–1038), Fig. 1 (l. 1040–1046), D_k(n) (l. 1062–1126).
- D6.1–D6.3 (l. 1423–1500), 4.2 lectura C (l. 1653–1672), 3a.4 (cortes), C16–C26 (l. 1697–1707), 5.4 B8, 5.5 (l. 1991–2004), 6.5 (umbral de (20) con ε = 2⁻⁵³).
- Apéndice E (φ₁) l. 940–950; (5)–(6) φ.

## pbeta
- DM92 T2 parte 2 (l. 1128–1338): (7)–(11.21), §3 (l. 1231–1267), ALGDIV/BCORR/BETALN/BRCOMP (l. 1269–1314).
- Correcciones 22/10 (l. 1340–1370): notación (9.4)/(9.6), paso 0 de BGRAT.
- D6b.1–D6b.7 (l. 1714–1943), primitivas dd_*, exp_dd, ln_r, ln_dd, ln1m_dd; C27–C39; 5.1–5.4 (B19, B22, B23, B25, B26, B29), 5.2.
- 3a.5, 3a.6 (l. 1573–1598), 3a.7 (expm1/log1p).

## Decisiones abiertas (no se tocan)
- pt/qt (forma de la transformación), qnorm/qgamma/qchisq/qbeta (sesión 2), licencia, techo del dominio (D7).
