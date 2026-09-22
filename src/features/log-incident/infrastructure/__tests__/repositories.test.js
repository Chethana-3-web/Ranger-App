/**
 * Tests for InMemoryIncidentRepository and AsyncStorageIncidentRepository.
 * Both must satisfy the same IncidentRepository contract.
 * Naming: <method>_<condition>_<expectedResult>
 */

import { InMemoryIncidentRepository } from '../inMemoryIncidentRepository';
import { AsyncStorageIncidentRepository } from '../asyncStorageIncidentRepository';
import { InMemoryKeyValueStore } from '../../../../core/services/storage/InMemoryKeyValueStore';
import { createIncident } from '../../domain/incident';
import { SyncStatus } from '../../domain/syncStatus';

function makeIncident(id = 'INC-001', overrides = {}) {
  return createIncident({
    id,
    type: 'SNARE',
    description: 'Test incident',
    location: { latitude: 6.37, longitude: 81.52, source: 'GPS', accuracyMeters: 5, capturedAt: '2026-09-22T09:00:00.000Z' },
    recordedAt: '2026-09-22T09:00:00.000Z',
    rangerId: 'RNG-001',
    patrolId: 'PTL-001',
    parkId: 'PARK-YALA',
    ...overrides,
  });
}

/**
 * Run the same contract tests against any IncidentRepository implementation.
 */
function runContractTests(label, makeRepo) {
  describe(`${label} – IncidentRepository contract`, () => {
    let repo;
    beforeEach(() => { repo = makeRepo(); });

    test('save_newIncident_canBeRetrievedById', async () => {
      const inc = makeIncident();
      await repo.save(inc);
      const found = await repo.findById('INC-001');
      expect(found).toMatchObject({ id: 'INC-001', type: 'SNARE' });
    });

    test('findById_unknownId_returnsNull', async () => {
      expect(await repo.findById('GHOST')).toBeNull();
    });

    test('findAll_withMultiple_returnsAll', async () => {
      await repo.save(makeIncident('INC-A'));
      await repo.save(makeIncident('INC-B'));
      const all = await repo.findAll();
      expect(all).toHaveLength(2);
    });

    test('findAll_empty_returnsEmptyArray', async () => {
      expect(await repo.findAll()).toEqual([]);
    });

    test('findByStatus_pending_returnsOnlyPendingIncidents', async () => {
      const a = makeIncident('INC-A');
      const b = { ...makeIncident('INC-B'), status: SyncStatus.SYNCED };
      await repo.save(a);
      await repo.save(b);
      const pending = await repo.findByStatus(SyncStatus.PENDING_SYNC);
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe('INC-A');
    });

    test('findByStatus_noMatches_returnsEmptyArray', async () => {
      await repo.save(makeIncident());
      const failed = await repo.findByStatus(SyncStatus.FAILED);
      expect(failed).toEqual([]);
    });

    test('update_existingIncident_replacesRecord', async () => {
      const inc = makeIncident();
      await repo.save(inc);
      const updated = { ...inc, status: SyncStatus.SYNCED };
      await repo.update(updated);
      const found = await repo.findById('INC-001');
      expect(found.status).toBe(SyncStatus.SYNCED);
    });
  });
}

runContractTests('InMemoryIncidentRepository', () => InMemoryIncidentRepository());
runContractTests('AsyncStorageIncidentRepository', () =>
  AsyncStorageIncidentRepository(InMemoryKeyValueStore()),
);

// ── InMemoryIncidentRepository specific ──────────────────────────────────────
describe('InMemoryIncidentRepository', () => {
  test('update_unknownIncident_throwsError', async () => {
    const repo = InMemoryIncidentRepository();
    const inc = makeIncident('GHOST');
    await expect(repo.update(inc)).rejects.toThrow();
  });
});
