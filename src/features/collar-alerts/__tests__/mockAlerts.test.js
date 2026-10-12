import { MOCK_ALERTS } from '../data/mockAlerts';

describe('Collar Alerts Feature', () => {
  describe('MOCK_ALERTS Data Model Integrity', () => {
    test('contains_atLeastThreeSeededAlerts_returnsArray', () => {
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
      const elephantAlerts = MOCK_ALERTS.filter(
        (a) => a.species === 'Sri Lankan Elephant'
      );
      expect(elephantAlerts.length).toBeGreaterThan(0);

      elephantAlerts.forEach((alert) => {
        expect(alert.animalId).toBeDefined();
        expect(alert.collarId).toBeDefined();
        expect(alert.animalName).toBeDefined();
      });
    });

    test('poachingAlerts_haveCriticalRiskLevel', () => {
      const poachingAlert = MOCK_ALERTS.find((a) => a.id === 'ALT-003');
      expect(poachingAlert).toBeDefined();
      expect(poachingAlert.riskLevel).toBe('Critical');
      expect(poachingAlert.type).toContain('Poaching');
    });
  });
});
