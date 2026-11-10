import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  Server
} from 'lucide-react';
import api from '../api/axiosClient';

export default function ExportReports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Failed to load export metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleDownloadCSV = () => {
    window.open('/api/reports/export/devices', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
          Export Inventory &amp; Compliance Reports
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Generate formal audit documentation, tabular spreadsheets and printable departmental summaries
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* CSV Export Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <FileSpreadsheet size={26} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#142D4E', marginBottom: '8px' }}>
              CSV Inventory Spreadsheet
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Export complete device inventory including unique Device IDs, device names, canonical IPv4 addresses, MAC addresses, departmental allocations and reachability timestamps.
            </p>
          </div>
          <button onClick={handleDownloadCSV} className="btn btn-navy" style={{ width: '100%', gap: '8px' }}>
            <DownloadCloud size={16} />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Print / PDF Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Printer size={26} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#142D4E', marginBottom: '8px' }}>
              Print-Friendly Audit Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Print or save as PDF a clean departmental compliance report formatted for academic review and accreditation inspections (NBA / NAAC IT infrastructure verification).
            </p>
          </div>
          <button onClick={handlePrint} className="btn btn-primary" style={{ width: '100%', gap: '8px' }}>
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Snapshot Preview Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Current Inventory Snapshot Preview</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Total Devices</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E', marginTop: '4px' }}>
              {summary?.totalDevices ?? 0}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Active Online</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
              {summary?.activeDevices ?? 0}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Routers / Switches</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
              {(summary?.routers ?? 0) + (summary?.switches ?? 0)}
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>IP Conflicts</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>
              {summary?.duplicateIPConflicts ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
