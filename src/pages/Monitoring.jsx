import React, { useState, useCallback } from 'react';
import MonitoringMap from '../components/monitoring/MonitoringMap.jsx';
import MapFilters from '../components/monitoring/MapFilters.jsx';
import PatrolSummary from '../components/monitoring/PatrolSummary.jsx';
import PatrolDetailPanel from '../components/monitoring/PatrolDetailPanel.jsx';
import {
  getParkById,
  getRangersByPark, getPatrolsByPark, getIncidentsByPark,
  getWildlifeByPark, getRiskZonesByPark, getPatrolSummary,
} from '../data/mockData.js';

const SRI_LANKA = { lat: 7.8731, lng: 80.7718 };
const DEFAULT_ZOOM = 8;

/**
 * Monitoring – Member 2's Live Monitoring page (/monitoring).
 *
 * Layout:
 *   Filters bar
 *   Summary KPI strip
 *   Map | Patrol detail panel (when selected)
 *   Park info footer
 */
export default function Monitoring() {
  const [selectedPark,  setSelectedPark]  = useState('ALL');
  const [layers,        setLayers]        = useState({ rangers: true, patrolRoutes: true, incidents: true, wildlife: true, riskZones: true });
  const [patrolStatus,  setPatrolStatus]  = useState('ALL');
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [flyTo, setFlyTo] = useState(null);

  const park    = selectedPark !== 'ALL' ? getParkById(selectedPark) : null;
  const centre  = park ? park.centre : SRI_LANKA;
  const zoom    = park ? park.zoom   : DEFAULT_ZOOM;

  const rangers   = getRangersByPark(selectedPark);
  const allPatrols = getPatrolsByPark(selectedPark);
  const patrols   = patrolStatus === 'ALL' ? allPatrols : allPatrols.filter((p) => p.status === patrolStatus);
  const incidents = getIncidentsByPark(selectedPark);
  const wildlife  = getWildlifeByPark(selectedPark);
  const riskZones = getRiskZonesByPark(selectedPark);
  const summary   = getPatrolSummary(selectedPark);

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
      // nudge lng slightly so flyTo key changes and re-triggers
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

      {/* Map row */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 2px 0', borderTop: '1px solid #e5e7eb', marginTop: 8, flexShrink: 0 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1B5E20' }}>{park.name}</span>
          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{park.area} · {park.region}</span>
          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
            {rangers.length} ranger{rangers.length !== 1 ? 's' : ''} · {patrols.length} patrol{patrols.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
