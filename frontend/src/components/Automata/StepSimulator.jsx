import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  FastForward,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function StepSimulator({ simulationData, onReset }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(800); // ms per step
  const timerRef = useRef(null);

  const steps = simulationData?.trace?.steps || [];
  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps - 1;

  // Handle automatic playback
  useEffect(() => {
    if (isPlaying) {
      if (isFinished) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, isFinished, playbackSpeed]);

  const handlePlayPause = () => {
    if (isFinished) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    if (onReset) onReset();
  };

  const handleRunToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const currentState = currentStep
    ? currentStep.toState
    : simulationData?.trace?.startState || 'S_1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Character Tape Visualizer */}
      <div className="card" style={{ background: '#0F172A', color: '#FFFFFF', border: 'none' }}>
        <div style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Input String Tape (Alphabet: {'{ 0..9, . }'})
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {simulationData?.inputAddress?.split('').map((char, idx) => {
            let bg = '#1E293B';
            let border = '1px solid #334155';
            let textColor = '#CBD5E1';
            let transform = 'scale(1)';

            if (idx === currentStep?.charIndex) {
              bg = '#2563EB';
              border = '2px solid #60A5FA';
              textColor = '#FFFFFF';
              transform = 'scale(1.1)';
            } else if (idx < (currentStep?.charIndex ?? -1)) {
              bg = '#064E3B';
              border = '1px solid #059669';
              textColor = '#A7F3D0';
            }

            return (
              <div
                key={idx}
                style={{
                  minWidth: '44px',
                  height: '52px',
                  borderRadius: '8px',
                  background: bg,
                  border,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  transform
                }}
              >
                <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor }}>
                  {char}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Control Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePlayPause}
            className={`btn ${isPlaying ? 'btn-navy' : 'btn-primary'}`}
            style={{ minWidth: '110px' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : isFinished ? 'Replay' : 'Play'}</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={isFinished}
            className="btn btn-outline"
            title="Step forward one symbol"
          >
            <SkipForward size={16} />
            <span>Next Step</span>
          </button>

          <button
            onClick={handleRunToEnd}
            disabled={isFinished}
            className="btn btn-outline"
            title="Fast forward to final state"
          >
            <FastForward size={16} />
            <span>Run All</span>
          </button>

          <button
            onClick={handleReset}
            className="btn btn-outline"
            title="Reset simulator"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Selector & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748B' }}>Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="form-select"
              style={{ width: '110px', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <option value={1200}>0.5x (Slow)</option>
              <option value={800}>1.0x (Normal)</option>
              <option value={400}>2.0x (Fast)</option>
              <option value={200}>4.0x (Ultra)</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#142D4E' }}>
            Step: <span style={{ color: '#2563EB' }}>{currentStepIndex + 1}</span> / {totalSteps}
          </div>
        </div>
      </div>

      {/* 3. Machine State Spotlight */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Current State Spotlight */}
        <div className="card" style={{ borderLeft: '5px solid #2563EB' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active State (q ∈ Q)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="mono"
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: currentState === 'TRAP_DEAD' ? '#EF4444' : '#142D4E',
                background: currentState === 'TRAP_DEAD' ? '#FEF2F2' : '#EFF6FF',
                padding: '6px 14px',
                borderRadius: '8px',
                border: `1px solid ${currentState === 'TRAP_DEAD' ? '#FECACA' : '#BFDBFE'}`
              }}
            >
              {currentState}
            </div>
            {currentStep?.isAccepting && (
              <span className="badge badge-success">Accepting (F)</span>
            )}
            {currentState === 'TRAP_DEAD' && (
              <span className="badge badge-danger">Dead State</span>
            )}
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#475569' }}>
            {currentStep?.toStateLabel || 'Initial Start State (Waiting to consume input)'}
          </div>
        </div>

        {/* Transition Details */}
        <div className="card" style={{ borderLeft: '5px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Delta Function Execution (δ)
          </div>
          {currentStep ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, color: '#0F172A' }}>
                <span className="mono">{currentStep.fromState}</span>
                <ArrowRight size={16} color="#2563EB" />
                <span className="badge badge-info" style={{ textTransform: 'none' }}>on symbol '{currentStep.char}'</span>
                <ArrowRight size={16} color="#2563EB" />
                <span className="mono">{currentStep.toState}</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.825rem', color: '#64748B' }}>
                {currentStep.explanation}
              </div>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
              Press 'Play' or 'Next Step' to begin transition execution.
            </div>
          )}
        </div>
      </div>

      {/* 4. Final Verdict Banner (shown when execution reaches end) */}
      {isFinished && (
        <div
          className="card"
          style={{
            background: simulationData.isValid ? '#F0FDF4' : '#FEF2F2',
            border: `2px solid ${simulationData.isValid ? '#86EFAC' : '#FCA5A5'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            padding: '20px 24px'
          }}
        >
          {simulationData.isValid ? (
            <CheckCircle size={36} color="#16A34A" style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={36} color="#DC2626" style={{ flexShrink: 0 }} />
          )}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: simulationData.isValid ? '#166534' : '#991B1B' }}>
              {simulationData.isValid ? 'ACCEPTED — Valid IPv4 Address' : 'REJECTED — Malformed IPv4 Address'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: simulationData.isValid ? '#15803D' : '#B91C1C', marginTop: '4px' }}>
              {simulationData.isValid
                ? `Input string completely consumed into accepting state '${currentState}'. Matches canonical IPv4 language.`
                : simulationData.errorReason || `Machine terminated in non-accepting state '${currentState}'.`}
            </p>
          </div>
        </div>
      )}

      {/* 5. Complete Step-by-Step Transition Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Transition Trace Log</div>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{steps.length} transitions evaluated</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Char</th>
                <th>Index</th>
                <th>From State</th>
                <th>Symbol</th>
                <th>To State</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((st, idx) => {
                const isActive = idx === currentStepIndex;
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isActive ? '#EFF6FF' : undefined,
                      fontWeight: isActive ? 600 : 400
                    }}
                  >
                    <td>#{st.stepIndex}</td>
                    <td>
                      <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#2563EB' }}>
                        '{st.char}'
                      </span>
                    </td>
                    <td>{st.charIndex}</td>
                    <td className="mono">{st.fromState}</td>
                    <td><span className="badge badge-info">{st.symbol}</span></td>
                    <td className="mono" style={{ color: st.toState === 'TRAP_DEAD' ? '#EF4444' : '#142D4E' }}>
                      {st.toState}
                    </td>
                    <td>
                      {st.isAccepting ? (
                        <span className="badge badge-success">Accepting</span>
                      ) : st.toState === 'TRAP_DEAD' ? (
                        <span className="badge badge-danger">Dead State</span>
                      ) : (
                        <span className="badge badge-warning">Intermediate</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{st.explanation}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
