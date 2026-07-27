# SentinelAI Authentication Module (`@sentinel-ai/web/auth`)

The **SentinelAI Authentication Module** provides a complete enterprise-grade authentication, authorization, session management, and route security architecture.

---

## Capabilities

- **Login & Registration**: Full validation with React Hook Form + Zod, password strength meter, role selector, institution slug mapping, and error banners.
- **Password Reset & Email Verification**: End-to-end support for request, token validation, expiration handling, and success confirmations.
- **Session Management**: Persistent storage in `localStorage` + automatic synchronization with HTTP cookies (`sentinel_access_token`) for Next.js Edge Middleware route guards.
- **Silent JWT Refresh**: Automatic 401 interception in Axios `api-client.ts`, queued request buffering, and seamless token rotation.
- **Security Guards**: `ProtectedRoute`, `PublicRoute`, `RoleGuard`, `PermissionGuard`, `TenantGuard`.
- **Idle Session Auto-Logout**: Automatic session teardown after 15 minutes of inactivity.
