# Dashboard quản lý và phân tích

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| Events/Aggregation/UI/Tests | PLANNED | Chưa khởi tạo code |

## Mục tiêu

Cho admin theo dõi nội dung, hành vi tổng hợp, sức khỏe AI/job và chất lượng dữ liệu mà không làm nặng API public.

## Nhóm màn hình

- Tổng quan: lượt truy cập, QR scan, tour bắt đầu/hoàn thành, top hiện vật.
- Nội dung: draft/chờ duyệt/đã publish, bản dịch thiếu, media lỗi.
- AI: số nhận diện, top-1/top-3, confidence thấp, feedback sai.
- 3D: job queue, thất bại theo bước, dung lượng, model chưa duyệt.
- Hệ thống: latency, error rate, cache hit, queue depth.
- Audit: ai thay đổi gì, lúc nào, trước/sau.

## Flow dữ liệu

Event -> MongoDB/raw store -> aggregation job theo giờ/ngày -> bảng summary PostgreSQL hoặc collection rollup -> dashboard API cache Redis.

## Thuật toán

- Event dedup bằng `eventId`.
- Unique visitor ước lượng có thể dùng HyperLogLog ở quy mô lớn; MVP dùng session anonymized và aggregate.
- Funnel theo event sequence: view zone -> scan -> play audio -> complete tour.
- Không tính bot/admin traffic khi có thể nhận diện.

## Ưu/nhược điểm

Pre-aggregation giúp dashboard nhanh và giảm tải; dữ liệu trễ vài phút/giờ. Truy vấn raw linh hoạt nhưng tốn tài nguyên. MVP ưu tiên summary và cho export bất đồng bộ.

## Quyền riêng tư

Hiển thị dữ liệu tổng hợp, ẩn IP, hạn chế truy vấn từng người, retention rõ ràng. Export nhạy cảm cần quyền và audit.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | Dashboard đọc dữ liệu pre-aggregated thay vì query raw trực tiếp | Nhanh và ít tải production; số liệu có độ trễ chấp nhận được |

## Feature lifecycle và Contribution ledger

Áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`. Chưa có implementation session; không suy diễn contributor/timestamp từ plan.

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | Baseline docs | Nhóm | Feature plan |
| Claimed/Started/IMPLEMENTED/VERIFIED/Merged/Completed | Chưa có | — | — |

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| Chưa có | — | — | — | — | — | — | PLANNED | — | NOT RUN | Chờ task READY |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline dashboard và analytics | Review tài liệu, chưa có code |
