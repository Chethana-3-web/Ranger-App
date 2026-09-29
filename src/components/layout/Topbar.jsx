import React from 'react';
import { useLocation } from 'react-router-dom';
import SyncStatusChip from '../monitoring/SyncStatusChip.jsx';
import { SYNC_STATUS } from '../../data/mockData.js';

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

export default function Topbar() {
  const { pathname } = useLocation();
  return (
    <header className="topbar">
      <span className="topbar-title">{TITLES[pathname] ?? 'Dashboard'}</span>
      <div className="topbar-right">
        <SyncStatusChip status={SYNC_STATUS} />
        {/* Member 1: add user avatar / notification bell here */}
      </div>
    </header>
  );
}
