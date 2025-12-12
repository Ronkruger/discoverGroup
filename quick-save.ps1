# Quick Save - Fast git commit to both remotes
# Usage: .\quick-save.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Quick save: $timestamp"

Write-Host "⚡ Quick Save Started..." -ForegroundColor Yellow
Write-Host ""

# Check for changes
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "✅ No changes to save." -ForegroundColor Green
    exit 0
}

# Show what's being saved
Write-Host "📁 Files to save:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Stage, commit, and push
git add -A
git commit -m "$message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

$branch = git rev-parse --abbrev-ref HEAD

# Push to both remotes
Write-Host "📤 Pushing to all remotes..." -ForegroundColor Cyan

# Push to origin (personal)
git push origin $branch 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Personal GitHub (origin)" -ForegroundColor Green
} else {
    Write-Host "❌ Personal GitHub failed" -ForegroundColor Red
}

# Push to company (if exists)
$remotes = git remote -v
if ($remotes -match "company") {
    git push company $branch 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Company GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ Company GitHub failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Quick save complete!" -ForegroundColor Green
