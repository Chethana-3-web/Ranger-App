/**
 * Tests for incidentService.js
 * Naming: <method>_<condition>_<expectedResult>
 * Uses InMemoryKeyValueStore to avoid touching real storage.
 */

import { InMemoryKeyValueStore } from '../storage/InMemoryKeyValueStore';
import { initStorageService } from '../storageService';
import {
  logIncident,
  getAllIncidents,
  getIncidentsByPatrol,
  markSynced,
  markFailed,
  getPendingIncidents,
} from '../incidentService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('expo-crypto', () => {
  let counter = 0;
  return {
    randomUUID: jest.fn().mockImplementation(() =>
      Promise.resolve(`test-uuid-${++counter}`)
    ),
  };
});

// ── Shared fixture ────────────────────────────────────────────────────────────

const SAMPLE_PARAMS = {
  patrolId:    'PTL-001',
  rangerId:    'RNG-001',
  parkId:      'PARK-YALA',
  type:        'SNARE',
  description: 'Found a wire snare near the waterhole',
  location: {
    latitude:  6.3728,
    longitude: 81.5198,
    accuracy:  5,
    capturedAt: '2026-09-21T08:00:00.000Z',
    source:    'GPS',
  },
  photoUri: null,
};

describe('incidentService', () => {
  beforeEach(async () => {
    // Initialize with a fresh in-memory store for each test
    const store = InMemoryKeyValueStore();
    initStorageService(store);
    jest.clearAllMocks();
  });

  // ── logIncident ────────────────────────────────────────────────────────────

  describe('logIncident', () => {
    test('logIncident_validParams_returnsIncidentWithPendingStatus', async () => {
      // Act
      const result = await logIncident(SAMPLE_PARAMS);

      // Assert
      expect(result.syncStatus).toBe('PENDING');
      expect(result.retryCount).toBe(0);
      expect(result.type).toBe('SNARE');
    });

    test('logIncident_validParams_assignsUUID', async () => {
      // Act
      const result = await logIncident(SAMPLE_PARAMS);

      // Assert – UUID is a non-empty string assigned by the generator
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    test('logIncident_validParams_persistsToStorage', async () => {
      // Act
      await logIncident(SAMPLE_PARAMS);
      const stored = await getAllIncidents();

      // Assert
      expect(stored).toHaveLength(1);
      expect(stored[0].type).toBe('SNARE');
    });

    test('logIncident_withoutPhoto_setsPhotoUriNull', async () => {
      // Act
      const result = await logIncident({ ...SAMPLE_PARAMS, photoUri: undefined });

      // Assert
      expect(result.photoUri).toBeNull();
    });

    test('logIncident_withPhoto_setsPhotoUri', async () => {
      // Arrange
      const uri = 'file:///tmp/photo.jpg';

      // Act
      const result = await logIncident({ ...SAMPLE_PARAMS, photoUri: uri });

      // Assert
      expect(result.photoUri).toBe(uri);
    });

    test('logIncident_setsLoggedAtIsoString', async () => {
      // Act
      const result = await logIncident(SAMPLE_PARAMS);

      // Assert
      expect(() => new Date(result.loggedAt)).not.toThrow();
      expect(result.loggedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ── getIncidentsByPatrol ───────────────────────────────────────────────────

  describe('getIncidentsByPatrol', () => {
    test('getIncidentsByPatrol_matchingPatrolId_returnsSubset', async () => {
      // Arrange
      await logIncident({ ...SAMPLE_PARAMS, patrolId: 'PTL-001' });
      await logIncident({ ...SAMPLE_PARAMS, patrolId: 'PTL-002' });

      // Act
      const result = await getIncidentsByPatrol('PTL-001');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].patrolId).toBe('PTL-001');
    });

    test('getIncidentsByPatrol_noMatches_returnsEmptyArray', async () => {
      // Act
      const result = await getIncidentsByPatrol('PTL-GHOST');

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ── markSynced ─────────────────────────────────────────────────────────────

  describe('markSynced', () => {
    test('markSynced_existingId_setsSyncStatusToSynced', async () => {
      // Arrange
      const inc = await logIncident(SAMPLE_PARAMS);

      // Act
      await markSynced(inc.id);
      const all = await getAllIncidents();

      // Assert
      expect(all[0].syncStatus).toBe('SYNCED');
    });

    test('markSynced_unknownId_doesNotThrow', async () => {
      // Act & Assert – should resolve without error
      await expect(markSynced('ghost-id')).resolves.toBeUndefined();
    });
  });

  // ── markFailed ─────────────────────────────────────────────────────────────

  describe('markFailed', () => {
    test('markFailed_firstFailure_setsStatusFailedAndIncrementsRetry', async () => {
      // Arrange
      const inc = await logIncident(SAMPLE_PARAMS);

      // Act
      await markFailed(inc.id);
      const all = await getAllIncidents();

      // Assert
      expect(all[0].syncStatus).toBe('FAILED');
      expect(all[0].retryCount).toBe(1);
    });

    test('markFailed_calledTwice_retryCountIsTwo', async () => {
      // Arrange
      const inc = await logIncident(SAMPLE_PARAMS);

      // Act
      await markFailed(inc.id);
      await markFailed(inc.id);
      const all = await getAllIncidents();

      // Assert
      expect(all[0].retryCount).toBe(2);
    });
  });

  // ── getPendingIncidents ────────────────────────────────────────────────────

  describe('getPendingIncidents', () => {
    test('getPendingIncidents_mixedStatuses_returnsPendingOnly', async () => {
      // Arrange
      const pending  = await logIncident({ ...SAMPLE_PARAMS, type: 'SNARE' });
      const synced   = await logIncident({ ...SAMPLE_PARAMS, type: 'CAMP' });
      await markSynced(synced.id);

      // Act
      const result = await getPendingIncidents(3);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(pending.id);
    });

    test('getPendingIncidents_failedWithinRetryLimit_isIncluded', async () => {
      // Arrange
      const inc = await logIncident(SAMPLE_PARAMS);
      await markFailed(inc.id); // retryCount = 1

      // Act
      const result = await getPendingIncidents(3); // maxRetries = 3

      // Assert – failed + retryCount(1) < maxRetries(3) → included
      expect(result.some((i) => i.id === inc.id)).toBe(true);
    });

    test('getPendingIncidents_failedExceedingRetryLimit_isExcluded', async () => {
      // Arrange
      const inc = await logIncident(SAMPLE_PARAMS);
      await markFailed(inc.id);
      await markFailed(inc.id);
      await markFailed(inc.id); // retryCount = 3

      // Act
      const result = await getPendingIncidents(3); // maxRetries = 3

      // Assert – retryCount(3) is NOT < maxRetries(3) → excluded
      expect(result.some((i) => i.id === inc.id)).toBe(false);
    });
  });
});
