# Institution Management Folder Structure

```
apps/web/
├── app/(dashboard)/institutions/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── page.tsx
│       ├── edit/page.tsx
│       ├── departments/page.tsx
│       ├── courses/page.tsx
│       ├── faculty/page.tsx
│       ├── programs/page.tsx
│       ├── batches/page.tsx
│       ├── calendar/page.tsx
│       ├── branding/page.tsx
│       └── settings/page.tsx
├── components/institutions/
│   ├── institution-table.tsx
│   ├── institution-form.tsx
│   ├── department-table.tsx
│   ├── department-dialog.tsx
│   ├── course-table.tsx
│   ├── branding-editor.tsx
│   ├── settings-panel.tsx
│   └── delete-confirmation-dialog.tsx
├── services/
│   └── institution.service.ts
└── store/
    └── institution-store.ts
```
