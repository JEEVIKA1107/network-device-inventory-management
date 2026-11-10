import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Activity,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function DeviceInventory() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deviceType, setDeviceType] = useState('ALL');
  const [connectionStatus, setConnectionStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Ping action state
  const [probingId, setProbingId] = useState(null);
  const [probeResult, setProbeResult] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { isAdmin, isStaff } = useAuth();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        deviceType,
        connectionStatus,
        sortBy,
        order,
        page,
        limit: 10
      };
      const res = await api.get('/devices', { params });
      if (res.data.success) {
        setDevices(res.data.devices);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search, deviceType, connectionStatus, sortBy, order, page]);

  const handleManualProbe = async (deviceId) => {
    try {
      setProbingId(deviceId);
      setProbeResult(null);
      const res = await api.post(`/monitoring/check/${deviceId}`);
      if (res.data.success) {
        setProbeResult({
          deviceId,
          status: res.data.result.status,
          responseTime: res.data.result.responseTime,
          message: res.data.result.errorMessage || 'Host reachable'
        });
        // Update device in list
        setDevices((prev) =>
          prev.map((d) =>
            d._id === deviceId
              ? { ...d, connectionStatus: res.data.result.status, lastCheckedAt: new Date() }
              : d
          )
        );
      }
    } catch (err) {
      setProbeResult({
        deviceId,
        status: 'Offline',
        responseTime: 0,
        message: err.response?.data?.message || 'Probe request failed'
      });
    } finally {
      setProbingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/devices/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete device');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Device Inventory
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Managing {totalCount} registered campus devices with verified canonical IPv4 addresses
          </p>
        </div>

        {isStaff && (
          <Link to="/devices/add" className="btn btn-primary" style={{ gap: '8px' }}>
            <Plus size={16} />
            <span>Register New Device</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search ID, name, IP, MAC..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Device Type Filter */}
          <div>
            <select
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              <option value="ALL">All Device Categories</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Computer">Computer</option>
              <option value="Server">Server</option>
              <option value="Printer">Printer</option>
              <option value="Wireless Access Point">Wireless Access Point</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={connectionStatus}
              onChange={(e) => {
                setConnectionStatus(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              <option value="ALL">All Reachability Statuses</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="form-select"
            >
              <option value="createdAt-desc">Newest Registered</option>
              <option value="createdAt-asc">Oldest Registered</option>
              <option value="deviceName-asc">Name (A - Z)</option>
              <option value="deviceId-asc">Device ID</option>
              <option value="ipAddress-asc">IPv4 Address</option>
            </select>
          </div>
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
              Host Probe Result: <strong>{probeResult.status}</strong> ({probeResult.responseTime}ms) — {probeResult.message}
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

      {/* Main Inventory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Type</th>
                <th>IPv4 Address</th>
                <th>MAC Address</th>
                <th>Department / Lab</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.length > 0 ? (
                devices.map((dev) => (
                  <tr key={dev._id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: '#142D4E' }}>
                        {dev.deviceId}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/devices/${dev._id}`}
                        style={{ fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
                      >
                        {dev.deviceName}
                      </Link>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {dev.manufacturer} {dev.model}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{dev.deviceType}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: '#0F172A' }}>
                        {dev.ipAddress}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {dev.networkScopeId?.name || 'Default Scope'}
                      </div>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '0.775rem', color: '#475569' }}>
                        {dev.macAddress || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 500, color: '#1E293B' }}>{dev.department}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{dev.laboratory}</div>
                    </td>
                    <td>
                      <span className={`badge ${dev.connectionStatus === 'Online' ? 'badge-online' : dev.connectionStatus === 'Offline' ? 'badge-offline' : 'badge-unknown'}`}>
                        {dev.connectionStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Probe Button */}
                        <button
                          onClick={() => handleManualProbe(dev._id)}
                          disabled={probingId === dev._id}
                          className="btn btn-outline btn-sm"
                          title="Probe network connectivity"
                          style={{ padding: '6px' }}
                        >
                          <Activity size={14} className={probingId === dev._id ? 'spin' : ''} color="#2563EB" />
                        </button>

                        {/* View Details */}
                        <Link
                          to={`/devices/${dev._id}`}
                          className="btn btn-outline btn-sm"
                          title="View device specifications"
                          style={{ padding: '6px' }}
                        >
                          <Eye size={14} color="#475569" />
                        </Link>

                        {/* Edit Device */}
                        {isStaff && (
                          <Link
                            to={`/devices/edit/${dev._id}`}
                            className="btn btn-outline btn-sm"
                            title="Edit device"
                            style={{ padding: '6px' }}
                          >
                            <Edit size={14} color="#2563EB" />
                          </Link>
                        )}

                        {/* Delete Device */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(dev)}
                            className="btn btn-outline btn-sm"
                            title="Delete device"
                            style={{ padding: '6px' }}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {loading ? 'Fetching device inventory from database...' : 'No network devices found matching current filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total devices)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={22} color="#EF4444" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142D4E' }}>Confirm Device Deletion</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{deleteTarget.deviceName}</strong> ({deleteTarget.deviceId})? All associated network connections will also be pruned.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn btn-danger"
              >
                {deleting ? 'Deleting...' : 'Delete Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
