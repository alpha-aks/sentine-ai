# Component Guide — Exam Management Module

- `ExamTable`: Master table displaying title, code, duration, passing percentage, status badge, and action dropdown menu.
- `ExamForm`: React Hook Form + Zod schema for title, code, type, difficulty level, duration, and passing grade.
- `SectionEditor`: Dynamic section builder supporting individual timers, mandatory toggles, and section reordering.
- `EligibilitySelector`: Department tags and email whitelist manager.
- `SchedulePicker`: DateTime pickers for exam start/end windows and late entry grace period.
- `SecurityPolicyPanel`: Switches for browser lock, mandatory fullscreen, tab switch detection, copy/paste block, multi-monitor block, and VM block.
- `AIProctoringPanel`: Controls for webcam face tracking, anomalous motion AI, acoustic collusion detection, and risk flag thresholds.
- `InstructionEditor`: Editor for examinee rules of conduct.
- `ExamPreview`: Read-only candidate testing simulation interface.
- `PublishDialog` / `ArchiveDialog` / `CloneDialog`: Modal dialogs for exam lifecycle operations.
