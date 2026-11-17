
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Radio,
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ portal = 'user' }) {
  const isAdminPortal = portal === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password, portal);

      if (res.success) {
        navigate(
          isAdminPortal ? '/admin/dashboard' : '/user/dashboard'
        );
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#F1F5F9',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#FFFFFF',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 35px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: isAdminPortal ? '#1D4ED8' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            {isAdminPortal ? (
              <ShieldCheck size={32} color="white" />
            ) : (
              <Radio size={32} color="white" />
            )}
          </div>

          <h1 style={{ color: '#142D4E', fontSize: '1.7rem' }}>
            NetTrack DFA
          </h1>

          <h2 style={{ color: '#334155', marginTop: '12px' }}>
            {isAdminPortal ? 'Administrator Login' : 'User Login'}
          </h2>

          <p style={{ color: '#64748B', marginTop: '8px' }}>
            {isAdminPortal
              ? 'Sign in with your administrator account.'
              : 'Sign in to view available network devices.'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Email Address
            </label>

            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '13px'
                }}
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Password
            </label>

            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '13px'
                }}
              />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '8px',
              background: isAdminPortal ? '#1D4ED8' : '#059669',
              color: 'white',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0'
          }}
        >
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            {isAdminPortal
              ? 'Are you a regular user?'
              : 'Are you an administrator?'}
          </p>

          <Link
            to={isAdminPortal ? '/user/login' : '/admin/login'}
            style={{
              display: 'inline-block',
              marginTop: '8px',
              color: '#2563EB',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            {isAdminPortal ? 'Go to User Login' : 'Go to Admin Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
