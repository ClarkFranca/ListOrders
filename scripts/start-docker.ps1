#!/usr/bin/env pwsh
# start-docker.ps1 - Sobe toda a stack no Docker Compose (API, Web, Processador, Postgres)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $repoRoot

Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host "       ListOrders - Modo Docker Completo                    " -ForegroundColor Cyan
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Verificar Docker --------------------------------------------------
Write-Host "[Verificando] Docker Desktop..." -ForegroundColor Yellow
$dockerOk = $false
try {
    $null = & docker info 2>$null
    if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {}

if ($dockerOk) {
    Write-Host "  [OK] Docker esta rodando." -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Docker Desktop nao esta em execucao." -ForegroundColor Red
    Write-Host "         Abra o Docker Desktop e tente novamente." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# -- 2. Derrubar execucoes anteriores --------------------------------------
Write-Host ""
Write-Host "[1/2] Derrubando containers anteriores..." -ForegroundColor Yellow
& docker compose down --remove-orphans 2>$null

# Liberar portas locais caso haja processos do host ocupando
foreach ($port in @(5000, 5173, 3000)) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        if ($c.OwningProcess -and $c.OwningProcess -ne 0) {
            Write-Host "  Liberando porta $port (PID $($c.OwningProcess))..." -ForegroundColor Gray
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# -- 3. Build e start ------------------------------------------------------
Write-Host ""
Write-Host "[2/2] Construindo e subindo containers..." -ForegroundColor Yellow
& docker compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERRO] Falha ao subir os containers. Verifique o Docker Desktop." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# -- Resumo ----------------------------------------------------------------
Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Green
Write-Host "       Todos os servicos estao rodando!                     " -ForegroundColor Green
Write-Host "  ========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Web:          http://localhost:5173" -ForegroundColor White
Write-Host "  API:          http://localhost:5000" -ForegroundColor White
Write-Host "  Processador:  http://localhost:3000" -ForegroundColor White
Write-Host "  Banco:        localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "  Use 'docker compose logs -f' para acompanhar os logs." -ForegroundColor Gray
Write-Host ""
