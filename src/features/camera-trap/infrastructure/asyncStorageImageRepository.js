/**
 * AsyncStorage Image Repository
 *
 * Implements ImageRepository using KeyValueStore (AsyncStorage wrapper).
 */

const STORAGE_KEY = '@camera_trap_images';

/**
 * @param {import('../../core/services/storage/KeyValueStore').KeyValueStore} kvStore
 * @returns {import('../ports/ImageRepository').ImageRepository}
 */
export function AsyncStorageImageRepository(kvStore) {
  async function loadAll() {
    const json = await kvStore.get(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  async function saveAll(images) {
    await kvStore.set(STORAGE_KEY, JSON.stringify(images));
  }

  return {
    async getByCameraTrapId(cameraTrapId) {
      const images = await loadAll();
      return images.filter((img) => img.cameraTrapId === cameraTrapId);
    },

    async getById(id) {
      const images = await loadAll();
      return images.find((img) => img.id === id) || null;
    },

    async save(image) {
      const images = await loadAll();
      const index = images.findIndex((img) => img.id === image.id);
      if (index >= 0) {
        images[index] = image;
      } else {
        images.push(image);
      }
      await saveAll(images);
    },

    async update(id, updates) {
      const images = await loadAll();
      const index = images.findIndex((img) => img.id === id);
      if (index >= 0) {
        images[index] = { ...images[index], ...updates };
        await saveAll(images);
      }
    },

    async findByReviewStatus(status) {
      const images = await loadAll();
      return images.filter((img) => img.reviewStatus === status);
    },
  };
}
