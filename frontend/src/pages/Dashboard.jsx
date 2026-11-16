import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import ViewerDashboard from './dashboards/ViewerDashboard';

/**
 * NetTrack DFA - Role-Aware Dynamic Dashboard
 * Dispatches to dedicated dashboards based on authenticated user's role:
 * - Admin -> AdminDashboard (Full telemetry, audit logs, system administration)
 * - Faculty / IT Staff -> StaffDashboard (Lab operational focus, equipment telemetry, ping probes)
 * - Viewer / User -> ViewerDashboard (Clean user portal, prominent device registration, network info)
 */
export default function Dashboard() {
  const { user, isAdmin, isFacultyStaff } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isFacultyStaff) {
    return <StaffDashboard />;
  }

  return <ViewerDashboard />;
}
