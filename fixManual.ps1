$content = Get-Content -Raw "src/features/log-incident/ui/screens/ManualLocationScreen.js"

$content = $content -replace "const \[lngError, setLngError\] = useState\(null\);", "const [lngError, setLngError] = useState(null);`n  const [showCancelDialog, setShowCancelDialog] = useState(false);"

$dialogs = @"
      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancel Incident?"
        message="Do you want to keep this draft or discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Draft"
        confirmColor={theme.colors.error}
        onConfirm={async () => {
          setShowCancelDialog(false);
          await draftRepo.delete();
          navigation.navigate('Home');
        }}
        onCancel={() => {
          setShowCancelDialog(false);
          navigation.navigate('Home');
        }}
      />
    </SafeAreaView>
"@
$content = $content -replace "    </SafeAreaView>\s*\n*\s*\z", "$dialogs`n"

Set-Content -Path "src/features/log-incident/ui/screens/ManualLocationScreen.js" -Value $content
