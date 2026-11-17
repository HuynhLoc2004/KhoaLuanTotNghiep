# PHỤ LỤC

---

## PHỤ LỤC A: BẢNG KẾ HOẠCH THỰC HIỆN VÀ PHÂN CÔNG ĐÁNH GIÁ NHIỆM VỤ KHÓA LUẬN

Bảng sau đây tổng kết toàn bộ tiến độ thực hiện đề tài qua các giai đoạn nghiên cứu, 4 đợt tác nghiệp thực địa tại Bảo tàng Lịch sử TP. Hồ Chí Minh và ma trận phân công chi tiết giữa 2 sinh viên thực hiện:

*Bảng A.1: Bảng phân công nhiệm vụ và tiến độ thực hiện đề tài qua 4 đợt tác nghiệp*

| Giai đoạn / Đợt tác nghiệp | Nhiệm vụ chính và Sản phẩm bàn giao | Sinh viên phụ trách chính | Tỷ lệ hoàn thành |
| :--- | :--- | :--- | :---: |
| **Giai đoạn 1: Khởi động & Khảo sát** *(Đợt tác nghiệp 1 tại bảo tàng)* | - Khảo sát không gian 18 gian phòng trưng bày và các cửa thông phòng.<br>- Nghiên cứu tài liệu lịch sử, quy định chụp ảnh và bảo tồn.<br>- Thiết lập kiến trúc hệ thống tổng thể và đặc tả yêu cầu phần mềm. | Huỳnh Tấn Lộc (70%)<br>Trịnh Vĩ Thành (30%) | 100% |
| **Giai đoạn 2: Nghiên cứu thuật toán & Thử nghiệm** *(Đợt tác nghiệp 2 tại bảo tàng)* | - Xây dựng thuật toán ghép ảnh 360° tự động từ video điện thoại (Cylindrical Warping, RootSIFT, Laplacian Blending).<br>- Thu thập video mẫu thử nghiệm, xử lý hiện tượng lệch mí và lóa tủ kính.<br>- Xây dựng Động cơ sinh 3D CPU Heuristic (`artifact_3d_generator.py`). | Huỳnh Tấn Lộc (60%)<br>Trịnh Vĩ Thành (40%) | 100% |
| **Giai đoạn 3: Hiện thực hóa phần mềm & Thu thập dữ liệu** *(Đợt tác nghiệp 3 tại bảo tàng)* | - Thu thập trọn vẹn dữ liệu ảnh 360° của 18 gian phòng và hiện vật tiêu biểu.<br>- Phát triển giao diện Three.js WebGL, Mini-map dẫn đường Dijkstra.<br>- Tích hợp Trợ lý AI Google Gemini 2.5 Flash, thanh toán VietQR PayOS và soát vé camera QR di động. | Huỳnh Tấn Lộc (50%)<br>Trịnh Vĩ Thành (50%) | 100% |
| **Giai đoạn 4: Đánh giá thực nghiệm & Hoàn thiện** *(Đợt tác nghiệp 4 tại bảo tàng)* | - Triển khai hệ thống lên máy chủ đám mây trực tuyến.<br>- Kiểm thử tải và đo đạc hiệu năng FPS, RAM trên mạng di động 4G tại bảo tàng.<br>- So sánh thực nghiệm Động cơ 3D CPU Heuristic với GPU TRELLIS.<br>- Biên soạn toàn văn báo cáo Khóa luận tốt nghiệp chuẩn quy cách IUH. | Huỳnh Tấn Lộc (50%)<br>Trịnh Vĩ Thành (50%) | 100% |

---

## PHỤ LỤC B: LƯỢC ĐỒ CƠ SỞ DỮ LIỆU HỆ THỐNG (POSTGRESQL & MONGODB)

Hệ thống sử dụng mô hình lưu trữ lai (Hybrid Persistence Architecture) nhằm tối ưu hóa tính toàn vẹn dữ liệu giao dịch tài chính và tính linh hoạt của dữ liệu không gian bảo tàng:

### B.1. Lược đồ các bảng dữ liệu quan hệ trong PostgreSQL
Bảo đảm tính toàn vẹn giao dịch (ACID) cho định danh người dùng, quản trị vai trò, vé tham quan và nhật ký kiểm toán hệ thống:

*Bảng B.1: Cấu trúc các bảng dữ liệu cốt lõi trong PostgreSQL*

| Tên bảng | Các trường dữ liệu chính | Ràng buộc khóa & Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `roles` | `id` (PK, SERIAL), `name` (VARCHAR, UNIQUE), `description` (TEXT), `created_at` (TIMESTAMP) | Lưu danh mục vai trò người dùng trong hệ thống (`ADMIN`, `STAFF`, `USER`). |
| `users` | `id` (PK, UUID), `role_id` (FK -> `roles.id`), `email` (VARCHAR, UNIQUE), `password_hash` (VARCHAR), `full_name` (VARCHAR), `is_active` (BOOLEAN) | Quản lý thông tin tài khoản đăng nhập của ban quản trị và nhân viên soát vé. |
| `ticket_types` | `id` (PK, UUID), `name` (VARCHAR), `price` (DECIMAL), `description` (TEXT), `is_active` (BOOLEAN) | Lưu thông tin các hạng vé tham quan (Vé người lớn: 30.000 VNĐ, Vé sinh viên/trẻ em: 15.000 VNĐ). |
| `ticket_time_slots` | `id` (PK, UUID), `start_time` (TIME), `end_time` (TIME), `max_capacity` (INT), `is_active` (BOOLEAN) | Khung giờ tham quan quy định (Sáng: 08:00 – 11:30, Chiều: 13:30 – 17:00). |
| `orders` | `id` (PK, UUID), `customer_name` (VARCHAR), `customer_email` (VARCHAR), `total_amount` (DECIMAL), `status` (VARCHAR), `payos_order_code` (BIGINT, UNIQUE) | Lưu trữ đơn đặt vé trực tuyến và mã giao dịch liên kết cổng thanh toán VietQR PayOS. |
| `tickets` | `id` (PK, UUID), `order_id` (FK -> `orders.id`), `ticket_code` (VARCHAR, UNIQUE), `status` (VARCHAR), `used_at` (TIMESTAMP) | Lưu từng vé điện tử có mã định dạng `BTLS-YYYY-XXXXXXXX` kèm trạng thái soát vé (`valid`, `used`, `expired`). |
| `system_branding` | `id` (PK, INT), `museum_name_vi` (VARCHAR), `museum_name_en` (VARCHAR), `logo_url` (VARCHAR), `tagline` (TEXT), `updated_at` (TIMESTAMP) | Lưu cấu hình nhận diện thương hiệu CMS đồng bộ tức thì qua kênh SSE. |

### B.2. Lược đồ các bộ sưu tập tài liệu trong MongoDB
Lưu trữ không gian đồ họa 360°, tọa độ các điểm liên kết phòng và dữ liệu hiện vật 3D đa cấu trúc:

*Bảng B.2: Cấu trúc các Collection cốt lõi trong MongoDB*

| Tên Collection | Cấu trúc dữ liệu lược đồ chính (Schema) | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `rooms` | `_id` (ObjectId), `room_number` (Int), `name` (String), `historical_period` (String), `panorama_url` (String), `thumbnail_url` (String), `audio_guide` ({vi: String, en: String}), `hotspots` (Array), `connected_rooms` (Array), `created_at` (Date) | Lưu trữ thông tin chi tiết từng gian phòng trong 18 phòng trưng bày, đường dẫn ảnh toàn cảnh $360^\circ$ và liên kết đồ thị phòng kế cận. |
| `artifacts` | `_id` (ObjectId), `room_id` (ObjectId), `name` (String), `epoch` (String), `origin` (String), `material` (String), `dimensions` (String), `model_3d_url` (String), `model_3d_engine` (String: `'heuristic'` / `'trellis'`), `image_url` (String), `historical_significance` (String) | Lưu hồ sơ khoa học cổ vật, liên kết tệp mô hình 3D (.GLB), ảnh chụp gốc và cờ phân loại động cơ tái tạo. |
| `floor_plans` | `_id` (ObjectId), `map_name` (String), `image_url` (String), `room_nodes` (Array: `[{room_id, x, y, neighbors: [{room_id, distance}]}]`) | Lưu trữ sơ đồ mặt bằng kiến trúc và ma trận khoảng cách phục vụ thuật toán Dijkstra dẫn đường. |

