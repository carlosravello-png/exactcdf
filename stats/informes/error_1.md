# error_1 · stats/src/error.js (Tarea A, sesion 0)

Fecha: 2026-10-23

Comando: `node stats/harness/_fakes/prueba_error.js`

Correccion durante la sesion: la primera corrida dio 1 NO PASA por un defecto de la prueba (llamaba a `validar("prueba","z",3)` sin dominio para una funcion que `reglas.json` no declara; lo correcto es que lance un Error comun). Se cambio la prueba para pasar un dominio explicito. `error.js` no cambio.

Salida completa:

```
== 1. Un StatsError por motivo, con todos sus campos
motivos leidos de reglas.json: dominio, tipo, indeterminado, pendiente
{"name":"StatsError","funcion":"pgamma","motivo":"dominio","argumento":"a","valor":0,"dominio":{"min":0,"max":null,"incluye_min":false,"incluye_max":false},"region":null,"message":"pgamma: argument 'a' = 0 is outside the domain (0, Infinity)"}
  motivo dominio: PASA
{"name":"StatsError","funcion":"erf","motivo":"tipo","argumento":"x","valor":"0.5","dominio":null,"region":null,"message":"erf: argument 'x' has the wrong type (got \"0.5\"; expected number)"}
  motivo tipo: PASA
{"name":"StatsError","funcion":"pgamma","motivo":"indeterminado","argumento":"x","valor":1e+300,"dominio":null,"region":"pgamma_indet","message":"pgamma: result cannot be resolved in double precision for argument 'x' = 1e+300 (region pgamma_indet)"}
  motivo indeterminado: PASA
{"name":"StatsError","funcion":"gamma","motivo":"pendiente","argumento":"a","valor":100,"dominio":null,"region":"gamma_fuera","message":"gamma: no method is signed yet for argument 'a' = 100 (region gamma_fuera)"}
  motivo pendiente: PASA
motivos cubiertos == los de reglas.json: PASA

== 2. validar(...)
  rechaza erf.x = NaN (dominio): PASA  -> erf: argument 'x' = NaN is outside the domain (-Infinity, Infinity)
  rechaza erf.x = Infinity (dominio): PASA  -> erf: argument 'x' = Infinity is outside the domain (-Infinity, Infinity)
  rechaza erf.x = -Infinity (dominio): PASA  -> erf: argument 'x' = -Infinity is outside the domain (-Infinity, Infinity)
  rechaza erf.x = "0.5" (tipo): PASA  -> erf: argument 'x' has the wrong type (got "0.5"; expected number)
  rechaza erf.x = null (tipo): PASA  -> erf: argument 'x' has the wrong type (got null; expected number)
  acepta  erf.x = -0: PASA
  acepta  erf.x = 0: PASA
  rechaza gamma.a = -0 (dominio): PASA  -> gamma: argument 'a' = -0 is outside the domain (0, Infinity)
  rechaza gamma.a = 0 (dominio): PASA  -> gamma: argument 'a' = 0 is outside the domain (0, Infinity)
  rechaza gamma.a = -1 (dominio): PASA  -> gamma: argument 'a' = -1 is outside the domain (0, Infinity)
  acepta  gamma.a = 5e-324: PASA
  acepta  pgamma.x = -0: PASA
  acepta  pgamma.x = 0: PASA
  rechaza pgamma.x = -5e-324 (dominio): PASA  -> pgamma: argument 'x' = -5e-324 is outside the domain [0, Infinity)
  acepta  pbeta.x = 1: PASA
  rechaza pbeta.x = 1.0000000000000002 (dominio): PASA  -> pbeta: argument 'x' = 1.0000000000000002 is outside the domain [0, 1]
  rechaza qnorm.p = 0 (dominio): PASA  -> qnorm: argument 'p' = 0 is outside the domain (0, 1)
  rechaza qnorm.p = 1 (dominio): PASA  -> qnorm: argument 'p' = 1 is outside the domain (0, 1)
  acepta  qnorm.p = 0.5: PASA
  2**-1073 === parametro_min.valor de reglas.json: PASA
  acepta  pchisq.nu = 1e-323: PASA
  rechaza pchisq.nu = 5e-324 (dominio): PASA  -> pchisq: argument 'nu' = 5e-324 is outside the domain [1e-323, Infinity)
  acepta  pt.n = 1e-323: PASA
  rechaza pt.n = 5e-324 (dominio): PASA  -> pt: argument 'n' = 5e-324 is outside the domain [1e-323, Infinity)
  dominio explicito [0,3) acepta 2.5: PASA
  dominio explicito [0,3) rechaza 3: PASA  -> prueba: argument 'z' = 3 is outside the domain [0, 3)
  funcion sin dominio en reglas.json lanza Error comun (defecto del llamador): PASA

== 3. validarLowerTail(...)
  acepta undefined -> true: PASA
  acepta true -> true: PASA
  acepta false -> false: PASA
  rechaza 1 (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got 1; expected boolean)
  rechaza "true" (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got "true"; expected boolean)
  rechaza null (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got null; expected boolean)
  rechaza 0 (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got 0; expected boolean)
  rechaza NaN (tipo): PASA  -> pnorm: argument 'lowerTail' has the wrong type (got NaN; expected boolean)

RESULTADO: PASA
```

Veredicto: PASA (exit 0, ningun NO PASA).
