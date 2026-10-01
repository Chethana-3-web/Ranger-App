/**
 * Suspicious Activity Service
 *
 * Application service for flagging suspicious activity.
 */

import { markAsFlagged } from '../domain/cameraTrapImage';
import { createSuspiciousActivity } from '../domain/suspiciousActivity';
import { DefaultIdGenerator } from '../../core/services/idGenerator';

/**
 * Create suspicious activity service.
 *
 * @param {Object} deps
 * @param {import('../ports/ImageRepository').ImageRepository} deps.imageRepo
 * @param {import('../ports/CameraTrapGateway').CameraTrapGateway} deps.gateway
 */
export function createSuspiciousActivityService({ imageRepo, gateway }) {
  return {
    /**
     * Save suspicious activity flag.
     */
    async saveSuspiciousFlag(imageId, activityData, reviewedBy) {
      const image = await imageRepo.getById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Create suspicious activity domain object
      const suspiciousActivity = createSuspiciousActivity({
        id: DefaultIdGenerator.generate(),
        imageId,
        ...activityData,
        reviewedBy,
      });

      // Mark image as flagged
      const updatedImage = markAsFlagged(image, suspiciousActivity);

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
