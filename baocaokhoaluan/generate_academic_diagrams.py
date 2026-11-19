# -*- coding: utf-8 -*-
"""
GENERATE ACADEMIC SOFTWARE ARCHITECTURE & FLOW DIAGRAMS (ALGOMASTER / BYTEBYTEGO STYLE)
Bao cao Khoa luan Tot nghiep - IUH
Phong cach thiet ke:
- Nen trang toi gian, duong net sac sao, tieu chuan ky thuat phan mem
- Cac thuc the truc quan: Actor (nguoi), Server (rack slot & LED), Database (stacked cylinder),
  Device (Mobile / PC), Cloud, Keypoint, Graph...
- Mui ten chi ro luong du lieu kem buoc danh so [1], [2], [3]...
- KHONG chua ca doan van text dai, chi ghi tu khoa ngan gon, tinh te.
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
# VE TOAN BO CAC SO DO CHUYEN NGHIEP (CHUAN ALGOMASTER)
# =============================================================================

def gen_fig_1_1():
    """Hinh 1.1: So do tu duy kien truc he thong Tour 360 (Algomaster Style)"""
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 5.0); ax.axis('off')
    
    # Central Hub
    draw_clean_node(ax, 5.25, 2.5, 2.4, 1.2, "BẢO TÀNG LỊCH SỬ TP.HCM", "Nền tảng Tour 360° & Di sản số", bg="#EFF6FF", border="#1D4ED8", lw=2.0)
    
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
    fig, ax = plt.subplots(figsize=(10.5, 2.6), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.6); ax.axis('off')
    
    stages = [
        ("ĐỢT 1: KHẢO SÁT", "Đo 18 phòng & ma trận kề", 1.3, "#0284C7"),
        ("ĐỢT 2: CHỤP ẢNH 8K", "Ống kính rộng & Lọc Laplacian", 3.9, "#16A34A"),
        ("ĐỢT 3: SỐ HÓA 3D", "Tái tạo Local CPU & TRELLIS", 6.5, "#D97706"),
        ("ĐỢT 4: THỬ NGHIỆM", "VietQR PayOS & Soát vé 150ms", 9.1, "#9333EA")
    ]
    for i, (title, sub, x, color) in enumerate(stages):
        draw_clean_node(ax, x, 1.3, 2.0, 1.1, title, sub, bg="#F8FAFC", border=color, lw=1.6)
        if i < 3:
            next_x = stages[i+1][2]
            draw_step_arrow(ax, x + 1.0, 1.3, next_x - 1.0, 1.3, step=str(i+1), label="")
            
    plt.title("HÌNH 1.3: QUY TRÌNH 4 ĐỢT KHẢO SÁT VÀ THU THẬP DỮ LIỆU TẠI BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_1_3_khao_sat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_1():
    """Hinh 2.1: Mo hinh chuyen doi he toa do cau va anh phang Equirectangular"""
    fig, ax = plt.subplots(figsize=(10, 3.2), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_clean_node(ax, 1.6, 1.6, 2.4, 1.3, "Mặt cầu 3D", "P(X, Y, Z) trên cầu đơn vị\nX² + Y² + Z² = 1", bg="#F8FAFC")
    draw_clean_node(ax, 5.0, 1.6, 2.2, 1.3, "Tọa độ góc (θ, φ)", "Kinh độ θ ∈ [-π, π]\nVĩ độ φ ∈ [-π/2, π/2]", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.4, 1.6, 2.4, 1.3, "Ảnh Equirectangular", "Tọa độ pixel (x, y)\nTỷ lệ chuẩn 2:1 (8K WebP)", bg="#F0FDF4", border="#16A34A")
    
    draw_step_arrow(ax, 2.8, 1.8, 3.9, 1.8, label="Chiếu góc (2.1, 2.2)")
    draw_step_arrow(ax, 3.9, 1.4, 2.8, 1.4, label="Nghịch đảo (2.3, 2.4)")
    draw_step_arrow(ax, 6.1, 1.8, 7.2, 1.8, label="Ánh xạ pixel")
    draw_step_arrow(ax, 7.2, 1.4, 6.1, 1.4, label="Lấy mẫu UV")
    
    plt.title("HÌNH 2.1: MÔ HÌNH CHUYỂN ĐỔI GIỮA HỆ TỌA ĐỘ CẦU VÀ ẢNH PHẲNG EQUIRECTANGULAR", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_1_he_toa_do_cau.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_2():
    """Hinh 2.2: Quy trinh nan chinh bien dang tru (Cylindrical Warping) - Toi gian, khong chu thua"""
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    
    draw_clean_node(ax, 1.5, 1.4, 2.2, 1.2, "Ảnh phẳng 2D", "Khung hình camera góc rộng", bg="#F8FAFC")
    draw_clean_node(ax, 5.0, 1.4, 2.4, 1.2, "Mặt trụ bán kính f", "f = W / (2 · tan(FOV/2))\n(Công thức 2.5 & 2.6)", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.5, 1.4, 2.2, 1.2, "Ảnh nắn trụ (Warped)", "Khử triệt để méo phối cảnh", bg="#F0FDF4", border="#16A34A")
    
    draw_step_arrow(ax, 2.6, 1.4, 3.8, 1.4, step="1", label="Chiếu mặt trụ")
    draw_step_arrow(ax, 6.2, 1.4, 7.4, 1.4, step="2", label="Nội suy Bilinear")
    
    plt.title("HÌNH 2.2: QUY TRÌNH NẮN CHỈNH BIẾN DẠNG HÌNH HỌC TRỤ (CYLINDRICAL WARPING)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_2_cylindrical_warping.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_3():
    """Hinh 2.3: Thap Gauss DoG va SIFT"""
    fig, ax = plt.subplots(figsize=(10.5, 2.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.8); ax.axis('off')
    
    steps = [
        ("Ảnh xám I(x, y)", "Khung ảnh nắn trụ", 1.2),
        ("Tháp Gauss L", "L = G(σ) * I", 3.8),
        ("Sai phân DoG", "D = L_{i+1} - L_i", 6.5),
        ("Đặc trưng SIFT", "Vector 128 chiều", 9.2)
    ]
    for i, (t, s, x) in enumerate(steps):
        draw_clean_node(ax, x, 1.4, 2.0, 1.1, t, s, bg="#F8FAFC", border="#1E293B")
        if i < 3:
            draw_step_arrow(ax, x + 1.0, 1.4, steps[i+1][2] - 1.0, 1.4, step=str(i+1), label="")
            
    plt.title("HÌNH 2.3: KHÔNG GIAN TỶ LỆ SAI PHÂN GAUSS (DoG) VÀ TRÍCH XUẤT ĐẶC TRƯNG SIFT", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_3_dog_sift.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_4():
    """Hinh 2.4: RANSAC va loc Outliers"""
    fig, ax = plt.subplots(figsize=(10, 2.8), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 2.8); ax.axis('off')
    
    draw_clean_node(ax, 1.5, 1.4, 2.2, 1.2, "So khớp k-NN", "Tập cặp điểm thô SIFT\nLowe's Ratio < 0.75", bg="#F8FAFC")
    draw_clean_node(ax, 5.0, 1.4, 2.4, 1.2, "Vòng lặp RANSAC", "Lấy 4 điểm mẫu -> Homography\nĐếm số lượng Inliers tối đa", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.5, 1.4, 2.2, 1.2, "Ma trận chuyển vị H", "Loại 100% Outliers nhiễu", bg="#F0FDF4", border="#16A34A")
    
    draw_step_arrow(ax, 2.6, 1.4, 3.8, 1.4, step="1", label="Lọc bước đầu")
    draw_step_arrow(ax, 6.2, 1.4, 7.4, 1.4, step="2", label="Khử nhiễu RANSAC")
    
    plt.title("HÌNH 2.4: SO KHỚP ĐẶC TRƯNG SIFT VÀ LOẠI BỎ NGOẠI LAI BẰNG RANSAC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_4_ransac.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_5():
    """Hinh 2.5: Seam Cutting va Multiband Blending"""
    fig, ax = plt.subplots(figsize=(10.5, 2.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.8); ax.axis('off')
    
    steps = [
        ("Vùng ảnh chồng lấp", "Độ phủ 30% - 50%", 1.2),
        ("Cắt mí Voronoi Seam", "Cực tiểu hóa năng lượng", 3.8),
        ("Tháp Laplacian", "Phân rã đa dải tần số", 6.5),
        ("Ảnh ghép mịn màng", "Triệt tiêu hoàn toàn mí nối", 9.2)
    ]
    for i, (t, s, x) in enumerate(steps):
        draw_clean_node(ax, x, 1.4, 2.0, 1.1, t, s, bg="#F8FAFC")
        if i < 3:
            draw_step_arrow(ax, x + 1.0, 1.4, steps[i+1][2] - 1.0, 1.4, step=str(i+1), label="")
            
    plt.title("HÌNH 2.5: QUY TRÌNH TỐI ƯU ĐƯỜNG GHÉP MÍ VÀ HÒA TRỘN ĐA DẢI TẦN", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_5_seam_blending.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_6():
    """Hinh 2.6: Three.js Texture Mapping"""
    fig, ax = plt.subplots(figsize=(10, 3.0), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.0); ax.axis('off')
    
    draw_clean_node(ax, 1.5, 1.5, 2.2, 1.2, "Texture Panorama", "Ảnh Equirectangular 8K WebP", bg="#F8FAFC")
    draw_clean_node(ax, 5.0, 1.5, 2.4, 1.2, "Mặt cầu Three.js", "Inverted Sphere (R=500)\nCamera tại O(0,0,0)", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.5, 1.5, 2.2, 1.2, "Không gian Tour 360°", "Xoay Yaw/Pitch & Hotspots", bg="#F0FDF4", border="#16A34A")
    
    draw_step_arrow(ax, 2.6, 1.5, 3.8, 1.5, label="Ánh xạ UV scale.x=-1")
    draw_step_arrow(ax, 6.2, 1.5, 7.4, 1.5, label="Kết xuất WebGL 60 FPS")
    
    plt.title("HÌNH 2.6: NGUYÊN LÝ ÁNH XẠ TEXTURE PANORAMA LÊN MẶT CẦU 3D TRONG THREE.JS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_6_texture_mapping.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_7():
    """Hinh 2.7: Dijkstra Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 2.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.8); ax.axis('off')
    
    steps = [
        ("Ma trận kề đồ thị", "18 phòng & trọng số mét", 1.2),
        ("Hàng đợi Min-Heap", "Rút đỉnh có dist nhỏ nhất", 3.8),
        ("Nới lỏng cạnh kề", "Cập nhật nhãn khoảng cách", 6.5),
        ("Lộ trình tối ưu", "Vẽ nét đứt phát sáng Mini-map", 9.2)
    ]
    for i, (t, s, x) in enumerate(steps):
        draw_clean_node(ax, x, 1.4, 2.0, 1.1, t, s, bg="#F8FAFC")
        if i < 3:
            draw_step_arrow(ax, x + 1.0, 1.4, steps[i+1][2] - 1.0, 1.4, step=str(i+1), label="")
            
    plt.title("HÌNH 2.7: GIẢI THUẬT DIJKSTRA ĐỊNH TUYẾN LIÊN THÔNG BẢO TÀNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_8():
    """Hinh 2.8: Photogrammetry pipeline"""
    fig, ax = plt.subplots(figsize=(10.5, 2.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 2.8); ax.axis('off')
    
    steps = [
        ("Ảnh chụp đa góc", "Chụp vòng quanh hiện vật", 1.2),
        ("SfM Point Cloud", "Ước lượng vị trí camera", 3.8),
        ("Tái tạo lưới 3D", "Sinh đa giác Mesh khép kín", 6.5),
        ("Ánh xạ vân bề mặt", "Mô hình .GLB chất liệu PBR", 9.2)
    ]
    for i, (t, s, x) in enumerate(steps):
        draw_clean_node(ax, x, 1.4, 2.0, 1.1, t, s, bg="#F8FAFC")
        if i < 3:
            draw_step_arrow(ax, x + 1.0, 1.4, steps[i+1][2] - 1.0, 1.4, step=str(i+1), label="")
            
    plt.title("HÌNH 2.8: NGUYÊN LÝ TÁI TẠO MÔ HÌNH 3D PHOTOGRAMMETRY", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_8_photogrammetry.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_9():
    """Hinh 2.9: Kien truc 3 tang (Three-tier Architecture) - Algomaster Style"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    # Tier 1: Clients
    draw_device(ax, 1.2, 3.6, 1.0, 1.1, "Trình duyệt Web", "React 18 / Vite", kind="desktop")
    draw_device(ax, 1.2, 1.4, 0.9, 1.1, "Thiết bị Di động", "Mobile WebGL", kind="mobile")
    
    # Tier 2: Application / Gateway
    draw_server(ax, 4.8, 3.6, 1.4, 1.3, "Nginx Reverse Proxy", "Cổng 80/443 & SSL/TLS")
    draw_server(ax, 4.8, 1.4, 1.4, 1.3, "Node.js Backend", "Express API & Webhook")
    
    # Tier 3: Data & Cloud
    draw_database(ax, 8.8, 3.6, 1.0, 1.1, "CSDL PostgreSQL", "Tickets & PayOS Logs")
    draw_database(ax, 8.8, 2.0, 1.0, 1.1, "CSDL MongoDB", "Museum 360 & Hotspots", color="#10B981")
    draw_cloud(ax, 8.8, 0.6, 1.5, 0.8, "Cloudflare R2", "Ảnh 8K & File .GLB")
    
    # Connectors
    draw_step_arrow(ax, 1.8, 3.6, 4.0, 3.6, label="HTTPS / WSS")
    draw_step_arrow(ax, 1.8, 1.4, 4.0, 1.4, label="REST API")
    draw_step_arrow(ax, 4.8, 2.8, 4.8, 2.2, label="Reverse Proxy")
    draw_step_arrow(ax, 5.6, 3.6, 8.1, 3.6, label="Prisma ORM")
    draw_step_arrow(ax, 5.6, 1.6, 8.1, 2.0, label="Mongoose")
    draw_step_arrow(ax, 5.6, 1.0, 7.8, 0.6, label="S3 SDK Upload")
    
    plt.title("HÌNH 2.9: KIẾN TRÚC TỔNG THỂ 3 TẦNG HỆ THỐNG (THREE-TIER ARCHITECTURE)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_9_architecture_3tier.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_10():
    """Hinh 2.10: JWT Auth Flow"""
    fig, ax = plt.subplots(figsize=(10, 3.2), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_actor(ax, 1.2, 1.6, "Người dùng / Admin", "Client Browser")
    draw_server(ax, 5.0, 1.6, 1.5, 1.3, "Auth Service", "Node.js & JWT Secret")
    draw_database(ax, 8.8, 1.6, 1.0, 1.1, "PostgreSQL", "Bảng Users / Pass Hash")
    
    draw_step_arrow(ax, 1.8, 2.0, 4.1, 2.0, step="1", label="Gửi Login (Email, Pass)")
    draw_step_arrow(ax, 5.8, 2.0, 8.1, 2.0, step="2", label="Verify bcrypt")
    draw_step_arrow(ax, 8.1, 1.2, 5.8, 1.2, step="3", label="User hợp lệ")
    draw_step_arrow(ax, 4.1, 1.2, 1.8, 1.2, step="4", label="Trả về JWT Token")
    
    plt.title("HÌNH 2.10: QUY TRÌNH XÁC THỰC VÀ PHÂN QUYỀN BẰNG JSON WEB TOKEN (JWT)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_10_jwt_auth.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_11():
    """Hinh 2.11: PayOS Payment Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 4.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.0); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.6, "Khách mua vé", "Web Browser")
    draw_server(ax, 3.8, 2.6, 1.4, 1.3, "Backend Server", "Tạo Payment Link")
    draw_cloud(ax, 6.8, 2.6, 1.6, 1.0, "Cổng PayOS", "VietQR Napas 247")
    draw_actor(ax, 9.5, 2.6, "App Ngân hàng", "Quét mã VietQR", color="#16A34A")
    draw_database(ax, 3.8, 0.8, 1.0, 1.0, "PostgreSQL", "Cập nhật PAID")
    
    draw_step_arrow(ax, 1.5, 2.8, 3.0, 2.8, step="1", label="Đặt vé")
    draw_step_arrow(ax, 4.6, 2.8, 5.9, 2.8, step="2", label="Tạo VietQR")
    draw_step_arrow(ax, 7.6, 2.8, 8.9, 2.8, step="3", label="Hiển thị mã")
    draw_step_arrow(ax, 9.5, 2.0, 7.5, 2.0, step="4", label="Chuyển khoản thành công")
    draw_step_arrow(ax, 6.2, 2.0, 4.6, 2.0, step="5", label="Webhook HMAC-SHA256")
    draw_step_arrow(ax, 3.8, 1.8, 3.8, 1.4, step="6", label="Lưu vé & gửi Email")
    
    plt.title("HÌNH 2.11: QUY TRÌNH TÍCH HỢP THANH TOÁN VIETQR VÀ XÁC THỰC WEBHOOK PAYOS", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_11_payos_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_12():
    """Hinh 2.12: QR AES-256 Validation Flow"""
    fig, ax = plt.subplots(figsize=(10, 3.0), dpi=220)
    ax.set_xlim(0, 10); ax.set_ylim(0, 3.0); ax.axis('off')
    
    draw_clean_node(ax, 1.5, 1.5, 2.2, 1.2, "Mã hóa AES-256", "Ticket ID + Hash + Expiry", bg="#F8FAFC")
    draw_device(ax, 5.0, 1.5, 1.0, 1.2, "Vé điện tử QR", "Gửi qua Email du khách", kind="mobile")
    draw_server(ax, 8.5, 1.5, 1.4, 1.3, "Soát vé Camera", "Đối soát CSDL 150ms")
    
    draw_step_arrow(ax, 2.6, 1.5, 4.4, 1.5, step="1", label="Sinh mã QR bảo mật")
    draw_step_arrow(ax, 5.6, 1.5, 7.7, 1.5, step="2", label="Quét mã tại cổng")
    
    plt.title("HÌNH 2.12: QUY TRÌNH MÃ HÓA VÀ XÁC THỰC VÉ ĐIỆN TỬ THỜI GIAN THỰC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_12_qr_validation.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_2_13():
    """Hinh 2.13: Docker Compose Architecture"""
    fig, ax = plt.subplots(figsize=(10.5, 4.5), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.5); ax.axis('off')
    
    # Host Box
    host = patches.FancyBboxPatch((0.5, 0.4), 9.5, 3.8, boxstyle='round,pad=0.03,rounding_size=0.06',
                                  facecolor='#F8FAFC', edgecolor='#1E293B', lw=1.8, ls='--', zorder=2)
    ax.add_patch(host)
    ax.text(0.8, 4.0, "MÁY CHỦ CLOUD VPS (Ubuntu 22.04 LTS) - Docker Compose Bridge Network", fontsize=9, fontweight='bold', color='#1E293B', zorder=3)
    
    draw_server(ax, 2.2, 2.5, 1.5, 1.3, "Nginx Proxy", "Ports 80 / 443")
    draw_server(ax, 5.2, 2.5, 1.5, 1.3, "Node.js API", "Port 5000")
    draw_database(ax, 8.2, 3.0, 1.1, 1.0, "PostgreSQL", "Port 5432")
    draw_database(ax, 8.2, 1.4, 1.1, 1.0, "MongoDB", "Port 27017", color="#10B981")
    
    draw_step_arrow(ax, 3.0, 2.5, 4.3, 2.5, label="Proxy Pass")
    draw_step_arrow(ax, 6.0, 2.7, 7.5, 3.0, label="Prisma")
    draw_step_arrow(ax, 6.0, 2.3, 7.5, 1.5, label="Mongoose")
    
    plt.title("HÌNH 2.13: MÔ HÌNH ĐIỀU PHỐI CONTAINER DOCKER COMPOSE TRÊN MÁY CHỦ", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_13_docker_compose.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_1():
    """Hinh 3.1: Use Case Tong Quat (Algomaster style)"""
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 5.0); ax.axis('off')
    
    draw_actor(ax, 1.2, 3.8, "Khách tham quan", "Web / Mobile")
    draw_actor(ax, 1.2, 1.2, "Nhân viên soát vé", "Camera Scanner", color="#16A34A")
    draw_actor(ax, 9.2, 2.5, "Quản trị viên CMS", "Full Rights", color="#D97706")
    
    usecases = [
        (5.2, 4.2, "Tham quan Tour 360° & Hotspot"),
        (5.2, 3.4, "Chiêm ngưỡng Cổ vật 3D"),
        (5.2, 2.6, "Tìm đường ngắn nhất Dijkstra"),
        (5.2, 1.8, "Đặt vé & Thanh toán VietQR"),
        (5.2, 1.0, "Quét mã QR soát vé tại cổng"),
        (5.2, 0.2, "Quản trị CMS & Giám sát VPS")
    ]
    for x, y, name in usecases:
        ellipse = patches.Ellipse((x, y), 3.2, 0.55, facecolor='#FFFFFF', edgecolor='#1E293B', lw=1.4, zorder=4)
        ax.add_patch(ellipse)
        ax.text(x, y, name, ha='center', va='center', fontsize=8.2, fontweight='bold', color='#0F172A', zorder=5)
        
    # Links
    draw_step_arrow(ax, 1.7, 3.8, 3.5, 4.2)
    draw_step_arrow(ax, 1.7, 3.8, 3.5, 3.4)
    draw_step_arrow(ax, 1.7, 3.8, 3.5, 2.6)
    draw_step_arrow(ax, 1.7, 3.6, 3.5, 1.8)
    draw_step_arrow(ax, 1.7, 1.2, 3.5, 1.0)
    draw_step_arrow(ax, 8.7, 2.5, 6.9, 0.2)
    draw_step_arrow(ax, 8.7, 2.7, 6.9, 3.4)
    
    plt.title("HÌNH 3.1: SƠ ĐỒ USE CASE TỔNG QUÁT HỆ THỐNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_1_use_case_tong_quat.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_3_5():
    """Hinh 3.5: ERD Database Model"""
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.8); ax.axis('off')
    
    tables = [
        (1.8, 3.6, "USERS", "id (PK)\nemail\npassword_hash\nrole (ADMIN, STAFF)"),
        (5.2, 3.6, "TICKETS", "id (PK)\norder_code\nqr_token (AES-256)\nstatus (PAID, USED)"),
        (8.8, 3.6, "AUDIT_LOGS", "id (PK)\naction\nactor_id (FK)\ncreated_at"),
        (1.8, 1.4, "ROOMS (360°)", "id (PK)\nname, code (P01..P18)\npanorama_url (8K)\nfloor_plan_coord"),
        (5.2, 1.4, "HOTSPOTS", "id (PK)\nfrom_room_id (FK)\nto_room_id (FK)\nyaw, pitch coordinates"),
        (8.8, 1.4, "ARTIFACTS (3D)", "id (PK)\nname, era, code\nmodel_glb_url (R2)\nmesh_engine (Trellis/Local)")
    ]
    for x, y, name, fields in tables:
        draw_clean_node(ax, x, y, 2.5, 1.6, name, fields, bg='#FFFFFF', border='#1E293B')
        
    draw_step_arrow(ax, 3.1, 3.6, 3.9, 3.6, label="1 : N")
    draw_step_arrow(ax, 6.5, 3.6, 7.5, 3.6, label="1 : N")
    draw_step_arrow(ax, 3.1, 1.4, 3.9, 1.4, label="1 : N")
    draw_step_arrow(ax, 6.5, 1.4, 7.5, 1.4, label="N : 1")
    
    plt.title("HÌNH 3.5: SƠ ĐỒ QUAN HỆ THỰC THỂ CƠ SỞ DỮ LIỆU (ERD)", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_5_erd.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_1():
    """Hinh 4.1: CI/CD Pipeline (GitHub Actions to VPS)"""
    fig, ax = plt.subplots(figsize=(10.5, 3.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_actor(ax, 1.0, 1.6, "Lập trình viên", "Git Push main")
    draw_cloud(ax, 3.8, 1.6, 1.6, 1.0, "GitHub Actions", "Lint, Test & Build")
    draw_server(ax, 6.8, 1.6, 1.4, 1.3, "Docker Compose", "Pull & Build Images")
    draw_server(ax, 9.4, 1.6, 1.3, 1.3, "Cloud VPS Host", "Live 0-Downtime")
    
    draw_step_arrow(ax, 1.7, 1.6, 2.9, 1.6, step="1", label="git push origin main")
    draw_step_arrow(ax, 4.7, 1.6, 6.0, 1.6, step="2", label="SSH Deployment Key")
    draw_step_arrow(ax, 7.6, 1.6, 8.6, 1.6, step="3", label="docker compose up -d")
    
    plt.title("HÌNH 4.1: ĐƯỜNG ỐNG TỰ ĐỘNG HÓA TRIỂN KHAI CI/CD LÊN MÁY CHỦ", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_1_cicd_pipeline.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_3():
    """Hinh 4.3: Panorama Studio 4 Inputs Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    # 4 Input Devices
    draw_device(ax, 1.2, 3.8, 1.0, 1.0, "1. Webcam Laptop", "Kiểm thử nhanh", kind="desktop")
    draw_device(ax, 1.2, 2.6, 1.0, 1.0, "2. Chọn từ máy", "Ảnh DSLR 8K", kind="desktop")
    draw_device(ax, 1.2, 1.4, 0.9, 1.0, "3. Video quét", "Smartphone / Action Cam", kind="mobile")
    draw_device(ax, 1.2, 0.2, 0.9, 1.0, "4. Quét trực tiếp", "Camera Gyroscope", kind="mobile")
    
    # Processing Stages
    draw_clean_node(ax, 4.8, 2.0, 2.4, 1.4, "Xử lý ảnh Studio", "• Lọc mờ Laplacian (Var ≥ 100)\n• Nắn mặt trụ f\n• Khớp SIFT & RANSAC\n• Ghép mí Voronoi Seam", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 8.6, 2.0, 2.2, 1.4, "Ảnh cầu 360°", "• Equirectangular 8K (2:1)\n• Vá đáy sàn Nadir\n• Tối ưu WebP nạp WebGL", bg="#F0FDF4", border="#16A34A")
    
    for y_in in [3.8, 2.6, 1.4, 0.2]:
        draw_step_arrow(ax, 1.8, y_in, 3.5, 2.0)
    draw_step_arrow(ax, 6.1, 2.0, 7.4, 2.0, label="Xuất ảnh Panorama")
    
    plt.title("HÌNH 4.3: QUY TRÌNH XỬ LÝ GHÉP ẢNH TOÀN CẢNH TỪ 4 NGUỒN ĐẦU VÀO", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_5():
    """Hinh 4.5: So do tai tao 3D voi 2 dong co va Fallback (Algomaster Style)"""
    fig, ax = plt.subplots(figsize=(10.5, 4.6), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 4.6); ax.axis('off')
    
    draw_actor(ax, 1.0, 2.4, "Quản trị viên", "Nạp 1 ảnh / Đa ảnh")
    draw_clean_node(ax, 3.4, 2.4, 1.8, 1.1, "Bộ điều phối 3D", "Ưu tiên Cloud AI")
    
    # Engine 1: Cloud AI (Top)
    draw_cloud(ax, 6.6, 3.6, 1.6, 1.0, "TRELLIS AI Space", "NVIDIA A100 (ZeroGPU)")
    # Engine 2: Local CPU (Bottom)
    draw_server(ax, 6.6, 1.2, 1.5, 1.2, "Local CPU Server", "Otsu + Radial Revolve", led_color='#EF4444')
    
    # Output
    draw_database(ax, 9.4, 2.4, 1.1, 1.1, "Cloudflare R2", "Mô hình .GLB & PBR")
    
    # Connectors
    draw_step_arrow(ax, 1.6, 2.4, 2.4, 2.4, step="1", label="Nạp ảnh tư liệu")
    draw_step_arrow(ax, 4.3, 2.8, 5.7, 3.6, step="2a", label="Ưu tiên gọi API AI", color="#15803D")
    draw_step_arrow(ax, 4.3, 2.0, 5.7, 1.2, step="2b", label="Fallback cạn Quota / Lỗi", color="#DC2626")
    draw_step_arrow(ax, 7.5, 3.6, 8.8, 2.8, label="Mesh 25k PBR chuẩn", color="#15803D")
    draw_step_arrow(ax, 7.5, 1.2, 8.8, 2.0, label="Mesh đối xứng sơ bộ", color="#DC2626")
    
    plt.title("HÌNH 4.5: QUY TRÌNH TÁI TẠO CỔ VẬT 3D VỚI 2 ĐỘNG CƠ VÀ CƠ CHẾ DỰ PHÒNG TỰ ĐỘNG", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_6():
    """Hinh 4.6: Anh so sanh thuc te giua Local CPU va TRELLIS AI tu upload cua user"""
    p2 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104558258_b9b7daa7.jpg"
    p3 = r"C:/Users/HUYNH TAN LOC/.gemini/antigravity/brain/c9a48d8a-80fb-42de-8766-be88653eace8/.user_uploaded/media_1795104579468_1b0a2492.png"
    if not (os.path.exists(p2) and os.path.exists(p3)):
        return
    from PIL import Image
    im2 = Image.open(p2).convert('RGB')
    im3 = Image.open(p3).convert('RGB')
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 5.0), dpi=220)
    ax1.imshow(im2)
    ax1.set_title('(a) ĐỘNG CƠ MÁY CHỦ NỘI BỘ (LOCAL CPU)\nBị ép đối xứng trục xoay -> Phồng tròn như bóng nước,\nmất toàn bộ góc cạnh khối phía sau (95.404 Polygons)', fontsize=9.0, fontweight='bold', pad=8, color='#B91C1C')
    ax1.axis('off')
    
    ax2.imshow(im3)
    ax2.set_title('(b) ĐỘNG CƠ ĐÁM MÂY AI (TRELLIS ZeroGPU)\nDự đoán khối 3D chân thực bằng SLAT Transformer -> Sắc nét\ntừng nếp áo và đài sen bát giác (25.619 Polygons)', fontsize=9.0, fontweight='bold', pad=8, color='#15803D')
    ax2.axis('off')
    
    plt.tight_layout()
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_6_so_sanh_3d_thuc_te.png"), bbox_inches='tight')
    plt.close(fig)

def gen_fig_4_7():
    """Hinh 4.7: Dijkstra Route Flow"""
    fig, ax = plt.subplots(figsize=(10.5, 3.2), dpi=220)
    ax.set_xlim(0, 10.5); ax.set_ylim(0, 3.2); ax.axis('off')
    
    draw_clean_node(ax, 1.4, 1.6, 2.0, 1.2, "Ma trận kề 18 phòng", "Trọng số khoảng cách thực")
    draw_clean_node(ax, 4.4, 1.6, 2.2, 1.2, "Min-Heap Dijkstra", "Độ phức tạp O(E log V)\nNới lỏng cạnh d[v] < d[u] + w", bg="#EFF6FF", border="#0284C7")
    draw_clean_node(ax, 7.4, 1.6, 2.0, 1.2, "Truy vết lộ trình", "Mảng cha parent[v]\nTính toán dưới 5ms")
    draw_device(ax, 9.6, 1.6, 1.0, 1.1, "Hiển thị Tour 360°", "Nét đứt Mini-map", kind="desktop")
    
    draw_step_arrow(ax, 2.5, 1.6, 3.2, 1.6, step="1")
    draw_step_arrow(ax, 5.6, 1.6, 6.3, 1.6, step="2")
    draw_step_arrow(ax, 8.5, 1.6, 9.0, 1.6, step="3")
    
    plt.title("HÌNH 4.7: SƠ ĐỒ GIẢI THUẬT DIJKSTRA ĐỊNH TUYẾN TỐI ƯU 18 PHÒNG TRƯNG BÀY", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png"), bbox_inches='tight'); plt.close(fig)

def gen_fig_4_8():
    """Hinh 4.8: Quy trinh thanh toan VietQR va soat ve Camera (Chuan Algomaster / ByteByteGo)"""
    fig, ax = plt.subplots(figsize=(11.0, 4.8), dpi=220)
    ax.set_xlim(0, 11.0); ax.set_ylim(0, 4.8); ax.axis('off')
    
    draw_actor(ax, 0.8, 3.2, "Khách tham quan", "Mobile / Laptop")
    draw_server(ax, 3.2, 3.2, w=1.3, h=1.4, title="Web & Backend", sub="Node.js / Express")
    draw_cloud(ax, 5.8, 3.2, w=1.6, h=1.0, title="Cổng PayOS", sub="VietQR Napas 247")
    draw_database(ax, 8.5, 3.2, w=1.0, h=1.1, title="PostgreSQL", sub="Tickets DB")

    draw_actor(ax, 8.5, 1.0, "Nhân viên soát vé", "Camera Di động", color="#16A34A")
    draw_server(ax, 5.8, 1.0, w=1.3, h=1.4, title="Soát vé Scanner", sub="html5-qrcode 150ms")
    draw_cloud(ax, 3.2, 1.0, w=1.6, h=1.0, title="Email Service", sub="Mã vé AES-256")

    # Flow arrows
    draw_step_arrow(ax, 1.1, 3.2, 2.5, 3.2, step="1", label="Chọn vé & Đặt")
    draw_step_arrow(ax, 3.9, 3.2, 4.9, 3.2, step="2", label="Tạo VietQR")
    draw_step_arrow(ax, 6.7, 3.2, 7.9, 3.2, step="3", label="Webhook HMAC")
    draw_step_arrow(ax, 8.5, 2.5, 3.9, 1.0, step="4", label="Gửi vé QR AES-256", rad=-0.15)
    draw_step_arrow(ax, 8.2, 1.0, 6.5, 1.0, step="5", label="Quét vé tại cổng")
    draw_step_arrow(ax, 5.8, 1.8, 8.1, 2.7, step="6", label="Đối soát 150ms", rad=-0.15)

    plt.title("HÌNH 4.8: QUY TRÌNH THANH TOÁN VIETQR VÀ KIỂM SOÁT VÉ CAMERA THỜI GIAN THỰC", fontsize=10.5, fontweight='bold', pad=12)
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png"), bbox_inches='tight'); plt.close(fig)

if __name__ == '__main__':
    print("Dang tao toan bo 23 so do hoc thuat theo kieu Algomaster / ByteByteGo...")
    gen_fig_1_1(); gen_fig_1_3(); gen_fig_2_1(); gen_fig_2_2(); gen_fig_2_3()
    gen_fig_2_4(); gen_fig_2_5(); gen_fig_2_6(); gen_fig_2_7(); gen_fig_2_8()
    gen_fig_2_9(); gen_fig_2_10(); gen_fig_2_11(); gen_fig_2_12(); gen_fig_2_13()
    gen_fig_3_1(); gen_fig_3_5(); gen_fig_4_1(); gen_fig_4_3(); gen_fig_4_5()
    gen_fig_4_6(); gen_fig_4_7(); gen_fig_4_8()
    print("=== HOAN TAT TAO TOAN BO 23 SO DO HOC THUAT CHUAN ALGOMASTER! ===")
