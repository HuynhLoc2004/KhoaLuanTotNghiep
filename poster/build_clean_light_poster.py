# -*- coding: utf-8 -*-
"""
Script tạo Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Phong cách: Clean, Modern, Minimalist, Academic Scientific Poster (English Version)
Nền sáng (Light background: #F8FAFC), Card trắng bo góc (#FFFFFF), Viền xám nhạt (#E2E8F0)
Màu chủ đạo: Deep Navy Blue (#0F2942), Muted Gold (#C59B27), Dark Slate (#333333)
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

# Bảng màu chuẩn theo yêu cầu thiết kế tối giản, học thuật
C_BG_PAGE     = hex_to_rgb('F1F5F9')  # Nền trang xám sáng sạch sẽ
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Nền card trắng tinh tế
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Viền card mỏng nhẹ
C_NAVY        = hex_to_rgb('0F2942')  # Xanh Navy đậm chủ đạo cho tiêu đề
C_GOLD        = hex_to_rgb('C59B27')  # Vàng hổ phách nhã nhặn cho điểm nhấn
C_TEXT_DARK   = hex_to_rgb('333333')  # Chữ nội dung xám đậm sắc nét
C_TEXT_MUTED  = hex_to_rgb('64748B')  # Chữ phụ đề / chú thích
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Thanh footer xanh navy vững chãi
C_WHITE       = hex_to_rgb('FFFFFF')  # Chữ trắng cho footer

def create_clean_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. Nền trang (Light clean background)
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = C_BG_PAGE
    bg_shape.line.fill.background()

    # 2. TOP HEADER BANNER (Nền trắng bo góc, bóng mờ nhẹ)
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.2), Cm(1.5), Cm(79.7), Cm(13.5))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_CARD_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(1.5)

    # Logo IUH góc trái Header (Tỷ lệ tự nhiên 349x125 -> W=11.5cm, H=4.12cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.6), Cm(2.4), width=Cm(11.5), height=Cm(4.12))

    # Thông tin Đơn vị đào tạo (Dải trên giữa)
    uni_tb = slide.shapes.add_textbox(Cm(16.5), Cm(2.0), Cm(64.0), Cm(3.6))
    tf_u = uni_tb.text_frame
    tf_u.word_wrap = True
    p_u1 = tf_u.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(20)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_NAVY

    p_u2 = tf_u.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "FACULTY OF INFORMATION TECHNOLOGY — SOFTWARE ENGINEERING DEPARTMENT"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(15.5)
    r_u2.font.bold = True
    r_u2.font.color.rgb = C_GOLD

    # Đường phân cách ngang thanh mảnh
    h_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(3.6), Cm(5.6), Cm(76.9), Cm(0.05))
    h_line.fill.solid()
    h_line.fill.fore_color.rgb = hex_to_rgb('E2E8F0')
    h_line.line.fill.background()

    # Khối Metadata Giảng viên & Sinh viên (Góc dưới trái của Header)
    meta_tb = slide.shapes.add_textbox(Cm(3.6), Cm(6.0), Cm(26.5), Cm(8.6))
    tf_m = meta_tb.text_frame
    tf_m.word_wrap = True
    
    p_ins = tf_m.paragraphs[0]
    r_in1 = p_ins.add_run()
    r_in1.text = "Instructor:\n"
    r_in1.font.name = "Arial"
    r_in1.font.size = Pt(14)
    r_in1.font.color.rgb = C_GOLD
    r_in2 = p_ins.add_run()
    r_in2.text = "PhD. Trần Thị Minh Khoa\n\n"
    r_in2.font.name = "Arial"
    r_in2.font.size = Pt(17.5)
    r_in2.font.bold = True
    r_in2.font.color.rgb = C_NAVY

    p_stu = tf_m.add_paragraph()
    r_st_l = p_stu.add_run()
    r_st_l.text = "Students:\n"
    r_st_l.font.name = "Arial"
    r_st_l.font.size = Pt(14)
    r_st_l.font.color.rgb = C_GOLD
    
    r_s1 = p_stu.add_run()
    r_s1.text = "• Huỳnh Tấn Lộc   — ID: 22686171\n"
    r_s1.font.name = "Arial"
    r_s1.font.size = Pt(16)
    r_s1.font.bold = True
    r_s1.font.color.rgb = C_NAVY

    r_s2 = p_stu.add_run()
    r_s2.text = "• Trịnh Vĩ Thành   — ID: 22689411\n"
    r_s2.font.name = "Arial"
    r_s2.font.size = Pt(16)
    r_s2.font.bold = True
    r_s2.font.color.rgb = C_NAVY

    r_sc = p_stu.add_run()
    r_sc.text = "Class: DHCNTT18ATT (Cohort 2022 - 2026)"
    r_sc.font.name = "Arial"
    r_sc.font.size = Pt(13)
    r_sc.font.color.rgb = C_TEXT_MUTED

    # Tiêu đề chính đề tài (Tiếng Anh, chữ to, đậm, rõ ràng)
    title_tb = slide.shapes.add_textbox(Cm(31.0), Cm(6.0), Cm(49.5), Cm(8.6))
    tf_t = title_tb.text_frame
    tf_t.word_wrap = True

    p_t1 = tf_t.paragraphs[0]
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM\nFOR HO CHI MINH CITY MUSEUM OF HISTORY\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(26)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_NAVY

    p_t2 = tf_t.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "Hệ thống tham quan thực tế ảo 360° & Số hóa không gian di sản Bảo tàng Lịch sử TP.HCM"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(15.5)
    r_t2.font.bold = True
    r_t2.font.italic = True
    r_t2.font.color.rgb = C_GOLD

    # =========================================================================
    # HÀM TẠO CARD TRẮNG TỐI GIẢN (Clean White Card)
    # =========================================================================
    def add_card(x, y, w, h, title_text):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.2)

        # Tiêu đề Card: Chữ Navy đậm, điểm nhấn gạch ngang vàng mỏng
        tb = slide.shapes.add_textbox(Cm(x + 0.8), Cm(y + 0.4), Cm(w - 1.6), Cm(1.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(21)
        r.font.bold = True
        r.font.color.rgb = C_NAVY

        # Đường gạch dưới tiêu đề màu vàng hổ phách nhã nhặn
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.8), Cm(y + 1.8), Cm(4.5), Cm(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = C_GOLD
        bar.line.fill.background()

        return card

    # =========================================================================
    # CỘT TRÁI (COL 1: X = 2.2cm, Width = 38.6cm)
    # =========================================================================

    # 1. System Architecture
    add_card(2.2, 16.0, 38.6, 19.5, "Design Diagram / System Architecture")
    arch_img = 'poster/assets/diagram_architecture_3tier_en.png'
    if not os.path.exists(arch_img):
        arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(3.0), Cm(18.2), width=Cm(37.0))

    tb_sa = slide.shapes.add_textbox(Cm(3.0), Cm(32.0), Cm(37.0), Cm(3.2))
    tf_sa = tb_sa.text_frame
    tf_sa.word_wrap = True
    p_sa = tf_sa.paragraphs[0]
    r_sa = p_sa.add_run()
    r_sa.text = "• Scalable 3-Tier Architecture: React 18 SPA (WebGL Three.js), Node.js v20 LTS API Gateway, and Polyglot Persistence (PostgreSQL 16 for ACID ticketing, MongoDB 7.0 for 360° metadata, and Redis Cache)."
    r_sa.font.name = "Arial"
    r_sa.font.size = Pt(13.8)
    r_sa.font.color.rgb = C_TEXT_DARK

    # 2. Target (Objectives matching poster layout)
    add_card(2.2, 36.8, 38.6, 14.5, "Target")
    tb_obj = slide.shapes.add_textbox(Cm(3.0), Cm(39.0), Cm(37.0), Cm(11.8))
    tf_obj = tb_obj.text_frame
    tf_obj.word_wrap = True
    objectives = [
        ("Optimize Experience & Search Space: ", "Digitize all 18 exhibition halls and 17 antiquities with interactive 3D WebGL (30-40% cheaper than physical audio guide devices)."),
        ("Optimize Algorithms & Accurate Rendering: ", "Dijkstra Min-Heap shortest-path pathfinding (< 5ms) and 60 FPS real-time rendering on commodity web browsers."),
        ("Quick Deployment & Cross-Platform: ", "Quickly deploy with responsive mobile-first design, fully compatible with smartphones, tablets, and desktop computers.")
    ]
    for idx, (bld, txt) in enumerate(objectives):
        p = tf_obj.paragraphs[0] if idx == 0 else tf_obj.add_paragraph()
        p.space_after = Pt(6)
        r_num = p.add_run()
        r_num.text = "✔ "
        r_num.font.name = "Arial"
        r_num.font.size = Pt(14.5)
        r_num.font.bold = True
        r_num.font.color.rgb = C_GOLD
        
        r_b = p.add_run()
        r_b.text = bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(14.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_NAVY

        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(14)
        r_t.font.color.rgb = C_TEXT_DARK

    # 3. Realistic Model / 3D Virtual Tour
    add_card(2.2, 52.5, 38.6, 31.5, "Realistic Model / 3D Virtual Tour")
    t360_img = 'poster/assets/tour360_interface.jpg'
    if os.path.exists(t360_img):
        slide.shapes.add_picture(t360_img, Cm(3.0), Cm(54.6), width=Cm(37.0))

    lotus_img = 'poster/assets/artifact_3d_lotus.jpg'
    if os.path.exists(lotus_img):
        slide.shapes.add_picture(lotus_img, Cm(12.0), Cm(69.2), width=Cm(19.0))

    tb_vti = slide.shapes.add_textbox(Cm(3.0), Cm(80.5), Cm(37.0), Cm(3.2))
    tf_vti = tb_vti.text_frame
    tf_vti.word_wrap = True
    p_vti = tf_vti.paragraphs[0]
    r_vti = p_vti.add_run()
    r_vti.text = "• Interactive 360° panorama environment rendered with WebGL Three.js at 60 FPS, supporting smooth spatial scene transitions, multi-language audio narration, and real-time 3D PBR artifact inspection."
    r_vti.font.name = "Arial"
    r_vti.font.size = Pt(13.8)
    r_vti.font.color.rgb = C_TEXT_DARK

    # 4. Process (Stitching Pipeline Diagram)
    add_card(2.2, 85.2, 38.6, 23.5, "Process")
    proc_img = 'poster/assets/diagram_stitching_process_en.png'
    if not os.path.exists(proc_img):
        proc_img = 'baocaokhoaluan/assets/diagrams/hinh_4_3_panorama_4inputs.png'
    if os.path.exists(proc_img):
        slide.shapes.add_picture(proc_img, Cm(3.0), Cm(87.4), width=Cm(37.0))

    tb_wf = slide.shapes.add_textbox(Cm(3.0), Cm(101.2), Cm(37.0), Cm(7.0))
    tf_wf = tb_wf.text_frame
    tf_wf.word_wrap = True
    p_wf = tf_wf.paragraphs[0]
    r_wf = p_wf.add_run()
    r_wf.text = "• Cylindrical Warping: Projects planar frames onto a cylindrical surface to eliminate perspective distortions.\n• SIFT Feature Matching & RANSAC: Extracts 128D invariant descriptors and robustly rejects geometric outliers.\n• Multiband Laplacian Blending: Decomposes images into frequency bands to smoothly erase seam boundaries."
    r_wf.font.name = "Arial"
    r_wf.font.size = Pt(13.5)
    r_wf.font.color.rgb = C_TEXT_DARK
    tf_wf.word_wrap = True
    p_wf = tf_wf.paragraphs[0]
    r_wf = p_wf.add_run()
    r_wf.text = "• Cylindrical Warping: Projects planar frames onto a cylindrical surface to eliminate perspective distortions.\n• SIFT Feature Matching & RANSAC: Extracts 128D invariant descriptors and robustly rejects geometric outliers.\n• Multiband Laplacian Blending: Decomposes images into frequency bands to smoothly erase seam boundaries."
    r_wf.font.name = "Arial"
    r_wf.font.size = Pt(13.5)
    r_wf.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 43.3cm, Width = 38.6cm)
    # =========================================================================

    # 1. Abstract
    add_card(43.3, 16.0, 38.6, 14.5, "Abstract")
    tb_ab = slide.shapes.add_textbox(Cm(44.1), Cm(18.2), Cm(37.0), Cm(11.8))
    tf_ab = tb_ab.text_frame
    tf_ab.word_wrap = True
    p_ab1 = tf_ab.paragraphs[0]
    p_ab1.space_after = Pt(6)
    r_ab1 = p_ab1.add_run()
    r_ab1.text = "In response to Vietnam's National Digital Transformation Strategy (Decision 749/QĐ-TTg), this study presents an end-to-end, cost-effective digital heritage preservation system deployed at the Museum of History in Ho Chi Minh City."
    r_ab1.font.name = "Arial"
    r_ab1.font.size = Pt(14.5)
    r_ab1.font.color.rgb = C_TEXT_DARK

    p_ab2 = tf_ab.add_paragraph()
    r_ab2 = p_ab2.add_run()
    r_ab2.text = "The platform synthesizes computer vision algorithms, WebGL 3D graphics, graph theory pathfinding, conversational AI agents, and national banking payment gateways. By converting video sweeps from handheld smartphones into 8K Equirectangular panoramas, the solution eliminates dependence on costly professional 360° cameras, establishing an accessible digital ecosystem for both museum visitors and administrators."
    r_ab2.font.name = "Arial"
    r_ab2.font.size = Pt(14.5)
    r_ab2.font.color.rgb = C_TEXT_DARK

    # 2. Procedure (6 horizontal numbered steps)
    add_card(43.3, 31.7, 38.6, 10.5, "Procedure")
    steps_data = [
        ("01", "Survey", "On-site 18-room\ntopology survey"),
        ("02", "Collection", "Video sweeps &\nmulti-angle photos"),
        ("03", "Processing", "Cylindrical warping\n& SIFT matching"),
        ("04", "Reconstruction", "8K Panoramas &\n3D PBR models"),
        ("05", "Integration", "Dijkstra routing &\nVietQR payment"),
        ("06", "Publication", "Cloud VPS deploy\n& museum launch")
    ]
    sw = 5.8
    sgap = 0.44
    for idx, (num, title_s, desc_s) in enumerate(steps_data):
        sx = 44.1 + idx * (sw + sgap)
        sbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(sx), Cm(33.8), Cm(sw), Cm(7.8))
        sbox.fill.solid()
        sbox.fill.fore_color.rgb = hex_to_rgb('F8FAFC')
        sbox.line.color.rgb = C_GOLD if idx in [2, 3] else C_CARD_BORDER
        sbox.line.width = Pt(1.5)

        stb = slide.shapes.add_textbox(Cm(sx + 0.1), Cm(34.0), Cm(sw - 0.2), Cm(7.4))
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
        sr2.text = title_s + "\n"
        sr2.font.name = "Arial"
        sr2.font.size = Pt(12)
        sr2.font.bold = True
        sr2.font.color.rgb = C_NAVY

        sp3 = stf.add_paragraph()
        sp3.alignment = PP_ALIGN.CENTER
        sr3 = sp3.add_run()
        sr3.text = desc_s
        sr3.font.name = "Arial"
        sr3.font.size = Pt(10)
        sr3.font.color.rgb = C_TEXT_MUTED

    # 3. Results (Performance benchmarks & real UI screenshots)
    add_card(43.3, 43.4, 38.6, 40.5, "Results")
    # Anh Dijkstra Routing
    dijk_img = 'baocaokhoaluan/assets/diagrams/hinh_4_7_dijkstra_flow.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, Cm(44.1), Cm(45.5), width=Cm(18.0))

    # Anh Homepage nguoi dung gui
    hero_img = 'poster/assets/hero_homepage.jpg'
    if os.path.exists(hero_img):
        slide.shapes.add_picture(hero_img, Cm(63.1), Cm(45.5), width=Cm(18.0))

    # 3 Metrics blocks nhã nhặn, thanh lịch
    metrics_data = [
        ("295 req/s", "Peak Throughput (Apache JMeter)"),
        ("0.45%", "Error Rate at 1000 Users"),
        ("1.42s (LCP)", "Google Lighthouse: 94/100")
    ]
    mw = 11.9
    for idx, (val, desc) in enumerate(metrics_data):
        mx = 44.1 + idx * (mw + 0.65)
        mbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(mx), Cm(57.2), Cm(mw), Cm(4.0))
        mbox.fill.solid()
        mbox.fill.fore_color.rgb = hex_to_rgb('F8FAFC')
        mbox.line.color.rgb = C_CARD_BORDER
        mbox.line.width = Pt(1.2)

        mtb = slide.shapes.add_textbox(Cm(mx + 0.2), Cm(57.4), Cm(mw - 0.4), Cm(3.6))
        mtf = mtb.text_frame
        mtf.word_wrap = True
        
        mp1 = mtf.paragraphs[0]
        mp1.alignment = PP_ALIGN.CENTER
        mr1 = mp1.add_run()
        mr1.text = val + "\n"
        mr1.font.name = "Arial"
        mr1.font.size = Pt(18)
        mr1.font.bold = True
        mr1.font.color.rgb = C_GOLD

        mp2 = mtf.add_paragraph()
        mp2.alignment = PP_ALIGN.CENTER
        mr2 = mp2.add_run()
        mr2.text = desc
        mr2.font.name = "Arial"
        mr2.font.size = Pt(11)
        mr2.font.color.rgb = C_TEXT_DARK

    # Giao dien thanh toan VietQR Napas
    qr_img = 'baocaokhoaluan/assets/real_client_booking_vietqr.png'
    if os.path.exists(qr_img):
        slide.shapes.add_picture(qr_img, Cm(44.1), Cm(62.2), width=Cm(37.0))

    tb_rt = slide.shapes.add_textbox(Cm(44.1), Cm(75.5), Cm(37.0), Cm(7.8))
    tf_rt = tb_rt.text_frame
    tf_rt.word_wrap = True
    p_rt = tf_rt.paragraphs[0]
    r_rt = p_rt.add_run()
    r_rt.text = "• Dijkstra Navigation: Resolves shortest path across 18 galleries and 34 hallways in < 5ms with visual glowing trails.\n• Automated VietQR Payment: Dynamic QR issuance and instant payment verification via HMAC-SHA256 Webhook in < 1s.\n• Real-time Mobile QR Check-in: Sub-100ms camera validation preventing ticket duplication and fraud."
    r_rt.font.name = "Arial"
    r_rt.font.size = Pt(13.8)
    r_rt.font.color.rgb = C_TEXT_DARK

    # 4. Conclusion (4 numbered takeaway points)
    add_card(43.3, 85.1, 38.6, 23.6, "Conclusion")
    tb_ccl = slide.shapes.add_textbox(Cm(44.1), Cm(87.4), Cm(37.0), Cm(20.5))
    tf_ccl = tb_ccl.text_frame
    tf_ccl.word_wrap = True
    conclusions_data = [
        ("Upgrade Experience: ", "Transforming physical visits into interactive 3D WebGL spaces, making museum heritage accessible anytime, anywhere."),
        ("Cost-Effective Deployment: ", "Easily manageable and deployable by museum staff without relying on costly proprietary 360° scanning gear."),
        ("Enhance Interaction: ", "Empowering visitors through intuitive 3D inspection, 7-language AI TTS audio narration, and real-time Dijkstra navigation."),
        ("Preserve Heritage: ", "Establishing a high-fidelity, permanent digital archive to safeguard historical national treasures sustainably.")
    ]
    for idx, (bld, txt) in enumerate(conclusions_data):
        p = tf_ccl.paragraphs[0] if idx == 0 else tf_ccl.add_paragraph()
        p.space_after = Pt(6)
        r_num = p.add_run()
        r_num.text = f"{idx+1}. "
        r_num.font.name = "Arial"
        r_num.font.size = Pt(14.5)
        r_num.font.bold = True
        r_num.font.color.rgb = C_GOLD

        r_b = p.add_run()
        r_b.text = bld
        r_b.font.name = "Arial"
        r_b.font.size = Pt(14.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_NAVY

        r_t = p.add_run()
        r_t.text = txt
        r_t.font.name = "Arial"
        r_t.font.size = Pt(14)
        r_t.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # FOOTER BOTTOM BAR (Solid Dark Navy Blue Bar)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.2), Cm(109.8), Cm(79.7), Cm(7.5))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_GOLD
    ftr_box.line.width = Pt(1.5)

    # Thông tin liên hệ Sinh viên 1
    tb_f1 = slide.shapes.add_textbox(Cm(3.8), Cm(110.2), Cm(25.0), Cm(6.8))
    tf_f1 = tb_f1.text_frame
    tf_f1.word_wrap = True
    p_f1 = tf_f1.paragraphs[0]
    r_f1 = p_f1.add_run()
    r_f1.text = "Huỳnh Tấn Lộc (Lead Architect)\n"
    r_f1.font.name = "Arial"
    r_f1.font.size = Pt(16.5)
    r_f1.font.bold = True
    r_f1.font.color.rgb = C_GOLD
    r_f1_sub = p_f1.add_run()
    r_f1_sub.text = "Phone: (+84) 865 860 854\nEmail: huynhloc.dev@gmail.com"
    r_f1_sub.font.name = "Arial"
    r_f1_sub.font.size = Pt(14)
    r_f1_sub.font.color.rgb = hex_to_rgb('E2E8F0')

    # Thông tin liên hệ Sinh viên 2
    tb_f2 = slide.shapes.add_textbox(Cm(30.0), Cm(110.2), Cm(25.0), Cm(6.8))
    tf_f2 = tb_f2.text_frame
    tf_f2.word_wrap = True
    p_f2 = tf_f2.paragraphs[0]
    r_f2 = p_f2.add_run()
    r_f2.text = "Trịnh Vĩ Thành (Frontend / Researcher)\n"
    r_f2.font.name = "Arial"
    r_f2.font.size = Pt(16.5)
    r_f2.font.bold = True
    r_f2.font.color.rgb = C_GOLD
    r_f2_sub = p_f2.add_run()
    r_f2_sub.text = "Phone: (+84) 389 002 845\nEmail: trinhvithanh@student.iuh.edu.vn"
    r_f2_sub.font.name = "Arial"
    r_f2_sub.font.size = Pt(14)
    r_f2_sub.font.color.rgb = hex_to_rgb('E2E8F0')

    # Logo IUH góc phải chân trang
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(68.5), Cm(110.6), width=Cm(11.5), height=Cm(4.12))

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"CLEAN MINIMALIST POSTER SAVED TO: {out_file}")

if __name__ == '__main__':
    create_clean_poster()
