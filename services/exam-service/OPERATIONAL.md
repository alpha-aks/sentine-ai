# Exam Service Operational Notes & Runbook

## Service Architecture Overview

The `@sentinel-ai/exam-service` runs as an Express microservice handling exam lifecycle transitions, security rules, AI proctoring policies, candidate eligibility, scheduling, and event publishing via `@sentinel-ai/event-sdk`.

## Healthcheck

- **Endpoint**: `GET /health`
- **Expected Output**:
  ```json
  {
    "status": "UP",
    "service": "sentinel-ai-exam-service",
    "timestamp": "2026-07-26T00:00:00.000Z"
  }
  ```

## Event Triggers & Emitters

The service emits the following high-priority domain events:

1. `ExamCreated` - Dispatched when a new exam draft is created.
2. `ExamUpdated` - Dispatched on metadata changes.
3. `ExamScheduled` - Dispatched when an exam window is configured.
4. `ExamPublished` - Dispatched when administrative approval is granted.
5. `ExamStarted` - Dispatched when an exam goes live.
6. `ExamEnded` - Dispatched when an exam window terminates.
7. `ExamCancelled` - Dispatched when an exam is cancelled.
8. `ExamConfigurationChanged` - Dispatched on security rule or AI policy updates.

## Performance & Caching Guidelines

- **In-Memory Cache TTL**: Default 300 seconds (`EXAM_CACHE_TTL_SECONDS`).
- **Cache Eviction**: Automated on all write/update operations via `ExamCache.invalidateAll(examId)`.
