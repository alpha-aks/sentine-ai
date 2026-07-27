# SentinelAI Question Service (`@sentinel-ai/question-service`)

Production-ready microservice for question bank management, multi-format question types, version tracking, approval workflows, deterministic PRNG randomization, bulk import/export, and question pool distributions for the SentinelAI platform.

## Features

- **Extensible Question Types**: Full support for 11 core question types:
  - `MCQ_SINGLE` (Multiple Choice Single Answer)
  - `MCQ_MULTIPLE` (Multiple Choice Multiple Answers)
  - `TRUE_FALSE`
  - `FILL_BLANK`
  - `SHORT_ANSWER`
  - `LONG_ANSWER`
  - `NUMERICAL`
  - `CODE_SNIPPET`
  - `FILE_UPLOAD`
  - `MATCHING`
  - `ORDERING`
- **Question Versioning**: Complete version history records saved automatically on every content update.
- **Approval Workflow**: States (`DRAFT` -> `PENDING_REVIEW` -> `APPROVED` -> `REJECTED` -> `ARCHIVED`).
- **Question Bank Management**: Full bank lifecycle, multi-tenant ownership, and deep cloning (`cloneBank`).
- **Question Pool Distributions**: Pool strategies (`RANDOM`, `FIXED`, `WEIGHTED`) with difficulty and topic allocation.
- **Randomization Engine**: Mulberry32 seedable PRNG for deterministic question & option shuffling.
- **Bulk Import / Export**: Native parsing & generation for JSON, CSV, and Markdown formats.
- **Multi-Tenant Support**: Strict tenant boundary isolation (`tenantGuard`) and role-based access control.
- **Domain Event Publishing**: Emits `QuestionCreated`, `QuestionUpdated`, `QuestionDeleted`, `QuestionApproved`, `QuestionArchived`, `QuestionImported`, `QuestionExported`, `QuestionBankCreated`, and `QuestionPoolUpdated` events via `@sentinel-ai/event-sdk`.

## Quick Start

```bash
# Run type check
npm run type-check

# Run unit & integration test suite
node --test dist/__tests__/question-service.test.js

# Start development server
npm run dev

# Build production bundle
npm run build
```

## API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/v1/questions` | Search & list questions | Yes |
| `POST` | `/v1/questions` | Create question | Admin / Supervisor |
| `GET`  | `/v1/questions/:id` | Get question details & version history | Yes |
| `PATCH`| `/v1/questions/:id` | Update question content (creates new version) | Admin (Tenant Guarded) |
| `DELETE`| `/v1/questions/:id` | Delete question | Admin (Tenant Guarded) |
| `PATCH`| `/v1/questions/:id/approval` | Update approval status | Compliance / Admin |
| `POST` | `/v1/questions/banks` | Create question bank | Admin / Supervisor |
| `GET`  | `/v1/questions/banks/:bankId` | Fetch question bank details | Yes |
| `POST` | `/v1/questions/banks/:bankId/clone` | Deep clone question bank | Admin / Supervisor |
| `POST` | `/v1/questions/banks/:bankId/import` | Bulk import (JSON, CSV, Markdown) | Admin / Supervisor |
| `GET`  | `/v1/questions/banks/:bankId/export` | Export bank (JSON, CSV, Markdown) | Yes |
| `POST` | `/v1/questions/pools` | Create question pool | Admin / Supervisor |
| `GET`  | `/v1/questions/random` | Seed-randomized question selection | Yes |
