import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, AlertTriangle, Users,
  PawPrint, Bell, BarChart2, FileText, Settings, LogOut
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/monitoring', icon: Map,             label: 'Live Monitoring' },
  { to: '/verify',     icon: Users,           label: 'Verify Rangers' },
  { to: '/incidents',  icon: AlertTriangle,   label: 'Incidents' },
  { to: '/community',  icon: Users,           label: 'Community Reports' },
  { to: '/wildlife',   icon: PawPrint,        label: 'Wildlife' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/reports',    icon: FileText,        label: 'Reports' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('admin_auth');
    window.location.href = '/login';
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">Smart Wildlife Conservation</div>
          <div className="sidebar-logo-subtitle">Operations Dashboard</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV.map(({ to, icon: Icon, label }) => {
            const isActive = window.location.pathname === to;
            return (
              <a
                key={to}
                href={to}
                className={`nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
              </a>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
          <a href="/settings" className={`nav-item${window.location.pathname === '/settings' ? ' active' : ''}`}>
            <Settings size={16} strokeWidth={1.8} />
            <span>Settings</span>
          </a>
          <span className="nav-item" style={{ cursor: 'pointer', color: '#d32f2f' }} onClick={() => setShowLogoutModal(true)}>
            <LogOut size={16} strokeWidth={1.8} />
            <span>Log Out</span>
          </span>
        </nav>

        <div className="sidebar-footer">SE3070 · Sri Lanka DWC</div>
      </aside>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, width: 300, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Confirm Logout</h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>Are you sure you want to log out?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4, background: 'transparent', cursor: 'pointer', flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 4, background: '#d32f2f', color: 'white', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
