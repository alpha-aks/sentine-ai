# Candidate Session Service

**SentinelAI** — Production-ready candidate exam session lifecycle management service.

---

## Overview

The Candidate Session Service manages every aspect of a candidate's exam attempt:

- 11-state lifecycle with strict transitions
- Heartbeat monitoring with configurable timeouts
- HMAC-SHA256 signed reconnect tokens with replay protection
- Device fingerprinting and registration
- Presence tracking (focus, fullscreen, tab visibility)
- Policy violation detection and automatic enforcement
- Live timer management (exam, section, grace, idle, reconnect, auto-submit)
- Session suspension and proctor-initiated resume
- Multi-tenant isolation
- Session analytics with psychometric aggregation

---

## Session Lifecycle

```
NOT_STARTED
    ↓
WAITING_ROOM  ←── candidate joins
    ↓
READY         ←── device validation passed
    ↓
ACTIVE        ←── exam started
  ↙  ↓  ↘  ↓
PAUSED  RECONNECTING  SUSPENDED  SUBMITTED
  ↓         ↓              ↓         ↓
ACTIVE    ACTIVE          ACTIVE    ENDED
  ↓
TERMINATED / DISQUALIFIED  (from any non-terminal state)
```

Terminal states: `SUBMITTED`, `ENDED`, `TERMINATED`, `DISQUALIFIED`

---

## Quick Start

```bash
cd services/candidate-session-service
npm install
npm run build
npm test
npm run dev
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SESSION_SERVICE_PORT` | `4006` | HTTP port |
| `JWT_SECRET` | `sentinel_ai_jwt_secret_key_production_grade_32_bytes` | JWT signing secret |
| `SESSION_CACHE_TTL_SECONDS` | `300` | Cache TTL (5 min) |
| `HEARTBEAT_INTERVAL_SECONDS` | `15` | Expected client heartbeat interval |
| `HEARTBEAT_TIMEOUT_SECONDS` | `45` | Max time before heartbeat is considered missed |
| `MAX_CONSECUTIVE_MISSES` | `3` | Consecutive misses before disconnect |
| `MAX_RECONNECT_ATTEMPTS` | `3` | Maximum reconnect attempts per session |
| `RECONNECT_WINDOW_SECONDS` | `120` | Time window for reconnect |
| `RECONNECT_TOKEN_TTL_SECONDS` | `900` | Recovery token validity (15 min) |
| `MAX_TAB_SWITCHES` | `5` | Tab switches before termination |
| `MAX_FULLSCREEN_EXITS` | `5` | Fullscreen exits before suspension |
| `MAX_IDLE_TIMEOUTS` | `3` | Idle timeouts before suspension |
| `IDLE_TIMEOUT_MINUTES` | `10` | Idle timeout threshold |
| `AUTO_SUBMIT_ON_EXPIRY` | `true` | Auto-submit when exam timer expires |
| `TAB_SWITCHES_BEFORE_SUSPEND` | `3` | Tab switches before auto-suspend |
| `DISCONNECTS_BEFORE_TERMINATE` | `3` | Disconnects before termination |

---

## API Reference

### Base URL
```
/v1/sessions
```

### Session Lifecycle

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| `POST` | `/` | CANDIDATE | Join exam — creates session in WAITING_ROOM |
| `GET` | `/:sessionId` | Any | Get session state |
| `POST` | `/:sessionId/ready` | CANDIDATE | Transition to READY |
| `POST` | `/:sessionId/start` | CANDIDATE | Transition to ACTIVE |
| `POST` | `/:sessionId/submit` | CANDIDATE | Submit and end session |
| `POST` | `/:sessionId/terminate` | PROCTOR+ | Terminate session |
| `POST` | `/:sessionId/suspend` | PROCTOR+ | Suspend session |
| `POST` | `/:sessionId/resume` | PROCTOR+ | Resume suspended session |
| `POST` | `/:sessionId/transition` | ADMIN | Manual state transition |

### Heartbeat

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/:sessionId/heartbeat` | Record heartbeat |
| `GET` | `/:sessionId/heartbeat` | Get heartbeat status |

### Device & Presence

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/:sessionId/device` | Register device fingerprint |
| `GET` | `/:sessionId/device` | Get device info |
| `POST` | `/:sessionId/presence` | Record presence event |
| `GET` | `/:sessionId/presence` | Get presence summary |

### Reconnect & Recovery

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/:sessionId/reconnect/initiate` | Start reconnect — returns signed token |
| `POST` | `/:sessionId/reconnect/complete` | Complete reconnect with token |
| `GET` | `/:sessionId/recovery` | Get active recovery token |

### Violations & Timers

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/:sessionId/violations` | Report violation |
| `GET` | `/:sessionId/violations` | List violations (PROCTOR+) |
| `GET` | `/:sessionId/timer/:type` | Get timer state |
| `POST` | `/:sessionId/timer/:type/pause` | Pause timer (PROCTOR+) |
| `POST` | `/:sessionId/timer/:type/resume` | Resume timer (PROCTOR+) |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/:sessionId/analytics` | Session analytics |
| `GET` | `/:sessionId/history` | State transition history |
| `GET` | `/exam/:examId` | All sessions for exam |
| `GET` | `/exam/:examId/analytics` | Exam-level analytics summary |
| `GET` | `/exam/:examId/active-count` | Live active session count |

---

## Security

### Reconnect Token Format
```
base64(nonce:sessionId:candidateId:expiresEpoch).HMAC-SHA256
```

- HMAC-SHA256 signed with `JWT_SECRET`
- 15-minute TTL by default
- Single-use: nonce stored in memory after first use
- Constant-time comparison to prevent timing attacks

### Replay Attack Protection
Every reconnect token includes a random 32-hex-character nonce. Once validated, the nonce is stored in an in-memory Set. Any reuse returns `SESSION_TOKEN_REPLAYED`.

### RBAC

| Role | Permissions |
|------|------------|
| `CANDIDATE` | Join, heartbeat, submit, presence, device, reconnect |
| `LIVE_PROCTOR` | View, suspend, resume, terminate, violations, timers |
| `PROCTOR_SUPERVISOR` | All proctor actions + analytics |
| `EXAM_ADMIN` | All actions + manual transitions |
| `COMPLIANCE_OFFICER` | Read-only + terminate |

---

## Events Published

| Event | Trigger |
|-------|---------|
| `CandidateJoined` | Session created |
| `CandidateReady` | Moved to READY |
| `SessionStarted` | Moved to ACTIVE |
| `SessionPaused` | Suspended |
| `SessionResumed` | Resumed from suspension |
| `HeartbeatReceived` | Successful heartbeat |
| `HeartbeatMissed` | Heartbeat timeout detected |
| `ReconnectStarted` | Reconnect initiated |
| `ReconnectCompleted` | Reconnect succeeded or failed |
| `CandidateDisconnected` | Disconnect detected |
| `SessionTerminated` | Session terminated |
| `SessionSubmitted` | Session submitted |
| `SessionEnded` | Session ended (after submit) |
| `PolicyViolationDetected` | Any violation reported |

## Events Consumed

| Event | Handler |
|-------|---------|
| `ExamStarted` | Allows candidates to move to ACTIVE |
| `ExamCancelled` | Terminates all active sessions |
| `ExamEnded` | Auto-submits sessions still in ACTIVE |
| `UserAuthenticated` | Updates session metadata |

---

## Recovery Guide

### Browser Refresh / Crash
1. Candidate calls `POST /:sessionId/reconnect/initiate`
2. Service responds with a signed `token` and transitions session to RECONNECTING
3. Exam timer is paused
4. Candidate calls `POST /:sessionId/reconnect/complete` with token
5. Session returns to ACTIVE; timer resumes

### Network Loss
Same flow as above. If the candidate cannot reconnect within `RECONNECT_TOKEN_TTL_SECONDS`, the token expires and the session remains in RECONNECTING until a proctor intervenes or the exam ends.

### Power Failure / System Restart
Candidate authenticates again, calls initiate-reconnect to get a new token, completes reconnect. Previous token is invalidated.

---

## Architecture Notes

### State Machine
The `SessionStateMachine` uses a declarative transition table. All state changes go through `transition()` which validates the move and returns the new state. Idempotent self-transitions are allowed.

### Heartbeat Monitor
The `HeartbeatMonitor` tracks `lastSeenAt` per session. Any session whose last heartbeat is older than `heartbeatTimeoutSeconds` gets its miss counter incremented on the next scan. After `maxConsecutiveMissesBeforeDisconnect` misses, the session is automatically moved to RECONNECTING.

### Timer Engine
All timers are wall-clock based. Pausing a timer snapshots `remainingSeconds`. Resuming recalculates `startedAt` so the elapsed time reflects the snapshot.

---

## Operational Notes

- All stores are in-memory. In production, replace `SessionRepository` with a database adapter.
- The heartbeat scan (`runHeartbeatScan`) should be called by a background task every `heartbeatIntervalSeconds`.
- Expired timer detection (`timerEngine.getExpiredTimers()`) should be polled at the same interval.
- Reconnect token nonces are stored in-memory; on multi-instance deployments, use a shared Redis store.
