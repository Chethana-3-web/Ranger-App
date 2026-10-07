/**
 * AlertDetailScreen – UC-02 Steps 6–9
 * Reads the alert LIVE from Firestore so status always reflects DB truth.
 * Ranger acknowledges the alert here before proceeding to respond.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AppHeader from '../../../core/ui/AppHeader';
import OfflineBanner from '../../../core/ui/OfflineBanner';
import { subscribeToAlert, acknowledgeAlert } from '../services/alertService';
import { useSession } from '../../../core/session/SessionContext';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

const RISK_COLOR = {
  Critical: '#B71C1C',
  High:     '#E65100',
  Medium:   '#F57F17',
  Low:      '#2E7D32',
};

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={COLORS.PRIMARY} style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value ?? '—'}</Text>
      </View>
    </View>
  );
}

export default function AlertDetailScreen() {
  const navigation       = useNavigation();
  const { params }       = useRoute();
  const { ranger }       = useSession();

  // Live alert state from Firestore — params.alert is the fallback (offline)
  const [alert, setAlert]                 = useState(params.alert);
  const [loading, setLoading]             = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);

  // Subscribe to live Firestore doc — reflects any DB changes immediately
  useEffect(() => {
    const unsub = subscribeToAlert(params.alert.id, params.alert, (liveAlert) => {
      setAlert(liveAlert);
      setLoading(false);
    });
    return unsub;
  }, [params.alert.id]);

  const riskColor      = RISK_COLOR[alert.riskLevel] ?? RISK_COLOR.Medium;
  const time           = new Date(alert.generatedAt).toLocaleString();
  const isAcknowledged = !!alert.acknowledgedBy || alert.status === 'Acknowledged';

  const handleAcknowledge = async () => {
    if (isAcknowledged || acknowledging) return;
    setAcknowledging(true);
    try {
      // Writes to Firestore → subscribeToAlert picks up the change automatically
      await acknowledgeAlert(alert.id, ranger.id);
    } catch (err) {
      // Offline — update local state so UI reflects action
      setAlert((prev) => ({
        ...prev,
        status:         'Acknowledged',
        acknowledgedBy: ranger.id,
        acknowledgedAt: new Date().toISOString(),
      }));
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Alert Details" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Alert Details"
        subtitle={alert.type}
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero animal image — set by admin via web dashboard */}
        {alert.animalName ? (
          <View style={styles.heroContainer}>
            {alert.animalImageUrl ? (
              <Image source={{ uri: alert.animalImageUrl }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="paw-outline" size={48} color={COLORS.BORDER} />
                <Text style={styles.heroPlaceholderText}>{alert.animalName}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Risk level banner */}
        <View style={[styles.riskBanner, { backgroundColor: riskColor }]}>
          <Ionicons name="alert-circle" size={22} color="#fff" />
          <Text style={styles.riskText}>{alert.riskLevel} Risk Alert</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{alert.status}</Text>
          </View>
        </View>

        {/* Alert info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Alert Information</Text>
          <InfoRow icon="time-outline"     label="Generated At" value={time} />
          <InfoRow icon="location-outline" label="Risk Zone"    value={alert.riskZone} />
          <InfoRow icon="map-outline"      label="Park"         value={alert.parkName} />
        </View>

        {/* Animal info — only if collar data present */}
        {alert.animalName ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Animal Information</Text>
            <InfoRow icon="paw-outline"     label="Animal"    value={alert.animalName} />
            <InfoRow icon="ellipse-outline" label="Species"   value={alert.species} />
            <InfoRow icon="radio-outline"   label="Collar ID" value={alert.collarId} />
          </View>
        ) : null}

        {/* Acknowledgement */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Acknowledgement</Text>
          {isAcknowledged ? (
            <View style={styles.ackDone}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.SUCCESS} />
              <Text style={styles.ackDoneText}>
                Acknowledged by {alert.acknowledgedBy}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.ackHint}>
                Confirm you have received and are handling this alert.
              </Text>
              <TouchableOpacity
                style={[styles.ackBtn, acknowledging && styles.ackBtnDisabled]}
                onPress={handleAcknowledge}
                disabled={acknowledging}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.ackBtnText}>
                  {acknowledging ? 'Acknowledging…' : 'Acknowledge Alert'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Proceed CTA */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('AlertLocation', { alert })}
        >
          <Ionicons name="navigate-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>View Location & Respond</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  heroContainer:       { position: 'relative', marginBottom: 14, borderRadius: 12, overflow: 'hidden' },
  heroImage:           { width: '100%', height: 200 },
  heroPlaceholder:     { width: '100%', height: 160, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.BORDER },
  heroPlaceholderText: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },

  riskBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, padding: 14, marginBottom: 14,
  },
  riskText:       { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15 },
  statusPill:     { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  card:         { backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14, marginBottom: 14, ...theme.shadow.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon:    { marginTop: 2, marginRight: 10 },
  infoContent: { flex: 1 },
  infoLabel:   { fontSize: 11, color: COLORS.TEXT_SECONDARY, marginBottom: 1 },
  infoValue:   { fontSize: 14, fontWeight: '600', color: COLORS.TEXT_PRIMARY },

  ackHint:        { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 12 },
  ackBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.PRIMARY, borderRadius: 10, paddingVertical: 12 },
  ackBtnDisabled: { opacity: 0.6 },
  ackBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  ackDone:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ackDoneText:    { fontSize: 14, fontWeight: '600', color: COLORS.SUCCESS },

  primaryBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
