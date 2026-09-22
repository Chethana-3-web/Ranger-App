/**
 * Log Patrol Incident – Expo Photo Store (real)
 *
 * Copies a photo from the camera's temporary cache into the app's
 * document directory so it survives cache clearing.
 *
 * Implements the PhotoStore port.
 */

import * as FileSystem from 'expo-file-system';

/**
 * @returns {import('../ports/photoStore').PhotoStore}
 */
export function ExpoPhotoStore() {
  return {
    /**
     * Copy the photo at tempUri into the app documents directory.
     *
     * @param {string} tempUri – temporary camera URI
     * @returns {Promise<string>} permanent URI
     */
    async persist(tempUri) {
      const filename = `incident_${Date.now()}.jpg`;
      const destUri = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({ from: tempUri, to: destUri });

      return destUri;
    },
  };
}

export default ExpoPhotoStore;
