# Question Service Architecture Specification

## Overview

The SentinelAI Question Service manages question banks, question versions, option structures, approval states, seedable PRNG randomizations, and bulk import/export formats. It follows a Clean Architecture design pattern with multi-layer in-memory caching (`QuestionCache`) and domain event dispatch via `@sentinel-ai/event-sdk`.

## Question Approval State Machine

```
               +-----------+
               |   DRAFT   |
               +-----------+
                     |
                     v
             +----------------+
             | PENDING_REVIEW |
             +----------------+
                /          \
               /            \
              v              v
        +----------+    +----------+
        | APPROVED |    | REJECTED |
        +----------+    +----------+
             |
             v
        +----------+
        | ARCHIVED |
        +----------+
```

## Component Diagram

```
+-----------------------------------------------------------------------+
|                            HTTP REST API                              |
|   GET /questions | POST /questions | POST /questions/random etc.      |
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
|                       QUESTION SERVICE LAYER                          |
|  - Randomization Engine (Mulberry32 PRNG & Fisher-Yates)              |
|  - Import/Export Engine (JSON, CSV, Markdown)                         |
|  - Version History Tracker & Approval Workflow Engine                 |
+-----------------------------------------------------------------------+
                 /                         \
                /                           \
               v                             v
+-----------------------------+   +----------------------------------+
|    DATA REPOSITORY LAYER    |   |     EVENT PUBLISHER (EventSDK)   |
| - QuestionEntity            |   | - QuestionCreated                |
| - QuestionVersionEntity     |   | - QuestionApproved               |
| - QuestionBankEntity        |   | - QuestionImported               |
| - QuestionPoolEntity        |   | - QuestionExported               |
| - QuestionOptionEntity      |   | - QuestionBankCreated            |
+-----------------------------+   +----------------------------------+
```
