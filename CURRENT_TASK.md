# Current task router

File này chỉ là router dùng chung trên `develop`; feature branch không sửa file này.

- Task registry và owner/branch/write scope: [docs/NEXT_WORK.md](docs/NEXT_WORK.md).
- Shared plan revision: [docs/PLAN_SNAPSHOT.md](docs/PLAN_SNAPSHOT.md).
- Task-local plan, session ledger, test evidence và handoff: `docs/work/<TASK-ID>.md`.
- Template task report: [docs/templates/task-work-report-template.md](docs/templates/task-work-report-template.md).

Codex xác định task từ branch + registry, rồi mở đúng task report. Shared status/index chỉ được cập nhật qua Markdown-only coordination worktree trên `develop`.
