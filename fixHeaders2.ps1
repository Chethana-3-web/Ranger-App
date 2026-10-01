$files = @(
  "src/features/log-incident/ui/screens/AddPhotoScreen.js",
  "src/features/log-incident/ui/screens/LocationCaptureScreen.js",
  "src/features/log-incident/ui/screens/ManualLocationScreen.js"
)

foreach ($file in $files) {
  $content = Get-Content -Raw $file
  $content = $content -replace "onBack=\{handleCancel\}", "onBack={() => navigation.goBack()}`n        onClose={() => setShowCancelDialog(true)}"
  Set-Content -Path $file -Value $content
}
