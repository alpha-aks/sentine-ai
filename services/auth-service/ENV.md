# Authentication Service Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `AUTH_SERVICE_PORT` | No | `4001` | HTTP port for the Auth Service listener |
| `JWT_SECRET` | Yes | `sentinel_ai_jwt_secret_...` | HMAC-SHA256 secret key for signing JWT tokens |
| `JWT_EXPIRES_IN_SECONDS` | No | `900` | Access token lifespan in seconds (15 min) |
| `REFRESH_TOKEN_SECRET` | Yes | `sentinel_ai_refresh_...` | Secret key for signing refresh tokens |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | No | `7` | Refresh token lifespan in days |
| `MAX_FAILED_LOGIN_ATTEMPTS` | No | `5` | Failed attempts before account lockout |
| `LOCKOUT_DURATION_MINUTES` | No | `15` | Lockout duration in minutes |
| `EMAIL_VERIFICATION_TTL_HOURS` | No | `24` | Email verification token TTL |
| `PASSWORD_RESET_TTL_HOURS` | No | `1` | Password reset token TTL |
| `PBKDF2_ITERATIONS` | No | `100000` | PBKDF2 hash iterations |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
