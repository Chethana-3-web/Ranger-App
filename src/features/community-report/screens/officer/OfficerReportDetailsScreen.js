import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton, SecondaryButton, TextField } from '../../../../core/ui';
import { updateReportStatus } from '../../store';

export default function OfficerReportDetailsScreen({ route, navigation }) {
  const [report, setReport] = useState(route.params.report);
  const [note, setNote] = useState('');

  const handleAction = async (newStatus) => {
    const updated = await updateReportStatus(report.id, newStatus, note);
    if (updated) {
      setReport(updated);
      setNote('');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView>
        <Text style={styles.title}>Report Management</Text>
        <Text style={styles.id}>{report.id}</Text>
        <Text>Status: {report.status}</Text>
        <Text>Priority: {report.priority}</Text>
        <Text>Description: {report.description}</Text>
        <Text>Emergency: {report.isEmergency ? 'YES' : 'NO'}</Text>
        
        <View style={styles.actions}>
          <TextField label="Action Note" value={note} onChangeText={setNote} multiline />
          
          <View style={styles.buttonGroup}>
            <PrimaryButton title="Start Review" onPress={() => handleAction('UNDER REVIEW')} />
            <SecondaryButton title="Request Clarification" onPress={() => handleAction('NEEDS CLARIFICATION')} />
          </View>
          
          <View style={styles.buttonGroup}>
            <PrimaryButton title="Mark In Progress" onPress={() => handleAction('IN PROGRESS')} />
            <PrimaryButton title="Mark Handled" onPress={() => handleAction('HANDLED')} />
          </View>
        </View>

        <Text style={styles.subtitle}>Timeline</Text>
        {report.history.map((h, i) => (
          <View key={i} style={styles.historyItem}>
            <Text>{h.timestamp} - {h.status}</Text>
            {h.note ? <Text>Note: {h.note}</Text> : null}
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
  actions: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  historyItem: { padding: 10, borderLeftWidth: 2, borderLeftColor: '#007BFF', marginBottom: 10 }
});
