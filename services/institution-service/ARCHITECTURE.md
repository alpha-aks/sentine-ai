# Institution Service Architecture Specification

## Overview

The SentinelAI Institution Service implements a Multi-Tenant Clean Architecture pattern. It guarantees complete tenant data isolation across universities, colleges, and certification bodies using `extractTenantContext` and `tenantGuard` middlewares.

## Architectural Diagram

```
+-----------------------------------------------------------------------+
|                            HTTP REST API                              |
|   GET /institutions | POST /institutions/:id/departments etc.        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    MULTI-TENANT ISOLATION MIDDLEWARE                  |
|  - Extract X-Institution-Id / JWT Claims                              |
|  - TenantGuard: Verifies tenant ID against resource target            |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      INSTITUTION CONTROLLER LAYER                     |
|          Input validation, DTO transformation & Error mapping        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      INSTITUTION SERVICE LAYER                        |
|  - Department Uniqueness Verification  - Course & Credit Validation   |
|  - Branding Asset Resolution          - Proctoring Sensitivity Config |
+-----------------------------------------------------------------------+
                 /                         \
                /                           \
               v                             v
+-----------------------------+   +----------------------------------+
|    DATA REPOSITORY LAYER    |   |     EVENT PUBLISHER (EventSDK)   |
| - Institution               |   | - InstitutionCreated             |
| - Department, Course        |   | - DepartmentCreated              |
| - Faculty, Program, Batch   |   | - FacultyAssigned                |
| - Branding & Configuration  |   | - InstitutionConfigurationChanged|
+-----------------------------+   +----------------------------------+
```
