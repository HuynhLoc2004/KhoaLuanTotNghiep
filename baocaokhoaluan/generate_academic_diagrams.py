# -*- coding: utf-8 -*-
"""
GENERATE ACADEMIC SOFTWARE ARCHITECTURE & FLOW DIAGRAMS (DEEP MUTED TONES - NO COLORFUL TEXT)
Bao cao Khoa luan Tot nghiep - IUH
Phong cach thiet ke:
- Cac thuc the (Actor, Server, Database, Device, Cloud, Shape) duoc to mau sam (Deep Muted Tones:
  Navy #1E3A8A, Slate Steel #334155, Burgundy #991B1B, Forest #166534, Dark Charcoal #1E293B).
- KHONG dung mau choi sang / neon nhu AI, chi dung mau sam tram, nhan nha trang nha.
- TEXT HOAN TOAN KHONG TO MAU: 100% dung chu den tuyen / than chi dam (#0F172A hoac #475569)
  dam bao tinh hoc thuat nghiem tuc va de doc nhat.
- Khong co chu bi de nhau, do phan giai cao dpi=300.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 9.0

# PALETTE MAU SAM HOC THUAT (DEEP MUTED TONES)
C_DARK_TEXT = '#0F172A'     # Text chinh: Den tuyen than chi
C_MUTED_TEXT = '#475569'    # Text phu: Xam dam de doc
C_LINE_DARK = '#0F172A'     # Duong net, vien khung

# Mau to thuc the (Mau sam tram, khong choi sang)
C_FILL_ACTOR = '#1E3A8A'    # Actor: Navy sam
C_FILL_SERVER = '#334155'   # Server header: Slate steel sam
C_FILL_DB = '#991B1B'       # Database: Burgundy / Terracotta sam
C_FILL_DB_TOP = '#B91C1C'   # Dia database tren
C_FILL_DEVICE = '#1E293B'   # Khung may tinh / dien thoai
C_FILL_CLOUD = '#0369A1'    # Cloud: Sky sam
C_FILL_GREEN = '#166534'    # Thanh cong / Inlier: Xanh rung sam
C_FILL_CARD_BG = '#F8FAFC'  # Nen the nhe nhang

# =============================================================================
# CAC HAM VE NGUYEN MAU HINH HOC CHUAN HOC THUAT TO MAU SAM
# =============================================================================

def draw_actor(ax, x, y, label, sub='', scale=1.0, color=C_FILL_ACTOR):
    """Ve bieu tuong Actor to mau sam tram, text den tuyen."""
    r_head = 0.16 * scale
    head = patches.Circle((x, y + 0.36 * scale), r_head, facecolor=color, edgecolor=C_LINE_DARK, lw=1.5, zorder=6)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.06 * scale), 0.42 * scale, 0.32 * scale, facecolor=color, edgecolor=C_LINE_DARK, lw=1.5, zorder=6)
    ax.add_patch(body)
    ax.text(x, y - 0.22 * scale, label, ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - 0.44 * scale, sub, ha='center', va='top', fontsize=7.2, color=C_MUTED_TEXT, zorder=7)

def draw_server(ax, x, y, w=1.3, h=1.4, title='', sub=''):
    """Ve bieu tuong Server Node toi gian thanh lich, header slate sam, khong de slot trong."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.5, zorder=4)
    ax.add_patch(rect)
    # Header bar
    s_hdr = patches.Rectangle((x - w/2, y + h/2 - 0.26), w, 0.26, facecolor=C_FILL_SERVER, edgecolor=C_LINE_DARK, lw=1.0, zorder=5)
    ax.add_patch(s_hdr)
    ax.text(x, y + h/2 - 0.13, 'SERVER NODE', ha='center', va='center', fontsize=6.8, fontweight='bold', color='white', zorder=6)

    ax.text(x, y - 0.02, title, ha='center', va='center', fontsize=8.0, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - 0.38, sub, ha='center', va='top', fontsize=7.0, color=C_MUTED_TEXT, zorder=7)

def draw_database(ax, x, y, w=1.0, h=1.1, title='', sub='', color=C_FILL_DB):
    """Ve bieu tuong CSDL dang hinh tru dia chong to mau burgundy sam."""
    for i, y_offset in enumerate([0.30, 0.04, -0.22]):
        cyl = patches.FancyBboxPatch((x - w/2, y + y_offset), w, 0.26, boxstyle='round,pad=0.02,rounding_size=0.08',
                                     facecolor=color, edgecolor=C_LINE_DARK, lw=1.4, zorder=4+i)
        ax.add_patch(cyl)
        top_ellipse = patches.Ellipse((x, y + y_offset + 0.13), w*0.92, 0.08,
                                      facecolor=C_FILL_DB_TOP, edgecolor=C_LINE_DARK, lw=1.0, zorder=5+i)
        ax.add_patch(top_ellipse)
    ax.text(x, y - 0.40, title, ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=8)
    if sub:
        ax.text(x, y - 0.60, sub, ha='center', va='top', fontsize=7.2, color=C_MUTED_TEXT, zorder=8)

def draw_device(ax, x, y, w=1.0, h=1.2, title='', sub='', kind='mobile'):
    """Ve thiet bi laptop/phone co mat kinh man hinh sam."""
    if kind == 'mobile':
        rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.08',
                                      facecolor='#0F172A', edgecolor=C_LINE_DARK, lw=1.4, zorder=4)
        ax.add_patch(rect)
        screen = patches.Rectangle((x - w*0.38, y - h*0.35), w*0.76, h*0.7, facecolor='#1E293B', edgecolor='#475569', lw=0.9, zorder=5)
        ax.add_patch(screen)
        home = patches.Circle((x, y - h*0.42), 0.035, facecolor='#94A3B8', edgecolor='none', zorder=6)
        ax.add_patch(home)
    else:
        rect = patches.Rectangle((x - w/2, y - h*0.3), w, h*0.7, facecolor='#1E293B', edgecolor=C_LINE_DARK, lw=1.4, zorder=4)
        ax.add_patch(rect)
        screen = patches.Rectangle((x - w*0.44, y - h*0.24), w*0.88, h*0.58, facecolor='#334155', edgecolor='none', zorder=5)
        ax.add_patch(screen)
        base = patches.Polygon([[x - w*0.65, y - h*0.45], [x + w*0.65, y - h*0.45], [x + w*0.55, y - h*0.3], [x - w*0.55, y - h*0.3]],
                               facecolor='#94A3B8', edgecolor=C_LINE_DARK, lw=1.4, zorder=4)
        ax.add_patch(base)
    ax.text(x, y - h/2 - 0.15, title, ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - h/2 - 0.35, sub, ha='center', va='top', fontsize=7.2, color=C_MUTED_TEXT, zorder=7)

def draw_cloud(ax, x, y, w=1.5, h=0.9, title='', sub=''):
    """Ve bieu tuong Cloud to mau sky sam nha nhan."""
    c1 = patches.Circle((x - 0.28, y), 0.32, facecolor='#E0F2FE', edgecolor='#0369A1', lw=1.4, zorder=4)
    c2 = patches.Circle((x + 0.28, y), 0.32, facecolor='#E0F2FE', edgecolor='#0369A1', lw=1.4, zorder=4)
    c3 = patches.Circle((x, y + 0.18), 0.38, facecolor='#E0F2FE', edgecolor='#0369A1', lw=1.4, zorder=4)
    r = patches.Rectangle((x - 0.28, y - 0.32), 0.56, 0.36, facecolor='#E0F2FE', edgecolor='none', zorder=5)
    for p in [c1, c2, c3, r]: ax.add_patch(p)
    ax.text(x, y - 0.05, title, ha='center', va='center', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - 0.48, sub, ha='center', va='top', fontsize=7.2, color=C_MUTED_TEXT, zorder=7)

def draw_clean_node(ax, x, y, w, h, title, sub='', bg='#F8FAFC', border=C_LINE_DARK, lw=1.3):
    """Ve the thanh phan to mau tram nhe, text hoan toan khong to mau."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor=bg, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    if sub:
        ax.text(x, y + h * 0.20, title, ha='center', va='center', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=6)
        ax.text(x, y - h * 0.18, sub, ha='center', va='center', fontsize=7.2, color=C_MUTED_TEXT, linespacing=1.25, zorder=6)
    else:
        ax.text(x, y, title, ha='center', va='center', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=6)

def draw_step_arrow(ax, x1, y1, x2, y2, step='', label='', color=C_LINE_DARK, rad=0.0, label_offset=0.24):
    """Ve mui ten chuyen trang thai co huy hieu buoc [1], [2], text den tuyen."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.4, shrinkA=6, shrinkB=6,
                                mutation_scale=12, connectionstyle=conn), zorder=5)
    mx = (x1 + x2) / 2
    my = (y1 + y2) / 2 + (0.15 if rad >= 0 else -0.15)
    if step:
        badge = patches.Circle((mx, my), 0.12, facecolor=C_LINE_DARK, edgecolor='none', zorder=8)
        ax.add_patch(badge)
        ax.text(mx, my, step, ha='center', va='center', fontsize=7.2, fontweight='bold', color='white', zorder=9)
    if label:
        ax.text(mx, my + label_offset, label, ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT,
                bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.7, alpha=0.98), zorder=8)

# =============================================================================
# VE TOAN BO CAC SO DO CHUAN HOC THUAT TO MAU SAM
# =============================================================================

def gen_fig_1_1():
    """Hinh 1.1: So do tu duy kien truc he thong Tour 360"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    draw_clean_node(ax, 5.25, 2.1, 2.8, 1.2, "BẢO TÀNG LỊCH SỬ TP.HCM", "Nền tảng Tour 360° & Di sản số", bg='#EFF6FF', border='#1E3A8A', lw=1.8)
    
    draw_actor(ax, 1.5, 3.2, "Khách tham quan", "Tour 360°, 3D, Dijkstra, Voice AI", color=C_FILL_ACTOR)
    draw_actor(ax, 9.0, 3.2, "Quản trị viên CMS", "Quản lý 18 phòng, Cổ vật, VPS", color=C_FILL_SERVER)
    draw_device(ax, 1.5, 0.9, 1.3, 1.0, "Studio Số hóa", "4 Nguồn Panorama & 2 Động cơ 3D", kind="desktop")
    draw_database(ax, 9.0, 0.9, 1.1, 1.0, "Thương mại & Soát vé", "VietQR PayOS & Vé AES-256", color=C_FILL_DB)
    
    draw_step_arrow(ax, 3.8, 2.4, 2.2, 3.0, label="Trải nghiệm WebGL")
    draw_step_arrow(ax, 6.7, 2.4, 8.3, 3.0, label="Vận hành CMS")
    draw_step_arrow(ax, 3.8, 1.8, 2.2, 1.0, label="Nạp ảnh 8K & 3D")
    draw_step_arrow(ax, 6.7, 1.8, 8.3, 1.0, label="Thanh toán & Vé")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_1_3():
    """Hinh 1.3: Quy trinh khao sat va so hoa thuc dia tai bao tang"""
    fig, ax = plt.subplots(figsize=(10.5, 2.5), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.5); ax.axis('off')
    
    stages = [
        ("ĐỢT 1: KHẢO SÁT", "Đo đạc 18 phòng trưng bày\nXây dựng ma trận kề Topo", 1.3, '#EFF6FF', '#1E3A8A'),
        ("ĐỢT 2: CHỤP ẢNH 8K", "Ống kính Fisheye & Chân máy\nLọc sắc nét Laplacian", 3.9, '#F0FDF4', '#166534'),
        ("ĐỢT 3: SỐ HÓA 3D", "Photogrammetry 72 góc chụp\nTái tạo Local CPU & TRELLIS", 6.5, '#FFF7ED', '#9A3412'),
        ("ĐỢT 4: THỬ NGHIỆM", "Quét mã VietQR PayOS\nSoát vé Camera thực địa 150ms", 9.1, '#FAF5FF', '#581C87')
    ]
    for i, (title, sub, x, bg, border) in enumerate(stages):
        draw_clean_node(ax, x, 1.25, 2.2, 1.3, title, sub, bg=bg, border=border, lw=1.4)
        if i < 3:
            next_x = stages[i+1][2]
            draw_step_arrow(ax, x + 1.1, 1.25, next_x - 1.1, 1.25, step=str(i+1), label="")
            
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_3_khao_sat.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_1():
    """Hinh 2.1: Mo hinh chuyen doi giua he toa do cau 3D va anh phang Equirectangular 2D"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')
    
    cx, cy, R = 2.4, 2.0, 1.45
    # Qua cau to mau xanh slate sam nhe (#F1F5F9)
    circle = patches.Circle((cx, cy), R, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.6, zorder=2)
    ax.add_patch(circle)
    
    eq = patches.Arc((cx, cy), 2*R, 0.75, angle=0, theta1=0, theta2=360, color=C_LINE_DARK, lw=1.4, zorder=3)
    ax.add_patch(eq)
    lat_pos = patches.Arc((cx, cy + 0.65), 2*R*0.75, 0.45, angle=0, theta1=0, theta2=360, color=C_MUTED_TEXT, lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_pos)
    lat_neg = patches.Arc((cx, cy - 0.65), 2*R*0.75, 0.45, angle=0, theta1=0, theta2=360, color=C_MUTED_TEXT, lw=0.9, ls='--', zorder=3)
    ax.add_patch(lat_neg)
    
    mer0 = patches.Arc((cx, cy), 0.75, 2*R, angle=0, theta1=0, theta2=360, color=C_LINE_DARK, lw=1.2, zorder=3)
    ax.add_patch(mer0)
    mer1 = patches.Arc((cx, cy), 1.8, 2*R, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=0.8, ls=':', zorder=3)
    ax.add_patch(mer1)
    
    ax.annotate('', xy=(cx, cy + R + 0.35), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.2), zorder=4)
    ax.text(cx + 0.08, cy + R + 0.38, 'Z (Bắc)', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    ax.annotate('', xy=(cx + R + 0.35, cy), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.2), zorder=4)
    ax.text(cx + R + 0.38, cy - 0.05, 'Y', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    ax.annotate('', xy=(cx - 0.8, cy - 0.75), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.2), zorder=4)
    ax.text(cx - 0.95, cy - 0.85, 'X', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    ax.plot(cx, cy, 'o', color=C_LINE_DARK, markersize=4, zorder=5)
    ax.text(cx - 0.28, cy + 0.12, 'O(0,0,0)', fontsize=7.5, color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'), zorder=6)
    
    # Diem P to mau navy sam
    px, py = cx + 0.75, cy + 0.82
    ax.annotate('', xy=(px, py), xytext=(cx, cy), arrowprops=dict(arrowstyle='->', color=C_FILL_ACTOR, lw=1.6), zorder=5)
    ax.plot(px, py, 'o', color=C_FILL_ACTOR, markersize=6, zorder=6)
    ax.text(px + 0.1, py + 0.08, 'P(X, Y, Z)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    
    proj_x, proj_y = cx + 0.75, cy + 0.12
    ax.plot([px, proj_x], [py, proj_y], color=C_MUTED_TEXT, ls='--', lw=0.9, zorder=4)
    ax.plot([cx, proj_x], [cy, proj_y], color=C_MUTED_TEXT, ls='--', lw=0.9, zorder=4)
    ax.plot(proj_x, proj_y, 'o', color=C_MUTED_TEXT, markersize=3, zorder=5)
    
    ax.text(cx + 0.45, cy + 0.04, r'$\theta$', fontsize=9, fontweight='bold', color=C_DARK_TEXT, zorder=6)
    ax.text(cx + 0.35, cy + 0.48, r'$\phi$', fontsize=9, fontweight='bold', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'), zorder=6)
    
    ax.text(cx, cy - R - 0.32, 'Mặt cầu 3D đơn vị ($X^2 + Y^2 + Z^2 = 1$)\nTọa độ góc $(\theta, \\phi)$',
            ha='center', va='top', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    # Formulations
    ax.annotate('', xy=(5.9, 2.5), xytext=(4.4, 2.5), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.4), zorder=5)
    ax.text(5.15, 2.65, 'Chiếu góc (2.1 - 2.2)\n' + r'$\theta = \arctan2(X, -Z)$' + '\n' + r'$\phi = \arcsin(Y)$',
            ha='center', va='bottom', fontsize=7.2, color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#93C5FD', lw=0.7))
    
    ax.annotate('', xy=(4.4, 1.4), xytext=(5.9, 1.4), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.4), zorder=5)
    ax.text(5.15, 1.25, 'Chiếu ngược (2.3 - 2.4)\n$X = -\\cos\\phi\\sin\theta$\n$Y = \\sin\\phi, Z = -\\cos\\phi\\cos\theta$',
            ha='center', va='top', fontsize=7.2, color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#F0FDF4', edgecolor='#86EFAC', lw=0.7))
    
    # 2D Canvas
    rx, ry, rw, rh = 6.4, 1.15, 3.6, 1.8
    rect = patches.Rectangle((rx, ry), rw, rh, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.6, zorder=2)
    ax.add_patch(rect)
    
    for i in range(1, 4):
        gy = ry + i * (rh / 4)
        ax.plot([rx, rx + rw], [gy, gy], color='#E2E8F0', lw=0.7, ls=':', zorder=3)
    for j in range(1, 8):
        gx = rx + j * (rw / 8)
        ax.plot([gx, gx], [ry, ry + rh], color='#E2E8F0', lw=0.7, ls=':', zorder=3)
    ax.plot([rx, rx + rw], [ry + rh/2, ry + rh/2], color=C_LINE_DARK, lw=1.2, ls='--', zorder=3)
    ax.text(rx + rw + 0.08, ry + rh/2, r'$\phi = 0$', fontsize=7.2, va='center', color=C_DARK_TEXT)
    
    pix_x = rx + 0.65 * rw
    pix_y = ry + 0.72 * rh
    ax.plot(pix_x, pix_y, 'o', color=C_FILL_ACTOR, markersize=6, zorder=6)
    ax.text(pix_x + 0.1, pix_y + 0.08, 'p(x, y)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.plot([rx, pix_x], [pix_y, pix_y], color=C_MUTED_TEXT, ls=':', lw=0.7)
    ax.plot([pix_x, pix_x], [ry + rh, pix_y], color=C_MUTED_TEXT, ls=':', lw=0.7)
    
    ax.text(rx, ry + rh + 0.06, '(0, 0)', fontsize=7, color=C_MUTED_TEXT)
    ax.text(rx + rw, ry + rh + 0.06, '(W, 0)', fontsize=7, ha='right', color=C_MUTED_TEXT)
    ax.text(rx + rw/2, ry + rh + 0.10, r'Cực Bắc ($\phi = +\pi/2$)', fontsize=7.2, ha='center', color=C_DARK_TEXT)
    ax.text(rx + rw/2, ry - 0.22, r'Cực Nam ($\phi = -\pi/2$)', fontsize=7.2, ha='center', color=C_DARK_TEXT)
    
    ax.text(rx + rw/2, ry - 0.45, 'Ảnh phẳng Equirectangular ($W \\times H$, tỷ lệ 2:1)\n$x = (\theta + \\pi) / (2\\pi) \\cdot W, \\quad y = (\\pi/2 - \\phi) / \\pi \\cdot H$',
            ha='center', va='top', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_2():
    """Hinh 2.2: Quy trinh nan chinh bien dang hinh hoc tru (Cylindrical Warping) - Toi gian, khong de chu, khong hop mau me"""
    fig, ax = plt.subplots(figsize=(11.0, 4.6), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.6); ax.axis('off')
    
    # Left: Geometry diagram (0.5 to 5.2)
    ax.text(2.8, 4.35, 'HÌNH HỌC PHÉP CHIẾU MẶT TRỤ (CYLINDRICAL PROJECTION)',
            fontsize=8.0, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    cam_x, cam_y = 1.0, 2.2
    f = 2.6
    
    # Tam camera C
    ax.plot(cam_x, cam_y, 'o', color=C_LINE_DARK, markersize=6, zorder=6)
    ax.text(cam_x - 0.15, cam_y, 'C (Tâm quang học)', fontsize=7.8, fontweight='bold', ha='right', va='center', color=C_DARK_TEXT)
    
    # Truc quang hoc (optical axis)
    ax.plot([cam_x, cam_x + f + 1.2], [cam_y, cam_y], color='#64748B', ls='--', lw=1.0, zorder=2)
    ax.text(cam_x + 1.3, cam_y - 0.20, f'Trục quang học (Tiêu cự f = {f})', fontsize=7.2, color='#475569', ha='center',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'))
            
    # Mat phang cam bien (Sensor Plane)
    sensor_x = cam_x + f
    ax.plot([sensor_x, sensor_x], [cam_y - 1.6, cam_y + 1.6], color=C_LINE_DARK, lw=1.8, zorder=3)
    ax.text(sensor_x, cam_y + 1.85, 'Mặt phẳng cảm biến (Ảnh phẳng)\n$x_p \in [-W/2, W/2]$',
            fontsize=7.5, fontweight='bold', ha='center', va='bottom', color=C_DARK_TEXT)
            
    # Mat tru (Cylindrical Surface)
    theta_arc = np.linspace(-np.pi/3.8, np.pi/3.8, 100)
    arc_x = cam_x + f * np.cos(theta_arc)
    arc_y = cam_y + f * np.sin(theta_arc)
    ax.plot(arc_x, arc_y, color='#1E40AF', lw=2.2, zorder=4)
    ax.text(arc_x[0] + 0.15, arc_y[0] - 0.15, 'Mặt trụ bán kính f\n$x_{cyl} = f \cdot \theta$',
            fontsize=7.5, fontweight='bold', ha='left', va='top', color='#1E40AF')
            
    # Ray 1: goc tren
    theta1 = 0.42
    ray1_len = f / np.cos(theta1) + 0.5
    r1_end_x = cam_x + ray1_len * np.cos(theta1)
    r1_end_y = cam_y + ray1_len * np.sin(theta1)
    ax.plot([cam_x, r1_end_x], [cam_y, r1_end_y], color='#1E3A8A', lw=1.2, zorder=3)
    
    # Diem tren sensor
    p1_x = sensor_x
    p1_y = cam_y + f * np.tan(theta1)
    ax.plot(p1_x, p1_y, 'o', color=C_LINE_DARK, markersize=5, zorder=6)
    ax.text(p1_x - 0.15, p1_y + 0.18, '$p(x_p, y_p)$', fontsize=8.0, fontweight='bold', ha='right', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))
            
    # Diem tren mat tru
    cyl1_x = cam_x + f * np.cos(theta1)
    cyl1_y = cam_y + f * np.sin(theta1)
    ax.plot(cyl1_x, cyl1_y, 'o', color='#1E40AF', markersize=6, zorder=6)
    ax.text(cyl1_x + 0.15, cyl1_y + 0.18, '$p_{cyl}(x_{cyl}, y_{cyl})$', fontsize=8.0, fontweight='bold', ha='left', color='#1E40AF',
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))
            
    # Ray 2: goc duoi
    theta2 = -0.38
    ray2_len = f / np.cos(theta2) + 0.5
    r2_end_x = cam_x + ray2_len * np.cos(theta2)
    r2_end_y = cam_y + ray2_len * np.sin(theta2)
    ax.plot([cam_x, r2_end_x], [cam_y, r2_end_y], color='#1E3A8A', lw=1.2, zorder=3)
    
    p2_x = sensor_x
    p2_y = cam_y + f * np.tan(theta2)
    ax.plot(p2_x, p2_y, 'o', color=C_LINE_DARK, markersize=5, zorder=6)
    
    cyl2_x = cam_x + f * np.cos(theta2)
    cyl2_y = cam_y + f * np.sin(theta2)
    ax.plot(cyl2_x, cyl2_y, 'o', color='#1E40AF', markersize=6, zorder=6)
    
    # Goc theta
    arc_ang = patches.Arc((cam_x, cam_y), 1.4, 1.4, angle=0, theta1=0, theta2=np.degrees(theta1), color=C_LINE_DARK, lw=1.1)
    ax.add_patch(arc_ang)
    ax.text(cam_x + 0.85, cam_y + 0.16, r'$\theta$', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)

    # Duong phan cach doc
    ax.plot([5.5, 5.5], [0.3, 4.3], color='#CBD5E1', ls=':', lw=1.0)

    # Right: Cong thuc & Minh hoa bien dang (5.8 to 10.6)
    ax.text(8.2, 4.35, 'CÔNG THỨC TOÁN HỌC & HIỆU QUẢ TRIỆT TIÊU BIẾN DẠNG',
            fontsize=8.0, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    # Khung cong thuc thanh lich (Nen trang, vien xam)
    fb = patches.FancyBboxPatch((5.8, 2.7), 4.8, 1.4, boxstyle='round,pad=0.03,rounding_size=0.06',
                                facecolor='#F8FAFC', edgecolor='#334155', lw=1.1, zorder=3)
    ax.add_patch(fb)
    ax.text(8.2, 3.85, 'HỆ PHÉP CHIẾU TOÁN HỌC (CÔNG THỨC 2.5 – 2.8)', fontsize=7.5, fontweight='bold', ha='center', color=C_DARK_TEXT)
    ax.text(8.2, 3.42, r'$x_{cyl} = f \cdot \arctan(x_p / f) + W/2$', fontsize=8.2, ha='center', color=C_DARK_TEXT)
    ax.text(8.2, 3.02, r'$y_{cyl} = f \cdot y_p / \sqrt{x_p^2 + f^2} + H/2$', fontsize=8.2, ha='center', color=C_DARK_TEXT)
    ax.text(8.2, 2.78, '(Nội suy mức xám Bilinear 4 điểm lân cận để bảo toàn độ sắc nét)', fontsize=6.8, fontstyle='italic', ha='center', color='#475569')

    # 2 hop so sanh anh phang vs anh nan tru
    # Box 1: Anh phang goc
    f1 = patches.Polygon([[6.0, 0.7], [7.8, 0.7], [8.0, 2.1], [5.8, 2.1]], facecolor='#FFFFFF', edgecolor='#475569', lw=1.2, zorder=4)
    ax.add_patch(f1)
    ax.text(6.9, 2.3, '1. Ảnh phẳng gốc (Chưa nắn)', fontsize=7.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    # Ve 2 cot bi choai
    ax.plot([6.3, 6.1], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.plot([7.5, 7.7], [0.7, 2.1], color='#94A3B8', ls='--', lw=1.0)
    ax.text(6.9, 1.4, 'Biến dạng phối cảnh\n(Mép cột bị choãi xiên)', ha='center', va='center', fontsize=6.8, color='#475569')

    # Box 2: Anh da nan tru
    curve_x = np.linspace(8.6, 10.6, 40)
    top_y = 2.1 - 0.10 * (1 - ((curve_x - 9.6)/1.0)**2)
    bot_y = 0.7 + 0.10 * (1 - ((curve_x - 9.6)/1.0)**2)
    verts = list(zip(curve_x, top_y)) + list(zip(curve_x[::-1], bot_y[::-1]))
    f2 = patches.Polygon(verts, facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.4, zorder=4)
    ax.add_patch(f2)
    ax.text(9.6, 2.3, '2. Ảnh đã nắn mặt trụ', fontsize=7.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    # Ve 2 cot thang dung
    ax.plot([8.9, 8.9], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.plot([10.3, 10.3], [0.8, 2.0], color='#166534', ls='-', lw=1.2)
    ax.text(9.6, 1.4, 'Cột bảo toàn 90° đứng\nSẵn sàng ghép mí', ha='center', va='center', fontsize=6.8, fontweight='bold', color=C_DARK_TEXT)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_2_cylindrical_warping.png"), bbox_inches='tight')
    plt.close(fig)
def gen_fig_2_3():
    """Hinh 2.3: Thap khong gian ty le Gauss, sai phan DoG va phat hien cuc tri 26 diem lan can"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    ax.text(2.6, 3.95, 'THÁP GAUSS L(x, y, σ) & SAI PHÂN DoG D(x, y, σ)', fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    def draw_plane(x, y, w, h, slant, color, border, label=''):
        pts = [[x, y], [x + w, y], [x + w + slant, y + h], [x + slant, y + h]]
        p = patches.Polygon(pts, facecolor=color, edgecolor=border, lw=1.1, zorder=3)
        ax.add_patch(p)
        if label:
            ax.text(x + w/2 + slant/2, y + h/2, label, ha='center', va='center', fontsize=6.8, color=C_DARK_TEXT, zorder=4)
            
    sigmas = ['σ', 'kσ', 'k²σ', 'k³σ']
    g_fills = ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD']
    for i in range(4):
        draw_plane(0.8, 0.35 + i*0.42, 1.8, 0.32, 0.4, g_fills[i], '#1E3A8A', f'L(x,y,{sigmas[i]})')
    ax.text(0.6, 1.0, 'Octave 1\n(W × H)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, ha='right')
    
    for i in range(3):
        ax.annotate('', xy=(3.4, 0.60 + i*0.42), xytext=(2.9, 0.60 + i*0.42),
                    arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.0), zorder=4)
        draw_plane(3.5, 0.45 + i*0.42, 1.6, 0.30, 0.35, '#FEF3C7', '#B45309', f'DoG {i+1}')
    ax.text(5.8, 0.85, 'DoG Octave 1\n' + r'$D = L_{i+1} - L_i$', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'), zorder=5)
    
    for i in range(3):
        draw_plane(1.1, 2.2 + i*0.38, 1.2, 0.24, 0.28, g_fills[i], '#1E3A8A', f'O2-{i+1}')
    ax.text(0.9, 2.7, 'Octave 2\n(W/2 × H/2)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, ha='right')
    
    ax.annotate('', xy=(1.7, 2.15), xytext=(1.7, 1.85),
                arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.2, ls=':'), zorder=5)
    ax.text(1.85, 2.0, 'Giảm mẫu /2', fontsize=6.8, color=C_MUTED_TEXT)
    
    # Cube extrema detection
    ax.text(8.2, 3.95, 'TÌM CỰC TRỊ KHÔNG GIAN TỶ LỆ (26 ĐIỂM LÂN CẬN)', fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    scales = [('Mức tỷ lệ σ_i+1 (9 điểm lân cận trên)', 2.7, '#F1F5F9', '#334155'),
              ('Mức tỷ lệ σ_i (8 lân cận + điểm xét X)', 1.5, '#EFF6FF', '#1E3A8A'),
              ('Mức tỷ lệ σ_i-1 (9 điểm lân cận dưới)', 0.3, '#F1F5F9', '#334155')]
              
    for title, base_y, fcolor, bcolor in scales:
        pw, ph, ps = 2.4, 0.8, 0.6
        px = 7.0
        draw_plane(px, base_y, pw, ph, ps, fcolor, bcolor)
        ax.text(px + pw + ps + 0.15, base_y + ph/2, title, fontsize=7.2, color=C_DARK_TEXT, fontweight='bold', va='center')
        
        for row in range(3):
            for col in range(3):
                gx = px + 0.3 + col * (pw - 0.6)/2 + row * (ps / 2)
                gy = base_y + 0.15 + row * (ph - 0.3)/2
                if base_y == 1.5 and row == 1 and col == 1:
                    ax.plot(gx, gy, 'x', color='#991B1B', markersize=8, mew=2.4, zorder=6)
                    ax.text(gx + 0.18, gy + 0.18, 'X (Xét cực trị)', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT,
                            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'), zorder=7)
                else:
                    ax.plot(gx, gy, 'o', color=C_FILL_SERVER, markersize=4.0, zorder=5)
                    
    ax.annotate('', xy=(7.9, 2.1), xytext=(7.9, 2.5), arrowprops=dict(arrowstyle='<->', color=C_LINE_DARK, lw=1.2), zorder=6)
    ax.annotate('', xy=(7.9, 1.3), xytext=(7.9, 0.9), arrowprops=dict(arrowstyle='<->', color=C_LINE_DARK, lw=1.2), zorder=6)
    ax.text(6.8, 0.05, 'Điều kiện: Điểm X là cực trị so với toàn bộ 26 điểm lân cận trong khối 3×3×3',
            fontsize=7.5, fontweight='bold', color=C_DARK_TEXT)
            
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_3_dog_sift.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_4():
    """Hinh 2.4: So khop dac trung SIFT va loai bo ngoai lai (Outliers) bang thuat toan RANSAC"""
    fig, ax = plt.subplots(figsize=(10.5, 4.3), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.3); ax.axis('off')
    
    fw, fh = 3.8, 2.3
    f1_x, f1_y = 0.8, 1.05
    rect1 = patches.FancyBboxPatch((f1_x, f1_y), fw, fh, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.4, zorder=2)
    ax.add_patch(rect1)
    ax.text(f1_x + fw/2, f1_y + fh - 0.22, 'Khung ảnh 1: $I_1(x, y)$ (Góc nhìn trái)',
            fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    # Co vat dong thau to mau amber/bronze sam nha nhan
    vase1 = patches.Ellipse((f1_x + fw/2 - 0.2, f1_y + fh/2 - 0.15), 1.6, 1.6, facecolor='#E2E8F0', edgecolor='#64748B', lw=1.2, zorder=3)
    ax.add_patch(vase1)
    
    f2_x, f2_y = 5.9, 1.05
    rect2 = patches.FancyBboxPatch((f2_x, f2_y), fw, fh, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.4, zorder=2)
    ax.add_patch(rect2)
    ax.text(f2_x + fw/2, f2_y + fh - 0.22, 'Khung ảnh 2: $I_2(x\', y\')$ (Góc nhìn phải)',
            fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    vase2 = patches.Ellipse((f2_x + fw/2 + 0.2, f2_y + fh/2 - 0.15), 1.6, 1.6, facecolor='#E2E8F0', edgecolor='#64748B', lw=1.2, zorder=3)
    ax.add_patch(vase2)
    
    inliers = [
        ((f1_x + 1.2, f1_y + 1.7), (f2_x + 1.6, f2_y + 1.7)),
        ((f1_x + 2.1, f1_y + 1.9), (f2_x + 2.5, f2_y + 1.9)),
        ((f1_x + 1.7, f1_y + 1.3), (f2_x + 2.1, f2_y + 1.3)),
        ((f1_x + 2.4, f1_y + 1.1), (f2_x + 2.8, f2_y + 1.1)),
        ((f1_x + 1.1, f1_y + 0.7), (f2_x + 1.5, f2_y + 0.7)),
        ((f1_x + 2.6, f1_y + 0.5), (f2_x + 3.0, f2_y + 0.5)),
    ]
    for pt1, pt2 in inliers:
        ax.plot(pt1[0], pt1[1], 'o', color=C_LINE_DARK, markersize=4.5, zorder=5)
        ax.plot(pt2[0], pt2[1], 'o', color=C_LINE_DARK, markersize=4.5, zorder=5)
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='#166534', lw=1.5, alpha=0.9, zorder=4)
        
    outliers = [
        ((f1_x + 3.2, f1_y + 2.0), (f2_x + 0.8, f2_y + 0.4)),
        ((f1_x + 0.6, f1_y + 1.9), (f2_x + 3.4, f2_y + 1.8)),
    ]
    for pt1, pt2 in outliers:
        ax.plot(pt1[0], pt1[1], 's', color='#991B1B', markersize=4.5, zorder=5)
        ax.plot(pt2[0], pt2[1], 's', color='#991B1B', markersize=4.5, zorder=5)
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='#991B1B', lw=1.2, ls='--', alpha=0.8, zorder=4)
        mx, my = (pt1[0] + pt2[0])/2, (pt1[1] + pt2[1])/2
        ax.plot(mx, my, 'x', color='#991B1B', markersize=7, mew=2.0, zorder=6)
        
    ax.plot([1.2, 1.6], [0.55, 0.55], color='#166534', lw=2.0)
    ax.plot(1.4, 0.55, 'o', color=C_LINE_DARK, markersize=4.5)
    ax.text(1.8, 0.55, r'Cặp điểm Inlier chuẩn xác (Đạt ngưỡng RANSAC: $\|p_2 - H p_1\| < 3.0$ pixel)',
            fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, va='center')
            
    ax.plot([1.2, 1.6], [0.22, 0.22], color='#991B1B', lw=1.3, ls='--')
    ax.plot(1.4, 0.22, 'x', color='#991B1B', markersize=6, mew=1.6)
    ax.text(1.8, 0.22, 'Ngoại lai Outlier bị RANSAC triệt tiêu (Sai lệch do phản chiếu tủ kính / đèn)',
            fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, va='center')
            
    ax.text(5.25, 3.65, 'Ước lượng ma trận\nHomography H\n' + r'$p_2 \sim H \cdot p_1$',
            ha='center', va='center', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#1E3A8A', lw=1.0), zorder=8)
            
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_4_ransac.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_5():
    """Hinh 2.5: Toi uu duong cat mi Voronoi va hoa tron da dai tan (Multiband Blending)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')
    
    ax.text(5.25, 3.85, 'TÌM ĐƯỜNG GHÉP MÍ TỐI ƯU TRÁNH CẮT QUA HIỆN VẬT (VORONOI SEAM CUTTING)',
            fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    f1 = patches.Rectangle((1.0, 2.1), 4.2, 1.5, facecolor='#EFF6FF', edgecolor='#1E3A8A', lw=1.3, zorder=2)
    f2 = patches.Rectangle((3.6, 2.1), 4.2, 1.5, facecolor='#F0FDF4', edgecolor='#166534', lw=1.3, zorder=2)
    ax.add_patch(f1); ax.add_patch(f2)
    
    ax.text(2.2, 2.25, 'Ảnh 1 (Bên trái)', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT)
    ax.text(6.4, 2.25, 'Ảnh 2 (Bên phải)', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT)
    ax.text(4.4, 3.45, 'Vùng chồng lấp (40%)', fontsize=7.2, ha='center', color=C_MUTED_TEXT)
    
    artifact = patches.Circle((4.2, 2.85), 0.30, facecolor='#CBD5E1', edgecolor=C_LINE_DARK, lw=1.2, zorder=3)
    ax.add_patch(artifact)
    ax.text(4.2, 2.85, 'Cổ vật', fontsize=6.8, ha='center', va='center', color=C_DARK_TEXT, zorder=4)
    
    ax.plot([4.2, 4.2], [2.1, 3.6], color='#991B1B', ls='--', lw=1.3, zorder=4)
    ax.text(4.2, 1.95, 'Đường cắt thẳng (Lỗi cắt đôi hiện vật)', fontsize=6.8, ha='center', color=C_DARK_TEXT)
    
    seam_y = np.linspace(2.1, 3.6, 100)
    seam_x = 4.8 + 0.35 * np.sin((seam_y - 2.1)*np.pi/1.5)
    ax.plot(seam_x, seam_y, color='#15803D', lw=2.4, zorder=5)
    ax.text(5.3, 2.85, 'Đường cắt tối ưu\n(Né tránh cổ vật)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT)
    
    # Bottom Multiband
    ax.text(5.25, 1.65, 'HÒA TRỘN ĐA DẢI TẦN SỐ (MULTIBAND LAPLACIAN BLENDING)',
            fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    ax.text(1.2, 1.25, 'Tần số cao (Chi tiết nét):', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT)
    ax.plot([3.5, 4.6], [1.25, 1.25], color='#1E3A8A', lw=1.5)
    ax.plot([4.6, 5.0], [1.25, 1.25], color='#15803D', lw=2.4)
    ax.plot([5.0, 6.1], [1.25, 1.25], color='#1E3A8A', lw=1.5)
    ax.text(7.2, 1.25, 'Cửa sổ hòa trộn hẹp (Khử bóng mờ Ghosting)', fontsize=7.2, color=C_MUTED_TEXT)
    
    ax.text(1.2, 0.75, 'Tần số thấp (Ánh sáng/Màu):', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT)
    ax.plot([3.5, 4.0], [0.75, 0.75], color='#1E3A8A', lw=1.5)
    trans_x = np.linspace(4.0, 5.6, 50)
    trans_y = np.full_like(trans_x, 0.75)
    ax.plot(trans_x, trans_y, color='#B45309', lw=2.8)
    ax.plot([5.6, 6.1], [0.75, 0.75], color='#1E3A8A', lw=1.5)
    ax.text(7.2, 0.75, 'Cửa sổ hòa trộn rộng (Khử chênh lệch ánh sáng)', fontsize=7.2, color=C_MUTED_TEXT)
    
    ax.text(5.25, 0.20, 'Kết quả: Bức ảnh Panorama 360° đồng nhất 100% về độ sáng, không có vết nứt hay bóng ma tại mối nối',
            fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)
            
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_5_seam_blending.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_6():
    """Hinh 2.6: Nguyen ly anh xa Texture Panorama len mat cau 3D va Hotspot trong Three.js (Pipeline toi gian)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')

    cx, cy, R = 2.7, 2.0, 1.55
    # Mat cau slate sam tram (#1E293B)
    sphere = patches.Circle((cx, cy), R, facecolor='#1E293B', edgecolor=C_LINE_DARK, lw=1.8, zorder=2)
    ax.add_patch(sphere)

    for y_off in [-0.85, -0.45, 0.0, 0.45, 0.85]:
        r_lat = np.sqrt(max(0.05, R**2 - y_off**2))
        ls = '-' if y_off == 0.0 else '--'
        lw = 1.3 if y_off == 0.0 else 0.8
        col = '#38BDF8' if y_off == 0.0 else '#64748B'
        arc = patches.Arc((cx, cy + y_off), 2*r_lat, 0.45, angle=0, theta1=0, theta2=360,
                          color=col, lw=lw, ls=ls, zorder=3)
        ax.add_patch(arc)

    for w_mer in [0.7, 1.5, 2.3]:
        arc = patches.Arc((cx, cy), w_mer, 2*R, angle=0, theta1=0, theta2=360,
                          color='#475569', lw=0.8, ls=':', zorder=3)
        ax.add_patch(arc)

    # Camera tai goc toa do
    ax.plot(cx, cy, 'o', color='#F59E0B', markersize=6.5, zorder=6)
    ax.annotate('Camera O(0,0,0)\nPerspectiveCamera', xy=(cx, cy), xytext=(cx - 1.5, cy + 1.1),
                arrowprops=dict(arrowstyle='->', color='#94A3B8', lw=1.2),
                fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, ha='right', va='center',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8), zorder=7)

    # Vung nhin va Hotspot
    cone_target_x, cone_target_y = cx + R*0.72, cy + R*0.58
    cone_pts = [[cx, cy], [cx + 1.45, cy + 0.35], [cx + 1.15, cy + 1.35]]
    cone = patches.Polygon(cone_pts, facecolor='#FEF3C7', edgecolor='#D97706', lw=1.0, alpha=0.35, zorder=4)
    ax.add_patch(cone)

    ax.annotate('', xy=(cone_target_x, cone_target_y), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.6), zorder=5)

    ax.plot(cone_target_x, cone_target_y, 'o', color='#DC2626', markersize=7, zorder=7)
    hotspot_ring = patches.Circle((cone_target_x, cone_target_y), 0.16, facecolor='none', edgecolor='#DC2626', lw=1.4, ls='--', zorder=7)
    ax.add_patch(hotspot_ring)

    ax.annotate('Hotspot Cổ vật\n$P_h(X_h, Y_h, Z_h)$', xy=(cone_target_x, cone_target_y), xytext=(cx + 1.6, cy + 1.3),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.2),
                fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, ha='left', va='center',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.8), zorder=8)

    ax.annotate('', xy=(cx + 0.9, cy - 1.1), xytext=(cx - 0.9, cy - 1.1),
                arrowprops=dict(arrowstyle='<->', color='#10B981', lw=1.5, connectionstyle='arc3,rad=-0.25'), zorder=5)
    ax.text(cx, cy - 1.5, 'Điều khiển góc xoay (Yaw θ & Pitch φ) qua OrbitControls',
            fontsize=7.5, ha='center', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'), zorder=6)

    # Right side: WebGL Pipeline (Clean minimal technical workflow)
    ax.text(7.6, 3.8, 'QUY TRÌNH KẾT XUẤT ĐỒ HỌA THREE.JS', fontsize=8.2, fontweight='bold', ha='center', color='#0F172A')

    steps = [
        ('1. KHỞI TẠO LƯỚI CẦU NGHỊCH ĐẢO',
         '• MeshSphereGeometry(R=500, wSeg=60, hSeg=40)\n• geometry.scale(-1, 1, 1) lật mặt pháp tuyến vào trong',
         3.05, '#F8FAFC', '#1E3A8A'),
        ('2. NẠP TEXTURE VÀ QUẢN LÝ BỘ NHỚ',
         '• TextureLoader nạp ảnh toàn cảnh 8K (WebP)\n• texture.dispose() khi đổi phòng triệt tiêu rò rỉ VRAM',
         1.95, '#F8FAFC', '#166534'),
        ('3. BẮT TƯƠNG TÁC TIA NHÌN (RAYCASTING)',
         '• Raycaster tính giao điểm tọa độ chuột với mặt cầu\n• Kích hoạt Pop-up cổ vật 3D & giọng đọc Voice AI',
         0.85, '#F8FAFC', '#C2410C')
    ]

    for title, desc, y_p, bg, border in steps:
        box = patches.FancyBboxPatch((5.2, y_p - 0.42), 4.8, 0.84, boxstyle='round,pad=0.03,rounding_size=0.06',
                                    facecolor=bg, edgecolor=border, lw=1.3, zorder=4)
        ax.add_patch(box)
        ax.text(5.4, y_p + 0.22, title, fontsize=7.8, fontweight='bold', color=border, zorder=5)
        ax.text(5.4, y_p - 0.18, desc, fontsize=7.2, color='#334155', linespacing=1.2, zorder=5)

    # Arrows between steps
    ax.annotate('', xy=(7.6, 2.5), xytext=(7.6, 2.63), arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.3))
    ax.annotate('', xy=(7.6, 1.4), xytext=(7.6, 1.53), arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.3))

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_6_texture_mapping.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_7():
    """Hinh 2.7: Do thi topo 18 phong bao tang va giai thuat Dijkstra tim duong di ngan nhat"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    garden = patches.FancyBboxPatch((3.2, 1.15), 4.2, 1.9, boxstyle='round,pad=0.04,rounding_size=0.15',
                                   facecolor='#F0FDF4', edgecolor='#166534', lw=1.4, ls='--', zorder=2)
    ax.add_patch(garden)
    ax.text(5.3, 2.50, 'SÂN VƯỜN TRUNG TÂM / GIẾNG TRỜI\n(Khuôn viên kiến trúc Đông Dương)',
            ha='center', va='center', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT)
            
    rooms = {
        'P01': (1.8, 0.55, 'P01: Tiền sử (Cổng vào)'),
        'P02': (3.6, 0.55, 'P02: Đông Sơn'),
        'P03': (5.3, 0.55, 'P03: Chân Lạp'),
        'P04': (7.0, 0.55, 'P04: Phù Nam'),
        'P05': (8.8, 0.55, 'P05: Cần Giờ'),
        'P06': (8.8, 1.55, 'P06: Gốm'),
        'P07': (8.8, 2.55, 'P07: Tượng'),
        'P08': (8.8, 3.55, 'P08: Triều Nguyễn'),
        'P09': (7.2, 3.65, 'P09: Tiền cổ'),
        'P10': (5.3, 3.65, 'P10: Chăm Pa (Bảo vật)'),
        'P11': (3.5, 3.65, 'P11: Óc Eo'),
        'P12': (1.8, 3.65, 'P12: Phật giáo'),
        'P13': (1.0, 3.05, 'P13: Vũ khí'),
        'P14': (1.0, 2.25, 'P14: Trang phục'),
        'P15': (1.0, 1.45, 'P15: Nhạc cụ'),
    }
    
    edges = [
        ('P01', 'P02', '12m'), ('P02', 'P03', '14m'), ('P03', 'P04', '15m'), ('P04', 'P05', '12m'),
        ('P05', 'P06', '10m'), ('P06', 'P07', '12m'), ('P07', 'P08', '14m'),
        ('P08', 'P09', '15m'), ('P09', 'P10', '16m'),
        ('P10', 'P11', '14m'), ('P11', 'P12', '15m'), ('P12', 'P13', '10m'),
        ('P13', 'P14', '11m'), ('P14', 'P15', '10m'), ('P15', 'P01', '12m'),
        ('P03', 'P10', '28m (Vườn)'),
    ]
    
    shortest_path_edges = [('P01', 'P15'), ('P15', 'P14'), ('P14', 'P13'), ('P13', 'P12'), ('P12', 'P11'), ('P11', 'P10')]
    
    for u, v, w in edges:
        p1, p2 = rooms[u], rooms[v]
        is_shortest = (u, v) in shortest_path_edges or (v, u) in shortest_path_edges
        if is_shortest:
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#1D4ED8', lw=3.0, zorder=3)
        else:
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#94A3B8', lw=1.2, ls='-', zorder=2)
        mx, my = (p1[0] + p2[0])/2, (p1[1] + p2[1])/2
        if u == 'P03' and v == 'P10':
            mx = 5.75; my = 3.0
        ax.text(mx, my, w, fontsize=6.5, ha='center', va='center', color=C_DARK_TEXT,
                bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)
                
    for code, (x, y, name) in rooms.items():
        is_path = any(code in edge for edge in shortest_path_edges) or code in ['P01', 'P10']
        bcol = '#1D4ED8' if is_path else C_LINE_DARK
        fcol = '#EFF6FF' if is_path else '#FFFFFF'
        
        node = patches.Circle((x, y), 0.26, facecolor=fcol, edgecolor=bcol, lw=1.6, zorder=5)
        ax.add_patch(node)
        ax.text(x, y, code, ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=6)
        
    ax.plot(rooms['P01'][0], rooms['P01'][1] - 0.35, '^', color='#1D4ED8', markersize=8, zorder=7)
    ax.text(rooms['P01'][0], rooms['P01'][1] - 0.48, 'XUẤT PHÁT (P01)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, ha='center')
    
    ax.plot(rooms['P10'][0], rooms['P10'][1] + 0.35, 'v', color='#1D4ED8', markersize=8, zorder=7)
    ax.text(rooms['P10'][0], rooms['P10'][1] + 0.48, 'ĐÍCH ĐẾN (P10: Bảo vật)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, ha='center')
    
    dijk_box = patches.FancyBboxPatch((3.4, 1.25), 3.8, 0.75, boxstyle='round,pad=0.03,rounding_size=0.06',
                                       facecolor='#FFFFFF', edgecolor='#1D4ED8', lw=1.3, zorder=6)
    ax.add_patch(dijk_box)
    ax.text(5.3, 1.72, 'LỘ TRÌNH TỐI ƯU DIJKSTRA', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, ha='center', va='center', zorder=8)
    ax.text(5.3, 1.48, 'P01 -> P15 -> P14 -> P13 -> P12 -> P11 -> P10\nTổng cự ly: 72 mét | Thời gian đi bộ: ~55 giây',
            fontsize=6.8, color=C_MUTED_TEXT, ha='center', va='center', linespacing=1.25, zorder=8)
            
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_8():
    """Hinh 2.8: Nguyen ly tai tao mo hinh 3D bang cong nghe Photogrammetry"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')
    
    cx, cy = 2.4, 2.0
    artifact = patches.Ellipse((cx, cy), 0.9, 1.4, facecolor='#E2E8F0', edgecolor=C_LINE_DARK, lw=1.4, zorder=3)
    ax.add_patch(artifact)
    ax.text(cx, cy, 'Hiện vật\nCổ', ha='center', va='center', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, zorder=4)
    
    orbit = patches.Circle((cx, cy), 1.55, facecolor='none', edgecolor='#94A3B8', lw=1.0, ls='--', zorder=2)
    ax.add_patch(orbit)
    
    angles = np.linspace(0, 2*np.pi, 8, endpoint=False)
    for idx, ang in enumerate(angles):
        cam_x = cx + 1.55 * np.cos(ang)
        cam_y = cy + 1.55 * np.sin(ang)
        c_rect = patches.Circle((cam_x, cam_y), 0.15, facecolor=C_FILL_ACTOR, edgecolor=C_LINE_DARK, lw=1.2, zorder=5)
        ax.add_patch(c_rect)
        ax.plot([cam_x, cx], [cam_y, cy], color='#DC2626', lw=0.7, ls=':', zorder=3)
    ax.text(cx, cy - 1.80, 'Quỹ đạo chụp 360° (36–72 góc chụp/vòng)\nĐộ chồng lấp giữa 2 ảnh liên tiếp ≥ 70%',
            ha='center', va='top', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT)
            
    stages = [
        ('1. BỘ ẢNH ĐA GÓC', '72 ảnh RGB độ phân giải 4K\nChụp vòng tròn đa góc độ', 5.6, 3.1, '#EFF6FF', '#1E3A8A'),
        ('2. ĐÁM MÂY ĐIỂM SfM', 'Trích xuất đặc trưng SIFT đa ảnh\nĐịnh vị camera & đám mây thưa', 8.8, 3.1, '#FEF3C7', '#B45309'),
        ('3. LƯỚI ĐA GIÁC MESH', 'Phát triển đám mây dày (MVS)\nTam giác hóa lưới Poisson Mesh', 5.6, 1.1, '#FFF7ED', '#C2410C'),
        ('4. DÁN KẾT CẤU & XUẤT GLB', 'Chiếu texture 4K & vật liệu PBR\nXuất tệp mô hình chuẩn .GLB', 8.8, 1.1, '#F0FDF4', '#166534')
    ]
    for title, desc, sx, sy, bg, border in stages:
        draw_clean_node(ax, sx, sy, 2.7, 1.1, title, desc, bg=bg, border=border, lw=1.3)
        
    draw_step_arrow(ax, 7.0, 3.1, 7.4, 3.1, step='1')
    draw_step_arrow(ax, 8.8, 2.5, 8.8, 1.7, step='2')
    draw_step_arrow(ax, 7.4, 1.1, 7.0, 1.1, step='3')
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_8_photogrammetry.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_9():
    """Hinh 2.9: Kien truc 3 tang (Three-tier Architecture) to mau sam"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    draw_device(ax, 1.2, 3.3, 1.0, 1.1, "Trình duyệt Web", "React 18 / Vite", kind="desktop")
    draw_device(ax, 1.2, 1.3, 0.9, 1.1, "Thiết bị Di động", "Mobile WebGL", kind="mobile")
    ax.text(1.2, 4.15, "TẦNG 1: TRÌNH DIỄN", fontsize=8.5, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    draw_server(ax, 4.5, 3.3, w=1.3, h=1.3, title="Nginx Reverse Proxy", sub="SSL / Static Cache")
    draw_server(ax, 4.5, 1.3, w=1.3, h=1.3, title="Backend REST API", sub="Node.js Express / Python")
    ax.text(4.5, 4.15, "TẦNG 2: NGHIỆP VỤ", fontsize=8.5, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    draw_database(ax, 8.8, 3.3, w=1.1, h=1.1, title="PostgreSQL 16", sub="Quan hệ & Vé AES", color=C_FILL_DB)
    draw_cloud(ax, 8.8, 1.3, w=1.8, h=1.1, title="PayOS / ZeroGPU", sub="Thanh toán & AI Sinh 3D")
    ax.text(8.8, 4.15, "TẦNG 3: DỮ LIỆU & DỊCH VỤ", fontsize=8.5, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    draw_step_arrow(ax, 2.0, 3.3, 3.6, 3.3, label="HTTPS / WSS")
    draw_step_arrow(ax, 2.0, 1.3, 3.6, 1.3, label="REST API")
    draw_step_arrow(ax, 4.5, 2.6, 4.5, 2.0, label="Reverse Proxy")
    draw_step_arrow(ax, 5.4, 3.3, 8.0, 3.3, label="SQL Connection")
    draw_step_arrow(ax, 5.4, 1.3, 7.8, 1.3, label="Webhook / REST API")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_10():
    """Hinh 2.10: Quy trinh xac thuc JWT (UML Sequence Diagram chuan chuyen nghiep)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    # 3 participants
    participants = [
        ('Trình duyệt Client\n(User / Admin)', 1.8),
        ('API Gateway / Auth\n(Node.js Express)', 5.2),
        ('Cơ sở dữ liệu\n(PostgreSQL 16)', 8.6)
    ]
    
    for title, x in participants:
        box = patches.FancyBboxPatch((x - 1.2, 3.7), 2.4, 0.55, boxstyle='round,pad=0.03,rounding_size=0.06',
                                    facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.4, zorder=4)
        ax.add_patch(box)
        ax.text(x, 3.97, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, zorder=5)
        
        # Lifeline
        ax.plot([x, x], [0.35, 3.7], color='#94A3B8', ls='--', lw=1.1, zorder=2)
        
    # Activation bars
    def add_activation(x, y_start, y_end):
        w = 0.16
        bar = patches.Rectangle((x - w/2, y_end), w, y_start - y_end, facecolor='#E2E8F0', edgecolor=C_LINE_DARK, lw=1.0, zorder=3)
        ax.add_patch(bar)
        
    add_activation(1.8, 3.4, 0.45)
    add_activation(5.2, 3.2, 1.8)
    add_activation(5.2, 1.3, 0.5)
    add_activation(8.6, 2.8, 2.3)
    
    # Messages
    msgs = [
        (1.8, 5.2, 3.2, '1. POST /api/auth/login (email, password)', False),
        (5.2, 8.6, 2.8, '2. SELECT * FROM users WHERE email = ?', False),
        (8.6, 5.2, 2.4, '3. Trả về bản ghi user & mật khẩu băm Bcrypt', True),
        (5.2, 1.8, 1.8, '4. Trả về JWT Access Token (24h) kèm HttpOnly Cookie', True),
        (1.8, 5.2, 1.3, '5. GET /api/rooms (Header: Authorization Bearer <token>)', False),
        (5.2, 1.8, 0.6, '6. Phản hồi dữ liệu 360° & cổ vật 3D (HTTP 200 OK)', True)
    ]
    
    for x1, x2, y, label, is_ret in msgs:
        ls = '--' if is_ret else '-'
        col = '#1E3A8A' if not is_ret else '#166534'
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=col, lw=1.3, ls=ls), zorder=5)
        mx = (x1 + x2) / 2
        ax.text(mx, y + 0.12, label, ha='center', va='bottom', fontsize=7.2, fontweight='bold', color='#1E293B',
                bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6, alpha=0.98), zorder=6)
                
    # Self loops for Gateway
    # Self loop 1: bcrypt & sign
    ax.plot([5.28, 5.75, 5.75, 5.28], [2.15, 2.15, 1.95, 1.95], color='#475569', lw=1.0, zorder=5)
    ax.annotate('', xy=(5.28, 1.95), xytext=(5.38, 1.95), arrowprops=dict(arrowstyle='->', color='#475569', lw=1.0))
    ax.text(5.82, 2.05, 'bcrypt.compare() &\njwt.sign(HMAC-SHA256)', ha='left', va='center', fontsize=6.8, color='#475569')
    
    # Self loop 2: verify
    ax.plot([5.28, 5.75, 5.75, 5.28], [1.05, 1.05, 0.85, 0.85], color='#475569', lw=1.0, zorder=5)
    ax.annotate('', xy=(5.28, 0.85), xytext=(5.38, 0.85), arrowprops=dict(arrowstyle='->', color='#475569', lw=1.0))
    ax.text(5.82, 0.95, 'Middleware jwt.verify() &\ngiải mã claims', ha='left', va='center', fontsize=6.8, color='#475569')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_10_jwt_auth.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_11():
    """Hinh 2.11: PayOS Payment Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 3.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.8); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.6, "Khách mua vé", "Web Browser", color=C_FILL_ACTOR)
    draw_server(ax, 3.8, 2.6, w=1.3, h=1.3, title="Backend Server", sub="Tạo Payment Link")
    draw_cloud(ax, 6.8, 2.6, w=1.6, h=1.0, title="Cổng PayOS", sub="VietQR Napas 247")
    draw_device(ax, 9.4, 2.6, 0.9, 1.1, "App Ngân hàng", "Quét VietQR", kind="mobile")
    
    draw_database(ax, 3.8, 0.7, w=1.0, h=0.9, title="Database", sub="Lưu vé đã thanh toán", color='#166534')
    
    draw_step_arrow(ax, 1.6, 2.9, 3.0, 2.9, step="1", label="Chọn vé & Đặt mua")
    draw_step_arrow(ax, 4.5, 2.9, 5.9, 2.9, step="2", label="Tạo link VietQR")
    draw_step_arrow(ax, 7.7, 2.9, 8.8, 2.9, step="3", label="Hiển thị mã QR")
    draw_step_arrow(ax, 9.4, 1.9, 7.6, 1.9, step="4", label="Chuyển khoản thành công")
    draw_step_arrow(ax, 6.0, 1.9, 4.5, 1.9, step="5", label="Webhook PayOS gọi lại")
    draw_step_arrow(ax, 3.8, 1.9, 3.8, 1.3, step="6", label="Cập nhật Vé PAID")
    draw_step_arrow(ax, 3.0, 2.2, 1.6, 2.2, step="7", label="SSE phát vé có mã QR")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_11_payos_flow.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_12():
    """Hinh 2.12: QR AES-256 Validation Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 3.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.0); ax.axis('off')
    
    draw_device(ax, 1.2, 1.5, 0.9, 1.1, "Vé trên Mobile", "QR Code AES-256", kind="mobile")
    draw_device(ax, 4.4, 1.5, 1.0, 1.1, "Camera Soát vé", "Html5Qrcode (Staff)", kind="mobile")
    draw_server(ax, 7.5, 1.5, w=1.3, h=1.3, title="Backend Server", sub="Giải mã AES & Hash")
    draw_database(ax, 9.8, 1.5, w=0.8, h=1.0, title="Vé DB", sub="Đổi USED", color=C_FILL_DB)
    
    draw_step_arrow(ax, 1.8, 1.5, 3.8, 1.5, step="1", label="Quét mã QR 150ms")
    draw_step_arrow(ax, 5.0, 1.5, 6.7, 1.5, step="2", label="POST /tickets/validate")
    draw_step_arrow(ax, 8.2, 1.5, 9.3, 1.5, step="3", label="Kiểm tra & Cập nhật")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_12_qr_validation.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_13():
    """Hinh 2.13: Docker Compose Architecture"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    host = patches.FancyBboxPatch((0.5, 0.3), 9.5, 3.6, boxstyle='round,pad=0.03,rounding_size=0.08',
                                 facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.6, zorder=1)
    ax.add_patch(host)
    ax.text(0.8, 3.65, "MÁY CHỦ CLOUD VPS UBUNTU 22.04 LTS (DOCKER COMPOSE NETWORK)", fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    
    draw_server(ax, 2.0, 1.9, w=1.6, h=1.7, title="Container: Nginx", sub="Reverse Proxy / SSL 443\nLet's Encrypt Certbot")
    draw_server(ax, 4.6, 1.9, w=1.6, h=1.7, title="Container: Web FE", sub="React 18 / Vite Build\nPort 80 (Internal)")
    draw_server(ax, 7.0, 1.9, w=1.6, h=1.7, title="Container: API BE", sub="Node.js Express REST\nPort 5000 (Internal)")
    draw_database(ax, 9.1, 1.9, w=1.0, h=1.2, title="PostgreSQL 16", sub="Port 5432 (Internal)", color=C_FILL_DB)
    
    draw_step_arrow(ax, 2.9, 2.1, 3.7, 2.1, label="/ (Web UI)")
    draw_step_arrow(ax, 2.9, 1.7, 6.1, 1.7, label="/api/*")
    draw_step_arrow(ax, 7.9, 1.9, 8.5, 1.9, label="pg pool")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_13_docker_compose.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_1():
    """Hinh 3.1: Use Case Tong Quat (UML Style to mau sam nha nhan)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    draw_actor(ax, 1.2, 3.5, "Khách tham quan", "Web / Mobile", color=C_FILL_ACTOR)
    draw_actor(ax, 1.2, 1.1, "Nhân viên soát vé", "Mobile Camera", color=C_FILL_SERVER)
    draw_actor(ax, 9.3, 2.3, "Quản trị viên CMS", "Desktop Web", color='#166534')
    
    ucs = [
        ("UC01: Khám phá Tour 360°", 3.8, 3.9),
        ("UC02: Tương tác Cổ vật 3D", 3.8, 3.2),
        ("UC03: Tìm đường Dijkstra", 3.8, 2.5),
        ("UC04: Mua vé & VietQR", 3.8, 1.8),
        ("UC05: Quét soát vé QR", 3.8, 1.0),
        ("UC06: Studio ghép ảnh 8K", 6.8, 3.6),
        ("UC07: Tái tạo 3D TRELLIS", 6.8, 2.8),
        ("UC08: Quản lý Hotspot & Cổ vật", 6.8, 2.0),
        ("UC09: Thống kê & Báo cáo", 6.8, 1.2)
    ]
    for name, x, y in ucs:
        el = patches.Ellipse((x, y), 2.3, 0.58, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.2, zorder=3)
        ax.add_patch(el)
        ax.text(x, y, name, ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=4)
        
    for i in range(4):
        ax.plot([1.6, 2.65], [3.5, ucs[i][2]], color=C_LINE_DARK, lw=1.1, zorder=2)
    ax.plot([1.6, 2.65], [1.1, ucs[4][2]], color=C_LINE_DARK, lw=1.1, zorder=2)
    for i in range(5, 9):
        ax.plot([8.8, 7.95], [2.3, ucs[i][2]], color=C_LINE_DARK, lw=1.1, zorder=2)
        
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_1_use_case_tong_quat.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_2():
    """Hinh 3.2: Use Case Phan he Khach tham quan (Visitor)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    ax.text(5.25, 4.65, 'SƠ ĐỒ USE CASE: PHÂN HỆ KHÁCH THAM QUAN (VISITOR SUBSYSTEM)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.38, 'Tập hợp các ca sử dụng phục vụ trải nghiệm tham quan ảo, tương tác di sản và đặt vé trực tuyến',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)
            
    draw_actor(ax, 1.2, 2.5, "Khách tham quan", "Web / Mobile", color=C_FILL_ACTOR)
    draw_actor(ax, 9.4, 1.7, "Hệ thống PayOS", "Cổng thanh toán", color=C_FILL_SERVER)
    
    col1_ucs = [
        ("UC05: Khám phá không gian Tour 360°", 3.9, 3.8),
        ("UC06: Chuyển phòng qua Hotspot", 3.9, 3.1),
        ("UC07: Chiêm ngưỡng cổ vật 3D", 3.9, 2.4),
        ("UC08: Nghe thuyết minh âm thanh (TTS)", 3.9, 1.7),
        ("UC09: Tìm đường liên thông Dijkstra", 3.9, 1.0)
    ]
    col2_ucs = [
        ("UC10: Trò chuyện Trợ lý Di sản AI", 6.9, 3.8),
        ("UC11: Đặt vé tham quan trực tuyến", 6.9, 3.1),
        ("UC12: Thanh toán vé VietQR PayOS", 6.9, 2.4),
        ("UC13: Tra cứu & Quét mã vé điện tử", 6.9, 1.7),
        ("UC23: Dịch thuật ngữ cảnh đa ngôn ngữ", 6.9, 1.0)
    ]
    
    for name, x, y in col1_ucs + col2_ucs:
        el = patches.Ellipse((x, y), 2.5, 0.52, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.2, zorder=3)
        ax.add_patch(el)
        ax.text(x, y, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=C_DARK_TEXT, zorder=4)
        
    for _, x, y in col1_ucs:
        ax.plot([1.6, x - 1.25], [2.5, y], color=C_LINE_DARK, lw=1.0, zorder=2)
    for _, x, y in col2_ucs:
        ax.plot([1.6, x - 1.25], [2.5, y], color=C_LINE_DARK, lw=1.0, linestyle=':', zorder=2)
        
    ax.plot([8.15, 8.95], [2.4, 1.7], color=C_LINE_DARK, lw=1.2, zorder=2)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_2_use_case_visitor.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_3():
    """Hinh 3.3: Use Case Phan he Quan tri vien (Admin)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    ax.text(5.25, 4.65, 'SƠ ĐỒ USE CASE: PHÂN HỆ QUẢN TRỊ VIÊN BẢO TÀNG (ADMIN CMS SUBSYSTEM)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.38, 'Quản lý kho dữ liệu di sản 360°, cổ vật 3D, vận hành bảo trì và giám sát hệ thống Grafana',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)
            
    draw_actor(ax, 1.2, 2.5, "Quản trị viên", "Admin CMS", color='#166534')
    draw_actor(ax, 9.4, 1.7, "Grafana Engine", "Observability", color=C_FILL_SERVER)
    
    col1_ucs = [
        ("UC15: Quản lý danh mục 18 phòng 360°", 3.9, 3.8),
        ("UC16: Cấu hình Hotspot liên kết phòng", 3.9, 3.1),
        ("UC17: Quản lý kho tư liệu cổ vật 3D", 3.9, 2.4),
        ("UC18: Quản lý phát hành vé & bảng giá", 3.9, 1.7),
        ("UC19: Quản lý đơn hàng & doanh thu", 3.9, 1.0)
    ]
    col2_ucs = [
        ("UC20: Quản lý người dùng & phân quyền", 6.9, 3.8),
        ("UC21: Nhận diện thương hiệu Đa bảo tàng", 6.9, 3.1),
        ("UC22: Vận hành & Chế độ bảo trì", 6.9, 2.4),
        ("UC24: Giám sát hệ thống qua Grafana", 6.9, 1.7),
        ("UC25: Cấu hình thuyết minh & Giọng AI", 6.9, 1.0)
    ]
    
    for name, x, y in col1_ucs + col2_ucs:
        el = patches.Ellipse((x, y), 2.5, 0.52, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.2, zorder=3)
        ax.add_patch(el)
        ax.text(x, y, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=C_DARK_TEXT, zorder=4)
        
    for _, x, y in col1_ucs:
        ax.plot([1.6, x - 1.25], [2.5, y], color=C_LINE_DARK, lw=1.0, zorder=2)
    for _, x, y in col2_ucs:
        ax.plot([1.6, x - 1.25], [2.5, y], color=C_LINE_DARK, lw=1.0, linestyle=':', zorder=2)
        
    ax.plot([8.15, 8.95], [1.7, 1.7], color=C_LINE_DARK, lw=1.2, zorder=2)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_3_use_case_admin.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_4():
    """Hinh 3.4: Use Case Phan he Ghep anh toan canh (Panorama Studio)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    ax.text(5.25, 4.45, 'SƠ ĐỒ USE CASE: PHÂN HỆ GHÉP ẢNH TOÀN CẢNH (PANORAMA STUDIO)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.18, 'Quy trình thu nhận 4 nguồn ảnh thực địa, nắn chỉnh hình học trụ và kết xuất ảnh cầu 360° x 180°',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)
            
    draw_actor(ax, 1.2, 2.3, "Kỹ thuật viên\n/ Quản trị", "Studio Tool", color='#9A3412')
    
    col1 = [
        ("Nạp ảnh đơn Webcam thử nghiệm", 3.9, 3.6),
        ("Nạp bộ ảnh góc rộng DSLR", 3.9, 2.8),
        ("Nạp Video lia không gian", 3.9, 2.0),
        ("Quét trực tiếp qua Gyroscope", 3.9, 1.2)
    ]
    col2 = [
        ("Nắn chỉnh biến dạng trụ (Warping)", 7.4, 3.6),
        ("Khớp đặc trưng SIFT & RANSAC", 7.4, 2.8),
        ("Cắt mí tối ưu & Hòa trộn Laplacian", 7.4, 2.0),
        ("Xuất ảnh cầu Equirectangular 8K", 7.4, 1.2)
    ]
    
    for name, x, y in col1 + col2:
        el = patches.Ellipse((x, y), 2.7, 0.54, facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.2, zorder=3)
        ax.add_patch(el)
        ax.text(x, y, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=C_DARK_TEXT, zorder=4)
        
    for _, x, y in col1:
        ax.plot([1.6, x - 1.35], [2.3, y], color=C_LINE_DARK, lw=1.0, zorder=2)
        
    for i in range(4):
        ax.annotate('', xy=(col2[i][1] - 1.35, col2[i][2]), xytext=(col1[i][1] + 1.35, col1[i][2]),
                    arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.1, linestyle='--'), zorder=2)
        ax.text(5.65, col1[i][2] + 0.12, '<<include>>', ha='center', va='bottom', fontsize=6.5, fontstyle='italic', color=C_MUTED_TEXT)
        
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_4_use_case_stitching_studio.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_5():
    """Hinh 3.5: ERD Database Model"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    tables = [
        ("MUSEUM_ROOMS", ["PK: room_id", "name, description", "panorama_url (8K)", "coords_x, coords_y"], 1.8, 3.3, '#1E3A8A'),
        ("HOTSPOTS", ["PK: hotspot_id", "FK: room_id", "pitch, yaw (Coords)", "FK: artifact_id"], 5.2, 3.3, '#166534'),
        ("ARTIFACTS_3D", ["PK: artifact_id", "name, dynasty, era", "model_3d_url (.glb)", "polygon_count, engine"], 8.6, 3.3, '#9A3412'),
        ("TICKETS", ["PK: ticket_id", "customer_name, phone", "price, qr_code_hash", "status (PAID/USED)"], 1.8, 1.1, '#991B1B'),
        ("PAYMENT_TRANSACTIONS", ["PK: trans_id", "FK: ticket_id", "payos_order_code", "amount, status"], 5.2, 1.1, '#581C87'),
        ("ROOM_CONNECTIONS", ["PK: connection_id", "FK: from_room_id", "FK: to_room_id", "distance_meters"], 8.6, 1.1, '#334155')
    ]
    for title, fields, x, y, hdr_col in tables:
        rect = patches.FancyBboxPatch((x - 1.25, y - 0.75), 2.5, 1.5, boxstyle='round,pad=0.02,rounding_size=0.05',
                                      facecolor='#FFFFFF', edgecolor=C_LINE_DARK, lw=1.4, zorder=3)
        ax.add_patch(rect)
        hdr = patches.Rectangle((x - 1.25, y + 0.40), 2.5, 0.35, facecolor=hdr_col, edgecolor='none', zorder=4)
        ax.add_patch(hdr)
        ax.text(x, y + 0.57, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color='white', zorder=5)
        for idx, f in enumerate(fields):
            is_pk = "PK:" in f; is_fk = "FK:" in f
            col = C_DARK_TEXT
            ax.text(x - 1.1, y + 0.22 - idx*0.24, f, fontsize=7.0, fontweight=('bold' if (is_pk or is_fk) else 'normal'), color=col, zorder=5)
            
    ax.annotate('', xy=(3.95, 3.3), xytext=(3.05, 3.3), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.3), zorder=2)
    ax.annotate('', xy=(7.35, 3.3), xytext=(6.45, 3.3), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.3), zorder=2)
    ax.annotate('', xy=(3.95, 1.1), xytext=(3.05, 1.1), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.3), zorder=2)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_5_erd.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_6():
    """Hinh 3.6: Sequence Diagram Dat ve va thanh toan VietQR PayOS"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    ax.text(5.25, 4.65, 'SƠ ĐỒ TUẦN TỰ: ĐẶT VÉ TRỰC TUYẾN VÀ THANH TOÁN VIETQR QUA CỔNG PAYOS',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.38, 'Luồng giao tiếp bất đồng bộ giữa Khách tham quan, Web Client, Backend API, PayOS và Ngân hàng',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    cols = [1.1, 3.1, 5.3, 7.6, 9.6]
    headers = ['Khách tham quan\n(Browser)', 'Frontend UI\n(React Client)', 'Backend API\n(Node.js)', 'Cổng PayOS\n(Payment Hub)', 'Ngân hàng\n(VietQR/Napas)']
    for i, x in enumerate(cols):
        draw_clean_node(ax, x, 3.9, 1.6, 0.55, headers[i], bg='#E2E8F0')
        ax.plot([x, x], [0.3, 3.6], color='#94A3B8', linestyle='--', lw=1.1, zorder=2)

    draw_step_arrow(ax, 1.1, 3.4, 3.1, 3.4, step='1', label='Chọn vé & Đặt tham quan')
    draw_step_arrow(ax, 3.1, 3.0, 5.3, 3.0, step='2', label='POST /api/tickets/create')
    draw_step_arrow(ax, 5.3, 2.6, 7.6, 2.6, step='3', label='Tạo giao dịch VietQR')
    draw_step_arrow(ax, 7.6, 2.2, 3.1, 2.2, step='4', label='Trả mã VietQR + OrderCode')
    draw_step_arrow(ax, 3.1, 1.8, 1.1, 1.8, step='5', label='Hiển thị VietQR cho khách')
    draw_step_arrow(ax, 1.1, 1.4, 9.6, 1.4, step='6', label='Khách quét & chuyển tiền App')
    draw_step_arrow(ax, 9.6, 1.0, 7.6, 1.0, step='7', label='Ngân hàng báo thanh toán')
    draw_step_arrow(ax, 7.6, 0.65, 5.3, 0.65, step='8', label='Webhook HMAC-SHA256')
    draw_step_arrow(ax, 5.3, 0.35, 3.1, 0.35, step='9', label='Trạng thái: PAID -> Cấp vé QR')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_sequence_payment_payos.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_7():
    """Hinh 3.7: Sequence Diagram Soat ve QR Camera truc tiep"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    ax.text(5.25, 4.65, 'SƠ ĐỒ TUẦN TỰ: SOÁT VÉ ĐIỆN TỬ BẰNG CAMERA THỜI GIAN THỰC',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.38, 'Quy trình giải mã khung hình camera HTML5-QRCode, đối soát chữ ký số SHA-256 và hủy vé tại cửa',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    cols = [1.2, 3.6, 6.2, 9.0]
    headers = ['Nhân viên soát vé\n(Mobile Staff)', 'Camera Web App\n(HTML5-QRCode)', 'Backend API\n(Validation Service)', 'PostgreSQL CSDL\n(Bảng tickets)']
    for i, x in enumerate(cols):
        draw_clean_node(ax, x, 3.9, 1.8, 0.55, headers[i], bg='#E2E8F0')
        ax.plot([x, x], [0.3, 3.6], color='#94A3B8', linestyle='--', lw=1.1, zorder=2)

    draw_step_arrow(ax, 1.2, 3.35, 3.6, 3.35, step='1', label='Hướng camera vào mã QR vé')
    draw_step_arrow(ax, 3.6, 2.95, 3.6, 2.65, step='2', label='Quét khung hình & Decode', rad=0.25)
    draw_step_arrow(ax, 3.6, 2.30, 6.2, 2.30, step='3', label='POST /api/tickets/validate-qr')
    draw_step_arrow(ax, 6.2, 1.90, 6.2, 1.60, step='4', label='Giải mã AES-256 & Verify SHA', rad=0.25)
    draw_step_arrow(ax, 6.2, 1.25, 9.0, 1.25, step='5', label='UPDATE tickets SET status=USED')
    draw_step_arrow(ax, 9.0, 0.90, 6.2, 0.90, step='6', label='Xác nhận cập nhật thành công')
    draw_step_arrow(ax, 6.2, 0.55, 3.6, 0.55, step='7', label='200 OK: Vé hợp lệ / Cửa mở')
    draw_step_arrow(ax, 3.6, 0.35, 1.2, 0.35, step='8', label='Hiển thị tích xanh + Rung máy')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_sequence_qr_scan.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_8():
    """Hinh 3.8: Sequence Diagram Tuong tac 360 va chuyen phong Hotspot"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    ax.text(5.25, 4.65, 'SƠ ĐỒ TUẦN TỰ: TƯƠNG TÁC KHÔNG GIAN 360° VÀ CHUYỂN PHÒNG QUA HOTSPOT',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 4.38, 'Luồng xử lý sự kiện Raycaster Three.js, tải trước Texture bất đồng bộ và chuyển cảnh mờ dần',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    cols = [1.1, 3.1, 5.3, 7.6, 9.6]
    headers = ['Khách tham quan\n(Visitor)', 'Three.js Canvas\n(WebGL 3D)', 'Raycaster Engine\n(Tương tác tia)', 'Texture Cache\n(Preloader)', 'Backend API\n(Rooms Service)']
    for i, x in enumerate(cols):
        draw_clean_node(ax, x, 3.9, 1.6, 0.55, headers[i], bg='#E2E8F0')
        ax.plot([x, x], [0.3, 3.6], color='#94A3B8', linestyle='--', lw=1.1, zorder=2)

    draw_step_arrow(ax, 1.1, 3.4, 3.1, 3.4, step='1', label='Click vào mũi tên Hotspot 3D')
    draw_step_arrow(ax, 3.1, 3.0, 5.3, 3.0, step='2', label='Bắn tia Raycast tọa độ (x, y)')
    draw_step_arrow(ax, 5.3, 2.6, 3.1, 2.6, step='3', label='Trả về target_room_id')
    draw_step_arrow(ax, 3.1, 2.2, 7.6, 2.2, step='4', label='Yêu cầu nạp Texture phòng đích')
    draw_step_arrow(ax, 7.6, 1.8, 9.6, 1.8, step='5', label='Cache Miss: Tải ảnh Panorama 8K')
    draw_step_arrow(ax, 9.6, 1.4, 7.6, 1.4, step='6', label='Stream ảnh cầu Equirectangular')
    draw_step_arrow(ax, 7.6, 1.0, 3.1, 1.0, step='7', label='Texture sẵn sàng trong VRAM')
    draw_step_arrow(ax, 3.1, 0.65, 3.1, 0.35, step='8', label='Hiệu ứng Cross-fade & Đổi góc nhìn', rad=0.25)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_8_sequence_tour_hotspot.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_1():
    """Hinh 4.1: CI/CD Pipeline (GitHub Actions to VPS)"""
    fig, ax = plt.subplots(figsize=(10.5, 3.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.0); ax.axis('off')
    
    draw_actor(ax, 1.0, 1.5, "Lập trình viên", "Git Push main", color=C_FILL_ACTOR)
    draw_cloud(ax, 3.8, 1.5, w=1.6, h=1.1, title="GitHub Repo", sub="Triggers Actions")
    draw_server(ax, 6.8, 1.5, w=1.4, h=1.3, title="GitHub Runner", sub="Build & Test & Lint\nBuild Docker Images")
    draw_server(ax, 9.4, 1.5, w=1.4, h=1.3, title="Cloud VPS Ubuntu", sub="Deploy Container\nZero Downtime")
    
    draw_step_arrow(ax, 1.8, 1.5, 2.9, 1.5, step="1", label="git push")
    draw_step_arrow(ax, 4.7, 1.5, 6.0, 1.5, step="2", label="Webhook trigger")
    draw_step_arrow(ax, 7.6, 1.5, 8.6, 1.5, step="3", label="SSH deploy script")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_1_cicd_pipeline.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_3():
    """Hinh 4.3: Panorama Studio 4 Inputs Flow (Toi gian, khong hop mau me, thoang dang khong dinh chum)"""
    fig, ax = plt.subplots(figsize=(11.0, 4.8), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.8); ax.axis('off')

    # Titles - Separated cleanly!
    ax.text(1.5, 4.5, '1. NGUỒN ẢNH ĐẦU VÀO', fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)
    ax.text(5.3, 4.5, '2. ĐỘNG CƠ XỬ LÝ PANORAMA STUDIO', fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)
    ax.text(9.3, 4.5, '3. ẢNH TOÀN CẢNH ĐẦU RA', fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)

    # 4 Input nodes (No clumsy laptop icons, clean technical cards)
    inputs = [
        ("Webcam Laptop", "Chụp kiểm thử góc phòng nhanh", 3.75),
        ("Chọn ảnh từ máy", "Ảnh DSLR chất lượng cao 8K", 2.80),
        ("Video quét phòng", "Trích xuất khung hình tự động", 1.85),
        ("Quét trực tiếp", "Gyroscope xoay 360° thời gian thực", 0.90)
    ]

    for title, desc, y_pos in inputs:
        box = patches.FancyBboxPatch((0.3, y_pos - 0.35), 2.4, 0.70, boxstyle='round,pad=0.03,rounding_size=0.06',
                                    facecolor='#FFFFFF', edgecolor='#334155', lw=1.1, zorder=4)
        ax.add_patch(box)
        ax.text(1.5, y_pos + 0.12, title, fontsize=7.2, fontweight='bold', ha='center', va='center', color=C_DARK_TEXT, zorder=5)
        ax.text(1.5, y_pos - 0.14, desc, fontsize=6.4, ha='center', va='center', color='#475569', zorder=5)

    # Lines from 4 inputs to Stage 1
    for _, _, y_in in inputs:
        ax.plot([2.7, 3.2], [y_in, y_in], color='#64748B', lw=1.0)
        ax.plot([3.2, 3.2], [y_in, 3.55], color='#64748B', lw=1.0)
    ax.annotate('', xy=(3.7, 3.55), xytext=(3.2, 3.55),
                arrowprops=dict(arrowstyle='->', color='#334155', lw=1.3))

    # Middle Pipeline: 3 Stages
    stages = [
        ("BƯỚC 1: LỌC MỜ & NẮN TRỤ HÌNH HỌC",
         "• Kiểm định phương sai Laplace: Var ≥ 100 (Loại ảnh rung lắc)\n• Nắn phẳng mặt trụ: $f = W / (2 \cdot \tan(\mathrm{FOV}/2))$, nội suy Bilinear",
         3.55),
        ("BƯỚC 2: KHỚP SIFT & CẮT MÍ VORONOI",
         "• Trích xuất vector đặc trưng 128 chiều, khớp cặp tỷ lệ Lowe's ratio\n• Khử ngoại lai bằng RANSAC & Cắt mí Voronoi né cắt qua hiện vật",
         2.35),
        ("BƯỚC 3: HÒA TRỘN ĐA DẢI TẦN (LAPLACIAN PYRAMID)",
         "• Phân rã tháp Laplacian đa tầng, hòa trộn riêng từng tần số\n• Vá mịn sàn Nadir Inpainting, khử triệt để vết mí nối và sai lệch sáng",
         1.15)
    ]

    for title, desc, y_pos in stages:
        box = patches.FancyBboxPatch((3.7, y_pos - 0.45), 3.4, 0.90, boxstyle='round,pad=0.03,rounding_size=0.06',
                                    facecolor='#F8FAFC', edgecolor='#0F172A', lw=1.2, zorder=4)
        ax.add_patch(box)
        ax.text(5.4, y_pos + 0.22, title, fontsize=7.2, fontweight='bold', ha='center', va='center', color=C_DARK_TEXT, zorder=5)
        ax.text(5.4, y_pos - 0.16, desc, fontsize=6.3, ha='center', va='center', color='#334155', linespacing=1.25, zorder=5)

    # Downward arrows between stages
    ax.annotate('', xy=(5.4, 2.85), xytext=(5.4, 3.10), arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.3))
    ax.annotate('', xy=(5.4, 1.65), xytext=(5.4, 1.90), arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.3))

    # Right: Equirectangular Output
    canvas = patches.Rectangle((7.9, 1.3), 2.8, 1.6, facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.4, zorder=4)
    ax.add_patch(canvas)
    for i in range(1, 4):
        ax.plot([7.9, 10.7], [1.3 + i*0.4, 1.3 + i*0.4], color='#E2E8F0', lw=0.6, ls=':', zorder=5)
    for j in range(1, 6):
        ax.plot([7.9 + j*0.46, 7.9 + j*0.46], [1.3, 2.9], color='#E2E8F0', lw=0.6, ls=':', zorder=5)
        
    ax.text(9.3, 2.30, 'ẢNH TOÀN CẢNH (2:1)', fontsize=7.5, fontweight='bold', ha='center', color=C_DARK_TEXT, zorder=6)
    ax.text(9.3, 1.95, 'Độ phân giải 8K (8192 × 4096)\nĐịnh dạng WebP Lossy (q=85)\nHiển thị 60 FPS trên Three.js',
            fontsize=6.5, ha='center', color='#334155', linespacing=1.2, zorder=6)

    # Arrow from Stage 3 to Output (Clean right-angle route, NO diagonal crossing!)
    ax.plot([7.1, 7.5], [1.15, 1.15], color='#0F172A', lw=1.2)
    ax.plot([7.5, 7.5], [1.15, 2.10], color='#0F172A', lw=1.2)
    ax.annotate('', xy=(7.9, 2.10), xytext=(7.5, 2.10), arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.3))
    ax.text(7.5, 2.30, 'Xuất file 8K', fontsize=6.8, fontweight='bold', ha='center', va='bottom', color='#0F172A',
            bbox=dict(boxstyle='round,pad=0.12', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png"), bbox_inches='tight')
    plt.close(fig)
def gen_fig_4_5():
    """Hinh 4.5: So do tai tao 3D voi 2 dong co va Fallback"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.1, "Quản trị viên", "Nạp 1 ảnh / Đa ảnh", color=C_FILL_ACTOR)
    draw_clean_node(ax, 3.4, 2.1, 1.8, 1.1, "Bộ điều phối 3D", "Ưu tiên Cloud AI\nFallback Local CPU", bg='#F8FAFC', border=C_LINE_DARK)
    
    draw_cloud(ax, 6.8, 3.2, w=1.8, h=1.1, title="TRELLIS AI Cloud", sub="ZeroGPU A100 (HuggingFace)")
    draw_clean_node(ax, 9.4, 3.2, 1.8, 1.1, "Lưới PBR Chuẩn", "25.000 Poly\nChi tiết 360° sắc nét", bg='#F0FDF4', border='#166534')
    
    draw_server(ax, 6.8, 1.0, w=1.6, h=1.2, title="Local CPU Server", sub="Python Axial-Radial v15.0\n100% CPU (Xeon)")
    draw_clean_node(ax, 9.4, 1.0, 1.8, 1.1, "Lưới Trục Xoay", "95.000 Poly\nMất chi tiết mặt sau", bg='#FEF2F2', border='#991B1B')
    
    draw_step_arrow(ax, 1.8, 2.1, 2.4, 2.1, label="Gửi ảnh")
    draw_step_arrow(ax, 4.3, 2.4, 5.8, 3.0, step="1", label="Chính: Cloud AI API")
    draw_step_arrow(ax, 7.8, 3.2, 8.4, 3.2, label="Mô hình .GLB")
    
    draw_step_arrow(ax, 4.3, 1.8, 5.9, 1.2, step="2", label="Fallback khi mất mạng / Timeout", color='#991B1B')
    draw_step_arrow(ax, 7.7, 1.0, 8.4, 1.0, label="Mô hình dự phòng", color='#991B1B')
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_7():
    """Hinh 4.7: Dijkstra Route Flow trong Panorama Studio (Do thi Topo 18 phong & Luu do chuan, khong de chu)"""
    fig, ax = plt.subplots(figsize=(11.0, 4.8), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.8); ax.axis('off')

    # Titles - Clean & separated
    ax.text(2.75, 4.5, 'MÔ HÌNH ĐỒ THỊ 18 PHÒNG TRƯNG BÀY (TOPOLOGICAL GRAPH)', 
            fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)
    ax.text(8.2, 4.5, 'LƯU ĐỒ GIẢI THUẬT DIJKSTRA (MIN-HEAP)', 
            fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)

    # Left: Topological Graph (Nodes & Edges)
    nodes = {
        'P01': (1.0, 1.4), 'P02': (1.9, 1.4), 'P03': (2.8, 1.4), 'P04': (3.7, 1.4),
        'P05': (4.5, 1.4), 'P06': (4.5, 2.2), 'P07': (4.5, 3.0), 'P08': (4.5, 3.7),
        'P09': (3.7, 3.7), 'P10': (2.8, 3.7), 'P11': (1.9, 3.7), 'P12': (1.0, 3.7),
        'P13': (1.0, 3.0), 'P14': (1.0, 2.2), 'HV': (2.75, 2.55)
    }

    edges = [
        ('P01', 'P02', '12m'), ('P02', 'P03', '15m'), ('P03', 'P04', '14m'), ('P04', 'P05', '16m'),
        ('P05', 'P06', '18m'), ('P06', 'P07', '15m'), ('P07', 'P08', '17m'),
        ('P08', 'P09', '14m'), ('P09', 'P10', '15m'), ('P10', 'P11', '13m'), ('P11', 'P12', '16m'),
        ('P12', 'P13', '15m'), ('P13', 'P14', '18m'), ('P14', 'P01', '14m'),
        ('P03', 'HV', '20m'), ('HV', 'P10', '22m')
    ]

    optimal_path = [('P01', 'P02'), ('P02', 'P03'), ('P03', 'HV'), ('HV', 'P10')]

    # Draw regular edges
    for u, v, w in edges:
        p1, p2 = nodes[u], nodes[v]
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#94A3B8', ls='--', lw=1.2, zorder=2)
        
    # Draw optimal path edges
    for u, v in optimal_path:
        p1, p2 = nodes[u], nodes[v]
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#15803D', ls='-', lw=2.8, zorder=3)

    # Edge weights on optimal path
    for u, v, w in [('P01', 'P02', '12m'), ('P02', 'P03', '15m'), ('P03', 'HV', '20m'), ('HV', 'P10', '22m')]:
        p1, p2 = nodes[u], nodes[v]
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        offset_x = 0.18 if p1[0] == p2[0] else 0.0
        offset_y = 0.16 if p1[1] == p2[1] else 0.0
        ax.text(mx + offset_x, my + offset_y, w, fontsize=6.8, fontweight='bold', ha='center', va='center', color='#15803D',
                bbox=dict(boxstyle='square,pad=0.1', facecolor='#FFFFFF', edgecolor='#15803D', lw=0.8), zorder=5)

    # Draw nodes
    for name, (x, y) in nodes.items():
        if name == 'P01':
            c_fill, c_border, text_col = '#1E3A8A', '#0F172A', 'white'
        elif name == 'P10':
            c_fill, c_border, text_col = '#991B1B', '#0F172A', 'white'
        elif name in ['P02', 'P03', 'HV']:
            c_fill, c_border, text_col = '#15803D', '#0F172A', 'white'
        else:
            c_fill, c_border, text_col = '#FFFFFF', '#475569', '#0F172A'
            
        circle = patches.Circle((x, y), 0.19, facecolor=c_fill, edgecolor=c_border, lw=1.2, zorder=4)
        ax.add_patch(circle)
        ax.text(x, y, name, ha='center', va='center', fontsize=6.8, fontweight='bold', color=text_col, zorder=5)

    # Start and End labels - Separated clearly, NOT overlapping!
    ax.text(1.0, 0.95, 'Xuất phát (P01)', fontsize=7.2, fontweight='bold', ha='center', color='#1E3A8A',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))
    ax.text(2.8, 4.15, 'Đích đến (P10: Chăm Pa)', fontsize=7.2, fontweight='bold', ha='center', color='#991B1B',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))

    # Bottom summary of optimal path
    ax.text(2.75, 0.40, '— Lộ trình tối ưu: P01 → P02 → P03 → HV → P10 (Tổng khoảng cách: 69m) —',
            fontsize=7.2, fontweight='bold', ha='center', color=C_DARK_TEXT)

    # Divider line
    ax.plot([5.4, 5.4], [0.3, 4.5], color='#CBD5E1', ls=':', lw=1.0)

    # Right: Dijkstra Flowchart (5.7 to 10.7)
    # Box 1: Start
    b1 = patches.FancyBboxPatch((6.0, 3.65), 4.2, 0.65, boxstyle='round,pad=0.03,rounding_size=0.06',
                               facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.2, zorder=4)
    ax.add_patch(b1)
    ax.text(8.1, 4.05, 'BẮT ĐẦU: Khởi tạo đồ thị G(V, E)', fontsize=7.2, fontweight='bold', ha='center', color=C_DARK_TEXT, zorder=5)
    ax.text(8.1, 3.80, 'Đặt d[P01] = 0, d[v] = ∞; Đưa (0, P01) vào Min-Heap', fontsize=6.5, ha='center', color='#334155', zorder=5)

    # Arrow 1->2
    ax.annotate('', xy=(8.1, 3.25), xytext=(8.1, 3.65), arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.2))

    # Box 2: Extract-Min
    b2 = patches.FancyBboxPatch((6.2, 2.60), 3.8, 0.65, boxstyle='round,pad=0.03,rounding_size=0.06',
                               facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.2, zorder=4)
    ax.add_patch(b2)
    ax.text(8.1, 2.95, 'Lấy đỉnh u có d[u] nhỏ nhất từ Min-Heap', fontsize=7.2, fontweight='bold', ha='center', color=C_DARK_TEXT, zorder=5)
    ax.text(8.1, 2.75, 'u = Extract-Min()', fontsize=6.8, ha='center', color='#334155', zorder=5)

    # Arrow 2->Diamond
    ax.annotate('', xy=(8.1, 2.20), xytext=(8.1, 2.60), arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.2))

    # Diamond: u == P10?
    dia_x, dia_y, dia_w, dia_h = 8.1, 1.70, 2.0, 0.90
    diamond = patches.Polygon([[dia_x, dia_y + dia_h/2], [dia_x + dia_w/2, dia_y],
                               [dia_x, dia_y - dia_h/2], [dia_x - dia_w/2, dia_y]],
                              facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.3, zorder=4)
    ax.add_patch(diamond)
    ax.text(dia_x, dia_y + 0.08, 'Đã đến đích?', fontsize=7.0, fontweight='bold', ha='center', color=C_DARK_TEXT, zorder=5)
    ax.text(dia_x, dia_y - 0.12, 'u == P10?', fontsize=6.8, ha='center', color='#334155', zorder=5)

    # Right branch: Yes -> Terminate
    ax.annotate('', xy=(9.7, dia_y), xytext=(dia_x + dia_w/2, dia_y), arrowprops=dict(arrowstyle='->', color='#15803D', lw=1.3))
    ax.text(9.4, dia_y + 0.15, 'Đúng', fontsize=6.8, fontweight='bold', ha='center', color='#15803D')
    
    b_end = patches.FancyBboxPatch((9.7, dia_y - 0.35), 1.0, 0.70, boxstyle='round,pad=0.03,rounding_size=0.06',
                                  facecolor='#FFFFFF', edgecolor='#15803D', lw=1.2, zorder=4)
    ax.add_patch(b_end)
    ax.text(10.2, dia_y + 0.08, 'Truy vết đường đi', fontsize=6.5, fontweight='bold', ha='center', color='#15803D', zorder=5)
    ax.text(10.2, dia_y - 0.12, 'KẾT THÚC', fontsize=6.8, fontweight='bold', ha='center', color='#15803D', zorder=5)

    # Down branch: No -> Edge Relaxation
    ax.annotate('', xy=(dia_x, 0.95), xytext=(dia_x, dia_y - dia_h/2), arrowprops=dict(arrowstyle='->', color='#991B1B', lw=1.2))
    ax.text(dia_x + 0.25, 1.10, 'Sai', fontsize=6.8, fontweight='bold', ha='left', color='#991B1B')

    # Box 3: Edge Relaxation
    b3 = patches.FancyBboxPatch((6.0, 0.35), 4.2, 0.60, boxstyle='round,pad=0.03,rounding_size=0.06',
                               facecolor='#FFFFFF', edgecolor='#0F172A', lw=1.2, zorder=4)
    ax.add_patch(b3)
    ax.text(8.1, 0.72, 'Nới lỏng cạnh: d[v] = min(d[v], d[u] + w)', fontsize=7.0, fontweight='bold', ha='center', color=C_DARK_TEXT, zorder=5)
    ax.text(8.1, 0.50, 'Cập nhật giá trị và giảm khóa trong Min-Heap', fontsize=6.4, ha='center', color='#334155', zorder=5)

    # Loop back: from Box 3 back to Box 2
    ax.plot([6.0, 5.7], [0.65, 0.65], color='#475569', ls='--', lw=1.1)
    ax.plot([5.7, 5.7], [0.65, 2.92], color='#475569', ls='--', lw=1.1)
    ax.annotate('', xy=(6.2, 2.92), xytext=(5.7, 2.92),
                arrowprops=dict(arrowstyle='->', color='#475569', ls='--', lw=1.1))
    ax.text(5.7, 1.75, 'Lặp lại', fontsize=6.5, fontweight='bold', ha='center', va='center', color='#475569',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6))

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png"), bbox_inches='tight')
    plt.close(fig)
def gen_fig_4_8():
    """Hinh 4.8: Quy trinh thanh toan VietQR va soat ve Camera to mau sam tram"""
    fig, ax = plt.subplots(figsize=(11.0, 4.4), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.4); ax.axis('off')
    
    draw_actor(ax, 0.8, 3.0, "Khách tham quan", "Mobile / Laptop", color=C_FILL_ACTOR)
    draw_server(ax, 3.2, 3.0, w=1.3, h=1.3, title="Web & Backend", sub="Node.js / Express")
    draw_cloud(ax, 5.8, 3.0, w=1.6, h=1.0, title="Cổng PayOS", sub="VietQR Napas 247")
    draw_database(ax, 8.5, 3.0, w=1.0, h=1.1, title="PostgreSQL", sub="Tickets DB", color=C_FILL_DB)
    
    draw_actor(ax, 0.8, 1.0, "Nhân viên bảo tàng", "Camera soát vé", color=C_FILL_SERVER)
    draw_server(ax, 3.2, 1.0, w=1.3, h=1.3, title="Trạm Soát Vé", sub="Html5Qrcode Scanner")
    draw_clean_node(ax, 5.8, 1.0, 1.8, 1.1, "Giải mã AES-256", "So khớp chữ ký HMAC\nCheck thời hạn vé", bg='#FEF2F2', border='#991B1B')
    draw_clean_node(ax, 8.5, 1.0, 1.8, 1.1, "Mở Cổng Barie", "Phát âm thanh Bíp\nThời gian: 150ms", bg='#F0FDF4', border='#166534')
    
    # Upper flow
    draw_step_arrow(ax, 1.4, 3.3, 2.5, 3.3, step="1", label="Đặt vé")
    draw_step_arrow(ax, 3.9, 3.3, 4.9, 3.3, step="2", label="Tạo VietQR")
    draw_step_arrow(ax, 6.7, 3.3, 7.9, 3.3, step="3", label="Webhook Paid")
    draw_step_arrow(ax, 8.0, 2.7, 3.9, 2.7, step="4", label="Lưu vé & Mã hóa AES-256")
    draw_step_arrow(ax, 2.5, 2.7, 1.4, 2.7, step="5", label="Trả QR vé về máy khách")
    
    # Lower flow
    draw_step_arrow(ax, 1.4, 1.0, 2.5, 1.0, step="6", label="Quét mã QR tại cửa")
    draw_step_arrow(ax, 3.9, 1.0, 4.8, 1.0, step="7", label="Xác thực vé")
    draw_step_arrow(ax, 6.8, 1.0, 7.5, 1.0, step="8", label="Vé hợp lệ: Cửa mở")
    draw_step_arrow(ax, 8.5, 1.6, 8.5, 2.4, step="9", label="Đổi trạng thái: USED")
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_14():
    """Hinh 2.14: So do kien truc thu thap va hien thi du lieu giam sat he thong voi Grafana & Prometheus"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 4.4)
    ax.axis('off')
    
    # Title
    ax.text(5.25, 4.25, 'KIẾN TRÚC GIÁM SÁT HỆ THỐNG VÀ PHÂN TÍCH QUAN SÁT (OBSERVABILITY ARCHITECTURE)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 3.98, 'Thu thập Metrics phần cứng VPS, Container Docker, APM API và CSDL PostgreSQL Read-Only',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)
            
    # Cột 1: Nguồn dữ liệu giám sát (Data Sources)
    draw_clean_node(ax, 1.4, 3.1, 2.2, 0.9, 'Hạ tầng VPS & Host OS', 'Ubuntu Linux 24.04 LTS\nCPU, RAM, Disk I/O, Network', bg='#F1F5F9')
    draw_clean_node(ax, 1.4, 1.9, 2.2, 0.9, 'Docker Containers', 'cAdvisor / Engine Metrics\nNginx, Node, Python, Redis', bg='#F1F5F9')
    draw_clean_node(ax, 1.4, 0.7, 2.2, 0.9, 'PostgreSQL Database', 'Số liệu vé, doanh thu, phòng 360\nRead-Only User (pg_readonly)', bg='#F1F5F9')
    
    # Cột 2: Thu thập & Lưu trữ chuỗi thời gian (Collectors & TSDB)
    draw_server(ax, 4.4, 2.5, w=1.9, h=1.6, title='Prometheus Server', sub='Time-Series Database (TSDB)\nScraping Engine / Pull Metrics')
    draw_database(ax, 4.4, 0.7, w=1.6, h=0.85, title='PostgreSQL Adapter', sub='Direct SQL Query Driver')
    
    # Cột 3: Trực quan hóa & Phân tích (Grafana Observability Engine)
    draw_server(ax, 7.3, 2.0, w=2.1, h=2.5, title='Grafana Engine v11.x', sub='Provisioned Dashboards\n- Di sản & Doanh thu Vé\n- Hạ tầng VPS & Container\n- Hiệu năng APM & Latency\n- Secure iframe Embedding')
    
    # Cột 4: Người dùng quản trị (Admin Dashboard)
    draw_actor(ax, 9.6, 2.7, 'Quản trị viên', 'Admin CMS Portal', scale=0.9)
    draw_device(ax, 9.6, 1.1, w=1.1, h=0.9, title='Admin UI (Web)', sub='Embedded Iframe', kind='laptop')
    
    # Kết nối mũi tên
    draw_step_arrow(ax, 2.5, 3.1, 3.45, 2.8, step='1', label='Pull Metrics')
    draw_step_arrow(ax, 2.5, 1.9, 3.45, 2.2, step='1', label='cAdvisor')
    draw_step_arrow(ax, 2.5, 0.7, 3.6, 0.7, step='2', label='SQL Query')
    
    draw_step_arrow(ax, 5.35, 2.5, 6.25, 2.5, step='3', label='TSDB Query')
    draw_step_arrow(ax, 5.2, 0.7, 6.25, 1.3, step='4', label='Direct Query')
    
    draw_step_arrow(ax, 8.35, 2.0, 9.05, 1.4, step='5', label='Render Panels')
    draw_step_arrow(ax, 9.6, 2.0, 9.6, 1.6, step='6', label='Theo dõi')
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_9():
    """Hinh 3.9: So do tuan tu quy trinh giam sat he thong va nhung Dashboard Grafana vao cong Quan tri"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 4.4)
    ax.axis('off')
    
    # Title
    ax.text(5.25, 4.25, 'SƠ ĐỒ TUẦN TỰ: NHÚNG BẢNG ĐIỀU KHIỂN GRAFANA VÀO CỔNG QUẢN TRỊ ADMIN',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.25, 3.98, 'Quy trình xác thực phân quyền JWT, khởi tạo Iframe an toàn và truy vấn số liệu Read-Only',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)
            
    # Lifelines
    col_x = [1.2, 3.3, 5.7, 7.9, 9.6]
    labels = ['Admin Browser\n(React UI)', 'Nginx Gateway\n(Reverse Proxy)', 'Backend API\n(Auth & Token)', 'Grafana Server\n(Port 3000)', 'PostgreSQL DB\n(Read-Only)']
    
    for i, x in enumerate(col_x):
        # Header box
        draw_clean_node(ax, x, 3.5, 1.6, 0.55, labels[i], bg='#E2E8F0')
        # Vertical dotted line
        ax.plot([x, x], [0.3, 3.2], color='#94A3B8', linestyle='--', lw=1.1, zorder=2)
        
    # Sequence messages
    # Step 1: Admin truy cập trang Báo cáo & Thống kê
    draw_step_arrow(ax, 1.2, 3.0, 3.3, 3.0, step='1', label='GET /admin/reports (JWT Token)', label_offset=0.18)
    # Step 2: Nginx xác thực header bảo mật
    draw_step_arrow(ax, 3.3, 2.65, 5.7, 2.65, step='2', label='Verify JWT & Role Admin', label_offset=0.18)
    # Step 3: API trả về quyền truy cập hợp lệ
    draw_step_arrow(ax, 5.7, 2.35, 3.3, 2.35, step='3', label='Auth OK: Grant Report View', label_offset=0.18)
    # Step 4: Trình duyệt mở iframe Grafana với CSP an toàn
    draw_step_arrow(ax, 1.2, 2.05, 7.9, 2.05, step='4', label='Load iframe /grafana/d/heritage-biz', label_offset=0.18)
    # Step 5: Grafana kiểm tra allow_embedding & SameSite
    draw_step_arrow(ax, 7.9, 1.70, 7.9, 1.45, step='5', label='Check Embedding Policy (CSP OK)', rad=0.25, label_offset=0.22)
    # Step 6: Grafana truy vấn số liệu từ CSDL
    draw_step_arrow(ax, 7.9, 1.15, 9.6, 1.15, step='6', label='SQL: SELECT metrics (Read-Only)', label_offset=0.18)
    # Step 7: CSDL trả kết quả
    draw_step_arrow(ax, 9.6, 0.85, 7.9, 0.85, step='7', label='Result rows (Vé, Doanh thu)', label_offset=0.18)
    # Step 8: Hiển thị Panel trực tiếp lên Admin
    draw_step_arrow(ax, 7.9, 0.50, 1.2, 0.50, step='8', label='Stream Dashboard Panels vào UI', label_offset=0.18)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_9_grafana_sequence.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_10():
    """Hinh 3.10: So do hoat dong quy trinh dich thuat va tai noi dung ban dia hoa cuc bo cho khong gian 360 va co vat"""
    fig, ax = plt.subplots(figsize=(11.0, 5.0), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 5.0); ax.axis('off')
    
    ax.text(5.5, 4.75, 'QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION WORKFLOW)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.5, 4.45, 'Phân tách độc lập ngôn ngữ thuyết minh phòng/hiện vật với ngôn ngữ chung của giao diện hệ thống',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    # 2 Swimlane containers
    draw_clean_node(ax, 5.5, 3.1, 10.4, 1.9, '', bg='#F8FAFC', border='#CBD5E1', lw=0.8)
    ax.text(0.5, 3.85, 'TẦNG CLIENT (TRÌNH DUYỆT KHÁCH THAM QUAN)', fontsize=7.5, fontweight='bold', color='#1E3A8A')

    draw_clean_node(ax, 5.5, 1.15, 10.4, 1.7, '', bg='#F1F5F9', border='#CBD5E1', lw=0.8)
    ax.text(0.5, 1.85, 'TẦNG SERVER & DỊCH VỤ DỊCH THUẬT AI', fontsize=7.5, fontweight='bold', color='#166534')

    # Nodes Client Layer
    draw_actor(ax, 1.2, 2.9, 'Khách tham quan', 'Chọn VI / EN / FR', scale=0.85)
    draw_clean_node(ax, 3.2, 2.9, 1.8, 1.0, 'Client Controller', 'Đọc mã phòng/cổ vật\nGiữ nguyên System UI', bg='#FFFFFF')
    draw_clean_node(ax, 5.8, 2.9, 1.8, 1.0, 'Cache Client\n(Memory)', 'Key: lang_roomId\nTra cứu bản dịch', bg='#FEF3C7')
    draw_clean_node(ax, 9.7, 2.9, 1.9, 1.0, 'Cập nhật UI 360°', 'Đổi bài thuyết minh\nĐổi văn bản mô tả', bg='#DCFCE7')

    # Nodes Server Layer
    draw_clean_node(ax, 5.8, 1.0, 2.0, 0.95, 'Localization API', 'Node.js Express\nTruy vấn CSDL', bg='#FFFFFF')
    draw_clean_node(ax, 8.4, 1.0, 2.0, 0.95, 'PostgreSQL CSDL', 'Bảng rooms, artifacts\nTrường name_en, desc_en', bg='#FFFFFF')
    draw_clean_node(ax, 10.1, 1.0, 1.6, 0.95, 'Google / Gemini AI', 'Dịch tự động NMT\nFallback khi thiếu', bg='#E0F2FE')

    # Arrows
    draw_step_arrow(ax, 1.65, 2.9, 2.25, 2.9, step='1', label='Chọn ngôn ngữ', label_offset=0.22)
    draw_step_arrow(ax, 4.15, 2.9, 4.85, 2.9, step='2', label='Check Cache', label_offset=0.22)
    draw_step_arrow(ax, 6.75, 3.1, 8.7, 3.1, step='3a', label='Cache Hit: Cập nhật ngay (<10ms)', label_offset=0.22)
    draw_step_arrow(ax, 5.8, 2.35, 5.8, 1.55, step='3b', label='Cache Miss', label_offset=0.22)
    draw_step_arrow(ax, 6.85, 1.0, 7.35, 1.0, step='4', label='SELECT DB', label_offset=0.22)
    draw_step_arrow(ax, 8.4, 1.52, 9.2, 2.35, step='5', label='Trả bản dịch', label_offset=0.22)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_10_translation_flow.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_11():
    """Hinh 3.11: So do hoat dong quy trinh sinh, luu tru dem bam (Hash Storage) va phat truc tuyen giong doc thuyet minh Audio"""
    fig, ax = plt.subplots(figsize=(11.0, 5.2), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 5.2); ax.axis('off')
    
    ax.text(5.5, 4.95, 'QUY TRÌNH SINH, LƯU TRỮ ĐỆM (HASH STORAGE) VÀ STREAMING THUYẾT MINH AUDIO',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.5, 4.65, 'Tối ưu hóa chi phí API và độ trễ phát âm thanh di sản bằng cơ chế mã băm MD5 và lưu trữ tĩnh',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    # Node 1: Khách tham quan
    draw_actor(ax, 1.0, 2.5, 'Khách tham quan', 'Bấm nghe Audio', scale=0.85)

    # Node 2: Bộ băm MD5
    draw_clean_node(ax, 2.8, 2.5, 1.8, 1.1, 'Bộ băm MD5', 'Key = MD5(text +\nlang + voice_code)\nĐịnh danh duy nhất', bg='#F8FAFC')

    # Node 3: Decision Diamond
    diamond = patches.Polygon([[4.4, 2.5], [5.3, 3.2], [6.2, 2.5], [5.3, 1.8]],
                              facecolor='#FEF3C7', edgecolor=C_LINE_DARK, lw=1.3, zorder=4)
    ax.add_patch(diamond)
    ax.text(5.3, 2.5, 'Tệp MP3\nđã cache?', ha='center', va='center', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, zorder=6)

    # Upper Branch (Cache Hit)
    draw_clean_node(ax, 7.8, 3.7, 2.2, 1.0, 'Nginx Web Server', 'HTTP 206 Partial Content\nCache-Control: Immutable', bg='#DCFCE7')
    # Lower Branch (Cache Miss)
    draw_clean_node(ax, 7.8, 1.3, 2.2, 1.0, 'Google Cloud TTS', 'Neural2 AI Synthesis\nSinh stream MP3 chuẩn', bg='#E0F2FE')

    # End Node: Audio Player
    draw_clean_node(ax, 10.1, 2.5, 1.6, 1.1, 'Trình phát Audio', 'HTML5 Audio Engine\nĐộ trễ < 50ms\nPhát mượt mà', bg='#DCFCE7')

    # Arrows
    draw_step_arrow(ax, 1.45, 2.5, 1.85, 2.5, step='1', label='Yêu cầu phát', label_offset=0.22)
    draw_step_arrow(ax, 3.75, 2.5, 4.35, 2.5, step='2', label='Check {Key}.mp3', label_offset=0.22)

    # Hit path (up-right to Nginx, then to Player)
    draw_step_arrow(ax, 5.3, 3.25, 6.65, 3.7, step='3a', label='[Có]: Cache Hit', label_offset=0.22)
    draw_step_arrow(ax, 8.95, 3.7, 9.6, 3.0, step='4a', label='Stream MP3', label_offset=0.22)

    # Miss path (down-right to TTS, then save cache, then to Player)
    draw_step_arrow(ax, 5.3, 1.75, 6.65, 1.3, step='3b', label='[Chưa]: Cache Miss', label_offset=-0.22)
    draw_step_arrow(ax, 8.95, 1.3, 9.6, 2.0, step='4b', label='Ghi đĩa tĩnh & Phát', label_offset=-0.22)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_3_12():
    """Hinh 3.12: So do hoat dong quy trinh tong hop so lieu va ket xuat bao cao Excel da bang tinh"""
    fig, ax = plt.subplots(figsize=(11.0, 5.8), dpi=300)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 5.8); ax.axis('off')
    
    ax.text(5.5, 5.55, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.5, 5.25, 'Kiến trúc kết xuất tại Client bằng thư viện xlsx-js-style, ánh xạ từ điển i18n và tạo sổ tính 4 Worksheets',
            ha='center', va='center', fontsize=7.8, color=C_MUTED_TEXT)

    draw_actor(ax, 0.9, 3.2, 'Quản trị viên', 'Bấm "Xuất file Excel"', scale=0.85)

    diamond = patches.Polygon([[2.0, 3.2], [2.7, 3.75], [3.4, 3.2], [2.7, 2.65]],
                              facecolor='#FEF3C7', edgecolor=C_LINE_DARK, lw=1.3, zorder=4)
    ax.add_patch(diamond)
    ax.text(2.7, 3.2, 'Dữ liệu\nhợp lệ?', ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=6)

    draw_clean_node(ax, 2.7, 1.3, 1.8, 0.85, 'Toast Cảnh báo', 'Dữ liệu rỗng\nNgừng xử lý', bg='#FEE2E2', border='#DC2626')
    draw_clean_node(ax, 4.6, 3.2, 1.5, 0.95, 'Nạp Từ điển i18n', 'currentLang: VI/EN/..\nTiêu đề & Trạng thái', bg='#F8FAFC')

    sheet_data = [
        (4.5, 'Sheet 1: KPIs & Doanh thu', 'Doanh thu vé, số phát hành, đã soát, khách SSE'),
        (3.6, 'Sheet 2: Chi tiết Đơn vé PayOS', 'Mã đơn, tên khách, SĐT, số tiền VND, trạng thái'),
        (2.7, 'Sheet 3: Gian phòng Tour 360°', 'Mã P01-P18, số hiện vật, trạng thái số hóa ảnh'),
        (1.8, 'Sheet 4: Kho Cổ vật & Bảo vật 3D', 'Mã cổ vật, thời kỳ, mô hình 3D .GLB, thuyết minh')
    ]
    for y_pos, title, sub in sheet_data:
        draw_clean_node(ax, 6.9, y_pos, 2.4, 0.65, title, sub, bg='#EFF6FF', border='#3B82F6')

    draw_clean_node(ax, 9.6, 3.9, 1.9, 1.2, 'Định dạng Ô (Styling)', '• Header Obsidian/Gold\n• Tiêu đề cột Slate\n• Tiền tệ VND, Tự co cột', bg='#FEF3C7', border='#D97706')
    draw_clean_node(ax, 9.6, 2.1, 1.9, 1.2, 'Đóng gói Workbook', '• Ghép 4 Worksheets\n• Tên tệp theo thời gian\n• Trình duyệt tự tải tệp', bg='#DCFCE7', border='#16A34A')

    draw_step_arrow(ax, 1.35, 3.2, 1.95, 3.2, step='1', label='Yêu cầu xuất', label_offset=0.22)
    draw_step_arrow(ax, 2.7, 2.6, 2.7, 1.8, step='', label='[Rỗng]', label_offset=0.35)
    draw_step_arrow(ax, 3.45, 3.2, 3.8, 3.2, step='2', label='[Có]', label_offset=0.22)

    for y_pos, _, _ in sheet_data:
        draw_step_arrow(ax, 5.4, 3.2, 5.65, y_pos, step='', label='', color='#64748B')
        draw_step_arrow(ax, 8.15, y_pos, 8.6, 3.9, step='', label='', color='#64748B')

    draw_step_arrow(ax, 9.6, 3.25, 9.6, 2.75, step='3', label='Đóng gói', label_offset=0.3)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_12_excel_export_activity.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_37():
    """Hinh 4.37: Bieu do thoi gian phan hoi trung binh JMeter"""
    fig, ax = plt.subplots(figsize=(8.0, 4.2), dpi=300)
    users = ['50', '100', '200', '500', '1000']
    avg_resp = [42, 68, 112, 245, 520]
    min_resp = [18, 22, 25, 32, 45]
    max_resp = [115, 184, 295, 580, 1120]
    
    ax.plot(users, avg_resp, marker='o', color='#1E3A8A', lw=2.2, label='Thời gian phản hồi TB (Average)')
    ax.plot(users, min_resp, marker='s', color='#166534', lw=1.6, linestyle='--', label='Thời gian nhỏ nhất (Min)')
    ax.plot(users, max_resp, marker='^', color='#991B1B', lw=1.6, linestyle=':', label='Thời gian lớn nhất (Max)')
    
    for i, txt in enumerate(avg_resp):
        ax.annotate(f'{txt} ms', (users[i], avg_resp[i] + 25), ha='center', fontsize=8.0, fontweight='bold', color='#1E3A8A')
        
    ax.set_title('BIỂU ĐỒ THỜI GIAN PHẢN HỒI THEO SỐ LƯỢNG USERS ĐỒNG THỜI (JMETER)', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT, pad=12)
    ax.set_xlabel('Số lượng người dùng đồng thời (Concurrent Users)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylabel('Thời gian phản hồi (Mili-giây - ms)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylim(0, 1250)
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.legend(fontsize=8.0, loc='upper left')
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_37_response_time.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_38():
    """Hinh 4.38: Bieu do thong luong he thong JMeter"""
    fig, ax = plt.subplots(figsize=(8.0, 4.2), dpi=300)
    users = ['50 Users', '100 Users', '200 Users', '500 Users', '1000 Users']
    throughput = [185.4, 242.8, 268.5, 285.2, 294.6]
    
    bars = ax.bar(users, throughput, color='#334155', edgecolor=C_LINE_DARK, lw=1.2, width=0.55)
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 6, f'{h} req/s', ha='center', va='bottom', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT)
        
    ax.set_title('BIỂU ĐỒ THÔNG LƯỢNG HỆ THỐNG THEO TẢI ĐỒNG THỜI (THROUGHPUT)', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT, pad=12)
    ax.set_xlabel('Mức tải thử nghiệm (JMeter Thread Groups)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylabel('Thông lượng (Yêu cầu/giây - Requests/sec)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylim(0, 350)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_38_throughput.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_39():
    """Hinh 4.39: Bieu do ty le loi JMeter"""
    fig, ax = plt.subplots(figsize=(8.0, 4.2), dpi=300)
    users = ['50 Users', '100 Users', '200 Users', '500 Users', '1000 Users']
    error_rates = [0.00, 0.00, 0.00, 0.12, 0.45]
    
    bars = ax.bar(users, error_rates, color=['#166534', '#166534', '#166534', '#D97706', '#991B1B'], edgecolor=C_LINE_DARK, lw=1.2, width=0.55)
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 0.02, f'{h:.2f} %', ha='center', va='bottom', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT)
        
    ax.set_title('BIỂU ĐỒ TỶ LỆ LỖI KHI TĂNG TẢI TỪ 50 ĐẾN 1000 USERS (ERROR RATE)', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT, pad=12)
    ax.set_xlabel('Số lượng người dùng ảo đồng thời', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylabel('Tỷ lệ yêu cầu lỗi (%)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylim(0, 0.6)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_39_error_rate.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_40():
    """Hinh 4.40: Ket qua danh gia Google Lighthouse"""
    fig, ax = plt.subplots(figsize=(8.5, 4.2), dpi=300)
    categories = ['Performance\n(Hiệu năng)', 'Accessibility\n(Tiếp cận)', 'Best Practices\n(Thực hành chuẩn)', 'SEO\n(Tối ưu tìm kiếm)']
    scores = [94, 98, 100, 96]
    
    bars = ax.bar(categories, scores, color=['#166534', '#166534', '#166534', '#166534'], edgecolor=C_LINE_DARK, lw=1.2, width=0.5)
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h/2, f'{h}/100', ha='center', va='center', fontsize=9.0, fontweight='bold', color='white')
        
    ax.axhline(90, color='#D97706', linestyle='--', lw=1.2, label='Ngưỡng chuẩn xuất sắc Google (Score >= 90)')
    ax.set_title('KẾT QUẢ ĐÁNH GIÁ CÁC CHỈ SỐ GOOGLE LIGHTHOUSE TRÊN MÔI TRƯỜNG THỰC TẾ', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT, pad=12)
    ax.set_ylabel('Điểm số Lighthouse (Thang điểm 100)', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT)
    ax.set_ylim(0, 115)
    ax.grid(axis='y', linestyle='--', alpha=0.5)
    ax.legend(fontsize=8.0, loc='lower right')
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_40_lighthouse.png"), bbox_inches='tight')
    plt.close(fig)

def gen_all():
    print(">>> DANG TAO TOAN BO SO DO CHUYEN NGHIEP CHUAN HOC THUAT (MAU SAM, TEXT DEN)...")
    gen_fig_1_1()
    gen_fig_1_3()
    gen_fig_2_1()
    gen_fig_2_2()
    gen_fig_2_3()
    gen_fig_2_4()
    gen_fig_2_5()
    gen_fig_2_6()
    gen_fig_2_7()
    gen_fig_2_8()
    gen_fig_2_9()
    gen_fig_2_10()
    gen_fig_2_11()
    gen_fig_2_12()
    gen_fig_2_13()
    gen_fig_2_14()
    gen_fig_3_1()
    gen_fig_3_2()
    gen_fig_3_3()
    gen_fig_3_4()
    gen_fig_3_5()
    gen_fig_3_6()
    gen_fig_3_7()
    gen_fig_3_8()
    gen_fig_3_9()
    gen_fig_3_10()
    gen_fig_3_11()
    gen_fig_3_12()
    gen_fig_4_1()
    gen_fig_4_3()
    gen_fig_4_5()
    gen_fig_4_7()
    gen_fig_4_8()
    gen_fig_4_37()
    gen_fig_4_38()
    gen_fig_4_39()
    gen_fig_4_40()
    print(">>> HOAN THANH TAO 37 SO DO HOC THUAT MAU SAM HOAN HAO!")

if __name__ == "__main__":
    gen_all()
