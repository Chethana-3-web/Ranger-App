/**
 * AlertLocationScreen – UC-02 Steps 10–12
 * Shows the animal's location relative to the risk zone.
 * Ranger reviews context and selects their response action.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AppHeader from '../../../core/ui/AppHeader';
import OfflineBanner from '../../../core/ui/OfflineBanner';
import { subscribeToAlert } from '../services/alertService';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

const RISK_COLOR = {
  Critical: '#B71C1C',
  High:     '#E65100',
  Medium:   '#F57F17',
  Low:      '#2E7D32',
};

// Response options matching UC-02 alternative flows
const RESPONSE_OPTIONS = [
  {
    id: 'Resolved',
    label: 'Respond to Scene',
    desc: 'I will go to the area and handle the situation.',
    icon: 'walk-outline',
    color: '#B71C1C',
  },
  {
    id: 'Monitoring',
    label: 'Continue Monitoring',
    desc: 'Situation does not require immediate action. Keep alert active.',
    icon: 'eye-outline',
    color: '#F57F17',
  },
  {
    id: 'Reassigned',
    label: 'Involve Another Ranger',
    desc: 'I cannot handle this. Reassign to available ranger.',
    icon: 'people-outline',
    color: '#1565C0',
  },
];

export default function AlertLocationScreen() {
  const navigation      = useNavigation();
  const { params }      = useRoute();
  const [alert, setAlert] = useState(params.alert);
  const [selected, setSelected] = useState(null);

  // Live alert subscription — keeps location/status fresh
  useEffect(() => {
    const unsub = subscribeToAlert(params.alert.id, params.alert, setAlert);
    return unsub;
  }, [params.alert.id]);

  const riskColor = RISK_COLOR[alert.riskLevel] ?? RISK_COLOR.Medium;

  const openMap = () => {
    const { latitude: lat, longitude: lng, animalName, riskZone } = alert;
    const label = encodeURIComponent(animalName ?? riskZone ?? 'Alert Location');
    // Android uses geo: URI, iOS uses maps.apple.com — both show a pinned location
    const androidUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    const iosUrl     = `maps:?ll=${lat},${lng}&q=${label}`;
    const webUrl     = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(androidUrl)
      .then((supported) => {
        if (supported) return Linking.openURL(androidUrl);
        return Linking.canOpenURL(iosUrl).then((ios) =>
          Linking.openURL(ios ? iosUrl : webUrl)
        );
      })
      .catch(() => Linking.openURL(webUrl));
  };

  const handleProceed = () => {
    if (!selected) return;
    navigation.navigate('AlertRespond', { alert, outcome: selected });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Location & Assessment"
        subtitle={alert.animalName ?? alert.type}
        onBack={() => navigation.goBack()}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Location card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animal Location</Text>

          {/* Map placeholder with coordinates */}
          <TouchableOpacity style={styles.mapBox} onPress={openMap} activeOpacity={0.8}>
            <View style={[styles.mapPin, { backgroundColor: riskColor }]}>
              <Ionicons name="location" size={28} color="#fff" />
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapLabel}>{alert.riskZone}</Text>
              <Text style={styles.mapCoords}>
                {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
              </Text>
              <Text style={styles.mapOpen}>Tap to open in Maps →</Text>
            </View>
            <View style={[styles.riskTag, { backgroundColor: riskColor }]}>
              <Text style={styles.riskTagText}>{alert.riskLevel}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Zone context */}
          <View style={styles.zoneRow}>
            <Ionicons name="warning-outline" size={18} color={riskColor} />
            <Text style={styles.zoneText}>
              Animal is currently inside or near{' '}
              <Text style={{ fontWeight: '700' }}>{alert.riskZone}</Text>.
              Immediate assessment required.
            </Text>
          </View>
        </View>

        {/* Assessment — pick response */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Situation Assessment</Text>
          <Text style={styles.assessHint}>
            Based on the animal's location and the risk zone, select the appropriate response:
          </Text>

          {RESPONSE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionBtn,
                selected === opt.id && { borderColor: opt.color, backgroundColor: opt.color + '12' },
              ]}
              onPress={() => setSelected(opt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '20' }]}>
                <Ionicons name={opt.icon} size={22} color={opt.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, selected === opt.id && { color: opt.color }]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              {selected === opt.id && (
                <Ionicons name="checkmark-circle" size={22} color={opt.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Proceed */}
        <TouchableOpacity
          style={[styles.proceedBtn, !selected && styles.proceedBtnDisabled]}
          onPress={handleProceed}
          disabled={!selected}
        >
          <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
          <Text style={styles.proceedBtnText}>Record Response</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 16, paddingBottom: 40 },

  card:         { backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14, marginBottom: 14, ...theme.shadow.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  mapBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.BACKGROUND, borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: COLORS.BORDER,
  },
  mapPin:    { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  mapInfo:   { flex: 1 },
  mapLabel:  { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 2 },
  mapCoords: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginBottom: 2 },
  mapOpen:   { fontSize: 11, color: COLORS.PRIMARY, fontWeight: '600' },
  riskTag:   { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  riskTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: COLORS.DIVIDER, marginVertical: 12 },

  zoneRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  zoneText: { flex: 1, fontSize: 13, color: COLORS.TEXT_PRIMARY, lineHeight: 20 },

  assessHint: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 14, lineHeight: 20 },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: COLORS.BORDER,
    borderRadius: 10, padding: 12, marginBottom: 10,
  },
  optionIcon:  { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  optionText:  { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_PRIMARY, marginBottom: 2 },
  optionDesc:  { fontSize: 12, color: COLORS.TEXT_SECONDARY, lineHeight: 18 },

  proceedBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.PRIMARY, borderRadius: 12, paddingVertical: 16, marginTop: 4 },
  proceedBtnDisabled: { backgroundColor: COLORS.BORDER },
  proceedBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
