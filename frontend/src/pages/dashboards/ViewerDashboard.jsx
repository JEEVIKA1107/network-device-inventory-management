import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Network,
  CheckCircle2,
  ShieldCheck,
  Info,
  ArrowRight,
  Eye,
  RefreshCw,
  Search,
  Monitor,
  Cpu,
  Router,
  HardDrive,
  Printer,
  Wifi,
  HelpCircle,
  MessageSquarePlus
} from 'lucide-react';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function ViewerDashboard() {
  const { user } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [recentDevices, setRecentDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchViewerData = async () => {
    try {
      setRefreshing(true);

      const [dashRes, devRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/devices?limit=6&sortBy=createdAt&order=desc')
      ]);

      if (dashRes.data.success) {
        setSummaryData(dashRes.data.summary);
      }

      if (devRes.data.success) {
        setRecentDevices(devRes.data.devices || []);
      }
    } catch (err) {
      console.error('Failed to load viewer dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchViewerData();
  }, []);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Router':
        return <Router size={16} color="#2563EB" />;

      case 'Switch':
        return <Cpu size={16} color="#0284C7" />;

      case 'Computer':
        return <Monitor size={16} color="#0D9488" />;

      case 'Server':
        return <HardDrive size={16} color="#8B5CF6" />;

      case 'Printer':
        return <Printer size={16} color="#F59E0B" />;

      case 'Wireless Access Point':
        return <Wifi size={16} color="#EC4899" />;

      default:
        return <Server size={16} color="#142D4E" />;
    }
  };

  const filteredDevices = recentDevices.filter((d) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    return (
      d.deviceName?.toLowerCase().includes(q) ||
      d.ipAddress?.toLowerCase().includes(q) ||
      d.deviceType?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q)
    );
  });

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
        <p>Loading your network portal...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #142D4E 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          borderRadius: '12px'
        }}
      >
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
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                Welcome, {user?.name || 'Lab User'}!
              </h2>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#93C5FD',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                User / Viewer Portal
              </span>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#CBD5E1',
                marginTop: '6px',
                maxWidth: '650px',
                lineHeight: 1.5
              }}
            >
              Browse authorized college network equipment, inspect device
              details, verify network information, and view interactive
              campus network topology.
            </p>
          </div>

          <button
            onClick={fetchViewerData}
            disabled={refreshing}
            className="btn btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <RefreshCw
              size={14}
              className={refreshing ? 'spin' : ''}
            />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
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
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Accessible Devices
            </span>
            <Server size={18} color="#142D4E" />
          </div>

          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#142D4E',
              marginTop: '6px'
            }}
          >
            {summaryData?.totalDevices ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            Registered in campus inventory
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
                fontSize: '0.75rem',
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
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#10B981',
              marginTop: '6px'
            }}
          >
            {summaryData?.activeDevices ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#059669',
              marginTop: '4px'
            }}
          >
            Reachable network hosts
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
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Student Workstations
            </span>
            <Monitor size={18} color="#0D9488" />
          </div>

          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0D9488',
              marginTop: '6px'
            }}
          >
            {summaryData?.computers ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            Lab PCs &amp; practical systems
          </div>
        </div>

        {/* Verified IPv4s */}
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
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase'
              }}
            >
              Valid IPv4 Addresses
            </span>
            <ShieldCheck size={18} color="#2563EB" />
          </div>

          <div
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#2563EB',
              marginTop: '6px'
            }}
          >
            {summaryData?.validIPv4Count ?? 0}
          </div>

          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '4px'
            }}
          >
            Validated via Canonical DFA
          </div>
        </div>
      </div>

      {/* Device Directory and Network Information */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Quick Device Directory */}
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
                Campus Device Directory
              </h3>

              <p
                style={{
                  fontSize: '0.78rem',
                  color: '#64748B'
                }}
              >
                Recently added devices across laboratories
              </p>
            </div>

            <Link to="/devices" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Search */}
          <div
            style={{
              position: 'relative',
              marginBottom: '14px'
            }}
          >
            <Search
              size={14}
              color="#94A3B8"
              style={{
                position: 'absolute',
                left: '10px',
                top: '10px'
              }}
            />

            <input
              type="text"
              placeholder="Filter by name, IP, type or lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '32px',
                fontSize: '0.82rem',
                padding: '6px 10px 6px 32px'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {filteredDevices.length > 0 ? (
              filteredDevices.map((dev) => (
                <div
                  key={dev._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
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
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getDeviceIcon(dev.deviceType)}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#1E293B'
                        }}
                      >
                        {dev.deviceName}
                      </div>

                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748B',
                          fontFamily: 'monospace'
                        }}
                      >
                        {dev.ipAddress} • {dev.laboratory || dev.department || 'General'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background:
                          dev.connectionStatus === 'Online'
                            ? '#D1FAE5'
                            : '#FEE2E2',
                        color:
                          dev.connectionStatus === 'Online'
                            ? '#065F46'
                            : '#991B1B'
                      }}
                    >
                      {dev.connectionStatus}
                    </span>

                    <Link
                      to={`/devices/${dev._id}`}
                      className="btn btn-outline btn-sm"
                      title="View device details"
                      style={{ padding: '4px 8px' }}
                    >
                      <Eye size={13} color="#2563EB" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  padding: '16px'
                }}
              >
                No devices found
              </p>
            )}
          </div>
        </div>

        {/* Network Information & Feedback Quick Link */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Network Topology */}
          <div className="card" style={{ padding: '22px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Network size={20} color="#2563EB" />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#142D4E'
                  }}
                >
                  Network Topology Visualization
                </h3>

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748B'
                  }}
                >
                  Interactive hierarchical graph of campus connections
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: '0.825rem',
                color: '#475569',
                lineHeight: 1.5,
                marginBottom: '14px'
              }}
            >
              View how core routers connect to distribution switches,
              servers, lab PCs, and digital printers across campus buildings.
            </p>

            <Link
              to="/topology"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              <Network size={14} />
              <span>Explore Network Topology</span>
            </Link>
          </div>

          {/* Feedback Submission Quick Card */}
          <div
            className="card"
            style={{
              padding: '22px',
              borderLeft: '4px solid #2563EB',
              background: '#F8FAFC'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}
            >
              <MessageSquarePlus size={20} color="#2563EB" />

              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#142D4E'
                }}
              >
                Have Feedback or Report an Issue?
              </h3>
            </div>

            <p
              style={{
                fontSize: '0.8rem',
                color: '#475569',
                lineHeight: 1.5,
                marginBottom: '14px'
              }}
            >
              Help us improve NetTrack DFA by sharing your suggestions, bug reports, or feature requests directly with the IT admin team.
            </p>

            <Link to="/feedback" className="btn btn-primary btn-sm">
              <MessageSquarePlus size={13} />
              <span>Submit System Feedback</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Read-only Access Notice */}
      <div
        style={{
          padding: '14px 18px',
          background: '#F1F5F9',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#475569'
        }}
      >
        <HelpCircle
          size={18}
          color="#64748B"
          style={{ flexShrink: 0 }}
        />

        <div>
          <strong>User Access Notice:</strong> You are signed in with the{' '}
          <strong>Viewer</strong> role. You can browse the device inventory,
          inspect device details, view network topology, and access network
          reference information. Adding, editing, and deleting devices and
          managing user accounts are restricted to Administrators.
        </div>
      </div>
    </div>
  );
}