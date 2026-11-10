import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  PlusCircle,
  Network,
  ShieldCheck,
  Cpu,
  GitBranch,
  TableProperties,
  Calculator,
  Activity,
  History,
  BarChart3,
  FileCheck2,
  DownloadCloud,
  Users,
  Settings,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'DEVICE MANAGEMENT',
      items: [
        { label: 'Device Inventory', path: '/devices', icon: Server },
        { label: 'Add Device', path: '/devices/add', icon: PlusCircle },
        { label: 'Network Topology', path: '/topology', icon: Network }
      ]
    },
    {
      group: 'IP MANAGEMENT',
      items: [
        { label: 'IPv4 Validator', path: '/validator', icon: ShieldCheck },
        { label: 'DFA Simulator', path: '/dfa-simulator', icon: Cpu },
        { label: 'DFA Diagram', path: '/dfa-diagram', icon: GitBranch },
        { label: 'Transition Table', path: '/transition-table', icon: TableProperties },
        { label: 'Subnet Calculator', path: '/subnet-calculator', icon: Calculator }
      ]
    },
    {
      group: 'MONITORING',
      items: [
        { label: 'Network Status', path: '/monitoring', icon: Activity },
        { label: 'Connectivity History', path: '/connectivity-history', icon: History }
      ]
    },
    {
      group: 'REPORTS',
      items: [
        { label: 'Analytics', path: '/reports', icon: BarChart3 },
        { label: 'Validation History', path: '/validation-history', icon: FileCheck2 },
        { label: 'Export Reports', path: '/export-reports', icon: DownloadCloud }
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        ...(isAdmin ? [{ label: 'User Management', path: '/users', icon: Users }] : []),
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Radio size={22} color="#FFFFFF" />
        </div>
        <div className="sidebar-text">
          <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>NetTrack DFA</div>
          <div style={{ fontSize: '0.72rem', color: '#93C5FD', fontWeight: 500 }}>Validate. Monitor. Manage.</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navGroups.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div
              className="sidebar-text"
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.08em',
                padding: '0 12px 8px 12px',
                textTransform: 'uppercase'
              }}
            >
              {section.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: isActive ? '#FFFFFF' : '#CBD5E1',
                      background: isActive ? '#2563EB' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '0.865rem',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.15s ease'
                    })}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span className="sidebar-text">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: '#0F233D' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sidebar-text" style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
              {user?.role || 'Admin'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
