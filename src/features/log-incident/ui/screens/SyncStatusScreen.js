/**
 * Log Incident – Sync Status Screen (E2)
 *
 * Lists all incidents with their sync status.
 * - Per-item Retry button for FAILED incidents
 * - "Sync All" button triggers a full sync pass
 * - OfflineBanner warns when offline
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { SyncStatus, SYNC_STATUS_LABELS } from '../../domain/syncStatus';
import { resetForRetry } from '../../domain/incident';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import OfflineBanner from '../../../../core/ui/OfflineBanner';
import theme from '../../../../core/ui/theme';
import { useIncidentServices } from '../hooks/useIncidentServices';

const STATUS_COLORS = {
  [SyncStatus.PENDING_SYNC]: { bg: '#FFF8E1', border: '#FBC02D', text: '#E65100' },
  [SyncStatus.SYNCED]:       { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' },
  [SyncStatus.FAILED]:       { bg: '#FFEBEE', border: '#C62828', text: '#C62828' },
};

const SyncStatusScreen = () => {
  const services = useIncidentServices();
  const [incidents, setIncidents] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncFailedBanner, setSyncFailedBanner] = useState(false);

  const loadIncidents = useCallback(async () => {
    const all = await services.incidentRepo.findAll();
    const order = { [SyncStatus.FAILED]: 0, [SyncStatus.PENDING_SYNC]: 1, [SyncStatus.SYNCED]: 2 };
    const sorted = [...all].sort((a, b) => {
      const statusDiff = (order[a.status] ?? 1) - (order[b.status] ?? 1);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.recordedAt) - new Date(a.recordedAt);
    });
    setIncidents(sorted);
    // Show E2 banner if any incident failed or is still pending after attempts
    const hasSyncIssue = sorted.some(
      (i) => i.status === SyncStatus.FAILED || (i.status === SyncStatus.PENDING_SYNC && i.syncAttempts > 0),
    );
    setSyncFailedBanner(hasSyncIssue);
  }, [services.incidentRepo]);

  useFocusEffect(useCallback(() => { loadIncidents(); }, [loadIncidents]));

  const handleSyncAll = useCallback(async () => {
    if (!services.connectivityMonitor.isOnline()) return;
    setSyncing(true);
    try {
      // Re-sync all pending by uploading one-by-one via gateway
      const pending = await services.incidentRepo.findByStatus(SyncStatus.PENDING_SYNC);
      for (const inc of pending) {
        const resp = await services.gateway.upload(inc);
        if (resp.result === 'STORED' || resp.result === 'ALREADY_EXISTS') {
          const synced = { ...inc, status: SyncStatus.SYNCED, syncedAt: services.clock.iso() };
          await services.incidentRepo.update(synced);
        }
      }
      await loadIncidents();
    } finally {
      setSyncing(false);
    }
  }, [services, loadIncidents]);

  const handleRetry = useCallback(async (incident) => {
    try {
      const reset = resetForRetry(incident);
      await services.incidentRepo.update(reset);
      // Immediate upload attempt
      const resp = await services.gateway.upload(reset);
      if (resp.result === 'STORED' || resp.result === 'ALREADY_EXISTS') {
        const synced = { ...reset, status: SyncStatus.SYNCED, syncedAt: services.clock.iso() };
        await services.incidentRepo.update(synced);
      }
      await loadIncidents();
    } catch { /* ignore — will be retried */ }
  }, [services, loadIncidents]);

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS[SyncStatus.PENDING_SYNC];
    return (
      <View style={[styles.card, { borderLeftColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>{item.type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {SYNC_STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.cardMeta}>
          {new Date(item.recordedAt).toLocaleString()} · {item.syncAttempts} attempt{item.syncAttempts !== 1 ? 's' : ''}
        </Text>
        {item.lastError && (
          <Text style={styles.cardError}>⚠ {item.lastError}</Text>
        )}
        {item.status === SyncStatus.FAILED && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => handleRetry(item)}>
            <Ionicons name="refresh" size={14} color={theme.colors.primary} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const pendingCount = incidents.filter((i) => i.status === SyncStatus.PENDING_SYNC).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Sync Status" subtitle={`${incidents.length} incident${incidents.length !== 1 ? 's' : ''}`} />
      <OfflineBanner />

      {syncFailedBanner && (
        <View style={styles.syncFailBanner}>
          <Ionicons name="warning-outline" size={16} color="#fff" />
          <Text style={styles.syncFailText}>Sync failed. Will retry automatically.</Text>
        </View>
      )}

      <FlatList
        data={incidents}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
            <Text style={styles.emptyText}>No incidents logged yet</Text>
          </View>
        }
      />

      {pendingCount > 0 && (
        <View style={styles.footer}>
          {syncing ? (
            <View style={styles.syncingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.syncingText}>Syncing…</Text>
            </View>
          ) : (
            <PrimaryButton
              label={`Sync All (${pendingCount} pending)`}
              onPress={handleSyncAll}
              disabled={!services.connectivityMonitor.isOnline()}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: theme.colors.background },
  list:     { padding: theme.spacing.md, gap: theme.spacing.sm, paddingBottom: 100 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadow.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardType:   { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  statusBadge:{ borderRadius: theme.borderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDesc:   { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 4 },
  cardMeta:   { fontSize: 11, color: theme.colors.textSecondary },
  cardError:  { fontSize: 11, color: theme.colors.error, marginTop: 4 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  retryText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, paddingBottom: theme.spacing.lg,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    ...theme.shadow.md,
  },
  syncingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  syncingText:{ color: theme.colors.textSecondary, fontSize: 14 },
  empty: { alignItems: 'center', gap: 16, paddingTop: 80 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15 },
  syncFailBanner: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  syncFailText: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
});

export default SyncStatusScreen;
