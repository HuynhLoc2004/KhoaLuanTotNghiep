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
| TASK-FOUND-001 | Khởi tạo monorepo, tooling và cấu trúc ứng dụng | READY | Chưa có | — | Baseline docs | 1–2 person-days, MEDIUM | Root config, app/service/package skeletons | `docs/06-devops/01-local-environment.md` |
| TASK-INFRA-001 | Docker Compose cho PostgreSQL, MongoDB, Redis và health checks | BLOCKED | Chưa có | — | TASK-FOUND-001 | 1–2 person-days, MEDIUM | `infra/**`, Compose, service health config | `docs/06-devops/01-local-environment.md` |
| TASK-WEB-001 | Public Web shell + design tokens + CMS renderer skeleton | BLOCKED | Chưa có | — | TASK-FOUND-001, contract skeleton | 2–4 person-days, LOW | `apps/web/**`, `packages/ui/**` | `docs/04-design/01-ui-ux-design-system.md` |
| TASK-ADMIN-001 | Admin shell + navigation + CMS form foundation | BLOCKED | Chưa có | — | TASK-FOUND-001, auth/contract skeleton | 2–4 person-days, LOW | `apps/admin/**`, CMS contracts | `docs/03-features/01-admin-cms.md` |
| TASK-API-001 | Express API skeleton, health endpoint và validation/error contract | BLOCKED | Chưa có | — | TASK-FOUND-001 | 1–3 person-days, MEDIUM | `services/api/**`, base contracts | `docs/02-data/02-api-contract.md` |
| TASK-DATA-001 | PostgreSQL migration foundation và entity baseline | BLOCKED | Chưa có | — | TASK-FOUND-001, TASK-API-001 | 2–4 person-days, LOW | migrations, schema, seed foundation | `docs/02-data/01-data-model.md` |
| TASK-SEARCH-001 | Search contract, indexing và public discovery MVP | BLOCKED | Chưa có | — | Foundation, API, data và CMS/artifact baseline | 8–18 person-days, LOW | search module/contracts/index/UI | `docs/03-features/09-search-discovery.md` |

Estimate trên chỉ phục vụ chọn việc và phải được rà soát lại khi bắt đầu task.

## Đề xuất hiện tại

Task duy nhất đang `READY` là `TASK-FOUND-001`. Sau khi hoàn tất và nhóm xác nhận, có thể mở song song:

- Một người nhận `TASK-API-001` + `TASK-INFRA-001` nếu ranh giới file rõ.
- Người còn lại nhận `TASK-WEB-001` trước, rồi `TASK-ADMIN-001`.

Không mở AI/3D/CMS nghiệp vụ trước khi foundation, contract và data baseline đủ ổn định.

## Mẫu thêm task

| ID | Task | Trạng thái | Owner/Branch | Claimed/Updated | Dependency | Estimate | Write scope | Feature owner |
|---|---|---|---|---|---|---|---|---|
| TASK-XXX-001 | Đầu ra kiểm chứng được | READY/BLOCKED | Chưa có | — | Task/decision liên quan | O/E/P + confidence | File/module dự kiến sửa | Đường dẫn `.md` |

Khi thêm chức năng mới, tạo/cập nhật feature file trước rồi mới thêm task ở đây.
