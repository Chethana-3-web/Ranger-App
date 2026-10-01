$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"
$content = $content -replace "import \{ View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator \} from 'react-native';", "import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';"

$newComponent = @"
const CommunityHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'community_reports'), where('rangerId', '==', user?.id));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) fetchReports();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };
"@

$content = $content -replace "(?s)const MyReports = .*?const CommunityHomeScreen = \(\) => \{.*?const \{ user \} = useAuth\(\);", $newComponent

$scrollStart = @"
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
        }
      >
"@
$content = $content -replace "      <ScrollView contentContainerStyle=\{styles\.scroll\}>", $scrollStart

$reportsRender = @"
        <View style={{marginTop: 20}}>
          <Text style={styles.sectionLabel}>My Submitted Reports</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{marginTop:20}} />
          ) : reports.length === 0 ? (
            <Text style={{color: COLORS.TEXT_SECONDARY, marginTop: 8, marginLeft: 4}}>No reports submitted yet.</Text>
          ) : (
            reports.map(r => (
              <View key={r.id} style={styles.reportCard}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={styles.reportType}>{r.type}</Text>
                  <Text style={[styles.reportStatus, r.status === 'NEEDS CLARIFICATION' && {color: '#f59e0b'}]}>{r.status === "PENDING_SYNC" ? "SUBMITTED" : r.status}</Text>
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
            ))
          )}
        </View>
"@
$content = $content -replace "\s*<MyReports userId=\{user\?\.id\} />", $reportsRender

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
