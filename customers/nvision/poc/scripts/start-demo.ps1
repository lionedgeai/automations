#!/usr/bin/env pwsh
<#
.SYNOPSIS
    nVision AI Campaign Demo — One-click setup & launch
.DESCRIPTION
    Starts all services (Docker + UI), initializes the database,
    seeds demo data, and opens the browser. No manual steps needed.
.NOTES
    Prerequisites: Docker Desktop (running), Node.js 20+, npm 9+
#>

param(
    [switch]$Reset,       # Tear down volumes and start fresh
    [switch]$Stop,        # Stop all services
    [switch]$SkipBrowser  # Don't auto-open browser
)

$ErrorActionPreference = 'Stop'
$POC_DIR = $PSScriptRoot | Split-Path   # scripts/ -> poc/
$UI_DIR  = Join-Path $POC_DIR 'ui'

function Write-Step($msg) { Write-Host "`n▸ $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "  ❌ $msg" -ForegroundColor Red }

# ── Stop mode ──────────────────────────────────────────────
if ($Stop) {
    Write-Step "Stopping all services"
    Push-Location $POC_DIR
    docker compose down 2>&1 | Out-Null
    Pop-Location

    # Kill UI dev server if running
    $uiPid = (netstat -ano | Select-String '127.0.0.1:3000.*LISTENING' |
              ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -First 1)
    if ($uiPid) { Stop-Process -Id $uiPid -Force -ErrorAction SilentlyContinue }

    Write-Ok "All services stopped"
    exit 0
}

# ── Reset mode ─────────────────────────────────────────────
if ($Reset) {
    Write-Step "Tearing down (volumes + containers)"
    Push-Location $POC_DIR
    docker compose down -v 2>&1 | Out-Null
    Pop-Location
    Write-Ok "Clean slate"
}

# ── Prerequisite checks ───────────────────────────────────
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  nVision AI Campaign Demo — Setup    ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Magenta

Write-Step "Checking prerequisites"

# Docker
try {
    $dockerVersion = (docker --version 2>&1)
    Write-Ok "Docker: $dockerVersion"
} catch {
    Write-Fail "Docker not found. Install Docker Desktop and try again."
    exit 1
}

$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Docker Desktop is not running. Start it and try again."
    exit 1
}

# Node.js
try {
    $nodeVersion = (node --version 2>&1)
    Write-Ok "Node.js: $nodeVersion"
} catch {
    Write-Fail "Node.js not found. Install Node.js 20+ and try again."
    exit 1
}

# npm
try {
    $npmVersion = (npm --version 2>&1)
    Write-Ok "npm: $npmVersion"
} catch {
    Write-Fail "npm not found."
    exit 1
}

# ── Kill stray processes on our ports ──────────────────────
Write-Step "Checking for port conflicts"

foreach ($port in @(3000, 3001)) {
    $listeners = netstat -ano | Select-String "127.0.0.1:$port\s+.*LISTENING"
    foreach ($line in $listeners) {
        $procId = ($line -split '\s+')[-1]
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        # Don't kill Docker
        if ($proc -and $proc.ProcessName -notmatch 'docker|com\.docker') {
            Write-Warn "Killing stray process on port $port (PID $procId, $($proc.ProcessName))"
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
}

# ── Start Docker services ─────────────────────────────────
Write-Step "Starting Docker services (PostgreSQL + n8n + API)"
Push-Location $POC_DIR
docker compose up -d --build 2>&1 | ForEach-Object {
    if ($_ -match 'Started|Healthy|Running|Built') { Write-Host "  $_" -ForegroundColor DarkGray }
}
Pop-Location

# Wait for PostgreSQL to be healthy
Write-Step "Waiting for PostgreSQL to be ready"
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    $pgHealth = docker inspect --format='{{.State.Health.Status}}' n8n_postgres 2>&1
    if ($pgHealth -eq 'healthy') {
        Write-Ok "PostgreSQL is healthy"
        break
    }
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "  ... waiting ($waited s)" -ForegroundColor DarkGray
}
if ($waited -ge $maxWait) {
    Write-Fail "PostgreSQL did not become healthy in ${maxWait}s"
    exit 1
}

# Wait for API to be healthy
Write-Step "Waiting for API to be ready"
$waited = 0
while ($waited -lt $maxWait) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq 'ok') {
            Write-Ok "API is healthy (db=$($health.db))"
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "  ... waiting ($waited s)" -ForegroundColor DarkGray
}
if ($waited -ge $maxWait) {
    Write-Warn "API slow to start — continuing anyway"
}

# ── Initialize database ───────────────────────────────────
Write-Step "Initializing database tables"
Get-Content (Join-Path $POC_DIR 'scripts' 'init-demo-db.sql') -Raw | docker exec -i n8n_postgres psql -U n8n -d n8n 2>&1 | Out-Null
$tableCount = (docker exec n8n_postgres psql -U n8n -d n8n -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('patients','campaigns','campaign_templates')" 2>&1) -join '' -replace '\s',''
if ([int]$tableCount -ge 3) {
    Write-Ok "Database tables ready ($tableCount core tables found)"
} else {
    Write-Warn "Some tables may not have been created — check init-demo-db.sql"
}

# ── Seed demo data ────────────────────────────────────────
Write-Step "Seeding demo data"
$patientCount = (docker exec n8n_postgres psql -U n8n -d n8n -t -c "SELECT COUNT(*) FROM patients" 2>&1) -join '' -replace '\s',''

if ([int]$patientCount -ge 50) {
    Write-Ok "Demo data already seeded ($patientCount patients)"
} else {
    Get-Content (Join-Path $POC_DIR 'scripts' 'seed-demo-data.sql') -Raw | docker exec -i n8n_postgres psql -U n8n -d n8n 2>&1 | Out-Null
    $patientCount = (docker exec n8n_postgres psql -U n8n -d n8n -t -c "SELECT COUNT(*) FROM patients" 2>&1) -join '' -replace '\s',''
    Write-Ok "Seeded $patientCount patients + templates + campaigns"
}

# ── Install UI dependencies ───────────────────────────────
Write-Step "Installing UI dependencies"
Push-Location $UI_DIR
if (Test-Path 'node_modules') {
    Write-Ok "node_modules already present — skipping install"
} else {
    npm install --silent 2>&1 | Out-Null
    Write-Ok "npm install complete"
}
Pop-Location

# ── Start UI dev server ───────────────────────────────────
Write-Step "Starting UI dev server"
$uiRunning = netstat -ano | Select-String '127.0.0.1:3000.*LISTENING'
if ($uiRunning) {
    Write-Ok "UI dev server already running on port 3000"
} else {
    Push-Location $UI_DIR
    # Start via cmd /c so npm resolves correctly on Windows
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run dev' -WindowStyle Hidden -WorkingDirectory $UI_DIR
    Pop-Location

    # Wait for it to come up
    $waited = 0
    while ($waited -lt 20) {
        Start-Sleep -Seconds 2
        $waited += 2
        $uiRunning = netstat -ano | Select-String ':3000.*LISTENING'
        if ($uiRunning) { break }
        Write-Host "  ... waiting ($waited s)" -ForegroundColor DarkGray
    }
    if ($uiRunning) {
        Write-Ok "UI dev server started on port 3000"
    } else {
        Write-Warn "UI dev server may still be starting — check http://localhost:3000"
    }
}

# ── Final status ──────────────────────────────────────────
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       🎉 Demo is ready!              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  UI:        http://localhost:3000" -ForegroundColor White
Write-Host "  API:       http://localhost:3001/api/health" -ForegroundColor DarkGray
Write-Host "  n8n:       http://localhost:5678" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Stop:      .\scripts\start-demo.ps1 -Stop" -ForegroundColor DarkGray
Write-Host "  Reset:     .\scripts\start-demo.ps1 -Reset" -ForegroundColor DarkGray
Write-Host ""

# Open browser
if (-not $SkipBrowser) {
    Start-Process "http://localhost:3000"
}
