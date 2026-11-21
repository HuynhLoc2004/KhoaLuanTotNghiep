# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỆ THỐNG VỚI CÁC ICON CÔNG NGHỆ CHÍNH XÁC CỦA DỰ ÁN
Bộ Icon thực tế tách nền chuẩn:
- icon_payos.png: Cổng thanh toán VietQR PayOS
- icon_redis.png: Bộ đệm In-Memory Cache Redis
- icon_client.png: Khách tham quan Client
- icon_postgres.png: CSDL Quan hệ PostgreSQL 16
- icon_mongodb.png: CSDL NoSQL MongoDB
- icon_grafana.png: Giám sát viễn trắc Grafana Dashboard
- icon_server.png: Máy chủ Backend / Nginx Reverse Proxy
- icon_rabbitmq.png: Hàng đợi thông điệp RabbitMQ / Worker
- icon_browser.png: Trình duyệt Web / Cookie & Token
- icon_ai_brain.png: Bộ não tích hợp AI (TRELLIS 3D, U2-Net, TTS)

Tiêu chuẩn:
- KHÔNG Ô VUÔNG ĐÓNG KHUNG MÀU MÈ
- KHÔNG GHI QUÁ NHIỀU TEXT TRONG SƠ ĐỒ
- TEXT TRÊN MŨI TÊN TUYỆT ĐỐI KHÔNG ĐÈ LÊN ĐƯỜNG KẺ MŨI TÊN
- BÁM SÁT 100% CẤU TRÚC KỸ THUẬT CỦA BẢO TÀNG 360°
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
POSTER_ASSETS = r"d:\KhoaluanTotNghiep\poster\assets"

os.makedirs(DIAGRAMS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(POSTER_ASSETS, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

C_INK = '#0F172A'       # Đen than chì đậm
C_TEXT = '#0F172A'      # Chữ tiêu đề
C_MUTED = '#475569'     # Chữ phụ
C_LINE = '#334155'      # Mũi tên kết nối


def draw_tech_icon(ax, x, y, icon_filename, label, sub='', target_px=58):
    """Vẽ icon công nghệ thực tế (Không ô vuông, không khung viền)"""
    p = os.path.join(DOCS_ICONS, icon_filename)
    if os.path.exists(p):
        im = Image.open(p).convert('RGBA')
        zoom = float(target_px) / float(max(im.size))
        im_box = OffsetImage(im, zoom=zoom)
        ab = AnnotationBbox(im_box, (x, y), frameon=False, zorder=15)
        ax.add_artist(ab)
    
    # Chỉ ghi đúng tên công nghệ bên dưới icon
    ax.text(x, y - 0.48, label, ha='center', va='top', fontsize=9.5, fontweight='bold', color=C_TEXT, zorder=20)
    if sub:
        ax.text(x, y - 0.74, sub, ha='center', va='top', fontsize=8.0, color=C_MUTED, zorder=20)


def draw_arrow_no_overlap(ax, x1, y1, x2, y2, label='', lx=None, ly=None, shrinkA=26, shrinkB=26, rad=0.0):
    """
    Vẽ mũi tên tuyệt đối KHÔNG đè lên chữ:
    - Khoảng dừng shrinkA, shrinkB an toàn để không chạm vào icon.
    - Nhãn chữ được đặt ở tọa độ lx, ly thoáng đãng kèm nền trắng padding che ngầm.
    """
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->,head_width=0.42,head_length=0.62', color=C_LINE, lw=1.8,
                                shrinkA=shrinkA, shrinkB=shrinkB, connectionstyle=conn), zorder=8)
    if label:
        if lx is None or ly is None:
            mx = (x1 + x2) / 2
            my = (y1 + y2) / 2
            lx = mx
            ly = my + 0.32
        ax.text(lx, ly, label, ha='center', va='center', fontsize=8.6, fontweight='bold', color=C_TEXT,
                bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor='#64748B', lw=1.0, alpha=1.0),
                zorder=25)


# ==============================================================================
# 1. HÌNH 1: SƠ ĐỒ TƯ DUY KIẾN TRÚC TỔNG QUAN HỆ THỐNG (MINDMAP TOÀN DIỆN)
# Khách tải cao (Nhiều User) -> Trình duyệt -> Máy chủ Nginx -> API -> CSDL, Cache, Queue, PayOS, AI, Grafana
# ==============================================================================
def gen_hinh_1_real_icons():
    fig, ax = plt.subplots(figsize=(16.0, 9.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.0, 9.0, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # 1. Khối Khách tải cao (Multiple Users & Browser)
    draw_tech_icon(ax, 1.8, 7.0, 'icon_client.png', 'Khách tham quan 1', target_px=52)
    draw_tech_icon(ax, 1.8, 5.0, 'icon_client.png', 'Khách tham quan 2', target_px=52)
    draw_tech_icon(ax, 1.8, 3.0, 'icon_client.png', 'Khách tham quan N...', target_px=52)
    draw_tech_icon(ax, 1.8, 1.1, 'icon_client.png', 'Quản trị viên (Admin)', target_px=52)

    # 2. Trình duyệt Web (Browser / Token / Cookies)
    draw_tech_icon(ax, 4.3, 5.0, 'icon_browser.png', 'Trình duyệt Web', 'Token & Cookies WebGL', target_px=56)

    # 3. Máy chủ trung tâm (Nginx & Node.js API Gateway)
    draw_tech_icon(ax, 7.8, 5.0, 'icon_server.png', 'Máy chủ Ứng dụng', 'Nginx & Node.js API', target_px=65)

    # 4. Các phân hệ dịch vụ xung quanh máy chủ:
    # Top-Left: Redis Cache
    draw_tech_icon(ax, 5.8, 7.8, 'icon_redis.png', 'Bộ đệm Redis', 'Cache & Session', target_px=52)
    # Top-Right: PayOS
    draw_tech_icon(ax, 10.0, 7.8, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng VietQR Napas', target_px=56)
    # Right-Top: PostgreSQL
    draw_tech_icon(ax, 13.8, 7.0, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Vé & Người dùng (ACID)', target_px=58)
    # Right-Middle: MongoDB
    draw_tech_icon(ax, 13.8, 5.0, 'icon_mongodb.png', 'CSDL MongoDB', '18 Phòng 360° & Cổ vật', target_px=55)
    # Right-Bottom: RabbitMQ Worker
    draw_tech_icon(ax, 10.2, 2.2, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Xử lý tác vụ nền 3D', target_px=56)
    # Bottom-Right: Hugging Face (TRELLIS 3D)
    draw_tech_icon(ax, 13.8, 2.2, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'Mô hình 3D (Microsoft Research)', target_px=58)
    # Bottom-Left: Grafana Monitoring
    draw_tech_icon(ax, 5.8, 2.2, 'icon_grafana.png', 'Giám sát Grafana', 'Viễn trắc Prometheus', target_px=54)

    # --- MŨI TÊN KẾT NỐI (ĐƯỢC ĐẶT TỌA ĐỘ CHÍNH XÁC, KHÔNG ĐÈ LÊN NHAU) ---
    # Users -> Browser
    draw_arrow_no_overlap(ax, 2.5, 6.8, 3.7, 5.5, label='HTTPS', lx=3.0, ly=6.3, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 2.5, 5.0, 3.6, 5.0, label='WSS', lx=3.05, ly=5.3, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 2.5, 3.2, 3.7, 4.5, label='Web Tour', lx=3.0, ly=3.7, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 2.5, 1.4, 4.1, 4.2, label='JWT Auth', lx=3.2, ly=2.5, shrinkA=16, shrinkB=16)

    # Browser -> Server
    draw_arrow_no_overlap(ax, 5.0, 5.0, 7.0, 5.0, label='RESTful API', lx=6.0, ly=5.35, shrinkA=18, shrinkB=18)

    # Server <-> Redis
    draw_arrow_no_overlap(ax, 7.3, 5.6, 6.3, 7.2, label='Lưu / Đọc Cache', lx=6.4, ly=6.5, shrinkA=16, shrinkB=16)

    # Server <-> PayOS
    draw_arrow_no_overlap(ax, 8.4, 5.6, 9.4, 7.2, label='Webhook VietQR', lx=9.4, ly=6.5, shrinkA=16, shrinkB=16)

    # Server <-> PostgreSQL
    draw_arrow_no_overlap(ax, 8.6, 5.4, 12.8, 6.7, label='SQL (pgPool)', lx=10.7, ly=6.3, shrinkA=18, shrinkB=18)

    # Server <-> MongoDB
    draw_arrow_no_overlap(ax, 8.7, 5.0, 12.8, 5.0, label='Mongoose NoSQL', lx=10.75, ly=5.35, shrinkA=18, shrinkB=18)

    # Server <-> RabbitMQ
    draw_arrow_no_overlap(ax, 8.4, 4.3, 9.6, 2.8, label='Đẩy Hàng Đợi', lx=8.6, ly=3.35, shrinkA=16, shrinkB=16)

    # RabbitMQ <-> Hugging Face TRELLIS
    draw_arrow_no_overlap(ax, 11.0, 2.2, 12.9, 2.2, label='API ZeroGPU A100', lx=11.95, ly=2.55, shrinkA=16, shrinkB=16)

    # Server <-> Grafana
    draw_arrow_no_overlap(ax, 7.3, 4.3, 6.3, 2.8, label='PromQL Metrics', lx=6.4, ly=3.35, shrinkA=16, shrinkB=16)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_1_1_so_do_tu_duy_tong_quan.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 1 voi Full Tech Icons cua Du an!")


# ==============================================================================
# 2. HÌNH 2: KIẾN TRÚC HỆ THỐNG 3 TẦNG (3-TIER HYBRID ARCHITECTURE)
# ==============================================================================
def gen_hinh_2_real_icons():
    fig, ax = plt.subplots(figsize=(16.0, 9.2), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 9.2); ax.axis('off')

    ax.text(8.0, 8.7, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    ax.text(2.5, 7.9, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.0, 7.9, 'TẦNG 2: SERVICES & QUEUE', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(13.5, 7.9, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.axvline(x=5.2, ymin=0.06, ymax=0.82, color='#CBD5E1', linestyle='--', lw=1.5)
    ax.axvline(x=10.8, ymin=0.06, ymax=0.82, color='#CBD5E1', linestyle='--', lw=1.5)

    # Tầng 1
    draw_tech_icon(ax, 2.5, 6.2, 'icon_browser.png', 'Trình duyệt Web (Client)', 'React 18 & WebGL Three.js', target_px=58)
    draw_tech_icon(ax, 2.5, 2.3, 'icon_client.png', 'Quản trị viên (Admin CMS)', 'Quản lý vé, phòng & cổ vật', target_px=56)

    # Tầng 2
    draw_tech_icon(ax, 8.0, 6.6, 'icon_server.png', 'Máy chủ Nginx & Node.js', 'Reverse Proxy & REST API', target_px=65)
    draw_tech_icon(ax, 8.0, 4.3, 'icon_redis.png', 'Bộ đệm In-Memory Redis', 'Lưu trữ phiên & Cache dữ liệu', target_px=56)
    draw_tech_icon(ax, 8.0, 1.8, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Điều phối tác vụ bất đồng bộ', target_px=58)

    # Tầng 3
    draw_tech_icon(ax, 13.5, 6.8, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé tham quan & Đơn hàng', target_px=58)
    draw_tech_icon(ax, 13.5, 4.9, 'icon_mongodb.png', 'CSDL MongoDB NoSQL', '18 Gian phòng 360° & Cổ vật', target_px=55)
    draw_tech_icon(ax, 13.5, 3.0, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng VietQR Napas 247', target_px=56)
    draw_tech_icon(ax, 13.5, 1.1, 'icon_huggingface.png', 'Hugging Face Spaces', 'TRELLIS 3D (Microsoft Research)', target_px=56)

    # Mũi tên
    draw_arrow_no_overlap(ax, 3.6, 6.2, 6.8, 6.6, label='HTTPS / WSS (Port 443)', lx=5.2, ly=6.75, shrinkA=18, shrinkB=18)
    draw_arrow_no_overlap(ax, 3.6, 2.5, 6.8, 6.0, label='RESTful API (JSON)', lx=5.2, ly=4.0, shrinkA=18, shrinkB=18)

    draw_arrow_no_overlap(ax, 8.0, 5.7, 8.0, 4.9, label='Cache Hit / Miss', lx=9.1, ly=5.3, shrinkA=12, shrinkB=12)
    draw_arrow_no_overlap(ax, 8.0, 3.6, 8.0, 2.5, label='Đẩy tác vụ 3D', lx=9.0, ly=3.05, shrinkA=12, shrinkB=12)

    draw_arrow_no_overlap(ax, 9.2, 6.6, 12.3, 6.8, label='SQL (pgPool)', lx=10.75, ly=7.05, shrinkA=18, shrinkB=18)
    draw_arrow_no_overlap(ax, 9.2, 5.8, 12.3, 4.9, label='Mongoose NoSQL', lx=10.75, ly=5.8, shrinkA=18, shrinkB=18)
    draw_arrow_no_overlap(ax, 9.2, 5.2, 12.3, 3.2, label='Webhook VietQR', lx=10.75, ly=4.15, shrinkA=18, shrinkB=18)
    draw_arrow_no_overlap(ax, 9.2, 1.8, 12.3, 1.2, label='API ZeroGPU A100', lx=10.75, ly=1.75, shrinkA=18, shrinkB=18)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_2_9_architecture_3tier.png")
    out3 = os.path.join(POSTER_ASSETS, "diagram_architecture_3tier_en.png")
    for o in [out1, out2, out3]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 2 voi Tech Icons!")


# ==============================================================================
# 3. HÌNH 5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (HUGGING FACE TRELLIS AI & LOCAL CPU)
# ==============================================================================
def gen_hinh_5_real_icons():
    fig, ax = plt.subplots(figsize=(15.0, 7.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(7.5, 7.1, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI ĐỘNG CƠ AI',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)
    ax.text(7.5, 6.6, 'Hỗ trợ bóc tách phông nền Rembg / Alpha Mask — Ưu tiên Hugging Face (TRELLIS) và Tự động Fallback sang Local CPU',
            ha='center', va='center', fontsize=9.2, fontstyle='italic', color='#475569')

    draw_tech_icon(ax, 1.8, 3.8, 'icon_client.png', 'Quản trị viên', 'Nạp ảnh tư liệu cổ vật', target_px=56)
    draw_tech_icon(ax, 5.0, 3.8, 'icon_rabbitmq.png', 'Hàng đợi 3D Queue', 'Phân luồng & Kiểm tra tài nguyên', target_px=58)

    # Hugging Face Space TRELLIS (Microsoft Research)
    draw_tech_icon(ax, 9.2, 5.5, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'ZeroGPU A100 (Microsoft Research)', target_px=60)
    draw_tech_icon(ax, 9.2, 2.0, 'icon_server.png', 'Máy chủ Local CPU', 'Marching Cubes (Dự phòng)', target_px=60)

    draw_tech_icon(ax, 13.5, 3.8, 'icon_browser.png', 'Mô hình 3D (.GLB)', 'Hiển thị WebGL Three.js', target_px=60)

    draw_arrow_no_overlap(ax, 2.7, 3.8, 4.0, 3.8, label='Tải ảnh lên', lx=3.35, ly=4.15, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 5.9, 4.3, 8.2, 5.3, label='Ưu tiên gọi API AI', lx=6.9, ly=5.25, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 5.9, 3.3, 8.2, 2.3, label='Tùy chọn Local CPU', lx=6.9, ly=2.5, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 10.2, 5.3, 12.5, 4.1, label='Xuất .GLB PBR', lx=11.45, ly=5.05, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 10.2, 2.3, 12.5, 3.5, label='Xuất .GLB xoay trục', lx=11.45, ly=2.6, shrinkA=16, shrinkB=16)

    # Fallback line
    draw_arrow_no_overlap(ax, 9.2, 4.7, 9.2, 2.9, label='Fallback khi Quota 429', lx=9.2, ly=3.8, shrinkA=10, shrinkB=10)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    out2 = os.path.join(ASSETS_DIR, "flow_04_dual_engine_3d.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 5 voi icon_ai_brain.png!")


# ==============================================================================
# 4. HÌNH 6: VÒNG ĐỜI VÉ VIETQR PAYOS VÀ SOÁT VÉ QR THỜI GIAN THỰC
# ==============================================================================
def gen_hinh_6_real_icons():
    fig, ax = plt.subplots(figsize=(15.0, 7.0), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.5, 6.5, 'SƠ ĐỒ VÒNG ĐỜI VÉ THAM QUAN VIETQR VÀ SOÁT VÉ MÃ QR',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    draw_tech_icon(ax, 1.8, 3.5, 'icon_client.png', 'Khách tham quan', 'Đặt vé trực tuyến', target_px=56)
    draw_tech_icon(ax, 5.5, 3.5, 'icon_payos.png', 'Cổng VietQR PayOS', 'Tạo mã Napas 247', target_px=60)
    draw_tech_icon(ax, 9.5, 3.5, 'icon_postgres.png', 'CSDL Vé (PostgreSQL)', 'Mã hóa vé AES-256', target_px=58)
    draw_tech_icon(ax, 13.5, 3.5, 'icon_browser.png', 'Cổng Soát Vé Barie', 'Quét QR Camera (< 1s)', target_px=58)

    draw_arrow_no_overlap(ax, 2.7, 3.5, 4.5, 3.5, label='Khởi tạo đơn hàng', lx=3.6, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 6.5, 3.5, 8.5, 3.5, label='Webhook thanh toán', lx=7.5, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 10.5, 3.5, 12.5, 3.5, label='Kiểm tra vé Realtime', lx=11.5, ly=3.85, shrinkA=16, shrinkB=16)

    out1 = os.path.join(DIAGRAMS_DIR, "flow_05_ticketing_vietqr_qr.png")
    out2 = os.path.join(ASSETS_DIR, "flow_05_ticketing_vietqr_qr.png")
    out3 = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png")
    out4 = os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png")
    for o in [out1, out2, out3, out4]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 6 voi icon_payos.png & icon_postgres.png!")


# ==============================================================================
# 5. HÌNH 7: KIẾN TRÚC GIÁM SÁT HIỆU NĂNG GRAFANA & PROMETHEUS
# ==============================================================================
def gen_hinh_7_real_icons():
    fig, ax = plt.subplots(figsize=(15.0, 7.0), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.5, 6.5, 'SƠ ĐỒ KIẾN TRÚC GIÁM SÁT VIỄN TRẮC PROMETHEUS VÀ GRAFANA',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    draw_tech_icon(ax, 2.0, 3.5, 'icon_server.png', 'Máy chủ Ứng dụng', 'Node Exporter viễn trắc', target_px=65)
    draw_tech_icon(ax, 6.0, 3.5, 'icon_postgres.png', 'PostgreSQL DB', 'Số liệu vé & giao dịch', target_px=58)
    draw_tech_icon(ax, 10.0, 3.5, 'icon_grafana.png', 'Bảng điều khiển Grafana', 'Trực quan hóa chỉ số', target_px=58)
    draw_tech_icon(ax, 13.5, 3.5, 'icon_client.png', 'Quản trị viên', 'Theo dõi tải & Cảnh báo', target_px=56)

    draw_arrow_no_overlap(ax, 3.0, 3.5, 5.0, 3.5, label='Scrape Metrics', lx=4.0, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 7.0, 3.5, 9.0, 3.5, label='Truy vấn Read-Only', lx=8.0, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 11.0, 3.5, 12.6, 3.5, label='Báo cáo thời gian thực', lx=11.8, ly=3.85, shrinkA=16, shrinkB=16)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_2_14_grafana_architecture.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 7 voi icon_grafana.png & icon_postgres.png!")


# ==============================================================================
# 6. HÌNH 4.9: ĐA NGÔN NGỮ & AI TTS GOOGLE CLOUD
# ==============================================================================
def gen_hinh_4_9_real_icons():
    fig, ax = plt.subplots(figsize=(15.0, 7.0), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.5, 6.5, 'SƠ ĐỒ ĐIỀU PHỐI ĐA NGÔN NGỮ VÀ ĐỘNG CƠ GIỌNG ĐỌC AI TTS',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    draw_tech_icon(ax, 1.8, 3.5, 'icon_browser.png', 'Khách tham quan', 'Chọn 7 thứ tiếng', target_px=58)
    draw_tech_icon(ax, 5.5, 3.5, 'icon_redis.png', 'Bộ đệm băm MD5', 'Kiểm tra tệp tĩnh /audio_cache', target_px=56)
    draw_tech_icon(ax, 9.5, 3.5, 'icon_ai_brain.png', 'Động cơ AI Google TTS', 'Sinh giọng đọc Neural2 bản xứ', target_px=60)
    draw_tech_icon(ax, 13.5, 3.5, 'icon_server.png', 'Máy chủ Nginx', 'Stream HTTP 206 (< 50ms)', target_px=65)

    draw_arrow_no_overlap(ax, 2.7, 3.5, 4.5, 3.5, label='Key = MD5(text + lang)', lx=3.6, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 6.5, 3.5, 8.5, 3.5, label='Cache Miss (Gọi API)', lx=7.5, ly=3.85, shrinkA=16, shrinkB=16)
    draw_arrow_no_overlap(ax, 10.5, 3.5, 12.5, 3.5, label='Lưu Cache & Stream', lx=11.5, ly=3.85, shrinkA=16, shrinkB=16)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png")
    out2 = os.path.join(ASSETS_DIR, "flow_03_languages_voice_ai.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 4.9 voi icon_ai_brain.png & icon_redis.png!")


if __name__ == '__main__':
    print("=== BAT DAU TAO SO DO VOI REAL TECH ICONS ===")
    gen_hinh_1_real_icons()
    gen_hinh_2_real_icons()
    gen_hinh_5_real_icons()
    gen_hinh_6_real_icons()
    gen_hinh_7_real_icons()
    gen_hinh_4_9_real_icons()
    print("=== HOAN TAT TAO TOAN BO SO DO VOI TECH ICONS! ===")
