import React from 'react';
import { Filter } from 'lucide-react';
import { PARKS } from '../../data/mockData.js';

const LAYER_LABELS = {
  rangers:      'Rangers',
  patrolRoutes: 'Patrol Routes',
  incidents:    'Incidents',
  wildlife:     'Wildlife',
  riskZones:    'Risk Zones',
};

export default function MapFilters({ selectedPark, onParkChange, layers, onLayerToggle, patrolStatus, onPatrolStatusChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>

      {/* Park selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Park</label>
        <select value={selectedPark} onChange={(e) => onParkChange(e.target.value)} style={selectStyle}>
          <option value="ALL">All Parks</option>
          {PARKS.map((p) => <option key={p.id} value={p.id}>{p.shortName}</option>)}
        </select>
      </div>

      <div style={divider} />

      {/* Layer toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={12} /> Layers
        </label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(LAYER_LABELS).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#374151', cursor: 'pointer', userSelect: 'none', gap: 4 }}>
              <input type="checkbox" checked={layers[key]} onChange={() => onLayerToggle(key)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* Patrol status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Patrol Status</label>
        <select value={patrolStatus} onChange={(e) => onPatrolStatusChange(e.target.value)} style={selectStyle}>
          <option value="ALL">All</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Offline">Offline</option>
        </select>
      </div>
    </div>
  );
}

const selectStyle = {
  fontSize: '0.78rem', padding: '4px 24px 4px 8px', borderRadius: 6,
  border: '1px solid #d1d5db', background: '#f9fafb', color: '#1a1a1a',
  cursor: 'pointer', appearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
};

const divider = { width: 1, height: 24, background: '#e5e7eb', flexShrink: 0 };
