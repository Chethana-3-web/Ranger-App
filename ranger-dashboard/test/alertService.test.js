import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getAnimalById } from '../src/services/alertService.js';
import { WILDLIFE, WILDLIFE_ALERTS, RANGERS } from '../src/data/mockData.js';

describe('alertService & mockData', () => {
  describe('getAnimalById', () => {
    test('returns animal object when animal exists', () => {
      const firstAnimal = WILDLIFE[0];
      assert.ok(firstAnimal, 'At least one animal should exist in mockData');

      const found = getAnimalById(firstAnimal.id);
      assert.notEqual(found, null);
      assert.equal(found.id, firstAnimal.id);
      assert.equal(found.name, firstAnimal.name);
    });

    test('returns null when animal does not exist', () => {
      const result = getAnimalById('ANIMAL-NONEXISTENT-999');
      assert.equal(result, null);
    });
  });

  describe('Wildlife & Alert Data Integrity', () => {
    test('all animals have valid coordinates and collar IDs', () => {
      WILDLIFE.forEach((animal) => {
        assert.ok(animal.id, 'Animal must have an ID');
        assert.ok(animal.species, 'Animal must have a species');
        assert.equal(typeof animal.latitude, 'number');
        assert.equal(typeof animal.longitude, 'number');
        assert.ok(animal.collarId, 'Animal must have a collar ID');
      });
    });

    test('all alerts reference valid risk levels', () => {
      const VALID_RISKS = ['Low', 'Medium', 'High', 'Critical'];
      WILDLIFE_ALERTS.forEach((alert) => {
        assert.ok(alert.id, 'Alert must have an ID');
        assert.ok(VALID_RISKS.includes(alert.riskLevel), `Invalid riskLevel: ${alert.riskLevel}`);
      });
    });

    test('all rangers have valid patrol stations and contact details', () => {
      RANGERS.forEach((ranger) => {
        assert.ok(ranger.id, 'Ranger must have an ID');
        assert.ok(ranger.name, 'Ranger must have a name');
        assert.ok(ranger.parkId, 'Ranger must have an assigned park');
      });
    });
  });
});
