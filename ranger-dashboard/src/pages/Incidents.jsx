import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ChevronRight, SearchX, ClipboardList, Inbox, Activity, CheckCircle2, AlertTriangle, UserX,
} from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents.js';
import { useRangers } from '../hooks/useRangers.js';
import { getParkById, getRangerById } from '../data/mockData.js';
import { WORKFLOW_STEPS, SEVERITIES } from '../services/incidentWorkflowService.js';
import { INCIDENT_TYPE_LABELS } from '../services/incidentService.js';
import SeverityChip from '../components/incidents/SeverityChip.jsx';
import StatusChip from '../components/incidents/StatusChip.jsx';
import FilterDropdown from '../components/incidents/FilterDropdown.jsx';

const ALL = 'ALL';
const ALL_OPTION = { value: ALL, label: 'All' };

const SEVERITY_OPTIONS = [ALL_OPTION, ...[...SEVERITIES, 'Unknown'].map((s) => ({ value: s, label: s }))];
const STATUS_OPTIONS = [ALL_OPTION, ...WORKFLOW_STEPS.map((s) => ({ value: s, label: s }))];

const TYPE_COLORS = {
  EMERGENCY: '#dc2626',
  SNARE:     '#dc2626',
  CARCASS:   '#7c3aed',
  TRACKS:    '#d97706',
  CAMPSITE:  '#b45309',
  OTHER:     '#374151',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

/** "5 min ago" for recent reports, the date for older ones. */
function formatRelative(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const StatTile = ({ icon: Icon, tint, label, value, hint }) => (
  <div className="incident-stat">
    <span className="incident-stat-icon" style={{ background: `${tint}1A`, color: tint }}>
      <Icon size={18} strokeWidth={2} />
    </span>
    <div style={{ minWidth: 0 }}>
      <div className="incident-stat-label">{label}</div>
      <div className="incident-stat-value">{value}</div>
      <div className="incident-stat-hint">{hint}</div>
    </div>
  </div>
);

/**
 * Incidents – summary stats and a table of all incidents with search and filters.
 * Clicking a row opens the incident details page.
 */
export default function Incidents() {
  const navigate = useNavigate();
  const { incidents, loading, error } = useIncidents();
  const { rangers } = useRangers();

  // Real verified rangers first; sample rangers only to name older assignments
  const getAssignedName = useCallback((rangerId) => {
    if (!rangerId) return null;
    return rangers.find((r) => r.id === rangerId)?.name ?? getRangerById(rangerId)?.name ?? rangerId;
  }, [rangers]);

  const [search,   setSearch]   = useState('');
  const [park,     setPark]     = useState(ALL);
  const [type,     setType]     = useState(ALL);
  const [severity, setSeverity] = useState(ALL);
  const [status,   setStatus]   = useState(ALL);

  // Park options come from the data, so only parks that have incidents are listed
  const parkOptions = useMemo(() => {
    const ids = [...new Set(incidents.map((i) => i.parkId).filter(Boolean))];
    const parks = ids
      .map((id) => ({ value: id, label: getParkById(id)?.name ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [ALL_OPTION, ...parks];
  }, [incidents]);

  // All incident types a ranger can log in the mobile app, plus any other type found in the data
  const typeOptions = useMemo(() => {
    const labels = new Map(Object.entries(INCIDENT_TYPE_LABELS));
    incidents.forEach((i) => { if (!labels.has(i.type)) labels.set(i.type, i.label ?? i.type); });
    return [ALL_OPTION, ...[...labels.entries()].map(([value, label]) => ({ value, label }))];
  }, [incidents]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return incidents.filter((i) => {
      if (park !== ALL && i.parkId !== park) return false;
      if (type !== ALL && i.type !== type) return false;
      if (severity !== ALL && i.severity !== severity) return false;
      if (status !== ALL && i.workflowStatus !== status) return false;
      if (!term) return true;
      return [i.id, i.label, i.description, getAssignedName(i.assignedRangerId)]
        .some((field) => String(field ?? '').toLowerCase().includes(term));
    });
  }, [incidents, search, park, type, severity, status, getAssignedName]);

  // Summary of all incidents (not affected by the filters below)
  const stats = useMemo(() => {
    const count = (fn) => incidents.filter(fn).length;
    const isOpen = (i) => i.workflowStatus !== 'Resolved';
    return {
      total:      incidents.length,
      fresh:      count((i) => i.workflowStatus === 'New'),
      inProgress: count((i) => ['Under Review', 'Assigned', 'Responding'].includes(i.workflowStatus)),
      resolved:   count((i) => i.workflowStatus === 'Resolved'),
      urgent:     count((i) => isOpen(i) && ['High', 'Critical'].includes(i.severity)),
      unassigned: count((i) => isOpen(i) && !i.assignedRangerId),
    };
  }, [incidents]);

  const hasFilters = search || [park, type, severity, status].some((f) => f !== ALL);
  const clearFilters = () => {
    setSearch(''); setPark(ALL); setType(ALL); setSeverity(ALL); setStatus(ALL);
  };

  const openIncident = (i) => navigate(`/incidents/${encodeURIComponent(i.id)}`);
  const shown = (n) => (loading ? '–' : n);

  return (
    <div className="incidents-page">
      <header className="incidents-header">
        <div>
          <h1 className="incidents-title">Incidents</h1>
          <p className="incidents-subtitle">
            Reports logged by rangers in the field. Open one to review, assign and resolve it.
          </p>
        </div>
        {!loading && error && (
          <span className="incidents-source is-sample">
            <span className="incidents-source-dot" />
            Sample data (live data unavailable)
          </span>
        )}
      </header>

      <section className="incident-stats" aria-label="Incident summary">
        <StatTile icon={ClipboardList} tint="#1B5E20" label="Total incidents" value={shown(stats.total)} hint="All reports" />
        <StatTile icon={Inbox} tint="#1d4ed8" label="New" value={shown(stats.fresh)} hint="Waiting for review" />
        <StatTile icon={Activity} tint="#c2410c" label="In progress" value={shown(stats.inProgress)} hint="Review, assigned or responding" />
        <StatTile icon={CheckCircle2} tint="#15803d" label="Resolved" value={shown(stats.resolved)} hint="Closed" />
        <StatTile icon={AlertTriangle} tint="#dc2626" label="High or critical" value={shown(stats.urgent)} hint="Still open" />
        <StatTile icon={UserX} tint="#6b7280" label="Unassigned" value={shown(stats.unassigned)} hint="Open with no ranger" />
      </section>

      <section className="incidents-card">
        <div className="incidents-toolbar">
          <label className="incidents-search">
            <Search size={15} />
            <input
              type="search"
              placeholder="Search by ID, type, description or assigned ranger"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search incidents"
            />
          </label>

          <FilterDropdown label="Park" value={park} onChange={setPark} options={parkOptions} />
          <FilterDropdown label="Type" value={type} onChange={setType} options={typeOptions} />
          <FilterDropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} />
          <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />

          {hasFilters && (
            <button className="incidents-clear" onClick={clearFilters}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className="incidents-count">
          {loading ? 'Loading incidents…' : `Showing ${filtered.length} of ${incidents.length} incidents`}
        </div>

        <div className="incidents-table-wrap">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>Incident</th>
                <th>Park</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned ranger</th>
                <th>Reported</th>
                <th aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const assignedName = getAssignedName(i.assignedRangerId);
                return (
                  <tr
                    key={i.id}
                    className="incident-row"
                    onClick={() => openIncident(i)}
                    onKeyDown={(e) => { if (e.key === 'Enter') openIncident(i); }}
                    tabIndex={0}
                  >
                    <td>
                      <div className="incident-main">
                        <span
                          className="incident-type-dot"
                          style={{ background: TYPE_COLORS[i.type] ?? TYPE_COLORS.OTHER }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div className="incident-type">{i.label ?? i.type}</div>
                          <div className="incident-sub" title={i.id}>
                            <span className="incident-id">{i.id}</span>
                            {i.description ? ` · ${i.description}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getParkById(i.parkId)?.name ?? i.parkId ?? '—'}</td>
                    <td><SeverityChip severity={i.severity} /></td>
                    <td><StatusChip status={i.workflowStatus} /></td>
                    <td>
                      {assignedName ? (
                        <span className="incident-ranger">
                          <span className="incident-avatar">{getInitials(assignedName)}</span>
                          {assignedName}
                        </span>
                      ) : (
                        <span className="incident-unassigned">Not assigned</span>
                      )}
                    </td>
                    <td className="incident-time" title={formatDateTime(i.reportedAt)}>
                      {formatRelative(i.reportedAt)}
                    </td>
                    <td className="incident-chevron"><ChevronRight size={16} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="incidents-empty">
              <SearchX size={32} />
              <strong>{incidents.length === 0 ? 'No incidents yet' : 'No matching incidents'}</strong>
              <span>
                {incidents.length === 0
                  ? 'Incidents appear here as soon as a ranger logs one in the mobile app.'
                  : 'Try a different search or clear the filters.'}
              </span>
              {hasFilters && (
                <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
