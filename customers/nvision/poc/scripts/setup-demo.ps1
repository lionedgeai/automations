# nVision Demo Setup Script
# Purpose: Initialize PostgreSQL schema, seed demo data, and import n8n workflows
# Author: Trinity (Backend Dev)
# Date: 2026-04-04

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "nVision Demo Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/7] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "  ✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error: Docker is not running or not installed" -ForegroundColor Red
    Write-Host "    Please install Docker Desktop and ensure it's running." -ForegroundColor Red
    exit 1
}

# Step 2: Start Docker Compose
Write-Host ""
Write-Host "[2/7] Starting Docker Compose..." -ForegroundColor Yellow
$composeFile = Join-Path $PSScriptRoot "..\docker-compose.yml"
if (-not (Test-Path $composeFile)) {
    Write-Host "  ✗ Error: docker-compose.yml not found at $composeFile" -ForegroundColor Red
    exit 1
}

try {
    docker-compose -f $composeFile up -d 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed"
    }
    Write-Host "  ✓ Docker Compose services started" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error starting Docker Compose" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for PostgreSQL to be healthy
Write-Host ""
Write-Host "[3/7] Waiting for PostgreSQL to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts) {
    try {
        $healthCheck = docker exec n8n_postgres pg_isready -U n8n 2>&1
        if ($LASTEXITCODE -eq 0) {
            $healthy = $true
            break
        }
    } catch {
        # Continue waiting
    }
    
    $attempt++
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host "  ✗ PostgreSQL failed to become healthy after $maxAttempts attempts" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ PostgreSQL is healthy and ready" -ForegroundColor Green

# Step 4: Run init-demo-db.sql
Write-Host ""
Write-Host "[4/7] Creating database schema..." -ForegroundColor Yellow
$initScript = Join-Path $PSScriptRoot "init-demo-db.sql"
if (-not (Test-Path $initScript)) {
    Write-Host "  ✗ Error: init-demo-db.sql not found at $initScript" -ForegroundColor Red
    exit 1
}

try {
    Get-Content $initScript | docker exec -i n8n_postgres psql -U n8n -d n8n 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Schema creation failed"
    }
    Write-Host "  ✓ Database schema created successfully" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error creating database schema" -ForegroundColor Red
    Write-Host "    Check the SQL syntax in init-demo-db.sql" -ForegroundColor Red
    exit 1
}

# Step 5: Run seed-demo-data.sql
Write-Host ""
Write-Host "[5/7] Seeding demo data..." -ForegroundColor Yellow
$seedScript = Join-Path $PSScriptRoot "seed-demo-data.sql"
if (-not (Test-Path $seedScript)) {
    Write-Host "  ✗ Error: seed-demo-data.sql not found at $seedScript" -ForegroundColor Red
    exit 1
}

try {
    Get-Content $seedScript | docker exec -i n8n_postgres psql -U n8n -d n8n 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Data seeding failed"
    }
    Write-Host "  ✓ Demo data seeded successfully (50 patients, 2 campaigns)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error seeding demo data" -ForegroundColor Red
    Write-Host "    Check the SQL syntax in seed-demo-data.sql" -ForegroundColor Red
    exit 1
}

# Step 6: Wait for n8n to be healthy
Write-Host ""
Write-Host "[6/7] Waiting for n8n to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -Method GET -UseBasicParsing -TimeoutSec 2 2>&1
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Continue waiting
    }
    
    $attempt++
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host "  ✗ n8n failed to become healthy after $maxAttempts attempts" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ n8n is healthy and ready" -ForegroundColor Green

# Step 7: Import and activate workflows
Write-Host ""
Write-Host "[7/7] Importing n8n workflows..." -ForegroundColor Yellow
$workflowsDir = Join-Path $PSScriptRoot "..\workflows"
if (-not (Test-Path $workflowsDir)) {
    Write-Host "  ✗ Error: workflows directory not found at $workflowsDir" -ForegroundColor Red
    exit 1
}

$workflowFiles = Get-ChildItem -Path $workflowsDir -Filter "*.json"
if ($workflowFiles.Count -eq 0) {
    Write-Host "  ! Warning: No workflow JSON files found in $workflowsDir" -ForegroundColor Yellow
} else {
    $apiKey = "your-api-key-here"  # From .env N8N_API_KEY
    $n8nUrl = "http://localhost:5678"
    $headers = @{
        "X-N8N-API-KEY" = $apiKey
        "Content-Type" = "application/json"
    }
    
    $importedCount = 0
    foreach ($file in $workflowFiles) {
        try {
            $workflowJson = Get-Content $file.FullName -Raw
            $response = Invoke-RestMethod -Uri "$n8nUrl/api/v1/workflows" -Method POST -Headers $headers -Body $workflowJson -UseBasicParsing 2>&1
            
            if ($response.id) {
                # Activate the workflow
                $activateBody = @{ active = $true } | ConvertTo-Json
                Invoke-RestMethod -Uri "$n8nUrl/api/v1/workflows/$($response.id)" -Method PATCH -Headers $headers -Body $activateBody -UseBasicParsing 2>&1 | Out-Null
                
                Write-Host "  ✓ Imported and activated: $($file.Name)" -ForegroundColor Green
                $importedCount++
            }
        } catch {
            Write-Host "  ! Failed to import $($file.Name): $_" -ForegroundColor Yellow
        }
    }
    
    if ($importedCount -gt 0) {
        Write-Host "  ✓ Successfully imported $importedCount workflow(s)" -ForegroundColor Green
    }
}

# Final Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  • PostgreSQL: Running on localhost:5432" -ForegroundColor Gray
Write-Host "  • n8n:        http://localhost:5678" -ForegroundColor Gray
Write-Host "    Username:   admin" -ForegroundColor Gray
Write-Host "    Password:   admin" -ForegroundColor Gray
Write-Host ""
Write-Host "Database Summary:" -ForegroundColor White
Write-Host "  • 50 Patients (20 LASIK, 15 Cataract, 15 Premium Lens)" -ForegroundColor Gray
Write-Host "  • 3 Campaign Templates" -ForegroundColor Gray
Write-Host "  • 2 Campaigns (1 Active, 1 In Review)" -ForegroundColor Gray
Write-Host "  • 25+ Content Variants with 5 tone options" -ForegroundColor Gray
Write-Host "  • Mock delivery logs and analytics data" -ForegroundColor Gray
Write-Host ""
Write-Host "Webhook URLs:" -ForegroundColor White
Write-Host "  • Patient List:   GET  http://localhost:5678/webhook/patients" -ForegroundColor Gray
Write-Host "  • Patient Detail: GET  http://localhost:5678/webhook/patients/:id" -ForegroundColor Gray
Write-Host ""
Write-Host "Test Commands:" -ForegroundColor White
Write-Host '  # Get all LASIK patients' -ForegroundColor Gray
Write-Host '  curl "http://localhost:5678/webhook/patients?procedure_interest=LASIK"' -ForegroundColor Gray
Write-Host ""
Write-Host '  # Get high engagement patients' -ForegroundColor Gray
Write-Host '  curl "http://localhost:5678/webhook/patients?min_engagement_score=80"' -ForegroundColor Gray
Write-Host ""
Write-Host '  # Get specific patient (ID 1 = Sarah Mitchell)' -ForegroundColor Gray
Write-Host '  curl "http://localhost:5678/webhook/patients/1"' -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Open http://localhost:5678 in your browser" -ForegroundColor Gray
Write-Host "  2. Log in with admin/admin" -ForegroundColor Gray
Write-Host "  3. View the imported workflows" -ForegroundColor Gray
Write-Host "  4. Test the patient extraction webhook" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy demo building! 🚀" -ForegroundColor Cyan
Write-Host ""
