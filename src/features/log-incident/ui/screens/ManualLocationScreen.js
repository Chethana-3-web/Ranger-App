/**
 * Log Incident – Manual Location Screen (A1)
 *
 * Shown when GPS is unavailable. Ranger adjusts a marker on a map
 * (or enters coordinates directly if MapView is not available).
 * Starts at the park's centre coordinate.
 * Confirms and returns source = 'MANUAL'.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getParkById } from '../../../../core/config/parks';
import { ManualLocationProvider } from '../../infrastructure/manualLocationProvider';
import { updateDraftStep, DraftStep } from '../../domain/draft';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import theme from '../../../../core/ui/theme';
import { useDraftRepo } from '../hooks/useDraftRepo';

const ManualLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const draftRepo = useDraftRepo();

  const { draft, parkId } = route.params ?? {};
  const park = getParkById(parkId ?? 'PARK-YALA');
  const centre = park?.centre ?? { lat: 6.3728, lng: 81.5198 };

  const [lat, setLat] = useState(String(centre.lat));
  const [lng, setLng] = useState(String(centre.lng));
  const [latError, setLatError] = useState(null);
  const [lngError, setLngError] = useState(null);

  const validate = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    let ok = true;

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setLatError('Latitude must be between -90 and 90.');
      ok = false;
    } else {
      setLatError(null);
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setLngError('Longitude must be between -180 and 180.');
      ok = false;
    } else {
      setLngError(null);
    }

    return ok;
  };

  const handleConfirm = useCallback(async () => {
    if (!validate()) return;

    const capturedAt = new Date().toISOString();
    const provider = ManualLocationProvider(parseFloat(lat), parseFloat(lng), capturedAt);
    const location = await provider.getCurrentLocation();

    const updated = updateDraftStep(draft, DraftStep.LOCATION, { location });
    await draftRepo.save(updated);
    navigation.navigate('Details', { draft: updated });
  }, [lat, lng, draft, draftRepo, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Mark Location"
        subtitle="GPS unavailable – enter coordinates"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Map placeholder banner */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={48} color={theme.colors.border} />
          <Text style={styles.mapText}>
            Map view — draggable pin at park centre
          </Text>
          <Text style={styles.mapSub}>
            {park?.name ?? 'Unknown Park'} · {centre.lat.toFixed(4)}, {centre.lng.toFixed(4)}
          </Text>
        </View>

        {/* Coordinate inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={[styles.input, latError && styles.inputError]}
            value={lat}
            onChangeText={setLat}
            keyboardType="decimal-pad"
            placeholder="-90 to 90"
            placeholderTextColor={theme.colors.textSecondary}
          />
          {latError && <Text style={styles.errorText}>{latError}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={[styles.input, lngError && styles.inputError]}
            value={lng}
            onChangeText={setLng}
            keyboardType="decimal-pad"
            placeholder="-180 to 180"
            placeholderTextColor={theme.colors.textSecondary}
          />
          {lngError && <Text style={styles.errorText}>{lngError}</Text>}
        </View>

        <View style={styles.manualBadge}>
          <Ionicons name="hand-left" size={16} color={theme.colors.warning} />
          <Text style={styles.manualBadgeText}>Manual location — source recorded as MANUAL</Text>
        </View>

        <PrimaryButton label="Confirm Location →" onPress={handleConfirm} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.colors.background },
  body:   { flex: 1, padding: theme.spacing.md, gap: theme.spacing.md },
  mapPlaceholder: {
    height: 200, backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    ...theme.shadow.sm,
  },
  mapText:    { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' },
  mapSub:     { color: theme.colors.textSecondary, fontSize: 12 },
  inputGroup: { gap: 4 },
  label:      { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  input: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm, fontSize: 16,
    color: theme.colors.text, backgroundColor: theme.colors.surface,
  },
  inputError: { borderColor: theme.colors.error },
  errorText:  { color: theme.colors.error, fontSize: 12 },
  manualBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  manualBadgeText: { color: '#E65100', fontSize: 12, fontWeight: '600', flex: 1 },
});

export default ManualLocationScreen;
