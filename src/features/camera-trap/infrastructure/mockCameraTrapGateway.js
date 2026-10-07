/**
 * Mock Camera Trap Gateway
 *
 * Simulates remote API for development.
 * Replace with real API calls when backend is ready.
 */

import {
  getMockCameraTraps,
  getMockImagesByCameraTrap,
} from './mockCameraTrapData';

/**
 * @returns {import('../ports/CameraTrapGateway').CameraTrapGateway}
 */
export function MockCameraTrapGateway() {
  return {
    async getCameraTraps() {
      return await getMockCameraTraps();
    },

    async getCameraTrapImages(cameraTrapId) {
      return await getMockImagesByCameraTrap(cameraTrapId);
    },

    async saveClassification(imageId, classification) {
      // Simulate network call
      await new Promise((r) => setTimeout(r, 500));
      console.log('[MockGateway] Saved classification:', { imageId, classification });
    },

    async markUnclear(imageId) {
      await new Promise((r) => setTimeout(r, 300));
      console.log('[MockGateway] Marked unclear:', imageId);
    },

    async saveSuspiciousFlag(imageId, suspiciousActivity) {
      await new Promise((r) => setTimeout(r, 500));
      console.log('[MockGateway] Saved suspicious flag:', { imageId, suspiciousActivity });
    },
  };
}
