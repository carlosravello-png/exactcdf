# Contributing to exactcdf

Thank you for your interest. This is a small project with one maintainer, so the rules below exist to keep every published number traceable.

## Reporting a bug

Open an issue at <https://github.com/carlosravello-png/exactcdf/issues> with:

- the function and the exact arguments (copy them as written, e.g. `pgamma(30.5, 31, false)`);
- the result you got and the result you expected, with its source (R, mpmath, a table…);
- your Node.js version (`node --version`) and operating system.

A wrong value is the most useful report this project can receive. If you can, include the reference value to at least 17 significant digits.

## Getting help

Questions about usage go in an issue too — label it `question`. There is no mailing list or chat.

## Running the tests

```sh
npm test
```

This runs the frozen harness on every implemented function (against `tests/fixtures/`) and checks the public API exported by `index.js`. It is exactly what the CI runs on Node 18, 20 and 22. Every function must print `VERDE`; any `ROJO` is a failure.

## Contributing changes

Pull requests are welcome for documentation, packaging, examples and tooling at the repository root.

The following are **frozen**:

- `stats/src/` — the implementation;
- `stats/harness/` — the test harness and its tolerances;
- `tests/fixtures/` — the reference values.

Their SHA-256 hashes are recorded in the archived deposit, and every published accuracy figure depends on them. Changes there do not go in as ordinary pull requests: they go through the project's dossier process — a written proposal, a development report in `stats/informes/`, an independent audit of the change, and the author's sign-off — and then into a new release. If you have found a numerical problem or want to propose a change to these files, open an issue first and describe it; the maintainer will take it through that process.

## License

By contributing you agree that your contribution is licensed under the [Mozilla Public License 2.0](LICENSE), the license of this project.
