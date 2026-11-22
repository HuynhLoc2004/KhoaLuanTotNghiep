# -*- coding: utf-8 -*-
"""
render_flawless_system_diagrams.py
Tạo 100% sơ đồ học thuật chuẩn mực đồ án đại học IUH:
1. ĐẦY ĐỦ CÁC MÁY CHỦ TRONG CODEBASE:
   - Máy chủ Node.js Express API (Port 5000: Auth, REST, SSE, PayOS, CSDL).
   - Máy chủ Python AI & Computer Vision Worker (Port 8000: OpenCV Stitching 360, Trellis 3D, Marching Cubes).
2. KHÔNG ĐÈ CHỮ: Mọi bounding box được giới hạn an toàn (max_w <= 1.60, max_h <= 1.35).
   Tất cả nhãn chữ trên mũi tên đều được đặt ở vùng trống độc lập, có đệm trắng che vạch.
3. KHÔNG ÉP SERVER VÀO SƠ ĐỒ CHỨC NĂNG / THUẬT TOÁN:
   Các sơ đồ quy trình thuật toán (Hình 2.8, 4.3, 4.5, 4.7, 3.10) tập trung vào luồng xử lý dữ liệu.
4. SỬ DỤNG ĐÚNG ICON:
   - App Ngân hàng dùng icon điện thoại (icon_phone.png).
   - Python dùng icon Python chính thức (icon_python.png).
   - Nginx dùng icon Nginx lục giác (icon_nginx.png).
   - PostgreSQL dùng icon Slonik chuẩn mực (icon_postgres.png).
"""

import os
import numpy as np
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
C_LINE = '#1E293B'       # Slate 800


def get_icon_path(name):
    p1 = os.path.join(ICONS_DIR, name)
    if os.path.exists(p1): return p1
    p2 = os.path.join(DOCS_ICONS_DIR, name)
    if os.path.exists(p2): return p2
    return None


def get_icon_dimensions(icon_name, max_w=1.60, max_h=1.35):
    icon_path = get_icon_path(icon_name)
    if not icon_path or not os.path.exists(icon_path):
        return max_w, max_h
    img = mpimg.imread(icon_path)
    ih, iw = img.shape[:2]
    aspect = iw / ih
    display_w = max_h * aspect
    display_h = max_h
    if display_w > max_w:
        display_w = max_w
        display_h = display_w / aspect
    return display_w, display_h


def draw_clean_icon(ax, x, y, icon_name, title, subtitle='', max_w=1.60, max_h=1.35, y_title=None, y_sub=None):
    icon_path = get_icon_path(icon_name)
    disp_w, disp_h = get_icon_dimensions(icon_name, max_w, max_h)
    
    if icon_path and os.path.exists(icon_path):
        img = mpimg.imread(icon_path)
        ax.imshow(img, extent=[x - disp_w/2, x + disp_w/2, y - disp_h/2, y + disp_h/2],
                  zorder=15, aspect='auto')
    else:
        ax.plot(x, y, 'o', color=C_TEXT, markersize=14, zorder=15)
        
    t_y = y_title if y_title is not None else (y - disp_h / 2.0 - 0.28)
    s_y = y_sub if y_sub is not None else (t_y - 0.36)
    
    ax.text(x, t_y, title, ha='center', va='top', fontsize=9.8, fontweight='bold', color=C_TEXT, zorder=20)
    if subtitle:
        ax.text(x, s_y, subtitle, ha='center', va='top', fontsize=8.2, color=C_SUB, zorder=20)


def draw_clean_arrow(ax, x1, y1, x2, y2, label='', offset_y=0.45, offset_x=0.0, shrinkA=8, shrinkB=8, rad=0.0, is_dashed=False):
    conn = f'arc3,rad={rad}' if rad != 0.0 else 'arc3'
    line_style = '--' if is_dashed else '-'
    
    ax.annotate(
        '', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle='-|>',
            color=C_LINE,
            lw=1.5,
            linestyle=line_style,
            shrinkA=shrinkA,
            shrinkB=shrinkB,
            mutation_scale=14,
            connectionstyle=conn
        ),
        zorder=10
    )
    if label:
        mx = (x1 + x2) / 2.0 + offset_x
        my = (y1 + y2) / 2.0 + offset_y
        ax.text(
            mx, my, label, ha='center', va='center',
            fontsize=8.2, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
            zorder=25
        )


def save_fig(fig, filenames):
    for fn in filenames:
        p1 = os.path.join(DIAGRAMS_DIR, fn)
        p2 = os.path.join(ASSETS_DIR, fn)
        fig.savefig(p1, bbox_inches='tight', dpi=300)
        fig.savefig(p2, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print(f"-> Saved: {filenames}")


# ==============================================================================
# HÌNH 1.1: SƠ ĐỒ TỔNG QUAN KIẾN TRÚC & PHÂN HỆ HỆ THỐNG (ĐẦY ĐỦ NODE & PYTHON)
# ==============================================================================
def render_hinh_1_1():
    fig, ax = plt.subplots(figsize=(18.5, 11.2), dpi=300)
    ax.set_xlim(0, 18.5); ax.set_ylim(0, 11.2); ax.axis('off')

    ax.text(9.25, 10.7, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=13.0, fontweight='bold', color=C_TEXT)

    # 1. CỘT 1 (x=1.8): KHÁCH & QUẢN TRỊ VIÊN
    draw_clean_icon(ax, 1.8, 8.2, 'icon_client.png', 'Khách tham quan', 'Thiết bị Desktop / Mobile 360', max_w=1.4, max_h=1.35)
    draw_clean_icon(ax, 1.8, 3.2, 'icon_client.png', 'Quản trị viên (Admin)', 'Cổng quản trị CMS & Báo cáo', max_w=1.4, max_h=1.35)

    # 2. CỘT 2 (x=5.2): GIAO DIỆN CLIENT & CỔNG NGINX
    draw_clean_icon(ax, 5.2, 8.2, 'icon_browser.png', 'Trình duyệt Web', 'React 18 & Three.js (WebGL)', max_w=1.5, max_h=1.35)
    draw_clean_icon(ax, 5.2, 3.2, 'icon_nginx.png', 'Nginx Reverse Proxy', 'Điều phối SSL/TLS & Cân bằng tải', max_w=1.5, max_h=1.35)

    # 3. CỘT 3 (x=9.5): HAI MÁY CHỦ BACKEND (NODE.JS & PYTHON AI WORKER)
    draw_clean_icon(ax, 9.5, 8.2, 'icon_server.png', 'Máy chủ Node.js API', 'Express Gateway, REST, SSE & Auth', max_w=1.5, max_h=1.4)
    draw_clean_icon(ax, 9.5, 3.2, 'icon_python.png', 'Máy chủ Python AI Worker', 'FastAPI, OpenCV 360 & Trellis 3D', max_w=1.45, max_h=1.35)

    # 4. VÙNG PHỤ TRỢ (x=14.0 & 17.0): CSDL, HÀNG ĐỢI, THANH TOÁN & AI
    draw_clean_icon(ax, 14.0, 9.2, 'icon_redis.png', 'Bộ đệm Redis', 'In-Memory Cache (0ms)', max_w=1.35, max_h=1.25)
    draw_clean_icon(ax, 17.0, 9.2, 'icon_payos.png', 'Thanh toán PayOS', 'VietQR Napas 247', max_w=1.45, max_h=1.25)

    draw_clean_icon(ax, 14.0, 6.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng Vé & Tài Khoản (ACID)', max_w=1.45, max_h=1.35)
    draw_clean_icon(ax, 17.0, 6.2, 'icon_mongodb.png', 'CSDL MongoDB 7.0', '18 Phòng 360° & Cổ vật', max_w=1.35, max_h=1.25)

    draw_clean_icon(ax, 14.0, 3.2, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Xử lý tác vụ 3D & Stitching', max_w=1.35, max_h=1.25)
    draw_clean_icon(ax, 17.0, 3.2, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'ZeroGPU A100 AI (MSR)', max_w=1.45, max_h=1.35)

    # Giám sát Grafana ở góc dưới
    draw_clean_icon(ax, 9.5, 0.9, 'icon_grafana.png', 'Giám sát Grafana', 'Prometheus & Đo lường APM', max_w=1.35, max_h=1.2)

    # --- MŨI TÊN KẾT NỐI KHÔNG BAO GIỜ CHÉO NHAU ---
    # Cột 1 -> Cột 2
    draw_clean_arrow(ax, 2.7, 8.2, 4.3, 8.2, label='Tương tác Tour 360°', offset_y=0.45)
    draw_clean_arrow(ax, 2.7, 3.2, 4.3, 3.2, label='HTTPS Quản trị CMS', offset_y=0.45)

    # Cột 2 -> Cột 3
    draw_clean_arrow(ax, 6.1, 8.2, 8.6, 8.2, label='REST API / WSS SSE', offset_y=0.45)
    draw_clean_arrow(ax, 5.2, 4.2, 5.2, 7.2, label='Phân luồng SSL Port 443', offset_x=1.6, offset_y=0.0)
    draw_clean_arrow(ax, 6.1, 3.2, 8.6, 3.2, label='Proxy Ghép Ảnh / 3D', offset_y=0.45)

    # Giao tiếp giữa Node.js và Python Worker qua RabbitMQ
    draw_clean_arrow(ax, 9.5, 7.2, 9.5, 4.2, label='Giao việc qua RabbitMQ', offset_x=1.6, offset_y=0.0)

    # Node.js -> Cột 4 (Redis & PayOS)
    draw_clean_arrow(ax, 10.4, 8.8, 13.2, 9.2, label='Ghi / Đọc Cache', offset_y=0.40)
    draw_clean_arrow(ax, 14.8, 9.2, 16.1, 9.2, label='Tạo Link VietQR', offset_y=0.40)

    # Node.js -> CSDL (Postgres & Mongo)
    draw_clean_arrow(ax, 10.4, 7.6, 13.1, 6.5, label='SQL Query (pgPool)', offset_y=0.40)
    draw_clean_arrow(ax, 10.4, 6.8, 16.1, 6.3, label='Mongoose NoSQL', offset_y=0.40)

    # Python Worker -> RabbitMQ & Hugging Face
    draw_clean_arrow(ax, 10.4, 3.2, 13.2, 3.2, label='Lấy Job hàng đợi', offset_y=0.40)
    draw_clean_arrow(ax, 14.8, 3.2, 16.1, 3.2, label='ZeroGPU A100 API', offset_y=0.40)

    # Giám sát Grafana scrape Node.js & Python
    draw_clean_arrow(ax, 9.5, 2.2, 9.5, 1.7, label='Scrape /metrics', offset_x=1.3, offset_y=0.0)

    save_fig(fig, ['hinh_1_1_mindmap.png', 'hinh_1_1_so_do_tu_duy_tong_quan.png'])


# ==============================================================================
# HÌNH 2.1: HỆ TỌA ĐỘ CẦU VÀ ÁNH XẠ EQUIRECTANGULAR (KHÔNG DÙNG Ô VUÔNG MÀU MÈ)
# ==============================================================================
def render_hinh_2_1():
    fig, ax = plt.subplots(figsize=(11.5, 4.8), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 4.8); ax.axis('off')

    ax.text(5.75, 4.5, 'HỆ TỌA ĐỘ CẦU VÀ ÁNH XẠ TOÀN CẢNH EQUIRECTANGULAR 360°',
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=C_TEXT)

    cx, cy, R = 2.4, 2.2, 1.4
    circle = patches.Circle((cx, cy), R, facecolor='#F8FAFC', edgecolor=C_LINE, lw=1.5, zorder=2)
    ax.add_patch(circle)

    eq = patches.Arc((cx, cy), 2*R, 0.7, angle=0, theta1=0, theta2=360, color=C_LINE, lw=1.3, zorder=3)
    ax.add_patch(eq)
    lat_pos = patches.Arc((cx, cy + 0.6), 2*R*0.75, 0.4, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_pos)
    lat_neg = patches.Arc((cx, cy - 0.6), 2*R*0.75, 0.4, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_neg)

    mer0 = patches.Arc((cx, cy), 0.7, 2*R, angle=0, theta1=0, theta2=360, color=C_LINE, lw=1.2, zorder=3)
    ax.add_patch(mer0)

    ax.annotate('', xy=(cx, cy + R + 0.35), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx + 0.08, cy + R + 0.38, 'Z (Bắc)', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(cx + R + 0.35, cy), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx + R + 0.38, cy - 0.05, 'Y', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(cx - 0.8, cy - 0.75), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx - 0.95, cy - 0.85, 'X', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.plot(cx, cy, 'o', color=C_LINE, markersize=4, zorder=5)
    ax.text(cx - 0.30, cy + 0.12, 'O(0,0,0)', fontsize=7.5, color=C_TEXT, zorder=6)

    px, py = cx + 0.75, cy + 0.82
    ax.annotate('', xy=(px, py), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color='#0284C7', lw=1.6), zorder=5)
    ax.plot(px, py, 'o', color='#0284C7', markersize=6, zorder=6)
    ax.text(px + 0.1, py + 0.08, 'P(X, Y, Z)', fontsize=8.5, fontweight='bold', color='#0284C7')

    proj_x, proj_y = cx + 0.75, cy + 0.12
    ax.plot([px, proj_x], [py, proj_y], color='#94A3B8', ls='--', lw=0.9, zorder=4)
    ax.plot([cx, proj_x], [cy, proj_y], color='#94A3B8', ls='--', lw=0.9, zorder=4)

    ax.text(cx + 0.45, cy + 0.05, r'$\theta$', fontsize=9.0, fontweight='bold', color=C_TEXT, zorder=6)
    ax.text(cx + 0.32, cy + 0.45, r'$\phi$', fontsize=9.0, fontweight='bold', color=C_TEXT, zorder=6)

    ax.text(cx, cy - R - 0.35, 'Mặt cầu 3D không gian thực\nTọa độ góc ' + r'$(\theta, \phi)$',
            ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(6.5, 2.7), xytext=(4.6, 2.7),
                arrowprops=dict(arrowstyle='-|>', color=C_LINE, lw=1.4, mutation_scale=12), zorder=5)
    ax.text(5.55, 2.95, r'Chiếu thuận: $\theta = \arctan2(X, -Z), \phi = \arcsin(Y)$',
            ha='center', va='bottom', fontsize=7.6, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(4.6, 1.7), xytext=(6.5, 1.7),
                arrowprops=dict(arrowstyle='-|>', color=C_LINE, lw=1.4, mutation_scale=12), zorder=5)
    ax.text(5.55, 1.45, r'Chiếu nghịch: $X = -\cos\phi\sin\theta, Y = \sin\phi, Z = -\cos\phi\cos\theta$',
            ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_TEXT)

    rx, ry, rw, rh = 7.0, 1.3, 3.8, 1.9
    rect = patches.Rectangle((rx, ry), rw, rh, facecolor='#F8FAFC', edgecolor=C_LINE, lw=1.5, zorder=2)
    ax.add_patch(rect)

    for i in range(1, 4):
        gy = ry + i * (rh / 4)
        ax.plot([rx, rx + rw], [gy, gy], color='#E2E8F0', lw=0.7, ls=':', zorder=3)
    for j in range(1, 8):
        gx = rx + j * (rw / 8)
        ax.plot([gx, gx], [ry, ry + rh], color='#E2E8F0', lw=0.7, ls=':', zorder=3)
    ax.plot([rx, rx + rw], [ry + rh/2, ry + rh/2], color=C_LINE, lw=1.2, ls='--', zorder=3)
    ax.text(rx + rw + 0.10, ry + rh/2, r'$\phi = 0$', fontsize=7.5, va='center', color=C_TEXT)

    pix_x = rx + 0.65 * rw
    pix_y = ry + 0.72 * rh
    ax.plot(pix_x, pix_y, 'o', color='#0284C7', markersize=6, zorder=6)
    ax.text(pix_x + 0.1, pix_y + 0.08, 'p(x, y)', fontsize=8.5, fontweight='bold', color='#0284C7')
    ax.plot([rx, pix_x], [pix_y, pix_y], color='#94A3B8', ls=':', lw=0.7)
    ax.plot([pix_x, pix_x], [ry + rh, pix_y], color='#94A3B8', ls=':', lw=0.7)

    ax.text(rx, ry + rh + 0.08, '(0, 0)', fontsize=7.2, color=C_SUB)
    ax.text(rx + rw, ry + rh + 0.08, '(W, 0)', fontsize=7.2, ha='right', color=C_SUB)
    ax.text(rx + rw/2, ry + rh + 0.12, r'Cực Bắc ($\phi = +\pi/2$)', fontsize=7.5, ha='center', color=C_TEXT)
    ax.text(rx + rw/2, ry - 0.22, r'Cực Nam ($\phi = -\pi/2$)', fontsize=7.5, ha='center', color=C_TEXT)

    ax.text(rx + rw/2, ry - 0.45, r'Ảnh phẳng Equirectangular ($W \times H$, tỷ lệ 2:1)',
            ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_TEXT)

    save_fig(fig, ['hinh_2_1_he_toa_do_cau.png'])


# ==============================================================================
# HÌNH 2.2: HÌNH HỌC PHÉP CHIẾU MẶT TRỤ (KHÔNG ĐÈ CHỮ, KHÔNG HỘP MÀU MÈ)
# ==============================================================================
def render_hinh_2_2():
    fig, ax = plt.subplots(figsize=(12.0, 5.8), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.8); ax.axis('off')

    # Hai tiêu đề hai bên, cao ráo, thoáng đãng
    ax.text(3.0, 5.4, 'HÌNH HỌC PHÉP CHIẾU MẶT TRỤ (CYLINDRICAL PROJECTION)',
            fontsize=9.0, fontweight='bold', ha='center', color=C_TEXT)
    ax.text(8.8, 5.4, 'CÔNG THỨC TOÁN HỌC & HIỆU QUẢ TRIỆT TIÊU BIẾN DẠNG',
            fontsize=9.0, fontweight='bold', ha='center', color=C_TEXT)

    # 1. BÊN TRÁI: HÌNH HỌC PHÉP CHIẾU
    cam_x, cam_y = 0.9, 2.3
    f = 2.4

    ax.plot(cam_x, cam_y, 'o', color=C_LINE, markersize=6, zorder=6)
    ax.text(cam_x - 0.12, cam_y, 'C (Tâm quang học)', fontsize=8.0, fontweight='bold', ha='right', va='center', color=C_TEXT)

    # Trục quang học: vẽ 2 đoạn ngắt quãng để nhãn nằm lọt vào giữa, không bị vạch đè chữ
    ax.plot([cam_x, 1.4], [cam_y, cam_y], color='#64748B', ls='--', lw=1.0, zorder=2)
    ax.text(2.0, cam_y, f'Trục quang học (f = {f})', fontsize=7.2, color=C_SUB, ha='center', va='center',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'), zorder=20)
    ax.plot([2.6, cam_x + f + 1.0], [cam_y, cam_y], color='#64748B', ls='--', lw=1.0, zorder=2)

    # Mặt phẳng cảm biến (Ảnh phẳng gốc)
    sensor_x = cam_x + f # 3.3
    ax.plot([sensor_x, sensor_x], [cam_y - 1.4, cam_y + 1.4], color=C_LINE, lw=1.8, zorder=3)
    ax.text(sensor_x, 3.9, 'Mặt phẳng cảm biến (Ảnh phẳng)\n' + r'$x_p \in [-W/2, W/2]$',
            fontsize=7.8, fontweight='bold', ha='center', va='bottom', color=C_TEXT)

    # Mặt trụ bán kính f
    theta_arc = np.linspace(-np.pi/4.0, np.pi/4.0, 100)
    arc_x = cam_x + f * np.cos(theta_arc)
    arc_y = cam_y + f * np.sin(theta_arc)
    ax.plot(arc_x, arc_y, color='#1E40AF', lw=2.2, zorder=4)
    ax.text(3.5, 0.45, r'Mặt trụ bán kính $f$' + '\n' + r'$x_{cyl} = f \cdot \theta$',
            fontsize=7.8, fontweight='bold', ha='left', va='top', color='#1E40AF')

    # Điểm và tia nhìn 1 (trên)
    theta1 = 0.40
    p1_x = sensor_x
    p1_y = cam_y + f * np.tan(theta1)
    cyl1_x = cam_x + f * np.cos(theta1)
    cyl1_y = cam_y + f * np.sin(theta1)

    # Tia nhìn dừng chính xác tại p1_x, p1_y (KHÔNG KÉO DÀI ĐÈ LÊN CHỮ)
    ax.plot([cam_x, p1_x], [cam_y, p1_y], color='#1E3A8A', lw=1.2, zorder=3)

    ax.plot(p1_x, p1_y, 'o', color=C_LINE, markersize=5, zorder=6)
    ax.text(p1_x + 0.18, p1_y + 0.15, r'$p(x_p, y_p)$', fontsize=8.0, fontweight='bold', ha='left', va='bottom', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=25)

    ax.plot(cyl1_x, cyl1_y, 'o', color='#1E40AF', markersize=6, zorder=6)
    ax.text(cyl1_x - 0.18, cyl1_y + 0.15, r'$p_{cyl}(x_{cyl}, y_{cyl})$', fontsize=8.0, fontweight='bold', ha='right', va='bottom', color='#1E40AF',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=25)

    # Tia nhìn 2 (dưới) dừng chính xác tại p2_x, p2_y (KHÔNG CẮT QUA CHỮ TRỤC QUANG HỌC)
    theta2 = -0.36
    p2_x = sensor_x
    p2_y = cam_y + f * np.tan(theta2)
    cyl2_x = cam_x + f * np.cos(theta2)
    cyl2_y = cam_y + f * np.sin(theta2)
    ax.plot([cam_x, p2_x], [cam_y, p2_y], color='#1E3A8A', lw=1.2, zorder=3)

    ax.plot(p2_x, p2_y, 'o', color=C_LINE, markersize=5, zorder=6)
    ax.plot(cyl2_x, cyl2_y, 'o', color='#1E40AF', markersize=6, zorder=6)

    arc_ang = patches.Arc((cam_x, cam_y), 1.4, 1.4, angle=0, theta1=0, theta2=np.degrees(theta1), color=C_LINE, lw=1.1)
    ax.add_patch(arc_ang)
    ax.text(cam_x + 0.85, cam_y + 0.16, r'$\theta$', fontsize=8.5, fontweight='bold', color=C_TEXT)

    # Đường phân cách đứng mờ
    ax.plot([5.8, 5.8], [0.4, 5.4], color='#CBD5E1', ls=':', lw=1.0)

    # 2. BÊN PHẢI: CÔNG THỨC TOÁN HỌC & SO SÁNH TRỰC QUAN (KHÔNG DÙNG Ô VUÔNG MÀU MÈ)
    ax.text(8.8, 4.8, 'Hệ phép chiếu toán học (Công thức 2.5 - 2.8):',
            fontsize=8.2, fontweight='bold', ha='center', color=C_TEXT)
    ax.text(8.8, 4.25, r'$x_{cyl} = f \cdot \arctan(x_p / f) + W/2$', fontsize=9.0, ha='center', color='#0F172A')
    ax.text(8.8, 3.65, r'$y_{cyl} = f \cdot y_p / \sqrt{x_p^2 + f^2} + H/2$', fontsize=9.0, ha='center', color='#0F172A')
    ax.text(8.8, 3.15, '(Nội suy mức xám Bilinear 4 điểm lân cận để bảo toàn độ sắc nét)',
            fontsize=7.2, fontstyle='italic', ha='center', color=C_SUB)

    # 1. Ảnh phẳng gốc
    f1 = patches.Polygon([[6.4, 0.7], [8.0, 0.7], [8.2, 2.1], [6.2, 2.1]], facecolor='#FFFFFF', edgecolor='#475569', lw=1.2, zorder=4)
    ax.add_patch(f1)
    ax.text(7.2, 2.3, '1. Ảnh phẳng gốc (Chưa nắn)', fontsize=7.5, fontweight='bold', ha='center', color=C_TEXT)
    ax.plot([6.65, 6.45], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.plot([7.75, 7.95], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.text(7.2, 1.4, 'Biến dạng phối cảnh\n(Mép cột bị choãi)', ha='center', va='center', fontsize=7.0, color=C_SUB)

    # 2. Ảnh đã nắn mặt trụ
    curve_x = np.linspace(9.4, 11.2, 40)
    top_y = 2.1 - 0.10 * (1 - ((curve_x - 10.3)/0.9)**2)
    bot_y = 0.7 + 0.10 * (1 - ((curve_x - 10.3)/0.9)**2)
    verts = list(zip(curve_x, top_y)) + list(zip(curve_x[::-1], bot_y[::-1]))
    f2 = patches.Polygon(verts, facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.4, zorder=4)
    ax.add_patch(f2)
    ax.text(10.3, 2.3, '2. Ảnh đã nắn mặt trụ', fontsize=7.5, fontweight='bold', ha='center', color=C_TEXT)
    ax.plot([9.7, 9.7], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.plot([10.9, 10.9], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.text(10.3, 1.4, 'Cột bảo toàn 90° đứng\nSẵn sàng ghép mí', ha='center', va='center', fontsize=7.0, fontweight='bold', color=C_TEXT)

    save_fig(fig, ['hinh_2_2_cylindrical_warping.png'])


# ==============================================================================
# HÌNH 2.3: THÁP KHÔNG GIAN TỶ LỆ GAUSS VÀ SAI PHÂN DoG (CHUẨN HỌC THUẬT)
# ==============================================================================
def render_hinh_2_3():
    fig, ax = plt.subplots(figsize=(12.0, 5.2), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(6.0, 4.85, 'THÁP KHÔNG GIAN TỶ LỆ GAUSS VÀ PHÁT HIỆN ĐIỂM ĐẶC TRƯNG DoG (SIFT)',
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=C_TEXT)

    def draw_slant_rect(x, y, w, h, slant, label, color='#F8FAFC'):
        pts = [[x, y], [x + w, y], [x + w + slant, y + h], [x + slant, y + h]]
        poly = patches.Polygon(pts, facecolor=color, edgecolor='#334155', lw=1.2, zorder=3)
        ax.add_patch(poly)
        if label:
            ax.text(x + w/2 + slant/2, y + h/2, label, ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_TEXT, zorder=5)

    sigmas = ['σ', 'kσ', 'k²σ', 'k³σ']
    for i in range(4):
        draw_slant_rect(0.9, 0.8 + i*0.55, 2.2, 0.40, 0.5, f'L(x, y, {sigmas[i]})')
    ax.text(0.7, 1.8, 'Octave 1\n(W × H)', ha='right', va='center', fontsize=8.0, fontweight='bold', color=C_TEXT)

    for i in range(3):
        ax.annotate('', xy=(4.3, 1.25 + i*0.55), xytext=(3.7, 1.25 + i*0.55),
                    arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
        draw_slant_rect(4.4, 1.0 + i*0.55, 1.9, 0.38, 0.4, f'DoG {i+1}', color='#FEF3C7')
    ax.text(5.5, 0.5, r'Sai phân DoG: $D(x, y, \sigma) = L(x, y, k\sigma) - L(x, y, \sigma)$',
            ha='center', va='center', fontsize=7.8, fontstyle='italic', color=C_TEXT)

    ax.text(9.5, 4.3, 'Xét Cực Trị 26 Điểm Lân Cận (3×3×3)', ha='center', va='center', fontsize=8.5, fontweight='bold', color=C_TEXT)
    scales = [
        (r'Mức trên $\sigma_{i+1}$ (9 điểm)', 3.2),
        (r'Mức xét $\sigma_i$ (8 lân cận + X)', 2.0),
        (r'Mức dưới $\sigma_{i-1}$ (9 điểm)', 0.8)
    ]
    for lbl, sy in scales:
        draw_slant_rect(7.5, sy, 2.4, 0.65, 0.5, '', color='#F1F5F9')
        ax.text(10.7, sy + 0.32, lbl, ha='left', va='center', fontsize=7.5, color=C_TEXT)
        for r in range(3):
            for c in range(3):
                px = 7.8 + c * 0.7 + r * 0.22
                py = sy + 0.12 + r * 0.2
                if sy == 2.0 and r == 1 and c == 1:
                    ax.plot(px, py, 'x', color='#DC2626', markersize=8, mew=2.2, zorder=8)
                    ax.text(px + 0.15, py + 0.15, 'X (Cực trị)', fontsize=7.5, fontweight='bold', color='#DC2626', zorder=9)
                else:
                    ax.plot(px, py, 'o', color='#0284C7', markersize=4, zorder=6)

    save_fig(fig, ['hinh_2_3_dog_sift.png'])


# ==============================================================================
# HÌNH 2.4: KHỚP ĐẶC TRƯNG SIFT VÀ LOẠI BỎ ĐIỂM NGOẠI LAI BẰNG RANSAC (CHUẨN HỌC THUẬT)
# ==============================================================================
def render_hinh_2_4():
    fig, ax = plt.subplots(figsize=(13.0, 5.8), dpi=300)
    ax.set_xlim(0, 13.0); ax.set_ylim(0, 5.8); ax.axis('off')

    ax.text(6.5, 5.4, 'KHỚP ĐẶC TRƯNG SIFT VÀ LOẠI BỎ ĐIỂM NGOẠI LAI BẰNG THUẬT TOÁN RANSAC',
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=C_TEXT)

    w_img, h_img = 4.5, 3.2
    f1_x, f1_y = 0.8, 1.3
    f2_x, f2_y = 7.7, 1.3

    rect1 = patches.Rectangle((f1_x, f1_y), w_img, h_img, facecolor='#FAFAFA', edgecolor='#334155', lw=1.4, zorder=2)
    rect2 = patches.Rectangle((f2_x, f2_y), w_img, h_img, facecolor='#FAFAFA', edgecolor='#334155', lw=1.4, zorder=2)
    ax.add_patch(rect1)
    ax.add_patch(rect2)

    # Tiêu đề ảnh đặt trên cao, tách biệt khỏi các vạch nối
    ax.text(f1_x + w_img/2, 4.75, 'Ảnh góc nhìn trái $I_1(x, y)$', ha='center', va='center',
            fontsize=9.0, fontweight='bold', color=C_TEXT)
    ax.text(f2_x + w_img/2, 4.75, 'Ảnh góc nhìn phải $I_2(x\', y\')$', ha='center', va='center',
            fontsize=9.0, fontweight='bold', color=C_TEXT)

    # Ước lượng Homography ở trung tâm
    ax.text(6.5, 4.75, r'Ước lượng ma trận $\mathbf{H}$' + '\n' + r'$p_2 \sim \mathbf{H} \cdot p_1$',
            ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E40AF')

    # Điểm đặc trưng Inlier
    inliers = [
        ((f1_x + 1.2, 3.9), (f2_x + 1.6, 3.9)),
        ((f1_x + 2.8, 3.5), (f2_x + 3.2, 3.5)),
        ((f1_x + 1.6, 2.9), (f2_x + 2.0, 2.9)),
        ((f1_x + 3.4, 2.4), (f2_x + 3.8, 2.4)),
        ((f1_x + 2.0, 1.8), (f2_x + 2.4, 1.8)),
    ]

    for pt1, pt2 in inliers:
        ax.plot(pt1[0], pt1[1], 'o', color='#0F172A', markersize=5, zorder=6)
        ax.plot(pt2[0], pt2[1], 'o', color='#0F172A', markersize=5, zorder=6)
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='#166534', lw=1.6, zorder=4)

    # Điểm Outlier (gạch chéo đỏ, nằm hoàn toàn trong thân ảnh)
    out_pt1 = (f1_x + 3.8, 3.8)
    out_pt2 = (f2_x + 0.8, 1.9)
    ax.plot(out_pt1[0], out_pt1[1], 's', color='#DC2626', markersize=5, zorder=6)
    ax.plot(out_pt2[0], out_pt2[1], 's', color='#DC2626', markersize=5, zorder=6)
    ax.plot([out_pt1[0], out_pt2[0]], [out_pt1[1], out_pt2[1]], color='#DC2626', lw=1.4, ls='--', zorder=4)
    mx = (out_pt1[0] + out_pt2[0]) / 2.0
    my = (out_pt1[1] + out_pt2[1]) / 2.0
    ax.plot(mx, my, 'x', color='#DC2626', markersize=9, mew=2.5, zorder=7)

    # Chú thích ở dưới đáy
    ax.plot([1.5, 2.2], [0.75, 0.75], color='#166534', lw=2.0)
    ax.plot(1.85, 0.75, 'o', color='#0F172A', markersize=5)
    ax.text(2.4, 0.75, r'Cặp điểm Inlier chuẩn xác (Đạt ngưỡng RANSAC: $\|p_2 - \mathbf{H} p_1\| < 3.0$ pixel)',
            fontsize=8.0, fontweight='bold', color=C_TEXT, va='center')

    ax.plot([1.5, 2.2], [0.35, 0.35], color='#DC2626', lw=1.5, ls='--')
    ax.plot(1.85, 0.35, 'x', color='#DC2626', markersize=8, mew=2.0)
    ax.text(2.4, 0.35, 'Điểm ngoại lai Outlier bị RANSAC triệt tiêu (Sai lệch do phản quang tủ kính / đổi góc)',
            fontsize=8.0, fontweight='bold', color=C_TEXT, va='center')

    save_fig(fig, ['hinh_2_4_ransac.png'])


# ==============================================================================
# HÌNH 2.5: TỐI ƯU ĐƯỜNG GHÉP MÍ VÀ HÒA TRỘN ĐA DẢI TẦN LAPLACIAN
# ==============================================================================
def render_hinh_2_5():
    fig, ax = plt.subplots(figsize=(12.0, 5.4), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.4); ax.axis('off')

    ax.text(6.0, 5.0, 'TÌM ĐƯỜNG GHÉP MÍ TỐI ƯU VÀ HÒA TRỘN ĐA DẢI TẦN LAPLACIAN',
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=C_TEXT)

    # Ghép mí né tránh hiện vật
    r1 = patches.Rectangle((1.5, 2.6), 4.2, 1.8, facecolor='#F8FAFC', edgecolor='#334155', lw=1.2, zorder=2)
    r2 = patches.Rectangle((4.2, 2.6), 4.2, 1.8, facecolor='#F8FAFC', edgecolor='#334155', lw=1.2, zorder=2)
    ax.add_patch(r1); ax.add_patch(r2)

    ax.text(2.8, 4.15, 'Ảnh 1 (Bên trái)', ha='center', fontsize=8.0, fontweight='bold', color=C_TEXT)
    ax.text(7.1, 4.15, 'Ảnh 2 (Bên phải)', ha='center', fontsize=8.0, fontweight='bold', color=C_TEXT)
    ax.text(5.0, 4.15, 'Vùng chồng lấp 30%', ha='center', fontsize=7.5, color=C_SUB)

    ax.plot(4.8, 3.5, 'o', color='#0284C7', markersize=14, zorder=5)
    ax.text(4.8, 3.5, 'Cổ vật', ha='center', va='center', fontsize=6.8, fontweight='bold', color='white', zorder=6)

    ax.plot([4.8, 4.8], [2.6, 4.4], color='#DC2626', ls='--', lw=1.4, zorder=4)
    ax.text(4.8, 2.4, 'Đường cắt thẳng (Lỗi cắt đôi hiện vật)', ha='center', va='top', fontsize=7.2, color='#DC2626')

    sy = np.linspace(2.6, 4.4, 50)
    sx = 5.6 + 0.35 * np.sin((sy - 2.6) * np.pi / 1.8)
    ax.plot(sx, sy, color='#166534', lw=2.2, zorder=5)
    ax.text(6.1, 3.5, 'Đường ghép mí tối ưu\n(Graph Cut né tránh hiện vật)', ha='left', va='center', fontsize=7.5, fontweight='bold', color='#166534')

    ax.plot([1.0, 11.0], [2.0, 2.0], color='#CBD5E1', ls=':', lw=1.0)
    ax.text(6.0, 1.7, 'HÒA TRỘN ĐA DẢI TẦN SỐ LAPLACIAN PYRAMID BLENDING', ha='center', va='center', fontsize=8.8, fontweight='bold', color=C_TEXT)

    ax.text(1.5, 1.15, 'Dải tần số cao (Chi tiết nét):', fontsize=7.8, fontweight='bold', color=C_TEXT)
    ax.plot([4.2, 5.2], [1.15, 1.15], color='#1E3A8A', lw=1.5)
    ax.plot([5.2, 5.6], [1.15, 1.15], color='#166534', lw=2.4)
    ax.plot([5.6, 6.6], [1.15, 1.15], color='#1E3A8A', lw=1.5)
    ax.text(7.0, 1.15, 'Cửa sổ hòa trộn hẹp -> Bảo toàn chi tiết, triệt tiêu bóng ma (Ghosting)', fontsize=7.5, color=C_TEXT)

    ax.text(1.5, 0.65, 'Dải tần số thấp (Ánh sáng/Màu):', fontsize=7.8, fontweight='bold', color=C_TEXT)
    ax.plot([4.2, 4.7], [0.65, 0.65], color='#1E3A8A', lw=1.5)
    ax.plot([4.7, 6.1], [0.65, 0.65], color='#B45309', lw=2.6)
    ax.plot([6.1, 6.6], [0.65, 0.65], color='#1E3A8A', lw=1.5)
    ax.text(7.0, 0.65, 'Cửa sổ hòa trộn rộng -> Đồng nhất ánh sáng & màu sắc giữa 2 ảnh', fontsize=7.5, color=C_TEXT)

    save_fig(fig, ['hinh_2_5_seam_blending.png'])


# ==============================================================================
# HÌNH 2.7: SƠ ĐỒ NGUYÊN LÝ GIẢI THUẬT DIJKSTRA (DÙNG ICON CÔNG NGHỆ CHUẨN)
# ==============================================================================
def render_hinh_2_7():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ NGUYÊN LÝ GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG ĐI TỐI ƯU TRÊN ĐỒ THỊ 18 PHÒNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_database.png', '1. Đồ Thị 18 Gian Phòng', 'Ma trận kề trọng số G(V, E)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Hàng Đợi Ưu Tiên Min-Heap', 'Trích xuất đỉnh u có d[u] min', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_ai_chip.png', '3. Nới Lỏng Cạnh (Relaxation)', 'Cập nhật d[v] = d[u] + w(u,v)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Lộ Trình Tối Ưu Mini-map', 'Vẽ đường line liên phòng trên Tour', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. POST /api/floor-plan/navigate', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Extract-Min (O(log V))', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Đến đích & Xuất lộ trình', offset_y=0.45)

    draw_clean_arrow(ax, xs[2] - 1.15, 3.2, xs[1] + 1.15, 3.2, label='Lặp lại cho các đỉnh kề chưa xét', offset_y=-0.45, is_dashed=True)

    save_fig(fig, ['hinh_2_7_dijkstra.png', 'hinh_4_7_dijkstra_flow.png', 'flow_02_floorplan_dijkstra.png'])


# ==============================================================================
# HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN HÌNH CẦU 3D THREE.JS
# ==============================================================================
def render_hinh_2_6():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'NGUYÊN LÝ ÁNH XẠ TEXTURE TOÀN CẢNH LÊN HÌNH CẦU NGHỊCH ĐẢO VÀ TƯƠNG TÁC THREE.JS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 3.8, 'icon_360_grid.png', '1. Nguồn Ảnh Panorama 8K', 'Equirectangular (2:1 / WebP)', max_w=1.6, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[1], 3.8, 'icon_wireframe_3d.png', '2. Lưới Cầu Nghịch Đảo', 'MeshSphereGeometry (Lật mặt trong)', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[2], 3.8, 'icon_browser.png', '3. Điều Khiển & Raycaster', 'OrbitControls & Bắt tia Hotspot', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[3], 3.8, 'icon_client.png', '4. Trình Diễn Tương Tác', 'Khách xem xoay 360° & Pop-up', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)

    draw_clean_arrow(ax, xs[0] + 1.1, 3.8, xs[1] - 1.1, 3.8, label='1. TextureLoader nạp VRAM', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.1, 3.8, xs[2] - 1.1, 3.8, label='2. Ánh xạ mặt trong', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.1, 3.8, xs[3] - 1.1, 3.8, label='3. Raycasting va chạm tia nhìn', offset_y=0.45)

    save_fig(fig, ['hinh_2_6_texture_mapping.png'])


# ==============================================================================
# HÌNH 2.8: QUY TRÌNH TÁI TẠO MÔ HÌNH CỔ VẬT 3D (ĐÃ SỬA TRIỆT ĐỂ LỖI ĐÈ CHỮ)
# ==============================================================================
def render_hinh_2_8():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH TÁI TẠO CỔ VẬT 3D TỪ CHUỖI ẢNH TƯ LIỆU VỚI BÓC TÁCH PHÔNG NỀN',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 3.8, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', 'Đơn diện / Đối lập / Đa góc', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[1], 3.8, 'icon_rembg.png', '2. Bóc Tách Nền Tự Động', 'Rembg / U2-Net (Chuẩn hóa Alpha)', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[2], 3.8, 'icon_huggingface.png', '3. Sinh Khối Lưới 3D', 'Hugging Face TRELLIS (SLAT & DMC)', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)
    draw_clean_icon(ax, xs[3], 3.8, 'icon_wireframe_3d.png', '4. Xuất Mô Hình .GLB', 'PBR Texture & Nén Draco WebGL', max_w=1.4, max_h=1.35, y_title=2.3, y_sub=1.9)

    draw_clean_arrow(ax, xs[0] + 1.15, 3.8, xs[1] - 1.15, 3.8, label='1. Tải ảnh tư liệu gốc', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 3.8, xs[2] - 1.15, 3.8, label='2. Gửi ảnh Alpha Mask', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 3.8, xs[3] - 1.15, 3.8, label='3. Trích xuất lưới .GLB', offset_y=0.45)

    save_fig(fig, ['hinh_2_8_photogrammetry.png'])


# ==============================================================================
# HÌNH 2.9: KIẾN TRÚC PHÂN TẦNG HỆ THỐNG 3 TẦNG (BỔ SUNG PYTHON WORKER SERVICE)
# ==============================================================================
def render_hinh_2_9():
    fig, ax = plt.subplots(figsize=(17.5, 9.8), dpi=300)
    ax.set_xlim(0, 17.5); ax.set_ylim(0, 9.8); ax.axis('off')

    ax.text(8.75, 9.3, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    ax.text(2.6, 8.5, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.75, 8.5, 'TẦNG 2: SERVICES & WORKERS', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(14.8, 8.5, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.plot([5.5, 5.5], [0.6, 8.6], color='#CBD5E1', linestyle='--', lw=1.5)
    ax.plot([12.0, 12.0], [0.6, 8.6], color='#CBD5E1', linestyle='--', lw=1.5)

    # Tầng 1
    draw_clean_icon(ax, 2.6, 6.4, 'icon_browser.png', 'Trình duyệt Web (Client)', 'React 18 & WebGL Three.js', max_w=1.5, max_h=1.4, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 2.6, 2.2, 'icon_client.png', 'Quản trị viên (Admin CMS)', 'Quản trị vé, phòng & cổ vật', max_w=1.4, max_h=1.35, y_title=0.9, y_sub=0.5)

    # Tầng 2: Cụm Node.js API Gateway & Cụm Python AI Worker Service
    draw_clean_icon(ax, 8.75, 6.4, 'icon_server.png', 'Nginx & Node.js API Gateway', 'Reverse Proxy SSL & REST/SSE', max_w=1.5, max_h=1.4, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 8.75, 2.2, 'icon_python.png', 'Python AI & CV Worker', 'FastAPI, Stitching 360 & Trellis', max_w=1.45, max_h=1.35, y_title=0.9, y_sub=0.5)

    # Tầng 3
    draw_clean_icon(ax, 14.8, 6.4, 'icon_postgres.png', 'PostgreSQL 16 & Mongo', 'Vé tham quan, Phòng 360° & Cổ vật', max_w=1.5, max_h=1.4, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 14.8, 2.2, 'icon_payos.png', 'PayOS & Hugging Face', 'VietQR Napas 247 & ZeroGPU', max_w=1.5, max_h=1.35, y_title=0.9, y_sub=0.5)

    draw_clean_arrow(ax, 3.8, 6.4, 7.4, 6.4, label='HTTPS / WSS (Port 443)', offset_y=0.42)
    draw_clean_arrow(ax, 3.8, 2.2, 7.4, 2.2, label='RESTful API (JSON)', offset_y=0.42)

    draw_clean_arrow(ax, 8.75, 5.2, 8.75, 3.4, label='Giao việc qua RabbitMQ', offset_x=1.7, offset_y=0.0)

    draw_clean_arrow(ax, 10.1, 6.4, 13.4, 6.4, label='SQL (pgPool) & Mongoose', offset_y=0.42)
    draw_clean_arrow(ax, 10.1, 2.2, 13.4, 2.2, label='Webhook & ZeroGPU API', offset_y=0.42)

    save_fig(fig, ['hinh_2_9_architecture_3tier.png'])


# ==============================================================================
# HÌNH 2.10: XÁC THỰC NGƯỜI DÙNG BẰNG JWT & HTTPONLY COOKIE
# ==============================================================================
def render_hinh_2_10():
    fig, ax = plt.subplots(figsize=(16.8, 8.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 8.8); ax.axis('off')

    ax.text(8.4, 8.2, 'SƠ ĐỒ TUẦN TỰ: XÁC THỰC VÀ PHÂN QUYỀN BẰNG JSON WEB TOKEN (JWT) & HTTPONLY COOKIE',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.5, 7.0, 'icon_browser.png', 'Trình duyệt Client', 'User / Admin', max_w=1.4, max_h=1.35, y_title=5.8, y_sub=5.5)
    draw_clean_icon(ax, 8.4, 7.0, 'icon_server.png', 'API Gateway / Auth', 'Node.js Express', max_w=1.4, max_h=1.4, y_title=5.8, y_sub=5.5)
    draw_clean_icon(ax, 14.2, 7.0, 'icon_postgres.png', 'Cơ sở Dữ liệu', 'PostgreSQL 16', max_w=1.4, max_h=1.35, y_title=5.8, y_sub=5.5)

    for lx in [2.5, 8.4, 14.2]:
        ax.plot([lx, lx], [0.8, 5.3], color='#94A3B8', linestyle=':', lw=1.5, zorder=5)

    y_steps = [4.8, 4.0, 3.2, 2.4, 1.6, 0.9]

    draw_clean_arrow(ax, 2.5, y_steps[0], 8.4, y_steps[0], label='1. POST /api/auth/login-credentials (email, password)', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 8.4, y_steps[1], 14.2, y_steps[1], label='2. SELECT * FROM users WHERE email = ?', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 14.2, y_steps[2], 8.4, y_steps[2], label='3. Trả về bản ghi user & mật khẩu băm Bcrypt', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)
    draw_clean_arrow(ax, 8.4, y_steps[3], 2.5, y_steps[3], label='4. Trả về JWT Access Token (24h) kèm HttpOnly Cookie', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)
    draw_clean_arrow(ax, 2.5, y_steps[4], 8.4, y_steps[4], label='5. GET /api/rooms (Header: Authorization Bearer & Cookie)', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 8.4, y_steps[5], 2.5, y_steps[5], label='6. Phản hồi cấu trúc 18 phòng 360° & cổ vật (HTTP 200 OK)', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)

    save_fig(fig, ['hinh_2_10_jwt_auth.png'])


# ==============================================================================
# HÌNH 2.11: QUY TRÌNH THANH TOÁN VIETQR PAYOS (DÙNG ICON ĐIỆN THOẠI & POSTGRESQL CHUẨN)
# ==============================================================================
def render_hinh_payos_flow():
    fig, ax = plt.subplots(figsize=(17.5, 9.0), dpi=300)
    ax.set_xlim(0, 17.5); ax.set_ylim(0, 9.0); ax.axis('off')

    ax.text(8.75, 8.4, 'QUY TRÌNH SINH MÃ VÀ XÁC THỰC THANH TOÁN VIETQR QUA CỔNG PAYOS',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.5, 11.0, 15.2]
    y_main = 5.5

    # 4 Nút chính: 1. Khách -> 2. Node.js -> 3. PayOS -> 4. App Ngân hàng (DÙNG ICON ĐIỆN THOẠI THỰC TẾ)
    draw_clean_icon(ax, xs[0], y_main, 'icon_client.png', '1. Khách Mua Vé', 'Giao diện Booking Web', max_w=1.4, max_h=1.35, y_title=4.3, y_sub=3.9)
    draw_clean_icon(ax, xs[1], y_main, 'icon_server.png', '2. Máy Chủ Backend', 'Node.js Express & Tạo Đơn', max_w=1.4, max_h=1.4, y_title=4.3, y_sub=3.9)
    draw_clean_icon(ax, xs[2], y_main, 'icon_payos.png', '3. Cổng PayOS', 'VietQR Napas 247 Động', max_w=1.5, max_h=1.35, y_title=4.3, y_sub=3.9)
    draw_clean_icon(ax, xs[3], y_main, 'icon_phone.png', '4. App Ngân Hàng', 'Quét QR & Chuyển khoản', max_w=1.2, max_h=1.4, y_title=4.3, y_sub=3.9)

    # Nút CSDL PostgreSQL 16 ở dưới Node.js
    draw_clean_icon(ax, xs[1], 1.5, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng Tickets & Transactions (PAID)', max_w=1.45, max_h=1.35, y_title=0.4, y_sub=None)

    # --- LUỒNG ĐI PHÍA TRÊN (y=6.3) ---
    draw_clean_arrow(ax, xs[0] + 1.15, 6.3, xs[1] - 1.15, 6.3, label='1. Đặt mua: POST /api/tickets/checkout', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 6.3, xs[2] - 1.15, 6.3, label='2. PayOS API createPaymentLink', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 6.3, xs[3] - 1.15, 6.3, label='3. Hiển thị mã VietQR động', offset_y=0.45)

    # --- LUỒNG VỀ PHÍA DƯỚI (y=4.7) ---
    draw_clean_arrow(ax, xs[3] - 1.15, 4.7, xs[2] + 1.15, 4.7, label='4. Chuyển khoản thành công', offset_y=-0.45)
    draw_clean_arrow(ax, xs[2] - 1.15, 4.7, xs[1] + 1.15, 4.7, label='5. Webhook: POST /webhook/payos', offset_y=-0.45, is_dashed=True)
    draw_clean_arrow(ax, xs[1] - 1.15, 4.7, xs[0] + 1.15, 4.7, label='7. SSE đẩy vé: broadcastRealtimeEvent', offset_y=-0.45, is_dashed=True)

    # --- MŨI TÊN XUỐNG CSDL: NHÃN ĐẶT Ở VÙNG TRỐNG BÊN PHẢI (x=8.9), KHÔNG BAO GIỜ ĐÈ VẠCH ---
    draw_clean_arrow(ax, xs[1], 3.5, xs[1], 2.2, label='', shrinkA=4, shrinkB=4)
    ax.text(xs[1] + 2.2, 2.85, '6. Cập nhật vé PAID & ký số', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
            zorder=25)

    save_fig(fig, ['hinh_2_11_payos_flow.png', 'hinh_3_6_activity_booking_ticket_lifecycle.png', 'hinh_3_6_sequence_payment_payos.png', 'hinh_4_8_payment_ticket_flow.png', 'flow_05_ticketing_vietqr_qr.png'])


# ==============================================================================
# HÌNH 2.12: SOÁT VÉ ĐIỆN TỬ QR THỜI GIAN THỰC
# ==============================================================================
def render_hinh_qr_validation():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH QUÉT VÀ XÁC THỰC MÃ VÉ QR THỜI GIAN THỰC TẠI CỔNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_phone.png', '1. Vé trên Mobile', 'Mã QR mã hóa AES-256', max_w=1.2, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_client.png', '2. Camera Soát Vé', 'Html5Qrcode Scanner (Staff)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Máy Chủ Backend', 'Kiểm tra mã vé & Cập nhật used', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_postgres.png', '4. CSDL PostgreSQL', 'Bảng museum_tickets (USED)', max_w=1.45, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Quét mã QR (< 150ms)', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. POST /api/admin/tickets/verify-qr', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Ghi nhận check-in (Đổi USED)', offset_y=0.45)

    save_fig(fig, ['hinh_2_12_qr_validation.png', 'hinh_3_7_activity_ticket_validation.png', 'hinh_3_7_sequence_qr_scan.png'])


# ==============================================================================
# HÌNH 2.13: KIẾN TRÚC DOCKER COMPOSE & NGINX (BỔ SUNG PYTHON WORKER CONTAINER)
# ==============================================================================
def render_hinh_2_13():
    fig, ax = plt.subplots(figsize=(17.5, 9.2), dpi=300)
    ax.set_xlim(0, 17.5); ax.set_ylim(0, 9.2); ax.axis('off')

    ax.text(8.75, 8.6, 'SƠ ĐỒ ĐIỀU PHỐI VÀ ĐÓNG GÓI HỆ THỐNG VỚI DOCKER COMPOSE TRÊN VPS UBUNTU',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # Cột 1: Nginx
    draw_clean_icon(ax, 2.2, 4.5, 'icon_nginx.png', 'Nginx Reverse Proxy', 'Port 80/443 (SSL/TLS Termination)', max_w=1.5, max_h=1.4, y_title=2.8, y_sub=2.4)

    # Cột 2: Node.js Container & Python Worker Container
    draw_clean_icon(ax, 6.8, 6.4, 'icon_server.png', 'Node.js API Container', 'Port 5000 (Express & TypeScript)', max_w=1.45, max_h=1.35, y_title=5.1, y_sub=4.7)
    draw_clean_icon(ax, 6.8, 2.6, 'icon_python.png', 'Python Worker Container', 'Port 8000 (OpenCV & Marching Cubes)', max_w=1.45, max_h=1.35, y_title=1.3, y_sub=0.9)

    # Cột 3: In-Memory & Message Queue
    draw_clean_icon(ax, 11.5, 6.4, 'icon_redis.png', 'Redis Container', 'Port 6379 (In-Memory Cache)', max_w=1.4, max_h=1.3, y_title=5.1, y_sub=4.7)
    draw_clean_icon(ax, 11.5, 2.6, 'icon_rabbitmq.png', 'RabbitMQ Container', 'Port 5672 (Message Broker)', max_w=1.4, max_h=1.3, y_title=1.3, y_sub=0.9)

    # Cột 4: Relational & NoSQL
    draw_clean_icon(ax, 15.6, 6.4, 'icon_postgres.png', 'PostgreSQL 16', 'Port 5432 (Relational Data)', max_w=1.45, max_h=1.35, y_title=5.1, y_sub=4.7)
    draw_clean_icon(ax, 15.6, 2.6, 'icon_mongodb.png', 'MongoDB NoSQL', 'Port 27017 (360 Rooms & Items)', max_w=1.4, max_h=1.3, y_title=1.3, y_sub=0.9)

    # Nginx -> Node.js & Python
    draw_clean_arrow(ax, 3.4, 5.0, 5.6, 6.2, label='Proxy Pass :5000', offset_y=0.40)
    draw_clean_arrow(ax, 3.4, 4.0, 5.6, 2.8, label='Proxy Pass :8000', offset_y=-0.40)

    # Node.js & Python -> Cột 3 (Redis & RabbitMQ)
    draw_clean_arrow(ax, 8.0, 6.4, 10.3, 6.4, label='TCP Ghi/Đọc Cache', offset_y=0.40)
    draw_clean_arrow(ax, 8.0, 2.6, 10.3, 2.6, label='AMQP Nhận Tác Vụ', offset_y=-0.40)

    # Node.js -> Cột 4 (Postgres & Mongo)
    draw_clean_arrow(ax, 12.6, 6.4, 14.3, 6.4, label='pgPool Query', offset_y=0.40)
    draw_clean_arrow(ax, 12.6, 2.6, 14.3, 2.6, label='Mongoose Query', offset_y=-0.40)

    save_fig(fig, ['hinh_2_13_docker_compose.png'])


# ==============================================================================
# HÌNH 2.14: HỆ THỐNG GIÁM SÁT GRAFANA & PROMETHEUS
# ==============================================================================
def render_hinh_grafana():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT VỚI PROMETHEUS VÀ GRAFANA V11',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_server.png', '1. Máy Chủ Backend & Nginx', 'Cung cấp Endpoint /metrics', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Prometheus Server', 'Scrape chu kỳ 15s (TSDB)', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_grafana.png', '3. Grafana Dashboard', 'Truy vấn PromQL & Trực quan', max_w=1.5, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_client.png', '4. Quản trị viên (CMS)', 'Chế độ Kiosk nhúng IFrame', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Scrape định kỳ /metrics', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. PromQL Query Engine', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Nhúng biểu đồ APM Kiosk', offset_y=0.45)

    save_fig(fig, ['hinh_2_14_grafana_architecture.png', 'hinh_3_9_grafana_sequence.png'])


# ==============================================================================
# HÌNH 3.8: TƯƠNG TÁC TOUR 360° VÀ CHUYỂN PHÒNG QUA HOTSPOT
# ==============================================================================
def render_hinh_3_8():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ HOẠT ĐỘNG: TƯƠNG TÁC KHÔNG GIAN 360° VÀ CHUYỂN PHÒNG QUA ĐIỂM NỐI HOTSPOT',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Nhấp chọn Hotspot trên màn hình', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_browser.png', '2. Trình Duyệt WebGL', 'Raycaster tính toán va chạm 3D', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_database.png', '3. Siêu Dữ Liệu Phòng', 'Liên kết 18 gian phòng & tọa độ', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_360_grid.png', '4. Chuyển Cảnh 360°', 'Nạp ảnh phòng mới & Xoay góc nhìn', max_w=1.6, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Nhấp chuột / Chạm cảm ứng', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Bắt giao điểm tia nhìn Hotspot', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Chuyển cảnh phòng kế tiếp', offset_y=0.45)

    save_fig(fig, ['hinh_3_8_sequence_tour_hotspot.png'])


# ==============================================================================
# HÌNH 3.10: DỊCH THUẬT VÀ BẢN ĐỊA HÓA ĐA NGÔN NGỮ
# ==============================================================================
def render_hinh_3_10():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION WORKFLOW)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Chọn Ngôn Ngữ', '7 Ngôn ngữ (Vi, En, Fr, Zh, Ja...)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Backend Localization', 'GET /api/languages/bundle/:code', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_ai_brain.png', '3. Động Cơ Google NMT', 'Dịch tự động + Heritage Glossary', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Trình Diễn Đa Ngữ', 'Nạp React Context & Cập nhật UI', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Chuyển mã ISO ngôn ngữ', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Dịch bù: POST /translate-draft', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Trả về từ điển JSON bản địa hóa', offset_y=0.45)

    save_fig(fig, ['hinh_3_10_translation_flow.png'])


# ==============================================================================
# HÌNH 3.11: SINH VÀ LƯU TRỮ ĐỆM BĂM GIỌNG ĐỌC VOICE AI TTS
# ==============================================================================
def render_hinh_voice_tts():
    fig, ax = plt.subplots(figsize=(16.8, 7.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.4, 7.2, 'QUY TRÌNH SINH VÀ LƯU TRỮ ĐỆM BĂM (HASH CACHING) GIỌNG ĐỌC THUYẾT MINH AI',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 1.8, 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Bật biểu tượng loa trên Tour', max_w=1.4, max_h=1.35, y_title=2.5, y_sub=2.1)
    draw_clean_icon(ax, 4.8, 4.0, 'icon_server.png', '2. Voice Service', 'POST /generate-tts (Chunk <= 140 ký tự)', max_w=1.4, max_h=1.4, y_title=2.5, y_sub=2.1)

    draw_clean_icon(ax, 10.2, 5.7, 'icon_redis.png', '3a. Bộ Đệm Redis & Disk', 'Tệp .MP3 tĩnh trong /public/uploads/ (0ms)', max_w=1.4, max_h=1.3, y_title=4.4, y_sub=4.0)
    draw_clean_icon(ax, 10.2, 2.3, 'icon_ai_brain.png', '3b. Google Cloud TTS', 'Sinh giọng đọc Neural2 tự nhiên', max_w=1.4, max_h=1.3, y_title=1.0, y_sub=0.6)

    draw_clean_icon(ax, 15.0, 4.0, 'icon_browser.png', '4. Trình Duyệt Web', 'Stream Audio Partial Content 206', max_w=1.4, max_h=1.35, y_title=2.5, y_sub=2.1)

    draw_clean_arrow(ax, 2.7, 4.0, 3.8, 4.0, label='1. Yêu cầu kịch bản thuyết minh', offset_y=0.40)
    draw_clean_arrow(ax, 5.8, 4.6, 9.0, 5.5, label='2a. Cache Hit (Băm MD5 có sẵn)', offset_y=0.40)
    draw_clean_arrow(ax, 5.8, 3.4, 9.0, 2.5, label='2b. Cache Miss -> Gọi Speech TTS', offset_y=-0.40)

    draw_clean_arrow(ax, 11.4, 5.5, 14.0, 4.3, label='3a. Stream tệp tĩnh .mp3', offset_y=0.40)
    draw_clean_arrow(ax, 11.4, 2.5, 14.0, 3.7, label='3b. Lưu file đệm & Stream phát', offset_y=-0.40)

    save_fig(fig, ['hinh_3_11_voice_tts_storage_pipeline.png', 'flow_03_languages_voice_ai.png'])


# ==============================================================================
# HÌNH 3.12: KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# ==============================================================================
def render_hinh_3_12():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH (MULTI-SHEET EXCEL)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Quản Trị Viên (Admin)', 'Nhấn nút "Xuất báo cáo Excel"', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'Truy vấn GET /api/analytics', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_browser.png', '3. Động Cơ xlsx-js-style', 'Tạo 4 Sheet (KPI, Vé, Phòng, Cổ vật)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_client.png', '4. Tải Tệp .XLSX', 'Lưu file báo cáo đa ngữ trực tiếp', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Yêu cầu số liệu thống kê', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Trả JSON dữ liệu vận hành', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Xuất file Excel định dạng chuẩn', offset_y=0.45)

    save_fig(fig, ['hinh_3_12_excel_export_flow.png', 'hinh_3_12_excel_export_activity.png'])


# ==============================================================================
# HÌNH 3.13: QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT KHÁM PHÁ PHYGITAL
# ==============================================================================
def render_hinh_3_13():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Quét mã QR dán tại tủ kính', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_phone.png', '2. Camera Scanner (jsQR)', 'Điều hướng URL định danh hiện vật', max_w=1.2, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Máy Chủ & CSDL', 'GET /api/artifacts/:id (Data, Audio, 3D)', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_wireframe_3d.png', '4. Hiển Thị 3D WebGL', 'Three.js xoay 360° & Audio Guide', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Quét QR hiện vật thực địa', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Mở /artifacts/:id trên Web', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Trả về mô hình 3D .GLB', offset_y=0.45)

    save_fig(fig, ['hinh_3_13_qr_exhibition_activity.png'])


# ==============================================================================
# HÌNH 4.1: QUY TRÌNH TỰ ĐỘNG HÓA CI/CD QUA GITHUB ACTIONS
# ==============================================================================
def render_hinh_4_1():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ ĐƯỜNG ỐNG TỰ ĐỘNG HÓA KIỂM THỬ VÀ TRIỂN KHAI LIÊN TỤC (CI/CD) GITHUB ACTIONS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Lập Trình Viên', 'Git Push nhánh main/feature', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. GitHub Runner', 'Lint, Jest & Unit Test CI', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Docker Build & Tag', 'Đóng gói Container Images', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_server.png', '4. VPS Production', 'SSH Deploy & Zero-Downtime', max_w=1.4, max_h=1.4, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Git Commit & Push', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Tự động kiểm thử pass', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Docker Compose restart', offset_y=0.45)

    save_fig(fig, ['hinh_4_1_cicd_pipeline.png', 'flow_01_stitching_process.png'])


# ==============================================================================
# HÌNH 4.3: XỬ LÝ TOÀN CẢNH 360° (THUẬT TOÁN THỊ GIÁC MÁY TÍNH THUẦN TÚY)
# ==============================================================================
def render_hinh_4_3():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH XỬ LÝ VÀ CHUẨN HÓA ẢNH TOÀN CẢNH 360° TỪ 4 PHƯƠNG THỨC NẠP DỮ LIỆU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', '4 Nguồn (Video sweep, Chụp liên tiếp...)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_wireframe_3d.png', '2. Nắn Mặt Trụ', 'Cylindrical Warping (Bảo toàn cột đứng)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_feature_match.png', '3. Khớp SIFT & RANSAC', 'Trích xuất đặc trưng 128D & Lọc nhiễu', max_w=1.55, max_h=1.1, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_360_grid.png', '4. Xuất Ảnh 360° 8K', 'Equirectangular WebP 60 FPS', max_w=1.6, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. Trích xuất khung hình', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Triệt tiêu biến dạng trụ', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Hòa trộn đa dải Laplacian', offset_y=0.45)

    save_fig(fig, ['hinh_4_3_panorama_4inputs.png'])


# ==============================================================================
# HÌNH 4.5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (GỌN GÀNG, THOÁNG ĐÃNG, KHÔNG ĐÈ CHỮ)
# ==============================================================================
def render_hinh_4_5():
    fig, ax = plt.subplots(figsize=(17.5, 9.2), dpi=300)
    ax.set_xlim(0, 17.5); ax.set_ylim(0, 9.2); ax.axis('off')

    ax.text(8.75, 8.6, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI ĐỘNG CƠ AI',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)
    ax.text(8.75, 8.1, 'Bóc tách nền Rembg / Alpha Mask — Hàng đợi Queue phân luồng — Ưu tiên Hugging Face (TRELLIS) và Dự phòng Local CPU',
            ha='center', va='center', fontsize=9.0, fontstyle='italic', color=C_SUB)

    # 4 Cột: 2.2 -> 6.5 -> 11.2 -> 15.5
    draw_clean_icon(ax, 2.2, 4.6, 'icon_client.png', '1. Quản Trị Viên', 'POST /api/artifacts/:id/generate-3d', max_w=1.4, max_h=1.35, y_title=3.0, y_sub=2.6)
    draw_clean_icon(ax, 6.5, 4.6, 'icon_rabbitmq.png', '2. Hàng Đợi 3D Queue', 'RabbitMQ & Redis phân luồng', max_w=1.4, max_h=1.35, y_title=3.0, y_sub=2.6)

    draw_clean_icon(ax, 11.2, 6.6, 'icon_huggingface.png', '3a. Hugging Face (TRELLIS)', 'ZeroGPU A100 (SLAT & DMC)', max_w=1.4, max_h=1.35, y_title=5.2, y_sub=4.8)
    draw_clean_icon(ax, 11.2, 2.2, 'icon_server.png', '3b. Máy Chủ Local CPU (Dự phòng)', 'Marching Cubes v15.0 (Offline)', max_w=1.4, max_h=1.35, y_title=0.8, y_sub=0.4)

    draw_clean_icon(ax, 15.5, 4.6, 'icon_wireframe_3d.png', '4. Mô Hình 3D (.GLB)', 'Three.js WebGL xoay 360°', max_w=1.4, max_h=1.35, y_title=3.0, y_sub=2.6)

    # 1 -> 2
    draw_clean_arrow(ax, 3.35, 4.6, 5.35, 4.6, label='1. Nạp ảnh & Bóc nền Rembg', offset_y=0.45)

    # 2 -> 3a & 3b
    draw_clean_arrow(ax, 7.65, 5.2, 9.95, 6.4, label='2a. [Ưu tiên] ZeroGPU A100', offset_y=0.45)
    draw_clean_arrow(ax, 7.65, 4.0, 9.95, 2.5, label='2b. [Tùy chọn] Local CPU', offset_y=-0.45)

    # 3a & 3b -> 4
    draw_clean_arrow(ax, 12.35, 6.4, 14.35, 5.2, label='3a. Xuất .GLB chuẩn PBR', offset_y=0.45)
    draw_clean_arrow(ax, 12.35, 2.5, 14.35, 4.0, label='3b. Xuất .GLB xoay trục', offset_y=-0.45)

    # Fallback từ 3a xuống 3b (nhãn đặt bên trái vạch đứng để không bao giờ đè lên 3a -> 4)
    draw_clean_arrow(ax, 11.2, 5.6, 11.2, 3.2, label='', shrinkA=4, shrinkB=4, is_dashed=True)
    ax.text(11.2, 4.4, 'Tự động fallback khi Quota 429', ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
            zorder=25)

    save_fig(fig, ['hinh_4_5_artifact_2engines.png', 'flow_04_dual_engine_3d.png'])


# ==============================================================================
# HÌNH 4.7: GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG ĐI NGẮN NHẤT 18 PHÒNG (THUẬT TOÁN ĐỒ THỊ)
# ==============================================================================
def render_hinh_4_7():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ KHỐI: GIẢI THUẬT DIJKSTRA TÌM LỘ TRÌNH DI CHUYỂN TỐI ƯU GIỮA 18 PHÒNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.0, 6.2, 10.4, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Chọn phòng xuất phát & phòng đích', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_database.png', '2. Đồ Thị 18 Gian Phòng', 'Ma trận khoảng cách Euclide', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_ai_chip.png', '3. Giải Thuật Dijkstra', 'Tìm đường Min-Heap (< 5ms)', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Mini-map Định Tuyến', 'Vẽ đường line dẫn đường trực quan', max_w=1.4, max_h=1.35, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.15, 4.0, xs[1] - 1.15, 4.0, label='1. POST /api/floor-plan/navigate', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.15, 4.0, xs[2] - 1.15, 4.0, label='2. Nạp ma trận & Min-Heap', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.15, 4.0, xs[3] - 1.15, 4.0, label='3. Xuất mảng pathNodeIds & Bước rẽ', offset_y=0.45)

    save_fig(fig, ['hinh_4_7_dijkstra_flow.png', 'flow_02_floorplan_dijkstra.png'])


def render_all_flawless():
    print("=== BẮT ĐẦU RENDER TOÀN BỘ SƠ ĐỒ CHUẨN MỰC HỌC THUẬT ===")
    render_hinh_1_1()
    render_hinh_2_1()
    render_hinh_2_2()
    render_hinh_2_3()
    render_hinh_2_4()
    render_hinh_2_5()
    render_hinh_2_6()
    render_hinh_2_7()
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
    print("=== HOÀN TẤT RENDER 100% SƠ ĐỒ KHÔNG LỖI, KHÔNG ĐÈ CHỮ, KHÔNG HỘP MÀU MÈ! ===")


if __name__ == '__main__':
    render_all_flawless()
