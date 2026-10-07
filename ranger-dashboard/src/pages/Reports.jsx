/**
 * Reports — Member 4 dashboard page.
 * Three downloadable report types:
 * 1. Patrol Incident Report
 * 2. Wildlife Alert Report
 * 3. Operational Summary Report
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Filter, Eye, Shield, AlertTriangle, BarChart2 } from 'lucide-react';
import { subscribeToCollarAlerts } from '../services/alertService.js';
import { subscribeToIncidents } from '../services/incidentService.js';
import { RANGERS, PATROL_ROUTES, PARKS } from '../data/mockData.js';

// ── PDF helpers ───────────────────────────────────────────────────────────────

async function makePDF() {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

function pdfHeader(doc, title, subtitle) {
  const W = 210, m = 14;
  doc.setFillColor(27, 94, 32);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 34, W, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.text('WildWatch — Sri Lanka DWC', m, 14);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.text(title, m, 23);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(`${subtitle}  ·  Generated: ${new Date().toLocaleString()}`, m, 31);
  doc.setTextColor(30, 30, 30);
  return 46;
}

function pdfTable(doc, head, body, startY) {
  doc.autoTable({
    startY, head: [head], body,
    headStyles: { fillColor: [46, 125, 50], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [248, 252, 248] },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 2.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
  });
  return doc.lastAutoTable.finalY + 6;
}

function pdfFooter(doc) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 245, 240);
    doc.rect(0, 287, 210, 10, 'F');
    doc.setTextColor(120, 120, 120); doc.setFontSize(7);
    doc.text('Sri Lanka Department of Wildlife Conservation — Confidential', 14, 293);
    doc.text(`Page ${i} of ${n}`, 196, 293, { align: 'right' });
  }
}

// ── Report 1: Patrol Incidents ─────────────────────────────────────────────

async function downloadIncidentReport(incidents, filters) {
  const filtered = incidents.filter((i) => {
    if (filters.park && filters.park !== 'ALL' && i.parkId !== filters.park) return false;
    if (filters.type && filters.type !== 'ALL' && i.type !== filters.type) return false;
    return true;
  });

  const doc = await makePDF();
  let y = pdfHeader(doc, 'Patrol Incident Report', `${filtered.length} incidents · Park: ${filters.park || 'All'} · Type: ${filters.type || 'All'}`);

  // Summary box
  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(27, 94, 32);
  const types = ['SNARE','CARCASS','TRACKS','CAMPSITE','OTHER'];
  types.forEach((t, i) => {
    const count = filtered.filter((inc) => inc.type === t).length;
    doc.text(`${t}: ${count}`, 18 + i * 37, y + 11);
  });
  doc.setTextColor(30, 30, 30);
  y += 24;

  y = pdfTable(doc,
    ['Date', 'Ranger ID', 'Park', 'Type', 'Severity', 'GPS Source', 'Status'],
    filtered.map((i) => [
      i.recordedAt ? new Date(i.recordedAt).toLocaleDateString() : '—',
      i.rangerId ?? '—',
      i.parkId ?? '—',
      i.label ?? i.type ?? '—',
      i.severity ?? '—',
      i.location?.source ?? '—',
      i.status ?? '—',
    ]), y
  );

  pdfFooter(doc);
  doc.save(`Incident_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Report 2: Wildlife Alert Report ───────────────────────────────────────

async function downloadAlertReport(alerts, filters) {
  const filtered = alerts.filter((a) => {
    if (filters.park && filters.park !== 'ALL' && a.parkId !== filters.park) return false;
    if (filters.risk && filters.risk !== 'ALL' && a.riskLevel !== filters.risk) return false;
    if (filters.status && filters.status !== 'ALL' && a.status !== filters.status) return false;
    return true;
  });

  const doc = await makePDF();
  let y = pdfHeader(doc, 'Wildlife Collar Alert Report', `${filtered.length} alerts · Risk: ${filters.risk || 'All'} · Status: ${filters.status || 'All'}`);

  // KPI row
  const resolved   = filtered.filter((a) => a.status === 'Resolved').length;
  const active     = filtered.filter((a) => a.status?.startsWith('Active')).length;
  const critical   = filtered.filter((a) => a.riskLevel === 'Critical').length;
  const rate       = filtered.length > 0 ? Math.round((resolved / filtered.length) * 100) : 0;

  doc.setFillColor(240, 248, 240);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(27, 94, 32);
  [`Total: ${filtered.length}`, `Active: ${active}`, `Resolved: ${resolved}`, `Critical: ${critical}`, `Resolution Rate: ${rate}%`].forEach((t, i) => {
    doc.text(t, 18 + i * 37, y + 11);
  });
  doc.setTextColor(30, 30, 30);
  y += 24;

  y = pdfTable(doc,
    ['Date', 'Animal', 'Species', 'Risk Zone', 'Risk Level', 'Status', 'Acknowledged By'],
    filtered.map((a) => [
      a.generatedAt ? new Date(a.generatedAt).toLocaleDateString() : '—',
      a.animalName ?? '—',
      a.species ?? '—',
      a.riskZone ?? '—',
      a.riskLevel ?? '—',
      a.status ?? '—',
      a.acknowledgedBy ?? 'Not acknowledged',
    ]), y
  );

  pdfFooter(doc);
  doc.save(`Alert_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Report 3: Operational Summary ─────────────────────────────────────────

async function downloadSummaryReport(incidents, alerts) {
  const doc = await makePDF();
  let y = pdfHeader(doc, 'Operational Summary Report', 'System-wide overview across all modules');

  const section = (title) => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFillColor(27, 94, 32); doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(title.toUpperCase(), 17, y + 5);
    doc.setTextColor(30, 30, 30);
    y += 10;
  };

  const row = (label, value, note = '') => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    doc.text(label, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 110, y);
    if (note) { doc.setFontSize(7.5); doc.setTextColor(120,120,120); doc.text(note, 150, y); doc.setTextColor(30,30,30); }
    y += 7;
  };

  // Rangers
  section('Ranger Operations');
  row('Total Rangers',         RANGERS.length);
  row('Rangers On Patrol',     RANGERS.filter(r => r.status === 'On Patrol').length);
  row('Rangers Available',     RANGERS.filter(r => r.status === 'Available').length);
  row('Rangers Offline',       RANGERS.filter(r => r.status === 'Offline').length);
  row('Active Patrol Routes',  PATROL_ROUTES.filter(p => p.status === 'Active').length);
  row('Completed Patrols',     PATROL_ROUTES.filter(p => p.status === 'Completed').length);
  row('Avg Patrol Coverage',   Math.round(PATROL_ROUTES.reduce((s,p) => s + (p.coverage??0), 0) / PATROL_ROUTES.length) + '%');
  y += 4;

  // Incidents
  section('Patrol Incidents');
  row('Total Incidents Logged', incidents.length);
  row('Snares / Traps',         incidents.filter(i => i.type === 'SNARE').length);
  row('Animal Carcasses',       incidents.filter(i => i.type === 'CARCASS').length);
  row('Illegal Campsites',      incidents.filter(i => i.type === 'CAMPSITE').length);
  row('Animal Tracks',          incidents.filter(i => i.type === 'TRACKS').length);
  row('Critical Severity',      incidents.filter(i => i.severity === 'Critical').length);
  row('High Severity',          incidents.filter(i => i.severity === 'High').length);
  y += 4;

  // Alerts
  section('Wildlife Collar Alerts');
  row('Total Alerts Generated', alerts.length);
  row('Active Alerts',          alerts.filter(a => a.status?.startsWith('Active')).length);
  row('Resolved Alerts',        alerts.filter(a => a.status === 'Resolved').length);
  row('Monitoring',             alerts.filter(a => a.status?.includes('Monitoring')).length);
  row('Critical Risk',          alerts.filter(a => a.riskLevel === 'Critical').length);
  row('High Risk',              alerts.filter(a => a.riskLevel === 'High').length);
  row('Resolution Rate',        alerts.length > 0 ? Math.round((alerts.filter(a => a.status==='Resolved').length / alerts.length) * 100) + '%' : '—');
  y += 4;

  // Parks
  section('Park Coverage');
  PARKS.forEach((p) => {
    const pInc   = incidents.filter(i => i.parkId === p.id).length;
    const pAlert = alerts.filter(a => a.parkId === p.id).length;
    const pRng   = RANGERS.filter(r => r.parkId === p.id).length;
    row(p.name, `${pRng} rangers`, `${pInc} incidents · ${pAlert} alerts`);
  });

  pdfFooter(doc);
  doc.save(`Operational_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Main page ─────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: 'incidents', label: 'Patrol Incident Report',      icon: Shield,        color: '#1B5E20', desc: 'All incidents logged by rangers — types, severity, location, sync status.' },
  { id: 'alerts',    label: 'Wildlife Alert Report',       icon: AlertTriangle, color: '#dc2626', desc: 'All collar alerts with risk level, zone, status and ranger acknowledgement.' },
  { id: 'summary',   label: 'Operational Summary Report',  icon: BarChart2,     color: '#2563eb', desc: 'One-page overview of rangers, patrols, incidents and alerts for management.' },
];

export default function Reports() {
  const [incidents, setIncidents] = useState([]);
  const [alerts,    setAlerts]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [active,    setActive]    = useState('incidents');
  const [generating, setGen]      = useState(false);

  // Filters
  const [incFilters,   setIncFilters]   = useState({ park: 'ALL', type: 'ALL' });
  const [alertFilters, setAlertFilters] = useState({ park: 'ALL', risk: 'ALL', status: 'ALL' });

  useEffect(() => {
    let n = 0;
    const check = () => { if (++n >= 2) setLoading(false); };
    const u1 = subscribeToIncidents(({ data }) => { setIncidents(data); check(); });
    const u2 = subscribeToCollarAlerts(({ data }) => { setAlerts(data); check(); });
    return () => { u1(); u2(); };
  }, []);

  // Filtered previews
  const filteredInc = useMemo(() => incidents.filter((i) => {
    if (incFilters.park !== 'ALL' && i.parkId !== incFilters.park) return false;
    if (incFilters.type !== 'ALL' && i.type !== incFilters.type) return false;
    return true;
  }), [incidents, incFilters]);

  const filteredAlerts = useMemo(() => alerts.filter((a) => {
    if (alertFilters.park !== 'ALL' && a.parkId !== alertFilters.park) return false;
    if (alertFilters.risk !== 'ALL' && a.riskLevel !== alertFilters.risk) return false;
    if (alertFilters.status !== 'ALL' && a.status !== alertFilters.status) return false;
    return true;
  }), [alerts, alertFilters]);

  const handleDownload = async () => {
    setGen(true);
    try {
      if (active === 'incidents') await downloadIncidentReport(incidents, incFilters);
      else if (active === 'alerts') await downloadAlertReport(alerts, alertFilters);
      else await downloadSummaryReport(incidents, alerts);
    } catch (e) {
      alert('PDF generation failed: ' + e.message);
    } finally {
      setGen(false);
    }
  };

  const sel = { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, background: '#fff' };

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#1B5E20' }}>Reports</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Generate and download structured operational reports as PDF</p>
        </div>
        <button onClick={handleDownload} disabled={generating || loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: generating ? '#6b7280' : '#1B5E20', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer' }}>
          <Download size={16} /> {generating ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      {/* Report type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {REPORT_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
          <div key={id} onClick={() => setActive(id)}
            style={{ background: '#fff', borderRadius: 10, padding: 16, border: `2px solid ${active === id ? color : '#e5e7eb'}`, cursor: 'pointer', transition: 'border 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: active === id ? color : '#111' }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      {active === 'incidents' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filters:</span>
          <select style={sel} value={incFilters.park} onChange={(e) => setIncFilters((f) => ({ ...f, park: e.target.value }))}>
            <option value="ALL">All Parks</option>
            {PARKS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select style={sel} value={incFilters.type} onChange={(e) => setIncFilters((f) => ({ ...f, type: e.target.value }))}>
            <option value="ALL">All Types</option>
            {['SNARE','CARCASS','TRACKS','CAMPSITE','OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{filteredInc.length} records</span>
        </div>
      )}

      {active === 'alerts' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #e5e7eb', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filters:</span>
          <select style={sel} value={alertFilters.park} onChange={(e) => setAlertFilters((f) => ({ ...f, park: e.target.value }))}>
            <option value="ALL">All Parks</option>
            {PARKS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select style={sel} value={alertFilters.risk} onChange={(e) => setAlertFilters((f) => ({ ...f, risk: e.target.value }))}>
            <option value="ALL">All Risk Levels</option>
            {['Critical','High','Medium','Low'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select style={sel} value={alertFilters.status} onChange={(e) => setAlertFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="ALL">All Statuses</option>
            {['Active','Acknowledged','Active/Monitoring','Active/Reassigned','Resolved'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{filteredAlerts.length} records</span>
        </div>
      )}

      {/* Preview table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Eye size={15} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Preview</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>— first 20 rows shown</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <p style={{ padding: 20, color: '#9ca3af' }}>Loading data…</p>
          ) : active === 'incidents' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                {['Date','Ranger','Park','Type','Severity','Status'].map((h) => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredInc.slice(0,20).map((i, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx%2===0?'#fff':'#fafafa' }}>
                    <td style={{ padding: '8px 12px' }}>{i.recordedAt ? new Date(i.recordedAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{i.rangerId ?? '—'}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{i.parkId ?? '—'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{i.label ?? i.type ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontWeight: 700, fontSize: 11, padding: '2px 7px', borderRadius: 4, background: ({Critical:'#fef2f2',High:'#fff7ed',Medium:'#fffbeb',Low:'#f0fdf4'}[i.severity]??'#f9fafb'), color: ({Critical:'#dc2626',High:'#ea580c',Medium:'#d97706',Low:'#16a34a'}[i.severity]??'#374151') }}>{i.severity??'—'}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{i.status ?? '—'}</td>
                  </tr>
                ))}
                {filteredInc.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No incidents match the filters</td></tr>}
              </tbody>
            </table>
          ) : active === 'alerts' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                {['Date','Animal','Species','Risk Zone','Risk Level','Status','Acknowledged'].map((h) => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredAlerts.slice(0,20).map((a, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', background: idx%2===0?'#fff':'#fafafa' }}>
                    <td style={{ padding: '8px 12px' }}>{a.generatedAt ? new Date(a.generatedAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{a.animalName ?? '—'}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{a.species ?? '—'}</td>
                    <td style={{ padding: '8px 12px', color: '#6b7280' }}>{a.riskZone ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontWeight: 700, fontSize: 11, padding: '2px 7px', borderRadius: 4, color: ({Critical:'#dc2626',High:'#ea580c',Medium:'#d97706',Low:'#16a34a'}[a.riskLevel]??'#374151'), background: ({Critical:'#fef2f2',High:'#fff7ed',Medium:'#fffbeb',Low:'#f0fdf4'}[a.riskLevel]??'#f9fafb') }}>{a.riskLevel}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>{a.status}</td>
                    <td style={{ padding: '8px 12px', color: a.acknowledgedBy ? '#16a34a' : '#9ca3af' }}>{a.acknowledgedBy ?? 'No'}</td>
                  </tr>
                ))}
                {filteredAlerts.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No alerts match the filters</td></tr>}
              </tbody>
            </table>
          ) : (
            // Summary preview
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Total Rangers',       value: RANGERS.length },
                { label: 'On Patrol',           value: RANGERS.filter(r=>r.status==='On Patrol').length },
                { label: 'Active Routes',        value: PATROL_ROUTES.filter(p=>p.status==='Active').length },
                { label: 'Incidents Logged',    value: incidents.length },
                { label: 'Collar Alerts',       value: alerts.length },
                { label: 'Alerts Resolved',     value: alerts.filter(a=>a.status==='Resolved').length },
                { label: 'Critical Incidents',  value: incidents.filter(i=>i.severity==='Critical').length },
                { label: 'Critical Alerts',     value: alerts.filter(a=>a.riskLevel==='Critical').length },
                { label: 'Resolution Rate',     value: alerts.length>0 ? Math.round(alerts.filter(a=>a.status==='Resolved').length/alerts.length*100)+'%' : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1B5E20' }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
