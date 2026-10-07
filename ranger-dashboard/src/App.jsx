import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Monitoring from './pages/Monitoring.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import CommunityReports from './pages/CommunityReports.jsx';
import Incidents from './pages/Incidents.jsx';
import IncidentDetails from './pages/IncidentDetails.jsx';
import VerifyRangers from './pages/VerifyRangers.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import WildlifeAlerts from './pages/WildlifeAlerts.jsx';
import Analytics from './pages/Analytics.jsx';
import Wildlife from './pages/Wildlife.jsx';
import Reports from './pages/Reports.jsx';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardOverview />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="incidents"  element={<Incidents />} />
        <Route path="incidents/:id" element={<IncidentDetails />} />
        <Route path="community"  element={<CommunityReports />} />
        <Route path="wildlife"   element={<Wildlife />} />
        <Route path="alerts"     element={<WildlifeAlerts />} />
        <Route path="analytics"  element={<Analytics />} />
        <Route path="reports"    element={<Reports />} />
        <Route path="verify"     element={<VerifyRangers />} />
        <Route path="settings"   element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
