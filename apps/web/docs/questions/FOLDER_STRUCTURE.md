# Folder Structure — Question Bank Module

```
apps/web/
├── app/(dashboard)/
│   └── questions/
│       ├── page.tsx
│       ├── new/page.tsx
│       ├── import/page.tsx
│       ├── export/page.tsx
│       ├── pools/page.tsx
│       ├── categories/page.tsx
│       ├── tags/page.tsx
│       ├── preview/page.tsx
│       └── [id]/
│           ├── page.tsx
│           └── edit/page.tsx
├── components/
│   └── questions/
│       ├── difficulty-badge.tsx
│       ├── type-badge.tsx
│       ├── status-badge.tsx
│       ├── search-bar.tsx
│       ├── filter-toolbar.tsx
│       ├── question-table.tsx
│       ├── question-card.tsx
│       ├── question-editor.tsx
│       ├── code-editor.tsx
│       ├── question-preview.tsx
│       ├── question-pool-editor.tsx
│       ├── category-manager.tsx
│       ├── tag-manager.tsx
│       ├── file-uploader.tsx
│       └── import-preview.tsx
├── services/
│   └── question.service.ts
├── store/
│   └── question-store.ts
└── types/
    └── question.ts
```
