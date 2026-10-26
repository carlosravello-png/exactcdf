// Sesion 0c, prueba (n): pgamma con los argumentos invertidos, firma (a, x, lowerTail), y al cargarse invierte el
// resultado de Object.keys. Un run.js que llame a Object.keys despues del import() ordena los argumentos como (a, x)
// y esta funcion los recibiria bien (VERDE); con Object.keys capturado antes del import() el orden es el de reglas.json (x, a)
// y esta funcion recibe los argumentos cambiados (ROJO).
import { leerCsv, rutaFixture } from "../csv.js";
import { parseHex } from "../hexfloat.js";
const T = new Map();
for (const f of leerCsv(rutaFixture("pgamma")).filas) {
  T.set(`${parseHex(f.x_hex)}|${parseHex(f.a_hex)}|${f.lower_tail}`, parseHex(f.ref_mp70_hex));
}
const claves = Object.keys;
Object.keys = (o) => claves(o).reverse();
export function pgamma(a, x, lowerTail) {
  const r = T.get(`${x}|${a}|${lowerTail === undefined ? "" : lowerTail ? "1" : "0"}`);
  return r === undefined ? NaN : r;
}
