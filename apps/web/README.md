# SentinelAI Frontend Application (`@sentinel-ai/web`)

Production-ready Next.js 14 App Router frontend foundation for the **SentinelAI Autonomous Multi-Agent Exam Integrity Platform**.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: Radix UI Primitives + shadcn/ui design system
- **State Management**:
  - **Client State**: Zustand (`useAuthStore`, `useUserStore`, `useThemeStore`, `useNotificationStore`, `useSessionStore`, `useLoadingStore`, `usePermissionStore`)
  - **Server State**: TanStack Query v5 (`QueryClient`)
- **HTTP Client**: Axios with automatic Bearer JWT attachment, silent refresh rotation, tenant header propagation, and error transformation
- **Forms & Validation**: React Hook Form + Zod (`loginSchema`, `registerSchema`, `createExamSchema`)
- **Animations & Icons**: Framer Motion + Lucide Icons
- **Data Visualization**: Recharts (`SimpleBarChart`, `SimpleLineChart`, `SimpleAreaChart`)

---

## Directory Architecture

```
apps/web/
├── app/                  # App Router layouts & page routes
│   ├── (auth)/           # Authentication layout & pages (/login, /register, etc.)
│   ├── (dashboard)/      # Dashboard Shell layout & feature routes (/dashboard, /exams, etc.)
│   ├── (candidate)/      # Lockdown Candidate Layout (/candidate/waiting-room, /candidate/exam/[id])
│   ├── layout.tsx        # Root layout with AppProvider
│   └── page.tsx          # Root redirect
├── components/
│   ├── ui/               # 25+ reusable UI components (button, input, select, table, etc.)
│   ├── dashboard/        # Dashboard Shell components (sidebar, top-nav, profile-menu, etc.)
│   └── layout/           # Container & PageHeader components
├── config/               # Site and navigation routing configs
├── hooks/                # Custom React hooks (useAuth, useDebounce, usePermission, etc.)
├── lib/                  # Axios apiClient & TanStack queryClient factories
├── providers/            # React AppProvider, ThemeProvider, and AuthProvider
├── services/             # Centralized API service clients consuming real backend ports
├── store/                # 7 Zustand state stores
├── styles/               # Global CSS variables & Tailwind tokens
├── types/                # TypeScript domain & API definitions
└── utils/                # Date/number formatters, Zod validators, domain constants
```

---

## Quick Start

```bash
cd apps/web
npm install
npm run type-check
npm run build
npm run dev
```

The application runs on `http://localhost:3000`.

---

## Service Endpoints

- **Auth Service**: `http://localhost:4001`
- **User Service**: `http://localhost:4002`
- **Institution Service**: `http://localhost:4003`
- **Exam Service**: `http://localhost:4004`
- **Question Service**: `http://localhost:4005`
- **Session Service**: `http://localhost:4006`
- **Submission Service**: `http://localhost:4007`
