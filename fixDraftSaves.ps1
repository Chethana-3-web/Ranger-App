$content = Get-Content -Raw "src/features/log-incident/ui/screens/AddPhotoScreen.js"
$replacement = @"
        onCancel={async () => {
          setShowCancelDialog(false);
          if (photoUri) {
            const updated = updateDraftStep(draft, DraftStep.PHOTO, { photoUri });
            await draftRepo.save(updated);
          }
          navigation.navigate('Home');
        }}
"@
$content = $content -replace "onCancel=\{.*?setShowCancelDialog\(false\); navigation\.navigate\('Home'\);.*?\}", $replacement
Set-Content -Path "src/features/log-incident/ui/screens/AddPhotoScreen.js" -Value $content

$content = Get-Content -Raw "src/features/log-incident/ui/screens/DetailsScreen.js"
$replacement = @"
        onCancel={async () => {
          setShowCancelDialog(false);
          if (description) {
            const updated = updateDraftStep(draft, DraftStep.DETAILS, { description });
            await draftRepo.save(updated);
          }
          navigation.navigate('Home');
        }}
"@
$content = $content -replace "onCancel=\{.*?setShowCancelDialog\(false\); navigation\.navigate\('Home'\);.*?\}", $replacement
Set-Content -Path "src/features/log-incident/ui/screens/DetailsScreen.js" -Value $content

$content = Get-Content -Raw "src/features/log-incident/ui/screens/LocationCaptureScreen.js"
$replacement = @"
        onCancel={async () => {
          setShowCancelDialog(false);
          if (location) {
            const updated = updateDraftStep(draft, DraftStep.LOCATION, { location });
            await draftRepo.save(updated);
          }
          navigation.navigate('Home');
        }}
"@
$content = $content -replace "onCancel=\{.*?setShowCancelDialog\(false\);[\s\r\n]*navigation\.navigate\('Home'\);.*?\}", $replacement
Set-Content -Path "src/features/log-incident/ui/screens/LocationCaptureScreen.js" -Value $content
