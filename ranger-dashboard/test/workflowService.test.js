import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKFLOW_STEPS,
  SEVERITIES,
  mergeWorkflow,
} from '../src/services/incidentWorkflowService.js';

describe('incidentWorkflowService', () => {
  describe('Constants', () => {
    test('WORKFLOW_STEPS contains all 5 sequential lifecycle stages', () => {
      assert.deepEqual(WORKFLOW_STEPS, ['New', 'Under Review', 'Assigned', 'Responding', 'Resolved']);
    });

    test('SEVERITIES contains standard four triage tiers', () => {
      assert.deepEqual(SEVERITIES, ['Low', 'Medium', 'High', 'Critical']);
    });
  });

  describe('mergeWorkflow', () => {
    test('merges workflow overrides over base incident data', () => {
      const baseIncident = {
        id: 'INC-100',
        type: 'SNARE',
        status: 'PENDING_SYNC',
        severity: 'Low',
        rangerId: 'RNG-01',
        recordedAt: '2026-10-12T10:00:00Z',
      };

      const workflowOverride = {
        workflowStatus: 'Assigned',
        severity: 'Critical',
        assignedRangerId: 'RNG-05',
        history: [{ at: '2026-10-12T10:30:00Z', change: 'Assigned to RNG-05' }],
      };

      const merged = mergeWorkflow(baseIncident, workflowOverride);

      assert.equal(merged.id, 'INC-100');
      assert.equal(merged.workflowStatus, 'Assigned');
      assert.equal(merged.severity, 'Critical');
      assert.equal(merged.assignedRangerId, 'RNG-05');
      assert.equal(merged.reportedBy, 'RNG-01');
      assert.equal(merged.reportedAt, '2026-10-12T10:00:00Z');
      assert.equal(merged.history.length, 1);
    });

    test('defaults workflow status to New when no workflow override exists', () => {
      const baseIncident = {
        id: 'INC-101',
        type: 'CARCASS',
        status: 'SYNCED',
        rangerId: 'RNG-02',
      };

      const merged = mergeWorkflow(baseIncident, null);

      assert.equal(merged.workflowStatus, 'New');
      assert.equal(merged.assignedRangerId, null);
      assert.deepEqual(merged.history, []);
    });

    test('retains valid existing status when workflow override is undefined', () => {
      const baseIncident = {
        id: 'INC-102',
        status: 'Under Review',
        severity: 'High',
      };

      const merged = mergeWorkflow(baseIncident);

      assert.equal(merged.workflowStatus, 'Under Review');
      assert.equal(merged.severity, 'High');
    });
  });
});
