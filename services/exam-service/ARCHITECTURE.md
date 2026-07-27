# Exam Service Architecture Specification

## Overview

The SentinelAI Exam Service manages exam definitions, rules, AI proctoring policies, candidate eligibility, scheduling, and lifecycle state transitions. It utilizes a Clean Architecture pattern integrated with an in-memory caching layer (`ExamCache`) and async event publishing via `@sentinel-ai/event-sdk`.

## Exam Lifecycle State Machine

```
               +-----------+
               |   DRAFT   |
               +-----------+
                     |
                     v
               +-----------+
               | SCHEDULED |
               +-----------+
                     |
                     v
               +-----------+
               | PUBLISHED |
               +-----------+
                  /     \
                 /       \
                v         v
         +--------+     +-----------+
         | ACTIVE |---->| CANCELLED |
         +--------+     +-----------+
             |
             v
         +--------+
         | ENDED  |
         +--------+
             |
             v
         +----------+
         | ARCHIVED |
         +----------+
```

## Component Architecture

```
+-----------------------------------------------------------------------+
|                            HTTP REST API                              |
|   GET /exams | POST /exams | POST /exams/:id/schedule etc.            |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    MULTI-TENANT ISOLATION MIDDLEWARE                  |
|  - Extract X-Institution-Id / JWT Claims                              |
|  - TenantGuard: Verifies tenant ID matching                           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                        EXAM CONTROLLER LAYER                          |
|         Request validation, DTO transformation & Error mapping        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          EXAM SERVICE LAYER                           |
|  - Lifecycle State Machine        - Candidate Eligibility Engine      |
|  - Security Rules Validation      - AI Proctoring Policy Configuration|
+-----------------------------------------------------------------------+
                 /                         \
                /                           \
               v                             v
+-----------------------------+   +----------------------------------+
|    DATA REPOSITORY LAYER    |   |     EVENT PUBLISHER (EventSDK)   |
| - ExamEntity                |   | - ExamCreated                    |
| - ExamSectionEntity         |   | - ExamPublished                  |
| - ExamRuleEntity            |   | - ExamScheduled                  |
| - ExamPolicyEntity          |   | - ExamStarted / ExamEnded        |
| - ExamScheduleEntity        |   | - ExamConfigurationChanged       |
| - ExamEligibilityEntity     |   +----------------------------------+
+-----------------------------+
```
