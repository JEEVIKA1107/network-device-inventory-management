import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Network,
  CheckCircle,
  ShieldCheck,
  Server,
  Layers,
  Database
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newScope, setNewScope] = useState({
    name: '',
    cidr: '',
    description: '',
    isDefault: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const { isAdmin } = useAuth();

  const fetchScopes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scopes');
      if (res.data.success) {
        setScopes(res.data.scopes || []);
      }
    } catch (err) {
      console.error('Failed to load scopes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScopes();
  }, []);

  const handleCreateScope = async (e) => {
    e.preventDefault();
    setMsg('');
    setSubmitting(true);
    try {
      const res = await api.post('/scopes', newScope);
      if (res.data.success) {
        setMsg('Scope registered successfully!');
        setNewScope({ name: '', cidr: '', description: '', isDefault: false });
        fetchScopes();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create scope');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          System Settings &amp; Managed Network Scopes
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Configure enterprise subnet boundary pools and environment configuration parameters
        </p>
      </div>

      {/* Network Scopes Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Network size={18} color="#2563EB" />
            <span>Managed Network Scopes</span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', marginBottom: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Scope Name</th>
                <th>CIDR Block</th>
                <th>Description</th>
                <th>Scope Role</th>
              </tr>
            </thead>
            <tbody>
              {scopes.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="mono badge badge-info">{s.cidr}</span></td>
                  <td style={{ fontSize: '0.825rem', color: '#475569' }}>{s.description || '—'}</td>
                  <td>
                    {s.isDefault ? (
                      <span className="badge badge-success">Default Scope</span>
                    ) : (
                      <span className="badge badge-outline">Secondary Scope</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Scope Form (Admin only) */}
        {isAdmin && (
          <form onSubmit={handleCreateScope} style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142D4E', marginBottom: '14px' }}>
              Add New Network Scope
            </h4>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#ECFDF5', color: '#065F46', fontSize: '0.825rem', marginBottom: '14px' }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Scope Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research Lab VLAN"
                  value={newScope.name}
                  onChange={(e) => setNewScope({ ...newScope, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">CIDR Pool *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.10.0/24"
                  value={newScope.cidr}
                  onChange={(e) => setNewScope({ ...newScope, cidr: e.target.value })}
                  className="form-input mono"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="Scope notes"
                  value={newScope.description}
                  onChange={(e) => setNewScope({ ...newScope, description: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" disabled={submitting} className="btn btn-navy btn-sm">
                <Plus size={14} />
                <span>{submitting ? 'Registering...' : 'Register Scope'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Academic Integration Metadata Card */}
      <div className="card" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38BDF8', marginBottom: '14px' }}>
          Academic Syllabus Integration Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '0.825rem', color: '#CBD5E1', lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>FSWD (22ITT51):</strong>
            MERN stack architecture, React Router v6, protected routes, JWT authentication, bcrypt password hashing, REST APIs and MongoDB Atlas integration.
          </div>
          <div>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>FLAT Automata Theory:</strong>
            Canonical IPv4 regular expression, Thompson NFA construction, Powerset subset construction, Hopcroft DFA minimization, and interactive step animator.
          </div>
          <div>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Computer Networks (22ITT52):</strong>
            IPv4 32-bit decimal addressing, CIDR subnet masks, RFC 1918 private scopes, network topology visualization, and socket-based ping reachability checks.
          </div>
        </div>
      </div>
    </div>
  );
}
