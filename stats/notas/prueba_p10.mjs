// Prueba corta del paquete 10 (sesión 1c): ningún NaN ni valor fuera de [0, 1] con parámetros de forma ≤ a_low,
// y los valores de control de pgamma, pchisq y lgamma. No juzga precisión: eso lo mide el supervisor con su barrido.
// Se corre con: node stats/notas/prueba_p10.mjs
import { pbeta, pgamma, pchisq, lgamma } from "../src/stats.js";

let fallos = 0;
function comprueba(ok, texto) {
  console.log((ok ? "ok    " : "FALLA ") + texto);
  if (!ok) fallos++;
}
const enRango = (v) => typeof v === "number" && !Number.isNaN(v) && v >= 0 && v <= 1;

const casos = [
  [5e-324, 5e-324, 5e-324],
  [0.2, 2 ** -1074, 2 ** -1074],
  [0.05, 2 ** -1050, 20],
  [1e-10, 2 ** -1024, 16],
  [0.99, 2, 2 ** -1024],
  [0.05, 2 ** -1074, 2 ** -1060],
];
for (const [x, a, b] of casos) {
  for (const lt of [true, false]) {
    const v = pbeta(x, a, b, lt);
    comprueba(enRango(v), `pbeta(${x}, ${a}, ${b}, ${lt}) = ${v}`);
  }
}

const q1 = pgamma(1.1, 2 ** -1024, false);
comprueba(q1 > 0, `pgamma(1.1, 2**-1024, false) = ${q1} > 0`);
const q2 = pchisq(2.2, 2 ** -1023, false);
comprueba(q2 > 0, `pchisq(2.2, 2**-1023, false) = ${q2} > 0`);
const l1 = lgamma(1);
comprueba(Object.is(l1, 0), `lgamma(1) = ${Object.is(l1, -0) ? "-0" : l1} es +0`);
const l2 = lgamma(2);
comprueba(Object.is(l2, 0), `lgamma(2) = ${Object.is(l2, -0) ? "-0" : l2} es +0`);
const q3 = pgamma(1.1, 2 ** -1023, false);
comprueba(q3 === 2.069217498016257e-309, `pgamma(1.1, 2**-1023, false) = ${q3} (esperado 2.069217498016257e-309, sesión 1)`);

console.log(fallos === 0 ? "\nTODO OK" : `\n${fallos} FALLO(S)`);
process.exit(fallos === 0 ? 0 : 1);
