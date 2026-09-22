/**
 * Ranger App – Incident List Screen
 *
 * Displays all incidents logged via the Log Incident feature.
 * Pull-to-refresh reloads from the feature's repository.
 * FAB navigates to the LogIncidentFlow.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useSession } from '../core/session/SessionContext';
import AppHeader from '../core/ui/AppHeader';
import OfflineBanner from '../core/ui/OfflineBanner';
import { SyncStatus, SYNC_STATUS_LABELS } from '../features/log-incident/domain/syncStatus';
import { useIncidentServices } from '../features/log-incident/ui/hooks/useIncidentServices';
import COLORS from '../core/constants/colors';
import theme from '../core/ui/theme';

const STATUS_COLORS = {
  [SyncStatus.PENDING_SYNC]: COLORS.STATUS_PENDING,
  [SyncStatus.SYNCED]:       COLORS.STATUS_SYNCED,
  [SyncStatus.FAILED]:       COLORS.STATUS_FAILED,
};

const IncidentListScreen = () => {
  const navigation  = useNavigation();
  const { patrol }  = useSession();
  const services    = useIncidentServices();

  const [incidents, setIncidents]   = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const all = await services.incidentRepo.findAll();
      setIncidents([...all].sort(
        (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt),
      ));
    } catch { /* repo not initialised yet */ }
  }, [services.incidentRepo]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{item.type}</Text>
        <View style={[styles.chip, { backgroundColor: STATUS_COLORS[item.status] ?? COLORS.STATUS_PENDING }]}>
          <Text style={styles.chipText}>{SYNC_STATUS_LABELS[item.status] ?? item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.cardMeta}>{new Date(item.recordedAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Patrol Incidents" subtitle={`Patrol ${patrol.id}`} />
      <OfflineBanner />

      <FlatList
        data={incidents}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={56} color={COLORS.BORDER} />
            <Text style={styles.emptyTitle}>No incidents yet</Text>
            <Text style={styles.emptyDesc}>Tap + to log your first incident.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LogIncidentFlow')}
        accessibilityRole="button"
        accessibilityLabel="Log new incident"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: COLORS.BACKGROUND },
  list:  { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14,
    marginBottom: 10, ...theme.shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardType:   { fontSize: 15, fontWeight: '700', color: COLORS.TEXT_PRIMARY },
  chip: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  cardDesc: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 4 },
  cardMeta: { fontSize: 11, color: COLORS.TEXT_SECONDARY },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  emptyDesc:  { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 8,
  },
});

export default IncidentListScreen;
