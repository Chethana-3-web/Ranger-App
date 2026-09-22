/**
 * Log Patrol Incident – GPS Location Provider (real)
 *
 * Uses expo-location to obtain the device's current position.
 * Consults simulatorStore.gpsAvailable so every flow can be
 * demonstrated without a real device.
 *
 * Implements the LocationProvider port.
 */

import * as Location from 'expo-location';
import { createLocation } from '../../../core/domain/location';
import simulatorStore from '../../../core/simulator/simulatorStore';

const GPS_TIMEOUT_MS = 15_000;

/**
 * @returns {import('../ports/locationProvider').LocationProvider}
 */
export function GpsLocationProvider() {
  return {
    /**
     * Request permission and get the current GPS position.
     * Returns null if permission denied, timeout, or simulator flag is false.
     *
     * @returns {Promise<import('../../../core/domain/location').RangerLocation|null>}
     */
    async getCurrentLocation() {
      // Simulator: pretend GPS is unavailable
      if (!simulatorStore.get('gpsAvailable')) {
        return null;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return null;
        }

        const result = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          }),
          new Promise((_resolve, reject) =>
            setTimeout(() => reject(new Error('GPS timeout')), GPS_TIMEOUT_MS),
          ),
        ]);

        return createLocation(
          result.coords.latitude,
          result.coords.longitude,
          'GPS',
          new Date(result.timestamp).toISOString(),
          result.coords.accuracy ?? null,
        );
      } catch {
        return null;
      }
    },
  };
}

export default GpsLocationProvider;
