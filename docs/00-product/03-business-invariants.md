# Business invariants

Đây là các điều kiện luôn phải đúng. Mọi thay đổi chạm invariant phải có regression test. Chỉ được sửa/xóa invariant khi người dùng xác nhận và ADR ghi rõ quyết định thay thế.

| ID | Invariant | Phạm vi kiểm tra |
|---|---|---|
| INV-CONTENT-001 | Draft, rejected, archived hoặc ngoài thời gian hiệu lực không xuất hiện trong public API. | API, cache, search, RAG |
| INV-CONTENT-002 | Menu, banner, page, tour, artifact, translation và media production không hard-code trong React. | Web/Admin/CMS |
| INV-CONTENT-003 | Publish thành công mới được phát cache-invalidation event. | CMS, outbox, Redis |
| INV-CONTENT-004 | Rollback tạo phiên bản/audit mới; không xóa lịch sử phiên bản cũ. | CMS, PostgreSQL |
| INV-AUTH-001 | Frontend không quyết định quyền; backend luôn kiểm tra permission và ownership. | Mọi mutation/private read |
| INV-AUTH-002 | User không đọc/sửa lịch sử, favorite, asset hoặc job của user khác. | User API |
| INV-AUTH-003 | Admin action quan trọng phải có actor, timestamp, target và before/after phù hợp. | Audit |
| INV-AI-001 | AI không tự publish nội dung chính thức. | Guide, translation, generated content |
| INV-AI-002 | Recognition confidence thấp phải trả unknown/top-k fallback, không khẳng định chắc chắn. | Recognition |
| INV-AI-003 | AI Guide không đủ nguồn đã duyệt phải nói chưa đủ dữ liệu. | RAG |
| INV-AI-004 | Ảnh người dùng không dùng train nếu chưa có consent phù hợp. | Dataset pipeline |
| INV-3D-001 | Hiện vật thiếu/hỏng model 3D vẫn truy cập được bằng media/text fallback. | Public UI |
| INV-3D-002 | Model chưa review không public như Digital Twin chính thức. | CMS, media delivery |
| INV-DATA-001 | PostgreSQL là nguồn sự thật cho quyền, publish state và entity nghiệp vụ. | Data layer |
| INV-DATA-002 | Binary media không lưu trực tiếp trong PostgreSQL/MongoDB. | Upload/storage |
| INV-DATA-003 | Consumer event/job phải idempotent; retry không tạo bản ghi nghiệp vụ trùng. | Outbox, BullMQ |
| INV-SEC-001 | Secret, access token và connection string thật không được commit hoặc log. | Repo, CI, observability |
| INV-SEC-002 | Upload phải giới hạn size/type, kiểm tra nội dung và dùng ID không đoán được. | Media |
| INV-UX-001 | Reduced motion/Lite tier giữ đầy đủ nội dung và thao tác. | Web/PWA/Admin |
| INV-UX-002 | Animation/3D không chặn người dùng đọc, điều hướng hoặc hoàn thành tác vụ. | Public UI |

## Quy trình thay đổi

1. Ghi invariant bị ảnh hưởng trong feature/`CURRENT_TASK.md`.
2. Thêm test hoặc giải thích vì sao chưa thể tự động hóa.
3. Nếu muốn đổi invariant, tạo ADR và yêu cầu người dùng xác nhận.
4. Giữ invariant cũ với trạng thái `SUPERSEDED`, không xóa lịch sử.
