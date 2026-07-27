# Exam Service Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `EXAM_SERVICE_PORT` | No | `4004` | HTTP listener port for Exam Service |
| `JWT_SECRET` | Yes | `sentinel_ai_jwt_secret_...` | HMAC-SHA256 secret key for token verification |
| `EXAM_CACHE_TTL_SECONDS` | No | `300` | In-memory cache TTL in seconds |
| `DEFAULT_GRACE_PERIOD_MINUTES` | No | `15` | Default late entry grace period in minutes |
| `MAX_EXAM_DURATION_MINUTES` | No | `480` | Maximum allowed duration for a single exam |
