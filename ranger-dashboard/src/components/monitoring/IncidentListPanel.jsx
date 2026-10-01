import React from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

/**
 * IncidentListPanel – compact scrollable list of live Firestore incidents.
 * Placed below the map; clicking an incident fires onSelect to fly the map.
 *
 * @param {{
 *   incidents: object[],
 *   loading: boolean,
 *   selectedId: string | null,
 *   onSelect: (incident: object) => void,
 * }} props
 */
export default function IncidentListPanel({ incidents, loading, selectedId, onSelect }) {
  const SEV_STYLE = {
    Critical: { bg: '#dc2626', text: '#fff' },
    High:     { bg: '#fee2e2', text: '#991b1b' },
    Medium:   { bg: '#fef9c3', text: '#92400e' },
    Low:      { bg: '#dcfce7', text: '#15803d' },
    Unknown:  { bg: '#f3f4f6', text: '#4b5563' },
  };

  const TYPE_ICON_COLOR = {
    SNARE:    '#dc2626',
    CARCASS:  '#7c3aed',
    TRACKS:   '#d97706',
    CAMPSITE: '#b45309',
    OTHER:    '#374151',
  };

  function formatTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <AlertTriangle size={14} color="#dc2626" />
        <span style={styles.headerText}>
          Incidents
          {!loading && <span style={styles.count}> {incidents.length}</span>}
        </span>
        {loading && <span style={styles.loadingDot}>●</span>}
      </div>

      {loading && (
        <div style={styles.empty}>Connecting to Firestore…</div>
      )}

      {!loading && incidents.length === 0 && (
        <div style={styles.empty}>No incidents for selected filter.</div>
      )}

      <div style={styles.list}>
        {incidents.map((inc) => {
          const sev = SEV_STYLE[inc.severity] ?? SEV_STYLE.Unknown;
          const isSelected = inc.id === selectedId;
          return (
            <button
              key={inc.id}
              onClick={() => onSelect(inc)}
              style={{
                ...styles.item,
                borderLeft: `3px solid ${TYPE_ICON_COLOR[inc.type] ?? '#374151'}`,
                background: isSelected ? '#f0fdf4' : '#fff',
                outline: isSelected ? '1px solid #16a34a' : 'none',
              }}
            >
              <div style={styles.itemTop}>
                <span style={styles.itemLabel}>{inc.label}</span>
                <span style={{ ...styles.sevBadge, background: sev.bg, color: sev.text }}>
                  {inc.severity}
                </span>
              </div>
              <div style={styles.itemMeta}>
                <span style={styles.metaChip}>
                  <MapPin size={10} /> {inc.parkId?.replace('PARK-', '') ?? '—'}
                </span>
                <span style={styles.metaChip}>
                  <Clock size={10} /> {formatTime(inc.recordedAt)}
                </span>
                <span style={styles.metaChip}>
                  {inc.reportedBy ?? inc.rangerId ?? '—'}
                </span>
              </div>
              <div style={styles.statusRow}>
                <span style={{
                  ...styles.status,
                  color: inc.status === 'Received' || inc.status === 'Synced' ? '#15803d'
                    : inc.status === 'Failed' ? '#dc2626' : '#6b7280',
                  fontStyle: 'normal',
                  fontWeight: inc.status === 'Failed' ? 700 : 400,
                }}>
                  {inc.status === 'Received' ? '✓ Received' :
                   inc.status === 'Synced'   ? '✓ Synced'   :
                   inc.status === 'Failed'   ? '✗ Failed'   : inc.status ?? '—'}
                </span>
                <span style={styles.incId}>{inc.id}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
    flexShrink: 0,
  },
  headerText: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1a1a1a',
    flex: 1,
  },
  count: {
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 999,
    padding: '1px 7px',
    fontSize: '0.7rem',
    fontWeight: 700,
    marginLeft: 4,
  },
  loadingDot: {
    color: '#f59e0b',
    fontSize: '0.6rem',
    animation: 'pulse 1s infinite',
  },
  list: {
    overflowY: 'auto',
    flex: 1,
  },
  empty: {
    padding: '16px 12px',
    fontSize: '0.78rem',
    color: '#9ca3af',
    textAlign: 'center',
  },
  item: {
    width: '100%',
    textAlign: 'left',
    background: '#fff',
    border: 'none',
    borderBottom: '1px solid #f3f4f6',
    padding: '8px 10px 8px 10px',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  sevBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 999,
    flexShrink: 0,
  },
  itemMeta: {
    display: 'flex',
    gap: 8,
    marginBottom: 2,
  },
  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: '0.68rem',
    color: '#6b7280',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: '0.68rem',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  incId: {
    fontSize: '0.65rem',
    color: '#d1d5db',
    letterSpacing: '0.03em',
  },
};
