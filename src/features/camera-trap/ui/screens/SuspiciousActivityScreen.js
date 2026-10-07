/**
 * Suspicious Activity Screen
 *
 * Reviews human activity detected in a camera trap image.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AppHeader from '../../../../core/ui/AppHeader';
import { TextField } from '../../../../core/ui/TextField';
import { PrimaryButton } from '../../../../core/ui/PrimaryButton';
import { SecondaryButton } from '../../../../core/ui/SecondaryButton';
import COLORS from '../../../../core/constants/colors';
import { useAuth } from '../../../../context/AuthContext';
import OptionList from '../components/OptionList';
import { suspiciousActivityService } from '../cameraTrapServices';
import { validateSuspiciousActivity } from '../../application/validator';
import { SUSPICIOUS_REASONS } from '../../domain/suspiciousActivity';

const SUSPICIOUS = 'suspicious';
const OTHER = 'Other';

const DECISION_OPTIONS = [
  { value: SUSPICIOUS, label: 'Suspicious' },
  { value: 'not_suspicious', label: 'Not Suspicious' },
  { value: 'unclear', label: 'Unclear' },
];
const REASON_OPTIONS = SUSPICIOUS_REASONS.map((reason) => ({ value: reason, label: reason }));

export default function SuspiciousActivityScreen({ navigation, route }) {
  const { imageId } = route.params;
  const { user } = useAuth();

  const [decision, setDecision] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherReason, setOtherReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isSuspicious = decision === SUSPICIOUS;

  const handleSave = async () => {
    const reason = selectedReason === OTHER ? otherReason.trim() : selectedReason;
    const data = isSuspicious
      ? { decision, reason: reason || null, notes: notes.trim() || null }
      : { decision };

    const validation = validateSuspiciousActivity(data);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    setSaveError(null);
    try {
      await suspiciousActivityService.saveSuspiciousFlag(imageId, data, user.id);
      navigation.replace('ReviewStatus', route.params);
    } catch (err) {
      console.error(err);
      // Reason and notes stay on screen so the reviewer can retry
      setSaveError('Failed to flag suspicious activity. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Suspicious Activity" subtitle={imageId} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Is the human activity suspicious? *</Text>
        <OptionList
          options={DECISION_OPTIONS}
          value={decision}
          onChange={(value) => { setDecision(value); setErrors({}); }}
        />

        {isSuspicious ? (
          <>
            <View style={styles.spacer} />
            <Text style={styles.label}>Reason *</Text>
            <OptionList
              options={REASON_OPTIONS}
              value={selectedReason}
              onChange={(value) => { setSelectedReason(value); setErrors((e) => ({ ...e, reason: null })); }}
            />
            {selectedReason === OTHER ? (
              <TextField
                label="Describe the reason *"
                placeholder="Enter the reason"
                value={otherReason}
                onChangeText={(text) => { setOtherReason(text); setErrors((e) => ({ ...e, reason: null })); }}
                error={errors.reason}
              />
            ) : errors.reason ? (
              <Text style={styles.errorText}>{errors.reason}</Text>
            ) : null}

            <View style={styles.spacer} />
            <TextField
              label="Notes (optional)"
              placeholder="What did you see?"
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={300}
            />
          </>
        ) : null}

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <View style={styles.spacer} />
        <PrimaryButton
          label={saveError ? 'Retry' : isSuspicious ? 'Flag Image' : 'Save Review'}
          onPress={handleSave}
          disabled={!decision}
          loading={saving}
        />
        <View style={styles.spacer} />
        <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.ERROR,
  },
  saveError: {
    fontSize: 14,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: 12,
  },
  spacer: {
    height: 12,
  },
});
