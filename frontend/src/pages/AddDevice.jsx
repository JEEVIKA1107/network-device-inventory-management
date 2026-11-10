import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Server,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Save,
  Network
} from 'lucide-react';
import api from '../api/axiosClient';

export default function AddDevice() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'Computer',
    ipAddress: '',
    macAddress: '',
    department: 'Computer Science & Engineering',
    building: 'Main Academic Block',
    laboratory: 'Software Lab 1',
    location: 'Rack 1',
    manufacturer: 'Dell',
    model: 'OptiPlex 7090',
    networkScopeId: '',
    connectionStatus: 'Unknown',
    description: ''
  });

  const [scopes, setScopes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live IP validation & duplicate states
  const [ipValidation, setIpValidation] = useState(null);
  const [duplicateConflict, setDuplicateConflict] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // Fetch available scopes
  useEffect(() => {
    const fetchScopes = async () => {
      try {
        const res = await api.get('/scopes');
        if (res.data.success) {
          setScopes(res.data.scopes);
          const defaultScope = res.data.scopes.find((s) => s.isDefault);
          if (defaultScope) {
            setFormData((prev) => ({ ...prev, networkScopeId: defaultScope._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load network scopes:', err);
      }
    };
    fetchScopes();
  }, []);

  // Real-time IP Validation & Duplicate check debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      const ip = formData.ipAddress.trim();
      if (!ip) {
        setIpValidation(null);
        setDuplicateConflict(null);
        return;
      }

      // 1. Run DFA & Regex validation
      try {
        const valRes = await api.post('/validation/ipv4', { ipAddress: ip });
        if (valRes.data.success) {
          setIpValidation(valRes.data.validation);

          // 2. If valid format, check for duplicate IP in network scope
          if (valRes.data.validation.isValid) {
            setCheckingDuplicate(true);
            const dupRes = await api.get('/devices/check-duplicate', {
              params: { ip, scopeId: formData.networkScopeId }
            });
            if (dupRes.data.isDuplicate) {
              setDuplicateConflict(dupRes.data.conflictingDevice);
            } else {
              setDuplicateConflict(null);
            }
            setCheckingDuplicate(false);
          } else {
            setDuplicateConflict(null);
          }
        }
      } catch (err) {
        setIpValidation({
          isValid: false,
          errorReason: err.response?.data?.message || 'Invalid IPv4 address'
        });
        setDuplicateConflict(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.ipAddress, formData.networkScopeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (ipValidation && !ipValidation.isValid) {
      setErrorMsg(`Cannot register: Invalid IPv4 address (${ipValidation.errorReason})`);
      return;
    }

    if (duplicateConflict) {
      setErrorMsg(`Cannot register: Duplicate IP already in use by '${duplicateConflict.deviceName}' (${duplicateConflict.deviceId})`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/devices', formData);
      if (res.data.success) {
        navigate('/devices');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register device');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/devices" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Register New Device
          </h2>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            padding: '14px 18px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
        {/* Section 1: Device Identification */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
            1. Device Identification
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Device Name *</label>
              <input
                type="text"
                name="deviceName"
                required
                value={formData.deviceName}
                onChange={handleChange}
                placeholder="e.g. Core Switch 01, Lab PC 05"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Device ID (Optional - Auto-generated if blank)</label>
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                placeholder="e.g. DEV-PC-015"
                className="form-input mono"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Device Category *</label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Router">Router</option>
                <option value="Switch">Switch</option>
                <option value="Computer">Computer</option>
                <option value="Server">Server</option>
                <option value="Printer">Printer</option>
                <option value="Wireless Access Point">Wireless Access Point</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: IPv4 Address & Network Scope (FLAT Engine Validated) */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>2. IP Network Addressing</span>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>DFA Engine Guard</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* IPv4 Address with real-time feedback */}
            <div className="form-group">
              <label className="form-label">Canonical IPv4 Address *</label>
              <input
                type="text"
                name="ipAddress"
                required
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="e.g. 192.168.1.15"
                className="form-input mono"
                style={{
                  borderColor: ipValidation
                    ? ipValidation.isValid
                      ? duplicateConflict
                        ? '#F59E0B'
                        : '#10B981'
                      : '#EF4444'
                    : undefined
                }}
              />

              {/* Dynamic validation indicator */}
              {ipValidation && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {ipValidation.isValid ? (
                    <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Valid Canonical IPv4 (DFA Accepted)
                    </span>
                  ) : (
                    <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={14} /> {ipValidation.errorReason}
                    </span>
                  )}
                </div>
              )}

              {/* Duplicate IP Conflict Warning */}
              {duplicateConflict && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '6px',
                    color: '#92400E',
                    fontSize: '0.8rem'
                  }}
                >
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  <strong>Duplicate Conflict:</strong> Already registered to{' '}
                  <Link to={`/devices/${duplicateConflict.id}`} style={{ color: '#B45309', fontWeight: 'bold' }}>
                    '{duplicateConflict.deviceName}' ({duplicateConflict.deviceId})
                  </Link>
                </div>
              )}
            </div>

            {/* Network Scope */}
            <div className="form-group">
              <label className="form-label">Network Scope (CIDR Range)</label>
              <select
                name="networkScopeId"
                value={formData.networkScopeId}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Default Network Scope</option>
                {scopes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.cidr})
                  </option>
                ))}
              </select>
            </div>

            {/* MAC Address */}
            <div className="form-group">
              <label className="form-label">MAC Address (Optional)</label>
              <input
                type="text"
                name="macAddress"
                value={formData.macAddress}
                onChange={handleChange}
                placeholder="e.g. 00:1A:2B:3C:4D:5E"
                className="form-input mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Physical Location */}
        <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
            3. Physical Deployment Location
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Building *</label>
              <input
                type="text"
                name="building"
                required
                value={formData.building}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Laboratory / Room *</label>
              <input
                type="text"
                name="laboratory"
                required
                value={formData.laboratory}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rack / Desk Position</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Rack 2 - Slot 4"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Hardware Specs & Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#142D4E', marginBottom: '16px' }}>
            4. Hardware &amp; Notes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description / Remarks</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Department primary database server, connected via Port 24"
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link to="/devices" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || (ipValidation && !ipValidation.isValid) || Boolean(duplicateConflict)}
            className="btn btn-navy"
            style={{ minWidth: '160px' }}
          >
            <Save size={16} />
            <span>{submitting ? 'Registering...' : 'Save & Register Device'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
