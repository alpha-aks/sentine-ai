# Navigation & RBAC Guide

Navigation items are defined in [`routes-config.ts`](file:///c:/Users/tanis/OneDrive/Desktop/mini/apps/web/config/routes-config.ts) using the `mainNavigation` array.

---

## Adding a New Navigation Item

```typescript
{
  title: 'Candidate Sessions',
  href: '/candidate-sessions',
  icon: 'Activity',
  roles: ['EXAM_ADMIN', 'PROCTOR_SUPERVISOR', 'LIVE_PROCTOR']
}
```

Items automatically filter visibility based on the logged-in user's role.
