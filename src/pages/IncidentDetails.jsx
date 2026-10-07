import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents.js';
import { useRangers } from '../hooks/useRangers.js';
import { getParkById, getRangerById } from '../data/mockData.js';
import {
  WORKFLOW_STEPS, SEVERITIES, updateIncidentWorkflow,
} from '../services/incidentWorkflowService.js';
import SeverityChip from '../components/incidents/SeverityChip.jsx';
import StatusChip from '../components/incidents/StatusChip.jsx';
import WorkflowTracker from '../components/incidents/WorkflowTracker.jsx';

// Fix Leaflet default icon broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const markerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="#dc2626" stroke="#fff" stroke-width="2.5"/>
    <circle cx="12" cy="12" r="3.5" fill="#fff"/>
  </svg>`,
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function getPhotoUrl(incident) {
  const candidate = incident.photoUrl ?? incident.photoUri;
  return /^(https?:|data:)/.test(candidate ?? '') ? candidate : null;
}

export default function IncidentDetails() {
  const { id } = useParams();
  const { incidents, loading } = useIncidents();
  const { rangers, loading: rangersLoading } = useRangers();
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const incident = incidents.find((i) => i.id === id);

  if (loading) {
    return <div style={styles.center}>Loading incident…</div>;
  }

  if (!incident) {
    return (
      <div style={styles.center}>
        <p>No incident found with ID &ldquo;{id}&rdquo;.</p>
        <Link to="/incidents" className="btn btn-secondary">Back to incidents</Link>
      </div>
    );
  }

  const park = getParkById(incident.parkId);
  const findRanger = (rid) => rangers.find((r) => r.id === rid) ?? getRangerById(rid);
  const reporter   = findRanger(incident.reportedBy);
  const assigned   = findRanger(incident.assignedRangerId);
  const isAssignedListed = rangers.some((r) => r.id === incident.assignedRangerId);
  const photoUrl   = getPhotoUrl(incident);
  const hasLocation = typeof incident.latitude === 'number' && typeof incident.longitude === 'number';
  const stepIndex  = WORKFLOW_STEPS.indexOf(incident.workflowStatus);
  const nextStep   = WORKFLOW_STEPS[stepIndex + 1] ?? null;

  const save = async (changes, note) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateIncidentWorkflow(incident.id, changes, note);
    } catch (err) {
      console.error(err);
      setSaveError('Could not save the change. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange   = (v) => { if (v !== incident.workflowStatus) save({ workflowStatus: v }, `Status changed to ${v}`); };
  const handleSeverityChange = (v) => save({ severity: v }, `Severity set to ${v}`);
  const handleAssign         = (v) => {
    if (!v) { save({ assignedRangerId: null }, 'Ranger unassigned'); return; }
    const r = findRanger(v);
    const changes = { assignedRangerId: v };
    if (stepIndex < WORKFLOW_STEPS.indexOf('Assigned')) changes.workflowStatus = 'Assigned';
    save(changes, `Assigned to ${r?.name ?? v}`);
  };

  return (
    <div style={styles.page}>
      <Link to="/incidents" style={styles.back}>
        <ArrowLeft size={14} /> Back to incidents
      </Link>

      <div style={styles.titleRow}>
        <div style={{ minWidth: 0 }}>
          <h1 style={styles.title}>{incident.label ?? incident.type}</h1>
          <div style={styles.id}>{incident.id}</div>
        </div>
        <div style={styles.chips}>
          <SeverityChip severity={incident.severity} />
          <StatusChip status={incident.workflowStatus} />
        </div>
      </div>

      {saveError && <div style={styles.error} role="alert">{saveError}</div>}

      <div style={styles.grid}>
        {/* Left: what was reported */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Details</h3>
            <dl style={styles.fields}>
              <Field label="Type"            value={incident.label ?? incident.type} />
              <Field label="Park"            value={park?.name ?? incident.parkId ?? '—'} />
              <Field label="Date / time"     value={formatDateTime(incident.reportedAt)} />
              <Field label="Reporter"        value={reporter ? `${reporter.name} (${reporter.id})` : incident.reportedBy ?? '—'} />
              <Field label="Assigned ranger" value={assigned?.name ?? incident.assignedRangerId ?? 'Not assigned'} />
              <Field label="GPS"             value={hasLocation ? `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}` : 'Not available'} />
            </dl>
            <h4 style={styles.subTitle}>Description</h4>
            <p style={styles.description}>{incident.description || 'No description provided.'}</p>
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Evidence photo</h3>
            {photoUrl ? (
              <img src={photoUrl} alt={`Evidence for ${incident.id}`} style={styles.photo} />
            ) : (
              <div style={styles.noPhoto}>
                <ImageOff size={28} color="#9ca3af" />
                <span>
                  {incident.photoUri
                    ? "The photo is stored on the ranger's device and has not been uploaded."
                    : 'No photo was attached to this incident.'}
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Right: workflow, map, history */}
        <div style={styles.column}>
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Workflow</h3>
            <WorkflowTracker status={incident.workflowStatus} />

            <div style={styles.controls}>
              {nextStep ? (
                <button className="btn btn-primary" onClick={() => handleStatusChange(nextStep)} disabled={saving}>
                  Move to {nextStep}
                </button>
              ) : (
                <span style={styles.resolved}>This incident is resolved.</span>
              )}

              <label style={styles.control}>
                <span style={styles.controlLabel}>Status</span>
                <select value={incident.workflowStatus} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving} style={styles.select}>
                  {WORKFLOW_STEPS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label style={styles.control}>
                <span style={styles.controlLabel}>Severity</span>
                <select value={SEVERITIES.includes(incident.severity) ? incident.severity : ''} onChange={(e) => handleSeverityChange(e.target.value)} disabled={saving} style={styles.select}>
                  <option value="" disabled>Not set</option>
                  {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label style={styles.control}>
                <span style={styles.controlLabel}>Assign ranger</span>
                <select value={incident.assignedRangerId ?? ''} onChange={(e) => handleAssign(e.target.value)} disabled={saving} style={styles.select}>
                  <option value="">Not assigned</option>
                  {incident.assignedRangerId && !isAssignedListed && (
                    <option value={incident.assignedRangerId}>{assigned?.name ?? incident.assignedRangerId}</option>
                  )}
                  {rangers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {!rangersLoading && rangers.length === 0 && (
                  <span style={styles.muted}>No verified rangers yet. Approve on the Verify Rangers page.</span>
                )}
              </label>
            </div>
            {saving && <div style={styles.saving}>Saving…</div>}
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Location</h3>
            {hasLocation ? (
              <div style={styles.map}>
                <MapContainer key={incident.id} center={[incident.latitude, incident.longitude]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[incident.latitude, incident.longitude]} icon={markerIcon} />
                </MapContainer>
              </div>
            ) : (
              <p style={styles.muted}>No GPS location was recorded for this incident.</p>
            )}
          </section>

          <section style={styles.card}>
            <h3 style={styles.cardTitle}>History</h3>
            {!incident.history || incident.history.length === 0 ? (
              <p style={styles.muted}>No changes have been made yet.</p>
            ) : (
              <ul style={styles.history}>
                {[...incident.history].reverse().map((h, idx) => (
                  <li key={idx} style={styles.historyItem}>
                    <span>{h.change}</span>
                    <span style={styles.muted}>{formatDateTime(h.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value }) => (
  <div style={styles.field}>
    <dt style={styles.fieldLabel}>{label}</dt>
    <dd style={styles.fieldValue}>{value}</dd>
  </div>
);

const styles = {
  page:         { padding: 20, maxWidth: 1200, margin: '0 auto', overflowY: 'auto', height: '100%' },
  center:       { height: '60%', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
  back:         { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#1B5E20', textDecoration: 'none', marginBottom: 12 },
  titleRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  title:        { color: '#1a1a1a', margin: 0 },
  id:           { fontFamily: 'monospace', fontSize: '0.8rem', color: '#6b7280', overflowWrap: 'anywhere' },
  chips:        { display: 'flex', gap: 8, alignItems: 'center' },
  error:        { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 },
  column:       { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  card:         { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 },
  cardTitle:    { marginBottom: 12, color: '#1B5E20', margin: '0 0 12px' },
  subTitle:     { fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '14px 0 4px' },
  fields:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 },
  field:        { minWidth: 0 },
  fieldLabel:   { fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' },
  fieldValue:   { fontWeight: 600, overflowWrap: 'anywhere', margin: 0 },
  description:  { lineHeight: 1.6, margin: 0 },
  photo:        { width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 6, background: '#f3f4f6' },
  noPhoto:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: 24, background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 6, color: '#6b7280', fontSize: '0.85rem' },
  controls:     { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 },
  control:      { display: 'flex', flexDirection: 'column', gap: 4 },
  controlLabel: { fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' },
  select:       { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', font: 'inherit' },
  resolved:     { color: '#15803d', fontWeight: 600 },
  saving:       { marginTop: 8, fontSize: '0.8rem', color: '#6b7280' },
  map:          { height: 260, borderRadius: 8, overflow: 'hidden' },
  muted:        { color: '#6b7280', fontSize: '0.8rem', margin: 0 },
  history:      { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  historyItem:  { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: '0.85rem' },
};
