# Plan Snapshot

Change feed ngắn của plan đã được công bố trên `develop`. Chi tiết nằm trong owner documents.

## Current revision

- Revision: `PLAN-0010`
- Updated: 2026-08-02
- Status: BASELINE_PENDING_TEAM_REVIEW
- Scope: Khóa hai mode khám phá dùng chung QR pipeline cho Dòng thời gian sống.
- Remote visibility: chỉ có hiệu lực cho thành viên khác sau khi commit/push lên `origin/develop`.

## Current direction

- Pha hiện tại: chuẩn hóa, chuẩn bị project foundation.
- Task tiếp theo: `TASK-FOUND-001`.
- Architecture: React/Express/Python workers/PostgreSQL/MongoDB/Redis/Cloudinary/Nginx.
- Product: CMS-driven, immersive 3D/animation, AI Guide, recognition, Digital Twin.
- Narrative experience: `FEAT-TIMELINE-001` có `FREE_EXPLORE` và `GUIDED_JOURNEY`; direct Scan/Map/Search là free, Start/Continue mới guided, hai mode dùng chung QR/artifact resolver và guided mới mutate narrative progress.
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
| PLAN-0007 | 2026-07-30 | Onboarding hỏi tên/Member ID trước, không suy luận hoặc gọi tên từ Git/placeholder | Mọi chat onboarding; TEAM/collaboration | Áp dụng ngay; Git author chỉ consistency check sau xác nhận | Người dùng xác nhận |
| PLAN-0008 | 2026-07-30 | Thêm identity recheck 4 giờ, work-session ledger, feature lifecycle và continuation attribution | Mọi implementation/handoff; feature owner templates | Áp dụng từ implementation session đầu tiên | Người dùng xác nhận |
| PLAN-0009 | 2026-08-02 | Đăng ký Member ID `thanh`; chọn Concept A “Dòng thời gian sống”, khóa MVP 2D/CMS-driven trước AI/3D và giữ B/C/D DEFERRED | TEAM; IDEA-002; FEAT-TIMELINE-001; CMS/Tour/Map; TASK-TIMELINE-001 | Review/publish coordination docs; không implement trước foundation/contracts/content | `thanh` xác nhận |
| PLAN-0010 | 2026-08-02 | Khóa `FREE_EXPLORE` và `GUIDED_JOURNEY` dùng chung QR/artifact resolver; explicit switch, giữ progress, AI/Map nhận context theo mode | IDEA-002; FEAT-TIMELINE-001; CMS/QR/Map/AI Guide; TASK-TIMELINE-001 | Đồng bộ mode enum/contract; không tạo scanner/DTO song song; task vẫn BLOCKED | `thanh` xác nhận |

## Changed owner documents in current revision

- `docs/03-features/11-living-timeline.md`; cross-link tại CMS/Web 3D/AI Guide.
- `docs/01-architecture/03-integration-map.md`, `docs/02-data/01-data-model.md`, `docs/02-data/02-api-contract.md`, `docs/02-data/03-contract-catalog.md`.
- `docs/IDEA_BACKLOG.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`, `docs/AI_CONTEXT.md`.
- `docs/IMPLEMENTATION_INDEX.md`, `docs/04-design/02-ui-component-registry.md`.
- `PROJECT_BRAIN.md`, `CURRENT_TASK.md`.

`TASK-TIMELINE-001` chưa được claim và vẫn BLOCKED. Estimate được revision từ 6/12/25 thành 7/14/29 person-days. Plan chỉ trở thành nguồn chung cho collaborator sau khi người dùng review, commit và push lên `origin/develop`.

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
