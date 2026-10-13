/**
 * highRiskAlerts.test.js
 *
 * Tests for high-risk (High + Critical) collar alert behaviour on the Ranger mobile side.
 *
 * Covers:
 *  – Identification & filtering of high-risk alerts
 *  – Priority ordering (Critical before High before lower)
 *  – Unacknowledged high-risk alert detection
 *  – Response submission outcome → status mapping for high-risk alerts
 *  – Alert data completeness for high-risk entries
 *
 * Pattern: Arrange – Act – Assert
 * Naming:  <method>_<condition>_<expectedResult>
 */

// ── Inline fixture data (replaces deleted mockAlerts.js) ─────────────────────
// Alerts are now created from the admin dashboard. These fixtures exist only
// for unit-testing alert logic — they are never seeded to Firestore.

const MOCK_ALERTS = [
  {
    id: 'ALT-001',
    type: 'Elephant Entered Farmland',
    animalName: 'Elephant E-102',
    animalId: 'WL-E102',
    species: 'Sri Lankan Elephant',
    collarId: 'COL-102',
    parkId: 'PARK-UDAWALAWE',
    parkName: 'Udawalawe National Park',
    riskZone: 'Farmland Zone F-04',
    riskLevel: 'High',
    status: 'Active',
    generatedAt: '2026-10-07T10:42:00.000Z',
    latitude: 6.5050,
    longitude: 80.9250,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALT-002',
    type: 'Elephant Approaching Road',
    animalName: 'Elephant E-103',
    animalId: 'WL-E103',
    species: 'Sri Lankan Elephant',
    collarId: 'COL-103',
    parkId: 'PARK-WILPATTU',
    parkName: 'Wilpattu National Park',
    riskZone: 'A12 Highway Crossing Point',
    riskLevel: 'Medium',
    status: 'Active/Monitoring',
    generatedAt: '2026-10-07T09:15:00.000Z',
    latitude: 8.4820,
    longitude: 80.0600,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALT-003',
    type: 'Possible Poaching Activity',
    animalName: null,
    animalId: null,
    species: null,
    collarId: null,
    parkId: 'PARK-YALA',
    parkName: 'Yala National Park',
    riskZone: 'North Yala Sector A',
    riskLevel: 'Critical',
    status: 'Active',
    generatedAt: '2026-10-07T07:05:00.000Z',
    latitude: 6.4150,
    longitude: 81.5400,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALT-004',
    type: 'Leopard Near Village Boundary',
    animalName: 'Leopard L-001',
    animalId: 'WL-L001',
    species: 'Sri Lankan Leopard',
    collarId: 'COL-201',
    parkId: 'PARK-YALA',
    parkName: 'Yala National Park',
    riskZone: 'Village Boundary – South Yala',
    riskLevel: 'High',
    status: 'Resolved',
    generatedAt: '2026-10-06T14:30:00.000Z',
    latitude: 6.3620,
    longitude: 81.5180,
    acknowledgedBy: 'RNG-001',
    acknowledgedAt: '2026-10-06T14:35:00.000Z',
  },
];

// ── Alert data integrity ───────────────────────────────────────────────────────

describe('Collar Alert Data Integrity', () => {
  test('mockAlerts_isArray_containsAtLeastThreeAlerts', () => {
    expect(Array.isArray(MOCK_ALERTS)).toBe(true);
    expect(MOCK_ALERTS.length).toBeGreaterThanOrEqual(3);
  });

  test('eachAlert_hasMandatoryFields_allFieldsPresent', () => {
    const VALID_RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
    MOCK_ALERTS.forEach((alert) => {
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('parkId');
      expect(alert).toHaveProperty('riskLevel');
      expect(alert).toHaveProperty('status');
      expect(alert).toHaveProperty('generatedAt');
      expect(alert).toHaveProperty('latitude');
      expect(alert).toHaveProperty('longitude');
      expect(typeof alert.latitude).toBe('number');
      expect(typeof alert.longitude).toBe('number');
      expect(VALID_RISK_LEVELS).toContain(alert.riskLevel);
    });
  });

  test('collaredElephantAlerts_containAnimalAndCollarIds', () => {
    const elephantAlerts = MOCK_ALERTS.filter((a) => a.species === 'Sri Lankan Elephant');
    expect(elephantAlerts.length).toBeGreaterThan(0);
    elephantAlerts.forEach((alert) => {
      expect(alert.animalId).toBeDefined();
      expect(alert.collarId).toBeDefined();
      expect(alert.animalName).toBeDefined();
    });
  });
});

// ── Pure helpers (extracted so tests stay stateless) ──────────────────────────

/**
 * Return only High or Critical alerts.
 * @param {object[]} alerts
 * @returns {object[]}
 */
function filterHighRiskAlerts(alerts) {
  return alerts.filter((a) => a.riskLevel === 'High' || a.riskLevel === 'Critical');
}

/**
 * Sort alerts so Critical comes before High, High before Medium, Medium before Low.
 * @param {object[]} alerts
 * @returns {object[]}
 */
const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
function sortByRiskDescending(alerts) {
  return [...alerts].sort(
    (a, b) => (RISK_ORDER[a.riskLevel] ?? 99) - (RISK_ORDER[b.riskLevel] ?? 99),
  );
}

/**
 * Return all Active high-risk alerts that have no acknowledgedBy value.
 * @param {object[]} alerts
 * @returns {object[]}
 */
function getUnacknowledgedHighRisk(alerts) {
  return filterHighRiskAlerts(alerts).filter(
    (a) => a.status === 'Active' && !a.acknowledgedBy,
  );
}

/**
 * Map a ranger response outcome to the alert status string.
 * Mirrors the statusMap in alertService.submitAlertResponse.
 * @param {'Resolved'|'Monitoring'|'Reassigned'} outcome
 * @returns {string}
 */
function mapOutcomeToStatus(outcome) {
  const statusMap = {
    Resolved:   'Resolved',
    Monitoring: 'Active/Monitoring',
    Reassigned: 'Active/Reassigned',
  };
  return statusMap[outcome] ?? 'Resolved';
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('High-Risk Collar Alerts – Ranger Mobile', () => {

  // ── 1. Identification ──────────────────────────────────────────────────────

  describe('filterHighRiskAlerts', () => {
    test('filterHighRiskAlerts_withMixedRiskLevels_returnsOnlyHighAndCritical', () => {
      const result = filterHighRiskAlerts(MOCK_ALERTS);

      result.forEach((alert) => {
        expect(['High', 'Critical']).toContain(alert.riskLevel);
      });
    });

    test('filterHighRiskAlerts_withMixedRiskLevels_excludesMediumAndLow', () => {
      const result = filterHighRiskAlerts(MOCK_ALERTS);

      const hasLowOrMedium = result.some(
        (a) => a.riskLevel === 'Low' || a.riskLevel === 'Medium',
      );
      expect(hasLowOrMedium).toBe(false);
    });

    test('filterHighRiskAlerts_withMockData_returnsAtLeastTwoAlerts', () => {
      // MOCK_ALERTS contains ALT-001 (High) and ALT-003 (Critical) and ALT-004 (High)
      const result = filterHighRiskAlerts(MOCK_ALERTS);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    test('filterHighRiskAlerts_withEmptyArray_returnsEmptyArray', () => {
      expect(filterHighRiskAlerts([])).toEqual([]);
    });
  });

  // ── 2. Priority ordering ───────────────────────────────────────────────────

  describe('sortByRiskDescending', () => {
    test('sortByRiskDescending_withMixedLevels_placesCriticalFirst', () => {
      const sorted = sortByRiskDescending(MOCK_ALERTS);
      expect(sorted[0].riskLevel).toBe('Critical');
    });

    test('sortByRiskDescending_withMixedLevels_noCriticalAfterHigh', () => {
      const sorted = sortByRiskDescending(MOCK_ALERTS);
      let seenHigh = false;
      for (const alert of sorted) {
        if (alert.riskLevel === 'High') seenHigh = true;
        if (seenHigh) {
          expect(alert.riskLevel).not.toBe('Critical');
        }
      }
    });

    test('sortByRiskDescending_withOnlyHighAndCritical_criticalBeforeHigh', () => {
      const mixed = [
        { id: 'X1', riskLevel: 'High' },
        { id: 'X2', riskLevel: 'Critical' },
        { id: 'X3', riskLevel: 'High' },
      ];
      const sorted = sortByRiskDescending(mixed);
      expect(sorted[0].riskLevel).toBe('Critical');
    });

    test('sortByRiskDescending_withSingleAlert_returnsSingleAlert', () => {
      const single = [MOCK_ALERTS[0]];
      expect(sortByRiskDescending(single)).toHaveLength(1);
    });
  });

  // ── 3. Unacknowledged high-risk detection ──────────────────────────────────

  describe('getUnacknowledgedHighRisk', () => {
    test('getUnacknowledgedHighRisk_withActiveUnacknowledgedAlerts_returnsAlerts', () => {
      const result = getUnacknowledgedHighRisk(MOCK_ALERTS);
      expect(result.length).toBeGreaterThan(0);
    });

    test('getUnacknowledgedHighRisk_allReturned_haveNoAcknowledgedBy', () => {
      const result = getUnacknowledgedHighRisk(MOCK_ALERTS);
      result.forEach((alert) => {
        expect(alert.acknowledgedBy).toBeFalsy();
      });
    });

    test('getUnacknowledgedHighRisk_allReturned_haveActiveStatus', () => {
      const result = getUnacknowledgedHighRisk(MOCK_ALERTS);
      result.forEach((alert) => {
        expect(alert.status).toBe('Active');
      });
    });

    test('getUnacknowledgedHighRisk_withAllAcknowledged_returnsEmpty', () => {
      const allAcknowledged = MOCK_ALERTS.map((a) => ({
        ...a,
        acknowledgedBy: 'RNG-001',
        acknowledgedAt: '2026-10-07T11:00:00.000Z',
      }));
      expect(getUnacknowledgedHighRisk(allAcknowledged)).toHaveLength(0);
    });

    test('getUnacknowledgedHighRisk_withResolvedHighRisk_excludesResolved', () => {
      // ALT-004 is High but Resolved – should not appear
      const result = getUnacknowledgedHighRisk(MOCK_ALERTS);
      const resolvedIncluded = result.some((a) => a.id === 'ALT-004');
      expect(resolvedIncluded).toBe(false);
    });
  });

  // ── 4. Response outcome → status mapping ──────────────────────────────────

  describe('mapOutcomeToStatus', () => {
    test('mapOutcomeToStatus_resolved_returnsResolved', () => {
      expect(mapOutcomeToStatus('Resolved')).toBe('Resolved');
    });

    test('mapOutcomeToStatus_monitoring_returnsActiveMonitoring', () => {
      expect(mapOutcomeToStatus('Monitoring')).toBe('Active/Monitoring');
    });

    test('mapOutcomeToStatus_reassigned_returnsActiveReassigned', () => {
      expect(mapOutcomeToStatus('Reassigned')).toBe('Active/Reassigned');
    });

    test('mapOutcomeToStatus_unknownOutcome_defaultsToResolved', () => {
      expect(mapOutcomeToStatus('Unknown')).toBe('Resolved');
    });
  });

  // ── 5. Data completeness for high-risk alerts ─────────────────────────────

  describe('High-Risk Alert Data Integrity', () => {
    test('highRiskAlerts_allHaveId_idIsDefined', () => {
      filterHighRiskAlerts(MOCK_ALERTS).forEach((alert) => {
        expect(alert.id).toBeDefined();
        expect(typeof alert.id).toBe('string');
      });
    });

    test('highRiskAlerts_allHaveValidCoordinates_latLngAreNumbers', () => {
      filterHighRiskAlerts(MOCK_ALERTS).forEach((alert) => {
        expect(typeof alert.latitude).toBe('number');
        expect(typeof alert.longitude).toBe('number');
        // Rough Sri Lanka bounding box sanity check
        expect(alert.latitude).toBeGreaterThan(5.9);
        expect(alert.latitude).toBeLessThan(9.9);
        expect(alert.longitude).toBeGreaterThan(79.5);
        expect(alert.longitude).toBeLessThan(81.9);
      });
    });

    test('highRiskAlerts_allHaveParkId_parkIdIsDefined', () => {
      filterHighRiskAlerts(MOCK_ALERTS).forEach((alert) => {
        expect(alert.parkId).toBeDefined();
      });
    });

    test('highRiskAlerts_allHaveGeneratedAt_timestampIsString', () => {
      filterHighRiskAlerts(MOCK_ALERTS).forEach((alert) => {
        expect(typeof alert.generatedAt).toBe('string');
        expect(alert.generatedAt.length).toBeGreaterThan(0);
      });
    });

    test('criticalAlert_ALT003_hasParkAndLocation', () => {
      const critical = MOCK_ALERTS.find((a) => a.riskLevel === 'Critical');
      expect(critical).toBeDefined();
      expect(critical.parkId).toBeTruthy();
      expect(critical.riskZone).toBeTruthy();
    });
  });

  // ── 6. Scenario – High-risk alert triage flow ─────────────────────────────

  describe('High-Risk Alert Triage Scenario', () => {
    test('scenario_criticalPoachingAlert_isFirstInPriorityList', () => {
      const prioritised = sortByRiskDescending(filterHighRiskAlerts(MOCK_ALERTS));
      expect(prioritised[0].riskLevel).toBe('Critical');
    });

    test('scenario_afterAcknowledge_alertRemovedFromUnacknowledgedList', () => {
      const targetId = 'ALT-003';
      const updatedAlerts = MOCK_ALERTS.map((a) =>
        a.id === targetId
          ? { ...a, acknowledgedBy: 'RNG-001', acknowledgedAt: '2026-10-07T08:00:00.000Z' }
          : a,
      );
      const unacked = getUnacknowledgedHighRisk(updatedAlerts);
      const stillPresent = unacked.some((a) => a.id === targetId);
      expect(stillPresent).toBe(false);
    });

    test('scenario_afterResolve_alertExcludedFromActiveHighRisk', () => {
      const targetId = 'ALT-001';
      const updatedAlerts = MOCK_ALERTS.map((a) =>
        a.id === targetId ? { ...a, status: 'Resolved' } : a,
      );
      const unacked = getUnacknowledgedHighRisk(updatedAlerts);
      expect(unacked.some((a) => a.id === targetId)).toBe(false);
    });
  });
});
