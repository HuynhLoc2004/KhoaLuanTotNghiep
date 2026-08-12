# FEAT-xxx — Tên chức năng

Sau khi feature đi vào implementation, file này phải đáp ứng `docs/templates/feature-report-standard.md`, gồm sơ đồ Mermaid và phần giải thích.

## Metadata

- Trạng thái: PROPOSED
- Owner:
- Priority:
- Last updated:
- Liên quan:
- Feature owner document: file hiện tại
- Idea/Concept IDs:

## Implementation status

| Hạng mục | Trạng thái | Bằng chứng/Ghi chú |
|---|---|---|
| Spec | PLANNED | |
| UI | PLANNED | |
| API | PLANNED | |
| Data/migration | PLANNED | |
| Security | PLANNED | |
| Tests | PLANNED | |

Trạng thái hợp lệ: `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `DEFERRED`. Chỉ nhóm/người dùng xác nhận `VERIFIED` sau review/test.

## Feature lifecycle

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | | | |
| Claimed | | | |
| Implementation started | | | |
| First IMPLEMENTED | | | |
| VERIFIED | Chỉ sau người dùng xác nhận | | |
| Merged to develop | Chỉ sau xác nhận merge | | |
| Completed | Sau Merge Memory Sync PASS | | |

## Contribution ledger

Áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`. Không dùng Git email, không suy diễn thời lượng từ khoảng nghỉ và không ghi đè lịch sử người trước.

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

## Mục tiêu và giá trị

Mô tả vấn đề, người dùng và kết quả đo được.

## Trong/ngoài phạm vi

Nêu rõ MVP và phần để sau.

## Delivery estimate

| Trường | Giá trị |
|---|---|
| Phạm vi được tính | |
| Không bao gồm | |
| Giả định | |
| Dependency/Blocker | |
| Optimistic | |
| Expected | |
| Pessimistic | |
| Mức tin cậy | LOW/MEDIUM/HIGH |
| Planned start/review/completion | Chỉ ghi khi nhóm cung cấp lịch |
| Actual effort/completion | Chỉ ghi sau khi nhóm xác nhận |

Ước lượng effort theo person-day và theo khoảng. Khi thay đổi estimate, giữ bản cũ trong Change history, ghi revision và lý do.

## Vai trò và quyền

Ai xem, tạo, sửa, duyệt, publish, xóa hoặc export.

## User flow

Liệt kê happy path, alternate path, error/fallback; thêm Mermaid sequence/flow khi cần.

Khi implementation bắt đầu, Mermaid User Flow, System Sequence, Data/State, Auth/Authz và Algorithm Flow là bắt buộc; có thể gộp khi feature đơn giản và ghi lý do.

## UI/UX

Màn hình, loading/empty/error/offline, responsive, accessibility và motion.

## Dữ liệu

Entity, field, quan hệ, index, retention; chỉ rõ PostgreSQL, MongoDB, Redis hay media storage.

Với query/cache, ghi input schema/limit, authorization predicate, query shape/projection/pagination/transaction, index owner và plan evidence, cache key/version/TTL/invalidation/degraded mode. Áp dụng `docs/05-quality/05-database-query-cache-quality-gate.md`.

## API và event

Endpoint, request/response, error, idempotency, pagination, event version và cache invalidation.

## Thuật toán

Input/output, pseudocode hoặc công thức, độ phức tạp, metric đánh giá và ngưỡng.

## Phương án so sánh

| Phương án | Ưu điểm | Nhược điểm | Mức phù hợp |
|---|---|---|---|
| A | | | |
| B | | | |

Với quyết định quan trọng, dùng `docs/templates/option-review-template.md`, chờ người dùng chọn và ghi `PLAN_LOCKED` trước khi code.

Ý tưởng trải nghiệm/giao diện mới dùng thêm `docs/templates/creative-concept-template.md` và đăng ký trong `docs/IDEA_BACKLOG.md`.

## Bảo mật và quyền riêng tư

Threat, validation, authorization, rate limit, secret, consent và audit.

Ghi secret/config flow mà không ghi giá trị thật: config variable, runtime owner, public/server-only, validation/default/range, injection, redaction, rotation, external URL/allowlist và failure behavior. Áp dụng `docs/05-quality/04-code-configuration-quality-gate.md`.

## Hiệu năng và scale

SLO, cache, queue, concurrency, asset budget và failure isolation.

## Kiểm thử

Unit, integration, E2E, AI/data evaluation, load và security cases.

Ghi command/phạm vi/kết quả cho format, lint, typecheck, secret scan, dependency scan và config validation khi tooling đã tồn tại. Không tuyên bố pass cho check chưa chạy.

Nếu feature đọc/ghi dữ liệu, thêm injection/IDOR, query-count/N+1, query plan/index, cache hit/miss/invalidation và response/log redaction tests.

## Tiêu chí nghiệm thu

Các điều kiện kiểm chứng được, tránh câu chung chung như “chạy tốt”.

## Migration, rollout và rollback

Dữ liệu cũ, feature flag, deploy order, monitoring và cách quay lại.

## Câu hỏi mở/rủi ro

Ghi quyết định còn thiếu, owner và hạn chốt.

## Decision log

| ID | Ngày | Trạng thái | Quyết định | Lý do và phương án đã loại | Hệ quả/Thay thế |
|---|---|---|---|---|---|
| DEC-001 | YYYY-MM-DD | DESIGN_OPTIONS/PLAN_LOCKED/SUPERSEDED | | | |

## Change history

| Ngày | Loại | Thay đổi hành vi/Root cause | Module/File | Test/Bằng chứng |
|---|---|---|---|---|
| YYYY-MM-DD | ADDED/CHANGED/FIXED/SECURITY/PERFORMANCE | | | |

Không ghi các thay đổi format hoặc đổi tên biến không ảnh hưởng hành vi. Bug fix phải ghi triệu chứng, root cause và regression test.

## Plan revisions

| Ngày | Phần bị đổi | Plan trước | Plan mới | Lý do/Người xác nhận |
|---|---|---|---|---|
| YYYY-MM-DD | | | | |

Không xóa plan/estimate cũ. Đánh dấu phần cũ `SUPERSEDED` hoặc `DEFERRED` và lưu bản thay thế.
