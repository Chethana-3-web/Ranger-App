/**
 * Tests for incidentType.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import {
  IncidentType,
  getAllIncidentTypes,
  getEnabledTypesForPark,
  isValidIncidentType,
} from '../incidentType';

describe('IncidentType', () => {
  test('IncidentType_enum_isFrozen', () => {
    expect(Object.isFrozen(IncidentType)).toBe(true);
  });

  test('IncidentType_enum_hasFiveKeys', () => {
    expect(Object.keys(IncidentType)).toHaveLength(5);
  });
});

describe('getAllIncidentTypes', () => {
  test('getAllIncidentTypes_called_returnsAllFiveEntries', () => {
    const types = getAllIncidentTypes();
    expect(types).toHaveLength(5);
  });

  test('getAllIncidentTypes_called_eachEntryHasKeyAndLabel', () => {
    const types = getAllIncidentTypes();
    types.forEach((t) => {
      expect(t).toHaveProperty('key');
      expect(t).toHaveProperty('label');
      expect(typeof t.key).toBe('string');
      expect(typeof t.label).toBe('string');
    });
  });
});

describe('getEnabledTypesForPark', () => {
  test('getEnabledTypesForPark_withSnareAndCampsite_returnsTwoEntries', () => {
    const park = { enabledIncidentTypes: ['SNARE', 'CAMPSITE'] };
    const result = getEnabledTypesForPark(park);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.key)).toEqual(['SNARE', 'CAMPSITE']);
  });

  test('getEnabledTypesForPark_withNullPark_returnsEmptyArray', () => {
    expect(getEnabledTypesForPark(null)).toEqual([]);
  });

  test('getEnabledTypesForPark_withUndefinedPark_returnsEmptyArray', () => {
    expect(getEnabledTypesForPark(undefined)).toEqual([]);
  });

  test('getEnabledTypesForPark_withUnknownType_filtersItOut', () => {
    const park = { enabledIncidentTypes: ['SNARE', 'UNKNOWN_TYPE'] };
    const result = getEnabledTypesForPark(park);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('SNARE');
  });

  test('getEnabledTypesForPark_withEmptyList_returnsEmptyArray', () => {
    const park = { enabledIncidentTypes: [] };
    expect(getEnabledTypesForPark(park)).toEqual([]);
  });

  test('getEnabledTypesForPark_withAllTypes_returnsFiveEntries', () => {
    const park = { enabledIncidentTypes: ['SNARE', 'CARCASS', 'TRACKS', 'CAMPSITE', 'OTHER'] };
    expect(getEnabledTypesForPark(park)).toHaveLength(5);
  });
});

describe('isValidIncidentType', () => {
  test('isValidIncidentType_withSnare_returnsTrue', () => {
    expect(isValidIncidentType('SNARE')).toBe(true);
  });

  test('isValidIncidentType_withUnknown_returnsFalse', () => {
    expect(isValidIncidentType('ALIEN')).toBe(false);
  });

  test('isValidIncidentType_withEmpty_returnsFalse', () => {
    expect(isValidIncidentType('')).toBe(false);
  });
});
