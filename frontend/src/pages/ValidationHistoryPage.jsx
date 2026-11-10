import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../api/axiosClient';

export default function ValidationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15
      };
      if (status === 'valid') params.status = 'valid';
      if (status === 'invalid') params.status = 'invalid';

      const res = await api.get('/validation/history', { params });
      if (res.data.success) {
        setHistory(res.data.history || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load validation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [status, page]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            IPv4 Validation Audit Trail
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Comprehensive log of all IPv4 validation runs executed against the DFA and Regular Expression engines ({totalCount} records)
          </p>
        </div>

        <button onClick={fetchHistory} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: '220px' }}
          >
            <option value="ALL">All Validations</option>
            <option value="valid">DFA Accepted (Valid)</option>
            <option value="invalid">DFA Rejected (Invalid)</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Candidate Address</th>
                <th>Result</th>
                <th>Terminal State</th>
                <th>Diagnostic / Error</th>
                <th>Verified By</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="#64748B" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: '#142D4E' }}>
                        {item.inputAddress}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.isValid ? 'badge-success' : 'badge-danger'}`}>
                        {item.isValid ? 'Accepted' : 'Rejected'}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '0.825rem', color: item.finalState === 'TRAP_DEAD' ? '#EF4444' : '#142D4E' }}>
                        {item.finalState}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: item.isValid ? '#15803D' : '#B91C1C' }}>
                      {item.isValid ? 'Canonical IPv4 match' : item.errorMessage || 'Syntax violation'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {item.validatedBy?.name || 'Automated / Admin'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {loading ? 'Retrieving audit logs...' : 'No validation audit records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
