# State Management Guide — Zustand AuthStore

The client authentication state is managed by `useAuthStore` in [`auth-store.ts`](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/web/store/auth-store.ts).

---

## State Properties

```typescript
interface AuthState {
  user: UserSessionProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: UserSessionProfile, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserSessionProfile) => void;
  initializeAuth: () => void;
  logout: () => void;
}
```

---

## Usage Example

```typescript
import { useAuth } from '@/hooks/use-auth';

export function DashboardComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.fullName} ({user?.role})</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```
