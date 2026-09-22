/**
 * Tests for incidentValidator.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import { validate } from '../incidentValidator';
import { ValidationError } from '../../../../core/domain/errors';

const YALA_PARK = {
  id: 'PARK-YALA',
  enabledIncidentTypes: ['SNARE', 'CARCASS', 'TRACKS', 'CAMPSITE', 'OTHER'],
};

const SINHARAJA_PARK = {
  id: 'PARK-SINHARAJA',
  enabledIncidentTypes: ['SNARE', 'CAMPSITE', 'OTHER'],
};

const VALID_LOCATION = {
  latitude: 6.37,
  longitude: 81.52,
  source: 'GPS',
  accuracyMeters: 5,
  capturedAt: '2026-09-22T09:00:00.000Z',
};

const VALID_FIELDS = {
  type: 'SNARE',
  description: 'Found a wire snare near the waterhole.',
  location: VALID_LOCATION,
  photoUri: null,
};

describe('validate', () => {
  // ── positive cases ─────────────────────────────────────────────────────────

  test('validate_withAllValidFields_doesNotThrow', () => {
    expect(() => validate(VALID_FIELDS, YALA_PARK)).not.toThrow();
  });

  test('validate_withNullPhoto_doesNotThrow', () => {
    expect(() => validate({ ...VALID_FIELDS, photoUri: null }, YALA_PARK)).not.toThrow();
  });

  test('validate_withMaxLengthDescription_doesNotThrow', () => {
    const desc = 'A'.repeat(500);
    expect(() => validate({ ...VALID_FIELDS, description: desc }, YALA_PARK)).not.toThrow();
  });

  test('validate_withManualLocation_doesNotThrow', () => {
    const manualLoc = { ...VALID_LOCATION, source: 'MANUAL', accuracyMeters: null };
    expect(() => validate({ ...VALID_FIELDS, location: manualLoc }, YALA_PARK)).not.toThrow();
  });

  // ── type validation ────────────────────────────────────────────────────────

  test('validate_withNullType_throwsValidationErrorWithTypeField', () => {
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, type: null }, YALA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('type');
    }
  });

  test('validate_withUnknownType_throwsValidationErrorWithTypeField', () => {
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, type: 'ALIEN' }, YALA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('type');
    }
  });

  test('validate_withTypeNotEnabledForPark_throwsValidationError', () => {
    // CARCASS not in Sinharaja
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, type: 'CARCASS' }, SINHARAJA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('type');
    }
  });

  // ── description validation ─────────────────────────────────────────────────

  test('validate_withEmptyDescription_throwsValidationError', () => {
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, description: '' }, YALA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('description');
    }
  });

  test('validate_withWhitespaceOnlyDescription_throwsValidationError', () => {
    expect.assertions(1);
    try {
      validate({ ...VALID_FIELDS, description: '   ' }, YALA_PARK);
    } catch (e) {
      expect(e.fieldErrors).toHaveProperty('description');
    }
  });

  test('validate_withDescriptionOver500Chars_throwsValidationError', () => {
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, description: 'B'.repeat(501) }, YALA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('description');
    }
  });

  // ── location validation ────────────────────────────────────────────────────

  test('validate_withNullLocation_throwsValidationError', () => {
    expect.assertions(2);
    try {
      validate({ ...VALID_FIELDS, location: null }, YALA_PARK);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.fieldErrors).toHaveProperty('location');
    }
  });

  test('validate_withInvalidCoordinates_throwsValidationError', () => {
    expect.assertions(1);
    try {
      validate({ ...VALID_FIELDS, location: { ...VALID_LOCATION, latitude: 999 } }, YALA_PARK);
    } catch (e) {
      expect(e.fieldErrors).toHaveProperty('location');
    }
  });

  // ── multiple errors ────────────────────────────────────────────────────────

  test('validate_withMultipleInvalidFields_includesAllErrors', () => {
    expect.assertions(3);
    try {
      validate({ type: null, description: '', location: null }, YALA_PARK);
    } catch (e) {
      expect(e.fieldErrors).toHaveProperty('type');
      expect(e.fieldErrors).toHaveProperty('description');
      expect(e.fieldErrors).toHaveProperty('location');
    }
  });
});
