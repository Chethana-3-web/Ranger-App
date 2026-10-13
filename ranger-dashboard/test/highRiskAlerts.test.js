/**
 * highRiskAlerts.test.js  – Admin Dashboard
 *
 * Tests for high-risk (High + Critical) collar alert handling on the web dashboard.
 *
 * Covers:
 *  – Filtering and counting high-risk alerts from mockData
 *  – Priority sorting for dashboard display
 *  – Unacknowledged / active high-risk alert detection
 *  – Status update mapping (admin operations)
 *  – Cross-reference with WILDLIFE data (animal lookup for high-risk alerts)
 *  – Risk zone correlation with active high-risk alerts
 *
 * Pattern: Arrange – Act – Assert
 * Naming:  <method>_<condition>_<expectedResult>
 *
 * Uses Node's built-in test runner (same as other dashboard tests).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  WILDLIFE_ALERTS,
  WILDLIFE,
  RISK_ZONES,
  RANGERS,
} from '../src/data/mockData.js';
import { getAnimalById } from '../src/services/alertService.js';

// ── Data integrity (absorbed from alertService.test.js) ───────────────────────

describe('Wildlife & Ranger Data Integrity', () => {
  test('allAnimals_haveValidCoordinatesAndCollarId', () => {
    WILDLIFE.forEach((animal) => {
      assert.ok(animal.id, 'Animal must have an ID');
      assert.ok(animal.species, 'Animal must have a species');
      assert.equal(typeof animal.latitude, 'number');
      assert.equal(typeof animal.longitude, 'number');
      assert.ok(animal.collarId, 'Animal must have a collar ID');
    });
  });

  test('allAlerts_haveValidRiskLevels', () => {
    const VALID_RISKS = ['Low', 'Medium', 'High', 'Critical'];
    WILDLIFE_ALERTS.forEach((alert) => {
      assert.ok(alert.id, 'Alert must have an ID');
      assert.ok(VALID_RISKS.includes(alert.riskLevel), `Invalid riskLevel: ${alert.riskLevel}`);
    });
  });

  test('allRangers_haveIdNameAndParkId', () => {
    RANGERS.forEach((ranger) => {
      assert.ok(ranger.id, 'Ranger must have an ID');
      assert.ok(ranger.name, 'Ranger must have a name');
      assert.ok(ranger.parkId, 'Ranger must have an assigned park');
    });
  });

  test('getAnimalById_existingAnimal_returnsCorrectObject', () => {
    const first = WILDLIFE[0];
    const found = getAnimalById(first.id);
    assert.notEqual(found, null);
    assert.equal(found.id, first.id);
    assert.equal(found.name, first.name);
  });

  test('getAnimalById_nonExistentId_returnsNull', () => {
    assert.equal(getAnimalById('ANIMAL-NONEXISTENT-999'), null);
  });
});

// ── Pure helpers (mirror what the dashboard components use) ───────────────────

const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function filterHighRisk(alerts) {
  return alerts.filter((a) => a.riskLevel === 'High' || a.riskLevel === 'Critical');
}

function sortByRiskDescending(alerts) {
  return [...alerts].sort(
    (a, b) => (RISK_ORDER[a.riskLevel] ?? 99) - (RISK_ORDER[b.riskLevel] ?? 99),
  );
}

function getActiveUnresolved(alerts) {
  const INACTIVE = new Set(['Resolved', 'Closed']);
  return alerts.filter((a) => !INACTIVE.has(a.status));
}

function countByRiskLevel(alerts) {
  return alerts.reduce((acc, a) => {
    acc[a.riskLevel] = (acc[a.riskLevel] ?? 0) + 1;
    return acc;
  }, {});
}

// Map admin status update to allowed values (mirrors updateAlertStatus usage)
const VALID_ADMIN_STATUSES = new Set([
  'Active', 'Active/Monitoring', 'Active/Reassigned', 'Acknowledged', 'Resolved',
]);

function isValidAdminStatus(status) {
  return VALID_ADMIN_STATUSES.has(status);
}

// ── Test suite ─────────────────────────────────────────────────────────────────

describe('High-Risk Collar Alerts – Admin Dashboard', () => {

  // ── 1. Filtering ──────────────────────────────────────────────────────────

  describe('filterHighRisk', () => {
    test('filterHighRisk_withMockWildlifeAlerts_returnsOnlyHighAndCritical', () => {
      const result = filterHighRisk(WILDLIFE_ALERTS);
      result.forEach((alert) => {
        assert.ok(
          alert.riskLevel === 'High' || alert.riskLevel === 'Critical',
          `Expected High or Critical, got: ${alert.riskLevel}`,
        );
      });
    });

    test('filterHighRisk_withMockData_atLeastOneHighRiskAlertExists', () => {
      const result = filterHighRisk(WILDLIFE_ALERTS);
      assert.ok(result.length >= 1, 'Expected at least one high-risk alert in mock data');
    });

    test('filterHighRisk_withEmptyArray_returnsEmptyArray', () => {
      assert.deepEqual(filterHighRisk([]), []);
    });

    test('filterHighRisk_noneHighOrCritical_returnsEmpty', () => {
      const lowOnly = [
        { id: 'X1', riskLevel: 'Low' },
        { id: 'X2', riskLevel: 'Medium' },
      ];
      assert.deepEqual(filterHighRisk(lowOnly), []);
    });
  });

  // ── 2. Priority sorting for dashboard list ────────────────────────────────

  describe('sortByRiskDescending', () => {
    test('sortByRiskDescending_withMixedAlerts_criticalAppearsBeforeHigh', () => {
      const sorted = sortByRiskDescending(WILDLIFE_ALERTS);
      let seenHigh = false;
      for (const alert of sorted) {
        if (alert.riskLevel === 'High') seenHigh = true;
        if (seenHigh) {
          assert.notEqual(alert.riskLevel, 'Critical', 'Critical found after High in sorted list');
        }
      }
    });

    test('sortByRiskDescending_criticalAlert_isFirstInList', () => {
      // WILDLIFE_ALERTS contains ALT-003 Critical
      const sorted = sortByRiskDescending(WILDLIFE_ALERTS);
      assert.equal(sorted[0].riskLevel, 'Critical');
    });

    test('sortByRiskDescending_doesNotMutateOriginalArray', () => {
      const original = [...WILDLIFE_ALERTS];
      sortByRiskDescending(WILDLIFE_ALERTS);
      assert.deepEqual(WILDLIFE_ALERTS, original);
    });

    test('sortByRiskDescending_withSingleElement_returnsSameElement', () => {
      const single = [WILDLIFE_ALERTS[0]];
      const result = sortByRiskDescending(single);
      assert.equal(result.length, 1);
      assert.equal(result[0].id, WILDLIFE_ALERTS[0].id);
    });
  });

  // ── 3. Active / unresolved high-risk detection ────────────────────────────

  describe('getActiveUnresolved', () => {
    test('getActiveUnresolved_withMockData_doesNotContainResolvedAlerts', () => {
      const withResolved = [
        ...WILDLIFE_ALERTS,
        { id: 'ALT-X', riskLevel: 'Critical', status: 'Resolved' },
      ];
      const result = getActiveUnresolved(withResolved);
      const hasResolved = result.some((a) => a.status === 'Resolved');
      assert.equal(hasResolved, false);
    });

    test('getActiveUnresolved_allMockAlerts_allAreActive', () => {
      // All three WILDLIFE_ALERTS are active/monitoring in mock data
      const result = getActiveUnresolved(WILDLIFE_ALERTS);
      assert.equal(result.length, WILDLIFE_ALERTS.length);
    });

    test('getActiveUnresolved_highRiskFiltered_returnsActiveHighRiskAlerts', () => {
      const active = getActiveUnresolved(WILDLIFE_ALERTS);
      const highRisk = filterHighRisk(active);
      highRisk.forEach((a) => {
        assert.ok(
          a.riskLevel === 'High' || a.riskLevel === 'Critical',
        );
        assert.notEqual(a.status, 'Resolved');
      });
    });
  });

  // ── 4. Risk level counts for dashboard summary card ───────────────────────

  describe('countByRiskLevel', () => {
    test('countByRiskLevel_withMockData_criticalCountIsAtLeastOne', () => {
      const counts = countByRiskLevel(WILDLIFE_ALERTS);
      assert.ok((counts.Critical ?? 0) >= 1);
    });

    test('countByRiskLevel_withMockData_highCountIsAtLeastOne', () => {
      const counts = countByRiskLevel(WILDLIFE_ALERTS);
      assert.ok((counts.High ?? 0) >= 1);
    });

    test('countByRiskLevel_withEmptyArray_returnsEmptyObject', () => {
      assert.deepEqual(countByRiskLevel([]), {});
    });

    test('countByRiskLevel_sumOfAllLevels_equalsTotalAlerts', () => {
      const counts = countByRiskLevel(WILDLIFE_ALERTS);
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      assert.equal(total, WILDLIFE_ALERTS.length);
    });
  });

  // ── 5. Admin status update validation ────────────────────────────────────

  describe('isValidAdminStatus', () => {
    test('isValidAdminStatus_active_returnsTrue', () => {
      assert.equal(isValidAdminStatus('Active'), true);
    });

    test('isValidAdminStatus_resolved_returnsTrue', () => {
      assert.equal(isValidAdminStatus('Resolved'), true);
    });

    test('isValidAdminStatus_acknowledged_returnsTrue', () => {
      assert.equal(isValidAdminStatus('Acknowledged'), true);
    });

    test('isValidAdminStatus_activeMonitoring_returnsTrue', () => {
      assert.equal(isValidAdminStatus('Active/Monitoring'), true);
    });

    test('isValidAdminStatus_unknownStatus_returnsFalse', () => {
      assert.equal(isValidAdminStatus('Deleted'), false);
    });

    test('isValidAdminStatus_emptyString_returnsFalse', () => {
      assert.equal(isValidAdminStatus(''), false);
    });
  });

  // ── 6. Animal cross-reference for high-risk alerts ────────────────────────

  describe('getAnimalById – high-risk alert correlation', () => {
    test('getAnimalById_highRiskAlertWithAnimalId_returnsMatchingAnimal', () => {
      // ALT-001 references WL-E102
      const highRisk = filterHighRisk(WILDLIFE_ALERTS).find((a) => a.animalId);
      assert.ok(highRisk, 'Expected at least one high-risk alert with an animalId');

      const animal = getAnimalById(highRisk.animalId);
      assert.notEqual(animal, null);
      assert.equal(animal.id, highRisk.animalId);
    });

    test('getAnimalById_criticalAlertWithNullAnimalId_returnsNull', () => {
      // ALT-003 (Critical/Poaching) has no animal – animalId is null
      const critical = WILDLIFE_ALERTS.find(
        (a) => a.riskLevel === 'Critical' && !a.animalId,
      );
      assert.ok(critical, 'Expected critical alert without an animalId');
      const result = getAnimalById(critical.animalId);
      assert.equal(result, null);
    });

    test('getAnimalById_allHighRiskAnimals_haveSpeciesAndCollarId', () => {
      const highRiskWithAnimal = filterHighRisk(WILDLIFE_ALERTS).filter((a) => a.animalId);
      highRiskWithAnimal.forEach((alert) => {
        const animal = getAnimalById(alert.animalId);
        if (animal) {
          assert.ok(animal.species, `Animal ${animal.id} missing species`);
          assert.ok(animal.collarId, `Animal ${animal.id} missing collarId`);
        }
      });
    });
  });

  // ── 7. Risk zone correlation ──────────────────────────────────────────────

  describe('Risk Zone – High-Risk Correlation', () => {
    test('riskZones_highRiskZonesExist_atLeastOne', () => {
      const highRiskZones = RISK_ZONES.filter((z) => z.riskLevel === 'High');
      assert.ok(highRiskZones.length >= 1);
    });

    test('riskZones_criticalAlertPark_hasMatchingHighRiskZone', () => {
      // ALT-003 is Critical in PARK-YALA – RZ-001 covers North Yala Poaching Hotspot
      const criticalAlert = WILDLIFE_ALERTS.find((a) => a.riskLevel === 'Critical');
      assert.ok(criticalAlert);

      const zonesForPark = RISK_ZONES.filter((z) => z.parkId === criticalAlert.parkId);
      assert.ok(
        zonesForPark.length > 0,
        `No risk zones found for park: ${criticalAlert.parkId}`,
      );
    });

    test('riskZones_allHighLevelZones_haveValidCentreCoordinates', () => {
      const highZones = RISK_ZONES.filter(
        (z) => z.riskLevel === 'High' || z.riskLevel === 'Critical',
      );
      highZones.forEach((zone) => {
        assert.equal(typeof zone.centre.lat, 'number');
        assert.equal(typeof zone.centre.lng, 'number');
      });
    });
  });

  // ── 8. Ranger availability for high-risk response ─────────────────────────

  describe('Ranger Availability for High-Risk Alerts', () => {
    test('rangers_withHighRiskAlert_availableRangersExistInSamePark', () => {
      // ALT-001 (High) is in PARK-UDAWALAWE — R006/R007 are there
      const highRiskAlert = filterHighRisk(WILDLIFE_ALERTS).find(
        (a) => a.parkId === 'PARK-UDAWALAWE',
      );
      assert.ok(highRiskAlert, 'Expected a high-risk alert in PARK-UDAWALAWE');

      const available = RANGERS.filter(
        (r) => r.parkId === highRiskAlert.parkId && r.status !== 'Offline',
      );
      assert.ok(available.length > 0, 'Expected at least one available ranger for the park');
    });

    test('rangers_criticalAlertPark_hasAtLeastOnePatrollingRanger', () => {
      const criticalAlert = WILDLIFE_ALERTS.find((a) => a.riskLevel === 'Critical');
      assert.ok(criticalAlert);

      const patrolling = RANGERS.filter(
        (r) => r.parkId === criticalAlert.parkId && r.status === 'On Patrol',
      );
      assert.ok(
        patrolling.length > 0,
        `No patrolling rangers in park ${criticalAlert.parkId} for critical alert`,
      );
    });
  });

  // ── 9. Scenario – Dashboard triage workflow ───────────────────────────────

  describe('Dashboard Triage Scenario', () => {
    test('scenario_sortAndFilter_firstAlertIsCriticalAndActive', () => {
      const prioritised = sortByRiskDescending(
        filterHighRisk(getActiveUnresolved(WILDLIFE_ALERTS)),
      );
      assert.ok(prioritised.length > 0, 'Expected at least one active high-risk alert');
      assert.equal(prioritised[0].riskLevel, 'Critical');
    });

    test('scenario_afterStatusUpdate_alertRemovedFromActiveHighRisk', () => {
      const targetId = 'ALT-003';
      const updatedAlerts = WILDLIFE_ALERTS.map((a) =>
        a.id === targetId ? { ...a, status: 'Resolved' } : a,
      );
      const active = getActiveUnresolved(filterHighRisk(updatedAlerts));
      const stillPresent = active.some((a) => a.id === targetId);
      assert.equal(stillPresent, false);
    });

    test('scenario_addNewCriticalAlert_appearsFirstInPrioritisedList', () => {
      const newCritical = {
        id: 'ALT-NEW',
        riskLevel: 'Critical',
        status: 'Active',
        parkId: 'PARK-SINHARAJA',
        animalId: null,
        type: 'Poaching Activity Detected',
        time: '11:00',
        date: '2026-10-13',
        location: 'Sinharaja Core Zone',
        latitude: 6.4052,
        longitude: 80.4881,
      };
      const augmented = [...WILDLIFE_ALERTS, newCritical];
      const sorted = sortByRiskDescending(filterHighRisk(augmented));
      assert.equal(sorted[0].riskLevel, 'Critical');
      // Both critical alerts (ALT-003 and ALT-NEW) should be in the top slots
      const criticals = sorted.filter((a) => a.riskLevel === 'Critical');
      assert.ok(criticals.some((a) => a.id === 'ALT-NEW'));
    });
  });
});
