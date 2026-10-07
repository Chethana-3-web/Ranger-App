$files = @(
  "src/features/log-incident/ui/screens/IncidentTypeScreen.js",
  "src/features/log-incident/ui/screens/AddPhotoScreen.js",
  "src/features/log-incident/ui/screens/DetailsScreen.js",
  "src/features/log-incident/ui/screens/LocationCaptureScreen.js",
  "src/features/log-incident/ui/screens/ManualLocationScreen.js"
)

foreach ($file in $files) {
  $content = Get-Content -Raw $file
  
  if ($file -match "IncidentTypeScreen") {
    $replacement = @"
  const handleKeepDraft = async () => {
    setShowCancelDialog(false);
    if (selectedType) {
      const draft = updateDraftStep(
        createDraft(new Date().toISOString()),
        DraftStep.TYPE,
        { type: selectedType }
      );
      await draftRepo.save(draft);
    }
    navigation.navigate('Home');
  };
"@
    $content = $content -replace "  const handleDiscardDraft", "$replacement`n`n  const handleDiscardDraft"
    $content = $content -replace "onCancel=\{.*?setShowCancelDialog\(false\).*?\}", "onCancel={handleKeepDraft}"
  } else {
    $content = $content -replace "onCancel=\{.*?setShowCancelDialog\(false\).*?\}", "onCancel={() => { setShowCancelDialog(false); navigation.navigate('Home'); }}"
  }
  
  Set-Content -Path $file -Value $content
}
