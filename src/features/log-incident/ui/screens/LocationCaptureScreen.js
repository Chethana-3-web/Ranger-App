/**
 * Log Incident – Location Capture Screen
 *
 * Automatically tries to obtain GPS once on mount.
 * If unavailable (A1), prompts the ranger to mark manually.
 * The empty dependency array [] ensures the effect runs exactly once.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { GpsLocationProvider } from '../../infrastructure/gpsLocationProvider';
import { updateDraftStep, DraftStep } from '../../domain/draft';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { ConfirmDialog } from '../../../../core/ui/ConfirmDialog';
import theme from '../../../../core/ui/theme';
import { useDraftRepo } from '../hooks/useDraftRepo';

const LocationCaptureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const draftRepo = useDraftRepo();

  // Capture draft and navigation refs once — never re-read from route inside effect
  const draftRef   = useRef(route.params?.draft ?? null);
  const navRef     = useRef(navigation);
  const repoRef    = useRef(draftRepo);

  const [status, setStatus]               = useState('acquiring');
  const [location, setLocation]           = useState(null);
  const [showManualDialog, setShowManualDialog] = useState(false);

  // Run GPS acquisition exactly once on mount
  useEffect(() => {
    let cancelled = false;
    const provider = GpsLocationProvider();

    async function acquire() {
      const loc = await provider.getCurrentLocation();
      if (cancelled) return;

      if (loc) {
        setLocation(loc);
        setStatus('success');

        // Autosave draft with location, then navigate
        const draft   = draftRef.current;
        const updated = updateDraftStep(draft, DraftStep.LOCATION, { location: loc });
        await repoRef.current.save(updated);

        // Brief pause so the success state is visible
        const timer = setTimeout(() => {
          if (!cancelled) navRef.current.navigate('Details', { draft: updated });
        }, 800);

        return () => clearTimeout(timer);
      } else {
        setStatus('unavailable');
        setShowManualDialog(true);
      }
    }

    acquire();
    return () => { cancelled = true; };
  }, []); // intentionally empty — runs once on mount

  const draft = draftRef.current;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader title="Capturing Location" subtitle="Step 3 of 4" />

      <View style={styles.body}>

        {status === 'acquiring' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.statusText}>Acquiring GPS signal…</Text>
            <Text style={styles.statusSub}>This may take up to 15 seconds</Text>
          </View>
        )}

        {status === 'success' && location && (
          <View style={styles.center}>
            <Ionicons name="checkmark-circle" size={56} color={theme.colors.success} />
            <Text style={[styles.statusText, { color: theme.colors.success }]}>
              GPS location captured
            </Text>
            <Text style={styles.coords}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            <Text style={styles.statusSub}>
              Accuracy: ±{location.accuracyMeters?.toFixed(0) ?? '?'} m
            </Text>
          </View>
        )}

        {status === 'unavailable' && (
          <View style={styles.center}>
            <Ionicons name="location-outline" size={56} color={theme.colors.error} />
            <Text style={[styles.statusText, { color: theme.colors.error }]}>
              GPS signal unavailable
            </Text>
            <PrimaryButton
              label="Mark Location Manually"
              onPress={() => navigation.navigate('ManualLocation', {
                draft, parkId: draft?.parkId,
              })}
            />
          </View>
        )}

      </View>

      {/* A1 – GPS unavailable dialog */}
      <ConfirmDialog
        visible={showManualDialog}
        title="GPS Unavailable"
        message="GPS signal unavailable. Do you want to manually mark your location?"
        confirmLabel="Mark Manually"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowManualDialog(false);
          navigation.navigate('ManualLocation', { draft, parkId: draft?.parkId });
        }}
        onCancel={() => {
          setShowManualDialog(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: theme.colors.background },
  body:       { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  center:     { alignItems: 'center', gap: theme.spacing.md },
  statusText: { fontSize: 20, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  statusSub:  { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center' },
  coords:     { fontSize: 16, color: theme.colors.primary, fontWeight: '600' },
});

export default LocationCaptureScreen;
