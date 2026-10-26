// B2: ulps.js
import { ulp, ulps, nextafter } from "../ulps.js";
let fallos = 0;
const marca = (ok) => (ok ? "PASA" : (fallos++, "NO PASA"));
const s = (x) => (Object.is(x, -0) ? "-0" : String(x));

console.log("== B2.1 ulps(nextafter(r, +inf), r) === 1");
for (const r of [1, 0.1, 3.5, 1e300, 2 ** -1000, 2 ** -1022, 2 ** -1074, 0, -7.25]) {
  const n = nextafter(r, Infinity);
  const u = ulps(n, r);
  console.log(`  r=${s(r).padEnd(24)} nextafter=${s(n).padEnd(24)} ulp(r)=${s(ulp(r)).padEnd(24)} ulps=${u}  ${marca(u === 1 && n > r)}`);
}
console.log("\n== B2.2 ulps(r, r) === 0");
for (const r of [1, 0.1, -7.25, 0, 2 ** -1074, 1e300]) console.log(`  r=${s(r)}  ulps=${ulps(r, r)}  ${marca(ulps(r, r) === 0)}`);

console.log("\n== B2.3 cruce de binada (la medida usa el ulp de la referencia)");
{
  const x = nextafter(2, -Infinity); // 2 - 2^-52, ulp(x)=2^-52; ulp(2)=2^-51
  console.log(`  ulps(nextafter(2,-inf), 2) = ${ulps(x, 2)}  (esperado 0.5 = 2^-52 / 2^-51)  ${marca(ulps(x, 2) === 0.5)}`);
  console.log(`  ulps(2, nextafter(2,-inf)) = ${ulps(2, x)}  (esperado 1 = 2^-52 / ulp(2-2^-52)=2^-52)  ${marca(ulps(2, x) === 1)}`);
  const y = nextafter(2 ** -1022, -Infinity); // mayor subnormal; ulp(2^-1022)=2^-1074
  console.log(`  ulps(mayor subnormal, 2^-1022) = ${ulps(y, 2 ** -1022)}  ${marca(ulps(y, 2 ** -1022) === 1)}`);
}

console.log("\n== B2.4 no finitos");
console.log(`  ulps(Infinity, 1) = ${ulps(Infinity, 1)}  ${marca(ulps(Infinity, 1) === Infinity)}`);
console.log(`  ulps(NaN, 1) = ${ulps(NaN, 1)}  ${marca(ulps(NaN, 1) === Infinity)}`);
console.log(`  ulps(-Infinity, 1) = ${ulps(-Infinity, 1)}  ${marca(ulps(-Infinity, 1) === Infinity)}`);
console.log(`  ulps(Infinity, Infinity) = ${ulps(Infinity, Infinity)}  ${marca(ulps(Infinity, Infinity) === 0)}`);

console.log("\n== B2.5 ulp(ref) por casos (potencias de 2: 2^(e-52); cero y subnormales 2^-1074)");
const tabla = [[1, 2 ** -52], [1.5, 2 ** -52], [2, 2 ** -51], [0.5, 2 ** -53], [0, 2 ** -1074], [2 ** -1074, 2 ** -1074],
  [2 ** -1022, 2 ** -1074], [Number.MAX_VALUE, 2 ** 971], [-7.25, 2 ** -50]];
for (const [r, esp] of tabla) console.log(`  ulp(${s(r)}) = ${s(ulp(r))}  ${marca(ulp(r) === esp)}`);

console.log("\n== B2.6 nextafter hacia abajo y por el cero");
console.log(`  nextafter(2^-1074, -inf) = ${s(nextafter(2 ** -1074, -Infinity))}  ${marca(Object.is(nextafter(2 ** -1074, -Infinity), 0))}`);
console.log(`  nextafter(0, -inf) = ${s(nextafter(0, -Infinity))}  ${marca(nextafter(0, -Infinity) === -(2 ** -1074))}`);
console.log(`  nextafter(-7.25, +inf) hacia cero; ulps = ${ulps(nextafter(-7.25, Infinity), -7.25)}  ${marca(nextafter(-7.25, Infinity) > -7.25)}`);
console.log(`  nextafter(MAX_VALUE, +inf) = ${s(nextafter(Number.MAX_VALUE, Infinity))}  ${marca(nextafter(Number.MAX_VALUE, Infinity) === Infinity)}`);
console.log(`\nRESULTADO B2: ${fallos === 0 ? "PASA" : "NO PASA (" + fallos + ")"}`);
process.exit(fallos ? 1 : 0);
