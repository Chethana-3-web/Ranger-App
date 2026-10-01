import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';

/**
 * SyncStatusChip – displays sync/connectivity status in the topbar.
 * Dashboard only DISPLAYS status; real sync lives in the mobile app.
 */
export default function SyncStatusChip({ status }) {
  if (!status) return null;
  if (!status.online) return (
    <div className="sync-chip offline"><WifiOff size={11} /><span>Offline</span></div>
  );
  if (status.pendingRecords > 0) return (
    <div className="sync-chip pending"><Clock size={11} /><span>Pending sync: {status.pendingRecords} records</span></div>
  );
  return (
    <div className="sync-chip online"><Wifi size={11} /><span>Online · Synced {status.lastSynced}</span></div>
  );
}
