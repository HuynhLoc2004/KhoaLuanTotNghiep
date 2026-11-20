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
    """Ve bieu tuong Server Rack co header slate sam va den LED trang nha."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor='#F1F5F9', edgecolor=C_LINE_DARK, lw=1.5, zorder=4)
    ax.add_patch(rect)
    # Header bar
    s_hdr = patches.Rectangle((x - w/2, y + h/2 - 0.26), w, 0.26, facecolor=C_FILL_SERVER, edgecolor=C_LINE_DARK, lw=1.0, zorder=5)
    ax.add_patch(s_hdr)
    ax.text(x, y + h/2 - 0.13, 'SERVER RACK', ha='center', va='center', fontsize=6.8, fontweight='bold', color='white', zorder=6)

    # Slots
    slot_w = w * 0.8
    for dy in [0.08, -0.22, -0.52]:
        s = patches.Rectangle((x - slot_w/2, y + dy), slot_w, 0.20, facecolor='#E2E8F0', edgecolor='#64748B', lw=0.9, zorder=5)
        ax.add_patch(s)
        led = patches.Circle((x + slot_w/2 - 0.08, y + dy + 0.10), 0.03, facecolor='#15803D', edgecolor='none', zorder=6)
        ax.add_patch(led)
    ax.text(x, y - h/2 - 0.14, title, ha='center', va='top', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - h/2 - 0.34, sub, ha='center', va='top', fontsize=7.2, color=C_MUTED_TEXT, zorder=7)

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
    
    ax.text(cx, cy - R - 0.32, 'Mặt cầu 3D đơn vị ($X^2 + Y^2 + Z^2 = 1$)\nTọa độ góc $(\\theta, \\phi)$',
            ha='center', va='top', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    # Formulations
    ax.annotate('', xy=(5.9, 2.5), xytext=(4.4, 2.5), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.4), zorder=5)
    ax.text(5.15, 2.65, 'Chiếu góc (2.1 - 2.2)\n' + r'$\theta = \arctan2(X, -Z)$' + '\n' + r'$\phi = \arcsin(Y)$',
            ha='center', va='bottom', fontsize=7.2, color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#93C5FD', lw=0.7))
    
    ax.annotate('', xy=(4.4, 1.4), xytext=(5.9, 1.4), arrowprops=dict(arrowstyle='->', color=C_LINE_DARK, lw=1.4), zorder=5)
    ax.text(5.15, 1.25, 'Chiếu ngược (2.3 - 2.4)\n$X = -\\cos\\phi\\sin\\theta$\n$Y = \\sin\\phi, Z = -\\cos\\phi\\cos\\theta$',
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
    
    ax.text(rx + rw/2, ry - 0.45, 'Ảnh phẳng Equirectangular ($W \\times H$, tỷ lệ 2:1)\n$x = (\\theta + \\pi) / (2\\pi) \\cdot W, \\quad y = (\\pi/2 - \\phi) / \\pi \\cdot H$',
            ha='center', va='top', fontsize=8, fontweight='bold', color=C_DARK_TEXT)
    
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_2():
    """Hinh 2.2: Quy trinh nan chinh bien dang hinh hoc tru (Cylindrical Warping)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')
    
    cam_x, cam_y = 1.2, 2.0
    f = 2.4
    
    ax.plot(cam_x, cam_y, 'o', color=C_LINE_DARK, markersize=5.5, zorder=6)
    ax.text(cam_x - 0.1, cam_y - 0.22, 'C (Tâm quang học)', fontsize=8, fontweight='bold', ha='right', color=C_DARK_TEXT)
    
    ax.plot([cam_x, cam_x + f + 1.2], [cam_y, cam_y], color=C_MUTED_TEXT, ls='--', lw=1.0, zorder=2)
    ax.text(cam_x + 1.5, cam_y - 0.22, f'Tiêu cự f = {f}', fontsize=7.5, color=C_MUTED_TEXT, ha='center',
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'))
    
    sensor_x = cam_x + f
    ax.plot([sensor_x, sensor_x], [cam_y - 1.4, cam_y + 1.4], color=C_LINE_DARK, lw=2.0, zorder=3)
    ax.text(sensor_x - 0.08, cam_y + 1.5, 'Mặt phẳng cảm biến (Ảnh phẳng)\n$x_p \\in [-W/2, W/2]$',
            fontsize=7.8, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    theta_arc = np.linspace(-np.pi/4, np.pi/4, 100)
    arc_x = cam_x + f * np.cos(theta_arc)
    arc_y = cam_y + f * np.sin(theta_arc)
    ax.plot(arc_x, arc_y, color='#1E40AF', lw=2.4, zorder=4)
    ax.text(cam_x + f + 0.2, cam_y - 1.45, 'Mặt trụ bán kính f\n$x_{cyl} = f \\cdot \\theta$',
            fontsize=7.8, fontweight='bold', ha='left', color=C_DARK_TEXT)
    
    # Rays
    y_p1 = cam_y + 1.0
    theta1 = np.arctan((y_p1 - cam_y) / f)
    cyl_x1 = cam_x + f * np.cos(theta1)
    cyl_y1 = cam_y + f * np.sin(theta1)
    ax.plot([cam_x, cyl_x1 + 0.3], [cam_y, cyl_y1 + 0.3 * np.tan(theta1)], color='#1E3A8A', ls='-', lw=1.3, zorder=5)
    ax.plot(sensor_x, y_p1, 'o', color='#1E3A8A', markersize=4.5, zorder=6)
    ax.text(sensor_x - 0.15, y_p1 + 0.12, '$p(x_p, y_p)$', fontsize=8, fontweight='bold', color=C_DARK_TEXT, ha='right',
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'))
    ax.plot(cyl_x1, cyl_y1, 'o', color='#1E3A8A', markersize=5.5, zorder=6)
    ax.text(cyl_x1 + 0.1, cyl_y1 + 0.1, '$p_{cyl}(x_{cyl}, y_{cyl})$', fontsize=8, fontweight='bold', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'))
    
    y_p2 = cam_y - 0.8
    theta2 = np.arctan((y_p2 - cam_y) / f)
    cyl_x2 = cam_x + f * np.cos(theta2)
    cyl_y2 = cam_y + f * np.sin(theta2)
    ax.plot([cam_x, cyl_x2 + 0.3], [cam_y, cyl_y2 + 0.3 * np.tan(theta2)], color='#1E3A8A', ls='-', lw=1.3, zorder=5)
    ax.plot(sensor_x, y_p2, 'o', color='#1E3A8A', markersize=4.5, zorder=6)
    ax.plot(cyl_x2, cyl_y2, 'o', color='#1E3A8A', markersize=5.5, zorder=6)
    
    arc_ang = patches.Arc((cam_x, cam_y), 1.2, 1.2, angle=0, theta1=0, theta2=np.degrees(theta1), color=C_LINE_DARK, lw=1.2)
    ax.add_patch(arc_ang)
    ax.text(cam_x + 0.75, cam_y + 0.18, r'$\theta$', fontsize=8.5, fontweight='bold', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFFFFF', edgecolor='none'))
    
    # Right panel
    fb = patches.FancyBboxPatch((6.0, 2.3), 4.2, 1.5, boxstyle='round,pad=0.03,rounding_size=0.06',
                                facecolor='#EFF6FF', edgecolor='#1E3A8A', lw=1.3, zorder=3)
    ax.add_patch(fb)
    ax.text(8.1, 3.55, 'CÔNG THỨC BIẾN ĐỔI HÌNH HỌC (2.5 – 2.8)', fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    ax.text(8.1, 3.15, r'$x_{cyl} = f \cdot \arctan\left(\frac{x_p}{f}\right) + \frac{W}{2}$', fontsize=8.5, ha='center', color=C_DARK_TEXT)
    ax.text(8.1, 2.75, r'$y_{cyl} = f \cdot \frac{y_p}{\sqrt{x_p^2 + f^2}} + \frac{H}{2}$', fontsize=8.5, ha='center', color=C_DARK_TEXT)
    ax.text(8.1, 2.45, 'Nội suy Bilinear trị số mức xám 4 điểm lân cận', fontsize=7.2, fontstyle='italic', ha='center', color=C_MUTED_TEXT)
    
    ax.text(7.0, 1.95, '1. Ảnh phẳng gốc (Góc rộng):', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, ha='center')
    f1 = patches.Polygon([[6.2, 0.6], [7.8, 0.6], [8.0, 1.7], [6.0, 1.7]], facecolor='#F8FAFC', edgecolor='#64748B', lw=1.2)
    ax.add_patch(f1)
    ax.text(7.0, 1.15, 'Biến dạng mép\n(Cột bị choãi)', ha='center', va='center', fontsize=7.2, color=C_MUTED_TEXT)
    
    ax.text(9.2, 1.95, '2. Ảnh đã nắn trụ:', fontsize=7.5, fontweight='bold', color=C_DARK_TEXT, ha='center')
    curve_x = np.linspace(8.4, 10.0, 40)
    top_y = 1.7 - 0.12 * (1 - ((curve_x - 9.2)/0.8)**2)
    bot_y = 0.6 + 0.12 * (1 - ((curve_x - 9.2)/0.8)**2)
    verts = list(zip(curve_x, top_y)) + list(zip(curve_x[::-1], bot_y[::-1]))
    f2 = patches.Polygon(verts, facecolor='#F0FDF4', edgecolor='#166534', lw=1.4)
    ax.add_patch(f2)
    ax.text(9.2, 1.15, 'Triệt tiêu mép cong\nGhép mí liên tục', ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT)
    
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
    """Hinh 2.6: Nguyen ly anh xa Texture Panorama len mat cau 3D va Hotspot trong Three.js"""
    fig, ax = plt.subplots(figsize=(10.5, 3.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.8); ax.axis('off')

    cx, cy, R = 3.2, 1.9, 1.45
    # Mat cau to mau slate sam tram (#1E293B) tao cam giac khong gian 3D Three.js
    sphere = patches.Circle((cx, cy), R, facecolor='#1E293B', edgecolor=C_LINE_DARK, lw=1.8, zorder=2)
    ax.add_patch(sphere)

    for y_off in [-0.8, -0.4, 0.0, 0.4, 0.8]:
        r_lat = np.sqrt(max(0.05, R**2 - y_off**2))
        ls = '-' if y_off == 0.0 else '--'
        lw = 1.3 if y_off == 0.0 else 0.8
        col = '#60A5FA' if y_off == 0.0 else '#64748B'
        arc = patches.Arc((cx, cy + y_off), 2*r_lat, 0.45, angle=0, theta1=0, theta2=360,
                          color=col, lw=lw, ls=ls, zorder=3)
        ax.add_patch(arc)

    for w_mer in [0.6, 1.4, 2.2]:
        arc = patches.Arc((cx, cy), w_mer, 2*R, angle=0, theta1=0, theta2=360,
                          color='#475569', lw=0.8, ls=':', zorder=3)
        ax.add_patch(arc)

    ax.plot(cx, cy, 'o', color='#F59E0B', markersize=6.5, zorder=6)
    ax.annotate('Camera O(0,0,0)\n(PerspectiveCamera)', xy=(cx, cy), xytext=(cx - 1.8, cy + 0.9),
                arrowprops=dict(arrowstyle='->', color='#334155', lw=1.2),
                fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, ha='right', va='center',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8), zorder=7)

    cone_target_x, cone_target_y = cx + R*0.75, cy + R*0.55
    cone_pts = [[cx, cy], [cx + 1.45, cy + 0.25], [cx + 1.15, cy + 1.25]]
    cone = patches.Polygon(cone_pts, facecolor='#FEF3C7', edgecolor='#D97706', lw=1.0, alpha=0.45, zorder=4)
    ax.add_patch(cone)

    ax.annotate('', xy=(cone_target_x, cone_target_y), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.6), zorder=5)

    ax.plot(cone_target_x, cone_target_y, 'o', color='#DC2626', markersize=7, zorder=7)
    hotspot_ring = patches.Circle((cone_target_x, cone_target_y), 0.18, facecolor='none', edgecolor='#DC2626', lw=1.4, ls='--', zorder=7)
    ax.add_patch(hotspot_ring)

    ax.annotate('Điểm Hotspot Cổ vật\nTọa độ 3D (X_h, Y_h, Z_h)', xy=(cone_target_x, cone_target_y), xytext=(cx + 1.7, cy + 1.4),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.2),
                fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, ha='left', va='center',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=0.8), zorder=8)

    ax.annotate('', xy=(cx + 0.8, cy - 1.0), xytext=(cx - 0.8, cy - 1.0),
                arrowprops=dict(arrowstyle='<->', color='#10B981', lw=1.5, connectionstyle='arc3,rad=-0.25'), zorder=5)
    ax.text(cx, cy - 1.38, 'Góc xoay người dùng (Yaw θ & Pitch φ) qua OrbitControls',
            fontsize=7.5, ha='center', color=C_DARK_TEXT,
            bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFFFFF', edgecolor='none'), zorder=6)

    cards = [
        ('MẶT CẦU INVERTED THREE.JS',
         'MeshSphereGeometry(R=500, 60, 40)\ngeometry.scale(-1, 1, 1) lật mặt pháp tuyến vào trong', 2.9, '#EFF6FF', '#1E3A8A'),
        ('QUẢN LÝ VÀ GIẢI PHÓNG VRAM',
         'Nạp ảnh Equirectangular 8K định dạng WebP\nGọi texture.dispose() khi chuyển phòng tránh rò rỉ RAM', 1.8, '#F0FDF4', '#166534'),
        ('TƯƠNG TÁC TIA NHÌN RAYCASTING',
         'Raycaster tính giao điểm chuột với mặt cầu 3D\nKích hoạt Pop-up xem chi tiết cổ vật và thuyết minh', 0.7, '#FFF7ED', '#C2410C')
    ]

    for title, sub, y_pos, bg, border in cards:
        box = patches.FancyBboxPatch((6.3, y_pos - 0.45), 3.9, 0.9, boxstyle='round,pad=0.03,rounding_size=0.06',
                                    facecolor=bg, edgecolor=border, lw=1.3, zorder=4)
        ax.add_patch(box)
        ax.text(8.25, y_pos + 0.18, title, ha='center', va='center', fontsize=8.2, fontweight='bold', color=C_DARK_TEXT, zorder=5)
        ax.text(8.25, y_pos - 0.15, sub, ha='center', va='center', fontsize=7.2, color=C_MUTED_TEXT, linespacing=1.25, zorder=5)

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
    """Hinh 2.10: JWT Auth Flow (Mau sam tram nha nhan, text den tuyen)"""
    fig, ax = plt.subplots(figsize=(10.5, 3.4), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.4); ax.axis('off')
    
    draw_actor(ax, 1.2, 1.7, "Người dùng / Admin", "Client Browser", color=C_FILL_ACTOR)
    draw_server(ax, 4.8, 1.7, w=1.4, h=1.4, title="API Gateway / Auth", sub="Node.js JWT Verify")
    draw_database(ax, 8.8, 1.7, w=1.1, h=1.1, title="User Database", sub="Bcrypt Hash pass", color=C_FILL_DB)
    
    draw_step_arrow(ax, 2.0, 2.1, 4.0, 2.1, step="1", label="POST /login (Credentials)", label_offset=0.25)
    draw_step_arrow(ax, 5.6, 2.1, 8.1, 2.1, step="2", label="Tra cứu User & Hash", label_offset=0.25)
    draw_step_arrow(ax, 8.1, 1.3, 5.6, 1.3, step="3", label="Xác thực thành công", label_offset=0.25)
    draw_step_arrow(ax, 4.0, 1.3, 2.2, 1.3, step="4", label="Trả về JWT Access Token (24h)", label_offset=0.25)
    
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
    """Hinh 4.3: Panorama Studio 4 Inputs Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    draw_device(ax, 1.2, 3.5, 1.0, 0.9, "1. Webcam Laptop", "Kiểm thử nhanh", kind="desktop")
    draw_device(ax, 1.2, 2.4, 1.0, 0.9, "2. Chọn từ máy", "Ảnh DSLR 8K", kind="desktop")
    draw_device(ax, 1.2, 1.3, 0.9, 0.9, "3. Video quét", "Smartphone / Cam", kind="mobile")
    draw_device(ax, 1.2, 0.2, 0.9, 0.9, "4. Quét trực tiếp", "Gyroscope", kind="mobile")
    
    draw_clean_node(ax, 4.8, 1.85, 2.5, 1.5, "XỬ LÝ ẢNH STUDIO", "• Lọc mờ Laplacian (Var ≥ 100)\n• Nắn mặt trụ f (2.5 – 2.8)\n• Khớp SIFT & RANSAC\n• Ghép mí Voronoi Seam", bg='#EFF6FF', border='#1E3A8A')
    draw_clean_node(ax, 8.6, 1.85, 2.4, 1.5, "ẢNH CẦU 360° HOÀN CHỈNH", "• Equirectangular 8K (2:1)\n• Vá đáy sàn Nadir\n• Tối ưu WebP nạp WebGL 60fps", bg='#F0FDF4', border='#166534')
    
    for y_in in [3.5, 2.4, 1.3, 0.2]:
        draw_step_arrow(ax, 1.8, y_in, 3.5, 1.85)
    draw_step_arrow(ax, 6.1, 1.85, 7.3, 1.85, label="Xuất Panorama")
    
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

def gen_fig_4_6():
    """Hinh 4.6: Anh so sanh thuc te giua Local CPU va TRELLIS AI tu upload cua user"""
    p2 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104558258_b9b7daa7.jpg"
    p3 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104579468_1b0a2492.png"
    if not (os.path.exists(p2) and os.path.exists(p3)):
        return
    import matplotlib.image as mpimg
    img2 = mpimg.imread(p2)
    img3 = mpimg.imread(p3)
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.5), dpi=300)
    ax1.imshow(img2); ax1.axis('off')
    ax1.set_title("A. ĐỘNG CƠ LOCAL CPU (MÁY CHỦ NỘI BỘ)\nLưới phồng đối xứng trục, mất góc cạnh, 95k poly", fontsize=8.2, fontweight='bold', color=C_DARK_TEXT)
    ax2.imshow(img3); ax2.axis('off')
    ax2.set_title("B. ĐỘNG CƠ CLOUD AI TRELLIS (ZEROGPU A100)\nCấu trúc SLAT 3D đa diện sắc nét, chuẩn PBR, 25k poly", fontsize=8.2, fontweight='bold', color=C_DARK_TEXT)
    
    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_6_so_sanh_3d_thuc_te.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_7():
    """Hinh 4.7: Dijkstra Route Flow trong Panorama Studio"""
    fig, ax = plt.subplots(figsize=(10.5, 3.8), dpi=300)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.8); ax.axis('off')
    
    map_box = patches.FancyBboxPatch((0.8, 0.6), 4.5, 2.7, boxstyle='round,pad=0.03,rounding_size=0.08',
                                     facecolor='#F8FAFC', edgecolor=C_LINE_DARK, lw=1.4, zorder=2)
    ax.add_patch(map_box)
    ax.text(3.05, 3.0, 'BẢN ĐỒ TOPO TƯƠNG TÁC (MINI-MAP)', fontsize=8.2, fontweight='bold', ha='center', color=C_DARK_TEXT)
    
    pts = [(1.5, 1.1), (2.3, 1.1), (3.1, 1.1), (4.3, 1.1), (4.3, 2.3), (3.1, 2.3), (2.0, 2.3)]
    for i in range(len(pts)-1):
        ax.plot([pts[i][0], pts[i+1][0]], [pts[i][1], pts[i+1][1]], color='#1D4ED8', lw=2.6, zorder=3)
    for p in pts:
        ax.plot(p[0], p[1], 'o', color='#1D4ED8', markersize=5.5, zorder=4)
        
    ax.plot(1.5, 1.1, 'o', color=C_FILL_ACTOR, markersize=8, zorder=5)
    ax.text(1.5, 0.85, 'Vị trí hiện tại (P01)', ha='center', va='top', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)
    
    ax.plot(2.0, 2.3, 'o', color='#991B1B', markersize=8, zorder=5)
    ax.text(2.0, 2.65, 'Đích đến (P10: Chăm Pa)', ha='center', va='bottom', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)
    
    draw_clean_node(ax, 8.2, 2.9, 3.6, 1.0, "1. MA TRẬN TRỌNG SỐ KỀ",
                    "• Đồ thị 18 đỉnh (Phòng) & 24 cạnh (Hành lang)\n• Trọng số là cự ly đo thực tế (mét)", bg='#EFF6FF', border='#1E3A8A')
                    
    draw_clean_node(ax, 8.2, 1.7, 3.6, 1.0, "2. HÀNG ĐỢI ƯU TIÊN MIN-HEAP",
                    "• Độ phức tạp O(E log V)\n• Nới lỏng cạnh: d[v] = min(d[v], d[u] + w)\n• Thời gian tính toán: < 5 miligiây", bg='#FFF7ED', border='#C2410C')
                    
    draw_clean_node(ax, 8.2, 0.5, 3.6, 0.9, "3. KẾT QUẢ ĐỊNH TUYẾN",
                    "Hiển thị nét đứt phát sáng & hướng dẫn viên Voice AI", bg='#F0FDF4', border='#166534')
                    
    draw_step_arrow(ax, 5.4, 1.9, 6.3, 1.9, label="Định tuyến")
    
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
    gen_fig_3_1()
    gen_fig_3_5()
    gen_fig_4_1()
    gen_fig_4_3()
    gen_fig_4_5()
    gen_fig_4_6()
    gen_fig_4_7()
    gen_fig_4_8()
    print(">>> HOAN THANH TAO 23 SO DO HOC THUAT MAU SAM HOAN HAO!")

if __name__ == "__main__":
    gen_all()
