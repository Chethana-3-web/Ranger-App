/**
 * AlertSavedScreen – UC-02 Steps 19–20
 * Shows confirmation after response is submitted.
 * Displays final alert status and pending sync state if offline.
 * Auto-syncs when connectivity restores.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import { submitAlertResponse } from '../services/alertService';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';
const OUTCOME_CONFIG = {
  Resolved:   { label: 'Resolved',          color: '#2E7D32', icon: 'checkmark-circle',  bg: '#E8F5E9' },
  Monitoring: { label: 'Active / Monitoring',color: '#F57F17', icon: 'eye-circle-outline', bg: '#FFF8E1' },
  Reassigned: { label: 'Active / Reassigned',color: '#1565C0', icon: 'people-circle-outline', bg: '#E3F2FD' },
};

export default function AlertSavedScreen() {
  const navigation      = useNavigation();
  const { params }      = useRoute();
  const { alert, outcome, pendingSync, pendingPayload } = params;
  const config          = OUTCOME_CONFIG[outcome] ?? OUTCOME_CONFIG.Resolved;

  const [synced,   setSynced]   = useState(!pendingSync);
  const [syncing,  setSyncing]  = useState(false);
  const attemptedRef = useRef(false);

  // Auto-sync when connectivity restores
  useEffect(() => {
    if (!pendingSync) return;

    const unsub = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && !attemptedRef.current && pendingPayload) {
        attemptedRef.current = true;
        setSyncing(true);
        try {
          await submitAlertResponse(pendingPayload);
          setSynced(true);
        } catch {
          // still failed — keep showing pending
        } finally {
          setSyncing(false);
        }
      }
    });

    return unsub;
  }, [pendingSync, pendingPayload]);

  const handleDone = () => {
    // Pop all the way back to the alert list
    navigation.navigate('AlertList');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>

      <View style={styles.container}>

        {/* Status icon */}
        <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={64} color={config.color} />
        </View>

        <Text style={styles.title}>Response Recorded</Text>
        <Text style={styles.subtitle}>
          Your response to this alert has been saved.
        </Text>

        {/* Final alert status */}
        <View style={[styles.statusCard, { borderColor: config.color }]}>
          <Text style={styles.statusCardLabel}>Alert Status</Text>
          <Text style={[styles.statusCardValue, { color: config.color }]}>
            {config.label}
          </Text>
        </View>

        {/* Sync state */}
        <View style={[styles.syncCard, synced ? styles.syncCardSynced : styles.syncCardPending]}>
          <Ionicons
            name={syncing ? 'sync-outline' : synced ? 'cloud-done-outline' : 'cloud-upload-outline'}
            size={20}
            color={synced ? '#2E7D32' : '#F57F17'}
          />
          <Text style={[styles.syncText, { color: synced ? '#2E7D32' : '#F57F17' }]}>
            {syncing
              ? 'Syncing to server…'
              : synced
              ? 'Synced to server'
              : 'Pending sync — will upload when online'}
          </Text>
        </View>

        {/* Alert info summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Alert  </Text>{alert.type}
          </Text>
          {alert.animalName ? (
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Animal  </Text>{alert.animalName}
            </Text>
          ) : null}
          <Text style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Zone  </Text>{alert.riskZone}
          </Text>
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Return to Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.responsesBtn} onPress={() => navigation.navigate('ResponseList')}>
          <Ionicons name="list-outline" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.responsesBtnText}>View My Responses</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.BACKGROUND },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  iconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },

  title:    { fontSize: 24, fontWeight: '800', color: COLORS.TEXT_PRIMARY, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  statusCard: {
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 12,
    alignItems: 'center', marginBottom: 14, width: '100%',
  },
  statusCardLabel: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statusCardValue: { fontSize: 20, fontWeight: '800' },

  syncCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 14, width: '100%' },
  syncCardSynced:  { backgroundColor: '#E8F5E9' },
  syncCardPending: { backgroundColor: '#FFF8E1' },
  syncText: { fontSize: 13, fontWeight: '600', flex: 1 },

  summaryCard: { backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14, marginBottom: 24, width: '100%', ...theme.shadow.sm },
  summaryRow:  { fontSize: 13, color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
  summaryKey:  { fontWeight: '700', color: COLORS.TEXT_SECONDARY },

  doneBtn:     { backgroundColor: COLORS.PRIMARY, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  doneBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  responsesBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  responsesBtnText: { fontSize: 14, color: COLORS.PRIMARY, fontWeight: '600' },
});
