/**
 * App — root router for the Smart Wildlife Conservation Dashboard.
 *
 * Route ownership:
 *   /login              → Member 1 (replace PlaceholderPage)
 *   /dashboard          → Member 1 (replace PlaceholderPage)
 *   /monitoring         → Member 2 ✅
 *   /incidents          → Member 3 (replace PlaceholderPage)
 *   /community-reports  → Member 3 (replace PlaceholderPage)
 *   /wildlife           → Member 4 (replace PlaceholderPage)
 *   /alerts             → Member 4 (replace PlaceholderPage)
 *   /analytics          → Member 4 (replace PlaceholderPage)
 *   /reports            → Member 4 (replace PlaceholderPage)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Monitoring from './pages/Monitoring';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to monitoring (Member 1 will redirect to /dashboard after adding login) */}
        <Route path="/" element={<Navigate to="/monitoring" replace />} />

        {/* Login — Member 1 */}
        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Login"
              owner="Member 1 — Authentication & Overview"
            />
          }
        />

        {/* All dashboard routes share the sidebar/topbar layout */}
        <Route element={<DashboardLayout />}>
          {/* Member 1 */}
          <Route
            path="/dashboard"
            element={
              <PlaceholderPage
                title="Dashboard Overview"
                owner="Member 1 — KPI cards, recent incidents, alerts"
              />
            }
          />

          {/* Member 2 — Live Monitoring ✅ */}
          <Route path="/monitoring" element={<Monitoring />} />

          {/* Member 3 */}
          <Route
            path="/incidents"
            element={
              <PlaceholderPage
                title="Incidents"
                owner="Member 3 — Incident list, details, evidence, workflow"
              />
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <PlaceholderPage
                title="Incident Details"
                owner="Member 3 — Incident details view"
              />
            }
          />
          <Route
            path="/community-reports"
            element={
              <PlaceholderPage
                title="Community Reports"
                owner="Member 3 — Community report list and workflow"
              />
            }
          />

          {/* Member 4 */}
          <Route
            path="/wildlife"
            element={
              <PlaceholderPage
                title="Wildlife Monitoring"
                owner="Member 4 — Collar tracking, elephant alerts"
              />
            }
          />
          <Route
            path="/alerts"
            element={
              <PlaceholderPage
                title="Alerts"
                owner="Member 4 — Wildlife and incident alerts"
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                owner="Member 4 — Charts, park stats, patrol coverage"
              />
            }
          />
          <Route
            path="/reports"
            element={
              <PlaceholderPage
                title="Reports"
                owner="Member 4 — Report generation and export"
              />
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                owner="Shared — system configuration"
              />
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/monitoring" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
