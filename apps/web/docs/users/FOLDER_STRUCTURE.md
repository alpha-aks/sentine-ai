# Folder Structure — User & Role Management Module

```
apps/web/
├── app/(dashboard)/
│   ├── users/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/page.tsx
│   ├── roles/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── permissions/
│   │   └── page.tsx
│   └── invitations/
│       └── page.tsx
├── components/
│   ├── users/
│   │   ├── user-avatar.tsx
│   │   ├── status-badge.tsx
│   │   ├── search-bar.tsx
│   │   ├── filter-toolbar.tsx
│   │   ├── action-menu.tsx
│   │   ├── user-table.tsx
│   │   ├── user-form.tsx
│   │   └── user-profile-card.tsx
│   ├── roles/
│   │   ├── role-table.tsx
│   │   └── role-editor.tsx
│   ├── permissions/
│   │   ├── permission-matrix.tsx
│   │   └── permission-selector.tsx
│   └── invitations/
│       ├── invitation-table.tsx
│       └── invitation-dialog.tsx
├── services/
│   ├── user.service.ts
│   ├── role.service.ts
│   ├── permission.service.ts
│   └── invitation.service.ts
├── store/
│   └── user-store.ts
└── types/
    └── user.ts
```
