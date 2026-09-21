/**
 * Tests for locationService.js
 * expo-location is mocked so no real device is needed.
 * Naming: <method>_<condition>_<expectedResult>
 */

import {
  requestLocationPermission,
  getCurrentLocation,
  buildManualLocation,
} from '../locationService';

// ── Mock expo-location ────────────────────────────────────────────────────────

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

const ExpoLocation = require('expo-location');

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── requestLocationPermission ─────────────────────────────────────────────

  describe('requestLocationPermission', () => {
    test('requestLocationPermission_granted_returnsTrue', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });

      // Act
      const result = await requestLocationPermission();

      // Assert
      expect(result).toBe(true);
    });

    test('requestLocationPermission_denied_returnsFalse', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      // Act
      const result = await requestLocationPermission();

      // Assert
      expect(result).toBe(false);
    });
  });

  // ── getCurrentLocation ────────────────────────────────────────────────────

  describe('getCurrentLocation', () => {
    test('getCurrentLocation_permissionDenied_returnsNull', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

      // Act
      const result = await getCurrentLocation();

      // Assert
      expect(result).toBeNull();
    });

    test('getCurrentLocation_permissionGranted_returnsLocationObject', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      ExpoLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 6.3728, longitude: 81.5198, accuracy: 5 },
      });

      // Act
      const result = await getCurrentLocation();

      // Assert
      expect(result).not.toBeNull();
      expect(result.latitude).toBe(6.3728);
      expect(result.longitude).toBe(81.5198);
      expect(result.accuracy).toBe(5);
      expect(result.source).toBe('GPS');
    });

    test('getCurrentLocation_gpsThrows_returnsNull', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      ExpoLocation.getCurrentPositionAsync.mockRejectedValue(new Error('GPS unavailable'));

      // Act
      const result = await getCurrentLocation();

      // Assert
      expect(result).toBeNull();
    });

    test('getCurrentLocation_validResult_hasCapturedAtIsoString', async () => {
      // Arrange
      ExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      ExpoLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 6.3728, longitude: 81.5198, accuracy: 10 },
      });

      // Act
      const result = await getCurrentLocation();

      // Assert
      expect(result.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  // ── buildManualLocation ───────────────────────────────────────────────────

  describe('buildManualLocation', () => {
    test('buildManualLocation_validCoords_returnsManualSourceObject', () => {
      // Act
      const result = buildManualLocation(6.4052, 80.4881);

      // Assert
      expect(result.latitude).toBe(6.4052);
      expect(result.longitude).toBe(80.4881);
      expect(result.source).toBe('MANUAL');
      expect(result.accuracy).toBeNull();
    });

    test('buildManualLocation_anyCoords_hasCapturedAt', () => {
      // Act
      const result = buildManualLocation(0, 0);

      // Assert
      expect(result.capturedAt).toBeDefined();
      expect(() => new Date(result.capturedAt)).not.toThrow();
    });
  });
});
