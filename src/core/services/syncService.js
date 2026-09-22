/**
 * Ranger App – Sync Service
 *
 * Uploads pending/failed incidents to the server when connectivity is available.
 * The server is mocked in this prototype – the upload function simulates a
 * successful API call.
 *
 * This service is called from the App root on network-status change and on a
 * periodic timer.
 */

import NetInfo from '@react-native-community/netinfo';
import { getPendingIncidents, markSynced, markFailed } from './incidentService';
import apiConfig from '../config/apiConfig';

// ── Mock server upload ─────────────────────────────────────────────────────────

/**
 * Simulated server upload.
 * Replace the body of this function with a real axios/fetch call
 * when a backend is available.
 *
 * @param {import('./incidentService').IncidentRecord} incident
 * @returns {Promise<void>}
 */
async function uploadToServer(incident) {
  // Mock: randomly succeed 90% of the time to test retry logic
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (Math.random() < 0.1) {
    throw new Error('Mock server error');
  }
  console.log(`[syncService] Uploaded incident ${incident.id}`);
}

// ── Sync logic ─────────────────────────────────────────────────────────────────

/**
 * Check connectivity and upload all pending incidents.
 * Safe to call repeatedly – exits early if offline.
 *
 * @returns {Promise<{ uploaded: number, failed: number }>}
 */
export async function syncPendingIncidents() {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    console.log('[syncService] Offline – skipping sync');
    return { uploaded: 0, failed: 0 };
  }

  const pending = await getPendingIncidents(apiConfig.SYNC_RETRY_LIMIT);
  let uploaded = 0;
  let failed   = 0;

  for (const incident of pending) {
    try {
      await uploadToServer(incident);
      await markSynced(incident.id);
      uploaded++;
    } catch {
      await markFailed(incident.id);
      failed++;
    }
  }

  return { uploaded, failed };
}

/**
 * Subscribe to connectivity changes and trigger a sync on reconnect.
 *
 * @returns {function} unsubscribe function – call on component unmount
 */
export function subscribeToConnectivitySync() {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncPendingIncidents().catch((err) =>
        console.error('[syncService] Background sync error:', err)
      );
    }
  });
}
