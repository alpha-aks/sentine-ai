import http from 'http';
import app from './app';
import { Logger } from '@sentinel-ai/logger';
import { MonitoringWebSocketManager } from './websocket/monitoring-ws';

const logger = new Logger({ serviceName: 'proctor-monitoring-server' });
const PORT = process.env.PORT || 4008;

const server = http.createServer(app);

// Initialize WebSocket Manager
const wsManager = MonitoringWebSocketManager.getInstance();
wsManager.initialize(server);

server.listen(PORT, () => {
  logger.info(`Proctor Monitoring Service running on port ${PORT}`);
});
