# -*- coding: utf-8 -*-
"""
Script to build the official 20-slide PowerPoint presentation for the Graduation Thesis Defense.
Topic: "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH"
Adheres 100% to docs/QUY_TAC_LAM_PPT.md (Version 5.0 - Academic Mindmap & Flowchart standard).
Output: d:/KhoaluanTotNghiep/BaoCao_KhoaLuanTotNghiep_BaoTangLichSu360.pptx
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.dml import MSO_LINE_DASH_STYLE

# Bảng màu Academic Light Pearl Palette
C_BG = RGBColor(248, 249, 250)         # Sáng ngọc trai (#F8F9FA)
C_PRIMARY = RGBColor(140, 45, 25)      # Đỏ sơn son di sản (#8C2D19)
C_NAVY = RGBColor(30, 58, 95)          # Xanh than học thuật (#1E3A5F)
C_GOLD = RGBColor(184, 134, 11)        # Vàng đồng thau (#B8860B)
C_TEAL = RGBColor(13, 118, 110)        # Xanh ngọc di sản (#0D766E)
C_DARK = RGBColor(15, 23, 42)          # Xanh đen tiêu đề (#0F172A)
C_TEXT = RGBColor(30, 41, 59)          # Than chì sẫm nội dung (#1E293B)
C_MUTED = RGBColor(100, 116, 139)      # Xám phụ đề (#64748B)
C_BORDER = RGBColor(203, 213, 225)     # Viền xám mảnh 1pt (#CBD5E1)
C_WHITE = RGBColor(255, 255, 255)
C_CARD_BG = RGBColor(255, 255, 255)
C_CARD_MUTED = RGBColor(241, 245, 249) # (#F1F5F9)

def create_slide_header(slide, title_text, category_badge="", slide_num=0):
    # Header bar background
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.85))
    top_bar.fill.background()
    top_bar.line.fill.background()

    tf = top_bar.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    if category_badge:
        r_badge = p.add_run()
        r_badge.text = f"[{category_badge.upper()}]  "
        r_badge.font.name = "Arial"
        r_badge.font.size = Pt(11)
        r_badge.font.bold = True
        r_badge.font.color.rgb = C_GOLD

    r_title = p.add_run()
    r_title.text = title_text
    r_title.font.name = "Arial"
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = C_PRIMARY

    # Gold divider line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.25), Inches(11.733), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = C_GOLD
    line.line.fill.background()

    # Footer
    footer = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.0), Inches(11.733), Inches(0.35))
    footer.fill.background()
    footer.line.fill.background()
    tf_f = footer.text_frame
    tf_f.margin_left = tf_f.margin_top = tf_f.margin_right = tf_f.margin_bottom = 0
    p_f = tf_f.paragraphs[0]
    
    r_f1 = p_f.add_run()
    r_f1.text = "Khóa Luận Tốt Nghiệp 2026 | Bảo Tàng Lịch Sử TP.HCM 360°"
    r_f1.font.name = "Arial"
    r_f1.font.size = Pt(9.5)
    r_f1.font.color.rgb = C_MUTED

    if slide_num > 0:
        r_f2 = p_f.add_run()
        r_f2.text = f"                                                                                                   Trang {slide_num:02d} / 20"
        r_f2.font.name = "Arial"
        r_f2.font.size = Pt(9.5)
        r_f2.font.bold = True
        r_f2.font.color.rgb = C_NAVY

def add_placeholder_box(slide, left, top, width, height, label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ", ratio_note="Tỷ lệ khuyến nghị 16:9"):
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    box.fill.solid()
    box.fill.fore_color.rgb = RGBColor(248, 250, 252)
    box.line.color.rgb = RGBColor(148, 163, 184)
    box.line.width = Pt(1.5)
    box.line.dash_style = MSO_LINE_DASH_STYLE.DASH

    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    
    r1 = p.add_run()
    r1.text = f"🖼️ {label}\n"
    r1.font.name = "Arial"
    r1.font.size = Pt(11)
    r1.font.bold = True
    r1.font.color.rgb = C_NAVY

    r2 = p.add_run()
    r2.text = f"([ Kéo thả hình ảnh chụp thực tế vào khung này ] - {ratio_note})"
    r2.font.name = "Arial"
    r2.font.size = Pt(9.5)
    r2.font.italic = True
    r2.font.color.rgb = C_MUTED

def add_image_or_placeholder(slide, left, top, width, height, image_path=None, caption="", label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ", ratio_note="Tỷ lệ khuyến nghị 16:9"):
    # Resolve image path relative to script directory or current working directory
    resolved_path = None
    if image_path:
        candidates = [
            image_path,
            os.path.join(os.path.dirname(__file__), image_path),
            os.path.join(os.path.dirname(__file__), "assets", os.path.basename(image_path)),
            os.path.join("d:/KhoaluanTotNghiep/baocaokhoaluan/assets", os.path.basename(image_path))
        ]
        for c in candidates:
            if os.path.exists(c):
                resolved_path = c
                break

    if resolved_path:
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(255, 255, 255)
        card.line.color.rgb = C_BORDER
        card.line.width = Pt(1)

        cap_h = Inches(0.48) if caption else Inches(0)
        pad = Inches(0.1)
        img_left = left + pad
        img_top = top + pad
        img_w = width - 2 * pad
        img_h = height - 2 * pad - cap_h

        slide.shapes.add_picture(resolved_path, img_left, img_top, width=img_w, height=img_h)

        if caption:
            tb = slide.shapes.add_textbox(left + pad, top + height - cap_h, width - 2 * pad, cap_h)
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            p.text = caption
            p.font.name = "Arial"
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = C_NAVY
            p.alignment = PP_ALIGN.CENTER
    else:
        add_placeholder_box(slide, left, top, width, height, label=label, ratio_note=ratio_note)

def add_card(slide, left, top, width, height, title, body_bullets, badge="", fill_color=C_CARD_BG, border_color=C_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)

    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)

    p0 = tf.paragraphs[0]
    p0.alignment = PP_ALIGN.LEFT
    p0.space_after = Pt(4)
    if badge:
        r_b = p0.add_run()
        r_b.text = f"{badge}  "
        r_b.font.name = "Arial"
        r_b.font.size = Pt(9.5)
        r_b.font.bold = True
        r_b.font.color.rgb = C_GOLD

    r_t = p0.add_run()
    r_t.text = title
    r_t.font.name = "Arial"
    r_t.font.size = Pt(12)
    r_t.font.bold = True
    r_t.font.color.rgb = C_NAVY

    for b in body_bullets:
        p = tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(3)
        if isinstance(b, tuple):
            prefix, text = b
            r1 = p.add_run()
            r1.text = f"• {prefix}: "
            r1.font.name = "Arial"
            r1.font.size = Pt(10)
            r1.font.bold = True
            r1.font.color.rgb = C_DARK
            r2 = p.add_run()
            r2.text = text
            r2.font.name = "Arial"
            r2.font.size = Pt(10)
            r2.font.color.rgb = C_TEXT
        else:
            r = p.add_run()
            r.text = f"• {b}"
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.font.color.rgb = C_TEXT

def build_presentation(out_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 01: TRANG BÌA KHÓA LUẬN
    # =========================================================================
    s01 = prs.slides.add_slide(blank_layout)
    # Background frame
    outer_box = s01.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.6), Inches(11.733), Inches(6.3))
    outer_box.fill.solid()
    outer_box.fill.fore_color.rgb = C_WHITE
    outer_box.line.color.rgb = C_PRIMARY
    outer_box.line.width = Pt(2.5)

    inner_box = s01.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.95), Inches(0.75), Inches(11.433), Inches(6.0))
    inner_box.fill.background()
    inner_box.line.color.rgb = C_GOLD
    inner_box.line.width = Pt(1)

    tf01 = inner_box.text_frame
    tf01.word_wrap = True
    tf01.margin_top = Inches(0.3)
    tf01.margin_left = tf01.margin_right = Inches(0.4)

    p_sch = tf01.paragraphs[0]
    p_sch.alignment = PP_ALIGN.CENTER
    r = p_sch.add_run()
    r.text = "TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH (IUH)\nKHOA CÔNG NGHỆ THÔNG TIN"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = C_NAVY

    p_sub = tf01.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.space_before = Pt(12)
    r = p_sub.add_run()
    r.text = "BÁO CÁO KHÓA LUẬN TỐT NGHIỆP ĐẠI HỌC NĂM 2026"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = C_GOLD

    p_title = tf01.add_paragraph()
    p_title.alignment = PP_ALIGN.CENTER
    p_title.space_before = Pt(16)
    r = p_title.add_run()
    r.text = "HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN\nBẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH"
    r.font.name = "Arial"
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = C_PRIMARY

    p_info = tf01.add_paragraph()
    p_info.alignment = PP_ALIGN.CENTER
    p_info.space_before = Pt(28)
    r = p_info.add_run()
    r.text = "Giảng viên hướng dẫn:  TS. TRẦN THỊ MINH KHOA\n"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = C_DARK

    r_sv = p_info.add_run()
    r_sv.text = "Sinh viên thực hiện:  HUỲNH TẤN LỘC (Trưởng nhóm)  –  TRỊNH VĨ THÀNH\nNgành: Kỹ thuật Phần mềm / Công nghệ Thông tin"
    r_sv.font.name = "Arial"
    r_sv.font.size = Pt(12)
    r_sv.font.color.rgb = C_TEXT

    # =========================================================================
    # SLIDE 02: CẤU TRÚC KHÓA LUẬN (HUB & SPOKE)
    # =========================================================================
    s02 = prs.slides.add_slide(blank_layout)
    create_slide_header(s02, "Cấu Trúc Tổng Thể Báo Cáo Khóa Luận", "Tổng Quan", 2)

    # Center Hub
    hub = s02.shapes.add_shape(MSO_SHAPE.OVAL, Inches(5.166), Inches(2.6), Inches(3.0), Inches(3.0))
    hub.fill.solid()
    hub.fill.fore_color.rgb = C_PRIMARY
    hub.line.color.rgb = C_GOLD
    hub.line.width = Pt(2)
    tf_h = hub.text_frame
    tf_h.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_h.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "HỆ THỐNG\nBẢO TÀNG 360°\n& SỐ HÓA 3D\n(18 GIAN PHÒNG)"
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = C_WHITE

    # 4 Spokes
    add_card(s02, Inches(0.8), Inches(1.6), Inches(3.8), Inches(2.3),
             "1. Bối Cảnh & Tính Cấp Thiết",
             [("Vấn đề", "40.000 cổ vật, rào cản máy quét đắt đỏ."),
              ("Mục tiêu", "Tự chủ giải pháp chi phí 0đ từ điện thoại."),
              ("Thực địa", "Khảo sát 4 đợt tại Bảo tàng Lịch sử TP.HCM.")],
             badge="Trụ Cột 1")

    add_card(s02, Inches(8.733), Inches(1.6), Inches(3.8), Inches(2.3),
             "2. Khảo Sát Kỹ Thuật 3D",
             [("Ảnh 360°", "Nắn trụ, RootSIFT, Voronoi Seam, Laplacian."),
              ("SfM/MVS", "COLMAP và OpenMVS phục vụ dựng lưới đa giác."),
              ("Dual-Engine 3D", "Heuristic CPU nội bộ kết hợp GPU TRELLIS.")],
             badge="Trụ Cột 2")

    add_card(s02, Inches(0.8), Inches(4.5), Inches(3.8), Inches(2.3),
             "3. Kiến Trúc & Thuật Toán",
             [("Kiến trúc 4 tầng", "React Three.js - Node.js - Python - Hybrid DB."),
              ("Dẫn đường", "Sơ đồ 18 phòng và giải thuật Dijkstra."),
              ("Trợ lý AI", "Google Gemini 2.5 Flash Lightweight RAG.")],
             badge="Trụ Cột 3")

    add_card(s02, Inches(8.733), Inches(4.5), Inches(3.8), Inches(2.3),
             "4. Hiện Thực Hóa & Đánh Giá",
             [("5 Phân hệ", "Ghép ảnh, Tour 360°, Cổ vật 3D, CMS, Vé QR."),
              ("Thực nghiệm", "Đo đạc 4G, FPS (48-60), RAM tối ưu với dispose()."),
              ("So sánh 3D", "Khẳng định ưu thế bổ trợ giữa CPU Heuristic và GPU.")],
             badge="Trụ Cột 4")

    # =========================================================================
    # SLIDE 03: BỐI CẢNH & TÍNH CẤP THIẾT
    # =========================================================================
    s03 = prs.slides.add_slide(blank_layout)
    create_slide_header(s03, "Bối Cảnh Thực Tế & Tính Cấp Thiết Của Đề Tài", "Đặt Vấn Đề", 3)

    add_card(s03, Inches(0.8), Inches(1.8), Inches(3.64), Inches(4.8),
             "Thực Trạng Không Gian Di Sản",
             [("Kho tàng lịch sử đồ sộ", "Bảo tàng lưu giữ hơn 40.000 hiện vật quý, kiến trúc liên hoàn 18 gian phòng bao quanh sân trong giếng trời."),
              ("Rào cản tham quan vật lý", "Khách ở xa, học sinh, sinh viên và du khách quốc tế khó có cơ hội trải nghiệm trực tiếp đầy đủ."),
              ("Bảo quản nghiêm ngặt", "Đa số cổ vật đặt sau tủ kính phản quang, giới hạn khoảng cách quan sát chi tiết hoa văn cổ.")],
             badge="Khối 1: Hiện Trạng")

    add_card(s03, Inches(4.84), Inches(1.8), Inches(3.64), Inches(4.8),
             "Rào Cản Thiết Bị Chuyên Dụng",
             [("Chi phí đầu tư quá cao", "Máy quét laser chuyên dụng (LiDAR) có giá từ 80 đến trên 150 triệu đồng, vượt ngân sách bảo tàng công lập."),
              ("Phụ thuộc đơn vị dịch vụ", "Mỗi lần thay đổi trưng bày phải thuê chuyên gia quét lại, dữ liệu lưu trên đám mây đóng của bên thứ ba."),
              ("Thiếu tính tích hợp", "Chưa kết hợp được Tour 360° với mô hình 3D cổ vật xoay phóng và soát vé điện tử liên thông.")],
             badge="Khối 2: Thách Thức")

    add_card(s03, Inches(8.88), Inches(1.8), Inches(3.64), Inches(4.8),
             "Mục Tiêu & Định Hướng Đề Tài",
             [("Chi phí thiết bị 0 đồng", "Tận dụng ngay điện thoại thông minh thông thường để quay video không gian và chụp ảnh cổ vật."),
              ("Tự chủ công nghệ 100%", "Xây dựng xưởng xử lý ảnh nội bộ, lưu trữ dữ liệu an toàn trên hạ tầng máy chủ của bảo tàng."),
              ("Hệ sinh thái toàn diện", "Tích hợp Tour 360°, Mini-map Dijkstra, Trợ lý AI Gemini, vé VietQR và camera soát vé tại cửa.")],
             badge="Khối 3: Giải Pháp")

    # =========================================================================
    # SLIDE 04: KIẾN TRÚC HỆ THỐNG PHÂN TẦNG (4-TIER)
    # =========================================================================
    s04 = prs.slides.add_slide(blank_layout)
    create_slide_header(s04, "Kiến Trúc Hệ Thống Tổng Thể Phân Tầng (4-Tier)", "Kiến Trúc", 4)

    tiers = [
        ("Tầng 1: Client Frontend (Giao Diện Đa Nền Tảng)",
         [("Công nghệ cốt lõi", "React, TypeScript, Tailwind CSS, Vite đóng gói tốc độ cao."),
          ("Không gian ảo 360°", "Three.js WebGL kết xuất hình cầu, OrbitControls xoay nhìn tự do, giải phóng VRAM với dispose()."),
          ("Mô hình Cổ vật 3D", "@react-three/fiber và @react-three/drei kết xuất chuẩn quốc tế .GLB."),
          ("Di động thông minh", "Quét mã QR soát vé qua camera điện thoại với Html5QrcodeScanner.")]),
        ("Tầng 2: Backend API Gateway (Điều Phối Nghiệp Vụ)",
         [("Máy chủ ứng dụng", "Node.js kết hợp Express và TypeScript, quản lý định tuyến phân quyền JWT bảo mật."),
          ("Tích hợp thanh toán", "VietQR PayOS tự động sinh mã thanh toán và xác nhận Webhook thời gian thực."),
          ("Trợ lý trí tuệ nhân tạo", "Google Gemini 2.5 Flash API tích hợp tri thức bảo tàng theo mô hình Lightweight RAG."),
          ("Đồng bộ trực tiếp", "Server-Sent Events (SSE) phát tán thay đổi CMS và trạng thái vé tức thì.")]),
        ("Tầng 3: Processing Worker Tier (Xử Lý Thị Giác Máy Tính)",
         [("Động cơ ghép ảnh 360°", "Python OpenCV, Cylindrical Warping, RootSIFT, RANSAC, Voronoi Seam, Laplacian Blending."),
          ("Hàng đợi bất đồng bộ", "Redis BullMQ (stitchQueue) tiếp nhận tác vụ nặng, chống nghẽn và chống treo máy chủ."),
          ("Động cơ 3D Heuristic CPU", "U2-Net tách nền, Euclidean Distance Transform, Harmonic Volumetric Envelope, Normal Map.")]),
        ("Tầng 4: Data Storage Tier (Lưu Trữ Lai Hybrid DB)",
         [("PostgreSQL Cluster", "Bảo đảm toàn vẹn giao dịch ACID cho users, roles, ticket_types, orders, tickets, system_branding."),
          ("MongoDB Document Store", "Lưu trữ cấu trúc dữ liệu đồ họa linh hoạt: 18 rooms, artifacts 3D, floor_plans Dijkstra."),
          ("Redis In-Memory Cache", "Lưu cache phản hồi nhanh, quản lý hàng đợi BullMQ và phiên làm việc.")])
    ]

    for idx, (t_title, t_bullets) in enumerate(tiers):
        add_card(s04, Inches(0.8), Inches(1.6 + idx * 1.3), Inches(11.733), Inches(1.18),
                 t_title, t_bullets, badge=f"Tier {idx+1}")

    # =========================================================================
    # SLIDE 05: KHẢO SÁT & SO SÁNH 4 PHƯƠNG PHÁP 3D
    # =========================================================================
    s05 = prs.slides.add_slide(blank_layout)
    create_slide_header(s05, "Khảo Sát & So Sánh 4 Phương Pháp Tiếp Cận Đồ Họa 3D", "Khảo Sát Kỹ Thuật", 5)

    methods = [
        ("Phương Pháp 1: Ảnh 360° Equirectangular",
         [("Dữ liệu đầu vào", "Video hoặc chuỗi ảnh chụp quay quét bằng điện thoại."),
          ("Ưu điểm", "Dung lượng nhẹ (3-6MB), nạp cực nhanh trên điện thoại, tải < 1.5s."),
          ("Hạn chế", "Góc nhìn cố định tại tâm (3-DoF), không bước tới góc tủ."),
          ("Đánh giá đề tài", "LỰA CHỌN TỐI ƯU CHO 18 GIAN PHÒNG TRƯNG BÀY.")]),
        ("Phương Pháp 2: Dựng Lưới SfM/MVS (COLMAP/OpenMVS)",
         [("Dữ liệu đầu vào", "Chụp từ 80 đến 150 bức ảnh tĩnh đa góc bao quanh vật thể."),
          ("Ưu điểm", "Tái tạo lưới đa giác thật, xem tự do 6 bậc tự do (6-DoF)."),
          ("Hạn chế", "Thời gian dựng lâu (30-60 phút), file nặng (50-100MB), dễ lỗi tủ kính."),
          ("Đánh giá đề tài", "Phù hợp bảo tồn nghiên cứu chuyên sâu, nặng với web di động.")]),
        ("Phương Pháp 3: 3D Gaussian Splatting (3DGS)",
         [("Dữ liệu đầu vào", "Chuỗi ảnh chụp mật độ dày và đám mây điểm SfM ban đầu."),
          ("Ưu điểm", "Chất lượng hình ảnh siêu nét, tái hiện ánh sáng lấp lánh chân thực."),
          ("Hạn chế", "Cần GPU huấn luyện đắt tiền, tệp nạp .ply nặng (30-80MB)."),
          ("Đánh giá đề tài", "ĐỊNH HƯỚNG NÂNG CẤP TIỀM NĂNG TRONG TƯƠNG LAI.")]),
        ("Phương Pháp 4: Tái Tạo 3D Từ Ảnh Đơn (Dual-Engine)",
         [("Dữ liệu đầu vào", "Chỉ 1 ảnh chụp mặt trước của cổ vật trong tủ kính."),
          ("Ưu điểm", "Tạo khối 3D (.GLB) siêu nhẹ (2-5MB), xoay phóng mượt trên web."),
          ("Hạn chế", "Mặt sau CPU Heuristic mang tính đối xứng trơn, cần AI GPU bổ trợ."),
          ("Đánh giá đề tài", "LỰA CHỌN TỐI ƯU CHO SỐ HÓA HIỆN VẬT BẢO TÀNG.")])
    ]

    for idx, (m_title, m_bullets) in enumerate(methods):
        col = idx % 2
        row = idx // 2
        add_card(s05, Inches(0.8 + col * 5.95), Inches(1.6 + row * 2.65), Inches(5.75), Inches(2.5),
                 m_title, m_bullets, badge=f"Phương Pháp {idx+1}")

    # =========================================================================
    # SLIDE 06: PHƯƠNG PHÁP 1: THUẬT TOÁN GHÉP ẢNH 360°
    # =========================================================================
    s06 = prs.slides.add_slide(blank_layout)
    create_slide_header(s06, "Phương Pháp 1: Chuỗi Thuật Toán Ghép Ảnh 360° Tự Động", "Thuật Toán Cốt Lõi", 6)

    steps_p1 = [
        ("Bước 1: Trích Xuất Khung Hình Khóa",
         "Phân tích luồng video điện thoại, loại bỏ các khung hình bị rung mờ, chọn các khung hình sắc nét có độ gối mí không gian chuẩn 60% – 75%."),
        ("Bước 2: Nắn Phẳng Chiếu Mặt Trụ (Cylindrical Warping)",
         "Áp dụng phép biến đổi lượng giác uốn cong khung hình phẳng lên mặt trụ dựa trên tiêu cự f, triệt tiêu biến dạng phối cảnh ở mép ảnh."),
        ("Bước 3: Trích Xuất RootSIFT & So Khớp RANSAC",
         "Trích xuất đặc trưng RootSIFT 128 chiều (chuẩn L1 căn bậc hai). Lọc sạch điểm phản xạ ánh sáng mặt kính bằng RANSAC với ngưỡng sai số 3,0 px."),
        ("Bước 4: Đường Khâu Voronoi & Hòa Trộn Laplacian",
         "Tối ưu đường cắt ghép giữa các ảnh kề nhau theo năng lượng gradient cực tiểu, sau đó phân rã tháp Laplacian hòa trộn đa băng tần làm mịn độ sáng."),
        ("Bước 5: Tự Động Nội Suy Đáy Sàn (Nadir Patch)",
         "Tạo mặt nạ che vùng cực Nam (chân người quay) và nội suy hoa văn gạch sàn xung quanh, xuất bức ảnh Equirectangular hoàn chỉnh tỷ lệ 2:1.")
    ]

    for idx, (st_title, st_desc) in enumerate(steps_p1):
        add_card(s06, Inches(0.8), Inches(1.6 + idx * 1.05), Inches(11.733), Inches(0.95),
                 st_title, [st_desc], badge=f"Giai Đoạn {idx+1}")

    # =========================================================================
    # SLIDE 07: ĐÁNH GIÁ TRUNG THỰC PHƯƠNG PHÁP 1
    # =========================================================================
    s07 = prs.slides.add_slide(blank_layout)
    create_slide_header(s07, "Đánh Giá Khách Quan Phương Pháp 1: Cơ Hội & Thách Thức Kỹ Thuật", "Đánh Giá Thực Nghiệm", 7)

    add_card(s07, Inches(0.8), Inches(1.6), Inches(5.75), Inches(4.3),
             "Mặt Tốt & Ưu Điểm Đạt Được",
             [("Chi phí thiết bị 0 đồng", "Tận dụng ngay điện thoại thông minh cá nhân của cán bộ, sinh viên; không phát sinh ngân sách mua sắm máy quét."),
              ("Tự chủ dữ liệu hoàn toàn", "Xử lý và lưu trữ trên hạ tầng máy chủ nội bộ, linh hoạt cập nhật mỗi khi bảo tàng thay đổi cách bài trí."),
              ("Dung lượng nạp siêu nhẹ", "Bức ảnh toàn cảnh Equirectangular tối ưu hóa đạt độ phân giải cao nhưng chỉ nặng từ 3 đến 6 MB."),
              ("Trải nghiệm mượt mà", "WebGL Three.js kết xuất ổn định 60 FPS trên máy tính và trên 48 FPS trên điện thoại qua mạng 4G.")],
             badge="Ưu Thế Vượt Trội", fill_color=C_CARD_BG)

    add_card(s07, Inches(6.783), Inches(1.6), Inches(5.75), Inches(4.3),
             "Thách Thức Kỹ Thuật & Hạn Chế Thực Tế",
             [("Rung lắc & Lệch tâm (Parallax)", "Quay bằng tay không có chân xoay cơ học dễ bị lệch tâm quang học, gây hiện tượng bóng ma góc tường."),
              ("Phản xạ đèn rọi vàng", "Ánh sáng đèn rọi công suất cao chiếu vào tủ kính gây lóa cục bộ, khiến thuật toán so khớp đặc trưng bị sai lệch."),
              ("Tải tính toán máy chủ lớn", "Giải ma trận Homography và hòa trộn ảnh ngốn CPU/RAM; nếu máy chủ yếu có thể nghẽn hàng đợi (OOM)."),
              ("Giải pháp đã khắc phục", "Tách worker xử lý ngầm qua Redis Queue, chuẩn hóa RootSIFT lọc nhiễu RANSAC và hướng dẫn quay chuẩn.")],
             badge="Thách Thức & Khắc Phục", fill_color=C_CARD_MUTED)

    # Bottom summary chip
    chip = s07.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.75))
    chip.fill.solid()
    chip.fill.fore_color.rgb = C_NAVY
    chip.line.fill.background()
    tf_c = chip.text_frame
    tf_c.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_c.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "✦ KẾT LUẬN THỰC NGHIỆM: Phương pháp 1 là giải pháp tối ưu nhất cho bảo tàng công lập khi giải quyết được bài toán tự chủ 100% với chi phí 0 đồng, đi kèm các biện pháp công nghệ lọc sạch nhiễu."
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = C_WHITE

    # =========================================================================
    # SLIDE 08: PHƯƠNG PHÁP 2: TÁI TẠO SfM/MVS + KHUNG PLACEHOLDER
    # =========================================================================
    s08 = prs.slides.add_slide(blank_layout)
    create_slide_header(s08, "Phương Pháp 2: Khảo Sát Pipeline Dựng Khối Đa Giác SfM & MVS", "Khảo Sát Thực Nghiệm", 8)

    add_card(s08, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1),
             "Quy Trình Tái Tạo Lưới Đa Giác (Mesh)",
             [("Bước 1: Thu thập ảnh đa góc", "Chụp từ 80 đến 150 bức ảnh tĩnh bao quanh hiện vật với độ gối mí không gian trên 70%."),
              ("Bước 2: COLMAP SfM", "Trích xuất đặc trưng SIFT, so khớp liên ảnh và giải bài toán Structure from Motion để định vị máy ảnh."),
              ("Bước 3: Đám mây điểm thưa", "Tái tạo vị trí không gian 3D của các điểm đặc trưng, tạo đám mây điểm thưa ban đầu (Sparse Point Cloud)."),
              ("Bước 4: OpenMVS Dense Cloud", "Áp dụng thuật toán Multi-View Stereo làm dày hàng triệu điểm ảnh, lọc nhiễu phản xạ mặt kính."),
              ("Bước 5: Dựng lưới & Dán kết cấu", "Tạo lưới đa giác Poisson Mesh, dán texture độ phân giải cao và xuất tệp mô hình chuẩn OBJ/GLB.")],
             badge="Pipeline Kỹ Thuật")

    add_placeholder_box(s08, Inches(6.8), Inches(1.6), Inches(5.733), Inches(5.1),
                        label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ",
                        ratio_note="Tỷ lệ 4:3 - Kéo thả ảnh chụp Đám mây điểm COLMAP / Lưới đa giác OpenMVS")

    # =========================================================================
    # SLIDE 09: PHƯƠNG PHÁP 3: 3D GAUSSIAN SPLATTING + KHUNG PLACEHOLDER
    # =========================================================================
    s09 = prs.slides.add_slide(blank_layout)
    create_slide_header(s09, "Phương Pháp 3: Khảo Sát Công Nghệ 3D Gaussian Splatting (3DGS)", "Nghiên Cứu Mở Rộng", 9)

    add_card(s09, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1),
             "Quy Trình Huấn Luyện Hạt Gaussian 3D",
             [("Khái niệm cốt lõi", "Biểu diễn cảnh quan không gian dưới dạng hàng triệu hạt elip Gaussian liên tục (vị trí, độ trong suốt, màu sắc hài hòa cầu)."),
              ("Bước 1: Khởi tạo đám mây điểm", "Sử dụng dữ liệu điểm thưa từ COLMAP để định vị tọa độ ban đầu của các hạt Gaussian."),
              ("Bước 2: Tối ưu hóa vi phân", "Chiếu các hạt Gaussian lên mặt phẳng 2D và so sánh sai phân điểm ảnh với ảnh chụp thực tế qua hàm mất mát L1 & D-SSIM."),
              ("Bước 3: Điều khiển mật độ hạt", "Tự động phân tách các hạt lớn ở vùng chi tiết và tỉa bỏ các hạt mờ đục vô giá trị."),
              ("Bước 4: Kết xuất thời gian thực", "Sử dụng bộ rasterizer tùy biến trên GPU cho phép người dùng di chuyển góc nhìn 6-DoF siêu mượt.")],
             badge="Nguyên Lý 3DGS")

    add_placeholder_box(s09, Inches(6.8), Inches(1.6), Inches(5.733), Inches(5.1),
                        label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ",
                        ratio_note="Tỷ lệ 16:9 - Kéo thả ảnh kết xuất thử nghiệm không gian Gaussian Splatting")

    # =========================================================================
    # SLIDE 10: PHƯƠNG PHÁP 4: TÁI TẠO 3D CỔ VẬT ĐA ĐỘNG CƠ + KHUNG PLACEHOLDER
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    create_slide_header(s10, "Phương Pháp 4: Tái Tạo Cổ Vật 3D Kiến Trúc Đa Động Cơ (Dual-Engine)", "Số Hóa Cổ Vật", 10)

    add_card(s10, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1),
             "Kiến Trúc Đa Động Cơ (Dual-Engine)",
             [("Động cơ 1: CPU Heuristic nội bộ", "Chạy trực tiếp trên VPS chi phí 0đ, xử lý siêu nhanh trong 3 - 6 giây: Tách nền bằng U2-Net, tính biến đổi khoảng cách Euclid, áp hàm vòm cầu điều hòa, mở rộng mép Texture Dilation và tạo Normal Map."),
              ("Đặc tính Động cơ 1", "Tệp .GLB siêu nhẹ chỉ 2 - 5 MB, nạp tức thì trên điện thoại; hoàn hảo cho 85% cổ vật tủ kính dạng phù điêu, tượng áp tường."),
              ("Động cơ 2: Cloud GPU TRELLIS", "Kết nối mô hình khuếch tán AI TRELLIS trên máy chủ GPU đám mây để suy diễn hình khối mặt sau và cấu trúc rỗng cho bảo vật quốc gia đa diện."),
              ("Chiến lược bổ trợ", "CPU Heuristic gánh tải đại trà 0 đồng; GPU TRELLIS mở rộng cho hiện vật phức tạp.")],
             badge="Kiến Trúc Sáng Tạo")

    add_image_or_placeholder(s10, Inches(6.8), Inches(1.6), Inches(5.733), Inches(5.1),
                             image_path="real_client_artifacts_section.png",
                             caption="Ảnh chụp thực tế: Trưng bày Cổ vật 3D trên hệ thống (museumhcm.duckdns.org)",
                             label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ",
                             ratio_note="Tỷ lệ 4:3 - Kéo thả ảnh chụp mô hình 3D cổ vật (.GLB) tương tác xoay phóng")

    # =========================================================================
    # SLIDE 11: LỰA CHỌN CÔNG NGHỆ TỐI ƯU CHO ĐỀ TÀI
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    create_slide_header(s11, "Lựa Chọn Công Nghệ Tối Ưu Cho Toàn Bộ Hệ Thống", "Quyết Định Kỹ Thuật", 11)

    add_card(s11, Inches(0.8), Inches(1.6), Inches(5.75), Inches(4.3),
             "Không Gian Phòng: Ảnh 360° Equirectangular",
             [("Lý do lựa chọn", "Khuôn viên 18 gian phòng có diện tích lớn; nếu dùng Mesh hay Gaussian dung lượng sẽ lên tới hàng trăm MB, gây sập RAM trình duyệt điện thoại."),
              ("Hiệu năng vượt trội", "Mỗi phòng chỉ tốn 3-6 MB ảnh toàn cảnh, nạp tức thì trong 0,82 đến 1,42 giây trên kết nối mạng di động 4G."),
              ("Khả năng làm chủ", "Bảo tàng hoàn toàn tự chủ quay quét bằng điện thoại thông thường với chi phí thiết bị 0 đồng."),
              ("Kết hợp liên hoàn", "Kết nối 18 phòng qua các mũi tên Hotspots 3D và sơ đồ mặt bằng dẫn đường Dijkstra.")],
             badge="Không Gian Phòng", fill_color=C_CARD_BG)

    add_card(s11, Inches(6.783), Inches(1.6), Inches(5.75), Inches(4.3),
             "Cổ Vật Di Sản: Mô Hình 3D Chuẩn Nhị Phân .GLB",
             [("Lý do lựa chọn", "Hiện vật cổ cần được quan sát chi tiết hoa văn đa hướng; ảnh phẳng không thể hiện được chiều sâu và chất liệu cổ."),
              ("Tối ưu dung lượng", "Chuẩn nén nhị phân .GLB kết hợp thuật toán Mesh Decimation giữ dung lượng nhẹ chỉ từ 1,8 đến 3,5 MB."),
              ("Tương tác mượt mà", "Xoay lật 360 độ, phóng to thu nhỏ, kiểm tra vân đá Champa, gốm men Lý - Trần ngay trên trình duyệt."),
              ("Hồ sơ khoa học di sản", "Tích hợp bảng thông tin lịch sử: niên đại, nguồn gốc, chất liệu, kích thước và ý nghĩa khảo cổ.")],
             badge="Cổ Vật Di Sản", fill_color=C_CARD_MUTED)

    chip11 = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.75))
    chip11.fill.solid()
    chip11.fill.fore_color.rgb = C_PRIMARY
    chip11.line.fill.background()
    tf_c = chip11.text_frame
    tf_c.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_c.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "✦ CHIẾN LƯỢC KẾT HỢP NHỊ PHÂN: 'Không gian 360° làm nền tảng bao quát – Mô hình 3D .GLB làm điểm nhấn di sản sâu sắc', đem lại trải nghiệm hoàn hảo với chi phí hạ tầng tối thiểu."
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = C_WHITE

    # =========================================================================
    # SLIDE 12: PHÂN HỆ 1: XƯỞNG GHÉP ẢNH 360° TỰ ĐỘNG
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    create_slide_header(s12, "Phân Hệ 1: Xưởng Xử Lý Ghép Ảnh 360° Bất Đồng Bộ", "Hiện Thực Hóa Chức Năng", 12)

    sub_features12 = [
        ("1. Giao Diện Điều Phối Tác Vụ (PocStitchingPage.tsx)",
         [("Tải video dễ dàng", "Người quản trị chọn tệp video quay quét phòng (MP4/MOV)."),
          ("Bảo vệ thiết bị", "Hệ thống tự động kích hoạt chế độ giữ sáng màn hình điện thoại trong lúc gửi dữ liệu."),
          ("Khởi tạo tác vụ", "Tạo Stitching Job với mã định danh duy nhất gửi về API Gateway Node.js.")]),
        ("2. Hàng Đợi Bất Đồng Bộ Redis (BullMQ stitchQueue)",
         [("Chống nghẽn máy chủ", "Tách rời hoàn toàn luồng xử lý ảnh nặng khỏi luồng phục vụ web chính."),
          ("Xếp hàng tuần tự", "Các tác vụ được quản lý trong Redis BullMQ, tránh sự cố tràn bộ nhớ RAM (OOM)."),
          ("Phân bổ tài nguyên", "Worker Python ngầm chỉ chiếm dụng CPU máy chủ khi có tác vụ trong hàng đợi.")]),
        ("3. Động Cơ Xử Lý Ngầm (stitcher.py)",
         [("Xử lý tự động 100%", "Trích xuất khung hình, Nắn phẳng mặt trụ, RootSIFT RANSAC, Voronoi Seam và Laplacian Blending."),
          ("Tự ngắt khép vòng", "So khớp với khung hình đầu tiên để tự động ngắt video khi vừa đủ vòng quay 360°."),
          ("Tự động vá sàn", "Khử bóng chân người quay bằng thuật toán nội suy vân gạch sàn Nadir.")]),
        ("4. Kênh Sự Kiện Thời Gian Thực (Server-Sent Events)",
         [("Phản hồi trực tiếp", "Máy chủ đẩy thông báo tiến độ phần trăm (%) và trạng thái từng bước về trình duyệt."),
          ("Thanh tiến trình mượt mà", "Người quản trị theo dõi trực quan từng giai đoạn xử lý mà không cần tải lại trang."),
          ("Tự động lưu trữ", "Kết quả được lưu vào cơ sở dữ liệu MongoDB và đồng bộ lên đám mây Cloudinary.")])
    ]

    for idx, (f_title, f_bullets) in enumerate(sub_features12):
        col = idx % 2
        row = idx // 2
        add_card(s12, Inches(0.8 + col * 5.95), Inches(1.6 + row * 2.65), Inches(5.75), Inches(2.5),
                 f_title, f_bullets, badge=f"Thành Phần {idx+1}")

    # =========================================================================
    # SLIDE 13: PHÂN HỆ 2: CỔNG THAM QUAN 360° & ĐIỂM CHUYỂN PHÒNG
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    create_slide_header(s13, "Phân Hệ 2: Cổng Tham Quan 360° & Nguyên Lý Chuyển Đổi Tọa Độ Cầu", "Đồ Họa & Thuật Toán", 13)

    add_card(s13, Inches(0.8), Inches(1.6), Inches(5.75), Inches(5.1),
             "Nguyên Lý Kết Xuất Cầu Three.js & Tọa Độ Hotspots",
             [("Khối cầu không gian WebGL", "Khởi tạo SphereGeometry(500, 60, 40), ảnh toàn cảnh Equirectangular được dán vào mặt trong khối cầu bằng MeshBasicMaterial."),
              ("Điều khiển góc nhìn tương tác", "Tích hợp OrbitControls cho phép kéo chuột hoặc vuốt ngón tay xoay 360° ngang và 180° đứng."),
              ("Ánh xạ tọa độ màn hình sang góc cầu", "Khi quản trị viên nhấp chuột lên cửa phòng trên màn hình phẳng (x, y), hệ thống dùng tia Raycaster tính giao điểm với mặt cầu và giải phương trình lượng giác:"),
              ("Công thức toán học", "Góc kinh độ: θ = atan2(z, x) ; Góc vĩ độ: φ = asin(y / R). Tọa độ cầu được lưu vào MongoDB để hiển thị điểm Hotspot."),
              ("Chuyển phòng mượt mà", "Áp dụng hiệu ứng mờ dần (Fade-out/Fade-in 400ms) tạo cảm giác như đang bước qua ngưỡng cửa bảo tàng.")],
             badge="Nguyên Lý WebGL")

    add_card(s13, Inches(6.783), Inches(1.6), Inches(5.75), Inches(5.1),
             "Cơ Chế Thu Hồi Bộ Nhớ GPU Chống Tràn RAM",
             [("Thách thức bộ nhớ", "Nếu chuyển qua liên tiếp 18 gian phòng mà không giải phóng tài nguyên, bộ nhớ đồ họa GPU sẽ tích lũy gây văng ứng dụng trình duyệt trên điện thoại."),
              ("Cơ chế giải phóng dispose()", "Trước khi nạp phòng mới, hệ thống tự động duyệt cây Scene Graph, gọi hàm .dispose() trên toàn bộ Texture và Geometry của phòng cũ."),
              ("Thu hồi rác JavaScript", "Hủy bỏ tham chiếu bộ nhớ để trình thu gom rác (Garbage Collector) dọn sạch RAM máy khách."),
              ("Kết quả đo đạc thực tế", "Mức tiêu thụ RAM trên điện thoại chỉ tăng dưới 15 MB sau khi đi xuyên suốt toàn bộ 18 gian phòng trưng bày!"),
              ("Trải nghiệm liên tục", "Khách tham quan có thể lướt xem hàng giờ mà không bao giờ bị giật lag hay thoát ứng dụng.")],
             badge="Tối Ưu VRAM", fill_color=C_CARD_MUTED)

    # =========================================================================
    # SLIDE 14: PHÂN HỆ 3: QUẢN TRỊ CMS & SOÁT VÉ QR + KHUNG PLACEHOLDER
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    create_slide_header(s14, "Phân Hệ 3: Quản Trị CMS Thương Hiệu & Soát Vé Camera QR", "Quản Trị & Vận Hành", 14)

    add_card(s14, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1),
             "Tính Năng Quản Trị & Soát Vé Thực Tế",
             [("CMS Nhận diện thương hiệu", "Biên tập tên bảo tàng song ngữ Việt - Anh, biểu trưng Emblem, khẩu hiệu Tagline và tải biểu trưng Logo chính thức."),
              ("Bảo mật tệp đồ họa", "Tự động kích hoạt cờ fl_sanitize trên Cloudinary CDN để làm sạch mã độc trong tệp SVG/PNG trước khi lưu trữ."),
              ("Quản trị Banner Hero & Khối trưng bày", "Tùy biến tiêu đề chào đón, tải ảnh nền toàn cảnh, đồng bộ tức thì xuống máy khách qua kênh SSE."),
              ("Soát vé bằng camera điện thoại", "Tích hợp Html5QrcodeScanner trên trình duyệt di động của nhân viên soát vé tại cửa bảo tàng."),
              ("Chống gian lận vé quay vòng", "Vé hợp lệ hiển thị màu xanh và cập nhật trạng thái used thời gian thực; vé đã dùng hoặc giả mạo lập tức báo đỏ từ chối.")],
             badge="Nghiệp Vụ Quản Trị")

    add_image_or_placeholder(s14, Inches(6.8), Inches(1.6), Inches(5.733), Inches(5.1),
                             image_path="real_admin_page.png",
                             caption="Ảnh chụp thực tế: Cổng Quản trị hệ thống (https://museumhcm.duckdns.org/admin)",
                             label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ",
                             ratio_note="Tỷ lệ 16:9 - Kéo thả ảnh Giao diện Quản trị CMS & Camera quét vé QR di động")

    # =========================================================================
    # SLIDE 15: PHÂN HỆ 4: TRẢI NGHIỆM KHÁCH & TRỢ LÝ AI + KHUNG PLACEHOLDER
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    create_slide_header(s15, "Phân Hệ 4: Cổng Tham Quan Tương Tác 360°, Mini-map & Trợ Lý AI", "Trải Nghiệm Khách Hàng", 15)

    add_card(s15, Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.1),
             "Trải Nghiệm Đa Giác Quan Của Khách Tham Quan",
             [("Bản đồ dẫn đường Mini-map Dijkstra", "Tích hợp sơ đồ mặt bằng 18 phòng; nón Radar View biểu thị hướng nhìn thực tế; thuật toán Dijkstra vẽ lộ trình đi ngắn nhất đến phòng đích."),
              ("Thuyết minh âm thanh song ngữ", "Tự động phát giọng đọc thuyết minh bản xứ truyền cảm (Việt - Anh) tương ứng với từng giai đoạn lịch sử."),
              ("Trợ lý trí tuệ nhân tạo Google Gemini", "Mô hình gemini-2.5-flash nạp ngữ cảnh tư liệu phòng và hiện vật (Lightweight RAG) giải đáp chuẩn xác câu hỏi lịch sử."),
              ("Đặt vé trực tuyến VietQR PayOS", "Khách chọn khung giờ tham quan, quét mã VietQR chuyển khoản tự động và nhận vé điện tử mã BTLS-YYYY-XXXXXXXX qua email.")],
             badge="Cổng Tham Quan")

    add_image_or_placeholder(s15, Inches(6.8), Inches(1.6), Inches(5.733), Inches(5.1),
                             image_path="real_client_interactive_tour360.png",
                             caption="Ảnh chụp thực tế: Cổng tham quan 360° tương tác (https://museumhcm.duckdns.org)",
                             label="KHU VỰC DÀNH CHO BẠN CHÈN ẢNH THỰC TẾ",
                             ratio_note="Tỷ lệ 16:9 - Kéo thả ảnh Tour 360° tích hợp Mini-map dẫn đường & Khung chat Trợ lý AI")

    # =========================================================================
    # SLIDE 16: KỸ THUẬT TỐI ƯU HIỆU NĂNG CHUYÊN SÂU
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    create_slide_header(s16, "Kỹ Thuật Tối Ưu Hóa Hiệu Năng Hệ Thống Chuyên Sâu", "Tối Ưu Kỹ Thuật", 16)

    optimizations = [
        ("1. Tối Ưu Hóa Bộ Nhớ Đồ Họa Three.js",
         [("Thu hồi VRAM nghiêm ngặt", "Tự động gọi hàm dispose() trên Material, Geometry, Texture của phòng cũ trước khi nạp phòng mới."),
          ("Khử rò rỉ bộ nhớ", "Hủy bỏ các đối tượng lắng nghe sự kiện chuột/chạm khi rời màn hình."),
          ("Kết quả", "Ngăn chặn triệt để sự cố tràn RAM, duy trì FPS ổn định lâu dài.")]),
        ("2. Nén Ảnh Hiện Đại & Nạp Lười (Lazy Loading)",
         [("Chuyển đổi WebP tự động", "Giảm 60% dung lượng tệp ảnh so với JPEG gốc mà không suy hao độ sắc nét."),
          ("Nạp đa độ phân giải", "Tải ảnh xem trước chất lượng thấp (LQIP) làm mờ, sau đó nạp ngầm ảnh 4K độ nét cao."),
          ("Kết quả", "Tốc độ hiển thị ban đầu giảm xuống dưới 1 giây.")]),
        ("3. Đệm Phân Tầng Redis Caching",
         [("Bộ đệm 256MB", "Lưu trữ sẵn cấu trúc dữ liệu 18 phòng và sơ đồ liên kết Dijkstra trong bộ nhớ RAM."),
          ("Giảm tải cơ sở dữ liệu", "Cắt giảm 85% các truy vấn lặp lại đến PostgreSQL và MongoDB."),
          ("Kết quả", "Thời gian phản hồi API trung bình đạt dưới 35 mili-giây.")]),
        ("4. Kiểm Soát Tiết Lưu Trợ Lý AI (Rate Limiter)",
         [("Ngăn chặn lạm dụng", "Thiết lập thời gian hồi chiêu (Cooldown) 3 giây giữa hai câu hỏi liên tiếp."),
          ("Giới hạn tần suất", "Tối đa 15 lượt gọi API / phút cho mỗi phiên khách tham quan."),
          ("Kết quả", "Bảo vệ hạn mức ngân sách và ngăn ngừa tấn công từ chối dịch vụ (DoS).")])
    ]

    for idx, (opt_title, opt_bullets) in enumerate(optimizations):
        col = idx % 2
        row = idx // 2
        add_card(s16, Inches(0.8 + col * 5.95), Inches(1.6 + row * 2.65), Inches(5.75), Inches(2.5),
                 opt_title, opt_bullets, badge=f"Giải Pháp {idx+1}")

    # =========================================================================
    # SLIDE 17: KẾT QUẢ ĐO ĐẠC HIỆU NĂNG THỰC NGHIỆM + KHUNG PLACEHOLDER
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    create_slide_header(s17, "Kết Quả Đo Đạc Hiệu Năng Thực Tế Đa Thiết Bị", "Thực Nghiệm Đo Đạc", 17)

    # Left: Benchmarks table
    tbl_shape = s17.shapes.add_table(rows=6, cols=4, left=Inches(0.8), top=Inches(1.6), width=Inches(6.8), height=Inches(3.4))
    tbl = tbl_shape.table
    tbl.columns[0].width = Inches(2.3)
    tbl.columns[1].width = Inches(1.3)
    tbl.columns[2].width = Inches(1.5)
    tbl.columns[3].width = Inches(1.7)

    headers17 = ["Thiết bị thử nghiệm", "FPS", "Tải 4G", "RAM sau 18 phòng"]
    for c_idx, h_text in enumerate(headers17):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = h_text
        r.font.name = "Arial"
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = C_WHITE

    bench_data = [
        ("PC Chrome 128 (Win 11)", "60,0 FPS", "0,82 giây", "158 MB (Rất mượt)"),
        ("MacBook Edge (macOS)", "59,8 FPS", "0,95 giây", "152 MB (Rất mượt)"),
        ("iPhone 14 (Safari iOS 17)", "58,5 FPS", "1,15 giây", "105 MB (Mượt mà)"),
        ("Samsung A54 (Android 14)", "54,2 FPS", "1,28 giây", "98 MB (Mượt mà)"),
        ("Xiaomi Note 12 (Android 13)", "48,6 FPS", "1,42 giây", "94 MB (Ổn định)")
    ]

    for r_idx, r_data in enumerate(bench_data):
        for c_idx, val in enumerate(r_data):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_WHITE if r_idx % 2 == 0 else C_CARD_MUTED
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.LEFT if c_idx == 0 else PP_ALIGN.CENTER
            r = p.add_run()
            r.text = val
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.bold = (c_idx == 0)
            r.font.color.rgb = C_DARK

    # Bottom notes on left
    add_card(s17, Inches(0.8), Inches(5.15), Inches(6.8), Inches(1.65),
             "Nhận Xét Kết Quả Thực Nghiệm Thực Địa",
             [("Thời gian tải mạng 4G", "Đạt 0,82 đến 1,42 giây, vượt xa tiêu chuẩn đặt ra (< 1,5 giây)."),
              ("Độ trễ soát vé camera QR", "Quét và cập nhật trạng thái vào cổng tức thì trong 0,45 giây."),
              ("Độ ổn định bộ nhớ", "RAM tăng dưới 15 MB sau 18 phòng nhờ giải phóng GPU dispose().")],
             badge="Kết Luận Đo Đạc")

    # Right: Placeholder for Field trip photo at the museum
    add_placeholder_box(s17, Inches(7.8), Inches(1.6), Inches(4.733), Inches(5.2),
                        label="KHU VỰC DÀNH CHO NHÓM TÁC GIẢ CHÈN ẢNH THỰC TẾ",
                        ratio_note="Tỷ lệ 16:9 hoặc 4:3 - Kéo thả ảnh nhóm tác nghiệp thực tế tại Bảo tàng Lịch sử TP.HCM")

    # =========================================================================
    # SLIDE 18: TỔNG KẾT ĐÓNG GÓP CỦA KHÓA LUẬN
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    create_slide_header(s18, "Tổng Kết Các Kết Quả & Giá Trị Đóng Góp Của Khóa Luận", "Tổng Kết", 18)

    add_card(s18, Inches(0.8), Inches(1.8), Inches(3.64), Inches(4.8),
             "1. Giá Trị Khoa Học & Công Nghệ",
             [("Làm chủ thuật toán xử lý ảnh", "Xây dựng chuỗi quy trình khép kín chuyển đổi video điện thoại thành ảnh toàn cảnh 360° chuẩn Equirectangular tỷ lệ 2:1."),
              ("Sáng tạo kiến trúc Dual-Engine 3D", "Kết hợp hài hòa giữa thuật toán Heuristic CPU nội bộ chi phí 0đ và mô hình khuếch tán AI TRELLIS trên GPU đám mây."),
              ("Tối ưu hóa đồ họa Web phân tán", "Tối ưu hóa vòng đời Three.js, triệt tiêu lỗi tràn RAM trên thiết bị di động, duy trì 48 - 60 FPS.")],
             badge="Trụ Cột Khoa Học")

    add_card(s18, Inches(4.84), Inches(1.8), Inches(3.64), Inches(4.8),
             "2. Giá Trị Thực Tiễn Cho Bảo Tàng",
             [("Số hóa trọn vẹn 18 gian phòng", "Hoàn thành dữ liệu số hóa không gian toàn diện từ thời Tiền sử đến Triều Nguyễn và các bộ sưu tập Champa, Óc Eo, Vương Hồng Sển."),
              ("Hệ sinh thái chuyển đổi số chi phí 0đ", "Cung cấp trọn gói từ quản trị nội dung CMS, nhận diện thương hiệu, thuyết minh âm thanh đến soát vé camera QR di động."),
              ("Bảo mật & Tự chủ dữ liệu 100%", "Toàn bộ dữ liệu nằm trên hạ tầng riêng của bảo tàng, không phụ thuộc chi phí định kỳ của bên thứ ba.")],
             badge="Trụ Cột Thực Tiễn")

    add_card(s18, Inches(8.88), Inches(1.8), Inches(3.64), Inches(4.8),
             "3. Giá Trị Xã Hội & Giáo Dục Di Sản",
             [("Xóa bỏ rào cản không gian", "Giúp hàng triệu học sinh, sinh viên và người dân vùng sâu vùng xa có thể tham quan bảo tàng trực tuyến sống động."),
              ("Hỗ trợ quảng bá quốc tế", "Giao diện và thuyết minh song ngữ (Việt - Anh) giới thiệu bề dày văn hóa ngàn năm của dân tộc đến du khách toàn cầu."),
              ("Bảo tồn tư liệu vĩnh cửu", "Lưu trữ số hóa các cổ vật quý hiếm nguyên bản trước nguy cơ xuống cấp theo thời gian.")],
             badge="Trụ Cột Xã Hội")

    # =========================================================================
    # SLIDE 19: HẠN CHẾ & HƯỚNG PHÁT TRIỂN
    # =========================================================================
    s19 = prs.slides.add_slide(blank_layout)
    create_slide_header(s19, "Các Mặt Hạn Chế Kỹ Thuật & Hướng Phát Triển Tương Lai", "Nhìn Nhận & Định Hướng", 19)

    add_card(s19, Inches(0.8), Inches(1.6), Inches(5.75), Inches(5.1),
             "Các Mặt Hạn Chế Kỹ Thuật Hiện Tại",
             [("1. Ánh sáng đèn rọi tủ kính bảo tàng",
               "Hệ thống đèn rọi vàng công suất cao chiếu vào mặt kính chống trộm dễ gây lóa cục bộ khi quay video bằng điện thoại, đòi hỏi người quay phải giữ đều tay."),
              ("2. Giới hạn hình học mặt sau Động cơ Heuristic",
               "Phương pháp dựa trên ảnh chụp đơn (Single-view) nên mặt sau của mô hình 3D CPU Heuristic mang tính đối xứng trơn, chưa tái tạo được lòng rỗng phức tạp."),
              ("3. Độ trễ hàng đợi ghép ảnh khi tải cao",
               "Xử lý ghép ảnh độ phân giải siêu nét trên CPU VPS cần 2 đến 4 phút cho mỗi phòng khi có nhiều người cùng gửi video lên hàng đợi Redis.")],
             badge="Hạn Chế Hiện Tại", fill_color=C_CARD_MUTED)

    add_card(s19, Inches(6.783), Inches(1.6), Inches(5.75), Inches(5.1),
             "Định Hướng Phát Triển Tiềm Năng",
             [("1. Tích hợp Thực tế ảo mở rộng WebXR",
               "Nâng cấp lõi đồ họa Three.js tương thích với WebXR Device API, hỗ trợ trải nghiệm không gian nổi (Immersive VR) trên kính Meta Quest và Apple Vision Pro."),
              ("2. Ứng dụng công nghệ 3D Gaussian Splatting (3DGS)",
               "Nghiên cứu ứng dụng đám mây hạt Gaussian liên tục 6-DoF để người dùng có thể tự do bước đi trong gian phòng với chất lượng ánh sáng siêu thực."),
              ("3. Thuyết minh giọng nói AI đa ngữ tự nhiên",
               "Tích hợp Text-to-Speech đa vùng miền (Bắc - Trung - Nam) và mở rộng các ngôn ngữ quốc tế (tiếng Pháp, tiếng Nhật, tiếng Trung, tiếng Hàn).")],
             badge="Hướng Phát Triển", fill_color=C_CARD_BG)

    # =========================================================================
    # SLIDE 20: LỜI TRI ÂN & Q&A
    # =========================================================================
    s20 = prs.slides.add_slide(blank_layout)
    
    # Outer frame
    frame20 = s20.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.6), Inches(11.733), Inches(6.3))
    frame20.fill.solid()
    frame20.fill.fore_color.rgb = C_WHITE
    frame20.line.color.rgb = C_PRIMARY
    frame20.line.width = Pt(2.5)

    inner20 = s20.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.95), Inches(0.75), Inches(11.433), Inches(6.0))
    inner20.fill.background()
    inner20.line.color.rgb = C_GOLD
    inner20.line.width = Pt(1)

    tf20 = inner20.text_frame
    tf20.word_wrap = True
    tf20.margin_top = Inches(0.4)
    tf20.margin_left = tf20.margin_right = Inches(0.5)

    p0 = tf20.paragraphs[0]
    p0.alignment = PP_ALIGN.CENTER
    r = p0.add_run()
    r.text = "LỜI CẢM ƠN & TRI ÂN SÂU SẮC"
    r.font.name = "Arial"
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = C_PRIMARY

    p1 = tf20.add_paragraph()
    p1.alignment = PP_ALIGN.CENTER
    p1.space_before = Pt(14)
    r = p1.add_run()
    r.text = "Chúng em xin trân trọng bày tỏ lòng biết ơn sâu sắc đến:\n"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = C_NAVY

    r_body = p1.add_run()
    r_body.text = (
        "✦ Cô TS. TRẦN THỊ MINH KHOA – Người đã tận tình hướng dẫn, định hướng khoa học và động viên chúng em trong suốt quá trình nghiên cứu.\n"
        "✦ QUÝ THẦY CÔ TRONG HỘI ĐỒNG BẢO VỆ – Đã dành thời gian quý báu đọc, đánh giá và đóng góp ý kiến hoàn thiện đề tài.\n"
        "✦ QUÝ THẦY CÔ KHOA CÔNG NGHỆ THÔNG TIN (IUH) – Đã truyền thụ nền tảng tri thức vững chắc trong suốt những năm đại học.\n"
        "✦ BAN GIÁM ĐỐC & CÁN BỘ BẢO TÀNG LỊCH SỬ TP.HCM – Đã tạo điều kiện thuận lợi nhất cho chúng em khảo sát và tác nghiệp thực tế."
    )
    r_body.font.name = "Arial"
    r_body.font.size = Pt(11)
    r_body.font.color.rgb = C_TEXT

    p_qa = tf20.add_paragraph()
    p_qa.alignment = PP_ALIGN.CENTER
    p_qa.space_before = Pt(24)
    r = p_qa.add_run()
    r.text = "HỎI & ĐÁP (Q&A)\n"
    r.font.name = "Arial"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = C_GOLD

    r_sub_qa = p_qa.add_run()
    r_sub_qa.text = "Kính mời Quý Thầy Cô trong Hội đồng đặt câu hỏi và đóng góp ý kiến cho chúng em!\nChúng em xin chân thành cảm ơn!"
    r_sub_qa.font.name = "Arial"
    r_sub_qa.font.size = Pt(12)
    r_sub_qa.font.italic = True
    r_sub_qa.font.color.rgb = C_DARK

    prs.save(out_path)
    print(f"BÁO CÁO POWERPOINT 20 SLIDE ĐÃ ĐƯỢC TẠO THÀNH CÔNG TẠI:\n  -> {out_path}")

if __name__ == '__main__':
    target = r'd:\KhoaluanTotNghiep\BaoCao_KhoaLuanTotNghiep_BaoTangLichSu360.pptx'
    build_presentation(target)
