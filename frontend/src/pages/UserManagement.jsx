import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const res = await api.put(`/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      setUpdatingId(userId);
      const res = await api.put(`/users/${userId}`, { isActive: !currentActive });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account '${userName}'?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            User &amp; Role-Based Access Control
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage administrative permissions across Admin, Faculty / IT Staff, and Viewer roles
          </p>
        </div>

        <button onClick={fetchUsers} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Department</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                return (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      {isSelf && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>You</span>}
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{u.email}</div>
                    </td>
                    <td>{u.department}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={updatingId === u._id || isSelf}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', width: '160px' }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Faculty / IT Staff">Faculty / IT Staff</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        disabled={isSelf}
                        className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}
                        style={{ cursor: isSelf ? 'default' : 'pointer', border: 'none' }}
                        title={isSelf ? 'Cannot deactivate self' : 'Click to toggle status'}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px' }}
                          title="Delete user"
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
