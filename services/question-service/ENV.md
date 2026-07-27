# Question Service Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `QUESTION_SERVICE_PORT` | No | `4005` | HTTP listener port for Question Service |
| `JWT_SECRET` | Yes | `sentinel_ai_jwt_secret_...` | HMAC-SHA256 secret key for token verification |
| `QUESTION_CACHE_TTL_SECONDS` | No | `300` | In-memory cache TTL in seconds |
| `MAX_IMPORT_BATCH_SIZE` | No | `500` | Maximum questions per single import payload |
