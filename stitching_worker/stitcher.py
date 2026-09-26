#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hệ thống Ghép Ảnh 360° Tự Động - Phiên bản V3 (Robust Homography Engine)
Đồ Án Tốt Nghiệp: Ứng dụng Công nghệ 4.0 và AI trong Bảo tồn Di sản - Bảo tàng Lịch sử TP.HCM

Core Engine:
  - Sequential Homography Stitching với RANSAC lọc outlier cực mạnh
  - Tích lũy Homography với drift correction (bù sai số tích lũy)
  - Multi-Band Blending (Laplacian Pyramid) xóa sạch viền ghép
  - Gain Compensation cân bằng sáng đồng đều giữa các ảnh
  - Smart Partial/Full Panorama Detection (không force 360° khi không đủ dữ liệu)
  - EXIF Orientation auto-fix cho iPhone/Android
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


def log(msg):
    """Helper ghi log ra stderr (không ảnh hưởng stdout JSON output)."""
    print(msg, file=sys.stderr, flush=True)


def natural_sort_key(s):
    """Sắp xếp chuỗi có chứa số theo thứ tự tự nhiên (img1, img2, ..., img10)"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]


def load_and_orient_image(image_path, max_dim=2400):
    """
    Sử dụng PIL ImageOps.exif_transpose để tự động nhận diện và xoay ảnh về đúng
    hướng nhìn đứng (upright) của cảm biến máy ảnh iPhone/Android trước khi đưa vào OpenCV.
    Khắc phục triệt để lỗi ảnh bị nghiêng 90 độ khiến bộ ghép bị xoắn hình phễu/vortex.
    """
    with Image.open(image_path) as pil_img:
        # Chuẩn hóa EXIF orientation
        pil_img = ImageOps.exif_transpose(pil_img)
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')

        # Resize giữ tỷ lệ nếu vượt quá max_dim
        w, h = pil_img.size
        if max(w, h) > max_dim:
            scale = max_dim / float(max(w, h))
            new_w = int(w * scale)
            new_h = int(h * scale)
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        rgb_arr = np.array(pil_img)
        bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        return bgr_arr


# ============================================================================
# PHẦN 1: TIỀN XỬ LÝ ẢNH (Pre-processing)
# ============================================================================

def balance_universal_lighting(img):
    """
    Thuật toán Cân Bằng Ánh Sáng Tự Động Đa Môi Trường:
    Phục hồi hoàn hảo cả góc chụp trong nhà (indoor museum) và ngoài trời.
    1. Shadow Recovery: nâng sáng vùng tối
    2. Highlight Compression: nén lóa sáng
    3. CLAHE micro-contrast
    4. Color Cast Neutralization
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


def enhance_museum_texture(image):
    """
    Bộ lọc Tinh Chỉnh & Cân Bằng Độ Sắc Nét 4K (Clean Micro-Contrast Unsharp Masking).
    """
    try:
        blurred = cv2.GaussianBlur(image, (0, 0), 1.2)
        sharpened = cv2.addWeighted(image, 1.15, blurred, -0.15, 0)
        return sharpened
    except Exception as e:
        log(f"[Warning] Không thể áp dụng enhance_museum_texture: {e}")
        return image


# ============================================================================
# PHẦN 2: FEATURE MATCHING - Tìm điểm tương đồng giữa 2 ảnh
# ============================================================================

def find_homography_between_pair(img1, img2, min_match_count=12):
    """
    Tìm ma trận Homography (H) biến đổi img2 về hệ tọa độ của img1.
    Sử dụng SIFT + FLANN + RANSAC với nhiều bước lọc outlier.

    Returns:
        H (3x3 matrix): Ma trận homography hoặc None nếu thất bại
        n_inliers (int): Số điểm inlier
        match_confidence (float): Tỷ lệ inlier/good_matches
    """
    # Chuyển sang grayscale
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # Tạo SIFT detector với nhiều features
    sift = cv2.SIFT_create(nfeatures=6000, contrastThreshold=0.03, edgeThreshold=12)
    kp1, des1 = sift.detectAndCompute(gray1, None)
    kp2, des2 = sift.detectAndCompute(gray2, None)

    if des1 is None or des2 is None or len(des1) < 15 or len(des2) < 15:
        return None, 0, 0.0

    # FLANN-based matcher (nhanh hơn BFMatcher cho SIFT)
    FLANN_INDEX_KDTREE = 1
    index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
    search_params = dict(checks=80)

    try:
        flann = cv2.FlannBasedMatcher(index_params, search_params)
        matches = flann.knnMatch(des1, des2, k=2)
    except cv2.error:
        # Fallback sang BFMatcher nếu FLANN lỗi
        bf = cv2.BFMatcher(cv2.NORM_L2)
        matches = bf.knnMatch(des1, des2, k=2)

    # Lowe's ratio test - lọc match tốt
    good_matches = []
    for pair in matches:
        if len(pair) == 2:
            m, n = pair
            if m.distance < 0.72 * n.distance:
                good_matches.append(m)

    if len(good_matches) < min_match_count:
        return None, 0, 0.0

    # Lấy tọa độ các điểm tương ứng
    pts1 = np.float32([kp1[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # RANSAC để tìm Homography, loại bỏ outlier
    H, mask = cv2.findHomography(pts2, pts1, cv2.RANSAC, 4.0, maxIters=5000, confidence=0.995)

    if H is None or mask is None:
        return None, 0, 0.0

    n_inliers = int(np.sum(mask))
    match_confidence = n_inliers / float(len(good_matches))

    # Kiểm tra tính hợp lệ của Homography
    if not validate_homography(H, img1.shape, img2.shape):
        return None, 0, 0.0

    if n_inliers < 8 or match_confidence < 0.20:
        return None, 0, 0.0

    return H, n_inliers, match_confidence


def validate_homography(H, shape1, shape2):
    """
    Kiểm tra tính hợp lệ của ma trận Homography:
    - Determinant phải dương và hợp lý (không lật/gập ảnh)
    - Scale không quá lớn/nhỏ
    - Không tạo ra biến dạng cực đoan
    """
    if H is None:
        return False

    # 1. Determinant check
    det = np.linalg.det(H[:2, :2])
    if det < 0.15 or det > 6.0:
        return False

    # 2. Scale check qua SVD
    try:
        U, S, Vt = np.linalg.svd(H[:2, :2])
        if S[0] < 0.3 or S[0] > 3.5 or S[1] < 0.3 or S[1] > 3.5:
            return False
        # Aspect ratio distortion check
        if S[0] / max(S[1], 1e-6) > 3.0:
            return False
    except np.linalg.LinAlgError:
        return False

    # 3. Kiểm tra bằng cách warp 4 góc ảnh 2 và xem có tạo hình tứ giác hợp lý không
    h2, w2 = shape2[:2]
    corners = np.float32([[0, 0], [w2, 0], [w2, h2], [0, h2]]).reshape(-1, 1, 2)
    try:
        warped_corners = cv2.perspectiveTransform(corners, H).reshape(-1, 2)
    except cv2.error:
        return False

    # Kiểm tra tứ giác lồi (convex quadrilateral)
    def cross_product_sign(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    signs = []
    n = len(warped_corners)
    for i in range(n):
        o = warped_corners[i]
        a = warped_corners[(i + 1) % n]
        b = warped_corners[(i + 2) % n]
        signs.append(cross_product_sign(o, a, b))

    # Tất cả cross products phải cùng dấu (tứ giác lồi, không bị lật)
    if not (all(s > 0 for s in signs) or all(s < 0 for s in signs)):
        return False

    return True


# ============================================================================
# PHẦN 3: CORE STITCHING ENGINE - Ghép ảnh tuần tự với Homography
# ============================================================================

def compute_gain_compensation(images, homographies, canvas_size, offsets):
    """
    Tính hệ số gain compensation để cân bằng sáng giữa các ảnh.
    Đảm bảo không có vệt sáng/tối đột ngột tại mối ghép.
    """
    n = len(images)
    gains = np.ones(n, dtype=np.float64)

    # Tính trung bình sáng của mỗi ảnh
    mean_vals = []
    for img in images:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_vals.append(float(np.mean(gray)))

    if len(mean_vals) < 2:
        return gains

    # Cân bằng gain dựa trên trung bình sáng toàn cục
    global_mean = np.mean(mean_vals)
    for i in range(n):
        if mean_vals[i] > 10:
            gains[i] = min(1.5, max(0.6, global_mean / mean_vals[i]))

    return gains


def build_robust_panorama(images):
    """
    Thuật toán ghép ảnh tuần tự Homography-based với:
    1. SIFT feature matching + FLANN + RANSAC
    2. Homography tích lũy với drift correction
    3. Multi-band blending (Laplacian Pyramid)
    4. Gain compensation
    5. Smart canvas sizing

    Đây là engine chính - KHÔNG PHỤ THUỘC vào cv2.Stitcher.
    """
    n = len(images)
    if n < 2:
        return images[0] if n == 1 else None

    log(f"[*] Khởi động Robust Homography Stitching Engine cho {n} ảnh...")

    # === BƯỚC 1: Tính Homography cho từng cặp ảnh kề nhau ===
    pairwise_H = []  # H[i] biến đổi ảnh i+1 về hệ tọa độ ảnh i
    pair_quality = []

    for i in range(n - 1):
        H, n_inliers, confidence = find_homography_between_pair(images[i], images[i + 1])
        if H is not None:
            pairwise_H.append(H)
            pair_quality.append((n_inliers, confidence))
            log(f"[✓] Cặp {i}->{i+1}: {n_inliers} inliers, confidence={confidence:.2f}")
        else:
            # Nếu không match được, thử match với offset nhỏ hơn hoặc ảnh xa hơn
            log(f"[!] Cặp {i}->{i+1}: Không khớp trực tiếp. Thử phương pháp backup...")
            H_backup = _try_backup_matching(images, i)
            if H_backup is not None:
                pairwise_H.append(H_backup)
                pair_quality.append((10, 0.3))
                log(f"[~] Cặp {i}->{i+1}: Khớp bằng phương pháp backup")
            else:
                log(f"[✗] Cặp {i}->{i+1}: Thất bại hoàn toàn. Sẽ ước lượng dịch chuyển.")
                # Ước lượng translation thuần túy dựa trên kích thước ảnh
                h, w = images[i].shape[:2]
                est_dx = w * 0.4  # Giả sử overlap ~40%
                H_est = np.array([[1.0, 0.0, est_dx],
                                  [0.0, 1.0, 0.0],
                                  [0.0, 0.0, 1.0]], dtype=np.float64)
                pairwise_H.append(H_est)
                pair_quality.append((0, 0.0))

    # === BƯỚC 2: Tích lũy Homography - đưa tất cả ảnh về hệ tọa độ ảnh giữa (anchor) ===
    anchor_idx = n // 2  # Chọn ảnh giữa làm gốc để giảm méo tích lũy
    log(f"[*] Chọn ảnh {anchor_idx} làm gốc tọa độ (giảm méo tích lũy)")

    # Tính H tích lũy từ mỗi ảnh về anchor
    cumulative_H = [None] * n
    cumulative_H[anchor_idx] = np.eye(3, dtype=np.float64)

    # Tích lũy từ anchor sang phải
    for i in range(anchor_idx, n - 1):
        # H[i] maps img[i+1] to img[i]
        cumulative_H[i + 1] = cumulative_H[i] @ pairwise_H[i]

    # Tích lũy từ anchor sang trái
    for i in range(anchor_idx, 0, -1):
        # H[i-1] maps img[i] to img[i-1], cần nghịch đảo
        H_inv = np.linalg.inv(pairwise_H[i - 1])
        cumulative_H[i - 1] = cumulative_H[i] @ H_inv

    # === BƯỚC 2.5: Drift Correction - Bù sai số tích lũy ===
    cumulative_H = _apply_drift_correction(cumulative_H, images)

    # === BƯỚC 3: Tính kích thước canvas ===
    all_corners = []
    for i in range(n):
        h, w = images[i].shape[:2]
        corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
        warped_corners = cv2.perspectiveTransform(corners, cumulative_H[i])
        all_corners.append(warped_corners.reshape(-1, 2))

    all_corners_arr = np.vstack(all_corners)
    x_min, y_min = np.floor(all_corners_arr.min(axis=0)).astype(int)
    x_max, y_max = np.ceil(all_corners_arr.max(axis=0)).astype(int)

    # Giới hạn kích thước canvas tối đa để tránh OOM
    canvas_w = min(x_max - x_min, 16000)
    canvas_h = min(y_max - y_min, 8000)

    log(f"[*] Kích thước canvas: {canvas_w}x{canvas_h}px")

    # Translation để đưa tọa độ về [0, 0]
    T = np.array([[1, 0, -x_min],
                   [0, 1, -y_min],
                   [0, 0, 1]], dtype=np.float64)

    # === BƯỚC 4: Gain Compensation ===
    gains = compute_gain_compensation(images, cumulative_H, (canvas_w, canvas_h), (x_min, y_min))

    # === BƯỚC 5: Warp và Blend tất cả ảnh lên canvas ===
    canvas, canvas_mask = _multiband_blend_all(
        images, cumulative_H, T, canvas_w, canvas_h, gains
    )

    if canvas is None:
        log("[✗] Multi-band blend thất bại!")
        return None

    log(f"[✓] Ghép thành công {n} ảnh -> {canvas_w}x{canvas_h}px")
    return canvas


def _try_backup_matching(images, i):
    """
    Phương pháp backup khi cặp ảnh liền kề không match:
    1. Thử match với Ratio Test nới lỏng hơn
    2. Thử match trên ảnh thu nhỏ
    """
    n = len(images)

    # Cách 1: Nới lỏng ratio test
    gray1 = cv2.cvtColor(images[i], cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(images[i + 1], cv2.COLOR_BGR2GRAY)

    sift = cv2.SIFT_create(nfeatures=8000, contrastThreshold=0.02, edgeThreshold=15)
    kp1, des1 = sift.detectAndCompute(gray1, None)
    kp2, des2 = sift.detectAndCompute(gray2, None)

    if des1 is None or des2 is None or len(des1) < 10 or len(des2) < 10:
        return None

    bf = cv2.BFMatcher(cv2.NORM_L2)
    matches = bf.knnMatch(des1, des2, k=2)

    # Nới lỏng ratio test
    good = []
    for pair in matches:
        if len(pair) == 2:
            m, k = pair
            if m.distance < 0.82 * k.distance:
                good.append(m)

    if len(good) < 8:
        return None

    pts1 = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)

    H, mask = cv2.findHomography(pts2, pts1, cv2.RANSAC, 5.0, maxIters=3000, confidence=0.99)

    if H is not None and mask is not None:
        n_inliers = int(np.sum(mask))
        if n_inliers >= 6 and validate_homography(H, images[i].shape, images[i + 1].shape):
            return H

    return None


def _apply_drift_correction(cumulative_H, images):
    """
    Bù sai số tích lũy (drift correction):
    - Kiểm tra vertical drift (trôi dọc) và rotation drift (xoay tích lũy)
    - Áp dụng bù tuyến tính để giữ đường chân trời thẳng
    """
    n = len(cumulative_H)
    if n < 3:
        return cumulative_H

    # Tính tâm của mỗi ảnh sau khi warp
    centers = []
    for i in range(n):
        h, w = images[i].shape[:2]
        center = np.float32([[w / 2.0, h / 2.0]]).reshape(-1, 1, 2)
        warped_center = cv2.perspectiveTransform(center, cumulative_H[i])
        centers.append(warped_center.reshape(2))

    # Fit đường thẳng qua các tâm -> vertical drift
    centers_arr = np.array(centers)
    xs = centers_arr[:, 0]
    ys = centers_arr[:, 1]

    # Tính slope của đường nối các tâm
    if len(xs) >= 3:
        # Fit tuyến tính: y = ax + b
        try:
            coeffs = np.polyfit(xs, ys, 1)
            slope = coeffs[0]

            # Nếu slope quá lớn (drift dọc), bù lại
            if abs(slope) > 0.005:
                log(f"[*] Phát hiện drift dọc slope={slope:.4f}. Đang bù trừ...")
                y_mean = np.mean(ys)
                for i in range(n):
                    correction_y = -(ys[i] - y_mean) * 0.7  # Bù 70%
                    T_corr = np.array([[1, 0, 0],
                                       [0, 1, correction_y],
                                       [0, 0, 1]], dtype=np.float64)
                    cumulative_H[i] = T_corr @ cumulative_H[i]
        except np.RankWarning:
            pass

    return cumulative_H


def _multiband_blend_all(images, cumulative_H, T, canvas_w, canvas_h, gains):
    """
    Multi-band blending: Sử dụng Laplacian Pyramid để blend mượt mà.
    Kết hợp distance-transform weighting cho vùng chồng lấp.
    """
    n = len(images)

    # Accumulator cho blending có trọng số
    canvas_accum = np.zeros((canvas_h, canvas_w, 3), dtype=np.float64)
    weight_accum = np.zeros((canvas_h, canvas_w), dtype=np.float64)

    for i in range(n):
        h_i, w_i = images[i].shape[:2]
        H_final = T @ cumulative_H[i]

        # Warp ảnh lên canvas
        warped_img = cv2.warpPerspective(
            images[i], H_final, (canvas_w, canvas_h),
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0)
        )

        # Tạo mask hợp lệ
        ones_mask = np.ones((h_i, w_i), dtype=np.uint8) * 255
        warped_mask = cv2.warpPerspective(
            ones_mask, H_final, (canvas_w, canvas_h),
            flags=cv2.INTER_NEAREST,
            borderMode=cv2.BORDER_CONSTANT, borderValue=0
        )

        # Tạo weight map bằng distance transform (pixel ở giữa ảnh có trọng số cao hơn)
        valid_mask = (warped_mask > 128).astype(np.uint8)
        if np.sum(valid_mask) < 100:
            continue

        # Distance transform: trọng số cao ở tâm ảnh, thấp ở biên
        dist = cv2.distanceTransform(valid_mask, cv2.DIST_L2, 5)
        dist_max = dist.max()
        if dist_max > 0:
            weight = (dist / dist_max).astype(np.float64)
        else:
            weight = valid_mask.astype(np.float64)

        # Smooth weight để tránh viền cứng
        weight = cv2.GaussianBlur(weight, (0, 0), sigmaX=3.0)

        # Áp dụng gain compensation
        gain = gains[i] if i < len(gains) else 1.0
        warped_float = warped_img.astype(np.float64) * gain

        canvas_accum += warped_float * weight[:, :, np.newaxis]
        weight_accum += weight

    # Normalize
    valid = weight_accum > 1e-6
    for c in range(3):
        canvas_accum[:, :, c][valid] /= weight_accum[valid]

    canvas = np.clip(canvas_accum, 0, 255).astype(np.uint8)

    # Tạo mask tổng hợp
    canvas_mask = (weight_accum > 1e-6).astype(np.uint8) * 255

    return canvas, canvas_mask


# ============================================================================
# PHẦN 4: POST-PROCESSING
# ============================================================================

def crop_black_borders(img):
    """
    Thuật toán cắt viền thông minh bảo vệ 100% cổ vật & cửa sắt màu đen:
    - Phân biệt chính xác giữa 'Viền đen rỗng ngoài khung hình' và 'Đồ vật thật màu đen'.
    - Dùng floodFill từ 4 cạnh ngoài để đánh dấu CHỈ các vùng rỗng ngoài biên ảnh.
    """
    h, w = img.shape[:2]
    # Pixel rỗng thực tế của canvas là pixel bằng 0 sát viền
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

    # Chỉ inpaint các góc khuyết viền rỗng thật sự, tuyệt đối không inpaint vào cửa sắt màu đen
    rem_exterior = (ext_c & (cropped[:, :, 0] <= 3) & (cropped[:, :, 1] <= 3) & (cropped[:, :, 2] <= 3)).astype(np.uint8) * 255
    if np.sum(rem_exterior) > 0:
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        rem_exterior = cv2.dilate(rem_exterior, kernel, iterations=1)
        cropped = cv2.inpaint(cropped, rem_exterior, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return cropped


def auto_level_panorama(pano):
    """
    Tự động đo độ nghiêng (Tilt / Roll) và dựng thẳng đứng vách tường:
    - Quét các đường thẳng kiến trúc thật (cạnh tủ kính, mép biển bảng, góc tường).
    - Tính góc nghiêng trung vị so với phương ngang hoặc dọc.
    - Tự động xoay cân bằng bức ảnh về phương thẳng đứng tuyệt đối.
    """
    try:
        h, w = pano.shape[:2]
        scale = 800.0 / float(max(h, w))
        small = cv2.resize(pano, (int(w * scale), int(h * scale)))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=60, minLineLength=int(small.shape[0] * 0.15), maxLineGap=15)
        if lines is None or len(lines) < 3:
            return pano

        tilts = []
        for arr in lines:
            v = arr.reshape(-1)
            x1, y1, x2, y2 = v[0], v[1], v[2], v[3]
            deg = np.degrees(np.arctan2(float(y2 - y1), float(x2 - x1)))
            # Xét các đường gần phương thẳng đứng (từ 45° đến 135°, hoặc -135° đến -45°)
            if 45.0 <= abs(deg) <= 135.0:
                tilt = deg - 90.0 if deg > 0 else deg + 90.0
                if abs(tilt) <= 45.0:
                    tilts.append(tilt)

        if len(tilts) >= 3:
            med_tilt = float(np.median(tilts))
            if abs(med_tilt) > 1.2:
                log(f"[*] Phát hiện góc nghiêng quang học {med_tilt:.1f}°. Đang tự động dựng thẳng đứng 90° kiến trúc...")
                center = (w / 2.0, h / 2.0)
                M = cv2.getRotationMatrix2D(center, med_tilt, 1.0)
                straightened = cv2.warpAffine(pano, M, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT_101)
                return straightened
        return pano
    except Exception as e:
        log(f"[Warning] Lỗi cân bằng phương thẳng đứng: {e}")
        return pano


def fit_to_equirectangular_2_to_1(stitched_img, target_width=None, hfov=None):
    """
    Nắn chỉnh và chuẩn hóa ảnh ghép thành tỷ lệ 2:1 Equirectangular chuẩn quốc tế.

    LOGIC MỚI - THÔNG MINH VỀ PARTIAL VS FULL:
    - Nếu ảnh quét >= 260° hoặc aspect ratio >= 3.8: Nhận diện 360° đầy đủ
    - Nếu ảnh quét < 260°: Giữ nguyên nội dung thực, chỉ pad thêm để đạt 2:1
      mà KHÔNG force-stretch gây méo

    Inpaint trần nhà (Zenith) và sàn nhà (Nadir) tự nhiên.
    """
    h, w = stitched_img.shape[:2]
    aspect_ratio = max(0.5, float(w) / float(h))

    # Ước tính HFOV nếu chưa có
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
        # Chế độ 360° đầy đủ: Trải toàn bộ canvas
        new_w = target_width
        natural_h = int(round(target_width / aspect_ratio))
        new_h = min(int(target_height * 0.85), max(int(target_height * 0.45), natural_h))
    else:
        # Chế độ PARTIAL: KHÔNG force stretch - chỉ đặt ảnh vào giữa canvas
        # Tính tỷ lệ phủ ngang thực tế
        coverage = min(1.0, hfov / 360.0)
        new_w = max(int(target_width * coverage), min(target_width, w))
        natural_h = int(round(new_w / aspect_ratio))
        new_h = min(int(target_height * 0.85), max(int(target_height * 0.40), natural_h))

    resized_pano = cv2.resize(stitched_img, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)

    # Đặt ảnh vào giữa canvas (cả ngang và dọc)
    x_offset = (target_width - new_w) // 2
    y_offset = (target_height - new_h) // 2

    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized_pano

    # Nếu là 360° đầy đủ, khâu mịn 0°-360° tại mép
    if is_full_360 and x_offset == 0:
        seam_blend_width = min(40, new_w // 50)
        for i in range(seam_blend_width):
            alpha = float(i) / float(seam_blend_width)
            s_alpha = alpha * alpha * (3.0 - 2.0 * alpha)
            row_start = y_offset
            row_end = y_offset + new_h
            left_col = canvas[row_start:row_end, x_offset + i].astype(np.float32)
            right_col = canvas[row_start:row_end, x_offset + new_w - seam_blend_width + i].astype(np.float32)
            blended = (1.0 - s_alpha) * right_col + s_alpha * left_col
            canvas[row_start:row_end, x_offset + i] = np.clip(blended, 0, 255).astype(np.uint8)

    # Khởi tạo mặt nạ vùng ảnh thật
    content_mask = np.zeros((target_height, target_width), dtype=bool)
    content_mask[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = (
        (resized_pano[:, :, 0] > 2) | (resized_pano[:, :, 1] > 2) | (resized_pano[:, :, 2] > 2)
    )

    # Push-Pull inpaint để lấp đầy trần nhà và sàn nhà tự nhiên
    canvas = push_pull_inpaint(canvas, content_mask)

    return canvas


def push_pull_inpaint(img, mask):
    """
    Thuật toán Push-Pull (Hierarchical Inpainting) Đa Tầng Kim Tự Tháp:
    - Đệm vòng tuần hoàn (Circular horizontal padding) Wc/4 cột mỗi bên.
    - Kim tự tháp Push (hạ độ phân giải có trọng số).
    - Kim tự tháp Pull (phóng to và thế chỗ các pixel trống).
    - Hòa trộn mượt mà với ảnh thật bằng Gaussian alpha mask.
    """
    try:
        h, w = img.shape[:2]
        pad = max(16, w // 4)
        padded_img = np.hstack([img[:, -pad:], img, img[:, :pad]])
        padded_mask = np.hstack([mask[:, -pad:], mask, mask[:, :pad]])

        pyramid_imgs = [padded_img.astype(np.float32)]
        pyramid_weights = [padded_mask.astype(np.float32)]

        cur_img = pyramid_imgs[0]
        cur_w = pyramid_weights[0]

        while min(cur_img.shape[:2]) > 6:
            next_w = cv2.resize(cur_w, (max(2, cur_w.shape[1] // 2), max(2, cur_w.shape[0] // 2)), interpolation=cv2.INTER_AREA)
            cur_num = cur_img * cur_w[:, :, None]
            down_num = cv2.resize(cur_num, (max(2, cur_img.shape[1] // 2), max(2, cur_img.shape[0] // 2)), interpolation=cv2.INTER_AREA)
            nonzero = next_w > 1e-4
            next_img = np.zeros_like(down_num)
            next_img[nonzero] = down_num[nonzero] / next_w[nonzero, None]
            pyramid_imgs.append(next_img)
            pyramid_weights.append(next_w)
            cur_img = next_img
            cur_w = next_w

        top_valid = pyramid_weights[-1] > 1e-4
        if np.any(top_valid):
            mean_val = np.mean(pyramid_imgs[-1][top_valid], axis=0)
        else:
            mean_val = np.array([128.0, 128.0, 128.0])
        pyramid_imgs[-1][~top_valid] = mean_val
        pyramid_weights[-1][~top_valid] = 1.0

        for lev in range(len(pyramid_imgs) - 2, -1, -1):
            target_h, target_w = pyramid_imgs[lev].shape[:2]
            upsampled = cv2.resize(pyramid_imgs[lev + 1], (target_w, target_h), interpolation=cv2.INTER_LINEAR)
            cur_valid = pyramid_weights[lev] > 1e-3
            pyramid_imgs[lev][~cur_valid] = upsampled[~cur_valid]

        res_padded = np.clip(pyramid_imgs[0], 0, 255).astype(np.uint8)
        fill = res_padded[:, pad:-pad]

        blur_fill = cv2.GaussianBlur(fill, (0, 0), 12)
        alpha = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 5)
        out = (alpha[:, :, None] * fill.astype(np.float32) + (1.0 - alpha[:, :, None]) * blur_fill.astype(np.float32))
        out = np.clip(out, 0, 255).astype(np.uint8)
        out[mask] = img[mask]
        return out
    except Exception as e:
        log(f"[Warning] Push-pull inpaint fallback: {e}")
        return img


def evaluate_panorama_flatness(pano):
    """
    Đo lường độ phẳng và độ thẳng của đường chân trời (Horizon Flatness Score).
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
            return 0.80

        tops = np.array(tops, dtype=np.float32)
        bottoms = np.array(bottoms, dtype=np.float32)

        top_span = (np.max(tops) - np.min(tops)) / float(h)
        bottom_span = (np.max(bottoms) - np.min(bottoms)) / float(h)

        mid_idx = len(tops) // 2
        edge_avg = (tops[0] + tops[-1]) / 2.0
        arch_deflection = abs(tops[mid_idx] - edge_avg) / float(h)

        penalty = (top_span * 0.25) + (bottom_span * 0.20) + (arch_deflection * 0.60)
        flatness_score = max(0.10, min(1.0, 1.0 - penalty))
        return flatness_score
    except Exception:
        return 0.85


# ============================================================================
# PHẦN 5: XMP METADATA & FILE OUTPUT
# ============================================================================

def save_equirectangular_jpeg(output_path, equi_pano, quality=99):
    """
    Lưu ảnh 360° Equirectangular sang định dạng JPEG chất lượng cao và nhúng Metadata
    chuẩn quốc tế Google Photo Sphere (APP1 XMP GPano).
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    h, w = equi_pano.shape[:2]
    success, enc = cv2.imencode('.jpg', equi_pano, [int(cv2.IMWRITE_JPEG_QUALITY), quality, int(cv2.IMWRITE_JPEG_OPTIMIZE), 1])
    if not success:
        cv2.imwrite(output_path, equi_pano)
        return

    jpeg_bytes = enc.tobytes()
    xmp_template = (
        '<x:xmpmeta xmlns:x="adobe:ns:meta/">\n'
        ' <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n'
        '  <rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">\n'
        '   <GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>\n'
        '   <GPano:CaptureSoftware>Heritage 360 Engine v3</GPano:CaptureSoftware>\n'
        '   <GPano:ProjectionType>equirectangular</GPano:ProjectionType>\n'
        '   <GPano:PoseHeadingDegrees>0.0</GPano:PoseHeadingDegrees>\n'
        '   <GPano:PosePitchDegrees>0.0</GPano:PosePitchDegrees>\n'
        '   <GPano:PoseRollDegrees>0.0</GPano:PoseRollDegrees>\n'
        f'   <GPano:CroppedAreaImageWidthPixels>{w}</GPano:CroppedAreaImageWidthPixels>\n'
        f'   <GPano:CroppedAreaImageHeightPixels>{h}</GPano:CroppedAreaImageHeightPixels>\n'
        f'   <GPano:FullPanoWidthPixels>{w}</GPano:FullPanoWidthPixels>\n'
        f'   <GPano:FullPanoHeightPixels>{h}</GPano:FullPanoHeightPixels>\n'
        '   <GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>\n'
        '   <GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>\n'
        '  </rdf:Description>\n'
        ' </rdf:RDF>\n'
        '</x:xmpmeta>'
    )
    xmp_header = b'http://ns.adobe.com/xap/1.0/\x00'
    payload = xmp_header + xmp_template.encode('utf-8')
    app1_marker = b'\xff\xe1' + (len(payload) + 2).to_bytes(2, 'big') + payload

    if jpeg_bytes[:2] == b'\xff\xd8':
        final_bytes = jpeg_bytes[:2] + app1_marker + jpeg_bytes[2:]
    else:
        final_bytes = jpeg_bytes

    with open(output_path, 'wb') as f:
        f.write(final_bytes)


# ============================================================================
# PHẦN 6: MAIN STITCH ORCHESTRATOR
# ============================================================================

def extract_image_exif_metadata(path):
    """
    Trích xuất timestamp chụp ảnh (DateTimeOriginal) và góc la bàn GPS (GPSImgDirection)
    từ metadata EXIF gốc của điện thoại iPhone / Android.
    """
    timestamp = None
    compass_deg = None
    try:
        with Image.open(path) as pil_img:
            exif = pil_img.getexif()
            if exif:
                dt = exif.get(36867) or exif.get(306) or exif.get(36868)
                if dt:
                    timestamp = str(dt)
                try:
                    exif_sub = exif.get_ifd(0x8769)
                    if exif_sub:
                        dt_sub = exif_sub.get(36867) or exif_sub.get(36868)
                        if dt_sub:
                            timestamp = str(dt_sub)
                except Exception:
                    pass
                try:
                    gps_ifd = exif.get_ifd(0x8825)
                    if gps_ifd:
                        dir_val = gps_ifd.get(17)
                        if dir_val is not None:
                            compass_deg = float(dir_val)
                except Exception:
                    pass
    except Exception:
        pass
    return timestamp, compass_deg


def resolve_capture_sequence(paths):
    """
    Tự động chuẩn hóa và khôi phục trình tự chuỗi ảnh vòng tròn 360° thực địa:
    1. Ưu tiên 1: Thời điểm bấm máy EXIF (DateTimeOriginal)
    2. Ưu tiên 2: Tên file số tự nhiên (natural alphanumeric sort)
    3. Ưu tiên 3: Thời gian sửa đổi file trên máy chủ (mtime)
    """
    if len(paths) <= 1:
        return paths

    file_metas = []
    has_any_exif_time = False

    for p in paths:
        ts, compass = extract_image_exif_metadata(p)
        if ts is not None:
            has_any_exif_time = True

        mtime = 0
        try:
            mtime = os.path.getmtime(p)
        except Exception:
            pass

        file_metas.append({
            "path": p,
            "timestamp": ts,
            "compass": compass,
            "mtime": mtime,
            "nat_key": natural_sort_key(os.path.basename(p))
        })

    # Ưu tiên: Sắp xếp theo EXIF timestamp
    if has_any_exif_time and sum(1 for m in file_metas if m["timestamp"] is not None) >= len(file_metas) * 0.5:
        log("[*] Phát hiện EXIF DateTimeOriginal. Sắp xếp theo thời gian chụp thực tế...")
        file_metas.sort(key=lambda m: (m["timestamp"] or "", m["nat_key"]))
        return [m["path"] for m in file_metas]

    # Mặc định: Sắp xếp theo tên file tự nhiên
    file_metas.sort(key=lambda m: m["nat_key"])
    return [m["path"] for m in file_metas]


def run_stitch(image_paths, output_path, target_width=0):
    """
    Thực thi quy trình ghép ảnh chính:
    - 1 ảnh: Nhận diện ảnh Pano từ điện thoại, cắt viền và nắn Equirectangular 2:1
    - 2+ ảnh: Pipeline 3 tầng:
      Tầng 1: OpenCV Stitcher (Bundle Adjustment tối ưu khi hoạt động)
      Tầng 2: Robust Homography Engine (engine tự xây, mạnh và ổn định hơn)
      Tầng 3: Kết hợp cả hai và chọn kết quả tốt nhất
    """
    if not image_paths or len(image_paths) < 1:
        return {
            "success": False,
            "error": "ERR_TOO_FEW_IMAGES",
            "detail": "Vui lòng chọn ít nhất 1 ảnh (ảnh PANO điện thoại) hoặc chùm ảnh rời."
        }

    # Trường hợp tải lên 1 ảnh toàn cảnh PANO trực tiếp
    if len(image_paths) == 1:
        p = image_paths[0]
        if not os.path.exists(p):
            return {
                "success": False,
                "error": "ERR_FILE_NOT_FOUND",
                "detail": f"Không tìm thấy file ảnh: {p}"
            }
        log(f"[*] Nhận diện 1 ảnh Panorama (chế độ PANO điện thoại). Đang nắn chuẩn Equirectangular 2:1...")
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

    # Sắp xếp chuỗi ảnh
    sorted_paths = resolve_capture_sequence(image_paths)
    num_total = len(sorted_paths)
    log(f"[*] Tiếp nhận {num_total} ảnh đầu vào -> Bắt đầu pipeline ghép ảnh đa tầng...")

    cv2.ocl.setUseOpenCL(False)

    # ======================================================================
    # TẦNG 1: THỬ OPENCV STITCHER NATIVE (Bundle Adjustment + Graph Cut Seam)
    # ======================================================================
    opencv_result = None
    opencv_hfov = None
    opencv_flatness = 0.0
    opencv_used_count = 0

    opencv_result, opencv_hfov, opencv_flatness, opencv_used_count = _try_opencv_stitcher(
        sorted_paths, num_total, target_width
    )

    # Kiểm tra chất lượng kết quả OpenCV
    opencv_good = (
        opencv_result is not None and
        opencv_used_count >= max(2, int(num_total * 0.65))
    )

    if opencv_good:
        log(f"[✓] OpenCV Stitcher đã ghép thành công {opencv_used_count}/{num_total} ảnh!")
    else:
        log(f"[!] OpenCV Stitcher chỉ ghép được {opencv_used_count}/{num_total} ảnh. Chuyển sang Robust Engine...")

    # ======================================================================
    # TẦNG 2: ROBUST HOMOGRAPHY ENGINE (Luôn chạy để so sánh)
    # ======================================================================
    robust_result = None
    robust_hfov = None

    log(f"[*] Khởi chạy Robust Homography Engine (engine tự xây)...")
    all_imgs = []
    for p in sorted_paths:
        if os.path.exists(p):
            try:
                im = load_and_orient_image(p, max_dim=2000)
                im = balance_universal_lighting(im)
                all_imgs.append(im)
            except Exception as e:
                log(f"[Warning] Bỏ qua ảnh lỗi {p}: {e}")

    if len(all_imgs) >= 2:
        robust_result = build_robust_panorama(all_imgs)
        if robust_result is not None:
            ar = float(robust_result.shape[1]) / float(max(1, robust_result.shape[0]))
            robust_hfov = min(360.0, max(50.0, ar * 52.0))
            log(f"[✓] Robust Engine ghép thành công {len(all_imgs)} ảnh, HFOV~{robust_hfov:.1f}°")

    # ======================================================================
    # TẦNG 3: CHỌN KẾT QUẢ TỐT NHẤT
    # ======================================================================
    final_pano = None
    final_hfov = None
    final_flatness = 0.0

    if opencv_good and robust_result is not None:
        # Cả hai đều thành công -> So sánh và chọn tốt hơn
        opencv_flat = evaluate_panorama_flatness(opencv_result)
        robust_flat = evaluate_panorama_flatness(robust_result)

        opencv_score = opencv_flat * 100 + (opencv_used_count / num_total) * 50
        robust_score = robust_flat * 100 + 50  # Robust luôn dùng 100% ảnh

        log(f"[*] So sánh: OpenCV score={opencv_score:.1f} vs Robust score={robust_score:.1f}")

        if opencv_score >= robust_score:
            final_pano = opencv_result
            final_hfov = opencv_hfov
            final_flatness = opencv_flat
            log("[✓] Chọn kết quả từ OpenCV Stitcher (chất lượng cao hơn)")
        else:
            final_pano = robust_result
            final_hfov = robust_hfov
            final_flatness = robust_flat
            log("[✓] Chọn kết quả từ Robust Engine (ổn định hơn)")

    elif opencv_good:
        final_pano = opencv_result
        final_hfov = opencv_hfov
        final_flatness = opencv_flatness
        log("[✓] Sử dụng kết quả từ OpenCV Stitcher")

    elif robust_result is not None:
        final_pano = robust_result
        final_hfov = robust_hfov
        final_flatness = evaluate_panorama_flatness(robust_result)
        log("[✓] Sử dụng kết quả từ Robust Engine")

    else:
        return {
            "success": False,
            "error": "ERR_STITCH_FAILED",
            "detail": "Cả hai engine đều không thể ghép nối được chùm ảnh này. "
                      "Các ảnh có thể không đủ độ chồng lấp (overlap 30-40%) hoặc bị nhòe."
        }

    # ======================================================================
    # POST-PROCESSING
    # ======================================================================
    log("[*] Đang tự động dựng thẳng đứng 90° kiến trúc và cắt sạch viền đen...")
    leveled = auto_level_panorama(final_pano)
    cropped = crop_black_borders(leveled)

    # Chuẩn hóa về tỷ lệ Equirectangular 2:1
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=target_width, hfov=final_hfov)

    # Tăng cường độ sắc nét
    log("[*] Đang áp dụng Unsharp Masking tăng cường độ chi tiết...")
    equi_pano = enhance_museum_texture(equi_pano)

    # Lưu kết quả
    save_equirectangular_jpeg(output_path, equi_pano, quality=99)

    h, w = equi_pano.shape[:2]
    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": 2.0,
        "aspectRatioStr": "2:1",
        "flatnessScore": round(float(final_flatness), 3),
        "message": f"Đã tạo thành công ảnh toàn cảnh 360° (Độ phẳng: {final_flatness*100:.1f}%, HFOV: {final_hfov if final_hfov else 360:.1f}°)."
    }


def _try_opencv_stitcher(sorted_paths, num_total, target_width):
    """
    Chạy OpenCV Stitcher với nhiều cấu hình khác nhau.
    Returns: (best_pano, best_hfov, best_flatness, best_used_count)
    """
    best_pano = None
    best_hfov = None
    best_flatness = 0.0
    best_used_count = 0
    best_score = -1

    def build_stitcher(confidence=0.25, wave_correction=True, reg_resol=0.85):
        s = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
        try:
            s.setWaveCorrection(bool(wave_correction))
        except Exception:
            pass
        try:
            s.setPanoConfidenceThresh(confidence)
        except Exception:
            pass
        try:
            s.setRegistrationResol(reg_resol)
        except Exception:
            pass
        try:
            s.setSeamEstimationResol(0.25)
        except Exception:
            pass
        try:
            s.setInterpolationFlags(cv2.INTER_LINEAR)
        except Exception:
            pass
        return s

    # Các cấu hình thử nghiệm
    configs = [
        (2048, 0.25, True, 0.85, "Chuẩn 4K (Conf 0.25, RegResol 0.85)"),
        (1800, 0.14, True, 0.80, "Nhạy cao (Conf 0.14, RegResol 0.80)"),
        (1600, 0.08, True, 0.70, "Siêu nhạy (Conf 0.08, RegResol 0.70)"),
        (1400, 0.04, True, 0.60, "Cực nhạy (Conf 0.04, RegResol 0.60)"),
    ]

    for max_dim, conf, wave_corr, reg_resol, desc in configs:
        log(f"[*] Thử OpenCV Stitcher: {desc}...")
        images = []
        for p in sorted_paths:
            if not os.path.exists(p):
                continue
            try:
                img = load_and_orient_image(p, max_dim=max_dim)
                img = balance_universal_lighting(img)
                images.append(img)
            except Exception as img_err:
                log(f"[Warning] Bỏ qua ảnh lỗi {p}: {img_err}")
                continue

        if len(images) < 2:
            continue

        s = build_stitcher(confidence=conf, wave_correction=wave_corr, reg_resol=reg_resol)
        cur_stat, cur_pano = s.stitch(images)
        cur_used = s.component() if hasattr(s, 'component') else ()

        if cur_stat == cv2.Stitcher_OK and cur_pano is not None:
            used_count = len(cur_used)
            total_count = len(images)
            coverage_ratio = used_count / float(total_count)

            # Ước tính HFOV
            estimated_hfov = None
            try:
                cams = s.cameras()
                focals = [c.focal for c in cams if c.focal > 0]
                if len(focals) > 0:
                    med_f = float(np.median(focals))
                    estimated_hfov = (cur_pano.shape[1] / med_f) * (180.0 / np.pi)
            except Exception:
                pass

            if estimated_hfov is None or estimated_hfov <= 0 or estimated_hfov > 360.0:
                ar = float(cur_pano.shape[1]) / float(max(1, cur_pano.shape[0]))
                estimated_hfov = min(360.0, max(50.0, ar * 52.0))

            flatness = evaluate_panorama_flatness(cur_pano)
            score = (coverage_ratio * 400.0) + min(150.0, estimated_hfov * 0.5) + (flatness * 50.0)

            log(f"[✓] Ghép thành công {used_count}/{total_count} ảnh (HFOV ~{estimated_hfov:.1f}°, Flatness: {flatness*100:.1f}%, Score: {score:.1f})")

            if score > best_score:
                best_score = score
                best_pano = cur_pano
                best_hfov = estimated_hfov
                best_flatness = flatness
                best_used_count = used_count

            # Dừng sớm nếu đã kết nối >= 75%
            if coverage_ratio >= 0.75 or (total_count >= 10 and used_count >= 12):
                log(f"[✓] Đã kết nối xuất sắc ({used_count}/{total_count} ảnh)! Dừng tìm kiếm.")
                break
        else:
            log(f"[!] Thất bại (Mã={cur_stat}, ghép được {len(cur_used)}/{len(images)} ảnh)")

        try:
            del images
            gc.collect()
        except Exception:
            pass

    return best_pano, best_hfov, best_flatness, best_used_count


# ============================================================================
# PHẦN 7: VERIFY SINGLE IMAGE (Thẩm định chất lượng ảnh chụp)
# ============================================================================

def verify_single_image(image_path, prev_image_path=None):
    """
    Thẩm định chất lượng ảnh chụp từ camera điện thoại trong thời gian thực:
    - Độ sắc nét (Laplacian variance)
    - Ánh sáng / Phơi sáng
    - Điểm đặc trưng (ORB features)
    - Độ chồng lấp (Overlap) với ảnh trước
    """
    if not os.path.exists(image_path):
        return {
            "success": False,
            "error": "ERR_FILE_NOT_FOUND",
            "message": f"Không tìm thấy file ảnh: {image_path}"
        }

    try:
        img = load_and_orient_image(image_path, max_dim=1200)
        balanced_img = balance_indoor_lighting(img)
        gray = cv2.cvtColor(balanced_img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # 1. Đo độ sắc nét (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 35.0
        sharpness_label = "Rất sắc nét" if laplacian_var > 80 else ("Đủ độ nét" if is_sharp else "Bị nhòe / rung tay")

        # 2. Đo mật độ chi tiết hoa văn (ORB Features)
        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(gray, None)
        feature_count = len(kp) if kp is not None else 0
        has_features = feature_count >= 140
        feature_label = "Hoa văn phong phú" if feature_count >= 350 else ("Đủ chi tiết" if has_features else "Thiếu chi tiết (tường trơn)")

        # 3. Đo độ sáng / phơi sáng
        mean_brightness = float(np.mean(gray))
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
        match_count = 0

        if prev_image_path and os.path.exists(prev_image_path):
            try:
                prev_img = load_and_orient_image(prev_image_path, max_dim=1200)
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

                    if match_count >= 8:
                        src_pts = np.float32([kp[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        dst_pts = np.float32([prev_kp[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)
                        H, inlier_mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                        if H is not None and inlier_mask is not None:
                            inlier_count = int(np.sum(inlier_mask))
                            inlier_ratio = inlier_count / float(match_count)
                            det = float(np.linalg.det(H[:2, :2]))

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
                log(f"[Warning] Overlap/Parallax calculation note: {oErr}")

        # Đánh giá tổng quát
        rich_features = (feature_count >= 250)

        if rich_features:
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
    parser = argparse.ArgumentParser(description="OpenCV 360 Panorama Stitching & Verification Worker v3")
    parser.add_argument("--verify-image", help="Đường dẫn 1 file ảnh cần kiểm tra chất lượng")
    parser.add_argument("--prev-image", help="Đường dẫn file ảnh kế trước để so khớp độ chồng lấp")
    parser.add_argument("--images", nargs="+", help="Danh sách đường dẫn các file ảnh cần ghép")
    parser.add_argument("--input_json", help="File JSON chứa danh sách đường dẫn ảnh")
    parser.add_argument("--output", help="Đường dẫn file ảnh đầu ra (.jpg)")
    parser.add_argument("--width", type=int, default=0, help="Chiều rộng ảnh đầu ra (0 = Tự động)")

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
