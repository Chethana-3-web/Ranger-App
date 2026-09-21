/**
 * Ranger App – Home Screen (Patrol Dashboard)
 *
 * Shows the seeded ranger's active patrol info, a quick-action tile to log
 * an incident, and a summary count of today's logged incidents.
 *
 * Mirrors the BinGo HomeScreen tile / quick-actions pattern.
 */

import React, { useEffect, useState, useCallback } from 'react';
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

import { useSession } from '../context/SessionContext';
import { getIncidentsByPatrol } from '../services/incidentService';
import { syncPendingIncidents } from '../services/syncService';
import { getParkById } from '../config/parks';
import OfflineBanner from '../components/OfflineBanner';
import COLORS from '../constants/colors';

// ── Quick action tiles ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id:          'log',
    label:       'Log Incident',
    icon:        'add-circle',
    description: 'Record a snare, carcass, or illegal camp',
    color:       COLORS.ERROR,
    tab:         'Incidents',
    screen:      'LogIncident',
  },
  {
    id:          'list',
    label:       'View Incidents',
    icon:        'list',
    description: 'Browse today\'s logged incidents',
    color:       COLORS.PRIMARY,
    tab:         'Incidents',
    screen:      'IncidentList',
  },
  {
    id:          'alerts',
    label:       'Collar Alerts',
    icon:        'notifications',
    description: 'Animal collar & camera trap alerts',
    color:       COLORS.ACCENT,
    tab:         'Alerts',
    screen:      null,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { ranger, patrol } = useSession();
  const park = getParkById(ranger.parkId);

  const [incidentCount, setIncidentCount]   = useState(0);
  const [pendingCount, setPendingCount]     = useState(0);
  const [refreshing, setRefreshing]         = useState(false);

  const loadCounts = useCallback(async () => {
    const incidents = await getIncidentsByPatrol(patrol.id);
    setIncidentCount(incidents.length);
    setPendingCount(incidents.filter((i) => i.syncStatus === 'PENDING').length);
  }, [patrol.id]);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncPendingIncidents();
    await loadCounts();
    setRefreshing(false);
  }, [loadCounts]);

  const handleTile = (action) => {
    if (action.screen) {
      navigation.navigate(action.tab, { screen: action.screen });
    } else {
      navigation.navigate(action.tab);
    }
  };

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
            <StatBox label="Pending Sync" value={pendingCount} icon="cloud-upload-outline" accent />
          </View>
        </View>

        {/* Quick action tiles */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.tile}
              onPress={() => handleTile(action)}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { padding: 16 },
  patrolCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  patrolTitle: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  patrolId:    { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginBottom: 14 },
  statsRow:    { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: COLORS.TEXT_SECONDARY, textAlign: 'center' },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    marginLeft: 4,
  },
  tilesGrid: { gap: 12 },
  tile: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tileLabel: { fontSize: 16, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  tileDesc:  { fontSize: 13, color: COLORS.TEXT_SECONDARY },
});

export default HomeScreen;
