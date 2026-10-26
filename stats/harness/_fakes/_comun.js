// Ayudas de los modulos falsos: tabla argumento -> double de ref_mp70_hex leida del propio CSV.
import { leerCsv, rutaFixture } from "../csv.js";
import { parseHex } from "../hexfloat.js";

export function tablaRef(funcion, nombre) {
  const m = new Map();
  for (const f of leerCsv(rutaFixture(funcion)).filas) {
    const k = parseHex(f[nombre + "_hex"]);
    const r = parseHex(f.ref_mp70_hex);
    if (m.has(k) && !Object.is(m.get(k), r)) throw new Error(`${funcion}: ${nombre}=${k} con dos referencias distintas`);
    m.set(k, r);
  }
  return m;
}
