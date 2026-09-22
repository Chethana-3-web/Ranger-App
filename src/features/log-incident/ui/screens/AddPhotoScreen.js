/**
 * Log Incident – Step 2: Add Photo (A2 handled inline)
 *
 * Rangers can take a photo as evidence.
 * If the camera is unavailable or permission is denied (A2), a "Skip Photo"
 * option is shown and the flow continues with photoUri = null.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { updateDraftStep, DraftStep } from '../../domain/draft';
import AppHeader from '../../../../core/ui/AppHeader';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../../../core/ui/SecondaryButton';
import { ConfirmDialog } from '../../../../core/ui/ConfirmDialog';
import theme from '../../../../core/ui/theme';
import { useDraftRepo } from '../hooks/useDraftRepo';
import { ExpoCameraProvider } from '../../infrastructure/expoCameraProvider';

const cameraProvider = ExpoCameraProvider();

const AddPhotoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const draftRepo = useDraftRepo();

  const [draft, setDraft] = useState(route.params?.draft ?? null);
  const [photoUri, setPhotoUri] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleTakePhoto = useCallback(async () => {
    setCameraError(null);
    const result = await cameraProvider.takePhoto();
    if (result) {
      setPhotoUri(result.uri);
    } else {
      setCameraError('Camera unavailable or permission denied.');
    }
  }, []);

  const handleContinue = useCallback(async (uri) => {
    const updated = updateDraftStep(draft, DraftStep.PHOTO, { photoUri: uri ?? null });
    setDraft(updated);
    await draftRepo.save(updated);
    navigation.navigate('LocationCapture', { draft: updated });
  }, [draft, draftRepo, navigation]);

  const handleCancel = () => setShowCancelDialog(true);

  const handleDiscard = useCallback(async () => {
    setShowCancelDialog(false);
    await draftRepo.delete();
    navigation.navigate('Home');
  }, [draftRepo, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Add Photo"
        subtitle="Step 2 of 4 · Optional"
        onBack={handleCancel}
      />

      <View style={styles.body}>
        {/* Photo preview or placeholder */}
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={56} color={theme.colors.border} />
            <Text style={styles.placeholderText}>No photo taken yet</Text>
          </View>
        )}

        {/* Camera error (A2) */}
        {cameraError && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color={theme.colors.error} />
            <Text style={styles.errorText}>{cameraError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <PrimaryButton
            label={photoUri ? '📷 Retake Photo' : '📷 Take Photo'}
            onPress={handleTakePhoto}
          />
          {photoUri && (
            <SecondaryButton
              label="Use This Photo →"
              onPress={() => handleContinue(photoUri)}
            />
          )}
          <SecondaryButton
            label="Skip Photo →"
            onPress={() => handleContinue(null)}
          />
        </View>
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: theme.colors.background },
  body:    { flex: 1, padding: theme.spacing.md, gap: theme.spacing.md },
  preview: { width: '100%', height: 280, borderRadius: theme.borderRadius.lg },
  placeholder: {
    width: '100%', height: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 12,
    ...theme.shadow.sm,
  },
  placeholderText: { color: theme.colors.textSecondary, fontSize: 14 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  errorText: { color: theme.colors.error, fontSize: 13, flex: 1 },
  actions: { gap: theme.spacing.sm },
});

export default AddPhotoScreen;
