#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_puntos.py - Genera los PUNTOS (solo argumentos) de los fixtures de stats.js.

Plan: expediente/herramientas/stats-js_fixtures_plan.md (v3.1, PLAN CERRADO 13/10/2026), paso (1) de §7.
Escribe:  tests/fixtures/_puntos/<funcion>.csv   (id, region, argumentos, lower_tail, origen, valor_fuente,
                                                  argumentos en hexadecimal exacto: <arg>_hex)
          tests/fixtures/_puntos/_descartados.csv (puntos descartados, con la frontera y la causa)
No calcula ninguna referencia: eso lo hacen ref_r.R y ref_mpmath.py.

Uso (en el entorno conda `statsjs`, desde la raiz del repo):
    python tests/gen/gen_puntos.py --resumen    # cuenta puntos; NO escribe nada
    python tests/gen/gen_puntos.py --huella     # sha256 de cada CSV sin escribirlo (comparar maquinas)
    python tests/gen/gen_puntos.py              # valida todo y escribe los CSV

Reglas que este script respeta:
  - Solo biblioteca estandar de Python (sin numpy ni mpmath).
  - Todo el azar sale de random.Random(semilla) por funcion, y solo de rng.random().
  - Las fronteras y los valores representativos estan como DATOS en la seccion 2,
    con su folio. Ninguna frontera se inventa al vuelo fuera de esa seccion.
  - Las etiquetas de region salen de stats-js_tolerancias.md (columna `etiqueta`):
    si la lista del script y la de la tabla no coinciden exactamente, el script falla.
  - Cada punto se valida: su region existe, y sus argumentos caen en esa region
    segun la funcion de pertenencia de la seccion 3. Si un solo punto falla,
    el script se detiene con un mensaje y NO escribe ningun archivo.

Escrito por Cowork (Claude). La corrida canonica es la de Carlos; Cowork puede correrlo como prueba
de humo, nunca escribe en tests/fixtures/ (plan, añadido del 13/10).
"""

# Añadido 13/10 (v3): cada argumento va tambien en hexadecimal exacto (float.hex), en columnas <arg>_hex
# al final. Motivo: en Windows, sprintf("%.17g") de R no redondea bien la cifra 17 (verificado con
# -9.0660613713870177e-283, que R imprime ...176). El decimal %.17g sigue siendo la columna legible;
# el hexadecimal es el que leen ref_r.R y ref_mpmath.py, y no depende del redondeo de nadie.

import argparse
import csv
import hashlib
import io
import math
import os
import random
import re
import sys

# =====================================================================================
# 0. Constantes generales
# =====================================================================================

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
TOLERANCIAS_MD = os.path.join(RAIZ, "expediente", "herramientas", "stats-js_tolerancias.md")
SALIDA = os.path.join(RAIZ, "tests", "fixtures", "_puntos")

N_ALEATORIOS = 500             # por region de particion (plan §3.3)
N_ALEATORIOS_ENVOLTORIO = 200  # pchisq.csv y qchisq.csv (plan §1.2)
FACTORES = (1e-6, 1e-3, 1e-1)  # c*(1 +- f) (expediente, «Regla para elegir los puntos», regla 1)
INTENTOS_POR_PUNTO = 2000      # rechazo: tope de intentos por punto aceptado antes de fallar
BUSQUEDA_ULPS = 16             # busqueda del cambio exacto de region alrededor de c (en ulps)

INF = float("inf")
SQRT2 = math.sqrt(2.0)
LN10 = math.log(10.0)
EPS0_GAMMA = 0.25e-3           # e0 de DiDonato y Morris 1986, IND = 0 (folio 381, tabla (7))
BIG_GAMMA = 20.0               # BIG (idem)
X0_GAMMA = 31.0                # x0 (idem)

# Semillas: un entero por funcion (plan §3.3). Se anotan en la cabecera de cada CSV y en el expediente.
SEMILLAS = {
    "erf":       2026101301,
    "erfc":      2026101302,
    "pnorm":     2026101303,
    "qnorm":     2026101304,
    "pgamma":    2026101305,
    "qgamma":    2026101306,
    "pchisq":    2026101307,
    "qchisq":    2026101308,
    "pbeta":     2026101309,
    "pt":        2026101310,
    "qt":        2026101311,
    "lgamma":    2026101312,
    "gamma":     2026101313,
    "gamma1pm1": 2026101314,
}

# Argumentos de cada CSV, en este orden; lower_tail va siempre (vacio si no aplica).
ARGUMENTOS = {
    "erf": ["x"], "erfc": ["x"], "pnorm": ["z"], "qnorm": ["p"],
    "pgamma": ["x", "a"], "qgamma": ["p", "a"],
    "pchisq": ["x", "nu"], "qchisq": ["p", "nu"],
    "pbeta": ["x", "a", "b"], "pt": ["t", "n"], "qt": ["p", "n"],
    "lgamma": ["a"], "gamma": ["a"], "gamma1pm1": ["a"],
}
CON_COLA = {"pnorm", "qnorm", "pgamma", "qgamma", "pchisq", "qchisq", "pbeta", "pt", "qt"}

# =====================================================================================
# 1. Etiquetas (deben coincidir EXACTAMENTE con la columna `etiqueta` de stats-js_tolerancias.md)
#    tipo: particion | superpuesta | regla | vacia | pendiente  (ver el añadido del 13/10 en ese archivo)
# =====================================================================================

ETIQUETAS = {
    # erf (Cody 1969; solape firmado: rama 1 para |x| <= 0.46875)
    "erf_r1": ("erf", "particion"), "erf_r2": ("erf", "particion"), "erf_r3": ("erf", "particion"),
    # erfc
    "erfc_neg": ("erfc", "particion"), "erfc_r1": ("erfc", "particion"), "erfc_r2": ("erfc", "particion"),
    "erfc_r3": ("erfc", "particion"), "erfc_sub": ("erfc", "regla"),
    # pnorm
    "pnorm_r1": ("pnorm", "particion"), "pnorm_r2": ("pnorm", "particion"),
    "pnorm_cola": ("pnorm", "particion"), "pnorm_sub": ("pnorm", "regla"),
    # qnorm
    "qnorm_centro": ("qnorm", "particion"), "qnorm_colas": ("qnorm", "particion"),
    "qnorm_wichura": ("qnorm", "superpuesta"),
    # pgamma (DiDonato y Morris 1986, IND = 0)
    "pgamma_a05": ("pgamma", "particion"), "pgamma_serie9": ("pgamma", "particion"),
    "pgamma_q10": ("pgamma", "particion"), "pgamma_cf11_peq": ("pgamma", "particion"),
    "pgamma_suma14": ("pgamma", "particion"), "pgamma_s15": ("pgamma", "particion"),
    "pgamma_cf11_med": ("pgamma", "particion"), "pgamma_asin16": ("pgamma", "particion"),
    "pgamma_n19": ("pgamma", "particion"), "pgamma_temme": ("pgamma", "particion"),
    "pgamma_lejos": ("pgamma", "particion"), "pgamma_indet": ("pgamma", "vacia"),
    "pgamma_sub": ("pgamma", "regla"),
    # qgamma / qchisq
    "qgamma_todas": ("qgamma", "particion"), "qgamma_as91": ("qgamma", "superpuesta"),
    "qgamma_dm86": ("qgamma", "superpuesta"),
    # pbeta (TOMS 708, DiDonato y Morris 1992)
    "pbeta_bpser12": ("pbeta", "particion"), "pbeta_bpser13": ("pbeta", "particion"),
    "pbeta_bgrat14": ("pbeta", "particion"), "pbeta_bupbgrat15": ("pbeta", "particion"),
    "pbeta_bpser16": ("pbeta", "particion"), "pbeta_bupbpser17": ("pbeta", "particion"),
    "pbeta_bupbgrat18": ("pbeta", "particion"), "pbeta_bup2bgrat19": ("pbeta", "particion"),
    "pbeta_bfrac20": ("pbeta", "particion"), "pbeta_basym_aleb": ("pbeta", "particion"),
    "pbeta_basym_agtb": ("pbeta", "particion"), "pbeta_sub": ("pbeta", "regla"),
    # pt / qt
    "pt_todas": ("pt", "particion"), "qt_cerradas": ("qt", "particion"), "qt_ngt2": ("qt", "particion"),
    "qt_resto": ("qt", "particion"),
    # lgamma / gamma / auxiliar
    "lgamma_d": ("lgamma", "particion"), "lgamma_red": ("lgamma", "particion"),
    "lgamma_delta": ("lgamma", "particion"), "gamma_d": ("gamma", "particion"),
    "gamma_fuera": ("gamma", "pendiente"), "gamma1pm1_c": ("gamma1pm1", "particion"),
}
# pchisq y qchisq no tienen filas propias: heredan las etiquetas de pgamma y qgamma (plan §1.2).
ETIQUETAS_DE = {"pchisq": "pgamma", "qchisq": "qgamma"}

# =====================================================================================
# 2. DATOS: dominios, cotas de muestreo, fronteras, cruces, puntos publicados
# =====================================================================================
# Una «cota de muestreo» NO es una frontera de la tabla: es hasta donde se muestrea
# (por ejemplo, donde la funcion ya es 0 o ±1 en dobles). La regla 4 cubre lo que
# quede por debajo del menor double normal; esa decision la toma mpmath, no este script.

COTAS = {
    "erf_abs_max": 10.0,          # |x| > ~6: erf = ±1 en dobles
    "erfc_min": -10.0,            # x < ~-6: erfc = 2 en dobles
    "erfc_max": 30.0,             # erfc(x) cae bajo el menor subnormal antes de x = 30 (la regla 4 decide)
    "pnorm_abs_max": 40.0,        # Phi(-40) esta bajo el menor subnormal (idem)
    "p_min": 1e-300,              # plan §3.3
    "forma_min": 1e-3,            # parametros de forma: plan §3.3, [1e-3, 1e5]
    "forma_max": 1e5,
    "x_gamma_min": 1e-6,          # x minimo para pgamma con a < 20 (la serie (9) cubre x -> 0)
    "x_gamma_max": 800.0,         # Q(a, x) ya es 0 en dobles con a < 20
    "lambda_min": 1e-3,           # plan §3.3 (λ = x/a)
    "lambda_max": 1e3,
    "x_beta_min": 1e-10,          # limite inferior del tramo log-uniforme de x en pbeta
    "t_centro": 10.0,             # pt: |t| uniforme en [0, 10] ...
    "t_max": 1e10,                # ... y log-uniforme en [10, 1e10]
    "gamma_max": 171.0,           # Γ(a) desborda poco despues de a = 171.6
    "g1_log_min": 1e-300,         # gamma1pm1: |a| log-uniforme desde aqui (plan §4.4 b)
    "g1_d_min": 2.0 ** -52,       # gamma1pm1: |a - 1| log-uniforme desde 1 ulp de 1
}

# Fronteras. Cada entrada:
#   nombre, var (argumento que se mueve), c (numero, o funcion de los demas argumentos),
#   fijos (lista de dicts con los demas argumentos; un valor puede ser funcion de los ya puestos),
#   discreta (True: solo c y sus dos vecinos), folio (de donde sale la frontera).
# Para cada fijo se generan: c, c(1±1e-6), c(1±1e-3), c(1±1e-1), nextafter(c, ±inf),
# y ademas los dos doubles donde cambia de verdad la region (busqueda de ±16 ulps alrededor de c).


def _F(nombre, var, c, fijos, folio, discreta=False):
    return {"nombre": nombre, "var": var, "c": c, "fijos": fijos, "folio": folio, "discreta": discreta}


def _p(a, b):
    return a / (a + b)


def alfa_gamma(x):
    """α(x) de DiDonato y Morris 1986, (12): ln(sqrt(0.765))/ln(x) si x < 1/2; x/2.59 si x >= 1/2 (folio 380)."""
    if x < 0.5:
        return math.log(math.sqrt(0.765)) / math.log(x)
    return x / 2.59


FRONTERAS = {
    "erf": [
        _F("abs_x=0.46875", "x", 0.46875, [{}], "Cody 1969 f.631; Cody 1990 f.30 (solape firmado)"),
        _F("abs_x=0.46875_neg", "x", -0.46875, [{}], "idem, x negativo"),
        _F("abs_x=0.5", "x", 0.5, [{}], "Cody 1969 f.631 (fin del tramo 1 original)"),
        _F("abs_x=0.5_neg", "x", -0.5, [{}], "idem"),
        _F("abs_x=4", "x", 4.0, [{}], "Cody 1969 f.631"),
        _F("abs_x=4_neg", "x", -4.0, [{}], "idem"),
        # Cerca de 0 (decision del revisor, 13/10): erf ~ 2x/sqrt(pi); la rama 1 debe dar error RELATIVO
        # correcto, no absoluto. x = 0 y sus vecinos (±menor subnormal), ±1e-300, ±1e-20, ±1e-8.
        _F("x=0", "x", 0.0, [{}], "revisor 13/10 (erf cerca de 0)", discreta=True),
    ] + [
        _F("x=+-10^k", "x", s * c, [{}], "revisor 13/10 (erf cerca de 0)", discreta=True)
        for c in (1e-300, 1e-20, 1e-8) for s in (-1.0, 1.0)
    ],
    "erfc": [
        _F("x=-0.46875", "x", -0.46875, [{}], "Cody 1969 f.631 (relacion para negativos)"),
        _F("x=0.46875", "x", 0.46875, [{}], "Cody 1969 f.631; solape firmado"),
        _F("x=0.5", "x", 0.5, [{}], "Cody 1969 f.631"),
        _F("x=4", "x", 4.0, [{}], "Cody 1969 f.631"),
    ] + [
        # Multiplos de 1/16 en (4, 30]: x_hi = trunc(16x)/16 cambia ahi (diseño de e^(-x^2) firmado,
        # expediente §6.4; tolerancias, fila erfc_r3). Solo c y sus vecinos (expediente §6.4).
        _F("x=k/16", "x", k / 16.0, [{}], "expediente §6.4, diseño e^(-x^2)", discreta=True)
        for k in range(65, int(30 * 16) + 1)
    ] + [
        # erfc_r2 tambien usa el diseño de e^(-x^2) desde 0.46875 (decision del revisor, 13/10):
        # multiplos de 1/16 en (0.46875, 4), es decir k = 8 ... 63.
        _F("x=k/16(r2)", "x", k / 16.0, [{}], "revisor 13/10; expediente §6.4", discreta=True)
        for k in range(8, 64)
    ],
    "pnorm": [
        # Fronteras en x = |z|/sqrt(2). OJO: la operacion exacta (|z|/SQRT2) debe ser la misma que use
        # stats.js; la busqueda de ±16 ulps encuentra el double donde cambia la region con ESTA operacion.
        _F("abs_z/r2=0.46875", "z", 0.46875 * SQRT2, [{}], "tolerancias, filas de Phi"),
        _F("abs_z/r2=0.46875_neg", "z", -0.46875 * SQRT2, [{}], "idem"),
        _F("abs_z/r2=4", "z", 4.0 * SQRT2, [{}], "idem"),
        _F("abs_z/r2=4_neg", "z", -4.0 * SQRT2, [{}], "idem"),
    ] + [
        # Cola: z_hi = trunc(16 z)/16 (diseño desde z, tolerancias fila pnorm_cola). Solo la cola util:
        # z < 0 con lower_tail = 1 y z > 0 con lower_tail = 0 (la otra cola vale ~1 y no prueba nada).
        _F("z=k/16", "z", s * k / 16.0, [{"lower_tail": 1 if s < 0 else 0}],
           "tolerancias, fila pnorm_cola (z_hi = trunc(16z)/16)", discreta=True)
        for s in (-1, 1) for k in range(int(4 * SQRT2 * 16) + 1, int(40 * 16) + 1)
    ],
    "qnorm": [
        # |p - 0.5| = 0.425 (arranque, decision 5 condicion 2). Con p <= 0.5 la frontera es p = 0.5 - 0.425.
        _F("abs_q=0.425", "p", 0.5 - 0.425, [{}], "expediente decision 5 (c), cond. 2; tolerancias qnorm"),
        _F("p=0.5", "p", 0.5, [{}], "centro (simetria)", discreta=True),
        # Las fronteras r = 1.6, 5, 27 de AS 241 NO entran: son de sus aproximaciones racionales,
        # que no se usan (decision 5 (c)); la tabla de tolerancias no las lista.
    ],
    "pgamma": [
        _F("a=1", "a", 1.0, [{"x": v} for v in (0.05, 0.5, 1.0, 1.1, 2.0, 5.0, 31.0, 50.0)],
           "DM 1986 f.380-381 (a < 1 frente a 1 <= a < BIG)"),
        _F("a=1/2", "a", 0.5, [{"x": v} for v in (0.01, 0.2, 0.25, 0.3, 1.0, 10.0)],
           "DM 1986 (8) f.380", discreta=True),
        _F("x=1/4", "x", 0.25, [{"a": 0.5}], "DM 1986 (8) f.380 (P si x < 1/4, Q si x >= 1/4)"),
        _F("x=1.1", "x", 1.1, [{"a": v} for v in (0.001, 0.1, 0.7, 0.999)], "DM 1986 f.380"),
        _F("a=alfa(x)", "a", lambda f: alfa_gamma(f["x"]),
           [{"x": v} for v in (1e-4, 0.01, 0.1, 0.3, 0.49, 0.5, 0.51, 0.8, 1.0, 1.09)],
           "DM 1986 (12) f.380"),
        _F("x=1/2(alfa)", "x", 0.5, [{"a": v} for v in (0.05, 0.5 / 2.59, 0.3, 0.9)],
           "DM 1986 (12) f.380 (cambio de formula de α en x = 1/2)"),
        _F("a=BIG", "a", BIG_GAMMA, [{"x": v} for v in (5.0, 12.0, 19.99, 20.0, 25.0, 31.0, 40.0)],
           "DM 1986 f.381, BIG = 20"),
        _F("x=x0", "x", X0_GAMMA, [{"a": v} for v in (1.0, 1.5, 7.5, 10.3, 19.9, 20.0, 31.0 / 1.4, 25.0, 50.0)],
           "DM 1986 f.381, x0 = 31"),
        _F("x=a", "x", lambda f: f["a"], [{"a": v} for v in (1.0, 1.5, 2.0, 3.7, 7.5, 10.0, 19.5, 19.9)],
           "DM 1986 (14) f.381 (a <= x)"),
        _F("x=max(a,ln10)", "x", lambda f: max(f["a"], LN10),
           [{"a": v} for v in (1.0, 1.5, 2.0, 3.0, 10.2, 19.9)], "DM 1986 (15) f.381"),
    ] + [
        _F("2a_entero", "a", n / 2.0, [{"x": n / 2.0}, {"x": (n / 2.0 + X0_GAMMA) / 2.0}],
           "DM 1986 (14) f.381 (2a entero)", discreta=True)
        for n in range(2, 40)
    ] + [
        _F("sigma=e0/sqrt(a)_inf", "x", lambda f: f["a"] * (1.0 - EPS0_GAMMA / math.sqrt(f["a"])),
           [{"a": v} for v in (20.0, 21.0, 50.0, 100.0, 1e3, 1e4, 1e5)], "DM 1986 (19) f.381-382"),
        _F("sigma=e0/sqrt(a)_sup", "x", lambda f: f["a"] * (1.0 + EPS0_GAMMA / math.sqrt(f["a"])),
           [{"a": v} for v in (20.0, 21.0, 50.0, 100.0, 1e3, 1e4, 1e5)], "idem"),
        # σ = 0.4 coincide con λ = 0.6 y λ = 1.4 (σ = |1 - λ|): una sola frontera por lado.
        _F("sigma=0.4_inf(lambda=0.6)", "x", lambda f: 0.6 * f["a"],
           [{"a": v} for v in (20.0, 25.0, 100.0, 1e3, 1e4, 1e5)], "DM 1986 f.381-382"),
        _F("sigma=0.4_sup(lambda=1.4)", "x", lambda f: 1.4 * f["a"],
           [{"a": v} for v in (20.0, 22.0, 31.0 / 1.4, 25.0, 100.0, 1e3, 1e4, 1e5)], "idem"),
        # El borde de (20) (indeterminado) cae fuera del dominio muestreado: ver pgamma_indet.
    ],
    "pbeta": [
        # Fronteras de TOMS 708 (DM 1992, f.368-369), en coordenadas ya intercambiadas (x <= 1/2 si
        # mín(a,b) <= 1; x <= p si mín(a,b) > 1), salvo x = 1/2 y x = p, que son el intercambio mismo.
        _F("min(a,b)=1(a)", "a", 1.0,
           [{"b": b, "x": x} for b in (0.5, 2.0, 20.0, 200.0) for x in (0.05, 0.2, 0.4)], "DM 1992 f.368"),
        _F("min(a,b)=1(b)", "b", 1.0, [{"a": a, "x": x} for a in (0.5, 2.0, 50.0) for x in (0.05, 0.4)], "idem"),
        _F("max(a,b)=1(a)", "a", 1.0, [{"b": b, "x": x} for b in (0.1, 0.5, 0.9) for x in (0.05, 0.35)], "idem"),
        _F("max(a,b)=1(b)", "b", 1.0, [{"a": a, "x": x} for a in (0.1, 0.5) for x in (0.05, 0.35)], "idem"),
        _F("a=min(0.2,b)", "a", lambda f: min(0.2, f["b"]),
           [{"b": b, "x": x} for b in (0.1, 0.2, 0.5, 0.9) for x in (0.05, 0.2, 0.4)], "idem"),
        _F("x^a=0.9", "x", lambda f: 0.9 ** (1.0 / f["a"]),
           [{"a": a, "b": b} for a in (0.005, 0.01, 0.05, 0.1, 0.15) for b in (0.5, 0.9)], "idem"),
        _F("x=0.1", "x", 0.1,
           [{"a": a, "b": b} for a, b in ((0.5, 5.0), (0.5, 20.0), (0.9, 100.0), (0.2, 16.0))], "idem"),
        _F("x=0.3", "x", 0.3,
           [{"a": a, "b": b} for a, b in ((0.5, 5.0), (0.5, 20.0), (0.9, 100.0), (0.01, 0.5))], "idem"),
        _F("x=1/2(intercambio)", "x", 0.5,
           [{"a": a, "b": b} for a, b in ((0.5, 0.7), (0.5, 5.0), (3.0, 0.8), (0.1, 100.0))], "idem"),
        _F("(bx)^a=0.7", "x", lambda f: 0.7 ** (1.0 / f["a"]) / f["b"],
           [{"a": a, "b": b} for a, b in ((0.5, 20.0), (0.9, 10.0), (0.2, 16.0), (0.2, 15.0))], "idem"),
        _F("b=15", "b", 15.0, [{"a": a, "x": x} for a in (0.2, 0.8) for x in (0.05, 0.2)], "idem"),
        _F("bx=0.7", "x", lambda f: 0.7 / f["b"],
           [{"a": a, "b": b} for a, b in ((2.0, 5.0), (10.0, 20.0), (30.0, 39.0))], "DM 1992 f.369"),
        _F("x=0.7", "x", 0.7,
           [{"a": a, "b": b} for a, b in ((20.0, 3.0), (16.0, 5.0), (10.0, 2.0), (14.0, 4.0))], "idem"),
        _F("a=15", "a", 15.0, [{"b": 2.0, "x": 0.8}, {"b": 4.0, "x": 0.75}], "idem"),
        _F("b=40", "b", 40.0,
           [{"a": a, "x": (lambda r: (lambda f: r * _p(f["a"], f["b"])))(r)}
            for a in (30.0, 100.0, 150.0) for r in (0.5, 0.99)], "idem"),
        _F("a=100", "a", 100.0,
           [{"b": b, "x": (lambda r: (lambda f: r * _p(f["a"], f["b"])))(r)}
            for b in (150.0, 1000.0) for r in (0.9, 0.99)], "idem"),
        _F("b=100", "b", 100.0,
           [{"a": a, "x": (lambda s: (lambda f: 1.0 - s * (1.0 - _p(f["a"], f["b"]))))(s)}
            for a in (150.0, 1000.0) for s in (1.01, 1.1)], "idem"),
        _F("a=b", "a", lambda f: f["b"],
           [{"b": b, "x": (lambda r: (lambda f: r * _p(f["b"], f["b"])))(r)}
            for b in (50.0, 200.0, 5000.0) for r in (0.5, 0.98)], "idem"),
        _F("x=0.97p", "x", lambda f: 0.97 * _p(f["a"], f["b"]),
           [{"a": a, "b": b} for a, b in ((150.0, 200.0), (1000.0, 1000.0), (101.0, 5000.0), (5000.0, 1e5))],
           "idem"),
        _F("y=1.03q", "x", lambda f: 1.0 - 1.03 * (1.0 - _p(f["a"], f["b"])),
           [{"a": a, "b": b} for a, b in ((200.0, 150.0), (1000.0, 101.0), (1e5, 5000.0))], "idem"),
        _F("x=p(intercambio)", "x", lambda f: _p(f["a"], f["b"]),
           [{"a": a, "b": b} for a, b in ((2.0, 3.0), (50.0, 30.0), (150.0, 200.0), (3000.0, 1000.0))],
           "idem"),
        # x = 0 y x = 1 son los casos especiales (1)-(4) de DM 1992; no tienen fila en la tabla: no entran.
    ],
    "pt": [],   # pt_todas: una sola region (la forma de pbeta usada se decide al diseñar; tolerancias)
    "qt": [
        _F("n=1", "n", 1.0, [{"p": p} for p in (1e-300, 1e-10, 0.01, 0.25, 0.5)], "Hill 396 f.619", discreta=True),
        _F("n=2", "n", 2.0, [{"p": p} for p in (1e-300, 1e-10, 0.01, 0.25, 0.5)], "Hill 396 f.619", discreta=True),
    ],
    "lgamma": [
        _F("a=0.8", "a", 0.8, [{}], "DM 1986 Apendice D, f.379"),
        _F("a=2.25", "a", 2.25, [{}], "idem"),
        _F("a=15", "a", 15.0, [{}], "DM 1992 (24) f.370"),
        _F("a=8", "a", 8.0, [{}], "DM 1992 (25) f.370 (nota de la fila lgamma_delta)"),
        _F("a=1(cero)", "a", 1.0, [{}], "ceros exactos (tolerancias)", discreta=True),
        _F("a=2(cero)", "a", 2.0, [{}], "idem", discreta=True),
    ],
    "gamma": [
        _F("a=0.8", "a", 0.8, [{}], "DM 1986 Apendice D, f.379 (alternativa acordada, expediente §6.2)"),
        _F("a=2.25", "a", 2.25, [{}], "idem"),
    ],
    "gamma1pm1": [
        _F("a=-0.5", "a", -0.5, [{}], "DM 1986 Apendice C, f.379"),
        _F("a=1.5", "a", 1.5, [{}], "idem"),
        _F("a=0(cero)", "a", 0.0, [{}], "1/Γ(1) - 1 = 0 (plan §4.4 b)", discreta=True),
        _F("a=1(cero)", "a", 1.0, [{}], "1/Γ(2) - 1 = 0 (plan §4.4 b)", discreta=True),
    ],
}

# Cruces (plan §3.2): pares de fronteras (de FRONTERAS, por nombre) con los fijos restantes.
# Se combinan los puntos de ambas fronteras: hasta 9 x 9 por fijo.
CRUCES = {
    "pgamma": [
        ("a=BIG", "x=x0", [{}], "DM 1986 f.381 (a = BIG con x = x0)"),
        ("a=1/2", "x=1/4", [{}], "DM 1986 (8)"),
        ("a=1", "x=1.1", [{}], "DM 1986 f.380"),
        # Esquina σ = 0.4 (λ = 1.4) con x = x0: a = 31/1.4
        ("a=31/1.4", "x=x0", [{}], "DM 1986 f.381-382"),
    ],
    "pbeta": [
        ("b=40", "a=100", [{"x": lambda f: 0.99 * _p(f["a"], f["b"])}], "plan §3.2"),
        ("a=100", "x=0.97p", [{"b": 1000.0}], "plan §3.2"),
        ("b=100", "y=1.03q", [{"a": 1000.0}], "DM 1992 f.369"),
        ("b=15", "x=0.1", [{"a": 0.5}], "DM 1992 f.368"),
        ("a=15", "x=0.7", [{"b": 3.0}], "DM 1992 f.369"),
    ],
}
# Fronteras auxiliares que solo se usan en cruces (no generan puntos solas).
FRONTERAS_SOLO_CRUCE = {
    "pgamma": [_F("a=31/1.4", "a", 31.0 / 1.4, [{}], "esquina λ = 1.4 con x = x0")],
}

# Puntos publicados (plan §3.4): Wichura, AS 241, folio 480 (tal como estan impresos, sin espacios).
WICHURA = [
    {"p": 0.25, "lower_tail": 1, "valor_fuente": "-0.6744897501960817"},
    {"p": 0.001, "lower_tail": 1, "valor_fuente": "-3.090232306167814"},
    {"p": 1e-20, "lower_tail": 1, "valor_fuente": "-9.262340089798408"},
]

# Fronteras del arranque AS 91 (expediente §2; Best y Roberts 1975, f.385-386), en (P, ν), P = cola inferior.
# Decision 4 (arranque AS 91 o x0 de DM 1986) sigue abierta: si gana la x0 de 1986, sus fronteras
# (DM 1986 (21)-(36)) habra que añadirlas aqui y regenerar todo (plan §8).


def _wh_P_para_nu(nu):
    """P tal que z01 (Wilson-Hilferty) = 2.2ν + 6. Devuelve (cola, lower_tail) sin formar 1 - P."""
    c = 2.0 / (9.0 * nu)
    xq = (((2.2 * nu + 6.0) / nu) ** (1.0 / 3.0) - 1.0 + c) / math.sqrt(c)
    # Cola con erfc, nunca 1 - Phi ni (1 + erf)/2: en la cola eso da 0 por cancelacion.
    if xq <= 0:
        return 0.5 * math.erfc(-xq / SQRT2), 1
    return 0.5 * math.erfc(xq / SQRT2), 0


AS91 = (
    [("nu=0.32", "nu", 0.32, P) for P in (1e-10, 1e-3, 0.05, 0.5, 0.95, 0.999)]
    + [("nu=-1.24lnP", "nu", -1.24 * math.log(P), P) for P in (1e-200, 1e-50, 1e-10, 1e-3, 0.05, 0.3, 0.6)]
    + [("nu=5.6", "nu", 5.6, P) for P in (1e-10, 1e-3, 0.05, 0.5, 0.95)]
    + [("nu=-4.07lnP+12.21", "nu", -4.07 * math.log(P) + 12.21, P) for P in (1e-10, 1e-3, 0.05, 0.3, 0.6, 0.9)]
    + [("z01=2.2nu+6", "cola", nu, None) for nu in (0.5, 1.0, 2.0, 5.0, 10.0, 50.0, 200.0)]
    + [("P=2e-6", "cola", nu, "inf") for nu in (0.5, 2.0, 10.0, 100.0)]
    + [("P=1-2e-6", "cola", nu, "sup") for nu in (0.5, 2.0, 10.0, 100.0)]
)

# Fronteras del arranque de DiDonato y Morris 1986, §4, (21)-(36) (folios 383-386), leidas con los ojos
# el 13/10/2026 (lector ePDF de ACM y PDF renderizado con pdf.js). Decision del revisor (13/10): entran ya,
# como etiqueta superpuesta qgamma_dm86, para no regenerar todo si la decision 4 elige este arranque.
# Notacion del articulo: P = cola inferior, Q = cola superior, B = Q·Γ(a), c = 0.57721... (Euler).
#   a < 1 (f.383-384): (21) si B > .6 o (B >= .45 y a >= .3); u = [PΓ(a+1)]^(1/a) si BQ > 1e-8;
#     (22) si a < .3 y .35 <= B <= .6; (23) si .15 <= B < .35 o (.15 <= B < .45 y a >= .3);
#     (24) si .01 < B < .15; (25) si B <= .01; si B <= 1e-28, (25) ya da 10 cifras.  a = 1: x = -ln Q (f.383).
#   a > 1 (f.385-386): w = Cornish-Fisher de 6 terminos (31), s por el minimax (32), cambio en P = 1/2;
#     si a >= 500 y |1 - w/a| < 1e-6, x = w (sin iterar); P > 1/2: x0 = w si w < 3a; si no, D = máx(2, a(a-1)),
#     (25) si B <= 10^-D, (33) si B > 10^-D;  P <= 1/2: z = w si w > .15(a+1); si no, z por (34)-(35);
#     x = z si z <= .002(a+1); x0 = z si .002(a+1) < z <= .01(a+1) o z > .7(a+1); (36) si .01(a+1) < z <= .7(a+1).
# Las fronteras que dependen de w o de z se localizan en dobles, por biseccion sobre la probabilidad;
# son del ARRANQUE (cambian iteraciones, no el resultado), asi que una ubicacion aproximada basta.

DM86_A = (3.31125922108741, 11.6616720288968, 4.28342155967104, .213623493715853)          # (32), f.385
DM86_B = (6.61053765625462, 6.40691597760039, 1.27364489782223, .361170810188420E-1)       # (32), f.385


def dm86_s(P, Q):
    """(32): s = (-1)^m [t - (a0 + a1 t + a2 t^2 + a3 t^3)/(1 + b1 t + b2 t^2 + b3 t^3 + b4 t^4)], t = sqrt(-2 ln τ)."""
    if P < 0.5:
        tau, m = P, 1
    else:
        tau, m = Q, 0
    t = math.sqrt(-2.0 * math.log(tau))
    a0, a1, a2, a3 = DM86_A
    b1, b2, b3, b4 = DM86_B
    v = t - (a0 + t * (a1 + t * (a2 + t * a3))) / (1.0 + t * (b1 + t * (b2 + t * (b3 + t * b4))))
    return -v if m == 1 else v


def dm86_w(a, P, Q):
    """(31): Cornish-Fisher de 6 terminos (f.385)."""
    s = dm86_s(P, Q)
    ra = math.sqrt(a)
    return (a + s * ra + (s * s - 1.0) / 3.0 + (s ** 3 - 7.0 * s) / (36.0 * ra)
            - (3.0 * s ** 4 + 7.0 * s * s - 16.0) / (810.0 * a)
            + (9.0 * s ** 5 + 256.0 * s ** 3 - 433.0 * s) / (38880.0 * a * ra))


def dm86_z(a, P):
    """(34)-(35), para P <= 1/2 (f.386)."""
    w = dm86_w(a, P, 1.0 - P)
    if w > 0.15 * (a + 1.0):
        return w
    v = math.log(P) + math.lgamma(a + 1.0)

    def S(n, x):
        tot, term = 1.0, 1.0
        for i in range(1, n + 1):
            term *= x / (a + i)
            tot += term
        return tot

    def F(n, x):
        return math.exp((v + x - math.log(S(n, x))) / a)
    u1 = F(0, w)
    u2 = F(2, u1)
    u3 = F(2, u2)
    return F(3, u3)


def biseccion_log(f, lo, hi, iters=200):
    """Raiz de f en [lo, hi] (lo, hi > 0) por biseccion en escala logaritmica. None si no hay cambio de signo."""
    flo, fhi = f(lo), f(hi)
    if flo == 0:
        return lo
    if (flo > 0) == (fhi > 0):
        return None
    for _ in range(iters):
        mid = math.sqrt(lo * hi)
        if mid == lo or mid == hi:
            break
        fm = f(mid)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return math.sqrt(lo * hi)


def _dm86_lista():
    """Devuelve (nombre, a, prob, cual) con cual = 'P' (cola inferior) o 'Q' (cola superior); prob = None si
    la frontera no se pudo localizar (se registra como descarte con su causa)."""
    L = []
    g = math.gamma
    for a in (0.01, 0.1, 0.29, 0.31, 0.5, 0.9):
        L.append(("B=0.6", a, 0.6 / g(a), "Q"))
    for a in (0.3, 0.31, 0.5, 0.9):
        L.append(("B=0.45(a>=0.3)", a, 0.45 / g(a), "Q"))
    for a in (0.01, 0.1, 0.29):
        L.append(("B=0.35(a<0.3)", a, 0.35 / g(a), "Q"))
    for k in (0.15, 0.01, 1e-28):
        for a in (0.01, 0.1, 0.5, 0.9):
            L.append((f"B={k:g}", a, k / g(a), "Q"))
    for a in (0.01, 0.1, 0.5, 0.9):
        L.append(("BQ=1e-8", a, math.sqrt(1e-8 / g(a)), "Q"))
    for a in (1.5, 10.0, 100.0, 1e4):
        L.append(("P=1/2", a, 0.5, "P"))
    for a in (1.5, 2.0, 3.0, 5.0, 10.0, 15.0):
        D = max(2.0, a * (a - 1.0))
        L.append(("B=10^-D", a, 10.0 ** (-D) / g(a), "Q"))
    for a in (1.5, 2.0, 5.0, 20.0, 100.0):      # P > 1/2: w = 3a (w decrece con Q)
        q = biseccion_log(lambda Q: dm86_w(a, 1.0 - Q, Q) - 3.0 * a, 1e-300, 0.5)
        L.append(("w=3a", a, q, "Q"))
    for a in (500.0, 1000.0, 1e4, 1e5):         # |1 - w/a| = 1e-6, a ambos lados de w = a
        for sgn in (-1.0, 1.0):
            objetivo = a * (1.0 + sgn * 1e-6)
            pp = biseccion_log(lambda P: dm86_w(a, P, 1.0 - P) - objetivo, 1e-300, 0.5)
            if pp is not None:
                L.append(("abs(1-w/a)=1e-6", a, pp, "P"))
            else:
                qq = biseccion_log(lambda Q: objetivo - dm86_w(a, 1.0 - Q, Q), 1e-300, 0.5)
                L.append(("abs(1-w/a)=1e-6", a, qq, "Q"))
    for a in (1.5, 3.0, 10.0, 50.0, 200.0):     # P <= 1/2: w = .15(a+1)
        L.append(("w=0.15(a+1)", a,
                  biseccion_log(lambda P: dm86_w(a, P, 1.0 - P) - 0.15 * (a + 1.0), 1e-300, 0.5), "P"))
    for k in (0.002, 0.01, 0.7):                # P <= 1/2: z = k(a+1)
        for a in (1.5, 3.0, 10.0, 50.0):
            L.append((f"z={k:g}(a+1)", a,
                      biseccion_log(lambda P: dm86_z(a, P) - k * (a + 1.0), 1e-300, 0.5), "P"))
    return L


# Variaciones de a alrededor de 1, 0.3 y 500 (fronteras en el parametro, f.383-385).
DM86_EN_A = [
    ("a=1", 1.0, [("P", P) for P in (1e-10, 0.01, 0.3)] + [("Q", Q) for Q in (0.3, 1e-10)]),
    ("a=0.3", 0.3, [("Q", 0.5 / math.gamma(0.3)), ("Q", 0.4 / math.gamma(0.3))]),
    ("a=500", 500.0, [("P", 0.5), ("P", 0.3), ("Q", 0.3)]),
]


def generar_dm86(col, funcion):
    def emitir(a, prob, cual, nombre):
        lt = 1 if cual == "P" else 0
        if prob is None or not (0.0 < prob):
            col.descartar({"p": float("nan"), ("nu" if funcion == "qchisq" else "a"):
                           (2.0 * a if funcion == "qchisq" else a)}, lt, "frontera", "DM86 " + nombre,
                          "frontera no localizada (sin cambio de signo en la biseccion o fuera de rango)")
            return
        if prob > 0.5:                      # se expresa siempre por la cola <= 1/2
            prob, lt = 1.0 - prob, 1 - lt
        args = {"p": prob, "nu": 2.0 * a} if funcion == "qchisq" else {"p": prob, "a": a}
        if region_de(funcion, args) is None:
            col.descartar(args, lt, "frontera", "DM86 " + nombre, "fuera del dominio")
            return
        col.agregar(args, "qgamma_dm86", "frontera", lt)

    for nombre, a, prob, cual in _dm86_lista():
        if prob is None:
            emitir(a, None, cual, nombre)
            continue
        for v in puntos_de_frontera(prob, False):
            emitir(a, v, cual, nombre)
    for nombre, c, fijos in DM86_EN_A:
        for cual, prob in fijos:
            for a in puntos_de_frontera(c, False):
                emitir(a, prob, cual, nombre)


# =====================================================================================
# 3. Funciones de pertenencia: region_de(funcion, args) -> etiqueta o None (fuera del dominio)
#    Cada una transcribe la condicion exacta de su fila en stats-js_tolerancias.md / expediente.
# =====================================================================================


def region_erf(x):
    ax = abs(x)
    if not (ax <= COTAS["erf_abs_max"]):
        return None
    if ax <= 0.46875:
        return "erf_r1"
    if ax <= 4.0:
        return "erf_r2"
    return "erf_r3"


def region_erfc(x):
    if not (COTAS["erfc_min"] <= x <= COTAS["erfc_max"]):
        return None
    if x < -0.46875:
        return "erfc_neg"
    if abs(x) <= 0.46875:
        return "erfc_r1"
    if x <= 4.0:
        return "erfc_r2"
    return "erfc_r3"


def region_pnorm(z):
    if not (abs(z) <= COTAS["pnorm_abs_max"]):
        return None
    xx = abs(z) / SQRT2
    if xx <= 0.46875:
        return "pnorm_r1"
    if xx <= 4.0:
        return "pnorm_r2"
    return "pnorm_cola"


def region_qnorm(p):
    # p es la probabilidad de la cola pedida (lower_tail), 0 < p <= 0.5 (plan §3.3).
    if not (0.0 < p <= 0.5):
        return None
    if abs(p - 0.5) <= 0.425:
        return "qnorm_centro"
    return "qnorm_colas"


def region_pgamma(x, a):
    """DiDonato y Morris 1986, §3 y Fig. 2 (folios 380-383), IND = 0. Cascada en el orden de la tabla."""
    if not (COTAS["forma_min"] <= a <= COTAS["forma_max"]) or not (x > 0.0) or math.isinf(x):
        return None
    if a == 0.5:
        return "pgamma_a05"
    if a < 1.0:
        if x < 1.1:
            return "pgamma_serie9" if a >= alfa_gamma(x) else "pgamma_q10"
        return "pgamma_cf11_peq"
    if a < BIG_GAMMA:
        if (a <= x < X0_GAMMA) and (2.0 * a == math.floor(2.0 * a)):
            return "pgamma_suma14"
        if x <= max(a, LN10):
            return "pgamma_s15"
        if x < X0_GAMMA:
            return "pgamma_cf11_med"
        return "pgamma_asin16"
    sigma = abs(1.0 - x / a)
    if sigma <= EPS0_GAMMA / math.sqrt(a):
        return "pgamma_n19"
    if sigma <= 0.4:
        return "pgamma_temme"
    return "pgamma_lejos"


def region_qgamma(p, a):
    if not (0.0 < p <= 0.5) or not (COTAS["forma_min"] <= a <= COTAS["forma_max"]):
        return None
    return "qgamma_todas"


def region_pbeta(x, a, b):
    """TOMS 708 (DiDonato y Morris 1992, folios 368-369). p = a/(a+b), q = 1 - p, y = 1 - x."""
    fmin, fmax = COTAS["forma_min"], COTAS["forma_max"]
    if not (fmin <= a <= fmax and fmin <= b <= fmax and 0.0 < x < 1.0):
        return None
    y = 1.0 - x
    if min(a, b) <= 1.0:
        if x > 0.5:                       # intercambio a<->b, x<->y
            a, b, x, y = b, a, y, x
        if max(a, b) <= 1.0:
            if a >= min(0.2, b):
                return "pbeta_bpser12"
            if x ** a <= 0.9:
                return "pbeta_bpser12"
            if x >= 0.3:
                return "pbeta_bpser13"
            return "pbeta_bupbgrat15"
        # max(a, b) > 1
        if b <= 1.0:
            return "pbeta_bpser12"
        if x >= 0.3:
            return "pbeta_bpser13"
        if x < 0.1:
            if (b * x) ** a <= 0.7:
                return "pbeta_bpser12"
            return "pbeta_bgrat14" if b > 15.0 else "pbeta_bupbgrat15"
        return "pbeta_bgrat14" if b > 15.0 else "pbeta_bupbgrat15"   # 0.1 <= x < 0.3
    # min(a, b) > 1
    p = a / (a + b)
    if x > p:                             # intercambio
        a, b, x, y = b, a, y, x
        p = a / (a + b)
    q = 1.0 - p
    if b < 40.0:
        if b * x <= 0.7:
            return "pbeta_bpser16"
        if x <= 0.7:
            return "pbeta_bupbpser17"
        return "pbeta_bupbgrat18" if a > 15.0 else "pbeta_bup2bgrat19"
    # b >= 40
    if a <= b:
        if a <= 100.0:
            return "pbeta_bfrac20"
        return "pbeta_bfrac20" if x < 0.97 * p else "pbeta_basym_aleb"
    if b <= 100.0:
        return "pbeta_bfrac20"
    return "pbeta_bfrac20" if y > 1.03 * q else "pbeta_basym_agtb"


def region_pt(t, n):
    if not (COTAS["forma_min"] <= n <= COTAS["forma_max"]) or not (abs(t) <= COTAS["t_max"]):
        return None
    return "pt_todas"


def region_qt(p, n):
    if not (0.0 < p <= 0.5):
        return None
    if n == 1.0 or n == 2.0:
        return "qt_cerradas"
    if 2.0 < n <= COTAS["forma_max"]:
        return "qt_ngt2"
    if COTAS["forma_min"] <= n < 2.0:
        return "qt_resto"       # 0 < n < 2, n != 1 (fila añadida el 13/10)
    return None


def region_lgamma(a):
    if not (COTAS["forma_min"] <= a <= COTAS["forma_max"]):
        return None
    if 0.8 <= a <= 2.25:
        return "lgamma_d"
    if a < 15.0:
        return "lgamma_red"
    return "lgamma_delta"


def region_gamma(a):
    if not (COTAS["forma_min"] <= a <= COTAS["gamma_max"]):
        return None
    if 0.8 <= a <= 2.25:
        return "gamma_d"
    return "gamma_fuera"


def region_gamma1pm1(a):
    if -0.5 <= a <= 1.5:
        return "gamma1pm1_c"
    return None


def region_de(funcion, args):
    f = ETIQUETAS_DE.get(funcion, funcion)
    if funcion == "pchisq":
        return region_pgamma(args["x"] / 2.0, args["nu"] / 2.0)
    if funcion == "qchisq":
        return region_qgamma(args["p"], args["nu"] / 2.0)
    return {
        "erf": lambda: region_erf(args["x"]),
        "erfc": lambda: region_erfc(args["x"]),
        "pnorm": lambda: region_pnorm(args["z"]),
        "qnorm": lambda: region_qnorm(args["p"]),
        "pgamma": lambda: region_pgamma(args["x"], args["a"]),
        "qgamma": lambda: region_qgamma(args["p"], args["a"]),
        "pbeta": lambda: region_pbeta(args["x"], args["a"], args["b"]),
        "pt": lambda: region_pt(args["t"], args["n"]),
        "qt": lambda: region_qt(args["p"], args["n"]),
        "lgamma": lambda: region_lgamma(args["a"]),
        "gamma": lambda: region_gamma(args["a"]),
        "gamma1pm1": lambda: region_gamma1pm1(args["a"]),
    }[f]()

# =====================================================================================
# 4. Muestreo aleatorio (plan §3.3, reparto por region)
# =====================================================================================


def unif(rng, lo, hi):
    return lo + (hi - lo) * rng.random()


def logu(rng, lo, hi):
    return lo * math.exp(rng.random() * math.log(hi / lo))


def escala(rng, lo, hi):
    """Regla de reparto (plan §3.3, v3): si [lo, hi] abarca menos de una decada, uniforme;
    si abarca mas, mitad uniforme y mitad log-uniforme dentro de [lo, hi]. Requiere lo > 0.
    Nota para el revisor: con 8 decadas (forma en [1e-3, 1e5]) la mitad uniforme cae casi
    toda en la decada superior. Es lo que dice la regla; si no se quiere, se cambia aqui."""
    if hi / lo <= 10.0:
        return unif(rng, lo, hi)
    return unif(rng, lo, hi) if rng.random() < 0.5 else logu(rng, lo, hi)


def p_dominio(rng):
    """p para una region que cubre todo (0, 0.5]: mitad uniforme en (0, 0.5), mitad log-uniforme en
    [1e-300, 1e-3] (plan §3.3, v2)."""
    if rng.random() < 0.5:
        while True:
            v = unif(rng, 0.0, 0.5)
            if v > 0.0:
                return v
    return logu(rng, COTAS["p_min"], 1e-3)


def p_rango(rng, lo, hi):
    """p dentro del rango de una region [lo, hi] (regla de reparto)."""
    return escala(rng, lo, hi)


def con_signo(rng, v):
    return v if rng.random() < 0.5 else -v


def _forma(rng, lo=None, hi=None):
    return escala(rng, lo or COTAS["forma_min"], hi or COTAS["forma_max"])


def _pbeta_min_le1(rng):
    # min(a, b) <= 1: un parametro en [1e-3, 1], el otro en [1e-3, 1e5]; x en (0, 1)
    s = escala(rng, COTAS["forma_min"], 1.0)
    o = _forma(rng)
    a, b = (s, o) if rng.random() < 0.5 else (o, s)
    x = unif(rng, 0.0, 1.0) if rng.random() < 0.5 else logu(rng, COTAS["x_beta_min"], 1.0)
    return {"x": x, "a": a, "b": b}


def _pbeta_min_gt1(rng):
    a = _forma(rng, 1.0)
    b = _forma(rng, 1.0)
    x = unif(rng, 0.0, 1.0) if rng.random() < 0.5 else logu(rng, COTAS["x_beta_min"], 1.0)
    return {"x": x, "a": a, "b": b}


def _presentar_intercambiado(rng, d):
    """Con probabilidad 1/2 presenta el punto como (b, a, 1 - x): prueba el intercambio de TOMS 708.
    La region se vuelve a calcular con los argumentos presentados (pertenencia), no se supone."""
    if rng.random() < 0.5:
        return {"x": 1.0 - d["x"], "a": d["b"], "b": d["a"]}
    return d


def _pbeta_cerca_p(rng):
    # Rincon de BFRAC con a o b muy grandes y x ~ p (58 terminos, DM 1992 f.372)
    a = _forma(rng, 40.0)
    b = _forma(rng, 40.0)
    p = _p(a, b)
    return _presentar_intercambiado(rng, {"x": p * (1.0 - 0.05 * rng.random()), "a": a, "b": b})


def _pbeta_basym_aleb(rng):
    a = _forma(rng, 100.0)
    b = escala(rng, a, COTAS["forma_max"]) if a < COTAS["forma_max"] else a
    p = _p(a, b)
    return _presentar_intercambiado(rng, {"x": unif(rng, 0.97 * p, p), "a": a, "b": b})


def _pbeta_basym_agtb(rng):
    b = _forma(rng, 100.0)
    a = escala(rng, b, COTAS["forma_max"]) if b < COTAS["forma_max"] else b
    q = 1.0 - _p(a, b)
    y = unif(rng, q, 1.03 * q)
    return _presentar_intercambiado(rng, {"x": 1.0 - y, "a": a, "b": b})


def _pbeta_x_alto(a_lo, a_hi):
    """(18)/(19): b < 40, x > 0.7 con x <= p, asi que p > 0.7, es decir b < 3a/7. Propuesta en coordenadas
    ya intercambiadas; la mitad se presenta intercambiada."""
    def gen(rng):
        a = escala(rng, a_lo, a_hi)
        b = escala(rng, 1.0, min(40.0, 3.0 * a / 7.0))
        p = _p(a, b)
        return _presentar_intercambiado(rng, {"x": unif(rng, 0.7, p), "a": a, "b": b})
    return gen


def _mezcla(*opciones):
    """Propuesta mezcla: lista de (peso, generador)."""
    total = float(sum(w for w, _ in opciones))

    def gen(rng):
        u = rng.random() * total
        for w, g in opciones:
            if u < w:
                return g(rng)
            u -= w
        return opciones[-1][1](rng)
    return gen


def _pg(a_gen, x_gen):
    def gen(rng):
        a = a_gen(rng)
        return {"a": a, "x": x_gen(rng, a)}
    return gen


def _lejos_x(rng, a):
    if rng.random() < 0.5:
        return a * escala(rng, COTAS["lambda_min"], 0.6)
    return a * escala(rng, 1.4, COTAS["lambda_max"])


def _temme_x(rng, a):
    lo = EPS0_GAMMA / math.sqrt(a)
    s = escala(rng, lo, 0.4)
    return a * (1.0 + con_signo(rng, s))


def _n19_x(rng, a):
    lo = EPS0_GAMMA / math.sqrt(a)
    return a * (1.0 + unif(rng, -lo, lo))


# Propuesta por region: generador de argumentos (sin lower_tail). Se acepta un punto solo si
# region_de(...) devuelve exactamente la etiqueta de la region (rechazo).
PROPUESTAS = {
    "erf_r1": lambda r: {"x": unif(r, -0.46875, 0.46875)},
    "erf_r2": lambda r: {"x": con_signo(r, unif(r, 0.46875, 4.0))},
    "erf_r3": lambda r: {"x": con_signo(r, unif(r, 4.0, COTAS["erf_abs_max"]))},
    "erfc_neg": lambda r: {"x": -escala(r, 0.46875, -COTAS["erfc_min"])},
    "erfc_r1": lambda r: {"x": unif(r, -0.46875, 0.46875)},
    "erfc_r2": lambda r: {"x": unif(r, 0.46875, 4.0)},
    "erfc_r3": lambda r: {"x": unif(r, 4.0, COTAS["erfc_max"])},
    "pnorm_r1": lambda r: {"z": unif(r, -0.46875 * SQRT2, 0.46875 * SQRT2)},
    "pnorm_r2": lambda r: {"z": con_signo(r, unif(r, 0.46875 * SQRT2, 4.0 * SQRT2))},
    "pnorm_cola": lambda r: {"z": con_signo(r, unif(r, 4.0 * SQRT2, COTAS["pnorm_abs_max"]))},
    "qnorm_centro": lambda r: {"p": p_rango(r, 0.5 - 0.425, 0.5)},
    "qnorm_colas": lambda r: {"p": p_rango(r, COTAS["p_min"], 0.5 - 0.425)},
    "pgamma_a05": lambda r: {"a": 0.5, "x": escala(r, COTAS["x_gamma_min"], COTAS["x_gamma_max"])},
    "pgamma_serie9": _pg(lambda r: escala(r, COTAS["forma_min"], 1.0),
                         lambda r, a: escala(r, COTAS["x_gamma_min"], 1.1)),
    "pgamma_q10": _pg(lambda r: escala(r, COTAS["forma_min"], 1.0),
                      lambda r, a: escala(r, COTAS["x_gamma_min"], 1.1)),
    "pgamma_cf11_peq": _pg(lambda r: escala(r, COTAS["forma_min"], 1.0),
                           lambda r, a: escala(r, 1.1, COTAS["x_gamma_max"])),
    "pgamma_suma14": _pg(lambda r: math.floor(unif(r, 2.0, 40.0)) / 2.0,
                         lambda r, a: escala(r, a, X0_GAMMA)),
    "pgamma_s15": _pg(lambda r: escala(r, 1.0, BIG_GAMMA),
                      lambda r, a: escala(r, COTAS["x_gamma_min"], max(a, LN10))),
    "pgamma_cf11_med": _pg(lambda r: escala(r, 1.0, BIG_GAMMA),
                           lambda r, a: unif(r, max(a, LN10), X0_GAMMA)),
    "pgamma_asin16": _pg(lambda r: escala(r, 1.0, BIG_GAMMA),
                         lambda r, a: escala(r, X0_GAMMA, COTAS["x_gamma_max"])),
    "pgamma_n19": _pg(lambda r: escala(r, BIG_GAMMA, COTAS["forma_max"]), _n19_x),
    "pgamma_temme": _pg(lambda r: escala(r, BIG_GAMMA, COTAS["forma_max"]), _temme_x),
    "pgamma_lejos": _pg(lambda r: escala(r, BIG_GAMMA, COTAS["forma_max"]), _lejos_x),
    "qgamma_todas": lambda r: {"p": p_dominio(r), "a": _forma(r)},
    "pbeta_bpser12": _pbeta_min_le1, "pbeta_bpser13": _pbeta_min_le1,
    "pbeta_bgrat14": _pbeta_min_le1, "pbeta_bupbgrat15": _pbeta_min_le1,
    "pbeta_bpser16": _pbeta_min_gt1, "pbeta_bupbpser17": _pbeta_min_gt1,
    "pbeta_bupbgrat18": _mezcla((1, _pbeta_min_gt1), (1, _pbeta_x_alto(15.0, COTAS["forma_max"]))),
    "pbeta_bup2bgrat19": _pbeta_x_alto(7.0 / 3.0, 15.0),
    "pbeta_bfrac20": _mezcla((1, _pbeta_min_gt1), (1, _pbeta_cerca_p)),
    "pbeta_basym_aleb": _pbeta_basym_aleb,
    "pbeta_basym_agtb": _pbeta_basym_agtb,
    # pt: |t| mitad uniforme en [0, 10], mitad log-uniforme en [10, 1e10], signo al azar.
    # PROPUESTA de Cowork: la regla de reparto no dice que hacer con un argumento que cruza el cero
    # en una region unica que incluye las colas.
    "pt_todas": lambda r: {"n": _forma(r), "t": con_signo(r, unif(r, 0.0, COTAS["t_centro"])
                                                     if r.random() < 0.5 else
                                                     logu(r, COTAS["t_centro"], COTAS["t_max"]))},
    "qt_cerradas": lambda r: {"n": 1.0 if r.random() < 0.5 else 2.0, "p": p_dominio(r)},
    "qt_ngt2": lambda r: {"n": escala(r, 2.0, COTAS["forma_max"]), "p": p_dominio(r)},
    "qt_resto": lambda r: {"n": escala(r, COTAS["forma_min"], 2.0), "p": p_dominio(r)},
    "lgamma_d": lambda r: {"a": unif(r, 0.8, 2.25)},
    "lgamma_red": lambda r: {"a": escala(r, COTAS["forma_min"], 0.8) if r.random() < 0.5 else unif(r, 2.25, 15.0)},
    "lgamma_delta": lambda r: {"a": escala(r, 15.0, COTAS["forma_max"])},
    "gamma_d": lambda r: {"a": unif(r, 0.8, 2.25)},
    "gamma_fuera": lambda r: {"a": escala(r, COTAS["forma_min"], 0.8) if r.random() < 0.5
                              else escala(r, 2.25, COTAS["gamma_max"])},
    # gamma1pm1: mitad uniforme en [-0.5, 1.5]; un cuarto con |a| log-uniforme en [1e-300, 0.1] (cero en
    # a = 0); un cuarto con a = 1 ± d, d log-uniforme en [2^-52, 0.1] (cero en a = 1). Plan §4.4 b.
    "gamma1pm1_c": lambda r: {"a": (unif(r, -0.5, 1.5) if r.random() < 0.5 else
                                    (con_signo(r, logu(r, COTAS["g1_log_min"], 0.1)) if r.random() < 0.5 else
                                     1.0 + con_signo(r, logu(r, COTAS["g1_d_min"], 0.1))))},
}

# Regiones con forma cerrada (plan §3.4): valor_fuente lleva la formula; ref_mpmath.py la evalua.
# Hill 396 (f.619) da t = cot(Pπ/2) (n = 1) y t² = 2/(P(2-P)) - 2 (n = 2) con P = probabilidad de DOS colas.
# Aqui p es la cola pedida (p <= 0.5), asi que P = 2p; el signo es - si lower_tail = 1 y + si lower_tail = 0.
def _qt_cerrada(d, lt):
    s = "-" if lt == 1 else ""
    if d["n"] == 1.0:
        return s + "cot(pi*p)"
    return s + "sqrt(2/(2*p*(2-2*p))-2)"


FORMA_CERRADA = {"qt_cerradas": _qt_cerrada}

# =====================================================================================
# 5. Generacion
# =====================================================================================


class ErrorGenerador(Exception):
    pass


def puntos_de_frontera(c, discreta):
    if discreta:
        vals = [c, math.nextafter(c, -INF), math.nextafter(c, INF)]
    else:
        vals = [c]
        for f in FACTORES:
            vals += [c * (1.0 - f), c * (1.0 + f)]
        vals += [math.nextafter(c, -INF), math.nextafter(c, INF)]
    return vals


def cambio_exacto(funcion, args, var, c):
    """Busca, a ±BUSQUEDA_ULPS de c, el par de doubles consecutivos donde cambia la region.
    Devuelve esa lista (0 o 2 valores). Asi el < frente a <= queda probado aunque c no sea exacto."""
    def reg(v):
        d = dict(args)
        d[var] = v
        return region_de(funcion, d)
    out = []
    lo = c
    for _ in range(BUSQUEDA_ULPS):
        lo = math.nextafter(lo, -INF)
    v = lo
    r_prev = reg(v)
    for _ in range(2 * BUSQUEDA_ULPS):
        w = math.nextafter(v, INF)
        r_w = reg(w)
        if r_w != r_prev and r_prev is not None and r_w is not None:
            out += [v, w]
        v, r_prev = w, r_w
    return out


def resolver_fijos(fijo):
    """Evalua en orden los fijos que son funcion de los ya puestos."""
    d = {}
    pendientes = []
    for k, v in fijo.items():
        if callable(v):
            pendientes.append((k, v))
        else:
            d[k] = v
    return d, pendientes


def completar(d, pendientes):
    d = dict(d)
    for k, g in pendientes:
        d[k] = g(d)
    return d


class Coleccion:
    def __init__(self, funcion):
        self.funcion = funcion
        self.filas = []
        self.vistos = set()
        self.descartes = []
        self.argnames = ARGUMENTOS[funcion]

    @property
    def descartados(self):
        return len(self.descartes)

    def descartar(self, args, lt, origen, frontera, causa):
        self.descartes.append({"args": dict(args), "lower_tail": lt, "origen": origen,
                               "frontera": frontera, "causa": causa})

    def clave(self, args, lt):
        return tuple(args[k] for k in self.argnames) + (lt,)

    def agregar(self, args, region, origen, lt, valor_fuente="", descartar_fuera=True, frontera=""):
        """Agrega una fila. region=None -> se calcula con region_de (puntos de frontera/cruce)."""
        reg = region_de(self.funcion, args)
        if region is None:
            if reg is None:
                if descartar_fuera:
                    self.descartar(args, lt, origen, frontera, "fuera del dominio o de las cotas de muestreo")
                    return False
                raise ErrorGenerador(f"{self.funcion}: punto fuera del dominio: {args}")
            region = reg
        else:
            etiqueta_tipo = ETIQUETAS.get(region, (None, None))[1]
            if etiqueta_tipo == "superpuesta":
                if reg is None:
                    raise ErrorGenerador(f"{self.funcion}: punto de {region} fuera del dominio: {args}")
            elif reg != region:
                raise ErrorGenerador(
                    f"{self.funcion}: el punto {args} se genero para {region} pero pertenece a {reg}")
        k = self.clave(args, lt)
        if k in self.vistos:
            return False
        self.vistos.add(k)
        self.filas.append({"region": region, "args": dict(args), "lower_tail": lt,
                           "origen": origen, "valor_fuente": valor_fuente})
        return True


def colas(funcion, rng=None, ambas=False):
    if funcion not in CON_COLA:
        return [""]
    if ambas:
        return [1, 0]
    return [1 if rng.random() < 0.5 else 0]


def generar_fronteras(col, funcion, lista, origen="frontera"):
    for fr in lista:
        for fijo in fr["fijos"]:
            base, pend = resolver_fijos({k: v for k, v in fijo.items() if k != "lower_tail"})
            lt_fijo = fijo.get("lower_tail")
            # c puede depender de los fijos (curvas)
            args0 = dict(base)   # c (si es curva) depende solo de los fijos no calculados
            c = fr["c"](args0) if callable(fr["c"]) else fr["c"]
            vals = puntos_de_frontera(c, fr["discreta"])
            vals += cambio_exacto(funcion, completar(dict(args0, **{fr["var"]: c}), pend), fr["var"], c) \
                if not fr["discreta"] else []
            for v in vals:
                d = dict(args0)
                d[fr["var"]] = v
                d = completar(d, pend)
                lts = [lt_fijo] if lt_fijo is not None else colas(funcion, ambas=True)
                for lt in lts:
                    col.agregar(d, None, origen, lt, frontera=fr["nombre"])


def _buscar(funcion, nombre):
    for fr in FRONTERAS.get(funcion, []) + FRONTERAS_SOLO_CRUCE.get(funcion, []):
        if fr["nombre"] == nombre:
            return fr
    raise ErrorGenerador(f"{funcion}: cruce con frontera inexistente {nombre}")


def generar_cruces(col, funcion):
    for n1, n2, fijos, _folio in CRUCES.get(funcion, []):
        f1, f2 = _buscar(funcion, n1), _buscar(funcion, n2)
        for fijo in fijos:
            base, pend = resolver_fijos(fijo)
            c1 = f1["c"](base) if callable(f1["c"]) else f1["c"]
            for v1 in puntos_de_frontera(c1, f1["discreta"]):
                d1 = dict(base)
                d1[f1["var"]] = v1
                c2 = f2["c"](d1) if callable(f2["c"]) else f2["c"]
                for v2 in puntos_de_frontera(c2, f2["discreta"]):
                    d = dict(d1)
                    d[f2["var"]] = v2
                    d = completar(d, pend)
                    for lt in colas(funcion, ambas=True):
                        col.agregar(d, None, "cruce", lt, frontera=f"{n1} x {n2}")


def generar_aleatorios(col, funcion, rng, etiquetas, n):
    for et in etiquetas:
        prop = PROPUESTAS[et]
        aceptados, intentos = 0, 0
        while aceptados < n:
            intentos += 1
            if intentos > INTENTOS_POR_PUNTO * n:
                raise ErrorGenerador(
                    f"{funcion}/{et}: solo {aceptados} de {n} puntos tras {intentos - 1} intentos; "
                    f"la propuesta de esa region no sirve")
            d = prop(rng)
            if region_de(funcion, d) != et:
                continue
            lt = colas(funcion, rng)[0]
            vf = FORMA_CERRADA[et](d, lt) if et in FORMA_CERRADA else ""
            origen = "forma_cerrada" if et in FORMA_CERRADA else "aleatorio"
            if col.agregar(d, et, origen, lt, vf):
                aceptados += 1


def generar_as91(col, funcion):
    """Fronteras del arranque AS 91 -> etiqueta superpuesta qgamma_as91 (en escala ν para qchisq, a = ν/2 para qgamma)."""
    for nombre, var, c, P in AS91:
        if var == "nu":
            cola, lt = (P, 1) if P <= 0.5 else (1.0 - P, 0)
            for nu in puntos_de_frontera(c, False):
                args = {"p": cola, "nu": nu} if funcion == "qchisq" else {"p": cola, "a": nu / 2.0}
                if region_de(funcion, args) is None:
                    col.descartar(args, lt, "frontera", "AS91 " + nombre, "fuera del dominio")
                    continue
                col.agregar(args, "qgamma_as91", "frontera", lt)
        else:   # var == "cola": se mueve la probabilidad de la cola
            nu = c
            if P is None:
                cola0, lt = _wh_P_para_nu(nu)
            elif P == "inf":
                cola0, lt = 2e-6, 1
            else:
                cola0, lt = 2e-6, 0
            for cola in puntos_de_frontera(cola0, False):
                args = {"p": cola, "nu": nu} if funcion == "qchisq" else {"p": cola, "a": nu / 2.0}
                if region_de(funcion, args) is None:
                    col.descartar(args, lt, "frontera", "AS91 " + nombre, "fuera del dominio")
                    continue
                col.agregar(args, "qgamma_as91", "frontera", lt)


def etiquetas_de(funcion, tipo="particion"):
    f = ETIQUETAS_DE.get(funcion, funcion)
    return [e for e, (ff, t) in ETIQUETAS.items() if ff == f and t == tipo]


def generar(funcion):
    rng = random.Random(SEMILLAS[funcion])
    col = Coleccion(funcion)
    if funcion == "pchisq":
        # Envoltorio (plan §1.2): fronteras de pgamma trasladadas (x -> 2x, a -> ν = 2a) + 200 aleatorios.
        tmp = Coleccion("pgamma")
        generar_fronteras(tmp, "pgamma", FRONTERAS["pgamma"])
        for fila in tmp.filas:
            x2 = 2.0 * fila["args"]["x"]
            if x2 < 2.0 ** -1021:
                col.descartar({"x": x2, "nu": 2.0 * fila["args"]["a"]}, fila["lower_tail"], "frontera",
                              "pgamma trasladada", "x < 2^-1021: x/2 cae en subnormales (plan §1.2)")
                continue
            col.agregar({"x": x2, "nu": 2.0 * fila["args"]["a"]}, None, "frontera", fila["lower_tail"])
        regs = etiquetas_de("pgamma")
        for _ in range(N_ALEATORIOS_ENVOLTORIO):
            while True:
                et = regs[int(rng.random() * len(regs))]
                d = PROPUESTAS[et](rng)
                if region_pgamma(d["x"], d["a"]) == et:
                    break
            col.agregar({"x": 2.0 * d["x"], "nu": 2.0 * d["a"]}, et, "aleatorio", colas("pchisq", rng)[0])
        return col
    if funcion == "qchisq":
        generar_as91(col, "qchisq")
        generar_dm86(col, "qchisq")
        for _ in range(N_ALEATORIOS_ENVOLTORIO):
            d = PROPUESTAS["qgamma_todas"](rng)
            col.agregar({"p": d["p"], "nu": 2.0 * d["a"]}, "qgamma_todas", "aleatorio", colas("qchisq", rng)[0])
        return col
    # Funciones con filas propias
    generar_fronteras(col, funcion, FRONTERAS.get(funcion, []))
    generar_cruces(col, funcion)
    if funcion == "qnorm":
        for w in WICHURA:
            col.agregar({"p": w["p"]}, "qnorm_wichura", "publicado", w["lower_tail"], w["valor_fuente"])
    if funcion == "qgamma":
        generar_as91(col, "qgamma")
        generar_dm86(col, "qgamma")
    generar_aleatorios(col, funcion, rng, etiquetas_de(funcion, "particion") + etiquetas_de(funcion, "pendiente"),
                       N_ALEATORIOS)
    # Formas cerradas sobre puntos de frontera (qt n = 1, 2; ceros de lgamma y gamma1pm1)
    for fila in col.filas:
        a = fila["args"]
        if funcion == "qt" and fila["region"] == "qt_cerradas" and not fila["valor_fuente"]:
            fila["valor_fuente"] = FORMA_CERRADA["qt_cerradas"](a, fila["lower_tail"])
            fila["origen"] = "forma_cerrada"
        if funcion == "lgamma" and a["a"] in (1.0, 2.0):
            fila["valor_fuente"], fila["origen"] = "0", "forma_cerrada"
        if funcion == "gamma1pm1" and a["a"] in (0.0, 1.0):
            fila["valor_fuente"], fila["origen"] = "0", "forma_cerrada"
    return col

# =====================================================================================
# 6. Validacion global y escritura
# =====================================================================================


def etiquetas_de_tolerancias():
    if not os.path.exists(TOLERANCIAS_MD):
        raise ErrorGenerador(f"No encuentro {TOLERANCIAS_MD}")
    with open(TOLERANCIAS_MD, encoding="utf-8") as fh:
        txt = fh.read()
    return re.findall(r"^\| `([a-z0-9_]+)` \|", txt, flags=re.M)


def validar(colecciones):
    errores = []
    tabla = etiquetas_de_tolerancias()
    if len(tabla) != len(set(tabla)):
        errores.append("stats-js_tolerancias.md tiene etiquetas repetidas")
    if set(tabla) != set(ETIQUETAS):
        errores.append("Las etiquetas del script y de stats-js_tolerancias.md no coinciden: "
                       f"solo en la tabla {sorted(set(tabla) - set(ETIQUETAS))}; "
                       f"solo en el script {sorted(set(ETIQUETAS) - set(tabla))}")
    for f, col in colecciones.items():
        fam = ETIQUETAS_DE.get(f, f)
        for i, fila in enumerate(col.filas):
            et = fila["region"]
            if et not in ETIQUETAS:
                errores.append(f"{f} fila {i}: etiqueta desconocida {et}")
                continue
            if ETIQUETAS[et][0] != fam:
                errores.append(f"{f} fila {i}: etiqueta {et} es de otra funcion")
            if ETIQUETAS[et][1] in ("regla", "vacia"):
                errores.append(f"{f} fila {i}: el generador no debe asignar {et} ({ETIQUETAS[et][1]})")
            reg = region_de(f, fila["args"])
            if ETIQUETAS[et][1] != "superpuesta" and reg != et:
                errores.append(f"{f} fila {i}: {fila['args']} etiquetada {et} pero pertenece a {reg}")
            for k in ARGUMENTOS[f]:
                v = fila["args"][k]
                if not isinstance(v, float) or math.isnan(v) or math.isinf(v):
                    errores.append(f"{f} fila {i}: argumento {k} no es un double finito: {v!r}")
            if (f in CON_COLA) != (fila["lower_tail"] in (0, 1)):
                errores.append(f"{f} fila {i}: lower_tail incoherente: {fila['lower_tail']!r}")
        if f not in ETIQUETAS_DE:
            for et in etiquetas_de(f, "particion") + etiquetas_de(f, "pendiente"):
                n = sum(1 for fl in col.filas if fl["region"] == et and fl["origen"] in ("aleatorio", "forma_cerrada"))
                if n < N_ALEATORIOS:
                    errores.append(f"{f}/{et}: {n} aleatorios, se esperaban {N_ALEATORIOS}")
    return errores


def sha256_propio():
    with open(os.path.abspath(__file__), "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def fmt(v):
    return "%.17g" % v


def textos(colecciones):
    """Contenido exacto de cada CSV (incluido _descartados.csv), como texto con saltos LF."""
    h = sha256_propio()
    out = {}
    for f, col in colecciones.items():
        buf = io.StringIO()
        buf.write(f"# funcion: {f}\n")
        buf.write(f"# generador: tests/gen/gen_puntos.py\n")
        buf.write(f"# sha256_gen_puntos.py: {h}\n")
        buf.write(f"# semilla: {SEMILLAS[f]}\n")
        buf.write(f"# python: {sys.version.split()[0]}\n")
        buf.write(f"# filas: {len(col.filas)}   descartados: {col.descartados} (detalle en _descartados.csv)\n")
        w = csv.writer(buf, lineterminator="\n")
        w.writerow(["id", "region"] + ARGUMENTOS[f] + ["lower_tail", "origen", "valor_fuente"]
                   + [k + "_hex" for k in ARGUMENTOS[f]])
        for i, fila in enumerate(col.filas, 1):
            w.writerow([i, fila["region"]] + [fmt(fila["args"][k]) for k in ARGUMENTOS[f]]
                       + [fila["lower_tail"], fila["origen"], fila["valor_fuente"]]
                       + [fila["args"][k].hex() for k in ARGUMENTOS[f]])
        out[f + ".csv"] = buf.getvalue()
    buf = io.StringIO()
    total = sum(c.descartados for c in colecciones.values())
    buf.write("# descartados de todos los generadores (no entran a los fixtures; el auditor los revisa)\n")
    buf.write(f"# sha256_gen_puntos.py: {h}\n")
    buf.write(f"# total: {total}\n")
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["funcion", "argumentos", "lower_tail", "origen", "frontera", "causa"])
    for f, col in colecciones.items():
        for d in col.descartes:
            argtxt = ";".join(f"{k}={fmt(v)}" for k, v in d["args"].items())
            w.writerow([f, argtxt, d["lower_tail"], d["origen"], d["frontera"], d["causa"]])
    out["_descartados.csv"] = buf.getvalue()
    return out


def escribir(colecciones):
    os.makedirs(SALIDA, exist_ok=True)
    for nombre, txt in textos(colecciones).items():
        with open(os.path.join(SALIDA, nombre), "w", encoding="utf-8", newline="") as fh:
            fh.write(txt)


def huella(colecciones):
    """SHA-256 de cada CSV tal como se escribiria, sin escribir nada: sirve para comparar dos maquinas."""
    print("\nHuella (sha256 de cada archivo, sin escribirlo):")
    for nombre, txt in textos(colecciones).items():
        print(f"   {hashlib.sha256(txt.encode('utf-8')).hexdigest()}  {nombre}")


def resumen(colecciones):
    total = 0
    for f, col in colecciones.items():
        print(f"\n== {f}: {len(col.filas)} puntos (descartados: {col.descartados})")
        por_reg, por_ori = {}, {}
        for fila in col.filas:
            por_reg[fila["region"]] = por_reg.get(fila["region"], 0) + 1
            por_ori[fila["origen"]] = por_ori.get(fila["origen"], 0) + 1
        for et in sorted(por_reg):
            print(f"   {et:<22} {por_reg[et]:>6}")
        print("   por origen: " + ", ".join(f"{k} {v}" for k, v in sorted(por_ori.items())))
        total += len(col.filas)
    print(f"\nTOTAL: {total} puntos en {len(colecciones)} archivos")


def main():
    ap = argparse.ArgumentParser(description="Genera los puntos de los fixtures de stats.js (plan §7, paso 1).")
    ap.add_argument("--resumen", action="store_true", help="imprime conteos y NO escribe archivos")
    ap.add_argument("--huella", action="store_true",
                    help="imprime el sha256 de cada CSV sin escribirlo (para comparar maquinas)")
    ap.add_argument("--solo", help="(depuracion) genera solo esta funcion; no escribe")
    args = ap.parse_args()
    funciones = [args.solo] if args.solo else list(SEMILLAS)
    try:
        cols = {f: generar(f) for f in funciones}
        errores = validar(cols)
    except ErrorGenerador as e:
        print(f"ERROR: {e}\nNo se escribio ningun archivo.", file=sys.stderr)
        return 1
    if errores:
        print(f"ERROR: {len(errores)} problemas de validacion. No se escribio ningun archivo.", file=sys.stderr)
        for e in errores[:50]:
            print("  - " + e, file=sys.stderr)
        return 1
    resumen(cols)
    if args.huella:
        huella(cols)
    if args.resumen or args.solo or args.huella:
        print("\n(no se escribio ningun archivo)")
        return 0
    escribir(cols)
    print(f"\nEscritos {len(cols)} CSV y _descartados.csv en {SALIDA}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
