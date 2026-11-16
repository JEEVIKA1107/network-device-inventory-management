import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Router,
  Monitor,
  HardDrive,
  Printer,
  Wifi,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Users,
  Settings,
  Shield,
  Layers,
  FileCheck2
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px auto', color: '#2563EB' }} />
        <p>Loading central network telemetry from MongoDB...</p>
      </div>
    );
  }

  const { summary, charts, recentActivities } = data || {};

  // Doughnut Chart: Device Categories
  const categoryChartData = {
    labels: charts?.categoryDistribution?.labels || [],
    datasets: [
      {
        data: charts?.categoryDistribution?.data || [],
        backgroundColor: [
          '#142D4E', // Router (Navy)
          '#2563EB', // Switch (Royal Blue)
          '#0D9488', // Computer (Teal)
          '#8B5CF6', // Server (Purple)
          '#F59E0B', // Printer (Amber)
          '#EC4899'  // WAP (Pink)
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // Pie Chart: Online vs Offline Status
  const statusChartData = {
    labels: charts?.connectionStatusDistribution?.labels || [],
    datasets: [
      {
        data: charts?.connectionStatusDistribution?.data || [],
        backgroundColor: ['#10B981', '#EF4444', '#94A3B8'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
              System Administrator Dashboard
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#DBEAFE',
                color: '#1E40AF',
                border: '1px solid #BFDBFE'
              }}
            >
              Full Access Mode
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
            Central IT &amp; campus-wide network infrastructure control, user governance and telemetry
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </button>
          <Link to="/devices/add" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Quick Register Device</span>
          </Link>
        </div>
      </div>

      {/* Admin Quick Action Hub */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #142D4E 0%, #1E3A8A 100%)',
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              Administrator Operations Bar
            </div>
            <div style={{ fontSize: '0.78rem', color: '#93C5FD', marginTop: '2px' }}>
              Direct access to system administration modules and user governance
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Link
              to="/users"
              className="btn btn-sm"
              style={{ background: '#FFFFFF', color: '#1E3A8A', fontWeight: 600 }}
            >
              <Users size={14} />
              <span>User Management</span>
            </Link>
            <Link
              to="/settings"
              className="btn btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <Settings size={14} />
              <span>Network Scopes</span>
            </Link>
            <Link
              to="/reports"
              className="btn btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              <FileCheck2 size={14} />
              <span>Audit Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 10 Core Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Total Devices */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #142D4E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>1. Total Devices</span>
            <Server size={18} color="#142D4E" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#142D4E', marginTop: '8px' }}>
            {summary?.totalDevices ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Registered in MongoDB</div>
        </div>

        {/* Active Devices */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>2. Active Devices</span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            {summary?.activeDevices ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>Online &amp; reachable</div>
        </div>

        {/* Inactive Devices */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>3. Inactive Devices</span>
            <XCircle size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', marginTop: '8px' }}>
            {summary?.inactiveDevices ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '4px' }}>Offline / unreachable</div>
        </div>

        {/* Routers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>4. Routers</span>
            <Router size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '8px' }}>
            {summary?.routers ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Layer 3 Gateways</div>
        </div>

        {/* Switches */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>5. Switches</span>
            <Cpu size={18} color="#0284C7" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284C7', marginTop: '8px' }}>
            {summary?.switches ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Layer 2 Distribution</div>
        </div>

        {/* Computers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0D9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>6. Computers</span>
            <Monitor size={18} color="#0D9488" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D9488', marginTop: '8px' }}>
            {summary?.computers ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Workstations &amp; PCs</div>
        </div>

        {/* Servers */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>7. Servers</span>
            <HardDrive size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8B5CF6', marginTop: '8px' }}>
            {summary?.servers ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Data Center Hosts</div>
        </div>

        {/* Valid IPv4 */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>8. Valid IPv4s</span>
            <ShieldCheck size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: '8px' }}>
            {summary?.validIPv4Count ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>DFA &amp; Regex verified</div>
        </div>

        {/* Invalid IPv4 */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>9. Invalid Attempts</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', marginTop: '8px' }}>
            {summary?.invalidIPv4Count ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '4px' }}>Automata trap rejected</div>
        </div>

        {/* Duplicate IP Conflicts */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>10. Duplicate IP Conflicts</span>
            <AlertTriangle size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', marginTop: '8px' }}>
            {summary?.duplicateIPCount ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '4px' }}>Subnet scope collisions</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Device Categories Doughnut */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E' }}>
              Campus Infrastructure Categories
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>MongoDB Aggregate</span>
          </div>
          <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {charts?.categoryDistribution?.data?.length ? (
              <Doughnut
                data={categoryChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                  }
                }}
              />
            ) : (
              <p style={{ color: '#94A3B8' }}>No device data recorded</p>
            )}
          </div>
        </div>

        {/* Reachability Status Pie */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E' }}>
              Reachability &amp; Operational Health
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>TCP Socket Probes</span>
          </div>
          <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {charts?.connectionStatusDistribution?.data?.length ? (
              <Pie
                data={statusChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                  }
                }}
              />
            ) : (
              <p style={{ color: '#94A3B8' }}>No telemetry status recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* System Audit Activity Stream */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E' }}>
              Administrative System Audit Trail
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Immutable audit logs tracking device registrations, deletions and security events
            </p>
          </div>
          <Link to="/reports" className="btn btn-outline btn-sm">
            <span>View All Logs</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Activity size={16} color="#2563EB" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                      {act.description}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>By: <strong>{act.userName}</strong> ({act.userRole})</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No recent activity records</p>
          )}
        </div>
      </div>
    </div>
  );
}
