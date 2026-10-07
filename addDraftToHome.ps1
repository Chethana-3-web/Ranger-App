$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$imports = @"
import { useFocusEffect } from '@react-navigation/native';
import { useDraftRepo } from '../../features/log-incident/ui/hooks/useDraftRepo';
import { getRestoreStep, DraftStep } from '../../features/log-incident/domain/draft';

const STEP_ROUTES = {
  [DraftStep.TYPE]:     'IncidentType',
  [DraftStep.PHOTO]:    'AddPhoto',
  [DraftStep.LOCATION]: 'LocationCapture',
  [DraftStep.DETAILS]:  'Details',
};
"@
$content = $content -replace "import \{ db \} from '../../core/config/firebase';", "import { db } from '../../core/config/firebase';`n$imports"

$draftLogic = @"
  const draftRepo = useDraftRepo();
  const [draft, setDraft] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      draftRepo.find().then((found) => {
        setDraft(found);
      });
    }, [draftRepo])
  );

  const handleResumeDraft = () => {
    if (!draft) return;
    const step = getRestoreStep(draft);
    const route = STEP_ROUTES[step] ?? 'IncidentType';
    navigation.navigate('CommunityReportFlow', { screen: route, params: { draft } });
  };

  const handleDeleteDraft = async () => {
    await draftRepo.delete();
    setDraft(null);
  };
"@
$content = $content -replace "const \[refreshing, setRefreshing\] = React\.useState\(false\);", "const [refreshing, setRefreshing] = React.useState(false);`n$draftLogic"

$draftUI = @"
        {draft && (
          <View style={{marginTop: 20}}>
            <Text style={styles.sectionLabel}>Saved Draft</Text>
            <View style={styles.draftCard}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="document-text" size={24} color={COLORS.PRIMARY} />
                <View style={{marginLeft: 12, flex: 1}}>
                  <Text style={styles.reportType}>Incomplete Report</Text>
                  <Text style={styles.reportDate}>Started at: {new Date(draft.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', marginTop: 12, gap: 12}}>
                <TouchableOpacity style={[styles.draftBtn, {backgroundColor: COLORS.PRIMARY}]} onPress={handleResumeDraft}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.draftBtn, {backgroundColor: '#ef4444'}]} onPress={handleDeleteDraft}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
"@
$content = $content -replace "<MyReports userId=\{user\?\.id\} />", "$draftUI`n        <MyReports userId={user?.id} />"

$draftStyle = @"
  draftCard: {
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  draftBtn: {
    flex: 1, padding: 10, borderRadius: 8, alignItems: 'center'
  },
"@
$content = $content -replace "reportCard: \{", "$draftStyle`n  reportCard: {"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
