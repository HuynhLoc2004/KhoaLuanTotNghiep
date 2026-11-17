# ĐỀ CƯƠNG CHI TIẾT BÁO CÁO KHÓA LUẬN TỐT NGHIỆP
**Đề tài:** HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM  
**Giảng viên hướng dẫn:** TS. Trần Thị Minh Khoa  
**Sinh viên thực hiện:** Huỳnh Tấn Lộc (22686171) – Trịnh Vĩ Thành (22689411)  
**Lớp:** DHCNTT18ATT – Khoa Công nghệ Thông tin, Trường Đại học Công nghiệp TP.HCM (IUH)  
**Dung lượng mục tiêu:** Đúng 28 – 30 trang nội dung chính (không tính trang phụ trợ và phụ lục).

---

## CẤU TRÚC TỔNG THỂ TÀI LIỆU

### PHẦN ĐẦU TÀI LIỆU (Trang phụ trợ - Đánh số La Mã i, ii, iii,...)
1. **Trang Bìa chính (Bìa ngoài):** Khổ A4, có logo IUH, tên Bộ, Tên Trường, Tên Khoa, Tên Đề tài, GVHD, SV thực hiện, Khóa học.
2. **Trang Bìa phụ (Bìa trong tiếng Anh):** Định dạng chuẩn quốc tế, tiêu đề tiếng Anh.
3. **Trang Nhận xét của Giảng viên hướng dẫn:** Khung tiêu chí và chữ ký của TS. Trần Thị Minh Khoa.
4. **Trang Nhận xét của Giảng viên phản biện:** Khung nhận xét đánh giá của hội đồng.
5. **Lời cam đoan (Cam kết học thuật):** Cam kết tính liêm chính, công trình thực nghiệm độc lập và trích dẫn chuẩn mực.
6. **Lời cảm ơn:** Tri ân Cô TS. Trần Thị Minh Khoa, Quý Thầy Cô khoa CNTT và Bảo tàng Lịch sử TP.HCM.
7. **Tóm tắt đề tài (Abstract):** Bản tiếng Việt và tiếng Anh (mục tiêu, giải pháp kỹ thuật, kết quả đo lường).
8. **Mục lục (Table of Contents):** Liên kết tự động đến cấp tiểu mục 3 chữ số.
9. **Danh mục từ viết tắt:** Bảng đối chiếu thuật ngữ A – Z (CSDL, API, SIFT, RANSAC, VR, GLB,...).
10. **Danh mục bảng:** Danh sách bảng trong báo cáo.
11. **Danh mục hình ảnh:** Danh sách sơ đồ thuật toán, flowchart và ảnh chụp tác nghiệp thực tế.

---

### PHẦN NỘI DUNG CHÍNH (Đánh số trang Arab từ 1 đến tối đa 30)

```
CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI (~4 trang)
  1.1. Bối cảnh thực tế và lý do chọn đề tài
    1.1.1. Thực trạng bảo tồn và nhu cầu số hóa tại Bảo tàng Lịch sử TP.HCM
    1.1.2. Rào cản chi phí thiết bị và mục tiêu tự chủ giải pháp công nghệ 0 đồng
  1.2. Mục tiêu nghiên cứu và phạm vi triển khai
    1.2.1. Mục tiêu tổng quát và các mục tiêu cụ thể của hệ thống
    1.2.2. Đối tượng nghiên cứu và phạm vi thực nghiệm tại 18 gian phòng trưng bày
  1.3. Phương pháp tiếp cận và cấu trúc báo cáo
    1.3.1. Phương pháp nghiên cứu và quy trình triển khai qua 4 đợt tác nghiệp thực địa
    1.3.2. Bố cục tổng thể của báo cáo khóa luận

CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ NỀN TẢNG (~6 trang)
  2.1. Tổng quan về công nghệ tham quan thực tế ảo 360° và mô hình hóa 3D
    2.1.1. Nguyên lý biểu diễn không gian toàn cảnh Equirectangular Projection
    2.1.2. Khảo sát và so sánh các phương pháp tái tạo không gian 3D hiện nay
  2.2. Cơ sở toán học và thuật toán ghép ảnh Panorama
    2.2.1. Thuật toán trích xuất đặc trưng SIFT và ước lượng ma trận Homography với RANSAC
    2.2.2. Phép chiếu mặt trụ (Cylindrical Warping) và kỹ thuật hòa trộn đa băng (Multi-band Blending)
  2.3. Ngăn xếp công nghệ phát triển hệ thống
    2.3.1. Phân hệ kết xuất 3D trên nền web với Three.js và React
    2.3.2. Phân hệ máy chủ dịch vụ Node.js, hàng đợi Redis và cơ sở dữ liệu MongoDB

CHƯƠNG 3. PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ KIẾN TRÚC HỆ THỐNG (~8 trang)
  3.1. Phân tích hiện trạng và yêu cầu hệ thống
    3.1.1. Kết quả khảo sát thực tế qua 4 đợt tác nghiệp tại Bảo tàng Lịch sử TP.HCM
    3.1.2. Phân tích yêu cầu chức năng và yêu cầu phi chức năng của hệ thống
  3.2. Thiết kế kiến trúc tổng thể và mô hình dữ liệu
    3.2.1. Kiến trúc phân tầng 4 lớp (Client - API Gateway - Queue/Worker - Database)
    3.2.2. Thiết kế cấu trúc cơ sở dữ liệu MongoDB cho không gian bảo tàng
  3.3. Thiết kế các luồng nghiệp vụ và thuật toán cốt lõi
    3.3.1. Thiết kế luồng xử lý ghép ảnh toàn cảnh 360° tự động từ video
    3.3.2. Thiết kế thuật toán chuyển đổi tọa độ điểm tương tác (Hotspots) và dẫn đường Dijkstra

CHƯƠNG 4. HIỆN THỰC HÓA VÀ ĐÁNH GIÁ THỰC NGHIỆM (~9 trang)
  4.1. Hiện thực hóa các phân hệ chức năng
    4.1.1. Hiện thực hóa phân hệ xưởng ghép ảnh 360° (PocStitching & OpenCV Engine)
    4.1.2. Hiện thực hóa không gian tham quan tương tác 360°, ngắm cổ vật 3D và trợ lý AI
    4.1.3. Hiện thực hóa phân hệ quản trị bảo tàng, quản lý âm thanh và soát vé QR
  4.2. Thực nghiệm và đánh giá hiệu năng hệ thống
    4.2.1. Kịch bản thực nghiệm trên không gian thật tại Bảo tàng Lịch sử TP.HCM
    4.2.2. Kết quả đo đạc hiệu năng kết xuất, thời gian xử lý ảnh và mức tiêu thụ tài nguyên

CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (~3 trang)
  5.1. Tổng kết các kết quả đạt được
    5.1.1. Về mặt khoa học và làm chủ công nghệ
    5.1.2. Về mặt giá trị thực tiễn cho bảo tàng và cộng đồng
  5.2. Các mặt hạn chế và bài học kinh nghiệm
    5.2.1. Những hạn chế kỹ thuật hiện tại
    5.2.2. Bài học rút ra trong quá trình triển khai
  5.3. Hướng phát triển trong tương lai
    5.3.1. Tích hợp công nghệ thực tế ảo mở rộng WebXR
    5.3.2. Nâng cấp mô hình trợ lý giọng nói và tự động hóa thuyết minh
```

---

## MA TRẬN HÌNH ẢNH MINH HỌA & SƠ ĐỒ THUẬT TOÁN DỰ KIẾN

| Vị trí mục | Tên hình vẽ / ảnh chụp | Loại hình | Nguồn gốc tạo dựng |
|:---|:---|:---|:---|
| **Mục 1.1** | `Hình 1.1: Sơ đồ tư duy bối cảnh số hóa và giải pháp tự chủ chi phí 0 đồng` | Sơ đồ tư duy | Script Python thuật toán (Matplotlib vector) |
| **Mục 1.3** | `Hình 1.2: Ảnh tác nghiệp đợt 1 và đợt 2 của nhóm tại Bảo tàng Lịch sử TP.HCM` | Ảnh chụp thực tế | Bạn cung cấp ảnh chụp khảo sát thực tế |
| **Mục 2.1** | `Hình 2.1: Mô hình toán học chiếu mặt trụ và trải phẳng ảnh 360°` | Sơ đồ hình học | Script Python thuật toán |
| **Mục 2.2** | `Hình 2.2: Quy trình ghép ảnh Panorama bằng SIFT và Homography` | Flowchart | Script Python thuật toán (Pillow/Matplotlib) |
| **Mục 3.1** | `Hình 3.1: Ảnh tác nghiệp đợt 3 quét video và chụp ảnh cổ vật tại bảo tàng` | Ảnh chụp thực tế | Bạn cung cấp ảnh chụp thu thập dữ liệu |
| **Mục 3.2** | `Hình 3.2: Sơ đồ kiến trúc phân tầng hệ thống (System Architecture)` | Sơ đồ kiến trúc | Script Python thuật toán |
| **Mục 3.2** | `Hình 3.3: Sơ đồ dữ liệu thực thể quan hệ MongoDB (ERD)` | Sơ đồ quan hệ | Script Python thuật toán |
| **Mục 3.3** | `Hình 3.4: Lưu đồ thuật toán ghép ảnh 360° tự động từ video quét phòng` | Flowchart | Script Python thuật toán |
| **Mục 3.3** | `Hình 3.5: Sơ đồ nguyên lý định vị Hotspot từ Click $(x,y)$ sang Góc cầu $(\theta, \phi)$` | Sơ đồ vector | Script Python thuật toán |
| **Mục 4.1** | `Hình 4.1: Giao diện Xưởng ghép ảnh và tiến trình Worker ngầm` | Ảnh chụp giao diện | Chụp màn hình web `PocStitchingPage` |
| **Mục 4.1** | `Hình 4.2: Giao diện Tour tham quan 360° và Mini-map dẫn đường` | Ảnh chụp giao diện | Chụp màn hình web Tham quan 360 |
| **Mục 4.1** | `Hình 4.3: Giao diện ngắm Cổ vật 3D và Trợ lý AI hỏi đáp` | Ảnh chụp giao diện | Chụp màn hình web Xem 3D .GLB & Chat AI |
| **Mục 4.1** | `Hình 4.4: Giao diện Quản trị Studio và Quét vé QR` | Ảnh chụp giao diện | Chụp màn hình web Admin & Quét vé camera |
| **Mục 4.2** | `Hình 4.5: Ảnh tác nghiệp đợt 4 thực nghiệm soát vé QR và tải Tour tại bảo tàng` | Ảnh chụp thực tế | Bạn cung cấp ảnh chụp thực nghiệm thực tế |
| **Mục 4.2** | `Bảng 4.1: Bảng đo lường hiệu năng kết xuất FPS và tiêu thụ RAM đa thiết bị` | Bảng số liệu | Đo đạc DevTools trên Chrome, Safari, Android |
