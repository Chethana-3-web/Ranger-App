/**
 * SyncContext — passes live Firebase sync status up to the Topbar
 * without prop-drilling through DashboardLayout.
 *
 * Usage:
 *   Any page can call useSyncStatus() to read current status,
 *   and setSyncStatus() to update it (e.g. from useFirestoreIncidents).
 */

import React, { createContext, useContext, useState } from 'react';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [syncStatus, setSyncStatus] = useState({
    online:         true,
    lastSynced:     'connecting…',
    pendingRecords: 0,
  });

  return (
    <SyncContext.Provider value={{ syncStatus, setSyncStatus }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncStatus() {
  return useContext(SyncContext);
}
