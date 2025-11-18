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
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Saved and pushed to $branch" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed" -ForegroundColor Red
    exit 1
}
