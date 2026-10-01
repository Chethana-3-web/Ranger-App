/**
 * Image Review Service
 *
 * Application service for reviewing camera trap images.
 */

import { markAsClassified, markAsUnclear } from '../domain/cameraTrapImage';
import { createWildlifeClassification } from '../domain/wildlifeClassification';
import { ReviewStatus } from '../domain/reviewStatus';

/**
 * Create image review service.
 *
 * @param {Object} deps
 * @param {import('../ports/ImageRepository').ImageRepository} deps.imageRepo
 * @param {import('../ports/CameraTrapGateway').CameraTrapGateway} deps.gateway
 */
export function createImageReviewService({ imageRepo, gateway }) {
  return {
    /**
     * Get images for a camera trap.
     */
    async getImagesByCameraTrapId(cameraTrapId) {
      let remoteImages;
      try {
        // Load from gateway (mock data for now)
        remoteImages = await gateway.getCameraTrapImages(cameraTrapId);
      } catch (err) {
        console.error('Failed to load images from gateway:', err);
        return await imageRepo.getByCameraTrapId(cameraTrapId);
      }

      // Local copies win, so reviews saved on this device are not overwritten
      const images = [];
      for (const img of remoteImages) {
        const local = await imageRepo.getById(img.id);
        if (local) {
          images.push(local);
        } else {
          await imageRepo.save(img);
          images.push(img);
        }
      }

      return images;
    },

    /**
     * Get image by ID.
     */
    async getImageById(imageId) {
      return await imageRepo.getById(imageId);
    },

    /**
     * Save wildlife classification.
     */
    async saveClassification(imageId, classificationData, reviewedBy) {
      const image = await imageRepo.getById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Create classification domain object
      const classification = createWildlifeClassification({
        ...classificationData,
        reviewedBy,
      });

      // Mark image as classified
      const updatedImage = markAsClassified(image, classification);

      // Save locally
      await imageRepo.save(updatedImage);

      // Sync to server (async, non-blocking)
      try {
        await gateway.saveClassification(imageId, classification);
      } catch (err) {
        console.error('Failed to sync classification:', err);
        // Keep local version, will retry later
      }

      return updatedImage;
    },

    /**
     * Mark image as unclear.
     */
    async markImageAsUnclear(imageId) {
      const image = await imageRepo.getById(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      const updatedImage = markAsUnclear(image);
      await imageRepo.save(updatedImage);

      try {
        await gateway.markUnclear(imageId);
      } catch (err) {
        console.error('Failed to sync unclear status:', err);
      }

      return updatedImage;
    },

    /**
     * Get pending images count for a camera trap.
     */
    async getPendingImagesCount(cameraTrapId) {
      const images = await imageRepo.getByCameraTrapId(cameraTrapId);
      return images.filter((img) => img.reviewStatus === ReviewStatus.PENDING).length;
    },
  };
}
