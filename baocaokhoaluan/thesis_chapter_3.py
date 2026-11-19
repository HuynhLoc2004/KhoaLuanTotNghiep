from docx.shared import Inches, Pt, RGBColor, Cm
# -*- coding: utf-8 -*-
"""
CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
Mô hình hóa nghiệp vụ, Bảng Actor & Use Case, 22 Bảng Đặc tả Use Case chi tiết (chuẩn mẫu Tiến Trần),
Mô hình ERD, 8 Bảng cấu trúc thực thể CSDL chi tiết, Sơ đồ tuần tự Sequence Diagrams.
"""

from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_3(doc, helper):
    """Xây dựng toàn bộ nội dung Chương 3."""
    
    # Tiêu đề Chương 3
    p_c3 = helper.add_heading_1(doc, "CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG")
    p_c3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 3.1. Tổng hợp yêu cầu hệ thống
    helper.add_heading_2(doc, "3.1. Tổng hợp yêu cầu hệ thống")
    helper.add_body_p(doc,
        "Dựa trên kết quả khảo sát thực tế và phân tích nghiệp vụ tại Bảo tàng Lịch sử TP. Hồ Chí Minh trong 4 đợt tác nghiệp, hệ thống được xác định gồm các yêu cầu chức năng và phi chức năng chặt chẽ nhằm đảm bảo tính toàn diện từ khâu số hóa dữ liệu đến khâu vận hành phục vụ công chúng."
    )
    
    # 3.1.1. Bảng ma trận yêu cầu chức năng theo phân hệ
    helper.add_heading_3(doc, "3.1.1. Bảng ma trận yêu cầu chức năng theo phân hệ")
    helper.add_body_p(doc,
        "Yêu cầu chức năng được nhóm thành 4 nhóm nghiệp vụ chính: Phân hệ Khách tham quan (Visitor), Phân hệ Bán vé & Thanh toán (Ticketing & Payment), Phân hệ Quản trị nội dung (Admin CMS) và Phân hệ Ghép ảnh toàn cảnh (Stitching Studio)."
    )
    
    # 3.1.2. Bảng phân loại yêu cầu phi chức năng chi tiết
    helper.add_heading_3(doc, "3.1.2. Bảng phân loại yêu cầu phi chức năng chi tiết")
    helper.add_body_p(doc,
        "Các yêu cầu phi chức năng tập trung vào độ tin cậy dịch vụ, khả năng phục vụ tải cao trong các đợt cao điểm lễ hội, tính toàn vẹn dữ liệu giao dịch ngân hàng và tốc độ hiển thị hình ảnh không gian 3D trên thiết bị di động."
    )
    
    # 3.2. Mô hình hóa chức năng bằng Use Case
    helper.add_heading_2(doc, "3.2. Mô hình hóa chức năng bằng Use Case")
    
    # 3.2.1. Danh sách và mô tả các tác nhân trong hệ thống
    helper.add_heading_3(doc, "3.2.1. Danh sách và mô tả các tác nhân (Actors) trong hệ thống")
    helper.add_body_p(doc,
        "Hệ thống xác định 4 tác nhân chính tham gia tương tác trực tiếp hoặc gián tiếp với các phân hệ (Bảng 3.1):"
    )
    
    # Bảng 3.1
    helper.add_table_caption(doc, "3.1", "Bảng danh sách các Tác nhân (Actors) tham gia vào hệ thống")
    tbl_act = doc.add_table(rows=5, cols=3)
    tbl_act.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_act.autofit = False
    helper.set_table_borders(tbl_act, color="475569", sz="6", val="single")
    
    col_w_act = [Cm(3.0), Cm(4.0), Cm(8.5)]
    r0 = tbl_act.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["STT", "Tác nhân (Actor)", "Mô tả vai trò và quyền hạn trong hệ thống"]):
        c = r0.cells[i]
        c.width = col_w_act[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    act_data = [
        ("1", "Khách tham quan (Visitor)", "Người dùng đại chúng truy cập website để tham quan không gian 360°, chiêm ngưỡng cổ vật 3D, nghe thuyết minh âm thanh, tìm đường di chuyển và đặt mua vé trực tuyến."),
        ("2", "Quản trị viên (Admin)", "Cán bộ quản lý bảo tàng có toàn quyền quản trị nội dung CMS: biên tập thông tin 18 gian phòng, cấu hình Hotspot, quản lý kho cổ vật, phát hành vé, theo dõi doanh thu và cấu hình bảo trì hệ thống."),
        ("3", "Nhân viên soát vé (Staff / Ticket Checker)", "Nhân viên bảo tàng tại cổng kiểm soát, sử dụng camera trên điện thoại di động để quét và xác thực mã vé QR của khách tham quan theo thời gian thực."),
        ("4", "Hệ thống thanh toán PayOS (External System)", "Hệ thống ngân hàng thanh toán tự động, phát sinh mã VietQR và gửi tín hiệu Webhook xác nhận giao dịch thành công về máy chủ bảo tàng.")
    ]
    for idx, (stt, act, dsc) in enumerate(act_data):
        row = tbl_act.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([stt, act, dsc]):
            c = row.cells[i]
            c.width = col_w_act[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 1))
            
    for r in tbl_act.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 3.2.2. Sơ đồ Use Case tổng quát và các phân hệ
    helper.add_heading_3(doc, "3.2.2. Sơ đồ Use Case tổng quát và các phân hệ")
    helper.add_body_p(doc,
        "Sơ đồ Use Case tổng quát mô tả bức tranh toàn cảnh về sự tương tác giữa các tác nhân và các gói chức năng chính trong hệ sinh thái bảo tàng số (Hình 3.1 đến Hình 3.4)."
    )
    
    # Placeholders Hình 3.1 -> 3.4
    helper.add_figure_placeholder(doc, "3.1",
        "Sơ đồ Use Case tổng quát toàn hệ thống",
        "Sơ đồ thể hiện mối quan hệ giữa 4 Actor và các phân hệ chức năng chính",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "3.2",
        "Sơ đồ Use Case phân hệ Khách tham quan (Visitor)",
        "Chi tiết các ca sử dụng dành cho khách: Xem 360°, Nghe thuyết minh, Đặt vé, Thanh toán VietQR",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "3.3",
        "Sơ đồ Use Case phân hệ Quản trị viên (Admin)",
        "Chi tiết các ca sử dụng quản trị: Quản lý phòng, Quản lý cổ vật, Quản lý vé, Soát vé QR, Cấu hình CMS",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "3.4",
        "Sơ đồ Use Case phân hệ Ghép ảnh toàn cảnh (Stitching Studio)",
        "Các ca sử dụng nắn chỉnh trụ, lọc khung hình và xuất ảnh Panorama 360°",
        width_cm=15.0, height_cm=7.5
    )
    
    # Bảng 3.2: Ánh xạ quyền
    helper.add_table_caption(doc, "3.2", "Bảng ánh xạ Use Case và quyền truy cập của các Tác nhân")
    tbl_map = doc.add_table(rows=6, cols=5)
    tbl_map.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_map.autofit = False
    helper.set_table_borders(tbl_map, color="475569", sz="6", val="single")
    
    col_wm = [Cm(5.0), Cm(2.5), Cm(2.5), Cm(2.5), Cm(3.0)]
    r0 = tbl_map.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Nhóm chức năng chính", "Visitor", "Admin", "Staff", "Hệ thống PayOS"]):
        c = r0.cells[i]
        c.width = col_wm[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    map_data = [
        ("Tham quan 360° & Khám phá cổ vật 3D", "X", "X", "X", "-"),
        ("Nghe thuyết minh âm thanh đa ngôn ngữ", "X", "X", "X", "-"),
        ("Đặt vé online & Thanh toán VietQR", "X", "-", "-", "X (Webhook)"),
        ("Soát vé khách tham quan bằng Camera QR", "-", "X", "X", "-"),
        ("Quản trị CMS, Cấu hình phòng & Ghép ảnh", "-", "X", "-", "-")
    ]
    for idx, (grp, v, a, s, p) in enumerate(map_data):
        row = tbl_map.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([grp, v, a, s, p]):
            c = row.cells[i]
            c.width = col_wm[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.CENTER
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_map.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 3.2.3. Bảng tổng hợp danh mục Use Case
    helper.add_heading_3(doc, "3.2.3. Bảng tổng hợp danh mục các Use Case trong hệ thống")
    helper.add_body_p(doc,
        "Toàn bộ hệ thống bao gồm 22 Use Case nghiệp vụ chính được định danh và mô tả trong Bảng 3.3:"
    )
    
    # Bảng 3.3
    helper.add_table_caption(doc, "3.3", "Bảng tổng hợp danh mục các Use Case trong hệ thống")
    tbl_uclist = doc.add_table(rows=23, cols=3)
    tbl_uclist.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_uclist.autofit = False
    helper.set_table_borders(tbl_uclist, color="475569", sz="6", val="single")
    
    col_w_ucl = [Cm(2.5), Cm(5.5), Cm(7.5)]
    r0 = tbl_uclist.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Mã UC", "Tên Use Case", "Tác nhân chính tham gia"]):
        c = r0.cells[i]
        c.width = col_w_ucl[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    ucl_data = [
        ("UC-01", "Đăng ký tài khoản (Email OTP)", "Khách tham quan"),
        ("UC-02", "Đăng nhập hệ thống (Email OTP / JWT)", "Khách tham quan, Quản trị viên"),
        ("UC-03", "Đăng xuất khỏi hệ thống", "Khách tham quan, Quản trị viên"),
        ("UC-04", "Quản lý hồ sơ cá nhân", "Khách tham quan"),
        ("UC-05", "Khám phá không gian Tour 360°", "Khách tham quan"),
        ("UC-06", "Chuyển phòng qua Hotspot", "Khách tham quan"),
        ("UC-07", "Chiêm ngưỡng chi tiết cổ vật 3D", "Khách tham quan"),
        ("UC-08", "Nghe thuyết minh âm thanh (TTS)", "Khách tham quan"),
        ("UC-09", "Tìm đường di chuyển bằng Dijkstra", "Khách tham quan"),
        ("UC-10", "Tương tác với Trợ lý Di sản Ảo AI", "Khách tham quan"),
        ("UC-11", "Đặt vé tham quan trực tuyến", "Khách tham quan"),
        ("UC-12", "Thanh toán vé qua VietQR PayOS", "Khách tham quan, Hệ thống PayOS"),
        ("UC-13", "Tra cứu và tải vé điện tử (Mã QR)", "Khách tham quan"),
        ("UC-14", "Soát vé camera thời gian thực", "Nhân viên soát vé, Quản trị viên"),
        ("UC-15", "Quản lý danh mục 18 phòng 360°", "Quản trị viên"),
        ("UC-16", "Cấu hình Hotspot liên kết phòng", "Quản trị viên"),
        ("UC-17", "Quản lý kho tư liệu cổ vật 3D", "Quản trị viên"),
        ("UC-18", "Quản lý phát hành vé và bảng giá", "Quản trị viên"),
        ("UC-19", "Quản lý đơn hàng và doanh thu", "Quản trị viên"),
        ("UC-20", "Quản lý người dùng và phân quyền", "Quản trị viên"),
        ("UC-21", "Quản lý nhận diện thương hiệu CMS", "Quản trị viên"),
        ("UC-22", "Ghép ảnh toàn cảnh Panorama Studio", "Quản trị viên / Kỹ thuật viên")
    ]
    for idx, (uc_id, uc_name, act_nm) in enumerate(ucl_data):
        row = tbl_uclist.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([uc_id, uc_name, act_nm]):
            c = row.cells[i]
            c.width = col_w_ucl[i]
            c.paragraphs[0].text = val
            c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_uclist.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=60, bottom=60, left=80, right=80)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 3.2.4. Đặc tả chi tiết các Use Case chính của hệ thống (22 Bảng chuẩn mẫu Tiến Trần)
    helper.add_heading_3(doc, "3.2.4. Đặc tả chi tiết các Use Case chính của hệ thống")
    helper.add_body_p(doc,
        "Dưới đây là các bảng đặc tả ca sử dụng chi tiết (từ Bảng 3.4 đến Bảng 3.25), tuân thủ định dạng chuẩn của Khoa CNTT - IUH với đầy đủ: Tên Use Case, Tác nhân, Mô tả, Tiền điều kiện, Hậu điều kiện, Luồng sự kiện chính (Basic Flow) và Luồng sự kiện thay thế (Alternative / Exception Flow):"
    )
    
    # UC-01
    helper.add_use_case_table(doc, "3.4", "Đăng ký tài khoản (Email OTP)",
        "Khách tham quan",
        "Cho phép khách tham quan đăng ký tài khoản mới thông qua việc xác thực mã OTP gửi về Email.",
        "Khách tham quan chưa đăng nhập và truy cập vào giao diện đăng ký tài khoản.",
        "Tài khoản người dùng mới được lưu vào cơ sở dữ liệu và tự động đăng nhập vào hệ thống.",
        [
            ("1. Khách tham quan nhập địa chỉ Email hợp lệ và nhấn 'Nhận mã xác thực OTP'.", "2. Hệ thống kiểm tra định dạng email, tạo mã OTP gồm 6 chữ số ngẫu nhiên, lưu vào Redis với TTL = 300 giây và gửi email cho người dùng."),
            ("3. Khách tham quan kiểm tra hộp thư, nhập mã 6 số OTP và nhấn 'Xác nhận đăng ký'.", "4. Hệ thống kiểm tra mã OTP với Redis, khởi tạo bản ghi người dùng mới trong PostgreSQL, tạo JWT Token và phản hồi đăng nhập thành công.")
        ],
        [
            ("Email không đúng định dạng:", "Hệ thống hiển thị thông báo lỗi 'Vui lòng nhập địa chỉ email hợp lệ'."),
            ("Mã OTP không chính xác hoặc đã hết hạn (> 5 phút):", "Hệ thống thông báo 'Mã OTP không hợp lệ hoặc đã hết hạn, vui lòng yêu cầu mã mới'.")
        ]
    )
    
    # UC-02
    helper.add_use_case_table(doc, "3.5", "Đăng nhập hệ thống (Email OTP / JWT)",
        "Khách tham quan, Quản trị viên",
        "Xác thực danh tính người dùng và cấp phát Token phân quyền truy cập chức năng tương ứng.",
        "Người dùng đã có tài khoản trên hệ thống.",
        "Người dùng đăng nhập thành công, nhận JWT Token lưu trữ an toàn trong trình duyệt.",
        [
            ("1. Người dùng chọn chức năng Đăng nhập trên thanh điều hướng Navbar.", "2. Hệ thống hiển thị Modal đăng nhập bằng Email OTP (cho khách) hoặc Mật khẩu quản trị (cho Admin)."),
            ("3. Người dùng nhập thông tin xác thực và nhấn nút 'Đăng nhập'.", "4. Hệ thống kiểm tra cơ sở dữ liệu, nếu hợp lệ thì sinh mã JWT Token và cập nhật trạng thái người dùng trên Header.")
        ],
        [
            ("Sai thông tin đăng nhập hoặc mã OTP sai:", "Hệ thống hiển thị cảnh báo lỗi và yêu cầu nhập lại, khóa tạm thời 15 phút nếu nhập sai quá 5 lần liên tiếp.")
        ]
    )
    
    # UC-03
    helper.add_use_case_table(doc, "3.6", "Đăng xuất khỏi hệ thống",
        "Khách tham quan, Quản trị viên",
        "Cho phép người dùng kết thúc phiên làm việc hiện tại và hủy bỏ Token xác thực.",
        "Người dùng đang ở trạng thái đăng nhập vào hệ thống.",
        "Token bị xóa khỏi LocalStorage trình duyệt, hệ thống chuyển về trạng thái khách vãng lai.",
        [
            ("1. Người dùng bấm vào avatar cá nhân và chọn mục 'Đăng xuất'.", "2. Hệ thống hiển thị hộp thoại xác nhận đăng xuất."),
            ("3. Người dùng bấm xác nhận.", "4. Hệ thống xóa Token khỏi trình duyệt, hủy phiên Redis (nếu có) và tải lại trang về trạng thái ban đầu.")
        ],
        [
            ("Người dùng bấm hủy bỏ:", "Hệ thống đóng hộp thoại và giữ nguyên phiên làm việc hiện tại.")
        ]
    )
    
    # UC-04
    helper.add_use_case_table(doc, "3.7", "Quản lý hồ sơ cá nhân",
        "Khách tham quan",
        "Cho phép người dùng xem và cập nhật thông tin cá nhân, xem lịch sử các vé đã đặt.",
        "Khách tham quan đã đăng nhập vào hệ thống.",
        "Thông tin hồ sơ được cập nhật thành công vào cơ sở dữ liệu.",
        [
            ("1. Khách tham quan chọn mục 'Hồ sơ tài khoản' từ menu người dùng.", "2. Hệ thống hiển thị thông tin: Email, họ tên, số điện thoại và danh sách vé đã mua."),
            ("3. Khách cập nhật họ tên, số điện thoại và bấm 'Lưu thay đổi'.", "4. Hệ thống kiểm tra hợp lệ, lưu vào CSDL và hiển thị thông báo 'Cập nhật hồ sơ thành công'.")
        ],
        [
            ("Số điện thoại không hợp lệ:", "Hệ thống báo lỗi và giữ nguyên form chỉnh sửa.")
        ]
    )
    
    # UC-05
    helper.add_use_case_table(doc, "3.8", "Khám phá không gian Tour 360° tương tác",
        "Khách tham quan",
        "Hiển thị không gian ảnh toàn cảnh cầu 360° x 180° của phòng trưng bày, cho phép xoay và zoom đa chiều.",
        "Người dùng truy cập vào trang Tour 360°.",
        "Môi trường WebGL 3D được khởi tạo, ảnh phòng hiện tại được tải và hiển thị trọn vẹn.",
        [
            ("1. Người dùng chọn một phòng trưng bày từ danh sách hoặc bản đồ.", "2. Hệ thống tải ảnh Equirectangular từ máy chủ, ánh xạ lên khối cầu Three.js."),
            ("3. Người dùng kéo chuột (hoặc vuốt màn hình cảm ứng) để quan sát xung quanh.", "4. Camera 3D cập nhật góc quay Yaw/Pitch mượt mà theo thời gian thực (60 FPS).")
        ],
        [
            ("Mạng yếu, ảnh chưa tải xong:", "Hệ thống hiển thị thanh tiến trình (Loading Progress bar) và thông báo vui lòng đợi.")
        ]
    )
    
    # UC-06
    helper.add_use_case_table(doc, "3.9", "Chuyển phòng qua Hotspot",
        "Khách tham quan",
        "Người dùng bấm vào mũi tên chuyển phòng trong không gian 3D để bước sang phòng kế tiếp.",
        "Khách đang ở trong một phòng 360° có chứa các điểm Hotspot liên kết.",
        "Camera chuyển cảnh mượt sang phòng mới và hiển thị thông tin phòng mới.",
        [
            ("1. Khách tham quan di chuột vào biểu tượng Hotspot mũi tên trên màn hình.", "2. Hệ thống phóng to nhẹ biểu tượng và hiển thị nhãn tên phòng đích."),
            ("3. Khách bấm chuột vào Hotspot.", "4. Hệ thống thực hiện hiệu ứng chuyển cảnh (Fade-out/Fade-in), tải ảnh phòng đích và định vị lại góc nhìn mặc định.")
        ],
        [
            ("Phòng đích đang bảo trì:", "Hệ thống thông báo 'Gian phòng này đang tạm đóng để nâng cấp tư liệu'.")
        ]
    )
    
    # UC-07
    helper.add_use_case_table(doc, "3.10", "Chiêm ngưỡng chi tiết cổ vật 3D tương tác",
        "Khách tham quan",
        "Cho phép khách tương tác xoay 360 độ hoặc xoay mô hình 3D (.GLB) của cổ vật trong tủ kính.",
        "Khách bấm vào biểu tượng cổ vật trên màn hình 360° hoặc trang danh mục cổ vật.",
        "Cửa sổ Modal xem cổ vật 3D mở ra, cho phép phóng to, xoay đa góc và đọc xuất xứ lịch sử.",
        [
            ("1. Khách bấm vào một cổ vật (ví dụ: Trống đồng Đông Sơn).", "2. Hệ thống mở Modal chuyên sâu, khởi tạo canvas Three.js tải file mô hình 3D hoặc chuỗi ảnh đĩa xoay."),
            ("3. Khách kéo xoay để xem hoa văn mặt sau, mặt đáy của cổ vật.", "4. Hệ thống hiển thị niên đại, chất liệu, kích thước và câu chuyện lịch sử đi kèm.")
        ],
        [
            ("Trình duyệt không hỗ trợ WebGL:", "Hệ thống tự động chuyển sang chế độ hiển thị album ảnh tĩnh phân giải cao.")
        ]
    )
    
    # UC-08
    helper.add_use_case_table(doc, "3.11", "Nghe thuyết minh âm thanh đa ngôn ngữ (TTS)",
        "Khách tham quan",
        "Tự động phát giọng đọc thuyết minh giới thiệu gian phòng và cổ vật theo ngôn ngữ được chọn.",
        "Khách đang ở trong phòng trưng bày hoặc xem chi tiết cổ vật.",
        "Âm thanh thuyết minh được phát qua loa hoặc tai nghe của thiết bị.",
        [
            ("1. Khách bấm vào nút biểu tượng chiếc loa 'Nghe thuyết minh'.", "2. Hệ thống kiểm tra ngôn ngữ hiện tại (Việt/Anh/Pháp) và phát file audio tương ứng."),
            ("3. Khách có thể tạm dừng, tua lại hoặc điều chỉnh âm lượng.", "4. Hệ thống đồng bộ tiến trình đọc với chữ hiển thị trên màn hình.")
        ],
        [
            ("Chưa chọn ngôn ngữ phù hợp:", "Hệ thống mặc định phát giọng đọc Tiếng Việt chuẩn miền Nam truyền cảm.")
        ]
    )
    
    # UC-09
    helper.add_use_case_table(doc, "3.12", "Tìm đường di chuyển trong bảo tàng bằng Dijkstra",
        "Khách tham quan",
        "Gợi ý đường đi ngắn nhất giữa phòng hiện tại và phòng mong muốn trên sơ đồ mặt bằng bảo tàng.",
        "Khách mở sơ đồ mặt bằng Mini-map và chọn phòng đích cần đến.",
        "Lộ trình tối ưu được tô sáng bằng đường nét đứt vàng trên sơ đồ 18 phòng.",
        [
            ("1. Khách mở Mini-map, bấm chọn một phòng đích (ví dụ: Phòng Triều Nguyễn số 12).", "2. Hệ thống thu thập đỉnh nguồn và đỉnh đích, kích hoạt giải thuật Dijkstra trên đồ thị kề."),
            ("3. Hệ thống tính toán đường ngắn nhất qua ít cửa thông phòng nhất.", "4. Vẽ đường dẫn hướng trực quan trên bản đồ và hiển thị danh sách các phòng cần đi qua.")
        ],
        [
            ("Khách chọn đúng phòng đang đứng:", "Hệ thống thông báo 'Bạn đang ở ngay tại gian phòng này'.")
        ]
    )
    
    # UC-10
    helper.add_use_case_table(doc, "3.13", "Tương tác với Trợ lý Di sản Ảo AI",
        "Khách tham quan",
        "Đặt câu hỏi tự nhiên về lịch sử, nhân vật, sự kiện hoặc lộ trình và nhận câu trả lời thông minh.",
        "Khách bấm vào biểu tượng Trợ lý AI ở góc dưới bên phải màn hình.",
        "Cửa sổ hội thoại mở ra và phản hồi chính xác thông tin dựa trên cơ sở tri thức bảo tàng.",
        [
            ("1. Khách mở khung chat và gõ câu hỏi: 'Bảo tàng có tượng Phật nghìn mắt nghìn tay ở phòng nào?'.", "2. Hệ thống gửi câu hỏi về API Trợ lý AI, phân tích ngữ nghĩa và tra cứu cơ sở dữ liệu."),
            ("3. Hệ thống trả lời câu hỏi kèm nút bấm: 'Đi ngay đến Phòng Tượng Phật giáo Châu Á (Phòng 16)'.", "4. Khách bấm vào nút đề xuất và được chuyển thẳng đến không gian 360° tương ứng.")
        ],
        [
            ("Câu hỏi ngoài phạm vi di sản:", "Trợ lý AI lịch sự từ chối và hướng người dùng quay lại các chủ đề văn hóa lịch sử.")
        ]
    )
    
    # UC-11
    helper.add_use_case_table(doc, "3.14", "Đặt vé tham quan trực tuyến",
        "Khách tham quan",
        "Cho phép khách chọn ngày tham quan, số lượng vé người lớn/trẻ em và nhập thông tin liên hệ.",
        "Khách truy cập trang 'Đặt vé' trên thanh điều hướng.",
        "Đơn đặt vé được khởi tạo với trạng thái 'PENDING' và chuyển sang bước thanh toán.",
        [
            ("1. Khách chọn ngày tham quan, số lượng vé (Người lớn: 30.000 VNĐ, Trẻ em/Sinh viên: 15.000 VNĐ).", "2. Hệ thống tự động tính tổng tiền thanh toán."),
            ("3. Khách nhập họ tên, email nhận vé và số điện thoại.", "4. Bấm 'Tiến hành thanh toán', hệ thống tạo đơn hàng và gọi API PayOS sinh mã VietQR.")
        ],
        [
            ("Số lượng vé bằng 0 hoặc ngày tham quan trong quá khứ:", "Hệ thống báo lỗi và yêu cầu chọn lại ngày hợp lệ.")
        ]
    )
    
    # UC-12
    helper.add_use_case_table(doc, "3.15", "Thanh toán vé qua VietQR PayOS",
        "Khách tham quan, Hệ thống PayOS",
        "Quét mã QR bằng ứng dụng ngân hàng số để chuyển khoản tiền vé tự động.",
        "Đơn hàng vé ở trạng thái PENDING với mã VietQR hiển thị trên màn hình.",
        "Đơn hàng chuyển trạng thái 'PAID', vé điện tử được xuất và gửi tự động qua Email.",
        [
            ("1. Khách mở ứng dụng ngân hàng trên điện thoại, chọn Quét QR và quét mã hiển thị trên web.", "2. Ứng dụng ngân hàng tự động điền STK, tên chủ tài khoản, số tiền và mã đơn hàng."),
            ("3. Khách xác nhận chuyển tiền trên app ngân hàng.", "4. Cổng PayOS nhận tiền thành công và phát Webhook về máy chủ bảo tàng. Hệ thống tự động kích hoạt vé và chuyển hướng sang trang vé thành công.")
        ],
        [
            ("Hết thời gian thanh toán (15 phút) khách chưa chuyển:", "Đơn hàng tự động hủy và mã QR hết hiệu lực.")
        ]
    )
    
    # UC-13
    helper.add_use_case_table(doc, "3.16", "Tra cứu và tải vé điện tử (Mã QR)",
        "Khách tham quan",
        "Khách xem lại vé đã mua, tải ảnh vé hoặc lưu mã QR vào điện thoại để xuất trình khi đến bảo tàng.",
        "Khách đã thanh toán thành công hoặc tra cứu qua mã đơn hàng.",
        "Thông tin vé chi tiết kèm mã QR hợp lệ được hiển thị để tải về máy.",
        [
            ("1. Khách mở email hoặc vào mục 'Vé của tôi' trên website.", "2. Hệ thống hiển thị thẻ vé điện tử có họ tên, ngày tham quan, số lượng và mã QR bảo mật."),
            ("3. Khách bấm 'Tải vé PDF / Ảnh QR'.", "4. Hệ thống xuất file ảnh vé sắc nét để lưu vào thư viện điện thoại.")
        ],
        [
            ("Vé đã được sử dụng trước đó:", "Hệ thống hiển thị trạng thái vé 'ĐÃ SOÁT VÉ' kèm thời gian quét vé.")
        ]
    )
    
    # UC-14
    helper.add_use_case_table(doc, "3.17", "Soát vé camera thời gian thực",
        "Nhân viên soát vé, Quản trị viên",
        "Sử dụng camera điện thoại của nhân viên để quét mã QR vé của khách tại cổng ra vào bảo tàng.",
        "Nhân viên đăng nhập với quyền Staff/Admin và mở trang Soát vé.",
        "Hệ thống kiểm tra tính hợp lệ của vé, tự động đổi trạng thái vé sang 'USED' và phát âm thanh thông báo.",
        [
            ("1. Nhân viên đưa camera điện thoại hướng vào mã QR trên vé của khách tham quan.", "2. Thư viện HTML5-QRCode tự động nhận diện và trích xuất chuỗi mã vé."),
            ("3. Gửi chuỗi mã về API kiểm tra của máy chủ.", "4. Hệ thống kiểm tra chữ ký số SHA-256: nếu vé hợp lệ và chưa dùng thì chuyển trạng thái 'USED', hiển thị dấu tích xanh và phát chuông thành công.")
        ],
        [
            ("Vé giả mạo hoặc vé đã bị sử dụng:", "Màn hình chuyển sang màu đỏ cảnh báo 'VÉ KHÔNG HỢP LỆ HOẶC ĐÃ ĐƯỢC SỬ DỤNG' kèm âm báo cảnh báo.")
        ]
    )
    
    # UC-15
    helper.add_use_case_table(doc, "3.18", "Quản lý danh mục 18 phòng 360°",
        "Quản trị viên",
        "Thêm mới, sửa đổi thông tin, tải lên ảnh 360° và cấu hình tọa độ cho từng gian phòng.",
        "Admin đăng nhập trang Quản trị và chọn mục 'Quản lý phòng 360°'.",
        "Thông tin và tài nguyên ảnh của phòng được cập nhật vào MongoDB.",
        [
            ("1. Admin chọn một phòng từ danh sách 18 phòng và bấm 'Chỉnh sửa'.", "2. Hệ thống tải form thông tin: Tên phòng, tên tiếng Anh, thứ tự, ảnh 360°, tọa độ mini-map."),
            ("3. Admin cập nhật thông tin và tải ảnh Panorama mới (nếu có) rồi bấm 'Lưu'.", "4. Hệ thống kiểm tra tính hợp lệ, lưu vào CSDL và xóa cache Redis tương ứng.")
        ],
        [
            ("Dung lượng ảnh vượt quá 20MB:", "Hệ thống báo lỗi và yêu cầu nén ảnh trước khi tải lên.")
        ]
    )
    
    # UC-16
    helper.add_use_case_table(doc, "3.19", "Cấu hình Hotspot liên kết phòng",
        "Quản trị viên",
        "Đặt các điểm nối chuyển cảnh trực tiếp trong không gian 3D để liên kết các phòng với nhau.",
        "Admin mở công cụ chỉnh sửa Hotspot của phòng đang chọn.",
        "Điểm Hotspot mới với tọa độ Yaw/Pitch và phòng đích được lưu thành công.",
        [
            ("1. Admin xoay camera trong không gian 3D đến vị trí cửa thông phòng và nhấp đúp chuột.", "2. Hệ thống ghi nhận tọa độ góc (Yaw, Pitch) tại điểm nhấp."),
            ("3. Admin chọn phòng đích cần liên kết từ danh sách thả xuống.", "4. Bấm 'Lưu điểm Hotspot', hệ thống tạo điểm nối mới trong cơ sở dữ liệu.")
        ],
        [
            ("Liên kết đến chính phòng hiện tại:", "Hệ thống cảnh báo không thể tạo vòng lặp tại chỗ.")
        ]
    )
    
    # UC-17
    helper.add_use_case_table(doc, "3.20", "Quản lý kho tư liệu cổ vật 3D",
        "Quản trị viên",
        "Thêm mới, chỉnh sửa thông tin mô tả, tải lên file mô hình 3D (.GLB) và gắn cổ vật vào phòng trưng bày.",
        "Admin truy cập mục 'Quản lý cổ vật & bảo vật 3D'.",
        "Dữ liệu cổ vật và file mô hình được lưu trữ và hiển thị trên giao diện tham quan.",
        [
            ("1. Admin bấm 'Thêm cổ vật mới', nhập tên, thời kỳ, chất liệu, xuất xứ.", "2. Tải lên file mô hình 3D .GLB và ảnh đại diện thumbnail."),
            ("3. Chọn phòng trưng bày lưu giữ cổ vật này.", "4. Bấm 'Lưu cổ vật', hệ thống lưu bản ghi và đồng bộ vào danh mục.")
        ],
        [
            ("File 3D sai định dạng không phải .glb:", "Hệ thống từ chối tệp và yêu cầu tải đúng chuẩn .glb.")
        ]
    )
    
    # UC-18
    helper.add_use_case_table(doc, "3.21", "Quản lý phát hành vé và bảng giá",
        "Quản trị viên",
        "Cấu hình các loại vé (Người lớn, Sinh viên, Trẻ em, Miễn phí), giá tiền và giới hạn số vé mỗi ngày.",
        "Admin truy cập mục 'Quản lý vé & Tham quan'.",
        "Bảng giá vé mới được áp dụng ngay lập tức trên trang đặt vé của khách.",
        [
            ("1. Admin chọn loại vé cần sửa giá hoặc thêm loại vé mới.", "2. Nhập tên loại vé, đơn giá (VNĐ) và điều kiện áp dụng."),
            ("3. Bấm 'Lưu cấu hình vé'.", "4. Hệ thống cập nhật bảng Tickets trong CSDL PostgreSQL.")
        ],
        [
            ("Đơn giá nhập số âm:", "Hệ thống báo lỗi giá vé phải lớn hơn hoặc bằng 0.")
        ]
    )
    
    # UC-19
    helper.add_use_case_table(doc, "3.22", "Quản lý đơn hàng và doanh thu",
        "Quản trị viên",
        "Xem danh sách đơn đặt vé, lọc theo trạng thái (PAID/PENDING/CANCELLED) và xuất báo cáo doanh thu.",
        "Admin truy cập mục 'Báo cáo & Thống kê'.",
        "Dashboard hiển thị biểu đồ doanh thu theo ngày/tháng và danh sách chi tiết đơn hàng.",
        [
            ("1. Admin chọn khoảng thời gian cần xem báo cáo (ví dụ: Tháng hiện tại).", "2. Hệ thống truy vấn CSDL, tổng hợp doanh thu và hiển thị biểu đồ."),
            ("3. Admin bấm 'Xuất danh sách đơn hàng ra file Excel/CSV'.", "4. Hệ thống tạo file báo cáo tải về máy.")
        ],
        [
            ("Không có đơn hàng nào trong khoảng thời gian chọn:", "Hệ thống hiển thị bảng trống kèm thông báo.")
        ]
    )
    
    # UC-20
    helper.add_use_case_table(doc, "3.23", "Quản lý người dùng và phân quyền",
        "Quản trị viên",
        "Xem danh sách tài khoản, khóa tài khoản vi phạm hoặc phân quyền vai trò (Admin, Staff, Visitor).",
        "Admin truy cập mục 'Quản lý người dùng'.",
        "Vai trò và trạng thái tài khoản được cập nhật an toàn.",
        [
            ("1. Admin tìm kiếm tài khoản theo email hoặc họ tên.", "2. Bấm 'Phân quyền', chọn vai trò mong muốn từ dropdown list."),
            ("3. Bấm xác nhận.", "4. Hệ thống cập nhật quyền hạn trong bảng Users.")
        ],
        [
            ("Admin tự hạ quyền của chính mình:", "Hệ thống ngăn chặn để tránh mất quyền quản trị tối cao.")
        ]
    )
    
    # UC-21
    helper.add_use_case_table(doc, "3.24", "Quản lý nhận diện thương hiệu CMS",
        "Quản trị viên",
        "Thay đổi linh hoạt Logo bảo tàng, Tên bảo tàng, Slogan, Banner Hero và chế độ bảo trì hệ thống.",
        "Admin truy cập mục 'Cấu hình hệ thống & Đa bảo tàng'.",
        "Giao diện toàn bộ website đồng bộ ngay lập tức nhận diện thương hiệu mới mà không cần sửa code.",
        [
            ("1. Admin tải lên ảnh Logo mới, chỉnh sửa Slogan hoặc bật công tắc 'Chế độ bảo trì'.", "2. Bấm 'Lưu thay đổi thương hiệu'."),
            ("3. Hệ thống lưu cấu hình vào bảng BrandingSettings trong CSDL.", "4. Hệ thống phát tín hiệu làm mới cache, thanh Navbar và trang chủ tự động cập nhật Logo mới.")
        ],
        [
            ("Ảnh Logo hỏng:", "Hệ thống tự động sử dụng biểu tượng di sản chữ viết tắt (Emblem BT) làm giải pháp dự phòng an toàn.")
        ]
    )
    
    # UC-22
    helper.add_use_case_table(doc, "3.25", "Ghép ảnh toàn cảnh Panorama Studio",
        "Quản trị viên / Kỹ thuật viên",
        "Tải lên video hoặc chuỗi ảnh thực địa, thực hiện quy trình nắn chỉnh trụ và ghép ảnh tự động trên web.",
        "Kỹ thuật viên truy cập công cụ 'Panorama Stitching Studio'.",
        "Bức ảnh cầu Equirectangular 360° x 180° hoàn chỉnh được xuất ra và lưu trữ an toàn.",
        [
            ("1. Người dùng tải video quét phòng định dạng MP4 hoặc kéo thả 20-30 bức ảnh góc rộng.", "2. Bấm 'Bắt đầu xử lý ghép ảnh'."),
            ("3. Hệ thống tiến hành trích xuất khung hình, nắn trụ Cylindrical, trích SIFT, khớp RANSAC và hòa trộn đa dải tần.", "4. Hiển thị ảnh kết quả xem trước 360° và cung cấp nút 'Đồng bộ ảnh vào gian phòng trưng bày'.")
        ],
        [
            ("Video quay quá nhanh, độ chồng lấn giữa các khung hình < 30%:", "Hệ thống dừng ghép mí và thông báo 'Không đủ điểm đặc trưng để ghép, vui lòng quét lại với tốc độ lia máy chậm hơn'.")
        ]
    )
    
    # 3.3. Thiết kế cơ sở dữ liệu
    helper.add_heading_2(doc, "3.3. Thiết kế cơ sở dữ liệu")
    
    # 3.3.1. Mô hình quan hệ thực thể (ERD) và chiến lược lưu trữ lai
    helper.add_heading_3(doc, "3.3.1. Mô hình quan hệ thực thể (ERD) và chiến lược lưu trữ lai")
    helper.add_body_p(doc,
        "Hệ thống triển khai mô hình kiến trúc cơ sở dữ liệu lai (Hybrid Architecture) kết hợp giữa hai hệ quản trị CSDL hàng đầu: PostgreSQL chịu trách nhiệm quản lý dữ liệu có cấu trúc quan hệ chặt chẽ và giao dịch tài chính (Users, Tickets, Orders, TicketValidationLogs), trong khi MongoDB chịu trách nhiệm quản lý dữ liệu phân cấp không gian (Rooms, Hotspots, Artifacts, MediaAssets). Sơ đồ thực thể liên kết tổng thể được mô tả trong Hình 3.5:"
    )
    
    # Placeholder Hình 3.5
    helper.add_figure_placeholder(doc, "3.5",
        "Sơ đồ thực thể liên kết (ERD) cơ sở dữ liệu hệ thống",
        "Sơ đồ mô hình hóa các thực thể Users, Tickets, Orders, Rooms, Hotspots, Artifacts và các mối quan hệ 1-N, N-N",
        width_cm=15.0, height_cm=8.0
    )
    
    # 3.3.2. Thiết kế chi tiết các bảng dữ liệu (8 Bảng CSDL chi tiết: Bảng 3.26 -> 3.33)
    helper.add_heading_3(doc, "3.3.2. Thiết kế chi tiết các bảng dữ liệu")
    helper.add_body_p(doc,
        "Dưới đây là cấu trúc chi tiết của 8 bảng dữ liệu cốt lõi trong hệ thống, bao gồm tên trường, kiểu dữ liệu, các ràng buộc toàn vẹn và ý nghĩa nghiệp vụ cụ thể:"
    )
    
    # Bảng 3.26: Rooms
    helper.add_db_schema_table(doc, "3.26", "Rooms (Gian phòng trưng bày 360°)", [
        ("1", "id", "String (ObjectId)", "Primary Key", "Mã định danh duy nhất của gian phòng"),
        ("2", "roomNumber", "Integer", "Unique, Not Null", "Số thứ tự phòng trưng bày (từ 1 đến 18)"),
        ("3", "title", "String (Varchar)", "Not Null", "Tên gian phòng bằng tiếng Việt (Ví dụ: Thời Tiền sử)"),
        ("4", "titleEn", "String (Varchar)", "Nullable", "Tên gian phòng dịch sang tiếng Anh"),
        ("5", "description", "Text", "Nullable", "Bài viết tóm tắt lịch sử và hiện vật tiêu biểu của phòng"),
        ("6", "panoramaUrl", "String (Varchar)", "Not Null", "Đường dẫn URL ảnh toàn cảnh cầu Equirectangular 360°"),
        ("7", "thumbnailUrl", "String (Varchar)", "Nullable", "Ảnh thu nhỏ đại diện hiển thị trên menu và mini-map"),
        ("8", "floorplanX", "Float", "Not Null", "Tọa độ trục X của phòng trên sơ đồ mặt bằng bảo tàng (pixel)"),
        ("9", "floorplanY", "Float", "Not Null", "Tọa độ trục Y của phòng trên sơ đồ mặt bằng bảo tàng (pixel)"),
        ("10", "isActive", "Boolean", "Default True", "Trạng thái mở cửa đón khách (True) hoặc bảo trì (False)")
    ])
    
    # Bảng 3.27: Hotspots
    helper.add_db_schema_table(doc, "3.27", "Hotspots (Điểm nối tương tác chuyển phòng)", [
        ("1", "id", "String (ObjectId)", "Primary Key", "Mã định danh duy nhất của điểm Hotspot"),
        ("2", "sourceRoomId", "String (ObjectId)", "Foreign Key", "Mã phòng chứa điểm Hotspot này"),
        ("3", "targetRoomId", "String (ObjectId)", "Foreign Key", "Mã phòng đích sẽ chuyển đến khi bấm vào"),
        ("4", "yaw", "Float", "Not Null", "Tọa độ góc quay ngang trong không gian 3D cầu ([-180°, 180°])"),
        ("5", "pitch", "Float", "Not Null", "Tọa độ góc quay đứng trong không gian 3D cầu ([-90°, 90°])"),
        ("6", "label", "String (Varchar)", "Nullable", "Nhãn chữ hiển thị khi di chuột vào mũi tên"),
        ("7", "type", "String (Enum)", "Not Null", "Loại Hotspot: 'navigation' (chuyển phòng) hoặc 'info' (thông tin)")
    ])
    
    # Bảng 3.28: Artifacts
    helper.add_db_schema_table(doc, "3.28", "Artifacts (Cổ vật và bảo vật 3D)", [
        ("1", "id", "String (ObjectId)", "Primary Key", "Mã định danh duy nhất của cổ vật"),
        ("2", "roomId", "String (ObjectId)", "Foreign Key", "Mã gian phòng trưng bày hiện vật này"),
        ("3", "name", "String (Varchar)", "Not Null", "Tên hiện vật (Ví dụ: Trống đồng Đông Sơn)"),
        ("4", "historicalPeriod", "String (Varchar)", "Nullable", "Thời kỳ lịch sử / Triều đại (Ví dụ: Văn hóa Đông Sơn)"),
        ("5", "material", "String (Varchar)", "Nullable", "Chất liệu chế tác (Đồng, Gốm men, Vàng, Đá sa thạch)"),
        ("6", "model3dUrl", "String (Varchar)", "Nullable", "Đường dẫn file mô hình 3D định dạng .GLB"),
        ("7", "audioGuideUrl", "String (Varchar)", "Nullable", "Đường dẫn file âm thanh thuyết minh đa ngôn ngữ"),
        ("8", "isNationalTreasure", "Boolean", "Default False", "Đánh dấu hiện vật có phải Bảo vật Quốc gia hay không")
    ])
    
    # Bảng 3.29: Tickets
    helper.add_db_schema_table(doc, "3.29", "Tickets (Vé tham quan và mã QR)", [
        ("1", "id", "UUID", "Primary Key", "Mã định danh duy nhất của vé tham quan"),
        ("2", "orderId", "UUID", "Foreign Key", "Mã đơn hàng liên kết chứa vé này"),
        ("3", "ticketCode", "String (Varchar)", "Unique, Not Null", "Mã vé bảo mật (Ví dụ: BT-202611-8849)"),
        ("4", "qrHash", "String (Varchar)", "Unique, Not Null", "Chuỗi mã băm bảo mật SHA-256 mã hóa trong mã QR"),
        ("5", "ticketType", "String (Enum)", "Not Null", "Loại vé: 'ADULT' (Người lớn), 'STUDENT' (Sinh viên)"),
        ("6", "price", "Decimal(10,2)", "Not Null", "Giá tiền vé thực tế tại thời điểm mua (VNĐ)"),
        ("7", "visitDate", "Date", "Not Null", "Ngày đăng ký tham quan bảo tàng"),
        ("8", "status", "String (Enum)", "Default 'VALID'", "Trạng thái vé: 'VALID' (Hợp lệ), 'USED' (Đã dùng), 'EXPIRED'")
    ])
    
    # Bảng 3.30: Orders
    helper.add_db_schema_table(doc, "3.30", "Orders (Giao dịch và đơn thanh toán PayOS)", [
        ("1", "id", "UUID", "Primary Key", "Mã định danh duy nhất của đơn đặt vé"),
        ("2", "orderCode", "BigInt", "Unique, Not Null", "Mã số đơn hàng định dạng số nguyên chuyển tiếp qua PayOS"),
        ("3", "customerName", "String (Varchar)", "Not Null", "Họ và tên khách hàng đặt vé"),
        ("4", "customerEmail", "String (Varchar)", "Not Null", "Địa chỉ Email nhận vé điện tử"),
        ("5", "customerPhone", "String (Varchar)", "Not Null", "Số điện thoại liên hệ của khách hàng"),
        ("6", "totalAmount", "Decimal(10,2)", "Not Null", "Tổng số tiền thanh toán của đơn hàng (VNĐ)"),
        ("7", "status", "String (Enum)", "Default 'PENDING'", "Trạng thái: 'PENDING' (Chờ), 'PAID' (Đã trả), 'CANCELLED'"),
        ("8", "payosPaymentId", "String (Varchar)", "Nullable", "Mã giao dịch ngân hàng do PayOS phản hồi qua Webhook")
    ])
    
    # Bảng 3.31: Users
    helper.add_db_schema_table(doc, "3.31", "Users (Tài khoản người dùng và phân quyền)", [
        ("1", "id", "UUID", "Primary Key", "Mã định danh duy nhất của người dùng"),
        ("2", "email", "String (Varchar)", "Unique, Not Null", "Địa chỉ Email đăng nhập hệ thống"),
        ("3", "passwordHash", "String (Varchar)", "Nullable", "Mật khẩu mã hóa BCrypt (dành cho Admin)"),
        ("4", "fullName", "String (Varchar)", "Nullable", "Họ và tên người dùng"),
        ("5", "role", "String (Enum)", "Default 'VISITOR'", "Vai trò phân quyền: 'ADMIN', 'STAFF', 'VISITOR'"),
        ("6", "isActive", "Boolean", "Default True", "Trạng thái tài khoản: Kích hoạt (True) hoặc bị khóa (False)")
    ])
    
    # Bảng 3.32: BrandingSettings
    helper.add_db_schema_table(doc, "3.32", "BrandingSettings (Cấu hình thương hiệu CMS)", [
        ("1", "id", "String (ObjectId)", "Primary Key", "Mã định danh bản ghi cấu hình"),
        ("2", "museumName", "String (Varchar)", "Not Null", "Tên đầy đủ của bảo tàng trên Header và Chân trang"),
        ("3", "shortName", "String (Varchar)", "Not Null", "Tên rút gọn hiển thị trên Navbar (Bảo tàng Lịch sử)"),
        ("4", "logoUrl", "String (Varchar)", "Nullable", "Đường dẫn ảnh Logo chính thức của bảo tàng"),
        ("5", "emblemText", "String (Varchar)", "Default 'BT'", "Chữ cái biểu trưng dự phòng khi logo bị thiếu"),
        ("6", "isMaintenance", "Boolean", "Default False", "Công tắc kích hoạt chế độ bảo trì toàn bộ cổng thông tin")
    ])
    
    # Bảng 3.33: StitchingTasks
    helper.add_db_schema_table(doc, "3.33", "StitchingTasks (Nhiệm vụ xử lý ghép ảnh)", [
        ("1", "id", "UUID", "Primary Key", "Mã định danh tác vụ ghép ảnh Panorama"),
        ("2", "videoSourceUrl", "String (Varchar)", "Nullable", "Đường dẫn video quét phòng nguồn được tải lên"),
        ("3", "extractedFrames", "Integer", "Default 0", "Tổng số lượng khung hình trích xuất được từ video"),
        ("4", "status", "String (Enum)", "Not Null", "Trạng thái: 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'"),
        ("5", "outputPanoUrl", "String (Varchar)", "Nullable", "Đường dẫn ảnh toàn cảnh kết quả sau khi ghép mí hoàn tất")
    ])
    
    # 3.4. Thiết kế kiến trúc tổng thể và các luồng tuần tự
    helper.add_heading_2(doc, "3.4. Thiết kế kiến trúc tổng thể và các luồng tuần tự (Sequence Diagrams)")
    helper.add_body_p(doc,
        "Để đảm bảo tính nhất quán giữa các phân hệ, các sơ đồ tuần tự dưới đây làm rõ luồng thông điệp bất đồng bộ diễn ra trong các quy trình nghiệp vụ trọng tâm của hệ thống:"
    )
    
    # Placeholders Hình 3.6 -> 3.8
    helper.add_figure_placeholder(doc, "3.6",
        "Sơ đồ tuần tự quy trình đặt vé và thanh toán VietQR PayOS",
        "Luồng gọi API từ Client -> Server Bảo tàng -> Cổng PayOS -> Webhook ngân hàng cập nhật trạng thái đơn hàng",
        width_cm=15.0, height_cm=8.0
    )
    helper.add_figure_placeholder(doc, "3.7",
        "Sơ đồ tuần tự quy trình soát vé QR bằng camera trực tiếp",
        "Luồng quét mã vé tại cổng từ Mobile Browser Staff -> API đối soát -> Xác thực chữ ký SHA-256 -> Hủy vé",
        width_cm=15.0, height_cm=8.0
    )
    helper.add_figure_placeholder(doc, "3.8",
        "Sơ đồ tuần tự quy trình tương tác không gian 360° và chuyển phòng qua Hotspot",
        "Luồng sự kiện Three.js Raycaster bắt sự kiện click -> Chuyển đổi trạng thái phòng -> Nạp Texture mới mượt mà",
        width_cm=15.0, height_cm=8.0
    )
    
    doc.add_page_break()
    print("Chapter 3 added successfully.")
