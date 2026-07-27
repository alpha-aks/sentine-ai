# API Integration Guide — User & Role Management

## Endpoints Summary

### User Service (`http://localhost:4002`)

- `GET /v1/users` — List and search users with pagination and filters
- `GET /v1/users/:userId` — Fetch user details, preferences, and permissions
- `POST /v1/users` — Provision new user account
- `PATCH /v1/users/:userId` — Update user profile
- `PATCH /v1/users/:userId/status` — Update user account status (`ACTIVE`, `SUSPENDED`, etc.)
- `DELETE /v1/users/:userId` — Delete user account
- `POST /v1/users/:userId/roles` — Assign platform role
- `POST /v1/users/:userId/permissions` — Assign granular permission override

---

## Response Normalization

All service responses are wrapped in standard `ApiResponse<T>` envelopes (`{ success: true, data: T, meta: {...} }`). `UserService` unpacks data objects and normalizes primary keys (`userId` ➔ `id`) to ensure UI components receive clean interfaces.
