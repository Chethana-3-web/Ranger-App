/**
 * Ranger App – AsyncStorage-backed KeyValueStore
 *
 * Persistent implementation using @react-native-async-storage/async-storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Create a persistent key-value store.
 *
 * @returns {import('./KeyValueStore').KeyValueStore}
 */
export function AsyncStorageKeyValueStore() {
  return {
    async get(key) {
      try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.error(`[AsyncStorageKeyValueStore] get(${key}) failed:`, err);
        return null;
      }
    },

    async set(key, value) {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error(`[AsyncStorageKeyValueStore] set(${key}) failed:`, err);
        return false;
      }
    },

    async remove(key) {
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (err) {
        console.error(`[AsyncStorageKeyValueStore] remove(${key}) failed:`, err);
        return false;
      }
    },

    async clear() {
      try {
        await AsyncStorage.clear();
      } catch (err) {
        console.error('[AsyncStorageKeyValueStore] clear failed:', err);
      }
    },
  };
}

export default AsyncStorageKeyValueStore;
