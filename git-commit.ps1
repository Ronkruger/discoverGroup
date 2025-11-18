# Automated Git Commit and Push Script
# Usage: .\git-commit.ps1 "Your commit message"
# Or just: .\git-commit.ps1 (will use default message with timestamp)

param(
    [string]$Message = ""
)

# Color functions
function Write-Success { param($text) Write-Host $text -ForegroundColor Green }
function Write-Info { param($text) Write-Host $text -ForegroundColor Cyan }
function Write-Warning { param($text) Write-Host $text -ForegroundColor Yellow }
function Write-Error { param($text) Write-Host $text -ForegroundColor Red }

Write-Info "🚀 Git Automation Script Starting..."
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Error "❌ Not a git repository. Please run this script from the project root."
    exit 1
}

# Check for changes
Write-Info "📊 Checking for changes..."
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Warning "⚠️  No changes to commit."
    exit 0
}

# Display changes
Write-Info "`n📝 Changes detected:"
git status --short
Write-Info ""

# Use provided message or generate one with timestamp
if ([string]::IsNullOrWhiteSpace($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "Auto-commit: Updates on $timestamp"
    Write-Info "💬 Using auto-generated commit message: '$Message'"
} else {
    Write-Info "💬 Commit message: '$Message'"
}

# Stage all changes
Write-Info "`n➕ Staging all changes..."
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to stage changes."
    exit 1
}
Write-Success "✅ All changes staged."

# Commit changes
Write-Info "`n💾 Committing changes..."
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to commit changes."
    exit 1
}
Write-Success "✅ Changes committed."

# Get current branch
$branch = git branch --show-current
Write-Info "`n🌿 Current branch: $branch"

# Push to remote
Write-Info "`n🚀 Pushing to origin/$branch..."
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to push to remote."
    Write-Warning "⚠️  Changes are committed locally but not pushed."
    Write-Info "💡 You can manually push later with: git push origin $branch"
    exit 1
}

Write-Success "`n✅ Successfully pushed to origin/$branch"
Write-Info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Success "🎉 All done!"
