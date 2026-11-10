import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Info,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function NetworkMonitoring() {
  const [metrics, setMetrics] = useState(null);
  const [recentChecks, setRecentChecks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [probingId, setProbingId] = useState(null);

  const { isAdmin } = useAuth();

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [statusRes, devRes] = await Promise.all([
        api.get('/monitoring/status'),
        api.get('/devices?limit=50')
      ]);

      if (statusRes.data.success) {
        setMetrics(statusRes.data.metrics);
        setRecentChecks(statusRes.data.recentChecks || []);
      }
      if (devRes.data.success) {
        setDevices(devRes.data.devices || []);
      }
    } catch (err) {
      console.error('Failed to load monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handleProbeDevice = async (deviceId) => {
    try {
      setProbingId(deviceId);
      await api.post(`/monitoring/check/${deviceId}`);
      await fetchMonitoringData();
    } catch (err) {
      console.error('Probe failed:', err);
    } finally {
      setProbingId(null);
    }
  };

  const handleBatchProbe = async () => {
    try {
      setBatchRunning(true);
      await api.post('/monitoring/check-all');
      await fetchMonitoringData();
    } catch (err) {
      console.error('Batch probe failed:', err);
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Batch Control */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Network Connectivity Telemetry
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Live TCP reachability checks, latency recording and host reachability monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchMonitoringData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {isAdmin && (
            <button
              onClick={handleBatchProbe}
              disabled={batchRunning}
              className="btn btn-primary btn-sm"
            >
              <Zap size={14} className={batchRunning ? 'spin' : ''} />
              <span>{batchRunning ? 'Probing All Hosts...' : 'Batch Probe All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Environment Transparency Notice */}
      <div
        className="card"
        style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}
      >
        <Info size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#1E3A8A', lineHeight: 1.5 }}>
          <strong>Academic Network Architecture Notice:</strong>
          <p style={{ marginTop: '4px' }}>
            Local development executes direct socket probes against RFC 1918 private subnets. When hosted in public cloud containers (e.g. Render / Vercel), external cloud servers cannot directly route into a private college LAN without a secure VPN or local relay agent. Public test addresses (e.g. <code>8.8.8.8</code>, <code>1.1.1.1</code>) probe real DNS ports.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Online Hosts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: '6px' }}>
            {metrics?.onlineCount ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Responding to TCP probe</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Offline Hosts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444', marginTop: '6px' }}>
            {metrics?.offlineCount ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px' }}>Connection timed out</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Unknown / Pending</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B', marginTop: '6px' }}>
            {metrics?.unknownCount ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '2px' }}>Awaiting initial probe</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Subnet Health</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563EB', marginTop: '6px' }}>
            {metrics?.healthPercentage ?? 0}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#1D4ED8', marginTop: '2px' }}>Active reachability ratio</div>
        </div>
      </div>

      {/* Registered Devices Live Probe Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', margin: 0 }}>
          <div className="card-title">Live Device Reachability Status</div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{devices.length} registered devices</span>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Last Checked</th>
                <th>Last Seen Online</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => (
                <tr key={dev._id}>
                  <td><span className="mono" style={{ fontWeight: 700 }}>{dev.deviceId}</span></td>
                  <td><strong>{dev.deviceName}</strong></td>
                  <td><span className="badge badge-info">{dev.deviceType}</span></td>
                  <td><span className="mono">{dev.ipAddress}</span></td>
                  <td>
                    <span className={`badge ${dev.connectionStatus === 'Online' ? 'badge-online' : dev.connectionStatus === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
                      {dev.connectionStatus}
                    </span>
                  </td>
                  <td>
                    {dev.lastCheckedAt ? new Date(dev.lastCheckedAt).toLocaleTimeString() : 'Never'}
                  </td>
                  <td>
                    {dev.lastSeenAt ? new Date(dev.lastSeenAt).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleProbeDevice(dev._id)}
                      disabled={probingId === dev._id}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px' }}
                    >
                      <Activity size={13} className={probingId === dev._id ? 'spin' : ''} color="#2563EB" />
                      <span>{probingId === dev._id ? 'Checking...' : 'Check Ping'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
