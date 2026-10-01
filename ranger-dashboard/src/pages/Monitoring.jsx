import React, { useState, useCallback, useEffect } from 'react';
import MonitoringMap from '../components/monitoring/MonitoringMap.jsx';
import MapFilters from '../components/monitoring/MapFilters.jsx';
import PatrolSummary from '../components/monitoring/PatrolSummary.jsx';
import PatrolDetailPanel from '../components/monitoring/PatrolDetailPanel.jsx';
import IncidentListPanel from '../components/monitoring/IncidentListPanel.jsx';
import { useFirestoreIncidents } from '../hooks/useFirestoreIncidents.js';
import { useSyncStatus } from '../context/SyncContext.jsx';
import {
  getParkById,
  getRangersByPark, getPatrolsByPark,
  getWildlifeByPark, getRiskZonesByPark, getPatrolSummary,
} from '../data/mockData.js';

const SRI_LANKA    = { lat: 7.8731, lng: 80.7718 };
const DEFAULT_ZOOM = 8;

/**
 * Monitoring – Member 2's Live Monitoring page (/monitoring).
 *
 * Layout:
 *   Filters bar
 *   KPI summary strip  (patrol stats + live incident count from Firestore)
 *   ┌──────────────────────────────┬──────────────┐
 *   │  Leaflet map                 │  Patrol panel│  ← only when patrol selected
 *   ├──────────────────────────────┴──────────────┤
 *   │  Incident list (live Firestore)              │
 *   └──────────────────────────────────────────────┘
 *   Park footer
 *
 * Data sources:
 *   Incidents  → Firestore (live, written by mobile app)
 *   Rangers, Patrols, Wildlife, Risk zones → mockData.js
 */
export default function Monitoring() {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [selectedPark,    setSelectedPark]    = useState('ALL');
  const [layers,          setLayers]          = useState({
    rangers: true, patrolRoutes: true, incidents: true, wildlife: true, riskZones: true,
  });
  const [patrolStatus,    setPatrolStatus]    = useState('ALL');
  const [selectedPatrol,  setSelectedPatrol]  = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [flyTo,           setFlyTo]           = useState(null);

  // ── Live Firestore incidents ───────────────────────────────────────────────
  const { incidents: allFirestoreIncidents, loading, error, syncStatus } = useFirestoreIncidents();

  // Push sync status to shared Topbar context
  const { setSyncStatus } = useSyncStatus();
  useEffect(() => { setSyncStatus(syncStatus); }, [syncStatus, setSyncStatus]);

  // Filter incidents by selected park
  const incidents = selectedPark === 'ALL'
    ? allFirestoreIncidents
    : allFirestoreIncidents.filter((i) => i.parkId === selectedPark);

  // ── Mock data ──────────────────────────────────────────────────────────────
  const park      = selectedPark !== 'ALL' ? getParkById(selectedPark) : null;
  const centre    = park ? park.centre : SRI_LANKA;
  const zoom      = park ? park.zoom   : DEFAULT_ZOOM;

  const rangers    = getRangersByPark(selectedPark);
  const allPatrols = getPatrolsByPark(selectedPark);
  const patrols    = patrolStatus === 'ALL'
    ? allPatrols
    : allPatrols.filter((p) => p.status === patrolStatus);
  const wildlife   = getWildlifeByPark(selectedPark);
  const riskZones  = getRiskZonesByPark(selectedPark);
  const summary    = getPatrolSummary(selectedPark);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLayerToggle = useCallback((key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleParkChange = useCallback((id) => {
    setSelectedPark(id);
    setSelectedPatrol(null);
    setSelectedIncident(null);
    setFlyTo(null);
  }, []);

  const handlePatrolSelect = useCallback((patrol) => {
    setSelectedPatrol(patrol);
    setSelectedIncident(null);
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

  // Clicking an incident in the list flies the map to it
  const handleIncidentSelect = useCallback((inc) => {
    setSelectedIncident(inc.id === selectedIncident ? null : inc.id);
    if (inc.latitude && inc.longitude) {
      setFlyTo({ lat: inc.latitude, lng: inc.longitude, zoom: 15 });
    }
  }, [selectedIncident]);

  const mapCentre = flyTo ? { lat: flyTo.lat, lng: flyTo.lng } : centre;
  const mapZoom   = flyTo ? (flyTo.zoom ?? zoom) : zoom;

  return (
    <div style={styles.page}>

      {/* Filters */}
      <MapFilters
        selectedPark={selectedPark}
        onParkChange={handleParkChange}
        layers={layers}
        onLayerToggle={handleLayerToggle}
        patrolStatus={patrolStatus}
        onPatrolStatusChange={setPatrolStatus}
      />

      {/* KPI summary — includes live incident count */}
      <PatrolSummary
        summary={summary}
        incidentCount={incidents.length}
        incidentLoading={loading}
      />

      {/* Source badge */}
      <div style={styles.sourceBadge}>
        {loading && <span style={styles.badge.loading}>⏳ Connecting to Firestore…</span>}
        {!loading && error && <span style={styles.badge.error}>⚠ Firestore unavailable — showing mock incidents</span>}
        {!loading && !error && (
          <span style={styles.badge.live}>
            🔴 Live · {incidents.length} incident{incidents.length !== 1 ? 's' : ''} from Firestore
          </span>
        )}
      </div>

      {/* Map row */}
      <div style={styles.mapRow}>
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

        {/* Patrol detail panel — shown when a patrol is selected */}
        {selectedPatrol && (
          <div style={styles.sidePanel}>
            <PatrolDetailPanel
              patrol={selectedPatrol}
              onClose={() => setSelectedPatrol(null)}
              onViewRoute={handleViewRoute}
              onCenterRanger={handleCenterRanger}
            />
          </div>
        )}
      </div>

      {/* Live incident list panel */}
      <div style={styles.incidentRow}>
        <IncidentListPanel
          incidents={incidents}
          loading={loading}
          selectedId={selectedIncident}
          onSelect={handleIncidentSelect}
        />
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
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '12px 16px',
    overflow: 'hidden',
    gap: 0,
  },
  sourceBadge: {
    marginBottom: 8,
    fontSize: '0.72rem',
    height: 22,
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    loading: { color: '#a16207', background: '#fef9c3', padding: '2px 10px', borderRadius: 999, border: '1px solid #fde68a' },
    error:   { color: '#991b1b', background: '#fee2e2', padding: '2px 10px', borderRadius: 999, border: '1px solid #fca5a5' },
    live:    { color: '#15803d', background: '#dcfce7', padding: '2px 10px', borderRadius: 999, border: '1px solid #bbf7d0', fontWeight: 600 },
  },
  // Map takes ~55% of remaining height, incident list ~40%
  mapRow: {
    flex: '0 0 auto',
    height: '46vh',
    display: 'flex',
    gap: 12,
    minHeight: 0,
    marginBottom: 10,
  },
  sidePanel: {
    width: 255,
    flexShrink: 0,
    overflowY: 'auto',
  },
  incidentRow: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  parkFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '5px 2px 0',
    borderTop: '1px solid #e5e7eb',
    marginTop: 6,
    flexShrink: 0,
  },
  parkName: { fontSize: '0.78rem', fontWeight: 700, color: '#1B5E20' },
  parkMeta: { fontSize: '0.72rem', color: '#6b7280' },
};
