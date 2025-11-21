#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated git commit and push with retry logic
.DESCRIPTION
    This script automates the git workflow with network retry logic:
    - Checks for changes
    - Stages all changes
    - Commits with a message (auto-generated or custom)
    - Pushes to both configured remotes with retry
.PARAMETER Message
    Custom commit message. If not provided, prompts for one.
.PARAMETER Auto
    Auto-generate commit message based on changed files
.PARAMETER MaxRetries
    Maximum number of retry attempts for push (default: 5)
.PARAMETER RetryDelay
    Delay in seconds between retries (default: 10)
.EXAMPLE
    .\git-auto-commit.ps1 -Message "Fixed bug in booking page"
.EXAMPLE
    .\git-auto-commit.ps1 -Auto
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Message,
    
    [Parameter(Mandatory=$false)]
    [switch]$Auto,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxRetries = 5,
    
    [Parameter(Mandatory=$false)]
    [int]$RetryDelay = 10
)

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Check if we're in a git repository
function Test-GitRepository {
    $gitDir = git rev-parse --git-dir 2>$null
    return $?
}

# Get current branch name
function Get-CurrentBranch {
    return git branch --show-current
}

# Check for uncommitted changes
function Test-HasChanges {
    $status = git status --porcelain
    return $status.Length -gt 0
}

# Auto-generate commit message based on changes
function Get-AutoCommitMessage {
    $added = @(git diff --cached --name-only --diff-filter=A)
    $modified = @(git diff --cached --name-only --diff-filter=M)
    $deleted = @(git diff --cached --name-only --diff-filter=D)
    
    $parts = @()
    
    if ($added.Count -gt 0) {
        $parts += "Add $($added.Count) file$(if($added.Count -gt 1){'s'})"
    }
    if ($modified.Count -gt 0) {
        $parts += "Update $($modified.Count) file$(if($modified.Count -gt 1){'s'})"
    }
    if ($deleted.Count -gt 0) {
        $parts += "Delete $($deleted.Count) file$(if($deleted.Count -gt 1){'s'})"
    }
    
    if ($parts.Count -eq 0) {
        return "Update project files"
    }
    
    return $parts -join ", "
}

# Push with retry logic
function Push-WithRetry {
    param(
        [int]$MaxRetries,
        [int]$RetryDelay
    )
    
    $attempt = 1
    
    while ($attempt -le $MaxRetries) {
        Write-ColorOutput "`n[>] Pushing to remote repositories (attempt $attempt/$MaxRetries)..." "Cyan"
        
        # Try to push
        git push 2>&1 | Tee-Object -Variable pushOutput
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[OK] Successfully pushed to all remotes!" "Green"
            return $true
        }
        
        # Check if it's a network error
        $networkError = $pushOutput | Select-String -Pattern "Failed to connect|Couldn't connect|Connection timed out|Connection refused"
        
        if ($networkError -and $attempt -lt $MaxRetries) {
            Write-ColorOutput "[!] Network error detected. Retrying in $RetryDelay seconds..." "Yellow"
            Start-Sleep -Seconds $RetryDelay
            $attempt++
        }
        else {
            if ($attempt -eq $MaxRetries) {
                Write-ColorOutput "[X] Failed to push after $MaxRetries attempts" "Red"
                Write-ColorOutput "Error: $pushOutput" "Red"
            }
            else {
                Write-ColorOutput "[X] Push failed with non-network error" "Red"
                Write-ColorOutput "Error: $pushOutput" "Red"
            }
            return $false
        }
    }
    
    return $false
}

# Main execution
Write-ColorOutput "`n==> Git Auto-Commit Script" "Cyan"
Write-ColorOutput "========================`n" "Cyan"

# Check if we're in a git repo
if (-not (Test-GitRepository)) {
    Write-ColorOutput "[X] Error: Not in a git repository" "Red"
    exit 1
}

$branch = Get-CurrentBranch
Write-ColorOutput "[*] Current branch: $branch" "Yellow"

# Check for changes
if (-not (Test-HasChanges)) {
    Write-ColorOutput "[i] No changes to commit" "Yellow"
    exit 0
}

# Show status
Write-ColorOutput "`n[+] Git Status:" "Cyan"
git status --short

# Stage all changes
Write-ColorOutput "`n[+] Staging all changes..." "Cyan"
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "[X] Failed to stage changes" "Red"
    exit 1
}

# Get or generate commit message
if ($Auto) {
    $commitMessage = Get-AutoCommitMessage
    Write-ColorOutput "`n[*] Auto-generated message: $commitMessage" "Yellow"
}
elseif ([string]::IsNullOrWhiteSpace($Message)) {
    Write-ColorOutput "`n[*] Enter commit message: " "Yellow" -NoNewline
    $commitMessage = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        Write-ColorOutput "[X] Commit message cannot be empty" "Red"
        exit 1
    }
}
else {
    $commitMessage = $Message
}

# Commit changes
Write-ColorOutput "`n[>] Committing changes..." "Cyan"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "[X] Commit failed" "Red"
    exit 1
}

Write-ColorOutput "[OK] Changes committed successfully!" "Green"

# Show commit info
$commitHash = git rev-parse --short HEAD
Write-ColorOutput "[#] Commit: $commitHash" "Yellow"

# Push with retry
$pushSuccess = Push-WithRetry -MaxRetries $MaxRetries -RetryDelay $RetryDelay

if ($pushSuccess) {
    Write-ColorOutput "`n[OK] All done! Changes are live on GitHub." "Green"
    exit 0
}
else {
    Write-ColorOutput "`n[!] Changes committed locally but not pushed to remote." "Yellow"
    Write-ColorOutput "You can manually push later with: git push" "Yellow"
    exit 1
}
