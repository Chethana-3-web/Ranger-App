/**
 * Suspicious Activity – Domain Model
 */

/**
 * @typedef {Object} SuspiciousActivity
 * @property {string} id
 * @property {string} imageId
 * @property {boolean} isSuspicious
 * @property {string} decision - "suspicious" | "not_suspicious" | "unclear"
 * @property {string|null} reason
 * @property {string|null} notes
 * @property {string} reviewedBy
 * @property {string} createdAt
 * @property {string} status
 */

/**
 * Create suspicious activity record.
 */
export function createSuspiciousActivity({
  id,
  imageId,
  isSuspicious,
  decision,
  reason = null,
  notes = null,
  reviewedBy,
  createdAt = new Date().toISOString(),
  status = 'pending',
}) {
  if (!id) throw new Error('id is required');
  if (!imageId) throw new Error('imageId is required');
  if (!decision) throw new Error('decision is required');
  if (!reviewedBy) throw new Error('reviewedBy is required');

  if (decision === 'suspicious' && !reason) {
    throw new Error('reason is required when decision is suspicious');
  }

  return Object.freeze({
    id,
    imageId,
    isSuspicious: decision === 'suspicious',
    decision,
    reason,
    notes,
    reviewedBy,
    createdAt,
    status,
  });
}

/**
 * Suspicious activity reasons
 */
export const SUSPICIOUS_REASONS = Object.freeze([
  'Poaching Activity',
  'Illegal Logging',
  'Unauthorized Entry',
  'Suspicious Behavior',
  'Setting Traps/Snares',
  'Other',
]);
