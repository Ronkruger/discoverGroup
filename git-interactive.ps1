# Interactive Git Commit Script
# Prompts for commit message and confirms before pushing

Write-Host "`n🎨 Interactive Git Commit" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check for changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "`n✅ No changes to commit." -ForegroundColor Green
    exit 0
}

# Display changes
Write-Host "`n📝 Current changes:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Prompt for commit message
$message = Read-Host "Enter commit message (or press Enter for auto-generated)"
if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $message = "Updates on $timestamp"
    Write-Host "Using auto-generated message: '$message'" -ForegroundColor Gray
}

# Stage changes
Write-Host "`n➕ Staging changes..." -ForegroundColor Cyan
git add -A

# Commit
Write-Host "💾 Committing..." -ForegroundColor Cyan
git commit -m $message

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

# Get branch
$branch = git branch --show-current
Write-Host "✅ Committed to $branch" -ForegroundColor Green

# Confirm push
Write-Host "`n🚀 Push to origin/$branch?" -ForegroundColor Yellow
$confirm = Read-Host "Press Enter to push, or 'n' to skip"

if ($confirm -ne 'n') {
    Write-Host "Pushing..." -ForegroundColor Cyan
    git push origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to origin/$branch" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Push failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n⏭️  Skipped push. Run 'git push' manually when ready." -ForegroundColor Yellow
}

Write-Host "`n🎉 Done!" -ForegroundColor Green
