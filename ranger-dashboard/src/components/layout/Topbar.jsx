import React from 'react';
import { useLocation } from 'react-router-dom';
import SyncStatusChip from '../monitoring/SyncStatusChip.jsx';
import { useSyncStatus } from '../../context/SyncContext.jsx';

const TITLES = {
  '/dashboard':  'Dashboard Overview',
  '/monitoring': 'Live Monitoring',
  '/incidents':  'Incidents',
  '/community':  'Community Reports',
  '/wildlife':   'Wildlife',
  '/alerts':     'Alerts',
  '/analytics':  'Analytics',
  '/reports':    'Reports',
};

/**
 * Topbar – reads live sync status from SyncContext (updated by Monitoring page).
 * Member 1: add user avatar / notification bell in topbar-right.
 */
export default function Topbar() {
  const { pathname }    = useLocation();
  const { syncStatus }  = useSyncStatus();

  return (
    <header className="topbar">
      <span className="topbar-title">{TITLES[pathname] ?? 'Dashboard'}</span>
      <div className="topbar-right">
        <SyncStatusChip status={syncStatus} />
      </div>
    </header>
  );
}
