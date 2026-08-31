module.exports = {
  apps: [
    // --- 1. Ingestion / Gateway Backend ---
    {
      name: "sentinel-gateway",
      script: "npm",
      args: "run dev",
      cwd: "./services/backend"
    },
    // --- 2. Auth Service ---
    {
      name: "auth-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/auth-service"
    },
    // --- 3. User Service ---
    {
      name: "user-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/user-service"
    },
    // --- 4. Exam Service ---
    {
      name: "exam-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/exam-service"
    },
    // --- 5. Question Service ---
    {
      name: "question-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/question-service"
    },
    // --- 6. Candidate Session Service ---
    {
      name: "candidate-session-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/candidate-session-service"
    },
    // --- 7. Submission Service ---
    {
      name: "submission-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/submission-service"
    },
    // --- 8. Proctor Monitoring Service ---
    {
      name: "proctor-monitoring-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/proctor-monitoring-service"
    },
    // --- 9. Vision Guard AI Agent Service ---
    {
      name: "vision-guard-service",
      script: "npm",
      args: "run dev",
      cwd: "./services/vision-guard-service"
    },
    // --- 10. Student Portal Frontend ---
    {
      name: "student-portal",
      script: "npm",
      args: "run dev",
      cwd: "./apps/student-portal"
    },
    // --- 11. Proctor Dashboard Frontend ---
    {
      name: "proctor-dashboard",
      script: "npm",
      args: "run dev",
      cwd: "./apps/proctor-dashboard"
    },
    // --- 12. Admin Portal Frontend ---
    {
      name: "admin-portal",
      script: "npm",
      args: "run dev",
      cwd: "./apps/admin-portal"
    },
    // --- 13. Web Next.js App Dashboard ---
    {
      name: "web-app",
      script: "npm",
      args: "run dev",
      cwd: "./apps/web"
    }
  ]
};
