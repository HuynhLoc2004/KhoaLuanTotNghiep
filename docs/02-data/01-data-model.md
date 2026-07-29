# Mô hình dữ liệu

## PostgreSQL — dữ liệu nghiệp vụ

Các bảng chính:

- `users`, `auth_accounts`, `roles`, `permissions`, `user_roles`.
- `pages`, `page_sections`, `menus`, `menu_items`, `banners`.
- `artifacts`, `artifact_translations`, `artifact_media`, `artifact_versions`.
- `exhibitions`, `exhibition_artifacts`, `zones`, `floors`, `map_nodes`, `map_edges`.
- `tours`, `tour_stops`, `qr_codes`, `audio_tracks`.
- `digital_twins`, `model_versions`, `processing_jobs`.
- `favorites`, `visit_history`, `user_generated_assets`.
- `publishing_workflows`, `audit_events`, `redirects`.

## Quan hệ cốt lõi

- Một `artifact` có nhiều bản dịch, media và phiên bản Digital Twin.
- Một `exhibition` có nhiều hiện vật qua bảng nối có thứ tự.
- Một `tour` có nhiều `tour_stops`; stop tham chiếu zone/artifact và audio.
- Một tầng có graph gồm node và edge; POI có thể gắn với zone/artifact.
- `page_section` lưu `type` và JSONB cấu hình đã được validate theo schema; đây là nền tảng page builder không hard-code nội dung.

## MongoDB — dữ liệu linh hoạt

Collections:

- `ai_conversations`: phiên chat, message, nguồn trích dẫn, locale.
- `inference_events`: model version, top-k, confidence, latency, feedback.
- `interaction_events`: view, scan, search, navigation, anonymized session.
- `raw_ingestion_metadata`: metadata từ scan/import chưa chuẩn hóa.

MongoDB không giữ quyền, trạng thái publish hay nguồn sự thật của hiện vật.

## Redis

- `public:{locale}:{resource}:{version}:{hash}`: cache API public.
- `ratelimit:{scope}:{identity}`: token bucket/sliding window.
- `job:{jobId}:progress`: tiến độ ngắn hạn.
- `session:{sessionId}`: session/refresh state nếu cần.
- `lock:{resourceId}`: khóa ngắn chống chạy job trùng.

## Đồng bộ đa database

Không dùng transaction phân tán. PostgreSQL commit nghiệp vụ và ghi `outbox_events` trong cùng transaction. Worker đọc outbox, ghi Mongo/queue theo idempotency key. Consumer lưu `processed_event_id` để chống xử lý lặp.

Ưu điểm: không mất event sau commit. Nhược điểm: eventual consistency; UI phải chấp nhận analytics/log cập nhật chậm.

## Index dự kiến

- Unique: slug theo locale/phạm vi, QR token, provider account.
- B-tree: `status`, `published_at`, `zone_id`, `artifact_id`, `created_at`.
- GIN: full-text tiếng Việt đã chuẩn hóa, JSONB có truy vấn thực tế.
- HNSW/IVFFlat pgvector cho embedding; chỉ tạo sau khi đánh giá kích thước dataset.
- Mongo TTL index cho log tạm; compound index theo `sessionId + createdAt`.

## Xóa và lưu giữ

- Nội dung dùng soft delete và versioning.
- Audit log không cho sửa từ UI.
- User có thể yêu cầu xóa dữ liệu cá nhân; event analytics được ẩn danh.
- Chính sách retention cấu hình theo collection, không lưu ảnh upload tạm vô hạn.
