# Hiệu năng và khả năng mở rộng

## Mục tiêu tải

300–500 concurrent users chủ yếu đọc nội dung, quét QR và nghe audio; AI/3D bị giới hạn concurrency và xử lý queue.

## Ngân sách

- API cache hit p95 < 200 ms; cache miss phổ biến p95 < 500 ms.
- Error rate < 1% trong load test mục tiêu.
- LCP p75 < 2.5 s trên trang nội dung; JS initial gzip mục tiêu < 250 KB, 3D tách bundle.
- 3D mobile mục tiêu 30 FPS; desktop 45–60 FPS trên scene chuẩn.
- Main-thread long task trên 50 ms phải được theo dõi; animation không được liên tục gây long task.
- Scene đặt budget theo quality tier: triangle, draw call, texture memory và số post-processing pass; con số cuối được chốt bằng benchmark thiết bị mục tiêu.

## Chiến lược

- Nginx load balance nhiều API stateless; session không phụ thuộc một node.
- Redis cache-aside với TTL jitter chống cache stampede.
- CDN/Cloudinary phục vụ media, range request cho audio/video.
- PostgreSQL connection pooling, index theo query plan, tránh N+1.
- Cursor pagination, giới hạn field, compression Brotli/gzip.
- Queue + worker autoscale logic cho AI/3D; backpressure khi queue sâu.
- Capability-based quality tier, dynamic import animation/3D libraries và dispose tài nguyên WebGL khi rời scene.

## Cache invalidation

Key có content version. Publish ghi outbox event và xóa namespace liên quan. Có stale-while-revalidate cho nội dung public; không cache dữ liệu cá nhân chung.

Mọi query/index/cache phải qua `05-database-query-cache-quality-gate.md`: baseline và query-plan evidence, projection/pagination/timeout, index read-vs-write cost, scoped versioned key, TTL jitter, stampede protection và authorization đúng ở cả hit/miss. Không tuyên bố “đã tối ưu” chỉ từ code review.

## Capacity test

K6 scenarios:

1. Ramp 0 -> 300 -> 500 virtual users.
2. 70% page/artifact reads, 15% search, 10% QR, 5% auth/history.
3. AI test riêng với quota và mock provider để đo API/queue.
4. Spike 2x trong 1–2 phút và soak 60 phút.
5. Đo FPS, memory, dropped frame và thời gian dispose/re-enter cho các trang cinematic.

## Kafka decision gate

Chỉ xem xét Kafka khi BullMQ không đáp ứng, cần replay/audit stream dài hạn, nhiều consumer độc lập hoặc số liệu chứng minh Redis là nút thắt. Với MVP, Kafka tăng chi phí vận hành mà ít giá trị.

## Scale path

1. Tối ưu asset/query/cache.
2. Tách API stateless thành nhiều replica sau Nginx.
3. Tách read replica PostgreSQL và worker pool.
4. Tách analytics/event pipeline.
5. Chỉ sau đó cân nhắc Kubernetes/Kafka.
