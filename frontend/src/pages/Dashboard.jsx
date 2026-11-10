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
  ArrowUpRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line, Pie } from 'react-chartjs-2';
import api from '../api/axiosClient';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

export default function Dashboard() {
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
      console.error('Failed to load dashboard:', err);
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
        <p>Loading real-time network telemetry from MongoDB...</p>
      </div>
    );
  }

  const { summary, charts, recentActivities, recentConnectivityLogs } = data || {};

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Infrastructure Overview
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Active monitoring across campus subnets &amp; canonical IPv4 validation telemetry
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

        {/* Valid IPv4 Addresses */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #16A34A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>8. Valid IPv4</span>
            <ShieldCheck size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', marginTop: '8px' }}>
            {summary?.validIpValidations ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '4px' }}>DFA Accepted Traces</div>
        </div>

        {/* Invalid IPv4 Attempts */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>9. Invalid IPv4</span>
            <XCircle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', marginTop: '8px' }}>
            {summary?.invalidIpValidations ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#991B1B', marginTop: '4px' }}>Trapped in Dead State</div>
        </div>

        {/* Duplicate IP Conflicts */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>10. IP Conflicts</span>
            <AlertTriangle size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', marginTop: '8px' }}>
            {summary?.duplicateIPConflicts ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '4px' }}>Duplicate Assignments</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Device Category Doughnut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Device Category Breakdown</div>
            <span className="badge badge-info">Real-time</span>
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }}
            />
          </div>
        </div>

        {/* Online vs Offline Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Device Reachability Telemetry</div>
            <span className="badge badge-success">Ping Status</span>
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pie
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activities & Recent Connectivity Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Audit Activities</div>
            <Link to="/reports" style={{ fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              View Analytics →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{act.description}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Clock size={12} />
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>User: {act.userName}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                No recent activity records.
              </div>
            )}
          </div>
        </div>

        {/* Connectivity Telemetry Logs */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Host Probes</div>
            <Link to="/connectivity-history" style={{ fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
              Full History →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentConnectivityLogs && recentConnectivityLogs.length > 0 ? (
              recentConnectivityLogs.map((log) => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                      {log.deviceId?.deviceName || log.deviceIp}
                    </div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {log.deviceIp}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {log.responseTime}ms
                    </span>
                    <span className={`badge ${log.status === 'Online' ? 'badge-online' : log.status === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                No recent host probe telemetry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
