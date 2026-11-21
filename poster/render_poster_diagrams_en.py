# -*- coding: utf-8 -*-
"""
Generate English 2D Flat Vector Diagrams (Algomaster Style) specifically for the Academic Poster.
Matches 100% English requirement, crisp dark outlines, and minimal clear labels.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

POSTER_ASSETS = r"d:\KhoaluanTotNghiep\poster\assets"
os.makedirs(POSTER_ASSETS, exist_ok=True)

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Bảng màu sậm hơn, tương phản mạnh, chuẩn in ấn A0
C_INK = '#0F172A'       # Viền đen than chì đậm, sắc nét
C_TEXT = '#0F172A'      # Chữ chính đậm
C_MUTED = '#334155'     # Chữ phụ sậm màu dễ đọc
C_CYAN = '#0284C7'      # Xanh biển đậm (Visitor)
C_PURPLE = '#7C3AED'    # Tím đậm (Admin)
C_GREEN = '#059669'     # Xanh lá đậm (Nginx / API)
C_RED = '#DC2626'       # Đỏ sậm (PostgreSQL DB)
C_ORANGE = '#EA580C'    # Cam sậm (MongoDB)
C_AMBER = '#D97706'     # Vàng hổ phách sậm (Engine)
C_INDIGO = '#4F46E5'    # Chàm đậm (Cloud AI)


def draw_vector_user(ax, x, y, name, color=C_CYAN, sub=''):
    """Vẽ người dùng Avatar 2D bo tròn sắc nét"""
    ax.add_patch(patches.Circle((x, y + 0.44), 0.34, facecolor=color, edgecolor=C_INK, lw=2.2, zorder=10))
    ax.add_patch(patches.FancyBboxPatch((x - 0.48, y - 0.16), 0.96, 0.46,
                                        boxstyle='round,pad=0.08,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.2, zorder=9))
    ax.text(x, y - 0.45, name, ha='center', va='top', fontsize=11.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - 0.72, sub, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_MUTED, zorder=12)


def draw_vector_server(ax, x, y, name, color=C_GREEN, sub='', racks=2):
    """Vẽ cụm máy chủ Server rack màu đậm sắc sảo"""
    w = 2.2
    h = 0.60 * racks + 0.35
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.05,rounding_size=0.14',
                                        facecolor='#FFFFFF', edgecolor=C_INK, lw=2.2, zorder=8))
    for i in range(racks):
        ry = (y - h/2) + 0.20 + i * 0.58
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.16, ry), w - 0.32, 0.42,
                                            boxstyle='round,pad=0.04,rounding_size=0.08',
                                            facecolor=color, edgecolor=C_INK, lw=1.8, zorder=9))
        ax.add_patch(patches.Circle((x + w/2 - 0.36, ry + 0.21), 0.06, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.2, zorder=11))
        ax.plot([x - w/2 + 0.35, x + 0.3], [ry + 0.21, ry + 0.21], color='#FFFFFF', lw=1.8, zorder=10)

    ax.text(x, y - h/2 - 0.25, name, ha='center', va='top', fontsize=11.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.52, sub, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_MUTED, zorder=12)


def draw_vector_db(ax, x, y, name, color=C_RED, sub='', disks=3):
    """Vẽ cơ sở dữ liệu đĩa xếp tầng màu sậm"""
    w = 1.8
    dh = 0.34
    total_h = dh * disks
    base_y = y - total_h / 2
    for i in range(disks):
        cur_y = base_y + i * dh
        ax.add_patch(patches.FancyBboxPatch((x - w/2, cur_y), w, dh,
                                            boxstyle='round,pad=0.04,rounding_size=0.15',
                                            facecolor=color, edgecolor=C_INK, lw=2.0, zorder=8 + i))
        if i == disks - 1:
            ax.add_patch(patches.Circle((x - 0.40, cur_y + dh/2), 0.08, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.2, zorder=15))
            ax.add_patch(patches.RegularPolygon((x + 0.40, cur_y + dh/2), 3, radius=0.09, facecolor='#FFFFFF', edgecolor=C_INK, lw=1.2, zorder=15))

    ax.text(x, y - total_h/2 - 0.25, name, ha='center', va='top', fontsize=11.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - total_h/2 - 0.52, sub, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_MUTED, zorder=12)


def draw_vector_card(ax, x, y, name, color=C_AMBER, sub='', stacked=True):
    """Vẽ khối dịch vụ bo góc sắc sảo"""
    w = 2.1
    h = 1.2
    if stacked:
        ax.add_patch(patches.FancyBboxPatch((x - w/2 + 0.12, y - h/2 - 0.10), w, h,
                                            boxstyle='round,pad=0.06,rounding_size=0.25',
                                            facecolor=color, edgecolor=C_INK, lw=2.0, zorder=7))
    ax.add_patch(patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                        boxstyle='round,pad=0.06,rounding_size=0.25',
                                        facecolor=color, edgecolor=C_INK, lw=2.2, zorder=8))
    ax.text(x, y, name, ha='center', va='center', fontsize=10.5, fontweight='bold', color='#FFFFFF', zorder=12)
    if sub:
        ax.text(x, y - h/2 - 0.25, sub, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_MUTED, zorder=12)


def draw_vector_360_sphere(ax, x, y, name, color=C_CYAN, sub=''):
    """Vẽ quả cầu 360° màu sậm sắc nét"""
    r = 0.70
    ax.add_patch(patches.Circle((x, y), r, facecolor=color, edgecolor=C_INK, lw=2.2, zorder=8))
    ax.add_patch(patches.Arc((x, y), r*2, r*0.8, angle=0, theta1=0, theta2=360, color=C_INK, lw=1.8, zorder=9))
    ax.plot([x, x], [y - r, y + r], color=C_INK, lw=1.8, zorder=9)
    ax.text(x, y, '360°', ha='center', va='center', fontsize=11.5, fontweight='bold', color='#FFFFFF', zorder=11,
            bbox=dict(boxstyle='round,pad=0.18', facecolor=C_INK, edgecolor='none'))
    ax.text(x, y - r - 0.25, name, ha='center', va='top', fontsize=11.0, fontweight='bold', color=C_TEXT, zorder=12)
    if sub:
        ax.text(x, y - r - 0.52, sub, ha='center', va='top', fontsize=8.8, fontweight='bold', color=C_MUTED, zorder=12)


def draw_clean_labeled_arrow(ax, x1, y1, x2, y2, label='', lx=None, ly=None, shrinkA=22, shrinkB=22, rad=0.0):
    """
    Vẽ mũi tên tuyệt đối KHÔNG đè chữ:
    - Đường kẻ dừng cách các khối node (shrinkA, shrinkB an toàn).
    - Nhãn chữ có hộp đệm nền trắng bo viền đậm (opaque white pill, zorder=30) che sạch đường ngầm.
    - Cho phép chỉ định chính xác tọa độ nhãn (lx, ly) để không bao giờ va chạm.
    """
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->,head_width=0.45,head_length=0.65', color=C_INK, lw=2.0,
                                shrinkA=shrinkA, shrinkB=shrinkB, connectionstyle=conn), zorder=6)
    if label:
        if lx is None or ly is None:
            lx = (x1 + x2) / 2
            ly = (y1 + y2) / 2 + 0.30
        ax.text(lx, ly, label, ha='center', va='center', fontsize=9.2, fontweight='bold', color=C_TEXT,
                bbox=dict(boxstyle='round,pad=0.25', facecolor='#FFFFFF', edgecolor=C_INK, lw=1.2, alpha=1.0),
                zorder=30)


# ==============================================================================
# 1. ENGLISH 3-TIER ARCHITECTURE DIAGRAM (KHÔNG ĐÈ MŨI TÊN, MÀU SẬM ĐẬM ĐÀ)
# ==============================================================================
def gen_architecture_en():
    fig, ax = plt.subplots(figsize=(16.0, 9.2), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 9.2); ax.axis('off')

    # Tiêu đề chính đậm đà
    ax.text(8.0, 8.7, '3-TIER HYBRID ARCHITECTURE & COMPONENT TOPOLOGY',
            ha='center', va='center', fontsize=13.0, fontweight='bold', color=C_TEXT)

    # Tiêu đề 3 Tầng rõ ràng
    ax.text(2.5, 7.9, 'TIER 1: CLIENTS', ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_CYAN)
    ax.text(8.0, 7.9, 'TIER 2: SERVICES', ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_GREEN)
    ax.text(13.5, 7.9, 'TIER 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color=C_RED)

    # Đường phân cách mờ ngăn nắp giữa các tầng
    ax.axvline(x=5.2, ymin=0.06, ymax=0.82, color='#94A3B8', linestyle='--', lw=1.5, alpha=0.8)
    ax.axvline(x=10.8, ymin=0.06, ymax=0.82, color='#94A3B8', linestyle='--', lw=1.5, alpha=0.8)

    # --- TẦNG 1: CLIENTS ---
    draw_vector_user(ax, 2.5, 6.2, 'Virtual Visitor', color=C_CYAN, sub='Desktop & Mobile WebGL')
    draw_vector_user(ax, 2.5, 2.3, 'Administrator', color=C_PURPLE, sub='Admin CMS Dashboard')

    # --- TẦNG 2: SERVICES ---
    draw_vector_server(ax, 8.0, 6.6, 'Web Server (Nginx)', color=C_GREEN, sub='Reverse Proxy & Cache', racks=2)
    draw_vector_server(ax, 8.0, 4.3, 'Backend API (Node.js)', color=C_GREEN, sub='RESTful & Realtime SSE', racks=2)
    draw_vector_card(ax, 8.0, 1.8, '3D & Vision Engine', color=C_AMBER, sub='Python OpenCV & Local CPU')

    # --- TẦNG 3: DATA & CLOUD ---
    draw_vector_db(ax, 13.5, 6.6, 'PostgreSQL 16 DB', color=C_RED, sub='ACID Tickets & Accounts')
    draw_vector_db(ax, 13.5, 4.3, 'MongoDB NoSQL', color=C_ORANGE, sub='18 Galleries & Artifacts')
    draw_vector_card(ax, 13.5, 1.8, 'Hugging Face & PayOS', color=C_INDIGO, sub='TRELLIS 3D (MSR), VietQR')

    # --- MŨI TÊN KẾT NỐI (ĐƯỢC BỐ TRÍ TỌA ĐỘ CHÍNH XÁC, KHÔNG ĐÈ LÊN NHAU) ---
    # Visitor -> Nginx (ngang nhẹ)
    draw_clean_labeled_arrow(ax, 3.6, 6.3, 6.7, 6.6, label='HTTPS / WSS', lx=5.2, ly=6.9, shrinkA=18, shrinkB=18)

    # Admin -> Backend API (chéo lên)
    draw_clean_labeled_arrow(ax, 3.6, 2.6, 6.7, 4.1, label='RESTful API', lx=5.2, ly=3.7, shrinkA=18, shrinkB=18)

    # Nginx -> Backend API (thẳng đứng, nhãn đặt bên phải)
    draw_clean_labeled_arrow(ax, 8.0, 5.7, 8.0, 4.9, label='Proxy Pass', lx=8.95, ly=5.3, shrinkA=10, shrinkB=10)

    # Backend API -> Python Studio (thẳng đứng, nhãn đặt bên phải)
    draw_clean_labeled_arrow(ax, 8.0, 3.4, 8.0, 2.5, label='Worker Queue', lx=9.1, ly=2.95, shrinkA=10, shrinkB=10)

    # Backend API -> PostgreSQL (chéo lên)
    draw_clean_labeled_arrow(ax, 9.3, 4.7, 12.3, 6.4, label='SQL (pgPool)', lx=10.8, ly=5.9, shrinkA=18, shrinkB=18)

    # Backend API -> MongoDB (thẳng ngang)
    draw_clean_labeled_arrow(ax, 9.3, 4.3, 12.3, 4.3, label='Mongoose NoSQL', lx=10.8, ly=4.75, shrinkA=18, shrinkB=18)

    # Python Studio -> Cloud AI (thẳng ngang)
    draw_clean_labeled_arrow(ax, 9.3, 1.8, 12.2, 1.8, label='Cloud API Call', lx=10.8, ly=2.25, shrinkA=18, shrinkB=18)

    out = os.path.join(POSTER_ASSETS, "diagram_architecture_3tier_en.png")
    fig.savefig(out, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao diagram_architecture_3tier_en.png (Hoan hao khong de chu)")


# ==============================================================================
# 2. ENGLISH PANORAMA PROCESS DIAGRAM (THOÁNG ĐÃNG, RÕ RÀNG)
# ==============================================================================
def gen_process_en():
    fig, ax = plt.subplots(figsize=(16.0, 5.2), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(8.0, 4.7, 'AUTOMATED 360° PANORAMA STITCHING PIPELINE',
            ha='center', va='center', fontsize=13.0, fontweight='bold', color=C_TEXT)

    # 4 khối cách nhau 3.8 đơn vị -> Cực kỳ rộng rãi
    draw_vector_card(ax, 2.0, 2.3, 'Source Imagery', color=C_AMBER, sub='Smartphone Video Sweeps')
    draw_vector_card(ax, 6.0, 2.3, 'SIFT Matching', color=C_GREEN, sub='128D Invariant Descriptors')
    draw_vector_card(ax, 10.0, 2.3, 'Cylindrical Warp', color=C_INDIGO, sub='Multiband Seam Blending')
    draw_vector_360_sphere(ax, 14.2, 2.3, '8K Panorama', color=C_CYAN, sub='Equirectangular 360°')

    # Mũi tên và nhãn đặt cao bên trên, không bao giờ chạm khối
    draw_clean_labeled_arrow(ax, 3.3, 2.3, 4.7, 2.3, label='Frame Extraction', lx=4.0, ly=3.15, shrinkA=12, shrinkB=12)
    draw_clean_labeled_arrow(ax, 7.3, 2.3, 8.7, 2.3, label='Homography (RANSAC)', lx=8.0, ly=3.15, shrinkA=12, shrinkB=12)
    draw_clean_labeled_arrow(ax, 11.3, 2.3, 13.2, 2.3, label='Render 360° Sphere', lx=12.2, ly=3.15, shrinkA=12, shrinkB=12)

    out = os.path.join(POSTER_ASSETS, "diagram_stitching_process_en.png")
    fig.savefig(out, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao diagram_stitching_process_en.png (Hoan hao khong de chu)")


if __name__ == '__main__':
    gen_architecture_en()
    gen_process_en()
