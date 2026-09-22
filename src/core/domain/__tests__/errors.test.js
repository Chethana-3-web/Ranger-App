/**
 * Tests for core/domain/errors.js
 *
 * Validates error types and field mapping.
 */

import { AppError, ValidationError, StorageError, NetworkError } from '../errors';

describe('errors', () => {
  describe('AppError', () => {
    test('AppError_creation_hasMessageAndCode', () => {
      // Arrange & Act
      const err = new AppError('Something went wrong', 'GENERIC_ERROR');

      // Assert
      expect(err.message).toBe('Something went wrong');
      expect(err.code).toBe('GENERIC_ERROR');
      expect(err.name).toBe('AppError');
    });

    test('AppError_isErrorInstance', () => {
      const err = new AppError('test');
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    test('ValidationError_withFieldErrors_mapsCorrectly', () => {
      // Arrange
      const fieldErrors = {
        description: 'Required field',
        latitude: 'Out of range',
      };

      // Act
      const err = new ValidationError('Validation failed', fieldErrors);

      // Assert
      expect(err.name).toBe('ValidationError');
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.fieldErrors).toEqual(fieldErrors);
      expect(err.fieldErrors.description).toBe('Required field');
    });

    test('ValidationError_emptyFieldErrors_defaultsToEmpty', () => {
      const err = new ValidationError('Validation failed');
      expect(err.fieldErrors).toEqual({});
    });
  });

  describe('StorageError', () => {
    test('StorageError_withCause_capturesOriginal', () => {
      // Arrange
      const cause = new Error('Disk full');

      // Act
      const err = new StorageError('Failed to save', cause);

      // Assert
      expect(err.name).toBe('StorageError');
      expect(err.code).toBe('STORAGE_ERROR');
      expect(err.cause).toBe(cause);
    });
  });

  describe('NetworkError', () => {
    test('NetworkError_withCause_capturesOriginal', () => {
      // Arrange
      const cause = new Error('Connection timeout');

      // Act
      const err = new NetworkError('API call failed', cause);

      // Assert
      expect(err.name).toBe('NetworkError');
      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.cause).toBe(cause);
    });
  });
});
