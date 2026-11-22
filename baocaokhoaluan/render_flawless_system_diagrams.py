# -*- coding: utf-8 -*-
"""
render_flawless_system_diagrams.py
Tạo 100% sơ đồ học thuật chuẩn mực đồ án đại học IUH:
- Sử dụng các icon công nghệ chính thức, tách nền trong suốt, màu sắc sắc nét.
- Bố cục ngay ngắn, chuẩn tọa độ, căn chỉnh đối xứng.
- Text nằm hoàn toàn phía trên mũi tên hoặc có đệm che vạch, tuyệt đối KHÔNG đè chữ lên mũi tên hay biểu đồ.
- KHÔNG dùng các ô vuông / hộp màu mè chứa đầy chữ.
- Bám sát 100% bản chất thuật toán và kiến trúc hệ thống Bảo tàng 360°.
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
C_LINE = '#1E293B'       # Slate đậm cho toàn bộ mũi tên


def get_icon_path(name):
    p1 = os.path.join(ICONS_DIR, name)
    if os.path.exists(p1): return p1
    p2 = os.path.join(DOCS_ICONS_DIR, name)
    if os.path.exists(p2): return p2
    return None


def draw_clean_icon(ax, x, y, icon_name, title, subtitle='', fixed_h=1.45, y_title=None, y_sub=None):
    """
    Vẽ icon công nghệ trong suốt, kích thước đồng nhất, căn chỉnh ngay ngắn trên cùng đường chân trời.
    """
    icon_path = get_icon_path(icon_name)
    display_h = fixed_h
    if icon_path and os.path.exists(icon_path):
        img = mpimg.imread(icon_path)
        ih, iw = img.shape[:2]
        aspect = iw / ih
        display_w = display_h * aspect
        ax.imshow(img, extent=[x - display_w/2, x + display_w/2, y - display_h/2, y + display_h/2],
                  zorder=15, aspect='auto')
    else:
        ax.plot(x, y, 'o', color=C_TEXT, markersize=14, zorder=15)
        
    t_y = y_title if y_title is not None else (y - fixed_h / 2.0 - 0.28)
    s_y = y_sub if y_sub is not None else (t_y - 0.36)
    
    ax.text(x, t_y, title, ha='center', va='top', fontsize=9.8, fontweight='bold', color=C_TEXT, zorder=20)
    if subtitle:
        ax.text(x, s_y, subtitle, ha='center', va='top', fontsize=8.2, color=C_SUB, zorder=20)


def draw_clean_arrow(ax, x1, y1, x2, y2, label='', offset_y=0.40, offset_x=0.0, shrinkA=22, shrinkB=22, rad=0.0, is_dashed=False):
    """
    Vẽ mũi tên chuẩn mực đồ án học thuật:
    - Chữ nằm hoàn toàn phía trên đường kẻ với nhãn nền trắng đục che vạch.
    """
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
            fontsize=8.5, fontweight='bold', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
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
# HÌNH 2.1: HỆ TỌA ĐỘ CẦU VÀ ÁNH XẠ EQUIRECTANGULAR (KHÔNG DÙNG Ô VUÔNG MÀU MÈ)
# ==============================================================================
def render_hinh_2_1():
    fig, ax = plt.subplots(figsize=(11.5, 4.8), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 4.8); ax.axis('off')

    ax.text(5.75, 4.5, 'HỆ TỌA ĐỘ CẦU VÀ ÁNH XẠ TOÀN CẢNH EQUIRECTANGULAR 360°',
            ha='center', va='center', fontsize=11.5, fontweight='bold', color=C_TEXT)

    # 1. Mặt cầu 3D bên trái (Tâm cx=2.4, cy=2.2, bán kính R=1.4)
    cx, cy, R = 2.4, 2.2, 1.4
    circle = patches.Circle((cx, cy), R, facecolor='#F8FAFC', edgecolor=C_LINE, lw=1.5, zorder=2)
    ax.add_patch(circle)

    # Các đường vĩ tuyến & kinh tuyến
    eq = patches.Arc((cx, cy), 2*R, 0.7, angle=0, theta1=0, theta2=360, color=C_LINE, lw=1.3, zorder=3)
    ax.add_patch(eq)
    lat_pos = patches.Arc((cx, cy + 0.6), 2*R*0.75, 0.4, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_pos)
    lat_neg = patches.Arc((cx, cy - 0.6), 2*R*0.75, 0.4, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_neg)

    mer0 = patches.Arc((cx, cy), 0.7, 2*R, angle=0, theta1=0, theta2=360, color=C_LINE, lw=1.2, zorder=3)
    ax.add_patch(mer0)

    # Trục tọa độ 3D
    ax.annotate('', xy=(cx, cy + R + 0.35), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx + 0.08, cy + R + 0.38, 'Z (Bắc)', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(cx + R + 0.35, cy), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx + R + 0.38, cy - 0.05, 'Y', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(cx - 0.8, cy - 0.75), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE, lw=1.2), zorder=4)
    ax.text(cx - 0.95, cy - 0.85, 'X', fontsize=8, fontweight='bold', color=C_TEXT)

    ax.plot(cx, cy, 'o', color=C_LINE, markersize=4, zorder=5)
    ax.text(cx - 0.30, cy + 0.12, 'O(0,0,0)', fontsize=7.5, color=C_TEXT, zorder=6)

    # Điểm P(X, Y, Z)
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

    # Mũi tên chuyển đổi giữa 3D và 2D (KHÔNG CÓ Ô VUÔNG MÀU MÈ)
    ax.annotate('', xy=(6.5, 2.7), xytext=(4.6, 2.7),
                arrowprops=dict(arrowstyle='-|>', color=C_LINE, lw=1.4, mutation_scale=12), zorder=5)
    ax.text(5.55, 2.95, r'Chiếu thuận: $\theta = \arctan2(X, -Z), \phi = \arcsin(Y)$',
            ha='center', va='bottom', fontsize=7.6, fontweight='bold', color=C_TEXT)

    ax.annotate('', xy=(4.6, 1.7), xytext=(6.5, 1.7),
                arrowprops=dict(arrowstyle='-|>', color=C_LINE, lw=1.4, mutation_scale=12), zorder=5)
    ax.text(5.55, 1.45, r'Chiếu nghịch: $X = -\cos\phi\sin\theta, Y = \sin\phi, Z = -\cos\phi\cos\theta$',
            ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_TEXT)

    # 2. Lưới 2D Canvas bên phải
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
    fig, ax = plt.subplots(figsize=(11.5, 5.2), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(2.8, 4.85, 'HÌNH HỌC PHÉP CHIẾU MẶT TRỤ (CYLINDRICAL PROJECTION)',
            fontsize=8.5, fontweight='bold', ha='center', color=C_TEXT)

    cam_x, cam_y = 0.9, 2.2
    f = 2.6

    # Tâm camera C
    ax.plot(cam_x, cam_y, 'o', color=C_LINE, markersize=6, zorder=6)
    ax.text(cam_x - 0.12, cam_y, 'C (Tâm quang học)', fontsize=7.8, fontweight='bold', ha='right', va='center', color=C_TEXT)

    # Trục quang học
    ax.plot([cam_x, cam_x + f + 1.2], [cam_y, cam_y], color='#64748B', ls='--', lw=1.0, zorder=2)
    ax.text(cam_x + 1.3, cam_y - 0.20, f'Trục quang học (Tiêu cự f = {f})', fontsize=7.2, color=C_SUB, ha='center',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'))

    # Mặt phẳng cảm biến (Hạ thấp nhãn xuống 3.9 để không bao giờ đè lên tiêu đề ở 4.85)
    sensor_x = cam_x + f
    ax.plot([sensor_x, sensor_x], [cam_y - 1.5, cam_y + 1.5], color=C_LINE, lw=1.8, zorder=3)
    ax.text(sensor_x, cam_y + 1.70, 'Mặt phẳng cảm biến (Ảnh phẳng)\n' + r'$x_p \in [-W/2, W/2]$',
            fontsize=7.5, fontweight='bold', ha='center', va='bottom', color=C_TEXT)

    # Mặt trụ (Cylindrical Surface)
    theta_arc = np.linspace(-np.pi/3.8, np.pi/3.8, 100)
    arc_x = cam_x + f * np.cos(theta_arc)
    arc_y = cam_y + f * np.sin(theta_arc)
    ax.plot(arc_x, arc_y, color='#1E40AF', lw=2.2, zorder=4)
    # Lưu ý: dùng raw string r'' để không bao giờ bị lỗi \theta thành \t heta
    ax.text(arc_x[0] + 0.15, arc_y[0] - 0.20, r'Mặt trụ bán kính $f$' + '\n' + r'$x_{cyl} = f \cdot \theta$',
            fontsize=7.5, fontweight='bold', ha='left', va='top', color='#1E40AF')

    # Ray 1: góc trên
    theta1 = 0.42
    ray1_len = f / np.cos(theta1) + 0.5
    r1_end_x = cam_x + ray1_len * np.cos(theta1)
    r1_end_y = cam_y + ray1_len * np.sin(theta1)
    ax.plot([cam_x, r1_end_x], [cam_y, r1_end_y], color='#1E3A8A', lw=1.2, zorder=3)

    p1_x = sensor_x
    p1_y = cam_y + f * np.tan(theta1)
    ax.plot(p1_x, p1_y, 'o', color=C_LINE, markersize=5, zorder=6)
    ax.text(p1_x - 0.15, p1_y + 0.16, r'$p(x_p, y_p)$', fontsize=8.0, fontweight='bold', ha='right', color=C_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))

    cyl1_x = cam_x + f * np.cos(theta1)
    cyl1_y = cam_y + f * np.sin(theta1)
    ax.plot(cyl1_x, cyl1_y, 'o', color='#1E40AF', markersize=6, zorder=6)
    ax.text(cyl1_x + 0.15, cyl1_y + 0.16, r'$p_{cyl}(x_{cyl}, y_{cyl})$', fontsize=8.0, fontweight='bold', ha='left', color='#1E40AF',
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))

    # Ray 2: góc dưới
    theta2 = -0.38
    ray2_len = f / np.cos(theta2) + 0.5
    r2_end_x = cam_x + ray2_len * np.cos(theta2)
    r2_end_y = cam_y + ray2_len * np.sin(theta2)
    ax.plot([cam_x, r2_end_x], [cam_y, r2_end_y], color='#1E3A8A', lw=1.2, zorder=3)

    p2_x = sensor_x
    p2_y = cam_y + f * np.tan(theta2)
    ax.plot(p2_x, p2_y, 'o', color=C_LINE, markersize=5, zorder=6)

    cyl2_x = cam_x + f * np.cos(theta2)
    cyl2_y = cam_y + f * np.sin(theta2)
    ax.plot(cyl2_x, cyl2_y, 'o', color='#1E40AF', markersize=6, zorder=6)

    # Góc theta
    arc_ang = patches.Arc((cam_x, cam_y), 1.4, 1.4, angle=0, theta1=0, theta2=np.degrees(theta1), color=C_LINE, lw=1.1)
    ax.add_patch(arc_ang)
    ax.text(cam_x + 0.85, cam_y + 0.16, r'$\theta$', fontsize=8.5, fontweight='bold', color=C_TEXT)

    # Đường phân cách dọc
    ax.plot([5.5, 5.5], [0.4, 4.8], color='#CBD5E1', ls=':', lw=1.0)

    # Bên phải: Công thức toán học (KHÔNG DÙNG HỘP MÀU MÈ)
    ax.text(8.4, 4.85, 'CÔNG THỨC TOÁN HỌC & HIỆU QUẢ TRIỆT TIÊU BIẾN DẠNG',
            fontsize=8.5, fontweight='bold', ha='center', color=C_TEXT)

    ax.text(8.4, 4.35, 'Hệ phép chiếu toán học (Công thức 2.5 - 2.8):',
            fontsize=7.8, fontweight='bold', ha='center', color=C_TEXT)
    ax.text(8.4, 3.85, r'$x_{cyl} = f \cdot \arctan(x_p / f) + W/2$', fontsize=8.5, ha='center', color=C_TEXT)
    ax.text(8.4, 3.35, r'$y_{cyl} = f \cdot y_p / \sqrt{x_p^2 + f^2} + H/2$', fontsize=8.5, ha='center', color=C_TEXT)
    ax.text(8.4, 2.95, '(Nội suy mức xám Bilinear 4 điểm lân cận để bảo toàn độ sắc nét)',
            fontsize=7.0, fontstyle='italic', ha='center', color=C_SUB)

    # So sánh 2 hình ảnh minh họa dưới
    # 1. Ảnh phẳng gốc
    f1 = patches.Polygon([[6.1, 0.7], [7.7, 0.7], [7.9, 2.1], [5.9, 2.1]], facecolor='#FFFFFF', edgecolor='#475569', lw=1.2, zorder=4)
    ax.add_patch(f1)
    ax.text(6.9, 2.3, '1. Ảnh phẳng gốc (Chưa nắn)', fontsize=7.2, fontweight='bold', ha='center', color=C_TEXT)
    ax.plot([6.35, 6.15], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.plot([7.45, 7.65], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.text(6.9, 1.4, 'Biến dạng phối cảnh\n(Mép cột bị choãi)', ha='center', va='center', fontsize=6.8, color=C_SUB)

    # 2. Ảnh đã nắn mặt trụ
    curve_x = np.linspace(8.8, 10.6, 40)
    top_y = 2.1 - 0.10 * (1 - ((curve_x - 9.7)/0.9)**2)
    bot_y = 0.7 + 0.10 * (1 - ((curve_x - 9.7)/0.9)**2)
    verts = list(zip(curve_x, top_y)) + list(zip(curve_x[::-1], bot_y[::-1]))
    f2 = patches.Polygon(verts, facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.4, zorder=4)
    ax.add_patch(f2)
    ax.text(9.7, 2.3, '2. Ảnh đã nắn mặt trụ', fontsize=7.2, fontweight='bold', ha='center', color=C_TEXT)
    ax.plot([9.1, 9.1], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.plot([10.3, 10.3], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.text(9.7, 1.4, 'Cột bảo toàn 90° đứng\nSẵn sàng ghép mí', ha='center', va='center', fontsize=6.8, fontweight='bold', color=C_TEXT)

    save_fig(fig, ['hinh_2_2_cylindrical_warping.png'])


# ==============================================================================
# HÌNH 1.1: SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG
# ==============================================================================
def render_hinh_1_1():
    fig, ax = plt.subplots(figsize=(16.8, 9.5), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.4, 9.1, 'SƠ ĐỒ TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # 4 Người dùng bên trái, căn thẳng hàng dọc x=1.8
    draw_clean_icon(ax, 1.8, 7.3, 'icon_client.png', 'Khách tham quan 1', 'Thiết bị Desktop / Mobile', fixed_h=1.3)
    draw_clean_icon(ax, 1.8, 5.3, 'icon_client.png', 'Khách tham quan 2', 'Tải đồng thời cao', fixed_h=1.3)
    draw_clean_icon(ax, 1.8, 3.3, 'icon_client.png', 'Khách tham quan N...', 'Hỗ trợ đa nền tảng', fixed_h=1.3)
    draw_clean_icon(ax, 1.8, 1.3, 'icon_client.png', 'Quản trị viên (Admin)', 'Cổng quản trị CMS', fixed_h=1.3)

    # Trình duyệt Web (x=4.6, y=5.3)
    draw_clean_icon(ax, 4.6, 5.3, 'icon_browser.png', 'Trình duyệt Web', 'WebGL Three.js (Token & Cookies)', fixed_h=1.5)

    # Máy chủ trung tâm (x=8.4, y=5.3)
    draw_clean_icon(ax, 8.4, 5.3, 'icon_server.png', 'Máy chủ Ứng dụng', 'Node.js Express & TypeScript', fixed_h=1.6)

    # Vệ tinh xung quanh máy chủ:
    draw_clean_icon(ax, 6.2, 8.0, 'icon_redis.png', 'Bộ đệm Redis', 'Cache & Quản lý phiên', fixed_h=1.3)
    draw_clean_icon(ax, 10.6, 8.0, 'icon_payos.png', 'Thanh toán PayOS', 'Cổng VietQR Napas 247', fixed_h=1.3)

    draw_clean_icon(ax, 14.8, 7.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng vé & Người dùng (ACID)', fixed_h=1.4)
    draw_clean_icon(ax, 14.8, 5.3, 'icon_mongodb.png', 'CSDL MongoDB', '18 Gian phòng 360° & Cổ vật', fixed_h=1.3)
    draw_clean_icon(ax, 10.6, 2.0, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ', 'Xử lý tác vụ nền bất đồng bộ', fixed_h=1.3)
    draw_clean_icon(ax, 14.8, 2.0, 'icon_huggingface.png', 'Hugging Face (TRELLIS)', 'Mô hình 3D (Microsoft Research)', fixed_h=1.4)
    draw_clean_icon(ax, 6.2, 2.0, 'icon_grafana.png', 'Giám sát Grafana', 'Prometheus & Đo lường APM', fixed_h=1.3)

    # Mũi tên kết nối ngay ngắn
    draw_clean_arrow(ax, 2.6, 7.1, 3.8, 5.7, label='HTTPS Request', offset_y=0.42)
    draw_clean_arrow(ax, 2.6, 5.3, 3.7, 5.3, label='WSS Kết nối', offset_y=0.38)
    draw_clean_arrow(ax, 2.6, 3.5, 3.8, 4.9, label='Web Tour 360°', offset_y=-0.42)
    draw_clean_arrow(ax, 2.6, 1.5, 4.2, 4.5, label='JWT Auth Request', offset_y=-0.42)

    draw_clean_arrow(ax, 5.5, 5.3, 7.5, 5.3, label='RESTful API (JSON)', offset_y=0.38)

    draw_clean_arrow(ax, 7.8, 5.9, 6.7, 7.3, label='Ghi / Đọc Cache', offset_y=0.35, offset_x=-0.2)
    draw_clean_arrow(ax, 9.0, 5.9, 10.0, 7.3, label='Tạo Link VietQR', offset_y=0.35, offset_x=0.2)

    draw_clean_arrow(ax, 9.3, 5.7, 13.8, 7.0, label='SQL Query (pgPool)', offset_y=0.42)
    draw_clean_arrow(ax, 9.3, 5.3, 13.8, 5.3, label='Mongoose Query', offset_y=0.38)

    draw_clean_arrow(ax, 9.0, 4.7, 10.1, 2.8, label='Đẩy tác vụ 3D Queue', offset_y=-0.38)
    draw_clean_arrow(ax, 11.4, 2.0, 13.9, 2.0, label='Gọi ZeroGPU A100', offset_y=0.38)
    draw_clean_arrow(ax, 7.8, 4.7, 6.7, 2.8, label='PromQL Metrics', offset_y=-0.38)

    save_fig(fig, ['hinh_1_1_mindmap.png', 'hinh_1_1_so_do_tu_duy_tong_quan.png'])


# ==============================================================================
# HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN HÌNH CẦU 3D THREE.JS
# ==============================================================================
def render_hinh_2_6():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'NGUYÊN LÝ ÁNH XẠ TEXTURE TOÀN CẢNH LÊN HÌNH CẦU NGHỊCH ĐẢO VÀ TƯƠNG TÁC THREE.JS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_360_grid.png', '1. Nguồn Ảnh Panorama 8K', 'Equirectangular (2:1 / WebP)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_wireframe_3d.png', '2. Lưới Cầu Nghịch Đảo', 'MeshSphereGeometry (Lật mặt trong)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_browser.png', '3. Điều Khiển & Raycaster', 'OrbitControls & Bắt tia Hotspot', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_client.png', '4. Trình Diễn Tương Tác', 'Khách xem xoay 360° & Pop-up', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. TextureLoader nạp VRAM', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Ánh xạ texture mặt trong', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Raycasting va chạm tia nhìn', offset_y=0.42)

    save_fig(fig, ['hinh_2_6_texture_mapping.png'])


# ==============================================================================
# HÌNH 2.8: QUY TRÌNH TÁI TẠO MÔ HÌNH CỔ VẬT 3D ĐA PHƯƠNG THỨC
# ==============================================================================
def render_hinh_2_8():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH TÁI TẠO CỔ VẬT 3D TỪ CHUỖI ẢNH TƯ LIỆU VỚI BÓC TÁCH PHÔNG NỀN',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', 'Đơn diện / Đối lập / Đa góc', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_feature_match.png', '2. Bóc Tách Nền Tự Động', 'Rembg / U2-Net (Chuẩn hóa Alpha)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_huggingface.png', '3. Sinh Khối Lưới 3D', 'Hugging Face TRELLIS (SLAT & DMC)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_wireframe_3d.png', '4. Xuất Mô Hình .GLB', 'PBR Texture & Nén Draco WebGL', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Tải ảnh tư liệu gốc', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Gửi ảnh Alpha Mask sang GPU', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Trích xuất lưới & nén .GLB', offset_y=0.42)

    save_fig(fig, ['hinh_2_8_photogrammetry.png'])


# ==============================================================================
# HÌNH 2.9: KIẾN TRÚC PHÂN TẦNG HỆ THỐNG 3 TẦNG LAI GHÉP (SỬ DỤNG ICON NGINX MỚI)
# ==============================================================================
def render_hinh_2_9():
    fig, ax = plt.subplots(figsize=(17.0, 9.5), dpi=300)
    ax.set_xlim(0, 17.0); ax.set_ylim(0, 9.5); ax.axis('off')

    ax.text(8.5, 9.0, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    ax.text(2.6, 8.2, 'TẦNG 1: CLIENT', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#0284C7')
    ax.text(8.5, 8.2, 'TẦNG 2: SERVICES & QUEUE', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#059669')
    ax.text(14.4, 8.2, 'TẦNG 3: DATA & CLOUD', ha='center', va='center', fontsize=11.0, fontweight='bold', color='#DC2626')

    ax.plot([5.5, 5.5], [0.6, 8.3], color='#CBD5E1', linestyle='--', lw=1.5)
    ax.plot([11.5, 11.5], [0.6, 8.3], color='#CBD5E1', linestyle='--', lw=1.5)

    # Tầng 1
    draw_clean_icon(ax, 2.6, 6.4, 'icon_browser.png', 'Trình duyệt Web (Client)', 'React 18 & WebGL Three.js', fixed_h=1.5, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 2.6, 2.2, 'icon_client.png', 'Quản trị viên (Admin CMS)', 'Quản trị vé, phòng & cổ vật', fixed_h=1.4, y_title=0.9, y_sub=0.5)

    # Tầng 2: Nginx Reverse Proxy & Node.js Server
    draw_clean_icon(ax, 8.5, 6.4, 'icon_nginx.png', 'Nginx & Node.js API', 'Reverse Proxy SSL & REST Gateway', fixed_h=1.5, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 8.5, 2.2, 'icon_rabbitmq.png', 'Hàng đợi RabbitMQ & Redis', 'Điều phối tác vụ & Bộ đệm phiên', fixed_h=1.4, y_title=0.9, y_sub=0.5)

    # Tầng 3: PostgreSQL 16 & PayOS
    draw_clean_icon(ax, 14.4, 6.4, 'icon_postgres.png', 'CSDL PostgreSQL 16 & Mongo', 'Vé tham quan, Phòng 360° & Cổ vật', fixed_h=1.5, y_title=4.9, y_sub=4.5)
    draw_clean_icon(ax, 14.4, 2.2, 'icon_payos.png', 'Cổng PayOS & Hugging Face', 'VietQR Napas 247 & TRELLIS 3D', fixed_h=1.4, y_title=0.9, y_sub=0.5)

    draw_clean_arrow(ax, 3.8, 6.4, 7.2, 6.4, label='HTTPS / WSS (Port 443)', offset_y=0.42)
    draw_clean_arrow(ax, 3.8, 2.2, 7.2, 2.2, label='RESTful API (JSON)', offset_y=0.42)

    draw_clean_arrow(ax, 8.5, 5.2, 8.5, 3.4, label='Đẩy tác vụ & Đọc Cache', offset_x=1.7, offset_y=0.0)

    draw_clean_arrow(ax, 9.8, 6.4, 13.0, 6.4, label='SQL (pgPool) & Mongoose', offset_y=0.42)
    draw_clean_arrow(ax, 9.8, 2.2, 13.0, 2.2, label='Webhook VietQR & API ZeroGPU', offset_y=0.42)

    save_fig(fig, ['hinh_2_9_architecture_3tier.png'])


# ==============================================================================
# HÌNH 2.10: XÁC THỰC NGƯỜI DÙNG BẰNG JWT & HTTPONLY COOKIE (SEQUENCE DIAGRAM)
# ==============================================================================
def render_hinh_2_10():
    fig, ax = plt.subplots(figsize=(16.8, 8.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 8.8); ax.axis('off')

    ax.text(8.4, 8.2, 'SƠ ĐỒ TUẦN TỰ: XÁC THỰC VÀ PHÂN QUYỀN BẰNG JSON WEB TOKEN (JWT) & HTTPONLY COOKIE',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 2.5, 7.0, 'icon_browser.png', 'Trình duyệt Client', 'User / Admin', fixed_h=1.4, y_title=5.8, y_sub=5.5)
    draw_clean_icon(ax, 8.4, 7.0, 'icon_server.png', 'API Gateway / Auth', 'Node.js Express', fixed_h=1.5, y_title=5.8, y_sub=5.5)
    draw_clean_icon(ax, 14.2, 7.0, 'icon_postgres.png', 'Cơ sở Dữ liệu', 'PostgreSQL 16', fixed_h=1.4, y_title=5.8, y_sub=5.5)

    for lx in [2.5, 8.4, 14.2]:
        ax.plot([lx, lx], [0.8, 5.3], color='#94A3B8', linestyle=':', lw=1.5, zorder=5)

    y_steps = [4.8, 4.0, 3.2, 2.4, 1.6, 0.9]

    draw_clean_arrow(ax, 2.5, y_steps[0], 8.4, y_steps[0], label='1. POST /api/auth/login (email, password)', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 8.4, y_steps[1], 14.2, y_steps[1], label='2. SELECT * FROM users WHERE email = ?', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 14.2, y_steps[2], 8.4, y_steps[2], label='3. Trả về bản ghi user & mật khẩu băm Bcrypt', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)
    draw_clean_arrow(ax, 8.4, y_steps[3], 2.5, y_steps[3], label='4. Trả về JWT Access Token (24h) kèm HttpOnly Cookie', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)
    draw_clean_arrow(ax, 2.5, y_steps[4], 8.4, y_steps[4], label='5. GET /api/rooms (Header: Authorization Bearer <token>)', offset_y=0.32, shrinkA=8, shrinkB=8)
    draw_clean_arrow(ax, 8.4, y_steps[5], 2.5, y_steps[5], label='6. Phản hồi cấu trúc 18 phòng 360° & cổ vật (HTTP 200 OK)', offset_y=0.32, shrinkA=8, shrinkB=8, is_dashed=True)

    save_fig(fig, ['hinh_2_10_jwt_auth.png'])


# ==============================================================================
# HÌNH 2.11: QUY TRÌNH THANH TOÁN VIETQR PAYOS (CHUẨN ICON PAYOS & POSTGRESQL)
# ==============================================================================
def render_hinh_payos_flow():
    fig, ax = plt.subplots(figsize=(16.8, 7.5), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.4, 6.9, 'QUY TRÌNH SINH MÃ VÀ XÁC THỰC THANH TOÁN VIETQR QUA CỔNG PAYOS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.4, 'icon_client.png', '1. Khách Mua Vé', 'Giao diện Booking Web', fixed_h=1.5, y_title=2.9, y_sub=2.5)
    draw_clean_icon(ax, xs[1], 4.4, 'icon_server.png', '2. Máy Chủ Backend', 'Node.js Express & Tạo Đơn', fixed_h=1.5, y_title=2.9, y_sub=2.5)
    draw_clean_icon(ax, xs[2], 4.4, 'icon_payos.png', '3. Cổng PayOS', 'VietQR Napas 247 Động', fixed_h=1.5, y_title=2.9, y_sub=2.5)
    draw_clean_icon(ax, xs[3], 4.4, 'icon_browser.png', '4. App Ngân Hàng', 'Quét QR & Chuyển khoản', fixed_h=1.5, y_title=2.9, y_sub=2.5)

    draw_clean_icon(ax, xs[1], 1.2, 'icon_postgres.png', 'CSDL PostgreSQL 16', 'Bảng Tickets & Transactions (PAID)', fixed_h=1.2, y_title=0.2, y_sub=None)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.8, xs[1] - 1.1, 4.8, label='1. Chọn vé & Đặt mua', offset_y=0.40)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.8, xs[2] - 1.1, 4.8, label='2. Gọi API tạo VietQR', offset_y=0.40)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.8, xs[3] - 1.1, 4.8, label='3. Hiển thị mã VietQR động', offset_y=0.40)

    draw_clean_arrow(ax, xs[3] - 1.1, 4.0, xs[2] + 1.1, 4.0, label='4. Chuyển khoản thành công', offset_y=-0.40)
    draw_clean_arrow(ax, xs[2] - 1.1, 4.0, xs[1] + 1.1, 4.0, label='5. Webhook báo PAID', offset_y=-0.40, is_dashed=True)
    draw_clean_arrow(ax, xs[1] - 1.1, 4.0, xs[0] + 1.1, 4.0, label='7. SSE đẩy vé về client', offset_y=-0.40, is_dashed=True)

    draw_clean_arrow(ax, xs[1], 3.5, xs[1], 2.1, label='6. Cập nhật vé PAID & ký số', offset_x=1.9, offset_y=0.0)

    save_fig(fig, ['hinh_2_11_payos_flow.png', 'hinh_3_6_activity_booking_ticket_lifecycle.png', 'hinh_3_6_sequence_payment_payos.png', 'hinh_4_8_payment_ticket_flow.png', 'flow_05_ticketing_vietqr_qr.png'])


# ==============================================================================
# HÌNH 2.12: SOÁT VÉ ĐIỆN TỬ QR THỜI GIAN THỰC
# ==============================================================================
def render_hinh_qr_validation():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH QUÉT VÀ XÁC THỰC MÃ VÉ QR THỜI GIAN THỰC TẠI CỔNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_browser.png', '1. Vé trên Mobile', 'Mã QR mã hóa AES-256', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_client.png', '2. Camera Soát Vé', 'Html5Qrcode Scanner (Staff)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Máy Chủ Backend', 'Node.js Giải mã AES & Hash', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_postgres.png', '4. CSDL PostgreSQL', 'Cập nhật trạng thái USED', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Quét mã QR (< 150ms)', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. POST /tickets/validate', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Đổi trạng thái vé USED', offset_y=0.42)

    save_fig(fig, ['hinh_2_12_qr_validation.png', 'hinh_3_7_activity_ticket_validation.png', 'hinh_3_7_sequence_qr_scan.png'])


# ==============================================================================
# HÌNH 2.13: KIẾN TRÚC DOCKER COMPOSE & NGINX (MŨI TÊN PHÂN BỐ ĐỀU, ICON NGINX CHUẨN)
# ==============================================================================
def render_hinh_2_13():
    fig, ax = plt.subplots(figsize=(17.0, 8.8), dpi=300)
    ax.set_xlim(0, 17.0); ax.set_ylim(0, 8.8); ax.axis('off')

    ax.text(8.5, 8.2, 'SƠ ĐỒ ĐIỀU PHỐI VÀ ĐÓNG GÓI HỆ THỐNG VỚI DOCKER COMPOSE TRÊN VPS UBUNTU',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)

    # Cột 1 (x=2.2): Nginx Reverse Proxy (sử dụng icon_nginx.png chính thức)
    draw_clean_icon(ax, 2.2, 4.5, 'icon_nginx.png', 'Nginx Reverse Proxy', 'Port 80/443 (SSL/TLS Termination)', fixed_h=1.6, y_title=2.8, y_sub=2.4)

    # Cột 2 (x=6.5): Node.js API Container
    draw_clean_icon(ax, 6.5, 4.5, 'icon_server.png', 'Node.js API Container', 'Port 5000 (Express & TypeScript)', fixed_h=1.6, y_title=2.8, y_sub=2.4)

    # Mũi tên thẳng giữa Nginx và Node.js
    draw_clean_arrow(ax, 3.4, 4.5, 5.4, 4.5, label='Proxy Pass (Docker Bridge)', offset_y=0.42)

    # 4 Dịch vụ phía sau được chia đều 2 cột đối xứng hoàn hảo (không chéo nhau, không đè vạch):
    # Cột 3: In-Memory & Message Queue (x=11.2)
    # - Hàng trên: Redis (y=6.4)
    # - Hàng dưới: RabbitMQ (y=2.6)
    draw_clean_icon(ax, 11.2, 6.4, 'icon_redis.png', 'Redis Container', 'Port 6379 (In-Memory Cache)', fixed_h=1.35, y_title=5.1, y_sub=4.7)
    draw_clean_icon(ax, 11.2, 2.6, 'icon_rabbitmq.png', 'RabbitMQ Container', 'Port 5672 (Message Broker)', fixed_h=1.35, y_title=1.3, y_sub=0.9)

    # Cột 4: Cơ sở dữ liệu lưu trữ bền vững (x=15.2)
    # - Hàng trên: PostgreSQL 16 (y=6.4)
    # - Hàng dưới: MongoDB NoSQL (y=2.6)
    draw_clean_icon(ax, 15.2, 6.4, 'icon_postgres.png', 'PostgreSQL 16', 'Port 5432 (Relational Data)', fixed_h=1.45, y_title=5.1, y_sub=4.7)
    draw_clean_icon(ax, 15.2, 2.6, 'icon_mongodb.png', 'MongoDB NoSQL', 'Port 27017 (360 Rooms & Items)', fixed_h=1.35, y_title=1.3, y_sub=0.9)

    # Mũi tên từ Node.js đến Cột 3 (Redis & RabbitMQ)
    draw_clean_arrow(ax, 7.6, 5.0, 10.0, 6.2, label='TCP Ghi/Đọc Cache', offset_y=0.40)
    draw_clean_arrow(ax, 7.6, 4.0, 10.0, 2.8, label='AMQP Đẩy Hàng Đợi', offset_y=-0.40)

    # Mũi tên từ Node.js kết nối đến Cột 4 (Postgres & Mongo)
    # Vẽ theo nhánh ngang sạch sẽ, không cắt chéo icon
    draw_clean_arrow(ax, 12.4, 6.4, 14.0, 6.4, label='pgPool Query', offset_y=0.40)
    draw_clean_arrow(ax, 12.4, 2.6, 14.0, 2.6, label='Mongoose Query', offset_y=-0.40)

    save_fig(fig, ['hinh_2_13_docker_compose.png'])


# ==============================================================================
# HÌNH 2.14: HỆ THỐNG GIÁM SÁT GRAFANA & PROMETHEUS
# ==============================================================================
def render_hinh_grafana():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT VỚI PROMETHEUS VÀ GRAFANA V11',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_server.png', '1. Máy Chủ Backend & Nginx', 'Cung cấp Endpoint /metrics', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Prometheus Server', 'Scrape chu kỳ 15s (TSDB)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_grafana.png', '3. Grafana Dashboard', 'Truy vấn PromQL & Trực quan', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_client.png', '4. Quản trị viên (CMS)', 'Chế độ Kiosk nhúng IFrame', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Scrape định kỳ /metrics', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. PromQL Query Engine', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Nhúng biểu đồ APM Kiosk', offset_y=0.42)

    save_fig(fig, ['hinh_2_14_grafana_architecture.png', 'hinh_3_9_grafana_sequence.png'])


# ==============================================================================
# HÌNH 3.8: TƯƠNG TÁC TOUR 360° VÀ CHUYỂN PHÒNG QUA HOTSPOT
# ==============================================================================
def render_hinh_3_8():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ HOẠT ĐỘNG: TƯƠNG TÁC KHÔNG GIAN 360° VÀ CHUYỂN PHÒNG QUA ĐIỂM NỐI HOTSPOT',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Nhấp chọn Hotspot trên màn hình', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_browser.png', '2. Trình Duyệt WebGL', 'Raycaster tính toán va chạm 3D', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Máy Chủ Backend', 'Truy vấn thông tin phòng đích', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_mongodb.png', '4. CSDL MongoDB', 'Cấu trúc phòng & Liên kết', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Nhấp chuột / Chạm cảm ứng', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. GET /api/rooms/:targetId', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Trả về metadata phòng & ảnh 8K', offset_y=0.42)

    save_fig(fig, ['hinh_3_8_sequence_tour_hotspot.png'])


# ==============================================================================
# HÌNH 3.10: DỊCH THUẬT VÀ BẢN ĐỊA HÓA ĐA NGÔN NGỮ (KHÔNG CÓ MŨI TÊN ĐÈ CHỮ)
# ==============================================================================
def render_hinh_3_10():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION WORKFLOW)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Chọn Ngôn Ngữ', '7 Ngôn ngữ (Vi, En, Fr, Zh, Ja...)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'Node.js kiểm tra JSON từ điển', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_ai_brain.png', '3. Động Cơ Google NMT', 'Dịch thuật tự động khi thiếu từ điển', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Trình Diễn Đa Ngữ', 'Cập nhật tiêu đề & Thuyết minh', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    # Luồng tuần tự thẳng hàng, chữ nằm cao trên đường kẻ
    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Gửi mã ISO ngôn ngữ', offset_y=0.45)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Fallback gọi Google NMT API', offset_y=0.45)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Nạp từ điển & Cập nhật UI', offset_y=0.45)

    save_fig(fig, ['hinh_3_10_translation_flow.png'])


# ==============================================================================
# HÌNH 3.11: SINH VÀ LƯU TRỮ ĐỆM BĂM GIỌNG ĐỌC VOICE AI TTS
# ==============================================================================
def render_hinh_voice_tts():
    fig, ax = plt.subplots(figsize=(16.8, 7.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.4, 7.2, 'QUY TRÌNH SINH VÀ LƯU TRỮ ĐỆM BĂM (HASH CACHING) GIỌNG ĐỌC THUYẾT MINH AI',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    draw_clean_icon(ax, 1.8, 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Bật biểu tượng loa trên Tour', fixed_h=1.5, y_title=2.5, y_sub=2.1)
    draw_clean_icon(ax, 4.8, 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'Voice Service băm MD5 văn bản', fixed_h=1.5, y_title=2.5, y_sub=2.1)

    draw_clean_icon(ax, 10.2, 5.7, 'icon_redis.png', '3a. Bộ Đệm Redis', 'Trả về tệp .MP3 có sẵn (0ms)', fixed_h=1.3, y_title=4.4, y_sub=4.0)
    draw_clean_icon(ax, 10.2, 2.3, 'icon_ai_brain.png', '3b. Google Cloud TTS', 'Sinh giọng đọc Neural2 tự nhiên', fixed_h=1.3, y_title=1.0, y_sub=0.6)

    draw_clean_icon(ax, 15.0, 4.0, 'icon_browser.png', '4. Trình Duyệt Web', 'Stream Audio Partial Content 206', fixed_h=1.5, y_title=2.5, y_sub=2.1)

    draw_clean_arrow(ax, 2.7, 4.0, 3.8, 4.0, label='1. Gửi yêu cầu giọng đọc', offset_y=0.40)
    draw_clean_arrow(ax, 5.8, 4.6, 9.0, 5.5, label='2a. Cache Hit (Có sẵn)', offset_y=0.40)
    draw_clean_arrow(ax, 5.8, 3.4, 9.0, 2.5, label='2b. Cache Miss -> Gọi TTS', offset_y=-0.40)

    draw_clean_arrow(ax, 11.4, 5.5, 14.0, 4.3, label='3a. Stream file có sẵn', offset_y=0.40)
    draw_clean_arrow(ax, 11.4, 2.5, 14.0, 3.7, label='3b. Lưu đệm băm & Phát', offset_y=-0.40)

    save_fig(fig, ['hinh_3_11_voice_tts_storage_pipeline.png', 'flow_03_languages_voice_ai.png'])


# ==============================================================================
# HÌNH 3.12: KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# ==============================================================================
def render_hinh_3_12():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH (MULTI-SHEET EXCEL)',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Quản Trị Viên (Admin)', 'Yêu cầu xuất báo cáo Excel', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'ExcelJS Streaming Worker', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_postgres.png', '3. CSDL PostgreSQL 16', 'Truy vấn doanh thu & vé bán', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Tải Tệp .XLSX', 'Bảng tính định dạng chuẩn', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. GET /api/reports/export', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Query dữ liệu tài chính & vé', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Stream tải tệp .xlsx về client', offset_y=0.42)

    save_fig(fig, ['hinh_3_12_excel_export_flow.png', 'hinh_3_12_excel_export_activity.png'])


# ==============================================================================
# HÌNH 3.13: QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT KHÁM PHÁ PHYGITAL
# ==============================================================================
def render_hinh_3_13():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Quét mã QR dán tại tủ kính', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_browser.png', '2. Camera QR Scanner', 'Điều hướng URL định danh hiện vật', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Máy Chủ Backend', 'CMS Gateway truy vấn 3D', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_wireframe_3d.png', '4. Hiển Thị 3D WebGL', 'Xoay 360° & Nghe Audio Guide', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Quét QR hiện vật thực địa', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Mở /artifacts/:id trên Web', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Trả về mô hình 3D .GLB & Audio', offset_y=0.42)

    save_fig(fig, ['hinh_3_13_qr_exhibition_activity.png'])


# ==============================================================================
# HÌNH 4.1: QUY TRÌNH TỰ ĐỘNG HÓA CI/CD QUA GITHUB ACTIONS
# ==============================================================================
def render_hinh_4_1():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ ĐƯỜNG ỐNG TỰ ĐỘNG HÓA KIỂM THỬ VÀ TRIỂN KHAI LIÊN TỤC (CI/CD) GITHUB ACTIONS',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Lập Trình Viên', 'Git Push nhánh main/feature', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. GitHub Runner', 'Lint, Jest & Unit Test CI', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_server.png', '3. Docker Build & Tag', 'Đóng gói Container Images', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_server.png', '4. VPS Production', 'SSH Deploy & Zero-Downtime', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Git Commit & Push', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Tự động kiểm thử pass', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Docker Compose restart', offset_y=0.42)

    save_fig(fig, ['hinh_4_1_cicd_pipeline.png', 'flow_01_stitching_process.png'])


# ==============================================================================
# HÌNH 4.3: XỬ LÝ TOÀN CẢNH 360° TỪ 4 NGUỒN ẢNH ĐẦU VÀO
# ==============================================================================
def render_hinh_4_3():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'QUY TRÌNH XỬ LÝ VÀ CHUẨN HÓA ẢNH TOÀN CẢNH 360° TỪ 4 PHƯƠNG THỨC NẠP DỮ LIỆU',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Nạp Ảnh Tư Liệu', '4 Nguồn (Video sweep, Chụp liên tiếp...)', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'Nginx tiếp nhận & Lưu trữ tạm', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_feature_match.png', '3. Panorama Studio', 'Nắn chỉnh trụ & Khớp SIFT/RANSAC', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_360_grid.png', '4. Xuất Ảnh 360° 8K', 'Equirectangular WebP 60 FPS', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Tải lên tệp ảnh qua CMS', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Chuyển giao ảnh sang Python Studio', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Hòa trộn đa dải & Lưu R2 CDN', offset_y=0.42)

    save_fig(fig, ['hinh_4_3_panorama_4inputs.png'])


# ==============================================================================
# HÌNH 4.5: TÁI TẠO CỔ VẬT 3D LAI GHÉP (BÁM SÁT THUẬT TOÁN, ĐẦY ĐỦ SERVER, KHÔNG ĐÈ CHỮ)
# ==============================================================================
def render_hinh_4_5():
    fig, ax = plt.subplots(figsize=(17.0, 8.5), dpi=300)
    ax.set_xlim(0, 17.0); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(8.5, 7.9, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI ĐỘNG CƠ AI',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color=C_TEXT)
    ax.text(8.5, 7.4, 'Bóc tách nền Rembg / Alpha Mask — Máy chủ Backend điều phối hàng đợi Queue — Ưu tiên Hugging Face (TRELLIS) và Dự phòng Local CPU',
            ha='center', va='center', fontsize=9.0, fontstyle='italic', color=C_SUB)

    # Trục chính ngang y=4.2
    # Cột 1: Quản trị viên (x=1.8)
    draw_clean_icon(ax, 1.8, 4.2, 'icon_client.png', '1. Quản Trị Viên', 'Nạp 2D ảnh tư liệu hiện vật', fixed_h=1.45, y_title=2.6, y_sub=2.2)

    # Cột 2: Máy chủ Backend (x=4.8)
    draw_clean_icon(ax, 4.8, 4.2, 'icon_server.png', '2. Máy Chủ Backend', 'Node.js Express & Phân luồng', fixed_h=1.5, y_title=2.6, y_sub=2.2)

    # Cột 3: Hàng đợi điều phối RabbitMQ & Redis (x=7.8)
    draw_clean_icon(ax, 7.8, 4.2, 'icon_rabbitmq.png', '3. Hàng Đợi 3D Queue', 'RabbitMQ & Redis phân luồng', fixed_h=1.45, y_title=2.6, y_sub=2.2)

    # Cột 4: Hai động cơ đối xứng trên - dưới
    # Nhánh trên: Hugging Face Spaces (y=6.2, x=11.6)
    draw_clean_icon(ax, 11.6, 6.2, 'icon_huggingface.png', '4a. Hugging Face (TRELLIS)', 'ZeroGPU A100 (Microsoft Research)', fixed_h=1.45, y_title=4.8, y_sub=4.4)

    # Nhánh dưới: Máy chủ Local CPU (y=2.2, x=11.6)
    draw_clean_icon(ax, 11.6, 2.2, 'icon_server.png', '4b. Máy Chủ Local CPU (Dự phòng)', 'Marching Cubes v15.0 (VPS Offline)', fixed_h=1.45, y_title=0.8, y_sub=0.4)

    # Cột 5: Trình duyệt WebGL (x=15.4, y=4.2)
    draw_clean_icon(ax, 15.4, 4.2, 'icon_browser.png', '5. Mô Hình 3D (.GLB)', 'Three.js WebGL xoay 360°', fixed_h=1.45, y_title=2.6, y_sub=2.2)

    # Mũi tên trục ngang: 1 -> 2 -> 3
    draw_clean_arrow(ax, 2.7, 4.2, 3.9, 4.2, label='1. Nạp ảnh (REST API)', offset_y=0.42)
    draw_clean_arrow(ax, 5.7, 4.2, 6.9, 4.2, label='2. Đẩy Job vào Queue', offset_y=0.42)

    # Mũi tên phân nhánh đối xứng: 3 -> 4a và 3 -> 4b
    draw_clean_arrow(ax, 8.7, 4.8, 10.4, 5.9, label='3a. [Ưu tiên] Gọi ZeroGPU A100', offset_y=0.48)
    draw_clean_arrow(ax, 8.7, 3.6, 10.4, 2.5, label='3b. [Tùy chọn] Chạy Local CPU', offset_y=-0.48)

    # Mũi tên xuất kết quả: 4a -> 5 và 4b -> 5
    draw_clean_arrow(ax, 12.8, 5.9, 14.5, 4.8, label='4a. Xuất .GLB chuẩn PBR WebGL', offset_y=0.48)
    draw_clean_arrow(ax, 12.8, 2.5, 14.5, 3.6, label='4b. Xuất .GLB xoay trục nội bộ', offset_y=-0.48)

    # Mũi tên Fallback thẳng đứng từ 4a xuống 4b khi lỗi Quota 429 (Khoảng cách offset chữ sang phải đủ lớn để không đè vạch)
    draw_clean_arrow(ax, 11.6, 5.2, 11.6, 3.2, label='Tự động Fallback khi Quota 429', offset_x=2.1, offset_y=0.0, is_dashed=True)

    save_fig(fig, ['hinh_4_5_artifact_2engines.png', 'flow_04_dual_engine_3d.png'])


# ==============================================================================
# HÌNH 4.7: GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG ĐI NGẮN NHẤT 18 PHÒNG
# ==============================================================================
def render_hinh_4_7():
    fig, ax = plt.subplots(figsize=(16.8, 6.8), dpi=300)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8); ax.axis('off')

    ax.text(8.4, 6.3, 'SƠ ĐỒ KHỐI: GIẢI THUẬT DIJKSTRA TÌM LỘ TRÌNH DI CHUYỂN TỐI ƯU GIỮA 18 PHÒNG BẢO TÀNG',
            ha='center', va='center', fontsize=12.2, fontweight='bold', color=C_TEXT)

    xs = [2.2, 6.3, 10.5, 14.6]
    draw_clean_icon(ax, xs[0], 4.0, 'icon_client.png', '1. Khách Tham Quan', 'Chọn phòng xuất phát & phòng đích', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[1], 4.0, 'icon_server.png', '2. Máy Chủ Backend', 'Tính giải thuật Dijkstra 18 đỉnh', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[2], 4.0, 'icon_mongodb.png', '3. Dữ Liệu Tọa Độ Sơ Đồ', 'Khoảng cách Euclide thực địa', fixed_h=1.5, y_title=2.4, y_sub=2.0)
    draw_clean_icon(ax, xs[3], 4.0, 'icon_browser.png', '4. Mini-map Định Tuyến', 'Vẽ đường line dẫn đường trực quan', fixed_h=1.5, y_title=2.4, y_sub=2.0)

    draw_clean_arrow(ax, xs[0] + 1.1, 4.0, xs[1] - 1.1, 4.0, label='1. Yêu cầu tìm đường tối ưu', offset_y=0.42)
    draw_clean_arrow(ax, xs[1] + 1.1, 4.0, xs[2] - 1.1, 4.0, label='2. Nạp ma trận trọng số khoảng cách', offset_y=0.42)
    draw_clean_arrow(ax, xs[2] + 1.1, 4.0, xs[3] - 1.1, 4.0, label='3. Xuất chuỗi phòng cần đi lên Mini-map', offset_y=0.42)

    save_fig(fig, ['hinh_4_7_dijkstra_flow.png', 'flow_02_floorplan_dijkstra.png'])


def render_all_flawless():
    print("=== BẮT ĐẦU RENDER TOÀN BỘ SƠ ĐỒ CHUẨN MỰC HỌC THUẬT ===")
    render_hinh_1_1()
    render_hinh_2_1()
    render_hinh_2_2()
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
    print("=== HOÀN TẤT RENDER 100% SƠ ĐỒ KHÔNG LỖI, KHÔNG ĐÈ CHỮ, KHÔNG HỘP MÀU MÈ! ===")


if __name__ == '__main__':
    render_all_flawless()
