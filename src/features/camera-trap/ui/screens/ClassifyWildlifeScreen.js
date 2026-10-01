/**
 * Classify Wildlife Screen
 *
 * Records the species and animal count for a camera trap image.
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
import { imageReviewService } from '../cameraTrapServices';
import { validateClassification } from '../../application/validator';
import { SPECIES_LIST } from '../../domain/wildlifeClassification';

const OTHER = 'Other';
const SPECIES_OPTIONS = SPECIES_LIST.map((species) => ({ value: species, label: species }));

export default function ClassifyWildlifeScreen({ navigation, route }) {
  const { imageId } = route.params;
  const { user } = useAuth();

  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [otherSpecies, setOtherSpecies] = useState('');
  const [count, setCount] = useState('1');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const data = {
      species: selectedSpecies === OTHER ? otherSpecies : selectedSpecies,
      count: Number(count),
    };

    const validation = validateClassification(data);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    setSaveError(null);
    try {
      await imageReviewService.saveClassification(imageId, data, user.id);
      navigation.replace('ReviewStatus', route.params);
    } catch (err) {
      console.error(err);
      // Entered values stay on screen so the reviewer can retry
      setSaveError('Failed to save classification. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Classify Wildlife" subtitle={imageId} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Species *</Text>
        <OptionList
          options={SPECIES_OPTIONS}
          value={selectedSpecies}
          onChange={(value) => { setSelectedSpecies(value); setErrors((e) => ({ ...e, species: null })); }}
        />
        {selectedSpecies === OTHER ? (
          <TextField
            label="Species name *"
            placeholder="Enter the species"
            value={otherSpecies}
            onChangeText={(text) => { setOtherSpecies(text); setErrors((e) => ({ ...e, species: null })); }}
            error={errors.species}
          />
        ) : errors.species ? (
          <Text style={styles.errorText}>{errors.species}</Text>
        ) : null}

        <View style={styles.spacer} />
        <TextField
          label="Animal Count *"
          placeholder="1"
          value={count}
          onChangeText={(text) => { setCount(text.replace(/[^0-9]/g, '')); setErrors((e) => ({ ...e, count: null })); }}
          keyboardType="number-pad"
          error={errors.count}
        />

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <View style={styles.spacer} />
        <PrimaryButton
          label={saveError ? 'Retry' : 'Save'}
          onPress={handleSave}
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
