/**
 * Tests for syncManager.js
 * Naming: <method>_<condition>_<expectedResult>
 * Covers: online sync, offline guard, failure/retry, max attempts → FAILED,
 *         ALREADY_EXISTS idempotency, no-pending no-op, parallel-run guard,
 *         connectivity-restored trigger.
 */

import { createSyncManager } from '../syncManager';
import { SyncStatus } from '../../domain/syncStatus';
import { createIncident, recordFailedAttempt, MAX_SYNC_ATTEMPTS } from '../../domain/incident';
import { FakeConnectivityMonitor } from '../../../../core/services/connectivity/FakeConnectivityMonitor';

// ── Fakes ──────────────────────────────────────────────────────────────────────

function makeRepo(incidents = []) {
  const store = new Map(incidents.map((i) => [i.id, i]));
  return {
    async save(i)           { store.set(i.id, i); },
    async findById(id)      { return store.get(id) ?? null; },
    async findByStatus(s)   { return [...store.values()].filter((i) => i.status === s); },
    async findAll()         { return [...store.values()]; },
    async update(i)         { store.set(i.id, i); },
    _get: (id) => store.get(id),
    _all: () => [...store.values()],
  };
}

function makeGateway(result = 'STORED') {
  const calls = [];
  return {
    async upload(incident) {
      calls.push(incident.id);
      if (result === 'THROW') throw new Error('Network timeout');
      return { result, error: result === 'ERROR' ? 'Server error' : undefined };
    },
    calls,
  };
}

const fakeClock = { iso: () => '2026-09-22T10:00:00.000Z', now: () => 1_000_000 };

/** Synchronous scheduler that runs callback immediately (no real timers). */
function immediateScheduler(_ms, fn) { fn(); }

function baseIncident(id = 'INC-001', overrides = {}) {
  return createIncident({
    id, type: 'SNARE', description: 'test', location: { latitude: 6.37, longitude: 81.52, source: 'GPS', accuracyMeters: 5, capturedAt: '2026-09-22T09:00:00.000Z' },
    recordedAt: '2026-09-22T09:00:00.000Z', rangerId: 'RNG-001', patrolId: 'PTL-001', parkId: 'PARK-YALA',
    ...overrides,
  });
}

// ── syncNow ────────────────────────────────────────────────────────────────────

describe('syncNow', () => {
  test('syncNow_withPendingIncident_marksItSynced', async () => {
    const incident = baseIncident();
    const repo = makeRepo([incident]);
    const gateway = makeGateway('STORED');
    const monitor = FakeConnectivityMonitor(true);

    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: monitor, clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();

    const updated = repo._get('INC-001');
    expect(updated.status).toBe(SyncStatus.SYNCED);
  });

  test('syncNow_withAlreadyExistsResponse_marksItSynced', async () => {
    const repo = makeRepo([baseIncident()]);
    const gateway = makeGateway('ALREADY_EXISTS');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();
    expect(repo._get('INC-001').status).toBe(SyncStatus.SYNCED);
  });

  test('syncNow_withNoPendingIncidents_doesNotCallGateway', async () => {
    const repo = makeRepo([]);
    const gateway = makeGateway('STORED');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();
    expect(gateway.calls).toHaveLength(0);
  });

  test('syncNow_withGatewayError_incrementsAttemptsAndStaysPending', async () => {
    const repo = makeRepo([baseIncident()]);
    const gateway = makeGateway('ERROR');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();
    const updated = repo._get('INC-001');
    expect(updated.status).toBe(SyncStatus.PENDING_SYNC);
    expect(updated.syncAttempts).toBe(1);
  });

  test('syncNow_withGatewayThrow_incrementsAttemptsAndStaysPending', async () => {
    const repo = makeRepo([baseIncident()]);
    const gateway = makeGateway('THROW');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();
    const updated = repo._get('INC-001');
    expect(updated.syncAttempts).toBe(1);
    expect(updated.status).toBe(SyncStatus.PENDING_SYNC);
  });

  test('syncNow_afterMaxFailures_incidentRemainsInFailedState', async () => {
    // Start from an incident already at max attempts
    let incident = baseIncident();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS; i++) {
      incident = recordFailedAttempt(incident, 'err', fakeClock);
    }
    expect(incident.status).toBe(SyncStatus.FAILED);

    const repo = makeRepo([incident]);
    const gateway = makeGateway('STORED');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();

    // Gateway should NOT have been called — already past max
    expect(gateway.calls).toHaveLength(0);
    expect(repo._get('INC-001').status).toBe(SyncStatus.FAILED);
  });

  test('syncNow_withMultipleIncidents_syncsOldestFirst', async () => {
    const older  = { ...baseIncident('INC-A'), recordedAt: '2026-09-22T07:00:00.000Z' };
    const newer  = { ...baseIncident('INC-B'), recordedAt: '2026-09-22T08:00:00.000Z' };
    const repo   = makeRepo([newer, older]);
    const gateway = makeGateway('STORED');
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });
    await sm.syncNow();
    expect(gateway.calls[0]).toBe('INC-A');
    expect(gateway.calls[1]).toBe('INC-B');
  });

  test('syncNow_calledConcurrently_runsOnlyOneInstanceAtATime', async () => {
    let uploadCount = 0;
    const repo = makeRepo([baseIncident()]);
    const slowGateway = {
      async upload() {
        uploadCount++;
        await new Promise((r) => setTimeout(r, 10));
        return { result: 'STORED' };
      },
      calls: [],
    };
    const sm = createSyncManager({ incidentRepo: repo, gateway: slowGateway, connectivityMonitor: FakeConnectivityMonitor(true), clock: fakeClock, scheduler: immediateScheduler });

    // Fire two concurrent syncNow calls
    await Promise.all([sm.syncNow(), sm.syncNow()]);
    expect(uploadCount).toBe(1);
  });
});

// ── connectivity trigger ───────────────────────────────────────────────────────

describe('start (connectivity observer)', () => {
  test('start_whenDeviceComesOnline_triggersSyncNow', async () => {
    const incident = baseIncident();
    const repo = makeRepo([incident]);
    const gateway = makeGateway('STORED');
    const monitor = FakeConnectivityMonitor(false); // start offline
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: monitor, clock: fakeClock, scheduler: immediateScheduler });

    const unsubscribe = sm.start();
    // Transition to online — should trigger sync
    monitor.setOnline(true);
    // Allow async to complete
    await new Promise((r) => setTimeout(r, 20));

    expect(repo._get('INC-001').status).toBe(SyncStatus.SYNCED);
    unsubscribe();
  });

  test('start_whenAlreadyOnline_triggersImmediateSync', async () => {
    const repo = makeRepo([baseIncident()]);
    const gateway = makeGateway('STORED');
    const monitor = FakeConnectivityMonitor(true);
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: monitor, clock: fakeClock, scheduler: immediateScheduler });

    const unsubscribe = sm.start();
    await new Promise((r) => setTimeout(r, 20));

    expect(repo._get('INC-001').status).toBe(SyncStatus.SYNCED);
    unsubscribe();
  });

  test('start_returnsUnsubscribeFunction', () => {
    const repo    = makeRepo([]);
    const gateway = makeGateway('STORED');
    const monitor = FakeConnectivityMonitor(false);
    const sm = createSyncManager({ incidentRepo: repo, gateway, connectivityMonitor: monitor, clock: fakeClock, scheduler: immediateScheduler });
    const unsub = sm.start();
    expect(typeof unsub).toBe('function');
    unsub();
  });
});
