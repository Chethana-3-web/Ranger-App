/**
 * AlertRespondScreen – UC-02 Steps 14–20
 * Ranger records action taken and submits.
 * Handles both online (Firestore) and offline (local pending) submission.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import AppHeader from '../../../core/ui/AppHeader';
import OfflineBanner from '../../../core/ui/OfflineBanner';
import { submitAlertResponse } from '../services/alertService';
import { useSession } from '../../../core/session/SessionContext';
import PhotoPicker from '../components/PhotoPicker';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

const OUTCOME_CONFIG = {
  Resolved:   { label: 'Respond to Scene',       color: '#B71C1C', icon: 'walk-outline',   statusLabel: 'Resolved' },
  Monitoring: { label: 'Continue Monitoring',     color: '#F57F17', icon: 'eye-outline',    statusLabel: 'Active/Monitoring' },
  Reassigned: { label: 'Involve Another Ranger',  color: '#1565C0', icon: 'people-outline', statusLabel: 'Active/Reassigned' },
};

export default function AlertRespondScreen() {
  const navigation  = useNavigation();
  const { params }  = useRoute();
  const { ranger }  = useSession();

  const { alert, outcome } = params;
  const config = OUTCOME_CONFIG[outcome] ?? OUTCOME_CONFIG.Resolved;

  const [notes,       setNotes]       = useState('');
  const [photoUri,    setPhotoUri]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      Alert.alert('Notes required', 'Please enter what action you took before submitting.');
      return;
    }

    setSubmitting(true);
    const net = await NetInfo.fetch();

    try {
      if (net.isConnected) {
        await submitAlertResponse({
          alertId:  alert.id,
          rangerId: ranger.id,
          outcome,
          notes:    notes.trim(),
          photoUri,
        });
        navigation.navigate('AlertSaved', { alert, outcome, pendingSync: false });
      } else {
        navigation.navigate('AlertSaved', {
          alert, outcome, pendingSync: true,
          pendingPayload: { alertId: alert.id, rangerId: ranger.id, outcome, notes: notes.trim(), photoUri },
        });
      }
    } catch {
      navigation.navigate('AlertSaved', {
        alert, outcome, pendingSync: true,
        pendingPayload: { alertId: alert.id, rangerId: ranger.id, outcome, notes: notes.trim(), photoUri },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Record Response"
        subtitle={alert.type}
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Selected outcome banner */}
        <View style={[styles.outcomeBanner, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={22} color="#fff" />
          <View style={styles.outcomeText}>
            <Text style={styles.outcomeLabel}>Selected Response</Text>
            <Text style={styles.outcomeValue}>{config.label}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>→ {config.statusLabel}</Text>
          </View>
        </View>

        {/* Alert summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Alert Summary</Text>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Alert:  </Text>{alert.type}
          </Text>
          {alert.animalName ? (
            <Text style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Animal:  </Text>{alert.animalName}
            </Text>
          ) : null}
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Zone:  </Text>{alert.riskZone}
          </Text>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ranger:  </Text>{ranger.name}
          </Text>
        </View>

        {/* Notes input */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action Taken</Text>
          <Text style={styles.notesHint}>
            Describe what you observed and what action was taken.
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Arrived at Farmland Zone F-04. Elephant had moved back into the park. No crops damaged. Marked area and returned to patrol."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            multiline
            numberOfLines={5}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{notes.length} characters</Text>
        </View>

        {/* Photo evidence */}
        <View style={styles.card}>
          <PhotoPicker photoUri={photoUri} onPhotoChange={setPhotoUri} />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!notes.trim() || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!notes.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          )}
          <Text style={styles.submitBtnText}>
            {submitting ? 'Submitting…' : 'Submit Response'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 16, paddingBottom: 60 },

  outcomeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 10, padding: 14, marginBottom: 14,
  },
  outcomeText:      { flex: 1 },
  outcomeLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  outcomeValue:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  statusPill:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusPillText:   { fontSize: 11, fontWeight: '600', color: '#fff' },

  card:         { backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14, marginBottom: 14, ...theme.shadow.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  summaryItem:  { fontSize: 14, color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
  summaryLabel: { fontWeight: '600', color: COLORS.TEXT_SECONDARY },

  notesHint:  { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 10, lineHeight: 18 },
  notesInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.BORDER,
    padding: 12, fontSize: 14, color: COLORS.TEXT_PRIMARY,
    minHeight: 120,
  },
  charCount: { fontSize: 11, color: COLORS.TEXT_SECONDARY, textAlign: 'right', marginTop: 4 },

  submitBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.PRIMARY, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
  submitBtnDisabled: { backgroundColor: COLORS.BORDER },
  submitBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
