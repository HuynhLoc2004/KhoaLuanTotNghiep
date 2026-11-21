# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ INFOGRAPHIC THUẦN HÌNH ẢNH (PURE ICON INFOGRAPHIC)
Chuẩn phong cách Hình 3 (Reference Image):
- BỎ HOÀN TOÀN TẤT CẢ CÁC Ô VUÔNG, KHUNG VIỀN HÌNH CHỮ NHẬT VÀ MÀU MÈ ĐÓNG HỘP.
- Mỗi nút là một BIỂU TƯỢNG HÌNH ẢNH TRỰC QUAN (Device, Server, Cloud, Database, AI Chip, 3D Mesh).
- Dưới mỗi biểu tượng chỉ có 1-2 dòng chữ ngắn gọn định danh.
- Chữ chủ yếu nằm trên MŨI TÊN kết nối biểu thị giao thức / luồng hành động.
=> Đạt độ thẩm mỹ tối đa, thoáng đãng, chuyên nghiệp chuẩn quốc tế!
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from PIL import Image

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
ASSETS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets"
DOCS_ICONS = r"d:\KhoaluanTotNghiep\docs\diagram_assets"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Font chữ chuẩn học thuật
plt.rcParams['font.sans-serif'] = ['Arial', 'Segoe UI', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Bảng màu học thuật trang nhã
C_DARK = '#0F172A'       # Chữ chính: Đen than chì sắc nét
C_MUTED = '#475569'      # Chữ phụ: Xám đậm
C_ARROW = '#334155'      # Mũi tên kết nối
C_LABEL_BG = '#FFFFFF'   # Nền nhãn mũi tên

def draw_icon_node(ax, x, y, icon_name, title, sub='', target_px=52):
    """
    Vẽ 1 NÚT THUẦN BIỂU TƯỢNG (Không ô vuông, không viền hộp):
    Icon ở tâm (x, y), Title in đậm bên dưới, Subtitle nhỏ hơn bên dưới.
    """
    p = os.path.join(DOCS_ICONS, icon_name)
    if os.path.exists(p):
        im = Image.open(p)
        zoom = float(target_px) / float(max(im.size))
        im_box = OffsetImage(im, zoom=zoom)
        ab = AnnotationBbox(im_box, (x, y), frameon=False, zorder=10)
        ax.add_artist(ab)
    
    # Chữ đặt ngay dưới icon, thoáng đãng
    ax.text(x, y - 0.50, title, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_DARK, zorder=12)
    if sub:
        ax.text(x, y - 0.78, sub, ha='center', va='top', fontsize=7.4, color=C_MUTED, zorder=12)

def draw_actor_node(ax, x, y, title="Quản trị viên", sub="", scale=1.0):
    """Vẽ tác nhân người dùng (User/Admin) thuần biểu tượng."""
    r = 0.16 * scale
    head = patches.Circle((x, y + 0.32 * scale), r, facecolor='#FFFFFF', edgecolor=C_ARROW, lw=1.3, zorder=10)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.04 * scale), 0.40 * scale, 0.28 * scale,
                           facecolor='#FFFFFF', edgecolor=C_ARROW, lw=1.3, zorder=10)
    ax.add_patch(body)
    ax.text(x, y - 0.32 * scale, title, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_DARK, zorder=12)
    if sub:
        ax.text(x, y - 0.58 * scale, sub, ha='center', va='top', fontsize=7.4, color=C_MUTED, zorder=12)

def draw_flow_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top', color=C_ARROW, linestyle='-', shrink=18):
    """Vẽ mũi tên kết nối trực tiếp giữa các biểu tượng với nhãn chữ nằm trên mũi tên."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.4, shrinkA=shrink, shrinkB=shrink,
                                mutation_scale=13, connectionstyle=conn, linestyle=linestyle), zorder=5)
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.22
        if label_side == 'top':
            lx, ly = mx, my + offset + (0.08 if rad > 0 else 0)
            ha, va = 'center', 'bottom'
        elif label_side == 'bottom':
            lx, ly = mx, my - offset - (0.08 if rad < 0 else 0)
            ha, va = 'center', 'top'
        elif label_side == 'left':
            lx, ly = mx - offset, my
            ha, va = 'right', 'center'
        else:
            lx, ly = mx + offset, my
            ha, va = 'left', 'center'

        full_text = f"{label}\n({sub})" if sub else label
        ax.text(lx, ly, full_text, ha=ha, va=va, fontsize=7.2, fontweight='bold' if label else 'normal',
                color=C_DARK,
                bbox=dict(boxstyle='round,pad=0.20', facecolor=C_LABEL_BG, edgecolor='#CBD5E1', lw=0.6, alpha=0.98),
                zorder=15)


# ==============================================================================
# 1. HÌNH 1 (MINDMAP TỔNG QUAN HỆ THỐNG) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_hinh_1_1_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 8.2), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 8.2); ax.axis('off')

    ax.text(7.75, 7.8, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 7.45, 'Hệ sinh thái số hóa di sản đa nền tảng kết nối trực tiếp qua chuẩn giao tiếp WebGL, REST API và WebSocket',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    # Nút trung tâm: Hệ thống Bảo tàng 360° (Icon 360 Grid / Mesh)
    draw_icon_node(ax, 7.75, 4.2, 'icon_360_grid.png', 'HỆ THỐNG BẢO TÀNG 360°', 'Bảo tàng Lịch sử TP.HCM', target_px=75)

    # 4 Nút xung quanh:
    # 1. Cổng Khách tham quan (Tây Bắc)
    draw_icon_node(ax, 2.5, 5.8, 'icon_phone.png', '1. Khách Tham Quan (Web Client)', 'Tour 360° & Cổ vật 3D', target_px=55)
    draw_flow_arrow(ax, 6.7, 4.7, 3.5, 5.6, label='WebGL Three.js (60 FPS)', shrink=22)

    # 2. Công nghệ AI & Âm thanh (Tây Nam)
    draw_icon_node(ax, 2.5, 2.4, 'icon_ai_chip.png', '2. Động Cơ AI & Âm Thanh', 'Google Cloud TTS Neural2', target_px=55)
    draw_flow_arrow(ax, 6.7, 3.7, 3.5, 2.6, label='Thuyết minh AI 7 ngôn ngữ', shrink=22)

    # 3. Thương mại & Vé VietQR (Đông Bắc)
    draw_icon_node(ax, 13.0, 5.8, 'icon_laptop.png', '3. Vé Điện Tử & VietQR', 'Cổng thanh toán PayOS Napas 247', target_px=55)
    draw_flow_arrow(ax, 8.8, 4.7, 12.0, 5.6, label='Webhook & Soát vé QR', shrink=22)

    # 4. Quản trị CMS & Giám sát (Đông Nam)
    draw_icon_node(ax, 13.0, 2.4, 'icon_monitor.png', '4. Quản Trị CMS & Grafana', 'Giám sát APM & Báo cáo Excel', target_px=55)
    draw_flow_arrow(ax, 8.8, 3.7, 12.0, 2.6, label='Grafana Kiosk & PostgreSQL', shrink=22)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_1_1_so_do_tu_duy_tong_quan.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 1 (Pure Infographic): hinh_1_1_mindmap.png")


# ==============================================================================
# 2. HÌNH 5 (TÁI TẠO CỔ VẬT 3D LAI GHÉP) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_4_5_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 8.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(7.75, 8.1, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI 2 ĐỘNG CƠ',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 7.75, 'Bố cục biểu tượng công cụ trực quan: Nguồn ảnh 2D, Bóc tách U2-Net, Điều phối Queue, Heuristic CPU và Cloud AI TRELLIS',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    # 1. Quản trị viên & Ảnh tư liệu 2D (Bên trái trên)
    draw_actor_node(ax, 1.2, 6.3, 'Quản trị viên', 'Nạp tư liệu', scale=1.0)
    draw_icon_node(ax, 3.8, 6.3, 'icon_phone.png', '1. Ảnh Tư Liệu 2D', 'Chụp hiện vật đơn / đa góc', target_px=55)
    draw_flow_arrow(ax, 1.7, 6.3, 3.0, 6.3, label='Tải ảnh')

    # 2. Bóc tách nền U2-Net (Bên phải trên)
    draw_icon_node(ax, 11.5, 6.3, 'icon_feature_match.png', '2. Bóc Tách Nền U2-Net', 'Chuẩn hóa kênh Alpha & Cân bằng sáng', target_px=55)
    draw_flow_arrow(ax, 4.6, 6.3, 10.4, 6.3, label='Gửi ảnh 2D (REST API)')

    # 3. Bộ điều phối đa động cơ (Ở giữa)
    draw_icon_node(ax, 7.75, 4.0, 'icon_server.png', '3. Bộ Điều Phối Đa Động Cơ', 'artifact3dQueue giám sát tài nguyên', target_px=58)
    draw_flow_arrow(ax, 11.5, 5.5, 8.6, 4.4, label='Đẩy hàng đợi', sub='artifact3dQueue', rad=0.15)

    # 4a. Động cơ Heuristic CPU (Bên trái giữa)
    draw_icon_node(ax, 2.8, 4.0, 'icon_laptop.png', 'Động Cơ Heuristic CPU', 'Dựng 2.5D Displacement (0.8s, 0$)', target_px=55)
    draw_flow_arrow(ax, 6.9, 4.0, 3.8, 4.0, label='Chế độ CPU (Nội bộ)')

    # 4b. Động cơ Cloud AI TRELLIS (Bên phải giữa)
    draw_icon_node(ax, 12.7, 4.0, 'icon_ai_chip.png', 'Động Cơ TRELLIS Cloud AI', 'HuggingFace ZeroGPU A100 (15s)', target_px=55)
    draw_flow_arrow(ax, 8.6, 4.0, 11.7, 4.0, label='Chế độ GPU (Ưu tiên AI)')

    # Đường Fallback tự động
    draw_flow_arrow(ax, 11.8, 3.4, 3.7, 3.4, label='Tự động Fallback khi Quota 429 hoặc Timeout > 300s',
                    color='#B91C1C', linestyle='--', label_side='bottom')

    # 5. Xuất bản hiện vật 3D (Ở dưới giữa)
    draw_icon_node(ax, 7.75, 1.4, 'icon_wireframe_3d.png', '4. Mô Hình 3D Hoàn Chỉnh (.GLB)',
                   'Nén kết cấu Draco (1.8 – 3.5 MB) nạp Three.js WebGL', target_px=55)
    draw_flow_arrow(ax, 3.3, 3.2, 7.0, 1.7, label='Lưới tròn xoay CPU')
    draw_flow_arrow(ax, 12.2, 3.2, 8.5, 1.7, label='Lưới PBR sắc nét 360°')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    out2 = os.path.join(ASSETS_DIR, "flow_04_dual_engine_3d.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 5 (Pure Infographic): hinh_4_5_artifact_2engines.png")


# ==============================================================================
# 3. HÌNH 6 (VÒNG ĐỜI VÉ VIETQR & SOÁT VÉ QR) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_3_6_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 8.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(7.75, 8.1, 'SƠ ĐỒ HOẠT ĐỘNG: VÒNG ĐỜI VÉ THAM QUAN, THANH TOÁN VIETQR VÀ SOÁT VÉ CAMERA QR',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 7.75, 'Quy trình 5 bước: Đặt vé trực tuyến, Thanh toán PayOS, Phát hành vé điện tử, Soát vé cổng và Cập nhật doanh thu',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    # 1. Đặt vé trực tuyến (Client) (Bên trái trên)
    draw_icon_node(ax, 3.5, 6.2, 'icon_laptop.png', '1. Đặt Vé Trực Tuyến (Client)', 'Chọn loại vé & khung giờ tham quan', target_px=55)

    # 2. Thanh toán VietQR PayOS (Bên phải trên)
    draw_icon_node(ax, 12.0, 6.2, 'icon_phone.png', '2. Thanh Toán VietQR (PayOS)', 'Quét mã Napas 247 chuyển khoản tức thì', target_px=55)
    draw_flow_arrow(ax, 4.6, 6.2, 10.9, 6.2, label='Khởi tạo đơn hàng (PayOS API)')

    # 3. Phát hành vé điện tử (Bên phải giữa)
    draw_icon_node(ax, 12.0, 3.7, 'icon_server.png', '3. Phát Hành Vé Điện Tử', 'Sinh mã BTLS-2026 & Vé mã hóa AES-256', target_px=58)
    draw_flow_arrow(ax, 12.0, 5.4, 12.0, 4.5, label='Webhook HMAC-SHA256', label_side='right')

    # 4. Soát vé bằng Camera QR (Bên trái giữa)
    draw_icon_node(ax, 3.5, 3.7, 'icon_phone.png', '4. Soát Vé Bằng Camera QR', 'Quét Camera cổng & Đối soát cơ sở dữ liệu', target_px=55)
    draw_flow_arrow(ax, 10.9, 3.7, 4.6, 3.7, label='Khách xuất trình vé tại cổng', sub='HTML5-QRCode')

    # 5. Cập nhật doanh thu & Trạng thái (Bên trái dưới)
    draw_icon_node(ax, 3.5, 1.3, 'icon_monitor.png', '5. Cập Nhật Doanh Thu & Trạng Thái', 'Chuyển trạng thái USED & Đồng bộ SSE (<1ms)', target_px=55)
    draw_flow_arrow(ax, 3.5, 2.9, 3.5, 2.1, label='Xác thực hợp lệ', sub='Cộng dồn doanh thu', label_side='left')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png")
    out2 = os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png")
    out3 = os.path.join(ASSETS_DIR, "flow_05_ticketing_vietqr_qr.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    fig.savefig(out3, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 6 (Pure Infographic): flow_05_ticketing_vietqr_qr.png")


# ==============================================================================
# 4. HÌNH 7 (GIÁM SÁT GRAFANA & PROMETHEUS) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_2_14_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 8.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(7.75, 8.1, 'SƠ ĐỒ KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT HỆ THỐNG GRAFANA & PROMETHEUS',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 7.75, 'Thu thập dữ liệu viễn trắc 3 nguồn độc lập qua Prometheus TSDB và hiển thị trên Grafana Engine v11',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    # Cột 1: 3 Nguồn dữ liệu (Bên trái)
    draw_icon_node(ax, 2.5, 6.2, 'icon_database.png', 'PostgreSQL 16 Database', 'Dữ liệu vé & doanh thu thực tế', target_px=52)
    draw_icon_node(ax, 2.5, 3.8, 'icon_server.png', 'Node.js Exporter', 'RAM RSS, CPU VPS & Container Docker', target_px=55)
    draw_icon_node(ax, 2.5, 1.4, 'icon_laptop.png', 'Express APM Network', 'Lưu lượng RPS & Độ trễ p95/p99', target_px=52)

    # Cột 2: Prometheus TSDB Server (Ở giữa)
    draw_icon_node(ax, 7.75, 3.8, 'icon_database.png', 'Prometheus TSDB Engine', 'Cào chỉ số định kỳ mỗi 15 giây (Scrape)', target_px=65)

    # Cột 3: 3 Dashboard Grafana (Bên phải)
    draw_icon_node(ax, 13.0, 6.2, 'icon_monitor.png', 'Dashboard 1: Nghiệp Vụ & Vé', 'Doanh thu & Số lượng vé bán', target_px=52)
    draw_icon_node(ax, 13.0, 3.8, 'icon_monitor.png', 'Dashboard 2: Hạ Tầng VPS', 'Tải CPU, RAM & Container Uptime', target_px=52)
    draw_icon_node(ax, 13.0, 1.4, 'icon_monitor.png', 'Dashboard 3: Hiệu Năng APM', 'Heatmap độ trễ & Tỷ lệ lỗi HTTP', target_px=52)

    # Mũi tên kết nối:
    # PostgreSQL -> Dashboard 1 (SQL Query)
    draw_flow_arrow(ax, 3.6, 6.2, 11.9, 6.2, label='Truy vấn SQL Query trực tiếp (pg_readonly)')

    # Node.js -> Prometheus (Scrape)
    draw_flow_arrow(ax, 3.6, 3.8, 6.7, 3.8, label='Scrape /metrics')

    # Express APM -> Prometheus (Scrape)
    draw_flow_arrow(ax, 3.6, 1.8, 6.8, 3.2, label='Scrape APM', rad=-0.1)

    # Prometheus -> Dashboard 2 (PromQL)
    draw_flow_arrow(ax, 8.8, 3.8, 11.9, 3.8, label='PromQL Query')

    # Prometheus -> Dashboard 3 (PromQL)
    draw_flow_arrow(ax, 8.8, 3.2, 11.9, 1.8, label='PromQL Query', rad=0.1)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 7 (Pure Infographic): hinh_2_14_grafana_architecture.png")


# ==============================================================================
# 5. HÌNH 3 (GHÉP ẢNH 360 PANORAMA) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_4_1_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 7.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(7.75, 7.1, 'SƠ ĐỒ QUY TRÌNH TẠO & GHÉP ẢNH TOÀN CẢNH 360° PANORAMA TỰ ĐỘNG',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 6.75, 'Chuỗi xử lý thị giác máy tính khép kín: 4 Nguồn ảnh, Nắn trụ, So khớp RootSIFT/RANSAC và Vá sàn Nadir',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    draw_icon_node(ax, 1.8, 4.0, 'icon_phone.png', '1. Nguồn Ảnh 2D', 'Webcam / Video quét phòng', target_px=55)
    draw_icon_node(ax, 5.6, 4.0, 'icon_feature_match.png', '2. Nắn Trụ & RootSIFT', 'Cylindrical Warping & RANSAC', target_px=55)
    draw_icon_node(ax, 9.8, 4.0, 'icon_server.png', '3. Hòa Trộn Laplacian', 'Cắt mí Voronoi Seamline', target_px=58)
    draw_icon_node(ax, 13.8, 4.0, 'icon_360_grid.png', '4. Ảnh Cầu 360° (2:1)', 'Vá sàn Nadir & Three.js WebGL', target_px=55)

    draw_flow_arrow(ax, 2.7, 4.0, 4.5, 4.0, label='Lọc khung hình Laplacian')
    draw_flow_arrow(ax, 6.7, 4.0, 8.7, 4.0, label='Ma trận Homography')
    draw_flow_arrow(ax, 10.9, 4.0, 12.7, 4.0, label='Hòa trộn đa dải tần')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png")
    out2 = os.path.join(ASSETS_DIR, "flow_01_stitching_process.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 3 (Pure Infographic): flow_01_stitching_process.png")


# ==============================================================================
# 6. HÌNH 4 (MẶT BẰNG & DIJKSTRA) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_4_4_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 7.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(7.75, 7.1, 'SƠ ĐỒ THUẬT TOÁN ĐỊNH TUYẾN ĐƯỜNG ĐI NGẮN NHẤT DIJKSTRA TRÊN SƠ ĐỒ MẶT BẰNG',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 6.75, 'Mô hình hóa đồ thị 18 gian phòng, giải thuật Min-Heap và hiển thị nón góc nhìn Radar View 360°',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    draw_icon_node(ax, 1.8, 4.0, 'icon_laptop.png', '1. Mặt Bằng 18 Phòng', 'Tọa độ hóa 52 liên kết cửa', target_px=55)
    draw_icon_node(ax, 5.6, 4.0, 'icon_feature_match.png', '2. Đồ Thị G = (V, E)', 'Ma trận kề trọng số khoảng cách', target_px=55)
    draw_icon_node(ax, 9.8, 4.0, 'icon_server.png', '3. Giải Thuật Dijkstra', 'Hàng đợi ưu tiên Min-Heap', target_px=58)
    draw_icon_node(ax, 13.8, 4.0, 'icon_monitor.png', '4. Mini-Map Dẫn Đường', 'Đường nét đứt & Nón Radar View', target_px=55)

    draw_flow_arrow(ax, 2.7, 4.0, 4.5, 4.0, label='Mô hình hóa Topology')
    draw_flow_arrow(ax, 6.7, 4.0, 8.7, 4.0, label='Nới lỏng cạnh d[v]')
    draw_flow_arrow(ax, 10.9, 4.0, 12.7, 4.0, label='Truy vết đường đi ngắn nhất')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png")
    out2 = os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png")
    out3 = os.path.join(ASSETS_DIR, "flow_02_floorplan_dijkstra.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    fig.savefig(out3, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 4 (Pure Infographic): flow_02_floorplan_dijkstra.png")


# ==============================================================================
# 7. HÌNH 4.9 (ĐA NGÔN NGỮ & VOICE AI TTS) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_4_9_pure_infographic():
    fig, ax = plt.subplots(figsize=(15.5, 7.5), dpi=300)
    ax.set_xlim(0, 15.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(7.75, 7.1, 'SƠ ĐỒ HOẠT ĐỘNG: ĐIỀU PHỐI ĐA NGÔN NGỮ VÀ ĐỘNG CƠ GIỌNG ĐỌC AI GOOGLE CLOUD TTS',
            ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_DARK)
    ax.text(7.75, 6.75, 'Kiểm tra bộ đệm băm MD5 Hash Storage, sinh giọng đọc bản xứ Neural2 và truyền phát HTTP 206 Partial Content',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    draw_icon_node(ax, 1.8, 4.0, 'icon_phone.png', '1. Chọn Ngôn Ngữ', 'Khách chọn 7 thứ tiếng', target_px=55)
    draw_icon_node(ax, 5.6, 4.0, 'icon_database.png', '2. Bộ Đệm Băm MD5', 'Kiểm tra tệp tĩnh /audio_cache', target_px=52)
    draw_icon_node(ax, 9.8, 4.0, 'icon_ai_chip.png', '3. Google Cloud TTS', 'Giọng đọc AI Neural2 bản xứ', target_px=55)
    draw_icon_node(ax, 13.8, 4.0, 'icon_server.png', '4. Nginx HTTP 206', 'Phát âm thanh tức thì (< 50ms)', target_px=58)

    draw_flow_arrow(ax, 2.7, 4.0, 4.5, 4.0, label='Key = MD5(text + lang)')
    draw_flow_arrow(ax, 6.7, 4.0, 8.7, 4.0, label='Cache Miss (Gọi API)')
    draw_flow_arrow(ax, 10.9, 4.0, 12.7, 4.0, label='Lưu Cache & Stream')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png")
    out2 = os.path.join(ASSETS_DIR, "flow_03_languages_voice_ai.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 4.9 (Pure Infographic): flow_03_languages_voice_ai.png")


# ==============================================================================
# 8. HÌNH 2 (KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP) - THUẦN ICON PHONG CÁCH HÌNH 3
# ==============================================================================
def create_fig_2_9_pure_infographic():
    fig, ax = plt.subplots(figsize=(16.5, 9.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.25, 9.0, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.25, 8.65, 'Mô hình phân tầng bảo đảm tính sẵn sàng cao, bảo mật mã hóa và tối ưu hóa tài nguyên phần cứng',
            ha='center', va='center', fontsize=8.2, color=C_MUTED)

    # Tiêu đề 3 tầng (Text thanh lịch, KHÔNG CÓ BẤT KỲ Ô VUÔNG BAO QUANH)
    ax.text(2.6, 7.9, 'TẦNG 1: TRÌNH DIỄN (CLIENTS)', ha='center', va='center', fontsize=9.8, fontweight='bold', color='#1E40AF')
    ax.text(8.25, 7.9, 'TẦNG 2: NGHIỆP VỤ & ĐIỀU PHỐI (SERVICES)', ha='center', va='center', fontsize=9.8, fontweight='bold', color='#065F46')
    ax.text(13.9, 7.9, 'TẦNG 3: DỮ LIỆU & ĐÁM MÂY (DATA & CLOUD)', ha='center', va='center', fontsize=9.8, fontweight='bold', color='#9D174D')

    # Đường phân cách mờ nhẹ giữa 3 tầng (dashed)
    ax.axvline(x=5.4, ymin=0.06, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.2)
    ax.axvline(x=11.1, ymin=0.06, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.2)

    # --- TẦNG 1: TRÌNH DIỄN (CLIENTS) ---
    draw_icon_node(ax, 2.6, 5.8, 'icon_laptop.png', 'Trình duyệt Web (Desktop / PC)', 'React 18 • Three.js WebGL (FOV 45°)\nĐiều hướng OrbitControls & Hotspots', target_px=58)
    draw_icon_node(ax, 2.6, 2.2, 'icon_phone.png', 'Thiết bị Di động (Mobile / Tablet)', 'Giao diện Responsive Mobile-First (FOV 65°)\nQuét QR jsQR khử lóa • Soát vé Barie', target_px=58)

    # --- TẦNG 2: NGHIỆP VỤ & ĐIỀU PHỐI (SERVICES) ---
    draw_icon_node(ax, 8.25, 6.4, 'icon_server.png', 'Nginx Web Server & Reverse Proxy', 'SSL/TLS 1.3 Termination • Caching tĩnh\nStream Audio HTTP 206 (< 50ms)', target_px=58)
    draw_icon_node(ax, 8.25, 4.0, 'icon_server.png', 'Backend REST API & SSE Gateway', 'Node.js LTS • Express • JWT Auth\nKênh truyền Realtime SSE (< 1ms)', target_px=58)
    draw_icon_node(ax, 8.25, 1.6, 'icon_ai_chip.png', 'Xưởng Đa phương tiện & Xử lý 3D', 'Python 3.11 • OpenCV Stitching\nĐộng cơ 3D Local CPU Marching Cubes', target_px=58)

    # --- TẦNG 3: DỮ LIỆU & ĐÁM MÂY (DATA & CLOUD) ---
    draw_icon_node(ax, 13.9, 6.4, 'icon_database.png', 'PostgreSQL 16 (Relational DB)', 'Quản lý người dùng, vé tham quan (AES-256)\nKết nối Grafana Read-Only pg_readonly', target_px=54)
    draw_icon_node(ax, 13.9, 4.0, 'icon_database.png', 'MongoDB NoSQL Database', 'Cấu trúc 18 gian phòng trưng bày 360°\nTọa độ Hotspots • Tư liệu cổ vật • Audio Cache', target_px=54)
    draw_icon_node(ax, 13.9, 1.6, 'icon_ai_chip.png', 'Dịch vụ Đám mây & AI Ngoại vi', 'VietQR PayOS (Napas 247) • ZeroGPU A100\nGoogle Cloud TTS • Grafana & Prometheus', target_px=58)

    # --- MŨI TÊN LIÊN TẦNG VỚI NHÃN TRÊN MŨI TÊN ---
    # Tầng 1 -> Tầng 2
    draw_flow_arrow(ax, 3.9, 5.8, 7.0, 6.4, label='HTTPS / WSS (Port 443)', shrink=24)
    draw_flow_arrow(ax, 3.9, 2.2, 7.0, 4.0, label='RESTful API (JSON)', shrink=24)

    # Nội bộ Tầng 2
    draw_flow_arrow(ax, 8.25, 5.6, 8.25, 4.7, label='Proxy Pass', shrink=10)
    draw_flow_arrow(ax, 8.25, 3.2, 8.25, 2.3, label='Hàng đợi Worker', shrink=10)

    # Tầng 2 -> Tầng 3
    draw_flow_arrow(ax, 9.5, 4.3, 12.6, 6.2, label='SQL Connection (pgPool)', shrink=24)
    draw_flow_arrow(ax, 9.5, 4.0, 12.6, 4.0, label='Mongoose NoSQL', shrink=24)
    draw_flow_arrow(ax, 9.5, 1.6, 12.6, 1.6, label='Webhook / Cloud API', shrink=24)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_2_9_architecture_3tier.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong Hinh 2 (Pure Infographic): hinh_2_9_architecture_3tier.png")


if __name__ == '__main__':
    create_hinh_1_1_pure_infographic()
    create_fig_2_9_pure_infographic()
    create_fig_4_1_pure_infographic()
    create_fig_4_4_pure_infographic()
    create_fig_4_5_pure_infographic()
    create_fig_4_9_pure_infographic()
    create_fig_3_6_pure_infographic()
    create_fig_2_14_pure_infographic()
    print("=== HOAN TAT TAO TOAN BO 8 SO DO THUAN ICON INFOGRAPHIC KHONG O VUONG! ===")
