/**
 * Tests for incident.js domain logic
 * Naming: <method>_<condition>_<expectedResult>
 */

import {
  createIncident,
  markSynced,
  recordFailedAttempt,
  resetForRetry,
  MAX_SYNC_ATTEMPTS,
} from '../incident';
import { SyncStatus } from '../syncStatus';
import { AppError } from '../../../../core/domain/errors';

const fakeClock = { iso: () => '2026-09-22T10:00:00.000Z' };

/** Helper – creates a minimal valid incident */
function makeIncident(overrides = {}) {
  return createIncident({
    id:          'INC-001',
    type:        'SNARE',
    description: 'Found a wire snare near the waterhole.',
    location:    { latitude: 6.37, longitude: 81.52, source: 'GPS', accuracyMeters: 5, capturedAt: '2026-09-22T09:00:00.000Z' },
    recordedAt:  '2026-09-22T09:00:00.000Z',
    rangerId:    'RNG-001',
    patrolId:    'PTL-001',
    parkId:      'PARK-YALA',
    ...overrides,
  });
}

describe('createIncident', () => {
  test('createIncident_withValidFields_returnsPendingSyncIncident', () => {
    const incident = makeIncident();
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
    expect(incident.syncAttempts).toBe(0);
    expect(incident.lastError).toBeNull();
    expect(incident.syncedAt).toBeNull();
  });

  test('createIncident_withNoPhoto_setsPhotoUriNull', () => {
    const incident = makeIncident();
    expect(incident.photoUri).toBeNull();
  });

  test('createIncident_withPhoto_setsPhotoUri', () => {
    const incident = makeIncident({ photoUri: 'file://photo.jpg' });
    expect(incident.photoUri).toBe('file://photo.jpg');
  });

  test('createIncident_preservesAllFields', () => {
    const incident = makeIncident();
    expect(incident.id).toBe('INC-001');
    expect(incident.type).toBe('SNARE');
    expect(incident.rangerId).toBe('RNG-001');
    expect(incident.patrolId).toBe('PTL-001');
    expect(incident.parkId).toBe('PARK-YALA');
  });
});

describe('markSynced', () => {
  test('markSynced_pendingIncident_returnsNewSyncedIncident', () => {
    const incident = makeIncident();
    const synced = markSynced(incident, '2026-09-22T10:00:00.000Z');
    expect(synced.status).toBe(SyncStatus.SYNCED);
    expect(synced.syncedAt).toBe('2026-09-22T10:00:00.000Z');
    expect(synced.lastError).toBeNull();
  });

  test('markSynced_doesNotMutateOriginal', () => {
    const incident = makeIncident();
    markSynced(incident, '2026-09-22T10:00:00.000Z');
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
  });

  test('markSynced_alreadySynced_throwsAppError', () => {
    const incident = makeIncident();
    const synced = markSynced(incident, '2026-09-22T10:00:00.000Z');
    expect(() => markSynced(synced, '2026-09-22T11:00:00.000Z')).toThrow(AppError);
  });
});

describe('recordFailedAttempt', () => {
  test('recordFailedAttempt_firstFailure_incrementsAttemptsAndStaysPending', () => {
    const incident = makeIncident();
    const failed = recordFailedAttempt(incident, 'Network error', fakeClock);
    expect(failed.syncAttempts).toBe(1);
    expect(failed.status).toBe(SyncStatus.PENDING_SYNC);
    expect(failed.lastError).toBe('Network error');
  });

  test('recordFailedAttempt_atMaxAttempts_transitionsToFailed', () => {
    let incident = makeIncident();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS; i++) {
      incident = recordFailedAttempt(incident, 'error', fakeClock);
    }
    expect(incident.status).toBe(SyncStatus.FAILED);
    expect(incident.syncAttempts).toBe(MAX_SYNC_ATTEMPTS);
  });

  test('recordFailedAttempt_oneShotBeforeMax_remainsPending', () => {
    let incident = makeIncident();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS - 1; i++) {
      incident = recordFailedAttempt(incident, 'err', fakeClock);
    }
    expect(incident.status).toBe(SyncStatus.PENDING_SYNC);
  });

  test('recordFailedAttempt_onSyncedIncident_throwsAppError', () => {
    const incident = makeIncident();
    const synced = markSynced(incident, '2026-09-22T10:00:00.000Z');
    expect(() => recordFailedAttempt(synced, 'oops', fakeClock)).toThrow(AppError);
  });
});

describe('resetForRetry', () => {
  test('resetForRetry_failedIncident_returnsPendingSyncWithZeroAttempts', () => {
    let incident = makeIncident();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS; i++) {
      incident = recordFailedAttempt(incident, 'err', fakeClock);
    }
    expect(incident.status).toBe(SyncStatus.FAILED);

    const reset = resetForRetry(incident);
    expect(reset.status).toBe(SyncStatus.PENDING_SYNC);
    expect(reset.syncAttempts).toBe(0);
    expect(reset.lastError).toBeNull();
  });

  test('resetForRetry_pendingIncident_throwsAppError', () => {
    const incident = makeIncident();
    expect(() => resetForRetry(incident)).toThrow(AppError);
  });

  test('resetForRetry_doesNotMutateOriginal', () => {
    let incident = makeIncident();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS; i++) {
      incident = recordFailedAttempt(incident, 'err', fakeClock);
    }
    resetForRetry(incident);
    expect(incident.status).toBe(SyncStatus.FAILED);
  });
});
