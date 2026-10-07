/**
 * Analytics ΓÇö Full system analytics across all data sources.
 * Data: collar_alerts, incidents, animal_profiles, rangers, patrols, community_reports
 * Includes professional PDF report generation.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, CheckCircle, AlertTriangle, Download, Users, MapPin, Shield, PawPrint, FileText } from 'lucide-react';
import { subscribeToCollarAlerts } from '../services/alertService.js';
import { subscribeToIncidents, subscribeToCommunityReports } from '../services/incidentService.js';
import { subscribeToAnimals } from '../services/animalService.js';
import { RANGERS, PATROL_ROUTES } from '../data/mockData.js';

// ΓöÇΓöÇ PDF generation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

async function generatePDFReport(data) {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  // jspdf-autotable patches jsPDF prototype ΓÇö just import it as side effect
  const autoTable = autoTableModule.default ?? autoTableModule.applyPlugin ?? null;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 14;
  const green  = [27, 94, 32];
  const green2 = [46, 125, 50];
  const gray   = [100, 100, 100];
  const light  = [240, 245, 240];
  const now    = new Date().toLocaleString();

  // ΓöÇΓöÇ Cover header ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  doc.setFillColor(...green);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFillColor(46, 125, 50);
  doc.rect(0, 38, W, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('Smart Wildlife Conservation System', margin, 16);
  doc.setFontSize(13); doc.setFont('helvetica', 'normal');
  doc.text('Operational Analytics & Performance Report', margin, 25);
  doc.setFontSize(9);
  doc.text(`Sri Lanka Department of Wildlife Conservation  ┬╖  Generated: ${now}`, margin, 34);

  let y = 52;

  // ΓöÇΓöÇ KPI summary row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const kpis = [
    { label: 'Patrol Incidents', value: data.incidents.total },
    { label: 'Collar Alerts',    value: data.alerts.total },
    { label: 'Community Reports',value: data.community.total },
    { label: 'Rangers',          value: data.rangers.total },
    { label: 'Active Animals',   value: data.animals.active },
    { label: 'Alert Resolution', value: `${data.alerts.resolutionRate}%` },
  ];
  const cardW = (W - margin * 2 - 10) / 3;
  kpis.forEach((k, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = margin + col * (cardW + 5);
    const cy = y + row * 22;
    doc.setFillColor(...light);
    doc.roundedRect(x, cy, cardW, 18, 2, 2, 'F');
    doc.setDrawColor(...green2);
    doc.roundedRect(x, cy, cardW, 18, 2, 2, 'S');
    doc.setTextColor(...green);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(String(k.value), x + cardW / 2, cy + 9, { align: 'center' });
    doc.setTextColor(...gray);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(k.label, x + cardW / 2, cy + 14, { align: 'center' });
  });

  y += 50;

  // ΓöÇΓöÇ Section helper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const section = (title) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFillColor(...green);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, y + 5);
    y += 10;
    doc.setTextColor(30, 30, 30);
  };

  const tbl = (head, body) => {
    doc.autoTable({
      startY: y, head: [head], body,
      headStyles: { fillColor: [46, 125, 50], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [248, 252, 248] },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 2.5, lineColor: [220, 220, 220], lineWidth: 0.1 },
    });
    y = doc.lastAutoTable.finalY + 6;
  };

  // ΓöÇΓöÇ 1. Patrol Incidents ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  section('1. Patrol Incidents');
  tbl(
    ['Type', 'Park', 'Status', 'Reported At'],
    data.incidents.list.slice(0, 20).map((i) => [
      i.label ?? i.type, i.parkId ?? 'ΓÇö', i.status ?? 'ΓÇö',
      i.recordedAt ? new Date(i.recordedAt).toLocaleDateString() : 'ΓÇö',
    ])
  );

  section('1a. Incidents by Type');
  tbl(
    ['Incident Type', 'Count', '% of Total'],
    data.incidents.byType.map((t) => [
      t.label, t.value, `${Math.round((t.value / (data.incidents.total || 1)) * 100)}%`,
    ])
  );

  section('2. Wildlife Collar Alerts');
  tbl(
    ['Type', 'Animal', 'Risk Level', 'Status', 'Zone', 'Date'],
    data.alerts.list.slice(0, 20).map((a) => [
      a.type, a.animalName ?? 'ΓÇö', a.riskLevel, a.status,
      a.riskZone ?? 'ΓÇö',
      a.generatedAt ? new Date(a.generatedAt).toLocaleDateString() : 'ΓÇö',
    ])
  );

  section('2a. Alerts by Risk Level');
  tbl(
    ['Risk Level', 'Count', 'Resolved', 'Resolution Rate'],
    data.alerts.byRisk.map((r) => [
      r.label, r.value, r.resolved,
      r.value > 0 ? `${Math.round((r.resolved / r.value) * 100)}%` : 'ΓÇö',
    ])
  );

  section('3. Community Reports');
  tbl(
    ['Type', 'Status', 'Location', 'Date'],
    data.community.list.slice(0, 15).map((r) => [
      r.label ?? r.type ?? 'ΓÇö', r.status ?? 'ΓÇö',
      `${r.latitude?.toFixed(3) ?? 'ΓÇö'}, ${r.longitude?.toFixed(3) ?? 'ΓÇö'}`,
      r.recordedAt ? new Date(r.recordedAt).toLocaleDateString() : 'ΓÇö',
    ])
  );

  section('4. Ranger Operations');
  tbl(
    ['Ranger', 'Park', 'Status', 'Patrol Route', 'Sync', 'Battery'],
    data.rangers.list.map((r) => [
      r.name, r.parkId, r.status, r.patrolRouteId ?? 'None',
      r.syncStatus, `${r.battery ?? 'ΓÇö'}%`,
    ])
  );

  section('5. Collared Animal Profiles');
  tbl(
    ['Animal ID', 'Name', 'Species', 'Collar ID', 'Park', 'Status', 'Zone'],
    data.animals.list.map((a) => [
      a.id, a.name, a.species, a.collarId ?? 'ΓÇö',
      a.parkId, a.status, a.zone ?? 'ΓÇö',
    ])
  );

  // ΓöÇΓöÇ Footer on all pages ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 245, 240);
    doc.rect(0, 287, W, 10, 'F');
    doc.setTextColor(...gray);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('Sri Lanka Department of Wildlife Conservation ΓÇö Confidential', margin, 293);
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 293, { align: 'right' });
  }

  doc.save(`WildWatch_Analytics_Report_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ΓöÇΓöÇ Chart components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function BarChart({ data, color = '#1B5E20', height = 140 }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color }}>{d.value}</span>
          <div style={{ width: '100%', height: `${(d.value / max) * (height - 28)}px`, background: color, borderRadius: '3px 3px 0 0', minHeight: d.value > 0 ? 3 : 0 }} />
          <span style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value} ({Math.round(pct)}%)</span>
      </div>
      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Main page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export default function Analytics() {
  const [alerts,    setAlerts]    = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [community, setCommunity] = useState([]);
  const [animals,   setAnimals]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const check = () => { loaded++; if (loaded >= 3) setLoading(false); };

    const u1 = subscribeToCollarAlerts(({ data }) => { setAlerts(data); check(); });
    const u2 = subscribeToIncidents(({ data }) => { setIncidents(data); check(); });
    const u3 = subscribeToCommunityReports(({ data }) => { setCommunity(data); check(); });
    const u4 = subscribeToAnimals(({ data }) => setAnimals(data));

    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // ΓöÇΓöÇ Derived stats ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const stats = useMemo(() => {
    // Alerts
    const alertTotal    = alerts.length;
    const alertResolved = alerts.filter((a) => a.status === 'Resolved').length;
    const alertActive   = alerts.filter((a) => a.status?.startsWith('Active')).length;
    const alertCritical = alerts.filter((a) => a.riskLevel === 'Critical').length;
    const resolutionRate = alertTotal > 0 ? Math.round((alertResolved / alertTotal) * 100) : 0;

    const alertsByRisk = ['Critical','High','Medium','Low'].map((r) => ({
      label: r, value: alerts.filter((a) => a.riskLevel === r).length,
      resolved: alerts.filter((a) => a.riskLevel === r && a.status === 'Resolved').length,
    }));
    const alertsByPark = Object.entries(
      alerts.reduce((acc, a) => { const k = (a.parkName ?? a.parkId ?? 'Unknown').replace('National Park','').replace('Forest Reserve','').trim(); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value).slice(0,5);

    const alertsByStatus = Object.entries(
      alerts.reduce((acc, a) => { acc[a.status ?? 'Unknown'] = (acc[a.status ?? 'Unknown'] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label, value }));

    // Incidents
    const incTotal = incidents.length;
    const incByType = Object.entries(
      incidents.reduce((acc, i) => { const k = i.label ?? i.type ?? 'Other'; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label: label.length > 12 ? label.slice(0,12)+'ΓÇª' : label, value })).sort((a,b) => b.value - a.value);

    const incByPark = Object.entries(
      incidents.reduce((acc, i) => { acc[i.parkId ?? 'Unknown'] = (acc[i.parkId ?? 'Unknown'] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label: label.replace('PARK-',''), value }));

    const incBySeverity = ['Critical','High','Medium','Low','Unknown'].map((s) => ({
      label: s, value: incidents.filter((i) => i.severity === s).length,
    })).filter((s) => s.value > 0);

    // Community
    const commTotal = community.length;
    const commByStatus = Object.entries(
      community.reduce((acc, r) => { acc[r.status ?? 'Unknown'] = (acc[r.status ?? 'Unknown'] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label, value }));

    // Rangers
    const rangerTotal     = RANGERS.length;
    const rangersOnPatrol = RANGERS.filter((r) => r.status === 'On Patrol').length;
    const rangersOffline  = RANGERS.filter((r) => r.status === 'Offline').length;
    const patrolActive    = PATROL_ROUTES.filter((p) => p.status === 'Active').length;
    const patrolDone      = PATROL_ROUTES.filter((p) => p.status === 'Completed').length;
    const avgCoverage     = Math.round(PATROL_ROUTES.reduce((s, p) => s + (p.coverage ?? 0), 0) / PATROL_ROUTES.length);

    const rangersByPark = Object.entries(
      RANGERS.reduce((acc, r) => { acc[r.parkId?.replace('PARK-','') ?? 'Unknown'] = (acc[r.parkId?.replace('PARK-','') ?? 'Unknown'] ?? 0) + 1; return acc; }, {})
    ).map(([label, value]) => ({ label, value }));

    // Animals
    const animalTotal  = animals.length;
    const animalActive = animals.filter((a) => a.status === 'Active').length;
    const animalAlert  = animals.filter((a) => a.status === 'Alert').length;

    return {
      alerts:    { total: alertTotal, resolved: alertResolved, active: alertActive, critical: alertCritical, resolutionRate, byRisk: alertsByRisk, byPark: alertsByPark, byStatus: alertsByStatus, list: alerts },
      incidents: { total: incTotal, byType: incByType, byPark: incByPark, bySeverity: incBySeverity, list: incidents },
      community: { total: commTotal, byStatus: commByStatus, list: community },
      rangers:   { total: rangerTotal, onPatrol: rangersOnPatrol, offline: rangersOffline, patrolActive, patrolDone, avgCoverage, byPark: rangersByPark, list: RANGERS },
      animals:   { total: animalTotal, active: animalActive, alert: animalAlert, list: animals },
    };
  }, [alerts, incidents, community, animals]);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      await generatePDFReport(stats);
    } catch (e) {
      alert('PDF generation failed: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280', flexDirection: 'column', gap: 12 }}>
      <BarChart2 size={32} color="#1B5E20" />
      <p>Loading analyticsΓÇª</p>
    </div>
  );

  const STATUS_COLORS = { Resolved: '#16a34a', 'Active/Monitoring': '#d97706', 'Active/Reassigned': '#2563eb', Active: '#dc2626', Acknowledged: '#7c3aed', Received: '#0891b2', Synced: '#16a34a', Failed: '#dc2626' };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#1B5E20' }}>System Analytics</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Live data across all system modules ΓÇö incidents, alerts, rangers, animals, community reports</p>
        </div>
        <button onClick={handleDownloadPDF} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: generating ? '#6b7280' : '#1B5E20', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer' }}>
          <Download size={16} />{generating ? 'Generating PDFΓÇª' : 'Download Report (PDF)'}
        </button>
      </div>

      {/* ΓöÇΓöÇ KPI Grid ΓöÇΓöÇ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KPICard label="Patrol Incidents"   value={stats.incidents.total} color="#1B5E20" icon={Shield}       sub="Logged by rangers" />
        <KPICard label="Collar Alerts"      value={stats.alerts.total}    color="#dc2626" icon={AlertTriangle} sub={`${stats.alerts.active} active`} />
        <KPICard label="Alert Resolution"   value={`${stats.alerts.resolutionRate}%`} color="#16a34a" icon={CheckCircle} sub={`${stats.alerts.resolved} resolved`} />
        <KPICard label="Community Reports"  value={stats.community.total} color="#7c3aed" icon={FileText}      sub="From public" />
        <KPICard label="Rangers"            value={stats.rangers.total}   color="#2563eb" icon={Users}         sub={`${stats.rangers.onPatrol} on patrol`} />
        <KPICard label="Active Patrols"     value={stats.rangers.patrolActive} color="#0891b2" icon={MapPin}   sub={`${stats.rangers.avgCoverage}% avg coverage`} />
        <KPICard label="Collared Animals"   value={stats.animals.total}   color="#d97706" icon={PawPrint}      sub={`${stats.animals.alert} in alert status`} />
        <KPICard label="Critical Alerts"    value={stats.alerts.critical} color="#b91c1c" icon={AlertTriangle} sub="Immediate response needed" />
      </div>

      {/* ΓöÇΓöÇ Row 1: Incidents + Alerts by risk ΓöÇΓöÇ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Patrol Incidents by Type</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Logged via mobile app by rangers</p>
          {stats.incidents.byType.length === 0
            ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No incidents recorded yet</p>
            : <BarChart data={stats.incidents.byType} color="#1B5E20" />}
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Collar Alerts by Risk Level</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>GPS collar high-risk zone events</p>
          <BarChart data={stats.alerts.byRisk} color="#dc2626" />
        </div>
      </div>

      {/* ΓöÇΓöÇ Row 2: Park distribution ΓöÇΓöÇ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Incidents by Park</h3>
          <BarChart data={stats.incidents.byPark} color="#2563eb" height={120} />
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Alerts by Park</h3>
          <BarChart data={stats.alerts.byPark} color="#d97706" height={120} />
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Rangers by Park</h3>
          <BarChart data={stats.rangers.byPark} color="#7c3aed" height={120} />
        </div>
      </div>

      {/* ΓöÇΓöÇ Row 3: Status breakdowns ΓöÇΓöÇ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Alert Status Breakdown</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Current lifecycle state of all collar alerts</p>
          {stats.alerts.byStatus.map(({ label, value }) => (
            <ProgressBar key={label} label={label} value={value} total={stats.alerts.total} color={STATUS_COLORS[label] ?? '#6b7280'} />
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Community Report Status</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Reports from public submitted via mobile</p>
          {stats.community.byStatus.length === 0
            ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No community reports yet</p>
            : stats.community.byStatus.map(({ label, value }) => (
              <ProgressBar key={label} label={label} value={value} total={stats.community.total} color={STATUS_COLORS[label] ?? '#6b7280'} />
            ))
          }
        </div>
      </div>

      {/* ΓöÇΓöÇ Row 4: Ranger operations ΓöÇΓöÇ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Ranger Deployment Status</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Current field deployment across all parks</p>
          {[
            { label: 'On Patrol', value: stats.rangers.onPatrol, color: '#16a34a' },
            { label: 'Available', value: stats.rangers.total - stats.rangers.onPatrol - stats.rangers.offline, color: '#2563eb' },
            { label: 'Offline',   value: stats.rangers.offline, color: '#6b7280' },
          ].map((r) => <ProgressBar key={r.label} label={r.label} value={r.value} total={stats.rangers.total} color={r.color} />)}
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Patrol Coverage</h3>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Active routes vs completed today</p>
          {[
            { label: 'Active Patrols',    value: stats.rangers.patrolActive, color: '#16a34a' },
            { label: 'Completed Today',   value: stats.rangers.patrolDone,   color: '#2563eb' },
            { label: 'Average Coverage',  value: stats.rangers.avgCoverage, color: '#d97706', isPercent: true },
          ].map((r) => (
            <div key={r.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: '#374151' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.isPercent ? `${r.value}%` : r.value}</span>
              </div>
              {!r.isPercent && <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${Math.min((r.value / (stats.rangers.patrolActive + stats.rangers.patrolDone || 1)) * 100, 100)}%`, background: r.color, borderRadius: 3 }} />
              </div>}
            </div>
          ))}
        </div>
      </div>

      {/* ΓöÇΓöÇ Row 5: Incident severity ΓöÇΓöÇ */}
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 14 }}>Incident Severity Distribution</h3>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>Breakdown of all patrol incidents by severity level</p>
        {stats.incidents.bySeverity.length === 0
          ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No incidents recorded yet</p>
          : <div style={{ display: 'flex', gap: 8 }}>
              {stats.incidents.bySeverity.map((s) => {
                const c = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a', Unknown: '#6b7280' }[s.label] ?? '#6b7280';
                return (
                  <div key={s.label} style={{ flex: 1, background: c + '12', borderRadius: 8, padding: '12px', textAlign: 'center', border: `1px solid ${c}30` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: c, fontWeight: 600 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
        }
      </div>

    </div>
  );
}
