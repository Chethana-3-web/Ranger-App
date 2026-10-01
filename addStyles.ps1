$content = Get-Content -Raw "src/screens/ProfileScreen.js"

$modalStyles = @"
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.TEXT_PRIMARY },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.TEXT_SECONDARY, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: 12, fontSize: 16, color: COLORS.TEXT_PRIMARY },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
});
"@
$content = $content -replace "\}\);\s*export default ProfileScreen;", "$modalStyles`n`nexport default ProfileScreen;"

Set-Content -Path "src/screens/ProfileScreen.js" -Value $content
