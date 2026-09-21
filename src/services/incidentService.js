/**
 * Ranger App – Incident Service
 *
 * Business logic for creating, loading, and updating patrol incident records.
 * All data is persisted locally via storageService and synced via syncService.
 *
 * An IncidentRecord is the canonical domain object:
 *   { id, patrolId, rangerId, parkId, type, description, location,
 *     photoUri, loggedAt, syncStatus, retryCount }
 */

import { appendIncident, loadIncidents, updateIncident } from './storageService';
import * as Crypto from 'expo-crypto';

/**
 * @typedef {Object} IncidentLocation
 * @property {number} latitude
 * @property {number} longitude
 * @property {number|null} accuracy
 * @property {string} capturedAt
 * @property {'GPS'|'MANUAL'} source
 */

/**
 * @typedef {Object} IncidentRecord
 * @property {string}   id
 * @property {string}   patrolId
 * @property {string}   rangerId
 * @property {string}   parkId
 * @property {string}   type          – one of SNARE|CARCASS|CAMP|FOOTPRINT|OTHER
 * @property {string}   description
 * @property {IncidentLocation} location
 * @property {string|null} photoUri   – local file URI or null
 * @property {string}   loggedAt      – ISO timestamp
 * @property {'PENDING'|'SYNCED'|'FAILED'} syncStatus
 * @property {number}   retryCount
 */

/**
 * Create and persist a new incident record.
 *
 * @param {{
 *   patrolId: string,
 *   rangerId: string,
 *   parkId: string,
 *   type: string,
 *   description: string,
 *   location: IncidentLocation,
 *   photoUri?: string|null
 * }} params
 * @returns {Promise<IncidentRecord>}
 */
export async function logIncident({ patrolId, rangerId, parkId, type, description, location, photoUri = null }) {
  const id = await Crypto.randomUUID();

  /** @type {IncidentRecord} */
  const incident = {
    id,
    patrolId,
    rangerId,
    parkId,
    type,
    description,
    location,
    photoUri,
    loggedAt:   new Date().toISOString(),
    syncStatus: 'PENDING',
    retryCount: 0,
  };

  await appendIncident(incident);
  return incident;
}

/**
 * Load all incidents from local storage.
 *
 * @returns {Promise<IncidentRecord[]>}
 */
export async function getAllIncidents() {
  return loadIncidents();
}

/**
 * Load incidents for a specific patrol.
 *
 * @param {string} patrolId
 * @returns {Promise<IncidentRecord[]>}
 */
export async function getIncidentsByPatrol(patrolId) {
  const all = await loadIncidents();
  return all.filter((inc) => inc.patrolId === patrolId);
}

/**
 * Mark an incident as synced.
 *
 * @param {string} incidentId
 * @returns {Promise<void>}
 */
export async function markSynced(incidentId) {
  const all = await loadIncidents();
  const inc = all.find((i) => i.id === incidentId);
  if (!inc) return;
  await updateIncident({ ...inc, syncStatus: 'SYNCED' });
}

/**
 * Mark an incident as failed and increment retry count.
 *
 * @param {string} incidentId
 * @returns {Promise<void>}
 */
export async function markFailed(incidentId) {
  const all = await loadIncidents();
  const inc = all.find((i) => i.id === incidentId);
  if (!inc) return;
  await updateIncident({
    ...inc,
    syncStatus:  'FAILED',
    retryCount:  inc.retryCount + 1,
  });
}

/**
 * Get all incidents that need to be uploaded (PENDING or FAILED with retries left).
 *
 * @param {number} maxRetries
 * @returns {Promise<IncidentRecord[]>}
 */
export async function getPendingIncidents(maxRetries = 3) {
  const all = await loadIncidents();
  return all.filter(
    (inc) =>
      inc.syncStatus === 'PENDING' ||
      (inc.syncStatus === 'FAILED' && inc.retryCount < maxRetries)
  );
}
