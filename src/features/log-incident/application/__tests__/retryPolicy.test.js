/**
 * Tests for retryPolicy.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import { shouldRetry, getDelayMs, BASE_MS, FACTOR, CAP_MS } from '../retryPolicy';
import { MAX_SYNC_ATTEMPTS } from '../../domain/incident';
import { SyncStatus } from '../../domain/syncStatus';

describe('shouldRetry', () => {
  test('shouldRetry_withZeroAttempts_returnsTrue', () => {
    expect(shouldRetry({ syncAttempts: 0, status: SyncStatus.PENDING_SYNC })).toBe(true);
  });

  test('shouldRetry_withAttemptsLessThanMax_returnsTrue', () => {
    expect(shouldRetry({ syncAttempts: MAX_SYNC_ATTEMPTS - 1, status: SyncStatus.PENDING_SYNC })).toBe(true);
  });

  test('shouldRetry_withAttemptsAtMax_returnsFalse', () => {
    expect(shouldRetry({ syncAttempts: MAX_SYNC_ATTEMPTS, status: SyncStatus.FAILED })).toBe(false);
  });

  test('shouldRetry_withAttemptsAboveMax_returnsFalse', () => {
    expect(shouldRetry({ syncAttempts: MAX_SYNC_ATTEMPTS + 2, status: SyncStatus.FAILED })).toBe(false);
  });
});

describe('getDelayMs', () => {
  test('getDelayMs_firstAttempt_returnsBaseMs', () => {
    expect(getDelayMs(0)).toBe(BASE_MS);
  });

  test('getDelayMs_secondAttempt_returnsDoubled', () => {
    expect(getDelayMs(1)).toBe(BASE_MS * FACTOR);
  });

  test('getDelayMs_thirdAttempt_returnsQuadrupled', () => {
    expect(getDelayMs(2)).toBe(BASE_MS * FACTOR * FACTOR);
  });

  test('getDelayMs_highAttempt_capsAtCapMs', () => {
    // attempt 20 would be enormous without a cap
    expect(getDelayMs(20)).toBe(CAP_MS);
  });

  test('getDelayMs_atCapBoundary_doesNotExceedCap', () => {
    for (let i = 0; i <= 20; i++) {
      expect(getDelayMs(i)).toBeLessThanOrEqual(CAP_MS);
    }
  });

  test('getDelayMs_delaysAreMonotonicallyIncreasing', () => {
    for (let i = 0; i < 8; i++) {
      expect(getDelayMs(i + 1)).toBeGreaterThanOrEqual(getDelayMs(i));
    }
  });
});
