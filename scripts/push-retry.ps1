# Quick Push - Retry with Network Error Handling
# Simple script to push with retries when GitHub is unreachable

$maxAttempts = 5
$attempt = 1
$success = $false

Write-Host ""
Write-Host "=== Pushing to GitHub with retry logic ===" -ForegroundColor Cyan
Write-Host ""

while ((-not $success) -and ($attempt -le $maxAttempts)) {
    Write-Host "Attempt $attempt of $maxAttempts..." -ForegroundColor Yellow
    
    git push 2>&1 | Tee-Object -Variable output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS: Push completed!" -ForegroundColor Green
        $success = $true
    } else {
        if ($output -match "fatal.*Failed to connect|Connection.*refused|Could.*not.*resolve") {
            Write-Host "Network error detected" -ForegroundColor Yellow
            
            if ($attempt -lt $maxAttempts) {
                $waitTime = $attempt * 3
                Write-Host "Waiting $waitTime seconds before retry..." -ForegroundColor Cyan
                Start-Sleep -Seconds $waitTime
            }
        } else {
            Write-Host "ERROR: Push failed with non-network error" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            break
        }
    }
    
    $attempt++
}

if (-not $success) {
    Write-Host ""
    Write-Host "ERROR: Failed to push after $maxAttempts attempts" -ForegroundColor Red
    Write-Host ""
    Write-Host "INFO: Your changes are committed locally. Try these:" -ForegroundColor Cyan
    Write-Host "   1. Check your internet connection" -ForegroundColor White
    Write-Host "   2. Try again later: git push" -ForegroundColor White
    Write-Host "   3. Or run this script again: .\push-retry.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: All done!" -ForegroundColor Green
Write-Host ""
