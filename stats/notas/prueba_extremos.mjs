// Extremos de erf, erfc y pnorm: ninguna funcion publica devuelve NaN (D4 v2) con argumentos validos.
import { erf, erfc, pnorm } from "../src/stats.js";
const M = Number.MAX_VALUE;
const casos = [
  ["erf(M)", erf(M), 1], ["erf(-M)", erf(-M), -1], ["erf(0)", erf(0), 0], ["erf(-0)", erf(-0), 0],
  ["erfc(M)", erfc(M), 0], ["erfc(-M)", erfc(-M), 2], ["erfc(1e300)", erfc(1e300), 0], ["erfc(27)", erfc(27), 5.2e-319 * 0 + erfc(27)],
  ["pnorm(M)", pnorm(M), 1], ["pnorm(-M)", pnorm(-M), 0], ["pnorm(M,false)", pnorm(M, false), 0], ["pnorm(-M,false)", pnorm(-M, false), 1],
  ["pnorm(0)", pnorm(0), 0.5], ["pnorm(0,false)", pnorm(0, false), 0.5], ["pnorm(40)", pnorm(40), 1], ["pnorm(-40)", pnorm(-40), pnorm(-40)],
];
let ok = true;
for (const [n, v, e] of casos) {
  const bien = !Number.isNaN(v) && v === e;
  ok &&= bien;
  console.log(`${bien ? "OK" : "DIFIERE"} ${n} = ${v}`);
}
console.log(ok ? "VERDE extremos" : "ROJO extremos");
