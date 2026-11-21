# -*- coding: utf-8 -*-
"""
render_flawless_system_diagrams.py
Render 100% Academic Diagrams using Clean Transparent Tech Icons.
Features:
- 100% Clean Transparent Tech Icons (ZERO borders, ZERO backgrounds).
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
C_LINE = '#334155'       # Slate 700
C_ACCENT = '#0284C7'     # Sky 600


def get_icon_path(name):
    p1 = os.path.join(ICONS_DIR, name)
    if os.path.exists(p1): return p1
    p2 = os.path.join(DOCS_ICONS_DIR, name)
    if os.path.exists(p2): return p2
    return None


def draw_clean_icon(ax, x, y, icon_name, title, subtitle='', target_px=64):
    """Vẽ icon công nghệ trong suốt, tên bên dưới, không khung viền màu"""
    icon_path = get_icon_path(icon_name)
    if icon_path and os.path.exists(icon_path):
        img = mpimg.imread(icon_path)
        ih, iw = img.shape[:2]
        aspect = iw / ih
        display_w = target_px / 40.0
        display_h = display_w / aspect
        ax.imshow(img, extent=[x - display_w/2, x + display_w/2, y - display_h/2, y + display_h/2],
                  zorder=15, aspect='auto')
    else:
        ax.plot(x, y, 'o', color=C_ACCENT, markersize=14, zorder=15)
        
    ax.text(x, y - 0.78, title, ha='center', va='top', fontsize=10.2, fontweight='bold', color=C_TEXT, zorder=20)
    if subtitle:
        ax.text(x, y - 1.15, subtitle, ha='center', va='top', fontsize=8.4, color=C_SUB, zorder=20)


def draw_clean_arrow(ax, x1, y1, x2, y2, label='', offset_y=0.40, offset_x=0.0, shrinkA=24, shrinkB=24, rad=0.0):
    """Vẽ mũi tên với nhãn nằm hoàn toàn TRÊN mũi tên, không đè vạch"""
    conn = f'arc3,rad={rad}' if rad != 0.0 else 'arc3'
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle='-|>',
            color=C_LINE,
            lw=1.6,
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
        ax.text(
            mx, my, label, ha='center', va='center',
            fontsize=8.8, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
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
    fig, ax = plt.subplots(figsize=(16.5, 9.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.25, 9.1, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # Khách tải cao bên trái
    draw_clean_icon(ax, 1.8, 7.0, 'icon_client.png', 'Khách tham quan 1', 'Thiết bị Desktop / Mobile', target_px=52)
    draw_clean_icon(ax, 1.8, 5.0, 'icon_client.png', 'Khách tham quan 2', 'Tải đồng thời cao', target_px=52)
    draw_clean_icon(ax, 1.8, 3.0, 'icon_client.png', 'Khách tham quan N...', 'Hỗ trợ đa nền tảng', target_px=52)
    draw_clean_icon(ax, 1.8, 1.1, 'icon_client.png', 'Quản trị viên (Admin)', 'Cổng quản trị CMS', target_px=52)

    # Trình duyệt Web
    draw_clean_icon(ax, 4.4, 5.0, 'icon_browser.png', 'Trình duyệt Web', 'WebGL Three.js (Token & Cookies)', target_px=58)

    # Server trung tâm
    draw_clean_icon(ax, 8.2, 5.0, 'icon_server.png', 'Máy chủ Ứng dụng', 'Nginx & Node.js REST API Gateway', target_px=66)

    # Vệ tinh xung quanh máy chủ:
    draw_clean_icon(ax, 6.0, 7.8, 'icon_redis.png', 'Bộ đệm Redis', 'Cache & Quản lý phiên', target_px=54)
    draw_clean_icon(ax, 10.4, 7.8, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng VietQR Napas 247', target_px=58)

    draw_clean_icon(ax, 14.5, 7.0, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé & Người dùng (ACID)', target_px=58)
    draw_clean_icon(ax, 14.5, 5.0, 'icon_mongodb.png', 'CSDL MongoDB', '18 Gian phòng 360° & Cổ vật', target_px=56)
    draw_clean_icon(ax, 10.4, 2.2, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Xử lý tác vụ nền bất đồng bộ', target_px=56)
    draw_clean_icon(ax, 14.5, 2.2, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'Mô hình 3D (Microsoft Research)', target_px=58)
    draw_clean_icon(ax, 6.0, 2.2, 'icon_grafana.png', 'Giám sát Grafana', 'Prometheus & Đo lường APM', target_px=54)

    # Mũi tên kết nối
    draw_clean_arrow(ax, 2.6, 6.8, 3.7, 5.5, label='HTTPS', offset_y=0.45)
    draw_clean_arrow(ax, 2.6, 5.0, 3.6, 5.0, label='WSS (SSE)', offset_y=0.40)
    draw_clean_arrow(ax, 2.6, 3.2, 3.7, 4.5, label='Web Tour 360°', offset_y=-0.45)
    draw_clean_arrow(ax, 2.6, 1.4, 4.1, 4.2, label='JWT Auth', offset_y=-0.45)

    draw_clean_arrow(ax, 5.2, 5.0, 7.3, 5.0, label='RESTful API (JSON)', offset_y=0.40)

    draw_clean_arrow(ax, 7.6, 5.6, 6.5, 7.1, label='Lưu / Đọc Cache', offset_y=0.35, offset_x=-0.2)
    draw_clean_arrow(ax, 8.8, 5.6, 9.8, 7.1, label='Webhook VietQR', offset_y=0.35, offset_x=0.2)

    draw_clean_arrow(ax, 9.1, 5.4, 13.5, 6.7, label='SQL (pgPool)', offset_y=0.45)
    draw_clean_arrow(ax, 9.1, 5.0, 13.5, 5.0, label='Mongoose NoSQL', offset_y=0.40)

    draw_clean_arrow(ax, 8.8, 4.3, 9.9, 2.9, label='Đẩy Hàng Đợi 3D', offset_y=-0.40)
    draw_clean_arrow(ax, 11.2, 2.2, 13.6, 2.2, label='ZeroGPU A100 API', offset_y=0.40)
    draw_clean_arrow(ax, 7.6, 4.3, 6.5, 2.9, label='PromQL Metrics', offset_y=-0.40)

    save_fig(fig, ['hinh_1_1_mindmap.png', 'hinh_1_1_so_do_tu_duy_tong_quan.png'])


# ==============================================================================
# HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN HÌNH CẦU 3D THREE.JS
# ==============================================================================
def render_hinh_2_6():
    fig, ax = plt.subplots(figsize=(16.0, 6.8), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.0, 6.3, 'NGUYÊN LÝ ÁNH XẠ TEXTURE TOÀN CẢNH LÊN HÌNH CẦU NGHỊCH ĐẢO VÀ TƯƠNG TÁC THREE.JS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    # 4 bước trực quan thoáng đãng
    draw_clean_icon(ax, 2.0, 3.4, 'icon_360_grid.png', '1. Nguồn Ảnh Panorama 8K', 'Equirectangular (2:1 / WebP)', target_px=65)
    draw_clean_icon(ax, 6.0, 3.4, 'icon_wireframe_3d.png', '2. Lưới Cầu Nghịch Đảo', 'MeshSphereGeometry (Lật pháp tuyến)', target_px=65)
    draw_clean_icon(ax, 10.2, 3.4, 'icon_browser.png', '3. Điều Khiển & Raycaster', 'OrbitControls (Yaw/Pitch) & Hotspot', target_px=65)
    draw_clean_icon(ax, 14.2, 3.4, 'icon_client.png', '4. Trình Diễn Tương Tác', 'Góc nhìn người xem 360° & Pop-up', target_px=65)

    # Mũi tên luồng hoạt động
    draw_clean_arrow(ax, 3.2, 3.4, 4.8, 3.4, label='TextureLoader (Nạp VRAM)', offset_y=0.45)
    draw_clean_arrow(ax, 7.2, 3.4, 9.0, 3.4, label='Ánh xạ Texture mặt trong', offset_y=0.45)
    draw_clean_arrow(ax, 11.4, 3.4, 13.0, 3.4, label='Raycasting bắt tọa độ tia nhìn', offset_y=0.45)

    save_fig(fig, ['hinh_2_6_texture_mapping.png'])


# ==============================================================================
# HÌNH 2.8: QUY TRÌNH TÁI TẠO MÔ HÌNH CỔ VẬT 3D ĐA PHƯƠNG THỨC
# ==============================================================================
def render_hinh_2_8():
    fig, ax = plt.subplots(figsize=(16.0, 6.8), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.0, 6.3, 'QUY TRÌNH TÁI TẠO CỔ VẬT 3D TỪ CHUỖI ẢNH TƯ LIỆU VỚI BÓC TÁCH PHÔNG NỀN',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.4, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', 'Đơn diện / Đối lập / Đa góc', target_px=60)
    draw_clean_icon(ax, 6.0, 3.4, 'icon_feature_match.png', '2. Bóc Tách Nền Tự Động', 'Rembg / U2-Net (Chuẩn hóa Alpha)', target_px=62)
    draw_clean_icon(ax, 10.2, 3.4, 'icon_huggingface.png', '3. Sinh Khối Lưới 3D', 'Hugging Face TRELLIS (SLAT & DMC)', target_px=65)
    draw_clean_icon(ax, 14.2, 3.4, 'icon_wireframe_3d.png', '4. Xuất Mô Hình .GLB', 'PBR Texture & Nén Draco WebGL', target_px=65)

    draw_clean_arrow(ax, 3.1, 3.4, 4.8, 3.4, label='Tải lên RESTful API', offset_y=0.45)
    draw_clean_arrow(ax, 7.2, 3.4, 9.0, 3.4, label='Ảnh Alpha Mask chuyển tiếp', offset_y=0.45)
    draw_clean_arrow(ax, 11.4, 3.4, 13.0, 3.4, label='Xuất mô hình chuẩn Web', offset_y=0.45)

    save_fig(fig, ['hinh_2_8_photogrammetry.png'])


# ==============================================================================
# HÌNH 2.9: KIẾN TRÚC PHÂN TẦNG HỆ THỐNG 3 TẦNG LAI GHÉP
# ==============================================================================
def render_hinh_2_9():
    fig, ax = plt.subplots(figsize=(17.0, 9.5), dpi=300)
    ax.set_xlim(0, 17.0); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.5, 9.0, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    ax.text(2.6, 8.2, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.5, 8.2, 'TẦNG 2: SERVICES & QUEUE', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(14.4, 8.2, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.axvline(x=5.5, ymin=0.06, ymax=0.85, color='#CBD5E1', linestyle='--', lw=1.5)
    ax.axvline(x=11.5, ymin=0.06, ymax=0.85, color='#CBD5E1', linestyle='--', lw=1.5)

    # Tầng 1
    draw_clean_icon(ax, 2.6, 6.5, 'icon_browser.png', 'Trình duyệt Web (Client)', 'React 18 & WebGL Three.js', target_px=60)
    draw_clean_icon(ax, 2.6, 2.3, 'icon_client.png', 'Quản trị viên (Admin CMS)', 'Quản trị vé, phòng & cổ vật', target_px=58)

    # Tầng 2
    draw_clean_icon(ax, 8.5, 6.8, 'icon_server.png', 'Máy chủ Nginx & Node.js', 'Reverse Proxy & REST API Gateway', target_px=66)
    draw_clean_icon(ax, 8.5, 4.4, 'icon_redis.png', 'Bộ đệm In-Memory Redis', 'Lưu trữ phiên & Cache dữ liệu', target_px=56)
    draw_clean_icon(ax, 8.5, 1.8, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Điều phối tác vụ bất đồng bộ', target_px=58)

    # Tầng 3
    draw_clean_icon(ax, 14.4, 7.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé tham quan & Đơn hàng', target_px=60)
    draw_clean_icon(ax, 14.4, 5.2, 'icon_mongodb.png', 'CSDL MongoDB NoSQL', '18 Gian phòng 360° & Cổ vật', target_px=56)
    draw_clean_icon(ax, 14.4, 3.2, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng thanh toán VietQR Napas 247', target_px=58)
    draw_clean_icon(ax, 14.4, 1.2, 'icon_huggingface.png', 'Hugging Face Spaces', 'Mô hình 3D TRELLIS (ZeroGPU)', target_px=58)

    # Mũi tên kết nối
    draw_clean_arrow(ax, 3.8, 6.5, 7.2, 6.8, label='HTTPS / WSS (Port 443)', offset_y=0.45)
    draw_clean_arrow(ax, 3.8, 2.5, 7.2, 6.2, label='RESTful API (JSON)', offset_y=-0.45)

    draw_clean_arrow(ax, 8.5, 5.9, 8.5, 5.1, label='Cache Hit / Miss', offset_x=1.3, offset_y=0.0)
    draw_clean_arrow(ax, 8.5, 3.6, 8.5, 2.6, label='Đẩy tác vụ 3D', offset_x=1.2, offset_y=0.0)

    draw_clean_arrow(ax, 9.8, 6.9, 13.1, 7.2, label='SQL (pgPool)', offset_y=0.45)
    draw_clean_arrow(ax, 9.8, 6.3, 13.1, 5.4, label='Mongoose NoSQL', offset_y=0.45)
    draw_clean_arrow(ax, 9.8, 5.8, 13.1, 3.4, label='Webhook VietQR', offset_y=-0.45)
    draw_clean_arrow(ax, 9.8, 1.8, 13.1, 1.3, label='Gọi API ZeroGPU A100', offset_y=0.45)

    save_fig(fig, ['hinh_2_9_architecture_3tier.png'])


# ==============================================================================
# HÌNH 2.10: XÁC THỰC NGƯỜI DÙNG BẰNG JWT & HTTPONLY COOKIE (SEQUENCE DIAGRAM)
# ==============================================================================
def render_hinh_2_10():
    fig, ax = plt.subplots(figsize=(16.0, 8.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(8.0, 8.0, 'SƠ ĐỒ TUẦN TỰ: XÁC THỰC VÀ PHÂN QUYỀN BẰNG JSON WEB TOKEN (JWT) & HTTPONLY COOKIE',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    # 3 Participants dùng Real Icons
    draw_clean_icon(ax, 2.5, 6.8, 'icon_browser.png', 'Trình duyệt Client', 'User / Admin', target_px=58)
    draw_clean_icon(ax, 8.0, 6.8, 'icon_server.png', 'API Gateway / Auth', 'Node.js Express', target_px=58)
    draw_clean_icon(ax, 13.5, 6.8, 'icon_postgres.png', 'Cơ sở Dữ liệu', 'PostgreSQL 16', target_px=58)

    # Đường gióng Lifeline
    for lx in [2.5, 8.0, 13.5]:
        ax.plot([lx, lx], [1.2, 5.7], color='#94A3B8', linestyle='--', lw=1.5, zorder=5)

    # 5 bước tuần tự rõ ràng, khoảng cách rộng rãi
    y_steps = [5.0, 4.1, 3.2, 2.3, 1.5]

    # Bước 1: Client -> Server: POST /api/auth/login
    draw_clean_arrow(ax, 2.5, y_steps[0], 8.0, y_steps[0], label='1. POST /api/auth/login (email, password)', offset_y=0.35, shrinkA=8, shrinkB=8)

    # Bước 2: Server -> DB: SELECT * FROM users WHERE email = ?
    draw_clean_arrow(ax, 8.0, y_steps[1], 13.5, y_steps[1], label='2. SELECT * FROM users WHERE email = ?', offset_y=0.35, shrinkA=8, shrinkB=8)

    # Bước 3: DB -> Server: Trả về user & mật khẩu băm
    draw_clean_arrow(ax, 13.5, y_steps[2], 8.0, y_steps[2], label='3. Trả về bản ghi user & mật khẩu băm Bcrypt', offset_y=0.35, shrinkA=8, shrinkB=8)

    # Bước 4: Server -> Client: Trả về JWT Access Token (24h)
    draw_clean_arrow(ax, 8.0, y_steps[3], 2.5, y_steps[3], label='4. Trả về JWT Access Token (24h) kèm HttpOnly Cookie', offset_y=0.35, shrinkA=8, shrinkB=8)

    # Bước 5: Client -> Server: GET /api/rooms (Bearer Token)
    draw_clean_arrow(ax, 2.5, y_steps[4], 8.0, y_steps[4], label='5. GET /api/rooms (Header: Authorization Bearer <token>)', offset_y=0.35, shrinkA=8, shrinkB=8)

    save_fig(fig, ['hinh_2_10_jwt_auth.png'])


# ==============================================================================
# HÌNH 2.11 & 3.6 & 4.8: QUY TRÌNH THANH TOÁN VIETQR PAYOS
# ==============================================================================
def render_hinh_payos_flow():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.7, 'QUY TRÌNH SINH MÃ VÀ XÁC THỰC THANH TOÁN VIETQR QUA CỔNG PAYOS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.8, 'icon_client.png', '1. Khách Mua Vé', 'Giao diện Booking Web', target_px=60)
    draw_clean_icon(ax, 6.0, 3.8, 'icon_server.png', '2. Backend Server', 'Tạo Payment Link & Đơn', target_px=64)
    draw_clean_icon(ax, 10.5, 3.8, 'icon_payos.png', '3. Cổng PayOS', 'VietQR Napas 247 Động', target_px=65)
    draw_clean_icon(ax, 14.8, 3.8, 'icon_browser.png', '4. Ứng Dụng Ngân Hàng', 'Quét QR & Chuyển khoản', target_px=60)

    # Database bên dưới
    draw_clean_icon(ax, 6.0, 1.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng Tickets & Transactions (PAID)', target_px=56)

    draw_clean_arrow(ax, 3.1, 4.3, 4.9, 4.3, label='1. Chọn vé & Đặt mua', offset_y=0.40)
    draw_clean_arrow(ax, 7.1, 4.3, 9.4, 4.3, label='2. Gọi API tạo VietQR', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 4.3, 13.7, 4.3, label='3. Hiển thị mã QR động', offset_y=0.40)

    draw_clean_arrow(ax, 13.7, 3.3, 11.6, 3.3, label='4. Chuyển khoản thành công', offset_y=-0.40)
    draw_clean_arrow(ax, 9.4, 3.3, 7.1, 3.3, label='5. Webhook PayOS gọi lại', offset_y=-0.40)
    draw_clean_arrow(ax, 4.9, 3.3, 3.1, 3.3, label='7. SSE đẩy vé QR về client', offset_y=-0.40)

    draw_clean_arrow(ax, 6.0, 2.9, 6.0, 1.9, label='6. Cập nhật PAID & Ký số AES', offset_x=1.7, offset_y=0.0)

    save_fig(fig, ['hinh_2_11_payos_flow.png', 'hinh_3_6_activity_booking_ticket_lifecycle.png', 'hinh_3_6_sequence_payment_payos.png', 'hinh_4_8_payment_ticket_flow.png', 'flow_05_ticketing_vietqr_qr.png'])


# ==============================================================================
# HÌNH 2.12 & 3.7: SOÁT VÉ ĐIỆN TỬ QR THỜI GIAN THỰC
# ==============================================================================
def render_hinh_qr_validation():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'QUY TRÌNH QUÉT VÀ XÁC THỰC MÃ VÉ QR THỜI GIAN THỰC TẠI CỔNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_browser.png', '1. Vé trên Mobile', 'Mã QR mã hóa AES-256', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_client.png', '2. Camera Soát Vé', 'Html5Qrcode Scanner (Staff)', target_px=60)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_server.png', '3. Backend Server', 'Giải mã AES & Kiểm tra Hash', target_px=64)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_postgres.png', '4. CSDL PostgreSQL', 'Cập nhật trạng thái USED', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='1. Quét mã QR (< 150ms)', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='2. POST /tickets/validate', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='3. Kiểm tra & Đổi USED', offset_y=0.40)

    save_fig(fig, ['hinh_2_12_qr_validation.png', 'hinh_3_7_activity_ticket_validation.png', 'hinh_3_7_sequence_qr_scan.png'])


# ==============================================================================
# HÌNH 2.13: KIẾN TRÚC ẢO HÓA DOCKER COMPOSE & NGINX
# ==============================================================================
def render_hinh_2_13():
    fig, ax = plt.subplots(figsize=(16.5, 7.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.25, 7.0, 'SƠ ĐỒ ĐIỀU PHỐI VÀ ĐÓNG GÓI HỆ THỐNG VỚI DOCKER COMPOSE TRÊN VPS UBUNTU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    # Nginx Reverse Proxy
    draw_clean_icon(ax, 2.2, 3.8, 'icon_server.png', 'Nginx Reverse Proxy', 'Port 80/443 (SSL/TLS Termination)', target_px=64)

    # Backend Node.js
    draw_clean_icon(ax, 6.5, 3.8, 'icon_server.png', 'Node.js API Container', 'Port 5000 (Express & TypeScript)', target_px=64)

    # Redis & RabbitMQ
    draw_clean_icon(ax, 10.8, 5.5, 'icon_redis.png', 'Redis Container', 'Port 6379 (In-Memory Cache)', target_px=56)
    draw_clean_icon(ax, 10.8, 2.1, 'icon_rabbitmq.png', 'RabbitMQ Container', 'Port 5672 (Message Broker)', target_px=56)

    # Databases
    draw_clean_icon(ax, 14.8, 5.5, 'icon_postgres.png', 'PostgreSQL 16', 'Port 5432 (Relational Data)', target_px=58)
    draw_clean_icon(ax, 14.8, 2.1, 'icon_mongodb.png', 'MongoDB NoSQL', 'Port 27017 (360 Rooms & Items)', target_px=56)

    draw_clean_arrow(ax, 3.3, 3.8, 5.4, 3.8, label='Proxy Pass (Internal Network)', offset_y=0.40)
    draw_clean_arrow(ax, 7.6, 4.3, 9.7, 5.3, label='Cache TCP', offset_y=0.40)
    draw_clean_arrow(ax, 7.6, 3.3, 9.7, 2.3, label='AMQP Queue', offset_y=-0.40)

    draw_clean_arrow(ax, 7.6, 4.6, 13.7, 5.7, label='Postgres Pool', offset_y=0.55)
    draw_clean_arrow(ax, 7.6, 3.0, 13.7, 2.1, label='Mongo Connection', offset_y=-0.55)

    save_fig(fig, ['hinh_2_13_docker_compose.png'])


# ==============================================================================
# HÌNH 2.14 & 3.9: HỆ THỐNG GIÁM SÁT GRAFANA & PROMETHEUS
# ==============================================================================
def render_hinh_grafana():
    fig, ax = plt.subplots(figsize=(16.5, 7.0), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(8.25, 6.5, 'KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT VỚI PROMETHEUS VÀ GRAFANA V11',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.4, 'icon_server.png', '1. Node.js & Nginx API', 'Cung cấp Endpoint /metrics', target_px=62)
    draw_clean_icon(ax, 6.2, 3.4, 'icon_server.png', '2. Prometheus Server', 'Scrape chu kỳ 15s (TSDB)', target_px=62)
    draw_clean_icon(ax, 10.5, 3.4, 'icon_grafana.png', '3. Grafana Dashboard', 'Truy vấn PromQL & Trực quan', target_px=64)
    draw_clean_icon(ax, 14.8, 3.4, 'icon_client.png', '4. Quản trị viên (CMS)', 'Chế độ Kiosk nhúng IFrame', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.4, 5.1, 3.4, label='Pull Metrics (HTTP /metrics)', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.4, 9.4, 3.4, label='PromQL Query Engine', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.4, 13.7, 3.4, label='Hiển thị biểu đồ APM', offset_y=0.40)

    save_fig(fig, ['hinh_2_14_grafana_architecture.png', 'hinh_3_9_grafana_sequence.png'])


# ==============================================================================
# HÌNH 3.8: TƯƠNG TÁC TOUR 360° VÀ CHUYỂN PHÒNG QUA HOTSPOT
# ==============================================================================
def render_hinh_3_8():
    fig, ax = plt.subplots(figsize=(16.5, 6.8), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.25, 6.3, 'SƠ ĐỒ HOẠT ĐỘNG: TƯƠNG TÁC KHÔNG GIAN 360° VÀ CHUYỂN PHÒNG QUA ĐIỂM NỐI HOTSPOT',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.3, 'icon_client.png', '1. Khách Tham Quan', 'Nhấp chọn Hotspot trên màn hình', target_px=60)
    draw_clean_icon(ax, 6.2, 3.3, 'icon_browser.png', '2. Trình Duyệt WebGL', 'Raycaster tính toán va chạm 3D', target_px=62)
    draw_clean_icon(ax, 10.5, 3.3, 'icon_server.png', '3. Backend API Gateway', 'Truy vấn thông tin phòng đích', target_px=64)
    draw_clean_icon(ax, 14.8, 3.3, 'icon_mongodb.png', '4. CSDL MongoDB', 'Cấu trúc phòng & Liên kết', target_px=58)

    draw_clean_arrow(ax, 3.1, 3.3, 5.1, 3.3, label='Nhấp chuột / Chạm cảm ứng', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.3, 9.4, 3.3, label='GET /api/rooms/:targetId', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.3, 13.7, 3.3, label='Truy vấn cấu trúc 360°', offset_y=0.40)

    save_fig(fig, ['hinh_3_8_sequence_tour_hotspot.png'])


# ==============================================================================
# HÌNH 3.10: DỊCH THUẬT VÀ BẢN ĐỊA HÓA ĐA NGÔN NGỮ
# ==============================================================================
def render_hinh_3_10():
    fig, ax = plt.subplots(figsize=(16.5, 6.8), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.25, 6.3, 'QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION WORKFLOW)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.3, 'icon_client.png', '1. Chọn Ngôn Ngữ', '7 Ngôn ngữ (Vi, En, Fr, Zh, Ja...)', target_px=60)
    draw_clean_icon(ax, 6.2, 3.3, 'icon_server.png', '2. Backend Localization', 'Kiểm tra tệp JSON cục bộ', target_px=64)
    draw_clean_icon(ax, 10.5, 3.3, 'icon_ai_brain.png', '3. Động Cơ Google NMT', 'Dịch thuật tự động khi thiếu từ điển', target_px=62)
    draw_clean_icon(ax, 14.8, 3.3, 'icon_browser.png', '4. Trình Diễn Đa Ngữ', 'Cập nhật tiêu đề & Thuyết minh', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.3, 5.1, 3.3, label='Chuyển mã ISO ngôn ngữ', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.3, 9.4, 3.3, label='Fallback gọi NMT API', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.3, 13.7, 3.3, label='Trả về từ điển bản địa hóa', offset_y=0.40)

    save_fig(fig, ['hinh_3_10_translation_flow.png'])


# ==============================================================================
# HÌNH 3.11 & 4.9: SINH VÀ LƯU TRỮ ĐỆM BĂM GIỌNG ĐỌC VOICE AI TTS
# ==============================================================================
def render_hinh_voice_tts():
    fig, ax = plt.subplots(figsize=(16.5, 7.2), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(8.25, 6.7, 'QUY TRÌNH SINH VÀ LƯU TRỮ ĐỆM BĂM (HASH CACHING) GIỌNG ĐỌC THUYẾT MINH AI',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.6, 'icon_client.png', '1. Bật Thuyết Minh', 'Nhấp biểu tượng loa trên Tour', target_px=60)
    draw_clean_icon(ax, 6.0, 3.6, 'icon_server.png', '2. Backend Voice Service', 'Băm MD5 nội dung văn bản', target_px=64)
    draw_clean_icon(ax, 10.4, 5.2, 'icon_redis.png', '3a. Bộ Đệm Redis / Cache', 'Trả về tệp .MP3 có sẵn (0ms)', target_px=56)
    draw_clean_icon(ax, 10.4, 2.0, 'icon_ai_brain.png', '3b. Google Cloud TTS', 'Sinh giọng đọc Neural2 tự nhiên', target_px=62)
    draw_clean_icon(ax, 14.8, 3.6, 'icon_browser.png', '4. Phát Âm Thanh Web Audio', 'Stream Audio Partial Content 206', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.6, 4.9, 3.6, label='Yêu cầu giọng đọc', offset_y=0.40)
    draw_clean_arrow(ax, 7.1, 4.1, 9.3, 4.9, label='Cache Hit (Có sẵn)', offset_y=0.40)
    draw_clean_arrow(ax, 7.1, 3.1, 9.3, 2.3, label='Cache Miss (Chưa có)', offset_y=-0.40)
    draw_clean_arrow(ax, 11.5, 5.0, 13.7, 4.1, label='Stream file có sẵn', offset_y=0.40)
    draw_clean_arrow(ax, 11.5, 2.3, 13.7, 3.2, label='Lưu đệm & Phát trực tiếp', offset_y=-0.40)

    save_fig(fig, ['hinh_3_11_voice_tts_storage_pipeline.png', 'flow_03_languages_voice_ai.png'])


# ==============================================================================
# HÌNH 3.12: KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# ==============================================================================
def render_hinh_3_12():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH (MULTI-SHEET EXCEL)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_client.png', '1. Quản Trị Viên (Admin)', 'Yêu cầu xuất báo cáo Excel', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_server.png', '2. Backend Excel Worker', 'Thư viện ExcelJS (Streaming)', target_px=64)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_postgres.png', '3. CSDL PostgreSQL 16', 'Truy vấn doanh thu & vé bán', target_px=60)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_browser.png', '4. Tải Tệp .XLSX', 'Bảng tính định dạng chuẩn', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='GET /api/reports/export', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='Truy vấn dữ liệu tài chính', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='Stream tải tệp về máy tính', offset_y=0.40)

    save_fig(fig, ['hinh_3_12_excel_export_flow.png', 'hinh_3_12_excel_export_activity.png'])


# ==============================================================================
# HÌNH 3.13: QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT KHÁM PHÁ PHYGITAL
# ==============================================================================
def render_hinh_3_13():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_client.png', '1. Khách Tham Quan', 'Quét mã QR dán tại tủ kính', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_browser.png', '2. Camera QR Scanner', 'Điều hướng URL định danh hiện vật', target_px=60)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_server.png', '3. Backend CMS Gateway', 'Truy vấn dữ liệu hiện vật & 3D', target_px=64)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_wireframe_3d.png', '4. Hiển Thị 3D WebGL', 'Xoay 360° & Nghe Audio Guide', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='Quét QR hiện vật thực địa', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='Mở /artifacts/:id trên Web', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='Tải mô hình 3D .GLB', offset_y=0.40)

    save_fig(fig, ['hinh_3_13_qr_exhibition_activity.png'])


# ==============================================================================
# HÌNH 4.1: QUY TRÌNH TỰ ĐỘNG HÓA CI/CD QUA GITHUB ACTIONS
# ==============================================================================
def render_hinh_4_1():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'SƠ ĐỒ ĐƯỜNG ỐNG TỰ ĐỘNG HÓA KIỂM THỬ VÀ TRIỂN KHAI LIÊN TỤC (CI/CD) GITHUB ACTIONS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_client.png', '1. Lập Trình Viên', 'Git Push nhánh main/feature', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_server.png', '2. GitHub Runner', 'Lint, Jest & Unit Test CI', target_px=62)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_server.png', '3. Docker Build & Tag', 'Đóng gói Container Images', target_px=62)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_server.png', '4. VPS Production', 'SSH Deploy & Zero-Downtime', target_px=64)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='1. Git Commit & Push', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='2. Tự động kiểm thử pass', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='3. Docker Compose restart', offset_y=0.40)

    save_fig(fig, ['hinh_4_1_cicd_pipeline.png', 'flow_01_stitching_process.png'])


# ==============================================================================
# HÌNH 4.3: XỬ LÝ TOÀN CẢNH 360° TỪ 4 NGUỒN ẢNH ĐẦU VÀO
# ==============================================================================
def render_hinh_4_3():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'QUY TRÌNH XỬ LÝ VÀ CHUẨN HÓA ẢNH TOÀN CẢNH 360° TỪ 4 PHƯƠNG THỨC NẠP DỮ LIỆU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', '4 Nguồn (Video sweep, Chụp liên tiếp...)', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_feature_match.png', '2. Panorama Studio', 'Nắn chỉnh trụ & Khớp SIFT/RANSAC', target_px=62)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_server.png', '3. Hòa Trộn Đa Dải Tần', 'Khử vết ghép Seam & Tối ưu sáng', target_px=64)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_360_grid.png', '4. Xuất Ảnh 360° 8K', 'Equirectangular WebP 60 FPS', target_px=62)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='Nạp tệp ảnh qua CMS', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='Trích xuất ma trận Homography', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='Lưu trữ CDN Cloudflare R2', offset_y=0.40)

    save_fig(fig, ['hinh_4_3_panorama_4inputs.png'])


# ==============================================================================
# HÌNH 4.5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (HUGGING FACE TRELLIS & LOCAL CPU)
# ==============================================================================
def render_hinh_4_5():
    fig, ax = plt.subplots(figsize=(16.5, 7.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.25, 7.0, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI ĐỘNG CƠ AI',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)
    ax.text(8.25, 6.5, 'Hỗ trợ bóc tách phông nền Rembg / Alpha Mask — Ưu tiên Hugging Face (TRELLIS) và Tự động Fallback sang Local CPU',
            ha='center', va='center', fontsize=9.2, fontstyle='italic', color='#475569')

    draw_clean_icon(ax, 1.8, 3.8, 'icon_client.png', 'Quản trị viên', 'Nạp ảnh tư liệu cổ vật', target_px=58)
    draw_clean_icon(ax, 5.2, 3.8, 'icon_rabbitmq.png', 'Hàng đợi 3D Queue', 'Phân luồng & Giám sát tài nguyên', target_px=58)

    # Hugging Face Spaces TRELLIS AI
    draw_clean_icon(ax, 10.2, 5.5, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'ZeroGPU A100 (Microsoft Research)', target_px=65)
    draw_clean_icon(ax, 10.2, 2.0, 'icon_server.png', 'Máy chủ Local CPU', 'Marching Cubes (Dự phòng độc lập)', target_px=62)

    draw_clean_icon(ax, 14.8, 3.8, 'icon_browser.png', 'Mô hình 3D (.GLB)', 'Hiển thị WebGL Three.js', target_px=62)

    draw_clean_arrow(ax, 2.8, 3.8, 4.2, 3.8, label='Tải ảnh lên', offset_y=0.40)
    draw_clean_arrow(ax, 6.2, 4.3, 9.0, 5.3, label='Ưu tiên gọi API AI', offset_y=0.45)
    draw_clean_arrow(ax, 6.2, 3.3, 9.0, 2.3, label='Tùy chọn Local CPU', offset_y=-0.45)
    draw_clean_arrow(ax, 11.4, 5.3, 13.8, 4.1, label='Xuất .GLB PBR', offset_y=0.45)
    draw_clean_arrow(ax, 11.4, 2.3, 13.8, 3.5, label='Xuất .GLB xoay trục', offset_y=-0.45)

    # Fallback line
    draw_clean_arrow(ax, 10.2, 4.6, 10.2, 2.9, label='Fallback khi Quota 429', offset_x=1.7, offset_y=0.0)

    save_fig(fig, ['hinh_4_5_artifact_2engines.png', 'flow_04_dual_engine_3d.png'])


# ==============================================================================
# HÌNH 4.7: GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG ĐI NGẮN NHẤT 18 PHÒNG
# ==============================================================================
def render_hinh_4_7():
    fig, ax = plt.subplots(figsize=(16.5, 6.5), dpi=300)
    ax.set_xlim(0, 16.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(8.25, 6.0, 'SƠ ĐỒ KHỐI: GIẢI THUẬT DIJKSTRA TÌM LỘ TRÌNH DI CHUYỂN TỐI ƯU GIỮA 18 PHÒNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.0, 3.0, 'icon_client.png', '1. Khách Tham Quan', 'Chọn phòng xuất phát & phòng đích', target_px=60)
    draw_clean_icon(ax, 6.2, 3.0, 'icon_server.png', '2. Trình Tính Dijkstra', 'Ma trận trọng số kề 18 đỉnh', target_px=64)
    draw_clean_icon(ax, 10.5, 3.0, 'icon_mongodb.png', '3. Dữ Liệu Tọa Độ Sơ Đồ', 'Khoảng cách Euclide thực địa', target_px=58)
    draw_clean_icon(ax, 14.8, 3.0, 'icon_browser.png', '4. Mini-map Định Tuyến', 'Vẽ đường line dẫn đường trực quan', target_px=60)

    draw_clean_arrow(ax, 3.1, 3.0, 5.1, 3.0, label='Yêu cầu tìm đường tối ưu', offset_y=0.40)
    draw_clean_arrow(ax, 7.3, 3.0, 9.4, 3.0, label='Nạp trọng số khoảng cách', offset_y=0.40)
    draw_clean_arrow(ax, 11.6, 3.0, 13.7, 3.0, label='Hiển thị chuỗi phòng cần đi', offset_y=0.40)

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
