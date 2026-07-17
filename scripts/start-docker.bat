@echo off
:: start-docker.bat - Sobe toda a stack no Docker (API, Web, Processador, Postgres)
:: Uso: .\scripts\start-docker.bat
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-docker.ps1"
