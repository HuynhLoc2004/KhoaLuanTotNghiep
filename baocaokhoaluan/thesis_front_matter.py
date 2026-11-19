# -*- coding: utf-8 -*-
"""
THESIS FRONT MATTER GENERATOR
Trang bia tieng Viet, Trang bia tieng Anh, Tom tat, Abstract, Loi cam on,
Phieu GVHD, Phieu GVPB (2 trang), Muc luc, Danh muc hinh, Danh muc bang, Danh muc tu viet tat.
"""

import os
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def add_front_matter(doc, helper):
    """Xay dung toan bo phan dau bao cao theo quy dinh cua co va mau Tien Tran."""
    
    # -------------------------------------------------------------------------
    # 1. TRANG BIA TIENG VIET
    # -------------------------------------------------------------------------
    p_inst = doc.add_paragraph()
    helper.format_paragraph(p_inst, space_before=0, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r = p_inst.add_run("BỘ CÔNG THƯƠNG\nTRƯỜNG ĐẠI HỌC CÔNG NGHIỆP THÀNH PHỐ HỒ CHÍ MINH\nKHOA CÔNG NGHỆ THÔNG TIN")
    helper.set_run_font(r, "Times New Roman", 13, bold=True)
    
    # Logo IUH
    if os.path.exists(helper.LOGO_PATH):
        p_logo = doc.add_paragraph()
        helper.format_paragraph(p_logo, space_before=16, space_after=14, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_logo.add_run().add_picture(helper.LOGO_PATH, width=Inches(2.5))
    else:
        p_sp = doc.add_paragraph()
        helper.format_paragraph(p_sp, space_before=24, space_after=24, line_spacing=1.0)
        
    p_kltn = doc.add_paragraph()
    helper.format_paragraph(p_kltn, space_before=6, space_after=14, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_kltn = p_kltn.add_run("KHÓA LUẬN TỐT NGHIỆP")
    helper.set_run_font(r_kltn, "Times New Roman", 16, bold=True)
    
    # Ten de tai
    p_title = doc.add_paragraph()
    helper.format_paragraph(p_title, space_before=14, space_after=16, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_title = p_title.add_run("HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360° & SỐ HÓA KHÔNG GIAN DI SẢN BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH")
    helper.set_run_font(r_title, "Times New Roman", 18, bold=True, color_rgb=(140, 45, 25))
    
    p_major = doc.add_paragraph()
    helper.format_paragraph(p_major, space_before=8, space_after=24, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_maj = p_major.add_run("Chuyên ngành: CÔNG NGHỆ THÔNG TIN\nMã chuyên ngành: 7480201")
    helper.set_run_font(r_maj, "Times New Roman", 13, bold=True)
    
    # Khung thong tin GVHD & SVTH
    p_info = doc.add_paragraph()
    helper.format_paragraph(p_info, space_before=24, space_after=36, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0, left_indent=4.0)
    r_info = p_info.add_run(
        "Giảng viên hướng dẫn:\tTS. TRẦN THỊ MINH KHOA\n"
        "Sinh viên thực hiện 1:\tHUỲNH TẤN LỘC\tMSSV: 22686171\n"
        "Sinh viên thực hiện 2:\tTRỊNH VĨ THÀNH\tMSSV: 22689411\n"
        "Lớp học danh nghĩa:\tDHCNTT18ATT"
    )
    helper.set_run_font(r_info, "Times New Roman", 13, bold=False)
    
    p_date = doc.add_paragraph()
    helper.format_paragraph(p_date, space_before=36, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_date = p_date.add_run("THÀNH PHỐ HỒ CHÍ MINH, THÁNG 12 NĂM 2026")
    helper.set_run_font(r_date, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 2. TRANG BIA TIENG ANH
    # -------------------------------------------------------------------------
    p_einst = doc.add_paragraph()
    helper.format_paragraph(p_einst, space_before=0, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_einst = p_einst.add_run("MINISTRY OF INDUSTRY AND TRADE\nINDUSTRIAL UNIVERSITY OF HO CHI MINH CITY\nFACULTY OF INFORMATION TECHNOLOGY")
    helper.set_run_font(r_einst, "Times New Roman", 13, bold=True)
    
    if os.path.exists(helper.LOGO_PATH):
        p_elogo = doc.add_paragraph()
        helper.format_paragraph(p_elogo, space_before=16, space_after=14, line_spacing=1.0, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
        p_elogo.add_run().add_picture(helper.LOGO_PATH, width=Inches(2.5))
    else:
        p_esp = doc.add_paragraph()
        helper.format_paragraph(p_esp, space_before=24, space_after=24, line_spacing=1.0)
        
    p_ekltn = doc.add_paragraph()
    helper.format_paragraph(p_ekltn, space_before=6, space_after=14, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_ekltn = p_ekltn.add_run("GRADUATION THESIS (CAPSTONE PROJECT)")
    helper.set_run_font(r_ekltn, "Times New Roman", 16, bold=True)
    
    p_etitle = doc.add_paragraph()
    helper.format_paragraph(p_etitle, space_before=14, space_after=16, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_etitle = p_etitle.add_run("VIRTUAL TOUR 360° & HERITAGE SPACE DIGITIZATION FOR HO CHI MINH CITY MUSEUM OF HISTORY")
    helper.set_run_font(r_etitle, "Times New Roman", 18, bold=True, color_rgb=(140, 45, 25))
    
    p_emajor = doc.add_paragraph()
    helper.format_paragraph(p_emajor, space_before=8, space_after=24, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_emaj = p_emajor.add_run("Major: INFORMATION TECHNOLOGY\nMajor Code: 7480201")
    helper.set_run_font(r_emaj, "Times New Roman", 13, bold=True)
    
    p_einfo = doc.add_paragraph()
    helper.format_paragraph(p_einfo, space_before=24, space_after=36, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0, left_indent=4.0)
    r_einfo = p_einfo.add_run(
        "Instructor:\t\tPh.D TRAN THI MINH KHOA\n"
        "Student 1:\t\tHUYNH TAN LOC\tID: 22686171\n"
        "Student 2:\t\tTRINH VI THANH\tID: 22689411\n"
        "Class:\t\t\tDHCNTT18ATT"
    )
    helper.set_run_font(r_einfo, "Times New Roman", 13, bold=False)
    
    p_edate = doc.add_paragraph()
    helper.format_paragraph(p_edate, space_before=36, space_after=0, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=0.0)
    r_edate = p_edate.add_run("HO CHI MINH CITY, DECEMBER 2026")
    helper.set_run_font(r_edate, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 3. TOM TAT DE TAI (TIENG VIET)
    # -------------------------------------------------------------------------
    p_tt_h = helper.add_heading_1(doc, "TÓM TẮT ĐỀ TÀI")
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
    r_kw_txt = p_kw.add_run("Thực tế ảo 360°, Số hóa di sản, Bảo tàng Lịch sử TP.HCM, Three.js, Ghép ảnh Panorama, Thuật toán Dijkstra, PayOS VietQR, Soát vé Camera QR.")
    helper.set_run_font(r_kw_txt, "Times New Roman", 13, bold=False, italic=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 4. ABSTRACT (TIENG ANH)
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
    r_ekw_txt = p_ekw.add_run("Virtual Tour 360°, Heritage Digitization, Ho Chi Minh City Museum of History, Three.js, Panorama Stitching, Dijkstra Algorithm, PayOS VietQR, QR Ticket Scanner.")
    helper.set_run_font(r_ekw_txt, "Times New Roman", 13, bold=False, italic=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 5. LOI CAM ON
    # -------------------------------------------------------------------------
    p_co_h = helper.add_heading_1(doc, "LỜI CẢM ƠN")
    p_co_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    helper.add_body_p(doc, 
        "Để hoàn thành tốt khóa luận tốt nghiệp này, bên cạnh sự nỗ lực và nghiên cứu nghiêm túc của bản thân, nhóm chúng em đã nhận được sự quan tâm, động viên và chỉ dẫn vô cùng quý báu từ quý thầy cô, các đơn vị chuyên môn và gia đình."
    )
    helper.add_body_p(doc, 
        "Trước hết, nhóm chúng em xin bày tỏ lòng biết ơn sâu sắc và chân thành nhất tới Cô — Tiến sĩ Trần Thị Minh Khoa, giảng viên trực tiếp hướng dẫn khóa luận tốt nghiệp. Trong suốt quá trình nghiên cứu, khảo sát thực tế và triển khai hệ thống, Cô đã luôn dành nhiều thời gian quý báu để định hướng học thuật, chỉnh sửa từng đề cương chi tiết, gợi ý các giải pháp kỹ thuật tối ưu và truyền cho chúng em niềm đam mê nghiên cứu khoa học cũng như tác phong làm việc chuyên nghiệp, chuẩn mực."
    )
    helper.add_body_p(doc, 
        "Chúng em xin chân thành cảm ơn Ban Giám hiệu, Ban Chủ nhiệm Khoa Công nghệ Thông tin cùng toàn thể quý Thầy, Cô giáo Trường Đại học Công nghiệp Thành phố Hồ Chí Minh (IUH). Trong suốt 4 năm học tập và rèn luyện dưới mái trường, quý Thầy Cô đã tận tâm truyền đạt những nền tảng tri thức vững chắc về công nghệ phần mềm, thị giác máy tính, kiến trúc hệ thống và đạo đức nghề nghiệp, tạo tiền đề vững chắc giúp chúng em tự tin thực hiện đề tài tốt nghiệp này."
    )
    helper.add_body_p(doc, 
        "Nhóm chúng em cũng xin trân trọng gửi lời cảm ơn tới Ban Giám đốc cùng các cán bộ, nhân viên tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh (Số 2 Nguyễn Bỉnh Khiêm, Quận 1). Sự hỗ trợ nhiệt tình, tạo điều kiện thuận lợi của Ban Quản lý Bảo tàng trong suốt 4 đợt khảo sát thực địa đã giúp chúng em tiếp cận không gian 18 phòng trưng bày, thu thập tư liệu lịch sử chính xác và kiểm nghiệm hệ thống trên thực tế một cách hiệu quả."
    )
    helper.add_body_p(doc, 
        "Cuối cùng, chúng con xin gửi lời tri ân sâu sắc nhất tới Cha Mẹ và Gia đình — điểm tựa tinh thần vững chắc luôn động viên, chia sẻ và tạo mọi điều kiện tốt nhất trong suốt chặng đường học tập. Xin cảm ơn tất cả bạn bè lớp DHCNTT18ATT đã luôn đồng hành, góp ý và sát cánh cùng chúng em trong những năm tháng đại học đáng nhớ."
    )
    helper.add_body_p(doc, 
        "Dù đã nỗ lực hết mình và bám sát mã nguồn cũng như dữ liệu thực tế, song do giới hạn về mặt thời gian và kinh nghiệm, khóa luận khó tránh khỏi những thiếu sót nhất định. Nhóm chúng em rất mong nhận được những lời chỉ bảo, nhận xét và đóng góp quý báu từ quý Thầy Cô trong Hội đồng phản biện để đề tài ngày càng hoàn thiện hơn."
    )
    
    p_sv = doc.add_paragraph()
    helper.format_paragraph(p_sv, space_before=24, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_sv = p_sv.add_run(
        "TP. Hồ Chí Minh, ngày 20 tháng 11 năm 2026\n"
        "Nhóm sinh viên thực hiện:\n\n\n"
        "Huỳnh Tấn Lộc             Trịnh Vĩ Thành"
    )
    helper.set_run_font(r_sv, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 6. PHIEU NHAN XET CUA GIANG VIEN HUONG DAN
    # -------------------------------------------------------------------------
    p_gvhd_h = helper.add_heading_1(doc, "NHẬN XÉT CỦA GIÁO VIÊN HƯỚNG DẪN")
    p_gvhd_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p_gvhd_info = doc.add_paragraph()
    helper.format_paragraph(p_gvhd_info, space_before=6, space_after=8, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_gi = p_gvhd_info.add_run(
        "Họ và tên sinh viên thực hiện:\n"
        "1. Huỳnh Tấn Lộc\tMSSV: 22686171\tLớp: DHCNTT18ATT\n"
        "2. Trịnh Vĩ Thành\tMSSV: 22689411\tLớp: DHCNTT18ATT\n"
        "Tên đề tài: Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử TP. Hồ Chí Minh.\n"
        "Cán bộ hướng dẫn: TS. Trần Thị Minh Khoa\n"
        "Đơn vị công tác: Khoa Công nghệ Thông tin – Trường Đại học Công nghiệp TP.HCM"
    )
    helper.set_run_font(r_gi, "Times New Roman", 13, bold=False)
    
    # Cac dong cham nhan xet
    dots_line = ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."
    for sec_title in [
        "1. Về tinh thần, thái độ làm việc của sinh viên:",
        "2. Về kiến thức chuyên môn và khả năng giải quyết vấn đề:",
        "3. Đánh giá chất lượng sản phẩm và chương trình phần mềm:",
        "4. Điểm mạnh và những điểm cần khắc phục của đề tài:",
        "5. Kết luận và đề nghị cho phép bảo vệ trước Hội đồng:"
    ]:
        p_sec = doc.add_paragraph()
        helper.format_paragraph(p_sec, space_before=6, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
        r_sec = p_sec.add_run(sec_title)
        helper.set_run_font(r_sec, "Times New Roman", 13, bold=True)
        for _ in range(2):
            p_dot = doc.add_paragraph()
            helper.format_paragraph(p_dot, space_before=2, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
            r_dot = p_dot.add_run(dots_line)
            helper.set_run_font(r_dot, "Times New Roman", 12, bold=False, color_rgb=(100, 116, 139))
            
    p_score = doc.add_paragraph()
    helper.format_paragraph(p_score, space_before=10, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_sc = p_score.add_run(
        "Điểm đánh giá: . . . . . . . /10   (Bằng chữ: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .)\n"
        "TP. Hồ Chí Minh, ngày . . . tháng . . . năm 2026\n"
        "GIÁNG VIÊN HƯỚNG DẪN\n"
        "(Ký và ghi rõ họ tên)\n\n\n\n"
        "TS. TRẦN THỊ MINH KHOA"
    )
    helper.set_run_font(r_sc, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 7. PHIEU NHAN XET CUA GIANG VIEN PHAN BIEN (TRANG 1)
    # -------------------------------------------------------------------------
    p_gvpb_h1 = helper.add_heading_1(doc, "NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (TRANG 1/2)")
    p_gvpb_h1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p_pb_info = doc.add_paragraph()
    helper.format_paragraph(p_pb_info, space_before=6, space_after=8, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_pbi = p_pb_info.add_run(
        "Họ và tên sinh viên: 1. Huỳnh Tấn Lộc (22686171)\t2. Trịnh Vĩ Thành (22689411)\n"
        "Đề tài: Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử TP.HCM.\n"
        "Cán bộ phản biện: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .\n"
        "Đơn vị công tác: Khoa Công nghệ Thông tin – Trường Đại học Công nghiệp TP.HCM"
    )
    helper.set_run_font(r_pbi, "Times New Roman", 13, bold=False)
    
    for sec_title in [
        "1. Tính cấp thiết, tính thời sự và ý nghĩa thực tiễn của đề tài:",
        "2. Đánh giá về bố cục, hình thức trình bày và dung lượng báo cáo:",
        "3. Đánh giá tính đúng đắn của phương pháp nghiên cứu và cơ sở lý thuyết:"
    ]:
        p_sec = doc.add_paragraph()
        helper.format_paragraph(p_sec, space_before=6, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
        r_sec = p_sec.add_run(sec_title)
        helper.set_run_font(r_sec, "Times New Roman", 13, bold=True)
        for _ in range(4):
            p_dot = doc.add_paragraph()
            helper.format_paragraph(p_dot, space_before=2, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
            r_dot = p_dot.add_run(dots_line)
            helper.set_run_font(r_dot, "Times New Roman", 12, bold=False, color_rgb=(100, 116, 139))
            
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 8. PHIEU NHAN XET CUA GIANG VIEN PHAN BIEN (TRANG 2)
    # -------------------------------------------------------------------------
    p_gvpb_h2 = helper.add_heading_1(doc, "NHẬN XÉT CỦA GIÁO VIÊN PHẢN BIỆN (TRANG 2/2)")
    p_gvpb_h2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    for sec_title in [
        "4. Đánh giá kết quả chương trình, tính năng và độ ổn định của sản phẩm:",
        "5. Những thiếu sót, hạn chế cần giải trình trước Hội đồng:",
        "6. Các câu hỏi dành cho sinh viên trong buổi bảo vệ:"
    ]:
        p_sec = doc.add_paragraph()
        helper.format_paragraph(p_sec, space_before=6, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
        r_sec = p_sec.add_run(sec_title)
        helper.set_run_font(r_sec, "Times New Roman", 13, bold=True)
        for _ in range(3):
            p_dot = doc.add_paragraph()
            helper.format_paragraph(p_dot, space_before=2, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
            r_dot = p_dot.add_run(dots_line)
            helper.set_run_font(r_dot, "Times New Roman", 12, bold=False, color_rgb=(100, 116, 139))
            
    p_pb_concl = doc.add_paragraph()
    helper.format_paragraph(p_pb_concl, space_before=8, space_after=2, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_pbc = p_pb_concl.add_run("7. Kết luận chung:")
    helper.set_run_font(r_pbc, "Times New Roman", 13, bold=True)
    p_chk = doc.add_paragraph()
    helper.format_paragraph(p_chk, space_before=2, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=0.0)
    r_chk = p_chk.add_run("[   ] Đồng ý cho sinh viên bảo vệ\t\t\t[   ] Không đồng ý cho bảo vệ")
    helper.set_run_font(r_chk, "Times New Roman", 13, bold=True)
    
    p_pb_score = doc.add_paragraph()
    helper.format_paragraph(p_pb_score, space_before=10, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.RIGHT, first_indent=0.0)
    r_pbsc = p_pb_score.add_run(
        "Điểm đánh giá: . . . . . . . /10   (Bằng chữ: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .)\n"
        "TP. Hồ Chí Minh, ngày . . . tháng . . . năm 2026\n"
        "GIẢNG VIÊN PHẢN BIỆN\n"
        "(Ký và ghi rõ họ tên)\n\n\n\n"
        ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."
    )
    helper.set_run_font(r_pbsc, "Times New Roman", 13, bold=True)
    
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 9. MUC LUC (TABLE OF CONTENTS)
    # -------------------------------------------------------------------------
    p_toc_h = helper.add_heading_1(doc, "MỤC LỤC")
    p_toc_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    toc_items = [
        ("CHƯƠNG 1: TỔNG QUAN", 1, 1),
        ("1.1. Giới thiệu đề tài", 1, 2),
        ("1.1.1. Bối cảnh và lý do thực hiện đề tài", 1, 3),
        ("1.1.2. Mục tiêu nghiên cứu và phát triển", 3, 3),
        ("1.1.3. Phạm vi giới hạn của đề tài", 4, 3),
        ("1.1.4. Ý nghĩa khoa học và thực tiễn", 5, 3),
        ("1.2. Đối tượng và phương pháp nghiên cứu", 6, 2),
        ("1.2.1. Đối tượng nghiên cứu", 6, 3),
        ("1.2.2. Phương pháp nghiên cứu và 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM", 7, 3),
        ("1.3. Khảo sát và phân tích yêu cầu người dùng", 9, 2),
        ("1.3.1. Đối tượng người dùng mục tiêu", 9, 3),
        ("1.3.2. Yêu cầu và kỳ vọng của khách tham quan và bảo tàng", 10, 3),
        ("1.4. Công nghệ và công cụ sử dụng", 12, 2),
        ("1.5. Yêu cầu chức năng của hệ thống", 14, 2),
        ("1.6. Yêu cầu phi chức năng của hệ thống", 16, 2),
        
        ("CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG", 18, 1),
        ("2.1. Cơ sở lý thuyết thị giác máy tính và không gian 360°", 18, 2),
        ("2.1.1. Khái niệm ảnh Panorama toàn cảnh và hệ tọa độ cầu Equirectangular", 18, 3),
        ("2.1.2. Phép chiếu trụ (Cylindrical Projection & Warping)", 20, 3),
        ("2.1.3. Thuật toán trích xuất đặc trưng điểm SIFT (Scale-Invariant Feature Transform)", 23, 3),
        ("2.1.4. Khớp đặc trưng và loại bỏ nhiễu ngoại lai bằng RANSAC", 26, 3),
        ("2.1.5. Kỹ thuật cắt mí tối ưu (Seam Cutting) và hòa trộn đa dải tần", 29, 3),
        ("2.1.6. Công nghệ hiển thị không gian cầu 360° với WebGL và Three.js", 32, 3),
        ("2.1.7. Thuật toán tìm đường đi ngắn nhất Dijkstra ứng dụng định tuyến bảo tàng", 35, 3),
        ("2.1.8. Kỹ thuật tái tạo và hiển thị mô hình cổ vật 3D", 38, 3),
        ("2.2. Công nghệ và nền tảng phát triển hệ thống", 40, 2),
        ("2.2.1. Phân hệ Backend và dịch vụ nền tảng", 40, 3),
        ("2.2.2. Phân hệ Frontend và trải nghiệm người dùng", 46, 3),
        ("2.2.3. Tích hợp thanh toán trực tuyến VietQR qua cổng PayOS", 50, 3),
        ("2.2.4. Hạ tầng máy chủ và ảo hóa Docker", 52, 3),
        
        ("CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", 55, 1),
        ("3.1. Tổng hợp yêu cầu hệ thống", 55, 2),
        ("3.1.1. Bảng ma trận yêu cầu chức năng theo phân hệ", 55, 3),
        ("3.1.2. Bảng phân loại yêu cầu phi chức năng chi tiết", 57, 3),
        ("3.2. Mô hình hóa chức năng bằng Use Case", 59, 2),
        ("3.2.1. Danh sách và mô tả các tác nhân (Actors) trong hệ thống", 59, 3),
        ("3.2.2. Sơ đồ Use Case tổng quát và các phân hệ", 61, 3),
        ("3.2.3. Đặc tả chi tiết các Use Case chính của hệ thống", 63, 3),
        ("3.3. Thiết kế cơ sở dữ liệu", 82, 2),
        ("3.3.1. Mô hình quan hệ thực thể (ERD) và chiến lược lưu trữ lai", 82, 3),
        ("3.3.2. Thiết kế chi tiết các bảng dữ liệu", 84, 3),
        ("3.4. Thiết kế kiến trúc tổng thể và các luồng tuần tự (Sequence Diagrams)", 90, 2),
        ("3.4.1. Kiến trúc phân tầng 3-tier và luồng truyền thông bảo mật", 90, 3),
        ("3.4.2. Sơ đồ tuần tự quy trình thanh toán vé VietQR PayOS", 92, 3),
        ("3.4.3. Sơ đồ tuần tự quy trình soát vé qua camera điện thoại", 94, 3),
        ("3.4.4. Sơ đồ tuần tự quy trình tương tác 360° và chuyển phòng", 96, 3),
        
        ("CHƯƠNG 4: HIỆN THỰC HỆ THỐNG VÀ KẾT QUẢ ĐẠT ĐƯỢC", 98, 1),
        ("4.1. Sơ đồ phân cấp chức năng hệ thống (Mindmap)", 98, 2),
        ("4.2. Hiện thực các giải thuật và tính năng cốt lõi", 100, 2),
        ("4.2.1. Hiện thực quy trình ghép ảnh Panorama Studio", 100, 3),
        ("4.2.2. Hiện thực thuật toán Dijkstra định tuyến liên thông 18 phòng", 103, 3),
        ("4.2.3. Hiện thực không gian Tour 360° tương tác và Hotspot điều hướng", 106, 3),
        ("4.2.4. Hiện thực phân hệ thanh toán vé VietQR tự động", 109, 3),
        ("4.2.5. Hiện thực trợ lý ảo AI thuyết minh di sản", 112, 3),
        ("4.3. Giao diện website và kết quả triển khai thực tế", 114, 2),
        ("4.3.1. Nhóm giao diện dành cho Khách tham quan", 114, 3),
        ("4.3.2. Nhóm giao diện dành cho Quản trị viên Admin", 125, 3),
        ("4.3.3. Nhóm giao diện công cụ ghép ảnh Panorama Studio", 134, 3),
        ("4.4. Đánh giá hiệu suất hệ thống", 138, 2),
        ("4.4.1. Mục tiêu và tiêu chí đánh giá hiệu năng", 138, 3),
        ("4.4.2. Công cụ và phương pháp thử nghiệm tải (Apache JMeter, Google Lighthouse)", 139, 3),
        ("4.4.3. Bảng số liệu và phân tích kết quả thử nghiệm hiệu năng", 140, 3),
        ("4.4.4. Đánh giá chỉ số Web Vitals và giải pháp tối ưu", 143, 3),
        
        ("CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", 145, 1),
        ("5.1. Kết quả đạt được của đề tài", 145, 2),
        ("5.2. Khó khăn và hạn chế gặp phải", 146, 2),
        ("5.3. Hướng phát triển và mở rộng trong tương lai", 147, 2),
        
        ("TÀI LIỆU THAM KHẢO", 149, 1),
        ("PHỤ LỤC", 153, 1),
        ("Phụ lục A: Sơ đồ mặt bằng liên thông 18 gian phòng trưng bày", 153, 2),
        ("Phụ lục B: Kế hoạch thực hiện khóa luận tốt nghiệp", 154, 2),
        ("Phụ lục C: Nhật ký 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM", 155, 2),
        ("Phụ lục D: Bảng phân công nhiệm vụ và đánh giá đóng góp thành viên", 157, 2),
    ]
    
    for title, pg, lvl in toc_items:
        helper.add_toc_line(doc, title, pg, level=lvl)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 10. DANH MUC HINH ANH
    # -------------------------------------------------------------------------
    p_fig_h = helper.add_heading_1(doc, "DANH MỤC HÌNH ẢNH")
    p_fig_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    figures_list = [
        ("Hình 1.1 Sơ đồ tư duy tổng quan kiến trúc và các phân hệ hệ thống Bảo tàng 360°", 2),
        ("Hình 1.2 Không gian kiến trúc thực địa tại Bảo tàng Lịch sử TP. Hồ Chí Minh", 7),
        ("Hình 1.3 Sơ đồ quy trình 4 đợt khảo sát và thu thập dữ liệu di sản tại bảo tàng", 8),
        ("Hình 2.1 Mô hình hệ tọa độ cầu Equirectangular (360° x 180°) và hệ tọa độ ảnh phẳng", 19),
        ("Hình 2.2 Quy trình nắn chỉnh biến dạng hình học trụ (Cylindrical Warping) cho ảnh góc rộng", 21),
        ("Hình 2.3 Không gian tỷ lệ sai phân Gauss (Difference of Gaussians - DoG) trong thuật toán SIFT", 24),
        ("Hình 2.4 Khớp cặp điểm đặc trưng SIFT và loại bỏ nhiễu ngoại lai bằng RANSAC", 27),
        ("Hình 2.5 Quy trình tối ưu đường ghép mí (Seam Cutting) và hòa trộn đa dải tần", 30),
        ("Hình 2.6 Nguyên lý ánh xạ texture Panorama lên hình cầu 3D trong không gian WebGL/Three.js", 33),
        ("Hình 2.7 Sơ đồ nguyên lý giải thuật Dijkstra tìm đường đi ngắn nhất trên đồ thị liên thông", 36),
        ("Hình 2.8 Quy trình tái tạo mô hình cổ vật 3D từ chuỗi ảnh chụp đa góc", 39),
        ("Hình 2.9 Mô hình kiến trúc phân tầng hệ thống (3-Tier Layered Architecture)", 41),
        ("Hình 2.10 Mô hình xác thực phân quyền người dùng bằng JSON Web Token (JWT)", 45),
        ("Hình 2.11 Quy trình sinh mã và xác thực thanh toán VietQR qua cổng PayOS", 51),
        ("Hình 2.12 Quy trình quét và kiểm tra mã vé QR thời gian thực bằng camera HTML5-QRCode", 53),
        ("Hình 2.13 Sơ đồ kiến trúc ảo hóa và điều phối container với Docker Compose & Nginx", 54),
        ("Hình 3.1 Sơ đồ Use Case tổng quát toàn hệ thống", 61),
        ("Hình 3.2 Sơ đồ Use Case phân hệ Khách tham quan (Visitor)", 62),
        ("Hình 3.3 Sơ đồ Use Case phân hệ Quản trị viên (Admin)", 63),
        ("Hình 3.4 Sơ đồ Use Case phân hệ Ghép ảnh toàn cảnh (Stitching Studio)", 64),
        ("Hình 3.5 Sơ đồ thực thể liên kết (ERD) cơ sở dữ liệu hệ thống", 83),
        ("Hình 3.6 Sơ đồ tuần tự quy trình đặt vé và thanh toán VietQR PayOS", 93),
        ("Hình 3.7 Sơ đồ tuần tự quy trình soát vé QR bằng camera trực tiếp", 95),
        ("Hình 3.8 Sơ đồ tuần tự quy trình tương tác không gian 360° và chuyển phòng qua Hotspot", 97),
        ("Hình 4.1 Sơ đồ phân cấp chức năng toàn diện hệ thống (Functional Hierarchy Mindmap)", 99),
        ("Hình 4.2 Lưu đồ thuật toán quy trình xử lý và ghép ảnh Panorama Studio", 101),
        ("Hình 4.3 Lưu đồ thuật toán Dijkstra tìm lộ trình di chuyển tối ưu giữa 18 phòng bảo tàng", 104),
        ("Hình 4.4 Lưu đồ thuật toán kiểm tra và xác thực mã vé QR soát vé thời gian thực", 108),
        ("Hình 4.5 Giao diện Trang chủ - Banner Hero và Nhận diện di sản Bảo tàng Lịch sử", 115),
        ("Hình 4.6 Giao diện Giới thiệu không gian di sản và tổng quan 18 phòng trưng bày", 116),
        ("Hình 4.7 Giao diện Không gian Tour 360° tương tác toàn cảnh độ phân giải cao", 118),
        ("Hình 4.8 Giao diện Điểm nối chuyển cảnh (Hotspot) và bảng thông tin tương tác", 119),
        ("Hình 4.9 Giao diện Sơ đồ mặt bằng Mini-map và tính năng tìm đường liên thông Dijkstra", 121),
        ("Hình 4.10 Giao diện Thuyết minh âm thanh đa ngôn ngữ (Text-to-Speech Audio Guide)", 122),
        ("Hình 4.11 Giao diện Chiêm ngưỡng cổ vật 3D tương tác xoay đa chiều", 123),
        ("Hình 4.12 Giao diện Trợ lý Di sản Ảo AI tư vấn thông tin và giải đáp lịch sử", 124),
        ("Hình 4.13 Giao diện Đặt vé tham quan trực tuyến và chọn loại vé", 126),
        ("Hình 4.14 Giao diện Thanh toán VietQR động liên kết ngân hàng qua PayOS", 127),
        ("Hình 4.15 Giao diện Vé điện tử với mã QR bảo mật SHA-256", 128),
        ("Hình 4.16 Giao diện Quét mã QR soát vé camera trực tiếp trên thiết bị di động", 129),
        ("Hình 4.17 Giao diện Bảng điều khiển Quản trị viên (Admin Dashboard)", 130),
        ("Hình 4.18 Giao diện Quản lý danh mục 18 gian phòng trưng bày 360°", 131),
        ("Hình 4.19 Giao diện Cấu hình tọa độ Hotspot và thiết lập liên kết phòng", 132),
        ("Hình 4.20 Giao diện Quản lý kho tư liệu cổ vật và mô hình 3D", 133),
        ("Hình 4.21 Giao diện Quản lý vé tham quan và lịch sử giao dịch PayOS", 134),
        ("Hình 4.22 Giao diện Quản lý người dùng và phân quyền quản trị", 135),
        ("Hình 4.23 Giao diện Quản lý nhận diện thương hiệu CMS (Logo, Slogan, Banner)", 136),
        ("Hình 4.24 Giao diện Điều khiển chế độ bảo trì hệ thống (Maintenance Mode)", 137),
        ("Hình 4.25 Giao diện Công cụ ghép ảnh Panorama Studio - Tải video và lọc khung hình", 138),
        ("Hình 4.26 Giao diện Công cụ Panorama Studio - Nắn chỉnh trụ và ghép mí đa dải tần", 139),
        ("Hình 4.27 Biểu đồ thời gian phản hồi trung bình (Response Time) theo số lượng users", 141),
        ("Hình 4.28 Biểu đồ thông lượng hệ thống (Throughput - Requests/sec) kiểm thử bằng JMeter", 142),
        ("Hình 4.29 Biểu đồ tỷ lệ lỗi (Error Rate) khi tăng tải từ 50 đến 1000 người dùng đồng thời", 143),
        ("Hình 4.30 Kết quả đánh giá chỉ số hiệu năng và Web Vitals bằng Google Lighthouse", 144)
    ]
    
    for f_title, f_page in figures_list:
        helper.add_toc_line(doc, f_title, f_page, level=1)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 11. DANH MUC CAC BANG BIEU
    # -------------------------------------------------------------------------
    p_tbl_h = helper.add_heading_1(doc, "DANH MỤC CÁC BẢNG BIỂU")
    p_tbl_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    tables_list = [
        ("Bảng 1.1 Bảng tổng hợp nhu cầu và kỳ vọng của các nhóm đối tượng người dùng", 11),
        ("Bảng 1.2 Bảng danh mục công nghệ và công cụ sử dụng trong toàn bộ đề tài", 13),
        ("Bảng 1.3 Bảng phân loại yêu cầu chức năng theo từng phân hệ hệ thống", 15),
        ("Bảng 1.4 Bảng đặc tả các chỉ tiêu yêu cầu phi chức năng của hệ thống", 17),
        ("Bảng 2.1 Bảng so sánh các phương pháp trích xuất đặc trưng điểm ảnh (SIFT, SURF, ORB)", 25),
        ("Bảng 2.2 Bảng so sánh các kỹ thuật tái tạo 3D (Photogrammetry, 3DGS, NeRF)", 38),
        ("Bảng 2.3 Bảng so sánh chiến lược lưu trữ dữ liệu (PostgreSQL vs MongoDB vs Redis)", 44),
        ("Bảng 3.1 Bảng danh sách các Tác nhân (Actors) tham gia vào hệ thống", 59),
        ("Bảng 3.2 Bảng ánh xạ Use Case và quyền truy cập của các Tác nhân", 60),
        ("Bảng 3.3 Bảng tổng hợp danh mục các Use Case trong hệ thống", 65),
        ("Bảng 3.4 Đặc tả Use Case Đăng ký tài khoản (Email OTP)", 66),
        ("Bảng 3.5 Đặc tả Use Case Đăng nhập hệ thống (Email OTP / JWT)", 67),
        ("Bảng 3.6 Đặc tả Use Case Đăng xuất khỏi hệ thống", 68),
        ("Bảng 3.7 Đặc tả Use Case Quản lý hồ sơ cá nhân người dùng", 69),
        ("Bảng 3.8 Đặc tả Use Case Khám phá không gian Tour 360° tương tác", 70),
        ("Bảng 3.9 Đặc tả Use Case Chuyển phòng trưng bày thông qua Hotspot", 71),
        ("Bảng 3.10 Đặc tả Use Case Chiêm ngưỡng chi tiết cổ vật 3D tương tác", 72),
        ("Bảng 3.11 Đặc tả Use Case Nghe thuyết minh âm thanh đa ngôn ngữ (TTS)", 73),
        ("Bảng 3.12 Đặc tả Use Case Tìm đường di chuyển trong bảo tàng bằng Dijkstra", 74),
        ("Bảng 3.13 Đặc tả Use Case Tương tác hỏi đáp cùng Trợ lý ảo Di sản AI", 75),
        ("Bảng 3.14 Đặc tả Use Case Đặt vé tham quan trực tuyến", 76),
        ("Bảng 3.15 Đặc tả Use Case Thanh toán vé qua VietQR PayOS", 77),
        ("Bảng 3.16 Đặc tả Use Case Tra cứu và tải vé điện tử (Mã QR bảo mật)", 78),
        ("Bảng 3.17 Đặc tả Use Case Soát vé khách tham quan bằng Camera quét mã QR", 79),
        ("Bảng 3.18 Đặc tả Use Case Quản lý danh mục gian phòng 360°", 80),
        ("Bảng 3.19 Đặc tả Use Case Cấu hình Hotspot và liên kết phòng", 81),
        ("Bảng 3.20 Đặc tả Use Case Quản lý tư liệu cổ vật và mô hình 3D", 82),
        ("Bảng 3.21 Đặc tả Use Case Quản lý phát hành vé và bảng giá", 83),
        ("Bảng 3.22 Đặc tả Use Case Quản lý đơn hàng và báo cáo doanh thu", 84),
        ("Bảng 3.23 Đặc tả Use Case Quản lý người dùng và phân quyền", 85),
        ("Bảng 3.24 Đặc tả Use Case Quản lý nhận diện thương hiệu CMS", 86),
        ("Bảng 3.25 Đặc tả Use Case Ghép ảnh toàn cảnh Panorama Studio", 87),
        ("Bảng 3.26 Cấu trúc thực thể Bảng Rooms (Gian phòng trưng bày 360°)", 88),
        ("Bảng 3.27 Cấu trúc thực thể Bảng Hotspots (Điểm nối tương tác chuyển phòng)", 88),
        ("Bảng 3.28 Cấu trúc thực thể Bảng Artifacts (Cổ vật và hiện vật 3D)", 89),
        ("Bảng 3.29 Cấu trúc thực thể Bảng Tickets (Vé tham quan và mã QR)", 89),
        ("Bảng 3.30 Cấu trúc thực thể Bảng Orders (Giao dịch và đơn thanh toán PayOS)", 90),
        ("Bảng 3.31 Cấu trúc thực thể Bảng Users (Tài khoản người dùng và quyền hạn)", 91),
        ("Bảng 3.32 Cấu trúc thực thể Bảng BrandingSettings (Cấu hình thương hiệu CMS)", 91),
        ("Bảng 3.33 Cấu trúc thực thể Bảng StitchingTasks (Nhiệm vụ xử lý ghép ảnh)", 92),
        ("Bảng 4.1 Bảng thông số kỹ thuật môi trường máy chủ thử nghiệm (Cloud VPS)", 139),
        ("Bảng 4.2 Bảng kết quả đo lường hiệu năng chịu tải hệ thống với Apache JMeter", 140),
        ("Bảng 4.3 Bảng kết quả đánh giá các chỉ số Google Lighthouse trên môi trường thực tế", 144)
    ]
    
    for t_title, t_page in tables_list:
        helper.add_toc_line(doc, t_title, t_page, level=1)
        
    doc.add_page_break()
    
    # -------------------------------------------------------------------------
    # 12. DANH MUC CAC TU VIET TAT
    # -------------------------------------------------------------------------
    p_abbr_h = helper.add_heading_1(doc, "DANH MỤC CÁC TỪ VIẾT TẮT")
    p_abbr_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    abbr_list = [
        ("AI", "Artificial Intelligence", "Trí tuệ nhân tạo"),
        ("API", "Application Programming Interface", "Giao diện lập trình ứng dụng"),
        ("CMS", "Content Management System", "Hệ thống quản trị nội dung"),
        ("CSS", "Cascading Style Sheets", "Ngôn ngữ định kiểu cho tài liệu web"),
        ("DBMS", "Database Management System", "Hệ quản trị cơ sở dữ liệu"),
        ("DoG", "Difference of Gaussians", "Sai phân các hàm Gauss"),
        ("DOM", "Document Object Model", "Mô hình đối tượng tài liệu HTML"),
        ("ERD", "Entity Relationship Diagram", "Sơ đồ thực thể liên kết"),
        ("FOV", "Field of View", "Trường nhìn quang học"),
        ("GLB", "GL Transmission Format Binary", "Định dạng nhị phân chuẩn lưu trữ mô hình 3D"),
        ("GUI", "Graphical User Interface", "Giao diện đồ họa người dùng"),
        ("HNSW", "Hierarchical Navigable Small World", "Thuật toán tìm kiếm lân cận gần nhất theo đồ thị"),
        ("HTML", "HyperText Markup Language", "Ngôn ngữ đánh dấu siêu văn bản"),
        ("HTTP/HTTPS", "HyperText Transfer Protocol (Secure)", "Giao thức truyền tải siêu văn bản (Bảo mật)"),
        ("IEEE", "Institute of Electrical and Electronics Engineers", "Viện Kỹ sư Điện và Điện tử Quốc tế"),
        ("IUH", "Industrial University of Ho Chi Minh City", "Trường Đại học Công nghiệp TP. Hồ Chí Minh"),
        ("JSON", "JavaScript Object Notation", "Định dạng trao đổi dữ liệu dạng văn bản nhẹ"),
        ("JWT", "JSON Web Token", "Chuẩn mã thông báo JSON xác thực an toàn"),
        ("LCP", "Largest Contentful Paint", "Thời gian hiển thị phần tử nội dung lớn nhất"),
        ("Nadir", "Nadir Point", "Điểm chân trời đáy của ảnh toàn cảnh (vùng sàn)"),
        ("NeRF", "Neural Radiance Fields", "Trường bức xạ nơ-ron tái tạo không gian 3D"),
        ("ODM", "Object Document Mapper", "Ánh xạ đối tượng tài liệu (MongoDB)"),
        ("OpenCV", "Open Source Computer Vision Library", "Thư viện thị giác máy tính nguồn mở"),
        ("ORM", "Object Relational Mapping", "Ánh xạ quan hệ đối tượng cơ sở dữ liệu"),
        ("OTP", "One-Time Password", "Mật khẩu xác thực dùng một lần qua Email"),
        ("POS", "Point of Sale", "Điểm thanh toán / Soát vé tại chỗ"),
        ("QR Code", "Quick Response Code", "Mã phản hồi nhanh 2 chiều"),
        ("RANSAC", "Random Sample Consensus", "Thuật toán đồng thuận mẫu ngẫu nhiên loại bỏ nhiễu"),
        ("REST", "Representational State Transfer", "Kiến trúc thiết kế dịch vụ web chuẩn"),
        ("SIFT", "Scale-Invariant Feature Transform", "Thuật toán biến đổi đặc trưng bất biến tỷ lệ"),
        ("SQL", "Structured Query Language", "Ngôn ngữ truy vấn có cấu trúc"),
        ("SVG", "Scalable Vector Graphics", "Định dạng đồ họa véc-tơ có thể thu phóng"),
        ("Three.js", "Three JavaScript Library", "Thư viện đồ họa 3D WebGL trên trình duyệt"),
        ("TTS", "Text-to-Speech", "Công nghệ chuyển đổi văn bản thành giọng nói"),
        ("UI", "User Interface", "Giao diện người dùng"),
        ("UX", "User Experience", "Trải nghiệm người dùng"),
        ("VietQR", "Vietnam Quick Response", "Chuẩn thanh toán mã QR liên ngân hàng quốc gia"),
        ("VPS", "Virtual Private Server", "Máy chủ riêng ảo trên đám mây"),
        ("WebGL", "Web Graphics Library", "Thư viện đồ họa 3D tăng tốc phần cứng trên Web")
    ]
    
    # Bang tu viet tat 3 cot
    tbl_a = doc.add_table(rows=1 + len(abbr_list), cols=3)
    tbl_a.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_a.autofit = False
    helper.set_table_borders(tbl_a, color="475569", sz="6", val="single")
    
    col_w = [Cm(3.0), Cm(6.5), Cm(6.0)]
    
    # Header
    r0 = tbl_a.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    heads = ["Từ viết tắt", "Tên đầy đủ (Tiếng Anh)", "Ý nghĩa tiếng Việt"]
    for i, h in enumerate(heads):
        c = r0.cells[i]
        c.width = col_w[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 12, bold=True)
        
    for idx, (abbr, full, mean) in enumerate(abbr_list):
        row = tbl_a.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([abbr, full, mean]):
            c = row.cells[i]
            c.width = col_w[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_a.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    doc.add_page_break()
    print("Front matter added successfully.")
