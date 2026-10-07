import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { ScreenContainer, PrimaryButton, TextField, theme } from '../../../core/ui';

export default function SubmitReportScreen({ navigation }) {
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const handleNext = () => {
    navigation.navigate('LocationSelection', {
      reportData: { incidentType, description, date, time, isEmergency }
    });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Submit a Community Report</Text>
      <TextField label="Incident Type" value={incidentType} onChangeText={setIncidentType} />
      <TextField label="Description" value={description} onChangeText={setDescription} multiline />
      <TextField label="Date" value={date} onChangeText={setDate} />
      <TextField label="Time" value={time} onChangeText={setTime} />
      <View style={styles.switchContainer}>
        <Text>Is Emergency?</Text>
        <Switch value={isEmergency} onValueChange={setIsEmergency} />
      </View>
      <PrimaryButton title="Next: Location" onPress={handleNext} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }
});
