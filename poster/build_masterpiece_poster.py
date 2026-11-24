"""
========================================================================================
BUILD ULTIMATE MASTERPIECE SCIENTIFIC POSTER (A0 FORMAT: 84.1cm x 118.9cm)
IUH - FACULTY OF INFORMATION TECHNOLOGY - GRADUATION THESIS 2026
HO CHI MINH CITY MUSEUM OF HISTORY - 360 VIRTUAL TOUR & HERITAGE DIGITIZATION

KEY FEATURES:
1. Visible Museum Heritage Background (Photo 2) clearly visible across poster & in gaps
2. 7 Individual Rounded Cards with elegant borders, subtle shadow, and clean spacing
3. Section 7: Google Lighthouse Circular Gauges + JMeter Throughput & Error Rate charts
4. Section 1: Complete Technology Stack (Frontend, Backend, Database, AI Pipeline)
5. 6 Full Functional Diagrams + Architectural Diagram (Latest from Report)
6. 100% International Academic English, Unified Arial Typography
7. Zero Overflow / Clipping: Perfectly aligned to Y = 113.0cm, Footer Y = 114.2cm -> 117.6cm
========================================================================================
"""

import os
import cv2
import numpy as np
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt, Cm
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml
from pptx.oxml.ns import nsdecls

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return RGBColor(*(int(hex_str[i:i+2], 16) for i in (0, 2, 4)))

# Palettes
C_IUH_BLUE    = hex_to_rgb('0284C7')  # Sky Blue Accent
C_NAVY_DEEP   = hex_to_rgb('0F2942')  # Dark Academic Navy
C_TEXT_DARK   = hex_to_rgb('0F172A')  # Slate 900
C_TEXT_MUTED  = hex_to_rgb('334155')  # Slate 700
C_WHITE       = hex_to_rgb('FFFFFF')  # Pure White
C_CARD_BG     = hex_to_rgb('FFFFFF')  # Card White
C_CARD_BORDER = hex_to_rgb('CBD5E1')  # Border Slate 300
C_PILL_BG     = hex_to_rgb('0F2942')  # Section Pill Dark Navy
C_TECH_BG     = hex_to_rgb('F1F5F9')  # Tech Box Light Slate
C_FOOTER_BG   = hex_to_rgb('0F2942')  # Footer Navy

def prepare_background_images():
    """Tạo ảnh nền bảo tàng sắc nét, nhận diện rõ kiến trúc nhưng đủ sáng để làm nền"""
    orig_path = 'C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/78304de6-09a3-4a9c-9e7b-d09fc5d333fe/.user_uploaded/media_1795529967288_6ce48745.jpg'
    if not os.path.exists(orig_path):
        print(f"Original image not found at {orig_path}")
        return 'poster/assets/museum_faded_bg.jpg'
    
    orig = cv2.imread(orig_path)
    h, w, _ = orig.shape
    target_w, target_h = 2400, 3393
    scale = max(target_w / w, target_h / h)
    resized = cv2.resize(orig, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
    rw, rh = resized.shape[1], resized.shape[0]
    x_start = (rw - target_w) // 2
    y_start = (rh - target_h) // 2
    cropped = resized[y_start:y_start+target_h, x_start:x_start+target_w]
    
    # 1. Background toàn poster: 42% ảnh gốc + 58% trắng sáng (#F8FAFC)
    # Giữ nguyên độ sắc nét của tháp chùa, cây xanh, kiến trúc nhưng sáng sủa thanh lịch
    bg_canvas = np.full_like(cropped, 250) # Light off-white
    watermark = cv2.addWeighted(cropped, 0.42, bg_canvas, 0.58, 0)
    out_bg = 'poster/assets/museum_watermark_poster_bg.jpg'
    cv2.imwrite(out_bg, watermark, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(f"Generated museum backdrop: {out_bg}")
    return out_bg

def set_shape_alpha(shape, alpha_val="93000"):
    """Thêm độ trong suốt cho shape fill để nền bảo tàng ẩn hiện qua thẻ card"""
    try:
        ns_a = nsdecls('a')
        alpha_elem = parse_xml(f'<a:alpha {ns_a} val="{alpha_val}"/>')
        solidFill = shape._element.spPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}solidFill')
        if solidFill is not None:
            srgbClr = solidFill.find('{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
            if srgbClr is not None:
                srgbClr.append(alpha_elem)
    except Exception as e:
        print(f"Alpha warning: {e}")

def create_section_header(slide, card_left, card_top, card_width, title_num, title_en, title_vi):
    """Tạo thanh tiêu đề Card nổi bật với huy hiệu pill xanh navy"""
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_left + Cm(0.6), card_top + Cm(0.6), card_width - Cm(1.2), Cm(1.5))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_PILL_BG
    pill.line.color.rgb = C_IUH_BLUE
    pill.line.width = Pt(1.0)
    
    tb = slide.shapes.add_textbox(card_left + Cm(0.8), card_top + Cm(0.65), card_width - Cm(1.6), Cm(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    
    r_num = p.add_run()
    r_num.text = f"{title_num}. "
    r_num.font.name = "Arial"
    r_num.font.size = Pt(15.0)
    r_num.font.bold = True
    r_num.font.color.rgb = hex_to_rgb('38BDF8') # Bright Cyan-Blue
    
    r_en = p.add_run()
    r_en.text = title_en.upper() + " "
    r_en.font.name = "Arial"
    r_en.font.size = Pt(14.0)
    r_en.font.bold = True
    r_en.font.color.rgb = C_WHITE
    
    r_vi = p.add_run()
    r_vi.text = f"[{title_vi}]"
    r_vi.font.name = "Arial"
    r_vi.font.size = Pt(12.0)
    r_vi.font.bold = False
    r_vi.font.color.rgb = hex_to_rgb('94A3B8')

def build_poster():
    bg_file = prepare_background_images()
    
    prs = Presentation()
    prs.slide_width = Cm(84.1)
    prs.slide_height = Cm(118.9)
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    
    # 1. ẢNH NỀN BẢO TÀNG LỊCH SỬ TP.HCM (Museum Backdrop)
    if os.path.exists(bg_file):
        slide.shapes.add_picture(bg_file, 0, 0, width=Cm(84.1), height=Cm(118.9))
    
    # =========================================================================
    # 2. TOP HEADER BANNER (Y = 1.0cm, Height = 11.2cm, Width = 80.9cm)
    # =========================================================================
    hdr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.6), Cm(1.0), Cm(80.9), Cm(11.2))
    hdr_box.fill.solid()
    hdr_box.fill.fore_color.rgb = C_WHITE
    set_shape_alpha(hdr_box, "95000")
    hdr_box.line.color.rgb = C_NAVY_DEEP
    hdr_box.line.width = Pt(2.0)
    
    # Logo IUH góc trái Header (W = 12.5cm, H = 4.48cm)
    logo_path = 'baocaokhoaluan/assets/iuh_logo.png'
    if os.path.exists(logo_path):
        slide.shapes.add_picture(logo_path, Cm(2.8), Cm(2.4), width=Cm(12.5), height=Cm(4.48))
    
    # Khối giữa: Tên Trường & Tiêu đề Đề tài
    mid_tb = slide.shapes.add_textbox(Cm(16.0), Cm(1.3), Cm(45.8), Cm(10.6))
    tf_m = mid_tb.text_frame
    tf_m.word_wrap = True
    
    p_u1 = tf_m.paragraphs[0]
    p_u1.alignment = PP_ALIGN.CENTER
    r_u1 = p_u1.add_run()
    r_u1.text = "INDUSTRIAL UNIVERSITY OF HO CHI MINH CITY (IUH)\n"
    r_u1.font.name = "Arial"
    r_u1.font.size = Pt(17.5)
    r_u1.font.bold = True
    r_u1.font.color.rgb = C_NAVY_DEEP
    
    p_u2 = tf_m.add_paragraph()
    p_u2.alignment = PP_ALIGN.CENTER
    r_u2 = p_u2.add_run()
    r_u2.text = "FACULTY OF INFORMATION TECHNOLOGY — SOFTWARE ENGINEERING DEPARTMENT\n\n"
    r_u2.font.name = "Arial"
    r_u2.font.size = Pt(12.5)
    r_u2.font.bold = True
    r_u2.font.color.rgb = C_TEXT_MUTED
    
    p_t1 = tf_m.add_paragraph()
    p_t1.alignment = PP_ALIGN.CENTER
    r_t1 = p_t1.add_run()
    r_t1.text = "360° VIRTUAL TOUR & HERITAGE SPACE DIGITIZATION SYSTEM\n"
    r_t1.font.name = "Arial"
    r_t1.font.size = Pt(24.0)
    r_t1.font.bold = True
    r_t1.font.color.rgb = C_NAVY_DEEP
    
    p_t2 = tf_m.add_paragraph()
    p_t2.alignment = PP_ALIGN.CENTER
    r_t2 = p_t2.add_run()
    r_t2.text = "FOR HO CHI MINH CITY MUSEUM OF HISTORY"
    r_t2.font.name = "Arial"
    r_t2.font.size = Pt(19.5)
    r_t2.font.bold = True
    r_t2.font.color.rgb = C_IUH_BLUE
    
    # Khối phải: Supervisor & Student Authors (Panel chuyên nghiệp)
    meta_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(62.8), Cm(1.5), Cm(18.7), Cm(10.2))
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = hex_to_rgb('F8FAFC')
    meta_box.line.color.rgb = C_CARD_BORDER
    meta_box.line.width = Pt(1.2)
    
    meta_tb = slide.shapes.add_textbox(Cm(63.2), Cm(1.7), Cm(18.0), Cm(9.8))
    tf_meta = meta_tb.text_frame
    tf_meta.word_wrap = True
    
    p_gv = tf_meta.paragraphs[0]
    r_gv_lbl = p_gv.add_run()
    r_gv_lbl.text = "Supervisor:\n"
    r_gv_lbl.font.name = "Arial"
    r_gv_lbl.font.size = Pt(12.5)
    r_gv_lbl.font.bold = True
    r_gv_lbl.font.color.rgb = C_NAVY_DEEP
    
    r_gv_val = p_gv.add_run()
    r_gv_val.text = "  Dr. Tran Thi Minh Khoa\n\n"
    r_gv_val.font.name = "Arial"
    r_gv_val.font.size = Pt(13.0)
    r_gv_val.font.bold = True
    r_gv_val.font.color.rgb = C_IUH_BLUE
    
    p_sv = tf_meta.add_paragraph()
    r_sv_lbl = p_sv.add_run()
    r_sv_lbl.text = "Student Authors:\n"
    r_sv_lbl.font.name = "Arial"
    r_sv_lbl.font.size = Pt(12.5)
    r_sv_lbl.font.bold = True
    r_sv_lbl.font.color.rgb = C_NAVY_DEEP
    
    r_sv1 = p_sv.add_run()
    r_sv1.text = "  • Huynh Tan Loc (22689171)\n"
    r_sv1.font.name = "Arial"
    r_sv1.font.size = Pt(12.0)
    r_sv1.font.bold = True
    r_sv1.font.color.rgb = C_TEXT_DARK
    
    r_sv2 = p_sv.add_run()
    r_sv2.text = "  • Trinh Vi Thanh (22688411)\n"
    r_sv2.font.name = "Arial"
    r_sv2.font.size = Pt(12.0)
    r_sv2.font.bold = True
    r_sv2.font.color.rgb = C_TEXT_DARK
    
    r_class = p_sv.add_run()
    r_class.text = "  Class: DHKTPM18ATT (2022 - 2026)"
    r_class.font.name = "Arial"
    r_class.font.size = Pt(11.0)
    r_class.font.color.rgb = C_TEXT_MUTED
    
    # =========================================================================
    # 3. GEOMETRY FOR 7 INDIVIDUAL CARDS (2 Columns)
    # =========================================================================
    COL1_X = Cm(1.6)
    COL2_X = Cm(43.1)
    CARD_W = Cm(39.4)
    
    def add_card(left, top, width, height):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD_BG
        set_shape_alpha(card, "94000") # 94% white, 6% translucent so background is subtly integrated
        card.line.color.rgb = C_NAVY_DEEP
        card.line.width = Pt(1.2)
        return card

    # -------------------------------------------------------------------------
    # SECTION 1: ARCHITECTURE & TECHNOLOGY STACK (Y = 12.8cm, H = 24.8cm)
    # -------------------------------------------------------------------------
    C1_TOP = Cm(12.8)
    C1_H   = Cm(24.8)
    add_card(COL1_X, C1_TOP, CARD_W, C1_H)
    create_section_header(slide, COL1_X, C1_TOP, CARD_W, "1", "System Architecture & Tech Stack", "Kiến Trúc & Công Nghệ")
    
    arch_img = 'baocaokhoaluan/assets/hinh_3_1_kientruchieuthong.png'
    if os.path.exists(arch_img):
        slide.shapes.add_picture(arch_img, COL1_X + Cm(0.7), C1_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(15.2))
        
    tech_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, COL1_X + Cm(0.7), C1_TOP + Cm(17.8), CARD_W - Cm(1.4), Cm(6.4))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = C_TECH_BG
    tech_box.line.color.rgb = C_CARD_BORDER
    tech_box.line.width = Pt(1.0)
    
    tb_tech = slide.shapes.add_textbox(COL1_X + Cm(0.9), C1_TOP + Cm(17.9), CARD_W - Cm(1.8), Cm(6.2))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True
    
    p_th = tf_tech.paragraphs[0]
    r_th = p_th.add_run()
    r_th.text = "CORE TECHNOLOGY STACK & DISTRIBUTED INFRASTRUCTURE:\n"
    r_th.font.name = "Arial"
    r_th.font.size = Pt(10.5)
    r_th.font.bold = True
    r_th.font.color.rgb = C_NAVY_DEEP
    
    p_titems = tf_tech.add_paragraph()
    r_ti = p_titems.add_run()
    r_ti.text = (
        "• Frontend: React 18, Three.js (WebGL 60 FPS), TypeScript, TailwindCSS, Lucide Icons, HTML5-QRCode.\n"
        "• Backend & Gateway: Node.js v20, Express, Nginx Reverse Proxy (SSL/TLS, Rate Limiting), Docker Compose.\n"
        "• Distributed Databases: PostgreSQL 16 (ACID Relations), MongoDB 7.0 (360° Metadata), Redis 7.0 (Session Cache).\n"
        "• AI & Media Pipeline: RabbitMQ Message Broker, Python 3.10 OpenCV (SIFT), COLMAP SfM, Microsoft TRELLIS,\n"
        "  Google Cloud TTS Neural2, Google Translate API, PayOS VietQR Payment Gateway."
    )
    r_ti.font.name = "Arial"
    r_ti.font.size = Pt(9.5)
    r_ti.font.color.rgb = C_TEXT_DARK

    # -------------------------------------------------------------------------
    # SECTION 2: 360 PANORAMA STITCHING & TOUR UI (Y = 38.4cm, H = 34.0cm)
    # -------------------------------------------------------------------------
    C2_TOP = Cm(38.4)
    C2_H   = Cm(34.0)
    add_card(COL1_X, C2_TOP, CARD_W, C2_H)
    create_section_header(slide, COL1_X, C2_TOP, CARD_W, "2", "360° Panorama Stitching & Tour UI", "Ghép Ảnh 360° & Tham Quan")
    
    stitch_img = 'baocaokhoaluan/assets/hinh_3_8_luongpanorama.png'
    if os.path.exists(stitch_img):
        slide.shapes.add_picture(stitch_img, COL1_X + Cm(0.7), C2_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(14.8))
        
    tour_ui_img = 'poster/assets/ui_tour_360.png'
    if os.path.exists(tour_ui_img):
        slide.shapes.add_picture(tour_ui_img, COL1_X + Cm(0.7), C2_TOP + Cm(17.4), width=CARD_W - Cm(1.4), height=Cm(13.8))
        
    tb_c2 = slide.shapes.add_textbox(COL1_X + Cm(0.7), C2_TOP + Cm(31.4), CARD_W - Cm(1.4), Cm(2.2))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    p_c2 = tf_c2.paragraphs[0]
    r_c2 = p_c2.add_run()
    r_c2.text = "• Workflow: Wide-angle/Fish-eye multi-camera capture → SIFT Keypoints → RANSAC Homography Estimation → Multiband Blending → 8K Equirectangular Sphere. Smooth 60 FPS Three.js WebGL interactive navigation."
    r_c2.font.name = "Arial"
    r_c2.font.size = Pt(9.5)
    r_c2.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------------------
    # SECTION 3: 3D HERITAGE RECONSTRUCTION & WEBGL PBR (Y = 73.2cm, H = 39.8cm)
    # Ends at Y = 113.0cm
    # -------------------------------------------------------------------------
    C3_TOP = Cm(73.2)
    C3_H   = Cm(39.8)
    add_card(COL1_X, C3_TOP, CARD_W, C3_H)
    create_section_header(slide, COL1_X, C3_TOP, CARD_W, "3", "3D Heritage Dual-Engine Reconstruction", "Tái Tạo Hiện Vật 3D Đa Động Cơ")
    
    d3_img = 'baocaokhoaluan/assets/hinh_3_18_luong3dreconstruction.png'
    if os.path.exists(d3_img):
        slide.shapes.add_picture(d3_img, COL1_X + Cm(0.7), C3_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(12.0))
        
    art_ui = 'poster/assets/ui_artifact_3d.png'
    if os.path.exists(art_ui):
        slide.shapes.add_picture(art_ui, COL1_X + Cm(0.7), C3_TOP + Cm(14.6), width=CARD_W - Cm(1.4), height=Cm(22.4))
        
    tb_c3 = slide.shapes.add_textbox(COL1_X + Cm(0.7), C3_TOP + Cm(37.2), CARD_W - Cm(1.4), Cm(2.2))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    p_c3 = tf_c3.paragraphs[0]
    r_c3 = p_c3.add_run()
    r_c3.text = "• Dual Engine System: Local CPU Engine (Multi-angle photos → SfM/COLMAP → Poisson Surface Reconstruction → MeshLab GLB) & Cloud AI Engine (Single image → Microsoft TRELLIS ZeroGPU → 3D PBR WebGL at 60 FPS)."
    r_c3.font.name = "Arial"
    r_c3.font.size = Pt(9.5)
    r_c3.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------------------
    # SECTION 4: FLOOR PLAN & DIJKSTRA NAVIGATION (Y = 12.8cm, H = 20.8cm)
    # -------------------------------------------------------------------------
    C4_TOP = Cm(12.8)
    C4_H   = Cm(20.8)
    add_card(COL2_X, C4_TOP, CARD_W, C4_H)
    create_section_header(slide, COL2_X, C4_TOP, CARD_W, "4", "Floor Plan & Dijkstra Navigation", "Sơ Đồ Mặt Bằng & Định Tuyến")
    
    dijk_img = 'baocaokhoaluan/assets/hinh_3_28_luongsomatbang.png'
    if os.path.exists(dijk_img):
        slide.shapes.add_picture(dijk_img, COL2_X + Cm(0.7), C4_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(15.6))
        
    tb_c4 = slide.shapes.add_textbox(COL2_X + Cm(0.7), C4_TOP + Cm(18.2), CARD_W - Cm(1.4), Cm(2.2))
    tf_c4 = tb_c4.text_frame
    tf_c4.word_wrap = True
    p_c4 = tf_c4.paragraphs[0]
    r_c4 = p_c4.add_run()
    r_c4.text = "• Topological Graph: 18 exhibition halls, 32 interconnected nodes. Dijkstra algorithm computes optimal route in < 5ms, dynamic 3D polyline guide on floor plan."
    r_c4.font.name = "Arial"
    r_c4.font.size = Pt(9.5)
    r_c4.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------------------
    # SECTION 5: MULTILINGUAL TRANSLATION & AI VOICE GUIDE (Y = 34.4cm, H = 20.8cm)
    # -------------------------------------------------------------------------
    C5_TOP = Cm(34.4)
    C5_H   = Cm(20.8)
    add_card(COL2_X, C5_TOP, CARD_W, C5_H)
    create_section_header(slide, COL2_X, C5_TOP, CARD_W, "5", "Multilingual & AI Voice Audio Guide", "Dịch Thuật 7 Ngôn Ngữ & Giọng Nói AI")
    
    voice_img = 'baocaokhoaluan/assets/hinh_3_34_luongdichthuat.png'
    if os.path.exists(voice_img):
        slide.shapes.add_picture(voice_img, COL2_X + Cm(0.7), C5_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(15.6))
        
    tb_c5 = slide.shapes.add_textbox(COL2_X + Cm(0.7), C5_TOP + Cm(18.2), CARD_W - Cm(1.4), Cm(2.2))
    tf_c5 = tb_c5.text_frame
    tf_c5.word_wrap = True
    p_c5 = tf_c5.paragraphs[0]
    r_c5 = p_c5.add_run()
    r_c5.text = "• 7 Languages: VN, EN, FR, JA, KO, ZH, ES. Google Cloud TTS Neural2 natural narration, Redis caching (< 3ms response), Cloudinary CDN streaming."
    r_c5.font.name = "Arial"
    r_c5.font.size = Pt(9.5)
    r_c5.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------------------
    # SECTION 6: SMART TICKETING & MOBILE QR VALIDATION (Y = 56.0cm, H = 20.8cm)
    # -------------------------------------------------------------------------
    C6_TOP = Cm(56.0)
    C6_H   = Cm(20.8)
    add_card(COL2_X, C6_TOP, CARD_W, C6_H)
    create_section_header(slide, COL2_X, C6_TOP, CARD_W, "6", "VietQR Payment & Mobile QR Check-in", "Bán Vé VietQR & Soát Vé QR")
    
    ticket_img = 'baocaokhoaluan/assets/hinh_3_36_luongthanhtoan.png'
    if os.path.exists(ticket_img):
        slide.shapes.add_picture(ticket_img, COL2_X + Cm(0.7), C6_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(15.6))
        
    tb_c6 = slide.shapes.add_textbox(COL2_X + Cm(0.7), C6_TOP + Cm(18.2), CARD_W - Cm(1.4), Cm(2.2))
    tf_c6 = tb_c6.text_frame
    tf_c6.word_wrap = True
    p_c6 = tf_c6.paragraphs[0]
    r_c6 = p_c6.add_run()
    r_c6.text = "• Automated Ticketing: Dynamic VietQR PayOS, Webhook HMAC-SHA256 in < 150ms. Staff Mobile Scanner HTML5-QRCode in < 100ms with double-use prevention."
    r_c6.font.name = "Arial"
    r_c6.font.size = Pt(9.5)
    r_c6.font.color.rgb = C_TEXT_MUTED

    # -------------------------------------------------------------------------
    # SECTION 7: EXPERIMENTAL EVALUATION & AUDIT (Y = 77.6cm, H = 35.4cm)
    # Ends at Y = 113.0cm
    # -------------------------------------------------------------------------
    C7_TOP = Cm(77.6)
    C7_H   = Cm(35.4)
    add_card(COL2_X, C7_TOP, CARD_W, C7_H)
    create_section_header(slide, COL2_X, C7_TOP, CARD_W, "7", "Experimental Evaluation & System Audit", "Đánh Giá Thực Nghiệm & Đo Kiểm")
    
    # 1. 4 Google Lighthouse Circular Gauges (Yêu cầu "2 cái bảng gì tròn đó")
    lh_circles = 'poster/assets/lighthouse_circular_gauges.png'
    if os.path.exists(lh_circles):
        slide.shapes.add_picture(lh_circles, COL2_X + Cm(0.7), C7_TOP + Cm(2.3), width=CARD_W - Cm(1.4), height=Cm(8.4))
        
    # 2. 4 Metric Key Performance Indicators (KPIs)
    kpis = [
        ("Throughput (1000 users)", "295 req/s", "High Concurrency"),
        ("Error Rate (Stress Test)", "0.45%", "99.55% Availability"),
        ("Lighthouse Perf Score", "1.42s LCP", "94/100 Core Web Vitals"),
        ("Cache Response Time", "< 3ms", "Redis Distributed Cache")
    ]
    kw = (CARD_W - Cm(1.4) - Cm(1.2)) / 4.0
    for i, (k_lbl, k_val, k_sub) in enumerate(kpis):
        kx = COL2_X + Cm(0.7) + i * (kw + Cm(0.4))
        kbox = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, kx, C7_TOP + Cm(11.0), kw, Cm(4.2))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = hex_to_rgb('F8FAFC')
        kbox.line.color.rgb = C_CARD_BORDER
        kbox.line.width = Pt(1.0)
        
        tbk = slide.shapes.add_textbox(kx, C7_TOP + Cm(11.1), kw, Cm(4.0))
        tfk = tbk.text_frame
        tfk.word_wrap = True
        
        p1 = tfk.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        r1 = p1.add_run()
        r1.text = k_lbl + "\n"
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = C_TEXT_MUTED
        
        p2 = tfk.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        r2 = p2.add_run()
        r2.text = k_val + "\n"
        r2.font.name = "Arial"
        r2.font.size = Pt(15.0)
        r2.font.bold = True
        r2.font.color.rgb = C_NAVY_DEEP
        
        p3 = tfk.add_paragraph()
        p3.alignment = PP_ALIGN.CENTER
        r3 = p3.add_run()
        r3.text = k_sub
        r3.font.name = "Arial"
        r3.font.size = Pt(7.5)
        r3.font.color.rgb = hex_to_rgb('16A34A') if "%" in k_val or "req" in k_val else C_IUH_BLUE
        r3.font.bold = True

    # 3. Apache JMeter Throughput & Error Rate charts
    chart_tp = 'poster/assets/chart_throughput.png'
    chart_err = 'poster/assets/chart_error_rate.png'
    cw = (CARD_W - Cm(1.4) - Cm(0.6)) / 2.0
    if os.path.exists(chart_tp):
        slide.shapes.add_picture(chart_tp, COL2_X + Cm(0.7), C7_TOP + Cm(15.6), width=cw, height=Cm(15.2))
    if os.path.exists(chart_err):
        slide.shapes.add_picture(chart_err, COL2_X + Cm(0.7) + cw + Cm(0.6), C7_TOP + Cm(15.6), width=cw, height=Cm(15.2))
        
    tb_c7 = slide.shapes.add_textbox(COL2_X + Cm(0.7), C7_TOP + Cm(31.2), CARD_W - Cm(1.4), Cm(3.6))
    tf_c7 = tb_c7.text_frame
    tf_c7.word_wrap = True
    p_c7 = tf_c7.paragraphs[0]
    r_c7 = p_c7.add_run()
    r_c7.text = "• Field Stress Testing & Audit: Verified under 1000 concurrent users via Apache JMeter and Google Lighthouse audit. Delivers 99.55% availability, sub-2s mobile response over 4G cellular networks, and 60 FPS WebGL rendering."
    r_c7.font.name = "Arial"
    r_c7.font.size = Pt(9.5)
    r_c7.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # 4. FOOTER BOTTOM BAR (Y = 114.2cm, Height = 3.4cm, Width = 80.9cm)
    # Ends at Y = 117.6cm (Bottom margin = 1.3cm safe)
    # =========================================================================
    ftr_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Cm(1.6), Cm(114.2), Cm(80.9), Cm(3.4))
    ftr_box.fill.solid()
    ftr_box.fill.fore_color.rgb = C_FOOTER_BG
    ftr_box.line.color.rgb = C_IUH_BLUE
    ftr_box.line.width = Pt(1.5)
    
    tb_ftr = slide.shapes.add_textbox(Cm(2.0), Cm(114.4), Cm(80.1), Cm(3.0))
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
    print(f"MASTERPIECE SCIENTIFIC POSTER SAVED SUCCESSFULLY TO: {out_file}")

if __name__ == '__main__':
    build_poster()
