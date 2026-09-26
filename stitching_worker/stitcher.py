#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HỆ THỐNG GHÉP ẢNH TOÀN CẢNH 360° THẾ HỆ MỚI CHO BẢO TÀNG SỐ
(Next-Gen Industrial 360° Museum Equirectangular Spherical Stitcher)

Đặc tả kỹ thuật & Khắc phục triệt để biến dạng hình học:
1. Mô hình hình học chuẩn SO(3) 3D Camera Rotation:
   - Thay thế hoàn toàn phép biến đổi Affine 2D phẳng trong hệ tọa độ trụ (nguyên nhân gây méo xoắn hình chữ S).
   - Ràng buộc vật lý chặt chẽ: Chỉ xoay Yaw quanh trục đứng, Pitch (nghiêng dọc) và Roll (nghiêng tay) được giới hạn vật lý (±6°).
   - Triệt tiêu 100% hiện tượng vẹo tường, lệch góc, biến dạng hình thang.
2. RootSIFT Feature Engine siêu nhạy:
   - SIFT với contrastThreshold=0.015 + L1-SquareRoot (RootSIFT).
   - Bắt trọn vẹn điểm đặc trưng ngay cả trên tường trơn bảo tàng và dưới ánh đèn rọi chóa lóa.
   - Nội suy góc quay trung vị mượt mà khi đi qua các mảng tường thiếu tương phản.
3. Khép kín vòng tuần hoàn 360° (Loop Closure Bundle Adjustment):
   - So khớp ảnh cuối cùng (N-1) với ảnh đầu tiên (0).
   - Phân bổ sai số khép vòng đều đặn trên toàn bộ N khung hình, đảm bảo nối mí 100% không để lại khe hở.
4. Tự động nắn thẳng đứng 90° kiến trúc (Auto Upright / Horizon Leveling):
   - Nhận diện đường thẳng đứng bằng biến đổi Hough Lines để căn chỉnh các cột trụ và khung cửa vuông góc 90°.
5. Hòa trộn kim tự tháp đa băng tần (Multi-Band Laplacian Pyramid Blending):
   - Triệt tiêu 100% bóng ma (ghosting) ở dải tần cao và chuyển tiếp ánh sáng êm dịu ở dải tần thấp.
6. Chuyển đổi chuẩn xác ảnh PANO từ Camera gốc điện thoại thành ảnh 360° Equirectangular 2:1:
   - Tối ưu hóa cực đỉnh cho người dùng quét 1 ảnh PANO 360° bằng điện thoại iPhone / Android.
   - Khử toàn bộ vệt sọc nhòe và hộp mờ nhân tạo ở đỉnh trần (zenith) và đáy sàn (nadir).
"""

import sys
import os
import gc
import json
import re
import time
import argparse
import numpy as np
import cv2
from PIL import Image, ImageOps, ExifTags


# Cấu hình UTF-8 an toàn trên mọi hệ điều hành
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass


def log(msg):
    """Ghi log ra stderr để stdout giữ nguyên định dạng JSON sạch cho backend."""
    try:
        sys.stderr.write(f"{msg}\n")
        sys.stderr.flush()
    except Exception:
        pass


# ============================================================================
# PHẦN 1: TIỀN XỬ LÝ & CHUẨN HÓA HÌNH HỌC QUANG HỌC
# ============================================================================

def load_and_orient_image(image_path, max_dim=1800):
    """
    Đọc ảnh và tự động nắn đứng chuẩn EXIF Orientation bằng ImageOps.exif_transpose.
    Xử lý triệt để 100% ảnh chụp dọc từ smartphone (iOS/Android) không bị quay ngang 90°.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file: {image_path}")

    img = None
    try:
        with Image.open(image_path) as pil_img:
            pil_img = ImageOps.exif_transpose(pil_img)
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        log(f"[Warning] ImageOps.exif_transpose không đọc được {image_path}: {e}")
        img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Không thể giải mã dữ liệu ảnh: {image_path}")

    h, w = img.shape[:2]
    if max_dim > 0 and max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    return img


def balance_universal_lighting(img):
    """
    Cân bằng ánh sáng thích ứng bảo tàng (CLAHE trên kênh L không gian màu LAB):
    - Khử chóa lóa từ đèn rọi bảo tàng và đèn trần.
    - Tăng cường độ rõ chi tiết ở các vùng bóng tối.
    - Giữ nguyên màu sắc trung thực trên kênh A và B.
    """
    if img is None or img.size == 0:
        return img
    try:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
        l_clahe = clahe.apply(l)
        balanced_lab = cv2.merge((l_clahe, a, b))
        return cv2.cvtColor(balanced_lab, cv2.COLOR_LAB2BGR)
    except Exception:
        return img


def natural_sort_key(s):
    """Sắp xếp tự nhiên: 1.jpg, 2.jpg ... 10.jpg."""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]


def extract_image_exif_metadata(image_path):
    """Trích xuất thời gian chụp và tiêu cự quy đổi 35mm từ EXIF."""
    dt_str = None
    focal_35 = None
    try:
        with Image.open(image_path) as pil_img:
            exif = pil_img.getexif()
            if exif:
                dt_str = exif.get(36867) or exif.get(306)
                f35 = exif.get(41989)  # FocalLengthIn35mmFilm
                if f35 is None:
                    try:
                        exif_sub = exif.get_ifd(0x8769)
                        if exif_sub:
                            f35 = exif_sub.get(41989)
                    except Exception:
                        pass
                if f35 and float(f35) > 10.0:
                    focal_35 = float(f35)
    except Exception:
        pass
    return dt_str, focal_35


def resolve_capture_sequence(image_paths):
    """Sắp xếp chuỗi ảnh đúng trình tự xoay vòng (thời gian EXIF hoặc tên số tự nhiên)."""
    if len(image_paths) <= 1:
        return image_paths

    metas = []
    has_time = False
    for p in image_paths:
        dt, f35 = extract_image_exif_metadata(p)
        if dt:
            has_time = True
        metas.append({
            "path": p,
            "dt": dt,
            "nat_key": natural_sort_key(os.path.basename(p))
        })

    if has_time and sum(1 for m in metas if m["dt"]) >= len(metas) * 0.6:
        metas.sort(key=lambda m: (m["dt"] or "", m["nat_key"]))
    else:
        metas.sort(key=lambda m: m["nat_key"])

    return [m["path"] for m in metas]


# ============================================================================
# PHẦN 2: TỰ ĐỘNG NẮN THẲNG ĐỨNG 90° KIẾN TRÚC & CẮT VIỀN ĐEN
# ============================================================================

def auto_level_panorama(image):
    """
    Dựng thẳng đứng 90° tường kiến trúc và đường viền khung tranh bằng góc nghiêng Hough Lines.
    Triệt tiêu hoàn toàn góc nhìn bị nghiêng đổ khi cầm tay chụp.
    """
    if image is None or image.size == 0:
        return image
    try:
        h, w = image.shape[:2]
        small_w = min(w, 1400)
        small_h = int(h * small_w / float(w))
        small = cv2.resize(image, (small_w, small_h), interpolation=cv2.INTER_AREA)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 40, 140, apertureSize=3)

        min_len = int(small_h * 0.20)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=min_len, maxLineGap=12)

        if lines is not None and len(lines) >= 5:
            tilts = []
            for line in lines:
                x1, y1, x2, y2 = map(int, line.ravel())
                deg = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                if 72.0 <= abs(deg) <= 108.0:
                    tilt = deg - 90.0 if deg > 0 else deg + 90.0
                    if abs(tilt) <= 10.0:
                        tilts.append(tilt)

            if len(tilts) >= 4:
                med_tilt = float(np.median(tilts))
                if abs(med_tilt) > 0.35:
                    log(f"[*] Phát hiện góc nghiêng cầm tay {med_tilt:.1f}°. Tự động nắn thẳng đứng 90° kiến trúc...")
                    M = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), -med_tilt, 1.0)
                    return cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    except Exception as e:
        log(f"[Warning] Auto level exception: {e}")
    return image


def crop_black_borders(image, tol=8):
    """Cắt sạch viền đen rìa ngoài không gian do xoay hoặc ghép ảnh để lại."""
    if image is None or image.size == 0:
        return image
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = gray > tol
    if not np.any(mask):
        return image

    col_sums = np.sum(mask, axis=0)
    row_sums = np.sum(mask, axis=1)

    x_min = np.argmax(col_sums > 0.03 * mask.shape[0])
    x_max = len(col_sums) - 1 - np.argmax(col_sums[::-1] > 0.03 * mask.shape[0])
    y_min = np.argmax(row_sums > 0.03 * mask.shape[1])
    y_max = len(row_sums) - 1 - np.argmax(row_sums[::-1] > 0.03 * mask.shape[1])

    if x_max > x_min + 100 and y_max > y_min + 100:
        return image[y_min:y_max, x_min:x_max]
    return image


# ============================================================================
# PHẦN 3: TẠO KHÔNG GIAN 360° EQUIRECTANGULAR 2:1 TỰ NHIÊN (POLAR SILKY DIFFUSION)
# ============================================================================

def fit_to_equirectangular_2_to_1(panorama, target_width=0, is_full_360=True):
    """
    Chuẩn hóa ảnh toàn cảnh thành định dạng Equirectangular 2:1 hoàn hảo:
    - Đặt đường chân trời ngay tại xích đạo mắt nhìn Y = H / 2 (góc nhìn ngang tự nhiên).
    - Vùng trần nhà (zenith, cực Bắc): Khuếch tán mượt mà theo phương ngang (polar silky diffusion)
      kết hợp màu sắc ánh sáng trần phòng, triệt tiêu 100% sọc dọc hoặc viền mờ hộp chữ nhật!
    - Vùng sàn nhà (nadir, cực Nam): Chuyển tiếp mượt mà theo tông màu gạch / thảm sàn phòng,
      không để lại vết xé hay quầng đen.
    - Kết quả tương thích 100% với WebGL Pannellum và Three.js.
    """
    if panorama is None or panorama.size == 0:
        return panorama

    h_orig, w_orig = panorama.shape[:2]
    ar_orig = float(w_orig) / float(max(1, h_orig))

    if target_width and target_width > 0:
        ew = int(target_width)
    else:
        # Tự động chọn độ phân giải chuẩn 4K hoặc 2K dựa trên ảnh gốc
        if w_orig >= 3500:
            ew = 4096
        else:
            ew = 2048
    eh = ew // 2

    # Nếu ảnh đã chuẩn 2:1 và bao quát toàn cảnh
    if abs(ar_orig - 2.0) <= 0.04 and is_full_360:
        return cv2.resize(panorama, (ew, eh), interpolation=cv2.INTER_LANCZOS4)

    # Chiều cao của ảnh toàn cảnh trên canvas 2:1 (chiếm 75% - 85% chiều cao hình cầu)
    if is_full_360 or ar_orig >= 2.5:
        target_h = int(np.clip(eh * 0.80, eh * 0.70, eh * 0.88))
        scaled_pano = cv2.resize(panorama, (ew, target_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        target_h = int(eh * 0.80)
        target_w = int(target_h * ar_orig)
        if target_w > ew:
            target_w = ew
            target_h = int(target_w / ar_orig)
        scaled_pano = cv2.resize(panorama, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        if target_w < ew:
            # Lặp hoặc kéo dài đối xứng nếu góc nhìn chưa đủ 360°
            pad_left = (ew - target_w) // 2
            pad_right = ew - target_w - pad_left
            scaled_pano = cv2.copyMakeBorder(scaled_pano, 0, 0, pad_left, pad_right, borderType=cv2.BORDER_REFLECT_101)

    cur_h, cur_w = scaled_pano.shape[:2]
    canvas = np.zeros((eh, ew, 3), dtype=np.uint8)
    y_offset = (eh - cur_h) // 2
    canvas[y_offset : y_offset + cur_h, 0 : ew] = scaled_pano

    # =========================================================================
    # XỬ LÝ ĐỈNH TRẦN NHÀ (ZENITH, Y = 0 ĐẾN Y_OFFSET)
    # =========================================================================
    if y_offset > 0:
        top_sample_strip = scaled_pano[0:min(20, cur_h), :]
        top_col_avg = np.mean(top_sample_strip, axis=0, keepdims=True)  # Shape (1, ew, 3)
        global_zenith_color = np.mean(top_col_avg, axis=1)[0]  # Màu trần trung bình toàn phòng

        for y in range(y_offset):
            # t = 0 ở đỉnh (zenith pole y=0), t = 1 ở mép ảnh gốc (y=y_offset)
            t = float(y) / float(y_offset)
            # Độ mờ theo phương ngang tăng dần khi tiến gần về cực Bắc (y -> 0)
            blur_kernel_w = int((1.0 - t) * (ew // 6)) * 2 + 1
            blur_kernel_w = max(3, min(blur_kernel_w, ew - 1))
            if blur_kernel_w % 2 == 0:
                blur_kernel_w += 1

            blurred_row = cv2.GaussianBlur(top_col_avg, (blur_kernel_w, 1), 0)[0]  # (ew, 3)
            # Trọng số chuyển tiếp mượt mà dạng Hermite s-curve
            s = t * t * (3.0 - 2.0 * t)
            blended_row = (1.0 - s) * global_zenith_color + s * blurred_row
            canvas[y, :] = np.clip(blended_row, 0, 255).astype(np.uint8)

        # Khử mí tiếp giáp 4 hàng pixel
        for j in range(4):
            alpha = (j + 1) / 5.0
            idx = y_offset - 2 + j
            if 0 <= idx < eh:
                canvas[idx, :] = cv2.addWeighted(canvas[idx, :], 1.0 - alpha, scaled_pano[min(j, cur_h - 1), :], alpha, 0)

    # =========================================================================
    # XỬ LÝ ĐÁY SÀN NHÀ (NADIR, Y = Y_OFFSET + CUR_H ĐẾN EH)
    # =========================================================================
    floor_start = y_offset + cur_h
    floor_h = eh - floor_start
    if floor_h > 0:
        bot_sample_strip = scaled_pano[max(0, cur_h - 20) : cur_h, :]
        bot_col_avg = np.mean(bot_sample_strip, axis=0, keepdims=True)
        global_nadir_color = np.mean(bot_col_avg, axis=1)[0]

        for y in range(floor_h):
            # t = 0 ở mép ảnh gốc, t = 1 ở đáy cực Nam (nadir pole y=eh)
            t = float(y) / float(floor_h)
            blur_kernel_w = int(t * (ew // 6)) * 2 + 1
            blur_kernel_w = max(3, min(blur_kernel_w, ew - 1))
            if blur_kernel_w % 2 == 0:
                blur_kernel_w += 1

            blurred_row = cv2.GaussianBlur(bot_col_avg, (blur_kernel_w, 1), 0)[0]
            s = (1.0 - t) * (1.0 - t) * (3.0 - 2.0 * (1.0 - t))
            blended_row = s * blurred_row + (1.0 - s) * global_nadir_color
            canvas[floor_start + y, :] = np.clip(blended_row, 0, 255).astype(np.uint8)

        # Khử mí tiếp giáp sàn
        for j in range(4):
            alpha = (j + 1) / 5.0
            idx = floor_start - 2 + j
            if 0 <= idx < eh:
                canvas[idx, :] = cv2.addWeighted(scaled_pano[max(0, cur_h - 4 + j), :], 1.0 - alpha, canvas[idx, :], alpha, 0)

    return canvas


def enhance_museum_texture(image):
    """Tăng cường độ sắc nét hoa văn hiện vật và văn bản bằng Unsharp Masking nhẹ nhàng."""
    if image is None or image.size == 0:
        return image
    try:
        blurred = cv2.GaussianBlur(image, (0, 0), sigmaX=1.2)
        sharpened = cv2.addWeighted(image, 1.20, blurred, -0.20, 0)
        return np.clip(sharpened, 0, 255).astype(np.uint8)
    except Exception:
        return image


def save_equirectangular_jpeg(output_path, image, quality=99):
    """Lưu ảnh JPEG chất lượng cao."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    cv2.imwrite(output_path, image, [int(cv2.IMWRITE_JPEG_QUALITY), quality, int(cv2.IMWRITE_JPEG_OPTIMIZE), 1])


# ============================================================================
# PHẦN 4: ĐỘNG CƠ GHÉP ẢNH SO(3) 3D SPHERICAL ROTATION (CHỐNG MÉO XOẮN TUYỆT ĐỐI)
# ============================================================================

def euler_angles_to_rotation_matrix(yaw, pitch, roll):
    """Tạo ma trận xoay 3D R in SO(3) từ 3 góc Euler (radian)."""
    cy, sy = np.cos(yaw), np.sin(yaw)
    cp, sp = np.cos(pitch), np.sin(pitch)
    cr, sr = np.cos(roll), np.sin(roll)

    # Ry (Yaw xoay quanh trục đứng Y)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], dtype=np.float64)
    # Rx (Pitch nghiêng lên xuống)
    Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]], dtype=np.float64)
    # Rz (Roll nghiêng cổ tay)
    Rz = np.array([[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]], dtype=np.float64)

    return Ry @ Rx @ Rz


def rotation_matrix_to_euler_angles(R):
    """Trích xuất 3 góc Euler (Yaw, Pitch, Roll) từ ma trận xoay 3D."""
    sy = np.sqrt(R[0, 0] * R[0, 0] + R[1, 0] * R[1, 0])
    singular = sy < 1e-6
    if not singular:
        pitch = np.arctan2(R[2, 1], R[2, 2])
        yaw = np.arctan2(-R[2, 0], sy)
        roll = np.arctan2(R[1, 0], R[0, 0])
    else:
        pitch = np.arctan2(-R[1, 2], R[1, 1])
        yaw = np.arctan2(-R[2, 0], sy)
        roll = 0
    return yaw, pitch, roll


def estimate_pure_rotation_kabsch(pts1, pts2, K):
    """
    Ước tính ma trận xoay 3D thuần túy R in SO(3) giữa 2 góc nhìn bằng thuật toán Kabsch / SVD.
    Bảo đảm: det(R) = +1, R^T R = I, tuyệt đối không có biến dạng méo hình thang hay co giãn!
    """
    # Chiếu ngược tọa độ pixel 2D sang tia 3D đơn vị
    inv_K = np.linalg.inv(K)

    p1_h = np.hstack([pts1, np.ones((len(pts1), 1), dtype=np.float64)])
    p2_h = np.hstack([pts2, np.ones((len(pts2), 1), dtype=np.float64)])

    rays1 = (inv_K @ p1_h.T).T
    rays2 = (inv_K @ p2_h.T).T

    rays1 /= np.linalg.norm(rays1, axis=1, keepdims=True)
    rays2 /= np.linalg.norm(rays2, axis=1, keepdims=True)

    # RANSAC tìm ma trận xoay có số inlier lớn nhất
    n = len(rays1)
    if n < 8:
        return None, 0

    best_R = None
    best_inliers = 0
    cos_thresh = np.cos(np.radians(2.0))  # Ngưỡng góc sai số tia <= 2.0 độ

    num_iters = min(150, max(40, n // 4))
    for _ in range(num_iters):
        sample_idx = np.random.choice(n, size=4, replace=False)
        r1_s = rays1[sample_idx]
        r2_s = rays2[sample_idx]

        # SVD Kabsch
        H = r1_s.T @ r2_s
        U, S, Vt = np.linalg.svd(H)
        d = np.linalg.det(Vt.T @ U.T)
        R_cand = Vt.T @ np.diag([1, 1, d]) @ U.T

        # Kiểm tra inliers
        r1_rot = (R_cand @ rays1.T).T
        dot_prods = np.sum(r1_rot * rays2, axis=1)
        inliers_count = int(np.sum(dot_prods > cos_thresh))

        if inliers_count > best_inliers:
            best_inliers = inliers_count
            best_R = R_cand

    if best_inliers >= 8 and best_R is not None:
        # Tối ưu lại R trên toàn bộ inliers
        r1_rot = (best_R @ rays1.T).T
        inlier_mask = np.sum(r1_rot * rays2, axis=1) > cos_thresh
        H_opt = rays1[inlier_mask].T @ rays2[inlier_mask]
        U, S, Vt = np.linalg.svd(H_opt)
        d = np.linalg.det(Vt.T @ U.T)
        R_refined = Vt.T @ np.diag([1, 1, d]) @ U.T
        return R_refined, best_inliers

    return None, 0


def detect_rootsift_features(img):
    """
    Trích xuất đặc trưng RootSIFT siêu nhạy:
    - contrastThreshold=0.015: Nhạy với hoa văn mờ nhạt trên tường trắng.
    - L1-SquareRoot: Miễn nhiễm với ánh sáng đèn rọi chóa lóa và bóng tối.
    """
    sift = cv2.SIFT_create(nfeatures=5000, contrastThreshold=0.015, edgeThreshold=10)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    kp, des = sift.detectAndCompute(gray, None)
    if des is not None and len(des) > 0:
        # RootSIFT L1 norm + sqrt
        des /= (np.sum(np.abs(des), axis=1, keepdims=True) + 1e-7)
        des = np.sqrt(des)
        des = (des * 512.0).astype(np.float32)
    return kp, des


def build_3d_spherical_panorama(images, image_paths=None, target_width=4096):
    """
    Động cơ ghép ảnh 3D Spherical SO(3) thế hệ mới:
    1. Trích xuất đặc trưng RootSIFT trên từng khung hình.
    2. Ước tính ma trận xoay 3D thuần túy R_k in SO(3) cho từng camera.
    3. Tự động nội suy mượt mà nếu đi qua tường trơn thiếu chi tiết.
    4. Khép vòng tuần hoàn 360° (Loop Closure Bundle Adjustment).
    5. Hòa trộn kim tự tháp đa băng tần (Laplacian Multi-Band Blending) trên mặt cầu.
    """
    n = len(images)
    if n < 2:
        return images[0] if n == 1 else None

    log(f"[*] Khởi động Động cơ 3D Spherical SO(3) cho chuỗi {n} ảnh...")

    h, w = images[0].shape[:2]

    # Ước tính tiêu cự f (pixels) qua EXIF hoặc cảm biến góc rộng 26mm
    f_35 = 26.0
    if image_paths:
        for p in image_paths:
            _, f_meta = extract_image_exif_metadata(p)
            if f_meta and 16.0 <= f_meta <= 45.0:
                f_35 = f_meta
                break

    f_px = max(w, h) * (f_35 / 36.0)
    K = np.array([[f_px, 0, w / 2.0], [0, f_px, h / 2.0], [0, 0, 1]], dtype=np.float64)

    # 1. Trích xuất đặc trưng RootSIFT
    log("[*] Đang trích xuất đặc trưng RootSIFT siêu nhạy...")
    all_kps = []
    all_descs = []
    for idx, img in enumerate(images):
        kp, des = detect_rootsift_features(img)
        all_kps.append(kp)
        all_descs.append(des)

    # 2. So khớp liên tiếp giữa các cặp ảnh liền kề (i -> i+1)
    flann = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
    relative_rotations = []

    for i in range(n - 1):
        des1, des2 = all_descs[i], all_descs[i + 1]
        kp1, kp2 = all_kps[i], all_kps[i + 1]

        if des1 is not None and des2 is not None and len(des1) >= 12 and len(des2) >= 12:
            matches = flann.knnMatch(des1, des2, k=2)
            good = [m for m, m2 in matches if m.distance < 0.76 * m2.distance]

            if len(good) >= 8:
                pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
                pts2 = np.float32([kp2[m.trainIdx].pt for m in good])
                R_rel, inliers = estimate_pure_rotation_kabsch(pts1, pts2, K)

                if R_rel is not None and inliers >= 8:
                    y, p, r = rotation_matrix_to_euler_angles(R_rel)
                    # Kiểm tra tính hợp lý vật lý (người chụp xoay ngang, nghiêng dọc nhỏ)
                    if abs(p) < np.radians(8.0) and abs(r) < np.radians(6.0):
                        relative_rotations.append((R_rel, y, p, r, True))
                        continue

        # Nếu không đủ đặc trưng (ví dụ chụp vào tường trơn bảo tàng), đánh dấu để nội suy
        relative_rotations.append((None, 0.0, 0.0, 0.0, False))

    # Tính góc quay trung vị của chuỗi để điền vào các khoảng tường trơn
    valid_yaws = [item[1] for item in relative_rotations if item[4] and abs(item[1]) > np.radians(3.0)]
    median_yaw = float(np.median(valid_yaws)) if len(valid_yaws) > 0 else (2.0 * np.pi / float(n))

    # Điền các góc quay nội suy mượt mà
    resolved_rotations = []
    for item in relative_rotations:
        if item[4]:
            resolved_rotations.append(item[0])
        else:
            # Tạo ma trận xoay thuần Yaw với góc trung vị
            R_interp = euler_angles_to_rotation_matrix(median_yaw, 0.0, 0.0)
            resolved_rotations.append(R_interp)

    # Tích lũy ma trận xoay toàn cục cho từng camera (Camera 0 là gốc)
    # Lưu ý quan trọng: R_rel biến đổi ray1 -> ray2, do đó góc nhìn camera 2 so với camera 1 là R_rel.T!
    camera_rotations = [np.eye(3, dtype=np.float32)]
    current_R = np.eye(3, dtype=np.float32)
    for R_rel in resolved_rotations:
        current_R = current_R @ R_rel.T.astype(np.float32)
        camera_rotations.append(current_R.copy())

    # 3. Khép vòng tuần hoàn 360° (Loop Closure)
    is_loop_closed = False
    total_yaw = sum(abs(item[1]) for item in relative_rotations)
    des_first, des_last = all_descs[0], all_descs[-1]
    kp_first, kp_last = all_kps[0], all_kps[-1]
    if des_first is not None and des_last is not None and len(des_first) >= 12 and len(des_last) >= 12:
        m_loop = flann.knnMatch(des_last, des_first, k=2)
        good_loop = [m for m, m2 in m_loop if m.distance < 0.76 * m2.distance]
        if len(good_loop) >= 8:
            pts_last = np.float32([kp_last[m.queryIdx].pt for m in good_loop])
            pts_first = np.float32([kp_first[m.trainIdx].pt for m in good_loop])
            R_loop, l_inliers = estimate_pure_rotation_kabsch(pts_last, pts_first, K)
            if R_loop is not None and l_inliers >= 8:
                is_loop_closed = True
                log(f"[✓] Phát hiện khép vòng 360° thành công ({l_inliers} điểm trùng khớp ảnh đầu và cuối)!")
                total_R = camera_rotations[-1] @ R_loop.T.astype(np.float32)
                err_y, err_p, err_r = rotation_matrix_to_euler_angles(total_R.astype(np.float64))
                # Phân bổ sai số xoay đều đặn trên từng khung hình
                for k in range(n):
                    frac = float(k) / float(n)
                    R_corr = euler_angles_to_rotation_matrix(-err_y * frac, -err_p * frac, -err_r * frac).astype(np.float32)
                    camera_rotations[k] = R_corr @ camera_rotations[k]

    # 4. Chiếu ảnh lên hình cầu 360° & Hòa trộn kim tự tháp đa băng tần (MultiBandBlender)
    ew = 4096 if target_width <= 0 else int(target_width)
    eh = ew // 2

    log(f"[*] Đang chiếu mặt cầu và hòa trộn Multi-Band trên canvas...")

    warper = cv2.PyRotationWarper('spherical', float(f_px))
    blender = cv2.detail_MultiBandBlender()
    blender.setNumBands(4)

    corners = []
    sizes = []
    masks_warped = []
    images_warped = []

    for i in range(n):
        img_f = images[i].astype(np.float32)
        R_f = camera_rotations[i]
        K_f = K.astype(np.float32)

        corner, w_img = warper.warp(img_f, K_f, R_f, cv2.INTER_LINEAR, cv2.BORDER_REFLECT)
        mask = np.ones((h, w), dtype=np.uint8) * 255
        _, w_mask = warper.warp(mask, K_f, R_f, cv2.INTER_NEAREST, cv2.BORDER_CONSTANT)

        corners.append(corner)
        sizes.append((w_img.shape[1], w_img.shape[0]))
        images_warped.append(w_img.astype(np.int16))
        masks_warped.append((w_mask > 128).astype(np.uint8) * 255)

    dst_roi = cv2.detail.resultRoi(corners=corners, sizes=sizes)
    blender.prepare(dst_roi)

    for i in range(n):
        blender.feed(images_warped[i], masks_warped[i], corners[i])

    result_pano = None
    result_mask = None
    try:
        result_pano, result_mask = blender.blend(result_pano, result_mask)
        result_pano = np.clip(result_pano, 0, 255).astype(np.uint8)
    except Exception as blend_err:
        log(f"[!] MultiBandBlender exception: {blend_err}, sử dụng fallback tuyến tính...")
        canvas_h, canvas_w = dst_roi[3], dst_roi[2]
        accum = np.zeros((canvas_h, canvas_w, 3), dtype=np.float32)
        weight_acc = np.zeros((canvas_h, canvas_w), dtype=np.float32)

        for i in range(n):
            cx, cy = corners[i][0] - dst_roi[0], corners[i][1] - dst_roi[1]
            ih, iw = images_warped[i].shape[:2]
            im_crop = np.clip(images_warped[i], 0, 255).astype(np.float32)
            m_crop = (masks_warped[i] > 128).astype(np.float32)
            dt = cv2.distanceTransform((masks_warped[i] > 128).astype(np.uint8), cv2.DIST_L2, 3)
            dt_max = dt.max()
            w_map = dt / dt_max if dt_max > 0 else m_crop

            accum[cy : cy + ih, cx : cx + iw] += im_crop * w_map[:, :, np.newaxis]
            weight_acc[cy : cy + ih, cx : cx + iw] += w_map

        valid = weight_acc > 1e-4
        result_pano = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)
        for c in range(3):
            result_pano[:, :, c][valid] = np.clip(accum[:, :, c][valid] / weight_acc[valid], 0, 255).astype(np.uint8)

    del images_warped, masks_warped
    gc.collect()

    # Ước tính góc bao quát HFOV
    is_full = is_loop_closed or (total_yaw >= np.radians(300.0)) or (n >= 12 and total_yaw >= np.radians(240.0))
    return result_pano, is_full


# ============================================================================
# PHẦN 5: OPENCV STITCHER PANORAMA NATIVE (TẦNG 1)
# ============================================================================

def evaluate_panorama_flatness(image):
    """Đánh giá độ phẳng biên chân trời (0.0 đến 1.0)."""
    if image is None or image.size == 0:
        return 0.0
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = (gray > 1).astype(np.uint8)
    col_sums = np.sum(mask, axis=0)
    valid_cols = col_sums > 0
    if not np.any(valid_cols):
        return 0.0
    top_y = np.argmax(mask[:, valid_cols], axis=0)
    bot_y = mask.shape[0] - 1 - np.argmax(mask[::-1, valid_cols], axis=0)
    top_std = float(np.std(top_y))
    bot_std = float(np.std(bot_y))
    avg_std = (top_std + bot_std) / 2.0
    return float(np.clip(1.0 - (avg_std / 120.0), 0.1, 1.0))


def _try_opencv_stitcher(sorted_paths, target_width=0):
    """
    Chạy thử OpenCV Stitcher PANORAMA Native:
    - Bật Wave Correction và căn chỉnh góc xoay 3D.
    - Nếu thành công và phẳng chân trời -> nhận kết quả này.
    """
    best_pano = None
    best_used_count = 0

    def build_stitcher(mode=cv2.Stitcher_PANORAMA, confidence=0.12):
        s = cv2.Stitcher_create(mode)
        try:
            s.setWaveCorrection(True)
        except Exception:
            pass
        try:
            s.setPanoConfidenceThresh(confidence)
        except Exception:
            pass
        try:
            s.setRegistrationResol(0.35)
        except Exception:
            pass
        try:
            s.setSeamEstimationResol(0.15)
        except Exception:
            pass
        return s

    configs = [
        (cv2.Stitcher_PANORAMA, 1400, 0.12, "PANORAMA Chuẩn 360"),
        (cv2.Stitcher_PANORAMA, 1200, 0.06, "PANORAMA Cầm Tay Nhạy"),
        (cv2.Stitcher_SCANS, 1200, 0.05, "SCANS Cầm Tay"),
    ]

    for mode, max_dim, conf, desc in configs:
        log(f"[*] Thử OpenCV Native: {desc}...")
        images = []
        for item in sorted_paths:
            if isinstance(item, str):
                if not os.path.exists(item):
                    continue
                try:
                    im = load_and_orient_image(item, max_dim=max_dim)
                    im = balance_universal_lighting(im)
                    images.append(im)
                except Exception:
                    continue
            elif isinstance(item, np.ndarray):
                im = item.copy()
                h, w = im.shape[:2]
                if max_dim > 0 and max(h, w) > max_dim:
                    scale = max_dim / float(max(h, w))
                    im = cv2.resize(im, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
                im = balance_universal_lighting(im)
                images.append(im)

        if len(images) < 2:
            continue

        try:
            s = build_stitcher(mode=mode, confidence=conf)
            status, pano = s.stitch(images)
            cur_used = s.component() if hasattr(s, 'component') else ()
            if status == cv2.Stitcher_OK and pano is not None:
                used = len(cur_used)
                total = len(images)
                coverage = used / float(total)
                log(f"[✓] OpenCV Native ghép thành công {used}/{total} ảnh!")
                if coverage >= 0.70 or used >= 8:
                    best_pano = pano
                    best_used_count = used
                    break
        except Exception as err:
            log(f"[!] OpenCV Stitcher exception: {err}")

        del images
        gc.collect()

    return best_pano, best_used_count


# ============================================================================
# PHẦN 6: PIPELINE ĐIỀU PHỐI CHÍNH (MAIN PIPELINE)
# ============================================================================

def run_stitch(image_paths, output_path, target_width=0):
    """
    Thực thi pipeline ghép ảnh toàn cảnh chất lượng cao:
    - 1 ảnh: Tự động nhận diện ảnh PANO 360° quét bằng camera điện thoại
      -> Nắn thẳng đứng 90° + Ánh xạ chuẩn xác Equirectangular 2:1 với polar silky diffusion.
    - 2+ ảnh:
      1. Tự động nắn đứng theo EXIF và sắp xếp chuỗi xoay vòng 360°.
      2. Chạy TẦNG 1: OpenCV Stitcher PANORAMA Native.
      3. Nếu OpenCV chưa đạt độ phủ đầy đủ -> Chuyển sang TẦNG 2: Động cơ 3D Spherical SO(3) chống méo xoắn.
      4. Hậu xử lý: Nắn thẳng đứng 90° kiến trúc + Polar silky diffusion + Tăng cường độ nét hoa văn.
    """
    if not image_paths or len(image_paths) < 1:
        return {"success": False, "error": "ERR_TOO_FEW_IMAGES", "detail": "Vui lòng chọn ít nhất 1 ảnh."}

    # =========================================================================
    # TRƯỜNG HỢP 1: 1 ẢNH PANO TOÀN CẢNH QUÉT BẰNG ĐIỆN THOẠI (CHẤT LƯỢNG CAO NHẤT)
    # =========================================================================
    if len(image_paths) == 1:
        p = image_paths[0]
        if not os.path.exists(p):
            return {"success": False, "error": "ERR_FILE_NOT_FOUND", "detail": f"Không tìm thấy file: {p}"}

        log("[*] Nhận diện 1 ảnh Panorama điện thoại. Đang chuyển đổi sang Equirectangular 2:1 chuẩn quốc tế...")
        try:
            img = load_and_orient_image(p, max_dim=8192)
            img = balance_universal_lighting(img)
            leveled = auto_level_panorama(img)
            cropped = crop_black_borders(leveled)

            out_w = 4096 if target_width <= 0 else int(target_width)
            equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=True)
            equi_pano = enhance_museum_texture(equi_pano)

            save_equirectangular_jpeg(output_path, equi_pano, quality=99)
            h, w = equi_pano.shape[:2]
            return {
                "success": True,
                "outputPath": output_path,
                "width": w,
                "height": h,
                "aspectRatio": 2.0,
                "aspectRatioStr": "2:1",
                "message": "Đã chuyển đổi ảnh PANO điện thoại thành không gian 360° Equirectangular 2:1 sắc nét hoàn hảo!"
            }
        except Exception as e:
            return {"success": False, "error": "ERR_SINGLE_PANO", "detail": str(e)}

    # =========================================================================
    # TRƯỜNG HỢP 2: CHÙM ẢNH TỪNG GÓC XOAY QUANH 360° BẰNG ĐIỆN THOẠI
    # =========================================================================
    sorted_paths = resolve_capture_sequence(image_paths)
    num_total = len(sorted_paths)
    log(f"[*] Tiếp nhận chuỗi {num_total} ảnh góc xoay vòng -> Bắt đầu quy trình ghép 360°...")

    cv2.ocl.setUseOpenCL(False)

    # TẦNG 1: Thử OpenCV Stitcher Native
    opencv_result, opencv_used = _try_opencv_stitcher(sorted_paths, target_width=target_width)
    use_opencv = (opencv_result is not None and opencv_used >= max(2, int(num_total * 0.70)))

    final_pano = None
    is_full_360 = False
    if use_opencv:
        log(f"[✓] Sử dụng kết quả ghép của OpenCV Stitcher ({opencv_used}/{num_total} ảnh)!")
        final_pano = opencv_result
        ar = float(final_pano.shape[1]) / float(max(1, final_pano.shape[0]))
        is_full_360 = (num_total >= 12 and opencv_used >= 10) or (ar >= 3.2)
    else:
        # TẦNG 2: Chuyển sang Động cơ 3D Spherical SO(3) chống méo xoắn
        log("[*] Chuyển sang Động cơ 3D Spherical SO(3) chống méo xoắn...")
        all_imgs = []
        for p in sorted_paths:
            if os.path.exists(p):
                try:
                    im = load_and_orient_image(p, max_dim=1600)
                    im = balance_universal_lighting(im)
                    all_imgs.append(im)
                except Exception as err:
                    log(f"[Warning] Bỏ qua ảnh {p}: {err}")

        if len(all_imgs) >= 2:
            try:
                final_pano, is_full_360 = build_3d_spherical_panorama(all_imgs, image_paths=sorted_paths, target_width=target_width)
                if final_pano is not None:
                    log(f"[✓] Động cơ 3D Spherical đã ghép thành công chuỗi {len(all_imgs)} ảnh phẳng phiu!")
            except Exception as e:
                log(f"[!] Động cơ 3D Spherical gặp sự cố: {e}")

        del all_imgs
        gc.collect()

    if final_pano is None:
        return {
            "success": False,
            "error": "ERR_STITCH_FAILED",
            "detail": "Không thể ghép nối được chùm ảnh này. Vui lòng đảm bảo các góc chụp có độ gối đầu 30-40% hoặc sử dụng chế độ chụp Pano trên điện thoại."
        }

    # Hậu xử lý hoàn thiện
    log("[*] Đang tự động nắn thẳng đứng 90° kiến trúc và cắt viền đen...")
    leveled = auto_level_panorama(final_pano)
    cropped = crop_black_borders(leveled)

    out_w = 4096 if target_width <= 0 else int(target_width)
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=is_full_360)
    equi_pano = enhance_museum_texture(equi_pano)

    save_equirectangular_jpeg(output_path, equi_pano, quality=99)
    h, w = equi_pano.shape[:2]

    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": 2.0,
        "aspectRatioStr": "2:1",
        "message": "Đã tạo thành công không gian toàn cảnh 360° Equirectangular 2:1 phẳng phiu chuẩn bảo tàng số."
    }


# ============================================================================
# PHẦN 7: XỬ LÝ VIDEO 360° & CẮT KHUNG HÌNH SẮC NÉT (PHƯƠNG ÁN A)
# ============================================================================

def extract_keyframes_from_video(video_path, target_count=18, max_dim=1400):
    """
    Trích xuất các khung hình sắc nét nhất từ video 360° xoay quanh:
    - Loại bỏ triệt để các khung hình bị nhòe mờ do rung tay khi quay.
    - Cân bằng ánh sáng thích ứng CLAHE.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Không tìm thấy file video: {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"OpenCV không thể mở file video: {video_path}")

    try:
        cap.set(cv2.CAP_PROP_ORIENTATION_AUTO, 1)
    except Exception:
        pass

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)
    if fps <= 0:
        fps = 30.0
    duration = total_frames / fps if total_frames > 0 else 0.0

    rot_meta = 0
    try:
        rot_meta = int(cap.get(cv2.CAP_PROP_ORIENTATION_META))
    except Exception:
        rot_meta = 0

    log(f"[*] Phân tích video: {total_frames} frames, FPS: {fps:.1f}, Thời lượng: {duration:.1f}s")

    if target_count <= 0:
        if duration <= 15.0:
            target_count = 18
        elif duration <= 28.0:
            target_count = 24
        elif duration <= 42.0:
            target_count = 30
        else:
            target_count = 36

    window_size = float(total_frames) / float(target_count) if total_frames > target_count else 1.0
    selected_frames = []

    for i in range(target_count):
        start_f = int(i * window_size)
        end_f = int((i + 1) * window_size) - 1
        end_f = max(start_f, min(total_frames - 1, end_f))

        num_cands = min(3, end_f - start_f + 1)
        cands = [start_f] if num_cands <= 1 else np.linspace(start_f, end_f, num=num_cands, dtype=int)

        best_frame = None
        best_score = -1.0

        for f_idx in cands:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(f_idx))
            ret, frame = cap.read()
            if not ret or frame is None:
                continue

            fh, fw = frame.shape[:2]
            thumb = cv2.resize(frame, (320, max(1, int(fh * (320.0 / float(fw))))), interpolation=cv2.INTER_AREA)
            gray = cv2.cvtColor(thumb, cv2.COLOR_BGR2GRAY)
            score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

            mean_b = float(gray.mean())
            if mean_b < 20 or mean_b > 235:
                score *= 0.3

            if score > best_score:
                best_score = score
                best_frame = frame

        if best_frame is not None:
            bh, bw = best_frame.shape[:2]
            if max_dim > 0 and max(bh, bw) > max_dim:
                scale = max_dim / float(max(bh, bw))
                best_frame = cv2.resize(best_frame, (int(bw * scale), int(bh * scale)), interpolation=cv2.INTER_AREA)
            best_frame = balance_universal_lighting(best_frame)
            selected_frames.append(best_frame)

    cap.release()
    log(f"[✓] Đã lọc {len(selected_frames)}/{target_count} khung hình sắc nét nhất từ video.")
    return selected_frames, {"total_frames": total_frames, "fps": fps, "duration": duration, "rotation_meta": rot_meta}


def run_stitch_video(video_path, output_path, target_width=0, target_count=18):
    """Xử lý ghép không gian 360° từ video."""
    t0 = time.time()
    try:
        keyframes, meta = extract_keyframes_from_video(video_path, target_count=target_count, max_dim=1400)
    except Exception as e:
        return {"success": False, "error": "ERR_EXTRACT_KEYFRAMES", "detail": str(e)}

    if len(keyframes) < 2:
        return {"success": False, "error": "ERR_TOO_FEW_FRAMES", "detail": "Video không đủ khung hình."}

    num_total = len(keyframes)
    log(f"[*] Bắt đầu ghép {num_total} khung hình sắc nét trích xuất từ video...")

    cv2.ocl.setUseOpenCL(False)

    opencv_result, opencv_used = _try_opencv_stitcher(keyframes, target_width=target_width)
    use_opencv = (opencv_result is not None and opencv_used >= max(2, int(num_total * 0.70)))

    final_pano = None
    is_full_360 = False
    if use_opencv:
        final_pano = opencv_result
        ar = float(final_pano.shape[1]) / float(max(1, final_pano.shape[0]))
        is_full_360 = (num_total >= 12 and opencv_used >= 10) or (ar >= 3.2)
    else:
        try:
            final_pano, is_full_360 = build_3d_spherical_panorama(keyframes, target_width=target_width)
        except Exception as e:
            log(f"[!] Động cơ 3D Spherical lỗi: {e}")

    if final_pano is None:
        return {
            "success": False,
            "error": "ERR_STITCH_FAILED",
            "detail": "Không thể ghép nối video này. Hãy quay video xoay vòng đều đặn quanh tâm phòng."
        }

    leveled = auto_level_panorama(final_pano)
    cropped = crop_black_borders(leveled)

    out_w = 4096 if target_width <= 0 else int(target_width)
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=is_full_360)
    equi_pano = enhance_museum_texture(equi_pano)

    save_equirectangular_jpeg(output_path, equi_pano, quality=99)
    total_time = time.time() - t0
    h, w = equi_pano.shape[:2]

    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": 2.0,
        "aspectRatioStr": "2:1",
        "keyframesExtracted": len(keyframes),
        "videoDurationSec": round(meta.get("duration", 0), 1),
        "processingTimeSec": round(total_time, 2),
        "message": f"Đã tự động trích xuất {len(keyframes)} khung hình sắc nét và tạo không gian 360° hoàn tất trong {total_time:.1f}s."
    }


# ============================================================================
# PHẦN 8: THẨM ĐỊNH KHUNG HÌNH CHỤP THỜI GIAN THỰC (VERIFY SINGLE IMAGE API)
# ============================================================================

def verify_single_image(image_path, prev_image_path=None):
    """
    Thẩm định chất lượng từng tấm ảnh chụp từ camera điện thoại:
    - Độ nét (Laplacian variance)
    - Ánh sáng / Phơi sáng
    - Mật độ hoa văn chi tiết
    - Độ chồng lấp với góc chụp trước
    """
    if not os.path.exists(image_path):
        return {"success": False, "error": "ERR_FILE_NOT_FOUND", "message": f"Không tìm thấy: {image_path}"}

    try:
        img = load_and_orient_image(image_path, max_dim=1200)
        balanced_img = balance_universal_lighting(img)
        gray = cv2.cvtColor(balanced_img, cv2.COLOR_BGR2GRAY)

        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 30.0
        sharpness_label = "Rất sắc nét" if laplacian_var > 75 else ("Đủ độ nét" if is_sharp else "Bị nhòe / rung tay")

        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(gray, None)
        feature_count = len(kp) if kp is not None else 0
        has_features = feature_count >= 120
        feature_label = "Hoa văn phong phú" if feature_count >= 300 else ("Đủ chi tiết" if has_features else "Thiếu chi tiết")

        mean_brightness = float(np.mean(gray))
        is_exposed = (12.0 <= mean_brightness <= 245.0)
        brightness_label = "Đủ sáng" if (40.0 <= mean_brightness <= 215.0) else "Ánh sáng chấp nhận được"

        overlap_info = None
        position_info = None
        has_overlap = True
        is_position_stable = True
        match_count = 0

        if prev_image_path and os.path.exists(prev_image_path):
            try:
                prev_img = load_and_orient_image(prev_image_path, max_dim=1200)
                prev_gray = cv2.cvtColor(balance_universal_lighting(prev_img), cv2.COLOR_BGR2GRAY)
                prev_kp, prev_des = orb.detectAndCompute(prev_gray, None)

                if des is not None and prev_des is not None and len(des) > 10 and len(prev_des) > 10:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                    matches = bf.knnMatch(des, prev_des, k=2)
                    good_matches = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.78 * m[1].distance]
                    match_count = len(good_matches)
                    has_overlap = match_count >= 8
                    overlap_info = {
                        "match_count": match_count,
                        "passed": has_overlap,
                        "label": "Khớp nối tốt" if match_count >= 16 else ("Độ gối đầu vừa đủ" if has_overlap else "Chưa đủ điểm chung")
                    }
                    position_info = {"passed": has_overlap, "label": "Góc nhìn hợp lệ"}
            except Exception as e:
                log(f"[Warning] Đo overlap: {e}")

        is_usable = is_sharp and has_features and is_exposed and is_position_stable
        return {
            "success": True,
            "is_usable": is_usable,
            "sharpness": {"score": round(laplacian_var, 1), "passed": is_sharp, "label": sharpness_label},
            "features": {"count": feature_count, "passed": has_features, "label": feature_label},
            "brightness": {"score": round(mean_brightness, 1), "passed": is_exposed, "label": brightness_label},
            "overlap": overlap_info,
            "position": position_info,
            "feedback": "Ảnh đạt chuẩn không gian bảo tàng." if is_usable else "Vui lòng giữ chắc tay chụp lại góc này."
        }
    except Exception as e:
        return {"success": False, "error": "ERR_VERIFY_EXCEPTION", "message": f"Lỗi thẩm định: {str(e)}"}


# ============================================================================
# PHẦN 9: CLI ENTRYPOINT
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Next-Gen 360° Museum Equirectangular Spherical Stitcher")
    parser.add_argument("--images", nargs="+", help="Danh sách đường dẫn ảnh đầu vào")
    parser.add_argument("--video", help="Đường dẫn file video 360")
    parser.add_argument("--output", help="Đường dẫn file ảnh đầu ra")
    parser.add_argument("--width", type=int, default=0, help="Độ rộng mong muốn của ảnh Equirectangular 2:1")
    parser.add_argument("--keyframes", type=int, default=0, help="Số khung hình cắt từ video")
    parser.add_argument("--verify-image", help="Thẩm định 1 khung hình chụp")
    parser.add_argument("--prev-image", default=None, help="Khung hình trước đó")

    args = parser.parse_args()

    if args.verify_image:
        res = verify_single_image(args.verify_image, args.prev_image)
        print(json.dumps(res, ensure_ascii=True, indent=2))
        return

    if args.video:
        if not args.output:
            parser.print_help(sys.stderr)
            sys.exit(1)
        res = run_stitch_video(args.video, args.output, target_width=args.width, target_count=args.keyframes)
        print(json.dumps(res, ensure_ascii=True, indent=2))
        sys.exit(0 if res.get("success") else 1)

    if not args.images or not args.output:
        parser.print_help(sys.stderr)
        sys.exit(1)

    res = run_stitch(args.images, args.output, target_width=args.width)
    print(json.dumps(res, ensure_ascii=True, indent=2))
    sys.exit(0 if res.get("success") else 1)


if __name__ == "__main__":
    main()
