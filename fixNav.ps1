$files = @(
  "src/features/log-incident/ui/screens/IncidentTypeScreen.js",
  "src/features/log-incident/ui/screens/AddPhotoScreen.js",
  "src/features/log-incident/ui/screens/LocationCaptureScreen.js",
  "src/features/log-incident/ui/screens/DetailsScreen.js",
  "src/features/log-incident/ui/screens/ManualLocationScreen.js"
)

foreach ($file in $files) {
  $content = Get-Content -Raw $file
  $content = $content -replace "navigation\.navigate\('Home'\)", "navigation.navigate('CommunityHome')"
  Set-Content -Path $file -Value $content
}
