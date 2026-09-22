/**
 * Log Patrol Incident – Sync Status Enum
 *
 * Represents the lifecycle of an incident's remote synchronisation.
 *
 * PENDING_SYNC → SYNCED      (successful upload)
 * PENDING_SYNC → FAILED      (max retry attempts reached)
 * FAILED       → PENDING_SYNC (manual retry reset)
 */

/** @type {{ PENDING_SYNC: string, SYNCED: string, FAILED: string }} */
export const SyncStatus = Object.freeze({
  PENDING_SYNC: 'PENDING_SYNC',
  SYNCED:       'SYNCED',
  FAILED:       'FAILED',
});

/**
 * Human-readable labels for sync status chips.
 */
export const SYNC_STATUS_LABELS = Object.freeze({
  PENDING_SYNC: 'Pending Sync',
  SYNCED:       'Synced',
  FAILED:       'Failed',
});

/**
 * Check whether a sync status value is valid.
 *
 * @param {string} status
 * @returns {boolean}
 */
export function isValidSyncStatus(status) {
  return Object.prototype.hasOwnProperty.call(SyncStatus, status);
}

export default SyncStatus;
