import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Monitoring from './pages/Monitoring.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import VerifyRangers from './pages/VerifyRangers.jsx';
import Login from './pages/Login.jsx';

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
        <Route path="incidents"  element={<PlaceholderPage title="Incidents"                   member={3} />} />
        <Route path="community"  element={<PlaceholderPage title="Community Reports"           member={3} />} />
        <Route path="wildlife"   element={<PlaceholderPage title="Wildlife"                    member={4} />} />
        <Route path="alerts"     element={<PlaceholderPage title="Wildlife Alerts"             member={4} />} />
        <Route path="analytics"  element={<PlaceholderPage title="Analytics & Reports"         member={4} />} />
        <Route path="reports"    element={<PlaceholderPage title="Reports"                     member={4} />} />
        <Route path="verify"     element={<VerifyRangers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
