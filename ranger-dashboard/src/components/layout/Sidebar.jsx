import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, AlertTriangle, Users,
  PawPrint, Bell, BarChart2, FileText, Settings,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/monitoring', icon: Map,             label: 'Live Monitoring' },
  { to: '/incidents',  icon: AlertTriangle,   label: 'Incidents' },
  { to: '/community',  icon: Users,           label: 'Community Reports' },
  { to: '/wildlife',   icon: PawPrint,        label: 'Wildlife' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/reports',    icon: FileText,        label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">Smart Wildlife Conservation</div>
        <div className="sidebar-logo-subtitle">Operations Dashboard</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
        <span className="nav-item" style={{ opacity: 0.5, cursor: 'default' }}>
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </span>
      </nav>

      <div className="sidebar-footer">SE3070 · Sri Lanka DWC</div>
    </aside>
  );
}
