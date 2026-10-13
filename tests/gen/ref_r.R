# ref_r.R - Referencias de R para los fixtures de stats.js (plan, §7, paso 2).
#
# Lee   tests/fixtures/_puntos/<funcion>.csv          (los escribe gen_puntos.py; NO se modifican)
# Escribe tests/fixtures/_ref_r/<funcion>.csv          (id, ref_r_hex, ref_r)
#         tests/fixtures/_sessioninfo_R.txt            (sessionInfo() completo)
#
# Uso (desde la raiz del repo):
#     Rscript tests/gen/ref_r.R
#
# Reglas:
#   - Solo R base (sin paquetes).
#   - Cada argumento se lee de su columna <arg>_hex (hexadecimal exacto) y de su decimal; los dos
#     tienen que dar el mismo double (ver a_double_exacto).
#   - lower.tail en R no es vectorial: cada funcion se evalua por separado para las filas con
#     lower_tail = 1 y con lower_tail = 0.
#   - R no tiene erf, erfc ni 1/Gamma(1+a) - 1: en esos archivos ref_r queda vacia (plan §4.3).
#   - La salida va en hexadecimal exacto (ref_r_hex, sprintf %a) y en %.17g solo para leer (ref_r),
#     con saltos de linea LF (conexion binaria), para que el SHA-256 no dependa de Windows.
#   - Los avisos de R (warnings) no detienen nada: se cuentan y se anotan en la cabecera.
#
# Escrito por Cowork (Claude). La corrida canonica es la de Carlos.

ENTRADA <- file.path("tests", "fixtures", "_puntos")
SALIDA  <- file.path("tests", "fixtures", "_ref_r")
SESION  <- file.path("tests", "fixtures", "_sessioninfo_R.txt")

# v4 (13/10): hash SHA-256 con tools::sha256sum (verificado en R 4.6.1 de Carlos: da el mismo SHA-256
# que Python para ref_r.R). Asi todo el proyecto usa un solo hash.
if (!exists("sha256sum", envir = asNamespace("tools"))) {
  stop("Este R no tiene tools::sha256sum. Usa R 4.6.1 o posterior (el de C:/Program Files/R/R-4.6.1).")
}
sha256 <- function(ruta) unname(tools::sha256sum(ruta))

if (!dir.exists(ENTRADA)) {
  stop("No encuentro ", ENTRADA, ". Corre el script desde la raiz del repo.")
}

# --- Que funcion de R corresponde a cada archivo, y con que argumentos ------------------------
# d: data.frame con los argumentos ya convertidos a double; lt: TRUE/FALSE (lower.tail).
FUNCIONES <- list(
  erf       = NULL,
  erfc      = NULL,
  gamma1pm1 = NULL,
  pnorm  = function(d, lt) pnorm(d$z, lower.tail = lt),
  qnorm  = function(d, lt) qnorm(d$p, lower.tail = lt),
  pgamma = function(d, lt) pgamma(d$x, shape = d$a, lower.tail = lt),
  qgamma = function(d, lt) qgamma(d$p, shape = d$a, lower.tail = lt),
  pchisq = function(d, lt) pchisq(d$x, df = d$nu, lower.tail = lt),
  qchisq = function(d, lt) qchisq(d$p, df = d$nu, lower.tail = lt),
  pbeta  = function(d, lt) pbeta(d$x, d$a, d$b, lower.tail = lt),
  pt     = function(d, lt) pt(d$t, df = d$n, lower.tail = lt),
  qt     = function(d, lt) qt(d$p, df = d$n, lower.tail = lt),
  lgamma = function(d, lt) lgamma(d$a),
  gamma  = function(d, lt) gamma(d$a)
)
ARGUMENTOS <- list(
  erf = "x", erfc = "x", gamma1pm1 = "a", pnorm = "z", qnorm = "p",
  pgamma = c("x", "a"), qgamma = c("p", "a"), pchisq = c("x", "nu"), qchisq = c("p", "nu"),
  pbeta = c("x", "a", "b"), pt = c("t", "n"), qt = c("p", "n"), lgamma = "a", gamma = "a"
)

# --- Utilidades ------------------------------------------------------------------------------
leer_puntos <- function(ruta) {
  lineas <- readLines(ruta, encoding = "UTF-8", warn = FALSE)
  cabecera <- lineas[startsWith(lineas, "#")]
  datos <- lineas[!startsWith(lineas, "#")]
  df <- read.csv(text = datos, colClasses = "character", na.strings = character(0))
  list(cabecera = cabecera, df = df)
}

# Añadido 13/10, tras el primer corrido en Windows (R 4.6.1): sprintf("%.17g") de R en Windows NO
# redondea bien la cifra 17 (verificado: -9.0660613713870177e-283 se lee bien, 0x1.0da0b2fb6eb59p-937,
# pero se imprime ...176; el valor exacto es ...1765071...). Por eso:
#   - la entrada se toma de las columnas <arg>_hex (hexadecimal exacto, float.hex de Python);
#   - el decimal de la entrada se lee igual y se compara con el hexadecimal: tienen que dar el mismo
#     double (si no, el script se detiene: ver a_double_exacto);
#   - la salida principal es ref_r_hex (sprintf("%a"), exacto); ref_r en %.17g queda solo como lectura
#     humana y puede diferir en la ultima cifra en Windows.
# Añadido 13/10 (segundo corrido en Windows): la comprobacion «%a de R y vuelta» fallo en erf.csv.
# Hecho comprobado (R 4.3.3, Linux): R lee mal un hexadecimal NORMALIZADO por debajo de 2^-1022
# (as.numeric('0x1p-1074') da 0), aunque lee bien el desnormalizado ('0x0.0000000000001p-1022'), que es
# como escribe Python. Que R en Windows imprima los subnormales normalizados es la causa probable del
# fallo, NO verificada; esta comprobacion no depende de eso: se leen el hexadecimal y el decimal por
# separado y tienen que dar el MISMO double. Si en una sola fila no coinciden, uno de los
# dos lectores de R esta fallando y no se sabe cual: el script se detiene, muestra las filas y no escribe.
a_double_exacto <- function(df, nombre, funcion) {
  hx <- df[[paste0(nombre, "_hex")]]
  if (is.null(hx)) stop(funcion, ": falta la columna ", nombre, "_hex (hace falta gen_puntos.py v3)")
  v <- as.numeric(hx)
  dec <- as.numeric(df[[nombre]])
  if (any(is.na(v))) stop(sprintf("%s, columna %s_hex: %d valores no se pudieron leer.", funcion, nombre, sum(is.na(v))))
  dif <- which(!(dec == v) | is.na(dec))
  if (length(dif) > 0) {
    muestra <- head(dif, 5)
    stop(sprintf("%s, columna %s: en %d filas el hexadecimal y el decimal no dan el mismo double. Primeras: %s. No se escribe nada.",
                 funcion, nombre, length(dif),
                 paste(sprintf("fila %d: hex %s -> %s ; decimal %s -> %s", muestra, hx[muestra], sprintf("%a", v[muestra]),
                               df[[nombre]][muestra], sprintf("%a", dec[muestra])), collapse = " | ")))
  }
  v
}

escribir_lf <- function(ruta, lineas) {
  con <- file(ruta, open = "wb")
  on.exit(close(con))
  writeLines(lineas, con, sep = "\n", useBytes = TRUE)
}

archivo_script <- function() {
  arg <- grep("^--file=", commandArgs(trailingOnly = FALSE), value = TRUE)
  if (length(arg) == 0) return(NA_character_)
  normalizePath(sub("^--file=", "", arg[1]), mustWork = FALSE)
}

# --- Calculo: todo en memoria; se escribe solo si todo salio bien -----------------------------
resultados <- list()
for (f in names(FUNCIONES)) {
  ruta <- file.path(ENTRADA, paste0(f, ".csv"))
  if (!file.exists(ruta)) stop("Falta ", ruta)
  lp <- leer_puntos(ruta)
  df <- lp$df
  d <- data.frame(row.names = seq_len(nrow(df)))
  for (a in ARGUMENTOS[[f]]) d[[a]] <- a_double_exacto(df, a, f)
  ref <- rep("", nrow(df))
  ref_hex <- rep("", nrow(df))
  avisos <- character(0)
  fn <- FUNCIONES[[f]]
  if (!is.null(fn)) {
    val <- rep(NA_real_, nrow(df))
    lt_txt <- df$lower_tail
    grupos <- if (all(lt_txt == "")) list(list(idx = seq_len(nrow(df)), lt = TRUE)) else
      list(list(idx = which(lt_txt == "1"), lt = TRUE), list(idx = which(lt_txt == "0"), lt = FALSE))
    if (!all(lt_txt %in% c("", "0", "1"))) stop(f, ": lower_tail con valores no validos")
    for (g in grupos) {
      if (length(g$idx) == 0) next
      sub_d <- d[g$idx, , drop = FALSE]
      val[g$idx] <- withCallingHandlers(
        fn(sub_d, g$lt),
        warning = function(w) {
          avisos <<- c(avisos, conditionMessage(w))
          invokeRestart("muffleWarning")
        })
    }
    if (any(is.na(val) & !is.nan(val))) stop(f, ": quedaron filas sin evaluar")
    ref <- sprintf("%.17g", val)
    ref_hex <- sprintf("%a", val)
  }
  resultados[[f]] <- list(ids = df$id, ref = ref, ref_hex = ref_hex, avisos = avisos, cab_entrada = lp$cabecera,
                          sha_entrada = sha256(ruta), n = nrow(df))
  cat(sprintf("%-10s %6d filas  %s  avisos: %d\n", f, nrow(df),
              if (is.null(fn)) "(R no tiene esta funcion: ref_r vacia)" else "", length(avisos)))
}

# --- Escritura ---------------------------------------------------------------------------------
dir.create(SALIDA, showWarnings = FALSE, recursive = TRUE)
scr <- archivo_script()
sha_scr <- if (is.na(scr)) "desconocido" else sha256(scr)
for (f in names(resultados)) {
  r <- resultados[[f]]
  sha_gen <- grep("^# sha256_gen_puntos.py:", r$cab_entrada, value = TRUE)
  avisos_unicos <- unique(r$avisos)
  cab <- c(
    paste0("# funcion: ", f),
    "# generador: tests/gen/ref_r.R",
    paste0("# R: ", R.version.string),
    paste0("# sha256_ref_r.R: ", sha_scr),
    paste0("# entrada: tests/fixtures/_puntos/", f, ".csv  sha256: ", r$sha_entrada),
    if (length(sha_gen)) sha_gen else "# sha256_gen_puntos.py: (no encontrado en la entrada)",
    paste0("# filas: ", r$n, "   avisos_de_R: ", length(r$avisos),
           "   entrada: hexadecimal y decimal coinciden en todas las filas"),
    if (length(avisos_unicos)) paste0("# aviso: ", gsub("[\r\n]+", " ", avisos_unicos)) else character(0)
  )
  lineas <- c(cab, "# ref_r_hex es el valor exacto (sprintf %a; leer con float.fromhex de Python, que acepta la forma normalizada y la desnormalizada); ref_r (%.17g) es solo para leer y en Windows puede fallar en la ultima cifra",
              "id,ref_r_hex,ref_r", paste(r$ids, r$ref_hex, r$ref, sep = ","))
  escribir_lf(file.path(SALIDA, paste0(f, ".csv")), lineas)
}
escribir_lf(SESION, capture.output(sessionInfo()))
cat("\nEscritos ", length(resultados), " archivos en ", SALIDA, " y ", SESION, "\n", sep = "")
