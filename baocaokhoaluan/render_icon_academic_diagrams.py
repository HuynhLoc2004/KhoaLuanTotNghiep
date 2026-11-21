# -*- coding: utf-8 -*-
"""
TẠO SƠ ĐỒ HỌC THUẬT VỚI BIỂU TƯỢNG HÌNH ẢNH THỰC TẾ (REAL ICONS)
Thay thế toàn bộ các ô vuông màu mè bằng hình ảnh công cụ, người dùng (User & Tools).
Bố cục thoáng đạt, không đè chữ, không dùng viền xanh đỏ vàng cam lòe loẹt.
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

# Font chuẩn
plt.rcParams['font.sans-serif'] = ['Arial', 'Segoe UI', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Bảng màu học thuật trang nhã (Đơn sắc & Slate trung tính)
C_DARK = '#0F172A'       # Chữ chính: Đen than chì
C_MUTED = '#475569'      # Chữ phụ: Xám đậm học thuật
C_BORDER = '#334155'     # Đường viền thanh mảnh
C_BORDER_LIGHT = '#94A3B8' # Viền mờ
C_BG_BOX = '#FFFFFF'     # Nền trắng tinh khiết
C_ARROW = '#334155'      # Mũi tên kết nối

def add_icon(ax, icon_name, x, y, zoom=0.22):
    """Thêm icon trực quan từ thư mục docs/diagram_assets vào tọa độ (x, y)."""
    p = os.path.join(DOCS_ICONS, icon_name)
    if os.path.exists(p):
        im = Image.open(p)
        im_box = OffsetImage(im, zoom=zoom)
        ab = AnnotationBbox(im_box, (x, y), frameon=False, zorder=15)
        ax.add_artist(ab)

def draw_actor(ax, x, y, label="Quản trị viên", sub="", scale=1.0):
    """Vẽ biểu tượng người dùng (User/Admin) thanh lịch."""
    r = 0.14 * scale
    head = patches.Circle((x, y + 0.32 * scale), r, facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=12)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.06 * scale), 0.36 * scale, 0.26 * scale,
                           facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=12)
    ax.add_patch(body)
    if label:
        ax.text(x, y - 0.22 * scale, label, ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_DARK, zorder=14)
    if sub:
        ax.text(x, y - 0.40 * scale, sub, ha='center', va='top', fontsize=6.8, color=C_MUTED, zorder=14)

def draw_icon_step_card(ax, x, y, w, h, icon_name, title, lines=None, icon_zoom=0.20, icon_offset_y=0.0):
    """Vẽ khối chức năng có ICON MINH HỌA CÔNG CỤ ở trên đầu, thay vì ô vuông thuần chữ."""
    # Nền khối mềm mại, viền thanh mảnh trang nhã
    card = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor=C_BG_BOX, edgecolor=C_BORDER, lw=1.1, zorder=4)
    ax.add_patch(card)
    
    # Đặt icon ở phía trên khối
    icon_y = y + h/2 - 0.32 + icon_offset_y
    if icon_name:
        add_icon(ax, icon_name, x, icon_y, zoom=icon_zoom)
        text_y_start = icon_y - 0.38
    else:
        text_y_start = y + h/2 - 0.24

    # Tiêu đề bước
    ax.text(x, text_y_start, title, ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_DARK, zorder=10)
    
    # Các dòng mô tả chi tiết
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(x, text_y_start - 0.28, content, ha='center', va='top', fontsize=7.1, color=C_MUTED, linespacing=1.26, zorder=10)

def draw_clean_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top'):
    """Vẽ mũi tên liên kết có nhãn đệm nền trắng che sạch đường kẻ ngầm."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=6, shrinkB=6,
                                mutation_scale=12, connectionstyle=conn), zorder=6)
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.22
        if label_side == 'top':
            lx, ly = mx, my + offset + (0.1 if rad > 0 else 0)
            ha, va = 'center', 'bottom'
        elif label_side == 'bottom':
            lx, ly = mx, my - offset - (0.1 if rad < 0 else 0)
            ha, va = 'center', 'top'
        elif label_side == 'left':
            lx, ly = mx - offset, my
            ha, va = 'right', 'center'
        else:
            lx, ly = mx + offset, my
            ha, va = 'left', 'center'

        full_text = f"{label}\n({sub})" if sub else label
        ax.text(lx, ly, full_text, ha=ha, va=va, fontsize=6.8, fontweight='bold' if label else 'normal',
                color=C_DARK,
                bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6, alpha=0.98),
                zorder=12)


# ==============================================================================
# 1. HÌNH 5 / HÌNH 4.5: SƠ ĐỒ TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (CÓ HÌNH ẢNH CÔNG CỤ & USER)
# Bám sát chính xác luồng media_1795285244730_048b76d5.png mà người dùng đã gửi!
# ==============================================================================
def gen_figure_4_5_with_icons():
    fig, ax = plt.subplots(figsize=(15.2, 8.4), dpi=300)
    ax.set_xlim(0, 15.2)
    ax.set_ylim(0, 8.4)
    ax.axis('off')

    # Tiêu đề chuẩn học thuật
    ax.text(7.6, 8.0, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI 2 ĐỘNG CƠ VÀ DỰ PHÒNG TỰ ĐỘNG',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.6, 7.68, 'Tích hợp hình ảnh công cụ trực quan: Nguồn ảnh 2D, U2-Net, Điều phối Queue, Heuristic CPU và Cloud AI TRELLIS',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # 1. BƯỚC 1: ẢNH ĐẦU VÀO HIỆN VẬT (Bên trái trên: x = 3.6, y = 6.2)
    # Có hình Actor Quản trị viên và icon_phone (chụp ảnh tư liệu)
    draw_actor(ax, 1.2, 6.2, 'Quản trị viên', 'Nạp tư liệu', scale=0.9)
    draw_icon_step_card(ax, 4.0, 6.2, 4.4, 1.9,
                        icon_name='icon_phone.png',
                        title='1. ẢNH ĐẦU VÀO HIỆN VẬT',
                        lines=['• Tải lên ảnh 2D chụp đơn hoặc nhiều góc',
                               '• Hiện vật: Trống đồng, Tượng Phật, Phù điêu đá',
                               '• Hỗ trợ định dạng: JPG / PNG độ nét cao'],
                        icon_zoom=0.18, icon_offset_y=0.08)

    # Mũi tên từ User -> Bước 1
    draw_clean_arrow(ax, 1.7, 6.2, 1.8, 6.2, label='Tải ảnh')

    # 2. BƯỚC 2: BÓC TÁCH NỀN U2-NET (Bên phải trên: x = 11.2, y = 6.2)
    # Có icon_feature_match (xử lý hình ảnh AI)
    draw_icon_step_card(ax, 11.2, 6.2, 4.4, 1.9,
                        icon_name='icon_feature_match.png',
                        title='2. BÓC TÁCH NỀN (U2-NET)',
                        lines=['• Mạng nơ-ron U2-Net bóc tách phông nền chuẩn xác',
                               '• Chuẩn hóa kênh Alpha trong suốt, cân bằng sáng',
                               '• Loại bỏ hoàn toàn nhiễu bối cảnh tủ kính trưng bày'],
                        icon_zoom=0.20, icon_offset_y=0.08)

    # Mũi tên từ Bước 1 -> Bước 2
    draw_clean_arrow(ax, 6.2, 6.2, 9.0, 6.2, label='Chuyển giao ảnh 2D', sub='API RESTful')

    # 3. BƯỚC 3: BỘ ĐIỀU PHỐI ĐA ĐỘNG CƠ (Ở giữa: x = 7.6, y = 3.8)
    # Có icon_server (Điều phối hàng đợi Queue)
    draw_icon_step_card(ax, 7.6, 3.8, 4.6, 1.9,
                        icon_name='icon_server.png',
                        title='3. BỘ ĐIỀU PHỐI ĐA ĐỘNG CƠ',
                        lines=['• artifact3dQueue giám sát tải tài nguyên',
                               '• Kiểm tra cấu hình hệ thống & Quota API',
                               '• Phân luồng thông minh sang CPU hoặc GPU'],
                        icon_zoom=0.17, icon_offset_y=0.08)

    # Mũi tên từ Bước 2 -> Bước 3 (Rẽ xuống giữa)
    ax.annotate('', xy=(9.9, 4.4), xytext=(11.2, 5.25),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5,
                                mutation_scale=12, connectionstyle='arc3,rad=0.15'), zorder=6)
    ax.text(11.2, 4.75, 'Đẩy hàng đợi\n(artifact3dQueue)', ha='center', va='center', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # 4. NHÁNH TRÁI: ĐỘNG CƠ HEURISTIC CPU (x = 3.4, y = 3.8)
    # Có icon_laptop (Máy chủ nội bộ / CPU)
    draw_icon_step_card(ax, 3.4, 3.8, 3.8, 1.9,
                        icon_name='icon_laptop.png',
                        title='ĐỘNG CƠ HEURISTIC CPU',
                        lines=['• Module Python v15.0 chạy trên VPS',
                               '• Dựng 2.5D Displacement Mapping',
                               '• Phân tích Depth Map (0.8s, 0$ GPU)',
                               '• Chạy độc lập 100% nội bộ'],
                        icon_zoom=0.19, icon_offset_y=0.08)

    # 4. NHÁNH PHẢI: ĐỘNG CƠ TRELLIS CLOUD GPU (x = 11.8, y = 3.8)
    # Có icon_ai_chip (Card GPU / AI Model)
    draw_icon_step_card(ax, 11.8, 3.8, 3.8, 1.9,
                        icon_name='icon_ai_chip.png',
                        title='ĐỘNG CƠ TRELLIS CLOUD GPU',
                        lines=['• Mô hình TRELLIS 3D Foundation Model',
                               '• HuggingFace ZeroGPU A100 (Cloud AI)',
                               '• Tái tạo 360° cả mặt trước và mặt sau',
                               '• Kết cấu PBR Albedo / Normal (15s)'],
                        icon_zoom=0.19, icon_offset_y=0.08)

    # Mũi tên từ Bộ điều phối sang 2 nhánh:
    # Sang CPU (trái)
    draw_clean_arrow(ax, 5.3, 3.8, 5.3, 3.8, label='', sub='')
    ax.annotate('', xy=(5.3, 3.8), xytext=(5.3, 3.8),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2), zorder=6)
    draw_clean_arrow(ax, 5.3, 3.8, 5.3, 3.8)
    ax.annotate('', xy=(5.3, 3.8), xytext=(6.3, 3.8),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(5.8, 4.15, 'Chế độ CPU\n(Dự phòng / 0$)', ha='center', va='bottom', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # Sang GPU (phải)
    ax.annotate('', xy=(9.9, 3.8), xytext=(8.9, 3.8),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(9.4, 4.15, 'Chế độ GPU\n(Ưu tiên AI)', ha='center', va='bottom', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # Mũi tên dự phòng Fallback từ GPU -> CPU nếu Timeout hoặc Quota 429
    ax.annotate('', xy=(5.3, 3.3), xytext=(9.9, 3.3),
                arrowprops=dict(arrowstyle='->', color='#B91C1C', lw=1.2, linestyle='--', shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(7.6, 3.05, 'Tự động Fallback khi Quota 429 hoặc Timeout > 300s', ha='center', va='top', fontsize=6.6,
            fontweight='bold', color='#B91C1C', bbox=dict(boxstyle='round,pad=0.2', facecolor='#FEF2F2', edgecolor='#F87171', lw=0.6), zorder=12)

    # 5. BƯỚC 4: XUẤT BẢN HIỆN VẬT 3D TƯƠNG TÁC (Ở dưới giữa: x = 7.6, y = 1.3)
    # Có icon_wireframe_3d (Mô hình 3D đa giác)
    draw_icon_step_card(ax, 7.6, 1.3, 5.8, 1.7,
                        icon_name='icon_wireframe_3d.png',
                        title='4. XUẤT BẢN HIỆN VẬT 3D TƯƠNG TÁC (.GLB)',
                        lines=['• Tối ưu hóa lưới đa giác, nén kết cấu Draco siêu nhẹ (1.8 – 3.5 MB)',
                               '• Xuất định dạng chuẩn .GLB nạp vào Three.js WebGL / Three-Fiber',
                               '• Khách tham quan xoay 360°, phóng to hoa văn và nghe thuyết minh Audio'],
                        icon_zoom=0.20, icon_offset_y=0.08)

    # Mũi tên từ CPU -> Bước 4
    ax.annotate('', xy=(5.5, 1.9), xytext=(4.0, 2.85),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(4.4, 2.2, 'Xuất .GLB CPU\n(Dạng xoay trục)', ha='center', va='center', fontsize=6.6, color=C_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # Mũi tên từ GPU -> Bước 4
    ax.annotate('', xy=(9.7, 1.9), xytext=(11.2, 2.85),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.8, 2.2, 'Xuất .GLB PBR\n(Chuẩn bảo tàng)', ha='center', va='center', fontsize=6.6, color=C_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong voi ICONS: hinh_4_5_artifact_2engines.png")


# ==============================================================================
# 2. HÌNH 7a / HÌNH 2: SƠ ĐỒ THU THẬP & GIÁM SÁT GRAFANA VÀ PROMETHEUS (CÓ ICONS)
# Bỏ hoàn toàn các viền đỏ, vàng, cam, xanh lòe loẹt! Sửa lỗi chữ đè đường kẻ!
# ==============================================================================
def gen_figure_2_14_with_icons():
    fig, ax = plt.subplots(figsize=(15.5, 8.4), dpi=300)
    ax.set_xlim(0, 15.5)
    ax.set_ylim(0, 8.4)
    ax.axis('off')

    ax.text(7.75, 8.0, 'SƠ ĐỒ KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT HỆ THỐNG VỚI GRAFANA & PROMETHEUS',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.75, 7.68, 'Giám sát toàn diện 3 tầng: Nghiệp vụ & Doanh thu, Hạ tầng phần cứng VPS, và Hiệu năng mạng APM',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # CỘT 1: NGUỒN DỮ LIỆU (Bên trái: x = 2.4)
    # 1.1. PostgreSQL (Cơ sở dữ liệu nghiệp vụ)
    draw_icon_step_card(ax, 2.4, 6.2, 3.8, 1.8,
                        icon_name='icon_database.png',
                        title='1. Nguồn Nghiệp vụ: PostgreSQL 16',
                        lines=['• Dữ liệu vé tham quan, đơn hàng PayOS',
                               '• Tỷ lệ vào cổng, doanh thu thực tế',
                               '• Kết nối an toàn Read-Only pg_readonly'],
                        icon_zoom=0.17, icon_offset_y=0.06)

    # 1.2. Node.js Exporter & VPS Host (Hạ tầng)
    draw_icon_step_card(ax, 2.4, 4.0, 3.8, 1.8,
                        icon_name='icon_server.png',
                        title='2. Nguồn Hạ tầng: Node.js Exporter',
                        lines=['• Dung lượng RAM RSS & Heap Memory',
                               '• Tần suất CPU Node.js, Thời gian Uptime',
                               '• Trạng thái hoạt động Container Docker'],
                        icon_zoom=0.16, icon_offset_y=0.06)

    # 1.3. Express APM (Hiệu năng mạng)
    draw_icon_step_card(ax, 2.4, 1.8, 3.8, 1.8,
                        icon_name='icon_laptop.png',
                        title='3. Nguồn Hiệu năng: Express APM',
                        lines=['• Lưu lượng Request/giây (Throughput RPS)',
                               '• Phân vị độ trễ phản hồi p50, p95, p99',
                               '• Tỷ lệ mã trạng thái HTTP 2xx/4xx/5xx'],
                        icon_zoom=0.17, icon_offset_y=0.06)

    # CỘT 2: PROMETHEUS TSDB SERVER (Ở giữa: x = 7.6, y = 3.6)
    # Icon Database + Server
    draw_icon_step_card(ax, 7.6, 3.6, 4.0, 3.4,
                        icon_name='icon_database.png',
                        title='Prometheus TSDB Engine (v2.53)',
                        lines=['• Time-Series Database lưu trữ chỉ số viễn trắc',
                               '• Cào dữ liệu định kỳ mỗi 15 giây (Scrape)',
                               '• Bộ nhớ đệm dữ liệu chuỗi thời gian (WAL)',
                               '• Endpoint an toàn: /metrics nội bộ Docker',
                               '• Cơ chế bảo vệ không làm chậm API chính'],
                        icon_zoom=0.19, icon_offset_y=0.15)

    # CỘT 3: TRỰC QUAN HÓA GRAFANA V11 (Bên phải: x = 12.8)
    # 3.1. Dashboard 1: Nghiệp vụ & Doanh thu
    draw_icon_step_card(ax, 12.8, 6.2, 4.0, 1.8,
                        icon_name='icon_monitor.png',
                        title='Dashboard 1: Nghiệp vụ & Doanh thu',
                        lines=['• Doanh thu bán vé theo mốc thời gian',
                               '• Biểu đồ diễn biến lượng khách đặt vé',
                               '• Danh sách giao dịch mới nhất PayOS/VietQR'],
                        icon_zoom=0.17, icon_offset_y=0.06)

    # 3.2. Dashboard 2: Hạ tầng VPS & Container
    draw_icon_step_card(ax, 12.8, 4.0, 4.0, 1.8,
                        icon_name='icon_monitor.png',
                        title='Dashboard 2: Hạ tầng VPS & Container',
                        lines=['• Đồ thị RAM RSS, Event Loop Lag',
                               '• Tải CPU thời gian thực',
                               '• Cảnh báo ngưỡng tài nguyên hệ thống'],
                        icon_zoom=0.17, icon_offset_y=0.06)

    # 3.3. Dashboard 3: Hiệu năng API & Mạng (APM)
    draw_icon_step_card(ax, 12.8, 1.8, 4.0, 1.8,
                        icon_name='icon_monitor.png',
                        title='Dashboard 3: Hiệu năng API & Mạng (APM)',
                        lines=['• Lưu lượng truy cập RPS thời gian thực',
                               '• Biểu đồ Heatmap phân vị độ trễ',
                               '• Tỷ lệ lỗi HTTP Error Rate (%)'],
                        icon_zoom=0.17, icon_offset_y=0.06)

    # --- ĐIỀU HƯỚNG MŨI TÊN CHUẨN XÁC, KHÔNG CẮT NGANG KHỐI GIỮA ---
    # 1. Đường SQL Query từ PostgreSQL -> Grafana Dashboard 1 (ĐI VÒNG LÊN TRÊN, HOÀN TOÀN KHÔNG ĐÈ LÊN PROMETHEUS)
    ax.annotate('', xy=(10.8, 6.2), xytext=(4.3, 6.2),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(7.55, 6.55, 'Truy vấn trực tiếp SQL Query (Read-Only pg_readonly)', ha='center', va='bottom', fontsize=7.0,
            fontweight='bold', color=C_DARK, bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # 2. Đường Scrape /metrics từ Node.js Exporter -> Prometheus
    ax.annotate('', xy=(5.6, 4.1), xytext=(4.3, 4.1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(4.95, 4.35, 'Scrape\n/metrics', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 3. Đường Scrape APM từ Express APM -> Prometheus
    ax.annotate('', xy=(5.6, 2.7), xytext=(4.3, 2.1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(4.95, 2.65, 'Scrape\nAPM', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 4. Đường PromQL Query từ Prometheus -> Dashboard 2 (Hạ tầng)
    ax.annotate('', xy=(10.8, 4.0), xytext=(9.6, 4.0),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.2, 4.25, 'PromQL\nQuery', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 5. Đường PromQL Query từ Prometheus -> Dashboard 3 (APM)
    ax.annotate('', xy=(10.8, 2.4), xytext=(9.6, 2.9),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.2, 2.85, 'PromQL\nQuery', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong voi ICONS: hinh_2_14_grafana_architecture.png")

if __name__ == '__main__':
    gen_figure_4_5_with_icons()
    gen_figure_2_14_with_icons()
