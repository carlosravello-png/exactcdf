# primitivas · iteración 1

1. Función: `stats/src/primitivas.js` (two_sum, split, two_prod, dd_add, dd_mul, dd_div, exp_dd, φ₁ del Ap. E y de la serie C7, ln_r, ln_dd, ln1m_dd). Iteración 1. Fecha: 26/10/2026 (hora local de Carlos, UTC−5).

2. Qué cambió: primera versión. Las primitivas se escribieron en el orden exacto de D6.2 y D6b, sin fma. ln_dd obtiene m y k de los bits del double con DataView e incluye el caso subnormal de 5.2. LN2_HI y LN2_LO se construyen desde sus bits hexadecimales.

3. Salida de `node stats/notas/prueba_primitivas.mjs` (los cinco casos del encargo):

```
OK   two_sum(1, 2^-53)
   alto  = 0x1.0000000000000p+0  (1)  esperado 0x1.0000000000000p+0
   bajo  = 0x1.0000000000000p-53  (1.1102230246251565e-16)  esperado 0x1.0000000000000p-53
OK   two_prod(1 + 2^-52, 1 + 2^-52)
   alto  = 0x1.0000000000002p+0  (1.0000000000000004)  esperado 0x1.0000000000002p+0
   bajo  = 0x1.0000000000000p-104  (4.930380657631324e-32)  esperado 0x1.0000000000000p-104
OK   ln_dd(2)
   alto  = 0x1.62e42fefa39efp-1  (0.6931471805599453)  esperado 0x1.62e42fefa39efp-1
   bajo  = 0x1.abc9e3b000000p-56  (2.319046812685077e-17)  esperado 0x1.abc9e3b000000p-56
   alto === Math.LN2: true
ln_dd(2^-1074): -744.4400719213812 -4.42244434030227e-14 -0x1.74385446d71c3p+9 -0x1.8e569fa800000p-45
   alto igual a -744.4400719213812: true; bajo esperado -4.42244434030227e-14, obtenido -4.42244434030227e-14
OK   ln1m_dd(2^-54)
   alto  = -0x1.0000000000000p-54  (-5.551115123125783e-17)  esperado -0x1.0000000000000p-54
   bajo  = -0x1.0000000000000p-109  (-1.5407439555097887e-33)  esperado -0x1.0000000000000p-109
TODOS COINCIDEN
```

4. Veredicto: **COINCIDEN los cinco casos** al bit (el cuarto, comparado con los decimales del encargo: alto y bajo idénticos en la impresión de 17 cifras).

5. No aplica (no hay rojo).

6. Ambigüedades de esta iteración: **#11** (criterio de corte de la serie de C7: se incluye en la suma el término que cumple «≤ 2⁻⁵³·suma»). Copia en `notas/ambiguedades.md`.

7. Comparación con la tabla del expediente: no hay tabla de máximos para las primitivas; los cinco valores del encargo son la única referencia.

8. Tiempo aproximado: 10 minutos.
