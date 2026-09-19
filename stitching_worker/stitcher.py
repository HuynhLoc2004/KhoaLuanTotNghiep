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
from PIL import Image, ImageOps

# Đảm bảo stdout/stderr luôn dùng UTF-8 trên Windows để không bị lỗi UnicodeEncodeError
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
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
      + Nếu hfov >= 315° (Toàn cảnh 360° hoàn chỉnh): Phủ trọn 360° canvas và khâu liền mạch mép 0° - 360°.
      + Nếu hfov < 315° (Toàn cảnh góc rộng / Bán phần): Bảo tồn tỷ lệ quang học thật 1:1,
        tuyệt đối KHÔNG cưỡng ép kéo dãn ngang làm móp méo tường và bàn ghế, không tự ý ghép chồng 2 vách tường khác nhau.
    - Bảo tồn độ phẳng kiến trúc (Rectilinear Flatness), triệt tiêu hoàn toàn méo võng.
    - Nội suy trần (+90° Zenith) và sàn (-90° Nadir) tự nhiên, xóa sạch viền rách.
    """
    h, w = stitched_img.shape[:2]
    aspect_ratio = max(0.5, float(w) / float(h))

    # Nếu hfov chưa được truyền, ước tính từ tỷ lệ khung hình:
    # Camera điện thoại chụp đứng có VFOV ~ 52°, HFOV ~ aspect_ratio * 52°
    if hfov is None or hfov <= 0:
        hfov = min(360.0, max(45.0, aspect_ratio * 52.0))

    is_full_360 = (hfov >= 315.0)

    # Quyết định độ phân giải mục tiêu thích ứng:
    if target_width is None or target_width <= 0:
        if w >= 3600:
            target_width = 4096
        elif w >= 2600:
            target_width = 3072
        elif w >= 1600:
            target_width = 2048
        else:
            target_width = max(1024, (w // 2) * 2)
    else:
        if target_width > int(w * 1.15):
            if w >= 3400:
                target_width = 4096
            elif w >= 2500:
                target_width = 3072
            elif w >= 1500:
                target_width = 2048
            else:
                target_width = max(1024, (w // 2) * 2)
        else:
            target_width = (target_width // 2) * 2

    target_height = target_width // 2

    canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)

    if is_full_360:
        # Toàn cảnh 360° trọn vẹn
        new_w = target_width
        natural_h = int(round(target_width / aspect_ratio))
        new_h = min(int(target_height * 0.90), max(int(target_height * 0.35), natural_h))
        resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

        # Khâu mịn đường nối giữa cạnh trái (0°) và cạnh phải (360°) để xoay vòng liền mạch
        seam_blend_width = min(60, new_w // 20)
        for i in range(seam_blend_width):
            alpha = i / float(seam_blend_width)
            left_col = resized_pano[:, i].astype(np.float32)
            right_col = resized_pano[:, -(seam_blend_width - i)].astype(np.float32)
            blended = (1 - alpha) * right_col + alpha * left_col
            resized_pano[:, i] = blended.astype(np.uint8)

        y_offset = (target_height - new_h) // 2
        canvas[y_offset:y_offset+new_h, 0:target_width] = resized_pano
    else:
        # Bán phần (Partial Panorama < 315°): Giữ nguyên đúng tỷ lệ quang học thật 1:1, không kéo dãn ngang
        span_ratio = min(1.0, max(0.35, hfov / 360.0))
        new_w = int(round(target_width * span_ratio))
        natural_h = int(round(new_w / aspect_ratio))
        new_h = min(int(target_height * 0.90), max(int(target_height * 0.35), natural_h))
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
    Bộ lọc Tinh Chỉnh & Cân Bằng Thích Ứng (Adaptive Natural Quality Enhancement):
    - ĐO ĐẠC ĐỘ NÉT THỰC TẾ: Dựa vào độ biến thiên Laplacian để biết ảnh đã sắc nét hay chưa.
    - TRÁNH HOÀN TOÀN TÌNH TRẠNG VỠ ẢNH (Không can thiệp quá đà / No Over-Processing):
      + Nếu ảnh gốc đã sắc nét (laplacian_var >= 80): Tuyệt đối KHÔNG làm nét nhân tạo nữa
        (bỏ qua Unsharp Masking) để tránh tạo quầng trắng (halos), vỡ khối hay nổi hạt nhiễu (noise).
      + Nếu ảnh hơi mềm (laplacian_var < 80): Chỉ áp dụng mức làm nét vi mô siêu nhẹ (1.08 / -0.08)
        và khóa các mảng màu phẳng (tường, trần, sàn) để không sinh hạt.
    - CÂN BẰNG SÁNG TỰ NHIÊN: Giảm CLAHE clipLimit xuống 1.2 và chỉ hòa trộn 25% với 75% ảnh gốc.
      Kéo sáng nhẹ nhàng các góc tối mà vẫn giữ trọn màu sắc và độ trong trẻo thật của không gian.
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 1. Cân bằng sáng thích ứng nhẹ nhàng (Gentle Adaptive CLAHE)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.2, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)
        # Hòa trộn nhẹ 25% CLAHE với 75% gốc: kéo sáng dịu mắt góc tối, không làm bệt/cháy màu
        l_balanced = cv2.addWeighted(l_clahe, 0.25, l, 0.75, 0)
        balanced_bgr = cv2.cvtColor(cv2.merge((l_balanced, a, b)), cv2.COLOR_LAB2BGR)

        # 2. Xử lý độ nét thích ứng theo chất lượng ảnh thực tế:
        # Nếu ảnh vốn đã rất nét (laplacian >= 80) -> Giữ nguyên 100% độ mượt tự nhiên, không unsharp mask!
        if laplacian_var >= 80.0:
            return balanced_bgr

        # Nếu ảnh hơi mềm (laplacian < 80) -> Chỉ làm nét vi mô cực nhẹ và bảo vệ mảng màu phẳng
        blurred = cv2.GaussianBlur(balanced_bgr, (0, 0), 1.0)
        sharpened = float(1.08) * balanced_bgr.astype(np.float32) - float(0.08) * blurred.astype(np.float32)
        sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

        # Bảo vệ các vùng màu phẳng (trần, tường, sàn gạch men) chống nhiễu hạt
        diff = cv2.absdiff(balanced_bgr, blurred)
        flat_mask = np.mean(diff, axis=2) < 2.0
        sharpened[flat_mask] = balanced_bgr[flat_mask]
        return sharpened
    except Exception as e:
        print(f"[Warning] Không thể áp dụng enhance_museum_texture: {e}", file=sys.stderr)
        return image

def balance_indoor_lighting(img):
    """
    Cân bằng ánh sáng thông minh chống chói lóa ngược sáng & kéo sáng góc tối:
    - Nén mượt mà vùng chói sáng cực đại (ngược sáng cửa chính, ánh nắng cửa sổ) theo đường cong Soft-knee.
    - Bảo toàn và khuếch đại độ tương phản vi mô của nan cửa, chấn song, chớp kính để bộ dò ORB/AKAZE tìm đủ điểm neo.
    - Kéo sáng các góc khuất bóng râm giúp căn phòng đồng đều, giữ trọn màu sắc tự nhiên.
    """
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Nén vùng chói sáng mềm mại (Soft-knee Highlight Compression):
        # Bắt đầu nén từ L > 185 để các vùng nắng chói (255) được đưa về dải an toàn (~220-235)
        # mà không tạo vết cắt cụt (clipping) hay làm bết màu
        l_f = l.astype(np.float32)
        excess = np.maximum(0.0, l_f - 185.0)
        l_comp = np.clip(185.0 + excess / (1.0 + excess * 0.015), 0, 255).astype(np.uint8)

        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        l_eq = clahe.apply(l_comp)
        l_balanced = cv2.addWeighted(l_eq, 0.55, l_comp, 0.45, 0)
        return cv2.cvtColor(cv2.merge((l_balanced, a, b)), cv2.COLOR_LAB2BGR)
    except Exception:
        return img

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
            cv2.imwrite(output_path, equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
            h, w = equi_pano.shape[:2]
            return {
                "success": True,
                "outputPath": output_path,
                "width": w,
                "height": h,
                "aspectRatio": "2:1",
                "message": "Đã chuẩn hóa ảnh Pano điện thoại thành toàn cảnh 360° Equirectangular 2:1 thành công."
            }
        except Exception as e:
            return {
                "success": False,
                "error": "ERR_PROCESSING",
                "detail": f"Lỗi xử lý ảnh PANO: {str(e)}"
            }

    # Sắp xếp ảnh theo thứ tự tự nhiên (img1, img2, ..., img48)
    sorted_paths = sorted(image_paths, key=natural_sort_key)
    num_total = len(sorted_paths)

    def select_optimal_keyframes(paths, max_target=48):
        """
        Chắt lọc các khung hình đại diện quanh chuỗi quay:
        - Chỉ loại bỏ các khung hình người chụp đứng yên một góc (< 1.8% khác biệt).
        - Giữ lại chuỗi khung hình dồi dào (tối đa 45-48 ảnh) để độ gối đầu (overlap) luôn đạt 60-70%.
        - Nhờ độ phủ dày, sai số lệch tâm do tay người chụp xoay điện thoại quanh người (parallax/hand drift)
          được chia nhỏ và triệt tiêu mượt mà, không gây đứt dây điện hay lệch nan ghế gỗ.
        """
        if len(paths) <= 30:
            return paths

        kept = [paths[0]]
        prev_thumb = None
        try:
            t = cv2.imread(paths[0], cv2.IMREAD_GRAYSCALE)
            if t is not None:
                prev_thumb = cv2.resize(t, (160, 120))
        except Exception:
            pass

        for i in range(1, len(paths) - 1):
            p = paths[i]
            try:
                curr = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
                if curr is None:
                    continue
                thumb = cv2.resize(curr, (160, 120))
                if prev_thumb is not None:
                    diff = float(np.mean(cv2.absdiff(prev_thumb, thumb)))
                    # Chỉ bỏ qua khung hình nếu người chụp đứng yên tại 1 góc (< 1.8% khác biệt)
                    remaining = len(paths) - i
                    if diff < 1.8 and (len(kept) + remaining) > 24:
                        continue
                kept.append(p)
                prev_thumb = thumb
            except Exception:
                kept.append(p)

        kept.append(paths[-1])

        if len(kept) > max_target:
            indices = np.linspace(0, len(kept) - 1, max_target, dtype=int)
            kept = [kept[idx] for idx in indices]

        return kept

    cv2.ocl.setUseOpenCL(False)

    def build_stitcher(confidence=0.20):
        s = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        try:
            # BẬT wave correction: Cân bằng đường chân trời, giữ vách tường, cửa sổ và trần nhà
            # luôn thẳng đứng tự nhiên, triệt tiêu hoàn toàn lỗi nghiêng chéo 45 độ
            s.setWaveCorrection(True)
        except Exception:
            pass
        try:
            s.setPanoConfidenceThresh(confidence)
        except Exception:
            pass
        try:
            # Nâng độ phân giải đối sánh đặc trưng (Registration Resolution) lên 0.95 Mpx:
            # Khi chụp bằng điện thoại cầm tay, tăng độ phân giải giúp bộ dò bắt chính xác từng sợi dây điện,
            # nan ghế gỗ và đường ron gạch men, khử triệt để sai lệch trục xoay (parallax/drift)
            s.setRegistrationResol(0.95)
        except Exception:
            pass
        try:
            # Tinh chỉnh độ phân giải tìm đường nối (Seam Estimation) 0.5 Mpx:
            # Giúp GraphCut nhìn rõ cạnh gờ tường, chân tường và viền khung gỗ để luồn đường ghép
            # vào đúng khe tự nhiên, không cắt ngang qua giữa nan ghế hay dây điện
            s.setSeamEstimationResol(0.5)
        except Exception:
            pass
        try:
            # Bật phép nội suy Bicubic (INTER_CUBIC) khi uốn cong ảnh lên mặt cầu 360:
            # Giữ cho các đường chéo mảnh (dây điện, mép cửa) liền mạch, không bị gãy bậc thang
            s.setInterpolationFlags(cv2.INTER_CUBIC)
        except Exception:
            pass
        return s

    # Chuẩn bị danh sách khung hình đại diện tối ưu
    optimal_paths = select_optimal_keyframes(sorted_paths, max_target=48)
    print(f"[*] Tiếp nhận {num_total} ảnh đầu vào -> Đã chắt lọc chuỗi quang học {len(optimal_paths)} khung hình đại diện liên tục.", file=sys.stderr)

    candidate_schemes = [
        # (danh_sách_ảnh, max_dim, conf, mô_tả)
        (optimal_paths, 1400, 0.25, "Độ nét cao & Gối đầu dày (Conf 0.25, MaxDim 1400px)"),
        (optimal_paths, 1200, 0.16, "Tăng cường độ nhạy sáng trong phòng (Conf 0.16, MaxDim 1200px)"),
        (sorted_paths if len(sorted_paths) <= 48 else optimal_paths, 1100, 0.10, "Quét toàn bộ ảnh đầu vào (Conf 0.10, MaxDim 1100px)"),
        (optimal_paths if len(optimal_paths) <= 24 else sorted_paths, 950, 0.04, "Quét vét độ nhạy cao (Conf 0.04, MaxDim 950px)")
    ]

    best_pano = None
    best_status = -1
    best_used = ()
    best_hfov = None
    best_score = -1

    for (cur_paths, max_dim, conf, desc) in candidate_schemes:
        print(f"[*] Thử nghiệm ghép: {desc} với {len(cur_paths)} ảnh...", file=sys.stderr)
        images = []
        load_ok = True
        for p in cur_paths:
            if not os.path.exists(p):
                load_ok = False
                break
            try:
                img = load_and_orient_image(p, max_dim=max_dim)
                # Luôn cân bằng ánh sáng và nén lóa sáng ngược sáng để bảo toàn chi tiết cửa chính & góc tối
                img = balance_indoor_lighting(img)
                images.append(img)
            except Exception:
                load_ok = False
                break

        if not load_ok or len(images) < 2:
            continue

        s = build_stitcher(confidence=conf)
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
            score = (used_ratio * 100.0) + min(200.0, estimated_hfov * 0.6)

            print(f"[✓] Ghép thành công {len(cur_used)}/{len(images)} ảnh (HFOV ~{estimated_hfov:.1f}°, Điểm chất lượng: {score:.1f}).", file=sys.stderr)

            if score > best_score:
                best_score = score
                best_pano = cur_pano
                best_status = cur_stat
                best_used = cur_used
                best_hfov = estimated_hfov

            # Nếu đã kết nối trọn vẹn (>= 85% ảnh) và phủ rộng (HFOV >= 310°), hoàn tất ngay
            if used_ratio >= 0.85 and estimated_hfov >= 310.0:
                print(f"[✓] Đã đạt vòng tròn 360° hoàn chỉnh xuất sắc! Tiếp tục hoàn thiện ảnh...", file=sys.stderr)
                break
        else:
            print(f"[!] Lượt ghép chưa đạt (Mã={cur_stat}, ghép được {len(cur_used)}/{len(images)} ảnh). Tiếp tục thử phương án tiếp theo...", file=sys.stderr)

    status = best_status
    stitched = best_pano
    used_imgs = best_used

    print(f"[*] Kết quả ghép OpenCV tốt nhất: Mã={status}, Số ảnh thực tế kết nối: {len(used_imgs)} ảnh, HFOV ước tính: {best_hfov if best_hfov else 0:.1f}°.", file=sys.stderr)

    STATUS_MAP = {
        cv2.Stitcher_OK: "OK",
        cv2.Stitcher_ERR_NEED_MORE_IMGS: "ERR_NEED_MORE_IMGS",
        cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL: "ERR_HOMOGRAPHY_EST_FAIL",
        cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL: "ERR_CAMERA_PARAMS_ADJUST_FAIL"
    }

    status_name = STATUS_MAP.get(status, f"UNKNOWN_ERROR_{status}")

    if status != cv2.Stitcher_OK or stitched is None:
        error_details = {
            "ERR_NEED_MORE_IMGS": "Không đủ ảnh hoặc độ chồng lấp (overlap) giữa các ảnh quá ít. Khi chụp bằng điện thoại, hai ảnh kề nhau cần có ít nhất 30%-40% cảnh chung.",
            "ERR_HOMOGRAPHY_EST_FAIL": "Không thể ước lượng ma trận tương đồng (Homography). Nguyên nhân thường do cảnh thiếu hoa văn nhận diện hoặc ảnh bị nhòe mờ khi lia máy nhanh.",
            "ERR_CAMERA_PARAMS_ADJUST_FAIL": "Không thể hiệu chỉnh thông số thấu kính máy ảnh giữa các bức ảnh."
        }
        return {
            "success": False,
            "error": status_name,
            "detail": error_details.get(status_name, "Lỗi không xác định trong quá trình ghép ảnh của OpenCV.")
        }

    print("[*] Ghép ảnh thành công! Đang cắt sạch viền đen và nắn chỉnh Equirectangular 2:1...", file=sys.stderr)
    cropped = crop_black_borders(stitched)

    # Chuẩn hóa về tỷ lệ Equirectangular 2:1 với HFOV thực tế
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=target_width, hfov=best_hfov)

    # Tăng cường độ sắc nét và cân bằng ánh sáng bảo tàng chuyên nghiệp
    print("[*] Đang áp dụng thuật toán CLAHE & Unsharp Masking tăng cường độ tương phản và chi tiết cổ vật...", file=sys.stderr)
    equi_pano = enhance_museum_texture(equi_pano)

    # Lưu kết quả với chất lượng JPEG tối đa 98%
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    cv2.imwrite(output_path, equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), 98])

    h, w = equi_pano.shape[:2]
    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": "2:1",
        "message": "Đã tạo thành công ảnh toàn cảnh 360° Equirectangular chuẩn WebGL siêu nét."
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

        # 3. Đo độ sáng / phơi sáng thông minh (có dung sai cao cho góc ngược sáng/chói nắng nếu vẫn đủ chi tiết)
        mean_brightness = float(np.mean(gray))
        is_exposed = (30.0 <= mean_brightness <= 238.0) or (has_features and mean_brightness <= 245.0)
        if 35.0 <= mean_brightness <= 225.0:
            brightness_label = "Đủ sáng"
        elif mean_brightness > 225.0 and has_features:
            brightness_label = "Ngược sáng (Vẫn đủ chi tiết ghép)"
        elif mean_brightness < 35.0 and has_features:
            brightness_label = "Góc tối (Đã kích sáng chi tiết)"
        elif mean_brightness < 30.0:
            brightness_label = "Quá tối"
        else:
            brightness_label = "Bị chói sáng nặng"

        # 4. Đo độ chồng lấp với ảnh trước (nếu có)
        overlap_info = None
        position_info = None
        has_overlap = True
        is_position_stable = True

        if prev_image_path and os.path.exists(prev_image_path):
            try:
                prev_img = load_and_orient_image(prev_image_path, max_dim=1200)
                prev_gray = cv2.cvtColor(prev_img, cv2.COLOR_BGR2GRAY)
                prev_kp, prev_des = orb.detectAndCompute(prev_gray, None)

                if des is not None and prev_des is not None and len(des) > 10 and len(prev_des) > 10:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                    matches = bf.knnMatch(des, prev_des, k=2)
                    good_matches = []
                    for m_pair in matches:
                        if len(m_pair) == 2 and m_pair[0].distance < 0.75 * m_pair[1].distance:
                            good_matches.append(m_pair[0])

                    match_count = len(good_matches)
                    has_overlap = match_count >= 16

                    # KIỂM TRA ĐỘ ỔN ĐỊNH VỊ TRÍ & DUNG SAI THỊ SAI (Adaptive Position & Parallax Tolerance):
                    # - Nếu đứng yên 1 chỗ xoay máy: Khớp rất cao (Inlier Ratio > 50%).
                    # - Nếu người chụp dịch chuyển nhẹ / lùi xa lấy góc rộng hơn: Vẫn có điểm chung tốt (match_count >= 12, inliers >= 6).
                    #   Hệ thống có DUNG SAI MỀM DẺO: Vẫn ĐẠT CHUẨN và ưu tiên lấy trọn vẹn góc nhìn này để không gian chính xác nhất!
                    # - Chỉ cảnh báo khi lệch vị trí quá nhiều làm mất hoàn toàn sự tương thích hình học.
                    if match_count >= 10:
                        src_pts = np.float32([kp[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        dst_pts = np.float32([prev_kp[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        H, inlier_mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                        if H is not None and inlier_mask is not None:
                            inlier_count = int(np.sum(inlier_mask))
                            inlier_ratio = inlier_count / float(match_count)
                            det = float(np.linalg.det(H[:2, :2]))

                            # Dung sai thông minh: Cho phép xê dịch nhẹ hoặc lùi xa lấy góc nhìn xa hơn
                            is_position_stable = (inlier_ratio >= 0.32 and inlier_count >= 6 and 0.15 < det < 6.5) or (match_count >= 22)

                            if inlier_ratio >= 0.50:
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
                            is_position_stable = match_count >= 18
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
                        "label": "Khớp nối tốt với ảnh trước" if match_count >= 24 else ("Độ gối đầu vừa đủ" if has_overlap else "Chưa đủ điểm chung với ảnh trước")
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

        # Đánh giá tổng quát: Bắt buộc phải sắc nét, đủ sáng, đủ hoa văn, đủ độ phủ VÀ KHÔNG BỊ LỆCH TỌA ĐỘ ĐỨNG
        passed = is_sharp and is_exposed and has_features and has_overlap and is_position_stable
        
        # Tính điểm chất lượng từ 0 - 100
        score = 0
        if is_sharp:
            score += min(25, int(laplacian_var / 3.0))
        if is_exposed:
            score += 25
        if has_features:
            score += min(20, int(feature_count / 25))
        if has_overlap:
            score += 15
        if is_position_stable:
            score += 15
        score = min(100, max(20, score))

        if passed:
            message = "✓ Ảnh đạt chuẩn chất lượng không gian!"
        elif not is_position_stable:
            message = "⚠️ Phát hiện bạn vừa bước đi làm lệch tọa độ đứng (thị sai Parallax)! Cần đứng yên tại 1 vị trí ban đầu và chỉ xoay máy."
        elif not is_sharp:
            message = "⚠️ Ảnh bị nhòe do rung tay, hãy giữ chắc máy chụp lại."
        elif not is_exposed:
            message = "⚠️ Ánh sáng không phù hợp (quá tối hoặc cháy sáng)."
        elif not has_features:
            message = "⚠️ Cảnh thiếu hoa văn chi tiết để máy tính nhận diện."
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

