import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axiosClient';

export default function EditDevice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'Computer',
    ipAddress: '',
    macAddress: '',
    department: '',
    building: '',
    laboratory: '',
    location: '',
    manufacturer: '',
    model: '',
    networkScopeId: '',
    connectionStatus: 'Unknown',
    description: ''
  });

  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ipValidation, setIpValidation] = useState(null);
  const [duplicateConflict, setDuplicateConflict] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [devRes, scopesRes] = await Promise.all([
          api.get(`/devices/${id}`),
          api.get('/scopes')
        ]);

        if (devRes.data.success) {
          const dev = devRes.data.device;
          setFormData({
            deviceId: dev.deviceId,
            deviceName: dev.deviceName,
            deviceType: dev.deviceType,
            ipAddress: dev.ipAddress,
            macAddress: dev.macAddress || '',
            department: dev.department,
            building: dev.building,
            laboratory: dev.laboratory,
            location: dev.location || '',
            manufacturer: dev.manufacturer || '',
            model: dev.model || '',
            networkScopeId: dev.networkScopeId?._id || '',
            connectionStatus: dev.connectionStatus || 'Unknown',
            description: dev.description || ''
          });
        }

        if (scopesRes.data.success) {
          setScopes(scopesRes.data.scopes);
        }
      } catch (err) {
        setErrorMsg('Failed to fetch device data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Live IP validation and conflict checking
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      const ip = formData.ipAddress.trim();
      if (!ip) return;

      try {
        const valRes = await api.post('/validation/ipv4', { ipAddress: ip });
        if (valRes.data.success) {
          setIpValidation(valRes.data.validation);
          if (valRes.data.validation.isValid) {
            const dupRes = await api.get('/devices/check-duplicate', {
              params: { ip, scopeId: formData.networkScopeId, excludeDeviceId: id }
            });
            if (dupRes.data.isDuplicate) {
              setDuplicateConflict(dupRes.data.conflictingDevice);
            } else {
              setDuplicateConflict(null);
            }
          } else {
            setDuplicateConflict(null);
          }
        }
      } catch (err) {
        setIpValidation({ isValid: false, errorReason: 'Invalid format' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.ipAddress, formData.networkScopeId, id, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (ipValidation && !ipValidation.isValid) {
      setErrorMsg(`Cannot save: Invalid IPv4 address (${ipValidation.errorReason})`);
      return;
    }

    if (duplicateConflict) {
      setErrorMsg(`IP conflict with existing device: ${duplicateConflict.deviceName}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/devices/${id}`, formData);
      if (res.data.success) {
        navigate(`/devices/${id}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update device');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading device record...</div>;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to={`/devices/${id}`} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Cancel &amp; Return</span>
        </Link>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          Edit Device: {formData.deviceName} ({formData.deviceId})
        </h2>
      </div>

      {errorMsg && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 18px', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Device Name *</label>
            <input type="text" name="deviceName" required value={formData.deviceName} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Device ID</label>
            <input type="text" name="deviceId" required value={formData.deviceId} onChange={handleChange} className="form-input mono" />
          </div>

          <div className="form-group">
            <label className="form-label">Device Type</label>
            <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="form-select">
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Computer">Computer</option>
              <option value="Server">Server</option>
              <option value="Printer">Printer</option>
              <option value="Wireless Access Point">Wireless Access Point</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">IPv4 Address *</label>
            <input type="text" name="ipAddress" required value={formData.ipAddress} onChange={handleChange} className="form-input mono" />
            {ipValidation && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem' }}>
                {ipValidation.isValid ? (
                  <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Valid IPv4 Address
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={13} /> {ipValidation.errorReason}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Network Scope</label>
            <select name="networkScopeId" value={formData.networkScopeId} onChange={handleChange} className="form-select">
              <option value="">Default Network Scope</option>
              {scopes.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.cidr})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Connection Status</label>
            <select name="connectionStatus" value={formData.connectionStatus} onChange={handleChange} className="form-select">
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="submit" disabled={submitting} className="btn btn-navy">
            <Save size={16} />
            <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
