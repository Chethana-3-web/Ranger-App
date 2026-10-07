/**
 * Suspicious Activity Service
 *
 * Application service for flagging suspicious activity.
 */

import { markAsFlagged, markHumanActivityReviewed } from '../domain/cameraTrapImage';
import { createSuspiciousActivity } from '../domain/suspiciousActivity';
import { DefaultIdGenerator } from '../../../core/services/idGenerator';

/**
 * Create suspicious activity service.
 *
 * @param {Object} deps
 * @param {import('../ports/ImageRepository').ImageRepository} deps.imageRepo
 * @param {import('../ports/CameraTrapGateway').CameraTrapGateway} deps.gateway
 * @param {{ generate: () => Promise<string> }} [deps.idGenerator]
 */
export function createSuspiciousActivityService({ imageRepo, gateway, idGenerator = DefaultIdGenerator }) {
  return {
    /**
     * Save a human activity review.
     * Only a "suspicious" decision flags the image for enforcement review.
     */
    async saveSuspiciousFlag(imageId, activityData, reviewedBy) {
      const image = await imageRepo.getById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Create suspicious activity domain object
      const suspiciousActivity = createSuspiciousActivity({
        id: await idGenerator.generate(),
        imageId,
        ...activityData,
        reviewedBy,
      });

      const updatedImage = suspiciousActivity.isSuspicious
        ? markAsFlagged(image, suspiciousActivity)
        : markHumanActivityReviewed(image, suspiciousActivity);

      // Save locally
      await imageRepo.save(updatedImage);

      // Sync to server
      try {
        await gateway.saveSuspiciousFlag(imageId, suspiciousActivity);
      } catch (err) {
        console.error('Failed to sync suspicious flag:', err);
      }

      return updatedImage;
    },
  };
}
