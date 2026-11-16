import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  PlusCircle,
  Network,
  CheckCircle2,
  XCircle,
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
  Layers,
  HelpCircle
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
      case 'Router': return <Router size={16} color="#2563EB" />;
      case 'Switch': return <Cpu size={16} color="#0284C7" />;
      case 'Computer': return <Monitor size={16} color="#0D9488" />;
      case 'Server': return <HardDrive size={16} color="#8B5CF6" />;
      case 'Printer': return <Printer size={16} color="#F59E0B" />;
      case 'Wireless Access Point': return <Wifi size={16} color="#EC4899" />;
      default: return <Server size={16} color="#142D4E" />;
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
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px auto', color: '#2563EB' }} />
        <p>Loading your network portal...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <p style={{ fontSize: '0.875rem', color: '#CBD5E1', marginTop: '6px', maxWidth: '650px', lineHeight: 1.5 }}>
              Browse authorized college network equipment, verify device locations, view interactive network topology, and register new hardware with real-time IPv4 automata validation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchViewerData}
              disabled={refreshing}
              className="btn btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.25)' }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Quick Register Hero Card */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          borderLeft: '5px solid #2563EB',
          background: '#EFF6FF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PlusCircle size={26} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E40AF', margin: 0 }}>
              Need to Register a New Network Device?
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#3B82F6', marginTop: '4px', maxWidth: '600px' }}>
              You have full permission to add new workstations, printers, or lab equipment. Every entry is automatically checked for duplicate IPs and validated with the DFA engine.
            </p>
          </div>
        </div>

        <Link
          to="/devices/add"
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.9rem', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
        >
          <PlusCircle size={18} />
          <span>Register New Device</span>
        </Link>
      </div>

      {/* 4 Clean Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        {/* Total Devices */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #142D4E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Accessible Devices</span>
            <Server size={18} color="#142D4E" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#142D4E', marginTop: '6px' }}>
            {summaryData?.totalDevices ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Registered in campus inventory</div>
        </div>

        {/* Online Devices */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Online &amp; Active</span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10B981', marginTop: '6px' }}>
            {summaryData?.activeDevices ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>Reachable network hosts</div>
        </div>

        {/* Workstations */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0D9488' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Student Workstations</span>
            <Monitor size={18} color="#0D9488" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0D9488', marginTop: '6px' }}>
            {summaryData?.computers ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Lab PCs &amp; practical systems</div>
        </div>

        {/* Verified IPv4s */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Valid IPv4 Addresses</span>
            <ShieldCheck size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563EB', marginTop: '6px' }}>
            {summaryData?.validIPv4Count ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>Validated via Canonical DFA</div>
        </div>
      </div>

      {/* Two Column Section: Quick Device Directory & Permitted Network Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick Device Directory */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E' }}>
                Campus Device Directory
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Recently added devices across laboratories
              </p>
            </div>
            <Link to="/devices" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Filter by name, IP, type or lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.82rem', padding: '6px 10px 6px 32px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                        {dev.deviceName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {dev.ipAddress} • {dev.laboratory || dev.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: dev.connectionStatus === 'Online' ? '#D1FAE5' : '#FEE2E2',
                        color: dev.connectionStatus === 'Online' ? '#065F46' : '#991B1B'
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
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                No devices found
              </p>
            )}
          </div>
        </div>

        {/* Permitted Network Information & Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Network Topology Link Card */}
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#142D4E' }}>
                  Network Topology Visualization
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Interactive hierarchical graph of campus connections
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
              View how core routers connect to distribution switches, servers, lab PCs, and digital printers across campus buildings.
            </p>
            <Link to="/topology" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              <Network size={14} />
              <span>Explore Network Topology</span>
            </Link>
          </div>

          {/* IPv4 Addressing Rules Card */}
          <div className="card" style={{ padding: '22px', borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldCheck size={20} color="#10B981" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142D4E' }}>
                Campus IPv4 Guidelines
              </h3>
            </div>
            <ul style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, paddingLeft: '18px', margin: 0 }}>
              <li><strong>Backbone Scope:</strong> <code>192.168.1.0/24</code> (Gateways, Servers, Printers)</li>
              <li><strong>CSE Lab Scope:</strong> <code>10.10.2.0/24</code> (Student Workstation Pool)</li>
              <li><strong>Syntax Rule:</strong> Each octet must be between <code>0</code> and <code>255</code> with no leading zeros.</li>
              <li><strong>Duplicate Prevention:</strong> The system automatically blocks duplicate IPs within the same subnet.</li>
            </ul>
            <div style={{ marginTop: '14px' }}>
              <Link to="/network-info" className="btn btn-outline btn-sm">
                <Info size={13} />
                <span>View Full Subnet Reference</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role Policy Notice */}
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
        <HelpCircle size={18} color="#64748B" style={{ flexShrink: 0 }} />
        <div>
          <strong>User Access Notice:</strong> You are currently signed in with the <strong>Viewer</strong> role. You have permissions to browse inventory, inspect device details, view network topology, and register new network devices. Deleting devices and managing user accounts are restricted to Central IT Administrators.
        </div>
      </div>
    </div>
  );
}
