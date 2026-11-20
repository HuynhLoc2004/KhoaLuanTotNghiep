# -*- coding: utf-8 -*-
"""
BUILD MASTER THESIS REPORT - KHOA LUAN TOT NGHIEP (IUH)
De tai: HE THONG THAM QUAN THUC TE AO 360° & SO HOA KHONG GIAN DI SAN BAO TANG LICH SU TP. HO CHI MINH
GVHD: TS. Tran Thi Minh Khoa
SVTH: Huynh Tan Loc (22686171) & Trinh Vi Thanh (22689411)
Tuan thu nghiem ngat:
- QUI DINH BAO CAO KLTN(1).docx (Quy dinh GVHD TS. Tran Thi Minh Khoa)
- TURNITIN_KLTN_THOOI_TienTran copy_mau.pdf (Bao cao mau Tien Tran - IUH)
- QUY_TAC_VIET_KHOA_LUAN.md
- Dung luong: It nhat 80 trang bat dau tu Chuong 1
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

DOCX_OUT = r"d:\KhoaluanTotNghiep\baocaokhoaluan\BaoCao_KhoaLuanTotNghiep_BaoTang360.docx"
ASSETS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets"
LOGO_PATH = os.path.join(ASSETS_DIR, "iuh_logo.png")

COLOR_BLACK = (0, 0, 0)
COLOR_GRAY_TEXT = (71, 85, 105) # #475569

# =============================================================================
# CAC HAM FORMAT CO BAN
# =============================================================================

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

def setup_page_layout(section, top_cm=3.0, bottom_cm=3.0, left_cm=3.5, right_cm=2.0):
    section.page_width = Inches(21.0 / 2.54)
    section.page_height = Inches(29.7 / 2.54)
    section.top_margin = Inches(top_cm / 2.54)
    section.bottom_margin = Inches(bottom_cm / 2.54)
    section.left_margin = Inches(left_cm / 2.54)
    section.right_margin = Inches(right_cm / 2.54)

def format_paragraph(p, space_before=3, space_after=0, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.76, left_indent=0.0):
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    p.alignment = align
    p.paragraph_format.first_line_indent = Cm(first_indent) if first_indent != 0 else 0
    p.paragraph_format.left_indent = Cm(left_indent) if left_indent != 0 else 0

def set_run_font(run, font_name="Times New Roman", size_pt=13, bold=False, italic=False, color_rgb=COLOR_BLACK):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_body_p(doc, text, space_before=3, space_after=0, line_spacing=1.5):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=space_before, space_after=space_after, line_spacing=line_spacing, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.76, left_indent=0.0)
    run = p.add_run(text)
    set_run_font(run, "Times New Roman", 13, bold=False, italic=False, color_rgb=COLOR_BLACK)
    return p

def add_bullet_item(doc, text, bold_prefix="", space_before=2, space_after=2):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=space_before, space_after=space_after, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=-0.5, left_indent=0.76)
    if bold_prefix:
        set_run_font(p.add_run(bold_prefix), "Times New Roman", 13, bold=True, color_rgb=COLOR_BLACK)
    set_run_font(p.add_run(text), "Times New Roman", 13, bold=False, italic=False, color_rgb=COLOR_BLACK)
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=12, space_after=6, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0, left_indent=0.0)
    p.paragraph_format.keep_with_next = True
    set_run_font(p.add_run(text), "Times New Roman", 13, bold=True, italic=False, color_rgb=COLOR_BLACK)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=8, space_after=3, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0, left_indent=0.0)
    p.paragraph_format.keep_with_next = True
    set_run_font(p.add_run(text), "Times New Roman", 13, bold=True, italic=False, color_rgb=COLOR_BLACK)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=6, space_after=2, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0, left_indent=0.0)
    p.paragraph_format.keep_with_next = True
    set_run_font(p.add_run(text), "Times New Roman", 13, bold=True, italic=False, color_rgb=COLOR_BLACK)
    return p

def add_heading_4(doc, text):
    p = doc.add_paragraph()
    format_paragraph(p, space_before=4, space_after=2, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0, left_indent=0.0)
    p.paragraph_format.keep_with_next = True
    set_run_font(p.add_run(text), "Times New Roman", 13, bold=True, italic=True, color_rgb=COLOR_BLACK)
    return p

# =============================================================================
# KHUNG CHUA ANH PLACEHOLDER CHUAN (KHONG DUNG ANH AI, CHUA CHO SINH VIEN)
# =============================================================================

def add_figure_caption(doc, fig_id, fig_title):
    p_cap = doc.add_paragraph()
    format_paragraph(p_cap, space_before=0, space_after=4, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_cap.paragraph_format.keep_with_next = False
    r_cap = p_cap.add_run(f"Hình {fig_id}. {fig_title}")
    set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)
    return p_cap

def add_figure_placeholder(doc, fig_id, fig_title, description, width_cm=15.0, height_cm=7.5):
    """
    Neu da co so do vector hoc thuat trong thu muc assets/diagrams (khop voi fig_id),
    se chen truc tiep hinh anh vao tai lieu va in chu thich.
    Neu la anh chup man hinh giao dien thuc te chua co, se tao khung cho trang nha.
    """
    import glob
    diagrams_dir = os.path.join(os.path.dirname(__file__), "assets", "diagrams")
    normalized_id = str(fig_id).replace('.', '_')
    matching_files = glob.glob(os.path.join(diagrams_dir, f"hinh_{normalized_id}_*.png"))
    
    if matching_files and os.path.exists(matching_files[0]):
        img_path = matching_files[0]
        p_img = doc.add_paragraph()
        format_paragraph(p_img, space_before=6, space_after=2, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_img.paragraph_format.keep_with_next = True
        r_img = p_img.add_run()
        r_img.add_picture(img_path, width=Cm(15.2))
        
        # Chu thich phia duoi
        p_cap = doc.add_paragraph()
        format_paragraph(p_cap, space_before=0, space_after=4, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_cap.paragraph_format.keep_with_next = False
        r_cap = p_cap.add_run(f"Hình {fig_id}. {fig_title}")
        set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)
        return
        
    p_box = doc.add_paragraph()
    format_paragraph(p_box, space_before=6, space_after=0, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    row = tbl.rows[0]
    make_row_cant_split(row)
    cell = row.cells[0]
    cell.width = Cm(width_cm)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=200, bottom=200, left=200, right=200)
    set_cell_vertical_alignment(cell, "center")
    
    # Border net dut trang nha
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
    
    cp = cell.paragraphs[0]
    format_paragraph(cp, space_before=4, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r1 = cp.add_run(f"[KHUNG CHỜ CHÈN ẢNH THỰC TẾ: {fig_title}]\n")
    set_run_font(r1, "Times New Roman", 11, bold=True, italic=False, color_rgb=(30, 41, 59))
    r2 = cp.add_run(f"({description} — Kích thước khuyến nghị: Rộng 14–15.5cm, Cao {height_cm}cm)")
    set_run_font(r2, "Times New Roman", 10, bold=False, italic=True, color_rgb=COLOR_GRAY_TEXT)
    
    # Chu thich phia duoi hinh theo dung quy dinh: Can giua, co 13, in nghieng
    p_cap = doc.add_paragraph()
    format_paragraph(p_cap, space_before=0, space_after=4, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_cap.paragraph_format.keep_with_next = False
    r_cap = p_cap.add_run(f"Hình {fig_id}. {fig_title}")
    set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)

def add_comparison_figure_placeholder(doc, fig_id, fig_title, label_a, guide_a, label_b, guide_b, col_width_cm=7.5, height_cm=6.5):
    """
    Tao bang 2 cot doi xung voi vien net dut trang nha de nguoi dung tu chen 2 anh thuc te so sanh (A va B).
    """
    p_box = doc.add_paragraph()
    format_paragraph(p_box, space_before=6, space_after=0, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    
    tbl = doc.add_table(rows=1, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    row = tbl.rows[0]
    make_row_cant_split(row)
    
    items = [
        (row.cells[0], label_a, guide_a),
        (row.cells[1], label_b, guide_b)
    ]
    
    for cell, label, guide in items:
        cell.width = Cm(col_width_cm)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=260, bottom=260, left=180, right=180)
        set_cell_vertical_alignment(cell, "center")
        
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
        
        cp = cell.paragraphs[0]
        format_paragraph(cp, space_before=6, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        
        r1 = cp.add_run(f"{label}\n")
        set_run_font(r1, "Times New Roman", 10.5, bold=True, color_rgb=(30, 58, 138))
        
        r2 = cp.add_run(f"{guide}")
        set_run_font(r2, "Times New Roman", 9.5, italic=True, color_rgb=COLOR_GRAY_TEXT)
        
    p_cap = doc.add_paragraph()
    format_paragraph(p_cap, space_before=0, space_after=4, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_cap.paragraph_format.keep_with_next = False
    r_cap = p_cap.add_run(f"Hình {fig_id}. {fig_title}")
    set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)

def add_equation(doc, math_expr, eq_no):
    """
    Dinh dang cong thuc toan hoc tren bang 1 hang 2 cot khong vien.
    Cot 1 (13.5cm): Cong thuc toan can giua, nghieng, Times New Roman 12.5pt.
    Cot 2 (2.0cm): Danh so cong thuc (X.Y) can phai, in dam.
    Dam bao khong bao gio bi wrap hay xuong dong lech cot.
    """
    tbl = doc.add_table(rows=1, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:bottom w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tbl._tbl.tblPr.append(borders)
    
    row = tbl.rows[0]
    make_row_cant_split(row)
    
    c_m = row.cells[0]
    c_m.width = Cm(13.5)
    set_cell_margins(c_m, top=30, bottom=30, left=30, right=30)
    set_cell_vertical_alignment(c_m, "center")
    p_m = c_m.paragraphs[0]
    format_paragraph(p_m, space_before=2, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_m = p_m.add_run(math_expr)
    set_run_font(r_m, "Times New Roman", 12.5, bold=False, italic=True, color_rgb=COLOR_BLACK)
    
    c_n = row.cells[1]
    c_n.width = Cm(2.0)
    set_cell_margins(c_n, top=30, bottom=30, left=30, right=30)
    set_cell_vertical_alignment(c_n, "center")
    p_n = c_n.paragraphs[0]
    format_paragraph(p_n, space_before=2, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_n = p_n.add_run(f"({eq_no})")
    set_run_font(r_n, "Times New Roman", 12.5, bold=True, italic=False, color_rgb=COLOR_BLACK)

def add_custom_table(doc, headers, rows, col_widths, alignments, table_caption=None):
    """
    Tao bang tuy bien voi header xam nhat, border sac net, can chinh linh hoat.
    """
    if table_caption:
        # Neu caption da co dang 'Bang X.Y: ...' thi in truc tiep
        p_cap = doc.add_paragraph()
        format_paragraph(p_cap, space_before=4, space_after=2, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_cap.paragraph_format.keep_with_next = True
        r_cap = p_cap.add_run(table_caption)
        set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)

    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color="475569", sz="6", val="single")

    widths = [Cm(w) for w in col_widths]

    # Header row
    r0 = tbl.rows[0]
    make_row_header(r0)
    make_row_cant_split(r0)
    for i, h in enumerate(headers):
        c = r0.cells[i]
        c.width = widths[i]
        set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)

    # Data rows
    for r_idx, r_data in enumerate(rows):
        row = tbl.rows[r_idx + 1]
        make_row_cant_split(row)
        for c_idx, val in enumerate(r_data):
            c = row.cells[c_idx]
            c.width = widths[c_idx]
            c.paragraphs[0].text = str(val)
            align = alignments[c_idx] if c_idx < len(alignments) else WD_ALIGN_PARAGRAPH.LEFT
            c.paragraphs[0].alignment = align
            set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(c_idx == 0 and len(headers) > 4))

    for r in tbl.rows:
        for c in r.cells:
            set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
    return tbl

def add_table_caption(doc, tbl_id, tbl_title):
    p_cap = doc.add_paragraph()
    format_paragraph(p_cap, space_before=4, space_after=2, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_cap.paragraph_format.keep_with_next = True
    r_cap = p_cap.add_run(f"Bảng {tbl_id}. {tbl_title}")
    set_run_font(r_cap, "Times New Roman", 13, bold=False, italic=True, color_rgb=COLOR_BLACK)



# =============================================================================
# HAM TAO BANG USE CASE DAC TA CHUAN NHU MAU TIEN TRAN
# =============================================================================

def add_use_case_table(doc, tbl_id, uc_title, actor, desc, pre_cond, post_cond, basic_steps, alt_steps):
    """Tao bang dac ta use case tieu chuan nhu Mau KLTN Tien Tran & Quy dinh IUH."""
    add_table_caption(doc, tbl_id, f"Đặc tả Use Case {uc_title}")
    
    tbl = doc.add_table(rows=6 + len(basic_steps) + len(alt_steps), cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color="475569", sz="6", val="single")
    
    col_widths = [Cm(3.5), Cm(6.0), Cm(6.0)]
    
    # Row 0: Ten Use Case
    r0 = tbl.rows[0]
    make_row_cant_split(r0)
    r0.cells[0].merge(r0.cells[0]) # keep single
    c0_1 = r0.cells[1].merge(r0.cells[2])
    r0.cells[0].width = col_widths[0]
    c0_1.width = Cm(12.0)
    set_cell_background(r0.cells[0], "F1F5F9")
    r0.cells[0].paragraphs[0].text = "Tên Use Case"
    set_run_font(r0.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    c0_1.paragraphs[0].text = uc_title
    set_run_font(c0_1.paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    
    # Row 1: Tác nhân (Actor)
    r1 = tbl.rows[1]
    make_row_cant_split(r1)
    c1_1 = r1.cells[1].merge(r1.cells[2])
    r1.cells[0].width = col_widths[0]
    c1_1.width = Cm(12.0)
    set_cell_background(r1.cells[0], "F1F5F9")
    r1.cells[0].paragraphs[0].text = "Tác nhân (Actor)"
    set_run_font(r1.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    c1_1.paragraphs[0].text = actor
    set_run_font(c1_1.paragraphs[0].runs[0], "Times New Roman", 12, bold=False)
    
    # Row 2: Mô tả sơ lược
    r2 = tbl.rows[2]
    make_row_cant_split(r2)
    c2_1 = r2.cells[1].merge(r2.cells[2])
    r2.cells[0].width = col_widths[0]
    c2_1.width = Cm(12.0)
    set_cell_background(r2.cells[0], "F1F5F9")
    r2.cells[0].paragraphs[0].text = "Mô tả sơ lược"
    set_run_font(r2.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    c2_1.paragraphs[0].text = desc
    set_run_font(c2_1.paragraphs[0].runs[0], "Times New Roman", 12, bold=False)
    
    # Row 3: Tiền điều kiện (Precondition)
    r3 = tbl.rows[3]
    make_row_cant_split(r3)
    c3_1 = r3.cells[1].merge(r3.cells[2])
    r3.cells[0].width = col_widths[0]
    c3_1.width = Cm(12.0)
    set_cell_background(r3.cells[0], "F1F5F9")
    r3.cells[0].paragraphs[0].text = "Tiền điều kiện"
    set_run_font(r3.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    c3_1.paragraphs[0].text = pre_cond
    set_run_font(c3_1.paragraphs[0].runs[0], "Times New Roman", 12, bold=False)
    
    # Row 4: Hậu điều kiện (Postcondition)
    r4 = tbl.rows[4]
    make_row_cant_split(r4)
    c4_1 = r4.cells[1].merge(r4.cells[2])
    r4.cells[0].width = col_widths[0]
    c4_1.width = Cm(12.0)
    set_cell_background(r4.cells[0], "F1F5F9")
    r4.cells[0].paragraphs[0].text = "Hậu điều kiện"
    set_run_font(r4.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    c4_1.paragraphs[0].text = post_cond
    set_run_font(c4_1.paragraphs[0].runs[0], "Times New Roman", 12, bold=False)
    
    # Row 5: Header Luồng sự kiện chính
    r5 = tbl.rows[5]
    make_row_header(r5)
    make_row_cant_split(r5)
    r5.cells[0].width = col_widths[0]
    r5.cells[1].width = col_widths[1]
    r5.cells[2].width = col_widths[2]
    set_cell_background(r5.cells[0], "E2E8F0")
    set_cell_background(r5.cells[1], "E2E8F0")
    set_cell_background(r5.cells[2], "E2E8F0")
    r5.cells[0].paragraphs[0].text = "Phân đoạn"
    set_run_font(r5.cells[0].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    r5.cells[1].paragraphs[0].text = "Hành động của Tác nhân"
    set_run_font(r5.cells[1].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    r5.cells[2].paragraphs[0].text = "Phản hồi của Hệ thống"
    set_run_font(r5.cells[2].paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
    
    cur_idx = 6
    # Luong su kien chinh (Basic Flow)
    for i, (act_step, sys_step) in enumerate(basic_steps):
        row = tbl.rows[cur_idx]
        make_row_cant_split(row)
        row.cells[0].width = col_widths[0]
        row.cells[1].width = col_widths[1]
        row.cells[2].width = col_widths[2]
        if i == 0:
            row.cells[0].paragraphs[0].text = "Luồng chính\n(Basic Flow)"
            set_run_font(row.cells[0].paragraphs[0].runs[0], "Times New Roman", 11, bold=True, italic=True)
        else:
            row.cells[0].paragraphs[0].text = f"Bước {i+1}"
            set_run_font(row.cells[0].paragraphs[0].runs[0], "Times New Roman", 11, italic=True)
        row.cells[1].paragraphs[0].text = act_step
        set_run_font(row.cells[1].paragraphs[0].runs[0], "Times New Roman", 11, bold=False)
        row.cells[2].paragraphs[0].text = sys_step
        set_run_font(row.cells[2].paragraphs[0].runs[0], "Times New Roman", 11, bold=False)
        cur_idx += 1
        
    # Luong su kien thay the (Alternative Flow)
    for j, (cond, action) in enumerate(alt_steps):
        row = tbl.rows[cur_idx]
        make_row_cant_split(row)
        row.cells[0].width = col_widths[0]
        row.cells[1].width = col_widths[1]
        row.cells[2].width = col_widths[2]
        if j == 0:
            row.cells[0].paragraphs[0].text = "Luồng ngoại lệ\n(Exception)"
            set_run_font(row.cells[0].paragraphs[0].runs[0], "Times New Roman", 11, bold=True, italic=True)
        else:
            row.cells[0].paragraphs[0].text = f"Ngoại lệ {j+1}"
            set_run_font(row.cells[0].paragraphs[0].runs[0], "Times New Roman", 11, italic=True)
        row.cells[1].paragraphs[0].text = cond
        set_run_font(row.cells[1].paragraphs[0].runs[0], "Times New Roman", 11, bold=False)
        row.cells[2].paragraphs[0].text = action
        set_run_font(row.cells[2].paragraphs[0].runs[0], "Times New Roman", 11, bold=False)
        cur_idx += 1

    # Dinh dang tat ca cac cell
    for r in tbl.rows:
        for c in r.cells:
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

add_use_case_spec_table = add_use_case_table

def add_db_schema_table(doc, tbl_id, entity_name, columns_desc):
    """Bang cau truc thuc the co so du lieu tieu chuan."""
    add_table_caption(doc, tbl_id, f"Cấu trúc thực thể Bảng {entity_name}")
    
    tbl = doc.add_table(rows=1 + len(columns_desc), cols=5)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    set_table_borders(tbl, color="475569", sz="6", val="single")
    
    widths = [Cm(1.2), Cm(3.8), Cm(3.0), Cm(2.2), Cm(5.3)]
    
    # Header
    r0 = tbl.rows[0]
    make_row_header(r0)
    make_row_cant_split(r0)
    headers = ["STT", "Tên thuộc tính", "Kiểu dữ liệu", "Khóa / Ràng buộc", "Mô tả nghiệp vụ"]
    for i, h in enumerate(headers):
        c = r0.cells[i]
        c.width = widths[i]
        set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    for idx, col in enumerate(columns_desc):
        row = tbl.rows[idx + 1]
        make_row_cant_split(row)
        for i, val in enumerate(col):
            c = row.cells[i]
            c.width = widths[i]
            c.paragraphs[0].text = str(val)
            align = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            c.paragraphs[0].alignment = align
            set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 1))
            
    for r in tbl.rows:
        for c in r.cells:
            set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

def add_full_width_dotted_line(doc, count=1, space_before=1.0, space_after=1.0, line_spacing=1.15, font_size=11):
    """
    Tao dong cham cham cham (dot leader) thang tap tu le trai sang tan le phai 15.5cm.
    Dung tab stop voi w:leader='dot', KHONG BAO GIO BI XUONG DONG HAY WRAP CHU.
    """
    for _ in range(count):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        p.paragraph_format.left_indent = Cm(0)
        p.paragraph_format.first_line_indent = Cm(0)
        
        pPr = p._p.get_or_add_pPr()
        tabs = OxmlElement('w:tabs')
        tab = OxmlElement('w:tab')
        tab.set(qn('w:val'), 'right')
        tab.set(qn('w:leader'), 'dot')
        tab.set(qn('w:pos'), str(int(15.5 * 567))) # 15.5cm = 8788 dxa
        tabs.append(tab)
        pPr.append(tabs)
        
        run = p.add_run("\t")
        set_run_font(run, "Times New Roman", font_size, bold=False, color_rgb=(100, 116, 139))

def add_toc_line(doc, title, page_no, level=1):
    """Them dong muc luc voi tab leader cham cham (. . . . . . .) chuan dep."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    # Thiet lap le phai de tranh text tran cham vao so trang (chong dinh chu va so)
    p.paragraph_format.right_indent = Cm(1.2)
    
    # Thut le theo cap
    if level == 1:
        p.paragraph_format.left_indent = Cm(0.0)
        bold = True
    elif level == 2:
        p.paragraph_format.left_indent = Cm(0.7)
        bold = False
    else:
        p.paragraph_format.left_indent = Cm(1.4)
        bold = False
        
    # Thiet lap tab stop sat mep phai 15.5cm voi dot leader
    pPr = p._p.get_or_add_pPr()
    tabs = OxmlElement('w:tabs')
    tab = OxmlElement('w:tab')
    tab.set(qn('w:val'), 'right')
    tab.set(qn('w:leader'), 'dot')
    tab.set(qn('w:pos'), str(int(15.5 * 567))) # 15.5cm to dxa
    tabs.append(tab)
    pPr.append(tabs)
    
    r_title = p.add_run(title)
    set_run_font(r_title, "Times New Roman", 12 if level > 1 else 13, bold=bold)
    
    r_tab = p.add_run("\t")
    set_run_font(r_tab, "Times New Roman", 12, bold=False)
    
    r_page = p.add_run(str(page_no))
    set_run_font(r_page, "Times New Roman", 12, bold=bold)

def add_reference_entry(doc, ref_id, citation_text):
    """Them muc Tai lieu tham khao theo chuan Hanging Indent 1.0cm, can trai de tranh gian khoang trang."""
    p = doc.add_paragraph()
    format_paragraph(p, space_before=4, space_after=3, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=-1.0, left_indent=1.0)
    r1 = p.add_run(f"[{ref_id}]\t")
    set_run_font(r1, "Times New Roman", 12, bold=True)
    r2 = p.add_run(citation_text)
    set_run_font(r2, "Times New Roman", 12, bold=False)

def add_page_number_to_run(run):
    """Chen field PAGE tu dong vao run."""
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    run._r.append(fldSimple)

class HelperObj(dict):
    """Ho tro ca truy cap kieu dictionary helper['abc'] va kieu attribute helper.abc."""
    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name)
    def __setattr__(self, name, val):
        self[name] = val

def build_full_document():
    print("=== BAT DAU TAO CUON KHOA LUAN TOT NGHIEP CHUAN IUH ===")
    import thesis_front_matter
    import thesis_chapter_1
    import thesis_chapter_2
    import thesis_chapter_3
    import thesis_chapter_4
    import thesis_chapter_5
    import thesis_references_appendices

    doc = docx.Document()

    # Dinh dang Style Normal
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(13)
    style_normal.font.color.rgb = RGBColor(*COLOR_BLACK)

    # 1. SECTION 1: PHAN DAU (BIA, NHAN XET, MUC LUC, DANH MUC HINH/BANG/VIET TAT)
    section_front = doc.sections[0]
    setup_page_layout(section_front, top_cm=3.0, bottom_cm=3.0, left_cm=3.5, right_cm=2.0)
    # Phan dau khong co Header/Footer
    section_front.header.is_linked_to_previous = False
    section_front.footer.is_linked_to_previous = False

    helpers = HelperObj({
        'LOGO_PATH': LOGO_PATH,
        'set_cell_margins': set_cell_margins,
        'set_cell_vertical_alignment': set_cell_vertical_alignment,
        'set_cell_background': set_cell_background,
        'set_table_borders': set_table_borders,
        'make_row_cant_split': make_row_cant_split,
        'make_row_header': make_row_header,
        'format_paragraph': format_paragraph,
        'set_run_font': set_run_font,
        'add_heading_1': add_heading_1,
        'add_heading_2': add_heading_2,
        'add_heading_3': add_heading_3,
        'add_heading_4': add_heading_4,
        'add_body_p': add_body_p,
        'add_bullet_item': add_bullet_item,
        'add_figure_caption': add_figure_caption,
        'add_table_caption': add_table_caption,
        'add_figure_placeholder': add_figure_placeholder,
        'add_comparison_figure_placeholder': add_comparison_figure_placeholder,
        'add_equation': add_equation,
        'add_custom_table': add_custom_table,
        'add_use_case_table': add_use_case_table,
        'add_use_case_spec_table': add_use_case_spec_table,
        'add_db_schema_table': add_db_schema_table,
        'add_full_width_dotted_line': add_full_width_dotted_line,
        'add_toc_line': add_toc_line,
        'add_reference_entry': add_reference_entry,
        'setup_page_layout': setup_page_layout
    })

    # Nạp Front Matter
    thesis_front_matter.add_front_matter(doc, helpers)

    # 2. SECTION 2: NOI DUNG CHINH (BAT DAU TU CHUONG 1 DEN HET PHU LUC)
    section_body = doc.add_section(docx.enum.section.WD_SECTION.NEW_PAGE)
    setup_page_layout(section_body, top_cm=3.0, bottom_cm=3.0, left_cm=3.5, right_cm=2.0)
    section_body.header.is_linked_to_previous = False
    section_body.footer.is_linked_to_previous = False

    # Thiet lap danh so trang bat dau tu 1
    sectPr = section_body._sectPr
    pgNumType = OxmlElement('w:pgNumType')
    pgNumType.set(qn('w:start'), '1')
    sectPr.append(pgNumType)

    # Thiet lap Header Section 2: Chuan mau theo quy dinh IUH 01/2024
    header = section_body.header
    for p in header.paragraphs:
        p.text = ""
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = Pt(1)

    tbl_h = header.add_table(rows=1, cols=2, width=Cm(15.5))
    tbl_h.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_h.autofit = False
    tbl_h.rows[0].cells[0].width = Cm(8.0)
    tbl_h.rows[0].cells[1].width = Cm(7.5)

    borders_h = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:bottom w:val="double" w:sz="12" w:space="0" w:color="475569"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tbl_h._tbl.tblPr.append(borders_h)

    # Header Trai: KHÓA LUẬN TỐT NGHIỆP (Times New Roman 12, chu thuong/khong dam theo Muc 2.3.2)
    c_h0 = tbl_h.rows[0].cells[0]
    set_cell_margins(c_h0, top=0, bottom=40, left=0, right=20)
    p_h0 = c_h0.paragraphs[0]
    format_paragraph(p_h0, space_before=0, space_after=2, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_h0 = p_h0.add_run("KHÓA LUẬN TỐT NGHIỆP")
    set_run_font(r_h0, "Times New Roman", 12, bold=False, italic=False, color_rgb=(71, 85, 105))

    # Header Phai: GVHD: TS. TRẦN THỊ MINH KHOA
    c_h1 = tbl_h.rows[0].cells[1]
    set_cell_margins(c_h1, top=0, bottom=40, left=20, right=0)
    p_h1 = c_h1.paragraphs[0]
    format_paragraph(p_h1, space_before=0, space_after=2, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_h1 = p_h1.add_run("GVHD: TS. TRẦN THỊ MINH KHOA")
    set_run_font(r_h1, "Times New Roman", 12, bold=False, italic=False, color_rgb=(71, 85, 105))

    # Thiet lap Footer Section 2: Chuan mau theo quy dinh IUH 01/2024
    footer = section_body.footer
    for p in footer.paragraphs:
        p.text = ""
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = Pt(1)

    tbl_f = footer.add_table(rows=1, cols=2, width=Cm(15.5))
    tbl_f.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_f.autofit = False
    tbl_f.rows[0].cells[0].width = Cm(13.2)
    tbl_f.rows[0].cells[1].width = Cm(2.3)

    borders_f = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
            <w:bottom w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tbl_f._tbl.tblPr.append(borders_f)

    # Footer Trai: Ten de tai in dam, chu thuong (Mục 2.3.3)
    c_f0 = tbl_f.rows[0].cells[0]
    set_cell_margins(c_f0, top=40, bottom=0, left=0, right=20)
    p_f0 = c_f0.paragraphs[0]
    format_paragraph(p_f0, space_before=2, space_after=0, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_f0 = p_f0.add_run("Hệ thống tham quan thực tế ảo 360° và số hóa không gian di sản Bảo tàng Lịch sử TP.HCM")
    set_run_font(r_f0, "Times New Roman", 10.5, bold=True, italic=False, color_rgb=(30, 41, 59))

    # Footer Phai: So trang tu dong (12pt chu thuong can phai)
    c_f1 = tbl_f.rows[0].cells[1]
    set_cell_margins(c_f1, top=40, bottom=0, left=20, right=0)
    set_cell_vertical_alignment(c_f1, "center")
    p_f1 = c_f1.paragraphs[0]
    format_paragraph(p_f1, space_before=2, space_after=0, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_f1 = p_f1.add_run()
    set_run_font(r_f1, "Times New Roman", 12, bold=False, italic=False, color_rgb=(30, 41, 59))
    add_page_number_to_run(r_f1)

    # 3. NAP CAC CHUONG NOI DUNG (Moi chuong da co doc.add_page_break() o cuoi)
    print("Dang nap Chuong 1...")
    thesis_chapter_1.add_chapter_1(doc, helpers)

    print("Dang nap Chuong 2...")
    thesis_chapter_2.add_chapter_2(doc, helpers)

    print("Dang nap Chuong 3...")
    thesis_chapter_3.add_chapter_3(doc, helpers)

    print("Dang nap Chuong 4...")
    thesis_chapter_4.add_chapter_4(doc, helpers)

    print("Dang nap Chuong 5...")
    thesis_chapter_5.add_chapter_5(doc, helpers)

    print("Dang nap Tai lieu tham khao & Phu luc...")
    thesis_references_appendices.add_references_and_appendices(doc, helpers)

    # 4. LUU FILE DOCX
    print(f"Dang luu file vao: {DOCX_OUT} ...")
    doc.save(DOCX_OUT)
    print("=== HOAN TAT TAO BAO CAO KHOA LUAN TOT NGHIEP CHUAN IUH! ===")

if __name__ == '__main__':
    build_full_document()

