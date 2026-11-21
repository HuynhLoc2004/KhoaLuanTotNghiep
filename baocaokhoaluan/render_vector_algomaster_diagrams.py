# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỆ THỐNG PHONG CÁCH ALGOMASTER / SYSTEM DESIGN
Chuẩn phong cách blog.algomaster.io (Reference Image 2):
- Thiết kế 2D Flat Vector tối giản, nét viền đen đậm sắc nét (#1E293B, lw=1.8 - 2.0).
- Nền trắng tinh khiết, thoáng đãng, các khối phân bổ rộng rãi.
- TUYỆT ĐỐI KHÔNG CÓ CÁC ĐOẠN VĂN BẢN DÀI HAY BULLET POINTS.
- Dưới mỗi hình vẽ CHỈ CÓ TÊN THÀNH PHẦN (1-3 từ).
- Chữ trên mũi tên ngắn gọn chỉ rõ giao thức / luồng gọi (HTTPS, REST API, WebSocket, SQL, Webhook).
- Mang đậm phong cách System Design kinh điển, trực quan, dễ hiểu nhất cho Hội đồng chấm khóa luận!
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
ASSETS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Font chữ chuẩn công nghệ hiện đại
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Bảng màu chuẩn Algomaster (Vibrant Flat Design)
C_INK = '#1E293B'        # Viền đen than chì đậm
C_TEXT = '#0F172A'       # Chữ chính
C_MUTED = '#64748B'      # Chữ phụ nhạt
C_CYAN = '#38BDF8'       # Khách hàng / User
C_PURPLE = '#A855F7'     # Admin / Quản trị viên
C_GREEN = '#34D399'      # Server / API
C_RED = '#F43F5E'        # Database / Storage (Redis/PostgreSQL)
C_AMBER = '#FBBF24'      # Queue / Match / Engine
C_INDIGO = '#818CF8'     # AI / Model
C_BLUE = '#60A5FA'       # Monitor / WebGL


# ==============================================================================
# BỘ CÔNG CỤ VẼ 2D FLAT VECTOR (CHUẨN BLOG.ALGOMASTER.IO)
# ==============================================================================

def draw_vector_user(ax, x, y, name, color=C_CYAN, sub=''):
    """Vẽ người dùng (Avatar 2D như Player A, Player B)"""
    # Đầu tròn
    ax.add_patch(patches.Circle((x, y + 0.42), 0.32, facecolor=color, edgecolor=C_INK, lw=2.0, zorder=10))
    # Thân bo tròn
    ax.add_patch(patches.FancyBboxPatch((x - 0.45, y - 0.15), 0.90, 0.45,
                                        boxstyle='round,pad=0.08,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.0, zorder=9))
    # Tên thành phần
    ax.text(x, y - 0.42, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - 0.68, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_server(ax, x, y, name, color=C_GREEN, sub='', racks=2):
    """Vẽ cụm máy chủ Server rack (Khung trắng + các khay xanh lá như Server A, Server B)"""
    w = 2.0
    h = 0.55 * racks + 0.35
    # Khung chassis ngoài
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.05,rounding_size=0.12',
                                        facecolor='#FFFFFF', edgecolor=C_INK, lw=2.0, zorder=8))
    # Các khay server bên trong
    for i in range(racks):
        ry = (y - h/2) + 0.20 + i * 0.52
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.15, ry), w - 0.30, 0.38,
                                            boxstyle='round,pad=0.04,rounding_size=0.08',
                                            facecolor=color, edgecolor=C_INK, lw=1.6, zorder=9))
        # Đèn LED server
        ax.add_patch(patches.Circle((x + w/2 - 0.35, ry + 0.19), 0.05, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=11))
        # Khe cắm đĩa
        ax.plot([x - w/2 + 0.35, x + 0.3], [ry + 0.19, ry + 0.19], color=C_INK, lw=1.5, zorder=10)

    # Tên máy chủ
    ax.text(x, y - h/2 - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_db(ax, x, y, name, color=C_RED, sub='', disks=3):
    """Vẽ cơ sở dữ liệu dạng đĩa xếp tầng (như Redis / In-Memory Game State)"""
    w = 1.6
    dh = 0.32
    total_h = dh * disks
    base_y = y - total_h / 2
    for i in range(disks):
        cur_y = base_y + i * dh
        # Khối trụ tầng
        ax.add_patch(patches.FancyBboxPatch((x - w/2, cur_y), w, dh,
                                            boxstyle='round,pad=0.04,rounding_size=0.15',
                                            facecolor=color, edgecolor=C_INK, lw=1.8, zorder=8 + i))
        # Biểu tượng sao / hình khối nhỏ đặc trưng
        if i == disks - 1:
            ax.add_patch(patches.Circle((x - 0.35, cur_y + dh/2), 0.08, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=15))
            ax.add_patch(patches.RegularPolygon((x + 0.35, cur_y + dh/2), 3, radius=0.09, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.0, zorder=15))

    ax.text(x, y - total_h/2 - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - total_h/2 - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_card(ax, x, y, name, color=C_AMBER, sub='', stacked=True):
    """Vẽ khối dịch vụ bo góc (như Game Match Server dạng xếp tầng)"""
    w = 1.9
    h = 1.1
    if stacked:
        # Lớp bóng phía sau
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.12, y - h/2 - 0.10), w, h,
                                            boxstyle='round,pad=0.06,rounding_size=0.25',
                                            facecolor=color, edgecolor=C_INK, lw=1.8, zorder=7))
    # Lớp chính phía trước
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.06,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8))
    # Tên dịch vụ ở giữa
    ax.text(x, y, name, ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.25, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_monitor(ax, x, y, name, color=C_BLUE, sub=''):
    """Vẽ màn hình Dashboard / Kiosk hiển thị"""
    w = 1.8
    h = 1.2
    # Màn hình
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2 + 0.2), w, h,
                                        boxstyle='round,pad=0.05,rounding_size=0.12',
                                        facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8))
    # Màn hình nhỏ bên trong
    ax.add_patch(patches.Rectangle((x - w/2 + 0.15, y - h/2 + 0.35), w - 0.3, h - 0.3,
                                   facecolor='#FFFFFF', edgecolor=C_INK, lw=1.2, zorder=9))
    # Chân đế
    ax.plot([x, x], [y - h/2 + 0.2, y - h/2 - 0.05], color=C_INK, lw=2.5, zorder=7)
    ax.plot([x - 0.4, x + 0.4], [y - h/2 - 0.05, y - h/2 - 0.05], color=C_INK, lw=2.5, zorder=7)

    ax.text(x, y - h/2 - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_360_sphere(ax, x, y, name, color='#38BDF8', sub=''):
    """Vẽ biểu tượng Tour 360° / Toàn cảnh di sản"""
    r = 0.65
    # Khối cầu
    ax.add_patch(patches.Circle((x, y), r, facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8))
    # Các đường vĩ tuyến kinh tuyến cong
    ax.add_patch(patches.Arc((x, y), r*2, r*0.8, angle=0, theta1=0, theta2=360, color=C_INK, lw=1.5, zorder=9))
    ax.plot([x, x], [y - r, y + r], color=C_INK, lw=1.5, zorder=9)
    # Nhãn 360°
    ax.text(x, y, '360°', ha='center', va='center', fontsize=11, fontweight='bold', color='#FFFFFF', zorder=11,
            bbox=dict(boxstyle='round,pad=0.15', facecolor=C_INK, edgecolor='none'))

    ax.text(x, y - r - 0.25, name, ha='center', va='top', fontsize=10.5, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - r - 0.50, sub, ha='center', va='top', fontsize=8.5, color=C_MUTED, zorder=12)


def draw_vector_arrow(ax, x1, y1, x2, y2, label='', rad=0.0, side='top', shrink=22, bidirectional=False):
    """Vẽ mũi tên vector đậm với chữ giao thức đơn giản trên mũi tên (như ws, https)"""
    arrowstyle = '<->,head_width=0.4,head_length=0.5' if bidirectional else '->,head_width=0.4,head_length=0.6'
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=arrowstyle, color=C_INK, lw=1.8,
                                shrinkA=shrink, shrinkB=shrink, connectionstyle=conn), zorder=6)
    if label:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.20
        if side == 'top':
            lx, ly = mx, my + offset + (0.1 if rad > 0 else 0)
            ha, va = 'center', 'bottom'
        elif side == 'bottom':
            lx, ly = mx, my - offset - (0.1 if rad < 0 else 0)
            ha, va = 'center', 'top'
        elif side == 'left':
            lx, ly = mx - offset, my
            ha, va = 'right', 'center'
        else:
            lx, ly = mx + offset, my
            ha, va = 'left', 'center'

        ax.text(lx, ly, label, ha=ha, va=va, fontsize=9.0, fontweight='bold', color=C_TEXT,
                bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
                zorder=15)


# ==============================================================================
# 1. HÌNH 1: SƠ ĐỒ TỔNG QUAN KIẾN TRÚC & PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°
# ==============================================================================
def gen_hinh_1():
    fig, ax = plt.subplots(figsize=(14.0, 7.5), dpi=300)
    ax.set_xlim(0, 14.0); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(7.0, 7.0, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    # Nút trung tâm
    draw_vector_360_sphere(ax, 7.0, 3.8, 'Hệ Thống Tour 360°', color='#0284C7', sub='Bảo tàng Lịch sử TP.HCM')

    # 4 Nút phân hệ xung quanh
    draw_vector_user(ax, 2.0, 5.5, 'Khách Tham Quan', color=C_CYAN, sub='Trình duyệt Web / Mobile')
    draw_vector_card(ax, 2.0, 2.0, 'Động Cơ AI & Voice', color=C_INDIGO, sub='Google Cloud TTS')
    draw_vector_card(ax, 12.0, 5.5, 'Vé Điện Tử & VietQR', color=C_AMBER, sub='Cổng PayOS Napas')
    draw_vector_user(ax, 12.0, 2.0, 'Quản Trị Viên', color=C_PURPLE, sub='Admin CMS & Grafana')

    # Mũi tên kết nối
    draw_vector_arrow(ax, 3.0, 5.3, 5.9, 4.3, label='WebGL Three.js (60 FPS)', shrink=18, bidirectional=True)
    draw_vector_arrow(ax, 3.2, 2.2, 5.9, 3.3, label='Thuyết minh Audio TTS', shrink=18)
    draw_vector_arrow(ax, 8.1, 4.3, 10.8, 5.3, label='Đặt vé & Webhook', shrink=18, bidirectional=True)
    draw_vector_arrow(ax, 8.1, 3.3, 11.0, 2.2, label='Quản trị & Giám sát', shrink=18, bidirectional=True)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_1_1_so_do_tu_duy_tong_quan.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 1 (Algomaster Style)")


# ==============================================================================
# 2. HÌNH 2: KIẾN TRÚC HỆ THỐNG 3 TẦNG (3-TIER HYBRID ARCHITECTURE)
# ==============================================================================
def gen_hinh_2():
    fig, ax = plt.subplots(figsize=(15.0, 8.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(7.5, 8.0, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    # 3 Cột: Tầng 1 (Client), Tầng 2 (Services), Tầng 3 (Data & Cloud)
    ax.text(2.2, 7.2, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#0284C7')
    ax.text(7.5, 7.2, 'TẦNG 2: SERVICES', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#059669')
    ax.text(12.8, 7.2, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=10.5, fontweight='bold', color='#DC2626')

    # Đường phân cách mờ
    ax.axvline(x=4.8, ymin=0.08, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.5)
    ax.axvline(x=10.2, ymin=0.08, ymax=0.82, color='#E2E8F0', linestyle='--', lw=1.5)

    # Tầng 1
    draw_vector_user(ax, 2.2, 5.5, 'Khách Tham Quan', color=C_CYAN, sub='Web Desktop & Mobile')
    draw_vector_user(ax, 2.2, 2.3, 'Quản Trị Viên', color=C_PURPLE, sub='Admin CMS Dashboard')

    # Tầng 2
    draw_vector_server(ax, 7.5, 6.0, 'Web Server (Nginx)', color=C_GREEN, sub='Reverse Proxy & Cache', racks=2)
    draw_vector_server(ax, 7.5, 3.8, 'Backend API (Node.js)', color=C_GREEN, sub='RESTful & Realtime SSE', racks=2)
    draw_vector_card(ax, 7.5, 1.6, 'Xử Lý 3D & Ảnh', color=C_AMBER, sub='Python OpenCV & CPU 3D')

    # Tầng 3
    draw_vector_db(ax, 12.8, 6.0, 'CSDL PostgreSQL 16', color=C_RED, sub='Vé tham quan & Người dùng')
    draw_vector_db(ax, 12.8, 3.8, 'CSDL MongoDB NoSQL', color='#EA580C', sub='18 Phòng 360° & Cổ vật')
    draw_vector_card(ax, 12.8, 1.6, 'Dịch Vụ Đám Mây', color=C_INDIGO, sub='PayOS, ZeroGPU, TTS AI')

    # Mũi tên
    draw_vector_arrow(ax, 3.2, 5.5, 6.3, 6.0, label='HTTPS / WSS', shrink=18)
    draw_vector_arrow(ax, 3.2, 2.3, 6.3, 3.8, label='REST API', shrink=18)

    draw_vector_arrow(ax, 7.5, 5.1, 7.5, 4.6, label='Proxy Pass', shrink=12)
    draw_vector_arrow(ax, 7.5, 2.9, 7.5, 2.3, label='Hàng đợi Worker', shrink=12)

    draw_vector_arrow(ax, 8.7, 4.1, 11.8, 5.8, label='SQL (pgPool)', shrink=18)
    draw_vector_arrow(ax, 8.7, 3.8, 11.8, 3.8, label='Mongoose NoSQL', shrink=18)
    draw_vector_arrow(ax, 8.7, 1.6, 11.6, 1.6, label='Webhook / API', shrink=18)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_2_9_architecture_3tier.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 2 (Algomaster Style)")


# ==============================================================================
# 3. HÌNH 3: QUY TRÌNH GHÉP ẢNH TOÀN CẢNH 360° (PANORAMA STITCHING STUDIO)
# ==============================================================================
def gen_hinh_3():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'SƠ ĐỒ QUY TRÌNH GHÉP ẢNH TOÀN CẢNH 360° TỰ ĐỘNG (STITCHING PIPELINE)',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_card(ax, 1.8, 3.2, 'Ảnh Nguồn Đầu Vào', color=C_AMBER, sub='Chụp đơn / Đa góc 360°')
    draw_vector_card(ax, 5.4, 3.2, 'Khớp Ảnh SIFT', color=C_GREEN, sub='Trích xuất & RANSAC')
    draw_vector_card(ax, 9.0, 3.2, 'Nắn Trụ & Hòa Trộn', color=C_INDIGO, sub='Cylindrical Seam Blending')
    draw_vector_360_sphere(ax, 12.8, 3.2, 'Ảnh Toàn Cảnh 360°', color='#0284C7', sub='Equirectangular Panorama')

    draw_vector_arrow(ax, 2.9, 3.2, 4.3, 3.2, label='Chuyển ảnh 2D')
    draw_vector_arrow(ax, 6.5, 3.2, 7.9, 3.2, label='Ma trận Homography')
    draw_vector_arrow(ax, 10.1, 3.2, 11.8, 3.2, label='Xuất file Panorama')

    out1 = os.path.join(DIAGRAMS_DIR, "flow_01_stitching_process.png")
    out2 = os.path.join(ASSETS_DIR, "flow_01_stitching_process.png")
    out3 = os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png")
    for o in [out1, out2, out3]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 3 (Algomaster Style)")


# ==============================================================================
# 4. HÌNH 4: THUẬT TOÁN DIJKSTRA TÌM ĐƯỜNG NGẮN NHẤT 18 PHÒNG
# ==============================================================================
def gen_hinh_4():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'SƠ ĐỒ THUẬT TOÁN ĐỊNH TUYẾN ĐƯỜNG ĐI DIJKSTRA (MẶT BẰNG 18 PHÒNG)',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_card(ax, 1.8, 3.2, 'Bản Đồ 18 Phòng', color=C_AMBER, sub='Đồ thị vô hướng G(V, E)')
    draw_vector_card(ax, 5.4, 3.2, 'Hàng Đợi Min-Heap', color=C_GREEN, sub='Trích xuất d[u] nhỏ nhất')
    draw_vector_card(ax, 9.0, 3.2, 'Nới Lỏng Cạnh', color=C_INDIGO, sub='Cập nhật d[v] = d[u] + w')
    draw_vector_user(ax, 12.8, 3.2, 'Lộ Trình Tối Ưu', color=C_CYAN, sub='Hiển thị đường đi ngắn nhất')

    draw_vector_arrow(ax, 2.9, 3.2, 4.3, 3.2, label='Khởi tạo d[s]=0')
    draw_vector_arrow(ax, 6.5, 3.2, 7.9, 3.2, label='Extract-Min')
    draw_vector_arrow(ax, 10.1, 3.2, 11.9, 3.2, label='Đến đích (Dừng)')

    out1 = os.path.join(DIAGRAMS_DIR, "flow_02_floorplan_dijkstra.png")
    out2 = os.path.join(ASSETS_DIR, "flow_02_floorplan_dijkstra.png")
    out3 = os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png")
    out4 = os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png")
    for o in [out1, out2, out3, out4]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 4 (Algomaster Style)")


# ==============================================================================
# 5. HÌNH 5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (TRELLIS & LOCAL CPU)
# ==============================================================================
def gen_hinh_5():
    fig, ax = plt.subplots(figsize=(14.5, 7.0), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.25, 6.5, 'SƠ ĐỒ QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VÀ DỰ PHÒNG TỰ ĐỘNG',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_user(ax, 1.8, 3.5, 'Quản Trị Viên', color=C_PURPLE, sub='Nạp ảnh cổ vật 2D')
    draw_vector_card(ax, 5.0, 3.5, 'Bộ Điều Phối 3D', color=C_AMBER, sub='artifact3dQueue')

    draw_vector_card(ax, 8.8, 5.2, 'Đám Mây TRELLIS AI', color=C_INDIGO, sub='HuggingFace ZeroGPU')
    draw_vector_server(ax, 8.8, 1.8, 'Máy Chủ Local CPU', color=C_GREEN, sub='Marching Cubes (Fallback)', racks=2)

    draw_vector_card(ax, 12.8, 3.5, 'Cổ Vật 3D (.GLB)', color='#0284C7', sub='Hiển thị WebGL 360°')

    draw_vector_arrow(ax, 2.7, 3.5, 3.9, 3.5, label='Tải ảnh lên')
    draw_vector_arrow(ax, 6.0, 4.0, 7.8, 5.0, label='Ưu tiên gọi AI')
    draw_vector_arrow(ax, 6.0, 3.0, 7.6, 2.0, label='Tùy chọn / Fallback')
    draw_vector_arrow(ax, 9.9, 5.0, 11.8, 3.9, label='Lưới 3D PBR')
    draw_vector_arrow(ax, 9.9, 2.0, 11.8, 3.1, label='Lưới 3D nội bộ')

    # Đường fallback đứt nét giữa 2 động cơ
    draw_vector_arrow(ax, 8.8, 4.4, 8.8, 2.7, label='Fallback Quota 429', rad=0.0, side='right')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    out2 = os.path.join(ASSETS_DIR, "flow_04_dual_engine_3d.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 5 (Algomaster Style)")


# ==============================================================================
# 6. HÌNH 4.9: ĐA NGÔN NGỮ & VOICE AI GOOGLE CLOUD TTS
# ==============================================================================
def gen_hinh_4_9():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'SƠ ĐỒ ĐIỀU PHỐI ĐA NGÔN NGỮ VÀ ĐỘNG CƠ GIỌNG ĐỌC AI TTS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_user(ax, 1.8, 3.2, 'Khách Tham Quan', color=C_CYAN, sub='Chọn 7 ngôn ngữ')
    draw_vector_db(ax, 5.4, 3.2, 'Bộ Đệm MD5 Cache', color=C_RED, sub='Tệp tĩnh /audio_cache')
    draw_vector_card(ax, 9.0, 3.2, 'Google Cloud TTS', color=C_INDIGO, sub='Giọng đọc Neural2 AI')
    draw_vector_server(ax, 12.8, 3.2, 'Nginx Stream', color=C_GREEN, sub='HTTP 206 (< 50ms)', racks=2)

    draw_vector_arrow(ax, 2.7, 3.2, 4.4, 3.2, label='MD5(text + lang)')
    draw_vector_arrow(ax, 6.4, 3.2, 7.9, 3.2, label='Cache Miss (gọi API)')
    draw_vector_arrow(ax, 10.1, 3.2, 11.6, 3.2, label='Lưu Cache & Stream')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png")
    out2 = os.path.join(ASSETS_DIR, "flow_03_languages_voice_ai.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 4.9 (Algomaster Style)")


# ==============================================================================
# 7. HÌNH 6: VÒNG ĐỜI VÉ VIETQR & SOÁT VÉ QR THỜI GIAN THỰC
# ==============================================================================
def gen_hinh_6():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'SƠ ĐỒ VÒNG ĐỜI VÉ THAM QUAN VIETQR VÀ SOÁT VÉ MÃ QR',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_user(ax, 1.8, 3.2, 'Khách Đặt Vé', color=C_CYAN, sub='Chọn ngày & số lượng')
    draw_vector_card(ax, 5.4, 3.2, 'Cổng VietQR (PayOS)', color=C_AMBER, sub='Mã Napas 247')
    draw_vector_db(ax, 9.0, 3.2, 'CSDL Vé (Postgres)', color=C_RED, sub='Mã hóa AES-256')
    draw_vector_user(ax, 12.8, 3.2, 'Cổng Soát Vé Barie', color=C_PURPLE, sub='Camera quét QR jsQR')

    draw_vector_arrow(ax, 2.7, 3.2, 4.3, 3.2, label='Tạo giao dịch')
    draw_vector_arrow(ax, 6.5, 3.2, 8.0, 3.2, label='Webhook thanh toán')
    draw_vector_arrow(ax, 10.0, 3.2, 11.9, 3.2, label='Xác thực QR (< 1s)')

    out1 = os.path.join(DIAGRAMS_DIR, "flow_05_ticketing_vietqr_qr.png")
    out2 = os.path.join(ASSETS_DIR, "flow_05_ticketing_vietqr_qr.png")
    out3 = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png")
    out4 = os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png")
    for o in [out1, out2, out3, out4]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 6 (Algomaster Style)")


# ==============================================================================
# 8. HÌNH 7: KIẾN TRÚC GIÁM SÁT HỆ THỐNG GRAFANA & PROMETHEUS
# ==============================================================================
def gen_hinh_7():
    fig, ax = plt.subplots(figsize=(14.5, 6.5), dpi=300)
    ax.set_xlim(0, 14.5); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.25, 5.9, 'SƠ ĐỒ KIẾN TRÚC GIÁM SÁT VIỄN TRẮC PROMETHEUS VÀ GRAFANA',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_vector_server(ax, 1.8, 3.2, 'Máy Chủ Ứng Dụng', color=C_GREEN, sub='Node Exporter & Postgres', racks=2)
    draw_vector_db(ax, 5.4, 3.2, 'Prometheus TSDB', color=C_RED, sub='Lưu trữ Time-Series')
    draw_vector_monitor(ax, 9.0, 3.2, 'Grafana Dashboard', color=C_BLUE, sub='Trực quan hóa chỉ số')
    draw_vector_user(ax, 12.8, 3.2, 'Quản Trị Viên', color=C_PURPLE, sub='Cảnh báo & Báo cáo')

    draw_vector_arrow(ax, 2.9, 3.2, 4.4, 3.2, label='Scrape Metrics')
    draw_vector_arrow(ax, 6.4, 3.2, 7.9, 3.2, label='Truy vấn PromQL')
    draw_vector_arrow(ax, 10.1, 3.2, 11.9, 3.2, label='Xem biểu đồ')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    out2 = os.path.join(ASSETS_DIR, "hinh_2_14_grafana_architecture.png")
    for o in [out1, out2]:
        fig.savefig(o, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao Hinh 7 (Algomaster Style)")


if __name__ == '__main__':
    print("=== BẮT ĐẦU VẼ TOÀN BỘ SƠ ĐỒ CHUẨN BLOG.ALGOMASTER.IO ===")
    gen_hinh_1()
    gen_hinh_2()
    gen_hinh_3()
    gen_hinh_4()
    gen_hinh_5()
    gen_hinh_4_9()
    gen_hinh_6()
    gen_hinh_7()
    print("=== HOÀN TẤT VẼ 8 SƠ ĐỒ CHUẨN FLAT VECTOR SYSTEM DESIGN ===")
