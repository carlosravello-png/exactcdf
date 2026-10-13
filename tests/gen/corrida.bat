@echo off
REM corrida.bat - corrida completa de los fixtures de stats.js (plan de fixtures, 7; regla de corridas del 13/10/2026)
REM
REM Uso: abrir "Anaconda Prompt", ir a la raiz del repo y escribir:
REM     tests\gen\corrida.bat
REM
REM Encadena, y se detiene en el primer error:
REM   conda activate statsjs -> gen_puntos.py -> ref_r.R -> ref_mpmath.py calcular --procesos 6
REM   -> ref_mpmath.py distribucion (a tests\fixtures\_mpmath\_distribucion.txt) -> ref_mpmath.py huellas
REM No corre `cerrar`: ese paso necesita la decision de K y del umbral de cifras.
REM
REM Toda la salida de los scripts va a tests\fixtures\_mpmath\_corrida_log.txt (fuera de git).
REM Al terminar bien escribe "CORRIDA COMPLETA" con fecha y SHA-256 en tests\fixtures\_mpmath\_corrida_completa.txt.
REM Es .bat y no .ps1: Carlos trabaja en Anaconda Prompt (CMD), donde conda activate funciona sin
REM configurar PowerShell. Va con saltos de linea CRLF (.gitattributes): CMD falla con goto si son LF.
REM
REM Escrito por Cowork (Claude). Lo corre Carlos.

setlocal
cd /d "%~dp0..\.."
set "PYTHONUTF8=1"
set "RSCRIPT=C:\Program Files\R\R-4.6.1\bin\x64\Rscript.exe"
if not exist "tests\fixtures\_mpmath" mkdir "tests\fixtures\_mpmath"
set "LOG=tests\fixtures\_mpmath\_corrida_log.txt"
if exist "tests\fixtures\_mpmath\_corrida_completa.txt" del "tests\fixtures\_mpmath\_corrida_completa.txt"
echo Corrida iniciada %date% %time% > "%LOG%"

call conda activate statsjs
if errorlevel 1 (
  echo No se pudo activar statsjs. Abre "Anaconda Prompt" y vuelve a lanzar el .bat desde ahi.
  echo FALLO al activar statsjs >> "%LOG%"
  goto fallo
)
python --version >> "%LOG%" 2>&1

echo [%time%] 1/5 gen_puntos.py
echo. >> "%LOG%"
echo === gen_puntos.py >> "%LOG%"
python tests\gen\gen_puntos.py >> "%LOG%" 2>&1
if errorlevel 1 goto fallo

echo [%time%] 2/5 ref_r.R
echo. >> "%LOG%"
echo === ref_r.R >> "%LOG%"
"%RSCRIPT%" tests\gen\ref_r.R >> "%LOG%" 2>&1
if errorlevel 1 goto fallo

echo [%time%] 3/5 ref_mpmath.py calcular --procesos 6  (lo mas largo)
echo. >> "%LOG%"
echo === ref_mpmath.py calcular >> "%LOG%"
python tests\gen\ref_mpmath.py calcular --procesos 6 >> "%LOG%" 2>&1
if errorlevel 1 goto fallo

echo [%time%] 4/5 ref_mpmath.py distribucion
echo. >> "%LOG%"
echo === ref_mpmath.py distribucion (a _distribucion.txt) >> "%LOG%"
python tests\gen\ref_mpmath.py distribucion > "tests\fixtures\_mpmath\_distribucion.txt" 2>> "%LOG%"
if errorlevel 1 goto fallo

echo [%time%] 5/5 huellas
echo. >> "%LOG%"
echo === ref_mpmath.py huellas >> "%LOG%"
python tests\gen\ref_mpmath.py huellas >> "%LOG%" 2>&1
if errorlevel 1 goto fallo

echo.
type "tests\fixtures\_mpmath\_corrida_completa.txt"
echo.
echo Pegale a Cowork: tests\fixtures\_mpmath\_corrida_completa.txt y tests\fixtures\_mpmath\_distribucion.txt
endlocal
exit /b 0

:fallo
echo.
echo CORRIDA DETENIDA %date% %time% >> "%LOG%"
echo ==================================================================
echo  CORRIDA DETENIDA %date% %time%
echo  Pegale a Cowork las ultimas lineas de tests\fixtures\_mpmath\_corrida_log.txt
echo ==================================================================
endlocal
exit /b 1
