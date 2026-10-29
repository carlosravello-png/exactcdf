// pchisq(x, nu, lowerTail) = pgamma(x/2, nu/2, lowerTail) — C26: las divisiones en double (exactas salvo en la zona subnormal).
// La validación y los errores son de pchisq: argumento `nu`, valor nu (no nu/2), funcion "pchisq".
import { StatsError, validar, validarLowerTail } from "./error.js";
import { _pgamma, _pgammaIndet } from "./pgamma.js";

export function pchisq(x, nu, lowerTail) {
  validar("pchisq", "x", x);
  validar("pchisq", "nu", nu);
  const lt = validarLowerTail("pchisq", lowerTail);
  const xx = x / 2;
  const a = nu / 2;
  if (_pgammaIndet(xx, a)) {
    throw new StatsError({ funcion: "pchisq", motivo: "indeterminado", argumento: "nu", valor: nu, region: "pgamma_indet" });
  }
  return _pgamma(xx, a, lt);
}
