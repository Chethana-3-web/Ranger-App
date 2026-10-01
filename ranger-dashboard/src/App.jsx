import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Monitoring from './pages/Monitoring.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

/**
 * App – top-level router.
 *
 * Member 2 owns /monitoring.
 * Other routes are stubs so navigation links work; teammates replace them.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/monitoring" replace />} />
        <Route path="dashboard"  element={<PlaceholderPage title="Dashboard Overview"          member={1} />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="incidents"  element={<PlaceholderPage title="Incidents"                   member={3} />} />
        <Route path="community"  element={<PlaceholderPage title="Community Reports"           member={3} />} />
        <Route path="wildlife"   element={<PlaceholderPage title="Wildlife"                    member={4} />} />
        <Route path="alerts"     element={<PlaceholderPage title="Wildlife Alerts"             member={4} />} />
        <Route path="analytics"  element={<PlaceholderPage title="Analytics & Reports"         member={4} />} />
        <Route path="reports"    element={<PlaceholderPage title="Reports"                     member={4} />} />
      </Route>
      <Route path="*" element={<Navigate to="/monitoring" replace />} />
    </Routes>
  );
}
