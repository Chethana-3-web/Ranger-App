/**
 * ResponseEditScreen
 * Edit an existing alert response — update notes and/or outcome.
 * Saves back to Firestore and updates the parent alert status.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import AppHeader from '../../../core/ui/AppHeader';
import { updateAlertResponse } from '../services/alertService';
import PhotoPicker from '../components/PhotoPicker';
import COLORS from '../../../core/constants/colors';
import theme from '../../../core/ui/theme';

const OUTCOMES = [
  { id: 'Resolved',   label: 'Resolved',          icon: 'checkmark-circle-outline', color: '#2E7D32' },
  { id: 'Monitoring', label: 'Continue Monitoring', icon: 'eye-outline',              color: '#F57F17' },
  { id: 'Reassigned', label: 'Involve Another Ranger', icon: 'people-outline',        color: '#1565C0' },
];

export default function ResponseEditScreen() {
  const navigation  = useNavigation();
  const { params }  = useRoute();
  const { response } = params;

  const [outcome,  setOutcome]  = useState(response.outcome);
  const [notes,    setNotes]    = useState(response.notes ?? '');
  const [photoUri, setPhotoUri] = useState(response.photoUri ?? null);
  const [saving,   setSaving]   = useState(false);

  const isDirty = outcome !== response.outcome || notes !== (response.notes ?? '') || photoUri !== (response.photoUri ?? null);

  const handleSave = async () => {
    if (!notes.trim()) {
      Alert.alert('Notes required', 'Please enter the action taken.');
      return;
    }
    setSaving(true);
    try {
      await updateAlertResponse({
        responseId: response.id,
        alertId:    response.alertId,
        outcome,
        notes:      notes.trim(),
        photoUri,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Save failed', 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!isDirty) { navigation.goBack(); return; }
    Alert.alert('Discard changes?', 'Your edits will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <AppHeader
        title="Edit Response"
        subtitle={`Alert: ${response.alertId}`}
        onBack={handleDiscard}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Outcome selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Response Outcome</Text>
          {OUTCOMES.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionBtn,
                outcome === opt.id && { borderColor: opt.color, backgroundColor: opt.color + '12' },
              ]}
              onPress={() => setOutcome(opt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '20' }]}>
                <Ionicons name={opt.icon} size={20} color={opt.color} />
              </View>
              <Text style={[styles.optionLabel, outcome === opt.id && { color: opt.color }]}>
                {opt.label}
              </Text>
              {outcome === opt.id && (
                <Ionicons name="checkmark-circle" size={20} color={opt.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes editor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Action Taken</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholder="Describe the action taken…"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
          />
          <Text style={styles.charCount}>{notes.length} characters</Text>
        </View>

        {/* Photo evidence */}
        <View style={styles.card}>
          <PhotoPicker photoUri={photoUri} onPhotoChange={setPhotoUri} />
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.saveBtn, (!isDirty || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isDirty || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name="save-outline" size={20} color="#fff" />
          }
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
          <Text style={styles.discardBtnText}>Discard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 16, paddingBottom: 60 },

  card:         { backgroundColor: COLORS.SURFACE, borderRadius: 12, padding: 14, marginBottom: 14, ...theme.shadow.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_SECONDARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  optionBtn:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: COLORS.BORDER, borderRadius: 10, padding: 12, marginBottom: 8 },
  optionIcon:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.TEXT_PRIMARY },

  notesInput: {
    backgroundColor: COLORS.BACKGROUND, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.BORDER,
    padding: 12, fontSize: 14, color: COLORS.TEXT_PRIMARY, minHeight: 140,
  },
  charCount: { fontSize: 11, color: COLORS.TEXT_SECONDARY, textAlign: 'right', marginTop: 4 },

  saveBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.PRIMARY, borderRadius: 12, paddingVertical: 14, marginBottom: 10 },
  saveBtnDisabled: { backgroundColor: COLORS.BORDER },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },

  discardBtn:     { alignItems: 'center', paddingVertical: 12 },
  discardBtnText: { fontSize: 14, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
});
