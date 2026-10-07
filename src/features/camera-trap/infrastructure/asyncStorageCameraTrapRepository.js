/**
 * AsyncStorage Camera Trap Repository
 *
 * Implements CameraTrapRepository using KeyValueStore.
 */

const STORAGE_KEY = '@camera_traps';

/**
 * @param {import('../../core/services/storage/KeyValueStore').KeyValueStore} kvStore
 * @returns {import('../ports/CameraTrapRepository').CameraTrapRepository}
 */
export function AsyncStorageCameraTrapRepository(kvStore) {
  async function loadAll() {
    const json = await kvStore.get(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  async function saveAll(cameraTraps) {
    await kvStore.set(STORAGE_KEY, JSON.stringify(cameraTraps));
  }

  return {
    async getAll() {
      return await loadAll();
    },

    async getById(id) {
      const cameraTraps = await loadAll();
      return cameraTraps.find((ct) => ct.id === id) || null;
    },

    async save(cameraTrap) {
      const cameraTraps = await loadAll();
      const index = cameraTraps.findIndex((ct) => ct.id === cameraTrap.id);
      if (index >= 0) {
        cameraTraps[index] = cameraTrap;
      } else {
        cameraTraps.push(cameraTrap);
      }
      await saveAll(cameraTraps);
    },
  };
}
