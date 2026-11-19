# -*- coding: utf-8 -*-
"""
GENERATE ACADEMIC SOFTWARE ARCHITECTURE & FLOW DIAGRAMS (ALGOMASTER / BYTEBYTEGO STYLE)
Bao cao Khoa luan Tot nghiep - IUH
Phong cach thiet ke:
- Nen trang toi gian, duong net sac sao, tieu chuan ky thuat do hoa sach giao khoa
- Hoan toan loai bo cac hop text vuong tho kech, thay the 100% bang THUC THE HINH HOC TRUC QUAN:
  + Hinh 2.1: Mo hinh 3D Sphere wireframe (kinh tuyen, vi tuyen, toa do cau) chieu sang ban do phang Equirectangular 2:1
  + Hinh 2.2: Quang hinh Cylindrical Warping (tam camera C, tieu cu f, cam bien phang, mat tru cong, tia chieu)
  + Hinh 2.3: Thap Gauss da tang (Octave 3D), mat phang DoG va khoi lap phuong 3x3x3 tim cuc tri 26 diem lan can
  + Hinh 2.4: So khop SIFT tren 2 khung anh dong thau, lien ket Inlier xanh luc va Outlier net dut do bi RANSAC triet tieu
  + Hinh 2.5: Cat mi Voronoi uon luon tranh vat the tren vung chong lap kem hoa tron da dai tan Laplacian
  + Hinh 2.6: Mat cau Three.js cat bo nua ban cau, camera dat tai O(0,0,0), non tia nhin va diem Hotspot co vat
  + Hinh 2.7: Do thi topo 18 phong chu U bao quanh san vuon trung tam voi trong so met va lo trinh Dijkstra xanh neon
  + Hinh 2.8: Vong tron chup da huong 360 quanh co vat va quy trinh Photogrammetry sinh luoi GLB
  + Cac so do he thong: Bieu tuong Actor, Server rack LED, Database cylinder, Mobile/Laptop, Cloud, The ve QR
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

# =============================================================================
# CAC HAM VE NGUYEN MAU HINH HOC CHUAN ALGOMASTER / BYTEBYTEGO
# =============================================================================

def draw_actor(ax, x, y, label, sub='', color='#0284C7', scale=1.0):
    """Ve bieu tuong Actor (Nguoi / Tac nhan) chuan."""
    r_head = 0.16 * scale
    head = patches.Circle((x, y + 0.36 * scale), r_head, facecolor=color, edgecolor='#0F172A', lw=1.6, zorder=6)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.06 * scale), 0.42 * scale, 0.32 * scale, facecolor=color, edgecolor='#0F172A', lw=1.6, zorder=6)
    ax.add_patch(body)
    ax.text(x, y - 0.22 * scale, label, ha='center', va='top', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=7)
    if sub:
        ax.text(x, y - 0.44 * scale, sub, ha='center', va='top', fontsize=7.5, color='#475569', zorder=7)

def draw_server(ax, x, y, w=1.2, h=1.3, title='', sub='', color='#F8FAFC', led_color='#10B981'):
    """Ve bieu tuong Server Rack co khe cam o dia va den LED."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor=color, edgecolor='#1E293B', lw=1.6, zorder=4)
    ax.add_patch(rect)
    slot_w, slot_h = w * 0.8, h * 0.18
    for dy in [h * 0.24, 0.0, -h * 0.24]:
        s = patches.Rectangle((x - slot_w/2, y + dy - slot_h/2), slot_w, slot_h, facecolor='#E2E8F0', edgecolor='#64748B', lw=1.0, zorder=5)
        ax.add_patch(s)
        led = patches.Circle((x + slot_w/2 - 0.08, y + dy), 0.028, facecolor=led_color, edgecolor='none', zorder=6)
        ax.add_patch(led)
    ax.text(x, y - h/2 - 0.12, title, ha='center', va='top', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=7)
    if sub:
        ax.text(x, y - h/2 - 0.32, sub, ha='center', va='top', fontsize=7.5, color='#475569', zorder=7)

def draw_database(ax, x, y, w=0.9, h=1.1, title='', sub='', color='#EF4444'):
    """Ve bieu tuong CSDL dang hinh tru dia chong."""
    for i, dy in enumerate([0.32, 0.08, -0.16]):
        rect = patches.FancyBboxPatch((x - w/2, y + dy), w, 0.28, boxstyle='round,pad=0.02,rounding_size=0.08',
                                      facecolor=color, edgecolor='#991B1B', lw=1.4, zorder=4+i)
        ax.add_patch(rect)
        line = patches.Ellipse((x, y + dy + 0.14), w*0.9, 0.09, facecolor='#FCA5A5', edgecolor='#991B1B', lw=1.0, zorder=5+i)
        ax.add_patch(line)
    ax.text(x, y - 0.38, title, ha='center', va='top', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=8)
    if sub:
        ax.text(x, y - 0.58, sub, ha='center', va='top', fontsize=7.5, color='#475569', zorder=8)

def draw_device(ax, x, y, w=1.0, h=1.2, title='', sub='', kind='mobile'):
    """Ve bieu tuong thiet bi (Dien thoai di dong / May tinh Laptop)."""
    if kind == 'mobile':
        rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.1',
                                      facecolor='#F1F5F9', edgecolor='#1E293B', lw=1.5, zorder=4)
        ax.add_patch(rect)
        screen = patches.Rectangle((x - w*0.4, y - h*0.35), w*0.8, h*0.7, facecolor='#38BDF8', edgecolor='#0284C7', lw=1.0, zorder=5)
        ax.add_patch(screen)
        home = patches.Circle((x, y - h*0.42), 0.04, facecolor='#64748B', edgecolor='none', zorder=6)
        ax.add_patch(home)
    else: # laptop/desktop
        rect = patches.Rectangle((x - w/2, y - h*0.3), w, h*0.7, facecolor='#38BDF8', edgecolor='#1E293B', lw=1.5, zorder=4)
        ax.add_patch(rect)
        base = patches.Polygon([[x - w*0.7, y - h*0.45], [x + w*0.7, y - h*0.45], [x + w*0.6, y - h*0.3], [x - w*0.6, y - h*0.3]],
                               facecolor='#94A3B8', edgecolor='#1E293B', lw=1.5, zorder=4)
        ax.add_patch(base)
    ax.text(x, y - h/2 - 0.15, title, ha='center', va='top', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=7)
    if sub:
        ax.text(x, y - h/2 - 0.35, sub, ha='center', va='top', fontsize=7.5, color='#475569', zorder=7)

def draw_cloud(ax, x, y, w=1.5, h=0.9, title='', sub=''):
    """Ve bieu tuong Cloud Internet gon dep."""
    c1 = patches.Circle((x - 0.28, y), 0.32, facecolor='#E0F2FE', edgecolor='#0284C7', lw=1.5, zorder=4)
    c2 = patches.Circle((x + 0.28, y), 0.32, facecolor='#E0F2FE', edgecolor='#0284C7', lw=1.5, zorder=4)
    c3 = patches.Circle((x, y + 0.18), 0.38, facecolor='#E0F2FE', edgecolor='#0284C7', lw=1.5, zorder=4)
    r = patches.Rectangle((x - 0.28, y - 0.32), 0.56, 0.36, facecolor='#E0F2FE', edgecolor='none', zorder=5)
    for p in [c1, c2, c3, r]: ax.add_patch(p)
    ax.text(x, y - 0.05, title, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0369A1', zorder=7)
    if sub:
        ax.text(x, y - 0.48, sub, ha='center', va='top', fontsize=7.5, color='#475569', zorder=7)

def draw_clean_node(ax, x, y, w, h, title, sub='', bg='#FFFFFF', border='#1E293B', lw=1.5):
    """Ve hop thanh phan toi gian voi vien net dam thanh lich."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle='round,pad=0.02,rounding_size=0.05',
                                  facecolor=bg, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    if sub:
        ax.text(x, y + 0.08, title, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=6)
        ax.text(x, y - 0.14, sub, ha='center', va='center', fontsize=7.5, color='#475569', zorder=6)
    else:
        ax.text(x, y, title, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=6)

def draw_step_arrow(ax, x1, y1, x2, y2, step='', label='', color='#1E293B', rad=0.0, label_offset=0.22):
    """Ve mui ten chuyen trang thai co huy hieu buoc [1], [2] va nhan ro rang."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.6, shrinkA=6, shrinkB=6,
                                mutation_scale=13, connectionstyle=conn), zorder=5)
    mx = (x1 + x2) / 2
    my = (y1 + y2) / 2 + (0.15 if rad >= 0 else -0.15)
    if step:
        badge = patches.Circle((mx, my), 0.13, facecolor='#1E293B', edgecolor='none', zorder=8)
        ax.add_patch(badge)
        ax.text(mx, my, step, ha='center', va='center', fontsize=7.5, fontweight='bold', color='white', zorder=9)
    if label:
        ax.text(mx, my + label_offset, label, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#334155',
                bbox=dict(boxstyle='round,pad=0.15', facecolor='white', edgecolor='#CBD5E1', lw=0.8, alpha=0.95), zorder=8)

# =============================================================================
# VE TOAN BO CAC SO DO CHUYEN NGHIEP CHUAN HOC THUAT & BYTEBYTEGO
# =============================================================================

def gen_fig_1_1():
    """Hinh 1.1: So do tu duy kien truc he thong Tour 360 (Algomaster Style)"""
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 5.0); ax.axis('off')
    
    # Central Hub
    draw_clean_node(ax, 5.25, 2.5, 2.6, 1.3, "BẢO TÀNG LỊCH SỬ TP.HCM", "Nền tảng Tour 360° & Di sản số", bg="#EFF6FF", border="#1D4ED8", lw=2.0)
    
    # 4 Branch Actors & Roles
    draw_actor(ax, 1.5, 4.0, "Khách tham quan", "Tour 360°, 3D, Dijkstra, Voice AI", color="#0284C7")
    draw_actor(ax, 9.0, 4.0, "Quản trị viên CMS", "Quản lý 18 phòng, Cổ vật, VPS", color="#16A34A")
    draw_device(ax, 1.5, 1.2, 1.3, 1.1, "Studio Số hóa", "4 Nguồn Panorama & 2 Động cơ 3D", kind="desktop")
    draw_database(ax, 9.0, 1.2, 1.1, 1.1, "Thương mại & Soát vé", "VietQR PayOS & Vé AES-256", color="#9333EA")
    
    # Connectors
    draw_step_arrow(ax, 4.0, 2.8, 2.2, 3.8, label="Trải nghiệm WebGL")
    draw_step_arrow(ax, 6.5, 2.8, 8.3, 3.8, label="Vận hành CMS")
    draw_step_arrow(ax, 4.0, 2.2, 2.2, 1.3, label="Nạp ảnh 8K & 3D")
    draw_step_arrow(ax, 6.5, 2.2, 8.3, 1.3, label="Thanh toán & Vé")
    
    plt.title("HÌNH 1.1: SƠ ĐỒ TƯ DUY KIẾN TRÚC VÀ PHÂN CẤP CHỨC NĂNG HỆ THỐNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_1_3():
    """Hinh 1.3: Quy trinh khao sat va so hoa thuc dia tai bao tang"""
    fig, ax = plt.subplots(figsize=(10.5, 3.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.0); ax.axis('off')
    
    stages = [
        ("ĐỢT 1: KHẢO SÁT", "Đo đạc 18 phòng trưng bày\nXây dựng ma trận kề Topo", 1.3, "#0284C7"),
        ("ĐỢT 2: CHỤP ẢNH 8K", "Ống kính Fisheye & Chân máy\nLọc sắc nét Laplacian", 3.9, "#16A34A"),
        ("ĐỢT 3: SỐ HÓA 3D", "Photogrammetry 72 góc chụp\nTái tạo Local CPU & TRELLIS", 6.5, "#D97706"),
        ("ĐỢT 4: THỬ NGHIỆM", "Quét mã VietQR PayOS\nSoát vé Camera thực địa 150ms", 9.1, "#9333EA")
    ]
    for i, (title, sub, x, color) in enumerate(stages):
        draw_clean_node(ax, x, 1.5, 2.1, 1.3, title, sub, bg="#F8FAFC", border=color, lw=1.8)
        if i < 3:
            next_x = stages[i+1][2]
            draw_step_arrow(ax, x + 1.05, 1.5, next_x - 1.05, 1.5, step=str(i+1), label="")
            
    plt.title("HÌNH 1.3: QUY TRÌNH 4 ĐỢT KHẢO SÁT VÀ THU THẬP DỮ LIỆU TẠI BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_3_khao_sat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_1():
    """Hinh 2.1: Mo hinh chuyen doi giua he toa do cau 3D va anh phang Equirectangular 2D"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    # --- LEFT: 3D SPHERE WIREFRAME ---
    cx, cy, R = 2.4, 2.2, 1.55
    # Outer circle
    circle = patches.Circle((cx, cy), R, facecolor='#F8FAFC', edgecolor='#1E293B', lw=1.8, zorder=2)
    ax.add_patch(circle)
    # Latitude ellipses (parallels)
    eq = patches.Arc((cx, cy), 2*R, 0.8, angle=0, theta1=0, theta2=360, color='#2563EB', lw=1.6, zorder=3)
    ax.add_patch(eq)
    lat_pos = patches.Arc((cx, cy + 0.7), 2*R*0.75, 0.5, angle=0, theta1=0, theta2=360, color='#64748B', lw=1.0, ls='--', zorder=3)
    ax.add_patch(lat_pos)
    lat_neg = patches.Arc((cx, cy - 0.7), 2*R*0.75, 0.5, angle=0, theta1=0, theta2=360, color='#64748B', lw=1.0, ls='--', zorder=3)
    ax.add_patch(lat_neg)
    
    # Longitude meridians
    mer0 = patches.Arc((cx, cy), 0.8, 2*R, angle=0, theta1=0, theta2=360, color='#2563EB', lw=1.4, zorder=3)
    ax.add_patch(mer0)
    mer1 = patches.Arc((cx, cy), 1.9, 2*R, angle=0, theta1=0, theta2=360, color='#94A3B8', lw=1.0, ls=':', zorder=3)
    ax.add_patch(mer1)
    
    # Axes X, Y, Z
    ax.annotate('', xy=(cx, cy + R + 0.38), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.4), zorder=4)
    ax.text(cx + 0.08, cy + R + 0.40, 'Z (Trục Bắc)', fontsize=8.5, fontweight='bold', color='#0F172A')
    
    ax.annotate('', xy=(cx + R + 0.38, cy), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.4), zorder=4)
    ax.text(cx + R + 0.40, cy - 0.05, 'Y', fontsize=8.5, fontweight='bold', color='#0F172A')
    
    ax.annotate('', xy=(cx - 0.85, cy - 0.8), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.4), zorder=4)
    ax.text(cx - 1.0, cy - 0.9, 'X', fontsize=8.5, fontweight='bold', color='#0F172A')
    
    # Center O
    ax.plot(cx, cy, 'o', color='#0F172A', markersize=4, zorder=5)
    ax.text(cx - 0.24, cy + 0.05, 'O(0,0,0)', fontsize=8, color='#0F172A')
    
    # Target Point P(X, Y, Z) on surface
    px, py = cx + 0.8, cy + 0.88
    ax.annotate('', xy=(px, py), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.8), zorder=5)
    ax.plot(px, py, 'o', color='#DC2626', markersize=6, zorder=6)
    ax.text(px + 0.1, py + 0.08, 'P(X, Y, Z)', fontsize=9, fontweight='bold', color='#DC2626')
    
    # Projection down to equator plane
    proj_x, proj_y = cx + 0.8, cy + 0.14
    ax.plot([px, proj_x], [py, proj_y], 'r--', lw=1.0, zorder=4)
    ax.plot([cx, proj_x], [cy, proj_y], color='#1E293B', ls='--', lw=1.0, zorder=4)
    ax.plot(proj_x, proj_y, 'ro', markersize=3.5, zorder=5)
    
    # Angles theta (azimuth) and phi (elevation)
    ax.text(cx + 0.42, cy + 0.02, r'$\theta$', fontsize=9.5, fontweight='bold', color='#2563EB')
    ax.text(cx + 0.45, cy + 0.45, r'$\phi$', fontsize=9.5, fontweight='bold', color='#DC2626')
    
    # Subtitle for sphere
    ax.text(cx, cy - R - 0.32, 'Mặt cầu 3D đơn vị ($X^2 + Y^2 + Z^2 = 1$)\nBán kính $R = 1$, Tọa độ cầu $(r=1, \\theta, \\phi)$',
            ha='center', va='top', fontsize=8.5, fontweight='bold', color='#1E293B')
    
    # --- MIDDLE: PROJECTION TRANSFORMATION ARROWS ---
    ax.annotate('', xy=(5.9, 2.6), xytext=(4.4, 2.6),
                arrowprops=dict(arrowstyle='->', color='#2563EB', lw=1.8, mutation_scale=12), zorder=5)
    ax.text(5.15, 2.75, 'Chiếu góc (2.1 - 2.2)\n' + r'$\theta = \arctan2(X, -Z)$' + '\n' + r'$\phi = \arcsin(Y)$',
            ha='center', va='bottom', fontsize=7.5, color='#1E293B',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#93C5FD', lw=0.8))
    
    ax.annotate('', xy=(4.4, 1.4), xytext=(5.9, 1.4),
                arrowprops=dict(arrowstyle='->', color='#16A34A', lw=1.8, mutation_scale=12), zorder=5)
    ax.text(5.15, 1.25, 'Chiếu ngược (2.3 - 2.4)\n$X = -\\cos\\phi\\sin\\theta$\n$Y = \\sin\\phi, Z = -\\cos\\phi\\cos\\theta$',
            ha='center', va='top', fontsize=7.5, color='#1E293B',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#F0FDF4', edgecolor='#86EFAC', lw=0.8))
    
    # --- RIGHT: EQUIRECTANGULAR 2D CANVAS (2:1 RATIO) ---
    rx, ry, rw, rh = 6.4, 1.25, 3.6, 1.8
    rect = patches.Rectangle((rx, ry), rw, rh, facecolor='#F8FAFC', edgecolor='#16A34A', lw=1.8, zorder=2)
    ax.add_patch(rect)
    
    # Grid lines (parallels and meridians in 2D)
    for i in range(1, 4):
        gy = ry + i * (rh / 4)
        ax.plot([rx, rx + rw], [gy, gy], color='#E2E8F0', lw=0.8, ls=':', zorder=3)
    for j in range(1, 8):
        gx = rx + j * (rw / 8)
        ax.plot([gx, gx], [ry, ry + rh], color='#E2E8F0', lw=0.8, ls=':', zorder=3)
    ax.plot([rx, rx + rw], [ry + rh/2, ry + rh/2], color='#2563EB', lw=1.4, ls='--', zorder=3)
    ax.text(rx + rw + 0.08, ry + rh/2, r'$\phi = 0$ (Xích đạo)', fontsize=7.5, va='center', color='#2563EB')
    
    # Pixel point p(x, y) matching P(X, Y, Z)
    pix_x = rx + 0.65 * rw
    pix_y = ry + 0.72 * rh
    ax.plot(pix_x, pix_y, 'ro', markersize=6, zorder=6)
    ax.text(pix_x + 0.1, pix_y + 0.08, 'p(x, y)', fontsize=9, fontweight='bold', color='#DC2626')
    ax.plot([rx, pix_x], [pix_y, pix_y], 'r:', lw=0.8)
    ax.plot([pix_x, pix_x], [ry + rh, pix_y], 'r:', lw=0.8)
    
    ax.text(rx, ry + rh + 0.08, '(0, 0)', fontsize=7.5, color='#475569')
    ax.text(rx + rw, ry + rh + 0.08, f'(W, 0)', fontsize=7.5, ha='right', color='#475569')
    ax.text(rx, ry - 0.15, '(0, H)', fontsize=7.5, color='#475569')
    ax.text(rx + rw, ry - 0.15, f'(W, H)', fontsize=7.5, ha='right', color='#475569')
    
    ax.text(rx + rw/2, ry + rh + 0.12, r'Cực Bắc ($\phi = +\pi/2$)', fontsize=7.5, ha='center', color='#0F172A')
    ax.text(rx + rw/2, ry - 0.28, r'Cực Nam ($\phi = -\pi/2$)', fontsize=7.5, ha='center', color='#0F172A')
    
    ax.text(rx + rw/2, ry - 0.52, 'Ảnh phẳng Equirectangular ($W \\times H$, tỷ lệ 2:1)\n$x = (\\theta + \\pi) / (2\\pi) \\cdot W, \\quad y = (\\pi/2 - \\phi) / \\pi \\cdot H$',
            ha='center', va='top', fontsize=8.5, fontweight='bold', color='#1E293B')
    
    plt.title("HÌNH 2.1: MÔ HÌNH CHUYỂN ĐỔI HÌNH HỌC GIỮA HỆ TỌA ĐỘ CẦU 3D VÀ ẢNH PHẲNG EQUIRECTANGULAR 2D",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_2():
    """Hinh 2.2: Quy trinh nan chinh bien dang hinh hoc tru (Cylindrical Warping)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    cam_x, cam_y = 1.2, 2.1
    f = 2.4
    
    # Camera Center C
    ax.plot(cam_x, cam_y, 'o', color='#0F172A', markersize=6, zorder=6)
    ax.text(cam_x - 0.1, cam_y - 0.22, 'C (Tâm quang học)', fontsize=8.5, fontweight='bold', ha='right', color='#0F172A')
    
    # Optical Axis
    ax.plot([cam_x, cam_x + f + 1.2], [cam_y, cam_y], color='#64748B', ls='--', lw=1.2, zorder=2)
    ax.text(cam_x + f/2, cam_y + 0.1, f'Tiêu cự f = {f}', fontsize=8, color='#475569', ha='center')
    
    # Flat image sensor plane
    sensor_x = cam_x + f
    ax.plot([sensor_x, sensor_x], [cam_y - 1.5, cam_y + 1.5], color='#2563EB', lw=2.2, zorder=3)
    ax.text(sensor_x - 0.08, cam_y + 1.6, 'Mặt phẳng cảm biến (Ảnh phẳng)\n$x_p \\in [-W/2, W/2]$',
            fontsize=8, fontweight='bold', ha='center', color='#2563EB')
    
    # Curved Cylindrical Surface Arc
    theta_arc = np.linspace(-np.pi/4, np.pi/4, 100)
    arc_x = cam_x + f * np.cos(theta_arc)
    arc_y = cam_y + f * np.sin(theta_arc)
    ax.plot(arc_x, arc_y, color='#16A34A', lw=2.6, zorder=4)
    ax.text(cam_x + f + 0.2, cam_y - 1.55, 'Mặt trụ bán kính f\n$x_{cyl} = f \\cdot \\theta$',
            fontsize=8, fontweight='bold', ha='left', color='#16A34A')
    
    # Projection Rays
    y_p1 = cam_y + 1.1
    theta1 = np.arctan((y_p1 - cam_y) / f)
    cyl_x1 = cam_x + f * np.cos(theta1)
    cyl_y1 = cam_y + f * np.sin(theta1)
    ax.plot([cam_x, cyl_x1 + 0.4], [cam_y, cyl_y1 + 0.4 * np.tan(theta1)], color='#DC2626', ls='-', lw=1.5, zorder=5)
    ax.plot(sensor_x, y_p1, 'bo', markersize=5, zorder=6)
    ax.text(sensor_x - 0.12, y_p1 + 0.12, '$p(x_p, y_p)$', fontsize=8.5, fontweight='bold', color='#2563EB', ha='right')
    ax.plot(cyl_x1, cyl_y1, 'go', markersize=6, zorder=6)
    ax.text(cyl_x1 + 0.1, cyl_y1 + 0.1, '$p_{cyl}(x_{cyl}, y_{cyl})$', fontsize=8.5, fontweight='bold', color='#16A34A')
    
    y_p2 = cam_y - 0.9
    theta2 = np.arctan((y_p2 - cam_y) / f)
    cyl_x2 = cam_x + f * np.cos(theta2)
    cyl_y2 = cam_y + f * np.sin(theta2)
    ax.plot([cam_x, cyl_x2 + 0.4], [cam_y, cyl_y2 + 0.4 * np.tan(theta2)], color='#DC2626', ls='-', lw=1.5, zorder=5)
    ax.plot(sensor_x, y_p2, 'bo', markersize=5, zorder=6)
    ax.plot(cyl_x2, cyl_y2, 'go', markersize=6, zorder=6)
    
    arc_ang = patches.Arc((cam_x, cam_y), 1.4, 1.4, angle=0, theta1=0, theta2=np.degrees(theta1), color='#DC2626', lw=1.4)
    ax.add_patch(arc_ang)
    ax.text(cam_x + 0.85, cam_y + 0.18, r'$\theta$', fontsize=9, fontweight='bold', color='#DC2626')
    
    # --- RIGHT PANEL: FORMULA & BEFORE/AFTER COMPARISON ---
    fb = patches.FancyBboxPatch((6.0, 2.5), 4.2, 1.4, boxstyle='round,pad=0.03,rounding_size=0.08',
                                facecolor='#EFF6FF', edgecolor='#3B82F6', lw=1.5, zorder=3)
    ax.add_patch(fb)
    ax.text(8.1, 3.65, 'CÔNG THỨC BIẾN ĐỔI HÌNH HỌC (2.5 – 2.8)', fontsize=8.5, fontweight='bold', ha='center', color='#1E40AF')
    ax.text(8.1, 3.25, r'$x_{cyl} = f \cdot \arctan\left(\frac{x_p}{f}\right) + \frac{W}{2}$', fontsize=9, ha='center', color='#0F172A')
    ax.text(8.1, 2.85, r'$y_{cyl} = f \cdot \frac{y_p}{\sqrt{x_p^2 + f^2}} + \frac{H}{2}$', fontsize=9, ha='center', color='#0F172A')
    ax.text(8.1, 2.55, 'Nội suy Bilinear trị số mức xám 4 điểm lân cận', fontsize=7.5, fontstyle='italic', ha='center', color='#475569')
    
    ax.text(6.8, 2.15, '1. Ảnh phẳng gốc (Góc rộng):', fontsize=8, fontweight='bold', color='#1E293B')
    f1 = patches.Polygon([[6.2, 0.7], [7.8, 0.7], [8.0, 1.9], [6.0, 1.9]], facecolor='#F1F5F9', edgecolor='#64748B', lw=1.2)
    ax.add_patch(f1)
    ax.text(7.0, 1.3, 'Biến dạng mép\n(Cột bị choãi)', ha='center', va='center', fontsize=7.5, color='#64748B')
    
    ax.text(9.2, 2.15, '2. Ảnh đã nắn trụ:', fontsize=8, fontweight='bold', color='#16A34A')
    curve_x = np.linspace(8.4, 10.0, 40)
    top_y = 1.9 - 0.15 * (1 - ((curve_x - 9.2)/0.8)**2)
    bot_y = 0.7 + 0.15 * (1 - ((curve_x - 9.2)/0.8)**2)
    verts = list(zip(curve_x, top_y)) + list(zip(curve_x[::-1], bot_y[::-1]))
    f2 = patches.Polygon(verts, facecolor='#ECFDF5', edgecolor='#16A34A', lw=1.5)
    ax.add_patch(f2)
    ax.text(9.2, 1.3, 'Triệt tiêu mép cong\nGhép mí liên tục', ha='center', va='center', fontsize=7.5, fontweight='bold', color='#16A34A')
    
    plt.title("HÌNH 2.2: QUY TRÌNH NẮN CHỈNH BIẾN DẠNG HÌNH HỌC TRỤ (CYLINDRICAL WARPING)",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_2_cylindrical_warping.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_3():
    """Hinh 2.3: Thap khong gian ty le Gauss, sai phan DoG va phat hien cuc tri 26 diem lan can"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    # --- LEFT: GAUSSIAN SCALE SPACE & DoG PYRAMID ---
    ax.text(2.6, 4.15, 'THÁP GAUSS L(x, y, σ) & SAI PHÂN DoG D(x, y, σ)', fontsize=8.5, fontweight='bold', ha='center', color='#0F172A')
    
    def draw_plane(x, y, w, h, slant, color, border, label=''):
        pts = [[x, y], [x + w, y], [x + w + slant, y + h], [x + slant, y + h]]
        p = patches.Polygon(pts, facecolor=color, edgecolor=border, lw=1.2, zorder=3)
        ax.add_patch(p)
        if label:
            ax.text(x + w/2 + slant/2, y + h/2, label, ha='center', va='center', fontsize=7, color='#1E293B', zorder=4)
            
    g_colors = ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA']
    sigmas = ['σ', 'kσ', 'k²σ', 'k³σ']
    for i in range(4):
        draw_plane(0.8, 0.4 + i*0.42, 1.8, 0.32, 0.4, g_colors[i], '#1D4ED8', f'L(x,y,{sigmas[i]})')
    ax.text(0.6, 1.1, 'Octave 1\n(W × H)', fontsize=7.5, fontweight='bold', color='#1D4ED8', ha='right')
    
    dog_colors = ['#FEF3C7', '#FDE68A', '#FCD34D']
    for i in range(3):
        ax.annotate('', xy=(3.4, 0.65 + i*0.42), xytext=(2.9, 0.65 + i*0.42),
                    arrowprops=dict(arrowstyle='->', color='#B45309', lw=1.2), zorder=4)
        draw_plane(3.5, 0.5 + i*0.42, 1.6, 0.30, 0.35, dog_colors[i], '#D97706', f'DoG {i+1}')
    ax.text(5.4, 1.1, 'DoG Octave 1\n' + r'$D = L_{i+1} - L_i$', fontsize=7.5, fontweight='bold', color='#B45309')
    
    for i in range(3):
        draw_plane(1.1, 2.3 + i*0.38, 1.2, 0.24, 0.28, g_colors[i], '#1D4ED8', f'O2-{i+1}')
    ax.text(0.9, 2.8, 'Octave 2\n(W/2 × H/2)', fontsize=7.5, fontweight='bold', color='#1D4ED8', ha='right')
    
    ax.annotate('', xy=(1.7, 2.25), xytext=(1.7, 1.95),
                arrowprops=dict(arrowstyle='->', color='#0F172A', lw=1.4, ls=':'), zorder=5)
    ax.text(1.85, 2.1, 'Lấy mẫu giảm /2', fontsize=7, color='#475569')
    
    # --- RIGHT: 26-NEIGHBOR CUBE EXTREMA DETECTION ---
    ax.text(8.2, 4.15, 'TÌM CỰC TRỊ KHÔNG GIAN TỶ LỆ (26 ĐIỂM LÂN CẬN)', fontsize=8.5, fontweight='bold', ha='center', color='#0F172A')
    
    scales = [('Mức tỷ lệ σ_{i+1} (9 điểm lân cận trên)', 2.9, '#FEE2E2', '#EF4444'),
              ('Mức tỷ lệ σ_i (8 lân cận + điểm xét X)', 1.7, '#FEF08A', '#CA8A04'),
              ('Mức tỷ lệ σ_{i-1} (9 điểm lân cận dưới)', 0.5, '#DBEAFE', '#2563EB')]
              
    for title, base_y, fcolor, bcolor in scales:
        pw, ph, ps = 2.4, 0.8, 0.6
        px = 7.0
        draw_plane(px, base_y, pw, ph, ps, fcolor, bcolor)
        ax.text(px + pw + ps + 0.15, base_y + ph/2, title, fontsize=7.5, color=bcolor, fontweight='bold', va='center')
        
        for row in range(3):
            for col in range(3):
                gx = px + 0.3 + col * (pw - 0.6)/2 + row * (ps / 2)
                gy = base_y + 0.15 + row * (ph - 0.3)/2
                if base_y == 1.7 and row == 1 and col == 1:
                    ax.plot(gx, gy, 'rx', markersize=9, mew=2.5, zorder=6)
                    ax.text(gx + 0.12, gy + 0.12, 'X (Xét cực trị)', fontsize=8, fontweight='bold', color='#DC2626')
                else:
                    ax.plot(gx, gy, 'o', color=bcolor, markersize=4.5, zorder=5)
                    
    ax.annotate('', xy=(7.9, 2.3), xytext=(7.9, 2.7),
                arrowprops=dict(arrowstyle='<->', color='#DC2626', lw=1.4), zorder=6)
    ax.annotate('', xy=(7.9, 1.5), xytext=(7.9, 1.1),
                arrowprops=dict(arrowstyle='<->', color='#DC2626', lw=1.4), zorder=6)
    ax.text(6.8, 0.15, 'Điều kiện: Điểm X là cực đại hoặc cực tiểu so với toàn bộ 26 điểm lân cận trong khối 3×3×3',
            fontsize=7.8, fontweight='bold', color='#1E293B')
            
    plt.title("HÌNH 2.3: THÁP KHÔNG GIAN TỶ LỆ GAUSS, SAI PHÂN DoG VÀ PHÁT HIỆN CỰC TRỊ 26 ĐIỂM LÂN CẬN",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_3_dog_sift.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_4():
    """Hinh 2.4: So khop dac trung SIFT va loai bo ngoai lai (Outliers) bang thuat toan RANSAC"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    # Frame 1 (Left Image I1)
    f1_x, f1_y, fw, fh = 0.8, 1.2, 3.8, 2.5
    rect1 = patches.FancyBboxPatch((f1_x, f1_y), fw, fh, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor='#F8FAFC', edgecolor='#1E293B', lw=1.6, zorder=2)
    ax.add_patch(rect1)
    ax.text(f1_x + fw/2, f1_y + fh - 0.22, 'Khung ảnh 1: $I_1(x, y)$ (Góc nhìn trái)',
            fontsize=8.5, fontweight='bold', ha='center', color='#1E293B')
    
    vase1 = patches.Ellipse((f1_x + fw/2 - 0.2, f1_y + fh/2 - 0.2), 1.6, 1.8, facecolor='#E2E8F0', edgecolor='#94A3B8', lw=1.2, zorder=3)
    ax.add_patch(vase1)
    
    # Frame 2 (Right Image I2)
    f2_x, f2_y = 5.9, 1.2
    rect2 = patches.FancyBboxPatch((f2_x, f2_y), fw, fh, boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor='#F8FAFC', edgecolor='#1E293B', lw=1.6, zorder=2)
    ax.add_patch(rect2)
    ax.text(f2_x + fw/2, f2_y + fh - 0.22, 'Khung ảnh 2: $I_2(x\', y\')$ (Góc nhìn phải)',
            fontsize=8.5, fontweight='bold', ha='center', color='#1E293B')
            
    vase2 = patches.Ellipse((f2_x + fw/2 + 0.2, f2_y + fh/2 - 0.2), 1.6, 1.8, facecolor='#E2E8F0', edgecolor='#94A3B8', lw=1.2, zorder=3)
    ax.add_patch(vase2)
    
    # Inliers
    inliers = [
        ((f1_x + 1.2, f1_y + 1.8), (f2_x + 1.6, f2_y + 1.8)),
        ((f1_x + 2.1, f1_y + 2.0), (f2_x + 2.5, f2_y + 2.0)),
        ((f1_x + 1.7, f1_y + 1.4), (f2_x + 2.1, f2_y + 1.4)),
        ((f1_x + 2.4, f1_y + 1.2), (f2_x + 2.8, f2_y + 1.2)),
        ((f1_x + 1.1, f1_y + 0.8), (f2_x + 1.5, f2_y + 0.8)),
        ((f1_x + 2.6, f1_y + 0.6), (f2_x + 3.0, f2_y + 0.6)),
    ]
    for pt1, pt2 in inliers:
        ax.plot(pt1[0], pt1[1], 'o', color='#2563EB', markersize=5, zorder=5)
        ax.plot(pt2[0], pt2[1], 'o', color='#2563EB', markersize=5, zorder=5)
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='#16A34A', lw=1.5, alpha=0.85, zorder=4)
        
    # Outliers
    outliers = [
        ((f1_x + 3.2, f1_y + 2.2), (f2_x + 0.8, f2_y + 0.5)),
        ((f1_x + 0.6, f1_y + 2.1), (f2_x + 3.4, f2_y + 1.9)),
    ]
    for pt1, pt2 in outliers:
        ax.plot(pt1[0], pt1[1], 's', color='#DC2626', markersize=5, zorder=5)
        ax.plot(pt2[0], pt2[1], 's', color='#DC2626', markersize=5, zorder=5)
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color='#DC2626', lw=1.2, ls='--', alpha=0.7, zorder=4)
        mx, my = (pt1[0] + pt2[0])/2, (pt1[1] + pt2[1])/2
        ax.plot(mx, my, 'rx', markersize=8, mew=2, zorder=6)
        
    ax.plot([1.2, 1.6], [0.6, 0.6], color='#16A34A', lw=2.0)
    ax.plot(1.4, 0.6, 'o', color='#2563EB', markersize=5)
    ax.text(1.7, 0.6, r'Cặp điểm Inlier chuẩn xác (Đạt ngưỡng RANSAC: $\|p_2 - H p_1\| < 3.0$ pixel)',
            fontsize=8, fontweight='bold', color='#16A34A', va='center')
            
    ax.plot([6.2, 6.6], [0.6, 0.6], color='#DC2626', lw=1.5, ls='--')
    ax.plot(6.4, 0.6, 'rx', markersize=7, mew=1.8)
    ax.text(6.7, 0.6, 'Ngoại lai Outlier bị RANSAC triệt tiêu (Sai lệch phản chiếu tủ kính / đèn)',
            fontsize=8, fontweight='bold', color='#DC2626', va='center')
            
    ax.text(5.25, 3.2, 'Ước lượng ma trận\nHomography H\n' + r'$p_2 \sim H \cdot p_1$',
            ha='center', va='center', fontsize=8, fontweight='bold', color='#1E40AF',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#93C5FD', lw=1.0))
            
    plt.title("HÌNH 2.4: SO KHỚP ĐẶC TRƯNG SIFT VÀ LOẠI BỎ NGOẠI LAI (OUTLIERS) BẰNG RANSAC",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_4_ransac.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_5():
    """Hinh 2.5: Toi uu duong cat mi Voronoi va hoa tron da dai tan (Multiband Blending)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    ax.text(5.25, 4.15, 'TÌM ĐƯỜNG GHÉP MÍ TỐI ƯU TRÁNH CẮT QUA HIỆN VẬT (VORONOI SEAM CUTTING)',
            fontsize=8.5, fontweight='bold', ha='center', color='#0F172A')
            
    f1 = patches.Rectangle((1.0, 2.3), 4.2, 1.6, facecolor='#EFF6FF', edgecolor='#1D4ED8', lw=1.5, zorder=2)
    f2 = patches.Rectangle((3.6, 2.3), 4.2, 1.6, facecolor='#F0FDF4', edgecolor='#16A34A', lw=1.5, zorder=2)
    ax.add_patch(f1); ax.add_patch(f2)
    
    ax.text(2.2, 2.45, 'Ảnh 1 (Bên trái)', fontsize=8, fontweight='bold', color='#1D4ED8')
    ax.text(6.4, 2.45, 'Ảnh 2 (Bên phải)', fontsize=8, fontweight='bold', color='#16A34A')
    ax.text(4.4, 3.75, 'Vùng chồng lấp\n(Overlap 40%)', fontsize=7.5, ha='center', color='#475569')
    
    artifact = patches.Circle((4.2, 3.1), 0.32, facecolor='#CBD5E1', edgecolor='#475569', lw=1.2, zorder=3)
    ax.add_patch(artifact)
    ax.text(4.2, 3.1, 'Cổ vật', fontsize=7, ha='center', va='center', color='#1E293B', zorder=4)
    
    ax.plot([4.2, 4.2], [2.3, 3.9], color='#DC2626', ls='--', lw=1.4, zorder=4)
    ax.text(4.2, 2.15, 'Đường cắt thẳng (Lỗi cắt đôi hiện vật)', fontsize=7, ha='center', color='#DC2626')
    
    seam_y = np.linspace(2.3, 3.9, 100)
    seam_x = 4.8 + 0.35 * np.sin((seam_y - 2.3)*np.pi/1.6)
    ax.plot(seam_x, seam_y, color='#10B981', lw=2.5, zorder=5)
    ax.text(5.3, 3.1, 'Đường cắt tối ưu\n(Uốn lượn tránh cổ vật)', fontsize=7.5, fontweight='bold', color='#047857')
    
    # Bottom Multiband
    ax.text(5.25, 1.85, 'HÒA TRỘN ĐA DẢI TẦN SỐ (MULTIBAND LAPLACIAN BLENDING)',
            fontsize=8.5, fontweight='bold', ha='center', color='#0F172A')
            
    ax.text(1.2, 1.4, 'Tần số cao (Chi tiết nét):', fontsize=7.8, fontweight='bold', color='#1E293B')
    ax.plot([3.5, 4.6], [1.4, 1.4], color='#2563EB', lw=1.5)
    ax.plot([4.6, 5.0], [1.4, 1.4], color='#10B981', lw=2.5)
    ax.plot([5.0, 6.1], [1.4, 1.4], color='#16A34A', lw=1.5)
    ax.text(7.2, 1.4, 'Cửa sổ hòa trộn hẹp (Triệt tiêu hiện tượng bóng mờ Ghosting)', fontsize=7.5, color='#475569')
    
    ax.text(1.2, 0.85, 'Tần số thấp (Ánh sáng/Màu):', fontsize=7.8, fontweight='bold', color='#1E293B')
    ax.plot([3.5, 4.0], [0.85, 0.85], color='#2563EB', lw=1.5)
    trans_x = np.linspace(4.0, 5.6, 50)
    trans_y = np.full_like(trans_x, 0.85)
    ax.plot(trans_x, trans_y, color='#F59E0B', lw=3.0)
    ax.plot([5.6, 6.1], [0.85, 0.85], color='#16A34A', lw=1.5)
    ax.text(7.2, 0.85, 'Cửa sổ hòa trộn rộng (Triệt tiêu độ chênh sáng giữa 2 khung hình)', fontsize=7.5, color='#475569')
    
    ax.text(5.25, 0.25, 'Kết quả: Bức ảnh Panorama 360° đồng nhất 100% về độ sáng, không có vết nứt hay bóng ma tại mối nối',
            fontsize=8, fontweight='bold', ha='center', color='#15803D')
            
    plt.title("HÌNH 2.5: QUY TRÌNH TỐI ƯU ĐƯỜNG GHÉP MÍ VÀ HÒA TRỘN ĐA DẢI TẦN (VORONOI SEAM & MULTIBAND)",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_5_seam_blending.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_6():
    """Hinh 2.6: Nguyen ly anh xa Texture Panorama len mat cau 3D va Hotspot trong Three.js"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    cx, cy, R = 3.6, 2.1, 1.55
    sphere_back = patches.Circle((cx, cy), R, facecolor='#0F172A', edgecolor='#334155', lw=1.8, zorder=2)
    ax.add_patch(sphere_back)
    
    for i in [-0.9, -0.45, 0.0, 0.45, 0.9]:
        arc = patches.Arc((cx, cy + i), 2*np.sqrt(max(0.1, R**2 - i**2)), 0.6,
                          angle=0, theta1=180, theta2=360, color='#38BDF8', lw=0.9, alpha=0.6, zorder=3)
        ax.add_patch(arc)
    for j in [-0.9, -0.45, 0.0, 0.45, 0.9]:
        arc = patches.Arc((cx + j, cy), 0.6, 2*np.sqrt(max(0.1, R**2 - j**2)),
                          angle=0, theta1=90, theta2=270, color='#38BDF8', lw=0.9, alpha=0.6, zorder=3)
        ax.add_patch(arc)
        
    ax.plot(cx, cy, 'o', color='#F59E0B', markersize=8, zorder=6)
    ax.text(cx - 0.15, cy - 0.28, 'Camera O(0,0,0)\nPerspectiveCamera', fontsize=8, fontweight='bold', ha='right', color='#F59E0B')
    
    cone_target_x, cone_target_y = cx + R*0.75, cy + R*0.55
    cone_pts = [[cx, cy], [cx + 1.6, cy + 0.2], [cx + 1.2, cy + 1.4]]
    cone = patches.Polygon(cone_pts, facecolor='#FEF08A', edgecolor='#EAB308', lw=1.0, alpha=0.35, zorder=4)
    ax.add_patch(cone)
    
    ax.annotate('', xy=(cone_target_x, cone_target_y), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color='#EF4444', lw=1.8), zorder=5)
    ax.text(cx + 0.65, cy + 0.55, 'Tia nhìn (LookAt)', fontsize=7.5, fontweight='bold', color='#EF4444')
    
    ax.plot(cone_target_x, cone_target_y, 'o', color='#EF4444', markersize=9, zorder=7)
    hotspot_ring = patches.Circle((cone_target_x, cone_target_y), 0.22, facecolor='none', edgecolor='#EF4444', lw=1.5, ls='--', zorder=7)
    ax.add_patch(hotspot_ring)
    ax.text(cone_target_x + 0.15, cone_target_y + 0.15, 'Điểm Hotspot Cổ vật\n(X_h, Y_h, Z_h)',
            fontsize=8, fontweight='bold', color='#DC2626')
            
    ax.annotate('', xy=(cx + 0.8, cy - 0.8), xytext=(cx - 0.8, cy - 0.8),
                arrowprops=dict(arrowstyle='<->', color='#10B981', lw=1.6, connectionstyle='arc3,rad=-0.3'), zorder=5)
    ax.text(cx, cy - 1.25, 'Xoay góc nhìn 360° (Yaw θ & Pitch φ) qua OrbitControls', fontsize=8, ha='center', color='#047857', fontweight='bold')
    
    draw_clean_node(ax, 8.4, 3.2, 3.6, 1.2, 'MẶT CẦU INVERTED THREE.JS',
                    'MeshSphereGeometry(R=500, 60, 40)\ngeometry.scale(-1, 1, 1) lật mặt pháp tuyến',
                    bg='#F0F9FF', border='#0284C7', lw=1.4)
                    
    draw_clean_node(ax, 8.4, 1.8, 3.6, 1.2, 'TẢI TEXTURE VÀ GIẢI PHÓNG VRAM',
                    'TextureLoader nạp ảnh 8K WebP\nKhi đổi phòng: texture.dispose() tránh tràn RAM',
                    bg='#FEF2F2', border='#DC2626', lw=1.4)
                    
    draw_clean_node(ax, 8.4, 0.5, 3.6, 0.9, 'TƯƠNG TÁC RAYCASTING & TỐI ƯU',
                    'Raycaster bắt tọa độ chuột -> Kích hoạt Pop-up 3D',
                    bg='#ECFDF5', border='#16A34A', lw=1.4)
                    
    plt.title("HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN MẶT CẦU 3D VÀ HOTSPOT TRONG THREE.JS",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_6_texture_mapping.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_7():
    """Hinh 2.7: Do thi topo 18 phong bao tang va giai thuat Dijkstra tim duong di ngan nhat"""
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.4); ax.axis('off')
    
    garden = patches.FancyBboxPatch((3.2, 1.3), 4.2, 1.8, boxstyle='round,pad=0.04,rounding_size=0.15',
                                   facecolor='#ECFDF5', edgecolor='#10B981', lw=1.5, ls='--', zorder=2)
    ax.add_patch(garden)
    ax.text(5.3, 2.2, 'SÂN VƯỜN TRUNG TÂM / GIẾNG TRỜI\n(Khuôn viên kiến trúc Đông Dương)',
            ha='center', va='center', fontsize=8.5, fontweight='bold', color='#047857')
            
    rooms = {
        'P01': (1.8, 0.6, 'P01: Tiền sử (Cổng vào)'),
        'P02': (3.6, 0.6, 'P02: Đông Sơn'),
        'P03': (5.3, 0.6, 'P03: Chân Lạp'),
        'P04': (7.0, 0.6, 'P04: Phù Nam'),
        'P05': (8.8, 0.6, 'P05: Cần Giờ'),
        'P06': (8.8, 1.6, 'P06: Gốm'),
        'P07': (8.8, 2.6, 'P07: Tượng'),
        'P08': (8.8, 3.6, 'P08: Triều Nguyễn'),
        'P09': (7.2, 3.8, 'P09: Tiền cổ'),
        'P10': (5.3, 3.8, 'P10: Chăm Pa (Bảo vật)'),
        'P11': (3.5, 3.8, 'P11: Óc Eo'),
        'P12': (1.8, 3.8, 'P12: Phật giáo'),
        'P13': (1.0, 3.2, 'P13: Vũ khí'),
        'P14': (1.0, 2.4, 'P14: Trang phục'),
        'P15': (1.0, 1.6, 'P15: Nhạc cụ'),
    }
    
    edges = [
        ('P01', 'P02', '12m'), ('P02', 'P03', '14m'), ('P03', 'P04', '15m'), ('P04', 'P05', '12m'),
        ('P05', 'P06', '10m'), ('P06', 'P07', '12m'), ('P07', 'P08', '14m'),
        ('P08', 'P09', '15m'), ('P09', 'P10', '16m'),
        ('P10', 'P11', '14m'), ('P11', 'P12', '15m'), ('P12', 'P13', '10m'),
        ('P13', 'P14', '11m'), ('P14', 'P15', '10m'), ('P15', 'P01', '12m'),
        ('P03', 'P10', '28m (Xuyên vườn)'),
    ]
    
    shortest_path_edges = [('P01', 'P15'), ('P15', 'P14'), ('P14', 'P13'), ('P13', 'P12'), ('P12', 'P11'), ('P11', 'P10')]
    
    for u, v, w in edges:
        p1, p2 = rooms[u], rooms[v]
        is_shortest = (u, v) in shortest_path_edges or (v, u) in shortest_path_edges
        if is_shortest:
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#16A34A', lw=3.2, zorder=3)
        else:
            ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#CBD5E1', lw=1.6, ls='-', zorder=2)
        mx, my = (p1[0] + p2[0])/2, (p1[1] + p2[1])/2
        ax.text(mx, my, w, fontsize=6.8, ha='center', va='center', color='#475569',
                bbox=dict(boxstyle='round,pad=0.1', facecolor='white', edgecolor='#E2E8F0', lw=0.6), zorder=4)
                
    for code, (x, y, name) in rooms.items():
        is_path = any(code in edge for edge in shortest_path_edges) or code == 'P01' or code == 'P10'
        color = '#16A34A' if code in ['P01', 'P10'] else ('#22C55E' if is_path else '#3B82F6')
        fcolor = '#DCFCE7' if is_path else '#EFF6FF'
        
        node = patches.Circle((x, y), 0.28, facecolor=fcolor, edgecolor=color, lw=1.8, zorder=5)
        ax.add_patch(node)
        ax.text(x, y, code, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#0F172A', zorder=6)
        
    ax.plot(rooms['P01'][0], rooms['P01'][1] - 0.38, '^', color='#16A34A', markersize=9, zorder=7)
    ax.text(rooms['P01'][0], rooms['P01'][1] - 0.52, 'XUẤT PHÁT (P01)', fontsize=7.5, fontweight='bold', color='#16A34A', ha='center')
    
    ax.plot(rooms['P10'][0], rooms['P10'][1] + 0.38, 'v', color='#DC2626', markersize=9, zorder=7)
    ax.text(rooms['P10'][0], rooms['P10'][1] + 0.52, 'ĐÍCH ĐẾN (P10: Bảo vật)', fontsize=7.5, fontweight='bold', color='#DC2626', ha='center')
    
    ax.text(9.4, 4.05, 'LỘ TRÌNH TỐI ƯU DIJKSTRA', fontsize=8, fontweight='bold', color='#16A34A', ha='center')
    ax.text(9.4, 3.75, 'P01 -> P15 -> P14 -> P13\n-> P12 -> P11 -> P10\nTổng cự ly: 72 mét\nThời gian: ~55 giây',
            fontsize=7.2, color='#1E293B', ha='center',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#F0FDF4', edgecolor='#86EFAC', lw=1.0))
            
    plt.title("HÌNH 2.7: SƠ ĐỒ ĐỒ THỊ TOPO 18 PHÒNG VÀ GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG NGẮN NHẤT",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_8():
    """Hinh 2.8: Nguyen ly tai tao mo hinh 3D bang cong nghe Photogrammetry"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    cx, cy = 2.4, 2.1
    artifact = patches.Ellipse((cx, cy), 0.9, 1.4, facecolor='#E2E8F0', edgecolor='#64748B', lw=1.5, zorder=3)
    ax.add_patch(artifact)
    ax.text(cx, cy, 'Hiện vật\nCổ', ha='center', va='center', fontsize=8, fontweight='bold', color='#1E293B', zorder=4)
    
    orbit = patches.Circle((cx, cy), 1.6, facecolor='none', edgecolor='#94A3B8', lw=1.0, ls='--', zorder=2)
    ax.add_patch(orbit)
    
    angles = np.linspace(0, 2*np.pi, 8, endpoint=False)
    for idx, ang in enumerate(angles):
        cam_x = cx + 1.6 * np.cos(ang)
        cam_y = cy + 1.6 * np.sin(ang)
        c_rect = patches.Circle((cam_x, cam_y), 0.16, facecolor='#3B82F6', edgecolor='#1D4ED8', lw=1.2, zorder=5)
        ax.add_patch(c_rect)
        ax.plot([cam_x, cx], [cam_y, cy], color='#EF4444', lw=0.8, ls=':', zorder=3)
    ax.text(cx, cy - 1.85, 'Quỹ đạo chụp 360° (36–72 góc chụp/vòng)\nĐộ chồng lấp giữa 2 ảnh liên tiếp ≥ 70%',
            ha='center', va='top', fontsize=8, fontweight='bold', color='#1E293B')
            
    stages = [
        ('1. BỘ ẢNH ĐA GÓC', '72 ảnh RGB độ phân giải 4K\nChụp vòng tròn đa góc độ', 5.6, 3.2, '#DBEAFE', '#2563EB'),
        ('2. ĐÁM MÂY ĐIỂM SfM', 'Trích xuất đặc trưng SIFT đa ảnh\nĐịnh vị camera & đám mây thưa', 8.8, 3.2, '#FEF08A', '#CA8A04'),
        ('3. LƯỚI ĐA GIÁC MESH', 'Phát triển đám mây dày (MVS)\nTam giác hóa lưới Poisson Mesh', 5.6, 1.2, '#FED7AA', '#EA580C'),
        ('4. DÁN KẾT CẤU & XUẤT GLB', 'Chiếu texture 4K & vật liệu PBR\nXuất tệp mô hình chuẩn .GLB', 8.8, 1.2, '#DCFCE7', '#16A34A')
    ]
    for title, desc, sx, sy, fcol, bcol in stages:
        draw_clean_node(ax, sx, sy, 2.7, 1.1, title, desc, bg=fcol, border=bcol, lw=1.4)
        
    draw_step_arrow(ax, 7.0, 3.2, 7.4, 3.2, step='1')
    draw_step_arrow(ax, 8.8, 2.6, 8.8, 1.8, step='2')
    draw_step_arrow(ax, 7.4, 1.2, 7.0, 1.2, step='3')
    
    plt.title("HÌNH 2.8: NGUYÊN LÝ TÁI TẠO MÔ HÌNH 3D PHOTOGRAMMETRY TỪ BỘ ẢNH ĐA GÓC",
              fontsize=10.0, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_8_photogrammetry.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_2_9():
    """Hinh 2.9: Kien truc 3 tang (Three-tier Architecture) - Algomaster Style"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    # Tier 1: Clients
    draw_device(ax, 1.2, 3.6, 1.0, 1.1, "Trình duyệt Web", "React 18 / Vite", kind="desktop")
    draw_device(ax, 1.2, 1.4, 0.9, 1.1, "Thiết bị Di động", "Mobile WebGL", kind="mobile")
    ax.text(1.2, 4.5, "TẦNG 1: TRÌNH DIỄN", fontsize=9, fontweight='bold', ha='center', color='#1E40AF')
    
    # Tier 2: Gateway & Backend
    draw_server(ax, 4.5, 3.6, w=1.3, h=1.3, title="Nginx Reverse Proxy", sub="SSL / Static Cache", color="#F1F5F9", led_color="#10B981")
    draw_server(ax, 4.5, 1.4, w=1.3, h=1.3, title="Backend REST API", sub="Node.js Express / Python", color="#EFF6FF", led_color="#3B82F6")
    ax.text(4.5, 4.5, "TẦNG 2: NGHIỆP VỤ", fontsize=9, fontweight='bold', ha='center', color='#1E40AF')
    
    # Tier 3: Data & Cloud Services
    draw_database(ax, 8.8, 3.6, w=1.1, h=1.1, title="PostgreSQL 16", sub="Quan hệ & Vé AES", color="#EF4444")
    draw_cloud(ax, 8.8, 1.4, w=1.8, h=1.1, title="PayOS / ZeroGPU", sub="Thanh toán & AI Sinh 3D")
    ax.text(8.8, 4.5, "TẦNG 3: DỮ LIỆU & DỊCH VỤ", fontsize=9, fontweight='bold', ha='center', color='#1E40AF')
    
    # Arrows
    draw_step_arrow(ax, 2.0, 3.6, 3.6, 3.6, label="HTTPS / WSS")
    draw_step_arrow(ax, 2.0, 1.4, 3.6, 1.4, label="REST API")
    draw_step_arrow(ax, 4.5, 2.8, 4.5, 2.2, label="Chuyển tiếp Reverse")
    draw_step_arrow(ax, 5.4, 3.6, 8.0, 3.6, label="SQL Connection")
    draw_step_arrow(ax, 5.4, 1.4, 7.8, 1.4, label="Webhook / REST API")
    
    plt.title("HÌNH 2.9: MÔ HÌNH KIẾN TRÚC 3 TẦNG (THREE-TIER ARCHITECTURE) HỆ THỐNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_10():
    """Hinh 2.10: JWT Auth Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 3.4), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.4); ax.axis('off')
    
    draw_actor(ax, 1.2, 1.7, "Người dùng / Admin", "Client Browser")
    draw_server(ax, 4.8, 1.7, w=1.4, h=1.3, title="API Gateway / Auth", sub="Node.js JWT Verify")
    draw_database(ax, 8.8, 1.7, w=1.1, h=1.1, title="User Database", sub="Bcrypt Hash pass", color="#EF4444")
    
    draw_step_arrow(ax, 2.0, 2.1, 4.0, 2.1, step="1", label="POST /login (Credentials)")
    draw_step_arrow(ax, 5.6, 2.1, 8.1, 2.1, step="2", label="Tra cứu User & Hash")
    draw_step_arrow(ax, 8.1, 1.3, 5.6, 1.3, step="3", label="Xác thực thành công")
    draw_step_arrow(ax, 4.0, 1.3, 2.0, 1.3, step="4", label="Trả về JWT Access Token (24h)")
    
    plt.title("HÌNH 2.10: QUY TRÌNH XÁC THỰC BẢO MẬT VỚI JSON WEB TOKEN (JWT)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_10_jwt_auth.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_11():
    """Hinh 2.11: PayOS Payment Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.8, "Khách mua vé", "Web Browser")
    draw_server(ax, 3.8, 2.8, w=1.3, h=1.3, title="Backend Server", sub="Tạo Payment Link")
    draw_cloud(ax, 6.8, 2.8, w=1.6, h=1.0, title="Cổng PayOS", sub="VietQR Napas 247")
    draw_device(ax, 9.4, 2.8, 0.9, 1.1, "App Ngân hàng", "Quét VietQR", kind="mobile")
    
    draw_database(ax, 3.8, 0.8, w=1.0, h=0.9, title="Database", sub="Lưu vé đã thanh toán", color="#10B981")
    
    draw_step_arrow(ax, 1.6, 3.1, 3.0, 3.1, step="1", label="Chọn vé & Đặt mua")
    draw_step_arrow(ax, 4.5, 3.1, 5.9, 3.1, step="2", label="Tạo link VietQR")
    draw_step_arrow(ax, 7.7, 3.1, 8.8, 3.1, step="3", label="Hiển thị mã QR")
    draw_step_arrow(ax, 9.4, 2.1, 7.6, 2.1, step="4", label="Chuyển khoản thành công")
    draw_step_arrow(ax, 6.0, 2.1, 4.5, 2.1, step="5", label="Webhook PayOS gọi lại")
    draw_step_arrow(ax, 3.8, 2.0, 3.8, 1.4, step="6", label="Cập nhật Vé PAID")
    draw_step_arrow(ax, 3.0, 2.4, 1.6, 2.4, step="7", label="SSE phát vé có mã QR")
    
    plt.title("HÌNH 2.11: QUY TRÌNH THANH TOÁN TỰ ĐỘNG QUA CỔNG VIETQR PAYOS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_11_payos_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_12():
    """Hinh 2.12: QR AES-256 Validation Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 3.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_device(ax, 1.2, 1.6, 0.9, 1.1, "Vé trên Mobile", "QR Code AES-256", kind="mobile")
    draw_device(ax, 4.4, 1.6, 1.0, 1.1, "Camera Soát vé", "Html5Qrcode (Staff)", kind="mobile")
    draw_server(ax, 7.5, 1.6, w=1.3, h=1.3, title="Backend Server", sub="Giải mã AES & Hash")
    draw_database(ax, 9.8, 1.6, w=0.8, h=1.0, title="Vé DB", sub="Đổi USED", color="#EF4444")
    
    draw_step_arrow(ax, 1.8, 1.6, 3.8, 1.6, step="1", label="Quét mã QR 150ms")
    draw_step_arrow(ax, 5.0, 1.6, 6.7, 1.6, step="2", label="POST /tickets/validate")
    draw_step_arrow(ax, 8.2, 1.6, 9.3, 1.6, step="3", label="Kiểm tra & Cập nhật")
    
    plt.title("HÌNH 2.12: QUY TRÌNH MÃ HÓA AES-256 VÀ SOÁT VÉ ĐIỆN TỬ TẠI CỬA BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_12_qr_validation.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_13():
    """Hinh 2.13: Docker Compose Architecture"""
    fig, ax = plt.subplots(figsize=(10.5, 4.5), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.5); ax.axis('off')
    
    host = patches.FancyBboxPatch((0.5, 0.4), 9.5, 3.7, boxstyle='round,pad=0.03,rounding_size=0.1',
                                 facecolor='#F8FAFC', edgecolor='#1E293B', lw=1.8, zorder=1)
    ax.add_patch(host)
    ax.text(0.8, 3.8, "MÁY CHỦ CLOUD VPS UBUNTU 22.04 LTS (DOCKER COMPOSE NETWORK)", fontsize=9.5, fontweight='bold', color='#1E293B')
    
    draw_server(ax, 2.0, 2.0, w=1.6, h=1.8, title="Container: Nginx", sub="Reverse Proxy / SSL 443\nLet's Encrypt Certbot", color="#EFF6FF", led_color="#10B981")
    draw_server(ax, 4.6, 2.0, w=1.6, h=1.8, title="Container: Web FE", sub="React 18 / Vite Build\nPort 80 (Internal)", color="#F0FDF4", led_color="#10B981")
    draw_server(ax, 7.0, 2.0, w=1.6, h=1.8, title="Container: API BE", sub="Node.js Express REST\nPort 5000 (Internal)", color="#EFF6FF", led_color="#3B82F6")
    draw_database(ax, 9.1, 2.0, w=1.0, h=1.2, title="PostgreSQL 16", sub="Port 5432 (Internal)", color="#EF4444")
    
    draw_step_arrow(ax, 2.9, 2.2, 3.7, 2.2, label="/ (Web UI)")
    draw_step_arrow(ax, 2.9, 1.8, 6.1, 1.8, label="/api/*")
    draw_step_arrow(ax, 7.9, 2.0, 8.5, 2.0, label="pg pool")
    
    plt.title("HÌNH 2.13: KIẾN TRÚC ĐÓNG GÓI VÀ TRIỂN KHAI VỚI DOCKER COMPOSE TRÊN VPS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_13_docker_compose.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_1():
    """Hinh 3.1: Use Case Tong Quat (Algomaster style)"""
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 5.0); ax.axis('off')
    
    draw_actor(ax, 1.2, 3.8, "Khách tham quan", "Web / Mobile")
    draw_actor(ax, 1.2, 1.2, "Nhân viên soát vé", "Mobile Camera")
    draw_actor(ax, 9.3, 2.5, "Quản trị viên CMS", "Desktop Web")
    
    ucs = [
        ("UC01: Khám phá Tour 360°", 3.8, 4.2),
        ("UC02: Tương tác Cổ vật 3D", 3.8, 3.4),
        ("UC03: Tìm đường Dijkstra", 3.8, 2.6),
        ("UC04: Mua vé & VietQR", 3.8, 1.8),
        ("UC05: Quét soát vé QR", 3.8, 1.0),
        ("UC06: Studio ghép ảnh 8K", 6.8, 3.8),
        ("UC07: Tái tạo 3D TRELLIS", 6.8, 3.0),
        ("UC08: Quản lý Hotspot & Cổ vật", 6.8, 2.2),
        ("UC09: Thống kê & Báo cáo", 6.8, 1.4)
    ]
    for name, x, y in ucs:
        el = patches.Ellipse((x, y), 2.3, 0.62, facecolor='#F8FAFC', edgecolor='#0284C7', lw=1.3, zorder=3)
        ax.add_patch(el)
        ax.text(x, y, name, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#0F172A', zorder=4)
        
    for i in range(4):
        ax.plot([1.6, 2.65], [3.8, ucs[i][2]], color='#0284C7', lw=1.2, zorder=2)
    ax.plot([1.6, 2.65], [1.2, ucs[4][2]], color='#0284C7', lw=1.2, zorder=2)
    for i in range(5, 9):
        ax.plot([8.8, 7.95], [2.5, ucs[i][2]], color='#16A34A', lw=1.2, zorder=2)
        
    plt.title("HÌNH 3.1: SƠ ĐỒ USE CASE TỔNG QUÁT HỆ THỐNG BẢO TÀNG 360°", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_1_use_case_tong_quat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_5():
    """Hinh 3.5: ERD Database Model"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    tables = [
        ("MUSEUM_ROOMS", ["PK: room_id", "name, description", "panorama_url (8K)", "coords_x, coords_y"], 1.8, 3.6, "#EFF6FF", "#1D4ED8"),
        ("HOTSPOTS", ["PK: hotspot_id", "FK: room_id", "pitch, yaw (Coords)", "FK: artifact_id"], 5.2, 3.6, "#F0FDF4", "#16A34A"),
        ("ARTIFACTS_3D", ["PK: artifact_id", "name, dynasty, era", "model_3d_url (.glb)", "polygon_count, engine"], 8.6, 3.6, "#FEF3C7", "#D97706"),
        ("TICKETS", ["PK: ticket_id", "customer_name, phone", "price, qr_code_hash", "status (PAID/USED)"], 1.8, 1.3, "#FEE2E2", "#DC2626"),
        ("PAYMENT_TRANSACTIONS", ["PK: trans_id", "FK: ticket_id", "payos_order_code", "amount, status"], 5.2, 1.3, "#F3E8FF", "#9333EA"),
        ("ROOM_CONNECTIONS", ["PK: connection_id", "FK: from_room_id", "FK: to_room_id", "distance_meters"], 8.6, 1.3, "#F1F5F9", "#475569")
    ]
    for title, fields, x, y, bg, border in tables:
        rect = patches.FancyBboxPatch((x - 1.25, y - 0.8), 2.5, 1.6, boxstyle='round,pad=0.02,rounding_size=0.06',
                                      facecolor=bg, edgecolor=border, lw=1.6, zorder=3)
        ax.add_patch(rect)
        hdr = patches.Rectangle((x - 1.25, y + 0.45), 2.5, 0.35, facecolor=border, edgecolor='none', zorder=4)
        ax.add_patch(hdr)
        ax.text(x, y + 0.62, title, ha='center', va='center', fontsize=8, fontweight='bold', color='white', zorder=5)
        for idx, f in enumerate(fields):
            is_pk = "PK:" in f; is_fk = "FK:" in f
            col = '#DC2626' if is_pk else ('#2563EB' if is_fk else '#334155')
            ax.text(x - 1.1, y + 0.25 - idx*0.26, f, fontsize=7.2, fontweight=('bold' if (is_pk or is_fk) else 'normal'), color=col, zorder=5)
            
    # Rel lines
    ax.annotate('', xy=(3.95, 3.6), xytext=(3.05, 3.6), arrowprops=dict(arrowstyle='->', color='#1E293B', lw=1.5), zorder=2)
    ax.annotate('', xy=(7.35, 3.6), xytext=(6.45, 3.6), arrowprops=dict(arrowstyle='->', color='#1E293B', lw=1.5), zorder=2)
    ax.annotate('', xy=(3.95, 1.3), xytext=(3.05, 1.3), arrowprops=dict(arrowstyle='->', color='#1E293B', lw=1.5), zorder=2)
    
    plt.title("HÌNH 3.5: SƠ ĐỒ THỰC THỂ QUAN HỆ (ERD) CƠ SỞ DỮ LIỆU BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_5_erd.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_1():
    """Hinh 4.1: CI/CD Pipeline (GitHub Actions to VPS)"""
    fig, ax = plt.subplots(figsize=(10.5, 3.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_actor(ax, 1.0, 1.6, "Lập trình viên", "Git Push main")
    draw_cloud(ax, 3.8, 1.6, w=1.6, h=1.1, title="GitHub Repo", sub="Triggers Actions")
    draw_server(ax, 6.8, 1.6, w=1.4, h=1.3, title="GitHub Runner", sub="Build & Test & Lint\nBuild Docker Images")
    draw_server(ax, 9.4, 1.6, w=1.4, h=1.3, title="Cloud VPS Ubuntu", sub="Deploy Container\nZero Downtime")
    
    draw_step_arrow(ax, 1.8, 1.6, 2.9, 1.6, step="1", label="git push")
    draw_step_arrow(ax, 4.7, 1.6, 6.0, 1.6, step="2", label="Webhook trigger")
    draw_step_arrow(ax, 7.6, 1.6, 8.6, 1.6, step="3", label="SSH deploy script")
    
    plt.title("HÌNH 4.1: QUY TRÌNH TỰ ĐỘNG HÓA TÍCH HỢP VÀ TRIỂN KHAI LIÊN TỤC (CI/CD PIPELINE)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_1_cicd_pipeline.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_3():
    """Hinh 4.3: Panorama Studio 4 Inputs Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    draw_device(ax, 1.2, 3.8, 1.0, 1.0, "1. Webcam Laptop", "Kiểm thử nhanh", kind="desktop")
    draw_device(ax, 1.2, 2.6, 1.0, 1.0, "2. Chọn từ máy", "Ảnh DSLR 8K", kind="desktop")
    draw_device(ax, 1.2, 1.4, 0.9, 1.0, "3. Video quét", "Smartphone / Action Cam", kind="mobile")
    draw_device(ax, 1.2, 0.2, 0.9, 1.0, "4. Quét trực tiếp", "Camera Gyroscope", kind="mobile")
    
    draw_clean_node(ax, 4.8, 2.0, 2.5, 1.5, "XỬ LÝ ẢNH STUDIO", "• Lọc mờ Laplacian (Var ≥ 100)\n• Nắn mặt trụ f (2.5 – 2.8)\n• Khớp SIFT & RANSAC\n• Ghép mí Voronoi Seam", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.6, 2.0, 2.4, 1.5, "ẢNH CẦU 360° HOÀN CHỈNH", "• Equirectangular 8K (2:1)\n• Vá đáy sàn Nadir\n• Tối ưu WebP nạp WebGL 60fps", bg="#F0FDF4", border="#16A34A")
    
    for y_in in [3.8, 2.6, 1.4, 0.2]:
        draw_step_arrow(ax, 1.8, y_in, 3.5, 2.0)
    draw_step_arrow(ax, 6.1, 2.0, 7.3, 2.0, label="Xuất Panorama")
    
    plt.title("HÌNH 4.3: QUY TRÌNH XỬ LÝ GHÉP ẢNH TOÀN CẢNH TỪ 4 NGUỒN ĐẦU VÀO TRONG PANORAMA STUDIO", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_5():
    """Hinh 4.5: So do tai tao 3D voi 2 dong co va Fallback (Algomaster Style)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.4, "Quản trị viên", "Nạp 1 ảnh / Đa ảnh")
    draw_clean_node(ax, 3.4, 2.4, 1.8, 1.1, "Bộ điều phối 3D", "Ưu tiên Cloud AI\nFallback Local CPU")
    
    # Engine 1: Cloud AI (Top)
    draw_cloud(ax, 6.8, 3.6, w=1.8, h=1.1, title="TRELLIS AI Cloud", sub="ZeroGPU A100 (HuggingFace)")
    draw_clean_node(ax, 9.4, 3.6, 1.8, 1.1, "Lưới PBR Chuẩn", "25.000 Poly\nChi tiết 360° sắc nét", bg="#F0FDF4", border="#16A34A")
    
    # Engine 2: Local CPU (Bottom)
    draw_server(ax, 6.8, 1.2, w=1.6, h=1.2, title="Local CPU Server", sub="Python Axial-Radial v15.0\n100% CPU (Xeon)", color="#FEF2F2", led_color="#EF4444")
    draw_clean_node(ax, 9.4, 1.2, 1.8, 1.1, "Lưới Phồng Trục Xoay", "95.000 Poly\nMất chi tiết mặt sau", bg="#FEF2F2", border="#EF4444")
    
    draw_step_arrow(ax, 1.8, 2.4, 2.4, 2.4, label="Gửi ảnh")
    draw_step_arrow(ax, 4.3, 2.7, 5.8, 3.4, step="1", label="Chính: Cloud AI API")
    draw_step_arrow(ax, 7.8, 3.6, 8.4, 3.6, label="Mô hình .GLB")
    
    draw_step_arrow(ax, 4.3, 2.1, 5.9, 1.4, step="2", label="Fallback khi mất mạng / Timeout", color="#EF4444")
    draw_step_arrow(ax, 7.7, 1.2, 8.4, 1.2, label="Mô hình dự phòng", color="#EF4444")
    
    plt.title("HÌNH 4.5: SƠ ĐỒ ĐIỀU PHỐI TÁI TẠO 3D KẾT HỢP GIỮA ĐÁM MÂY TRELLIS VÀ MÁY CHỦ NỘI BỘ", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_6():
    """Hinh 4.6: Anh so sanh thuc te giua Local CPU va TRELLIS AI tu upload cua user"""
    p2 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104558258_b9b7daa7.jpg"
    p3 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104579468_1b0a2492.png"
    if not (os.path.exists(p2) and os.path.exists(p3)):
        return
    import matplotlib.image as mpimg
    img2 = mpimg.imread(p2)
    img3 = mpimg.imread(p3)
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.8), dpi=220)
    ax1.imshow(img2); ax1.axis('off')
    ax1.set_title("A. ĐỘNG CƠ LOCAL CPU (MÁY CHỦ NỘI BỘ)\nLưới phồng đối xứng trục, mất góc cạnh, 95k poly", fontsize=8.5, fontweight='bold', color='#DC2626')
    ax2.imshow(img3); ax2.axis('off')
    ax2.set_title("B. ĐỘNG CƠ CLOUD AI TRELLIS (ZEROGPU A100)\nCấu trúc SLAT 3D đa diện sắc nét, chuẩn PBR, 25k poly", fontsize=8.5, fontweight='bold', color='#16A34A')
    
    plt.suptitle("HÌNH 4.6: SO SÁNH THỰC TẾ KẾT QUẢ TÁI TẠO 3D HIỆN VẬT BẢO TÀNG GIỮA LOCAL CPU VÀ TRELLIS AI",
                 fontsize=9.5, fontweight='bold', y=0.98)
    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_6_so_sanh_3d_thuc_te.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_7():
    """Hinh 4.7: Dijkstra Route Flow trong Panorama Studio"""
    fig, ax = plt.subplots(figsize=(10.5, 4.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.2); ax.axis('off')
    
    # Floor plan navigator on the left
    map_box = patches.FancyBboxPatch((0.8, 0.8), 4.5, 2.8, boxstyle='round,pad=0.03,rounding_size=0.1',
                                     facecolor='#F8FAFC', edgecolor='#334155', lw=1.6, zorder=2)
    ax.add_patch(map_box)
    ax.text(3.05, 3.3, 'BẢN ĐỒ TOPO TƯƠNG TÁC (MINI-MAP)', fontsize=8.5, fontweight='bold', ha='center', color='#0F172A')
    
    # Simulated rooms & path overlay
    pts = [(1.5, 1.3), (2.3, 1.3), (3.1, 1.3), (4.3, 1.3), (4.3, 2.5), (3.1, 2.5), (2.0, 2.5)]
    for i in range(len(pts)-1):
        ax.plot([pts[i][0], pts[i+1][0]], [pts[i][1], pts[i+1][1]], color='#10B981', lw=3.0, zorder=3)
    for p in pts:
        ax.plot(p[0], p[1], 'o', color='#047857', markersize=6, zorder=4)
        
    ax.plot(1.5, 1.3, 'o', color='#2563EB', markersize=9, zorder=5)
    ax.text(1.5, 1.0, 'Bạn đang ở đây\n(Vị trí P01)', ha='center', va='top', fontsize=7.2, fontweight='bold', color='#2563EB')
    
    ax.plot(2.0, 2.5, 'o', color='#DC2626', markersize=9, zorder=5)
    ax.text(2.0, 2.85, 'Đích đến (P10)\nTượng Chăm Pa', ha='center', va='bottom', fontsize=7.2, fontweight='bold', color='#DC2626')
    
    # Algorithmic calculation on the right
    draw_clean_node(ax, 8.2, 3.2, 3.6, 1.2, "1. MA TRẬN TRỌNG SỐ KỀ",
                    "• Đồ thị 18 đỉnh (Phòng) & 24 cạnh (Hành lang)\n• Trọng số là cự ly đo thực tế (mét)", bg="#EFF6FF", border="#1D4ED8")
                    
    draw_clean_node(ax, 8.2, 1.8, 3.6, 1.2, "2. HÀNG ĐỢI ƯU TIÊN MIN-HEAP",
                    "• Độ phức tạp O(E log V)\n• Nới lỏng cạnh: d[v] = min(d[v], d[u] + w)\n• Thời gian tính toán: < 5 miligiây", bg="#FEF3C7", border="#D97706")
                    
    draw_clean_node(ax, 8.2, 0.5, 3.6, 0.9, "3. KẾT QUẢ ĐỊNH TUYẾN",
                    "Hiển thị nét đứt phát sáng & hướng dẫn viên Voice AI", bg="#DCFCE7", border="#16A34A")
                    
    draw_step_arrow(ax, 5.4, 2.2, 6.3, 2.2, label="Định tuyến")
    
    plt.title("HÌNH 4.7: SƠ ĐỒ ĐỊNH TUYẾN VÀ HIỂN THỊ LỘ TRÌNH TỐI ƯU TRÊN MINI-MAP TOUR 360°", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_8():
    """Hinh 4.8: Quy trinh thanh toan VietQR va soat ve Camera (Chuan Algomaster / ByteByteGo)"""
    fig, ax = plt.subplots(figsize=(11.0, 4.8), dpi=220)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.8); ax.axis('off')
    
    draw_actor(ax, 0.8, 3.2, "Khách tham quan", "Mobile / Laptop")
    draw_server(ax, 3.2, 3.2, w=1.3, h=1.4, title="Web & Backend", sub="Node.js / Express")
    draw_cloud(ax, 5.8, 3.2, w=1.6, h=1.0, title="Cổng PayOS", sub="VietQR Napas 247")
    draw_database(ax, 8.5, 3.2, w=1.0, h=1.1, title="PostgreSQL", sub="Tickets DB")
    
    draw_actor(ax, 0.8, 1.1, "Nhân viên bảo tàng", "Camera soát vé")
    draw_server(ax, 3.2, 1.1, w=1.3, h=1.3, title="Trạm Soát Vé", sub="Html5Qrcode Scanner")
    draw_clean_node(ax, 5.8, 1.1, 1.8, 1.1, "Giải mã AES-256", "So khớp chữ ký HMAC\nCheck thời hạn vé", bg="#FEF2F2", border="#EF4444")
    draw_clean_node(ax, 8.5, 1.1, 1.8, 1.1, "Mở Cổng Barie", "Phát âm thanh Bíp\nThời gian: 150ms", bg="#F0FDF4", border="#16A34A")
    
    # Upper flow (Payment)
    draw_step_arrow(ax, 1.4, 3.5, 2.5, 3.5, step="1", label="Đặt vé")
    draw_step_arrow(ax, 3.9, 3.5, 4.9, 3.5, step="2", label="Tạo VietQR")
    draw_step_arrow(ax, 6.7, 3.5, 7.9, 3.5, step="3", label="Webhook Paid")
    draw_step_arrow(ax, 8.0, 2.9, 3.9, 2.9, step="4", label="Lưu vé & Mã hóa AES-256")
    draw_step_arrow(ax, 2.5, 2.9, 1.4, 2.9, step="5", label="Trả QR vé về máy khách")
    
    # Lower flow (Check-in)
    draw_step_arrow(ax, 1.4, 1.1, 2.5, 1.1, step="6", label="Quét mã QR tại cửa")
    draw_step_arrow(ax, 3.9, 1.1, 4.8, 1.1, step="7", label="Xác thực vé")
    draw_step_arrow(ax, 6.8, 1.1, 7.5, 1.1, step="8", label="Vé hợp lệ: Cửa mở")
    draw_step_arrow(ax, 8.5, 1.8, 8.5, 2.5, step="9", label="Đổi trạng thái: USED")
    
    plt.title("HÌNH 4.8: QUY TRÌNH KỸ THUẬT THANH TOÁN VIETQR VÀ SOÁT VÉ ĐIỆN TỬ LIÊN THÔNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_all():
    print(">>> DANG TAO TOAN BO SO DO CHUYEN NGHIEP CHUAN HOC THUAT & ALGOMASTER...")
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
    print(">>> HOAN THANH TAO 22 SO DO HE THONG VA HINH HOC QUANG HOC!")

if __name__ == "__main__":
    gen_all()
