// Parser de hex-float de los fixtures: +-0x1.<hex>p+-n, subnormales 0x0.<hex>p-1022,
// 0x0.0p+0, -0x0.0p+0, inf, -inf, nan (sin distinguir mayusculas: ref_r_hex trae "Inf").
// Exacto: la mantisa se lee como BigInt y el valor se arma con potencias de 2.

const RE = /^([+-]?)0x([0-9a-f]+)(?:\.([0-9a-f]*))?p([+-]?\d+)$/i;

// m * 2^e, con m entero que cabe en 53 bits; se escala en pasos para no pasar por 2^e fuera de rango.
function ldexp(m, e) {
  let r = m;
  while (e > 1000) { r *= 2 ** 1000; e -= 1000; }
  while (e < -1000) { r *= 2 ** -1000; e += 1000; }
  return r * 2 ** e;
}

export function parseHex(texto) {
  const s = String(texto).trim();
  const bajo = s.toLowerCase();
  if (bajo === "inf" || bajo === "+inf" || bajo === "infinity" || bajo === "+infinity") return Infinity;
  if (bajo === "-inf" || bajo === "-infinity") return -Infinity;
  if (bajo === "nan" || bajo === "+nan" || bajo === "-nan") return NaN;
  const m = RE.exec(s);
  if (m === null) throw new Error(`hex-float ilegible: '${texto}'`);
  const signo = m[1] === "-" ? -1 : 1;
  const frac = m[3] ?? "";
  let mant = BigInt("0x" + m[2] + frac);
  let exp = Number(m[4]) - 4 * frac.length;
  if (mant === 0n) return signo < 0 ? -0 : 0;
  while ((mant & 1n) === 0n) { mant >>= 1n; exp += 1; } // quita ceros finales: la mantisa minima
  if (mant >= 1n << 53n) throw new Error(`hex-float con mas de 53 bits significativos: '${texto}'`);
  const valor = ldexp(Number(mant), exp);
  return signo * valor;
}

// Inverso, para mensajes: double -> hex-float al estilo de los fixtures (sin relleno).
export function aHex(x) {
  if (Number.isNaN(x)) return "nan";
  if (x === Infinity) return "inf";
  if (x === -Infinity) return "-inf";
  const f = new Float64Array([x]);
  const b = new BigUint64Array(f.buffer)[0];
  const signo = b >> 63n ? "-" : "";
  const e = Number((b >> 52n) & 0x7ffn);
  const frac = (b & ((1n << 52n) - 1n)).toString(16).padStart(13, "0");
  return e === 0 ? `${signo}0x0.${frac}p-1022` : `${signo}0x1.${frac}p${e - 1023 >= 0 ? "+" : ""}${e - 1023}`;
}
