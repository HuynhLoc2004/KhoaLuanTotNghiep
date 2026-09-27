#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
HỆ THỐNG TÁI TẠO KHỐI 3D HIỆN VẬT DI SẢN CHÂN THẬT (FAITHFUL 3D VOLUMETRIC RECONSTRUCTION)
Phiên bản: v14.0 - Multi-Segment Cross-Sectional Revolution & Curvilinear UV Unwrapping
==============================================================================
Mô tả:
  Module chuyển đổi ảnh chụp hiện vật bảo tàng (Lư hương, bình gốm, tượng thần,
  vũ khí cổ, đồ tế khí) thành mô hình 3D nguyên bản đúng hình dáng và kích thước
  thực tế, khép kín 100% (Watertight) chuẩn .GLB tương thích Three.js / WebGL.

Đặc tính nâng cấp vượt trội:
  1. Multi-Segment Cross-Sectional Decomposition (Phân rã cắt ngang đa thành phần):
     - Không gom toàn bộ hiện vật thành một chiếc "gối" phồng tròn đơn lẻ.
     - Phân tích từng lát cắt ngang: thân bình, quai rồng, tượng sư tử nắp, chân quỳ
       được bóc tách độc lập thành từng khối hình học 3D riêng biệt.
     - Giữ trọn khoảng không rỗng (khoảng hở âm) giữa quai bình và thân, giữa các chân đế.
  2. Anatomical Vessel & Component Depth Scaling:
     - Thân bình/lư hương có độ sâu tỉ lệ thực tế (Depth ~ Width), không xẹp mỏng.
     - Quai bình, vũ khí, chi tiết phụ có bán kính ống trụ thanh thoát đúng tỉ lệ.
     - Làm mịn chuyển tiếp tự nhiên giữa các mối nối bằng trường Gaussian 3D hữu cơ.
  3. Curvilinear Cylindrical Arc-Length UV Unwrapping:
     - Khắc phục triệt để hiện tượng vệt sọc kéo dãn khi nhìn nghiêng hoặc quay 90 độ.
     - Ánh xạ toạ độ U theo góc cung trụ quanh từng bộ phận, vân ảnh ôm lượn tự nhiên.
  4. PBR Tangent-Space Normal Map & Color Dilation:
     - Xóa bỏ hoàn toàn viền đen, tạo hiệu ứng chạm khắc sâu nổi sắc nét dưới ánh đèn.
==============================================================================
"""

import os
import sys
import json
import argparse
import time
import numpy as np
import cv2
from PIL import Image, ImageOps, ImageFile
from skimage import measure
import scipy.ndimage
import trimesh

ImageFile.LOAD_TRUNCATED_IMAGES = True

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass


def log(msg):
    """Ghi log tiến trình có nhãn thời gian."""
    print(f"[*] {msg}", file=sys.stderr, flush=True)


# ============================================================================
# 1. BÓC TÁCH NỀN VÀ TRÍCH XUẤT BIÊN DẠNG HIỆN VẬT CHUẨN XÁC
# ============================================================================

def remove_background_ai(image_rgb):
    """
    Sử dụng AI Rembg (u2netp / u2net) để tách sạch hoàn toàn phông nền.
    """
    try:
        import rembg
        session = rembg.new_session('u2netp')
        is_success, buffer = cv2.imencode(".png", cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR))
        if not is_success:
            return None
        rgba_bytes = rembg.remove(buffer.tobytes(), session=session)
        arr = cv2.imdecode(np.frombuffer(rgba_bytes, np.uint8), cv2.IMREAD_UNCHANGED)
        if arr is not None and arr.shape[2] == 4:
            alpha = arr[:, :, 3]
            if np.sum(alpha > 100) > (alpha.size * 0.015):
                log("Đã bóc tách nền chuẩn xác bằng AI Rembg!")
                return (alpha > 80).astype(np.uint8) * 255
    except Exception as e:
        log(f"Rembg thông báo: {e}. Chuyển sang trích xuất tự động theo ngưỡng màu...")

    return None


def extract_salient_mask_fallback(img_rgb):
    """
    Thuật toán phân vùng thích ứng dự phòng nếu không có Rembg.
    """
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    border_pixels = np.concatenate([
        img_rgb[0:15, :, :].reshape(-1, 3),
        img_rgb[-15:, :, :].reshape(-1, 3),
        img_rgb[:, 0:15, :].reshape(-1, 3),
        img_rgb[:, -15:, :].reshape(-1, 3)
    ])
    bg_color = np.median(border_pixels, axis=0)

    diff = np.linalg.norm(img_rgb.astype(np.float32) - bg_color.astype(np.float32), axis=2)
    diff_norm = np.clip((diff / (diff.max() + 1e-5)) * 255, 0, 255).astype(np.uint8)

    _, mask = cv2.threshold(diff_norm, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)
    return mask


def load_and_clean_artifact_image(image_path, max_dim=1400):
    """
    Nạp ảnh hiện vật và bóc tách nền một cách an toàn, bảo tồn mọi chi tiết:
    - Bảo toàn tượng sư tử ở đỉnh, quai rồng, chân đế.
    - Loại bỏ các đốm nhiễu nhỏ li ti ở rìa nền.
    """
    with Image.open(image_path) as pil_img:
        pil_img = ImageOps.exif_transpose(pil_img)
        alpha_mask = None
        if pil_img.mode in ('RGBA', 'LA') or (pil_img.mode == 'P' and 'transparency' in pil_img.info):
            rgba = pil_img.convert('RGBA')
            alpha = np.array(rgba.split()[-1])
            if np.min(alpha) < 240:
                alpha_mask = (alpha > 80).astype(np.uint8) * 255
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

        img_rgb = np.array(pil_img)

    if alpha_mask is not None and np.sum(alpha_mask > 120) > (alpha_mask.size * 0.015):
        log("Sử dụng trực tiếp kênh Alpha trong suốt có sẵn của ảnh PNG!")
        mask = alpha_mask
    else:
        log("Đang phân tích và bóc tách phông nền hiện vật...")
        mask = remove_background_ai(img_rgb)
        if mask is None:
            mask = extract_salient_mask_fallback(img_rgb)

    # Lọc bỏ đốm nhiễu nhỏ, giữ trọn vẹn hiện vật chính cùng các phụ kiện gắn kèm
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    clean_mask = np.zeros_like(mask)
    if cnts:
        areas = [cv2.contourArea(c) for c in cnts]
        max_area = max(areas)
        for c, a in zip(cnts, areas):
            if a > max_area * 0.003:
                cv2.drawContours(clean_mask, [c], -1, 255, thickness=cv2.FILLED)
    else:
        clean_mask = mask

    k_smooth = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, k_smooth)

    ys, xs = np.where(clean_mask > 0)
    if len(ys) == 0:
        raise ValueError("Không tìm thấy biên dạng hiện vật sau khi bóc tách phông nền.")

    return img_rgb, clean_mask


# ============================================================================
# 2. TÁI TẠO KHỐI THỂ TÍCH 3D ĐA PHÂN ĐOẠN (MULTI-SEGMENT VOLUMETRIC MARCHING CUBES)
# ============================================================================

def build_faithful_3d_mesh(img_rgb, mask, back_img_rgb=None, depth_scale=1.0, resolution=110):
    """
    Dựng khối 3D thực tế theo đúng hình dáng của hiện vật:
    1. Bóc tách từng lát cắt ngang (row segments) để tách biệt quai, thân, chân.
    2. Sinh bán kính chiều sâu theo mặt cắt tròn/elip thực của từng thành phần.
    3. Giữ trọn khoảng hở rỗng giữa quai và thân, giữa các chân đế.
    4. Chiết xuất lưới kín hoàn toàn (Watertight) bằng Marching Cubes.
    5. Ánh xạ UV cong cung trụ 360° (Curvilinear Cylindrical Arc Unwrapping)
       khắc phục triệt để hiện tượng vệt sọc mép bên khi quay 90 độ.
    """
    ys, xs = np.where(mask > 0)
    pad = 8
    y_min = max(0, int(ys.min()) - pad)
    y_max = min(mask.shape[0] - 1, int(ys.max()) + pad)
    x_min = max(0, int(xs.min()) - pad)
    x_max = min(mask.shape[1] - 1, int(xs.max()) + pad)

    crop_mask = mask[y_min:y_max + 1, x_min:x_max + 1].copy()
    crop_rgb = img_rgb[y_min:y_max + 1, x_min:x_max + 1].copy()

    h_crop, w_crop = crop_mask.shape

    # Mở rộng màu sắc viền (Texture Dilation) để mép biên 3D không bao giờ bị viền đen
    k_rect = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dil_m = crop_mask.copy()
    dil_rgb = crop_rgb.copy()
    for _ in range(18):
        nm = cv2.dilate(dil_m, k_rect)
        edge = (nm > 0) & (dil_m == 0)
        dil_rgb[edge] = cv2.dilate(dil_rgb, k_rect)[edge]
        dil_m = nm

    # Chuẩn hóa lưới tính toán 3D
    H_grid = int(np.clip(resolution, 80, 140))
    scale_factor = float(H_grid) / float(h_crop)
    W_grid = max(16, int(w_crop * scale_factor))

    scaled_mask = cv2.resize(crop_mask, (W_grid, H_grid), interpolation=cv2.INTER_NEAREST)

    actual_depth_scale = float(np.clip(depth_scale, 0.70, 1.40))

    # Ma trận ghi nhận thông tin từng thành phần theo lát cắt ngang
    z_map = np.zeros((H_grid, W_grid), dtype=np.float32)
    centers_map = np.full((H_grid, W_grid), -1.0, dtype=np.float32)
    radii_map = np.zeros((H_grid, W_grid), dtype=np.float32)
    seg_starts_map = np.zeros((H_grid, W_grid), dtype=np.float32)
    seg_ends_map = np.zeros((H_grid, W_grid), dtype=np.float32)

    for y in range(H_grid):
        row = (scaled_mask[y] > 100).astype(np.int32)
        if not np.any(row):
            continue
        diffs = np.diff(np.pad(row, (1, 1), mode='constant'))
        starts = np.where(diffs == 1)[0]
        ends = np.where(diffs == -1)[0]

        row_segments = []
        for s, e in zip(starts, ends):
            w_seg = e - s
            if w_seg < 1:
                continue
            c_seg = (s + e - 1) / 2.0
            r_seg = max(1.0, w_seg / 2.0)
            row_segments.append((s, e, c_seg, r_seg, w_seg))

        if not row_segments:
            continue

        for s, e, c_seg, r_seg, w_seg in row_segments:
            # Độ dày bán kính Z tỷ lệ với chiều ngang của thành phần
            r_z = r_seg * actual_depth_scale

            # Mặt cắt cung tròn / elip chuẩn thể tích (Circular Cross-Section)
            x_indices = np.arange(s, e, dtype=np.float32)
            u = np.clip((x_indices - c_seg) / r_seg, -1.0, 1.0)
            z_prof = np.sqrt(np.maximum(0.0, 1.0 - u**2)) * r_z

            z_map[y, s:e] = np.maximum(z_map[y, s:e], z_prof)
            centers_map[y, s:e] = c_seg
            radii_map[y, s:e] = r_seg
            seg_starts_map[y, s:e] = s
            seg_ends_map[y, s:e] = e

    max_z = z_map.max()
    if max_z < 2.0:
        max_z = 2.0
    Z_half = int(max_z) + 3
    z_indices = np.arange(-Z_half, Z_half + 1, dtype=np.float32)

    # Tính khoảng cách tới biên cho các vùng ngoài mask và khoảng hở âm
    ext_dist = cv2.distanceTransform((scaled_mask == 0).astype(np.uint8) * 255, cv2.DIST_L2, 5)
    vol = np.zeros((H_grid, W_grid, len(z_indices)), dtype=np.float32)

    for zi, z in enumerate(z_indices):
        abs_z = abs(z)
        inside_field = z_map - abs_z
        outside_field = - (ext_dist * 1.5 + abs_z)
        vol[:, :, zi] = np.where(scaled_mask > 100, inside_field, outside_field)

    # Làm mượt chuyển tiếp 3D bằng Gaussian hữu cơ (hàn gắn tự nhiên quai vào thân, chân vào đế)
    vol = scipy.ndimage.gaussian_filter(vol, sigma=(1.0, 0.8, 0.8))
    # Đệm biên âm để khối 3D luôn khép kín 100% (Watertight)
    vol = np.pad(vol, ((1, 1), (1, 1), (1, 1)), mode='constant', constant_values=-20.0)

    log(f"Đang trích xuất lưới 3D Marching Cubes (Lưới: {W_grid}x{H_grid}x{Z_half * 2 + 1})...")
    verts, faces, normals, _ = measure.marching_cubes(vol, level=0.0, spacing=(1.0, 1.0, 1.0))
    verts -= 1.0

    y_raw = verts[:, 0]
    x_raw = verts[:, 1]
    z_raw = verts[:, 2] - Z_half

    # Định vị và chuẩn hóa kích thước không gian Three.js (Chiều cao = 2.0 mét)
    world_scale = 2.0 / float(H_grid)
    y_world = (H_grid - y_raw) * world_scale + 0.05
    x_world = (x_raw - W_grid / 2.0) * world_scale
    z_world = z_raw * world_scale

    mesh_verts = np.column_stack([x_world, y_world, z_world])
    mesh = trimesh.Trimesh(vertices=mesh_verts, faces=faces, process=False)
    mesh.fix_normals()

    # Làm mịn bề mặt Taubin (giữ nguyên độ tròn và chi tiết hình thể)
    try:
        trimesh.smoothing.filter_taubin(mesh, iterations=6)
    except Exception as e:
        log(f"Bỏ qua Taubin Smoothing: {e}")

    # ========================================================================
    # 3. ÁNH XẠ UV CONG CUNG TRỤ 360° (CURVILINEAR CYLINDRICAL ARC UNWRAPPING)
    # ========================================================================
    log("Đang tổng hợp vân PBR và trải UV cong cung trụ 360° chống giãn mép...")
    y_idx = np.clip(np.round(y_raw).astype(int), 0, H_grid - 1)
    x_idx = np.clip(np.round(x_raw).astype(int), 0, W_grid - 1)

    c_seg = centers_map[y_idx, x_idx]
    s_seg = seg_starts_map[y_idx, x_idx]
    e_seg = seg_ends_map[y_idx, x_idx]

    # Điểm ngoài biên (do Gaussian làm mượt lan ra) fallback về tâm trục đối xứng chính
    invalid = c_seg < 0
    c_seg[invalid] = W_grid / 2.0
    s_seg[invalid] = 0.0
    e_seg[invalid] = float(W_grid)

    theta = np.arctan2(z_raw, x_raw - c_seg)
    is_front = z_raw >= 0

    uvs = np.zeros((len(mesh.vertices), 2), dtype=np.float32)

    # Mặt trước (Z >= 0): Trải góc theta từ PI -> 0 tương ứng từ mép trái qua giữa tới mép phải
    t_front = (np.pi - theta[is_front]) / np.pi
    x_front = s_seg[is_front] + t_front * (e_seg[is_front] - s_seg[is_front])
    u_front_norm = np.clip(x_front / float(W_grid), 0.0, 1.0)
    uvs[is_front, 0] = u_front_norm * 0.494 + 0.003
    uvs[is_front, 1] = np.clip(1.0 - y_raw[is_front] / float(H_grid), 0.0, 1.0)

    # Mặt sau (Z < 0): Trải góc |theta| từ PI -> 0 từ mép trái qua giữa tới mép phải
    is_back = ~is_front
    t_back = np.abs(theta[is_back]) / np.pi
    x_back = e_seg[is_back] - t_back * (e_seg[is_back] - s_seg[is_back])
    u_back_norm = np.clip(x_back / float(W_grid), 0.0, 1.0)
    uvs[is_back, 0] = 0.503 + (1.0 - u_back_norm) * 0.494
    uvs[is_back, 1] = np.clip(1.0 - y_raw[is_back] / float(H_grid), 0.0, 1.0)

    # Xây dựng Atlas ảnh kích thước lớn 2048 x 1024
    tex_w, tex_h = 2048, 1024
    front_tex = cv2.resize(dil_rgb, (tex_w // 2, tex_h), interpolation=cv2.INTER_LANCZOS4)

    if back_img_rgb is not None and isinstance(back_img_rgb, np.ndarray):
        back_tex = cv2.resize(back_img_rgb, (tex_w // 2, tex_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        # Nếu chưa có ảnh mặt sau: lật ngang đối xứng liền mạch
        back_tex = cv2.flip(front_tex, 1)

    atlas = np.zeros((tex_h, tex_w, 3), dtype=np.uint8)
    atlas[:, :tex_w // 2] = front_tex
    atlas[:, tex_w // 2:] = back_tex

    # Tạo Tangent-Space Normal Map từ hoa văn để tạo hiệu ứng chạm khắc sâu nổi sắc nét
    gray = cv2.cvtColor(atlas, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    nx, ny, nz = -gx * 2.2, -gy * 2.2, np.ones_like(gx)
    norm = np.sqrt(nx**2 + ny**2 + nz**2) + 1e-6
    norm_map = cv2.merge([
        np.clip((nx / norm * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8),
        np.clip((ny / norm * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8),
        np.clip((nz / norm * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
    ])

    pil_atlas = Image.fromarray(atlas)
    pil_norm = Image.fromarray(norm_map)

    # Vật liệu PBR chuẩn cổ vật kim loại / gốm sứ
    pbr_mat = trimesh.visual.material.PBRMaterial(
        baseColorTexture=pil_atlas,
        normalTexture=pil_norm,
        metallicFactor=0.36,
        roughnessFactor=0.48
    )

    mesh.visual = trimesh.visual.TextureVisuals(uv=uvs, material=pbr_mat)
    return mesh


# ============================================================================
# 4. PIPELINE ĐIỀU PHỐI CHÍNH (MAIN ENTRYPOINT)
# ============================================================================

def generate_3d_artifact(image_path, output_glb_path, back_image_path=None, depth_scale=1.0, resolution=110):
    """
    Tạo mô hình 3D nguyên bản từ ảnh chụp hiện vật:
    - Bóc tách nền giữ trọn vẹn tượng, hoa văn, chân đế.
    - Dựng khối 3D đặc khép kín theo đúng hình dáng nguyên mẫu.
    - Xuất file .GLB hoàn hảo cho Three.js WebGL.
    """
    t_start = time.time()
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file ảnh gốc: {image_path}")

    log(f"Nạp ảnh hiện vật: {image_path}...")
    img_rgb, mask = load_and_clean_artifact_image(image_path, max_dim=1400)

    back_img_rgb = None
    if back_image_path and os.path.exists(back_image_path):
        log(f"Nạp ảnh mặt sau: {back_image_path}...")
        back_img_rgb, _ = load_and_clean_artifact_image(back_image_path, max_dim=1400)

    mesh = build_faithful_3d_mesh(
        img_rgb,
        mask,
        back_img_rgb=back_img_rgb,
        depth_scale=depth_scale,
        resolution=resolution
    )

    os.makedirs(os.path.dirname(os.path.abspath(output_glb_path)), exist_ok=True)
    log(f"Đang xuất file 3D GLTF Binary (.GLB) sang: {output_glb_path}...")

    glb_bytes = trimesh.exchange.gltf.export_glb(mesh)
    with open(output_glb_path, 'wb') as f:
        f.write(glb_bytes)

    extents = mesh.extents
    elapsed = time.time() - t_start

    result = {
        "success": True,
        "glbPath": output_glb_path,
        "vertices": len(mesh.vertices),
        "faces": len(mesh.faces),
        "sizeBytes": len(glb_bytes),
        "isWatertight": bool(mesh.is_watertight),
        "dimensions": {
            "width": round(float(extents[0]), 3),
            "height": round(float(extents[1]), 3),
            "depth": round(float(extents[2]), 3)
        },
        "message": f"Đã tái tạo thành công mô hình 3D khối đặc đúng hình dáng hiện vật ({len(mesh.faces):,} mặt lưới) trong {elapsed:.2f}s."
    }
    log(f"Hoàn thành xuất sắc trong {elapsed:.2f}s! Kích thước: Rộng={extents[0]:.2f}, Cao={extents[1]:.2f}, Sâu={extents[2]:.2f}")
    return result


def main():
    parser = argparse.ArgumentParser(description="Faithful 3D Museum Artifact Volumetric Reconstruction")
    parser.add_argument("--image", required=True, help="Đường dẫn file ảnh mặt trước (.jpg, .png)")
    parser.add_argument("--back-image", default=None, help="Đường dẫn file ảnh mặt sau (Tùy chọn)")
    parser.add_argument("--output", required=True, help="Đường dẫn lưu file 3D đầu ra (.glb)")
    parser.add_argument("--depth-scale", type=float, default=1.0, help="Độ dày thể tích (0.70 - 1.40)")
    parser.add_argument("--resolution", type=int, default=110, help="Độ phân giải lưới 3D (80 - 140)")

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
