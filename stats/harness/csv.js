// Lector de los CSV de tests/fixtures: ignora las lineas '#', devuelve filas como objetos
// (valores siempre como texto) y expone la cabecera '#' como texto. Admite campos entre comillas.
import { readFileSync, readdirSync } from "node:fs";

export const DIR_FIXTURES = new URL("../../tests/fixtures/", import.meta.url);

export function parseCsv(contenido) {
  const cabecera = [];
  const registros = [];
  let i = 0;
  const n = contenido.length;
  while (i < n) {
    // linea de comentario (solo al comienzo de un registro)
    if (contenido[i] === "#") {
      let j = contenido.indexOf("\n", i);
      if (j < 0) j = n;
      cabecera.push(contenido.slice(i, j).replace(/\r$/, ""));
      i = j + 1;
      continue;
    }
    if (contenido[i] === "\n" || (contenido[i] === "\r" && contenido[i + 1] === "\n")) {
      i += contenido[i] === "\r" ? 2 : 1; // linea vacia
      continue;
    }
    const campos = [];
    let campo = "";
    let enComillas = false;
    for (; i < n; i++) {
      const c = contenido[i];
      if (enComillas) {
        if (c === '"') {
          if (contenido[i + 1] === '"') { campo += '"'; i++; } else enComillas = false;
        } else campo += c;
      } else if (c === '"' && campo === "") enComillas = true;
      else if (c === ",") { campos.push(campo); campo = ""; }
      else if (c === "\n") { i++; break; }
      else if (c === "\r" && contenido[i + 1] === "\n") { i += 2; break; }
      else campo += c;
    }
    campos.push(campo);
    registros.push(campos);
  }
  const columnas = registros.length ? registros[0] : [];
  const filas = registros.slice(1).map((r) => {
    const o = {};
    columnas.forEach((col, k) => { o[col] = r[k] ?? ""; });
    return o;
  });
  return { cabecera: cabecera.join("\n"), columnas, filas };
}

export function leerCsv(ruta) {
  return parseCsv(readFileSync(ruta, "utf8"));
}

// Funcion -> ruta de su CSV.
export function rutaFixture(funcion) {
  return new URL(`${funcion}.csv`, DIR_FIXTURES);
}

// Los CSV de fixtures cuyo nombre no empieza por '_' (las carpetas _* no son archivos .csv).
export function listarFixtures() {
  return readdirSync(DIR_FIXTURES, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".csv") && !d.name.startsWith("_"))
    .map((d) => d.name.replace(/\.csv$/, ""))
    .sort();
}
