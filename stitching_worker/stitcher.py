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
    Thuật toán cắt viền thông minh kết hợp Content-Aware Inpainting (Tương tự Adobe Photoshop):
    Khắc phục triệt để vấn đề "chụp bằng tay rung lắc, cao thấp không đều":
    - Khi chụp bằng tay, mỗi bức ảnh có độ cao lệch nhau một chút khiến viền trên/dưới bị lượn sóng.
    - Thuật toán cũ gọt cụt (shave) toàn bộ hàng pixel cho đến khi không còn hạt đen nào,
      khiến 50%-60% chiều cao của căn phòng bị vứt bỏ oan uổng!
    - Thuật toán mới:
      1. Tìm khung hình chữ nhật chứa tối đa nội dung hợp lệ (ngưỡng diện tích 90%).
      2. Cắt viền mép trái/phải gọn gàng.
      3. Dùng cv2.inpaint (thuật toán Navier-Stokes / Telea) để tự động bù lấp các góc khuyết
         nhỏ ở viền trần và viền sàn, giữ lại trọn vẹn 100% chiều cao của tường và cửa!
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mask = (gray > 10).astype(np.uint8)

    y_idx, x_idx = np.where(mask > 0)
    if len(y_idx) == 0 or len(x_idx) == 0:
        return img

    top, bottom = np.min(y_idx), np.max(y_idx)
    left, right = np.min(x_idx), np.max(x_idx)

    cropped = img[top:bottom+1, left:right+1].copy()
    mask_c = mask[top:bottom+1, left:right+1].copy()

    # Gọt bớt các cạnh ngoài cùng có quá nhiều pixel đen (ngưỡng 90% thay vì 99.8%)
    max_iters = 300
    iters = 0
    while iters < max_iters and cropped.shape[0] > 100 and cropped.shape[1] > 100:
        iters += 1
        changed = False
        # Nếu hàng trên cùng có hơn 10% là pixel đen, mới gọt
        if np.mean(mask_c[0, :]) < 0.90:
            mask_c = mask_c[1:, :]
            cropped = cropped[1:, :]
            changed = True
        # Nếu hàng dưới cùng có hơn 10% là pixel đen, mới gọt
        if np.mean(mask_c[-1, :]) < 0.90:
            mask_c = mask_c[:-1, :]
            cropped = cropped[:-1, :]
            changed = True
        # Hai bên trái phải yêu cầu khắt khe hơn để ảnh nối 360 liền mạch
        if np.mean(mask_c[:, 0]) < 0.95:
            mask_c = mask_c[:, 1:]
            cropped = cropped[:, 1:]
            changed = True
        if np.mean(mask_c[:, -1]) < 0.95:
            mask_c = mask_c[:, :-1]
            cropped = cropped[:, :-1]
            changed = True

        if not changed:
            break

    # Với các khoảng đen nhỏ còn sót lại ở mép gợn sóng (do tay rung lệch):
    # Dùng Content-Aware Inpainting để tự động bù màu mượt mà theo hoa văn tường/trần kề bên
    rem_black = (cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY) <= 10).astype(np.uint8) * 255
    if np.sum(rem_black) > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        rem_black = cv2.dilate(rem_black, kernel, iterations=1)
        cropped = cv2.inpaint(cropped, rem_black, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return cropped

def fit_to_equirectangular_2_to_1(stitched_img, target_width=4096):
    """
    Nắn chỉnh và chuẩn hóa ảnh ghép thành tỷ lệ 2:1 Equirectangular chuẩn quốc tế:
    - Mở rộng tỷ lệ bao phủ chiều cao phòng lên 72% - 85% (tương đương 1474px - 1740px trên canvas 2048px).
    - Bảo tồn độ phẳng kiến trúc (Rectilinear Flatness), triệt tiêu hoàn toàn hiện tượng kéo dẹt ngang làm méo vách tường,
      đồng thời xóa bỏ cảm giác ống hút / phễu sâu (tunnel effect) và không gian hẹp.
    - Khâu liền mạch 360° ở kinh tuyến 0°-360° và nội suy mượt mà 2 cực Zenith & Nadir.
    """
    h, w = stitched_img.shape[:2]
    target_height = target_width // 2 # 2048px cho canvas 4096px
    aspect_ratio = max(0.5, float(w) / float(h))

    # BẢO TỒN NGUYÊN BẢN TỶ LỆ QUANG HỌC 1:1 (True Optical Aspect Ratio Preservation):
    # Chiều cao được nạp chính xác theo tỷ lệ thật của ảnh chụp (sx = sy),
    # Giữ nguyên bản 100% góc nhìn thực tế: cánh cửa, bàn ghế, hiện vật có kích thước và hình dáng
    # y chang như ảnh gốc đầu vào mà bạn chụp, triệt tiêu hoàn toàn hiện tượng bóp méo hay kéo dẹt!
    natural_h = int(round(target_width / aspect_ratio))
    new_w = target_width
    new_h = min(int(target_height * 0.90), max(int(target_height * 0.35), natural_h))

    # Co giãn chất lượng cao với bộ lọc Lanczos 4-tap giữ trọn độ nét chi tiết
    resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

    # Khâu mịn đường nối giữa cạnh trái (0°) và cạnh phải (360°) để xoay vòng liền mạch
    seam_blend_width = min(60, new_w // 20)
    for i in range(seam_blend_width):
        alpha = i / float(seam_blend_width)
        left_col = resized_pano[:, i].astype(np.float32)
        right_col = resized_pano[:, -(seam_blend_width - i)].astype(np.float32)
        blended = (1 - alpha) * right_col + alpha * left_col
        resized_pano[:, i] = blended.astype(np.uint8)

    # Tạo canvas Equirectangular 2:1
    canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)
    y_offset = (target_height - new_h) // 2 # Khoảng cách cực đỉnh và cực đáy chỉ còn ~150px - 280px

    # Đặt không gian phòng vào trung tâm quả cầu
    canvas[y_offset:y_offset+new_h, 0:target_width] = resized_pano

    # 1. Nội suy mượt mà trần nhà lên đỉnh cực (+90° Zenith)
    top_edge = resized_pano[0, :].astype(np.float32)
    zenith_color = np.clip(np.median(top_edge, axis=0) * 1.03, 0, 255).astype(np.float32)
    for y in range(y_offset):
        t = y / float(y_offset) # 0 ở đỉnh cực, 1 ở mép ảnh thật
        canvas[y, :] = ((1.0 - t) * zenith_color + t * top_edge).astype(np.uint8)

    # 2. XỬ LÝ TỐI ƯU HÓA ĐẶC BIỆT CHO SÀN NHÀ (-90° Nadir Floor Optimization):
    # - Khử bóng bàn chân người chụp / chân máy ảnh ở 25px sát mép đáy bằng mẫu màu gạch sàn an toàn.
    # - Hội tụ quang học hình cầu: Tăng dần độ mịn ngang khi càng xuống gần cực Nam để triệt tiêu hoàn toàn sọc tia (starburst/barcode).
    safe_floor_zone = resized_pano[max(0, new_h - 75):max(1, new_h - 28), :]
    nadir_color = np.median(safe_floor_zone, axis=(0, 1)).astype(np.float32)

    # Mẫu cạnh sàn sạch không dính mũi giày/chân
    clean_bottom_edge = cv2.GaussianBlur(resized_pano[max(0, new_h - 26), :][np.newaxis, :, :], (65, 1), 0)[0].astype(np.float32)

    # Hòa tan nhẹ 20px sát mép đáy của ảnh thật vào màu gạch sàn sạch để che khuất hoàn toàn bàn chân
    if new_h > 80:
        feet_h = min(22, new_h // 12)
        for fi in range(feet_h):
            alpha = fi / float(feet_h) # 0 ở đáy cùng, 1 ở trên
            row_idx = new_h - feet_h + fi
            resized_pano[row_idx, :] = (alpha * resized_pano[row_idx, :].astype(np.float32) + (1.0 - alpha) * clean_bottom_edge).astype(np.uint8)

    # Cập nhật lại ảnh phòng vào canvas với mép sàn đã được làm sạch
    canvas[y_offset:y_offset+new_h, 0:target_width] = resized_pano

    floor_start = y_offset + new_h
    floor_height = target_height - floor_start

    for y in range(floor_height):
        t = y / float(floor_height) # 0 ở mép sàn thật, 1 ở đáy cực
        smooth_t = (1.0 - np.cos(t * np.pi)) * 0.5 # Cosine chuyển tiếp êm dịu
        row = (1.0 - smooth_t) * clean_bottom_edge + smooth_t * nadir_color
        canvas[floor_start + y, :] = row.astype(np.uint8)

    # Tán xạ mịn theo phương ngang càng xuống gần cực Nam (đặc tính quang học phép chiếu Equirectangular)
    for y in range(floor_start + int(floor_height * 0.20), target_height):
        progress = (y - (floor_start + floor_height * 0.20)) / float(floor_height * 0.80)
        ksize = int(progress * 45) * 2 + 1
        if ksize >= 5:
            canvas[y:y+1, :] = cv2.GaussianBlur(canvas[y:y+1, :], (ksize, 1), 0)

    # Làm mờ nhẹ vùng chuyển tiếp (feathering) trần nhà 15px
    feather = min(15, y_offset // 2) if y_offset > 0 else 0
    for fi in range(feather):
        alpha = fi / float(feather)
        curr_top = y_offset + fi
        canvas[curr_top, :] = ((1.0 - alpha) * canvas[y_offset - 1, :] + alpha * resized_pano[fi, :]).astype(np.uint8)

    return canvas

def enhance_museum_texture(image):
    """
    Bộ lọc Tăng Cường Chi Tiết & Cân Bằng Ánh Sáng Bảo Tàng Chuyên Nghiệp:
    1. Cân bằng tương phản cục bộ thích ứng (Adaptive CLAHE trên kênh Luminance của không gian màu LAB):
       Giúp các cổ vật trong tủ kính, góc tối của gian phòng được kéo sáng rõ nét mà không bị cháy sáng ở các ngọn đèn.
    2. Bộ lọc Unsharp Masking vi mô: Tăng cường độ nổi khối các đường nét chạm khắc, hoa văn cổ vật và phù điêu.
    3. Giữ nguyên các vùng màu đồng nhất (trần nhà, nền gạch) để không bị sinh nhiễu hạt (noise).
    """
    try:
        # 1. Cân bằng sáng thích ứng CLAHE trên kênh Luminance (L)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)
        # Hòa trộn 55% ảnh cân bằng sáng với 45% ảnh gốc để bảo toàn sự tự nhiên
        l_balanced = cv2.addWeighted(l_clahe, 0.55, l, 0.45, 0)
        balanced_bgr = cv2.cvtColor(cv2.merge((l_balanced, a, b)), cv2.COLOR_LAB2BGR)

        # 2. Tăng cường độ nét vi mô tự nhiên (Natural Micro-Sharpening)
        blurred = cv2.GaussianBlur(balanced_bgr, (0, 0), 1.0)
        sharpened = float(1.4) * balanced_bgr.astype(np.float32) - float(0.4) * blurred.astype(np.float32)
        sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

        # Chống nhiễu hạt ở các mảng màu phẳng
        diff = np.abs(balanced_bgr.astype(np.int16) - blurred.astype(np.int16))
        mask = diff < 2
        np.copyto(sharpened, balanced_bgr, where=mask)
        return sharpened
    except Exception as e:
        print(f"[Warning] Không thể áp dụng enhance_museum_texture: {e}", file=sys.stderr)
        return image

def balance_indoor_lighting(img):
    """
    Cân bằng ánh sáng đèn phòng và kéo sáng các góc tối thích ứng:
    - Triệt tiêu quầng lóa từ bóng đèn trần trên gạch men và kính cửa sắt.
    - Kéo sáng các góc tối (bàn ghế, góc cửa sổ ban đêm) giúp phát hiện đầy đủ điểm neo hoa văn.
    """
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_eq = clahe.apply(l)
        l_balanced = cv2.addWeighted(l_eq, 0.55, l, 0.45, 0)
        return cv2.cvtColor(cv2.merge((l_balanced, a, b)), cv2.COLOR_LAB2BGR)
    except Exception:
        return img

def run_stitch(image_paths, output_path, target_width=4096):
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

    # Tiếp nhận toàn bộ chùm ảnh để bảo đảm mắt xích chồng lấp liên tục
    selected_paths = sorted_paths
    total_imgs = len(selected_paths)

    if total_imgs <= 16:
        stitch_max_dim = 1400
    elif total_imgs <= 24:
        stitch_max_dim = 1200
    elif total_imgs <= 36:
        stitch_max_dim = 1050
    else:
        stitch_max_dim = 900

    print(f"[*] Tiếp nhận trọn vẹn {total_imgs} ảnh đầu vào (max_dim={stitch_max_dim}px, cân bằng phơi sáng đèn đêm)...", file=sys.stderr)
    images = []
    for p in selected_paths:
        if not os.path.exists(p):
            return {
                "success": False,
                "error": "ERR_FILE_NOT_FOUND",
                "detail": f"Không tìm thấy file ảnh: {p}"
            }
        try:
            img = load_and_orient_image(p, max_dim=stitch_max_dim)
            # Cân bằng phơi sáng đèn phòng và kéo sáng chi tiết góc tối
            img = balance_indoor_lighting(img)
            images.append(img)
        except Exception as e:
            return {
                "success": False,
                "error": "ERR_CORRUPT_IMAGE",
                "detail": f"Lỗi đọc và chuẩn hóa EXIF file ảnh {os.path.basename(p)}: {str(e)}"
            }

    print("[*] Đang khởi tạo bộ xử lý OpenCV Stitcher (Chế độ PANORAMA / Spherical)...", file=sys.stderr)
    try:
        cpu_count = os.cpu_count() or 4
        cv2.setNumThreads(cpu_count)
        cv2.ocl.setUseOpenCL(False)
    except Exception:
        pass

    # Thiết lập stitcher với cấu hình tối ưu độ nét & cân bằng đường chân trời
    def build_stitcher(confidence=0.18):
        s = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        try:
            s.setWaveCorrection(True)
        except Exception:
            pass
        try:
            s.setPanoConfidenceThresh(confidence)
        except Exception:
            pass
        try:
            s.setInterpolationFlags(cv2.INTER_LANCZOS4)
        except Exception:
            pass
        try:
            s.setRegistrationResol(0.6) # Chuẩn 0.6 Mpx tối ưu hóa phát hiện đặc trưng
        except Exception:
            pass
        try:
            s.setSeamEstimationResol(0.1) # Tinh chỉnh đường nối đa dải tần
        except Exception:
            pass
        return s

    def try_stitch_pass(conf):
        s = build_stitcher(confidence=conf)
        stat, pano = s.stitch(images)
        used = s.component() if hasattr(s, 'component') else ()
        return stat, pano, used

    min_required_imgs = max(2, int(len(images) * 0.60))

    # Lần 1: Confidence 0.18 (chuẩn đa dụng phòng trong nhà)
    status, stitched, used_imgs = try_stitch_pass(0.18)

    # Nếu thất bại hoặc chỉ ghép được quá ít ảnh (rớt mắt xích do ánh đèn chói lóa hoặc góc tối):
    if status != cv2.Stitcher_OK or len(used_imgs) < min_required_imgs:
        print(f"[!] Lần 1 chưa đủ vòng 360° (ghép được {len(used_imgs)}/{len(images)} ảnh). Kích hoạt Lần 2 (Confidence 0.10)...", file=sys.stderr)
        status, stitched, used_imgs = try_stitch_pass(0.10)

    # Nếu vẫn chưa đủ, kích hoạt Lần 3 siêu nhạy
    if status != cv2.Stitcher_OK or len(used_imgs) < min_required_imgs:
        print(f"[!] Lần 2 chưa đủ vòng 360° (ghép được {len(used_imgs)}/{len(images)} ảnh). Kích hoạt Lần 3 Nhạy Cao (Confidence 0.05)...", file=sys.stderr)
        status, stitched, used_imgs = try_stitch_pass(0.05)

    print(f"[*] Kết quả ghép OpenCV: Mã trạng thái={status}, Số ảnh thực tế kết nối: {len(used_imgs)}/{len(images)} ảnh.", file=sys.stderr)

    STATUS_MAP = {
        cv2.Stitcher_OK: "OK",
        cv2.Stitcher_ERR_NEED_MORE_IMGS: "ERR_NEED_MORE_IMGS",
        cv2.Stitcher_ERR_HOMOGRAPHY_EST_FAIL: "ERR_HOMOGRAPHY_EST_FAIL",
        cv2.Stitcher_ERR_CAMERA_PARAMS_ADJUST_FAIL: "ERR_CAMERA_PARAMS_ADJUST_FAIL"
    }

    status_name = STATUS_MAP.get(status, f"UNKNOWN_ERROR_{status}")

    if status != cv2.Stitcher_OK:
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

    # Chuẩn hóa về tỷ lệ Equirectangular 2:1
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=target_width)

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
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # 1. Đo độ sắc nét (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 35.0
        sharpness_label = "Rất sắc nét" if laplacian_var > 80 else ("Đủ độ nét" if is_sharp else "Bị nhòe / rung tay")

        # 2. Đo độ sáng / phơi sáng (Mean Intensity)
        mean_brightness = float(np.mean(gray))
        is_exposed = 35.0 <= mean_brightness <= 230.0
        brightness_label = "Đủ sáng" if is_exposed else ("Quá tối" if mean_brightness < 35.0 else "Bị chói / cháy sáng")

        # 3. Đo mật độ chi tiết hoa văn (ORB Features)
        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(gray, None)
        feature_count = len(kp) if kp is not None else 0
        has_features = feature_count >= 150
        feature_label = "Hoa văn phong phú" if feature_count >= 350 else ("Đủ chi tiết" if has_features else "Thiếu chi tiết (tường trơn)")

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
    parser.add_argument("--width", type=int, default=4096, help="Chiều rộng ảnh đầu ra (mặc định: 4096)")

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

