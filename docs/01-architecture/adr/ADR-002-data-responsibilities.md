# ADR-002 — Trách nhiệm dữ liệu

- Ngày: 2026-07-29
- Trạng thái: ACCEPTED

## Quyết định

- PostgreSQL: nguồn sự thật nghiệp vụ, auth, quyền, publish, tour, graph và job.
- MongoDB: conversation, inference/interaction event và metadata linh hoạt.
- Redis: cache, rate limit, lock, queue và state ngắn hạn.
- Cloudinary/object storage: binary media/3D.

## Lý do

Giữ transaction và quan hệ ở SQL, tránh làm schema SQL phình bởi log linh hoạt, đồng thời không dùng NoSQL cho quyền/trạng thái quan trọng.

## Hệ quả

Không transaction phân tán. Dùng transactional outbox, idempotent consumer và eventual consistency cho analytics/log.
