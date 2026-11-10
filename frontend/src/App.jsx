import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';

// Pages
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="devices" element={<DeviceInventory />} />
            <Route path="devices/add" element={<AddDevice />} />
            <Route path="devices/edit/:id" element={<EditDevice />} />
            <Route path="devices/:id" element={<DeviceDetails />} />
            <Route path="topology" element={<NetworkTopology />} />
            <Route path="network-info" element={<NetworkInformation />} />
            <Route path="validator" element={<IPv4Validator />} />
            <Route path="dfa-simulator" element={<DFASimulator />} />
            <Route path="dfa-diagram" element={<DFADiagram />} />
            <Route path="transition-table" element={<TransitionTable />} />
            <Route path="subnet-calculator" element={<SubnetCalculator />} />
            <Route path="monitoring" element={<NetworkMonitoring />} />
            <Route path="connectivity-history" element={<ConnectivityHistoryPage />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="validation-history" element={<ValidationHistoryPage />} />
            <Route path="export-reports" element={<ExportReports />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
