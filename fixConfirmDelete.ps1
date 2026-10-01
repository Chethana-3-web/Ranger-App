$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$deleteLogic = @"
  const deleteSubmittedReport = async () => {
    if (!selectedReport) return;
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this submitted report?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'community_reports', selectedReport.id));
              setReports(prev => prev.filter(r => r.id !== selectedReport.id));
              setSelectedReport(null);
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };
"@
$content = $content -replace "(?s)  const deleteSubmittedReport = async \(\) => \{.*?catch \(e\) \{\s*console\.error\(e\);\s*\}\s*\};", $deleteLogic

if ($content -notmatch "import \{.*?Alert.*?\}.*?'react-native'") {
  $content = $content -replace "import \{ View, Text", "import { View, Text, Alert"
}

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
