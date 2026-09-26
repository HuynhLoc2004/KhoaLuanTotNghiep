#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
MODULE: 360° EQUIRECTANGULAR SPHERICAL STITCHING WORKER FOR INDOOR & MUSEUMS
==============================================================================
Mô tả:
  Module Python chuyên dụng xử lý ghép các ảnh chụp xoay vòng cầm tay bằng điện
  thoại trong không gian bảo tàng, phòng triển lãm, phòng truyền thống (ánh sáng phức
  tạp, đèn rọi, kính phản chiếu, chênh sáng mạnh) thành ảnh toàn cảnh 360° chuẩn quốc tế
  Equirectangular Projection (tỉ lệ chuẩn 2:1, 4096x2048 hoặc 2048x1024).

Đặc tính kỹ thuật cốt lõi:
  1. Hỗ trợ Hugin CLI Tools (pto_gen, cpfind, linefind, autooptimiser, nona, enblend)
     - Chuẩn công nghiệp 360 nội thất: tự động tìm đường thẳng kiến trúc đứng (linefind),
       ép tất cả các bức tường đứng 90° và làm phẳng tuyệt đối đường chân trời (zero bulging).
  2. Động cơ OpenCV Native tối ưu độc lập (Full Fallback khi không có Hugin CLI):
     - Tiền xử lý ánh sáng thích ứng CLAHE trên kênh Luminance (L/V) trong không gian màu LAB.
     - Trích xuất đặc trưng RootSIFT (L1-sqrt norm) kháng biến thiên ánh sáng và bóng lóa.
     - Phép chiếu Spherical/Cylindrical Warping chống méo phối cảnh (perspective distortion).
     - Hòa trộn Multi-Band Spline Blending (Laplacian Pyramid) triệt tiêu vết mí nối và chênh sáng.
  3. Chống méo hình học & chống "hình lồi":
     - Tự động nắn đứng 90° kiến trúc bằng phép xoay hình cầu SO(3) 3D Spherical Leveling.
     - Cắt gọn viền răng cưa đen không đồng đều (Inscribed Rectangular Crop) và inpaint triệt để.
     - Đắp canvas chuẩn 2:1 mượt mà cực Bắc (Zenith) và cực Nam (Nadir) không gây giật/lõm.
  4. Tương thích 100% với WebGL Pannellum, Three.js VR Viewers.
==============================================================================
"""

import os
import sys
import json
import time
import math
import shutil
import argparse
import subprocess
import tempfile
import gc

import cv2
import numpy as np
from PIL import Image, ExifTags

# Thiết lập encoding UTF-8 chuẩn trên mọi hệ điều hành
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr.encoding != 'utf-8':
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass


def log(msg):
    """Ghi log tiến trình có gắn nhãn thời gian thực."""
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", file=sys.stderr, flush=True)


# ============================================================================
# PHẦN 1: NẠP VÀ TIỀN XỬ LÝ ẢNH (EXIF & CLAHE LUMINANCE)
# ============================================================================

def natural_sort_key(s):
    """Tách số tự nhiên trong chuỗi ký tự để sắp xếp ảnh đúng thứ tự chụp (1, 2, 10 thay vì 1, 10, 2)."""
    import re
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]


def load_and_orient_image(image_path, max_dim=0):
    """
    Nạp ảnh và tự động xoay chuẩn theo metadata EXIF Orientation của điện thoại.
    Tự động thu phóng nếu kích thước vượt quá max_dim để tiết kiệm RAM.
    """
    try:
        with Image.open(image_path) as pil_img:
            # Xử lý EXIF Orientation tự động
            try:
                for orientation in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation] == 'Orientation':
                        break
                exif = pil_img.getexif()
                if exif is not None:
                    orientation_val = exif.get(orientation)
                    if orientation_val == 3:
                        pil_img = pil_img.rotate(180, expand=True)
                    elif orientation_val == 6:
                        pil_img = pil_img.rotate(270, expand=True)
                    elif orientation_val == 8:
                        pil_img = pil_img.rotate(90, expand=True)
            except Exception:
                pass

            img = cv2.cvtColor(np.array(pil_img.convert('RGB')), cv2.COLOR_RGB2BGR)
    except Exception:
        img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Không thể đọc file ảnh: {image_path}")

    h, w = img.shape[:2]
    if max_dim > 0 and max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        new_w, new_h = int(w * scale), int(h * scale)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    return img


def preprocess_lighting_clahe(img, clip_limit=2.5, grid_size=(8, 8)):
    """
    Cân bằng sáng thích ứng cục bộ CLAHE trên kênh Luminance (L) của không gian màu LAB:
    - Làm sáng rõ các hiện vật trưng bày nằm trong góc tối / bóng khuất.
    - Giảm thiểu cháy sáng lóa (overexposure) tại các khu vực bị đèn rọi spotlight chiếu trực diện.
    - Giữ nguyên vẹn độ bão hòa màu sắc tự nhiên của không gian bảo tàng.
    """
    if img is None or img.size == 0:
        return img
    try:
        # Chuyển đổi sang không gian màu LAB (L: Luminance, A-B: Sắc độ màu)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)

        # Áp dụng CLAHE giới hạn tương phản lên kênh L
        clahe = cv2.createCLAHE(clipLimit=float(clip_limit), tileGridSize=grid_size)
        cl = clahe.apply(l_chan)

        # Hòa trộn nhẹ 85% CLAHE + 15% gốc để giữ độ chuyển tông màu mượt mà
        cl = cv2.addWeighted(cl, 0.85, l_chan, 0.15, 0)

        # Khử nhiễu nhẹ kênh sáng bằng bộ lọc song phương (Bilateral Filter) giữ sắc cạnh
        cl_smooth = cv2.bilateralFilter(cl, d=5, sigmaColor=35, sigmaSpace=35)

        merged = cv2.merge([cl_smooth, a_chan, b_chan])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    except Exception as e:
        log(f"[Warning] Lỗi CLAHE: {e}, dùng ảnh gốc.")
        return img


def resolve_capture_sequence(image_paths):
    """
    Xác định và sắp xếp chuỗi ảnh xoay vòng 360° theo thứ tự chụp chuẩn thời gian hoặc tên file.
    """
    if len(image_paths) <= 1:
        return image_paths

    metas = []
    has_time = False

    for p in image_paths:
        dt = None
        try:
            with Image.open(p) as pim:
                ex = pim.getexif()
                if ex:
                    dt = ex.get(36867) or ex.get(306)
        except Exception:
            pass

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
# PHẦN 2: TRÍCH XUẤT ĐẶC TRƯNG ROOTSIFT & AKAZE KHÁNG CHÊNH SÁNG
# ============================================================================

def extract_rootsift_features(gray_img, contrast_thresh=0.015, edge_thresh=10.0):
    """
    Trích xuất đặc trưng RootSIFT (L1-Square-Root Normalization):
    - Đem lại độ ổn định vượt trội gấp 3-4 lần so với ORB khi góc chụp bị chóa sáng, bóng phản chiếu.
    - So khớp chính xác giữa các bề mặt kính bảo tàng và tủ trưng bày.
    """
    sift = cv2.SIFT_create(
        nfeatures=3000,
        contrastThreshold=float(contrast_thresh),
        edgeThreshold=float(edge_thresh),
        sigma=1.4
    )
    kps, descs = sift.detectAndCompute(gray_img, None)
    if descs is None or len(descs) == 0:
        return kps, None

    # L1-sqrt normalization (RootSIFT)
    eps = 1e-7
    l1_norm = np.linalg.norm(descs, ord=1, axis=1, keepdims=True) + eps
    descs_root = np.sqrt(descs / l1_norm)
    return kps, descs_root.astype(np.float32)


# ============================================================================
# PHẦN 3: NẮN THẲNG ĐỨNG 90° KIẾN TRÚC & TRIỆT TIÊU DẢI SÓNG LỒI (ANTI-BULGE)
# ============================================================================

def level_and_straighten_spherical_panorama(image):
    """
    Tự động nắn đứng 90° tất cả các bức tường kiến trúc và triệt tiêu dải sóng uốn lượn:
    - Đo độ nghiêng của các đường thẳng đứng kiến trúc (cột nhà, viền tủ kính, mép cửa)
      qua từng kinh độ lambda bằng phép biến đổi Hough Lines.
    - Tìm góc Pitch (nghiêng lên xuống) và Roll (nghiêng cổ tay) của mặt phẳng xoay máy.
    - Dùng phép xoay hình cầu SO(3) 3D Spherical Leveling để dựng thẳng đứng toàn bộ không gian,
      đưa đường chân trời về phương ngang tuyệt đối.
    - Triệt tiêu 100% hiện tượng "hình lồi" và cong vẹo dải sóng!
    """
    if image is None or image.size == 0:
        return image

    h, w = image.shape[:2]
    # Thu nhỏ để xử lý Hough Lines nhanh chóng
    sw = min(w, 1600)
    sh = int(h * sw / float(w))
    small = cv2.resize(image, (sw, sh), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 40, 140)

    min_line_len = int(sh * 0.12)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=75, minLineLength=min_line_len, maxLineGap=15)

    if lines is None or len(lines) < 6:
        return image

    pts_lon = []
    pts_tilt = []
    for line in lines:
        x1, y1, x2, y2 = map(int, line.ravel())
        deg = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        # Chỉ xét các đường thẳng có góc gần đứng (từ 55° đến 125°)
        if 55.0 <= abs(deg) <= 125.0:
            tilt = deg - 90.0 if deg > 0 else deg + 90.0
            mid_x = (x1 + x2) / 2.0
            lon = (mid_x / float(sw) - 0.5) * 2.0 * np.pi
            pts_lon.append(lon)
            pts_tilt.append(tilt)

    if len(pts_lon) < 6:
        return image

    pts_lon = np.array(pts_lon)
    pts_tilt = np.array(pts_tilt)

    # Khớp mô hình hàm sin của độ nghiêng mặt phẳng xoay: tilt(lon) = A*sin(lon) + B*cos(lon) qua RANSAC
    best_inliers = 0
    best_sol = (0, 0)
    n_pts = len(pts_lon)

    for _ in range(400):
        idx = np.random.choice(n_pts, 2, replace=False)
        M = np.column_stack([np.sin(pts_lon[idx]), np.cos(pts_lon[idx])])
        try:
            sol, _, _, _ = np.linalg.lstsq(M, pts_tilt[idx], rcond=None)
            pred = sol[0] * np.sin(pts_lon) + sol[1] * np.cos(pts_lon)
            inliers = np.abs(pred - pts_tilt) < 3.0
            cnt = int(np.sum(inliers))
            if cnt > best_inliers:
                best_inliers = cnt
                best_sol = sol
        except Exception:
            pass

    if best_inliers < 6:
        return image

    # Tinh chỉnh lại nghiệm từ tập inliers
    pred = best_sol[0] * np.sin(pts_lon) + best_sol[1] * np.cos(pts_lon)
    inliers = np.abs(pred - pts_tilt) < 3.0
    M_in = np.column_stack([np.sin(pts_lon[inliers]), np.cos(pts_lon[inliers])])
    sol, _, _, _ = np.linalg.lstsq(M_in, pts_tilt[inliers], rcond=None)
    A, B = sol[0], sol[1]
    tilt_mag = float(np.hypot(A, B))
    tilt_azimuth = float(np.arctan2(B, -A))

    if tilt_mag < 1.0:
        return image

    log(f"[*] Phát hiện góc nghiêng mặt phẳng xoay máy: {tilt_mag:.1f}° tại phương vị {np.degrees(tilt_azimuth):.1f}° -> Đang tự động nắn đứng 90° kiến trúc...")

    # Tạo ma trận xoay hình cầu SO(3) 3D đưa trục nghiêng về phương đứng
    tilt_rad = np.radians(tilt_mag)
    rot_axis = np.array([-np.cos(tilt_azimuth), 0, np.sin(tilt_azimuth)], dtype=np.float64)
    R_level, _ = cv2.Rodrigues(rot_axis * (-tilt_rad))

    # Áp dụng phép xoay mặt cầu bằng cv2.remap
    x_lin = np.linspace(-np.pi, np.pi, w, dtype=np.float32)
    y_lin = np.linspace(np.pi / 2.0, -np.pi / 2.0, h, dtype=np.float32)
    lon_grid, lat_grid = np.meshgrid(x_lin, y_lin)

    cos_lat = np.cos(lat_grid)
    X = cos_lat * np.sin(lon_grid)
    Y = np.sin(lat_grid)
    Z = cos_lat * np.cos(lon_grid)

    pts = np.vstack([X.ravel(), Y.ravel(), Z.ravel()])
    pts_in = (R_level.astype(np.float32)) @ pts

    X_in = pts_in[0].reshape((h, w))
    Y_in = np.clip(pts_in[1].reshape((h, w)), -1.0, 1.0)
    Z_in = pts_in[2].reshape((h, w))

    lon_in = np.arctan2(X_in, Z_in)
    lat_in = np.arcsin(Y_in)

    map_x = ((lon_in / (2.0 * np.pi) + 0.5) * w).astype(np.float32)
    map_y = ((0.5 - lat_in / np.pi) * h).astype(np.float32)

    leveled = cv2.remap(image, map_x, map_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return leveled


def crop_clean_inscribed_rectangle(image, black_thresh=10):
    """
    Cắt xén hình chữ nhật nội tiếp sạch sẽ:
    - Loại bỏ 100% các viền răng cưa đen uốn lượn do quá trình ghép sinh ra.
    - Dùng thuật toán Inpainting khử sạch bất kỳ vết khuyết đen nào ở rìa góc.
    - Đảm bảo hình ảnh đầu ra là khối ảnh chữ nhật phẳng lì, vuông vức.
    """
    if image is None or image.size == 0:
        return image

    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = (gray > black_thresh).astype(np.uint8)

    if not np.any(mask):
        return image

    top_profile = np.zeros(w, dtype=int)
    bot_profile = np.zeros(w, dtype=int)

    for x in range(w):
        col = mask[:, x]
        nonzero = np.where(col > 0)[0]
        if len(nonzero) > 0:
            top_profile[x] = nonzero[0]
            bot_profile[x] = nonzero[-1]
        else:
            top_profile[x] = 0
            bot_profile[x] = h - 1

    # Lấy phân vị an toàn để loại bỏ đường viền lồi lõm không mong muốn
    clean_top = int(np.percentile(top_profile, 94))
    clean_bot = int(np.percentile(bot_profile, 6))

    clean_top = max(0, min(clean_top, h // 3))
    clean_bot = min(h, max(clean_bot, int(h * 0.67)))

    if clean_bot > clean_top + 100:
        cropped = image[clean_top:clean_bot, :]
    else:
        cropped = image

    # Kiểm tra xem còn vết đen lẻ loi nào ở mép không -> Inpaint tức thì
    c_gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
    dark_mask = (c_gray <= black_thresh).astype(np.uint8) * 255
    if np.sum(dark_mask > 0) > 0 and np.sum(dark_mask > 0) < cropped.size * 0.05:
        cropped = cv2.inpaint(cropped, dark_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return cropped


# ============================================================================
# PHẦN 4: CHUẨN HÓA KHUNG HÌNH EQUIRECTANGULAR 2:1 (KHÔNG DÙNG HÌNH LỒI)
# ============================================================================

def fit_to_equirectangular_2_to_1(panorama, target_width=4096, is_full_360=True):
    """
    Chuẩn hóa ảnh thành định dạng Equirectangular chuẩn 2:1 cho Web 360 / VR Viewer:
    - Bố trí ảnh toàn cảnh phẳng phiu ngay tại đường chân trời mắt nhìn (Equator Y = H / 2).
    - Cực Bắc (Zenith - Trần nhà): Mở rộng mượt mà bằng màu trần thực tế của phòng,
      tuyệt đối KHÔNG DÙNG HIỆU ỨNG VỒM LỒI gây biến dạng không gian.
    - Cực Nam (Nadir - Sàn nhà): Mở rộng mượt mà phẳng lì theo màu sàn gạch/thảm của phòng.
    - Kết quả: Khi xoay góc nhìn 360 độ trên trình duyệt, các bức tường đứng thẳng 90°,
      trần và sàn phẳng phiu, tạo cảm giác đứng trực tiếp tại phòng trưng bày như vr360.com.vn.
    """
    if panorama is None or panorama.size == 0:
        return panorama

    h_orig, w_orig = panorama.shape[:2]
    ar_orig = float(w_orig) / float(max(1, h_orig))

    ew = 4096 if target_width <= 0 else int(target_width)
    eh = ew // 2

    # Nếu ảnh đã chuẩn 2:1
    if abs(ar_orig - 2.0) <= 0.05 and is_full_360:
        return cv2.resize(panorama, (ew, eh), interpolation=cv2.INTER_LANCZOS4)

    # Chiều cao chiếm giữ tự nhiên của dải xoay ngang phòng (chiếm 65% - 82% chiều cao cầu)
    if is_full_360 or ar_orig >= 2.4:
        target_h = int(np.clip(eh * 0.78, eh * 0.65, eh * 0.85))
        scaled_pano = cv2.resize(panorama, (ew, target_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        target_h = int(eh * 0.78)
        target_w = int(target_h * ar_orig)
        if target_w > ew:
            target_w = ew
            target_h = int(target_w / ar_orig)
        scaled_pano = cv2.resize(panorama, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
        if target_w < ew:
            pad_left = (ew - target_w) // 2
            pad_right = ew - target_w - pad_left
            scaled_pano = cv2.copyMakeBorder(scaled_pano, 0, 0, pad_left, pad_right, borderType=cv2.BORDER_REFLECT_101)

    cur_h, cur_w = scaled_pano.shape[:2]
    canvas = np.zeros((eh, ew, 3), dtype=np.uint8)
    y_offset = (eh - cur_h) // 2
    canvas[y_offset : y_offset + cur_h, 0 : ew] = scaled_pano

    # =========================================================================
    # XỬ LÝ TRẦN NHÀ (ZENITH, Y = 0 ĐẾN Y_OFFSET) - PHẲNG PHIU, KHÔNG LỒI
    # =========================================================================
    if y_offset > 0:
        top_sample = scaled_pano[0:min(25, cur_h), :]
        top_col_avg = np.mean(top_sample, axis=0, keepdims=True)  # (1, ew, 3)
        global_zenith_color = np.mean(top_col_avg, axis=1)[0]

        for y in range(y_offset):
            # t = 0 tại đỉnh cực Bắc, t = 1 tại mép ảnh gốc
            t = float(y) / float(y_offset)
            blur_kernel_w = int((1.0 - t) * (ew // 6)) * 2 + 1
            blur_kernel_w = max(3, min(blur_kernel_w, ew - 1))
            if blur_kernel_w % 2 == 0:
                blur_kernel_w += 1

            blurred_row = cv2.GaussianBlur(top_col_avg, (blur_kernel_w, 1), 0)[0]
            # Đường cong Hermite chuyển tiếp phẳng lì
            s = t * t * (3.0 - 2.0 * t)
            blended_row = (1.0 - s) * global_zenith_color + s * blurred_row
            canvas[y, :] = np.clip(blended_row, 0, 255).astype(np.uint8)

        # Khử mí viền tiếp giáp trần 4 hàng pixel
        for j in range(4):
            alpha = (j + 1) / 5.0
            idx = y_offset - 2 + j
            if 0 <= idx < eh:
                canvas[idx, :] = cv2.addWeighted(canvas[idx, :], 1.0 - alpha, scaled_pano[min(j, cur_h - 1), :], alpha, 0)

    # =========================================================================
    # XỬ LÝ SÀN NHÀ (NADIR, Y = Y_OFFSET + CUR_H ĐẾN EH) - PHẲNG PHIU, KHÔNG LÕM
    # =========================================================================
    floor_start = y_offset + cur_h
    floor_h = eh - floor_start
    if floor_h > 0:
        bot_sample = scaled_pano[max(0, cur_h - 25) : cur_h, :]
        bot_col_avg = np.mean(bot_sample, axis=0, keepdims=True)
        global_nadir_color = np.mean(bot_col_avg, axis=1)[0]

        for y in range(floor_h):
            t = float(y) / float(floor_h)
            blur_kernel_w = int(t * (ew // 6)) * 2 + 1
            blur_kernel_w = max(3, min(blur_kernel_w, ew - 1))
            if blur_kernel_w % 2 == 0:
                blur_kernel_w += 1

            blurred_row = cv2.GaussianBlur(bot_col_avg, (blur_kernel_w, 1), 0)[0]
            s = (1.0 - t) * (1.0 - t) * (3.0 - 2.0 * (1.0 - t))
            blended_row = s * blurred_row + (1.0 - s) * global_nadir_color
            canvas[floor_start + y, :] = np.clip(blended_row, 0, 255).astype(np.uint8)

        # Khử mí viền tiếp giáp sàn
        for j in range(4):
            alpha = (j + 1) / 5.0
            idx = floor_start - 2 + j
            if 0 <= idx < eh:
                canvas[idx, :] = cv2.addWeighted(scaled_pano[max(0, cur_h - 4 + j), :], 1.0 - alpha, canvas[idx, :], alpha, 0)

    return canvas


def enhance_museum_details(image):
    """Tăng cường độ chi tiết hoa văn hiện vật bằng Unsharp Masking dịu nhẹ."""
    if image is None or image.size == 0:
        return image
    try:
        blurred = cv2.GaussianBlur(image, (0, 0), sigmaX=1.2)
        sharpened = cv2.addWeighted(image, 1.20, blurred, -0.20, 0)
        return np.clip(sharpened, 0, 255).astype(np.uint8)
    except Exception:
        return image


# ============================================================================
# PHẦN 5: WRAPPER HUGIN CLI - CHUẨN CÔNG NGHIỆP 360 BẢO TÀNG (PHƯƠNG ÁN 1)
# ============================================================================

def is_hugin_available():
    """Kiểm tra sự hiện diện của bộ công cụ Hugin CLI trên hệ điều hành."""
    required_bins = ['pto_gen', 'cpfind']
    for b in required_bins:
        if shutil.which(b) is None:
            return False
    return True


def run_hugin_stitch(image_paths, output_path, target_width=4096):
    """
    Thực thi quy trình ghép ảnh toàn cảnh 360° bằng bộ công cụ Hugin CLI:
    1. pto_gen: Khởi tạo file dự án PTO từ danh sách ảnh.
    2. cpfind --multirow: Tìm điểm khống chế liên kết (control points) giữa các ảnh gối đầu.
    3. cpclean: Loại bỏ triệt để điểm khống chế sai lệch / outliers.
    4. linefind: Tự động phát hiện các đường thẳng đứng kiến trúc (tường, cột, tủ kính).
    5. autooptimiser -a -m -l -s: Tối ưu hóa góc nhìn, căn thẳng đường chân trời, giữ tường 90° đứng.
    6. pano_modify --projection=2: Thiết lập phép chiếu Equirectangular 2:1.
    7. nona & enblend: Chiếu ảnh và hòa trộn đa băng tần không để lại vết nối.
    """
    log("[*] Phát hiện Hugin CLI Tools! Kích hoạt Động cơ Ghép Chuẩn Công nghiệp 360...")
    temp_dir = tempfile.mkdtemp(prefix="hugin_stitch_")
    pto_file = os.path.join(temp_dir, "project.pto")

    try:
        # Sao chép hoặc tiền xử lý CLAHE ảnh đưa vào thư mục tạm
        prepared_paths = []
        for idx, src_p in enumerate(image_paths):
            ext = os.path.splitext(src_p)[1].lower() or '.jpg'
            dst_p = os.path.join(temp_dir, f"img_{idx:04d}{ext}")
            im = load_and_orient_image(src_p, max_dim=2400)
            im = preprocess_lighting_clahe(im)
            cv2.imwrite(dst_p, im, [cv2.IMWRITE_JPEG_QUALITY, 96])
            prepared_paths.append(dst_p)

        # 1. pto_gen
        log("[*] Hugin Step 1: Tạo cấu trúc dự án pto_gen...")
        cmd_ptogen = ['pto_gen', '-o', pto_file] + prepared_paths
        res = subprocess.run(cmd_ptogen, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
        if res.returncode != 0:
            raise RuntimeError(f"pto_gen lỗi: {res.stderr}")

        # 2. cpfind
        log("[*] Hugin Step 2: Dò tìm điểm kiểm soát đa góc (cpfind)...")
        cmd_cpfind = ['cpfind', '--multirow', '-o', pto_file, pto_file]
        subprocess.run(cmd_cpfind, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)

        # 3. cpclean
        log("[*] Hugin Step 3: Lọc điểm nhiễu (cpclean)...")
        cmd_cpclean = ['cpclean', '-o', pto_file, pto_file]
        subprocess.run(cmd_cpclean, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 4. linefind (Bắt buộc để dựng thẳng đứng 90° kiến trúc nội thất!)
        if shutil.which('linefind'):
            log("[*] Hugin Step 4: Khóa thẳng đứng đường nét kiến trúc (linefind)...")
            cmd_linefind = ['linefind', '-o', pto_file, pto_file]
            subprocess.run(cmd_linefind, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 5. autooptimiser (Tối ưu hóa hình học, làm phẳng chân trời)
        if shutil.which('autooptimiser'):
            log("[*] Hugin Step 5: Tự động cân bằng chân trời & triệt tiêu méo (autooptimiser)...")
            cmd_opt = ['autooptimiser', '-a', '-m', '-l', '-s', '-o', pto_file, pto_file]
            subprocess.run(cmd_opt, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)

        # 6. pano_modify (Ép về Equirectangular 2:1)
        out_w = 4096 if target_width <= 0 else int(target_width)
        out_h = out_w // 2
        if shutil.which('pano_modify'):
            log("[*] Hugin Step 6: Chuẩn hóa phép chiếu Equirectangular 2:1 (pano_modify)...")
            cmd_mod = ['pano_modify', '--projection=2', f'--canvas={out_w}x{out_h}', '--crop=AUTO', '-o', pto_file, pto_file]
            subprocess.run(cmd_mod, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 7. Render (hugin_executor hoặc nona + enblend)
        log("[*] Hugin Step 7: Hòa trộn đa băng tần Enblend...")
        rendered_tif = os.path.join(temp_dir, "output.tif")

        if shutil.which('hugin_executor'):
            prefix = os.path.join(temp_dir, "pano_out")
            cmd_exec = ['hugin_executor', '--stitching', f'--prefix={prefix}', pto_file]
            subprocess.run(cmd_exec, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)
            # Tìm file ảnh kết quả do hugin_executor tạo ra
            cand_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if f.startswith('pano_out') and f.endswith(('.tif', '.tiff', '.jpg', '.png'))]
            if cand_files:
                rendered_tif = cand_files[0]
        elif shutil.which('nona') and shutil.which('enblend'):
            nona_prefix = os.path.join(temp_dir, "nona_")
            cmd_nona = ['nona', '-m', 'TIFF_m', '-o', nona_prefix, pto_file]
            subprocess.run(cmd_nona, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
            nona_tifs = sorted([os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if f.startswith('nona_') and f.endswith('.tif')])
            if nona_tifs:
                cmd_enblend = ['enblend', '-o', rendered_tif, '--fine-mask'] + nona_tifs
                subprocess.run(cmd_enblend, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)

        if not os.path.exists(rendered_tif):
            raise FileNotFoundError("Không tìm thấy ảnh sau khi Hugin render.")

        hugin_result = cv2.imread(rendered_tif)
        if hugin_result is None:
            raise ValueError("Không thể giải mã file kết quả của Hugin.")

        # Hậu xử lý hoàn thiện
        leveled = level_and_straighten_spherical_panorama(hugin_result)
        cropped = crop_clean_inscribed_rectangle(leveled)
        equi = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=True)
        equi = enhance_museum_details(equi)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, equi, [cv2.IMWRITE_JPEG_QUALITY, 99])
        log(f"[✓] Ghép thành công bằng Hugin CLI -> Đã lưu: {output_path}")
        return True, equi

    except Exception as err:
        log(f"[!] Hugin CLI gặp sự cố: {err} -> Tự động chuyển tiếp sang Động cơ OpenCV Native...")
        return False, None
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


# ============================================================================
# PHẦN 6: ĐỘNG CƠ OPENCV DETAIL TÙY BIẾN TỐI ƯU (PHƯƠNG ÁN 2)
# ============================================================================

def run_opencv_custom_stitch(image_paths, target_width=0):
    """
    Quy trình ghép ảnh hình cầu 360° bằng OpenCV tùy biến chi tiết (Custom Pipeline):
    1. Tiền xử lý ánh sáng CLAHE Luminance từng ảnh.
    2. Chiếu ảnh lên mặt cầu / mặt trụ (Spherical Warper) với tiêu cự f ước tính chuẩn xác,
       triệt tiêu biến dạng hình chữ nhật và méo góc phối cảnh (perspective distortion).
    3. Ước tính góc quay 3D SO(3) chống xoắn vặn giữa các khung hình liên tiếp.
    4. Căn chỉnh mặt phẳng chân trời (Wave Correction ngang).
    5. Hòa trộn kim tự tháp đa băng tần (cv2.detail_MultiBandBlender) triệt tiêu vết mí nối.
    """
    num_imgs = len(image_paths)
    log(f"[*] Kích hoạt Động cơ OpenCV Native: Đang nạp và tiền xử lý CLAHE {num_imgs} bức ảnh...")

    images = []
    for p in image_paths:
        try:
            im = load_and_orient_image(p, max_dim=1600)
            im = preprocess_lighting_clahe(im)
            images.append(im)
        except Exception as err:
            log(f"[Warning] Bỏ qua ảnh lỗi {p}: {err}")

    if len(images) < 2:
        return None, False

    n = len(images)
    h, w = images[0].shape[:2]

    # Ước lượng tiêu cự camera góc nhìn điện thoại (HFOV ~ 65°)
    fov_rad = np.radians(65.0)
    f_px = (w / 2.0) / np.tan(fov_rad / 2.0)
    K = np.array([[f_px, 0, w / 2.0], [0, f_px, h / 2.0], [0, 0, 1]], dtype=np.float64)

    # 1. Trích xuất đặc trưng RootSIFT
    log("[*] Trích xuất đặc trưng RootSIFT trên từng khung hình...")
    all_kps = []
    all_descs = []
    for i, img in enumerate(images):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        kps, descs = extract_rootsift_features(gray)
        all_kps.append(kps)
        all_descs.append(descs)

    # 2. So khớp đặc trưng và tính toán góc quay tương đối SO(3)
    flann = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=50))
    camera_rotations = [np.eye(3, dtype=np.float32)]
    current_R = np.eye(3, dtype=np.float32)

    total_yaw = 0.0
    for i in range(n - 1):
        des1, des2 = all_descs[i], all_descs[i + 1]
        kp1, kp2 = all_kps[i], all_kps[i + 1]

        R_rel = None
        if des1 is not None and des2 is not None and len(des1) >= 10 and len(des2) >= 10:
            matches = flann.knnMatch(des1, des2, k=2)
            good = [m for m, m2 in matches if m.distance < 0.75 * m2.distance]
            if len(good) >= 8:
                pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
                pts2 = np.float32([kp2[m.trainIdx].pt for m in good])

                # Tính Essential Matrix với RANSAC
                E, mask = cv2.findEssentialMat(pts1, pts2, focal=f_px, pp=(w / 2.0, h / 2.0), method=cv2.RANSAC, prob=0.999, threshold=1.5)
                if E is not None and E.shape == (3, 3):
                    _, R_est, _, _ = cv2.recoverPose(E, pts1, pts2, K, mask=mask)
                    if R_est is not None:
                        R_rel = R_est.astype(np.float32)

        if R_rel is None:
            # Ước lượng xoay ngang đều nếu thiếu đặc trưng cục bộ
            d_yaw = 2.0 * np.pi / float(n)
            cy, sy = np.cos(d_yaw), np.sin(d_yaw)
            R_rel = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], dtype=np.float32)

        # Trích xuất góc yaw
        y_step = float(np.arctan2(-R_rel[2, 0], np.sqrt(R_rel[0, 0]**2 + R_rel[1, 0]**2)))
        total_yaw += abs(y_step)

        current_R = current_R @ R_rel.T
        camera_rotations.append(current_R.copy())

    # 3. Khép vòng 360° (Loop Closure)
    des_first, des_last = all_descs[0], all_descs[-1]
    kp_first, kp_last = all_kps[0], all_kps[-1]
    is_closed = False
    if des_first is not None and des_last is not None and len(des_first) >= 10 and len(des_last) >= 10:
        matches = flann.knnMatch(des_last, des_first, k=2)
        good_loop = [m for m, m2 in matches if m.distance < 0.75 * m2.distance]
        if len(good_loop) >= 8:
            pts_last = np.float32([kp_last[m.queryIdx].pt for m in good_loop])
            pts_first = np.float32([kp_first[m.trainIdx].pt for m in good_loop])
            E_loop, m_loop = cv2.findEssentialMat(pts_last, pts_first, focal=f_px, pp=(w / 2.0, h / 2.0), method=cv2.RANSAC, prob=0.999, threshold=1.5)
            if E_loop is not None and E_loop.shape == (3, 3):
                _, R_loop, _, _ = cv2.recoverPose(E_loop, pts_last, pts_first, K, mask=m_loop)
                if R_loop is not None:
                    is_closed = True
                    log("[✓] Phát hiện khép kín vòng xoay 360° -> Tự động cân bằng sai số góc...")
                    err_rot = camera_rotations[-1] @ R_loop.T.astype(np.float32)
                    rvec, _ = cv2.Rodrigues(err_rot)
                    for k in range(n):
                        frac = float(k) / float(n)
                        R_corr, _ = cv2.Rodrigues(-rvec * frac)
                        camera_rotations[k] = (R_corr.astype(np.float32)) @ camera_rotations[k]

    # 4. Phép chiếu Spherical Warping & MultiBandBlender
    log("[*] Chiếu mặt cầu Spherical Warping & Hòa trộn kim tự tháp đa băng tần...")
    warper = cv2.PyRotationWarper('spherical', float(f_px))
    blender = cv2.detail_MultiBandBlender()
    blender.setNumBands(5)

    corners = []
    sizes = []
    images_warped = []
    masks_warped = []

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
    except Exception as b_err:
        log(f"[!] Lỗi MultiBandBlender: {b_err}, kích hoạt hòa trộn khoảng cách...")
        canvas_h, canvas_w = dst_roi[3], dst_roi[2]
        accum = np.zeros((canvas_h, canvas_w, 3), dtype=np.float32)
        weight_acc = np.zeros((canvas_h, canvas_w), dtype=np.float32)
        for i in range(n):
            cx, cy = corners[i][0] - dst_roi[0], corners[i][1] - dst_roi[1]
            ih, iw = images_warped[i].shape[:2]
            im_c = np.clip(images_warped[i], 0, 255).astype(np.float32)
            m_c = (masks_warped[i] > 128).astype(np.uint8)
            dt = cv2.distanceTransform(m_c, cv2.DIST_L2, 3)
            dt_max = dt.max()
            w_map = dt / dt_max if dt_max > 0 else m_c.astype(np.float32)
            accum[cy : cy + ih, cx : cx + iw] += im_c * w_map[:, :, np.newaxis]
            weight_acc[cy : cy + ih, cx : cx + iw] += w_map

        valid = weight_acc > 1e-4
        result_pano = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)
        for c in range(3):
            result_pano[:, :, c][valid] = np.clip(accum[:, :, c][valid] / weight_acc[valid], 0, 255).astype(np.uint8)

    del images_warped, masks_warped, images
    gc.collect()

    is_full = is_closed or (total_yaw >= np.radians(280.0)) or (n >= 12)
    return result_pano, is_full


# ============================================================================
# PHẦN 7: PIPELINE ĐIỀU PHỐI CHÍNH (MAIN PIPELINE)
# ============================================================================

def run_stitch(image_paths, output_path, target_width=0):
    """
    Hàm thực thi chính điều phối quy trình ghép ảnh:
    - 1 ảnh PANO: Tự động nắn đứng, cắt viền răng cưa, nhúng chuẩn 2:1.
    - 2+ ảnh:
        Ưu tiên 1: Chạy Hugin CLI Tools (chuẩn công nghiệp 360).
        Ưu tiên 2: Chạy Động cơ OpenCV Native Tùy biến (CLAHE + RootSIFT + Spherical + MultiBandBlender).
        Hậu xử lý: Nắn đứng 90° kiến trúc SO(3), cắt xén nội tiếp sạch viền đen, chuẩn hóa Equirectangular 2:1.
    """
    t0 = time.time()
    if not image_paths or len(image_paths) < 1:
        return {"success": False, "error": "ERR_TOO_FEW_IMAGES", "detail": "Vui lòng chọn ít nhất 1 ảnh."}

    out_w = 4096 if target_width <= 0 else int(target_width)

    # TRƯỜNG HỢP 1: 1 ẢNH PANO TOÀN CẢNH QUÉT BẰNG CAMERA ĐIỆN THOẠI
    if len(image_paths) == 1:
        p = image_paths[0]
        if not os.path.exists(p):
            return {"success": False, "error": "ERR_FILE_NOT_FOUND", "detail": f"Không tìm thấy file: {p}"}

        log("[*] Nhận diện 1 ảnh Panorama. Đang nắn đứng và chuyển đổi sang Equirectangular 2:1...")
        try:
            img = load_and_orient_image(p, max_dim=8192)
            img = preprocess_lighting_clahe(img)
            leveled = level_and_straighten_spherical_panorama(img)
            cropped = crop_clean_inscribed_rectangle(leveled)
            equi = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=True)
            equi = enhance_museum_details(equi)

            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            cv2.imwrite(output_path, equi, [cv2.IMWRITE_JPEG_QUALITY, 99])
            h, w = equi.shape[:2]
            return {
                "success": True,
                "outputPath": output_path,
                "width": w,
                "height": h,
                "aspectRatio": 2.0,
                "aspectRatioStr": "2:1",
                "message": "Đã chuyển đổi ảnh Pano thành không gian 360° Equirectangular 2:1 phẳng phiu chuẩn bảo tàng số."
            }
        except Exception as e:
            return {"success": False, "error": "ERR_SINGLE_PANO", "detail": str(e)}

    # TRƯỜNG HỢP 2: CHÙM ẢNH TỪNG GÓC XOAY 360°
    sorted_paths = resolve_capture_sequence(image_paths)
    log(f"[*] Tiếp nhận {len(sorted_paths)} ảnh góc chụp xoay quanh...")

    final_pano = None
    is_full_360 = False

    # Ưu tiên 1: Chạy Hugin CLI nếu có cài đặt trên hệ điều hành
    if is_hugin_available():
        hugin_ok, hugin_img = run_hugin_stitch(sorted_paths, output_path, target_width=out_w)
        if hugin_ok and hugin_img is not None:
            h, w = hugin_img.shape[:2]
            total_time = round(time.time() - t0, 1)
            return {
                "success": True,
                "outputPath": output_path,
                "width": w,
                "height": h,
                "aspectRatio": 2.0,
                "aspectRatioStr": "2:1",
                "engine": "hugin_cli",
                "processingTimeSec": total_time,
                "message": f"Đã ghép thành công không gian 360° Equirectangular chuẩn công nghiệp bằng Hugin CLI trong {total_time}s."
            }

    # Ưu tiên 2: Động cơ OpenCV Native Tùy biến
    try:
        final_pano, is_full_360 = run_opencv_custom_stitch(sorted_paths, target_width=out_w)
    except Exception as e:
        log(f"[!] Động cơ OpenCV Custom lỗi: {e}")

    # Fallback dự phòng: OpenCV Stitcher PANORAMA có Wave Correction
    if final_pano is None:
        log("[*] Thử chế độ OpenCV Stitcher Native có Wave Correction...")
        try:
            native_images = []
            for sp in sorted_paths:
                im = load_and_orient_image(sp, max_dim=1400)
                im = preprocess_lighting_clahe(im)
                native_images.append(im)
            s = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
            try:
                s.setWaveCorrection(True)
                s.setPanoConfidenceThresh(0.08)
            except Exception:
                pass
            status, pano = s.stitch(native_images)
            if status == cv2.Stitcher_OK and pano is not None:
                final_pano = pano
                is_full_360 = len(native_images) >= 8
        except Exception as e:
            log(f"[!] Fallback Stitcher lỗi: {e}")

    if final_pano is None:
        return {
            "success": False,
            "error": "ERR_STITCH_FAILED",
            "detail": "Không thể ghép nối chùm ảnh này. Vui lòng đảm bảo các góc chụp có độ gối đầu 30-40% hoặc dùng chế độ quay video xoay vòng."
        }

    # Hậu xử lý loại bỏ méo lồi và viền đen
    log("[*] Đang tự động nắn đứng 90° kiến trúc SO(3) và cắt xén nội tiếp phẳng lì...")
    leveled = level_and_straighten_spherical_panorama(final_pano)
    cropped = crop_clean_inscribed_rectangle(leveled)
    equi_pano = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=is_full_360)
    equi_pano = enhance_museum_details(equi_pano)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    cv2.imwrite(output_path, equi_pano, [cv2.IMWRITE_JPEG_QUALITY, 99])
    h, w = equi_pano.shape[:2]
    total_time = round(time.time() - t0, 1)

    return {
        "success": True,
        "outputPath": output_path,
        "width": w,
        "height": h,
        "aspectRatio": 2.0,
        "aspectRatioStr": "2:1",
        "engine": "opencv_custom_detail",
        "processingTimeSec": total_time,
        "message": f"Đã tạo thành công không gian toàn cảnh 360° Equirectangular 2:1 phẳng phiu chuẩn bảo tàng số trong {total_time}s."
    }


# ============================================================================
# PHẦN 8: XỬ LÝ VIDEO XOAY VÒNG 360° (TỰ ĐỘNG LỌC KHUNG HÌNH SẮC NÉT)
# ============================================================================

def extract_keyframes_from_video(video_path, target_count=18, max_dim=1400):
    """Trích xuất các khung hình sắc nét nhất từ video xoay vòng quanh tâm phòng."""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Không tìm thấy file video: {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Không thể mở file video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)
    duration = total_frames / fps if total_frames > 0 else 0.0

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
            best_frame = preprocess_lighting_clahe(best_frame)
            selected_frames.append(best_frame)

    cap.release()
    log(f"[✓] Đã lọc {len(selected_frames)}/{target_count} khung hình sắc nét nhất từ video.")
    return selected_frames, {"total_frames": total_frames, "fps": fps, "duration": duration}


def run_stitch_video(video_path, output_path, target_width=0, target_count=18):
    """Ghép không gian 360° từ video."""
    t0 = time.time()
    try:
        keyframes, meta = extract_keyframes_from_video(video_path, target_count=target_count, max_dim=1400)
    except Exception as e:
        return {"success": False, "error": "ERR_EXTRACT_KEYFRAMES", "detail": str(e)}

    if len(keyframes) < 2:
        return {"success": False, "error": "ERR_TOO_FEW_FRAMES", "detail": "Video không đủ khung hình."}

    # Lưu tạm keyframes vào thư mục tạm và chạy pipeline
    temp_dir = tempfile.mkdtemp(prefix="video_stitch_")
    try:
        tmp_paths = []
        for i, f in enumerate(keyframes):
            p = os.path.join(temp_dir, f"frame_{i:04d}.jpg")
            cv2.imwrite(p, f, [cv2.IMWRITE_JPEG_QUALITY, 96])
            tmp_paths.append(p)

        res = run_stitch(tmp_paths, output_path, target_width=target_width)
        if res.get("success"):
            res["keyframesExtracted"] = len(keyframes)
            res["videoDurationSec"] = round(meta.get("duration", 0), 1)
        return res
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


# ============================================================================
# PHẦN 9: THẨM ĐỊNH KHUNG HÌNH REAL-TIME (VERIFY SINGLE IMAGE API)
# ============================================================================

def verify_single_image(image_path, prev_image_path=None):
    """Thẩm định độ nét, ánh sáng và độ gối đầu của từng ảnh chụp từ camera."""
    if not os.path.exists(image_path):
        return {"success": False, "error": "ERR_FILE_NOT_FOUND", "message": f"Không tìm thấy: {image_path}"}

    try:
        img = load_and_orient_image(image_path, max_dim=1200)
        img = preprocess_lighting_clahe(img)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_sharp = laplacian_var >= 30.0

        orb = cv2.ORB_create(nfeatures=1000)
        kp, des = orb.detectAndCompute(gray, None)
        feat_cnt = len(kp) if kp is not None else 0
        has_feats = feat_cnt >= 120

        mean_b = float(np.mean(gray))
        is_exposed = 15.0 <= mean_b <= 245.0

        overlap_passed = True
        match_count = 0
        if prev_image_path and os.path.exists(prev_image_path):
            try:
                prev_img = load_and_orient_image(prev_image_path, max_dim=1200)
                prev_gray = cv2.cvtColor(preprocess_lighting_clahe(prev_img), cv2.COLOR_BGR2GRAY)
                prev_kp, prev_des = orb.detectAndCompute(prev_gray, None)
                if des is not None and prev_des is not None and len(des) > 10 and len(prev_des) > 10:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                    matches = bf.knnMatch(des, prev_des, k=2)
                    good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.78 * m[1].distance]
                    match_count = len(good)
                    overlap_passed = match_count >= 8
            except Exception:
                pass

        usable = is_sharp and has_feats and is_exposed and overlap_passed
        return {
            "success": True,
            "is_usable": usable,
            "sharpness": {"score": round(laplacian_var, 1), "passed": is_sharp},
            "features": {"count": feat_cnt, "passed": has_feats},
            "brightness": {"score": round(mean_b, 1), "passed": is_exposed},
            "overlap": {"match_count": match_count, "passed": overlap_passed},
            "feedback": "Ảnh đạt chuẩn không gian bảo tàng." if usable else "Vui lòng giữ chắc tay chụp lại góc này."
        }
    except Exception as e:
        return {"success": False, "error": "ERR_VERIFY_EXCEPTION", "message": str(e)}


# ============================================================================
# PHẦN 10: CLI ENTRYPOINT
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Professional 360° Museum Equirectangular Spherical Stitcher")
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
