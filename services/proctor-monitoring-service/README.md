# SentinelAI Proctor Monitoring Backend Service

## Service Overview

The **Proctor Monitoring Service** (`services/proctor-monitoring-service`, running on **port 4008**) provides real-time proctoring monitoring, live candidate session aggregation, evidence metadata storage, alert management, and manual proctor action execution for SentinelAI.

---

## Realtime Architecture & WebSocket Protocol

```
+------------------+         WebSocket (/ws/monitoring)        +-----------------------------------+
|  Proctor         | <=======================================> | Proctor Monitoring Service        |
|  Dashboard       |       AUTH (Bearer JWT token)             | (Port 4008)                       |
|  (@sentinel-ai/  | ----------------------------------------> |                                   |
|   web)           |   SUBSCRIBE (EXAM_CHANNEL:exam_101)      | • WebSocket Manager               |
|                  | ----------------------------------------> | • Event Sequence Deduplication    |
|                  |   BROADCAST (seq=104, payload)            | • Heartbeat Ping/Pong (30s)       |
|                  | <---------------------------------------- | • Memory & Observability Metrics  |
+------------------+                                           +-----------------------------------+
```

### Connection Flow & Authentication
1. Client connects via `ws://localhost:4008/ws/monitoring`.
2. Client transmits `{"type": "AUTH", "token": "<jwt_token>"}` immediately upon connection opening.
3. Client subscribes to target channels:
   - `{"type": "SUBSCRIBE", "channel": "EXAM_CHANNEL:<examId>"}`
   - `{"type": "SUBSCRIBE", "channel": "CANDIDATE_CHANNEL:<sessionId>"}`

### Sequence Numbering & Deduplication
- Every broadcast payload includes a monotonic sequence number `seq: <number>`.
- Client `useProctorWS` discards events with `seq <= lastSequence` to protect against out-of-order writes during network delays.

---

## Recovery & Resiliency Strategy

1. **Automatic Resubscription on Reconnect**:
   - If the WebSocket disconnects, `useProctorWS` attempts reconnection after 3 seconds.
   - Upon reconnect, active `EXAM_CHANNEL` and `CANDIDATE_CHANNEL` subscriptions are automatically re-sent.

2. **Polling Fallback Mode**:
   - While disconnected (`isOffline: true`), TanStack Query background polling automatically refetches `/v1/monitoring/candidates` every 3 seconds to guarantee live dashboard continuity.

3. **Optimistic UI Action Rollback**:
   - Manual proctor actions (`WARN_CANDIDATE`, `PAUSE_SESSION`, `RESUME_SESSION`, `TERMINATE_SESSION`, `FLAG_SUBMISSION`) optimistically update local UI state.
   - If the server rejects the request, TanStack Query automatically rolls back candidate state to the previous snapshot.

---

## Observability & Health Check (`GET /health`)

```json
{
  "status": "UP",
  "service": "proctor-monitoring-service",
  "port": 4008,
  "timestamp": "2026-07-27T12:53:00.000Z",
  "uptimeSeconds": 1420,
  "activeConnections": 4,
  "sequence": 128,
  "memory": {
    "rssBytes": 45200000,
    "heapTotalBytes": 32000000,
    "heapUsedBytes": 18500000
  }
}
```

---

## Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`WebSocket connection failed`** | Service not running on port 4008 | Run `npm --prefix services/proctor-monitoring-service run dev` |
| **`401 UNAUTHORIZED` on APIs** | Missing Bearer token in request header | Ensure user is signed in via `/login` |
| **`403 FORBIDDEN` on Monitoring** | User role lacks proctor privileges | User role must be `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, or `SUPER_ADMIN` |
