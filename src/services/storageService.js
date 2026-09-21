/**
 * Ranger App – Local Storage Service
 *
 * Thin wrapper around AsyncStorage for typed, namespaced key-value operations.
 * All incident data is persisted here while offline; a sync service picks it up
 * and uploads to the server once connectivity is restored.
 *
 * Key namespace:
 *   @ranger/incidents    – JSON array of IncidentRecord objects
 *   @ranger/patrol       – JSON object of the current patrol
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  INCIDENTS: '@ranger/incidents',
  PATROL:    '@ranger/patrol',
};

// ── Generic helpers ────────────────────────────────────────────────────────────

/**
 * Read a JSON value from AsyncStorage.
 *
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function readJson(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`[storageService] readJson(${key}) failed:`, err);
    return null;
  }
}

/**
 * Write a JSON value to AsyncStorage.
 *
 * @param {string} key
 * @param {any} value
 * @returns {Promise<boolean>} true on success
 */
async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storageService] writeJson(${key}) failed:`, err);
    return false;
  }
}

// ── Incidents ──────────────────────────────────────────────────────────────────

/**
 * Load all locally stored incidents.
 *
 * @returns {Promise<import('./incidentService').IncidentRecord[]>}
 */
export async function loadIncidents() {
  return (await readJson(KEYS.INCIDENTS)) ?? [];
}

/**
 * Persist the full incidents array (replace).
 *
 * @param {import('./incidentService').IncidentRecord[]} incidents
 * @returns {Promise<boolean>}
 */
export async function saveIncidents(incidents) {
  return writeJson(KEYS.INCIDENTS, incidents);
}

/**
 * Append a single incident to local storage.
 *
 * @param {import('./incidentService').IncidentRecord} incident
 * @returns {Promise<boolean>}
 */
export async function appendIncident(incident) {
  const existing = await loadIncidents();
  return saveIncidents([...existing, incident]);
}

/**
 * Update one incident (matched by id).
 *
 * @param {import('./incidentService').IncidentRecord} updated
 * @returns {Promise<boolean>}
 */
export async function updateIncident(updated) {
  const existing = await loadIncidents();
  const next = existing.map((inc) => (inc.id === updated.id ? updated : inc));
  return saveIncidents(next);
}

// ── Patrol ─────────────────────────────────────────────────────────────────────

/**
 * Load the stored patrol record.
 *
 * @returns {Promise<object|null>}
 */
export async function loadPatrol() {
  return readJson(KEYS.PATROL);
}

/**
 * Persist the patrol record.
 *
 * @param {object} patrol
 * @returns {Promise<boolean>}
 */
export async function savePatrol(patrol) {
  return writeJson(KEYS.PATROL, patrol);
}

export { KEYS };
