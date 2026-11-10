import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Search,
  Filter,
  Download,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../api/axiosClient';

export default function TransitionTable() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    const fetchTable = async () => {
      try {
        setLoading(true);
        const res = await api.get('/validation/dfa/metadata');
        if (res.data.success) {
          setTableData(res.data.metadata.transitionTable || []);
        }
      } catch (err) {
        console.error('Failed to load transition table:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, []);

  // Filtered rows
  const filteredRows = tableData.filter((row) => {
    const matchesSearch =
      row.currentState.toLowerCase().includes(search.toLowerCase()) ||
      row.currentStateLabel.toLowerCase().includes(search.toLowerCase()) ||
      row.inputSymbols.toLowerCase().includes(search.toLowerCase()) ||
      row.nextState.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ACCEPTING') return row.isNextAccepting;
    if (filterType === 'DEAD') return row.nextState === 'TRAP_DEAD';
    if (filterType === 'NORMAL') return !row.isNextAccepting && row.nextState !== 'TRAP_DEAD';

    return true;
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const currentRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExportCSV = () => {
    let csv = 'Current State,Current State Label,Input Symbol(s),Next State,Next State Label,Next State Type\n';
    filteredRows.forEach((r) => {
      csv += `"${r.currentState}","${r.currentStateLabel}","${r.inputSymbols}","${r.nextState}","${r.nextStateLabel}","${r.isNextAccepting ? 'Accepting' : r.nextState === 'TRAP_DEAD' ? 'Dead' : 'Normal'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NetTrack_DFA_Transition_Table.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            State Transition Table (δ : Q × Σ → Q)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Formal state mapping for the canonical IPv4 Deterministic Finite Automaton
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-outline btn-sm">
          <Download size={15} />
          <span>Export Transition CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search states or input symbols..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              <option value="ALL">All Transitions ({tableData.length})</option>
              <option value="ACCEPTING">Transitions to Accepting States (F)</option>
              <option value="DEAD">Transitions to Dead / Trap State</option>
              <option value="NORMAL">Intermediate Transitions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transition Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Current State (q)</th>
                <th>Current State Status</th>
                <th>Input Symbol (a ∈ Σ)</th>
                <th>Next State δ(q, a)</th>
                <th>Target State Classification</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: '#142D4E' }}>
                        {r.currentState}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{r.currentStateLabel}</div>
                    </td>
                    <td>
                      {r.currentState === 'S_1' ? (
                        <span className="badge badge-info">Start State</span>
                      ) : r.isAccepting ? (
                        <span className="badge badge-success">Accepting (F)</span>
                      ) : r.isDead ? (
                        <span className="badge badge-danger">Dead State</span>
                      ) : (
                        <span className="badge badge-warning">Intermediate</span>
                      )}
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563EB' }}>
                        {r.inputSymbols}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 700, color: r.nextState === 'TRAP_DEAD' ? '#EF4444' : '#142D4E' }}>
                        {r.nextState}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{r.nextStateLabel}</div>
                    </td>
                    <td>
                      {r.isNextAccepting ? (
                        <span className="badge badge-success">Accepting</span>
                      ) : r.nextState === 'TRAP_DEAD' ? (
                        <span className="badge badge-danger">Dead / Trap</span>
                      ) : (
                        <span className="badge badge-warning">Intermediate</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                    {loading ? 'Compiling transition table...' : 'No transition records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
            Showing <strong>{(page - 1) * rowsPerPage + 1}</strong> to <strong>{Math.min(page * rowsPerPage, filteredRows.length)}</strong> of <strong>{filteredRows.length}</strong> transitions
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
