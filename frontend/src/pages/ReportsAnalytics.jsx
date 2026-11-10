import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Calendar,
  Building2,
  Layers,
  RefreshCw,
  Server,
  Activity
} from 'lucide-react';
import api from '../api/axiosClient';

export default function ReportsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('ALL');
  const [deviceType, setDeviceType] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/analytics', {
        params: { department, deviceType, status }
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [department, deviceType, status]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    window.open('/api/reports/export/devices', '_blank');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            Infrastructure Reports &amp; Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Multi-dimensional telemetry aggregation across academic departments, buildings and laboratory subnets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Departments</option>
              <option value="Central IT Services">Central IT Services</option>
              <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Campus Wi-Fi">Campus Wi-Fi</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Device Type</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Categories</option>
              <option value="Router">Routers</option>
              <option value="Switch">Switches</option>
              <option value="Computer">Computers</option>
              <option value="Server">Servers</option>
              <option value="Printer">Printers</option>
              <option value="Wireless Access Point">Access Points</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Reachability</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Breakdown by Department */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={18} color="#2563EB" />
            <span>Departmental Distribution</span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total Registered Devices</th>
                <th>Online Hosts</th>
                <th>Offline Hosts</th>
                <th>Subnet Availability</th>
              </tr>
            </thead>
            <tbody>
              {data?.departmentBreakdown && data.departmentBreakdown.length > 0 ? (
                data.departmentBreakdown.map((dept, idx) => {
                  const availability = dept.total > 0 ? Math.round((dept.online / dept.total) * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td><strong>{dept._id}</strong></td>
                      <td>{dept.total}</td>
                      <td><span style={{ color: '#16A34A', fontWeight: 600 }}>{dept.online}</span></td>
                      <td><span style={{ color: '#DC2626', fontWeight: 600 }}>{dept.offline}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '100px', height: '6px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${availability}%`, height: '100%', background: availability > 50 ? '#10B981' : '#EF4444' }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{availability}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    {loading ? 'Aggregating departmental metrics...' : 'No data matching filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown by Laboratory / Facility */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} color="#2563EB" />
            <span>Laboratory &amp; Facility Subnet Pool Breakdown</span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Laboratory / Room</th>
                <th>Building</th>
                <th>Assigned Devices</th>
                <th>Online</th>
                <th>Status Indicator</th>
              </tr>
            </thead>
            <tbody>
              {data?.laboratoryBreakdown && data.laboratoryBreakdown.length > 0 ? (
                data.laboratoryBreakdown.map((lab, idx) => (
                  <tr key={idx}>
                    <td><strong>{lab._id}</strong></td>
                    <td>{lab.building}</td>
                    <td>{lab.total} Devices</td>
                    <td>{lab.online} Online</td>
                    <td>
                      <span className={`badge ${lab.online > 0 ? 'badge-online' : 'badge-offline'}`}>
                        {lab.online > 0 ? 'Active Pool' : 'Dormant'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    {loading ? 'Aggregating laboratory metrics...' : 'No records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
