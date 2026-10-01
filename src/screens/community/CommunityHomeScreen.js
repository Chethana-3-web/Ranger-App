import React from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../core/constants/colors';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../core/config/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { useDraftRepo } from '../../features/log-incident/ui/hooks/useDraftRepo';
import { getRestoreStep, DraftStep } from '../../features/log-incident/domain/draft';

const STEP_ROUTES = {
  [DraftStep.TYPE]:     'IncidentType',
  [DraftStep.PHOTO]:    'AddPhoto',
  [DraftStep.LOCATION]: 'LocationCapture',
  [DraftStep.DETAILS]:  'Details',
};


const CommunityHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>WildWatch Community</Text>
          <Text style={styles.headerSub}>Welcome, {user?.fullName || 'Villager'}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="people" size={28} color="#fff" />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
        }
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Protect Our Wildlife</Text>
          <Text style={styles.welcomeText}>
            As a community member, your reports help rangers keep our wildlife safe. Report any illegal activities or wildlife sightings you encounter.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Actions</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CommunityReportFlow')}
          activeOpacity={0.8}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="megaphone" size={32} color={COLORS.PRIMARY} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Submit Community Report</Text>
            <Text style={styles.actionDesc}>Report snares, traps, or suspicious activities anonymously and safely.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
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
        <View style={{marginTop: 20}}>
          <Text style={styles.sectionLabel}>My Submitted Reports</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{marginTop:20}} />
          ) : reports.length === 0 ? (
            <Text style={{color: COLORS.TEXT_SECONDARY, marginTop: 8, marginLeft: 4}}>No reports submitted yet.</Text>
          ) : (
            reports.map(r => (
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
            ))
          )}
        </View>
      </ScrollView>
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
                    {status === 'SUBMITTED' && (
                      <TouchableOpacity style={{backgroundColor: '#ef4444', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20}} onPress={deleteSubmittedReport}>
                        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Delete Report</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.HEADER_BG,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16, paddingBottom: 80 },
  welcomeCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY,
    marginBottom: 12, marginLeft: 4,
  },
  actionCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4,
  },
  actionDesc: {
    fontSize: 13, color: COLORS.TEXT_SECONDARY, lineHeight: 18,
  },
    draftCard: {
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  draftBtn: {
    flex: 1, padding: 10, borderRadius: 8, alignItems: 'center'
  },
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

export default CommunityHomeScreen;








