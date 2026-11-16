# exactcdf

Designed and maintained by **Carlos E. Ravello Joo** · ORCID [0009-0007-5631-7436](https://orcid.org/0009-0007-5631-7436)

Statistical distribution functions and the special functions behind them, in double precision, for JavaScript (Node.js).

[![harness](https://github.com/carlosravello-png/exactcdf/actions/workflows/harness.yml/badge.svg)](https://github.com/carlosravello-png/exactcdf/actions/workflows/harness.yml)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

`exactcdf` computes cumulative distribution functions — the normal, gamma, chi-squared and beta CDFs — and the special functions they rest on (error and gamma functions). Every result is checked row by row against arbitrary-precision references (mpmath, 70 digits) under per-region tolerances fixed before the code was written. The library has **no dependencies** and **never returns `NaN`**: invalid input throws a structured error.

## Installation

```sh
npm install github:carlosravello-png/exactcdf
```

Requires Node.js 18 or later. ES module only (`"type": "module"`), no build step.

## Functions

| function | signature | returns |
|---|---|---|
| `erf`    | `erf(x)`                 | error function |
| `erfc`   | `erfc(x)`                | complementary error function |
| `pnorm`  | `pnorm(z, lowerTail?)`   | standard normal CDF, Φ(z) |
| `lgamma` | `lgamma(a)`              | log-gamma, ln Γ(a) |
| `gamma`  | `gamma(a)`               | gamma function, Γ(a) |
| `pgamma` | `pgamma(x, a, lowerTail?)`  | regularized lower incomplete gamma, P(a, x) |
| `pchisq` | `pchisq(x, nu, lowerTail?)` | chi-squared CDF with `nu` degrees of freedom |
| `pbeta`  | `pbeta(x, a, b, lowerTail?)` | regularized incomplete beta, Iₓ(a, b) |

`lowerTail` defaults to `true`; pass `false` for the upper tail.

## Usage

```js
import { pnorm, pchisq, pbeta } from "exactcdf";

pnorm(1.96);         // 0.9750021048517796
pnorm(1.96, false);  // 0.024997895148220428
pchisq(7.81, 3);     // 0.949893943649994
pbeta(0.3, 2, 5);    // 0.579825
```

## Error handling

Public functions never return `NaN`. An out-of-domain or wrong-type argument throws a `StatsError`, which extends `RangeError` and carries structured fields — `funcion`, `motivo` (`dominio`, `tipo`, `indeterminado`, `pendiente`), `argumento`, `valor`, `dominio` and `region` — so a caller can build its own message in any language.

```js
import { gamma, StatsError } from "exactcdf";

try {
  gamma(-1);
} catch (e) {
  e instanceof StatsError;  // true
  e instanceof RangeError;  // true
  e.motivo;                 // "dominio"
  e.argumento;              // "a"
  e.valor;                  // -1
}
```

## Accuracy and testing

Each function is split into regions that follow the algorithm's own branches, and each region has a tolerance recorded in [`stats/harness/tolerancias.json`](stats/harness/tolerancias.json), committed before the implementation (see the git history):

- relative error ≤ 1e-15 for `erf`, `erfc`, `pnorm`; ≤ 1e-14 for `lgamma`, `gamma` (with an absolute floor in one `lgamma` region and a piecewise rule for `gamma` outside its main range); ≤ 1e-13 for `pgamma`, `pchisq`, `pbeta` (the error bounds stated by the source algorithms);
- the hardest tail regions — `pgamma`/`pchisq` in the Temme and far-tail branches, `pbeta` in the continued-fraction and asymptotic branches — use ulp tolerances (788 to 3,864 ulps) set provisionally at twice the 99th-percentile error of R on the same rows. These are marked provisional in the tolerance file and will be fixed in a later release;
- exact values and subnormal results follow fixed rules (exact, or within 2 ulps of a subnormal).

The current release passes all 31,307 reference rows across the nine harnessed functions (the eight public ones plus the internal helper `gamma1pm1`), with no failures. Worst measured error per function:

| function | rows | worst case (ulps) | region |
|---|---:|---:|---|
| `erf`    | 1,575 | 4   | `erf_r2` |
| `erfc`   | 3,448 | 6   | `erfc_r3` |
| `pnorm`  | 4,870 | 6   | `pnorm_cola` |
| `lgamma` | 1,542 | 13  | `lgamma_d` |
| `gamma`  | 1,018 | 6   | `gamma_fuera` |
| `pgamma` | 7,902 | 917 | `pgamma_temme` (74% of its tolerance) |
| `pchisq` | 2,170 | 917 | `pgamma_temme` (74% of its tolerance) |
| `pbeta`  | 8,266 | 121 | `pbeta_bfrac20` |

Run the full check — the same command the CI runs on Node 18, 20 and 22:

```sh
npm test
```

or one function at a time, with its per-region report:

```sh
node stats/harness/run.js --funcion pgamma
# functions: erf · erfc · pnorm · lgamma · gamma · gamma1pm1 · pgamma · pchisq · pbeta
```

The reference fixtures live in [`tests/fixtures/`](tests/fixtures/), their generators in [`tests/gen/`](tests/gen/), and the development reports in [`stats/informes/`](stats/informes/).

## Platform

Tested on Node.js 18, 20 and 22. As shipped, the package reads its rules file with `node:fs`, so it runs on Node.js only; a browser build is not part of this release.

## Not yet implemented

The inverse functions (`qnorm`, `qgamma`, `qchisq`, `qt`) and `pt` have reference fixtures in `tests/fixtures/` but no implementation yet. This release ships the forward CDFs and special functions listed above. See [CHANGELOG.md](CHANGELOG.md).

## Development and provenance

The code was implemented by AI models (Anthropic Claude) from a written specification derived from the primary literature (Cody 1969; DiDonato & Morris 1986, 1992). The author directed the project, made every design and scope decision, arbitrated the numerical ambiguities the texts leave open, and signed off each release after verification against arbitrary-precision references by a frozen, independently audited test harness. Development reports (stats/informes) accompany the code; a full AI-usage disclosure will accompany the associated paper.

## Contributing

Bug reports, questions and contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Citation

If you use `exactcdf` in research, please cite the software:

> Ravello Joo, C. E. (2026). *exactcdf* (Version 1.0.0) [Computer software]. https://github.com/carlosravello-png/exactcdf

The development dossier (code, fixtures and audits at the close of development) is archived separately: Ravello Joo, C. E. (2026). *Direct stats.js and its dossier: high-precision statistical functions in JavaScript, with fixtures and audits* (Version 1.0.0). Zenodo. https://doi.org/10.5281/zenodo.23811083

## License

[Mozilla Public License 2.0](LICENSE) (MPL-2.0). You may use `exactcdf` inside closed or proprietary software; changes to `exactcdf`'s own source files must remain open under the same license.

---

Author: **Carlos Ravello** · ORCID [0009-0007-5631-7436](https://orcid.org/0009-0007-5631-7436)
