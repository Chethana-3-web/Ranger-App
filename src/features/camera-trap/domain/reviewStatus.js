/**
 * Camera Trap – Review Status
 *
 * Frozen enum for image review states.
 */

export const ReviewStatus = Object.freeze({
  PENDING: 'pending',
  CLASSIFIED: 'classified',
  UNCLEAR: 'unclear',
  FLAGGED: 'flagged',
});

/**
 * Check if a string is a valid review status.
 * @param {string} status
 * @returns {boolean}
 */
export function isValidReviewStatus(status) {
  return Object.values(ReviewStatus).includes(status);
}
