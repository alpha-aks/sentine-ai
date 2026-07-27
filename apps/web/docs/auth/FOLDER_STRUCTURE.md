# Authentication Module Folder Structure

```
apps/web/
├── app/(auth)/                  # Auth App Router pages
│   ├── login/page.tsx           # /login
│   ├── register/page.tsx        # /register
│   ├── forgot-password/page.tsx # /forgot-password
│   ├── reset-password/page.tsx  # /reset-password
│   ├── verify-email/page.tsx    # /verify-email
│   └── logout/page.tsx          # /logout
├── components/auth/             # Reusable authentication UI & security guards
│   ├── auth-card.tsx            # Form shell container
│   ├── login-form.tsx           # Login form component
│   ├── register-form.tsx        # Registration form component
│   ├── forgot-password-form.tsx # Forgot password form component
│   ├── reset-password-form.tsx  # Reset password form component
│   ├── verify-email-card.tsx    # Email verification component
│   ├── password-strength.tsx    # Real-time password strength meter
│   ├── social-button.tsx        # OAuth social provider button
│   ├── protected-route.tsx      # Auth protection guard
│   ├── public-route.tsx         # Guest route guard
│   ├── role-guard.tsx           # RBAC role guard
│   ├── permission-guard.tsx     # Permission guard
│   ├── tenant-guard.tsx         # Institution tenant guard
│   └── loading-screen.tsx       # Fullscreen loading view
├── services/
│   └── auth.service.ts          # Auth microservice client (Port 4001)
├── store/
│   └── auth-store.ts            # Zustand auth state store
└── utils/
    └── validators.ts            # Zod validation schemas & strength logic
```
