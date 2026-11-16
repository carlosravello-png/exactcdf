// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

// `npm test`: the same check the CI runs.
// 1. Runs the frozen harness on every implemented function; fails unless
//    each run exits 0, prints VERDE, and prints no ROJO.
// 2. Checks that index.js exports exactly the promised public API.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const FUNCTIONS = ["erf", "erfc", "pnorm", "lgamma", "gamma", "gamma1pm1", "pgamma", "pchisq", "pbeta"];
let fail = 0;

for (const f of FUNCTIONS) {
  console.log(`=== ${f} ===`);
  const r = spawnSync(process.execPath, ["stats/harness/run.js", "--funcion", f], { cwd: root, encoding: "utf8" });
  const out = (r.stdout ?? "") + (r.stderr ?? "");
  console.log(out.trimEnd());
  if (r.status !== 0) { console.log(`FAIL: ${f} (exit ${r.status})`); fail = 1; }
  if (!/\bVERDE\b/.test(out)) { console.log(`FAIL: ${f} (no VERDE)`); fail = 1; }
  if (/\bROJO\b/.test(out)) { console.log(`FAIL: ${f} (ROJO)`); fail = 1; }
}

console.log("=== public API (index.js) ===");
const api = await import("./index.js");
const expected = ["StatsError", "erf", "erfc", "gamma", "lgamma", "pbeta", "pchisq", "pgamma", "pnorm"];
const actual = Object.keys(api).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  console.log(`FAIL: index.js exports [${actual.join(", ")}], expected [${expected.join(", ")}]`);
  fail = 1;
} else if (!(api.StatsError.prototype instanceof RangeError)) {
  console.log("FAIL: StatsError does not extend RangeError");
  fail = 1;
} else {
  console.log(`exports: ${actual.join(", ")}`);
}

if (fail) process.exit(1);
console.log("All implemented functions VERDE; public API as documented.");
