@echo off
title Backend IA - Motor de Inteligencia Turistica
echo   INICIANDO INTELIGENCIA TURISTICA (FASTAPI)
:: Navegar a la carpeta del backend

uvicorn turismo_ai:app --reload --port 8000

echo.
echo Servidor detenido.
pause