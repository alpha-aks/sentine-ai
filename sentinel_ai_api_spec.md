# API Design & Interface Specification
## SentinelAI: Autonomous Multi-Agent Exam Integrity Platform

**Document Metadata**
- **Document Title:** SentinelAI Production API Design & Interface Specification
- **Author:** Principal Backend Architect & API Designer
- **Status:** Approved / Ready for Engineering Handoff
- **Target Audience:** Backend Engineers, Frontend Engineers, Mobile/Desktop Engineers, Third-Party Integration Partners
- **Version:** 1.0.0 (API v1)
- **Source Artifacts:**
  - [SentinelAI Product Requirements Document (PRD)](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_prd.md)
  - [SentinelAI Software Architecture Document (SAD)](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_architecture.md)
  - [SentinelAI Technology Selection Document](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_tech_stack.md)
  - [SentinelAI Database Architecture Document](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_database_design.md)

---

## Table of Contents
1. [API Design Principles](#1-api-design-principles)
2. [Authentication APIs](#2-authentication-apis)
3. [User & Institution Management APIs](#3-user--institution-management-apis)
4. [Exam Management APIs](#4-exam-management-apis)
5. [Candidate Exam Session APIs](#5-candidate-exam-session-apis)
6. [AI Monitoring & Telemetry Ingestion APIs](#6-ai-monitoring--telemetry-ingestion-apis)
7. [Internal AI Agent Communication Specs (gRPC)](#7-internal-ai-agent-communication-specs-grpc)
8. [Alert & Evidence Management APIs](#8-alert--evidence-management-apis)
9. [Proctor Dashboard & Real-Time Analytics APIs](#9-proctor-dashboard--real-time-analytics-apis)
10. [Integrity Report & Audit Export APIs](#10-integrity-report--audit-export-apis)
11. [WebSocket Real-Time Event Architecture](#11-websocket-real-time-event-architecture)
12. [API Validation & Guardrails](#12-api-validation--guardrails)
13. [Standardized Error Handling Format](#13-standardized-error-handling-format)
14. [Rate Limiting Strategy](#14-rate-limiting-strategy)
15. [API Security Architecture](#15-api-security-architecture)
16. [API Versioning & Deprecation Policy](#16-api-versioning--deprecation-policy)
17. [Third-Party Integrations & Webhooks](#17-third-party-integrations--webhooks)
18. [API Documentation Standards](#18-api-documentation-standards)
19. [API Architectural Risks](#19-api-architectural-risks)

---

## 1. API Design Principles

### 1.1 REST Standards & Conventions
- **Base Endpoint URL:** `https://api.sentinelai.io/v1`
- **Resource Naming:** Nouns in lower-case plural form (e.g., `/exams`, `/candidates`, `/alerts`).
- **HTTP Methods:**
  - `GET`: Idempotent read operations (no side effects).
  - `POST`: Create resource or execute RPC action (e.g., `/exams/{id}/publish`).
  - `PUT`: Idempotent full replacement of target resource.
  - `PATCH`: Partial field update.
  - `DELETE`: Remove target resource.
- **Idempotency Keys:** Mutating endpoints (`POST /answers`, `POST /session/start`) accept an `Idempotency-Key` HTTP header to prevent duplicate execution during network retries.
- **Pagination Standard:** Cursor-based pagination for high-volume streams; offset-based for static admin tables.
  - *Query Params:* `?limit=50&starting_after=uuid_cursor&order=desc`

---

## 2. Authentication APIs

### 2.1 Summary Matrix

| Method | Endpoint Path | Summary | Primary Auth | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user credentials & issue JWT pair | None | 5 req / min |
| `POST` | `/auth/refresh` | Exchange valid refresh token for new access token | Refresh Token | 10 req / min |
| `POST` | `/auth/logout` | Revoke active refresh token & session | Bearer JWT | 20 req / min |
| `POST` | `/auth/mfa/verify` | Verify 6-digit TOTP / MFA code | Temp Token | 5 req / min |
| `POST` | `/auth/password/forgot`| Initiate password reset email flow | None | 3 req / hour |
| `POST` | `/auth/password/reset` | Complete password reset via token | Reset Token | 3 req / hour |

---

### 2.2 Endpoint Detail: User Login (`POST /auth/login`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "institution_slug": "harvard-univ"
}
```
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJKV1QiLC...",
    "refresh_token": "d9f8e7d6c5b4...",
    "token_type": "Bearer",
    "expires_in": 900,
    "mfa_required": false,
    "user": {
      "user_id": "usr_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "email": "student@university.edu",
      "role": "CANDIDATE",
      "institution_id": "inst_12345-abcde"
    }
  }
}
```
- **Error Response (`401 Unauthorized`):**
```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "http_status": 401,
    "message": "Invalid email or password.",
    "timestamp": "2026-07-25T10:14:22.000Z",
    "trace_id": "trc_9988776655"
  }
}
```

---

## 3. User & Institution Management APIs

| Method | Endpoint Path | Summary | Minimum Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | List users within institution (Filterable) | `INSTITUTION_ADMIN` |
| `POST` | `/users` | Provision new user (Student / Proctor) | `INSTITUTION_ADMIN` |
| `GET` | `/users/{user_id}` | Retrieve profile metadata & status | `SELF` / `ADMIN` |
| `PATCH`| `/users/{user_id}/accommodations` | Update pre-approved medical accommodations | `EXAM_COORDINATOR` |
| `GET` | `/institutions/{inst_id}/sso` | Fetch tenant SSO / SAML metadata config | `SUPER_ADMIN` |

---

## 4. Exam Management APIs

### 4.1 Summary Matrix

| Method | Endpoint Path | Summary | Min Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/exams` | Create new exam template & settings | `EXAM_COORDINATOR` |
| `PATCH`| `/exams/{exam_id}/policy` | Configure AI proctoring sensitivity weights | `EXAM_COORDINATOR` |
| `POST` | `/exams/{exam_id}/roster` | Batch import candidate roster via CSV/JSON | `EXAM_COORDINATOR` |
| `POST` | `/exams/{exam_id}/publish` | Lock question set & publish exam window | `EXAM_COORDINATOR` |

---

### 4.2 Endpoint Detail: Configure Policy (`PATCH /exams/{exam_id}/policy`)
- **Request Body:**
```json
{
  "sensitivity_profile": "STRICT",
  "enabled_agents": {
    "vision_guard": true,
    "behavioral_analyst": true,
    "collusion_detection": true,
    "risk_prediction": true
  },
  "agent_weights": {
    "vision": 0.35,
    "behavior": 0.25,
    "collusion": 0.25,
    "risk": 0.15
  },
  "risk_thresholds": {
    "low": 0.40,
    "medium": 0.55,
    "high": 0.70,
    "critical": 0.85
  }
}
```
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "policy_id": "pol_77665544-3322",
    "exam_id": "ex_11223344-5566",
    "updated_at": "2026-07-25T10:14:22.000Z"
  }
}
```

---

## 5. Candidate Exam Session APIs

### 5.1 Endpoint Detail: Identity Verification (`POST /sessions/verify-identity`)
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data Fields:**
  - `session_id`: `ses_99001122-3344`
  - `government_id_image`: `[Binary Image File]`
  - `live_face_snapshot`: `[Binary Image File]`
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "verification_status": "PASSED",
    "liveness_confirmed": true,
    "match_confidence": 0.985,
    "session_access_key": "sak_9988776655443322"
  }
}
```

---

### 5.2 Endpoint Detail: Answer Autosave (`POST /sessions/{session_id}/answers`)
- **Headers:** `Authorization: Bearer <token>`, `Idempotency-Key: ik_1049281`
- **Request Body:**
```json
{
  "question_id": "q_88776655",
  "answer_payload": {
    "text": "The principle of separation of concerns ensures...",
    "option_ids": ["opt_a"]
  },
  "client_timestamp": "2026-07-25T10:14:22.105Z"
}
```
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "saved_at": "2026-07-25T10:14:22.120Z",
    "checksum": "sha256_9a8b7c..."
  }
}
```

---

## 6. AI Monitoring & Telemetry Ingestion APIs

### 6.1 Endpoint Detail: Telemetry Ingest Batch (`POST /telemetry/events`)
- **Headers:** `Content-Type: application/x-protobuf` or `application/json`
- **Request Payload:**
```json
{
  "session_id": "ses_99001122-3344",
  "sequence_id": 1042,
  "events": [
    {
      "event_type": "GAZE_VECTOR",
      "timestamp": "2026-07-25T10:14:22.100Z",
      "payload": { "gaze_x": 0.85, "gaze_y": -0.42, "offscreen_duration_ms": 3600 }
    },
    {
      "event_type": "PASTE_EVENT",
      "timestamp": "2026-07-25T10:14:22.200Z",
      "payload": { "pasted_length": 140, "target_question_id": "q_88776655" }
    }
  ]
}
```
- **Success Response (`202 Accepted`):**
```json
{
  "status": "queued",
  "processed_events": 2
}
```

---

## 7. Internal AI Agent Communication Specs (gRPC)

Communication between underlying AI Agents and the central Decision Orchestrator uses **gRPC over HTTP/2 with Protocol Buffers**.

```protobuf
// gRPC Protocol Buffer Interface Definition (Architecture Representation)
syntax = "proto3";

package sentinelai.agent.v1;

service DecisionOrchestratorService {
  rpc EvaluateMultiModalEvents (MultiModalEventBundle) returns (OrchestratedDecisionResponse);
}

message VisionAgentSignal {
  string agent_id = 1;
  int64 timestamp = 2;
  float head_pose_yaw = 3;
  float head_pose_pitch = 4;
  float gaze_confidence = 5;
  bool offscreen_gaze_flag = 6;
  int32 person_count = 7;
  repeated string detected_objects = 8;
}

message BehaviorAgentSignal {
  string agent_id = 1;
  int64 timestamp = 2;
  float keystroke_anomaly_score = 3;
  float mouse_robotic_score = 4;
  int32 paste_char_count = 5;
}

message MultiModalEventBundle {
  string session_id = 1;
  string tenant_id = 2;
  VisionAgentSignal vision_signal = 3;
  BehaviorAgentSignal behavior_signal = 4;
}

message OrchestratedDecisionResponse {
  string decision_id = 1;
  float calculated_risk_score = 2;
  string alert_level = 3; // NONE, LOW, MED, HIGH, CRITICAL
  string natural_language_explanation = 4;
}
```

---

## 8. Alert & Evidence Management APIs

### 8.1 Summary Matrix

| Method | Endpoint Path | Summary | Min Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/alerts` | List flagged alerts with evidence links | `LIVE_PROCTOR` |
| `PATCH`| `/alerts/{alert_id}/resolve`| Resolve, dismiss, or escalate alert | `LIVE_PROCTOR` |
| `GET` | `/evidence/{evidence_id}`| Generate pre-signed encrypted media URL | `LIVE_PROCTOR` |

---

### 8.2 Endpoint Detail: Resolve Alert (`PATCH /alerts/{alert_id}/resolve`)
- **Request Body:**
```json
{
  "action": "DISMISS_BENIGN",
  "reason_code": "STUDENT_ADJUSTED_CHAIR",
  "notes": "Verified via live 2-way audio check that candidate dropped pen."
}
```
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "alert_id": "alt_112233-4455",
    "new_status": "DISMISSED",
    "updated_session_risk": 0.15,
    "resolved_by": "usr_proctor_77"
  }
}
```

---

## 9. Proctor Dashboard & Real-Time Analytics APIs

### 9.1 Endpoint Detail: Get Active Candidates Grid (`GET /dashboard/candidates`)
- **Query Params:** `?exam_id=ex_123&sort=risk_desc&alert_level=CRITICAL&limit=25`
- **Success Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "total_active_candidates": 450,
    "candidates": [
      {
        "session_id": "ses_99001122",
        "candidate_name": "Jane Doe",
        "seat_number": "Station 42",
        "current_risk_score": 0.88,
        "alert_level": "CRITICAL",
        "active_flags_count": 3,
        "latest_explainability": "Gaze off-screen (92% conf) + Phone detected in lap (88% conf).",
        "thumbnail_stream_url": "wss://media.sentinelai.io/thumb/ses_99001122"
      }
    ]
  }
}
```

---

## 10. Integrity Report & Audit Export APIs

### 10.1 Endpoint Detail: Export Integrity Report (`POST /reports/{session_id}/export`)
- **Request Body:**
```json
{
  "format": "PDF",
  "include_evidence_links": true,
  "include_audit_trail": true
}
```
- **Success Response (`202 Accepted`):**
```json
{
  "status": "processing",
  "data": {
    "report_job_id": "job_rep_998877",
    "estimated_completion_seconds": 15,
    "download_endpoint": "/reports/jobs/job_rep_998877/download"
  }
}
```

---

## 11. WebSocket Real-Time Event Architecture

### 11.1 WebSocket Channel Topology
- **Candidate Endpoint:** `wss://stream.sentinelai.io/ws/v1/candidate?token=<SessionJWT>`
- **Proctor Dashboard Endpoint:** `wss://stream.sentinelai.io/ws/v1/proctor?token=<ProctorJWT>&exam_id=<ExamID>`

```
+-----------------------------------------------------------------------------------+
|                            WEBSOCKET CLIENT EVENT PROTOCOL                        |
+-----------------------------------------------------------------------------------+
| 1. CANDIDATE -> SERVER: PING / TELEMETRY_FRAME / HAND_RAISE                       |
| 2. SERVER -> CANDIDATE: PONG / WARNING_TOAST / SESSION_PAUSE / TERMINATE          |
| 3. SERVER -> PROCTOR  : RISK_SCORE_UPDATE / ALERT_TRIGGERED / SYSTEM_METRIC      |
| 4. PROCTOR -> SERVER  : SUBSCRIBE_SESSION / DISPATCH_WARNING / INITIATE_CHAT      |
+-----------------------------------------------------------------------------------+
```

### 11.2 WebSocket Payload Specifications

#### Event: `ALERT_TRIGGERED` (Server $\rightarrow$ Proctor Dashboard)
```json
{
  "event": "ALERT_TRIGGERED",
  "timestamp": "2026-07-25T10:14:22.250Z",
  "data": {
    "alert_id": "alt_990011",
    "session_id": "ses_99001122-3344",
    "candidate_name": "Jane Doe",
    "risk_score": 0.88,
    "alert_level": "CRITICAL",
    "agent_source": "DECISION_ORCHESTRATOR",
    "explainability": "Gaze off-screen bottom-right (92%) correlated with 140-char text paste event.",
    "evidence": {
      "video_clip_url": "https://storage.sentinelai.io/evidence/clip_101422.mp4",
      "snapshot_url": "https://storage.sentinelai.io/evidence/snap_101422.jpg"
    }
  }
}
```

#### Event: `SESSION_COMMAND` (Server $\rightarrow$ Candidate Lockdown Shell)
```json
{
  "event": "SESSION_COMMAND",
  "timestamp": "2026-07-25T10:14:25.000Z",
  "data": {
    "command": "PAUSE_SESSION",
    "reason": "Proctor requested 360-degree environment sweep.",
    "require_acknowledgement": true
  }
}
```

### 11.3 WebSocket Reconnect Strategy
Clients implement **Exponential Backoff with Jitter**:
$$\text{RetryInterval} = \min\left(\text{MaxInterval}, \text{BaseInterval} \times 2^{\text{Attempt}} + \text{RandomJitter}\right)$$
Where `BaseInterval = 1000ms`, `MaxInterval = 30000ms`. Upon reconnection, clients emit `RESYNC_SESSION` with `last_sequence_id` to replay missed state.

---

## 12. API Validation & Guardrails

| Guardrail Type | Validation Rule | Rejection Behavior |
| :--- | :--- | :--- |
| **Payload Schema** | Enforced via OpenAPI / Zod models; strict type checking. | `400 Bad Request` with field error list. |
| **Authentication** | Bearer JWT validation on every protected route. | `401 Unauthorized` (`AUTH_TOKEN_EXPIRED`). |
| **Authorization** | RBAC permission check matching user role against resource. | `403 Forbidden` (`INSUFFICIENT_PERMISSIONS`). |
| **File Uploads** | WebCam snapshots capped to 5MB; image MIME whitelist (`image/jpeg`, `image/png`). | `413 Payload Too Large` / `415 Unsupported Media`. |
| **Idempotency** | Duplicate `Idempotency-Key` headers within 24h return cached response. | Returns cached `200 OK` response instantly. |

---

## 13. Standardized Error Handling Format

All platform API errors adhere to the standard JSON error schema:

```json
{
  "error": {
    "code": "EXAM_SESSION_LOCKED",
    "http_status": 423,
    "message": "The requested exam session has been locked by a supervisor.",
    "developer_message": "Session ses_99001122 state is TERMINATED. Mutating operations are forbidden.",
    "timestamp": "2026-07-25T10:14:22.000Z",
    "trace_id": "trc_1029384756",
    "suggested_action": "Contact the assigned Proctor Supervisor to request session unlock."
  }
}
```

### 13.1 Platform Error Code Catalog

| Error Code | HTTP Status | Description |
| :--- | :---: | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password incorrect. |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token expired. |
| `INSUFFICIENT_PERMISSIONS` | 403 | Role unauthorized for action. |
| `RESOURCE_NOT_FOUND` | 404 | Target entity ID does not exist. |
| `IDEMPOTENCY_CONFLICT` | 409 | Concurrent request with same key executing. |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded configured request threshold. |
| `AI_AGENT_TIMEOUT` | 504 | Upstream AI Agent failed to respond within SLA. |

---

## 14. Rate Limiting Strategy

| API Tier | Window | Rate Limit Threshold | Rate Limit Headers |
| :--- | :--- | :--- | :--- |
| **Auth APIs** | 1 Minute | 5 Requests / IP | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| **Candidate Exam APIs**| 1 Minute | 120 Requests / Token | Standard headers returned. |
| **Telemetry Ingestion**| 1 Second | 50 Events / Socket | Silently buffers or drops low-priority gaze vectors. |
| **Live Proctor Dashboard**| 1 Minute | 300 Requests / Token| Standard headers returned. |
| **Export & Report APIs**| 1 Hour | 10 Requests / User | Standard headers returned. |

---

## 15. API Security Architecture

- **JWT Token Structure:** Signed via RS256 algorithm with 15-minute expiration; public keys published via standard JWKS endpoint (`/.well-known/jwks.json`).
- **Replay Attack Protection:** All telemetry payloads include millisecond-precision timestamps and sequential counter IDs (`sequence_id`); out-of-order or duplicate sequence frames are rejected.
- **CORS Policy:** Strictly restricted to institutional white-listed origins (`https://*.university.edu`).

---

## 16. API Versioning & Deprecation Policy

- **Versioning Scheme:** URI path versioning (`/v1`, `/v2`).
- **Deprecation Lifecycle:** Deprecated APIs return `Sunset` and `Deprecation` HTTP headers 6 months prior to removal:
  - `Deprecation: @1770000000`
  - `Sunset: Wed, 11 Nov 2026 00:00:00 GMT`

---

## 17. Third-Party Integrations & Webhooks

### 17.1 LMS Integration (LTI 1.3 Advantage)
SentinelAI implements **1EdTech LTI 1.3 Advantage** for seamless integration with Canvas, Blackboard, and Moodle:
- **LTI Deep Linking:** Launches SentinelAI system check directly inside LMS canvas.
- **Assignment & Grade Sync:** Automatically posts proctoring completion receipts and integrity scores to LMS gradebook.

### 17.2 Webhook Notification Specifications
SentinelAI dispatches webhooks to configured institutional listener endpoints.

#### Webhook Payload Event: `exam.session.terminated`
```json
{
  "id": "wh_evt_88776655",
  "event": "exam.session.terminated",
  "created_at": "2026-07-25T10:14:25.000Z",
  "data": {
    "institution_id": "inst_12345",
    "exam_id": "ex_11223344",
    "session_id": "ses_99001122",
    "candidate_id": "usr_student_44",
    "final_risk_score": 0.94,
    "termination_reason": "CRITICAL_MALPRACTICE_CONFIRMED"
  },
  "signature": "sha256=d9f8e7c6b5a4..."
}
```

---

## 18. API Documentation Standards

- **OpenAPI Specification:** Complete OpenAPI 3.1.0 JSON/YAML definition auto-generated and published via Swagger UI (`/docs`) and Redoc (`/redoc`).
- **Mock Server:** Postman Collection and Prism Mock Server provisioned for frontend teams to simulate API responses prior to backend implementation.

---

## 19. API Architectural Risks

| Risk Scenario | Severity | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **WebSocket Connection Storm** | High | Dashboard disconnects during 50k exam start. | Implement Gateway rate-limiting & connection backpressure handling. |
| **Large Payload Denial of Service**| Medium | Client posts massive telemetry payloads. | Enforce strict 2MB body limit on API Gateway level. |
| **Webhook Delivery Failures** | Low | Institutional endpoint offline. | Exponential backoff webhook retry engine (up to 72 hours) with dead-letter queue. |

---

## 20. Document Sign-off & Next Steps

This API Design & Interface Specification formally completes **Step 5**. The API layer specification is locked and ready for implementation.

- **PRD, SAD, Tech Stack, & DB Alignment:** 100% Compliant.
- **Backend / Frontend Handoff Status:** **APPROVED FOR IMPLEMENTATION.**
