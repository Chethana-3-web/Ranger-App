/**
 * Tests for storageService.js
 * Uses the official AsyncStorage Jest mock.
 * Naming: <method>_<condition>_<expectedResult>
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadIncidents,
  saveIncidents,
  appendIncident,
  updateIncident,
  loadPatrol,
  savePatrol,
} from '../storageService';

// AsyncStorage mock is auto-provided by jest-expo via
// @react-native-async-storage/async-storage/jest/async-storage-mock

describe('storageService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // ── loadIncidents ─────────────────────────────────────────────────────────

  describe('loadIncidents', () => {
    test('loadIncidents_emptyStorage_returnsEmptyArray', async () => {
      // Act
      const result = await loadIncidents();
      // Assert
      expect(result).toEqual([]);
    });

    test('loadIncidents_withStoredData_returnsArray', async () => {
      // Arrange
      const incidents = [{ id: 'INC-1', type: 'SNARE' }];
      await AsyncStorage.setItem('@ranger/incidents', JSON.stringify(incidents));

      // Act
      const result = await loadIncidents();

      // Assert
      expect(result).toEqual(incidents);
    });
  });

  // ── saveIncidents ─────────────────────────────────────────────────────────

  describe('saveIncidents', () => {
    test('saveIncidents_validArray_persistsToStorage', async () => {
      // Arrange
      const incidents = [{ id: 'INC-1', type: 'CAMP', syncStatus: 'PENDING' }];

      // Act
      const ok = await saveIncidents(incidents);

      // Assert
      expect(ok).toBe(true);
      const stored = JSON.parse(await AsyncStorage.getItem('@ranger/incidents'));
      expect(stored).toEqual(incidents);
    });

    test('saveIncidents_emptyArray_replacesWithEmpty', async () => {
      // Arrange
      await saveIncidents([{ id: 'INC-1' }]);

      // Act
      await saveIncidents([]);
      const result = await loadIncidents();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── appendIncident ────────────────────────────────────────────────────────

  describe('appendIncident', () => {
    test('appendIncident_emptyStorage_createsArrayWithOneItem', async () => {
      // Arrange
      const incident = { id: 'INC-1', type: 'SNARE', syncStatus: 'PENDING' };

      // Act
      await appendIncident(incident);
      const result = await loadIncidents();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(incident);
    });

    test('appendIncident_existingData_addsToEnd', async () => {
      // Arrange
      const first = { id: 'INC-1', type: 'SNARE' };
      await saveIncidents([first]);

      const second = { id: 'INC-2', type: 'CARCASS' };

      // Act
      await appendIncident(second);
      const result = await loadIncidents();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(second);
    });
  });

  // ── updateIncident ────────────────────────────────────────────────────────

  describe('updateIncident', () => {
    test('updateIncident_matchingId_replacesRecord', async () => {
      // Arrange
      const original = { id: 'INC-1', type: 'SNARE', syncStatus: 'PENDING' };
      await saveIncidents([original]);
      const updated = { ...original, syncStatus: 'SYNCED' };

      // Act
      await updateIncident(updated);
      const result = await loadIncidents();

      // Assert
      expect(result[0].syncStatus).toBe('SYNCED');
    });

    test('updateIncident_noMatchingId_leavesArrayUnchanged', async () => {
      // Arrange
      const incident = { id: 'INC-1', type: 'SNARE', syncStatus: 'PENDING' };
      await saveIncidents([incident]);

      // Act
      await updateIncident({ id: 'INC-GHOST', syncStatus: 'SYNCED' });
      const result = await loadIncidents();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].syncStatus).toBe('PENDING');
    });
  });

  // ── patrol ────────────────────────────────────────────────────────────────

  describe('savePatrol / loadPatrol', () => {
    test('savePatrol_validObject_persistsSuccessfully', async () => {
      // Arrange
      const patrol = { id: 'PTL-001', status: 'ACTIVE' };

      // Act
      const ok = await savePatrol(patrol);

      // Assert
      expect(ok).toBe(true);
    });

    test('loadPatrol_afterSave_returnsPatrol', async () => {
      // Arrange
      const patrol = { id: 'PTL-001', rangerId: 'RNG-001', status: 'ACTIVE' };
      await savePatrol(patrol);

      // Act
      const result = await loadPatrol();

      // Assert
      expect(result).toEqual(patrol);
    });

    test('loadPatrol_emptyStorage_returnsNull', async () => {
      // Act
      const result = await loadPatrol();
      // Assert
      expect(result).toBeNull();
    });
  });
});
