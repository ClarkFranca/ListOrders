@echo off
:: start-local.bat - Modo dev local (Postgres no Docker, servicos no host)
:: Uso: .\scripts\start-local.bat
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-local.ps1"
