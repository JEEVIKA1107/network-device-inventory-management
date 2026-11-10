import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import api from '../api/axiosClient';
import StepSimulator from '../components/Automata/StepSimulator';

export default function DFASimulator() {
  const [inputAddress, setInputAddress] = useState('192.168.1.1');
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const samplePresets = [
    { label: 'Standard Gateway (Valid)', ip: '192.168.1.1' },
    { label: 'Cloudflare DNS (Valid)', ip: '1.1.1.1' },
    { label: 'Broadcast Boundary (Valid)', ip: '255.255.255.255' },
    { label: 'Octet Overflow 256 (Invalid)', ip: '256.168.1.1' },
    { label: 'Leading Zero 001 (Invalid)', ip: '192.168.001.1' },
    { label: 'Missing Octet (Invalid)', ip: '192.168.1' }
  ];

  const runSimulation = async (candidateIp) => {
    const ip = typeof candidateIp === 'string' ? candidateIp : inputAddress;
    if (!ip) return;

    setLoading(true);
    try {
      const res = await api.post('/validation/dfa/simulate', { ipAddress: ip });
      if (res.data.success) {
        setSimulationData(res.data.simulation);
      }
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation('192.168.1.1');
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#142D4E' }}>
            FLAT: Interactive DFA State Machine Simulator
          </h2>
          <span className="badge badge-info">Academic Automata Engine</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Step-by-step state transition animator powered by the verified Minimal Deterministic Finite Automaton (M = (Q, Σ, δ, q₀, F))
        </p>
      </div>

      {/* Simulator Input Card */}
      <div className="card" style={{ padding: '24px' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSimulation();
          }}
        >
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.9rem' }}>
              Input String to Simulate:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="Enter IPv4 string (e.g. 192.168.1.1)"
                className="form-input mono"
                style={{ fontSize: '1.1rem', padding: '10px 14px' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-navy"
                style={{ minWidth: '140px' }}
              >
                <Play size={16} />
                <span>{loading ? 'Compiling...' : 'Run DFA'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Presets:</span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputAddress(preset.ip);
                runSimulation(preset.ip);
              }}
              className="btn btn-outline btn-sm mono"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {preset.label}: <strong>{preset.ip}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Step-by-Step Simulator Component */}
      {simulationData && (
        <StepSimulator
          simulationData={simulationData}
          onReset={() => {
            // Keep simulation data loaded at step 0
          }}
        />
      )}
    </div>
  );
}
