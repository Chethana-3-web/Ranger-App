import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents.js';
import { PARKS, getParkById, getRangerById } from '../data/mockData.js';
import { WORKFLOW_STEPS, SEVERITIES } from '../services/incidentWorkflowService.js';
import SeverityChip from '../components/incidents/SeverityChip.jsx';
import StatusChip from '../components/incidents/StatusChip.jsx';
import FilterDropdown from '../components/incidents/FilterDropdown.jsx';

const ALL = 'ALL';
const ALL_OPTION = { value: ALL, label: 'All' };

const PARK_OPTIONS = [ALL_OPTION, ...PARKS.map((p) => ({ value: p.id, label: p.name }))];
const SEVERITY_OPTIONS = [ALL_OPTION, ...[...SEVERITIES, 'Unknown'].map((s) => ({ value: s, label: s }))];
const STATUS_OPTIONS = [ALL_OPTION, ...WORKFLOW_STEPS.map((s) => ({ value: s, label: s }))];

function formatDateTime(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

/**
 * Incidents – table of all incidents with search and filters.
 * Clicking a row opens the incident details page.
 */
export default function Incidents() {
  const navigate = useNavigate();
  const { incidents, loading, error } = useIncidents();

  const [search,   setSearch]   = useState('');
  const [park,     setPark]     = useState(ALL);
  const [type,     setType]     = useState(ALL);
  const [severity, setSeverity] = useState(ALL);
  const [status,   setStatus]   = useState(ALL);

  // Type options come from the data, so new mobile incident types appear automatically
  const typeOptions = useMemo(() => {
    const labels = new Map();
    incidents.forEach((i) => labels.set(i.type, i.label ?? i.type));
    const types = [...labels.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
    return [ALL_OPTION, ...types];
  }, [incidents]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return incidents.filter((i) => {
      if (park !== ALL && i.parkId !== park) return false;
      if (type !== ALL && i.type !== type) return false;
      if (severity !== ALL && i.severity !== severity) return false;
      if (status !== ALL && i.workflowStatus !== status) return false;
      if (!term) return true;
      const reporter = getRangerById(i.reportedBy)?.name ?? '';
      return [i.id, i.label, i.description, i.reportedBy, reporter]
        .some((field) => String(field ?? '').toLowerCase().includes(term));
    });
  }, [incidents, search, park, type, severity, status]);

  const hasFilters = search || [park, type, severity, status].some((f) => f !== ALL);
  const clearFilters = () => {
    setSearch(''); setPark(ALL); setType(ALL); setSeverity(ALL); setStatus(ALL);
  };

  return (
    <div style={styles.page}>
      <div style={styles.filters}>
        <label style={styles.searchBox}>
          <Search size={14} color="#6b7280" />
          <input
            type="search"
            placeholder="Search by ID, type, description or reporter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            aria-label="Search incidents"
          />
        </label>

        <FilterDropdown label="Park" value={park} onChange={setPark} options={PARK_OPTIONS} />
        <FilterDropdown label="Type" value={type} onChange={setType} options={typeOptions} />
        <FilterDropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} />
        <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />

        {hasFilters && (
          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        )}
      </div>

      <div style={styles.meta}>
        <span>
          {loading ? 'Loading incidents…' : `Showing ${filtered.length} of ${incidents.length} incidents`}
        </span>
        {error && (
          <span style={styles.warning}>Live data unavailable. Showing sample incidents.</span>
        )}
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'Type', 'Park', 'Severity', 'Status', 'Reported By', 'Reported At'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.id}
                style={styles.row}
                onClick={() => navigate(`/incidents/${encodeURIComponent(i.id)}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/incidents/${encodeURIComponent(i.id)}`); }}
                tabIndex={0}
              >
                <td style={{ ...styles.td, ...styles.idCell }} title={i.id}>{i.id}</td>
                <td style={styles.td}>{i.label ?? i.type}</td>
                <td style={styles.td}>{getParkById(i.parkId)?.name ?? i.parkId ?? '—'}</td>
                <td style={styles.td}><SeverityChip severity={i.severity} /></td>
                <td style={styles.td}><StatusChip status={i.workflowStatus} /></td>
                <td style={styles.td}>{getRangerById(i.reportedBy)?.name ?? i.reportedBy ?? '—'}</td>
                <td style={styles.td}>{formatDateTime(i.reportedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div style={styles.empty}>
            {incidents.length === 0 ? 'No incidents have been reported yet.' : 'No incidents match these filters.'}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: '100%' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  searchBox: {
    flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0 10px',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', padding: 0, height: 34, font: 'inherit', background: 'transparent' },
  meta: {
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
    fontSize: '0.8rem', color: 'var(--color-text-secondary)',
  },
  warning: { color: '#a16207' },
  tableWrap: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: {
    textAlign: 'left', padding: '10px 14px', background: '#fafafa',
    borderBottom: '1px solid #e5e7eb', fontSize: '0.72rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  row: { cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  td: { padding: '10px 14px', verticalAlign: 'middle' },
  idCell: {
    fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)',
    maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  empty: { padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)' },
};
