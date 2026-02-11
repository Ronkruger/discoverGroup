# Quick Save Script - No prompts, just save everything
# Usage: .\git-quick-save.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Quick save: $timestamp"

Write-Host "⚡ Quick Save Mode" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check for changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ No changes to save." -ForegroundColor Green
    exit 0
}

# Quick save
git add -A
git commit -m $message
$branch = git branch --show-current

# Push to personal repo
Write-Host "🚀 Pushing to personal repo..." -ForegroundColor Cyan
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push to personal repo failed" -ForegroundColor Red
    exit 1
}

# Push to company repo
Write-Host "🚀 Pushing to company repo..." -ForegroundColor Cyan
git push company $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push to company repo failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Saved and pushed to both repos!" -ForegroundColor Green
Write-Host "   ✅ Personal: Ronkruger/discoverGroup" -ForegroundColor Green
Write-Host "   ✅ Company: DiscoverGroup/discoverGrp" -ForegroundColor Green
