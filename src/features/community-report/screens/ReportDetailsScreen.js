import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton, TextField } from '../../../core/ui';
import { updateReportStatus } from '../store';

export default function ReportDetailsScreen({ route, navigation }) {
  const [report, setReport] = useState(route.params.report);
  const [clarificationInfo, setClarificationInfo] = useState('');

  const handleSubmitClarification = async () => {
    const updated = await updateReportStatus(report.id, 'CLARIFICATION_PROVIDED', clarificationInfo);
    if (updated) {
      setReport(updated);
      setClarificationInfo('');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView>
        <Text style={styles.title}>Report Details</Text>
        <Text style={styles.id}>{report.id}</Text>
        <Text>Status: {report.status}</Text>
        <Text>Type: {report.incidentType}</Text>
        <Text>Description: {report.description}</Text>
        
        {report.status === 'NEEDS CLARIFICATION' && (
          <View style={styles.clarificationContainer}>
            <Text style={styles.subtitle}>Provide additional info:</Text>
            <TextField label="Clarification" value={clarificationInfo} onChangeText={setClarificationInfo} multiline />
            <PrimaryButton title="Submit Info" onPress={handleSubmitClarification} />
          </View>
        )}

        <Text style={styles.subtitle}>Timeline</Text>
        {report.history.map((h, i) => (
          <View key={i} style={styles.historyItem}>
            <Text>{h.timestamp} - {h.status}</Text>
            {h.note ? <Text>{h.note}</Text> : null}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  id: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  historyItem: { padding: 10, borderLeftWidth: 2, borderLeftColor: '#ccc', marginBottom: 10 },
  clarificationContainer: { marginTop: 20, padding: 10, backgroundColor: '#ffe' }
});
