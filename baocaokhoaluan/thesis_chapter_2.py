from docx.shared import Inches, Pt, RGBColor, Cm
# -*- coding: utf-8 -*-
"""
CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG
Phân tích sâu sắc quang học hình học, phép chiếu trụ, SIFT, RANSAC, Multiband Blending,
Three.js WebGL, giải thuật Dijkstra, Photogrammetry 3D, kiến trúc Node/Postgres/Mongo/Redis/PayOS.
"""

from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def add_chapter_2(doc, helper):
    """Xây dựng toàn bộ nội dung Chương 2."""
    
    # Tiêu đề Chương 2
    p_c2 = helper.add_heading_1(doc, "CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ NỀN TẢNG")
    p_c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # 2.1. Cơ sở lý thuyết thị giác máy tính và không gian 360°
    helper.add_heading_2(doc, "2.1. Cơ sở lý thuyết thị giác máy tính và không gian 360°")
    
    # 2.1.1. Khái niệm ảnh Panorama toàn cảnh và hệ tọa độ cầu Equirectangular
    helper.add_heading_3(doc, "2.1.1. Khái niệm ảnh Panorama toàn cảnh và hệ tọa độ cầu Equirectangular")
    helper.add_body_p(doc,
        "Ảnh toàn cảnh (Panorama) là dạng ảnh chụp có trường nhìn quang học (Field of View - FOV) mở rộng vượt trội so với trường nhìn thông thường của mắt người (khoảng 120° x 60°) hoặc ống kính máy ảnh tiêu chuẩn (khoảng 60° đến 90°). "
        "Trong lĩnh vực thực tế ảo di sản, chuẩn ảnh toàn cảnh cầu hoàn chỉnh (Spherical Equirectangular Panorama) biểu diễn toàn bộ không gian xung quanh một điểm quan sát với góc mở ngang 360° và góc mở đứng 180° [4]."
    )
    helper.add_body_p(doc,
        "Định dạng Equirectangular ánh xạ mặt cầu không gian 3D lên một mặt phẳng 2D có tỷ lệ khung hình chuẩn 2:1 (chiều dài gấp đôi chiều cao, ví dụ 8192 x 4096 pixels hoặc 4096 x 2048 pixels). "
        "Hệ tọa độ cầu được xác định bởi góc kinh độ ngang theta trong khoảng [-pi, pi] và góc vĩ độ đứng phi trong khoảng [-pi/2, pi/2]. "
        "Mối quan hệ ánh xạ giữa tọa độ pixel phẳng (x, y) trên ảnh có chiều rộng W và chiều cao H với tọa độ góc cầu được mô hình hóa bằng hệ phương trình toán học:"
    )
    helper.add_equation(doc, "θ = (x / W - 0.5) · 2π", "2.1")
    helper.add_equation(doc, "φ = (0.5 - y / H) · π", "2.2")
    helper.add_body_p(doc,
        "Ngược lại, từ một điểm tọa độ không gian 3D bất kỳ P(X, Y, Z) nằm trên bề mặt hình cầu đơn vị (X^2 + Y^2 + Z^2 = 1), tọa độ pixel tương ứng trên ảnh Equirectangular được suy biến thông qua hàm lượng giác nghịch đảo:"
    )
    helper.add_equation(doc, "x = W · (arctan2(X, Z) / (2π) + 0.5)", "2.3")
    helper.add_equation(doc, "y = H · (0.5 - arcsin(Y) / π)", "2.4")
    helper.add_body_p(doc,
        "Đặc điểm cốt lõi của phép chiếu Equirectangular là các đường kinh tuyến là những đường thẳng đứng song song cách đều nhau, trong khi các cực cầu (Zenith - đỉnh đầu và Nadir - đáy sàn) bị kéo giãn biến dạng tối đa theo phương ngang. Do đó, việc xử lý ảnh Panorama đòi hỏi các phép chiếu trung gian để tránh hiện tượng méo hình khi ghép nối [4], [11]."
    )
    
    # Placeholder Hình 2.1
    helper.add_figure_placeholder(doc, "2.1",
        "Mô hình hệ tọa độ cầu Equirectangular (360° x 180°) và hệ tọa độ ảnh phẳng",
        "Sơ đồ hình học minh họa phép ánh xạ từ mặt cầu không gian 3D sang bề mặt ảnh phẳng tỷ lệ 2:1",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.2. Phép chiếu trụ (Cylindrical Projection & Warping)
    helper.add_heading_3(doc, "2.1.2. Phép chiếu trụ (Cylindrical Projection & Warping)")
    helper.add_body_p(doc,
        "Khi người quay phim cầm máy quay quét phòng theo phương ngang quanh một trục thẳng đứng cố định, các bức ảnh chụp phẳng (Planar Perspective Images) từ camera điện thoại thông thường sẽ xuất hiện biến dạng phối cảnh nếu xếp cạnh nhau đơn thuần. "
        "Để các bức ảnh liên tiếp có thể ghép nối mượt mà và chuyển đổi thuần túy thành chuyển động tịnh tiến tịnh tiến (Pure Translation), kỹ thuật nắn ảnh lên bề mặt hình trụ (Cylindrical Warping) bắt buộc phải được áp dụng [4], [11]."
    )
    helper.add_body_p(doc,
        "Giả sử camera có tiêu cự f (được chuẩn hóa theo kích thước pixel) và tâm quang học nằm tại gốc tọa độ ảnh (x_c, y_c). Một điểm ảnh phẳng có tọa độ (x_p, y_p) khi được chiếu uốn cong lên mặt trụ có bán kính bằng tiêu cự f sẽ có tọa độ trụ (x_cyl, y_cyl) được tính theo công thức:"
    )
    helper.add_equation(doc, "x_cyl = f · arctan((x_p - x_c) / f)", "2.5")
    helper.add_equation(doc, "y_cyl = f · (y_p - y_c) / √((x_p - x_c)² + f²)", "2.6")
    helper.add_body_p(doc,
        "Trong chiều biến đổi ngược (Inverse Mapping) phục vụ nội suy màu pixel (Bilinear Interpolation) để tránh hiện tượng răng cưa hoặc đứt gãy ảnh, tọa độ pixel gốc được tính ngược lại từ tọa độ trụ:"
    )
    helper.add_equation(doc, "x_p = f · tan(x_cyl / f) + x_c", "2.7")
    helper.add_equation(doc, "y_p = (y_cyl / f) · √((x_p - x_c)² + f²) + y_c", "2.8")
    helper.add_body_p(doc,
        "Sau phép chiếu trụ, toàn bộ các vật thể trong ảnh được đưa về cùng một tỷ lệ hình học theo phương ngang, giúp thuật toán dò tìm chuyển động có thể tính toán chính xác độ dời tịnh tiến (dx, dy) giữa hai khung hình liên tiếp."
    )
    
    # Placeholder Hình 2.2
    helper.add_figure_placeholder(doc, "2.2",
        "Quy trình nắn chỉnh biến dạng hình học trụ (Cylindrical Warping) cho ảnh góc rộng",
        "Minh họa sự thay đổi hình học của khung ảnh từ dạng phối cảnh phẳng sang mặt trụ cong trước khi ghép mí",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.3. Thuật toán trích xuất đặc trưng điểm SIFT
    helper.add_heading_3(doc, "2.1.3. Thuật toán trích xuất đặc trưng điểm SIFT (Scale-Invariant Feature Transform)")
    helper.add_body_p(doc,
        "Để tìm được các vùng chồng lấn (Overlapping Area) giữa các bức ảnh liên tiếp trong điều kiện ánh sáng trong phòng bảo tàng thay đổi hoặc góc quay hơi nghiêng nhẹ, hệ thống cần một thuật toán trích xuất đặc trưng mạnh mẽ. "
        "Thuật toán SIFT (do David Lowe đề xuất năm 2004) là giải pháp tiêu chuẩn vàng nhờ khả năng bất biến hoàn hảo đối với phép quay, biến đổi tỷ lệ co giãn (Scale-invariance), biến đổi độ sáng và tương đối bất biến với sự biến dạng góc nhìn 3D [3]."
    )
    helper.add_body_p(doc,
        "Quy trình thuật toán SIFT gồm 4 giai đoạn toán học chính:"
    )
    helper.add_bullet_item(doc,
        "Ảnh gốc I(x, y) được tích chập liên tiếp với hàm Gauss G(x, y, sigma) ở nhiều mức độ mờ khác nhau để tạo thành không gian tỷ lệ L(x, y, sigma). Sau đó, sai phân giữa hai ảnh kề nhau trong cùng một tầng tỷ lệ (Octave) được tính toán: D(x, y, sigma) = L(x, y, k*sigma) - L(x, y, sigma). Các điểm cực trị không gian (cực đại và cực tiểu cục bộ) được xác định bằng cách so sánh điểm ảnh xét với 26 lân cận xung quanh trong ma trận 3x3x3.",
        bold_prefix="1. Thiết lập không gian tỷ lệ và phát hiện cực trị DoG (Difference of Gaussians): "
    )
    helper.add_bullet_item(doc,
        "Sử dụng phép khai triển chuỗi Taylor bậc 2 của hàm không gian tỷ lệ D(x) để loại bỏ các điểm có độ tương phản thấp (Low Contrast) hoặc các điểm nằm dọc theo cạnh (Edge points) thông qua việc phân tích ma trận Hessian 2x2.",
        bold_prefix="2. Định vị chính xác điểm đặc trưng (Keypoint Localization): "
    )
    helper.add_bullet_item(doc,
        "Tính toán hướng gradient và độ lớn gradient trong vùng lân cận điểm đặc trưng để gán hướng chủ đạo (Dominant Orientation). Mọi phép mô tả tiếp theo đều được tính toán tương đối so với hướng này, đảm bảo tính bất biến khi xoay ảnh.",
        bold_prefix="3. Gán hướng chủ đạo (Orientation Assignment): "
    )
    helper.add_bullet_item(doc,
        "Vùng không gian 16x16 quanh điểm đặc trưng được chia thành 16 ô vuông nhỏ (4x4). Mỗi ô tạo một biểu đồ histogram gồm 8 hướng gradient. Kết quả tạo thành một vector mô tả gồm 128 chiều (4 x 4 x 8 = 128 dimensions) được chuẩn hóa vector đơn vị để bất biến với ánh sáng.",
        bold_prefix="4. Xây dựng vector mô tả đặc trưng (Keypoint Descriptor 128D): "
    )
    
    # Bảng 2.1
    helper.add_table_caption(doc, "2.1", "Bảng so sánh các phương pháp trích xuất đặc trưng điểm ảnh (SIFT, SURF, ORB)")
    tbl_s = doc.add_table(rows=4, cols=4)
    tbl_s.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_s.autofit = False
    helper.set_table_borders(tbl_s, color="475569", sz="6", val="single")
    
    col_ws = [Cm(3.0), Cm(4.0), Cm(4.0), Cm(4.5)]
    r0 = tbl_s.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Thuật toán", "Tốc độ xử lý", "Độ chính xác & Bất biến", "Mục đích áp dụng trong đề tài"]):
        c = r0.cells[i]
        c.width = col_ws[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    s_data = [
        ("SIFT (David Lowe)", "Trung bình (Đòi hỏi tính toán dấu phẩy động 128D)", "Rất cao; bất biến tuyệt đối với tỷ lệ, xoay và thay đổi ánh sáng phức tạp.", "Áp dụng chính trong phân hệ Panorama Studio để ghép ảnh 18 phòng bảo tàng đạt độ nét tối đa."),
        ("SURF (Bay et al.)", "Nhanh hơn SIFT nhờ bộ lọc hộp Integral Image", "Khá cao; tuy nhiên bị hạn chế bản quyền thương mại và méo góc rộng.", "Dùng tham khảo so sánh thực nghiệm hiệu năng."),
        ("ORB (Rublee et al.)", "Rất nhanh (Vector nhị phân 256-bit Hamming)", "Kém ổn định khi tỷ lệ co giãn lớn (> 2.0x) hoặc ánh sáng yếu.", "Áp dụng cho các tính năng kiểm tra sơ bộ chuyển động nhanh trên trình duyệt.")
    ]
    for idx, (alg, spd, acc, app) in enumerate(s_data):
        row = tbl_s.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([alg, spd, acc, app]):
            c = row.cells[i]
            c.width = col_ws[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_s.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    # Placeholder Hình 2.3
    helper.add_figure_placeholder(doc, "2.3",
        "Không gian tỷ lệ sai phân Gauss (Difference of Gaussians - DoG) trong thuật toán SIFT",
        "Sơ đồ cấu trúc các tầng Octave và các mức tỷ lệ làm mịn ảnh trong thuật toán SIFT",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.4. Khớp đặc trưng và loại bỏ nhiễu ngoại lai bằng RANSAC
    helper.add_heading_3(doc, "2.1.4. Khớp đặc trưng và loại bỏ nhiễu ngoại lai bằng RANSAC")
    helper.add_body_p(doc,
        "Sau khi trích xuất tập hợp các vector đặc trưng SIFT từ hai bức ảnh kề nhau, hệ thống sử dụng thuật toán tìm kiếm lân cận gần nhất k-NN (k-Nearest Neighbors) kết hợp phép kiểm tra tỷ lệ khoảng cách (Lowe's Ratio Test) để loại bỏ các điểm khớp sai ban đầu:"
    )
    helper.add_equation(doc, "d(f_A, f_B1) / d(f_A, f_B2) < threshold_ratio  (0.7 - 0.75)", "2.9")
    helper.add_body_p(doc,
        "Tuy nhiên, do hoa văn lặp lại trên tường bảo tàng hoặc bóng phản chiếu trên kính tủ hiện vật, tập hợp điểm khớp vẫn chứa nhiều cặp điểm ngoại lai (Outliers). "
        "Thuật toán RANSAC (Random Sample Consensus) được áp dụng để ước lượng ma trận chuyển vị hình học chính xác (Affine hoặc Homography Matrix) [5]."
    )
    helper.add_body_p(doc,
        "Quy trình RANSAC lặp lại N lần qua các bước:"
    )
    helper.add_bullet_item(doc, "Ngẫu nhiên chọn một tập mẫu tối thiểu gồm 4 cặp điểm khớp để tính toán ma trận Homography thử nghiệm H.", bold_prefix="Bước 1: ")
    helper.add_bullet_item(doc, "Áp dụng ma trận H để biến đổi toàn bộ các điểm còn lại và tính sai số hình chiếu Euclidean: epsilon = ||p'_i - H * p_i||.", bold_prefix="Bước 2: ")
    helper.add_bullet_item(doc, "Đếm số lượng điểm nội lai (Inliers) thỏa mãn điều kiện epsilon < threshold_distance.", bold_prefix="Bước 3: ")
    helper.add_bullet_item(doc, "Lưu lại ma trận H có tập hợp điểm Inliers lớn nhất. Sau N vòng lặp, tính toán lại ma trận Homography tối ưu cuối cùng trên toàn bộ tập điểm Inliers này.", bold_prefix="Bước 4: ")
    
    # Placeholder Hình 2.4
    helper.add_figure_placeholder(doc, "2.4",
        "Khớp cặp điểm đặc trưng SIFT và loại bỏ nhiễu ngoại lai bằng RANSAC",
        "Biểu diễn các đường nối cặp điểm khớp giữa hai ảnh kề nhau trước và sau khi lọc nhiễu RANSAC",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.5. Kỹ thuật cắt mí tối ưu và hòa trộn đa dải tần
    helper.add_heading_3(doc, "2.1.5. Kỹ thuật cắt mí tối ưu (Seam Cutting) và hòa trộn đa dải tần")
    helper.add_body_p(doc,
        "Sau khi các bức ảnh được đăng ký vị trí không gian chính xác, việc ghép chồng trực tiếp sẽ để lại các vết lằn mí nối (Seam lines) rất rõ rệt do sự chênh lệch phơi sáng hoặc chuyển động nhẹ của ánh sáng. "
        "Để xử lý triệt để vấn đề này, đề tài kết hợp hai kỹ thuật thị giác máy tính cao cấp:"
    )
    helper.add_body_p(doc,
        "1. Tối ưu hóa đường cắt mí (Optimal Seam Finding / Voronoi Seam): Thay vì cắt theo đường thẳng đứng cứng nhắc ở giữa vùng giao thoa, thuật toán tìm một đường biên đi qua các vùng có độ chênh lệch màu sắc nhỏ nhất giữa hai ảnh bằng cách cực tiểu hóa hàm năng lượng vi sai (Energy Minimization):"
    )
    helper.add_equation(doc, "E(p) = ||I₁(p) - I₂(p)||² + ||∇(I₁(p)) - ∇(I₂(p))||²", "2.10")
    helper.add_body_p(doc,
        "2. Hòa trộn đa dải tần (Multiband Laplacian Pyramid Blending): Thuật toán phân rã mỗi ảnh thành một tháp ảnh Laplace gồm nhiều dải tần số không gian khác nhau (từ tần số cao thể hiện chi tiết cạnh sắc nét đến tần số thấp thể hiện tông màu nền) [6]. "
        "Ở mỗi tầng k, ảnh được hòa trộn thông qua trọng số mặt nạ mượt mà (Gaussian Weight Mask W_k):"
    )
    helper.add_equation(doc, "L_out^k = W_k · L₁^k + (1 - W_k) · L₂^k", "2.11")
    helper.add_body_p(doc,
        "Sau đó, bức ảnh Panorama cuối cùng được tái tạo hoàn chỉnh bằng cách cộng dồn các tầng tháp từ trên xuống dưới. "
        "Phương pháp này đảm bảo màu sắc chuyển tiếp vô cùng êm dịu mà không làm mờ đi các chi tiết hoa văn sắc sảo của hiện vật."
    )
    
    # Placeholder Hình 2.5
    helper.add_figure_placeholder(doc, "2.5",
        "Quy trình tối ưu đường ghép mí (Seam Cutting) và hòa trộn đa dải tần",
        "Sơ đồ phân rã tháp Laplacian và quá trình hòa trộn từng tầng tần số để khử triệt để vết mí nối",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.6. Công nghệ hiển thị không gian cầu 360° với WebGL và Three.js
    helper.add_heading_3(doc, "2.1.6. Công nghệ hiển thị không gian cầu 360° với WebGL và Three.js")
    helper.add_body_p(doc,
        "WebGL (Web Graphics Library) là chuẩn giao tiếp lập trình đồ họa JavaScript cho phép kết xuất hình ảnh đồ họa 3D tương tác tăng tốc phần cứng ngay trên trình duyệt mà không cần cài đặt plug-in phụ trợ. "
        "Three.js là một thư viện bậc cao được xây dựng trên nền WebGL, đóng gói các ma trận phép biến đổi phức tạp, thuật toán đổ bóng (Shaders) và hệ thống camera 3D thành các đối tượng hướng module trực quan [7], [8]."
    )
    helper.add_body_p(doc,
        "Để tái tạo trải nghiệm thực tế ảo 360°, hệ thống sử dụng một đối tượng hình cầu rỗng (Inverted Sphere Geometry) có bán kính quy ước R = 500 đơn vị không gian 3D. "
        "Ảnh toàn cảnh Equirectangular sau khi xuất từ Studio được ánh xạ làm Texture (chất liệu mặt trong) của hình cầu thông qua tỷ lệ co giãn trục X âm (scale.x = -1) để camera đặt tại tâm O(0, 0, 0) nhìn ra xung quanh như mắt người quan sát trong đời thực."
    )
    helper.add_body_p(doc,
        "Góc nhìn của khách tham quan được điều khiển bởi hai góc tọa độ cầu: góc Yaw (kinh độ, quay trái/phải [-180°, 180°]) và góc Pitch (vĩ độ, ngước lên/nhìn xuống [-85°, 85°]). Vector hướng nhìn của Camera được tính toán trong vòng lặp Render (requestAnimationFrame):"
    )
    helper.add_equation(doc, "target.x = R · cos(pitch) · sin(yaw)", "2.12")
    helper.add_equation(doc, "target.y = R · sin(pitch)", "2.13")
    helper.add_equation(doc, "target.z = R · cos(pitch) · cos(yaw)", "2.14")
    helper.add_body_p(doc, "Sau khi tính toán được vector đích, camera thực thi lệnh camera.lookAt(target) để hướng góc nhìn tương tác mượt mà.")
    
    # Placeholder Hình 2.6
    helper.add_figure_placeholder(doc, "2.6",
        "Nguyên lý ánh xạ texture Panorama lên hình cầu 3D trong không gian WebGL/Three.js",
        "Mô hình camera đặt tại tâm hình cầu 3D quan sát bề mặt bên trong chứa ảnh toàn cảnh bảo tàng",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.7. Thuật toán tìm đường đi ngắn nhất Dijkstra
    helper.add_heading_3(doc, "2.1.7. Thuật toán tìm đường đi ngắn nhất Dijkstra ứng dụng định tuyến bảo tàng")
    helper.add_body_p(doc,
        "Bảo tàng Lịch sử TP.HCM có kiến trúc gồm 18 gian phòng trưng bày liên hoàn bao bọc quanh sân vườn nội viện. "
        "Khách tham quan thường gặp khó khăn khi muốn tìm đường ngắn nhất từ phòng hiện tại đến một phòng chuyên đề cụ thể (ví dụ: từ Phòng Tiền sử số 1 đến Phòng Cổ vật Champa số 7) [9], [10]."
    )
    helper.add_body_p(doc,
        "Đề tài mô hình hóa mặt bằng bảo tàng thành một đồ thị vô hướng có trọng số G = (V, E, W), trong đó tập đỉnh V = {1, 2, ..., 18} đại diện cho 18 phòng trưng bày; tập cạnh E là các cửa thông phòng thực tế được ghi nhận trong Đợt khảo sát 1; và trọng số W(u, v) là khoảng cách bước chân thực tế giữa hai tâm phòng."
    )
    helper.add_body_p(doc,
        "Giải thuật Dijkstra cổ điển tìm đường đi ngắn nhất từ đỉnh nguồn s đến đỉnh đích t được hiện thực bằng hàng đợi ưu tiên (Priority Queue / Min-Heap), đạt độ phức tạp thời gian O((|E| + |V|) log |V|):"
    )
    helper.add_bullet_item(doc, "Khởi tạo khoảng cách dist[s] = 0, dist[v] = vô cực với mọi v khác s; gán mảng lưu dấu vết previous[v] = null.", bold_prefix="Bước 1: ")
    helper.add_bullet_item(doc, "Đẩy đỉnh nguồn s vào hàng đợi ưu tiên Q.", bold_prefix="Bước 2: ")
    helper.add_bullet_item(doc, "Lấy đỉnh u có khoảng cách nhỏ nhất ra khỏi Q. Nếu u == t thì dừng thuật toán.", bold_prefix="Bước 3: ")
    helper.add_bullet_item(doc, "Với mỗi đỉnh kề v của u, thực hiện nới lỏng cạnh (Edge Relaxation): nếu dist[u] + W(u, v) < dist[v] thì cập nhật dist[v] = dist[u] + W(u, v), previous[v] = u và cập nhật Q.", bold_prefix="Bước 4: ")
    helper.add_bullet_item(doc, "Truy vết mảng previous từ đích t về nguồn s để xác định chính xác danh sách các phòng cần đi qua, sau đó vẽ lộ trình nổi bật trên bản đồ Mini-map.", bold_prefix="Bước 5: ")
    
    # Placeholder Hình 2.7
    helper.add_figure_placeholder(doc, "2.7",
        "Sơ đồ nguyên lý giải thuật Dijkstra tìm đường đi ngắn nhất trên đồ thị liên thông",
        "Minh họa các bước nới lỏng cạnh và truy vết đường đi tối ưu giữa các phòng trưng bày",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.8. Kỹ thuật tái tạo và hiển thị mô hình cổ vật 3D
    helper.add_heading_3(doc, "2.1.8. Kỹ thuật tái tạo và hiển thị mô hình cổ vật 3D")
    helper.add_body_p(doc,
        "Để mang lại trải nghiệm chiêm ngưỡng chân thực cho các cổ vật quý hiếm mà khách tham quan không thể cầm nắm trực tiếp tại bảo tàng, đề tài kết hợp phương pháp chụp ảnh đa góc (Photogrammetry) và tái tạo mô hình lưới tam giác 3D (Textured 3D Mesh) [8], [27], [29]."
    )
    helper.add_body_p(doc,
        "Quy trình số hóa cổ vật bao gồm:"
    )
    helper.add_bullet_item(doc, "Cổ vật được đặt trên bàn xoay hoặc chụp xung quanh theo các vòng cao độ khác nhau (góc 0°, 30°, 60°) với độ chồng lấn ảnh tối thiểu 70%.", bold_prefix="1. Thu thập chuỗi ảnh đa góc: ")
    helper.add_bullet_item(doc, "Áp dụng thuật toán Structure from Motion (SfM) để tái tạo đám mây điểm thưa (Sparse Point Cloud), sau đó dùng Multi-View Stereo (MVS) làm đặc đám mây điểm dày đặc.", bold_prefix="2. Tái tạo hình thể 3D: ")
    helper.add_bullet_item(doc, "Tạo bề mặt lưới tam giác (Mesh Generation), nén giảm số lượng đa giác (Mesh Decimation) để mô hình có dung lượng nhẹ (< 5MB), tải nhanh trên trình duyệt web.", bold_prefix="3. Tối ưu hóa lưới tam giác: ")
    helper.add_bullet_item(doc, "Chiếu màu ảnh gốc lên mô hình dưới dạng Texture Maps (Diffuse, Normal, Roughness) và đóng gói theo chuẩn nhị phân quốc tế .GLB (glTF 2.0).", bold_prefix="4. Trải chất liệu và xuất file GLB: ")
    
    # Bảng 2.2
    helper.add_table_caption(doc, "2.2", "Bảng so sánh các kỹ thuật tái tạo 3D (Photogrammetry, 3DGS, NeRF)")
    tbl_3d = doc.add_table(rows=4, cols=4)
    tbl_3d.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_3d.autofit = False
    helper.set_table_borders(tbl_3d, color="475569", sz="6", val="single")
    
    col_w3 = [Cm(3.5), Cm(4.0), Cm(4.0), Cm(4.0)]
    r0 = tbl_3d.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Phương pháp", "Chất lượng hình ảnh", "Độ tương thích Web", "Ứng dụng trong đề tài"]):
        c = r0.cells[i]
        c.width = col_w3[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    td_data = [
        ("Photogrammetry Mesh (.GLB)", "Sắc nét, giữ đúng kết cấu hình học và hoa văn bề mặt.", "Rất cao; hỗ trợ 100% trên WebGL và Three.js tiêu chuẩn.", "Lựa chọn chính cho 17 cổ vật trưng bày tương tác xoay 360° trên web."),
        ("3D Gaussian Splatting (3DGS)", "Cực kỳ chân thực, tái hiện phản xạ ánh sáng kim loại xuất sắc.", "Cần card đồ họa mạnh (WebGL/WebGPU), dung lượng file lớn.", "Định hướng mở rộng nghiên cứu nâng cao."),
        ("Neural Radiance Fields (NeRF)", "Chân thực nhưng thời gian render trên web còn hạn chế.", "Đòi hỏi máy chủ GPU render luồng video thời gian thực.", "Phù hợp nghiên cứu trong phòng thí nghiệm.")
    ]
    for idx, (mth, qlt, cmp, app) in enumerate(td_data):
        row = tbl_3d.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([mth, qlt, cmp, app]):
            c = row.cells[i]
            c.width = col_w3[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_3d.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)
                
    # Placeholder Hình 2.8
    helper.add_figure_placeholder(doc, "2.8",
        "Quy trình tái tạo mô hình cổ vật 3D từ chuỗi ảnh chụp đa góc",
        "Các bước từ ảnh chụp thực địa đến đám mây điểm, khung lưới đa giác và mô hình GLB hoàn chỉnh",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.1.8.1. Nguyên lý tái tạo thể tích 3D nội bộ bằng thuật toán đối xứng trục (Local CPU Server)
    helper.add_heading_4(doc, "2.1.8.1. Nguyên lý tái tạo thể tích 3D nội bộ bằng thuật toán đối xứng trục (Local CPU Server)")
    helper.add_body_p(doc,
        "Động cơ tự phát triển nội bộ trên máy chủ CPU (Module artifact_3d_generator.py v15.0) hoạt động dựa trên phương pháp "
        "tái tạo khối thể tích qua bao hình điều hòa (Harmonic Volumetric Envelope) kết hợp thuật toán Marching Cubes [11]. "
        "Quy trình toán học gồm các bước sau:"
    )
    helper.add_bullet_item(doc,
        "Sử dụng thuật toán phân ngưỡng tự động Otsu kết hợp mô hình trích xuất tiền cảnh Rembg để tách vật thể khỏi nền ảnh, "
        "tạo mặt nạ nhị phân Silhouette Mask S(x, y) ∈ {0, 1}.",
        bold_prefix="• Phân đoạn tiền cảnh (Foreground Silhouette Masking): "
    )
    helper.add_bullet_item(doc,
        "Xác định trục đối xứng trung tâm thẳng đứng đi qua trọng tâm hình học của mặt nạ. "
        "Với mỗi lát cắt ngang theo cao độ y, thuật toán đo bán kính biên R(y) từ trục đối xứng tới mép ngoài cùng của hiện vật. "
        "Không gian thể tích 3D được biểu diễn qua hàm trường khoảng cách điều hòa liên tục (Harmonic Continuous Field): "
        "F(x, y, z) = R(y) - √(x² + z²).",
        bold_prefix="• Trường khoảng cách đối xứng trục Radial-Axial: "
    )
    helper.add_bullet_item(doc,
        "Áp dụng giải thuật Marching Cubes của Lorensen & Cline trên lưới voxel 3D để trích xuất bề mặt đẳng trị (Isosurface) tại mức F(x, y, z) = 0, "
        "sinh ra khung lưới đa giác tam giác khép kín (Watertight Mesh) chuẩn định dạng .GLB.",
        bold_prefix="• Trích xuất bề mặt đẳng trị (Marching Cubes Isosurface): "
    )
    helper.add_bullet_item(doc,
        "Mặt trước của hiện vật được chiếu trực tiếp vân ảnh gốc; áp dụng thuật toán nở biên vân (Texture Dilation) 18 chu kỳ để khử viền đen mép biên; "
        "đồng thời tính toán đạo hàm bậc một Sobel theo hướng u và v để sinh bản đồ pháp tuyến (Normal Map) tạo độ gồ ghề cho chất liệu đồng cổ.",
        bold_prefix="• Trải chất liệu và sinh Normal Map: "
    )
    helper.add_body_p(doc,
        "Điểm khuyết và hạn chế cốt tử của Động cơ Local CPU tự tạo: "
        "Do thuật toán dựa hoàn toàn trên 'Giả định đối xứng trục quay toán học' (Axial Symmetry Assumption), "
        "mặt sau của mô hình 3D thực chất chỉ là bản sao phản chiếu đối xứng gương từ mặt phẳng phía trước. "
        "Khi áp dụng cho các hiện vật điêu khắc bất đối xứng hoặc có cấu trúc khối phức tạp (như Tượng Phật ngồi kiết già, Tượng thần Shiva, Bia đá có chữ khác nhau ở hai mặt, hoặc các pho tượng có tà áo bay), "
        "thuật toán ép toàn bộ hiện vật thành khối phồng tròn nhẵn thín như bóng nước. Toàn bộ nếp gấp áo cà sa, đài sen bát giác, "
        "các góc lồi lõm đa hướng và hoa văn ở mặt sau đều bị san phẳng hoặc biến dạng tròn xoay bất hợp lý. "
        "Ngoài ra, mô hình sinh ra có số lượng đa giác quá lớn (~95.000 polygons) nhưng lại thiếu chiều sâu chân thực."
    )
    
    # 2.1.8.2. Nguyên lý mô hình nền tảng AI tạo sinh 3D Microsoft TRELLIS
    helper.add_heading_4(doc, "2.1.8.2. Nguyên lý mô hình nền tảng AI tạo sinh 3D Microsoft TRELLIS (ZeroGPU A100)")
    helper.add_body_p(doc,
        "Nhằm khắc phục triệt để các khiếm khuyết hình học của thuật toán nội bộ, đề tài tích hợp Mô hình nền tảng tạo tài sản 3D hiện đại nhất "
        "hiện nay là Microsoft TRELLIS (Large 3D Asset Creation with Structured Latents - Xiang et al., Dec. 2024 [29]). "
        "Nguyên lý vận hành của TRELLIS được xây dựng trên 3 trụ cột khoa học đột phá:"
    )
    helper.add_bullet_item(doc,
        "TRELLIS đại diện thế giới 3D dưới dạng một cấu trúc tiềm ẩn có tọa độ không gian rõ ràng (Structured Latent Representation - SLAT). "
        "Khác với các mô hình NeRF thuần túy chỉ tái hiện trường bức xạ, SLAT mã hóa đồng thời cả đặc trưng hình học (Geometry) và thông tin diện mạo (Appearance) "
        "vào các biến tiềm ẩn gắn trên lưới voxel 3D thưa (Sparse Voxels), cho phép mô hình nắm bắt chính xác mối quan hệ không gian đa chiều.",
        bold_prefix="• Biểu diễn tiềm ẩn cấu trúc (Structured Latents - SLAT): "
    )
    helper.add_bullet_item(doc,
        "Áp dụng kiến trúc mạng Transformer luồng hiệu chỉnh (Rectified Flow Transformers) để biến đổi có định hướng từ phân phối nhiễu ngẫu nhiên Gauss "
        "về không gian tiềm ẩn SLAT mục tiêu tương ứng với ảnh đầu vào. Quá trình này được tối ưu hóa theo quỹ đạo đường thẳng (Straight-path Trajectory), "
        "cho phép mô hình 'tưởng tượng' chính xác hình thái 3D toàn vẹn 360°, tái tạo hoàn hảo các phần bị khuất và mặt lưng của pho tượng chỉ từ một hoặc hai bức ảnh chụp [29].",
        bold_prefix="• Mạng biến đổi luồng hiệu chỉnh (Rectified Flow Transformers): "
    )
    helper.add_bullet_item(doc,
        "Bộ giải mã (Decoder) của TRELLIS biến đổi không gian SLAT thành mô hình đa giác Mesh sắc nét (~25.000 polygons) kết hợp kết xuất khả vi (Differentiable Rendering), "
        "tự động sinh tập bản đồ chất liệu chuẩn điện ảnh PBR (Physically Based Rendering gồm: Albedo, Normal Map, Roughness Map) "
        "và đóng gói thành tệp nhị phân tiêu chuẩn quốc tế .GLB [8], [29].",
        bold_prefix="• Giải mã trích xuất lưới đa giác và chất liệu PBR: "
    )
    helper.add_body_p(doc,
        "Lý do mang tính quyết định để đề tài lựa chọn tích hợp TRELLIS làm động cơ chính: "
        "TRELLIS giải quyết hoàn hảo bài toán số hóa hiện vật bảo tàng khi không có máy quét 3D đắt tiền. "
        "Mô hình 3D do TRELLIS tạo ra giữ đúng tỷ lệ giải phẫu học, nếp áo cà sa mềm mại, góc cạnh đài sen bát giác sắc sảo, "
        "lưới đa giác nhẹ gấp 4 lần so với Local CPU (tối ưu hóa 60 FPS trên điện thoại di động) và chất liệu PBR phản quang chân thực dưới ánh đèn sân khấu Three.js. "
        "Động cơ Local CPU được giữ lại trong kiến trúc như một giải pháp dự phòng an toàn (Fallback) khi hết hạn ngạch GPU hoặc mất kết nối đám mây."
    )
    
    # 2.1.9. Nguyên lý ghim điểm định vị Hotspot và cơ chế chuyển cảnh không gian thực tế ảo 360°
    helper.add_heading_3(doc, "2.1.9. Nguyên lý ghim điểm định vị Hotspot và cơ chế chuyển cảnh không gian thực tế ảo 360°")
    helper.add_body_p(doc,
        "Trong các hệ thống tham quan bảo tàng thực tế ảo dựa trên phép chiếu toàn cảnh Equirectangular, "
        "Hotspot (điểm neo tương tác) đóng vai trò là cầu nối không gian và trạm tương tác thông tin sống còn [7], [37], [38]. "
        "Nếu không có hệ thống Hotspot, người dùng chỉ có thể đứng yên tại một điểm duy nhất để xoay nhìn xung quanh mà không thể tự do di chuyển qua các gian phòng trưng bày liên hoàn. "
        "Đề tài phân loại Hotspot thành hai nhóm đối tượng chuyên biệt:"
    )
    helper.add_bullet_item(doc,
        "Đóng vai trò như các 'cổng dịch chuyển không gian ảo' (Spatial Teleportation Gateways) được đặt tại các vị trí cửa ra vào, lối đi thông phòng hoặc bậc tam cấp thực tế. "
        "Mỗi điểm chuyển cảnh chứa thông tin định danh phòng đích (targetRoomId), góc nhìn ban đầu khi bước vào phòng (targetPitch, targetYaw) và nhãn hiển thị trực quan hướng dẫn khách.",
        bold_prefix="1. Hotspot chuyển cảnh (Navigation Hotspot): "
    )
    helper.add_bullet_item(doc,
        "Được ghim trực tiếp lên bề mặt tủ kính, bệ đá hoặc hiện vật trong bức ảnh 360°. "
        "Khi khách tham quan nhấp chuột, hệ thống kích hoạt cửa sổ Modal hiển thị thông tin xuất xứ, kích thước, niên đại, "
        "kích hoạt trình xem mô hình cổ vật 3D xoay 360° (.GLB) và phát thuyết minh âm thanh đa ngôn ngữ.",
        bold_prefix="2. Hotspot thông tin hiện vật (Information / Artifact Hotspot): "
    )
    helper.add_body_p(doc,
        "Về mặt bản chất toán học, một điểm Hotspot trong không gian cầu Three.js/WebGL bán kính R được định vị bằng hệ tọa độ cầu hai chiều (Pitch, Yaw) [7], [37]:"
    )
    helper.add_bullet_item(doc,
        "Đại diện cho góc nâng vĩ độ (Elevation angle) theo trục thẳng đứng Y, nhận giá trị trong khoảng [-90°, +90°]. "
        "Góc 0° tương ứng với đường chân trời ngang tầm mắt người quan sát; góc +90° hướng thẳng lên đỉnh trần nhà (Zenith); và góc -90° hướng vuông góc xuống sàn nhà (Nadir).",
        bold_prefix="• Góc Pitch (Vĩ độ): "
    )
    helper.add_bullet_item(doc,
        "Đại diện cho góc phương vị kinh độ (Azimuth angle) quay quanh trục thẳng đứng Y của không gian 3D, nhận giá trị trong khoảng [-180°, +180°]. "
        "Góc Yaw xác định góc xoay la bàn 360 độ xung quanh tâm vị trí đứng của người tham quan.",
        bold_prefix="• Góc Yaw (Kinh độ): "
    )
    helper.add_body_p(doc,
        "Để quản trị viên có thể ghim điểm Hotspot dễ dàng và chính xác ngay trên giao diện Web mà không cần tính toán thủ công, hệ thống cài đặt thuật toán biến đổi toán học hai chiều:"
    )
    helper.add_body_p(doc,
        "Chiều 1 - Từ cú nhấp chuột 2D màn hình suy biến tọa độ cầu (Dành cho Quản trị viên ghim phòng): "
        "Khi Admin nhấp chuột tại điểm (x_screen, y_screen) trên khung nhìn trình duyệt có kích thước (W_viewport, H_viewport), "
        "tọa độ pixel được chuẩn hóa sang Tọa độ thiết bị chuẩn (Normalized Device Coordinates - NDC) trong miền [-1, 1]:"
    )
    helper.add_equation(doc, "x_{ndc} = (2 · x_{screen} / W_{viewport}) - 1,    y_{ndc} = 1 - (2 · y_{screen} / H_{viewport})", "2.15")
    helper.add_body_p(doc,
        "Từ tọa độ NDC, công cụ Three.js Raycaster phóng một tia bức xạ từ tâm quang học của Camera xuyên qua mặt phẳng chiếu 3D. "
        "Điểm giao cắt P(X, Y, Z) giữa tia và mặt cầu bán kính R (thỏa mãn X² + Y² + Z² = R²) cho phép tính toán chính xác góc Pitch và Yaw để lưu trữ vào cơ sở dữ liệu MongoDB [14]:"
    )
    helper.add_equation(doc, "Pitch = arcsin(Y / R) · (180° / π)", "2.16")
    helper.add_equation(doc, "Yaw = arctan2(X, Z) · (180° / π)", "2.17")
    helper.add_body_p(doc,
        "Chiều 2 - Từ tọa độ cầu trong CSDL định vị đối tượng 3D Mesh/Sprite (Dành cho Khách tham quan): "
        "Khi hiển thị không gian phòng, hệ thống đọc danh sách Hotspot từ API và biến đổi ngược từ cặp góc (Pitch, Yaw) thành vector tọa độ không gian Descartes 3D để ghim biểu tượng mũi tên hoặc vòng tròn nhấp nháy:"
    )
    helper.add_equation(doc, "X = R · cos(Pitch · π / 180°) · sin(Yaw · π / 180°)", "2.18")
    helper.add_equation(doc, "Y = R · sin(Pitch · π / 180°)", "2.19")
    helper.add_equation(doc, "Z = R · cos(Pitch · π / 180°) · cos(Yaw · π / 180°)", "2.20")
    helper.add_body_p(doc,
        "Giải thuật chuyển cảnh mượt mà giữa các gian phòng (Smooth Room Teleportation & Transition): "
        "Khi người dùng nhấp vào Hotspot chuyển phòng, nếu thay đổi trực tiếp ảnh Texture sẽ gây ra hiện tượng sụt giảm khung hình đột ngột (Frame Drop) và nháy trắng giao diện do GPU phải phân bổ bộ nhớ giải nén ảnh Panorama độ phân giải cao 8K. "
        "Đề tài áp dụng kỹ thuật chuyển tiếp 4 pha kết hợp điều chế độ mờ đục Alpha và tải trước bất đồng bộ [7], [37], [38]:"
    )
    helper.add_bullet_item(doc,
        "Trình duyệt kích hoạt đối tượng TextureLoader tải ngầm tệp ảnh Panorama WebP của phòng đích vào bộ nhớ đệm VRAM.",
        bold_prefix="• Pha 1 - Tải trước bất đồng bộ (Asynchronous Preload): "
    )
    helper.add_bullet_item(doc,
        "Độ mờ đục (Opacity) của chất liệu mặt cầu hiện tại được giảm dần từ 1.0 về 0.0 trong thời gian 300ms theo hàm làm mượt Cubic-Bezier, tạo cảm giác không gian mờ dần tự nhiên.",
        bold_prefix="• Pha 2 - Làm mờ khung cảnh (Fade-Out Canvas): "
    )
    helper.add_bullet_item(doc,
        "Hoán đổi Texture bề mặt cầu sang ảnh của phòng đích; đồng thời gọi hàm texture.dispose() đối với phòng cũ để giải phóng VRAM, triệt tiêu nguy cơ rò rỉ bộ nhớ (Memory Leak) trên điện thoại thông minh. "
        "Góc nhìn của camera được tái định vị về góc (targetPitch, targetYaw) do Admin đã thiết lập.",
        bold_prefix="• Pha 3 - Hoán đổi chất liệu và góc nhìn (Swap Texture & Orient Camera): "
    )
    helper.add_bullet_item(doc,
        "Độ mờ đục tăng dần từ 0.0 lên 1.0; đồng thời phát tín hiệu kích hoạt đồng bộ hóa vị trí gian phòng mới trên Sơ đồ mặt bằng Mini-map và cập nhật danh sách hiện vật trưng bày tương ứng.",
        bold_prefix="• Pha 4 - Làm sáng không gian và đồng bộ UI (Fade-In & State Sync): "
    )
    
    # 2.2. Công nghệ và nền tảng phát triển hệ thống
    helper.add_heading_2(doc, "2.2. Công nghệ và nền tảng phát triển hệ thống")
    
    # 2.2.1. Phân hệ Backend và dịch vụ nền tảng
    helper.add_heading_3(doc, "2.2.1. Phân hệ Backend và dịch vụ nền tảng")
    helper.add_body_p(doc,
        "Hệ thống Backend được thiết kế theo mô hình kiến trúc phân tầng 3 lớp (3-Tier Architecture) nhằm đảm bảo tính toàn vẹn dữ liệu, dễ dàng mở rộng module và bảo trì dài hạn (Hình 2.9) [12], [18]."
    )
    
    # Placeholder Hình 2.9
    helper.add_figure_placeholder(doc, "2.9",
        "Mô hình kiến trúc phân tầng hệ thống (3-Tier Layered Architecture)",
        "Sơ đồ thể hiện luồng giao tiếp giữa Tầng giao diện Client, Tầng dịch vụ API Backend và Tầng lưu trữ dữ liệu lai",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.2.1.1. Node.js và TypeScript
    helper.add_heading_4(doc, "2.2.1.1. Môi trường thực thi Node.js và ngôn ngữ TypeScript")
    helper.add_body_p(doc,
        "Node.js là một môi trường thực thi mã nguồn JavaScript phía máy chủ được xây dựng trên bộ máy V8 JavaScript Engine của Google Chrome. "
        "Với mô hình đơn luồng hướng sự kiện bất đồng bộ (Single-threaded Event-driven Non-blocking I/O), Node.js có khả năng xử lý đồng thời hàng ngàn kết nối I/O với chi phí tài nguyên bộ nhớ rất thấp, đặc biệt tối ưu cho các tác vụ streaming ảnh 360° dung lượng lớn và xử lý giao dịch thanh toán vé trực tuyến [12]."
    )
    helper.add_body_p(doc,
        "Ngôn ngữ TypeScript là một phần mở rộng có định kiểu tĩnh mạnh mẽ (Strongly Typed Superset) của JavaScript do Microsoft phát triển. "
        "Việc sử dụng TypeScript xuyên suốt từ Backend đến Frontend giúp phát hiện sớm các lỗi cú pháp và kiểu dữ liệu ngay trong quá trình biên dịch (Compile-time), chuẩn hóa các giao diện Interface cho thực thể dữ liệu (Room, Hotspot, Ticket, Order) và tăng cường đáng kể tính cộng tác trong dự án [12]."
    )
    
    # 2.2.1.2. Express.js và RESTful API
    helper.add_heading_4(doc, "2.2.1.2. Web Framework Express.js và thiết kế kiến trúc RESTful API")
    helper.add_body_p(doc,
        "Express.js là một framework web tối giản và linh hoạt dành cho Node.js, cung cấp hệ thống định tuyến (Routing) mạnh mẽ và cơ chế Middleware phân lớp chuyên nghiệp. "
        "Các API của hệ thống được chuẩn hóa theo chuẩn kiến trúc REST (Representational State Transfer) với các nguyên tắc định danh tài nguyên bằng danh từ, sử dụng đúng các phương thức HTTP chuẩn (GET, POST, PUT, DELETE) và trả về định dạng dữ liệu chuẩn JSON kèm mã trạng thái HTTP (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error) [12]."
    )
    
    # 2.2.1.3 & 2.2.1.4: PostgreSQL & MongoDB
    helper.add_heading_4(doc, "2.2.1.3. Chiến lược lưu trữ dữ liệu lai (PostgreSQL và MongoDB)")
    helper.add_body_p(doc,
        "Một trong những điểm sáng tạo nổi bật trong kiến trúc dữ liệu của đề tài là việc áp dụng chiến lược lưu trữ dữ liệu lai (Polyglot Persistence):"
    )
    helper.add_bullet_item(doc,
        "PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ nguồn mở mạnh mẽ nhất hiện nay, tuân thủ tuyệt đối các thuộc tính ACID (Atomicity, Consistency, Isolation, Durability). Hệ thống sử dụng PostgreSQL kết hợp Prisma ORM để quản lý các dữ liệu nhạy cảm đòi hỏi tính toàn vẹn cao: thông tin tài khoản người dùng, bảng giá vé, mã đơn hàng, lịch sử giao dịch thanh toán PayOS và nhật ký soát vé ra vào [13].",
        bold_prefix="PostgreSQL (RDBMS) — Quản lý giao dịch và bán vé: "
    )
    helper.add_bullet_item(doc,
        "MongoDB là cơ sở dữ liệu NoSQL dạng tài liệu (Document-oriented JSON/BSON) với cấu trúc lược đồ linh hoạt (Schema-less). Hệ thống sử dụng MongoDB kết hợp Mongoose ODM để lưu trữ toàn bộ cấu trúc không gian di sản có tính phân cấp phức tạp: tọa độ các điểm Hotspots, danh mục 18 gian phòng trưng bày, danh sách các hiện vật 3D liên kết trong phòng và dữ liệu thuyết minh âm thanh đa ngôn ngữ [14].",
        bold_prefix="MongoDB (NoSQL Document) — Quản lý không gian 360° và cổ vật: "
    )
    
    # Bảng 2.3
    helper.add_table_caption(doc, "2.3", "Bảng so sánh chiến lược lưu trữ dữ liệu (PostgreSQL vs MongoDB vs Redis)")
    tbl_db = doc.add_table(rows=4, cols=4)
    tbl_db.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_db.autofit = False
    helper.set_table_borders(tbl_db, color="475569", sz="6", val="single")
    
    col_wdb = [Cm(3.0), Cm(4.0), Cm(4.0), Cm(4.5)]
    r0 = tbl_db.rows[0]
    helper.make_row_header(r0)
    helper.make_row_cant_split(r0)
    for i, h in enumerate(["Hệ CSDL", "Mô hình dữ liệu", "Điểm mạnh kỹ thuật", "Phân hệ nghiệp vụ phụ trách"]):
        c = r0.cells[i]
        c.width = col_wdb[i]
        helper.set_cell_background(c, "E2E8F0")
        c.paragraphs[0].text = h
        c.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=True)
        
    db_data = [
        ("PostgreSQL (Prisma ORM)", "Quan hệ có cấu trúc (RDBMS / SQL)", "Tuân thủ nghiêm ngặt chuẩn ACID, khóa ngoại và ràng buộc toàn vẹn.", "Quản lý vé, thanh toán VietQR, hóa đơn và phân quyền người dùng."),
        ("MongoDB (Mongoose ODM)", "Tài liệu JSON/BSON lồng nhau", "Cấu trúc linh hoạt, mở rộng động các thuộc tính hotspot và cổ vật.", "Quản lý 18 gian phòng 360°, điểm Hotspot, tư liệu lịch sử và thuyết minh."),
        ("Redis Server", "Khóa - Giá trị trong RAM (In-Memory Key-Value)", "Tốc độ đọc/ghi cực nhanh (< 2ms), hỗ trợ cơ chế hết hạn TTL.", "Bộ nhớ đệm danh mục phòng, lưu trữ mã OTP Email và khóa phân tán.")
    ]
    for idx, (db, mth, strg, app) in enumerate(db_data):
        row = tbl_db.rows[idx + 1]
        helper.make_row_cant_split(row)
        for i, val in enumerate([db, mth, strg, app]):
            c = row.cells[i]
            c.width = col_wdb[i]
            c.paragraphs[0].text = val
            helper.set_run_font(c.paragraphs[0].runs[0], "Times New Roman", 11, bold=(i == 0))
            
    for r in tbl_db.rows:
        for c in r.cells:
            helper.set_cell_margins(c, top=70, bottom=70, left=90, right=90)
            if len(c.paragraphs) > 0:
                c.paragraphs[0].paragraph_format.line_spacing = 1.15
                c.paragraphs[0].paragraph_format.space_before = Pt(2)
                c.paragraphs[0].paragraph_format.space_after = Pt(2)

    # 2.2.1.5. Redis và JWT
    helper.add_heading_4(doc, "2.2.1.4. Bộ nhớ đệm Redis Server và Xác thực an toàn JWT")
    helper.add_body_p(doc,
        "Redis Server được sử dụng làm bộ nhớ đệm (Cache Layer) đặt trước các truy vấn cơ sở dữ liệu. "
        "Dữ liệu danh mục 18 phòng và sơ đồ liên kết Hotspot ít khi thay đổi sẽ được lưu đệm trong Redis với thời gian sống (TTL = 3600 giây). "
        "Nhờ đó, 90% các truy vấn tải trang của khách tham quan được phục hồi trực tiếp từ bộ nhớ RAM với độ trễ dưới 2ms, giảm thiểu tối đa tải cho máy chủ cơ sở dữ liệu [15]."
    )
    helper.add_body_p(doc,
        "Về mặt xác thực và an toàn thông tin, hệ thống áp dụng cơ chế xác thực phi trạng thái (Stateless Authentication) dựa trên chuẩn JSON Web Token (JWT) theo tiêu chuẩn RFC 7519. "
        "Token gồm 3 phần tách biệt: Header (thuật toán mã hóa HS256), Payload (thông tin định danh userId, vai trò role và thời hạn hết hạn exp) và Signature (chữ ký số tạo từ bí mật máy chủ secret_key). "
        "Đặc biệt, hệ thống cung cấp phương thức đăng nhập hiện đại thông qua mã xác thực một lần (Email OTP) gửi tới hộp thư người dùng, loại bỏ hoàn toàn nguy cơ lộ mật khẩu hoặc tấn công vét cạn (Brute-force) [12]."
    )
    
    # Placeholder Hình 2.10
    helper.add_figure_placeholder(doc, "2.10",
        "Mô hình xác thực phân quyền người dùng bằng JSON Web Token (JWT)",
        "Sơ đồ quy trình đăng nhập, cấp phát Token và xác thực Middleware trên từng yêu cầu API",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.2.2. Phân hệ Frontend và trải nghiệm người dùng
    helper.add_heading_3(doc, "2.2.2. Phân hệ Frontend và trải nghiệm người dùng")
    helper.add_body_p(doc,
        "Frontend được xây dựng bằng thư viện React 18 [20] và Vite [21], khai thác tối đa sức mạnh của Virtual DOM, React Hooks (useState, useEffect, useMemo, useRef) và kiến trúc Component hóa để tái sử dụng giao diện. "
        "Giao diện tuân thủ ngôn ngữ thiết kế di sản văn hóa với hệ màu chủ đạo: Đỏ Đền Cổ (#8C2D19), Vàng Hoàng Gia (#D4AF37) và Nền Đen Huyền Bí (#0A0D14), mang lại cảm giác trang nghiêm, cổ kính nhưng vô cùng sang trọng và hiện đại."
    )
    helper.add_body_p(doc,
        "Phân hệ soát vé tại cổng bảo tàng tích hợp thư viện HTML5-QRCode [22], cho phép nhân viên sử dụng trực tiếp camera trên trình duyệt điện thoại để quét mã vé QR của khách với tốc độ giải mã cực nhanh (dưới 100ms) mà không cần cài đặt ứng dụng chuyên dụng hoặc máy quét mã vạch cồng kềnh."
    )
    
    # 2.2.3. Tích hợp thanh toán trực tuyến VietQR qua PayOS
    helper.add_heading_3(doc, "2.2.3. Tích hợp thanh toán trực tuyến VietQR qua cổng PayOS")
    helper.add_body_p(doc,
        "VietQR là chuẩn nhận diện thanh toán bằng mã QR của mạng lưới thanh toán quốc gia NAPAS, cho phép khách hàng sử dụng bất kỳ ứng dụng ngân hàng số (Mobile Banking) hoặc ví điện tử nào tại Việt Nam để quét và chuyển khoản trực tiếp [16], [17]."
    )
    helper.add_body_p(doc,
        "Cổng thanh toán PayOS cung cấp API tạo mã VietQR động chứa đầy đủ thông tin: Mã ngân hàng, Số tài khoản thụ hưởng, Số tiền thanh toán chính xác và Mã đơn hàng duy nhất trong nội dung chuyển khoản. "
        "Khi khách hàng quét mã và xác nhận chuyển tiền thành công, hệ thống ngân hàng sẽ phát tín hiệu Webhook tức thời về máy chủ bảo tàng. Máy chủ kiểm tra tính hợp lệ của chữ ký điện tử HMAC-SHA256, tự động cập nhật trạng thái đơn hàng sang 'PAID' và phát hành vé điện tử có mã QR bảo mật gửi vào email của khách mà không cần sự can thiệp thủ công của nhân viên thu ngân [17]."
    )
    
    # Placeholder Hình 2.11 & 2.12
    helper.add_figure_placeholder(doc, "2.11",
        "Quy trình sinh mã và xác thực thanh toán VietQR qua cổng PayOS",
        "Sơ đồ luồng giao tiếp giữa Client, Backend bảo tàng, Ngân hàng và Webhook PayOS",
        width_cm=15.0, height_cm=7.5
    )
    helper.add_figure_placeholder(doc, "2.12",
        "Quy trình quét và kiểm tra mã vé QR thời gian thực bằng camera HTML5-QRCode",
        "Lưu đồ nhận diện khung hình camera, giải mã chuỗi mã vé, đối chiếu chữ ký SHA-256 và hủy vé tại cửa",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.2.4. Hạ tầng máy chủ và ảo hóa Docker
    helper.add_heading_3(doc, "2.2.4. Hạ tầng máy chủ và ảo hóa Docker")
    helper.add_body_p(doc,
        "Hệ thống được đóng gói hoàn chỉnh bằng công nghệ ảo hóa cấp hệ điều hành Docker và điều phối dịch vụ qua Docker Compose [18], [19]. Toàn bộ các thành phần (Nginx Web Server, Node.js Backend, PostgreSQL, MongoDB, Redis) được cô lập trong các container riêng biệt nhưng liên kết chặt chẽ qua mạng ảo nội bộ (Bridge Network)."
    )
    helper.add_body_p(doc,
        "Nginx đóng vai trò là Reverse Proxy và Web Server hiệu năng cao tại cổng 80/443, thực hiện cân bằng tải, nén dữ liệu tĩnh Gzip/Brotli, giải mã SSL/TLS an toàn và điều hướng thông minh: các yêu cầu tĩnh được phân phối trực tiếp từ thư mục build, trong khi các yêu cầu API được chuyển tiếp an toàn tới cụm máy chủ Node.js backend [18]."
    )
    
    # Placeholder Hình 2.13
    helper.add_figure_placeholder(doc, "2.13",
        "Sơ đồ kiến trúc ảo hóa và điều phối container với Docker Compose & Nginx",
        "Mô hình triển khai thực tế trên máy chủ Cloud VPS gồm các container Frontend, Backend, Database và Reverse Proxy",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.2.5. Nền tảng quan sát và giám sát hệ thống thời gian thực (Grafana & Prometheus)
    helper.add_heading_3(doc, "2.2.5. Nền tảng quan sát và giám sát hệ thống thời gian thực (Grafana & Prometheus)")
    helper.add_body_p(doc,
        "Để đảm bảo hệ thống số hóa bảo tàng vận hành liên tục 24/7 với độ sẵn sàng cao, nhóm tác giả tích hợp nền tảng quan sát toàn diện "
        "(Observability Platform) dựa trên sự kết hợp giữa Grafana và Prometheus [32], [35]. Mục đích cốt lõi của phân hệ này là cung cấp bức tranh "
        "trực quan, tức thời về hai khía cạnh trọng yếu: Sức khỏe hạ tầng kỹ thuật (Hạ tầng VPS, Docker Container, độ trễ API) và Chỉ số kinh doanh nghiệp vụ "
        "(Doanh thu bán vé trực tuyến VietQR qua PayOS, số lượng khách tham quan, tiến độ số hóa 18 phòng và kho cổ vật di sản)."
    )
    helper.add_body_p(doc,
        "Về mặt kiến trúc thu thập dữ liệu, Prometheus đóng vai trò là cơ sở dữ liệu chuỗi thời gian (Time-Series Database - TSDB) thực hiện cơ chế "
        "kéo (Pull/Scraping) các chỉ số định lượng từ các thành phần giám sát (cAdvisor thu thập số liệu tiêu thụ CPU/RAM của từng container, Node Exporter "
        "theo dõi tải phần cứng máy chủ chủ quản). Đồng thời, Grafana Engine kết nối trực tiếp với hệ quản trị CSDL quan hệ PostgreSQL 16 thông qua tài khoản "
        "truy vấn an toàn chỉ đọc (Read-Only user: pg_readonly). Cơ chế này đảm bảo Grafana chỉ thực hiện các lệnh SELECT tổng hợp số liệu vé và doanh thu, "
        "hoàn toàn triệt tiêu nguy cơ sửa đổi hoặc làm rò rỉ dữ liệu gốc của bảo tàng [13], [32]."
    )
    helper.add_body_p(doc,
        "Đặc biệt, để ban quản trị bảo tàng có thể theo dõi số liệu trực tiếp ngay bên trong cổng quản trị Admin (mục Báo cáo & Thống kê và Nhật ký & Giám sát) "
        "mà không cần đăng nhập rời rạc vào cổng phụ của Grafana, nhóm nghiên cứu đã hiện thực kỹ thuật nhúng bảng điều khiển bảo mật (Secure Dashboard Embedding). "
        "Các cơ chế an ninh mạng được cấu hình nghiêm ngặt bao gồm: kích hoạt cờ allow_embedding = true trong tệp cấu hình grafana.ini, cấu hình Cookie phiên "
        "làm việc chuẩn SameSite=None; Secure, và thiết lập chính sách bảo mật nội dung HTTP Content-Security-Policy: frame-ancestors 'self' https://museumhcm.duckdns.org "
        "nhằm triệt tiêu triệt để nguy cơ tấn công chiếm quyền nhấp chuột (Clickjacking) từ các tên miền giả mạo bên ngoài [18], [32]."
    )
    
    # Placeholder Hình 2.14
    helper.add_figure_placeholder(doc, "2.14",
        "Sơ đồ kiến trúc thu thập và hiển thị dữ liệu giám sát hệ thống với Grafana & Prometheus",
        "Mô hình tích hợp đa nguồn: Thu thập Metrics hạ tầng VPS, Container cAdvisor, APM API và CSDL PostgreSQL Read-Only nhúng bảo mật vào Admin",
        width_cm=15.0, height_cm=7.5
    )
    
    # 2.2.6. Công nghệ dịch thuật ngữ cảnh di sản và xử lý ngôn ngữ tự nhiên đa ngôn ngữ
    helper.add_heading_3(doc, "2.2.6. Công nghệ dịch thuật ngữ cảnh di sản và xử lý ngôn ngữ tự nhiên đa ngôn ngữ")
    helper.add_body_p(doc,
        "Bảo tàng Lịch sử TP. Hồ Chí Minh là điểm đến văn hóa quốc tế, thường xuyên đón tiếp đông đảo du khách nước ngoài và các nhà nghiên cứu đa quốc gia. "
        "Do đó, yêu cầu bản địa hóa ngôn ngữ không chỉ dừng lại ở việc chuyển đổi các nhãn tĩnh giao diện (UI labels) mà đòi hỏi chuyển ngữ chính xác thuật ngữ "
        "lịch sử, niên đại triều đại và giá trị khảo cổ của từng hiện vật trưng bày [2], [28]. Nhóm nghiên cứu kết hợp công nghệ Dịch máy thần kinh (Neural Machine "
        "Translation - NMT) của Google Cloud Translation API [36] và Mô hình ngôn ngữ lớn (LLM) Google Gemini [25], [26] để xử lý dịch thuật chuyên sâu."
    )
    helper.add_body_p(doc,
        "Về mặt kiến trúc ứng dụng, nhóm tác giả đề xuất nguyên lý thiết kế phân tách độc lập giữa Ngôn ngữ giao diện hệ thống (System UI Language) và "
        "Ngôn ngữ thuyết minh không gian/cổ vật (Entity Context Language). Trong thực tế tham quan, khách quốc tế hoặc người dùng nghiên cứu có nhu cầu giữ "
        "giao diện hệ thống quen thuộc nhưng chủ động chuyển đổi ngôn ngữ thuyết minh của một gian phòng cụ thể hoặc một hiện vật đang xem sang tiếng Anh hoặc tiếng Pháp. "
        "Kiến trúc này cho phép chuyển đổi ngôn ngữ cục bộ ngay trên màn hình Tour 360° một cách mượt mà mà không làm tải lại toàn bộ trang web hoặc làm xáo trộn "
        "ngôn ngữ điều hướng chung của ứng dụng."
    )
    
    # 2.2.7. Công nghệ tổng hợp giọng nói Text-to-Speech và Cơ chế lưu trữ đệm âm thanh (Audio Caching Architecture)
    helper.add_heading_3(doc, "2.2.7. Công nghệ tổng hợp giọng nói Text-to-Speech và Cơ chế lưu trữ đệm âm thanh (Audio Caching Architecture)")
    helper.add_body_p(doc,
        "Để nâng cao trải nghiệm tham quan sống động như có hướng dẫn viên thực thụ tại bảo tàng, hệ thống tích hợp công nghệ tổng hợp giọng nói trí tuệ nhân tạo "
        "Google Cloud Text-to-Speech thế hệ Neural2 [31]. Công nghệ này sử dụng mạng nơ-ron sâu mô phỏng ngữ điệu con người với chất giọng tự nhiên, ấm áp, "
        "rất phù hợp với không gian trang nghiêm của bảo tàng lịch sử. Hệ thống áp dụng chuẩn ngôn ngữ đánh dấu tổng hợp tiếng nói (Speech Synthesis Markup Language - SSML) "
        "để tinh chỉnh điểm ngắt nghỉ sau các niên đại lịch sử, điều chỉnh cao độ (pitch) và tốc độ đọc (speaking rate) phù hợp với từng ngôn ngữ (Việt, Anh, Pháp)."
    )
    helper.add_body_p(doc,
        "Đặc biệt, nhằm tối ưu hóa chi phí gọi API đám mây và triệt tiêu độ trễ mạng khi phát âm thanh, nhóm nghiên cứu thiết kế Kiến trúc lưu trữ đệm âm thanh dạng băm "
        "(Hash-based Audio Storage Architecture). Khi quản trị viên biên tập bài thuyết minh cho một gian phòng hoặc cổ vật, hệ thống tính toán một khóa băm tĩnh duy nhất: "
        "AudioKey = MD5(entity_id + lang + voice_code + text_content). Hệ thống kiểm tra trong thư mục lưu trữ tĩnh /audio_cache/ xem tệp {AudioKey}.mp3 đã tồn tại hay chưa. "
        "Nếu tệp đã tồn tại, đường dẫn tĩnh được trả về ngay lập tức với tiêu đề HTTP Cache-Control: public, max-age=31536000, immutable cho phép trình duyệt máy khách "
        "lưu đệm vĩnh viễn và phát trực tuyến tức thì với độ trễ dưới 50ms. Nếu tệp chưa tồn tại, hệ thống mới tiến hành gọi API Google Cloud TTS để kết xuất âm thanh, "
        "ghi tệp vào đĩa cứng máy chủ và cập nhật liên kết vào CSDL. Cơ chế này giúp bảo tàng tiết kiệm 100% chi phí gọi lại API cho các lượt nghe tiếp theo [18], [31]."
    )
    
    doc.add_page_break()
    print("Chapter 2 added successfully.")
