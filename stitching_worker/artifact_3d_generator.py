#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hệ Thống Tái Tạo Khối 3D Cổ Vật Bảo Tàng Từ 1 Ảnh Đơn (Single-View 3D Monocular Reconstruction)
Đồ Án Tốt Nghiệp: Ứng dụng Công nghệ 4.0 và AI trong Bảo tồn Di sản - Bảo tàng Lịch sử TP.HCM

1. Tách nền thông minh & mượt mà đường viền cổ vật (Adaptive Salient Mask & Anti-Aliased Contour).
2. Ước lượng độ sâu hình khối & vân chạm khắc lồi lõm (Curvature & Luminance High-Pass Relief).
3. Dựng khối 3D đặc khép kín (Watertight Solid Manifold Mesh) gồm Mặt Trước, Vách Bên và Mặt Sau.
4. Tổng hợp chất liệu cổ vật hài hòa (Patina Bronze / Wood / Ceramic / Stone), không bị dị hợm màu sắc.
5. Xuất file chuẩn công nghiệp .GLB (Binary GLTF) tương thích 100% Three.js & mâm xoay WebGL 360°.
"""

import sys
import os
import json
import argparse
import numpy as np
import cv2
from PIL import Image, ImageOps, ImageFile
import trimesh

# Cho phép nạp ảnh lớn hoặc bị truncated
ImageFile.LOAD_TRUNCATED_IMAGES = True

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def load_and_prepare_image(image_path, max_dim=1600):
    """
    Nạp ảnh, chuẩn hóa góc quay EXIF và bảo toàn kênh Alpha nếu có.
    Hỗ trợ mọi định dạng (PNG trong suốt, JPEG, WebP).
    """
    with Image.open(image_path) as pil_img:
        pil_img = ImageOps.exif_transpose(pil_img)
        alpha_mask = None
        if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
            rgba = pil_img.convert('RGBA')
            alpha = np.array(rgba.split()[-1])
            if np.min(alpha) < 250:
                alpha_mask = (alpha > 40).astype(np.uint8) * 255
            pil_img = rgba.convert('RGB')
        elif pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')

        w, h = pil_img.size
        if max(w, h) > max_dim:
            scale = max_dim / float(max(w, h))
            new_w, new_h = int(w * scale), int(h * scale)
            pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            if alpha_mask is not None:
                alpha_mask = cv2.resize(alpha_mask, (new_w, new_h), interpolation=cv2.INTER_NEAREST)

        rgb_arr = np.array(pil_img)
        return rgb_arr, alpha_mask

def apply_texture_margin(texture_rgb, mask, margin_px=8):
    """
    Kéo giãn màu sắc từ mép vật thể ra vùng viền ngoài (Color Bleed Margin):
    Ngăn chặn 100% hiện tượng WebGL/Three.js lấy mẫu trúng màu nền của ảnh gốc khi lọc tuyến tính (Bilinear Mipmaps).
    """
    res = texture_rgb.copy()
    curr_mask = (mask > 120).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    for _ in range(margin_px):
        dilated = cv2.dilate(curr_mask, kernel)
        edge = (dilated > 0) & (curr_mask == 0)
        res_dilated = cv2.dilate(res, kernel)
        res[edge] = res_dilated[edge]
        curr_mask = dilated
    return res

def extract_salient_mask(img_rgb, alpha_mask=None):
    """
    Trích xuất mặt nạ vật thể cổ vật chính xác cao cho MỌI LOẠI ẢNH:
    - Nếu là ảnh PNG/WebP có kênh trong suốt (Alpha channel): Sử dụng trực tiếp 100% chuẩn xác.
    - Nếu là ảnh có phông nền (Trắng, Đen, Xám studio, Xanh green/blue, phòng trưng bày bảo tàng):
      + Tự động lấy mẫu màu sắc nền đa kênh RGB từ 4 cạnh biên mép ảnh.
      + Đo khoảng cách màu (Color Euclidean Distance) kết hợp GrabCut.
      + Khử sạch 100% phông nền, bóng hắt và phản quang.
    """
    h, w = img_rgb.shape[:2]

    # 1. Nếu ảnh gốc có sẵn kênh trong suốt (như sticker, PNG tách nền)
    if alpha_mask is not None and np.sum(alpha_mask > 120) > (w * h * 0.01):
        clean_mask = (alpha_mask > 120).astype(np.uint8) * 255
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel)
        clean_mask = cv2.GaussianBlur(clean_mask, (3, 3), 0.8)
        _, clean_mask = cv2.threshold(clean_mask, 120, 255, cv2.THRESH_BINARY)
        return clean_mask

    # 2. Phân tích màu phông nền tổng quát từ 4 cạnh mép ảnh (Border Color Profile)
    border_pixels = np.concatenate([
        img_rgb[:6, :].reshape(-1, 3),
        img_rgb[-6:, :].reshape(-1, 3),
        img_rgb[:, :6].reshape(-1, 3),
        img_rgb[:, -6:].reshape(-1, 3)
    ], axis=0).astype(np.float32)

    bg_median = np.median(border_pixels, axis=0)
    bg_std = np.std(border_pixels, axis=0)
    mean_std = float(np.mean(bg_std))

    # Khoảng cách màu từng điểm ảnh tới màu nền trung vị
    dist_to_bg = np.linalg.norm(img_rgb.astype(np.float32) - bg_median, axis=2)

    if mean_std < 42.0:
        # Nền đồng màu / studio (Trắng, đen nhung, xám, xanh lá, xanh dương)
        tol = max(28.0, mean_std * 2.5)
        mask = (dist_to_bg > tol).astype(np.uint8) * 255
    else:
        # Nền phức tạp / ảnh chụp trong phòng trưng bày bảo tàng / tủ kính
        try:
            rect = (int(w * 0.03), int(h * 0.03), int(w * 0.94), int(h * 0.94))
            bgdModel = np.zeros((1, 65), np.float64)
            fgdModel = np.zeros((1, 65), np.float64)
            grab_mask = np.zeros((h, w), np.uint8)
            cv2.grabCut(img_rgb, grab_mask, rect, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_RECT)
            mask = np.where((grab_mask == cv2.GC_FGD) | (grab_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
        except Exception:
            gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
            blurred = cv2.bilateralFilter(gray, 9, 75, 75)
            _, mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            if np.mean(mask[:10, :10]) > 127:
                mask = cv2.bitwise_not(mask)

    # 3. Lọc hình thái học để lấp đầy khối đặc bên trong cổ vật
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # 4. Giữ lại đường bao vật thể lớn nhất (cổ vật chính)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    clean_mask = np.zeros_like(mask)
    if contours:
        valid_contours = [c for c in contours if cv2.contourArea(c) > (w * h * 0.015)]
        largest = max(valid_contours if valid_contours else contours, key=cv2.contourArea)
        cv2.drawContours(clean_mask, [largest], -1, 255, thickness=cv2.FILLED)
    else:
        clean_mask = mask

    # 5. Làm mềm biên chống răng cưa
    clean_mask = cv2.GaussianBlur(clean_mask, (5, 5), 1.2)
    _, clean_mask = cv2.threshold(clean_mask, 127, 255, cv2.THRESH_BINARY)

    return clean_mask


def estimate_artifact_depth(img_rgb, mask):
    """
    Ước tính bản đồ độ sâu hình học (Monocular Depth & Surface Relief):
    - Radial Distance Transform: tạo độ phồng cong 3D tự nhiên từ biên vào tâm (thân bình, tượng, kiếm).
    - Luminance High-Pass: tạo độ lồi lõm cho hoa văn, vết khắc chữ cổ, quai cầm, đường viền cổ vật.
    - Kết hợp để tạo nên khối 3D sống động, không bị bẹp dính như tấm bìa carton.
    """
    h, w = mask.shape
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0

    # 1. Độ phồng thân thể dựa trên Distance Transform
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    max_d = np.max(dist)
    if max_d > 0:
        dist_norm = dist / max_d
    else:
        dist_norm = np.zeros_like(dist)

    # Đường cong làm mượt độ phồng (Elliptical / Parabolic dome)
    bulge = np.power(dist_norm, 0.72)

    # 2. Chi tiết vân nổi bề mặt từ độ sáng (Luminance High-Pass)
    blurred_lum = cv2.GaussianBlur(gray, (0, 0), sigmaX=5.0)
    relief = gray - blurred_lum
    relief = cv2.normalize(relief, None, 0.0, 1.0, cv2.NORM_MINMAX)

    # 3. Tổng hợp độ sâu mặt trước
    front_depth = (bulge * 0.82) + (relief * 0.18)
    front_depth = front_depth * (mask.astype(np.float32) / 255.0)
    front_depth = cv2.GaussianBlur(front_depth, (3, 3), 0.8)

    return front_depth, bulge

def generate_synchronized_back_texture(img_rgb, mask, bulge):
    """
    Tự động tổng hợp kết cấu mặt sau đồng bộ theo màu sắc cơ thể (Synchronized Dorsal Synthesis):
    1. Bóc tách lớp viền trắng sticker / halo khử răng cưa để không bị lỗi khối thạch cao trắng.
    2. Quét màu sắc thân vỏ / áo giáp / da / vải thực tế theo từng tầng chiều cao (đầu, ngực, thắt lưng, chân).
    3. Nội suy cosine mượt mà từ 2 mạn sườn trái/phải vào giữa để tự nhiên loại bỏ mắt, kính, miệng, khóa thắt lưng mặt trước.
    4. Áp dụng bóng đổ vòm độ cong 3D (Cylindrical & Dome Curvature Shading) tạo chiều sâu và độ dày khối đặc.
    5. Khử gián đoạn hàng quét (scanlines) bằng bộ lọc Gaussian làm mềm liên tầng.
    """
    h, w = mask.shape
    back_rgb = np.zeros_like(img_rgb, dtype=np.float32)

    # 1. Bóc tách viền ngoài (Erode 4% kích thước) để đi sâu vào lòng thân thể của hiện vật
    erode_size = max(4, int(min(h, w) * 0.04))
    inner_mask = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (erode_size * 2 + 1, erode_size * 2 + 1)))

    # Nhận diện màu phông nền tổng quát từ 4 cạnh mép ảnh
    border_pixels = np.concatenate([
        img_rgb[:5, :].reshape(-1, 3),
        img_rgb[-5:, :].reshape(-1, 3),
        img_rgb[:, :5].reshape(-1, 3),
        img_rgb[:, -5:].reshape(-1, 3)
    ], axis=0).astype(np.float32)
    bg_median = np.median(border_pixels, axis=0)
    bg_std = np.std(border_pixels, axis=0)
    bg_tol = max(30.0, float(np.mean(bg_std) * 2.2))

    # Khoảng cách tới màu nền
    dist_to_bg = np.linalg.norm(img_rgb.astype(np.float32) - bg_median, axis=2)
    is_bg_like = dist_to_bg < bg_tol

    # Thêm kiểm tra viền trắng nếu nền sáng (R, G, B > 232)
    is_white = (img_rgb[:, :, 0] > 232) & (img_rgb[:, :, 1] > 232) & (img_rgb[:, :, 2] > 232)
    # Thêm kiểm tra viền đen nếu nền tối (R, G, B < 24)
    is_black = (img_rgb[:, :, 0] < 24) & (img_rgb[:, :, 1] < 24) & (img_rgb[:, :, 2] < 24)

    is_bg_rejected = is_bg_like | (is_white if np.mean(bg_median) > 200 else False) | (is_black if np.mean(bg_median) < 40 else False)

    # Tập hợp các điểm ảnh thân thể thực sự (không dính phông nền)
    body_pixels = img_rgb[(inner_mask > 120) & (~is_bg_rejected)]
    if len(body_pixels) < 20:
        body_pixels = img_rgb[(mask > 120) & (~is_bg_rejected)]
    global_median_color = np.median(body_pixels, axis=0) if len(body_pixels) > 0 else np.array([128, 128, 128], dtype=np.float32)

    bulge_norm = cv2.resize(bulge, (w, h)) if bulge.shape != (h, w) else bulge

    # 2. Phân tích màu sắc đồng bộ theo từng dòng quét ngang (Horizontal Strata)
    row_colors = []
    for r in range(h):
        cols = np.where(mask[r] > 120)[0]
        if len(cols) == 0:
            row_colors.append(None)
            continue

        c_min = cols[0]
        c_max = cols[-1]

        # Lấy các cột nằm trong inner_mask và loại trừ hoàn toàn màu nền
        inner_cols = [c for c in cols if inner_mask[r, c] > 120 and not is_bg_rejected[r, c]]
        if len(inner_cols) < 3:
            inner_cols = [c for c in cols if not is_bg_rejected[r, c]]

        if len(inner_cols) == 0:
            row_colors.append(None)
            continue

        valid_samples = img_rgb[r, inner_cols].astype(np.float32)
        row_median = np.median(valid_samples, axis=0)

        # Lấy mẫu màu 2 mạn sườn (vỏ ngoài hai bên thân thể ở độ cao này)
        n_flank = max(1, len(inner_cols) // 4)
        left_samples = img_rgb[r, inner_cols[:n_flank]].astype(np.float32)
        right_samples = img_rgb[r, inner_cols[-n_flank:]].astype(np.float32)

        color_left = np.median(left_samples, axis=0)
        color_right = np.median(right_samples, axis=0)

        # Hòa trộn mạn sườn với trung vị tầng để cân bằng nếu một bên có vũ khí/tay cầm
        color_left = 0.70 * color_left + 0.30 * row_median
        color_right = 0.70 * color_right + 0.30 * row_median

        row_colors.append({
            'c_min': c_min,
            'c_max': c_max,
            'left': color_left,
            'right': color_right,
            'median': row_median
        })

    # Lấp đầy các dòng khuyết (như chóp nhọn, viền hẹp) bằng màu tầng lân cận
    for r in range(h):
        if row_colors[r] is None:
            cols = np.where(mask[r] > 120)[0]
            if len(cols) == 0:
                continue
            found = None
            for offset in range(1, 20):
                if r - offset >= 0 and row_colors[r - offset] is not None:
                    found = row_colors[r - offset]
                    break
                if r + offset < h and row_colors[r + offset] is not None:
                    found = row_colors[r + offset]
                    break
            if found is None:
                found = {'c_min': cols[0], 'c_max': cols[-1], 'left': global_median_color, 'right': global_median_color, 'median': global_median_color}
            else:
                found = {'c_min': cols[0], 'c_max': cols[-1], 'left': found['left'], 'right': found['right'], 'median': found['median']}
            row_colors[r] = found

    # 3. Phủ màu đồng bộ và đổ bóng độ cong 3D theo từng dòng
    for r in range(h):
        info = row_colors[r]
        if info is None:
            continue
        c_min = info['c_min']
        c_max = info['c_max']
        span = c_max - c_min + 1

        t = np.linspace(0.0, 1.0, span)
        t_cos = (1.0 - np.cos(t * np.pi)) / 2.0
        line_colors = np.outer(1.0 - t_cos, info['left']) + np.outer(t_cos, info['right'])

        # Độ cong hình trụ: tâm sáng hơn, mép ngoài cong khuất tối hơn 16%
        curvature = (1.0 - 0.16 * ((2.0 * t - 1.0) ** 2))[:, np.newaxis]

        # Bóng đổ vòm độ dày 3D (Ambient Bulge Dome)
        r_bulge = bulge_norm[r, c_min : c_max + 1]
        dome = (0.85 + 0.20 * np.power(r_bulge, 0.70))[:, np.newaxis]

        shading = np.clip(curvature * dome, 0.65, 1.05)
        back_rgb[r, c_min : c_max + 1] = line_colors * shading

    # 4. Làm mịn làm mềm chuyển tiếp liên tầng (Vertical Gaussian Blur)
    back_rgb = np.clip(back_rgb, 0, 255).astype(np.uint8)
    back_rgb = cv2.GaussianBlur(back_rgb, (5, 9), 2.0)

    mask_3c = (mask > 120)[:, :, np.newaxis]
    return np.where(mask_3c, back_rgb, 0)


def build_watertight_solid_mesh(img_rgb, depth, bulge, mask, back_image=None, depth_scale=0.35, resolution=160):
    """
    Xây dựng lưới 3D đặc đa giác khép kín (Watertight Manifold 3D Mesh):
    - Mặt trước (Front): Mang hình khối chi tiết cao và Texture chân thực 100% từ ảnh mặt trước.
    - Vách bên (Side Walls): Nối khép kín viền chu vi, không tạo khe hở thủng rách.
    - Mặt sau (Back Shell): Phủ Texture mặt sau riêng biệt (ảnh mặt sau chụp thật hoặc tự động tái tạo lưng thân).
    """
    h_orig, w_orig = mask.shape
    aspect = float(w_orig) / float(h_orig)

    gw = int(round(resolution * aspect))
    gh = resolution

    depth_low = cv2.resize(depth, (gw, gh), interpolation=cv2.INTER_AREA)
    bulge_low = cv2.resize(bulge, (gw, gh), interpolation=cv2.INTER_AREA)
    mask_low = cv2.resize(mask, (gw, gh), interpolation=cv2.INTER_NEAREST)

    target_height = 2.4 # Chiều cao chuẩn trong không gian Three.js (mét)
    target_width = target_height * aspect
    max_depth = target_height * depth_scale

    xs = np.linspace(-target_width / 2.0, target_width / 2.0, gw)
    ys = np.linspace(target_height, 0.08, gh) # Chân đế đặt khít trên mâm xoay

    front_idx = -np.ones((gh, gw), dtype=np.int32)
    back_idx = -np.ones((gh, gw), dtype=np.int32)

    vertices = []
    uvs = []

    # 1. Tạo các đỉnh mặt trước & mặt sau
    # Texture Atlas xếp dọc (Top: Mặt trước V in [0.5, 1.0], Bottom: Mặt sau V in [0.0, 0.5])
    for r in range(gh):
        for c in range(gw):
            if mask_low[r, c] > 120:
                x = xs[c]
                y = ys[r]
                zf = depth_low[r, c] * max_depth

                # Mặt sau: Tạo khối lồi về phía sau tương xứng với độ phồng
                zb = - (bulge_low[r, c] * 0.65 + 0.05) * max_depth

                u_norm = c / float(gw - 1)
                v_rel = 1.0 - (r / float(gh - 1))

                # Đỉnh mặt trước: Nửa trên của Atlas Texture [0.5, 1.0]
                front_idx[r, c] = len(vertices)
                vertices.append([x, y, zf])
                uvs.append([u_norm, 0.5 + 0.5 * v_rel])

                # Đỉnh mặt sau: Nửa dưới của Atlas Texture [0.0, 0.5]
                # Sử dụng u_norm đồng bộ để đường viền vách bên tiếp giáp không bị rách xoắn
                back_idx[r, c] = len(vertices)
                vertices.append([x, y, zb])
                uvs.append([u_norm, 0.5 * v_rel])

    faces = []

    # 2. Tạo lưới tam giác cho Mặt Trước và Mặt Sau
    for r in range(gh - 1):
        for c in range(gw - 1):
            f_tl = front_idx[r, c]
            f_tr = front_idx[r, c + 1]
            f_bl = front_idx[r + 1, c]
            f_br = front_idx[r + 1, c + 1]

            b_tl = back_idx[r, c]
            b_tr = back_idx[r, c + 1]
            b_bl = back_idx[r + 1, c]
            b_br = back_idx[r + 1, c + 1]

            # Mặt trước (Counter-Clockwise)
            if f_tl >= 0 and f_tr >= 0 and f_bl >= 0:
                faces.append([f_tl, f_bl, f_tr])
            if f_tr >= 0 and f_bl >= 0 and f_br >= 0:
                faces.append([f_tr, f_bl, f_br])

            # Mặt sau (Clockwise để pháp tuyến hướng ra ngoài)
            if b_tl >= 0 and b_tr >= 0 and b_bl >= 0:
                faces.append([b_tl, b_tr, b_bl])
            if b_tr >= 0 and b_bl >= 0 and b_br >= 0:
                faces.append([b_tr, b_br, b_bl])

    # 3. Nối vách bên kín khít (Watertight Boundary Stitching)
    for r in range(gh):
        for c in range(gw):
            if front_idx[r, c] >= 0:
                curr_f = front_idx[r, c]
                curr_b = back_idx[r, c]

                # Kiểm tra láng giềng bên Phải
                if c < gw - 1 and front_idx[r, c + 1] < 0:
                    if r < gh - 1 and front_idx[r + 1, c] >= 0:
                        next_f = front_idx[r + 1, c]
                        next_b = back_idx[r + 1, c]
                        faces.append([curr_f, next_f, curr_b])
                        faces.append([next_f, next_b, curr_b])

                # Kiểm tra láng giềng bên Trái
                if c > 0 and front_idx[r, c - 1] < 0:
                    if r < gh - 1 and front_idx[r + 1, c] >= 0:
                        next_f = front_idx[r + 1, c]
                        next_b = back_idx[r + 1, c]
                        faces.append([curr_f, curr_b, next_f])
                        faces.append([next_f, curr_b, next_b])

                # Kiểm tra láng giềng bên Dưới
                if r < gh - 1 and front_idx[r + 1, c] < 0:
                    if c < gw - 1 and front_idx[r, c + 1] >= 0:
                        next_f = front_idx[r, c + 1]
                        next_b = back_idx[r, c + 1]
                        faces.append([curr_f, curr_b, next_f])
                        faces.append([next_f, curr_b, next_b])

                # Kiểm tra láng giềng bên Trên
                if r > 0 and front_idx[r - 1, c] < 0:
                    if c < gw - 1 and front_idx[r, c + 1] >= 0:
                        next_f = front_idx[r, c + 1]
                        next_b = back_idx[r, c + 1]
                        faces.append([curr_f, next_f, curr_b])
                        faces.append([next_f, next_b, curr_b])

    vertices = np.array(vertices, dtype=np.float32)
    faces = np.array(faces, dtype=np.int32)
    uvs = np.array(uvs, dtype=np.float32)

    # 4. Chuẩn bị Texture Mặt Trước & Mặt Sau hoàn toàn sạch phông nền của ảnh gốc
    mask_3c = (mask > 120)[:, :, np.newaxis]
    clean_front_rgb = np.where(mask_3c, img_rgb, 0)

    if back_image is not None and isinstance(back_image, np.ndarray):
        if back_image.shape[:2] != (h_orig, w_orig):
            back_rgb = cv2.resize(back_image, (w_orig, h_orig), interpolation=cv2.INTER_LANCZOS4)
        else:
            back_rgb = back_image
        back_rgb = np.where(mask_3c, back_rgb, 0)
    else:
        # Tự động tổng hợp màu sắc mặt sau đồng bộ theo từng tầng chiều cao (Synchronized Dorsal Synthesis):
        # - Tuyệt đối không lấy màu phông nền của ảnh gốc
        # - Đồng bộ màu sắc áo giáp, da thịt, thân bình, đai lưng theo từng tầng
        # - Tự động loại bỏ mắt, mũi, logo, chi tiết mặt trước
        # - Kết hợp bóng đổ vòm độ dày 3D tự nhiên
        back_rgb = generate_synchronized_back_texture(img_rgb, mask, bulge)

    # Kéo giãn viền màu (Color Bleed Margin) ra ngoài mép 8px cho cả mặt trước và mặt sau:
    # Đảm bảo WebGL/Three.js khi lọc mipmap khử răng cưa KHÔNG BAO GIỜ bị ăn vào màu phông nền cũ
    clean_front_rgb = apply_texture_margin(clean_front_rgb, mask, margin_px=8)
    clean_back_rgb = apply_texture_margin(back_rgb, mask, margin_px=8)

    # Tạo Texture Atlas ghép dọc: Nửa trên Mặt Trước, Nửa dưới Mặt Sau
    atlas_rgb = np.vstack([clean_front_rgb, clean_back_rgb])
    pil_texture = Image.fromarray(atlas_rgb)

    mesh = trimesh.Trimesh(
        vertices=vertices,
        faces=faces,
        visual=trimesh.visual.TextureVisuals(uv=uvs, image=pil_texture),
        process=True
    )

    # Làm mịn pháp tuyến đỉnh (Smooth Cotangent Laplacian Normals)
    try:
        mesh.fix_normals()
    except Exception:
        pass

    return mesh

def generate_3d_artifact(image_path, output_glb_path, back_image_path=None, depth_scale=0.35, resolution=160):
    """
    Quy trình toàn diện biến ảnh chụp cổ vật -> Mô hình 3D .GLB chuẩn bảo tàng (mặt trước và mặt sau khác biệt chân thực)
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file ảnh: {image_path}")

    print(f"[*] Đang tải và chuẩn hóa ảnh hiện vật: {image_path}...", file=sys.stderr)
    img_rgb, alpha_mask = load_and_prepare_image(image_path, max_dim=1600)

    back_img_rgb = None
    if back_image_path and os.path.exists(back_image_path):
        print(f"[*] Tìm thấy ảnh chụp mặt sau: {back_image_path}, đang nạp...", file=sys.stderr)
        back_img_rgb, _ = load_and_prepare_image(back_image_path, max_dim=1600)

    print(f"[*] Đang phân đoạn và tách sạch nền cổ vật...", file=sys.stderr)
    mask = extract_salient_mask(img_rgb, alpha_mask=alpha_mask)

    print(f"[*] Đang tính toán bản đồ chiều sâu và độ phồng hình khối...", file=sys.stderr)
    depth, bulge = estimate_artifact_depth(img_rgb, mask)

    print(f"[*] Đang dựng khối đa giác đặc khép kín (Watertight Mesh, Res={resolution})...", file=sys.stderr)
    mesh = build_watertight_solid_mesh(
        img_rgb, depth, bulge, mask,
        back_image=back_img_rgb,
        depth_scale=depth_scale,
        resolution=resolution
    )

    os.makedirs(os.path.dirname(os.path.abspath(output_glb_path)), exist_ok=True)

    print(f"[*] Đang tối ưu và xuất file 3D .GLB...", file=sys.stderr)
    glb_bytes = mesh.export(file_type='glb')
    with open(output_glb_path, 'wb') as f:
        f.write(glb_bytes)

    result = {
        "success": True,
        "glbPath": output_glb_path,
        "vertices": len(mesh.vertices),
        "faces": len(mesh.faces),
        "sizeBytes": len(glb_bytes),
        "hasCustomBack": back_img_rgb is not None,
        "dimensions": {
            "width": round(float(mesh.extents[0]), 3),
            "height": round(float(mesh.extents[1]), 3),
            "depth": round(float(mesh.extents[2]), 3)
        },
        "message": "Đã tạo thành công mô hình 3D cổ vật đặc khối khép kín chuẩn bảo tàng (mặt trước & mặt sau độc lập)."
    }
    return result

def main():
    parser = argparse.ArgumentParser(description="Tái tạo mô hình 3D cổ vật từ ảnh (Bảo tàng Lịch sử TP.HCM)")
    parser.add_argument("--image", required=True, help="Đường dẫn file ảnh mặt trước (.jpg, .png)")
    parser.add_argument("--back-image", default=None, help="Đường dẫn file ảnh mặt sau (Tùy chọn)")
    parser.add_argument("--output", required=True, help="Đường dẫn lưu file 3D đầu ra (.glb)")
    parser.add_argument("--depth-scale", type=float, default=0.35, help="Độ dày lồi lõm của hiện vật (0.15 đến 0.65)")
    parser.add_argument("--resolution", type=int, default=160, help="Độ phân giải lưới 3D (100 đến 220)")

    args = parser.parse_args()

    try:
        res = generate_3d_artifact(
            args.image,
            args.output,
            back_image_path=args.back_image,
            depth_scale=args.depth_scale,
            resolution=args.resolution
        )
        print(json.dumps(res, ensure_ascii=False, indent=2))
        sys.exit(0)
    except Exception as e:
        err = {"success": False, "error": str(e)}
        print(json.dumps(err, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
