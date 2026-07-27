# Authentication Service Architecture Specification

## Overview

The SentinelAI Authentication Service implements a Clean Architecture design pattern separating HTTP routing (`src/controllers`), business domain logic (`src/services`), data access (`src/db`), security & middleware (`src/middleware`), and async event publishing (`src/events`).

## Architectural Diagram

```
+-----------------------------------------------------------------------+
|                            HTTP REST API                              |
|   POST /auth/login | POST /auth/register | POST /auth/refresh etc.   |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                        AUTHENTICATION CONTROLLER                      |
|         Request validation, rate limiting & error handling           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                           AUTH SERVICE LAYER                          |
|  - PBKDF2 Password Hashing        - Account Lockout Counter           |
|  - Refresh Token Rotation         - Multi-Device Session Management   |
|  - JWT Claims & Signing           - Compromise Detection Cascade      |
+-----------------------------------------------------------------------+
                 /                         \
                /                           \
               v                             v
+-----------------------------+   +----------------------------------+
|    DATA REPOSITORY LAYER    |   |     EVENT PUBLISHER (EventSDK)   |
| - UserEntity                |   | - UserRegistered                 |
| - SessionEntity             |   | - UserLoggedIn                   |
| - RefreshTokenEntity        |   | - UserLoggedOut                  |
| - VerificationTokenEntity   |   | - PasswordChanged                |
| - PasswordResetTokenEntity  |   | - EmailVerified                  |
+-----------------------------+   +----------------------------------+
```

## Security Guardrails

1. **Password Hashing**: Cryptographic PBKDF2 with SHA-512 digest, 32-byte salt, and 100,000 iterations via `@sentinel-ai/security`.
2. **Refresh Token Reuse Cascade**: If a revoked refresh token is presented, the system flags a potential theft/replay attack and immediately revokes all active sessions for that user.
3. **Account Lockout**: 5 failed consecutive attempts result in a 15-minute account lock.
4. **JWT Expiration**: Access tokens are hard-capped at 15 minutes to minimize window of vulnerability.
