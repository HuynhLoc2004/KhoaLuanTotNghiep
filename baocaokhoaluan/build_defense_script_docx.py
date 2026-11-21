# -*- coding: utf-8 -*-
"""
Script to build the official Word document for the 15-minute Graduation Thesis Defense presentation script.
Output: d:/KhoaluanTotNghiep/baocaokhoaluan/KichBan_Slide_BaoVe_KhoaLuanTotNghiep.docx
"""
import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.stdout.reconfigure(encoding='utf-8')

DOCX_OUT = r"d:\KhoaluanTotNghiep\baocaokhoaluan\KichBan_Slide_BaoVe_KhoaLuanTotNghiep.docx"
ASSETS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets"
DIAGRAMS_DIR = os.path.join(ASSETS_DIR, "diagrams")
LOGO_PATH = os.path.join(ASSETS_DIR, "iuh_logo.png")

COLOR_BLACK = (15, 23, 42)      # #0F172A
COLOR_PRIMARY = (140, 45, 25)    # #8C2D19
COLOR_NAVY = (30, 58, 95)        # #1E3A5F
COLOR_GOLD = (184, 134, 11)      # #B8860B
COLOR_MUTED = (100, 116, 139)    # #64748B

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_vertical_alignment(cell, align="center"):
    tcPr = cell._tc.get_or_add_tcPr()
    valign = parse_xml(f'<w:vAlign {nsdecls("w")} w:val="{align}"/>')
    tcPr.append(valign)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_table_borders(table, color="94A3B8", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def make_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def make_row_header(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

def format_p(p, space_before=2, space_after=2, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.0):
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    p.alignment = align
    if first_indent > 0:
        p.paragraph_format.first_line_indent = Cm(first_indent)

def set_run(run, font_name="Times New Roman", size_pt=13, bold=False, italic=False, color_rgb=COLOR_BLACK):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=14, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_run(r, size_pt=15, bold=True, color_rgb=COLOR_PRIMARY)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=10, space_after=3, align=WD_ALIGN_PARAGRAPH.LEFT)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_run(r, size_pt=13.5, bold=True, color_rgb=COLOR_NAVY)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=6, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_run(r, size_pt=13, bold=True, color_rgb=COLOR_GOLD)
    return p

def add_body_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    format_p(p, space_before=3, space_after=3, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.5)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_run(r_pre, size_pt=12.5, bold=True, color_rgb=COLOR_BLACK)
    r = p.add_run(text)
    set_run(r, size_pt=12.5, bold=False, color_rgb=COLOR_BLACK)
    return p

def add_bullet_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    format_p(p, space_before=2, space_after=2, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.0)
    p.paragraph_format.left_indent = Cm(0.8)
    r_dot = p.add_run("• ")
    set_run(r_dot, size_pt=12.5, bold=True, color_rgb=COLOR_PRIMARY)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_run(r_pre, size_pt=12.5, bold=True, color_rgb=COLOR_BLACK)
    r = p.add_run(text)
    set_run(r, size_pt=12.5, bold=False, color_rgb=COLOR_BLACK)
    return p

def add_diagram_image(doc, filename, caption):
    path = os.path.join(DIAGRAMS_DIR, filename)
    if not os.path.exists(path):
        path = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(path):
        p_img = doc.add_paragraph()
        format_p(p_img, space_before=8, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
        p_img.paragraph_format.keep_with_next = True
        r = p_img.add_run()
        r.add_picture(path, width=Cm(15.2))
        
        p_cap = doc.add_paragraph()
        format_p(p_cap, space_before=2, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER)
        r_cap = p_cap.add_run(caption)
        set_run(r_cap, size_pt=11, bold=False, italic=True, color_rgb=COLOR_MUTED)
    else:
        add_placeholder_box(doc, caption, "Sơ đồ kiến trúc kỹ thuật")

def add_real_image(doc, filename, caption, width_cm=15.2):
    path = os.path.join(ASSETS_DIR, filename)
    if not os.path.exists(path):
        path = os.path.join(DIAGRAMS_DIR, filename)
    if os.path.exists(path):
        p_img = doc.add_paragraph()
        format_p(p_img, space_before=8, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
        p_img.paragraph_format.keep_with_next = True
        r = p_img.add_run()
        r.add_picture(path, width=Cm(width_cm))
        
        p_cap = doc.add_paragraph()
        format_p(p_cap, space_before=2, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER)
        r_cap = p_cap.add_run(caption)
        set_run(r_cap, size_pt=11, bold=False, italic=True, color_rgb=COLOR_MUTED)
    else:
        add_placeholder_box(doc, caption, "Ảnh giao diện thực tế")

def add_placeholder_box(doc, title, subtitle="", width_cm=15.2, height_cm=6.5):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    row = tbl.rows[0]
    make_row_cant_split(row)
    cell = row.cells[0]
    cell.width = Cm(width_cm)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=160, bottom=160, left=160, right=160)
    set_cell_vertical_alignment(cell, "center")
    
    # Border nét đứt
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="dashed" w:sz="6" w:space="0" w:color="94A3B8"/>
            <w:bottom w:val="dashed" w:sz="6" w:space="0" w:color="94A3B8"/>
            <w:left w:val="dashed" w:sz="6" w:space="0" w:color="94A3B8"/>
            <w:right w:val="dashed" w:sz="6" w:space="0" w:color="94A3B8"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    format_p(p, space_before=12, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_icon = p.add_run("[ KHUNG CHỜ CHÈN ẢNH GIAO DIỆN WEBSITE THỰC TẾ ]\n")
    set_run(r_icon, size_pt=11.5, bold=True, color_rgb=COLOR_PRIMARY)
    
    r_tit = p.add_run(f"🖼️ {title}\n")
    set_run(r_tit, size_pt=11, bold=True, color_rgb=COLOR_NAVY)
    
    if subtitle:
        r_sub = p.add_run(f"({subtitle})\n")
        set_run(r_sub, size_pt=10, italic=True, color_rgb=COLOR_MUTED)
        
    r_hint = p.add_run("Kéo thả hình ảnh chụp màn hình thực tế của bạn vào khung này trước khi in/nộp.")
    set_run(r_hint, size_pt=9.5, italic=True, color_rgb=COLOR_MUTED)
    
    # Caption phía dưới bảng
    p_cap = doc.add_paragraph()
    format_p(p_cap, space_before=2, space_after=8, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_cap = p_cap.add_run(f"Hình minh họa: {title}")
    set_run(r_cap, size_pt=11, bold=False, italic=True, color_rgb=COLOR_MUTED)

def create_table_comparison(doc, headers, rows_data, col_widths):
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color="CBD5E1", sz="4", val="single")
    
    # Header
    r0 = tbl.rows[0]
    make_row_header(r0)
    make_row_cant_split(r0)
    for i, h in enumerate(headers):
        c = r0.cells[i]
        c.width = Cm(col_widths[i])
        set_cell_background(c, "E2E8F0")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        p = c.paragraphs[0]
        format_p(p, space_before=1, space_after=1, align=WD_ALIGN_PARAGRAPH.CENTER)
        r = p.add_run(h)
        set_run(r, size_pt=11, bold=True, color_rgb=COLOR_NAVY)
        
    for r_idx, r_data in enumerate(rows_data):
        row = tbl.rows[r_idx + 1]
        make_row_cant_split(row)
        for c_idx, val in enumerate(r_data):
            c = row.cells[c_idx]
            c.width = Cm(col_widths[c_idx])
            set_cell_background(c, "FFFFFF" if r_idx % 2 == 0 else "F8FAFC")
            set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            p = c.paragraphs[0]
            format_p(p, space_before=1, space_after=1, align=WD_ALIGN_PARAGRAPH.CENTER if c_idx == 0 else WD_ALIGN_PARAGRAPH.LEFT)
            r = p.add_run(val)
            set_run(r, size_pt=10.5, bold=(c_idx == 0), color_rgb=COLOR_BLACK)

    doc.add_paragraph() # Spacing

def main():
    doc = docx.Document()
    
    # Page Setup A4
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # =========================================================================
    # TRANG BÌA
    # =========================================================================
    if os.path.exists(LOGO_PATH):
        p_logo = doc.add_paragraph()
        format_p(p_logo, space_before=0, space_after=6, align=WD_ALIGN_PARAGRAPH.CENTER)
        r_logo = p_logo.add_run()
        r_logo.add_picture(LOGO_PATH, width=Inches(1.2))

    p_sch = doc.add_paragraph()
    format_p(p_sch, space_before=0, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_sch.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH\nKHOA CÔNG NGHỆ THÔNG TIN")
    set_run(r, size_pt=13, bold=True, color_rgb=COLOR_NAVY)

    # Line divider
    p_line = doc.add_paragraph()
    format_p(p_line, space_before=4, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_line.add_run("════════════════════════════════════════")
    set_run(r, size_pt=10, bold=True, color_rgb=COLOR_GOLD)

    p_sub = doc.add_paragraph()
    format_p(p_sub, space_before=10, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_sub.add_run("TÀI LIỆU KỊCH BẢN THUYẾT MINH SLIDE BẢO VỆ KHÓA LUẬN TỐT NGHIỆP\n(THỜI LƯỢNG: 15 PHÚT THUYẾT MINH + TRÌNH DIỄN WEB DEMO THỰC TẾ)")
    set_run(r, size_pt=12.5, bold=True, color_rgb=COLOR_GOLD)

    p_title = doc.add_paragraph()
    format_p(p_title, space_before=16, space_after=20, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_title.add_run("HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN\nBẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH")
    set_run(r, size_pt=18, bold=True, color_rgb=COLOR_PRIMARY)

    p_info = doc.add_paragraph()
    format_p(p_info, space_before=20, space_after=30, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_info.add_run(
        "Chuyên ngành: Kỹ thuật Phần mềm / Khoa học Máy tính\n\n"
        "Giảng viên hướng dẫn:\n"
        "TS. TRẦN THỊ MINH KHOA\n\n"
        "Sinh viên thực hiện:\n"
        "1. HUỲNH TẤN LỘC (Trưởng nhóm) — MSSV: 22686171\n"
        "2. TRỊNH VĨ THANH — MSSV: 22689411\n"
    )
    set_run(r, size_pt=13, bold=True, color_rgb=COLOR_BLACK)

    p_footer = doc.add_paragraph()
    format_p(p_footer, space_before=20, space_after=0, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_footer.add_run("TP. HỒ CHÍ MINH, THÁNG 11 NĂM 2026")
    set_run(r, size_pt=12, bold=True, color_rgb=COLOR_MUTED)

    doc.add_page_break()

    # =========================================================================
    # NỘI DUNG KỊCH BẢN
    # =========================================================================
    add_heading_1(doc, "1. YÊU CẦU VỀ THẨM MỸ & BỐ CỤC SLIDE (STRICT DESIGN SPECIFICATIONS)")
    add_body_p(doc, "Bộ slide thuyết minh bảo vệ khóa luận được thiết kế tuân thủ nghiêm ngặt chuẩn mực học thuật của Hội đồng đánh giá đại học quốc tế và Đại học Công nghiệp TP.HCM (IUH):")
    add_bullet_p(doc, "Phong cách tối giản (Minimalist Academic), thoáng đãng, phân cấp thông tin rõ ràng, loại bỏ toàn bộ các thẻ đóng hộp bao quanh chữ gây tù túng thị giác.", "Thẩm mỹ & Bố cục: ")
    add_bullet_p(doc, "Màu sắc đồng bộ 100% với giao diện di sản thực tế: Nền Slate Obsidian (#0F172A) / Sáng Ngọc Trai (#F8F9FA), Đỏ sơn son di sản (#8C2D19), Vàng hoàng gia (#F59E0B), Xanh than học thuật (#1E3A5F). Chữ đơn sắc tương phản cao.", "Bảng màu nhận diện: ")
    add_bullet_p(doc, "Mỗi tính năng trọng tâm bắt buộc phải có Sơ đồ luồng (Flowchart / Activity Diagram), Bảng đối chiếu kỹ thuật chuyên sâu và Khung chờ chèn ảnh chụp giao diện thật.", "Trực quan hóa khoa học: ")
    add_bullet_p(doc, "Chuyển động slide mượt mà (Fade), xuất hiện từng phần tử theo nhịp nói của diễn giả, không dùng hiệu ứng bay nhảy gây phân tâm.", "Hiệu ứng trình chiếu: ")

    add_heading_1(doc, "2. PHẦN 1: TỔNG QUAN & ĐẶT VẤN ĐỀ (Thời lượng: ~2 phút)")
    add_heading_2(doc, "2.1. Bối cảnh & 3 Hạn chế cốt lõi của phương thức tham quan truyền thống")
    add_bullet_p(doc, "Kho tàng hơn 40.000 hiện vật quý giá tại Bảo tàng Lịch sử TP.HCM khó tiếp cận với du khách vùng xa, kiều bào và quốc tế do trở ngại địa lý; khung giờ mở cửa cố định và đóng cửa Thứ Hai định kỳ.", "Rào cản Không gian & Thời gian: ")
    add_bullet_p(doc, "Thiết bị quét 3D Laser Matterport hàng trăm triệu đồng cùng phí thuê bao đám mây định kỳ đắt đỏ, không phù hợp với ngân sách bảo tàng công lập.", "Chi phí thiết bị số hóa quá lớn: ")
    add_bullet_p(doc, "Cổ vật quý hiếm đặt sau tủ kính phản quang mạnh; du khách chỉ nhìn được mặt trước, không thể xoay đa chiều, phóng to hoa văn tinh xảo hay nghe thuyết minh đa ngữ tại chỗ.", "Tương tác hiện vật bị ngăn cách: ")

    add_heading_2(doc, "2.2. Mục tiêu nghiên cứu & Phạm vi triển khai")
    add_body_p(doc, "Đề tài hướng tới việc làm chủ toàn diện chuỗi công nghệ số hóa không gian di sản với chi phí thiết bị phần cứng 0đ (tận dụng máy ảnh và điện thoại thông minh sẵn có), đưa toàn bộ 18 gian phòng trưng bày liên hoàn lên không gian thực tế ảo 360° tương tác thời gian thực.")
    add_body_p(doc, "Hệ thống phục vụ đồng thời hai đối tượng: Khách tham quan đại chúng (trải nghiệm mượt mà không cần cài app) và Ban quản trị bảo tàng (làm chủ CMS, cấu hình Hotspot trực quan trong 3D, quản lý vé VietQR, soát vé camera và giám sát Grafana).")

    add_diagram_image(doc, "hinh_1_1_mindmap.png", "Hình 1. Sơ đồ tư duy (Mindmap) cấu trúc mục tiêu và bài toán giải quyết của Khóa luận")

    add_heading_1(doc, "3. PHẦN 2: CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG (Thời lượng: ~3 phút)")
    add_heading_2(doc, "3.1. Ngăn xếp công nghệ cốt lõi (Tech Stack)")
    add_bullet_p(doc, "React 18, TypeScript, Vite, Tailwind CSS, Three.js (WebGL 3D Engine), OrbitControls, HTML5-QRCode, jsQR, Web Audio API, Vibration API.", "Frontend Web Client: ")
    add_bullet_p(doc, "Node.js v20, Express, Python 3.11 (Flask, OpenCV, SIFT, Voronoi Seam, Laplacian Pyramid Blending), Redis 7 Queue / RabbitMQ, Nginx Reverse Proxy (HTTP 206 Streaming).", "Backend & Studio Hub: ")
    add_bullet_p(doc, "Kiến trúc lai Hybrid kết hợp PostgreSQL 16 (Chuẩn ACID cho vé, đơn hàng PayOS, phân quyền) + MongoDB (Dữ liệu phân cấp 18 phòng 360°, Hotspots, cổ vật, đa ngôn ngữ) + Redis Cache (Session, OTP Email TTL 300s).", "Cơ sở dữ liệu lai: ")
    add_bullet_p(doc, "Cổng PayOS VietQR Napas 247, Google Cloud Text-to-Speech Neural2 (7 ngôn ngữ), Google Gemini API, Grafana v11 APM Monitoring (PostgreSQL Read-Only Mode).", "Hạ tầng AI & Quan sát: ")

    add_heading_2(doc, "3.2. Sơ đồ Kiến trúc Hệ thống 3 tầng (3-Tier Hybrid Architecture)")
    add_diagram_image(doc, "hinh_2_9_architecture_3tier.png", "Hình 2. Sơ đồ kiến trúc hệ thống 3 tầng: Client, API Gateway Services và CSDL lai")

    add_heading_1(doc, "4. PHẦN 3: PHÂN TÍCH TÍNH NĂNG, LUỒNG HOẠT ĐỘNG & SO SÁNH KỸ THUẬT (Thời lượng: ~7 phút)")

    # Tính năng 1
    add_heading_2(doc, "4.1. Tính năng 1: Hiển thị & Điều hướng Không gian 360° Panorama")
    add_body_p(doc, "Khách chọn 1 trong 18 phòng -> Tải Texture Equirectangular WebP -> Ánh xạ mặt trong khối cầu Three.js SphereGeometry (Inverted Normals) -> Điều khiển góc nhìn OrbitControls -> Render 60 FPS -> Gọi dispose() giải phóng VRAM khi đổi phòng.", bold_prefix="• Sơ đồ luồng hoạt động: ")
    add_body_p(doc, "Chiếu ảnh toàn cảnh 360° x 180° lên mặt trong khối cầu bán kính R=500. Đảo ngược pháp tuyến scale(-1, 1, 1) để camera tại tâm nhìn vào lòng cầu. Chuyển đổi tọa độ cầu sang Descartes và điều chỉnh FOV thích ứng di động (65°) và máy tính (45°).", bold_prefix="• Cơ chế kỹ thuật: ")

    create_table_comparison(doc,
        ["Tiêu chí", "Tải 1 ảnh cầu Equirectangular phẳng (Đề tài chọn)", "Tải phân mảnh đa độ phân giải (Multi-res Tiling)"],
        [
            ("Nguyên lý kết xuất", "Nạp 1 tệp ảnh toàn cảnh tỉ lệ 2:1 WebP (4096 x 2048px).", "Cắt 6 mặt lập phương và chia nhỏ thành hàng trăm mảnh lưới tiles."),
            ("Độ phức tạp máy chủ", "Rất thấp, lưu trữ tệp tĩnh phân phối qua Nginx, không tốn CPU cắt ảnh.", "Rất cao, máy chủ phải xử lý tiền kỳ hàng nghìn tệp nhỏ cho 18 phòng."),
            ("Thời gian nạp ban đầu", "Nhanh chóng (< 0.82s trên mạng 4G), chỉ duy nhất 1 HTTP request.", "Chậm hơn do phải gửi hàng chục HTTP requests đồng thời."),
            ("Chiếm dụng RAM/VRAM", "Ổn định (< 15MB RAM tăng thêm), giải phóng sạch GPU qua dispose().", "Dễ gây giật khung hình (Tile tearing) khi xoay nhanh trên di động."),
            ("Kết luận lựa chọn", "Tối ưu vượt trội cho Web di động và hạ tầng mạng phổ thông Việt Nam.", "Chỉ phù hợp với ảnh đại siêu nét Gigapixel trên máy tính chuyên dụng.")
        ],
        [3.5, 5.8, 5.9]
    )
    add_diagram_image(doc, "flow_01_stitching_process.png", "Hình 3a. Sơ đồ quy trình tạo & ghép ảnh toàn cảnh 360° tự động từ dữ liệu đa nguồn")
    add_real_image(doc, "real_client_interactive_tour360.png", "Hình 3b. Giao diện Cổng tham quan tương tác 360° Sảnh Bát Giác & Phòng Champa trên website (https://museumhcm.duckdns.org)")

    # Tính năng 2
    add_heading_2(doc, "4.2. Tính năng 2: Điểm neo chuyển cảnh (Hotspots) & Sơ đồ mặt bằng Mini-map Dijkstra")
    add_body_p(doc, "Admin click đúp vị trí trong 360° -> Raycaster bắt giao điểm mặt cầu tính (Pitch, Yaw) -> Lưu MongoDB -> Khách click Hotspot mũi tên nhấp nháy -> Cross-fade chuyển cảnh 350ms -> Cập nhật lộ trình Mini-map Dijkstra.", bold_prefix="• Sơ đồ luồng hoạt động: ")
    add_body_p(doc, "Thuật toán Three.js Raycaster bắn tia từ tọa độ chuột xuyên qua không gian 3D lấy cặp góc cầu. Shader hoạt họa Pulsing Glow chu kỳ 1.5s tạo hiệu ứng phát sáng. Thuật toán Dijkstra tìm lộ trình ngắn nhất trên đồ thị 18 phòng và vẽ đường nét đứt phát sáng trên Mini-map.", bold_prefix="• Cơ chế kỹ thuật: ")

    create_table_comparison(doc,
        ["Tiêu chí", "Ghim Hotspot đối tượng 3D trong không gian cầu (Đề tài chọn)", "Ghim Hotspot 2D trên khung nhìn màn hình (Screen Overlay)"],
        [
            ("Bản chất kiến trúc", "Đối tượng Three.js Sprite gắn cố định tại tọa độ thực (x, y, z) trên mặt cầu.", "Thẻ HTML <div> ghim tĩnh trên màn hình và tính lại CSS transform."),
            ("Độ chân thực", "Chân thực 100%: Điểm neo xoay tự nhiên, tự động phóng to thu nhỏ theo camera.", "Kém tự nhiên, dễ bị lệch vị trí (Drift) khi xoay quán tính hoặc nghiêng máy."),
            ("Hiệu năng Render", "Tối ưu bằng GPU qua WebGL Pipeline, duy trì ổn định 60 FPS.", "Gây tụt khung hình do trình duyệt liên tục reflow/repaint cây DOM."),
            ("Bắt sự kiện", "Bắt sự kiện Raycasting chuẩn xác, dễ gắn âm thanh và hiệu ứng hạt.", "Xử lý sự kiện click phức tạp qua các lớp z-index chồng chéo.")
        ],
        [3.5, 5.8, 5.9]
    )
    add_diagram_image(doc, "flow_02_floorplan_dijkstra.png", "Hình 4a. Sơ đồ thuật toán số hóa sơ đồ mặt bằng và định tuyến đường đi ngắn nhất Dijkstra")
    add_real_image(doc, "real_admin_guide_floorplan.png", "Hình 4b. Giao diện Quản lý Sơ đồ mặt bằng kiến trúc và Mini-map dẫn đường Dijkstra")

    # Tính năng 3
    add_heading_2(doc, "4.3. Tính năng 3: Số hóa Cổ vật 3D tương tác & Thuyết minh Audio AI đa ngôn ngữ")
    add_body_p(doc, "Khách chọn cổ vật -> Nạp mô hình 3D .GLB (Xoay 360°, Zoom, Pan) -> Chọn ngôn ngữ (VI/EN/FR) -> Kiểm tra Cache MD5 -> Google Cloud TTS Neural2 sinh giọng đọc -> Nginx Stream HTTP 206 (<50ms).", bold_prefix="• Sơ đồ luồng hoạt động: ")
    add_body_p(doc, "Kiến trúc Tái tạo 3D Kép (Dual-Engine Fallback): Kết hợp Cloud AI TRELLIS (Deep Learning trên GPU HuggingFace sinh lưới đa giác PBR chi tiết cao) và Động cơ Nội bộ Local CPU (tách nền U2-Net, tiện khối tròn xoay đối xứng trục Radial-Axial). Bộ đệm băm Hash Storage MD5 lưu tệp tĩnh /audio_cache/{Key}.mp3 phát qua HTTP 206.", bold_prefix="• Cơ chế kỹ thuật: ")

    create_table_comparison(doc,
        ["Tiêu chí", "Động cơ Cloud AI TRELLIS (Đề tài chọn ưu tiên)", "Động cơ Nội bộ Local CPU (Đề tài chọn dự phòng)"],
        [
            ("Nguyên lý tạo 3D", "Generative AI tái cấu trúc hình học 3D và bề mặt PBR từ ảnh tư liệu.", "Tách nền U2-Net, quét ma trận khoảng cách tâm trục Euclid, tiện tròn xoay."),
            ("Độ chi tiết", "Rất cao: Thể hiện nếp gấp, hoa văn đục đẽo, mặt trước và sau hoàn chỉnh.", "Mức cơ bản: Phù hợp nhất cho cổ vật tròn xoay đối xứng (gốm, bình, trống)."),
            ("Chi phí máy chủ", "Chi phí 0đ nhờ tận dụng tài nguyên ZeroGPU A100 miễn phí trên Cloud.", "Tiêu tốn CPU máy chủ khi dựng hình, nhưng chạy nội bộ 100% không hết quota."),
            ("Thời gian sinh", "Khoảng 30 – 60 giây cho một mô hình 3D hoàn chỉnh.", "Nhanh (< 5s trên CPU), tạo mô hình lưới sơ bộ tức thì.")
        ],
        [3.5, 5.8, 5.9]
    )
    add_diagram_image(doc, "flow_04_dual_engine_3d.png", "Hình 5a. Sơ đồ quy trình số hóa cổ vật 3D bằng mạng U2-Net và Kiến trúc Đa Động cơ (TRELLIS & Local CPU)")
    add_real_image(doc, "real_client_artifacts_section.png", "Hình 5b. Giao diện Chiêm ngưỡng Cổ vật 3D tương tác xoay đa chiều & Thông tin di sản trên website")

    # Tính năng 4
    add_heading_2(doc, "4.4. Tính năng 4: Đặt vé VietQR Napas 247, Soát vé cổng Camera và Quét QR Trưng bày Phygital")
    add_body_p(doc, "Khách đặt vé /booking -> PayOS sinh VietQR Napas 247 (15p) -> Webhook HMAC-SHA256 cập nhật CSDL -> Vé mã hóa AES-256 nạp vào Tab My ticket (/profile) -> Nhân viên quét Camera tại cổng -> Chuyển USED -> Sự kiện Realtime SSE bắn về máy khách (<1ms) rung máy đổi trạng thái.", bold_prefix="• Sơ đồ luồng hoạt động: ")
    add_body_p(doc, "Tự động sinh Dynamic QR chuẩn ISO/IEC 18004 300 DPI / SVG cho 18 phòng và từng hiện vật. Hộp thoại quét QRScannerModal.tsx chạy jsQR lấy mẫu đa kích thước (1000, 600, 1400px) loại bỏ lóa sáng qua tủ kính, phát Beep 880Hz, rung xúc giác và tự động cảnh báo nếu quét nhầm vé.", bold_prefix="• Cơ chế kỹ thuật: ")

    create_table_comparison(doc,
        ["Tiêu chí", "Soát vé điện tử tại cổng (Ticket QR)", "Quét mã QR Trưng bày tại tủ kính (Exhibition QR)"],
        [
            ("Đối tượng & Vị trí", "Dành cho Nhân viên soát vé (Staff) tại cửa ra vào bảo tàng.", "Dành cho Khách tham quan (Visitor) trước tủ kính hoặc cửa phòng."),
            ("Mục đích", "Kiểm tra quyền vào cổng, chuyển trạng thái PAID sang USED, chống quay vòng.", "Trải nghiệm Phygital: Mở ngay mô hình 3D (.GLB) kèm Audio hoặc vào phòng 360°."),
            ("Công nghệ quét", "Module HTML5-QRCode chuyên dụng cho quản trị/nhân viên.", "Hộp thoại QRScannerModal.tsx (jsQR) trên thanh Navbar di động của khách."),
            ("Khử nhiễu môi trường", "Môi trường ánh sáng tiêu chuẩn tại quầy soát vé.", "Khử lóa sáng tủ kính (Multi-res): Lấy mẫu 3 kích thước, độ nhạy > 99.2%."),
            ("Phản hồi hệ thống", "Đổi CSDL sang USED, mở barie, bắn sự kiện SSE sang máy khách.", "Phát Beep 880Hz, rung xúc giác, phân luồng thông minh cảnh báo nếu nhầm vé.")
        ],
        [3.5, 5.8, 5.9]
    )
    add_diagram_image(doc, "flow_05_ticketing_vietqr_qr.png", "Hình 6a. Sơ đồ quy trình đặt vé trực tuyến VietQR và soát vé mã QR thời gian thực")
    add_real_image(doc, "real_client_booking_vietqr.png", "Hình 6b. Giao diện Cổng đặt vé trực tuyến VietQR PayOS và thanh toán tự động")
    add_real_image(doc, "real_admin_tickets_management.png", "Hình 6c. Giao diện Quản lý Đơn vé & Soát vé camera thời gian thực trên Cổng Quản trị Admin")

    # Tính năng 5
    add_heading_2(doc, "4.5. Tính năng 5: Phân hệ Quản trị CMS Đa bảo tàng, Giám sát Grafana & Xuất Excel")
    add_body_p(doc, "Admin đăng nhập JWT 24h -> Nhúng bảng điều khiển Grafana v11 Iframe Read-Only (pg_readonly) -> Giám sát KPIs vé, tài nguyên VPS, APM API -> Bấm 'Xuất file Excel' (xlsx-js-style phía Client) -> Tải về sổ tính 4 Worksheets chuyên biệt.", bold_prefix="• Sơ đồ luồng hoạt động: ")
    add_body_p(doc, "Tích hợp dịch vụ Grafana container liên kết PostgreSQL pg_readonly an toàn tuyệt đối. Tính năng xuất Excel phía Client bằng xlsx-js-style giải phóng 100% tài nguyên CPU/RAM máy chủ, định dạng màu sắc nhận diện hoàng gia, tự động căn chỉnh độ rộng cột và dịch nhãn cột 5 thứ tiếng.", bold_prefix="• Cơ chế kỹ thuật: ")

    add_diagram_image(doc, "hinh_2_14_grafana_architecture.png", "Hình 7a. Sơ đồ kiến trúc thu thập và hiển thị dữ liệu giám sát hệ thống với Grafana & Prometheus")
    add_real_image(doc, "real_admin_page.png", "Hình 7b. Giao diện Bảng điều khiển Quản trị Admin, Dashboard Grafana v11 và Xuất báo cáo Excel")

    add_heading_1(doc, "5. PHẦN 4: KỊCH BẢN CHẠY WEB DEMO & KẾT QUẢ ĐẠT ĐƯỢC (Thời lượng: ~3 phút)")
    add_heading_2(doc, "5.1. Kịch bản Demo trực tiếp 4 bước trước Hội đồng (Bấm trực tiếp trên web thật)")
    add_bullet_p(doc, "Từ trang chủ, bấm 'Bắt đầu Tour 360°' vào Sảnh Bát Giác. Xoay tự do 360° x 180°, phóng to ngắm trần nhà kiến trúc Đông Dương. Nhấp vào Hotspot mũi tên phát sáng trước cửa: Màn hình cross-fade mượt mà bước ngay vào Phòng Văn hóa Champa.", "Bước 1 (30s) — Tour 360° & Hotspot: ")
    add_bullet_p(doc, "Mở khay Bottom Sheet danh sách cổ vật, chọn 'Tượng Bồ Tát Tara'. Cửa sổ 3D mở ra: Thực hiện xoay 360°, phóng to hoa văn độc bản. Bấm chuyển ngôn ngữ sang English/Français: Trình phát Audio nổi phát giọng đọc AI Neural2 truyền cảm tức thì mà không đổi ngôn ngữ chung của website.", "Bước 2 (40s) — Cổ vật 3D & Audio AI: ")
    add_bullet_p(doc, "Bật Mini-map ở góc màn hình, chọn phòng số 18: Hệ thống vẽ đường nét đứt phát sáng hiển thị lộ trình ngắn nhất Dijkstra. Bấm nút 'Quét QR' trên Navbar di động demo camera tương tác Phygital bắt mã QR cổ vật.", "Bước 3 (30s) — Mini-map Dijkstra & QR Phygital: ")
    add_bullet_p(doc, "Vào trang Đặt vé /booking: Chọn ngày, chọn khung giờ Sáng, tăng 2 vé Người lớn (60.000 VNĐ). Bấm Thanh toán VietQR: Modal hiện mã QR Napas 247. Mở app ngân hàng quét chuyển khoản thật: Máy chủ nhận Webhook trong 1 giây, tự chuyển sang trang /profile Tab My ticket hiện vé hợp lệ. Trên tab khác đóng vai trò nhân viên tại cổng, mở Camera quét mã vé: Màn hình nhân viên hiện tích xanh hợp lệ; đồng thời màn hình du khách tự động chuyển sang 'ĐÃ SOÁT VÉ' tức thì qua luồng SSE trong < 1ms mà không cần tải lại trang.", "Bước 4 (50s) — Đặt vé VietQR & Soát vé Realtime SSE: ")

    add_heading_2(doc, "5.2. Kết quả định lượng đo đạc thực tế & Hướng phát triển")
    add_bullet_p(doc, "Đạt 58 – 60 FPS ổn định trong suốt quá trình xoay hình cầu và tương tác 3D trên cả máy tính và điện thoại thông minh tầm trung.", "Tốc độ khung hình (FPS): ")
    add_bullet_p(doc, "Đạt 0.82 giây trên kết nối mạng di động 4G thông thường.", "Thời gian tải trang ban đầu (LCP): ")
    add_bullet_p(doc, "Lượng RAM tăng thêm sau khi du khách đi hết 18 phòng được kiểm soát dưới 15 MB nhờ cơ chế giải phóng bộ nhớ triệt để texture.dispose().", "Kiểm soát tài nguyên bộ nhớ: ")
    add_bullet_p(doc, "Đạt 96/100 điểm Hiệu năng (Performance), 98/100 điểm Khả năng tiếp cận (Accessibility), và 100/100 điểm SEO di sản văn hóa.", "Đánh giá Google Lighthouse: ")
    add_bullet_p(doc, "Số hóa hoàn chỉnh toàn bộ 18 gian phòng trưng bày liên hoàn và bộ sưu tập bảo vật quốc gia của Bảo tàng Lịch sử TP. Hồ Chí Minh.", "Quy mô số hóa di sản: ")
    add_bullet_p(doc, "Hỗ trợ người dùng đeo kính Meta Quest / Apple Vision Pro để bước đi tự do và cầm nắm cổ vật ảo trong không gian 6 bậc tự do (6-DoF).", "Hướng 1 — Thực tế ảo WebXR: ")
    add_bullet_p(doc, "Nâng cấp chất lượng hình ảnh toàn cảnh từ ảnh cầu 2D lên không gian thể tích 3D thời gian thực với hiệu ứng ánh sáng chân thực tuyệt đối.", "Hướng 2 — 3D Gaussian Splatting: ")

    add_diagram_image(doc, "hinh_4_40_lighthouse.png", "Hình 9. Kết quả đánh giá chỉ số hiệu năng và Web Vitals bằng Google Lighthouse")

    add_heading_1(doc, "6. LỜI KẾT & TRI ÂN HỘI ĐỒNG BẢO VỆ")
    add_body_p(doc, "Kính thưa Quý Thầy Cô trong Hội đồng đánh giá Khóa luận tốt nghiệp, nhóm sinh viên chúng em xin bày tỏ lòng biết ơn chân thành và sâu sắc đến Ban Giám hiệu Nhà trường, Quý Thầy Cô Khoa Công nghệ Thông tin - Trường Đại học Công nghiệp TP.HCM, và đặc biệt là Cô TS. Trần Thị Minh Khoa đã tận tình hướng dẫn, định hướng khoa học giúp chúng em hoàn thành đề tài này.")
    add_body_p(doc, "Chúng em cũng xin trân trọng cảm ơn Ban Giám đốc và các Cán bộ chuyên môn tại Bảo tàng Lịch sử TP. Hồ Chí Minh đã tạo điều kiện tối đa cho nhóm tác nghiệp thực địa, cung cấp tư liệu quý báu để hiện thực hóa sản phẩm.")
    add_body_p(doc, "Kính chúc Quý Thầy Cô dồi dào sức khỏe và hạnh phúc. Nhóm nghiên cứu chúng em kính mời Quý Thầy Cô cùng bước vào phần Trình diễn Web Demo thực tế và rất mong nhận được những ý kiến đóng góp quý báu từ Hội đồng!")

    # Save document
    try:
        doc.save(DOCX_OUT)
        print(f"DOCUMENT CREATED SUCCESSFULLY AT: {DOCX_OUT}")
    except PermissionError:
        backup_out = DOCX_OUT.replace(".docx", "_CapNhat.docx")
        doc.save(backup_out)
        print(f"=== TỆP ĐANG ĐƯỢC MỞ TRONG WORD! ĐÃ LƯU BẢN CẬP NHẬT MỚI TẠI: {backup_out} ===")
        print(f"=== (Vui lòng đóng file trong Word để hệ thống có thể ghi đè trực tiếp vào {DOCX_OUT}) ===")

if __name__ == "__main__":
    main()
