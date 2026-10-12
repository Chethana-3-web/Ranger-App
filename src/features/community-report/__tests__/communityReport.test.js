import {
  generateReportId,
  calculatePriority,
  createReport,
  getReports,
  updateReportStatus,
} from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Community Report Store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('generateReportId', () => {
    test('generateReportId_called_matchesExpectedFormat', () => {
      const id = generateReportId();
      const currentYear = new Date().getFullYear();
      expect(id).toMatch(new RegExp(`^CR-${currentYear}-\\d{5}$`));
    });

    test('generateReportId_calledMultipleTimes_generatesUniqueIds', () => {
      const id1 = generateReportId();
      const id2 = generateReportId();
      // Extremely low chance of colliding random 5 digits
      expect(id1).not.toBe(id2);
    });
  });

  describe('calculatePriority', () => {
    test('calculatePriority_whenEmergencyTrue_returnsHigh', () => {
      expect(calculatePriority('Noise Complaint', true)).toBe('HIGH');
    });

    test('calculatePriority_whenPoachingType_returnsHigh', () => {
      expect(calculatePriority('Poaching', false)).toBe('HIGH');
    });

    test('calculatePriority_whenWildfireType_returnsHigh', () => {
      expect(calculatePriority('Wildfire', false)).toBe('HIGH');
    });

    test('calculatePriority_whenSuspiciousActivity_returnsMedium', () => {
      expect(calculatePriority('Suspicious Activity', false)).toBe('MEDIUM');
    });

    test('calculatePriority_whenGeneralSighting_returnsLow', () => {
      expect(calculatePriority('Animal Sighting', false)).toBe('LOW');
    });
  });

  describe('createReport & getReports', () => {
    test('createReport_validData_persistsAndReturnsReport', async () => {
      const reportData = {
        incidentType: 'Poaching',
        description: 'Suspicious vehicle near park boundary',
        date: '2026-10-12',
        time: '14:30',
        isEmergency: false,
        location: 'Yala Sector 1',
      };

      const created = await createReport(reportData);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.priority).toBe('HIGH');
      expect(created.status).toBe('SUBMITTED');
      expect(created.history).toHaveLength(1);
      expect(created.history[0].status).toBe('SUBMITTED');

      const allReports = await getReports();
      expect(allReports).toHaveLength(1);
      expect(allReports[0].id).toBe(created.id);
    });
  });

  describe('updateReportStatus', () => {
    test('updateReportStatus_existingReport_updatesStatusAndHistory', async () => {
      const created = await createReport({
        incidentType: 'Suspicious Activity',
        description: 'Trespassers spotted',
        isEmergency: false,
      });

      const updated = await updateReportStatus(created.id, 'UNDER REVIEW', 'Reviewing evidence');

      expect(updated).not.toBeNull();
      expect(updated.status).toBe('UNDER REVIEW');
      expect(updated.history).toHaveLength(2);
      expect(updated.history[1].status).toBe('UNDER REVIEW');
      expect(updated.history[1].note).toBe('Reviewing evidence');
    });

    test('updateReportStatus_nonExistentId_returnsNull', async () => {
      const result = await updateReportStatus('NON-EXISTENT-ID', 'RESOLVED', 'Note');
      expect(result).toBeNull();
    });
  });
});
