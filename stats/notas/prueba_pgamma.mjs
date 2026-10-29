// Pruebas propias de pgamma / pchisq fuera de los fixtures:
//  (1) pgamma_indet: una llamada en esa region lanza StatsError `indeterminado` con region `pgamma_indet`
//      (argumento `a` en pgamma, `nu` en pchisq, valor = el que recibio la funcion publica);
//  (2) barrido de extremos: ninguna combinacion valida devuelve NaN ni sale de [0, 1]; si lanza, es `indeterminado`;
//  (3) bordes validos x = 0 y x = -0.
import { pgamma, pchisq } from "../src/stats.js";

let ok = true;
function check(nombre, cond, detalle) {
  ok &&= cond;
  if (!cond || detalle === "!") console.log(`${cond ? "OK  " : "FALLA"} ${nombre} ${detalle === "!" ? "" : (detalle ?? "")}`);
}

// (1) pgamma_indet
for (const [f, args, arg, valor] of [
  [pgamma, [1e30, 1e30], "a", 1e30],
  [pgamma, [1e300, 1e300], "a", 1e300],
  [pchisq, [2e30, 2e30], "nu", 2e30],
  [pchisq, [2e300, 2e300], "nu", 2e300],
]) {
  for (const lt of [true, false, undefined]) {
    try {
      f(...args, lt);
      check(`${f.name}(${args}) lowerTail=${lt} lanza indeterminado`, false);
    } catch (e) {
      check(
        `${f.name}(${args}) lowerTail=${lt} lanza indeterminado`,
        e instanceof RangeError && e.name === "StatsError" && e.funcion === f.name && e.motivo === "indeterminado" && e.argumento === arg && e.region === "pgamma_indet" && Object.is(e.valor, valor),
        `${e.message}`,
      );
      if (lt === undefined && f === pgamma && args[0] === 1e30) console.log(`   ejemplo: ${e.message}`);
    }
  }
}
// justo por debajo del umbral aε² = 3.28e-3 (a = 2.66e29 · 2^-... ) no lanza
try {
  const r = pgamma(1e28, 1e28);
  check("pgamma(1e28, 1e28) (a·ε² < 3.28e-3) devuelve numero", Number.isFinite(r), `= ${r}`);
} catch (e) {
  check("pgamma(1e28, 1e28) devuelve numero", false, e.message);
}

// (2) barrido de extremos
const As = [5e-324, 1e-320, 1e-300, 1e-10, 0.001, 0.3, 0.5, 0.9999999, 1, 1.5, 2, 19.9, 20, 20.5, 100, 1e5, 1e10, 1e20, 1e28, 3e29, 1e100, 1e300, 1.79e308];
const Xs = [0, -0, 5e-324, 1e-320, 1e-308, 1e-300, 1e-100, 1e-10, 0.001, 0.25, 0.5, 1, 1.1, 5, 30, 31, 100, 700, 701, 1500, 1e4, 1e10, 1e100, 1e300, 1.79e308];
let n = 0;
for (const a of As) {
  for (const x of Xs) {
    for (const lt of [true, false]) {
      n++;
      let r;
      try {
        r = pgamma(x, a, lt);
      } catch (e) {
        if (e.motivo === "indeterminado") continue;
        check(`pgamma(${x}, ${a}, ${lt}) lanzo ${e.name}`, false, e.message);
        continue;
      }
      if (!(r >= 0 && r <= 1)) check(`pgamma(${x}, ${a}, ${lt}) fuera de [0, 1] o NaN`, false, `= ${r}`);
    }
  }
}
// pchisq: mismo barrido con nu = 2a (menor nu = 1e-323)
for (const nu of [1e-323, 1e-320, 1e-300, 0.001, 1, 2, 3, 39.8, 40, 41, 1e3, 1e5, 1e10, 1e30, 1e60, 1e300]) {
  for (const x of Xs) {
    for (const lt of [true, false]) {
      n++;
      let r;
      try {
        r = pchisq(x, nu, lt);
      } catch (e) {
        if (e.motivo === "indeterminado") continue;
        check(`pchisq(${x}, ${nu}, ${lt}) lanzo ${e.name}`, false, e.message);
        continue;
      }
      if (!(r >= 0 && r <= 1)) check(`pchisq(${x}, ${nu}, ${lt}) fuera de [0, 1] o NaN`, false, `= ${r}`);
    }
  }
}
// (3) bordes validos x = 0 y x = -0
for (const x of [0, -0]) {
  check(`pgamma(${Object.is(x, -0) ? "-0" : 0}, 2) = 0 y cola superior = 1`, pgamma(x, 2) === 0 && pgamma(x, 2, false) === 1);
  check(`pchisq(${Object.is(x, -0) ? "-0" : 0}, 3) = 0 y cola superior = 1`, pchisq(x, 3) === 0 && pchisq(x, 3, false) === 1);
}
console.log(ok ? `VERDE: pruebas propias de pgamma/pchisq (${n} combinaciones del barrido)` : "ROJO: pruebas propias de pgamma/pchisq");
