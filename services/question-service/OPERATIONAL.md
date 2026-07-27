# Question Service Operational Notes & Runbook

## Service Healthcheck

- **Endpoint**: `GET /health`
- **Expected Output**:
  ```json
  {
    "status": "UP",
    "service": "sentinel-ai-question-service",
    "timestamp": "2026-07-26T00:00:00.000Z"
  }
  ```

## Event Triggers & Emitters

The service emits the following high-priority domain events:

1. `QuestionCreated` - Dispatched when a new question draft is created.
2. `QuestionUpdated` - Dispatched when content is modified & versioned.
3. `QuestionApproved` - Dispatched when a question passes review.
4. `QuestionArchived` - Dispatched on archiving.
5. `QuestionImported` - Dispatched on completion of bulk import job.
6. `QuestionExported` - Dispatched on export download.
7. `QuestionBankCreated` - Dispatched when a question bank is provisioned.
8. `QuestionPoolUpdated` - Dispatched when a pool is updated.

## Bulk Import/Export Operational Limits

- **Maximum Import Batch Size**: Default 500 questions per single payload (`MAX_IMPORT_BATCH_SIZE`).
- **Memory Buffer Limit**: Express body parser payload size set to 10MB (`express.json({ limit: '10mb' })`).
