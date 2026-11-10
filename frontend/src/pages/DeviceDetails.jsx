import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Server,
  ArrowLeft,
  Activity,
  Edit,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Network,
  Cpu,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function DeviceDetails() {
  const { id } = useParams();
  const { isStaff } = useAuth();

  const [device, setDevice] = useState(null);
  const [connections, setConnections] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState(null);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      const [devRes, histRes] = await Promise.all([
        api.get(`/devices/${id}`),
        api.get(`/monitoring/history/${id}`)
      ]);

      if (devRes.data.success) {
        setDevice(devRes.data.device);
        setConnections(devRes.data.connections || []);
      }
      if (histRes.data.success) {
        setHistory(histRes.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load device details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, [id]);

  const handleProbe = async () => {
    try {
      setProbing(true);
      setProbeResult(null);
      const res = await api.post(`/monitoring/check/${id}`);
      if (res.data.success) {
        setProbeResult(res.data.result);
        setDevice((prev) => ({
          ...prev,
          connectionStatus: res.data.result.status,
          lastCheckedAt: res.data.result.lastCheckedAt
        }));
        // Reload history
        const histRes = await api.get(`/monitoring/history/${id}`);
        if (histRes.data.success) setHistory(histRes.data.history);
      }
    } catch (err) {
      setProbeResult({
        status: 'Offline',
        responseTime: 0,
        errorMessage: err.response?.data?.message || 'Host probe failed'
      });
    } finally {
      setProbing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading device specifications...</div>;
  }

  if (!device) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#DC2626' }}>Device record not found.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/devices" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </Link>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
              {device.deviceName}
            </h2>
            <span className="mono" style={{ fontSize: '0.825rem', color: '#64748B', fontWeight: 600 }}>
              {device.deviceId} • {device.deviceType}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleProbe}
            disabled={probing}
            className="btn btn-primary btn-sm"
          >
            <Activity size={16} className={probing ? 'spin' : ''} />
            <span>{probing ? 'Probing...' : 'Probe Host'}</span>
          </button>

          {isStaff && (
            <Link to={`/devices/edit/${device._id}`} className="btn btn-outline btn-sm">
              <Edit size={16} />
              <span>Edit Details</span>
            </Link>
          )}
        </div>
      </div>

      {/* Probe feedback banner if active */}
      {probeResult && (
        <div
          style={{
            background: probeResult.status === 'Online' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${probeResult.status === 'Online' ? '#A7F3D0' : '#FECACA'}`,
            color: probeResult.status === 'Online' ? '#065F46' : '#991B1B',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} />
            <span>
              Real-time Host Probe: <strong>{probeResult.status}</strong> ({probeResult.responseTime}ms) —{' '}
              {probeResult.errorMessage || 'Target is responding.'}
            </span>
          </div>
          <button
            onClick={() => setProbeResult(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Specs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Network & Addressing Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Network size={18} color="#2563EB" />
              <span>Network Parameters</span>
            </div>
            <span className={`badge ${device.connectionStatus === 'Online' ? 'badge-online' : device.connectionStatus === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
              {device.connectionStatus}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>IPv4 Address</span>
              <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142D4E' }}>{device.ipAddress}</span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>MAC Address</span>
              <span className="mono" style={{ fontWeight: 600, color: '#334155' }}>{device.macAddress || 'Not Registered'}</span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Network Scope</span>
              <span style={{ fontWeight: 600, color: '#2563EB' }}>
                {device.networkScopeId?.name || 'Default Campus Scope'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Last Checked</span>
              <span>{device.lastCheckedAt ? new Date(device.lastCheckedAt).toLocaleString() : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Location & Hardware Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} color="#2563EB" />
              <span>Physical Deployment</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{device.department}</span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Building &amp; Lab</span>
              <span>{device.building} — {device.laboratory}</span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Specific Location</span>
              <span>{device.location || 'Central Floor'}</span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Manufacturer &amp; Model</span>
              <span>{device.manufacturer} ({device.model})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interconnections */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Network Interconnections ({connections.length})</div>
          <Link to="/topology" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
            View Full Topology →
          </Link>
        </div>

        {connections.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Connected Device</th>
                  <th>Type</th>
                  <th>IP Address</th>
                  <th>Connection Medium</th>
                  <th>Bandwidth</th>
                  <th>Port</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((conn) => {
                  const isSource = conn.sourceDeviceId?._id === device._id;
                  const remote = isSource ? conn.targetDeviceId : conn.sourceDeviceId;
                  return (
                    <tr key={conn._id}>
                      <td>
                        <Link to={`/devices/${remote._id}`} style={{ fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
                          {remote.deviceName}
                        </Link>
                        <div className="mono" style={{ fontSize: '0.72rem', color: '#64748B' }}>{remote.deviceId}</div>
                      </td>
                      <td><span className="badge badge-info">{remote.deviceType}</span></td>
                      <td><span className="mono">{remote.ipAddress}</span></td>
                      <td><strong>{conn.connectionType}</strong></td>
                      <td>{conn.bandwidth}</td>
                      <td className="mono">{conn.port}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
            No direct network connections configured for this device.
          </div>
        )}
      </div>

      {/* Connectivity Probe History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Connectivity Probe History</div>
        </div>

        {history.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Target IP</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Diagnostic Message</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.checkedAt).toLocaleString()}</td>
                    <td className="mono">{h.deviceIp}</td>
                    <td>
                      <span className={`badge ${h.status === 'Online' ? 'badge-online' : h.status === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>{h.responseTime}ms</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{h.errorMessage || 'Host reachable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
            No ping probes recorded yet. Click "Probe Host" above to check connectivity.
          </div>
        )}
      </div>
    </div>
  );
}
