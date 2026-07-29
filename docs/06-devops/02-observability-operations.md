# Quan sát hệ thống và vận hành

## Ba trụ cột

- Log JSON có timestamp, level, service, correlationId, route, latency; redaction secret/PII.
- Metrics: request rate/error/duration, DB pool, Redis hit rate, queue depth, job duration, AI provider latency/cost.
- Trace: request từ Nginx/API qua queue/worker bằng trace/correlation ID.

## Dashboard vận hành

RED metrics cho API; USE metrics cho CPU/memory/network; business metrics tách khỏi system metrics. Cảnh báo theo triệu chứng người dùng như error rate/latency, không chỉ CPU.

## Runbook tối thiểu

- Redis unavailable: giảm chức năng AI, bảo vệ DB, bật cache fallback hạn chế.
- PostgreSQL pool exhausted: kiểm tra slow query/leak, hạ concurrency.
- Queue backlog: dừng nhận job mới theo quota, scale worker, không xóa job.
- Cloudinary quota/error: khóa upload mới, giữ nội dung đã cache.
- AI provider down: trả nội dung curated và thông báo dịch vụ tạm gián đoạn.

## Backup

PostgreSQL backup định kỳ + point-in-time nếu production; Mongo backup theo retention; Cloudinary asset có metadata/checksum và export cần thiết. Thực hiện restore drill, vì backup chưa restore thử chưa được xem là an toàn.
