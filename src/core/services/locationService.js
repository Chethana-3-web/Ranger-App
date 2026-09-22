/**
 * Ranger App – Location Service
 *
 * Abstracts expo-location so screens never call the Expo API directly.
 * Returns plain objects – no Expo types leak out.
 *
 * Offline / GPS-unavailable strategy:
 *   If location cannot be obtained the caller receives null and should
 *   prompt the ranger to mark the location manually on the map.
 */

import * as ExpoLocation from 'expo-location';

/**
 * @typedef {Object} RangerLocation
 * @property {number} latitude
 * @property {number} longitude
 * @property {number|null} accuracy  – metres, or null if unknown
 * @property {string} capturedAt     – ISO timestamp
 * @property {'GPS'|'MANUAL'} source
 */

/**
 * Request foreground location permission.
 *
 * @returns {Promise<boolean>} true if granted
 */
export async function requestLocationPermission() {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the device's current GPS location.
 *
 * @returns {Promise<RangerLocation|null>} null if permission denied or GPS unavailable
 */
export async function getCurrentLocation() {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return null;

    const result = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });

    return {
      latitude:  result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy:  result.coords.accuracy ?? null,
      capturedAt: new Date().toISOString(),
      source: 'GPS',
    };
  } catch {
    return null;
  }
}

/**
 * Build a MANUAL location from ranger-entered coordinates.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {RangerLocation}
 */
export function buildManualLocation(latitude, longitude) {
  return {
    latitude,
    longitude,
    accuracy: null,
    capturedAt: new Date().toISOString(),
    source: 'MANUAL',
  };
}
