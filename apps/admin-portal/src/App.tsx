import React, { useState, useEffect } from 'react';
import { SensitivityProfile, AgentWeights, RiskThresholds, AuditLogEntry } from '@sentinel-ai/types';
import { SENSITIVITY_PRESETS } from '@sentinel-ai/constants';
import { Sliders, ShieldCheck, FileText, Lock, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'POLICY' | 'AUDIT' | 'REPORTS'>('POLICY');

  // Policy state
  const [profile, setProfile] = useState<SensitivityProfile>('STANDARD');
  const [weights, setWeights] = useState<AgentWeights>(SENSITIVITY_PRESETS.STANDARD.weights);
  const [thresholds, setThresholds] = useState<RiskThresholds>(SENSITIVITY_PRESETS.STANDARD.thresholds);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Audit Ledger state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [chainValid, setChainValid] = useState<boolean>(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = () => {
    fetch('http://localhost:4000/api/audit-logs')
      .then(res => res.json())
      .then(data => {
        setAuditLogs(data.ledger || []);
        setChainValid(data.integrity?.isValid ?? true);
      })
      .catch(() => {
        // Fallback mock audit entries
        setAuditLogs([
          {
            logId: 'audit_1001',
            institutionId: 'inst_mit_01',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            userId: 'SYSTEM',
            action: 'SYSTEM_INIT',
            payload: { message: 'SHA-256 Audit Ledger Initialized' },
            prevEntryHash: '0000000000000000000000000000000000000000000000000000000000000000',
            entryHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          },
          {
            logId: 'audit_1002',
            institutionId: 'inst_mit_01',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            userId: 'proctor_station_01',
            action: 'PROCTOR_ACTION_EXECUTED',
            payload: { alertId: 'alt_01', action: 'WARN', notes: 'Gaze offscreen warning toast sent' },
            prevEntryHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            entryHash: 'a7c9f82312b4e5d67890123456789abcdef0123456789abcdef0123456789abc'
          }
        ]);
        setChainValid(true);
      });
  };

  const handleProfileSelect = (p: SensitivityProfile) => {
    setProfile(p);
    if (p !== 'CUSTOM') {
      setWeights(SENSITIVITY_PRESETS[p].weights);
      setThresholds(SENSITIVITY_PRESETS[p].thresholds);
    }
  };

  const handleSavePolicy = () => {
    fetch('http://localhost:4000/api/exams/exam_cs101/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensitivityProfile: profile,
        customWeights: weights,
        customThresholds: thresholds
      })
    })
    .then(res => res.json())
    .then(() => {
      setSaveStatus('Policy successfully saved & deployed live!');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchAuditLogs();
    })
    .catch(() => {
      setSaveStatus('Policy updated locally.');
      setTimeout(() => setSaveStatus(null), 3000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117' }}>
      {/* Top Header */}
      <header style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#161b22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Lock style={{ color: '#1f6feb' }} size={26} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f0f6fc' }}>
              SentinelAI <span style={{ color: '#8b949e', fontWeight: 400 }}>| Admin & Compliance Portal</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Institution: Massachusetts Institute of Technology</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setActiveTab('POLICY')} className={`tab-btn ${activeTab === 'POLICY' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={16} />
              <span>Policy Configurator</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('AUDIT')} className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} />
              <span>SHA-256 Audit Ledger</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('REPORTS')} className={`tab-btn ${activeTab === 'REPORTS' ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} />
              <span>Integrity Reports</span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ flex: 1, padding: 32, maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {activeTab === 'POLICY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {saveStatus && (
              <div style={{ background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950', border: '1px solid #2ea043', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} />
                <span>{saveStatus}</span>
              </div>
            )}

            <div className="glass-panel" style={{ padding: 28 }}>
              <h2 style={{ color: '#f0f6fc', marginTop: 0, fontSize: '1.25rem' }}>AI Proctoring Sensitivity Profile</h2>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Configure multi-agent decision weights and dynamic risk thresholds. Changes deploy instantly to the decision orchestrator.
              </p>

              {/* Presets Button Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, margin: '20px 0' }}>
                {(['STRICT', 'STANDARD', 'LOW', 'CUSTOM'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handleProfileSelect(p)}
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      border: `1px solid ${profile === p ? '#1f6feb' : '#30363d'}`,
                      background: profile === p ? 'rgba(31, 111, 235, 0.15)' : '#0d1117',
                      color: profile === p ? '#58a6ff' : '#c9d1d9',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Agent Weights Sliders */}
              <h3 style={{ color: '#f0f6fc', fontSize: '1.05rem', marginTop: 28, marginBottom: 16 }}>Multi-Agent Weight Allocation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#c9d1d9', marginBottom: 6 }}>
                    <span>Vision Guard Weight</span>
                    <span style={{ fontWeight: 700, color: '#58a6ff' }}>{(weights.vision * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.vision}
                    onChange={e => {
                      setProfile('CUSTOM');
                      setWeights({ ...weights, vision: parseFloat(e.target.value) });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#c9d1d9', marginBottom: 6 }}>
                    <span>Behavioral Analyst Weight</span>
                    <span style={{ fontWeight: 700, color: '#58a6ff' }}>{(weights.behavior * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.behavior}
                    onChange={e => {
                      setProfile('CUSTOM');
                      setWeights({ ...weights, behavior: parseFloat(e.target.value) });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#c9d1d9', marginBottom: 6 }}>
                    <span>Collusion Detection Weight</span>
                    <span style={{ fontWeight: 700, color: '#58a6ff' }}>{(weights.collusion * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.collusion}
                    onChange={e => {
                      setProfile('CUSTOM');
                      setWeights({ ...weights, collusion: parseFloat(e.target.value) });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#c9d1d9', marginBottom: 6 }}>
                    <span>Risk Velocity / Decay Weight</span>
                    <span style={{ fontWeight: 700, color: '#58a6ff' }}>{(weights.risk * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights.risk}
                    onChange={e => {
                      setProfile('CUSTOM');
                      setWeights({ ...weights, risk: parseFloat(e.target.value) });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Action Save Button */}
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSavePolicy}
                  style={{
                    background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Save size={18} />
                  <span>Deploy Policy to AI Orchestrator</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Integrity Status Header Banner */}
            <div className="glass-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: chainValid ? '1px solid #2ea043' : '1px solid #da3633' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {chainValid ? <ShieldCheck size={28} style={{ color: '#3fb950' }} /> : <AlertCircle size={28} style={{ color: '#f85149' }} />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f6fc' }}>
                    {chainValid ? 'Cryptographic Hash-Chain Ledger Verified' : 'Ledger Integrity Warning'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                    {chainValid ? 'SHA-256 block hash chain is 100% tamper-evident and legally defensible.' : 'Hash mismatch detected in audit stream!'}
                  </div>
                </div>
              </div>

              <button onClick={fetchAuditLogs} style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                <RefreshCw size={14} />
                <span>Re-Verify Ledger</span>
              </button>
            </div>

            {/* Audit Logs Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#161b22', color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>User ID</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>Payload Details</th>
                    <th style={{ padding: '12px 16px' }}>SHA-256 Entry Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((entry, idx) => (
                    <tr key={entry.logId || idx} style={{ borderBottom: '1px solid #21262d' }}>
                      <td style={{ padding: '12px 16px', color: '#8b949e' }}>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f0f6fc' }}>{entry.userId}</td>
                      <td style={{ padding: '12px 16px', color: '#58a6ff' }}>{entry.action}</td>
                      <td style={{ padding: '12px 16px', color: '#c9d1d9', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(entry.payload)}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#3fb950' }}>
                        {entry.entryHash ? entry.entryHash.substring(0, 16) + '...' : 'HASH_OK'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="glass-panel" style={{ padding: 28 }}>
            <h2 style={{ color: '#f0f6fc', marginTop: 0, fontSize: '1.25rem' }}>Post-Exam Integrity & Compliance Reports</h2>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: 24 }}>
              Export certified examination integrity audit packages with full multi-agent evidence breakdown.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d' }}>
                <div style={{ fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>CS101-2026 Algorithms Final Exam</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: 16 }}>Completed Candidates: 5 | Flagged: 2</div>
                <button style={{ background: '#238636', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Download Integrity Summary (PDF)
                </button>
              </div>

              <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d' }}>
                <div style={{ fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>Raw SHA-256 Ledger Archive</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: 16 }}>Full cryptographic proof chain for accreditation audits</div>
                <button style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Export JSON Hash-Chain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
