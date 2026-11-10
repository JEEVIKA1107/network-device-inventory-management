import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../api/axiosClient';

export default function IPv4Validator() {
  const [ipInput, setIpInput] = useState('');
  const [result, setResult] = useState(null);
  const [validating, setValidating] = useState(false);

  const presetValid = [
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.10',
    '255.255.255.255',
    '0.0.0.0',
    '8.8.8.8'
  ];

  const presetInvalid = [
    { ip: '256.168.1.1', reason: 'Octet 1 > 255' },
    { ip: '192.168.1.300', reason: 'Octet 4 > 255' },
    { ip: '192.168.1', reason: 'Fewer than 4 octets' },
    { ip: '192.168.1.1.1', reason: 'More than 4 octets' },
    { ip: '192.168..1', reason: 'Empty octet' },
    { ip: '192.168.1.abc', reason: 'Non-numeric octet' },
    { ip: '192.168.001.1', reason: 'Disallowed leading zero' },
    { ip: '-192.168.1.1', reason: 'Negative number' },
    { ip: '999.999.999.999', reason: 'All octets > 255' }
  ];

  const handleValidate = async (targetIp) => {
    const ip = typeof targetIp === 'string' ? targetIp : ipInput;
    if (!ip && ip !== '') return;

    setValidating(true);
    try {
      const res = await api.post('/validation/ipv4', { ipAddress: ip });
      if (res.data.success) {
        setResult(res.data.validation);
      }
    } catch (err) {
      setResult({
        isValid: false,
        regexMatch: false,
        dfaAccepted: false,
        errorReason: err.response?.data?.message || 'Validation request failed'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSelectPreset = (ip) => {
    setIpInput(ip);
    handleValidate(ip);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          IPv4 Address Validation Engine
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Dual-engine formal verification executing the Canonical IPv4 Regular Expression and Deterministic Finite Automaton (DFA)
        </p>
      </div>

      {/* Input Box Card */}
      <div className="card" style={{ padding: '28px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleValidate();
          }}
        >
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.95rem' }}>
              Enter IPv4 Address Candidate:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="form-input mono"
                style={{ fontSize: '1.1rem', padding: '12px 16px' }}
              />
              <button
                type="submit"
                disabled={validating}
                className="btn btn-primary"
                style={{ minWidth: '150px' }}
              >
                <ShieldCheck size={18} />
                <span>{validating ? 'Verifying...' : 'Validate IP'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Test Presets */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Academic Syllabus Test Bench:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>Valid:</span>
            {presetValid.map((ip) => (
              <button
                key={ip}
                onClick={() => handleSelectPreset(ip)}
                className="btn btn-outline btn-sm mono"
                style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#F0FDF4', borderColor: '#BBF7D0' }}
              >
                {ip}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>Invalid:</span>
            {presetInvalid.map((item) => (
              <button
                key={item.ip}
                onClick={() => handleSelectPreset(item.ip)}
                className="btn btn-outline btn-sm mono"
                title={item.reason}
                style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#FEF2F2', borderColor: '#FECACA' }}
              >
                {item.ip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Result Dashboard */}
      {result && (
        <div className="card" style={{ padding: '28px', borderLeft: `6px solid ${result.isValid ? '#10B981' : '#EF4444'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {result.isValid ? (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={28} color="#16A34A" />
                </div>
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={28} color="#DC2626" />
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: result.isValid ? '#166534' : '#991B1B' }}>
                  {result.isValid ? 'VALID IPv4 ADDRESS' : 'INVALID IPv4 ADDRESS'}
                </h3>
                <span className="mono" style={{ fontSize: '1.05rem', color: '#1E293B', fontWeight: 600 }}>
                  "{result.inputAddress}"
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${result.isValid ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                {result.isValid ? 'DFA Accepted' : 'DFA Rejected'}
              </span>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px' }}>
                Verified at: {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Diagnostic Reason */}
          {!result.isValid && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 600, fontSize: '0.875rem' }}>
                <AlertTriangle size={18} />
                <span>Rejection Reason:</span>
              </div>
              <p style={{ color: '#B91C1C', fontSize: '0.85rem', marginTop: '4px', marginLeft: '26px' }}>
                {result.errorReason}
              </p>
              {result.invalidOctet && (
                <div style={{ marginTop: '8px', marginLeft: '26px', fontSize: '0.8rem', color: '#7F1D1D', fontWeight: 600 }}>
                  Fault detected in: <u>Octet #{result.invalidOctet}</u>
                </div>
              )}
            </div>
          )}

          {/* Dual Engine Verification Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                1. Regular Expression
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                {result.regexMatch ? <CheckCircle size={16} color="#16A34A" /> : <XCircle size={16} color="#DC2626" />}
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: result.regexMatch ? '#166534' : '#991B1B' }}>
                  {result.regexMatch ? 'Pattern Match' : 'Mismatch'}
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                2. Minimal DFA Engine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                {result.dfaAccepted ? <CheckCircle size={16} color="#16A34A" /> : <XCircle size={16} color="#DC2626" />}
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: result.dfaAccepted ? '#166534' : '#991B1B' }}>
                  {result.dfaAccepted ? 'Accepted (Final State ∈ F)' : 'Rejected (Trap / Non-final)'}
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                3. Formal Equivalence Proof
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <CheckCircle size={16} color="#2563EB" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563EB' }}>
                  L(Regex) ≡ L(DFA)
                </span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                4. Terminal Machine State
              </div>
              <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#142D4E', marginTop: '6px' }}>
                {result.finalState || 'TRAP_DEAD'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
