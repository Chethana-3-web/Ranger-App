import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/** Shared shell used by all four members' pages. Member 1 enhances this. */
export default function DashboardLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
