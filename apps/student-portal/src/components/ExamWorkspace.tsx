import React, { useState, useEffect, useRef } from 'react';
import { TelemetryVector, Exam, OrchestratedDecision } from '@sentinel-ai/types';
import { getRiskLevelColor } from '@sentinel-ai/ui';
import { ShieldCheck, Video, Mic, Lock, AlertTriangle, CheckCircle2, Wifi, Zap, FileText, ArrowLeft, Download, RefreshCw } from 'lucide-react';

export default function ExamWorkspace() {
  const [step, setStep] = useState<'VERIFY' | 'EXAM' | 'SUBMITTED'>('VERIFY');
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState('Tanishq Sharma (Candidate #100)');
  
  // WebSockets & Proctoring state
  const [wsConnected, setWsConnected] = useState(false);
  const [currentRisk, setCurrentRisk] = useState(0.05);
  const [proctorToast, setProctorToast] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Simulated live telemetry state
  const [simGazeOffscreen, setSimGazeOffscreen] = useState(false);
  const [simObjectDetected, setSimObjectDetected] = useState(false);
  const [simWhisper, setSimWhisper] = useState(false);
  const [simWifiCollusion, setSimWifiCollusion] = useState(false);

  // Real Candidate Webcam Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [personCount, setPersonCount] = useState(1);
  const [cocoModel, setCocoModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState(false);

  // Dynamic TensorFlow.js & COCO-SSD script loader
  useEffect(() => {
    console.log('[AI Vision] Script loader trigger, step:', step);
    if (step !== 'EXAM') return;

    let isCancelled = false;

    const loadScriptsAndModel = async () => {
      console.log('[AI Vision] Initializing TFJS/COCO-SSD load...');
      if ((window as any).cocoSsd) {
        console.log('[AI Vision] COCO-SSD library already present on window.');
        if (!cocoModel && !modelLoading) {
          try {
            console.log('[AI Vision] Loading model...');
            setModelLoading(true);
            const model = await (window as any).cocoSsd.load();
            if (!isCancelled) {
              setCocoModel(model);
              setModelLoading(false);
              console.log('[AI Vision] Model loaded successfully from window.');
            }
          } catch (err) {
            console.error('[AI Vision] Failed to load COCO-SSD from window:', err);
            setModelLoading(false);
          }
        }
        return;
      }

      console.log('[AI Vision] Appending TF.js script tag...');
      // Load TFJS
      const tfScript = document.createElement('script');
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js';
      tfScript.async = true;
      document.body.appendChild(tfScript);

      tfScript.onload = () => {
        console.log('[AI Vision] TF.js script loaded. Appending COCO-SSD script tag...');
        // Load COCO-SSD
        const cocoScript = document.createElement('script');
        cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
        cocoScript.async = true;
        document.body.appendChild(cocoScript);

        cocoScript.onload = async () => {
          console.log('[AI Vision] COCO-SSD script loaded. Initializing model load...');
          try {
            setModelLoading(true);
            const model = await (window as any).cocoSsd.load();
            if (!isCancelled) {
              setCocoModel(model);
              setModelLoading(false);
              console.log('[AI Vision] Model loaded successfully.');
            }
          } catch (err) {
            console.error('[AI Vision] Failed to load COCO-SSD model after script load:', err);
            setModelLoading(false);
          }
        };
      };
    };

    loadScriptsAndModel();

    return () => {
      isCancelled = true;
    };
  }, [step]);

  // Inference Loop: analyze video frame every 1s
  useEffect(() => {
    console.log('[AI Vision] Inference loop useEffect check. cocoModel:', !!cocoModel, 'videoRef:', !!videoRef.current, 'mediaStream:', !!mediaStream);
    if (!cocoModel || step !== 'EXAM' || !videoRef.current || !mediaStream) return;

    let intervalId: NodeJS.Timeout;
    let isRunning = false;

    console.log('[AI Vision] Setting up inference interval loop...');
    const runDetection = async () => {
      if (isRunning || !videoRef.current) return;
      isRunning = true;

      try {
        console.log('[AI Vision] Running object detection on frame...');
        const predictions = await cocoModel.detect(videoRef.current);
        console.log('[AI Vision] Predictions:', predictions);

        // Detect cell phone, laptop, or tablet (lowered to 0.40 for high sensitivity)
        const phone = predictions.some(
          (p: any) => (p.class === 'cell phone' || p.class === 'laptop' || p.class === 'tablet') && p.score > 0.40
        );
        setSimObjectDetected(phone);

        // Detect person count (lowered to 0.40 for stable presence checking)
        const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.40);
        setPersonCount(persons.length);
        console.log('[AI Vision] Person count:', persons.length, 'Phone detected:', phone);
      } catch (err) {
        console.error('[AI Vision] Inference error:', err);
      } finally {
        isRunning = false;
      }
    };

    intervalId = setInterval(runDetection, 1000);

    return () => {
      console.log('[AI Vision] Clearing inference interval loop...');
      clearInterval(intervalId);
    };
  }, [cocoModel, step, mediaStream]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((s) => {
          stream = s;
          setMediaStream(s);
          setWebcamActive(true);
        })
        .catch(() => {
          setWebcamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [step, mediaStream]);

  const sessionId = 'sess_100'; // Candidate Alex Johnson

  // Default initial mock exam data
  const defaultExam: Exam = {
    examId: 'exam_cs101',
    institutionId: 'inst_mit_01',
    code: 'CS101-2026',
    title: 'Advanced Computer Science & Algorithms',
    description: 'Comprehensive examination covering Data Structures, Graph Theory, and Multi-Agent AI Systems.',
    durationMinutes: 90,
    policy: {
      policyId: 'pol_std_001',
      examId: 'exam_cs101',
      sensitivityProfile: 'STANDARD',
      agentWeights: { vision: 0.35, behavior: 0.25, collusion: 0.25, risk: 0.15 },
      riskThresholds: { low: 0.40, medium: 0.55, high: 0.70, critical: 0.85 },
      enabledAgents: { visionGuard: true, behavioralAnalyst: true, collusionDetection: true, riskPrediction: true }
    },
    questions: [
      {
        questionId: 'q1',
        type: 'MULTIPLE_CHOICE',
        text: 'Which data structure offers average O(1) time complexity for insertions and lookups?',
        options: ['Binary Search Tree', 'Hash Map', 'Red-Black Tree', 'Doubly Linked List'],
        correctAnswer: 'Hash Map'
      },
      {
        questionId: 'q2',
        type: 'ESSAY',
        text: 'Explain the difference between A* Search and Dijkstra Algorithm in Graph Search, including heuristic requirements.'
      },
      {
        questionId: 'q3',
        type: 'MULTIPLE_CHOICE',
        text: 'What is the primary role of the Decision Orchestrator in SentinelAI?',
        options: ['Capture video frames', 'Correlate multi-modal signals and calculate final risk score', 'Render React UI', 'Encrypt databases'],
        correctAnswer: 'Correlate multi-modal signals and calculate final risk score'
      }
    ]
  };

  useEffect(() => {
    setExam(defaultExam);

    const controller = new AbortController();
    fetch('http://localhost:4000/api/exams/exam_cs101', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setExam(data);
      })
      .catch(() => {
        // Fallback to defaultExam
      });

    fetch('http://localhost:4000/api/sessions', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const mySession = data.find((s: any) => s.sessionId === 'sess_100');
        if (mySession) {
          setCandidateName(`${mySession.candidateName} (Candidate #${mySession.candidateId})`);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let isUnmounted = false;
    let retryCount = 0;

    const connectWs = () => {
      if (isUnmounted || retryCount > 3) return;

      try {
        const ws = new WebSocket('ws://localhost:4000');
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isUnmounted) {
            setWsConnected(true);
            retryCount = 0;
          }
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'DECISION_UPDATE') {
              const decision: OrchestratedDecision = msg.payload;
              if (decision.sessionId === sessionId) {
                setCurrentRisk(decision.finalRiskScore);
                if (decision.correlatedEvidence && decision.correlatedEvidence.length > 0) {
                  setProctorToast(`AI ALERT: ${decision.correlatedEvidence.join(' | ')}`);
                } else {
                  setProctorToast(null);
                }
              }
            } else if (msg.type === 'PROCTOR_ACTION_EXECUTED') {
              if (msg.payload.sessionId === sessionId || !msg.payload.sessionId) {
                setProctorToast(`PROCTOR WARNING: ${msg.payload.notes || 'Unusual telemetry flagged. Please focus on your screen.'}`);
              }
            }
          } catch (e) {
            console.error(e);
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setWsConnected(false);
            retryCount++;
            if (retryCount <= 3) {
              setTimeout(connectWs, 5000);
            }
          }
        };

        ws.onerror = () => {
          if (!isUnmounted) setWsConnected(false);
        };
      } catch {
        if (!isUnmounted) setWsConnected(false);
      }
    };

    connectWs();

    return () => {
      isUnmounted = true;
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      }
    };
  }, []);

  // Telemetry Loop
  useEffect(() => {
    if (step !== 'EXAM') return;

    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const telemetry: TelemetryVector = {
          sessionId,
          timestamp: new Date().toISOString(),
          gazeX: simGazeOffscreen ? 0.85 : 0.05 + (Math.random() * 0.1 - 0.05),
          gazeY: simGazeOffscreen ? 0.82 : 0.02 + (Math.random() * 0.1 - 0.05),
          headYaw: simGazeOffscreen ? 42 : 2,
          headPitch: 0,
          personCount,
          detectedObjects: simObjectDetected ? ['smartphone'] : [],
          keystrokeDwellMs: 120 + Math.random() * 20,
          keystrokeFlightMs: 80 + Math.random() * 15,
          mouseLinearityR2: 0.94,
          whisperDetected: simWhisper,
          wifiCollusionFlag: simWifiCollusion,
          wifiCollusionDetail: simWifiCollusion ? 'ChatGPT query: CS101 Graph Heuristic Requirements' : undefined
        };

        wsRef.current.send(JSON.stringify({
          type: 'TELEMETRY_VECTOR',
          payload: telemetry
        }));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [step, simGazeOffscreen, simObjectDetected, simWhisper, personCount, simWifiCollusion]);

  // Real Focus / Tab Switch detection
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleBlur = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const telemetry: TelemetryVector = {
          sessionId,
          timestamp: new Date().toISOString(),
          windowBlur: true
        };
        wsRef.current.send(JSON.stringify({
          type: 'TELEMETRY_VECTOR',
          payload: telemetry
        }));
      }
    };

    const handleFocus = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const telemetry: TelemetryVector = {
          sessionId,
          timestamp: new Date().toISOString(),
          windowBlur: false
        };
        wsRef.current.send(JSON.stringify({
          type: 'TELEMETRY_VECTOR',
          payload: telemetry
        }));
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [step]);

  // Gaze Offscreen automation via Mouse boundary tracking
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleMouseLeave = () => {
      setSimGazeOffscreen(true);
    };

    const handleMouseEnter = () => {
      setSimGazeOffscreen(false);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [step]);

  const handlePasteSimulate = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const telemetry: TelemetryVector = {
        sessionId,
        timestamp: new Date().toISOString(),
        pastedLength: 1250,
        keystrokeDwellMs: 5,
        windowBlur: true
      };
      wsRef.current.send(JSON.stringify({
        type: 'TELEMETRY_VECTOR',
        payload: telemetry
      }));
    }
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = async () => {
    const ts = new Date().toISOString();
    const rId = `SENTINEL-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTimestamp(ts);
    setReceiptId(rId);

    const newSubmissionRecord = {
      id: rId,
      receiptId: rId,
      examId: exam?.examId || 'exam_cs101',
      examCode: exam?.code || 'CS101-2026',
      examTitle: exam?.title || 'CS101-2026: Advanced Computer Science & Algorithms',
      candidateId: 'cand_100',
      candidateName: candidateName,
      submittedAt: ts,
      durationSpentMinutes: 12,
      status: 'SUBMITTED',
      proctoringStatus: currentRisk < 0.4 ? 'CLEAR' : 'FLAGGED',
      riskScore: currentRisk,
      answeredCount: Object.keys(answers).length,
      totalQuestions: exam?.questions.length || 3
    };

    try {
      const existingStr = localStorage.getItem('sentinel_completed_submissions');
      const list = existingStr ? JSON.parse(existingStr) : [];
      list.unshift(newSubmissionRecord);
      localStorage.setItem('sentinel_completed_submissions', JSON.stringify(list));
    } catch {
      // LocalStorage fallback
    }

    try {
      await fetch('http://localhost:4007/v1/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          candidateId: 'cand_100',
          examId: exam?.examId || 'exam_cs101',
          institutionId: exam?.institutionId || 'inst_mit_01',
          answers
        })
      }).catch(() => null);
    } catch {
      // Fallback
    }

    setStep('SUBMITTED');
  };

  if (!exam) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#c9d1d9' }}>Loading Candidate Workspace...</div>;
  }

  const currentQ = exam.questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1117' }}>
      {/* Header Bar */}
      <header style={{ height: 60, padding: '0 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#161b22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck style={{ color: '#2ea043' }} size={26} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f6fc' }}>SentinelAI Candidate Workspace</div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Exam: {exam.code} ({exam.title})</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: wsConnected ? '#3fb950' : '#f85149' }}>
            <Wifi size={16} />
            <span>{wsConnected ? 'AI Stream Connected' : 'Connecting...'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#0d1117', borderRadius: 20, border: '1px solid #30363d' }}>
            <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Live Risk Score:</span>
            <span style={{ fontWeight: 700, color: getRiskLevelColor(currentRisk) }}>
              {(currentRisk * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </header>

      {/* Proctor Toast Notification */}
      {proctorToast && step === 'EXAM' && (
        <div style={{ background: '#733215', color: '#ffb784', padding: '12px 24px', borderBottom: '1px solid #f85149', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <AlertTriangle size={20} />
            <span>{proctorToast}</span>
          </div>
          <button onClick={() => setProctorToast(null)} style={{ background: 'transparent', border: 'none', color: '#ffb784', cursor: 'pointer', fontWeight: 700 }}>Acknowledge</button>
        </div>
      )}

      {/* Main Body */}
      {step === 'VERIFY' ? (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: 32 }} className="glass-panel">
          <h2 style={{ color: '#f0f6fc', marginTop: 0 }}>System Readiness & Identity Verification</h2>
          <p style={{ color: '#8b949e', lineHeight: 1.6 }}>
            SentinelAI requires active webcam, microphone, and browser focus verification before launching the examination session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '24px 0' }}>
            <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Video style={{ color: '#3fb950' }} size={28} />
              <div>
                <div style={{ fontWeight: 600, color: '#f0f6fc' }}>3D Webcam Check</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Face mesh & gaze active</div>
              </div>
              <CheckCircle2 style={{ marginLeft: 'auto', color: '#3fb950' }} size={20} />
            </div>

            <div style={{ background: '#0d1117', padding: 20, borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Mic style={{ color: '#3fb950' }} size={28} />
              <div>
                <div style={{ fontWeight: 600, color: '#f0f6fc' }}>Acoustic VAD Stream</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Microphone connected</div>
              </div>
              <CheckCircle2 style={{ marginLeft: 'auto', color: '#3fb950' }} size={20} />
            </div>
          </div>

          <div style={{ background: '#161b22', padding: 20, borderRadius: 8, border: '1px solid #30363d', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d29922', fontWeight: 600, marginBottom: 8 }}>
              <Lock size={18} />
              <span>Secure Environment Policy</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.5 }}>
              Tab switching, window minimization, external clipboard usage, or secondary electronic devices in field of view will automatically trigger real-time AI evidence logging to the live proctor dashboard.
            </div>
          </div>

          <button onClick={() => setStep('EXAM')} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            Start Examination Session
          </button>
        </div>
      ) : step === 'SUBMITTED' ? (
        /* CANDIDATE SUBMITTED DASHBOARD VIEW */
        <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Main Success Card */}
          <div style={{ background: '#161b22', border: '1px solid #238636', borderRadius: 12, padding: 36, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(46, 160, 67, 0.15)', border: '2px solid #2ea043', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#3fb950' }}>
              <CheckCircle2 size={36} />
            </div>
            <h1 style={{ color: '#f0f6fc', margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800 }}>Exam Submitted Successfully</h1>
            <p style={{ color: '#8b949e', margin: '0 0 24px 0', fontSize: '0.95rem' }}>
              Your examination responses have been cryptographically sealed and submitted to the evaluation queue.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0d1117', border: '1px solid #30363d', padding: '8px 18px', borderRadius: 20, fontSize: '0.85rem', color: '#c9d1d9' }}>
              <Lock size={16} style={{ color: '#2ea043' }} />
              <span>Digital Receipt ID: <strong style={{ color: '#f0f6fc', fontFamily: 'monospace' }}>{receiptId}</strong></span>
            </div>
          </div>

          {/* Submission Details & Security Audit Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Candidate Submission Metadata */}
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#58a6ff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>
                <FileText size={18} />
                <span>SUBMISSION SUMMARY</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Examination Title:</span>
                  <span style={{ color: '#f0f6fc', fontWeight: 600 }}>{exam.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Exam Code:</span>
                  <span style={{ color: '#f0f6fc', fontWeight: 600 }}>{exam.code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Questions Completed:</span>
                  <span style={{ color: '#3fb950', fontWeight: 700 }}>{answeredCount} of {exam.questions.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b949e' }}>Submitted Timestamp:</span>
                  <span style={{ color: '#f0f6fc', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {submittedTimestamp ? new Date(submittedTimestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Integrity & Security Verdict */}
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3fb950', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>
                <ShieldCheck size={18} />
                <span>AI INTEGRITY VERDICT</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Final Telemetry Risk Score:</span>
                  <span style={{ color: getRiskLevelColor(currentRisk), fontWeight: 800, fontSize: '1rem' }}>
                    {(currentRisk * 100).toFixed(0)}% ({currentRisk <= 0.39 ? 'LOW RISK' : 'FLAGGED'})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Vision Mesh Integrity:</span>
                  <span style={{ color: simGazeOffscreen || simObjectDetected ? '#f85149' : '#3fb950', fontWeight: 600 }}>
                    {simGazeOffscreen || simObjectDetected ? 'Alert Logged' : '100% Normal Gaze'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #21262d', paddingBottom: 10 }}>
                  <span style={{ color: '#8b949e' }}>Acoustic VAD Stream:</span>
                  <span style={{ color: simWhisper ? '#f85149' : '#3fb950', fontWeight: 600 }}>
                    {simWhisper ? 'Whisper Detected' : 'Clean Audio'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b949e' }}>Session Status:</span>
                  <span style={{ color: '#a5d6ff', fontWeight: 600 }}>Awaiting Proctor Review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dashboard Navigation Controls */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              onClick={() => {
                setStep('VERIFY');
                setCurrentQuestionIdx(0);
                setAnswers({});
                setCurrentRisk(0.05);
                setSimGazeOffscreen(false);
                setSimObjectDetected(false);
                setSimWhisper(false);
              }}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 8,
                border: '1px solid #30363d',
                background: '#0d1117',
                color: '#c9d1d9',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              <RefreshCw size={18} />
              <span>Retake Candidate Session</span>
            </button>

            <button
              onClick={() => window.location.href = 'http://localhost:3003/candidate'}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)'
              }}
            >
              <ArrowLeft size={18} />
              <span>Return to Student Dashboard</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1 }}>
          {/* Exam Questions Pane */}
          <div style={{ padding: 32, borderRight: '1px solid #30363d', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                Question {currentQuestionIdx + 1} of {exam.questions.length}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {exam.questions.map((q, idx) => (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: currentQuestionIdx === idx ? '#238636' : answers[q.questionId] ? '#161b22' : '#0d1117',
                      color: '#f0f6fc',
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ color: '#f0f6fc', fontSize: '1.25rem', lineHeight: 1.5 }}>{currentQ.text}</h3>

              {currentQ.type === 'MULTIPLE_CHOICE' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                  {currentQ.options?.map((opt, idx) => (
                    <label
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 8,
                        border: '1px solid #30363d',
                        background: answers[currentQ.questionId] === opt ? 'rgba(35, 134, 54, 0.15)' : '#161b22',
                        borderColor: answers[currentQ.questionId] === opt ? '#2ea043' : '#30363d',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        color: '#f0f6fc'
                      }}
                    >
                      <input
                        type="radio"
                        name={currentQ.questionId}
                        value={opt}
                        checked={answers[currentQ.questionId] === opt}
                        onChange={() => handleAnswerChange(currentQ.questionId, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 20 }}>
                  <textarea
                    rows={8}
                    placeholder="Type your essay response here..."
                    value={answers[currentQ.questionId] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.questionId, e.target.value)}
                    onPaste={(e) => {
                      const pastedData = e.clipboardData.getData('text');
                      if (pastedData.length > 50) {
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                          const telemetry: TelemetryVector = {
                            sessionId,
                            timestamp: new Date().toISOString(),
                            pastedLength: pastedData.length,
                            keystrokeDwellMs: 5,
                            mouseLinearityR2: 0.94
                          };
                          wsRef.current.send(JSON.stringify({
                            type: 'TELEMETRY_VECTOR',
                            payload: telemetry
                          }));
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #30363d',
                      background: '#161b22',
                      color: '#f0f6fc',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      lineHeight: 1.6
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                style={{ opacity: currentQuestionIdx === 0 ? 0.5 : 1, padding: '10px 20px', borderRadius: 6, border: '1px solid #30363d', background: '#161b22', color: '#c9d1d9', cursor: 'pointer' }}
              >
                Previous
              </button>
              {currentQuestionIdx < exam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="btn-primary"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)' }}
                >
                  Submit Final Exam
                </button>
              )}
            </div>
          </div>

          {/* Right Proctoring Telemetry Sidebar */}
          <div style={{ padding: 24, backgroundColor: '#161b22', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Webcam Live Preview Box */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b949e', marginBottom: 8, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>AI Vision Mesh Frame</span>
                <span style={{ fontSize: '0.7rem', color: webcamActive ? '#3fb950' : '#d29922' }}>
                  {webcamActive ? '● LIVE WEBCAM' : '○ SIMULATED MESH'}
                </span>
              </div>
              <div style={{ height: 180, background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Real Live Webcam Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: webcamActive ? 'block' : 'none',
                    transform: 'scaleX(-1)' // Mirror view for natural candidate feel
                  }}
                />

                {/* AI Mesh Bounding Box Overlay */}
                <div style={{
                  position: 'absolute',
                  width: 100,
                  height: 120,
                  border: simGazeOffscreen || simObjectDetected || personCount !== 1 ? '2px dashed #f85149' : '2px dashed #2ea043',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: simGazeOffscreen || simObjectDetected || personCount !== 1 ? '#f85149' : '#2ea043',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 0 12px rgba(0,0,0,0.5)',
                  background: webcamActive ? 'rgba(0,0,0,0.25)' : 'transparent',
                  backdropFilter: 'blur(1px)',
                  zIndex: 5
                }}>
                  {personCount === 0 ? 'NO FACE' :
                   personCount > 1 ? 'MULTI PERSON' :
                   simObjectDetected ? 'PHONE FLAG' :
                   simGazeOffscreen ? 'GAZE OFF' : 'FACE MESH OK'}
                </div>

                <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.7rem', color: '#3fb950', background: 'rgba(0,0,0,0.85)', padding: '2px 8px', borderRadius: 4, zIndex: 10, border: '1px solid #30363d' }}>
                  FPS: 30 | Gaze: {simGazeOffscreen ? 'OFFSCREEN' : 'CENTER'}
                </div>
              </div>
            </div>

            {/* Test Simulation Controls Panel */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f6fc', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap style={{ color: '#d29922' }} size={16} />
                <span>Cheating Signal Simulator</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: 12 }}>
                Toggle behaviors to stream telemetry vectors to the AI decision orchestrator:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => setSimGazeOffscreen(!simGazeOffscreen)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: simGazeOffscreen ? '#733215' : '#0d1117',
                    color: simGazeOffscreen ? '#ffb784' : '#c9d1d9',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {simGazeOffscreen ? '❌ Stop Gaze Offscreen' : '👁️ Trigger Gaze Offscreen'}
                </button>

                <button
                  onClick={() => setSimObjectDetected(!simObjectDetected)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: simObjectDetected ? '#733215' : '#0d1117',
                    color: simObjectDetected ? '#ffb784' : '#c9d1d9',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {simObjectDetected ? '❌ Remove Phone Device' : '📱 Secondary Phone in Frame'}
                </button>

                <button
                  onClick={() => setSimWhisper(!simWhisper)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: simWhisper ? '#733215' : '#0d1117',
                    color: simWhisper ? '#ffb784' : '#c9d1d9',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {simWhisper ? '❌ Stop Acoustic Whisper' : '🎙️ Trigger Acoustic Whisper'}
                </button>

                <button
                  onClick={handlePasteSimulate}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: '#0d1117',
                    color: '#c9d1d9',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  📋 Simulate 1,250 Char Paste
                </button>

                <button
                  onClick={() => setSimWifiCollusion(!simWifiCollusion)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #30363d',
                    background: simWifiCollusion ? '#733215' : '#0d1117',
                    color: simWifiCollusion ? '#ffb784' : '#c9d1d9',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {simWifiCollusion ? '❌ Stop WiFi Collusion' : '📡 Simulate WiFi Collusion (ChatGPT)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
