# 🏛️ QUY TẮC THIẾT KẾ SLIDE POWERPOINT BÁO CÁO KHÓA LUẬN TỐT NGHIỆP
## CHUẨN HỘI ĐỒNG BẢO VỆ ĐẠI HỌC (PHIÊN BẢN HỌC THUẬT V5.0 - SƠ ĐỒ TƯ DUY & BỐ CỤC CHUẨN MỰC)

> **Đề tài:** Hệ thống Tham Quan Thực Tế Ảo 360° & Số Hóa Không Gian Di Sản Bảo Tàng Lịch Sử TP.HCM  
> **Sinh viên thực hiện:** Huỳnh Tấn Lộc (Trưởng nhóm) – Trịnh Vĩ Thành  
> **Giảng viên hướng dẫn:** TS. Trần Thị Minh Khoa  
> **Đơn vị đào tạo:** Trường Đại học Công nghiệp TP.HCM (IUH) – Khoa Công nghệ Thông tin  
> **Cập nhật:** 14/11/2026 | **Phiên bản:** v5.0 Chuẩn Hội Đồng Bảo Vệ (Sơ Đồ Tư Duy Đồ Họa – Tối Ưu Báo Cáo Bảo Vệ)  
> **Tệp tin slide báo cáo hoàn thiện:** `BaoCao_KhoaLuanTotNghiep_BaoTangLichSu360.pptx`  

---

## I. CÁC NGUYÊN TẮC CỐT LÕI (STRICT DESIGN & PRESENTATION RULES)

### 1. Chuẩn mực xưng hô và văn phong thuyết trình trước Hội đồng
* **Xưng hô trang trọng, đúng chuẩn học thuật**:
  - Với Hội đồng: Luôn mở đầu và thưa gửi bằng *"Kính thưa Quý Thầy Cô trong Hội đồng đánh giá Khóa luận tốt nghiệp"*, *"Kính thưa Thầy/Cô Chủ tịch Hội đồng và Quý Thầy Cô..."*.
  - Với Giảng viên hướng dẫn: *"Chúng em xin bày tỏ lòng biết ơn chân thành và sâu sắc đến Cô TS. Trần Thị Minh Khoa đã tận tình chỉ dẫn, định hướng phương pháp nghiên cứu và động viên chúng em trong suốt quá trình hoàn thành khóa luận."*.
  - Tự xưng: Luôn xưng *"chúng em"* hoặc *"nhóm nghiên cứu"*. Tuyệt đối không dùng các đại từ khẩu ngữ như *"tụi em"*, *"mình"*, *"tôi"*.
* **Cách dùng từ ngữ trong sáng, chuẩn xác, khiêm tốn**:
  - Tuyệt đối tránh các từ ngữ quảng cáo, tiếp thị hoặc sáo rỗng thường thấy từ AI như: *"bước nhảy vọt"*, *"đột phá vĩ đại"*, *"công nghệ tối tân hàng đầu"*, *"hoàn hảo tuyệt đối"*.
  - Luôn sử dụng ngôn ngữ kỹ thuật trung thực, có cơ sở dữ liệu và dẫn chứng thực nghiệm rõ ràng: thay vì nói *"hệ thống xử lý siêu nhanh"*, hãy nói *"hệ thống đạt thời gian kết xuất trung bình 0,82 đến 1,42 giây trên kết nối mạng 4G"*.
  - Thẳng thắn chỉ rõ các thách thức kỹ thuật và giới hạn của đề tài (ví dụ: hiện tượng lóa sáng tủ kính khi quay video bằng điện thoại, mặt sau của mô hình 3D Heuristic mang tính đối xứng trơn cần kết hợp TRELLIS GPU đám mây).

### 2. Bãi bỏ hoàn toàn phong cách text mũi tên "->" và văn bản AI cẩu thả
* **Tuyệt đối KHÔNG viết mũi tên bằng text (`->`, `→`, `=>`)**: Không được viết quy trình dưới dạng dòng chữ như `Chụp ảnh -> COLMAP -> Mesh`. Toàn bộ quy trình bắt buộc phải được biểu diễn bằng **Sơ đồ khối đồ họa (Flowcharts, Step Pills, Connected Blocks)** chuẩn PowerPoint với các khối bo góc, số bước rõ ràng, tiêu đề in đậm và mô tả cô đọng.
* **Tuyệt đối KHÔNG dùng các icon ngô nghê, dấu tích AI (`✔`, `▶`)**: Thay thế bằng hệ thống thẻ khối học thuật, huy hiệu phân tầng (Pill Badges) và viền sắc nét 1pt.
* **Loại bỏ văn bản dài dòng, kể lể**: Mỗi luận điểm kỹ thuật được cấu trúc theo công thức chuẩn: **Thuật toán/Tính năng cốt lõi (In đậm)** + **Mô tả kỹ thuật thực tế (Ngắn gọn)**.

### 3. Nguyên tắc về Hình ảnh và Khung Placeholder thực tế
* **Tuyệt đối không chèn ảnh bậy / ảnh test scratch / ảnh demo ngoài dự án**: Chỉ sử dụng hình ảnh chụp màn hình thực tế từ hệ thống đang chạy (`museumhcm.duckdns.org`), hình ảnh tác nghiệp tại bảo tàng hoặc ảnh đồ họa kiến trúc do nhóm xây dựng.
* **Cung cấp sẵn Khung Placeholder chuẩn kích thước học thuật**: Các slide cần minh họa (Slide 08, 09, 10, 14, 15, 17) được bố trí sẵn các khung viền nét đứt (Dashed border 1.5pt `#94A3B8`) kèm nhãn hướng dẫn rõ ràng:
  `[ KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ ]`  
  *(Kèm tỷ lệ khuyến nghị: 16:9 cho giao diện Tour 360°, 4:3 cho cổ vật 3D, 9:16 cho quét mã QR di động)* để người dùng kéo thả ảnh vào vừa vặn, không bị méo vỡ.

### 4. Đánh giá Trung thực về Kỹ thuật Phương pháp 1 (Xưởng ghép ảnh 360° từ video điện thoại)
* **Khẳng định tính chất dễ phát sinh lỗi**: Phương pháp quay quét bằng điện thoại thông thường là phương pháp dễ phát sinh lỗi nhất trong thực tế do tay người quay bị rung lắc, lệch tâm quay quang học (Parallax error) và hiện tượng phản quang mạnh từ đèn rọi vàng chiếu vào tủ kính bảo tàng.
* **Yêu cầu năng lực máy chủ**: Quá trình giải ma trận Homography, so khớp RootSIFT và tối ưu đường khâu Voronoi Seam tiêu tốn tài nguyên tính toán lớn của CPU/RAM. Nếu cấu hình máy chủ không tối ưu, tiến trình sẽ bị nghẽn hàng đợi hoặc vỡ mí ghép.
* **Giải pháp đề tài đã giải quyết**: Áp dụng nắn phẳng mặt trụ (Cylindrical Warping), trích xuất đặc trưng RootSIFT kết hợp RANSAC với ngưỡng sai số tái chiếu $3,0\text{ px}$, phân rã tháp Laplacian hòa trộn đa băng tần, và tách riêng tiến trình Worker xử lý ngầm qua hàng đợi Redis (`stitchQueue`) để đảm bảo máy chủ Node.js không bị treo gián đoạn.

### 5. Bảng màu Học thuật Chuẩn Hội đồng (Academic Light Pearl Palette)
* **Nền slide**: Sáng ngọc trai `#F8F9FA` (High Contrast Light Background), tối ưu tuyệt đối cho máy chiếu hội trường lớn, chống mỏi mắt.
* **Màu chủ đạo di sản**: Đỏ sơn son `#8C2D19` (Heritage Burgundy) dành cho Tiêu đề chính, thanh nhấn và đường phân cách.
* **Màu đối sánh học thuật**: Xanh than sẫm `#1E3A5F` (Academic Navy) dành cho các khối kiến trúc kỹ thuật hệ thống.
* **Màu bổ trợ**: Vàng đồng thau `#B8860B` (Heritage Gold) và Xanh ngọc di sản `#0D766E` (Heritage Teal).
* **Màu chữ**: Xanh đen đậm `#0F172A` cho tiêu đề, Than chì sẫm `#1E293B` cho nội dung, tương phản cao, sắc nét.
* **Viền thẻ**: Viền xám mảnh 1pt `#CBD5E1` tạo cảm giác khối hộp ngăn nắp, trang nhã.

---

## II. MA TRẬN 20 SLIDE BÁO CÁO HỘI ĐỒNG (V5.0)

| Slide | Tiêu Đề Mục | Loại Trực Quan Hóa (Visual Type) | Nội Dung Chuyên Môn Trọng Tâm | Khung Chèn Ảnh Thực Tế |
|:---:|:---|:---|:---|:---:|
| **01** | **Trang Bìa Khóa Luận** | Khung Viền Báo Cáo Trang Trọng | Tên đề tài, GVHD: TS. Trần Thị Minh Khoa, SV: Huỳnh Tấn Lộc & Trịnh Vĩ Thành, IUH – Khoa CNTT | Logo IUH |
| **02** | **Cấu Trúc Khóa Luận** | **Sơ đồ tư duy dạng Tỏa nhánh (Hub & Spoke)** | Khối trung tâm tỏa ra 4 nhánh trụ cột: Bối cảnh & Vấn đề, Khảo sát kỹ thuật, Kiến trúc giải pháp, Hiện thực hóa & Đánh giá | — |
| **03** | **Bối Cảnh & Tính Cấp Thiết** | **Sơ đồ 3 Khối Tiến Trình Liên Kết** | Thực trạng 40.000 cổ vật tại bảo tàng $\rightarrow$ Rào cản máy quét laser hàng trăm triệu $\rightarrow$ Giải pháp tự chủ thiết bị chi phí 0đ | — |
| **04** | **Kiến Trúc Hệ Thống Tổng Thể** | **Sơ đồ Phân Tầng 4-Tier Architecture** | Client Frontend (React, Three.js) $\rightarrow$ API Gateway (Node.js, Express) $\rightarrow$ Python Worker Engine $\rightarrow$ DB Cluster (PostgreSQL + MongoDB + Redis) | — |
| **05** | **Khảo Sát & So Sánh 4 Phương Pháp 3D** | **Bảng Ma Trận Đối Chiếu Kỹ Thuật** | So sánh 4 phương pháp: Ảnh 360° Equirectangular, Dựng lưới đa giác SfM/MVS, Gaussian Splatting (3DGS), Tái tạo 3D từ ảnh đơn | — |
| **06** | **Phương Pháp 1: Thuật Toán Ghép 360°** | **Sơ đồ Khối Tiến Trình Dọc 5 Bước** | 1. Trích xuất khung hình khóa $\rightarrow$ 2. Nắn phẳng mặt trụ $\rightarrow$ 3. RootSIFT & RANSAC $\rightarrow$ 4. Voronoi Seam & Laplacian Blending $\rightarrow$ 5. Nội suy sàn Nadir | — |
| **07** | **Đánh Giá Khách Quan Phương Pháp 1** | **Bảng Đối Chiếu 2 Cột: Ưu Điểm vs Thách Thức** | Ưu điểm: Tận dụng điện thoại có sẵn, chi phí 0đ vs Thách thức: Rung lắc tay, lệch tâm Parallax, lóa tủ kính và giải pháp lọc nhiễu | — |
| **08** | **Phương Pháp 2: Tái Tạo SfM/MVS** | **Flowchart 5 Bước + Khung Placeholder** | Khảo sát pipeline chụp ảnh đa góc $\rightarrow$ COLMAP SfM định vị máy ảnh $\rightarrow$ OpenMVS làm dày đám mây điểm $\rightarrow$ Dựng lưới đa giác | **Khung 1 (Tỷ lệ 4:3)**: Ảnh chụp đám mây điểm / lưới 3D thực nghiệm |
| **09** | **Phương Pháp 3: 3D Gaussian Splatting** | **Flowchart 5 Bước + Khung Placeholder** | Khảo sát pipeline khởi tạo điểm SfM $\rightarrow$ Tối ưu hóa vi phân hạt Gaussian 3D $\rightarrow$ Điều khiển mật độ thích nghi $\rightarrow$ Kết xuất thời gian thực | **Khung 2 (Tỷ lệ 16:9)**: Ảnh kết xuất thử nghiệm không gian Gaussian |
| **10** | **Phương Pháp 4: Tái Tạo 3D Cổ Vật Đa Động Cơ** | **Flowchart 5 Bước + Khung Placeholder** | Pipeline Dual-Engine: Động cơ 1 (CPU Heuristic: U2-Net, khoảng cách Euclid, vòm cầu điều hòa, Normal Map) + Động cơ 2 (GPU TRELLIS) | **Khung 3 (Tỷ lệ 4:3)**: Ảnh mô hình 3D cổ vật (.GLB) xoay 360° |
| **11** | **Lựa Chọn Công Nghệ Tối Ưu Cho Đề Tài** | **Sơ đồ Quyết Định Kiến Trúc Nhị Phân** | Lý giải khoa học: Không gian 360° cho 18 gian phòng (nhẹ, mượt) + Mô hình 3D (.GLB) cho bảo vật độc bản (tương tác xoay lật 360°) | — |
| **12** | **Phân Hệ 1: Xưởng Ghép Ảnh 360° Tự Động** | **Sơ đồ Luồng Tác Vụ Bất Đồng Bộ** | Giao diện điều phối `PocStitchingPage.tsx`, hàng đợi Redis `stitchQueue`, thông báo tiến độ thời gian thực qua Server-Sent Events (SSE) | — |
| **13** | **Phân Hệ 2: Cổng Tham Quan 360° & Hotspots** | **Sơ đồ Nguyên Lý Chuyển Đổi Tọa Độ Cầu** | Khối cầu Three.js `SphereGeometry`, công thức ánh xạ màn hình Click $(x, y) \rightarrow (\theta, \phi)$, giải phóng bộ nhớ GPU `dispose()` | — |
| **14** | **Phân Hệ 3: Quản Trị CMS & Soát Vé QR** | **Thẻ Tính Năng + Khung Placeholder Lớn** | Quản trị nhận diện thương hiệu, làm sạch mã độc SVG Cloudinary `fl_sanitize`, camera di động quét mã QR vé vào cổng `Html5QrcodeScanner` | **Khung 4 (Tỷ lệ 16:9)**: Ảnh giao diện Admin CMS & Camera quét vé QR |
| **15** | **Phân Hệ 4: Trải Nghiệm Khách & Trợ Lý AI** | **Thẻ Trải Nghiệm + Khung Placeholder Lớn** | Mini-map dẫn đường Dijkstra 18 phòng, thuyết minh âm thanh song ngữ, Trợ lý ảo Google Gemini 2.5 Flash Lightweight RAG, thanh toán VietQR PayOS | **Khung 5 (Tỷ lệ 16:9)**: Ảnh Cổng tham quan 360° tích hợp Mini-map & AI |
| **16** | **Kỹ Thuật Tối Ưu Hiệu Năng Chuyên Sâu** | **Sơ đồ 4 Thẻ Giải Pháp Tối Ưu Hệ Thống** | 1. Giải phóng bộ nhớ GPU Three.js `dispose()` $\rightarrow$ 2. Nén ảnh WebP & Lazy-load $\rightarrow$ 3. Bộ đệm đa tầng Redis Cache $\rightarrow$ 4. Tiết lưu Rate Limiter cho AI | — |
| **17** | **Kết Quả Đo Đạc Hiệu Năng Thực Nghiệm** | **Bảng Số Liệu Đo Đạc Thực Tế Đa Thiết Bị** | Bảng đo đạc trên 5 thiết bị: Tốc độ khung hình (48 - 60 FPS), thời gian tải qua 4G (0,82 - 1,42s), mức tăng RAM sau 18 phòng (< 15MB), quét vé (0,45s) | **Khung 6 (Tỷ lệ 16:9)**: Biểu đồ / Hình ảnh tác nghiệp tại bảo tàng |
| **18** | **Tổng Kết Đóng Góp Của Khóa Luận** | **Sơ đồ 3 Trụ Cột Giá Trị Cốt Lõi** | Giá trị Khoa học (Làm chủ thuật toán xử lý ảnh, kiến trúc Dual-Engine) – Giá trị Thực tiễn (Số hóa 18 phòng 0đ) – Giá trị Xã hội (Bảo tồn di sản) | — |
| **19** | **Hạn Chế Kỹ Thuật & Hướng Phát Triển** | **Sơ đồ Đối Xứng 2 Cột: Hạn Chế vs Định Hướng** | 3 Điểm hạn chế hiện tại (Ánh sáng tủ kính, đối xứng mặt sau CPU) $\rightarrow$ 2 Hướng nâng cấp tương lai (Thực tế ảo WebXR, 3D Gaussian Splatting) | — |
| **20** | **Lời Tri Ân & Hỏi Đáp (Q&A)** | **Khung Báo Cáo Trang Trọng Kết Thúc** | Lời cảm ơn Quý Thầy Cô Hội đồng, GVHD TS. Trần Thị Minh Khoa, Nhà trường IUH, Bảo tàng Lịch sử TP.HCM; Sẵn sàng giải đáp câu hỏi | — |

---

## III. MẪU THIẾT KẾ KHUNG PLACEHOLDER CHÈN ẢNH HỌC THUẬT

Để đảm bảo sinh viên tự chèn ảnh chụp thực tế từ dự án mà không làm vỡ bố cục slide, mỗi khung hình học thuật được thiết kế chuẩn xác với cấu trúc sau trong mã nguồn PowerPoint (`python-pptx`):

```python
# Mẫu tạo Khung Placeholder chèn ảnh học thuật (Dashed Border 1.5pt)
placeholder = slide.shapes.add_shape(
    MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height
)
placeholder.fill.solid()
placeholder.fill.fore_color.rgb = RGBColor(248, 250, 252)  # Xám ngọc trai #F8FAFC
placeholder.line.color.rgb = RGBColor(148, 163, 184)       # Viền xám mảnh #94A3B8
placeholder.line.width = Pt(1.5)
placeholder.line.dash_style = MSO_LINE_DASH_STYLE.DASH     # Nét đứt trang nhã

# Nhãn hướng dẫn hiển thị ở tâm khung
tf = placeholder.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = "🖼️ KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ\n[ Kéo thả hình ảnh chụp màn hình / render thực tế vào khung này ]"
run.font.size = Pt(11)
run.font.bold = True
run.font.color.rgb = RGBColor(100, 116, 139)               # Xám ghi #64748B
```

---

## IV. BỘ TỪ KHÓA VÀ CÂU MỞ ĐẦU CHUẨN KHI BÁO CÁO TRƯỚC HỘI ĐỒNG

1. **Slide 01 (Mở đầu):**  
   *"Kính thưa Quý Thầy Cô trong Hội đồng đánh giá Khóa luận tốt nghiệp. Em tên là Huỳnh Tấn Lộc, đại diện nhóm nghiên cứu gồm em và bạn Trịnh Vĩ Thành, dưới sự hướng dẫn khoa học của Cô TS. Trần Thị Minh Khoa. Hôm nay, chúng em rất vinh dự được trình bày báo cáo khóa luận tốt nghiệp với đề tài: 'Hệ thống tham quan thực tế ảo 360° & Số hóa không gian di sản Bảo tàng Lịch sử Thành phố Hồ Chí Minh'."*

2. **Slide 03 (Vấn đề & Tính cấp thiết):**  
   *"Kính thưa Quý Thầy Cô, Bảo tàng Lịch sử TP.HCM hiện đang lưu giữ hơn 40.000 hiện vật quý giá. Tuy nhiên, các giải pháp số hóa truyền thống sử dụng máy quét Laser hay máy ảnh 360 độ chuyên dụng đòi hỏi kinh phí lên tới hàng trăm triệu đồng, gây trở ngại lớn cho các bảo tàng công lập. Đứng trước thực tế đó, mục tiêu cốt lõi của chúng em là xây dựng một giải pháp công nghệ hoàn toàn tự chủ, cho phép tạo lập không gian tham quan 360° và số hóa hiện vật 3D với chi phí thiết bị 0 đồng, tận dụng ngay điện thoại thông minh thông thường."*

3. **Slide 07 & Slide 10 (Đánh giá trung thực về kỹ thuật):**  
   *"Trong quá trình thực nghiệm, chúng em nhận thấy rõ rằng việc tạo không gian từ video quay quét bằng điện thoại phát sinh nhiều thách thức như rung lắc tay và phản xạ đèn rọi trên mặt kính. Để khắc phục, chúng em đã làm chủ chuỗi thuật toán nắn mặt trụ, trích xuất đặc trưng RootSIFT lọc nhiễu qua RANSAC và hòa trộn tháp Laplacian. Đồng thời, đối với số hóa cổ vật, chúng em tiên phong kiến trúc Đa Động cơ (Dual-Engine) kết hợp giữa thuật toán Heuristic CPU nội bộ chi phí 0 đồng cho hiện vật dạng phù điêu và mô hình khuếch tán AI TRELLIS trên GPU đám mây cho các bảo vật quốc gia có hình thể phức tạp."*

4. **Slide 20 (Kết thúc & Lắng nghe phản biện):**  
   *"Kính thưa Quý Thầy Cô, bài báo cáo của nhóm chúng em đến đây là hoàn thành. Chúng em xin chân thành cảm ơn Quý Thầy Cô trong Hội đồng đã chú ý lắng nghe. Chúng em rất mong nhận được những nhận xét, góp ý và câu hỏi quý báu từ Quý Thầy Cô để hoàn thiện đề tài hơn nữa. Chúng em xin trân trọng cảm ơn!"*
