# Development-Only Mock Data Layer — SentinelAI

## Overview
The Mock Data Layer provides a production-isolated in-memory data engine for local frontend development. When `NEXT_PUBLIC_USE_MOCK_DATA=true`, Axios requests are intercepted transparently without modifying production API contracts or TanStack Query hooks.

## Environment Toggle
- `NEXT_PUBLIC_USE_MOCK_DATA=true`: Intercepts API requests and returns mock datasets.
- `NEXT_PUBLIC_USE_MOCK_DATA=false`: Directs all requests to live backend microservices.
