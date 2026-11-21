# -*- coding: utf-8 -*-
"""
CHUYÊN GIA THIẾT KẾ SƠ ĐỒ HỌC THUẬT UML (CHUẨN BÁO CÁO ĐẠI HỌC IUH)
Đề tài: Hệ thống tham quan thực tế ảo 360° & Số hóa di sản Bảo tàng Lịch sử TP. Hồ Chí Minh

Tiêu chuẩn thiết kế:
- Font chữ: Arial chuẩn học thuật (không dùng font AI, không lỗi dấu tiếng Việt).
- Bảng màu: Đơn sắc tương phản cao (Monochrome & Academic Slate).
- TUYỆT ĐỐI BỎ các khung màu mè xanh lá chuối, đỏ rực, vàng chói, cam neon.
- Nền trắng tinh khiết (#FFFFFF), thẻ viền mỏng than chì (#334155, lw=1.0).
- KHÔNG CÓ HUY HIỆU TRÒN ĐÈ LÊN MŨI TÊN.
- Text trên mũi tên có nền trắng đệm sạch sẽ, nằm thoáng bên trên hoặc bên cạnh đường nối.
- Toàn bộ nội dung bám sát 100% chức năng thực tế của đề tài, không bịa, không suy diễn.
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
C_TEXT_MAIN = '#0F172A'      # Chữ chính: Đen than chì sắc nét
C_TEXT_MUTED = '#475569'     # Chữ phụ: Xám thép học thuật
C_BORDER = '#334155'         # Viền khung chính: Xám đen mảnh
C_BORDER_LIGHT = '#CBD5E1'   # Viền phân cách nhẹ
C_ARROW = '#334155'          # Mũi tên liên kết
C_BG_CARD = '#FFFFFF'        # Nền thẻ trắng sạch sẽ
C_BG_HEADER = '#F8FAFC'      # Nền thanh tiêu đề thẻ nhẹ nhàng

def draw_uml_box(ax, x, y, w, h, title, lines=None, header_bg=C_BG_HEADER, border=C_BORDER, lw=1.0):
    """Vẽ khối thao tác chuẩn UML bo góc nhẹ với tiêu đề và mô tả rõ ràng, không đè chữ."""
    # Khung thẻ chính
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.02,rounding_size=0.06',
                                  facecolor=C_BG_CARD, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    
    # Thanh tiêu đề nhẹ nhàng
    hdr_h = min(0.32, h * 0.32)
    hdr = patches.FancyBboxPatch((x - w/2, y + h/2 - hdr_h), w, hdr_h,
                                 boxstyle='round,pad=0.01,rounding_size=0.05',
                                 facecolor=header_bg, edgecolor='none', zorder=5)
    ax.add_patch(hdr)
    ax.plot([x - w/2, x + w/2], [y + h/2 - hdr_h, y + h/2 - hdr_h], color=border, lw=lw*0.7, zorder=6)
    
    # Chữ tiêu đề
    ax.text(x, y + h/2 - hdr_h/2, title, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=C_TEXT_MAIN, zorder=7)
    
    # Các dòng mô tả bên dưới
    if lines:
        content = '\n'.join(lines) if isinstance(lines, list) else lines
        ax.text(x, y - hdr_h*0.4, content, ha='center', va='center',
                fontsize=7.0, color=C_TEXT_MUTED, linespacing=1.26, zorder=7)

def draw_uml_diamond(ax, x, y, w, h, text, border=C_BORDER, lw=1.0):
    """Vẽ hình thoi rẽ nhánh điều kiện chuẩn UML."""
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = patches.Polygon(pts, facecolor='#FFFFFF', edgecolor=border, lw=lw, zorder=5)
    ax.add_patch(poly)
    ax.text(x, y, text, ha='center', va='center', fontsize=7.0, fontweight='bold', color=C_TEXT_MAIN, zorder=7)

def draw_uml_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top', color=C_ARROW, linestyle='-', lw=1.1):
    """Vẽ mũi tên chuyển tiếp UML với khoảng cách an toàn, text nằm thoáng không đè lên mũi tên."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw, shrinkA=4, shrinkB=4,
                                mutation_scale=11, connectionstyle=conn, linestyle=linestyle), zorder=5)
    
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        offset = 0.18
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

        # Hộp đệm nền trắng che sạch đường mũi tên đi ngầm phía dưới, chống đè chữ tuyệt đối
        ax.text(lx, ly, full_text, ha=ha, va=va, fontsize=6.8, fontweight='bold' if label else 'normal',
                color=C_TEXT_MAIN,
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6, alpha=0.98),
                zorder=8)

def draw_actor_clean(ax, x, y, label, sub='', scale=1.0):
    """Vẽ biểu tượng tác nhân Actor gọn gàng, học thuật, không đè lên text xung quanh."""
    head_r = 0.13 * scale
    head = patches.Circle((x, y + 0.28 * scale), head_r, facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.1, zorder=6)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.04 * scale), 0.32 * scale, 0.24 * scale,
                           facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.1, zorder=6)
    ax.add_patch(body)
    ax.text(x, y - 0.18 * scale, label, ha='center', va='top', fontsize=7.6, fontweight='bold', color=C_TEXT_MAIN, zorder=7)
    if sub:
        ax.text(x, y - 0.34 * scale, sub, ha='center', va='top', fontsize=6.6, color=C_TEXT_MUTED, zorder=7)


# =============================================================================
# 1. HÌNH 5 (HÌNH 4.5): SƠ ĐỒ KHỐI TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (DUAL-ENGINE)
# =============================================================================
def gen_fig_4_5():
    """Hinh 4.5 / Hinh 5: So do khoi tai tao co vat 3D da dong co TRELLIS & Local CPU"""
    fig, ax = plt.subplots(figsize=(12.4, 5.6), dpi=300)
    ax.set_xlim(0, 12.4); ax.set_ylim(0, 5.6); ax.axis('off')

    ax.text(6.2, 5.32, 'SƠ ĐỒ KHỐI QUY TRÌNH TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (DUAL-ENGINE)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.2, 5.04, 'Kiến trúc lai ghép kết hợp Đám mây AI TRELLIS (HuggingFace ZeroGPU) và Máy chủ nội bộ Local CPU (Marching Cubes)',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    # Khung bao tổng thể rất nhẹ nhàng
    outer = patches.FancyBboxPatch((0.2, 0.2), 12.0, 4.6, boxstyle='round,pad=0.02,rounding_size=0.08',
                                   facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(outer)

    # 1. Actor Quản trị viên
    draw_actor_clean(ax, 0.9, 2.7, 'Quản trị viên', 'Nạp dữ liệu tư liệu', scale=0.85)

    # 2. Khối nguồn ảnh đầu vào (chiều ngang rộng rãi, không đè chữ)
    draw_uml_box(ax, 2.7, 2.7, 2.2, 2.4, 'Nguồn ảnh đầu vào',
                 ['• 1 ảnh đơn (Single-view)',
                  '• 2 góc ảnh (Trước + Lưng)',
                  '• Đa góc độ (Trái, Phải,',
                  '  Trên, Chi tiết hoa văn)'])

    # 3. Khối hàng đợi điều phối artifact3dQueue
    draw_uml_box(ax, 5.1, 2.7, 1.8, 1.4, 'artifact3dQueue',
                 ['Hàng đợi điều phối',
                  'Kiểm soát tiến trình &\ntài nguyên xử lý'])

    # 4. Hình thoi kiểm tra Quota GPU
    draw_uml_diamond(ax, 7.1, 2.7, 1.5, 1.3, 'Kiểm tra\nQuota GPU &\nKết nối mạng?')

    # 5. Nhánh trên: Đám mây AI TRELLIS
    draw_uml_box(ax, 9.6, 3.9, 2.3, 1.5, 'Đám mây AI: TRELLIS',
                 ['• HuggingFace ZeroGPU A100 [30]',
                  '• Biến tiềm ẩn SLAT [29]',
                  '• Rectified Flow Transformers',
                  '• Trích xuất lưới đa giác vi phân'])

    draw_uml_box(ax, 11.4, 3.9, 1.6, 1.5, 'Mô hình 3D Cao cấp',
                 ['• Định dạng chuẩn .GLB',
                  '• 25.600 Polygons',
                  '• Chi tiết 360° sắc nét',
                  '• PBR Albedo/Normal'])

    # 6. Nhánh dưới: Máy chủ nội bộ Local CPU
    draw_uml_box(ax, 9.6, 1.5, 2.3, 1.5, 'Máy chủ nội bộ: Local CPU',
                 ['• Module Python v15.0 độc lập',
                  '• Phân đoạn Rembg & Otsu',
                  '• Giả định đối xứng trục xoay',
                  '• Marching Cubes & Normal Map'])

    draw_uml_box(ax, 11.4, 1.5, 1.6, 1.5, 'Mô hình 3D Dự phòng',
                 ['• Định dạng chuẩn .GLB',
                  '• 95.000 Polygons',
                  '• Dạng đối xứng trục',
                  '• Đảm bảo tính liên tục'])

    # Mũi tên kết nối với khoảng cách thoáng đãng, text nằm trên
    draw_uml_arrow(ax, 1.3, 2.7, 1.55, 2.7, label='1. Tải ảnh', label_side='top')
    draw_uml_arrow(ax, 3.85, 2.7, 4.15, 2.7, label='2. Đẩy Queue', label_side='top')
    draw_uml_arrow(ax, 6.05, 2.7, 6.35, 2.7)

    # Rẽ nhánh trên (Còn Quota)
    draw_uml_arrow(ax, 7.45, 3.35, 8.4, 3.9, label='3a. [Còn Quota]', sub='Ưu tiên gọi API AI', label_side='top')
    draw_uml_arrow(ax, 10.75, 3.9, 10.55, 3.9, label='Xuất file .GLB', label_side='top')

    # Rẽ nhánh dưới (Hết Quota / Tùy chọn)
    draw_uml_arrow(ax, 7.45, 2.05, 8.4, 1.5, label='3b. [Tùy chọn]', sub='Chạy máy chủ nội bộ', label_side='bottom')
    draw_uml_arrow(ax, 10.75, 1.5, 10.55, 1.5, label='Xuất file .GLB', label_side='top')

    # Mũi tên Fallback đứt nét sạch sẽ
    ax.annotate('', xy=(9.6, 2.3), xytext=(9.6, 3.1),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.1, linestyle='--',
                                mutation_scale=11, shrinkA=3, shrinkB=3), zorder=5)
    ax.text(9.6, 2.7, 'Tự động Fallback khi lỗi 429 hoặc Timeout > 300s',
            ha='center', va='center', fontsize=6.6, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_5_artifact_2engines.png")


# =============================================================================
# 2. HÌNH 6 (HÌNH 3.6): SƠ ĐỒ HOẠT ĐỘNG ĐẶT VÉ & SOÁT VÉ VÀO CỔNG (UML SWIMLANES)
# =============================================================================
def gen_fig_3_6():
    """Hinh 3.6 / Hinh 6: UML Swimlane Activity Diagram Dat ve, VietQR PayOS va Soat ve tai cong"""
    fig, ax = plt.subplots(figsize=(12.6, 6.6), dpi=300)
    ax.set_xlim(0, 12.6); ax.set_ylim(0, 6.6); ax.axis('off')

    ax.text(6.3, 6.35, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH ĐẶT VÉ TRỰC TUYẾN, THANH TOÁN VIETQR VÀ SOÁT VÉ VÀO CỔNG',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.3, 6.08, 'Chu trình nghiệp vụ khép kín: Đặt vé Web -> Thanh toán VietQR Napas 247 -> Quản lý Vé của tôi -> Soát vé tại cổng',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    # Khung bao quanh toàn bộ
    border_all = patches.Rectangle((0.3, 0.35), 12.0, 5.50, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border_all)

    # 3 Làn bơi UML (Swimlanes) kẻ vạch đứt mảnh trang nhã
    ax.plot([0.3, 12.3], [4.30, 4.30], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    ax.plot([0.3, 12.3], [2.35, 2.35], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    # Tiêu đề làn bên trái
    ax.text(0.45, 5.70, 'LÀN 1: KHÁCH THAM QUAN (GIAO DIỆN /booking, /profile & MOBILE BANKING)',
            fontsize=7.2, fontweight='bold', color=C_TEXT_MAIN, zorder=3)
    ax.text(0.45, 4.10, 'LÀN 2: MÁY CHỦ HỆ THỐNG & CỔNG THANH TOÁN (NODE.JS, PAYOS & POSTGRESQL)',
            fontsize=7.2, fontweight='bold', color=C_TEXT_MAIN, zorder=3)
    ax.text(0.45, 2.15, 'LÀN 3: NHÂN VIÊN SOÁT VÉ & CỔNG BẢO TÀNG (THIẾT BỊ QUÉT CAMERA & BARIE)',
            fontsize=7.2, fontweight='bold', color=C_TEXT_MAIN, zorder=3)

    # --- LÀN 1: ĐẶT VÉ ---
    # Nút bắt đầu (Initial Node ●)
    ax.plot(0.7, 5.0, 'o', color='#0F172A', markersize=9, zorder=6)

    draw_uml_box(ax, 1.8, 5.0, 1.6, 0.85, '1. Chọn lịch tham quan', 'Ngày tham quan &\nKhung giờ (Sáng/Chiều)')
    draw_uml_box(ax, 3.6, 5.0, 1.6, 0.85, '2. Chọn hạng vé', 'Người lớn (30k)\nHSSV/Cao tuổi (15k)')
    draw_uml_box(ax, 5.4, 5.0, 1.6, 0.85, '3. Điền thông tin', 'Tự động điền tài khoản\nLưu draft tạm 15 phút')

    # Chuyển xuống Làn 2: Tạo đơn PayOS
    draw_uml_box(ax, 5.4, 3.3, 1.7, 0.85, '4. POST /api/tickets', 'Khởi tạo đơn hàng &\nGọi cổng PayOS')
    draw_uml_box(ax, 7.3, 3.3, 1.7, 0.85, '5. Sinh mã VietQR', 'Chuẩn Napas 247\nĐếm ngược 15 phút')

    # Trả về Làn 1: Khách quét mã ngân hàng
    draw_uml_box(ax, 7.3, 5.0, 1.7, 0.85, '6. Khách quét VietQR', 'Mở App Ngân hàng\nChuyển khoản thanh toán')

    # Chuyển sang Làn 2: Webhook đối soát & Cấp vé
    draw_uml_box(ax, 9.3, 3.3, 1.8, 0.85, '7. Webhook PayOS', 'Xác thực HMAC-SHA256\nCập nhật status = PAID')
    draw_uml_box(ax, 11.3, 3.3, 1.6, 0.85, '8. Cấp phát vé điện tử', 'Sinh mã TKT-xxxxxx\nMã hóa AES-256')

    # Trả về Làn 1: Hiển thị trong Hồ sơ cá nhân
    draw_uml_box(ax, 11.3, 5.0, 1.6, 0.85, '9. Tab "Vé của tôi"', 'Trang /profile\nHiển thị QR & Hiệu lực')

    # Chuyển xuống Làn 3: Ngày tham quan tại cổng bảo tàng
    draw_uml_box(ax, 4.0, 1.25, 1.8, 0.85, '10. Quét QR tại cổng', 'Nhân viên dùng Camera\nThư viện HTML5-QRCode')
    draw_uml_box(ax, 6.2, 1.25, 1.8, 0.85, '11. Đối soát API', 'POST /validate-qr\nKiểm tra chữ ký số')

    draw_uml_diamond(ax, 8.2, 1.25, 1.3, 0.95, 'Hợp lệ & Chưa\nsử dụng?')

    draw_uml_box(ax, 10.4, 1.25, 1.8, 0.85, '12. Cổng mở đón khách', 'UPDATE status = USED\nÂm báo Bíp + Tích xanh')

    # Nút kết thúc (Final Node ◉)
    ax.plot(11.8, 1.25, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(11.8, 1.25, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(11.8, 1.25, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_box(ax, 8.2, 0.55, 2.0, 0.40, 'Từ chối: Cảnh báo vé giả / Đã dùng', '')

    # --- MŨI TÊN KẾT NỐI TUẦN TỰ 1 CHIỀU ---
    draw_uml_arrow(ax, 0.78, 5.0, 1.0, 5.0)
    draw_uml_arrow(ax, 2.6, 5.0, 2.8, 5.0)
    draw_uml_arrow(ax, 4.4, 5.0, 4.6, 5.0)

    # Làn 1 -> Làn 2: Bấm Đặt vé
    draw_uml_arrow(ax, 5.4, 4.57, 5.4, 3.73, label='Bấm Đặt vé', label_side='right')
    draw_uml_arrow(ax, 6.25, 3.3, 6.45, 3.3)

    # Làn 2 -> Làn 1: Hiển thị VietQR
    draw_uml_arrow(ax, 7.3, 3.73, 7.3, 4.57, label='Hiển thị VietQR', label_side='right')

    # Làn 1 -> Làn 2: Thanh toán thành công
    draw_uml_arrow(ax, 8.15, 5.0, 9.3, 3.73, rad=-0.15, label='Báo có tức thì', label_side='top')
    draw_uml_arrow(ax, 10.2, 3.3, 10.5, 3.3)

    # Làn 2 -> Làn 1: Điều hướng /profile
    draw_uml_arrow(ax, 11.3, 3.73, 11.3, 4.57, label='Điều hướng /profile', label_side='right')

    # Làn 1 -> Làn 3: Ngày tham quan xuất trình vé
    ax.annotate('', xy=(4.0, 1.68), xytext=(11.3, 4.57),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.1, linestyle=':',
                                connectionstyle='arc3,rad=0.25', mutation_scale=11), zorder=5)
    ax.text(7.6, 2.50, 'Ngày tham quan: Khách xuất trình mã QR tại cửa bảo tàng',
            ha='center', va='center', fontsize=6.6, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    draw_uml_arrow(ax, 4.9, 1.25, 5.3, 1.25)
    draw_uml_arrow(ax, 7.1, 1.25, 7.55, 1.25)

    # Nhánh Đúng: Hợp lệ
    draw_uml_arrow(ax, 8.85, 1.25, 9.5, 1.25, label='[Hợp lệ]', label_side='top')
    draw_uml_arrow(ax, 11.3, 1.25, 11.65, 1.25)

    # Nhánh Sai: Gian lận
    draw_uml_arrow(ax, 8.2, 0.77, 8.2, 0.75, label='[Gian lận]', label_side='right')

    # Đường Realtime SSE đồng bộ tức thì
    ax.annotate('', xy=(11.3, 4.57), xytext=(10.4, 1.68),
                arrowprops=dict(arrowstyle='->', color='#334155', lw=1.1, linestyle='--',
                                connectionstyle='arc3,rad=-0.22', mutation_scale=11), zorder=5)
    ax.text(10.3, 2.8, 'Sự kiện Realtime SSE: Đổi vé sang USED (<1ms)',
            ha='center', va='center', fontsize=6.6, fontstyle='italic', color=C_TEXT_MAIN,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_sequence_payment_payos.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_6_activity_booking_ticket_lifecycle.png")


# =============================================================================
# 3. HÌNH 7 (HÌNH 3.13): SƠ ĐỒ HOẠT ĐỘNG QUẢN TRỊ & QUÉT QR TRƯNG BÀY (PHYGITAL)
# =============================================================================
def gen_fig_3_13():
    """Hinh 3.13 / Hinh 7: UML Activity Diagram Quan tri va quet QR trung bay Phygital"""
    fig, ax = plt.subplots(figsize=(12.4, 6.2), dpi=300)
    ax.set_xlim(0, 12.4); ax.set_ylim(0, 6.2); ax.axis('off')

    ax.text(6.2, 5.85, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=9.2, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.2, 5.58, 'Kết nối hiện vật thực địa với không gian ảo: Tự động sinh mã QR -> Dán tại tủ kính -> Quét Camera jsQR -> Mở 3D / Tour 360°',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    # Khung bao quanh
    border = patches.Rectangle((0.3, 0.35), 11.8, 5.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    # 2 Làn bơi: Admin CMS (y: 3.70 - 5.35) & Visitor Scanner (y: 0.35 - 3.70)
    ax.plot([0.3, 12.1], [3.70, 3.70], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 5.15, 'PHÂN HỆ QUẢN TRỊ CMS (TẠO HỒ SƠ, SINH MÃ VÀ IN ẤN THỰC ĐỊA)', fontsize=7.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 3.45, 'PHÂN HỆ KHÁCH THAM QUAN THỰC ĐỊA (QUÉT QR TƯƠNG TÁC PHYGITAL)', fontsize=7.0, fontweight='bold', color=C_TEXT_MAIN)

    # --- TẦNG ADMIN CMS ---
    draw_actor_clean(ax, 1.1, 4.4, 'Quản trị viên', 'Tạo phòng / cổ vật', scale=0.75)
    draw_uml_box(ax, 3.0, 4.45, 2.0, 0.85, '1. Tự động sinh QR', 'Deep link ?artifact={id}\nChuẩn ISO/IEC 18004')
    draw_uml_box(ax, 5.6, 4.45, 2.0, 0.85, '2. Xuất file ảnh QR', 'Độ phân giải 300 DPI\nIn ấn bảng chỉ dẫn')
    draw_uml_box(ax, 8.4, 4.45, 2.4, 0.85, '3. Dán QR tại thực địa', 'Dán trước cửa 18 phòng &\nTủ kính 17 bảo vật quốc gia')

    draw_uml_arrow(ax, 1.45, 4.45, 2.0, 4.45, label='Lưu hồ sơ', label_side='top')
    draw_uml_arrow(ax, 4.0, 4.45, 4.6, 4.45, label='Xuất vector', label_side='top')
    draw_uml_arrow(ax, 6.6, 4.45, 7.2, 4.45, label='In & Dán tem', label_side='top')

    # --- TẦNG KHÁCH THAM QUAN ---
    draw_actor_clean(ax, 1.1, 2.0, 'Khách tham quan', 'Tại bảo tàng thực địa', scale=0.75)
    draw_uml_box(ax, 3.0, 2.1, 2.0, 0.95, '4. Mở Quét QR', 'QRScannerModal Web\nAudio Beep 880Hz')
    draw_uml_box(ax, 5.6, 2.1, 2.0, 0.95, '5. Giải mã jsQR', 'Đa tỷ lệ 1000/600px\nKhử bóng lóa mặt kính')

    draw_uml_diamond(ax, 7.8, 2.1, 1.4, 1.1, 'Phân loại\nmã QR?')

    draw_uml_box(ax, 10.4, 2.8, 2.4, 0.85, 'Mở Modal Cổ vật 3D', 'Xoay 360° mô hình .GLB\nPhát Audio thuyết minh')
    draw_uml_box(ax, 10.4, 1.7, 2.4, 0.85, 'Mở Gian phòng Tour 360°', 'Chuyển cảnh không gian 360°\nĐịnh vị trên Mini-map')
    draw_uml_box(ax, 7.8, 0.75, 2.4, 0.50, 'Mã vé (TKT-): Hướng dẫn ra cổng', '')

    draw_uml_arrow(ax, 1.45, 2.1, 2.0, 2.1, label='Mở Scanner', label_side='top')
    draw_uml_arrow(ax, 4.0, 2.1, 4.6, 2.1, label='Quét tem', label_side='top')
    draw_uml_arrow(ax, 6.6, 2.1, 7.1, 2.1, label='Tách Payload', label_side='top')

    # Tem dán thực tế kết nối xuống Camera máy khách
    ax.annotate('', xy=(3.0, 2.58), xytext=(8.4, 4.02),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.1, linestyle=':',
                                connectionstyle='arc3,rad=-0.18', mutation_scale=11), zorder=5)
    ax.text(5.8, 3.15, 'Khách hướng Camera vào tem QR dán trên tủ kính thực tế',
            ha='center', va='center', fontsize=6.6, fontstyle='italic', color=C_TEXT_MUTED,
            bbox=dict(boxstyle='round,pad=0.18', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    draw_uml_arrow(ax, 8.5, 2.4, 9.2, 2.8, label='[Cổ vật]', label_side='top')
    draw_uml_arrow(ax, 8.5, 1.8, 9.2, 1.7, label='[Phòng]', label_side='top')
    draw_uml_arrow(ax, 7.8, 1.55, 7.8, 1.0, label='[Mã vé]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_13_qr_exhibition_activity.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_13_qr_exhibition_activity.png")


# =============================================================================
# 4. HÌNH 8 (HÌNH 2.14): KIẾN TRÚC GIÁM SÁT HỆ THỐNG GRAFANA & PROMETHEUS
# =============================================================================
def gen_fig_2_14():
    """Hinh 2.14 / Hinh 8: Kien truc thu thap va hien thi du lieu giam sat Grafana & Prometheus"""
    fig, ax = plt.subplots(figsize=(12.4, 5.6), dpi=300)
    ax.set_xlim(0, 12.4); ax.set_ylim(0, 5.6); ax.axis('off')

    ax.text(6.2, 5.32, 'KIẾN TRÚC GIÁM SÁT HỆ THỐNG VÀ PHÂN TÍCH QUAN SÁT (OBSERVABILITY ARCHITECTURE)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.2, 5.04, 'Thu thập Metrics phần cứng VPS, Container Docker, APM API và CSDL PostgreSQL Read-Only',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    # Khung bao ngoài
    outer = patches.FancyBboxPatch((0.2, 0.2), 12.0, 4.6, boxstyle='round,pad=0.02,rounding_size=0.08',
                                   facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(outer)

    # TẦNG 1: Nguồn dữ liệu viễn trắc (Bên trái, x = 1.7)
    draw_uml_box(ax, 1.7, 4.0, 2.4, 1.1, 'Hạ tầng VPS & Host OS',
                 ['Ubuntu Linux 24.04 LTS', 'CPU, RAM, Disk I/O, Network'])

    draw_uml_box(ax, 1.7, 2.6, 2.4, 1.1, 'Docker Containers',
                 ['cAdvisor & Engine Metrics', 'Nginx, Node, Python, Redis'])

    draw_uml_box(ax, 1.7, 1.2, 2.4, 1.1, 'PostgreSQL Database',
                 ['Số liệu vé, doanh thu, phòng 360°', 'Read-Only User (pg_readonly)'])

    # TẦNG 2: Máy chủ thu thập Prometheus Server (x = 5.0)
    draw_uml_box(ax, 5.0, 3.3, 2.4, 2.5, 'Prometheus Server',
                 ['• Time-Series Database (TSDB)',
                  '• Scraping Engine (Pull Metrics)',
                  '• Chu kỳ cào dữ liệu: 15s',
                  '• Lưu trữ metrics viễn trắc'])

    # TẦNG 3: Động cơ trực quan hóa Grafana Engine v11 (x = 8.3)
    draw_uml_box(ax, 8.3, 3.3, 2.4, 2.5, 'Grafana Engine v11.x',
                 ['• Provisioned Dashboards:',
                  '  - Di sản & Doanh thu Vé',
                  '  - Hạ tầng VPS & Container',
                  '  - Hiệu năng APM & Latency',
                  '• Secure Iframe Embedding'])

    # Bộ điều hợp PostgreSQL Adapter phía dưới Grafana (x = 8.3, y = 1.2)
    draw_uml_box(ax, 8.3, 1.2, 2.4, 1.1, 'PostgreSQL Adapter',
                 ['Direct SQL Query Driver', 'Đọc dữ liệu kinh doanh vé'])

    # TẦNG 4: Quản trị viên & Giao diện Web (/admin) (x = 11.2)
    draw_actor_clean(ax, 11.2, 4.2, 'Quản trị viên', 'Theo dõi Dashboard', scale=0.85)

    draw_uml_box(ax, 11.2, 2.0, 1.9, 1.3, 'Trang Quản trị Admin',
                 ['Giao diện Web /admin',
                  'Nhúng Iframe bảo mật',
                  'Chế độ Kiosk Mode'])

    # --- MŨI TÊN KẾT NỐI RÕ RÀNG, KHÔNG ĐÈ LẪN NHAU ---
    # Tầng 1 -> Prometheus (Pull metrics)
    draw_uml_arrow(ax, 2.9, 4.0, 3.8, 3.8, label='Pull Metrics', sub='Node Exporter', label_side='top')
    draw_uml_arrow(ax, 2.9, 2.6, 3.8, 3.0, label='cAdvisor', label_side='bottom')

    # Tầng 1 -> PostgreSQL Adapter (SQL Query)
    draw_uml_arrow(ax, 2.9, 1.2, 7.1, 1.2, label='SQL Query', sub='Bảo mật Read-Only', label_side='top')

    # Prometheus -> Grafana (TSDB Query)
    draw_uml_arrow(ax, 6.2, 3.3, 7.1, 3.3, label='TSDB Query', sub='PromQL', label_side='top')

    # PostgreSQL Adapter -> Grafana
    draw_uml_arrow(ax, 8.3, 1.75, 8.3, 2.05, label='Direct Query', label_side='right')

    # Grafana -> Admin UI (Render panels)
    draw_uml_arrow(ax, 9.5, 2.6, 10.25, 2.3, label='Render Panels', sub='Iframe Token', label_side='bottom')

    # Quản trị viên -> Admin UI (Theo dõi trực quan)
    draw_uml_arrow(ax, 11.2, 3.65, 11.2, 2.65, label='Truy cập', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_2_14_grafana_architecture.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_2_14_grafana_architecture.png")


# =============================================================================
# 5. HÌNH 3.7: SƠ ĐỒ HOẠT ĐỘNG SOÁT VÉ QR CAMERA VÀ CHỐNG GIAN LẬN
# =============================================================================
def gen_fig_3_7():
    """Hinh 3.7: UML Activity Diagram Soat ve QR Camera truc tiep va chong gian lan"""
    fig, ax = plt.subplots(figsize=(12.0, 5.0), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.0); ax.axis('off')

    ax.text(6.0, 4.75, 'SƠ ĐỒ HOẠT ĐỘNG: SOÁT VÉ ĐIỆN TỬ VÀ KIỂM SOÁT VÀO CỔNG THỜI GIAN THỰC',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.0, 4.48, 'Giải mã khung hình HTML5-QRCode, đối soát chữ ký số SHA-256, chuyển trạng thái USED và chống gian lận vé',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.35), 11.4, 3.8, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 11.7], [2.25, 2.25], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 3.95, 'LÀN 1: NHÂN VIÊN SOÁT VÉ TẠI CỔNG (CAMERA SCANNER & GIAO DIỆN KIỂM SOÁT)', fontsize=7.0, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.05, 'LÀN 2: MÁY CHỦ HỆ THỐNG BACKEND & CSDL POSTGRESQL (XÁC THỰC VÀ GHI LOG)', fontsize=7.0, fontweight='bold', color=C_TEXT_MAIN)

    ax.plot(0.8, 3.1, 'o', color='#0F172A', markersize=9, zorder=6)

    draw_uml_box(ax, 2.0, 3.1, 1.8, 0.9, '1. Mở Camera Scanner', 'HTML5-QRCode\nKhung ngắm quét mã vé')
    draw_uml_box(ax, 4.2, 3.1, 1.8, 0.9, '2. Quét mã QR vé', 'Giải mã payload AES-256\nTrích xuất TKT-xxxxxx')

    draw_uml_box(ax, 4.2, 1.2, 1.8, 0.9, '3. API Đối soát', 'POST /validate-qr\nKiểm tra chữ ký số')
    draw_uml_box(ax, 6.6, 1.2, 1.8, 0.9, '4. Kiểm tra CSDL', 'Kiểm tra ngày, giờ\nstatus == PAID ?')

    draw_uml_diamond(ax, 8.8, 1.2, 1.4, 1.0, 'Hợp lệ & Chưa\nsử dụng?')

    draw_uml_box(ax, 10.8, 1.2, 1.7, 0.9, '5. Ghi nhận USED', 'UPDATE status = USED\nGhi log checked_in_at')
    draw_uml_box(ax, 10.8, 3.1, 1.7, 0.9, '6. Mở Barie đón khách', 'Tích xanh + Âm báo Bíp\nBắn SSE sang khách')

    draw_uml_box(ax, 8.8, 3.1, 1.8, 0.9, 'Cảnh báo Gian lận', 'Vé giả / Đã dùng / Hết hạn\nÂm báo lỗi đỏ từ chối')

    draw_uml_arrow(ax, 0.88, 3.1, 1.1, 3.1)
    draw_uml_arrow(ax, 2.9, 3.1, 3.3, 3.1)
    draw_uml_arrow(ax, 4.2, 2.65, 4.2, 1.65, label='Gọi API', label_side='right')
    draw_uml_arrow(ax, 5.1, 1.2, 5.7, 1.2)
    draw_uml_arrow(ax, 7.5, 1.2, 8.1, 1.2)

    # Nhánh Đúng
    draw_uml_arrow(ax, 9.5, 1.2, 9.95, 1.2, label='[Đúng]', label_side='top')
    draw_uml_arrow(ax, 10.8, 1.65, 10.8, 2.65, label='Mở cổng', label_side='right')

    # Nhánh Sai
    draw_uml_arrow(ax, 8.8, 1.7, 8.8, 2.65, label='[Sai / Đã dùng]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_activity_ticket_validation.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_sequence_qr_scan.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_7_activity_ticket_validation.png")


# =============================================================================
# 6. HÌNH 3.10: SƠ ĐỒ HOẠT ĐỘNG DỊCH THUẬT VÀ BẢN ĐỊA HÓA CỤC BỘ
# =============================================================================
def gen_fig_3_10():
    """Hinh 3.10: UML Activity Diagram Dich thuat da ngon ngu va cache cuc bo"""
    fig, ax = plt.subplots(figsize=(12.0, 5.2), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(6.0, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.0, 4.68, 'Phân tách độc lập ngôn ngữ thuyết minh phòng/hiện vật với ngôn ngữ hệ thống - Ưu tiên Cache bộ nhớ Client',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.4), 11.4, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)
    ax.plot([0.3, 11.7], [2.5, 2.5], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)

    ax.text(0.5, 4.25, 'TẦNG TRÌNH DUYỆT CLIENT (KHÁCH THAM QUAN 360°)', fontsize=7.2, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(0.5, 2.30, 'TẦNG MÁY CHỦ SERVER & CƠ SỞ DỮ LIỆU / AI TRANSLATE', fontsize=7.2, fontweight='bold', color=C_TEXT_MAIN)

    draw_actor_clean(ax, 1.1, 3.3, 'Khách tham quan', 'Chọn VI / EN / FR', scale=0.8)

    draw_uml_box(ax, 3.0, 3.4, 2.0, 0.9, '1. Client Controller', 'Đọc mã phòng/cổ vật\nGiữ nguyên System UI')
    draw_uml_diamond(ax, 5.3, 3.4, 1.5, 1.0, 'Tra cứu Cache\nClient Memory?')

    draw_uml_box(ax, 8.0, 3.4, 2.0, 0.9, '2a. Cập nhật tức thì', 'Gán văn bản dịch <10ms\nCập nhật UI tham quan')

    # Tầng Server
    draw_uml_box(ax, 5.3, 1.3, 2.0, 0.9, '2b. GET /api/localize', 'Truy vấn bản dịch\ntheo mã & ngôn ngữ')
    draw_uml_box(ax, 8.2, 1.3, 2.0, 0.9, 'PostgreSQL CSDL', 'Bảng rooms, artifacts\nTrường name_en, desc_en')
    draw_uml_box(ax, 10.8, 1.3, 1.7, 0.9, 'Google NMT / AI', 'Dịch máy tự động\nFallback khi thiếu')

    # Trả về Client
    draw_uml_box(ax, 10.8, 3.4, 1.7, 0.9, 'Lưu Cache Client', 'Ghi key vào bộ nhớ\nCập nhật UI 360°')

    draw_uml_arrow(ax, 1.45, 3.4, 2.0, 3.4, label='Chọn tiếng', label_side='top')
    draw_uml_arrow(ax, 4.0, 3.4, 4.55, 3.4)

    draw_uml_arrow(ax, 6.05, 3.4, 7.0, 3.4, label='[Cache Hit]', label_side='top')
    draw_uml_arrow(ax, 5.3, 2.9, 5.3, 1.75, label='[Cache Miss]', label_side='right')

    draw_uml_arrow(ax, 6.3, 1.3, 7.2, 1.3, label='Truy vấn DB', label_side='top')
    draw_uml_arrow(ax, 9.2, 1.3, 9.95, 1.3, label='Nếu trống', label_side='top')

    draw_uml_arrow(ax, 10.8, 1.75, 10.8, 2.95, label='Phản hồi JSON', label_side='right')
    draw_uml_arrow(ax, 9.95, 3.4, 9.0, 3.4)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_10_translation_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_10_translation_flow.png")


# =============================================================================
# 7. HÌNH 3.11: SƠ ĐỒ HOẠT ĐỘNG AUDIO TTS VỚI MÃ BĂM MD5
# =============================================================================
def gen_fig_3_11():
    """Hinh 3.11: UML Activity Diagram Audio Hash Storage & Streaming TTS"""
    fig, ax = plt.subplots(figsize=(12.0, 5.2), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(6.0, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH SINH, LƯU TRỮ ĐỆM BĂM (HASH STORAGE) VÀ STREAMING AUDIO',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.0, 4.68, 'Tối ưu hóa 100% chi phí API và độ trễ phát bằng giải thuật băm MD5 duy nhất và lưu trữ tệp tĩnh trên đĩa',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.4), 11.4, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    draw_actor_clean(ax, 1.0, 2.6, 'Khách tham quan', 'Bấm nghe thuyết minh', scale=0.85)

    draw_uml_box(ax, 2.9, 2.7, 2.0, 1.0, '1. Bộ băm MD5', 'Key = MD5(văn bản +\nngôn ngữ + mã giọng)')
    draw_uml_diamond(ax, 5.3, 2.7, 1.5, 1.1, 'Tệp {Key}.mp3\ntồn tại trên đĩa?')

    draw_uml_box(ax, 8.0, 3.6, 2.3, 0.95, '2a. Nginx Static Cache', 'HTTP 206 Partial Content\nCache-Control: Immutable')
    draw_uml_box(ax, 8.0, 1.5, 2.3, 0.95, '2b. Google Cloud TTS', 'Tổng hợp giọng đọc AI\nGhi đĩa tĩnh audio_cache/')

    draw_uml_box(ax, 10.9, 2.7, 1.7, 1.0, '3. Trình phát Audio', 'HTML5 Audio Engine\nĐộ trễ < 30ms (Cache Hit)\nPhát mượt mà')

    draw_uml_arrow(ax, 1.35, 2.7, 1.9, 2.7, label='Yêu cầu', label_side='top')
    draw_uml_arrow(ax, 3.9, 2.7, 4.55, 2.7)

    draw_uml_arrow(ax, 6.05, 3.1, 6.85, 3.6, label='[Có]: Cache Hit', label_side='top')
    draw_uml_arrow(ax, 9.15, 3.6, 10.05, 3.0, label='Stream MP3', label_side='top')

    draw_uml_arrow(ax, 6.05, 2.3, 6.85, 1.5, label='[Chưa]: Cache Miss', label_side='bottom')
    draw_uml_arrow(ax, 9.15, 1.5, 10.05, 2.4, label='Ghi đĩa & Stream', label_side='bottom')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_11_voice_tts_storage_pipeline.png")


# =============================================================================
# 8. HÌNH 3.12: SƠ ĐỒ HOẠT ĐỘNG XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# =============================================================================
def gen_fig_3_12():
    """Hinh 3.12: UML Activity Diagram Xuat bao cao thong ke Excel da bang tinh"""
    fig, ax = plt.subplots(figsize=(12.0, 5.2), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(6.0, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_TEXT_MAIN)
    ax.text(6.0, 4.68, 'Trích xuất số liệu vé, doanh thu, lưu lượng tham quan và định dạng bảng tính tự động bằng thư viện exceljs',
            ha='center', va='center', fontsize=7.4, color=C_TEXT_MUTED)

    border = patches.Rectangle((0.3, 0.4), 11.4, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    draw_actor_clean(ax, 1.0, 2.6, 'Quản trị viên', 'Bấm "Xuất file Excel"', scale=0.85)

    draw_uml_box(ax, 3.0, 2.7, 2.0, 1.0, '1. Gửi yêu cầu', 'GET /api/reports/export\nKèm bộ lọc thời gian')
    draw_uml_box(ax, 5.6, 2.7, 2.2, 1.0, '2. Truy vấn PostgreSQL', 'JOIN bảng orders, tickets,\nrooms, artifacts, logs')
    draw_uml_box(ax, 8.4, 2.7, 2.4, 1.0, '3. exceljs Workbook', 'Tạo 3 Sheet chuyên biệt:\n• Tổng quan doanh thu\n• Danh sách chi tiết vé\n• Thống kê gian phòng')
    draw_uml_box(ax, 11.0, 2.7, 1.7, 1.0, '4. Tải file .xlsx', 'HTTP Attachment\nStream trực tiếp\nVề máy Admin')

    draw_uml_arrow(ax, 1.45, 2.7, 2.0, 2.7, label='Bấm xuất', label_side='top')
    draw_uml_arrow(ax, 4.0, 2.7, 4.5, 2.7, label='Query DB', label_side='top')
    draw_uml_arrow(ax, 6.7, 2.7, 7.2, 2.7, label='Format Sheet', label_side='top')
    draw_uml_arrow(ax, 9.6, 2.7, 10.15, 2.7, label='Tải file', label_side='top')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_12_excel_export_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_12_excel_export_flow.png")


# =============================================================================
# CHẠY TOÀN BỘ CÁC HÀM TẠO SƠ ĐỒ CHUẨN HỌC THUẬT ARIAL
# =============================================================================
if __name__ == '__main__':
    print("=== ĐANG TẠO LẠI TOÀN BỘ SƠ ĐỒ THEO CHUẨN HỌC THUẬT ARIAL (KHÔNG ĐÈ CHỮ, KHÔNG MÀU MÈ) ===")
    gen_fig_4_5()
    gen_fig_3_6()
    gen_fig_3_13()
    gen_fig_2_14()
    gen_fig_3_7()
    gen_fig_3_10()
    gen_fig_3_11()
    gen_fig_3_12()
    print("=== HOÀN TẤT TOÀN BỘ SƠ ĐỒ! ===")
