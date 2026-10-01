import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton, SecondaryButton } from '../../../core/ui';

export default function AddEvidenceScreen({ route, navigation }) {
  const { reportData } = route.params;
  const [photoAdded, setPhotoAdded] = useState(false);

  const handleNext = () => {
    navigation.navigate('ReviewReport', {
      reportData: { ...reportData, hasEvidence: photoAdded }
    });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Add Evidence (Optional)</Text>
      {photoAdded ? (
        <Text style={styles.status}>Photo uploaded successfully!</Text>
      ) : (
        <SecondaryButton title="Upload Photo" onPress={() => setPhotoAdded(true)} />
      )}
      <View style={styles.spacer} />
      <PrimaryButton title="Next: Review" onPress={handleNext} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  status: { marginBottom: 20, color: 'green' },
  spacer: { height: 20 }
});
