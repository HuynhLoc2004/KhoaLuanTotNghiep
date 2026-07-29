# Plan Snapshot

Change feed ngắn của plan đã được công bố trên `develop`. Chi tiết nằm trong owner documents.

## Current revision

- Revision: `PLAN-0001`
- Updated: 2026-07-29
- Status: BASELINE_PENDING_TEAM_REVIEW
- Scope: kiến trúc, feature plans, AI collaboration workflow.
- Remote visibility: chỉ có hiệu lực cho thành viên khác sau khi commit/push lên `origin/develop`.

## Current direction

- Pha hiện tại: chuẩn hóa, chuẩn bị project foundation.
- Task tiếp theo: `TASK-FOUND-001`.
- Architecture: React/Express/Python workers/PostgreSQL/MongoDB/Redis/Cloudinary/Nginx.
- Product: CMS-driven, immersive 3D/animation, AI Guide, recognition, Digital Twin.
- Collaboration: branch isolation, contract alignment, progressive context, plan lock và merge memory sync.

## Change feed

| Revision | Date | Change | Affected owners/tasks | Required action | Confirmed by |
|---|---|---|---|---|---|
| PLAN-0001 | 2026-07-29 | Tạo baseline toàn bộ plan và quy trình AI/cộng tác | Tất cả; TASK-FOUND-001 | Nhóm review, commit và push develop | Chờ nhóm |

## Changed owner documents in current revision

- `PROJECT_BRAIN.md`
- `AGENTS.md`
- `docs/PROJECT_STATUS.md`
- `docs/NEXT_WORK.md`
- `docs/03-features/*`
- `docs/01-architecture/*`
- `docs/02-data/*`
- `docs/04-design/*`
- `docs/07-delivery/*`

Vì đây là baseline đầu tiên, danh sách rộng. Revision sau chỉ liệt kê owner documents thực sự thay đổi.

## Revision rules

1. Tăng `PLAN-xxxx` cho mỗi nhóm thay đổi shared plan đã được chấp nhận.
2. Không tăng revision cho typo hoặc branch-local implementation note.
3. Giữ change feed append-only; revision cũ không bị viết lại.
4. Link tới owner doc, không copy toàn bộ nội dung.
5. Ghi task/contract/owner bị ảnh hưởng và hành động cần thiết.
6. Sau pull, Codex chỉ đọc các owner docs liên quan task hiện tại.

## Template

| Revision | Date | Change | Affected owners/tasks | Required action | Confirmed by |
|---|---|---|---|---|---|
| PLAN-xxxx | YYYY-MM-DD | Tóm tắt | Feature/task/contract | Re-read/re-plan/no action | Member ID |
