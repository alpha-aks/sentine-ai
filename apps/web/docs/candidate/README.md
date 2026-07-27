# Candidate Portal Module — SentinelAI

## Overview
The Candidate Portal module provides the complete examination experience for students taking online proctored assessments. It includes student dashboard overviews, pre-exam waiting rooms, hardware diagnostics (camera, mic, WebRTC, speed), identity verification UI, live exam runners, question palettes, proctoring violation alerts, session recovery, and submission flows.

## Included Pages & Routes
- `/candidate`: Candidate Dashboard home with registered exams and quick join shortcuts.
- `/candidate/exams`: List of registered upcoming examinations.
- `/candidate/exams/[id]`: Exam detail hub.
- `/candidate/waiting-room/[sessionId]`: Pre-exam waiting room and schedule verification.
- `/candidate/system-check/[sessionId]`: System compatibility diagnostics (camera, mic, WebRTC, speed, resolution, cookies).
- `/candidate/identity/[sessionId]`: Live face snapshot capture and identity verification.
- `/candidate/instructions/[sessionId]`: Honor code instructions and consent checklist.
- `/candidate/exam/[sessionId]`: Secure Live Examination runner environment.
- `/candidate/submission`: Final submission receipt confirmation screen.
- `/candidate/history`: Completed exam session logs.
