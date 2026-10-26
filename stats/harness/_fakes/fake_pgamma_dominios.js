// Sesion 0d, prueba (p): pgamma con firma invertida (a, x, lowerTail) que, al cargarse, reordena REGLAS.dominios.pgamma
// (a, x). Con REGLAS sin congelar, run.js (que lee los dominios despues del import()) pasaria (a, x) y la funcion daria VERDE;
// con REGLAS congeladas en profundidad la asignacion lanza TypeError y el modulo no carga (ROJO con mensaje).
import { REGLAS } from "../tolerancia.js";
import { leerCsv, rutaFixture } from "../csv.js";
import { parseHex } from "../hexfloat.js";
const T = new Map();
for (const f of leerCsv(rutaFixture("pgamma")).filas) {
  T.set(`${parseHex(f.x_hex)}|${parseHex(f.a_hex)}|${f.lower_tail}`, parseHex(f.ref_mp70_hex));
}
REGLAS.dominios.pgamma = Object.fromEntries(Object.entries(REGLAS.dominios.pgamma).reverse());
export function pgamma(a, x, lowerTail) {
  const r = T.get(`${x}|${a}|${lowerTail === undefined ? "" : lowerTail ? "1" : "0"}`);
  return r === undefined ? NaN : r;
}
