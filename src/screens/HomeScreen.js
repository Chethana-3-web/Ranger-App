/**
 * Ranger App – Home Screen (Patrol Dashboard)
 *
 * Shows the seeded ranger's active patrol info and quick-action tiles.
 * Tiles are driven by the feature registry + the pending-incident count
 * sourced from the Log Incident feature's repository.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useSession } from '../core/session/SessionContext';
import { getParkById } from '../core/config/parks';
import OfflineBanner from '../core/ui/OfflineBanner';
import COLORS from '../core/constants/colors';
import { useIncidentServices } from '../features/log-incident/ui/hooks/useIncidentServices';
import { SyncStatus } from '../features/log-incident/domain/syncStatus';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { ranger, patrol } = useSession();
  const park = getParkById(ranger.parkId);
  const services = useIncidentServices();

  const [incidentCount, setIncidentCount] = useState(0);
  const [pendingCount, setPendingCount]   = useState(0);
  const [refreshing, setRefreshing]       = useState(false);

  const loadCounts = useCallback(async () => {
    try {
      const all     = await services.incidentRepo.findAll();
      const pending = all.filter((i) => i.status === SyncStatus.PENDING_SYNC);
      setIncidentCount(all.length);
      setPendingCount(pending.length);
    } catch { /* repo not ready yet — ignore */ }
  }, [services.incidentRepo]);

  useFocusEffect(useCallback(() => { loadCounts(); }, [loadCounts]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  }, [loadCounts]);

  // Quick action tiles — only for features implemented in this project
  const QUICK_ACTIONS = [
    {
      id:          'log',
      label:       'Log Incident',
      icon:        'add-circle',
      description: 'Record a snare, carcass, or illegal camp',
      color:       COLORS.ERROR,
      onPress:     () => navigation.navigate('Incidents', { screen: 'LogIncidentFlow' }),
    },
    {
      id:          'list',
      label:       'View Incidents',
      icon:        'list',
      description: `${incidentCount} total · ${pendingCount} pending`,
      color:       COLORS.PRIMARY,
      onPress:     () => navigation.navigate('Incidents', { screen: 'IncidentList' }),
    },
    {
      id:          'sync',
      label:       'Sync Status',
      icon:        'cloud-upload-outline',
      description: pendingCount > 0 ? `${pendingCount} pending upload` : 'All synced',
      color:       pendingCount > 0 ? COLORS.ACCENT : COLORS.SUCCESS,
      onPress:     () => navigation.navigate('Incidents', { screen: 'SyncStatus' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Dark green header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ranger App</Text>
          <Text style={styles.headerSub}>
            {ranger.name} · {park?.name ?? ranger.parkId}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
        </View>
      </View>

      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* Patrol info card */}
        <View style={styles.patrolCard}>
          <Text style={styles.patrolTitle}>Active Patrol</Text>
          <Text style={styles.patrolId}>ID: {patrol.id}</Text>
          <View style={styles.statsRow}>
            <StatBox label="Incidents" value={incidentCount} icon="clipboard" />
            <StatBox label="Pending Sync" value={pendingCount} icon="cloud-upload-outline" accent={pendingCount > 0} />
          </View>
        </View>

        {/* Quick action tiles */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.tile}
              onPress={action.onPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={[styles.tileIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.tileLabel}>{action.label}</Text>
              <Text style={styles.tileDesc}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox = ({ label, value, icon, accent }) => (
  <View style={styles.statBox}>
    <Ionicons
      name={icon}
      size={20}
      color={accent ? COLORS.ACCENT : COLORS.PRIMARY}
    />
    <Text style={[styles.statValue, accent && { color: COLORS.ACCENT }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.HEADER_BG,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  headerBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16 },
  patrolCard: {
    backgroundColor: COLORS.SURFACE, borderRadius: 14, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  patrolTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  patrolId:    { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginBottom: 14 },
  statsRow:    { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1, backgroundColor: COLORS.BACKGROUND, borderRadius: 10,
    padding: 12, alignItems: 'center', gap: 4,
  },
  statValue:    { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  statLabel:    { fontSize: 11, color: COLORS.TEXT_SECONDARY, textAlign: 'center' },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY,
    marginBottom: 12, marginLeft: 4,
  },
  tilesGrid: { gap: 12 },
  tile: {
    backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  tileIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  tileLabel: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  tileDesc:  { fontSize: 13, color: COLORS.TEXT_SECONDARY },
});

export default HomeScreen;
