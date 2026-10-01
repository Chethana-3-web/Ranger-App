import React from 'react';
import { Users, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

// Simple SVG Bar Chart
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 12, marginTop: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: '100%', 
            height: `${(d.value / max) * 100}%`, 
            backgroundColor: '#2e7d32', 
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s'
          }} />
          <span style={{ fontSize: 12, color: '#666' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardOverview() {
  const weeklyData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 25 },
    { label: 'Fri', value: 22 },
    { label: 'Sat', value: 30 },
    { label: 'Sun', value: 28 },
  ];

  const statCards = [
    { title: 'Total Rangers', value: '142', icon: Users, color: '#1976d2' },
    { title: 'Active Patrols', value: '24', icon: ShieldCheck, color: '#388e3c' },
    { title: 'New Incidents', value: '15', icon: AlertTriangle, color: '#d32f2f' },
    { title: 'Areas Covered', value: '87%', icon: MapPin, color: '#f57c00' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#333' }}>Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `${stat.color}15`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <stat.icon size={28} color={stat.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: '#666', fontWeight: '500' }}>{stat.title}</p>
              <h2 style={{ margin: '4px 0 0 0', fontSize: 24, fontWeight: 'bold', color: '#333' }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Chart Section */}
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333' }}>Incidents This Week</h3>
          <BarChart data={weeklyData} />
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333' }}>Recent Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { time: '10 mins ago', text: 'Poaching trap found in Sector 4', type: 'high' },
              { time: '1 hour ago', text: 'Elephant herd crossing Highway A2', type: 'medium' },
              { time: '3 hours ago', text: 'Ranger Team Alpha started patrol', type: 'info' },
              { time: '5 hours ago', text: 'Suspicious vehicle reported', type: 'high' },
            ].map((alert, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, marginTop: 6, backgroundColor: alert.type === 'high' ? '#d32f2f' : alert.type === 'medium' ? '#f57c00' : '#1976d2' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: '#333' }}>{alert.text}</p>
                  <span style={{ fontSize: 12, color: '#888' }}>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
