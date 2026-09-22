/**
 * Log Patrol Incident – AsyncStorage Draft Repository
 *
 * Persists the single in-progress draft via the core KeyValueStore.
 * Implements the DraftRepository port.
 */

const KEY = '@ranger/feature/draft';

/**
 * @param {import('../../../core/services/storage/KeyValueStore').KeyValueStore} kvStore
 * @returns {import('../ports/draftRepository').DraftRepository}
 */
export function AsyncStorageDraftRepository(kvStore) {
  return {
    async save(draft) {
      await kvStore.set(KEY, draft);
    },

    async find() {
      return kvStore.get(KEY);
    },

    async delete() {
      await kvStore.remove(KEY);
    },
  };
}

export default AsyncStorageDraftRepository;
