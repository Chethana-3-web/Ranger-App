import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton } from '../../../core/ui';
import { createReport } from '../store';

export default function ReviewReportScreen({ route, navigation }) {
  const { reportData } = route.params;

  const handleSubmit = async () => {
    const report = await createReport(reportData);
    navigation.navigate('SubmissionSuccess', { reportId: report.id });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Review Report</Text>
      <Text>Type: {reportData.incidentType}</Text>
      <Text>Description: {reportData.description}</Text>
      <Text>Date/Time: {reportData.date} {reportData.time}</Text>
      <Text>Emergency: {reportData.isEmergency ? 'Yes' : 'No'}</Text>
      <Text>Location: {reportData.location}</Text>
      <Text>Evidence: {reportData.hasEvidence ? 'Included' : 'None'}</Text>
      <View style={styles.spacer} />
      <PrimaryButton title="Submit Report" onPress={handleSubmit} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  spacer: { height: 20 }
});
