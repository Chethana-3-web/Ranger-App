import React, { useState, useCallback, useEffect } from 'react';
import MonitoringMap from '../components/monitoring/MonitoringMap.jsx';
import MapFilters from '../components/monitoring/MapFilters.jsx';
import PatrolSummary from '../components/monitoring/PatrolSummary.jsx';
import PatrolDetailPanel from '../components/monitoring/PatrolDetailPanel.jsx';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents.js';
import { useSyncStatus } from '../context/SyncContext.jsx';
import {
  getParkById,
  getRangersByPark, getPatrolsByPark,
  getWildlifeByPark, getRiskZonesByPark, getPatrolSummary,
} from '../data/mockData.js';

const SRI_LANKA  = { lat: 7.8731, lng: 80.7718 };
const DEFAULT_ZOOM = 8;

/**
 * Monitoring – Member 2's Live Monitoring page (/monitoring).
 *
 * Data sources:
 *   Incidents  → Firestore (live, written by mobile app)
 *   Rangers    → mockData.js (until mobile app writes GPS to Firestore)
 *   Patrols    → mockData.js
 *   Wildlife   → mockData.js
 *   Risk zones → mockData.js
 */
export default function Monitoring() {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [selectedPark,   setSelectedPark]   = useState('ALL');
  const [layers,         setLayers]         = useState({
    rangers: true, patrolRoutes: true, incidents: true, wildlife: true, riskZones: true,
  });
  const [patrolStatus,   setPatrolStatus]   = useState('ALL');
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [flyTo,          setFlyTo]          = useState(null);

  // ── Live Firestore incidents ───────────────────────────────────────────────
  const { incidents: firestoreIncidents, loading, error, syncStatus } = useFirestoreIncidents();

  // Push live sync status up to the shared Topbar
  const { setSyncStatus } = useSyncStatus();
  useEffect(() => {
    setSyncStatus(syncStatus);
  }, [syncStatus, setSyncStatus]);

  // ── Filter incidents by selected park ─────────────────────────────────────
  const incidents = selectedPark === 'ALL'
    ? firestoreIncidents
    : firestoreIncidents.filter((i) => i.parkId === selectedPark);

  // ── Mock data (rangers / patrols / wildlife / risk zones) ─────────────────
  const park      = selectedPark !== 'ALL' ? getParkById(selectedPark) : null;
  const centre    = park ? park.centre : SRI_LANKA;
  const zoom      = park ? park.zoom   : DEFAULT_ZOOM;

  const rangers   = getRangersByPark(selectedPark);
  const allPatrols = getPatrolsByPark(selectedPark);
  const patrols   = patrolStatus === 'ALL'
    ? allPatrols
    : allPatrols.filter((p) => p.status === patrolStatus);
  const wildlife  = getWildlifeByPark(selectedPark);
  const riskZones = getRiskZonesByPark(selectedPark);
  const summary   = getPatrolSummary(selectedPark);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLayerToggle = useCallback((key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleParkChange = useCallback((id) => {
    setSelectedPark(id);
    setSelectedPatrol(null);
    setFlyTo(null);
  }, []);

  const handlePatrolSelect = useCallback((patrol) => {
    setSelectedPatrol(patrol);
    if (patrol.coordinates?.length) {
      const mid = patrol.coordinates[Math.floor(patrol.coordinates.length / 2)];
      setFlyTo({ lat: mid[0], lng: mid[1], zoom: 13 });
    }
  }, []);

  const handleViewRoute = useCallback((patrol) => {
    if (patrol.coordinates?.length) {
      const mid = patrol.coordinates[Math.floor(patrol.coordinates.length / 2)];
      setFlyTo({ lat: mid[0], lng: mid[1] + 0.0001, zoom: 13 });
    }
  }, []);

  const handleCenterRanger = useCallback((ranger) => {
    setFlyTo({ lat: ranger.latitude, lng: ranger.longitude, zoom: 14 });
  }, []);

  const mapCentre = flyTo ? { lat: flyTo.lat, lng: flyTo.lng } : centre;
  const mapZoom   = flyTo ? (flyTo.zoom ?? zoom) : zoom;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 16px', overflow: 'hidden', gap: 0 }}>

      <MapFilters
        selectedPark={selectedPark}
        onParkChange={handleParkChange}
        layers={layers}
        onLayerToggle={handleLayerToggle}
        patrolStatus={patrolStatus}
        onPatrolStatusChange={setPatrolStatus}
      />

      <PatrolSummary summary={summary} />

      {/* Incident data source badge */}
      <div style={styles.sourceBadge}>
        {loading && <span style={styles.badgeLoading}>⏳ Connecting to Firestore…</span>}
        {!loading && error && (
          <span style={styles.badgeError}>
            ⚠ Firestore unavailable — showing mock incidents
          </span>
        )}
        {!loading && !error && (
          <span style={styles.badgeLive}>
            🔴 Live · {incidents.length} incident{incidents.length !== 1 ? 's' : ''} from Firestore
          </span>
        )}
      </div>

      {/* Map + optional patrol detail panel */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        <MonitoringMap
          centre={mapCentre}
          zoom={mapZoom}
          rangers={rangers}
          patrols={patrols}
          incidents={incidents}
          wildlife={wildlife}
          riskZones={riskZones}
          layers={layers}
          selectedPatrolId={selectedPatrol?.id ?? null}
          onPatrolSelect={handlePatrolSelect}
          flyTo={flyTo}
        />

        {selectedPatrol && (
          <div style={{ width: 260, flexShrink: 0, overflowY: 'auto' }}>
            <PatrolDetailPanel
              patrol={selectedPatrol}
              onClose={() => setSelectedPatrol(null)}
              onViewRoute={handleViewRoute}
              onCenterRanger={handleCenterRanger}
            />
          </div>
        )}
      </div>

      {/* Park footer */}
      {park && (
        <div style={styles.parkFooter}>
          <span style={styles.parkName}>{park.name}</span>
          <span style={styles.parkMeta}>{park.area} · {park.region}</span>
          <span style={styles.parkMeta}>
            {rangers.length} ranger{rangers.length !== 1 ? 's' : ''} ·{' '}
            {patrols.length} patrol{patrols.length !== 1 ? 's' : ''} ·{' '}
            {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

const styles = {
  sourceBadge: {
    marginBottom: 8,
    fontSize: '0.72rem',
    height: 22,
    display: 'flex',
    alignItems: 'center',
  },
  badgeLoading: {
    color: '#a16207',
    background: '#fef9c3',
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid #fde68a',
  },
  badgeError: {
    color: '#991b1b',
    background: '#fee2e2',
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid #fca5a5',
  },
  badgeLive: {
    color: '#15803d',
    background: '#dcfce7',
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid #bbf7d0',
    fontWeight: 600,
  },
  parkFooter: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '6px 2px 0', borderTop: '1px solid #e5e7eb',
    marginTop: 8, flexShrink: 0,
  },
  parkName: { fontSize: '0.78rem', fontWeight: 700, color: '#1B5E20' },
  parkMeta: { fontSize: '0.72rem', color: '#6b7280' },
};
