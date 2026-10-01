const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'features', 'community-report');
const screensDir = path.join(baseDir, 'screens');
const officerDir = path.join(screensDir, 'officer');

fs.mkdirSync(officerDir, { recursive: true });

const files = {
  'store.js': `import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@community_reports';

export const getReports = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading reports', error);
    return [];
  }
};

export const saveReports = async (reports) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving reports', error);
  }
};

export const generateReportId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return 'CR-' + year + '-' + random;
};

export const calculatePriority = (incidentType, isEmergency) => {
  if (isEmergency) return 'HIGH';
  if (incidentType === 'Poaching' || incidentType === 'Wildfire') return 'HIGH';
  if (incidentType === 'Suspicious Activity') return 'MEDIUM';
  return 'LOW';
};

export const createReport = async (reportData) => {
  const reports = await getReports();
  const id = generateReportId();
  const priority = calculatePriority(reportData.incidentType, reportData.isEmergency);
  
  const newReport = {
    ...reportData,
    id,
    priority,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    history: [{ status: 'SUBMITTED', timestamp: new Date().toISOString(), note: 'Report submitted by member' }]
  };
  
  reports.push(newReport);
  await saveReports(reports);
  return newReport;
};

export const updateReportStatus = async (reportId, newStatus, note = '') => {
  const reports = await getReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex >= 0) {
    reports[reportIndex].status = newStatus;
    reports[reportIndex].history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note
    });
    await saveReports(reports);
    return reports[reportIndex];
  }
  return null;
};
`,
  'screens/SubmitReportScreen.js': `import React, { useState } from 'react';
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
`,
  'screens/LocationSelectionScreen.js': `import React, { useState } from 'react';
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
`,
  'screens/AddEvidenceScreen.js': `import React, { useState } from 'react';
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
`,
  'screens/ReviewReportScreen.js': `import React from 'react';
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
`,
  'screens/SubmissionSuccessScreen.js': `import React from 'react';
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
`,
  'screens/MyReportsScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../core/ui';
import { getReports } from '../store';

export default function MyReportsScreen({ navigation }) {
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
      onPress={() => navigation.navigate('ReportDetails', { report: item })}
    >
      <Text style={styles.id}>{item.id}</Text>
      <Text>{item.incidentType} - {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Reports</Text>
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
  card: { padding: 15, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 5 },
  id: { fontWeight: 'bold' }
});
`,
  'screens/ReportDetailsScreen.js': `import React, { useState } from 'react';
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
`,
  'screens/officer/OfficerReportsScreen.js': `import React, { useState, useEffect } from 'react';
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
`,
  'screens/officer/OfficerReportDetailsScreen.js': `import React, { useState } from 'react';
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
`
};

for (const [relativePath, content] of Object.entries(files)) {
  const filePath = path.join(baseDir, relativePath);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Generated ' + filePath);
}
