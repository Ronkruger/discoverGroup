# 🚀 Quick Gmail Setup for romanolantano.discovergrp@gmail.com

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📧 Gmail SMTP Configuration Helper" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Step 1: Generate App Password" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
Write-Host "1. Opening Google App Passwords page..."
Start-Process "https://myaccount.google.com/apppasswords"
Write-Host "2. Sign in with: romanolantano.discovergrp@gmail.com" -ForegroundColor Green
Write-Host "3. If you see 'App passwords unavailable':" -ForegroundColor Red
Write-Host "   → Enable 2-Step Verification first:" -ForegroundColor Red
Write-Host "   → https://myaccount.google.com/signinoptions/two-step-verification" -ForegroundColor Red
Write-Host "4. Create app password named: 'Discover Group API'" -ForegroundColor Green
Write-Host "5. Copy the 16-character password`n" -ForegroundColor Green

Read-Host "Press ENTER when you have the app password ready"

Write-Host "`nStep 2: Configure Render Environment" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
Write-Host "Opening Render Dashboard..."
Start-Process "https://dashboard.render.com"

Write-Host "`nAdd these environment variables:" -ForegroundColor Green
Write-Host ""
Write-Host "EMAIL_USER=romanolantano.discovergrp@gmail.com" -ForegroundColor Cyan
Write-Host "EMAIL_PASS=<your-16-char-app-password>" -ForegroundColor Cyan
Write-Host "SENDGRID_FROM_EMAIL=romanolantano.discovergrp@gmail.com" -ForegroundColor Cyan
Write-Host "SENDGRID_FROM_NAME=Discover Group Travel" -ForegroundColor Cyan
Write-Host "CLIENT_URL=https://discovergroup.netlify.app" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT: Remove or comment out SENDGRID_API_KEY" -ForegroundColor Red
Write-Host ""

Read-Host "Press ENTER when environment variables are configured"

Write-Host "`nStep 3: Verify User Email (Temporary Fix)" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host "While waiting for Render to redeploy, let's verify your account manually`n" -ForegroundColor White

$email = "romslantano@gmail.com"
$confirm = Read-Host "Verify email for '$email'? (Y/N)"

if ($confirm -eq "Y" -or $confirm -eq "y") {
    Write-Host "`nRunning verification script..." -ForegroundColor Green
    node scripts/verify-user-email.cjs $email
} else {
    Write-Host "Skipping manual verification" -ForegroundColor Yellow
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Steps Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for Render to redeploy" -ForegroundColor White
Write-Host "2. Check Render logs for email configuration" -ForegroundColor White
Write-Host "3. Test login at: https://discovergroup.netlify.app/login" -ForegroundColor White
Write-Host "4. Try 'Resend Verification Email' button" -ForegroundColor White
Write-Host "5. Check romanolantano.discovergrp@gmail.com inbox`n" -ForegroundColor White

Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - GMAIL_SETUP_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "   - TROUBLESHOOTING_EMAIL_VERIFICATION.md`n" -ForegroundColor White

Read-Host "Press ENTER to exit"
