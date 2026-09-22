/**
 * Log Patrol Incident – Retry Policy
 *
 * Exponential backoff for sync retries.
 *
 * Config:
 *   BASE_MS       = 2 000 ms  (first retry delay)
 *   FACTOR        = 2         (doubles each attempt)
 *   CAP_MS        = 300 000 ms (5 minutes max)
 *   MAX_ATTEMPTS  = 5
 *
 * Delay schedule (attempt index 0-based):
 *   attempt 0 → 2 s
 *   attempt 1 → 4 s
 *   attempt 2 → 8 s
 *   attempt 3 → 16 s
 *   attempt 4 → 32 s  (capped at 300 s above attempt 8)
 */

import { MAX_SYNC_ATTEMPTS } from '../domain/incident';

export const BASE_MS      = 2_000;
export const FACTOR       = 2;
export const CAP_MS       = 300_000;

/**
 * Returns true if the incident should be retried.
 *
 * @param {{ syncAttempts: number, status: string }} incident
 * @returns {boolean}
 */
export function shouldRetry(incident) {
  return incident.syncAttempts < MAX_SYNC_ATTEMPTS;
}

/**
 * Calculate the delay in milliseconds before the next retry.
 * The attempt parameter is the current syncAttempts value (before incrementing).
 *
 * @param {number} attempt – zero-based attempt index
 * @returns {number} delay in milliseconds
 */
export function getDelayMs(attempt) {
  const raw = BASE_MS * Math.pow(FACTOR, attempt);
  return Math.min(raw, CAP_MS);
}

export default { shouldRetry, getDelayMs, BASE_MS, FACTOR, CAP_MS };
