/**
 * Ranger App – Location Domain
 *
 * Value objects and validation for GPS coordinates and location capture.
 * All location data throughout the app uses this type.
 */

/**
 * @typedef {Object} RangerLocation
 * @property {number} latitude      – [-90, 90]
 * @property {number} longitude     – [-180, 180]
 * @property {'GPS' | 'MANUAL'} source
 * @property {number | null} accuracyMeters – null if unknown or MANUAL
 * @property {string} capturedAt    – ISO timestamp
 */

/**
 * Create a validated location object.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {'GPS' | 'MANUAL'} source
 * @param {string} capturedAt       – ISO timestamp
 * @param {number | null} accuracyMeters
 * @returns {RangerLocation | null} null if validation fails
 */
export function createLocation(latitude, longitude, source, capturedAt, accuracyMeters = null) {
  if (!isValidLocation(latitude, longitude)) {
    return null;
  }
  return {
    latitude,
    longitude,
    source,
    accuracyMeters,
    capturedAt,
  };
}

/**
 * Validate latitude and longitude ranges.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean} true if both are in valid ranges
 */
export function isValidLocation(latitude, longitude) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export default { createLocation, isValidLocation };
