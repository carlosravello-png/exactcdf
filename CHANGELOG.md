# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Zenodo DOIs: concept DOI 10.5281/zenodo.24474289 (all versions) and 10.5281/zenodo.24474290 (v1.0.3), with a DOI badge in the README and both DOIs in `CITATION.cff`.

## [1.0.3] - 2026-11-23

### Changed

- `package.json`: `homepage` now points to the project page, https://carlosravello.com/exactcdf-en.html.
- Software citation (README, `CITATION.cff`) updated to this version. First release archived in Zenodo through the GitHub integration.

## [1.0.2] - 2026-11-17

### Changed

- Author name unified as Carlos Eduardo Ravello Joo (README, `package.json`); citation form Ravello Joo, C. E.
- README: install with `npm install exactcdf`; software citation points to this version; dossier citation uses the deposit's main title with its English translation.
- README and CONTRIBUTING: the development and AI-usage statement now matches the Zenodo deposit word for word (who wrote the code, harness and generators; that reference values come from R and mpmath; that audits were separate AI sessions).

### Added

- `CITATION.cff`.

## [1.0.1] - 2026-11-16

### Changed

- README: author line under the title.

## [1.0.0] - 2026-11-16

First packaged release.

### Added

- Eight public functions: `erf`, `erfc`, `pnorm`, `lgamma`, `gamma`, `pgamma`, `pchisq`, `pbeta`. The CDFs take an optional `lowerTail` argument (default `true`).
- `StatsError` (extends `RangeError`), thrown for out-of-domain or wrong-type input with structured fields (`funcion`, `motivo`, `argumento`, `valor`, `dominio`, `region`). No function returns `NaN`.
- Frozen test harness with per-region tolerances, run against 31,307 arbitrary-precision reference rows (mpmath, 70 digits) across nine functions (the eight public ones plus the internal helper `gamma1pm1`); all pass.
- Packaging: root `index.js` exporting the public API, `package.json` (`exactcdf`, ES module, Node.js ≥ 18), `npm test`.
- Continuous integration running `npm test` on Node.js 18, 20 and 22.
- `CONTRIBUTING.md`, `CHANGELOG.md`, `.gitattributes`.

### Not included in this release

- Inverse functions `qnorm`, `qgamma`, `qchisq`, `qt`, and the Student t CDF `pt`. Their reference fixtures are in `tests/fixtures/`; there is no implementation yet.

### Known limitations

- Node.js only as shipped: the package reads `stats/harness/reglas.json` through `node:fs`. A browser build is not part of this release.
- Ulp tolerances for the hardest tail regions (`pgamma_temme`, `pgamma_lejos`, `pbeta_bfrac20`, `pbeta_basym_*`) are provisional (twice the 99th-percentile error of R) and marked as such in `stats/harness/tolerancias.json`.
- `_gamma1pm1` is internal and not exported from the package entry point.

[1.0.3]: https://github.com/carlosravello-png/exactcdf/releases/tag/v1.0.3
[1.0.2]: https://github.com/carlosravello-png/exactcdf/releases/tag/v1.0.2
[1.0.1]: https://github.com/carlosravello-png/exactcdf/releases/tag/v1.0.1
[1.0.0]: https://github.com/carlosravello-png/exactcdf/releases/tag/v1.0.0
