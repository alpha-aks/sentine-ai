# User Service Architecture Specification

## Overview

The SentinelAI User Service manages user profiles, role assignments, permissions, preferences, and multi-tenant institution associations. It uses a Clean Architecture design pattern and integrates an in-memory caching layer (`UserCache`) alongside async event handlers.

## Component Flow Diagram

```
+-------------------------------------------------------------------+
|                        HTTP REST API ROUTER                       |
|         GET /users/me | GET /users | PATCH /users/:id etc.       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                           USER CONTROLLER                         |
|     Input Validation, DTO Mapping & HTTP Response Wrapping       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                             USER SERVICE                          |
|  - Profile CRUD & Search         - RBAC Role Hierarchy Checks    |
|  - Effective Permission Logic    - Multi-Tenant Institution Links|
+-------------------------------------------------------------------+
             /                    |                    \
            /                     |                     \
           v                      v                      v
+------------------+     +------------------+    +--------------------+
|  IN-MEMORY CACHE |     |  DATA REPOSITORY |    |  EVENT PUBLISHER   |
| - Profiles       |     | - UserEntity     |    | - UserCreated      |
| - Preferences    |     | - PreferenceEntity|   | - UserUpdated      |
| - Permissions    |     | - RoleHistory    |    | - UserRoleChanged  |
+------------------+     | - Institution    |    +--------------------+
                         +------------------+
```

## Effective Permission Calculation Model

Effective user permissions are computed on-demand and cached:

$$\text{EffectivePermissions} = \left( \text{ROLE\_PERMISSIONS}[\text{user.role}] \cup \text{GrantedOverrides} \right) \setminus \text{RevokedOverrides}$$
