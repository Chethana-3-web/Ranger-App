/**
 * Log Patrol Incident – Incident Domain
 *
 * Pure data factory and state-transition helpers.
 * Incident objects are plain data (no methods) — all mutations return new objects.
 * Illegal state transitions throw AppError.
 */

import { AppError } from '../../../core/domain/errors';
import { SyncStatus } from './syncStatus';

/** Maximum number of sync attempts before an incident is marked FAILED. */
export const MAX_SYNC_ATTEMPTS = 5;

/**
 * @typedef {Object} Incident
 * @property {string}      id             – client-generated UUID
 * @property {string}      reportType
 * @property {string}      type           – IncidentType key
 * @property {string}      description    – trimmed, 1-500 chars
 * @property {import('../../../core/domain/location').RangerLocation} location
 * @property {string|null} photoUri       – persisted photo URI or null
 * @property {string}      recordedAt     – ISO timestamp
 * @property {string}      rangerId
 * @property {string}      patrolId
 * @property {string}      parkId
 * @property {string}      status         – SyncStatus key
 * @property {number}      syncAttempts   – number of upload attempts
 * @property {string|null} lastError      – last sync error message or null
 * @property {string|null} syncedAt       – ISO timestamp when synced, or null
 */

/**
 * Create a new Incident in PENDING_SYNC state.
 *
 * @param {{
 *   id: string,
 *   reportType?: string,
 *   type: string,
 *   description: string,
 *   location: import('../../../core/domain/location').RangerLocation,
 *   photoUri?: string|null,
 *   recordedAt: string,
 *   rangerId: string,
 *   patrolId: string,
 *   parkId: string
 * }} fields
 * @returns {Incident}
 */
export function createIncident(fields) {
  return {
    id: fields.id, reportType: fields.reportType,
    type:         fields.type,
    description:  fields.description,
    location:     fields.location,
    photoUri:     fields.photoUri ?? null,
    recordedAt:   fields.recordedAt,
    rangerId:     fields.rangerId,
    patrolId:     fields.patrolId,
    parkId:       fields.parkId,
    status:       SyncStatus.PENDING_SYNC,
    syncAttempts: 0,
    lastError:    null,
    syncedAt:     null,
  };
}

/**
 * Transition an incident to SYNCED.
 * Throws if already SYNCED or in FAILED state.
 *
 * @param {Incident} incident
 * @param {string} syncedAt – ISO timestamp
 * @returns {Incident} new incident object
 */
export function markSynced(incident, syncedAt) {
  if (incident.status === SyncStatus.SYNCED) {
    throw new AppError(
      `Incident ${incident.id} is already SYNCED`,
      'ILLEGAL_TRANSITION',
    );
  }
  return {
    ...incident,
    status:    SyncStatus.SYNCED,
    syncedAt,
    lastError: null,
  };
}

/**
 * Record a failed sync attempt. Transitions to FAILED when max attempts reached.
 *
 * @param {Incident} incident
 * @param {string} errorMessage
 * @param {{ iso: () => string }} clock – injectable clock
 * @returns {Incident} new incident object
 */
export function recordFailedAttempt(incident, errorMessage, _clock) {
  if (incident.status === SyncStatus.SYNCED) {
    throw new AppError(
      `Cannot record failed attempt on SYNCED incident ${incident.id}`,
      'ILLEGAL_TRANSITION',
    );
  }

  const attempts = incident.syncAttempts + 1;
  const nextStatus = attempts >= MAX_SYNC_ATTEMPTS
    ? SyncStatus.FAILED
    : SyncStatus.PENDING_SYNC;

  return {
    ...incident,
    status:       nextStatus,
    syncAttempts: attempts,
    lastError:    errorMessage,
  };
}

/**
 * Reset a FAILED incident back to PENDING_SYNC for manual retry.
 *
 * @param {Incident} incident
 * @returns {Incident} new incident object
 */
export function resetForRetry(incident) {
  if (incident.status !== SyncStatus.FAILED) {
    throw new AppError(
      `Cannot reset incident ${incident.id} — status is ${incident.status}, expected FAILED`,
      'ILLEGAL_TRANSITION',
    );
  }
  return {
    ...incident,
    status:       SyncStatus.PENDING_SYNC,
    syncAttempts: 0,
    lastError:    null,
    syncedAt:     null,
  };
}

export default { createIncident, markSynced, recordFailedAttempt, resetForRetry, MAX_SYNC_ATTEMPTS };
