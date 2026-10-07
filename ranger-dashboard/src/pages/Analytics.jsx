/**
 * Analytics — Member 4 dashboard page.
 * Charts and summary reports for wildlife alerts.
 * Uses Firestore live data, falls back to mockData.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, CheckCircle, AlertTriangle, Clock, Download } from 'lucide-react';
import { subscribeToCollarAlerts } from '../services/alertService.js';

// ── Simple bar chart ──────────────────────────────────────────────────────────

function BarChart({ data, color = '#1B5E20', height = 160 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{d.value}</span>
          <div style={{
            width: '100%', height: `${(d.value / max) * (height - 32)}px`,
            background: color, borderRadius: '4px 4px 0 0', minHeight: d.value > 0 ? 4 : 0,
          }} />
          <span style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut-style stat ──────────────────────────────────────────────────────────

function StatRing({ value, total, label, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke="#f3f4f6" strokeWidth={10} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 44 44)" />
        <text x={44} y={48} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>{pct}%</text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{label}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToCollarAlerts(({ data, loading: ld }) => {
      setAlerts(data);
      setLoading(ld);
    });
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total    = alerts.length;
    const resolved = alerts.filter((a) => a.status === 'Resolved').length;
    const active   = alerts.filter((a) => a.status?.startsWith('Active')).length;
    const critical = alerts.filter((a) => a.riskLevel === 'Critical').length;
    const high     = alerts.filter((a) => a.riskLevel === 'High').length;

    // By risk level
    const byRisk = ['Critical', 'High', 'Medium', 'Low'].map((r) => ({
      label: r, value: alerts.filter((a) => a.riskLevel === r).length,
    }));

    // By park
    const parkMap = {};
    alerts.forEach((a) => {
      const k = a.parkName ?? a.parkId ?? 'Unknown';
      parkMap[k] = (parkMap[k] ?? 0) + 1;
    });
    const byPark = Object.entries(parkMap)
      .map(([label, value]) => ({ label: label.replace('National Park', '').replace('Forest Reserve', '').trim(), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // By status
    const statusMap = {};
    alerts.forEach((a) => { const k = a.status ?? 'Unknown'; statusMap[k] = (statusMap[k] ?? 0) + 1; });
    const byStatus = Object.entries(statusMap).map(([label, value]) => ({ label, value }));

    // By species
    const speciesMap = {};
    alerts.forEach((a) => { if (a.species) speciesMap[a.species] = (speciesMap[a.species] ?? 0) + 1; });
    const bySpecies = Object.entries(speciesMap).map(([label, value]) => ({ label, value }));

    return { total, resolved, active, critical, high, byRisk, byPark, byStatus, bySpecies };
  }, [alerts]);

  const downloadCSV = () => {
    const headers = ['ID', 'Type', 'Animal', 'Species', 'Park', 'Risk Zone', 'Risk Level', 'Status', 'Generated At'];
    const rows = alerts.map((a) => [
      a.id, a.type, a.animalName ?? '', a.species ?? '',
      a.parkName ?? a.parkId ?? '', a.riskZone ?? a.location ?? '',
      a.riskLevel, a.status,
      a.generatedAt?.toDate ? a.generatedAt.toDate().toISOString() : a.generatedAt ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = 'wildlife_alerts_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280' }}>Loading analytics…</div>;

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#1B5E20' }}>Analytics & Reports</h1>
        <button onClick={downloadCSV} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          background: '#1B5E20', color: '#fff', border: 'none', borderRadius: 6,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Alerts',  value: stats.total,    color: '#1B5E20', icon: BarChart2 },
          { label: 'Active',        value: stats.active,   color: '#dc2626', icon: AlertTriangle },
          { label: 'Resolved',      value: stats.resolved, color: '#16a34a', icon: CheckCircle },
          { label: 'Critical Risk', value: stats.critical, color: '#b91c1c', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Alerts by risk level */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, color: '#111' }}>Alerts by Risk Level</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Distribution across risk categories</p>
          <BarChart data={stats.byRisk} color="#1B5E20" height={160} />
        </div>

        {/* Alerts by park */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, color: '#111' }}>Alerts by Park</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Top parks by alert volume</p>
          <BarChart data={stats.byPark} color="#2563eb" height={160} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Status breakdown */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, color: '#111' }}>Alert Status Breakdown</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Current status across all alerts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.byStatus.map(({ label, value }) => {
              const pct = stats.total > 0 ? (value / stats.total) * 100 : 0;
              const colors = { Resolved: '#16a34a', 'Active/Monitoring': '#d97706', 'Active/Reassigned': '#2563eb', Active: '#dc2626', Acknowledged: '#7c3aed' };
              const c = colors[label] ?? '#6b7280';
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: c, fontWeight: 700 }}>{value} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution rate rings */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14, color: '#111' }}>Resolution Rate</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>Resolved vs active</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <StatRing value={stats.resolved} total={stats.total} label="Resolved"      color="#16a34a" />
            <StatRing value={stats.active}   total={stats.total} label="Active"        color="#dc2626" />
          </div>
        </div>
      </div>

      {/* Alert table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 14, color: '#111' }}>All Alerts Summary</h3>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{alerts.length} records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['ID', 'Type', 'Animal', 'Park', 'Risk Level', 'Status', 'Generated At'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => {
                const risk = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' }[a.riskLevel] ?? '#6b7280';
                const sc   = a.status === 'Resolved' ? '#16a34a' : a.status?.startsWith('Active') ? '#dc2626' : '#6b7280';
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '9px 12px', color: '#6b7280' }}>{a.id}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 500 }}>{a.type}</td>
                    <td style={{ padding: '9px 12px', color: '#6b7280' }}>{a.animalName ?? '—'}</td>
                    <td style={{ padding: '9px 12px', color: '#6b7280' }}>{(a.parkName ?? a.parkId ?? '—').replace('National Park', '').trim()}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontWeight: 700, color: risk, background: risk + '15', padding: '2px 7px', borderRadius: 4 }}>{a.riskLevel}</span>
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontWeight: 600, color: sc, background: sc + '15', padding: '2px 7px', borderRadius: 4 }}>{a.status}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {a.generatedAt?.toDate ? a.generatedAt.toDate().toLocaleString() : a.generatedAt ? new Date(a.generatedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
