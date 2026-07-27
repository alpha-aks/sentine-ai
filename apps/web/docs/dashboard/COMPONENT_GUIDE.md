# Dashboard Component Reference

## 1. `StatsCard`
Displays numeric metrics, subtext, icon, and positive/negative trend badges.

```tsx
<StatsCard
  title="Active Exams"
  value="14"
  description="Live proctored exams"
  icon={<Activity className="h-5 w-5" />}
  trend={{ value: '3 flagged', direction: 'down' }}
/>
```

---

## 2. `QuickActionCard`
Interactive shortcut card with hover animations.

```tsx
<QuickActionCard
  title="Schedule New Exam"
  description="Configure exam rules, duration, and roster."
  href="/exams"
  icon={<PlusCircle className="h-5 w-5" />}
/>
```

---

## 3. `SystemHealthCard`
Displays microservice status and port metrics for all 7 backend services.

---

## 4. `RecentActivityCard`
Audit stream activity feed.
