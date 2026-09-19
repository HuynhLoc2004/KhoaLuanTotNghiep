# 🛠️ TÀI LIỆU BÀN GIAO NHIỆM VỤ: XƯỞNG GHÉP ẢNH 360° (POC STITCHING STUDIO)

> **Người thực hiện:** **Vĩ Thành**  
> **Dự án:** Khóa luận Tốt nghiệp - Hệ thống Không gian Trưng bày & Tour 360° Bảo tàng Lịch sử TP.HCM  
> **Trang thực hiện:** `frontend/src/pages/PocStitchingPage.tsx` & `frontend/src/components/ShootingGuideModal.tsx`  
> **Ngày giao việc:** 19/09/2026  
> **Trạng thái:** `ĐANG THỰC HIỆN`

---

## ⛔ LỆNH CẤM BẤT KHẢ XÂM PHẠM (STRICT RED LINES)

> [!CAUTION]
> ### 🚨 TUYỆT ĐỐI KHÔNG ĐƯỢC CHẠM VÀO HOẶC SỬA ĐỔI THUẬT TOÁN GHÉP ẢNH!
> 
> Thuật toán ghép nối ảnh toàn cảnh 360° trong hệ thống đã được kiểm thử ổn định 100%, có khả năng cân bằng ánh sáng indoor tự nhiên, chống cháy sáng và xử lý cực tốt trong môi trường thiếu sáng của bảo tàng.
> 
> **NGHIÊM CẤM THAY ĐỔI CÁC FILE & LOGIC SAU:**
> 1. `stitching_worker/stitcher.py` (Hàm `balance_indoor_lighting`, trích xuất điểm đặc trưng SIFT/LoFTR, tính ma trận Homography, cylindrical wrap & multiband blending).
> 2. `stitching_worker/main.py` (Worker xử lý hàng đợi).
> 3. `backend/src/routes/stitch.ts` (API tiếp nhận ảnh và gọi worker).
> 
> **Dù Vĩ Thành tự code hay nhờ bất kỳ AI nào hỗ trợ, TUYỆT ĐỐI KHÔNG ĐƯỢC THAY ĐỔI CÁC THUẬT TOÁN ĐÃ GẦY CÔNG XÂY DỰNG!**  
> Nhiệm vụ của task này **100% chỉ tập trung vào Giao diện (UI/UX), Bố cục Responsive trên Điện thoại và Luồng tương tác Frontend!**

---

## 📋 CHI TIẾT 8 HẠNG MỤC CẦN THỰC HIỆN

### 1. Tối ưu Bố cục & Giới hạn Cuộn (Scroll) trên Điện thoại
* **Hiện trạng**: Khi chụp hoặc tải lên nhiều ảnh (15 - 24 ảnh), danh sách ảnh bị kéo dài vô tận dọc màn hình điện thoại. Người dùng phải cuộn màn hình mỏi tay mới xuống được nút "Tạo không gian 360°" và Trình xem trước.
* **Giải pháp cần làm**:
  - Đóng khung danh sách ảnh đã nạp bằng một container có giới hạn chiều cao:
    ```css
    .verified-frames-container {
      max-height: 280px;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      padding-right: 4px;
    }
    ```
  - Thiết kế dạng lưới thu nhỏ gọn gàng (Grid 3 - 4 cột trên điện thoại) hoặc dạng danh sách ngang cuộn trượt mượt mà.
  - Luôn hiển thị thanh tóm tắt số lượng ảnh (`Đã nạp: X / 16 - 24 ảnh`) ở đầu khối.

---

### 2. Sửa Luồng Nút "Chụp camera" (Phân định Điện thoại vs Máy tính)
* **Hiện trạng**: Khi dùng máy tính (Laptop/PC) bấm vào nút "Chụp camera", hệ thống lại kích hoạt hộp thoại chọn file (File Picker) giống hệt nút "Chọn từ máy", gây khó hiểu cho người dùng.
* **Nguyên nhân**: Thẻ `<input type="file" accept="image/*" capture="environment" />` khi chạy trên trình duyệt Desktop không có camera sau sẽ tự động fallback về File Explorer.
* **Giải pháp cần làm**:
  - Kiểm tra xem thiết bị có hỗ trợ Camera trực tiếp không:
    - **Trên Điện thoại**: Giữ nguyên `capture="environment"` để kích hoạt thẳng ứng dụng máy ảnh chụp từng góc.
    - **Trên Máy tính (Laptop/PC)**:
      - Cách 1: Hiển thị tooltip hoặc nhãn giải thích: *"Chức năng chụp trực tiếp tối ưu cho điện thoại di động. Trên máy tính vui lòng dùng 'Chọn từ máy' hoặc kết nối Webcam"*.
      - Cách 2: Mở một Modal WebCam chụp ảnh trực tiếp qua WebRTC `navigator.mediaDevices.getUserMedia({ video: true })` để người dùng chụp bằng webcam laptop.

---

### 3. Loại bỏ Lạm dụng Icon & Emoji, Chuẩn hóa Gam Màu Di Sản Bảo Tàng
* **Hiện trạng**: Một số chỗ còn dùng emoji (`🏛️`, `📸`, `🌐`, `✨`, `🔥`), huy hiệu màu xanh lá cây neon/AI sáng chói (`#10B981`) không phù hợp với không khí trang nghiêm của bảo tàng.
* **Giải pháp cần làm**:
  - Gỡ bỏ toàn bộ emoji khỏi giao diện.
  - Dùng icon SVG đơn nét tinh giản từ thư viện `lucide-react`.
  - Đồng bộ màu sắc theo đúng Bảng màu Di sản:
    - Màu nền bề mặt: Nâu gỗ trầm mộc `#160F0C` / `#231A15`.
    - Màu điểm nhấn: Vàng kim hoàng gia `var(--accent-gold)` (`#D4A86A`).
    - Màu thương hiệu: Đỏ sơn son `var(--primary)` (`#8C2D19`).
    - Trạng thái thành công / Đạt chuẩn: Ngọc bích cổ trầm dịu nhẹ (`#7F9E87`) hoặc Vàng đồng, tuyệt đối không dùng xanh lá cây neon.

---

### 4. Sửa Lỗi Nút "Sao chép link" trên Môi trường HTTP/VPS
* **Hiện trạng**: Bấm "Sao chép link" ở khung xem trước 360° và thư viện không sao chép được link vào bộ nhớ tạm khi chạy trên VPS (`http://103.178.233.206`).
* **Nguyên nhân**: API `navigator.clipboard.writeText` bị trình duyệt chặn trên các trang web không có chứng chỉ HTTPS bảo mật (`window.isSecureContext === false`).
* **Giải pháp cần làm**: Sử dụng hàm sao chép an toàn có cơ chế fallback bằng thẻ `<textarea>` ẩn:
  ```typescript
  export const copyTextToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;
    
    // Thử dùng Clipboard API chuẩn nếu có quyền và môi trường an toàn
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API error, falling back to execCommand:', err);
      }
    }
    
    // Cơ chế Fallback chạy 100% thành công trên cả HTTP VPS
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy error:', err);
      return false;
    }
  };
  ```

---

### 5. Hiệu ứng Loading & Thông báo Trạng thái Tiến trình khi Ghép Ảnh
* **Hiện trạng**: Khi bấm "Tạo không gian toàn cảnh 360°", khối xem trước bên phải vẫn đứng yên, Admin không biết hệ thống có đang ghép hay bị treo máy.
* **Giải pháp cần làm**:
  - Khi `isProcessing === true`:
    1. Icon nút bấm xoay tròn, vô hiệu hóa nút bấm chống bấm trùng lặp.
    2. Khối Trình xem trước 360° (khối bên phải) phủ một lớp màn mờ (Loading Overlay):
       - Hiển thị spinner xoay tròn kích thước lớn với màu `var(--accent-gold)`.
       - Hiển thị thông báo trạng thái tiến trình từng giai đoạn trực quan:
         - *Giai đoạn 1 (0s - 3s)*: "Đang phân tích điểm đặc trưng & cân bằng ánh sáng trong nhà..."
         - *Giai đoạn 2 (3s - 7s)*: "Đang tính ma trận biến đổi & ghép nối toàn cảnh 360° bằng OpenCV..."
         - *Giai đoạn 3 (7s+)*: "Đang hòa trộn biên ảnh (Multiband Blending) và lưu trữ kho di sản..."
       - Giúp Admin an tâm quan sát hệ thống đang làm việc bình thường.

---

### 6. Cập nhật lại Modal "Hướng dẫn chụp ảnh" Chuẩn Quy Tắc Ghép Không Gian
* **File cần sửa**: `frontend/src/components/ShootingGuideModal.tsx`
* **Hiện trạng**: Bản hướng dẫn cũ ghi "chụp 8 đến 12 góc, xoay 30 độ" là sai lệch so với yêu cầu thuật toán, khiến ảnh chụp bị thiếu độ gối đầu dẫn đến ghép lỗi.
* **Giải pháp cần làm**: Viết lại nội dung hướng dẫn chuẩn xác theo 4 nguyên tắc vàng của thuật toán ghép ảnh bảo tàng:
  1. **Tâm quay đơn (Trụ quay cố định)**: Người chụp đứng yên 1 vị trí giữa phòng, chỉ xoay thân người xung quanh 1 trục thẳng đứng (không bước đi, tránh thị sai).
  2. **Tầm máy chuẩn**: Giữ camera ngang tầm mắt hoặc ngực, điện thoại dựng thẳng đứng song song với các bức tường phòng trưng bày.
  3. **Độ gối đầu đạt 30% - 50%**: Tấm ảnh sau phải chứa ít nhất 30% - 50% chi tiết của tấm ảnh trước đó để thuật toán SIFT/LoFTR tìm đủ điểm đối sánh.
  4. **Số lượng khung hình chuẩn**: Xoay đều mỗi góc ~15° - 20°, chụp đủ từ **16 đến 24 bức ảnh** để bao quát trọn vẹn 360 độ không gian.

---

### 7. Tích hợp Phân Trang Chuẩn Hệ thống (`Pagination`)
* **Hiện trạng**: Danh sách "Thư viện không gian 360° đã tạo" cần đảm bảo áp dụng đúng chuẩn phân trang của toàn hệ thống Admin (`Pagination.tsx`).
* **Giải pháp cần làm**:
  - Sử dụng component `frontend/src/components/Pagination.tsx`.
  - Cấu hình kích thước trang: 6 - 8 ảnh / trang.
  - Hiển thị dòng thông báo: *"Hiển thị X - Y trên tổng số Z ảnh 360°"* kèm các nút chuyển trang đẹp mắt, đồng bộ màu vàng đồng di sản.

---

### 8. Quản lý Dữ liệu Thực tế, Cache & Queue
* **Giải pháp cần làm**:
  - Đảm bảo 100% dữ liệu hiển thị trong Thư viện được lấy từ API thật của Backend (`/api/stitch/history` hoặc `/api/panoramas`), tuyệt đối không mock dữ liệu cứng.
  - Giữ nguyên cơ chế lưu ảnh vào MongoDB và kho file tĩnh đã cấu hình.

---

## 🎯 CHECKLIST KIỂM THỬ KHI HOÀN THÀNH CHO VĨ THÀNH

- [ ] Đã test trên điện thoại: Tải 20 ảnh lên, khung danh sách ảnh cuộn gọn gàng trong 280px, nút ghép ảnh dễ bấm không bị trôi tuột xuống đáy.
- [ ] Bấm nút "Sao chép link" trên trình duyệt truy cập bằng IP VPS (`http://103.178.233.206`) thành công, có toast thông báo "Đã sao chép link".
- [ ] Khi bấm "Tạo không gian toàn cảnh 360°", khối xem trước bên phải hiện spinner xoay và các câu thông báo tiến trình rõ ràng.
- [ ] Mở modal "Hướng dẫn chụp ảnh" thấy 4 nguyên tắc chuẩn (tâm quay đơn, ngang tầm ngực, overlap 30-50%, 16-24 ảnh).
- [ ] Thư viện ảnh 360° có phân trang mượt mà, lật trang chuẩn xác.
- [ ] Toàn bộ màu sắc trang đồng bộ tone Di sản Nâu gỗ - Vàng đồng hoàng gia, không còn icon/emoji rườm rà hay màu xanh neon.
- [ ] **QUAN TRỌNG NHẤT: Thuật toán ghép ảnh và chất lượng ảnh 360° xuất ra vẫn giữ nguyên vẹn 100% như ban đầu!**
