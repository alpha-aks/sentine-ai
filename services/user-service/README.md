# SentinelAI User Service (`@sentinel-ai/user-service`)

Production-ready microservice for user identity metadata, profile updates, preferences, role assignments, custom permission overrides, account status management, institution membership, and domain event processing.

## Features

- **User Profile Management**: Full profile creation, updates, metadata, medical accommodations, and deletion.
- **Preferences**: Personalized settings for theme (`LIGHT`, `DARK`, `SYSTEM`), language, timezone, accessibility (high-contrast, font size), and notification channels (email, SMS, in-app).
- **Role Management (RBAC)**: Role assignment with hierarchy enforcement (`CANDIDATE`, `LIVE_PROCTOR`, `PROCTOR_SUPERVISOR`, `EXAM_ADMIN`, `COMPLIANCE_OFFICER`).
- **Permission Overrides**: Custom per-user permission grants/revocations extending base role permissions.
- **Account Statuses**: `ACTIVE`, `INACTIVE`, `SUSPENDED`, and `DEACTIVATED` account controls.
- **Institution Memberships**: Multi-tenancy support for associating users with academic institutions and departments.
- **In-Memory Caching**: Multi-layer caching for User Profiles, Permissions, and Preferences with automatic cache invalidation on mutations.
- **Event-Driven Architecture**:
  - **Publishes**: `UserCreated`, `UserUpdated`, `UserDeleted`, `UserRoleChanged`, `UserPreferenceChanged`, `UserActivated`, `UserDeactivated`.
  - **Consumes**: `UserRegistered`, `EmailVerified` from Authentication Service.

## Quick Start

```bash
# Run type check
npm run type-check

# Run unit & integration test suite
node --test dist/__tests__/user-service.test.js

# Start development server
npm run dev

# Build production bundle
npm run build
```

## API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/v1/users/me` | Fetch authenticated user profile | Yes |
| `GET`  | `/v1/users` | Search & list users (Filterable, Paginated) | Yes |
| `POST` | `/v1/users` | Provision new user profile | Admin / Compliance |
| `GET`  | `/v1/users/:userId` | Get user profile by ID | Yes |
| `PATCH`| `/v1/users/:userId` | Update user profile metadata | Yes |
| `DELETE`| `/v1/users/:userId` | Delete user profile | Admin Only |
| `GET`  | `/v1/users/:userId/preferences` | Get user preferences | Yes |
| `PATCH`| `/v1/users/:userId/preferences` | Update user preferences | Yes |
| `POST` | `/v1/users/:userId/roles` | Assign role with hierarchy check | Admin / Compliance |
| `POST` | `/v1/users/:userId/permissions` | Grant/Revoke custom permission override | Admin Only |
| `GET`  | `/v1/users/:userId/permissions` | Calculate effective user permissions | Yes |
| `PATCH`| `/v1/users/:userId/status` | Change user account status | Admin / Compliance |
| `POST` | `/v1/users/:userId/institutions` | Associate user with institution | Admin Only |
