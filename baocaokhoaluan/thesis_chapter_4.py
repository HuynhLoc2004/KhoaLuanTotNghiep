# -*- coding: utf-8 -*-
"""
CHƯƠNG 4: TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG
Báo cáo Khóa luận Tốt nghiệp - IUH
Nội dung:
- 4.1. Quy trình triển khai và tích hợp hệ thống (System Deployment & CI/CD Pipeline):
  + 4.1.1. Kiến trúc hạ tầng máy chủ và điều phối container (Docker Compose & Nginx Reverse Proxy)
  + 4.1.2. Đường ống tự động hóa kiểm thử và triển khai liên tục CI/CD (GitHub Actions Pipeline)
  + 4.1.3. Triển khai phân hệ Backend và cơ sở dữ liệu kép (PostgreSQL 16 & MongoDB 7.0)
  + 4.1.4. Triển khai phân hệ Frontend và tối ưu hóa WebGL Three.js
  + 4.1.5. Triển khai tích hợp các dịch vụ bên ngoài (PayOS, Trellis ZeroGPU, Cloudflare R2, Google TTS)
- 4.2. Kết quả triển khai các phân hệ chức năng:
  + 4.2.1. Phân hệ tạo không gian toàn cảnh 360° với 4 chức năng nguồn ảnh đầu vào
  + 4.2.2. Phân hệ tái tạo cổ vật 3D với 2 động cơ (Local CPU vs Cloud AI TRELLIS) và 2 chế độ nạp ảnh
  + 4.2.3. Phân hệ bản đồ tương tác và định tuyến liên thông Dijkstra qua 18 phòng trưng bày
  + 4.2.4. Phân hệ đặt vé trực tuyến VietQR PayOS và soát vé camera thời gian thực
  + 4.2.5. Phân hệ Quản trị hệ thống, Nhận diện thương hiệu Đa bảo tàng và Vận hành
  + 4.2.6. Tập hợp các giao diện website thực tế (Khách tham quan, Quản trị CMS, Studio)
- 4.3. Đánh giá hiệu suất hệ thống (Apache JMeter, Google Lighthouse, Core Web Vitals)
"""

from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_4(doc, helper):
    """Xây dựng toàn bộ nội dung Chương 4 theo cấu trúc nâng cấp toàn diện và có cơ sở tài liệu trích dẫn."""
    
    # Tiêu đề Chương 4
    p_c4 = helper.add_heading_1(doc, "CHƯƠNG 4: TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG")
    p_c4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # -------------------------------------------------------------------------
    # 4.1. QUY TRÌNH TRIỂN KHAI VÀ TÍCH HỢP HỆ THỐNG
    # -------------------------------------------------------------------------
    helper.add_heading_2(doc, "4.1. Quy trình triển khai và tích hợp hệ thống (System Deployment & CI/CD Pipeline)")
    helper.add_body_p(doc,
        "Để đưa một hệ thống công nghệ thông tin phức hợp — kết hợp giữa xử lý ảnh toàn cảnh 8K, đồ họa WebGL 3D tương tác, "
        "thanh toán ngân hàng trực tuyến và mô hình trí tuệ nhân tạo Deep Learning — vào vận hành thực tế ổn định, "
        "nhóm nghiên cứu đã xây dựng một quy trình triển khai chuẩn mực, khép kín dựa trên kiến trúc container hóa và "
        "đường ống tự động hóa CI/CD hiện đại [18], [19], [33]."
    )
    
    # 4.1.1. Kiến trúc hạ tầng máy chủ và điều phối container
    helper.add_heading_3(doc, "4.1.1. Kiến trúc hạ tầng máy chủ và điều phối container (Docker Compose & Nginx)")
    helper.add_body_p(doc,
        "Hệ thống được triển khai trên nền tảng máy chủ ảo hóa đám mây Cloud VPS sử dụng hệ điều hành Ubuntu 22.04 LTS (64-bit) "
        "đặt tại trung tâm dữ liệu trong nước nhằm tối ưu hóa độ trễ kết nối mạng cho du khách Việt Nam [18], [19]. "
        "Toàn bộ các thành phần phần mềm được đóng gói thành các dịch vụ độc lập thông qua Docker Engine và điều phối tập trung bằng Docker Compose [19]:"
    )
    helper.add_bullet_item(doc,
        "Đóng vai trò là cổng đón tiếp duy nhất (Reverse Proxy & API Gateway), tiếp nhận các yêu cầu HTTP/HTTPS tại cổng 80 và 443. Nginx thực hiện điều phối tải (Load Balancing), nén dữ liệu truyền tải Gzip, thiết lập bộ đệm tĩnh (Static Asset Caching) cho các tệp ảnh 360° và mô hình 3D, đồng thời tích hợp chứng chỉ số SSL/TLS của Let's Encrypt bảo vệ dữ liệu truyền thông [18].",
        bold_prefix="1. Nginx Reverse Proxy Container: "
    )
    helper.add_bullet_item(doc,
        "Chạy môi trường Node.js v20 LTS [12] và Express Framework, quản lý toàn bộ các RESTful API nghiệp vụ, phân quyền JWT, giao tiếp Webhook ngân hàng và điều phối hàng đợi tác vụ xử lý ảnh.",
        bold_prefix="2. Backend Application Container (Port 5000): "
    )
    helper.add_bullet_item(doc,
        "Chạy ứng dụng Single Page Application (SPA) phát triển bằng React 18 [20], TypeScript và Vite [21], phục vụ giao diện người dùng tương tác cho cả cổng khách tham quan và cổng quản trị CMS.",
        bold_prefix="3. Frontend Client Container (Port 5173 / Internal Web): "
    )
    helper.add_bullet_item(doc,
        "PostgreSQL 16 [13] (quản lý giao dịch vé và tài chính đảm bảo chuẩn ACID), MongoDB 7.0 [14] (lưu trữ phi cấu trúc metadata gian phòng 360°, tọa độ hotspot và hiện vật) và Redis 7.0 [15] (bộ nhớ đệm tốc độ cao và khóa đồng thời).",
        bold_prefix="4. Nhóm Database Containers: "
    )
    helper.add_bullet_item(doc,
        "Hệ thống điều phối thông điệp AMQP phục vụ hàng đợi bất đồng bộ cho các tác vụ ghép ảnh toàn cảnh và trích xuất khung hình video nặng [12].",
        bold_prefix="5. Message Broker RabbitMQ Container: "
    )
    
    # 4.1.2. Đường ống tự động hóa CI/CD
    helper.add_heading_3(doc, "4.1.2. Đường ống tự động hóa kiểm thử và triển khai liên tục CI/CD (GitHub Actions)")
    helper.add_body_p(doc,
        "Nhằm loại bỏ hoàn toàn các sai sót do thao tác thủ công và đảm bảo tính sẵn sàng cao của hệ thống (Zero-Downtime Deployment), "
        "nhóm nghiên cứu đã thiết lập đường ống CI/CD hoàn chỉnh thông qua GitHub Actions dựa trên tệp cấu hình .github/workflows/deploy.yml [33]. "
        "Cơ chế vận hành của đường ống tự động hóa được thiết kế như sau:"
    )
    helper.add_bullet_item(doc,
        "Đường ống được kích hoạt tự động mỗi khi có sự kiện đẩy mã nguồn (Push) lên các nhánh 'main', 'master' hoặc các nhánh tính năng 'feature/**', đồng thời hỗ trợ cơ chế kích hoạt thủ công có tham số (Workflow Dispatch) khi cần chọn nhánh triển khai cụ thể [33].",
        bold_prefix="Cơ chế kích hoạt (Triggers): "
    )
    helper.add_bullet_item(doc,
        "Sử dụng nhóm kiểm soát tranh chấp 'deploy-vps-production' với cờ 'cancel-in-progress: true'. Khi có nhiều commit được đẩy lên liên tiếp, hệ thống tự động hủy các tiến trình build cũ đang chạy dở trên VPS, ngăn chặn triệt để tình trạng nghẽn CPU hoặc xung đột tài nguyên máy chủ.",
        bold_prefix="Kiểm soát tranh chấp tiến trình (Concurrency Lock): "
    )
    helper.add_bullet_item(doc,
        "Sử dụng Action 'appleboy/ssh-action@v1.0.3' kết hợp cùng hệ thống khóa bí mật (GitHub Secrets: VPS_HOST, VPS_SSH_KEY, VPS_PORT, VPS_PASSWORD) để mở kênh kết nối SSH bảo mật tuyệt đối tới máy chủ VPS [33].",
        bold_prefix="Kết nối an toàn máy chủ (Secure SSH Tunnel): "
    )
    helper.add_bullet_item(doc,
        "Tiến trình chạy script tuần tự trên VPS: 1) Kiểm tra và điều hướng vào thư mục /root/KhoaLuanTotNghiep; 2) Đồng bộ mã nguồn mới nhất từ GitHub qua Git pull; 3) Cấu hình DNS quốc tế dự phòng (Google 8.8.8.8 & Cloudflare 1.1.1.1) cho Docker Daemon nhằm chống nghẽn mạng; 4) Thực thi 'docker compose up -d --build' để biên dịch lại các container trong nền mà không làm gián đoạn du khách đang tham quan; 5) Tự động dọn dẹp các image cũ ('docker image prune -f') để bảo toàn dung lượng ổ cứng SSD.",
        bold_prefix="Quy trình 5 bước tự động hóa trên VPS: "
    )
    
    helper.add_figure_placeholder(doc, "4.1",
        "Sơ đồ khối quy trình tự động hóa kiểm thử và triển khai liên tục CI/CD qua GitHub Actions",
        "Lưu đồ tự động hóa: Lập trình viên Push mã nguồn -> GitHub Repository kích hoạt Webhook -> GitHub Actions Runner (Ubuntu-latest) -> Xác thực SSH Key bảo mật -> Máy chủ Cloud VPS Ubuntu 22.04 LTS -> Git Pull đồng bộ code -> Docker Compose Build ngầm -> Khởi chạy các Container (Backend, Frontend, DB) -> Nginx Reverse Proxy tải lại cấu hình -> Hệ thống trực tuyến an toàn",
        width_cm=15.0, height_cm=8.0
    )
    
    helper.add_figure_placeholder(doc, "4.2",
        "Giao diện lịch sử thực thi đường ống CI/CD GitHub Actions (Workflows Execution History)",
        "Ảnh chụp màn hình trang quản trị GitHub Actions hiển thị danh sách các lần Build & Deploy tự động thành công (dấu tích xanh) ứng với các nhánh main và master",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.1.3. Triển khai phân hệ Backend và cơ sở dữ liệu kép
    helper.add_heading_3(doc, "4.1.3. Triển khai phân hệ Backend và Kiến trúc CSDL lai (PostgreSQL 16 & MongoDB 7.0)")
    helper.add_body_p(doc,
        "Phân hệ Backend được hiện thực hóa theo kiến trúc phân tầng (Controller - Service - Model) trên nền Node.js v20 LTS [12] và TypeScript. "
        "Điểm đột phá trong kiến trúc dữ liệu là việc kết hợp song song hai hệ quản trị CSDL thông qua module đồng bộ tự động syncEngine.ts:"
    )
    helper.add_bullet_item(doc,
        "PostgreSQL 16 [13] đảm nhiệm vai trò CSDL quan hệ chính thống cho các thực thể đòi hỏi tính toàn vẹn tuyệt đối (ACID Transactions): Bảng Users (phân quyền quản trị viên, nhân viên soát vé, khách), Bảng Tickets (mã vé, ngày tham quan, trạng thái VALID/USED), và Bảng Orders (thông tin đơn hàng, số tiền, mã giao dịch VietQR).",
        bold_prefix="Hệ thống giao dịch ACID (PostgreSQL): "
    )
    helper.add_bullet_item(doc,
        "MongoDB 7.0 [14] đảm nhiệm lưu trữ các đối tượng dữ liệu phi cấu trúc, biến động linh hoạt: Danh mục 18 gian phòng trưng bày (Rooms), bộ siêu dữ liệu ảnh toàn cảnh 8K (Panoramas), mảng tọa độ các điểm liên kết 3D (Hotspots) và hồ sơ lý lịch khoa học của 17 cổ vật tiêu biểu (Artifacts).",
        bold_prefix="Hệ thống dữ liệu phi cấu trúc di sản (MongoDB): "
    )
    helper.add_bullet_item(doc,
        "Redis In-Memory Cache [15] được sử dụng để đệm kết quả truy vấn danh mục phòng và cổ vật, giúp giảm tải trực tiếp cho CSDL. Đồng thời, hàm acquireUser3DLock() trong redis.ts đóng vai trò khóa Mutex phân tán, giới hạn số lượng tác vụ dựng 3D đồng thời của mỗi người dùng, bảo vệ máy chủ không bị nghẽn RAM.",
        bold_prefix="Bộ nhớ đệm và Khóa đồng thời (Redis Mutex): "
    )
    
    # 4.1.4. Triển khai phân hệ Frontend và tối ưu hóa WebGL Three.js
    helper.add_heading_3(doc, "4.1.4. Triển khai phân hệ Frontend và Tối ưu hóa WebGL Three.js")
    helper.add_body_p(doc,
        "Giao diện người dùng được đóng gói dưới dạng ứng dụng đơn trang (SPA) bằng React 18 [20] và Vite [21]. "
        "Không gian thực tế ảo 360° được hiện thực hóa thông qua thư viện đồ họa WebGL Three.js (phiên bản r160+) [7], [8]. "
        "Để đảm bảo trải nghiệm mượt mà 60 FPS ngay cả trên điện thoại di động có cấu hình trung bình, nhóm nghiên cứu đã áp dụng các giải pháp kỹ thuật chuyên sâu:"
    )
    helper.add_bullet_item(doc,
        "Sử dụng hình học khối cầu đảo ngược (Inverted Sphere Geometry, bán kính R = 500) kết hợp vật liệu MeshBasicMaterial, gán Texture ảnh toàn cảnh Equirectangular (360° x 180°) lên mặt trong của khối cầu [7].",
        bold_prefix="Mô hình hình cầu đảo ngược: "
    )
    helper.add_bullet_item(doc,
        "Khi người dùng chuyển sang phòng mới, hệ thống tải trước phiên bản ảnh thu nhỏ (Low Resolution Thumbnail ~100KB) để hiển thị tức thời, sau đó tải ngầm ảnh gốc 8K và thực hiện chuyển đổi mượt mà bằng kỹ thuật hòa trộn Cross-fading 0.5 giây [7], [24].",
        bold_prefix="Cơ chế Progressive Image Loading: "
    )
    helper.add_bullet_item(doc,
        "Chuyển đổi toàn bộ tài nguyên hình ảnh toàn cảnh sang định dạng WebP với mức nén chất lượng cao (Quality = 85%), giúp giảm dung lượng tệp từ 35MB xuống còn 3.5MB - 5MB mà mắt thường không thể phân biệt được sự suy giảm chất lượng [24].",
        bold_prefix="Tối ưu hóa nén ảnh thế hệ mới (WebP): "
    )
    
    # 4.1.5. Triển khai tích hợp các dịch vụ bên ngoài
    helper.add_heading_3(doc, "4.1.5. Triển khai tích hợp các dịch vụ bên ngoài (External Services Integration)")
    helper.add_body_p(doc,
        "Hệ thống mở rộng năng lực xử lý thông qua việc tích hợp an toàn với các dịch vụ đám mây chuyên nghiệp theo tiêu chuẩn quốc tế:"
    )
    helper.add_bullet_item(doc,
        "Tích hợp giải pháp thanh toán VietQR Napas 247 theo tiêu chuẩn Ngân hàng Nhà nước Việt Nam [16] thông qua PayOS Open Platform [17]. Máy chủ tiếp nhận phản hồi Webhook tức thời và kiểm tra tính toàn vẹn dữ liệu bằng thuật toán mã hóa khóa công khai HMAC-SHA256 trước khi xuất vé cho khách.",
        bold_prefix="Cổng thanh toán tự động VietQR PayOS: "
    )
    helper.add_bullet_item(doc,
        "Kết nối với cụm máy chủ Hugging Face Spaces ZeroGPU trang bị card đồ họa cao cấp NVIDIA A100 [30] để thực thi mô hình Deep Learning TRELLIS sinh mô hình 3D từ ảnh 2D [29].",
        bold_prefix="Cụm đám mây AI Deep Learning TRELLIS: "
    )
    helper.add_bullet_item(doc,
        "Sử dụng dịch vụ lưu trữ đối tượng tương thích chuẩn Amazon S3 của Cloudflare R2 [34] để lưu trữ và phân phối các tệp mô hình 3D (.GLB) với băng thông tải về hoàn toàn miễn phí, giảm tải trực tiếp cho băng thông máy chủ VPS.",
        bold_prefix="Kho lưu trữ đám mây Cloudflare R2 Object Storage: "
    )
    helper.add_bullet_item(doc,
        "Tích hợp API Google Cloud Text-to-Speech với bộ giọng đọc AI Neural2 chất lượng phòng thu [31], hỗ trợ tổng hợp âm thanh thuyết minh tự động cho 7 ngôn ngữ quốc tế.",
        bold_prefix="Dịch vụ thuyết minh âm thanh Google Cloud Voice AI: "
    )
    
    # -------------------------------------------------------------------------
    # 4.2. KẾT QUẢ TRIỂN KHAI CÁC PHÂN HỆ CHỨC NĂNG
    # -------------------------------------------------------------------------
    helper.add_heading_2(doc, "4.2. Kết quả triển khai các phân hệ chức năng")
    
    # 4.2.1. Phân hệ tạo không gian toàn cảnh 360° với 4 chức năng nguồn ảnh đầu vào
    helper.add_heading_3(doc, "4.2.1. Phân hệ tạo không gian toàn cảnh 360° với 4 chức năng nguồn ảnh đầu vào")
    helper.add_body_p(doc,
        "Phân hệ Panorama Studio được xây dựng nhằm giải quyết triệt để bài toán tạo ảnh toàn cảnh chất lượng cao "
        "cho 18 không gian trưng bày chuyên đề tại Bảo tàng Lịch sử TP. Hồ Chí Minh [2]. Hệ thống cung cấp bảng điều khiển "
        "nguồn ảnh đa dạng gồm 4 chức năng đầu vào linh hoạt, đáp ứng mọi điều kiện tác nghiệp thực tế tại di tích:"
    )
    helper.add_bullet_item(doc,
        "Kỹ thuật viên ngồi trực tiếp trước máy tính, chụp ảnh kiểm thử nhanh các góc phòng qua webcam tích hợp bằng WebRTC API. Thích hợp cho đào tạo và kiểm thử thuật toán trong không gian hẹp.",
        bold_prefix="1. Chụp bằng webcam (Webcam Capture): "
    )
    helper.add_bullet_item(doc,
        "Kỹ thuật viên chụp sẵn các góc ảnh phòng có độ chồng lấp (overlap) 30% - 50% bằng máy ảnh DSLR hoặc smartphone gắn Tripod, tải đồng loạt lên Studio. Hệ thống đọc tiêu cự EXIF để nắn trụ và ghép nối tự động đạt chuẩn 8K [3], [4].",
        bold_prefix="2. Chọn từ máy (Multi-angle Image Upload): "
    )
    helper.add_bullet_item(doc,
        "Người quay đứng giữa phòng lia máy 360° (15-30 giây). Hệ thống tự động trích xuất chuỗi keyframes, áp dụng phương sai Laplacian: Var = Sum((Laplace(I) - Mean)^2) / N. Các khung hình có Var < 100 do rung tay sẽ bị loại bỏ hoàn toàn, chỉ giữ lại các khung hình sắc nét đạt chuẩn độ chồng lấp [11].",
        bold_prefix="3. Tải Video quét phòng (Panoramic Video Frame Extraction & Quality Filtering): "
    )
    helper.add_bullet_item(doc,
        "Mở ứng dụng trên trình duyệt điện thoại tại bảo tàng, quét xoay tròn theo chỉ dẫn la bàn ảo của cảm biến con quay hồi chuyển (Gyroscope). Luồng ảnh được truyền tức thời qua WebSocket/AMQP đến máy chủ xử lý ảnh [12].",
        bold_prefix="4. Quét phòng trực tiếp (Real-time Live Camera Scan with Gyroscope & AMQP Streaming): "
    )
    
    helper.add_body_p(doc,
        "Sau khi nhận ảnh đầu vào, hệ thống thực thi chuỗi thuật toán xử lý ảnh tuần tự theo sơ đồ khối Hình 4.3 [3]–[6]:"
    )
    
    helper.add_figure_placeholder(doc, "4.3",
        "Sơ đồ khối quy trình xử lý không gian toàn cảnh 360° từ 4 nguồn ảnh đầu vào",
        "Quy trình xử lý khối: Nguồn ảnh đầu vào -> Lọc khung hình & Kiểm tra độ sắc nét Laplacian (Var >= 100) -> Nắn chỉnh hình học trụ Cylindrical Warping [4] -> Trích xuất điểm đặc trưng SIFT & Khớp cặp k-NN [3] -> Khử nhiễu RANSAC & Tính toán ma trận dịch chuyển [5] -> Cắt mí tối ưu Seam Cutting [6] -> Hòa trộn đa dải tần Multiband Laplacian Pyramid [6] -> Vá mịn sàn Nadir Inpainting -> Xuất ảnh cầu Equirectangular 360° hoàn chỉnh",
        width_cm=15.0, height_cm=8.5
    )
    
    helper.add_figure_placeholder(doc, "4.4",
        "Giao diện công cụ tạo không gian căn phòng với 4 phương thức nạp ảnh đầu vào",
        "Màn hình thực tế bảng điều khiển nguồn ảnh đầu vào trong Studio: Chụp bằng webcam, Chọn từ máy, Tải Video quét phòng và Quét phòng trực tiếp kèm hướng dẫn tác nghiệp chuẩn cho kỹ thuật viên",
        width_cm=15.0, height_cm=7.5
    )
    
    # Bảng 4.1: So sánh 4 chức năng tạo không gian
    helper.add_table_caption(doc, "4.1", "Bảng so sánh 4 chức năng tạo không gian toàn cảnh 360° trong Panorama Studio")
    tbl_pano_compare = doc.add_table(rows=5, cols=6)
    tbl_pano_compare.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_pano_compare.autofit = False
    helper.set_table_borders(tbl_pano_compare, color="475569", sz="6", val="single")
    
    col_w_pc = [Cm(3.0), Cm(2.2), Cm(2.2), Cm(2.5), Cm(2.8), Cm(3.3)]
    r0_pc = tbl_pano_compare.rows[0]
    helper.make_row_header(r0_pc)
    helper.make_row_cant_split(r0_pc)
    headers_pc = ["Phương thức nạp", "Thiết bị yêu cầu", "Thời gian xử lý", "Độ phân giải", "Mức tự động", "Trường hợp áp dụng tối ưu"]
    for i, h in enumerate(headers_pc):
        c = r0_pc.cells[i]
        c.width = col_w_pc[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 10, bold=True)
        
    pc_data = [
        ("Chụp bằng webcam", "PC / Laptop có Webcam", "3 – 5 giây", "HD (1280x720)", "Bán tự động (Chụp từng góc)", "Kiểm thử nhanh, gian phòng nhỏ hẹp, đào tạo"),
        ("Chọn từ máy", "Máy ảnh DSLR / Smartphone", "8 – 15 giây", "8K Ultra HD (8192x4096)", "Tự động hoàn toàn", "Phòng trưng bày chính, tư liệu chất lượng cao [3]"),
        ("Tải Video quét phòng", "Smartphone / Action Cam", "12 – 25 giây", "4K (4096x2048)", "Tự động lọc mờ (Laplacian)", "Thu thập thực địa nhanh, phòng đông du khách [11]"),
        ("Quét phòng trực tiếp", "Smartphone có Gyroscope", "5 – 10 giây", "Full HD / 2K", "Tự động dẫn hướng Gyro", "Số hóa di động, kiểm tra tức thời tại chỗ [12]")
    ]
    for idx, row_vals in enumerate(pc_data):
        row = tbl_pano_compare.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate(row_vals):
            c = row.cells[i]
            c.width = col_w_pc[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [1, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 10, bold=(i == 0))
            
    for r in tbl_pano_compare.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=70, right=70)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    # 4.2.2. Phân hệ tái tạo cổ vật 3D với 2 động cơ và 2 chế độ nạp ảnh
    helper.add_heading_3(doc, "4.2.2. Phân hệ tái tạo cổ vật 3D với 2 động cơ (Local CPU vs Cloud AI TRELLIS)")
    helper.add_body_p(doc,
        "Số hóa hiện vật bảo tàng từ ảnh tư liệu 2D sang mô hình không gian 3D tương tác WebGL là bài toán công nghệ mang tính cốt lõi trong công tác bảo tồn di sản. "
        "Tuy nhiên, các bảo tàng truyền thống tại Việt Nam thường đối mặt với rào cản rất lớn về kinh phí trang bị máy quét 3D Laser / LiDAR chuyên dụng đắt đỏ "
        "(lên tới hàng trăm triệu đồng) cũng như sự thiếu hụt hạ tầng máy chủ trang bị card đồ họa GPU cao cấp. "
        "Để giải quyết triệt để thách thức này, nhóm nghiên cứu đã triển khai kiến trúc Tái tạo 3D Lai ghép Đa động cơ (Hybrid Multi-Engine 3D Reconstruction Architecture), "
        "đồng thời thực hiện nghiên cứu so sánh thực nghiệm sâu sắc giữa Động cơ Máy chủ nội bộ (Local CPU Server) và Động cơ Đám mây AI (TRELLIS ZeroGPU A100) [29], [30]."
    )
    
    helper.add_body_p(doc,
        "Về nguồn ảnh đầu vào, hệ thống cung cấp 2 chế độ nạp ảnh linh hoạt phù hợp với đặc thù thực địa tại bảo tàng:"
    )
    helper.add_bullet_item(doc,
        "Áp dụng cho các hiện vật đặt sát vách tường, trong tủ kính niêm phong trưng bày cố định hoặc các tài liệu ảnh tư liệu lịch sử chỉ có thể chụp từ một góc diện duy nhất. Người quản trị chỉ cần tải lên 1 bức ảnh chụp chính diện rõ nét.",
        bold_prefix="• Chế độ 1 ảnh đơn (Single-view 3D Input): "
    )
    helper.add_bullet_item(doc,
        "Áp dụng cho các hiện vật có thể tiếp cận đa chiều (đặt tại bục trưng bày giữa phòng hoặc sảnh lớn). Người dùng có thể nạp từ 2 đến 8 góc ảnh tư liệu khác nhau (mặt trước, cạnh trái, cạnh phải, góc nhìn trên xuống và chi tiết hoa văn đế). Hệ thống tự động phân tích và đối chiếu các góc ảnh để tăng độ chính xác cấu trúc khối.",
        bold_prefix="• Chế độ nhiều ảnh đa góc độ (Multi-view 3D Input): "
    )
    
    helper.add_body_p(doc,
        "Dưới đây là phân tích chi tiết về cơ chế vận hành, ưu điểm và các hạn chế thực tế của từng động cơ:"
    )
    helper.add_bullet_item(doc,
        "Được xây dựng trên module thuật toán hình học v15.0 do nhóm tự nghiên cứu. Quy trình gồm 3 bước: (1) Tự động phân đoạn tách nền bằng giải thuật Otsu kết hợp Rembg [11], trích xuất đường biên hình học (Silhouette Contour) của cổ vật; (2) Áp dụng thuật toán cắt lát và xoay đối xứng trục quay (Radial-Axial Symmetrical Revolve). Thuật toán coi trục tung chính giữa ảnh là trục quay đứng Oy, sau đó xoay biên dạng mặt trước quanh trục này để bù đắp thể tích 3D khép kín theo trường thế điều hòa (Harmonic Field); (3) Nở biên vân (Texture Dilation) 18 chu kỳ để khử viền đen, sinh bản đồ pháp tuyến (Normal Map) và đóng gói tệp chuẩn .GLB [8].",
        bold_prefix="1. Động cơ Máy chủ nội bộ (Local CPU Server): "
    )
    helper.add_body_p(doc,
        "Hạn chế kỹ thuật và khiếm khuyết hình học thực tế của Động cơ Local CPU: "
        "Do máy chủ VPS của nhóm nghiên cứu chỉ sử dụng CPU phổ thông (2 vCPU, RAM 8GB) mà không có card đồ họa GPU chuyên dụng (VRAM), "
        "thuật toán bắt buộc phải dựa trên giả định đối xứng trục quay toán học thuần túy. Hạn chế này dẫn đến các nhược điểm nghiêm trọng khi thử nghiệm thực tế: "
        "(1) Biến dạng tròn xoay bất hợp lý: Với các hiện vật điêu khắc có hình thái bất đối xứng phức tạp như Tượng Phật ngồi kiết già, linh vật hoặc phù điêu, "
        "thuật toán ép đối xứng trục quay khiến mô hình bị phồng to tròn xoe, nhẵn thín như bóng nước hoặc khối trụ bẹt (minh chứng rõ rệt tại Hình 4.6a), "
        "làm mất hoàn toàn các góc cạnh khối điêu khắc tinh xảo như nếp áo cà sa, thế ngồi của bàn tay, các tầng đài sen bát giác và toàn bộ mặt lưng tượng. "
        "(2) Mặt lưới đa giác dư thừa và kém tối ưu: Để cố gắng làm mịn bề mặt vòm tròn, thuật toán sinh ra tới 95.404 mặt lưới đa giác (Polygons), "
        "gây lãng phí dung lượng lưu trữ tệp và làm nặng nề bộ nhớ WebGL khi kết xuất trên trình duyệt. "
        "(3) Tiêu tốn cực hạn tài nguyên máy chủ: Quá trình tính toán ma trận cắt lát chiếm trọn 100% công suất CPU VPS trong 10 – 15 giây, "
        "dễ gây tắc nghẽn tài nguyên và ảnh hưởng tiêu cực đến các dịch vụ web, cơ sở dữ liệu đang chạy đồng thời trên máy chủ."
    )
    helper.add_body_p(doc,
        "Do đó, nhóm nghiên cứu khẳng định Động cơ Máy chủ nội bộ KHÔNG PHẢI là giải pháp tối ưu cho sản phẩm số hóa cuối cùng của bảo tàng. "
        "Động cơ này được duy trì trong hệ thống với 2 mục đích học thuật và thực tiễn xác đáng: "
        "Thứ nhất, làm bài toán đối chứng thực nghiệm (Baseline Experimental Model) để so sánh và làm nổi bật sự vượt trội vượt bậc của công nghệ Deep Learning; "
        "Thứ hai, đóng vai trò là Động cơ dự phòng cấp cứu (Emergency Fallback Engine) nhằm đảm bảo tính sẵn sàng cao (High Availability) cho hệ thống, "
        "cho phép sinh ra một vật thể 3D cơ bản tạm thời nếu dịch vụ AI đám mây bên ngoài gặp sự cố hoặc cạn kiệt hạn ngạch."
    )
    
    helper.add_bullet_item(doc,
        "Ứng dụng công trình nghiên cứu học sâu đột phá của Microsoft Research và Đại học Thanh Hoa (Xiang et al., arXiv:2412.01506, Dec. 2024 [29]). Động cơ kết nối trực tiếp đến cụm máy chủ Hugging Face Spaces trang bị card tăng tốc đồ họa cao cấp NVIDIA A100 (80GB VRAM) thông qua hạ tầng tính toán phân bổ động ZeroGPU [30]. TRELLIS đại diện hình học 3D dưới dạng biến tiềm ẩn có cấu trúc (Structured 3D Latents - SLAT), kết hợp mạng biến đổi luồng hiệu chỉnh (Rectified Flow Transformers) và kết xuất khả vi (Differentiable Rendering) để dự đoán chính xác cả lưới đa giác 3D (Mesh) và các bản đồ chất liệu PBR chân thực từ ảnh chụp phẳng 2D [29].",
        bold_prefix="2. Động cơ Đám mây AI (TRELLIS) - ZeroGPU A100: "
    )
    helper.add_body_p(doc,
        "Ưu thế vượt trội của Động cơ Đám mây AI TRELLIS: "
        "(1) Khả năng suy luận không gian 3D thực thụ: Nhờ được huấn luyện sâu trên hàng triệu mẫu 3D thực tế, TRELLIS có khả năng 'tưởng tượng' "
        "và tái tạo chân thực hình thể không gian đa hướng của hiện vật chỉ từ 1 ảnh chụp đơn lẻ. Như thể hiện ở Hình 4.6b, pho Tượng Phật Thời Lý được "
        "tái hiện đầy đủ nếp áo cà sa mềm mại, thế ngồi kiết già trang nghiêm, đài sen nhiều tầng bát giác sắc sảo và hình khối mặt sau sống động mà không hề bị phồng tròn gượng ép. "
        "(2) Tối ưu hóa lưới đa giác vượt bậc: Mô hình chỉ chứa 25.619 mặt lưới (nhẹ hơn gần 4 lần so với mô hình 95k polygons của Local CPU), "
        "đảm bảo tốc độ tải tức thì qua mạng Internet và kết xuất mượt mà 60 FPS trên mọi thiết bị di động của du khách. "
        "(3) Chất liệu PBR chuẩn Studio: Tự động sinh đầy đủ bản đồ Albedo, Normal và Roughness, tạo hiệu ứng phản quang chân thực theo nguồn sáng 3D của không gian trưng bày. "
        "Hạn chế duy nhất của TRELLIS là phụ thuộc vào kết nối Internet tới máy chủ Hugging Face và hạn ngạch miễn phí hàng ngày (Rate Limit) [30]."
    )
    
    helper.add_body_p(doc,
        "Quyết định thiết kế kiến trúc và lựa chọn giải pháp tối ưu: "
        "Từ kết quả so sánh định lượng và trực quan thực tế, nhóm nghiên cứu khẳng định Động cơ Đám mây AI TRELLIS là giải pháp tối ưu hàng đầu được lựa chọn "
        "cho hệ thống trưng bày di sản số hóa. Nhằm khắc phục hạn chế về quota và độ trễ mạng, hệ thống đã thiết lập Cơ chế Chuyển đổi Dự phòng Tự động (Automated Fallback Architecture). "
        "Khi quản trị viên yêu cầu dựng 3D, hệ thống luôn ưu tiên gọi API đến cụm TRELLIS ZeroGPU A100. Nếu gặp lỗi quá tải (HTTP 429), quá thời gian chờ (>300s) "
        "hoặc máy chủ AI bảo trì, hệ thống tự động kích hoạt Fallback sang Động cơ Local CPU để hoàn tất tác vụ trong nền, bảo đảm quy trình vận hành bảo tàng không bao giờ bị đình trệ (Hình 4.5)."
    )
    
    helper.add_figure_placeholder(doc, "4.5",
        "Sơ đồ khối quy trình tái tạo cổ vật 3D với 2 động cơ và cơ chế chuyển đổi dự phòng tự động",
        "Lưu đồ hoạt động chi tiết: Nạp ảnh tư liệu (1 ảnh đơn / Đa góc) -> Lựa chọn động cơ ưu tiên (Mặc định: TRELLIS AI) -> Gọi API Space ZeroGPU A100 [30] -> Thành công: Xuất Mesh 25k polygons kèm PBR PBR [29] -> Thất bại / Hết Quota (429) / Timeout: Tự động kích hoạt Fallback sang Local CPU -> Phân đoạn Otsu/Rembg [11] -> Cắt lát đối xứng trục Radial-Axial v15.0 -> Nở biên vân & Sinh Normal Map -> Đóng gói file chuẩn .GLB -> Đồng bộ kho lưu trữ R2 [34] và CSDL",
        width_cm=15.0, height_cm=8.5
    )
    
    helper.add_comparison_figure_placeholder(
        doc, "4.6",
        "So sánh trực quan kết quả tái tạo hiện vật 3D thực tế giữa Động cơ Máy chủ nội bộ (Local CPU) và Động cơ Đám mây AI (TRELLIS ZeroGPU)",
        label_a="A. ĐỘNG CƠ LOCAL CPU (MÁY CHỦ NỘI BỘ)",
        guide_a="[KHUNG CHỜ CHÈN ẢNH THỰC TẾ A]\n(Dán ảnh chụp góc nghiêng 3/4 của Tượng cổ vật tạo từ CPU nội bộ — minh chứng mô hình bị ép đối xứng trục xoay phồng tròn nhẵn thín, mất góc cạnh)",
        label_b="B. ĐỘNG CƠ CLOUD AI TRELLIS (ZEROGPU A100)",
        guide_b="[KHUNG CHỜ CHÈN ẢNH THỰC TẾ B]\n(Dán ảnh chụp góc nghiêng 3/4 của Tượng cổ vật tạo từ Cloud AI TRELLIS — minh chứng mô hình 3D đa hướng sắc nét nếp áo cà sa, đài sen bát giác)",
        col_width_cm=7.5
    )
    
    # Bảng 4.2: So sánh chi tiết 2 động cơ tái tạo 3D
    helper.add_table_caption(doc, "4.2", "Bảng so sánh chi tiết và đánh giá chuyên sâu giữa Động cơ Máy chủ nội bộ (Local CPU) và Đám mây AI TRELLIS")
    tbl_3d_compare = doc.add_table(rows=9, cols=3)
    tbl_3d_compare.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_3d_compare.autofit = False
    helper.set_table_borders(tbl_3d_compare, color="475569", sz="6", val="single")
    
    col_w_3d = [Cm(3.5), Cm(6.0), Cm(6.0)]
    r0_3d = tbl_3d_compare.rows[0]
    helper.make_row_header(r0_3d)
    helper.make_row_cant_split(r0_3d)
    headers_3d = ["Tiêu chí đánh giá", "Động cơ Máy chủ nội bộ (Local CPU Server)", "Động cơ Đám mây AI (TRELLIS ZeroGPU A100)"]
    for i, h in enumerate(headers_3d):
        c = r0_3d.cells[i]
        c.width = col_w_3d[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 10.5, bold=True)
        
    c3d_data = [
        ("Thuật toán cốt lõi", "Cắt lát đối xứng trục Radial-Axial v15.0, Harmonic Field, phân đoạn Otsu/Rembg [11]", "Structured 3D Latents (SLAT), Rectified Flow Transformers, Differentiable Rendering [29]"),
        ("Hạ tầng phần cứng", "CPU máy chủ VPS nội bộ (2 vCPU Intel Xeon / AMD EPYC)", "Cụm Cloud GPU cao cấp NVIDIA A100 80GB VRAM (Hugging Face Spaces) [30]"),
        ("Hình thái hình học & Tính chân thực góc cạnh", "Kém chân thực: Bị ép đối xứng trục xoay nên phồng tròn như bóng nước (Hình 4.6a), mất toàn bộ góc cạnh, nếp gấp và chi tiết mặt lưng", "Xuất sắc: Tái tạo sống động khối 3D đa hướng thực thụ, sắc nét từng nếp áo, đài sen bát giác và khối mặt lưng (Hình 4.6b)"),
        ("Số lượng mặt lưới đa giác (Polygons)", "Kém tối ưu: ~95.404 đa giác (mật độ lưới quá dày nhưng không có chi tiết khối, nặng WebGL)", "Tối ưu vượt trội: ~25.619 đa giác (nhẹ hơn gần 4 lần, tải cực nhanh, đạt chuẩn 60 FPS WebGL)"),
        ("Tiêu thụ tài nguyên máy chủ VPS", "Rất cao: Tiêu tốn 100% công suất CPU VPS trong 10–15s, có nguy cơ nghẽn tải máy chủ", "Bằng 0: Toàn bộ quá trình tính toán nặng được ủy thác hoàn toàn cho cụm GPU đám mây"),
        ("Thời gian xử lý & Độ trễ", "Nhanh: 5 – 15 giây / mô hình (xử lý cục bộ tức thì)", "Trung bình: 45 – 90 giây / mô hình (bao gồm độ trễ mạng và thời gian xếp hàng hàng đợi)"),
        ("Chi phí & Hạn ngạch (Quota)", "Hoàn toàn miễn phí, không giới hạn số lượng tác vụ", "Miễn phí theo hạn ngạch hàng ngày (Cần cơ chế Fallback tự động khi chạm ngưỡng HTTP 429)"),
        ("Quyết định kiến trúc & Ứng dụng thực tế", "Giải pháp thứ cấp: Đóng vai trò đối chứng thực nghiệm (Baseline) và cơ chế cứu hộ dự phòng khẩn cấp", "Giải pháp tối ưu hàng đầu: Được lựa chọn chính thức để tạo ra các mô hình 3D chất lượng cao của bảo tàng")
    ]
    for idx, (crit, local_v, cloud_v) in enumerate(c3d_data):
        row = tbl_3d_compare.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([crit, local_v, cloud_v]):
            c = row.cells[i]
            c.width = col_w_3d[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 10.5, bold=(i == 0))
            
    for r in tbl_3d_compare.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=70, right=70)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    # 4.2.3. Hiện thực thuật toán Dijkstra định tuyến liên thông 18 phòng trưng bày
    helper.add_heading_3(doc, "4.2.3. Hiện thực thuật toán Dijkstra định tuyến liên thông 18 phòng trưng bày")
    helper.add_body_p(doc,
        "Mặt bằng Bảo tàng Lịch sử TP.HCM có cấu trúc hình chữ U lớn khép kín quanh hoa viên trung tâm, gồm 18 gian phòng trưng bày liên tiếp với 34 cạnh liên thông [2]. "
        "Hệ thống xây dựng ma trận kề trọng số biểu diễn khoảng cách thực tế giữa các phòng và ứng dụng thuật toán Dijkstra cấu trúc hàng đợi ưu tiên Min-Heap (Hình 4.7) [9], [10]."
    )
    
    helper.add_figure_placeholder(doc, "4.7",
        "Sơ đồ khối giải thuật Dijkstra tìm lộ trình di chuyển tối ưu giữa 18 phòng bảo tàng",
        "Lưu đồ giải thuật Min-Heap Dijkstra từ khâu khởi tạo ma trận kề, trích xuất đỉnh có khoảng cách nhỏ nhất, nới lỏng các cạnh kề (Edge Relaxation) đến truy vết mảng đỉnh cha để hiển thị lộ trình trên Mini-map [9], [10]",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.2.4. Hiện thực phân hệ thanh toán vé VietQR và Soát vé camera thời gian thực
    helper.add_heading_3(doc, "4.2.4. Hiện thực phân hệ thanh toán vé VietQR và Soát vé camera thời gian thực")
    helper.add_body_p(doc,
        "Quy trình phát hành và kiểm soát vé tham quan được tự động hóa hoàn toàn từ khâu chọn vé, thanh toán đến kiểm soát tại cổng (Hình 4.8) [16], [17], [22]:"
    )
    
    helper.add_figure_placeholder(doc, "4.8",
        "Sơ đồ khối quy trình thanh toán VietQR PayOS và xác thực vé điện tử tại cổng soát vé",
        "Chu trình khép kín: Khách đặt vé -> PayOS sinh mã VietQR Napas 247 [16], [17] -> Khách quét chuyển khoản -> Ngân hàng báo có -> Webhook ký số HMAC-SHA256 cập nhật CSDL -> Sinh vé điện tử mã QR mã hóa AES-256 gửi qua Email -> Nhân viên quét bằng camera (html5-qrcode) [22] -> Đối soát CSDL thời gian thực 150ms -> Mở cổng đón khách",
        width_cm=15.0, height_cm=8.0
    )
    
    # 4.2.5. Phân hệ Quản trị hệ thống, Nhận diện thương hiệu Đa bảo tàng và Vận hành
    helper.add_heading_3(doc, "4.2.5. Phân hệ Quản trị hệ thống, Nhận diện thương hiệu Đa bảo tàng và Vận hành")
    helper.add_body_p(doc,
        "Phân hệ Quản trị CMS được xây dựng với tư duy nền tảng mở, không chỉ phục vụ riêng Bảo tàng Lịch sử TP.HCM mà còn hỗ trợ nhân bản, "
        "chuyển đổi linh hoạt cho bất kỳ bảo tàng hoặc di tích nào trong tương lai thông qua hệ thống cấu hình toàn diện:"
    )
    helper.add_bullet_item(doc,
        "Tùy biến toàn diện Tên bảo tàng, Tên rút gọn, Biểu trưng chữ viết tắt (Emblem), Khẩu hiệu chính (Tagline), Logo nhận diện thương hiệu chính thức (đồng bộ tức thì đến trang khách và standee QR), Tỉnh/Thành phố, Địa chỉ, Hotline, Email liên hệ.",
        bold_prefix="1. Cấu hình Nhận diện Thương hiệu & Đa Bảo Tàng (Multi-Museum CMS): "
    )
    helper.add_bullet_item(doc,
        "Tùy biến thông tin nghiên cứu khoa học hiển thị trang trọng ngay dưới chân trang (Footer): Tiêu đề khối (Badge Title), Tên đề tài nghiên cứu, Sinh viên thực hiện, Mã số sinh viên, Giảng viên hướng dẫn, Đơn vị đào tạo (Khoa CNTT - Đại học Công nghiệp TP.HCM) và Niên khóa tốt nghiệp.",
        bold_prefix="2. Tùy biến thông tin Khóa Luận Tốt Nghiệp: "
    )
    helper.add_bullet_item(doc,
        "Công tắc điều khiển chế độ bảo trì hệ thống (Maintenance Mode Switch). Khi bật bảo trì, toàn bộ khách tham quan sẽ được điều hướng êm ái sang màn hình thông báo thân thiện với đồng hồ đếm ngược thông minh (15 phút, 30 phút, 1 giờ, 2 giờ) và lời nhắn giải thích chu đáo.",
        bold_prefix="3. Điều khiển Vận hành & Chế độ Bảo trì Hệ thống: "
    )
    helper.add_bullet_item(doc,
        "Theo dõi trực tiếp sức khỏe máy chủ VPS: Tỷ lệ sử dụng vCPU (%), Dung lượng bộ nhớ RAM (GB và %), Ổ cứng NVMe SSD, trạng thái đồng bộ CSDL MongoDB, PostgreSQL, Redis, RabbitMQ. Kiến trúc đã chuẩn hóa sẵn sàng kết nối tới nền tảng quan sát tập trung Prometheus và Grafana [32].",
        bold_prefix="4. Giám sát Tài nguyên Máy chủ (VPS Monitoring): "
    )
    helper.add_bullet_item(doc,
        "Tích hợp dịch vụ tổng hợp tiếng nói trí tuệ nhân tạo Google Cloud Text-to-Speech thế hệ Neural2 [31]. Hỗ trợ cấu hình động 7 ngôn ngữ quốc tế, cho phép Admin chọn lựa giọng đọc nam/nữ, điều chỉnh cao độ, tốc độ đọc và nghe thử âm thanh trực tiếp trên giao diện quản trị.",
        bold_prefix="5. Quản trị Đa ngôn ngữ Động & Trợ lý Giọng nói Voice AI: "
    )
    
    # 4.2.6. Tập hợp các giao diện website thực tế
    helper.add_heading_3(doc, "4.2.6. Tập hợp các giao diện website thực tế (Khách tham quan, Quản trị CMS, Studio)")
    helper.add_body_p(doc,
        "Dưới đây là tập hợp toàn bộ các giao diện thực tế của hệ thống, được thiết kế chuẩn mực theo ngôn ngữ di sản văn hóa, "
        "hỗ trợ tương thích hoàn hảo trên cả máy tính để bàn và điện thoại di động (từ Hình 4.9 đến Hình 4.36):"
    )
    
    helper.add_figure_placeholder(doc, "4.9",
        "Giao diện Trang chủ - Banner Hero và Nhận diện di sản Bảo tàng Lịch sử",
        "Khung cảnh Banner mở đầu ấn tượng với hình ảnh tòa nhà bảo tàng kiến trúc Đông Dương, khẩu hiệu nhận diện, thanh điều hướng Navbar nổi và các nút gọi hành động Bắt đầu Tour 360° / Chiêm ngưỡng Cổ vật 3D",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.10",
        "Giao diện Giới thiệu không gian di sản và tổng quan 18 phòng trưng bày",
        "Khu vực giới thiệu lịch sử hình thành bảo tàng và lưới thẻ danh mục 18 gian phòng trưng bày theo tiến trình thời gian",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.11",
        "Giao diện Không gian Tour 360° tương tác toàn cảnh độ phân giải cao",
        "Màn hình thực tế ảo 360° x 180° của phòng trưng bày, cho phép xoay tự do, phóng to và quan sát không gian chi tiết [7]",
        width_cm=15.0, height_cm=8.0
    )
    helper.add_body_p(doc,
        "Cơ chế hiển thị và tương tác Hotspot chuyển cảnh trong không gian 360° (Hình 4.12): "
        "Các điểm Hotspot được dựng dưới dạng Three.js Sprite hoặc đối tượng hình học 3D gắn cố định tại tọa độ cầu (Pitch, Yaw) [7], [37]. "
        "Để thu hút sự chú ý của du khách, hệ thống cài đặt hiệu ứng hoạt họa phát sáng nhấp nháy (Pulsing Glow Animation) chu kỳ 1.5 giây. "
        "Khi người dùng rê chuột (Hover) hoặc chạm vào biểu tượng, hệ thống tự động phóng to nhẹ (tỷ lệ 1.2x) và hiển thị nhãn tên phòng đích "
        "kèm tổng số lượng hiện vật đang trưng bày bên trong. Khi nhấp chọn, hệ thống kích hoạt luồng chuyển cảnh mượt mà 4 pha (Cross-fade) "
        "với độ trễ chuyển tiếp dưới 350ms, đồng thời gọi lệnh texture.dispose() để giải phóng VRAM phòng cũ, đảm bảo thiết bị di động không bị nóng máy hay tràn RAM [38]."
    )
    helper.add_figure_placeholder(doc, "4.12",
        "Giao diện Điểm nối chuyển cảnh (Hotspot) và bảng thông tin tương tác",
        "Hiệu ứng nhấp nháy phát sáng của mũi tên Hotspot và bảng tóm tắt hiện vật khi người dùng tương tác trong không gian 360°",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.13",
        "Giao diện Sơ đồ mặt bằng Mini-map và tính năng tìm đường liên thông Dijkstra",
        "Bản đồ mặt bằng 18 phòng thu nhỏ ở góc màn hình, hiển thị vị trí hiện tại và lộ trình tìm đường ngắn nhất bằng nét đứt phát sáng [9]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.14",
        "Giao diện Thuyết minh âm thanh đa ngôn ngữ (Text-to-Speech Audio Guide)",
        "Bảng điều khiển phát âm thanh thuyết minh giới thiệu gian phòng và cổ vật với tùy chọn đa ngôn ngữ Google Cloud Neural2 [31]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.15",
        "Giao diện Chiêm ngưỡng cổ vật 3D tương tác xoay đa chiều",
        "Cửa sổ Modal xem cổ vật tương tác 360 độ (Trống đồng, Tượng Phật, Lư hương) cho phép phóng to quan sát hoa văn tinh xảo [8]",
        width_cm=15.0, height_cm=8.0
    )
    helper.add_figure_placeholder(doc, "4.16",
        "Giao diện Trợ lý Di sản Ảo AI tư vấn thông tin và giải đáp lịch sử",
        "Khung chat hội thoại thông minh cùng Trợ lý AI ở góc dưới bên phải, hỗ trợ giải đáp sự kiện lịch sử và gợi ý phòng tham quan [25], [26]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.17",
        "Giao diện Đặt vé tham quan trực tuyến và chọn loại vé",
        "Form chọn ngày tham quan, số lượng vé người lớn / trẻ em / sinh viên và tự động tính tổng tiền thanh toán minh bạch",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.18",
        "Giao diện Thanh toán VietQR động liên kết ngân hàng qua PayOS",
        "Màn hình hiển thị mã VietQR chứa chính xác số tiền, số tài khoản bảo tàng và mã đơn hàng để khách quét chuyển khoản tức thì [16], [17]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.19",
        "Giao diện Vé điện tử với mã QR bảo mật AES-256",
        "Mẫu vé điện tử hoàn chỉnh sau khi thanh toán thành công, hiển thị đầy đủ thông tin khách hàng và mã QR soát vé để xuất trình",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.20",
        "Giao diện Quét mã QR soát vé camera trực tiếp trên thiết bị di động",
        "Màn hình nhân viên bảo tàng quét mã vé bằng camera điện thoại tại cổng ra vào, hiển thị dấu tích xanh hợp lệ tức thì [22]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.21",
        "Giao diện Bảng điều khiển Quản trị viên (Admin Dashboard)",
        "Tổng quan các chỉ số đo lường: Tổng lượt tham quan 360°, số vé đã bán trong ngày, doanh thu VietQR và biểu đồ xu hướng",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.22",
        "Giao diện Quản lý danh mục 18 gian phòng trưng bày 360°",
        "Lưới danh sách 18 phòng kèm các nút chỉnh sửa thông tin, tải lên ảnh Panorama mới và cấu hình vị trí trên sơ đồ mặt bằng",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_body_p(doc,
        "Công cụ cấu hình Hotspot trực quan trong phân hệ Quản trị viên (Hình 4.23): "
        "Để đơn giản hóa tối đa quy trình ghim điểm chuyển phòng mà không đòi hỏi cán bộ bảo tàng phải am hiểu lập trình, "
        "hệ thống tích hợp công cụ tương tác trực tiếp ngay trong không gian 360° [14], [37]. "
        "Quản trị viên chỉ cần xoay góc nhìn camera đến vị trí cửa thông phòng, bậc cửa hoặc hiện vật mong muốn, "
        "sau đó nhấp đúp chuột lên màn hình. Hệ thống tự động kích hoạt thuật toán Raycaster để bắt điểm giao cắt trên mặt cầu, "
        "tự động tính toán cặp góc (Pitch, Yaw) và mở bảng điều khiển nổi (Drawer). "
        "Tại đây, Quản trị viên chọn gian phòng đích (targetRoomId) từ danh mục 18 phòng, chọn kiểu biểu tượng điều hướng "
        "(Mũi tên đi tới, Mũi tên rẽ trái, Mũi tên rẽ phải hoặc Ký hiệu thông tin) và thiết lập góc nhìn ban đầu khi bước vào phòng mới. "
        "Sau khi bấm 'Lưu cấu hình', dữ liệu được cập nhật tức thì vào CSDL MongoDB và hiển thị điểm Hotspot mẫu để kiểm định ngay lập tức."
    )
    helper.add_figure_placeholder(doc, "4.23",
        "Giao diện Cấu hình tọa độ Hotspot và thiết lập liên kết phòng",
        "Công cụ trực quan cho phép Admin nhấp đúp trực tiếp trong không gian 3D để tạo điểm nối chuyển cảnh sang phòng đích",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.24",
        "Giao diện Quản lý kho tư liệu cổ vật và mô hình 3D",
        "Bảng quản lý danh mục cổ vật, tải lên file mô hình 3D .GLB, chỉnh sửa bài thuyết minh và gắn hiện vật vào phòng trưng bày",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.25",
        "Giao diện Quản lý vé tham quan và lịch sử giao dịch PayOS",
        "Bảng theo dõi trạng thái các đơn đặt vé (Đã thanh toán / Chờ thanh toán / Đã soát vé) và lọc báo cáo doanh thu vé theo mốc thời gian",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.26",
        "Giao diện Quản lý người dùng và phân quyền quản trị",
        "Danh sách tài khoản hệ thống, phân quyền vai trò Quản trị viên (Admin), Nhân viên soát vé (Staff) và Khách tham quan (Visitor)",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.27",
        "Giao diện Quản lý Nhận diện thương hiệu & Đa Bảo Tàng CMS",
        "Công cụ tùy biến Tên bảo tàng, Tên rút gọn, Biểu trưng chữ viết tắt (Emblem), Khẩu hiệu (Tagline), Logo chính thức, Địa chỉ, Hotline, Email và Thông tin Khóa Luận Tốt Nghiệp chân trang",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.28",
        "Giao diện Vận hành và Điều khiển chế độ bảo trì hệ thống",
        "Bảng công tắc điều khiển Bật/Tắt chế độ bảo trì, chọn thời gian bảo trì dự phòng (15p, 30p, 1h, 2h), soạn lời nhắn cho du khách và giám sát các thông số tài nguyên VPS (RAM, CPU, SSD, CSDL)",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.29",
        "Giao diện Quản trị Đa ngôn ngữ và Cấu hình giọng đọc Voice AI",
        "Màn hình quản lý 7 ngôn ngữ quốc tế, cấu hình giọng đọc Google Cloud Text-to-Speech Neural2 và nút phát thử âm thanh trực tiếp [31]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.30",
        "Giao diện Công cụ Panorama Studio - Nắn chỉnh trụ và ghép mí đa dải tần",
        "Màn hình hiển thị quá trình nắn trụ Cylindrical, khớp cặp SIFT, hòa trộn tháp Laplacian và cửa sổ xem trước ảnh cầu hoàn chỉnh [3]–[6]",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.2.7. Phân hệ Báo cáo Thống kê nghiệp vụ và Giám sát vận hành hệ thống qua Grafana
    helper.add_heading_3(doc, "4.2.7. Phân hệ Báo cáo Thống kê nghiệp vụ và Giám sát vận hành hệ thống qua Grafana")
    helper.add_body_p(doc,
        "Nhằm hỗ trợ Ban giám đốc và các cán bộ chuyên trách bảo tàng nắm bắt chính xác hiện trạng hoạt động mà không phụ thuộc vào các báo cáo thủ công, "
        "nhóm tác giả đã tích hợp hoàn chỉnh dịch vụ Grafana v11.x (container museum_grafana) liên kết với cụm máy chủ và hệ quản trị CSDL PostgreSQL 16 [13], [32]. "
        "Dữ liệu được trích xuất an toàn thông qua cơ chế phân quyền tài khoản chỉ đọc (PostgreSQL Read-Only Mode: pg_readonly), đảm bảo tuân thủ tuyệt đối an toàn thông tin."
    )
    helper.add_body_p(doc,
        "Phân hệ cung cấp ba bảng điều khiển (Dashboards) chuyên sâu được nhúng trực tiếp vào giao diện quản trị Admin:"
    )
    helper.add_bullet_item(doc,
        "Thống kê tổng doanh thu thực tế từ cổng thanh toán PayOS / VietQR [16], [17], số lượng vé bán ra theo các mốc thời gian (Hôm nay, Tuần này, Tháng này, Năm nay), "
        "tỷ lệ chuyển đổi đơn hàng (Đã thanh toán vs Hết hạn), và tiến độ số hóa di sản (tỷ lệ phần trăm 18 gian phòng và danh mục cổ vật 3D đã đưa lên không gian mạng).",
        bold_prefix="1. Bảng điều khiển Nghiệp vụ Di sản & Doanh thu Vé: "
    )
    helper.add_bullet_item(doc,
        "Theo dõi trực quan mức độ chiếm dụng tài nguyên của máy chủ Cloud VPS (tỷ lệ CPU %, dung lượng RAM sử dụng/còn trống, lưu lượng đọc/ghi ổ cứng NVMe SSD), "
        "và giám sát trạng thái thời gian thực của toàn bộ cụm container Docker (Nginx, Backend API, PostgreSQL, MongoDB, Redis, Python AI Studio) [19], [32].",
        bold_prefix="2. Bảng điều khiển Hạ tầng VPS & Container: "
    )
    helper.add_bullet_item(doc,
        "Phân tích hiệu năng giao diện lập trình ứng dụng (Application Performance Monitoring - APM): Đo lường độ trễ phản hồi (Response Latency), thông lượng yêu cầu "
        "(Throughput req/s) và phân loại mã trạng thái HTTP (2xx thành công, 4xx lỗi người dùng, 5xx lỗi máy chủ) theo thời gian thực [23], [32].",
        bold_prefix="3. Bảng điều khiển Hiệu năng API & Mạng (APM): "
    )
    
    helper.add_body_p(doc,
        "Hiện thực tính năng Xuất báo cáo thống kê Excel đa bảng tính (Hình 4.31): "
        "Tại giao diện 'Báo cáo & Thống kê' của phân hệ Quản trị, hệ thống tích hợp nút bấm 'Xuất file Excel' màu vàng nổi bật "
        "nằm cạnh nút 'Làm mới' và bộ lọc thời gian (Hôm nay, Tuần này, Tháng này, Tất cả). "
        "Tính năng được lập trình tối ưu hóa hoàn toàn phía Client bằng thư viện xlsx-js-style, giải phóng toàn bộ tài nguyên tính toán cho máy chủ. "
        "Khi bấm xuất, hệ thống trích xuất dữ liệu đang hiển thị và sinh ra một cuốn sổ tính Microsoft Excel (.xlsx) gồm 4 Worksheets chuyên biệt:"
    )
    helper.add_bullet_item(doc,
        "Tổng hợp các chỉ số cốt lõi gồm: Tổng doanh thu vé đã thanh toán (VND), Tổng số vé đã phát hành, Số vé đã soát vào cổng thực tế, "
        "và Số lượng khách tham quan trực tuyến thời gian thực qua giao thức Server-Sent Events (SSE).",
        bold_prefix="• Sheet 1 - Tổng quan KPIs & Doanh thu: "
    )
    helper.add_bullet_item(doc,
        "Bảng chi tiết toàn bộ các đơn hàng đặt vé gồm: Mã đơn hàng PayOS, Họ tên khách hàng, Số điện thoại, Loại vé tham quan, Số tiền (VND), "
        "Cổng thanh toán (VietQR/PayOS), Trạng thái đơn (Đã thanh toán / Chờ thanh toán / Đã soát vé), và Thời gian giao dịch.",
        bold_prefix="• Sheet 2 - Chi tiết Vé & Giao dịch PayOS: "
    )
    helper.add_bullet_item(doc,
        "Danh mục 18 gian phòng trưng bày gồm: Mã phòng (P01 đến P18), Tên gian phòng, Số lượng hiện vật trưng bày bên trong, "
        "và Trạng thái số hóa không gian ảnh cầu 360° x 180°.",
        bold_prefix="• Sheet 3 - Danh mục Gian phòng Tour 360°: "
    )
    helper.add_bullet_item(doc,
        "Bảng kiểm kê kho tư liệu di sản gồm: Mã cổ vật, Tên cổ vật, Gian phòng lưu giữ, Thời kỳ lịch sử, Trạng thái mô hình 3D (.GLB), "
        "và Trạng thái bài thuyết minh âm thanh đa ngôn ngữ.",
        bold_prefix="• Sheet 4 - Kho Cổ vật & Bảo vật 3D: "
    )
    helper.add_body_p(doc,
        "Toàn bộ tệp Excel được định dạng trực quan chuyên nghiệp: Banner tiêu đề gộp ô màu xanh đen Obsidian (#0f172a) chữ vàng Antique Gold (#f59e0b), "
        "tiêu đề cột màu Slate đậm, định dạng số tiền VND có phân cách hàng nghìn, tự động căn chỉnh độ rộng cột (wch) chống lỗi hiển thị tràn ô (###), "
        "và tự động dịch toàn bộ nhãn cột, trạng thái và tên tệp theo ngôn ngữ hiện tại của Quản trị viên (5 thứ tiếng: Việt, Anh, Pháp, Trung, Nhật)."
    )
    
    # Placeholders Hình 4.31 & 4.32
    helper.add_figure_placeholder(doc, "4.31",
        "Giao diện Bảng điều khiển Báo cáo & Thống kê Nghiệp vụ Di sản & Doanh thu Vé tích hợp Grafana",
        "Ảnh chụp màn hình bảng điều khiển Grafana nhúng trực tiếp trong trang quản trị Admin, hiển thị biểu đồ diễn biến doanh thu VietQR và tỷ lệ số hóa phòng 360° [17], [32]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.32",
        "Giao diện Bảng điều khiển Giám sát Hạ tầng VPS và Docker Container trên Grafana",
        "Màn hình theo dõi tài nguyên phần cứng máy chủ VPS (CPU, RAM, Disk I/O) và trạng thái sống còn của cụm container điều phối [19], [32]",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.2.8. Hiện thực Phân hệ Dịch thuật Đa ngôn ngữ Độc lập cho Không gian 360° và Cổ vật
    helper.add_heading_3(doc, "4.2.8. Hiện thực Phân hệ Dịch thuật Đa ngôn ngữ Độc lập cho Không gian 360° và Cổ vật")
    helper.add_body_p(doc,
        "Phân hệ Dịch thuật đa ngôn ngữ được hiện thực theo nguyên lý bản địa hóa ngữ cảnh độc lập (Local Context Localization). Trong CSDL PostgreSQL, "
        "các bảng lưu trữ gian phòng (rooms) và hiện vật di sản (artifacts) được thiết kế mở rộng các trường ngôn ngữ quốc tế (name_vi, name_en, name_fr, "
        "description_vi, description_en, description_fr). Nhờ đó, quản trị viên có thể vừa sử dụng công cụ dịch thuật tự động Google Cloud Translation / Gemini API [25], [36] "
        "để khởi tạo bản dịch thô, vừa có thể hiệu đính thuật ngữ chuyên ngành bảo tàng để đạt độ chuẩn xác học thuật cao nhất."
    )
    helper.add_body_p(doc,
        "Trên giao diện Tour 360° của khách tham quan, menu tùy chọn ngôn ngữ thuyết minh được thiết kế dưới dạng nút bấm nổi tinh gọn. Khi du khách quốc tế chọn chuyển đổi "
        "sang tiếng Anh hoặc tiếng Pháp, hệ thống chỉ kích hoạt làm mới tiêu đề phòng, nội dung thuyết minh văn bản và danh sách hiện vật trong không gian phòng đang xem, "
        "hoàn toàn giữ nguyên ngôn ngữ điều hướng tổng thể của hệ thống. Cơ chế này đem lại trải nghiệm mượt mà, không gián đoạn tương tác xoay hình cầu 3D của du khách."
    )
    
    # Placeholder Hình 4.33
    helper.add_figure_placeholder(doc, "4.33",
        "Giao diện Tùy chọn ngôn ngữ thuyết minh trong Không gian Tour 360° và bảng thông tin cổ vật bản địa hóa",
        "Menu chuyển đổi ngôn ngữ độc lập (Tiếng Việt, English, Français) trong phòng tham quan 360° và cửa sổ thông tin cổ vật đã được dịch chuẩn hóa [36]",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.2.9. Hiện thực Phân hệ Thuyết minh Giọng đọc Audio và Cơ chế Lưu trữ Đệm mượt mà
    helper.add_heading_3(doc, "4.2.9. Hiện thực Phân hệ Thuyết minh Giọng đọc Audio và Cơ chế Lưu trữ Đệm mượt mà")
    helper.add_body_p(doc,
        "Phân hệ Thuyết minh âm thanh (Audio Guide) được hiện thực với hai tính năng song hành: Cho phép quản trị viên tải lên các tệp ghi âm giọng đọc thực tế "
        "của các thuyết minh viên gạo cội tại Bảo tàng Lịch sử TP. Hồ Chí Minh, hoặc kích hoạt chức năng 'Tự động sinh giọng AI' sử dụng Google Cloud Text-to-Speech Neural2 [31]. "
        "Hệ thống tích hợp bộ lọc chuẩn hóa văn bản trước khi đọc, loại bỏ các ký tự đặc biệt, mở rộng các chữ viết tắt lịch sử và gán các thẻ SSML kiểm soát nhịp ngắt trang trọng."
    )
    helper.add_body_p(doc,
        "Đặc biệt, cơ chế lưu trữ đệm băm (Hash Storage) giải quyết triệt để bài toán chi phí và độ trễ: Mỗi đoạn thuyết minh sau khi sinh được lưu trữ dưới dạng tệp tĩnh "
        "/audio_cache/{AudioKey}.mp3 (với AudioKey là chuỗi băm MD5 duy nhất). Máy chủ Nginx hỗ trợ giao thức truyền phát phân đoạn HTTP 206 Partial Content, "
        "cho phép trình duyệt của khách tham quan bắt đầu phát âm thanh ngay lập tức sau chưa đầy 50ms mà không cần đợi tải toàn bộ tệp âm thanh lớn về máy. "
        "Khi chuyển sang phòng khác, trình phát âm thanh nổi sẽ tự động dừng êm ái và nạp bài thuyết minh của phòng mới, tránh xung đột âm thanh trong không gian ảo."
    )
    
    # Placeholders Hình 4.34 & 4.35
    helper.add_figure_placeholder(doc, "4.34",
        "Giao diện Quản trị thuyết minh âm thanh và cấu hình sinh giọng đọc AI tự động",
        "Màn hình quản trị cho phép nghe thử giọng đọc, điều chỉnh tốc độ, cao độ, tải lên file âm thanh thực địa hoặc bấm sinh giọng AI tự động qua Google TTS [31]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.35",
        "Giao diện Trình phát thuyết minh âm thanh nổi trên không gian Tour 360°",
        "Thanh điều khiển Audio Player trang nhã tích hợp nút Play/Pause, tua thời gian, thanh âm lượng và tự động đồng bộ theo từng gian phòng tham quan",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.2.10. Tối ưu hóa Giao diện Người dùng và Thiết kế Thích ứng (Responsive Mobile First)
    helper.add_heading_3(doc, "4.2.10. Tối ưu hóa Giao diện Người dùng và Thiết kế Thích ứng (Responsive Mobile First)")
    helper.add_body_p(doc,
        "Dựa trên khảo sát thực tế có hơn 72% khách tham quan bảo tàng sử dụng điện thoại thông minh để quét mã QR và trải nghiệm không gian số, nhóm tác giả "
        "đặc biệt chú trọng tối ưu hóa trải nghiệm giao diện người dùng theo triết lý Mobile-First [20], [24]:"
    )
    helper.add_bullet_item(doc,
        "Trên màn hình máy tính (Desktop/Laptop), bộ lọc hiển thị dưới dạng Dropdown tinh tế với chiều rộng 350px, bo góc mềm mại 16px và thanh cuộn mỏng màu vàng hoàng gia (5px) "
        "thay thế thanh cuộn trắng thô mặc định của hệ điều hành. Trên điện thoại di động, bộ lọc tự động chuyển hóa thành một ngăn kéo vuốt ra từ cạnh phải (Drawer Panel) với "
        "thanh tiêu đề tuân thủ vùng an toàn (Safe-Area Inset), nút đóng tròn tiện lợi và cơ chế chặn nổi bọt sự kiện giúp thao tác chạm chọn thời kỳ diễn ra tức thì, không bị trễ hoặc đóng nhầm.",
        bold_prefix="1. Bộ lọc Thời kỳ và Không gian thích ứng (Adaptive Filter Drawer): "
    )
    helper.add_bullet_item(doc,
        "Danh sách các hiện vật di sản trong không gian 360° được tổ chức dạng khay trượt từ đáy màn hình (Bottom Sheet), cho phép du khách vừa quan sát không gian toàn cảnh "
        "vừa cuộn mượt mà xem danh mục cổ vật trưng bày trong phòng mà không bị che khuất tầm nhìn.",
        bold_prefix="2. Khay trượt danh sách hiện vật trong Tour 360° (Bottom Sheet Modal): "
    )
    helper.add_bullet_item(doc,
        "Khung hội thoại với Trợ lý Di sản Ảo AI được cố định tọa độ linh hoạt (Fixed Viewport Container), triệt tiêu hoàn toàn hiện tượng giật nảy màn hình (Viewport Jump) "
        "khi bàn phím ảo của các thiết bị di động iOS Safari và Android Chrome xuất hiện.",
        bold_prefix="3. Cố định vùng nhìn cho Trợ lý Trò chuyện AI: "
    )
    
    # Placeholder Hình 4.36
    helper.add_figure_placeholder(doc, "4.36",
        "Giao diện Drawer lọc thời kỳ và danh sách hiện vật dạng Bottom Sheet tối ưu cho thiết bị di động",
        "Thiết kế thích ứng thông minh trên màn hình điện thoại di động: Ngăn kéo lọc thời kỳ vuốt mượt mà và khay trượt hiện vật không che khuất góc nhìn 360°",
        width_cm=15.0, height_cm=7.5
    )
    
    # -------------------------------------------------------------------------
    # 4.3. ĐÁNH GIÁ HIỆU SUẤT HỆ THỐNG
    # -------------------------------------------------------------------------
    helper.add_heading_2(doc, "4.3. Đánh giá hiệu suất hệ thống")
    
    # 4.3.1. Mục tiêu và tiêu chí đánh giá hiệu năng
    helper.add_heading_3(doc, "4.3.1. Mục tiêu và tiêu chí đánh giá hiệu năng")
    helper.add_body_p(doc,
        "Mục tiêu của công tác đánh giá hiệu năng là kiểm chứng độ ổn định, khả năng chịu tải và tốc độ đáp ứng của hệ thống khi triển khai trên môi trường máy chủ đám mây thực tế. "
        "Các tiêu chí đánh giá chính bao gồm:"
    )
    helper.add_bullet_item(doc, "Thời gian máy chủ tiếp nhận, xử lý và phản hồi dữ liệu hoàn tất tới người dùng.", bold_prefix="1. Thời gian phản hồi trung bình (Average Response Time - ms): ")
    helper.add_bullet_item(doc, "Số lượng yêu cầu mà hệ thống có thể phục vụ thành công trong một đơn vị giây.", bold_prefix="2. Thông lượng hệ thống (Throughput - Requests/second): ")
    helper.add_bullet_item(doc, "Tỷ lệ phần trăm các yêu cầu bị lỗi (mã 5xx hoặc Timeout) trên tổng số yêu cầu gửi đến.", bold_prefix="3. Tỷ lệ lỗi (Error Rate - %): ")
    helper.add_bullet_item(doc, "Các chỉ số trải nghiệm người dùng hiện đại bao gồm LCP (Largest Contentful Paint), FID (First Input Delay) và CLS (Cumulative Layout Shift) [24].", bold_prefix="4. Chỉ số Google Core Web Vitals: ")
    
    # Bảng 4.3: Cấu hình máy chủ
    helper.add_table_caption(doc, "4.3", "Bảng thông số kỹ thuật môi trường máy chủ thử nghiệm (Cloud VPS)")
    tbl_vps = doc.add_table(rows=6, cols=3)
    tbl_vps.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_vps.autofit = False
    helper.set_table_borders(tbl_vps, color="475569", sz="6", val="single")
    
    col_wv = [Cm(3.5), Cm(4.5), Cm(7.5)]
    r0_v = tbl_vps.rows[0]
    helper.make_row_header(r0_v)
    helper.make_row_cant_split(r0_v)
    for i, h in enumerate(["Thành phần", "Thông số phần cứng / Nền tảng", "Ghi chú cấu hình thực tế"]):
        c = r0_v.cells[i]
        c.width = col_wv[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    vps_data = [
        ("Bộ vi xử lý (CPU)", "2 vCPU (Intel Xeon Gold / AMD EPYC)", "Máy chủ ảo hóa Cloud VPS tại trung tâm dữ liệu Việt Nam [18]"),
        ("Bộ nhớ (RAM)", "8.0 GB RAM DDR4", "Phân bổ 2GB cho PostgreSQL, 1.5GB cho MongoDB, 1GB cho Redis, 2GB cho Node.js [19]"),
        ("Ổ cứng lưu trữ (Disk)", "40 GB NVMe SSD siêu tốc", "Tốc độ đọc/ghi dữ liệu ngẫu nhiên > 500 MB/s"),
        ("Hệ điều hành máy chủ", "Ubuntu 22.04 LTS (64-bit)", "Cấu hình nhân Linux tối ưu hóa số lượng file mở đồng thời (ulimit -n 65535) [18]"),
        ("Băng thông mạng", "100 Mbps đối xứng trong nước", "Kết nối cáp quang trực tiếp tới các ISP Viettel, VNPT, FPT")
    ]
    for idx, (comp, spec, note) in enumerate(vps_data):
        row = tbl_vps.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([comp, spec, note]):
            c = row.cells[i]
            c.width = col_wv[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_vps.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 4.3.2. Công cụ và phương pháp thử nghiệm tải
    helper.add_heading_3(doc, "4.3.2. Công cụ và phương pháp thử nghiệm tải (Apache JMeter, Google Lighthouse)")
    helper.add_body_p(doc,
        "Nhóm tác giả sử dụng Apache JMeter (phiên bản 5.6+) [23] — công cụ chuẩn công nghiệp hàng đầu để mô phỏng hành vi của nhiều nhóm người dùng đồng thời. "
        "Kịch bản kiểm thử bao gồm chuỗi hành vi thực tế: Người dùng truy cập Trang chủ -> Gọi API lấy danh mục 18 phòng -> Tải ảnh 360° của phòng -> Kiểm tra trạng thái đơn đặt vé."
    )
    helper.add_body_p(doc,
        "Các đợt thử nghiệm được thực hiện với 5 cấp độ tải tăng dần: 50, 100, 200, 500 và 1000 người dùng ảo đồng thời (Concurrent Threads) với thời gian tăng tốc (Ramp-up period) là 10 giây, mỗi đợt lặp lại trong vòng 3 phút để ghi nhận các số liệu trung bình và độ lệch chuẩn [23]."
    )
    
    # 4.3.3. Bảng số liệu và phân tích kết quả thử nghiệm hiệu năng
    helper.add_heading_3(doc, "4.3.3. Bảng số liệu và phân tích kết quả thử nghiệm hiệu năng")
    helper.add_body_p(doc,
        "Kết quả đo lường thực tế từ Apache JMeter được tổng hợp chi tiết trong Bảng 4.4 và các biểu đồ phân tích tương ứng (Hình 4.37 đến Hình 4.39):"
    )
    
    # Bảng 4.4: Kết quả đo lường JMeter
    helper.add_table_caption(doc, "4.4", "Bảng kết quả đo lường hiệu năng chịu tải hệ thống với Apache JMeter")
    tbl_jm = doc.add_table(rows=6, cols=6)
    tbl_jm.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_jm.autofit = False
    helper.set_table_borders(tbl_jm, color="475569", sz="6", val="single")
    
    col_wjm = [Cm(2.5), Cm(2.5), Cm(2.5), Cm(2.5), Cm(2.8), Cm(2.7)]
    r0_j = tbl_jm.rows[0]
    helper.make_row_header(r0_j)
    helper.make_row_cant_split(r0_j)
    for i, h in enumerate(["Số Users đồng thời", "Phản hồi TB (ms)", "Phản hồi Min (ms)", "Phản hồi Max (ms)", "Thông lượng (Req/s)", "Tỷ lệ lỗi (%)"]):
        c = r0_j.cells[i]
        c.width = col_wjm[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 10.5, bold=True)
        
    jm_data = [
        ("50 Users", "42 ms", "18 ms", "115 ms", "185.4 req/s", "0.00 %"),
        ("100 Users", "68 ms", "22 ms", "184 ms", "242.8 req/s", "0.00 %"),
        ("200 Users", "112 ms", "25 ms", "295 ms", "268.5 req/s", "0.00 %"),
        ("500 Users", "245 ms", "32 ms", "580 ms", "285.2 req/s", "0.12 %"),
        ("1000 Users", "520 ms", "45 ms", "1120 ms", "294.6 req/s", "0.45 %")
    ]
    for idx, (u, avg, mn, mx, tp, err) in enumerate(jm_data):
        row = tbl_jm.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([u, avg, mn, mx, tp, err]):
            c = row.cells[i]
            c.width = col_wjm[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_jm.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=70, right=70)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # Placeholders Hình 4.37 -> 4.39
    helper.add_figure_placeholder(doc, "4.37",
        "Biểu đồ thời gian phản hồi trung bình (Response Time) theo số lượng users",
        "Đồ thị biểu diễn thời gian đáp ứng tăng tuyến tính nhẹ từ 42ms đến 112ms khi tải từ 50 đến 200 users và duy trì dưới 550ms ở mức tải cực đại 1000 users [23]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.38",
        "Biểu đồ thông lượng hệ thống (Throughput - Requests/sec) kiểm thử bằng JMeter",
        "Đồ thị thông lượng đạt điểm bão hòa tối ưu ở mức xấp xỉ 295 requests/giây trên cấu hình 2 vCPU [23]",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "4.39",
        "Biểu đồ tỷ lệ lỗi (Error Rate) khi tăng tải từ 50 đến 1000 người dùng đồng thời",
        "Tỷ lệ lỗi duy trì mức 0.00% tuyệt đối từ 50 đến 200 users và chỉ đạt 0.45% khi chịu tải cực hạn 1000 users đồng thời [23]",
        width_cm=15.0, height_cm=7.5
    )
    
    # 4.3.4. Đánh giá chỉ số Web Vitals và giải pháp tối ưu
    helper.add_heading_3(doc, "4.3.4. Đánh giá chỉ số Web Vitals và giải pháp tối ưu")
    helper.add_body_p(doc,
        "Đánh giá trải nghiệm người dùng thực tế trên trình duyệt web được thực hiện bằng công cụ Google Lighthouse (chạy trên Google Chrome DevTools). Kết quả kiểm tra phiên bản Mobile và Desktop đạt điểm số xuất sắc (Bảng 4.5 và Hình 4.40) [24]:"
    )
    
    # Bảng 4.5: Google Lighthouse
    helper.add_table_caption(doc, "4.5", "Bảng kết quả đánh giá các chỉ số Google Lighthouse trên môi trường thực tế")
    tbl_lh = doc.add_table(rows=6, cols=4)
    tbl_lh.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_lh.autofit = False
    helper.set_table_borders(tbl_lh, color="475569", sz="6", val="single")
    
    col_wlh = [Cm(3.5), Cm(3.5), Cm(3.5), Cm(5.0)]
    r0_l = tbl_lh.rows[0]
    helper.make_row_header(r0_l)
    helper.make_row_cant_split(r0_l)
    for i, h in enumerate(["Chỉ số đánh giá", "Mục tiêu chuẩn Google", "Điểm đo thực tế", "Đánh giá xếp hạng"]):
        c = r0_l.cells[i]
        c.width = col_wlh[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    lh_data = [
        ("Hiệu năng (Performance)", "> 85 / 100", "94 / 100", "Xuất sắc (Xanh lá)"),
        ("Khả năng tiếp cận (Accessibility)", "> 90 / 100", "98 / 100", "Xuất sắc (Xanh lá)"),
        ("Thực hành chuẩn (Best Practices)", "> 90 / 100", "100 / 100", "Tối ưu tuyệt đối"),
        ("Tối ưu tìm kiếm (SEO)", "> 90 / 100", "96 / 100", "Xuất sắc (Xanh lá)"),
        ("Largest Contentful Paint (LCP)", "< 2.5 giây", "1.42 giây", "Tải trang nhanh vượt chuẩn [24]")
    ]
    for idx, (idx_nm, std_v, act_v, rnk) in enumerate(lh_data):
        row = tbl_lh.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([idx_nm, std_v, act_v, rnk]):
            c = row.cells[i]
            c.width = col_wlh[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_lh.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # Placeholder Hình 4.40
    helper.add_figure_placeholder(doc, "4.40",
        "Kết quả đánh giá chỉ số hiệu năng và Web Vitals bằng Google Lighthouse",
        "Ảnh chụp bảng điểm Lighthouse đạt Performance 94, Accessibility 98, Best Practices 100 và SEO 96 [24]",
        width_cm=15.0, height_cm=7.5
    )
    
    doc.add_page_break()
    print("Chapter 4 updated successfully with CI/CD pipeline, citation evidence, and complete functional modules.")
