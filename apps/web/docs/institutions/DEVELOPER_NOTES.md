# Developer Notes — Institution Management Module

- **Multi-Tenant Isolation**: Pass `X-Institution-Id` header in all requests for tenant context verification.
- **Port**: `institution-service` runs on Port `4003`.
- **Validation**: All form submissions use `zod` schemas matching backend DTO definitions.
