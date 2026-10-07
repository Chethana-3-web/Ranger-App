/**
 * AlertListScreen – UC-02 Step 4–5
 * Shows all collar alerts. Ranger taps one to view details.
 */

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AppHeader from '../../../core/ui/AppHeader';
import OfflineBanner from '../../../core/ui/OfflineBanner';
import { useAlerts } from '../hooks/useAlerts';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

// ── Risk level config ─────────────────────────────────────────────────────────

const RISK = {
  Critical: { bg: '#B71C1C', text: '#fff' },
  High:     { bg: '#E65100', text: '#fff' },
  Medium:   { bg: '#F57F17', text: '#fff' },
  Low:      { bg: '#2E7D32', text: '#fff' },
};

const STATUS_COLOR = {
  'Active':           '#B71C1C',
  'Active/Monitoring':'#F57F17',
  'Active/Reassigned':'#1565C0',
  'Acknowledged':     '#6A1B9A',
  'Resolved':         '#2E7D32',
};

const FILTERS = ['All', 'Active', 'Monitoring', 'Resolved'];

// ── Alert card ────────────────────────────────────────────────────────────────

function AlertCard({ alert, onPress }) {
  const risk    = RISK[alert.riskLevel]    ?? RISK.Medium;
  const statClr = STATUS_COLOR[alert.status] ?? '#555';
  const time    = new Date(alert.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date    = new Date(alert.generatedAt).toLocaleDateString();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
          <Text style={[styles.riskText, { color: risk.text }]}>{alert.riskLevel}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statClr + '22', borderColor: statClr }]}>
          <Text style={[styles.statusText, { color: statClr }]}>{alert.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {alert.animalImageUrl ? (
          <Image source={{ uri: alert.animalImageUrl }} style={styles.animalThumb} />
        ) : alert.animalName ? (
          <View style={styles.animalThumbPlaceholder}>
            <Ionicons name="paw" size={22} color={COLORS.TEXT_SECONDARY} />
          </View>
        ) : null}

        <View style={styles.cardBodyText}>
          <Text style={styles.alertType}>{alert.type}</Text>
          {alert.animalName ? (
            <Text style={styles.animalName}>
              <Ionicons name="paw-outline" size={13} color={COLORS.TEXT_SECONDARY} /> {alert.animalName}
            </Text>
          ) : null}
          <Text style={styles.zone}>
            <Ionicons name="location-outline" size={13} color={COLORS.TEXT_SECONDARY} /> {alert.riskZone}
          </Text>
          <Text style={styles.meta}>{date}  {time}  ·  {alert.parkName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AlertListScreen() {
  const navigation = useNavigation();
  const { alerts, loading, isOffline } = useAlerts(refreshKey);
  const [filter,     setFilter]     = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Re-subscribe on manual pull-to-refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = alerts.filter((a) => {
    if (filter === 'All')       return true;
    if (filter === 'Active')    return a.status.startsWith('Active');
    if (filter === 'Monitoring')return a.status.includes('Monitoring');
    if (filter === 'Resolved')  return a.status === 'Resolved';
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Collar Alerts"
        subtitle={isOffline ? 'Offline – cached data' : 'Live · GPS collar monitoring'}
      />
      <OfflineBanner />

      {/* Filter tabs + My Responses button */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.responsesBtn}
          onPress={() => navigation.navigate('ResponseList')}
        >
          <Ionicons name="list-outline" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.responsesBtnText}>My Responses</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              onPress={() => navigation.navigate('AlertDetail', { alert: item })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={56} color={COLORS.BORDER} />
              <Text style={styles.emptyText}>No alerts in this category</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:  { fontSize: 15, color: COLORS.TEXT_SECONDARY },
  list:       { padding: 16, paddingBottom: 40 },

  filterContainer: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.BORDER,
  },
  filterBtnActive: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
  filterText:      { fontSize: 12, fontWeight: '600', color: COLORS.TEXT_SECONDARY },
  filterTextActive:{ color: '#fff' },

  responsesBtn:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.PRIMARY, backgroundColor: COLORS.SURFACE },
  responsesBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.PRIMARY },

  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...theme.shadow.sm,
  },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },

  riskBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  riskText:  { fontSize: 11, fontWeight: '700' },

  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText:  { fontSize: 11, fontWeight: '600' },

  alertType:  { fontSize: 15, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
  animalName: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 2 },
  zone:       { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 4 },
  meta:       { fontSize: 11, color: COLORS.TEXT_SECONDARY },

  cardBody:             { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 4 },
  cardBodyText:         { flex: 1 },
  animalThumb:          { width: 60, height: 60, borderRadius: 8 },
  animalThumbPlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER },
});
