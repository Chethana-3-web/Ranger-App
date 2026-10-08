# Expo Publish Script for Ranger App
# Usage: ./publish.ps1

Write-Host "Starting Expo publish for ranger-app..." -ForegroundColor Green

# Step 1: Check if logged in
Write-Host "`nChecking Expo login status..." -ForegroundColor Cyan
npx expo whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nNot logged in. Logging in as 'cheind'..." -ForegroundColor Yellow
    Write-Host "You will be prompted to enter your password." -ForegroundColor Yellow
    npx expo login --username cheind
}

# Step 2: Publish
Write-Host "`nPublishing app..." -ForegroundColor Cyan
npx expo publish

Write-Host "`n✅ Done! Your app is now published." -ForegroundColor Green
Write-Host "Share the link with your team to test the app using Expo Go." -ForegroundColor Green
