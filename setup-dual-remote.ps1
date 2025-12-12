# Setup Git Remotes for Dual Push
# Run this once to configure both personal and company GitHub remotes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Dual Remote Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current remotes
Write-Host "Current remotes:" -ForegroundColor Cyan
git remote -v
Write-Host ""

# Check if origin exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "❌ No 'origin' remote found!" -ForegroundColor Red
    Write-Host "Please add your personal GitHub remote first:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/Ronkruger/discoverGroup.git" -ForegroundColor Yellow
    exit 1
}

# Add company remote
Write-Host "Setting up company remote..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Enter your company GitHub repository URL:" -ForegroundColor Yellow
Write-Host "Example: https://github.com/company-name/discovergroup.git" -ForegroundColor Gray
$companyUrl = Read-Host "Company repo URL"

if ([string]::IsNullOrWhiteSpace($companyUrl)) {
    Write-Host "❌ No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Check if company remote already exists
if ($remotes -contains "company") {
    Write-Host "⚠️  'company' remote already exists. Updating..." -ForegroundColor Yellow
    git remote remove company
}

# Add company remote
git remote add company $companyUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Company remote added successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add company remote" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Current remotes (updated):" -ForegroundColor Cyan
git remote -v
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now use:" -ForegroundColor Green
Write-Host "  .\git-commit-dual.ps1 'Your message'  - Commit and push to both" -ForegroundColor White
Write-Host "  .\quick-save.ps1                       - Quick save to both" -ForegroundColor White
Write-Host ""
