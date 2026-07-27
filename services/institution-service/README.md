# SentinelAI Institution Service (`@sentinel-ai/institution-service`)

Production-ready microservice managing academic institutions, multi-tenant isolation, departments, courses, faculty assignments, academic programs, student cohorts/batches, terms/semesters, academic calendars, portal branding, and proctoring configuration policies.

## Features

- **Multi-Tenant Support**: Strict tenant context extraction (`X-Institution-Id` header & JWT claims) with tenant isolation guards (`tenantGuard`).
- **Institution Management**: Full lifecycle management (`UNIVERSITY`, `COLLEGE`, `HIGH_SCHOOL`, `CERTIFICATION_BODY`).
- **Departments & Courses**: Department uniqueness checks and course credit associations.
- **Faculty Management**: Staff assignments to departments and courses.
- **Academic Programs, Batches & Semesters**: Cohort tracking and term schedules.
- **Academic Calendar**: Exam windows, registration periods, and holiday event dispatches.
- **Branding Engine**: Portal logo URLs, primary/secondary colors, custom CSS, and portal subdomains.
- **Proctoring Configuration**: Custom sensitivity profiles (`STRICT`, `STANDARD`, `LOW`, `CUSTOM`), mobile exam toggles, IP whitelisting, and SSO integration settings.
- **Domain Event Publishing**: Emits `InstitutionCreated`, `InstitutionUpdated`, `InstitutionDeleted`, `DepartmentCreated`, `CourseCreated`, `FacultyAssigned`, `AcademicCalendarUpdated`, and `InstitutionConfigurationChanged` events via `@sentinel-ai/event-sdk`.

## Quick Start

```bash
# Run type check
npm run type-check

# Run unit & integration test suite
node --test dist/__tests__/institution-service.test.js

# Start development server
npm run dev

# Build production bundle
npm run build
```

## API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET`  | `/v1/institutions` | Search & list institutions | Yes |
| `POST` | `/v1/institutions` | Provision new institution | Platform Admin |
| `GET`  | `/v1/institutions/:id` | Get full institution details & sub-resources | Yes |
| `PATCH`| `/v1/institutions/:id` | Update institution metadata | Admin (Tenant Guarded) |
| `DELETE`| `/v1/institutions/:id` | Delete institution | Platform Admin |
| `POST` | `/v1/institutions/:id/departments` | Create department | Admin (Tenant Guarded) |
| `GET`  | `/v1/institutions/:id/departments` | List departments | Yes |
| `POST` | `/v1/institutions/:id/courses` | Create course | Admin (Tenant Guarded) |
| `GET`  | `/v1/institutions/:id/courses` | List courses | Yes |
| `POST` | `/v1/institutions/:id/faculty` | Assign faculty member | Admin (Tenant Guarded) |
| `GET`  | `/v1/institutions/:id/faculty` | List faculty members | Yes |
| `GET`  | `/v1/institutions/:id/branding` | Fetch portal branding | Yes |
| `PATCH`| `/v1/institutions/:id/branding` | Update portal branding | Admin (Tenant Guarded) |
| `GET`  | `/v1/institutions/:id/configuration` | Fetch proctoring configuration | Yes |
| `PATCH`| `/v1/institutions/:id/configuration` | Update proctoring configuration | Admin (Tenant Guarded) |
