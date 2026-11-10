import React, { useState, useEffect } from 'react';
import { History, Activity, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axiosClient';

export default function ConnectivityHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/monitoring/status');
      if (res.data.success) {
        setLogs(res.data.recentChecks || []);
      }
    } catch (err) {
      console.error('Failed to load connectivity history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Connectivity History Logs
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Historical audit logs of socket reachability probes and response latency
          </p>
        </div>

        <button onClick={fetchHistory} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '220px' }}
          >
            <option value="ALL">All Reachability Logs</option>
            <option value="Online">Online Probes Only</option>
            <option value="Offline">Offline Probes Only</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Target Device</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Diagnostic Response</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.checkedAt).toLocaleString()}</td>
                    <td>
                      <strong>{log.deviceId?.deviceName || 'Host'}</strong>
                      <div className="mono" style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {log.deviceId?.deviceId || '—'}
                      </div>
                    </td>
                    <td><span className="mono">{log.deviceIp}</span></td>
                    <td>
                      <span className={`badge ${log.status === 'Online' ? 'badge-online' : log.status === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: '#0F172A' }}>
                        {log.responseTime}ms
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {log.errorMessage || 'Host reachable'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {loading ? 'Fetching historical probes...' : 'No connectivity records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
