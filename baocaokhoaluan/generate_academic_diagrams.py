# -*- coding: utf-8 -*-
"""
GENERATE ALL ACADEMIC DIAGRAMS FOR THESIS REPORT
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 9.5

def create_box(ax, x, y, w, h, text, title="", bg_color="#F8FAFC", border_color="#1E293B", title_color="#0F172A", text_color="#334155", lw=1.6):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  facecolor=bg_color, edgecolor=border_color, linewidth=lw, zorder=2)
    ax.add_patch(rect)
    if title:
        ax.text(x + w / 2, y + h - 0.08, title, ha='center', va='top', fontsize=10, fontweight='bold', color=title_color, zorder=3)
        if text:
            ax.text(x + w / 2, y + (h - 0.12) / 2, text, ha='center', va='center', fontsize=8.5, color=text_color, zorder=3)
    else:
        ax.text(x + w / 2, y + h / 2, text, ha='center', va='center', fontsize=9, fontweight='bold', color=title_color, zorder=3)

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#1E293B", label_offset=(0, 0.04), lw=1.5):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=lw, shrinkA=4, shrinkB=4, mutation_scale=14), zorder=4)
    if label:
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        ax.text(mx, my, label, ha='center', va='center', fontsize=8, fontweight='bold', color=color,
                bbox=dict(boxstyle="square,pad=0.15", facecolor='white', edgecolor='none', alpha=0.9), zorder=5)

def gen_fig_1_1():
    fig, ax = plt.subplots(figsize=(10, 4.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 5); ax.axis('off')
    create_box(ax, 3.8, 1.8, 2.4, 1.4, "BẢO TÀNG LỊCH SỬ TP.HCM\n(museumhcm.duckdns.org)", "HỆ THỐNG TOUR 360°", bg_color="#E0E7FF", border_color="#3730A3", title_color="#1E1B4B")
    create_box(ax, 0.4, 3.2, 2.8, 1.5, "• Tham quan 360° WebGL 60 FPS\n• Chiêm ngưỡng Cổ vật 3D\n• Tìm đường ngắn nhất Dijkstra\n• Trợ lý Di sản Ảo AI", "1. KHÁCH THAM QUAN", bg_color="#E0F2FE", border_color="#0284C7", title_color="#0369A1")
    create_box(ax, 6.8, 3.2, 2.8, 1.5, "• Quản lý danh mục 18 gian phòng\n• Quản trị Cổ vật & File 3D .GLB\n• Tùy biến thương hiệu & Đa Bảo Tàng\n• Điều khiển bảo trì & Giám sát VPS", "2. QUẢN TRỊ VIÊN CMS", bg_color="#DCFCE7", border_color="#16A34A", title_color="#15803D")
    create_box(ax, 0.4, 0.3, 2.8, 1.5, "• 4 Nguồn ảnh Panorama Studio\n• Lọc rung mờ Laplacian (Var >= 100)\n• Động cơ 3D Cục bộ (Local CPU)\n• Động cơ 3D Cloud AI (TRELLIS)", "3. STUDIO SỐ HÓA 360°/3D", bg_color="#FEF3C7", border_color="#D97706", title_color="#B45309")
    create_box(ax, 6.8, 0.3, 2.8, 1.5, "• Cổng VietQR Napas 247 qua PayOS\n• Webhook ký số HMAC-SHA256\n• Vé điện tử mã QR mã hóa AES-256\n• Soát vé camera thời gian thực 150ms", "4. THƯƠNG MẠI SỐ & SOÁT VÉ", bg_color="#F3E8FF", border_color="#9333EA", title_color="#7E22CE")
    draw_arrow(ax, 3.8, 2.8, 3.2, 3.6, color="#0284C7")
    draw_arrow(ax, 6.2, 2.8, 6.8, 3.6, color="#16A34A")
    draw_arrow(ax, 3.8, 2.2, 3.2, 1.4, color="#D97706")
    draw_arrow(ax, 6.2, 2.2, 6.8, 1.4, color="#9333EA")
    plt.title("HÌNH 1.1: SƠ ĐỒ TƯ DUY PHÂN CẤP CHỨC NĂNG HỆ THỐNG BẢO TÀNG 360°", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_1_3():
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    steps = [
        ("ĐỢT 1: KHẢO SÁT KIẾN TRÚC", "• Đo đạc 18 phòng trưng bày\n• Lập ma trận liên thông kề\n• Đánh giá ánh sáng thực địa", 0.3, "#E0F2FE", "#0284C7"),
        ("ĐỢT 2: CHỤP ẢNH 360° 8K", "• Chụp ống kính góc rộng\n• Độ phủ chồng lấp 30-50%\n• Lọc mờ Laplacian (Var>=100)", 2.7, "#DCFCE7", "#16A34A"),
        ("ĐỢT 3: SỐ HÓA CỔ VẬT 3D", "• Chụp đa góc 17 bảo vật\n• Dựng 3D Local CPU & TRELLIS\n• Nở biên vân & Sinh Normal", 5.1, "#FEF3C7", "#D97706"),
        ("ĐỢT 4: THỬ NGHIỆM VẬN HÀNH", "• Nạp thuyết minh TTS Neural2\n• Thử thanh toán VietQR PayOS\n• Quét thử mã QR soát vé cổng", 7.5, "#F3E8FF", "#9333EA")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.2, 2.0, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.5: draw_arrow(ax, x + 2.2, 1.4, x + 2.65, 1.4, color="#475569")
    plt.title("HÌNH 1.3: QUY TRÌNH 4 ĐỢT KHẢO SÁT VÀ THU THẬP DỮ LIỆU TẠI BẢO TÀNG LỊCH SỬ TP.HCM", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_3_khao_sat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_1():
    fig, ax = plt.subplots(figsize=(9.5, 3.0), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 3.0); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.6, 2.0, "Điểm P(X, Y, Z)\nnằm trên mặt cầu đơn vị\nX^2 + Y^2 + Z^2 = 1", "KHÔNG GIAN 3D CẦU", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.5, 0.5, 2.6, 2.0, "Kinh độ theta in [-pi, pi]\nVĩ độ phi in [-pi/2, pi/2]\n(Công thức 2.1 & 2.2)", "GÓC CẦU (THETA, PHI)", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 6.6, 0.5, 2.6, 2.0, "Tọa độ pixel (x, y)\nChiều dài W, chiều cao H\nTỷ lệ 2:1 (8192 x 4096)", "ẢNH PHẲNG EQUIRECTANGULAR", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 3.0, 1.7, 3.5, 1.7, "Ánh xạ lượng giác")
    draw_arrow(ax, 3.5, 1.1, 3.0, 1.1, "Nghịch đảo (2.3, 2.4)")
    draw_arrow(ax, 6.1, 1.7, 6.6, 1.7, "Chuẩn hóa pixel")
    draw_arrow(ax, 6.6, 1.1, 6.1, 1.1, "Lấy mẫu màu")
    plt.title("HÌNH 2.1: MÔ HÌNH CHUYỂN ĐỔI GIỮA HỆ TỌA ĐỘ CẦU VÀ ẢNH PHẲNG EQUIRECTANGULAR", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_2():
    fig, ax = plt.subplots(figsize=(9.5, 2.8), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 2.8); ax.axis('off')
    create_box(ax, 0.4, 0.4, 2.4, 2.0, "Tọa độ pixel (x_p, y_p)\nẢnh góc rộng từ camera\n(Chưa nắn chỉnh)", "1. ẢNH PHẲNG GỐC", bg_color="#F1F5F9", border_color="#475569")
    create_box(ax, 3.4, 0.4, 2.6, 2.0, "Tiêu cự f = W / (2*tan(FOV/2))\nChiếu lên mặt trụ bán kính f\n(Công thức 2.5 & 2.6)", "2. PHÉP CHIẾU MẶT TRỤ", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 6.6, 0.4, 2.5, 2.0, "Tọa độ trụ (x_cyl, y_cyl)\nNội suy màu Bilinear\nTriệt tiêu biến dạng góc", "3. ẢNH ĐÃ NẮN TRỤ", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 2.8, 1.4, 3.4, 1.4, "Nắn trụ f")
    draw_arrow(ax, 6.0, 1.4, 6.6, 1.4, "Nội suy Bilinear (2.7, 2.8)")
    plt.title("HÌNH 2.2: QUY TRÌNH NẮN CHỈNH BIẾN DẠNG HÌNH HỌC TRỤ (CYLINDRICAL WARPING)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_2_cylindrical_warping.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_3():
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    steps = [
        ("1. ẢNH GỐC I(x,y)", "Khung ảnh nắn trụ\nKích thước gốc W x H\nChuyển ảnh xám Grayscale", 0.3, "#F1F5F9", "#475569"),
        ("2. THÁP GAUSS L", "Làm mờ Gauss liên tục\nL(x,y,sigma) = G * I\nvới scale k^i * sigma", 2.7, "#E0F2FE", "#0284C7"),
        ("3. SAI PHÂN DoG", "Trừ hai ảnh Gauss kề:\nD(x,y,sigma) = L_i+1 - L_i\nLàm nổi bật biên cạnh", 5.1, "#FEF3C7", "#D97706"),
        ("4. ĐẶC TRƯNG SIFT", "So sánh 26 điểm lân cận\nTìm cực trị không gian\nĐặc trưng bất biến tỉ lệ", 7.5, "#DCFCE7", "#16A34A")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.2, 2.0, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.5: draw_arrow(ax, x + 2.2, 1.4, x + 2.65, 1.4, color="#475569")
    plt.title("HÌNH 2.3: KHÔNG GIAN TỶ LỆ SAI PHÂN GAUSS (DoG) VÀ TRÍCH XUẤT ĐẶC TRƯNG SIFT", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_3_dog_sift.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_4():
    fig, ax = plt.subplots(figsize=(9.5, 3.0), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 3.0); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.6, 2.0, "Trích xuất SIFT Descriptor\nVector 128 chiều bất biến\nKhớp cặp k-NN (Ratio < 0.75)", "1. SO KHỚP ĐẶC TRƯNG", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.5, 0.5, 2.6, 2.0, "Chọn ngẫu nhiên 4 cặp điểm\nƯớc lượng Homography H\nĐếm số lượng Inliers\nLặp tối ưu N chu kỳ", "2. THUẬT TOÁN RANSAC", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 6.6, 0.5, 2.5, 2.0, "Loại bỏ 100% Outliers do\nphản chiếu đèn / tủ kính\nTính độ dịch chuyển (dx, dy)", "3. MA TRẬN DỊCH CHUYỂN", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 3.0, 1.5, 3.5, 1.5, "Cặp điểm thô")
    draw_arrow(ax, 6.1, 1.5, 6.6, 1.5, "Khử nhiễu")
    plt.title("HÌNH 2.4: KHỚP CẶP ĐIỂM ĐẶC TRƯNG SIFT VÀ LOẠI BỎ NHIỄU NGOẠI LAI BẰNG RANSAC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_4_ransac.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_5():
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    steps = [
        ("1. CẶP ẢNH CHỒNG LẤP", "Hai ảnh kề nhau nắn trụ\nVùng phủ 30% - 50%\nKhớp vị trí bằng RANSAC", 0.3, "#F1F5F9", "#475569"),
        ("2. VORONOI SEAM CUT", "Tìm đường cắt tối ưu Seam\nHàm năng lượng Gradient\nTránh cắt qua cổ vật", 2.7, "#FEF3C7", "#D97706"),
        ("3. THÁP LAPLACIAN", "Phân rã tháp đa dải tần\n(Tần số cao & Tần số thấp)\nTránh nhòe chi tiết", 5.1, "#E0F2FE", "#0284C7"),
        ("4. HÒA TRỘN ĐA TẦNG", "Hòa trộn từng dải tần số\nTriệt tiêu hoàn toàn vết lằn\nẢnh Panorama mịn màng", 7.5, "#DCFCE7", "#16A34A")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.2, 2.0, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.5: draw_arrow(ax, x + 2.2, 1.4, x + 2.65, 1.4, color="#475569")
    plt.title("HÌNH 2.5: QUY TRÌNH TỐI ƯU ĐƯỜNG GHÉP MÍ (SEAM CUTTING) VÀ HÒA TRỘN ĐA DẢI TẦN", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_5_seam_blending.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_6():
    fig, ax = plt.subplots(figsize=(9.5, 3.0), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 3.0); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.6, 2.0, "Ảnh toàn cảnh 8K WebP\nKích thước 8192 x 4096\n(360° x 180° Equirectangular)", "1. TEXTURE PANORAMA", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.5, 0.5, 2.6, 2.0, "Khối cầu R = 500 đơn vị\nĐảo ngược pháp tuyến Face\n(Inverted Sphere Geometry)", "2. THREE.JS SPHERE", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 6.6, 0.5, 2.5, 2.0, "PerspectiveCamera tại O(0,0,0)\nXoay góc Yaw / Pitch tự do\nHotspot Raycasting chuyển phòng", "3. KHÔNG GIAN TƯƠNG TÁC", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 3.0, 1.5, 3.5, 1.5, "Ánh xạ UV")
    draw_arrow(ax, 6.1, 1.5, 6.6, 1.5, "Kết xuất WebGL")
    plt.title("HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN HÌNH CẦU 3D TRONG THREE.JS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_6_texture_mapping.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_7():
    fig, ax = plt.subplots(figsize=(10, 3.0), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.0); ax.axis('off')
    steps = [
        ("1. KHỞI TẠO", "Đồ thị 18 đỉnh 34 cạnh\nd[start] = 0\nd[v] = vô cùng", 0.4, "#E0F2FE", "#0284C7"),
        ("2. MIN-HEAP QUEUE", "Đưa đỉnh vào hàng đợi\nRút đỉnh u có d[u] min\nĐánh dấu đã ghé thăm", 2.8, "#FEF3C7", "#D97706"),
        ("3. NỚI LỎNG CẠNH", "Duyệt đỉnh kề v của u:\nNếu d[v] > d[u] + w(u,v)\nCập nhật d[v] & trace[v]=u", 5.2, "#DCFCE7", "#16A34A"),
        ("4. TRUY VẾT & HIỂN THỊ", "Truy vết mảng parent\nVẽ đường nét đứt Mini-map\nHướng mũi tên 3D Hotspot", 7.6, "#F3E8FF", "#9333EA")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.1, 2.1, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.6: draw_arrow(ax, x + 2.1, 1.45, x + 2.75, 1.45, color="#475569")
    plt.title("HÌNH 2.7: SƠ ĐỒ NGUYÊN LÝ GIẢI THUẬT DIJKSTRA ĐỊNH TUYẾN 18 PHÒNG TRƯNG BÀY", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_8():
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    steps = [
        ("1. ẢNH TƯ LIỆU", "Chụp cổ vật 360 độ\n(1 ảnh đơn hoặc đa góc)\nĐầy đủ hoa văn chi tiết", 0.3, "#F1F5F9", "#475569"),
        ("2. TÁCH NỀN AI", "Thuật toán Otsu & Rembg\nTrích xuất Silhouette\nBảo toàn 100% biên dạng", 2.7, "#E0F2FE", "#0284C7"),
        ("3. DỰNG KHỐI 3D", "Local: Radial-Axial v15.0\nCloud: TRELLIS SLAT\nChuẩn hóa vòm cầu Harmonic", 5.1, "#FEF3C7", "#D97706"),
        ("4. ĐÓNG GÓI .GLB", "Nở biên vân 18 chu kỳ\nSinh Normal Map PBR\nXuất tệp chuẩn Three.js", 7.5, "#DCFCE7", "#16A34A")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.2, 2.0, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.5: draw_arrow(ax, x + 2.2, 1.4, x + 2.65, 1.4, color="#475569")
    plt.title("HÌNH 2.8: QUY TRÌNH TÁI TẠO MÔ HÌNH CỔ VẬT 3D TỪ CHUỖI ẢNH CHỤP ĐA GÓC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_8_photogrammetry.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_9():
    fig, ax = plt.subplots(figsize=(9.5, 4.2), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 4.2); ax.axis('off')
    create_box(ax, 0.5, 2.9, 8.5, 1.1,
               "• Client Web: React 18, TypeScript, Vite, TailwindCSS\n• Đồ họa WebGL Canvas: Three.js (Inverted Sphere, Hotspot Raycasting, 3D Loader)\n• Thư viện Soát vé Camera: html5-qrcode | Âm thanh: Web Audio API",
               "1. TẦNG TRÌNH DIỄN (PRESENTATION TIER - CLIENT)", bg_color="#E0F2FE", border_color="#0284C7", title_color="#0369A1")
    create_box(ax, 0.5, 1.5, 8.5, 1.1,
               "• RESTful API Gateway: Node.js v20 LTS, Express Framework, JWT Authentication\n• Xử lý ảnh & Video Worker: Python Stitching Service (SIFT, RANSAC, Cylindrical)\n• Dịch vụ Đám mây: PayOS VietQR, Google Cloud TTS Neural2, Hugging Face ZeroGPU",
               "2. TẦNG ỨNG DỤNG & NGHIỆP VỤ (APPLICATION TIER - SERVER)", bg_color="#DCFCE7", border_color="#16A34A", title_color="#15803D")
    create_box(ax, 0.5, 0.1, 8.5, 1.1,
               "• PostgreSQL 16: Giao dịch ACID (Users, Tickets, Orders)\n• MongoDB 7.0: Lưu trữ phi cấu trúc (Rooms, Panoramas, Hotspots, Artifacts)\n• Redis 7.0: Bộ nhớ đệm & Khóa Mutex | Cloudflare R2: Lưu trữ File 3D .GLB",
               "3. TẦNG DỮ LIỆU & LƯU TRỮ (DATA TIER - STORAGE)", bg_color="#FEF3C7", border_color="#D97706", title_color="#B45309")
    draw_arrow(ax, 4.75, 2.9, 4.75, 2.6, "HTTPS / JSON API")
    draw_arrow(ax, 4.75, 1.5, 4.75, 1.2, "TCP / SQL & MQL")
    plt.title("HÌNH 2.9: KIẾN TRÚC PHÂN TẦNG HỆ THỐNG (3-TIER LAYERED ARCHITECTURE)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_10():
    fig, ax = plt.subplots(figsize=(9.5, 3.0), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 3.0); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.6, 2.0, "Nhập Email đăng nhập\nNhận mã OTP bảo mật\nGửi POST /api/auth/verify", "1. CLIENT ĐĂNG NHẬP", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.5, 0.5, 2.6, 2.0, "Đối chiếu CSDL PostgreSQL\nKý số JWT (HMAC-SHA256)\nPayload: userId, role, exp", "2. AUTH SERVER", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 6.6, 0.5, 2.5, 2.0, "Lưu JWT trong LocalStorage\nĐính kèm Authorization Header\nTruy cập phân hệ quản trị", "3. PHÂN QUYỀN TRUY CẬP", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 3.0, 1.5, 3.5, 1.5, "Verify OTP")
    draw_arrow(ax, 6.1, 1.5, 6.6, 1.5, "Trả về JWT Token")
    plt.title("HÌNH 2.10: MÔ HÌNH XÁC THỰC PHÂN QUYỀN NGƯỜI DÙNG BẰNG JSON WEB TOKEN (JWT)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_10_jwt_auth.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_11():
    fig, ax = plt.subplots(figsize=(10, 3.2), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.2); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.0, 2.2, "Du khách chọn vé\nNhập Email & Số lượng\nBấm 'Thanh toán'", "1. KHÁCH ĐẶT VÉ", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 2.8, 0.5, 2.1, 2.2, "Gọi PayOS Open API\nSinh mã VietQR Napas 247\nChứa số tiền & mã đơn", "2. PAYOS GATEWAY", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 5.2, 0.5, 2.1, 2.2, "Mở App Ngân hàng\nQuét mã chuyển tiền\nNgân hàng báo Có tức thì", "3. NGÂN HÀNG (NAPAS)", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 7.6, 0.5, 2.0, 2.2, "Webhook HMAC-SHA256\nCập nhật CSDL PostgreSQL\nSinh vé QR AES-256 qua Mail", "4. SERVER XUẤT VÉ", bg_color="#F3E8FF", border_color="#9333EA")
    draw_arrow(ax, 2.4, 2.0, 2.8, 2.0, "Tạo đơn")
    draw_arrow(ax, 4.9, 2.0, 5.2, 2.0, "Sinh VietQR")
    draw_arrow(ax, 7.3, 2.0, 7.6, 2.0, "Chuyển tiền")
    draw_arrow(ax, 7.6, 1.0, 2.4, 1.0, "Gửi Vé QR Email khách", label_offset=(0, -0.15))
    plt.title("HÌNH 2.11: QUY TRÌNH THANH TOÁN VIETQR VÀ XÁC THỰC WEBHOOK QUA CỔNG PAYOS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_11_payos_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_12():
    fig, ax = plt.subplots(figsize=(9.5, 3.0), dpi=220)
    ax.set_xlim(0, 9.5); ax.set_ylim(0, 3.0); ax.axis('off')
    create_box(ax, 0.4, 0.5, 2.6, 2.0, "Nhân viên mở Web trên Mobile\nCamera quét mã QR với 15 fps\nthư viện html5-qrcode", "1. CAMERA QUÉT VÉ", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.5, 0.5, 2.6, 2.0, "Giải mã AES-256 mã vé\nĐối chiếu PostgreSQL (150ms)\nKiểm tra ngày & trạng thái", "2. ĐỐI SOÁT CSDL", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 6.6, 0.5, 2.5, 2.0, "Chuyển trạng thái sang 'USED'\nHiển thị dấu tích xanh hợp lệ\nPhát âm báo 'Bíp' qua cổng", "3. XÁC NHẬN HỢP LỆ", bg_color="#DCFCE7", border_color="#16A34A")
    draw_arrow(ax, 3.0, 1.5, 3.5, 1.5, "Gửi mã vé")
    draw_arrow(ax, 6.1, 1.5, 6.6, 1.5, "Hợp lệ (150ms)")
    plt.title("HÌNH 2.12: QUY TRÌNH QUÉT VÀ KIỂM TRA MÃ VÉ QR THỜI GIAN THỰC TẠI CỔNG BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_12_qr_validation.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_13():
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 4.2); ax.axis('off')
    create_box(ax, 0.3, 1.5, 2.0, 1.4, "Người dùng Internet\n(Web Browser / Mobile)", "INTERNET CLIENT", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 2.8, 1.0, 2.4, 2.4, "Nginx Reverse Proxy\n• SSL Let's Encrypt\n• Load Balancing\n• Gzip & Cache 360°/3D\n(Port 80 / 443)", "NGINX REVERSE PROXY", bg_color="#F1F5F9", border_color="#334155")
    create_box(ax, 5.8, 2.8, 1.8, 1.1, "React 18 SPA\n(Vite Build Port 80)", "FRONTEND", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 7.9, 2.8, 1.8, 1.1, "Node.js Express\n(Port 5000)", "BACKEND API", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 5.8, 1.5, 1.8, 1.1, "PostgreSQL 16\n(Port 5432 - ACID)", "POSTGRESQL", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 7.9, 1.5, 1.8, 1.1, "MongoDB 7.0\n(Port 27017 - Di sản)", "MONGODB", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 5.8, 0.2, 1.8, 1.1, "Redis 7.0\n(Port 6379 - Cache)", "REDIS", bg_color="#FEE2E2", border_color="#DC2626")
    create_box(ax, 7.9, 0.2, 1.8, 1.1, "RabbitMQ Broker\n(Port 5672 - Queue)", "RABBITMQ", bg_color="#F3E8FF", border_color="#9333EA")
    draw_arrow(ax, 2.3, 2.2, 2.8, 2.2, "HTTPS 443")
    draw_arrow(ax, 5.2, 3.2, 5.8, 3.2)
    draw_arrow(ax, 5.2, 2.2, 7.9, 3.2)
    draw_arrow(ax, 7.9, 2.8, 6.7, 2.6)
    draw_arrow(ax, 8.8, 2.8, 8.8, 2.6)
    plt.title("HÌNH 2.13: SƠ ĐỒ ĐIỀU PHỐI CONTAINER VỚI DOCKER COMPOSE VÀ NGINX TRÊN VPS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_13_docker_compose.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_1():
    fig, ax = plt.subplots(figsize=(10, 4.4), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 4.4); ax.axis('off')
    create_box(ax, 0.3, 2.8, 2.2, 1.2, "• Tham quan phòng 360°\n• Chiêm ngưỡng Cổ vật 3D\n• Đặt vé & Nhận vé điện tử", "KHÁCH THAM QUAN", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 0.3, 0.4, 2.2, 1.2, "• Quản lý 18 phòng & Hotspot\n• Tùy biến thương hiệu CMS\n• Điều khiển chế độ bảo trì", "QUẢN TRỊ VIÊN ADMIN", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 7.5, 2.8, 2.2, 1.2, "• Quét camera soát vé cổng\n• Tra cứu thông tin vé QR\n• Báo cáo lượt khách vào", "NHÂN VIÊN SOÁT VÉ", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 7.5, 0.4, 2.2, 1.2, "• Cổng thanh toán VietQR PayOS\n• Cloud AI TRELLIS ZeroGPU\n• Google Cloud TTS Voice", "DỊCH VỤ ĐÁM MÂY", bg_color="#F3E8FF", border_color="#9333EA")
    create_box(ax, 3.2, 1.2, 3.6, 2.2, "1. Phân hệ Khách tham quan Tour 360°\n2. Phân hệ Quản trị CMS & Đa Bảo Tàng\n3. Phân hệ Studio Ghép ảnh & Tái tạo 3D\n4. Phân hệ Thanh toán VietQR & Soát vé", "HỆ THỐNG BẢO TÀNG 360°", bg_color="#F8FAFC", border_color="#1E293B")
    draw_arrow(ax, 2.5, 3.4, 3.2, 2.8)
    draw_arrow(ax, 2.5, 1.0, 3.2, 1.8)
    draw_arrow(ax, 7.5, 3.4, 6.8, 2.8)
    draw_arrow(ax, 7.5, 1.0, 6.8, 1.8)
    plt.title("HÌNH 3.1: SƠ ĐỒ USE CASE TỔNG QUÁT TOÀN HỆ THỐNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_1_use_case_tong_quat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_5():
    fig, ax = plt.subplots(figsize=(10, 4.4), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 4.4); ax.axis('off')
    create_box(ax, 0.4, 0.5, 4.2, 3.4,
               "• Users: id, email, password_hash, role\n• Tickets: id, ticket_code, order_id, status, visit_date\n• Orders: id, order_code, amount, status, qr_url\n(Đảm bảo tính toàn vẹn giao dịch ACID)",
               "POSTGRESQL 16 (GIAO DỊCH & BẢO MẬT)", bg_color="#FEF3C7", border_color="#D97706", title_color="#B45309")
    create_box(ax, 5.4, 0.5, 4.2, 3.4,
               "• Rooms: id, name, period, floorplan_pos\n• Panoramas: id, room_id, image_8k_url, fov\n• Hotspots: id, pano_id, target_room_id, yaw, pitch\n• Artifacts: id, title, model_3d_glb, audio_url\n(Lưu trữ linh hoạt đối tượng phi cấu trúc)",
               "MONGODB 7.0 (DỮ LIỆU DI SẢN SỐ)", bg_color="#DCFCE7", border_color="#16A34A", title_color="#15803D")
    draw_arrow(ax, 4.6, 2.2, 5.4, 2.2, "Đồng bộ qua syncEngine.ts")
    draw_arrow(ax, 5.4, 1.6, 4.6, 1.6, "Liên kết khóa logic")
    plt.title("HÌNH 3.5: MÔ HÌNH QUAN HỆ THỰC THỂ (ERD) VÀ CHIẾN LƯỢC LƯU TRỮ LAI", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_5_erd.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_1():
    fig, ax = plt.subplots(figsize=(10.2, 3.2), dpi=220)
    ax.set_xlim(0, 10.2); ax.set_ylim(0, 3.2); ax.axis('off')
    steps = [
        ("1. COMMIT & PUSH", "Lập trình viên Push mã\nlên nhánh main/master\nhoặc workflow_dispatch", 0.3, "#E0F2FE", "#0284C7"),
        ("2. GITHUB RUNNER", "Runner ubuntu-latest\nKiểm tra Concurrency Lock\n(cancel-in-progress: true)", 2.3, "#DCFCE7", "#16A34A"),
        ("3. SSH TUNNEL", "appleboy/ssh-action\nKết nối bảo mật qua\nGitHub Secrets SSH Key", 4.3, "#FEF3C7", "#D97706"),
        ("4. CLOUD VPS EXEC", "Git Pull mã mới\nCấu hình DNS Daemon\n(8.8.8.8, 1.1.1.1)", 6.3, "#F3E8FF", "#9333EA"),
        ("5. DOCKER BUILD", "docker compose up -d\nZero-Downtime build ngầm\nPrune image rác & Online", 8.3, "#DCFCE7", "#16A34A")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.5, 1.7, 2.1, desc, title, bg_color=bg, border_color=bdr)
        if x < 8.3: draw_arrow(ax, x + 1.7, 1.55, x + 2.25, 1.55, color="#334155")
    plt.title("HÌNH 4.1: SƠ ĐỒ ĐƯỜNG ỐNG TỰ ĐỘNG HÓA KIỂM THỬ VÀ TRIỂN KHAI CI/CD QUA GITHUB ACTIONS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_1_cicd_pipeline.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_3():
    fig, ax = plt.subplots(figsize=(10.5, 3.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.8); ax.axis('off')
    create_box(ax, 0.3, 1.9, 2.3, 1.6, "1. Chụp bằng webcam\n2. Chọn từ máy (DSLR)\n3. Tải Video quét phòng\n4. Quét phòng trực tiếp", "4 NGUỒN ẢNH ĐẦU VÀO", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.0, 1.9, 2.2, 1.6, "Tính phương sai Laplace:\nVar = Var(Laplace(I))\nLoại bỏ ảnh mờ Var < 100\nKiểm tra Overlap > 30%", "LỌC RUNG MỜ LAPLACIAN", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 5.6, 1.9, 2.2, 1.6, "Đọc tiêu cự f từ EXIF\nChiếu uốn cong mặt trụ\nBù trừ góc xoay Roll/Pitch\nNội suy Bilinear", "NẮN HÌNH HỌC TRỤ", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 8.1, 1.9, 2.1, 1.6, "Trích xuất SIFT Keypoints\nk-NN Matching cặp điểm\nRANSAC lọc ngoại lai\nTính độ tịnh tiến (dx, dy)", "SIFT & RANSAC", bg_color="#F3E8FF", border_color="#9333EA")
    create_box(ax, 8.1, 0.2, 2.1, 1.4, "Tìm đường cắt Voronoi\nTriệt tiêu vết lằn mí\n(Energy Gradient)", "SEAM CUTTING", bg_color="#F1F5F9", border_color="#475569")
    create_box(ax, 5.6, 0.2, 2.2, 1.4, "Phân rã đa dải tần\nLaplacian Pyramids\nHòa trộn mượt mà màu sắc", "MULTIBAND BLENDING", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 3.0, 0.2, 2.2, 1.4, "Xóa chân máy Tripod\nThuật toán Inpainting\nLàm mịn gạch sàn bảo tàng", "VÁ MỊN ĐÁY NADIR", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 0.3, 0.2, 2.3, 1.4, "Chuẩn Equirectangular\n360° x 180° - 8K Ultra HD\n(8192 x 4096 WebP)", "XUẤT ẢNH CẦU 360°", bg_color="#DCFCE7", border_color="#16A34A", title_color="#15803D")
    draw_arrow(ax, 2.6, 2.7, 3.0, 2.7)
    draw_arrow(ax, 5.2, 2.7, 5.6, 2.7)
    draw_arrow(ax, 7.8, 2.7, 8.1, 2.7)
    draw_arrow(ax, 9.15, 1.9, 9.15, 1.6)
    draw_arrow(ax, 8.1, 0.9, 7.8, 0.9)
    draw_arrow(ax, 5.6, 0.9, 5.2, 0.9)
    draw_arrow(ax, 3.0, 0.9, 2.6, 0.9)
    plt.title("HÌNH 4.3: QUY TRÌNH XỬ LÝ GHÉP ẢNH TOÀN CẢNH 360° TỪ 4 NGUỒN ẢNH ĐẦU VÀO", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_5():
    fig, ax = plt.subplots(figsize=(10.2, 4.4), dpi=220)
    ax.set_xlim(0, 10.2); ax.set_ylim(0, 4.4); ax.axis('off')
    create_box(ax, 0.4, 2.2, 2.2, 1.6, "1 Ảnh đơn (Single-view)\nhoặc Nhiều ảnh đa góc\n(Mặt trước, trái, phải, trên)", "ẢNH TƯ LIỆU HIỆN VẬT", bg_color="#E0F2FE", border_color="#0284C7")
    create_box(ax, 3.0, 2.4, 2.0, 1.2, "Kiểm tra cấu hình\nvà lựa chọn động cơ", "CHỌN ĐỘNG CƠ", bg_color="#F1F5F9", border_color="#475569")
    create_box(ax, 5.6, 2.8, 2.3, 1.3, "gradio_client gọi Space\nPing ZeroGPU A100\nStructured 3D Latents", "ĐÁM MÂY AI (TRELLIS)", bg_color="#DCFCE7", border_color="#16A34A")
    create_box(ax, 5.6, 1.0, 2.3, 1.5, "Tách nền Otsu & Rembg\nCắt lát xoay trục Radial v15.0\nNở biên vân & Sinh Normal Map\n(Chạy 100% CPU VPS)", "MÁY CHỦ NỘI BỘ (LOCAL CPU)", bg_color="#FEF3C7", border_color="#D97706")
    create_box(ax, 8.3, 1.8, 1.6, 1.6, "Mô hình 3D .GLB\nMesh khép kín\nTexture PBR chuẩn\n(Lưu trữ R2 & DB)", "XUẤT MÔ HÌNH .GLB", bg_color="#F3E8FF", border_color="#9333EA")
    draw_arrow(ax, 2.6, 3.0, 3.0, 3.0)
    draw_arrow(ax, 5.0, 3.2, 5.6, 3.2, "Chọn Trellis")
    draw_arrow(ax, 5.0, 2.6, 5.6, 1.8, "Chọn Local")
    draw_arrow(ax, 6.75, 2.8, 6.75, 2.5, "Hết Quota (429) / Timeout Fallback", color="#DC2626")
    draw_arrow(ax, 7.9, 3.2, 8.3, 2.8)
    draw_arrow(ax, 7.9, 1.8, 8.3, 2.4)
    plt.title("HÌNH 4.5: QUY TRÌNH TÁI TẠO CỔ VẬT 3D VỚI 2 ĐỘNG CƠ VÀ CƠ CHẾ DỰ PHÒNG TỰ ĐỘNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_7():
    fig, ax = plt.subplots(figsize=(10, 3.0), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.0); ax.axis('off')
    steps = [
        ("1. MA TRẬN KỀ", "Mặt bằng 18 phòng\nTrọng số khoảng cách thực\n(Đơn vị mét - Phụ lục A)", 0.4, "#E0F2FE", "#0284C7"),
        ("2. MIN-HEAP QUEUE", "Cấu trúc Min-Heap\nRút đỉnh u có d[u] min\nĐộ phức tạp O(E log V)", 2.8, "#FEF3C7", "#D97706"),
        ("3. NỚI LỎNG CẠNH", "Cập nhật d[v] = d[u] + w\nLưu mảng trace vết đỉnh\nTính toán dưới 5ms", 5.2, "#DCFCE7", "#16A34A"),
        ("4. CHỈ ĐƯỜNG TRỰC QUAN", "Vẽ nét đứt phát sáng\ntrên sơ đồ Mini-map 2D\nHướng mũi tên Hotspot 3D", 7.6, "#F3E8FF", "#9333EA")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.4, 2.1, 2.1, desc, title, bg_color=bg, border_color=bdr)
        if x < 7.6: draw_arrow(ax, x + 2.1, 1.45, x + 2.75, 1.45, color="#475569")
    plt.title("HÌNH 4.7: SƠ ĐỒ GIẢI THUẬT DIJKSTRA ĐỊNH TUYẾN TỐI ƯU GIỮA 18 PHÒNG BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_8():
    fig, ax = plt.subplots(figsize=(10.2, 3.2), dpi=220)
    ax.set_xlim(0, 10.2); ax.set_ylim(0, 3.2); ax.axis('off')
    steps = [
        ("1. ĐẶT VÉ TRÊN WEB", "Khách chọn loại vé\nNhập số lượng & Email\nBấm Xác nhận đặt vé", 0.3, "#E0F2FE", "#0284C7"),
        ("2. VIETQR PAYOS", "PayOS sinh mã VietQR\nChuẩn Napas 247 NHNN\nKhách quét App ngân hàng", 2.3, "#FEF3C7", "#D97706"),
        ("3. WEBHOOK KÝ SỐ", "Ngân hàng báo Có\nWebhook HMAC-SHA256\nCập nhật CSDL PostgreSQL", 4.3, "#DCFCE7", "#16A34A"),
        ("4. VÉ ĐIỆN TỬ AES-256", "Sinh vé mã hóa QR\nGửi tự động qua Email\nKhách xuất trình tại cổng", 6.3, "#F3E8FF", "#9333EA"),
        ("5. SOÁT VÉ CAMERA", "Camera quét html5-qrcode\nĐối soát 150ms CSDL\nChuyển USED & Âm báo", 8.3, "#DCFCE7", "#16A34A")
    ]
    for title, desc, x, bg, bdr in steps:
        create_box(ax, x, 0.5, 1.7, 2.1, desc, title, bg_color=bg, border_color=bdr)
        if x < 8.3: draw_arrow(ax, x + 1.7, 1.55, x + 2.25, 1.55, color="#334155")
    plt.title("HÌNH 4.8: QUY TRÌNH THANH TOÁN VIETQR VÀ KIỂM SOÁT VÉ CAMERA THỜI GIAN THỰC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png"), bbox_inches='tight'); plt.close(fig)

if __name__ == '__main__':
    print("Dang tao toan bo 17 so do hoc thuat vector...")
    gen_fig_1_1(); gen_fig_1_3(); gen_fig_2_1(); gen_fig_2_2(); gen_fig_2_3()
    gen_fig_2_4(); gen_fig_2_5(); gen_fig_2_6(); gen_fig_2_7(); gen_fig_2_8()
    gen_fig_2_9(); gen_fig_2_10(); gen_fig_2_11(); gen_fig_2_12(); gen_fig_2_13()
    gen_fig_3_1(); gen_fig_3_5(); gen_fig_4_1(); gen_fig_4_3(); gen_fig_4_5()
    gen_fig_4_7(); gen_fig_4_8()
    print("=== HOAN TAT TAO TOAN BO 22 SO DO HOC THUAT CHUAN DEP! ===")
