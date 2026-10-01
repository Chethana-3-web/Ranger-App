import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapLegend from './MapLegend.jsx';
import { getRangerById } from '../../data/mockData.js';

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom marker factories ────────────────────────────────────────────────────

function rangerIcon(status) {
  const color = { 'On Patrol': '#1d4ed8', 'Available': '#15803d', 'Offline': '#6b7280' }[status] ?? '#1d4ed8';
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 28 12 28S28 21 28 12C28 5.37 22.63 0 16 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="16" cy="12" r="5" fill="#fff"/>
      <text x="16" y="16" font-size="7" fill="${color}" text-anchor="middle" font-family="sans-serif" font-weight="bold">R</text>
    </svg>`,
    className: '', iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40],
  });
}

function dotIcon(color, size = 24) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="${color}" stroke="#fff" stroke-width="2.5"/>
      <circle cx="12" cy="12" r="3.5" fill="#fff"/>
    </svg>`,
    className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -(size / 2)],
  });
}

// ── Map fly-to controller ──────────────────────────────────────────────────────

function MapController({ flyTo }) {
  const map = useMap();
  const prevKey = useRef(null);

  useEffect(() => {
    if (!flyTo) return;
    const key = `${flyTo.lat},${flyTo.lng},${flyTo.zoom}`;
    if (prevKey.current === key) return;
    prevKey.current = key;
    map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 14, { animate: true, duration: 1.2 });
  }, [flyTo, map]);

  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────

const INCIDENT_COLORS = { SNARE: '#dc2626', CARCASS: '#7c3aed', TRACKS: '#d97706', CAMPSITE: '#b45309', OTHER: '#374151' };
const WILDLIFE_COLORS = { 'Sri Lankan Elephant': '#9333ea', 'Sri Lankan Leopard': '#c2410c' };

export default function MonitoringMap({
  centre, zoom, rangers, patrols, incidents, wildlife, riskZones,
  layers, selectedPatrolId, onPatrolSelect, flyTo,
}) {
  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #d1d5db' }}>
      <MapContainer center={[centre.lat, centre.lng]} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController flyTo={flyTo} />

        {/* Rangers */}
        {layers.rangers && rangers.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={rangerIcon(r.status)}>
            <Popup>
              <div className="popup-title">{r.name}</div>
              <div className="popup-row"><span className="popup-label">Ranger ID</span><span className="popup-value">{r.id}</span></div>
              <div className="popup-row">
                <span className="popup-label">Status</span>
                <span className="popup-value" style={{ color: r.status === 'Offline' ? '#6b7280' : r.status === 'On Patrol' ? '#6d28d9' : '#15803d', fontWeight: 700 }}>
                  {r.status === 'Offline' ? `Offline — Last seen ${r.lastUpdated}` : r.status}
                </span>
              </div>
              <div className="popup-row"><span className="popup-label">Patrol Route</span><span className="popup-value">{r.patrolRouteId ?? '—'}</span></div>
              <div className="popup-row"><span className="popup-label">Last Updated</span><span className="popup-value">{r.lastUpdated}</span></div>
              <div className="popup-row">
                <span className="popup-label">Sync</span>
                <span className="popup-value" style={{ color: r.syncStatus === 'synced' ? '#15803d' : r.syncStatus === 'offline' ? '#6b7280' : '#a16207' }}>
                  {r.syncStatus === 'synced' ? '✓ Synced' : r.syncStatus === 'offline' ? `Offline — Last seen ${r.lastUpdated}` : '⏳ Pending'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Patrol routes */}
        {layers.patrolRoutes && patrols.map((p) => {
          const isSelected = p.id === selectedPatrolId;
          const color = p.status === 'Completed' ? '#1d4ed8' : p.status === 'Offline' ? '#6b7280' : '#16a34a';
          return (
            <Polyline key={p.id} positions={p.coordinates}
              pathOptions={{ color: isSelected ? '#f59e0b' : color, weight: isSelected ? 5 : 3, opacity: p.status === 'Completed' ? 0.6 : 0.9, dashArray: p.status === 'Completed' ? '6 4' : undefined }}
              eventHandlers={{ click: () => onPatrolSelect(p) }}
            >
              <Popup>
                <div className="popup-title">{p.routeName}</div>
                <div className="popup-row"><span className="popup-label">Patrol ID</span><span className="popup-value">{p.id}</span></div>
                <div className="popup-row"><span className="popup-label">Status</span><span className="popup-value">{p.status}</span></div>
                <div className="popup-row"><span className="popup-label">Ranger</span><span className="popup-value">{p.rangerId ? (getRangerById(p.rangerId)?.name ?? p.rangerId) : '—'}</span></div>
                <div className="popup-row"><span className="popup-label">Coverage</span><span className="popup-value">{p.coverage}%</span></div>
                <div className="popup-row"><span className="popup-label">Time</span><span className="popup-value">{p.startTime} – {p.expectedEndTime}</span></div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => onPatrolSelect(p)}>View Details</button>
              </Popup>
            </Polyline>
          );
        })}

        {/* Incidents */}
        {layers.incidents && incidents.map((inc) => (
          <Marker key={inc.id} position={[inc.latitude, inc.longitude]} icon={dotIcon(INCIDENT_COLORS[inc.type] ?? '#dc2626')}>
            <Popup>
              <div className="popup-title">{inc.label}</div>
              <div className="popup-row"><span className="popup-label">ID</span><span className="popup-value">{inc.id}</span></div>
              <div className="popup-row"><span className="popup-label">Severity</span><span className="popup-value" style={{ color: inc.severity === 'Critical' ? '#dc2626' : inc.severity === 'High' ? '#d97706' : '#374151', fontWeight: 700 }}>{inc.severity}</span></div>
              <div className="popup-row"><span className="popup-label">Status</span><span className="popup-value">{inc.status}</span></div>
              <div className="popup-row"><span className="popup-label">Reported by</span><span className="popup-value">{inc.reportedBy}</span></div>
              <div className="popup-row" style={{ marginTop: 4 }}><span className="popup-label">{inc.description}</span></div>
            </Popup>
          </Marker>
        ))}

        {/* Wildlife */}
        {layers.wildlife && wildlife.map((w) => (
          <Marker key={w.id} position={[w.latitude, w.longitude]} icon={dotIcon(WILDLIFE_COLORS[w.species] ?? '#9333ea')}>
            <Popup>
              <div className="popup-title">{w.name}</div>
              <div className="popup-row"><span className="popup-label">Species</span><span className="popup-value">{w.species}</span></div>
              <div className="popup-row"><span className="popup-label">Collar ID</span><span className="popup-value">{w.collarId}</span></div>
              <div className="popup-row"><span className="popup-label">Status</span><span className="popup-value" style={{ color: w.status === 'Alert' ? '#dc2626' : '#15803d', fontWeight: 700 }}>{w.status}</span></div>
              <div className="popup-row"><span className="popup-label">Zone</span><span className="popup-value">{w.zone}</span></div>
              <div className="popup-row"><span className="popup-label">Last Update</span><span className="popup-value">{w.lastUpdate}</span></div>
            </Popup>
          </Marker>
        ))}

        {/* Risk zones */}
        {layers.riskZones && riskZones.map((z) => (
          <Circle key={z.id} center={[z.centre.lat, z.centre.lng]} radius={z.radius}
            pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.15, weight: 2, dashArray: '5 5' }}
          >
            <Popup>
              <div className="popup-title">{z.name}</div>
              <div className="popup-row"><span className="popup-label">Type</span><span className="popup-value">{z.type}</span></div>
              <div className="popup-row"><span className="popup-label">Risk Level</span><span className="popup-value" style={{ color: z.riskLevel === 'High' ? '#dc2626' : z.riskLevel === 'Medium' ? '#d97706' : '#15803d', fontWeight: 700 }}>{z.riskLevel}</span></div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div style={{ position: 'absolute', bottom: 28, right: 10, zIndex: 1000 }}>
        <MapLegend />
      </div>
    </div>
  );
}
