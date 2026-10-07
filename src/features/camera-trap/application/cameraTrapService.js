/**
 * Camera Trap Service
 *
 * Application service for camera trap operations.
 */

/**
 * Create camera trap service.
 *
 * @param {Object} deps
 * @param {import('../ports/CameraTrapRepository').CameraTrapRepository} deps.cameraTrapRepo
 * @param {import('../ports/CameraTrapGateway').CameraTrapGateway} deps.gateway
 */
export function createCameraTrapService({ cameraTrapRepo, gateway }) {
  return {
    /**
     * Get all camera traps.
     */
    async getAllCameraTraps() {
      // Load from gateway (mock data for now)
      const cameraTraps = await gateway.getCameraTraps();
      
      // Save to local storage
      for (const ct of cameraTraps) {
        await cameraTrapRepo.save(ct);
      }
      
      return cameraTraps;
    },

    /**
     * Get camera trap by ID.
     */
    async getCameraTrapById(id) {
      return await cameraTrapRepo.getById(id);
    },
  };
}
