# -*- coding: utf-8 -*-
"""
Script thiết kế Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Đề tài: HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM
Trường: Đại học Công nghiệp TP. Hồ Chí Minh (IUH) - Khoa Công nghệ Thông tin

Yêu cầu cốt lõi từ người dùng:
1. Tập trung tối đa vào CHỨC NĂNG và CÁC SƠ ĐỒ LUỒNG HOẠT ĐỘNG (Kiến trúc, Tạo không gian 360, Tái tạo 3D, Tìm đường Dijkstra, Dịch thuật & Voice AI, Thanh toán VietQR & Soát vé).
2. Tích hợp phần đánh giá thống kê đo kiểm hiệu năng (JMeter Throughput, Error Rate, Lighthouse) trực quan như báo cáo SSRC.
3. Không màu mè (Nền trắng tinh khiết chuẩn in ấn, viền thanh nhã, gam màu Xanh IUH & Than chì học thuật).
4. Text ngắn gọn, tinh gọn, không rườm rà, giải thích đúng trọng tâm.
5. Bố cục khít khao, không thừa khoảng trống, lấp đầy trang A0 cân đối và chuyên nghiệp.
6. Header và Footer chuẩn mực theo thông tin chính thức của nhóm và trường.
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

# Bảng màu học thuật tối giản, sang trọng (KHÔNG MÀU MÈ)
C_BG_PAGE     = hex_to_rgb('FFFFFF')  # Nền trang trắng tinh khiết chuẩn in ấn A0
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Nền card trắng tinh tế
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Viền card mỏng, thanh nhã (Slate nhạt)
C_HEADER_BG   = hex_to_rgb('FFFFFF')  # Header nền trắng đồng bộ
C_IUH_BLUE    = hex_to_rgb('005BAA')  # Xanh IUH chính thức
C_NAVY_DEEP   = hex_to_rgb('0F2942')  # Xanh Navy đậm chủ đạo
C_TEXT_DARK   = hex_to_rgb('0F172A')  # Chữ than chì sắc nét
C_TEXT_MUTED  = hex_to_rgb('475569')  # Chữ phụ đề trung tính dễ đọc
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Chân trang xanh Navy vững chãi
C_WHITE       = hex_to_rgb('FFFFFF')  # Chữ trắng cho footer
C_SUBTLE_BG   = hex_to_rgb('F8FAFC')  # Nền phụ trợ cho các khối nhỏ

def create_functional_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. NỀN TOÀN TRANG TRẮNG TINH KHIẾT (Chuẩn poster khoa học, tiết kiệm mực in)
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = C_BG_PAGE
    bg_shape.line.fill.background()

    # =========================================================================
    # 2. HEADER TOP BANNER (Y = 1.4cm, Height = 10.8cm, Width = 80.5cm)
    # =========================================================================
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(1.4), Cm(80.5), Cm(10.8))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_HEADER_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(1.5)

    # Logo IUH góc trái Header (Tỷ lệ tự nhiên W=11.2cm, H=4.01cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.2), Cm(2.4), width=Cm(11.2), height=Cm(4.01))

    # Khối giữa: Tên Trường, Khoa và Tiêu đề Đề tài
    mid_tb = slide.shapes.add_textbox(Cm(15.2), Cm(1.7), Cm(47.5), Cm(10.2))
    tf_m = mid_tb.text_frame
    tf_m.word_wrap = True

    p_u1 = tf_m.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "BỘ CÔNG THƯƠNG — TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(16.0)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_IUH_BLUE

    p_u2 = tf_m.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "KHOA CÔNG NGHỆ THÔNG TIN — BỘ MÔN KỸ THUẬT PHẦN MỀM\n\n"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(13.5)
    r_u2.font.bold = True
    r_u2.font.color.rgb = C_NAVY_DEEP

    p_t1 = tf_m.add_paragraph()
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(21.0)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_NAVY_DEEP

    p_t2 = tf_m.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(19.0)
    r_t2.font.bold = True
    r_t2.font.color.rgb = C_IUH_BLUE

    # Khối bên phải: Giảng viên hướng dẫn & Sinh viên thực hiện
    meta_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(63.5), Cm(1.9), Cm(17.8), Cm(9.8))
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = C_SUBTLE_BG
    meta_box.line.color.rgb = C_CARD_BORDER
    meta_box.line.width = Pt(1.0)

    meta_tb = slide.shapes.add_textbox(Cm(63.8), Cm(2.1), Cm(17.2), Cm(9.4))
    tf_meta = meta_tb.text_frame
    tf_meta.word_wrap = True

    p_gv = tf_meta.paragraphs[0]
    r_gv_lbl = p_gv.add_run()
    r_gv_lbl.text = "GV Hướng dẫn:\n"
    r_gv_lbl.font.name = "Arial"
    r_gv_lbl.font.size = Pt(12.0)
    r_gv_lbl.font.bold = True
    r_gv_lbl.font.color.rgb = C_IUH_BLUE
    r_gv_val = p_gv.add_run()
    r_gv_val.text = "TS. Trần Thị Minh Khoa\n\n"
    r_gv_val.font.name = "Arial"
    r_gv_val.font.size = Pt(14.5)
    r_gv_val.font.bold = True
    r_gv_val.font.color.rgb = C_NAVY_DEEP

    p_sv = tf_meta.add_paragraph()
    r_sv_lbl = p_sv.add_run()
    r_sv_lbl.text = "Sinh viên thực hiện:\n"
    r_sv_lbl.font.name = "Arial"
    r_sv_lbl.font.size = Pt(12.0)
    r_sv_lbl.font.bold = True
    r_sv_lbl.font.color.rgb = C_IUH_BLUE

    r_sv1 = p_sv.add_run()
    r_sv1.text = "• Huỳnh Tấn Lộc (22686171)\n"
    r_sv1.font.name = "Arial"
    r_sv1.font.size = Pt(13.5)
    r_sv1.font.bold = True
    r_sv1.font.color.rgb = C_TEXT_DARK

    r_sv2 = p_sv.add_run()
    r_sv2.text = "• Trịnh Vĩ Thành (22689411)\n"
    r_sv2.font.name = "Arial"
    r_sv2.font.size = Pt(13.5)
    r_sv2.font.bold = True
    r_sv2.font.color.rgb = C_TEXT_DARK

    r_cls = p_sv.add_run()
    r_cls.text = "Lớp: DHCNTT18ATT (2022 — 2026)"
    r_cls.font.name = "Arial"
    r_cls.font.size = Pt(11.5)
    r_cls.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # HÀM TẠO CARD CHỨC NĂNG (Gọn gàng, tinh tế, chữ to, viền mảnh)
    # =========================================================================
    def add_func_card(x, y, w, h, title_text, badge_text=""):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Tiêu đề Card: Chữ Navy đậm đà, tối giản
        tb = slide.shapes.add_textbox(Cm(x + 0.6), Cm(y + 0.35), Cm(w - 1.2), Cm(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(18.0)
        r.font.bold = True
        r.font.color.rgb = C_NAVY_DEEP

        if badge_text:
            r_b = p.add_run()
            r_b.text = f"  [{badge_text}]"
            r_b.font.name = "Arial"
            r_b.font.size = Pt(13.0)
            r_b.font.bold = True
            r_b.font.color.rgb = C_IUH_BLUE

        # Đường gạch chân tiêu đề màu Xanh IUH
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.6), Cm(y + 1.6), Cm(4.5), Cm(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = C_IUH_BLUE
        bar.line.fill.background()

        return card

    # =========================================================================
    # CỘT TRÁI (COL 1: X = 1.8cm, Width = 39.2cm, Chiều cao = 100.0cm)
    # =========================================================================

    # 1. Sơ đồ Kiến trúc hệ thống 3 tầng tổng thể
    # Y = 13.0cm -> 38.5cm (Cao 25.5cm)
    add_func_card(1.8, 13.0, 39.2, 25.5, "1. Kiến trúc hệ thống 3 tầng tổng thể", "3-Tier Hybrid Architecture")
    arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(2.4), Cm(15.0), width=Cm(38.0), height=Cm(18.0))

    tb_c1 = slide.shapes.add_textbox(Cm(2.2), Cm(33.4), Cm(38.4), Cm(4.8))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    p_c1 = tf_c1.paragraphs[0]
    r_c1 = p_c1.add_run()
    r_c1.text = "• Kiến trúc 3 tầng: Client WebGL Three.js (React 18), API Gateway Node.js và CSDL lai PostgreSQL 16 (chuẩn ACID vé & giao dịch) + MongoDB 7.0 (siêu dữ liệu 360° & cổ vật) + Bộ nhớ đệm Redis Cache."
    r_c1.font.name = "Arial"
    r_c1.font.size = Pt(12.5)
    r_c1.font.color.rgb = C_TEXT_DARK

    # 2. Quy trình ghép ảnh không gian 360° Panorama
    # Y = 39.3cm -> 75.3cm (Cao 36.0cm)
    add_func_card(1.8, 39.3, 39.2, 36.0, "2. Quy trình ghép ảnh không gian 360°", "360° Panorama Stitching Flow")
    stitch_img = 'baocaokhoaluan/assets/diagrams/flow_01_stitching_process.png'
    if os.path.exists(stitch_img):
        slide.shapes.add_picture(stitch_img, Cm(2.4), Cm(41.3), width=Cm(38.0), height=Cm(15.3))

    # Đặt thêm ảnh chụp thực tế giao diện Tour 360° để minh chứng kết quả
    tour_ui_img = 'poster/assets/tour360_interface.jpg'
    if os.path.exists(tour_ui_img):
        slide.shapes.add_picture(tour_ui_img, Cm(2.4), Cm(57.2), width=Cm(38.0), height=Cm(13.2))

    tb_c2 = slide.shapes.add_textbox(Cm(2.2), Cm(70.8), Cm(38.4), Cm(4.2))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    r_c2 = p_c2.add_run()
    r_c2.text = "• Luồng xử lý đa nguồn (Video lia máy/Webcam/DSLR): Nắn ảnh trụ (Cylindrical Warping) → Trích xuất DoG SIFT → Khớp RANSAC → Tối ưu ma trận Homography → Hòa trộn Multiband Blending xuất ảnh 8K Equirectangular."
    r_c2.font.name = "Arial"
    r_c2.font.size = Pt(12.2)
    r_c2.font.color.rgb = C_TEXT_DARK

    # 3. Tái tạo hiện vật di sản 3D (Động cơ kép CPU Colmap & Cloud AI TRELLIS)
    # Y = 76.1cm -> 113.0cm (Cao 36.9cm)
    add_func_card(1.8, 76.1, 39.2, 36.9, "3. Tái tạo hiện vật di sản 3D đa động cơ", "Dual-Engine 3D Reconstruction")
    d3_img = 'baocaokhoaluan/assets/diagrams/flow_04_dual_engine_3d.png'
    if os.path.exists(d3_img):
        slide.shapes.add_picture(d3_img, Cm(2.4), Cm(78.1), width=Cm(38.0), height=Cm(12.2))

    # Đặt thêm ảnh cổ vật 3D thực tế chiêm ngưỡng
    art_ui = 'baocaokhoaluan/assets/real_client_artifacts_section.png'
    if not os.path.exists(art_ui):
        art_ui = 'poster/assets/artifact_3d_lotus.jpg'
    if os.path.exists(art_ui):
        slide.shapes.add_picture(art_ui, Cm(2.4), Cm(90.8), width=Cm(38.0), height=Cm(16.5))

    tb_c3 = slide.shapes.add_textbox(Cm(2.2), Cm(107.8), Cm(38.4), Cm(5.0))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    p_c3 = tf_c3.paragraphs[0]
    r_c3 = p_c3.add_run()
    r_c3.text = "• Động cơ kép linh hoạt: Local CPU (Ảnh góc rộng → SfM/COLMAP → Poisson MeshLab → Mô hình GLB) và Cloud AI (Ảnh đơn → Microsoft TRELLIS ZeroGPU → Tái tạo 3D PBR tương tác xoay 360° chuẩn 60 FPS)."
    r_c3.font.name = "Arial"
    r_c3.font.size = Pt(12.2)
    r_c3.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 43.1cm, Width = 39.2cm, Chiều cao = 100.0cm)
    # =========================================================================

    # 4. Sơ đồ mặt bằng & Thuật toán tìm đường Dijkstra
    # Y = 13.0cm -> 37.5cm (Cao 24.5cm)
    add_func_card(43.1, 13.0, 39.2, 24.5, "4. Sơ đồ mặt bằng & Định tuyến Dijkstra", "Floor Plan & Shortest Path Flow")
    dijk_img = 'baocaokhoaluan/assets/diagrams/flow_02_floorplan_dijkstra.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, Cm(43.7), Cm(15.0), width=Cm(38.0), height=Cm(18.3))

    tb_c4 = slide.shapes.add_textbox(Cm(43.5), Cm(33.8), Cm(38.4), Cm(3.5))
    tf_c4 = tb_c4.text_frame
    tf_c4.word_wrap = True
    p_c4 = tf_c4.paragraphs[0]
    r_c4 = p_c4.add_run()
    r_c4.text = "• Đồ thị liên thông 18 phòng trưng bày & 34 cửa kết nối: Hàng đợi ưu tiên Min-Heap tính toán lộ trình ngắn nhất < 5ms, tự động vẽ vệt sáng 3D dẫn đường trực quan cho khách tham quan."
    r_c4.font.name = "Arial"
    r_c4.font.size = Pt(12.2)
    r_c4.font.color.rgb = C_TEXT_DARK

    # 5. Dịch thuật đa ngôn ngữ & Trợ lý giọng nói AI Voice TTS
    # Y = 38.3cm -> 62.8cm (Cao 24.5cm)
    add_func_card(43.1, 38.3, 39.2, 24.5, "5. Dịch thuật 7 ngôn ngữ & Giọng nói AI", "Multilingual & Voice TTS Pipeline")
    voice_img = 'baocaokhoaluan/assets/diagrams/flow_03_languages_voice_ai.png'
    if os.path.exists(voice_img):
        slide.shapes.add_picture(voice_img, Cm(43.7), Cm(40.3), width=Cm(38.0), height=Cm(18.3))

    tb_c5 = slide.shapes.add_textbox(Cm(43.5), Cm(59.1), Cm(38.4), Cm(3.5))
    tf_c5 = tb_c5.text_frame
    tf_c5.word_wrap = True
    p_c5 = tf_c5.paragraphs[0]
    r_c5 = p_c5.add_run()
    r_c5.text = "• Tự động dịch thuật 7 ngôn ngữ (Google Translate API) và tổng hợp giọng thuyết minh di sản tự nhiên (Google Cloud TTS Neural2), lưu trữ đám mây CDN Cloudinary phục vụ phát thanh tức thì."
    r_c5.font.name = "Arial"
    r_c5.font.size = Pt(12.2)
    r_c5.font.color.rgb = C_TEXT_DARK

    # 6. Bán vé số VietQR Napas & Soát vé camera QR di động
    # Y = 63.6cm -> 88.1cm (Cao 24.5cm)
    add_func_card(43.1, 63.6, 39.2, 24.5, "6. Bán vé VietQR & Soát vé camera QR", "PayOS VietQR & QR Check-in Flow")
    ticket_img = 'baocaokhoaluan/assets/diagrams/flow_05_ticketing_vietqr_qr.png'
    if os.path.exists(ticket_img):
        slide.shapes.add_picture(ticket_img, Cm(43.7), Cm(65.6), width=Cm(38.0), height=Cm(18.2))

    tb_c6 = slide.shapes.add_textbox(Cm(43.5), Cm(84.4), Cm(38.4), Cm(3.5))
    tf_c6 = tb_c6.text_frame
    tf_c6.word_wrap = True
    p_c6 = tf_c6.paragraphs[0]
    r_c6 = p_c6.add_run()
    r_c6.text = "• Bán vé tự động VietQR Napas 247 qua cổng PayOS, xác thực tức thì qua Webhook HMAC-SHA256 trong < 1s. Soát vé bằng camera điện thoại HTML5-QRCode < 100ms, chống quét trùng lặp."
    r_c6.font.name = "Arial"
    r_c6.font.size = Pt(12.2)
    r_c6.font.color.rgb = C_TEXT_DARK

    # 7. Đánh giá thực nghiệm & Thống kê đo kiểm hiệu năng (Chuẩn SSRC)
    # Y = 88.9cm -> 113.0cm (Cao 24.1cm)
    add_func_card(43.1, 88.9, 39.2, 24.1, "7. Đánh giá thực nghiệm & Đo kiểm hiệu năng", "SSRC Benchmarks & Performance")

    # 4 Khối KPI đo kiểm nổi bật (Gọn gàng, thanh lịch, chuẩn mực)
    metrics_data = [
        ("295 req/s", "Thông lượng đỉnh\n(JMeter 1000 Users)"),
        ("0.45%", "Tỷ lệ lỗi chịu tải\n(High Concurrency)"),
        ("1.42s", "Lighthouse: 94/100\n(Tối ưu LCP di động)"),
        ("< 5ms", "Dijkstra 18 phòng\n(Phản hồi tức thì)")
    ]
    kpi_w = 9.1
    kpi_gap = 0.53
    for idx, (val, desc) in enumerate(metrics_data):
        kx = 43.7 + idx * (kpi_w + kpi_gap)
        kbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(kx), Cm(90.9), Cm(kpi_w), Cm(4.3))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = C_SUBTLE_BG
        kbox.line.color.rgb = C_CARD_BORDER
        kbox.line.width = Pt(1.0)

        ktb = slide.shapes.add_textbox(Cm(kx + 0.1), Cm(91.0), Cm(kpi_w - 0.2), Cm(4.1))
        ktf = ktb.text_frame
        ktf.word_wrap = True
        
        kp1 = ktf.paragraphs[0]
        kp1.alignment = PP_ALIGN.CENTER
        kr1 = kp1.add_run()
        kr1.text = val + "\n"
        kr1.font.name = "Arial"
        kr1.font.size = Pt(16.5)
        kr1.font.bold = True
        kr1.font.color.rgb = C_IUH_BLUE

        kp2 = ktf.add_paragraph()
        kp2.alignment = PP_ALIGN.CENTER
        kr2 = kp2.add_run()
        kr2.text = desc
        kr2.font.name = "Arial"
        kr2.font.size = Pt(10.5)
        kr2.font.color.rgb = C_NAVY_DEEP

    # 2 Biểu đồ đo kiểm hiệu năng thực tế đặt song song
    chart_tp = 'baocaokhoaluan/assets/diagrams/hinh_4_38_throughput.png'
    chart_err = 'baocaokhoaluan/assets/diagrams/hinh_4_39_error_rate.png'
    if os.path.exists(chart_tp):
        slide.shapes.add_picture(chart_tp, Cm(43.7), Cm(95.6), width=Cm(18.7), height=Cm(10.5))
    if os.path.exists(chart_err):
        slide.shapes.add_picture(chart_err, Cm(62.8), Cm(95.6), width=Cm(18.7), height=Cm(10.5))

    tb_c7 = slide.shapes.add_textbox(Cm(43.5), Cm(106.6), Cm(38.4), Cm(5.8))
    tf_c7 = tb_c7.text_frame
    tf_c7.word_wrap = True
    p_c7 = tf_c7.paragraphs[0]
    r_c7 = p_c7.add_run()
    r_c7.text = "• Đo kiểm thực tế (Apache JMeter & Google Lighthouse): Hệ thống vận hành ổn định đạt 99.55%, thời gian phản hồi dưới 2 giây trên mạng di động 4G tại khuôn viên bảo tàng, sẵn sàng phục vụ chuyển đổi số du lịch di sản."
    r_c7.font.name = "Arial"
    r_c7.font.size = Pt(12.2)
    r_c7.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # 3. FOOTER BOTTOM BAR (Y = 113.8cm, Height = 3.8cm, Width = 80.5cm)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(113.8), Cm(80.5), Cm(3.8))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_IUH_BLUE
    ftr_box.line.width = Pt(1.5)

    # Chữ trong Footer chia 3 cột cân xứng
    tb_ftr = slide.shapes.add_textbox(Cm(2.6), Cm(114.1), Cm(79.0), Cm(3.2))
    tf_f = tb_ftr.text_frame
    tf_f.word_wrap = True
    p_f = tf_f.paragraphs[0]
    p_f.alignment = PP_ALIGN.CENTER
    
    rf1 = p_f.add_run()
    rf1.text = "ĐỀ TÀI KHÓA LUẬN TỐT NGHIỆP ĐẠI HỌC — KHOA CÔNG NGHỆ THÔNG TIN — ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\n"
    rf1.font.name = "Arial"
    rf1.font.size = Pt(13.0)
    rf1.font.bold = True
    rf1.font.color.rgb = C_WHITE

    rf2 = p_f.add_run()
    rf2.text = "Sinh viên: Huỳnh Tấn Lộc (0865 860 854) — Trịnh Vĩ Thành (0389 002 845) | Email: huynhloc.dev@gmail.com | Địa điểm thực địa: Bảo tàng Lịch sử TP.HCM"
    rf2.font.name = "Arial"
    rf2.font.size = Pt(11.5)
    rf2.font.color.rgb = hex_to_rgb('CBD5E1')

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"POSTER CHỨC NĂNG & SƠ ĐỒ LUỒNG ĐÃ ĐƯỢC TẠO THÀNH CÔNG TẠI: {out_file}")

if __name__ == '__main__':
    create_functional_poster()
