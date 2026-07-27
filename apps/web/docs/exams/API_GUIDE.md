# API Integration Guide — Exam Service

## Endpoint Contracts (`http://localhost:4003/v1/exams`)

- `GET /v1/exams` — Search exams with query, type, and status filters.
- `POST /v1/exams` — Create a new exam specification draft.
- `GET /v1/exams/:examId` — Get aggregate exam details, sections, rules, policy, schedule, and eligibility.
- `PATCH /v1/exams/:examId` — Update basic metadata.
- `DELETE /v1/exams/:examId` — Delete exam draft.
- `POST /v1/exams/:examId/schedule` — Set schedule start/end bounds.
- `POST /v1/exams/:examId/publish` — Transition exam to PUBLISHED status.
- `POST /v1/exams/:examId/archive` — Transition exam to ARCHIVED status.
- `POST /v1/exams/:examId/duplicate` — Clone exam specification.
- `PATCH /v1/exams/:examId/rules` — Update security lockdown parameters.
- `PATCH /v1/exams/:examId/policy` — Update AI proctoring sensitivity profile.
- `PUT /v1/exams/:examId/sections` — Update section ordering and timers.
- `PATCH /v1/exams/:examId/eligibility` — Update target departments and whitelists.
