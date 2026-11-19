# -*- coding: utf-8 -*-
"""
TÀI LIỆU THAM KHẢO VÀ CÁC PHỤ LỤC
Báo cáo Khóa luận Tốt nghiệp - IUH
Đánh số tài liệu tham khảo theo đúng thứ tự xuất hiện [1] đến [28]
"""

from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_references_and_appendices(doc, helpers):
    add_heading_1 = helpers['add_heading_1']
    add_heading_2 = helpers['add_heading_2']
    add_heading_3 = helpers['add_heading_3']
    add_body_p = helpers['add_body_p']
    add_reference_entry = helpers['add_reference_entry']
    add_custom_table = helpers['add_custom_table']

    # =========================================================================
    # TÀI LIỆU THAM KHẢO
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "TÀI LIỆU THAM KHẢO")

    references_data = [
        (1, 'Prime Minister of Vietnam, "Decision No. 749/QD-TTg approving the National Digital Transformation Program to 2025, with orientations to 2030," Government Portal of the Socialist Republic of Vietnam, Jun. 2020. [Online]. Available: https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=200163. [Accessed: Oct. 15, 2026].'),
        (2, 'Museum of History of Ho Chi Minh City, "Permanent Exhibitions and National Treasures Catalog of Ho Chi Minh City Museum of History," Ho Chi Minh City Cultural Publishing House, 2024. [Online]. Available: http://www.baotanglichsutphcm.com.vn/en/galleries. [Accessed: Oct. 20, 2026].'),
        (3, 'D. G. Lowe, "Distinctive Image Features from Scale-Invariant Keypoints," International Journal of Computer Vision (IJCV), vol. 60, no. 2, pp. 91-110, 2004. doi: 10.1023/B:VISI.0000029664.99615.94. [Online]. Available: https://link.springer.com/article/10.1023/B:VISI.0000029664.99615.94. [Accessed: Sep. 20, 2026].'),
        (4, 'M. Brown and D. G. Lowe, "Automatic Panoramic Image Stitching using Invariant Features," International Journal of Computer Vision (IJCV), vol. 74, no. 1, pp. 59-73, 2007. doi: 10.1007/s11263-006-0002-3. [Online]. Available: https://link.springer.com/article/10.1007/s11263-006-0002-3. [Accessed: Sep. 18, 2026].'),
        (5, 'M. A. Fischler and R. C. Bolles, "Random Sample Consensus: A Paradigm for Model Fitting with Applications to Image Analysis and Automated Cartography," Communications of the ACM, vol. 24, no. 6, pp. 381-395, 1981. doi: 10.1145/358669.358692. [Online]. Available: https://dl.acm.org/doi/10.1145/358669.358692. [Accessed: Sep. 12, 2026].'),
        (6, 'P. J. Burt and E. H. Adelson, "A Multiresolution Spline with Application to Image Mosaics," ACM Transactions on Graphics (TOG), vol. 2, no. 4, pp. 217-236, 1983. doi: 10.1145/245.247. [Online]. Available: https://dl.acm.org/doi/10.1145/245.247. [Accessed: Sep. 22, 2026].'),
        (7, 'R. Cabello and J. Dirksen, "Three.js - JavaScript 3D Library Documentation and Cookbook," Three.js Project, 2026. [Online]. Available: https://threejs.org/docs/. [Accessed: Oct. 05, 2026].'),
        (8, 'Khronos Group, "WebGL 2.0 Specification and glTF 2.0 Asset Format Specification," Khronos Open Standards Consortium, 2026. [Online]. Available: https://www.khronos.org/registry/webgl/specs/latest/2.0/. [Accessed: Oct. 10, 2026].'),
        (9, 'E. W. Dijkstra, "A Note on Two Problems in Connexion with Graphs," Numerische Mathematik, vol. 1, no. 1, pp. 269-271, 1959. doi: 10.1007/BF01386390. [Online]. Available: https://link.springer.com/article/10.1007/BF01386390. [Accessed: Sep. 14, 2026].'),
        (10, 'T. H. Cormen, C. E. Leiserson, R. L. Rivest, and C. Stein, "Introduction to Algorithms," 4th Edition, The MIT Press, Cambridge, Massachusetts, 2022. [Online]. Available: https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/. [Accessed: Sep. 15, 2026].'),
        (11, 'OpenCV Development Team, "OpenCV: Open Source Computer Vision Library Documentation (Version 4.9.0)," Stitching and Feature Detection Modules, 2026. [Online]. Available: https://docs.opencv.org/4.x/d1/d46/group__stitching.html. [Accessed: Oct. 12, 2026].'),
        (12, 'OpenJS Foundation, "Node.js v20 LTS Architecture and Runtime Documentation," Node.js Official Docs, 2026. [Online]. Available: https://nodejs.org/docs/latest-v20.x/api/. [Accessed: Oct. 01, 2026].'),
        (13, 'PostgreSQL Global Development Group, "PostgreSQL 16.2 Documentation: Concurrency Control and ACID Transactions," 2026. [Online]. Available: https://www.postgresql.org/docs/16/mvcc.html. [Accessed: Oct. 08, 2026].'),
        (14, 'MongoDB Inc., "MongoDB Manual 7.0: Document-Oriented Architecture and Geospatial Indexing," MongoDB Documentation, 2026. [Online]. Available: https://www.mongodb.com/docs/manual/. [Accessed: Oct. 08, 2026].'),
        (15, 'Redis Ltd., "Redis In-Memory Data Store Documentation: In-Memory Caching and High-Throughput Performance," 2026. [Online]. Available: https://redis.io/docs/. [Accessed: Oct. 11, 2026].'),
        (16, 'State Bank of Vietnam, "Decision No. 1305/QD-NHNN on Technical Standards for Quick Response Code Payments (VietQR Specification)," State Bank of Vietnam, 2021. [Online]. Available: https://sbv.gov.vn/webcenter/portal/vi/menu/trangchu. [Accessed: Sep. 25, 2026].'),
        (17, 'PayOS Team, "PayOS Open Payment Platform Documentation: VietQR Open API & HMAC-SHA256 Webhook Verification," PayOS Docs, 2026. [Online]. Available: https://payos.vn/docs/. [Accessed: Sep. 28, 2026].'),
        (18, 'F5 NGINX Inc., "NGINX Reverse Proxy and HTTP Load Balancing Configuration Guide," NGINX Documentation, 2026. [Online]. Available: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/. [Accessed: Oct. 04, 2026].'),
        (19, 'Docker Inc., "Docker Engine and Docker Compose Containerization Architecture Documentation," Docker Docs, 2026. [Online]. Available: https://docs.docker.com/compose/. [Accessed: Oct. 02, 2026].'),
        (20, 'Meta Platforms Inc., "React 18 Documentation: Concurrent Features, Hooks, and Component Lifecycle," React Official Docs, 2026. [Online]. Available: https://react.dev/. [Accessed: Sep. 15, 2026].'),
        (21, 'Vite Core Team, "Vite: Next Generation Frontend Tooling Documentation," Vite Official Guide, 2026. [Online]. Available: https://vitejs.dev/guide/. [Accessed: Sep. 16, 2026].'),
        (22, 'M. Nimje, "HTML5-QRCode: Cross-platform End-to-end HTML5 QR Code and Barcode Scanner Library," GitHub Repository, 2026. [Online]. Available: https://github.com/mebjas/html5-qrcode. [Accessed: Oct. 03, 2026].'),
        (23, 'Apache Software Foundation, "Apache JMeter 5.6 User Manual: Load Testing and Performance Benchmarking for Web Applications," 2026. [Online]. Available: https://jmeter.apache.org/usermanual/. [Accessed: Oct. 22, 2026].'),
        (24, 'Google Chrome Developers, "Web Vitals and Lighthouse Performance Scoring Metrics Guidelines (LCP, INP, CLS)," Google Developers, 2026. [Online]. Available: https://web.dev/vitals/. [Accessed: Oct. 24, 2026].'),
        (25, 'A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin, "Attention Is All You Need," Advances in Neural Information Processing Systems (NeurIPS 2017), vol. 30, pp. 5998-6008, 2017. [Online]. Available: https://arxiv.org/abs/1706.03762. [Accessed: Sep. 19, 2026].'),
        (26, 'T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, ... and D. Amodei, "Language Models are Few-Shot Learners," Advances in Neural Information Processing Systems (NeurIPS 2020), vol. 33, pp. 1877-1901, 2020. [Online]. Available: https://arxiv.org/abs/2005.14165. [Accessed: Sep. 20, 2026].'),
        (27, 'B. Kerbl, G. Kopanas, T. Leimkuehler, and G. Drettakis, "3D Gaussian Splatting for Real-Time Radiance Field Rendering," ACM Transactions on Graphics (TOG), vol. 42, no. 4, Article 139, 2023. doi: 10.1145/3592433. [Online]. Available: https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/. [Accessed: Sep. 28, 2026].'),
        (28, 'UNESCO, "Recommendation on the Ethics of Artificial Intelligence and Digital Cultural Heritage Preservation Guidelines," UNESCO Publishing, Paris, France, 2023. [Online]. Available: https://unesdoc.unesco.org/ark:/48223/pf0000381137. [Accessed: Oct. 30, 2026].'),
        (29, 'J. Xiang, Z. Lv, S. Long, Y. Deng, K. Chen, and B. Dai, "TRELLIS: Structured 3D Latents for Scalable and Versatile 3D Generation," arXiv preprint arXiv:2412.01506, Dec. 2024. [Online]. Available: https://arxiv.org/abs/2412.01506. [Accessed: Oct. 25, 2026].'),
        (30, 'Hugging Face Inc., "Hugging Face Spaces and ZeroGPU Dynamic Hardware Acceleration Documentation," Hugging Face Platform, 2026. [Online]. Available: https://huggingface.co/docs/hub/spaces-gpus. [Accessed: Oct. 24, 2026].'),
        (31, 'Google Cloud, "Cloud Text-to-Speech Documentation: Neural2 and Multilingual Speech Synthesis," Google Cloud Computing Services, 2026. [Online]. Available: https://cloud.google.com/text-to-speech/docs/neural2. [Accessed: Oct. 18, 2026].'),
        (32, 'Grafana Labs, "Grafana and Prometheus: Open Observability and Real-Time Systems Monitoring Platform Documentation," Grafana Labs, 2026. [Online]. Available: https://grafana.com/docs/. [Accessed: Oct. 26, 2026].'),
        (33, 'GitHub Inc., "GitHub Actions Documentation: Continuous Integration and Continuous Delivery (CI/CD) Automation," GitHub Platform, 2026. [Online]. Available: https://docs.github.com/en/actions. [Accessed: Oct. 27, 2026].'),
        (34, 'Cloudflare Inc., "Cloudflare R2 Object Storage Documentation: S3-Compatible Cloud Storage Architecture," Cloudflare Docs, 2026. [Online]. Available: https://developers.cloudflare.com/r2/. [Accessed: Oct. 28, 2026].')
    ]

    for ref_id, citation_text in references_data:
        add_reference_entry(doc, ref_id, citation_text)

    # =========================================================================
    # PHỤ LỤC
    # =========================================================================
    doc.add_page_break()
    add_heading_1(doc, "PHỤ LỤC")

    # -------------------------------------------------------------------------
    # PHỤ LỤC A
    # -------------------------------------------------------------------------
    add_heading_2(doc, "Phụ lục A: Ma trận liên thông và khoảng cách 18 gian phòng bảo tàng")

    add_body_p(doc, 
        "Bảng ma trận liên thông thể hiện trọng số khoảng cách (đơn vị: mét) giữa 18 gian phòng trưng bày chuyên đề tại Bảo tàng Lịch sử "
        "Thành phố Hồ Chí Minh, được dùng làm dữ liệu đầu vào cho giải thuật Dijkstra tìm lộ trình ngắn nhất [9], [10]. "
        "Ký hiệu '∞' biểu thị hai gian phòng không có lối đi trực tiếp.")

    matrix_headers = ["Phòng", "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10", "P11", "P12", "P13", "P14", "P15", "P16", "P17", "P18"]
    matrix_col_widths = [1.5] + [0.75] * 18
    matrix_alignments = [WD_ALIGN_PARAGRAPH.CENTER] * 19

    # Dữ liệu đối xứng cho ma trận 18 phòng
    matrix_rows = []
    rooms_short = [f"P{i:02d}" for i in range(1, 19)]
    
    # Kết nối logic giữa các phòng liền kề
    adj_graph = {
        1: {2: 12, 18: 15},
        2: {1: 12, 3: 14, 17: 20},
        3: {2: 14, 4: 16},
        4: {3: 16, 5: 15, 6: 22},
        5: {4: 15, 6: 14},
        6: {4: 22, 5: 14, 7: 18},
        7: {6: 18, 8: 12},
        8: {7: 12, 9: 14, 16: 25},
        9: {8: 14, 10: 16},
        10: {9: 16, 11: 15},
        11: {10: 15, 12: 18, 15: 24},
        12: {11: 18, 13: 14},
        13: {12: 14, 14: 16},
        14: {13: 16, 15: 15},
        15: {11: 24, 14: 15, 16: 18},
        16: {8: 25, 15: 18, 17: 16},
        17: {2: 20, 16: 16, 18: 14},
        18: {1: 15, 17: 14}
    }

    for i in range(1, 19):
        row = [f"P{i:02d}"]
        for j in range(1, 19):
            if i == j:
                row.append("0")
            elif j in adj_graph.get(i, {}):
                row.append(str(adj_graph[i][j]))
            else:
                row.append("∞")
        matrix_rows.append(row)

    add_custom_table(doc, matrix_headers, matrix_rows, matrix_col_widths, matrix_alignments,
                     table_caption="Bảng A.1: Ma trận khoảng cách liên thông giữa 18 gian phòng bảo tàng (đơn vị: mét)")

    # -------------------------------------------------------------------------
    # PHỤ LỤC B
    # -------------------------------------------------------------------------
    doc.add_page_break()
    add_heading_2(doc, "Phụ lục B: Kế hoạch thực hiện đề tài và phân bổ thời gian")

    add_body_p(doc, 
        "Đề tài khóa luận tốt nghiệp được thực hiện trong thời gian 15 tuần theo đúng tiến độ quy định của Khoa Công nghệ Thông tin, "
        "Trường Đại học Công nghiệp Thành phố Hồ Chí Minh (IUH), dưới sự hướng dẫn khoa học định kỳ của TS. Trần Thị Minh Khoa:")

    plan_headers = ["Tuần", "Giai đoạn & Công việc thực hiện", "Đầu ra sản phẩm (Deliverables)", "Người phụ trách"]
    plan_col_widths = [1.2, 7.5, 4.3, 2.5]
    plan_alignments = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]

    plan_rows = [
        ["Tuần 1", "Khởi động đề tài, nghiên cứu tài liệu quy định IUH, xác định phạm vi bảo tàng thực tế", "Đề cương chi tiết khóa luận được GVHD phê duyệt", "Cả 2 SV"],
        ["Tuần 2", "Khảo sát thực địa Đợt 1 tại Bảo tàng Lịch sử TP.HCM, chụp thử nghiệm và đo đạc không gian", "Bản đồ sơ họa 18 phòng và bộ 30 ảnh thử nghiệm", "Lộc & Thành"],
        ["Tuần 3", "Nghiên cứu cơ sở toán học SIFT, Cylindrical Warping, RANSAC, Voronoi Seam Cutting", "Báo cáo lý thuyết thị giác máy tính và công thức toán", "Huỳnh Tấn Lộc"],
        ["Tuần 4", "Khảo sát thực địa Đợt 2: Chụp ảnh 360° toàn cảnh chính thức các phòng P01 đến P09", "Bộ sưu tập 55 ảnh 360° phân giải 8K gian Tiền Sử - Triều đại", "Trịnh Vĩ Thành"],
        ["Tuần 5", "Khảo sát thực địa Đợt 3: Chụp ảnh các phòng P10 đến P18 và chụp Photogrammetry cổ vật 3D", "Bộ 50 ảnh 360° Nam Bộ - Chăm Pa và 17 bộ ảnh xoay cổ vật", "Lộc & Thành"],
        ["Tuần 6", "Lập trình công cụ Panoramic Stitching Studio nội bộ, tiền xử lý và cắt vá ảnh", "Phân hệ Studio ghép ảnh 360° hoàn chỉnh trong Admin", "Huỳnh Tấn Lộc"],
        ["Tuần 7", "Xây dựng không gian thực tế ảo Three.js WebGL Inverted Sphere, gắn Hotspot đa phương tiện", "Module xem 360° mượt mà 60 FPS tích hợp trên Client", "Trịnh Vĩ Thành"],
        ["Tuần 8", "Cài đặt giải thuật Dijkstra định tuyến 18 phòng và xây dựng sơ đồ tương tác Floorplan SVG", "Tính năng tìm đường ngắn nhất trực quan trên bản đồ", "Huỳnh Tấn Lộc"],
        ["Tuần 9", "Khảo sát thực địa Đợt 4: Thu thập file thuyết minh Audio, xác thực mã hiện vật và đối soát", "Bộ tư liệu âm thanh 3 ngôn ngữ và danh mục 18 phòng", "Lộc & Thành"],
        ["Tuần 10", "Phát triển Backend Node.js/TypeScript, thiết kế Hybrid DB (PostgreSQL + MongoDB + Redis)", "Hệ thống API RESTful và cơ sở dữ liệu đồng bộ hoàn chỉnh", "Huỳnh Tấn Lộc"],
        ["Tuần 11", "Tích hợp cổng thanh toán VietQR PayOS, Webhook HMAC-SHA256 và sinh mã QR vé điện tử", "Phân hệ đặt vé trực tuyến và xác nhận qua Email OTP", "Trịnh Vĩ Thành"],
        ["Tuần 12", "Phát triển công cụ Quét QR bằng Camera qua html5-qrcode và Trợ lý Di sản Ảo AI", "Tính năng soát vé siêu tốc 0,5s và Trợ lý AI đa ngôn ngữ", "Cả 2 SV"],
        ["Tuần 13", "Đóng gói Docker, triển khai VPS Ubuntu đám mây, cấu hình Nginx SSL và miền duckdns", "Hệ thống vận hành thực tế tại https://museumhcm.duckdns.org", "Huỳnh Tấn Lộc"],
        ["Tuần 14", "Kiểm thử hiệu năng chịu tải Apache JMeter (50-1000 users) và đo lường Google Lighthouse", "Báo cáo kiểm thử hiệu năng chi tiết, đạt 98% pass rate", "Trịnh Vĩ Thành"],
        ["Tuần 15", "Hoàn thiện tài liệu báo cáo khóa luận, Slide thuyết trình và chuẩn bị bảo vệ trước Hội đồng", "Cuốn Báo cáo KLTN chuẩn IUH và Video demo hệ thống", "Cả 2 SV"]
    ]

    add_custom_table(doc, plan_headers, plan_rows, plan_col_widths, plan_alignments,
                     table_caption="Bảng B.1: Tiến độ chi tiết thực hiện đề tài khóa luận qua 15 tuần")

    # -------------------------------------------------------------------------
    # PHỤ LỤC C
    # -------------------------------------------------------------------------
    doc.add_page_break()
    add_heading_2(doc, "Phụ lục C: Nhật ký 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM")

    add_body_p(doc, 
        "Nhằm đảm bảo tính chính xác khoa học lịch sử và chất lượng dữ liệu số hóa chân thực nhất, nhóm nghiên cứu đã trực tiếp "
        "đến làm việc và khảo sát thực địa tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh (số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, "
        "Quận 1, TP.HCM) qua 4 đợt chính thức:")

    survey_headers = ["Đợt & Thời gian", "Địa điểm & Khu vực khảo sát", "Nội dung công việc và thiết bị sử dụng", "Kết quả thu nhận"]
    survey_col_widths = [2.0, 4.0, 5.5, 4.0]
    survey_alignments = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]

    survey_rows = [
        ["Đợt 1\n(05/09/2026)", "Khuôn viên ngoài, Tiền sảnh, Phòng P01 đến P04", "Quan sát ánh sáng tự nhiên/nhân tạo, đo đạc khoảng cách giữa các cửa liên thông bằng thước laser, chụp thử nghiệm góc rộng.", "Bản vẽ sơ đồ mặt bằng tỷ lệ chuẩn; thông số thiết lập độ phơi sáng ISO và khẩu độ cho camera."],
        ["Đợt 2\n(19/09/2026)", "Gian phòng P01 đến P09 (Thời tiền sử đến Nhà Nguyễn)", "Sử dụng máy ảnh chuyên dụng gắn chân máy Tripod có đầu cân bằng thủy chuẩn xoay 360°, chụp bracketing 3 mức phơi sáng (-2, 0, +2 EV).", "55 bức ảnh toàn cảnh 360° độ nét 8K; đo tọa độ các tủ hiện vật trọng điểm."],
        ["Đợt 3\n(03/10/2026)", "Gian phòng P10 đến P18 (Văn hóa Chăm Pa, Óc Eo, Tượng Phật)", "Chụp 360° các phòng còn lại; chụp đa góc 72 bức ảnh/vòng cho 17 bảo vật để phục vụ dựng hình 3D xoay; ghi nhận mã số hiện vật niêm phong.", "50 bức ảnh 360° chất lượng cao; 17 bộ dữ liệu ảnh Photogrammetry cổ vật 3D quý hiếm."],
        ["Đợt 4\n(17/10/2026)", "Toàn bộ 18 phòng và bàn hướng dẫn viên", "Kiểm tra, ghi âm file thuyết minh audio mẫu; kiểm tra thực địa tuyến đi tối ưu Dijkstra; test thử nghiệm quét mã QR mẫu tại cửa bảo tàng.", "File âm thanh thuyết minh 3 ngôn ngữ; xác thực tính khả thi thực tế của giải pháp di động."]
    ]

    add_custom_table(doc, survey_headers, survey_rows, survey_col_widths, survey_alignments,
                     table_caption="Bảng C.1: Nhật ký chi tiết 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM")

    # -------------------------------------------------------------------------
    # PHỤ LỤC D
    # -------------------------------------------------------------------------
    doc.add_page_break()
    add_heading_2(doc, "Phụ lục D: Bảng phân công nhiệm vụ và đánh giá đóng góp của sinh viên")

    add_body_p(doc, 
        "Đề tài khóa luận tốt nghiệp được thực hiện bởi nhóm gồm 2 sinh viên chuyên ngành Kỹ thuật Phần mềm, Khoa Công nghệ Thông tin, "
        "Trường Đại học Công nghiệp TP.HCM. Công việc được phân chia rõ ràng theo năng lực chuyên môn và cả hai sinh viên đều tham gia "
        "tích cực, đóng góp 50% khối lượng công việc tổng thể của đề tài:")

    duty_headers = ["STT", "Họ và tên sinh viên", "Mã số sinh viên", "Nhiệm vụ phân công đảm nhiệm chính", "Tỷ lệ đóng góp"]
    duty_col_widths = [1.0, 3.5, 2.0, 7.5, 1.5]
    duty_alignments = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]

    duty_rows = [
        [
            "1", 
            "Huỳnh Tấn Lộc", 
            "22686171", 
            "- Nghiên cứu và hiện thực hóa chuỗi thuật toán xử lý ảnh ghép nối toàn cảnh (SIFT, RANSAC, Cylindrical Warping, Multi-band Blending).\n"
            "- Xây dựng công cụ Panoramic Stitching Studio nội bộ trên phân hệ quản trị.\n"
            "- Cài đặt giải thuật Dijkstra tìm lộ trình ngắn nhất trên bản đồ 18 gian phòng.\n"
            "- Thiết kế kiến trúc Backend Node.js/TypeScript, Hybrid Database (PostgreSQL + MongoDB + Redis).\n"
            "- Cấu hình Docker, Nginx SSL, quản trị hệ thống và triển khai thực tế lên máy chủ VPS Ubuntu đám mây.\n"
            "- Đồng tác giả khảo sát thực địa và viết báo cáo khóa luận tốt nghiệp.",
            "50%"
        ],
        [
            "2", 
            "Trịnh Vĩ Thành", 
            "22689411", 
            "- Nghiên cứu và hiện thực hóa không gian thực tế ảo 360° Three.js WebGL Inverted Sphere, cơ chế nén WebP và buffer geometry.\n"
            "- Thiết kế giao diện người dùng Client Portal và Admin Portal chuẩn nhận diện văn hóa di sản (Obsidian & Antique Gold).\n"
            "- Tích hợp cổng thanh toán trực tuyến VietQR PayOS, kiểm soát bảo mật Webhook HMAC-SHA256.\n"
            "- Xây dựng công cụ quét mã QR bằng Camera qua thư viện html5-qrcode và Trợ lý Di sản Ảo AI.\n"
            "- Thực hiện kiểm thử hiệu năng chịu tải Apache JMeter và đo lường Google Lighthouse.\n"
            "- Đồng tác giả khảo sát thực địa và viết báo cáo khóa luận tốt nghiệp.",
            "50%"
        ]
    ]

    add_custom_table(doc, duty_headers, duty_rows, duty_col_widths, duty_alignments,
                     table_caption="Bảng D.1: Bảng phân công nhiệm vụ và tỷ lệ đóng góp của từng thành viên nhóm nghiên cứu")

    print("Added References and Appendices successfully.")
