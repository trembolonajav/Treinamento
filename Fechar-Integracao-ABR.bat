@echo off
setlocal
title Fechar Integracao ABR

for /f "tokens=5" %%P in ('netstat -ano ^| findstr :4780 ^| findstr LISTENING') do (
  echo Encerrando processo na porta 4780: %%P
  taskkill /PID %%P /T /F >nul 2>&1
)

echo.
echo Se a aplicacao estava aberta nesta porta, ela foi encerrada.
pause
