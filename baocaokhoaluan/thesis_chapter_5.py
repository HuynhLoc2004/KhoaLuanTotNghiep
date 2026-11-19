# -*- coding: utf-8 -*-
"""
CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
Báo cáo Khóa luận Tốt nghiệp - IUH
Nội dung:
- 5.1. Đánh giá kết quả và so sánh với các hệ thống hiện hữu:
  + 5.1.1. Đánh giá tổng quan kết quả đạt được của đề tài
  + 5.1.2. Bảng so sánh toàn diện với các hệ thống di sản số trong nước và quốc tế
- 5.2. Kết luận và Hướng phát triển:
  + 5.2.1. Kết luận khoa học và giá trị thực tiễn
  + 5.2.2. Khó khăn và hạn chế gặp phải
  + 5.2.3. Hướng phát triển và mở rộng trong tương lai (WebXR, 3DGS, Visual AI Search, Grafana/Prometheus, Multi-Museum Federation)
"""

from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_5(doc, helper):
    """Xây dựng toàn bộ nội dung Chương 5 theo cấu trúc chuẩn của GVHD và so sánh chuyên sâu."""
    
    # Tiêu đề Chương 5
    p_c5 = helper.add_heading_1(doc, "CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")
    p_c5.alignment = WD_ALIGN_PARAGRAPH.CENTER

    helper.add_body_p(doc, 
        "Trải qua quá trình nghiên cứu lý thuyết, khảo sát thực tế và triển khai công nghệ nghiêm túc trong suốt thời "
        "gian thực hiện khóa luận tốt nghiệp, nhóm nghiên cứu đã hoàn thành việc xây dựng và đưa vào vận hành thử nghiệm "
        "thành công 'Hệ thống tham quan thực tế ảo 360° và số hóa không gian di sản tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh'. "
        "Chương này tập trung đánh giá toàn diện các kết quả cụ thể đạt được, tiến hành so sánh đối chiếu đa chiều giữa hệ thống đề tài "
        "với các giải pháp bảo tàng số hiện hữu tại Việt Nam và trên thế giới, phân tích thẳng thắn các khó khăn, hạn chế tồn đọng "
        "và vạch ra các định hướng phát triển công nghệ đột phá trong tương lai [1], [2], [28]."
    )

    # -------------------------------------------------------------------------
    # 5.1. ĐÁNH GIÁ KẾT QUẢ VÀ SO SÁNH VỚI CÁC HỆ THỐNG HIỆN HỮU
    # -------------------------------------------------------------------------
    helper.add_heading_2(doc, "5.1. Đánh giá kết quả và so sánh với các hệ thống hiện hữu")

    helper.add_heading_3(doc, "5.1.1. Đánh giá tổng quan kết quả đạt được của đề tài")
    helper.add_body_p(doc, 
        "Đề tài đã hoàn thành xuất sắc toàn bộ các mục tiêu nghiên cứu và yêu cầu kỹ thuật đề ra ban đầu, hiện thực hóa một giải pháp "
        "số hóa di sản hoàn chỉnh, kết hợp nhuần nhuyễn giữa học thuật xử lý ảnh, đồ họa máy tính tương tác, trí tuệ nhân tạo và kỹ thuật phần mềm hiện đại:"
    )

    helper.add_bullet_item(doc,
        "Làm chủ chuỗi thuật toán xử lý ảnh ghép nối toàn cảnh (Panoramic Image Stitching Pipeline): Tự động nắn trụ Cylindrical Warping, phát hiện đặc trưng SIFT, so khớp RANSAC, cắt mí Voronoi Seam Cutting và hòa trộn đa dải tần Multiband Laplacian Pyramid. Nhóm đã tích hợp thành công công cụ Studio tạo không gian với 4 nguồn ảnh đầu vào (Webcam, Ảnh chụp từ máy, Video quét phòng và Quét trực tiếp thời gian thực), giúp công tác số hóa linh hoạt và đạt độ phân giải tối đa lên tới 8K [3], [5], [6].",
        bold_prefix="1. Về giải thuật xử lý ảnh không gian 360°: "
    )
    helper.add_bullet_item(doc,
        "Đột phá với kiến trúc tái tạo 3D lai kết hợp 2 động cơ: Động cơ Máy chủ nội bộ (Local CPU Server) dựa trên thuật toán đối xứng trục xoay Radial-Axial v15.0 giúp xử lý siêu tốc (5-15s), độc lập và không tốn chi phí; kết hợp cùng Động cơ Đám mây AI TRELLIS (Hugging Face ZeroGPU A100) ứng dụng Structured 3D Latents [29] cho phép tái tạo mô hình 3D Mesh và chất liệu PBR chân thực từ 1 ảnh đơn hoặc chuỗi ảnh đa góc độ, đi kèm cơ chế Fallback tự động khi quá tải quota GPU.",
        bold_prefix="2. Về công nghệ tái tạo cổ vật 3D đa động cơ: "
    )
    helper.add_bullet_item(doc,
        "Xây dựng không gian tương tác WebGL Three.js hiệu năng cao: Hiển thị mượt mà 60 FPS trên mọi trình duyệt web máy tính và điện thoại thông minh mà không cần cài đặt thêm phần mềm. Tích hợp giải thuật Dijkstra với cấu trúc hàng đợi ưu tiên Min-Heap trên đồ thị liên thông 18 gian phòng, dẫn hướng trực quan bằng đường phát sáng trên Mini-map và mũi tên Hotspot 3D [7], [9], [10].",
        bold_prefix="3. Về tương tác WebGL và điều hướng thông minh: "
    )
    helper.add_bullet_item(doc,
        "Tự động hóa hoàn toàn chu trình thương mại điện tử di sản: Tích hợp cổng thanh toán VietQR Napas 247 qua PayOS [17], xác thực Webhook bảo mật bằng chữ ký số HMAC-SHA256, tự động sinh vé điện tử mã QR mã hóa AES-256. Phân hệ soát vé bằng camera trình duyệt web qua thư viện html5-qrcode [22] cho phép đối soát vé siêu tốc chỉ trong 150ms tại cổng vào bảo tàng.",
        bold_prefix="4. Về thương mại điện tử và kiểm soát vé thông minh: "
    )
    helper.add_bullet_item(doc,
        "Hệ thống Quản trị CMS Đa Bảo Tàng (Multi-Museum Platform): Cho phép tùy biến toàn diện nhận diện thương hiệu (Logo, Slogan, Tên hiển thị, Tagline, Thông tin liên hệ, Banner), chuyển đổi linh hoạt cho nhiều bảo tàng khác nhau. Tích hợp Trợ lý AI và thuyết minh tự động Google Cloud Text-to-Speech Neural2 [31] hỗ trợ 7 ngôn ngữ quốc tế, cùng bảng điều khiển giám sát sức khỏe máy chủ VPS (CPU, RAM, SSD, CSDL) và chế độ bảo trì hệ thống thông minh.",
        bold_prefix="5. Về nền tảng quản trị mở và thuyết minh Voice AI: "
    )

    helper.add_heading_3(doc, "5.1.2. Bảng so sánh toàn diện với các hệ thống di sản số trong nước và quốc tế")
    helper.add_body_p(doc, 
        "Để khẳng định tính mới, tính ứng dụng thực tiễn và ưu thế cạnh tranh vượt trội của đề tài, nhóm nghiên cứu đã tiến hành phân tích "
        "và đối chiếu chi tiết với 4 hệ thống đại diện tiêu biểu (Bảng 5.1):"
    )
    helper.add_bullet_item(doc, "Hệ thống tham quan 360° của Bảo tàng Lịch sử Quân sự Việt Nam (đại diện cho giải pháp bảo tàng số công lập phổ biến tại Việt Nam hiện nay).", bold_prefix="1. ")
    helper.add_bullet_item(doc, "Hệ thống trưng bày trực tuyến của Bảo tàng Mỹ thuật Việt Nam (đại diện cho số hóa tác phẩm nghệ thuật 2D/3D chuyên đề).", bold_prefix="2. ")
    helper.add_bullet_item(doc, "Nền tảng thương mại Matterport Pro 3D Showcase (giải pháp thương mại độc quyền hàng đầu thế giới của Mỹ).", bold_prefix="3. ")
    helper.add_bullet_item(doc, "Nền tảng không gian ảo Artsteps (nền tảng tạo triển lãm ảo 3D giả lập trên nền Web).", bold_prefix="4. ")

    # Bảng 5.1: So sánh toàn diện
    helper.add_table_caption(doc, "5.1", "Bảng so sánh toàn diện giữa Hệ thống đề tài và các giải pháp số hóa di sản hiện hữu")
    tbl_cmp = doc.add_table(rows=10, cols=6)
    tbl_cmp.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cmp.autofit = False
    helper.set_table_borders(tbl_cmp, color="475569", sz="6", val="single")

    col_w_cmp = [Cm(3.2), Cm(2.8), Cm(2.7), Cm(2.8), Cm(2.4), Cm(2.8)]
    r0_c = tbl_cmp.rows[0]
    helper.make_row_header(r0_c)
    helper.make_row_cant_split(r0_c)
    headers_c = ["Tiêu chí so sánh", "Hệ thống Đề tài (Bảo tàng 360°)", "Bảo tàng Lịch sử Quân sự VN", "Bảo tàng Mỹ thuật 3D", "Matterport Pro 3D (Mỹ)", "Artsteps (Không gian ảo)"]
    for i, h in enumerate(headers_c):
        c = r0_c.cells[i]
        c.width = col_w_cmp[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 9.5, bold=True)

    cmp_data = [
        ("Chi phí đầu tư ban đầu & Bản quyền", "Cực thấp (Nguồn mở, tận dụng camera có sẵn & VPS)", "Trung bình (Thuê dự án trọn gói)", "Trung bình (Dự án phần mềm riêng)", "Rất cao (Mua Camera Pro3 hàng ngàn USD)", "Thấp (Tài khoản Freemium)"),
        ("Tính độc lập & Tự chủ công nghệ", "Tự chủ 100% (Mã nguồn mở, máy chủ nội bộ)", "Phụ thuộc đơn vị thầu triển khai", "Phụ thuộc nhà cung cấp giải pháp", "Khép kín hoàn toàn (Độc quyền Matterport Cloud)", "Phụ thuộc nền tảng đám mây Artsteps"),
        ("Tái tạo cổ vật 3D tương tác", "Tích hợp sẵn (2 Động cơ: Local CPU + AI TRELLIS)", "Không hỗ trợ (Chỉ có ảnh tĩnh phẳng)", "Có nhưng dựng thủ công Blender đắt đỏ", "Hạn chế (Chỉ quét Mesh không gian thô)", "Chỉ cho gắn ảnh 2D vào tường ảo 3D"),
        ("Công cụ tạo không gian 360°", "Tích hợp sẵn Studio với 4 nguồn ảnh đầu vào", "Phải dùng phần mềm bên thứ ba đóng gói", "Không có công cụ tạo trực tiếp", "Tự động quét bằng camera chuyên dụng đắt tiền", "Dựng phòng ảo giả lập (không phải thực tế)"),
        ("Định tuyến lộ trình thông minh", "Tự động tối ưu bằng thuật toán Dijkstra", "Không có (Khách bấm chuyển phòng thủ công)", "Không có định tuyến thông minh", "Điều hướng bước nhảy điểm quét (Scan point)", "Đi lại tự do bằng phím WASD trong phòng ảo"),
        ("Thanh toán vé trực tuyến", "Tích hợp VietQR Napas 247 qua PayOS [17]", "Chưa tích hợp thanh toán vé số", "Chưa tích hợp thanh toán vé số", "Không hỗ trợ cổng ngân hàng nội địa VN", "Không hỗ trợ cổng ngân hàng nội địa VN"),
        ("Soát vé Camera thời gian thực", "Có sẵn qua html5-qrcode (Mã hóa AES-256)", "Soát vé giấy thủ công truyền thống", "Soát vé giấy thủ công truyền thống", "Không hỗ trợ nghiệp vụ soát vé cổng", "Không hỗ trợ nghiệp vụ soát vé cổng"),
        ("Quản trị Đa Bảo Tàng (Multi-CMS)", "Hỗ trợ thay đổi thương hiệu linh hoạt 100%", "Cố định cho duy nhất 1 đơn vị", "Cố định cho duy nhất 1 đơn vị", "Tùy biến nhãn cơ bản", "Chỉ tạo triển lãm cá nhân rời rạc"),
        ("Thuyết minh Voice AI đa ngôn ngữ", "Google Cloud Neural2 (7 ngôn ngữ quốc tế)", "Thuyết minh ghi âm sẵn tiếng Việt", "Thuyết minh ghi âm sẵn tiếng Việt", "Không hỗ trợ thuyết minh tự động", "Chỉ đọc văn bản mô tả tĩnh")
    ]

    for idx, row_vals in enumerate(cmp_data):
        row = tbl_cmp.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate(row_vals):
            c = row.cells[i]
            c.width = col_w_cmp[i]
            c.paragraphs[0].text = val
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [2, 3, 4, 5] else WD_ALIGN_PARAGRAPH.LEFT
            c.paragraphs[0].alignment = align
            is_our_system = (i == 1)
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 9.5, bold=is_our_system or (i == 0))

    for r in tbl_cmp.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=50, bottom=50, left=60, right=60)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    helper.add_body_p(doc, 
        "Phân tích chuyên sâu từ Bảng 5.1 làm nổi bật các lợi thế cạnh tranh mang tính quyết định của hệ thống đề tài:"
    )
    helper.add_bullet_item(doc,
        "Về tính độc lập và chi phí: Các giải pháp thương mại như Matterport đòi hỏi thiết bị phần cứng đắt đỏ (camera chuyên dụng giá từ 80 - 150 triệu đồng) cùng phí duy trì dịch vụ lưu trữ đám mây hàng tháng đắt đỏ, dữ liệu bị phụ thuộc hoàn toàn vào máy chủ nước ngoài. Trong khi đó, hệ thống của đề tài hoàn toàn tự chủ công nghệ, chạy trên mã nguồn mở, cho phép triển khai trên hạ tầng máy chủ VPS nội địa với chi phí vận hành chỉ vài trăm nghìn đồng mỗi tháng, vô cùng phù hợp với khả năng ngân sách của các bảo tàng công lập và di tích văn hóa tại Việt Nam.",
        bold_prefix="Ưu thế về Chi phí và Khả năng Tự chủ Công nghệ: "
    )
    helper.add_bullet_item(doc,
        "Về chiều sâu công nghệ di sản: Trong khi các hệ thống bảo tàng 360° hiện có ở Việt Nam chỉ dừng lại ở các bức ảnh toàn cảnh tĩnh, hệ thống đề tài đã tích hợp đột phá tính năng tái tạo cổ vật 3D (Động cơ Cục bộ + Đám mây AI TRELLIS), giải thuật tìm đường ngắn nhất Dijkstra trên mặt bằng 18 phòng và thuyết minh giọng đọc AI 7 ngôn ngữ, mang lại trải nghiệm tham quan sống động vượt bậc.",
        bold_prefix="Ưu thế về Trải nghiệm Tương tác và Công nghệ 3D: "
    )
    helper.add_bullet_item(doc,
        "Về giải pháp vận hành khép kín: Hệ thống không chỉ phục vụ tham quan ảo mà còn giải quyết toàn diện bài toán kinh tế di sản thông qua cổng thanh toán VietQR PayOS Napas 247 và ứng dụng soát vé qua camera điện thoại, tạo thành một hệ sinh thái chuyển đổi số hoàn chỉnh từ online đến offline.",
        bold_prefix="Ưu thế về Thương mại điện tử và Tự động hóa Vận hành: "
    )

    # -------------------------------------------------------------------------
    # 5.2. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # -------------------------------------------------------------------------
    helper.add_heading_2(doc, "5.2. Kết luận và Hướng phát triển")

    helper.add_heading_3(doc, "5.2.1. Kết luận khoa học và giá trị thực tiễn")
    helper.add_body_p(doc, 
        "Khóa luận tốt nghiệp 'Hệ thống tham quan thực tế ảo 360° và số hóa không gian di sản tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh' "
        "đã hoàn thành xuất sắc các mục tiêu nghiên cứu, đóng góp thiết thực vào công cuộc chuyển đổi số ngành văn hóa - du lịch Việt Nam:"
    )
    helper.add_bullet_item(doc,
        "Về mặt khoa học: Đề tài đã nghiên cứu và làm chủ các công nghệ thị giác máy tính và đồ họa WebGL tiên tiến, kết hợp hài hòa giữa các thuật toán thị giác kinh điển (SIFT, RANSAC, Voronoi Seam Cutting, Laplacian Pyramid) và các mô hình học sâu hiện đại nhất (Structured 3D Latents TRELLIS [29], Google Cloud Neural2 TTS [31]).",
        bold_prefix="Đóng góp về mặt học thuật và công nghệ: "
    )
    helper.add_bullet_item(doc,
        "Về mặt thực tiễn: Hệ thống đã được đưa vào vận hành thử nghiệm trên Internet thực tế (https://museumhcm.duckdns.org), số hóa thành công 18 phòng trưng bày và 17 cổ vật tiêu biểu, đáp ứng đầy đủ các tiêu chuẩn kiểm thử khắt khe về hiệu năng chịu tải (JMeter 1000 users) và trải nghiệm người dùng (Google Lighthouse 94+ điểm).",
        bold_prefix="Đóng góp về mặt ứng dụng và tác động xã hội: "
    )

    helper.add_heading_3(doc, "5.2.2. Khó khăn và hạn chế gặp phải")
    helper.add_body_p(doc, 
        "Dù đạt được nhiều thành quả đáng ghi nhận, nhóm nghiên cứu cũng thẳng thắn chỉ ra một số khó khăn và giới hạn kỹ thuật trong điều kiện thực tế:"
    )
    helper.add_bullet_item(doc,
        "Điều kiện ánh sáng thực địa phức tạp: Các phòng trưng bày cổ sử dụng đèn rọi điểm spotlight vàng tạo tương phản sáng tối cao; mặt khác, tủ kính bảo vệ hiện vật gây hiện tượng phản chiếu ánh sáng và bóng mờ, đòi hỏi xử lý ảnh hậu kỳ tốn thời gian.",
        bold_prefix="1. Thách thức về quang học thực địa: "
    )
    helper.add_bullet_item(doc,
        "Dung lượng ảnh cầu siêu nét 8K: Mặc dù đã tối ưu định dạng WebP và cơ chế Progressive Loading, việc tải ảnh toàn cảnh 8K trên mạng di động 3G/4G chập chờn đôi khi vẫn có độ trễ ban đầu từ 1 - 2 giây.",
        bold_prefix="2. Giới hạn băng thông truyền tải di động: "
    )
    helper.add_bullet_item(doc,
        "Phụ thuộc hạn ngạch GPU đám mây: Động cơ tái tạo 3D TRELLIS dựa trên cụm ZeroGPU A100 miễn phí của Hugging Face Spaces nên có giới hạn số lượt gọi trong ngày. Nhóm đã khắc phục bằng cơ chế chuyển đổi dự phòng sang Động cơ Máy chủ nội bộ (Local CPU), tuy nhiên đối với các vật thể bất đối xứng phức tạp, độ chi tiết của động cơ cục bộ vẫn chưa thể đạt mức hoàn mỹ như GPU Deep Learning chuyên dụng [29], [30].",
        bold_prefix="3. Hạn ngạch tài nguyên GPU đám mây: "
    )

    helper.add_heading_3(doc, "5.2.3. Hướng phát triển và mở rộng trong tương lai")
    helper.add_body_p(doc, 
        "Từ nền tảng kiến trúc vững chắc đã xây dựng, nhóm nghiên cứu vạch ra 5 định hướng phát triển chiến lược trong giai đoạn tiếp theo:"
    )

    helper.add_bullet_item(doc,
        "Ứng dụng chuẩn WebXR Device API để người dùng có thể đeo các thiết bị kính thực tế ảo độc lập như Meta Quest 3, Apple Vision Pro hoặc kính VR di động để bước đi và tương tác trực tiếp trong không gian bảo tàng 3D như ngoài đời thực.",
        bold_prefix="1. Nâng cấp trải nghiệm Thực tế ảo mở rộng qua WebXR (Immersive VR): "
    )
    helper.add_bullet_item(doc,
        "Tích hợp công nghệ 3D Gaussian Splatting (3DGS [27]) và NeRF (Neural Radiance Fields) thời gian thực nhằm tái hiện không gian bảo tàng với hiệu ứng phản chiếu ánh sáng, độ sâu quang học và độ chân thực vượt xa ảnh toàn cảnh 2D truyền thống.",
        bold_prefix="2. Ứng dụng công nghệ 3D Gaussian Splatting thời gian thực: "
    )
    helper.add_bullet_item(doc,
        "Phát triển tính năng nhận diện hiện vật thông minh (Visual AI Search) trên camera điện thoại: Khi du khách đến tham quan trực tiếp tại bảo tàng, chỉ cần hướng camera vào tủ kính, hệ thống AI sẽ tự động nhận diện cổ vật, hiển thị mô hình 3D tương tác và kích hoạt bài thuyết minh âm thanh đa ngôn ngữ tức thì.",
        bold_prefix="3. Tích hợp thị giác máy tính Visual AI Search tại thực địa: "
    )
    helper.add_bullet_item(doc,
        "Tích hợp bộ công cụ quan trắc hệ thống tiêu chuẩn công nghiệp gồm Prometheus và Grafana [32] để theo dõi liên tục các thông số hiệu năng chuyên sâu: Tần suất gọi API, thời gian phản hồi p95/p99, tỷ lệ nạp GPU AI, lưu lượng băng thông WebGL và tự động gửi cảnh báo qua Telegram/Email cho quản trị viên khi phát hiện bất thường.",
        bold_prefix="4. Mở rộng nền tảng giám sát tập trung Prometheus & Grafana: "
    )
    helper.add_bullet_item(doc,
        "Phát triển hệ thống thành nền tảng Liên minh Di sản Số Đa bảo tàng (National Museum Federation): Cho phép nhiều bảo tàng lịch sử, văn hóa và mỹ thuật trên toàn quốc cùng tham gia chia sẻ cơ sở dữ liệu số, phát hành vé liên tuyến điện tử và xây dựng bản đồ di sản số liên thông phục vụ du lịch thông minh của Việt Nam [1], [28].",
        bold_prefix="5. Xây dựng Mạng lưới Liên minh Di sản Số Đa bảo tàng: "
    )

    doc.add_page_break()
    print("Chapter 5 updated successfully with academic comparative evaluation and strategic roadmap.")
