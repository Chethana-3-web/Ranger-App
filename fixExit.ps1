$files = @(
  "src/features/log-incident/ui/screens/IncidentTypeScreen.js",
  "src/features/log-incident/ui/screens/AddPhotoScreen.js",
  "src/features/log-incident/ui/screens/LocationCaptureScreen.js",
  "src/features/log-incident/ui/screens/ManualLocationScreen.js"
)

foreach ($file in $files) {
  $content = Get-Content -Raw $file
  if ($content -notmatch "useAuth") {
    $content = $content -replace "import \{ useNavigation", "import { useAuth } from '../../../../context/AuthContext';`nimport { useNavigation"
  }
  
  $content = $content -replace "const navigation = useNavigation\(\);", "const navigation = useNavigation();`n  const auth = useAuth();`n  const isCommunity = auth?.user?.role === 'community';"
  
  $content = $content -replace "navigation\.navigate\('CommunityHome'\)", "navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList')"
  $content = $content -replace "navigation\.navigate\('Home'\)", "navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList')"

  Set-Content -Path $file -Value $content
}

# Fix DetailsScreen separately since it already has useAuth
$content = Get-Content -Raw "src/features/log-incident/ui/screens/DetailsScreen.js"
$content = $content -replace "navigation\.navigate\('CommunityHome'\)", "navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList')"
$content = $content -replace "navigation\.navigate\('Home'\)", "navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList')"
Set-Content -Path "src/features/log-incident/ui/screens/DetailsScreen.js" -Value $content
