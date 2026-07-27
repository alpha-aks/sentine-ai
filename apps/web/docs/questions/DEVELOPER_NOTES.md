# Developer Notes — Question Bank Module

## Architecture Principles
- **State Division**: UI interactions (search query, type filters, selected rows) are managed by Zustand (`store/question-store.ts`). Microservice API requests are managed by `QuestionService`.
- **Fail-Safe Response Mapping**: `QuestionService.mapQuestion()` converts raw microservice payloads safely into `QuestionEntity` models to prevent null reference errors.
- **Form Validation**: Form inputs are validated via Zod schemas and React Hook Form.
