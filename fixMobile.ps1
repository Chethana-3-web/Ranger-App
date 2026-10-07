$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$content = $content -replace "import \{ collection, query, where, getDocs \} from 'firebase/firestore';", "import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';"

$deleteLogic = @"
  const deleteSubmittedReport = async () => {
    if (!selectedReport) return;
    try {
      await deleteDoc(doc(db, 'community_reports', selectedReport.id));
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = () => {
"@
$content = $content -replace "  const onRefresh = \(\) => \{", $deleteLogic

$deleteBtn = @"
                    {status === 'SUBMITTED' && (
                      <TouchableOpacity style={{backgroundColor: '#ef4444', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20}} onPress={deleteSubmittedReport}>
                        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Delete Report</Text>
                      </TouchableOpacity>
                    )}
                  </View>
"@
$content = $content -replace "                  </View>\r?\n\s*\);\r?\n\s*\}\)\(\)\}\r?\n\s*</ScrollView>", "$deleteBtn`n                );`n              })()}`n            </ScrollView>"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
