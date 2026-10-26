# arnes_1 · arnés de pruebas y error.js (sesión 0)

Fecha: 2026-10-23. Node v24.22.1. Rama construccion, commit base f68debf, sin git en la sesión.

Correcciones hechas durante la sesión (qué y por qué):
1. `error.js` (informe aparte, error_1.md): la prueba tenía un defecto propio; se corrigió la prueba, no el módulo.
2. `stats/package.json` con `"type":"module"` (ver ambiguedades #1).
3. Se añadió `run.js --ids` (depuración) tras la primera corrida de B6(a), para mostrar las filas 55–57 pedidas por el prompt; las salidas de B6 de abajo son de la corrida posterior, con el arnés final.
4. Formato de números grandes en `run.js` (notación exponencial desde 1e9); no cambia ningún juicio.
5. Texto de una etiqueta en prueba_b2.js (decía «esperado 2»; el valor correcto y comprobado es 1).

## B1

Comando: `node stats/harness/_fakes/prueba_b1.js`

```
== B1.0 casos sueltos del parser
  0x1.0000000000000p+0       -> PASA  (1)
  -0x1.8000000000000p+1      -> PASA  (-3)
  0x0.0000000000001p-1022    -> PASA  (5e-324)
  0x0.0p+0                   -> PASA  (0)
  -0x0.0p+0                  -> PASA  (-0)
  0x1.fffffffffffffp+1023    -> PASA  (1.7976931348623157e+308)
  0x1.0000000000000p-1022    -> PASA  (2.2250738585072014e-308)
  0x0.4000000000000p-1022    -> PASA  (5.562684646268003e-309)
  inf                        -> PASA  (Infinity)
  -inf                       -> PASA  (-Infinity)
  Inf                        -> PASA  (Infinity)
  nan                        -> PASA  (NaN)

== B1.1 erf.csv  (1575 filas; argumentos: x)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1575 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: '', 'subnormal'
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 2 filas; ejemplo id 56 region erf_r1 x=-0x0.0000000000001p-1022 ref_mp70=-5.57493381944852271267550929624e-324 ref_mp70_hex=-0x0.0000000000001p-1022 -> -5e-324 (-0x0.0000000000001p-1022)
  fuera_de_rango=inf: 0 filas; sin ejemplo

== B1.1 gamma.csv  (1018 filas; argumentos: a)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1018 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: ''
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 0 filas; sin ejemplo
  fuera_de_rango=inf: 0 filas; sin ejemplo

== B1.1 qt.csv  (1560 filas; argumentos: p, n)
  primeras 200 filas (pedido): PASA  (0 discrepancias)
  todas las 1560 filas (adicional): PASA  (0 discrepancias)
  valores de fuera_de_rango presentes: '', 'inf'
  fuera_de_rango=cero: 0 filas; sin ejemplo
  fuera_de_rango=subnormal: 0 filas; sin ejemplo
  fuera_de_rango=inf: 120 filas; ejemplo id 1063 region qt_resto p=0x1.4e8031fc7cb72p-387 n=0x1.065a51eca88bap-9 ref_mp70=7.32290524273104261460169365545e+57992 ref_mp70_hex=inf -> Infinity (inf)

RESULTADO B1: PASA
```

**PASA**

## B2

Comando: `node stats/harness/_fakes/prueba_b2.js`

```
== B2.1 ulps(nextafter(r, +inf), r) === 1
  r=1                        nextafter=1.0000000000000002       ulp(r)=2.220446049250313e-16    ulps=1  PASA
  r=0.1                      nextafter=0.10000000000000002      ulp(r)=1.3877787807814457e-17   ulps=1  PASA
  r=3.5                      nextafter=3.5000000000000004       ulp(r)=4.440892098500626e-16    ulps=1  PASA
  r=1e+300                   nextafter=1.0000000000000002e+300  ulp(r)=1.487016908477783e+284   ulps=1  PASA
  r=9.332636185032189e-302   nextafter=9.33263618503219e-302    ulp(r)=2.0722615e-317           ulps=1  PASA
  r=2.2250738585072014e-308  nextafter=2.225073858507202e-308   ulp(r)=5e-324                   ulps=1  PASA
  r=5e-324                   nextafter=1e-323                   ulp(r)=5e-324                   ulps=1  PASA
  r=0                        nextafter=5e-324                   ulp(r)=5e-324                   ulps=1  PASA
  r=-7.25                    nextafter=-7.249999999999999       ulp(r)=8.881784197001252e-16    ulps=1  PASA

== B2.2 ulps(r, r) === 0
  r=1  ulps=0  PASA
  r=0.1  ulps=0  PASA
  r=-7.25  ulps=0  PASA
  r=0  ulps=0  PASA
  r=5e-324  ulps=0  PASA
  r=1e+300  ulps=0  PASA

== B2.3 cruce de binada (la medida usa el ulp de la referencia)
  ulps(nextafter(2,-inf), 2) = 0.5  (esperado 0.5 = 2^-52 / 2^-51)  PASA
  ulps(2, nextafter(2,-inf)) = 1  (esperado 1 = 2^-52 / ulp(2-2^-52)=2^-52)  PASA
  ulps(mayor subnormal, 2^-1022) = 1  PASA

== B2.4 no finitos
  ulps(Infinity, 1) = Infinity  PASA
  ulps(NaN, 1) = Infinity  PASA
  ulps(-Infinity, 1) = Infinity  PASA
  ulps(Infinity, Infinity) = 0  PASA

== B2.5 ulp(ref) por casos (potencias de 2: 2^(e-52); cero y subnormales 2^-1074)
  ulp(1) = 2.220446049250313e-16  PASA
  ulp(1.5) = 2.220446049250313e-16  PASA
  ulp(2) = 4.440892098500626e-16  PASA
  ulp(0.5) = 1.1102230246251565e-16  PASA
  ulp(0) = 5e-324  PASA
  ulp(5e-324) = 5e-324  PASA
  ulp(2.2250738585072014e-308) = 5e-324  PASA
  ulp(1.7976931348623157e+308) = 1.99584030953472e+292  PASA
  ulp(-7.25) = 8.881784197001252e-16  PASA

== B2.6 nextafter hacia abajo y por el cero
  nextafter(2^-1074, -inf) = 0  PASA
  nextafter(0, -inf) = -5e-324  PASA
  nextafter(-7.25, +inf) hacia cero; ulps = 1  PASA
  nextafter(MAX_VALUE, +inf) = Infinity  PASA

RESULTADO B2: PASA
```

**PASA**

## B3

Comando: `node stats/harness/_fakes/prueba_b3.js`

```
== B3.1 CSV de tests/fixtures cuyo nombre no empieza por '_': 14  PASA
  erf        filas= 1575  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  erfc       filas= 3448  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  gamma      filas= 1018  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  gamma1pm1  filas=  516  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  lgamma     filas= 1542  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  pbeta      filas= 8266  lineas '#'=10  columnas=27  ids 1..n correlativos: true  ancho uniforme: true
  pchisq     filas= 2170  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  pgamma     filas= 7902  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  pnorm      filas= 4870  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  pt         filas=  500  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qchisq     filas= 1244  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qgamma     filas= 1544  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  qnorm      filas= 1027  lineas '#'=10  columnas=23  ids 1..n correlativos: true  ancho uniforme: true
  qt         filas= 1560  lineas '#'=10  columnas=25  ids 1..n correlativos: true  ancho uniforme: true
  suma total de filas = 37182  (esperado 37182)  PASA

== B3.2 cabecera '#' como texto (erf.csv)
# funcion: erf
# fecha_generacion: 2026-10-13
# python: 3.13.16   mpmath: 1.3.0   backend: gmpy   gmpy2: 2.3.2
# R: R version 4.6.1 (2026-06-24 ucrt)   (sessionInfo() completo en tests/fixtures/_sessioninfo_R.txt)
# semilla: 2026101301
# sha256_gen_puntos.py: 65e4263b41ae71f15897bf5311481cf4bffde93fb1c5c3e03bbabf4dc61db9eb
# sha256_ref_r.R: 895a6eb5fa09b49becbb470290d5306edd1be9894197800ac593fe5ff070c56a
# sha256_ref_mpmath.py: 326e37f92c0cdfb7932f3a0254026abeded4795357d2745d40afb6167563b788
# K_ulps: 64   umbral_cifras_50_70: 25   cifras_quad: 20
# filas_ok: 1575   filas_dificil: 0   filas_r_discrepa: 0   filas_dps_adaptativo: 14

== B3.3 filas por nombre de columna (erf, id 56)
{"id":"56","region":"erf_r1","x":"-4.9406564584124654e-324","lower_tail":"","ref_mp50":"-5.57493381944852271267550929624e-324","ref_mp70":"-5.57493381944852271267550929624e-324","ref_r":"","dps_usado":"374","cifras_50_70":"30","ulps_r":"","r_discrepa":"","tercera_via":"COINCIDE","ref_quad":"-5.57493381944852271267550929624e-324","err_quad":"1.1284e-423","decision_manual":"","origen":"frontera","estado":"OK","valor_fuente":"","cifras_fuente":"","fuera_de_rango":"subnormal","x_hex":"-0x0.0000000000001p-1022","ref_mp70_hex":"-0x0.0000000000001p-1022","ref_r_hex":""}

== B3.4 '_dificiles.csv' y carpetas '_*' no se leen
  listarFixtures() no incluye nada con '_': PASA

RESULTADO B3: PASA
```

**PASA**

## B4

Comando: `node stats/harness/_fakes/prueba_b4.js`

```
== B4 precedencia (reglas.json): 2) fuera_de_rango manda; 3) la etiqueta
   P2.subnormal = |x - double de la referencia| <= 2 ulps de subnormal (2 * 2^-1074)

-- P2 cero
   region=erfc_r3 fuera_de_rango='cero' ref=0.00000
   regla=P2_cero  tol_ulps=0.00000  motivo=- argumento=-  [P2: 0 exacto]  PASA
   x=0.00000: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=4.94066e-324: ulps=1.00000 tol=0.00000 fraccion=Infinity ok=false  PASA

-- P2 subnormal (2 ulps de subnormal)
   region=erfc_r3 fuera_de_rango='subnormal' ref=2.47033e-323
   regla=P2_subnormal  tol_ulps=2.00000  motivo=- argumento=-  [P2: 2 ulps de subnormal]  PASA
   x=3.45846e-323: ulps=2.00000 tol=2.00000 fraccion=1.00000 ok=true  PASA
   x=3.95253e-323: ulps=3.00000 tol=2.00000 fraccion=1.50000 ok=false  PASA
   x=0.00000: ulps=5.00000 tol=2.00000 fraccion=2.50000 ok=false  PASA

-- precedencia: erf_r1 (relativa) con ref subnormal -> P2
   region=erf_r1 fuera_de_rango='subnormal' ref=4.94066e-324
   regla=P2_subnormal  tol_ulps=2.00000  motivo=- argumento=-  [P2: 2 ulps de subnormal]  PASA
   x=0.00000: ulps=1.00000 tol=2.00000 fraccion=0.500000 ok=true  PASA

-- P3 inf (+)
   region=qt_resto fuera_de_rango='inf' ref=Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA
   x=Infinity: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=1.79769e+308: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA
   x=-Infinity: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA
   x=NaN: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA

-- P3 inf (-)
   region=qt_resto fuera_de_rango='inf' ref=-Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA
   x=-Infinity: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=Infinity: ulps=Infinity tol=0.00000 fraccion=Infinity ok=false  PASA

-- relativa 1e-15 (erf_r1), ref=0.5
   region=erf_r1 fuera_de_rango='' ref=0.500000
   regla=relativa  tol_ulps=4.50360  motivo=- argumento=-  [relativa 1e-15]  PASA
   x=0.500000: ulps=4.00000 tol=4.50360 fraccion=0.888178 ok=true  PASA
   x=0.500000: ulps=5.00000 tol=4.50360 fraccion=1.11022 ok=false  PASA

-- relativa con ref = 0 (erf id 55: tol 0)
   region=erf_r1 fuera_de_rango='' ref=0.00000
   regla=relativa  tol_ulps=0.00000  motivo=- argumento=-  [relativa 1e-15]  PASA
   x=0.00000: ulps=0.00000 tol=0.00000 fraccion=0.00000 ok=true  PASA
   x=4.94066e-324: ulps=1.00000 tol=0.00000 fraccion=Infinity ok=false  PASA

-- relativa en el limite de binada, ref=1e-3
   region=gamma1pm1_c fuera_de_rango='' ref=0.00100000
   regla=relativa  tol_ulps=92.2337  motivo=- argumento=-  [relativa 2e-14]  PASA
   x=0.00100000: ulps=92.0000 tol=92.2337 fraccion=0.997466 ok=true  PASA
   x=0.00100000: ulps=93.0000 tol=92.2337 fraccion=1.00831 ok=false  PASA

-- ulps 1232 (pgamma_temme)
   region=pgamma_temme fuera_de_rango='' ref=3.50000
   regla=ulps  tol_ulps=1232.00  motivo=- argumento=-  [1232 ulps]  PASA
   x=3.50000: ulps=1232.00 tol=1232.00 fraccion=1.00000 ok=true  PASA
   x=3.50000: ulps=1233.00 tol=1232.00 fraccion=1.00081 ok=false  PASA

-- relativa_con_suelo_absoluto (lgamma_d): max(1e-14*|ref|, 2.9e-16), ref=0.001
   region=lgamma_d fuera_de_rango='' ref=0.00100000
   regla=relativa_con_suelo_absoluto  tol_ulps=1337.39  motivo=- argumento=-  [max(1e-14*|ref|, 2.9e-16)]  PASA
   (rama dominante: suelo absoluto)
   x=0.00100000: ulps=1337.00 tol=1337.39 fraccion=0.999709 ok=true  PASA
   x=0.00100000: ulps=1338.00 tol=1337.39 fraccion=1.00046 ok=false  PASA

-- relativa_con_suelo_absoluto (lgamma_d): max(1e-14*|ref|, 2.9e-16), ref=10
   region=lgamma_d fuera_de_rango='' ref=10.0000
   regla=relativa_con_suelo_absoluto  tol_ulps=56.2950  motivo=- argumento=-  [max(1e-14*|ref|, 2.9e-16)]  PASA
   (rama dominante: relativa)
   x=10.0000: ulps=56.0000 tol=56.2950 fraccion=0.994760 ok=true  PASA
   x=10.0000: ulps=57.0000 tol=56.2950 fraccion=1.01252 ok=false  PASA

-- tramos_por_a: a=0.5 -> tramo (0,0.8) relativa 1e-14
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (0, 0.8): relativa 1e-14]  PASA

-- tramos_por_a: a=0.8 (no pertenece a (0,0.8)) -> sin tramo
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [gamma_fuera: a=0.8 no cae en ningun tramo]  PASA

-- tramos_por_a: a=2.25 (excluido de (2.25,40]) -> sin tramo
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [gamma_fuera: a=2.25 no cae en ningun tramo]  PASA

-- tramos_por_a: a=2.2500000000000004 -> tramo (2.25,40]
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (2.25, 40]: relativa 1e-14]  PASA

-- tramos_por_a: a=40 (incluido) -> tramo (2.25,40]
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=relativa  tol_ulps=45.0360  motivo=- argumento=-  [gamma_fuera tramo (2.25, 40]: relativa 1e-14]  PASA

-- tramos_por_a: a=40.00000000000001 -> lanza pendiente en 'a'
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=lanza  tol_ulps=-  motivo=pendiente argumento=a  [gamma_fuera tramo (40, a*): lanza pendiente]  PASA
   motivo=pendiente argumento=a PASA

-- tramos_por_a: a justo bajo a* -> lanza
   region=gamma_fuera fuera_de_rango='' ref=1.00000
   regla=lanza  tol_ulps=-  motivo=pendiente argumento=a  [gamma_fuera tramo (40, a*): lanza pendiente]  PASA

-- tramos_por_a: a >= a* con fuera_de_rango=inf -> P3 (por precedencia)
   region=gamma_fuera fuera_de_rango='inf' ref=Infinity
   regla=P3  tol_ulps=0.00000  motivo=- argumento=-  [P3: +-Infinity exacto]  PASA

-- juzgarFallo (lanza / pendiente en a)
   StatsError pendiente/a     -> ok=true clase='ok'  PASA
   StatsError dominio/a       -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   StatsError pendiente/x     -> ok=false clase='StatsError con motivo o argumento distinto'  PASA
   TypeError                  -> ok=false clase='excepcion no StatsError'  PASA
   no lanzo (devolvio 1)      -> ok=false clase='no lanzo'  PASA
   no lanzo (devolvio NaN)    -> ok=false clase='no lanzo'  PASA

-- informa_fallo (pgamma_indet)
   region=pgamma_indet fuera_de_rango='' ref=0.00000
   regla=informa_fallo  tol_ulps=-  motivo=indeterminado argumento=-  [informa fallo (indeterminado)]  PASA
   motivo=indeterminado PASA

-- P1 (qnorm_centro)
   region=qnorm_centro fuera_de_rango='' ref=1.00000
   regla=no_implementado_en_arnes_v1  tol_ulps=-  motivo=- argumento=-  [P1]  PASA

-- P1 (qt_ngt2)
   region=qt_ngt2 fuera_de_rango='' ref=1.00000
   regla=no_implementado_en_arnes_v1  tol_ulps=-  motivo=- argumento=-  [P1]  PASA

-- etiqueta desconocida
   region=inventada fuera_de_rango='' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [etiqueta 'inventada' no esta en tolerancias.json]  PASA

-- fuera_de_rango desconocido
   region=erf_r1 fuera_de_rango='otro' ref=1.00000
   regla=sin_regla  tol_ulps=-  motivo=- argumento=-  [fuera_de_rango desconocido 'otro']  PASA

RESULTADO B4: PASA
```

**PASA**

## B5 · run.js

Probado por las pruebas B6 y estos casos adicionales (ver más abajo): módulo por defecto inexistente (ROJO con mensaje), función no exportada (ROJO), `--region`, salida `stats/informes/_ultimo_<f>.json`. **PASA**

## B6 · pruebas con módulos falsos

### B6 (a) erf que devuelve siempre 0. Esperado: ROJO en las tres etiquetas; pasan exactamente 3 filas (ids 55, 56, 57).

Comando: `node stats/harness/run.js --funcion erf --modulo stats/harness/_fakes/fake_erf_cero.js --ids 55,56,57`

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_cero.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=3  fallan=530
  max ulps=8.99883e+15  p99 ulps=8.91067e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 59)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: fuera de tolerancia=530
  10 peores: id 338: 8.99883e+15 (fuera de tolerancia); id 256: 8.98541e+15 (fuera de tolerancia); id 462: 8.95915e+15 (fuera de tolerancia); id 540: 8.95779e+15 (fuera de tolerancia); id 92: 8.92766e+15 (fuera de tolerancia); id 195: 8.91067e+15 (fuera de tolerancia); id 539: 8.90756e+15 (fuera de tolerancia); id 334: 8.89007e+15 (fuera de tolerancia); id 1: 8.87414e+15 (fuera de tolerancia); id 10: 8.87414e+15 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0 ref=0.49261347321793797 ulps=8.87414e+15 tol=8.87414

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=9.00720e+15  p99 ulps=9.00720e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: fuera de tolerancia=534
  10 peores: id 37: 9.00720e+15 (fuera de tolerancia); id 44: 9.00720e+15 (fuera de tolerancia); id 46: 9.00720e+15 (fuera de tolerancia); id 54: 9.00720e+15 (fuera de tolerancia); id 38: 9.00720e+15 (fuera de tolerancia); id 47: 9.00720e+15 (fuera de tolerancia); id 40: 9.00720e+15 (fuera de tolerancia); id 49: 9.00720e+15 (fuera de tolerancia); id 629: 9.00720e+15 (fuera de tolerancia); id 1024: 9.00720e+15 (fuera de tolerancia)
  ejemplo de fallo: id 3: x=0 ref=0.49261389780837755 ulps=8.87414e+15 tol=8.87414

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=9.00720e+15  p99 ulps=9.00720e+15
  fraccion de la tolerancia (peor fila)=1.00000e+15 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: fuera de tolerancia=508
  10 peores: id 1098: 9.00720e+15 (fuera de tolerancia); id 1113: 9.00720e+15 (fuera de tolerancia); id 1160: 9.00720e+15 (fuera de tolerancia); id 1167: 9.00720e+15 (fuera de tolerancia); id 1177: 9.00720e+15 (fuera de tolerancia); id 1178: 9.00720e+15 (fuera de tolerancia); id 1203: 9.00720e+15 (fuera de tolerancia); id 1345: 9.00720e+15 (fuera de tolerancia); id 1434: 9.00720e+15 (fuera de tolerancia); id 1444: 9.00720e+15 (fuera de tolerancia)
  ejemplo de fallo: id 39: x=0 ref=0.99999998458325 ulps=9.00720e+15 tol=9.0072

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=0; ulps=1; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=0; ulps=1; tol_ulps=2

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (b) erf tramposa (devuelve ref_mp70_hex). Esperado: VERDE, máx ulps 0.

Comando: `node stats/harness/run.js --funcion erf --modulo stats/harness/_fakes/fake_erf_tramposa.js --ids 55,56,57`

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_tramposa.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 18: 0

Etiqueta erf_r2: pasa
  n=534  pasan=534  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 12: 0; id 14: 0; id 16: 0; id 17: 0; id 19: 0; id 20: 0

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 39)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 0; id 41: 0; id 43: 0; id 45: 0; id 48: 0; id 50: 0; id 52: 0; id 53: 0; id 1076: 0; id 1077: 0

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=-5e-324; ulps=0; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=5e-324; ulps=0; tol_ulps=2

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (c) tramposa + nextafter(ref,+inf) salvo ref=0. Esperado: VERDE, máx ulps 1 en las tres.

Comando: `node stats/harness/run.js --funcion erf --modulo stats/harness/_fakes/fake_erf_mas1.js --ids 55,56,57`

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_mas1.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: pasa
  n=533  pasan=533  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.5 (id 56)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 1: 1; id 2: 1; id 4: 1; id 6: 1; id 8: 1; id 10: 1; id 11: 1; id 13: 1; id 15: 1; id 18: 1

Etiqueta erf_r2: pasa
  n=534  pasan=534  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.220547 (id 1073)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  10 peores: id 3: 1; id 5: 1; id 7: 1; id 9: 1; id 12: 1; id 14: 1; id 16: 1; id 17: 1; id 19: 1; id 20: 1

Etiqueta erf_r3: pasa
  n=508  pasan=508  fallan=0
  max ulps=1  p99 ulps=1
  fraccion de la tolerancia (peor fila)=0.222045 (id 1076)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  10 peores: id 39: 1; id 41: 1; id 43: 1; id 45: 1; id 48: 1; id 50: 1; id 52: 1; id 53: 1; id 1076: 1; id 1078: 1

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=-5e-324; devolvio=0; ulps=1; tol_ulps=2
  fila id 57 (erf_r1, subnormal): pasa; regla=P2_subnormal; ref=5e-324; devolvio=1e-323; ulps=1; tol_ulps=2

VERDE
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (c) tramposa con nextafter x20 salvo ref=0. Esperado: ROJO en las tres; fallan los ids 56 y 57.

Comando: `node stats/harness/run.js --funcion erf --modulo stats/harness/_fakes/fake_erf_mas20.js --ids 55,56,57`

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_mas20.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=1  fallan=532
  max ulps=20  p99 ulps=20
  fraccion de la tolerancia (peor fila)=10 (id 56)
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: fuera de tolerancia=532
  10 peores: id 1: 20 (fuera de tolerancia); id 2: 20 (fuera de tolerancia); id 4: 20 (fuera de tolerancia); id 6: 20 (fuera de tolerancia); id 8: 20 (fuera de tolerancia); id 10: 20 (fuera de tolerancia); id 11: 20 (fuera de tolerancia); id 13: 20 (fuera de tolerancia); id 15: 20 (fuera de tolerancia); id 18: 20 (fuera de tolerancia)
  ejemplo de fallo: id 1: x=0.4926134732179391 ref=0.49261347321793797 ulps=20 tol=8.87414

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=20  p99 ulps=20
  fraccion de la tolerancia (peor fila)=4.41094 (id 1073)
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: fuera de tolerancia=534
  10 peores: id 3: 20 (fuera de tolerancia); id 5: 20 (fuera de tolerancia); id 7: 20 (fuera de tolerancia); id 9: 20 (fuera de tolerancia); id 12: 20 (fuera de tolerancia); id 14: 20 (fuera de tolerancia); id 16: 20 (fuera de tolerancia); id 17: 20 (fuera de tolerancia); id 19: 20 (fuera de tolerancia); id 20: 20 (fuera de tolerancia)
  ejemplo de fallo: id 3: x=0.49261389780837866 ref=0.49261389780837755 ulps=20 tol=8.87414

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=39  p99 ulps=39
  fraccion de la tolerancia (peor fila)=4.44089 (id 1076)
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: fuera de tolerancia=508
  10 peores: id 1098: 39 (fuera de tolerancia); id 1113: 39 (fuera de tolerancia); id 1160: 39 (fuera de tolerancia); id 1167: 39 (fuera de tolerancia); id 1177: 39 (fuera de tolerancia); id 1203: 39 (fuera de tolerancia); id 1434: 39 (fuera de tolerancia); id 1137: 38 (fuera de tolerancia); id 1352: 38 (fuera de tolerancia); id 1454: 38 (fuera de tolerancia)
  ejemplo de fallo: id 39: x=0.9999999845832522 ref=0.99999998458325 ulps=20 tol=9.0072

Filas pedidas con --ids:
  fila id 55 (erf_r1): pasa; regla=relativa; ref=0; devolvio=0; ulps=0; tol_ulps=0
  fila id 56 (erf_r1, subnormal): FALLA; regla=P2_subnormal; ref=-5e-324; devolvio=9.4e-323; ulps=20; tol_ulps=2; fuera de tolerancia
  fila id 57 (erf_r1, subnormal): FALLA; regla=P2_subnormal; ref=5e-324; devolvio=1.04e-322; ulps=20; tol_ulps=2; fuera de tolerancia

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (d) erf que lanza TypeError. Esperado: ROJO, clasificado «excepción no StatsError».

Comando: `node stats/harness/run.js --funcion erf --modulo stats/harness/_fakes/fake_erf_typeerror.js --ids 55`

```
Funcion: erf   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erf_typeerror.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erf_r1: ROJA
  n=533  pasan=0  fallan=533
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=531; tol_ulps 0-8.99883] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  fallos por clase: excepcion no StatsError=533
  10 peores: id 1: Infinity (excepcion no StatsError); id 2: Infinity (excepcion no StatsError); id 4: Infinity (excepcion no StatsError); id 6: Infinity (excepcion no StatsError); id 8: Infinity (excepcion no StatsError); id 10: Infinity (excepcion no StatsError); id 11: Infinity (excepcion no StatsError); id 13: Infinity (excepcion no StatsError); id 15: Infinity (excepcion no StatsError); id 18: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 1: TypeError: fake: x is not a function

Etiqueta erf_r2: ROJA
  n=534  pasan=0  fallan=534
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=534; tol_ulps 4.53418-9.0072]
  fallos por clase: excepcion no StatsError=534
  10 peores: id 3: Infinity (excepcion no StatsError); id 5: Infinity (excepcion no StatsError); id 7: Infinity (excepcion no StatsError); id 9: Infinity (excepcion no StatsError); id 12: Infinity (excepcion no StatsError); id 14: Infinity (excepcion no StatsError); id 16: Infinity (excepcion no StatsError); id 17: Infinity (excepcion no StatsError); id 19: Infinity (excepcion no StatsError); id 20: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 3: TypeError: fake: x is not a function

Etiqueta erf_r3: ROJA
  n=508  pasan=0  fallan=508
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=-
  tolerancia aplicada: relativa 1e-15 [n=508; tol_ulps 4.5036-9.0072]
  fallos por clase: excepcion no StatsError=508
  10 peores: id 39: Infinity (excepcion no StatsError); id 41: Infinity (excepcion no StatsError); id 43: Infinity (excepcion no StatsError); id 45: Infinity (excepcion no StatsError); id 48: Infinity (excepcion no StatsError); id 50: Infinity (excepcion no StatsError); id 52: Infinity (excepcion no StatsError); id 53: Infinity (excepcion no StatsError); id 1076: Infinity (excepcion no StatsError); id 1077: Infinity (excepcion no StatsError)
  ejemplo de fallo: id 39: TypeError: fake: x is not a function

Filas pedidas con --ids:
  fila id 55 (erf_r1): FALLA; regla=relativa; ref=0; devolvio=TypeError; ulps=Infinity; tol_ulps=0; excepcion no StatsError

ROJO (etiquetas rojas: erf_r1, erf_r2, erf_r3)
(escrito stats/informes/_ultimo_erf.json)
```

### B6 (e) gamma tramposa, StatsError pendiente/a en 40<a<a*. Esperado: VERDE.

Comando: `node stats/harness/run.js --funcion gamma --modulo stats/harness/_fakes/fake_gamma_pendiente.js `

```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_pendiente.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: pasa
  n=508  pasan=508  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  10 peores: id 2: 0; id 4: 0; id 6: 0; id 8: 0; id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 520: 0; id 521: 0

VERDE
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (e) igual pero motivo dominio en el tramo 3. Esperado: ROJO solo en el tramo 3 (gamma_fuera: 120 filas, las de 40<a<a*).

Comando: `node stats/harness/run.js --funcion gamma --modulo stats/harness/_fakes/fake_gamma_dominio.js `

```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_dominio.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: StatsError con motivo o argumento distinto=120
  10 peores: id 519: Infinity (StatsError con motivo o argumento distinto); id 522: Infinity (StatsError con motivo o argumento distinto); id 527: Infinity (StatsError con motivo o argumento distinto); id 538: Infinity (StatsError con motivo o argumento distinto); id 548: Infinity (StatsError con motivo o argumento distinto); id 551: Infinity (StatsError con motivo o argumento distinto); id 552: Infinity (StatsError con motivo o argumento distinto); id 555: Infinity (StatsError con motivo o argumento distinto); id 556: Infinity (StatsError con motivo o argumento distinto); id 559: Infinity (StatsError con motivo o argumento distinto)
  ejemplo de fallo: id 519: motivo=dominio argumento=a (esperado motivo=pendiente argumento=a)

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (e) igual pero devolviendo un número en el tramo 3. Esperado: ROJO en el tramo 3.

Comando: `node stats/harness/run.js --funcion gamma --modulo stats/harness/_fakes/fake_gamma_numero.js `

```
Funcion: gamma   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_gamma_numero.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma_d: pasa
  n=510  pasan=510  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-14 [n=510; tol_ulps 45.0497-89.9485]
  10 peores: id 1: 0; id 3: 0; id 5: 0; id 7: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta gamma_fuera: ROJA
  n=508  pasan=388  fallan=120
  max ulps=Infinity  p99 ulps=Infinity
  fraccion de la tolerancia (peor fila)=0 (id 2)
  tolerancia aplicada: gamma_fuera tramo (0, 0.8): relativa 1e-14 [n=262; tol_ulps 45.5536-89.9169] | gamma_fuera tramo (2.25, 40]: relativa 1e-14 [n=126; tol_ulps 45.9418-90.061] | gamma_fuera tramo (40, a*): lanza pendiente [n=120]
  fallos por clase: no lanzo=120
  10 peores: id 519: Infinity (no lanzo); id 522: Infinity (no lanzo); id 527: Infinity (no lanzo); id 538: Infinity (no lanzo); id 548: Infinity (no lanzo); id 551: Infinity (no lanzo); id 552: Infinity (no lanzo); id 555: Infinity (no lanzo); id 556: Infinity (no lanzo); id 559: Infinity (no lanzo)
  ejemplo de fallo: id 519: devolvio 1; se esperaba StatsError motivo=pendiente

ROJO (etiquetas rojas: gamma_fuera)
(escrito stats/informes/_ultimo_gamma.json)
```

### B6 (f) erfc tramposa que devuelve 0 en las filas subnormales. Esperado: ROJO en esas filas (ver ambiguedades #8: 41 de 43).

Comando: `node stats/harness/run.js --funcion erfc --modulo stats/harness/_fakes/fake_erfc_sub0.js `

```
Funcion: erfc   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erfc_sub0.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erfc_neg: pasa
  n=504  pasan=504  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=504; tol_ulps 4.5036-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 8: 0; id 1449: 0; id 1450: 0; id 1451: 0; id 1452: 0; id 1453: 0; id 1454: 0

Etiqueta erfc_r1: pasa
  n=511  pasan=511  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=511; tol_ulps 4.52719-9.00662]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta erfc_r2: pasa
  n=682  pasan=682  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 12)
  tolerancia aplicada: relativa 1e-15 [n=682; tol_ulps 4.50584-9.00079]
  10 peores: id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 19: 0; id 20: 0; id 21: 0; id 22: 0; id 23: 0; id 25: 0

Etiqueta erfc_r3: ROJA
  n=1751  pasan=1710  fallan=41
  max ulps=1.70799e+15  p99 ulps=2.57210e+9
  fraccion de la tolerancia (peor fila)=8.53997e+14 (id 3199)
  tolerancia aplicada: relativa 1e-15 [n=1513; tol_ulps 4.50405-9.00576] | P2: 2 ulps de subnormal [n=43; tol_ulps 2] | P2: 0 exacto [n=195; tol_ulps 0]
  fallos por clase: fuera de tolerancia=41
  10 peores: id 3199: 1.70799e+15 (fuera de tolerancia); id 1118: 1.61982e+15 (fuera de tolerancia); id 1117: 1.61982e+15 (fuera de tolerancia); id 1119: 1.61982e+15 (fuera de tolerancia); id 3399: 7.90608e+13 (fuera de tolerancia); id 1121: 5.81779e+13 (fuera de tolerancia); id 1120: 5.81779e+13 (fuera de tolerancia); id 1122: 5.81779e+13 (fuera de tolerancia); id 1123: 2.07328e+12 (fuera de tolerancia); id 1124: 2.07328e+12 (fuera de tolerancia)
  ejemplo de fallo: id 1117: x=0 ref=8.00298579263671e-309 ulps=1.61982e+15 tol=2

ROJO (etiquetas rojas: erfc_r3)
(escrito stats/informes/_ultimo_erfc.json)
```

### B6 (f) erfc tramposa que devuelve ref. Esperado: VERDE.

Comando: `node stats/harness/run.js --funcion erfc --modulo stats/harness/_fakes/fake_erfc_tramposa.js `

```
Funcion: erfc   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/harness/_fakes/fake_erfc_tramposa.js
argumentos (orden de reglas.json): x [+ lower_tail cuando la columna no esta vacia]

Etiqueta erfc_neg: pasa
  n=504  pasan=504  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 3)
  tolerancia aplicada: relativa 1e-15 [n=504; tol_ulps 4.5036-9.0072]
  10 peores: id 3: 0; id 5: 0; id 7: 0; id 8: 0; id 1449: 0; id 1450: 0; id 1451: 0; id 1452: 0; id 1453: 0; id 1454: 0

Etiqueta erfc_r1: pasa
  n=511  pasan=511  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 1)
  tolerancia aplicada: relativa 1e-15 [n=511; tol_ulps 4.52719-9.00662]
  10 peores: id 1: 0; id 2: 0; id 4: 0; id 6: 0; id 9: 0; id 10: 0; id 11: 0; id 13: 0; id 15: 0; id 17: 0

Etiqueta erfc_r2: pasa
  n=682  pasan=682  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 12)
  tolerancia aplicada: relativa 1e-15 [n=682; tol_ulps 4.50584-9.00079]
  10 peores: id 12: 0; id 14: 0; id 16: 0; id 18: 0; id 19: 0; id 20: 0; id 21: 0; id 22: 0; id 23: 0; id 25: 0

Etiqueta erfc_r3: pasa
  n=1751  pasan=1751  fallan=0
  max ulps=0  p99 ulps=0
  fraccion de la tolerancia (peor fila)=0 (id 30)
  tolerancia aplicada: relativa 1e-15 [n=1513; tol_ulps 4.50405-9.00576] | P2: 2 ulps de subnormal [n=43; tol_ulps 2] | P2: 0 exacto [n=195; tol_ulps 0]
  10 peores: id 30: 0; id 32: 0; id 34: 0; id 36: 0; id 37: 0; id 38: 0; id 39: 0; id 40: 0; id 41: 0; id 42: 0

VERDE
(escrito stats/informes/_ultimo_erfc.json)
```

### B6 (g) qt. Esperado: «P1 no implementado en arnes-v1», ROJO.

Comando: `node stats/harness/run.js --funcion qt --modulo stats/harness/_fakes/fake_qt.js `

```
Funcion: qt
P1 no implementado en arnes-v1 (etiquetas P1: qt_resto, qt_ngt2); P1 llega con arnes-v2 en la sesion 2
ROJO
(escrito stats/informes/_ultimo_qt.json)
```

## Resumen B6

| caso | esperado | obtenido | |
|---|---|---|---|
| a | ROJO ×3, pasan 3 (ids 55–57) | ROJO ×3; erf_r1 pasan=3, erf_r2/r3 pasan=0; ids 55,56,57 pasan | PASA |
| b | VERDE, máx 0 | VERDE, máx 0 | PASA |
| c (+1) | VERDE, máx 1 | VERDE, máx 1 en las tres | PASA |
| c (×20) | ROJO ×3, fallan 56 y 57 | ROJO ×3 (máx 20); ids 56 y 57 FALLA (20 ulps vs 2) | PASA |
| d | ROJO, «excepción no StatsError» | ROJO ×3, clase «excepcion no StatsError» | PASA |
| e pendiente | VERDE | VERDE | PASA |
| e dominio | ROJO solo tramo 3 | ROJO solo gamma_fuera, 120 fallos = filas con 40<a<a* | PASA |
| e número | ROJO tramo 3 | ROJO gamma_fuera, 120 «no lanzo» | PASA |
| f ceros | ROJO en subnormales | ROJO erfc_r3, 41 fallos (2 de 43 dentro de P2) | PASA |
| f ref | VERDE | VERDE | PASA |
| g | P1 no implementado, ROJO | ROJO con el mensaje | PASA |

Las ejecuciones con módulos falsos escribieron `stats/informes/_ultimo_*.json`; se borraron al terminar para que no pasen por resultados de funciones reales.

## SHA-256 de lo que se congela

```
6bd214078c35af2182eeb474865913b9fc7fd64669cdd337530ef547c34b59aa  stats/harness/_fakes/_comun.js
33934a41d20d0329f0f2b32b66fc9e491a7890b8ad5c2c3121639562236073f0  stats/harness/_fakes/fake_erf_cero.js
74db622aeb22e25f033058cc9daf8098558d8af009443e56152eb56cfa608a4f  stats/harness/_fakes/fake_erf_mas1.js
adb19fa96212a6df1d8bb022d3b4410c9498017bd2a323faa53a06d2a7c42a65  stats/harness/_fakes/fake_erf_mas20.js
dec63eb0e37384674d9a0fd783179cd08de0533f3f515db4e867343f37702017  stats/harness/_fakes/fake_erf_tramposa.js
08bb91ca0d10387f2dc0c89e8c40a315f1c62b1106ec35b312782c41377312ed  stats/harness/_fakes/fake_erf_typeerror.js
0842ac821757361facf22f316c71dfcb9f6ae30787d926b6ee58e0267a8a1b37  stats/harness/_fakes/fake_erfc_sub0.js
f5070d885280c65b1ebd549f80bb7647589a076d096f1cf62a173aa4de861d44  stats/harness/_fakes/fake_erfc_tramposa.js
9d2e4b9b767759a1634e3930a63920e6698c3a477faff2a137b7cf059aaff447  stats/harness/_fakes/fake_gamma_dominio.js
6ec9f93a27eb3a73b0229608f42ee917a6b0c73900c04da1ccf036ea84fc8ad8  stats/harness/_fakes/fake_gamma_numero.js
4b9dfa0d395879f09f74de4ce27e539e5b7ff70460b36beb37381d9ed7e8cfe9  stats/harness/_fakes/fake_gamma_pendiente.js
d183d74669851bd6a9bb83b82ff3f455bf28d5dc29ccf1f17b42b27e4504e274  stats/harness/_fakes/fake_qt.js
c718779a50bd8488dd528ff87a53bd93baf52e9d304ddcd1e2785cf25c5a1de9  stats/harness/_fakes/prueba_b1.js
edd39c6ec7a817c2fbb917c0ef096773de563d2e2940d20d444377083f2ac744  stats/harness/_fakes/prueba_b2.js
373cc84a050a0f635433a07e7169a3f4889b7e247b3bcb99e1e84aee189a7acd  stats/harness/_fakes/prueba_b3.js
a475819581a192745e087d48c22740702d04a33d3df6cf5829e86e9a3e5640a8  stats/harness/_fakes/prueba_b4.js
dd1b20671f9bde3a0c09d42b0b7a24fcc08088b30106bad5c8a4eda73058db3b  stats/harness/_fakes/prueba_error.js
426fbfb61761ca1861a03a772b4ee1feb7cdccf30f72dcb802b4c8a978e15cac  stats/harness/csv.js
f09bf37143153f2bfa25ae6554c6200ff8164bc9b38e608f0836d4493cc6afd0  stats/harness/hexfloat.js
c5158e79c4761ffe5ca6cdecdaccf22b29cbe11b491a9fdd7151838d89bfde8b  stats/harness/reglas.json
f71e61f74f8ddacf3733a78b7863658503314e157659fa0a54dc9e5f225ad69c  stats/harness/run.js
658326499bbaa1397c1d35ef20db999b24f1ecc3a8e6a1e854fe1e2f1e7929c6  stats/harness/tolerancia.js
1961f3c7f773e5b5522c8ee7ac3a1c854bd9ee76d1a21d165647c470d2f5ef94  stats/harness/tolerancias.json
db715a21757952c78af7940ad1a4472b1579ca8e40697c7b87bd847fa40b1d4e  stats/harness/ulps.js
3ca9d4afd21425087cf31893b8f9f63c81b0b8408db5e343ca76e5f8aa26ab9a  stats/package.json
eadfc2da34b5c6dd195ff6c4b4eaadfe28ec9f407e32bde01dc50d10882fe979  stats/src/error.js
```
