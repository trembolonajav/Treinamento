@echo off
setlocal
cd /d "%~dp0"
title Integracao ABR - Modo Portatil
set "PORT=4780"
set "LOCAL_URL=http://127.0.0.1:%PORT%"
set "LAN_IP="

echo ============================================================
echo  INTEGRACAO ABR - MODO PORTATIL LOCAL
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js nao foi encontrado nesta maquina.
  echo Instale o Node.js LTS e execute este arquivo novamente.
  echo Download: https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm nao foi encontrado nesta maquina.
  echo Instale o Node.js LTS e execute este arquivo novamente.
  echo Download: https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/3] Instalando dependencias pela primeira vez...
  if exist package-lock.json (
    call npm ci
  ) else (
    call npm install
  )
  if errorlevel 1 (
    echo.
    echo Falha ao instalar as dependencias.
    pause
    exit /b 1
  )
) else (
  echo [1/3] Dependencias ja encontradas. Prosseguindo...
)

for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' } | Sort-Object InterfaceMetric | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set "LAN_IP=%%I"

echo.
echo [2/3] Gerando build portatil...
call npm run build:portable
if errorlevel 1 (
  echo.
  echo Falha ao gerar o build portatil.
  pause
  exit /b 1
)

echo.
echo [3/3] Abrindo navegador em %LOCAL_URL%
if defined LAN_IP (
  echo Acesso pela rede local: http://%LAN_IP%:%PORT%
  echo Outros computadores na mesma rede podem usar esse endereco.
) else (
  echo Nao foi possivel identificar automaticamente o IP da rede local.
)
echo Feche esta janela para encerrar a aplicacao local.
echo.
call npm run preview:portable
