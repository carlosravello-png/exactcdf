// Pruebas propias de gamma (encargo, paso 5) y de lgamma/gamma1pm1 en bordes: fuera de los fixtures.
import { gamma, lgamma, _gamma1pm1 } from "../src/stats.js";
import { GAMMA_A_ESTRELLA, GAMMA_A_LOW } from "../src/constantes.js";
import { aHex, parseHex } from "../harness/hexfloat.js";

let ok = true;
function check(nombre, cond, detalle) {
  ok &&= cond;
  console.log(`${cond ? "OK  " : "FALLA"} ${nombre} ${detalle ?? ""}`);
}
const siguiente = (x) => { const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x); dv.setBigUint64(0, dv.getBigUint64(0) + 1n); return dv.getFloat64(0); };
const anterior = (x) => { const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x); dv.setBigUint64(0, dv.getBigUint64(0) - 1n); return dv.getFloat64(0); };

// a = 40: el tramo (2.25, 40] incluye 40 → numero por la recurrencia. 39! = 20397882081197443358640281739902897356800000000
const g40 = gamma(40);
check("gamma(40) es un numero por la recurrencia", Number.isFinite(g40) && Math.abs(g40 / 2.0397882081197443e46 - 1) < 1e-14, `= ${g40}`);
// a = a*: +Infinity (P3). a = a_low: +Infinity (P3).
check("gamma(a*) = +Infinity", gamma(GAMMA_A_ESTRELLA) === Infinity, `a* = ${aHex(GAMMA_A_ESTRELLA)}`);
check("gamma(a_low) = +Infinity", gamma(GAMMA_A_LOW) === Infinity, `a_low = ${aHex(GAMMA_A_LOW)}`);
// a* − 1 ulp: 40 < a < a* → pendiente; a_low + 1 ulp: numero finito.
try {
  gamma(anterior(GAMMA_A_ESTRELLA));
  check("gamma(a* − 1 ulp) lanza pendiente", false);
} catch (e) {
  check("gamma(a* − 1 ulp) lanza pendiente", e instanceof RangeError && e.name === "StatsError" && e.motivo === "pendiente" && e.argumento === "a" && e.funcion === "gamma" && e.region === "gamma_fuera", `${e.message}`);
}
try {
  gamma(siguiente(40));
  check("gamma(40 + 1 ulp) lanza pendiente", false);
} catch (e) {
  check("gamma(40 + 1 ulp) lanza pendiente", e.motivo === "pendiente");
}
const gl = gamma(siguiente(GAMMA_A_LOW));
check("gamma(a_low + 1 ulp) es finito", Number.isFinite(gl) && gl > 1.79e308, `= ${gl}`);
// a ≤ 0, −0, NaN → dominio (lgamma y gamma)
for (const f of [gamma, lgamma]) {
  for (const a of [0, -0, -1, NaN, -Infinity, Infinity]) {
    try {
      f(a);
      check(`${f.name}(${Object.is(a, -0) ? "-0" : a}) lanza dominio`, false);
    } catch (e) {
      check(`${f.name}(${Object.is(a, -0) ? "-0" : a}) lanza dominio`, e.name === "StatsError" && e.motivo === "dominio" && e.argumento === "a" && e.funcion === f.name && Object.is(e.valor, a));
    }
  }
}
check("gamma1pm1(0) = 0", _gamma1pm1(0) === 0);
check("gamma1pm1(1) = 0", _gamma1pm1(1) === 0);
check("gamma1pm1(0.5) ~ 0.128379167095513", Math.abs(_gamma1pm1(0.5) - 0.12837916709551256) < 1e-15, `= ${_gamma1pm1(0.5)}`);
check("lgamma(1) = 0 y lgamma(2) = 0", lgamma(1) === 0 && lgamma(2) === 0);
check("lgamma(a subnormal minimo) finito", Number.isFinite(lgamma(parseHex("0x0.0000000000001p-1022"))));
console.log(ok ? "VERDE: pruebas propias de gamma/lgamma/gamma1pm1" : "ROJO: pruebas propias de gamma/lgamma/gamma1pm1");
