/**
 * Camera Trap – Permissions
 *
 * Single place for the camera trap role rule.
 */

export const CAMERA_TRAP_REVIEWER_ROLE = 'park_manager';

/**
 * Check if a user may use Camera Trap Review.
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canReviewCameraTraps(user) {
  return user?.role === CAMERA_TRAP_REVIEWER_ROLE;
}
