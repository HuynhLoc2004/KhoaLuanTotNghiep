# -*- coding: utf-8 -*-
"""
Script tao file PowerPoint Poster Khoa luan Tot nghiep chuan A0 doc (84.1cm x 118.9cm)
Danh cho nhom sinh vien: Huynh Tan Loc & Trinh Vi Thanh
GVHD: TS. Tran Thi Minh Khoa - Khoa CNTT, Truong Dai hoc Cong nghiep TP.HCM (IUH)
"""

import os
import pptx
from pptx.util import Inches, Pt, Cm
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return RGBColor(*(int(hex_str[i:i+2], 16) for i in (0, 2, 4)))

# Mau sac chu dao (Navy Blue - IUH Tech Academic Palette)
C_BG = hex_to_rgb('071124')          # Nen tong the xanh den huyen bi
C_HEADER_BG = hex_to_rgb('0B1D3A')   # Nen thanh Header tren cung
C_CARD_BG = hex_to_rgb('0D2347')     # Nen card noi dung
C_CARD_BORDER = hex_to_rgb('1E40AF') # Vien card xanh duong noi bat
C_CYAN_ACCENT = hex_to_rgb('38BDF8') # Mau xanh cyan phat sang
C_GOLD_ACCENT = hex_to_rgb('F59E0B') # Mau vang hoang gia di san
C_TEXT_WHITE = hex_to_rgb('FFFFFF')  # Chu trang ro net
C_TEXT_LIGHT = hex_to_rgb('E2E8F0')  # Chu xam sang
C_TEXT_MUTED = hex_to_rgb('94A3B8')  # Chu xam nhe chu thich
C_GREEN_OK = hex_to_rgb('10B981')    # Xanh la cho chi so dat chuan

def create_poster():
    prs = pptx.Presentation()
    # Kich thuoc chuan A0 doc quoc te
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. Background toan bo slide
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = C_BG
    bg_shape.line.fill.background()

    # 2. HEADER TOP BANNER (Y = 1.2cm, Height = 13.8cm, Width = 80.5cm)
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(1.2), Cm(80.5), Cm(13.8))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_HEADER_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(2.5)

    # Logo IUH Top Left
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.2), Cm(2.2), width=Cm(11.5))

    # Header University Info (Center Top)
    uni_box = slide.shapes.add_textbox(Cm(16.0), Cm(1.6), Cm(64.5), Cm(3.2))
    tf_u = uni_box.text_frame
    tf_u.word_wrap = True
    p1 = tf_u.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    r1 = p1.add_run()
    r1.text = "BỘ CÔNG THƯƠNG — TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\n"
    r1.font.name = "Arial"
    r1.font.size = Pt(21)
    r1.font.bold = True
    r1.font.color.rgb = C_TEXT_WHITE

    p2 = tf_u.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run()
    r2.text = "KHOA CÔNG NGHỆ THÔNG TIN — BỘ MÔN KỸ THUẬT PHẦN MỀM"
    r2.font.name = "Arial"
    r2.font.size = Pt(18)
    r2.font.bold = True
    r2.font.color.rgb = C_CYAN_ACCENT

    # Divider line in header
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(3.2), Cm(5.2), Cm(77.5), Cm(0.08))
    line.fill.solid()
    line.fill.fore_color.rgb = hex_to_rgb('2563EB')
    line.line.fill.background()

    # Left: Instructor & Student Info (Under divider)
    info_box = slide.shapes.add_textbox(Cm(3.2), Cm(5.6), Cm(24.5), Cm(8.8))
    tf_i = info_box.text_frame
    tf_i.word_wrap = True
    
    p_inst = tf_i.paragraphs[0]
    r_in_l = p_inst.add_run()
    r_in_l.text = "Giảng viên hướng dẫn:\n"
    r_in_l.font.name = "Arial"
    r_in_l.font.size = Pt(16)
    r_in_l.font.color.rgb = C_GOLD_ACCENT
    r_in_n = p_inst.add_run()
    r_in_n.text = "TS. TRẦN THỊ MINH KHOA\n\n"
    r_in_n.font.name = "Arial"
    r_in_n.font.size = Pt(19)
    r_in_n.font.bold = True
    r_in_n.font.color.rgb = C_TEXT_WHITE

    p_st = tf_i.add_paragraph()
    r_st_l = p_st.add_run()
    r_st_l.text = "Sinh viên thực hiện:\n"
    r_st_l.font.name = "Arial"
    r_st_l.font.size = Pt(16)
    r_st_l.font.color.rgb = C_CYAN_ACCENT
    
    r_st1 = p_st.add_run()
    r_st1.text = "• Huỳnh Tấn Lộc   — MSSV: 22686171\n"
    r_st1.font.name = "Arial"
    r_st1.font.size = Pt(17)
    r_st1.font.bold = True
    r_st1.font.color.rgb = C_TEXT_WHITE

    r_st2 = p_st.add_run()
    r_st2.text = "• Trịnh Vĩ Thành   — MSSV: 22689411\n"
    r_st2.font.name = "Arial"
    r_st2.font.size = Pt(17)
    r_st2.font.bold = True
    r_st2.font.color.rgb = C_TEXT_WHITE

    r_cls = p_st.add_run()
    r_cls.text = "Lớp: DHCNTT18ATT — Khóa: 2022 - 2026"
    r_cls.font.name = "Arial"
    r_cls.font.size = Pt(15)
    r_cls.font.italic = True
    r_cls.font.color.rgb = C_TEXT_MUTED

    # Right: Project Main Title
    title_box = slide.shapes.add_textbox(Cm(28.5), Cm(5.6), Cm(52.2), Cm(8.8))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True

    p_t1 = tf_t.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° VÀ SỐ HÓA\nKHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(28)
    r_t1.font.bold = True
    r_t1.font.color.rgb = hex_to_rgb('60A5FA')

    p_t2 = tf_t.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "A 360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM FOR HO CHI MINH CITY MUSEUM OF HISTORY"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(16.5)
    r_t2.font.bold = True
    r_t2.font.italic = True
    r_t2.font.color.rgb = C_GOLD_ACCENT

    # =========================================================================
    # HELPER: Tao Card voi Tieu de phong cach chuyen nghiep
    # =========================================================================
    def add_card(x, y, w, h, title_text, icon_tag=""):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.8)

        # Header bar ben trong card
        tb = slide.shapes.add_textbox(Cm(x + 0.6), Cm(y + 0.3), Cm(w - 1.2), Cm(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = f"{icon_tag} {title_text}".strip()
        r.font.name = "Arial"
        r.font.size = Pt(20)
        r.font.bold = True
        r.font.color.rgb = C_CYAN_ACCENT

        # Line chan tieu de
        sep = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.8), Cm(y + 1.8), Cm(w - 1.6), Cm(0.05))
        sep.fill.solid()
        sep.fill.fore_color.rgb = hex_to_rgb('1E3A8A')
        sep.line.fill.background()
        return card

    # =========================================================================
    # COT TRÁI (COL 1: X = 1.8cm, Width = 39.5cm)
    # =========================================================================

    # 1. Mục tiêu đề tài (Targets / Objectives)
    add_card(1.8, 15.6, 39.5, 12.0, "MỤC TIÊU NGHIÊN CỨU & PHÁT TRIỂN", "[01]")
    tb_c1 = slide.shapes.add_textbox(Cm(2.4), Cm(17.8), Cm(38.2), Cm(9.4))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    targets = [
        ("Số hóa toàn diện di sản: ", "Số hóa hoàn chỉnh 18 gian phòng trưng bày liên hoàn và 17 cổ vật tiêu biểu (Trống đồng, Tượng Phật Champa, Phù điêu Óc Eo...) tại Bảo tàng Lịch sử TP.HCM."),
        ("Làm chủ chuỗi thuật toán xử lý ảnh: ", "Xây dựng phân hệ Panorama Studio ghép ảnh toàn cảnh 360° từ 4 nguồn đầu vào (Webcam, DSLR, Video lia máy, Con quay hồi chuyển Gyroscope)."),
        ("Tối ưu hóa định tuyến bảo tàng: ", "Hiện thực giải thuật Dijkstra với hàng đợi ưu tiên Min-Heap trên đồ thị 18 phòng và 34 hành lang liên thông, thời gian tính toán < 5ms."),
        ("Tự động hóa thương mại điện tử di sản: ", "Tích hợp cổng thanh toán VietQR Napas 247 qua PayOS (xác thực Webhook HMAC-SHA256) và soát vé QR trực tiếp bằng camera điện thoại qua HTML5-QRCode.")
    ]
    for idx, (bld, txt) in enumerate(targets):
        p = tf_c1.paragraphs[0] if idx == 0 else tf_c1.add_paragraph()
        p.space_after = Pt(6)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(14)
        r_b.font.bold = True
        r_b.font.color.rgb = C_GOLD_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13.5)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # 2. Kiến trúc hệ thống (System Architecture)
    add_card(1.8, 28.2, 39.5, 23.5, "KIẾN TRÚC PHẦN MỀM & DỮ LIỆU LAI", "[02]")
    arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(2.4), Cm(30.4), width=Cm(38.2))
    
    tb_arch = slide.shapes.add_textbox(Cm(2.4), Cm(44.2), Cm(38.2), Cm(7.0))
    tf_a = tb_arch.text_frame
    tf_a.word_wrap = True
    arch_points = [
        ("Kiến trúc phân tầng 3 lớp (3-Tier): ", "Frontend SPA (React 18 + Vite), Backend RESTful API (Node.js v20 LTS + TypeScript) và Cổng kết nối Nginx Reverse Proxy."),
        ("Chiến lược lưu trữ CSDL lai (Polyglot Persistence): ", "PostgreSQL 16 quản lý giao dịch vé và bảo mật ACID; MongoDB 7.0 lưu trữ phân cấp không gian 360°, điểm Hotspot và mô hình 3D; Redis In-Memory đệm dữ liệu phản hồi < 2ms."),
        ("Hạ tầng đám mây & CI/CD: ", "Đóng gói Docker Compose, tự động triển khai GitHub Actions lên máy chủ Cloud VPS.")
    ]
    for idx, (bld, txt) in enumerate(arch_points):
        p = tf_a.paragraphs[0] if idx == 0 else tf_a.add_paragraph()
        p.space_after = Pt(4)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_CYAN_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # 3. Không gian ảo 360° & Mô hình 3D cổ vật
    add_card(1.8, 52.3, 39.5, 31.0, "KHÔNG GIAN ẢO 360° & SỐ HÓA HIỆN VẬT 3D", "[03]")
    # Anh giao dien 360
    t360_img = 'baocaokhoaluan/assets/real_client_interactive_tour360.png'
    if os.path.exists(t360_img):
        slide.shapes.add_picture(t360_img, Cm(2.4), Cm(54.5), width=Cm(38.2))
    
    # Anh co vat 3D
    art_img = 'baocaokhoaluan/assets/real_client_artifacts_section.png'
    if os.path.exists(art_img):
        slide.shapes.add_picture(art_img, Cm(2.4), Cm(68.5), width=Cm(38.2))

    tb_v = slide.shapes.add_textbox(Cm(2.4), Cm(78.5), Cm(38.2), Cm(4.4))
    tf_v = tb_v.text_frame
    tf_v.word_wrap = True
    p_v = tf_v.paragraphs[0]
    r_v = p_v.add_run()
    r_v.text = "• Giao diện WebGL Three.js đạt chuẩn 60 FPS, chuyển phòng mượt mà qua Hotspots định hướng Yaw/Pitch.\n• Tái tạo hiện vật 3D với 2 động cơ: Local Photogrammetry (CPU) và Cloud AI TRELLIS ZeroGPU A100 (.GLB PBR)."
    r_v.font.name = "Arial"
    r_v.font.size = Pt(13.5)
    r_v.font.color.rgb = C_TEXT_WHITE

    # 4. Quy trình thuật toán xử lý ảnh Panorama
    add_card(1.8, 83.9, 39.5, 25.2, "QUY TRÌNH THUẬT TOÁN GHÉP ẢNH PANORAMA 360°", "[04]")
    pano_img = 'baocaokhoaluan/assets/diagrams/hinh_4_3_panorama_4inputs.png'
    if os.path.exists(pano_img):
        slide.shapes.add_picture(pano_img, Cm(2.4), Cm(86.1), width=Cm(38.2))
    
    tb_alg = slide.shapes.add_textbox(Cm(2.4), Cm(99.8), Cm(38.2), Cm(8.8))
    tf_alg = tb_alg.text_frame
    tf_alg.word_wrap = True
    algs = [
        ("Nắn trụ (Cylindrical Warping): ", "f = W / (2·tan(FOV/2)), x_cyl = f·arctan(x/f), triệt tiêu độ cong mép ảnh."),
        ("Trích xuất đặc trưng & Lọc nhiễu: ", "Thuật toán SIFT trích xuất vector 128D; RANSAC loại bỏ hoàn toàn điểm ngoại lai Outliers."),
        ("Cắt mí & Hòa trộn đa dải tần: ", "Tối ưu đường cắt Voronoi né hiện vật; hòa trộn tháp Multiband Laplacian khử triệt để vết mí ghép.")
    ]
    for idx, (bld, txt) in enumerate(algs):
        p = tf_alg.paragraphs[0] if idx == 0 else tf_alg.add_paragraph()
        p.space_after = Pt(3)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_GOLD_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 42.8cm, Width = 39.5cm)
    # =========================================================================

    # 1. Tóm tắt đề tài (Abstracts)
    add_card(42.8, 15.6, 39.5, 12.0, "TÓM TẮT ĐỀ TÀI (ABSTRACTS)", "[05]")
    tb_abs = slide.shapes.add_textbox(Cm(43.4), Cm(17.8), Cm(38.2), Cm(9.4))
    tf_abs = tb_abs.text_frame
    tf_abs.word_wrap = True
    p_abs1 = tf_abs.paragraphs[0]
    p_abs1.space_after = Pt(6)
    r_abs1 = p_abs1.add_run()
    r_abs1.text = "Trong bối cảnh thực hiện Quyết định số 749/QĐ-TTg của Thủ tướng Chính phủ về Chuyển đổi số quốc gia, đề tài tập trung nghiên cứu và hiện thực hóa hệ sinh thái số hóa di sản bảo tàng toàn diện tại Bảo tàng Lịch sử TP. Hồ Chí Minh."
    r_abs1.font.name = "Arial"
    r_abs1.font.size = Pt(13.5)
    r_abs1.font.color.rgb = C_TEXT_LIGHT

    p_abs2 = tf_abs.add_paragraph()
    r_abs2 = p_abs2.add_run()
    r_abs2.text = "Hệ thống kết hợp hài hòa giữa Thị giác máy tính (ghép ảnh 360° từ video quét phòng bằng smartphone), Đồ họa WebGL Three.js, Định tuyến Dijkstra, Trợ lý AI hội thoại RAG và Thương mại điện tử vé số VietQR Napas 247. Giải pháp đem lại trải nghiệm tham quan sống động, chi phí thấp, không phụ thuộc vào thiết bị camera 360° đắt tiền."
    r_abs2.font.name = "Arial"
    r_abs2.font.size = Pt(13.5)
    r_abs2.font.color.rgb = C_TEXT_LIGHT

    # 2. Quy trình thực hiện (Procedure - 6 giai đoạn)
    add_card(42.8, 28.2, 39.5, 10.8, "QUY TRÌNH THỰC HIỆN DỰ ÁN (6 GIAI ĐOẠN)", "[06]")
    # Ve 6 box tien trinh nam ngang
    step_labels = [
        ("01", "Khảo sát thực địa\n18 gian phòng"),
        ("02", "Thu thập dữ liệu\nảnh & video quét"),
        ("03", "Nghiên cứu toán học\nSIFT & Dijkstra"),
        ("04", "Lập trình hệ thống\nReact 18 & Node.js"),
        ("05", "Đo kiểm tải JMeter\n& Tối ưu hóa Web"),
        ("06", "Đánh giá nghiệm thu\n& Bàn giao bảo tàng")
    ]
    box_w = 6.0
    gap = 0.35
    for i, (stt, lbl) in enumerate(step_labels):
        bx = 43.4 + i * (box_w + gap)
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(bx), Cm(30.6), Cm(box_w), Cm(7.6))
        s_box.fill.solid()
        s_box.fill.fore_color.rgb = hex_to_rgb('0B1D3A') if i % 2 == 0 else hex_to_rgb('1E293B')
        s_box.line.color.rgb = C_CYAN_ACCENT if i in [2, 3] else hex_to_rgb('3B82F6')
        s_box.line.width = Pt(1.5)

        tb_sb = slide.shapes.add_textbox(Cm(bx + 0.1), Cm(30.8), Cm(box_w - 0.2), Cm(7.2))
        tf_sb = tb_sb.text_frame
        tf_sb.word_wrap = True
        
        p_num = tf_sb.paragraphs[0]
        p_num.alignment = PP_ALIGN.CENTER
        r_num = p_num.add_run()
        r_num.text = stt + "\n"
        r_num.font.name = "Arial"
        r_num.font.size = Pt(18)
        r_num.font.bold = True
        r_num.font.color.rgb = C_GOLD_ACCENT

        p_lbl = tf_sb.add_paragraph()
        p_lbl.alignment = PP_ALIGN.CENTER
        r_lbl = p_lbl.add_run()
        r_lbl.text = lbl
        r_lbl.font.name = "Arial"
        r_lbl.font.size = Pt(11)
        r_lbl.font.color.rgb = C_TEXT_WHITE

    # 3. Định tuyến Dijkstra & Thanh toán VietQR
    add_card(42.8, 39.6, 39.5, 23.5, "ĐỊNH TUYẾN DIJKSTRA & THANH TOÁN VIETQR", "[07]")
    dijk_img = 'baocaokhoaluan/assets/diagrams/hinh_4_7_dijkstra_flow.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, Cm(43.4), Cm(41.8), width=Cm(18.8))

    qr_img = 'baocaokhoaluan/assets/real_client_booking_vietqr.png'
    if os.path.exists(qr_img):
        slide.shapes.add_picture(qr_img, Cm(62.6), Cm(41.8), width=Cm(19.0))

    tb_dq = slide.shapes.add_textbox(Cm(43.4), Cm(53.2), Cm(38.2), Cm(9.4))
    tf_dq = tb_dq.text_frame
    tf_dq.word_wrap = True
    dq_points = [
        ("Thuật toán Dijkstra (Min-Heap): ", "Đồ thị 18 đỉnh (phòng), 34 cạnh (hành lang). Tính toán đường đi ngắn nhất < 5ms, hiển thị nét đứt phát sáng định hướng trực quan trên bản đồ."),
        ("Cổng thanh toán VietQR Napas 247: ", "Sinh mã QR động theo chuẩn Ngân hàng Nhà nước; xác thực Webhook tự động qua chữ ký điện tử HMAC-SHA256 trong vòng 1 giây."),
        ("Soát vé camera HTML5-QRCode: ", "Nhân viên kiểm tra vé trực tiếp qua camera smartphone, xác thực mã băm an toàn, ngăn chặn vé giả và tái sử dụng vé.")
    ]
    for idx, (bld, txt) in enumerate(dq_points):
        p = tf_dq.paragraphs[0] if idx == 0 else tf_dq.add_paragraph()
        p.space_after = Pt(4)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_CYAN_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # 4. Kết quả thực nghiệm & Đo kiểm tải (Results & Benchmarks)
    add_card(42.8, 63.7, 39.5, 24.5, "KẾT QUẢ THỰC NGHIỆM & ĐO KIỂM HIỆU NĂNG", "[08]")
    
    # 4 Box chi so an tuong
    metrics = [
        ("295 req/s", "Thông lượng bão hòa JMeter", C_GOLD_ACCENT),
        ("0.45%", "Tỷ lệ lỗi khi tải 1000 users", C_GREEN_OK),
        ("1.42 giây", "Tốc độ tải trang LCP (Lighthouse)", C_CYAN_ACCENT),
        ("100/100", "Điểm SEO & Best Practices", C_GREEN_OK)
    ]
    m_w = 9.2
    m_h = 4.2
    for idx, (val, desc, col) in enumerate(metrics):
        col_idx = idx % 2
        row_idx = idx // 2
        mx = 43.4 + col_idx * (m_w + 0.6)
        my = 66.0 + row_idx * (m_h + 0.4)
        m_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(mx), Cm(my), Cm(m_w), Cm(m_h))
        m_box.fill.solid()
        m_box.fill.fore_color.rgb = hex_to_rgb('0B1D3A')
        m_box.line.color.rgb = col
        m_box.line.width = Pt(1.5)

        tb_m = slide.shapes.add_textbox(Cm(mx + 0.2), Cm(my + 0.3), Cm(m_w - 0.4), Cm(m_h - 0.6))
        tf_m = tb_m.text_frame
        tf_m.word_wrap = True
        p_v = tf_m.paragraphs[0]
        p_v.alignment = PP_ALIGN.CENTER
        r_v = p_v.add_run()
        r_v.text = val + "\n"
        r_v.font.name = "Arial"
        r_v.font.size = Pt(20)
        r_v.font.bold = True
        r_v.font.color.rgb = col

        p_d = tf_m.add_paragraph()
        p_d.alignment = PP_ALIGN.CENTER
        r_d = p_d.add_run()
        r_d.text = desc
        r_d.font.name = "Arial"
        r_d.font.size = Pt(11.5)
        r_d.font.color.rgb = C_TEXT_WHITE

    # Mo ta ket qua kiem thu
    tb_res = slide.shapes.add_textbox(Cm(43.4), Cm(76.2), Cm(38.2), Cm(11.4))
    tf_r = tb_res.text_frame
    tf_r.word_wrap = True
    res_details = [
        ("Kiểm thử chịu tải Apache JMeter (5 cấp độ 50 - 1000 users): ", "Thời gian đáp ứng trung bình đạt 42ms - 112ms khi tải bình thường và duy trì dưới 550ms ở mức tải cực hạn 1000 users đồng thời."),
        ("Google Lighthouse & Core Web Vitals: ", "Đạt Performance 94, Accessibility 98, Best Practices 100, SEO 96. Chỉ số tương tác INP đạt 68ms (chuẩn < 200ms), độ ổn định bố cục CLS 0.012 (chuẩn < 0.1)."),
        ("Khảo sát người dùng thực tế: ", "92.5% du khách và chuyên gia đánh giá trải nghiệm 360° trực quan, hình ảnh sắc nét và thao tác tìm phòng tiện lợi.")
    ]
    for idx, (bld, txt) in enumerate(res_details):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.space_after = Pt(4)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13)
        r_b.font.bold = True
        r_b.font.color.rgb = C_GOLD_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(12.5)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # 5. Kết luận & Hướng phát triển (Conclusions & Future Works)
    add_card(42.8, 88.8, 39.5, 20.3, "KẾT LUẬN & HƯỚNG PHÁT TRIỂN", "[09]")
    tb_ccl = slide.shapes.add_textbox(Cm(43.4), Cm(91.0), Cm(38.2), Cm(17.5))
    tf_ccl = tb_ccl.text_frame
    tf_ccl.word_wrap = True
    ccl_points = [
        ("Kết quả đạt được: ", "Xây dựng thành công hệ thống số hóa không gian 360° hoàn chỉnh, giải quyết bài toán ghép ảnh toàn cảnh từ thiết bị thông dụng, tích hợp trọn vẹn thương mại điện tử di sản văn minh và định tuyến thông minh."),
        ("Tính ứng dụng thực tiễn: ", "Giải pháp sẵn sàng triển khai thực tế tại Bảo tàng Lịch sử TP.HCM và có khả năng chuyển giao cho các bảo tàng, di tích lịch sử trên toàn quốc."),
        ("Định hướng tương lai: ", "Tích hợp công nghệ 3D Gaussian Splatting (3DGS) thời gian thực trên trình duyệt; mở rộng hệ thống thành nền tảng Liên minh bảo tàng số quốc gia (National Museum Federation).")
    ]
    for idx, (bld, txt) in enumerate(ccl_points):
        p = tf_ccl.paragraphs[0] if idx == 0 else tf_ccl.add_paragraph()
        p.space_after = Pt(6)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_CYAN_ACCENT
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13)
        r_t.font.color.rgb = C_TEXT_LIGHT

    # =========================================================================
    # FOOTER BOTTOM BAR (Y = 109.8cm, Height = 7.8cm, Width = 80.5cm)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.8), Cm(109.8), Cm(80.5), Cm(7.8))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_HEADER_BG
    ftr_box.line.color.rgb = C_CARD_BORDER
    ftr_box.line.width = Pt(2.0)

    # Thong tin lien he sinh vien 1
    tb_f1 = slide.shapes.add_textbox(Cm(3.2), Cm(110.2), Cm(25.0), Cm(7.0))
    tf_f1 = tb_f1.text_frame
    tf_f1.word_wrap = True
    p_f1 = tf_f1.paragraphs[0]
    r_f1 = p_f1.add_run()
    r_f1.text = "Sinh viên: HUỲNH TẤN LỘC (Trưởng nhóm)\n"
    r_f1.font.name = "Arial"
    r_f1.font.size = Pt(15.5)
    r_f1.font.bold = True
    r_f1.font.color.rgb = C_GOLD_ACCENT
    r_f1_sub = p_f1.add_run()
    r_f1_sub.text = "MSSV: 22686171 | Lớp: DHCNTT18ATT\nEmail: huynhloc.dev@gmail.com\nSĐT: 0865.860.854"
    r_f1_sub.font.name = "Arial"
    r_f1_sub.font.size = Pt(13)
    r_f1_sub.font.color.rgb = C_TEXT_LIGHT

    # Thong tin lien he sinh vien 2
    tb_f2 = slide.shapes.add_textbox(Cm(30.0), Cm(110.2), Cm(25.0), Cm(7.0))
    tf_f2 = tb_f2.text_frame
    tf_f2.word_wrap = True
    p_f2 = tf_f2.paragraphs[0]
    r_f2 = p_f2.add_run()
    r_f2.text = "Sinh viên: TRỊNH VĨ THÀNH\n"
    r_f2.font.name = "Arial"
    r_f2.font.size = Pt(15.5)
    r_f2.font.bold = True
    r_f2.font.color.rgb = C_CYAN_ACCENT
    r_f2_sub = p_f2.add_run()
    r_f2_sub.text = "MSSV: 22689411 | Lớp: DHCNTT18ATT\nEmail: trinhvithanh@student.iuh.edu.vn\nSĐT: 0389.002.845"
    r_f2_sub.font.name = "Arial"
    r_f2_sub.font.size = Pt(13)
    r_f2_sub.font.color.rgb = C_TEXT_LIGHT

    # Logo IUH Bottom Right
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(69.0), Cm(110.8), width=Cm(11.5))

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"POSTER CREATED SUCCESSFULLY: {out_file}")

if __name__ == '__main__':
    create_poster()
