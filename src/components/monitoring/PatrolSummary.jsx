import React from 'react';
import { Route, CheckCircle, UserCheck, Users, WifiOff } from 'lucide-react';

/**
 * PatrolSummary – KPI strip above the map.
 * Values come from getPatrolSummary(parkId) – never hard-coded.
 */
export default function PatrolSummary({ summary }) {
  const cards = [
    { label: 'Active Patrols',    value: summary.activePatrols,    icon: Route,       color: '#1d4ed8', bg: '#dbeafe' },
    { label: 'Completed Today',   value: summary.completedToday,   icon: CheckCircle, color: '#15803d', bg: '#dcfce7' },
    { label: 'Rangers On Patrol', value: summary.rangersOnPatrol,  icon: UserCheck,   color: '#6d28d9', bg: '#ede9fe' },
    { label: 'Rangers Available', value: summary.rangersAvailable, icon: Users,       color: '#0891b2', bg: '#cffafe' },
    { label: 'Offline',           value: summary.rangersOffline,   icon: WifiOff,     color: '#4b5563', bg: '#f3f4f6' },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} style={{
          flex: '1 1 110px', minWidth: 100,
          background: '#fff', border: '1px solid #e5e7eb',
          borderTop: `3px solid ${color}`, borderRadius: 8,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2 }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
