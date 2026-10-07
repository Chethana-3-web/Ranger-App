/**
 * Camera Trap – Validation
 *
 * Field validation for camera trap forms.
 */

/**
 * Validate wildlife classification data.
 *
 * @param {Object} data
 * @param {string} data.species
 * @param {number} data.count
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateClassification(data) {
  const errors = {};

  if (!data.species || data.species.trim() === '') {
    errors.species = 'Species is required';
  }

  if (!data.count || data.count < 1) {
    errors.count = 'Count must be at least 1';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate suspicious activity data.
 *
 * @param {Object} data
 * @param {string} data.decision
 * @param {string} [data.reason]
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateSuspiciousActivity(data) {
  const errors = {};

  if (!data.decision) {
    errors.decision = 'Decision is required';
  }

  if (data.decision === 'suspicious' && !data.reason) {
    errors.reason = 'Reason is required when marking as suspicious';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
