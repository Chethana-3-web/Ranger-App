/**
 * Camera Trap Image – Domain Model
 *
 * Represents an image captured by a camera trap.
 */

import { ReviewStatus } from './reviewStatus';

/**
 * @typedef {Object} CameraTrapImage
 * @property {string} id
 * @property {string} cameraTrapId
 * @property {string} imageUri
 * @property {string} timestamp
 * @property {Object} location
 * @property {number} location.lat
 * @property {number} location.lng
 * @property {string} reviewStatus
 * @property {Object|null} classification
 * @property {Object|null} suspiciousActivity
 * @property {string} syncStatus
 * @property {string} createdAt
 * @property {string|null} reviewedAt
 */

/**
 * Create a camera trap image.
 *
 * @param {Object} params
 * @returns {CameraTrapImage}
 */
export function createCameraTrapImage({
  id,
  cameraTrapId,
  imageUri,
  timestamp,
  location,
  reviewStatus = ReviewStatus.PENDING,
  classification = null,
  suspiciousActivity = null,
  syncStatus = 'pending',
  createdAt = new Date().toISOString(),
  reviewedAt = null,
}) {
  if (!id) throw new Error('Image id is required');
  if (!cameraTrapId) throw new Error('cameraTrapId is required');
  if (!imageUri) throw new Error('imageUri is required');

  return Object.freeze({
    id,
    cameraTrapId,
    imageUri,
    timestamp: timestamp || createdAt,
    location: location ? Object.freeze(location) : null,
    reviewStatus,
    classification,
    suspiciousActivity,
    syncStatus,
    createdAt,
    reviewedAt,
  });
}

/**
 * Mark image as classified.
 * A flagged image stays flagged, so classifying wildlife never clears a flag.
 */
export function markAsClassified(image, classification) {
  return createCameraTrapImage({
    ...image,
    reviewStatus: image.reviewStatus === ReviewStatus.FLAGGED
      ? ReviewStatus.FLAGGED
      : ReviewStatus.CLASSIFIED,
    classification,
    reviewedAt: new Date().toISOString(),
  });
}

/**
 * Mark image as unclear.
 */
export function markAsUnclear(image) {
  return createCameraTrapImage({
    ...image,
    reviewStatus: ReviewStatus.UNCLEAR,
    reviewedAt: new Date().toISOString(),
  });
}

/**
 * Record a human activity review that did not end in a flag.
 * "unclear" moves the image to UNCLEAR; "not_suspicious" keeps its review status,
 * so no enforcement review is created.
 */
export function markHumanActivityReviewed(image, suspiciousActivity) {
  return createCameraTrapImage({
    ...image,
    reviewStatus: suspiciousActivity.decision === 'unclear'
      ? ReviewStatus.UNCLEAR
      : image.reviewStatus,
    suspiciousActivity,
    reviewedAt: new Date().toISOString(),
  });
}

/**
 * Mark image as flagged for suspicious activity.
 */
export function markAsFlagged(image, suspiciousActivity) {
  return createCameraTrapImage({
    ...image,
    reviewStatus: ReviewStatus.FLAGGED,
    suspiciousActivity,
    reviewedAt: new Date().toISOString(),
  });
}
