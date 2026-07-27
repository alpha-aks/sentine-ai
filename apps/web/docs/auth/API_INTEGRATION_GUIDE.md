# API Integration Guide — Authentication Service

All authentication API calls target the `auth-service` microservice on `http://localhost:4001/v1/auth`.

---

## Endpoint Contract Summary

| HTTP Method | Route | Description | Auth Required |
|-------------|-------|-------------|---------------|
| `POST` | `/v1/auth/register` | Register new user account | No |
| `POST` | `/v1/auth/login` | Authenticate user & return JWT pair | No |
| `POST` | `/v1/auth/refresh` | Rotate access & refresh tokens | No |
| `POST` | `/v1/auth/password/forgot` | Request password reset token | No |
| `POST` | `/v1/auth/password/reset` | Submit new password using reset token | No |
| `POST` | `/v1/auth/email/verify` | Verify email address using token | No |
| `POST` | `/v1/auth/logout` | Revoke session & refresh token | Yes |
| `GET`  | `/v1/auth/me` | Fetch active user session profile | Yes |
