import React from 'react';
import { Route, CheckCircle, UserCheck, Users, WifiOff, AlertTriangle } from 'lucide-react';

/**
 * PatrolSummary – KPI strip above the map.
 * Values come from getPatrolSummary(parkId) — never hard-coded.
 * incidentCount is live from Firestore (passed in from Monitoring.jsx).
 *
 * @param {{
 *   summary: object,
 *   incidentCount: number,
 *   incidentLoading: boolean,
 * }} props
 */
export default function PatrolSummary({ summary, incidentCount = 0, incidentLoading = false }) {
  const cards = [
    {
      label: 'Active Patrols',
      value: summary.activePatrols,
      icon: Route,
      color: '#1d4ed8',
      bg: '#dbeafe',
    },
    {
      label: 'Completed Today',
      value: summary.completedToday,
      icon: CheckCircle,
      color: '#15803d',
      bg: '#dcfce7',
    },
    {
      label: 'Rangers On Patrol',
      value: summary.rangersOnPatrol,
      icon: UserCheck,
      color: '#6d28d9',
      bg: '#ede9fe',
    },
    {
      label: 'Rangers Available',
      value: summary.rangersAvailable,
      icon: Users,
      color: '#0891b2',
      bg: '#cffafe',
    },
    {
      label: 'Offline',
      value: summary.rangersOffline,
      icon: WifiOff,
      color: '#4b5563',
      bg: '#f3f4f6',
    },
    {
      label: 'Incidents (Live)',
      value: incidentLoading ? '…' : incidentCount,
      icon: AlertTriangle,
      color: '#dc2626',
      bg: '#fee2e2',
      live: true,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
      {cards.map(({ label, value, icon: Icon, color, bg, live }) => (
        <div
          key={label}
          style={{
            flex: '1 1 100px',
            minWidth: 95,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderTop: `3px solid ${color}`,
            borderRadius: 8,
            padding: '9px 11px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: bg,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={15} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.1, color: '#1a1a1a' }}>
              {value}
            </div>
            <div style={{ fontSize: '0.67rem', color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              {label}
              {live && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }} title="Live from Firestore" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
