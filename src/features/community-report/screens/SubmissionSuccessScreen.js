import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton } from '../../../core/ui';

export default function SubmissionSuccessScreen({ route, navigation }) {
  const { reportId } = route.params;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Success!</Text>
      <Text style={styles.subtitle}>Your report has been submitted.</Text>
      <Text style={styles.id}>Report ID: {reportId}</Text>
      <View style={styles.spacer} />
      <PrimaryButton title="Go to My Reports" onPress={() => navigation.navigate('MyReports')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: 'green' },
  subtitle: { fontSize: 18, marginBottom: 20 },
  id: { fontSize: 16, fontWeight: 'bold' },
  spacer: { height: 40 }
});
