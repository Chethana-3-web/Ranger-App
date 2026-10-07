import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Member 1 – Login + Dashboard Overview
import Login          from './pages/Login.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import VerifyRangers  from './pages/VerifyRangers.jsx';
import Settings       from './pages/Settings.jsx';

// Member 2 – Live Monitoring
import Monitoring     from './pages/Monitoring.jsx';

// Member 3 – Incidents + Community Reports
import Incidents      from './pages/Incidents.jsx';
import IncidentDetails from './pages/IncidentDetails.jsx';
import CommunityReports from './pages/CommunityReports.jsx';

// Member 4 – Wildlife + Alerts + Analytics + Reports
import Wildlife       from './pages/Wildlife.jsx';
import WildlifeAlerts from './pages/WildlifeAlerts.jsx';
import Analytics      from './pages/Analytics.jsx';
import Reports        from './pages/Reports.jsx';

/**
 * PrivateRoute – redirects to /login if not authenticated.
 * Uses localStorage key 'admin_auth' set by the Login page.
 */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected – all dashboard pages share the layout */}
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index                element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardOverview />} />
        <Route path="monitoring"    element={<Monitoring />} />
        <Route path="incidents"     element={<Incidents />} />
        <Route path="incidents/:id" element={<IncidentDetails />} />
        <Route path="community"     element={<CommunityReports />} />
        <Route path="wildlife"      element={<Wildlife />} />
        <Route path="alerts"        element={<WildlifeAlerts />} />
        <Route path="analytics"     element={<Analytics />} />
        <Route path="reports"       element={<Reports />} />
        <Route path="verify"        element={<VerifyRangers />} />
        <Route path="settings"      element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
