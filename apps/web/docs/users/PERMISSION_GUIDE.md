# Permission & RBAC Guide

## Role Hierarchy

1. **`EXAM_ADMIN`** (Platform Administrator)
   - Full global access (`user:*`, `role:manage`, `institution:manage`, `exam:*`, `system:*`).

2. **`PROCTOR_SUPERVISOR`** (Proctoring Supervisor)
   - Read users, monitor and terminate live sessions, export integrity reports.

3. **`LIVE_PROCTOR`** (Live Invigilator)
   - Monitor real-time candidate webcam feeds and AI violation alert streams.

4. **`COMPLIANCE_OFFICER`** (Compliance & Audit Officer)
   - Read users, inspect audit logs, and export legal compliance reports.

5. **`CANDIDATE`** (Student / Examinee)
   - Take assigned proctored assessments and view score submissions.
