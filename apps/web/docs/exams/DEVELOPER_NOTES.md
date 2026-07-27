# Developer Notes — Exam Management Module

## State & Data Architecture
- **State Division**: UI interactions (search query, selected exam rows, active modal states) are managed by Zustand (`store/exam-store.ts`). API queries and lifecycle mutations are handled by `ExamService`.
- **Fail-Safe Response Mapping**: `ExamService.mapExam()` guarantees defensive data mapping to prevent `TypeError` crashes if fields are missing or wrapped in response envelopes.
- **Strict Typing**: All components use strict TypeScript interfaces exported from `@/types/exam`.
