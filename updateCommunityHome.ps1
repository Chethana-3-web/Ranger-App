$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"
$import = "import { collection, query, where, getDocs } from 'firebase/firestore';`nimport { db } from '../../core/config/firebase';"

$content = $content -replace "import COLORS from '../../core/constants/colors';", "import COLORS from '../../core/constants/colors';`n$import"

$myReportsComponent = @"

const MyReports = ({ userId }) => {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'community_reports'), where('rangerId', '==', userId));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a,b) => new Date(b.recordedAt) - new Date(a.recordedAt));
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchReports();
  }, [userId]);

  if (loading) return <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{marginTop:20}} />;
  if (reports.length === 0) return null;

  return (
    <View style={{marginTop: 20}}>
      <Text style={styles.sectionLabel}>My Submitted Reports</Text>
      {reports.map(r => (
        <View key={r.id} style={styles.reportCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.reportType}>{r.type}</Text>
            <Text style={[styles.reportStatus, r.status === 'NEEDS CLARIFICATION' && {color: '#f59e0b'}]}>{r.status}</Text>
          </View>
          <Text style={styles.reportDate}>{new Date(r.recordedAt).toLocaleString()}</Text>
          <Text style={styles.reportDesc} numberOfLines={2}>{r.description}</Text>
          {r.officerMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Message from Officer:</Text>
              <Text style={styles.messageText}>{r.officerMessage}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};
"@

$content = $content -replace "const CommunityHomeScreen", "$myReportsComponent`n`nconst CommunityHomeScreen"
$content = $content -replace "</ScrollView>", "  <MyReports userId={user?.id} />`n      </ScrollView>"

$styles = @"
  reportCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  reportType: { fontSize: 16, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
  reportStatus: { fontSize: 12, fontWeight: 'bold', color: COLORS.PRIMARY, marginTop: 2 },
  reportDate: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginVertical: 4 },
  reportDesc: { fontSize: 14, color: COLORS.TEXT_PRIMARY },
  messageBox: { marginTop: 12, backgroundColor: '#fef3c7', padding: 12, borderRadius: 8 },
  messageLabel: { fontSize: 12, fontWeight: 'bold', color: '#b45309', marginBottom: 4 },
  messageText: { fontSize: 14, color: '#92400e' },
});
"@

$content = $content -replace "\}\);(\r?\n)*export default CommunityHomeScreen;", "$styles`n`nexport default CommunityHomeScreen;"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
