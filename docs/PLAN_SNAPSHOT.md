# Plan Snapshot

Change feed ngắn của plan đã được công bố trên `develop`. Chi tiết nằm trong owner documents.

## Current revision

- Revision: `PLAN-0033`
- Updated: 2026-08-12
- Status: TEAM_CONFIRMED_PUBLISHED
- Scope: Hoàn tất Merge Memory Sync cho `TASK-DASHBOARD-001` (Dashboard Zod contracts, Express Analytics API Router `/api/v1/dashboard/*`, UI Dashboard components & Admin Dashboard page) sau PR `#13` / merge `1439807`.
- Remote visibility: chỉ có hiệu lực cho thành viên khác sau khi commit/push lên `origin/develop`.

## Current direction

- Pha hiện tại: foundation implementation.
- Task đang chạy: không có; `TASK-DASHBOARD-001`, `TASK-AUTH-001` và `TASK-SEARCH-001` đã `DONE`.
- Architecture: React/Express/Python workers/PostgreSQL/MongoDB/Redis/Cloudinary/Nginx.
- Product: CMS-driven, immersive 3D/animation, AI Guide, recognition, Digital Twin.
- Narrative experience: free/guided modes dùng chung QR resolver; related artifacts chỉ từ typed/versioned relation đã curator duyệt, có lý do/nguồn và deterministic ranking; QR không tạo 3D theo request mà mở model đã duyệt/fallback.
- Collaboration: branch isolation, contract alignment, progressive context, plan lock, AI-managed task startup, single-writer integration turn và merge memory sync.

## Change feed

| Revision | Date | Change | Affected owners/tasks | Required action | Confirmed by |
|---|---|---|---|---|---|
| PLAN-0033 | 2026-08-12 | Hoàn tất Merge Memory Sync cho TASK-DASHBOARD-001 (PR #13 / merge 1439807) | TASK-DASHBOARD-001 (DONE) | Cập nhật local develop sau pull | `loc` |
| PLAN-0032 | 2026-08-12 | Hoàn tất Merge Memory Sync cho TASK-AUTH-001 (PR #12 / merge 8e76271) | TASK-AUTH-001 (DONE) | Cập nhật local develop sau pull | `loc` |
| PLAN-0031 | 2026-08-12 | Hoàn tất Merge Memory Sync cho TASK-SEARCH-001 (PR #11 / merge 400d328) | TASK-SEARCH-001 (DONE) | Cập nhật local develop sau pull | `loc` |
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
| PLAN-0019 | 2026-08-03 | Sau khi AI trình bày task/scope/branch và người dùng xác nhận bắt đầu, AI tự publish claim, đồng bộ local `develop`, tạo/chuyển feature branch, mở ledger/report và code | Mọi task implementation; Pre-code Plan Sync; Git startup | AI thực hiện safe startup trên workspace của phiên; dừng ở dirty/diverged/conflict/ambiguous state; không tự push/merge implementation | `loc` xác nhận |
| PLAN-0020 | 2026-08-03 | Tách Foundation CI Quality Gate thành `TASK-CI-001`, owner `loc`, chỉ sở hữu GitHub Actions và task report | TASK-CI-001; TASK-API-001; Quality/DevOps | Publish claim; chọn CI design; không sửa API/contracts/root tooling; chạy workflow evidence trước handoff | `loc` xác nhận bắt đầu |
| PLAN-0021 | 2026-08-03 | Mở rộng `TASK-CI-001` đúng một file `infra/compose.yaml` để sửa Prettier cơ học; cấm đổi Compose behavior | TASK-CI-001; TASK-INFRA-001; root quality gate | Publish scope revision; format file; so sánh Compose config trước/sau; chạy lại root gate | `loc` xác nhận formatting-only |
| PLAN-0022 | 2026-08-03 | Khóa `OPTION-CLEAN-GATE-001/A`: Turbo lint/typecheck phải build workspace dependencies trước dependent task; xóa Admin stale re-export; không sửa consumer bằng `any` hoặc làm yếu CI. `FIX-FORMAT-001` đã merge tại `8d199db` nhưng giữ REVIEW vì chưa VERIFIED | FIX-CLEAN-GATE-001; TASK-CI-001; TASK-FOUND-001; TASK-ADMIN-001; FIX-FORMAT-001 | Publish claim; tạo branch từ latest `develop`; clean build artifacts rồi chạy lint/typecheck/root gate; sau fix đồng bộ TASK-CI-001 và lấy hosted PASS | `thanh` chọn phương án chính xác nhất; Codex khóa phương án A theo evidence local + hosted run `30829451628` và Turbo docs chính thức |
| PLAN-0023 | 2026-08-03 | Clean validation sau Option A lộ Admin regression: integrated renderer thiếu validation control và stable live-preview container mà accepted Admin tests/spec yêu cầu. Khóa revision R1, không phục hồi standalone preview export và không sửa tests để che regression | FIX-CLEAN-GATE-001; TASK-ADMIN-001; TASK-CI-001 | Mở rộng đúng `apps/admin/src/forms/cmsFormBuilder.ts`; khôi phục hai accepted markers; chạy lại clean/full gate; giữ `infra/compose.yaml` cho `loc` | `thanh` xác nhận tiếp tục sửa sau khi xem evidence hosted/local |
| PLAN-0024 | 2026-08-03 | PR `#7` merge `FIX-CLEAN-GATE-001` vào `develop` tại `8bf9c9e`; Merge Memory Sync PASS, chưa tự đặt VERIFIED | FIX-CLEAN-GATE-001; TASK-CI-001; TASK-ADMIN-001; root quality gate | `loc` pull latest develop, merge vào `feature/TASK-CI-001`, push và lấy hosted PASS; không rerun head cũ | GitHub merge evidence và local clean lint/typecheck/test/build PASS |
| PLAN-0025 | 2026-08-03 | PR `#4` merge `TASK-CI-001` tại `be2a18e`; hosted Foundation quality gate run `30832872900` PASS trên exact merge commit; `TASK-CI-001` và dependent `FIX-CLEAN-GATE-001` chuyển `DONE` | TASK-CI-001; FIX-CLEAN-GATE-001; DevOps/testing baseline; task registry | Publish Merge Memory Sync; giữ FIX-FORMAT-001 ở REVIEW; chọn task READY tiếp theo sau claim/scope gate | `thanh` xác nhận và yêu cầu đồng bộ trạng thái |
| PLAN-0026 | 2026-08-03 | `FIX-FORMAT-001` chuyển `DONE` sau khi review actual six-path merge và scope deviation; hosted integrated gate PASS | FIX-FORMAT-001; Web/Admin/contracts/UI formatting baseline; task registry | Publish Merge Memory Sync; giữ deviation trong lịch sử; task mới phải claim riêng | `thanh` xác nhận thực hiện |
| PLAN-0027 | 2026-08-04 | Claim `TASK-DOC-QUALITY-001` cho `thanh` trên `feature/TASK-DOC-QUALITY-001`; dependency foundation/API/data/CI đều DONE; write scope giới hạn ở quality tooling/CI, root quality config, API regression tests và task report | TASK-DOC-QUALITY-001; documentation/code/config/secret/data-access quality gates | Publish claim; tạo feature branch/report/session; so sánh các scanner/policy option và chỉ implement sau khi người dùng chọn `PLAN_LOCKED` | `thanh` xác nhận bắt đầu |
| PLAN-0028 | 2026-08-04 | Chọn Option C hybrid repo-controlled: markdownlint + Secretlint chạy local/CI; custom checks chỉ giữ invariant riêng; OSV quét một pnpm và hai uv lockfiles trong hosted job; không thêm CodeQL/platform settings vào scope hiện tại | TASK-DOC-QUALITY-001; documentation/code/config/secret/data-access quality gates | Implement đúng write scope; mask secret diagnostics; allowlist hẹp có lý do; API hiện chưa có SQL/cache runtime nên chỉ static/synthetic evidence và phải ghi N/A thay vì tuyên bố coverage giả | `thanh` chọn phương án C |
| PLAN-0029 | 2026-08-04 | Hai runs sau merge `TASK-DOC-QUALITY-001` đều `startup_failure` vì reusable OSV workflow yêu cầu `actions: read` và `security-events: write` vượt quyền caller. Chọn phương án B: normal job gọi direct OSV action tại immutable SHA, chỉ `contents: read`, giữ ba lockfile và fail theo scanner exit code | FIX-DOC-QUALITY-CI-001; TASK-DOC-QUALITY-001; hosted quality gate | Publish fix claim; sửa duy nhất workflow + task report; không cấp quyền SARIF không dùng. TASK-DOC-QUALITY-001 vẫn chưa VERIFIED cho đến exact-commit hosted PASS và Merge Memory Sync | `thanh` chọn phương án B |
| PLAN-0030 | 2026-08-04 | PR `#10` merge fix tại `7c63cbb`; PR run `30841432956` trên `fd49df3` và develop run `30841444661` trên exact merge commit đều tạo đủ Node/Python + OSV jobs và PASS. `TASK-DOC-QUALITY-001` cùng `FIX-DOC-QUALITY-CI-001` chuyển `DONE` | Repository quality baseline; hosted OSV scan; task registry/index/traceability/owners | Publish Merge Memory Sync; integration turn mở lại; task mới phải claim riêng từ registry | `thanh` cung cấp và xác nhận hai hosted runs xanh |

## Changed owner documents in current revision

- `README.md`.
- `docs/AI_CONTEXT.md`.
- `docs/NEXT_WORK.md`.
- `docs/PROJECT_STATUS.md`.
- `docs/PLAN_SNAPSHOT.md`.
- `docs/IMPLEMENTATION_INDEX.md`.
- `docs/04-design/03-ai-experience-quality-gate.md`.
- `docs/05-quality/04-code-configuration-quality-gate.md`.
- `docs/05-quality/05-database-query-cache-quality-gate.md`.
- `docs/06-devops/01-local-environment.md`.
- `docs/07-delivery/05-traceability-matrix.md`.
- `docs/work/TASK-DOC-QUALITY-001.md`.
- `docs/work/FIX-DOC-QUALITY-CI-001.md`.

Repository quality baseline đã merge và được xác minh. Direct OSV job không upload SARIF, chỉ có `contents: read`; mọi thay đổi scanner/permission material trong tương lai phải qua Plan Revision.

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
