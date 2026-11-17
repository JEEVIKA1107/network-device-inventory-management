
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
  Cpu,
  PlusCircle,
  Network,
  ShieldCheck,
  Calculator,
  RefreshCw,
  Clock,
  DownloadCloud,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

export default function StaffDashboard() {
  const { user } = useAuth();

  // Only Admin can add or register devices
  const isAdmin = user?.role === 'Admin';

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
      console.error('Failed to load staff dashboard:', err);
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
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748B'
        }}
      >
        <RefreshCw
          size={28}
          className="spin"
          style={{
            margin: '0 auto 12px auto',
            color: '#2563EB'
          }}
        />
        <p>Loading staff operational telemetry from MongoDB...</p>
      </div>
    );
  }

  const { summary, charts, recentConnectivityLogs } = data || {};

  // Device Categories Chart
  const categoryChartData = {
    labels: charts?.categoryDistribution?.labels || [],
    datasets: [
      {
        data: charts?.categoryDistribution?.data || [],
        backgroundColor: [
          '#142D4E',
          '#2563EB',
          '#0D9488',
          '#8B5CF6',
          '#F59E0B',
          '#EC4899'
        ],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  // Online vs Offline Chart
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Top Banner and Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#142D4E'
              }}
            >
              Staff Operations Dashboard
            </h2>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '12px',
                background: '#D1FAE5',
                color: '#065F46',
                border: '1px solid #A7F3D0'
              }}
            >
              Operational Staff Mode
            </span>
          </div>

          <p
            style={{
              fontSize: '0.85rem',
              color: '#64748B',
              marginTop: '2px'
            }}
          >
            Lab equipment inventory, reachability telemetry and practical
            network operations
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw
              size={14}
              className={refreshing ? 'spin' : ''}
            />
            <span>
              {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
            </span>
          </button>

          {/* Admin Only: Register New Device */}
          {isAdmin && (
            <Link
              to="/devices/add"
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={15} />
              <span>Register New Device</span>
            </Link>
          )}
        </div>
      </div>

      {/* Staff Operational Quick-Action Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              Staff Operational Shortcuts
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: '#CCFBF1',
                marginTop: '2px'
              }}
            >
              Frequently used tools for laboratory maintenance and network
              telemetry
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {/* Admin Only: Add Device */}
            {isAdmin && (
              <Link
                to="/devices/add"
                className="btn btn-sm"
                style={{
                  background: '#FFFFFF',
                  color: '#0F766E',
                  fontWeight: 600
                }}
              >
                <PlusCircle size={14} />
                <span>Add Device</span>
              </Link>
            )}

            <Link
              to="/topology"
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Network size={14} />
              <span>Topology Map</span>
            </Link>

            <Link
              to="/validator"
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <ShieldCheck size={14} />
              <span>IPv4 Validator</span>
            </Link>

            <Link
              to="/subnet-calculator"
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Calculator size={14} />
              <span>Subnet Calculator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Devices */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #142D4E'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Total Managed Devices
            </span>
            <Server size={18} color="#142D4E" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#142D4E',
              marginTop: '8px'
            }}
          >
            {summary?.totalDevices ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            Across campus subnets
          </div>
        </div>

        {/* Online Devices */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #10B981'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Online &amp; Active
            </span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#10B981',
              marginTop: '8px'
            }}
          >
            {summary?.activeDevices ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#059669',
              marginTop: '4px'
            }}
          >
            Reachable hosts
          </div>
        </div>

        {/* Offline Devices */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #EF4444'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Attention Required
            </span>
            <XCircle size={18} color="#EF4444" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#EF4444',
              marginTop: '8px'
            }}
          >
            {summary?.inactiveDevices ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#DC2626',
              marginTop: '4px'
            }}
          >
            Unreachable / offline
          </div>
        </div>

        {/* Workstations */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #0D9488'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Lab Workstations
            </span>
            <Monitor size={18} color="#0D9488" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0D9488',
              marginTop: '8px'
            }}
          >
            {summary?.computers ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            Student lab practical PCs
          </div>
        </div>

        {/* Routing and Switching */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #2563EB'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Core Routing &amp; Switching
            </span>
            <Cpu size={18} color="#2563EB" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#2563EB',
              marginTop: '8px'
            }}
          >
            {(summary?.routers ?? 0) + (summary?.switches ?? 0)}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            {summary?.routers ?? 0} Routers, {summary?.switches ?? 0} Switches
          </div>
        </div>

        {/* Duplicate IP Conflicts */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderLeft: '4px solid #F59E0B'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Subnet Scope Conflicts
            </span>
            <AlertTriangle size={18} color="#F59E0B" />
          </div>

          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#F59E0B',
              marginTop: '8px'
            }}
          >
            {summary?.duplicateIPCount ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#D97706',
              marginTop: '4px'
            }}
          >
            Duplicate IP warnings
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Device Categories */}
        <div className="card" style={{ padding: '22px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#142D4E'
              }}
            >
              Lab Equipment Distribution
            </h3>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748B'
              }}
            >
              By Category
            </span>
          </div>

          <div
            style={{
              height: '230px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {charts?.categoryDistribution?.data?.length ? (
              <Doughnut
                data={categoryChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                      }
                    }
                  }
                }}
              />
            ) : (
              <p style={{ color: '#94A3B8' }}>
                No device data recorded
              </p>
            )}
          </div>
        </div>

        {/* Reachability Pie Chart */}
        <div className="card" style={{ padding: '22px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#142D4E'
              }}
            >
              Host Reachability Ratio
            </h3>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748B'
              }}
            >
              Live Status
            </span>
          </div>

          <div
            style={{
              height: '230px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {charts?.connectionStatusDistribution?.data?.length ? (
              <Pie
                data={statusChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                      }
                    }
                  }
                }}
              />
            ) : (
              <p style={{ color: '#94A3B8' }}>
                No telemetry data recorded
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Telemetry Checks */}
      <div className="card" style={{ padding: '22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#142D4E'
              }}
            >
              Recent Equipment Telemetry Checks
            </h3>

            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748B'
              }}
            >
              TCP socket ping results across registered devices
            </p>
          </div>

          <Link
            to="/monitoring"
            className="btn btn-outline btn-sm"
          >
            <span>Live Monitor</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {recentConnectivityLogs && recentConnectivityLogs.length > 0 ? (
            recentConnectivityLogs.map((log) => (
              <div
                key={log._id}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background:
                        log.status === 'Online' ? '#10B981' : '#EF4444'
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#1E293B'
                      }}
                    >
                      {log.deviceId?.deviceName || 'Network Device'} (
                      {log.deviceIp})
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#64748B'
                      }}
                    >
                      Latency: <strong>{log.responseTime} ms</strong> •
                      Status: {log.status}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={12} />
                  <span>
                    {new Date(log.checkedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.85rem'
              }}
            >
              No recent connectivity checks
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
