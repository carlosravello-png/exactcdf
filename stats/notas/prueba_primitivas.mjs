// Prueba de primitivas.js contra los cinco casos del encargo (valores medidos por el supervisor el 23/10).
// Uso: node stats/notas/prueba_primitivas.mjs   (script de prueba, fuera de src/; importa el arnes solo para aHex/parseHex)
import { two_sum, two_prod, ln_dd, ln1m_dd } from "../src/primitivas.js";
import { aHex, parseHex } from "../harness/hexfloat.js";

const casos = [];
function caso(nombre, obtenido, alto, bajo) {
  const ok = Object.is(obtenido[0], alto) && (bajo === null ? true : Object.is(obtenido[1], bajo));
  casos.push(ok);
  console.log(`${ok ? "OK  " : "DIFIERE"} ${nombre}`);
  console.log(`   alto  = ${aHex(obtenido[0])}  (${obtenido[0]})  esperado ${aHex(alto)}`);
  console.log(`   bajo  = ${aHex(obtenido[1])}  (${obtenido[1]})  esperado ${bajo === null ? "(ver nota)" : aHex(bajo)}`);
}

caso("two_sum(1, 2^-53)", two_sum(1, 2 ** -53), 1, 2 ** -53);
caso(
  "two_prod(1 + 2^-52, 1 + 2^-52)",
  two_prod(1 + 2 ** -52, 1 + 2 ** -52),
  parseHex("0x1.0000000000002p+0"),
  parseHex("0x1p-104"),
);
caso("ln_dd(2)", ln_dd(2), parseHex("0x1.62e42fefa39efp-1"), parseHex("0x1.abc9e3bp-56"));
console.log("   alto === Math.LN2:", ln_dd(2)[0] === Math.LN2);
// ln_dd(2^-1074): el encargo da decimales (-744.4400719213812, -4.42244434030227e-14)
const r = ln_dd(2 ** -1074);
console.log("ln_dd(2^-1074):", r[0], r[1], aHex(r[0]), aHex(r[1]));
casos.push(r[0] === -744.4400719213812);
console.log(`   alto igual a -744.4400719213812: ${r[0] === -744.4400719213812}; bajo esperado -4.42244434030227e-14, obtenido ${r[1]}`);
caso("ln1m_dd(2^-54)", ln1m_dd(2 ** -54), -(2 ** -54), -(2 ** -109));
console.log(casos.every(Boolean) ? "TODOS COINCIDEN" : "HAY DIFERENCIAS");
