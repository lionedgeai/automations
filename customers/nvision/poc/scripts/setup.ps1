# n8n POC Setup Script
# Starts Docker Compose, waits for health, imports workflow, and activates it

param(
    [string]$EnvFile = ".env"
)

Write-Host "Starting n8n POC Setup..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path $EnvFile)) {
    if (Test-Path ".env.example") {
        Write-Host ".env file not found. Copying from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" $EnvFile
        Write-Host "Created .env file. Please review and update the values." -ForegroundColor Green
        Write-Host "   Especially: N8N_API_KEY, passwords" -ForegroundColor Yellow
    } else {
        Write-Host "No .env or .env.example found!" -ForegroundColor Red
        exit 1
    }
}

# Load environment variables
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$N8N_API_KEY = $env:N8N_API_KEY
$N8N_USER = $env:N8N_BASIC_AUTH_USER
$N8N_PASSWORD = $env:N8N_BASIC_AUTH_PASSWORD

Write-Host "Starting Docker Compose..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "Waiting for n8n to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678/healthz" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Not ready yet
    }
    
    $attempt++
    Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host "n8n failed to start within timeout. Check logs with: docker-compose logs n8n" -ForegroundColor Red
    exit 1
}

Write-Host "n8n is healthy!" -ForegroundColor Green

# Wait a bit more for full initialization
Start-Sleep -Seconds 3

Write-Host "Importing workflow..." -ForegroundColor Cyan

$workflowFile = "workflows/lead-to-sms-flow.json"
if (-not (Test-Path $workflowFile)) {
    Write-Host "Workflow file not found: $workflowFile" -ForegroundColor Red
    exit 1
}

$workflowJson = Get-Content $workflowFile -Raw

# Create base64 credentials for basic auth
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${N8N_USER}:${N8N_PASSWORD}"))

# Import workflow via API
try {
    $headers = @{
        "X-N8N-API-KEY" = $N8N_API_KEY
        "Authorization" = "Basic $base64Auth"
        "Content-Type" = "application/json"
    }
    
    $importResponse = Invoke-RestMethod -Uri "http://localhost:5678/api/v1/workflows" -Method POST -Headers $headers -Body $workflowJson -ContentType "application/json"
    
    $workflowId = $importResponse.id
    Write-Host "Workflow imported with ID: $workflowId" -ForegroundColor Green
    
    # Activate the workflow
    Write-Host "Activating workflow..." -ForegroundColor Cyan
    $activateBody = @{
        active = $true
    } | ConvertTo-Json
    
    $activateResponse = Invoke-RestMethod -Uri "http://localhost:5678/api/v1/workflows/$workflowId" -Method PATCH -Headers $headers -Body $activateBody -ContentType "application/json"
    
    Write-Host "Workflow activated!" -ForegroundColor Green
    
    # Get webhook URL
    Write-Host "`nSetup Complete!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "n8n UI:         http://localhost:5678" -ForegroundColor White
    Write-Host "Username:       $N8N_USER" -ForegroundColor White
    Write-Host "Password:       $N8N_PASSWORD" -ForegroundColor White
    Write-Host "`nWebhook URL:    http://localhost:5678/webhook/lead-to-sms" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`nTest the webhook with:" -ForegroundColor Cyan
    Write-Host @"
curl -X POST http://localhost:5678/webhook/lead-to-sms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "company": "Acme Corp"
  }'
"@ -ForegroundColor Gray
    
} catch {
    Write-Host "Failed to import/activate workflow: $_" -ForegroundColor Red
    Write-Host "You can manually import the workflow from: $workflowFile" -ForegroundColor Yellow
    exit 1
}
