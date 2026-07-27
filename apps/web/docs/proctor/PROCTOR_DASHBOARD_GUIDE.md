# Real-Time Proctor Dashboard Technical & Usage Guide

## System Architecture

The **Real-Time Proctor Dashboard** (`@sentinel-ai/web`) connects to the **Proctor Monitoring Backend Service** (port 4008) to provide live multi-tenant candidate telemetry streaming, risk analysis, alert triage, evidence inspection, and manual proctor interventions.

---

## Navigation & Page Routes

| Route | Feature | Supported Roles |
| :--- | :--- | :--- |
| `/dashboard/proctor` | Live Proctor Command Center & Candidate Grid | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/exams` | Active Monitored Exams Directory | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/exams/[examId]` | Single Exam Monitoring View | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/candidates/[candidateId]` | Dedicated Candidate Stream & Evidence Workspace | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/alerts` | Incident Triage & Alert Management | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/evidence` | Registered Evidence Metadata Vault | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |
| `/dashboard/proctor/statistics` | System Real-time Proctoring Analytics & Charts | `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `SUPER_ADMIN` |

---

## Key Features

1. **Live Candidate Grid**:
   - Displays real-time candidate cards with avatar, name, roll number, active risk percentage, status pill, hardware indicators (camera, mic, gaze, fullscreen), and heartbeat timestamps.
2. **Candidate Side Drawer**:
   - Slides open upon clicking any candidate card without interrupting grid monitoring.
   - Displays profile details, live AI web-cam vision mesh stream, session activity timeline, evidence download links, and manual intervention panel.
3. **Manual Proctor Interventions**:
   - `WARN_CANDIDATE`: Sends on-screen warning toast to candidate.
   - `PAUSE_SESSION`: Temporarily freezes candidate exam timer and input.
   - `RESUME_SESSION`: Resumes paused candidate exam session.
   - `TERMINATE_SESSION`: Forces immediate exam termination with audit log.
   - `FLAG_SUBMISSION`: Flags candidate submission for compliance audit.
4. **WebSocket Integration**:
   - Establishes connection to `ws://localhost:4008/ws/monitoring`.
   - Subscribes to `EXAM_CHANNEL:<examId>` and `CANDIDATE_CHANNEL:<sessionId>`.
   - Invalidates TanStack Query caches on live broadcasts (`RISK_UPDATED`, `ALERT_CREATED`, `CANDIDATE_STATUS_CHANGED`).
