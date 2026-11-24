# -*- coding: utf-8 -*-
"""
Script thiết kế Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Đề tài: 360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM FOR HO CHI MINH CITY MUSEUM OF HISTORY
Trường: Industrial University of Ho Chi Minh City (IUH) - Faculty of Information Technology

Yêu cầu nâng cấp toàn diện:
1. 100% Tiếng Anh học thuật chuẩn quốc tế (Chuẩn báo cáo hội thảo SSRC & Poster bảo vệ khoa học).
2. Ảnh nền là ảnh chụp chính diện Bảo tàng Lịch sử TP.HCM (media_1795529967288_6ce48745.jpg),
   được xử lý làm mờ Gaussian và hòa trộn mờ nhẹ (92% tint trắng) để tạo chiều sâu văn hóa mà không làm ảnh hưởng chữ.
3. Tích hợp đầy đủ danh mục Công nghệ sử dụng (Technology Stack): React 18, Three.js, Node.js,
   PostgreSQL 16, MongoDB 7.0, Redis, RabbitMQ, Docker, Python OpenCV, COLMAP, Microsoft TRELLIS, PayOS VietQR, Google Cloud TTS.
4. Đầy đủ các luồng chức năng & sơ đồ mới nhất từ báo cáo:
   - Sơ đồ Kiến trúc 3 tầng
   - Luồng Tạo không gian 360° Panorama
   - Luồng Tái tạo hiện vật 3D (Động cơ kép CPU & AI)
   - Luồng Sơ đồ mặt bằng & Định tuyến Dijkstra
   - Luồng Dịch thuật 7 ngôn ngữ & Trợ lý giọng nói AI
   - Luồng Thanh toán VietQR & Soát vé camera QR
   - Khối Đánh giá hiệu năng SSRC & Bảng tròn điểm số Google Lighthouse Audit (Hình 4.40).
5. Đồng bộ font chữ toàn poster (Font Arial duy nhất, phân cấp kích thước chuẩn xác).
6. Khắc phục triệt để lỗi tràn viền (Tất cả thành phần nằm trọn vẹn trong chiều cao 118.9cm, an toàn 100%).
"""

import os
import pptx
from pptx.util import Pt, Cm
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return RGBColor(*(int(hex_str[i:i+2], 16) for i in (0, 2, 4)))

# Bảng màu chuẩn học thuật quốc tế (Minimalist Clean Academic Palette)
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Nền card trắng tinh khiết
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Viền card mỏng, thanh nhã (Slate nhạt)
C_IUH_BLUE    = hex_to_rgb('005BAA')  # Xanh IUH chính thức
C_NAVY_DEEP   = hex_to_rgb('0F2942')  # Xanh Navy đậm chủ đạo
C_TEXT_DARK   = hex_to_rgb('0F172A')  # Chữ than chì sắc nét
C_TEXT_MUTED  = hex_to_rgb('475569')  # Chữ phụ đề trung tính dễ đọc
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Chân trang xanh Navy vững chãi
C_WHITE       = hex_to_rgb('FFFFFF')  # Chữ trắng cho footer
C_SUBTLE_BG   = hex_to_rgb('F8FAFC')  # Nền phụ trợ cho các khối nhỏ
C_TECH_BG     = hex_to_rgb('F1F5F9')  # Nền khối công nghệ

def create_perfect_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. ẢNH NỀN BẢO TÀNG LÀM MỜ (Faded Museum Watermark Background)
    bg_img = 'poster/assets/museum_faded_bg.jpg'
    if os.path.exists(bg_img):
        slide.shapes.add_picture(bg_img, 0, 0, width=Cm(84.1), height=Cm(118.9))
    else:
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = hex_to_rgb('FFFFFF')
        bg_shape.line.fill.background()

    # =========================================================================
    # 2. TOP HEADER BANNER (Y = 1.2cm, Height = 10.0cm, Width = 80.5cm)
    # =========================================================================
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(1.2), Cm(80.5), Cm(10.0))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_CARD_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(1.5)

    # Logo IUH góc trái Header (W = 11.2cm, H = 4.01cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.2), Cm(2.2), width=Cm(11.2), height=Cm(4.01))

    # Khối giữa: Tên Trường & Tiêu đề Đề tài
    mid_tb = slide.shapes.add_textbox(Cm(15.0), Cm(1.5), Cm(47.5), Cm(9.4))
    tf_m = mid_tb.text_frame
    tf_m.word_wrap = True

    p_u1 = tf_m.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(16.5)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_IUH_BLUE

    p_u2 = tf_m.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "FACULTY OF INFORMATION TECHNOLOGY — SOFTWARE ENGINEERING DEPARTMENT\n\n"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(13.5)
    r_u2.font.bold = True
    r_u2.font.color.rgb = C_NAVY_DEEP

    p_t1 = tf_m.add_paragraph()
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(21.5)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_NAVY_DEEP

    p_t2 = tf_m.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "FOR HO CHI MINH CITY MUSEUM OF HISTORY"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(19.0)
    r_t2.font.bold = True
    r_t2.font.color.rgb = C_IUH_BLUE

    # Khối phải: Supervisor & Student Authors
    meta_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(63.2), Cm(1.6), Cm(18.0), Cm(9.2))
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = C_SUBTLE_BG
    meta_box.line.color.rgb = C_CARD_BORDER
    meta_box.line.width = Pt(1.0)

    meta_tb = slide.shapes.add_textbox(Cm(63.5), Cm(1.8), Cm(17.4), Cm(8.8))
    tf_meta = meta_tb.text_frame
    tf_meta.word_wrap = True

    p_gv = tf_meta.paragraphs[0]
    r_gv_lbl = p_gv.add_run()
    r_gv_lbl.text = "Supervisor:\n"
    r_gv_lbl.font.name = "Arial"
    r_gv_lbl.font.size = Pt(12.5)
    r_gv_lbl.font.bold = True
    r_gv_lbl.font.color.rgb = C_IUH_BLUE
    r_gv_val = p_gv.add_run()
    r_gv_val.text = "PhD. Trần Thị Minh Khoa\n\n"
    r_gv_val.font.name = "Arial"
    r_gv_val.font.size = Pt(14.5)
    r_gv_val.font.bold = True
    r_gv_val.font.color.rgb = C_NAVY_DEEP

    p_sv = tf_meta.add_paragraph()
    r_sv_lbl = p_sv.add_run()
    r_sv_lbl.text = "Student Researchers:\n"
    r_sv_lbl.font.name = "Arial"
    r_sv_lbl.font.size = Pt(12.5)
    r_sv_lbl.font.bold = True
    r_sv_lbl.font.color.rgb = C_IUH_BLUE

    r_sv1 = p_sv.add_run()
    r_sv1.text = "• Huỳnh Tấn Lộc (ID: 22686171)\n"
    r_sv1.font.name = "Arial"
    r_sv1.font.size = Pt(13.5)
    r_sv1.font.bold = True
    r_sv1.font.color.rgb = C_TEXT_DARK

    r_sv2 = p_sv.add_run()
    r_sv2.text = "• Trịnh Vĩ Thành (ID: 22689411)\n"
    r_sv2.font.name = "Arial"
    r_sv2.font.size = Pt(13.5)
    r_sv2.font.bold = True
    r_sv2.font.color.rgb = C_TEXT_DARK

    r_cls = p_sv.add_run()
    r_cls.text = "Class: DHCNTT18ATT (Cohort 2022 — 2026)"
    r_cls.font.name = "Arial"
    r_cls.font.size = Pt(11.5)
    r_cls.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # HÀM TẠO CARD CHỨC NĂNG (Bo góc nhẹ, viền mảnh, đồng bộ font Arial)
    # =========================================================================
    def add_func_card(x, y, w, h, title_text, badge_text=""):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Tiêu đề Card
        tb = slide.shapes.add_textbox(Cm(x + 0.6), Cm(y + 0.35), Cm(w - 1.2), Cm(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(17.5)
        r.font.bold = True
        r.font.color.rgb = C_NAVY_DEEP

        if badge_text:
            r_b = p.add_run()
            r_b.text = f"  [{badge_text}]"
            r_b.font.name = "Arial"
            r_b.font.size = Pt(12.5)
            r_b.font.bold = True
            r_b.font.color.rgb = C_IUH_BLUE

        # Thanh phân cách xanh IUH
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.6), Cm(y + 1.55), Cm(4.5), Cm(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = C_IUH_BLUE
        bar.line.fill.background()

        return card

    # =========================================================================
    # CỘT 1 (LEFT: X = 1.8cm, Width = 39.2cm, Height = 101.4cm, Y = 11.8cm -> 113.2cm)
    # =========================================================================

    # 1. System Architecture & Tech Stack (Y = 11.8cm -> 37.0cm, H = 25.2cm)
    add_func_card(1.8, 11.8, 39.2, 25.2, "1. System Architecture & Tech Stack", "3-Tier Hybrid Architecture")
    arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(2.4), Cm(13.7), width=Cm(38.0), height=Cm(16.8))

    # Khối Công nghệ Sử dụng trong Dự án (Liệt kê đầy đủ 100% công nghệ)
    tech_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(30.8), Cm(38.0), Cm(5.6))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = C_TECH_BG
    tech_box.line.color.rgb = C_CARD_BORDER
    tech_box.line.width = Pt(1.0)

    tb_tech = slide.shapes.add_textbox(Cm(2.6), Cm(30.9), Cm(37.6), Cm(5.4))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True
    p_tech = tf_tech.paragraphs[0]
    r_th1 = p_tech.add_run()
    r_th1.text = "CORE PROJECT TECHNOLOGY STACK:\n"
    r_th1.font.name = "Arial"
    r_th1.font.size = Pt(11.5)
    r_th1.font.bold = True
    r_th1.font.color.rgb = C_IUH_BLUE

    r_th2 = p_tech.add_run()
    r_th2.text = (
        "• Frontend: React 18, Three.js (WebGL 60 FPS), TypeScript, TailwindCSS, Lucide Icons, HTML5-QRCode.\n"
        "• Backend & Gateway: Node.js v20, Express REST API, Nginx Reverse Proxy (SSL/TLS), Docker Compose.\n"
        "• Polyglot Storage: PostgreSQL 16 (ACID Tickets & PayOS), MongoDB 7.0 (360° Tours & 3D Items), Redis 7.0.\n"
        "• Async & AI: RabbitMQ, Python OpenCV (SIFT/RANSAC), COLMAP, TRELLIS AI, Google TTS Neural2, PayOS VietQR."
    )
    r_th2.font.name = "Arial"
    r_th2.font.size = Pt(10.5)
    r_th2.font.color.rgb = C_TEXT_DARK

    # 2. Automated 360° Panorama Creation Workflow (Y = 37.7cm -> 74.7cm, H = 37.0cm)
    add_func_card(1.8, 37.7, 39.2, 37.0, "2. 360° Space Creation & Tour Workflow", "360° Panorama Stitching Flow")
    stitch_img = 'baocaokhoaluan/assets/diagrams/flow_01_stitching_process.png'
    if os.path.exists(stitch_img):
        slide.shapes.add_picture(stitch_img, Cm(2.4), Cm(39.6), width=Cm(38.0), height=Cm(15.2))

    tour_ui_img = 'poster/assets/tour360_interface.jpg'
    if os.path.exists(tour_ui_img):
        slide.shapes.add_picture(tour_ui_img, Cm(2.4), Cm(55.2), width=Cm(38.0), height=Cm(14.8))

    tb_c2 = slide.shapes.add_textbox(Cm(2.2), Cm(70.4), Cm(38.4), Cm(4.0))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    r_c2 = p_c2.add_run()
    r_c2.text = "• Multi-source Processing (Video/Webcam/DSLR): Cylindrical Warping → DoG SIFT Feature Extraction → RANSAC Inlier Matching → Global Homography Optimization → Multiband Blending into 8K Equirectangular Panoramas."
    r_c2.font.name = "Arial"
    r_c2.font.size = Pt(11.8)
    r_c2.font.color.rgb = C_TEXT_DARK

    # 3. Dual-Engine 3D Artifact Reconstruction Workflow (Y = 75.4cm -> 113.2cm, H = 37.8cm)
    add_func_card(1.8, 75.4, 39.2, 37.8, "3. Dual-Engine 3D Artifact Reconstruction", "Dual-Engine 3D Pipeline")
    d3_img = 'baocaokhoaluan/assets/diagrams/flow_04_dual_engine_3d_en.png'
    if not os.path.exists(d3_img):
        d3_img = 'baocaokhoaluan/assets/diagrams/flow_04_dual_engine_3d.png'
    if os.path.exists(d3_img):
        slide.shapes.add_picture(d3_img, Cm(2.4), Cm(77.3), width=Cm(38.0), height=Cm(12.2))

    art_ui = 'baocaokhoaluan/assets/real_client_artifacts_section.png'
    if not os.path.exists(art_ui):
        art_ui = 'poster/assets/artifact_3d_lotus.jpg'
    if os.path.exists(art_ui):
        slide.shapes.add_picture(art_ui, Cm(2.4), Cm(89.8), width=Cm(38.0), height=Cm(17.8))

    tb_c3 = slide.shapes.add_textbox(Cm(2.2), Cm(108.0), Cm(38.4), Cm(4.8))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    p_c3 = tf_c3.paragraphs[0]
    r_c3 = p_c3.add_run()
    r_c3.text = "• Dual Engine System: Local CPU Engine (Multi-angle photos → SfM/COLMAP → Poisson Surface Reconstruction → MeshLab GLB) & Cloud AI Engine (Single image → Microsoft TRELLIS ZeroGPU → 3D PBR WebGL at 60 FPS)."
    r_c3.font.name = "Arial"
    r_c3.font.size = Pt(11.8)
    r_c3.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # CỘT 2 (RIGHT: X = 43.1cm, Width = 39.2cm, Height = 101.4cm, Y = 11.8cm -> 113.2cm)
    # =========================================================================

    # 4. Floor Plan & Dijkstra Shortest Path Navigation (Y = 11.8cm -> 33.8cm, H = 22.0cm)
    add_func_card(43.1, 11.8, 39.2, 22.0, "4. Floor Plan & Dijkstra Navigation", "Floor Plan & Pathfinding Flow")
    dijk_img = 'baocaokhoaluan/assets/diagrams/flow_02_floorplan_dijkstra.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, Cm(43.7), Cm(13.7), width=Cm(38.0), height=Cm(15.2))

    tb_c4 = slide.shapes.add_textbox(Cm(43.5), Cm(29.2), Cm(38.4), Cm(4.2))
    tf_c4 = tb_c4.text_frame
    tf_c4.word_wrap = True
    p_c4 = tf_c4.paragraphs[0]
    r_c4 = p_c4.add_run()
    r_c4.text = "• Graph Theory Navigation: 18 interconnected exhibition halls & 34 portal transitions modeled as an adjacency graph. Min-Heap Dijkstra algorithm computes optimal shortest path in < 5ms with glowing 3D navigational trails."
    r_c4.font.name = "Arial"
    r_c4.font.size = Pt(11.8)
    r_c4.font.color.rgb = C_TEXT_DARK

    # 5. Multilingual Translation & AI Voice TTS Pipeline (Y = 34.4cm -> 55.9cm, H = 21.5cm)
    add_func_card(43.1, 34.4, 39.2, 21.5, "5. Multilingual & AI Voice Guide Flow", "Translation & Audio Pipeline")
    voice_img = 'baocaokhoaluan/assets/diagrams/flow_03_languages_voice_ai.png'
    if os.path.exists(voice_img):
        slide.shapes.add_picture(voice_img, Cm(43.7), Cm(36.3), width=Cm(38.0), height=Cm(15.0))

    tb_c5 = slide.shapes.add_textbox(Cm(43.5), Cm(51.6), Cm(38.4), Cm(4.0))
    tf_c5 = tb_c5.text_frame
    tf_c5.word_wrap = True
    p_c5 = tf_c5.paragraphs[0]
    r_c5 = p_c5.add_run()
    r_c5.text = "• Automated AI Voice System: Dynamic multi-language translation across 7 international languages (Google Translate API) and neural speech synthesis (Google Cloud TTS Neural2), cached via Cloudinary CDN."
    r_c5.font.name = "Arial"
    r_c5.font.size = Pt(11.8)
    r_c5.font.color.rgb = C_TEXT_DARK

    # 6. VietQR PayOS Ticketing & Mobile QR Check-in (Y = 56.5cm -> 78.5cm, H = 22.0cm)
    add_func_card(43.1, 56.5, 39.2, 22.0, "6. VietQR Payment & Mobile Check-in", "PayOS VietQR & QR Check-in Flow")
    ticket_img = 'baocaokhoaluan/assets/diagrams/flow_05_ticketing_vietqr_qr.png'
    if os.path.exists(ticket_img):
        slide.shapes.add_picture(ticket_img, Cm(43.7), Cm(58.4), width=Cm(38.0), height=Cm(15.2))

    tb_c6 = slide.shapes.add_textbox(Cm(43.5), Cm(74.0), Cm(38.4), Cm(4.2))
    tf_c6 = tb_c6.text_frame
    tf_c6.word_wrap = True
    p_c6 = tf_c6.paragraphs[0]
    r_c6 = p_c6.add_run()
    r_c6.text = "• E-Commerce Ticketing & Fraud Prevention: Automated VietQR Napas 247 dynamic payment via PayOS with real-time HMAC-SHA256 webhook confirmation (< 1s). Real-time camera check-in validation in < 100ms."
    r_c6.font.name = "Arial"
    r_c6.font.size = Pt(11.8)
    r_c6.font.color.rgb = C_TEXT_DARK

    # 7. Experimental Evaluation & Google Lighthouse Audit (Y = 79.2cm -> 113.2cm, H = 34.0cm)
    add_func_card(43.1, 79.2, 39.2, 34.0, "7. Experimental Evaluation & Web Vitals", "SSRC Benchmarks & Performance")

    # 4 Khối KPI đo kiểm
    metrics_data = [
        ("295 req/s", "Peak Throughput\n(1000 Users)"),
        ("0.45%", "Stress Error Rate\n(Extreme Load)"),
        ("1.42s", "Lighthouse LCP\n(Score: 94/100)"),
        ("< 5ms", "Dijkstra Query\n(18 Halls Graph)")
    ]
    kpi_w = 9.1
    kpi_gap = 0.53
    for idx, (val, desc) in enumerate(metrics_data):
        kx = 43.7 + idx * (kpi_w + kpi_gap)
        kbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(kx), Cm(81.1), Cm(kpi_w), Cm(4.0))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = C_SUBTLE_BG
        kbox.line.color.rgb = C_CARD_BORDER
        kbox.line.width = Pt(1.0)

        ktb = slide.shapes.add_textbox(Cm(kx + 0.1), Cm(81.2), Cm(kpi_w - 0.2), Cm(3.8))
        ktf = ktb.text_frame
        ktf.word_wrap = True
        
        kp1 = ktf.paragraphs[0]
        kp1.alignment = PP_ALIGN.CENTER
        kr1 = kp1.add_run()
        kr1.text = val + "\n"
        kr1.font.name = "Arial"
        kr1.font.size = Pt(16.0)
        kr1.font.bold = True
        kr1.font.color.rgb = C_IUH_BLUE

        kp2 = ktf.add_paragraph()
        kp2.alignment = PP_ALIGN.CENTER
        kr2 = kp2.add_run()
        kr2.text = desc
        kr2.font.name = "Arial"
        kr2.font.size = Pt(10.0)
        kr2.font.color.rgb = C_NAVY_DEEP

    # Hình 4.40: Bảng điểm tròn Google Lighthouse Audit ("2 cái bảng gì tròn đó")
    lh_img = 'baocaokhoaluan/assets/diagrams/hinh_4_40_lighthouse.png'
    if not os.path.exists(lh_img):
        lh_img = 'baocaokhoaluan/assets/hinh_4_40_lighthouse.png'
    if os.path.exists(lh_img):
        slide.shapes.add_picture(lh_img, Cm(43.7), Cm(85.6), width=Cm(38.0), height=Cm(12.0))

    # 2 Biểu đồ đo kiểm Apache JMeter Throughput & Error Rate
    chart_tp = 'baocaokhoaluan/assets/diagrams/hinh_4_38_throughput.png'
    chart_err = 'baocaokhoaluan/assets/diagrams/hinh_4_39_error_rate.png'
    if os.path.exists(chart_tp):
        slide.shapes.add_picture(chart_tp, Cm(43.7), Cm(98.2), width=Cm(18.7), height=Cm(9.8))
    if os.path.exists(chart_err):
        slide.shapes.add_picture(chart_err, Cm(62.8), Cm(98.2), width=Cm(18.7), height=Cm(9.8))

    tb_c7 = slide.shapes.add_textbox(Cm(43.5), Cm(108.4), Cm(38.4), Cm(4.4))
    tf_c7 = tb_c7.text_frame
    tf_c7.word_wrap = True
    p_c7 = tf_c7.paragraphs[0]
    r_c7 = p_c7.add_run()
    r_c7.text = "• Field Stress Testing & Audit: Verified under 1000 concurrent users via Apache JMeter and Google Lighthouse audit. Delivers 99.55% availability, sub-2s mobile response over 4G cellular networks, and 60 FPS WebGL rendering."
    r_c7.font.name = "Arial"
    r_c7.font.size = Pt(11.8)
    r_c7.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # 3. FOOTER BOTTOM BAR (Y = 114.2cm, Height = 3.4cm, Width = 80.5cm)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(114.2), Cm(80.5), Cm(3.4))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_IUH_BLUE
    ftr_box.line.width = Pt(1.5)

    tb_ftr = slide.shapes.add_textbox(Cm(2.6), Cm(114.4), Cm(79.0), Cm(3.0))
    tf_f = tb_ftr.text_frame
    tf_f.word_wrap = True
    p_f = tf_f.paragraphs[0]
    p_f.alignment = PP_ALIGN.CENTER
    
    rf1 = p_f.add_run()
    rf1.text = "GRADUATION THESIS PROJECT — FACULTY OF INFORMATION TECHNOLOGY — INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    rf1.font.name = "Arial"
    rf1.font.size = Pt(12.5)
    rf1.font.bold = True
    rf1.font.color.rgb = C_WHITE

    rf2 = p_f.add_run()
    rf2.text = "Lead Architect: Huynh Tan Loc (0865 860 854) — Frontend Engineer: Trinh Vi Thanh (0389 002 845) | Email: huynhloc.dev@gmail.com | Field Site: Ho Chi Minh City Museum of History"
    rf2.font.name = "Arial"
    rf2.font.size = Pt(11.0)
    rf2.font.color.rgb = hex_to_rgb('CBD5E1')

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"PERFECT SCIENTIFIC POSTER SAVED SUCCESSFULLY TO: {out_file}")

if __name__ == '__main__':
    create_perfect_poster()
