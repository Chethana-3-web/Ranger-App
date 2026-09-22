/**
 * Log Patrol Incident – Incident Validator
 *
 * Validates the raw fields before creating an Incident.
 * Throws ValidationError with a field-level message map on failure.
 *
 * Rules (E3):
 *   type        – required; must be in park's enabledIncidentTypes
 *   description – trimmed, 1–500 chars
 *   location    – required; must pass isValidLocation
 *   photo       – optional (null is fine)
 */

import { ValidationError } from '../../../core/domain/errors';
import { isValidLocation } from '../../../core/domain/location';
import { isValidIncidentType } from '../domain/incidentType';

const MAX_DESCRIPTION_LENGTH = 500;

/**
 * Validate incident fields for a given park.
 * Returns silently if valid; throws ValidationError if not.
 *
 * @param {{
 *   type: string|null,
 *   description: string,
 *   location: import('../../../core/domain/location').RangerLocation|null,
 *   photoUri?: string|null
 * }} fields
 * @param {{ enabledIncidentTypes: string[] }} park
 * @throws {ValidationError}
 */
export function validate(fields, park) {
  const errors = {};

  // ── type ──────────────────────────────────────────────────────────────────
  if (!fields.type) {
    errors.type = 'Incident type is required.';
  } else if (!isValidIncidentType(fields.type)) {
    errors.type = `"${fields.type}" is not a recognised incident type.`;
  } else if (!park || !Array.isArray(park.enabledIncidentTypes) || !park.enabledIncidentTypes.includes(fields.type)) {
    errors.type = `Incident type "${fields.type}" is not enabled for this park.`;
  }

  // ── description ───────────────────────────────────────────────────────────
  const trimmed = typeof fields.description === 'string' ? fields.description.trim() : '';
  if (trimmed.length === 0) {
    errors.description = 'Description is required.';
  } else if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer (currently ${trimmed.length}).`;
  }

  // ── location ──────────────────────────────────────────────────────────────
  if (!fields.location) {
    errors.location = 'Location is required.';
  } else if (!isValidLocation(fields.location.latitude, fields.location.longitude)) {
    errors.location = 'Location coordinates are invalid.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Incident validation failed.', errors);
  }
}

export default { validate, MAX_DESCRIPTION_LENGTH };
