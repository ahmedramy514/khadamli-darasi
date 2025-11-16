<#
PowerShell installer for Windows
Run from project root (PowerShell):
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\install.ps1

What this does:
- Verifies Node.js and npm are installed
- Runs `npm install` in `backend` and `frontend` if those folders exist
- Copies `.env.example` -> `.env` in backend if present (and updates USE_IN_MEMORY_DB=true)
- Creates `frontend/.env` with `REACT_APP_API_URL` default if missing
- Prints next steps to run servers
#>

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "خدملي دراسي — مساعد التثبيت لويندوز" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

function ExitWith($msg, $code=1) {
    Write-Host $msg -ForegroundColor Red
    exit $code
}

# Helper to safely join paths
function Join-PathSafe($base, $child) {
    return [System.IO.Path]::Combine($base, $child)
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $scriptRoot) { $scriptRoot = Get-Location }

# Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    ExitWith "Node.js غير موجود. نزّله من https://nodejs.org/ ثم أعد تشغيل هذا السكريبت."
}

$nodeVersion = node -v
Write-Host "Node.js مثبت: $nodeVersion" -ForegroundColor Green

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    ExitWith "npm غير موجود. تأكد من تثبيت Node.js والذي يتضمن npm ثم أعد التشغيل."
}

# Paths
$backendDir = Join-PathSafe $scriptRoot "backend"
$frontendDir = Join-PathSafe $scriptRoot "frontend"

# Install dependencies in backend
if (Test-Path $backendDir) {
    Write-Host "`nتثبيت حزم الـ backend..." -ForegroundColor Yellow
    Push-Location $backendDir
    npm install
    if ($LASTEXITCODE -ne 0) { ExitWith "خطأ أثناء npm install في مجلد backend." }

    # Copy .env.example if exists
    $envExample = Join-PathSafe $backendDir ".env.example"
    $envFile = Join-PathSafe $backendDir ".env"
    if (Test-Path $envExample -and -not (Test-Path $envFile)) {
        Copy-Item $envExample $envFile
        Write-Host "تم إنشاء backend/.env من .env.example" -ForegroundColor Green
    } elseif (-not (Test-Path $envFile)) {
        # create a minimal .env if none exists
        @"
MONGODB_URI=
JWT_SECRET=change_me
PORT=5001
USE_IN_MEMORY_DB=true
NODE_ENV=development
"@ | Out-File -FilePath $envFile -Encoding utf8
        Write-Host "تم إنشاء backend/.env مبدئي (USE_IN_MEMORY_DB=true)" -ForegroundColor Green
    } else {
        # ensure USE_IN_MEMORY_DB is set to true for local dev convenience
        (Get-Content $envFile) | ForEach-Object {
            if ($_ -match '^USE_IN_MEMORY_DB=') { $_ = 'USE_IN_MEMORY_DB=true' }
            $_
        } | Set-Content $envFile -Encoding utf8
        Write-Host "تأكدت من وجود USE_IN_MEMORY_DB=true في backend/.env" -ForegroundColor Green
    }

    Pop-Location
} else {
    Write-Host "مجلد backend غير موجود؛ تخطيت تثبيت backend." -ForegroundColor Yellow
}

# Install dependencies in frontend
if (Test-Path $frontendDir) {
    Write-Host "`nتثبيت حزم الـ frontend..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) { ExitWith "خطأ أثناء npm install في مجلد frontend." }

    # Create frontend/.env with REACT_APP_API_URL if not present
    $frontendEnv = Join-PathSafe $frontendDir ".env"
    if (-not (Test-Path $frontendEnv)) {
        @"
REACT_APP_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath $frontendEnv -Encoding utf8
        Write-Host "تم إنشاء frontend/.env مع REACT_APP_API_URL=http://localhost:5001/api" -ForegroundColor Green
    } else {
        Write-Host "frontend/.env موجود؛ لم أعدله." -ForegroundColor Cyan
    }

    Pop-Location
} else {
    Write-Host "مجلد frontend غير موجود؛ تخطيت تثبيت frontend." -ForegroundColor Yellow
}

Write-Host "`nتم تثبيت الحزم." -ForegroundColor Green

Write-Host "`nكيفية التشغيل (في نافذتين PowerShell):" -ForegroundColor Cyan
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White

Write-Host "`nTerminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White

Write-Host "`nافتح المتصفح: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nملاحظات:" -ForegroundColor Cyan
Write-Host "- إن لم يعمل الخادم، افتح نافذة backend لترى رسائل الخطأ (مثل منفذ مشغول أو مشكلة في الحزم)." -ForegroundColor White
Write-Host "- السكريبت لا يثبت Node.js أو MongoDB تلقائياً. نزّل Node.js من https://nodejs.org/ إذا لم يكن مثبتاً." -ForegroundColor White
Write-Host "- تم ضبط USE_IN_MEMORY_DB=true في backend/.env لتشغيل MongoDB في الذاكرة دون الحاجة لتثبيت MongoDB محلياً." -ForegroundColor White

Write-Host "`nانتهى." -ForegroundColor Green
