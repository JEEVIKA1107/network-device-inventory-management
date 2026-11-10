import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@nettrack.edu');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F7FB' }}>
      {/* Left Academic Hero Column */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #142D4E 0%, #0F233D 100%)',
          color: '#FFFFFF',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={26} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>NetTrack DFA</h2>
              <p style={{ fontSize: '0.8rem', color: '#93C5FD' }}>Validate. Monitor. Manage.</p>
            </div>
          </div>

          <div style={{ maxWidth: '520px', marginTop: '48px' }}>
            <span className="badge badge-info" style={{ marginBottom: '16px' }}>Academic Project</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '20px' }}>
              Network Device Inventory with IPv4 Automata Validation
            </h1>
            <p style={{ fontSize: '0.975rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '28px' }}>
              Bridging Full Stack Web Development (MERN), Formal Languages &amp; Automata Theory (FLAT), and Computer Networks into an enterprise network management system.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '36px' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600 }}>FSWD 22ITT51</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>MERN Stack</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600 }}>FLAT Theory</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>Minimal DFA Engine</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600 }}>Networks 22ITT52</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>IPv4 &amp; Topology</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          College IT Infrastructure Division • Department of Information Technology
        </div>
      </div>

      {/* Right Login Form Column */}
      <div
        style={{
          width: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          background: '#FFFFFF'
        }}
      >
        <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#142D4E', marginBottom: '6px' }}>
            Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '28px' }}>
            Enter your credentials to access the administration portal.
          </p>

          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="admin@nettrack.edu"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-navy"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              {submitting ? 'Authenticating...' : 'Sign In to NetTrack'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
              Quick Demo Accounts:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@nettrack.edu')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between', width: '100%' }}
              >
                <span><strong>Admin:</strong> admin@nettrack.edu</span>
                <span className="badge badge-info">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('staff@nettrack.edu')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between', width: '100%' }}
              >
                <span><strong>Faculty:</strong> staff@nettrack.edu</span>
                <span className="badge badge-success">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('viewer@nettrack.edu')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between', width: '100%' }}
              >
                <span><strong>Viewer:</strong> viewer@nettrack.edu</span>
                <span className="badge badge-warning">Read-Only</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
