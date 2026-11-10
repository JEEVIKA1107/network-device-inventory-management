import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Plus,
  RefreshCw,
  Router,
  Cpu,
  Monitor,
  HardDrive,
  Printer,
  Wifi,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function NetworkTopology() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Add connection modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConn, setNewConn] = useState({
    sourceDeviceId: '',
    targetDeviceId: '',
    connectionType: 'Ethernet',
    bandwidth: '1 Gbps',
    port: 'eth0'
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isStaff } = useAuth();

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const res = await api.get('/topology');
      if (res.data.success) {
        setNodes(res.data.nodes || []);
        setEdges(res.data.edges || []);
      }
    } catch (err) {
      console.error('Failed to load topology:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const handleAddConnection = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newConn.sourceDeviceId || !newConn.targetDeviceId) {
      setModalError('Please select both source and destination devices');
      return;
    }
    if (newConn.sourceDeviceId === newConn.targetDeviceId) {
      setModalError('Source and target devices cannot be identical');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/topology/connections', newConn);
      if (res.data.success) {
        setShowAddModal(false);
        setNewConn({
          sourceDeviceId: '',
          targetDeviceId: '',
          connectionType: 'Ethernet',
          bandwidth: '1 Gbps',
          port: 'eth0'
        });
        fetchTopology();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to establish connection link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this network connection?')) return;
    try {
      await api.delete(`/topology/connections/${connectionId}`);
      fetchTopology();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove connection');
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Router': return Router;
      case 'Switch': return Cpu;
      case 'Computer': return Monitor;
      case 'Server': return HardDrive;
      case 'Printer': return Printer;
      case 'Wireless Access Point': return Wifi;
      default: return Network;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Network Topology Visualization
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Hierarchical representation of inter-device connectivity, trunk uplinks, and access port links
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchTopology} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {isStaff && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Add Connection Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas + Inspector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Topology Map Canvas */}
        <div className="card" style={{ padding: '24px', background: '#0F172A', color: '#FFFFFF', minHeight: '520px', position: 'relative', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campus LAN Topology Map ({nodes.length} Nodes • {edges.length} Links)
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#CBD5E1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Online
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Offline
              </span>
            </div>
          </div>

          {/* Interactive Tiered Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', padding: '20px 0' }}>
            {/* Tier 1: Core Gateways (Routers) */}
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
              {nodes.filter((n) => n.type === 'Router').map((node) => {
                const Icon = getDeviceIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#1E40AF' : '#1E293B',
                      border: `2px solid ${isSelected ? '#60A5FA' : '#334155'}`,
                      borderRadius: '12px',
                      padding: '14px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '150px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 15px rgba(96, 165, 250, 0.4)' : undefined
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color="#FFFFFF" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{node.name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#93C5FD' }}>{node.ip}</div>
                      <span className={`badge ${node.status === 'Online' ? 'badge-online' : 'badge-offline'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection Link Indicator */}
            {nodes.some((n) => n.type === 'Router') && nodes.some((n) => n.type === 'Switch') && (
              <div style={{ height: '30px', borderLeft: '2px dashed #38BDF8', margin: '-10px 0' }} />
            )}

            {/* Tier 2: Distribution & Core Switches */}
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
              {nodes.filter((n) => n.type === 'Switch').map((node) => {
                const Icon = getDeviceIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#1E40AF' : '#1E293B',
                      border: `2px solid ${isSelected ? '#60A5FA' : '#334155'}`,
                      borderRadius: '12px',
                      padding: '14px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '150px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 15px rgba(96, 165, 250, 0.4)' : undefined
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color="#FFFFFF" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{node.name}</div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: '#38BDF8' }}>{node.ip}</div>
                      <span className={`badge ${node.status === 'Online' ? 'badge-online' : 'badge-offline'}`} style={{ marginTop: '6px', fontSize: '0.65rem' }}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection Link Indicator */}
            {nodes.some((n) => n.type === 'Switch') && nodes.some((n) => !['Router', 'Switch'].includes(n.type)) && (
              <div style={{ height: '30px', borderLeft: '2px dashed #4ADE80', margin: '-10px 0' }} />
            )}

            {/* Tier 3: Edge Devices (Computers, Servers, Printers, APs) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {nodes.filter((n) => !['Router', 'Switch'].includes(n.type)).map((node) => {
                const Icon = getDeviceIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#1E40AF' : '#1E293B',
                      border: `1px solid ${isSelected ? '#60A5FA' : '#334155'}`,
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      minWidth: '170px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color="#93C5FD" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {node.name}
                      </div>
                      <div className="mono" style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{node.ip}</div>
                      <span className={`badge ${node.status === 'Online' ? 'badge-online' : 'badge-offline'}`} style={{ marginTop: '4px', fontSize: '0.62rem' }}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1rem' }}>
                <Info size={16} color="#2563EB" />
                <span>Device Inspector</span>
              </div>
            </div>

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Device Name</span>
                  <strong style={{ fontSize: '1rem', color: '#142D4E' }}>{selectedNode.name}</strong>
                  <div className="mono" style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedNode.deviceId}</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Category &amp; Scope</span>
                  <span className="badge badge-info">{selectedNode.type}</span>
                  <span style={{ display: 'block', marginTop: '4px', color: '#475569', fontSize: '0.8rem' }}>
                    Scope: {selectedNode.scope}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>IPv4 Address</span>
                  <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#2563EB' }}>
                    {selectedNode.ip}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Physical Location</span>
                  <span>{selectedNode.location}</span>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <Link to={`/devices/${selectedNode.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    <span>View Full Device Record</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94A3B8', fontSize: '0.85rem' }}>
                Click any device node on the topology map to inspect its parameters.
              </div>
            )}
          </div>

          {/* Active Links List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '0.95rem' }}>
                <Layers size={16} color="#2563EB" />
                <span>Inter-Device Links ({edges.length})</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {edges.map((e) => (
                <div key={e.id} style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>
                      {e.sourceName} ↔ {e.targetName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {e.type} • {e.bandwidth} ({e.port})
                    </div>
                  </div>
                  {isStaff && (
                    <button
                      onClick={() => handleDeleteConnection(e.id)}
                      title="Disconnect link"
                      style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                      onMouseEnter={(btn) => (btn.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(btn) => (btn.currentTarget.style.color = '#94A3B8')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Connection Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#142D4E', marginBottom: '14px' }}>
              Add Topology Link
            </h3>

            {modalError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '14px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddConnection}>
              <div className="form-group">
                <label className="form-label">Source Device</label>
                <select
                  value={newConn.sourceDeviceId}
                  onChange={(e) => setNewConn({ ...newConn, sourceDeviceId: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Select Source Node</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.type} - {n.ip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Device</label>
                <select
                  value={newConn.targetDeviceId}
                  onChange={(e) => setNewConn({ ...newConn, targetDeviceId: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Select Target Node</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.type} - {n.ip})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Connection Type</label>
                  <select
                    value={newConn.connectionType}
                    onChange={(e) => setNewConn({ ...newConn, connectionType: e.target.value })}
                    className="form-select"
                  >
                    <option value="Ethernet">Ethernet</option>
                    <option value="Fiber">Fiber</option>
                    <option value="Wireless">Wireless</option>
                    <option value="Uplink">Uplink</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bandwidth</label>
                  <input
                    type="text"
                    value={newConn.bandwidth}
                    onChange={(e) => setNewConn({ ...newConn, bandwidth: e.target.value })}
                    placeholder="e.g. 1 Gbps"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Switch Port / Interface Label</label>
                <input
                  type="text"
                  value={newConn.port}
                  onChange={(e) => setNewConn({ ...newConn, port: e.target.value })}
                  placeholder="e.g. Gi1/0/24"
                  className="form-input mono"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-navy">
                  {submitting ? 'Connecting...' : 'Establish Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
