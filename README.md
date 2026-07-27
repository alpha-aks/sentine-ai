# SentinelAI Monorepo

Autonomous Multi-Agent Exam Integrity Platform enterprise monorepo workspace.

## Repository Layout

```
.
├── apps/
│   ├── student-portal/          # Candidate exam workspace
│   ├── proctor-dashboard/       # Live proctor command center
│   └── admin-portal/            # Institutional governance portal
├── services/
│   └── backend/                 # Express + WebSocket orchestrator service
├── packages/
│   ├── types/                   # Shared TypeScript domain models
│   ├── constants/               # System risk thresholds and sensitivity presets
│   └── ui/                      # Shared UI design tokens and badges
├── .github/
│   └── workflows/ci.yml         # Continuous integration pipeline
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Quick Start

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```

### Static Type Analysis
```bash
npm run type-check
```

### Production Build
```bash
npm run build
```
