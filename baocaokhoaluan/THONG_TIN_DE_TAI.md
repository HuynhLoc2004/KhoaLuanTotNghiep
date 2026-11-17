# BẢNG THÔNG TIN HỌC THUẬT ĐỀ TÀI KHÓA LUẬN
*(Cập nhật chính thức theo thông tin do nhóm sinh viên cung cấp ngày 04/11/2026)*

---

## 1. THÔNG TIN CHUNG VỀ ĐỀ TÀI
- **Tên chính thức của đề tài:** HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM
- **Tên tiếng Anh:** VIRTUAL TOUR 360° & HERITAGE SPACE DIGITIZATION FOR HO CHI MINH CITY MUSEUM OF HISTORY
- **Đơn vị đào tạo:** Bộ Công Thương – Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH)
- **Khoa:** Khoa Công nghệ Thông tin
- **Ngành:** Công nghệ Thông tin
- **Khóa học:** 2022 – 2026 (Khóa 18)
- **Thời gian thực hiện dự án:** Tháng 08/2026 – Tháng 11/2026

---

## 2. GIẢNG VIÊN HƯỚNG DẪN
- **Danh xưng:** Cô
- **Học hàm, học vị:** Tiến sĩ (TS.)
- **Họ và tên:** TS. Trần Thị Minh Khoa
- **Đơn vị công tác:** Khoa Công nghệ Thông tin – Trường Đại học Công nghiệp TP. Hồ Chí Minh

---

## 3. SINH VIÊN THỰC HIỆN
- **Sinh viên 1 (Nhóm trưởng):**
  - Họ và tên: **Huỳnh Tấn Lộc**
  - MSSV: **22686171**
  - Lớp: **DHCNTT18ATT**
  - Vai trò: Trưởng nhóm, kiến trúc sư hệ thống, phụ trách phân hệ thuật toán ghép ảnh 360°, backend, xử lý bất đồng bộ và tích hợp hệ thống.
- **Sinh viên 2 (Thành viên):**
  - Họ và tên: **Trịnh Vĩ Thành**
  - MSSV: **22689411**
  - Lớp: **DHCNTT18ATT**
  - Vai trò: Thành viên, phụ trách phân hệ giao diện người dùng (Three.js 360 Tour), hệ thống thanh toán vé trực tuyến và khảo sát thu thập dữ liệu di sản.

---

## 4. QUÁ TRÌNH TÁC NGHIỆP THỰC TẾ TẠI BẢO TÀNG (4 ĐỢT THỰC ĐỊA)
- **Địa điểm:** Bảo tàng Lịch sử Thành phố Hồ Chí Minh (Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1, TP.HCM).
- **Chi tiết 4 đợt tác nghiệp trực tiếp (bám sát mã nguồn và commit dự án):**
  1. **Đợt 1 - Khảo sát hiện trạng không gian và thiết lập sơ đồ liên thông:**
     - Khảo sát sơ đồ mặt bằng thực tế 18 phòng trưng bày (từ thời Tiền sử đến triều Nguyễn và Văn hóa Champa, Óc Eo).
     - Ghi nhận cấu trúc các cửa thông phòng (cửa nào nối sang phòng nào) để làm cơ sở xây dựng đồ thị liên thông cho thuật toán tìm đường Dijkstra và định vị các mũi tên chuyển cảnh.
     - Khảo sát vị trí tủ kính trưng bày cổ vật quý và điều kiện ánh sáng thực tế (nhiều phòng ánh sáng tự nhiên yếu, dùng đèn rọi vàng chiếu vào tủ kính dễ gây lóa ảnh).
  2. **Đợt 2 - Thử nghiệm kỹ thuật quay/chụp bằng điện thoại và tối ưu thuật toán xử lý ảnh:**
     - Dùng điện thoại thông minh thử nghiệm các thao tác quay video lia máy 360 độ và chụp ảnh góc rộng (chế độ 0.5x) tại một số gian phòng đại diện.
     - Chạy thử nghiệm trên mô đun ghép ảnh OpenCV, từng bước khắc phục các lỗi thực tế ghi nhận trong mã nguồn dự án: lệch mí nối góc tường khi lia máy không đều, dính bóng chân người chụp ở vùng sàn nhà (nadir), và lóa sáng tại điểm có đèn rọi trực tiếp.
     - Hoàn thiện thuật toán làm mịn vùng sàn, cân bằng ánh sáng trong nhà và xây dựng quy chuẩn quay video quét phòng chuẩn xác.
  3. **Đợt 3 - Thu thập chính thức dữ liệu không gian 18 phòng và tư liệu cổ vật 3D:**
     - Quay video quét toàn cảnh chuẩn cho toàn bộ 18 gian phòng trưng bày theo quy trình đã thử nghiệm thành công.
     - Chụp ảnh chi tiết đa góc các cổ vật tiêu biểu phục vụ tái tạo mô hình 3D (.GLB).
     - Thu thập đầy đủ tư liệu lịch sử, bảng giới thiệu tại chỗ để làm nội dung thuyết minh âm thanh đa ngôn ngữ và dữ liệu tri thức cho trợ lý ảo AI.
  4. **Đợt 4 - Thực nghiệm hệ thống trên môi trường thực tế tại khuôn viên bảo tàng:**
     - Sau khi triển khai hệ thống lên máy chủ đám mây (Cloud VPS), nhóm mang thiết bị di động trực tiếp xuống bảo tàng để kiểm thử với tư cách người dùng thực tế.
     - Kiểm tra tốc độ tải các phòng 360 độ và mô hình 3D trên mạng di động 4G tại khuôn viên bảo tàng.
     - Thử nghiệm quy trình thanh toán vé VietQR (PayOS) và dùng camera điện thoại quét mã QR soát vé tại cửa ra vào để kiểm tra độ nhạy của khung ngắm nhận diện mã vé.
     - Đối chiếu bản đồ Mini-map trên web với lộ trình đi lại thực tế của bảo tàng để tinh chỉnh các mũi tên chuyển cảnh và hướng nhìn mặc định sao cho trực quan và chính xác nhất.

---

## 5. TÀI NGUYÊN & LOGO
- **Tệp Logo trường:** `baocaokhoaluan/assets/iuh_logo.png` (Trích xuất chuẩn từ tài liệu Đại học Công nghiệp TP.HCM, kích thước 349x125 PNG).
- **Ảnh tác nghiệp thực tế:** Do sinh viên Huỳnh Tấn Lộc và Trịnh Vĩ Thành cung cấp trong quá trình biên soạn.
