# -*- coding: utf-8 -*-
"""
REDESIGN ACADEMIC DIAGRAMS - CLEAN MINIMALIST UML STANDARD (NO TEXT OVERLAP, NO GAUDY COLORS)
Báo cáo Khóa luận Tốt nghiệp & Slide Bảo vệ - ĐH Công nghiệp TP.HCM (IUH)

Quy chuẩn thiết kế:
- Nền trắng tinh khiết hoặc xám nhạt học thuật (#FFFFFF / #F8FAFC).
- Khung thẻ (Card): Trắng viền than chì mỏng (#334155, lw=1.1), bo góc tinh tế.
- Tuyệt đối KHÔNG dùng các mảng màu neon/chói gắt (xanh lá cây chuối, cam chói, đỏ rực).
- Text: 100% chữ đen than chì sắc nét (#0F172A), phân cấp kích thước rõ ràng, không đè nhau.
- Mũi tên: Thanh mảnh (#334155, lw=1.2), nhãn chữ nằm thoáng bên trên hoặc cạnh mũi tên.
- Không dùng huy hiệu tròn đen dán đè lên mũi tên ngắn.
- Sử dụng chuẩn ký hiệu UML: Khối thao tác bo góc, Hình thoi (Diamond) cho rẽ nhánh điều kiện,
  Nút bắt đầu (Initial Node ●), Nút kết thúc (Final Node ◉), Làn bơi (Swimlanes) kẻ mảnh.
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

# PALETTE HỌC THUẬT THANH LỊCH (ACADEMIC SLATE PALETTE)
C_DARK_TEXT = '#0F172A'      # Chữ tiêu đề & nội dung chính (Đen than chì)
C_MUTED_TEXT = '#475569'     # Chữ phụ chú (Xám thép đậm)
C_BORDER = '#334155'         # Viền khung đối tượng
C_BORDER_LIGHT = '#94A3B8'   # Viền phân cách nhẹ
C_ARROW = '#334155'          # Mũi tên liên kết
C_BG_CARD = '#FFFFFF'        # Nền thẻ màu trắng sạch sẽ
C_BG_HEADER = '#F1F5F9'      # Nền thanh tiêu đề thẻ nhẹ nhàng
C_BG_HIGHLIGHT = '#F8FAFC'   # Nền khối điểm nhấn

def draw_uml_box(ax, x, y, w, h, title, lines=None, header_bg=C_BG_HEADER, border=C_BORDER, lw=1.1, title_color=C_DARK_TEXT):
    """Vẽ khối thao tác chuẩn UML bo góc nhẹ với tiêu đề và các dòng mô tả rõ ràng."""
    rect = patches.FancyBboxPatch((x - w/2, y - h/2), w, h,
                                  boxstyle='round,pad=0.02,rounding_size=0.08',
                                  facecolor=C_BG_CARD, edgecolor=border, lw=lw, zorder=4)
    ax.add_patch(rect)
    
    # Thanh header mảnh
    hdr_h = min(0.32, h * 0.32)
    hdr = patches.FancyBboxPatch((x - w/2, y + h/2 - hdr_h), w, hdr_h,
                                boxstyle='round,pad=0.01,rounding_size=0.06',
                                facecolor=header_bg, edgecolor='none', zorder=5)
    ax.add_patch(hdr)
    # Đường kẻ chân header
    ax.plot([x - w/2, x + w/2], [y + h/2 - hdr_h, y + h/2 - hdr_h], color=border, lw=lw*0.7, zorder=6)
    
    # Tiêu đề
    ax.text(x, y + h/2 - hdr_h/2, title, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color=title_color, zorder=7)
    
    # Nội dung các dòng bên dưới
    if lines:
        if isinstance(lines, list):
            content = '\n'.join(lines)
        else:
            content = lines
        ax.text(x, y - hdr_h*0.4, content, ha='center', va='center',
                fontsize=7.2, color=C_MUTED_TEXT, linespacing=1.28, zorder=7)

def draw_uml_diamond(ax, x, y, w, h, text, border=C_BORDER, lw=1.1):
    """Vẽ hình thoi rẽ nhánh điều kiện chuẩn UML."""
    pts = [[x, y + h/2], [x + w/2, y], [x, y - h/2], [x - w/2, y]]
    poly = patches.Polygon(pts, facecolor='#FFFFFF', edgecolor=border, lw=lw, zorder=5)
    ax.add_patch(poly)
    ax.text(x, y, text, ha='center', va='center', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=7)

def draw_uml_arrow(ax, x1, y1, x2, y2, label='', sub='', rad=0.0, label_side='top', color=C_ARROW, linestyle='-'):
    """Vẽ mũi tên chuyển tiếp UML với khoảng cách an toàn, không đè chữ."""
    conn = f'arc3,rad={rad}' if rad != 0 else 'arc3'
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.2, shrinkA=3, shrinkB=3,
                                mutation_scale=11, connectionstyle=conn, linestyle=linestyle), zorder=5)
    
    if label or sub:
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        
        # Độ lệch nhãn
        if label_side == 'top':
            ly = my + 0.16 + (0.1 if rad > 0 else 0)
            lx = mx
            va = 'bottom'
        elif label_side == 'bottom':
            ly = my - 0.16 - (0.1 if rad < 0 else 0)
            lx = mx
            va = 'top'
        elif label_side == 'right':
            lx = mx + 0.16
            ly = my
            va = 'center'
        else:
            lx = mx - 0.16
            ly = my
            va = 'center'
            
        full_text = label
        if sub:
            full_text = f"{label}\n({sub})" if label else sub
            
        ax.text(lx, ly, full_text, ha='center', va=va,
                fontsize=7.0, fontweight='bold' if label else 'normal',
                color=C_DARK_TEXT, zorder=8)

def draw_actor_simple(ax, x, y, label, sub='', scale=1.0):
    """Vẽ biểu tượng tác nhân Actor gọn gàng, học thuật."""
    head_r = 0.14 * scale
    head = patches.Circle((x, y + 0.32 * scale), head_r, facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=6)
    ax.add_patch(head)
    body = patches.Ellipse((x, y + 0.05 * scale), 0.36 * scale, 0.28 * scale,
                           facecolor='#FFFFFF', edgecolor=C_BORDER, lw=1.2, zorder=6)
    ax.add_patch(body)
    ax.text(x, y - 0.20 * scale, label, ha='center', va='top', fontsize=7.8, fontweight='bold', color=C_DARK_TEXT, zorder=7)
    if sub:
        ax.text(x, y - 0.38 * scale, sub, ha='center', va='top', fontsize=6.8, color=C_MUTED_TEXT, zorder=7)


# =============================================================================
# 1. HÌNH 4.5: SƠ ĐỒ KHỐI TÁI TẠO CỔ VẬT 3D LAI GHÉP (DUAL-ENGINE TRELLIS & LOCAL CPU)
# =============================================================================
def gen_fig_4_5():
    """Hinh 4.5: So do khoi quy trinh tai tao co vat 3D da dong co (TRELLIS & Local CPU)"""
    fig, ax = plt.subplots(figsize=(12.0, 5.6), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 5.6); ax.axis('off')
    
    # Tiêu đề học thuật
    ax.text(6.0, 5.30, 'SƠ ĐỒ KHỐI QUY TRÌNH TÁI TẠO CỔ VẬT 3D ĐA ĐỘNG CƠ (DUAL-ENGINE)',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(6.0, 5.02, 'Kiến trúc kết hợp Đám mây AI TRELLIS (HuggingFace ZeroGPU) và Máy chủ nội bộ Local CPU (Marching Cubes)',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    # Khung bao tổng thể rất nhẹ nhàng
    outer = patches.FancyBboxPatch((0.2, 0.2), 11.6, 4.6, boxstyle='round,pad=0.02,rounding_size=0.10',
                                  facecolor='#FAFAFA', edgecolor='#E2E8F0', lw=1.0, zorder=1)
    ax.add_patch(outer)

    # Actor
    draw_actor_simple(ax, 0.8, 2.7, 'Quản trị viên', 'Nạp dữ liệu tư liệu', scale=0.85)

    # Khối 1: Nguồn ảnh
    draw_uml_box(ax, 2.4, 2.7, 2.1, 2.4, 'Nguồn ảnh đầu vào',
                 ['• 1 ảnh đơn (Single-view)',
                  '• 2 góc ảnh (Trước + Lưng)',
                  '• Đa góc độ (Trái, Phải,',
                  '  Trên, Chi tiết hoa văn)'],
                 header_bg='#E2E8F0')

    # Khối 2: Điều phối Hàng đợi
    draw_uml_box(ax, 4.6, 2.7, 1.7, 1.4, 'artifact3dQueue',
                 ['Hàng đợi điều phối',
                  'Kiểm soát tiến trình &\ntài nguyên xử lý'],
                 header_bg='#E2E8F0')

    # Khối 3: Hình thoi kiểm tra Quota
    draw_uml_diamond(ax, 6.4, 2.7, 1.4, 1.3, 'Kiểm tra\nQuota GPU &\nKết nối mạng?')

    # Nhánh 1 (Trên): Đám mây AI TRELLIS
    draw_uml_box(ax, 8.8, 3.9, 2.3, 1.5, 'Đám mây AI: TRELLIS',
                 ['• HuggingFace ZeroGPU A100 [30]',
                  '• Biến tiềm ẩn SLAT [29]',
                  '• Rectified Flow Transformers',
                  '• Trích xuất lưới đa giác vi phân'],
                 header_bg='#E2E8F0')

    draw_uml_box(ax, 11.0, 3.9, 1.6, 1.5, 'Mô hình 3D Cao cấp',
                 ['• File chuẩn .GLB',
                  '• 25.600 Polygons',
                  '• Chi tiết 360° sắc nét',
                  '• PBR Albedo/Normal'],
                 header_bg='#E2E8F0')

    # Nhánh 2 (Dưới): Máy chủ nội bộ Local CPU
    draw_uml_box(ax, 8.8, 1.5, 2.3, 1.5, 'Máy chủ nội bộ: Local CPU',
                 ['• Module Python v15.0 độc lập',
                  '• Phân đoạn Rembg & Otsu',
                  '• Giả định đối xứng trục xoay',
                  '• Marching Cubes & Normal Map'],
                 header_bg='#E2E8F0')

    draw_uml_box(ax, 11.0, 1.5, 1.6, 1.5, 'Mô hình 3D Dự phòng',
                 ['• File chuẩn .GLB',
                  '• 95.000 Polygons',
                  '• Dạng đối xứng trục',
                  '• Đảm bảo tính liên tục'],
                 header_bg='#E2E8F0')

    # Kết nối mũi tên rõ ràng, thoáng đãng
    draw_uml_arrow(ax, 1.15, 2.7, 1.35, 2.7, label='1. Tải ảnh', label_side='top')
    draw_uml_arrow(ax, 3.45, 2.7, 3.75, 2.7, label='2. Đẩy Queue', label_side='top')
    draw_uml_arrow(ax, 5.45, 2.7, 5.7, 2.7)

    # Nhánh trên: Còn Quota
    draw_uml_arrow(ax, 6.7, 3.35, 7.65, 3.9, label='3a. [Còn Quota]', sub='Ưu tiên gọi API AI', label_side='top')
    draw_uml_arrow(ax, 9.95, 3.9, 10.2, 3.9, label='Xuất .GLB', label_side='top')

    # Nhánh dưới: Hết Quota / Tùy chọn nội bộ
    draw_uml_arrow(ax, 6.7, 2.05, 7.65, 1.5, label='3b. [Tùy chọn]', sub='Chạy máy chủ nội bộ', label_side='bottom')
    draw_uml_arrow(ax, 9.95, 1.5, 10.2, 1.5, label='Xuất .GLB', label_side='top')

    # Đường chuyển tiếp Fallback tự động
    ax.annotate('', xy=(8.8, 2.25), xytext=(8.8, 3.15),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.2, linestyle='--',
                                mutation_scale=11, shrinkA=3, shrinkB=3), zorder=5)
    ax.text(8.8, 2.7, 'Tự động Fallback khi lỗi 429 hoặc Timeout > 300s',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color='#475569',
            bbox=dict(boxstyle='square,pad=0.15', facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=0.6), zorder=8)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_4_5_artifact_2engines.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_4_5_artifact_2engines.png")


# =============================================================================
# 2. HÌNH 3.6: SƠ ĐỒ HOẠT ĐỘNG QUY TRÌNH ĐẶT VÉ & THANH TOÁN VIETQR (UML SWIMLANES)
# =============================================================================
def gen_fig_3_6():
    """Hinh 3.6: UML Swimlane Activity Diagram Dat ve, VietQR PayOS va Soat ve tai cong"""
    fig, ax = plt.subplots(figsize=(12.5, 6.6), dpi=300)
    ax.set_xlim(0, 12.5); ax.set_ylim(0, 6.6); ax.axis('off')

    # Tiêu đề
    ax.text(6.25, 6.35, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH ĐẶT VÉ TRỰC TUYẾN, THANH TOÁN VIETQR VÀ SOÁT VÉ VÀO CỔNG',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(6.25, 6.08, 'Chu trình nghiệp vụ khép kín: Đặt vé Web -> Thanh toán VietQR Napas 247 -> Quản lý Vé của tôi -> Soát vé tại cổng',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    # 3 Làn bơi (UML Swimlanes)
    # Làn 1: Khách tham quan (y: 4.30 - 5.85)
    # Làn 2: Hệ thống Backend & PayOS (y: 2.35 - 4.25)
    # Làn 3: Soát vé tại cổng bảo tàng (y: 0.35 - 2.30)
    
    # Kẻ vạch phân cách làn
    ax.plot([0.3, 12.2], [4.30, 4.30], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    ax.plot([0.3, 12.2], [2.35, 2.35], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    
    # Khung bao quanh toàn bộ biểu đồ
    border_all = patches.Rectangle((0.3, 0.35), 11.9, 5.50, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border_all)

    # Nhãn làn bên trái
    ax.text(0.45, 5.70, 'LÀN 1: KHÁCH THAM QUAN (GIAO DIỆN /booking, /profile & MOBILE BANKING)',
            fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=3)
    ax.text(0.45, 4.10, 'LÀN 2: MÁY CHỦ HỆ THỐNG & CỔNG THANH TOÁN (NODE.JS, PAYOS & POSTGRESQL)',
            fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=3)
    ax.text(0.45, 2.15, 'LÀN 3: NHÂN VIÊN SOÁT VÉ & CỔNG BẢO TÀNG (THIẾT BỊ QUÉT CAMERA & BARIE)',
            fontsize=7.2, fontweight='bold', color=C_DARK_TEXT, zorder=3)

    # --- LÀN 1: ĐẶT VÉ ---
    # Initial Node (Start ●)
    ax.plot(0.7, 5.0, 'o', color='#0F172A', markersize=9, zorder=6)
    
    draw_uml_box(ax, 1.8, 5.0, 1.6, 0.85, '1. Chọn lịch tham quan', 'Ngày tham quan &\nKhung giờ (Sáng/Chiều)')
    draw_uml_box(ax, 3.6, 5.0, 1.6, 0.85, '2. Chọn hạng vé', 'Người lớn (30k)\nHSSV/Cao tuổi (15k)')
    draw_uml_box(ax, 5.4, 5.0, 1.6, 0.85, '3. Điền thông tin', 'Tự động điền tài khoản\nLưu draft tạm 15 phút')

    # Chuyển sang Làn 2: Tạo đơn
    draw_uml_box(ax, 5.4, 3.3, 1.7, 0.85, '4. POST /api/tickets', 'Khởi tạo đơn hàng &\nGọi cổng PayOS')
    draw_uml_box(ax, 7.3, 3.3, 1.7, 0.85, '5. Sinh mã VietQR', 'Chuẩn Napas 247\nĐếm ngược 15 phút')

    # Trả về Làn 1: Quét mã ngân hàng
    draw_uml_box(ax, 7.3, 5.0, 1.7, 0.85, '6. Khách quét VietQR', 'Mở App Ngân hàng\nChuyển khoản thanh toán')

    # Chuyển sang Làn 2: Webhook đối soát & Lưu CSDL
    draw_uml_box(ax, 9.3, 3.3, 1.8, 0.85, '7. Webhook PayOS', 'Xác thực HMAC-SHA256\nCập nhật status = PAID')
    draw_uml_box(ax, 11.2, 3.3, 1.6, 0.85, '8. Cấp phát vé điện tử', 'Sinh mã TKT-xxxxxx\nMã hóa AES-256')

    # Trả về Làn 1: Vé của tôi
    draw_uml_box(ax, 11.2, 5.0, 1.6, 0.85, '9. Tab "Vé của tôi"', 'Trang /profile\nHiển thị QR & Hiệu lực')

    # Chuyển xuống Làn 3: Ngày tham quan tại cổng
    draw_uml_box(ax, 4.0, 1.25, 1.8, 0.85, '10. Quét QR tại cổng', 'Nhân viên dùng Camera\nThư viện HTML5-QRCode')
    draw_uml_box(ax, 6.2, 1.25, 1.8, 0.85, '11. Đối soát API', 'POST /validate-qr\nKiểm tra chữ ký số')

    draw_uml_diamond(ax, 8.2, 1.25, 1.3, 0.95, 'Hợp lệ & Chưa\nsử dụng?')

    draw_uml_box(ax, 10.3, 1.25, 1.8, 0.85, '12. Cổng mở đón khách', 'UPDATE status = USED\nÂm báo Bíp + Tích xanh')

    # Final Node (End ◉)
    ax.plot(11.7, 1.25, 'o', color='#0F172A', markersize=11, zorder=6)
    ax.plot(11.7, 1.25, 'o', color='#FFFFFF', markersize=7, zorder=7)
    ax.plot(11.7, 1.25, 'o', color='#0F172A', markersize=4, zorder=8)

    draw_uml_box(ax, 8.2, 0.55, 2.0, 0.40, 'Từ chối: Cảnh báo vé giả / Đã dùng', '')

    # --- ĐƯỜNG MŨI TÊN KẾT NỐI (RÕ RÀNG, KHÔNG ĐÈ LẪN) ---
    draw_uml_arrow(ax, 0.78, 5.0, 1.0, 5.0)
    draw_uml_arrow(ax, 2.6, 5.0, 2.8, 5.0)
    draw_uml_arrow(ax, 4.4, 5.0, 4.6, 5.0)
    
    # Từ điền thông tin (Làn 1) xuống Tạo đơn (Làn 2)
    draw_uml_arrow(ax, 5.4, 4.57, 5.4, 3.73, label='Bấm Đặt vé')
    draw_uml_arrow(ax, 6.25, 3.3, 6.45, 3.3)

    # Từ VietQR (Làn 2) lên Khách quét mã (Làn 1)
    draw_uml_arrow(ax, 7.3, 3.73, 7.3, 4.57, label='Hiển thị VietQR')
    
    # Từ Quét mã (Làn 1) xuống Webhook (Làn 2)
    draw_uml_arrow(ax, 8.15, 5.0, 9.3, 3.73, rad=-0.15, label='Báo có tức thì')
    draw_uml_arrow(ax, 10.2, 3.3, 10.4, 3.3)

    # Từ Cấp vé (Làn 2) lên Tab Vé của tôi (Làn 1)
    draw_uml_arrow(ax, 11.2, 3.73, 11.2, 4.57, label='Điều hướng /profile')

    # Từ Tab Vé của tôi (Làn 1) xuống Quét QR tại cổng (Làn 3)
    ax.annotate('', xy=(4.0, 1.68), xytext=(11.2, 4.57),
                arrowprops=dict(arrowstyle='->', color=C_ARROW, lw=1.2, linestyle=':',
                                connectionstyle='arc3,rad=0.25', mutation_scale=11), zorder=5)
    ax.text(7.6, 2.50, 'Ngày tham quan: Khách xuất trình mã QR tại cửa bảo tàng',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color=C_MUTED_TEXT, zorder=8)

    draw_uml_arrow(ax, 4.9, 1.25, 5.3, 1.25)
    draw_uml_arrow(ax, 7.1, 1.25, 7.55, 1.25)

    # Nhánh Đúng: Mở cổng
    draw_uml_arrow(ax, 8.85, 1.25, 9.4, 1.25, label='[Hợp lệ]')
    draw_uml_arrow(ax, 11.2, 1.25, 11.55, 1.25)

    # Nhánh Sai: Cảnh báo
    draw_uml_arrow(ax, 8.2, 0.77, 8.2, 0.75, label='[Gian lận]')

    # Đường Realtime SSE đồng bộ ngược lên Tab Vé của tôi
    ax.annotate('', xy=(11.2, 4.57), xytext=(10.3, 1.68),
                arrowprops=dict(arrowstyle='->', color='#334155', lw=1.1, linestyle='--',
                                connectionstyle='arc3,rad=-0.22', mutation_scale=11), zorder=5)
    ax.text(10.2, 2.8, 'Sự kiện Realtime SSE: Đổi vé sang USED (<1ms)',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color='#334155', zorder=8)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_booking_ticket_lifecycle.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_6_sequence_payment_payos.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_6_activity_booking_ticket_lifecycle.png")


# =============================================================================
# 3. HÌNH 3.10: SƠ ĐỒ HOẠT ĐỘNG DỊCH THUẬT VÀ BẢN ĐỊA HÓA CỤC BỘ (LOCALIZATION)
# =============================================================================
def gen_fig_3_10():
    """Hinh 3.10: UML Activity Diagram Dich thuat da ngon ngu va cache cuc bo"""
    fig, ax = plt.subplots(figsize=(11.5, 5.2), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(5.75, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH DỊCH THUẬT VÀ TẢI DỮ LIỆU BẢN ĐỊA HÓA CỤC BỘ',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.75, 4.68, 'Phân tách độc lập ngôn ngữ thuyết minh phòng/hiện vật với ngôn ngữ hệ thống - Ưu tiên Cache bộ nhớ Client',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    # 2 Phân tầng: Client Layer (y: 2.6 - 4.4) và Server Layer (y: 0.4 - 2.4)
    ax.plot([0.4, 11.1], [2.5, 2.5], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    border = patches.Rectangle((0.4, 0.4), 10.7, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    ax.text(0.6, 4.25, 'TẦNG TRÌNH DUYỆT CLIENT (KHÁCH THAM QUAN 360°)', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT)
    ax.text(0.6, 2.30, 'TẦNG MÁY CHỦ SERVER & CƠ SỞ DỮ LIỆU / AI TRANSLATE', fontsize=7.2, fontweight='bold', color=C_DARK_TEXT)

    draw_actor_simple(ax, 1.1, 3.3, 'Khách tham quan', 'Chọn VI / EN / FR', scale=0.8)

    draw_uml_box(ax, 2.8, 3.4, 1.8, 0.9, '1. Client Controller', 'Đọc mã phòng/cổ vật\nGiữ nguyên System UI')
    draw_uml_diamond(ax, 4.8, 3.4, 1.4, 1.0, 'Tra cứu Cache\nClient Memory?')

    draw_uml_box(ax, 7.2, 3.4, 1.9, 0.9, '2a. Cập nhật tức thì', 'Gán văn bản dịch <10ms\nCập nhật UI tham quan')

    # Tầng Server
    draw_uml_box(ax, 4.8, 1.3, 2.0, 0.9, '2b. GET /api/localize', 'Truy vấn bản dịch\ntheo mã & ngôn ngữ')
    draw_uml_box(ax, 7.6, 1.3, 2.0, 0.9, 'PostgreSQL CSDL', 'Bảng rooms, artifacts\nTrường name_en, desc_en')
    draw_uml_box(ax, 10.2, 1.3, 1.6, 0.9, 'Google NMT / AI', 'Dịch máy tự động\nFallback khi thiếu')

    # Trả về Client
    draw_uml_box(ax, 10.2, 3.4, 1.6, 0.9, 'Lưu Cache Client', 'Ghi key vào bộ nhớ\nCập nhật UI 360°')

    # Mũi tên
    draw_uml_arrow(ax, 1.45, 3.4, 1.9, 3.4, label='Chọn tiếng')
    draw_uml_arrow(ax, 3.7, 3.4, 4.1, 3.4)

    # Nhánh Cache Hit
    draw_uml_arrow(ax, 5.5, 3.4, 6.25, 3.4, label='[Cache Hit]')
    # Nhánh Cache Miss
    draw_uml_arrow(ax, 4.8, 2.9, 4.8, 1.75, label='[Cache Miss]')

    draw_uml_arrow(ax, 5.8, 1.3, 6.6, 1.3, label='Truy vấn DB')
    draw_uml_arrow(ax, 8.6, 1.3, 9.4, 1.3, label='Nếu trống')

    # Trả ngược từ Server lên Client Cache
    draw_uml_arrow(ax, 10.2, 1.75, 10.2, 2.95, label='Phản hồi JSON')
    draw_uml_arrow(ax, 9.4, 3.4, 8.15, 3.4)

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_10_translation_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_10_translation_flow.png")


# =============================================================================
# 4. HÌNH 3.11: SƠ ĐỒ HOẠT ĐỘNG SINH & LƯU TRỮ ĐỆM AUDIO TTS BẰNG MÃ BĂM MD5
# =============================================================================
def gen_fig_3_11():
    """Hinh 3.11: UML Activity Diagram Audio Hash Storage & Streaming TTS"""
    fig, ax = plt.subplots(figsize=(11.5, 5.2), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(5.75, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH SINH, LƯU TRỮ ĐỆM BĂM (HASH STORAGE) VÀ STREAMING AUDIO',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.75, 4.68, 'Tối ưu hóa 100% chi phí API và độ trễ phát bằng giải thuật băm MD5 duy nhất và lưu trữ tệp tĩnh trên đĩa',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    border = patches.Rectangle((0.4, 0.4), 10.7, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    draw_actor_simple(ax, 1.0, 2.6, 'Khách tham quan', 'Bấm nghe thuyết minh', scale=0.85)

    draw_uml_box(ax, 2.7, 2.7, 1.9, 1.0, '1. Bộ băm MD5', 'Key = MD5(văn bản +\nngôn ngữ + mã giọng)')
    draw_uml_diamond(ax, 4.8, 2.7, 1.4, 1.1, 'Tệp {Key}.mp3\ntồn tại trên đĩa?')

    # Nhánh Cache Hit (Nginx streaming)
    draw_uml_box(ax, 7.4, 3.6, 2.2, 0.95, '2a. Nginx Static Cache', 'HTTP 206 Partial Content\nCache-Control: Immutable')

    # Nhánh Cache Miss (Google TTS API)
    draw_uml_box(ax, 7.4, 1.5, 2.2, 0.95, '2b. Google Cloud TTS', 'Tổng hợp giọng đọc AI\nGhi đĩa tĩnh audio_cache/')

    # End Node: Trình phát Audio HTML5
    draw_uml_box(ax, 10.3, 2.7, 1.6, 1.0, '3. Trình phát Audio', 'HTML5 Audio Engine\nĐộ trễ < 30ms (Cache Hit)\nPhát mượt mà')

    # Mũi tên
    draw_uml_arrow(ax, 1.35, 2.7, 1.75, 2.7, label='Yêu cầu')
    draw_uml_arrow(ax, 3.65, 2.7, 4.1, 2.7)

    draw_uml_arrow(ax, 5.5, 3.1, 6.3, 3.6, label='[Có]: Cache Hit', label_side='top')
    draw_uml_arrow(ax, 8.5, 3.6, 9.5, 3.0, label='Stream MP3', label_side='top')

    draw_uml_arrow(ax, 5.5, 2.3, 6.3, 1.5, label='[Chưa]: Cache Miss', label_side='bottom')
    draw_uml_arrow(ax, 8.5, 1.5, 9.5, 2.4, label='Ghi đĩa & Stream', label_side='bottom')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_11_voice_tts_storage_pipeline.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_11_voice_tts_storage_pipeline.png")


# =============================================================================
# 5. HÌNH 3.13: SƠ ĐỒ HOẠT ĐỘNG QUẢN TRỊ & QUÉT QR TRƯNG BÀY (PHYGITAL)
# =============================================================================
def gen_fig_3_13():
    """Hinh 3.13: UML Activity Diagram Quan tri va quet QR trung bay Phygital"""
    fig, ax = plt.subplots(figsize=(12.0, 6.0), dpi=300)
    ax.set_xlim(0, 12.0); ax.set_ylim(0, 6.0); ax.axis('off')

    ax.text(6.0, 5.70, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH QUẢN TRỊ MÃ QR TRƯNG BÀY VÀ QUÉT TƯƠNG TÁC PHYGITAL TẠI BẢO TÀNG',
            ha='center', va='center', fontsize=9.2, fontweight='bold', color=C_DARK_TEXT)
    ax.text(6.0, 5.42, 'Kết nối hiện vật thực địa với không gian ảo: Tự động sinh mã QR -> Dán tại tủ kính -> Quét Camera jsQR -> Mở 3D / Tour 360°',
            ha='center', va='center', fontsize=7.4, color=C_MUTED_TEXT)

    # 2 Làn bơi: Admin CMS (y: 3.7 - 5.15) & Visitor Scanner (y: 0.35 - 3.55)
    ax.plot([0.4, 11.6], [3.6, 3.6], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    border = patches.Rectangle((0.4, 0.35), 11.2, 4.8, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    ax.text(0.6, 4.95, 'PHÂN HỆ QUẢN TRỊ CMS (TẠO HỒ SƠ, SINH MÃ VÀ IN ẤN THỰC ĐỊA)', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)
    ax.text(0.6, 3.35, 'PHÂN HỆ KHÁCH THAM QUAN THỰC ĐỊA (QUÉT QR TƯƠNG TÁC PHYGITAL)', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)

    # Tầng Admin
    draw_actor_simple(ax, 1.1, 4.25, 'Quản trị viên', 'Tạo phòng / cổ vật', scale=0.75)
    draw_uml_box(ax, 2.9, 4.35, 1.9, 0.8, '1. Tự động sinh QR', 'Deep link ?artifact={id}\nChuẩn ISO/IEC 18004')
    draw_uml_box(ax, 5.3, 4.35, 1.9, 0.8, '2. Xuất file ảnh QR', 'Độ phân giải 300 DPI\nIn ấn bảng chỉ dẫn')
    draw_uml_box(ax, 8.0, 4.35, 2.2, 0.8, '3. Dán QR tại thực địa', 'Dán trước cửa 18 phòng &\nTủ kính 17 bảo vật quốc gia')

    draw_uml_arrow(ax, 1.45, 4.35, 1.95, 4.35, label='Lưu hồ sơ')
    draw_uml_arrow(ax, 3.85, 4.35, 4.35, 4.35, label='Xuất vector')
    draw_uml_arrow(ax, 6.25, 4.35, 6.9, 4.35, label='In & Dán tem')

    # Tầng Khách tham quan
    draw_actor_simple(ax, 1.1, 1.9, 'Khách tham quan', 'Tại bảo tàng thực địa', scale=0.75)
    draw_uml_box(ax, 2.9, 2.0, 1.9, 0.9, '4. Mở Quét QR', 'QRScannerModal Web\nAudio Beep 880Hz')
    draw_uml_box(ax, 5.2, 2.0, 1.8, 0.9, '5. Giải mã jsQR', 'Đa tỷ lệ 1000/600px\nKhử bóng lóa mặt kính')

    draw_uml_diamond(ax, 7.3, 2.0, 1.3, 1.0, 'Phân loại\nmã QR?')

    draw_uml_box(ax, 9.8, 2.8, 2.2, 0.8, 'Mở Modal Cổ vật 3D', 'Xoay 360° mô hình .GLB\nPhát Audio thuyết minh')
    draw_uml_box(ax, 9.8, 1.8, 2.2, 0.8, 'Mở Gian phòng Tour 360°', 'Chuyển cảnh không gian 360°\nĐịnh vị trên Mini-map')
    draw_uml_box(ax, 7.3, 0.75, 2.3, 0.5, 'Mã vé (TKT-): Hướng dẫn ra cổng', '')

    draw_uml_arrow(ax, 1.45, 2.0, 1.95, 2.0, label='Mở Scanner')
    draw_uml_arrow(ax, 3.85, 2.0, 4.3, 2.0, label='Quét tem')
    draw_uml_arrow(ax, 6.1, 2.0, 6.65, 2.0)

    # Dán tem thực tế kết nối xuống Camera
    ax.annotate('', xy=(2.9, 2.45), xytext=(8.0, 3.95),
                arrowprops=dict(arrowstyle='->', color='#475569', lw=1.1, linestyle=':',
                                connectionstyle='arc3,rad=-0.18', mutation_scale=10), zorder=5)
    ax.text(5.5, 3.0, 'Khách hướng Camera vào tem QR trên tủ kính thực tế',
            ha='center', va='center', fontsize=6.8, fontstyle='italic', color=C_MUTED_TEXT, zorder=8)

    draw_uml_arrow(ax, 7.95, 2.3, 8.7, 2.8, label='[Cổ vật]', label_side='top')
    draw_uml_arrow(ax, 7.95, 1.8, 8.7, 1.8, label='[Phòng]', label_side='top')
    draw_uml_arrow(ax, 7.3, 1.5, 7.3, 1.0, label='[Mã vé]', label_side='right')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_13_qr_exhibition_activity.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_13_qr_exhibition_activity.png")


# =============================================================================
# 6. HÌNH 3.7: SƠ ĐỒ HOẠT ĐỘNG SOÁT VÉ QR CAMERA VÀ CHỐNG GIAN LẬN
# =============================================================================
def gen_fig_3_7():
    """Hinh 3.7: UML Activity Diagram Soat ve QR Camera truc tiep va chong gian lan"""
    fig, ax = plt.subplots(figsize=(11.5, 5.0), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.0); ax.axis('off')

    ax.text(5.75, 4.75, 'SƠ ĐỒ HOẠT ĐỘNG: SOÁT VÉ ĐIỆN TỬ VÀ KIỂM SOÁT VÀO CỔNG THỜI GIAN THỰC',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.75, 4.48, 'Giải mã khung hình HTML5-QRCode, đối soát chữ ký số SHA-256, chuyển trạng thái USED và chống gian lận vé',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    # 2 Làn: Nhân viên (y: 2.3 - 4.15) & Backend (y: 0.35 - 2.2)
    ax.plot([0.4, 11.1], [2.25, 2.25], color='#CBD5E1', lw=1.0, linestyle='--', zorder=2)
    border = patches.Rectangle((0.4, 0.35), 10.7, 3.8, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    ax.text(0.6, 3.95, 'LÀN 1: NHÂN VIÊN SOÁT VÉ TẠI CỔNG (CAMERA SCANNER & GIAO DIỆN KIỂM SOÁT)', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)
    ax.text(0.6, 2.05, 'LÀN 2: MÁY CHỦ HỆ THỐNG BACKEND & CSDL POSTGRESQL (XÁC THỰC VÀ GHI LOG)', fontsize=7.0, fontweight='bold', color=C_DARK_TEXT)

    # Initial Node
    ax.plot(0.8, 3.1, 'o', color='#0F172A', markersize=9, zorder=6)

    draw_uml_box(ax, 2.0, 3.1, 1.8, 0.9, '1. Mở Camera Scanner', 'HTML5-QRCode\nKhung ngắm quét mã vé')
    draw_uml_box(ax, 4.0, 3.1, 1.8, 0.9, '2. Quét mã QR vé', 'Giải mã payload AES-256\nTrích xuất TKT-xxxxxx')

    draw_uml_box(ax, 4.0, 1.2, 1.8, 0.9, '3. API Đối soát', 'POST /validate-qr\nKiểm tra chữ ký số')
    draw_uml_box(ax, 6.2, 1.2, 1.8, 0.9, '4. Kiểm tra CSDL', 'Kiểm tra ngày, giờ\nstatus == PAID ?')

    draw_uml_diamond(ax, 8.2, 1.2, 1.3, 0.95, 'Hợp lệ & Chưa\nsử dụng?')

    draw_uml_box(ax, 10.2, 1.2, 1.7, 0.9, '5. Ghi nhận USED', 'UPDATE status = USED\nGhi log checked_in_at')
    draw_uml_box(ax, 10.2, 3.1, 1.7, 0.9, '6. Mở Barie đón khách', 'Tích xanh + Âm báo Bíp\nBắn SSE sang khách')

    draw_uml_box(ax, 8.2, 3.1, 1.7, 0.9, 'Cảnh báo Gian lận', 'Vé giả / Đã dùng / Hết hạn\nÂm báo lỗi đỏ từ chối')

    # Mũi tên
    draw_uml_arrow(ax, 0.88, 3.1, 1.1, 3.1)
    draw_uml_arrow(ax, 2.9, 3.1, 3.1, 3.1)
    draw_uml_arrow(ax, 4.0, 2.65, 4.0, 1.65, label='Gọi API')
    draw_uml_arrow(ax, 4.9, 1.2, 5.3, 1.2)
    draw_uml_arrow(ax, 7.1, 1.2, 7.55, 1.2)

    # Nhánh Đúng
    draw_uml_arrow(ax, 8.85, 1.2, 9.35, 1.2, label='[Đúng]')
    draw_uml_arrow(ax, 10.2, 1.65, 10.2, 2.65, label='Mở cổng')

    # Nhánh Sai
    draw_uml_arrow(ax, 8.2, 1.68, 8.2, 2.65, label='[Sai / Đã dùng]')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_activity_ticket_validation.png"), bbox_inches='tight')
    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_7_sequence_qr_scan.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_7_activity_ticket_validation.png")


# =============================================================================
# 7. HÌNH 3.12: SƠ ĐỒ HOẠT ĐỘNG XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH
# =============================================================================
def gen_fig_3_12():
    """Hinh 3.12: UML Activity Diagram Xuat bao cao thong ke Excel da bang tinh"""
    fig, ax = plt.subplots(figsize=(11.5, 5.2), dpi=300)
    ax.set_xlim(0, 11.5); ax.set_ylim(0, 5.2); ax.axis('off')

    ax.text(5.75, 4.95, 'SƠ ĐỒ HOẠT ĐỘNG: QUY TRÌNH TỔNG HỢP VÀ KẾT XUẤT BÁO CÁO EXCEL ĐA BẢNG TÍNH',
            ha='center', va='center', fontsize=9.5, fontweight='bold', color=C_DARK_TEXT)
    ax.text(5.75, 4.68, 'Trích xuất số liệu vé, doanh thu, lưu lượng tham quan và định dạng bảng tính tự động bằng thư viện exceljs',
            ha='center', va='center', fontsize=7.6, color=C_MUTED_TEXT)

    border = patches.Rectangle((0.4, 0.4), 10.7, 4.0, facecolor='#FFFFFF', edgecolor='#CBD5E1', lw=1.0, zorder=1)
    ax.add_patch(border)

    draw_actor_simple(ax, 1.0, 2.6, 'Quản trị viên', 'Bấm "Xuất file Excel"', scale=0.85)

    draw_uml_box(ax, 2.8, 2.7, 1.8, 1.0, '1. Gửi yêu cầu', 'GET /api/reports/export\nKèm bộ lọc thời gian')
    draw_uml_box(ax, 5.1, 2.7, 2.0, 1.0, '2. Truy vấn PostgreSQL', 'JOIN bảng orders, tickets,\nrooms, artifacts, logs')
    draw_uml_box(ax, 7.7, 2.7, 2.2, 1.0, '3. exceljs Workbook', 'Tạo 3 Sheet chuyên biệt:\n• Tổng quan doanh thu\n• Danh sách chi tiết vé\n• Thống kê gian phòng')
    draw_uml_box(ax, 10.3, 2.7, 1.6, 1.0, '4. Tải file .xlsx', 'HTTP Attachment\nStream trực tiếp\nVề máy Admin')

    draw_uml_arrow(ax, 1.45, 2.7, 1.9, 2.7, label='Bấm xuất')
    draw_uml_arrow(ax, 3.7, 2.7, 4.1, 2.7, label='Query DB')
    draw_uml_arrow(ax, 6.1, 2.7, 6.6, 2.7, label='Format Sheet')
    draw_uml_arrow(ax, 8.8, 2.7, 9.5, 2.7, label='Tải file')

    fig.savefig(os.path.join(DIAGRAMS_DIR, "hinh_3_12_excel_export_flow.png"), bbox_inches='tight')
    plt.close(fig)
    print("-> Da tao thanh cong: hinh_3_12_excel_export_flow.png")


# =============================================================================
# CHẠY TẤT CẢ CÁC HÀM CẢI TIẾN
# =============================================================================
if __name__ == '__main__':
    print("=== DANG TAO CAC SO DO HOC THUAT CHUAN MINIMALIST UML ===")
    gen_fig_4_5()
    gen_fig_3_6()
    gen_fig_3_10()
    gen_fig_3_11()
    gen_fig_3_13()
    gen_fig_3_7()
    gen_fig_3_12()
    print("=== HOAN TAT TOAN BO CAC SO DO! ===")
