# User Service Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `USER_SERVICE_PORT` | No | `4002` | HTTP port for User Service listener |
| `JWT_SECRET` | Yes | `sentinel_ai_jwt_secret_...` | HMAC-SHA256 secret key for verifying access tokens |
| `USER_CACHE_TTL_SECONDS` | No | `300` | Profile and permission cache TTL in seconds |
| `DEFAULT_AVATAR_URL` | No | `https://assets.sentinelai.io/...` | Default avatar image URL |
| `MAX_SEARCH_LIMIT` | No | `100` | Maximum items per search page |
