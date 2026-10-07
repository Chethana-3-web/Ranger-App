$content = Get-Content -Raw "src/screens/community/CommunityHomeScreen.js"

$modalImports = @"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Image } from 'react-native';
"@
$content = $content -replace "import \{ View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl \} from 'react-native';", $modalImports

$modalState = @"
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);
"@
$content = $content -replace "const \[refreshing, setRefreshing\] = React\.useState\(false\);", $modalState

$reportCard = @"
              <TouchableOpacity key={r.id} style={styles.reportCard} onPress={() => setSelectedReport(r)} activeOpacity={0.7}>
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
              </TouchableOpacity>
"@
$content = $content -replace "(?s)<View key=\{r\.id\} style=\{styles\.reportCard\}>.*?</View>\r?\n\s*\)\)", "$reportCard`n            ))"

$modalUI = @"
      <Modal visible={!!selectedReport} transparent animationType="slide" onRequestClose={() => setSelectedReport(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 20}}>
              {selectedReport && (() => {
                const status = selectedReport.status === 'PENDING_SYNC' ? 'SUBMITTED' : selectedReport.status;
                
                let step = 1; // New
                if (status === 'IN PROGRESS' || status === 'NEEDS CLARIFICATION' || status === 'In Progress') step = 2;
                if (status === 'HANDLED' || status === 'Resolved' || status === 'RESOLVED') step = 3;

                return (
                  <View>
                    <View style={styles.statusBox}>
                      <View style={[styles.statusIconBg, step === 3 ? {backgroundColor: '#dcfce7'} : {backgroundColor: '#e0e7ff'}]}>
                        <Ionicons name={step === 3 ? 'checkmark' : 'time'} size={32} color={step === 3 ? '#22c55e' : '#6366f1'} />
                      </View>
                      <Text style={styles.statusTitle}>Status: {status}</Text>
                      <Text style={styles.statusSub}>Reported on {new Date(selectedReport.recordedAt).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.stepperBox}>
                      <Text style={styles.stepperLabel}>RESOLUTION PROGRESS</Text>
                      <View style={styles.stepperTrack}>
                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                            {step >= 1 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 1 && styles.stepTextActive]}>New</Text>
                        </View>
                        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                        
                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                            {step >= 2 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 2 && styles.stepTextActive]}>In Progress</Text>
                        </View>
                        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

                        <View style={styles.stepItem}>
                          <View style={[styles.stepDot, step >= 3 && styles.stepDotActive, step < 3 && styles.stepDotPending]}>
                            {step >= 3 && <Ionicons name="checkmark" size={16} color="#fff" />}
                          </View>
                          <Text style={[styles.stepText, step >= 3 && styles.stepTextActive]}>Resolved</Text>
                        </View>
                      </View>
                    </View>

                    {selectedReport.officerMessage && (
                      <View style={{marginTop: 20}}>
                        <Text style={styles.stepperLabel}>Final Resolution Notes / Officer Message</Text>
                        <View style={styles.notesBox}>
                          <Text style={styles.notesText}>{selectedReport.officerMessage}</Text>
                        </View>
                      </View>
                    )}

                    <View style={{marginTop: 20, marginBottom: 40}}>
                      <Text style={styles.stepperLabel}>Incident Information</Text>
                      <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Type:</Text>
                        <Text style={styles.infoValue}>{selectedReport.type}</Text>
                        
                        <Text style={[styles.infoLabel, {marginTop: 10}]}>Description:</Text>
                        <Text style={styles.infoValue}>{selectedReport.description}</Text>

                        {selectedReport.photoUri && (
                           <Image source={{uri: selectedReport.photoUri}} style={styles.modalImage} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
"@
$content = $content -replace "\s*</SafeAreaView>\s*\z", "`n$modalUI"

$modalStyles = @"
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.BACKGROUND, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY },
  statusBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statusIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusTitle: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  statusSub: { fontSize: 13, color: COLORS.TEXT_SECONDARY },
  stepperBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  stepperLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.TEXT_SECONDARY, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  stepperTrack: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  stepItem: { alignItems: 'center', width: 60 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginBottom: 8, zIndex: 2 },
  stepDotActive: { backgroundColor: '#16a34a' },
  stepDotPending: { borderWidth: 4, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  stepText: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '600', textAlign: 'center' },
  stepTextActive: { color: COLORS.TEXT_PRIMARY },
  stepLine: { flex: 1, height: 3, backgroundColor: '#e5e7eb', marginHorizontal: -10, zIndex: 1, marginTop: -20 },
  stepLineActive: { backgroundColor: '#16a34a' },
  notesBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.BORDER },
  notesText: { fontSize: 14, color: COLORS.TEXT_PRIMARY, lineHeight: 22 },
  infoBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.BORDER },
  infoLabel: { fontSize: 12, color: COLORS.TEXT_SECONDARY, fontWeight: 'bold' },
  infoValue: { fontSize: 15, color: COLORS.TEXT_PRIMARY, marginTop: 4 },
  modalImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 16 },
"@
$content = $content -replace "reportCard: \{", "$modalStyles`n  reportCard: {"

Set-Content -Path "src/screens/community/CommunityHomeScreen.js" -Value $content
