#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ref_mpmath.py - Referencias de mpmath para los fixtures de stats.js (plan, §7, paso 3).

Dos pasos (propuesta de Cowork, para que K se fije mirando datos sin recalcular mpmath):

  python tests/gen/ref_mpmath.py calcular [--solo erf] [--procesos 6] [--limite N]
      Lee  tests/fixtures/_puntos/<f>.csv (argumentos en hexadecimal) y tests/fixtures/_ref_r/<f>.csv.
      Calcula las dos referencias de mpmath (§4.2, §4.4), las inversas (§4.5), los valores de fuente
      (§3.4), la tercera via en erf/erfc/gamma1pm1 (§5.2) y la distancia en ulps de R (§5.1).
      Escribe tests/fixtures/_mpmath/<f>.csv (intermedio, todas las columnas) e imprime su SHA-256.
      Los datos de la corrida (procesos, tiempo, fecha) van a tests/fixtures/_mpmath/_corrida_<f>.txt,
      NO a la cabecera del CSV: asi el CSV da el mismo SHA-256 con 1 o con N procesos (§7.1).

  python tests/gen/ref_mpmath.py distribucion
      Resume, por funcion y region, cifras_50_70 y la distancia en ulps entre R y mpmath. Sirve para
      fijar el umbral de cifras y K (§5) con el dato en mano. No escribe nada.

  python tests/gen/ref_mpmath.py cerrar --K <entero> [--umbral-cifras 25] [--procesos 6] [--limite N]
      Aplica K (r_discrepa), corre la tercera via en las filas con r_discrepa = 1 (§5.2), une las
      decisiones manuales (tests/fixtures/_decisiones_manuales.csv) y escribe los CSV FINALES en
      tests/fixtures/<f>.csv y tests/fixtures/_dificiles.csv. Si queda alguna fila con
      tercera_via = DISCREPA sin decision manual, no escribe los finales y lista esas filas.

  --limite N (calcular, distribucion, cerrar): prueba rapida con N filas por funcion repartidas a lo largo
      del archivo; todo se lee y escribe en tests/fixtures/_prueba/ (no canonico, fuera de git).

  python tests/gen/ref_mpmath.py huellas
      Ultimo paso de tests/gen/corrida.bat: escribe tests/fixtures/_mpmath/_corrida_completa.txt
      (fecha, entorno y SHA-256 de cada archivo) y lo imprime.

  python tests/gen/ref_mpmath.py motor [--n 200]
      Prueba de igualdad de motores (§7.1 b): calcula una muestra (incluye filas de dps alto) y la
      escribe en tests/fixtures/_motor/<motor>.csv; se corre una vez normal y otra con
      MPMATH_NOGMPY=1, y luego `motor --comparar`.

Formato canonico de numeros: hexadecimal exacto (expediente, Orden acordado, paso 3). Las referencias
de mpmath van en decimal de 30 cifras (mp.nstr), que mpmath escribe correctamente redondeado.

Versiones: v1 (13/10, sha256 f1946bb0...); v2 (13/10, e91c1f56...: cero exacto de gamma1pm1 con la
nota); v3 (13/10, cambios del revisor y de la prueba de humo: regla «cero nunca en silencio», columna
fuera_de_rango inf | cero | subnormal, double mas cercano correctamente redondeado, respaldos con fuente
DLMF y sin Lentz, umbral 2^-1075, proxy de dps en motor, tercera via en variable desplazada para erfc,
pnorm, pbeta, pt y gamma/lgamma; opcion --limite). Detalle en el plan de fixtures, añadido 10.
v4 (13/10, sin cambio en ningun numero): cabecera de los finales con «# R:» y «# semilla:» (§2 del plan);
la inversa anota «corchete + biseccion» cuando anderson falla (antes decia «corchete + anderson»).

Escrito por Cowork (Claude). La corrida canonica es la de Carlos. Requiere mpmath 1.3.0.
"""

import argparse
import csv
import hashlib
import io
import math
import multiprocessing as mproc
import os
import struct
import sys
import time

import mpmath
from mpmath import mp, mpf

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
FIX = os.path.join(RAIZ, "tests", "fixtures")
DIR_PUNTOS = os.path.join(FIX, "_puntos")
DIR_R = os.path.join(FIX, "_ref_r")
DIR_MP = os.path.join(FIX, "_mpmath")
DIR_MOTOR = os.path.join(FIX, "_motor")
DECISIONES = os.path.join(FIX, "_decisiones_manuales.csv")
# Salidas. Con --limite N (prueba rapida de Carlos) todo va a tests/fixtures/_prueba/, que no es canonico,
# no se commitea y nunca pisa _mpmath/ ni los finales. Ver main().
SALIDA_MP = DIR_MP
SALIDA_FIN = FIX
LIMITE = None


def limitar(filas):
    """--limite N: N filas repartidas a lo largo del archivo (una de cada len/N), no las N primeras,
    para que la prueba toque todas las regiones."""
    if not LIMITE or len(filas) <= LIMITE:
        return filas
    paso = len(filas) / LIMITE
    return [filas[int(i * paso)] for i in range(LIMITE)]

FUNCIONES = ["erf", "erfc", "pnorm", "qnorm", "pgamma", "qgamma", "pchisq", "qchisq",
             "pbeta", "pt", "qt", "lgamma", "gamma", "gamma1pm1"]
ARGUMENTOS = {
    "erf": ["x"], "erfc": ["x"], "pnorm": ["z"], "qnorm": ["p"],
    "pgamma": ["x", "a"], "qgamma": ["p", "a"], "pchisq": ["x", "nu"], "qchisq": ["p", "nu"],
    "pbeta": ["x", "a", "b"], "pt": ["t", "n"], "qt": ["p", "n"],
    "lgamma": ["a"], "gamma": ["a"], "gamma1pm1": ["a"],
}
INVERSAS = {"qnorm", "qgamma", "qchisq", "qt"}
SIN_R = {"erf", "erfc", "gamma1pm1"}                  # §4.3
TERCERA_SIEMPRE = {"erf", "erfc", "gamma1pm1"}        # §5.2: todas sus filas

DPS_BASE = 50          # §4.2
DPS_EXTRA = 20         # segunda referencia = dps_usado + 20
UMBRAL_ADAPT = 40      # §4.4 a: |ref| < 10^-(dps-40), es decir 1e-10 con dps 50
DPS_TOPE = 1000        # §4.4 b, respaldo
DPS_TOPE_ADAPT = 450   # §4.4 a con tope (propuesta de Cowork, 13/10): ver referencia_directa
CIFRAS_ESCRITAS = 30   # §1
CIFRAS_QUAD = 20       # §5.2: coincidencia exigida a la cuadratura
CIFRAS_PUBLICADO = 15  # Wichura imprime 16 cifras: se exige 15
CHUNK = 2              # §7.1 a: chunksize pequeño (1-4)
UMBRAL_INF = mpf(2) ** 1024 - mpf(2) ** 970   # regla 9 de tolerancias (solo se informa aqui)


# =====================================================================================
# 1. Funciones de referencia (mpmath), siempre en la cola pedida, nunca 1 - otra (§4.1)
# =====================================================================================

def cdf(f, args, lt, marcas=None):
    """CDF de la cola pedida (lt = 1 inferior, 0 superior), a la precision vigente."""
    if marcas is None:
        marcas = set()
    if f == "erf":
        return mp.erf(args["x"])
    if f == "erfc":
        return mp.erfc(args["x"])
    if f == "pnorm":
        z = args["z"]
        return mp.ncdf(z) if lt == 1 else mp.ncdf(-z)
    if f == "pgamma":
        return pgamma_cola(args["x"], args["a"], lt, marcas)
    if f == "pchisq":
        return pgamma_cola(args["x"] / 2, args["nu"] / 2, lt, marcas)       # /2 exacto en mpf
    if f == "pbeta":
        x, a, b = args["x"], args["a"], args["b"]
        if lt == 1:
            return betainc_reg(a, b, x, marcas)
        return betainc_reg(b, a, 1 - x, marcas)          # 1 - x exacto en mpf
    if f == "pt":
        return pt_cola(args["t"], args["n"], lt, marcas)
    if f == "lgamma":
        return mp.loggamma(args["a"])
    if f == "gamma":
        return mp.gamma(args["a"])
    if f == "gamma1pm1":
        return mp.rgamma(1 + args["a"]) - 1
    raise ValueError(f)


class RespaldoBeta(Exception):
    pass


AVISO_RESPALDO = "betainc de mpmath no convergio; respaldo del generador: serie positiva DLMF 8.17.8 en aritmetica de mpmath"


def betainc_reg(a, b, x, marcas):
    """I_x(a, b). Primero mp.betainc; si no converge (pasa con a o b ~1e4-1e5: su serie 2F1(a, 1-b; a+1; x)
    alterna y cancela), respaldo con la serie de terminos POSITIVOS
        I_x(a,b) = x^a (1-x)^b / (a B(a,b)) · F(a+b, 1; a+1; x)
    Fuente: DLMF 8.17.8 (B_x(a,b) = x^a (1-x)^b / a · F(a+b, 1; a+1; x)) con 8.17.2 (I_x = B_x / B);
    F es la serie de Gauss, DLMF 15.2.1; con segundo parametro 1, (1)_s / s! = 1 y el cociente entre
    terminos es (a+b+s)/(a+1+s)·x. Simetria: DLMF 8.17.4, I_x(a,b) = 1 - I_{1-x}(b,a). (DLMF 1.2.8,
    leido el 13/10/2026.) Sumada en mpmath a la precision vigente (sin cancelacion), del lado donde
    converge desde el primer termino: x <= a/(a+b) directo; si no, 1 - I_{1-x}(b, a). Es codigo de este
    generador, no de mpmath: las filas que lo usan se marcan en `nota` y la independencia la da la
    tercera via (cuadratura), obligatoria en ellas."""
    try:
        return mp.betainc(a, b, 0, x, regularized=True)
    except (mpmath.libmp.NoConvergence, ValueError, ZeroDivisionError):
        pass
    marcas.add(AVISO_RESPALDO)

    def serie(a, b, x):
        eps = mpf(2) ** (-(mp.prec + 20))
        with mp.workprec(mp.prec + 64):  # guarda: suma larga y exponente que cancela ~6 cifras con a o b ~1e5
            s, t, n = mpf(1), mpf(1), 0
            while True:
                r = (a + b + n) / (a + 1 + n) * x
                t *= r
                s += t
                n += 1
                if r < 1 and t < s * eps:
                    break
                if n > 10 ** 7:
                    raise ErrorDificil("respaldo de betainc: la serie positiva no termino en 1e7 terminos")
            return mp.exp(a * mp.log(x) + b * mp.log(1 - x) - mp.log(a) - mp.log(mp.beta(a, b))) * s
    if x <= a / (a + b):
        return serie(a, b, x)
    return 1 - serie(b, a, 1 - x)


AVISO_RESPALDO_GAMMA = ("gammainc de mpmath no convergio; respaldo del generador en aritmetica de mpmath: serie "
                        "DLMF 8.7.1 para P (x <= a) o fraccion continua DLMF 8.9.2 para Q (x >= a), y 1 - la otra cola "
                        "donde la pedida vale ~1")


def _p_serie(a, x):
    """P(a,x) = x^a e^-x / Γ(a+1) · Σ x^n / ((a+1)...(a+n)): terminos positivos, sin cancelacion.
    Fuente: DLMF 8.7.1, γ*(a,z) = e^-z Σ_k z^k / Γ(a+k+1), con DLMF 8.2.6, γ*(a,z) = z^-a P(a,z)
    (DLMF 1.2.8, leido el 13/10/2026). Γ(a+k+1) = Γ(a+1)·(a+1)...(a+k)."""
    eps = mpf(2) ** (-(mp.prec + 20))
    with mp.workprec(mp.prec + 64):     # guarda: suma larga y exponente que cancela ~6 cifras con a ~1e5
        s, t, n = mpf(1), mpf(1), 0
        while True:
            n += 1
            t *= x / (a + n)
            s += t
            if x < a + n and t < s * eps:
                break
            if n > 10 ** 7:
                raise ErrorDificil("respaldo de gammainc: la serie de P no termino en 1e7 terminos")
        return mp.exp(a * mp.log(x) - x - mp.loggamma(a + 1)) * s


def _q_fc(a, x):
    """Q(a,x) por la fraccion continua de DLMF 8.9.2 (DLMF 1.2.8, leido el 13/10/2026):
        x^-a e^x Γ(a,x) = x^-1/(1+ (1-a)x^-1/(1+ x^-1/(1+ (2-a)x^-1/(1+ 2x^-1/(1+ (3-a)x^-1/(1+ ...
    es decir, denominadores 1 y numeradores parciales a_1 = 1/x, a_2k = (k-a)/x, a_2k+1 = k/x (k >= 1).
    Con Q = Γ(a,x)/Γ(a) (DLMF 8.2.4): Q(a,x) = x^a e^-x / Γ(a) · K.
    Evaluada con la recurrencia directa de los convergentes, A_n = A_n-1 + a_n A_n-2 y
    B_n = B_n-1 + a_n B_n-2 (A_-1 = 1, A_0 = 0, B_-1 = 0, B_0 = 1), en mpf con 64 bits de guarda: el
    exponente de un mpf no desborda, asi que no hace falta reescalar ni ningun truco de 'tiny'.
    Parada: dos cambios seguidos del convergente por debajo de 2^-(prec+20) en relativo.
    Reemplaza (13/10, a pedido del revisor) a la version anterior, que seguia el listado de Lentz
    modificado de Numerical Recipes; NR no se usa ni como referencia de codigo (expediente)."""
    eps = mpf(2) ** (-(mp.prec + 20))
    with mp.workprec(mp.prec + 64):
        xi = 1 / x
        a_prev, a_cur = mpf(1), mpf(0)      # A_-1, A_0
        b_prev, b_cur = mpf(0), mpf(1)      # B_-1, B_0
        h_ant = None
        quietos = 0
        n = 0
        while True:
            n += 1
            if n == 1:
                an = xi
            elif n % 2 == 0:
                an = (n // 2 - a) * xi
            else:
                an = (n // 2) * xi
            a_prev, a_cur = a_cur, a_cur + an * a_prev
            b_prev, b_cur = b_cur, b_cur + an * b_prev
            if b_cur != 0:
                h = a_cur / b_cur
                if h_ant is not None and h != 0 and abs(h - h_ant) <= eps * abs(h):
                    quietos += 1
                    if quietos >= 2:
                        break
                else:
                    quietos = 0
                h_ant = h
            if n > 2 * 10 ** 7:
                raise ErrorDificil("respaldo de gammainc: la fraccion continua de Q (DLMF 8.9.2) no convergio en 2e7 pasos")
        return mp.exp(a * mp.log(x) - x - mp.loggamma(a)) * h


def pgamma_cola(x, a, lt, marcas=None):
    """Cola pedida de la gamma regularizada. Hallazgo de la prueba de humo (13/10): con a ~ 5e4-1e5 y
    x lejos de a, mp.gammainc no converge en ninguna de las dos colas (NoConvergence). Respaldo, marcado
    en `nota` y con tercera via obligatoria: P por serie positiva (x <= a), Q por fraccion continua
    (x >= a), y 1 - la otra solo donde la cola pedida vale ~1 (sin perdida relativa)."""
    marcas = set() if marcas is None else marcas
    try:
        if lt == 1:
            return mp.gammainc(a, 0, x, regularized=True)
        return mp.gammainc(a, x, mp.inf, regularized=True)
    except (mpmath.libmp.NoConvergence, ValueError):
        pass
    marcas.add(AVISO_RESPALDO_GAMMA)
    if lt == 1:
        return _p_serie(a, x) if x <= a else 1 - _q_fc(a, x)
    return _q_fc(a, x) if x >= a else 1 - _p_serie(a, x)


def pt_cola(t, n, lt, marcas=None):
    """P(T < s) con s = t (cola inferior) o s = -t (cola superior), via betainc (expediente §3)."""
    marcas = set() if marcas is None else marcas
    s = t if lt == 1 else -t
    w = n / (n + s * s)
    if s < 0:
        return betainc_reg(n / 2, mpf(1) / 2, w, marcas) / 2
    return 1 - betainc_reg(n / 2, mpf(1) / 2, w, marcas) / 2


# =====================================================================================
# 2. Precision adaptativa (§4.4)
# =====================================================================================

def dps_desde_argumentos(f, args):
    """§4.4 b: resta hecha por nosotros (gamma1pm1): dps desde los argumentos."""
    a = args["a"]
    m = min(abs(a), abs(a - 1))
    if m == 0 or m >= 1:
        return DPS_BASE
    return DPS_BASE + int(mp.ceil(-mp.log10(m))) + 10


def ceil_log(v):
    return int(mp.ceil(-mp.log10(abs(v))))


def cero_exacto(f, args, lt):
    """Regla «un cero nunca se congela en silencio» (revisor, 13/10): una referencia 0 solo se acepta
    cuando el valor matematico es 0 por un argumento exacto. Devuelve el motivo, o "" si no lo es."""
    if f == "erf" and args["x"] == 0:
        return "erf(0) = 0"
    if f == "gamma1pm1" and args["a"] in (0, 1):
        return "1/Γ(1) - 1 = 1/Γ(2) - 1 = 0"
    if f == "lgamma" and args["a"] in (1, 2):
        return "lgamma(1) = lgamma(2) = 0"
    if f in ("pgamma", "pchisq") and lt == 1 and args["x"] == 0:
        return "cola inferior en x = 0"
    if f == "pbeta" and ((lt == 1 and args["x"] == 0) or (lt == 0 and args["x"] == 1)):
        return "cola de pbeta en el borde x = 0 o x = 1"
    return ""


# Regla 4 de tolerancias: |ref| <= 2^-1075 (la mitad del menor subnormal) redondea a 0 en double
# (2^-1075 exacto es empate y va al par, 0). Por debajo no hace falta precision adaptativa: basta la
# comparacion 50/70 para mostrar que el valor esta ahi. Ver referencia_directa.
MEDIO_SUBNORMAL = mpf(2) ** -1075


def referencia_directa(f, args, lt):
    """Valor a dps_usado y a dps_usado + 20, con la regla adaptativa. Devuelve (r1, r2, dps, nota)."""
    nota = ""
    marcas = set()
    motivo = cero_exacto(f, args, lt)
    if motivo:
        return mpf(0), mpf(0), DPS_BASE, "0 exacto: " + motivo
    if f == "gamma1pm1":
        d = dps_desde_argumentos(f, args)
        tope = DPS_TOPE                              # §4.4 b
        with mp.workdps(d):
            r1 = cdf(f, args, lt, marcas)
    else:
        d = DPS_BASE
        tope = DPS_TOPE_ADAPT
        with mp.workdps(d):
            r1 = cdf(f, args, lt, marcas)
        if r1 != 0 and abs(r1) < MEDIO_SUBNORMAL:
            # Por debajo de 2^-1075 (≈ 2.5e-324) la regla 4 exige 0 exacto: basta mostrar con la
            # comparacion 50/70 que el valor esta ahi. Ahorra el calculo a dps alto, que en pbeta con a o
            # b ~1e4-1e5 toma segundos por fila (hallazgo de la prueba de humo, 13/10).
            nota = "|ref| < 2^-1075: redondea a 0 en double (regla 4), sin precision adaptativa"
        elif r1 != 0 and abs(r1) < mpf(10) ** (-(DPS_BASE - UMBRAL_ADAPT)):   # §4.4 a
            d = DPS_BASE + ceil_log(r1)
            # Tope (13/10): hay colas con |ref| ~ 10^-596000 (pgamma con a = 6e4, x = 1.6e6), pero esas ya
            # salen por la rama de arriba. Entre 2^-1075 y 1e-10 la regla da como mucho 50 + 324 = 374
            # digitos; el tope de 450 queda como resguardo y se marca en `nota` si actua.
            if d > DPS_TOPE_ADAPT:
                d = DPS_TOPE_ADAPT
                nota = "dps adaptativo con tope 450"
            with mp.workdps(d):
                r1 = cdf(f, args, lt, marcas)
    # Cero sin forma cerrada: duplicar dps hasta el tope; si sigue en 0, DIFICIL con causa (revisor, 13/10)
    while r1 == 0:
        d *= 2
        if d > tope:
            raise ErrorDificil(f"referencia 0 sin argumento exacto que la justifique (dps duplicado hasta el tope {tope})")
        nota = (nota + "; " if nota else "") + f"r1 = 0 sin cero exacto: dps duplicado a {d}"
        with mp.workdps(d):
            r1 = cdf(f, args, lt, marcas)
    with mp.workdps(d + DPS_EXTRA):
        r2 = cdf(f, args, lt, marcas)
    if r2 == 0:
        raise ErrorDificil(f"ref_mp70 = 0 sin argumento exacto que lo justifique (r1 != 0, dps {d + DPS_EXTRA})")
    # OJO: nunca `+r1` fuera del contexto: el + redondea a la precision vigente (15 cifras por defecto)
    nota = "; ".join([nota] + sorted(marcas)) if marcas else nota
    return r1, r2, d, nota.strip("; ")


# =====================================================================================
# 3. Inversas (§4.5): raiz de h(y) = s·(log F_cola(x(y)) - log p), en variable transformada
# =====================================================================================
# x(y) = sinh(y) en la recta real (qnorm, qt) y x(y) = exp(y) en (0, inf) (qgamma, qchisq). En esa
# variable el criterio de paso de findroot (|dy| < tol·max(1,|y|), leido en mpmath 1.3.0,
# calculus/optimization.py) es relativo en x en las colas. verify=False: la verificacion interna de
# findroot es |f(x)|^2 <= tol en ABSOLUTO (leido en el mismo archivo); el juez es la verificacion de abajo.

class ErrorDificil(Exception):
    pass


def inversa(f, args, lt, d, x0):
    p = args["p"]
    if f == "qnorm":
        F = lambda x: mp.ncdf(x) if lt == 1 else mp.ncdf(-x)
        real = True
    elif f in ("qgamma", "qchisq"):
        a = args["a"] if f == "qgamma" else args["nu"] / 2
        F = lambda x: pgamma_cola(x, a, lt)
        real = False
    elif f == "qt":
        n = args["n"]
        F = lambda x: pt_cola(x, n, lt)
        real = True
    else:
        raise ValueError(f)
    s = 1 if lt == 1 else -1                    # h creciente en y
    X = (lambda y: mp.sinh(y)) if real else (lambda y: mp.exp(y))
    Y = (lambda x: mp.asinh(x)) if real else (lambda x: mp.log(x))
    logp = mp.log(p)

    def h(y):
        v = F(X(y))
        if v <= 0:
            return -s * mp.inf if s == 1 else mp.inf
        return s * (mp.log(v) - logp)

    tol = mpf(10) ** (-(d - 5))

    def ok(y):
        x = X(y)
        v = F(x)
        return abs(v - p) <= tol * min(p, 1 - p), x

    # A) secante desde la referencia de R (si existe y es finita)
    if x0 is not None and mp.isfinite(x0) and (real or x0 > 0):
        try:
            y0 = Y(x0)
            y = mp.findroot(h, (y0, y0 + (abs(y0) + 1) * mpf("1e-6")), solver="secant",
                            tol=tol, verify=False, maxsteps=200)
            bueno, x = ok(y)
            if bueno:
                return x, "secante desde ref_r"
        except (ZeroDivisionError, ValueError, OverflowError):
            pass
    # B) biseccion gruesa (corchete por duplicacion en y) + anderson
    yc = Y(x0) if (x0 is not None and mp.isfinite(x0) and (real or x0 > 0)) else mpf(0)
    lo, hi, paso = yc - 1, yc + 1, mpf(1)
    for _ in range(64):
        if h(lo) < 0:
            break
        lo -= paso
        paso *= 2
    paso = mpf(1)
    for _ in range(64):
        if h(hi) > 0:
            break
        hi += paso
        paso *= 2
    if not (h(lo) < 0 < h(hi)):
        raise ErrorDificil("findroot no convergio: no se encontro corchete")
    metodo = "corchete + anderson"
    try:
        y = mp.findroot(h, (lo, hi), solver="anderson", tol=tol, verify=False, maxsteps=2000)
    except (ZeroDivisionError, ValueError):
        # v4 (13/10): antes este camino tambien se anotaba «corchete + anderson»; ahora dice lo que hizo
        metodo = "corchete + biseccion"
        y = mp.findroot(h, (lo, hi), solver="bisect", tol=tol, verify=False, maxsteps=20000)
    bueno, x = ok(y)
    if bueno:
        return x, metodo
    raise ErrorDificil("findroot no convergio (verificacion del residuo fallo dos veces)")


def referencia_inversa(f, args, lt, x0):
    p = args["p"]
    if f in ("qnorm", "qt") and p == mpf(1) / 2:
        # Hallazgo de la prueba de humo (13/10): con p = 1/2 la raiz es 0 y findroot deja un residuo de
        # ~1e-52 que no coincide entre 50 y 70 digitos. Es la mediana de una distribucion simetrica:
        # 0 exacto, sin calculo.
        return mpf(0), mpf(0), DPS_BASE, "p = 1/2 en distribucion simetrica: 0 exacto"
    d = DPS_BASE
    if p < mpf(10) ** (-(DPS_BASE - UMBRAL_ADAPT)):
        d = DPS_BASE + ceil_log(p)        # §4.4 aplicada a la CDF interna, que vale ~p
    with mp.workdps(d):
        a1 = {k: v for k, v in args.items()}
        r1, metodo = inversa(f, a1, lt, d, x0)
    with mp.workdps(d + DPS_EXTRA):
        r2, _ = inversa(f, args, lt, d + DPS_EXTRA, r1)
        if f == "qchisq":
            r1, r2 = 2 * r1, 2 * r2     # dentro del contexto: el producto no pierde cifras
    return r1, r2, d, metodo


# =====================================================================================
# 4. Valores de fuente (§3.4) y tercera via (§5.2)
# =====================================================================================

def valor_fuente_mp(f, args, lt, vf):
    """Evalua valor_fuente a la precision vigente. Devuelve mpf o None."""
    if not vf:
        return None
    if f == "qt":
        p = args["p"]
        signo = -1 if vf.startswith("-") else 1
        cuerpo = vf.lstrip("-")
        if cuerpo == "cot(pi*p)":
            return signo * mp.cot(mp.pi * p)
        if cuerpo == "sqrt(2/(2*p*(2-2*p))-2)":
            return signo * mp.sqrt(2 / (2 * p * (2 - 2 * p)) - 2)
        raise ValueError("forma cerrada desconocida: " + vf)
    return mpf(vf)


def _cola_normal(w):
    """∫_w^∞ e^(-s^2/2) ds para w >= 0, en variable desplazada s = w + u y normalizada por e^(-w^2/2):
    e^(-w^2/2) · ∫_0^∞ e^(-w u - u^2/2) du, con puntos a la escala local 1/w y a la escala 1. Integrar
    en s con w grande dejaba a tanh-sinh sin resolucion junto al extremo (hallazgo, 13/10: erfc con 3
    cifras en 195 filas)."""
    g = lambda u: mp.exp(-w * u - u * u / 2)
    esc = min(1 / w, mpf(1)) if w > 0 else mpf(1)
    pts = [mpf(0)]
    k = esc / 4
    while k < 64:
        pts.append(k)
        k *= 2
    v, e = mp.quad(g, pts + [mp.inf], error=True)
    c = mp.exp(-w * w / 2)
    return v * c, e * c


def _gamma_completa(a):
    """Γ(a) = ∫_0^∞ t^(a-1) e^-t dt (a > 0) por cuadratura. Devuelve (log de la integral, error relativo).
    a < 1: el tramo [0, 1] con r = t^a (quita la singularidad en 0): (1/a) ∫_0^1 e^(-r^(1/a)) dr.
    a >= 1: densidad normalizada en la moda a - 1 y puntos a ±σ·2^k (σ = sqrt(a)); con a ~ 1e4 integrar
    sin normalizar ni puntos daba 4-6 cifras (hallazgo, 13/10)."""
    if a < 1:
        v1, e1 = mp.quad(lambda r: mp.exp(-r ** (1 / a)), [0, mpf(1) / 2, 1], error=True)
        v1, e1 = v1 / a, e1 / a
        v2, e2 = mp.quad(lambda s: mp.exp((a - 1) * mp.log(s) - s), [1, 2, 8, 32, mp.inf], error=True)
        v = v1 + v2
        return mp.log(v), (e1 + e2) / v
    m = a - 1
    ref = (a - 1) * mp.log(m) - m if m > 0 else mpf(0)
    g = lambda s: mp.exp((a - 1) * mp.log(s) - s - ref) if s > 0 else mpf(0)
    sig = mp.sqrt(a)
    pts = {mpf(0), m}
    k = sig / 4
    while k < 64 * sig:
        for q in (m - k, m + k):
            if q > 0:
                pts.add(q)
        k *= 2
    v, e = mp.quad(g, sorted(pts) + [mp.inf], error=True)
    return mp.log(v) + ref, e / v


def tercera_via(f, args, lt, d):
    """Cuadratura de la definicion integral, al dps de la fila. Devuelve (valor, error) o None."""
    with mp.workdps(d):
        if f == "erf":
            x = args["x"]
            v, e = mp.quad(lambda t: mp.exp(-t * t), [0, x], error=True)
            return 2 / mp.sqrt(mp.pi) * v, 2 / mp.sqrt(mp.pi) * e
        if f == "erfc":
            x = args["x"]
            if x > 0:       # erfc(x) = 2/sqrt(pi) ∫_x^∞ e^(-t^2) dt = sqrt(2/pi) ∫_(x sqrt 2)^∞ e^(-s^2/2) ds
                v, e = _cola_normal(x * mp.sqrt(2))
                c = mp.sqrt(2 / mp.pi)
                return c * v, c * e
            v, e = mp.quad(lambda t: mp.exp(-t * t), [x, 0, mp.inf], error=True)
            return 2 / mp.sqrt(mp.pi) * v, 2 / mp.sqrt(mp.pi) * e
        if f == "pnorm":
            # P = ∫_w^∞ φ con w = -z (cola inferior) o w = z (superior); si w < 0, 1 - ∫_|w|^∞ φ
            z = args["z"]
            w = -z if lt == 1 else z
            v, e = _cola_normal(abs(w))
            c = 1 / mp.sqrt(2 * mp.pi)
            v, e = c * v, c * e
            return (v, e) if w >= 0 else (1 - v, e)
        if f in ("pgamma", "pchisq"):
            x, a = (args["x"], args["a"]) if f == "pgamma" else (args["x"] / 2, args["nu"] / 2)
            if a < 1 and x <= a:           # lado chico inferior con singularidad en 0: u = t^a
                # (antes solo con lt = 1; con lt = 0 caia en la variable desplazada, y x - u pierde
                # precision junto a la singularidad: 0 cifras con a ~ 0.005, hallazgo del 13/10)
                g = mp.gamma(a)
                v, e = mp.quad(lambda u: mp.exp(-u ** (1 / a)), [0, x ** a / 2, x ** a], error=True)
                v, e = v / (a * g), e / (a * g)
                return (v, e) if lt == 1 else (1 - v, e)
            # Variable desplazada u = |t - x| y densidad normalizada por su maximo en el lado elegido:
            # integrar en t con x ~ 1e5 deja a tanh-sinh sin resolucion junto al extremo (hallazgo de la
            # prueba de humo, 13/10: 8-11 cifras; con u desplazada, 30).
            lg = mp.loggamma(a)
            phi = lambda t: (a - 1) * mp.log(t) - t - lg
            chico_es_inferior = x <= a
            moda = a - 1 if a > 1 else None
            s_g = mp.sqrt(a) if a > 1 else mpf(1)
            pend = abs((a - 1) / x - 1)
            esc = 1 / pend if pend > 0 else s_g
            K = int(1.2 * (mp.dps + 20) * 2.303) + 1
            if chico_es_inferior:
                m = max(x - moda, 0) if moda is not None else mpf(0)
                U = min(x, m + K * max(s_g, esc if m == 0 else s_g))
                t_de = lambda u: x - u
            else:
                m = max(moda - x, 0) if moda is not None else mpf(0)
                U = m + K * max(s_g, esc if m == 0 else s_g)
                t_de = lambda u: x + u
            ref = phi(t_de(m))
            g = lambda u: mp.exp(phi(t_de(u)) - ref) if t_de(u) > 0 else mpf(0)
            pts = {mpf(0), U}
            for base in (esc, s_g):
                k = base / 4
                while k < U:
                    pts.add(k)
                    if m > 0:
                        for q in (m - k, m + k):
                            if 0 < q < U:
                                pts.add(q)
                    k *= 2
            if 0 < m < U:
                pts.add(m)
            v, e = mp.quad(g, sorted(pts), error=True)
            esc_v = mp.exp(ref)
            v, e = v * esc_v, e * esc_v
            if (lt == 1) == chico_es_inferior:
                return v, e
            return 1 - v, e
        if f == "pbeta":
            # Se integra el lado con MENOS masa (x frente a la media a/(a+b)) y, si no es la cola pedida,
            # se toma 1 - v: la cola chica se integra con error relativo, la grande no pierde nada.
            # Variable desplazada u = |t - x|, densidad normalizada por su maximo en el lado elegido
            # (en x, o en la moda si cae dentro) y puntos a la escala local 1/|d log f/dt| en x y a la
            # desviacion tipica, como en la gamma. Hallazgo de la prueba de humo (13/10): integrar en t
            # daba 0-1 cifras en colas de 1e-326 y 1e-32396 con a o b ~1e4-1e5.
            x, a, b = args["x"], args["a"], args["b"]
            lB = mp.log(mp.beta(a, b))
            logf = lambda s: (a - 1) * mp.log(s) + (b - 1) * mp.log1p(-s) - lB
            chico_es_inferior = x <= a / (a + b)
            L = x if chico_es_inferior else 1 - x
            if L == 0:
                v, e = mpf(0), mpf(0)
            elif (chico_es_inferior and a < 1) or (not chico_es_inferior and b < 1):
                # Extremo singular dentro del lado chico (t^(a-1) en 0 con a < 1, o (1-t)^(b-1) en 1 con
                # b < 1): sustitucion r = t^a (o r = (1-t)^b), que quita la singularidad:
                # ∫_0^x t^(a-1)(1-t)^(b-1) dt = (1/a) ∫_0^(x^a) (1 - r^(1/a))^(b-1) dr. Con u = |t - x| la
                # resta x - u perdia precision justo junto a la singularidad (0 cifras con a ~ 0.004).
                p_, q_, y = (a, b, x) if chico_es_inferior else (b, a, 1 - x)
                c = mp.exp(-lB) / p_
                h = lambda r: mp.exp((q_ - 1) * mp.log1p(-r ** (1 / p_))) if r > 0 else mpf(1)
                R = y ** p_
                v, e = mp.quad(h, [0, R / 4, R / 2, R], error=True)
                v, e = v * c, e * c
            else:
                t_de = (lambda u: x - u) if chico_es_inferior else (lambda u: x + u)
                ref = logf(x)
                m = None
                if a > 1 and b > 1:
                    moda = (a - 1) / (a + b - 2)
                    um = (x - moda) if chico_es_inferior else (moda - x)
                    if 0 < um < L:
                        m = um
                        ref = max(ref, logf(moda))
                pend = abs((a - 1) / x - (b - 1) / (1 - x))
                sig = mp.sqrt(a * b / ((a + b) ** 2 * (a + b + 1)))
                pts = {mpf(0), L}
                for base in ([1 / pend] if pend > 0 else []) + [sig]:
                    k = base / 4
                    while k < L:
                        pts.add(k)
                        if m is not None:
                            for q in (m - k, m + k):
                                if 0 < q < L:
                                    pts.add(q)
                        k *= 2
                if m is not None:
                    pts.add(m)
                def g(u):
                    s = t_de(u)
                    if s <= 0 or s >= 1:
                        return mpf(0)
                    return mp.exp(logf(s) - ref)
                v, e = mp.quad(g, sorted(pts), error=True)
                esc_v = mp.exp(ref)
                v, e = v * esc_v, e * esc_v
            if (lt == 1) == chico_es_inferior:
                return v, e
            return 1 - v, e
        if f == "pt":
            # Se integra siempre la cola chica J(w) = ∫_w^∞ f(u) du, w = |s| (s = t en la cola inferior,
            # -t en la superior), y se usa la simetria: P(T < s) = c·J(|s|) si s <= 0, 1 - c·J(s) si s > 0.
            # Variable desplazada y = u - w, densidad normalizada por su valor en w y puntos a la escala
            # local (n + w^2)/((n + 1) w), doblando hasta 1e6 veces la escala mayor (Y), y de Y a inf en
            # escala logaritmica (ver abajo). Hallazgo de la prueba de
            # humo (13/10): integrar en [-inf, t] con n ~ 1e5 y t ~ 80 dejaba a tanh-sinh sin ver el pico
            # (0 cifras en una fila, 3 en otra).
            t, n = args["t"], args["n"]
            s = t if lt == 1 else -t
            w = abs(s)
            logc = mp.loggamma((n + 1) / 2) - mp.loggamma(n / 2) - mp.log(n * mp.pi) / 2
            logf = lambda u: -(n + 1) / 2 * mp.log1p(u * u / n)
            ref = logf(w)
            g = lambda y: mp.exp(logf(w + y) - ref)
            esc_loc = (n + w * w) / ((n + 1) * w) if w > 0 else mpf(1)
            esc_glob = max(mpf(1), w)
            pts = {mpf(0)}
            k = min(esc_loc, mpf(1)) / 4
            while k < 10 ** 6 * max(esc_loc, esc_glob):
                pts.add(k)
                k *= 2
            pts = sorted(pts)
            Y = pts[-1]
            v, e = mp.quad(g, pts, error=True)
            # Cola y > Y en escala logaritmica, y = Y e^z: el integrando decae como e^(-n z), lento si n
            # es chico (n = 0.1 daba 5 cifras con el tramo [Y, inf] directo). Puntos a la escala 1/n.
            pz = [mpf(0)]
            k = 1 / (4 * n)
            while k < 2000 / n:
                pz.append(k)
                k *= 2
            v2, e2 = mp.quad(lambda z: g(Y * mp.exp(z)) * Y * mp.exp(z), pz + [mp.inf], error=True)
            v, e = v + v2, e + e2
            fac = mp.exp(logc + ref)
            v, e = v * fac, e * fac
            return (v, e) if s <= 0 else (1 - v, e)
        if f == "gamma1pm1":
            a = args["a"]
            v, e = mp.quad(lambda t: t ** a * mp.exp(-t), [0, 1, mp.inf], error=True)
            return 1 / v - 1, e / (v * v)
        if f in ("gamma", "lgamma"):
            lv, er = _gamma_completa(args["a"])
            if f == "lgamma":
                return lv, er
            v = mp.exp(lv)
            return v, v * er
    return None   # inversas: sin tercera via (§4.5)


# =====================================================================================
# 5. Utilidades numericas
# =====================================================================================

def cifras(r1, r2):
    if r2 == 0:
        # referencia exactamente 0: se acepta un valor que sea 0 a la precision vigente (p. ej. cot(pi/2))
        return CIFRAS_ESCRITAS if abs(r1) <= mpf(10) ** (-(mp.dps - 5)) else 0
    dif = abs(r1 - r2)
    if dif == 0:
        return CIFRAS_ESCRITAS
    with mp.workdps(max(mp.dps, 60)):
        c = int(mp.floor(-mp.log10(dif / abs(r2))))
    return max(0, min(CIFRAS_ESCRITAS, c))


def orden_bits(x):
    """Entero que ordena los doubles (para contar ulps entre dos doubles finitos o infinitos)."""
    i = struct.unpack("<q", struct.pack("<d", x))[0]
    return i if i >= 0 else -(i & 0x7FFFFFFFFFFFFFFF)


def ulps(a, b):
    if math.isnan(a) or math.isnan(b):
        return None
    if a == b:
        return 0
    return abs(orden_bits(a) - orden_bits(b))


def a_double(v):
    """Double mas cercano a un mpf, correctamente redondeado tambien en el rango subnormal.
    Error de Cowork cazado el 13/10: float(mpf) de mpmath 1.3.0 (libmpf.to_float) redondea primero a 53
    bits y luego math.ldexp vuelve a redondear al bajar a subnormal: doble redondeo. Comprobado:
    float(2^-1075·(1 + 2^-60)) da 0.0 y el double mas cercano es 2^-1074. Aqui se usa la mantisa y el
    exponente exactos del mpf (v = man·2^exp) y la division entera de Python, que redondea bien
    (int / int correctamente redondeado, subnormales incluidos)."""
    if v == 0:
        return 0.0
    if not mp.isfinite(v):
        return float(v)
    signo, man, exp, _ = v._mpf_               # v = (-1)^signo · man · 2^exp, man >= 0
    man, exp = int(man), int(exp)              # con gmpy2 son mpz, y mpz / int da mpfr, no float
    if signo:
        man = -man
    if exp + man.bit_length() > 1025:          # |v| >= 2^1025: infinito sin duda
        return -math.inf if signo else math.inf
    if exp + man.bit_length() < -1080:         # |v| < 2^-1080 < 2^-1075: 0 sin duda
        return -0.0 if signo else 0.0
    try:
        return float(man << exp) if exp >= 0 else man / (1 << -exp)
    except OverflowError:
        return -math.inf if signo else math.inf


def fuera_de_rango(r2, exacto):
    """Columna fuera_de_rango (revisor, 13/10), calculada desde el double mas cercano a ref_mp70:
    inf (regla 9), cero (regla 4: el double mas cercano es 0, la funcion debe devolver 0),
    subnormal (regla 4: 0 < |double| < 2^-1022, se mide en ulps) o vacio. Un 0 exacto por argumento
    (cero_exacto) no esta fuera de rango: queda vacio."""
    if exacto:
        return ""
    d = a_double(r2)
    if math.isinf(d):
        return "inf"
    if d == 0:
        return "cero"
    if abs(d) < 2.0 ** -1022:
        return "subnormal"
    return ""


def nstr(v):
    return mp.nstr(v, CIFRAS_ESCRITAS)


def sha256_archivo(ruta):
    with open(ruta, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


# =====================================================================================
# 6. Lectura de entradas
# =====================================================================================

def leer_csv(ruta):
    with open(ruta, encoding="utf-8", newline="") as fh:
        lineas = fh.read().split("\n")
    cab = [l for l in lineas if l.startswith("#")]
    datos = [l for l in lineas if l and not l.startswith("#")]
    filas = list(csv.DictReader(io.StringIO("\n".join(datos))))
    return cab, filas


def cargar(f):
    _, puntos = leer_csv(os.path.join(DIR_PUNTOS, f + ".csv"))
    _, refr = leer_csv(os.path.join(DIR_R, f + ".csv"))
    if len(puntos) != len(refr):
        raise SystemExit(f"{f}: _puntos tiene {len(puntos)} filas y _ref_r {len(refr)}")
    tareas = []
    for p, r in zip(puntos, refr):
        if p["id"] != r["id"]:
            raise SystemExit(f"{f}: id distinto entre _puntos ({p['id']}) y _ref_r ({r['id']})")
        args_hex = {k: p[k + "_hex"] for k in ARGUMENTOS[f]}
        for k in ARGUMENTOS[f]:     # el hexadecimal y el decimal tienen que dar el mismo double
            if float.fromhex(args_hex[k]) != float(p[k]):
                raise SystemExit(f"{f} fila {p['id']}: {k} hexadecimal y decimal no coinciden")
        tareas.append({
            "f": f, "id": int(p["id"]), "region": p["region"], "args_hex": args_hex,
            "lower_tail": p["lower_tail"], "origen": p["origen"], "valor_fuente": p["valor_fuente"],
            "ref_r_hex": r.get("ref_r_hex", ""),
        })
    return tareas


# =====================================================================================
# 7. Trabajo por fila (se ejecuta en los procesos; no usa azar)
# =====================================================================================

def trabajar(t):
    f = t["f"]
    out = {"id": t["id"]}
    lt = int(t["lower_tail"]) if t["lower_tail"] != "" else 1
    args = {k: mpf(float.fromhex(v)) for k, v in t["args_hex"].items()}
    ref_r = float.fromhex(t["ref_r_hex"]) if t["ref_r_hex"] else None
    causa = ""
    try:
        if f in INVERSAS:
            x0 = mpf(ref_r) if (ref_r is not None and math.isfinite(ref_r)) else None
            if f == "qchisq" and x0 is not None:
                x0 = x0 / 2
            r1, r2, d, metodo = referencia_inversa(f, args, lt, x0)
            out["nota"] = metodo if metodo.startswith("p = 1/2") else "inversa: " + metodo
        else:
            r1, r2, d, nota = referencia_directa(f, args, lt)
            out["nota"] = nota
        with mp.workdps(d + DPS_EXTRA):
            out["ref_mp50"], out["ref_mp70"], out["dps_usado"] = nstr(r1), nstr(r2), d
            out["cifras_50_70"] = cifras(r1, r2)
        r70d = a_double(r2)
        out["ref_mp70_hex"] = r70d.hex()
        exacto = out["nota"].startswith("0 exacto") or out["nota"].startswith("p = 1/2")
        if (r1 == 0 or r2 == 0) and not exacto:    # resguardo de la regla «cero nunca en silencio»
            raise ErrorDificil("referencia 0 sin argumento exacto que la justifique")
        out["fuera_de_rango"] = fuera_de_rango(r2, exacto)
        if out["fuera_de_rango"] == "inf" and abs(r2) < UMBRAL_INF:
            raise ErrorDificil("a_double da inf por debajo del umbral de la regla 9")
        # R (§5.1): distancia en ulps al double mas cercano a ref_mp70
        out["ulps_r"] = "" if ref_r is None else ulps(ref_r, r70d)
        # valor de fuente (§3.4)
        with mp.workdps(d + DPS_EXTRA):
            vf = valor_fuente_mp(f, args, lt, t["valor_fuente"])
            if vf is not None:
                out["cifras_fuente"] = cifras(vf, r2)
            else:
                out["cifras_fuente"] = ""
        # tercera via siempre en erf, erfc, gamma1pm1 (§5.2)
        if f in TERCERA_SIEMPRE or "no convergio" in out.get("nota", ""):
            q = tercera_via(f, args, lt, d)
            with mp.workdps(d + DPS_EXTRA):
                out["ref_quad"], out["err_quad"] = nstr(q[0]), mp.nstr(q[1], 5)
                out["cifras_quad"] = cifras(q[0], r2)
        else:
            out["ref_quad"] = out["err_quad"] = out["cifras_quad"] = ""
    except ErrorDificil as e:
        causa = str(e)
    except Exception as e:      # §5 criterio 2: excepcion de mpmath
        causa = f"excepcion {type(e).__name__}: {e}"
    out["causa"] = causa
    return out


def tercera_via_fila(t):
    """Para `cerrar`: tercera via de una fila con r_discrepa = 1."""
    f = t["f"]
    lt = int(t["lower_tail"]) if t["lower_tail"] != "" else 1
    args = {k: mpf(float.fromhex(v)) for k, v in t["args_hex"].items()}
    try:
        q = tercera_via(f, args, lt, t["dps_usado"])
        if q is None:
            return {"id": t["id"], "ref_quad": "", "err_quad": "", "cifras_quad": ""}
        with mp.workdps(t["dps_usado"] + DPS_EXTRA):
            return {"id": t["id"], "ref_quad": nstr(q[0]), "err_quad": mp.nstr(q[1], 5),
                    "cifras_quad": cifras(q[0], mpf(t["ref_mp70"]))}
    except Exception as e:
        return {"id": t["id"], "ref_quad": "", "err_quad": "", "cifras_quad": 0,
                "nota": f"cuadratura fallo: {type(e).__name__}"}


# =====================================================================================
# 8. Pasos
# =====================================================================================

COLS_MP = ["id", "region", "args", "lower_tail", "origen", "valor_fuente",
           "ref_mp50", "ref_mp70", "ref_mp70_hex", "dps_usado", "cifras_50_70", "nota",
           "ref_r_hex", "ulps_r", "cifras_fuente", "ref_quad", "err_quad", "cifras_quad",
           "fuera_de_rango", "causa"]


def cabecera_comun():
    h = {n: sha256_archivo(os.path.join(RAIZ, "tests", "gen", n))
         for n in ("gen_puntos.py", "ref_r.R", "ref_mpmath.py")}
    gm = "-"
    if mpmath.libmp.BACKEND == "gmpy":
        try:
            import gmpy2
            gm = gmpy2.version()
        except Exception:
            gm = "?"
    return [
        f"# python: {sys.version.split()[0]}   mpmath: {mpmath.__version__}   "
        f"backend: {mpmath.libmp.BACKEND}   gmpy2: {gm}",
        f"# sha256_gen_puntos.py: {h['gen_puntos.py']}",
        f"# sha256_ref_r.R: {h['ref_r.R']}",
        f"# sha256_ref_mpmath.py: {h['ref_mpmath.py']}",
    ]


def calcular(funciones, procesos):
    os.makedirs(SALIDA_MP, exist_ok=True)
    for f in funciones:
        tareas = limitar(cargar(f))
        t0 = time.time()
        res = {}
        if procesos == 1:
            for t in tareas:
                r = trabajar(t)
                res[r["id"]] = r
        else:
            with mproc.Pool(procesos) as pool:
                for r in pool.imap_unordered(trabajar, tareas, chunksize=CHUNK):
                    res[r["id"]] = r
        dt = time.time() - t0
        buf = io.StringIO()
        buf.write(f"# funcion: {f}\n# paso: calcular (intermedio; los CSV finales los escribe `cerrar`)\n")
        if LIMITE:
            buf.write(f"# PRUEBA --limite {LIMITE}: NO canonico, no se commitea\n")
        for l in cabecera_comun():
            buf.write(l + "\n")
        buf.write(f"# entrada _puntos sha256: {sha256_archivo(os.path.join(DIR_PUNTOS, f + '.csv'))}\n")
        buf.write(f"# entrada _ref_r  sha256: {sha256_archivo(os.path.join(DIR_R, f + '.csv'))}\n")
        buf.write(f"# reglas: dps {DPS_BASE}/{DPS_BASE + DPS_EXTRA}; adaptativa si |ref| < 1e-{DPS_BASE - UMBRAL_ADAPT}; "
                  f"inversas: tol 10^-(dps-5) en variable transformada, residuo relativo; quad en erf/erfc/gamma1pm1\n")
        w = csv.writer(buf, lineterminator="\n")
        w.writerow(COLS_MP)
        n_causa = 0
        for t in tareas:
            r = res[t["id"]]
            n_causa += bool(r["causa"])
            argtxt = ";".join(f"{k}={v}" for k, v in t["args_hex"].items())
            w.writerow([t["id"], t["region"], argtxt, t["lower_tail"], t["origen"], t["valor_fuente"],
                        r.get("ref_mp50", ""), r.get("ref_mp70", ""), r.get("ref_mp70_hex", ""),
                        r.get("dps_usado", ""), r.get("cifras_50_70", ""), r.get("nota", ""),
                        t["ref_r_hex"], r.get("ulps_r", ""), r.get("cifras_fuente", ""),
                        r.get("ref_quad", ""), r.get("err_quad", ""), r.get("cifras_quad", ""),
                        r.get("fuera_de_rango", ""), r["causa"]])
        ruta = os.path.join(SALIDA_MP, f + ".csv")
        with open(ruta, "w", encoding="utf-8", newline="") as fh:
            fh.write(buf.getvalue())
        with open(os.path.join(SALIDA_MP, f"_corrida_{f}.txt"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(f"funcion {f}\nfilas {len(tareas)}\nprocesos {procesos}\nchunksize {CHUNK}\n"
                     f"segundos {dt:.1f}\nfecha {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                     f"filas_con_causa {n_causa}\n")
        print(f"{f:10} {len(tareas):6} filas  {dt:8.1f} s  con causa: {n_causa:4}  "
              f"sha256 {sha256_archivo(ruta)}", flush=True)


def leer_mp(f):
    _, filas = leer_csv(os.path.join(SALIDA_MP, f + ".csv"))
    return limitar(filas)


def distribucion(funciones):
    for f in funciones:
        filas = leer_mp(f)
        print(f"\n== {f}")
        porreg = {}
        for r in filas:
            porreg.setdefault(r["region"], []).append(r)
        for reg, rs in sorted(porreg.items()):
            cif = sorted(int(r["cifras_50_70"]) for r in rs if r["cifras_50_70"] != "")
            u = sorted(int(r["ulps_r"]) for r in rs if r["ulps_r"] not in ("", "None"))
            causa = sum(1 for r in rs if r["causa"])
            def q(v, pc):
                return v[min(len(v) - 1, int(pc * len(v)))] if v else "-"
            print(f"   {reg:22} n={len(rs):5}  cifras min {cif[0] if cif else '-':>3} p1 {q(cif, .01):>3}"
                  f"  | ulps R: mediana {q(u, .5)} p99 {q(u, .99)} max {u[-1] if u else '-'}"
                  f"  | con causa {causa}")


def cerrar(funciones, K, umbral, procesos):
    decis = {}
    if os.path.exists(DECISIONES):
        _, ds = leer_csv(DECISIONES)
        for d in ds:
            decis[(d["funcion"], int(d["id"]))] = (d["decision"], d["causa"])
    pendientes = []
    finales = {}
    dificiles = []
    for f in funciones:
        filas = leer_mp(f)
        # tercera via para r_discrepa = 1 (las de erf/erfc/gamma1pm1 ya la tienen)
        tareas = []
        for r in filas:
            u = r["ulps_r"]
            r["r_discrepa"] = "" if u in ("", "None") else ("1" if int(u) > K else "0")
            if r["r_discrepa"] == "1" and r["ref_quad"] == "" and f not in INVERSAS:
                argh = dict(kv.split("=", 1) for kv in r["args"].split(";"))
                tareas.append({"f": f, "id": int(r["id"]), "lower_tail": r["lower_tail"],
                               "args_hex": argh, "dps_usado": int(r["dps_usado"]),
                               "ref_mp70": r["ref_mp70"]})
        if tareas:
            if procesos == 1:
                qs = [tercera_via_fila(t) for t in tareas]
            else:
                with mproc.Pool(procesos) as pool:
                    qs = list(pool.imap_unordered(tercera_via_fila, tareas, chunksize=CHUNK))
            qd = {q["id"]: q for q in qs}
            for r in filas:
                if int(r["id"]) in qd:
                    q = qd[int(r["id"])]
                    r["ref_quad"], r["err_quad"], r["cifras_quad"] = q["ref_quad"], q["err_quad"], str(q["cifras_quad"])
        for r in filas:
            r["tercera_via"] = "" if r["cifras_quad"] == "" else (
                "COINCIDE" if int(r["cifras_quad"]) >= CIFRAS_QUAD else "DISCREPA")
            causa = r["causa"]
            if not causa and r["cifras_50_70"] != "" and int(r["cifras_50_70"]) < umbral:
                causa = f"cifras_50_70 = {r['cifras_50_70']} < {umbral}"
            if not causa and r["cifras_fuente"] != "":
                minimo = CIFRAS_PUBLICADO if r["origen"] == "publicado" else umbral
                if int(r["cifras_fuente"]) < minimo:
                    causa = f"valor_fuente coincide solo en {r['cifras_fuente']} cifras"
            r["decision_manual"] = ""
            if r["tercera_via"] == "DISCREPA":
                dec = decis.get((f, int(r["id"])))
                if dec is None:
                    pendientes.append((f, r["id"]))
                else:
                    r["decision_manual"] = f"{dec[0]}: {dec[1]}"
                    if dec[0] == "DIFICIL" and not causa:
                        causa = "decision manual: " + dec[1]
            r["estado"] = "DIFICIL" if causa else "OK"
            r["causa_final"] = causa
            if causa:
                dificiles.append((f, r))
        finales[f] = filas
    if pendientes:
        ruta = os.path.join(SALIDA_FIN, "_pendientes_revision.csv")
        with open(ruta, "w", encoding="utf-8", newline="") as fh:
            fh.write("funcion,id\n" + "".join(f"{f},{i}\n" for f, i in pendientes))
        print(f"{len(pendientes)} filas con tercera_via = DISCREPA sin decision manual. Listadas en {ruta}. "
              f"No se escriben los CSV finales.")
        return 1
    cab = cabecera_comun()
    for f, filas in finales.items():
        # §2 del plan: lineas «# R:» y «# semilla:» (v4, 13/10: faltaban; las toman las cabeceras de entrada)
        cab_r, _ = leer_csv(os.path.join(DIR_R, f + ".csv"))
        cab_p, _ = leer_csv(os.path.join(DIR_PUNTOS, f + ".csv"))
        lin_r = [l for l in cab_r if l.startswith("# R: ")]
        lin_s = [l for l in cab_p if l.startswith("# semilla: ")]
        if len(lin_r) != 1 or len(lin_s) != 1:
            raise SystemExit(f"{f}: falta la linea «# R:» en _ref_r o «# semilla:» en _puntos")
        lin_r = lin_r[0] + "   (sessionInfo() completo en tests/fixtures/_sessioninfo_R.txt)"
        an = ARGUMENTOS[f]
        cols = (["id", "region"] + an + ["lower_tail", "ref_mp50", "ref_mp70", "ref_r", "dps_usado",
                "cifras_50_70", "ulps_r", "r_discrepa", "tercera_via", "ref_quad", "err_quad",
                "decision_manual", "origen", "estado", "valor_fuente", "cifras_fuente", "fuera_de_rango"]
                + [k + "_hex" for k in an] + ["ref_mp70_hex", "ref_r_hex"])
        buf = io.StringIO()
        buf.write(f"# funcion: {f}\n# fecha_generacion: {time.strftime('%Y-%m-%d')}\n")
        if LIMITE:
            buf.write(f"# PRUEBA --limite {LIMITE}: NO canonico, no se commitea\n")
        buf.write(cab[0] + "\n" + lin_r + "\n" + lin_s[0] + "\n")
        for l in cab[1:]:
            buf.write(l + "\n")
        buf.write(f"# K_ulps: {K}   umbral_cifras_50_70: {umbral}   cifras_quad: {CIFRAS_QUAD}\n")
        ok = [r for r in filas if r["estado"] == "OK"]
        buf.write(f"# filas_ok: {len(ok)}   filas_dificil: {len(filas) - len(ok)}   "
                  f"filas_r_discrepa: {sum(r['r_discrepa'] == '1' for r in filas)}   "
                  f"filas_dps_adaptativo: {sum(int(r['dps_usado'] or 50) > 50 for r in filas)}\n")
        w = csv.writer(buf, lineterminator="\n")
        w.writerow(cols)
        for r in ok:
            argh = dict(kv.split("=", 1) for kv in r["args"].split(";"))
            refr = "%.17g" % float.fromhex(r["ref_r_hex"]) if r["ref_r_hex"] else ""
            w.writerow([r["id"], r["region"]] + ["%.17g" % float.fromhex(argh[k]) for k in an]
                       + [r["lower_tail"], r["ref_mp50"], r["ref_mp70"], refr, r["dps_usado"],
                          r["cifras_50_70"], r["ulps_r"], r["r_discrepa"], r["tercera_via"], r["ref_quad"],
                          r["err_quad"], r["decision_manual"], r["origen"], r["estado"], r["valor_fuente"],
                          r["cifras_fuente"], r["fuera_de_rango"]]
                       + [argh[k] for k in an] + [r["ref_mp70_hex"], r["ref_r_hex"]])
        ruta = os.path.join(SALIDA_FIN, f + ".csv")
        with open(ruta, "w", encoding="utf-8", newline="") as fh:
            fh.write(buf.getvalue())
        print(f"{f:10} OK {len(ok):6}  DIFICIL {len(filas) - len(ok):5}  sha256 {sha256_archivo(ruta)}")
    with open(os.path.join(SALIDA_FIN, "_dificiles.csv"), "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh, lineterminator="\n")
        w.writerow(["funcion", "id", "region", "args_hex", "lower_tail", "ref_mp50", "ref_mp70",
                    "cifras_50_70", "ref_r_hex", "causa"])
        for f, r in dificiles:
            w.writerow([f, r["id"], r["region"], r["args"], r["lower_tail"], r["ref_mp50"], r["ref_mp70"],
                        r["cifras_50_70"], r["ref_r_hex"], r["causa_final"]])
    print(f"_dificiles.csv: {len(dificiles)} filas")
    return 0


def motor(n, comparar):
    os.makedirs(DIR_MOTOR, exist_ok=True)
    if comparar:
        a = os.path.join(DIR_MOTOR, "gmpy.csv")
        b = os.path.join(DIR_MOTOR, "python.csv")
        la = open(a, encoding="utf-8").read().splitlines()
        lb = open(b, encoding="utf-8").read().splitlines()
        da = [l for l in la if not l.startswith("#")]
        db = [l for l in lb if not l.startswith("#")]
        ta = [l for l in la if l.startswith("# segundos")]
        tb = [l for l in lb if l.startswith("# segundos")]
        dif = sum(1 for x, y in zip(da, db) if x != y)
        print(f"filas: {len(da)} / {len(db)}   distintas: {dif}")
        print(f"gmpy:   {ta}\npython: {tb}")
        return 0
    # muestra: por funcion, las n/2 filas de dps mas alto (por proxy) y n/2 repartidas de forma fija.
    # Proxy de dps alto: |log10| del valor de R; en las funciones sin R (§4.3), desde el argumento
    # (revisor, 13/10): gamma1pm1 -> min(|a|, |a-1|) pequeño (§4.4 b, llega a dps ~360);
    # erf -> |x| pequeño (valor ~ 2x/sqrt(pi)); erfc -> x grande (valor ~ e^(-x^2)).
    def peso(t):
        f = t["f"]
        try:
            if f == "gamma1pm1":
                a = float.fromhex(t["args_hex"]["a"])
                m = min(abs(a), abs(a - 1))
                return math.log10(m) if m > 0 else 0.0
            if f == "erf":
                x = abs(float.fromhex(t["args_hex"]["x"]))
                return math.log10(x) if x > 0 else 0.0
            if f == "erfc":
                x = float.fromhex(t["args_hex"]["x"])
                return -x * x / math.log(10) if x > 0 else 0.0
            v = float.fromhex(t["ref_r_hex"]) if t["ref_r_hex"] else 1.0
            return -abs(math.log10(abs(v))) if v != 0.0 and math.isfinite(v) else -400.0
        except (ValueError, OverflowError):
            return 0.0
    muestra = []
    for f in FUNCIONES:
        tareas = cargar(f)
        orden = sorted(tareas, key=lambda t: (peso(t), t["id"]))
        alto = orden[: n // 2]
        ids_alto = {t["id"] for t in alto}           # membresia por conjunto de id (revisor, 13/10)
        resto = [t for t in tareas if t["id"] not in ids_alto]
        paso = max(1, len(resto) // max(1, n - len(alto)))
        muestra += alto + resto[::paso][: n - len(alto)]
    t0 = time.time()
    res = [trabajar(t) for t in muestra]
    dt = time.time() - t0
    nombre = "gmpy" if mpmath.libmp.BACKEND == "gmpy" else "python"
    with open(os.path.join(DIR_MOTOR, nombre + ".csv"), "w", encoding="utf-8", newline="") as fh:
        fh.write(f"# motor: {mpmath.libmp.BACKEND}\n# segundos {dt:.1f}\n")
        for t, r in zip(muestra, res):
            fh.write(f"{t['f']},{t['id']},{r.get('ref_mp50', '')},{r.get('ref_mp70', '')},{r.get('dps_usado', '')}\n")
    print(f"motor {nombre}: {len(muestra)} filas en {dt:.1f} s")
    return 0


def huellas():
    """Cierre de corrida.bat: escribe tests/fixtures/_mpmath/_corrida_completa.txt con la fecha, el
    entorno y el SHA-256 de cada archivo producido, y lo imprime. No calcula nada."""
    lineas = [f"CORRIDA COMPLETA {time.strftime('%Y-%m-%d %H:%M:%S')}"] + [l.lstrip("# ") for l in cabecera_comun()]
    rutas = []
    for d in (DIR_PUNTOS, DIR_R, DIR_MP):       # los _corrida_<f>.txt llevan tiempos: no van
        if os.path.isdir(d):
            rutas += [os.path.join(d, n) for n in sorted(os.listdir(d)) if n.endswith(".csv")]
    rutas += [os.path.join(FIX, "_sessioninfo_R.txt"), os.path.join(DIR_MP, "_distribucion.txt")]
    for r in rutas:
        if os.path.exists(r):
            lineas.append(f"{sha256_archivo(r)}  {os.path.relpath(r, RAIZ).replace(os.sep, '/')}")
    texto = "\n".join(lineas) + "\n"
    with open(os.path.join(DIR_MP, "_corrida_completa.txt"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(texto)
    print(texto, end="")
    return 0


def main():
    ap = argparse.ArgumentParser(description="Referencias de mpmath para los fixtures de stats.js (plan §7, paso 3).")
    sub = ap.add_subparsers(dest="paso", required=True)
    a1 = sub.add_parser("calcular")
    a1.add_argument("--solo", help="una funcion (p. ej. erf)")
    a1.add_argument("--procesos", type=int, default=6)
    a1.add_argument("--limite", type=int, help="prueba: N filas por funcion, salida en tests/fixtures/_prueba/")
    a2 = sub.add_parser("distribucion")
    a2.add_argument("--solo")
    a2.add_argument("--limite", type=int, help="lee la prueba de tests/fixtures/_prueba/")
    a3 = sub.add_parser("cerrar")
    a3.add_argument("--K", type=int, required=True)
    a3.add_argument("--umbral-cifras", type=int, default=25)
    a3.add_argument("--procesos", type=int, default=6)
    a3.add_argument("--solo")
    a3.add_argument("--limite", type=int, help="prueba: lee y escribe en tests/fixtures/_prueba/")
    sub.add_parser("huellas")
    a4 = sub.add_parser("motor")
    a4.add_argument("--n", type=int, default=200)
    a4.add_argument("--comparar", action="store_true")
    args = ap.parse_args()
    if mpmath.__version__ != "1.3.0":
        print(f"AVISO: el plan fija mpmath 1.3.0 y este entorno tiene {mpmath.__version__}", file=sys.stderr)
    funcs = [args.solo] if getattr(args, "solo", None) else FUNCIONES
    if getattr(args, "limite", None):
        global SALIDA_MP, SALIDA_FIN, LIMITE
        LIMITE = args.limite
        SALIDA_FIN = os.path.join(FIX, "_prueba")
        SALIDA_MP = os.path.join(SALIDA_FIN, "_mpmath")
        os.makedirs(SALIDA_MP, exist_ok=True)
        print(f"PRUEBA --limite {LIMITE}: salida en {SALIDA_FIN} (no canonica)", flush=True)
    if args.paso == "calcular":
        calcular(funcs, args.procesos)
        return 0
    if args.paso == "distribucion":
        distribucion(funcs)
        return 0
    if args.paso == "cerrar":
        return cerrar(funcs, args.K, args.umbral_cifras, args.procesos)
    if args.paso == "motor":
        return motor(args.n, args.comparar)
    if args.paso == "huellas":
        return huellas()


if __name__ == "__main__":       # Windows arranca los procesos con spawn (§7.1)
    sys.exit(main())
