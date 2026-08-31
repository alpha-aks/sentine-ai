module.exports = {
  apps: [
    // --- 1. Ingestion / Gateway Backend ---
    {
      name: "sentinel-gateway",
      script: "npm",
      args: "run start",
      cwd: "./services/backend",
      env: {
        PORT: 4000,
        NODE_ENV: "production"
      }
    },
    // --- 2. Auth Service ---
    {
      name: "auth-service",
      script: "npm",
      args: "run start",
      cwd: "./services/auth-service",
      env: {
        PORT: 4001,
        NODE_ENV: "production"
      }
    },
    // --- 3. User Service ---
    {
      name: "user-service",
      script: "npm",
      args: "run start",
      cwd: "./services/user-service",
      env: {
        PORT: 4002,
        NODE_ENV: "production"
      }
    },
    // --- 4. Exam Service ---
    {
      name: "exam-service",
      script: "npm",
      args: "run start",
      cwd: "./services/exam-service",
      env: {
        PORT: 4003,
        NODE_ENV: "production"
      }
    },
    // --- 5. Question Service ---
    {
      name: "question-service",
      script: "npm",
      args: "run start",
      cwd: "./services/question-service",
      env: {
        PORT: 4005,
        NODE_ENV: "production"
      }
    },
    // --- 6. Candidate Session Service ---
    {
      name: "candidate-session-service",
      script: "npm",
      args: "run start",
      cwd: "./services/candidate-session-service",
      env: {
        PORT: 4006,
        NODE_ENV: "production"
      }
    },
    // --- 7. Submission Service ---
    {
      name: "submission-service",
      script: "npm",
      args: "run start",
      cwd: "./services/submission-service",
      env: {
        PORT: 4007,
        NODE_ENV: "production"
      }
    },
    // --- 8. Proctor Monitoring Service ---
    {
      name: "proctor-monitoring-service",
      script: "npm",
      args: "run start",
      cwd: "./services/proctor-monitoring-service",
      env: {
        PORT: 4008,
        NODE_ENV: "production"
      }
    },
    // --- 9. Vision Guard AI Agent Service ---
    {
      name: "vision-guard-service",
      script: "npm",
      args: "run start",
      cwd: "./services/vision-guard-service",
      env: {
        PORT: 4009,
        NODE_ENV: "production",
        INFERENCE_MODE: "CPU"
      }
    },
    // --- 10. Student Portal Frontend ---
    {
      name: "student-portal",
      script: "npm",
      args: "run start",
      cwd: "./apps/student-portal",
      env: {
        PORT: 3000
      }
    },
    // --- 11. Proctor Dashboard Frontend ---
    {
      name: "proctor-dashboard",
      script: "npm",
      args: "run start",
      cwd: "./apps/proctor-dashboard",
      env: {
        PORT: 3001
      }
    },
    // --- 12. Admin Portal Frontend ---
    {
      name: "admin-portal",
      script: "npm",
      args: "run start",
      cwd: "./apps/admin-portal",
      env: {
        PORT: 3002
      }
    },
    // --- 13. Web Next.js App Dashboard ---
    {
      name: "web-app",
      script: "npm",
      args: "run start",
      cwd: "./apps/web",
      env: {
        PORT: 3003
      }
    }
  ]
};
