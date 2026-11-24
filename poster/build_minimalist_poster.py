# -*- coding: utf-8 -*-
"""
Script thiết kế Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Đề tài: HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM
Phong cách: Minimalist Academic Scientific Poster (Không màu mè, Nền trắng tinh khiết, 
            Chuẩn mực in ấn học thuật khoa học, Màu Xanh IUH & Than chì thanh lịch)
Trường: Đại học Công nghiệp TP. Hồ Chí Minh (IUH) - Khoa Công nghệ Thông tin
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

# Bảng màu chuẩn học thuật tối giản (Minimalist Academic Palette - KHÔNG MÀU MÈ)
C_BG_PAGE     = hex_to_rgb('FFFFFF')  # Nền trang trắng tinh khiết chuẩn in ấn
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Nền card trắng sạch sẽ
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Viền card mỏng, thanh nhã (Slate nhạt)
C_HEADER_BG   = hex_to_rgb('FFFFFF')  # Header nền trắng đồng bộ
C_IUH_BLUE    = hex_to_rgb('005BAA')  # Xanh IUH chính thức
C_NAVY_DEEP   = hex_to_rgb('0F2942')  # Xanh Navy đậm chủ đạo
C_TEXT_DARK   = hex_to_rgb('0F172A')  # Chữ đen tuyền than chì sắc nét
C_TEXT_MUTED  = hex_to_rgb('475569')  # Chữ phụ đề xám trung tính dễ đọc
C_ACCENT_BLUE = hex_to_rgb('2563EB')  # Điểm nhấn xanh dương trí tuệ
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Chân trang xanh Navy trang nghiêm
C_WHITE       = hex_to_rgb('FFFFFF')  # Chữ trắng cho footer
C_SUBTLE_BG   = hex_to_rgb('F8FAFC')  # Nền phụ trợ cho các khối nhỏ

def create_academic_minimalist_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. NỀN TOÀN TRANG: TRẮNG TINH KHIẾT (Chuẩn poster khoa học, tiết kiệm mực, cực sáng)
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = C_BG_PAGE
    bg_shape.line.fill.background()

    # 2. TOP HEADER BANNER (Nền trắng viền thanh mảnh, trang trọng)
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(1.6), Cm(79.3), Cm(14.0))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_HEADER_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(1.5)

    # Logo IUH góc trái Header (Tỷ lệ tự nhiên W=11.5cm, H=4.12cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.8), Cm(2.4), width=Cm(11.5), height=Cm(4.12))

    # Thông tin Đơn vị đào tạo (Dải trên giữa)
    uni_tb = slide.shapes.add_textbox(Cm(16.5), Cm(2.0), Cm(63.5), Cm(3.8))
    tf_u = uni_tb.text_frame
    tf_u.word_wrap = True
    p_u1 = tf_u.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "BỘ CÔNG THƯƠNG — TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(19.5)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_IUH_BLUE

    p_u2 = tf_u.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "KHOA CÔNG NGHỆ THÔNG TIN — BỘ MÔN KỸ THUẬT PHẦN MỀM"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(15.0)
    r_u2.font.bold = True
    r_u2.font.color.rgb = C_NAVY_DEEP

    # Đường phân cách ngang thanh mảnh trong Header
    h_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(3.8), Cm(5.8), Cm(76.5), Cm(0.06))
    h_line.fill.solid()
    h_line.fill.fore_color.rgb = C_CARD_BORDER
    h_line.line.fill.background()

    # Khối Metadata Giảng viên & Sinh viên (Góc dưới trái của Header)
    meta_tb = slide.shapes.add_textbox(Cm(3.8), Cm(6.2), Cm(27.5), Cm(9.0))
    tf_m = meta_tb.text_frame
    tf_m.word_wrap = True
    
    p_ins = tf_m.paragraphs[0]
    r_in1 = p_ins.add_run()
    r_in1.text = "Giảng viên hướng dẫn:\n"
    r_in1.font.name = "Arial"
    r_in1.font.size = Pt(13.5)
    r_in1.font.bold = True
    r_in1.font.color.rgb = C_IUH_BLUE
    r_in2 = p_ins.add_run()
    r_in2.text = "TS. Trần Thị Minh Khoa\n\n"
    r_in2.font.name = "Arial"
    r_in2.font.size = Pt(17.0)
    r_in2.font.bold = True
    r_in2.font.color.rgb = C_NAVY_DEEP

    p_stu = tf_m.add_paragraph()
    r_st_l = p_stu.add_run()
    r_st_l.text = "Sinh viên thực hiện:\n"
    r_st_l.font.name = "Arial"
    r_st_l.font.size = Pt(13.5)
    r_st_l.font.bold = True
    r_st_l.font.color.rgb = C_IUH_BLUE
    
    r_s1 = p_stu.add_run()
    r_s1.text = "• Huỳnh Tấn Lộc   — MSSV: 22686171\n"
    r_s1.font.name = "Arial"
    r_s1.font.size = Pt(15.5)
    r_s1.font.bold = True
    r_s1.font.color.rgb = C_TEXT_DARK

    r_s2 = p_stu.add_run()
    r_s2.text = "• Trịnh Vĩ Thành   — MSSV: 22689411\n"
    r_s2.font.name = "Arial"
    r_s2.font.size = Pt(15.5)
    r_s2.font.bold = True
    r_s2.font.color.rgb = C_TEXT_DARK

    r_sc = p_stu.add_run()
    r_sc.text = "Lớp: DHCNTT18ATT (Khóa 2022 — 2026)"
    r_sc.font.name = "Arial"
    r_sc.font.size = Pt(13.0)
    r_sc.font.color.rgb = C_TEXT_MUTED

    # Tiêu đề chính đề tài (Tiếng Việt & Tiếng Anh, chữ to, trang nghiêm, phân cấp rõ)
    title_tb = slide.shapes.add_textbox(Cm(32.0), Cm(6.2), Cm(48.5), Cm(9.0))
    tf_t = title_tb.text_frame
    tf_t.word_wrap = True

    p_t1 = tf_t.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° VÀ SỐ HÓA\nKHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP.HCM\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(25.0)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_NAVY_DEEP

    p_t2 = tf_t.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "A 360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM FOR HO CHI MINH CITY MUSEUM OF HISTORY"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(14.5)
    r_t2.font.bold = True
    r_t2.font.color.rgb = C_IUH_BLUE

    # =========================================================================
    # HÀM TẠO CARD TỐI GIẢN CHUẨN POSTER KHOA HỌC (Clean Minimalist Card)
    # =========================================================================
    def add_card(x, y, w, h, title_text):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Tiêu đề Card: Chữ Navy đậm đà, tối giản
        tb = slide.shapes.add_textbox(Cm(x + 0.8), Cm(y + 0.4), Cm(w - 1.6), Cm(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(20.0)
        r.font.bold = True
        r.font.color.rgb = C_NAVY_DEEP

        # Đường gạch dưới tiêu đề màu Xanh IUH trang nhã (không màu mè)
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.8), Cm(y + 1.8), Cm(5.5), Cm(0.10))
        bar.fill.solid()
        bar.fill.fore_color.rgb = C_IUH_BLUE
        bar.line.fill.background()

        return card

    # =========================================================================
    # CỘT TRÁI (COL 1: X = 2.4cm, Width = 38.4cm)
    # =========================================================================

    # 1. Design Diagrams (Kiến trúc hệ thống 3 tầng)
    add_card(2.4, 16.5, 38.4, 20.0, "1. Design Diagrams (Kiến trúc hệ thống)")
    arch_img = 'poster/assets/diagram_architecture_3tier_en.png'
    if not os.path.exists(arch_img):
        arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(3.2), Cm(18.6), width=Cm(36.8))

    tb_sa = slide.shapes.add_textbox(Cm(3.0), Cm(33.2), Cm(37.2), Cm(2.8))
    tf_sa = tb_sa.text_frame
    tf_sa.word_wrap = True
    p_sa = tf_sa.paragraphs[0]
    r_sa = p_sa.add_run()
    r_sa.text = "• Kiến trúc 3 tầng chuẩn mở: Frontend WebGL Three.js (React 18), Backend Node.js v20 API Gateway, CSDL lai PostgreSQL 16 (vé & giao dịch ACID) + MongoDB 7.0 (siêu dữ liệu 360°) + Redis Cache."
    r_sa.font.name = "Arial"
    r_sa.font.size = Pt(13.2)
    r_sa.font.color.rgb = C_TEXT_DARK

    # 2. Targets (Mục tiêu khoa học & Thực tiễn)
    add_card(2.4, 37.3, 38.4, 14.8, "2. Targets (Mục tiêu đề tài)")
    tb_obj = slide.shapes.add_textbox(Cm(3.0), Cm(39.3), Cm(37.2), Cm(12.2))
    tf_obj = tb_obj.text_frame
    tf_obj.word_wrap = True
    objectives = [
        ("Số hóa không gian toàn diện: ", "Tái hiện chân thực toàn bộ 18 phòng trưng bày và 17 cổ vật di sản tiêu biểu với tương tác 3D WebGL 60 FPS."),
        ("Tự chủ quy trình công nghệ: ", "Xử lý ghép ảnh Panorama 360° từ video điện thoại thông minh, giảm hơn 85% chi phí so với thiết bị quét chuyên dụng."),
        ("Định tuyến Dijkstra tối ưu: ", "Tìm lộ trình tham quan ngắn nhất qua 18 phòng và 34 cửa liên thông với thời gian phản hồi < 5ms."),
        ("Thương mại điện tử & Soát vé: ", "Tự động hóa hoàn toàn phát hành vé VietQR Napas 247 và kiểm soát vé vào cổng bằng camera quét mã QR < 100ms.")
    ]
    for idx, (bld, txt) in enumerate(objectives):
        p = tf_obj.paragraphs[0] if idx == 0 else tf_obj.add_paragraph()
        p.space_after = Pt(4)
        r_num = p.add_run()
        r_num.text = "✔ "
        r_num.font.name = "Arial"
        r_num.font.size = Pt(14.0)
        r_num.font.bold = True
        r_num.font.color.rgb = C_IUH_BLUE
        
        r_b = p.add_run()
        r_b.text = bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(13.8)
        r_b.font.bold = True
        r_b.font.color.rgb = C_NAVY_DEEP

        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13.5)
        r_t.font.color.rgb = C_TEXT_DARK

    # 3. Realistic Model (Không gian thực tế ảo 360° & Cổ vật 3D)
    add_card(2.4, 52.8, 38.4, 28.5, "3. Realistic Model (Mô hình thực tế & Giao diện)")
    t360_img = 'poster/assets/tour360_interface.jpg'
    if os.path.exists(t360_img):
        slide.shapes.add_picture(t360_img, Cm(3.2), Cm(55.0), width=Cm(36.8), height=Cm(20.5))

    tb_vti = slide.shapes.add_textbox(Cm(3.0), Cm(76.0), Cm(37.2), Cm(4.8))
    tf_vti = tb_vti.text_frame
    tf_vti.word_wrap = True
    p_vti = tf_vti.paragraphs[0]
    r_vti = p_vti.add_run()
    r_vti.text = "• Không gian thực tế ảo WebGL Three.js đạt chuẩn 60 FPS: Điều hướng không gian đa chiều, chuyển cảnh mượt mà qua Hotspot, tích hợp trợ lý AI thuyết minh 7 ngôn ngữ và mô hình cổ vật 3D xoay 360° chuẩn PBR (.GLB)."
    r_vti.font.name = "Arial"
    r_vti.font.size = Pt(13.5)
    r_vti.font.color.rgb = C_TEXT_DARK

    # 4. Process (Quy trình thuật toán xử lý ảnh Panorama)
    add_card(2.4, 82.0, 38.4, 27.2, "4. Process (Quy trình tiền xử lý & Ghép ảnh 360°)")
    proc_img = 'poster/assets/diagram_stitching_process_en.png'
    if not os.path.exists(proc_img):
        proc_img = 'baocaokhoaluan/assets/diagrams/flow_01_stitching_process.png'
    if os.path.exists(proc_img):
        slide.shapes.add_picture(proc_img, Cm(3.2), Cm(84.2), width=Cm(36.8))

    tb_wf = slide.shapes.add_textbox(Cm(3.0), Cm(96.8), Cm(37.2), Cm(11.8))
    tf_wf = tb_wf.text_frame
    tf_wf.word_wrap = True
    p_wf = tf_wf.paragraphs[0]
    r_wf = p_wf.add_run()
    r_wf.text = "• Nắn ảnh trụ (Cylindrical Warping): Triệt tiêu biến dạng phối cảnh từ khung hình phẳng.\n• Trích xuất đặc trưng SIFT & Khớp RANSAC: Nhận diện 128 chiều đặc trưng bất biến tỷ lệ, lọc bỏ 100% điểm nhiễu ngoại lai.\n• Tối ưu ma trận biến đổi Homography: Cân bằng sai số hình học toàn cục.\n• Hòa trộn đa dải tần (Multiband Blending): Xóa nhòa đường giáp mí, xuất ảnh toàn cảnh Equirectangular 8K hoàn hảo."
    r_wf.font.name = "Arial"
    r_wf.font.size = Pt(13.5)
    r_wf.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 43.3cm, Width = 38.4cm)
    # =========================================================================

    # 5. Abstract (Tóm tắt đề tài)
    add_card(43.3, 16.5, 38.4, 14.8, "5. Abstract (Tóm tắt đề tài)")
    tb_ab = slide.shapes.add_textbox(Cm(44.0), Cm(18.6), Cm(37.0), Cm(12.0))
    tf_ab = tb_ab.text_frame
    tf_ab.word_wrap = True
    p_ab1 = tf_ab.paragraphs[0]
    p_ab1.space_after = Pt(4)
    r_ab1 = p_ab1.add_run()
    r_ab1.text = "Bám sát Chiến lược Chuyển đổi số Quốc gia (Quyết định 749/QĐ-TTg), đề tài xây dựng hệ sinh thái số hóa di sản toàn diện, kinh tế và bền vững cho Bảo tàng Lịch sử Thành phố Hồ Chí Minh."
    r_ab1.font.name = "Arial"
    r_ab1.font.size = Pt(13.8)
    r_ab1.font.color.rgb = C_TEXT_DARK

    p_ab2 = tf_ab.add_paragraph()
    r_ab2 = p_ab2.add_run()
    r_ab2.text = "Hệ thống tích hợp công nghệ Thị giác máy tính (Computer Vision), Đồ họa WebGL 3D, Lý thuyết đồ thị tìm đường Dijkstra, Trí tuệ nhân tạo thuyết minh 7 ngôn ngữ và Cổng thanh toán quốc gia VietQR Napas 247. Bằng cách chuyển đổi video quay từ điện thoại thông minh thành ảnh toàn cảnh 8K chất lượng cao, giải pháp xóa bỏ sự phụ thuộc vào các thiết bị chuyên dụng đắt đỏ, mở ra trải nghiệm số hóa di sản sống động cho công chúng."
    r_ab2.font.name = "Arial"
    r_ab2.font.size = Pt(13.8)
    r_ab2.font.color.rgb = C_TEXT_DARK

    # 6. Procedure (Quy trình thực hiện dự án - 6 giai đoạn ngang)
    add_card(43.3, 32.1, 38.4, 11.2, "6. Procedure (Quy trình 6 giai đoạn thực hiện)")
    steps_data = [
        ("01", "Khảo sát", "Mặt bằng 18 phòng\n& liên thông cửa"),
        ("02", "Thu thập", "Video lia máy &\nchụp đa góc cổ vật"),
        ("03", "Tiền xử lý", "Nắn ảnh trụ &\nkhớp SIFT/RANSAC"),
        ("04", "Tái tạo", "Ảnh 8K Panorama &\nmô hình 3D PBR"),
        ("05", "Tích hợp", "Định tuyến Dijkstra &\nvé VietQR PayOS"),
        ("06", "Triển khai", "Docker Compose &\nCloud VPS thực tế")
    ]
    sw = 5.8
    sgap = 0.42
    for idx, (num, title_s, desc_s) in enumerate(steps_data):
        sx = 44.0 + idx * (sw + sgap)
        sbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(sx), Cm(34.2), Cm(sw), Cm(8.4))
        sbox.fill.solid()
        sbox.fill.fore_color.rgb = C_SUBTLE_BG
        sbox.line.color.rgb = C_CARD_BORDER
        sbox.line.width = Pt(1.0)

        stb = slide.shapes.add_textbox(Cm(sx + 0.1), Cm(34.4), Cm(sw - 0.2), Cm(8.0))
        stf = stb.text_frame
        stf.word_wrap = True
        
        sp1 = stf.paragraphs[0]
        sp1.alignment = PP_ALIGN.CENTER
        sr1 = sp1.add_run()
        sr1.text = num + "\n"
        sr1.font.name = "Arial"
        sr1.font.size = Pt(18.0)
        sr1.font.bold = True
        sr1.font.color.rgb = C_IUH_BLUE

        sp2 = stf.add_paragraph()
        sp2.alignment = PP_ALIGN.CENTER
        sr2 = sp2.add_run()
        sr2.text = title_s + "\n"
        sr2.font.name = "Arial"
        sr2.font.size = Pt(12.5)
        sr2.font.bold = True
        sr2.font.color.rgb = C_NAVY_DEEP

        sp3 = stf.add_paragraph()
        sp3.alignment = PP_ALIGN.CENTER
        sr3 = sp3.add_run()
        sr3.text = desc_s
        sr3.font.name = "Arial"
        sr3.font.size = Pt(10.5)
        sr3.font.color.rgb = C_TEXT_MUTED

    # 7. Results (Kết quả thực nghiệm & Đo kiểm hiệu năng)
    add_card(43.3, 44.1, 38.4, 37.1, "7. Results (Kết quả thực nghiệm & Đo kiểm)")
    
    # 3 Khối chỉ số KPI hiệu năng (Thanh lịch, tối giản, không màu mè)
    metrics_data = [
        ("295 req/s", "Thông lượng xử lý đỉnh\n(Apache JMeter)"),
        ("0.45%", "Tỷ lệ lỗi khi chịu tải\n(1000 người dùng)"),
        ("1.42s (LCP)", "Google Lighthouse: 94/100\n(Tối ưu hóa chuẩn Web)")
    ]
    mw = 11.8
    for idx, (val, desc) in enumerate(metrics_data):
        mx = 44.0 + idx * (mw + 0.75)
        mbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(mx), Cm(46.3), Cm(mw), Cm(4.6))
        mbox.fill.solid()
        mbox.fill.fore_color.rgb = C_SUBTLE_BG
        mbox.line.color.rgb = C_CARD_BORDER
        mbox.line.width = Pt(1.0)

        mtb = slide.shapes.add_textbox(Cm(mx + 0.2), Cm(46.5), Cm(mw - 0.4), Cm(4.2))
        mtf = mtb.text_frame
        mtf.word_wrap = True
        
        mp1 = mtf.paragraphs[0]
        mp1.alignment = PP_ALIGN.CENTER
        mr1 = mp1.add_run()
        mr1.text = val + "\n"
        mr1.font.name = "Arial"
        mr1.font.size = Pt(18.0)
        mr1.font.bold = True
        mr1.font.color.rgb = C_IUH_BLUE

        mp2 = mtf.add_paragraph()
        mp2.alignment = PP_ALIGN.CENTER
        mr2 = mp2.add_run()
        mr2.text = desc
        mr2.font.name = "Arial"
        mr2.font.size = Pt(11.0)
        mr2.font.color.rgb = C_NAVY_DEEP

    # Hình ảnh giao diện đặt vé VietQR & Soát vé thực tế
    qr_img = 'baocaokhoaluan/assets/real_client_booking_vietqr.png'
    if os.path.exists(qr_img):
        slide.shapes.add_picture(qr_img, Cm(44.0), Cm(52.0), width=Cm(37.0))

    tb_rt = slide.shapes.add_textbox(Cm(44.0), Cm(67.2), Cm(37.0), Cm(13.2))
    tf_rt = tb_rt.text_frame
    tf_rt.word_wrap = True
    p_rt = tf_rt.paragraphs[0]
    r_rt = p_rt.add_run()
    r_rt.text = "• Định tuyến Dijkstra tối ưu: Giải thuật hàng đợi ưu tiên Min-Heap tìm lộ trình ngắn nhất qua 18 phòng và 34 cửa trong < 5ms với vệt sáng dẫn đường trực quan.\n• Thanh toán VietQR Napas 247 tự động: Khởi tạo mã QR động tức thì, xác thực thanh toán thời gian thực qua Webhook HMAC-SHA256 trong < 1s.\n• Soát vé QR di động: Camera nhận diện mã vé trong < 100ms, phòng chống tuyệt đối vé giả và quét trùng lặp."
    r_rt.font.name = "Arial"
    r_rt.font.size = Pt(13.5)
    r_rt.font.color.rgb = C_TEXT_DARK

    # 8. Conclusion (Kết luận & Đóng góp cốt lõi)
    add_card(43.3, 82.0, 38.4, 27.2, "8. Conclusion (Kết luận & Đóng góp)")
    tb_ccl = slide.shapes.add_textbox(Cm(44.0), Cm(84.2), Cm(37.0), Cm(24.0))
    tf_ccl = tb_ccl.text_frame
    tf_ccl.word_wrap = True
    conclusions_data = [
        ("Nâng tầm trải nghiệm: ", "Chuyển đổi không gian bảo tàng vật lý lên môi trường số 3D WebGL trực quan, giúp công chúng tiếp cận di sản mọi lúc mọi nơi."),
        ("Tiết kiệm ngân sách: ", "Quy trình ghép ảnh từ điện thoại thông minh giúp ban quản lý tự chủ thu thập dữ liệu, tiết kiệm hơn 85% chi phí đầu tư thiết bị."),
        ("Tăng cường tương tác: ", "Tích hợp trợ lý AI thuyết minh 7 ngôn ngữ, tìm đường tự động và thanh toán vé điện tử một chạm thuận tiện."),
        ("Bảo tồn di sản bền vững: ", "Thiết lập kho dữ liệu số hóa 3D vĩnh viễn, phục vụ nghiên cứu khoa học, giáo dục truyền thống và quảng bá văn hóa dân tộc.")
    ]
    for idx, (bld, txt) in enumerate(conclusions_data):
        p = tf_ccl.paragraphs[0] if idx == 0 else tf_ccl.add_paragraph()
        p.space_after = Pt(6)
        r_num = p.add_run()
        r_num.text = f"{idx+1}. "
        r_num.font.name = "Arial"
        r_num.font.size = Pt(14.5)
        r_num.font.bold = True
        r_num.font.color.rgb = C_IUH_BLUE

        r_b = p.add_run()
        r_b.text = bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(14.0)
        r_b.font.bold = True
        r_b.font.color.rgb = C_NAVY_DEEP

        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13.5)
        r_t.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # FOOTER BOTTOM BAR (Xanh Navy IUH trang nghiêm, tối giản)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(110.2), Cm(79.3), Cm(7.2))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_IUH_BLUE
    ftr_box.line.width = Pt(1.5)

    # Thông tin liên hệ Sinh viên 1
    tb_f1 = slide.shapes.add_textbox(Cm(4.0), Cm(110.6), Cm(26.0), Cm(6.4))
    tf_f1 = tb_f1.text_frame
    tf_f1.word_wrap = True
    p_f1 = tf_f1.paragraphs[0]
    r_f1 = p_f1.add_run()
    r_f1.text = "Huỳnh Tấn Lộc (Trưởng nhóm / Kiến trúc sư)\n"
    r_f1.font.name = "Arial"
    r_f1.font.size = Pt(15.5)
    r_f1.font.bold = True
    r_f1.font.color.rgb = C_WHITE
    r_f1_sub = p_f1.add_run()
    r_f1_sub.text = "Điện thoại: 0865 860 854\nEmail: huynhloc.dev@gmail.com"
    r_f1_sub.font.name = "Arial"
    r_f1_sub.font.size = Pt(13.0)
    r_f1_sub.font.color.rgb = hex_to_rgb('CBD5E1')

    # Thông tin liên hệ Sinh viên 2
    tb_f2 = slide.shapes.add_textbox(Cm(31.5), Cm(110.6), Cm(26.0), Cm(6.4))
    tf_f2 = tb_f2.text_frame
    tf_f2.word_wrap = True
    p_f2 = tf_f2.paragraphs[0]
    r_f2 = p_f2.add_run()
    r_f2.text = "Trịnh Vĩ Thành (Giao diện / Nghiên cứu)\n"
    r_f2.font.name = "Arial"
    r_f2.font.size = Pt(15.5)
    r_f2.font.bold = True
    r_f2.font.color.rgb = C_WHITE
    r_f2_sub = p_f2.add_run()
    r_f2_sub.text = "Điện thoại: 0389 002 845\nEmail: trinhvithanh@student.iuh.edu.vn"
    r_f2_sub.font.name = "Arial"
    r_f2_sub.font.size = Pt(13.0)
    r_f2_sub.font.color.rgb = hex_to_rgb('CBD5E1')

    # Logo IUH góc phải chân trang
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(68.5), Cm(111.4), width=Cm(11.5), height=Cm(4.12))

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"POSTER KHÔNG MÀU MÈ ĐÃ ĐƯỢC TẠO THÀNH CÔNG TẠI: {out_file}")

if __name__ == '__main__':
    create_academic_minimalist_poster()
