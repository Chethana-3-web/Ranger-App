/**
 * Tests for core/domain/location.js
 *
 * Validates location creation and boundary checking.
 */

import { createLocation, isValidLocation } from '../location';

describe('location', () => {
  describe('isValidLocation', () => {
    test('isValidLocation_validCoordinates_returnsTrue', () => {
      // Arrange
      const latitude = 6.3728;
      const longitude = 81.5198;

      // Act
      const result = isValidLocation(latitude, longitude);

      // Assert
      expect(result).toBe(true);
    });

    test('isValidLocation_latitudeAtMinBoundary_returnsTrue', () => {
      expect(isValidLocation(-90, 0)).toBe(true);
    });

    test('isValidLocation_latitudeAtMaxBoundary_returnsTrue', () => {
      expect(isValidLocation(90, 0)).toBe(true);
    });

    test('isValidLocation_longitudeAtMinBoundary_returnsTrue', () => {
      expect(isValidLocation(0, -180)).toBe(true);
    });

    test('isValidLocation_longitudeAtMaxBoundary_returnsTrue', () => {
      expect(isValidLocation(0, 180)).toBe(true);
    });

    test('isValidLocation_latitudeOutOfRange_returnsFalse', () => {
      expect(isValidLocation(91, 0)).toBe(false);
      expect(isValidLocation(-91, 0)).toBe(false);
    });

    test('isValidLocation_longitudeOutOfRange_returnsFalse', () => {
      expect(isValidLocation(0, 181)).toBe(false);
      expect(isValidLocation(0, -181)).toBe(false);
    });
  });

  describe('createLocation', () => {
    test('createLocation_validInput_returnsLocation', () => {
      // Arrange
      const latitude = 6.3728;
      const longitude = 81.5198;
      const source = 'GPS';
      const capturedAt = '2026-09-21T12:00:00Z';
      const accuracy = 5.5;

      // Act
      const location = createLocation(latitude, longitude, source, capturedAt, accuracy);

      // Assert
      expect(location).not.toBeNull();
      expect(location.latitude).toBe(latitude);
      expect(location.longitude).toBe(longitude);
      expect(location.source).toBe(source);
      expect(location.capturedAt).toBe(capturedAt);
      expect(location.accuracyMeters).toBe(accuracy);
    });

    test('createLocation_manualWithoutAccuracy_returnsLocation', () => {
      const location = createLocation(6.0, 80.0, 'MANUAL', '2026-09-21T12:00:00Z', null);
      expect(location).not.toBeNull();
      expect(location.source).toBe('MANUAL');
      expect(location.accuracyMeters).toBeNull();
    });

    test('createLocation_invalidLatitude_returnsNull', () => {
      expect(createLocation(91, 80.0, 'GPS', '2026-09-21T12:00:00Z')).toBeNull();
    });

    test('createLocation_invalidLongitude_returnsNull', () => {
      expect(createLocation(6.0, 181, 'GPS', '2026-09-21T12:00:00Z')).toBeNull();
    });
  });
});
