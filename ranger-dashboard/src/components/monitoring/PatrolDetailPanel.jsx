import React from 'react';
import { X, Navigation, User, Clock, CheckSquare, MapPin } from 'lucide-react';
import { getRangerById } from '../../data/mockData.js';

/**
 * PatrolDetailPanel – slide-in card shown when a patrol route is selected.
 */
export default function PatrolDetailPanel({ patrol, onClose, onViewRoute, onCenterRanger }) {
  if (!patrol) return null;

  const ranger = patrol.rangerId ? getRangerById(patrol.rangerId) : null;

  const statusColors = {
    Active:    { bg: '#dcfce7', text: '#15803d' },
    Completed: { bg: '#dbeafe', text: '#1d4ed8' },
    Offline:   { bg: '#f3f4f6', text: '#4b5563' },
  };
  const sc = statusColors[patrol.status] ?? { bg: '#f3f4f6', text: '#4b5563' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{patrol.id}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1B5E20', lineHeight: 1.3, maxWidth: 170 }}>{patrol.routeName}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, borderRadius: 4, display: 'flex' }}>
          <X size={15} />
        </button>
      </div>

      {/* Status */}
      <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, marginBottom: 10, background: sc.bg, color: sc.text }}>
        {patrol.status}
      </div>

      {/* Details */}
      <div style={{ marginBottom: 12 }}>
        <Row icon={User}        label="Ranger"    value={ranger?.name ?? '—'} />
        <Row icon={Clock}       label="Started"   value={patrol.startTime} />
        <Row icon={Clock}       label="Exp. End"  value={patrol.expectedEndTime} />
        <Row icon={CheckSquare} label="Coverage"  value={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${patrol.coverage}%`, background: patrol.coverage >= 80 ? '#16a34a' : patrol.coverage >= 50 ? '#f59e0b' : '#dc2626' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 30 }}>{patrol.coverage}%</span>
          </div>
        } />
        {ranger && (
          <Row icon={MapPin} label="Status" value={
            <span style={{ color: ranger.status === 'Offline' ? '#6b7280' : ranger.status === 'On Patrol' ? '#6d28d9' : '#15803d', fontWeight: 600 }}>
              {ranger.status === 'Offline' ? `Offline — Last seen ${ranger.lastUpdated}` : ranger.status}
            </span>
          } />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={() => onViewRoute(patrol)}>
          <Navigation size={13} /> View Route
        </button>
        {ranger && ranger.status !== 'Offline' && (
          <button className="btn btn-secondary btn-sm" onClick={() => onCenterRanger(ranger)}>
            <MapPin size={13} /> Center on Ranger
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
      <Icon size={13} color="#6b7280" style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: '0.75rem', color: '#6b7280', minWidth: 78, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: '#1a1a1a', fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  );
}
