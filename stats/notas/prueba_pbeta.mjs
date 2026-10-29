// Pruebas propias de pbeta fuera de los fixtures: bordes validos x = 0 y x = 1 en las dos colas (C38),
// barrido de extremos (ninguna combinacion valida devuelve NaN, lanza, ni sale de [0, 1]) y consistencia P + Q ~ 1.
import { pbeta } from "../src/stats.js";

let ok = true;
let fallas = 0;
function falla(nombre, detalle) {
  ok = false;
  fallas++;
  if (fallas <= 40) console.log(`FALLA ${nombre} ${detalle ?? ""}`);
}

// bordes
for (const [a, b] of [[0.5, 0.5], [2, 3], [100, 200], [1e-5, 1e5]]) {
  if (pbeta(0, a, b) !== 0 || pbeta(0, a, b, false) !== 1) falla(`pbeta(0, ${a}, ${b})`);
  if (pbeta(-0, a, b) !== 0 || pbeta(-0, a, b, false) !== 1) falla(`pbeta(-0, ${a}, ${b})`);
  if (pbeta(1, a, b) !== 1 || pbeta(1, a, b, false) !== 0) falla(`pbeta(1, ${a}, ${b})`);
}

const Ps = [1e-320, 1e-300, 1e-100, 1e-10, 1e-5, 0.01, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 0.97, 0.99999, 1 - 2 ** -53, 1 - 2 ** -52];
const Ds = [1e-300, 1e-100, 1e-5, 0.01, 0.1, 0.2, 0.5, 0.9999, 1, 1.0001, 1.5, 2, 7.9, 8, 10, 14.9, 15, 16, 39.9, 40, 41, 99, 100, 101, 1000, 1e4, 1e5];
let n = 0;
for (const a of Ds) {
  for (const b of Ds) {
    for (const x of Ps) {
      n++;
      let lo, up;
      try {
        lo = pbeta(x, a, b, true);
        up = pbeta(x, a, b, false);
      } catch (e) {
        falla(`pbeta(${x}, ${a}, ${b}) lanzo ${e.name}`, e.message);
        continue;
      }
      if (!(lo >= 0 && lo <= 1) || !(up >= 0 && up <= 1)) { falla(`pbeta(${x}, ${a}, ${b}) fuera de [0,1] o NaN`, `lo=${lo} up=${up}`); continue; }
      if (Math.abs(lo + up - 1) > 1e-11) falla(`pbeta(${x}, ${a}, ${b}) P+Q != 1`, `lo=${lo} up=${up}`);
    }
  }
}
console.log(ok ? `VERDE: pruebas propias de pbeta (${n} combinaciones, 2 colas)` : `ROJO: pruebas propias de pbeta (${fallas} fallas de ${n})`);
