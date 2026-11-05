# exactcdf

Exact statistical distribution functions and the special functions behind them, in double precision, for JavaScript (Node and the browser).

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23811083.svg)](https://doi.org/10.5281/zenodo.23811083)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

`exactcdf` computes cumulative distribution functions — the normal, gamma, chi-squared and beta CDFs — and the special functions they rest on (error and gamma functions), accurate to within a few units in the last place (ulps) of the correctly rounded `double`. Every result is validated row by row against arbitrary-precision references (mpmath, 70 digits). The library has **no dependencies**, behaves consistently across Node, Firefox, Chrome and Cloudflare Workers, and **never returns `NaN`**: invalid input throws a structured error.

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
import { pnorm, pchisq } from "./stats/src/stats.js";

pnorm(1.96);         // 0.9750021048517796
pnorm(1.96, false);  // upper tail
pchisq(7.81, 3);     // chi-squared CDF, 3 degrees of freedom
```

ES module (`"type": "module"`), no build step, no dependencies.

## Accuracy and testing

Each function is checked against mpmath (70-digit) references with a frozen test harness that enforces per-region ulp tolerances. The current build passes on every tested region in Node, Firefox, Chrome and Cloudflare's `workerd`. The reference fixtures and the harness reports live in `tests/` and `stats/informes/`.

Run the harness yourself, one function at a time:

```sh
node stats/harness/run.js --funcion pnorm
# functions: erf · erfc · pnorm · lgamma · gamma · gamma1pm1 · pgamma · pchisq · pbeta
```

## Error handling

Public functions never return `NaN` for input of the right type. An out-of-domain or wrong-type argument throws a `StatsError` (which extends `RangeError`) carrying structured fields — `funcion`, `motivo`, `argumento`, `valor`, and the declared domain — so a caller can build its own message in any language.

## Not yet implemented

The inverse functions (`qnorm`, `qgamma`, `qchisq`, `qt`) and `pt` are specified but not yet released. Version 1 ships the forward CDFs and special functions listed above.

## Development and provenance

The implementation was developed with AI assistance under the author's direction and verification. The author made the design decisions, transcribed the source algorithms (DiDonato & Morris; Cody) from the primary literature, resolved the numerical ambiguities the texts leave open, and signed off on each result after checking it against arbitrary-precision references. A signed development record and the frozen test harness accompany the code, and a citable snapshot is archived with a DOI (below). A full AI-usage disclosure accompanies the associated paper.

## Citation

If you use `exactcdf` in research, please cite the archived version:

> Ravello, C. (2026). *exactcdf* (v1.0.0). Zenodo. https://doi.org/10.5281/zenodo.23811083

## License

[Mozilla Public License 2.0](LICENSE) (MPL-2.0). You may use `exactcdf` inside closed or proprietary software; changes to `exactcdf`'s own source files must remain open under the same license.

---

Author: **Carlos Ravello** · ORCID [0009-0007-5631-7436](https://orcid.org/0009-0007-5631-7436)
