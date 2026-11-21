# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỌC THUẬT UML (CHUẨN BÁO CÁO ĐẠI HỌC IUH)
Đề tài: Hệ thống tham quan thực tế ảo 360° & Số hóa di sản Bảo tàng Lịch sử TP. Hồ Chí Minh

Tiêu chuẩn thiết kế hoàn hảo:
1. ĐỒNG BỘ ĐƠN SẮC HỌC THUẬT (ACADEMIC MONOCHROME):
   - Loại bỏ hoàn toàn các khung màu mè xanh chuối, đỏ rực, vàng chói, cam neon.
   - Nền thẻ trắng tinh khiết (#FFFFFF), thanh tiêu đề xám sáng trang nhã (#F8FAFC).
   - Đường viền than chì mảnh sắc sảo (#334155, lw=1.1).
   - Font chữ: Arial chuẩn học thuật, độ tương phản cao, không bao giờ đè chữ.

2. BỐ CỤC THOÁNG ĐÃNG, RỘNG RÃI (EXTRA-WIDE CANVAS):
   - Kích thước canvas mở rộng lên 15.0 - 15.2 inches.
   - Khoảng cách an toàn giữa các khối từ 0.7 đến 1.5 đơn vị.
   - Tuyệt đối không dùng huy hiệu tròn số màu đen (❶, ❷, ❸) đè lên mũi tên hay viền khối.
   - Tất cả nhãn trên mũi tên đều có hộp đệm nền trắng che sạch đường kẻ ngầm.

3. HÌNH DẠNG HỌC THUẬT PHONG PHÚ:
   - Khối tiến trình: Thẻ bo góc mềm mại (FancyBboxPatch).
   - Khối rẽ nhánh điều kiện: Hình thoi (Diamond).
   - Khối cơ sở dữ liệu: Hình trụ chuẩn UML Database (Cylinder).
   - Điểm bắt đầu (Start Node ●) và Điểm kết thúc (Final Node ◉).
   - Phân làn bơi (UML Swimlanes) trực quan, mạch lạc.

4. NỘI DUNG CHÍNH XÁC 100% VỚI MÃ NGUỒN VÀ BÁO CÁO:
   - Hình 5 (4.5): Tái tạo cổ vật 3D lai ghép (TRELLIS ZeroGPU & Local CPU Marching Cubes).
   - Hình 6 (3.6): Đặt vé VietQR Napas 247, quản lý Vé của tôi và soát vé Realtime SSE.
   - Hình 7 (3.13): Quản trị mã QR trưng bày và quét tương tác Phygital.
   - Hình 8 (2.14): Kiến trúc giám sát hệ thống Grafana & Prometheus viễn trắc.
   - Hình 3.7: Soát vé QR camera trực tiếp và chống gian lận.
   - Hình 3.10: Quy trình dịch thuật và tải dữ liệu bản địa hóa.
   - Hình 3.11: Quy trình sinh, lưu trữ đệm băm (Hash Storage) và streaming Audio TTS.
   - Hình 3.12: Quy trình tổng hợp và kết xuất báo cáo Excel đa bảng tính.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

DIAGRAMS_DIR = r"d:\KhoaluanTotNghiep\baocaokhoaluan\assets\diagrams"
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Cấu hình font chữ chuẩn học thuật Arial
plt.rcParams['font.sans-serif'] = ['Arial', 'Segoe UI', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 9.0

# BẢNG MÀU HỌC THUẬT ĐƠN SẮC TƯƠNG PHẢN CAO
C_TEXT_MAIN = '#0F172A'       # Chữ chính: Đen than chì sắc nét
C_TEXT_MUTED = '#475569'      # Chữ phụ: Xám thép học thuật
C_BORDER = '#334155'          # Viền khung chính: Than chì mảnh
C_BORDER_LIGHT = '#CBD5E1'    # Viền phân cách nhẹ
C_ARROW = '#334155'           # Mũi tên liên kết
C_BG_CARD = '#FFFFFF'         # Nền thẻ trắng sạch sẽ
C_BG_HEADER = '#F8FAFC'       # Nền thanh tiêu đề thẻ nhẹ nhàng

def draw_uml_box(ax, x, y, w, h, title, lines=None, header_bg=C_BG_HEADER, border=C_BORDER, lw=1.1):
    """Vẽ khối thao tác chuẩn UML bo góc nhẹ với tiêu đề và mô tả rõ ràng, không đè chữ."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor=C_BG_CARD, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    
    hdr_h = min(0.34, h * 0.32)
    hdr = patches.FancyBboxPatch((x - w/2, y + h/2 - hdr_h), w, hdr_h,
                                 boxstyle='round,pad=0.01,rounding_size=0.06',
                                 facecolor=header_bg, edgecolor='none', zorder=5)
    ax.add_patch(hdr)
    ax.plot([x - w/2, x + w/2], [y + h/2 - hdr_h, y + h/2 - hdr_h], color=border, lw=lw*0.7, zorder=6)
    
    ax.text(x, y + h/2 - hdr_h/2, title, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=C_TEXT_MAIN, zorder=7)
    
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(x, y - hdr_h*0.35, content, ha='center', va='center',
                fontsize=7.1, color=C_TEXT_MUTED, linespacing=1.28, zorder=7)

def draw_uml_diamond(ax, x, y, w, h, text, border=C_BORDER, lw=1.1):
    """Vẽ hình thoi rẽ nhánh điều kiện chuẩn UML."""
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = patches.Polygon(pts, facecolor='#FFFFFF', edgecolor=border, lw=lw, zorder=5)
    ax.add_patch(poly)
    ax.text(x, y, text, ha='center', va='center', fontsize=7.1, fontweight='bold', color=C_TEXT_MAIN, linespacing=1.25, zorder=7)

def draw_uml_cylinder(ax, x, y, w, h, title, lines=None, border=C_BORDER, lw=1.1):
    """Vẽ khối cơ sở dữ liệu hình trụ chuẩn UML Database."""
    ellipse_h = min(0.28, h * 0.25)
    # Thân hình trụ
    rect = patches.Rectangle((x - w/2, y - h/2 + ellipse_h/2), w, h - ellipse_h,
                             facecolor=C_BG_CARD, edgecolor='none', zorder=4)
    ax.add_patch(rect)
    ax.plot([x - w/2, x - w/2], [y - h/2 + ellipse_h/2, y + h/2 - ellipse_h/2], color=border, lw=lw, zorder=5)
    ax.plot([x + w/2, x + w/2], [y - h/2 + ellipse_h/2, y + h/2 - ellipse_h/2], color=border, lw=lw, zorder=5)
    
    # Elip đáy
    bottom_ellipse = patches.Arc((x, y - h/2 + ellipse_h/2), w, ellipse_h, angle=0, theta1=180, theta2=360,
                                 color=border, lw=lw, zorder=5)
    ax.add_patch(bottom_ellipse)
    
    # Elip đỉnh
    top_ellipse = patches.Ellipse((x, y + h/2 - ellipse_h/2), w, ellipse_h,
                                  facecolor='#F1F5F9', edgecolor=border, lw=lw, zorder=6)
    ax.add_patch(top_ellipse)
    
    # Text
    ax.text(x, y + 0.05, title, ha='center', va='center', fontsize=8.0, fontweight='bold', color=C_TEXT_MAIN, zorder=7)
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(x, y - 0.28, content, ha='center', va='center', fontsize=6.8, color=C_TEXT_MUTED, linespacing=1.22, zorder=7)

def draw_uml_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top', color=C_ARROW, linestyle='-', lw=1.1):
    """Vẽ mũi tên chuyển tiếp UML với khoảng cách an toàn, text nằm thoáng không bao giờ đè lên mũi tên."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw, shrinkA=5, shrinkB=5,
                                mutation_scale=11, connectionstyle=conn, linestyle=linestyle), zorder=5)
    
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.20
        if label_side == 'top':
            ly = my + offset + (0.1 if rad > 0 else 0)
            lx = mx
            va = 'bottom'
            ha = 'center'
        elif label_side == 'bottom':
            ly = my - offset - (0.1 if rad < 0 else 0)
            lx = mx
            va = 'top'
            ha = 'center'
        elif label_side == 'right':
            lx = mx + offset
            ly = my
            va = 'center'
            ha = 'left'
        else:
            lx = mx - offset
            ly = my
            va = 'center'
            ha = 'right'

        full_text = label
        if sub:
            full_text = f"{label}\n({sub})" if label else sub

        # Hộp đệm nền trắng che sạch đường mũi tên đi ngầm phía dưới
        ax.text(lx, ly, full_text, ha=ha, va=va, fontsize=6.8, fontweight='bold' if label else 'normal',
                color=C_TEXT_MAIN,
                bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6, alpha=0.98),
                zorder=8)

def draw_actor_clean(ax, x, y, label, sub='', scale=1.0):
    """Vẽ biểu tượng tác nhân Actor gọn gàng, học thuật."""
    head_r = 0.14 * scale
    head = patches.Circle((x, y + 0.30 * scale), head_r, facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.1, zorder=6)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.05 * scale), 0.34 * scale, 0.25 * scale,
                           facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.1, zorder=6)
    ax.add_patch(body)
    ax.text(x, y - 0.20 * scale, label, ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_TEXT_MAIN, zorder=7)
    if sub:
        ax.text(x, y - 0.38 * scale, sub, ha='center', va='top', fontsize=6.6, color=C_TEXT_MUTED, zorder=7)


# =============================================================================
# 1. HÌNH 5 (HÌNH 4.5): SƠ ĐỒ KHỐI TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (DUAL-ENGINE)
# =============================================================================
def gen_fig_4_5():
    """Hinh 4.5 / Hinh 5: So do khoi tai tao co vat 3D da dong co TRELLIS & Local CPU"""
    fig, ax = plt.subplots(figsize=(15.0, 7.0), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.5, 6.65, 'SƠ ĐỒ KHỐI QUY TRÌNH TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (DUAL-ENGINE ARCHITECTURE)',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 6.35, 'Kiến trúc lai ghép kết hợp Đám mây AI TRELLIS (HuggingFace ZeroGPU) và Máy chủ nội bộ Local CPU (Marching Cubes)',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    # Khung bao tổng thể nhẹ nhàng
    outer = patches.FancyBboxPatch((0.2, 0.25), 14.6, 5.85, boxstyle='round,pad=0.02,rounding_size=0.08',
                                   facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(outer)

    # 1. Actor Quản trị viên
    draw_actor_clean(ax, 1.0, 3.4, 'Quản trị viên', 'Nạp dữ liệu tư liệu', scale=0.9)

    # 2. Khối nguồn ảnh đầu vào
    draw_uml_box(ax, 3.2, 3.4, 2.3, 2.6, 'Nguồn ảnh tư liệu',
                 ['• 1 ảnh đơn (Single-view)',
                  '• 2 góc ảnh (Trước + Lưng)',
                  '• Đa góc độ (Trái, Phải,',
                  '  Trên, Chi tiết hoa văn)'])

    # 3. Khối hàng đợi điều phối artifact3dQueue
    draw_uml_box(ax, 6.2, 3.4, 2.2, 2.0, 'artifact3dQueue',
                 ['• Quản lý tiến trình nền',
                  '• Giám sát tài nguyên GPU/CPU',
                  '• Phân luồng động cơ tự động'])

    # 4. Hình thoi kiểm tra tài nguyên
    draw_uml_diamond(ax, 8.8, 3.4, 1.8, 1.6, 'Tài nguyên GPU\nZeroGPU sẵn sàng\nvà kết nối tốt?')

    # 5. Nhánh trên: Đám mây AI TRELLIS (Ưu tiên)
    draw_uml_box(ax, 11.9, 5.0, 2.7, 2.1, 'Đám mây AI: TRELLIS',
                 ['• HuggingFace ZeroGPU A100 [30]',
                  '• Biến tiềm ẩn SLAT [29]',
                  '• Rectified Flow Transformers',
                  '• Trích xuất lưới đa giác vi phân'])

    draw_uml_box(ax, 14.1, 5.0, 1.6, 2.1, 'Mô hình AI PBR',
                 ['• File chuẩn .GLB',
                  '• 25.600 Polygons',
                  '• Chi tiết 360° sắc nét',
                  '• Texture Albedo/Normal'])

    # 6. Nhánh dưới: Máy chủ nội bộ Local CPU (Dự phòng)
    draw_uml_box(ax, 11.9, 1.8, 2.7, 2.1, 'Máy chủ nội bộ: Local CPU',
                 ['• Module Python v15.0 độc lập',
                  '• Phân đoạn Rembg & Otsu',
                  '• Giả định đối xứng trục Radial',
                  '• Marching Cubes & Normal Map'])

    draw_uml_box(ax, 14.1, 1.8, 1.6, 2.1, 'Mô hình Fallback',
                 ['• File chuẩn .GLB',
                  '• 95.000 Polygons',
                  '• Tròn xoay đối xứng',
                  '• Đảm bảo tính liên tục'])

    # Mũi tên kết nối với khoảng cách thoáng đãng, text nằm trên
    draw_uml_arrow(ax, 1.45, 3.4, 2.05, 3.4, label='1. Tải ảnh', label_side='top')
    draw_uml_arrow(ax, 4.35, 3.4, 5.1, 3.4, label='2. Đẩy Queue', label_side='top')
    draw_uml_arrow(ax, 7.3, 3.4, 7.9, 3.4)

    # Rẽ nhánh trên (Còn Quota)
    draw_uml_arrow(ax, 9.7, 3.9, 10.55, 4.8, label='3a. [Còn Quota]', sub='Ưu tiên gọi API AI', label_side='top')
    draw_uml_arrow(ax, 13.25, 5.0, 13.3, 5.0, label='Xuất file .GLB', label_side='top')

    # Rẽ nhánh dưới (Hết Quota / Tùy chọn)
    draw_uml_arrow(ax, 9.7, 2.9, 10.55, 2.0, label='3b. [Hết Quota / Tùy chọn]', sub='Xử lý nội bộ', label_side='bottom')
    draw_uml_arrow(ax, 13.25, 1.8, 13.3, 1.8, label='Xuất file .GLB', label_side='top')

    # Mũi tên Fallback đứt nét sạch sẽ
    ax.annotate('', xy=(11.9, 2.85), xytext=(11.9, 3.95),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.2, linestyle='--',
                                mutation_scale=12, shrinkA=4, shrinkB=4), zorder=5)
    ax.text(11.9, 3.4, 'Tự động Fallback khi Quota 429 hoặc Timeout > 300s',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_5_artifact_2engines.png")


# =============================================================================
# 2. HÌNH 6 (HÌNH 3.6): SƠ ĐỒ HOẠT ĐỘNG ĐẶT VÉ & SOÁT VÉ VÀO CỔNG (UML SWIMLANES)
# =============================================================================
def gen_fig_3_6():
    """Hinh 3.6 / Hinh 6: UML Swimlane Activity Diagram Dat ve, VietQR PayOS va Soat ve tai cong"""
    fig, ax = plt.subplots(figsize=(15.2, 8.2), dpi=300)
    ax.set_xlim(0, 15.2); ax.set_ylim(0, 8.2); ax.axis('off')

    ax.text(7.6, 7.90, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH ĐẶT VÉ TRỰC TUYẾN, THANH TOÁN VIETQR VÀ SOÁT VÉ VÀO CỔNG',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.6, 7.60, 'Chu trình nghiệp vụ khép kín: Đặt vé Web -> Thanh toán VietQR Napas 247 -> Quản lý Vé của tôi -> Soát vé tại cổng Realtime SSE',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    # Khung bao quanh toàn bộ
    border_all = patches.Rectangle((0.3, 0.35), 14.6, 7.05, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border_all)

    # 3 Làn bơi UML (Swimlanes) kẻ vạch đứt mảnh trang nhã
    ax.plot([0.3, 14.9], [5.35, 5.35], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    ax.plot([0.3, 14.9], [2.85, 2.85], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    # Tiêu đề làn bên trái
    ax.text(0.45, 7.15, 'LÀN 1: KHÁCH THAM QUAN (GIAO DIỆN /booking, /profile & MOBILE BANKING)',
            fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN, zorder=3)
    ax.text(0.45, 5.10, 'LÀN 2: MÁY CHỦ HỆ THỐNG & CỔNG THANH TOÁN (NODE.JS, PAYOS & POSTGRESQL)',
            fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN, zorder=3)
    ax.text(0.45, 2.60, 'LÀN 3: NHÂN VIÊN SOÁT VÉ & CỔNG BẢO TÀNG (THIẾT BỊ QUÉT CAMERA & BARIE)',
            fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN, zorder=3)

    # --- LÀN 1: ĐẶT VÉ ---
    # Nút bắt đầu (Initial Node ●)
    ax.plot(0.8, 6.2, 'o', color='#0F172A', markersize=10, zorder=6)

    draw_uml_box(ax, 2.2, 6.2, 1.8, 1.0, '1. Chọn lịch tham quan', ['Ngày tham quan &', 'Khung giờ (Sáng/Chiều)'])
    draw_uml_box(ax, 4.4, 6.2, 1.8, 1.0, '2. Chọn 3 hạng vé', ['Người lớn: 30.000đ', 'HSSV & Trẻ em: 15.000đ'])
    draw_uml_box(ax, 6.6, 6.2, 1.8, 1.0, '3. Điền thông tin', ['Tự điền từ tài khoản', 'Lưu draft tạm 15 phút'])

    # Chuyển xuống Làn 2: Tạo đơn PayOS
    draw_uml_box(ax, 6.6, 4.1, 1.9, 1.0, '4. POST /api/tickets', ['Khởi tạo đơn hàng &', 'Gọi API cổng PayOS'])
    draw_uml_box(ax, 8.8, 4.1, 1.9, 1.0, '5. Sinh mã VietQR', ['Chuẩn Napas 247', 'Đếm ngược 15 phút'])

    # Trả về Làn 1: Khách quét mã ngân hàng
    draw_uml_box(ax, 8.8, 6.2, 1.9, 1.0, '6. Khách quét VietQR', ['Mở App Ngân hàng', 'Chuyển khoản thanh toán'])

    # Chuyển sang Làn 2: Webhook đối soát & Cấp vé
    draw_uml_box(ax, 11.1, 4.1, 2.0, 1.0, '7. Webhook PayOS', ['Xác thực HMAC-SHA256', 'Cập nhật status = PAID'])
    draw_uml_box(ax, 13.4, 4.1, 1.9, 1.0, '8. Cấp phát vé CSDL', ['Mã hóa AES-256 (TKT-xxxx)', 'Gửi vé qua Email khách'])

    # Trả về Làn 1: Hiển thị trong Hồ sơ cá nhân
    draw_uml_box(ax, 13.4, 6.2, 1.9, 1.0, '9. Tab "Vé của tôi"', ['Trang /profile', 'Hiện mã QR & Hiệu lực'])

    # Chuyển xuống Làn 3: Ngày tham quan tại cổng bảo tàng
    draw_uml_box(ax, 4.2, 1.55, 2.0, 1.0, '10. Quét QR tại cổng', ['Nhân viên dùng Camera', 'Module HTML5-QRCode'])
    draw_uml_box(ax, 6.8, 1.55, 2.0, 1.0, '11. Xác thực vé API', ['POST /validate-qr', 'Giải mã AES & check status'])

    draw_uml_diamond(ax, 9.3, 1.55, 1.6, 1.2, 'Vé hợp lệ &\nChưa sử dụng?')

    draw_uml_box(ax, 11.7, 1.55, 1.9, 1.0, '12. Mở Barie vào cổng', ['UPDATE status = USED', 'Âm báo Bíp + Tích xanh'])
    draw_uml_box(ax, 13.8, 1.55, 1.7, 1.0, '13. Realtime SSE', ['Bắn SSE sang máy khách', 'Rung điện thoại (<1ms)'])

    # Nút kết thúc (Final Node ◉)
    ax.plot(14.8, 1.55, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(14.8, 1.55, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(14.8, 1.55, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_box(ax, 9.3, 0.65, 2.2, 0.45, 'Từ chối: Cảnh báo vé giả / Đã dùng', '')

    # --- MŨI TÊN KẾT NỐI TUẦN TỰ 1 CHIỀU RÕ RÀNG ---
    draw_uml_arrow(ax, 0.9, 6.2, 1.3, 6.2)
    draw_uml_arrow(ax, 3.1, 6.2, 3.5, 6.2)
    draw_uml_arrow(ax, 5.3, 6.2, 5.7, 6.2)

    # Làn 1 -> Làn 2: Bấm Đặt vé
    draw_uml_arrow(ax, 6.6, 5.7, 6.6, 4.6, label='Bấm Đặt vé', label_side='right')
    draw_uml_arrow(ax, 7.55, 4.1, 7.85, 4.1)

    # Làn 2 -> Làn 1: Hiển thị VietQR
    draw_uml_arrow(ax, 8.8, 4.6, 8.8, 5.7, label='Hiển thị VietQR', label_side='right')

    # Làn 1 -> Làn 2: Thanh toán thành công
    draw_uml_arrow(ax, 9.75, 6.2, 10.4, 4.6, rad=-0.15, label='Báo có tức thì', label_side='top')
    draw_uml_arrow(ax, 12.1, 4.1, 12.45, 4.1)

    # Làn 2 -> Làn 1: Điều hướng /profile
    draw_uml_arrow(ax, 13.4, 4.6, 13.4, 5.7, label='Điều hướng /profile', label_side='right')

    # Làn 1 -> Làn 3: Ngày tham quan xuất trình vé
    ax.annotate('', xy=(3.2, 1.55), xytext=(13.4, 5.7),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.1, linestyle=':',
                                connectionstyle='arc3,rad=-0.12', mutation_scale=11), zorder=5)
    ax.text(8.0, 2.7, 'Ngày tham quan: Khách xuất trình mã QR vé tại cửa soát vé bảo tàng',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    draw_uml_arrow(ax, 5.2, 1.55, 5.8, 1.55)
    draw_uml_arrow(ax, 7.8, 1.55, 8.5, 1.55)

    # Nhánh Hợp lệ
    draw_uml_arrow(ax, 10.1, 1.55, 10.75, 1.55, label='[Hợp lệ]', label_side='top')
    draw_uml_arrow(ax, 12.65, 1.55, 12.95, 1.55)
    draw_uml_arrow(ax, 14.65, 1.55, 14.7, 1.55)

    # Nhánh Sai / Đã dùng
    draw_uml_arrow(ax, 9.3, 0.95, 9.3, 0.88, label='[Sai / Đã dùng]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_8_payment_ticket_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_6_activity_booking_ticket_lifecycle.png")


# =============================================================================
# 3. HÌNH 7 (HÌNH 3.13): SƠ ĐỒ HOẠT ĐỘNG QUẢN TRỊ & QUÉT QR TRƯNG BÀY (PHYGITAL)
# =============================================================================
def gen_fig_3_13():
    """Hinh 3.13 / Hinh 7: UML Activity Diagram Quan tri va quet QR trung bay Phygital"""
    fig, ax = plt.subplots(figsize=(15.0, 7.2), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.2); ax.axis('off')

    ax.text(7.5, 6.85, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=9.8, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 6.55, 'Kết nối hiện vật thực địa với không gian ảo: Tự động sinh mã QR -> Dán tại tủ kính -> Quét Camera jsQR -> Mở 3D / Tour 360°',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    # Khung bao quanh
    border = patches.Rectangle((0.3, 0.35), 14.4, 6.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    # 2 Làn bơi: Admin CMS & Visitor Scanner
    ax.plot([0.3, 14.7], [4.30, 4.30], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 6.05, 'PHÂN HỆ QUẢN TRỊ CMS (TẠO HỒ SƠ, SINH MÃ VÀ IN ẤN THỰC ĐỊA)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 4.05, 'PHÂN HỆ KHÁCH THAM QUAN THỰC ĐỊA (QUÉT QR TƯƠNG TÁC PHYGITAL)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)

    # --- TẦNG ADMIN CMS ---
    draw_actor_clean(ax, 1.2, 5.2, 'Quản trị viên', 'Tạo phòng / cổ vật', scale=0.85)
    draw_uml_box(ax, 3.6, 5.25, 2.4, 1.0, '1. Tự động sinh QR', ['Deep link ?artifact={id}', 'Chuẩn ISO/IEC 18004'])
    draw_uml_box(ax, 6.8, 5.25, 2.4, 1.0, '2. Xuất file ảnh QR', ['Độ phân giải cao 300 DPI', 'In ấn bảng chỉ dẫn'])
    draw_uml_box(ax, 10.4, 5.25, 2.8, 1.0, '3. Dán QR tại thực địa', ['Dán trước cửa 18 phòng &', 'Tủ kính 17 bảo vật quốc gia'])

    draw_uml_arrow(ax, 1.6, 5.25, 2.4, 5.25, label='Lưu hồ sơ', label_side='top')
    draw_uml_arrow(ax, 4.8, 5.25, 5.6, 5.25, label='Xuất vector', label_side='top')
    draw_uml_arrow(ax, 8.0, 5.25, 9.0, 5.25, label='In & Dán tem', label_side='top')

    # --- TẦNG KHÁCH THAM QUAN ---
    draw_actor_clean(ax, 1.2, 2.3, 'Khách tham quan', 'Tại bảo tàng thực địa', scale=0.85)
    draw_uml_box(ax, 3.6, 2.4, 2.4, 1.1, '4. Mở Quét QR', ['QRScannerModal trên Navbar', 'Âm báo Audio Beep 880Hz'])
    draw_uml_box(ax, 6.8, 2.4, 2.4, 1.1, '5. Giải mã jsQR', ['Đa tỷ lệ 1000/600px', 'Khử bóng lóa mặt kính'])

    draw_uml_diamond(ax, 9.5, 2.4, 1.6, 1.3, 'Phân loại\nmã QR?')

    draw_uml_box(ax, 12.8, 3.3, 2.8, 1.0, 'Chiêm ngưỡng Cổ vật 3D', ['Mở Modal 3D xoay 360° .GLB', 'Phát Audio thuyết minh AI'])
    draw_uml_box(ax, 12.8, 2.0, 2.8, 1.0, 'Vào Gian phòng Tour 360°', ['Chuyển cảnh không gian 360°', 'Định vị phòng trên Mini-map'])
    draw_uml_box(ax, 9.5, 0.85, 2.6, 0.55, 'Mã vé (TKT-): Hướng dẫn ra cổng', '')

    draw_uml_arrow(ax, 1.6, 2.4, 2.4, 2.4, label='Mở Scanner', label_side='top')
    draw_uml_arrow(ax, 4.8, 2.4, 5.6, 2.4, label='Quét tem', label_side='top')
    draw_uml_arrow(ax, 8.0, 2.4, 8.7, 2.4, label='Tách Payload', label_side='top')

    # Tem dán thực tế kết nối xuống Camera máy khách
    ax.annotate('', xy=(3.6, 2.95), xytext=(10.4, 4.75),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.1, linestyle=':',
                                connectionstyle='arc3,rad=-0.15', mutation_scale=11), zorder=5)
    ax.text(7.2, 3.75, 'Khách hướng Camera vào tem QR dán trên tủ kính thực tế',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.22', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    draw_uml_arrow(ax, 10.3, 2.8, 11.4, 3.3, label='[Cổ vật]', label_side='top')
    draw_uml_arrow(ax, 10.3, 2.0, 11.4, 2.0, label='[Phòng]', label_side='top')
    draw_uml_arrow(ax, 9.5, 1.75, 9.5, 1.15, label='[Mã vé]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_13_qr_exhibition_activity.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_13_qr_exhibition_activity.png")


# =============================================================================
# 4. HÌNH 8 (HÌNH 2.14): KIẾN TRÚC GIÁM SÁT HỆ THỐNG GRAFANA & PROMETHEUS
# =============================================================================
def gen_fig_2_14():
    """Hinh 2.14 / Hinh 8: Kien truc thu thap va hien thi du lieu giam sat Grafana & Prometheus"""
    fig, ax = plt.subplots(figsize=(15.0, 7.0), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 7.0); ax.axis('off')

    ax.text(7.5, 6.65, 'KIẾN TRÚC GIÁM SÁT HỆ THỐNG VÀ PHÂN TÍCH QUAN SÁT (OBSERVABILITY ARCHITECTURE)',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 6.35, 'Thu thập Metrics phần cứng VPS, Container Docker, APM API và CSDL PostgreSQL Read-Only',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    # Khung bao ngoài
    outer = patches.FancyBboxPatch((0.2, 0.25), 14.6, 5.85, boxstyle='round,pad=0.02,rounding_size=0.08',
                                   facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(outer)

    # TẦNG 1: Nguồn dữ liệu viễn trắc (Bên trái, x = 1.9)
    draw_uml_box(ax, 1.9, 4.9, 2.6, 1.2, 'Hạ tầng VPS & Host OS',
                 ['Ubuntu Linux 24.04 LTS', 'CPU, RAM, Disk I/O, Network'])

    draw_uml_box(ax, 1.9, 3.3, 2.6, 1.2, 'Docker Containers',
                 ['cAdvisor & Engine Metrics', 'Nginx, Node, Python, Redis'])

    # CSDL dạng hình trụ chuẩn UML Database
    draw_uml_cylinder(ax, 1.9, 1.5, 2.6, 1.3, 'PostgreSQL Database',
                      ['Số liệu vé, doanh thu, phòng 360°', 'User pg_readonly an toàn'])

    # TẦNG 2: Máy chủ thu thập Prometheus Server (x = 5.7)
    draw_uml_box(ax, 5.7, 4.1, 2.6, 2.8, 'Prometheus Server',
                 ['• Time-Series Database (TSDB)',
                  '• Scraping Engine (Pull Metrics)',
                  '• Chu kỳ cào dữ liệu: 15s',
                  '• Lưu trữ metrics viễn trắc'])

    # TẦNG 3: Động cơ trực quan hóa Grafana Engine v11 (x = 9.5)
    draw_uml_box(ax, 9.5, 4.1, 2.7, 2.8, 'Grafana Engine v11.x',
                 ['• Provisioned Dashboards:',
                  '  - Di sản & Doanh thu Vé',
                  '  - Hạ tầng VPS & Container',
                  '  - Hiệu năng APM & Latency',
                  '• Secure Iframe Embedding'])

    # Bộ điều hợp PostgreSQL Adapter phía dưới Grafana (x = 9.5, y = 1.5)
    draw_uml_box(ax, 9.5, 1.5, 2.7, 1.3, 'PostgreSQL Adapter',
                 ['Direct SQL Query Driver', 'Đọc dữ liệu kinh doanh vé'])

    # TẦNG 4: Quản trị viên & Giao diện Web (/admin) (x = 13.3)
    draw_actor_clean(ax, 13.3, 5.1, 'Quản trị viên', 'Theo dõi Dashboard', scale=0.9)

    draw_uml_box(ax, 13.3, 2.8, 2.3, 1.6, 'Trang Quản trị Admin',
                 ['Giao diện Web /admin',
                  'Nhúng Iframe bảo mật',
                  'Chế độ Kiosk Mode'])

    # --- MŨI TÊN KẾT NỐI RÕ RÀNG, KHÔNG ĐÈ LẪN NHAU ---
    # Tầng 1 -> Prometheus (Pull metrics)
    draw_uml_arrow(ax, 3.2, 4.9, 4.4, 4.6, label='Pull Metrics', sub='Node Exporter', label_side='top')
    draw_uml_arrow(ax, 3.2, 3.3, 4.4, 3.7, label='cAdvisor', label_side='bottom')

    # Tầng 1 -> PostgreSQL Adapter (SQL Query)
    draw_uml_arrow(ax, 3.2, 1.5, 8.15, 1.5, label='SQL Query', sub='Bảo mật Read-Only', label_side='top')

    # Prometheus -> Grafana (TSDB Query)
    draw_uml_arrow(ax, 7.0, 4.1, 8.15, 4.1, label='TSDB Query', sub='PromQL', label_side='top')

    # PostgreSQL Adapter -> Grafana
    draw_uml_arrow(ax, 9.5, 2.15, 9.5, 2.7, label='Direct Query', label_side='right')

    # Grafana -> Admin UI (Render panels)
    draw_uml_arrow(ax, 10.85, 3.3, 12.15, 3.0, label='Render Panels', sub='Iframe Token', label_side='bottom')

    # Quản trị viên -> Admin UI (Theo dõi trực quan)
    draw_uml_arrow(ax, 13.3, 4.4, 13.3, 3.6, label='Truy cập', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_14_grafana_architecture.png")


# =============================================================================
# 5. HÌNH 3.7: SƠ ĐỒ HOẠT ĐỘNG SOÁT VÉ QR CAMERA VÀ CHỐNG GIAN LẬN
# =============================================================================
def gen_fig_3_7():
    """Hinh 3.7: UML Activity Diagram Soat ve QR Camera truc tiep va chong gian lan"""
    fig, ax = plt.subplots(figsize=(15.0, 6.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.5, 6.15, 'SƠ ĐỒ HOẠT ĐỘNG: SOÁT VÉ ĐIỆN TỬ VÀ KIỂM SOÁT VÀO CỔNG THỜI GIAN THỰC',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 5.85, 'Giải mã khung hình HTML5-QRCode, đối soát chữ ký số SHA-256, chuyển trạng thái USED và chống gian lận vé',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.35), 14.4, 5.2, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 14.7], [3.05, 3.05], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 5.25, 'LÀN 1: NHÂN VIÊN SOÁT VÉ TẠI CỔNG (CAMERA SCANNER & GIAO DIỆN KIỂM SOÁT)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.75, 'LÀN 2: MÁY CHỦ HỆ THỐNG BACKEND & CSDL POSTGRESQL (XÁC THỰC VÀ GHI LOG)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)

    ax.plot(0.9, 4.15, 'o', color='#0F172A', markersize=10, zorder=6)

    draw_uml_box(ax, 2.5, 4.15, 2.2, 1.1, '1. Mở Camera Scanner', ['HTML5-QRCode', 'Khung ngắm quét mã vé'])
    draw_uml_box(ax, 5.3, 4.15, 2.2, 1.1, '2. Quét mã QR vé', ['Giải mã payload AES-256', 'Trích xuất TKT-xxxxxx'])

    draw_uml_box(ax, 5.3, 1.6, 2.2, 1.1, '3. API Đối soát', ['POST /validate-qr', 'Kiểm tra chữ ký số'])
    draw_uml_box(ax, 8.2, 1.6, 2.2, 1.1, '4. Kiểm tra CSDL', ['Kiểm tra ngày, giờ', 'status == PAID ?'])

    draw_uml_diamond(ax, 11.0, 1.6, 1.8, 1.3, 'Hợp lệ &\nChưa sử dụng?')

    draw_uml_box(ax, 13.6, 1.6, 2.0, 1.1, '5. Ghi nhận USED', ['UPDATE status = USED', 'Ghi log checked_in_at'])
    draw_uml_box(ax, 13.6, 4.15, 2.0, 1.1, '6. Mở Barie đón khách', ['Tích xanh + Âm báo Bíp', 'Bắn SSE sang khách'])

    draw_uml_box(ax, 11.0, 4.15, 2.2, 1.1, 'Cảnh báo Gian lận', ['Vé giả / Đã dùng / Hết hạn', 'Âm báo lỗi đỏ từ chối'])

    draw_uml_arrow(ax, 1.0, 4.15, 1.4, 4.15)
    draw_uml_arrow(ax, 3.6, 4.15, 4.2, 4.15)
    draw_uml_arrow(ax, 5.3, 3.6, 5.3, 2.15, label='Gọi API', label_side='right')
    draw_uml_arrow(ax, 6.4, 1.6, 7.1, 1.6)
    draw_uml_arrow(ax, 9.3, 1.6, 10.1, 1.6)

    # Nhánh Đúng
    draw_uml_arrow(ax, 11.9, 1.6, 12.6, 1.6, label='[Đúng]', label_side='top')
    draw_uml_arrow(ax, 13.6, 2.15, 13.6, 3.6, label='Mở cổng', label_side='right')

    # Nhánh Sai
    draw_uml_arrow(ax, 11.0, 2.25, 11.0, 3.6, label='[Sai / Đã dùng]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_activity_ticket_validation.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_sequence_qr_scan.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_7_activity_ticket_validation.png")


# =============================================================================
# 6. HÌNH 3.10: SƠ ĐỒ HOẠT ĐỘNG DỊCH THUẬT VÀ BẢN ĐỊA HÓA CỤC BỘ
# =============================================================================
def gen_fig_3_10():
    """Hinh 3.10: UML Activity Diagram Dich thuat da ngon ngu va cache cuc bo"""
    fig, ax = plt.subplots(figsize=(15.0, 6.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.5, 6.15, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 5.85, 'Cơ chế đa ngôn ngữ 5 thứ tiếng (VI, EN, FR, ZH, JA) kết hợp bộ nhớ đệm Cache Client và API Gemini 2.5 Flash',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.35), 14.4, 5.2, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 14.7], [3.05, 3.05], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 5.25, 'TẦNG GIAO DIỆN CLIENT (REACT APPLICATION & LOCAL CACHE)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.75, 'TẦNG DỊCH VỤ MÁY CHỦ & AI DỊCH THUẬT (NODE.JS & GEMINI API)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)

    ax.plot(0.9, 4.15, 'o', color='#0F172A', markersize=10, zorder=6)

    draw_uml_box(ax, 2.5, 4.15, 2.2, 1.1, '1. Chọn ngôn ngữ', ['Người dùng bấm chọn', 'VI / EN / FR / ZH / JA'])
    draw_uml_diamond(ax, 5.4, 4.15, 1.8, 1.3, 'Bản dịch đã có\ntrong Cache?')

    draw_uml_box(ax, 8.4, 4.15, 2.2, 1.1, '2. Nạp từ Cache', ['Hiển thị giao diện tức thì', 'Độ trễ < 5ms'])
    draw_uml_box(ax, 5.4, 1.6, 2.2, 1.1, '3. Gọi API Dịch thuật', ['POST /api/translate', 'Kiểm tra CSDL server'])
    draw_uml_box(ax, 8.4, 1.6, 2.2, 1.1, '4. AI Gemini 2.5 Flash', ['Dịch thuật ngữ di sản', 'Đảm bảo văn phong lịch sử'])
    draw_uml_box(ax, 11.4, 1.6, 2.2, 1.1, '5. Lưu CSDL & Trả về', ['Lưu bản dịch tái sử dụng', 'Trả JSON về Client'])
    draw_uml_box(ax, 11.4, 4.15, 2.2, 1.1, '6. Cập nhật UI & Cache', ['Lưu LocalStorage', 'Render văn bản đa ngữ'])

    # Nút kết thúc
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(13.8, 4.15, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_arrow(ax, 1.0, 4.15, 1.4, 4.15)
    draw_uml_arrow(ax, 3.6, 4.15, 4.5, 4.15)
    draw_uml_arrow(ax, 6.3, 4.15, 7.3, 4.15, label='[Có]', label_side='top')
    draw_uml_arrow(ax, 5.4, 3.5, 5.4, 2.15, label='[Chưa có]', label_side='right')
    draw_uml_arrow(ax, 6.5, 1.6, 7.3, 1.6)
    draw_uml_arrow(ax, 9.5, 1.6, 10.3, 1.6)
    draw_uml_arrow(ax, 11.4, 2.15, 11.4, 3.6, label='Trả kết quả', label_side='right')
    draw_uml_arrow(ax, 9.5, 4.15, 10.3, 4.15)
    draw_uml_arrow(ax, 12.5, 4.15, 13.5, 4.15)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_10_translation_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_10_translation_flow.png")


# =============================================================================
# 7. HÌNH 3.11: SƠ ĐỒ HOẠT ĐỘNG SINH & STREAMING AUDIO THUYẾT MINH AI
# =============================================================================
def gen_fig_3_11():
    """Hinh 3.11: UML Activity Diagram Audio TTS Hash Cache va HTTP 206 Streaming"""
    fig, ax = plt.subplots(figsize=(15.0, 6.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.5, 6.15, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH SINH, LƯU TRỮ ĐỆM BĂM VÀ STREAMING ÂM THANH THUYẾT MINH',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 5.85, 'Tối ưu hóa chi phí với bộ đệm băm MD5 Hash Storage và cơ chế truyền phát âm thanh HTTP 206 Partial Content',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.35), 14.4, 5.2, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 14.7], [3.05, 3.05], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 5.25, 'TẦNG KHÁCH THAM QUAN (WEB AUDIO PLAYER & TRÌNH DUYỆT)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.75, 'TẦNG DỊCH VỤ BACKEND & CLOUD TTS (NODE.JS, HASH STORAGE & GOOGLE CLOUD)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)

    ax.plot(0.9, 4.15, 'o', color='#0F172A', markersize=10, zorder=6)

    draw_uml_box(ax, 2.5, 4.15, 2.2, 1.1, '1. Bấm Nghe Audio', ['Khách chọn hiện vật', 'Bấm nút phát thuyết minh'])
    draw_uml_box(ax, 5.3, 1.6, 2.2, 1.1, '2. Tính MD5 Hash Key', ['Key = MD5(text + voice)', 'Tạo khóa định danh tệp'])
    draw_uml_diamond(ax, 8.2, 1.6, 1.8, 1.3, 'Tệp âm thanh\nđã có trên đĩa?')

    draw_uml_box(ax, 11.2, 1.6, 2.4, 1.1, '3. Gọi Google TTS', ['Google Cloud TTS Neural2', 'Sinh file MP3 chất lượng cao'])
    draw_uml_box(ax, 8.2, 4.15, 2.2, 1.1, '4. HTTP 206 Streaming', ['Truyền phát từng phần', 'Độ trễ phát âm < 50ms'])
    draw_uml_box(ax, 11.2, 4.15, 2.2, 1.1, '5. Lưu Hash Storage', ['Lưu /audio_cache/{Key}.mp3', 'Tái sử dụng 0đ chi phí'])

    # Nút kết thúc
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(13.8, 4.15, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_arrow(ax, 1.0, 4.15, 1.4, 4.15)
    draw_uml_arrow(ax, 2.5, 3.6, 5.3, 2.15, label='Gửi yêu cầu', label_side='left')
    draw_uml_arrow(ax, 6.4, 1.6, 7.3, 1.6)

    draw_uml_arrow(ax, 8.2, 2.25, 8.2, 3.6, label='[Có sẵn (Cache Hit)]', label_side='right')
    draw_uml_arrow(ax, 9.1, 1.6, 10.0, 1.6, label='[Chưa có (Cache Miss)]', label_side='bottom')
    draw_uml_arrow(ax, 11.2, 2.15, 11.2, 3.6, label='Lưu đệm', label_side='right')
    draw_uml_arrow(ax, 10.1, 4.15, 9.3, 4.15)
    draw_uml_arrow(ax, 9.3, 4.15, 13.5, 4.15)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_11_voice_tts_storage_pipeline.png")


# =============================================================================
# 8. HÌNH 3.12: SƠ ĐỒ HOẠT ĐỘNG XUẤT BÁO CÁO EXCEL CLIENT-SIDE
# =============================================================================
def gen_fig_3_12():
    """Hinh 3.12: UML Activity Diagram Xuat bao cao Excel client-side voi xlsx-js-style"""
    fig, ax = plt.subplots(figsize=(15.0, 6.5), dpi=300)
    ax.set_xlim(0, 15.0); ax.set_ylim(0, 6.5); ax.axis('off')

    ax.text(7.5, 6.15, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH',
            ha='center', va='center', fontsize=10.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(7.5, 5.85, 'Xử lý hoàn toàn phía Client bằng xlsx-js-style: Tiết kiệm 100% tài nguyên CPU máy chủ, tự động dịch thuật 5 thứ tiếng',
            ha='center', va='center', fontsize=7.6, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.35), 14.4, 5.2, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 14.7], [3.05, 3.05], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 5.25, 'PHÂN HỆ QUẢN TRỊ ADMIN (TRANG BÁO CÁO & THỐNG KÊ /admin)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.75, 'ĐỘNG CƠ XỬ LÝ DỮ LIỆU PHÍA TRÌNH DUYỆT (XLSX-JS-STYLE & FILE DOWNLOAD)', fontsize=7.4, fontweight='bold', color=C_TEXT_MAIN)

    ax.plot(0.9, 4.15, 'o', color='#0F172A', markersize=10, zorder=6)

    draw_uml_box(ax, 2.5, 4.15, 2.2, 1.1, '1. Bấm "Xuất file Excel"', ['Quản trị viên chọn kỳ', 'Bấm nút xuất file'])
    draw_uml_box(ax, 5.3, 4.15, 2.2, 1.1, '2. Lấy dữ liệu State', ['KPIs, Vé tham quan', 'Phòng 360° & Cổ vật 3D'])

    draw_uml_box(ax, 5.3, 1.6, 2.2, 1.1, '3. Bản địa hóa từ khóa', ['Nhận diện ngôn ngữ Admin', 'Tự động map nhãn cột'])
    draw_uml_box(ax, 8.2, 1.6, 2.2, 1.1, '4. Tạo 4 Worksheets', ['1. Tổng quan & Chỉ số\n2. Doanh thu vé\n3. Phòng 360 | 4. Cổ vật'])
    draw_uml_box(ax, 11.2, 1.6, 2.4, 1.1, '5. Áp dụng Style nhận diện', ['Màu hoàng gia Navy/Gold', 'Tự động căn chỉnh độ rộng'])
    draw_uml_box(ax, 11.2, 4.15, 2.2, 1.1, '6. Tải về file .xlsx', ['Trình duyệt lưu tệp', 'Báo cáo hoàn chỉnh'])

    # Nút kết thúc
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(13.8, 4.15, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(13.8, 4.15, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_arrow(ax, 1.0, 4.15, 1.4, 4.15)
    draw_uml_arrow(ax, 3.6, 4.15, 4.2, 4.15)
    draw_uml_arrow(ax, 5.3, 3.6, 5.3, 2.15, label='Chuyển sang Engine', label_side='right')
    draw_uml_arrow(ax, 6.4, 1.6, 7.1, 1.6)
    draw_uml_arrow(ax, 9.3, 1.6, 10.0, 1.6)
    draw_uml_arrow(ax, 11.2, 2.15, 11.2, 3.6, label='Trigger Download', label_side='right')
    draw_uml_arrow(ax, 12.3, 4.15, 13.5, 4.15)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_12_excel_export_flow.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_12_excel_export_activity.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_12_excel_export_flow.png")


if __name__ == "__main__":
    print("=================================================================")
    print("BẮT ĐẦU VẼ VÀ CẬP NHẬT TOÀN BỘ SƠ ĐỒ HỌC THUẬT ĐƠN SẮC CHUẨN ĐẠI HỌC IUH...")
    print("=================================================================")
    gen_fig_4_5()
    gen_fig_3_6()
    gen_fig_3_13()
    gen_fig_2_14()
    gen_fig_3_7()
    gen_fig_3_10()
    gen_fig_3_11()
    gen_fig_3_12()
    print("=================================================================")
    print("HOÀN THÀNH 100% CẬP NHẬT CÁC TỆP SƠ ĐỒ PNG VÀO: assets/diagrams/")
    print("=================================================================")
