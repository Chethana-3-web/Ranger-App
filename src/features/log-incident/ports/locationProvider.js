/**
 * Log Patrol Incident – Location Provider Port
 *
 * Abstract contract for obtaining a RangerLocation.
 * Implementations: GpsLocationProvider (real), ManualLocationProvider (user-picked),
 * FakeLocationProvider (tests).
 *
 * @typedef {Object} LocationProvider
 * @property {() => Promise<import('../../../core/domain/location').RangerLocation|null>} getCurrentLocation
 *   Resolves with a RangerLocation or null if unavailable.
 */

export default {};
