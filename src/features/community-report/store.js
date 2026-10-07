import AsyncStorage from '@react-native-async-storage/async-storage';

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
