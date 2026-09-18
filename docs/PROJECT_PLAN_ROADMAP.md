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
| **6** | **Hiện vật 3D Xoay Mâm 360° & Mã QR Di Sản (3D Turntable & QR System)** | Quản trị hiện vật, tạo mô hình 3D mâm xoay 360 trên bục trưng bày, sinh mã QR in dán bảo tàng, trang du khách quét QR với AI Voice thuyết minh. | 🚀 **Đang triển khai** | Nhánh `feature/3d-artifact-qr-viewer` |
| **7** | **Điểm thông tin hiện vật (Artifact Info Hotspot)** | Ghim điểm `ℹ️` trên cổ vật trong Tour 360, bấm vào mở 3D Viewer và thông tin hiện vật. | 📋 **Kế hoạch tiếp theo** | Tích hợp sâu cùng mục 6 |
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
