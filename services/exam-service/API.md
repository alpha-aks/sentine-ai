# Exam Service REST API Reference Specification

Base Path: `/v1/exams` or `/exams`

All endpoints require HTTP Bearer JWT Authentication (`Authorization: Bearer <token>`) and multi-tenant header (`X-Institution-Id: <institutionId>`).

---

## 1. Exam CRUD & Lifecycle Endpoints

### `POST /v1/exams`
Create a new exam in `DRAFT` status with default rules, AI proctoring policies, and eligibility criteria.

**Roles Required**: `EXAM_ADMIN`, `PROCTOR_SUPERVISOR`, `COMPLIANCE_OFFICER`

**Request Body**:
```json
{
  "institutionId": "inst_mit",
  "code": "CS101_FINAL",
  "title": "Introduction to Computer Science Final Exam",
  "description": "Comprehensive final examination",
  "type": "FINAL_EXAM",
  "difficultyLevel": "MEDIUM",
  "totalDurationMinutes": 120,
  "passingPercentage": 70,
  "maxAttemptsAllowed": 1,
  "sections": [
    {
      "title": "Multiple Choice",
      "weightPercentage": 40,
      "isMandatory": true,
      "isRandomized": true
    },
    {
      "title": "Coding Section",
      "weightPercentage": 60,
      "isMandatory": true,
      "isRandomized": false
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "exam": {
      "examId": "exam_uuid_123",
      "code": "CS101_FINAL",
      "title": "Introduction to Computer Science Final Exam",
      "status": "DRAFT",
      "totalDurationMinutes": 120
    },
    "sections": [...],
    "rules": {...},
    "policy": {...},
    "eligibility": {...}
  }
}
```

---

### `GET /v1/exams/:examId`
Fetch full exam details including rules, AI proctoring policy, schedule, eligibility criteria, and publication record.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "exam": { ... },
    "sections": [ ... ],
    "rules": { ... },
    "policy": { ... },
    "schedule": { ... },
    "eligibility": { ... }
  }
}
```

---

### `PATCH /v1/exams/:examId`
Update basic exam metadata (title, description, duration, passing percentage).

**Roles Required**: `EXAM_ADMIN`, `PROCTOR_SUPERVISOR`

---

### `DELETE /v1/exams/:examId`
Delete an exam and clear its cached entries.

**Roles Required**: `EXAM_ADMIN`

---

### `GET /v1/exams/search`
Search and filter exams with pagination.

**Query Parameters**:
- `q`: Search string (title or code)
- `type`: `QUIZ` | `MIDTERM` | `FINAL_EXAM` | `CERTIFICATION` | `PRACTICE`
- `status`: `DRAFT` | `SCHEDULED` | `PUBLISHED` | `ACTIVE` | `ENDED` | `CANCELLED` | `ARCHIVED`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

---

## 2. Scheduling & Lifecycle Transitions

### `POST /v1/exams/:examId/schedule`
Schedule an exam window and set grace periods.

**Roles Required**: `EXAM_ADMIN`, `PROCTOR_SUPERVISOR`

**Request Body**:
```json
{
  "startTime": "2026-08-01T09:00:00Z",
  "endTime": "2026-08-01T11:00:00Z",
  "registrationWindowStart": "2026-07-20T00:00:00Z",
  "registrationWindowEnd": "2026-07-31T23:59:59Z",
  "timezone": "America/New_York",
  "lateEntryPolicy": "GRACE_PERIOD",
  "gracePeriodMinutes": 15
}
```

---

### `POST /v1/exams/:examId/publish`
Publish an exam, transitioning status from `SCHEDULED` to `PUBLISHED`.

**Roles Required**: `EXAM_ADMIN`, `COMPLIANCE_OFFICER`

---

### `POST /v1/exams/:examId/activate`
Start active test window (status -> `ACTIVE`). Emits `ExamStarted`.

---

### `POST /v1/exams/:examId/deactivate`
Conclude test session (status -> `ENDED`). Emits `ExamEnded`.

---

### `POST /v1/exams/:examId/duplicate`
Deep clone an existing exam and its associated sub-resources.

---

## 3. Security Rules & AI Policy

### `PATCH /v1/exams/:examId/rules`
Update security rules (browser lock, tab switch detection, copy/paste block, hardware requirements).

### `PATCH /v1/exams/:examId/policy`
Update AI proctoring policy (vision/behavior monitoring, sensitivity profile, risk threshold).

---

## 4. Candidate Eligibility

### `PATCH /v1/exams/:examId/eligibility`
Configure eligible departments, courses, programs, batches, and candidate whitelists/blacklists.

### `GET /v1/exams/:examId/eligibility/:candidateId`
Evaluate if a given candidate is eligible to take the exam.
