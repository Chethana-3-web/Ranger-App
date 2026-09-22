/**
 * Log Patrol Incident – Feature Entry Point
 *
 * Registers the Home tile (with pending-count badge) in the feature registry
 * and wires all services into the DI container.
 *
 * Call registerLogIncidentFeature(container, kvStore, connectivityMonitor)
 * once during app startup from src/app/App.js.
 */

import { AsyncStorageIncidentRepository } from './infrastructure/asyncStorageIncidentRepository';
import { AsyncStorageDraftRepository } from './infrastructure/asyncStorageDraftRepository';
import { MockRemoteGateway } from './infrastructure/mockRemoteGateway';
import { GpsLocationProvider } from './infrastructure/gpsLocationProvider';
import { ExpoCameraProvider } from './infrastructure/expoCameraProvider';
import { ExpoPhotoStore } from './infrastructure/expoPhotoStore';
import { createSyncManager } from './application/syncManager';
import { DefaultClock } from '../../core/services/clock';
import { DefaultIdGenerator } from '../../core/services/idGenerator';
import { SyncStatus } from './domain/syncStatus';

/** Route name for the feature's entry screen */
export const LOG_INCIDENT_ROUTE = 'LogIncidentFlow';

/**
 * Register the Log Incident feature into the DI container.
 * Returns the SyncManager unsubscribe function for cleanup.
 *
 * @param {import('../../core/di/container').DIContainer} container
 * @param {import('../../core/services/storage/KeyValueStore').KeyValueStore} kvStore
 * @param {import('../../core/services/connectivity/ConnectivityMonitor').ConnectivityMonitor} connectivityMonitor
 * @returns {{ unsubscribe: () => void, getPendingCount: () => Promise<number> }}
 */
export function registerLogIncidentFeature(container, kvStore, connectivityMonitor) {
  const incidentRepo = AsyncStorageIncidentRepository(kvStore);
  const draftRepo    = AsyncStorageDraftRepository(kvStore);
  const gateway      = MockRemoteGateway();
  const photoStore   = ExpoPhotoStore();

  container.singleton('log-incident.incidentRepo',      incidentRepo);
  container.singleton('log-incident.draftRepo',         draftRepo);
  container.singleton('log-incident.gateway',           gateway);
  container.singleton('log-incident.gpsProvider',       GpsLocationProvider());
  container.singleton('log-incident.cameraProvider',    ExpoCameraProvider());
  container.singleton('log-incident.photoStore',        photoStore);
  container.singleton('log-incident.clock',             DefaultClock);
  container.singleton('log-incident.idGenerator',       DefaultIdGenerator);
  container.singleton('log-incident.connectivityMonitor', connectivityMonitor);

  const syncManager = createSyncManager({
    incidentRepo,
    gateway,
    connectivityMonitor,
    clock: DefaultClock,
  });

  const unsubscribe = syncManager.start();

  /** @returns {Promise<number>} */
  async function getPendingCount() {
    const pending = await incidentRepo.findByStatus(SyncStatus.PENDING_SYNC);
    return pending.length;
  }

  return { unsubscribe, getPendingCount };
}

export default { registerLogIncidentFeature, LOG_INCIDENT_ROUTE };
