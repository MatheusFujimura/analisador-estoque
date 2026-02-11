@echo off
title Iniciando Analisador

echo ================================
echo   Iniciando servidor local...
echo ================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo Instalando dependencias...
    npm install
)

start http://localhost:5173

npm run dev

pause
