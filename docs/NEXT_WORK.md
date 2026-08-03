# Danh sách công việc có thể nhận tiếp

File này giúp thành viên mới và AI chọn việc sau khi clone mà không nhận nhầm task đang dang dở của người khác.

## Trạng thái task

- `BLOCKED`: chưa đủ dependency/quyết định.
- `READY`: có thể nhận độc lập.
- `IN_PROGRESS`: đã có người/nhánh thực hiện.
- `PAUSED`: tạm dừng, vẫn giữ owner/branch/write scope.
- `REVIEW`: đã bàn giao, chờ test/review.
- `DONE`: nhóm đã xác nhận hoàn tất.
- `DEFERRED`: chưa ưu tiên.

Chỉ nhóm hoặc người được giao mới thay owner. Coding agent không tự đánh dấu `DONE`.

Muốn chuyển sang task khác phải xử lý task hiện tại theo Task Switching Protocol: `VERIFIED` mới đề xuất merge; `IMPLEMENTED` chỉ push chờ review; `IN_PROGRESS/PAUSED` có thể push WIP nhưng không merge.

Chỉ chuyển task sang `DONE` sau khi merge vào `develop` và Merge Memory Sync đạt `PASS`.

## Quy tắc chọn việc

1. Ưu tiên `READY` có dependency đã hoàn tất.
2. Không đề xuất task `IN_PROGRESS` của người khác.
3. Tránh hai task đồng thời sửa cùng migration, contract hoặc feature owner.
4. Mỗi task phải có branch riêng tạo từ `develop`.
5. Khi nhận task, cập nhật Owner/Branch/Status nếu người dùng cho phép.
6. Claim chỉ được xem là chia sẻ cho cả nhóm sau khi registry trên remote `develop` đã được cập nhật.
7. Kiểm tra `Write scope` để tránh collision; chi tiết tại `docs/07-delivery/06-two-person-collaboration.md`.
8. Kiểm tra integration map; task consumer không chuyển `READY` nếu contract provider cần thiết chưa được accepted hoặc chưa có mock chung.

## Task registry

| ID | Task | Trạng thái | Owner/Branch | Claimed/Updated | Dependency | Estimate | Write scope | Feature owner |
|---|---|---|---|---|---|---|---|---|
| TASK-FOUND-001 | Khởi tạo monorepo, tooling và cấu trúc ứng dụng | DONE | `thanh` / `feature/TASK-FOUND-001` | VerifiedAt: 2026-08-03T12:58:13+07:00; MergedAt: 2026-08-03; merge `3d8b971` | Baseline docs | 1–2 person-days, MEDIUM; actual effort chưa được team cung cấp | Root workspace/tooling config; app/service/worker/package skeletons; `docs/work/TASK-FOUND-001.md`; không gồm shared status files, `infra/**`, Compose, migration hoặc hành vi/contract nghiệp vụ | `docs/work/TASK-FOUND-001.md`; Merge Memory Sync PASS |
| TASK-INFRA-001 | Docker Compose cho PostgreSQL, MongoDB, Redis và health checks | DONE | `loc` / `feature/TASK-INFRA-001` | VerifiedAt: 2026-08-03T12:00:24+07:00; MergedAt: 2026-08-03; merge `847251c` | TASK-FOUND-001 interface baseline; implementation độc lập trong write scope | O/E/P: 1/2/3 person-days, MEDIUM; actual effort chưa được team cung cấp | `infra/**`, `docs/work/TASK-INFRA-001.md`; không sửa shared status files/root tooling/app skeleton | `docs/work/TASK-INFRA-001.md`; Merge Memory Sync PASS |
| TASK-WEB-001 | Public Web shell + design tokens + CMS renderer skeleton | DONE | `thanh` / `feature/TASK-WEB-001` | VerifiedAt: 2026-08-03T21:38:00+07:00; MergedAt: 2026-08-03; merge `03dfcd4` | TASK-FOUND-001 (DONE) | O/E/P: 2/3/4 person-days, LOW; actual effort chưa được team cung cấp | `apps/web/**`, `packages/ui/**`, `docs/work/TASK-WEB-001.md`; không sửa shared status files/root tooling | `docs/work/TASK-WEB-001.md`; Merge Memory Sync PASS |
| TASK-ADMIN-001 | Admin shell + navigation + CMS form foundation | DONE | `thanh` / `feature/TASK-ADMIN-001` | VerifiedAt: 2026-08-03T21:47:40+07:00; MergedAt: 2026-08-03; merge `5ce59f2` | TASK-FOUND-001 (DONE), TASK-API-001 (DONE) | O/E/P: 2/3/4 person-days, LOW; actual effort chưa được team cung cấp | `apps/admin/**`, CMS contracts, `docs/work/TASK-ADMIN-001.md`; không sửa shared status files/root tooling | `docs/work/TASK-ADMIN-001.md`; Merge Memory Sync PASS |
| TASK-API-001 | Express API skeleton, health endpoint và validation/error contract | DONE | `thanh` / `feature/TASK-API-001` | VerifiedAt: 2026-08-03T21:43:00+07:00; MergedAt: 2026-08-03; merge `8afa7c8` | TASK-FOUND-001 (DONE) | O/E/P: 1/2/3 person-days, MEDIUM; actual effort chưa được team cung cấp | `services/api/**`, base contracts, `docs/work/TASK-API-001.md`; không sửa shared status files/root tooling | `docs/work/TASK-API-001.md`; Merge Memory Sync PASS |
| TASK-CI-001 | Foundation CI Quality Gate trên GitHub Actions | IN_PROGRESS | `loc` / `feature/TASK-CI-001` | ClaimedAt: 2026-08-03T21:28:23+07:00; ScopeRevisedAt: 2026-08-03 | TASK-FOUND-001 (DONE); không phụ thuộc TASK-API-001 | O/E/P: 0.5/1/2 person-days, MEDIUM-HIGH | `.github/workflows/**`, `docs/work/TASK-CI-001.md`, formatting-only `infra/compose.yaml`; không sửa Compose behavior, `services/api/**`, `packages/contracts/**`, root tooling hoặc shared status files trên feature | `docs/work/TASK-CI-001.md` → promote vào Quality/DevOps owner sau merge |
| TASK-DATA-001 | PostgreSQL migration foundation và entity baseline | IN_PROGRESS | `thanh` / `feature/TASK-DATA-001` | ClaimedAt: 2026-08-03T21:49:58+07:00 | TASK-FOUND-001 (DONE), TASK-API-001 (DONE) | 2–4 person-days, LOW | `services/api/src/db/**`, `migrations/**`, `docs/work/TASK-DATA-001.md` | `docs/02-data/01-data-model.md` |
| TASK-TIMELINE-001 | MVP Dòng thời gian sống: free/guided modes, related artifacts, CMS graph, public API và timeline 2D | BLOCKED | Chưa có | — | TASK-FOUND-001, CMS/API/data/artifact/tour contract baseline và content/relation mẫu đã duyệt | 9/18/36 person-days, LOW | Shared QR/mode/relation contract; Narrative/Artifact modules; Admin journey/relation editor; Public free/timeline UX; tests/docs | `docs/03-features/11-living-timeline.md` |
| TASK-SEARCH-001 | Search contract, indexing và public discovery MVP | BLOCKED | Chưa có | — | Foundation, API, data và CMS/artifact baseline | 8–18 person-days, LOW | search module/contracts/index/UI | `docs/03-features/09-search-discovery.md` |
| TASK-LOCATION-001 | QR location và visual place recognition | BLOCKED | Chưa có | — | Foundation, map graph, CMS/media, AI worker và dataset | 12–28 person-days, LOW | location contracts/API/vision/UI | `docs/03-features/10-indoor-location-detection.md` |
| TASK-DOC-QUALITY-001 | Documentation, code/config, secret và data-access Quality Gate trong CI | BLOCKED | Chưa có | — | TASK-FOUND-001, TASK-API-001/data tooling, accepted Quality Gate schemas | 3–6 person-days, LOW | docs lint, static checks, secret/config/dependency scan, injection/query/cache regression, CI tests | `docs/04-design/03-ai-experience-quality-gate.md`; `docs/05-quality/04-code-configuration-quality-gate.md`; `docs/05-quality/05-database-query-cache-quality-gate.md` |

Estimate trên chỉ phục vụ chọn việc và phải được rà soát lại khi bắt đầu task.

## Đề xuất hiện tại

`TASK-FOUND-001` và `TASK-INFRA-001` đã `DONE`. `TASK-API-001` do `thanh` thực hiện trong `services/api/**` + base contracts; `TASK-CI-001` do `loc` thực hiện trong `.github/workflows/**`. Hai scope không giao nhau. Hiện không còn task `READY`; task mới chỉ mở sau khi kiểm tra dependency/write scope.

- Một người nhận `TASK-API-001` khi contract skeleton đã sẵn sàng.
- Người còn lại nhận `TASK-WEB-001` trước, rồi `TASK-ADMIN-001`.

Không mở AI/3D/CMS nghiệp vụ trước khi foundation, contract và data baseline đủ ổn định.

`TASK-TIMELINE-001` đã có concept `PLAN_LOCKED` nhưng vẫn `BLOCKED`; không claim hoặc tạo branch timeline trước khi các dependency và write-scope coordination với CMS/Web/API được chấp nhận trên `develop`.

## Mẫu thêm task

| ID | Task | Trạng thái | Owner/Branch | Claimed/Updated | Dependency | Estimate | Write scope | Feature owner |
|---|---|---|---|---|---|---|---|---|
| TASK-XXX-001 | Đầu ra kiểm chứng được | READY/BLOCKED | Chưa có | — | Task/decision liên quan | O/E/P + confidence | File/module dự kiến sửa | Đường dẫn `.md` |

Khi thêm chức năng mới, tạo/cập nhật feature file trước rồi mới thêm task ở đây.
