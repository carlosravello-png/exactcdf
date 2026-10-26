// Medida unica del arnes (reglas.json › medida): ulps(x, ref) = |x - ref| / ulp(ref).
// Todo por bits (Float64Array / BigUint64Array), sin aritmetica decimal.

const F = new Float64Array(1);
const U = new BigUint64Array(F.buffer);

const MIN_SUBNORMAL = Number.MIN_VALUE; // 2^-1074

function bits(x) { F[0] = x; return U[0]; }
function desdeBits(b) { U[0] = b; return F[0]; }

// ulp(ref): para 2^e <= |ref| < 2^(e+1), 2^(e-52); en 0 y subnormales, 2^-1074.
export function ulp(ref) {
  if (Number.isNaN(ref)) return NaN;
  if (!Number.isFinite(ref)) return Infinity;
  const e = Number((bits(ref) >> 52n) & 0x7ffn); // campo de exponente; 0 = cero o subnormal
  return e === 0 ? MIN_SUBNORMAL : 2 ** (e - 1075);
}

export function ulps(x, ref) {
  if (typeof x !== "number" || Number.isNaN(x) || Number.isNaN(ref)) return Infinity;
  if (x === ref) return 0;
  if (!Number.isFinite(x) || !Number.isFinite(ref)) return Infinity;
  return Math.abs(x - ref) / ulp(ref);
}

// Siguiente double desde x hacia `hacia` (+-Infinity o cualquier numero).
export function nextafter(x, hacia) {
  if (Number.isNaN(x) || Number.isNaN(hacia)) return NaN;
  if (x === hacia) return hacia;
  if (x === 0) return hacia > 0 ? MIN_SUBNORMAL : -MIN_SUBNORMAL;
  const b = bits(x);
  const crece = (hacia > x) === (x > 0); // hacia mayor magnitud?
  return desdeBits(crece ? b + 1n : b - 1n);
}
