#!/usr/bin/env pwsh
# start-local.ps1 - Modo dev local: Postgres no Docker, servicos no host em janelas CMD

$ErrorActionPreference = "Continue"
$repoRoot = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $repoRoot

Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host "       ListOrders - Modo Dev Local                         " -ForegroundColor Cyan
Write-Host "       (Postgres no Docker, servicos no host)              " -ForegroundColor Cyan
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host ""

# ==========================================================================
# FUNCOES AUXILIARES
# ==========================================================================

function Test-Command($cmd) {
    $null = Get-Command $cmd -ErrorAction SilentlyContinue
    return $?
}

function Stop-ProcessOnPort($port) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        if ($c.OwningProcess -and $c.OwningProcess -ne 0) {
            $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  Liberando porta $port - $($proc.ProcessName) (PID $($c.OwningProcess))" -ForegroundColor Gray
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

function Refresh-Path {
    $machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath    = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machinePath;$userPath"
}

# ==========================================================================
# 1. VERIFICAR PRE-REQUISITOS
# ==========================================================================
Write-Host "[1/5] Verificando pre-requisitos..." -ForegroundColor Yellow
$allGood = $true

# -- Docker ----------------------------------------------------------------
Write-Host ""
Write-Host "  Verificando Docker Desktop..." -ForegroundColor Gray
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

# -- .NET SDK --------------------------------------------------------------
Write-Host "  Verificando .NET SDK..." -ForegroundColor Gray
if (Test-Command "dotnet") {
    $dotnetVersion = & dotnet --version 2>$null
    Write-Host "  [OK] .NET SDK $dotnetVersion encontrado." -ForegroundColor Green
} else {
    Write-Host "  [FALTA] .NET SDK nao encontrado. Tentando instalar via winget..." -ForegroundColor DarkYellow
    if (Test-Command "winget") {
        & winget install Microsoft.DotNet.SDK.10 --accept-package-agreements --accept-source-agreements --silent
        Refresh-Path
        if (Test-Command "dotnet") {
            Write-Host "  [OK] .NET SDK instalado com sucesso." -ForegroundColor Green
        } else {
            $allGood = $false
            Write-Host "  [ERRO] Instale manualmente: https://dotnet.microsoft.com/download" -ForegroundColor Red
        }
    } else {
        $allGood = $false
        Write-Host "  [ERRO] Winget nao disponivel. Baixe o .NET SDK:" -ForegroundColor Red
        Write-Host "         https://dotnet.microsoft.com/download" -ForegroundColor Red
    }
}

# -- Node.js / npm ---------------------------------------------------------
Write-Host "  Verificando Node.js / npm..." -ForegroundColor Gray
if (Test-Command "node") {
    $nodeVersion = & node --version 2>$null
    Write-Host "  [OK] Node.js $nodeVersion encontrado." -ForegroundColor Green
} else {
    Write-Host "  [FALTA] Node.js nao encontrado. Tentando instalar via winget..." -ForegroundColor DarkYellow
    if (Test-Command "winget") {
        & winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
        Refresh-Path
        if (Test-Command "node") {
            $nodeVersion = & node --version 2>$null
            Write-Host "  [OK] Node.js $nodeVersion instalado com sucesso." -ForegroundColor Green
        } else {
            $allGood = $false
            Write-Host "  [AVISO] Feche e reabra o terminal, ou baixe manualmente: https://nodejs.org" -ForegroundColor DarkYellow
        }
    } else {
        $allGood = $false
        Write-Host "  [ERRO] Winget nao disponivel. Baixe o Node.js LTS:" -ForegroundColor Red
        Write-Host "         https://nodejs.org" -ForegroundColor Red
    }
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "  [!] Resolva as dependencias acima e execute este script novamente." -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# ==========================================================================
# 2. ENCERRAR EXECUCOES ANTERIORES
# ==========================================================================
Write-Host ""
Write-Host "[2/5] Encerrando execucoes anteriores..." -ForegroundColor Yellow

# Parar containers Docker anteriores
& docker compose down 2>$null

# Liberar portas que possam estar em uso
Stop-ProcessOnPort 5000
Stop-ProcessOnPort 5173
Stop-ProcessOnPort 3000

Start-Sleep -Seconds 1

# ==========================================================================
# 3. SUBIR POSTGRES NO DOCKER
# ==========================================================================
Write-Host ""
Write-Host "[3/5] Subindo banco PostgreSQL no Docker..." -ForegroundColor Yellow
& docker compose up -d postgres

# Aguardar o banco ficar saudavel
Write-Host "  Aguardando Postgres ficar pronto..." -ForegroundColor Gray
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    $health = & docker inspect --format='{{.State.Health.Status}}' listorders-db 2>$null
    if ($health -eq "healthy") {
        Write-Host "  [OK] Postgres pronto!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "  Aguardando... ($waited s)" -ForegroundColor Gray
}
if ($waited -ge $maxWait) {
    Write-Host "  [AVISO] Timeout aguardando Postgres. Continuando..." -ForegroundColor DarkYellow
}

# ==========================================================================
# 4. INSTALAR DEPENDENCIAS NPM
# ==========================================================================
Write-Host ""
Write-Host "[4/5] Instalando dependencias npm..." -ForegroundColor Yellow

Write-Host "  React Web (src/Web)..." -ForegroundColor Gray
Push-Location "$repoRoot\src\Web"
& npm install --silent 2>$null
Pop-Location

Write-Host "  Processador Node (services/order-processor)..." -ForegroundColor Gray
Push-Location "$repoRoot\services\order-processor"
& npm install --silent 2>$null
Pop-Location

Write-Host "  [OK] Dependencias instaladas." -ForegroundColor Green

# ==========================================================================
# 5. INICIAR SERVICOS EM JANELAS CMD
# ==========================================================================
Write-Host ""
Write-Host "[5/5] Abrindo janelas dos servicos..." -ForegroundColor Yellow

# API .NET (porta 5000) - com variaveis de ambiente para localhost
$apiCmd = 'title [ListOrders] API .NET && color 1F && echo. && echo === API .NET Core === && echo. && set "ConnectionStrings__DefaultConnection=Host=localhost;Database=listorders;Username=listorders;Password=listorders" && set "OrderProcessorUrl=http://localhost:3000" && dotnet run --project src\Api\Api.csproj'
Start-Process cmd -WorkingDirectory $repoRoot -ArgumentList "/k", $apiCmd

# React Web (porta 5173)
$webCmd = 'title [ListOrders] React Web && color 5F && echo. && echo === React Web (Vite) === && echo. && cd src\Web && npm run dev'
Start-Process cmd -WorkingDirectory $repoRoot -ArgumentList "/k", $webCmd

# Processador Node (porta 3000) - com variavel de ambiente para API local
$nodeCmd = 'title [ListOrders] Processador Node && color 6F && echo. && echo === Processador Node.js === && echo. && cd services\order-processor && set "API_URL=http://localhost:5000/api" && npm run dev'
Start-Process cmd -WorkingDirectory $repoRoot -ArgumentList "/k", $nodeCmd

# ==========================================================================
# RESUMO
# ==========================================================================
Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Green
Write-Host "       Ambiente de desenvolvimento ativo!                   " -ForegroundColor Green
Write-Host "  ========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Web:          http://localhost:5173" -ForegroundColor White
Write-Host "  API:          http://localhost:5000" -ForegroundColor White
Write-Host "  Processador:  http://localhost:3000" -ForegroundColor White
Write-Host "  Banco:        localhost:5432 (Docker)" -ForegroundColor White
Write-Host ""
Write-Host "  Tres janelas CMD foram abertas, uma para cada servico." -ForegroundColor Gray
Write-Host "  Para parar tudo, feche as janelas ou execute este script novamente." -ForegroundColor Gray
Write-Host ""
