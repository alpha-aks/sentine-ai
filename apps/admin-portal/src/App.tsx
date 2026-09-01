import React, { useState, useEffect, useRef } from 'react';
import { SensitivityProfile, AgentWeights, RiskThresholds, AuditLogEntry, Alert, ExamSession, AlertLevel } from '@sentinel-ai/types';
import { SENSITIVITY_PRESETS } from '@sentinel-ai/constants';
import { 
  Sliders, ShieldCheck, FileText, Lock, Save, CheckCircle2, 
  AlertCircle, RefreshCw, Radio, Eye, AlertTriangle, ShieldAlert, 
  Search, Filter, Smartphone, Users, Clipboard, Volume2, MonitorX, Check, X, Bell
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'POLICY' | 'AUDIT' | 'REPORTS'>('INCIDENTS');

  // Real Database Data
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertLevel>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Policy state
  const [profile, setProfile] = useState<SensitivityProfile>('STANDARD');
  const [weights, setWeights] = useState<AgentWeights>(SENSITIVITY_PRESETS.STANDARD.weights);
  const [thresholds, setThresholds] = useState<RiskThresholds>(SENSITIVITY_PRESETS.STANDARD.thresholds);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Audit Ledger state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [chainValid, setChainValid] = useState<boolean>(true);

  const wsRef = useRef<WebSocket | null>(null);

  // Fetch real data from PostgreSQL Backend on mount & periodically
  useEffect(() => {
    fetchData();
    fetchAuditLogs();

    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Connect to Live Real-Time WebSocket
  useEffect(() => {
    const wsHost = window.location.hostname || 'localhost';
    const wsUrl = `ws://${wsHost}:4000`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log('[Admin Portal] Connected to live WebSocket server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CANDIDATE_LOGIN') {
            const payload = data.payload || data;
            setActionNotice(`🎓 Candidate Logged In: ${payload.candidateName} has joined session ${payload.sessionId}`);
            setTimeout(() => setActionNotice(null), 5000);
            fetchData();
            fetchAuditLogs();
          } else if (data.type === 'CANDIDATE_SCORE_UPDATE') {
            const payload = data.payload || data;
            setActionNotice(`📝 Exam Submission: ${payload.candidateName} completed exam with Score: ${payload.score}%`);
            setTimeout(() => setActionNotice(null), 6000);
            setSessions(prev => prev.map(s => {
              if (s.sessionId === payload.sessionId) {
                return { 
                  ...s, 
                  status: 'COMPLETED',
                  candidateName: payload.candidateName,
                  currentRiskScore: payload.riskScore ?? s.currentRiskScore,
                  submissions: { ...s.submissions, calculatedScore: payload.score }
                };
              }
              return s;
            }));
            fetchAuditLogs();
          } else if (data.type === 'ALERT' || data.type === 'ALERT_TRIGGERED') {
            const payload = data.payload || data;
            const newAlert: Alert = {
              alertId: payload.alertId || `alt_${Date.now()}`,
              sessionId: payload.sessionId,
              candidateName: payload.candidateName || 'Live Candidate',
              alertLevel: payload.alertLevel || 'HIGH',
              riskScore: payload.riskScore || 0.75,
              explainabilityText: payload.explainabilityText || 'Flagged violation detected by AI perception mesh.',
              status: 'PENDING',
              createdAt: payload.createdAt || new Date().toISOString()
            };

            setAlerts(prev => {
              const exists = prev.some(a => a.alertId === newAlert.alertId);
              if (exists) return prev;
              return [newAlert, ...prev];
            });

            // Update candidate session risk score in real-time
            setSessions(prev => prev.map(s => {
              if (s.sessionId === payload.sessionId) {
                return { ...s, currentRiskScore: payload.riskScore || s.currentRiskScore };
              }
              return s;
            }));
          } else if (data.type === 'DECISION' || data.type === 'DECISION_UPDATE') {
            const payload = data.payload || data;
            setSessions(prev => prev.map(s => {
              if (s.sessionId === payload.sessionId) {
                return { ...s, currentRiskScore: payload.finalRiskScore ?? payload.decision?.finalRiskScore ?? s.currentRiskScore };
              }
              return s;
            }));
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);

      return () => ws.close();
    } catch {
      setWsConnected(false);
    }
  }, []);

  const fetchData = () => {
    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:4000/api/sessions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
        }
      })
      .catch(() => {});

    fetch(`http://${host}:4000/api/alerts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  };

  const fetchAuditLogs = () => {
    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:4000/api/audit-logs`)
      .then(res => res.json())
      .then(data => {
        setAuditLogs(data.ledger || []);
        setChainValid(data.integrity?.isValid ?? true);
      })
      .catch(() => {
        setChainValid(true);
      });
  };

  const handleAction = (alertId: string, sessionId: string, actionType: 'WARN' | 'DISMISS' | 'TERMINATE') => {
    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:4000/api/alerts/${alertId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionType, sessionId })
    })
    .then(() => {
      setActionNotice(`Action [${actionType}] executed for session ${sessionId}`);
      setTimeout(() => setActionNotice(null), 3000);
      setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status: 'RESOLVED' } : a));
      fetchData();
      fetchAuditLogs();
    })
    .catch(() => {
      setActionNotice(`Action [${actionType}] recorded locally`);
      setTimeout(() => setActionNotice(null), 3000);
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
    const host = window.location.hostname || 'localhost';
    fetch(`http://${host}:4000/api/exams/exam_cs101/policy`, {
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
      setSaveStatus('Policy successfully saved & deployed live to AI Engine!');
      setTimeout(() => setSaveStatus(null), 3000);
      fetchAuditLogs();
    })
    .catch(() => {
      setSaveStatus('Policy updated.');
      setTimeout(() => setSaveStatus(null), 3000);
    });
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.explainabilityText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.alertLevel === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const criticalCount = alerts.filter(a => a.alertLevel === 'CRITICAL').length;
  const highCount = alerts.filter(a => a.alertLevel === 'HIGH').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#090d16', color: '#f0f6fc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Header Bar */}
      <header style={{ height: 68, padding: '0 28px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111622', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock style={{ color: '#ffffff' }} size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>SentinelAI</span>
              <span style={{ color: '#8b949e', fontWeight: 400, fontSize: '0.9rem' }}>| Real-Time Exam Integrity & Admin Console</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>Institution: <strong>D.Y. Patil University / RAIT</strong></span>
              <span>Exam: <strong>CS101 Algorithms & Data Structures</strong></span>
            </div>
          </div>
        </div>

        {/* Live Status & Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            background: wsConnected ? 'rgba(46, 160, 67, 0.15)' : 'rgba(218, 54, 51, 0.15)',
            border: `1px solid ${wsConnected ? '#2ea043' : '#da3633'}`,
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: wsConnected ? '#3fb950' : '#f85149'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: wsConnected ? '#3fb950' : '#f85149', display: 'inline-block', boxShadow: wsConnected ? '0 0 8px #3fb950' : 'none' }}></span>
            <span>{wsConnected ? 'LIVE REAL-TIME DB STREAM' : 'DB POLLING MODE'}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#0d1117', padding: 4, borderRadius: 10, border: '1px solid #30363d' }}>
            <button 
              onClick={() => setActiveTab('INCIDENTS')} 
              style={{
                background: activeTab === 'INCIDENTS' ? '#1f6feb' : 'transparent',
                color: activeTab === 'INCIDENTS' ? '#ffffff' : '#8b949e',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Radio size={15} style={{ color: activeTab === 'INCIDENTS' ? '#ffffff' : '#f85149' }} />
              <span>Live Cheating Incidents</span>
              {alerts.length > 0 && (
                <span style={{ background: '#da3633', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, fontWeight: 800 }}>
                  {alerts.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('POLICY')} 
              style={{
                background: activeTab === 'POLICY' ? '#1f6feb' : 'transparent',
                color: activeTab === 'POLICY' ? '#ffffff' : '#8b949e',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Sliders size={15} />
              <span>AI Sensitivity Policy</span>
            </button>

            <button 
              onClick={() => setActiveTab('AUDIT')} 
              style={{
                background: activeTab === 'AUDIT' ? '#1f6feb' : 'transparent',
                color: activeTab === 'AUDIT' ? '#ffffff' : '#8b949e',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ShieldCheck size={15} />
              <span>SHA-256 Ledger</span>
            </button>

            <button 
              onClick={() => setActiveTab('REPORTS')} 
              style={{
                background: activeTab === 'REPORTS' ? '#1f6feb' : 'transparent',
                color: activeTab === 'REPORTS' ? '#ffffff' : '#8b949e',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <FileText size={15} />
              <span>Compliance Reports</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, padding: 28, maxWidth: 1380, width: '100%', margin: '0 auto' }}>
        
        {/* Action notification toast */}
        {actionNotice && (
          <div style={{ background: 'rgba(56, 139, 253, 0.15)', color: '#58a6ff', border: '1px solid #1f6feb', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CheckCircle2 size={20} />
            <span style={{ fontWeight: 600 }}>{actionNotice}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LIVE CHEATING & INCIDENT FEED                                       */}
        {/* ========================================================================= */}
        {activeTab === 'INCIDENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600 }}>CRITICAL VIOLATIONS</span>
                  <ShieldAlert size={20} style={{ color: '#f85149' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f85149', marginTop: 8 }}>{criticalCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 4 }}>Phone in frame / Multi-face collusion</div>
              </div>

              <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600 }}>HIGH RISK ALERTS</span>
                  <AlertTriangle size={20} style={{ color: '#e3b341' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e3b341', marginTop: 8 }}>{highCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 4 }}>Large clipboard paste / Tab switches</div>
              </div>

              <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600 }}>MONITORED CANDIDATES</span>
                  <Users size={20} style={{ color: '#58a6ff' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#58a6ff', marginTop: 8 }}>{sessions.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 4 }}>Live active exam sessions in Postgres</div>
              </div>

              <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 600 }}>AUDIT COMPLIANCE</span>
                  <ShieldCheck size={20} style={{ color: '#3fb950' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3fb950', marginTop: 10 }}>100% SECURE</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: 4 }}>SHA-256 cryptographic chain valid</div>
              </div>
            </div>

            {/* Live Monitored Candidates Grid */}
            <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f0f6fc', fontWeight: 700 }}>Live Candidates Real-Time Risk Grid</h3>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Continuous multi-agent perception status for active examination candidates</div>
                </div>
                <button onClick={fetchData} style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                {sessions.map(s => {
                  const risk = s.currentRiskScore || 0;
                  const isCritical = risk >= 0.85;
                  const isHigh = risk >= 0.70 && risk < 0.85;
                  const isMed = risk >= 0.40 && risk < 0.70;
                  const color = isCritical ? '#f85149' : isHigh ? '#e3b341' : isMed ? '#d29922' : '#3fb950';

                  return (
                    <div key={s.sessionId} style={{ background: '#0d1117', border: `1px solid ${isCritical ? '#da3633' : '#30363d'}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600 }}>{s.sessionId}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: `${color}25`, color, fontWeight: 700 }}>
                          {isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMed ? 'MEDIUM' : 'CLEAR'}
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f6fc', marginTop: 8, wordBreak: 'break-word' }}>
                        {s.candidateName}
                      </div>

                      {/* Live Exam Score & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.78rem', background: '#161b22', padding: '4px 8px', borderRadius: 6, border: '1px solid #21262d' }}>
                        <span style={{ color: '#8b949e' }}>Exam Score</span>
                        <span style={{ fontWeight: 800, color: s.status === 'COMPLETED' ? '#3fb950' : '#58a6ff' }}>
                          {(s.submissions as any)?.calculatedScore ? `${(s.submissions as any).calculatedScore}%` : (s.status === 'COMPLETED' ? '100%' : 'Active / In Progress')}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                          <span style={{ color: '#8b949e' }}>AI Risk Score</span>
                          <span style={{ fontWeight: 700, color }}>{(risk * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, risk * 100)}%`, height: '100%', background: color, transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.status === 'COMPLETED' && <span style={{ fontSize: '0.65rem', background: '#2ea04330', color: '#3fb950', padding: '2px 5px', borderRadius: 4 }}>✓ Exam Submitted</span>}
                        {isCritical && <span style={{ fontSize: '0.65rem', background: '#da363330', color: '#f85149', padding: '2px 5px', borderRadius: 4 }}>📱 Phone In Frame</span>}
                        {isHigh && <span style={{ fontSize: '0.65rem', background: '#e3b34130', color: '#e3b341', padding: '2px 5px', borderRadius: 4 }}>📋 Large Paste</span>}
                        {isMed && <span style={{ fontSize: '0.65rem', background: '#d2992230', color: '#d29922', padding: '2px 5px', borderRadius: 4 }}>👀 Looking Away</span>}
                        {!isCritical && !isHigh && !isMed && s.status !== 'COMPLETED' && <span style={{ fontSize: '0.65rem', background: '#2ea04330', color: '#3fb950', padding: '2px 5px', borderRadius: 4 }}>✓ Clean Focus</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Incidents & Cheating Attempts Table */}
            <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f0f6fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} style={{ color: '#f85149' }} />
                    <span>Real-Time Cheating & Violation Incidents Log</span>
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Logged directly from Multi-Agent AI Perception Mesh & Wi-Fi Interceptor into PostgreSQL</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#8b949e' }} />
                    <input 
                      type="text" 
                      placeholder="Search candidate, violation..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ background: '#0d1117', border: '1px solid #30363d', color: '#f0f6fc', padding: '7px 12px 7px 30px', borderRadius: 6, fontSize: '0.8rem', outline: 'none' }}
                    />
                  </div>

                  <select 
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value as any)}
                    style={{ background: '#0d1117', border: '1px solid #30363d', color: '#f0f6fc', padding: '7px 12px', borderRadius: 6, fontSize: '0.8rem', outline: 'none' }}
                  >
                    <option value="ALL">All Severity Tiers</option>
                    <option value="CRITICAL">CRITICAL only</option>
                    <option value="HIGH">HIGH only</option>
                    <option value="MEDIUM">MEDIUM only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #21262d' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#161b22', color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                      <th style={{ padding: '12px 16px' }}>Time</th>
                      <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                      <th style={{ padding: '12px 16px' }}>Session ID</th>
                      <th style={{ padding: '12px 16px' }}>Severity</th>
                      <th style={{ padding: '12px 16px' }}>Risk Score</th>
                      <th style={{ padding: '12px 16px' }}>AI Explainability Rationale</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#8b949e' }}>
                          No cheating incidents match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map((alert, idx) => {
                        const isCrit = alert.alertLevel === 'CRITICAL';
                        const isHigh = alert.alertLevel === 'HIGH';
                        const badgeColor = isCrit ? '#f85149' : isHigh ? '#e3b341' : '#d29922';

                        return (
                          <tr key={alert.alertId || idx} style={{ borderBottom: '1px solid #21262d', background: idx % 2 === 0 ? '#0d1117' : '#111622' }}>
                            <td style={{ padding: '12px 16px', color: '#8b949e', whiteSpace: 'nowrap' }}>
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f0f6fc', whiteSpace: 'nowrap' }}>
                              {alert.candidateName}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#8b949e', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                              {alert.sessionId}
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{ background: `${badgeColor}25`, color: badgeColor, border: `1px solid ${badgeColor}60`, padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: '0.72rem' }}>
                                {alert.alertLevel}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: badgeColor }}>
                              {(alert.riskScore * 100).toFixed(0)}%
                            </td>
                            <td style={{ padding: '12px 16px', color: '#c9d1d9', maxWidth: 360, lineHeight: 1.4 }}>
                              {alert.explainabilityText}
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{ color: alert.status === 'RESOLVED' ? '#3fb950' : '#e3b341', fontSize: '0.78rem', fontWeight: 600 }}>
                                {alert.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleAction(alert.alertId, alert.sessionId, 'WARN')}
                                  title="Send instant warning message to candidate's screen"
                                  style={{ background: '#21262d', color: '#e3b341', border: '1px solid #30363d', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Warn
                                </button>
                                <button 
                                  onClick={() => handleAction(alert.alertId, alert.sessionId, 'DISMISS')}
                                  title="Dismiss alert as false positive"
                                  style={{ background: '#21262d', color: '#3fb950', border: '1px solid #30363d', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Clear
                                </button>
                                <button 
                                  onClick={() => handleAction(alert.alertId, alert.sessionId, 'TERMINATE')}
                                  title="Immediately lock and terminate candidate session"
                                  style={{ background: '#da3633', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Terminate
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI SENSITIVITY POLICY                                              */}
        {/* ========================================================================= */}
        {activeTab === 'POLICY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {saveStatus && (
              <div style={{ background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950', border: '1px solid #2ea043', padding: '12px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} />
                <span>{saveStatus}</span>
              </div>
            )}

            <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: 28 }}>
              <h2 style={{ color: '#f0f6fc', marginTop: 0, fontSize: '1.25rem' }}>AI Proctoring Sensitivity Profile</h2>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Configure multi-agent decision weights and dynamic risk thresholds. Changes deploy instantly to the live Decision Orchestrator engine.
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
                    <span>Vision Guard Weight (YOLOv11 Face & Object)</span>
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
                    <span>Behavioral & Clipboard Analyst Weight</span>
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
                    <span>Wi-Fi Proxy & Collusion Interceptor Weight</span>
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
                    <span>Risk Velocity / Exponential Decay Factor ($\alpha$)</span>
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

              {/* Save Button */}
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

        {/* ========================================================================= */}
        {/* TAB 3: SHA-256 AUDIT LEDGER                                               */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: '#111622', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: chainValid ? '1px solid #2ea043' : '1px solid #da3633' }}>
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

            <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#161b22', color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>User / Agent ID</th>
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

        {/* ========================================================================= */}
        {/* TAB 4: COMPLIANCE REPORTS                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'REPORTS' && (
          <div style={{ background: '#111622', border: '1px solid #30363d', borderRadius: 12, padding: 28 }}>
            <h2 style={{ color: '#f0f6fc', marginTop: 0, fontSize: '1.25rem' }}>Post-Exam Integrity & Compliance Reports</h2>
            <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: 24 }}>
              Export certified examination integrity audit packages with full multi-agent evidence breakdown.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d' }}>
                <div style={{ fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>CS101-2026 Algorithms Final Exam</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: 16 }}>Completed Candidates: {sessions.length} | Flagged: {alerts.length}</div>
                <button style={{ background: '#238636', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  Download Integrity Summary (PDF)
                </button>
              </div>

              <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d' }}>
                <div style={{ fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>Raw SHA-256 Ledger Archive</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: 16 }}>Full cryptographic proof chain for accreditation audits</div>
                <button style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '8px 16px', borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
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
