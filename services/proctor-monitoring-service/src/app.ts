import express from 'express';
import cors from 'cors';
import monitoringRouter from './routes/monitoring.routes';
import { MonitoringWebSocketManager } from './websocket/monitoring-ws';

const app = express();

app.use(cors());
app.use(express.json());

// Detailed Health & Observability Endpoint
app.get('/health', (req, res) => {
  const wsManager = MonitoringWebSocketManager.getInstance();
  const wsStats = wsManager.getStats();
  const memory = process.memoryUsage();

  res.json({
    status: 'UP',
    service: 'proctor-monitoring-service',
    port: 4008,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    activeConnections: wsStats.activeConnectionsCount,
    sequence: wsStats.currentSequence,
    memory: {
      rssBytes: memory.rss,
      heapTotalBytes: memory.heapTotal,
      heapUsedBytes: memory.heapUsed
    }
  });
});

// Register Monitoring API Routes
app.use('/api', monitoringRouter);

export default app;
