# API Integration Guide — Institution Service

All institution calls target the microservice on `http://localhost:4003/v1/institutions`.

---

## Endpoint Contract Summary

| HTTP Method | Route | Description | Auth Required |
|-------------|-------|-------------|---------------|
| `GET` | `/v1/institutions` | List all tenant institutions | Yes |
| `POST` | `/v1/institutions` | Provision new academic institution | Platform Admin |
| `GET` | `/v1/institutions/:id` | Get institution details | Yes |
| `PATCH` | `/v1/institutions/:id` | Update metadata | Admin |
| `DELETE` | `/v1/institutions/:id` | Delete institution | Platform Admin |
| `GET` | `/v1/institutions/:id/departments` | List departments | Yes |
| `POST` | `/v1/institutions/:id/departments` | Create department | Admin |
| `GET` | `/v1/institutions/:id/courses` | List courses | Yes |
| `POST` | `/v1/institutions/:id/courses` | Create course | Admin |
| `GET` | `/v1/institutions/:id/branding` | Fetch branding | Yes |
| `PATCH` | `/v1/institutions/:id/branding` | Update branding | Admin |
| `GET` | `/v1/institutions/:id/configuration` | Fetch proctoring settings | Yes |
| `PATCH` | `/v1/institutions/:id/configuration` | Update proctoring settings | Admin |
