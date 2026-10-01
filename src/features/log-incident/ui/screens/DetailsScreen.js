/**
 * Log Incident – Step 4: Details + Save
 *
 * Shows description field, photo thumbnail, GPS chip and timestamp.
 * Save is disabled until description is valid (1-500 chars).
 * On save: validates, creates incident, persists locally, tries immediate sync.
 * E4: shows error dialog if storage fails.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useSession } from '../../../../core/session/SessionContext';
import { getParkById } from '../../../../core/config/parks';
import { logIncident, discardDraft } from '../../application/incidentService';
import { ValidationError, StorageError } from '../../../../core/domain/errors';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { TextField } from '../../../../core/ui/TextField';
import { ConfirmDialog } from '../../../../core/ui/ConfirmDialog';
import { StatusChip } from '../../../../core/ui/StatusChip';
import OfflineBanner from '../../../../core/ui/OfflineBanner';
import theme from '../../../../core/ui/theme';
import { useDraftRepo } from '../hooks/useDraftRepo';
import { useIncidentServices } from '../hooks/useIncidentServices';

const MAX_DESC = 500;

const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const draftRepo = useDraftRepo();
  const { ranger, patrol } = useSession();
  const park = getParkById(ranger.parkId);
  const services = useIncidentServices();

  const { draft } = route.params ?? {};
  const [description, setDescription] = useState(draft?.description ?? '');
  const [descError, setDescError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [storageError, setStorageError] = useState(null);

  // Live validation
  useEffect(() => {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      setDescError('Description is required.');
    } else if (trimmed.length > MAX_DESC) {
      setDescError(`${trimmed.length}/${MAX_DESC} — too long.`);
    } else {
      setDescError(null);
    }
  }, [description]);

  const canSave = !descError && description.trim().length > 0 && !saving;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);

    try {
      const incident = await logIncident({
        type:        draft.type,
        description,
        location:    draft.location,
        photoUri:    draft.photoUri ?? null,
        rangerId:    ranger.id,
        patrolId:    patrol.id,
        parkId:      ranger.parkId,
        park,
        incidentRepo:        services.incidentRepo,
        gateway:             services.gateway,
        connectivityMonitor: services.connectivityMonitor,
        clock:               services.clock,
        idGenerator:         services.idGenerator,
      });

      await discardDraft(draftRepo);
      navigation.navigate('Saved', { incident });

    } catch (err) {
      if (err instanceof ValidationError) {
        setDescError(err.fieldErrors?.description ?? err.message);
      } else if (err instanceof StorageError) {
        setStorageError('Could not save incident. Please try again.');
      } else {
        setStorageError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  }, [canSave, description, draft, ranger, patrol, park, services, draftRepo, navigation]);

  const handleDiscard = useCallback(async () => {
    setShowCancelDialog(false);
    await discardDraft(draftRepo);
    navigation.navigate('Home');
  }, [draftRepo, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Incident Details"
        subtitle="Step 4 of 4"
        onBack={() => setShowCancelDialog(true)}
      />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Photo thumbnail */}
        {draft?.photoUri ? (
          <Image source={{ uri: draft.photoUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="image-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.noPhotoText}>No photo attached</Text>
          </View>
        )}

        {/* GPS location chip */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name={draft?.location?.source === 'MANUAL' ? 'hand-left' : 'location'}
              size={16}
              color={draft?.location?.source === 'MANUAL' ? '#E65100' : theme.colors.primary}
            />
            <Text style={styles.metaText}>
              {draft?.location
                ? `${draft.location.latitude.toFixed(4)}, ${draft.location.longitude.toFixed(4)}`
                : 'No location'
              }
            </Text>
            {draft?.location && (
              <StatusChip
                status={draft.location.source === 'MANUAL' ? 'offline' : 'synced'}
                label={draft.location.source}
              />
            )}
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>
              {draft?.location?.capturedAt
                ? new Date(draft.location.capturedAt).toLocaleTimeString()
                : 'Now'}
            </Text>
          </View>
        </View>

        {/* Incident type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {draft?.type ?? 'Unknown type'}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <TextField
            label="Description *"
            placeholder="Describe what you found in detail…"
            value={description}
            onChangeText={setDescription}
            error={descError}
            maxLength={MAX_DESC}
            multiline
          />
        </View>
      </ScrollView>

      {/* E4 storage error dialog */}
      <ConfirmDialog
        visible={!!storageError}
        title="Save Failed"
        message={storageError ?? ''}
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => setStorageError(null)}
        onCancel={() => setStorageError(null)}
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancel Incident?"
        message="Do you want to keep this draft or discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Draft"
        confirmColor={theme.colors.error}
        onConfirm={handleDiscard}
        onCancel={() => setShowCancelDialog(false)}
      />

      <View style={styles.footer}>
        <PrimaryButton
          label={saving ? 'Saving…' : 'Save Incident'}
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  scroll:  { padding: theme.spacing.md, paddingBottom: 120, gap: theme.spacing.md },
  thumbnail: {
    width: '100%', height: 200,
    borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.sm,
  },
  noPhoto: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  noPhotoText: { color: theme.colors.textSecondary, fontSize: 13 },
  metaRow: { gap: 8 },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  metaText: { fontSize: 13, color: theme.colors.text, flex: 1 },
  typeBadge: {
    backgroundColor: theme.colors.primary + '1A',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  typeBadgeText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  descSection: { marginTop: theme.spacing.sm },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, paddingBottom: theme.spacing.lg,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    ...theme.shadow.md,
  },
});

export default DetailsScreen;
