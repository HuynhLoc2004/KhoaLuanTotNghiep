# Plan Snapshot

Change feed ngắn của plan đã được công bố trên `develop`. Chi tiết nằm trong owner documents.

## Current revision

- Revision: `PLAN-0006`
- Updated: 2026-07-30
- Status: BASELINE_PENDING_TEAM_REVIEW
- Scope: Database Query, Cache & Input Security Quality Gate.
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
| PLAN-0002 | 2026-07-29 | Cho phép đề xuất runtime ngoài baseline và thêm Search/Discovery | Architecture; FEAT-SEARCH-001; TASK-SEARCH-001 | Review; chưa triển khai trước foundation/data | `loc` yêu cầu |
| PLAN-0003 | 2026-07-29 | Thêm xác định vị trí bằng QR hoặc chụp ảnh không gian | FEAT-LOCATION-001; Web 3D/Map; Tour Guide | Thu thập QR/reference dataset; chưa triển khai trước map/AI foundation | `loc` yêu cầu |
| PLAN-0004 | 2026-07-30 | Khóa Quality Gate cho sáng tạo UI/motion/3D, inventory công nghệ và hiệu năng đa thiết bị | IDEA-001; mọi UI feature; TASK-DOC-QUALITY-001 | Áp dụng Markdown gate ngay; automation sau TASK-FOUND-001 | `loc` xác nhận |
| PLAN-0005 | 2026-07-30 | Khóa clean-code review, server-only secret, typed config và URL/provider rules | Mọi implementation; TASK-DOC-QUALITY-001 | Áp dụng review/docs gate ngay; thêm scan/CI sau TASK-FOUND-001 | `loc` xác nhận |
| PLAN-0006 | 2026-07-30 | Khóa server input validation, parameterized query, evidence-based index, scoped cache và data redaction | Mọi data/API feature; TASK-DOC-QUALITY-001 | Áp dụng docs/review gate ngay; automation sau API/data foundation | `loc` xác nhận |

## Changed owner documents in current revision

- `docs/05-quality/05-database-query-cache-quality-gate.md`
- `docs/05-quality/01-security-privacy.md`
- `docs/05-quality/02-performance-scalability.md`
- `docs/05-quality/03-testing-strategy.md`
- `docs/00-product/03-business-invariants.md`
- `docs/02-data/01-data-model.md`
- `docs/02-data/02-api-contract.md`
- `docs/templates/feature-template.md`
- `docs/templates/feature-report-standard.md`
- `PROJECT_BRAIN.md`
- `docs/NEXT_WORK.md`
- `docs/CONTEXT_ROUTER.md`
- `docs/PROJECT_STATUS.md`
- `README.md`
- `CURRENT_TASK.md`

Mọi task data/API/cache phải đọc Query/Cache/Input Security Quality Gate. Automation chưa triển khai trước API/data foundation.

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
