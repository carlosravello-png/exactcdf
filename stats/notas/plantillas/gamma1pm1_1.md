# gamma1pm1 · iteración 1

1. Función: `_gamma1pm1(a)` (`stats/src/gamma1pm1.js`; interna, el arnés la carga como `_gamma1pm1`). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. H(a) = 1/Γ(a + 1) − 1 por el Ap. C de DM86 (ω y ω₁ por Horner), con t = a si a ≤ ½ y t = a − 1 si a > ½, y el primer tramo de la lista del folio que cumple la condición (C4: en a = ½ rige aω₁; en a = 0 y a = 1 sale 0 exacto). Sin validación: la precondición −0.5 ≤ a ≤ 1.5 es del llamador.

3. Salida del arnés:

@@ARNES@@

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
