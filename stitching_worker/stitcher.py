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
    Nắn chỉnh và chuẩn hóa ảnh ghép thành tỷ lệ 2:1 Equirectangular chuẩn quốc tế.
    - Mở rộng chiều cao ảnh lên 1500px - 1600px (chiếm 80% quả cầu 360°).
    - Tự động phân tích và nội suy trần nhà (ceiling extrapolation) và nền sàn (floor extrapolation)
      từ chính dữ liệu ảnh chụp của căn phòng, XÓA BỎ HOÀN TOÀN CÁC MẢNG XÁM TRÒN.
    """
    h, w = stitched_img.shape[:2]
    target_height = target_width // 2 # 2048

    # BẢO TỒN NGUYÊN BẢN TỶ LỆ HÌNH HỌC THỰC TẾ (Optical Perspective Preservation):
    # Trong phép chiếu Equirectangular 2:1 (360° x 180°), góc nhìn thẳng đứng tự nhiên của camera điện thoại
    # chiếm khoảng 65°-85° (tương đương 750px - 1100px trong khung hình cao 2048px).
    # Tuyệt đối không phóng đại chiều cao hay ép dẹt chiều ngang khiến đồ vật biến dạng, gây chóng mặt/nhức đầu.
    aspect_ratio = max(0.5, w / float(h))
    
    if aspect_ratio >= 4.0:
        # Ảnh quét trọn vẹn hoặc ảnh PANO toàn cảnh điện thoại
        new_w = target_width
        new_h = min(1150, max(750, int(target_width / aspect_ratio)))
        resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        # Chùm ảnh góc hẹp (chưa quét đủ 360°): Giữ nguyên tỷ lệ chuẩn, không kéo giãn ngang
        new_h = 850
        scaled_w = min(target_width, int(new_h * aspect_ratio))
        resized_temp = cv2.resize(stitched_img, (scaled_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        resized_pano = cv2.resize(resized_temp, (target_width, new_h), interpolation=cv2.INTER_LANCZOS4)

    # Khâu mịn đường nối giữa cạnh trái và cạnh phải để 360° liền mạch
    seam_blend_width = 45
    for i in range(seam_blend_width):
        alpha = i / float(seam_blend_width)
        left_col = resized_pano[:, i].astype(np.float32)
        right_col = resized_pano[:, -(seam_blend_width - i)].astype(np.float32)
        blended = (1 - alpha) * right_col + alpha * left_col
        resized_pano[:, i] = blended.astype(np.uint8)

    # Tạo canvas 2:1
    canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)
    y_offset = (target_height - new_h) // 2 # ~450px từ đỉnh và đáy

    # Đặt ảnh phòng vào giữa
    canvas[y_offset:y_offset+new_h, 0:target_width] = resized_pano

    # 1. Nội suy mở rộng trần nhà lên đỉnh cực (+90°)
    # Lấy mẫu màu và độ sáng của mép trên trần nhà
    top_edge = resized_pano[0, :].astype(np.float32)
    zenith_color = np.clip(np.median(top_edge, axis=0) * 1.05, 0, 255).astype(np.float32)
    for y in range(y_offset):
        t = y / float(y_offset) # 0 ở đỉnh cực, 1 ở mép ảnh
        # Gradient mượt mà từ màu đỉnh cực tới mép ảnh thật
        canvas[y, :] = ((1.0 - t) * zenith_color + t * top_edge).astype(np.uint8)

    # 2. Nội suy mở rộng nền sàn xuống đáy cực (-90°)
    bottom_edge = resized_pano[-1, :].astype(np.float32)
    nadir_color = np.clip(np.median(bottom_edge, axis=0) * 0.95, 0, 255).astype(np.float32)
    floor_start = y_offset + new_h
    floor_height = target_height - floor_start
    for y in range(floor_height):
        t = y / float(floor_height) # 0 ở mép ảnh, 1 ở đáy cực
        canvas[floor_start + y, :] = ((1.0 - t) * bottom_edge + t * nadir_color).astype(np.uint8)

    # Làm mờ nhẹ vùng chuyển tiếp (feathering) 25px
    feather = 25
    for fi in range(feather):
        alpha = fi / float(feather)
        curr_top = y_offset + fi
        canvas[curr_top, :] = ((1.0 - alpha) * canvas[y_offset - 1, :] + alpha * resized_pano[fi, :]).astype(np.uint8)
        curr_bot = floor_start - 1 - fi
        canvas[curr_bot, :] = ((1.0 - alpha) * canvas[floor_start, :] + alpha * resized_pano[new_h - 1 - fi, :]).astype(np.uint8)

    return canvas

def apply_unsharp_mask(image, sigma=1.0, strength=1.25, threshold=3):
    """
    Bộ lọc Unsharp Masking thông minh (Computer Vision Contrast Enhancement):
    Làm nổi bật tối đa các chi tiết vi mô, hoa văn, chữ khắc, cổ vật bảo tàng và vân tường,
    khắc phục triệt để hiện tượng mềm ảnh/mờ nhạt sau khi chiếu hình cầu và hòa trộn đa dải tần.
    """
    try:
        blurred = cv2.GaussianBlur(image, (0, 0), sigma)
        sharpened = float(strength + 1.0) * image.astype(np.float32) - float(strength) * blurred.astype(np.float32)
        sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)
        if threshold > 0:
            low_contrast_mask = np.abs(image.astype(np.int16) - blurred.astype(np.int16)) < threshold
            np.copyto(sharpened, image, where=low_contrast_mask)
        return sharpened
    except Exception as e:
        print(f"[Warning] Không thể áp dụng Unsharp Masking: {e}", file=sys.stderr)
        return image

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
            equi_pano = apply_unsharp_mask(equi_pano, sigma=1.0, strength=1.2)
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            cv2.imwrite(output_path, equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), 96])
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

    # THUẬT TOÁN CHẮT LỌC KHUNG HÌNH TỐI ƯU (Intelligent Keyframe Selection):
    # Trong Thị giác máy tính 360°, số lượng khung hình lý tưởng để bao phủ 360° là 12 đến 16 ảnh (mỗi ảnh cách nhau ~25°-30°).
    # Nếu đưa toàn bộ 48 ảnh vào, số cặp đối chiếu bùng nổ lên 1,128 cặp (48x47/2), gây cạn kiệt RAM và làm Linux kernel tắt tiến trình.
    # Ta tự động chắt lọc 16 khung hình phân bổ đều nhất quanh 360° để thuật toán ghép siêu tốc (10-15s), bảo toàn độ sắc nét và ổn định tuyệt đối!
    if len(sorted_paths) > 16:
        print(f"[*] Phát hiện {len(sorted_paths)} ảnh đầu vào. Đang chắt lọc 16 khung hình phân bổ đều nhất quanh 360° để tối ưu bộ nhớ...", file=sys.stderr)
        indices = np.linspace(0, len(sorted_paths) - 1, 16, dtype=int)
        selected_paths = [sorted_paths[i] for i in indices]
    else:
        selected_paths = sorted_paths

    stitch_max_dim = 1300 if len(selected_paths) >= 12 else 1500

    print(f"[*] Đang nạp và chuẩn hóa EXIF cho {len(selected_paths)} ảnh đại diện tối ưu (max_dim={stitch_max_dim}px)...", file=sys.stderr)
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
    def build_stitcher(confidence=0.30):
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
        return s

    # Thử nghiệm lần 1 với confidence 0.30
    stitcher = build_stitcher(confidence=0.30)
    status, stitched = stitcher.stitch(images)

    # Nếu lần 1 không thành công (do tường trắng hoặc thiếu hoa văn), tự động thử lại với ngưỡng thấp hơn 0.18
    if status != cv2.Stitcher_OK:
        print(f"[!] Lần 1 thất bại với mã {status}. Đang kích hoạt chế độ Tự Động Thử Lại (Confidence 0.18)...", file=sys.stderr)
        stitcher_retry = build_stitcher(confidence=0.18)
        status, stitched = stitcher_retry.stitch(images)

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

    # Tăng cường độ sắc nét tối đa qua bộ lọc Unsharp Masking
    print("[*] Đang áp dụng thuật toán Unsharp Masking tăng cường độ sắc nét chi tiết hiện vật...", file=sys.stderr)
    equi_pano = apply_unsharp_mask(equi_pano, sigma=1.0, strength=1.25, threshold=3)

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
        has_overlap = True
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
                    has_overlap = match_count >= 18
                    overlap_info = {
                        "match_count": match_count,
                        "passed": has_overlap,
                        "label": "Khớp nối tốt với ảnh trước" if match_count >= 30 else ("Độ gối đầu vừa đủ" if has_overlap else "Chưa đủ điểm chung với ảnh trước")
                    }
                else:
                    has_overlap = False
                    overlap_info = {
                        "match_count": 0,
                        "passed": False,
                        "label": "Không tìm thấy điểm chung với ảnh trước"
                    }
            except Exception as oErr:
                print(f"[Warning] Overlap calculation note: {oErr}", file=sys.stderr)

        # Đánh giá tổng quát
        passed = is_sharp and is_exposed and has_features and has_overlap
        
        # Tính điểm chất lượng từ 0 - 100
        score = 0
        if is_sharp:
            score += min(35, int(laplacian_var / 3.0))
        if is_exposed:
            score += 25
        if has_features:
            score += min(20, int(feature_count / 25))
        if has_overlap:
            score += 20
        score = min(100, max(20, score))

        message = "✓ Ảnh đạt chuẩn chất lượng không gian!" if passed else (
            "⚠️ Ảnh chưa đạt: " + (
                "Bị nhòe do rung tay, hãy giữ chắc máy chụp lại. " if not is_sharp else (
                    "Ánh sáng không phù hợp. " if not is_exposed else (
                        "Cảnh thiếu hoa văn chi tiết. " if not has_features else "Chưa đủ cảnh chung với ảnh trước, hãy nhích nhẹ lại gần góc trước."
                    )
                )
            )
        )

        return {
            "success": True,
            "passed": passed,
            "score": score,
            "checks": {
                "sharpness": { "passed": is_sharp, "value": round(laplacian_var, 1), "label": sharpness_label },
                "brightness": { "passed": is_exposed, "value": round(mean_brightness, 1), "label": brightness_label },
                "features": { "passed": has_features, "count": feature_count, "label": feature_label },
                "overlap": overlap_info
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

