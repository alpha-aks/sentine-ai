# Vision Guard AI Microservice Foundation (`@sentinel-ai/vision-guard-service`)

The **Vision Guard AI Microservice** is the real-time AI computer vision proctoring engine for the SentinelAI platform. It manages webcam stream ingestion, rate-limiting, YOLO object detection, face count analysis, head pose estimation, and emits proctoring violation events across the SentinelAI Event Bus.

---

## Architecture & Folder Structure

```
services/vision-guard-service/
├── src/
│   ├── config/              # Runtime environment configuration & validation
│   ├── controllers/         # Express REST API controllers (/health, /status, /metrics)
│   ├── engine/              # YOLO & Vision detection engine abstraction
│   ├── events/              # Event Bus publisher integration
│   ├── filters/             # Frame rate limiter & dropped frame trackers
│   ├── health/              # Service health manager (HEALTHY, DEGRADED, UNHEALTHY)
│   ├── metrics/             # Observability metrics registry
│   ├── middleware/          # Security, JWT, Tenant isolation, Request tracing
│   ├── models/              # Model Manager weights & ONNX/TensorRT runtime loader
│   ├── pipeline/            # Frame processor & queueing
│   ├── routes/              # Express REST routes
│   ├── rules/               # Proctoring event rule evaluator
│   ├── services/            # VisionGuardService core orchestrator
│   ├── types/               # TypeScript interfaces, DTOs, and Enums
│   ├── utils/               # Enterprise helper utilities
│   ├── app.ts               # Express application configuration
│   └── server.ts            # HTTP server listener & graceful lifecycle handling
├── package.json
└── tsconfig.json
```

---

## Configuration & Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `4009` | Service HTTP Listening Port |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `INFERENCE_MODE` | `CPU` | Inference hardware (`CPU` / `GPU`) |
| `GPU_ENABLED` | `false` | GPU acceleration toggle |
| `MODEL_PATH` | `./models/yolov8n.onnx` | Path to YOLO model weights |
| `FRAME_QUEUE_SIZE` | `100` | Max frame queue buffer depth |
| `DEFAULT_FPS` | `15` | Target frame ingestion rate |

---

## Health & Observability Endpoints

- **`GET /health`**: Health status summary (`{"status":"HEALTHY","service":"vision-guard-service"}`)
- **`GET /status`**: Full service status, startup timestamp, uptime, and active streams.
- **`GET /metrics`**: Observability metrics (frames processed, average latency, queue depth, GPU/CPU usage).
- **`GET /api/v1/vision/config`**: Authenticated runtime configuration parameters.

---

## Developer Commands

```bash
# Run tests
npm --prefix services/vision-guard-service test

# Type checking
npm --prefix services/vision-guard-service run type-check

# Dev Server
npm --prefix services/vision-guard-service run dev
```
