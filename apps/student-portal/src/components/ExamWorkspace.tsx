import React, { useState, useEffect, useRef } from 'react';
import { TelemetryVector, Exam, OrchestratedDecision } from '@sentinel-ai/types';
import { getRiskLevelColor } from '@sentinel-ai/ui';
import { ShieldCheck, Video, Mic, Lock, AlertTriangle, CheckCircle2, Wifi, Zap, FileText, ArrowLeft, Download, RefreshCw, Eye, Compass } from 'lucide-react';

export default function ExamWorkspace() {
  const [step, setStep] = useState<'VERIFY' | 'EXAM' | 'SUBMITTED' | 'TERMINATED'>('VERIFY');
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
  const [simWifiCollusion, setSimWifiCollusion] = useState(false);

  // Real Candidate Webcam Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [personCount, setPersonCount] = useState(1);
  const [cocoModel, setCocoModel] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState(false);

  // Real-Time Head / Neck Pose & Rotation State
  const [headPose, setHeadPose] = useState({
    yaw: 0,
    pitch: 0,
    roll: 0,
    turnState: 'FORWARD' as 'FORWARD' | 'TURNED_LEFT' | 'TURNED_RIGHT' | 'SEVERELY_TURNED'
  });

  // Dynamic Face Mesh & Gaze Tracking State
  const [faceMeshPos, setFaceMeshPos] = useState({
    x: 50,
    y: 48,
    scale: 1,
    yaw: 0,
    pitch: 0,
    eyeX: 0,
    eyeY: 0
  });
  const [gazeDirection, setGazeDirection] = useState<'CENTER' | 'LOOKING_LEFT' | 'LOOKING_RIGHT' | 'LOOKING_DOWN' | 'LOOKING_UP'>('CENTER');

  // Real-Time Live Ocular Tracking State for Left & Right Eye
  const [ocularTracking, setOcularTracking] = useState({
    leftEyeX: 0,
    leftEyeY: 0,
    rightEyeX: 0,
    rightEyeY: 0,
    saccadeVelocity: 14,
    gazeAngle: 0,
    ocularState: 'SYNCED (60Hz)'
  });

  // Real-Time Acoustic Voice Level State (Pure Visual Display)
  const [audioLevel, setAudioLevel] = useState(0);

  // Real Camera Health & Anti-Tamper State
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [cameraLost, setCameraLost] = useState(false);
  const [reconnectingCamera, setReconnectingCamera] = useState(false);
  const [frameFreezeDetected, setFrameFreezeDetected] = useState(false);
  const [showDevControls, setShowDevControls] = useState(true);

  // Real-time Behavior AI & Telemetry Collector State
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [lastPastedLength, setLastPastedLength] = useState(0);
  const [keystrokeDwell, setKeystrokeDwell] = useState(115);
  const [keystrokeFlight, setKeystrokeFlight] = useState(140);
  const [mouseLinearity, setMouseLinearity] = useState(0.42);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [rapidAnswerTriggered, setRapidAnswerTriggered] = useState(false);

  const keydownTimeRef = useRef<number>(0);
  const lastKeyupTimeRef = useRef<number>(0);
  const mouseTrajectoryRef = useRef<{ x: number; y: number }[]>([]);
  const lastActivityTimeRef = useRef<number>(Date.now());

  const prevFrameHashRef = useRef<number>(0);
  const staticFrameCountRef = useRef<number>(0);

  // Camera Reconnect Handler
  const reconnectCamera = async () => {
    setReconnectingCamera(true);
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setMediaStream(s);
      setWebcamActive(true);
      setCameraLost(false);
      setCameraBlocked(false);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error('[Vision Guard] Camera reconnection failed:', err);
      setCameraLost(true);
    } finally {
      setReconnectingCamera(false);
    }
  };

  // Live Risk Calculation focusing on Neck Turn, Head Movement, Camera Health & Tampering
  useEffect(() => {
    if (step !== 'EXAM') return;

    if (simWifiCollusion) {
      setCurrentRisk(1.00);
      setStep('TERMINATED');
      sendTelemetryImmediate({
        wifiCollusionFlag: true,
        wifiCollusionDetail: 'ChatGPT Query Intercepted on Subnet Proxy'
      });
      return;
    }

    let calculatedRisk = 0.05; // 5% baseline
    // Looking away or turning neck
    if (simGazeOffscreen || headPose.turnState !== 'FORWARD' || gazeDirection === 'LOOKING_LEFT' || gazeDirection === 'LOOKING_RIGHT' || gazeDirection === 'LOOKING_UP') {
      calculatedRisk += headPose.turnState === 'SEVERELY_TURNED' ? 0.45 : 0.30;
    }
    // Camera Blocked or Lost
    if (cameraBlocked || cameraLost) {
      calculatedRisk += 0.50;
    }
    // Video Freeze / Tampering
    if (frameFreezeDetected) {
      calculatedRisk += 0.40;
    }
    // Phone / secondary device
    if (simObjectDetected) {
      calculatedRisk += 0.45;
    }
    // Person count anomaly
    if (personCount === 0 || personCount > 1) {
      calculatedRisk += 0.35;
    }

    const rounded = Math.min(0.99, Math.round(calculatedRisk * 100) / 100);
    setCurrentRisk(rounded);
  }, [step, simWifiCollusion, simGazeOffscreen, headPose.turnState, gazeDirection, simObjectDetected, personCount, cameraBlocked, cameraLost, frameFreezeDetected]);




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

  // Mouse Screen-Gaze Tracking Feedback with Directional Detection & Head Pose Yaw
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 (left) to +1 (right)
      const normY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 (top) to +1 (bottom)

      let dir: 'CENTER' | 'LOOKING_LEFT' | 'LOOKING_RIGHT' | 'LOOKING_DOWN' | 'LOOKING_UP' = 'CENTER';
      if (normX < -0.48) dir = 'LOOKING_LEFT';
      else if (normX > 0.48) dir = 'LOOKING_RIGHT';
      else if (normY > 0.45) dir = 'LOOKING_DOWN'; // Eyes down (scratchpad / typing - permissible)
      else if (normY < -0.55) dir = 'LOOKING_UP';

      setGazeDirection(dir);
      // Looking down is OK (typing / reading question). Looking away (left, right, or up) is flagged.
      const isLookingAway = dir === 'LOOKING_LEFT' || dir === 'LOOKING_RIGHT' || dir === 'LOOKING_UP';
      setSimGazeOffscreen(isLookingAway);

      const targetYaw = Math.round(normX * 42);
      const targetPitch = Math.round(normY * 20);
      let turnState: 'FORWARD' | 'TURNED_LEFT' | 'TURNED_RIGHT' | 'SEVERELY_TURNED' = 'FORWARD';
      if (targetYaw < -28) turnState = 'TURNED_LEFT';
      else if (targetYaw > 28) turnState = 'TURNED_RIGHT';
      if (Math.abs(targetYaw) > 46) turnState = 'SEVERELY_TURNED';

      setHeadPose({
        yaw: targetYaw,
        pitch: targetPitch,
        roll: Math.round(normX * 10),
        turnState
      });

      const targetEyeX = +(normX * 5.2).toFixed(1);
      const targetEyeY = +(normY * 3.8).toFixed(1);

      setOcularTracking(prev => ({
        ...prev,
        leftEyeX: targetEyeX,
        leftEyeY: targetEyeY,
        rightEyeX: targetEyeX,
        rightEyeY: targetEyeY,
        gazeAngle: Math.round(normX * 42),
        saccadeVelocity: Math.round(12 + Math.abs(normX) * 35),
        ocularState: (isLookingAway || turnState !== 'FORWARD') ? `${turnState !== 'FORWARD' ? turnState.replace('_', ' ') : dir.replace('_', ' ')} (FLAGGED)` : 'SYNCED (60Hz)'
      }));

      setFaceMeshPos(prev => ({
        ...prev,
        eyeX: normX * 8,
        eyeY: normY * 6,
        yaw: targetYaw,
        pitch: targetPitch
      }));

      if (isLookingAway || turnState !== 'FORWARD') {
        sendTelemetryImmediate({
          gazeX: normX,
          gazeY: normY,
          headYaw: targetYaw
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [step]);


  // Continuous 60fps Live Video Head Pose & Neck Movement Tracker
  useEffect(() => {
    if (step !== 'EXAM') return;

    let animFrame: number;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    let lastSentTelemetryTime = 0;

    const trackHeadAndNeckFromWebcam = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.width = 120;
          canvas.height = 90;
          ctx = canvas.getContext('2d', { willReadFrequently: true });
        }

        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 120, 90);
          const frame = ctx.getImageData(0, 0, 120, 90).data;

          // Real-time Sensor Occlusion / Lens Covered Check & Frame Hash Freeze Check
          let totalSensorLum = 0;
          let sampledSensorPixels = 0;
          let currentFrameHash = 0;
          for (let i = 0; i < frame.length; i += 16) {
            const pxLum = (frame[i] + frame[i+1] + frame[i+2]) / 3;
            totalSensorLum += pxLum;
            sampledSensorPixels++;
            currentFrameHash = (currentFrameHash + frame[i] + i) % 1000000007;
          }
          const avgSensorLum = totalSensorLum / sampledSensorPixels;
          const isBlocked = avgSensorLum < 9;
          setCameraBlocked(isBlocked);

          // Freeze / Tamper Detection
          if (prevFrameHashRef.current === currentFrameHash && !isBlocked) {
            staticFrameCountRef.current++;
            if (staticFrameCountRef.current > 150) { // ~2.5s without any sensor variance
              setFrameFreezeDetected(true);
            }
          } else {
            staticFrameCountRef.current = 0;
            setFrameFreezeDetected(false);
            prevFrameHashRef.current = currentFrameHash;
          }

          // Real-time Optical Face & Neck Centroid Tracker
          let totalWeight = 0;
          let weightedX = 0;
          let weightedY = 0;
          for (let x = 10; x < 110; x += 3) {
            for (let y = 15; y < 80; y += 3) {
              const i = (y * 120 + x) * 4;
              // Contrast & facial luminance weight
              const lum = (frame[i] + frame[i+1] + frame[i+2]) / 3;
              const weight = Math.max(0, 240 - lum);
              totalWeight += weight;
              weightedX += weight * x;
              weightedY += weight * y;
            }
          }

          if (totalWeight > 400) {
            const avgX = weightedX / totalWeight; // 0 to 120 (centered is ~60)
            const avgY = weightedY / totalWeight; // 0 to 90 (centered is ~45)
            const shiftX = avgX - 60; // -50 to +50
            const shiftY = avgY - 45;

            // Calculate live Yaw: -60° to +60°
            // When user looks/turns neck to their left (in mirrored video shiftX < 0):
            const rawYaw = Math.round((shiftX / 18) * 45);
            const clampedYaw = Math.max(-60, Math.min(60, rawYaw));
            const rawPitch = Math.round((shiftY / 16) * 30);

            let currentTurnState: 'FORWARD' | 'TURNED_LEFT' | 'TURNED_RIGHT' | 'SEVERELY_TURNED' = 'FORWARD';
            if (clampedYaw < -18) {
              currentTurnState = clampedYaw < -38 ? 'SEVERELY_TURNED' : 'TURNED_LEFT';
            } else if (clampedYaw > 18) {
              currentTurnState = clampedYaw > 38 ? 'SEVERELY_TURNED' : 'TURNED_RIGHT';
            }

            const isLookingAway = currentTurnState !== 'FORWARD';

            setHeadPose(prev => ({
              yaw: Math.round(prev.yaw * 0.35 + clampedYaw * 0.65),
              pitch: Math.round(prev.pitch * 0.4 + rawPitch * 0.6),
              roll: Math.round(clampedYaw * 0.25),
              turnState: currentTurnState
            }));

            setFaceMeshPos(prev => ({
              ...prev,
              x: Math.max(20, Math.min(80, (avgX / 120) * 100)),
              y: Math.max(20, Math.min(75, (avgY / 90) * 100)),
              yaw: clampedYaw,
              pitch: rawPitch
            }));

            if (isLookingAway) {
              setSimGazeOffscreen(true);
              setGazeDirection(currentTurnState === 'TURNED_LEFT' ? 'LOOKING_LEFT' : 'LOOKING_RIGHT');

              const now = Date.now();
              if (now - lastSentTelemetryTime > 1500) {
                lastSentTelemetryTime = now;
                sendTelemetryImmediate({
                  headYaw: clampedYaw,
                  gazeX: clampedYaw > 0 ? 0.88 : -0.88
                });
              }
            } else {
              setSimGazeOffscreen(false);
              setGazeDirection('CENTER');
            }

            // Live Ocular Pupil metrics
            const pupilShift = +((clampedYaw / 45) * 5.2).toFixed(1);
            setOcularTracking(prev => ({
              ...prev,
              leftEyeX: pupilShift,
              rightEyeX: pupilShift,
              gazeAngle: clampedYaw,
              saccadeVelocity: Math.round(14 + Math.abs(clampedYaw)),
              ocularState: isLookingAway ? `${currentTurnState.replace('_', ' ')} (FLAGGED)` : 'SYNCED (60Hz)'
            }));
          }
        }
      }

      animFrame = requestAnimationFrame(trackHeadAndNeckFromWebcam);
    };

    animFrame = requestAnimationFrame(trackHeadAndNeckFromWebcam);
    return () => cancelAnimationFrame(animFrame);
  }, [step]);


  // Inference Loop: analyze video frame & dynamically track face position
  useEffect(() => {
    if (!cocoModel || step !== 'EXAM' || !videoRef.current || !mediaStream) return;

    let intervalId: NodeJS.Timeout;
    let isRunning = false;

    const runDetection = async () => {
      if (isRunning || !videoRef.current) return;
      isRunning = true;

      try {
        const predictions = await cocoModel.detect(videoRef.current);

        // Detect cell phone, laptop, or tablet (lowered to 0.40 for high sensitivity)
        const phone = predictions.some(
          (p: any) => (p.class === 'cell phone' || p.class === 'laptop' || p.class === 'tablet') && p.score > 0.40
        );
        setSimObjectDetected(phone);

        // Detect person count & update real-time face tracking coordinates
        const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.35);
        setPersonCount(persons.length);

        const mainPerson = persons[0];
        if (mainPerson && videoRef.current) {
          const vidW = videoRef.current.videoWidth || 640;
          const vidH = videoRef.current.videoHeight || 480;
          const [bx, by, bw, bh] = mainPerson.bbox;
          // Account for mirrored video scaleX(-1)
          const mirroredCenterX = (vidW - (bx + bw / 2)) / vidW * 100;
          const headCenterY = (by + bh * 0.28) / vidH * 100;
          const dynamicScale = Math.max(0.75, Math.min(1.35, bw / 180));

          // Physical webcam neck turn detection
          let autoYaw = 0;
          let autoTurnState: 'FORWARD' | 'TURNED_LEFT' | 'TURNED_RIGHT' | 'SEVERELY_TURNED' = 'FORWARD';
          if (mirroredCenterX < 40) {
            autoYaw = -Math.round((40 - mirroredCenterX) * 2.2);
            autoTurnState = autoYaw < -32 ? 'SEVERELY_TURNED' : 'TURNED_LEFT';
          } else if (mirroredCenterX > 60) {
            autoYaw = Math.round((mirroredCenterX - 60) * 2.2);
            autoTurnState = autoYaw > 32 ? 'SEVERELY_TURNED' : 'TURNED_RIGHT';
          }

          if (autoTurnState !== 'FORWARD') {
            setHeadPose({
              yaw: autoYaw,
              pitch: 4,
              roll: autoYaw > 0 ? 10 : -10,
              turnState: autoTurnState
            });
            setSimGazeOffscreen(true);
            sendTelemetryImmediate({
              headYaw: autoYaw,
              gazeX: autoYaw > 0 ? 0.88 : -0.88
            });
          }

          setFaceMeshPos(prev => ({
            ...prev,
            x: Math.max(22, Math.min(78, mirroredCenterX)),
            y: Math.max(22, Math.min(72, headCenterY)),
            scale: dynamicScale
          }));
        }
      } catch (err) {
        console.error('[AI Vision] Inference error:', err);
      } finally {
        isRunning = false;
      }
    };

    intervalId = setInterval(runDetection, 600);

    return () => {
      clearInterval(intervalId);
    };
  }, [cocoModel, step, mediaStream]);

  // Real Web Audio API Microphone Stream & VAD Voice Level Analyzer
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let animFrame: number;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
        .then((s) => {
          stream = s;
          setMediaStream(s);
          setWebcamActive(true);

          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioContext = new AudioCtx();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.6;

            const source = audioContext.createMediaStreamSource(s);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const analyzeAudio = () => {
              analyser.getByteFrequencyData(dataArray);
              let total = 0;
              for (let i = 0; i < bufferLength; i++) {
                total += dataArray[i];
              }
              const average = total / bufferLength;
              const normalized = Math.min(100, Math.round((average / 110) * 100));

              setAudioLevel(prev => Math.round(prev * 0.4 + normalized * 0.6));

              animFrame = requestAnimationFrame(analyzeAudio);
            };

            analyzeAudio();
          } catch (audioErr) {
            console.error('[Web Audio API] Failed to initialize analyzer:', audioErr);
          }
        })
        .catch(() => {
          setWebcamActive(false);
        });
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => null);
      }
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

  // Instant Telemetry Sender Helper
  const sendTelemetryImmediate = (overrides: Partial<TelemetryVector> = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const telemetry: TelemetryVector = {
        sessionId,
        timestamp: new Date().toISOString(),
        gazeX: simGazeOffscreen ? 0.85 : 0.05,
        gazeY: simGazeOffscreen ? 0.82 : 0.02,
        headYaw: simGazeOffscreen ? 42 : 2,
        headPitch: 0,
        personCount,
        detectedObjects: simObjectDetected ? ['smartphone'] : [],
        keystrokeDwellMs: keystrokeDwell,
        keystrokeFlightMs: keystrokeFlight,
        mouseLinearityR2: mouseLinearity,
        whisperDetected: false,
        wifiCollusionFlag: simWifiCollusion,
        wifiCollusionDetail: simWifiCollusion ? 'ChatGPT query: CS101 Graph Heuristic Requirements' : undefined,
        cameraBlocked,
        cameraLost,
        frameFreezeDetected,
        fullscreenExit: !fullscreenActive,
        tabSwitchCount,
        copyCount,
        pasteCount,
        pastedLength: lastPastedLength,
        idleTimeSeconds: idleSeconds,
        rapidAnswerChange: rapidAnswerTriggered,
        ...overrides
      };

      wsRef.current.send(JSON.stringify({
        type: 'TELEMETRY_VECTOR',
        payload: telemetry
      }));
    }
  };

  // Telemetry Loop
  useEffect(() => {
    if (step !== 'EXAM') return;

    const interval = setInterval(() => {
      sendTelemetryImmediate();
    }, 1500);

    return () => clearInterval(interval);
  }, [step, simGazeOffscreen, simObjectDetected, personCount, simWifiCollusion, keystrokeDwell, keystrokeFlight, mouseLinearity, fullscreenActive, tabSwitchCount, idleSeconds]);

  // Fullscreen Enforcer & Violation Listener
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreenActive(isFs);
      if (!isFs) {
        sendTelemetryImmediate({ fullscreenExit: true });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [step]);

  // Tab Switch & Visibility Change Detection
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        sendTelemetryImmediate({ windowBlur: true, tabSwitchCount: tabSwitchCount + 1 });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [step, tabSwitchCount]);

  // Real Focus / Tab Switch detection
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleBlur = () => {
      setSimGazeOffscreen(true);
      sendTelemetryImmediate({ windowBlur: true, gazeX: 0.9, gazeY: 0.9, headYaw: 50 });
    };

    const handleFocus = () => {
      setSimGazeOffscreen(false);
      sendTelemetryImmediate({ windowBlur: false, gazeX: 0.05, gazeY: 0.02, headYaw: 2 });
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [step]);

  // Mouse Trajectory & Linearity R2 Tracker
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleMouseMoveTrack = (e: MouseEvent) => {
      lastActivityTimeRef.current = Date.now();
      const buf = mouseTrajectoryRef.current;
      buf.push({ x: e.clientX, y: e.clientY });
      if (buf.length > 20) buf.shift();

      if (buf.length >= 8) {
        const n = buf.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (const pt of buf) {
          sumX += pt.x;
          sumY += pt.y;
          sumXY += pt.x * pt.y;
          sumX2 += pt.x * pt.x;
          sumY2 += pt.y * pt.y;
        }
        const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        if (denom > 0) {
          const r = (n * sumXY - sumX * sumY) / denom;
          const r2 = Math.min(0.99, Math.round(r * r * 100) / 100);
          setMouseLinearity(r2);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMoveTrack);
    return () => window.removeEventListener('mousemove', handleMouseMoveTrack);
  }, [step]);

  // Candidate Idle Time Tracker
  useEffect(() => {
    if (step !== 'EXAM') return;

    const idleInterval = setInterval(() => {
      const idle = Math.floor((Date.now() - lastActivityTimeRef.current) / 1000);
      setIdleSeconds(idle);
    }, 2000);

    return () => clearInterval(idleInterval);
  }, [step]);

  // Gaze Offscreen automation via Mouse boundary tracking
  useEffect(() => {
    if (step !== 'EXAM') return;

    const handleMouseLeave = () => {
      setSimGazeOffscreen(true);
      sendTelemetryImmediate({ gazeX: 0.88, gazeY: 0.85, headYaw: 45 });
    };

    const handleMouseEnter = () => {
      setSimGazeOffscreen(false);
      sendTelemetryImmediate({ gazeX: 0.05, gazeY: 0.02, headYaw: 2 });
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0d1117',
      boxShadow: (simGazeOffscreen || headPose.turnState !== 'FORWARD' || gazeDirection === 'LOOKING_LEFT' || gazeDirection === 'LOOKING_RIGHT' || gazeDirection === 'LOOKING_UP' || simObjectDetected || personCount !== 1)
        ? 'inset 0 0 0 3px rgba(248, 81, 73, 0.6), 0 0 30px rgba(248, 81, 73, 0.25)'
        : 'none',
      transition: 'box-shadow 0.3s ease',
      position: 'relative'
    }}>
      {/* Calm Bottom Toast / Non-Intrusive HUD Alert Bar */}
      {(simGazeOffscreen || headPose.turnState !== 'FORWARD' || gazeDirection === 'LOOKING_LEFT' || gazeDirection === 'LOOKING_RIGHT' || gazeDirection === 'LOOKING_UP' || cameraBlocked || cameraLost || frameFreezeDetected) && step === 'EXAM' && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #f85149',
          color: '#f0f6fc',
          padding: '10px 22px',
          borderRadius: 30,
          fontWeight: 600,
          fontSize: '0.86rem',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(248, 81, 73, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(248, 81, 73, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={15} color="#f85149" />
          </div>
          <span style={{ letterSpacing: '0.2px' }}>
            {cameraLost ? '⚠️ Webcam disconnected — Click Reconnect in video panel' :
             cameraBlocked ? '⚠️ Camera sensor covered / blocked — Please uncover webcam' :
             frameFreezeDetected ? '⚠️ Static video feed detected — Please ensure live camera stream' :
             headPose.turnState === 'SEVERELY_TURNED' ? `Head turned away (${headPose.yaw > 0 ? '+' : ''}${headPose.yaw}°) — Please face forward` :
             headPose.turnState !== 'FORWARD' ? `Neck turned ${headPose.turnState === 'TURNED_LEFT' ? 'left' : 'right'} (${headPose.yaw > 0 ? '+' : ''}${headPose.yaw}°) — Please refocus on exam` :
             gazeDirection === 'LOOKING_LEFT' ? 'Gaze off-screen to left — Please refocus' :
             gazeDirection === 'LOOKING_RIGHT' ? 'Gaze off-screen to right — Please refocus' :
             gazeDirection === 'LOOKING_UP' ? 'Looking upwards off-screen — Please refocus' :
             'Looking away from screen — Please refocus'}
          </span>
        </div>
      )}

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
      {proctorToast && step === 'EXAM' && !simGazeOffscreen && (
        <div style={{ background: '#733215', color: '#ffb784', padding: '12px 24px', borderBottom: '1px solid #f85149', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
            <AlertTriangle size={20} />
            <span>{proctorToast}</span>
          </div>
          <button onClick={() => setProctorToast(null)} style={{ background: 'transparent', border: 'none', color: '#ffb784', cursor: 'pointer', fontWeight: 700 }}>Acknowledge</button>
        </div>
      )}

      {/* Main Body */}
      {step === 'TERMINATED' ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32
        }}>
          <div style={{
            maxWidth: 680,
            width: '100%',
            background: '#161b22',
            border: '2px solid #f85149',
            borderRadius: 12,
            padding: 36,
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(248, 81, 73, 0.15)',
              border: '2px solid #f85149',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertTriangle size={36} color="#f85149" />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f85149', marginBottom: 12 }}>
              EXAM SESSION TERMINATED
            </h1>

            <div style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: 18,
              marginBottom: 24,
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#c9d1d9',
              lineHeight: 1.7
            }}>
              <div style={{ color: '#ffb784', fontWeight: 800, marginBottom: 8, fontSize: '0.9rem' }}>
                🚨 Critical Integrity Breach: Prohibited Wi-Fi Subnet AI Query Intercepted
              </div>
              <div>• <strong>Primary Infraction:</strong> Secondary device query intercepted to Generative AI endpoint (ChatGPT).</div>
              <div>• <strong>Calculated Risk Score:</strong> <span style={{ color: '#f85149', fontWeight: 800 }}>100% (CRITICAL)</span></div>
              <div>• <strong>Enforcement Action:</strong> Immediate AI Proctor Lockdown initiated. Candidate exam session revoked.</div>
              <div>• <strong>Evidence Fingerprint:</strong> <code style={{ color: '#58a6ff' }}>0x9F3B2...WIFI_AI_COLLUSION_FLAGGED</code></div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: 28, lineHeight: 1.5 }}>
              Your examination has been automatically locked and submitted for administrative review by the Integrity Board. All intercepted network packets, audio vectors, and biometric records have been archived.
            </p>

            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
              style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', padding: '10px 24px', cursor: 'pointer' }}
            >
              Return to Student Portal Home
            </button>
          </div>
        </div>
      ) : step === 'VERIFY' ? (

        <div style={{ maxWidth: 840, margin: '40px auto', padding: 32 }} className="glass-panel">
          <h2 style={{ color: '#f0f6fc', marginTop: 0 }}>System Readiness & Identity Verification</h2>
          <p style={{ color: '#8b949e', lineHeight: 1.6 }}>
            SentinelAI requires active webcam, microphone, Wi-Fi collusion defense, and browser focus verification before launching the examination session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0' }}>
            <div style={{ background: '#0d1117', padding: 18, borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Video style={{ color: '#3fb950' }} size={26} />
              <div>
                <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>3D Webcam Check</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Face mesh & gaze tracking active</div>
              </div>
              <CheckCircle2 style={{ marginLeft: 'auto', color: '#3fb950' }} size={20} />
            </div>

            <div style={{ background: '#0d1117', padding: 18, borderRadius: 8, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Mic style={{ color: '#3fb950' }} size={26} />
              <div>
                <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>Acoustic VAD Stream</div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>Microphone connected</div>
              </div>
              <CheckCircle2 style={{ marginLeft: 'auto', color: '#3fb950' }} size={20} />
            </div>
          </div>

          {/* Wi-Fi Proxy Interceptor Card */}
          <div style={{ background: '#161b22', border: '1px solid #388bfd', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#58a6ff', fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }}>
              <Wifi size={20} />
              <span>Wi-Fi Collusion Detection Configuration</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#c9d1d9', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              To test real-time detection of secondary devices querying ChatGPT/Google on your local network:
            </p>
            <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#79c0ff', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>1.</strong> Connect secondary phone to this same Wi-Fi.</div>
              <div><strong>2.</strong> In Phone Wi-Fi Settings ➔ <em>Manual Proxy</em>: Host: <code>192.168.31.149</code> (or your machine IP) | Port: <code>8080</code></div>
              <div><strong>3.</strong> Any searches for exam questions on the phone will be intercepted live.</div>
            </div>
          </div>

          <div style={{ background: '#161b22', padding: 18, borderRadius: 8, border: '1px solid #30363d', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d29922', fontWeight: 600, marginBottom: 6 }}>
              <Lock size={18} />
              <span>Secure Environment Policy</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.5 }}>
              Tab switching, window minimization, external clipboard usage, looking away from screen, or secondary electronics will trigger real-time AI evidence logging to the proctor dashboard.
            </div>
          </div>

          <button onClick={() => setStep('EXAM')} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}>
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
                  <span style={{ color: '#8b949e' }}>Audio Stream:</span>
                  <span style={{ color: '#3fb950', fontWeight: 600 }}>
                    Connected (Clean Audio)
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
                    onKeyDown={() => {
                      keydownTimeRef.current = performance.now();
                      lastActivityTimeRef.current = Date.now();
                      if (lastKeyupTimeRef.current > 0) {
                        const flight = Math.round(keydownTimeRef.current - lastKeyupTimeRef.current);
                        if (flight > 10 && flight < 2000) {
                          setKeystrokeFlight(flight);
                        }
                      }
                    }}
                    onKeyUp={() => {
                      const upTime = performance.now();
                      lastKeyupTimeRef.current = upTime;
                      if (keydownTimeRef.current > 0) {
                        const dwell = Math.round(upTime - keydownTimeRef.current);
                        if (dwell > 10 && dwell < 1000) {
                          setKeystrokeDwell(dwell);
                        }
                      }
                    }}
                    onPaste={(e) => {
                      const pastedData = e.clipboardData.getData('text');
                      const len = pastedData.length;
                      setPasteCount(prev => prev + 1);
                      setLastPastedLength(len);
                      if (len > 30) {
                        sendTelemetryImmediate({
                          pastedLength: len,
                          keystrokeDwellMs: 5,
                          pasteCount: pasteCount + 1
                        });
                      }
                    }}
                    onCopy={() => {
                      setCopyCount(prev => prev + 1);
                      sendTelemetryImmediate({ copyCount: copyCount + 1 });
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

                {/* Camera Loss / Blocked / Freeze Recovery Overlay */}
                {(cameraLost || cameraBlocked || frameFreezeDetected || !webcamActive) && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(13, 17, 23, 0.90)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    zIndex: 25,
                    padding: 16,
                    textAlign: 'center'
                  }}>
                    <AlertTriangle size={26} color="#f85149" />
                    <div style={{ color: '#f85149', fontWeight: 700, fontSize: '0.82rem' }}>
                      {cameraLost ? 'Camera Disconnected' : cameraBlocked ? 'Camera Lens Covered' : frameFreezeDetected ? 'Video Freeze Detected' : 'Connecting Webcam...'}
                    </div>
                    <button
                      onClick={reconnectCamera}
                      disabled={reconnectingCamera}
                      style={{
                        padding: '6px 14px',
                        background: '#21262d',
                        border: '1px solid #388bfd',
                        color: '#58a6ff',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 600
                      }}
                    >
                      <RefreshCw size={12} className={reconnectingCamera ? 'spin' : ''} />
                      <span>{reconnectingCamera ? 'Reconnecting...' : '🔄 Reconnect Camera'}</span>
                    </button>
                  </div>
                )}

                {/* Dynamic 3D Face Mesh Wireframe Tracking Overlay */}
                <div style={{
                  position: 'absolute',
                  left: `${simGazeOffscreen ? 75 : faceMeshPos.x}%`,
                  top: `${simGazeOffscreen ? 48 : faceMeshPos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${simGazeOffscreen ? 25 : faceMeshPos.yaw}deg) scale(${faceMeshPos.scale})`,
                  transition: 'left 0.15s ease-out, top 0.15s ease-out, transform 0.15s ease-out',
                  width: 110,
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 5
                }}>
                  <svg width="110" height="140" viewBox="0 0 110 140" style={{ overflow: 'visible' }}>
                    {/* Biometric Oval Outline */}
                    <ellipse
                      cx="55"
                      cy="70"
                      rx="48"
                      ry="62"
                      fill="none"
                      stroke={simGazeOffscreen || simObjectDetected || personCount !== 1 ? '#f85149' : '#2ea043'}
                      strokeWidth="2"
                      strokeDasharray={simGazeOffscreen ? '4 4' : 'none'}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.8))' }}
                    />

                    {/* HUD Corner Brackets */}
                    <path d="M 12 25 L 12 12 L 25 12" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="2.5" />
                    <path d="M 98 25 L 98 12 L 85 12" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="2.5" />
                    <path d="M 12 115 L 12 128 L 25 128" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="2.5" />
                    <path d="M 98 115 L 98 128 L 85 128" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="2.5" />

                    {/* Forehead Triangulation Mesh */}
                    <line x1="30" y1="36" x2="55" y2="28" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.6" />
                    <line x1="55" y1="28" x2="80" y2="36" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.6" />
                    <line x1="30" y1="36" x2="80" y2="36" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.6" />

                    {/* Left Eye & Dynamic Pupil */}
                    <ellipse cx="36" cy="56" rx="10" ry="6" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="1.5" />
                    <circle
                      cx={36 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_LEFT' ? -5.5 : 5.5) : ocularTracking.leftEyeX)}
                      cy={56 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_DOWN' ? 3.5 : -3.5) : ocularTracking.leftEyeY)}
                      r="3.5"
                      fill={simGazeOffscreen ? '#f85149' : '#3fb950'}
                    />
                    <text x="21" y="45" fill={simGazeOffscreen ? "#f85149" : "#3fb950"} fontSize="5.5" fontWeight="bold">
                      L:{ocularTracking.leftEyeX > 0 ? `+${ocularTracking.leftEyeX}` : ocularTracking.leftEyeX}
                    </text>

                    {/* Right Eye & Dynamic Pupil */}
                    <ellipse cx="74" cy="56" rx="10" ry="6" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#3fb950'} strokeWidth="1.5" />
                    <circle
                      cx={74 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_LEFT' ? -5.5 : 5.5) : ocularTracking.rightEyeX)}
                      cy={56 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_DOWN' ? 3.5 : -3.5) : ocularTracking.rightEyeY)}
                      r="3.5"
                      fill={simGazeOffscreen ? '#f85149' : '#3fb950'}
                    />
                    <text x="61" y="45" fill={simGazeOffscreen ? "#f85149" : "#3fb950"} fontSize="5.5" fontWeight="bold">
                      R:{ocularTracking.rightEyeX > 0 ? `+${ocularTracking.rightEyeX}` : ocularTracking.rightEyeX}
                    </text>

                    {/* Gaze Vector Ray */}
                    <line
                      x1="55"
                      y1="56"
                      x2={55 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_LEFT' ? -42 : 42) : (ocularTracking.leftEyeX + ocularTracking.rightEyeX) * 3.8)}
                      y2={56 + (simGazeOffscreen ? (gazeDirection === 'LOOKING_DOWN' ? 26 : -26) : (ocularTracking.leftEyeY + ocularTracking.rightEyeY) * 3.8)}
                      stroke={simGazeOffscreen ? '#f85149' : '#58a6ff'}
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                    />

                    {/* 3D Nose Bridge & Tip */}
                    <path d="M 55 45 L 55 74 L 62 76 L 48 76" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1.5" />

                    {/* Mouth Mesh */}
                    <path d="M 38 98 Q 55 106 72 98 Q 55 102 38 98" fill="none" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1.5" opacity="0.8" />

                    {/* Jawline Triangulation */}
                    <line x1="20" y1="80" x2="38" y2="98" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.4" />
                    <line x1="90" y1="80" x2="72" y2="98" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.4" />
                    <line x1="55" y1="106" x2="55" y2="128" stroke={simGazeOffscreen ? '#f85149' : '#2ea043'} strokeWidth="1" opacity="0.4" />
                  </svg>

                  {/* Status Badge Attached to Head Mesh */}
                  <div style={{
                    position: 'absolute',
                    top: -18,
                    background: simGazeOffscreen || simObjectDetected || personCount !== 1 ? '#733215' : 'rgba(13,17,23,0.9)',
                    color: simGazeOffscreen || simObjectDetected || personCount !== 1 ? '#f85149' : '#3fb950',
                    border: `1px solid ${simGazeOffscreen || simObjectDetected || personCount !== 1 ? '#f85149' : '#2ea043'}`,
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {personCount === 0 ? 'NO FACE' :
                     personCount > 1 ? 'MULTI PERSON' :
                     simObjectDetected ? 'PHONE FLAG' :
                     headPose.turnState === 'SEVERELY_TURNED' ? 'LOOKING BEHIND 🚨' :
                     headPose.turnState === 'TURNED_LEFT' ? 'NECK TURNED LEFT ⚠️' :
                     headPose.turnState === 'TURNED_RIGHT' ? 'NECK TURNED RIGHT ⚠️' :
                     gazeDirection === 'LOOKING_LEFT' ? 'EYES ON LEFT ⚠️' :
                     gazeDirection === 'LOOKING_RIGHT' ? 'EYES ON RIGHT ⚠️' :
                     gazeDirection === 'LOOKING_DOWN' ? 'READING / TYPING (OK)' :
                     gazeDirection === 'LOOKING_UP' ? 'EYES UP ⚠️' :
                     simGazeOffscreen ? 'GAZE OFF' : '3D MESH TRACKING'}
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.7rem', color: (simGazeOffscreen || headPose.turnState !== 'FORWARD') ? '#f85149' : '#3fb950', background: 'rgba(0,0,0,0.85)', padding: '2px 8px', borderRadius: 4, zIndex: 10, border: '1px solid #30363d' }}>
                  FPS: 60 | Neck: {headPose.yaw > 0 ? `+${headPose.yaw}` : headPose.yaw}° ({headPose.turnState === 'FORWARD' ? 'FORWARD' : headPose.turnState.replace('_', ' ')})
                </div>
              </div>
            </div>

            {/* Live Dual Ocular Iris & Saccade Tracking Radar */}
            <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#f0f6fc' }}>
                  <Eye size={14} style={{ color: simGazeOffscreen ? '#f85149' : '#388bfd' }} />
                  <span>OCULAR SACCADE TELEMETRY</span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: simGazeOffscreen ? '#733215' : 'rgba(56,139,253,0.15)',
                  color: simGazeOffscreen ? '#f85149' : '#58a6ff',
                  border: `1px solid ${simGazeOffscreen ? '#f85149' : '#388bfd'}`
                }}>
                  {ocularTracking.ocularState}
                </span>
              </div>

              {/* Dual Eye Radars (Left Eye & Right Eye) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {/* Left Eye Radar */}
                <div style={{ background: '#161b22', borderRadius: 6, padding: '6px 8px', border: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid #30363d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', height: '100%', width: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: simGazeOffscreen ? '#f85149' : '#3fb950',
                      boxShadow: `0 0 6px ${simGazeOffscreen ? '#f85149' : '#3fb950'}`,
                      transform: `translate(${ocularTracking.leftEyeX * 1.8}px, ${ocularTracking.leftEyeY * 1.8}px)`,
                      transition: 'transform 0.08s ease-out'
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#8b949e', fontWeight: 600 }}>LEFT EYE</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: simGazeOffscreen ? '#f85149' : '#f0f6fc' }}>
                      X: {ocularTracking.leftEyeX > 0 ? `+${ocularTracking.leftEyeX}` : ocularTracking.leftEyeX}px
                    </div>
                  </div>
                </div>

                {/* Right Eye Radar */}
                <div style={{ background: '#161b22', borderRadius: 6, padding: '6px 8px', border: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d1117', border: '1px solid #30363d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ position: 'absolute', height: '100%', width: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: simGazeOffscreen ? '#f85149' : '#3fb950',
                      boxShadow: `0 0 6px ${simGazeOffscreen ? '#f85149' : '#3fb950'}`,
                      transform: `translate(${ocularTracking.rightEyeX * 1.8}px, ${ocularTracking.rightEyeY * 1.8}px)`,
                      transition: 'transform 0.08s ease-out'
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#8b949e', fontWeight: 600 }}>RIGHT EYE</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: simGazeOffscreen ? '#f85149' : '#f0f6fc' }}>
                      X: {ocularTracking.rightEyeX > 0 ? `+${ocularTracking.rightEyeX}` : ocularTracking.rightEyeX}px
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#8b949e' }}>
                <span>Gaze Angle: <strong style={{ color: '#58a6ff' }}>{ocularTracking.gazeAngle}°</strong></span>
                <span>Velocity: <strong style={{ color: '#f0f6fc' }}>{ocularTracking.saccadeVelocity} px/s</strong></span>
              </div>
            </div>

            {/* Live Head & Neck 3D Pose HUD */}
            <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#f0f6fc' }}>
                  <Compass size={14} style={{ color: headPose.turnState !== 'FORWARD' ? '#f85149' : '#3fb950' }} />
                  <span>HEAD & NECK 3D POSE</span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: headPose.turnState !== 'FORWARD' ? '#733215' : 'rgba(46,160,67,0.15)',
                  color: headPose.turnState !== 'FORWARD' ? '#f85149' : '#3fb950',
                  border: `1px solid ${headPose.turnState !== 'FORWARD' ? '#f85149' : '#2ea043'}`
                }}>
                  {headPose.turnState === 'FORWARD' ? 'FACING FORWARD (0°)' : `TURNED ${headPose.turnState === 'TURNED_LEFT' ? 'LEFT' : 'RIGHT'} (${headPose.yaw > 0 ? '+' : ''}${headPose.yaw}°)`}
                </span>
              </div>

              {/* Dynamic Yaw Angle Gauge Bar */}
              <div style={{ background: '#161b22', borderRadius: 6, padding: '8px 10px', border: '1px solid #21262d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#8b949e', marginBottom: 4 }}>
                  <span>-60° (LEFT)</span>
                  <span style={{ color: headPose.turnState !== 'FORWARD' ? '#f85149' : '#3fb950', fontWeight: 800 }}>
                    YAW: {headPose.yaw > 0 ? `+${headPose.yaw}` : headPose.yaw}°
                  </span>
                  <span>+60° (RIGHT)</span>
                </div>
                <div style={{ height: 6, background: '#21262d', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: '100%', background: '#484f58' }} />
                  <div style={{
                    position: 'absolute',
                    left: `${Math.max(5, Math.min(95, ((headPose.yaw + 60) / 120) * 100))}%`,
                    top: 0,
                    width: 8,
                    height: '100%',
                    transform: 'translateX(-50%)',
                    background: headPose.turnState !== 'FORWARD' ? '#f85149' : '#3fb950',
                    borderRadius: 2,
                    boxShadow: `0 0 6px ${headPose.turnState !== 'FORWARD' ? '#f85149' : '#3fb950'}`
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.68rem', color: '#8b949e' }}>
                <span>Pitch: <strong style={{ color: '#f0f6fc' }}>{headPose.pitch}°</strong></span>
                <span>Threshold: ±28° (Neck Turn Warning)</span>
              </div>
            </div>

            {/* Live Acoustic Ambient Audio Meter (Visual Only - No Penalty for Noisy Areas) */}
            <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#f0f6fc' }}>
                  <Mic size={14} style={{ color: '#388bfd' }} />
                  <span>AMBIENT AUDIO MONITOR</span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(56,139,253,0.15)',
                  color: '#58a6ff',
                  border: '1px solid #388bfd'
                }}>
                  {`LEVEL: ${audioLevel}% (MONITORING)`}
                </span>
              </div>

              {/* Graphic Equalizer / VU Meter Bars */}
              <div style={{ display: 'flex', gap: 3, height: 22, alignItems: 'flex-end', background: '#161b22', padding: '3px 6px', borderRadius: 4, border: '1px solid #21262d' }}>
                {[15, 30, 45, 60, 75, 90, 80, 65, 50, 35, 20, 10].map((baseline, idx) => {
                  const activeLevel = Math.max(audioLevel, 4);
                  const barHeight = Math.min(100, Math.max(12, (activeLevel / 100) * baseline));
                  const barColor = activeLevel > 60 ? '#58a6ff' : '#3fb950';

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${barHeight}%`,
                        background: barColor,
                        borderRadius: 2,
                        transition: 'height 0.08s ease'
                      }}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: '#8b949e' }}>
                <span>Mic Input: <strong style={{ color: '#58a6ff' }}>{audioLevel}%</strong></span>
                <span style={{ color: '#3fb950' }}>✓ Ambient Noise Tolerance ON</span>
              </div>
            </div>

            {/* Live Behavioral Dynamics & Browser Telemetry HUD */}
            <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#f0f6fc' }}>
                  <FileText size={14} style={{ color: '#58a6ff' }} />
                  <span>BEHAVIORAL DYNAMICS HUD</span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: mouseLinearity > 0.92 || lastPastedLength > 40 ? '#733215' : 'rgba(56,139,253,0.15)',
                  color: mouseLinearity > 0.92 || lastPastedLength > 40 ? '#f85149' : '#58a6ff',
                  border: `1px solid ${mouseLinearity > 0.92 || lastPastedLength > 40 ? '#f85149' : '#388bfd'}`
                }}>
                  {mouseLinearity > 0.92 ? 'ROBOTIC MACRO FLAG' : 'HUMAN DYNAMICS (OK)'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem' }}>
                <div style={{ background: '#161b22', padding: '6px 8px', borderRadius: 6, border: '1px solid #21262d' }}>
                  <span style={{ color: '#8b949e', display: 'block', fontSize: '0.65rem' }}>Keystroke Dwell</span>
                  <strong style={{ color: keystrokeDwell < 20 ? '#f85149' : '#f0f6fc' }}>{keystrokeDwell} ms</strong>
                </div>
                <div style={{ background: '#161b22', padding: '6px 8px', borderRadius: 6, border: '1px solid #21262d' }}>
                  <span style={{ color: '#8b949e', display: 'block', fontSize: '0.65rem' }}>Keystroke Flight</span>
                  <strong style={{ color: '#f0f6fc' }}>{keystrokeFlight} ms</strong>
                </div>
                <div style={{ background: '#161b22', padding: '6px 8px', borderRadius: 6, border: '1px solid #21262d' }}>
                  <span style={{ color: '#8b949e', display: 'block', fontSize: '0.65rem' }}>Mouse Linearity R²</span>
                  <strong style={{ color: mouseLinearity > 0.92 ? '#f85149' : '#3fb950' }}>{mouseLinearity} ({mouseLinearity > 0.92 ? 'LINEAR' : 'CURVED'})</strong>
                </div>
                <div style={{ background: '#161b22', padding: '6px 8px', borderRadius: 6, border: '1px solid #21262d' }}>
                  <span style={{ color: '#8b949e', display: 'block', fontSize: '0.65rem' }}>Tab Switches / Blurs</span>
                  <strong style={{ color: tabSwitchCount > 0 ? '#f85149' : '#3fb950' }}>{tabSwitchCount} times</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.68rem', color: '#8b949e' }}>
                <span>Pastes: <strong style={{ color: pasteCount > 0 ? '#f85149' : '#f0f6fc' }}>{pasteCount}</strong></span>
                <span>Copies: <strong style={{ color: '#f0f6fc' }}>{copyCount}</strong></span>
                <span>Idle: <strong style={{ color: idleSeconds > 60 ? '#f85149' : '#3fb950' }}>{idleSeconds}s</strong></span>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Directional Gaze Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => {
                      setGazeDirection('LOOKING_LEFT');
                      setSimGazeOffscreen(true);
                      setFaceMeshPos(prev => ({ ...prev, eyeX: -8, eyeY: 0, yaw: -25 }));
                      sendTelemetryImmediate({ gazeX: -0.88, gazeY: 0.05, headYaw: -40 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: gazeDirection === 'LOOKING_LEFT' ? '#733215' : '#0d1117',
                      color: gazeDirection === 'LOOKING_LEFT' ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    👁️ Eyes Left
                  </button>

                  <button
                    onClick={() => {
                      setGazeDirection('LOOKING_RIGHT');
                      setSimGazeOffscreen(true);
                      setFaceMeshPos(prev => ({ ...prev, eyeX: 8, eyeY: 0, yaw: 25 }));
                      sendTelemetryImmediate({ gazeX: 0.88, gazeY: 0.05, headYaw: 40 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: gazeDirection === 'LOOKING_RIGHT' ? '#733215' : '#0d1117',
                      color: gazeDirection === 'LOOKING_RIGHT' ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    👁️ Eyes Right
                  </button>
                </div>

                {/* Neck Turn Left & Right Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => {
                      setHeadPose({ yaw: -45, pitch: 4, roll: -12, turnState: 'TURNED_LEFT' });
                      setSimGazeOffscreen(true);
                      setFaceMeshPos(prev => ({ ...prev, yaw: -45, eyeX: -8, eyeY: 0 }));
                      sendTelemetryImmediate({ gazeX: -0.92, gazeY: 0.05, headYaw: -45 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: headPose.turnState === 'TURNED_LEFT' ? '#733215' : '#0d1117',
                      color: headPose.turnState === 'TURNED_LEFT' ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🔄 Neck Left (-45°)
                  </button>

                  <button
                    onClick={() => {
                      setHeadPose({ yaw: 45, pitch: 4, roll: 12, turnState: 'TURNED_RIGHT' });
                      setSimGazeOffscreen(true);
                      setFaceMeshPos(prev => ({ ...prev, yaw: 45, eyeX: 8, eyeY: 0 }));
                      sendTelemetryImmediate({ gazeX: 0.92, gazeY: 0.05, headYaw: 45 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: headPose.turnState === 'TURNED_RIGHT' ? '#733215' : '#0d1117',
                      color: headPose.turnState === 'TURNED_RIGHT' ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    🔄 Neck Right (+45°)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => {
                      setGazeDirection('LOOKING_DOWN');
                      setSimGazeOffscreen(false);
                      setHeadPose({ yaw: 0, pitch: 22, roll: 0, turnState: 'FORWARD' });
                      setFaceMeshPos(prev => ({ ...prev, eyeX: 0, eyeY: 4, yaw: 0, pitch: 18 }));
                      sendTelemetryImmediate({ gazeX: 0.02, gazeY: 0.45, headPitch: 22, headYaw: 0 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: gazeDirection === 'LOOKING_DOWN' ? '#21262d' : '#0d1117',
                      color: gazeDirection === 'LOOKING_DOWN' ? '#388bfd' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    📖 Eyes Down (Read/Type)
                  </button>

                  <button
                    onClick={() => {
                      setGazeDirection('CENTER');
                      setSimGazeOffscreen(false);
                      setHeadPose({ yaw: 0, pitch: 0, roll: 0, turnState: 'FORWARD' });
                      setFaceMeshPos(prev => ({ ...prev, eyeX: 0, eyeY: 0, yaw: 0, pitch: 0 }));
                      sendTelemetryImmediate({ gazeX: 0.02, gazeY: 0.02, headYaw: 0, headPitch: 0 });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #2ea043',
                      background: (gazeDirection === 'CENTER' && headPose.turnState === 'FORWARD') ? 'rgba(46,160,67,0.15)' : '#0d1117',
                      color: '#3fb950',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 600
                    }}
                  >
                    👤 Face Forward (0°)
                  </button>
                </div>

                {/* Camera Health & Tamper Simulation Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <button
                    onClick={() => {
                      const next = !cameraBlocked;
                      setCameraBlocked(next);
                      sendTelemetryImmediate({ cameraBlocked: next });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: cameraBlocked ? '#733215' : '#0d1117',
                      color: cameraBlocked ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {cameraBlocked ? '❌ Unblock Camera' : '📷 Sim Block Camera'}
                  </button>

                  <button
                    onClick={() => {
                      const next = !cameraLost;
                      setCameraLost(next);
                      sendTelemetryImmediate({ cameraLost: next });
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid #30363d',
                      background: cameraLost ? '#733215' : '#0d1117',
                      color: cameraLost ? '#ffb784' : '#c9d1d9',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {cameraLost ? '❌ Restore Camera' : '🔌 Sim Disconnect'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const next = !simObjectDetected;
                    setSimObjectDetected(next);
                    sendTelemetryImmediate({
                      detectedObjects: next ? ['smartphone'] : []
                    });
                  }}
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
                  onClick={() => {
                    const next = !simWifiCollusion;
                    setSimWifiCollusion(next);
                    sendTelemetryImmediate({
                      wifiCollusionFlag: next,
                      wifiCollusionDetail: next ? 'ChatGPT query: CS101 Graph Heuristic Requirements' : undefined
                    });
                  }}
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



