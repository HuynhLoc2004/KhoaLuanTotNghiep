# Tiêu chí nghiệm thu toàn hệ thống

## Nội dung và Admin

- Admin CRUD và publish menu, banner, page, exhibition, zone, artifact, tour, translation và media.
- Public UI đọc nội dung từ API/CMS; seed demo không nằm hard-code trong component.
- Có preview, version, audit, schedule và rollback.

## Trải nghiệm khách

- Responsive mobile/desktop, hỗ trợ keyboard và reduced motion.
- QR mở đúng stop; audio/text đa ngôn ngữ.
- Bản đồ chọn điểm, tính đường và có 2D fallback.
- Hiện vật không có 3D vẫn có trải nghiệm hoàn chỉnh.

## AI và 3D

- Recognition trả top-k/confidence/model version và xử lý unknown.
- AI Guide trả nguồn, không đủ dữ liệu thì từ chối hợp lý.
- Job dài qua queue, có progress/retry/idempotency.
- Model 3D có provenance/version/review và performance budget.

## Dữ liệu và bảo mật

- PostgreSQL/MongoDB/Redis dùng đúng trách nhiệm; đồng bộ event bằng outbox.
- Google login, RBAC, ownership và audit hoạt động.
- Secret không vào Git; upload/rate limit/input validation được kiểm thử.
- Có privacy, retention và xóa dữ liệu người dùng.

## Hiệu năng/vận hành

- Load test đạt 300–500 concurrent users theo kịch bản đã công bố.
- Nginx phân phối tới ít nhất hai API replica trong bài test scale.
- Metrics/log/correlation ID và runbook đủ xử lý lỗi demo.
- Docker setup tái lập được trên máy thành viên mới từ tài liệu.

## Bằng chứng bàn giao

OpenAPI, ERD, sequence diagram, báo cáo benchmark, model metrics, test report, threat model, video demo, dữ liệu seed và hướng dẫn vận hành.
