import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Plus, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Network Operations Dashboard';
      case '/devices': return 'Device Inventory Management';
      case '/devices/add': return 'Register New Network Device';
      case '/topology': return 'Network Topology Visualization';
      case '/validator': return 'IPv4 Address Validation Engine';
      case '/dfa-simulator': return 'FLAT Interactive DFA State Simulator';
      case '/dfa-diagram': return 'Deterministic Finite Automaton Diagram';
      case '/transition-table': return 'State Transition Table (M = (Q, Σ, δ, q0, F))';
      case '/subnet-calculator': return 'CIDR Subnet Calculator & IP Classification';
      case '/monitoring': return 'Real-Time Connectivity Monitoring';
      case '/connectivity-history': return 'Device Connectivity History Logs';
      case '/reports': return 'Departmental Reports & Infrastructure Analytics';
      case '/validation-history': return 'IPv4 Validation Audit Trail';
      case '/export-reports': return 'Data Export & Printing';
      case '/users': return 'User & Role Access Management';
      case '/settings': return 'System Configuration & Network Scopes';
      default: return 'NetTrack DFA';
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#142D4E' }}>
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Environment Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem', color: '#475569' }}>
          <Globe size={14} color="#2563EB" />
          <span>Academic Node: <strong>IT-VLAN-101</strong></span>
        </div>

        {/* Quick Validation Button */}
        <Link to="/validator" className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
          <ShieldCheck size={16} color="#2563EB" />
          <span>Validate IP</span>
        </Link>

        {/* Quick Add Device */}
        <Link to="/devices/add" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={16} />
          <span>Add Device</span>
        </Link>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px', paddingLeft: '14px', borderLeft: '1px solid #E2E8F0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#142D4E', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{user?.department}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
