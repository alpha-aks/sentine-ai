# Institution Service Environment Variables

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `INSTITUTION_SERVICE_PORT` | No | `4003` | HTTP listener port for Institution Service |
| `JWT_SECRET` | Yes | `sentinel_ai_jwt_secret_...` | HMAC-SHA256 secret key for token verification |
| `INSTITUTION_CACHE_TTL_SECONDS` | No | `600` | In-memory cache TTL in seconds |
| `DEFAULT_INSTITUTION_LOGO` | No | `https://assets.sentinelai.io/...` | Default logo asset URL |
| `DEFAULT_PRIMARY_COLOR` | No | `#1E40AF` | Default portal theme primary color |
| `DEFAULT_SECONDARY_COLOR` | No | `#3B82F6` | Default portal theme secondary color |
