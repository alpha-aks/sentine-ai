# Submission Service

**SentinelAI** — Production-ready candidate submission and answer lifecycle management microservice.

---

## Overview

The **Submission Service** handles candidate answers during exams with full support for:

- **10 Answer Types**: MCQ Single (`MCQ_SINGLE`), MCQ Multiple (`MCQ_MULTIPLE`), True/False (`TRUE_FALSE`), Short Answer (`SHORT_ANSWER`), Long Answer / Rich Text (`LONG_ANSWER`), Numerical (`NUMERICAL`), Programming / Code (`CODE`, `PROGRAMMING`, `CODE_SNIPPET`), File Upload (`FILE_UPLOAD`), Matching (`MATCHING`), Ordering (`ORDERING`), Fill in the Blank (`FILL_BLANK`).
- **Autosave Engine**: Configurable autosave interval, incremental dirty tracking, sequence numbers, conflict detection, time-spent tracking per question.
- **Answer Versioning**: Complete revision history for every question with save source tracking (`MANUAL`, `AUTOSAVE`, `RECOVERY`, `SYSTEM`).
- **Draft Restoration**: Restore answers from previous drafts or specific version snapshots (`POST /:submissionId/drafts/:questionId/restore`).
- **File Uploads**: File size limits (25MB), MIME validation, SHA-256 content deduplication, virus scan hooks.
- **Code Answers**: Multi-file code answers, programming language identification, line counting, starter templates.
- **Locking & Finalization**: Submission locking, manual submit, candidate pre-submit review phase, auto-submit on timer expiry or disconnect policy.
- **Recovery**: Restores drafts and answers after browser refresh, crash, internet loss, or power failure.
- **Security & Multi-Tenancy**: JWT auth, RBAC, institution isolation, replay protection, tamper detection, security audit logging.

---

## Quick Start

```bash
cd services/submission-service
npm install
npm run build
npm test
npm run dev
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUBMISSION_SERVICE_PORT` | `4007` | HTTP port |
| `JWT_SECRET` | `sentinel_ai_jwt_secret_key_production_grade_32_bytes` | JWT signing secret |
| `SUBMISSION_CACHE_TTL_SECONDS` | `300` | Cache TTL (5 min) |
| `AUTOSAVE_INTERVAL_MS` | `10000` | Client autosave hint (10 sec) |
| `MAX_DRAFT_BATCH_SIZE` | `50` | Max drafts per batch request |
| `MAX_FILE_SIZE_BYTES` | `26214400` | Max file upload size (25 MB) |
| `ALLOWED_MIME_TYPES` | `image/*,application/pdf,application/msword,application/zip,text/*` | Permitted upload MIME types |
| `REQUIRE_ALL_QUESTIONS` | `false` | Block submit if questions remain unanswered |
| `ENABLE_CONFLICT_DETECTION` | `true` | Enable version sequence conflict checks |

---

## State Transition Lifecycle

```
[NOT_STARTED]
      │
      ▼ (startSubmission)
[IN_PROGRESS] ◄──────► [AUTOSAVED (Drafts)]
      │                     │
      ├─────────────────────┼─────────────────────┐
      ▼ (lockSubmission)    ▼ (submitFinal)       ▼ (autoSubmit)
   [LOCKED]            [SUBMITTED]          [AUTO_SUBMITTED]
                            │                     │
                            └──────────┬──────────┘
                                       ▼ (export)
                                   [EXPORTED]
```

---

## API Reference

### Base URL
```
/v1/submissions
```

### Lifecycle, Answers & Candidate Portal Endpoints

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| `POST` | `/` | CANDIDATE | Initialize submission (`SubmissionStarted`) |
| `GET` | `/:submissionId` | Any | Get submission details |
| `GET` | `/:submissionId/status` | Any | Get current submission status and counts |
| `GET` | `/:submissionId/history` | Any | Get complete submission history, audits, and versions |
| `GET` | `/session/:sessionId` | Any | Get submission by session ID |
| `GET` | `/exam/:examId` | PROCTOR+ | List submissions for exam |
| `POST` | `/:submissionId/answers` | CANDIDATE | Save answer manually (`AnswerSaved`/`AnswerUpdated`) |
| `PUT` | `/:submissionId/answers/:questionId` | CANDIDATE | Alias: Update answer manually |
| `POST` | `/:submissionId/drafts` | CANDIDATE | Save candidate draft (`DraftSaved`) |
| `POST` | `/:submissionId/answers/draft` | CANDIDATE | Alias: Save candidate draft |
| `POST` | `/:submissionId/autosave` | CANDIDATE | Batch autosave candidate drafts (`AutosaveCompleted`) |
| `POST` | `/:submissionId/answers/batch-draft` | CANDIDATE | Alias: Batch autosave candidate drafts |
| `POST` | `/:submissionId/drafts/:questionId/restore` | CANDIDATE | Restore draft or version for a question |
| `POST` | `/:submissionId/answers/:questionId/restore-draft` | CANDIDATE | Alias: Restore draft or version for a question |
| `GET` | `/:submissionId/answers/:questionId/versions` | PROCTOR+ | Get answer version history |
| `GET` | `/:submissionId/review` | CANDIDATE | Pre-submit review check (`SubmissionReviewed`) |
| `POST` | `/:submissionId/review` | CANDIDATE | Confirm pre-submit review |

### File Uploads & Submissions

| Method | Path | Auth Required | Description |
|--------|------|--------------|-------------|
| `POST` | `/:submissionId/files` | CANDIDATE | Upload file attachment |
| `GET` | `/files/:fileId` | Any | Get file metadata |
| `POST` | `/:submissionId/submit` | CANDIDATE | Final manual submission (`SubmissionFinalized`) |
| `POST` | `/:submissionId/auto-submit` | PROCTOR+ | Auto-submit submission (`SubmissionAutoSubmitted`) |
| `POST` | `/:submissionId/lock` | PROCTOR+ | Lock submission (`SubmissionLocked`) |
| `GET` | `/:submissionId/recovery` | Any | Get recovery snapshot (`SubmissionRecovered`) |
| `POST` | `/:submissionId/resume` | Any | Alias: Get recovery snapshot |
| `GET` | `/:submissionId/validate` | Any | Pre-submit validation check |
| `GET` | `/:submissionId/analytics` | PROCTOR+ | Submission completion analytics |

---

## Events Published

- `SubmissionStarted` — Fired when submission initialized
- `AnswerSaved` — Fired when answer saved manually
- `AnswerUpdated` — Fired when an existing answer is updated
- `DraftSaved` — Fired when draft autosaved
- `AutosaveCompleted` — Fired when batch autosave completes
- `SubmissionReviewed` — Fired when candidate completes pre-submit review
- `SubmissionLocked` — Fired when submission locked
- `SubmissionFinalized` — Fired when candidate manually submits
- `SubmissionAutoSubmitted` — Fired on timer expiry/disconnect auto-submit
- `SubmissionRecovered` — Fired when recovery snapshot requested
- `SubmissionExported` — Fired when submission exported

## Events Consumed

- `SessionStarted` — Auto-starts submission if not already started
- `SessionEnded` — Auto-submits unsubmitted submission on session end
- `SessionRecovered` — Logs recovery event
- `ExamEnded` — Auto-submits all active IN_PROGRESS submissions for exam
- `ExamCancelled` — Locks submissions for cancelled exam
