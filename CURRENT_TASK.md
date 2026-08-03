# Công việc hiện tại

## Git context

- Expected branch: `feature/TASK-FOUND-001`.
- Base branch: `develop` tại commit claim `8e90a24`.
- Merge sync source: `origin/develop` tại `7d99302`; conflict resolution đã validate/stage, merge commit vẫn là user action.
- Task registry: `TASK-FOUND-001` đang `IN_PROGRESS`, owner `thanh`.
- Coding agent được phép commit/merge/push: Không.
- Last reviewed shared plan revision: `PLAN-0015` từ `origin/develop`.
- Branch-local accepted revision: `PLAN-0016` cho foundation tooling/boundary, chờ review/merge để công bố.

## Task

- Mã: `TASK-FOUND-001`.
- Mục tiêu: khởi tạo monorepo, tooling và skeleton ứng dụng có thể cài đặt, kiểm tra và build tái lập.
- Feature owner: `docs/06-devops/01-local-environment.md`.
- Contributor đã xác nhận: `thanh` (Trịnh Vĩ Thành).
- Trạng thái: `IMPLEMENTED` — chờ người dùng/nhóm review, chưa `VERIFIED`.
- Decision: `DEC-FOUND-TOOLING-001` — `PLAN_LOCKED`.

## Work session

- Session ID: `WS-TASK-FOUND-001-20260803-02`.
- StartedAt: `2026-08-03T12:03:19+07:00`.
- LastActiveAt: `2026-08-03T12:15:09+07:00`.
- EndedAt: `2026-08-03T12:15:09+07:00`.
- Status: `CLOSED`.
- Active effort: `UNKNOWN`; không suy ra từ wall-clock.
- Scope: resolve merge conflict với `origin/develop`, giữ shared revisions `PLAN-0012`–`PLAN-0015` và đổi revision foundation chưa công bố thành `PLAN-0016`.
- Previous implementation session: `WS-TASK-FOUND-001-20260803-01`, `CLOSED` lúc `2026-08-03T11:52:48+07:00`.
- Next checkpoint: Thành tạo merge commit local để kết thúc merge; sau đó kiểm tra status trước khi push.

## PLAN_LOCKED

- Node target: Node 24 LTS; hỗ trợ Node 22 LTS để tương thích môi trường hiện tại.
- TypeScript workspace: pnpm `11.18.0` + Turborepo `2.10.8`.
- Python: uv `0.11.x`, mỗi runtime có `pyproject.toml` và lockfile riêng.
- Turbo chỉ dùng local cache trong task này; không cấu hình remote credential/cache.
- TypeScript và Python giữ dependency boundary riêng; root command chỉ điều phối kiểm tra.
- Plan chỉ mở lại khi có lỗi tương thích, dependency conflict hoặc bằng chứng CI/maintenance bất lợi.

## Trong phạm vi

- Root workspace/tooling/config: pnpm, Turbo, TypeScript, lint, format, test và build scripts.
- Skeleton tối thiểu cho `apps/web`, `apps/admin`, `services/api`, `services/ai`, `workers/media`, `packages/ui`, `packages/contracts`.
- Python project độc lập cho AI và media worker.
- `.gitignore`, `.gitattributes`, `.editorconfig`, `.env.example` không chứa secret.
- Test foundation, tài liệu owner, traceability, project status và handoff.

## Ngoài phạm vi

- `infra/**`, Docker Compose, Nginx, database, migration và service health configuration.
- React UI/shell, Express/FastAPI endpoint, auth, CMS, business behavior hoặc production content.
- Shared OpenAPI/DTO/event/CMS/error contract thực tế.
- CI automation, remote cache và deployment.

## Invariants liên quan

- `INV-CONTENT-002`: skeleton không hard-code production content.
- `INV-SEC-001`, `INV-SEC-003`: không commit/log secret hoặc credential.
- `INV-CONFIG-001`: config phụ thuộc môi trường phải có owner/validation; task này chỉ tạo catalog placeholder.
- `INV-DATA-004`, `INV-SEC-004`: chưa có data path; không tạo query/error contract giả.

## Acceptance criteria

- Fresh clone cài dependency từ lockfile bằng lệnh được tài liệu hóa.
- Workspace phát hiện đúng toàn bộ TypeScript package và không có dependency cycle.
- Một root check chạy format, lint, typecheck, unit test và build cho skeleton TypeScript.
- Hai Python project lock/sync/lint/test độc lập bằng uv.
- Không có secret thật; `.env*`, cache, virtual environment và build output được ignore đúng.
- Không triển khai nhầm scope của `TASK-INFRA-001`, `TASK-WEB-001`, `TASK-ADMIN-001`, `TASK-API-001` hoặc `TASK-DOC-QUALITY-001`.
- Owner document, diagrams, technology/config inventory, estimate, ledger, tests và limitations khớp implementation.

## Handoff status

### Kết quả

- Đã triển khai root pnpm/Turbo tooling, 5 TypeScript workspace và 2 Python/uv project độc lập đúng phương án A.
- Chỉ có skeleton metadata/test; không triển khai nhầm UI, endpoint, contract nghiệp vụ, Docker, database hay production content.
- Đã hợp nhất coordination từ `origin/develop` `7d99302`: giữ nguyên shared `PLAN-0012`–`PLAN-0015`, chuyển revision foundation chưa công bố thành `PLAN-0016` và bảo toàn kế hoạch Infra.
- Trạng thái `IMPLEMENTED`; agent không tự đặt `VERIFIED`.

### Trí nhớ dự án

- Feature owner: `docs/06-devops/01-local-environment.md`, đạt Feature Report Standard với 5 sơ đồ Mermaid và evidence khớp code.
- `docs/PROJECT_STATUS.md`, `docs/PLAN_SNAPSHOT.md` và traceability đã ghi rõ trạng thái branch-local/pending publication.
- Shared baseline đã đọc: `PLAN-0015`; foundation revision `PLAN-0016` chỉ thành plan chung sau review/merge vào `develop`.

### Test đã chạy

| Gate | Kết quả | Phạm vi |
|---|---|---|
| Frozen pnpm install + hai uv locked sync | PASS | 6 pnpm project entries; 2 Python project/lock riêng |
| Node engine negative test | PASS | `engineStrict` chặn Node 26.5.0 ngoài policy bằng `ERR_PNPM_UNSUPPORTED_ENGINE` |
| Forced root `pnpm check` trên Node 24.18.0, pnpm 11.18.0, uv 0.11.32 | PASS | Prettier; 5/5 mỗi lint/typecheck/test/build; 5 Node test; 2 pytest |
| Turbo cache-input review | PASS | Root config/lock/workspace files nằm trong global hash; remote cache disabled |
| Secret/config/ignore/scope review | PASS | `.env.example` trống; local env/cache/build ignored; không lấn downstream scope |
| `pnpm audit` + hai exported-lock `pip-audit` | PASS | Không có known vulnerability tại 2026-08-03 |
| Merge resolution | PASS | Không còn marker; 16 revision duy nhất/liên tục; forced root gate và review độc lập không có finding |

### Chưa kiểm tra được

- Fresh clone do người dùng/reviewer thực hiện; Python 3.12/3.13 và Linux/macOS chưa chạy.
- Chưa có CI, automated license/SBOM/dedicated secret/container scan, coverage threshold, negative-cycle fixture hoặc cold-build benchmark; thuộc task chất lượng/hạ tầng sau.

### Invariants và integration

- Giữ `INV-CONTENT-002`, `INV-SEC-001`, `INV-SEC-003`, `INV-CONFIG-001`; regression evidence nằm trong descriptor tests và hygiene/scope scans.
- Không tạo producer/consumer, schema, permission, entity ID, error code, cache invalidation hay shared contract mới.
- Cross-feature integration gate: `PASS` cho isolation/alignment; task downstream vẫn chờ foundation được review/merge.

### Plan conformance và hạn chế

- `DEC-FOUND-TOOLING-001`: `PLAN_LOCKED`; implementation đúng pnpm + Turbo + uv, không deviation.
- Corepack shim bị EPERM trên host Windows; README dùng fallback pnpm exact qua npx đã kiểm chứng.
- uv fallback từ hardlink sang full copy giữa filesystem; đúng chức năng nhưng có thể sync chậm hơn.

### Git action đề xuất

- Merge `origin/develop` vào feature branch: conflict đã resolve/stage; Thành cần tự tạo merge commit local để kết thúc trạng thái merging.
- Nên push feature branch sau khi Thành review: Có, để tạo bằng chứng review; Codex chưa commit/push.
- Đủ điều kiện merge vào `develop`: Chưa, cho đến khi người dùng/nhóm xác nhận `VERIFIED`.
- Merge Memory Sync: `PENDING`; chưa cập nhật `docs/IMPLEMENTATION_INDEX.md` hoặc registry completion khi chưa có bằng chứng merge.
