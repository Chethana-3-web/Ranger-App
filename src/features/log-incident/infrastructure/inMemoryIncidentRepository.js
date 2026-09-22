/**
 * Log Patrol Incident – In-Memory Incident Repository
 *
 * Test double: ephemeral, no disk I/O.
 * Implements the IncidentRepository port.
 */

/**
 * @returns {import('../ports/incidentRepository').IncidentRepository}
 */
export function InMemoryIncidentRepository() {
  const store = new Map();

  return {
    async save(incident) {
      store.set(incident.id, incident);
    },

    async findById(id) {
      return store.get(id) ?? null;
    },

    async findByStatus(status) {
      return [...store.values()].filter((i) => i.status === status);
    },

    async findAll() {
      return [...store.values()];
    },

    async update(incident) {
      if (!store.has(incident.id)) {
        throw new Error(`[InMemoryIncidentRepository] incident ${incident.id} not found`);
      }
      store.set(incident.id, incident);
    },
  };
}

export default InMemoryIncidentRepository;
