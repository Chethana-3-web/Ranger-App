/**
 * Camera Trap – Service wiring
 *
 * Builds the camera trap services once, with their repositories and gateway.
 * Screens import the services from here.
 */

import { AsyncStorageKeyValueStore } from '../../../core/services/storage/AsyncStorageKeyValueStore';
import { AsyncStorageCameraTrapRepository } from '../infrastructure/asyncStorageCameraTrapRepository';
import { AsyncStorageImageRepository } from '../infrastructure/asyncStorageImageRepository';
import { MockCameraTrapGateway } from '../infrastructure/mockCameraTrapGateway';
import { createCameraTrapService } from '../application/cameraTrapService';
import { createImageReviewService } from '../application/imageReviewService';
import { createSuspiciousActivityService } from '../application/suspiciousActivityService';
import { ReviewStatus } from '../domain/reviewStatus';

const kvStore = AsyncStorageKeyValueStore();
const cameraTrapRepo = AsyncStorageCameraTrapRepository(kvStore);
const imageRepo = AsyncStorageImageRepository(kvStore);
const gateway = MockCameraTrapGateway();

export const cameraTrapService = createCameraTrapService({ cameraTrapRepo, gateway });
export const imageReviewService = createImageReviewService({ imageRepo, gateway });
export const suspiciousActivityService = createSuspiciousActivityService({ imageRepo, gateway });

/**
 * Load all camera traps with pending counts taken from their images,
 * so the counts follow the reviews saved on this device.
 * @returns {Promise<Array>}
 */
export async function loadCameraTrapsWithPendingCounts() {
  const cameraTraps = await cameraTrapService.getAllCameraTraps();
  const result = [];
  for (const cameraTrap of cameraTraps) {
    const images = await imageReviewService.getImagesByCameraTrapId(cameraTrap.id);
    result.push({
      ...cameraTrap,
      imageCount: images.length,
      pendingImageCount: images.filter((img) => img.reviewStatus === ReviewStatus.PENDING).length,
    });
  }
  return result;
}
