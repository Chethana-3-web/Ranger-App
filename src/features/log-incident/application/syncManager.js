/**
 * Log Patrol Incident – Sync Manager
 *
 * Subscribes to connectivity changes. When the device comes online it syncs
 * all PENDING_SYNC incidents oldest-first, one at a time (outbox pattern).
 *
 * Guards against parallel runs with a boolean flag.
 *
 * Patterns: Observer (connectivity → handleConnectivityChange), Outbox.
 */

import { SyncStatus } from '../domain/syncStatus';
import { markSynced, recordFailedAttempt } from '../domain/incident';
import { shouldRetry } from './retryPolicy';

/**
 * @typedef {Object} SyncManagerDeps
 * @property {import('../ports/incidentRepository').IncidentRepository} incidentRepo
 * @property {import('../ports/remoteIncidentGateway').RemoteIncidentGateway} gateway
 * @property {import('../../../core/services/connectivity/ConnectivityMonitor').ConnectivityMonitor} connectivityMonitor
 * @property {{ now: () => number, iso: () => string }} clock
 * @property {(ms: number, fn: () => void) => any} [scheduler]  – injectable setTimeout
 */

/**
 * Create a SyncManager instance.
 *
 * @param {SyncManagerDeps} deps
 * @returns {{ start: () => () => void, syncNow: () => Promise<void> }}
 */
export function createSyncManager(deps) {
  const {
    incidentRepo,
    gateway,
    connectivityMonitor,
    clock,
    scheduler = setTimeout,
  } = deps;

  let _running = false;

  /**
   * Sync all PENDING_SYNC incidents oldest-first.
   * Ignores call if a sync is already in progress.
   *
   * @returns {Promise<void>}
   */
  async function syncNow() {
    if (_running) return;
    _running = true;

    try {
      const pending = await incidentRepo.findByStatus(SyncStatus.PENDING_SYNC);
      // Sort oldest first by recordedAt
      const sorted = [...pending].sort((a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      );

      for (const incident of sorted) {
        await _syncOne(incident);
      }
    } finally {
      _running = false;
    }
  }

  /**
   * Attempt to sync a single incident.
   *
   * @param {import('../domain/incident').Incident} incident
   */
  async function _syncOne(incident) {
    if (!shouldRetry(incident)) {
      // Already at max attempts — ensure status is FAILED
      if (incident.status !== SyncStatus.FAILED) {
        const failed = { ...incident, status: SyncStatus.FAILED };
        await incidentRepo.update(failed);
      }
      return;
    }

    try {
      const response = await gateway.upload(incident);

      if (response.result === 'STORED' || response.result === 'ALREADY_EXISTS') {
        const synced = markSynced(incident, clock.iso());
        await incidentRepo.update(synced);
      } else {
        const failed = recordFailedAttempt(incident, response.error ?? 'Unknown error', clock);
        await incidentRepo.update(failed);
      }
    } catch (err) {
      const failed = recordFailedAttempt(incident, err.message ?? 'Sync error', clock);
      await incidentRepo.update(failed);
    }
  }

  /**
   * Handle connectivity change — trigger sync when coming online.
   *
   * @param {boolean} isOnline
   */
  function handleConnectivityChange(isOnline) {
    if (isOnline) {
      // Defer slightly so the network stack is stable
      scheduler(0, () => syncNow());
    }
  }

  /**
   * Start the SyncManager: subscribe to connectivity.
   *
   * @returns {() => void} unsubscribe function
   */
  function start() {
    const unsubscribe = connectivityMonitor.subscribe(handleConnectivityChange);
    return unsubscribe;
  }

  return { start, syncNow, _isRunning: () => _running };
}

export default { createSyncManager };
