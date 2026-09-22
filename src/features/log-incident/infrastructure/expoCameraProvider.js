/**
 * Log Patrol Incident – Expo Camera Provider (real)
 *
 * Uses expo-image-picker to launch the camera.
 * Consults simulatorStore.cameraAvailable to simulate A2 (camera unavailable).
 *
 * Implements the CameraProvider port.
 */

import * as ImagePicker from 'expo-image-picker';
import simulatorStore from '../../../core/simulator/simulatorStore';

/**
 * @returns {import('../ports/cameraProvider').CameraProvider}
 */
export function ExpoCameraProvider() {
  return {
    /**
     * Launch the camera and return the captured photo URI.
     * Returns null if permission denied, cancelled, or simulator flag is false.
     *
     * @returns {Promise<{uri: string}|null>}
     */
    async takePhoto() {
      // Simulator: pretend camera is unavailable
      if (!simulatorStore.get('cameraAvailable')) {
        return null;
      }

      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return null;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: false,
        });

        if (result.canceled || !result.assets?.length) {
          return null;
        }

        return { uri: result.assets[0].uri };
      } catch {
        return null;
      }
    },
  };
}

export default ExpoCameraProvider;
