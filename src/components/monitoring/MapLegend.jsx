import React from 'react';

const ITEMS = [
  { color: '#1d4ed8', type: 'dot',  label: 'Rangers' },
  { color: '#16a34a', type: 'line', label: 'Patrol Routes' },
  { color: '#dc2626', type: 'dot',  label: 'Incidents' },
  { color: '#9333ea', type: 'dot',  label: 'Wildlife' },
  { color: '#f59e0b', type: 'dot',  label: 'Risk Zones', opacity: 0.5 },
];

export default function MapLegend() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.96)', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: '0.75rem', minWidth: 130, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#1B5E20', fontSize: '0.78rem' }}>Legend</div>
      {ITEMS.map(({ color, type, label, opacity = 1 }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <div style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {type === 'dot'
              ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, opacity, border: '1.5px solid rgba(0,0,0,0.15)' }} />
              : <div style={{ width: 18, height: 3, borderRadius: 2, background: color }} />
            }
          </div>
          <span style={{ color: '#374151' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
