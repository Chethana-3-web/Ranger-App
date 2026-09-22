/**
 * Ranger App – Storage Service
 *
 * Abstraction layer over the key-value store for incident and patrol data.
 * Uses dependency injection to support both persistent (AsyncStorage) and
 * test (InMemory) storage backends.
 */

const KEYS = {
  INCIDENTS: '@ranger/incidents',
  PATROL:    '@ranger/patrol',
};

let store = null;

/**
 * Initialize the storage service with a KeyValueStore instance.
 *
 * @param {import('./storage/KeyValueStore').KeyValueStore} keyValueStore
 */
export function initStorageService(keyValueStore) {
  store = keyValueStore;
}

/**
 * Load all locally stored incidents.
 *
 * @returns {Promise<any[]>}
 */
export async function loadIncidents() {
  if (!store) throw new Error('[storageService] not initialized');
  return (await store.get(KEYS.INCIDENTS)) ?? [];
}

/**
 * Persist the full incidents array (replace).
 *
 * @param {any[]} incidents
 * @returns {Promise<boolean>}
 */
export async function saveIncidents(incidents) {
  if (!store) throw new Error('[storageService] not initialized');
  return store.set(KEYS.INCIDENTS, incidents);
}

/**
 * Append a single incident to local storage.
 *
 * @param {any} incident
 * @returns {Promise<boolean>}
 */
export async function appendIncident(incident) {
  const existing = await loadIncidents();
  return saveIncidents([...existing, incident]);
}

/**
 * Update one incident (matched by id).
 *
 * @param {any} updated
 * @returns {Promise<boolean>}
 */
export async function updateIncident(updated) {
  const existing = await loadIncidents();
  const next = existing.map((inc) => (inc.id === updated.id ? updated : inc));
  return saveIncidents(next);
}

/**
 * Load the stored patrol record.
 *
 * @returns {Promise<any|null>}
 */
export async function loadPatrol() {
  if (!store) throw new Error('[storageService] not initialized');
  return store.get(KEYS.PATROL);
}

/**
 * Persist the patrol record.
 *
 * @param {any} patrol
 * @returns {Promise<boolean>}
 */
export async function savePatrol(patrol) {
  if (!store) throw new Error('[storageService] not initialized');
  return store.set(KEYS.PATROL, patrol);
}

/**
 * Clear all storage (for testing).
 *
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  if (!store) throw new Error('[storageService] not initialized');
  await store.clear();
}

export { KEYS };
