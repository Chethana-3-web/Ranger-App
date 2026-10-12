import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INCIDENT_TYPE_LABELS, normaliseIncident } from '../src/services/incidentService.js';

describe('incidentService', () => {
  describe('INCIDENT_TYPE_LABELS', () => {
    test('contains expected incident types', () => {
      assert.equal(INCIDENT_TYPE_LABELS.EMERGENCY, 'Emergency Incident');
      assert.equal(INCIDENT_TYPE_LABELS.SNARE, 'Snare / Trap');
      assert.equal(INCIDENT_TYPE_LABELS.CARCASS, 'Animal Carcass');
      assert.equal(INCIDENT_TYPE_LABELS.TRACKS, 'Animal Tracks');
      assert.equal(INCIDENT_TYPE_LABELS.CAMPSITE, 'Illegal Campsite');
      assert.equal(INCIDENT_TYPE_LABELS.OTHER, 'Other');
    });
  });

  describe('normaliseIncident', () => {
    test('flattens nested location to top-level latitude and longitude', () => {
      const raw = {
        id: 'INC-001',
        type: 'SNARE',
        location: { latitude: 6.3728, longitude: 81.5198 },
        status: 'PENDING_SYNC',
      };

      const result = normaliseIncident(raw);

      assert.equal(result.latitude, 6.3728);
      assert.equal(result.longitude, 81.5198);
      assert.equal(result.label, 'Snare / Trap');
      assert.equal(result.status, 'Received');
      assert.equal(result.mobileStatus, 'PENDING_SYNC');
    });

    test('preserves top-level lat/lng when location object is absent', () => {
      const raw = {
        id: 'INC-002',
        type: 'EMERGENCY',
        latitude: 6.4052,
        longitude: 80.4881,
        status: 'SYNCED',
        severity: 'Critical',
      };

      const result = normaliseIncident(raw);

      assert.equal(result.latitude, 6.4052);
      assert.equal(result.longitude, 80.4881);
      assert.equal(result.label, 'Emergency Incident');
      assert.equal(result.status, 'Synced');
      assert.equal(result.severity, 'Critical');
    });

    test('handles unknown types with default label fallback', () => {
      const raw = {
        id: 'INC-003',
        type: 'UNRECOGNIZED_CUSTOM_TYPE',
        status: 'NEW',
      };

      const result = normaliseIncident(raw);

      assert.equal(result.label, 'UNRECOGNIZED_CUSTOM_TYPE');
      assert.equal(result.status, 'NEW');
      assert.equal(result.latitude, null);
      assert.equal(result.longitude, null);
    });
  });
});
