/**
 * Tests for parks.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import PARKS, { getParkById } from '../parks';

describe('parks config', () => {
  describe('PARKS seed data', () => {
    test('contains_atLeastTwoParks_returnsArray', () => {
      expect(PARKS.length).toBeGreaterThanOrEqual(2);
    });

    test('eachPark_hasRequiredFields_allFieldsPresent', () => {
      PARKS.forEach((park) => {
        expect(park).toHaveProperty('id');
        expect(park).toHaveProperty('name');
        expect(park).toHaveProperty('centre.lat');
        expect(park).toHaveProperty('centre.lng');
        expect(park).toHaveProperty('enabledIncidentTypes');
        expect(Array.isArray(park.enabledIncidentTypes)).toBe(true);
      });
    });

    test('parks_haveDifferentEnabledTypes_listsAreNotIdentical', () => {
      // At least one pair of parks should differ
      const lists = PARKS.map((p) => JSON.stringify(p.enabledIncidentTypes.sort()));
      const unique = new Set(lists);
      expect(unique.size).toBeGreaterThan(1);
    });

    test('yalaPark_hasAllIncidentTypes_fullList', () => {
      const yala = PARKS.find((p) => p.id === 'PARK-YALA');
      expect(yala).toBeDefined();
      expect(yala.enabledIncidentTypes).toEqual(
        expect.arrayContaining(['SNARE', 'CARCASS', 'CAMP', 'FOOTPRINT', 'OTHER'])
      );
    });

    test('sinharajaPark_missesCarcass_notInList', () => {
      const sinharaja = PARKS.find((p) => p.id === 'PARK-SINHARAJA');
      expect(sinharaja).toBeDefined();
      expect(sinharaja.enabledIncidentTypes).not.toContain('CARCASS');
    });
  });

  describe('getParkById', () => {
    test('getParkById_validId_returnsPark', () => {
      // Arrange
      const id = 'PARK-YALA';

      // Act
      const result = getParkById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(id);
    });

    test('getParkById_unknownId_returnsUndefined', () => {
      // Arrange & Act
      const result = getParkById('PARK-NONEXISTENT');

      // Assert
      expect(result).toBeUndefined();
    });

    test('getParkById_emptyString_returnsUndefined', () => {
      expect(getParkById('')).toBeUndefined();
    });

    test('getParkById_validId_hasCentreCoordinates', () => {
      const park = getParkById('PARK-UDAWALAWE');
      expect(typeof park.centre.lat).toBe('number');
      expect(typeof park.centre.lng).toBe('number');
    });
  });
});
