# Question Service REST API Reference Specification

Base Path: `/v1/questions` or `/questions`

All endpoints require HTTP Bearer JWT Authentication (`Authorization: Bearer <token>`) and multi-tenant header (`X-Institution-Id: <institutionId>`).

---

## 1. Question CRUD & Versioning Endpoints

### `POST /v1/questions`
Create a new question in `DRAFT` status with option parameters.

**Roles Required**: `EXAM_ADMIN`, `PROCTOR_SUPERVISOR`, `COMPLIANCE_OFFICER`

**Request Body**:
```json
{
  "bankId": "bank_uuid_123",
  "institutionId": "inst_mit",
  "type": "MCQ_SINGLE",
  "title": "Time Complexity of QuickSort",
  "body": "What is the average-case time complexity of QuickSort?",
  "difficulty": "MEDIUM",
  "marks": 3,
  "negativeMarks": 0.5,
  "options": [
    { "text": "O(n log n)", "isCorrect": true, "explanation": "Average case is O(n log n)" },
    { "text": "O(n^2)", "isCorrect": false },
    { "text": "O(n)", "isCorrect": false }
  ]
}
```

---

### `GET /v1/questions/:questionId`
Fetch full question details, options list, and complete version history.

---

### `PATCH /v1/questions/:questionId`
Update question content. Increments `version` and saves version history record.

---

### `DELETE /v1/questions/:questionId`
Delete a question and purge cache entries.

---

### `PATCH /v1/questions/:questionId/approval`
Update question approval status (`APPROVED`, `REJECTED`, `ARCHIVED`).

---

## 2. Question Banks & Pools

### `POST /v1/questions/banks`
Create a new question bank.

### `POST /v1/questions/banks/:bankId/clone`
Deep clone a question bank and all contained questions.

### `POST /v1/questions/pools`
Create a question pool specifying distribution rules (`EASY`, `MEDIUM`, `HARD`).

---

## 3. Seeded Randomization Engine

### `GET /v1/questions/random`
Fetch seed-randomized question selections.

**Query Parameters**:
- `bankId`: Question bank ID
- `count`: Number of questions to return (default: 10)
- `seed`: Random seed for deterministic regeneration (e.g. candidate session ID)
- `randomizeOptions`: `true` | `false`

---

## 4. Bulk Import & Export

### `POST /v1/questions/banks/:bankId/import`
Bulk import questions in JSON, CSV, or Markdown format.

### `GET /v1/questions/banks/:bankId/export`
Export question bank content in JSON, CSV, or Markdown format.
