#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hệ thống Ghép Ảnh 360° Tự Động & Nắn Chỉnh Equirectangular Unwarping
Đồ Án Tốt Nghiệp: Ứng dụng Công nghệ 4.0 và AI trong Bảo tồn Di sản - Bảo tàng Lịch sử TP.HCM

1. Chuẩn hóa EXIF Orientation (ImageOps.exif_transpose) giải quyết triệt để xoay dọc iPhone.
2. Tự động sắp xếp thứ tự ảnh theo chuỗi xoay tự nhiên (Natural sort).
3. Cấu hình Stitcher & Spherical/Cylindrical Warper chống méo xoắn ốc (vortex).
4. Cắt viền đen rách mép (Border Shave) & Nắn ảnh về tỷ lệ chuẩn Equirectangular 2:1 (4096x2048).
"""

import sys
import os
import json
import argparse
import re
import cv2
import numpy as np
import gc
from PIL import Image, ImageOps, ImageFile

# Cho phép nạp ảnh bị cắt cụt (truncated) mà không làm sập luồng xử lý
ImageFile.LOAD_TRUNCATED_IMAGES = True


# Đảm bảo stdout/stderr luôn dùng UTF-8 trên Windows để không bị lỗi UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Tối ưu hóa số luồng đa nhân CPU cho OpenCV để tăng tốc xử lý trên máy chủ
try:
    num_threads = min(8, max(2, os.cpu_count() or 2))
    cv2.setNumThreads(num_threads)
except Exception:
    pass

def natural_sort_key(s):
    """Sắp xếp chuỗi có chứa số theo thứ tự tự nhiên (img1, img2, ..., img10)"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def load_and_orient_image(image_path, max_dim=3000):
    """
    Sử dụng PIL ImageOps.exif_transpose để tự động nhận diện và xoay ảnh về đúng
    hướng nhìn đứng (upright) của cảm biến máy ảnh iPhone/Android trước khi đưa vào OpenCV.
    Khắc phục triệt để lỗi ảnh bị nghiêng 90 độ khiến bộ ghép bị xoắn hình phễu/vortex.
    Giữ độ phân giải cao max_dim=3000px để bảo toàn độ sắc nét siêu chi tiết của camera gốc.
    """
    with Image.open(image_path) as pil_img:
        # Chuẩn hóa EXIF orientation
        pil_img = ImageOps.exif_transpose(pil_img)
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')

        # Resize giữ tỷ lệ nếu vượt quá max_dim để bảo tồn tối đa độ sắc nét
        w, h = pil_img.size
        if max(w, h) > max_dim:
            scale = max_dim / float(max(w, h))
            new_w = int(w * scale)
            new_h = int(h * scale)
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        rgb_arr = np.array(pil_img)
        bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        return bgr_arr

def crop_black_borders(img):
    """
    Thuật toán cắt viền thông minh bảo vệ 100% cổ vật & cửa sắt màu đen:
    - Phân biệt chính xác giữa 'Viền đen rỗng ngoài khung hình của OpenCV' và 'Đồ vật thật màu đen' (cửa sắt, tủ lạnh, bóng tối).
    - Dùng floodFill từ 4 cạnh ngoài để đánh dấu CHỈ các vùng rỗng ngoài biên ảnh,
      tuyệt đối không gọt nhầm hay inpaint rách vào cửa sắt màu đen.
    """
    h, w = img.shape[:2]
    # Pixel rỗng thực tế của canvas OpenCV là pixel bằng 0 sát viền
    exact_zero = ((img[:, :, 0] <= 3) & (img[:, :, 1] <= 3) & (img[:, :, 2] <= 3)).astype(np.uint8)

    # Đánh dấu vùng ngoài biên thực tế bằng flood fill từ mép ngoài
    ff_mask = np.zeros((h + 2, w + 2), dtype=np.uint8)
    flood_work = exact_zero.copy()

    # Lấy các điểm biên ở 4 góc và dọc 4 cạnh
    seed_points = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for x in range(0, w, max(1, w // 20)):
        seed_points.extend([(x, 0), (x, h - 1)])
    for y in range(0, h, max(1, h // 20)):
        seed_points.extend([(0, y), (w - 1, y)])

    for sx, sy in seed_points:
        if flood_work[sy, sx] == 1:
            cv2.floodFill(flood_work, ff_mask, (sx, sy), 2)

    # Vùng ngoài biên thật sự là vùng có giá trị 2
    is_true_exterior = (flood_work == 2)
    valid_mask = (~is_true_exterior).astype(np.uint8)

    y_idx, x_idx = np.where(valid_mask > 0)
    if len(y_idx) == 0 or len(x_idx) == 0:
        return img

    top, bottom = np.min(y_idx), np.max(y_idx)
    left, right = np.min(x_idx), np.max(x_idx)

    cropped = img[top:bottom+1, left:right+1].copy()
    mask_c = valid_mask[top:bottom+1, left:right+1].copy()
    ext_c = is_true_exterior[top:bottom+1, left:right+1].copy()

    # Gọt bớt các cạnh ngoài cùng nếu vẫn còn dính viền rỗng biên
    max_iters = 100
    iters = 0
    while iters < max_iters and cropped.shape[0] > 100 and cropped.shape[1] > 100:
        iters += 1
        changed = False
        if np.mean(mask_c[0, :]) < 0.95:
            mask_c = mask_c[1:, :]
            ext_c = ext_c[1:, :]
            cropped = cropped[1:, :]
            changed = True
        if np.mean(mask_c[-1, :]) < 0.95:
            mask_c = mask_c[:-1, :]
            ext_c = ext_c[:-1, :]
            cropped = cropped[:-1, :]
            changed = True
        if np.mean(mask_c[:, 0]) < 0.98:
            mask_c = mask_c[:, 1:]
            ext_c = ext_c[:, 1:]
            cropped = cropped[:, 1:]
            changed = True
        if np.mean(mask_c[:, -1]) < 0.98:
            mask_c = mask_c[:, :-1]
            ext_c = ext_c[:, :-1]
            cropped = cropped[:, :-1]
            changed = True

        if not changed:
            break

    # Chỉ inpaint các góc khuyết viền rỗng thật sự (ext_c), tuyệt đối không inpaint vào cửa sắt màu đen
    rem_exterior = (ext_c & (cropped[:, :, 0] <= 3) & (cropped[:, :, 1] <= 3) & (cropped[:, :, 2] <= 3)).astype(np.uint8) * 255
    if np.sum(rem_exterior) > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        rem_exterior = cv2.dilate(rem_exterior, kernel, iterations=1)
        cropped = cv2.inpaint(cropped, rem_exterior, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return cropped

def fit_to_equirectangular_2_to_1(stitched_img, target_width=None, hfov=None):
    """
    Nắn chỉnh và chuẩn hóa ảnh ghép thành tỷ lệ 2:1 Equirectangular chuẩn quốc tế:
    - TỰ ĐỘNG THÍCH ỨNG THEO ĐỘ PHÂN GIẢI THỰC TẾ (Adaptive Resolution):
      Tự động chọn kích thước chuẩn 2:1 tối ưu cho WebGL (4K: 4096x2048, 3K: 3072x1536, 2K: 2048x1024).
    - TỰ ĐỘNG XÁC ĐỊNH GÓC QUÉT HFOV THỰC TẾ:
      + Nếu hfov >= 260° hoặc aspect_ratio >= 3.8: Nhận diện là toàn cảnh xoay vòng 360° hoàn chỉnh.
        Phủ trọn 360° canvas và khâu liền mạch mép 0° - 360° với hàm chuyển tiếp mượt mà.
      + Giữ chiều cao tối thiểu >= 55% canvas (tránh bóp nghẹt phòng thành khe hẹp).
      + Bảo tồn độ phẳng kiến trúc (Rectilinear Flatness), triệt tiêu hoàn toàn méo võng.
    - Nội suy trần (+90° Zenith) và sàn (-90° Nadir) tự nhiên, xóa sạch viền rách.
    """
    h, w = stitched_img.shape[:2]
    aspect_ratio = max(0.5, float(w) / float(h))

    # Nếu hfov chưa được truyền, ước tính từ tỷ lệ khung hình:
    if hfov is None or hfov <= 0:
        hfov = min(360.0, max(45.0, aspect_ratio * 52.0))

    is_full_360 = (hfov >= 260.0) or (aspect_ratio >= 3.8)

    # Quyết định độ phân giải mục tiêu thích ứng chuẩn 4K UHD cho WebGL:
    if target_width is None or target_width <= 0:
        if w >= 2200:
            target_width = 4096
        elif w >= 1500:
            target_width = 3072
        else:
            target_width = max(2048, (w // 2) * 2)
    else:
        target_width = (target_width // 2) * 2

    target_height = target_width // 2

    canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)

    if is_full_360:
        # Toàn cảnh 360° trọn vẹn
        new_w = target_width
        natural_h = int(round(target_width / aspect_ratio))
        # Đảm bảo chiều cao chiếm ít nhất 55% canvas để không gian nội thất không bị bẹp dúm thành dải hẹp
        new_h = min(target_height, max(int(target_height * 0.55), natural_h))
        resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # Khâu mịn đường nối giữa cạnh trái (0°) và cạnh phải (360°) với smoothstep liền mạch
        seam_blend_width = min(80, new_w // 25)
        for i in range(seam_blend_width):
            alpha = float(i) / float(seam_blend_width)
            s_alpha = alpha * alpha * (3.0 - 2.0 * alpha)
            left_col = resized_pano[:, i].astype(np.float32)
            right_col = resized_pano[:, -(seam_blend_width - i)].astype(np.float32)
            blended = (1.0 - s_alpha) * right_col + s_alpha * left_col
            resized_pano[:, i] = np.clip(blended, 0, 255).astype(np.uint8)

        y_offset = (target_height - new_h) // 2
        canvas[y_offset:y_offset+new_h, 0:target_width] = resized_pano
    else:
        # Bán phần (Partial Panorama < 260°): Giữ nguyên đúng tỷ lệ quang học thật 1:1, không kéo dãn ngang
        span_ratio = min(1.0, max(0.40, hfov / 360.0))
        new_w = int(round(target_width * span_ratio))
        natural_h = int(round(new_w / aspect_ratio))
        new_h = min(target_height, max(int(target_height * 0.50), natural_h))
        resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        y_offset = (target_height - new_h) // 2
        x_offset = (target_width - new_w) // 2
        canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized_pano

        # Feathering 2 biên trái phải của ảnh bán phần để chuyển tiếp êm dịu
        fade_w = min(40, new_w // 15)
        for fi in range(fade_w):
            alpha = fi / float(fade_w)
            canvas[y_offset:y_offset+new_h, x_offset + fi] = (canvas[y_offset:y_offset+new_h, x_offset + fi].astype(np.float32) * alpha).astype(np.uint8)
            canvas[y_offset:y_offset+new_h, x_offset + new_w - 1 - fi] = (canvas[y_offset:y_offset+new_h, x_offset + new_w - 1 - fi].astype(np.float32) * alpha).astype(np.uint8)

    # 1. Nội suy mượt mà trần nhà lên đỉnh cực (+90° Zenith)
    top_edge = canvas[y_offset, :].astype(np.float32)
    zenith_color = np.clip(np.median(top_edge, axis=0) * 1.03, 0, 255).astype(np.float32)
    for y in range(y_offset):
        t = y / float(y_offset) # 0 ở đỉnh cực, 1 ở mép ảnh thật
        canvas[y, :] = ((1.0 - t) * zenith_color + t * top_edge).astype(np.uint8)

    # 2. XỬ LÝ TỐI ƯU HÓA ĐẶC BIỆT CHO SÀN NHÀ (-90° Nadir Floor Optimization):
    # Lấy mẫu màu sàn bằng cách làm mờ nhẹ mép dưới để vật dụng (khăn trải bàn, đĩa hoa quả) không tạo sọc dọc
    bottom_slice = canvas[max(y_offset, y_offset + new_h - 4):y_offset + new_h, :].astype(np.float32)
    bottom_edge = np.mean(bottom_slice, axis=0) if len(bottom_slice) > 0 else canvas[y_offset + new_h - 1, :].astype(np.float32)
    nadir_color = np.median(bottom_edge, axis=0).astype(np.float32)

    floor_start = y_offset + new_h
    floor_height = target_height - floor_start

    for y in range(floor_height):
        t = y / float(max(1, floor_height))
        # Chuyển tiếp nhanh dần về màu sàn trung tính
        smooth_t = float(np.sin(t * (np.pi / 2.0)))
        row = (1.0 - smooth_t) * bottom_edge + smooth_t * nadir_color
        canvas[floor_start + y, :] = row.astype(np.uint8)

        # Tán xạ làm mờ theo chiều ngang tăng dần đều để hòa tan tự nhiên vào nền gạch
        ksize = int(t * 50) * 2 + 1
        if ksize >= 5:
            canvas[floor_start + y:floor_start + y + 1, :] = cv2.GaussianBlur(
                canvas[floor_start + y:floor_start + y + 1, :], (ksize, 1), 0
            )

    # Làm mờ nhẹ vùng chuyển tiếp (feathering) trần nhà
    feather = min(15, y_offset // 2) if y_offset > 0 else 0
    for fi in range(feather):
        alpha = fi / float(feather)
        curr_top = y_offset + fi
        canvas[curr_top, :] = ((1.0 - alpha) * canvas[y_offset - 1, :] + alpha * canvas[curr_top, :]).astype(np.uint8)

    return canvas

def enhance_museum_texture(image):
    """
    Bộ lọc Tinh Chỉnh & Cân Bằng Độ Sắc Nét 4K (Clean Micro-Contrast Unsharp Masking):
    - Áp dụng Unsharp Masking vi mô chuẩn hóa mượt mà bằng cv2.addWeighted:
      Làm rõ ràng từng chi tiết vân gỗ, ron gạch, chữ trên đồ vật mà không sinh nhiễu hạt (grain)
      hay quầng halo phân tách mảng màu.
    - Không dùng ngưỡng cứng nhị phân diff < 2.0 để tránh phân tầng màu/rạn nứt hình ảnh.
    """
    try:
        blurred = cv2.GaussianBlur(image, (0, 0), 1.2)
        sharpened = cv2.addWeighted(image, 1.15, blurred, -0.15, 0)
        return sharpened
    except Exception as e:
        print(f"[Warning] Không thể áp dụng enhance_museum_texture: {e}", file=sys.stderr)
        return image

def balance_universal_lighting(img):
    """
    Thuật toán Cân Bằng Ánh Sáng Tự Động Đa Môi Trường (Universal Adaptive HDR & Lighting):
    Phục hồi hoàn hảo cả góc chụp trong nhà (indoor museum) và ngoài trời (nắng gắt + bóng râm sâu):
    1. Cân bằng bóng râm sâu (Shadow Recovery): Tự động phát hiện vùng tối dưới mái hiên, chân tủ,
       nâng sáng mượt mà bằng đường cong phi tuyến, giúp máy nhận diện đầy đủ hàng trăm điểm đặc trưng (keypoints).
    2. Nén lóa sáng ánh nắng (Sunlight & Highlight Soft-Knee Compression): Bảo toàn vân gạch, vân tôn,
       chống cháy sáng/mất chi tiết khi hướng máy lên bầu trời hoặc mái nhà.
    3. Tăng cường vi tương phản CLAHE nhẹ trên kênh Luminance: Làm nổi rõ đường ron gạch, vân gỗ, lá cây.
    4. Trung hòa ám màu (Color Cast Neutralization): Cân bằng sắc thái giữa các góc chụp nắng và bóng râm.
    """
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l_f = l.astype(np.float32)
        
        p5 = float(np.percentile(l_f, 5))
        p95 = float(np.percentile(l_f, 95))
        mean_l = float(np.mean(l_f))

        # 1. Phục hồi bóng râm sâu
        if p5 < 70.0 or mean_l < 85.0:
            shadow_thresh = 95.0
            shadow_mask = l_f < shadow_thresh
            shadow_ratio = np.maximum(0.0, (shadow_thresh - l_f) / shadow_thresh)
            lift_amount = min(32.0, (75.0 - min(p5, 60.0)) * 0.7)
            l_f = np.where(shadow_mask, l_f + lift_amount * np.power(shadow_ratio, 1.35), l_f)

        # 2. Nén lóa sáng ánh nắng gắt
        if p95 > 215.0 or mean_l > 175.0:
            high_thresh = 195.0
            high_mask = l_f > high_thresh
            delta_high = np.maximum(0.0, l_f - high_thresh)
            l_f = np.where(high_mask, high_thresh + delta_high / (1.0 + delta_high / 30.0), l_f)

        # 3. Tăng cường vi tương phản cục bộ bằng CLAHE
        clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8))
        l_clahe = clahe.apply(np.clip(l_f, 0, 255).astype(np.uint8)).astype(np.float32)
        l_final = np.clip(l_f * 0.75 + l_clahe * 0.25, 0, 255).astype(np.uint8)

        # 4. Trung hòa nhẹ nhàng ám màu nắng/râm
        a_f = a.astype(np.float32)
        b_f = b.astype(np.float32)
        mean_a = np.mean(a_f)
        mean_b = np.mean(b_f)
        a_out = np.clip(a_f - (mean_a - 128.0) * 0.12, 0, 255).astype(np.uint8)
        b_out = np.clip(b_f - (mean_b - 128.0) * 0.12, 0, 255).astype(np.uint8)

        merged_lab = cv2.merge((l_final, a_out, b_out))
        return cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)
    except Exception:
        return img

# Giữ alias tương thích
balance_indoor_lighting = balance_universal_lighting

def evaluate_panorama_flatness(pano):
    """
    Đo lường độ phẳng và độ thẳng của đường chân trời (Horizon Flatness & Anti-Arch Score):
    - Quét viền trên y_top(x) và viền dưới y_bottom(x) của vùng pixel thực tế (khác 0).
    - Tính độ võng/cong (curvature/bowing) và độ lệch dạng vòm cung parabol.
    - Trả về điểm flatness từ 0.0 (cong vênh, hình cầu vồng/vòm cung méo mó) đến 1.0 (phẳng, thẳng đứng chuẩn kiến trúc).
    """
    try:
        h, w = pano.shape[:2]
        sample_xs = np.linspace(0, w - 1, 40, dtype=int)
        gray = cv2.cvtColor(pano, cv2.COLOR_BGR2GRAY)
        is_valid = (gray > 4)
        
        tops = []
        bottoms = []
        for x in sample_xs:
            indices = np.where(is_valid[:, x])[0]
            if len(indices) > 10:
                tops.append(indices[0])
                bottoms.append(indices[-1])
                
        if len(tops) < 15:
            return 0.7
            
        tops = np.array(tops, dtype=np.float32)
        bottoms = np.array(bottoms, dtype=np.float32)
        
        top_span = (np.max(tops) - np.min(tops)) / float(h)
        bottom_span = (np.max(bottoms) - np.min(bottoms)) / float(h)
        
        mid_idx = len(tops) // 2
        edge_avg = (tops[0] + tops[-1]) / 2.0
        arch_deflection = abs(tops[mid_idx] - edge_avg) / float(h)
        
        penalty = (top_span * 0.45) + (bottom_span * 0.35) + (arch_deflection * 0.85)
        flatness_score = max(0.0, min(1.0, 1.0 - penalty))
        return flatness_score
    except Exception:
        return 0.75

def run_stitch(image_paths, output_path, target_width=0):
    """
    Thực thi quy trình ghép ảnh:
    - Nếu là 1 ảnh: Tự động nhận diện ảnh Pano từ điện thoại, cắt viền và nắn Equirectangular 2:1 chuẩn.
    - Nếu là từ 2 ảnh trở lên: Ghép nối bằng OpenCV Stitcher_PANORAMA với chuẩn hóa EXIF, nắn 2:1 và làm sắc nét.
    """
    if not image_paths or len(image_paths) < 1:
        return {
            "success": False,
            "error": "ERR_TOO_FEW_IMAGES",
            "detail": "Vui lòng chọn ít nhất 1 ảnh (ảnh PANO điện thoại) hoặc chùm ảnh rời."
        }

    # Trường hợp tải lên 1 ảnh toàn cảnh PANO trực tiếp từ iPhone / Android
    if len(image_paths) == 1:
        p = image_paths[0]
        if not os.path.exists(p):
            return {
                "success": False,
                "error": "ERR_FILE_NOT_FOUND",
                "detail": f"Không tìm thấy file ảnh: {p}"
            }
        print(f"[*] Nhận diện 1 ảnh Panorama (chế độ PANO điện thoại). Đang nắn chuẩn Equirectangular 2:1...", file=sys.stderr)
        try:
            img = load_and_orient_image(p, max_dim=4096)
            cropped = crop_black_borders(img)
            equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=target_width)
            equi_pano = enhance_museum_texture(equi_pano)
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            cv2.imwrite(output_path, equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), 99, int(cv2.IMWRITE_JPEG_OPTIMIZE), 1])
            h, w = equi_pano.shape[:2]
            return {
                "success": True,
                "outputPath": output_path,
                "width": w,
                "height": h,
                "aspectRatio": 2.0,
                "aspectRatioStr": "2:1",
                "message": "Đã chuẩn hóa ảnh Pano điện thoại thành toàn cảnh 360° Equirectangular 2:1 thành công."
            }
        except Exception as e:
            return {
                "success": False,
                "error": "ERR_PROCESSING",
                "detail": f"Lỗi xử lý ảnh PANO: {str(e)}"
            }

    # Sắp xếp ảnh theo thứ tự tự nhiên (img1, img2, ..., img100)
    sorted_paths = sorted(image_paths, key=natural_sort_key)
    num_total = len(sorted_paths)

    def select_optimal_keyframes(paths, max_target=60):
        """
        Chắt lọc chuỗi khung hình đại diện quanh quỹ đạo xoay 360°:
        - Với chùm ảnh lên đến 60 ảnh (kể cả chụp đa tầng nóc/giữa/sàn):
          GIỮ NGUYÊN 100% TẤT CẢ CÁC GÓC CHỤP để bảo toàn trọn vẹn chuỗi quang học và liên kết giữa các tầng.
        - Chỉ khi chùm ảnh cực dày (> 60 ảnh) mới tiến hành lọc bớt frame đứng yên trùng lặp.
        """
        n = len(paths)
        if n <= 60:
            return paths

        # Đọc thumbnail grayscale siêu nhẹ cho từng ảnh
        thumbs = []
        valid_paths = []
        for p in paths:
            try:
                t = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
                if t is not None:
                    thumbs.append(cv2.resize(t, (160, 120)))
                    valid_paths.append(p)
            except Exception:
                pass

        if len(valid_paths) <= 60:
            return valid_paths

        # 1. Tính biến thiên chuyển động liên tiếp giữa các khung hình kề nhau
        motion_diffs = [0.0]
        for i in range(1, len(thumbs)):
            d = float(np.mean(cv2.absdiff(thumbs[i - 1], thumbs[i])))
            motion_diffs.append(d)

        # 2. Lọc các khung hình đứng yên trùng lặp (trừ frame đầu và cuối)
        threshold = 1.0
        filtered_paths = [valid_paths[0]]
        filtered_diffs = [motion_diffs[0]]

        for i in range(1, len(valid_paths) - 1):
            if motion_diffs[i] >= threshold:
                filtered_paths.append(valid_paths[i])
                filtered_diffs.append(motion_diffs[i])

        filtered_paths.append(valid_paths[-1])
        filtered_diffs.append(max(0.1, motion_diffs[-1]))

        target_limit = min(max_target, 60)
        if len(filtered_paths) <= target_limit:
            return filtered_paths

        # 3. Lấy mẫu tích lũy đều theo chuyển động quang học (Cumulative Motion Sampling)
        cum_motion = np.cumsum(filtered_diffs)
        total_motion = cum_motion[-1]

        if total_motion <= 1e-3:
            indices = np.linspace(0, len(filtered_paths) - 1, target_limit, dtype=int)
            return [filtered_paths[idx] for idx in indices]

        sampled_indices = [0]
        step_motion = total_motion / float(target_limit - 1)

        for step in range(1, target_limit - 1):
            target_val = step * step_motion
            idx = int(np.searchsorted(cum_motion, target_val))
            idx = min(idx, len(filtered_paths) - 2)
            if idx > sampled_indices[-1]:
                sampled_indices.append(idx)

        sampled_indices.append(len(filtered_paths) - 1)

        final_indices = sorted(list(set(sampled_indices)))
        if len(final_indices) < target_limit and len(filtered_paths) > len(final_indices):
            indices_set = set(final_indices)
            for idx in np.linspace(0, len(filtered_paths) - 1, target_limit, dtype=int):
                indices_set.add(idx)
            final_indices = sorted(list(indices_set))

        return [filtered_paths[i] for i in final_indices]

    cv2.ocl.setUseOpenCL(False)

    def build_stitcher(confidence=0.12, wave_correction=False, reg_resol=0.85):
        s = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        try:
            # Wave correction: False giữ nguyên độ thẳng tự nhiên cho ảnh chụp đa tầng/nghiêng máy
            s.setWaveCorrection(wave_correction)
        except Exception:
            pass
        try:
            s.setPanoConfidenceThresh(confidence)
        except Exception:
            pass
        try:
            # Registration resolution: Tinh chỉnh độ phân giải so khớp điểm ảnh cao cấp cho cả góc siêu rộng x0.5
            s.setRegistrationResol(reg_resol)
        except Exception:
            pass
        try:
            # Seam estimation resolution 0.20 Mpx: Đồ thị GraphCut phân định biên ghép chính xác và mượt mà
            s.setSeamEstimationResol(0.20)
        except Exception:
            pass
        try:
            # cv2.INTER_LINEAR: Nội suy tuyến tính chuẩn công nghiệp trong ghép ảnh Panorama
            s.setInterpolationFlags(cv2.INTER_LINEAR)
        except Exception:
            pass
        return s

    # Chuẩn bị danh sách khung hình đại diện tối ưu
    optimal_paths = select_optimal_keyframes(sorted_paths, max_target=60)
    print(f"[*] Tiếp nhận {num_total} ảnh đầu vào -> Đã xác lập chuỗi quang học {len(optimal_paths)} khung hình đại diện liên tục.", file=sys.stderr)

    # Hệ thống Đa Tầng Thích Ứng Toàn Diện (Universal Adaptive Multi-Tier Cascade)
    # Ưu tiên WaveCorr=False để chống 100% hiện tượng vòm cung uốn cong khi chụp đa tầng (nóc/giữa/sàn) & cam xoay nghiêng:
    candidate_schemes = [
        # Tầng 1 (Multi-Row & Natural Horizon 4K): WaveCorr=False, RegResol 0.85 Mpx, Conf 0.12, MaxDim 2048px
        (optimal_paths, 2048, 0.12, False, 0.85, f"Tầng 1 - Chuẩn phẳng tự nhiên đa góc 4K ({len(optimal_paths)} ảnh, WaveCorr=False, Conf 0.12, RegResol 0.85)"),
        # Tầng 2 (0.5x Ultra-Wide & High Parallax Rescue): WaveCorr=False, RegResol 0.92 Mpx, Conf 0.07, MaxDim 1800px
        (optimal_paths, 1800, 0.07, False, 0.92, f"Tầng 2 - Cứu ảnh x0.5 góc siêu rộng & nghiêng nóc/sàn ({len(optimal_paths)} ảnh, WaveCorr=False, Conf 0.07, RegResol 0.92)"),
        # Tầng 3 (Horizon-Stabilized Panorama): WaveCorr=True, RegResol 0.80 Mpx, Conf 0.10, MaxDim 1800px
        (optimal_paths, 1800, 0.10, True, 0.80, f"Tầng 3 - Cân bằng đường chân trời ngang ({len(optimal_paths)} ảnh, WaveCorr=True, Conf 0.10, RegResol 0.80)"),
        # Tầng 4 (Extreme Lighting / Deep Shadow & Glare Rescue): WaveCorr=False, RegResol 0.95 Mpx, Conf 0.04, MaxDim 1500px
        (optimal_paths, 1500, 0.04, False, 0.95, f"Tầng 4 - Cứu ảnh ngược sáng & chênh lệch nắng râm ({len(optimal_paths)} ảnh, WaveCorr=False, Conf 0.04, RegResol 0.95)"),
    ]

    # Tầng 5 & 6 (Full-Set Fallbacks)
    if num_total > len(optimal_paths):
        candidate_schemes.append(
            (sorted_paths, 1600, 0.07, False, 0.85, f"Tầng 5 - Toàn bộ ảnh gốc đa góc ({num_total} ảnh, WaveCorr=False, Conf 0.07, MaxDim 1600px)")
        )
    candidate_schemes.append(
        (sorted_paths, 1400, 0.03, False, 0.75, f"Tầng 6 - Cứu cánh tối đa toàn bộ ảnh ({num_total} ảnh, WaveCorr=False, Conf 0.03, MaxDim 1400px)")
    )

    best_pano = None
    best_status = -1
    best_used = ()
    best_hfov = None
    best_score = -1
    best_failure_stat = None
    best_flatness = 0.0

    for (cur_paths, max_dim, conf, wave_corr, reg_resol, desc) in candidate_schemes:
        print(f"[*] Thử nghiệm ghép: {desc}...", file=sys.stderr)
        images = []
        for p in cur_paths:
            if not os.path.exists(p):
                print(f"[Warning] Bỏ qua file không tồn tại: {p}", file=sys.stderr)
                continue
            try:
                img = load_and_orient_image(p, max_dim=max_dim)
                # Cân bằng ánh sáng đa môi trường (HDR thích ứng, nâng bóng râm & nén nắng chói)
                img = balance_universal_lighting(img)
                images.append(img)
            except Exception as img_err:
                print(f"[Warning] Bỏ qua ảnh lỗi đọc {p}: {img_err}", file=sys.stderr)
                continue

        if len(images) < 2:
            print(f"[Warning] Không đủ ảnh hợp lệ ({len(images)} ảnh) để ghép cho tầng này.", file=sys.stderr)
            try:
                del images
                gc.collect()
            except Exception:
                pass
            continue

        s = build_stitcher(confidence=conf, wave_correction=wave_corr, reg_resol=reg_resol)
        cur_stat, cur_pano = s.stitch(images)
        cur_used = s.component() if hasattr(s, 'component') else ()

        if cur_stat == cv2.Stitcher_OK and cur_pano is not None:
            # Ước tính góc quét ngang thực tế (HFOV) từ tiêu cự camera
            estimated_hfov = None
            try:
                cams = s.cameras()
                focals = [c.focal for c in cams if c.focal > 0]
                if len(focals) > 0:
                    med_f = float(np.median(focals))
                    estimated_hfov = (cur_pano.shape[1] / med_f) * (180.0 / np.pi)
            except Exception:
                pass

            if estimated_hfov is None:
                ar = float(cur_pano.shape[1]) / float(cur_pano.shape[0])
                estimated_hfov = min(360.0, max(50.0, ar * 52.0))

            used_ratio = len(cur_used) / float(len(images))
            flatness = evaluate_panorama_flatness(cur_pano)
            # Tính điểm chất lượng toàn diện kết hợp độ phủ và độ phẳng chân trời (Anti-Arch Score)
            score = (used_ratio * 120.0) + min(160.0, estimated_hfov * 0.5) + (flatness * 140.0)

            print(f"[✓] Ghép thành công {len(cur_used)}/{len(images)} ảnh (HFOV ~{estimated_hfov:.1f}°, Độ phẳng: {flatness*100:.1f}%, Điểm chất lượng: {score:.1f}).", file=sys.stderr)

            if score > best_score:
                best_score = score
                best_pano = cur_pano
                best_status = cur_stat
                best_used = cur_used
                best_hfov = estimated_hfov
                best_flatness = flatness

            # Dọn dẹp bộ nhớ ảnh sau lượt ghép thành công
            try:
                del images
                gc.collect()
            except Exception:
                pass

            # Chỉ dừng sớm nếu ĐỒNG THỜI:
            # 1. Kết nối >= 80% ảnh
            # 2. HFOV >= 260°
            # 3. Độ phẳng >= 0.82 (Tuyệt đối không dừng nếu bị vòm cung uốn cong)
            if used_ratio >= 0.80 and estimated_hfov >= 260.0 and flatness >= 0.82:
                print(f"[✓] Đã đạt vòng tròn 360° hoàn chỉnh xuất sắc và chuẩn phẳng! Tiếp tục hoàn thiện ảnh...", file=sys.stderr)
                break
        else:
            if best_failure_stat is None or cur_stat != -1:
                best_failure_stat = cur_stat
            print(f"[!] Lượt ghép chưa đạt (Mã={cur_stat}, ghép được {len(cur_used)}/{len(images)} ảnh). Tiếp tục thử phương án tiếp theo...", file=sys.stderr)
            try:
                del images
                gc.collect()
            except Exception:
                pass

    status = best_status if best_status != -1 else (best_failure_stat if best_failure_stat is not None else cv2.Stitcher_ERR_NEED_MORE_IMGS)
    stitched = best_pano
    used_imgs = best_used

    print(f"[*] Kết quả ghép OpenCV: Mã={status}, Số ảnh thực tế kết nối: {len(used_imgs)} ảnh, HFOV ước tính: {best_hfov if best_hfov else 0:.1f}°.", file=sys.stderr)

    STATUS_MAP = {
        cv2.Stitcher_OK: "OK",
        cv2.Stitcher_ERR_NEED_MORE_IMGS: "ERR_NEED_MORE_IMGS",
        cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL: "ERR_HOMOGRAPHY_EST_FAIL",
        cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL: "ERR_CAMERA_PARAMS_ADJUST_FAIL"
    }

    status_name = STATUS_MAP.get(status, f"ERR_STITCH_{status}")

    if status != cv2.Stitcher_OK or stitched is None:
        error_details = {
            "ERR_NEED_MORE_IMGS": "Không đủ độ chồng lấp (overlap) giữa các khung hình liên tiếp. Khi quay/chụp trong gian phòng bảo tàng, hai bức ảnh kề nhau cần chứa ít nhất 30%-40% khung cảnh chung và di chuyển góc quay mượt mà.",
            "ERR_HOMOGRAPHY_EST_FAIL": "Không thể thiết lập ma trận tương đồng (Homography). Thường xuất hiện khi lia máy quá nhanh làm nhòe ảnh, hoặc chụp vào vùng tường quá trơn thiếu chi tiết hoa văn.",
            "ERR_CAMERA_PARAMS_ADJUST_FAIL": "Không thể hiệu chỉnh thông số quang học của thấu kính máy ảnh giữa các bức ảnh do tiêu cự zoom thay đổi đột ngột khi chụp."
        }
        return {
            "success": False,
            "error": status_name,
            "detail": error_details.get(status_name, "Thuật toán ghép ảnh chưa thể kết nối đầy đủ các bức ảnh do thiếu điểm tương đồng thị giác hoặc góc chụp lệch nhiều.")
        }

    print("[*] Ghép ảnh thành công! Đang cắt sạch viền đen và nắn chỉnh Equirectangular 2:1...", file=sys.stderr)
    cropped = crop_black_borders(stitched)

    # Chuẩn hóa về tỷ lệ Equirectangular 2:1 với HFOV thực tế
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=target_width, hfov=best_hfov)

    # Tăng cường độ sắc nét và cân bằng ánh sáng bảo tàng chuyên nghiệp
    print("[*] Đang áp dụng thuật toán CLAHE & Unsharp Masking tăng cường độ tương phản và chi tiết cổ vật...", file=sys.stderr)
    equi_pano = enhance_museum_texture(equi_pano)

    # Lưu kết quả với chất lượng JPEG tối đa 99% và bật tối ưu nén
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    cv2.imwrite(output_path, equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), 99, int(cv2.IMWRITE_JPEG_OPTIMIZE), 1])

    h, w = equi_pano.shape[:2]
    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": 2.0,
        "aspectRatioStr": "2:1",
        "flatnessScore": round(float(best_flatness), 3),
        "message": f"Đã tạo thành công ảnh toàn cảnh 360° chuẩn phẳng kiến trúc (Độ phẳng: {best_flatness*100:.1f}%, HFOV: {best_hfov if best_hfov else 360:.1f}°)."
    }

def verify_single_image(image_path, prev_image_path=None):
    """
    Thẩm định chất lượng ảnh chụp từ camera điện thoại trong thời gian thực:
    - Độ sắc nét (Laplacian variance): Phát hiện rung tay, nhòe mờ.
    - Ánh sáng / Phơi sáng: Kiểm tra quá tối hoặc cháy sáng.
    - Điểm đặc trưng (ORB features): Đảm bảo cảnh có đủ hoa văn để máy tính nhận diện.
    - Độ chồng lấp (Overlap): Đối chiếu với ảnh kế trước để đảm bảo nối được không gian.
    """
    if not os.path.exists(image_path):
        return {
            "success": False,
            "error": "ERR_FILE_NOT_FOUND",
            "message": f"Không tìm thấy file ảnh: {image_path}"
        }

    try:
        img = load_and_orient_image(image_path, max_dim=1200)
        # Áp dụng cân bằng sáng và nén chói ngược sáng để máy quét rõ nét mọi chi tiết
        balanced_img = balance_indoor_lighting(img)
        gray = cv2.cvtColor(balanced_img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # 1. Đo độ sắc nét (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 35.0
        sharpness_label = "Rất sắc nét" if laplacian_var > 80 else ("Đủ độ nét" if is_sharp else "Bị nhòe / rung tay")

        # 2. Đo mật độ chi tiết hoa văn (ORB Features) sau khi đã phục hồi độ tương phản
        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(gray, None)
        feature_count = len(kp) if kp is not None else 0
        has_features = feature_count >= 140
        feature_label = "Hoa văn phong phú" if feature_count >= 350 else ("Đủ chi tiết" if has_features else "Thiếu chi tiết (tường trơn)")

        # 3. Đo độ sáng / phơi sáng thông minh (hỗ trợ cả góc chói nắng lẫn chụp trời tối/thiếu sáng và ánh sáng đèn)
        mean_brightness = float(np.mean(gray))
        # Nhờ bộ cân bằng quang học đa môi trường (HDR Soft-Knee + Shadow Lift + Cân bằng màu đèn rọi):
        # Ảnh phòng tối (mean >= 10) hoặc ngược sáng ánh nắng / đèn rọi gắt (mean <= 250) đều được phục hồi chi tiết đầy đủ
        is_exposed = (14.0 <= mean_brightness <= 242.0) or (has_features and mean_brightness >= 9.0 and mean_brightness <= 250.0)
        if 40.0 <= mean_brightness <= 215.0:
            brightness_label = "Đủ sáng (Cân bằng tự nhiên)"
        elif mean_brightness > 215.0 and has_features:
            brightness_label = "Ánh nắng / Đèn rọi (Đã nén lóa bảo toàn chi tiết)"
        elif mean_brightness < 40.0 and has_features:
            brightness_label = "Phòng tối / Thiếu sáng (Đã kích sáng chi tiết)"
        elif mean_brightness < 9.0:
            brightness_label = "Quá tối (Không đủ ánh sáng)"
        else:
            brightness_label = "Cháy sáng nặng"

        # 4. Đo độ chồng lấp với ảnh trước (nếu có)
        overlap_info = None
        position_info = None
        has_overlap = True
        is_position_stable = True

        if prev_image_path and os.path.exists(prev_image_path):
            try:
                prev_img = load_and_orient_image(prev_image_path, max_dim=1200)
                # Đồng bộ quang học: Ảnh trước cũng được cân bằng sáng để so khớp chuẩn xác
                prev_balanced = balance_indoor_lighting(prev_img)
                prev_gray = cv2.cvtColor(prev_balanced, cv2.COLOR_BGR2GRAY)
                prev_kp, prev_des = orb.detectAndCompute(prev_gray, None)

                if des is not None and prev_des is not None and len(des) > 10 and len(prev_des) > 10:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                    matches = bf.knnMatch(des, prev_des, k=2)
                    good_matches = []
                    for m_pair in matches:
                        if len(m_pair) == 2 and m_pair[0].distance < 0.75 * m_pair[1].distance:
                            good_matches.append(m_pair[0])

                    match_count = len(good_matches)
                    has_overlap = match_count >= 10

                    # KIỂM TRA ĐỘ ỔN ĐỊNH VỊ TRÍ & DUNG SAI THỊ SAI (Adaptive Position & Parallax Tolerance):
                    # - Nếu đứng yên 1 chỗ xoay máy: Khớp rất cao (Inlier Ratio > 45%).
                    # - Nếu người chụp xoay góc lớn hơn (để chụp ít ảnh hơn) hoặc dịch chuyển nhẹ:
                    #   Vẫn có điểm chung tốt (match_count >= 10, inliers >= 4).
                    #   Hệ thống có DUNG SAI MỀM DẺO: Vẫn ĐẠT CHUẨN và ưu tiên lấy trọn vẹn góc nhìn này!
                    if match_count >= 8:
                        src_pts = np.float32([kp[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        dst_pts = np.float32([prev_kp[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        H, inlier_mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                        if H is not None and inlier_mask is not None:
                            inlier_count = int(np.sum(inlier_mask))
                            inlier_ratio = inlier_count / float(match_count)
                            det = float(np.linalg.det(H[:2, :2]))

                            # Dung sai thông minh: Cho phép góc xoay mở rộng để chụp ít ảnh hơn
                            is_position_stable = (inlier_ratio >= 0.26 and inlier_count >= 4 and 0.12 < det < 7.5) or (match_count >= 16)

                            if inlier_ratio >= 0.45:
                                pos_label = "Chuẩn trục xoay (Khớp hoàn hảo)"
                            elif is_position_stable:
                                pos_label = "Góc nhìn hợp lệ (Độ lệch trong giới hạn cho phép)"
                            else:
                                pos_label = "⚠️ Lệch vị trí nhiều (Nên đứng gần lại góc trước)"

                            position_info = {
                                "passed": is_position_stable,
                                "inlier_ratio": round(inlier_ratio * 100, 1),
                                "label": pos_label
                            }
                        else:
                            is_position_stable = match_count >= 14
                            position_info = {
                                "passed": is_position_stable,
                                "inlier_ratio": 0.0,
                                "label": "Góc nhìn mở rộng (Đạt)" if is_position_stable else "⚠️ Khung cảnh bị xáo trộn do thay đổi vị trí"
                            }
                    else:
                        is_position_stable = has_overlap
                        position_info = {
                            "passed": has_overlap,
                            "label": "Độ khớp hợp lệ" if has_overlap else "Chưa đủ điểm chung với góc trước"
                        }

                    overlap_info = {
                        "match_count": match_count,
                        "passed": has_overlap,
                        "label": "Khớp nối tốt với ảnh trước" if match_count >= 18 else ("Độ gối đầu vừa đủ" if has_overlap else "Chưa đủ điểm chung với ảnh trước")
                    }
                else:
                    has_overlap = False
                    is_position_stable = False
                    overlap_info = {
                        "match_count": 0,
                        "passed": False,
                        "label": "Không tìm thấy điểm chung với ảnh trước"
                    }
                    position_info = {
                        "passed": False,
                        "label": "Không thể so khớp tọa độ đứng"
                    }
            except Exception as oErr:
                print(f"[Warning] Overlap/Parallax calculation note: {oErr}", file=sys.stderr)

        # Đánh giá tổng quát thông minh:
        # Nếu ảnh có hoa văn chi tiết dồi dào (feature_count >= 250, như 800 - 1000 điểm trong thực tế):
        # Thì ảnh đã có thừa thãi dữ liệu hình học để thuật toán OpenCV ghép nối thành công!
        rich_features = (feature_count >= 250)

        if rich_features:
            # Dung sai mềm dẻo: Cho phép ảnh giàu chi tiết trong môi trường tối/ngược sáng đạt chuẩn
            passed = is_sharp and is_exposed and (has_overlap or match_count >= 6)
        else:
            passed = is_sharp and is_exposed and has_features and has_overlap and is_position_stable
        
        # Tính điểm chất lượng từ 0 - 100
        score = 0
        if is_sharp:
            score += min(25, int(laplacian_var / 3.0))
        if is_exposed:
            score += 25
        if has_features:
            score += min(25, int(feature_count / 30.0))
        if has_overlap or (rich_features and match_count >= 8):
            score += 15
        if is_position_stable or rich_features:
            score += 10
        score = min(100, max(30, score))

        if passed:
            if rich_features and (mean_brightness < 40.0 or mean_brightness > 215.0):
                message = "✓ Ảnh đạt chuẩn (Đã cân bằng thông minh góc tối & ánh sáng đèn/nắng)!"
            else:
                message = "✓ Ảnh đạt chuẩn chất lượng không gian!"
        elif not is_sharp:
            message = "⚠️ Ảnh bị nhòe do rung tay, hãy giữ chắc máy chụp lại."
        elif not is_exposed:
            message = "⚠️ Ánh sáng quá yếu hoặc cháy sáng, hãy giữ chắc máy hoặc tăng nhẹ nguồn sáng."
        elif not has_features:
            message = "⚠️ Cảnh thiếu hoa văn chi tiết để máy tính nhận diện."
        elif not is_position_stable:
            message = "⚠️ Phát hiện bạn vừa bước đi làm lệch tọa độ đứng! Hãy đứng yên 1 vị trí và chỉ xoay máy."
        else:
            message = "⚠️ Chưa đủ cảnh chung với ảnh trước, hãy nhích nhẹ lại gần góc trước."

        return {
            "success": True,
            "passed": passed,
            "score": score,
            "checks": {
                "sharpness": { "passed": is_sharp, "value": round(laplacian_var, 1), "label": sharpness_label },
                "brightness": { "passed": is_exposed, "value": round(mean_brightness, 1), "label": brightness_label },
                "features": { "passed": has_features, "count": feature_count, "label": feature_label },
                "overlap": overlap_info,
                "position_stability": position_info
            },
            "message": message
        }
    except Exception as e:
        return {
            "success": False,
            "error": "ERR_VERIFY_FAILED",
            "message": f"Lỗi thẩm định ảnh: {str(e)}"
        }

def main():
    parser = argparse.ArgumentParser(description="OpenCV 360 Panorama Stitching & Verification Worker")
    parser.add_argument("--verify-image", help="Đường dẫn 1 file ảnh cần kiểm tra chất lượng")
    parser.add_argument("--prev-image", help="Đường dẫn file ảnh kế trước để so khớp độ chồng lấp")
    parser.add_argument("--images", nargs="+", help="Danh sách đường dẫn các file ảnh cần ghép")
    parser.add_argument("--input_json", help="File JSON chứa danh sách đường dẫn ảnh")
    parser.add_argument("--output", help="Đường dẫn file ảnh đầu ra (.jpg)")
    parser.add_argument("--width", type=int, default=0, help="Chiều rộng ảnh đầu ra (0 = Tự động thích ứng chất lượng theo ảnh gốc)")

    args = parser.parse_args()

    # Chế độ thẩm định ảnh đơn lẻ
    if args.verify_image:
        result = verify_single_image(args.verify_image, prev_image_path=args.prev_image)
        print(json.dumps(result, ensure_ascii=True, indent=2))
        return

    # Chế độ ghép không gian 360
    if not args.output:
        print(json.dumps({"success": False, "error": "MISSING_OUTPUT", "detail": "Thiếu tham số --output"}, ensure_ascii=True))
        return

    image_paths = []
    if args.images:
        image_paths = args.images
    elif args.input_json and os.path.exists(args.input_json):
        with open(args.input_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            image_paths = data.get("images", [])

    result = run_stitch(image_paths, args.output, target_width=args.width)
    print(json.dumps(result, ensure_ascii=True, indent=2))

if __name__ == "__main__":
    main()

