# Deployment Helper Script for DiscoverGroup Monorepo (Windows PowerShell)
# Run this with: .\deploy-setup.ps1

Write-Host "🚀 DiscoverGroup Deployment Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Current Project Structure:" -ForegroundColor Yellow
Write-Host "   ├── src/ (Client App)"
Write-Host "   ├── apps/admin/ (Admin Panel)"
Write-Host "   └── apps/api/ (Backend API)"
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if (-Not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

$gitVersion = git --version 2>$null
if (-Not $gitVersion) {
    Write-Host "❌ Git not found. Please install Git." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites satisfied (Node: $nodeVersion)" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Installing admin dependencies..." -ForegroundColor Cyan
Push-Location apps\admin
npm install
Pop-Location

Write-Host ""
Write-Host "Installing API dependencies..." -ForegroundColor Cyan
Push-Location apps\api
npm install
Pop-Location

Write-Host ""
Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host ""

# Check for environment files
Write-Host "🔐 Checking environment files..." -ForegroundColor Yellow
$envMissing = $false

if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Missing: .env (Client)" -ForegroundColor Yellow
    $envMissing = $true
}

if (-Not (Test-Path "apps\admin\.env")) {
    Write-Host "⚠️  Missing: apps\admin\.env (Admin)" -ForegroundColor Yellow
    $envMissing = $true
}

if (-Not (Test-Path "apps\api\.env")) {
    Write-Host "⚠️  Missing: apps\api\.env (API)" -ForegroundColor Yellow
    $envMissing = $true
}

if ($envMissing) {
    Write-Host ""
    Write-Host "📝 To create environment files, copy from examples:" -ForegroundColor Cyan
    Write-Host "   Copy-Item .env.example .env"
    Write-Host "   Copy-Item apps\admin\.env.example apps\admin\.env"
    Write-Host "   Copy-Item apps\api\.env.example apps\api\.env"
    Write-Host ""
} else {
    Write-Host "✅ All environment files present" -ForegroundColor Green
    Write-Host ""
}

# Deployment instructions
Write-Host "🌐 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Netlify (Recommended for Frontend)" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
Write-Host "1. Create TWO Netlify sites:"
Write-Host "   a) Client Site:"
Write-Host "      - Base directory: (leave empty)"
Write-Host "      - Build command: npm run build"
Write-Host "      - Publish directory: src/build"
Write-Host ""
Write-Host "   b) Admin Site:"
Write-Host "      - Base directory: apps/admin"
Write-Host "      - Build command: npm run build"
Write-Host "      - Publish directory: apps/admin/dist"
Write-Host ""
Write-Host "2. Set environment variables in Netlify dashboard for each site"
Write-Host ""
Write-Host "Option 2: Railway/Render (For API)" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "1. Deploy API from apps/api folder"
Write-Host "2. Set all environment variables from apps\api\.env.example"
Write-Host "3. Update CORS_ORIGINS with your frontend URLs"
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Read DEPLOYMENT_GUIDE.md for detailed instructions"
Write-Host "2. Set up your environment variables"
Write-Host "3. Create Netlify sites for client and admin"
Write-Host "4. Deploy API to Railway or Render"
Write-Host "5. Update API URLs in client and admin .env files"
Write-Host ""
Write-Host "🎉 Setup complete! Run 'npm run dev' to start development!" -ForegroundColor Green
