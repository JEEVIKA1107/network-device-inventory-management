import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DeviceInventory from './pages/DeviceInventory';
import AddDevice from './pages/AddDevice';
import EditDevice from './pages/EditDevice';
import DeviceDetails from './pages/DeviceDetails';
import NetworkTopology from './pages/NetworkTopology';
import NetworkInformation from './pages/NetworkInformation';
import IPv4Validator from './pages/IPv4Validator';
import DFASimulator from './pages/DFASimulator';
import DFADiagram from './pages/DFADiagram';
import TransitionTable from './pages/TransitionTable';
import SubnetCalculator from './pages/SubnetCalculator';
import NetworkMonitoring from './pages/NetworkMonitoring';
import ConnectivityHistoryPage from './pages/ConnectivityHistoryPage';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ValidationHistoryPage from './pages/ValidationHistoryPage';
import ExportReports from './pages/ExportReports';
import UserManagement from './pages/UserManagement';
import SettingsPage from './pages/SettingsPage';
import FeedbackSubmit from './pages/FeedbackSubmit';

// Redirect users to their correct dashboard
function RoleHome() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return (
    <Navigate
      to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
      replace
    />
  );
}

// Protect pages based on user role
function RequireRole({ allowedRoles, children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
        replace
      />
    );
  }

  return children;
}

// Protect the main application layout
function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return <MainLayout />;
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading NetTrack DFA...</div>;
  }

  return (
    <Routes>

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={
          user
            ? (
              <Navigate
                to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                replace
              />
            )
            : <Login portal="admin" />
        }
      />

      {/* Regular User Login */}
      <Route
        path="/user/login"
        element={
          user
            ? (
              <Navigate
                to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                replace
              />
            )
            : <Login portal="user" />
        }
      />

      {/* Old login URL redirects to User Login */}
      <Route
        path="/login"
        element={<Navigate to="/user/login" replace />}
      />

      {/* Protected Application Pages */}
      <Route path="/" element={<ProtectedLayout />}>

        <Route index element={<RoleHome />} />

        {/* Dashboard Routes */}
        <Route
          path="dashboard"
          element={<RoleHome />}
        />

        <Route
          path="admin/dashboard"
          element={
            <RequireRole allowedRoles={['Admin']}>
              <Dashboard />
            </RequireRole>
          }
        />

        <Route
          path="user/dashboard"
          element={
            <RequireRole
              allowedRoles={['Faculty / IT Staff', 'Viewer']}
            >
              <Dashboard />
            </RequireRole>
          }
        />

        {/* Device Viewing - All Logged-in Users */}
        <Route path="devices" element={<DeviceInventory />} />

        <Route
          path="devices/:id"
          element={<DeviceDetails />}
        />

        {/* Device Management - Admin Only */}
        <Route
          path="devices/add"
          element={
            <RequireRole allowedRoles={['Admin']}>
              <AddDevice />
            </RequireRole>
          }
        />

        <Route
          path="devices/edit/:id"
          element={
            <RequireRole allowedRoles={['Admin']}>
              <EditDevice />
            </RequireRole>
          }
        />

        {/* Network Tools - All Logged-in Users */}
        <Route path="topology" element={<NetworkTopology />} />
        <Route path="network-info" element={<NetworkInformation />} />
        <Route path="validator" element={<IPv4Validator />} />
        <Route path="dfa-simulator" element={<DFASimulator />} />
        <Route path="dfa-diagram" element={<DFADiagram />} />
        <Route path="transition-table" element={<TransitionTable />} />
        <Route path="subnet-calculator" element={<SubnetCalculator />} />
        <Route path="monitoring" element={<NetworkMonitoring />} />
        <Route
          path="connectivity-history"
          element={<ConnectivityHistoryPage />}
        />

        {/* Reports - All Logged-in Users */}
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route
          path="validation-history"
          element={<ValidationHistoryPage />}
        />
        <Route path="export-reports" element={<ExportReports />} />

        {/* Feedback Submission - Regular Users & Staff Only */}
        <Route
          path="feedback"
          element={
            <RequireRole allowedRoles={['Faculty / IT Staff', 'Viewer']}>
              <FeedbackSubmit />
            </RequireRole>
          }
        />

        {/* User Management - Admin Only */}
        <Route
          path="users"
          element={
            <RequireRole allowedRoles={['Admin']}>
              <UserManagement />
            </RequireRole>
          }
        />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />

      </Route>

      {/* Unknown URLs */}
      <Route path="*" element={<RoleHome />} />

    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}