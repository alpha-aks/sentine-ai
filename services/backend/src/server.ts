import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { TelemetryVector, Alert } from '@sentinel-ai/types';
import { ExamService } from './services/exam-service';
import { AuditService } from './services/audit-service';
import { DecisionOrchestratorAgent } from './agents/decision-orchestrator';
import net from 'net';
import url from 'url';
import os from 'os';
import {
  initDb,
  dbGetAllSessions,
  dbGetSession,
  dbUpdateSessionRisk,
  dbSaveAlert,
  dbGetAllAlerts,
  dbUpdateAlertStatus,
  pool
} from './services/db.service';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const examService = new ExamService();
const auditService = new AuditService();
const decisionOrchestrator = new DecisionOrchestratorAgent();

// REST API Endpoints

const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'SentinelAI Orchestrator',
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/api/exams', (req: Request, res: Response) => {
  res.json(examService.getAllExams());
});

app.get('/api/exams/:examId', (req: Request, res: Response) => {
  const exam = examService.getExam(req.params.examId);
  if (!exam) {
    return res.status(404).json({ error: 'EXAM_NOT_FOUND' });
  }
  res.json(exam);
});

app.get('/api/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await dbGetAllSessions();
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

app.put('/api/exams/:examId/policy', (req: Request, res: Response) => {
  const { sensitivityProfile, customWeights, customThresholds } = req.body;
  const updatedPolicy = examService.updatePolicy(
    req.params.examId,
    sensitivityProfile,
    customWeights,
    customThresholds
  );

  if (!updatedPolicy) {
    return res.status(404).json({ error: 'EXAM_NOT_FOUND' });
  }

  decisionOrchestrator.setPolicy(updatedPolicy.agentWeights, updatedPolicy.riskThresholds);
  
  auditService.recordAction('POLICY_UPDATED', 'ADMIN_USER', 'inst_mit_01', {
    examId: req.params.examId,
    policy: updatedPolicy
  });

  res.json(updatedPolicy);
});

app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await dbGetAllAlerts();
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

app.post('/api/alerts/:alertId/action', async (req: Request, res: Response) => {
  const { alertId } = req.params;
  const { action, proctorId, notes } = req.body; // 'DISMISS' | 'WARN' | 'PAUSE' | 'TERMINATE'

  try {
    const status = action === 'DISMISS' ? 'DISMISSED' : action === 'WARN' ? 'WARNED' : 'ESCALATED';
    await dbUpdateAlertStatus(alertId, status);

    const alerts = await dbGetAllAlerts();
    const alert = alerts.find(a => a.alertId === alertId);

    const logEntry = auditService.recordAction('PROCTOR_ACTION_EXECUTED', proctorId || 'proctor_01', 'inst_mit_01', {
      alertId,
      action,
      notes
    });

    // Broadcast proctor action to WebSocket clients
    broadcast({
      type: 'PROCTOR_ACTION_EXECUTED',
      payload: {
        alertId,
        action,
        sessionId: alert?.sessionId,
        notes,
        logHash: logEntry.entryHash
      }
    });

    res.json({ success: true, alert, logEntry });
  } catch (err) {
    console.error('Error actioning alert:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

app.post('/api/submissions', async (req: Request, res: Response) => {
  const { sessionId, candidateId, examId, answers } = req.body;
  const targetSessionId = sessionId || 'sess_100';
  console.log(`[Postgres DB] Received Exam Submission for session: ${targetSessionId}`);
  try {
    const session = await dbGetSession(targetSessionId);
    if (session) {
      session.status = 'COMPLETED';
      session.endedAt = new Date().toISOString();
      if (answers) {
        session.submissions = answers;
      }
      await pool.query(
        'UPDATE exam_sessions SET status = $1, submitted_at = $2, submissions = $3 WHERE session_id = $4',
        [session.status, new Date(session.endedAt), JSON.stringify(session.submissions), session.sessionId]
      );
      res.json({ success: true, session });
    } else {
      res.status(404).json({ error: 'SESSION_NOT_FOUND' });
    }
  } catch (err) {
    console.error('Error submitting exam answers to DB:', err);
    res.status(500).json({ error: 'DB_ERROR' });
  }
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const ledger = auditService.getLedger();
  const integrity = auditService.verifyIntegrity();
  res.json({
    ledger,
    integrity
  });
});

// WebSocket Server for Real-Time Multi-Agent Streaming
const connectedClients: Set<WebSocket> = new Set();

function broadcast(message: any) {
  const jsonStr = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  connectedClients.add(ws);

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'SentinelAI Multi-Agent Engine WebSocket Ready'
  }));

  ws.on('message', async (data: string) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === 'TELEMETRY_VECTOR') {
        const telemetry: TelemetryVector = parsed.payload;
        
        // Inject real WiFi collusion event if it happened recently (within 8 seconds)
        if (latestWifiCollusion && (Date.now() - latestWifiCollusion.timestamp) < 8000) {
          telemetry.wifiCollusionFlag = true;
          telemetry.wifiCollusionDetail = `Subnet device (${latestWifiCollusion.ip}) queried: ${latestWifiCollusion.domain}`;
        }

        console.log('[Backend WS] Received Telemetry:', JSON.stringify(telemetry));
        
        // Evaluate through multi-agent orchestrator
        const decision = decisionOrchestrator.evaluateTelemetry(telemetry);
        console.log('[Backend WS] Evaluated Decision:', {
          sessionId: decision.sessionId,
          finalRiskScore: decision.finalRiskScore,
          alertLevel: decision.alertLevel,
          personCount: decision.visionSignal?.personCount,
          cameraTamper: decision.visionSignal?.cameraTamperFlag,
          detectedDevices: decision.visionSignal?.detectedDevices
        });

        // Update exam session risk score in PostgreSQL
        await dbUpdateSessionRisk(decision.sessionId, decision.finalRiskScore);

        // If alert level is HIGH or CRITICAL, register alert
        if (decision.alertLevel === 'HIGH' || decision.alertLevel === 'CRITICAL') {
          const session = await dbGetSession(decision.sessionId);
          const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          
          const alert: Alert = {
            alertId,
            sessionId: decision.sessionId,
            candidateName: session?.candidateName || 'Candidate',
            alertLevel: decision.alertLevel,
            riskScore: decision.finalRiskScore,
            explainabilityText: decision.naturalLanguageExplanation,
            status: 'PENDING',
            createdAt: decision.timestamp
          };

          await dbSaveAlert(alert);

          broadcast({
            type: 'ALERT_TRIGGERED',
            payload: alert
          });
        }

        // Broadcast decision update to all listening clients (dashboard & student)
        broadcast({
          type: 'DECISION_UPDATE',
          payload: decision
        });
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  await initDb();
  console.log(`🛡️ SentinelAI Multi-Agent Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server endpoint: ws://localhost:${PORT}`);
});

// Real WiFi Collusion Interceptor Proxy Setup
let latestWifiCollusion: { domain: string; ip: string; timestamp: number } | null = null;

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const netInterface of interfaces[name] || []) {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        return netInterface.address;
      }
    }
  }
  return 'localhost';
}

function startWifiCollusionProxy() {
  const proxy = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url || '');
    const clientIp = req.socket.remoteAddress || '';
    if (reqUrl.hostname) {
      console.log(`[Wi-Fi Interceptor] HTTP Request: ${reqUrl.hostname} from IP: ${clientIp}`);
      checkDomain(reqUrl.hostname, clientIp);
    }

    const options = {
      hostname: reqUrl.hostname,
      port: reqUrl.port || 80,
      path: reqUrl.path,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);
    proxyReq.on('error', () => {
      try { res.end(); } catch {}
    });
  });

  proxy.on('connect', (req, clientSocket, head) => {
    const parts = (req.url || '').split(':');
    const hostname = parts[0];
    const port = parseInt(parts[1] || '443', 10);
    const clientIp = req.socket.remoteAddress || '';

    console.log(`[Wi-Fi Interceptor] HTTPS Tunnel Connect: ${hostname} from IP: ${clientIp}`);
    checkDomain(hostname, clientIp);

    const serverSocket = net.connect(port, hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', () => {
      try { clientSocket.end(); } catch {}
    });
    clientSocket.on('error', () => {
      try { serverSocket.end(); } catch {}
    });
  });

  const checkDomain = (domain: string, ip: string) => {
    const lowerDomain = domain.toLowerCase();
    const suspiciousDomains = [
      'chatgpt.com', 'openai.com', 'claude.ai', 'gemini.google.com',
      'google.com', 'bing.com', 'duckduckgo.com', 'stackoverflow.com'
    ];

    const isMatch = suspiciousDomains.some(d => lowerDomain.includes(d));
    if (isMatch) {
      console.log(`[Wi-Fi Interceptor] COLLUSION FLAG: Subnet device at IP ${ip} accessed domain ${domain}`);
      latestWifiCollusion = {
        domain,
        ip,
        timestamp: Date.now()
      };
    }
  };

  proxy.listen(8080, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\n=============================================================`);
    console.log(`📡 Wi-Fi Interceptor HTTP Proxy running on port 8080`);
    console.log(`👉 To test on your secondary phone:`);
    console.log(`   1. Connect your phone to the same WiFi network.`);
    console.log(`   2. Set manual proxy in phone WiFi settings:`);
    console.log(`      - Server/Host: ${localIp}`);
    console.log(`      - Port: 8080`);
    console.log(`   3. Search anything on ChatGPT or Google on the phone.`);
    console.log(`=============================================================\n`);
  });
}

startWifiCollusionProxy();
