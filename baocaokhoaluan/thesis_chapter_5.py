# -*- coding: utf-8 -*-
"""
CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
Báo cáo Khóa luận Tốt nghiệp - IUH
"""

from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_5(doc, helpers):
    add_heading_1 = helpers['add_heading_1']
    add_heading_2 = helpers['add_heading_2']
    add_heading_3 = helpers['add_heading_3']
    add_body_p = helpers['add_body_p']
    add_figure_placeholder = helpers['add_figure_placeholder']
    add_custom_table = helpers['add_custom_table']

    # -------------------------------------------------------------------------
    # TIÊU ĐỀ CHƯƠNG 5
    # -------------------------------------------------------------------------
    add_heading_1(doc, "CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    add_body_p(doc, 
        "Trải qua quá trình nghiên cứu, khảo sát thực tế và triển khai công nghệ nghiêm túc trong suốt thời "
        "gian thực hiện đề tài khóa luận tốt nghiệp, nhóm nghiên cứu đã hoàn thành việc xây dựng và đưa vào vận hành thử nghiệm "
        "thành công 'Hệ thống tham quan thực tế ảo 360° và số hóa không gian di sản tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh'. "
        "Chương này tổng kết toàn diện các kết quả cụ thể mà đề tài đã đạt được, phân tích thẳng thắn những khó khăn, hạn chế "
        "còn tồn tại trong điều kiện thực tiễn, đồng thời đề xuất các định hướng nghiên cứu và mở rộng công nghệ đầy triển vọng "
        "trong giai đoạn tiếp theo [1], [2], [28].")

    # -------------------------------------------------------------------------
    # 5.1. KẾT QUẢ ĐẠT ĐƯỢC CỦA ĐỀ TÀI
    # -------------------------------------------------------------------------
    add_heading_2(doc, "5.1. Kết quả đạt được của đề tài")

    add_body_p(doc, 
        "Đề tài đã bám sát các mục tiêu nghiên cứu và yêu cầu kỹ thuật đề ra ban đầu, hiện thực hóa một giải pháp công nghệ "
        "số hóa di sản toàn diện, kết hợp chặt chẽ giữa học thuật xử lý ảnh, đồ họa máy tính tương tác, kỹ thuật phần mềm hiện đại "
        "và nghiệp vụ văn hóa - bảo tàng. Các kết quả cụ thể đạt được được phân loại theo hai khía cạnh: công nghệ - học thuật "
        "và ứng dụng thực tiễn [1], [7], [18].")

    add_heading_3(doc, "5.1.1. Về mặt nghiên cứu lý thuyết và giải pháp công nghệ")

    add_body_p(doc, 
        "1. Làm chủ chuỗi thuật toán xử lý ảnh ghép nối toàn cảnh (Panoramic Image Stitching Pipeline): "
        "Nhóm nghiên cứu đã tìm hiểu sâu sắc cơ sở toán học và thị giác máy tính đằng sau các thuật toán SIFT (Scale-Invariant "
        "Feature Transform), Cylindrical Warping, RANSAC (Random Sample Consensus), Voronoi Seam Cutting và Multi-band "
        "Laplacian Pyramid Blending. Trên cơ sở đó, nhóm đã xây dựng thành công công cụ Studio tạo ảnh 360° tích hợp trực tiếp "
        "trong phân hệ quản trị, cho phép tự động hoặc bán tự động ghép nối các bức ảnh chụp đơn lẻ thành ảnh toàn cảnh chất lượng "
        "cao mà không phụ thuộc vào các phần mềm thương mại đắt tiền [3], [5], [6].")

    add_body_p(doc, 
        "2. Xây dựng không gian tương tác thực tế ảo 360° WebGL hiệu năng cao: "
        "Ứng dụng thành công thư viện Three.js với kiến trúc hình cầu đảo ngược (Inverted Sphere Geometry), ánh xạ tọa độ cầu "
        "(Spherical Coordinates) sang kinh độ - vĩ độ (Yaw - Pitch) để điều khiển góc nhìn tự nhiên. Hệ thống được tối ưu hóa "
        "bộ nhớ GPU buffer, tích hợp cơ chế nén WebP và progressive image loading, đảm bảo duy trì tốc độ hiển thị khung hình "
        "ổn định 60 khung hình/giây (FPS) ngay trên trình duyệt web thông thường mà không đòi hỏi thiết bị cấu hình chuyên dụng [7], [8].")

    add_body_p(doc, 
        "3. Tích hợp giải thuật Dijkstra tối ưu lộ trình tham quan 18 gian phòng: "
        "Mô hình hóa toàn bộ mặt bằng bảo tàng thành đồ thị không gian có trọng số gồm 18 đỉnh và 34 cạnh liên thông. "
        "Hệ thống tính toán tức thời tuyến đường ngắn nhất giữa hai vị trí bất kỳ, hiển thị chỉ dẫn trực quan trên bản đồ vector "
        "Floorplan và điều hướng thông minh qua các điểm liên kết (hotspots), giải quyết triệt để tình trạng khách tham quan bị "
        "mất phương hướng trong các tòa nhà kiến trúc cổ có cấu trúc phức tạp [9], [10].")

    add_body_p(doc, 
        "4. Kiến trúc hệ thống lai (Hybrid Architecture) hiện đại và bền vững: "
        "Thiết kế và triển khai thành công hệ thống kết hợp giữa PostgreSQL (đảm bảo tính toàn vẹn ACID cho giao dịch vé, tài chính) "
        "và MongoDB (lưu trữ linh hoạt cấu trúc phi cấu trúc của dữ liệu hiện vật, ảnh 360°, tọa độ hotspot đa phương tiện), có "
        "Redis đệm dữ liệu truy vấn giúp giảm thời gian phản hồi API trung bình xuống dưới 120ms [12], [13], [14].")

    add_body_p(doc, 
        "5. Tự động hóa thanh toán trực tuyến VietQR chuẩn Ngân hàng Nhà nước và kiểm soát vé thông minh: "
        "Tích hợp thành công cổng thanh toán PayOS theo tiêu chuẩn VietQR NAPAS 247, xử lý phản hồi Webhook tức thì với chữ ký điện tử "
        "bảo mật HMAC-SHA256. Hệ thống tự động tạo vé điện tử kèm mã QR mã hóa AES-256 gửi qua email khách hàng. Đồng thời, "
        "phân hệ soát vé bằng camera trình duyệt web qua thư viện html5-qrcode cho phép nhân viên bảo tàng quét và đối soát vé "
        "chỉ trong 0,3 - 0,5 giây, loại bỏ hoàn toàn tình trạng vé giả hoặc sử dụng lại vé đã quét [16], [17], [22].")

    add_body_p(doc, 
        "6. Phát triển Trợ lý Di sản Ảo AI tương tác đa ngôn ngữ: "
        "Ứng dụng mô hình ngôn ngữ lớn (LLM) kết hợp hệ thống dữ liệu đặc thù của bảo tàng để xây dựng trợ lý AI có khả năng giải đáp "
        "lịch sử chính xác, gợi ý phòng tham quan, cung cấp thông tin giờ mở cửa và giá vé, hỗ trợ 3 ngôn ngữ chính: Tiếng Việt, "
        "Tiếng Anh và Tiếng Nhật [25], [26].")

    add_heading_3(doc, "5.1.2. Về mặt ứng dụng thực tiễn và tác động xã hội")

    add_body_p(doc, 
        "1. Hoàn thành số hóa toàn diện 18 không gian trưng bày chuyên đề: "
        "Nhóm đã thực hiện thành công 4 đợt khảo sát thực địa nghiêm ngặt tại Bảo tàng Lịch sử TP.HCM (số 2 Nguyễn Bỉnh Khiêm, "
        "Phường Bến Nghé, Quận 1), thu thập và xử lý hơn 100 bức ảnh toàn cảnh 360° độ phân giải 8K, số hóa 17 hiện vật 3D quý hiếm, "
        "và biên tập nội dung thuyết minh song ngữ cho hàng trăm bảo vật tiêu biểu [1], [2].")

    add_body_p(doc, 
        "2. Đưa hệ thống vào vận hành thử nghiệm trên môi trường Internet thực tế: "
        "Hệ thống đã được đóng gói container hóa qua Docker, thiết lập Reverse Proxy Nginx bảo mật HTTPS qua chứng chỉ Let's Encrypt "
        "và vận hành trực tuyến 24/7 trên máy chủ VPS đám mây tại địa chỉ tên miền chính thức: https://museumhcm.duckdns.org. "
        "Du khách trong và ngoài nước có thể truy cập dễ dàng bằng bất kỳ trình duyệt web hiện đại nào trên máy tính để bàn, "
        "máy tính bảng hoặc điện thoại thông minh mà không cần cài đặt thêm bất kỳ ứng dụng nào [18], [24].")

    add_body_p(doc, 
        "3. Đóng góp thiết thực vào chiến lược chuyển đổi số di sản văn hóa quốc gia: "
        "Sản phẩm của đề tài là minh chứng rõ nét cho khả năng ứng dụng công nghệ thông tin tiên tiến để bảo tồn, quảng bá và "
        "lan tỏa các giá trị văn hóa - lịch sử ngàn năm của dân tộc Việt Nam đến với công chúng trẻ và bạn bè quốc tế một cách "
        "trực quan, hấp dẫn và dễ tiếp cận nhất [1], [28].")

    # -------------------------------------------------------------------------
    # 5.2. KHÓ KHĂN VÀ HẠN CHẾ GẶP PHẢI
    # -------------------------------------------------------------------------
    add_heading_2(doc, "5.2. Khó khăn và hạn chế gặp phải")

    add_body_p(doc, 
        "Bên cạnh những kết quả đạt được rất đáng khích lệ, trong suốt quá trình triển khai thực tế từ khảo sát, thu thập dữ liệu "
        "đến lập trình và thử nghiệm hiệu năng, nhóm nghiên cứu cũng đã gặp phải không ít khó khăn, thách thức xuất phát từ cả "
        "yếu tố khách quan của môi trường bảo tàng và giới hạn tài nguyên kỹ thuật [1], [7]:")

    add_body_p(doc, 
        "1. Khó khăn về điều kiện ánh sáng và quang học tại thực địa bảo tàng: "
        "Không gian trưng bày trong các tòa nhà cổ của Bảo tàng Lịch sử TP.HCM có trần cao, nhiều gian phòng sử dụng ánh sáng nhân tạo "
        "với đèn rọi điểm (spotlight) màu vàng ấm để bảo quản hiện vật nhạy cảm với ánh sáng, đồng thời tạo ra các vùng sáng - tối "
        "có độ tương phản rất cao (High Dynamic Range). Ngoài ra, phần lớn hiện vật quý được đặt bên trong các tủ kính bảo vệ "
        "khiến hiện tượng phản chiếu ánh sáng đèn và khúc xạ qua lớp kính xuất hiện dày đặc, gây khó khăn lớn cho việc cân bằng màu "
        "và tách bóng trong quá trình ghép ảnh 360° cũng như chụp ảnh photogrammetry tái tạo 3D [2], [4].")

    add_body_p(doc, 
        "2. Thách thức về dung lượng truyền tải dữ liệu ảnh 360° độ phân giải siêu cao (8K): "
        "Mỗi bức ảnh toàn cảnh dạng Equirectangular chuẩn 8K (8192 x 4096 pixel) chưa nén có dung lượng lên đến 25MB - 45MB. "
        "Mặc dù nhóm đã áp dụng định dạng WebP hiện đại và kỹ thuật progressive image loading, nhưng khi người dùng truy cập bằng "
        "thiết bị di động qua mạng 3G/4G có đường truyền chập chờn, thời gian nạp ban đầu cho bức ảnh đầu tiên đôi khi vẫn mất "
        "từ 1,5 đến 3 giây, gây ảnh hưởng cục bộ đến cảm giác tức thời của trải nghiệm người dùng [7], [24].")

    add_body_p(doc, 
        "3. Không gian chụp bị hạn chế và góc khuất kiến trúc: "
        "Một số gian phòng trưng bày có lối đi hẹp hoặc bố trí tủ trưng bày sát tường khiến khoảng cách tối thiểu giữa máy ảnh "
        "và vật thể xung quanh rất gần (dưới 1 mét), làm tăng hiện tượng thị sai (parallax error) tại các góc nối. Mặc dù thuật toán "
        "Voronoi Seam Cutting đã xử lý tốt phần lớn các mối nối, nhưng tại một số chi tiết gạch nền nhà hoa văn lặp lại hoặc "
        "khi có bóng du khách di chuyển thoáng qua, vết nối vẫn có thể nhận thấy nếu quan sát rất kỹ [3], [5].")

    add_body_p(doc, 
        "4. Giới hạn về thiết bị và công nghệ quét 3D chuyên dụng: "
        "Do điều kiện ngân sách đề tài sinh viên, nhóm chưa có điều kiện tiếp cận các máy quét 3D Laser Scanner công nghiệp chuyên dụng "
        "(như Faro hay Leica). Việc số hóa cổ vật 3D hiện tại chủ yếu dựa trên kỹ thuật Photogrammetry qua camera quang học kết hợp "
        "xử lý hậu kỳ phần mềm, nên đối với các hiện vật có bề mặt kim loại bóng loáng (đồ đồng mạ vàng, vũ khí sáng bóng) hoặc "
        "hiện vật kích thước lớn nằm cố định trong tủ kính kín không thể chụp đủ góc đáy 360°, việc tái dựng mô hình lưới 3D "
        "vẫn còn gặp nhiều hạn chế [8], [27].")

    # -------------------------------------------------------------------------
    # 5.3. HƯỚNG PHÁT TRIỂN VÀ MỞ RỘNG TRONG TƯƠNG LAI
    # -------------------------------------------------------------------------
    add_heading_2(doc, "5.3. Hướng phát triển và mở rộng trong tương lai")

    add_body_p(doc, 
        "Nhằm nâng tầm sản phẩm đề tài từ một mô hình thử nghiệm đồ án tốt nghiệp trở thành một nền tảng chuyển đổi số di sản văn hóa "
        "hoàn chỉnh, có giá trị thương mại hóa và ứng dụng sâu rộng trong ngành bảo tàng Việt Nam, nhóm nghiên cứu đề xuất một số "
        "hướng nghiên cứu, cải tiến và mở rộng công nghệ quan trọng trong tương lai [1], [8], [28]:")

    add_body_p(doc, 
        "1. Nâng cấp trải nghiệm thực tế ảo sâu qua công nghệ WebXR và thiết bị đeo (VR Headsets): "
        "Tích hợp chuẩn WebXR Device API vào hệ thống Three.js để cho phép người dùng đeo các thiết bị kính thực tế ảo độc lập "
        "(như Meta Quest 3, Apple Vision Pro, hoặc các loại kính gắn smartphone cơ bản). Người dùng sẽ không chỉ xoay nhìn 360° "
        "mà còn có thể dùng tay điều khiển (controllers/hand tracking) để cầm nắm, xoay lật và quan sát hiện vật 3D trong không "
        "gian ba chiều hoàn toàn tự nhiên, tạo cảm giác như đang trực tiếp đứng trong khuôn viên bảo tàng [7], [8].")

    add_body_p(doc, 
        "2. Nghiên cứu và ứng dụng công nghệ 3D Gaussian Splatting (3DGS) và NeRF (Neural Radiance Fields): "
        "Chuyển dịch từ mô hình ảnh tĩnh 360° sang công nghệ tái tạo trường quang học thần kinh (Radiance Fields) và 3D Gaussian Splatting. "
        "Công nghệ này cho phép tái tạo không gian bảo tàng với độ chân thực quang học cực đại, tái hiện chính xác hiện tượng phản chiếu ánh sáng, "
        "độ trong suốt của tủ kính và cho phép người dùng di chuyển tự do 6 bậc tự do (6-DoF) trong gian phòng chứ không bị giới hạn "
        "tại các điểm đặt camera cố định [27], [28].")

    add_body_p(doc, 
        "3. Phát triển tính năng Nhận diện hiện vật tức thời qua Camera thông minh (Visual AI Search & AR Markerless): "
        "Xây dựng ứng dụng di động hoặc tích hợp trực tiếp Web Camera AI, sử dụng mô hình học sâu thị giác (Vision Deep Learning) "
        "như YOLOv8 hoặc MobileNet đã được huấn luyện trên tập dữ liệu hiện vật của bảo tàng. Khách tham quan trực tiếp tại bảo tàng "
        "chỉ cần hướng camera điện thoại về phía bất kỳ bảo vật nào, hệ thống sẽ tự động nhận diện và hiển thị lớp nhãn thông tin AR "
        "nổi trên màn hình, phát thuyết minh âm thanh tự động tương ứng mà không cần phải quét mã QR vật lý [1], [25].")

    add_body_p(doc, 
        "4. Tối ưu hóa tải ảnh đa phân giải động (Dynamic Multiresolution Tiled Panorama): "
        "Phát triển cơ chế chia nhỏ ảnh toàn cảnh 8K thành các ô lưới (tiles) đa tầng phân giải theo định dạng Deep Zoom / Marzipano. "
        "Trình duyệt chỉ tải về các mảnh ảnh nằm đúng trong góc nhìn (Field of View) hiện tại của người dùng với độ phân giải phù hợp, "
        "giúp giảm tải dung lượng mạng ban đầu xuống chỉ còn dưới 500KB và nâng tốc độ hiển thị tức thì ngay cả trên kết nối mạng yếu [7], [24].")

    add_body_p(doc, 
        "5. Mở rộng kiến trúc Đa Bảo tàng (Multi-Tenant & Multi-Museum Platform): "
        "Hoàn thiện hệ sinh thái quản trị đa bảo tàng đã được thiết kế sẵn trong cơ sở dữ liệu, cho phép các bảo tàng di sản khác "
        "(như Bảo tàng Chứng tích Chiến tranh, Bảo tàng Mỹ thuật TP.HCM, Bảo tàng Cố đô Huế, Bảo tàng Điêu khắc Chăm Đà Nẵng) "
        "có thể đăng ký và tự khởi tạo không gian số hóa riêng của mình trên nền tảng dùng chung, chia sẻ hạ tầng đám mây và kết nối "
        "thành Mạng lưới Di sản Số Quốc gia thống nhất [1], [2], [28].")

    add_body_p(doc, 
        "Tóm lại, đề tài đã đạt được các mục tiêu khoa học và thực tiễn đề ra, xây dựng thành công một giải pháp công nghệ toàn diện "
        "cho công tác số hóa và quảng bá di sản lịch sử văn hóa. Những kết quả thu được không chỉ có ý nghĩa học thuật trong việc "
        "ứng dụng thị giác máy tính và công nghệ web hiện đại, mà còn mở ra triển vọng to lớn trong việc bảo tồn và đưa các giá trị "
        "di sản vô giá của dân tộc đến gần hơn với đông đảo quần chúng nhân dân trong kỷ nguyên chuyển đổi số quốc gia.")

    print("Added Chapter 5 successfully.")
