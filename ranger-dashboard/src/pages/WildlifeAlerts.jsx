/**
 * WildlifeAlerts — Member 4 dashboard page.
 * List + detail + status management for collar alerts.
 * Reads live from Firestore collar_alerts / collar_responses.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Eye, CheckCircle, Users, RefreshCw, Clock, MapPin, Radio, ChevronRight, Trash2 } from 'lucide-react';
import {
  subscribeToCollarAlerts,
  subscribeToAlertResponses,
  updateAlertStatus,
  getAnimalById,
  deleteCollarAlert,
} from '../services/alertService.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const RISK_COLORS = {
  Critical: { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', dot: '#dc2626' },
  High:     { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', dot: '#ea580c' },
  Medium:   { bg: '#fffbeb', border: '#fde68a', text: '#b45309', dot: '#d97706' },
  Low:      { bg: '#f0fdf4', border: '#86efac', text: '#15803d', dot: '#16a34a' },
};

const STATUS_OPTIONS = [
  { value: 'Active',            label: 'Active',             icon: AlertTriangle, color: '#dc2626' },
  { value: 'Acknowledged',      label: 'Acknowledged',       icon: Eye,           color: '#7c3aed' },
  { value: 'Active/Monitoring', label: 'Active / Monitoring',icon: Eye,           color: '#d97706' },
  { value: 'Active/Reassigned', label: 'Active / Reassigned',icon: Users,         color: '#2563eb' },
  { value: 'Resolved',          label: 'Resolved',           icon: CheckCircle,   color: '#16a34a' },
];

const FILTERS = ['All', 'Active', 'Monitoring', 'Resolved'];

function statusColor(status) {
  if (!status) return '#6b7280';
  if (status === 'Resolved')          return '#16a34a';
  if (status.includes('Monitoring'))  return '#d97706';
  if (status.includes('Reassigned'))  return '#2563eb';
  if (status === 'Acknowledged')      return '#7c3aed';
  return '#dc2626';
}

function formatTime(val) {
  if (!val) return '—';
  const d = val?.toDate ? val.toDate() : new Date(val);
  return isNaN(d) ? '—' : d.toLocaleString();
}

// ── Alert list card ───────────────────────────────────────────────────────────

function AlertCard({ alert, selected, onClick }) {
  const risk = RISK_COLORS[alert.riskLevel] ?? RISK_COLORS.Medium;
  const sc   = statusColor(alert.status);
  const time = formatTime(alert.generatedAt);

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 8,
        border: `1px solid ${selected ? '#1B5E20' : '#e5e7eb'}`,
        borderLeft: `4px solid ${risk.dot}`,
        background: selected ? '#f0fdf4' : '#fff',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111', flex: 1, marginRight: 8 }}>
          {alert.type}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
          background: sc + '18', color: sc, border: `1px solid ${sc}40`,
          whiteSpace: 'nowrap',
        }}>
          {alert.status}
        </span>
      </div>

      {alert.animalName && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>🐾 {alert.animalName}</div>
      )}
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>
        <MapPin size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
        {alert.riskZone ?? alert.location ?? '—'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: risk.bg, color: risk.text, border: `1px solid ${risk.border}`,
        }}>
          {alert.riskLevel}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{time}</span>
      </div>
    </div>
  );
}

// ── Response item ─────────────────────────────────────────────────────────────

function ResponseItem({ r }) {
  const oc = { Resolved: '#16a34a', Monitoring: '#d97706', Reassigned: '#2563eb' };
  const color = oc[r.outcome] ?? '#6b7280';
  return (
    <div style={{ padding: '10px 12px', borderRadius: 6, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color, background: color + '15', padding: '2px 8px', borderRadius: 10 }}>
          {r.outcome}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{formatTime(r.submittedAt)}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{r.notes}</p>
      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>by {r.rangerId}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WildlifeAlerts() {
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [responses, setResponses] = useState([]);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [updating,  setUpdating]  = useState(false);

  // Subscribe to alerts
  useEffect(() => {
    return subscribeToCollarAlerts(({ data, error: err, loading: ld }) => {
      setAlerts(data);
      setError(err);
      setLoading(ld);
    });
  }, []);

  // Subscribe to responses for selected alert
  useEffect(() => {
    if (!selected) { setResponses([]); return; }
    return subscribeToAlertResponses(selected.id, ({ data }) => setResponses(data));
  }, [selected?.id]);

  const filtered = useMemo(() => alerts.filter((a) => {
    const matchFilter =
      filter === 'All'       ? true :
      filter === 'Active'    ? a.status?.startsWith('Active') :
      filter === 'Monitoring'? a.status?.includes('Monitoring') :
      filter === 'Resolved'  ? a.status === 'Resolved' : true;

    const matchSearch = !search || [a.type, a.animalName, a.riskZone, a.parkName]
      .filter(Boolean).some((v) => v.toLowerCase().includes(search.toLowerCase()));

    return matchFilter && matchSearch;
  }), [alerts, filter, search]);

  const animal = selected ? getAnimalById(selected.animalId) : null;

  const handleStatusChange = async (newStatus) => {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      await updateAlertStatus(selected.id, newStatus);
      setSelected((prev) => ({ ...prev, status: newStatus }));
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete alert "${selected.type}"? This cannot be undone.`)) return;
    try {
      await deleteCollarAlert(selected.id);
      setSelected(null);
    } catch (e) {
      alert('Failed to delete alert: ' + e.message);
    }
  };

  // Summary counts
  const counts = useMemo(() => ({
    total:    alerts.length,
    active:   alerts.filter((a) => a.status?.startsWith('Active')).length,
    resolved: alerts.filter((a) => a.status === 'Resolved').length,
    critical: alerts.filter((a) => a.riskLevel === 'Critical').length,
  }), [alerts]);

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1B5E20' }}>Wildlife Collar Alerts</h1>
        {error && <span style={{ fontSize: 12, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: 6, border: '1px solid #fde68a' }}>⚠ Offline – showing cached data</span>}
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Alerts',    value: counts.total,    color: '#1B5E20', icon: Radio },
          { label: 'Active',          value: counts.active,   color: '#dc2626', icon: AlertTriangle },
          { label: 'Resolved',        value: counts.resolved, color: '#16a34a', icon: CheckCircle },
          { label: 'Critical',        value: counts.critical, color: '#b91c1c', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

        {/* Left — Alert list */}
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>

          {/* Search */}
          <input
            placeholder="Search alerts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
          />

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: '6px 4px', borderRadius: 6, border: `1px solid ${filter === f ? '#1B5E20' : '#d1d5db'}`,
                background: filter === f ? '#1B5E20' : '#fff', color: filter === f ? '#fff' : '#374151',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: 40 }}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Loading alerts…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', paddingTop: 40 }}>No alerts found</div>
            ) : filtered.map((a) => (
              <AlertCard key={a.id} alert={a} selected={selected?.id === a.id} onClick={() => setSelected(a)} />
            ))}
          </div>
        </div>

        {/* Right — Detail panel */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflowY: 'auto', padding: 20 }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', gap: 12 }}>
              <ChevronRight size={40} />
              <p>Select an alert to view details</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', color: '#111', fontSize: 18 }}>{selected.type}</h2>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{selected.id}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {/* Risk badge */}
                  {(() => { const r = RISK_COLORS[selected.riskLevel] ?? RISK_COLORS.Medium; return (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: r.bg, color: r.text, border: `1px solid ${r.border}` }}>
                      {selected.riskLevel} Risk
                    </span>
                  );})()}
                  {/* Status badge */}
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: statusColor(selected.status) + '18', color: statusColor(selected.status) }}>
                    {selected.status}
                  </span>
                  {/* Delete button */}
                  <button onClick={handleDelete}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #fca5a5', borderRadius: 6, background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Generated At', value: formatTime(selected.generatedAt), icon: Clock },
                  { label: 'Risk Zone',    value: selected.riskZone ?? selected.location ?? '—', icon: MapPin },
                  { label: 'Park',         value: selected.parkName ?? selected.parkId ?? '—', icon: MapPin },
                  { label: 'Collar ID',    value: selected.collarId ?? '—', icon: Radio },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Animal info */}
              {selected.animalName && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 20, overflow: 'hidden' }}>
                  {selected.animalImageUrl && (
                    <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                      <img src={selected.animalImageUrl} alt={selected.animalName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Animal</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Name',    selected.animalName],
                        ['Species', selected.species ?? animal?.species ?? '—'],
                        ['ID',      selected.animalId ?? '—'],
                        ['Collar',  selected.collarId ?? '—'],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>{k}: </span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status management */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => handleStatusChange(value)}
                      disabled={updating || selected.status === value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${selected.status === value ? color : '#d1d5db'}`,
                        background: selected.status === value ? color + '15' : '#fff',
                        color: selected.status === value ? color : '#374151',
                        opacity: updating ? 0.6 : 1,
                      }}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acknowledgement info */}
              {selected.acknowledgedBy && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
                    ✓ Acknowledged by {selected.acknowledgedBy} at {formatTime(selected.acknowledgedAt)}
                  </span>
                </div>
              )}

              {/* Ranger responses */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ranger Responses ({responses.length})
                </div>
                {responses.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>No responses submitted yet.</p>
                ) : (
                  responses.map((r) => <ResponseItem key={r.id} r={r} />)
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
