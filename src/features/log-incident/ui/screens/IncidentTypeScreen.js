/**
 * Log Incident – Step 1: Incident Type Selection
 *
 * Shows a card grid of incident types enabled for the ranger's park.
 * "Next" is disabled until a type is selected.
 * Cancel triggers the A3 confirm-discard dialog.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

import { useSession } from '../../../../core/session/SessionContext';
import { getParkById } from '../../../../core/config/parks';
import { getTypesForPark } from '../../application/incidentService';
import { createDraft, updateDraftStep, DraftStep } from '../../domain/draft';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import OfflineBanner from '../../../../core/ui/OfflineBanner';
import { ConfirmDialog } from '../../../../core/ui/ConfirmDialog';
import theme from '../../../../core/ui/theme';
import { useDraftRepo } from '../hooks/useDraftRepo';

const TYPE_ICONS = { EMERGENCY: { icon: 'warning', color: '#D32F2F' },
  SNARE:    { icon: 'alert-circle', color: '#C62828' },
  CARCASS:  { icon: 'skull',        color: '#6D4C41' },
  TRACKS:   { icon: 'footsteps',    color: '#2E7D32' },
  CAMPSITE: { icon: 'bonfire',      color: '#E65100' },
  OTHER:    { icon: 'help-circle',  color: '#1565C0' },
};

const IncidentTypeScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const isCommunity = auth?.user?.role === 'community';
  const { ranger } = useSession();
  const park = getParkById(ranger.parkId);
  const types = getTypesForPark(park ?? { enabledIncidentTypes: [] });

  const draftRepo = useDraftRepo();
  const [selectedType, setSelectedType] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleNext = useCallback(async () => {
    const draft = updateDraftStep(
      createDraft(new Date().toISOString()),
      DraftStep.TYPE,
      { type: selectedType },
    );
    await draftRepo.save(draft);
    navigation.navigate('AddPhoto', { draft });
  }, [selectedType, draftRepo, navigation]);

  const handleKeepDraft = async () => {
    setShowCancelDialog(false);
    if (selectedType) {
      const draft = updateDraftStep(
        createDraft(new Date().toISOString()),
        DraftStep.TYPE,
        { type: selectedType }
      );
      await draftRepo.save(draft);
    }
    navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList');
  };

  const handleDiscardDraft = useCallback(async () => {
    setShowCancelDialog(false);
    await draftRepo.delete();
    navigation.navigate(isCommunity ? 'CommunityHome' : 'IncidentList');
  }, [draftRepo, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Log Incident"
        subtitle={`Step 1 of 4 · ${park?.name ?? ranger.parkId}`}
        onBack={() => navigation.goBack()}
        onClose={() => setShowCancelDialog(true)}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Select incident type</Text>
        <Text style={styles.sub}>Choose the type that best describes what you found.</Text>

        <View style={styles.grid}>
          {types.map(({ key, label }) => {
            const meta = TYPE_ICONS[key] ?? TYPE_ICONS.OTHER;
            const selected = selectedType === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => {
                  if (key === 'EMERGENCY') {
                    Alert.alert('EMERGENCY', 'Please contact local authorities immediately at 119.', [{ text: 'OK' }]);
                  }
                  setSelectedType(key);
                }}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
              >
                <View style={[styles.iconBg, { backgroundColor: meta.color + '1A' }]}>
                  <Ionicons name={meta.icon} size={28} color={meta.color} />
                </View>
                <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                  {label}
                </Text>
                {selected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Next →" onPress={handleNext} disabled={!selectedType} />
      </View>

      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancel Incident?"
        message="Do you want to keep this draft or discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Draft"
        confirmColor={theme.colors.error}
        onConfirm={handleDiscardDraft}
        onCancel={handleKeepDraft}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, paddingBottom: 120 },
  heading: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginBottom: 6 },
  sub:     { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  grid:    { gap: 12 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadow.sm,
  },
  cardSelected:      { borderColor: theme.colors.primary, backgroundColor: '#E8F5E9' },
  iconBg:            { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  cardLabel:         { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.text },
  cardLabelSelected: { color: theme.colors.primary },
  checkBadge:        { marginLeft: 'auto' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    ...theme.shadow.md,
  },
});

export default IncidentTypeScreen;




