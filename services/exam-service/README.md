# SentinelAI Exam Service (`@sentinel-ai/exam-service`)

Production-ready microservice managing exam creation, scheduling, security rules, AI proctoring policies, candidate eligibility, sections, templates, and full lifecycle transitions for the SentinelAI platform.

## Features

- **Exam Lifecycle Management**: Transition exams across states (`DRAFT` -> `SCHEDULED` -> `PUBLISHED` -> `ACTIVE` -> `ENDED` / `CANCELLED` / `ARCHIVED`).
- **Exam Templates**: Template instantiation and deep-cloning (`duplicateExam`).
- **Exam Scheduling**: Define test windows, timezones, late entry grace periods (`GRACE_PERIOD`, `STRICT_NO_LATE`), and registration periods.
- **Security Rules Engine**: Configure browser locking, fullscreen enforcement, tab switch tracking, copy/paste blocking, multi-monitor prevention, VM detection, devtools blocking, and hardware requirements (camera, mic, screen sharing).
- **AI Proctoring Configuration**: Fine-tune vision/behavior monitoring, collusion detection, risk thresholds, alert sensitivity (`STRICT`, `STANDARD`, `LOW`, `CUSTOM`), recording retention, and human review flags.
- **Section Management**: Multi-section support with timing, question pool associations, section weights, and randomization rules.
- **Candidate Eligibility Engine**: Granular eligibility matching (department, course, program, batch) and candidate whitelist/blacklist evaluation.
- **Multi-Tenant Support**: Strict tenant context extraction (`X-Institution-Id` & JWT claims) with tenant isolation guards (`tenantGuard`).
- **Domain Event Publishing**: Emits `ExamCreated`, `ExamUpdated`, `ExamDeleted`, `ExamPublished`, `ExamArchived`, `ExamScheduled`, `ExamStarted`, `ExamEnded`, `ExamCancelled`, and `ExamConfigurationChanged` events via `@sentinel-ai/event-sdk`.

## Quick Start

```bash
# Run type check
npm run type-check

# Run unit & integration test suite
node --test dist/__tests__/exam-service.test.js

# Start development server
npm run dev

# Build production bundle
npm run build
```

## API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/v1/exams` | Search & list exams | Yes |
| `POST` | `/v1/exams` | Create exam with default rules/policy | Admin / Supervisor |
| `GET`  | `/v1/exams/:id` | Get full exam details & sub-resources | Yes |
| `PATCH`| `/v1/exams/:id` | Update exam metadata | Admin (Tenant Guarded) |
| `DELETE`| `/v1/exams/:id` | Delete exam | Admin (Tenant Guarded) |
| `POST` | `/v1/exams/:id/schedule` | Schedule exam window & grace period | Admin / Supervisor |
| `POST` | `/v1/exams/:id/publish` | Publish exam for candidates | Admin / Compliance |
| `POST` | `/v1/exams/:id/activate` | Start active exam session | Admin / Supervisor |
| `POST` | `/v1/exams/:id/deactivate` | Conclude active exam session | Admin / Supervisor |
| `POST` | `/v1/exams/:id/duplicate` | Deep-clone exam & rules | Admin / Supervisor |
| `PATCH`| `/v1/exams/:id/rules` | Update security rules | Admin / Supervisor |
| `PATCH`| `/v1/exams/:id/policy` | Update AI proctoring policy | Admin / Compliance |
| `PUT`  | `/v1/exams/:id/sections` | Re-configure sections & weights | Admin / Supervisor |
| `PATCH`| `/v1/exams/:id/eligibility` | Update eligibility criteria | Admin / Supervisor |
| `GET`  | `/v1/exams/:id/eligibility/:candidateId` | Check candidate eligibility | Yes |
