# SentinelAI Authentication Service (`@sentinel-ai/auth-service`)

Production-ready microservice for enterprise identity management, JWT authentication, role-based access control (RBAC), multi-device session tracking, refresh token rotation, and audit event publishing for the SentinelAI platform.

## Features

- **User Registration**: Password complexity checks, duplicate prevention, and verification email dispatch.
- **JWT & Session Auth**: Short-lived JWT Access Tokens (15 min) paired with Refresh Tokens (7 days).
- **Refresh Token Rotation**: Automatic token rotation with instant security cascade revocation on detected reuse of compromised tokens.
- **Account Lockout & Brute-Force Defense**: Configurable failed login thresholds (default 5 attempts -> 15 min lockout).
- **Password Lifecycle**: Self-service change password, secure token-based forgot/reset password flows, and automated session invalidation.
- **Email Verification**: Token-based email address verification.
- **Multi-device Sessions**: Query active device sessions and support single/mass session termination.
- **MFA Ready**: Architecture support for 6-digit TOTP / Multi-Factor Authentication.
- **Role & Permission Management**: Integrates `@sentinel-ai/security` for granular RBAC & wildcard permission checks (`exam:*`, `session:*`).
- **Domain Event Publishing**: Emits `UserRegistered`, `UserLoggedIn`, `UserLoggedOut`, `PasswordChanged`, `PasswordResetRequested`, and `EmailVerified` events via `@sentinel-ai/event-sdk`.

## Quick Start

```bash
# Run type check
npm run type-check

# Run unit & integration test suite
node --test src/__tests__/auth-service.test.ts

# Start development server
npm run dev

# Build production bundle
npm run build
```

## Service Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/v1/auth/register` | Register user account | No |
| `POST` | `/v1/auth/login` | Authenticate & issue JWT pair | No |
| `POST` | `/v1/auth/refresh` | Exchange refresh token with rotation | No |
| `POST` | `/v1/auth/logout` | Terminate session & revoke tokens | Yes |
| `POST` | `/v1/auth/email/verify` | Verify email token | No |
| `POST` | `/v1/auth/password/forgot` | Initiate password reset flow | No |
| `POST` | `/v1/auth/password/reset` | Complete password reset via token | No |
| `POST` | `/v1/auth/password/change` | Authenticated password update | Yes |
| `POST` | `/v1/auth/mfa/verify` | Verify 6-digit TOTP MFA code | No |
| `GET`  | `/v1/auth/me` | Fetch authenticated user profile | Yes |
| `GET`  | `/v1/auth/sessions` | List active user device sessions | Yes |
| `DELETE` | `/v1/auth/sessions/:id` | Terminate specific device session | Yes |
| `DELETE` | `/v1/auth/sessions` | Revoke all active device sessions | Yes |
