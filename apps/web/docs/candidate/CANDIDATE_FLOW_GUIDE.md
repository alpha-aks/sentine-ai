# Candidate Flow Guide — SentinelAI

## Step-by-Step Candidate Journey

1. **Dashboard & Exam Selection (`/candidate` & `/candidate/exams`)**:
   Student views scheduled exams and clicks "Enter Waiting Room".

2. **Waiting Room (`/candidate/waiting-room/[sessionId]`)**:
   Candidate inspects test schedule, duration limits, and proctoring policy summary.

3. **System Check (`/candidate/system-check/[sessionId]`)**:
   System checks browser support, webcam feed, microphone audio meter, WebRTC peer capability, internet speed, and fullscreen capability.

4. **Identity Verification (`/candidate/identity/[sessionId]`)**:
   Candidate takes a live webcam snapshot for identity verification.

5. **Instructions & Honor Code (`/candidate/instructions/[sessionId]`)**:
   Candidate accepts honor code terms and launches full-screen test environment.

6. **Live Examination (`/candidate/exam/[sessionId]`)**:
   Candidate answers questions, navigates via Question Palette, logs heartbeats, and receives proctoring warning alerts if tab switching or exiting fullscreen.

7. **Final Submission (`/candidate/submission`)**:
   Candidate confirms answer summary dialog and receives a submission receipt.
