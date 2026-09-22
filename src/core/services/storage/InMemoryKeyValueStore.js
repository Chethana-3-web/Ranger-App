/**
 * Ranger App – In-Memory KeyValueStore
 *
 * Test double: ephemeral, no disk I/O.
 */

/**
 * Create an in-memory key-value store for testing.
 *
 * @returns {import('./KeyValueStore').KeyValueStore}
 */
export function InMemoryKeyValueStore() {
  const data = new Map();

  return {
    async get(key) {
      return data.get(key) ?? null;
    },

    async set(key, value) {
      data.set(key, value);
      return true;
    },

    async remove(key) {
      data.delete(key);
      return true;
    },

    async clear() {
      data.clear();
    },
  };
}

export default InMemoryKeyValueStore;
