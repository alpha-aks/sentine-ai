import React, { useState, useEffect, useRef } from 'react';
import { ExamSession, Alert, OrchestratedDecision, AlertLevel } from '@sentinel-ai/types';
import { getRiskLevelColor, getAlertBadgeClass, formatTimestamp } from '@sentinel-ai/ui';
import { ShieldAlert, Users, AlertTriangle, Eye, Search, Filter, Play, CheckCircle, XCircle, BellRing, Lock, ShieldCheck } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [alertFilter, setAlertFilter] = useState<'ALL' | AlertLevel>('ALL');

  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch of sessions and alerts from REST server
    fetch('http://localhost:4000/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(() => {
        // Fallback seed sessions
        setSessions([
          { sessionId: 'sess_100', examId: 'exam_cs101', candidateId: 'cand_alex_01', candidateName: 'Atharva Salunkhe', status: 'IN_PROGRESS', currentRiskScore: 0.12, submissions: {} },
          { sessionId: 'sess_101', examId: 'exam_cs101', candidateId: 'cand_sarah_02', candidateName: 'Priya Sharma', status: 'IN_PROGRESS', currentRiskScore: 0.78, submissions: {} },
          { sessionId: 'sess_102', examId: 'exam_cs101', candidateId: 'cand_michael_03', candidateName: 'Aarav Patel', status: 'IN_PROGRESS', currentRiskScore: 0.45, submissions: {} },
          { sessionId: 'sess_103', examId: 'exam_cs101', candidateId: 'cand_elena_04', candidateName: 'Ananya Iyer', status: 'IN_PROGRESS', currentRiskScore: 0.88, submissions: {} },
          { sessionId: 'sess_104', examId: 'exam_cs101', candidateId: 'cand_david_05', candidateName: 'Vikram Verma', status: 'IN_PROGRESS', currentRiskScore: 0.05, submissions: {} }
        ]);
      });

    fetch('http://localhost:4000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(() => {
        setAlerts([
          {
            alertId: 'alt_01',
            sessionId: 'sess_103',
            candidateName: 'Ananya Iyer',
            alertLevel: 'CRITICAL',
            riskScore: 0.88,
            explainabilityText: 'Flagged due to: 2 faces detected in frame; Secondary device(s) visible: smartphone. Primary risk driver: Camera Tampering.',
            status: 'PENDING',
            createdAt: new Date().toISOString()
          },
          {
            alertId: 'alt_02',
            sessionId: 'sess_101',
            candidateName: 'Priya Sharma',
            alertLevel: 'HIGH',
            riskScore: 0.78,
            explainabilityText: 'Flagged due to: Unusually large text insertion from external clipboard. Primary risk driver: Clipboard Paste Anomaly.',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
          }
        ]);
      });

    // Setup WebSocket
    const connectWs = () => {
      const ws = new WebSocket('ws://localhost:4000');
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'DECISION_UPDATE') {
            const decision: OrchestratedDecision = msg.payload;
            setSessions(prev =>
              prev.map(s => s.sessionId === decision.sessionId ? { ...s, currentRiskScore: decision.finalRiskScore } : s)
            );
          } else if (msg.type === 'ALERT_TRIGGERED') {
            const newAlert: Alert = msg.payload;
            setAlerts(prev => [newAlert, ...prev.filter(a => a.alertId !== newAlert.alertId)]);
          } else if (msg.type === 'PROCTOR_ACTION_EXECUTED') {
            const { alertId, action } = msg.payload;
            setAlerts(prev =>
              prev.map(a => a.alertId === alertId ? { ...a, status: action === 'DISMISS' ? 'DISMISSED' : action === 'WARN' ? 'WARNED' : 'ESCALATED' } : a)
            );
          }
        } catch (err) {
          console.error(err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleExecuteAction = (alertId: string, action: 'DISMISS' | 'WARN' | 'PAUSE' | 'TERMINATE') => {
    fetch(`http://localhost:4000/api/alerts/${alertId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        proctorId: 'proctor_station_01',
        notes: `Proctor command execution: ${action}`
      })
    })
    .then(res => res.json())
    .then(() => {
      setSelectedAlert(null);
      setSelectedSession(null);
    })
    .catch(() => {
      // Local fallback state update
      setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status: action === 'DISMISS' ? 'DISMISSED' : 'WARNED' } : a));
      setSelectedAlert(null);
      setSelectedSession(null);
    });
  };

  // Auto-sort candidates by risk score descending
  const sortedSessions = [...sessions].sort((a, b) => b.currentRiskScore - a.currentRiskScore);

  const filteredSessions = sortedSessions.filter(s => {
    const matchesSearch = s.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
    if (alertFilter === 'ALL') return matchesSearch;
    if (alertFilter === 'CRITICAL') return matchesSearch && s.currentRiskScore >= 0.85;
    if (alertFilter === 'HIGH') return matchesSearch && s.currentRiskScore >= 0.70 && s.currentRiskScore < 0.85;
    if (alertFilter === 'MEDIUM') return matchesSearch && s.currentRiskScore >= 0.40 && s.currentRiskScore < 0.70;
    if (alertFilter === 'LOW') return matchesSearch && s.currentRiskScore < 0.40;
    return matchesSearch;
  });

  const criticalCount = sessions.filter(s => s.currentRiskScore >= 0.85).length;
  const highCount = sessions.filter(s => s.currentRiskScore >= 0.70 && s.currentRiskScore < 0.85).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117' }}>
      {/* Top Navigation Bar */}
      <header style={{ height: 64, padding: '0 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#161b22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldAlert style={{ color: '#da3633' }} size={28} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f0f6fc', letterSpacing: '-0.3px' }}>
              SentinelAI <span style={{ color: '#8b949e', fontWeight: 400 }}>| Live Proctor Command Center</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Session: CS101-2026 Algorithms Examination</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ padding: '6px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} style={{ color: '#8b949e' }} />
              <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Candidates Active:</span>
              <span style={{ fontWeight: 700, color: '#f0f6fc' }}>{sessions.length}</span>
            </div>

            <div style={{ padding: '6px 14px', background: criticalCount > 0 ? 'rgba(218, 54, 51, 0.15)' : '#0d1117', borderRadius: 8, border: criticalCount > 0 ? '1px solid #da3633' : '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} style={{ color: criticalCount > 0 ? '#f85149' : '#8b949e' }} />
              <span style={{ fontSize: '0.8rem', color: criticalCount > 0 ? '#ff7b72' : '#8b949e' }}>Critical Flagged:</span>
              <span style={{ fontWeight: 700, color: criticalCount > 0 ? '#f85149' : '#f0f6fc' }}>{criticalCount}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: wsConnected ? '#3fb950' : '#f85149' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: wsConnected ? '#3fb950' : '#f85149', display: 'inline-block' }}></span>
            <span>{wsConnected ? 'Multi-Agent Stream Online' : 'Stream Disconnected'}</span>
          </div>
        </div>
      </header>

      {/* Main Body Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', flex: 1, overflow: 'hidden' }}>
        {/* Left Candidate Grid Section */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* Controls & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <Search style={{ position: 'absolute', left: 12, top: 10, color: '#8b949e' }} size={18} />
              <input
                type="text"
                placeholder="Search candidate name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 38px',
                  borderRadius: 8,
                  border: '1px solid #30363d',
                  background: '#161b22',
                  color: '#f0f6fc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Filter size={16} style={{ color: '#8b949e' }} />
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setAlertFilter(lvl)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: alertFilter === lvl ? '#238636' : '#161b22',
                    color: alertFilter === lvl ? '#ffffff' : '#8b949e',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Stream Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filteredSessions.map(session => {
              const color = getRiskLevelColor(session.currentRiskScore);
              const isHighOrCritical = session.currentRiskScore >= 0.70;

              return (
                <div
                  key={session.sessionId}
                  style={{
                    background: '#161b22',
                    borderRadius: 12,
                    border: `1px solid ${session.currentRiskScore >= 0.85 ? '#da3633' : session.currentRiskScore >= 0.70 ? '#db6d28' : '#30363d'}`,
                    boxShadow: isHighOrCritical ? `0 0 16px ${color}22` : 'none',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f0f6fc', fontSize: '0.95rem' }}>{session.candidateName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>ID: {session.candidateId}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>
                        {(session.currentRiskScore * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#8b949e', textTransform: 'uppercase' }}>Risk Score</div>
                    </div>
                  </div>

                  {/* Simulated Stream Thumbnail Box */}
                  <div style={{ height: 160, background: '#0d1117', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 70, height: 90, border: `2px solid ${color}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '0.7rem' }}>
                      CAM OK
                    </div>
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', color: '#3fb950', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb950' }}></span>
                      <span>LIVE STREAM</span>
                    </div>
                  </div>

                  {/* Dynamic Risk Bar */}
                  <div style={{ height: 4, background: '#21262d', width: '100%' }}>
                    <div style={{ height: '100%', width: `${session.currentRiskScore * 100}%`, background: color, transition: 'width 0.3s ease' }}></div>
                  </div>

                  {/* Card Footer Controls */}
                  <div style={{ padding: 12, background: '#161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>{session.status}</span>
                    <button
                      onClick={() => {
                        const matchingAlert = alerts.find(a => a.sessionId === session.sessionId) || {
                          alertId: `alt_manual_${Date.now()}`,
                          sessionId: session.sessionId,
                          candidateName: session.candidateName,
                          alertLevel: session.currentRiskScore >= 0.85 ? 'CRITICAL' : session.currentRiskScore >= 0.70 ? 'HIGH' : 'MEDIUM',
                          riskScore: session.currentRiskScore,
                          explainabilityText: `Session risk evaluated at ${(session.currentRiskScore * 100).toFixed(0)}%. Multi-modal telemetry streams active.`,
                          status: 'PENDING',
                          createdAt: new Date().toISOString()
                        };
                        setSelectedAlert(matchingAlert);
                        setSelectedSession(session);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #30363d',
                        background: '#21262d',
                        color: '#f0f6fc',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Eye size={14} />
                      <span>Review Evidence</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Live Alert Feed Sidebar */}
        <div style={{ borderLeft: '1px solid #30363d', background: '#161b22', padding: 20, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BellRing size={20} style={{ color: '#d29922' }} />
            <h3 style={{ margin: 0, color: '#f0f6fc', fontSize: '1.05rem' }}>Live Alert Feed</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.length === 0 ? (
              <div style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center', padding: 32 }}>
                No active integrity alerts triggered.
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.alertId}
                  onClick={() => {
                    setSelectedAlert(alert);
                    const sess = sessions.find(s => s.sessionId === alert.sessionId) || null;
                    setSelectedSession(sess);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: '#0d1117',
                    border: `1px solid ${alert.alertLevel === 'CRITICAL' ? '#da3633' : alert.alertLevel === 'HIGH' ? '#db6d28' : '#30363d'}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: '#f0f6fc', fontSize: '0.85rem' }}>{alert.candidateName}</span>
                    <span className={`badge ${getAlertBadgeClass(alert.alertLevel)}`}>
                      {alert.alertLevel}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.4, marginBottom: 8 }}>
                    {alert.explainabilityText}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#484f58' }}>
                    <span>{formatTimestamp(alert.createdAt)}</span>
                    <span style={{ fontWeight: 600, color: alert.status === 'PENDING' ? '#d29922' : '#3fb950' }}>{alert.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Evidence Review Modal */}
      {selectedAlert && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: 850, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: 28, background: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0f6fc' }}>
                  Evidence Review & XAI Diagnostic: {selectedAlert.candidateName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Session ID: {selectedAlert.sessionId} | Alert ID: {selectedAlert.alertId}</div>
              </div>
              <button onClick={() => setSelectedAlert(null)} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Multi-modal evidence player snippet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Webcam Telemetry Clip (Synchronized)</div>
                <div style={{ height: 180, background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#8b949e', gap: 8 }}>
                  <Play size={32} style={{ color: '#238636' }} />
                  <span style={{ fontSize: '0.75rem' }}>Play 10s Pre-Flag Video Clip</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Screen Capture & Audio Spectrum</div>
                <div style={{ height: 180, background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c9d1d9' }}>Focus Lost: Chrome Window Blur (3.2s)</div>
                  <div style={{ height: 40, background: 'rgba(56, 139, 253, 0.1)', border: '1px dashed #388bfd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#58a6ff' }}>
                    VAD Acoustic Waveform Isolated
                  </div>
                </div>
              </div>
            </div>

            {/* XAI Explainability Rationale */}
            <div style={{ background: '#0d1117', padding: 18, borderRadius: 8, border: '1px solid #30363d', marginBottom: 24 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d29922', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} />
                <span>Multi-Agent Explainability Trace (XAI Rationale)</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#c9d1d9', lineHeight: 1.6 }}>
                {selectedAlert.explainabilityText}
              </div>
            </div>

            {/* Proctor Action Control Bar */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                Actions are logged to SHA-256 Cryptographic Audit Ledger
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleExecuteAction(selectedAlert.alertId, 'DISMISS')} className="btn-action btn-dismiss">
                  Dismiss False Positive
                </button>
                <button onClick={() => handleExecuteAction(selectedAlert.alertId, 'WARN')} className="btn-action btn-warn">
                  Send Warning Toast
                </button>
                <button onClick={() => handleExecuteAction(selectedAlert.alertId, 'TERMINATE')} className="btn-action btn-terminate">
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
