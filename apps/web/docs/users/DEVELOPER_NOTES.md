# Developer Notes — User & Role Management

## Architecture Principles

- **State Division**: UI interactions (search text, selected rows, active modals) are managed by Zustand (`store/user-store.ts`). API queries and mutations are managed by service layers.
- **Fail-Safe Defensive Mapping**: `UserService` handles response envelopes (`{ items: [], total: 0 }` vs flat arrays) gracefully to prevent runtime `TypeError` crashes.
- **Form Validation**: All input forms use Zod schemas coupled with React Hook Form.
