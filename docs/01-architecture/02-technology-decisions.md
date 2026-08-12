# Lựa chọn công nghệ

| Lớp | Công nghệ | Lý do | Điểm yếu / cách giảm |
|---|---|---|---|
| Frontend | React, TypeScript, Vite | Nhanh, hệ sinh thái tốt | SEO kém nếu SPA thuần; prerender trang public quan trọng |
| UI | Tailwind CSS, shadcn/ui, Framer Motion | Design system nhanh, animation mượt | Dễ lạm dụng hiệu ứng; đặt motion budget |
| Data client | TanStack Query | Cache, retry, invalidation rõ | Cần chuẩn hóa query key |
| 3D | Three.js + React Three Fiber, Drei | WebGL mạnh, React-friendly | Bundle/GPU lớn; lazy load và LOD |
| State | Zustand | Nhẹ cho state cục bộ | Không dùng thay server state |
| API | Express + TypeScript | Nhanh cho đồ án, dễ tuyển người | Cần tự đặt convention; dùng Zod/OpenAPI |
| AI | Python + FastAPI | Thư viện AI/CV phong phú | Thêm service vận hành; cô lập bằng Docker |
| SQL | PostgreSQL + pgvector | Quan hệ, transaction, full text/vector | Cần index và migration kỷ luật |
| NoSQL | MongoDB | Log/hội thoại linh hoạt | Tránh dùng cho dữ liệu cần transaction quan hệ |
| Cache/Queue | Redis + BullMQ | Đủ cho MVP, đơn giản | Không phải event backbone dài hạn |
| Event scale | Kafka (giai đoạn sau) | Throughput, replay, consumer độc lập | Quá nặng cho MVP, vận hành phức tạp |
| Media | Cloudinary | CDN, transform, quản lý media | Chi phí/quota/vendor lock-in; lưu public ID và adapter |
| Auth | OIDC Google + JWT ngắn hạn | Trải nghiệm tốt | Cần chống token theft và account linking sai |
| Infra | Docker Compose + Nginx | Tái lập local, gần production | Compose không tự orchestration nhiều node |

## ADR quan trọng

### PWA trước native

Mức phù hợp: rất cao cho đồ án. Một codebase hỗ trợ QR, camera, audio và cài đặt. Hạn chế iOS/offline/background cần được kiểm thử thực tế; chỉ dùng Capacitor khi cần API native.

### BullMQ trước Kafka

Mức phù hợp: cao ở 300–500 concurrent users. Kafka chỉ hợp lý khi cần replay sự kiện lớn, nhiều consumer độc lập hoặc throughput vượt khả năng Redis queue. Không đưa Kafka vào chỉ để “đủ công nghệ”.

### Modular monolith trước microservices

Mức phù hợp: rất cao. Module hóa code, schema và event nội bộ nhưng deploy một API. AI/3D là ngoại lệ vì workload khác.
