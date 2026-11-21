# -*- coding: utf-8 -*-
"""
THESIS FRONT MATTER GENERATOR - CHUẨN BÀI MẪU TIẾN TRẦN & QUY ĐỊNH IUH
- Trang bìa Tiếng Việt (chuẩn mẫu Tiến Trần)
- Trang bìa Tiếng Anh (chuẩn mẫu Tiến Trần)
- ABSTRACT (Tiếng Anh, trang 6 theo Tiến Trần)
- TÓM TẮT (Tiếng Việt, trang 7 theo Tiến Trần)
- LỜI CẢM ƠN (trang 8 theo Tiến Trần)
- NHẬN XÉT CỦA GIÁO VIÊN HƯỚNG DẪN (trang 9 theo Tiến Trần: toàn dòng chấm tab leader chuẩn, không wrap)
- NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (trang 10 theo Tiến Trần: tiêu đề chuẩn không có chữ trang 1/2, dòng chấm tab leader)
- NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (trang 11 theo Tiến Trần: tiêu đề chuẩn không có chữ trang 2/2, không có câu hỏi lẻ, dòng chấm tab leader)
- MỤC LỤC (chuẩn tab leader dots)
- DANH MỤC HÌNH ẢNH (chuẩn tab leader dots)
- DANH MỤC BẢNG (chuẩn tab leader dots)
- DANH MỤC CÁC TỪ VIẾT TẮT (bảng tra cứu chuyên nghiệp)
"""

import os
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def add_front_matter(doc, helper):
    """Xây dựng toàn bộ phần đầu báo cáo chuẩn 100% như mẫu Tiến Trần."""
    
    # -------------------------------------------------------------------------
    # 1. TRANG BÌA TIẾNG VIỆT (Trang 4 trong mẫu Tiến Trần - CÓ KHUNG VIỀN XANH)
    # -------------------------------------------------------------------------
    s0 = doc.sections[0]
    helper.setup_page_layout(s0, top_cm=3.0, bottom_cm=3.0, left_cm=3.5, right_cm=2.0)
    
    # Khung viền xanh học thuật đóng quanh bìa tiếng Việt trong Header Section 0
    h0 = s0.header
    h0.is_linked_to_previous = False
    hp0 = h0.paragraphs[0]
    hrun0 = hp0.add_run()
    border_path = os.path.join(os.path.dirname(__file__), "assets", "iuh_cover_border_clean.png")
    if os.path.exists(border_path):
        pic = hrun0.add_picture(border_path, width=Cm(16.2), height=Cm(25.4))
        inline = pic._inline
        drawing = inline.getparent()
        extent = inline.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}extent')
        graphic = inline.find('{http://schemas.openxmlformats.org/drawingml/2006/main}graphic')
        cx = extent.get('cx')
        cy = extent.get('cy')
        
        anchor_xml = f'''
        <wp:anchor {nsdecls('wp')} distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1">
            <wp:simplePos x="0" y="0"/>
            <wp:positionH relativeFrom="page">
                <wp:align>center</wp:align>
            </wp:positionH>
            <wp:positionV relativeFrom="page">
                <wp:align>center</wp:align>
            </wp:positionV>
            <wp:extent cx="{cx}" cy="{cy}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:wrapNone/>
            <wp:docPr id="1001" name="CoverBorder"/>
            <wp:cNvGraphicFramePr/>
        </wp:anchor>
        '''
        anchor = parse_xml(anchor_xml)
        anchor.append(graphic)
        drawing.replace(inline, anchor)

    p_inst = doc.add_paragraph()
    helper.format_paragraph(p_inst, space_before=0, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_inst = p_inst.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG NGHIỆP THÀNH PHỐ HỒ CHÍ MINH\nKHOA CÔNG NGHỆ THÔNG TIN")
    helper.set_run_font(r_inst, "Times New Roman", 14, bold=True)
    
    # Logo IUH
    if os.path.exists(helper.LOGO_PATH):
        p_logo = doc.add_paragraph()
        helper.format_paragraph(p_logo, space_before=16, space_after=18, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_logo.add_run().add_picture(helper.LOGO_PATH, width=Inches(2.3))
    else:
        p_sp = doc.add_paragraph()
        helper.format_paragraph(p_sp, space_before=20, space_after=20, line_spacing=1.0)
        
    p_sv = doc.add_paragraph()
    helper.format_paragraph(p_sv, space_before=14, space_after=18, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_sv = p_sv.add_run("HUỲNH TẤN LỘC\nTRỊNH VĨ THÀNH")
    helper.set_run_font(r_sv, "Times New Roman", 16, bold=True)
    
    p_title = doc.add_paragraph()
    helper.format_paragraph(p_title, space_before=16, space_after=26, line_spacing=1.25, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_title = p_title.add_run("HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360°\nVÀ SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH")
    helper.set_run_font(r_title, "Times New Roman", 18, bold=True)
    
    p_major = doc.add_paragraph()
    helper.format_paragraph(p_major, space_before=14, space_after=20, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_maj = p_major.add_run("Ngành: Công Nghệ Thông Tin")
    helper.set_run_font(r_maj, "Times New Roman", 14, bold=True)
    
    p_gvhd = doc.add_paragraph()
    helper.format_paragraph(p_gvhd, space_before=20, space_after=36, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_gv = p_gvhd.add_run("Giảng viên hướng dẫn: TS. Trần Thị Minh Khoa")
    helper.set_run_font(r_gv, "Times New Roman", 14, bold=True)
    
    p_date = doc.add_paragraph()
    helper.format_paragraph(p_date, space_before=24, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_date = p_date.add_run("THÀNH PHỐ HỒ CHÍ MINH, THÁNG 12 NĂM 2026")
    helper.set_run_font(r_date, "Times New Roman", 12, bold=True)
    
    # Chuyển sang Section 1 cho Trang bìa tiếng Anh và các phần đầu tiếp theo (KHÔNG KHUNG)
    import docx
    s1 = doc.add_section(docx.enum.section.WD_SECTION.NEW_PAGE)
    helper.setup_page_layout(s1, top_cm=3.0, bottom_cm=3.0, left_cm=3.5, right_cm=2.0)
    s1.header.is_linked_to_previous = False
    s1.footer.is_linked_to_previous = False
    for p in s1.header.paragraphs:
        p.text = ""
    for p in s1.footer.paragraphs:
        p.text = ""
    
    # -------------------------------------------------------------------------
    # 2. TRANG BÌA TIẾNG ANH (Trang 5 trong mẫu Tiến Trần - KHÔNG KHUNG VIỀN)
    # -------------------------------------------------------------------------
    p_einst = doc.add_paragraph()
    helper.format_paragraph(p_einst, space_before=0, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_e = p_einst.add_run("MINISTRY OF INDUSTRY AND TRADE\nINDUSTRIAL UNIVERSITY OF HO CHI MINH CITY\nFACULTY OF INFORMATION TECHNOLOGY")
    helper.set_run_font(r_e, "Times New Roman", 14, bold=True)
    
    if os.path.exists(helper.LOGO_PATH):
        p_elogo = doc.add_paragraph()
        helper.format_paragraph(p_elogo, space_before=16, space_after=18, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_elogo.add_run().add_picture(helper.LOGO_PATH, width=Inches(2.3))
    else:
        p_esp = doc.add_paragraph()
        helper.format_paragraph(p_esp, space_before=20, space_after=20, line_spacing=1.0)
        
    p_esv = doc.add_paragraph()
    helper.format_paragraph(p_esv, space_before=14, space_after=18, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_esv = p_esv.add_run("HUYNH TAN LOC\nTRINH VI THANH")
    helper.set_run_font(r_esv, "Times New Roman", 16, bold=True)
    
    p_etitle = doc.add_paragraph()
    helper.format_paragraph(p_etitle, space_before=16, space_after=26, line_spacing=1.25, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_etitle = p_etitle.add_run("360° VIRTUAL REALITY TOUR AND HERITAGE SPACE\nDIGITALIZATION SYSTEM FOR HISTORICAL MUSEUM OF HO CHI MINH CITY")
    helper.set_run_font(r_etitle, "Times New Roman", 18, bold=True)
    
    p_emajor = doc.add_paragraph()
    helper.format_paragraph(p_emajor, space_before=14, space_after=20, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_emaj = p_emajor.add_run("Major: Information Technology")
    helper.set_run_font(r_emaj, "Times New Roman", 14, bold=True)
    
    p_einstruc = doc.add_paragraph()
    helper.format_paragraph(p_einstruc, space_before=20, space_after=36, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_ei = p_einstruc.add_run("Instructor: Ph.D Tran Thi Minh Khoa")
    helper.set_run_font(r_ei, "Times New Roman", 14, bold=True)
    
    p_edate = doc.add_paragraph()
    helper.format_paragraph(p_edate, space_before=24, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_edate = p_edate.add_run("HO CHI MINH CITY, DECEMBER 2026")
    helper.set_run_font(r_edate, "Times New Roman", 12, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 3. ABSTRACT (Trang 6 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_ab_h = helper.add_heading_1(doc, "ABSTRACT")
    p_ab_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    helper.add_body_p(doc, 
        "In the contemporary era of national digital transformation and heritage economics, preserving and promoting cultural and historical values through advanced digital technologies has become an essential imperative. The Ho Chi Minh City Museum of History stands as one of the premier architectural and cultural landmarks in Southern Vietnam, safeguarding more than 40,000 precious historical artifacts ranging from prehistoric eras, ancient Champa and Oc Eo civilizations, to Vietnamese feudal dynasties. Nevertheless, physical space constraints, progressive degradation of tangible artifacts over time, and the rapidly growing public expectation for interactive digital accessibility have exposed significant limitations in traditional museum exhibition methods."
    )
    helper.add_body_p(doc, 
        "To address these critical challenges, the graduation project entitled “Virtual Tour 360° & Heritage Space Digitization for Ho Chi Minh City Museum of History” develops an end-to-end, high-performance web-based heritage platform. The system seamlessly integrates immersive 3D WebGL computer graphics (Three.js), automated computer-vision panorama stitching algorithms, Dijkstra shortest-path floorplan routing connecting 18 exhibition galleries, real-time banking payment integration via VietQR (PayOS), and mobile-first live camera QR ticket validation."
    )
    helper.add_body_p(doc, 
        "Crucially, the empirical foundation of this project is rooted in 4 comprehensive on-site fieldwork campaigns conducted at the museum premises (No. 2 Nguyen Binh Khiem Street, District 1). Spatial imagery across all 18 galleries was processed through cylindrical geometric warping, multi-band Laplacian pyramid blending, and nadir shadow inpainting, achieving seamless 360° x 180° spherical equirectangular environments. Representative national treasures are reconstructed into interactive 3D orbital viewers, supported by multilingual Text-to-Speech audio commentary and an intelligent AI Heritage Assistant."
    )
    helper.add_body_p(doc, 
        "Architecturally, the platform is engineered upon a modular 3-tier paradigm utilizing React 18, Node.js/TypeScript, hybrid PostgreSQL/MongoDB databases, and Redis in-memory caching, fully orchestrated via Docker containers on a cloud VPS infrastructure. Stress testing evaluations conducted with Apache JMeter demonstrate exceptional scalability, maintaining throughput exceeding 240 requests/second with average response latency below 120ms under heavy concurrent workloads. The project establishes an exemplary academic and practical benchmark for cultural heritage preservation and digital tourism in Vietnam."
    )
    
    p_ekw = doc.add_paragraph()
    helper.format_paragraph(p_ekw, space_before=12, space_after=0, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.0)
    r_ekw_title = p_ekw.add_run("Keywords: ")
    helper.set_run_font(r_ekw_title, "Times New Roman", 13, bold=True)
    r_ekw_txt = p_ekw.add_run("Virtual Tour 360°, Heritage Space Digitization, Ho Chi Minh City Museum of History, Three.js WebGL, Dijkstra Algorithm, PayOS VietQR, QR Ticket Scanner.")
    helper.set_run_font(r_ekw_txt, "Times New Roman", 13, bold=False, italic=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 4. TÓM TẮT (Trang 7 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_tt_h = helper.add_heading_1(doc, "TÓM TẮT")
    p_tt_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    helper.add_body_p(doc, 
        "Trong kỷ nguyên chuyển đổi số quốc gia và phát triển kinh tế di sản, việc bảo tồn và phát huy các giá trị văn hóa - lịch sử thông qua công nghệ số đóng vai trò vô cùng cấp thiết. Bảo tàng Lịch sử Thành phố Hồ Chí Minh là một trong những công trình kiến trúc di sản tiêu biểu hàng đầu miền Nam, lưu giữ hơn 40.000 cổ vật và hiện vật quý giá trải dài từ thời kỳ Tiền sơ sử, các nền văn hóa cổ Champa, Óc Eo đến các triều đại phong kiến Việt Nam. Tuy nhiên, trước các thách thức về giới hạn không gian địa lý, nguy cơ xuống cấp vật lý của hiện vật theo thời gian và nhu cầu tiếp cận trải nghiệm số ngày càng cao của công chúng trong và ngoài nước, các phương thức trưng bày tĩnh truyền thống đã bộc lộ nhiều hạn chế."
    )
    helper.add_body_p(doc, 
        "Đề tài “Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử TP. Hồ Chí Minh” được thực hiện nhằm xây dựng một hệ sinh thái web di sản toàn diện, tích hợp sâu công nghệ đồ họa không gian 3D WebGL (Three.js), thị giác máy tính ghép ảnh toàn cảnh Panorama Studio, thuật toán định tuyến Dijkstra liên thông 18 gian phòng trưng bày, phân hệ đặt vé và thanh toán trực tuyến VietQR (PayOS) cùng giải pháp soát vé camera thời gian thực trên thiết bị di động."
    )
    helper.add_body_p(doc, 
        "Đặc biệt, hệ thống được nhóm nghiên cứu trực tiếp triển khai thu thập dữ liệu qua 4 đợt tác nghiệp thực địa nghiêm ngặt tại Bảo tàng Lịch sử TP.HCM (Số 2 Nguyễn Bỉnh Khiêm, Quận 1). Toàn bộ 18 gian phòng trưng bày đã được nắn chỉnh hình học trụ (Cylindrical Warping), ghép mí đa dải tần (Multiband Laplacian Pyramid Blending) và xóa bóng chân máy (Nadir Inpainting) để đạt chuẩn không gian cầu tương tác 360° x 180° với độ sắc nét chân thực. Cùng với đó, các cổ vật quý được số hóa 3D tương tác xoay đa chiều, tích hợp thuyết minh âm thanh đa ngôn ngữ (Text-to-Speech) và Trợ lý ảo AI thông minh, mang đến cho khách tham quan trải nghiệm như đang trực tiếp bước đi trong không gian di sản sống động."
    )
    helper.add_body_p(doc, 
        "Hệ thống được thiết kế theo kiến trúc phân tầng 3-tier hiện đại với công nghệ React 18, Node.js/TypeScript, hệ quản trị cơ sở dữ liệu lai PostgreSQL/MongoDB và bộ nhớ đệm Redis, toàn bộ đóng gói trên hạ tầng máy chủ đám mây Cloud VPS và Docker Container. Kết quả kiểm thử chịu tải thực tế với Apache JMeter cho thấy hệ thống duy trì thông lượng ổn định trên 240 requests/giây và thời gian phản hồi trung bình dưới 120ms khi có hàng trăm người dùng đồng thời, chứng minh tính khả thi, độ tin cậy và tiềm năng ứng dụng thực tiễn to lớn trong công tác chuyển đổi số bảo tàng tại Việt Nam."
    )
    
    p_kw = doc.add_paragraph()
    helper.format_paragraph(p_kw, space_before=12, space_after=0, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY, first_indent=0.0)
    r_kw_title = p_kw.add_run("Từ khóa: ")
    helper.set_run_font(r_kw_title, "Times New Roman", 13, bold=True)
    r_kw_txt = p_kw.add_run("Thực tế ảo 360°, Số hóa di sản, Bảo tàng Lịch sử TP.HCM, Three.js WebGL, Ghép ảnh Panorama, Thuật toán Dijkstra, PayOS VietQR, Soát vé Camera QR.")
    helper.set_run_font(r_kw_txt, "Times New Roman", 13, bold=False, italic=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 5. LỜI CẢM ƠN (Trang 8 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_co_h = helper.add_heading_1(doc, "LỜI CẢM ƠN")
    p_co_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    helper.add_body_p(doc, 
        "Trong suốt quá trình thực hiện đề tài \"Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử Thành phố Hồ Chí Minh\", nhóm chúng em đã nhận được sự hỗ trợ và chỉ dẫn vô cùng quý báu từ quý thầy cô, các đơn vị chuyên môn, bạn bè và gia đình."
    )
    helper.add_body_p(doc, 
        "Trước hết, nhóm chúng em xin gửi lời cảm ơn chân thành và sâu sắc nhất đến Tiến sĩ Trần Thị Minh Khoa, giảng viên hướng dẫn, người đã tận tình định hướng học thuật, đóng góp những ý kiến chuyên môn sâu sắc và luôn đồng hành, động viên chúng em trong suốt quá trình nghiên cứu, khảo sát thực tế và phát triển đề tài."
    )
    helper.add_body_p(doc, 
        "Chúng em cũng xin cảm ơn quý thầy cô trong Khoa Công nghệ Thông tin – Trường Đại học Công nghiệp TP.HCM đã truyền đạt những kiến thức nền tảng và chuyên sâu về kỹ thuật phần mềm, thị giác máy tính và kiến trúc hệ thống, tạo mọi điều kiện thuận lợi nhất để chúng em hoàn thành tốt đề tài này."
    )
    helper.add_body_p(doc, 
        "Nhóm chúng em xin trân trọng gửi lời cảm ơn đến Ban Giám đốc và các cán bộ, nhân viên tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh (Số 2 Nguyễn Bỉnh Khiêm, Quận 1). Sự tạo điều kiện và hỗ trợ nhiệt tình của Ban Quản lý Bảo tàng trong 4 đợt khảo sát thực địa đã giúp chúng em tiếp cận không gian 18 gian phòng trưng bày, thu thập tư liệu lịch sử chính xác và kiểm nghiệm hệ thống trên thực tế."
    )
    helper.add_body_p(doc, 
        "Xin gửi lời cảm ơn sâu sắc đến gia đình và bạn bè – những người đã luôn quan tâm, động viên, chia sẻ và tiếp thêm động lực cho chúng em trong suốt quá trình học tập và thực hiện khóa luận."
    )
    helper.add_body_p(doc, 
        "Mặc dù đã cố gắng hết sức, nhưng do thời gian có hạn và trình độ còn hạn chế, đề tài khó tránh khỏi những thiếu sót nhất định. Nhóm chúng em rất mong nhận được sự góp ý từ quý thầy cô để có thể hoàn thiện và phát triển tốt hơn trong tương lai."
    )
    
    p_sv_sign = doc.add_paragraph()
    helper.format_paragraph(p_sv_sign, space_before=20, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_sign = p_sv_sign.add_run(
        "TP. Hồ Chí Minh, ngày … tháng … năm 2026\n"
        "SINH VIÊN THỰC HIỆN\n\n\n\n"
        "Huỳnh Tấn Lộc         Trịnh Vĩ Thành"
    )
    helper.set_run_font(r_sign, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 5B. LỜI CAM KẾT (Mục 8 theo đúng Bảng 2.1.2 Hướng dẫn KLTN 01/2024)
    # -------------------------------------------------------------------------
    p_ck_h = helper.add_heading_1(doc, "LỜI CAM KẾT")
    p_ck_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    helper.add_body_p(doc,
        "Nhóm sinh viên thực hiện chúng em xin cam đoan rằng:"
    )
    helper.add_body_p(doc,
        "1. Khóa luận tốt nghiệp với đề tài \"Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử Thành phố Hồ Chí Minh\" là công trình nghiên cứu, thiết kế và phát triển độc lập do chính hai sinh viên Huỳnh Tấn Lộc và Trịnh Vĩ Thành thực hiện dưới sự hướng dẫn khoa học của Tiến sĩ Trần Thị Minh Khoa."
    )
    helper.add_body_p(doc,
        "2. Toàn bộ số liệu, thuật toán tính toán (phép chiếu mặt cầu Equirectangular, nắn chỉnh mặt trụ Cylindrical Warping, thuật toán tìm đường Dijkstra, nén ảnh 8K WebP, mô hình hóa 3D), mã nguồn phần mềm và kết quả kiểm thử chịu tải trong báo cáo là trung thực, minh bạch và chưa từng được công bố trong bất kỳ công trình nghiên cứu nào khác để lấy văn bằng hay học vị."
    )
    helper.add_body_p(doc,
        "3. Tất cả các tài liệu tham khảo, nguồn trích dẫn, thư viện mã nguồn mở và nền tảng dịch vụ bên thứ ba (Three.js, Mapbox, PayOS VietQR, OpenSSL) được sử dụng trong khóa luận đều được trích dẫn tường minh theo chuẩn học thuật IEEE và Quy định kiểm tra độ trùng lặp bằng phần mềm Turnitin của Nhà trường (tổng mức trùng lặp dưới 35% và không vượt quá 10% trên mỗi tài liệu phát hiện trùng lặp)."
    )
    helper.add_body_p(doc,
        "Nếu có bất kỳ sự gian lận hoặc vi phạm quy định liêm chính học thuật nào được phát hiện, chúng em xin hoàn toàn chịu mọi hình thức kỷ luật trước Hội đồng đánh giá, Khoa Công nghệ Thông tin và Trường Đại học Công nghiệp TP. Hồ Chí Minh."
    )
    
    p_ck_sign = doc.add_paragraph()
    helper.format_paragraph(p_ck_sign, space_before=20, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_ck_sign = p_ck_sign.add_run(
        "TP. Hồ Chí Minh, ngày … tháng … năm 2026\n"
        "SINH VIÊN THỰC HIỆN\n\n\n\n"
        "Huỳnh Tấn Lộc         Trịnh Vĩ Thành"
    )
    helper.set_run_font(r_ck_sign, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 6. NHẬN XÉT CỦA GIÁO VIÊN HƯỚNG DẪN (Trang 9 theo đúng chuẩn mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_gvhd_h = doc.add_paragraph()
    helper.format_paragraph(p_gvhd_h, space_before=0, space_after=4, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_gvhd_h.paragraph_format.keep_with_next = True
    r_gvhd_h = p_gvhd_h.add_run("NHẬN XÉT CỦA GIÁO VIÊN HƯỚNG DẪN")
    helper.set_run_font(r_gvhd_h, "Times New Roman", 13, bold=True)
    
    # Dòng chấm phủ đều trang (23 dòng chấm chuẩn kích thước compact theo mẫu Tiến Trần)
    helper.add_full_width_dotted_line(doc, count=23, space_before=1.0, space_after=1.0, line_spacing=1.15, font_size=11)
    
    p_gvhd_bot = doc.add_paragraph()
    helper.format_paragraph(p_gvhd_bot, space_before=10, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_ghb = p_gvhd_bot.add_run(
        "Tp. Hồ Chí Minh, ngày... tháng ... năm 2026\n"
        "GIÁO VIÊN HƯỚNG DẪN"
    )
    helper.set_run_font(r_ghb, "Times New Roman", 13, bold=False)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 7. NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (TRANG 1) (Trang 10 theo đúng chuẩn mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_gvpb_h1 = doc.add_paragraph()
    helper.format_paragraph(p_gvpb_h1, space_before=0, space_after=4, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_gvpb_h1.paragraph_format.keep_with_next = True
    r_gvpb_h1 = p_gvpb_h1.add_run("NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN")
    helper.set_run_font(r_gvpb_h1, "Times New Roman", 13, bold=True)
    
    # Dòng chấm toàn chiều rộng (23 dòng phủ kín trang 1 vừa vặn không tràn)
    helper.add_full_width_dotted_line(doc, count=23, space_before=1.0, space_after=1.0, line_spacing=1.15, font_size=11)
    
    p_gvpb_bot1 = doc.add_paragraph()
    helper.format_paragraph(p_gvpb_bot1, space_before=10, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_gpb1 = p_gvpb_bot1.add_run(
        "Tp. Hồ Chí Minh, ngày... tháng ... năm 2026\n"
        "GIÁO VIÊN PHẢN BIỆN"
    )
    helper.set_run_font(r_gpb1, "Times New Roman", 13, bold=False)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 8. NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (TRANG 2) (Trang 11 theo đúng chuẩn mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_gvpb_h2 = doc.add_paragraph()
    helper.format_paragraph(p_gvpb_h2, space_before=0, space_after=4, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    p_gvpb_h2.paragraph_format.keep_with_next = True
    r_gvpb_h2 = p_gvpb_h2.add_run("NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN")
    helper.set_run_font(r_gvpb_h2, "Times New Roman", 13, bold=True)
    
    # Dòng chấm toàn chiều rộng (23 dòng phủ kín trang 2 vừa vặn)
    helper.add_full_width_dotted_line(doc, count=23, space_before=1.0, space_after=1.0, line_spacing=1.15, font_size=11)
    
    p_gvpb_bot2 = doc.add_paragraph()
    helper.format_paragraph(p_gvpb_bot2, space_before=10, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_gpb2 = p_gvpb_bot2.add_run(
        "Tp. Hồ Chí Minh, ngày... tháng ... năm 2026\n"
        "GIÁO VIÊN PHẢN BIỆN"
    )
    helper.set_run_font(r_gpb2, "Times New Roman", 13, bold=False)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 8B. PHIẾU XÁC NHẬN CHỈNH SỬA KHÓA LUẬN TỐT NGHIỆP (Mục 6 trong Bảng 2.1.2 Hướng dẫn KLTN 01/2024)
    # -------------------------------------------------------------------------
    p_xn_hdr = doc.add_paragraph()
    helper.format_paragraph(p_xn_hdr, space_before=0, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_xn_h1 = p_xn_hdr.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG NGHIỆP THÀNH PHỐ HỒ CHÍ MINH\nKHOA CÔNG NGHỆ THÔNG TIN\n\n")
    helper.set_run_font(r_xn_h1, "Times New Roman", 12, bold=True)
    r_xn_h2 = p_xn_hdr.add_run("PHIẾU XÁC NHẬN CHỈNH SỬA KHÓA LUẬN TỐT NGHIỆP")
    helper.set_run_font(r_xn_h2, "Times New Roman", 13, bold=True)
    
    p_info = doc.add_paragraph()
    helper.format_paragraph(p_info, space_before=2, space_after=3, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_info = p_info.add_run(
        "Tên đề tài: Hệ thống tham quan thực tế ảo 360° và số hóa không gian di sản Bảo tàng Lịch sử TP.HCM\n"
        "Ngành: Công nghệ Thông tin                         Chuyên ngành: Kỹ thuật phần mềm\n"
        "Sinh viên 1: Huỳnh Tấn Lộc                         MSSV: 22686171\n"
        "Sinh viên 2: Trịnh Vĩ Thành                        MSSV: 22689411\n"
        "Giảng viên hướng dẫn: TS. Trần Thị Minh Khoa\n"
        "Hội đồng đánh giá: Hội đồng Chuyên môn Khoa Công nghệ Thông tin"
    )
    helper.set_run_font(r_info, "Times New Roman", 11.5, bold=False)
    
    p_tbl_lbl = doc.add_paragraph()
    helper.format_paragraph(p_tbl_lbl, space_before=3, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_tbl_lbl = p_tbl_lbl.add_run("Nội dung và kết quả chỉnh sửa hoàn thiện theo góp ý của Hội đồng:")
    helper.set_run_font(r_tbl_lbl, "Times New Roman", 11.5, bold=True, italic=True)
    
    # Bang noi dung chinh sua - CHUA CHO TRONG de Hoi dong ghi nhan
    xn_headers = ["STT", "Nội dung góp ý của Hội đồng", "Nội dung & Kết quả đã chỉnh sửa hoàn thiện", "Xác nhận"]
    xn_rows = [
        ["1", "\n\n", "\n\n", ""],
        ["2", "\n\n", "\n\n", ""],
        ["3", "\n\n", "\n\n", ""],
        ["4", "\n\n", "\n\n", ""]
    ]
    helper.add_custom_table(doc, xn_headers, xn_rows, [1.2, 5.2, 7.3, 1.8], [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER])
    
    # 3 chu ky xac nhan (Thiet ke thanh lich, vua van trong 1 trang duy nhat)
    p_sign_tbl = doc.add_paragraph()
    helper.format_paragraph(p_sign_tbl, space_before=4, space_after=0, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    
    tbl_sign = doc.add_table(rows=2, cols=3)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sign.autofit = False
    
    borders_none = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="none"/><w:bottom w:val="none"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tbl_sign._tbl.tblPr.append(borders_none)
    
    col_w = Cm(5.1)
    for row in tbl_sign.rows:
        helper.make_row_cant_split(row)
        for c in row.cells:
            c.width = col_w
            
    # Row 0: Chuc danh
    r0_titles = [
        ("GIẢNG VIÊN HƯỚNG DẪN\n(Ký và ghi rõ họ tên)"),
        ("GIẢNG VIÊN PHẢN BIỆN\n(Ký và ghi rõ họ tên)"),
        ("CHỦ TỊCH HỘI ĐỒNG\n(Ký và ghi rõ họ tên)")
    ]
    for idx, title in enumerate(r0_titles):
        cell = tbl_sign.rows[0].cells[idx]
        p = cell.paragraphs[0]
        helper.format_paragraph(p, space_before=0, space_after=0, line_spacing=1.1, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        lines = title.split("\n")
        r_t = p.add_run(lines[0] + "\n")
        helper.set_run_font(r_t, "Times New Roman", 10.5, bold=True)
        r_s = p.add_run(lines[1])
        helper.set_run_font(r_s, "Times New Roman", 9.5, italic=True)
        
    # Row 1: Khoang trong chu ky & Ho ten
    r1_names = [
        "\n\n\nTS. Trần Thị Minh Khoa",
        "\n\n\n.......................................",
        "\n\n\n......................................."
    ]
    for idx, name in enumerate(r1_names):
        cell = tbl_sign.rows[1].cells[idx]
        p = cell.paragraphs[0]
        helper.format_paragraph(p, space_before=0, space_after=0, line_spacing=1.1, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        r = p.add_run(name)
        helper.set_run_font(r, "Times New Roman", 10.5, bold=True)
        
    doc.add_page_break()
    
    # 9. MỤC LỤC (Trang 12 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_toc_h = helper.add_heading_1(doc, "MỤC LỤC")
    p_toc_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    toc_items = [
        ("CHƯƠNG 1: TỔNG QUAN", 1, 1),
        ("1.1. Giới thiệu đề tài", 1, 2),
        ("1.1.1. Bối cảnh và lý do thực hiện đề tài", 1, 3),
        ("1.1.2. Mục tiêu nghiên cứu và phát triển", 2, 3),
        ("1.1.3. Phạm vi giới hạn của đề tài", 3, 3),
        ("1.1.4. Ý nghĩa khoa học và thực tiễn", 4, 3),
        ("1.2. Đối tượng và phương pháp nghiên cứu", 5, 2),
        ("1.2.1. Đối tượng nghiên cứu", 5, 3),
        ("1.2.2. Phương pháp nghiên cứu và 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM", 6, 3),
        ("1.3. Khảo sát và phân tích yêu cầu người dùng", 7, 2),
        ("1.3.1. Đối tượng người dùng mục tiêu", 7, 3),
        ("1.3.2. Yêu cầu và kỳ vọng của khách tham quan và bảo tàng", 8, 3),
        ("1.4. Công nghệ và công cụ sử dụng", 9, 2),
        ("1.5. Yêu cầu chức năng của hệ thống", 11, 2),
        ("1.6. Yêu cầu phi chức năng của hệ thống", 12, 2),
        
        ("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ NỀN TẢNG", 13, 1),
        ("2.1. Cơ sở lý thuyết thị giác máy tính và không gian 360°", 13, 2),
        ("2.1.1. Khái niệm ảnh Panorama toàn cảnh và hệ tọa độ cầu Equirectangular", 13, 3),
        ("2.1.2. Phép chiếu trụ (Cylindrical Projection & Warping)", 15, 3),
        ("2.1.3. Thuật toán trích xuất đặc trưng điểm SIFT (Scale-Invariant Feature Transform)", 16, 3),
        ("2.1.4. Khớp đặc trưng và loại bỏ nhiễu ngoại lai bằng RANSAC", 18, 3),
        ("2.1.5. Kỹ thuật cắt mí tối ưu (Seam Cutting) và hòa trộn đa dải tần", 20, 3),
        ("2.1.6. Công nghệ hiển thị không gian cầu 360° với WebGL và Three.js", 22, 3),
        ("2.1.7. Thuật toán tìm đường đi ngắn nhất Dijkstra ứng dụng định tuyến bảo tàng", 24, 3),
        ("2.1.8. Kỹ thuật tái tạo và hiển thị mô hình cổ vật 3D", 25, 3),
        ("2.2. Công nghệ và nền tảng phát triển hệ thống", 27, 2),
        ("2.2.1. Phân hệ Backend và dịch vụ nền tảng", 27, 3),
        ("2.2.2. Phân hệ Frontend và trải nghiệm người dùng", 31, 3),
        ("2.2.3. Tích hợp thanh toán trực tuyến VietQR qua cổng PayOS", 34, 3),
        ("2.2.4. Hạ tầng máy chủ và ảo hóa Docker", 35, 3),
        ("2.2.5. Nền tảng quan sát và giám sát hệ thống thời gian thực (Grafana & Prometheus)", 37, 3),
        ("2.2.6. Công nghệ dịch thuật ngữ cảnh di sản và xử lý ngôn ngữ tự nhiên đa ngôn ngữ", 38, 3),
        ("2.2.7. Công nghệ tổng hợp giọng nói Text-to-Speech và Cơ chế lưu trữ đệm âm thanh", 39, 3),
        
        ("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", 41, 1),
        ("3.1. Tổng hợp yêu cầu hệ thống", 38, 2),
        ("3.1.1. Bảng ma trận yêu cầu chức năng và phân quyền người dùng", 38, 3),
        ("3.1.2. Yêu cầu phi chức năng và tiêu chí kỹ thuật", 41, 3),
        ("3.2. Thiết kế kiến trúc tổng thể hệ thống", 43, 2),
        ("3.2.1. Kiến trúc phân tầng (Multi-tier Architecture) và luồng dữ liệu", 44, 3),
        ("3.2.2. Thiết kế Module dịch vụ Backend", 46, 3),
        ("3.2.3. Thiết kế kiến trúc điều hướng 3D Three.js và xử lý ảnh Panorama Client-side", 47, 3),
        ("3.3. Thiết kế các ca sử dụng (Use Case Analysis & Design)", 48, 2),
        ("3.3.1. Sơ đồ Use Case tổng quát toàn hệ thống", 48, 3),
        ("3.3.2. Đặc tả chi tiết các Use Case cốt lõi", 49, 3),
        ("3.4. Thiết kế các luồng xử lý và hoạt động hệ thống (Activity & Sequence Diagrams)", 55, 2),
        ("3.4.1. Luồng xử lý tạo không gian 360° và ghép ảnh Panorama Studio", 55, 3),
        ("3.4.2. Luồng xử lý tái tạo cổ vật 3D với 2 động cơ và cơ chế Fallback", 57, 3),
        ("3.4.3. Luồng định tuyến Dijkstra dẫn đường qua 18 phòng trưng bày", 59, 3),
        ("3.4.4. Luồng giao dịch thanh toán VietQR PayOS và xác thực vé QR thời gian thực", 61, 3),
        ("3.5. Thiết kế cơ sở dữ liệu (Database Design)", 63, 2),
        ("3.5.1. Mô hình quan hệ thực thể (ERD)", 63, 3),
        ("3.5.2. Thiết kế chi tiết các bảng CSDL quan hệ PostgreSQL", 65, 3),
        ("3.5.3. Thiết kế các bộ sưu tập CSDL phi quan hệ MongoDB", 69, 3),
        ("3.5.4. Chiến lược toàn vẹn dữ liệu, chỉ mục (Indexing) và sao lưu", 71, 3),
        
        ("CHƯƠNG 4: TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG", 72, 1),
        ("4.1. Quy trình triển khai và tích hợp hệ thống (System Deployment & CI/CD Pipeline)", 72, 2),
        ("4.1.1. Kiến trúc hạ tầng máy chủ và điều phối container (Docker Compose & Nginx)", 72, 3),
        ("4.1.2. Đường ống tự động hóa kiểm thử và triển khai liên tục CI/CD (GitHub Actions)", 74, 3),
        ("4.1.3. Triển khai phân hệ Backend và Kiến trúc CSDL lai (PostgreSQL 16 & MongoDB 7.0)", 75, 3),
        ("4.1.4. Triển khai phân hệ Frontend và Tối ưu hóa WebGL Three.js", 76, 3),
        ("4.1.5. Triển khai tích hợp các dịch vụ bên ngoài (PayOS, Trellis, R2, Google TTS)", 77, 3),
        ("4.2. Kết quả triển khai các phân hệ chức năng", 78, 2),
        ("4.2.1. Phân hệ tạo không gian toàn cảnh 360° với 4 nguồn ảnh đầu vào", 78, 3),
        ("4.2.2. Phân hệ tái tạo cổ vật 3D với 2 động cơ (Local CPU vs Cloud AI TRELLIS)", 80, 3),
        ("4.2.3. Hiện thực thuật toán Dijkstra định tuyến liên thông 18 phòng trưng bày", 81, 3),
        ("4.2.4. Hiện thực phân hệ thanh toán vé VietQR và Soát vé camera thời gian thực", 82, 3),
        ("4.2.5. Phân hệ Quản trị hệ thống, Nhận diện thương hiệu Đa bảo tàng và Vận hành", 83, 3),
        ("4.2.6. Tập hợp các giao diện website thực tế (Khách tham quan, Quản trị CMS, Studio)", 84, 3),
        ("4.2.7. Phân hệ Báo cáo Thống kê nghiệp vụ và Giám sát vận hành hệ thống qua Grafana", 95, 3),
        ("4.2.8. Hiện thực Phân hệ Dịch thuật Đa ngôn ngữ Độc lập cho Không gian 360° và Cổ vật", 96, 3),
        ("4.2.9. Hiện thực Phân hệ Thuyết minh Giọng đọc Audio và Cơ chế Lưu trữ Đệm mượt mà", 97, 3),
        ("4.2.10. Tối ưu hóa Giao diện Người dùng và Thiết kế Thích ứng (Responsive Mobile First)", 98, 3),
        ("4.3. Đánh giá hiệu suất hệ thống (Performance Evaluation & Benchmarking)", 99, 2),
        ("4.3.1. Mục tiêu và tiêu chí đánh giá hiệu năng", 96, 3),
        ("4.3.2. Công cụ và phương pháp thử nghiệm tải (Apache JMeter, Google Lighthouse)", 96, 3),
        ("4.3.3. Bảng số liệu và phân tích kết quả thử nghiệm hiệu năng", 97, 3),
        ("4.3.4. Đánh giá chỉ số Web Vitals và giải pháp tối ưu", 99, 3),
        
        ("CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", 101, 1),
        ("5.1. Đánh giá kết quả và so sánh với các hệ thống hiện hữu", 101, 2),
        ("5.1.1. Mức độ hoàn thành các mục tiêu đề ra", 101, 3),
        ("5.1.2. Bảng so sánh đối sánh tính năng với các hệ thống bảo tàng ảo tiêu biểu", 102, 3),
        ("5.2. Đóng góp của đề tài", 103, 2),
        ("5.3. Hạn chế của đề tài", 104, 2),
        ("5.4. Hướng phát triển trong tương lai", 104, 2),
        
        ("TÀI LIỆU THAM KHẢO", 106, 1),
        ("PHỤ LỤC", 108, 1),
        ("Phụ lục A: Sơ đồ mặt bằng liên thông 18 gian phòng trưng bày", 108, 2),
        ("Phụ lục B: Kế hoạch thực hiện khóa luận tốt nghiệp", 109, 2),
        ("Phụ lục C: Nhật ký 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM", 110, 2),
        ("Phụ lục D: Bảng phân công nhiệm vụ và đánh giá đóng góp thành viên", 112, 2),
    ]
    
    for title, pg, lvl in toc_items:
        helper.add_toc_line(doc, title, pg, level=lvl)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 10. DANH MỤC HÌNH ẢNH (Trang 15 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_fig_h = helper.add_heading_1(doc, "DANH MỤC HÌNH ẢNH")
    p_fig_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    figures_list = [
        ("Hình 1.1 Sơ đồ tư duy tổng quan kiến trúc và các phân hệ hệ thống Bảo tàng 360°", 1),
        ("Hình 1.2 Không gian kiến trúc thực địa tại Bảo tàng Lịch sử TP. Hồ Chí Minh", 6),
        ("Hình 1.3 Sơ đồ quy trình 4 đợt khảo sát và thu thập dữ liệu di sản tại bảo tàng", 7),
        ("Hình 2.1 Mô hình hệ tọa độ cầu Equirectangular (360° x 180°) và hệ tọa độ ảnh phẳng", 14),
        ("Hình 2.2 Quy trình nắn chỉnh biến dạng hình học trụ (Cylindrical Warping) cho ảnh góc rộng", 16),
        ("Hình 2.3 Không gian tỷ lệ sai phân Gauss (Difference of Gaussians - DoG) trong thuật toán SIFT", 17),
        ("Hình 2.4 Khớp cặp điểm đặc trưng SIFT và loại bỏ nhiễu ngoại lai bằng RANSAC", 19),
        ("Hình 2.5 Quy trình tối ưu đường ghép mí (Seam Cutting) và hòa trộn đa dải tần", 21),
        ("Hình 2.6 Nguyên lý ánh xạ texture Panorama lên hình cầu 3D trong không gian WebGL/Three.js", 23),
        ("Hình 2.7 Sơ đồ nguyên lý giải thuật Dijkstra tìm đường đi ngắn nhất trên đồ thị liên thông", 24),
        ("Hình 2.8 Quy trình tái tạo mô hình cổ vật 3D từ chuỗi ảnh chụp đa góc", 26),
        ("Hình 2.9 Mô hình kiến trúc phân tầng hệ thống (3-Tier Layered Architecture)", 28),
        ("Hình 2.10 Mô hình xác thực phân quyền người dùng bằng JSON Web Token (JWT)", 30),
        ("Hình 2.11 Quy trình sinh mã và xác thực thanh toán VietQR qua cổng PayOS", 32),
        ("Hình 2.12 Quy trình quét và kiểm tra mã vé QR thời gian thực bằng camera HTML5-QRCode", 33),
        ("Hình 2.13 Sơ đồ kiến trúc ảo hóa và điều phối container với Docker Compose & Nginx", 36),
        ("Hình 2.14 Sơ đồ kiến trúc thu thập và hiển thị dữ liệu giám sát hệ thống với Grafana & Prometheus", 37),
        ("Hình 3.1 Sơ đồ ca sử dụng (Use Case Diagram) tổng quát của toàn hệ thống", 48),
        ("Hình 3.2 Sơ đồ hoạt động (Activity Diagram) quy trình tạo không gian 360° Panorama Studio", 56),
        ("Hình 3.3 Sơ đồ tuần tự (Sequence Diagram) quy trình tái tạo mô hình 3D từ ảnh đa góc", 58),
        ("Hình 3.4 Sơ đồ tuần tự (Sequence Diagram) đặt vé trực tuyến VietQR và xác thực vào cổng", 61),
        ("Hình 3.5 Sơ đồ quan hệ thực thể (Entity Relationship Diagram - ERD) cơ sở dữ liệu hệ thống", 62),
        ("Hình 3.6 Sơ đồ hoạt động quy trình đặt vé trực tuyến VietQR qua cổng PayOS", 62),
        ("Hình 3.7 Sơ đồ hoạt động quy trình quét và kiểm tra mã vé QR thời gian thực tại cổng", 63),
        ("Hình 3.8 Sơ đồ tuần tự quy trình tương tác không gian 360° và chuyển phòng qua Hotspot", 63),
        ("Hình 3.9 Sơ đồ tuần tự quy trình giám sát hệ thống và nhúng Dashboard Grafana vào cổng Quản trị", 64),
        ("Hình 3.10 Sơ đồ hoạt động quy trình dịch thuật và tải nội dung bản địa hóa cục bộ cho không gian 360° và cổ vật", 65),
        ("Hình 3.11 Sơ đồ hoạt động quy trình sinh, lưu trữ đệm băm (Hash Storage) và phát trực tuyến giọng đọc thuyết minh Audio", 66),
        ("Hình 3.12 Sơ đồ hoạt động quy trình tổng hợp số liệu và kết xuất báo cáo Excel đa bảng tính", 67),
        ("Hình 3.13 Sơ đồ hoạt động quy trình quản trị mã QR trưng bày và quét tương tác Phygital tại bảo tàng", 68),
        ("Hình 4.1 Sơ đồ khối quy trình tự động hóa kiểm thử và triển khai liên tục CI/CD qua GitHub Actions", 73),
        ("Hình 4.2 Giao diện lịch sử thực thi đường ống CI/CD GitHub Actions (Workflows Execution History)", 74),
        ("Hình 4.3 Sơ đồ khối quy trình xử lý không gian toàn cảnh 360° từ 4 nguồn ảnh đầu vào", 79),
        ("Hình 4.4 Giao diện công cụ tạo không gian căn phòng với 4 phương thức nạp ảnh đầu vào", 79),
        ("Hình 4.5 Sơ đồ khối quy trình tái tạo cổ vật 3D với 2 động cơ và cơ chế chuyển đổi dự phòng tự động", 80),
        ("Hình 4.6 So sánh trực quan kết quả tái tạo hiện vật 3D thực tế giữa Động cơ Local CPU và Cloud AI TRELLIS", 81),
        ("Hình 4.7 Sơ đồ khối giải thuật Dijkstra tìm lộ trình di chuyển tối ưu giữa 18 phòng bảo tàng", 82),
        ("Hình 4.8 Sơ đồ khối quy trình thanh toán vé tham quan VietQR và soát vé tại cổng bảo tàng", 83),
        ("Hình 4.9 Giao diện Trang chủ - Banner Hero và Nhận diện di sản Bảo tàng Lịch sử", 84),
        ("Hình 4.10 Giao diện Giới thiệu không gian di sản và tổng quan 18 phòng trưng bày", 85),
        ("Hình 4.11 Giao diện Không gian Tour 360° tương tác toàn cảnh độ phân giải cao", 86),
        ("Hình 4.12 Giao diện Điểm nối chuyển cảnh (Hotspot) và bảng thông tin tương tác", 87),
        ("Hình 4.13 Giao diện Sơ đồ mặt bằng Mini-map và tính năng tìm đường liên thông Dijkstra", 88),
        ("Hình 4.14 Giao diện Thuyết minh âm thanh đa ngôn ngữ (Text-to-Speech Audio Guide)", 89),
        ("Hình 4.15 Giao diện Chiêm ngưỡng cổ vật 3D tương tác xoay đa chiều", 90),
        ("Hình 4.16 Giao diện Trợ lý Di sản Ảo AI tư vấn thông tin và giải đáp lịch sử", 90),
        ("Hình 4.17 Giao diện Đặt vé tham quan trực tuyến và chọn loại vé", 91),
        ("Hình 4.18 Giao diện Thanh toán VietQR động liên kết ngân hàng qua PayOS", 91),
        ("Hình 4.19 Giao diện Vé điện tử với mã QR bảo mật AES-256", 92),
        ("Hình 4.20a Giao diện Quét mã QR soát vé điện tử tại cổng dành cho nhân viên bảo tàng", 92),
        ("Hình 4.20b Giao diện Hộp thoại Quét mã QR Trưng bày khám phá Hiện vật 3D và Phòng 360° trên điện thoại", 93),
        ("Hình 4.21 Giao diện Bảng điều khiển Quản trị viên (Admin Dashboard)", 93),
        ("Hình 4.22 Giao diện Quản lý danh mục 18 gian phòng trưng bày 360°", 94),
        ("Hình 4.23 Giao diện Cấu hình tọa độ Hotspot và thiết lập liên kết phòng", 94),
        ("Hình 4.24 Giao diện Quản lý kho tư liệu cổ vật và mô hình 3D", 95),
        ("Hình 4.25 Giao diện Quản lý vé tham quan và lịch sử giao dịch PayOS", 95),
        ("Hình 4.26 Giao diện Quản lý người dùng và phân quyền quản trị", 96),
        ("Hình 4.27 Giao diện Quản lý Nhận diện thương hiệu & Đa Bảo Tàng CMS", 96),
        ("Hình 4.28 Giao diện Vận hành và Điều khiển chế độ bảo trì hệ thống", 97),
        ("Hình 4.29 Giao diện Quản trị Đa ngôn ngữ và Cấu hình giọng đọc Voice AI", 97),
        ("Hình 4.30 Giao diện Công cụ Panorama Studio - Nắn chỉnh trụ và ghép mí đa dải tần", 98),
        ("Hình 4.31 Giao diện Bảng điều khiển Báo cáo & Thống kê Nghiệp vụ Di sản & Doanh thu Vé tích hợp Grafana", 98),
        ("Hình 4.32 Giao diện Bảng điều khiển Giám sát Hạ tầng VPS và Docker Container trên Grafana", 99),
        ("Hình 4.33 Giao diện Tùy chọn ngôn ngữ thuyết minh trong Không gian Tour 360° và bảng thông tin cổ vật bản địa hóa", 99),
        ("Hình 4.34 Giao diện Quản trị thuyết minh âm thanh và cấu hình sinh giọng đọc AI tự động", 100),
        ("Hình 4.35 Giao diện Trình phát thuyết minh âm thanh nổi trên không gian Tour 360°", 100),
        ("Hình 4.36 Giao diện Drawer lọc thời kỳ và danh sách hiện vật dạng Bottom Sheet tối ưu cho thiết bị di động", 101),
        ("Hình 4.37 Biểu đồ thời gian phản hồi trung bình (Response Time) theo số lượng users", 100),
        ("Hình 4.38 Biểu đồ thông lượng hệ thống (Throughput - Requests/sec) kiểm thử bằng JMeter", 100),
        ("Hình 4.39 Biểu đồ tỷ lệ lỗi (Error Rate) khi tăng tải từ 50 đến 1000 người dùng đồng thời", 101),
        ("Hình 4.40 Kết quả đánh giá chỉ số hiệu năng và Web Vitals bằng Google Lighthouse", 102)
    ]
    
    for title, pg in figures_list:
        helper.add_toc_line(doc, title, pg, level=1)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 11. DANH MỤC BẢNG (Trang 19 trong mẫu Tiến Trần)
    # -------------------------------------------------------------------------
    p_tbl_h = helper.add_heading_1(doc, "DANH MỤC BẢNG")
    p_tbl_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    tables_list = [
        ("Bảng 1.1 Bảng phân tích các đối tượng người dùng mục tiêu và kỳ vọng chức năng", 9),
        ("Bảng 1.2 Bảng tổng hợp các yêu cầu chức năng nghiệp vụ của hệ thống", 11),
        ("Bảng 1.3 Bảng tiêu chuẩn các yêu cầu phi chức năng của hệ thống", 12),
        ("Bảng 2.1 Ma trận đánh giá so sánh các giải pháp toàn cảnh 360°", 23),
        ("Bảng 2.2 Bảng đối sánh kỹ thuật giữa 2 động cơ tái tạo cổ vật 3D", 27),
        ("Bảng 3.1 Ma trận phân quyền chức năng hệ thống theo vai trò người dùng", 38),
        ("Bảng 3.2 Bảng đặc tả Use Case UC-01: Tham quan không gian 360° và tương tác Hotspot", 49),
        ("Bảng 3.3 Bảng đặc tả Use Case UC-02: Tương tác mô hình 3D và nghe thuyết minh Voice AI", 50),
        ("Bảng 3.4 Bảng đặc tả Use Case UC-03: Đặt vé tham quan trực tuyến và nhận vé điện tử VietQR", 50),
        ("Bảng 3.5 Bảng đặc tả Use Case UC-04: Soát vé camera và kiểm tra tính hợp lệ của mã vé", 51),
        ("Bảng 3.6 Bảng đặc tả Use Case UC-05: Tái tạo cổ vật 3D với 2 động cơ và cơ chế chuyển đổi dự phòng", 52),
        ("Bảng 3.7 Bảng đặc tả Use Case UC-06: Ghép ảnh toàn cảnh Panorama Studio từ 4 nguồn ảnh đầu vào", 53),
        ("Bảng 3.8 Bảng đặc tả Use Case UC-07: Định tuyến Dijkstra dẫn đường liên thông 18 gian phòng", 53),
        ("Bảng 3.9 Bảng đặc tả Use Case UC-08: Quản trị Hệ thống, Đa ngôn ngữ và Nhận diện CMS", 54),
        ("Bảng 3.10 Danh mục các bảng dữ liệu trong CSDL quan hệ PostgreSQL", 64),
        ("Bảng 3.11 Cấu trúc bảng `users` (Quản lý tài khoản và phân quyền)", 65),
        ("Bảng 3.12 Cấu trúc bảng `rooms` (Danh mục các gian phòng trưng bày)", 66),
        ("Bảng 3.13 Cấu trúc bảng `artifacts` (Kho lưu trữ cổ vật và mô hình 3D)", 67),
        ("Bảng 3.14 Cấu trúc bảng `tickets` (Quản lý vé tham quan và mã QR bảo mật)", 68),
        ("Bảng 3.15 Cấu trúc bảng `system_settings` (Cấu hình thương hiệu và nhận diện CMS)", 68),
        ("Bảng 3.16 Cấu trúc bảng `access_logs` (Nhật ký truy cập và vận hành hệ thống)", 69),
        ("Bảng 3.17 Cấu trúc bộ sưu tập `exhibition_360_nodes` (Dữ liệu không gian toàn cảnh MongoDB)", 70),
        ("Bảng 3.18 Cấu trúc bộ sưu tập `hotspot_interactions` (Tọa độ và dữ liệu tương tác Hotspot 3D)", 71),
        ("Bảng 4.1 Thông số cấu hình tài nguyên máy chủ ảo hóa đám mây Cloud VPS", 72),
        ("Bảng 4.2 Danh mục các container và cổng kết nối dịch vụ trong hệ thống", 73),
        ("Bảng 4.3 Kết quả thực nghiệm đối sánh chuyên sâu giữa 2 động cơ tái tạo cổ vật 3D", 81),
        ("Bảng 4.4 Ma trận khoảng cách cự ly di chuyển thực tế giữa 18 phòng bảo tàng (mét)", 82),
        ("Bảng 4.5 Kết quả kiểm thử tải hệ thống bằng Apache JMeter với kịch bản tăng dần từ 50 đến 1000 users", 97),
        ("Bảng 4.6 Bảng điểm đánh giá chỉ số hiệu năng và Web Vitals bằng Google Lighthouse", 100),
        ("Bảng 5.1 Bảng tổng kết mức độ hoàn thành các mục tiêu nghiên cứu và phát triển của đề tài", 102),
        ("Bảng 5.2 Bảng so sánh đối sánh tính năng toàn diện giữa Hệ thống đề tài và các hệ thống bảo tàng ảo tiêu biểu", 103)
    ]
    
    for title, pg in tables_list:
        helper.add_toc_line(doc, title, pg, level=1)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 12. DANH MỤC CÁC TỪ VIẾT TẮT
    # -------------------------------------------------------------------------
    p_abbr_h = helper.add_heading_1(doc, "DANH MỤC CÁC TỪ VIẾT TẮT")
    p_abbr_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    abbr_headers = ["STT", "Từ viết tắt", "Cụm từ đầy đủ (Tiếng Anh / Tiếng Việt)"]
    abbr_widths = [1.2, 3.2, 11.1]
    abbr_alignments = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    
    abbr_data = [
        ["1", "2D", "Two-Dimensional (Không gian hai chiều)"],
        ["2", "3D", "Three-Dimensional (Không gian ba chiều)"],
        ["3", "3DGS", "3D Gaussian Splatting (Kỹ thuật kết xuất trường quang học bằng đám mây Gaussian)"],
        ["4", "ACID", "Atomicity, Consistency, Isolation, Durability (Thuộc tính giao dịch CSDL tin cậy)"],
        ["5", "AES", "Advanced Encryption Standard (Chuẩn mã hóa nâng cao)"],
        ["6", "AI", "Artificial Intelligence (Trí tuệ nhân tạo)"],
        ["7", "API", "Application Programming Interface (Giao diện lập trình ứng dụng)"],
        ["8", "AR", "Augmented Reality (Thực tế tăng cường)"],
        ["9", "CMS", "Content Management System (Hệ thống quản trị nội dung)"],
        ["10", "CPU", "Central Processing Unit (Bộ vi xử lý trung tâm)"],
        ["11", "CSS", "Cascading Style Sheets (Ngôn ngữ định dạng trang web)"],
        ["12", "DoG", "Difference of Gaussians (Sai phân của các hàm Gauss)"],
        ["13", "DOM", "Document Object Model (Mô hình đối tượng tài liệu)"],
        ["14", "ERD", "Entity Relationship Diagram (Sơ đồ quan hệ thực thể)"],
        ["15", "FOV", "Field of View (Góc nhìn trường quan sát)"],
        ["16", "FPS", "Frames Per Second (Số khung hình hiển thị trên mỗi giây)"],
        ["17", "GPU", "Graphics Processing Unit (Bộ xử lý đồ họa chuyên dụng)"],
        ["18", "HMAC", "Hash-based Message Authentication Code (Mã xác thực thông điệp dựa trên hàm băm)"],
        ["19", "HTML", "HyperText Markup Language (Ngôn ngữ đánh dấu siêu văn bản)"],
        ["20", "HTTP/HTTPS", "HyperText Transfer Protocol (Secure) (Giao thức truyền tải siêu văn bản bảo mật)"],
        ["21", "IUH", "Industrial University of Ho Chi Minh City (Trường ĐH Công nghiệp TP.HCM)"],
        ["22", "JSON", "JavaScript Object Notation (Định dạng trao đổi dữ liệu gọn nhẹ)"],
        ["23", "JWT", "JSON Web Token (Phương tiện xác thực an toàn không lưu trạng thái)"],
        ["24", "LLM", "Large Language Model (Mô hình ngôn ngữ lớn)"],
        ["25", "LTS", "Long Term Support (Phiên bản hỗ trợ dài hạn)"],
        ["26", "MVC", "Model - View - Controller (Mô hình kiến trúc phần mềm)"],
        ["27", "NeRF", "Neural Radiance Fields (Trường phát xạ thần kinh nhân tạo)"],
        ["28", "NoSQL", "Not Only SQL (Cơ sở dữ liệu phi quan hệ)"],
        ["29", "NPM", "Node Package Manager (Trình quản lý gói cho môi trường Node.js)"],
        ["30", "ORM", "Object-Relational Mapping (Kỹ thuật ánh xạ đối tượng quan hệ)"],
        ["31", "OTP", "One-Time Password (Mật khẩu xác thực sử dụng một lần)"],
        ["32", "PBR", "Physically Based Rendering (Kết xuất đồ họa dựa trên vật lý quang học)"],
        ["33", "QR Code", "Quick Response Code (Mã phản hồi nhanh 2 chiều)"],
        ["34", "RAM", "Random Access Memory (Bộ nhớ truy xuất ngẫu nhiên)"],
        ["35", "RANSAC", "Random Sample Consensus (Thuật toán đồng thuận mẫu ngẫu nhiên)"],
        ["36", "RESTful", "Representational State Transfer (Kiểu kiến trúc thiết kế dịch vụ mạng)"],
        ["37", "SIFT", "Scale-Invariant Feature Transform (Biến đổi đặc trưng bất biến theo tỷ lệ)"],
        ["38", "SLAT", "Structured 3D Latents (Biến tiềm ẩn có cấu trúc cho mô hình sinh 3D)"],
        ["39", "SPA", "Single Page Application (Ứng dụng web đơn trang)"],
        ["40", "SSL/TLS", "Secure Sockets Layer / Transport Layer Security (Giao thức bảo mật truyền thông)"],
        ["41", "TRELLIS", "Mô hình sinh hình học 3D đa năng từ ảnh 2D (Microsoft Research & Tsinghua)"],
        ["42", "TTS", "Text-to-Speech (Chuyển đổi văn bản thành giọng nói nhân tạo)"],
        ["43", "UI/UX", "User Interface / User Experience (Giao diện người dùng / Trải nghiệm người dùng)"],
        ["44", "URI/URL", "Uniform Resource Identifier / Locator (Định danh / Địa chỉ tài nguyên thống nhất)"],
        ["45", "VPS", "Virtual Private Server (Máy chủ riêng ảo đám mây)"],
        ["46", "VR", "Virtual Reality (Thực tế ảo)"],
        ["47", "WebGL", "Web Graphics Library (Thư viện đồ họa 3D trên trình duyệt web)"],
        ["48", "WebP", "Định dạng hình ảnh hiện đại tối ưu nén dữ liệu cho web của Google"],
        ["49", "WebXR", "Web Extended Reality (API mở rộng thực tế ảo và tăng cường trên web)"]
    ]
    
    helper.add_custom_table(doc, abbr_headers, abbr_data, abbr_widths, abbr_alignments, table_caption=None)
    
    print("Front matter added successfully.")
