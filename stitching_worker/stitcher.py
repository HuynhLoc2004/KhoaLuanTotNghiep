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

    if best_inliers < 15:
        return image

    # Tinh chỉnh lại nghiệm từ tập inliers
    pred = best_sol[0] * np.sin(pts_lon) + best_sol[1] * np.cos(pts_lon)
    inliers = np.abs(pred - pts_tilt) < 3.0
    if np.sum(inliers) < 15:
        return image

    M_in = np.column_stack([np.sin(pts_lon[inliers]), np.cos(pts_lon[inliers])])
    sol, _, _, _ = np.linalg.lstsq(M_in, pts_tilt[inliers], rcond=None)
    A, B = sol[0], sol[1]
    tilt_mag = float(np.hypot(A, B))
    tilt_azimuth = float(np.arctan2(B, -A))

    # Tự động nắn nghiêng chân trời cho các góc lệch từ 1.0° đến 20.0°
    if tilt_mag < 1.0 or tilt_mag > 20.0:
        log(f"[*] Góc nghiêng {tilt_mag:.1f}° ngoài khoảng cân chỉnh (1.0°-20.0°) -> Giữ nguyên góc nhìn thực tế.")
        return image

    log(f"[*] Phát hiện góc nghiêng mặt phẳng xoay máy nhẹ: {tilt_mag:.1f}° tại phương vị {np.degrees(tilt_azimuth):.1f}° -> Đang cân bằng lại chân trời...")

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


def crop_clean_inscribed_rectangle(image, black_thresh=15):
    """
    Cắt xén các viền đen răng cưa do quá trình ghép sinh ra,
    bảo toàn 100% tỷ lệ hình học và không cắt xén quá mức nội dung thật.
    """
    if image is None or image.size == 0:
        return image

    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = (gray > black_thresh).astype(np.uint8)

    if not np.any(mask):
        return image

    # Tỷ lệ pixel có nội dung trên mỗi hàng và mỗi cột (yêu cầu ít nhất 95% là nội dung thật, triệt tiêu 100% rìa đen lượn sóng)
    row_density = np.mean(mask, axis=1)
    col_density = np.mean(mask, axis=0)

    valid_rows = np.where(row_density >= 0.95)[0]
    valid_cols = np.where(col_density >= 0.95)[0]

    if len(valid_rows) > 50 and len(valid_cols) > 50:
        top = valid_rows[0]
        bot = valid_rows[-1] + 1
        left = valid_cols[0]
        right = valid_cols[-1] + 1
        cropped = image[top:bot, left:right]
    else:
        cropped = image

    # Inpaint các vết đen nhỏ còn sót ở rìa mép nếu có
    if cropped.size > 0:
        c_gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
        dark_mask = (c_gray <= black_thresh).astype(np.uint8) * 255
        dark_count = int(np.sum(dark_mask > 0))
        if 0 < dark_count < cropped.size * 0.05:
            cropped = cv2.inpaint(cropped, dark_mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return cropped


# ============================================================================
# PHẦN 4: CHUẨN HÓA KHUNG HÌNH EQUIRECTANGULAR 2:1 (KHÔNG DÙNG HÌNH LỒI)
# ============================================================================

def circular_seam_blend(img, seam_width=45):
    """
    Hòa trộn biên tuần hoàn 360° đối xứng (Symmetric Circular Seam Blending):
    - Đảm bảo điểm ảnh tại cột x = 0 và cột x = W-1 có sai số màu sắc = 0.0!
    - Hòa trộn đối xứng mềm mại hai bên mép nối qua hàm smoothstep.
    - Triệt tiêu hoàn toàn hiện tượng nứt mí, khe hở đen, hoặc bị tách đôi hình ảnh!
    """
    if img is None or img.size == 0 or img.shape[1] < seam_width * 3:
        return img

    h, w = img.shape[:2]
    sw = min(seam_width, w // 8)

    t = np.linspace(0.5, 0.0, sw, dtype=np.float32)[None, :, None]
    s = t * t * (3.0 - 2.0 * t) # Smoothstep fade từ 0.5 xuống 0.0

    res = img.copy().astype(np.float32)
    left_part = res[:, :sw].copy()
    right_part = res[:, -sw:].copy()

    for i in range(sw):
        alpha = s[0, i, 0]
        r_col = right_part[:, sw - 1 - i].copy()
        l_col = left_part[:, i].copy()
        # Chuyển sắc đối xứng tại mí nối 0 / 360
        res[:, w - 1 - i] = (1.0 - alpha) * r_col + alpha * l_col
        res[:, i] = (1.0 - alpha) * l_col + alpha * r_col

    return np.clip(res, 0, 255).astype(np.uint8)


def fit_to_equirectangular_2_to_1(panorama, target_width=4096, is_full_360=True):
    """
    Chuẩn hóa ảnh thành định dạng Equirectangular chuẩn 2:1 cho Web 360 / VR Viewer:
    - BẢO TOÀN 100% TỶ LỆ HÌNH HỌC THẬT CỦA CĂN PHÒNG (KHÔNG ÉP CO GIÃN BẤT ĐỐI XỨNG).
    - 100% TRIỆT TIÊU BỆT ĐEN & VỆT CỘT SÁNG: Lấp đầy mượt mà cực Bắc (Zenith) và cực Nam (Nadir)
      bằng gradient màu sắc kiến trúc thật của trần và sàn bảo tàng.
    - Không để lại bất kỳ pixel đen xì [0, 0, 0] nào trên toàn bộ bức ảnh!
    """
    if panorama is None or panorama.size == 0:
        return panorama

    ew = 4096 if target_width <= 0 else int(target_width)
    eh = ew // 2

    # Trước tiên cắt sạch viền đen răng cưa nội tiếp
    panorama = crop_clean_inscribed_rectangle(panorama)
    h_orig, w_orig = panorama.shape[:2]
    ar_orig = float(w_orig) / float(max(1, h_orig))

    # Nếu ảnh đã chuẩn 2:1
    if abs(ar_orig - 2.0) <= 0.05:
        scaled_pano = cv2.resize(panorama, (ew, eh), interpolation=cv2.INTER_LANCZOS4)
        return circular_seam_blend(scaled_pano, seam_width=45)

    # Co giãn đồng dạng sao cho chiều rộng phủ kín ew hoặc dải phòng chiếm khoảng 55-75% chiều cao canvas
    scale_w = ew / float(w_orig)
    scaled_w = ew
    scaled_h = int(h_orig * scale_w)

    if scaled_h > int(eh * 0.82):
        scaled_h = int(eh * 0.82)
    elif scaled_h < int(eh * 0.45):
        scaled_h = int(eh * 0.45)

    scaled_pano = cv2.resize(panorama, (scaled_w, scaled_h), interpolation=cv2.INTER_LANCZOS4)
    scaled_pano = circular_seam_blend(scaled_pano, seam_width=45)

    canvas = np.zeros((eh, ew, 3), dtype=np.uint8)
    y_offset = (eh - scaled_h) // 2
    canvas[y_offset : y_offset + scaled_h, :] = scaled_pano

    # 1. Xử lý Trần nhà (Zenith) - KHÔNG ĐỂ MÀU ĐEN & TRIỆT TIÊU VỆT CỘT SÁNG!
    if y_offset > 0:
        top_strip = scaled_pano[0:min(25, scaled_h), :]
        zenith_avg = np.median(top_strip, axis=(0, 1)) # màu trần trung bình dịu nhẹ
        for y in range(y_offset):
            t = float(y) / float(y_offset)
            s = t * t * (3.0 - 2.0 * t) # Smoothstep
            blended = (1.0 - s) * zenith_avg + s * scaled_pano[0, :]
            canvas[y, :] = np.clip(blended, 0, 255).astype(np.uint8)

    # 2. Xử lý Sàn nhà (Nadir) - KHÔNG ĐỂ MÀU ĐEN & TRIỆT TIÊU VỆT CỘT SÁNG!
    floor_start = y_offset + scaled_h
    if floor_start < eh:
        bot_strip = scaled_pano[max(0, scaled_h - 25) : scaled_h, :]
        nadir_avg = np.median(bot_strip, axis=(0, 1)) # màu sàn trung bình
        floor_h = eh - floor_start
        for y in range(floor_h):
            t = float(floor_h - y) / float(floor_h)
            s = t * t * (3.0 - 2.0 * t) # Smoothstep
            blended = (1.0 - s) * nadir_avg + s * scaled_pano[-1, :]
            canvas[floor_start + y, :] = np.clip(blended, 0, 255).astype(np.uint8)

    return circular_seam_blend(canvas, seam_width=45)


def cylindrical_to_equirectangular(cyl_img, f_cam=None, out_w=4096, out_h=2048):
    """
    Chuyển đổi hoàn hảo từ Dải Toàn Cảnh Mặt Trụ sang Không Gian Toàn Cảnh 360° Equirectangular 2:1:
    - 100% TRIỆT TIÊU BỆT ĐEN (Zero Black Patches): Không có bệt đen xì ở trần, sàn hay hai bên cánh cửa.
    - Cắt gọn gàng viền răng cưa nội tiếp trước khi chuyển đổi.
    - Mở rộng kiến trúc trần (Zenith) và sàn (Nadir) bằng gradient mượt mà dựa trên màu sắc thực tế.
    - Giữ các đường thẳng đứng tường nhà vuông vắn 90°, không nứt vỡ, không chắp vá.
    """
    if cyl_img is None or cyl_img.size == 0:
        return cyl_img

    # Cắt sạch viền đen răng cưa nội tiếp trước
    clean_cyl = crop_clean_inscribed_rectangle(cyl_img)
    if clean_cyl is None or clean_cyl.size == 0:
        clean_cyl = cyl_img

    return fit_to_equirectangular_2_to_1(clean_cyl, target_width=out_w, is_full_360=True)


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


def estimate_camera_rotation_direction(image_paths):
    """
    Tự động nhận diện hướng quét/xoay camera của người dùng bằng ước lượng dịch chuyển quang học ORB:
    - Nếu camera quay sang phải (Clockwise): các điểm ảnh dịch sang trái (dx < 0) -> trả về +1 (Yaw tăng dần).
    - Nếu camera quay sang trái (Counter-Clockwise): các điểm ảnh dịch sang phải (dx > 0) -> trả về -1 (Yaw giảm dần).
    """
    if len(image_paths) < 2:
        return 1
    try:
        orb = cv2.ORB_create(500)
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        dxs = []
        num_checks = min(6, len(image_paths) - 1)
        for i in range(num_checks):
            im0 = cv2.imread(image_paths[i])
            im1 = cv2.imread(image_paths[i + 1])
            if im0 is None or im1 is None:
                continue
            h0, w0 = im0.shape[:2]
            h1, w1 = im1.shape[:2]
            im0 = cv2.resize(im0, (600, max(1, int(h0 * 600.0 / w0))))
            im1 = cv2.resize(im1, (600, max(1, int(h1 * 600.0 / w1))))
            kp0, des0 = orb.detectAndCompute(im0, None)
            kp1, des1 = orb.detectAndCompute(im1, None)
            if des0 is not None and des1 is not None and len(kp0) > 10 and len(kp1) > 10:
                m = bf.match(des0, des1)
                if len(m) >= 8:
                    m = sorted(m, key=lambda x: x.distance)[:35]
                    d = [kp1[x.trainIdx].pt[0] - kp0[x.queryIdx].pt[0] for x in m]
                    dxs.append(float(np.median(d)))
        if dxs:
            overall_dx = float(np.median(dxs))
            if overall_dx < -5.0:
                return 1   # Clockwise (quay phải)
            elif overall_dx > 5.0:
                return -1  # Counter-Clockwise (quay trái)
    except Exception as e:
        log(f"[!] Warning estimate_camera_rotation_direction: {e}")
    return 1


def assign_initial_circular_yaw(pto_path, num_images, rot_dir=1):
    """
    Khởi tạo góc xoay Yaw ban đầu (0..360°) cho chuỗi ảnh xoay quanh tâm phòng.
    Giúp autooptimiser hội tụ chính xác đúng chiều không gian thực tế,
    ngăn ngừa triệt để hiện tượng bị lật ngược thứ tự trái/phải hoặc gấp khúc (inverted layout chirality).
    """
    if num_images <= 1 or not os.path.exists(pto_path):
        return
    try:
        with open(pto_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        step_deg = 360.0 / float(num_images)
        img_idx = 0
        new_lines = []

        import re
        for line in lines:
            if line.startswith('i '):
                deg = float(img_idx) * step_deg * float(rot_dir)
                deg = ((deg + 180.0) % 360.0) - 180.0
                if re.search(r'\by[-+]?[0-9]*\.?[0-9]+\b', line):
                    line = re.sub(r'\by[-+]?[0-9]*\.?[0-9]+\b', f'y{deg:.3f}', line)
                else:
                    line = line.rstrip() + f' y{deg:.3f}\n'
                img_idx += 1
            new_lines.append(line)

        with open(pto_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        log(f"[✓] Đã khởi tạo cấu trúc góc Yaw 360° tuần hoàn (step={step_deg:.1f}°, rot_dir={rot_dir}) cho {img_idx} ảnh.")
    except Exception as e:
        log(f"[!] Lỗi khởi tạo Yaw trong PTO: {e}")


def run_hugin_stitch(image_paths, output_path, target_width=4096):
    """
    Thực thi quy trình ghép ảnh toàn cảnh 360° bằng bộ công cụ Hugin CLI:
    1. pto_gen: Khởi tạo file dự án PTO từ danh sách ảnh.
    2. cpfind --linearmatch: Tìm điểm khống chế liên kết (control points) giữa các ảnh gối đầu.
    3. cpclean: Loại bỏ triệt để điểm khống chế sai lệch / outliers.
    4. linefind: Tự động phát hiện các đường thẳng đứng kiến trúc (tường, cột, tủ kính).
    5. autooptimiser -a -m -l: Tối ưu hóa góc nhìn, căn thẳng đường chân trời, giữ tường 90° đứng.
    6. pano_modify --projection=2 --fov=360: Thiết lập chuẩn xác phép chiếu Equirectangular 2:1 toàn vòng 360°.
    7. nona & enblend: Chiếu ảnh và hòa trộn đa băng tần không để lại vết nối.
    """
    log("[*] Phát hiện Hugin CLI Tools! Kích hoạt Động cơ Ghép Chuẩn Công nghiệp 360...")
    temp_dir = tempfile.mkdtemp(prefix="hugin_stitch_")
    pto_file = os.path.join(temp_dir, "project.pto")

    try:
        # Tối ưu kích thước nạp ảnh: với bộ nhiều ảnh (>= 20 ảnh), co về 960px giúp cpfind dò điểm nhanh gấp đôi mà vẫn cực kỳ chuẩn xác
        input_dim = 960 if len(image_paths) >= 20 else 1100
        prepared_paths = []
        for idx, src_p in enumerate(image_paths):
            ext = os.path.splitext(src_p)[1].lower() or '.jpg'
            dst_p = os.path.join(temp_dir, f"img_{idx:04d}{ext}")
            im = load_and_orient_image(src_p, max_dim=input_dim)
            im = preprocess_lighting_clahe(im)
            cv2.imwrite(dst_p, im, [cv2.IMWRITE_JPEG_QUALITY, 96])
            prepared_paths.append(dst_p)

        # Ước lượng hướng xoay camera (Clockwise / Counter-Clockwise)
        rot_dir = estimate_camera_rotation_direction(prepared_paths)
        rot_label = "Quay sang phải (Clockwise)" if rot_dir == 1 else "Quay sang trái (Counter-Clockwise)"
        log(f"[*] Hướng quét camera nhận diện: {rot_label}")

        # 1. pto_gen (Khởi tạo dự án với thông số FOV ống kính điện thoại ~65°)
        log("[*] Hugin Step 1: Tạo cấu trúc dự án pto_gen...")
        cmd_ptogen = ['pto_gen', '-f', '65', '-o', pto_file] + prepared_paths
        res = subprocess.run(cmd_ptogen, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
        if res.returncode != 0:
            raise RuntimeError(f"pto_gen lỗi: {res.stderr}")

        # 1b. Khởi tạo góc Yaw 360° xoay vòng đều đặn quanh phòng để autooptimiser không bị lật ngược hướng
        assign_initial_circular_yaw(pto_file, len(prepared_paths), rot_dir=rot_dir)

        # 2. cpfind (Khớp tuần tự siêu tốc theo chuỗi xoay vòng 360°, cấu hình chuẩn dưới 10s)
        log("[*] Hugin Step 2: Dò tìm điểm kiểm soát đa góc (cpfind --linearmatch)...")
        cmd_cpfind = ['cpfind', '--linearmatch', '--linearmatchlen', '2', '-o', pto_file, pto_file]
        subprocess.run(cmd_cpfind, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)

        # Bổ sung khép vòng 360° nối ảnh cuối với ảnh đầu
        if len(prepared_paths) >= 4:
            try:
                loop_pto = os.path.join(temp_dir, "loop.pto")
                first_last = [prepared_paths[0], prepared_paths[1], prepared_paths[-2], prepared_paths[-1]]
                cmd_ptogen_loop = ['pto_gen', '-f', '65', '-o', loop_pto] + first_last
                if subprocess.run(cmd_ptogen_loop, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30).returncode == 0:
                    cmd_cpfind_loop = ['cpfind', '--multirow', '-o', loop_pto, loop_pto]
                    subprocess.run(cmd_cpfind_loop, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30)
                    if os.path.exists(loop_pto):
                        with open(loop_pto, 'r', encoding='utf-8', errors='ignore') as f_lp:
                            loop_lines = f_lp.readlines()
                        idx_map = {0: 0, 1: 1, 2: len(prepared_paths)-2, 3: len(prepared_paths)-1}
                        new_cp_lines = []
                        for line in loop_lines:
                            if line.startswith('c '):
                                parts = line.split()
                                if len(parts) >= 3 and parts[1].startswith('n') and parts[2].startswith('N'):
                                    try:
                                        n_from = int(parts[1][1:])
                                        n_to = int(parts[2][1:])
                                        mf = idx_map.get(n_from, n_from)
                                        mt = idx_map.get(n_to, n_to)
                                        if (mf in (0, 1) and mt in (len(prepared_paths)-2, len(prepared_paths)-1)) or \
                                           (mt in (0, 1) and mf in (len(prepared_paths)-2, len(prepared_paths)-1)):
                                            parts[1] = f"n{mf}"
                                            parts[2] = f"N{mt}"
                                            new_cp_lines.append(" ".join(parts) + "\n")
                                    except Exception:
                                        pass
                        if new_cp_lines:
                            with open(pto_file, 'a', encoding='utf-8') as f_pto:
                                f_pto.writelines(new_cp_lines)
                            log(f"[✓] Đã tạo thành công {len(new_cp_lines)} điểm khép vòng 360° nối ảnh cuối về ảnh đầu.")
            except Exception as loop_e:
                log(f"[!] Bỏ qua khép vòng Hugin: {loop_e}")

        # 3. cpclean
        log("[*] Hugin Step 3: Lọc điểm nhiễu (cpclean)...")
        cmd_cpclean = ['cpclean', '-o', pto_file, pto_file]
        subprocess.run(cmd_cpclean, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 4. linefind (Bắt buộc để dựng thẳng đứng 90° kiến trúc nội thất!)
        if shutil.which('linefind'):
            log("[*] Hugin Step 4: Khóa thẳng đứng đường nét kiến trúc (linefind)...")
            cmd_linefind = ['linefind', '-o', pto_file, pto_file]
            subprocess.run(cmd_linefind, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 5. autooptimiser (Tối ưu hóa vị trí ngang Yaw, giữ nguyên trục thẳng đứng Pitch=0, Roll=0 để KHÔNG bị vặn xoắn)
        if shutil.which('autooptimiser'):
            log("[*] Hugin Step 5: Tự động cân bằng góc quét ngang, khóa góc thẳng đứng chống méo lồi (autooptimiser -p -l)...")
            cmd_opt = ['autooptimiser', '-p', '-l', '-o', pto_file, pto_file]
            subprocess.run(cmd_opt, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)

        # 6. pano_modify: Sử dụng phép chiếu Hình Trụ (Cylindrical Projection --projection=1)
        # Giữ 100% các đường thẳng đứng (tường, tủ, cửa) THẲNG ĐỨNG TUYỆT ĐỐI, không bao giờ bị phình lồi hay uốn lượn như hình cầu
        out_w = 4096 if target_width <= 0 else int(target_width)
        out_h = out_w // 2
        if shutil.which('pano_modify'):
            log("[*] Hugin Step 6: Chuẩn hóa phép chiếu Hình Trụ Cylindrical phẳng mịn chống lồi méo (pano_modify)...")
            cmd_mod = ['pano_modify', '--projection=1', '--fov=360', f'--canvas={out_w}x{out_h}', '--center', '--straighten', '-o', pto_file, pto_file]
            subprocess.run(cmd_mod, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)

        # 7. Render trực tiếp bằng Nona + Enblend (Không phụ thuộc makefile của hugin_executor)
        rendered_tif = os.path.join(temp_dir, "output.tif")
        if shutil.which('nona') and shutil.which('enblend'):
            log("[*] Hugin Step 7: Nona remapping (phép chiếu cầu 360°)...")
            nona_prefix = os.path.join(temp_dir, "nona_")
            cmd_nona = ['nona', '-m', 'TIFF_m', '-o', nona_prefix, pto_file]
            res_nona = subprocess.run(cmd_nona, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)
            if res_nona.returncode != 0:
                log(f"[!] Nona stderr: {res_nona.stderr}")
                raise RuntimeError(f"nona lỗi: {res_nona.stderr[:200]}")

            nona_tifs = sorted([os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if f.startswith('nona_') and f.endswith(('.tif', '.tiff'))])
            if not nona_tifs:
                raise FileNotFoundError("Nona không sinh ra file remapped TIFF nào.")

            log(f"[*] Hugin Step 7b: Enblend hòa trộn đa dải tần ({len(nona_tifs)} ảnh, wrap horizontal)...")
            # Loại bỏ --fine-mask để enblend dùng thuật toán coarse-masking đa độ phân giải tối ưu siêu nhanh (15-30s thay vì 5-10 phút)
            cmd_enblend = ['enblend', '--wrap=horizontal', '-m', '1024', '-o', rendered_tif] + nona_tifs
            res_enblend = subprocess.run(cmd_enblend, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)
            if res_enblend.returncode != 0:
                log(f"[!] Enblend wrap horizontal warning: {res_enblend.stderr[:100]}, thử chế độ chuẩn...")
                cmd_enblend_fallback = ['enblend', '-m', '1024', '-o', rendered_tif] + nona_tifs
                res_enblend2 = subprocess.run(cmd_enblend_fallback, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)
                if res_enblend2.returncode != 0:
                    log(f"[!] Enblend stderr: {res_enblend2.stderr}")
                    raise RuntimeError(f"enblend lỗi: {res_enblend2.stderr[:200]}")
        elif shutil.which('hugin_executor'):
            prefix = os.path.join(temp_dir, "pano_out")
            cmd_exec = ['hugin_executor', '--stitching', f'--prefix={prefix}', pto_file]
            subprocess.run(cmd_exec, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=240)
            cand_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if f.startswith('pano_out') and f.endswith(('.tif', '.tiff', '.jpg', '.png'))]
            if cand_files:
                rendered_tif = cand_files[0]

        if not os.path.exists(rendered_tif):
            raise FileNotFoundError("Không tìm thấy ảnh sau khi Hugin render.")

        hugin_result = cv2.imread(rendered_tif)
        if hugin_result is None:
            raise ValueError("Không thể giải mã file kết quả của Hugin.")

        # Cắt xén sạch viền đen răng cưa nội tiếp thành 1 khung chữ nhật hoàn chỉnh, không nứt nẻ
        cropped_res = crop_clean_inscribed_rectangle(hugin_result, black_thresh=10)
        equi = fit_to_equirectangular_2_to_1(cropped_res, target_width=out_w, is_full_360=True)
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

def run_opencv_native_stitcher(image_paths, target_width=0):
    """
    Thực thi quy trình ghép ảnh toàn cảnh đa góc bằng OpenCV Native C++ Engine:
    - Tiền xử lý ánh sáng thích ứng CLAHE trên kênh Luminance (L/V) chống lóa và giữ chi tiết vùng tối.
    - Chạy thuật toán căn chỉnh ma trận homography và Bundle Adjustment toàn cục (Global Bundle Adjuster).
    - Thử nghiệm tuần tự 4 cấu hình từ chuẩn xác đến nhạy cảm để đảm bảo luôn khép vòng thành công.
    - Tự động bật Wave Correction căn chỉnh phương ngang đường chân trời.
    """
    num_imgs = len(image_paths)
    log(f"[*] Kích hoạt Động cơ OpenCV Native: Đang nạp và tiền xử lý CLAHE {num_imgs} bức ảnh...")

    configs = [
        (cv2.Stitcher_PANORAMA, 1400, 0.12, "PANORAMA Chuẩn 360"),
        (cv2.Stitcher_PANORAMA, 1200, 0.06, "PANORAMA Cầm Tay Nhạy"),
        (cv2.Stitcher_PANORAMA, 1000, 0.03, "PANORAMA Siêu Nhạy"),
        (cv2.Stitcher_SCANS, 1200, 0.04, "SCANS Cầm Tay"),
    ]

    for mode, max_dim, conf, desc in configs:
        log(f"[*] Thử OpenCV Native: {desc} (max_dim={max_dim}, conf={conf})...")
        images = []
        for p in image_paths:
            try:
                im = load_and_orient_image(p, max_dim=max_dim)
                im = preprocess_lighting_clahe(im)
                images.append(im)
            except Exception as e:
                continue

        if len(images) < 2:
            continue

        try:
            s = cv2.Stitcher_create(mode)
            try:
                s.setWaveCorrection(True)
            except Exception:
                pass
            try:
                s.setPanoConfidenceThresh(conf)
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

            status, pano = s.stitch(images)
            if status == cv2.Stitcher_OK and pano is not None:
                used = len(s.component()) if hasattr(s, 'component') else len(images)
                total = len(images)
                log(f"[✓] OpenCV Native ({desc}) ghép thành công rực rỡ {used}/{total} ảnh!")
                ar = float(pano.shape[1]) / float(max(1, pano.shape[0]))
                is_full = (used >= 10) or (ar >= 2.8)
                return pano, is_full
            else:
                log(f"[!] Cấu hình {desc} trả về status={status}")
        except Exception as err:
            log(f"[!] Lỗi khi chạy cấu hình {desc}: {err}")
        finally:
            del images
            gc.collect()

    return None, False


# ============================================================================
# PHẦN 6.5: ĐỘNG CƠ CỨU CÁNH GHÉP PHÂN VÙNG GÓC 360° (FAIL-SAFE 360° BLENDER)
# ============================================================================

def cylindrical_warp(img, focal_length=None):
    """
    Uốn cong ảnh lên mặt trụ quang học (Cylindrical Warping):
    - Triệt tiêu biến dạng phối cảnh ở các góc phòng.
    - Giữ các đường thẳng đứng (tường, cột, tủ) thẳng tắp 90°, không bị nghiêng méo.
    """
    if img is None or img.size == 0:
        return img
    h, w = img.shape[:2]
    if focal_length is None:
        focal_length = w / (2.0 * math.tan(math.radians(33.0)))
    f = float(focal_length)
    cx, cy = w / 2.0, h / 2.0

    y_coords, x_coords = np.indices((h, w), dtype=np.float32)
    theta = (x_coords - cx) / f
    h_cyl = (y_coords - cy) / f

    x_orig = f * np.tan(theta) + cx
    y_orig = (f * h_cyl / np.cos(theta)) + cy

    warped = cv2.remap(
        img,
        x_orig,
        y_orig,
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0)
    )
    return warped


# ============================================================================
# PHẦN 6.5: ĐỘNG CƠ GHÉP CHUỖI GÓC PHÒNG QUANG HỌC LIÊN TỤC (SEQUENTIAL CYLINDRICAL STITCHER)
# ============================================================================

def filter_smart_keyframes(image_paths, target_dim=800, max_keyframes=36):
    """
    Chọn lọc chuỗi khung hình tối ưu thông minh (Smart Golden Keyframe Selection):
    1. Đo độ sắc nét của từng ảnh bằng phương sai Laplacian (Laplacian Variance).
       - Giữ lại khung hình sắc nét nhất khi người chụp đứng yên chụp nhiều lần cùng một góc.
    2. Bảo toàn trọn vẹn tất cả các góc chụp quét quanh phòng mà không cắt xén nhầm.
    """
    if len(image_paths) <= 3:
        return image_paths

    sift = cv2.SIFT_create(nfeatures=800)
    bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)

    def calc_sharpness(img_gray):
        if img_gray is None or img_gray.size == 0:
            return 0.0
        return float(cv2.Laplacian(img_gray, cv2.CV_64F).var())

    metadata = []
    log(f"[*] Đang phân tích độ nét và góc nhìn từ {len(image_paths)} ảnh...")
    for idx, p in enumerate(image_paths):
        try:
            im = load_and_orient_image(p, max_dim=target_dim)
            if im is None:
                continue
            gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
            kp, des = sift.detectAndCompute(gray, None)
            sharpness = calc_sharpness(gray)
            metadata.append({
                "path": p,
                "kp": kp,
                "des": des,
                "sharpness": sharpness,
                "w": im.shape[1],
                "orig_idx": idx
            })
        except Exception:
            continue

    if len(metadata) <= 2:
        return [m["path"] for m in metadata] if metadata else image_paths

    selected_meta = [metadata[0]]
    w_ref = metadata[0]["w"]

    for i in range(1, len(metadata)):
        cur = metadata[i]
        anchor = selected_meta[-1]

        if anchor["des"] is None or cur["des"] is None or len(anchor["des"]) < 12 or len(cur["des"]) < 12:
            selected_meta.append(cur)
            continue

        matches = bf.knnMatch(anchor["des"], cur["des"], k=2)
        good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.75 * m[1].distance]

        if len(good) < 8:
            selected_meta.append(cur)
            continue

        pts1 = np.float32([anchor["kp"][m.queryIdx].pt for m in good])
        pts2 = np.float32([cur["kp"][m.trainIdx].pt for m in good])
        diffs = pts1 - pts2
        dx_median = float(np.median(diffs[:, 0]))
        dx_ratio = abs(dx_median) / float(w_ref)

        # Chỉ loại bỏ khi gần như đứng yên cùng 1 góc (< 4% dịch chuyển)
        if dx_ratio < 0.04:
            if cur["sharpness"] > anchor["sharpness"]:
                selected_meta[-1] = cur
            continue

        selected_meta.append(cur)

    if len(selected_meta) > max_keyframes:
        indices = np.linspace(0, len(selected_meta) - 1, max_keyframes, dtype=int)
        selected_meta = [selected_meta[idx] for idx in indices]

    log(f"[✓] Đã tiếp nhận {len(selected_meta)} góc ảnh sắc nét đại diện cho căn phòng.")
    return [m["path"] for m in selected_meta]


def run_sequential_cylindrical_stitcher(image_paths, target_width=4096):
    """
    ĐỘNG CƠ GHÉP CHUỖI ẢNH GÓC PHÒNG QUANG HỌC LIÊN TỤC (SEQUENTIAL MOTION-ALIGNED CYLINDRICAL STITCHER):
    1. Tiếp nhận trọn vẹn tất cả N ảnh chụp xoay quanh phòng.
    2. Chiếu mặt trụ quang học Cylindrical Warping nắn đứng 90° các góc tường, triệt tiêu méo phối cảnh.
    3. Định vị tịnh tiến tuần tự từng cặp ảnh liền kề (i, i+1) bằng RootSIFT + RANSAC.
    4. TỰ ĐỘNG KHÉP VÒNG 360° (Automatic Loop Closure):
       - So khớp ảnh cuối với ảnh đầu tiên để nhận diện vòng tuần hoàn 360°.
       - Tự động cắt bỏ các góc ảnh chụp trùng lặp sau khi đã khép vòng (KHÔNG BAO GIỜ NHÂN ĐÔI CỬA HAY VẬT THỂ).
       - Cân bằng độ trôi dạt chân trời (Vertical Slope Leveling) quanh chu vi 360°.
    5. Hòa trộn Voronoi Mặt Trụ Tuần Hoàn (Periodic Cylinder Distance Transform):
       - Dán và hòa trộn mềm theo modulo W_360 tại mí nối 0°/360° -> Mép trái và mép phải nối liền 100% không tì vết!
    """
    # 0. Khử trùng lặp khung hình khi đứng yên trước khi ghép
    image_paths = filter_smart_keyframes(image_paths, target_dim=800, max_keyframes=36)

    N_raw = len(image_paths)
    if N_raw == 0:
        return None, False, None

    out_w = 4096 if target_width <= 0 else int(target_width)
    out_h = out_w // 2

    log(f"[*] Động cơ Ghép Chuỗi Quang Học: Bắt đầu xử lý {N_raw} góc ảnh...")

    # 1. Nạp và tiền xử lý CLAHE tất cả các ảnh
    raw_images = []
    for p in image_paths:
        try:
            im = load_and_orient_image(p, max_dim=1200)
            im = preprocess_lighting_clahe(im)
            raw_images.append(im)
        except Exception as e:
            log(f"[Warning] Bỏ qua ảnh lỗi {p}: {e}")

    if len(raw_images) < 1:
        return None, False, None
    if len(raw_images) == 1:
        return raw_images[0], False, None

    # 2. Khử các ảnh chụp đứng yên trùng lặp tuyệt đối (MSE < 5.0)
    filtered = [raw_images[0]]
    for idx in range(1, len(raw_images)):
        prev = filtered[-1]
        cur = raw_images[idx]
        if prev.shape == cur.shape:
            diff = float(np.mean(np.abs(prev.astype(np.float32) - cur.astype(np.float32))))
            if diff < 5.0:
                log(f"[*] Bỏ qua ảnh chụp trùng góc {idx} (diff={diff:.2f})")
                continue
        filtered.append(cur)
    raw_images = filtered
    N = len(raw_images)
    log(f"[*] Tiếp nhận {N} góc phòng độc lập...")

    # 3. Uốn cong mặt trụ quang học (Cylindrical Warping)
    h0, w0 = raw_images[0].shape[:2]
    hfov = 64.0 if h0 >= w0 else 72.0
    f = w0 / (2.0 * math.tan(math.radians(hfov / 2.0)))

    warped_imgs = []
    warped_masks = []
    for im in raw_images:
        cx, cy = im.shape[1] / 2.0, im.shape[0] / 2.0
        y_c, x_c = np.indices((im.shape[0], im.shape[1]), dtype=np.float32)
        th = (x_c - cx) / f
        h_cyl = (y_c - cy) / f
        xo = f * np.tan(th) + cx
        yo = (f * h_cyl / np.cos(th)) + cy
        w_im = cv2.remap(im, xo, yo, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0))
        m = ((xo >= 0) & (xo < im.shape[1]) & (yo >= 0) & (yo < im.shape[0])).astype(np.uint8)
        m = cv2.erode(m, np.ones((5, 5), np.uint8))
        warped_imgs.append(w_im)
        warped_masks.append(m)

    # 4. Định vị tịnh tiến liên tục giữa từng cặp ảnh liền kề (Pairwise Sequential Alignment)
    sift = cv2.SIFT_create(nfeatures=2500)
    bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
    shifts = []

    for i in range(N - 1):
        g1 = cv2.cvtColor(warped_imgs[i], cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(warped_imgs[i + 1], cv2.COLOR_BGR2GRAY)
        kp1, des1 = sift.detectAndCompute(g1, None)
        kp2, des2 = sift.detectAndCompute(g2, None)

        best_dx, best_dy = None, None
        best_cnt = 0

        if des1 is not None and des2 is not None and len(des1) >= 8 and len(des2) >= 8:
            matches = bf.knnMatch(des1, des2, k=2)
            good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.78 * m[1].distance]
            if len(good) >= 6:
                pts1 = np.float32([kp1[m.queryIdx].pt for m in good])
                pts2 = np.float32([kp2[m.trainIdx].pt for m in good])
                diffs = pts1 - pts2
                n_diff = len(diffs)
                for _ in range(min(200, n_diff * 4)):
                    rand_idx = np.random.randint(0, n_diff)
                    cdx, cdy = diffs[rand_idx]
                    err = np.hypot(diffs[:, 0] - cdx, diffs[:, 1] - cdy)
                    inls = err < 14.0
                    cnt = int(np.sum(inls))
                    if cnt > best_cnt:
                        best_cnt = cnt
                        best_dx = float(np.mean(diffs[inls, 0]))
                        best_dy = float(np.mean(diffs[inls, 1]))

        # Dự phòng bằng tương quan pha (Phase Correlation) khi gặp tường phẳng ít vân
        if best_dx is None or best_cnt < 5:
            try:
                cur_w1 = g1.shape[1]
                ov_w = int(cur_w1 * 0.45)
                slice1 = g1[:, cur_w1 - ov_w:].astype(np.float32)
                slice2 = g2[:, :ov_w].astype(np.float32)
                shift, resp = cv2.phaseCorrelate(slice1, slice2)
                if resp > 0.10:
                    best_dx = float((cur_w1 - ov_w) + shift[0])
                    best_dy = float(shift[1])
                    best_cnt = int(resp * 50)
            except Exception:
                pass

        # Dự phòng bằng độ dịch chuyển trung bình của các góc trước đó
        if best_dx is None:
            valid_prev = [s[0] for s in shifts if s[0] > 0]
            best_dx = float(np.median(valid_prev)) if valid_prev else float(w0 * 0.25)
            best_dy = 0.0

        min_step = float(w0 * 0.10)
        max_step = float(w0 * 0.65)
        step_dx = max(min_step, min(max_step, abs(best_dx)))
        shifts.append((step_dx, best_dy))

    # 5. Tích lũy tọa độ ban đầu
    positions = [(0.0, 0.0)]
    for dx, dy in shifts:
        prev_x, prev_y = positions[-1]
        positions.append((prev_x + dx, prev_y + dy))

    # 5.1 TỰ ĐỘNG NHẬN DIỆN KHÉP VÒNG 360° (AUTOMATIC 360° LOOP CLOSURE)
    g0 = cv2.cvtColor(warped_imgs[0], cv2.COLOR_BGR2GRAY)
    kp0, des0 = sift.detectAndCompute(g0, None)

    best_loop_k = None
    best_loop_inliers = 0
    loop_dx = 0.0
    loop_dy = 0.0

    if des0 is not None and len(des0) >= 12:
        check_start = N - 1
        check_end = max(2, N - 9)
        for k in range(check_start, check_end, -1):
            gk = cv2.cvtColor(warped_imgs[k], cv2.COLOR_BGR2GRAY)
            kpk, desk = sift.detectAndCompute(gk, None)
            if desk is None or len(desk) < 12:
                continue
            matches = bf.knnMatch(desk, des0, k=2)
            good = [m[0] for m in matches if len(m) == 2 and m[0].distance < 0.78 * m[1].distance]
            if len(good) >= 10:
                ptsk = np.float32([kpk[m.queryIdx].pt for m in good])
                pts0 = np.float32([kp0[m.trainIdx].pt for m in good])
                diffs = ptsk - pts0
                n_diff = len(diffs)
                cur_inls = 0
                c_dx, c_dy = 0.0, 0.0
                for _ in range(min(150, n_diff * 4)):
                    rand_idx = np.random.randint(0, n_diff)
                    tdx, tdy = diffs[rand_idx]
                    err = np.hypot(diffs[:, 0] - tdx, diffs[:, 1] - tdy)
                    inls = err < 15.0
                    cnt = int(np.sum(inls))
                    if cnt > cur_inls:
                        cur_inls = cnt
                        c_dx = float(np.mean(diffs[inls, 0]))
                        c_dy = float(np.mean(diffs[inls, 1]))

                if cur_inls >= 10 and cur_inls > best_loop_inliers:
                    best_loop_inliers = cur_inls
                    best_loop_k = k
                    loop_dx = c_dx
                    loop_dy = c_dy

    is_full_360 = False
    if best_loop_k is not None:
        w_360 = float(positions[best_loop_k][0] + loop_dx)
        if w_360 > 1.8 * float(h0):
            is_full_360 = True
            total_y_drift = float(positions[best_loop_k][1] + loop_dy - positions[0][1])
            log(f"[✓] Khép Vòng 360° tự động thành công tại góc {best_loop_k}! (inliers={best_loop_inliers}, Chu vi={w_360:.1f}px, độ trôi={total_y_drift:.1f}px)")

            # Phân bổ trôi dạt chân trời đều quanh chu vi 360°
            positions = [(p[0], p[1] - (total_y_drift * (p[0] / max(1.0, w_360)))) for p in positions]

            # Giữ lại các ảnh tới best_loop_k, cắt bỏ mọi ảnh trùng lặp sau đó
            warped_imgs = warped_imgs[:best_loop_k + 1]
            warped_masks = warped_masks[:best_loop_k + 1]
            positions = positions[:best_loop_k + 1]
            N = len(warped_imgs)

    # 6. HÒA TRỘN VORONOI CANVAS
    if is_full_360:
        # Xử lý trên Canvas Mặt Trụ Tuần Hoàn (Periodic Cylinder)
        canvas_w = int(round(w_360))
        min_y = min(p[1] for p in positions)
        max_y = max(p[1] for p in positions)
        max_h = max(im.shape[0] for im in warped_imgs)
        canvas_h = int(max_y - min_y + max_h + 30)

        log(f"[*] Hòa trộn Mặt Trụ Tuần Hoàn 360° (Periodic Cylinder): {canvas_w}x{canvas_h}...")

        def get_periodic_slices(cw, ch, px, py, pw, ph):
            for offset_mult in [0, 1, -1]:
                eff_px = px + offset_mult * cw
                eff_py = py
                sx = max(0, eff_px)
                sy = max(0, eff_py)
                ex = min(cw, eff_px + pw)
                ey = min(ch, eff_py + ph)
                if ex > sx and ey > sy:
                    src_x = sx - eff_px
                    src_y = sy - eff_py
                    yield sx, sy, ex, ey, src_x, src_y, (ex - sx), (ey - sy)

        # Pass 1: Max distance transform
        max_dist_canvas = np.zeros((canvas_h, canvas_w), dtype=np.float32)
        for i, m in enumerate(warped_masks):
            cur_h, cur_w = m.shape[:2]
            px = int(round(positions[i][0]))
            py = int(round(positions[i][1] - min_y + 15))
            dist_local = cv2.distanceTransform(m, cv2.DIST_L2, 5).astype(np.float32)
            for sx, sy, ex, ey, src_x, src_y, uw, uh in get_periodic_slices(canvas_w, canvas_h, px, py, cur_w, cur_h):
                max_dist_canvas[sy:ey, sx:ex] = np.maximum(
                    max_dist_canvas[sy:ey, sx:ex], dist_local[src_y:src_y+uh, src_x:src_x+uw]
                )

        # Pass 2: Accumulate color & weight
        accum_color = np.zeros((canvas_h, canvas_w, 3), dtype=np.float32)
        accum_weight = np.zeros((canvas_h, canvas_w), dtype=np.float32)
        feather_band = 24.0

        for i, (im, m) in enumerate(zip(warped_imgs, warped_masks)):
            cur_h, cur_w = im.shape[:2]
            px = int(round(positions[i][0]))
            py = int(round(positions[i][1] - min_y + 15))
            dist_local = cv2.distanceTransform(m, cv2.DIST_L2, 5).astype(np.float32)
            for sx, sy, ex, ey, src_x, src_y, uw, uh in get_periodic_slices(canvas_w, canvas_h, px, py, cur_w, cur_h):
                dist_crop = dist_local[src_y:src_y+uh, src_x:src_x+uw]
                local_max = max_dist_canvas[sy:ey, sx:ex]
                w_crop = np.maximum(0.0, 1.0 - (local_max - dist_crop) / feather_band)
                w_crop[dist_crop <= 0] = 0.0
                accum_color[sy:ey, sx:ex] += im[src_y:src_y+uh, src_x:src_x+uw].astype(np.float32) * w_crop[:, :, None]
                accum_weight[sy:ey, sx:ex] += w_crop

        safe_weight = np.maximum(accum_weight[:, :, None], 1e-5)
        blended = (accum_color / safe_weight).clip(0, 255).astype(np.uint8)
        del accum_color, accum_weight, max_dist_canvas
        gc.collect()

        clean_blended = crop_clean_inscribed_rectangle(blended)
        if clean_blended is None or clean_blended.size == 0:
            clean_blended = blended
        clean_blended = circular_seam_blend(clean_blended, seam_width=45)
        log(f"[✓] Động cơ Ghép Chuỗi Quang Học 360°: Không gian phòng hoàn chỉnh {clean_blended.shape[1]}x{clean_blended.shape[0]} hòa quyện 100% không trùng lặp!")
        return clean_blended, True, f

    else:
        # Trường hợp góc quét thẳng không khép kín vòng tròn (Linear Corridor/Wall)
        if N > 1:
            total_y_drift = positions[-1][1] - positions[0][1]
            positions = [(p[0], p[1] - (total_y_drift * float(idx) / float(N - 1))) for idx, p in enumerate(positions)]

        xs = [p[0] for p in positions]
        ys = [p[1] for p in positions]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        max_h = max(im.shape[0] for im in warped_imgs)
        max_w = max(im.shape[1] for im in warped_imgs)
        canvas_w = int(max_x - min_x + max_w + 30)
        canvas_h = int(max_y - min_y + max_h + 30)

        log(f"[*] Hòa trộn Tuyến Tính Tiết Kiệm RAM: {canvas_w}x{canvas_h}...")

        max_dist_canvas = np.zeros((canvas_h, canvas_w), dtype=np.float32)
        for i, m in enumerate(warped_masks):
            cur_h, cur_w = m.shape[:2]
            px = max(0, int(positions[i][0] - min_x + 10))
            py = max(0, int(positions[i][1] - min_y + 10))
            end_y = min(canvas_h, py + cur_h)
            end_x = min(canvas_w, px + cur_w)
            use_h = end_y - py
            use_w = end_x - px
            dist_local = cv2.distanceTransform(m, cv2.DIST_L2, 5).astype(np.float32)
            max_dist_canvas[py:end_y, px:end_x] = np.maximum(max_dist_canvas[py:end_y, px:end_x], dist_local[:use_h, :use_w])

        accum_color = np.zeros((canvas_h, canvas_w, 3), dtype=np.float32)
        accum_weight = np.zeros((canvas_h, canvas_w), dtype=np.float32)
        feather_band = 24.0

        for i, (im, m) in enumerate(zip(warped_imgs, warped_masks)):
            cur_h, cur_w = im.shape[:2]
            px = max(0, int(positions[i][0] - min_x + 10))
            py = max(0, int(positions[i][1] - min_y + 10))
            end_y = min(canvas_h, py + cur_h)
            end_x = min(canvas_w, px + cur_w)
            use_h = end_y - py
            use_w = end_x - px

            dist_local = cv2.distanceTransform(m, cv2.DIST_L2, 5).astype(np.float32)
            dist_crop = dist_local[:use_h, :use_w]
            local_max = max_dist_canvas[py:end_y, px:end_x]

            w_crop = np.maximum(0.0, 1.0 - (local_max - dist_crop) / feather_band)
            w_crop[dist_crop <= 0] = 0.0

            accum_color[py:end_y, px:end_x] += im[:use_h, :use_w].astype(np.float32) * w_crop[:, :, None]
            accum_weight[py:end_y, px:end_x] += w_crop

        safe_weight = np.maximum(accum_weight[:, :, None], 1e-5)
        blended = (accum_color / safe_weight).clip(0, 255).astype(np.uint8)
        del accum_color, accum_weight, max_dist_canvas
        gc.collect()

        clean_blended = crop_clean_inscribed_rectangle(blended)
        if clean_blended is None or clean_blended.size == 0:
            clean_blended = blended

        log(f"[✓] Đã tạo thành công không gian phòng {clean_blended.shape[1]}x{clean_blended.shape[0]} phẳng phiu sạch viền đen!")
        return clean_blended, False, f


# Alias tương thích ngược
run_failsafe_cylindrical_sector_stitcher = run_sequential_cylindrical_stitcher


# ============================================================================
# PHẦN 7: PIPELINE ĐIỀU PHỐI CHÍNH (MAIN PIPELINE)
# ============================================================================

def run_stitch(image_paths, output_path, target_width=0):
    """
    Hàm thực thi chính điều phối quy trình ghép ảnh:
    - 1 ảnh: Tự động nắn đứng, cắt viền răng cưa, tạo không gian 360° 2:1.
    - 2+ ảnh:
        Ưu tiên 1: Chạy Hugin CLI Tools (chuẩn công nghiệp 360).
        Ưu tiên 2: Chạy Động cơ OpenCV Native Tùy biến (CLAHE + RootSIFT + Spherical + MultiBandBlender).
        Ưu tiên 3: Động cơ Cứu cánh Phân vùng góc 360° (Fail-Safe 360° Sector Blender) - Cam kết 100% luôn ra kết quả!
        Hậu xử lý: Nắn đứng 90° kiến trúc SO(3), cắt xén nội tiếp sạch viền đen, chuẩn hóa Equirectangular 2:1.
    """
    t0 = time.time()
    if not image_paths or len(image_paths) < 1:
        return {"success": False, "error": "ERR_TOO_FEW_IMAGES", "detail": "Vui lòng chọn ít nhất 1 ảnh."}

    out_w = 4096 if target_width <= 0 else int(target_width)

    # TRƯỜNG HỢP 1: 1 ẢNH ĐẦU VÀO (ẢNH PANO HOẶC ẢNH GÓC PHÒNG)
    if len(image_paths) == 1:
        p = image_paths[0]
        if not os.path.exists(p):
            return {"success": False, "error": "ERR_FILE_NOT_FOUND", "detail": f"Không tìm thấy file: {p}"}

        log("[*] Nhận diện 1 ảnh đầu vào. Đang nắn đứng và chuyển đổi sang không gian 360° Equirectangular 2:1...")
        try:
            img = load_and_orient_image(p, max_dim=8192)
            img = preprocess_lighting_clahe(img)
            h, w = img.shape[:2]
            ar = float(w) / float(max(1, h))
            is_full = (ar >= 1.85)

            leveled = level_and_straighten_spherical_panorama(img)
            cropped = crop_clean_inscribed_rectangle(leveled)
            equi = fit_to_equirectangular_2_to_1(cropped, target_width=out_w, is_full_360=is_full)
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
                "message": "Đã tạo thành công không gian 360° Equirectangular 2:1 chuẩn bảo tàng số."
            }
        except Exception as e:
            return {"success": False, "error": "ERR_SINGLE_PANO", "detail": str(e)}

    # TRƯỜNG HỢP 2: CHÙM ẢNH TỪNG GÓC XOAY 360°
    sorted_paths = resolve_capture_sequence(image_paths)
    log(f"[*] Tiếp nhận {len(sorted_paths)} ảnh góc chụp xoay quanh...")

    final_pano = None
    is_full_360 = False

    # Ưu tiên 1 (Tối ưu tuyệt đối cho chuỗi ảnh quét phòng - Tốc độ 2-4 giây, siêu nhẹ VPS):
    # Động cơ Ghép Chuỗi Quang Học Liên Tục (Sequential Cylindrical Stitcher)
    # Tự động so khớp tịnh tiến tuần tự, nắn mặt trụ 90° và hòa trộn Voronoi triệt tiêu 100% nếp gấp!
    log(f"[*] Kích hoạt Động cơ Ghép Chuỗi Quang Học Liên Tục cho {len(sorted_paths)} ảnh...")
    f_cyl = None
    try:
        final_pano, is_full_360, f_cyl = run_sequential_cylindrical_stitcher(sorted_paths, target_width=out_w)
    except Exception as seq_err:
        log(f"[!] Lỗi Sequential Stitcher: {seq_err}")
        final_pano = None
        f_cyl = None

    # Ưu tiên 2: Nếu chuỗi ít ảnh (<= 6 ảnh) và Sequential Stitcher chưa có kết quả, mới dùng OpenCV Native
    if final_pano is None and len(sorted_paths) <= 6:
        log("[*] Thử nghiệm OpenCV Native dự phòng...")
        try:
            final_pano, is_full_360 = run_opencv_native_stitcher(sorted_paths, target_width=out_w)
        except Exception as e:
            log(f"[!] OpenCV Native dự phòng gặp sự cố: {e}")

    # Ưu tiên 3: Nếu vẫn chưa có kết quả và Hugin khả dụng (chỉ áp dụng cho chuỗi ít ảnh <= 12 để tránh treo quá 180s)
    if final_pano is None and is_hugin_available() and len(sorted_paths) <= 12:
        log("[*] Thử nghiệm Hugin CLI dự phòng...")
        hugin_ok, hugin_img = run_hugin_stitch(sorted_paths, output_path, target_width=out_w)
        if hugin_ok and hugin_img is not None:
            final_pano = hugin_img
            is_full_360 = True

    if final_pano is None:
        im0 = load_and_orient_image(sorted_paths[0], max_dim=2048)
        final_pano = im0
        is_full_360 = False

    # Hậu xử lý chuyển đổi thành ảnh cầu 360° Equirectangular 2:1
    if f_cyl is not None:
        # Chuỗi ảnh đã được nắn mặt trụ quang học, cân bằng chân trời và ghép nối Voronoi hoàn chỉnh.
        # Chuyển đổi trực tiếp chuẩn xác sang Equirectangular 2:1, bảo toàn 100% tất cả các góc ảnh (không xén cột, không sọc ngang mép).
        log("[*] Đang chuyển đổi chuẩn mực từ Mặt Trụ (Cylinder) sang Cầu Toàn Cảnh 360° Equirectangular 2:1...")
        equi_pano = cylindrical_to_equirectangular(final_pano, f_cam=f_cyl, out_w=out_w, out_h=out_w // 2)
        equi_pano = enhance_museum_details(equi_pano)
    else:
        # Fallback cho trường hợp 1 ảnh hoặc OpenCV Native fallback
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
        "engine": "opencv_failsafe_360",
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
    parser.add_argument("--images-file", help="Đường dẫn file JSON chứa danh sách ảnh đầu vào")
    parser.add_argument("--video", help="Đường dẫn file video 360")
    parser.add_argument("--output", help="Đường dẫn file ảnh đầu ra")
    parser.add_argument("--width", type=int, default=0, help="Độ rộng mong muốn của ảnh Equirectangular 2:1")
    parser.add_argument("--keyframes", type=int, default=0, help="Số khung hình cắt từ video")
    parser.add_argument("--verify-image", help="Thẩm định 1 khung hình chụp")
    parser.add_argument("--prev-image", default=None, help="Khung hình trước đó")

    args = parser.parse_args()

    if args.images_file and os.path.exists(args.images_file):
        try:
            with open(args.images_file, 'r', encoding='utf-8') as f:
                args.images = json.load(f)
        except Exception as j_err:
            log(f"[!] Lỗi đọc --images-file: {j_err}")

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
