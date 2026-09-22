/**
 * Log Patrol Incident – Manual Location Provider
 *
 * Strategy: used when GPS is unavailable (A1).
 * The ranger drops a pin on a map; this provider wraps the chosen coordinates
 * into a RangerLocation with source = 'MANUAL'.
 *
 * Implements the LocationProvider port.
 */

import { createLocation } from '../../../core/domain/location';

/**
 * Create a ManualLocationProvider pre-loaded with user-chosen coordinates.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} capturedAt – ISO timestamp
 * @returns {import('../ports/locationProvider').LocationProvider}
 */
export function ManualLocationProvider(latitude, longitude, capturedAt) {
  return {
    async getCurrentLocation() {
      return createLocation(latitude, longitude, 'MANUAL', capturedAt, null);
    },
  };
}

export default ManualLocationProvider;
