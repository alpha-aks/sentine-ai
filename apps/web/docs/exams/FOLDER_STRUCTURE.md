# Folder Structure — Exam Management Module

```
apps/web/
├── app/(dashboard)/
│   └── exams/
│       ├── page.tsx
│       ├── new/page.tsx
│       └── [id]/
│           ├── page.tsx
│           ├── edit/page.tsx
│           ├── sections/page.tsx
│           ├── schedule/page.tsx
│           ├── instructions/page.tsx
│           ├── eligibility/page.tsx
│           ├── security/page.tsx
│           ├── proctoring/page.tsx
│           ├── preview/page.tsx
│           └── analytics/page.tsx
├── components/
│   └── exams/
│       ├── status-badge.tsx
│       ├── search-bar.tsx
│       ├── filter-toolbar.tsx
│       ├── exam-table.tsx
│       ├── exam-form.tsx
│       ├── section-editor.tsx
│       ├── eligibility-selector.tsx
│       ├── schedule-picker.tsx
│       ├── security-policy-panel.tsx
│       ├── ai-proctoring-panel.tsx
│       ├── instruction-editor.tsx
│       ├── exam-preview.tsx
│       ├── publish-dialog.tsx
│       ├── archive-dialog.tsx
│       └── clone-dialog.tsx
├── services/
│   └── exam.service.ts
├── store/
│   └── exam-store.ts
└── types/
    └── exam.ts
```
