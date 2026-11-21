# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỌC THUẬT UML CAO CẤP (CHUẨN BÁO CÁO ĐẠI HỌC IUH)
Đề tài: Hệ thống tham quan thực tế ảo 360° & Số hóa di sản Bảo tàng Lịch sử TP. Hồ Chí Minh

Tất cả sơ đồ:
- Canvas cực rộng (16.0 x 7.5 - 8.5 inches), 300 DPI, nét căng, không mờ nhòe.
- Font chữ: Segoe UI / Arial / Calibri chuẩn Windows, hỗ trợ tiếng Việt có dấu 100%.
- Không bao giờ đè chữ lên mũi tên, viền hay hình ảnh. Mọi nhãn trên mũi tên đều có hộp đệm nền trắng (white bbox).
- Công thức toán học dùng Raw String r"..." tuyệt đối không bị lỗi mất chữ (\theta, \phi, \pi).
- Bố cục thoáng đãng, kích thước hộp đủ lớn, có lề đệm an toàn.
"""

import os
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Cấu hình font chữ chuẩn học thuật trên Windows
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'Calibri', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['mathtext.fontset'] = 'cm'

# BẢNG MÀU HỌC THUẬT ĐƠN SẮC TRANG NHÃ (ACADEMIC SLATE THEME)
C_DARK = '#0F172A'       # Chữ chính / Viền chính (Than chì đậm)
C_MUTED = '#475569'      # Chữ phụ / Chú thích (Xám thép)
C_LIGHT = '#94A3B8'      # Viền mờ / Đường dẫn phụ
C_LINE = '#334155'       # Mũi tên & đường kẻ
C_BG_CARD = '#FFFFFF'    # Nền thẻ trắng tinh khiết
C_BG_HEADER = '#F1F5F9'  # Nền tiêu đề thẻ xám sáng
C_BORDER = '#334155'     # Viền thẻ chuẩn

# Màu nhấn học thuật nhẹ nhàng (chỉ dùng cho điểm nhấn ngữ nghĩa)
C_BLUE_BG = '#EFF6FF'
C_BLUE_BORDER = '#2563EB'
C_GREEN_BG = '#F0FDF4'
C_GREEN_BORDER = '#16A34A'
C_AMBER_BG = '#FFFBEB'
C_AMBER_BORDER = '#D97706'
C_RED_BG = '#FEF2F2'
C_RED_BORDER = '#DC2626'

def draw_card(ax, x, y, w, h, title, lines=None, header_bg=C_BG_HEADER, border=C_BORDER, lw=1.2, title_color=C_DARK):
    """Vẽ thẻ thành phần chuẩn học thuật bo góc nhẹ với thanh tiêu đề tách biệt."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.03,rounding_size=0.10',
                                  facecolor=C_BG_CARD, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    
    hdr_h = min(0.44, h * 0.30)
    hdr = patches.FancyBboxPatch((x - w/2, y + h/2 - hdr_h), w, hdr_h,
                                 boxstyle='round,pad=0.01,rounding_size=0.08',
                                 facecolor=header_bg, edgecolor='none', zorder=5)
    ax.add_patch(hdr)
    ax.plot([x - w/2, x + w/2], [y + h/2 - hdr_h, y + h/2 - hdr_h], color=border, lw=lw*0.8, zorder=6)
    
    ax.text(x, y + h/2 - hdr_h/2, title, ha='center', va='center',
            fontsize=8.5, fontweight='bold', color=title_color, zorder=7)
    
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        body_y = y - hdr_h * 0.40
        ax.text(x, body_y, content, ha='center', va='center',
                fontsize=7.5, color=C_MUTED, linespacing=1.35, zorder=7)

def draw_pill_arrow(ax, x1, y1, x2, y2, label=None, label_pos=0.5, offset_y=0.0, offset_x=0.0,
                    color=C_LINE, lw=1.3, style='->', ls='-', label_color=C_DARK):
    """Vẽ mũi tên với nhãn đặt trong hộp trắng chống đè vạch tuyệt đối."""
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw, linestyle=ls), zorder=8)
    if label:
        mx = x1 + (x2 - x1) * label_pos + offset_x
        my = y1 + (y2 - y1) * label_pos + offset_y
        ax.text(mx, my, label, ha='center', va='center', fontsize=7.2, fontweight='bold',
                color=label_color,
                bbox=dict(boxstyle='round,pad=0.25', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.8, alpha=0.98),
                zorder=10)

def draw_diamond(ax, x, y, w, h, text, border=C_BORDER, lw=1.2, bg='#FFFFFF'):
    """Vẽ hình thoi điều kiện rẽ nhánh rộng rãi."""
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = patches.Polygon(pts, facecolor=bg, edgecolor=border, lw=lw, zorder=5)
    ax.add_patch(poly)
    ax.text(x, y, text, ha='center', va='center', fontsize=7.5, fontweight='bold',
            color=C_DARK, linespacing=1.25, zorder=7)

def draw_cylinder(ax, x, y, w, h, title, lines=None, border=C_BORDER, lw=1.2):
    """Vẽ khối cơ sở dữ liệu hình trụ chuẩn UML Database."""
    el_h = min(0.32, h * 0.28)
    rect = patches.Rectangle((x - w/2, y - h/2 + el_h/2), w, h - el_h,
                             facecolor=C_BG_CARD, edgecolor='none', zorder=4)
    ax.add_patch(rect)
    ax.plot([x - w/2, x - w/2], [y - h/2 + el_h/2, y + h/2 - el_h/2], color=border, lw=lw, zorder=5)
    ax.plot([x + w/2, x + w/2], [y - h/2 + el_h/2, y + h/2 - el_h/2], color=border, lw=lw, zorder=5)
    
    bottom_arc = patches.Arc((x, y - h/2 + el_h/2), w, el_h, angle=0, theta1=180, theta2=360,
                             color=border, lw=lw, zorder=5)
    ax.add_patch(bottom_arc)
    top_el = patches.Ellipse((x, y + h/2 - el_h/2), w, el_h, facecolor=C_BG_HEADER,
                             edgecolor=border, lw=lw, zorder=6)
    ax.add_patch(top_el)
    
    ax.text(x, y + h/2 - el_h/2, title, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=C_DARK, zorder=7)
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(x, y - el_h * 0.3, content, ha='center', va='center',
                fontsize=7.2, color=C_MUTED, linespacing=1.25, zorder=7)

# ==============================================================================
# 1. HÌNH 2.1 / HÌNH 3: ÁNH XẠ HỆ TỌA ĐỘ CẦU EQUIRECTANGULAR
# ==============================================================================
def create_hinh_2_1():
    fig, ax = plt.subplots(figsize=(16.0, 7.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.0, 7.15, 'CƠ CHẾ ÁNH XẠ HỆ TỌA ĐỘ CẦU EQUIRECTANGULAR VÀ ĐIỀU KHIỂN CAMERA THREE.JS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 6.75, r'Chuyển đổi song ánh hai chiều giữa Tọa độ Descartes 3D $(X, Y, Z)$, Góc hình cầu $(\theta, \phi)$ và Tọa độ ảnh phẳng 2D $(x, y)$',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # 1. Khối Cầu 3D bên trái
    cx, cy, r = 3.0, 3.5, 1.9
    sphere_bg = patches.Circle((cx, cy), r, facecolor='#F8FAFC', edgecolor=C_BORDER, lw=1.6, zorder=2)
    ax.add_patch(sphere_bg)

    eq = patches.Ellipse((cx, cy), 2*r, 0.70, fill=False, edgecolor='#64748B', lw=1.2, ls='--', zorder=3)
    ax.add_patch(eq)
    mer = patches.Ellipse((cx, cy), 0.70, 2*r, fill=False, edgecolor='#94A3B8', lw=1.0, ls=':', zorder=3)
    ax.add_patch(mer)

    # Các trục Descartes
    ax.annotate('', xy=(cx, cy + r + 0.6), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color=C_DARK, lw=1.5), zorder=5)
    ax.text(cx, cy + r + 0.78, r'$Y$ (Đỉnh Cầu - Cực Bắc)', ha='center', va='center', fontsize=8.5, fontweight='bold', color=C_DARK)

    ax.annotate('', xy=(cx + r + 0.6, cy), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color=C_DARK, lw=1.5), zorder=5)
    ax.text(cx + r + 0.78, cy, r'$X$ (Đông)', ha='left', va='center', fontsize=8.5, fontweight='bold', color=C_DARK)

    ax.annotate('', xy=(cx - 1.1, cy - 1.1), xytext=(cx, cy),
                arrowprops=dict(arrowstyle='->', color=C_DARK, lw=1.5), zorder=5)
    ax.text(cx - 1.25, cy - 1.25, r'$Z$ (Bắc)', ha='right', va='center', fontsize=8.5, fontweight='bold', color=C_DARK)

    # Điểm P(X, Y, Z)
    px, py = cx + 1.1, cy + 1.1
    ax.plot([cx, px], [cy, py], color='#2563EB', lw=1.6, zorder=6)
    ax.plot(px, py, 'o', color='#2563EB', markersize=7, zorder=7)
    ax.text(px + 0.15, py + 0.15, r'$P(X, Y, Z)$' + '\n' + r'$(\theta, \phi)$', fontsize=8.5, fontweight='bold', color='#1E40AF', zorder=8)

    ax.text(cx + 0.45, cy + 0.35, r'$\phi$', fontsize=10.0, fontweight='bold', color='#2563EB')
    ax.text(cx + 0.35, cy - 0.25, r'$\theta$', fontsize=10.0, fontweight='bold', color='#047857')

    ax.text(cx, 0.7, 'MẶT CẦU 3D ĐƠN VỊ ($X^2 + Y^2 + Z^2 = 1$)\nBán kính $R = 500$, Vector pháp tuyến đảo ngược (Inverted Normals)\nCamera Three.js đặt tại gốc tọa độ $O(0, 0, 0)$ nhìn ra mặt trong',
            ha='center', va='top', fontsize=8.0, color=C_MUTED, linespacing=1.35)

    # 2. Hai thẻ công thức ở giữa
    box_w, box_h = 5.0, 1.95

    # Chiếu xuôi
    ax.annotate('', xy=(10.5, 4.7), xytext=(5.5, 4.7),
                arrowprops=dict(arrowstyle='->', color='#2563EB', lw=2.0), zorder=4)
    f_rect = patches.FancyBboxPatch((8.0 - box_w/2, 4.9), box_w, box_h,
                                    boxstyle='round,pad=0.03,rounding_size=0.10',
                                    facecolor='#EFF6FF', edgecolor='#2563EB', lw=1.4, zorder=5)
    ax.add_patch(f_rect)
    ax.text(8.0, 4.9 + box_h - 0.28, 'CHIẾU XUÔI: CẦU 3D $\\rightarrow$ ẢNH PHẲNG 2D',
            ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1E40AF', zorder=6)
    ax.text(8.0, 4.9 + box_h/2 - 0.15,
            r'$\theta = \arctan2(X, -Z) \in [-\pi, +\pi]$' + '\n' +
            r'$\phi = \arcsin(Y) \in [-\pi/2, +\pi/2]$' + '\n' +
            r'$x = \left(\frac{\theta + \pi}{2\pi}\right) \cdot W, \quad y = \left(\frac{\pi/2 - \phi}{\pi}\right) \cdot H$',
            ha='center', va='center', fontsize=8.2, color=C_DARK, linespacing=1.45, zorder=6)

    # Chiếu ngược
    ax.annotate('', xy=(5.5, 2.0), xytext=(10.5, 2.0),
                arrowprops=dict(arrowstyle='->', color='#16A34A', lw=2.0), zorder=4)
    b_rect = patches.FancyBboxPatch((8.0 - box_w/2, 1.8), box_w, box_h,
                                    boxstyle='round,pad=0.03,rounding_size=0.10',
                                    facecolor='#F0FDF4', edgecolor='#16A34A', lw=1.4, zorder=5)
    ax.add_patch(b_rect)
    ax.text(8.0, 1.8 + box_h - 0.28, 'CHIẾU NGƯỢC: ẢNH PHẲNG 2D $\\rightarrow$ CẦU 3D',
            ha='center', va='center', fontsize=8.5, fontweight='bold', color='#15803D', zorder=6)
    ax.text(8.0, 1.8 + box_h/2 - 0.15,
            r'$\theta = \left(\frac{x}{W}\right) \cdot 2\pi - \pi, \quad \phi = \frac{\pi}{2} - \left(\frac{y}{H}\right) \cdot \pi$' + '\n' +
            r'$X = -\cos\phi \cdot \sin\theta$' + '\n' +
            r'$Y = \sin\phi, \quad Z = -\cos\phi \cdot \cos\theta$',
            ha='center', va='center', fontsize=8.2, color=C_DARK, linespacing=1.45, zorder=6)

    # 3. Ảnh phẳng Equirectangular bên phải
    rx, ry, rw, rh = 11.2, 2.3, 4.4, 2.3
    im_rect = patches.Rectangle((rx, ry), rw, rh, facecolor='#F8FAFC', edgecolor=C_BORDER, lw=1.6, zorder=2)
    ax.add_patch(im_rect)

    for i in range(1, 4):
        gy = ry + i * (rh / 4)
        ax.plot([rx, rx + rw], [gy, gy], color='#E2E8F0', lw=0.8, ls=':', zorder=3)
    for j in range(1, 8):
        gx = rx + j * (rw / 8)
        ax.plot([gx, gx], [ry, ry + rh], color='#E2E8F0', lw=0.8, ls=':', zorder=3)

    ax.plot([rx, rx + rw], [ry + rh/2, ry + rh/2], color='#DC2626', lw=1.2, ls='--', zorder=4)
    ax.text(rx + rw + 0.1, ry + rh/2, r'$\phi = 0$ (Xích đạo)', fontsize=7.5, va='center', color='#DC2626', zorder=5)

    pix_x = rx + 0.62 * rw
    pix_y = ry + 0.70 * rh
    ax.plot([rx, pix_x], [pix_y, pix_y], color='#2563EB', ls=':', lw=1.0, zorder=5)
    ax.plot([pix_x, pix_x], [ry, pix_y], color='#2563EB', ls=':', lw=1.0, zorder=5)
    ax.plot(pix_x, pix_y, 'o', color='#2563EB', markersize=7, zorder=6)
    ax.text(pix_x + 0.12, pix_y + 0.12, r'$p(x, y)$', fontsize=8.5, fontweight='bold', color='#1E40AF', zorder=7)

    ax.text(rx, ry + rh + 0.10, '(0, 0)', fontsize=7.5, color='#64748B')
    ax.text(rx + rw, ry + rh + 0.10, '(W, 0)', fontsize=7.5, ha='right', color='#64748B')
    ax.text(rx + rw/2, ry + rh + 0.20, r'Cực Bắc ($\phi = +\pi/2, y = 0$)', fontsize=8.0, ha='center', fontweight='bold', color='#334155')
    ax.text(rx + rw/2, ry - 0.25, r'Cực Nam ($\phi = -\pi/2, y = H$)', fontsize=8.0, ha='center', fontweight='bold', color='#334155')

    ax.text(rx + rw/2, 0.7, 'ẢNH PHẲNG EQUIRECTANGULAR ($W \\times H$, TỶ LỆ 2:1)\nĐộ phân giải chuẩn: $W = 4096\\text{px}, H = 2048\\text{px}$ (WebP nén tối ưu)\nGóc mở camera thích ứng: Mobile FOV $65^\\circ$, Desktop FOV $45^\\circ$',
            ha='center', va='top', fontsize=8.0, color=C_MUTED, linespacing=1.35)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_1_he_toa_do_cau.png")

# ==============================================================================
# 2. HÌNH 2.9 / HÌNH 2: KIẾN TRÚC HỆ THỐNG 3 TẦNG (3-TIER HYBRID ARCHITECTURE)
# ==============================================================================
def create_hinh_2_9():
    fig, ax = plt.subplots(figsize=(16.0, 8.2), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 8.2); ax.axis('off')

    ax.text(8.0, 7.85, 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG LAI GHÉP (3-TIER HYBRID ARCHITECTURE)',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 7.45, 'Mô hình phân tầng bảo đảm tính sẵn sàng cao, bảo mật mã hóa và tối ưu hóa tài nguyên phần cứng',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # 3 Khung bao lớn đại diện cho 3 Tầng (Swimlane Containers)
    tier_w, tier_h = 4.7, 6.7
    t1_x, t2_x, t3_x = 2.65, 8.0, 13.35
    tier_y = 3.75

    # Tầng 1
    t1_box = patches.FancyBboxPatch((t1_x - tier_w/2, tier_y - tier_h/2), tier_w, tier_h,
                                    boxstyle='round,pad=0.04,rounding_size=0.12',
                                    facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=1.2, ls='--', zorder=1)
    ax.add_patch(t1_box)
    ax.text(t1_x, tier_y + tier_h/2 - 0.35, 'TẦNG 1: TRÌNH DIỄN (CLIENT)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1E3A8A', zorder=2)

    # Tầng 2
    t2_box = patches.FancyBboxPatch((t2_x - tier_w/2, tier_y - tier_h/2), tier_w, tier_h,
                                    boxstyle='round,pad=0.04,rounding_size=0.12',
                                    facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=1.2, ls='--', zorder=1)
    ax.add_patch(t2_box)
    ax.text(t2_x, tier_y + tier_h/2 - 0.35, 'TẦNG 2: NGHIỆP VỤ & ĐIỀU PHỐI (SERVICES)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#065F46', zorder=2)

    # Tầng 3
    t3_box = patches.FancyBboxPatch((t3_x - tier_w/2, tier_y - tier_h/2), tier_w, tier_h,
                                    boxstyle='round,pad=0.04,rounding_size=0.12',
                                    facecolor='#F8FAFC', edgecolor='#CBD5E1', lw=1.2, ls='--', zorder=1)
    ax.add_patch(t3_box)
    ax.text(t3_x, tier_y + tier_h/2 - 0.35, 'TẦNG 3: DỮ LIỆU & ĐÁM MÂY (DATA & CLOUD)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#7C2D12', zorder=2)

    card_w = 4.1

    # Tầng 1 components
    draw_card(ax, t1_x, 5.5, card_w, 2.0, 'Trình duyệt Web (Desktop / PC)',
              ['• React 18, TypeScript, Vite Bundler',
               '• Three.js WebGL Engine (FOV 45°)',
               '• Điều hướng OrbitControls & Hotspots',
               '• Trình phát Audio Guide đa ngôn ngữ'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    draw_card(ax, t1_x, 2.3, card_w, 2.0, 'Thiết bị Di động (Mobile / Tablet)',
              ['• Giao diện Responsive Mobile-First (FOV 65°)',
               '• Quét mã QR Trưng bày jsQR khử lóa tủ kính',
               '• Module Camera HTML5-QRCode Soát vé Barie',
               '• Web Audio Bíp 880Hz & Rung xúc giác'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    # Tầng 2 components
    draw_card(ax, t2_x, 5.8, card_w, 1.6, 'Nginx Web Server & Reverse Proxy',
              ['• SSL/TLS 1.3 Termination, Caching tĩnh',
               '• HTTP/2 Multiplexing, Rate Limiting an toàn',
               '• Stream Audio HTTP 206 Partial Content (<50ms)'],
              header_bg='#F0FDF4', border='#16A34A', title_color='#15803D')

    draw_card(ax, t2_x, 3.8, card_w, 1.8, 'Backend REST API & Realtime SSE Gateway',
              ['• Node.js v20 LTS, Express, TypeScript',
               '• Xác thực JSON Web Token (JWT 24h)',
               '• Kênh truyền Realtime Server-Sent Events (<1ms)',
               '• API Đặt vé, Quản lý Cổ vật, Phòng 360°'],
              header_bg='#F0FDF4', border='#16A34A', title_color='#15803D')

    draw_card(ax, t2_x, 1.6, card_w, 1.6, 'Xưởng Đa phương tiện & Xử lý 3D Nội bộ',
              ['• Python 3.11, OpenCV Panorama Studio',
               '• Nắn chỉnh trụ Cylindrical, Khớp ảnh SIFT/RANSAC',
               '• Động cơ 3D Local CPU (Marching Cubes v15.0)'],
              header_bg='#FFFBEB', border='#D97706', title_color='#B45309')

    # Tầng 3 components
    draw_cylinder(ax, t3_x, 5.6, card_w, 1.9, 'PostgreSQL 16 (Relational DB)',
                  ['• Quản lý người dùng, phân quyền Admin/Staff',
                   '• Bảng vé tham quan tickets (Mã hóa AES-256)',
                   '• Đơn hàng PayOS, Lịch sử giao dịch & Soát vé',
                   '• Kết nối an toàn Grafana Read-Only pg_readonly'],
                  border='#7C2D12')

    draw_card(ax, t3_x, 3.5, card_w, 1.6, 'MongoDB NoSQL Database',
              ['• Cấu trúc 18 gian phòng trưng bày 360°',
               '• Tọa độ góc Hotspots tương tác (Pitch, Yaw)',
               '• Tư liệu cổ vật, Audio TTS Cache (Key băm MD5)'],
              header_bg='#FEF2F2', border='#DC2626', title_color='#991B1B')

    draw_card(ax, t3_x, 1.5, card_w, 1.6, 'Dịch vụ Đám mây & AI Ngoại vi',
              ['• Cổng thanh toán VietQR PayOS (Napas 247)',
               '• Đám mây HuggingFace ZeroGPU A100 (TRELLIS)',
               '• Google Cloud Text-to-Speech (Neural2 AI)',
               '• Hệ thống Giám sát Grafana v11 & Prometheus'],
              header_bg='#FAF5FF', border='#7E22CE', title_color='#6B21A8')

    # Các mũi tên liên kết giữa các tầng
    # T1 -> T2
    draw_pill_arrow(ax, t1_x + card_w/2, 5.5, t2_x - card_w/2, 5.8, label='HTTPS / WSS')
    draw_pill_arrow(ax, t1_x + card_w/2, 2.3, t2_x - card_w/2, 3.8, label='RESTful API')
    
    # Nginx -> Backend API
    draw_pill_arrow(ax, t2_x, 5.0, t2_x, 4.7, label='Proxy Pass')
    # Backend API -> Python Studio
    draw_pill_arrow(ax, t2_x, 2.9, t2_x, 2.4, label='Hàng đợi Worker')

    # T2 -> T3
    draw_pill_arrow(ax, t2_x + card_w/2, 4.2, t3_x - card_w/2, 5.6, label='SQL Connection (pgPool)')
    draw_pill_arrow(ax, t2_x + card_w/2, 3.6, t3_x - card_w/2, 3.5, label='Mongoose NoSQL')
    draw_pill_arrow(ax, t2_x + card_w/2, 1.6, t3_x - card_w/2, 1.5, label='Webhook / Cloud API')

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_9_architecture_3tier.png")

# ==============================================================================
# 3. HÌNH 4.7 / HÌNH 4: GIẢI THUẬT DIJKSTRA TÌM ĐƯỜNG LIÊN THÔNG 18 PHÒNG
# ==============================================================================
def create_hinh_4_7():
    fig, ax = plt.subplots(figsize=(16.0, 8.0), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 8.0); ax.axis('off')

    ax.text(8.0, 7.65, 'SƠ ĐỒ KHỐI GIẢI THUẬT DIJKSTRA TÌM LỘ TRÌNH TỐI ƯU GIỮA 18 GIAN PHÒNG',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 7.25, 'Mô hình đồ thị Topological Graph kết hợp Lưu đồ giải thuật tối ưu hàng đợi ưu tiên Min-Heap',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # Đường phân cách giữa Đồ thị bên trái và Lưu đồ bên phải
    ax.plot([7.8, 7.8], [0.6, 6.8], color='#CBD5E1', lw=1.2, ls=':')

    # ---------------- NỬA TRÁI: ĐỒ THỊ 18 PHÒNG TRƯNG BÀY ----------------
    ax.text(3.9, 6.8, 'MÔ HÌNH ĐỒ THỊ MẶT BẰNG 18 PHÒNG TRƯNG BÀY (G = (V, E))',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#1E3A8A')
    ax.text(3.9, 6.45, 'Mặt bằng hình chữ U quanh Sân vườn trung tâm (Hoa viên HV)',
            ha='center', va='center', fontsize=8.0, color=C_MUTED)

    # Tọa độ các phòng P01 đến P18 trên đồ thị chữ U
    room_pos = {
        'P01': (1.2, 1.4), 'P02': (2.8, 1.4), 'P03': (4.4, 1.4), 'P04': (5.7, 1.4), 'P05': (6.8, 1.4),
        'P06': (6.8, 2.6), 'P07': (6.8, 3.8), 'P08': (6.8, 5.0),
        'P09': (5.5, 5.0), 'P10': (4.2, 5.0), 'P11': (2.7, 5.0), 'P12': (1.2, 5.0),
        'P13': (1.2, 3.8), 'P14': (1.2, 2.6),
        'HV':  (4.2, 3.2)  # Hoa viên trung tâm
    }

    # Vẽ các cạnh kết nối đồ thị (Edges)
    edges = [
        ('P01', 'P02', '12m', True),
        ('P02', 'P03', '15m', True),
        ('P03', 'P04', '14m', False),
        ('P04', 'P05', '12m', False),
        ('P05', 'P06', '16m', False),
        ('P06', 'P07', '15m', False),
        ('P07', 'P08', '14m', False),
        ('P08', 'P09', '15m', False),
        ('P09', 'P10', '16m', False),
        ('P10', 'P11', '14m', False),
        ('P11', 'P12', '15m', False),
        ('P12', 'P13', '16m', False),
        ('P13', 'P14', '15m', False),
        ('P14', 'P01', '14m', False),
        ('P03', 'HV',  '20m', True),
        ('HV',  'P10', '22m', True)
    ]

    for u, v, w, is_optimal in edges:
        x1, y1 = room_pos[u]
        x2, y2 = room_pos[v]
        if is_optimal:
            ax.plot([x1, x2], [y1, y2], color='#16A34A', lw=3.0, zorder=3)
            mx, my = (x1 + x2)/2, (y1 + y2)/2
            ax.text(mx, my, w, ha='center', va='center', fontsize=7.2, fontweight='bold', color='#15803D',
                    bbox=dict(boxstyle='round,pad=0.2', facecolor='#F0FDF4', edgecolor='#16A34A', lw=0.9), zorder=5)
        else:
            ax.plot([x1, x2], [y1, y2], color='#94A3B8', lw=1.2, ls='--', zorder=2)

    # Vẽ các đỉnh phòng (Nodes)
    for node, (nx, ny) in room_pos.items():
        if node == 'P01':  # Xuất phát
            circle = patches.Circle((nx, ny), 0.38, facecolor='#1E3A8A', edgecolor='#0F172A', lw=1.6, zorder=6)
            ax.add_patch(circle)
            ax.text(nx, ny, node, ha='center', va='center', fontsize=8.2, fontweight='bold', color='white', zorder=7)
            ax.text(nx, ny - 0.58, 'Xuất phát (P01)', ha='center', va='center', fontsize=8.0, fontweight='bold',
                    color='#1E3A8A', bbox=dict(boxstyle='round,pad=0.2', facecolor='#EFF6FF', edgecolor='#2563EB', lw=0.8), zorder=7)
        elif node == 'P10':  # Đích đến
            circle = patches.Circle((nx, ny), 0.38, facecolor='#991B1B', edgecolor='#0F172A', lw=1.6, zorder=6)
            ax.add_patch(circle)
            ax.text(nx, ny, node, ha='center', va='center', fontsize=8.2, fontweight='bold', color='white', zorder=7)
            ax.text(nx, ny + 0.58, 'Đích đến (P10: Champa)', ha='center', va='center', fontsize=8.0, fontweight='bold',
                    color='#991B1B', bbox=dict(boxstyle='round,pad=0.2', facecolor='#FEF2F2', edgecolor='#DC2626', lw=0.8), zorder=7)
        elif node in ['P02', 'P03', 'HV']:  # Đỉnh trên đường tối ưu
            circle = patches.Circle((nx, ny), 0.36, facecolor='#16A34A', edgecolor='#0F172A', lw=1.5, zorder=6)
            ax.add_patch(circle)
            ax.text(nx, ny, node, ha='center', va='center', fontsize=8.0, fontweight='bold', color='white', zorder=7)
        else:
            circle = patches.Circle((nx, ny), 0.32, facecolor='#FFFFFF', edgecolor='#475569', lw=1.2, zorder=4)
            ax.add_patch(circle)
            ax.text(nx, ny, node, ha='center', va='center', fontsize=7.5, color='#334155', zorder=5)

    ax.text(3.9, 0.45, '— Lộ trình ngắn nhất: P01 → P02 → P03 → Sân Vườn (HV) → P10 (Tổng: 69 mét) —',
            ha='center', va='center', fontsize=8.5, fontweight='bold', color='#15803D')

    # ---------------- NỬA PHẢI: LƯU ĐỒ THUẬT TOÁN DIJKSTRA ----------------
    ax.text(12.0, 6.8, 'LƯU ĐỒ THUẬT TOÁN DIJKSTRA (MIN-HEAP PRIORITY QUEUE)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0F172A')

    fx = 12.0
    flow_w = 6.2

    # Khối 1: Bắt đầu
    draw_card(ax, fx, 5.9, flow_w, 1.1, 'BẮT ĐẦU: Khởi tạo dữ liệu đồ thị G(V, E)',
              [r'Đặt $d[\text{P01}] = 0$, mọi đỉnh khác $d[v] = \infty$; Đưa $(0, \text{P01})$ vào Min-Heap'],
              header_bg='#F8FAFC', border='#334155')

    draw_pill_arrow(ax, fx, 5.35, fx, 4.85)

    # Khối 2: Lấy đỉnh nhỏ nhất
    draw_card(ax, fx, 4.4, flow_w, 0.9, 'Trích xuất đỉnh u có d[u] nhỏ nhất từ Min-Heap',
              [r'$u = \text{Extract-Min}()$, đánh dấu $u$ đã được xử lý tối ưu'],
              header_bg='#F8FAFC', border='#334155')

    draw_pill_arrow(ax, fx, 3.95, fx, 3.40)

    # Khối 3: Hình thoi điều kiện kiểm tra đích
    draw_diamond(ax, fx, 2.9, 2.8, 1.0, 'Đã đến đích?\nu == P10?', border='#334155', bg='#FFFFFF')

    # Nhánh ĐÚNG: Kết thúc
    draw_pill_arrow(ax, fx + 1.4, 2.9, 14.8, 2.9, label='Đúng', label_color='#15803D', color='#16A34A', lw=1.6)
    draw_card(ax, 15.3, 2.9, 1.2, 0.9, 'KẾT THÚC', ['Truy vết', 'về P01'],
              header_bg='#F0FDF4', border='#16A34A', title_color='#15803D')

    # Nhánh SAI: Nới lỏng cạnh
    draw_pill_arrow(ax, fx, 2.4, fx, 1.75, label='Sai', label_color='#DC2626', color='#DC2626', lw=1.4)
    draw_card(ax, fx, 1.2, flow_w, 1.1, 'Nới lỏng cạnh kề (Relaxation) & Cập nhật Min-Heap',
              [r'Với mỗi đỉnh kề $v$ của $u$: Nếu $d[u] + w(u, v) < d[v]$ thì:',
               r'Gán $d[v] = d[u] + w(u, v)$, $\text{prev}[v] = u$, giảm khóa Decrease-Key trong Heap'],
              header_bg='#F8FAFC', border='#334155')

    # Vòng lặp quay lại Khối 2
    ax.plot([fx - flow_w/2, 8.4], [1.2, 1.2], color='#475569', ls='--', lw=1.2)
    ax.plot([8.4, 8.4], [1.2, 4.4], color='#475569', ls='--', lw=1.2)
    draw_pill_arrow(ax, 8.4, 4.4, fx - flow_w/2, 4.4, label='Lặp lại với đỉnh kế',
                    ls='--', color='#475569', label_color='#334155')

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_7_dijkstra_flow.png")

# ==============================================================================
# 4. HÌNH 4.5 / HÌNH 5: TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI 2 ĐỘNG CƠ (DUAL-ENGINE)
# ==============================================================================
def create_hinh_4_5():
    fig, ax = plt.subplots(figsize=(16.0, 8.2), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 8.2); ax.axis('off')

    ax.text(8.0, 7.85, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI 2 ĐỘNG CƠ VÀ DỰ PHÒNG TỰ ĐỘNG',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 7.45, 'Hỗ trợ 3 chế độ nguồn ảnh đầu vào — Ưu tiên Đám mây AI TRELLIS và Tự động Fallback sang Local CPU Marching Cubes',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # Actor: Quản trị viên
    actor_x, actor_y = 1.0, 4.0
    head = patches.Circle((actor_x, actor_y + 0.35), 0.22, facecolor='#E2E8F0', edgecolor=C_DARK, lw=1.4, zorder=5)
    body = patches.Polygon([[actor_x - 0.35, actor_y - 0.30], [actor_x + 0.35, actor_y - 0.30],
                            [actor_x + 0.20, actor_y + 0.12], [actor_x - 0.20, actor_y + 0.12]],
                           facecolor='#E2E8F0', edgecolor=C_DARK, lw=1.4, zorder=5)
    ax.add_patch(head); ax.add_patch(body)
    ax.text(actor_x, actor_y - 0.60, 'Quản trị viên\n(Nạp tư liệu)', ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=C_DARK)

    # Mũi tên 1: Nạp ảnh
    draw_pill_arrow(ax, 1.45, 4.0, 2.2, 4.0, label='1. Tải ảnh', offset_y=0.25)

    # Card 1: 3 Chế độ Nguồn ảnh
    draw_card(ax, 3.8, 4.0, 3.0, 3.2, '3 Chế độ Nguồn ảnh Tư liệu',
              ['[1] Ảnh đơn diện (Single-View)',
               '    1 ảnh trực diện góc đẹp nhất',
               '[2] Ảnh đối lập (Dual-View)',
               '    2 ảnh: Mặt trước + Mặt lưng',
               '[3] Đa góc độ (Multi-View)',
               '    Trái, Phải, Trên, Dưới, Chi tiết',
               '• Khử nhiễu nền Rembg U2-Net tự động'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    # Mũi tên 2: Đẩy Queue
    draw_pill_arrow(ax, 5.3, 4.0, 6.2, 4.0, label='2. Đẩy Queue', offset_y=0.25)

    # Card 2: Hàng đợi điều phối
    draw_card(ax, 7.3, 4.0, 2.0, 2.2, 'Hàng đợi Điều phối 3D',
              ['• artifact3dQueue',
               '• Quản lý tiến trình nền',
               '• Giám sát tài nguyên GPU',
               '• Phân luồng động cơ'],
              header_bg='#F8FAFC', border='#334155')

    # Mũi tên tới Diamond kiểm tra tài nguyên
    draw_pill_arrow(ax, 8.3, 4.0, 9.2, 4.0)

    # Diamond: Kiểm tra ZeroGPU
    draw_diamond(ax, 10.2, 4.0, 2.0, 1.4, 'Tài nguyên GPU\nZeroGPU sẵn sàng\n& kết nối tốt?',
                 border='#334155', bg='#FFFFFF')

    # ---------------- NHÁNH TRÊN: ĐÁM MÂY AI TRELLIS (ƯU TIÊN) ----------------
    draw_pill_arrow(ax, 10.2, 4.7, 11.5, 6.1, label='3a. [Còn Quota] (Ưu tiên gọi API AI)',
                    label_pos=0.45, offset_y=0.22, color='#2563EB', lw=1.5, label_color='#1E40AF')

    draw_card(ax, 13.5, 6.1, 3.8, 2.1, 'Động cơ Đám mây AI: TRELLIS (HuggingFace)',
              ['• HuggingFace ZeroGPU A100 (Không tốn chi phí máy chủ)',
               '• Biến tiềm ẩn SLAT & Rectified Flow Transformers',
               '• Differentiable Mesh Extraction sinh lưới 3D sắc nét',
               '• Tái tạo toàn diện mặt trước, mặt sau và góc khuất'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    draw_pill_arrow(ax, 13.5, 5.05, 13.5, 4.25, label='Xuất mô hình .GLB PBR',
                    color='#16A34A', lw=1.5, label_color='#15803D')

    draw_card(ax, 13.5, 3.5, 3.8, 1.4, 'Mô hình 3D Chuẩn Bảo tàng (PBR WebGL)',
              ['• 25.600 Polygons chuẩn Web mượt mà 60 FPS',
               '• Đầy đủ kênh PBR: Albedo, Normal, Roughness',
               '• Cho phép khách xoay 360°, phóng to hoa văn'],
              header_bg='#F0FDF4', border='#16A34A', title_color='#15803D')

    # ---------------- ĐƯỜNG DỰ PHÒNG FALLBACK TỰ ĐỘNG ----------------
    ax.annotate('', xy=(12.0, 2.5), xytext=(12.0, 5.0),
                arrowprops=dict(arrowstyle='->', color='#DC2626', lw=1.6, linestyle='--'), zorder=8)
    ax.text(12.0, 3.75, 'Tự động Fallback khi Quota 429\nhoặc Timeout > 300 giây',
            ha='center', va='center', fontsize=7.2, fontweight='bold', color='#DC2626',
            bbox=dict(boxstyle='round,pad=0.25', facecolor='#FEF2F2', edgecolor='#DC2626', lw=0.9), zorder=10)

    # ---------------- NHÁNH DƯỚI: LOCAL CPU MARCHING CUBES (DỰ PHÒNG) ----------------
    draw_pill_arrow(ax, 10.2, 3.3, 11.5, 1.7, label='3b. [Hết Quota / Tùy chọn] (Dựng nội bộ)',
                    label_pos=0.45, offset_y=-0.22, color='#D97706', lw=1.5, label_color='#B45309')

    draw_card(ax, 13.5, 1.7, 3.8, 2.0, 'Động cơ Máy chủ Nội bộ: Local CPU (Dự phòng)',
              ['• Module Python v15.0 độc lập chạy trực tiếp trên VPS',
               '• Tách nền U2-Net, quét ma trận khoảng cách tâm trục',
               '• Tiện tròn xoay đối xứng trục Radial-Axial Marching Cubes',
               '• Hoạt động ngoại tuyến 100%, bảo đảm không gián đoạn'],
              header_bg='#FFFBEB', border='#D97706', title_color='#B45309')

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_5_artifact_2engines.png")

# ==============================================================================
# 5. HÌNH 3.6 / HÌNH 6: QUY TRÌNH ĐẶT VÉ VIETQR & QUẢN LÝ VÉ CỦA TÔI
# ==============================================================================
def create_hinh_3_6():
    fig, ax = plt.subplots(figsize=(16.0, 8.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 8.5); ax.axis('off')

    ax.text(8.0, 8.15, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH ĐẶT VÉ TRỰC TUYẾN, THANH TOÁN VIETQR VÀ QUẢN LÝ VÉ CỦA TÔI',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 7.75, 'Chu trình khép kín: Chọn vé & Khung giờ → Thanh toán PayOS → Quản lý Tab My ticket → Soát vé Camera & Đồng bộ Realtime SSE',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # 3 Làn bơi (Swimlanes) theo chuẩn UML Activity Diagram
    lane_h = 2.3
    l1_y, l2_y, l3_y = 6.35, 4.05, 1.75
    lane_w = 15.6

    for ly, title, bg in [(l1_y, 'LÀN 1: KHÁCH THAM QUAN (VISITOR / MOBILE & PC)', '#F8FAFC'),
                          (l2_y, 'LÀN 2: HỆ THỐNG MÁY CHỦ & CỔNG THANH TOÁN (SERVER & PAYOS)', '#F1F5F9'),
                          (l3_y, 'LÀN 3: NHÂN VIÊN SOÁT VÉ TẠI CỔNG BẢO TÀNG (STAFF SCANNER)', '#F8FAFC')]:
        r = patches.Rectangle((0.2, ly - lane_h/2), lane_w, lane_h, facecolor=bg, edgecolor='#CBD5E1', lw=1.0, zorder=1)
        ax.add_patch(r)
        ax.text(0.4, ly + lane_h/2 - 0.22, title, fontsize=8.5, fontweight='bold', color='#1E3A8A', zorder=2)

    card_w, card_h = 2.6, 1.4

    # Bước 1 -> 4 ở Làn 1
    draw_card(ax, 1.8, l1_y - 0.15, card_w, card_h, '1. Chọn Lịch & Khung giờ',
              ['• Chọn ngày tham quan',
               '• Khung giờ: Sáng / Chiều',
               '• Xem bảng giá niêm yết'],
              header_bg='#EFF6FF', border='#2563EB')

    draw_pill_arrow(ax, 3.1, l1_y - 0.15, 3.6, l1_y - 0.15)

    draw_card(ax, 4.9, l1_y - 0.15, card_w, card_h, '2. Chọn 3 Hạng vé',
              ['• Người lớn (30.000đ)',
               '• HSSV / Học sinh (15.000đ)',
               '• Trẻ em / Người già (0đ)'],
              header_bg='#EFF6FF', border='#2563EB')

    draw_pill_arrow(ax, 6.2, l1_y - 0.15, 6.7, l1_y - 0.15)

    draw_card(ax, 8.0, l1_y - 0.15, card_w, card_h, '3. Điền thông tin cá nhân',
              ['• Tự điền nếu đã đăng nhập',
               '• Họ tên, Email, Số ĐT',
               '• Lưu phiên nháp 15 phút'],
              header_bg='#EFF6FF', border='#2563EB')

    draw_pill_arrow(ax, 9.3, l1_y - 0.15, 9.8, l1_y - 0.15)

    draw_card(ax, 11.1, l1_y - 0.15, card_w, card_h, '4. Tóm tắt & Xác nhận',
              ['• Kiểm tra tổng số tiền',
               '• Bấm Thanh toán VietQR',
               '• Đếm ngược đơn hàng 15p'],
              header_bg='#EFF6FF', border='#2563EB')

    # Bước 4 chuyển xuống Làn 2: Gọi PayOS
    draw_pill_arrow(ax, 11.1, l1_y - 0.85, 11.1, l2_y + 0.65, label='Gọi API PayOS')

    draw_card(ax, 11.1, l2_y - 0.15, card_w, card_h, '5. Sinh mã VietQR PayOS',
              ['• Sinh mã QR Napas 247',
               '• Nhúng ngân hàng nhận',
               '• Kèm nội dung chuyển khoản'],
              header_bg='#F0FDF4', border='#16A34A')

    # PayOS hiển thị mã QR lên Làn 1 cho khách quét
    draw_pill_arrow(ax, 12.4, l2_y - 0.15, 13.0, l1_y - 0.15, label='Hiện Modal QR')

    draw_card(ax, 14.3, l1_y - 0.15, card_w, card_h, '6. Khách quét VietQR',
              ['• Quét App ngân hàng',
               '• Chuyển khoản tức thì',
               '• Ngân hàng báo có tiền'],
              header_bg='#EFF6FF', border='#2563EB')

    # Ngân hàng báo webhook xuống Làn 2
    draw_pill_arrow(ax, 14.3, l1_y - 0.85, 14.3, l2_y + 0.65, label='Webhook HMAC')

    draw_card(ax, 14.3, l2_y - 0.15, card_w, card_h, '7. Xác thực Webhook',
              ['• Verify chữ ký số HMAC',
               '• Cập nhật bảng tickets',
               '• Sinh mã vé TKT-XXXXXX'],
              header_bg='#F0FDF4', border='#16A34A')

    # Chuyển kết quả sang Tab My ticket của khách
    draw_pill_arrow(ax, 13.0, l2_y - 0.15, 8.0, l2_y - 0.15)

    draw_card(ax, 6.7, l2_y - 0.15, card_w, card_h, '8. Lưu trữ & Mã hóa AES',
              ['• Lưu PostgreSQL 16',
               '• Mã hóa mã vé QR AES-256',
               '• Gửi vé điện tử qua Email'],
              header_bg='#F0FDF4', border='#16A34A')

    draw_pill_arrow(ax, 5.4, l2_y - 0.15, 3.1, l2_y - 0.15)

    draw_card(ax, 1.8, l2_y - 0.15, card_w, card_h, '9. Tab "Vé của tôi"',
              ['• Trang cá nhân /profile',
               '• Hiển thị mã QR vé',
               '• Trạng thái "CHƯA SỬ DỤNG"'],
              header_bg='#EFF6FF', border='#2563EB')

    # Đến bảo tàng: Khách đưa mã QR cho nhân viên ở Làn 3
    draw_pill_arrow(ax, 1.8, l2_y - 0.85, 1.8, l3_y + 0.65, label='Đưa mã QR tại cổng')

    draw_card(ax, 1.8, l3_y - 0.15, card_w, card_h, '10. Quét QR tại Cổng',
              ['• Nhân viên dùng Camera',
               '• Thư viện HTML5-QRCode',
               '• Quét trực tiếp (<150ms)'],
              header_bg='#FFFBEB', border='#D97706')

    draw_pill_arrow(ax, 3.1, l3_y - 0.15, 4.9, l3_y - 0.15)

    draw_card(ax, 6.2, l3_y - 0.15, card_w, card_h, '11. Xác thực Vé API',
              ['• Giải mã AES-256 & Hash',
               '• Kiểm tra trùng lặp vé',
               '• Đổi status thành USED'],
              header_bg='#FFFBEB', border='#D97706')

    draw_pill_arrow(ax, 7.5, l3_y - 0.15, 9.3, l3_y - 0.15)

    draw_card(ax, 10.6, l3_y - 0.15, card_w, card_h, '12. Mở Cổng Barie & Beep',
              ['• Âm báo Bíp 880Hz',
               '• Màn hình hiện Tích Xanh',
               '• Phát sự kiện Realtime SSE'],
              header_bg='#F0FDF4', border='#16A34A')

    # Bắn sự kiện SSE về màn hình điện thoại của khách ở Làn 1
    draw_pill_arrow(ax, 11.9, l3_y - 0.15, 14.3, l3_y - 0.15)

    draw_card(ax, 14.3, l3_y - 0.15, card_w, card_h, '13. Khách vào Cổng',
              ['• UI khách đổi "ĐÃ VÀO CỔNG"',
               '• Máy rung xúc giác (<1ms)',
               '• Chống quay vòng vé 100%'],
              header_bg='#F0FDF4', border='#16A34A')

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_6_activity_booking_ticket_lifecycle.png")

# ==============================================================================
# 6. HÌNH 3.13 / HÌNH 7: QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL
# ==============================================================================
def create_hinh_3_13():
    fig, ax = plt.subplots(figsize=(16.0, 7.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.0, 7.15, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 6.75, 'Tự động sinh mã ISO/IEC 18004 trong CMS → In ấn tại tủ kính → Thuật toán jsQR khử lóa sáng → Mở 3D / Tour 360°',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # 1. Quản trị viên sinh mã QR
    draw_card(ax, 1.8, 4.0, 2.8, 3.6, '1. Phân hệ Quản trị CMS',
              ['• Admin tạo phòng / hiện vật',
               '• Tự động sinh mã định danh',
               '• Thuật toán ISO/IEC 18004',
               '• Xuất file SVG / PNG 300 DPI',
               '• In ấn gắn trên tủ kính / cửa'],
              header_bg='#F1F5F9', border='#334155')

    draw_pill_arrow(ax, 3.2, 4.0, 4.2, 4.0, label='Gắn mã QR tại bảo tàng')

    # 2. Khách mở Camera quét
    draw_card(ax, 5.7, 4.0, 2.8, 3.6, '2. Hộp thoại QRScannerModal',
              ['• Khách bấm nút "Quét QR"',
               '• Yêu cầu quyền Camera',
               '• Video Stream thời gian thực',
               '• Khung ngắm viền vàng gold',
               '• Tùy chọn chuyển đổi Camera'],
              header_bg='#EFF6FF', border='#2563EB')

    draw_pill_arrow(ax, 7.1, 4.0, 8.1, 4.0, label='Phân tích frame ảnh')

    # 3. Thuật toán xử lý khử lóa
    draw_card(ax, 9.6, 4.0, 2.8, 3.6, '3. Thuật toán jsQR Đa kích thước',
              ['• Lấy mẫu 3 kích thước:',
               '  (1000px, 600px, 1400px)',
               '• Khử lóa sáng phản chiếu kính',
               '• Binarization nhị phân hóa',
               '• Độ chính xác nhận diện > 99.2%',
               '• Tốc độ phân giải < 100ms'],
              header_bg='#F0FDF4', border='#16A34A')

    draw_pill_arrow(ax, 11.0, 4.0, 12.0, 4.0, label='Đọc payload mã')

    # 4. Phân luồng thông minh
    draw_card(ax, 14.3, 5.8, 3.0, 1.8, 'Kịch bản A: Mã Hiện vật 3D',
              ['• Phát âm báo Bíp 880Hz & Rung',
               '• Mở ngay Modal Cổ vật 3D .GLB',
               '• Tự động phát thuyết minh Audio'],
              header_bg='#F0FDF4', border='#16A34A')

    draw_card(ax, 14.3, 3.8, 3.0, 1.8, 'Kịch bản B: Mã Phòng 360°',
              ['• Hiệu ứng chuyển cảnh Cross-fade',
               '• Bước ngay vào phòng 360° đích',
               '• Cập nhật Mini-map Dijkstra'],
              header_bg='#EFF6FF', border='#2563EB')

    draw_card(ax, 14.3, 1.8, 3.0, 1.8, 'Kịch bản C: Mã Vé vào Cổng',
              ['• Nhận diện quét nhầm mã vé',
               '• Thông báo hướng dẫn du khách',
               '• Đến quầy soát vé điện tử'],
              header_bg='#FFFBEB', border='#D97706')

    draw_pill_arrow(ax, 11.0, 4.3, 12.8, 5.8)
    draw_pill_arrow(ax, 11.0, 4.0, 12.8, 3.8)
    draw_pill_arrow(ax, 11.0, 3.7, 12.8, 1.8)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_3_13_qr_exhibition_activity.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_13_qr_exhibition_activity.png")

# ==============================================================================
# 7. HÌNH 2.14 / HÌNH 8: KIẾN TRÚC GIÁM SÁT HỆ THỐNG VỚI GRAFANA & PROMETHEUS
# ==============================================================================
def create_hinh_2_14():
    fig, ax = plt.subplots(figsize=(16.0, 7.8), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 7.8); ax.axis('off')

    ax.text(8.0, 7.45, 'SƠ ĐỒ KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT HỆ THỐNG VỚI GRAFANA & PROMETHEUS',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 7.05, 'Giám sát toàn diện 3 tầng: Nghiệp vụ Vé & Doanh thu, Hạ tầng phần cứng VPS, và Hiệu năng mạng APM',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    box_w = 4.3

    # Cột 1: Nguồn dữ liệu (Data Sources)
    draw_card(ax, 2.5, 5.5, box_w, 2.1, '1. Nguồn Nghiệp vụ: PostgreSQL 16',
              ['• Dữ liệu vé tham quan, đơn hàng PayOS',
               '• Tỷ lệ vào cổng, doanh thu thực tế',
               '• Tiến độ số hóa 18 phòng và cổ vật 3D',
               '• Kết nối an toàn Read-Only pg_readonly'],
              header_bg='#FEF2F2', border='#DC2626')

    draw_card(ax, 2.5, 3.1, box_w, 2.1, '2. Nguồn Hạ tầng: Node.js Exporter',
              ['• Dung lượng bộ nhớ RAM RSS & Heap Memory',
               '• Tần suất CPU NodeJS, Thời gian Uptime',
               '• Trạng thái hoạt động Container Docker'],
              header_bg='#FFFBEB', border='#D97706')

    draw_card(ax, 2.5, 1.0, box_w, 1.5, '3. Nguồn Hiệu năng: Express APM',
              ['• Lưu lượng Request/giây (Throughput RPS)',
               '• Phân vị độ trễ phản hồi p50, p95, p99',
               '• Tỷ lệ mã trạng thái HTTP 2xx/4xx/5xx'],
              header_bg='#EFF6FF', border='#2563EB')

    # Cột 2: Thu thập & Lưu trữ chuỗi thời gian (Prometheus Server)
    draw_card(ax, 8.0, 3.5, 3.8, 4.4, 'Prometheus TSDB Server v2.53',
              ['• Time-Series Database lưu trữ chỉ số',
               '• Cào dữ liệu định kỳ mỗi 15 giây (Scrape)',
               '• Bộ nhớ đệm dữ liệu chuỗi thời gian (WAL)',
               '• Endpoint an toàn: /metrics nội bộ Docker',
               '• Cơ chế bảo vệ không làm chậm API chính'],
              header_bg='#F8FAFC', border='#334155')

    # Cột 3: Trực quan hóa Grafana v11 nhúng Admin
    draw_card(ax, 13.5, 5.5, box_w, 2.1, 'Dashboard 1: Nghiệp vụ & Doanh thu',
              ['• Doanh thu bán vé theo mốc thời gian',
               '• Biểu đồ diễn biến lượng khách đặt vé',
               '• Danh sách giao dịch mới nhất PayOS/VietQR'],
              header_bg='#F0FDF4', border='#16A34A')

    draw_card(ax, 13.5, 3.1, box_w, 2.1, 'Dashboard 2: Hạ tầng VPS & Container',
              ['• Đồ thị RAM RSS, Event Loop Lag',
               '• Tải CPU thời gian thực',
               '• Cảnh báo ngưỡng tài nguyên hệ thống'],
              header_bg='#FFFBEB', border='#D97706')

    draw_card(ax, 13.5, 1.0, box_w, 1.5, 'Dashboard 3: Hiệu năng API & Mạng (APM)',
              ['• Lưu lượng truy cập RPS thời gian thực',
               '• Biểu đồ Heatmap phân vị độ trễ',
               '• Tỷ lệ lỗi HTTP Error Rate (%)'],
              header_bg='#EFF6FF', border='#2563EB')

    # Mũi tên từ Nguồn sang Prometheus & PostgreSQL
    draw_pill_arrow(ax, 4.65, 5.5, 11.35, 5.5, label='SQL Query Read-Only')
    draw_pill_arrow(ax, 4.65, 3.1, 6.1, 3.5, label='Scrape /metrics')
    draw_pill_arrow(ax, 4.65, 1.0, 6.1, 2.5, label='Scrape APM')

    # Mũi tên từ Prometheus sang Grafana
    draw_pill_arrow(ax, 9.9, 3.5, 11.35, 3.1, label='PromQL Query')
    draw_pill_arrow(ax, 9.9, 2.5, 11.35, 1.0, label='PromQL Query')

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_14_grafana_architecture.png")

# ==============================================================================
# 8. HÌNH 1.1 / HÌNH 1: SƠ ĐỒ TƯ DUY (MINDMAP) CẤU TRÚC MỤC TIÊU KHÓA LUẬN
# ==============================================================================
def create_hinh_1_1():
    fig, ax = plt.subplots(figsize=(16.0, 7.5), dpi=300)
    ax.set_xlim(0, 16.0); ax.set_ylim(0, 7.5); ax.axis('off')

    ax.text(8.0, 7.15, 'SƠ ĐỒ TƯ DUY (MINDMAP) TỔNG QUAN KIẾN TRÚC VÀ CÁC PHÂN HỆ HỆ THỐNG BẢO TÀNG 360°',
            ha='center', va='center', fontsize=12.0, fontweight='bold', color=C_DARK)
    ax.text(8.0, 6.75, 'Hệ sinh thái số hóa di sản văn hóa đa nền tảng, tích hợp tương tác không gian thực tế ảo và quản trị nghiệp vụ',
            ha='center', va='center', fontsize=9.0, color=C_MUTED)

    # Nút trung tâm: Hệ thống Bảo tàng 360°
    draw_card(ax, 8.0, 3.8, 3.8, 2.4, 'BẢO TÀNG LỊCH SỬ TP.HCM',
              ['HỆ THỐNG THAM QUAN THỰC TẾ ẢO 360°',
               '& SỐ HÓA DI SẢN BẢO VẬT',
               '• Công nghệ Three.js WebGL 60 FPS',
               '• Số hóa trọn vẹn 18 gian phòng',
               '• Tự chủ 100% mã nguồn & hạ tầng'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    card_w = 3.6

    # 4 Nhánh chính xung quanh
    # Nhánh 1: Khách tham quan (Tây Bắc)
    draw_card(ax, 2.6, 5.4, card_w, 2.1, '1. Phân hệ Khách tham quan',
              ['• Tour 360° Panorama Sảnh Bát Giác & 18 phòng',
               '• Tương tác Hotspot chuyển cảnh Cross-fade',
               '• Sơ đồ Mini-map Dijkstra tìm đường ngắn nhất',
               '• Chiêm ngưỡng cổ vật 3D xoay đa chiều'],
              header_bg='#F0FDF4', border='#16A34A', title_color='#15803D')

    # Nhánh 2: Công nghệ AI & Âm thanh (Tây Nam)
    draw_card(ax, 2.6, 2.2, card_w, 2.1, '2. Công nghệ AI & Âm thanh',
              ['• Google Cloud Text-to-Speech Neural2',
               '• Thuyết minh AI 7 ngôn ngữ quốc tế',
               '• Trình phát Audio nổi HTTP 206 Partial Content',
               '• Bộ đệm băm MD5 phát lại siêu tốc (<50ms)'],
              header_bg='#FFFBEB', border='#D97706', title_color='#B45309')

    # Nhánh 3: Thương mại & Soát vé Phygital (Đông Bắc)
    draw_card(ax, 13.4, 5.4, card_w, 2.1, '3. Thương mại & Vé VietQR',
              ['• Đặt vé trực tuyến 3 hạng vé (/booking)',
               '• Cổng thanh toán VietQR Napas 247 PayOS',
               '• Vé điện tử mã hóa AES-256 Tab My ticket',
               '• Soát vé Camera cổng & Đồng bộ SSE (<1ms)'],
              header_bg='#EFF6FF', border='#2563EB', title_color='#1E40AF')

    # Nhánh 4: Quản trị CMS & Giám sát (Đông Nam)
    draw_card(ax, 13.4, 2.2, card_w, 2.1, '4. Quản trị CMS & Giám sát',
              ['• CMS Quản trị đa bảo tàng, ghim Hotspot 3D',
               '• Tái tạo 3D kép TRELLIS AI + Local CPU',
               '• Dashboard Grafana v11 nhúng bảo mật',
               '• Xuất báo cáo Excel 4 sheets chuẩn bảo tàng'],
              header_bg='#FAF5FF', border='#7E22CE', title_color='#6B21A8')

    # Mũi tên kết nối từ Trung tâm ra 4 nhánh
    draw_pill_arrow(ax, 6.1, 4.4, 4.4, 5.0, color='#16A34A', lw=1.6)
    draw_pill_arrow(ax, 6.1, 3.2, 4.4, 2.6, color='#D97706', lw=1.6)
    draw_pill_arrow(ax, 9.9, 4.4, 11.6, 5.0, color='#2563EB', lw=1.6)
    draw_pill_arrow(ax, 9.9, 3.2, 11.6, 2.6, color='#7E22CE', lw=1.6)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_1_1_mindmap.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_1_1_mindmap.png")

# ==============================================================================
# CHẠY TẠO TẤT CẢ CÁC SƠ ĐỒ CHUẨN XÁC
# ==============================================================================
if __name__ == '__main__':
    print("==================================================================")
    print("BẮT ĐẦU TẠO TOÀN BỘ SƠ ĐỒ HỌC THUẬT UML CHUẨN XÁC (KHÔNG LỖI FONT/ĐÈ CHỮ)")
    print("==================================================================")
    create_hinh_2_1()
    create_hinh_2_9()
    create_hinh_4_7()
    create_hinh_4_5()
    create_hinh_3_6()
    create_hinh_3_13()
    create_hinh_2_14()
    create_hinh_1_1()
    print("==================================================================")
    print("HOÀN THÀNH TẠO TẤT CẢ CÁC SƠ ĐỒ ĐẠT CHUẨN 100%!")
    print("==================================================================")
