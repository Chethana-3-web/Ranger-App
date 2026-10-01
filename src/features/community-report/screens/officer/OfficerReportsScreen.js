import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../../core/ui';
import { getReports } from '../../store';

export default function OfficerReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReports();
    });
    return unsubscribe;
  }, [navigation]);

  const loadReports = async () => {
    const data = await getReports();
    setReports(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('OfficerReportDetails', { report: item })}
    >
      <Text style={styles.id}>{item.id} [{item.priority}]</Text>
      <Text>{item.incidentType} - {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Text style={styles.title}>All Community Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, backgroundColor: '#f0f8ff', marginBottom: 10, borderRadius: 5 },
  id: { fontWeight: 'bold' }
});
