# KẾ HOẠCH & TIẾN ĐỘ PHÁT TRIỂN DỰ ÁN (PROJECT ROADMAP)
> **Dự án**: Hệ thống Tham Quan Thực Tế Ảo 360° & Số Hóa Không Gian Di Sản Bảo Tàng Lịch Sử TP.HCM (Khóa Luận Tốt Nghiệp)  
> **Cập nhật lần cuối**: 18/09/2026  
> **Mục tiêu**: Tập trung hoàn thiện đầy đủ chức năng và kiểm thử thực tế trước, tinh chỉnh giao diện tổng thể sau.

---

## I. BẢNG THEO DÕI TIẾN ĐỘ TÍNH NĂNG (FEATURE STATUS)

| STT | Phân Hệ / Tính Năng | Mô Tả Kỹ Thuật | Trạng Thái | Ghi Chú & Tài Liệu |
|---|---|---|---|---|
| **1** | **Chụp & Tự động ghép ảnh 360° (AI/CV Stitcher)** | Thuật toán Python OpenCV ghép ảnh điện thoại thành ảnh toàn cảnh 4K chuẩn 2:1, căn phẳng rectilinear, xóa chân máy nadir. | ✅ **Hoàn thành** | Đã bảo quản tại [`docs/FLOW_360_SCAN_STITCH.md`](./FLOW_360_SCAN_STITCH.md) |
| **2** | **Quản lý Kho Không Gian & Tạo Gian Phòng** | Quản trị ảnh 360 đã tạo, xem trước xoay 360, sao chép link, xóa dọn dẹp, tạo gian phòng triển lãm. | ✅ **Hoàn thành** | Hoạt động trên tab *Gian trưng bày & Tour 360* |
| **3** | **Điểm chuyển cảnh 3D (Walking Arrow Hotspot)** | Mũi tên đi bộ phát sáng Google Street View gắn tại cửa, tùy biến nhãn chữ (`Ra ngoài sân`, `Chính điện`...). | ✅ **Hoàn thành** | Đã tinh chỉnh chống rung giật hover, click chuyển phòng |
| **4** | **Hiệu ứng Chuyển cảnh bước qua cửa (Doorway Walk-through)** | Xoay góc nhìn về cửa, phóng tới làm mờ chiều sâu và hé mở gian phòng mới mượt mà. | ✅ **Hoàn thành** | Đã tích hợp vào Studio Tour |
| **5** | **CI/CD Tự động Deploy VPS (GitHub Actions)** | Tự động nhận diện nhánh bất kỳ (`feature/**` hoặc `main`) để build và chạy Docker Compose trên VPS. | ✅ **Hoàn thành** | Đã cấu hình tại [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |
| **6** | **Điểm thông tin hiện vật (Artifact Info Hotspot)** | Ghim điểm `ℹ️` trên cổ vật/tranh ảnh trong phòng 360. Bấm vào mở popup xem tư liệu chi tiết, hình ảnh, âm thanh. | ⏳ **Đang triển khai** | *Ưu tiên tiếp theo trong Admin* |
| **7** | **Quản lý Danh mục Hiện vật & Cổ vật (CRUD Artifacts)** | Bảng quản trị danh mục hiện vật trong bảo tàng, phân loại theo niên đại lịch sử, liên kết vào gian phòng. | 📋 **Kế hoạch tiếp theo** | Tab *Hiện vật & Cổ vật di sản* |
| **8** | **Âm thanh Thuyết minh Di sản (Audio Narration)** | Cấu hình nhạc nền hoặc tải file giọng đọc thuyết minh tự động khi bước vào từng gian phòng. | 📋 **Kế hoạch tiếp theo** | Trải nghiệm đa giác quan |
| **9** | **Sơ đồ Mặt bằng 2D & Radar Định vị (Mini-map)** | Bản đồ thu nhỏ góc màn hình, chấm đỏ radar xoay theo hướng người nhìn để định vị trong không gian. | 📋 **Kế hoạch tiếp theo** | Định vị tổng quan |
| **10** | **Trang Trình Chiếu Tour Cho Du Khách (Public VR Tour)** | Giao diện tràn viền du khách chuẩn như `vr.iuh.edu.vn`: Little Planet mở đầu, Bottom Bar nổi, Menu trượt danh sách phòng. | 📋 **Giai đoạn hoàn thiện** | Dành cho người dùng cuối |

---

## II. KẾ HOẠCH HÀNH ĐỘNG TIẾP THEO (ACTION PLAN)

### 🎯 Bước tiếp theo: Điểm Thông Tin Hiện Vật (Artifact Info Hotspot) trong Admin
1. **Mục tiêu**:
   - Khi Admin ghim điểm liên kết, chọn loại: **`ℹ️ Thông Tin Hiện Vật`**.
   - Admin nhập:
     - Tên hiện vật / cổ vật (vd: *Trống Đồng Đông Sơn*, *Tượng Phật Cổ*...)
     - Niên đại / thời kỳ
     - Hình ảnh chi tiết cận cảnh của hiện vật
     - Nội dung thuyết minh / ý nghĩa lịch sử
     - Audio giọng đọc thuyết minh (nếu có)
   - Lưu vào cơ sở dữ liệu của phòng.
2. **Kiểm thử**:
   - Khi đứng trong Tour 360, điểm hiện vật hiển thị icon tròn phát sáng nhấp nháy màu vàng hoàng gia/xanh dương.
   - Khi nhấp vào điểm đó: Mở popup hiển thị đầy đủ thông tin, hình ảnh cận cảnh để khách chiêm ngưỡng hiện vật.

---

## III. NGUYÊN TẮC BẢO TOÀN DỰ ÁN
1. **Chức năng trước, thẩm mỹ sau**: Đảm bảo toàn bộ luồng dữ liệu (Database -> Backend API -> Admin -> Tour Viewer) chạy chuẩn xác, kiểm thử được trên thực tế trước khi đại tu giao diện.
2. **Quy trình nhánh (Git Branching)**:
   - Mỗi tính năng mới phát triển trên một nhánh riêng: `feature/<tên-tính-năng>`.
   - GitHub Actions tự động build nhánh đó lên VPS để test.
   - Khi test chức năng hoàn tất mới merge vào nhánh chính `main`.

---

## IV. BỘ QUY TẮC KIẾN TRÚC DỮ LIỆU ĐỘNG & QUẢN TRỊ TOÀN DIỆN (HEADLESS CMS & DATA AXIOMS)
> **Nguyên tắc cốt lõi**: Phục vụ cho giai đoạn phát triển giao diện Client tiếp theo. Client tuyệt đối **KHÔNG HARDCODE** bất kỳ chữ nào, ảnh nào, banner nào. Toàn bộ nội dung hiển thị cho du khách đều là **Dữ Liệu Động (100% Dynamic Data Driven)** được điều phối từ Admin Dashboard và lưu trữ thực tế trong Database (MongoDB & PostgreSQL).

### 1. Nguyên tắc Ánh xạ 1:1 (One Client Page = One Admin Controller)
Mỗi trang hiển thị phía Client đều có một trang quản trị tương ứng trực tiếp trong Admin Dashboard:
* **Client Page 1: Trang Chủ (Home Page)** ↔ **Admin: Quản trị Trang Chủ & Cấu hình Khối (Home Sections Builder)**.
* **Client Page 2: Không Gian Tham Quan 360° (Virtual Tour)** ↔ **Admin: Gian trưng bày & Tour 360 (Rooms Studio)**.
* **Client Page 3: Kho Tàng Hiện Vật (Artifacts Archive)** ↔ **Admin: Quản lý Hiện vật & Cổ vật di sản**.
* **Client Page 4: Tiến Trình Lịch Sử & Sự Kiện (Roadmap Timeline)** ↔ **Admin: Quản lý Dòng thời gian & Lịch sử Bảo tàng**.
* **Client Page 5: Tin Tức & Thông Báo (News & Announcements)** ↔ **Admin: Trung tâm Thông báo & Tin tức Hoạt động**.

### 2. Quản lý nội dung phân tầng theo từng Section (Section-based Content Management)
Giao diện Client được chia nhỏ thành các Khối (Sections), Admin có toàn quyền chỉnh sửa và bật/tắt theo thời gian thực:
* **Section Header & Menu**: Menu điều hướng chính, logo bảo tàng, hotline, liên kết mạng xã hội.
* **Section Hero Banner**: Tiêu đề lớn (Headline), phụ đề (Sub-headline), ảnh/video nền 360, nút kêu gọi hành động (CTA).
* **Section Giới thiệu Tổng quan**: Video thuyết minh, bài viết tổng quan về kiến trúc Đông Dương 1929 của bảo tàng.
* **Section Gian phòng Nổi bật (Featured 360 Rooms)**: Danh sách phòng được ghim lên trang chủ, độ ưu tiên hiển thị (`orderIndex`).
* **Section Cổ vật Tiêu biểu (Highlight Artifacts)**: Cổ vật độc bản (Bảo vật Quốc gia), ảnh cận cảnh 3D/2D, câu chuyện lịch sử.
* **Section Dòng thời gian Sự kiện (Roadmap / Timeline)**: Các cột mốc di sản từ thời Tiền sử đến Triều Nguyễn.
* **Section Thông báo & Lịch hoạt động**: Giờ mở cửa, giá vé, thông báo khẩn cấp, trưng bày chuyên đề ngắn hạn.

### 3. Chuẩn hóa trải nghiệm Thông báo (No Native Browser Alerts)
* **Tuyệt đối không sử dụng `window.alert()` hoặc `window.confirm()` mặc định của trình duyệt** (vốn mang giao diện xám xịt của hệ điều hành, làm vỡ tính thẩm mỹ cổ kính của bảo tàng).
* **Chuẩn hóa 100% bằng Hệ thống Thông báo Di Sản (Heritage Notification System)**:
  * **Thông báo trạng thái (Toasts)**: Dùng Toast component tự động biến mất với 4 trạng thái (*Thành công*, *Cảnh báo*, *Lỗi*, *Thông tin*), hỗ trợ Dark/Light mode chuẩn.
  * **Hộp thoại xác nhận (Custom Confirm Modals)**: Khi thực hiện hành động xóa, ghi đè, hoặc xuất dữ liệu, hiển thị Modal thiết kế riêng với nội dung rõ ràng, nút bấm mang sắc thái Đỏ gạch di sản / Vàng đồng thau.

### 4. Tính toàn vẹn Cơ sở dữ liệu (Database Integrity - Zero Mock Data)
* Toàn bộ dữ liệu quản trị là **Dữ liệu thật (Real Persistence)** được lưu trong PostgreSQL (quan hệ, ACID, kiểm toán) và MongoDB (360 tour, Hotspots, RAG AI).
* Không sử dụng dữ liệu ảo (Mock Data) hardcode trong code giao diện.
* Mọi thao tác Thêm / Sửa / Xóa trên Admin đều phát sinh Request API đồng bộ thực tế với cơ sở dữ liệu.

### 5. An toàn Bộ nhớ & Phòng thủ Tấn công (Anti-OOM & Data Security)
* **Redis Caching**: Mọi key đều có thời gian sống TTL rõ ràng (300s - 600s), không lưu vĩnh viễn. Giới hạn trần RAM `maxmemory 256mb` với chính sách thu hồi `allkeys-lru` chống sập VPS.
* **NoSQL / SQL Injection Defense**: Chuẩn hóa kiểu dữ liệu nghiêm ngặt, từ chối các toán tử MongoDB độc hại.
* **Queue Isolation**: Các tác vụ nặng (ghép ảnh 360 OpenCV, sinh giọng đọc TTS) chạy ngầm qua Queue, không bao giờ chặn luồng HTTP chính.

#### 4. Quy tắc Đa ngôn ngữ Động (Dynamic Localization) & Pre-rendered Heritage Voice AI
* **Dynamic Language Registry (Không Hardcode Ngôn ngữ)**: Client tuyệt đối không fix cứng danh sách ngôn ngữ (`vi`, `en`...). Mọi ngôn ngữ mà Client hiển thị trên Language Selector đều phải tải động từ API `GET /api/languages/active`. Chỉ khi Admin bật `isActive: true` trong trang quản trị, ngôn ngữ đó mới được kích hoạt trên toàn hệ thống.
* **Pre-rendered Voice AI Thuyết minh (Không sinh thời gian thực tại Client)**: Tránh việc TTS tại trình duyệt client phát âm bậy bạ, méo tiếng hoặc giật lag. Toàn bộ file âm thanh thuyết minh di sản của từng ngôn ngữ đều được Admin tiền kết xuất (pre-render) thành file tĩnh `.mp3` chất lượng cao, lưu trữ lâu dài và gắn trực tiếp vào trường `translations[lang].audioUrl`. Client chỉ việc phát file này với độ trễ 0ms.
* **Heritage Glossary AI Translation (Bản dịch có kiểm soát sử học)**: Sử dụng mô hình AI kết hợp từ điển thuật ngữ di sản bảo tàng (Óc Eo, Phù Nam, Champa, Tiền sử - Sơ sử, Triều Nguyễn...) để dịch nháp tại Admin. Admin là người duyệt và chỉnh sửa câu từ cuối cùng trước khi lưu vào Database, triệt tiêu nguy cơ hallucination sai lệch lịch sử.
* **Fallback an toàn**: Nếu một trường thông tin ở ngôn ngữ được chọn chưa có bản dịch, hệ thống tự động fallback về tiếng Việt chuẩn (`vi`), không bao giờ để giao diện bị trống hoặc lỗi.


