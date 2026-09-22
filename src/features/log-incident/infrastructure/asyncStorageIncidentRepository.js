/**
 * Log Patrol Incident – AsyncStorage Incident Repository
 *
 * Persists incidents via the core KeyValueStore abstraction.
 * Implements the IncidentRepository port.
 */

const KEY = '@ranger/feature/incidents';

/**
 * @param {import('../../../core/services/storage/KeyValueStore').KeyValueStore} kvStore
 * @returns {import('../ports/incidentRepository').IncidentRepository}
 */
export function AsyncStorageIncidentRepository(kvStore) {
  async function _loadAll() {
    return (await kvStore.get(KEY)) ?? [];
  }

  async function _saveAll(incidents) {
    await kvStore.set(KEY, incidents);
  }

  return {
    async save(incident) {
      const all = await _loadAll();
      await _saveAll([...all, incident]);
    },

    async findById(id) {
      const all = await _loadAll();
      return all.find((i) => i.id === id) ?? null;
    },

    async findByStatus(status) {
      const all = await _loadAll();
      return all.filter((i) => i.status === status);
    },

    async findAll() {
      return _loadAll();
    },

    async update(incident) {
      const all = await _loadAll();
      const next = all.map((i) => (i.id === incident.id ? incident : i));
      await _saveAll(next);
    },
  };
}

export default AsyncStorageIncidentRepository;
