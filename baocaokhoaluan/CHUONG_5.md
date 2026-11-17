# CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

Chương cuối của khóa luận tổng kết toàn bộ các kết quả đạt được về mặt khoa học công nghệ và giá trị thực tiễn sau quá trình nghiên cứu, xây dựng và triển khai thực tế hệ thống; đồng thời nhìn nhận khách quan các điểm còn hạn chế, đúc kết bài học kinh nghiệm và vạch ra các định hướng nghiên cứu phát triển khả thi trong tương lai.

---

## 5.1. Tổng kết các kết quả đạt được

Trải qua quá trình khảo sát thực địa tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh, nghiên cứu lý thuyết chuyên sâu và hiện thực hóa phần mềm, đề tài *"Hệ thống tham quan thực tế ảo 360° & Số hóa không gian di sản Bảo tàng Lịch sử TP. Hồ Chí Minh"* đã hoàn thành xuất sắc toàn bộ các mục tiêu nghiên cứu và kỹ thuật đề ra ban đầu, mang lại những đóng góp rõ nét ở cả hai khía cạnh:

### 5.1.1. Về mặt khoa học và làm chủ công nghệ
- **Xây dựng thành công chuỗi thuật toán xử lý ảnh ghép 360° tự động:**
  Đề tài đã làm chủ quy trình khép kín chuyển đổi video quay quét từ điện thoại thông thường thành ảnh toàn cảnh Equirectangular chuẩn tỷ lệ 2:1. Bằng cách tích hợp kỹ thuật nắn phẳng mặt trụ (Cylindrical Warping), trích xuất đặc trưng RootSIFT, ước lượng Homography lọc nhiễu qua RANSAC, tìm đường khâu cực tiểu Voronoi Seam và hòa trộn đa băng tần Laplacian, hệ thống đã giải quyết triệt để các thách thức nhiễu lóa do đèn rọi tủ kính bảo tàng và tự động nội suy vùng sàn Nadir với chi phí thiết bị 0 đồng.
- **Tiên phong kiến trúc Đa Động cơ (Dual-Engine) trong tái tạo mô hình 3D cổ vật:**
  Khóa luận đã hiện thực hóa sáng tạo hai phương pháp tiếp cận bổ trợ cho nhau:
  + *Động cơ Heuristic nội bộ (`artifact_3d_generator.py`):* Khai thác biến đổi khoảng cách Euclid và vòm cầu điều hòa liên tục trên CPU máy chủ, cho phép bóc tách và tạo mô hình 3D khép kín (.GLB) từ một ảnh chụp đơn trong thời gian cực ngắn ($3 – 6\text{ giây}$), dung lượng siêu nhẹ ($2 – 5\text{ MB}$), không phát sinh bất kỳ chi phí GPU nào.
  + *Động cơ AI Diffusion đám mây (`trellisClient.ts`):* Kết nối mô hình TRELLIS trên máy chủ GPU đám mây để suy diễn thể tích mặt sau cho các cổ vật phức tạp, tạo tiền đề số hóa toàn diện di sản quốc gia.
- **Tối ưu hóa hiệu năng kết xuất đồ họa WebGL phân tán:**
  Ứng dụng thành công thư viện Three.js kết hợp giải thuật dẫn đường Dijkstra trên sơ đồ mặt bằng 18 gian phòng, tích hợp trợ lý trí tuệ nhân tạo Google Gemini 2.5 Flash qua cơ chế nạp ngữ cảnh nhẹ (Lightweight RAG). Hệ thống duy trì ổn định tốc độ khung hình từ $48$ đến $60\text{ FPS}$ và thời gian nạp phòng dưới $1,5\text{ giây}$ trên mạng di động 4G nhờ cơ chế dọn dẹp giải phóng bộ nhớ GPU (`dispose()`) nghiêm ngặt.

### 5.1.2. Về mặt giá trị thực tiễn cho bảo tàng và cộng đồng
- **Số hóa trọn vẹn 18 gian phòng trưng bày liên hoàn:**
  Đề tài đã hoàn thành số hóa chi tiết toàn bộ khuôn viên và 18 gian phòng chuyên đề của Bảo tàng Lịch sử TP.HCM, bao gồm từ thời Tiền sử, Dựng nước Hùng Vương, các triều đại Ngô – Đinh – Tiền Lê – Lý – Trần – Hậu Lê – Tây Sơn – Nguyễn, đến các bộ sưu tập văn hóa đặc sắc như Văn hóa Champa, Văn hóa Óc Eo – Phù Nam, Tượng Phật giáo châu Á và Cổ vật Vương Hồng Sển.
- **Cung cấp giải pháp chuyển đổi số toàn diện chi phí thấp:**
  Không dừng lại ở một ứng dụng tham quan đơn thuần, hệ thống mang đến một hệ sinh thái chuyển đổi số hoàn chỉnh cho bảo tàng: từ hệ thống quản trị nội dung CMS trực quan, kiểm soát thương hiệu, quản lý hiện vật, thuyết minh âm thanh song ngữ, đến cổng bán vé trực tuyến thanh toán tự động qua mã VietQR (PayOS) và quét mã QR soát vé tại cửa ra vào qua camera điện thoại di động.
- **Góp phần lan tỏa và bảo tồn di sản văn hóa dân tộc:**
  Hệ thống giúp xóa bỏ rào cản địa lý và kinh tế, mở ra cơ hội tiếp cận kho tàng tri thức lịch sử ngàn năm của dân tộc cho hàng triệu học sinh, sinh viên, các nhà nghiên cứu và du khách quốc tế mọi lúc mọi nơi ngay trên trình duyệt web mà không cần cài đặt phần mềm phức tạp.

---

## 5.2. Các mặt hạn chế và bài học kinh nghiệm

Bên cạnh những kết quả tích cực đã đạt được, nhóm tác giả thẳng thắn nhìn nhận hệ thống vẫn còn một số điểm hạn chế kỹ thuật cần tiếp tục khắc phục:

### 5.2.1. Những hạn chế kỹ thuật hiện tại
- **Hạn chế về ánh sáng và phản quang trong không gian bảo tàng:**
  Môi trường trưng bày thực tế tại bảo tàng sử dụng hệ thống đèn rọi vàng công suất cao chiếu thẳng vào các tủ kính chống trộm. Khi lia máy quay video bằng điện thoại, các điểm phản xạ ánh sáng mạnh trên mặt kính đôi khi gây ra hiện tượng lóa cục bộ, đòi hỏi người quay phải giữ tốc độ di chuyển thật đều tay và chọn góc quay tránh phản xạ trực tiếp.
- **Giới hạn hình học mặt sau của Động cơ 3D Heuristic:**
  Do bản chất toán học của phương pháp biến đổi khoảng cách Euclid dựa trên một góc nhìn duy nhất (Single-view Depth Inpainting), mặt sau của mô hình 3D sinh bởi động cơ CPU nội bộ mang tính đối xứng trơn tru với mặt trước. Đối với các hiện vật rỗng ruột phức tạp (như bên trong lòng đỉnh đồng hoặc mặt sau của tượng tròn có hoa văn riêng biệt), phương pháp này chưa thể tái tạo chi tiết mặt sau mà cần chuyển tiếp sang Động cơ AI GPU đám mây.
- **Độ trễ xử lý hàng đợi ghép ảnh khi tải cao:**
  Quy trình ghép ảnh 360 độ từ video đòi hỏi khối lượng tính toán ma trận lớn trên CPU máy chủ VPS. Khi nhiều tác vụ ghép ảnh được gửi lên cùng lúc, hàng đợi Redis cần từ $2$ đến $4\text{ phút}$ để hoàn tất một bức ảnh Equirectangular độ phân giải siêu nét $8192 \times 4096\text{ px}$.

### 5.2.2. Bài học rút ra trong quá trình triển khai
- **Tính thực tế của dữ liệu khảo sát hiện trường:**
  Quá trình tác nghiệp thực tế qua 4 đợt tại bảo tàng đã chứng minh rằng việc khảo sát kỹ lưỡng ánh sáng, kiến trúc cửa thông phòng và quy định bảo mật hiện vật đóng vai trò quyết định đến sự thành bại của thuật toán thị giác máy tính, thay vì chỉ thử nghiệm trong điều kiện phòng thí nghiệm lý tưởng.
- **Tầm quan trọng của việc tối ưu tài nguyên thiết bị đầu cuối:**
  Việc quản trị vòng đời đối tượng Three.js và giải phóng tài nguyên bộ nhớ đệm (Cache/Texture/Geometry) là chìa khóa sống còn giúp ứng dụng 3D đồ họa nặng vận hành mượt mà trên các dòng điện thoại thông minh phổ thông có dung lượng RAM khiêm tốn.

---

## 5.3. Hướng phát triển trong tương lai

Nhằm nâng tầm hệ thống và đáp ứng tốt hơn nữa xu thế phát triển của công nghệ bảo tàng số (Smart Digital Museum) trên thế giới, nhóm định hướng mở rộng nghiên cứu theo 2 trục đột phá công nghệ:

### 5.3.1. Tích hợp công nghệ thực tế ảo mở rộng WebXR và kính thông minh
- **Hỗ trợ thiết bị đeo thực tế ảo và thực tế tăng cường:**
  Nâng cấp lõi đồ họa Three.js để tương thích hoàn toàn với chuẩn mở **WebXR Device API**, cho phép người dùng kích hoạt chế độ không gian nổi (Immersive VR Mode) khi đeo các loại kính thực tế ảo như Meta Quest, Apple Vision Pro hoặc kính Cardboard giá rẻ gắn điện thoại.
- **Tương tác AR trong không gian thực tế:**
  Phát triển tính năng thực tế tăng cường (Augmented Reality - AR) cho phép khách tham quan khi đến bảo tàng có thể dùng camera điện thoại hướng vào hiện vật để xem ngay mô hình 3D tương tác nhảy ra khỏi tủ kính, xem video tái hiện lịch sử hoặc quan sát cổ vật được phục chế nguyên bản thời hoàng kim.

### 5.3.2. Nâng cấp mô hình 3D Gaussian Splatting và trợ lý tương tác giọng nói
- **Ứng dụng công nghệ tái tạo không gian 3D Gaussian Splatting (3DGS):**
  Nghiên cứu ứng dụng kỹ thuật 3D Gaussian Splatting tiên tiến nhất hiện nay để thay thế ảnh toàn cảnh tĩnh dạng cầu bằng một đám mây hạt Gaussian liên tục 6 bậc tự do (6-DoF), cho phép người tham quan có thể tự do di chuyển bước đi tự nhiên trong gian phòng bảo tàng với chất lượng ánh sáng chân thực như đang đứng tại hiện trường.
- **Tự động hóa thuyết minh đa ngôn ngữ qua giọng nói trí tuệ nhân tạo (AI Voice):**
  Nâng cấp trợ lý AI Google Gemini tích hợp mô hình tổng hợp giọng nói tự nhiên (Text-to-Speech) đa vùng miền (Bắc – Trung – Nam) và mở rộng thêm các ngôn ngữ quốc tế (tiếng Pháp, tiếng Nhật, tiếng Trung, tiếng Hàn), tạo nên trải nghiệm thuyết minh tự động cá nhân hóa theo từng bước chân của du khách.

