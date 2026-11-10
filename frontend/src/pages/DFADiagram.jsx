import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Download,
  Info,
  Maximize2,
  FileCode,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import api from '../api/axiosClient';

export default function DFADiagram() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diagram');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const res = await api.get('/validation/dfa/metadata');
        if (res.data.success) {
          setMetadata(res.data.metadata);
        }
      } catch (err) {
        console.error('Failed to load DFA metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleDownloadMermaid = () => {
    if (!metadata?.mermaidDiagram) return;
    const blob = new Blob([metadata.mermaidDiagram], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NetTrack_IPv4_DFA.mmd';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading DFA state diagram...</div>;
  }

  const { formalDefinition, acceptingStates, states } = metadata || {};

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            State Transition Diagram (DFA)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Visual representation of the 4-octet canonical decimal automata with dead state transitions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadMermaid} className="btn btn-outline btn-sm">
            <Download size={14} />
            <span>Export Mermaid Diagram</span>
          </button>
        </div>
      </div>

      {/* Formal 5-Tuple Definition Bar */}
      <div className="card" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '12px' }}>
          FLAT Unit 1 &amp; Unit 2: Formal DFA 5-Tuple Specification
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>States (Q)</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
              {formalDefinition?.totalStates} States
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Alphabet (Σ)</span>
            <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F8FAFC' }}>
              {'{ 0..9, . }'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Start State (q₀)</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60A5FA' }}>
              {formalDefinition?.startState}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Accepting States (F)</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ADE80' }}>
              {formalDefinition?.acceptingStatesCount} States
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block' }}>Dead State</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F87171' }}>
              {formalDefinition?.deadState}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0' }}>
        <button
          onClick={() => setActiveTab('diagram')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: activeTab === 'diagram' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'diagram' ? '3px solid #2563EB' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Visual State Diagram
        </button>
        <button
          onClick={() => setActiveTab('mermaid')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: activeTab === 'mermaid' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'mermaid' ? '3px solid #2563EB' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Mermaid Code Specification
        </button>
      </div>

      {/* Visual Diagram View */}
      {activeTab === 'diagram' && (
        <div className="card" style={{ padding: '24px', overflowX: 'auto', textAlign: 'center' }}>
          <img
            src="/FLAT/DFA_Diagram.svg"
            alt="NetTrack IPv4 DFA State Transition Diagram"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            onError={(e) => {
              // Fallback inline visual card if image link needs absolute path
              e.currentTarget.style.display = 'none';
            }}
          />
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#142D4E', marginBottom: '8px' }}>
              Automata Traversal Rules:
            </h4>
            <ul style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, paddingLeft: '20px' }}>
              <li><strong>Octet Boundaries:</strong> Octets 1, 2, and 3 must terminate with a dot character (<code>'.'</code>) advancing the machine to the start of the next octet stage.</li>
              <li><strong>Acceptance Condition:</strong> The 4th octet terminates with end-of-string. Reaching any accepting state without receiving further symbols results in ACCEPT.</li>
              <li><strong>Dead State Sink:</strong> Any syntax error (non-digits, leading zero, octet value &gt; 255, 4th dot) immediately branches into <code>TRAP_DEAD</code>, which unconditionally traps all remaining characters.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Mermaid Tab */}
      {activeTab === 'mermaid' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#142D4E' }}>Generated Mermaid Definition:</span>
            <button onClick={handleDownloadMermaid} className="btn btn-outline btn-sm">
              Copy / Download
            </button>
          </div>
          <pre
            className="mono"
            style={{
              background: '#0F172A',
              color: '#38BDF8',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              maxHeight: '400px',
              overflowY: 'auto',
              whiteHeight: 'pre-wrap'
            }}
          >
            {metadata?.mermaidDiagram}
          </pre>
        </div>
      )}
    </div>
  );
}
