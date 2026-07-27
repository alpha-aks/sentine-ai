# SentinelAI Candidate Submission UI & Integration Architecture Guide

## Overview

The **Candidate Submission UI** provides a hardened, resilient, production-ready candidate examination environment inside `@sentinel-ai/web`. It integrates directly with the backend **Submission Service** (port 4007) and **Candidate Session Service**.

---

## 1. Complete Submission Lifecycle Architecture

```
[Candidate Workspace UI]
         │
         ├── Authentication (sentinel_access_token) + Multi-Tenancy (x-institution-id)
         │
         ├── TanStack Query (v5) ──► submissionService (REST API port 4007)
         │                                ├── POST /v1/submissions (start/restore)
         │                                ├── PUT /v1/submissions/:id/answers/:qId (commit answer)
         │                                ├── POST /v1/submissions/:id/drafts (debounced autosave)
         │                                ├── POST /v1/submissions/:id/autosave (batch flush queue)
         │                                └── POST /v1/submissions/:id/submit (cryptographic lock)
         │
         └── Zustand Store (submission-store.ts)
                 ├── activeQuestionId & markedForReview
                 ├── offlineQueue (buffered drafts during network disconnect)
                 └── sequenceTracker (monotonically incrementing draft sequence IDs)
```

---

## 2. Autosave & Recovery Strategy

- **Debounce Window**: 1500ms debounce after user input change.
- **Offline Buffering**: When `window.navigator.onLine` is false or autosave encounters a network interruption, drafts are queued in `useSubmissionStore.offlineQueue`.
- **Reconnect Flush**: Upon network reconnection (`online` event), `flushOfflineQueue()` flushes buffered drafts in a single `POST /v1/submissions/:id/autosave` batch request.
- **Sequence Numbering**: Each question draft tracks a monotonic `sequenceNumber` to eliminate race conditions and out-of-order writes.

---

## 3. Security & Multi-Tenancy

- **Bearer Token Auth**: Every request includes `Authorization: Bearer <token>` from local session storage.
- **Tenant Isolation**: Every request includes `x-institution-id: <tenantId>` to enforce multi-tenant separation.
- **Read-Only Locking**: Upon final submission or `TIMER_EXPIRED` auto-submission, the backend locks the entity (`isLocked: true`). Attempts to save answers throw `SUBMISSION_LOCKED`.
- **Multi-Tab Sync**: Uses `window.addEventListener('storage')` listening for `sentinel_submission_locked_<id>` to automatically lock all open tabs.

---

## 4. File Upload Validation Rules

- **Maximum Size**: 25 MB (`MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024`).
- **Zero-Byte Filter**: Throws `SUBMISSION_INVALID_FILE` if file size is 0 bytes.
- **Allowed Extensions**: `.pdf`, `.docx`, `.zip`, `.png`, `.jpg`, `.jpeg`.
- **Progress Tracking**: Real-time progress bar rendering during payload staging.
