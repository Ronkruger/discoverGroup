# Automated Git Commit and Push to Both Personal and Company GitHub
# Usage: .\git-commit-dual.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dual GitHub Auto-Commit Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if there are changes
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Green
git status --short
Write-Host ""

# Stage all changes
Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A

# Commit changes
Write-Host "Committing with message: '$CommitMessage'" -ForegroundColor Cyan
git commit -m "$CommitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Commit successful!" -ForegroundColor Green
Write-Host ""

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Check if remotes exist
$remotes = git remote -v

# Push to origin (personal GitHub - Ronkruger)
if ($remotes -match "origin") {
    Write-Host "📤 Pushing to origin (Personal GitHub - Ronkruger)..." -ForegroundColor Cyan
    git push origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to origin (Ronkruger/discoverGroup)" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to origin" -ForegroundColor Red
    }
    Write-Host ""
}

# Push to company (company GitHub)
if ($remotes -match "company") {
    Write-Host "📤 Pushing to company GitHub..." -ForegroundColor Cyan
    git push company $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to company GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to company" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "ℹ️  No 'company' remote configured." -ForegroundColor Yellow
    Write-Host "   To add company remote, run:" -ForegroundColor Yellow
    Write-Host "   git remote add company `<company-repo-url`>" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Commit and Push Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Show final status
Write-Host "Final status:" -ForegroundColor Cyan
git status
