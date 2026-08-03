# Plan Snapshot

Change feed ngắn của plan đã được công bố trên `develop`. Chi tiết nằm trong owner documents.

## Current revision

- Revision: `PLAN-0018`
- Updated: 2026-08-03
- Status: TEAM_CONFIRMED_PUBLISHED
- Scope: Tuần tự hóa merge/push `develop` bằng single-writer integration turn; hoàn tất Merge Memory Sync trước khi chuyển lượt.
- Remote visibility: chỉ có hiệu lực cho thành viên khác sau khi commit/push lên `origin/develop`.

## Current direction

- Pha hiện tại: foundation implementation.
- Task tiếp theo: chọn từ registry sau khi Infra Merge Memory Sync hoàn tất và write scope được xác nhận.
- Architecture: React/Express/Python workers/PostgreSQL/MongoDB/Redis/Cloudinary/Nginx.
- Product: CMS-driven, immersive 3D/animation, AI Guide, recognition, Digital Twin.
- Narrative experience: free/guided modes dùng chung QR resolver; related artifacts chỉ từ typed/versioned relation đã curator duyệt, có lý do/nguồn và deterministic ranking; QR không tạo 3D theo request mà mở model đã duyệt/fallback.
- Collaboration: branch isolation, contract alignment, progressive context, plan lock, single-writer integration turn và merge memory sync.

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
| PLAN-0011 | 2026-08-02 | Khóa typed curator-approved Artifact Relationship, explained deterministic ranking và approved-3D-only/fallback sau QR | IDEA-002; FEAT-TIMELINE-001; CMS/Artifact/QR/AI Guide/Web 3D; TASK-TIMELINE-001 | Tạo shared relation contract sau foundation; không auto-link/auto-publish bằng AI/metadata | `thanh` xác nhận |
| PLAN-0012 | 2026-08-03 | Khóa Compose project/service DNS, host/container ports, tách infra write scope và bắt buộc mọi shared plan/task change được publish trên remote `develop` qua Pre-code Plan Sync Gate | TASK-INFRA-001; TASK-FOUND-001; mọi task song song | Publish coordination change lên remote `develop`; collaborator pull và kiểm tra collision trước code hoặc sau mỗi shared plan/task revision | `loc` + `thanh` xác nhận theo thông tin người dùng cung cấp |
| PLAN-0013 | 2026-08-03 | Bắt buộc cập nhật README trong cùng commit với mọi shared plan/task coordination change | README; mọi task/plan owner | Giữ README ngắn gọn với revision, active owner/branch và link; Codex xác minh README trên remote `develop` trước khi quay lại feature branch | `loc` xác nhận |
| PLAN-0014 | 2026-08-03 | Giới hạn AI chỉ tự commit/push Markdown coordination lên `develop`; ưu tiên worktree để không đổi active branch; feature push/review/merge do người dùng thực hiện | Git workflow; mọi task/feature branch | Chặn non-Markdown trong coordination commit; không tự push/merge implementation; AI chỉ đề xuất handoff commands | `loc` xác nhận |
| PLAN-0015 | 2026-08-03 | Khóa scope isolation do AI thực thi; thành viên không cần theo dõi/nhắc/xem branch của nhau | Mọi task song song; session start gate | AI đọc remote `develop` đầu phiên, chỉ sửa owned scope; unknown branch-local work không là blocker nếu scope tách; shared/foreign scope phải qua coordination Markdown | `loc` xác nhận |
| PLAN-0016 | 2026-08-03 | `TASK-INFRA-001` VERIFIED và đã push feature commit `5936397`; registry chuyển REVIEW | TASK-INFRA-001; local environment | Người dùng/nhóm review feature branch; chỉ merge khi chấp nhận; sau merge chạy Merge Memory Sync | `loc` xác nhận verification và push |
| PLAN-0017 | 2026-08-03 | Feature branch chỉ sửa owned code/spec + `docs/work/<TASK-ID>.md`; shared status/index/catalog files chỉ cập nhật trên `develop` | Mọi task/PR; CURRENT_TASK; owner/index/status docs | Cleanup PR #2/#3 lần cuối; từ task sau chạy denylist check trước push và promote docs sau merge | `loc` yêu cầu giải quyết triệt để conflict |
| PLAN-0018 | 2026-08-03 | Chỉ một người merge/push `develop` tại một thời điểm; chuyển lượt sau khi merge trước và Merge Memory Sync hoàn tất | Mọi implementation merge; `TASK-FOUND-001`; `TASK-INFRA-001`; Git workflow | Owner giữ integration turn thông báo checkpoint; người kế tiếp `pull --ff-only`, merge task VERIFIED một lần, test rồi push; dừng nếu rejected/conflict | `loc` xác nhận |

## Changed owner documents in current revision

- `README.md`.
- `AGENTS.md`.
- `docs/07-delivery/06-two-person-collaboration.md`.
- `docs/07-delivery/07-git-playbook.md`.

`TASK-FOUND-001` và `TASK-INFRA-001` đã `DONE` sau merge `3d8b971`/`847251c` và Merge Memory Sync. `TASK-TIMELINE-001` vẫn BLOCKED.

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
