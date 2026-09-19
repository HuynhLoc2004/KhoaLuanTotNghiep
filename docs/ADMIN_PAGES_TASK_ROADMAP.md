# 🏛️ KẾ HOẠCH & BẢNG THEO DÕI TIẾN ĐỘ CÁC TRANG ADMIN (HỆ THỐNG BẢO TÀNG LỊCH SỬ TP.HCM)

> **Mục đích tài liệu:**  
> Đây là tài liệu quy hoạch, phân chia nhiệm vụ và theo dõi tiến độ chi tiết cho **Toàn bộ Phân hệ Quản trị (Admin Frontend)**.  
> Mọi yêu cầu sửa đổi, bổ sung chức năng mới, nâng cấp bố cục, tích hợp phân trang & phân loại sẽ được cập nhật trực tiếp tại đây để quản lý công việc rõ ràng, bài bản giữa Người dùng (User) và Trợ lý AI (Agent).

---

## 📌 QUY TẮC THIẾT KẾ CHUNG CHO TOÀN BỘ CÁC TRANG ADMIN

1. **Bảng màu Di sản Bảo tàng (Heritage Theme System)**:
   - **Màu nền**: Nâu gỗ trầm ấm (`#160F0C` / `#231A15`), bề mặt thẻ `#2B211B`.
   - **Màu điểm nhấn (Accent)**: Vàng kim hoàng gia / Đồng thau cổ (`var(--accent-gold)` - `#D4A86A` / `#B47D28`).
   - **Màu thương hiệu (Primary)**: Đỏ sơn son / Gạch ngói cổ (`var(--primary)` - `#8C2D19` / `#C85A32`).
   - ⚠️ **Tuyệt đối KHÔNG sử dụng màu xanh lá cây neon/AI sáng chói (`#10B981`, `#22C55E`)**: Mọi huy hiệu hoạt động/trực tuyến/active phải dùng tone Vàng đồng (`var(--accent-gold)`) hoặc ngọc bích cổ trầm dịu nhẹ (`#7F9E87`).
2. **Quy tắc Phân trang (`Pagination`)**:
   - Sử dụng component phân trang dùng chung của hệ thống: `Pagination.tsx`.
   - Quy định kích thước trang: 5 - 10 mục/trang tùy loại dữ liệu.
   - Luôn hiển thị thông tin rõ ràng: *"Hiển thị X - Y trên tổng số Z mục"* kèm nút lật trang mượt mà.
   - Tự động nhảy về Trang 1 khi người dùng lọc hoặc tìm kiếm.
3. **Quy tắc Phân loại & Bộ lọc (`Filter & Category`)**:
   - Mỗi trang quản trị dữ liệu đều phải có Toolbar gồm:
     - Ô tìm kiếm từ khóa tức thì (Search input với icon kính lúp và nút xóa nhanh).
     - Dropdown lọc theo trạng thái (Tất cả / Đang bật / Đang tắt).
     - Dropdown lọc theo chuyên mục/thời kỳ/chuyên đề phù hợp.
4. **Quy tắc Responsive & Cuộn trang (`Smooth Scroll`)**:
   - Khung giao diện cho phép cuộn tự nhiên (`overflow-y: auto`, `overscroll-behavior-y: contain`), không để tình trạng khóa cứng chiều cao gây nghẽn cuộn.
   - Trên Desktop/Tablet: Bảng cuộn ngang mượt mà trong container (`overflow-x: auto`), không co giật cột.
   - Trên Mobile ($< 768px$): Tự động chuyển đổi thành giao diện thẻ (Mobile Card View) với nút bấm to, thân thiện với ngón tay.

---

## 📊 TỔNG QUAN TIẾN ĐỘ CÁC TRANG ADMIN (PROGRESS DASHBOARD)

| STT | Tên Trang Admin | File Mã Nguồn | Phân Loại | Phân Trang | Giao Diện Di Sản | Responsive Mobile | Trạng Thái |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | **Quản trị Ngôn ngữ & Voice AI** | `AdminLanguagePage.tsx` | ✅ Đã có | ✅ 5 mục/trang | ✅ Vàng đồng chuẩn | ✅ Bảng + Thẻ mobile | `HOÀN THÀNH` |
| 2 | **Gian trưng bày & Tour 360** | `AdminRoomsPage.tsx` | ✅ Đã có | ✅ Đã có | ✅ Vàng đồng chuẩn | ✅ Bố cục gọn | `HOÀN THÀNH` |
| 3 | **Xưởng Ghép Ảnh 360° Studio** | `PocStitchingPage.tsx` | 📋 Cần thêm | ✅ Đã có | ⏳ Cần đồng bộ màu | ⏳ Cần tối ưu mobile | `ĐANG SỬA ĐỔI` |
| 4 | **Studio Cắm Hotspot Tour 360** | `AdminPanoramaStudio.tsx` | 📋 Cần thêm | 📋 Cần thêm | ⏳ Cần tinh chỉnh | ⏳ Cần tối ưu tablet | `ĐANG SỬA ĐỔI` |
| 5 | **Quản lý Hiện vật & Cổ vật** | `AdminArtifactsPage.tsx` | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | `CHƯA THỰC HIỆN` |
| 6 | **Báo cáo & Thống kê Lượt xem** | `AdminAnalyticsPage.tsx` | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | `CHƯA THỰC HIỆN` |
| 7 | **Cấu hình Tham số Hệ thống** | `AdminSettingsPage.tsx` | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | 📋 Cần tạo | `CHƯA THỰC HIỆN` |

---

## 📋 CHI TIẾT KẾ HOẠCH TỪNG TRANG ADMIN

---

### 1. Quản trị Danh mục Ngôn ngữ & Voice AI (Language Registry)
- **File**: `frontend/src/pages/admin/AdminLanguagePage.tsx`
- **Mục tiêu đạt được**:
  - Quản lý danh sách các ngôn ngữ quốc tế được hỗ trợ trong Tour bảo tàng.
  - Bật/tắt ngôn ngữ hiển thị trên trang khách tham quan (Client).
  - Tích hợp phát giọng đọc thuyết minh AI (Google Cloud TTS Neural2) với âm thanh phòng thu chất lượng cao.
- **Tiến độ chi tiết**:
  - [x] **Layout & Thẩm mỹ**: Thiết kế lại toàn diện theo tone màu Vàng Đồng Hoàng Gia (`var(--accent-gold)`), loại bỏ màu xanh lá AI sáng chói.
  - [x] **Thẻ chỉ số KPI**: 3 thẻ thông số trực quan (Tổng ngôn ngữ, Đang hiển thị với thanh tiến trình %, Bộ máy Voice AI Pre-rendered).
  - [x] **Tìm kiếm & Phân loại**: Ô tìm kiếm theo tên bản ngữ, tên tiếng Anh, mã ISO + Dropdown lọc trạng thái (Tất cả / Đang hiển thị / Đang tạm tắt).
  - [x] **Phân trang**: Tích hợp component `Pagination` chuẩn (5 mục/trang), tự động quay về trang 1 khi lọc.
  - [x] **Banner Nghe thử**: Thanh phát audio có hiệu ứng sóng âm Equalizer động khi bấm "Thử giọng".
  - [x] **Responsive**: Bảng cuộn ngang tự nhiên trên Desktop/Tablet, tự chuyển sang danh sách thẻ trên Mobile.
  - [ ] **Hạng mục nâng cấp tiếp theo**: Bổ sung bộ chỉnh tham số nâng cao (Pitch/Speed) và công cụ tự động dịch nhanh bản mô tả phòng khi thêm ngôn ngữ mới.

---

### 2. Quản lý Gian trưng bày & Tour 360 (Rooms & Spaces Management)
- **File**: `frontend/src/pages/admin/AdminRoomsPage.tsx` & `frontend/src/components/NewRoomModal.tsx`
- **Mục tiêu đạt được**:
  - Quản lý các gian phòng trưng bày, thời kỳ lịch sử, mô tả và thứ tự tham quan.
  - Quản lý kho ảnh toàn cảnh 360° đã ghép nối thành công.
  - Tạo mới & cập nhật gian phòng với trải nghiệm mượt mà, hỗ trợ chọn ảnh trực tiếp từ kho 360°.
- **Tiến độ & Các hạng mục chi tiết cần làm**:
  - [x] Hỗ trợ 2 Sub-tab: "Danh sách Gian phòng" và "Kho Không Gian 360° Đã Ghép".
  - [x] Đã có phân trang `Pagination` ở cả 2 tab.
  - [x] **[Nhiệm vụ 1] Tinh gọn Bố cục Thẻ (KPI Cards & Room Cards)**:
    - Thu nhỏ các thẻ KPI trên cùng (gọn gàng, thanh thoát theo chuẩn thẩm mỹ bảo tàng, padding 12px 16px, số liệu 20px).
    - Tinh chỉnh thẻ gian phòng (Room Card): Chiều cao vừa phải, ảnh đại diện thumbnail 135px, gom gọn các nút thao tác vào 1 hàng duy nhất, giảm hơn 100px chiều cao card.
  - [x] **[Nhiệm vụ 2] Sửa Bộ lọc Chuyên đề Trưng bày (Dynamic Category Filter)**:
    - Loại bỏ các chuyên đề hardcode giả định.
    - Tự động trích xuất danh sách Chuyên đề / Thời kỳ thực tế từ dữ liệu phòng trong Database (`r.period`) để lọc chính xác 100% dữ liệu thật.
  - [x] **[Nhiệm vụ 3] Loại bỏ chất "AI hoá", Emoji và Chuẩn hóa Màu sắc Di sản**:
    - Không sử dụng icon/emoji thừa thãi.
    - Chuẩn hóa toàn bộ màu chữ, viền, huy hiệu theo đúng quy tắc thiết kế chung: Nâu gỗ mộc (`var(--bg-surface)`), Vàng đồng hoàng gia (`var(--accent-gold)`), Đỏ sơn son (`var(--primary)`), không dùng màu xanh neon hoặc cam chói.
  - [x] **[Nhiệm vụ 4] Xử lý Mẫu phòng thực tế (NewRoomModal)**:
    - Bỏ hộp chọn mock data mẫu phòng (P-01, P-05...), không sử dụng dữ liệu giả. Cho phép nhập trực tiếp thông tin phòng thật của Bảo tàng Lịch sử TP.HCM.
  - [x] **[Nhiệm vụ 5] Sửa Chụp ảnh / Tải ảnh trong Modal Thêm phòng**:
    - Xóa bỏ nút "Quét AR" / "Quét QR" bị thừa không sử dụng.
    - Sửa luồng tải/chụp ảnh: Nút "Tải tệp ảnh" trực quan, hỗ trợ chọn file trên máy tính và mở camera trên điện thoại.
  - [x] **[Nhiệm vụ 6] Bổ sung Chọn Không gian 3D/360° từ Kho lưu trữ**:
    - Trong modal thêm gian phòng mới, bổ sung **Dropdown chọn trực tiếp ảnh 360° có sẵn từ "Kho không gian 360° đã ghép"** (`panoramas`), giúp quản trị viên gắn ngay ảnh trong kho vào phòng mới.

---

### 3. Xưởng Ghép Ảnh Toàn Cảnh 360° (Panorama Stitching Studio)
- **File**: `frontend/src/pages/PocStitchingPage.tsx`
- **Mục tiêu đạt được**:
  - Cho phép quản trị viên chụp chuỗi ảnh liên tiếp từ camera điện thoại hoặc tải lên nhiều ảnh từ máy tính.
  - Tự động phát hiện góc nhìn, cân bằng sáng trong nhà (indoor lighting balance), ghép nối thành ảnh cầu 360° hoàn chỉnh bằng OpenCV SIFT/LoFTR.
  - Lưu trữ tự động vào MongoDB và kho lưu trữ tĩnh để dùng cho các gian phòng.
- **Tiến độ chi tiết**:
  - [x] Đã sửa lỗi crash `undefined is not an object` khi đọc điểm đặc trưng.
  - [x] Đã cải thiện thuật toán giữ màu tự nhiên, nhận diện tốt trong điều kiện thiếu sáng hoặc chói nắng.
  - [x] Đã có phân trang lịch sử các ảnh 360° đã ghép.
  - [ ] **Hạng mục cần sửa đổi/bổ sung**:
    - [ ] Chuẩn hóa bảng màu các thanh đo độ phủ và điểm chất lượng theo gam màu di sản.
    - [ ] Thêm bộ lọc phân loại nguồn ảnh: *Tất cả*, *Chụp trực tiếp từ Camera*, *Tải ảnh từ máy tính*.
    - [ ] Cải thiện khu vực xem trước xoay 360° (Interactive Preview) ngay sau khi ghép xong để Admin kiểm tra trước khi lưu vào phòng.

---

### 4. Studio Cắm Hotspot & Liên Kết Tour 360 (Panorama Studio)
- **File**: `frontend/src/pages/admin/AdminPanoramaStudio.tsx`
- **Mục tiêu đạt được**:
  - Trực quan hóa ảnh toàn cảnh 360° bằng công nghệ WebGL (Pannellum Viewer).
  - Cắm các điểm tương tác (Hotspots): Chuyển phòng liên thông, điểm xem thông tin hiện vật, điểm phát thuyết minh Voice AI.
  - Đặt góc nhìn mặc định (Pitch, Yaw, FOV) khi du khách bước vào phòng.
- **Tiến độ chi tiết**:
  - [x] Hỗ trợ xoay tương tác 360°, bấm để lấy tọa độ Pitch/Yaw.
  - [x] Hỗ trợ cắm Hotspot nhảy qua lại giữa các phòng trưng bày.
  - [ ] **Hạng mục cần sửa đổi/bổ sung**:
    - [ ] Thiết kế lại thanh công cụ (Toolbar) nổi phía trên: tinh tế, gọn gàng hơn, không che khuất góc nhìn bảo tàng.
    - [ ] Bổ sung bảng danh sách các Hotspot đã cắm trong phòng (kèm phân loại: Điểm chuyển phòng / Điểm hiện vật / Điểm thuyết minh) có nút xóa nhanh và phân trang.
    - [ ] Tối ưu hóa điều khiển cảm ứng xoay 360° trên màn hình iPad/Tablet.

---

### 5. Quản lý Hiện vật & Cổ vật Di sản (Artifacts & Relics Registry) - [CẦN LÀM MỚI]
- **File**: `frontend/src/pages/admin/AdminArtifactsPage.tsx` *(Hiện đang là placeholder trong `App.tsx`)*
- **Mục tiêu đạt được**:
  - Quản lý hồ sơ từng cổ vật, hiện vật lịch sử được trưng bày trong bảo tàng.
  - Phân loại hiện vật theo: Gian phòng trưng bày, Triều đại/Thời kỳ, Loại chất liệu (Đồng, Gốm, Gỗ, Đá, Vàng...), Cấp độ (Bảo vật Quốc gia / Cổ vật quý / Hiện vật phục dựng).
  - Đính kèm thông tin thuyết minh đa ngữ, hình ảnh góc chụp chi tiết và mô hình 3D tương tác.
- **Kế hoạch xây dựng**:
  - [ ] Xây dựng 3 thẻ KPI trên cùng: *Tổng số hiện vật*, *Hiện vật đã gán vị trí 360°*, *Bảo vật Quốc gia*.
  - [ ] Xây dựng Toolbar: Ô tìm kiếm tên/mã hiện vật + Lọc theo gian phòng + Lọc theo chất liệu/thời kỳ.
  - [ ] Xây dựng Bảng dữ liệu có hỗ trợ 2 chế độ xem: **Dạng bảng chi tiết** và **Dạng lưới ảnh (Grid View)**.
  - [ ] Tích hợp phân trang chuẩn hệ thống (`Pagination`).
  - [ ] Xây dựng Modal Thêm/Sửa hiện vật (Hỗ trợ upload ảnh hiện vật, chọn gian phòng, nhập bài thuyết minh).
  - [ ] Đảm bảo 100% responsive trên mobile và màu sắc chuẩn phong cách bảo tàng.

---

### 6. Báo cáo & Thống kê Tham quan (Tour Analytics & QR Metrics) - [CẦN LÀM MỚI]
- **File**: `frontend/src/pages/admin/AdminAnalyticsPage.tsx` *(Hiện đang là placeholder trong `App.tsx`)*
- **Mục tiêu đạt được**:
  - Giúp ban quản lý bảo tàng nắm bắt chính xác lưu lượng khách tham quan trực tuyến và khách quét mã QR thực tế tại bảo tàng.
  - Báo cáo ngôn ngữ được du khách quốc tế sử dụng nhiều nhất để phục vụ công tác đối ngoại & bảo tồn.
- **Kế hoạch xây dựng**:
  - [ ] Xây dựng thẻ tổng quan: *Tổng lượt quét QR*, *Lượt tham quan trực tuyến*, *Ngôn ngữ phổ biến nhất*, *Gian phòng thu hút nhất*.
  - [ ] Bộ lọc thời gian: *Hôm nay*, *7 ngày qua*, *Tháng này*, *Toàn thời gian*.
  - [ ] Biểu đồ trực quan xu hướng tham quan theo ngày/tuần.
  - [ ] Bảng xếp hạng các gian phòng & hiện vật được quan tâm nhất (có phân trang chuẩn).

---

### 7. Cấu hình Tham số Hệ thống (System Settings) - [CẦN LÀM MỚI]
- **File**: `frontend/src/pages/admin/AdminSettingsPage.tsx` *(Hiện đang là placeholder trong `App.tsx`)*
- **Mục tiêu đạt được**:
  - Quản lý các tham số vận hành chung của toàn bộ hệ thống Tour 360 bảo tàng.
- **Kế hoạch xây dựng**:
  - [ ] Tab Thông tin Bảo tàng: Tên hiển thị, địa chỉ, giờ mở cửa, lời chào mở đầu Tour.
  - [ ] Tab Voice AI & Cloud: Cấu hình khóa API Google Cloud TTS, Cloudinary/Cloudflare R2 storage.
  - [ ] Tab Sao lưu & Phục hồi dữ liệu: Xuất file backup dữ liệu Tour 360 phòng hờ sự cố.

---

## 🔄 QUY TRÌNH PHỐI HỢP CẬP NHẬT TÀI LIỆU NÀY

1. **Khi Người dùng (User) giao việc hoặc yêu cầu chỉnh sửa**:
   - Xác định trang Admin cần xử lý.
   - Bổ sung yêu cầu chi tiết vào mục của trang đó trong tài liệu này.
2. **Khi Trợ lý AI (Agent) hoàn thành công việc**:
   - Đánh dấu checkbox `[x]` cho các hạng mục đã xong.
   - Cập nhật cột Trạng thái tại bảng tổng quan (HOÀN THÀNH / ĐANG SỬA ĐỔI / CHƯA THỰC HIỆN).
   - Commit và push cùng với mã nguồn để tài liệu luôn bám sát 100% mã nguồn thực tế.
