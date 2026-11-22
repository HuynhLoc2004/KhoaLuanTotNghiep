# -*- coding: utf-8 -*-
"""
render_flawless_system_diagrams.py
Render 100% Academic Diagrams using Clean Transparent Tech Icons.
Features:
- Dynamic text positioning below the bottom of each icon (ZERO text overlap).
- Clear arrow distinction:
  * Gửi (Request/Forward/Call): Solid line ('-'), Slate Dark color (#1E293B).
  * Phản hồi (Response/Return/Callback/Stream): Dashed line ('--'), Sky Blue color (#0284C7).
- Spacious, non-cramped coordinates (Wide aspect ratios).
- Zero colored boxes / No rectangular paragraphs.
- Text strictly ABOVE arrows with clean white rounded pills (No collisions).
- Fully synchronized across both assets/ and assets/diagrams/.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.image as mpimg

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIAGRAMS_DIR = os.path.join(BASE_DIR, "assets", "diagrams")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
ICONS_DIR = os.path.join(BASE_DIR, "assets", "icons")
DOCS_ICONS_DIR = os.path.join(os.path.dirname(BASE_DIR), "docs", "diagram_assets")

os.makedirs(DIAGRAMS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

C_TEXT = '#0F172A'       # Slate 900
C_SUB = '#475569'        # Slate 600
C_LINE_SEND = '#1E293B'  # Slate đậm cho luồng GỬI
C_LINE_RESP = '#0284C7'  # Xanh Sky cho luồng PHẢN HỒI
C_ACCENT = '#0284C7'


def get_icon_path(name):
    p1 = os.path.join(ICONS_DIR, name)
    if os.path.exists(p1): return p1
    p2 = os.path.join(DOCS_ICONS_DIR, name)
    if os.path.exists(p2): return p2
    return None


def draw_clean_icon(ax, x, y, icon_name, title, subtitle='', target_px=58):
    """
    Vẽ icon công nghệ trong suốt, tên và mô tả được đẩy xuống dưới đáy icon một khoảng an toàn.
    Tuyệt đối không bao giờ đè lên hình ảnh biểu tượng.
    """
    icon_path = get_icon_path(icon_name)
    display_h = 1.6
    if icon_path and os.path.exists(icon_path):
        img = mpimg.imread(icon_path)
        ih, iw = img.shape[:2]
        aspect = iw / ih
        display_w = target_px / 42.0
        display_h = display_w / aspect
        ax.imshow(img, extent=[x - display_w/2, x + display_w/2, y - display_h/2, y + display_h/2],
                  zorder=15, aspect='auto')
    else:
        ax.plot(x, y, 'o', color=C_ACCENT, markersize=14, zorder=15)
        
    # Tính toán đáy icon chính xác
    bottom_y = y - display_h / 2.0
    title_y = bottom_y - 0.28
    subtitle_y = title_y - 0.36
    
    ax.text(x, title_y, title, ha='center', va='top', fontsize=10.0, fontweight='bold', color=C_TEXT, zorder=20)
    if subtitle:
        ax.text(x, subtitle_y, subtitle, ha='center', va='top', fontsize=8.3, color=C_SUB, zorder=20)


def draw_clean_arrow(ax, x1, y1, x2, y2, label='', offset_y=0.40, offset_x=0.0, shrinkA=24, shrinkB=24, rad=0.0, is_response=False):
    """
    Vẽ mũi tên với sự phân biệt rõ ràng:
    - is_response=False: Mũi tên GỬI (Nét liền '-', màu xám đen Slate đậm)
    - is_response=True: Mũi tên PHẢN HỒI (Nét đứt '--', màu xanh Sky Blue chuyên nghiệp)
    Nhãn text luôn nằm phía trên mũi tên với thẻ trắng bo viền, tuyệt đối không đè vạch.
    """
    conn = f'arc3,rad={rad}' if rad != 0.0 else 'arc3'
    line_style = '--' if is_response else '-'
    arrow_color = C_LINE_RESP if is_response else C_LINE_SEND
    
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle='-|>',
            color=arrow_color,
            lw=1.6,
            linestyle=line_style,
            shrinkA=shrinkA,
            shrinkB=shrinkB,
            mutation_scale=15,
            connectionstyle=conn
        ),
        zorder=10
    )
    if label:
        mx = (x1 + x2) / 2.0 + offset_x
        my = (y1 + y2) / 2.0 + offset_y
        edge_col = '#93C5FD' if is_response else '#CBD5E1'
        text_col = '#0369A1' if is_response else '#0F172A'
        prefix = '[Phản hồi] ' if (is_response and not label.startswith('[') and not label.startswith('Trả') and not label.startswith('Stream') and not label.startswith('Webhook')) else ''
        display_label = prefix + label
        ax.text(
            mx, my, display_label, ha='center', va='center',
            fontsize=8.6, fontweight='bold', color=text_col,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor=edge_col, lw=0.9, alpha=0.98),
            zorder=25
        )


def save_fig(fig, filenames):
    for fn in filenames:
        p1 = os.path.join(DIAGRAMS_DIR, fn)
        p2 = os.path.join(ASSETS_DIR, fn)
        fig.savefig(p1, bbox_inches='tight')
        fig.savefig(p2, bbox_inches='tight')
    plt.close(fig)
    print(f"-> Saved: {filenames}")


# ==============================================================================
# HÌNH 1.1: SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG
# ==============================================================================
def render_hinh_1_1():
    fig, ax = plt.subplots(figsize=(16.8, 9.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 9.8); ax.axis('off')

    ax.text(8.4, 9.3, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # Khách tải cao bên trái
    draw_clean_icon(ax, 1.8, 7.3, 'icon_client.png', 'Khách tham quan 1', 'Thiết bị Desktop / Mobile', target_px=50)
    draw_clean_icon(ax, 1.8, 5.2, 'icon_client.png', 'Khách tham quan 2', 'Tải đồng thời cao', target_px=50)
    draw_clean_icon(ax, 1.8, 3.1, 'icon_client.png', 'Khách tham quan N...', 'Hỗ trợ đa nền tảng', target_px=50)
    draw_clean_icon(ax, 1.8, 1.1, 'icon_client.png', 'Quản trị viên (Admin)', 'Cổng quản trị CMS', target_px=50)

    # Trình duyệt Web
    draw_clean_icon(ax, 4.5, 5.2, 'icon_browser.png', 'Trình duyệt Web', 'WebGL Three.js (Token & Cookies)', target_px=56)

    # Server trung tâm
    draw_clean_icon(ax, 8.4, 5.2, 'icon_server.png', 'Máy chủ Ứng dụng', 'Nginx & Node.js REST API Gateway', target_px=64)

    # Vệ tinh xung quanh máy chủ:
    draw_clean_icon(ax, 6.2, 8.0, 'icon_redis.png', 'Bộ đệm Redis', 'Cache & Quản lý phiên', target_px=52)
    draw_clean_icon(ax, 10.6, 8.0, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng VietQR Napas 247', target_px=56)

    draw_clean_icon(ax, 14.8, 7.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé & Người dùng (ACID)', target_px=56)
    draw_clean_icon(ax, 14.8, 5.2, 'icon_mongodb.png', 'CSDL MongoDB', '18 Gian phòng 360° & Cổ vật', target_px=54)
    draw_clean_icon(ax, 10.6, 2.0, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Xử lý tác vụ nền bất đồng bộ', target_px=54)
    draw_clean_icon(ax, 14.8, 2.0, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'Mô hình 3D (Microsoft Research)', target_px=56)
    draw_clean_icon(ax, 6.2, 2.0, 'icon_grafana.png', 'Giám sát Grafana', 'Prometheus & Đo lường APM', target_px=52)

    # Mũi tên Gửi & Phản hồi
    draw_clean_arrow(ax, 2.6, 7.1, 3.8, 5.7, label='HTTPS Gửi Request', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 3.8, 5.3, 2.6, 6.7, label='Phản hồi HTML/Bundle', offset_y=-0.45, is_response=True)

    draw_clean_arrow(ax, 2.6, 5.2, 3.7, 5.2, label='WSS Kết nối', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 2.6, 3.3, 3.8, 4.7, label='Web Tour 360°', offset_y=-0.45, is_response=False)
    draw_clean_arrow(ax, 2.6, 1.4, 4.2, 4.3, label='JWT Auth Request', offset_y=-0.45, is_response=False)

    draw_clean_arrow(ax, 5.3, 5.5, 7.5, 5.5, label='Gửi RESTful API (JSON)', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.5, 4.9, 5.3, 4.9, label='Phản hồi JSON (HTTP 200 OK)', offset_y=-0.40, is_response=True)

    draw_clean_arrow(ax, 7.8, 5.8, 6.7, 7.3, label='Ghi / Đọc Cache', offset_y=0.35, offset_x=-0.2, is_response=False)
    draw_clean_arrow(ax, 9.0, 5.8, 10.0, 7.3, label='Tạo Link VietQR', offset_y=0.35, offset_x=0.2, is_response=False)
    draw_clean_arrow(ax, 10.2, 7.1, 9.2, 5.6, label='Webhook PayOS gọi lại', offset_y=-0.35, offset_x=0.2, is_response=True)

    draw_clean_arrow(ax, 9.3, 5.6, 13.8, 6.9, label='SQL Query (pgPool)', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 13.8, 6.6, 9.3, 5.3, label='Bản ghi dữ liệu vé', offset_y=-0.45, is_response=True)

    draw_clean_arrow(ax, 9.3, 5.2, 13.8, 5.2, label='Mongoose Query', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 9.0, 4.5, 10.1, 2.8, label='Đẩy tác vụ 3D Queue', offset_y=-0.40, is_response=False)
    draw_clean_arrow(ax, 11.4, 2.0, 13.9, 2.0, label='Gọi ZeroGPU A100', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 13.9, 1.6, 11.4, 1.6, label='Mô hình .GLB hoàn tất', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 7.8, 4.5, 6.7, 2.8, label='PromQL Metrics', offset_y=-0.40, is_response=True)

    save_fig(fig, ['hinh_1_1_mindmap.png', 'hinh_1_1_so_do_tu_duy_tong_quan.png'])


# ==============================================================================
# HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN HÌNH CẦU 3D THREE.JS
# ==============================================================================
def render_hinh_2_6():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.6, 'NGUYÊN LÝ ÁNH XẠ TEXTURE TOÀN CẢNH LÊN HÌNH CẦU NGHỊCH ĐẢO VÀ TƯƠNG TÁC THREE.JS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.8, 'icon_360_grid.png', '1. Nguồn Ảnh Panorama 8K', 'Equirectangular (2:1 / WebP)', target_px=60)
    draw_clean_icon(ax, 6.2, 3.8, 'icon_wireframe_3d.png', '2. Lưới Cầu Nghịch Đảo', 'MeshSphereGeometry (Lật mặt trong)', target_px=60)
    draw_clean_icon(ax, 10.5, 3.8, 'icon_browser.png', '3. Điều Khiển & Raycaster', 'OrbitControls & Bắt tia Hotspot', target_px=60)
    draw_clean_icon(ax, 14.8, 3.8, 'icon_client.png', '4. Trình Diễn Tương Tác', 'Khách xem xoay 360° & Pop-up', target_px=60)

    # Mũi tên Gửi & Phản hồi
    draw_clean_arrow(ax, 3.1, 4.2, 5.1, 4.2, label='1. TextureLoader nạp VRAM', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 7.3, 4.2, 9.4, 4.2, label='2. Ánh xạ texture mặt trong', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 11.6, 4.2, 13.7, 4.2, label='3. Raycasting va chạm tia nhìn', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 13.7, 3.4, 11.6, 3.4, label='4. Kích hoạt âm thanh & Cổ vật 3D', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_2_6_texture_mapping.png'])


# ==============================================================================
# HÌNH 2.8: QUY TRÌNH TÁI TẠO MÔ HÌNH CỔ VẬT 3D ĐA PHƯƠNG THỨC
# ==============================================================================
def render_hinh_2_8():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.6, 'QUY TRÌNH TÁI TẠO CỔ VẬT 3D TỪ CHUỖI ẢNH TƯ LIỆU VỚI BÓC TÁCH PHÔNG NỀN',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.8, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', 'Đơn diện / Đối lập / Đa góc', target_px=58)
    draw_clean_icon(ax, 6.2, 3.8, 'icon_feature_match.png', '2. Bóc Tách Nền Tự Động', 'Rembg / U2-Net (Chuẩn hóa Alpha)', target_px=58)
    draw_clean_icon(ax, 10.5, 3.8, 'icon_huggingface.png', '3. Sinh Khối Lưới 3D', 'Hugging Face TRELLIS (SLAT & DMC)', target_px=60)
    draw_clean_icon(ax, 14.8, 3.8, 'icon_wireframe_3d.png', '4. Xuất Mô Hình .GLB', 'PBR Texture & Nén Draco WebGL', target_px=60)

    draw_clean_arrow(ax, 3.1, 4.2, 5.1, 4.2, label='1. Gửi ảnh tư liệu gốc', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 7.3, 4.2, 9.4, 4.2, label='2. Chuyển ảnh Alpha Mask sang GPU', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 11.6, 4.2, 13.7, 4.2, label='3. Trích xuất lưới đa giác 360°', offset_y=0.45, is_response=True)
    draw_clean_arrow(ax, 13.7, 3.4, 11.6, 3.4, label='4. Tải tệp .GLB chuẩn bảo tàng', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_2_8_photogrammetry.png'])


# ==============================================================================
# HÌNH 2.9: KIẾN TRÚC PHÂN TẦNG HỆ THỐNG 3 TẦNG LAI GHÉP
# ==============================================================================
def render_hinh_2_9():
    fig, ax = plt.subplots(figsize=(17.0, 9.8), dpi=300)
    ax.set_xlim(0, 17.0); ax.set_ylim(0, 9.8); ax.axis('off')

    ax.text(8.5, 9.2, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    ax.text(2.6, 8.4, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.5, 8.4, 'TẦNG 2: SERVICES & QUEUE', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(14.4, 8.4, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.axvline(x=5.5, ymin=0.06, ymax=0.85, color='#CBD5E1', linestyle='--', lw=1.5)
    ax.axvline(x=11.5, ymin=0.06, ymax=0.85, color='#CBD5E1', linestyle='--', lw=1.5)

    # Tầng 1
    draw_clean_icon(ax, 2.6, 6.7, 'icon_browser.png', 'Trình duyệt Web (Client)', 'React 18 & WebGL Three.js', target_px=58)
    draw_clean_icon(ax, 2.6, 2.2, 'icon_client.png', 'Quản trị viên (Admin CMS)', 'Quản trị vé, phòng & cổ vật', target_px=56)

    # Tầng 2
    draw_clean_icon(ax, 8.5, 7.0, 'icon_server.png', 'Máy chủ Nginx & Node.js', 'Reverse Proxy & REST API Gateway', target_px=64)
    draw_clean_icon(ax, 8.5, 4.4, 'icon_redis.png', 'Bộ đệm In-Memory Redis', 'Lưu trữ phiên & Cache dữ liệu', target_px=54)
    draw_clean_icon(ax, 8.5, 1.8, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Điều phối tác vụ bất đồng bộ', target_px=56)

    # Tầng 3
    draw_clean_icon(ax, 14.4, 7.4, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé tham quan & Đơn hàng', target_px=58)
    draw_clean_icon(ax, 14.4, 5.3, 'icon_mongodb.png', 'CSDL MongoDB NoSQL', '18 Gian phòng 360° & Cổ vật', target_px=54)
    draw_clean_icon(ax, 14.4, 3.2, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng thanh toán VietQR Napas 247', target_px=56)
    draw_clean_icon(ax, 14.4, 1.1, 'icon_huggingface.png', 'Hugging Face Spaces', 'Mô hình 3D TRELLIS (ZeroGPU)', target_px=56)

    # Mũi tên Gửi & Phản hồi
    draw_clean_arrow(ax, 3.8, 6.9, 7.3, 7.1, label='Gửi HTTPS / WSS', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 7.3, 6.5, 3.8, 6.3, label='Phản hồi Web App WebGL', offset_y=-0.45, is_response=True)

    draw_clean_arrow(ax, 3.8, 2.4, 7.3, 6.4, label='Gửi RESTful API (JSON)', offset_y=-0.45, is_response=False)

    draw_clean_arrow(ax, 8.5, 6.0, 8.5, 5.2, label='Kiểm tra Cache', offset_x=-1.3, offset_y=0.0, is_response=False)
    draw_clean_arrow(ax, 8.5, 5.0, 8.5, 5.8, label='Trả Cache Hit', offset_x=1.3, offset_y=0.0, is_response=True)

    draw_clean_arrow(ax, 8.5, 3.6, 8.5, 2.6, label='Đẩy tác vụ 3D Queue', offset_x=1.5, offset_y=0.0, is_response=False)

    draw_clean_arrow(ax, 9.8, 7.2, 13.1, 7.4, label='Truy vấn SQL (pgPool)', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 13.1, 7.0, 9.8, 6.8, label='Trả kết quả vé & user', offset_y=-0.45, is_response=True)

    draw_clean_arrow(ax, 9.8, 6.5, 13.1, 5.5, label='Truy vấn Mongoose', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 9.8, 6.0, 13.1, 3.4, label='Tạo Link VietQR', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 13.1, 3.0, 9.8, 5.6, label='Webhook PayOS báo PAID', offset_y=-0.45, is_response=True)

    draw_clean_arrow(ax, 9.8, 1.8, 13.1, 1.2, label='Gọi API ZeroGPU A100', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 13.1, 0.9, 9.8, 1.5, label='Trả về mô hình .GLB', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_2_9_architecture_3tier.png'])


# ==============================================================================
# HÌNH 2.10: XÁC THỰC NGƯỜI DÙNG BẰNG JWT & HTTPONLY COOKIE (SEQUENCE DIAGRAM)
# ==============================================================================
def render_hinh_2_10():
    fig, ax = plt.subplots(figsize=(16.5, 8.8), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 8.8); ax.axis('off')

    ax.text(8.25, 8.2, 'SƠ ĐỒ TUẦN TỰ: XÁC THỰC VÀ PHÂN QUYỀN BẰNG JSON WEB TOKEN (JWT) & HTTPONLY COOKIE',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    # 3 Participants dùng Real Icons
    draw_clean_icon(ax, 2.5, 7.0, 'icon_browser.png', 'Trình duyệt Client', 'User / Admin', target_px=56)
    draw_clean_icon(ax, 8.2, 7.0, 'icon_server.png', 'API Gateway / Auth', 'Node.js Express', target_px=56)
    draw_clean_icon(ax, 14.0, 7.0, 'icon_postgres.png', 'Cơ sở Dữ liệu', 'PostgreSQL 16', target_px=56)

    # Đường gióng Lifeline
    for lx in [2.5, 8.2, 14.0]:
        ax.plot([lx, lx], [1.0, 5.8], color='#94A3B8', linestyle=':', lw=1.5, zorder=5)

    # 6 bước tuần tự rõ ràng, nét liền cho Gửi, nét đứt cho Phản hồi
    y_steps = [5.2, 4.4, 3.6, 2.8, 2.0, 1.2]

    # Bước 1: Client -> Server: POST /api/auth/login (GỬI)
    draw_clean_arrow(ax, 2.5, y_steps[0], 8.2, y_steps[0], label='1. POST /api/auth/login (email, password)', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=False)

    # Bước 2: Server -> DB: SELECT * FROM users (GỬI)
    draw_clean_arrow(ax, 8.2, y_steps[1], 14.0, y_steps[1], label='2. SELECT * FROM users WHERE email = ?', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=False)

    # Bước 3: DB -> Server: Trả về bản ghi user & hash (PHẢN HỒI)
    draw_clean_arrow(ax, 14.0, y_steps[2], 8.2, y_steps[2], label='3. Trả về bản ghi user & mật khẩu băm Bcrypt', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=True)

    # Bước 4: Server -> Client: Trả về JWT Access Token (PHẢN HỒI)
    draw_clean_arrow(ax, 8.2, y_steps[3], 2.5, y_steps[3], label='4. Trả về JWT Access Token (24h) kèm HttpOnly Cookie', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=True)

    # Bước 5: Client -> Server: GET /api/rooms (GỬI)
    draw_clean_arrow(ax, 2.5, y_steps[4], 8.2, y_steps[4], label='5. GET /api/rooms (Header: Authorization Bearer <token>)', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=False)

    # Bước 6: Server -> Client: Phản hồi dữ liệu 360 (PHẢN HỒI)
    draw_clean_arrow(ax, 8.2, y_steps[5], 2.5, y_steps[5], label='6. Phản hồi cấu trúc 18 phòng 360° & cổ vật (HTTP 200 OK)', offset_y=0.35, shrinkA=8, shrinkB=8, is_response=True)

    save_fig(fig, ['hinh_2_10_jwt_auth.png'])


# ==============================================================================
# HÌNH 2.11 & 3.6 & 4.8: QUY TRÌNH THANH TOÁN VIETQR PAYOS
# ==============================================================================
def render_hinh_payos_flow():
    fig, ax = plt.subplots(figsize=(16.5, 7.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.25, 6.9, 'QUY TRÌNH SINH MÃ VÀ XÁC THỰC THANH TOÁN VIETQR QUA CỔNG PAYOS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 4.0, 'icon_client.png', '1. Khách Mua Vé', 'Giao diện Booking Web', target_px=58)
    draw_clean_icon(ax, 6.2, 4.0, 'icon_server.png', '2. Backend Server', 'Tạo Payment Link & Đơn', target_px=62)
    draw_clean_icon(ax, 10.5, 4.0, 'icon_payos.png', '3. Cổng PayOS', 'VietQR Napas 247 Động', target_px=62)
    draw_clean_icon(ax, 14.8, 4.0, 'icon_browser.png', '4. Ứng Dụng Ngân Hàng', 'Quét QR & Chuyển khoản', target_px=58)

    # Database bên dưới
    draw_clean_icon(ax, 6.2, 1.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng Tickets & Transactions (PAID)', target_px=54)

    # Luồng Gửi (Solid) và Phản hồi (Dashed)
    draw_clean_arrow(ax, 3.1, 4.5, 5.1, 4.5, label='1. Chọn vé & Đặt mua', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 4.5, 9.4, 4.5, label='2. Gọi API tạo link VietQR', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 4.5, 13.7, 4.5, label='3. Hiển thị mã QR động', offset_y=0.40, is_response=True)

    draw_clean_arrow(ax, 13.7, 3.5, 11.6, 3.5, label='4. Chuyển khoản thành công', offset_y=-0.40, is_response=False)
    draw_clean_arrow(ax, 9.4, 3.5, 7.3, 3.5, label='5. Webhook PayOS gọi lại', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 5.1, 3.5, 3.1, 3.5, label='7. SSE đẩy vé QR về client', offset_y=-0.40, is_response=True)

    draw_clean_arrow(ax, 6.2, 2.9, 6.2, 1.9, label='6. Cập nhật PAID & Ký số AES', offset_x=1.8, offset_y=0.0, is_response=False)

    save_fig(fig, ['hinh_2_11_payos_flow.png', 'hinh_3_6_activity_booking_ticket_lifecycle.png', 'hinh_3_6_sequence_payment_payos.png', 'hinh_4_8_payment_ticket_flow.png', 'flow_05_ticketing_vietqr_qr.png'])


# ==============================================================================
# HÌNH 2.12 & 3.7: SOÁT VÉ ĐIỆN TỬ QR THỜI GIAN THỰC
# ==============================================================================
def render_hinh_qr_validation():
    fig, ax = plt.subplots(figsize=(16.5, 6.8), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.25, 6.3, 'QUY TRÌNH QUÉT VÀ XÁC THỰC MÃ VÉ QR THỜI GIAN THỰC TẠI CỔNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.3, 'icon_browser.png', '1. Vé trên Mobile', 'Mã QR mã hóa AES-256', target_px=58)
    draw_clean_icon(ax, 6.2, 3.3, 'icon_client.png', '2. Camera Soát Vé', 'Html5Qrcode Scanner (Staff)', target_px=58)
    draw_clean_icon(ax, 10.5, 3.3, 'icon_server.png', '3. Backend Server', 'Giải mã AES & Kiểm tra Hash', target_px=62)
    draw_clean_icon(ax, 14.8, 3.3, 'icon_postgres.png', '4. CSDL PostgreSQL', 'Cập nhật trạng thái USED', target_px=58)

    draw_clean_arrow(ax, 3.1, 3.7, 5.1, 3.7, label='1. Quét mã QR (< 150ms)', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.7, 9.4, 3.7, label='2. POST /tickets/validate', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 3.7, 13.7, 3.7, label='3. Kiểm tra & Đổi USED', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 9.4, 2.9, 7.3, 2.9, label='4. Phản hồi Bíp âm thanh & Mở cổng', offset_y=-0.40, is_response=True)

    save_fig(fig, ['hinh_2_12_qr_validation.png', 'hinh_3_7_activity_ticket_validation.png', 'hinh_3_7_sequence_qr_scan.png'])


# ==============================================================================
# HÌNH 2.13: KIẾN TRÚC ẢO HÓA DOCKER COMPOSE & NGINX
# ==============================================================================
def render_hinh_2_13():
    fig, ax = plt.subplots(figsize=(16.5, 7.8), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.25, 7.2, 'SƠ ĐỒ ĐIỀU PHỐI VÀ ĐÓNG GÓI HỆ THỐNG VỚI DOCKER COMPOSE TRÊN VPS UBUNTU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.2, 4.0, 'icon_server.png', 'Nginx Reverse Proxy', 'Port 80/443 (SSL/TLS Termination)', target_px=62)
    draw_clean_icon(ax, 6.5, 4.0, 'icon_server.png', 'Node.js API Container', 'Port 5000 (Express & TypeScript)', target_px=62)

    draw_clean_icon(ax, 10.8, 5.7, 'icon_redis.png', 'Redis Container', 'Port 6379 (In-Memory Cache)', target_px=54)
    draw_clean_icon(ax, 10.8, 2.1, 'icon_rabbitmq.png', 'RabbitMQ Container', 'Port 5672 (Message Broker)', target_px=54)

    draw_clean_icon(ax, 14.8, 5.7, 'icon_postgres.png', 'PostgreSQL 16', 'Port 5432 (Relational Data)', target_px=56)
    draw_clean_icon(ax, 14.8, 2.1, 'icon_mongodb.png', 'MongoDB NoSQL', 'Port 27017 (360 Rooms & Items)', target_px=54)

    draw_clean_arrow(ax, 3.3, 4.0, 5.4, 4.0, label='Proxy Pass (Internal Network)', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.6, 4.5, 9.7, 5.5, label='TCP Ghi/Đọc Cache', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.6, 3.5, 9.7, 2.3, label='AMQP Queue Đẩy Tác Vụ', offset_y=-0.40, is_response=False)

    draw_clean_arrow(ax, 7.6, 4.8, 13.7, 5.9, label='Postgres Pool Connection', offset_y=0.55, is_response=False)
    draw_clean_arrow(ax, 7.6, 3.2, 13.7, 2.1, label='Mongo Connection (Mongoose)', offset_y=-0.55, is_response=False)

    save_fig(fig, ['hinh_2_13_docker_compose.png'])


# ==============================================================================
# HÌNH 2.14 & 3.9: HỆ THỐNG GIÁM SÁT GRAFANA & PROMETHEUS
# ==============================================================================
def render_hinh_grafana():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.6, 'KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT VỚI PROMETHEUS VÀ GRAFANA V11',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.6, 'icon_server.png', '1. Node.js & Nginx API', 'Cung cấp Endpoint /metrics', target_px=60)
    draw_clean_icon(ax, 6.2, 3.6, 'icon_server.png', '2. Prometheus Server', 'Scrape chu kỳ 15s (TSDB)', target_px=60)
    draw_clean_icon(ax, 10.5, 3.6, 'icon_grafana.png', '3. Grafana Dashboard', 'Truy vấn PromQL & Trực quan', target_px=62)
    draw_clean_icon(ax, 14.8, 3.6, 'icon_client.png', '4. Quản trị viên (CMS)', 'Chế độ Kiosk nhúng IFrame', target_px=58)

    draw_clean_arrow(ax, 5.1, 4.0, 3.1, 4.0, label='1. Scrape định kỳ GET /metrics', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 3.1, 3.2, 5.1, 3.2, label='2. Trả chuỗi số liệu viễn trắc TSDB', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 7.3, 3.6, 9.4, 3.6, label='3. PromQL Query Engine', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 3.6, 13.7, 3.6, label='4. Nhúng biểu đồ APM Kiosk', offset_y=0.40, is_response=True)

    save_fig(fig, ['hinh_2_14_grafana_architecture.png', 'hinh_3_9_grafana_sequence.png'])


# ==============================================================================
# HÌNH 3.8: TƯƠNG TÁC TOUR 360° VÀ CHUYỂN PHÒNG QUA HOTSPOT
# ==============================================================================
def render_hinh_3_8():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.6, 'SƠ ĐỒ HOẠT ĐỘNG: TƯƠNG TÁC KHÔNG GIAN 360° VÀ CHUYỂN PHÒNG QUA ĐIỂM NỐI HOTSPOT',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.6, 'icon_client.png', '1. Khách Tham Quan', 'Nhấp chọn Hotspot trên màn hình', target_px=58)
    draw_clean_icon(ax, 6.2, 3.6, 'icon_browser.png', '2. Trình Duyệt WebGL', 'Raycaster tính toán va chạm 3D', target_px=60)
    draw_clean_icon(ax, 10.5, 3.6, 'icon_server.png', '3. Backend API Gateway', 'Truy vấn thông tin phòng đích', target_px=62)
    draw_clean_icon(ax, 14.8, 3.6, 'icon_mongodb.png', '4. CSDL MongoDB', 'Cấu trúc phòng & Liên kết', target_px=56)

    draw_clean_arrow(ax, 3.1, 4.0, 5.1, 4.0, label='1. Nhấp chuột / Chạm cảm ứng', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 4.0, 9.4, 4.0, label='2. GET /api/rooms/:targetId', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 4.0, 13.7, 4.0, label='3. Query Room Structure', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 13.7, 3.2, 11.6, 3.2, label='4. Trả về metadata phòng & ảnh 8K', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 9.4, 3.2, 7.3, 3.2, label='5. Chuyển cảnh xoay camera mượt mà', offset_y=-0.40, is_response=True)

    save_fig(fig, ['hinh_3_8_sequence_tour_hotspot.png'])


# ==============================================================================
# HÌNH 3.10: DỊCH THUẬT VÀ BẢN ĐỊA HÓA ĐA NGÔN NGỮ (SỬA LỖI ĐÈ CHỮ VÀ MŨI TÊN)
# ==============================================================================
def render_hinh_3_10():
    fig, ax = plt.subplots(figsize=(16.8, 7.5), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.4, 6.9, 'QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION WORKFLOW)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.8, 'icon_client.png', '1. Chọn Ngôn Ngữ', '7 Ngôn ngữ (Vi, En, Fr, Zh, Ja...)', target_px=58)
    draw_clean_icon(ax, 6.2, 3.8, 'icon_server.png', '2. Backend Localization', 'Kiểm tra tệp JSON cục bộ', target_px=62)
    draw_clean_icon(ax, 10.5, 3.8, 'icon_ai_brain.png', '3. Động Cơ Google NMT', 'Dịch thuật tự động khi thiếu từ điển', target_px=60)
    draw_clean_icon(ax, 14.8, 3.8, 'icon_browser.png', '4. Trình Diễn Đa Ngữ', 'Cập nhật tiêu đề & Thuyết minh', target_px=58)

    # 1 -> 2: GỬI yêu cầu (Nét liền)
    draw_clean_arrow(ax, 3.1, 4.3, 5.1, 4.3, label='1. Chuyển mã ISO ngôn ngữ', offset_y=0.40, is_response=False)

    # 2 -> 3: GỬI Fallback sang Google NMT API (Nét liền)
    draw_clean_arrow(ax, 7.3, 4.3, 9.4, 4.3, label='2. Fallback gọi Google NMT API', offset_y=0.40, is_response=False)

    # 3 -> 2: PHẢN HỒI bản dịch về server để lưu đệm (Nét đứt, mũi tên quay lại)
    draw_clean_arrow(ax, 9.4, 3.3, 7.3, 3.3, label='3. Trả về từ điển bản địa hóa', offset_y=-0.40, is_response=True)

    # 2 -> 4: PHẢN HỒI dữ liệu ngôn ngữ ra giao diện client (Nét đứt)
    draw_clean_arrow(ax, 7.3, 2.2, 13.7, 2.2, label='4. Nạp từ điển vào React Context & Cập nhật UI', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_3_10_translation_flow.png'])


# ==============================================================================
# HÌNH 3.11 & 4.9: SINH VÀ LƯU TRỮ ĐỆM BĂM GIỌNG ĐỌC VOICE AI TTS
# ==============================================================================
def render_hinh_voice_tts():
    fig, ax = plt.subplots(figsize=(16.8, 7.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.4, 7.2, 'QUY TRÌNH SINH VÀ LƯU TRỮ ĐỆM BĂM (HASH CACHING) GIỌNG ĐỌC THUYẾT MINH AI',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 4.0, 'icon_client.png', '1. Bật Thuyết Minh', 'Nhấp biểu tượng loa trên Tour', target_px=58)
    draw_clean_icon(ax, 6.2, 4.0, 'icon_server.png', '2. Backend Voice Service', 'Băm MD5 nội dung văn bản', target_px=62)
    draw_clean_icon(ax, 10.6, 5.7, 'icon_redis.png', '3a. Bộ Đệm Redis / Cache', 'Trả về tệp .MP3 có sẵn (0ms)', target_px=54)
    draw_clean_icon(ax, 10.6, 2.2, 'icon_ai_brain.png', '3b. Google Cloud TTS', 'Sinh giọng đọc Neural2 tự nhiên', target_px=60)
    draw_clean_icon(ax, 14.8, 4.0, 'icon_browser.png', '4. Phát Âm Thanh Web Audio', 'Stream Audio Partial Content 206', target_px=58)

    draw_clean_arrow(ax, 3.1, 4.0, 5.1, 4.0, label='1. Gửi yêu cầu audio guide', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 4.6, 9.5, 5.5, label='2a. Kiểm tra Cache Hit', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.4, 9.5, 2.5, label='2b. Cache Miss -> Gọi TTS API', offset_y=-0.40, is_response=False)

    draw_clean_arrow(ax, 11.7, 5.5, 13.7, 4.5, label='Stream file có sẵn (Cache Hit)', offset_y=0.40, is_response=True)
    draw_clean_arrow(ax, 11.7, 2.5, 13.7, 3.5, label='Lưu đệm băm & Phát trực tiếp', offset_y=-0.40, is_response=True)

    save_fig(fig, ['hinh_3_11_voice_tts_storage_pipeline.png', 'flow_03_languages_voice_ai.png'])


# ==============================================================================
# HÌNH 3.12: KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# ==============================================================================
def render_hinh_3_12():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.4, 'QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH (MULTI-SHEET EXCEL)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.5, 'icon_client.png', '1. Quản Trị Viên (Admin)', 'Yêu cầu xuất báo cáo Excel', target_px=58)
    draw_clean_icon(ax, 6.2, 3.5, 'icon_server.png', '2. Backend Excel Worker', 'Thư viện ExcelJS (Streaming)', target_px=62)
    draw_clean_icon(ax, 10.5, 3.5, 'icon_postgres.png', '3. CSDL PostgreSQL 16', 'Truy vấn doanh thu & vé bán', target_px=58)
    draw_clean_icon(ax, 14.8, 3.5, 'icon_browser.png', '4. Tải Tệp .XLSX', 'Bảng tính định dạng chuẩn', target_px=58)

    draw_clean_arrow(ax, 3.1, 3.9, 5.1, 3.9, label='1. GET /api/reports/export', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.9, 9.4, 3.9, label='2. Query dữ liệu tài chính & vé', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 9.4, 3.1, 7.3, 3.1, label='3. Trả tập bản ghi giao dịch', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 7.3, 2.2, 13.7, 2.2, label='4. Stream tải tệp .xlsx về trình duyệt', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_3_12_excel_export_flow.png', 'hinh_3_12_excel_export_activity.png'])


# ==============================================================================
# HÌNH 3.13: QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT KHÁM PHÁ PHYGITAL
# ==============================================================================
def render_hinh_3_13():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.4, 'QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.5, 'icon_client.png', '1. Khách Tham Quan', 'Quét mã QR dán tại tủ kính', target_px=58)
    draw_clean_icon(ax, 6.2, 3.5, 'icon_browser.png', '2. Camera QR Scanner', 'Điều hướng URL định danh hiện vật', target_px=58)
    draw_clean_icon(ax, 10.5, 3.5, 'icon_server.png', '3. Backend CMS Gateway', 'Truy vấn dữ liệu hiện vật & 3D', target_px=62)
    draw_clean_icon(ax, 14.8, 3.5, 'icon_wireframe_3d.png', '4. Hiển Thị 3D WebGL', 'Xoay 360° & Nghe Audio Guide', target_px=58)

    draw_clean_arrow(ax, 3.1, 3.9, 5.1, 3.9, label='1. Quét QR hiện vật thực địa', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.9, 9.4, 3.9, label='2. Mở /artifacts/:id trên Web', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 3.9, 13.7, 3.9, label='3. Trả về mô hình 3D .GLB & Audio', offset_y=0.40, is_response=True)

    save_fig(fig, ['hinh_3_13_qr_exhibition_activity.png'])


# ==============================================================================
# HÌNH 4.1: QUY TRÌNH TỰ ĐỘNG HÓA CI/CD QUA GITHUB ACTIONS
# ==============================================================================
def render_hinh_4_1():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.4, 'SƠ ĐỒ ĐƯỜNG ỐNG TỰ ĐỘNG HÓA KIỂM THỬ VÀ TRIỂN KHAI LIÊN TỤC (CI/CD) GITHUB ACTIONS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.5, 'icon_client.png', '1. Lập Trình Viên', 'Git Push nhánh main/feature', target_px=58)
    draw_clean_icon(ax, 6.2, 3.5, 'icon_server.png', '2. GitHub Runner', 'Lint, Jest & Unit Test CI', target_px=60)
    draw_clean_icon(ax, 10.5, 3.5, 'icon_server.png', '3. Docker Build & Tag', 'Đóng gói Container Images', target_px=60)
    draw_clean_icon(ax, 14.8, 3.5, 'icon_server.png', '4. VPS Production', 'SSH Deploy & Zero-Downtime', target_px=62)

    draw_clean_arrow(ax, 3.1, 3.9, 5.1, 3.9, label='1. Git Commit & Push', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.9, 9.4, 3.9, label='2. Tự động kiểm thử pass', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 3.9, 13.7, 3.9, label='3. Docker Compose restart', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 13.7, 3.1, 3.1, 3.1, label='4. Thông báo trạng thái Deploy thành công về Developer', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_4_1_cicd_pipeline.png', 'flow_01_stitching_process.png'])


# ==============================================================================
# HÌNH 4.3: XỬ LÝ TOÀN CẢNH 360° TỪ 4 NGUỒN ẢNH ĐẦU VÀO
# ==============================================================================
def render_hinh_4_3():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.4, 'QUY TRÌNH XỬ LÝ VÀ CHUẨN HÓA ẢNH TOÀN CẢNH 360° TỪ 4 PHƯƠNG THỨC NẠP DỮ LIỆU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.5, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', '4 Nguồn (Video sweep, Chụp liên tiếp...)', target_px=58)
    draw_clean_icon(ax, 6.2, 3.5, 'icon_feature_match.png', '2. Panorama Studio', 'Nắn chỉnh trụ & Khớp SIFT/RANSAC', target_px=60)
    draw_clean_icon(ax, 10.5, 3.5, 'icon_server.png', '3. Hòa Trộn Đa Dải Tần', 'Khử vết ghép Seam & Tối ưu sáng', target_px=62)
    draw_clean_icon(ax, 14.8, 3.5, 'icon_360_grid.png', '4. Xuất Ảnh 360° 8K', 'Equirectangular WebP 60 FPS', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.9, 5.1, 3.9, label='1. Nạp tệp ảnh qua CMS', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.9, 9.4, 3.9, label='2. Trích xuất ma trận Homography', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 11.6, 3.9, 13.7, 3.9, label='3. Lưu trữ CDN Cloudflare R2', offset_y=0.40, is_response=True)

    save_fig(fig, ['hinh_4_3_panorama_4inputs.png'])


# ==============================================================================
# HÌNH 4.5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (HUGGING FACE TRELLIS & LOCAL CPU)
# ==============================================================================
def render_hinh_4_5():
    fig, ax = plt.subplots(figsize=(16.8, 7.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.4, 7.3, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI ĐỘNG CƠ AI',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)
    ax.text(8.4, 6.8, 'Hỗ trợ bóc tách phông nền Rembg / Alpha Mask — Ưu tiên Hugging Face (TRELLIS) và Tự động Fallback sang Local CPU',
            ha='center', va='center', fontsize=9.2, fontstyle='italic', color='#475569')

    draw_clean_icon(ax, 1.8, 4.0, 'icon_client.png', 'Quản trị viên', 'Nạp ảnh tư liệu cổ vật', target_px=56)
    draw_clean_icon(ax, 5.2, 4.0, 'icon_rabbitmq.png', 'Hàng đợi 3D Queue', 'Phân luồng & Giám sát tài nguyên', target_px=56)

    # Hugging Face Spaces TRELLIS AI
    draw_clean_icon(ax, 10.4, 5.7, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'ZeroGPU A100 (Microsoft Research)', target_px=62)
    draw_clean_icon(ax, 10.4, 2.2, 'icon_server.png', 'Máy chủ Local CPU', 'Marching Cubes (Dự phòng độc lập)', target_px=60)

    draw_clean_icon(ax, 15.0, 4.0, 'icon_browser.png', 'Mô hình 3D (.GLB)', 'Hiển thị WebGL Three.js', target_px=60)

    draw_clean_arrow(ax, 2.8, 4.0, 4.2, 4.0, label='1. Gửi ảnh tải lên', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 6.2, 4.5, 9.2, 5.5, label='2a. Ưu tiên gọi API AI ZeroGPU', offset_y=0.45, is_response=False)
    draw_clean_arrow(ax, 6.2, 3.5, 9.2, 2.5, label='2b. Tùy chọn Local CPU', offset_y=-0.45, is_response=False)

    draw_clean_arrow(ax, 11.6, 5.5, 14.0, 4.3, label='3a. Trả về mô hình .GLB PBR', offset_y=0.45, is_response=True)
    draw_clean_arrow(ax, 11.6, 2.5, 14.0, 3.7, label='3b. Trả về .GLB xoay trục', offset_y=-0.45, is_response=True)

    # Fallback line
    draw_clean_arrow(ax, 10.4, 4.8, 10.4, 3.1, label='Fallback khi Quota 429', offset_x=1.8, offset_y=0.0, is_response=True)

    save_fig(fig, ['hinh_4_5_artifact_2engines.png', 'flow_04_dual_engine_3d.png'])


# ==============================================================================
# HÌNH 4.7: GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG ĐI NGẮN NHẤT 18 PHÒNG
# ==============================================================================
def render_hinh_4_7():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.4, 'SƠ ĐỒ KHỐI: GIẢI THUẬT DIJKSTRA TÌM LỘ TRÌNH DI CHUYỂN TỐI ƯU GIỮA 18 PHÒNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.5, 'icon_client.png', '1. Khách Tham Quan', 'Chọn phòng xuất phát & phòng đích', target_px=58)
    draw_clean_icon(ax, 6.2, 3.5, 'icon_server.png', '2. Trình Tính Dijkstra', 'Ma trận trọng số kề 18 đỉnh', target_px=62)
    draw_clean_icon(ax, 10.5, 3.5, 'icon_mongodb.png', '3. Dữ Liệu Tọa Độ Sơ Đồ', 'Khoảng cách Euclide thực địa', target_px=56)
    draw_clean_icon(ax, 14.8, 3.5, 'icon_browser.png', '4. Mini-map Định Tuyến', 'Vẽ đường line dẫn đường trực quan', target_px=58)

    draw_clean_arrow(ax, 3.1, 3.9, 5.1, 3.9, label='1. Yêu cầu tìm đường tối ưu', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 7.3, 3.9, 9.4, 3.9, label='2. Nạp ma trận trọng số khoảng cách', offset_y=0.40, is_response=False)
    draw_clean_arrow(ax, 9.4, 3.1, 7.3, 3.1, label='3. Trả về đồ thị liên thông', offset_y=-0.40, is_response=True)
    draw_clean_arrow(ax, 7.3, 2.2, 13.7, 2.2, label='4. Xuất chuỗi phòng cần đi lên Mini-map', offset_y=-0.45, is_response=True)

    save_fig(fig, ['hinh_4_7_dijkstra_flow.png', 'flow_02_floorplan_dijkstra.png'])


def render_all_flawless():
    print("=== BAT DAU RENDER TOAN BO SO DO FLAWLESS TECH ICONS ===")
    render_hinh_1_1()
    render_hinh_2_6()
    render_hinh_2_8()
    render_hinh_2_9()
    render_hinh_2_10()
    render_hinh_payos_flow()
    render_hinh_qr_validation()
    render_hinh_2_13()
    render_hinh_grafana()
    render_hinh_3_8()
    render_hinh_3_10()
    render_hinh_voice_tts()
    render_hinh_3_12()
    render_hinh_3_13()
    render_hinh_4_1()
    render_hinh_4_3()
    render_hinh_4_5()
    render_hinh_4_7()
    print("=== HOAN TAT RENDER 100% SO DO HOC THUAT VOI TECH ICONS! ===")


if __name__ == '__main__':
    render_all_flawless()
