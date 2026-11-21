# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỌC THUẬT VỚI BIỂU TƯỢNG HÌNH ẢNH TRỰC QUAN (REAL ICONS)
Bố cục thẻ ngang (Horizontal Card Layout): 
- Icon nằm riêng biệt ở cột bên trái
- Vách ngăn cách nhẹ nhàng
- Tiêu đề và nội dung nằm riêng biệt ở cột bên phải
=> TUYỆT ĐỐI 100% KHÔNG BAO GIỜ BỊ ĐÈ CHỮ HOẶC CHE CHỮ!
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
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Font chuẩn học thuật
plt.rcParams['font.sans-serif'] = ['Arial', 'Segoe UI', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# Bảng màu học thuật trang nhã (Đơn sắc & Slate trung tính)
C_DARK = '#0F172A'          # Chữ chính: Đen than chì sắc nét
C_MUTED = '#475569'         # Chữ phụ: Xám đậm học thuật
C_BORDER = '#334155'        # Đường viền than chì mảnh (1.1pt)
C_BORDER_LIGHT = '#CBD5E1'   # Viền phân cách nhẹ
C_ARROW = '#334155'         # Mũi tên kết nối
C_BG_CARD = '#FFFFFF'       # Nền thẻ trắng tinh khiết

def draw_horizontal_icon_card(ax, x, y, w, h, icon_name, title, lines=None, icon_target_px=40):
    """
    Vẽ khối chức năng với ICON NẰM RIÊNG BÊN TRÁI và CHỮ NẰM RIÊNG BÊN PHẢI.
    Ngăn chặn 100% tình trạng icon đè lên chữ.
    """
    # Khung thẻ nền trắng viền slate
    card = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor=C_BG_CARD, edgecolor=C_BORDER, lw=1.1, zorder=4)
    ax.add_patch(card)
    
    # Cột icon bên trái: rộng khoảng 1.1 đến 1.2 units
    icon_col_w = min(1.2, w * 0.26)
    divider_x = x - w/2 + icon_col_w
    ax.plot([divider_x, divider_x], [y - h/2 + 0.15, y + h/2 - 0.15], color='#E2E8F0', lw=1.0, zorder=5)
    
    # Vẽ icon ở trung tâm cột trái
    icon_center_x = (x - w/2 + divider_x) / 2
    if icon_name:
        p = os.path.join(DOCS_ICONS, icon_name)
        if os.path.exists(p):
            im = Image.open(p)
            zoom = float(icon_target_px) / float(max(im.size))
            im_box = OffsetImage(im, zoom=zoom)
            ab = AnnotationBbox(im_box, (icon_center_x, y), frameon=False, zorder=10)
            ax.add_artist(ab)
            
    # Vẽ chữ ở cột bên phải (Canh lề trái, rộng rãi)
    text_x = divider_x + 0.16
    if lines:
        title_y = y + h/2 - 0.35
        ax.text(text_x, title_y, title, ha='left', va='top', fontsize=8.1, fontweight='bold', color=C_DARK, zorder=10)
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(text_x, title_y - 0.26, content, ha='left', va='top', fontsize=7.0, color=C_MUTED, linespacing=1.28, zorder=10)
    else:
        ax.text(text_x, y, title, ha='left', va='center', fontsize=8.3, fontweight='bold', color=C_DARK, zorder=10)

def draw_actor_clean(ax, x, y, label="Quản trị viên", sub="", scale=1.0):
    """Vẽ biểu tượng tác nhân Actor gọn gàng, học thuật."""
    r = 0.14 * scale
    head = patches.Circle((x, y + 0.30 * scale), r, facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=12)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.05 * scale), 0.36 * scale, 0.26 * scale,
                           facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=12)
    ax.add_patch(body)
    if label:
        ax.text(x, y - 0.22 * scale, label, ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_DARK, zorder=14)
    if sub:
        ax.text(x, y - 0.40 * scale, sub, ha='center', va='top', fontsize=6.8, color=C_MUTED, zorder=14)

def draw_pill_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top'):
    """Vẽ mũi tên kết nối với hộp nhãn đệm nền trắng che sạch đường ngầm."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5,
                                mutation_scale=12, connectionstyle=conn), zorder=6)
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.20
        if label_side == 'top':
            lx, ly = mx, my + offset + (0.08 if rad > 0 else 0)
            ha, va = 'center', 'bottom'
        elif label_side == 'bottom':
            lx, ly = mx, my - offset - (0.08 if rad < 0 else 0)
            ha, va = 'center', 'top'
        elif label_side == 'left':
            lx, ly = mx - offset, my
            ha, va = 'right', 'center'
        else:
            lx, ly = mx + offset, my
            ha, va = 'left', 'center'

        full_text = f"{label}\n({sub})" if sub else label
        ax.text(lx, ly, full_text, ha=ha, va=va, fontsize=6.8, fontweight='bold' if label else 'normal',
                color=C_DARK,
                bbox=dict(boxstyle='round,pad=0.20', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6, alpha=0.98),
                zorder=12)


# ==============================================================================
# 1. HÌNH 5 / HÌNH 4.5: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP ĐA ĐỘNG CƠ
# Sửa triệt để lỗi icon đè vào chữ trong media_1795286025565_4824f8a5.jpg
# ==============================================================================
def create_fig_4_5_artifact_2engines():
    fig, ax = plt.subplots(figsize=(15.6, 9.0), dpi=300)
    ax.set_xlim(0, 15.6)
    ax.set_ylim(0, 9.0)
    ax.axis('off')

    # Tiêu đề sơ đồ chuẩn học thuật
    ax.text(7.8, 8.6, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÁI TẠO CỔ VẬT 3D LAI GHÉP VỚI 2 ĐỘNG CƠ VÀ DỰ PHÒNG TỰ ĐỘNG',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.8, 8.28, 'Bố cục tích hợp biểu tượng công cụ trực quan: Nguồn ảnh 2D, U2-Net, Điều phối Queue, Heuristic CPU và Cloud AI TRELLIS',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # 1. BƯỚC 1: ẢNH ĐẦU VÀO HIỆN VẬT (x = 4.2, y = 6.8)
    draw_actor_clean(ax, 1.0, 6.8, 'Quản trị viên', 'Nạp tư liệu', scale=0.9)
    draw_horizontal_icon_card(ax, 4.3, 6.8, 4.8, 1.9,
                              icon_name='icon_phone.png',
                              title='1. ẢNH ĐẦU VÀO HIỆN VẬT',
                              lines=['• Tải lên ảnh 2D hiện vật chụp đơn/nhiều góc',
                                     '• Hiện vật: Trống đồng, Tượng Phật, Phù điêu đá',
                                     '• Hỗ trợ định dạng: JPG / PNG độ nét cao'],
                              icon_target_px=42)
    draw_pill_arrow(ax, 1.5, 6.8, 1.9, 6.8, label='Tải ảnh')

    # 2. BƯỚC 2: BÓC TÁCH NỀN U2-NET (x = 11.5, y = 6.8)
    draw_horizontal_icon_card(ax, 11.5, 6.8, 5.0, 1.9,
                              icon_name='icon_feature_match.png',
                              title='2. BÓC TÁCH NỀN (U2-NET)',
                              lines=['• Mạng nơ-ron U2-Net bóc tách phông nền chuẩn xác',
                                     '• Chuẩn hóa kênh Alpha trong suốt, cân bằng sáng',
                                     '• Loại bỏ hoàn toàn nhiễu bối cảnh tủ kính trưng bày'],
                              icon_target_px=40)
    draw_pill_arrow(ax, 6.7, 6.8, 9.0, 6.8, label='Chuyển giao ảnh 2D', sub='API RESTful')

    # 3. BƯỚC 3: BỘ ĐIỀU PHỐI ĐA ĐỘNG CƠ (x = 7.8, y = 4.1)
    draw_horizontal_icon_card(ax, 7.8, 4.1, 4.6, 1.9,
                              icon_name='icon_server.png',
                              title='3. BỘ ĐIỀU PHỐI ĐA ĐỘNG CƠ',
                              lines=['• artifact3dQueue giám sát tải tài nguyên',
                                     '• Kiểm tra cấu hình hệ thống & Quota API',
                                     '• Phân luồng thông minh sang CPU hoặc GPU'],
                              icon_target_px=42)

    # Mũi tên từ Bước 2 -> Bước 3
    ax.annotate('', xy=(10.1, 4.7), xytext=(11.5, 5.85),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5,
                                mutation_scale=12, connectionstyle='arc3,rad=0.15'), zorder=6)
    ax.text(11.4, 5.25, 'Đẩy hàng đợi\n(artifact3dQueue)', ha='center', va='center', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.20', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # 4. NHÁNH TRÁI: ĐỘNG CƠ HEURISTIC CPU (x = 3.2, y = 4.1)
    draw_horizontal_icon_card(ax, 3.2, 4.1, 4.2, 1.9,
                              icon_name='icon_laptop.png',
                              title='ĐỘNG CƠ HEURISTIC CPU',
                              lines=['• Module Python v15.0 chạy trên VPS',
                                     '• Dựng 2.5D Displacement Mapping',
                                     '• Phân tích Depth Map (0.8s, 0$ GPU)',
                                     '• Chạy độc lập 100% nội bộ'],
                              icon_target_px=42)

    # 4. NHÁNH PHẢI: ĐỘNG CƠ TRELLIS CLOUD GPU (x = 12.4, y = 4.1)
    draw_horizontal_icon_card(ax, 12.4, 4.1, 4.4, 1.9,
                              icon_name='icon_ai_chip.png',
                              title='ĐỘNG CƠ TRELLIS CLOUD GPU',
                              lines=['• Mô hình TRELLIS 3D Foundation Model',
                                     '• HuggingFace ZeroGPU A100 (Cloud AI)',
                                     '• Tái tạo 360° cả mặt trước và mặt sau',
                                     '• Kết cấu PBR Albedo / Normal (15s)'],
                              icon_target_px=40)

    # Mũi tên từ Bộ điều phối sang 2 nhánh:
    ax.annotate('', xy=(5.3, 4.1), xytext=(5.5, 4.1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(5.4, 4.45, 'Chế độ CPU\n(Dự phòng / 0$)', ha='center', va='bottom', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    ax.annotate('', xy=(10.2, 4.1), xytext=(10.1, 4.1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.2, 4.45, 'Chế độ GPU\n(Ưu tiên AI)', ha='center', va='bottom', fontsize=6.8, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # Mũi tên Fallback dự phòng tự động
    ax.annotate('', xy=(5.3, 3.5), xytext=(10.2, 3.5),
                arrowprops=dict(arrowstyle='->', color='#B91C1C', lw=1.2, linestyle='--', shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(7.8, 3.25, 'Tự động Fallback khi Quota 429 hoặc Timeout > 300s', ha='center', va='top', fontsize=6.7,
            fontweight='bold', color='#B91C1C', bbox=dict(boxstyle='round,pad=0.20', facecolor='#FEF2F2', edgecolor='#F87171', lw=0.6), zorder=12)

    # 5. BƯỚC 4: XUẤT BẢN HIỆN VẬT 3D TƯƠNG TÁC (x = 7.8, y = 1.4)
    draw_horizontal_icon_card(ax, 7.8, 1.4, 6.2, 1.9,
                              icon_name='icon_wireframe_3d.png',
                              title='4. XUẤT BẢN HIỆN VẬT 3D TƯƠNG TÁC (.GLB)',
                              lines=['• Tối ưu hóa lưới đa giác, nén kết cấu Draco siêu nhẹ (1.8 – 3.5 MB)',
                                     '• Xuất định dạng chuẩn .GLB nạp vào Three.js WebGL / Three-Fiber',
                                     '• Khách tham quan xoay 360°, phóng to hoa văn và nghe thuyết minh Audio'],
                              icon_target_px=40)

    # Mũi tên từ CPU -> Bước 4
    ax.annotate('', xy=(5.2, 2.05), xytext=(4.0, 3.15),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(4.2, 2.45, 'Xuất .GLB CPU\n(Dạng xoay trục)', ha='center', va='center', fontsize=6.6, color=C_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # Mũi tên từ GPU -> Bước 4
    ax.annotate('', xy=(10.4, 2.05), xytext=(11.6, 3.15),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(11.4, 2.45, 'Xuất .GLB PBR\n(Chuẩn bảo tàng)', ha='center', va='center', fontsize=6.6, color=C_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png")
    out2 = os.path.join(ASSETS_DIR, "flow_04_dual_engine_3d.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong khong de chu: hinh_4_5_artifact_2engines.png & flow_04_dual_engine_3d.png")


# ==============================================================================
# 2. HÌNH 6 / HÌNH 3.6: QUY TRÌNH ĐẶT VÉ VIETQR VÀ SOÁT VÉ QR THỜI GIAN THỰC
# Bám sát chính xác luồng media_1795286083704_1bbee50e.png mà người dùng đã gửi!
# ==============================================================================
def create_fig_3_6_ticketing_lifecycle():
    fig, ax = plt.subplots(figsize=(15.2, 8.8), dpi=300)
    ax.set_xlim(0, 15.2)
    ax.set_ylim(0, 8.8)
    ax.axis('off')

    ax.text(7.6, 8.4, 'SƠ ĐỒ HOẠT ĐỘNG: VÒNG ĐỜI VÉ THAM QUAN, THANH TOÁN VIETQR VÀ SOÁT VÉ CAMERA QR',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.6, 8.08, 'Quy trình 5 bước khép kín: Đặt vé trực tuyến, Thanh toán PayOS, Phát hành vé điện tử, Soát vé cổng và Cập nhật doanh thu',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # 1. BƯỚC 1: ĐẶT VÉ TRỰC TUYẾN (CLIENT) (x = 4.2, y = 6.6)
    draw_horizontal_icon_card(ax, 4.2, 6.6, 5.4, 1.8,
                              icon_name='icon_laptop.png',
                              title='1. ĐẶT VÉ TRỰC TUYẾN (CLIENT)',
                              lines=['• Khách chọn loại vé (30.000đ / 15.000đ)',
                                     '• Chọn khung giờ tham quan (Sáng / Chiều)',
                                     '• Nhập thông tin liên hệ và số lượng vé'],
                              icon_target_px=42)

    # 2. BƯỚC 2: THANH TOÁN VIETQR (PAYOS) (x = 11.2, y = 6.6)
    draw_horizontal_icon_card(ax, 11.2, 6.6, 5.4, 1.8,
                              icon_name='icon_phone.png',
                              title='2. THANH TOÁN VIETQR (PAYOS)',
                              lines=['• Cổng PayOS sinh mã VietQR Napas 247 động',
                                     '• Khách quét app ngân hàng thanh toán tức thì',
                                     '• Hạn mức đồng hồ đếm ngược 15 phút'],
                              icon_target_px=40)

    # Mũi tên từ Bước 1 -> Bước 2
    draw_pill_arrow(ax, 6.9, 6.6, 8.5, 6.6, label='Khởi tạo đơn', sub='PayOS Gateway')

    # 3. BƯỚC 3: PHÁT HÀNH VÉ ĐIỆN TỬ (x = 11.2, y = 4.2)
    draw_horizontal_icon_card(ax, 11.2, 4.2, 5.4, 1.8,
                              icon_name='icon_server.png',
                              title='3. PHÁT HÀNH VÉ ĐIỆN TỬ',
                              lines=['• Webhook HMAC-SHA256 xác nhận giao dịch',
                                     '• Sinh mã vé BTLS-2026-XXXXXX & Mã QR vé',
                                     '• Nạp vé mã hóa AES-256 vào Tab My ticket'],
                              icon_target_px=42)

    # Mũi tên từ Bước 2 -> Bước 3
    draw_pill_arrow(ax, 11.2, 5.7, 11.2, 5.1, label='Webhook xác nhận', label_side='right')

    # 4. BƯỚC 4: SOÁT VÉ BẰNG CAMERA QR (x = 4.2, y = 4.2)
    draw_horizontal_icon_card(ax, 4.2, 4.2, 5.4, 1.8,
                              icon_name='icon_phone.png',
                              title='4. SOÁT VÉ BẰNG CAMERA QR',
                              lines=['• Nhân viên dùng Camera quét mã QR tại cổng',
                                     '• Giải mã token và đối soát cơ sở dữ liệu',
                                     '• Phát âm Bíp 880Hz, chặn đứng quay vòng vé'],
                              icon_target_px=40)

    # Mũi tên từ Bước 3 -> Bước 4
    draw_pill_arrow(ax, 8.5, 4.2, 6.9, 4.2, label='Quét vé tại cổng', sub='HTML5-QRCode')

    # 5. BƯỚC 5: CẬP NHẬT DOANH THU & TRẠNG THÁI (x = 4.2, y = 1.8)
    draw_horizontal_icon_card(ax, 4.2, 1.8, 5.4, 1.8,
                              icon_name='icon_monitor.png',
                              title='5. CẬP NHẬT DOANH THU & TRẠNG THÁI',
                              lines=['• Cập nhật trạng thái CSDL sang \'Đã vào cổng\'',
                                     '• Sự kiện Realtime SSE bắn về máy du khách (<1ms)',
                                     '• Cộng dồn doanh thu & Dashboard Grafana Admin'],
                              icon_target_px=40)

    # Mũi tên từ Bước 4 -> Bước 5
    draw_pill_arrow(ax, 4.2, 3.3, 4.2, 2.7, label='Xác thực hợp lệ', label_side='left')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png")
    out2 = os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png")
    out3 = os.path.join(ASSETS_DIR, "flow_05_ticketing_vietqr_qr.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    fig.savefig(out3, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_6_activity_booking_ticket_lifecycle.png & flow_05_ticketing_vietqr_qr.png")


# ==============================================================================
# 3. HÌNH 7 / HÌNH 2.14: KIẾN TRÚC GIÁM SÁT GRAFANA VÀ PROMETHEUS (SỬA HÌNH 2)
# Bỏ hoàn toàn các viền xanh, đỏ, vàng, cam; Sửa triệt để mũi tên đè lên chữ!
# ==============================================================================
def create_fig_2_14_grafana_monitoring():
    fig, ax = plt.subplots(figsize=(15.6, 9.0), dpi=300)
    ax.set_xlim(0, 15.6)
    ax.set_ylim(0, 9.0)
    ax.axis('off')

    ax.text(7.8, 8.6, 'SƠ ĐỒ KIẾN TRÚC THU THẬP VÀ HIỂN THỊ DỮ LIỆU GIÁM SÁT HỆ THỐNG VỚI GRAFANA & PROMETHEUS',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.8, 8.28, 'Giám sát toàn diện 3 tầng: Nghiệp vụ & Doanh thu, Hạ tầng phần cứng VPS, và Hiệu năng mạng APM',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # CỘT 1: NGUỒN DỮ LIỆU (Bên trái: x = 2.6)
    # 1.1. PostgreSQL 16
    draw_horizontal_icon_card(ax, 2.6, 6.7, 4.4, 1.8,
                              icon_name='icon_database.png',
                              title='1. Nguồn Nghiệp vụ: PostgreSQL 16',
                              lines=['• Dữ liệu vé tham quan, đơn hàng PayOS',
                                     '• Tỷ lệ vào cổng, doanh thu thực tế',
                                     '• Kết nối an toàn Read-Only pg_readonly'],
                              icon_target_px=40)

    # 1.2. Node.js Exporter
    draw_horizontal_icon_card(ax, 2.6, 4.3, 4.4, 1.8,
                              icon_name='icon_server.png',
                              title='2. Nguồn Hạ tầng: Node.js Exporter',
                              lines=['• Dung lượng RAM RSS & Heap Memory',
                                     '• Tần suất CPU Node.js, Thời gian Uptime',
                                     '• Trạng thái hoạt động Container Docker'],
                              icon_target_px=42)

    # 1.3. Express APM
    draw_horizontal_icon_card(ax, 2.6, 1.9, 4.4, 1.8,
                              icon_name='icon_laptop.png',
                              title='3. Nguồn Hiệu năng: Express APM',
                              lines=['• Lưu lượng Request/giây (Throughput RPS)',
                                     '• Phân vị độ trễ phản hồi p50, p95, p99',
                                     '• Tỷ lệ mã trạng thái HTTP 2xx/4xx/5xx'],
                              icon_target_px=40)

    # CỘT 2: PROMETHEUS TSDB ENGINE (Ở giữa: x = 7.8, y = 3.6)
    draw_horizontal_icon_card(ax, 7.8, 3.6, 4.4, 3.4,
                              icon_name='icon_database.png',
                              title='Prometheus TSDB Engine (v2.53)',
                              lines=['• Time-Series Database lưu trữ chỉ số viễn trắc',
                                     '• Cào dữ liệu định kỳ mỗi 15 giây (Scrape)',
                                     '• Bộ nhớ đệm dữ liệu chuỗi thời gian (WAL)',
                                     '• Endpoint an toàn: /metrics nội bộ Docker',
                                     '• Cơ chế bảo vệ không làm chậm API chính'],
                              icon_target_px=44)

    # CỘT 3: TRỰC QUAN HÓA GRAFANA V11 (Bên phải: x = 13.0)
    # 3.1. Dashboard 1: Nghiệp vụ & Doanh thu
    draw_horizontal_icon_card(ax, 13.0, 6.7, 4.4, 1.8,
                              icon_name='icon_monitor.png',
                              title='Dashboard 1: Nghiệp vụ & Doanh thu',
                              lines=['• Doanh thu bán vé theo mốc thời gian',
                                     '• Biểu đồ diễn biến lượng khách đặt vé',
                                     '• Danh sách giao dịch mới nhất PayOS/VietQR'],
                              icon_target_px=40)

    # 3.2. Dashboard 2: Hạ tầng VPS & Container
    draw_horizontal_icon_card(ax, 13.0, 4.3, 4.4, 1.8,
                              icon_name='icon_monitor.png',
                              title='Dashboard 2: Hạ tầng VPS & Container',
                              lines=['• Đồ thị RAM RSS, Event Loop Lag',
                                     '• Tải CPU thời gian thực',
                                     '• Cảnh báo ngưỡng tài nguyên hệ thống'],
                              icon_target_px=40)

    # 3.3. Dashboard 3: Hiệu năng API & Mạng (APM)
    draw_horizontal_icon_card(ax, 13.0, 1.9, 4.4, 1.8,
                              icon_name='icon_monitor.png',
                              title='Dashboard 3: Hiệu năng API & Mạng (APM)',
                              lines=['• Lưu lượng truy cập RPS thời gian thực',
                                     '• Biểu đồ Heatmap phân vị độ trễ',
                                     '• Tỷ lệ lỗi HTTP Error Rate (%)'],
                              icon_target_px=40)

    # --- MŨI TÊN KẾT NỐI MẠCH LẠC, TUYỆT ĐỐI KHÔNG CẮT NGANG KHỐI PROMETHEUS ---
    # 1. Đường SQL Query từ PostgreSQL -> Grafana Dashboard 1 (ĐI VÒNG LÊN PHÍA TRÊN, KHÔNG CẮT PROMETHEUS)
    ax.annotate('', xy=(10.8, 6.7), xytext=(4.8, 6.7),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(7.8, 7.05, 'Truy vấn SQL Query trực tiếp (PostgreSQL Read-Only)', ha='center', va='bottom', fontsize=7.1,
            fontweight='bold', color=C_DARK, bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.6), zorder=12)

    # 2. Đường Scrape /metrics từ Node.js Exporter -> Prometheus
    ax.annotate('', xy=(5.6, 4.3), xytext=(4.8, 4.3),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(5.2, 4.58, 'Scrape\n/metrics', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 3. Đường Scrape APM từ Express APM -> Prometheus
    ax.annotate('', xy=(5.6, 2.7), xytext=(4.8, 2.2),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(5.2, 2.85, 'Scrape\nAPM', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 4. Đường PromQL Query từ Prometheus -> Dashboard 2 (Hạ tầng)
    ax.annotate('', xy=(10.8, 4.3), xytext=(10.0, 4.3),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.4, 4.58, 'PromQL\nQuery', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    # 5. Đường PromQL Query từ Prometheus -> Dashboard 3 (APM)
    ax.annotate('', xy=(10.8, 2.6), xytext=(10.0, 3.1),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, shrinkA=5, shrinkB=5, mutation_scale=12), zorder=6)
    ax.text(10.4, 3.05, 'PromQL\nQuery', ha='center', va='bottom', fontsize=6.7, fontweight='bold',
            color=C_DARK, bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor=C_BORDER_LIGHT, lw=0.5), zorder=12)

    out_p = os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png")
    fig.savefig(out_p, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_14_grafana_architecture.png")




# ==============================================================================
# 4. HÌNH 4.1 / FLOW 1: QUY TRÌNH GHÉP ẢNH TOÀN CẢNH 360° TỰ ĐỘNG
# ==============================================================================
def create_fig_4_1_stitching():
    fig, ax = plt.subplots(figsize=(15.6, 9.0), dpi=300)
    ax.set_xlim(0, 15.6)
    ax.set_ylim(0, 9.0)
    ax.axis('off')

    ax.text(7.8, 8.6, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TẠO & GHÉP ẢNH TOÀN CẢNH 360° TỰ ĐỘNG TỪ 4 NGUỒN DỮ LIỆU',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.8, 8.28, 'Chuỗi xử lý thị giác máy tính khép kín: Trích lọc khung hình, Nắn trụ, So khớp RootSIFT/RANSAC, Cắt mí Voronoi và Vá sàn Nadir',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # Bước 1: 4 Nguồn dữ liệu đầu vào (x = 3.6, y = 6.7)
    draw_horizontal_icon_card(ax, 3.6, 6.7, 5.4, 1.8,
                              icon_name='icon_phone.png',
                              title='1. NẠP NGUỒN ẢNH ĐẦU VÀO',
                              lines=['• 4 Chế độ: Webcam, Tập ảnh, Video quét, Gyroscope',
                                     '• Thu thập thực địa bằng Smartphone/Máy ảnh số',
                                     '• Đảm bảo độ gối mí không gian 60% – 75%'],
                              icon_target_px=40)

    # Bước 2: Lọc mờ & Nắn phẳng mặt trụ (x = 11.5, y = 6.7)
    draw_horizontal_icon_card(ax, 11.5, 6.7, 5.4, 1.8,
                              icon_name='icon_feature_match.png',
                              title='2. TIỀN XỬ LÝ & NẮN TRỤ (WARPING)',
                              lines=['• Biến đổi Laplacian lọc khung hình mờ (Var >= 100)',
                                     '• Phép chiếu trụ Cylindrical Warping khử méo góc',
                                     '• Hiệu chỉnh cân bằng sáng đa khung hình'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 6.3, 6.7, 8.8, 6.7, label='Trích lọc khung hình', sub='stitchQueue')

    # Bước 3: Trích xuất đặc trưng & So khớp (x = 11.5, y = 4.3)
    draw_horizontal_icon_card(ax, 11.5, 4.3, 5.4, 1.8,
                              icon_name='icon_feature_match.png',
                              title='3. SO KHỚP ĐẶC TRƯNG ROOTSIFT',
                              lines=['• Trích xuất đặc trưng RootSIFT 128 chiều',
                                     '• Thuật toán lọc nhiễu RANSAC (ngưỡng 3.0 px)',
                                     '• Ước lượng ma trận truyền ánh xạ Homography'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 11.5, 5.8, 11.5, 5.2, label='Ma trận k-NN', label_side='right')

    # Bước 4: Đường khâu Voronoi & Hòa trộn Laplacian (x = 3.6, y = 4.3)
    draw_horizontal_icon_card(ax, 3.6, 4.3, 5.4, 1.8,
                              icon_name='icon_server.png',
                              title='4. TỐI ƯU SEAMLINE & HÒA TRỘN',
                              lines=['• Tối ưu đường cắt Voronoi theo gradient cực tiểu',
                                     '• Kim tự tháp Laplacian Pyramid hòa trộn đa dải tần',
                                     '• Triệt tiêu hoàn toàn đường viền ghép mí ảnh'],
                              icon_target_px=42)

    draw_pill_arrow(ax, 8.8, 4.3, 6.3, 4.3, label='Đồng bộ Homography', label_side='bottom')

    # Bước 5: Vá sàn Nadir & Xuất ảnh cầu Equirectangular 2:1 (x = 7.6, y = 1.8)
    draw_horizontal_icon_card(ax, 7.6, 1.8, 6.6, 1.8,
                              icon_name='icon_360_grid.png',
                              title='5. VÁ ĐÁY SÀN NADIR & XUẤT ẢNH CẦU 360°',
                              lines=['• Thuật toán Nadir Inpainting xóa chân máy và bóng người',
                                     '• Xuất ảnh phẳng Equirectangular chuẩn tỷ lệ 2:1 (4K / 8K WebP)',
                                     '• Nạp trực tiếp vào Three.js WebGL phân phối qua CDN Nginx'],
                              icon_target_px=42)

    draw_pill_arrow(ax, 3.6, 3.4, 5.0, 2.7, label='Nội suy hoa văn sàn', label_side='left')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_4_3_panorama_4inputs.png")
    out2 = os.path.join(ASSETS_DIR, "flow_01_stitching_process.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_3_panorama_4inputs.png & flow_01_stitching_process.png")


# ==============================================================================
# 5. HÌNH 4.4 / FLOW 2: SƠ ĐỒ ĐỊNH TUYẾN DIJKSTRA VÀ MINI-MAP 18 PHÒNG
# ==============================================================================
def create_fig_4_4_dijkstra():
    fig, ax = plt.subplots(figsize=(15.6, 9.0), dpi=300)
    ax.set_xlim(0, 15.6)
    ax.set_ylim(0, 9.0)
    ax.axis('off')

    ax.text(7.8, 8.6, 'SƠ ĐỒ THUẬT TOÁN: SỐ HÓA SƠ ĐỒ MẶT BẰNG VÀ ĐỊNH TUYẾN ĐƯỜNG ĐI NGẮN NHẤT DIJKSTRA',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.8, 8.28, 'Mô hình hóa đồ thị 18 gian phòng bảo tàng, hàng đợi ưu tiên Min-Heap và hiển thị nón nhìn Radar View',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # Bước 1: Số hóa sơ đồ mặt bằng kiến trúc
    draw_horizontal_icon_card(ax, 3.6, 6.7, 5.4, 1.8,
                              icon_name='icon_laptop.png',
                              title='1. SỐ HÓA SƠ ĐỒ MẶT BẰNG',
                              lines=['• Tọa độ hóa 18 gian phòng trưng bày vật lý',
                                     '• Xác định 52 liên kết cửa thông phòng thực tế',
                                     '• Xây dựng ma trận trọng số khoảng cách mét (m)'],
                              icon_target_px=42)

    # Bước 2: Mô hình hóa Đồ thị Vô hướng G(V, E)
    draw_horizontal_icon_card(ax, 11.5, 6.7, 5.4, 1.8,
                              icon_name='icon_feature_match.png',
                              title='2. MÔ HÌNH ĐỒ THỊ G = (V, E)',
                              lines=['• Tập đỉnh V: 18 phòng trưng bày + Sảnh Bát Giác',
                                     '• Tập cạnh E: Các cửa thông phòng có trọng số',
                                     '• Cập nhật động theo trạng thái mở/đóng cửa'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 6.3, 6.7, 8.8, 6.7, label='Khởi tạo Topology')

    # Bước 3: Thuật toán Dijkstra Min-Heap
    draw_horizontal_icon_card(ax, 11.5, 4.3, 5.4, 1.8,
                              icon_name='icon_server.png',
                              title='3. THUẬT TOÁN DIJKSTRA (MIN-HEAP)',
                              lines=['• Cấu trúc hàng đợi ưu tiên Min-Heap tối ưu O(E log V)',
                                     '• Nới lỏng cạnh: d[v] = min(d[v], d[u] + w(u, v))',
                                     '• Tìm lộ trình ngắn nhất từ phòng hiện tại đến đích'],
                              icon_target_px=42)

    draw_pill_arrow(ax, 11.5, 5.8, 11.5, 5.2, label='Đưa (0, Start) vào Heap', label_side='right')

    # Bước 4: Vẽ đường định hướng Mini-map & Radar View
    draw_horizontal_icon_card(ax, 3.6, 4.3, 5.4, 1.8,
                              icon_name='icon_monitor.png',
                              title='4. VẼ LỘ TRÌNH VÀ NÓN GÓC NHÌN',
                              lines=['• Vẽ đường nét đứt phát sáng (Pulsing Glow)',
                                     '• Nón nhìn Radar View xoay đồng bộ góc nhìn 360°',
                                     '• Cập nhật vị trí tức thời khi du khách bước qua cửa'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 8.8, 4.3, 6.3, 4.3, label='Truy vết đường đi ngắn nhất', label_side='bottom')

    # Bước 5: Tương tác chuyển cảnh Hotspot 3D
    draw_horizontal_icon_card(ax, 7.6, 1.8, 6.6, 1.8,
                              icon_name='icon_phone.png',
                              title='5. ĐIỀU HƯỚNG TƯƠNG TÁC 360° (CROSS-FADE)',
                              lines=['• Raycaster bắt tọa độ góc cầu (Pitch, Yaw) của mũi tên',
                                     '• Hiệu ứng Cross-fade chuyển cảnh 350ms êm dịu thị giác',
                                     '• Tự động giải phóng VRAM phòng cũ qua dispose()'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 3.6, 3.4, 5.0, 2.7, label='Khách chạm Hotspot', label_side='left')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_2_7_dijkstra.png")
    out2 = os.path.join(DIAGRAMS_DIR, "hinh_4_7_dijkstra_flow.png")
    out3 = os.path.join(ASSETS_DIR, "flow_02_floorplan_dijkstra.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    fig.savefig(out3, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_7_dijkstra_flow.png & flow_02_floorplan_dijkstra.png")


# ==============================================================================
# 6. HÌNH 4.9 / FLOW 3: QUY TRÌNH ĐIỀU PHỐI ĐA NGÔN NGỮ & VOICE AI TTS
# ==============================================================================
def create_fig_4_9_languages_voice_ai():
    fig, ax = plt.subplots(figsize=(15.6, 9.0), dpi=300)
    ax.set_xlim(0, 15.6)
    ax.set_ylim(0, 9.0)
    ax.axis('off')

    ax.text(7.8, 8.6, 'SƠ ĐỒ HOẠT ĐỘNG: ĐIỀU PHỐI ĐA NGÔN NGỮ VÀ ĐỘNG CƠ GIỌNG ĐỌC AI GOOGLE CLOUD TTS',
            ha='center', va='center', fontsize=10.2, fontweight='bold', color=C_DARK)
    ax.text(7.8, 8.28, 'Quy trình kiểm tra bộ đệm băm MD5, sinh giọng đọc bản xứ Neural2 và truyền phát phân đoạn HTTP 206 Partial Content',
            ha='center', va='center', fontsize=7.8, color=C_MUTED)

    # Bước 1: Khách chọn hiện vật và ngôn ngữ
    draw_horizontal_icon_card(ax, 3.6, 6.7, 5.4, 1.8,
                              icon_name='icon_phone.png',
                              title='1. KHÁCH CHỌN CỔ VẬT & NGÔN NGỮ',
                              lines=['• Mở Modal 3D, chọn ngôn ngữ thuyết minh',
                                     '• Hỗ trợ danh mục: VN, EN, FR, JP, CN, KR, DE',
                                     '• Gửi yêu cầu nạp audio đến máy chủ'],
                              icon_target_px=40)

    # Bước 2: Kiểm tra Bộ đệm băm MD5 (Hash Storage)
    draw_horizontal_icon_card(ax, 11.5, 6.7, 5.4, 1.8,
                              icon_name='icon_database.png',
                              title='2. BỘ ĐỆM BĂM HASH STORAGE (MD5)',
                              lines=['• Tạo khóa băm: Key = MD5(text + lang + voice_id)',
                                     '• Kiểm tra tệp đệm tĩnh: /audio_cache/{Key}.mp3',
                                     '• Nếu Cache Hit: Phát tức thời (< 5ms)'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 6.3, 6.7, 8.8, 6.7, label='Kiểm tra bộ đệm')

    # Bước 3: Gọi Google Cloud Text-to-Speech (Neural2)
    draw_horizontal_icon_card(ax, 11.5, 4.3, 5.4, 1.8,
                              icon_name='icon_ai_chip.png',
                              title='3. GOOGLE CLOUD TTS (NEURAL2 AI)',
                              lines=['• Nếu Cache Miss: Gọi API Google Cloud TTS',
                                     '• Mô hình giọng chuẩn sử học (vi-VN-Standard, en-US-Neural2)',
                                     '• Tốc độ đọc chuẩn 1.0x, lưu kết quả vào Cache'],
                              icon_target_px=40)

    draw_pill_arrow(ax, 11.5, 5.8, 11.5, 5.2, label='Cache Miss (Sinh mới)', label_side='right')

    # Bước 4: Máy chủ Nginx Streaming HTTP 206
    draw_horizontal_icon_card(ax, 3.6, 4.3, 5.4, 1.8,
                              icon_name='icon_server.png',
                              title='4. TRUYỀN PHÁT HTTP 206 (NGINX)',
                              lines=['• Nginx hỗ trợ HTTP 206 Partial Content',
                                     '• Phát âm thanh ngay lập tức sau < 50ms',
                                     '• Tiết kiệm 80% băng thông mạng cho du khách'],
                              icon_target_px=42)

    draw_pill_arrow(ax, 8.8, 4.3, 6.3, 4.3, label='Lưu Cache & Stream', label_side='bottom')

    # Bước 5: Trình phát Audio nổi trên Web Client
    draw_horizontal_icon_card(ax, 7.6, 1.8, 6.6, 1.8,
                              icon_name='icon_laptop.png',
                              title='5. TRÌNH PHÁT AUDIO NỔI (WEB CLIENT)',
                              lines=['• Thanh điều khiển Audio Player thu gọn góc màn hình',
                                     '• Nghe thuyết minh đồng bộ với xoay ngắm mô hình 3D',
                                     '• Không làm thay đổi ngôn ngữ giao diện chung của website'],
                              icon_target_px=42)

    draw_pill_arrow(ax, 3.6, 3.4, 5.0, 2.7, label='Phát âm thanh', label_side='left')

    out1 = os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png")
    out2 = os.path.join(ASSETS_DIR, "flow_03_languages_voice_ai.png")
    fig.savefig(out1, bbox_inches='tight')
    fig.savefig(out2, bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_11_voice_tts_storage_pipeline.png & flow_03_languages_voice_ai.png")


if __name__ == '__main__':
    create_fig_4_1_stitching()
    create_fig_4_4_dijkstra()
    create_fig_4_5_artifact_2engines()
    create_fig_4_9_languages_voice_ai()
    create_fig_3_6_ticketing_lifecycle()
    create_fig_2_14_grafana_monitoring()
    print("=== HOAN TAT TAO TOAN BO 6 SO DO HOC THUAT VOI ICON CO DINH KHONG DE CHU! ===")
