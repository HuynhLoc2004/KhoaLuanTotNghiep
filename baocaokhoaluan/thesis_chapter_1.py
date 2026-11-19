from docx.shared import Inches, Pt, RGBColor, Cm
# -*- coding: utf-8 -*-
"""
CHƯƠNG 1: TỔNG QUAN
Bám sát quy chuẩn IUH, đề cao chiều sâu học thuật, phản ánh 4 đợt thực địa tại Bảo tàng Lịch sử TP.HCM.
"""

from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_1(doc, helper):
    """Xây dựng toàn bộ nội dung Chương 1."""
    
    # Tiêu đề Chương 1
    p_c1 = helper.add_heading_1(doc, "CHƯƠNG 1: TỔNG QUAN")
    p_c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 1.1. Giới thiệu đề tài
    helper.add_heading_2(doc, "1.1. Giới thiệu đề tài")
    
    # 1.1.1. Bối cảnh và lý do thực hiện đề tài
    helper.add_heading_3(doc, "1.1.1. Bối cảnh và lý do thực hiện đề tài")
    helper.add_body_p(doc,
        "Di sản văn hóa và lịch sử dân tộc là tài sản vô giá kết tinh qua hàng ngàn năm dựng nước và giữ nước của cha ông. "
        "Trong bối cảnh toàn cầu hóa và cuộc Cách mạng công nghiệp lần thứ tư đang diễn ra mạnh mẽ, việc gìn giữ, bảo tồn và lan tỏa các giá trị di sản này không chỉ là trách nhiệm thiêng liêng mà còn là động lực cốt lõi thúc đẩy ngành công nghiệp văn hóa và kinh tế số tại Việt Nam [1]."
    )
    helper.add_body_p(doc,
        "Bảo tàng Lịch sử Thành phố Hồ Chí Minh (tọa lạc tại số 2 đường Nguyễn Bỉnh Khiêm, phường Bến Nghé, Quận 1, TP.HCM), được xây dựng từ năm 1929 theo phong cách kiến trúc Đông Dương kết hợp nét Á - Âu độc đáo, hiện là một trong những thiết chế văn hóa trọng điểm lưu giữ hơn 40.000 hiện vật, tài liệu và cổ vật quý hiếm [2]. Hệ thống trưng bày của bảo tàng được phân bổ trên 18 gian phòng chuyên đề liên hoàn, phản ánh toàn diện dòng chảy lịch sử Việt Nam từ thời kỳ Tiền sơ sử (văn hóa Đông Sơn, Sa Huỳnh), các nền văn hóa cổ Champa, Óc Eo (Phù Nam), các triều đại phong kiến độc lập (Ngô, Đinh, Tiền Lê, Lý, Trần, Hậu Lê, Tây Sơn, Nguyễn) cho đến các sưu tập tượng Phật giáo châu Á và cổ vật cung đình quý giá."
    )
    helper.add_body_p(doc,
        "Tuy nhiên, qua khảo sát thực tế và phân tích thực trạng hoạt động trưng bày truyền thống, nhóm nghiên cứu nhận thấy còn tồn tại nhiều rào cản và thách thức lớn đối với công chúng:"
    )
    helper.add_bullet_item(doc,
        "Đa số người dân ở các tỉnh thành xa, kiều bào nước ngoài hoặc du khách quốc tế gặp khó khăn trong việc tiếp cận trực tiếp bảo tàng do khoảng cách địa lý và chi phí đi lại.",
        bold_prefix="Rào cản về khoảng cách địa lý và thời gian: "
    )
    helper.add_bullet_item(doc,
        "Nhiều hiện vật có niên đại hàng trăm đến hàng ngàn năm tuổi (như đồ gốm men, tượng gỗ, đồ đồng, trang sức vàng cổ) rất nhạy cảm với độ ẩm, ánh sáng và tiếp xúc cơ học, bắt buộc phải lưu giữ trong tủ kính bảo vệ nghiêm ngặt. Điều này vô tình cản trở khách tham quan quan sát chi tiết đa góc nhìn các đường nét chạm khắc tinh xảo.",
        bold_prefix="Nguy cơ xuống cấp vật lý và hạn chế trưng bày hiện vật: "
    )
    helper.add_bullet_item(doc,
        "Các bảng chú thích hiện vật bằng mica hoặc đồng tại bảo tàng thường ngắn gọn, chỉ hiển thị đơn ngữ hoặc song ngữ cơ bản, thiếu các phương tiện trực quan như thuyết minh âm thanh đa ngôn ngữ (Audio Guide), hình ảnh phóng to 3D và các lộ trình tham quan có định hướng thông minh.",
        bold_prefix="Thiếu hụt trải nghiệm tương tác số và thuyết minh đa ngôn ngữ: "
    )
    helper.add_bullet_item(doc,
        "Quy trình bán vé giấy tại quầy vào các dịp cuối tuần, lễ hội thường xảy ra ùn ứ; việc kiểm soát vé thủ công tốn nhân lực và khó tổng hợp báo cáo lưu lượng khách tham quan theo thời gian thực một cách khoa học.",
        bold_prefix="Phương thức phát hành và kiểm soát vé thủ công: "
    )
    helper.add_body_p(doc,
        "Trước thực tiễn đó, việc nghiên cứu và phát triển một giải pháp toàn diện mang tên “Hệ thống tham quan thực tế ảo 360° & số hóa không gian di sản Bảo tàng Lịch sử TP. Hồ Chí Minh” là một nhiệm vụ cấp thiết, mang tính thời sự cao, nhằm đưa bảo tàng bước vào không gian số, phục vụ đông đảo công chúng một cách trực quan, hiện đại và tiện lợi [3]."
    )
    
    # 1.1.2. Mục tiêu nghiên cứu và phát triển
    helper.add_heading_3(doc, "1.1.2. Mục tiêu nghiên cứu và phát triển")
    helper.add_body_p(doc,
        "Mục tiêu tổng quát của đề tài là ứng dụng các công nghệ tiên tiến nhất về thị giác máy tính, đồ họa không gian 3D WebGL, thuật toán định tuyến đồ thị và dịch vụ đám mây để xây dựng hoàn chỉnh một hệ sinh thái web số hóa không gian di sản có khả năng tương tác cao, phục vụ hai nhóm đối tượng chính: khách tham quan đại chúng và ban quản trị bảo tàng."
    )
    helper.add_body_p(doc, "Các mục tiêu cụ thể bao gồm:")
    helper.add_bullet_item(doc,
        "Nghiên cứu và hiện thực quy trình ghép ảnh toàn cảnh Panorama từ chuỗi khung hình video quét phòng thực tế, áp dụng phép chiếu hình học trụ (Cylindrical Warping), thuật toán trích xuất đặc trưng SIFT, lọc nhiễu RANSAC, cắt mí tối ưu Voronoi và hòa trộn đa dải tần Multiband Blending để tạo ra 18 bức ảnh cầu Equirectangular 360° x 180° đạt độ sắc nét cao của toàn bộ 18 gian phòng trưng bày.",
        bold_prefix="Số hóa không gian 18 gian phòng trưng bày 360°: "
    )
    helper.add_bullet_item(doc,
        "Xây dựng trình diễn không gian 3D tương tác trên nền tảng WebGL (Three.js), cho phép người dùng tự do xoay góc nhìn 360 độ, phóng to/thu nhỏ, kích hoạt các điểm nối chuyển cảnh (Hotspots) để di chuyển giữa các phòng một cách mượt mà.",
        bold_prefix="Không gian thực tế ảo tương tác đa nền tảng: "
    )
    helper.add_bullet_item(doc,
        "Xây dựng sơ đồ mặt bằng điện tử (Mini-map) có định vị vị trí hiện tại của khách tham quan và tích hợp giải thuật tìm đường ngắn nhất Dijkstra để gợi ý lộ trình di chuyển tối ưu giữa 18 phòng theo trình tự niên đại lịch sử.",
        bold_prefix="Định tuyến không gian và tìm đường tối ưu (Dijkstra): "
    )
    helper.add_bullet_item(doc,
        "Số hóa các hiện vật tiêu biểu thành mô hình 3D (.GLB) tương tác xoay đa chiều trên nền web, kèm theo tóm tắt lịch sử và tích hợp bộ thuyết minh âm thanh đa ngôn ngữ (Text-to-Speech) chuẩn xác.",
        bold_prefix="Số hóa cổ vật 3D và thuyết minh âm thanh đa ngôn ngữ: "
    )
    helper.add_bullet_item(doc,
        "Xây dựng phân hệ đặt vé trực tuyến, thanh toán tự động qua mã VietQR (PayOS) kết nối ngân hàng và hệ thống soát vé thông minh bằng camera điện thoại tại cổng bảo tàng.",
        bold_prefix="Hệ thống bán vé trực tuyến và soát vé QR thời gian thực: "
    )
    helper.add_bullet_item(doc,
        "Tích hợp Trợ lý Di sản Ảo AI đóng vai trò như một thuyết minh viên kỹ thuật số am hiểu lịch sử, sẵn sàng giải đáp thắc mắc và giới thiệu các cổ vật đặc sắc cho du khách 24/7.",
        bold_prefix="Tích hợp Trợ lý Di sản Ảo AI thông minh: "
    )
    
    # 1.1.3. Phạm vi giới hạn của đề tài
    helper.add_heading_3(doc, "1.1.3. Phạm vi giới hạn của đề tài")
    helper.add_body_p(doc,
        "Để đảm bảo tính khả thi và chất lượng học thuật cao nhất trong khuôn khổ khóa luận tốt nghiệp, đề tài xác định phạm vi giới hạn nghiên cứu cụ thể như sau:"
    )
    helper.add_bullet_item(doc,
        "Tập trung thực hiện số hóa toàn diện tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh (Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM), bao gồm toàn bộ 18 phòng trưng bày cố định thuộc hệ thống trưng bày chính của bảo tàng.",
        bold_prefix="Phạm vi không gian thực địa: "
    )
    helper.add_bullet_item(doc,
        "Số hóa 17 cổ vật tiêu biểu đại diện cho các thời kỳ lịch sử đặc sắc (Trống đồng Đông Sơn, Tượng Phật Champa, Phù điêu Óc Eo, Chuông đồng, Đĩa gốm thời Lê, Ấn triều Nguyễn...) dưới dạng đĩa xoay tương tác 360 độ và mô hình 3D (.GLB).",
        bold_prefix="Phạm vi đối tượng cổ vật: "
    )
    helper.add_bullet_item(doc,
        "Hệ thống vận hành hoàn toàn trên nền tảng ứng dụng web hiện đại (Responsive Web Application), tương thích tốt trên máy tính để bàn (Desktop), máy tính xách tay (Laptop), máy tính bảng (Tablet) và điện thoại thông minh (Mobile) mà không đòi hỏi người dùng phải cài đặt ứng dụng phụ trợ.",
        bold_prefix="Phạm vi nền tảng công nghệ: "
    )
    helper.add_bullet_item(doc,
        "Hỗ trợ 3 ngôn ngữ chính trong thuyết minh và giao diện: Tiếng Việt, Tiếng Anh và Tiếng Pháp.",
        bold_prefix="Phạm vi ngôn ngữ: "
    )
    
    # 1.1.4. Ý nghĩa khoa học và thực tiễn
    helper.add_heading_3(doc, "1.1.4. Ý nghĩa khoa học và thực tiễn")
    helper.add_body_p(doc,
        "Về mặt khoa học, đề tài đóng góp một quy trình công nghệ hoàn chỉnh kết hợp giữa thị giác máy tính cổ điển (Computer Vision) và đồ họa không gian web hiện đại (WebGL/Three.js). Quy trình ghép ảnh Panorama được giải quyết bài bản từ khâu xử lý biến dạng hình học trụ, khử lệch mí nối đến làm mịn vùng sàn (Nadir), cung cấp tài liệu tham khảo có giá trị cao cho sinh viên và nhà nghiên cứu trong lĩnh vực xử lý ảnh và thực tế ảo."
    )
    helper.add_body_p(doc,
        "Về mặt thực tiễn, sản phẩm hoàn thiện của khóa luận có thể chuyển giao trực tiếp cho Bảo tàng Lịch sử TP.HCM và các đơn vị bảo tồn di sản khác để làm công cụ quảng bá du lịch số, hỗ trợ giáo dục lịch sử cho học sinh - sinh viên và gia tăng nguồn thu thông qua kênh phát hành vé tham quan điện tử minh bạch, văn minh."
    )
    
    # Placeholder Hình 1.1
    helper.add_figure_placeholder(doc, "1.1", 
        "Sơ đồ tư duy tổng quan kiến trúc và các phân hệ hệ thống Bảo tàng 360°",
        "Sơ đồ phân nhánh thể hiện 4 phân hệ chính: Khách tham quan, Quản trị CMS, Công cụ Panorama Studio và Cổng dịch vụ VietQR/AI",
        width_cm=15.0, height_cm=8.0
    )
    
    # 1.2. Đối tượng và phương pháp nghiên cứu
    helper.add_heading_2(doc, "1.2. Đối tượng và phương pháp nghiên cứu")
    
    # 1.2.1. Đối tượng nghiên cứu
    helper.add_heading_3(doc, "1.2.1. Đối tượng nghiên cứu")
    helper.add_body_p(doc,
        "Đối tượng nghiên cứu của đề tài bao gồm:"
    )
    helper.add_bullet_item(doc,
        "Không gian kiến trúc, bố cục ánh sáng và hiện vật lịch sử tại 18 phòng trưng bày của Bảo tàng Lịch sử TP.HCM.",
        bold_prefix="Không gian vật lý và cổ vật: "
    )
    helper.add_bullet_item(doc,
        "Các thuật toán trích xuất đặc trưng (SIFT, ORB), thuật toán tối ưu đường biên ghép mí và các mô hình biểu diễn ảnh toàn cảnh cầu (Equirectangular Projection).",
        bold_prefix="Mô hình toán học và thuật toán xử lý ảnh: "
    )
    helper.add_bullet_item(doc,
        "Các công nghệ phát triển ứng dụng web thời gian thực: WebGL, Three.js, React, Node.js, Express, PostgreSQL, MongoDB, Redis, PayOS VietQR và chuẩn bảo mật JWT.",
        bold_prefix="Công nghệ phần mềm và kiến trúc phân tán: "
    )
    
    # 1.2.2. Phương pháp nghiên cứu và 4 đợt khảo sát thực tế
    helper.add_heading_3(doc, "1.2.2. Phương pháp nghiên cứu và 4 đợt khảo sát thực tế tại Bảo tàng Lịch sử TP.HCM")
    helper.add_body_p(doc,
        "Để đảm bảo đề tài mang tính xác thực cao nhất và bám sát mã nguồn thực tế của dự án, nhóm tác giả đã áp dụng phương pháp nghiên cứu kết hợp giữa lý thuyết và thực nghiệm chuyên sâu qua 4 đợt tác nghiệp trực tiếp tại khuôn viên Bảo tàng Lịch sử TP.HCM:"
    )
    helper.add_bullet_item(doc,
        "Khảo sát sơ đồ mặt bằng thực tế 18 phòng trưng bày (từ thời Tiền sử đến triều Nguyễn và Văn hóa Champa, Óc Eo). Ghi nhận cấu trúc các cửa thông phòng (cửa nào nối sang phòng nào) để làm cơ sở xây dựng ma trận kề cho đồ thị liên thông và thuật toán Dijkstra. Khảo sát vị trí tủ kính trưng bày cổ vật quý và ghi nhận điều kiện ánh sáng thực tế (nhiều phòng ánh sáng tự nhiên yếu, dùng đèn rọi vàng chiếu vào tủ kính dễ gây lóa ảnh).",
        bold_prefix="Đợt 1 — Khảo sát hiện trạng không gian và thiết lập sơ đồ liên thông: "
    )
    helper.add_bullet_item(doc,
        "Dùng điện thoại thông minh thử nghiệm các thao tác quay video lia máy 360 độ và chụp ảnh góc rộng (chế độ 0.5x) tại một số gian phòng đại diện. Chạy thử nghiệm trên mô đun ghép ảnh OpenCV, từng bước khắc phục các lỗi thực tế ghi nhận trong mã nguồn dự án: lệch mí nối góc tường khi lia máy không đều, dính bóng chân người chụp ở vùng sàn nhà (Nadir), và lóa sáng tại điểm có đèn rọi trực tiếp. Hoàn thiện thuật toán làm mịn vùng sàn và cân bằng ánh sáng trong nhà.",
        bold_prefix="Đợt 2 — Thử nghiệm kỹ thuật quay/chụp và tối ưu thuật toán xử lý ảnh: "
    )
    helper.add_bullet_item(doc,
        "Quay video quét toàn cảnh chuẩn cho toàn bộ 18 gian phòng trưng bày theo quy trình đã tối ưu thành công. Chụp ảnh chi tiết đa góc các cổ vật tiêu biểu phục vụ tái tạo mô hình 3D (.GLB). Thu thập đầy đủ tư liệu lịch sử, bảng giới thiệu tại chỗ để làm nội dung thuyết minh âm thanh đa ngôn ngữ và dữ liệu tri thức cho trợ lý ảo AI.",
        bold_prefix="Đợt 3 — Thu thập chính thức dữ liệu không gian 18 phòng và tư liệu cổ vật 3D: "
    )
    helper.add_bullet_item(doc,
        "Sau khi triển khai hệ thống lên máy chủ đám mây (Cloud VPS), nhóm mang thiết bị di động trực tiếp xuống bảo tàng để kiểm thử với tư cách người dùng thực tế. Kiểm tra tốc độ tải các phòng 360 độ và mô hình 3D trên mạng di động 4G tại khuôn viên bảo tàng. Thử nghiệm quy trình thanh toán vé VietQR (PayOS) và dùng camera điện thoại quét mã QR soát vé tại cửa ra vào để kiểm tra độ nhạy của khung ngắm nhận diện mã vé. Đối chiếu bản đồ Mini-map trên web với lộ trình đi lại thực tế của bảo tàng để tinh chỉnh các mũi tên chuyển cảnh và hướng nhìn mặc định sao cho trực quan và chính xác nhất.",
        bold_prefix="Đợt 4 — Thực nghiệm hệ thống trên môi trường thực tế tại khuôn viên bảo tàng: "
    )
    
    # Placeholder Hình 1.2 & 1.3
    helper.add_figure_placeholder(doc, "1.2",
        "Không gian kiến trúc thực địa tại Bảo tàng Lịch sử TP. Hồ Chí Minh",
        "Ảnh chụp thực địa khuôn viên, cổng vào và gian sảnh chính của Bảo tàng Lịch sử TP.HCM trong các đợt khảo sát",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "1.3",
        "Sơ đồ quy trình 4 đợt khảo sát và thu thập dữ liệu di sản tại bảo tàng",
        "Lưu đồ 4 giai đoạn tác nghiệp: Khảo sát hiện trạng -> Thử nghiệm nắn ảnh -> Thu thập dữ liệu chuẩn -> Kiểm thử thực địa",
        width_cm=15.0, height_cm=7.5
    )
    
    # 1.3. Khảo sát và phân tích yêu cầu người dùng
    helper.add_heading_2(doc, "1.3. Khảo sát và phân tích yêu cầu người dùng")
    
    # 1.3.1. Đối tượng người dùng mục tiêu
    helper.add_heading_3(doc, "1.3.1. Đối tượng người dùng mục tiêu")
    helper.add_body_p(doc,
        "Hệ thống hướng tới 3 nhóm đối tượng người dùng chính với các đặc thù nghiệp vụ và nhu cầu tương tác khác nhau:"
    )
    helper.add_bullet_item(doc,
        "Bao gồm công chúng trong nước, học sinh, sinh viên, các nhà nghiên cứu lịch sử và du khách quốc tế. Nhóm đối tượng này đòi hỏi giao diện trực quan, thao tác cảm ứng mượt mà trên điện thoại, tốc độ tải ảnh 360° nhanh và hỗ trợ đa ngôn ngữ.",
        bold_prefix="1. Khách tham quan đại chúng (Visitors): "
    )
    helper.add_bullet_item(doc,
        "Nhân viên quản lý phòng trưng bày, nhân viên soát vé tại cửa và cán bộ bảo tồn. Cần công cụ quản lý danh mục phòng, biên tập Hotspot, soát vé QR bằng camera điện thoại nhanh chóng và xuất báo cáo doanh thu vé chính xác.",
        bold_prefix="2. Ban quản lý và nhân viên bảo tàng (Museum Staff & Admins): "
    )
    helper.add_bullet_item(doc,
        "Kỹ thuật viên phụ trách quay phim, xử lý ảnh và cập nhật dữ liệu số hóa mới khi bảo tàng mở thêm gian trưng bày chuyên đề hoặc trùng tu không gian.",
        bold_prefix="3. Kỹ thuật viên số hóa (Media & Stitching Technicians): "
    )
    
    # 1.3.2. Yêu cầu và kỳ vọng của khách tham quan và bảo tàng
    helper.add_heading_3(doc, "1.3.2. Yêu cầu và kỳ vọng của khách tham quan và bảo tàng")
    helper.add_body_p(doc,
        "Dựa trên kết quả phỏng vấn trực tiếp cán bộ quản lý bảo tàng và khảo sát 120 du khách tham quan trong Đợt 1 và Đợt 4, nhóm nghiên cứu đã tổng hợp các nhu cầu và kỳ vọng cụ thể trong Bảng 1.1 dưới đây:"
    )
    
    # Bảng 1.1
    helper.add_table_caption(doc, "1.1", "Bảng tổng hợp nhu cầu và kỳ vọng của các nhóm đối tượng người dùng")
    tbl_u = doc.add_table(rows=5, cols=3)
    tbl_u.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_u.autofit = False
    helper.set_table_borders(tbl_u, color="475569", sz="6", val="single")
    
    col_w = [Cm(3.5), Cm(6.0), Cm(6.0)]
    r0 = tbl_u.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Nhóm người dùng", "Vấn đề tồn tại thực tế", "Kỳ vọng đối với hệ sinh thái web số"]):
        c = r0.cells[i]
        c.width = col_w[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    u_data = [
        ("Khách tham quan đại chúng (Học sinh, sinh viên, người dân)",
         "Không có điều kiện đến bảo tàng trực tiếp; bảng chú thích bằng mica khó đọc; khó hình dung không gian tổng thể.",
         "Muốn tham quan 360 độ từ xa chân thực; xoay ngắm cổ vật 3D; nghe thuyết minh tự động; tìm kiếm đường đi nhanh trên bản đồ."),
        ("Du khách quốc tế (Nước ngoài)",
         "Bất đồng ngôn ngữ; các bài giới thiệu hiện vật hạn chế bản dịch tiếng Anh và tiếng Pháp; việc mua vé tiền mặt bất tiện.",
         "Cung cấp giao diện đa ngôn ngữ (Anh/Pháp); tích hợp giọng đọc TTS chuẩn; hỗ trợ thanh toán vé online nhanh chóng."),
        ("Nhân viên soát vé và quản lý bảo tàng",
         "Soát vé giấy thủ công dễ nhầm lẫn; dễ xảy ra tình trạng quay vòng vé; khó thống kê doanh thu tức thời.",
         "Ứng dụng quét mã QR trực tiếp trên camera điện thoại; tự động hủy vé đã dùng; dashboard thống kê doanh thu theo ngày/tháng."),
        ("Kỹ thuật viên số hóa bảo tàng",
         "Phần mềm ghép ảnh Panorama thương mại đắt đỏ; quy trình cấu hình Hotspot thủ công phức tạp.",
         "Công cụ Panorama Studio trực quan tích hợp ngay trên web; tự động lọc khung hình nét; trực tiếp xuất ảnh vào phòng 360°.")
    ]
    for idx, (grp, prob, exp) in enumerate(u_data):
        row = tbl_u.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([grp, prob, exp]):
            c = row.cells[i]
            c.width = col_w[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_u.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    # 1.4. Công nghệ và công cụ sử dụng
    helper.add_heading_2(doc, "1.4. Công nghệ và công cụ sử dụng")
    helper.add_body_p(doc,
        "Để hiện thực hóa các yêu cầu trên, hệ thống sử dụng một tập hợp các công nghệ và công cụ kỹ thuật hiện đại, phân chia theo từng tầng kiến trúc được tổng hợp trong Bảng 1.2:"
    )
    
    # Bảng 1.2
    helper.add_table_caption(doc, "1.2", "Bảng danh mục công nghệ và công cụ sử dụng trong toàn bộ đề tài")
    tbl_t = doc.add_table(rows=6, cols=3)
    tbl_t.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_t.autofit = False
    helper.set_table_borders(tbl_t, color="475569", sz="6", val="single")
    
    col_w2 = [Cm(3.5), Cm(4.5), Cm(7.5)]
    r0 = tbl_t.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Phân hệ / Tầng", "Công nghệ & Thư viện", "Mục đích sử dụng chính trong đề tài"]):
        c = r0.cells[i]
        c.width = col_w2[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    t_data = [
        ("Frontend Client & Admin", "React 18, TypeScript, TailwindCSS, Lucide Icons", "Xây dựng giao diện đơn trang (SPA) phản hồi nhanh, tối ưu hóa hiển thị linh hoạt trên cả desktop và mobile."),
        ("Đồ họa không gian 3D & 360°", "Three.js (WebGL), SphereGeometry, OrbitControls", "Khởi tạo môi trường hình cầu 3D, ánh xạ ảnh Equirectangular 360°, điều khiển góc nhìn và vẽ điểm nối Hotspots tương tác."),
        ("Backend & Dịch vụ API", "Node.js (v20+), Express.js, TypeScript", "Xây dựng hệ thống RESTful API bất đồng bộ, xử lý logic thanh toán, xác thực quyền JWT và quản lý dữ liệu bảo tàng."),
        ("Cơ sở dữ liệu & Caching", "PostgreSQL (Prisma ORM), MongoDB (Mongoose), Redis", "Lưu trữ lai: PostgreSQL cho vé/đơn hàng/giao dịch; MongoDB cho không gian 18 phòng/cổ vật/hotspot; Redis lưu cache tốc độ cao."),
        ("Thanh toán & Soát vé QR", "PayOS (VietQR NAPAS), HTML5-QRCode, Crypto SHA-256", "Tạo mã QR thanh toán ngân hàng tự động; quét mã vé trực tiếp bằng camera trên điện thoại di động thông minh.")
    ]
    for idx, (layer, tech, purp) in enumerate(t_data):
        row = tbl_t.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([layer, tech, purp]):
            c = row.cells[i]
            c.width = col_w2[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_t.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 1.5. Yêu cầu chức năng của hệ thống
    helper.add_heading_2(doc, "1.5. Yêu cầu chức năng của hệ thống")
    helper.add_body_p(doc,
        "Yêu cầu chức năng của hệ thống được chia thành 3 nhóm phân hệ chính, đảm bảo đáp ứng đầy đủ chu trình nghiệp vụ từ khâu số hóa đến khâu phục vụ khách tham quan (Bảng 1.3):"
    )
    
    # Bảng 1.3
    helper.add_table_caption(doc, "1.3", "Bảng phân loại yêu cầu chức năng theo từng phân hệ hệ thống")
    tbl_f = doc.add_table(rows=4, cols=3)
    tbl_f.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_f.autofit = False
    helper.set_table_borders(tbl_f, color="475569", sz="6", val="single")
    
    col_wf = [Cm(3.0), Cm(3.2), Cm(9.3)]
    r0 = tbl_f.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Mã phân hệ", "Tên phân hệ", "Danh sách các chức năng nghiệp vụ cốt lõi"]):
        c = r0.cells[i]
        c.width = col_wf[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    f_data = [
        ("FR-VISITOR", "Phân hệ Khách tham quan", 
         "1. Khám phá 18 phòng trưng bày 360 độ tương tác;\n2. Chuyển phòng mượt mà thông qua Hotspots;\n3. Xem chi tiết và xoay mô hình cổ vật 3D;\n4. Nghe thuyết minh âm thanh đa ngôn ngữ (Việt/Anh/Pháp);\n5. Tìm lộ trình tham quan tối ưu trên bản đồ bảo tàng (Dijkstra);\n6. Trò chuyện và hỏi đáp cùng Trợ lý ảo AI;\n7. Đặt vé trực tuyến và thanh toán tự động qua VietQR PayOS;\n8. Tra cứu và tải vé điện tử chứa mã QR bảo mật."),
        ("FR-ADMIN", "Phân hệ Quản trị CMS", 
         "1. Quản lý danh mục 18 gian phòng 360° (Thêm/Sửa/Xóa);\n2. Cấu hình tọa độ Hotspot và thiết lập liên kết phòng;\n3. Quản lý tư liệu cổ vật, hình ảnh và mô hình 3D (.GLB);\n4. Quản lý loại vé, thiết lập giá và giới hạn số lượng;\n5. Quản lý đơn hàng và theo dõi trạng thái thanh toán VietQR;\n6. Soát vé khách tham quan bằng Camera quét mã QR thời gian thực;\n7. Quản lý nhận diện thương hiệu CMS (Logo, Banner, Slogan);\n8. Điều khiển bật/tắt chế độ bảo trì hệ thống (Maintenance Mode)."),
        ("FR-STUDIO", "Phân hệ Ghép ảnh Panorama", 
         "1. Tải lên video quét phòng toàn cảnh hoặc chuỗi ảnh góc rộng;\n2. Tự động trích xuất khung hình và lọc ảnh mờ nhòe (Laplacian);\n3. Thực hiện nắn chỉnh biến dạng hình học trụ (Cylindrical Warping);\n4. Trích xuất đặc trưng SIFT và khớp cặp ảnh bằng RANSAC;\n5. Cắt mí tối ưu và hòa trộn đa dải tần (Laplacian Pyramid);\n6. Xử lý xóa bóng chân máy vùng sàn (Nadir Inpainting);\n7. Xuất ảnh toàn cảnh cầu Equirectangular 2:1 và đồng bộ trực tiếp vào hệ thống 360°.")
    ]
    for idx, (code, name, funcs) in enumerate(f_data):
        row = tbl_f.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([code, name, funcs]):
            c = row.cells[i]
            c.width = col_wf[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_f.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=80, bottom=80, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 1.6. Yêu cầu phi chức năng của hệ thống
    helper.add_heading_2(doc, "1.6. Yêu cầu phi chức năng của hệ thống")
    helper.add_body_p(doc,
        "Bên cạnh các tính năng nghiệp vụ, hệ thống bắt buộc phải thỏa mãn các tiêu chuẩn nghiêm ngặt về chất lượng kỹ thuật phần mềm, khả năng mở rộng và độ an toàn thông tin (Bảng 1.4):"
    )
    
    # Bảng 1.4
    helper.add_table_caption(doc, "1.4", "Bảng đặc tả các chỉ tiêu yêu cầu phi chức năng của hệ thống")
    tbl_nf = doc.add_table(rows=6, cols=3)
    tbl_nf.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_nf.autofit = False
    helper.set_table_borders(tbl_nf, color="475569", sz="6", val="single")
    
    col_wnf = [Cm(3.2), Cm(4.0), Cm(8.3)]
    r0 = tbl_nf.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Nhóm chỉ tiêu", "Tiêu chuẩn kỹ thuật", "Yêu cầu định lượng cụ thể"]):
        c = r0.cells[i]
        c.width = col_wnf[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    nf_data = [
        ("Hiệu năng (Performance)", "Thời gian phản hồi & Tốc độ tải", 
         "Thời gian tải ảnh 360° ban đầu < 2.0 giây trên mạng 4G; thời gian phản hồi API < 200ms; duy trì tốc độ khung hình rendering 3D > 50 FPS."),
        ("Khả năng chịu tải (Scalability)", "Tải đồng thời (Concurrency)", 
         "Hệ thống chịu tải ổn định tối thiểu 200–500 người dùng đồng thời (Concurrent Users) với tỷ lệ lỗi < 0.5%."),
        ("Bảo mật (Security)", "Mã hóa & Xác thực an toàn", 
         "Xác thực phân quyền qua JWT; mã hóa vé bằng chữ ký số SHA-256; bảo vệ thông tin giao dịch ngân hàng theo chuẩn webhook PayOS; áp dụng HTTPS/TLS 1.3."),
        ("Tính khả dụng (Usability)", "Trải nghiệm & Khả năng tiếp cận", 
         "Giao diện chuẩn Responsive chạy tốt trên desktop/mobile; hỗ trợ đa ngôn ngữ; tương thích với màn hình cảm ứng điện thoại thông minh."),
        ("Tính sẵn sàng (Availability)", "Độ ổn định & Sao lưu", 
         "Hệ thống đạt chỉ số sẵn sàng 99.5%; hỗ trợ cơ chế tự phục hồi container Docker và sao lưu cơ sở dữ liệu định kỳ hàng ngày.")
    ]
    for idx, (grp, std, req) in enumerate(nf_data):
        row = tbl_nf.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([grp, std, req]):
            c = row.cells[i]
            c.width = col_wnf[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_nf.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    doc.add_page_break()
    print("Chapter 1 added successfully.")
