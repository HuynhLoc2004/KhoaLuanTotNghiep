# -*- coding: utf-8 -*-
"""
Script thiết kế Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Đề tài: Hệ thống tham quan thực tế ảo 360° & Số hóa không gian di sản Bảo tàng Lịch sử TP.HCM
Màu sắc chủ đạo: Tông màu tối di sản trầm ấm, sang trọng của trang Client (#0B0F19, #131B2E, điểm nhấn Vàng Hoàng Gia #D4AF37 / #C5A880)
Không màu mè, bố cục cân đối, logo đúng tỷ lệ, chữ to rõ ràng chuẩn in ấn học thuật.
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

# Bảng màu chủ đạo của Website Client Bảo tàng
C_BG          = hex_to_rgb('0B0F19')  # Nền tổng thể xanh đen di sản
C_HEADER_BG   = hex_to_rgb('101726')  # Nền Header & Footer
C_CARD_BG     = hex_to_rgb('131B2E')  # Nền các khối nội dung
C_CARD_BORDER = hex_to_rgb('2A364F')  # Viền khối tinh tế, không chói
C_GOLD        = hex_to_rgb('D4AF37')  # Màu Vàng Kim Di sản (chủ đạo)
C_AMBER       = hex_to_rgb('C5A880')  # Màu Vàng cát nhã nhặn
C_WHITE       = hex_to_rgb('F8FAFC')  # Chữ trắng sáng rõ nét
C_LIGHT       = hex_to_rgb('E2E8F0')  # Chữ xám sáng dễ đọc
C_MUTED       = hex_to_rgb('94A3B8')  # Chữ xám phụ trợ
C_DIVIDER     = hex_to_rgb('1E293B')  # Đường phân cách

def create_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. Background toàn bộ slide
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = C_BG
    bg_shape.line.fill.background()

    # 2. HEADER TOP BANNER (X = 2.5cm, Y = 1.8cm, W = 79.1cm, H = 14.2cm)
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.5), Cm(1.8), Cm(79.1), Cm(14.2))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_HEADER_BG
    hdr_box.line.color.rgb = C_GOLD
    hdr_box.line.width = Pt(1.5)

    # Logo IUH góc trái trên (Giữ nguyên tỷ lệ 349x125 -> W=11.5cm, H=4.12cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(4.0), Cm(2.6), width=Cm(11.5), height=Cm(4.12))

    # Tên Trường & Khoa (Giữa - Phải của dải trên)
    uni_box = slide.shapes.add_textbox(Cm(17.0), Cm(2.2), Cm(63.0), Cm(3.8))
    tf_u = uni_box.text_frame
    tf_u.word_wrap = True
    p1 = tf_u.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    r1 = p1.add_run()
    r1.text = "BỘ CÔNG THƯƠNG — TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\n"
    r1.font.name = "Arial"
    r1.font.size = Pt(21)
    r1.font.bold = True
    r1.font.color.rgb = C_WHITE

    p2 = tf_u.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run()
    r2.text = "KHOA CÔNG NGHỆ THÔNG TIN — BỘ MÔN KỸ THUẬT PHẦN MỀM"
    r2.font.name = "Arial"
    r2.font.size = Pt(17)
    r2.font.bold = True
    r2.font.color.rgb = C_GOLD

    # Đường kẻ mảnh phân cách trong Header
    div_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(4.0), Cm(5.8), Cm(76.1), Cm(0.06))
    div_line.fill.solid()
    div_line.fill.fore_color.rgb = C_CARD_BORDER
    div_line.line.fill.background()

    # Khối thông tin Giảng viên & Sinh viên (Góc dưới trái của Header)
    info_box = slide.shapes.add_textbox(Cm(4.0), Cm(6.2), Cm(26.0), Cm(9.2))
    tf_i = info_box.text_frame
    tf_i.word_wrap = True
    
    p_inst = tf_i.paragraphs[0]
    r_in_l = p_inst.add_run()
    r_in_l.text = "Instructor:\n"
    r_in_l.font.name = "Arial"
    r_in_l.font.size = Pt(15)
    r_in_l.font.color.rgb = C_GOLD
    r_in_n = p_inst.add_run()
    r_in_n.text = "PhD. Trần Thị Minh Khoa\n\n"
    r_in_n.font.name = "Arial"
    r_in_n.font.size = Pt(18)
    r_in_n.font.bold = True
    r_in_n.font.color.rgb = C_WHITE

    p_st = tf_i.add_paragraph()
    r_st_l = p_st.add_run()
    r_st_l.text = "Students:\n"
    r_st_l.font.name = "Arial"
    r_st_l.font.size = Pt(15)
    r_st_l.font.color.rgb = C_GOLD
    
    r_st1 = p_st.add_run()
    r_st1.text = "• Huỳnh Tấn Lộc   — ID: 22686171\n"
    r_st1.font.name = "Arial"
    r_st1.font.size = Pt(16.5)
    r_st1.font.bold = True
    r_st1.font.color.rgb = C_WHITE

    r_st2 = p_st.add_run()
    r_st2.text = "• Trịnh Vĩ Thành   — ID: 22689411\n"
    r_st2.font.name = "Arial"
    r_st2.font.size = Pt(16.5)
    r_st2.font.bold = True
    r_st2.font.color.rgb = C_WHITE

    r_cls = p_st.add_run()
    r_cls.text = "Class: DHCNTT18ATT (Khóa 2022 - 2026)"
    r_cls.font.name = "Arial"
    r_cls.font.size = Pt(14)
    r_cls.font.italic = True
    r_cls.font.color.rgb = C_MUTED

    # Khối Tiêu đề Đề tài (Góc dưới phải của Header - Chữ to, trang nghiêm, màu Vàng & Trắng)
    title_box = slide.shapes.add_textbox(Cm(30.5), Cm(6.2), Cm(49.6), Cm(9.2))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True

    p_t1 = tf_t.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° VÀ SỐ HÓA\nKHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(27)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_WHITE

    p_t2 = tf_t.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "A 360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM FOR HO CHI MINH CITY MUSEUM OF HISTORY"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(15.5)
    r_t2.font.bold = True
    r_t2.font.italic = True
    r_t2.font.color.rgb = C_GOLD

    # =========================================================================
    # HÀM TẠO CARD NỘI DUNG CHUẨN POSTER MẪU (Tiêu đề in hoa, màu vàng ấm, bo góc nhẹ)
    # =========================================================================
    def add_section_box(x, y, w, h, title_text):
        # Card bo goc nhe
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Tieu de muc in dam, ro net theo phong cach poster mau
        tb = slide.shapes.add_textbox(Cm(x + 0.8), Cm(y + 0.4), Cm(w - 1.6), Cm(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(21)
        r.font.bold = True
        r.font.color.rgb = C_GOLD

        return card

    # =========================================================================
    # CỘT TRÁI (COL 1: X = 2.5cm, Width = 38.3cm)
    # =========================================================================

    # 1. Design Diagrams: (Kiến trúc hệ thống 3 tầng)
    add_section_box(2.5, 17.0, 38.3, 19.5, "Design Diagrams:")
    arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(3.3), Cm(19.2), width=Cm(36.7))

    tb_dd = slide.shapes.add_textbox(Cm(3.3), Cm(32.8), Cm(36.7), Cm(3.2))
    tf_dd = tb_dd.text_frame
    tf_dd.word_wrap = True
    p_dd = tf_dd.paragraphs[0]
    r_dd = p_dd.add_run()
    r_dd.text = "• Kiến trúc 3 tầng (3-Tier Layered): Frontend SPA React 18, Backend Node.js v20 API Gateway, CSDL lai PostgreSQL 16 (chuẩn ACID vé & giao dịch) + MongoDB 7.0 (không gian 360°) + Redis Cache."
    r_dd.font.name = "Arial"
    r_dd.font.size = Pt(14)
    r_dd.font.color.rgb = C_LIGHT

    # 2. Targets: (Mục tiêu đề tài)
    add_section_box(2.5, 37.5, 38.3, 15.0, "Targets:")
    tb_tar = slide.shapes.add_textbox(Cm(3.3), Cm(39.6), Cm(36.7), Cm(12.2))
    tf_tar = tb_tar.text_frame
    tf_tar.word_wrap = True
    targets_data = [
        "Số hóa toàn diện 18 gian phòng trưng bày liên hoàn và 17 cổ vật di sản tiêu biểu tại Bảo tàng Lịch sử TP.HCM.",
        "Làm chủ quy trình ghép ảnh toàn cảnh Panorama 360° từ 4 nguồn đầu vào: Webcam, DSLR, Video lia máy và Gyroscope.",
        "Ứng dụng giải thuật Dijkstra (hàng đợi ưu tiên Min-Heap) định tuyến tìm đường ngắn nhất giữa 18 phòng bảo tàng với thời gian phản hồi < 5ms.",
        "Tự động hóa hoàn toàn thương mại điện tử di sản: Bán vé số VietQR Napas 247 qua PayOS và soát vé tức thì bằng camera HTML5-QRCode."
    ]
    for idx, item in enumerate(targets_data):
        p = tf_tar.paragraphs[0] if idx == 0 else tf_tar.add_paragraph()
        p.space_after = Pt(6)
        r = p.add_run()
        r.text = "• " + item
        r.font.name = "Arial"
        r.font.size = Pt(14.5)
        r.font.color.rgb = C_LIGHT

    # 3. Realistic model: (Không gian thực tế ảo 360° & Mô hình 3D cổ vật)
    add_section_box(2.5, 53.5, 38.3, 30.5, "Realistic model:")
    t360_p = 'baocaokhoaluan/assets/real_client_interactive_tour360.png'
    if os.path.exists(t360_p):
        slide.shapes.add_picture(t360_p, Cm(3.3), Cm(55.8), width=Cm(36.7))

    art_p = 'baocaokhoaluan/assets/real_client_artifacts_section.png'
    if os.path.exists(art_p):
        slide.shapes.add_picture(art_p, Cm(3.3), Cm(69.6), width=Cm(36.7))

    tb_rm = slide.shapes.add_textbox(Cm(3.3), Cm(79.6), Cm(36.7), Cm(4.0))
    tf_rm = tb_rm.text_frame
    tf_rm.word_wrap = True
    p_rm = tf_rm.paragraphs[0]
    r_rm = p_rm.add_run()
    r_rm.text = "• Không gian thực tế ảo WebGL Three.js đạt chuẩn 60 FPS, tương tác xoay đa chiều, chuyển cảnh mượt mà qua Hotspot.\n• Chiêm ngưỡng cổ vật 3D tương tác xoay 360° chuẩn PBR (.GLB) từ 2 động cơ Local CPU và Cloud AI TRELLIS ZeroGPU."
    r_rm.font.name = "Arial"
    r_rm.font.size = Pt(14)
    r_rm.font.color.rgb = C_WHITE

    # 4. Process: (Quy trình thuật toán xử lý ảnh Panorama)
    add_section_box(2.5, 85.0, 38.3, 23.5, "Process:")
    proc_img = 'baocaokhoaluan/assets/diagrams/hinh_4_3_panorama_4inputs.png'
    if os.path.exists(proc_img):
        slide.shapes.add_picture(proc_img, Cm(3.3), Cm(87.2), width=Cm(36.7))

    tb_pr = slide.shapes.add_textbox(Cm(3.3), Cm(100.8), Cm(36.7), Cm(7.2))
    tf_pr = tb_pr.text_frame
    tf_pr.word_wrap = True
    p_pr = tf_pr.paragraphs[0]
    r_pr = p_pr.add_run()
    r_pr.text = "• Nắn trụ (Cylindrical Warping): Triệt tiêu độ cong mép ảnh theo tiêu cự f và góc nhìn quang học FOV.\n• Khớp đặc trưng SIFT & Lọc nhiễu RANSAC: Trích xuất vector 128 chiều, loại bỏ điểm ngoại lai Outliers.\n• Hòa trộn đa dải tần (Multiband Laplacian): Khử triệt để vết mí nối, xuất ảnh cầu Equirectangular 8K sắc nét."
    r_pr.font.name = "Arial"
    r_pr.font.size = Pt(13.8)
    r_pr.font.color.rgb = C_LIGHT

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 43.3cm, Width = 38.3cm)
    # =========================================================================

    # 1. Abstracts: (Tóm tắt đề tài)
    add_section_box(43.3, 17.0, 38.3, 14.2, "Abstracts:")
    tb_ab = slide.shapes.add_textbox(Cm(44.1), Cm(19.2), Cm(36.7), Cm(11.4))
    tf_ab = tb_ab.text_frame
    tf_ab.word_wrap = True
    p_ab1 = tf_ab.paragraphs[0]
    p_ab1.space_after = Pt(6)
    r_ab1 = p_ab1.add_run()
    r_ab1.text = "Thực hiện Quyết định số 749/QĐ-TTg của Thủ tướng Chính phủ về Chuyển đổi số quốc gia, đề tài giải quyết bài toán số hóa di sản bảo tàng chi phí thấp, đưa Bảo tàng Lịch sử TP.HCM lên không gian số mà không phụ thuộc vào thiết bị chuyên dụng đắt tiền."
    r_ab1.font.name = "Arial"
    r_ab1.font.size = Pt(14.5)
    r_ab1.font.color.rgb = C_LIGHT

    p_ab2 = tf_ab.add_paragraph()
    r_ab2 = p_ab2.add_run()
    r_ab2.text = "Hệ sinh thái kết hợp hài hòa giữa Thị giác máy tính (ghép ảnh 360° từ video quét phòng bằng smartphone), Đồ họa WebGL Three.js, Định tuyến Dijkstra, Trợ lý AI hội thoại RAG và Thương mại điện tử vé số VietQR Napas 247, mang lại trải nghiệm tham quan sống động cho công chúng trên mọi thiết bị web."
    r_ab2.font.name = "Arial"
    r_ab2.font.size = Pt(14.5)
    r_ab2.font.color.rgb = C_LIGHT

    # 2. Procedure: (Quy trình thực hiện 6 bước chuẩn như mẫu)
    add_section_box(43.3, 32.2, 38.3, 9.8, "Procedure:")
    steps = [
        ("01", "Khảo sát\nthực địa"),
        ("02", "Thu thập\ndữ liệu"),
        ("03", "Giải thuật\ntoán học"),
        ("04", "Lập trình\nhệ thống"),
        ("05", "Đo kiểm tải\nJMeter"),
        ("06", "Nghiệm thu\nbàn giao")
    ]
    sw = 5.8
    sgap = 0.38
    for idx, (num, txt) in enumerate(steps):
        sx = 44.1 + idx * (sw + sgap)
        sbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(sx), Cm(34.4), Cm(sw), Cm(6.8))
        sbox.fill.solid()
        sbox.fill.fore_color.rgb = hex_to_rgb('101726')
        sbox.line.color.rgb = C_GOLD if idx in [2, 3] else C_CARD_BORDER
        sbox.line.width = Pt(1.5)

        stb = slide.shapes.add_textbox(Cm(sx + 0.1), Cm(34.6), Cm(sw - 0.2), Cm(6.4))
        stf = stb.text_frame
        stf.word_wrap = True
        
        sp1 = stf.paragraphs[0]
        sp1.alignment = PP_ALIGN.CENTER
        sr1 = sp1.add_run()
        sr1.text = num + "\n"
        sr1.font.name = "Arial"
        sr1.font.size = Pt(18)
        sr1.font.bold = True
        sr1.font.color.rgb = C_GOLD

        sp2 = stf.add_paragraph()
        sp2.alignment = PP_ALIGN.CENTER
        sr2 = sp2.add_run()
        sr2.text = txt
        sr2.font.name = "Arial"
        sr2.font.size = Pt(12)
        sr2.font.color.rgb = C_WHITE

    # 3. Results: (Kết quả thực nghiệm - 4 hình ảnh thực tế)
    add_section_box(43.3, 43.0, 38.3, 40.5, "Results:")
    # Luu do Dijkstra
    dijk_p = 'baocaokhoaluan/assets/diagrams/hinh_4_7_dijkstra_flow.png'
    if os.path.exists(dijk_p):
        slide.shapes.add_picture(dijk_p, Cm(44.1), Cm(45.2), width=Cm(18.0))

    # Giao dien thanh toan VietQR
    vqr_p = 'baocaokhoaluan/assets/real_client_booking_vietqr.png'
    if os.path.exists(vqr_p):
        slide.shapes.add_picture(vqr_p, Cm(62.8), Cm(45.2), width=Cm(18.0))

    # Anh giao dien Website Client thuc te
    home_p = 'baocaokhoaluan/assets/real_client_homepage_hero.png'
    if os.path.exists(home_p):
        slide.shapes.add_picture(home_p, Cm(44.1), Cm(56.8), width=Cm(36.7))

    # 3 Box chi so do kiem JMeter & Lighthouse
    res_metrics = [
        ("295 req/s", "Thông lượng bão hòa JMeter"),
        ("0.45%", "Tỷ lệ lỗi (1000 users tải)"),
        ("1.42s (LCP)", "Google Lighthouse: 94đ")
    ]
    mw = 11.8
    for idx, (val, desc) in enumerate(res_metrics):
        mx = 44.1 + idx * (mw + 0.65)
        mbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(mx), Cm(72.0), Cm(mw), Cm(3.8))
        mbox.fill.solid()
        mbox.fill.fore_color.rgb = hex_to_rgb('101726')
        mbox.line.color.rgb = C_CARD_BORDER
        mbox.line.width = Pt(1.2)

        mtb = slide.shapes.add_textbox(Cm(mx + 0.2), Cm(72.2), Cm(mw - 0.4), Cm(3.4))
        mtf = mtb.text_frame
        mtf.word_wrap = True
        mp1 = mtf.paragraphs[0]
        mp1.alignment = PP_ALIGN.CENTER
        mr1 = mp1.add_run()
        mr1.text = val + "\n"
        mr1.font.name = "Arial"
        mr1.font.size = Pt(17)
        mr1.font.bold = True
        mr1.font.color.rgb = C_GOLD

        mp2 = mtf.add_paragraph()
        mp2.alignment = PP_ALIGN.CENTER
        mr2 = mp2.add_run()
        mr2.text = desc
        mr2.font.name = "Arial"
        mr2.font.size = Pt(11.5)
        mr2.font.color.rgb = C_WHITE

    tb_res_txt = slide.shapes.add_textbox(Cm(44.1), Cm(76.5), Cm(36.7), Cm(6.4))
    tf_rt = tb_res_txt.text_frame
    tf_rt.word_wrap = True
    p_rt = tf_rt.paragraphs[0]
    r_rt = p_rt.add_run()
    r_rt.text = "• Thuật toán Dijkstra tìm lộ trình ngắn nhất giữa 18 phòng bảo tàng dưới 5ms, hiển thị nét đứt phát sáng định hướng.\n• Cổng thanh toán VietQR Napas 247 qua PayOS cập nhật tức thời qua Webhook HMAC-SHA256 trong vòng 1 giây.\n• Kiểm soát vé thời gian thực bằng camera HTML5-QRCode quét mã vé nhanh dưới 100ms, chống tái sử dụng vé."
    r_rt.font.name = "Arial"
    r_rt.font.size = Pt(13.8)
    r_rt.font.color.rgb = C_LIGHT

    # 4. Conclusions: (Kết luận & Hướng phát triển)
    add_section_box(43.3, 84.5, 38.3, 24.0, "Conclusions:")
    tb_ccl = slide.shapes.add_textbox(Cm(44.1), Cm(86.8), Cm(36.7), Cm(21.0))
    tf_ccl = tb_ccl.text_frame
    tf_ccl.word_wrap = True
    ccl_items = [
        ("Làm chủ chuỗi công nghệ số hóa di sản: ", "Xây dựng thành công hệ thống thực tế ảo 360° hoàn chỉnh, kết hợp hài hòa thị giác máy tính, đồ họa WebGL Three.js và thương mại điện tử vé số văn minh."),
        ("Độ ổn định và hiệu năng cao: ", "Hệ thống đáp ứng mượt mà 60 FPS trên máy tính và điện thoại thông minh, chịu tải 1000 người dùng ảo đồng thời trên máy chủ Cloud VPS."),
        ("Tính sẵn sàng ứng dụng thực tiễn: ", "Giải pháp sẵn sàng triển khai chính thức cho Bảo tàng Lịch sử TP.HCM phục vụ du khách và có khả năng chuyển giao cho các bảo tàng, di tích văn hóa trên toàn quốc."),
        ("Định hướng tương lai: ", "Tích hợp công nghệ 3D Gaussian Splatting (3DGS) thời gian thực và phát triển thành nền tảng Liên minh bảo tàng số quốc gia (National Museum Federation).")
    ]
    for idx, (bld, txt) in enumerate(ccl_items):
        p = tf_ccl.paragraphs[0] if idx == 0 else tf_ccl.add_paragraph()
        p.space_after = Pt(6)
        r_b = p.add_run()
        r_b.text = "• " + bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(14.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_GOLD
        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(14)
        r_t.font.color.rgb = C_LIGHT

    # =========================================================================
    # FOOTER BOTTOM BAR (X = 2.5cm, Y = 109.5cm, W = 79.1cm, H = 7.6cm)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.5), Cm(109.5), Cm(79.1), Cm(7.6))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_HEADER_BG
    ftr_box.line.color.rgb = C_GOLD
    ftr_box.line.width = Pt(1.5)

    # Thong tin sinh vien 1
    tb_f1 = slide.shapes.add_textbox(Cm(4.0), Cm(109.9), Cm(25.0), Cm(6.8))
    tf_f1 = tb_f1.text_frame
    tf_f1.word_wrap = True
    p_f1 = tf_f1.paragraphs[0]
    r_f1 = p_f1.add_run()
    r_f1.text = "Huỳnh Tấn Lộc (Trưởng nhóm)\n"
    r_f1.font.name = "Arial"
    r_f1.font.size = Pt(16.5)
    r_f1.font.bold = True
    r_f1.font.color.rgb = C_GOLD
    r_f1_sub = p_f1.add_run()
    r_f1_sub.text = "SĐT: 0865.860.854\nEmail: huynhloc.dev@gmail.com"
    r_f1_sub.font.name = "Arial"
    r_f1_sub.font.size = Pt(14)
    r_f1_sub.font.color.rgb = C_LIGHT

    # Thong tin sinh vien 2
    tb_f2 = slide.shapes.add_textbox(Cm(30.0), Cm(109.9), Cm(25.0), Cm(6.8))
    tf_f2 = tb_f2.text_frame
    tf_f2.word_wrap = True
    p_f2 = tf_f2.paragraphs[0]
    r_f2 = p_f2.add_run()
    r_f2.text = "Trịnh Vĩ Thành\n"
    r_f2.font.name = "Arial"
    r_f2.font.size = Pt(16.5)
    r_f2.font.bold = True
    r_f2.font.color.rgb = C_GOLD
    r_f2_sub = p_f2.add_run()
    r_f2_sub.text = "SĐT: 0389.002.845\nEmail: trinhvithanh@student.iuh.edu.vn"
    r_f2_sub.font.name = "Arial"
    r_f2_sub.font.size = Pt(14)
    r_f2_sub.font.color.rgb = C_LIGHT

    # Logo IUH goc phai Footer
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(68.0), Cm(110.2), width=Cm(11.5), height=Cm(4.12))

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"HERITAGE POSTER CREATED: {out_file}")

if __name__ == '__main__':
    create_poster()
