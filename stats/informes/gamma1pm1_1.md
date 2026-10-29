# gamma1pm1 · iteración 1

1. Función: `_gamma1pm1(a)` (`stats/src/gamma1pm1.js`; interna, el arnés la carga como `_gamma1pm1`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. H(a) = 1/Γ(a + 1) − 1 por el Ap. C de DM86 (ω y ω₁ por Horner), con t = a si a ≤ ½ y t = a − 1 si a > ½, y el primer tramo de la lista del folio que cumple la condición (C4: en a = ½ rige aω₁; en a = 0 y a = 1 sale 0 exacto). Sin validación: la precondición −0.5 ≤ a ≤ 1.5 es del llamador.

3. Salida del arnés:

```
Funcion: gamma1pm1   modulo: file:///C:/Users/RAVELLO%20CAMACHO/Documents/statsjs_build/researchingmind/stats/src/stats.js
argumentos (orden de reglas.json): a [+ lower_tail cuando la columna no esta vacia]

Etiqueta gamma1pm1_c: pasa
  n=516  pasan=516  fallan=0
  max ulps=20  p99 ulps=17
  fraccion de la tolerancia (peor fila)=0.115457 (id 166)
  tolerancia aplicada: relativa 2e-14 [n=514; tol_ulps 0-179.778] | P2: 2 ulps de subnormal [n=2; tol_ulps 2]
  10 peores: id 400: 20; id 94: 19; id 166: 18; id 185: 18; id 467: 18; id 72: 17; id 96: 17; id 111: 17; id 127: 17; id 229: 17

VERDE
(escrito stats/informes/_ultimo_gamma1pm1.json)
```

4. Veredicto: **VERDE**. Etiquetas rojas: ninguna.

5. No aplica.

6. Ambigüedades de esta iteración: **#12** (ampliación: razón primero en los Apéndices C y D).

7. Comparación con la tabla del expediente: sin tabla.

8. Tiempo aproximado: incluido en el de lgamma.

## Cierre de gamma1pm1
- Iteraciones hasta VERDE: 1.
- Ambigüedades anotadas: 1 (#12, ampliada).
- PARADA: no.
- Diferencia máxima en ulps con la tabla del expediente: sin tabla.
- Pruebas propias (`prueba_gamma.mjs`): _gamma1pm1(0) = 0 y _gamma1pm1(1) = 0 exactos; _gamma1pm1(0.5) = 0.12837916709551264 (1/Γ(1.5) − 1 ≈ 0.1283791670955126).
