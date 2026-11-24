# -*- coding: utf-8 -*-
"""
Script thiết kế Poster Khóa luận Tốt nghiệp chuẩn A0 đứng (84.1cm x 118.9cm)
Đề tài: 360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM FOR HO CHI MINH CITY MUSEUM OF HISTORY
Đơn vị: Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH) - Khoa Công nghệ Thông tin

ĐẶC ĐIỂM THIẾT KẾ MASTER THEO YÊU CẦU CỦA NGƯỜI DÙNG:
1. 100% Tiếng Anh học thuật chuẩn mực quốc tế (Publication Grade Academic English).
2. Ảnh nền Watermark Bảo tàng Lịch sử TP.HCM làm mờ (92% white overlay + blur), tinh tế, trang trọng, không làm ảnh hưởng chữ.
3. Đồng bộ 100% font chữ Arial sắc nét, phân cấp typographic chuẩn mực, không dùng font bừa bãi.
4. Căn chỉnh đối xứng hoàn hảo, tuyệt đối KHÔNG TRÀN VIỀN (cách lề dưới an toàn 2.1cm).
5. Trình bày đầy đủ tất cả các công nghệ sử dụng (Frontend, Backend, Databases, CV, 3D, AI, Cloud, DevOps).
6. Tích hợp trọn vẹn 5 sơ đồ luồng chức năng mới nhất (Architecture, 360 Stitching, 3D Reconstruction, Dijkstra, Voice AI, VietQR).
7. Tích hợp đầy đủ Thống kê & So sánh:
   - Bảng 4.1: So sánh 4 phương thức tạo không gian 360°
   - Bảng 4.2: So sánh 2 động cơ tái tạo cổ vật 3D (Local CPU vs Cloud AI TRELLIS)
   - Hình tròn Google Lighthouse Core Web Vitals (Performance 94, Accessibility 98, Best Practices 100, SEO 100)
   - Biểu đồ đo kiểm JMeter Throughput & Error Rate (295 req/s, 0.45% error rate).
8. Header và Footer chỉn chu, đồng bộ, chuyên nghiệp.
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

# Bảng màu chuẩn học thuật quốc tế (Clean Academic Palette)
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Nền card trắng tinh khiết
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Viền card xám slate nhạt, cực mảnh (1.0pt)
C_HEADER_BG   = hex_to_rgb('FFFFFF')  # Nền header trắng đồng bộ
C_IUH_BLUE    = hex_to_rgb('005BAA')  # Xanh IUH chính thức
C_NAVY_DEEP   = hex_to_rgb('0F2942')  # Xanh Navy đậm học thuật
C_TEXT_DARK   = hex_to_rgb('0F172A')  # Chữ đen than chì sắc nét
C_TEXT_MUTED  = hex_to_rgb('475569')  # Chữ phụ đề trung tính
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Nền footer xanh Navy vững chãi
C_WHITE       = hex_to_rgb('FFFFFF')  # Chữ trắng cho footer
C_SUBTLE_BG   = hex_to_rgb('F8FAFC')  # Nền phụ trợ cho các bảng và khối KPI
C_BORDER_SUB  = hex_to_rgb('E2E8F0')  # Viền nhẹ cho các bảng phụ

def create_master_poster():
    prs = pptx.Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 1. ẢNH NỀN WATERMARK BẢO TÀNG LỊCH SỬ TP.HCM (LÀM MỜ, TINH TẾ, KHÔNG ẢNH HƯỞNG CHỮ)
    bg_watermark = 'poster/assets/museum_watermark_bg.png'
    if os.path.exists(bg_watermark):
        slide.shapes.add_picture(bg_watermark, 0, 0, width=Cm(84.1), height=Cm(118.9))
    else:
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Cm(84.1), Cm(118.9))
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = hex_to_rgb('FFFFFF')
        bg_shape.line.fill.background()

    # =========================================================================
    # 2. HEADER TOP BANNER (Y = 1.5cm, Height = 10.6cm, Width = 80.1cm, X = 2.0cm)
    # =========================================================================
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.0), Cm(1.5), Cm(80.1), Cm(10.6))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_HEADER_BG
    hdr_box.line.color.rgb = C_CARD_BORDER
    hdr_box.line.width = Pt(1.2)

    # Logo IUH góc trái Header (W=11.2cm, H=4.01cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(3.2), Cm(2.3), width=Cm(11.2), height=Cm(4.01))

    # Khối giữa: Tên Trường, Khoa và Tiêu đề Đề tài bằng tiếng Anh chuẩn mực
    mid_tb = slide.shapes.add_textbox(Cm(15.2), Cm(1.7), Cm(47.2), Cm(10.2))
    tf_m = mid_tb.text_frame
    tf_m.word_wrap = True

    p_u1 = tf_m.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "MINISTRY OF INDUSTRY AND TRADE — INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(15.5)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_IUH_BLUE

    p_u2 = tf_m.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "FACULTY OF INFORMATION TECHNOLOGY — SOFTWARE ENGINEERING DEPARTMENT\n\n"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(13.0)
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
    r_t2.text = "FOR HO CHI MINH CITY MUSEUM OF HISTORY\n"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(19.0)
    r_t2.font.bold = True
    r_t2.font.color.rgb = C_IUH_BLUE

    p_t3 = tf_m.add_paragraph()
    p_t3.alignment = PP_ALIGN.CENTER
    r_t3 = p_t3.add_run()
    r_t3.text = "A High-Performance WebGL 3D, Computer Vision & Multimodal AI Digital Preservation Platform"
    r_t3.font.name = "Arial"
    r_t3.font.size = Pt(12.5)
    r_t3.font.italic = True
    r_t3.font.color.rgb = C_TEXT_MUTED

    # Khối bên phải: Giảng viên hướng dẫn & Sinh viên thực hiện (Card chuyên nghiệp)
    meta_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(63.2), Cm(1.8), Cm(18.2), Cm(10.0))
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = C_SUBTLE_BG
    meta_box.line.color.rgb = C_BORDER_SUB
    meta_box.line.width = Pt(1.0)

    meta_tb = slide.shapes.add_textbox(Cm(63.5), Cm(2.0), Cm(17.6), Cm(9.6))
    tf_meta = meta_tb.text_frame
    tf_meta.word_wrap = True

    p_gv = tf_meta.paragraphs[0]
    r_gv_lbl = p_gv.add_run()
    r_gv_lbl.text = "Advisor:\n"
    r_gv_lbl.font.name = "Arial"
    r_gv_lbl.font.size = Pt(12.0)
    r_gv_lbl.font.bold = True
    r_gv_lbl.font.color.rgb = C_IUH_BLUE
    r_gv_val = p_gv.add_run()
    r_gv_val.text = "PhD. Tran Thi Minh Khoa\n\n"
    r_gv_val.font.name = "Arial"
    r_gv_val.font.size = Pt(14.5)
    r_gv_val.font.bold = True
    r_gv_val.font.color.rgb = C_NAVY_DEEP

    p_sv = tf_meta.add_paragraph()
    r_sv_lbl = p_sv.add_run()
    r_sv_lbl.text = "Students:\n"
    r_sv_lbl.font.name = "Arial"
    r_sv_lbl.font.size = Pt(12.0)
    r_sv_lbl.font.bold = True
    r_sv_lbl.font.color.rgb = C_IUH_BLUE

    r_sv1 = p_sv.add_run()
    r_sv1.text = "• Huynh Tan Loc (ID: 22686171)\n"
    r_sv1.font.name = "Arial"
    r_sv1.font.size = Pt(13.5)
    r_sv1.font.bold = True
    r_sv1.font.color.rgb = C_TEXT_DARK

    r_sv2 = p_sv.add_run()
    r_sv2.text = "• Trinh Vi Thanh (ID: 22689411)\n"
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
    # HÀM TẠO CARD CHỨC NĂNG (Khoa học, viền thanh mảnh, không đè lấn)
    # =========================================================================
    def add_func_card(x, y, w, h, title_text, badge_text=""):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(x), Cm(y), Cm(w), Cm(h))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1.0)

        # Tiêu đề Card: Chữ Navy đậm đà, tối giản
        tb = slide.shapes.add_textbox(Cm(x + 0.6), Cm(y + 0.3), Cm(w - 1.2), Cm(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title_text
        r.font.name = "Arial"
        r.font.size = Pt(17.0)
        r.font.bold = True
        r.font.color.rgb = C_NAVY_DEEP

        if badge_text:
            r_b = p.add_run()
            r_b.text = f"  [{badge_text}]"
            r_b.font.name = "Arial"
            r_b.font.size = Pt(12.5)
            r_b.font.bold = True
            r_b.font.color.rgb = C_IUH_BLUE

        # Đường gạch chân tiêu đề màu Xanh IUH
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Cm(x + 0.6), Cm(y + 1.5), Cm(4.5), Cm(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = C_IUH_BLUE
        bar.line.fill.background()

        return card

    # =========================================================================
    # CỘT TRÁI (COL 1: X = 2.0cm, Width = 38.8cm, Height = 99.7cm)
    # Y bắt đầu: 12.8cm -> Y kết thúc: 112.5cm
    # =========================================================================

    # 1. System Architecture & Full Technology Stack
    # Y = 12.8cm -> 35.8cm (Cao 23.0cm)
    add_func_card(2.0, 12.8, 38.8, 23.0, "1. System Architecture & Technology Stack", "3-Tier Scalable Design")
    arch_img = 'baocaokhoaluan/assets/diagrams/hinh_2_9_architecture_3tier.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, Cm(2.4), Cm(14.5), width=Cm(38.0), height=Cm(12.6))

    # Hộp danh mục công nghệ đầy đủ (Full Tech Stack Box)
    tech_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(27.5), Cm(38.0), Cm(7.8))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = C_SUBTLE_BG
    tech_box.line.color.rgb = C_BORDER_SUB
    tech_box.line.width = Pt(0.8)

    tb_tech = slide.shapes.add_textbox(Cm(2.6), Cm(27.6), Cm(37.6), Cm(7.5))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True
    
    p_t_h = tf_tech.paragraphs[0]
    r_th = p_t_h.add_run()
    r_th.text = "FULL TECHNOLOGY STACK & PRODUCTION DEPLOYMENT:\n"
    r_th.font.name = "Arial"
    r_th.font.size = Pt(11.5)
    r_th.font.bold = True
    r_th.font.color.rgb = C_IUH_BLUE

    p_t_b = tf_tech.add_paragraph()
    r_tb = p_t_b.add_run()
    r_tb.text = (
        "• Frontend & 3D: React 18, Three.js WebGL (60 FPS), TypeScript, Tailwind CSS, Vite\n"
        "• Backend & Services: Node.js v20, Express, RESTful APIs Gateway, Server-Sent Events (SSE)\n"
        "• Databases & Cache: PostgreSQL 16 (ACID Tickets), MongoDB 7.0 (Metadata), Redis 7 (Cache)\n"
        "• Computer Vision & 3D: OpenCV, SIFT, RANSAC, Multiband Blending, COLMAP SfM, Microsoft TRELLIS\n"
        "• Integrations & DevOps: PayOS VietQR, Google Cloud TTS (Neural2), Docker Compose, Nginx, Grafana"
    )
    r_tb.font.name = "Arial"
    r_tb.font.size = Pt(11.0)
    r_tb.font.color.rgb = C_TEXT_DARK

    # 2. 360° Panorama Space Creation Flow & Input Modalities
    # Y = 36.6cm -> 73.8cm (Cao 37.2cm)
    add_func_card(2.0, 36.6, 38.8, 37.2, "2. 360° Panorama Space Creation Pipeline", "Multimodal CV Workflow")
    stitch_img = 'baocaokhoaluan/assets/diagrams/flow_01_stitching_process.png'
    if os.path.exists(stitch_img):
        slide.shapes.add_picture(stitch_img, Cm(2.4), Cm(38.3), width=Cm(38.0), height=Cm(13.5))

    # Bảng 4.1: So sánh 4 phương thức tạo không gian toàn cảnh (Table 4.1 Modalities)
    t41_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(52.2), Cm(38.0), Cm(7.6))
    t41_box.fill.solid()
    t41_box.fill.fore_color.rgb = C_SUBTLE_BG
    t41_box.line.color.rgb = C_BORDER_SUB
    t41_box.line.width = Pt(0.8)

    tb_t41 = slide.shapes.add_textbox(Cm(2.6), Cm(52.3), Cm(37.6), Cm(7.4))
    tf_t41 = tb_t41.text_frame
    tf_t41.word_wrap = True

    p_t41_h = tf_t41.paragraphs[0]
    r_t41h = p_t41_h.add_run()
    r_t41h.text = "TABLE 4.1: COMPARISON OF 4 PANORAMA CREATION MODALITIES IN STUDIO\n"
    r_t41h.font.name = "Arial"
    r_t41h.font.size = Pt(11.0)
    r_t41h.font.bold = True
    r_t41h.font.color.rgb = C_IUH_BLUE

    p_t41_b = tf_t41.add_paragraph()
    r_t41b = p_t41_b.add_run()
    r_t41b.text = (
        "• Webcam Capture: Laptop / USB camera | 2–3 mins/room | 2K (2048x1024) | Rapid on-site testing\n"
        "• DSLR / High-res Photos: Mirrorless/DSLR | 1–2 mins load | 4K (4096x2048) | Archival studio quality\n"
        "• Smartphone Video Sweep: Smartphone/Gimbal | 30–45s sweep | 4K (3840x1920) | High-traffic rooms\n"
        "• Live Mobile Sweep: 4G Smartphone | 1–2 mins | 3K (3072x1536) | Real-time field survey & verification"
    )
    r_t41b.font.name = "Arial"
    r_t41b.font.size = Pt(10.5)
    r_t41b.font.color.rgb = C_TEXT_DARK

    # Ảnh chụp thực tế giao diện Tour 360°
    tour_ui_img = 'poster/assets/tour360_interface.jpg'
    if os.path.exists(tour_ui_img):
        slide.shapes.add_picture(tour_ui_img, Cm(2.4), Cm(60.2), width=Cm(38.0), height=Cm(10.2))

    tb_c2 = slide.shapes.add_textbox(Cm(2.2), Cm(70.6), Cm(38.4), Cm(3.0))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    r_c2 = p_c2.add_run()
    r_c2.text = "• End-to-End CV Pipeline: Cylindrical Warping → DoG SIFT Feature Extraction → RANSAC Homography Optimization → Multiband Laplacian Blending generates pristine 8K Equirectangular panoramas."
    r_c2.font.name = "Arial"
    r_c2.font.size = Pt(11.5)
    r_c2.font.color.rgb = C_TEXT_DARK

    # 3. Dual-Engine 3D Artifact Reconstruction Flow & Comparison
    # Y = 74.6cm -> 112.5cm (Cao 37.9cm)
    add_func_card(2.0, 74.6, 38.8, 37.9, "3. Dual-Engine 3D Artifact Reconstruction", "Local CPU vs. Cloud AI")
    d3_img = 'baocaokhoaluan/assets/diagrams/flow_04_dual_engine_3d.png'
    if os.path.exists(d3_img):
        slide.shapes.add_picture(d3_img, Cm(2.4), Cm(76.3), width=Cm(38.0), height=Cm(10.6))

    # Bảng 4.2: So sánh chuyên sâu giữa 2 động cơ tái tạo 3D (Table 4.2 Engines)
    t42_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.4), Cm(87.3), Cm(38.0), Cm(9.6))
    t42_box.fill.solid()
    t42_box.fill.fore_color.rgb = C_SUBTLE_BG
    t42_box.line.color.rgb = C_BORDER_SUB
    t42_box.line.width = Pt(0.8)

    tb_t42 = slide.shapes.add_textbox(Cm(2.6), Cm(87.4), Cm(37.6), Cm(9.3))
    tf_t42 = tb_t42.text_frame
    tf_t42.word_wrap = True

    p_t42_h = tf_t42.paragraphs[0]
    r_t42h = p_t42_h.add_run()
    r_t42h.text = "TABLE 4.2: DEEP EVALUATION OF DUAL 3D RECONSTRUCTION ENGINES\n"
    r_t42h.font.name = "Arial"
    r_t42h.font.size = Pt(11.0)
    r_t42h.font.bold = True
    r_t42h.font.color.rgb = C_IUH_BLUE

    p_t42_b = tf_t42.add_paragraph()
    r_t42b = p_t42_b.add_run()
    r_t42b.text = (
        "• Generation Latency: Local CPU: 0.8s – 1.2s (Ultra-fast) | Cloud AI TRELLIS: 35s – 60s\n"
        "• Hardware Resource: Local CPU: Commodity x86 CPU, 2GB RAM | Cloud AI: NVIDIA A100 GPU\n"
        "• Cost & Independence: Local CPU: 0 VNĐ (Self-hosted) | Cloud AI: ZeroGPU Quota Fallback\n"
        "• Geometric Fidelity: Local CPU: Optimal for axial-symmetric relics | Cloud AI: High-relief statues\n"
        "• Texture Realism: Local CPU: 2.5D projection | Cloud AI: Multi-angle PBR shader textures\n"
        "• Offline Resilience: Local CPU: 100% offline autonomy | Cloud AI: Requires Cloud API uplink"
    )
    r_t42b.font.name = "Arial"
    r_t42b.font.size = Pt(10.5)
    r_t42b.font.color.rgb = C_TEXT_DARK

    # Ảnh chụp giao diện chiêm ngưỡng cổ vật 3D thực tế
    art_ui = 'baocaokhoaluan/assets/real_client_artifacts_section.png'
    if not os.path.exists(art_ui):
        art_ui = 'poster/assets/artifact_3d_lotus.jpg'
    if os.path.exists(art_ui):
        slide.shapes.add_picture(art_ui, Cm(2.4), Cm(97.3), width=Cm(38.0), height=Cm(11.6))

    tb_c3 = slide.shapes.add_textbox(Cm(2.2), Cm(109.1), Cm(38.4), Cm(3.2))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    p_c3 = tf_c3.paragraphs[0]
    r_c3 = p_c3.add_run()
    r_c3.text = "• Interactive 3D PBR Inspection: Renders at 60 FPS in WebGL Three.js. Dual-engine architecture guarantees zero-downtime failover between on-premise CPU and cloud GPU AI."
    r_c3.font.name = "Arial"
    r_c3.font.size = Pt(11.5)
    r_c3.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # CỘT PHẢI (COL 2: X = 43.3cm, Width = 38.8cm, Height = 99.7cm)
    # Y bắt đầu: 12.8cm -> Y kết thúc: 112.5cm
    # =========================================================================

    # 4. Floor Plan & Dijkstra Pathfinding Navigation Flow
    # Y = 12.8cm -> 35.8cm (Cao 23.0cm)
    add_func_card(43.3, 12.8, 38.8, 23.0, "4. Floor Plan & Dijkstra Pathfinding Flow", "Optimal Route Routing")
    dijk_img = 'baocaokhoaluan/assets/diagrams/flow_02_floorplan_dijkstra.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, Cm(43.7), Cm(14.5), width=Cm(38.0), height=Cm(15.2))

    tb_c4 = slide.shapes.add_textbox(Cm(43.5), Cm(30.4), Cm(38.4), Cm(5.0))
    tf_c4 = tb_c4.text_frame
    tf_c4.word_wrap = True
    p_c4 = tf_c4.paragraphs[0]
    r_c4 = p_c4.add_run()
    r_c4.text = "• 18-Room Topological Graph & 34 Portals: Min-Heap Dijkstra algorithm computes optimal route in < 5ms latency, drawing animated glowing 3D pathlines to guide visitors across museum galleries."
    r_c4.font.name = "Arial"
    r_c4.font.size = Pt(12.0)
    r_c4.font.color.rgb = C_TEXT_DARK

    # 5. Multilingual Translation & Voice AI TTS Pipeline
    # Y = 36.6cm -> 60.0cm (Cao 23.4cm)
    add_func_card(43.3, 36.6, 38.8, 23.4, "5. Multilingual Translation & Voice AI TTS", "Cloud AI Audio Pipeline")
    voice_img = 'baocaokhoaluan/assets/diagrams/flow_03_languages_voice_ai.png'
    if os.path.exists(voice_img):
        slide.shapes.add_picture(voice_img, Cm(43.7), Cm(38.3), width=Cm(38.0), height=Cm(15.2))

    tb_c5 = slide.shapes.add_textbox(Cm(43.5), Cm(54.2), Cm(38.4), Cm(5.2))
    tf_c5 = tb_c5.text_frame
    tf_c5.word_wrap = True
    p_c5 = tf_c5.paragraphs[0]
    r_c5 = p_c5.add_run()
    r_c5.text = "• Automated Localization & Narration: 7-language auto-translation (Google Cloud Translation API) combined with human-like Neural2 speech synthesis (Google Cloud TTS), cached on Cloudinary CDN for instant playback."
    r_c5.font.name = "Arial"
    r_c5.font.size = Pt(12.0)
    r_c5.font.color.rgb = C_TEXT_DARK

    # 6. Online VietQR Payment & Mobile QR Check-in Flow
    # Y = 60.8cm -> 84.6cm (Cao 23.8cm)
    add_func_card(43.3, 60.8, 38.8, 23.8, "6. VietQR Payment & Mobile QR Check-in", "Automated PayOS Gateway")
    ticket_img = 'baocaokhoaluan/assets/diagrams/flow_05_ticketing_vietqr_qr.png'
    if os.path.exists(ticket_img):
        slide.shapes.add_picture(ticket_img, Cm(43.7), Cm(62.5), width=Cm(38.0), height=Cm(15.2))

    tb_c6 = slide.shapes.add_textbox(Cm(43.5), Cm(78.4), Cm(38.4), Cm(5.6))
    tf_c6 = tb_c6.text_frame
    tf_c6.word_wrap = True
    p_c6 = tf_c6.paragraphs[0]
    r_c6 = p_c6.add_run()
    r_c6.text = "• Automated VietQR Napas 247: Instant dynamic QR issuance with sub-second HMAC-SHA256 webhook settlement (< 1s). Mobile check-in validates digital tickets in < 100ms with AES-256 anti-counterfeiting token protection."
    r_c6.font.name = "Arial"
    r_c6.font.size = Pt(12.0)
    r_c6.font.color.rgb = C_TEXT_DARK

    # 7. Performance Benchmarks, JMeter Charts & Google Lighthouse (Hình tròn Web Vitals)
    # Y = 85.4cm -> 112.5cm (Cao 27.1cm)
    add_func_card(43.3, 85.4, 38.8, 27.1, "7. Experimental Evaluation & Core Web Vitals", "SSRC Paper Benchmarks")

    # 4 Khối chỉ số KPI định lượng (SSRC Paper Metrics)
    metrics_data = [
        ("295 req/s", "Peak Throughput\n(1,000 Users Load)"),
        ("0.45%", "Stress Error Rate\n(99.55% Availability)"),
        ("1.42s", "LCP Web Vitals\n(Fast 4G Mobile Load)"),
        ("< 5ms", "Dijkstra Latency\n(18 Interconnected Halls)")
    ]
    kpi_w = 9.0
    kpi_gap = 0.53
    for idx, (val, desc) in enumerate(metrics_data):
        kx = 43.7 + idx * (kpi_w + kpi_gap)
        kbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(kx), Cm(87.2), Cm(kpi_w), Cm(4.0))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = C_SUBTLE_BG
        kbox.line.color.rgb = C_CARD_BORDER
        kbox.line.width = Pt(0.8)

        ktb = slide.shapes.add_textbox(Cm(kx + 0.1), Cm(87.3), Cm(kpi_w - 0.2), Cm(3.8))
        ktf = ktb.text_frame
        ktf.word_wrap = True
        
        kp1 = ktf.paragraphs[0]
        kp1.alignment = PP_ALIGN.CENTER
        kr1 = kp1.add_run()
        kr1.text = val + "\n"
        kr1.font.name = "Arial"
        kr1.font.size = Pt(15.5)
        kr1.font.bold = True
        kr1.font.color.rgb = C_IUH_BLUE

        kp2 = ktf.add_paragraph()
        kp2.alignment = PP_ALIGN.CENTER
        kr2 = kp2.add_run()
        kr2.text = desc
        kr2.font.name = "Arial"
        kr2.font.size = Pt(10.0)
        kr2.font.color.rgb = C_NAVY_DEEP

    # 2 Biểu đồ đo kiểm hiệu năng JMeter thực tế đặt song song
    chart_tp = 'baocaokhoaluan/assets/diagrams/hinh_4_38_throughput.png'
    chart_err = 'baocaokhoaluan/assets/diagrams/hinh_4_39_error_rate.png'
    if os.path.exists(chart_tp):
        slide.shapes.add_picture(chart_tp, Cm(43.7), Cm(91.6), width=Cm(18.7), height=Cm(8.8))
    if os.path.exists(chart_err):
        slide.shapes.add_picture(chart_err, Cm(62.8), Cm(91.6), width=Cm(18.7), height=Cm(8.8))

    # Hình tròn Google Lighthouse Core Web Vitals (4 vòng tròn điểm số: Performance 94, A11y 98, Best Practices 100, SEO 100)
    lh_img = 'baocaokhoaluan/assets/diagrams/hinh_4_40_lighthouse.png'
    if os.path.exists(lh_img):
        slide.shapes.add_picture(lh_img, Cm(43.7), Cm(101.0), width=Cm(38.0), height=Cm(8.5))

    tb_c7 = slide.shapes.add_textbox(Cm(43.5), Cm(109.8), Cm(38.4), Cm(2.5))
    tf_c7 = tb_c7.text_frame
    tf_c7.word_wrap = True
    p_c7 = tf_c7.paragraphs[0]
    r_c7 = p_c7.add_run()
    r_c7.text = "• Rigorous Empirical Benchmarks: Validated by Apache JMeter load tests and Google Lighthouse audits on cloud VPS, confirming enterprise scalability, high security, and fluid 60 FPS mobile rendering."
    r_c7.font.name = "Arial"
    r_c7.font.size = Pt(11.2)
    r_c7.font.color.rgb = C_TEXT_DARK

    # =========================================================================
    # 3. FOOTER BOTTOM BAR (Y = 113.2cm, Height = 3.6cm, Width = 80.1cm, X = 2.0cm)
    # Lề dưới an toàn: 118.9 - (113.2 + 3.6) = 2.1cm (HOÀN TOÀN KHÔNG TRÀN VIỀN)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(2.0), Cm(113.2), Cm(80.1), Cm(3.6))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_IUH_BLUE
    ftr_box.line.width = Pt(1.2)

    tb_ftr = slide.shapes.add_textbox(Cm(2.6), Cm(113.4), Cm(78.9), Cm(3.2))
    tf_f = tb_ftr.text_frame
    tf_f.word_wrap = True
    p_f = tf_f.paragraphs[0]
    p_f.alignment = PP_ALIGN.CENTER
    
    rf1 = p_f.add_run()
    rf1.text = "GRADUATION THESIS DEFENSE — FACULTY OF INFORMATION TECHNOLOGY — INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    rf1.font.name = "Arial"
    rf1.font.size = Pt(12.5)
    rf1.font.bold = True
    rf1.font.color.rgb = C_WHITE

    rf2 = p_f.add_run()
    rf2.text = "Authors: Huynh Tan Loc & Trinh Vi Thanh | Email: huynhloc.dev@gmail.com | Phone: (+84) 865 860 854 | Fieldwork: Ho Chi Minh City Museum of History"
    rf2.font.name = "Arial"
    rf2.font.size = Pt(11.0)
    rf2.font.color.rgb = hex_to_rgb('CBD5E1')

    out_file = 'poster/POSTER_KLTN_BaoTang360_IUH.pptx'
    prs.save(out_file)
    print(f"MASTER POSTER SAVED SUCCESSFULLY TO: {out_file}")

if __name__ == '__main__':
    create_master_poster()
