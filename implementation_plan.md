# Implementation Plan - SentinelAI Core Platform Implementation

This plan outlines the systematic development of **SentinelAI: Autonomous Multi-Agent Exam Integrity Platform**, transforming the comprehensive enterprise design blueprints into a fully functional, end-to-end working software codebase.

## User Review Required

> [!IMPORTANT]
> **Implementation Scope & Architecture Alignment**
> The implementation will build a working, production-grade application workspace in `c:\Users\tanis\OneDrive\Desktop\mini`. It implements the full multi-agent proctoring lifecycle:
> 1. **Candidate Exam Workspace:** System readiness check, identity verification, secure locked exam interface, real-time webcam & telemetry streaming.
> 2. **Multi-Agent AI Intelligence Engine:** Vision Guard, Behavioral Analyst, Collusion Detection, Risk Prediction, and Decision Orchestrator agents running real-time feature extraction, cross-modal correlation, temporal decay calculations, and natural-language explainability (XAI) trace generation.
> 3. **Live Proctor Dashboard:** High-density candidate grid auto-sorted by dynamic AI Risk Score, live alert sidebar, multi-modal evidence review modal with synchronized clips, and 1-click proctor intervention controls.
> 4. **Admin & Compliance Portal:** Exam management, proctoring policy sensitivity configurator (agent weights & risk thresholds), and post-exam integrity report viewer.

> [!NOTE]
> All code will strictly adhere to the technology stack defined in [sentinel_ai_tech_stack.md](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_tech_stack.md) and the directory structure defined in [sentinel_ai_monorepo_structure.md](file:///C:/Users/tanis/.gemini/antigravity-ide/brain/6923a728-c23d-4c82-8e32-3de3bf436128/sentinel_ai_monorepo_structure.md).

## Proposed Changes

### Monorepo & Shared Packages Foundation

#### [NEW] [package.json](file:///c:/Users/tanis/OneDrive/Desktop/mini/package.json)
#### [NEW] [turbo.json](file:///c:/Users/tanis/OneDrive/Desktop/mini/turbo.json)
#### [NEW] [pnpm-workspace.yaml](file:///c:/Users/tanis/OneDrive/Desktop/mini/pnpm-workspace.yaml)
#### [NEW] [packages/types](file:///c:/Users/tanis/OneDrive/Desktop/mini/packages/types)
Shared TypeScript interfaces for Telemetry, Alerts, Agent Signals, Exam Sessions, User Roles, Risk Scores, and Evidence metadata.
#### [NEW] [packages/constants](file:///c:/Users/tanis/OneDrive/Desktop/mini/packages/constants)
Risk thresholds, Alert levels, Agent weight defaults, and Error codes.
#### [NEW] [packages/ui](file:///c:/Users/tanis/OneDrive/Desktop/mini/packages/ui)
Shared accessible UI components (Buttons, Badges, Risk Cards, Modals, Progress bars).

---

### Backend & Multi-Agent Engine (`services/backend`)

#### [NEW] [services/backend/package.json](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/package.json)
#### [NEW] [services/backend/src/server.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/server.ts)
Express + WebSocket server orchestrating REST endpoints, WebSocket connections, and multi-agent AI streams.

#### [NEW] [services/backend/src/agents/vision-guard.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/agents/vision-guard.ts)
Implements 3D gaze tracking, head pose estimation, secondary device detection, multi-face detection, and liveness analysis.

#### [NEW] [services/backend/src/agents/behavioral-analyst.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/agents/behavioral-analyst.ts)
Evaluates keystroke dwell/flight time dynamics, isolation forest anomaly scoring, robotic mouse trajectory linearity, and clipboard paste actions.

#### [NEW] [services/backend/src/agents/collusion-detector.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/agents/collusion-detector.ts)
Analyzes acoustic Voice Activity Detection (VAD), whisper detection, and cross-candidate essay semantic similarity.

#### [NEW] [services/backend/src/agents/risk-predictor.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/agents/risk-predictor.ts)
Computes dynamic temporal decay risk trajectories $R(t) = \sum w_i E_i e^{-\lambda(t-t_i)}$ and risk velocity $\frac{dR}{dt}$.

#### [NEW] [services/backend/src/agents/decision-orchestrator.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/agents/decision-orchestrator.ts)
Executes neuro-symbolic multi-modal signal correlation, suppresses single-detector false positives, calculates final dynamic risk scores, and generates natural-language explainability (XAI) traces.

#### [NEW] [services/backend/src/services/exam-service.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/services/exam-service.ts)
Manages exams, question sets, rosters, and proctoring policy sensitivity presets.

#### [NEW] [services/backend/src/services/audit-service.ts](file:///c:/Users/tanis/OneDrive/Desktop/mini/services/backend/src/services/audit-service.ts)
Maintains SHA-256 cryptographic hash-chain ledger entries for legally defensible proctor action logs.

---

### Candidate Exam Workspace (`apps/student-portal`)

#### [NEW] [apps/student-portal/app/page.tsx](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/student-portal/app/page.tsx)
Identity verification & system readiness check interface (Webcam, Mic, Browser lock).

#### [NEW] [apps/student-portal/app/exam/[sessionId]/page.tsx](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/student-portal/app/exam/[sessionId]/page.tsx)
Distraction-free locked exam interface featuring:
- Question navigation & essay/MCQ answer input.
- Real-time client feature extractor streaming webcam frames & telemetry via WebSockets.
- Connection health indicator & proctor warning toast overlays.

---

### Live Proctor Dashboard (`apps/proctor-dashboard`)

#### [NEW] [apps/proctor-dashboard/app/page.tsx](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/proctor-dashboard/app/page.tsx)
Real-time monitoring workstation featuring:
- Candidate grid auto-sorted by dynamic AI Risk Score (Color-coded Green, Yellow, Orange, Red cards).
- Filter bar by Alert Level and Candidate Name.
- Live Alert Feed sidebar with instant auditory/visual alerts.
- Synchronized Evidence Review Modal:
  - Multi-modal video/screen/audio player.
  - XAI Explainability Rationale breakdown.
  - Proctor control action bar ("Dismiss", "Send Warning Toast", "Initiate Chat", "Escalate").

---

### Admin & Compliance Portal (`apps/admin-portal`)

#### [NEW] [apps/admin-portal/app/page.tsx](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/admin-portal/app/page.tsx)
Institutional management console featuring:
- Exam creation and question authoring.
- Policy Configurator: Preset sensitivity profiles (Strict, Standard, Low) + agent weight & threshold sliders.
- Post-Exam Integrity Report viewer and SHA-256 audit ledger inspector.

---

## Verification Plan

### Automated Verification
1. Build verification across workspace packages: `npm run build` or `pnpm build`.
2. TypeScript static type checking: `npm run type-check`.

### Manual Verification
1. Launch dev server: `npm run dev`.
2. Open Candidate Portal (`http://localhost:3000` or equivalent):
   - Complete system check & 3D facial verification.
   - Start exam session; answer questions.
   - Trigger simulated cheating events (e.g., gaze shift offscreen, large paste, secondary voice) to verify client telemetry streaming.
3. Open Live Proctor Dashboard (`http://localhost:3001` or equivalent):
   - Confirm candidate cards auto-sort to top of grid as Risk Score increases.
   - Click flagged candidate alert to open Evidence Review Modal.
   - Verify natural-language XAI trace generation and multi-agent confidence breakdown.
   - Issue proctor warning toast and verify real-time delivery to Candidate Workspace.
4. Open Admin Portal (`http://localhost:3002` or equivalent):
   - Adjust proctoring sensitivity sliders; confirm policy update reflects in live decision orchestrator calculations.
   - Inspect post-exam Integrity Report and SHA-256 audit log.
