import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton, SecondaryButton } from '../../../core/ui';

export default function LocationSelectionScreen({ route, navigation }) {
  const { reportData } = route.params;
  const [location, setLocation] = useState(null);

  const useCurrentLocation = () => {
    setLocation('Current GPS Location Mock');
  };

  const useManualLocation = () => {
    setLocation('Manual Location Mock');
  };

  const handleNext = () => {
    navigation.navigate('AddEvidence', {
      reportData: { ...reportData, location }
    });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Select Location</Text>
      <View style={styles.mapMock}>
        <Text>{location || 'No location selected'}</Text>
      </View>
      <PrimaryButton title="Use Current Location" onPress={useCurrentLocation} />
      <SecondaryButton title="Select Manually on Map" onPress={useManualLocation} />
      <View style={styles.spacer} />
      <PrimaryButton title="Next: Evidence" onPress={handleNext} disabled={!location} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  mapMock: { height: 200, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  spacer: { height: 20 }
});
