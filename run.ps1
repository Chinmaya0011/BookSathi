param (
    [switch]$Test,
    [switch]$Seed,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\run.ps1 [-Test] [-Seed] [-Help]" -ForegroundColor Cyan
    Write-Host "  -Test : Run backend test suites before starting"
    Write-Host "  -Seed : Seed demo data into database"
    Write-Host "  -Help : Show this help message"
    exit 0
}

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $ScriptDir) { $ScriptDir = Get-Location }
Set-Location $ScriptDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BookSaathi - Indian Professional Booking Platform     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Environment files verification
Write-Host "[1/4] Verifying environment configurations..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env") -and (Test-Path "backend\.env.example")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "   + Created backend\.env" -ForegroundColor Green
}
if (-not (Test-Path "frontend\.env.local") -and (Test-Path "frontend\.env.example")) {
    Copy-Item "frontend\.env.example" "frontend\.env.local"
    Write-Host "   + Created frontend\.env.local" -ForegroundColor Green
}

# 2. Clear Port Conflicts (3000 & 5000)
Write-Host "[2/4] Clearing existing processes on ports 3000 and 5000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 5000,3000 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# 3. Seed if requested
if ($Seed) {
    Write-Host "[*] Seeding database with demo data..." -ForegroundColor Cyan
    Set-Location "$ScriptDir\backend"
    node src/seeds/seed.js
    Set-Location $ScriptDir
}

# 4. Run tests if requested
if ($Test) {
    Write-Host "[*] Running Backend test suites..." -ForegroundColor Cyan
    Set-Location "$ScriptDir\backend"
    node tests/concurrency.test.js
    node tests/payment.test.js
    Set-Location $ScriptDir
}

# 5. Launch Backend & Frontend in separate PowerShell processes
Write-Host "[3/4] Starting Backend REST API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; Write-Host '--- BookSaathi Backend API (Port 5000) ---' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Frontend Web Application on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\frontend'; Write-Host '--- BookSaathi Frontend Web (Port 3000) ---' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  BookSaathi services launched successfully!" -ForegroundColor Green
Write-Host "   - Landing Page:  http://localhost:3000" -ForegroundColor White
Write-Host "   - Demo Link:     http://localhost:3000/book/dr-rajesh" -ForegroundColor White
Write-Host "   - Dashboard:     http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   - QR Banner:     http://localhost:3000/dashboard/qr-banner" -ForegroundColor White
Write-Host "   - Backend API:   http://localhost:5000/api/health" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
