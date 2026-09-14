# KẾ HOẠCH BÀN GIAO KỸ THUẬT & HƯỚNG DẪN DÀNH CHO THÀNH (HOẶC AI CỦA THÀNH)
## NỀN TẢNG BẢO TÀNG SỐ — BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH

> **Tài liệu chuyển giao (Developer Handover Guide)**
> Tác giả: **Huỳnh Tấn Lộc** (`loc`)
> Người nhận: **Trịnh Vĩ Thành** (`thanh`)
> Trạng thái nhánh: Đã hợp nhất vào `develop` và `feature/TASK-3D-TOUR-001` trên GitHub: [HuynhLoc2004/KhoaLuanTotNghiep](https://github.com/HuynhLoc2004/KhoaLuanTotNghiep).

---

## 1. TỔNG KẾT NHỮNG GÌ LỘC ĐÃ HOÀN THÀNH

Lộc đã hoàn thành trọn vẹn module **3D Virtual Tour Không Gian Bảo Tàng (3D Gaussian Splatting - 3DGS)** với luồng tự động từ Admin đến Người dùng:

1. **Hạ Tầng 5 Dịch Vụ Docker Hóa Trọn Gói (`docker-compose.yml`)**:
   - `museum_frontend`: Cổng `3001` (React + Three.js + `@mkkellogg/gaussian-splats-3d` + GSAP).
   - `museum_backend_api`: Cổng `3000` (Node.js Express Gateway, Multer upload, RabbitMQ publisher, Redis status).
   - `museum_worker_3dgs`: Python 3.11 Worker chạy ngầm, tự động kết nối RabbitMQ xử lý hàng đợi tái tạo 3D.
   - `museum_rabbitmq`: Cổng `5672`, Web Dashboard `15672` (Tài khoản: `guest` / `guest`).
   - `museum_redis`: Cổng `6379` (Lưu trạng thái tiến độ và cache Tour metadata).

2. **Pipeline Computer Vision Chuyên Sâu (`backend/worker_3dgs/pipeline.py`)**:
   - **Lọc nhòe chuyển động (Motion Blur)**: Thuật toán Laplacian Variance $\sigma^2(\nabla^2 I)$ với cơ chế cửa sổ thích ứng, đảm bảo quét 100% góc cạnh và loại bỏ frame rung lắc.
   - **Cấu hình COLMAP SfM nâng cao**: Khử méo góc rộng bằng camera model `OPENCV`, trích xuất đặc trưng tường trơn với SIFT peak threshold `0.004`, và khép kín vòng lặp phòng $360^\circ$ (`loop_detection 1`) để vách tường không bị lệch góc hay nứt vách.
   - **Huấn luyện 3DGS chống thủng mảng**: Hạ `densify-grad-thresh` xuống `0.00018` để phủ kín các mảng tường đơn sắc, kết hợp `reset-alpha-every 3000` và `cull-alpha-thresh 0.05` để quét sạch các hạt Gaussian rác (floaters) bay lơ lửng.
   - **Tự động gắn Hotspots trực diện**: Đọc ma trận ngoại suy camera (Extrinsics) của ảnh chụp chi tiết 8K, tính vector pháp tuyến bề mặt để chiếu tọa độ chính xác vào không gian 3D.

3. **Adapter Lưu Trữ Đám Mây (`backend/worker_3dgs/cloud_storage.py`)**:
   - Tích hợp sẵn sàng cho **Cloudflare R2** (S3-compatible, miễn phí 10GB, 0đ băng thông tải - tối ưu cho file `.splat`/`.ply`) và **Cloudinary**.
   - Tự động fallback về lưu trữ local nếu chưa nạp khóa API. Khi nào bạn nạp khóa vào file `.env`, hệ thống sẽ tự động đồng bộ hóa lên Cloud CDN.

4. **Trải Nghiệm Khách Tham Quan (Three.js Web)**:
   - [SplatTourViewer.ts](file:///d:/KhoaluanTotNghiep/frontend/src/components/virtual-tour/SplatTourViewer.ts): Khách tham quan tự do di chuyển (First-person Walkthrough / Orbit Controls).
   - **Double-click Raycasting**: Khi người dùng click đúp vào bất kỳ bức tường/hiện vật nào, Three.js tính vector pháp tuyến bề mặt và dùng GSAP lướt camera mượt mà vào góc nhìn trực diện đối diện tầm mắt người xem, đồng thời mở pop-up ảnh 8K siêu nét và thuyết minh Voice AI.

---

## 2. HƯỚNG DẪN CẤU HÌNH CLOUD STORAGE (KHI CÓ KEY)

Khi Thành (hoặc Lộc) có API Key của Cloudflare R2 hoặc Cloudinary, chỉ cần điền vào file `.env`:

```env
# Cloudflare R2 (Khuyên dùng cho file .splat và .ply vì miễn phí và không tốn phí băng thông tải)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="museum-virtual-tours"
R2_PUBLIC_DOMAIN="https://pub-xxxxxx.r2.dev"

# Hoặc Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

---

## 3. CÁCH KHỞI ĐỘNG DỰ ÁN CHO THÀNH

Khi Thành pull code về:
```bash
git fetch origin
git checkout develop
git pull origin develop

# Khởi động toàn bộ 5 dịch vụ chỉ bằng 1 lệnh duy nhất:
docker compose up -d
```
- Mở Frontend Web: [http://localhost:3001](http://localhost:3001)
- Mở Backend API: [http://localhost:3000](http://localhost:3000)
- Mở RabbitMQ Manager: [http://localhost:15672](http://localhost:15672) (guest / guest)

*(Nếu muốn tắt toàn bộ hệ thống để tiết kiệm RAM/pin khi không dùng: `docker compose down`)*

---

## 4. NHIỆM VỤ TIẾP THEO DÀNH CHO THÀNH (ROADMAP)

Theo bảng phân công trong [docs/PROJECT_REBUILD_BLUEPRINT.md](file:///d:/KhoaluanTotNghiep/docs/PROJECT_REBUILD_BLUEPRINT.md), Thành sẽ tiếp tục phụ trách các module sau:

1. **`TASK-TIMELINE-001` (Dòng Thời Gian Sống - Living Timeline)**:
   - File: `frontend/src/pages/Tour360Page.ts` hoặc trang `/timeline`.
   - Kết nối dữ liệu các triều đại lịch sử Việt Nam (Đông Sơn, Champa, Phù Nam - Óc Eo, Lý - Trần, Lê, Nguyễn).
2. **`TASK-VOICE-001` (Audio Guide Player Đa Ngôn Ngữ)**:
   - Hoàn thiện trình phát âm thanh thuyết minh có sóng âm (Waveform Visualizer) cho các Hotspot đã được 3DGS định vị.
3. **`TASK-GAMIFY-001` (Hộ Chiếu Di Sản & Async AI Quiz)**:
   - Module quét mã QR hiện vật để thu thập con tem di sản điện tử.
