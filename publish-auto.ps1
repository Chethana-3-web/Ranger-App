# Automated Expo Publish Script
$username = "cheind"
$password = "Ranger12345"

Write-Host "🚀 Starting automated Expo publish..." -ForegroundColor Green
Write-Host "Username: $username" -ForegroundColor Cyan

# Create a temporary file with login credentials
$tempFile = [System.IO.Path]::GetTempFileName()

# Step 1: Login
Write-Host "`n📝 Logging into Expo..." -ForegroundColor Cyan
$loginProcess = Start-Process -FilePath "npx" -ArgumentList "expo", "login", "--username", $username -NoNewWindow -PassThru -RedirectStandardInput $tempFile -Wait

# Step 2: Publish
Write-Host "`n📤 Publishing app to Expo..." -ForegroundColor Cyan
npx expo publish

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! Your app has been published!" -ForegroundColor Green
    Write-Host "`n📱 Share this link with your team:" -ForegroundColor Yellow
    Write-Host "exp://exp.host/@cheind/ranger-app" -ForegroundColor White
    Write-Host "`n📲 To test:" -ForegroundColor Cyan
    Write-Host "1. Download 'Expo Go' app from App Store or Google Play" -ForegroundColor Gray
    Write-Host "2. Open the link above" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Publishing failed. Check the output above." -ForegroundColor Red
}

# Cleanup
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
