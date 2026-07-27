# Product Requirements Document (PRD)
## SentinelAI: Autonomous Multi-Agent Exam Integrity Platform

**Document Metadata**
- **Document Title:** SentinelAI Product Requirements Document (PRD)
- **Document Owner:** Principal Product Manager & Enterprise AI Solution Architect
- **Status:** Draft / Pending Engineering Handoff
- **Target Audience:** Engineering Leads, AI/ML Engineers, Product Owners, Enterprise Compliance Officers, UX Architects
- **Version:** 1.0.0

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision Statement](#3-vision-statement)
4. [Product Goals](#4-product-goals)
5. [Success Metrics (KPIs)](#5-success-metrics-kpis)
6. [Stakeholders](#6-stakeholders)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [User Stories](#10-user-stories)
11. [End-to-End Workflow](#11-end-to-end-workflow)
12. [AI Agent Specifications](#12-ai-agent-specifications)
13. [Data Sources](#13-data-sources)
14. [Event Catalogue](#14-event-catalogue)
15. [Candidate Journey](#15-candidate-journey)
16. [Administrator Journey](#16-administrator-journey)
17. [Proctor Journey](#17-proctor-journey)
18. [Edge Cases](#18-edge-cases)
19. [Assumptions](#19-assumptions)
20. [Constraints](#20-constraints)
21. [Risk Analysis](#21-risk-analysis)
22. [Future Scope](#22-future-scope)
23. [Questions That Must Be Answered Before Development](#23-questions-that-must-be-answered-before-development)
24. [Glossary](#24-glossary)
25. [Final Product Summary](#25-final-product-summary)

---

## 1. Executive Summary

### 1.1 What SentinelAI Is
SentinelAI is an enterprise-grade, autonomous exam integrity platform engineered to safeguard the security, fairness, and credibility of high-stakes remote examinations. Built upon a collaborative multi-agent artificial intelligence paradigm, SentinelAI continuously captures, correlates, and analyzes candidate telemetry—including computer vision, audio streams, browser events, peripheral inputs, answer patterns, and temporal dynamics—in real time.

### 1.2 Why It Exists
The rapid transition to remote education, global certifications, and remote recruitment assessments exposed fundamental vulnerabilities in remote examination integrity. Traditional proctoring platforms rely on either brittle rule-based triggers (e.g., flagging any head turn as cheating) or human proctors attempting to monitor dozens of concurrent streams. This results in high false-positive rates, candidate anxiety, proctor fatigue, poor auditability, and massive operational overhead. SentinelAI exists to deliver an objective, explainable, and scalable solution that evaluates context and intent rather than isolated telemetry spikes.

### 1.3 Target Users
- **Higher Education Institutions:** Universities, colleges, and online degree platforms.
- **Global Certification & Licensing Bodies:** Healthcare, legal, IT, and financial licensing authorities.
- **Enterprise & Recruitment Platforms:** Pre-employment screening and internal compliance testing.
- **Government & Public Sector Agencies:** Civil service and standardized national entrance exams.

### 1.4 Problems Solved
- **High False-Positive Spikes:** Replaces single-trigger flags with multi-agent evidence correlation.
- **Proctor Overload:** Reduces proctoring fatigue by suppressing low-confidence alerts and routing prioritized intervention queues.
- **Plagiarism & Collusion:** Identifies intra-exam and inter-candidate answer similarities and behavioral collusion patterns.
- **Unexplainable AI Decisions:** Delivers granular, timestamped reasoning chains backed by audio/visual/behavioral artifacts for every flag.
- **Scale Bottlenecks:** Replaces human-to-student monitoring ratios (1:10) with AI-orchestrated proctoring scaling to tens of thousands of concurrent examinees per proctor supervisor.

### 1.5 Business Value
- **Cost Reduction:** Reduces proctoring labor overhead by up to 70% while improving monitoring coverage.
- **Reputational Protection:** Safeguards institutional accreditation and certification value by preventing systemic cheating.
- **Global Scale:** Enables global round-the-clock exam delivery without regional proctoring staffing constraints.

### 1.6 Technical Value
- **Distributed Multi-Agent Intelligence:** Decouples monitoring responsibilities into specialized agents (Vision, Behavior, Collusion, Risk Prediction) coordinated by a central Decision Orchestrator.
- **Context-Aware Fusion:** Converts unstructured video, audio, and event streams into structured probabilistic integrity scores.
- **Zero-Trust Auditability:** Produces tamper-evident audit packages containing linked logs, confidence vectors, and raw evidence snapshots.

### 1.7 Competitive Advantage
| Feature / Attribute | Legacy Proctoring Solutions | SentinelAI Autonomous Multi-Agent Platform |
| :--- | :--- | :--- |
| **Detection Mechanism** | Isolated rule checks (e.g., face missing = flag) | Multi-Agent Collaborative Evidence Correlation |
| **Explainability** | Generic tags ("Suspicious Activity") | Explainable AI reasoning chains with timestamped proof |
| **Collusion Detection** | Basic post-hoc text copy checks | Real-time NLP cross-candidate & temporal answer pattern analysis |
| **Alert Volume** | Extremely High (80%+ false positive rate) | Low / Filtered (Only flags exceeding dynamic confidence thresholds) |
| **Proctor Scalability** | Low (1 proctor per 6–10 candidates) | High (1 proctor supervisor per 100+ active sessions) |

---

## 2. Problem Statement

### 2.1 Current Online Examination Vulnerabilities
Modern online examinations are subject to sophisticated cheating methodologies, including external hardware splitters, unauthorized secondary devices (smartphones, smartwatches, covert earpieces), secondary personnel in the physical room, remote desktop tool execution, virtual machine obfuscation, and synchronized cross-candidate answer sharing.

### 2.2 Weaknesses of Existing Proctoring Systems
1. **Isolated Telemetry Processing:** Existing systems evaluate webcam, screen share, and browser triggers in silos. A candidate looking down to read a physical scratch pad triggers the same visual flag as a candidate looking at a hidden phone.
2. **Brittle Thresholds:** Static rules fail to accommodate diverse physical environments, varying lighting conditions, physiological traits, or accommodations (e.g., neurodivergence, reading aloud habits).

### 2.3 Manual Review Limitations & Operational Costs
Human proctors monitoring multiple video feeds simultaneously experience cognitive fatigue within 30–45 minutes, leading to missed infractions and inconsistent enforcement. Subsequent manual review of flagged video recordings requires hundreds of labor-hours per exam session, creating administrative bottlenecks and delaying score publishing.

### 2.4 High False-Positive Rates & Candidate Friction
Over-flagging creates severe candidate anxiety, leading to false accusations, contested exam scores, complex legal/institutional appeals, and negative candidate experiences.

### 2.5 Lack of Explainability & Privacy Concerns
Black-box AI scoring systems fail to provide clear justification for why a candidate was flagged, creating legal liability under privacy frameworks (e.g., GDPR, FERPA). Candidates are subjected to intrusive surveillance without clear transparency into how biometric data is processed or evaluated.

---

## 3. Vision Statement

SentinelAI envisions a world where remote assessments are universally trusted, secure, and stress-free. By shifting online proctoring from adversarial surveillance to intelligent, multi-agent behavioral synthesis, SentinelAI will establish the global standard for remote exam integrity—delivering absolute credibility for institutions, seamless operational scale for organizations, and guaranteed fairness and transparency for every student.

---

## 4. Product Goals

### 4.1 Business Goals
- **BG-1:** Achieve 70% reduction in human proctoring review hours per 1,000 exam hours within 6 months of deployment.
- **BG-2:** Maintain a candidate score appeal rate of under 0.5% driven by proctoring disputes.
- **BG-3:** Support enterprise expansion to host concurrent national examinations exceeding 100,000 active candidates without system degradation.

### 4.2 Technical Goals
- **TG-1:** Architect a resilient multi-agent orchestration framework capable of processing multi-modal sensor inputs with sub-second agent-to-agent signal propagation.
- **TG-2:** Maintain edge-to-cloud inference optimization ensuring browser-side client telemetry footprint remains below strict CPU/RAM consumption caps.
- **TG-3:** Deliver end-to-end telemetry encryption, zero-knowledge evidence vaults, and compliance with global privacy regulations.

### 4.3 User Experience Goals
- **UXG-1:** Candidate setup, biometric verification, and system readiness checks completed within < 90 seconds.
- **UXG-2:** Proctor real-time dashboard UI presenting prioritized candidate risk queues with 1-click drilldown to video proof and agent reasoning.
- **UXG-3:** Zero pop-up interruptions to the candidate during the exam unless explicitly configured by the institution for critical integrity breaches.

### 4.4 AI Research Goals
- **ARG-1:** Reduce AI false-positive flag generation by 85% compared to baseline single-detector vision models through multi-agent evidence cross-validation.
- **ARG-2:** Develop fully explainable natural language reasoning chains summarizing complex spatio-temporal multi-sensor event sequences into actionable proctor summaries.
- **ARG-3:** Establish adaptive baseline calibration within the first 3 minutes of candidate interaction to account for individual lighting, posture, typing rhythm, and environment.

---

## 5. Success Metrics (KPIs)

| Metric Category | Key Performance Indicator (KPI) | Target Baseline | Measurement Frequency |
| :--- | :--- | :--- | :--- |
| **Accuracy** | Overall Detection Accuracy (Verified Malpractice) | $\ge 98.5\%$ | Per Exam Cycle / Monthly Audit |
| **Accuracy** | False Positive Rate (FPR) | $\le 2.0\%$ | Continuous / Real-time |
| **Accuracy** | False Negative Rate (FNR) | $\le 1.0\%$ | Post-Exam Sample Audits |
| **Performance** | Proctor Dashboard Alert Latency | $\le 1.5 \text{ seconds}$ | Real-time Stream Monitoring |
| **Performance** | AI Telemetry Inference Time (Per frame/event) | $\le 150 \text{ ms}$ | Continuous Telemetry Monitoring |
| **Performance** | Post-Exam Report Generation Time | $\le 45 \text{ seconds}$ | Per Session Completion |
| **Scale** | Maximum Concurrent Candidates (System-wide) | $\ge 100,000$ active | Peak Load Test Verification |
| **Resource** | Candidate Client CPU Utilization | $\le 15\%$ average | Continuous Client Telemetry |
| **Resource** | Candidate Client RAM Utilization | $\le 350 \text{ MB}$ | Continuous Client Telemetry |
| **Reliability** | System Service Availability (SLA) | $\ge 99.99\%$ Uptime | Monthly Dashboard SLA |
| **Reliability** | Data Loss Rate (Video/Audio/Events) | $0.00\%$ | Per Session Integrity Audit |
| **User Experience**| Candidate System Check Success Rate | $\ge 98.0\%$ first try | Daily Analytics Pipeline |
| **Satisfaction** | Proctor Net Promoter Score (NPS) | $\ge +60$ | Post-Exam Proctor Survey |

---

## 6. Stakeholders

| Stakeholder Role | Responsibilities | Key Objectives |
| :--- | :--- | :--- |
| **Student / Candidate** | Completes identity verification, abides by exam rules, takes exam remotely. | Seamless exam experience, privacy assurance, fair evaluation without false flags. |
| **Live Proctor** | Monitors live dashboard alert queues, reviews flagged video/audio clips, takes live actions. | Rapid alert review, clear evidence verification, minimal fatigue, zero false escalations. |
| **Exam Administrator** | Configures exam settings, rule sensitivities, candidate rosters, and reviews post-exam reports. | Efficient exam creation, custom policy enforcement, audit-ready integrity reports. |
| **University / Institution** | Maintains academic integrity standards, handles official candidate misconduct appeals. | Reputation preservation, institutional compliance, legally defensible integrity data. |
| **Certification Body** | Establishes high-stakes accreditation policies and reviews integrity compliance. | High security, prevention of item leakage, tamper-evident exam credentials. |
| **Enterprise Recruiter** | Invites candidates for technical/cognitive screening assessments. | Rapid hiring decisions, anti-plagiarism verification, reliable skill assessment. |
| **AI Systems Team** | Evaluates agent drift, retrains models, tunes multi-agent weights, optimizes inference. | Continuous accuracy gains, model bias minimization, latency optimization. |

---

## 7. User Roles and Permissions

### 7.1 Role Definitions
- **Super Administrator (SA):** Full platform management, global system settings, institutional tenant management.
- **Institutional Administrator (IA):** Manages institution-specific exams, proctor assignments, candidate rosters, and policy configurations.
- **Exam Coordinator (EC):** Schedules specific exam sessions, creates test policies, and accesses post-exam reports.
- **Proctor Supervisor (PS):** Manages live proctoring shifts, overrides proctor decisions, handles complex candidate escalations.
- **Live Proctor (LP):** Monitors live stream risk queues, reviews real-time evidence, issues warnings, pauses or terminates sessions.
- **Auditor / Compliance Officer (CO):** Read-only access to post-exam reports, full audit logs, and AI explainability artifacts.
- **Candidate / Student (ST):** Takes assigned identity checks and examinations within locked environment.

### 7.2 Permissions Matrix

| Module / Action | SA | IA | EC | PS | LP | CO | ST |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| System Configuration & Global Settings | **X** | - | - | - | - | - | - |
| Tenant & Institution Management | **X** | - | - | - | - | - | - |
| Create / Edit Exam Policies | **X** | **X** | **X** | - | - | - | - |
| Assign Proctors to Exam Sessions | **X** | **X** | **X** | **X** | - | - | - |
| View Live Proctoring Dashboard | **X** | **X** | **X** | **X** | **X** | - | - |
| Issue Candidate Warnings (Live) | - | - | - | **X** | **X** | - | - |
| Pause / Terminate Exam (Live) | - | - | - | **X** | **X** | - | - |
| Override AI Risk Score | - | **X** | - | **X** | - | - | - |
| View Post-Exam Integrity Reports | **X** | **X** | **X** | **X** | **X** | **X** | - |
| Export Audit Trail & Raw Evidence | **X** | **X** | - | **X** | - | **X** | - |
| Submit Candidate Appeal | - | - | - | - | - | - | **X** |
| Access Exam Workspace | - | - | - | - | - | - | **X** |

---

## 8. Functional Requirements

### 8.1 Authentication & Tenant Management
- **FR-AUTH-01:** System shall support Multi-Tenant Architecture isolating institutional data, user rosters, and exam configurations.
- **FR-AUTH-02:** System shall support Single Sign-On (SSO) integration via SAML 2.0, OpenID Connect (OIDC), and OAuth 2.0 for institutional identity providers.
- **FR-AUTH-03:** System shall enforce mandatory Multi-Factor Authentication (MFA) for all administrative, proctor, and supervisor roles.

### 8.2 Candidate Registration & Identity Verification
- **FR-ID-01:** System shall capture government-issued ID photos and perform automated OCR parsing to extract name, birth date, and ID number.
- **FR-ID-02:** System shall capture a live 3D facial biometric scan and calculate a facial descriptor embedding for candidate match against registered ID.
- **FR-ID-03:** System shall execute Liveness Detection (blink detection, micro-head rotation, texture analysis) to prevent static photo or screen spoofing.
- **FR-ID-04:** System shall continuously verify candidate identity during the exam session using periodic, non-intrusive background facial matching.

### 8.3 Exam Management & Policy Configuration
- **FR-EM-01:** Administrators shall configure exam-specific integrity rules, enabling/disabling specific AI agent modules (e.g., enable Vision Guard, disable Audio Analysis).
- **FR-EM-02:** Administrators shall set custom dynamic risk threshold triggers for Low, Medium, High, and Critical alert levels.
- **FR-EM-03:** System shall support accommodation rule sets (e.g., allowing specific medical devices, extra break allowances, oral reading allowances for visually impaired candidates).

### 8.4 Exam Session Lifecycle Management
- **FR-ES-01:** System shall enforce system compatibility checks (webcam feed, microphone audio level, browser lock compatibility, network bandwidth verification) prior to exam start.
- **FR-ES-02:** System shall lock down candidate browser environment, restricting tab switching, external window navigation, copy/paste buffers, and developer tools access.
- **FR-ES-03:** System shall seamlessly persist exam state locally in encrypted storage during intermittent network disconnects up to a configurable threshold (e.g., 5 minutes).

### 8.5 Real-Time AI Monitoring Engine

#### 8.5.1 Vision Guard Module
- **FR-AI-VG-01:** System shall continuously track candidate gaze direction and head pose pitch/yaw/roll in 3D space, identifying gaze shifts away from display boundaries exceeding configurable time limits (e.g., > 3.5 seconds).
- **FR-AI-VG-02:** System shall detect face absence, multiple human faces in frame, or partial facial occlusion (masks, sunglasses, hand coverage).
- **FR-AI-VG-03:** System shall identify secondary electronic devices (smartphones, tablets, secondary monitors, e-readers, smartwatches) in webcam stream frame.
- **FR-AI-VG-04:** System shall detect virtual camera injection, webcam feed freezing, loop attacks, and physical lens obstruction.

#### 8.5.2 Behavioral Analysis Module
- **FR-AI-BA-01:** System shall monitor and capture all browser-level window focus shifts, tab switches, display size changes, and keyboard shortcut attempts.
- **FR-AI-BA-02:** System shall monitor clipboard actions, detecting external text paste events into exam answer fields.
- **FR-AI-BA-03:** System shall capture keystroke dynamics (dwell time, flight time) to establish a typing rhythm baseline and flag sudden typing pattern anomalies indicating proxy writers.
- **FR-AI-BA-04:** System shall track mouse movement trajectories, identifying linear/robotic cursor paths indicative of automated scripting tools or secondary input devices.

#### 8.5.3 Collusion Detection Module
- **FR-AI-CD-01:** System shall analyze acoustic streams to detect ambient speech, secondary voices, whisper patterns, and oral dictation of questions/answers.
- **FR-AI-CD-02:** System shall perform real-time and post-exam cross-candidate semantic similarity checks on descriptive/essay answers across contemporaneous exam takers.
- **FR-AI-CD-03:** System shall correlate time-series answer submission timestamps across candidates to identify synchronized submission patterns.

#### 8.5.4 Risk Prediction Module
- **FR-AI-RP-01:** System shall aggregate individual telemetry events over time, applying temporal decay logic to elevate risk scores for sustained suspicious behavior while decaying isolated transient spikes.
- **FR-AI-RP-02:** System shall generate an aggregate Risk Score normalized between 0.00 (Perfect Integrity) and 1.00 (Definite Malpractice).

#### 8.5.5 Decision Orchestrator Module
- **FR-AI-DO-01:** System shall act as the central agent aggregator, correlating output events from Vision, Behavior, Collusion, and Risk Prediction agents.
- **FR-AI-DO-02:** System shall perform cross-agent evidence validation (e.g., Gaze shift + Audio speech + Copy/Paste event within 5-second window = Critical Malpractice Flag).
- **FR-AI-DO-03:** System shall automatically generate natural-language explainability justifications detailing precisely why an event triggered a specific risk score change.

### 8.6 Dashboard & Alerting System
- **FR-DASH-01:** System shall provide a Live Proctor Dashboard displaying active candidate grids prioritized automatically by real-time Risk Score.
- **FR-DASH-02:** System shall deliver instant visual/auditory alerts to proctors when a candidate's risk score breaches the configured threshold.
- **FR-DASH-03:** Proctors shall view synchronized multi-modal evidence playback (webcam clip, screen recording clip, audio snippet, keystroke stream, agent reasoning) upon selecting any alert.
- **FR-DASH-04:** System shall allow proctors to send standardized text warnings, initiate 1-way or 2-way video/audio chat, or pause/terminate the candidate session.

### 8.7 Post-Exam Reports & Analytics
- **FR-REP-01:** System shall compile an Integrity Report within 45 seconds of exam submission containing candidate profile, overall risk score, timeline visualization of events, agent confidence scores, and explainability summaries.
- **FR-REP-02:** Integrity Report shall include clickable video/audio/screen evidence links anchored to specific flagged event timestamps.
- **FR-REP-03:** Administrators shall export reports in tamper-evident PDF formats featuring cryptographic digital signatures.

### 8.8 Audit Logging & Compliance
- **FR-AUD-01:** System shall maintain an append-only, immutable audit trail of every administrative action, proctor intervention, AI risk calculation, and candidate interaction.
- **FR-AUD-02:** Audit logs shall include high-precision ISO-8601 timestamps, user IDs, IP addresses, role context, and cryptographic hash links to preceding log entries.

---

## 9. Non-Functional Requirements

### 9.1 Performance Requirements
- **NFR-PERF-01:** Client telemetry extraction overhead shall consume $\le 15\%$ CPU and $\le 350 \text{ MB}$ RAM on standard dual-core client hardware.
- **NFR-PERF-02:** Dashboard live stream telemetry propagation latency from candidate client to proctor screen shall be $\le 1.5 \text{ seconds}$.
- **NFR-PERF-03:** Decision Orchestrator event processing throughput shall support at least 50,000 incoming telemetry vectors per second per compute cluster node.

### 9.2 Security Requirements
- **NFR-SEC-01:** All data in transit shall be encrypted using TLS 1.3 with strong cipher suites.
- **NFR-SEC-02:** All sensitive data at rest (video, audio, biometric templates, candidate PII) shall be encrypted using AES-256-GCM encryption.
- **NFR-SEC-03:** System shall isolate biometric feature vectors from raw identity photos; biometric descriptors must be stored as one-way non-reconstructible embeddings.
- **NFR-SEC-04:** Application shall enforce strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and CORS constraints.

### 9.3 Availability & Reliability
- **NFR-REL-01:** Platform overall service availability shall achieve $\ge 99.99\%$ uptime excluding planned maintenance windows.
- **NFR-REL-02:** Mean Time Between Failures (MTBF) for AI processing pipeline shall exceed 8,760 hours.
- **NFR-REL-03:** Mean Time to Recovery (MTTR) for core telemetry stream ingestion services shall be $\le 60 \text{ seconds}$.

### 9.4 Scalability Requirements
- **NFR-SCA-01:** System architecture shall horizontally auto-scale to support 100,000 concurrent active exam candidates without manual capacity provisioning.
- **NFR-SCA-02:** Dashboard architecture shall support 2,500 simultaneous active proctors viewing dynamic live grids without frame drops.

### 9.5 Privacy & Regulatory Compliance
- **NFR-PRV-01:** Platform shall comply fully with General Data Protection Regulation (GDPR), Family Educational Rights and Privacy Act (FERPA), and California Consumer Privacy Act (CCPA).
- **NFR-PRV-02:** Candidate biometric data and video recordings shall be automatically purged after an institutionally configurable retention period (e.g., 30, 60, or 90 days).
- **NFR-PRV-03:** System shall support "Right to Access" and "Right to be Forgotten" workflows, allowing complete data extraction or deletion upon verified candidate request (subject to academic legal hold exceptions).

### 9.6 Accessibility Requirements
- **NFR-ACC-01:** Candidate exam workspace and verification portals shall comply with WCAG 2.1 Level AA standards.
- **NFR-ACC-02:** Candidate interface shall support screen readers, keyboard-only navigation, high contrast modes, and scalable text sizing.

---

## 10. User Stories

| ID | User Role | Story Description ("As a... I want to... So that...") | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **US-01** | Candidate | As a Candidate, I want to perform a 60-second system readiness check prior to exam day, so that I can ensure my webcam, microphone, and browser setup are fully compatible. | Hardware test passes green; explicit feedback provided for any failed component with resolution steps. |
| **US-02** | Candidate | As a Candidate, I want clear instructions during facial biometric scan, so that I can complete identity verification quickly without errors. | On-screen visual framing guide provided; verification completes in $< 15 \text{ s}$; liveness confirmed. |
| **US-03** | Candidate | As a Candidate, I want to view my network connectivity status unobtrusively during the exam, so that I know my progress is saving securely. | Persistent, low-profile connection health indicator; auto-reconnect banner without freezing exam timer. |
| **US-04** | Candidate | As a Candidate, I want to request technical help directly from the exam interface, so that I can resolve technical glitches without breaching exam rules. | Help request button opens live text chat with assigned proctor; session state logged. |
| **US-05** | Candidate | As a Candidate, I want to receive clear notification if a proctor issues a warning, so that I am aware of potential policy violations and can correct my posture/behavior. | Modally presented non-blocking toast warning requiring 1-click confirmation; exam timer continues. |
| **US-06** | Live Proctor | As a Live Proctor, I want my live dashboard grid to automatically rank candidates by current AI Risk Score, so that I focus my attention on high-risk sessions. | Real-time auto-sorting grid; color-coded risk cards (Green, Yellow, Orange, Red); zero manual refresh needed. |
| **US-07** | Live Proctor | As a Live Proctor, I want to click any alert card to immediately review a synchronized 10-second multi-modal video/screen/audio clip, so that I can verify suspicious activity. | Click-to-play modal displays synchronized video, screen feed, audio waveform, and triggered agent reasoning within $< 1 \text{ s}$. |
| **US-08** | Live Proctor | As a Live Proctor, I want to send standardized pre-scripted warnings to candidates, so that I maintain consistent enforcement without typing manually. | Dropdown list of policy warnings (e.g., "Face Out of Frame", "Background Noise Detected"); 1-click delivery. |
| **US-09** | Live Proctor | As a Live Proctor, I want to initiate a 1-way video / 2-way audio check with a candidate, so that I can inspect their physical environment mid-exam. | Stream connects within $< 2 \text{ s}$; exam pauses on candidate screen; proctor can request 360-degree environment sweep. |
| **US-10** | Live Proctor | As a Live Proctor, I want to manually escalate a candidate session to the Proctor Supervisor, so that high-stakes termination decisions receive dual authorization. | 1-click escalation button adds session to Supervisor Priority Queue with annotated evidence notes. |
| **US-11** | Proctor Supervisor | As a Proctor Supervisor, I want to view active proctor workloads and response times, so that I can reassign proctoring feeds during peak alert volume. | Live telemetry panel showing active proctors, assigned feeds, average alert resolution time, and workload indicators. |
| **US-12** | Proctor Supervisor | As a Proctor Supervisor, I want to review and override AI risk scores or proctor flags, so that erroneous warnings do not penalize innocent candidates. | Override toggle with mandatory text field for justification; original AI score and human override logged in audit trail. |
| **US-13** | Proctor Supervisor | As a Proctor Supervisor, I want to authorize immediate exam termination for critical infractions, so that severe cheating is stopped instantly. | Dual-authorization modal; sends instant lock signal to candidate browser; logs exact termination timestamp. |
| **US-14** | Exam Administrator | As an Exam Admin, I want to configure customized proctoring sensitivity profiles per exam, so that high-stakes licensing exams enforce stricter rules than open-book quizzes. | Preset sensitivity templates (Strict, Standard, Low, Custom); sliders for Vision, Audio, and Behavior weights. |
| **US-15** | Exam Admin | As an Exam Admin, I want to upload candidate rosters via CSV or LMS integration, so that eligible examinees are automatically provisioned. | Support CSV import, LTI 1.3 integrations (Canvas, Blackboard, Moodle); error validation report for bad emails/IDs. |
| **US-16** | Exam Admin | As an Exam Admin, I want to schedule exam windows and assign proctor teams, so that proctor capacity matches candidate demand. | Calendar scheduling UI; automated proctor shift slotting based on candidate volume projections. |
| **US-17** | Compliance Officer | As a Compliance Officer, I want to generate exportable tamper-evident PDF integrity reports, so that I have legally defensible documentation for appeals. | Single-click PDF export containing cryptographically signed audit log, event timeline, confidence scores, and snapshots. |
| **US-18** | Compliance Officer | As a Compliance Officer, I want to inspect the AI explainability log for any flagged event, so that I understand the exact multi-agent reasoning chain. | Natural language breakdown panel displaying individual agent confidence scores, correlated inputs, and decision rule fired. |
| **US-19** | Compliance Officer | As a Compliance Officer, I want to execute global data purging policies, so that biometric data is permanently removed per GDPR limits. | Automated cron purge schedule configuration; manual instant purge option with certificate of destruction logging. |
| **US-20** | AI Engineer | As an AI Engineer, I want to analyze false-positive alert metrics by model version, so that I can continuously tune detection models. | Analytics portal displaying FPR/FNR metrics broken down by agent version, lighting conditions, and device hardware types. |
| **US-21** | System Administrator| As a System Admin, I want to monitor real-time system performance metrics (CPU, RAM, latency, ingestion queues), so that I can ensure platform stability. | Observability dashboard displaying live cluster metrics, API error rates, stream ingestion latency, and auto-scale triggers. |
| **US-22** | System Admin | As a System Admin, I want to configure tenant-level SSO and SAML identity providers, so that institutions seamlessly authenticate users. | SSO setup wizard supporting SAML metadata upload, attribute mapping, and connection test suite. |
| **US-23** | Candidate | As a Candidate with accommodations, I want my pre-approved accommodations (e.g., medical device access) pre-loaded, so that AI models do not flag permitted items. | System suppresses specific flags (e.g., inhaler presence, frequent gaze shifts) for candidate profile based on admin configuration. |
| **US-24** | Live Proctor | As a Live Proctor, I want to filter alert feeds by specific event types (e.g., "Multiple Faces Only"), so that I can conduct targeted batch reviews. | Multi-select filter dropdown on live dashboard; filters candidate queue by specific event categories. |
| **US-25** | Exam Admin | As an Exam Admin, I want to run post-exam collusion detection across all submitted essay responses, so that cross-candidate plagiarism is identified. | Automated post-exam NLP similarity batch job producing pairwise similarity matrices and matched text snippet reports. |

---

## 11. End-to-End Workflow

```
[Phase 1: Registration & Provisioning]
  │
  ├── Administrator creates exam session & configures proctoring sensitivity profile.
  ├── Roster imported via LTI 1.3 / LMS / CSV.
  └── Candidate receives exam schedule notification & pre-exam checklist.
  │
[Phase 2: Pre-Exam Readiness Check]
  │
  ├── Candidate logs into platform via SSO / SAML.
  ├── System executes automated client check (Webcam, Mic, Bandwidth, OS, Screen lock).
  └── Identity Verification: ID card scan OCR + 3D facial biometric liveness check.
  │
[Phase 3: Exam Start & Secure Lockdown]
  │
  ├── System locks browser environment (disables tabs, shortcuts, external displays).
  ├── AI baseline calibration begins (30-second initial ambient & face baseline).
  └── Candidate accesses exam questions; timer starts.
  │
[Phase 4: Continuous Multi-Agent Monitoring]
  │
  ├── Vision Guard: WebCam feed -> Gaze, Head Pose, Face Count, Object Detection.
  ├── Behavioral Analyst: Events -> Keystroke Dynamics, Mouse Trajectories, Clipboard, Window focus.
  ├── Collusion Detection: Audio feed + Text input -> Speech recognition, NLP similarity stream.
  └── Risk Prediction: Aggregates time-series events; applies temporal decay function.
  │
[Phase 5: Decision Orchestration & Alert Routing]
  │
  ├── Decision Orchestrator correlates agent outputs -> Calculates dynamic Risk Score (0.00-1.00).
  ├── Generates natural-language explainability rationale.
  └── Low Risk (< 0.40): Silent logging | Med Risk (0.40-0.69): Proctor Queue | High Risk (>=0.70): Urgent Proctor Alert.
  │
[Phase 6: Live Proctor Intervention]
  │
  ├── Proctor reviews synchronized video/screen/audio evidence modal.
  ├── Proctor actions: Dismiss Flag / Issue Warning Toast / Initiate 2-Way Chat / Escalate to Supervisor.
  └── Supervisor action (if escalated): Confirm session pause or instant session termination.
  │
[Phase 7: Exam Submission & Post-Processing]
  │
  ├── Candidate completes exam or time expires.
  ├── Client lockdown released.
  ├── Post-exam batch jobs execute (Cross-candidate NLP essay collusion check).
  └── Complete Integrity Report compiled & cryptographically signed within 45s.
  │
[Phase 8: Archiving & Compliance Lifecycle]
  │
  ├── Report & encrypted evidence uploaded to Institutional Compliance Vault.
  ├── Audit logs updated with zero-knowledge cryptographic verification hash.
  └── Automated retention timer triggered for biometric/media purging per GDPR policy.
```

---

## 12. AI Agent Specifications

### 12.1 Vision Guard Agent

#### 12.1.1 Purpose
Continuous real-time optical analysis of candidate webcam stream to detect physical environment breaches, unauthorized objects, facial absence, secondary personnel, and optical tampering.

#### 12.1.2 Responsibilities
- 3D Face Landmark Tracking & Head Pose Estimation (Pitch, Yaw, Roll).
- Gaze Vector Tracking (estimating monitor focus point).
- Secondary Object Detection (phones, tablets, earpieces, monitors, books).
- Person Count Estimation (detecting 0, 1, or > 1 individuals in frame).
- Feed Integrity Verification (detecting static image injection, frozen frames, covered lens).

#### 12.1.3 Input Data
- WebCam Video Stream (Configurable resolution: 720p @ 15–30 FPS).
- Client Device Display Metadata (Screen dimensions, aspect ratio).

#### 12.1.4 Output
- Frame-level telemetry JSON containing: `head_pose_vector`, `gaze_coordinates`, `detected_objects_array`, `person_count`, `feed_integrity_status`, `agent_confidence_score` (0.00–1.00).

#### 12.1.5 Model Categories Used
- Convolutional Neural Networks (CNNs) / Mobile-optimized Vision Transformers for object detection.
- Facial Landmark Localization Models for 68-point 3D mesh reconstruction.
- Optical Flow models for camera tampering and frame movement verification.

#### 12.1.6 Decision Logic
- **IF** `person_count` == 0 for $> 3.0 \text{ s}$ $\rightarrow$ Flag: `FACE_ABSENT` (Severity: High).
- **IF** `person_count` > 1 for $> 1.0 \text{ s}$ $\rightarrow$ Flag: `MULTIPLE_FACES_DETECTED` (Severity: Critical).
- **IF** `gaze_coordinates` outside display bounding box for $> 3.5 \text{ s}$ $\rightarrow$ Flag: `SUSTAINED_OFFSCREEN_GAZE` (Severity: Medium).
- **IF** `detected_objects` contains `smartphone` with confidence $> 0.85$ $\rightarrow$ Flag: `UNAUTHORIZED_DEVICE_DETECTED` (Severity: Critical).

#### 12.1.7 Confidence Score Calculation
$$\text{Confidence}_{\text{Vision}} = w_1 \cdot \text{ModelScore}_{\text{Detection}} + w_2 \cdot \text{SignalQuality}_{\text{Lighting}} + w_3 \cdot \text{FrameStability}$$
Where weights $w_1, w_2, w_3$ normalize for low-light or poor webcam quality.

#### 12.1.8 Failure Cases & Recovery Strategy
- *Failure:* Poor room lighting causes facial tracking loss.
- *Recovery:* Trigger low-light enhancement filter; if tracking remains uncalibrated, issue non-accusatory UI prompt to candidate: "Please adjust room lighting or monitor position."

#### 12.1.9 Communication with Other Agents
- Emits real-time visual anomaly events directly to the **Decision Orchestrator Agent**.

---

### 12.2 Behavioral Analyst Agent

#### 12.2.1 Purpose
Monitors candidate interaction dynamics with the local operating system, browser container, keyboard, mouse, and clipboard to identify non-human patterns, external software reliance, or proxy test-takers.

#### 12.2.2 Responsibilities
- Monitor OS-level and Browser-level window focus and tab switching.
- Capture and analyze Keystroke Dynamics (Dwell time, Flight time, Typing velocity).
- Track Mouse Cursor Dynamics (Linearity, Velocity profiles, Jerk metrics).
- Clipboard buffer monitoring (Detecting pastes into answer textareas).

#### 12.2.3 Input Data
- Browser Event Stream (blur, focus, resize, visibilitychange, keydown, keyup, mousemove, paste).
- Time-series timestamps (millisecond precision).

#### 12.2.4 Output
- Behavioral event vectors containing: `event_type`, `duration`, `keystroke_anomaly_score`, `mouse_robotic_score`, `paste_volume_chars`, `agent_confidence_score`.

#### 12.2.5 Model Categories Used
- Statistical Anomaly Detection (Gaussian Mixture Models / Isolation Forests) for keystroke dynamics.
- Trajectory Analysis algorithms for mouse curvature and velocity validation.

#### 12.2.6 Decision Logic
- **IF** `paste_event` occurs AND `pasted_length` > 50 chars $\rightarrow$ Flag: `LARGE_PASTE_EVENT` (Severity: High).
- **IF** `window_blur` occurs $\rightarrow$ Flag: `WINDOW_FOCUS_LOST` (Severity: Medium).
- **IF** `keystroke_anomaly_score` exceeds $3\sigma$ from candidate initial 5-minute baseline $\rightarrow$ Flag: `KEYBOARD_RHYTHM_SHIFT` (Severity: High - Potential Proxy Taker).
- **IF** `mouse_robotic_score` $> 0.92$ $\rightarrow$ Flag: `AUTOMATED_CURSOR_MOVEMENT` (Severity: Critical).

#### 12.2.7 Confidence Score Calculation
$$\text{Confidence}_{\text{Behavior}} = \min\left(1.0, \frac{\text{SampleCount}_{\text{Keystrokes}}}{\text{MinBaselineThreshold}}\right) \times \text{StatisticalCertainty}$$

#### 12.2.8 Failure Cases & Recovery Strategy
- *Failure:* Candidate uses an accessibility switch device causing non-standard mouse trajectories.
- *Recovery:* Pre-exam accommodation flag suppresses robotic cursor detection rule for approved profile.

#### 12.2.9 Communication with Other Agents
- Transmits behavioral vectors to **Decision Orchestrator** and **Risk Prediction Agent**.

---

### 12.3 Collusion Detection Agent

#### 12.3.1 Purpose
Identifies real-time acoustic collaboration and post-exam semantic plagiarism across concurrent exam sessions.

#### 12.3.2 Responsibilities
- Acoustic Voice Activity Detection (VAD) and Whisper Detection.
- Real-time Speech-to-Text (STT) transcription of ambient room audio.
- Cross-Candidate Semantic Answer Similarity Analysis (Essay/Text questions).
- Temporal submission correlation across candidate cohorts.

#### 12.3.3 Input Data
- WebRTC Audio Stream (16kHz mono PCM).
- Candidate Submitted Answer Texts.
- Global Question Submission Timestamps.

#### 12.3.4 Output
- Audio event JSON: `speech_detected_flag`, `speaker_count`, `transcribed_text_snippet`, `audio_confidence`.
- Post-exam collusion report JSON: `pairwise_similarity_score`, `matched_candidate_ids`, `overlapping_ngrams`.

#### 12.3.5 Model Categories Used
- Recurrent Neural Networks / Transformers for Voice Activity Detection (VAD) & Diarization.
- Fine-tuned Large Language Models / Dense Text Embeddings for Semantic Text Similarity.

#### 12.3.6 Decision Logic
- **IF** `VAD` detects secondary distinct voice frequency $\rightarrow$ Flag: `SECONDARY_VOICE_DETECTED` (Severity: High).
- **IF** `STT` transcript matches question stem text $\rightarrow$ Flag: `ORAL_QUESTION_READING_DICTATION` (Severity: High).
- **IF** Pairwise semantic text similarity between candidate $A$ and candidate $B$ $> 0.88$ for non-standard essay answers $\rightarrow$ Flag: `PAIRWISE_TEXT_COLLUSION` (Severity: Critical).

#### 12.3.7 Confidence Score Calculation
$$\text{Confidence}_{\text{Collusion}} = \text{SignalToNoiseRatio}_{\text{Audio}} \times \text{ModelCosineSimilarity}_{\text{Text}}$$

#### 12.3.8 Failure Cases & Recovery Strategy
- *Failure:* High ambient background noise (e.g., street traffic, lawnmower) triggers false VAD.
- *Recovery:* Spectral noise suppression pre-filter isolates human speech frequencies (300 Hz – 3400 Hz); non-speech noise categorized and suppressed.

#### 12.3.9 Communication with Other Agents
- Emits real-time audio flags to **Decision Orchestrator**; feeds text embeddings into batch post-exam collusion matrix processor.

---

### 12.4 Risk Prediction Agent

#### 12.4.1 Purpose
Synthesizes historical time-series event streams throughout the exam duration to model overall candidate risk trajectories, applying mathematical decay functions to account for time elapsed since minor anomalies.

#### 12.4.2 Responsibilities
- Time-series event aggregation.
- Temporal Decay Calculation (reducing weight of an isolated glance away after 10 minutes of clean behavior).
- Cumulative Malpractice Probability Estimation.

#### 12.4.3 Input Data
- Streamed event logs from Vision Guard, Behavioral Analyst, and Collusion Detection agents.
- Exam progress percentage and elapsed time.

#### 12.4.4 Output
- Time-series Risk Vector containing: `current_risk_score` (0.00–1.00), `risk_velocity` (rate of risk increase), `primary_risk_driver`.

#### 12.4.5 Model Categories Used
- Long Short-Term Memory (LSTM) Networks / Temporal Convolutional Networks (TCN) trained on historical proctoring audit datasets.

#### 12.4.6 Decision Logic
- Computes Risk Score $R(t)$ at time $t$:
$$R(t) = \min\left(1.0, \sum_{i=1}^{N} w_i \cdot E_i \cdot e^{-\lambda (t - t_i)}\right)$$
Where $E_i$ is severity of event $i$, $t_i$ is event timestamp, $\lambda$ is half-life decay constant, and $w_i$ is agent confidence weight.

#### 12.4.7 Confidence Score Calculation
- Calculated via model variance across temporal sequence prediction frames.

#### 12.4.8 Failure Cases & Recovery Strategy
- *Failure:* Sequence of multiple minor benign events (e.g., sneezing, adjusting chair) causes mathematical risk score spike.
- *Recovery:* Decision Orchestrator cross-validates event context to cap cumulative risk escalation from non-correlated single-agent events.

#### 12.4.9 Communication with Other Agents
- Receives events from all monitoring agents; continuously publishes updated Risk Trajectory to **Decision Orchestrator Agent**.

---

### 12.5 Decision Orchestrator Agent

#### 12.5.1 Purpose
Acts as the central cognitive nexus of SentinelAI. Combines, correlates, and filters signals from all specialized agents, eliminates false positives through cross-modal reasoning, calculates the final Integrity Risk Score, and generates natural-language explainability summaries.

#### 12.5.2 Responsibilities
- Cross-Modal Evidence Correlation (e.g., verifying if a gaze shift coincided with an audio voice or paste event).
- False Positive Suppression (filtering out single-detector noise).
- Dynamic Threshold Evaluation.
- Natural Language Explainability Generation.

#### 12.5.3 Input Data
- Concurrent outputs from Vision Guard, Behavioral Analyst, Collusion Detection, and Risk Prediction agents.
- Institutional Exam Rule Profile & Sensitivity Parameters.

#### 12.5.4 Output
- Orchestrated Integrity Decision JSON: `final_risk_score`, `alert_level` (NONE, LOW, MED, HIGH, CRITICAL), `correlated_evidence_array`, `natural_language_explanation`, `recommended_proctor_action`.

#### 12.5.5 Model Categories Used
- Neuro-Symbolic AI / Bayesian Belief Networks / Large Language Model (LLM) fine-tuned for deterministic rule-guided explainable reasoning.

#### 12.5.6 Decision Logic Matrix
- **Rule 1 (Single Signal Noise Filter):** Vision Guard reports `OFFSCREEN_GAZE` (Confidence: 0.65), but Behavior Analyst reports `ACTIVE_TYPING` AND Collusion Agent reports `SILENCE` $\rightarrow$ Outcome: Suppress Alert. Resulting Score Adjustment: $+0.02$.
- **Rule 2 (Multi-Modal Malpractice Correlation):** Vision Guard reports `OFFSCREEN_GAZE` (Confidence: 0.90) AND Behavioral Analyst reports `LARGE_PASTE_EVENT` within 4 seconds $\rightarrow$ Outcome: Trigger `CRITICAL_ALERT`. Resulting Score Adjustment: $+0.55$.
- **Rule 3 (Environmental Interruption):** Vision Guard reports `FACE_ABSENT` AND Audio Agent reports `DOOR_SLAM_SOUND` $\rightarrow$ Outcome: Trigger `MEDIUM_WARNING` with label "Brief Environmental Interruption".

#### 12.5.7 Natural Language Explainability Generation (Sample Output)
> *"At timestamp 10:14:22, a CRITICAL alert was generated (Risk Score: 0.88). The Vision Guard detected candidate gaze directed off-screen bottom-right (Confidence: 92%). Concurrently at 10:14:24, the Behavioral Analyst recorded a 140-character text paste into Question 4. The Decision Orchestrator correlated these signals within a 2-second window, indicating candidate was reading an external device and copying unauthorized material."*

#### 12.5.8 Failure Cases & Recovery Strategy
- *Failure:* Conflict between agent recommendations (e.g., Vision Agent indicates High Risk, Audio Agent indicates Zero Risk).
- *Recovery:* Fall back to conservative weighted ensemble rules and route clip to human proctor queue marked as "Ambiguous - Human Review Required".

#### 12.5.9 Communication with Other Agents
- Receives feeds from all 4 underlying agents; outputs final state to **Dashboard Notification Pipeline**, **Report Generator**, and **Audit Log Vault**.

---

## 13. Data Sources

| Data Source | Format / Type | Frequency | Primary Target Agent | Retention Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Webcam Feed** | Video Stream (H.264 / VP8) | 15–30 FPS | Vision Guard Agent | Configurable (30–90 Days encrypted) |
| **Screen Capture** | Video Stream / Frames | 5–10 FPS | Vision Guard / Orchestrator | Configurable (30–90 Days encrypted) |
| **Microphone Stream**| Audio Stream (WebRTC PCM) | Continuous | Collusion Detection Agent | Configurable (30–90 Days encrypted) |
| **Browser Events** | JSON Event Telemetry | Event-driven (ms) | Behavioral Analyst Agent | Permanent (Immutable Log) |
| **Clipboard Buffer** | Text Metadata / Length | Event-driven | Behavioral Analyst Agent | Permanent (Sanitized text) |
| **Keyboard Stream** | Key Code, Dwell/Flight (ms)| Event-driven | Behavioral Analyst Agent | Permanent (Timing metrics only, no raw passwords) |
| **Mouse Stream** | Coordinates (x,y), Velocity | 20 Hz Sampled | Behavioral Analyst Agent | Permanent |
| **Answer Sheet Data**| Plaintext / Markdown | On Question Save | Collusion Detection Agent | Permanent (Academic record) |
| **System Metadata** | OS, IP, Browser, Display Res| Pre-Exam & Periodic| Behavioral Analyst Agent | Permanent |
| **Identity Biometrics**| 512-dim Vector Embedding | Pre-Exam & Periodic| Vision Guard Agent | One-way Hash Vector (Purged on request) |

---

## 14. Event Catalogue

| Event ID | Event Name | Severity | Responsible Agent | Primary Evidence Captured | Min. Conf. Threshold | Event Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EV-VIS-01** | `FACE_ABSENT` | High | Vision Guard | 5s Video Clip + Frame Snapshot | 0.85 | Candidate face fully absent from webcam frame for $>3.0 \text{ s}$. |
| **EV-VIS-02** | `MULTIPLE_FACES` | Critical | Vision Guard | Video Clip + Frame Snapshots | 0.90 | Secondary human face detected within webcam field of view. |
| **EV-VIS-03** | `GAZE_OFFSCREEN` | Medium | Vision Guard | Gaze vector trajectory plot | 0.80 | Sustained gaze shifted away from display bounds for $>3.5 \text{ s}$. |
| **EV-VIS-04** | `DEVICE_DETECTED` | Critical | Vision Guard | Bounding box image snapshot | 0.85 | Phone, tablet, smartwatch, or secondary display detected. |
| **EV-VIS-05** | `CAMERA_TAMPER` | Critical | Vision Guard | Luminance/Frame Difference | 0.95 | Physical obstruction, dark feed injection, or static frame loop. |
| **EV-BEH-01** | `WINDOW_BLUR` | Medium | Behavioral Analyst | Timestamped OS Focus Log | 1.00 | Candidate navigated away from locked exam browser window. |
| **EV-BEH-02** | `PASTE_EVENT` | High | Behavioral Analyst | Pasted char count + Source tag | 1.00 | Text snippet pasted into answer input field. |
| **EV-BEH-03** | `ROBOTIC_CURSOR` | Critical | Behavioral Analyst | Mouse movement vector plot | 0.90 | Cursor moved in perfectly linear or scripted geometric path. |
| **EV-BEH-04** | `PROXY_TYPING` | High | Behavioral Analyst | Keystroke timing deviation graph| 0.85 | Typing rhythm suddenly shifts radically from initial candidate baseline. |
| **EV-AUD-01** | `SPEECH_DETECTED` | High | Collusion Agent | Audio WAV Clip + Spectrogram | 0.80 | Audible human speech detected in acoustic environment. |
| **EV-AUD-02** | `WHISPER_DETECTED` | High | Collusion Agent | Amplified Audio WAV Clip | 0.75 | Low-amplitude whisper frequencies detected near microphone. |
| **EV-COL-01** | `ESSAY_SIMILARITY` | Critical | Collusion Agent | Side-by-side text diff highlight| 0.88 | High semantic/grammatical similarity between essay answers across examinees. |
| **EV-ORCH-01**| `CORRELATED_MALPRACTICE`| Critical| Decision Orchestrator| Combined Multi-Modal Bundle | 0.92 | Cross-agent correlation confirms deliberate cheating event. |

---

## 15. Candidate Journey

```
[Step 1: Invitation & Pre-Exam Setup]
  └── Candidate receives email invite -> Clicks link -> Logs into SentinelAI Portal via University SSO.
  └── Completes pre-exam hardware diagnostic check (Webcam, Mic, Browser compatibility verified).

[Step 2: Authentication & Identity Lock]
  └── Candidate holds government photo ID to camera -> Automated OCR extracts credentials.
  └── Candidate performs 3D facial scan -> System verifies face match against ID + confirms liveness.
  └── Environment rules presented -> Candidate accepts Honor Code & Privacy Disclosure.

[Step 3: Secure Lockdown Entry]
  └── Browser enters full-screen lock mode -> Secondary monitors blocked -> OS clipboard sanitized.
  └── System conducts 30-second background baseline calibration (lighting, gaze, ambient noise level).

[Step 4: Active Exam Session]
  └── Exam questions displayed. Candidate navigates test.
  └── AI Agents process telemetry silently in background.
  └── [Scenario A: Clean Session] Candidate completes exam without friction -> Submits test.
  └── [Scenario B: Minor Warning] Candidate tilts screen -> Proctor sends toast warning: "Please keep face centered." -> Candidate adjusts -> Session continues.
  └── [Scenario C: Severe Infraction] Candidate attempts phone use + paste -> Proctor reviews instant alert -> Proctor pauses exam -> Supervisor terminates session.

[Step 5: Completion & Exit]
  └── Exam submitted -> Secure lockdown released -> Candidate receives submission confirmation receipt.
```

---

## 16. Administrator Journey

```
[Step 1: Institutional Configuration & Setup]
  └── Admin logs into SentinelAI Console with MFA.
  └── Configures Tenant Settings: Retain video for 60 days, enable GDPR auto-purge, set SSO SAML endpoint.

[Step 2: Exam Policy & Rule Profile Definition]
  └── Admin creates "Medical Licensing Exam 2026".
  └── Sets Proctoring Sensitivity to "Strict": Vision Guard (Weight 0.35), Behavior (0.25), Collusion (0.25), Risk Threshold High = 0.70.
  └── Configures pre-approved accommodations list (e.g., student ID #8921 allowed physical scratch paper).

[Step 3: Roster Provisioning & Proctor Assignment]
  └── Imports candidate roster CSV (2,500 candidates).
  └── Assigns 15 Live Proctors and 2 Proctor Supervisors to exam time slot (10:00 AM - 1:00 PM).

[Step 4: Post-Exam Review & Institutional Archiving]
  └── Exam concludes -> Admin views aggregate analytics dashboard (Total examinees, Flagged %, Appeal rate).
  └── Exports cryptographically signed Integrity Audit Package for institutional record.
```

---

## 17. Proctor Journey

```
[Step 1: Shift Login & Dashboard Overview]
  └── Live Proctor logs into Dashboard -> System assigns 150 active candidate feeds to proctor monitoring queue.
  └── Dashboard automatically sorts candidates: Top row features High Risk candidates (Red), bottom shows Low Risk (Green).

[Step 2: Real-Time Alert Triage]
  └── Alert Notification sounds: Candidate "John Doe" (Seat 42) Risk Score spiked from 0.20 to 0.78 (CRITICAL).
  └── Proctor clicks candidate card -> Synchronized Modal opens displaying:
      - 10s Webcam Clip (showing candidate looking down at lap).
      - Screen Feed Clip (showing active window).
      - Orchestrator Explanation: "Gaze off-screen (91% conf) + Phone detected in lap (88% conf)."

[Step 3: Action Execution]
  └── Option A (False Alarm): Proctor sees candidate was picking up dropped pen -> Clicks "Dismiss - Benign" -> AI score recalibrates.
  └── Option B (Warning): Proctor clicks "Send Warning Toast" -> Types custom text or chooses template.
  └── Option C (Intervention): Proctor clicks "Initiate 2-Way Audio Chat" -> Verifies physical environment.
  └── Option D (Escalation): Proctor clicks "Escalate to Supervisor for Termination" -> Passes evidence bundle to Supervisor queue.

[Step 4: Shift Handover & Log Sign-off]
  └── Shift ends -> Proctor signs out -> All review actions logged immutably in proctor audit ledger.
```

---

## 18. Edge Cases

### 18.1 Network & Infrastructure Edge Cases
1. **EC-NET-01: Complete Internet Disconnection Mid-Exam.** Candidate internet drops entirely. *System Action:* Local encrypted client storage saves answer inputs and telemetry timestamps. A non-blocking UI alert displays a 5-minute grace countdown. If connection restores within 5 minutes, unsent telemetry syncs back to cloud; if time expires, session pauses gracefully.
2. **EC-NET-02: Extreme Bandwidth Throttling (< 100 kbps).** *System Action:* Client dynamically degrades webcam video stream resolution from 720p to 360p and lowers frame rate from 30 FPS to 5 FPS. AI Vision Guard switches to lightweight edge processing mode on local client frames to maintain monitoring continuity.
3. **EC-NET-03: High Packet Loss (> 30%).** *System Action:* Video stream drops frames; Decision Orchestrator lowers Vision Agent confidence weight automatically to prevent false flags driven by video artifacting.
4. **EC-NET-04: Server-Side Stream Ingestion Node Failure.** *System Action:* Infrastructure load balancers re-route client WebRTC video streams to redundant standby ingestion node within $< 2 \text{ seconds}$ without dropping candidate exam state.
5. **EC-NET-05: Proxy / VPN Activation Mid-Exam.** Candidate enables VPN mid-exam to bypass location locks. *System Action:* Behavioral Analyst detects IP socket migration; triggers `NETWORK_TOPOLOGY_CHANGE` warning; alerts proctor.

### 18.2 Vision & Optical Edge Cases
6. **EC-VIS-06: Sudden Extreme Ambient Light Shift.** Sunlight suddenly hits webcam, blinding camera sensor. *System Action:* Vision Guard detects over-exposure/luminance spike; suppresses `FACE_ABSENT` flag; requests auto-gain adjustments; prompts candidate to adjust shade if uncorrected after 15 seconds.
7. **EC-VIS-07: Candidate Possesses Facial Tic / Involuntary Movement.** Candidate has Tourette Syndrome or medical nystagmus causing rapid eye/head movement. *System Action:* Pre-loaded candidate accommodation profile adjusts Gaze/Head Pose deviation thresholds by $+400\%$ to eliminate false positives.
8. **EC-VIS-08: Candidate Wears Thick Reflective Eyeglasses.** Lens glare blocks pupil visibility. *System Action:* Vision Guard falls back to 3D Head Pose pitch/yaw tracking instead of pupil gaze tracking, adjusting confidence scoring model accordingly.
9. **EC-VIS-09: Candidate Briefly Covers Face to Cough / Sneeze.** *System Action:* Face occlusion lasts $< 2.5 \text{ seconds}$. Vision Guard logs transient event; Risk Prediction Agent applies temporal decay; no alert routed to proctor.
10. **EC-VIS-10: Virtual Camera / Loop Video Injection Attempt.** Candidate uses OBS Studio virtual camera playing looped video of themselves staring at screen. *System Action:* Vision Guard Liveness Module analyzes micro-blinking periodicity, background noise variance, and frame hash repetition; flags `VIRTUAL_CAMERA_SPOOF` (Critical).
11. **EC-VIS-11: Deepfake Stream Injection.** Candidate uses real-time AI avatar filter. *System Action:* Liveness detector identifies boundary artifacts, lighting misalignment, and spectral anomalies; triggers `SYNTHETIC_MEDIA_DETECTED` (Critical).
12. **EC-VIS-12: Infant / Pet Enters Webcam Field of View.** *System Action:* Vision Guard Object Classifier identifies non-human domestic entity; suppresses `MULTIPLE_FACES` cheating alert; logs benign notice.
13. **EC-VIS-13: Secondary Person Stands Behind Candidate.** *System Action:* Vision Guard detects secondary human face; flags `SECONDARY_PERSON_PRESENT` (Critical); captures high-res snapshot for proctor review.
14. **EC-VIS-14: Candidate Sits in Completely Dark Room.** *System Action:* Pre-exam environment check fails; blocks exam entry until ambient lighting exceeds minimum lux threshold.
15. **EC-VIS-15: Camera Covered Physical Obstruction (Post-it note).** *System Action:* Vision Guard detects 99%+ black frame or total zero-edge variance; flags `CAMERA_LENS_BLOCKED` after 3 seconds.

### 18.3 Hardware & Peripheral Edge Cases
16. **EC-HDW-16: Physical Disconnection of Webcam.** Webcam USB cable unplugged mid-exam. *System Action:* Client locks question interface immediately with modal: "Webcam Disconnected. Re-connect hardware to resume." System timer pauses if configured by institution.
17. **EC-HDW-17: External Monitor Plugged In Mid-Exam.** Candidate connects HDMI cable to secondary TV. *System Action:* Secure lockdown container detects multi-display enumeration change; blackouts secondary display immediately; logs `UNAUTHORIZED_DISPLAY_ATTACHED`.
18. **EC-HDW-18: Bluetooth Earpiece Connection.** Candidate connects hidden Bluetooth earbud. *System Action:* System monitors audio output device changes; logs `BLUETOOTH_AUDIO_CONNECTED`; alerts proctor.
19. **EC-HDW-19: Mechanical Keyboard Extreme Noise.** Loud mechanical key switches mask audio environment. *System Action:* Collusion Agent frequency filter isolates typing clicks from speech frequencies, keeping Voice Activity Detection operational.
20. **EC-HDW-20: Mouse Battery Dies.** Candidate cursor stops moving for 20 minutes. *System Action:* Behavioral Analyst differentiates zero-input state from active keyboard typing; avoids flagging as anomaly unless keyboard also ceases.

### 18.4 Audio & Speech Edge Cases
21. **EC-AUD-21: Loud Background Street Siren / Construction Noise.** *System Action:* Acoustic noise classifier categorizes environmental siren noise (non-speech); suppresses audio alert; maintains VAD sensitivity.
22. **EC-AUD-22: Candidate Reads Questions Out Loud to Themselves.** *System Action:* STT transcribes speech. Decision Orchestrator compares speech text to currently displayed question text. If match is $> 90\%$, flags `ORAL_QUESTION_READING` (Low/Medium severity) rather than `COLLUSION`.
23. **EC-AUD-23: Hidden Helper Whispering Answers from Off-Camera.** *System Action:* Collusion Agent acoustic amplifier isolates low-decibel whisper audio; speech-to-text transcribes content; flags `WHISPER_COLLUSION_DETECTED` (Critical).
24. **EC-AUD-24: Candidate Listens to Music in Background.** *System Action:* Audio analysis identifies background acoustic music track; logs `BACKGROUND_AUDIO_DETECTED`.
25. **EC-AUD-25: Microphone Hardware Muted via Physical Inline Switch.** *System Action:* System detects zero-amplitude flatline signal continuously for $> 10 \text{ seconds}$; displays alert: "Microphone signal lost. Unmute hardware switch."

### 18.5 Behavioral & Input Edge Cases
26. **EC-BEH-26: Fast Touch-Typist Exceeding 140 WPM.** *System Action:* Behavioral Analyst evaluates keystroke consistency metrics rather than raw speed; fast typing matching initial candidate baseline is validated as authentic.
27. **EC-BEH-27: Proxy Test Taker Takes Over Keyboard.** Candidate swaps seats with a friend mid-exam. *System Action:* Keystroke dynamics model flags sudden shift in dwell/flight timing distribution ($> 3\sigma$ deviation); Vision Guard simultaneously flags facial mismatch against registered identity.
28. **EC-BEH-28: Complex Formula Copy-Pasting in STEM Exams.** Candidate uses built-in math formula editor. *System Action:* Internal formula editor inputs are whitelisted; external system clipboard paste events remain monitored and flagged.
29. **EC-BEH-29: Rapid Mouse Scrolling / Random Clicking due to Anxiety.** *System Action:* Behavioral Analyst recognizes high-velocity erratic cursor movements without target focus as fidgeting/anxiety patterns; suppresses robotic/scripting flags.
30. **EC-BEH-30: Automated AutoHotkey / Macro Script Execution.** Script attempts to auto-type answers into text boxes at 500 WPM. *System Action:* Keystroke timing engine identifies zero-variance inter-key delay ($0.00 \text{ ms}$ flight time delta); flags `AUTOMATED_MACRO_INJECTION` (Critical).

### 18.6 Environment & Software Edge Cases
31. **EC-ENV-31: Exam Taken Inside Virtual Machine (VMware, VirtualBox, Hyper-V).** Candidate runs exam inside guest OS while cheating on host OS. *System Action:* Client system checker probes hypervisor CPU artifacts, MAC address vendor blocks, and display driver strings; blocks exam entry if VM detected.
32. **EC-ENV-32: Remote Desktop Software Running (AnyDesk, TeamViewer, RDP).** Remote proxy taking exam via remote control software. *System Action:* Process monitor detects remote desktop service binaries and virtual display driver hooks; terminates session immediately.
33. **EC-ENV-33: Operating System Notification Pop-up (e.g., Windows Update, Slack).** *System Action:* Secure lockdown container intercepts window focus loss; suppresses external window overlay; returns focus to exam window within 500ms; logs event as low-severity system intrusion.
34. **EC-ENV-34: Browser Crash Mid-Exam.** Browser process crashes due to out-of-memory error. *System Action:* Client watchdog service restarts browser wrapper; restores encrypted local session state; candidate resumes exam within 15 seconds without data loss.
35. **EC-ENV-35: Power Outage / Computer Abrupt Shutdown.** Candidate laptop battery dies. *System Action:* Server marks session as `INTERRUPTED_UNEXPECTEDLY`. Upon reboot, candidate undergoes mandatory re-authentication (facial biometric check) before resuming.

### 18.7 System & Scale Edge Cases
36. **EC-SYS-36: 50,000 Candidates Start Exam Simultaneously at 09:00:00 AM.** *System Action:* Ingestion API queues utilize distributed backpressure rate-limiting; identity verification auto-scales horizontally across worker pools to handle login spike without service degradation.
37. **EC-SYS-37: AI Decision Orchestrator Service Timeout.** Orchestrator node experiences memory leak and stops responding. *System Action:* Fallback circuit breaker routes raw telemetry to backup rule engine; flags session for manual proctor queue; alerts DevOps team.
38. **EC-SYS-38: Database Storage Vault Full During Exam.** *System Action:* Storage orchestrator automatically expands dynamic cloud storage volumes; routes incoming video feeds to secondary S3 bucket targets seamlessly.
39. **EC-SYS-39: Malicious Candidate Injects SQL/XSS Payloads into Text Answer Fields.** *System Action:* Input sanitization engine strips HTML/script tags; stores raw text safely without executing malicious code.
40. **EC-SYS-40: Real-time System Time Desynchronization.** Candidate local computer system clock altered manually to manipulate timestamps. *System Action:* Server NTP (Network Time Protocol) authority overrides local client timestamps for all telemetry indexing.

### 18.8 Collusion & Advanced Cheating Edge Cases
41. **EC-COL-41: Coordinated Cross-Candidate Synchronization.** Candidates A, B, and C sit in different rooms and submit answers to identical questions at exact 30-second intervals. *System Action:* Risk Prediction Agent temporal correlation engine detects synchronized inter-candidate event clustering; flags `COORDINATED_COHORT_COLLUSION`.
42. **EC-COL-42: Smart Glasses / Audio Sunglasses (Meta Ray-Ban, Bose Frames).** Candidate wears covert smart glasses streaming screen to remote helper. *System Action:* Vision Guard object classifier identifies smart frame thickness and micro-LED emissions; flags `UNAUTHORIZED_WEARABLE_DEVICE`.
43. **EC-COL-43: Micro Covert Earpiece (Magnetic Ear Canal Speaker).** *System Action:* Collusion Agent acoustic frequency analyzer detects high-frequency leakage from inductive neck loop transmitters; flags `INDUCTIVE_AUDIO_LEAKAGE`.
44. **EC-COL-44: Essay Paraphrasing via AI (ChatGPT / Claude) on Secondary Device.** Candidate reads question off screen, types into phone, transcribes AI output manually into exam. *System Action:* Multi-agent correlation catches Gaze Offscreen (Reading phone) + Typing Rhythm Anomalies + Post-exam Stylometric NLP AI-generated text classification.
45. **EC-COL-45: Morse Code Tapping on Table.** Candidate taps answers to accomplice in room via acoustic vibrations. *System Action:* Audio agent identifies rhythmic impulse pattern (non-speech acoustic signal matching morse cadence); flags `ACOUSTIC_PATTERN_COLLUSION`.

### 18.9 Accommodation & Policy Edge Cases
46. **EC-ACC-46: Diabetic Candidate Monitoring Glucose on Smartphone.** *System Action:* Approved accommodation profile allows smartphone interaction for medical app checks up to 60 seconds every hour; suppresses automatic phone detection termination rule.
47. **EC-ACC-47: Candidate with Severe Strabismus (Crossed Eyes).** *System Action:* Baseline calibration period maps candidate's unique eye alignment; gaze vector model adjusts origin offset accordingly.
48. **EC-ACC-48: Nursing Mother Needs Mandatory Exam Break.** *System Action:* Admin configures "Authorized Break Window"; candidate clicks "Start Authorized Break"; AI telemetry pauses; lockdown maintained; re-authentication required upon return.
49. **EC-ACC-49: Visually Impaired Candidate Using Screen Reader Software.** *System Action:* Secure browser allows verified accessibility API hooks (e.g., NVDA, JAWS); behavioral analyst whitelist suppresses external screen scraping alerts for accessibility tools.
50. **EC-ACC-50: Candidate Suffer Epilepsy / Seizure Mid-Exam.** *System Action:* Vision Guard detects abnormal high-frequency physical convulsive motion + facial absence; Decision Orchestrator immediately triggers `MEDICAL_EMERGENCY_ALERT` on Proctor Dashboard; displays emergency helpline contact.

---

## 19. Assumptions

1. **Client Hardware Minimum Baseline:** Candidates possess a functional desktop/laptop device with at least 4 GB RAM, dual-core CPU, working webcam (minimum 720p resolution), functional microphone, and stable internet connection ($\ge 1.5 \text{ Mbps}$ upload/download).
2. **Browser Modernity:** Candidates run a modern WebRTC-compliant web browser supporting WebAssembly, Encrypted Media Extensions, and HTML5 APIs.
3. **Institutional Authority:** Educational institutions and exam owners possess legal authority and candidate consent to collect webcam, audio, and browser telemetry for the sole purpose of exam proctoring.
4. **Proctor Competency:** Live proctors and supervisors undergo standard training regarding platform dashboard operation and institutional integrity policies.
5. **English/Multilingual Standard Baseline:** Initial NLP collusion models assume English-language test submissions, with additional localized language models provisioned as required.

---

## 20. Constraints

1. **Hardware Constraints:** System must operate effectively without requiring candidates to purchase external 360-degree cameras, secondary webcams, or specialized biometric hardware.
2. **Bandwidth Constraints:** Total upstream network consumption per candidate must not exceed $500 \text{ kbps}$ under normal operational conditions to support candidates in low-bandwidth regions.
3. **Privacy & Legal Constraints:** System must strictly adhere to GDPR prohibitions against automated final decision-making with legal effect (Article 22); an AI risk score *cannot* automatically fail or expel a candidate without human proctor/admin confirmation.
4. **Browser Sandbox Constraints:** Web-based deployment operates within standard web browser security sandboxes, limiting deep OS-level kernel inspection unless the institution mandates an optional installed native client wrapper.
5. **Latency Constraints:** Real-time proctor alert generation must occur within $< 1.5 \text{ seconds}$ from the physical occurrence of the event to enable meaningful live intervention.
6. **Model Size Constraints:** Models deployed for client-side edge inference (e.g., in-browser WebAssembly models) must have a total memory footprint of $< 45 \text{ MB}$ to ensure rapid initialization.

---

## 21. Risk Analysis

| Risk Category | Identified Risk | Risk Severity | Likelihood | Proposed Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Technical** | High telemetry ingestion latency during massive concurrent user spikes. | High | Medium | Implement auto-scaling serverless ingestion edge nodes with dynamic video degradation fallbacks. |
| **AI / Model** | Demographic bias in facial detection / liveness models across different skin tones. | Critical | Medium | Train and benchmark Vision Guard models across diverse multi-ethnic datasets (e.g., FairFace); mandate bias audits achieving $< 0.1\%$ accuracy delta across demographics. |
| **AI / Model** | Model drift over time as candidate cheating techniques evolve. | Medium | High | Establish continuous active learning pipelines; retrain models quarterly using anonymized proctor-validated audit clips. |
| **Privacy / Legal**| Candidate litigation alleging unlawful biometric data storage (e.g., BIPA compliance). | Critical | Low | Enforce explicit pre-exam opt-in consent; store biometric data strictly as ephemeral mathematical vectors; enforce automated purge schedules. |
| **Security** | Man-in-the-middle (MITM) video injection or telemetry packet tampering. | Critical | Low | Sign all telemetry payloads at client edge using session ephemeral keys; enforce TLS 1.3 certificate pinning. |
| **Operational** | Live proctor alert fatigue due to poor threshold tuning by institution. | High | High | Implement default AI Orchestrator alert throttling; present pre-validated high-confidence aggregated alert bundles instead of individual raw signals. |
| **Ethical** | Over-reliance on AI scores leading to unjust candidate disqualification. | Critical | Medium | Enforce mandatory "Human-in-the-Loop" architecture; AI scores act solely as decision-support recommendations for human proctors. |

---

## 22. Future Scope

1. **Voice Biometric Authentication:** Integrating continuous speaker recognition to verify candidate voice identity against a pre-recorded acoustic fingerprint throughout oral exams.
2. **Federated Learning Network:** Enabling institutions to collaboratively train and improve anti-cheating AI models across multi-university networks without sharing raw video or student PII.
3. **Adaptive AI Noise & Light Calibration:** Deep generative models capable of restoring heavily degraded low-light video or separating complex multi-speaker acoustic environments.
4. **Graph Neural Networks (GNN) for Collusion Ring Detection:** Utilizing graph analysis post-exam across thousands of examinees to uncover sophisticated organized cheating networks and exam paper leaks.
5. **LLM-Powered Proctor Investigation Assistant:** An interactive conversational assistant allowing proctors to query exam history in plain language (e.g., *"Show me all instances where Candidate X looked away while typing fast"*).
6. **Mobile Device Dual-Camera Extension:** Allowing candidates to pair their mobile smartphone as an auxiliary side-angle camera stream synced to the primary desktop session.

---

## 23. Questions That Must Be Answered Before Development

> [!IMPORTANT]
> The following architectural, operational, and legal ambiguities **must** be formally resolved by institution leadership, legal counsel, and technical stakeholders prior to commencing engineering development.

### 23.1 Legal & Regulatory Questions
1. *Biometric Consent Framework:* Does the target jurisdiction (e.g., Illinois BIPA, Texas CIPA, EU GDPR) allow commercial facial feature vector extraction for remote proctoring without special state registration?
2. *Automated Action Authorization:* Will the institution permit the system to automatically terminate an exam session upon a high-confidence `CRITICAL` breach, or must **every** termination require explicit manual proctor sign-off to satisfy legal liability rules?
3. *Data Retention Limits:* What is the absolute maximum retention window permitted by institutional legal counsel for storing raw candidate webcam video versus metadata logs?

### 23.2 Operational & Policy Questions
4. *Human Proctor Ratio Targets:* What is the target proctor-to-student monitoring ratio expected by the institution (e.g., 1 proctor per 50 active students vs 1 proctor per 500 active students)?
5. *Accommodation Workflow Approval:* Who possesses authority to upload candidate accommodation whitelists, and what is the SLA for syncing accommodations prior to exam start?
6. *Bandwidth Failure Threshold:* If a candidate experiences persistent poor internet (< 100 kbps) for > 15 minutes, should the system force a session pause or allow completion with post-exam asynchronous video audit?

### 23.3 System & Integration Questions
7. *Client Architecture Model:* Should the platform be built strictly as a **Zero-Install Web Application** (runs entirely in standard Chrome/Firefox/Edge browser) or as an **Installed Native Desktop Container** (Electron/Tauri wrapper allowing deeper OS process lockdown)?
8. *LMS Integration Scope:* Which specific Learning Management Systems (Canvas, Blackboard, Moodle, Brightspace) require native LTI 1.3 Gradebook and Roster sync on Day 1?
9. *Post-Exam Collusion Execution Window:* What is the maximum acceptable latency for post-exam cross-candidate essay collusion batch reports (e.g., within 30 minutes of exam end vs within 6 hours)?

---

## 24. Glossary

- **Biometric Liveness Detection:** Algorithmic verification that a facial image or video originates from a living human subject present at the camera, rather than a printed photo, screen replay, or 3D mask.
- **Client-Side Edge Inference:** Executing artificial intelligence machine learning models directly within the user's local web browser or client application using WebAssembly/WebGL, minimizing cloud latency and bandwidth.
- **Decision Orchestrator:** The core AI agent that collects, correlates, filters, and synthesizes individual telemetry inputs from multiple specialized sub-agents to calculate unified risk scores and explainable justifications.
- **Dwell Time:** In keystroke dynamics, the duration of time a physical key remains pressed down before release.
- **Explainable AI (XAI):** Artificial intelligence techniques that produce clear, human-understandable justifications for their predictions, outputs, and confidence scores.
- **Flight Time:** In keystroke dynamics, the elapsed time between releasing one key and pressing the subsequent key.
- **Gaze Tracking:** Computer vision techniques used to estimate the spatial vector of a candidate's eyes to determine where they are looking relative to the computer display.
- **LTI 1.3 (Learning Tools Interoperability):** A standard technology specification developed by 1EdTech allowing secure integration between web-based learning tools and Learning Management Systems (LMS).
- **Multi-Agent Architecture:** A software paradigm where multiple autonomous, specialized AI modules (agents) interact, share telemetry, and collaborate to solve complex evaluation problems.
- **Neuro-Symbolic AI:** A hybrid AI approach combining deep neural networks (pattern recognition) with symbolic logic (rule-based reasoning) to achieve both high predictive power and explainability.
- **Temporal Decay Function:** A mathematical algorithm that gradually reduces the weighted impact of past isolated anomaly events over time if subsequent behavior remains compliant.
- **Voice Activity Detection (VAD):** Computer algorithms that detect the presence or absence of human speech in an audio stream, separating speech signals from background noise.

---

## 25. Final Product Summary

```
==================================================================================================
                              SENTINEL AI: EXECUTIVE PRODUCT SUMMARY
==================================================================================================

PRODUCT OVERVIEW:
SentinelAI is an autonomous, multi-agent exam integrity platform designed to make remote high-stakes
testing secure, scalable, transparent, and fair. By replacing brittle single-trigger proctoring 
tools with a collaborative ecosystem of specialized AI agents (Vision Guard, Behavioral Analyst, 
Collusion Detection, Risk Prediction, and Decision Orchestrator), SentinelAI evaluates candidate 
intent and multi-modal context in real time.

CORE VALUE PROPOSITION:
• 85% Reduction in False Positives: Multi-agent correlation eliminates isolated trigger alerts.
• 70% Proctoring Cost Savings: Enables 1 proctor supervisor to oversee 100+ active candidates.
• 100% Explainable Decisions: Every flag includes timestamped video/audio proof & natural language reasoning.
• Sub-1.5s Alert Latency: Real-time dynamic risk queueing prioritizes high-risk candidate sessions.
• Universal Compliance: GDPR, FERPA, and WCAG 2.1 AA certified architecture with immutable audit logs.

KEY AI AGENT MODULES:
1. Vision Guard Agent: 3D head pose, gaze tracking, phone/device detection, multi-face/absence detection.
2. Behavioral Analyst Agent: Keystroke dynamics, cursor trajectory analysis, clipboard paste tracking, window focus.
3. Collusion Detection Agent: Acoustic VAD/whisper detection, speech-to-text, post-exam NLP essay similarity.
4. Risk Prediction Agent: Time-series event aggregation with temporal decay mathematical functions.
5. Decision Orchestrator Agent: Central neuro-symbolic brain that correlates signals, filters noise, and scores risk.

TARGET MARKET & DEPLOYMENT:
Built for Higher Education Institutions, Global Professional Licensing Bodies, Government Entrance Exams,
and Enterprise Technical Recruitment. Supports zero-install web browser execution alongside native LMS 
integrations (Canvas, Blackboard, Moodle).

==================================================================================================
```
