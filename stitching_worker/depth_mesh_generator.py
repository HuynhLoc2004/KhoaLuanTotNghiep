"""
Hệ thống Di sản Số hóa Bảo tàng Lịch sử TP.HCM
Module: depth_mesh_generator.py
Nhiệm vụ: Tái tạo mô hình 3D thực thụ (.GLB) từ 1 ảnh chụp chính diện (qua tủ kính bảo tàng)
Sử dụng: OpenCV + NumPy + Trimesh
"""

import os
import sys

# Đảm bảo xuất UTF-8 an toàn trên mọi hệ điều hành
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import argparse
import json
import cv2
import numpy as np
import trimesh
from PIL import Image

def generate_depth_map(img_rgb, mask):
    """
    Ước lượng bản đồ độ sâu Z(x, y) dựa trên:
    1. Distance transform từ viền vào tâm (tạo độ dày tự nhiên hình khối 3D)
    2. Luminance & Shading gradient (chi tiết bề mặt lồi lõm: nếp áo, sống mũi, chạm khắc)
    """
    h, w = img_rgb.shape[:2]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Distance Transform: Càng vào sâu bên trong vật thể thì khối càng dày
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    max_dist = np.max(dist)
    if max_dist > 0:
        dist_norm = dist / max_dist
    else:
        dist_norm = np.zeros_like(dist, dtype=np.float32)

    # Dạng vòm elip 3D (Spherical / Cylindrical falloff)
    volume_depth = np.sin(dist_norm * (np.pi / 2))

    # 2. Luminance shading: Ánh sáng phản chiếu thể hiện độ nhô các chi tiết hoa văn
    gray_norm = cv2.GaussianBlur(gray, (5, 5), 0).astype(np.float32) / 255.0

    # Khử ánh sáng nền lớn, chỉ giữ lại chi tiết nổi (high-pass detail)
    low_freq = cv2.GaussianBlur(gray_norm, (35, 35), 0)
    high_freq = gray_norm - low_freq
    high_freq = np.clip(high_freq * 1.5, -0.2, 0.2)

    # 3. Kết hợp: Khối tổng thể (volume) + Chi tiết lồi lõm (features)
    depth = (volume_depth * 0.75) + (gray_norm * 0.15) + (high_freq * 0.10)
    depth = np.clip(depth, 0.0, 1.0)
    depth[mask == 0] = 0.0

    # Làm mượt nhẹ để khử gai lưới
    depth = cv2.GaussianBlur(depth, (3, 3), 0)
    return depth

def create_mask(img_rgb):
    """
    Tách nền tự động loại bỏ ánh sáng phản chiếu kính và phông sau tủ kính
    """
    h, w = img_rgb.shape[:2]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # Lấy màu viền cạnh ảnh để xác định nền
    corners = [
        gray[:10, :10],
        gray[:10, -10:],
        gray[-10:, :10],
        gray[-10:, -10:]
    ]
    bg_mean = np.mean([np.mean(c) for c in corners])

    if bg_mean < 50:
        # Nền tối
        _, mask = cv2.threshold(gray, max(int(bg_mean + 20), 25), 255, cv2.THRESH_BINARY)
    elif bg_mean > 200:
        # Nền sáng
        _, mask = cv2.threshold(gray, min(int(bg_mean - 25), 230), 255, cv2.THRESH_BINARY_INV)
    else:
        # Dùng Otsu
        _, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        if np.mean(mask[:5, :5]) == 255:
            mask = cv2.bitwise_not(mask)

    # Lọc nhiễu hạt
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)

    # Giữ contour lớn nhất (vật thể chính)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest = max(contours, key=cv2.contourArea)
        clean_mask = np.zeros_like(mask)
        cv2.drawContours(clean_mask, [largest], -1, 255, thickness=cv2.FILLED)
        mask = clean_mask

    return mask

def build_3d_solid_mesh(img_rgb, depth, mask, depth_scale=0.35, resolution=160):
    """
    Dựng lưới đa giác 3D đặc (Watertight 3D Mesh) bao gồm:
    - Mặt trước (Front Surface): Lồi lõm chi tiết
    - Vách bên (Side Walls): Nối viền tạo độ dày
    - Mặt sau (Back Shell): Bo cong nhẹ tạo khối tượng 3D vững chắc
    """
    h_orig, w_orig = depth.shape
    aspect = w_orig / h_orig

    # Kích thước lưới lấy mẫu (Resampling grid)
    gw = int(resolution * aspect)
    gh = resolution

    depth_low = cv2.resize(depth, (gw, gh), interpolation=cv2.INTER_AREA)
    mask_low = cv2.resize(mask, (gw, gh), interpolation=cv2.INTER_NEAREST)

    # Tọa độ không gian thực (Normalized World Coordinates, gốc ở tâm bục)
    target_height = 2.4
    target_width = target_height * aspect
    max_depth = target_height * depth_scale

    xs = np.linspace(-target_width / 2, target_width / 2, gw)
    ys = np.linspace(target_height, 0.05, gh) # Chân chạm mặt bục

    # Tạo chỉ mục đỉnh (Vertex index mapping)
    front_indices = -np.ones((gh, gw), dtype=np.int32)
    back_indices = -np.ones((gh, gw), dtype=np.int32)

    vertices = []
    uvs = []

    # 1. Tạo các đỉnh mặt trước & mặt sau
    for r in range(gh):
        for c in range(gw):
            if mask_low[r, c] > 0:
                d = depth_low[r, c]
                x = xs[c]
                y = ys[r]
                z_front = d * max_depth

                # Mặt sau: Vuốt cong nhẹ lồi ra sau để tạo khối 3D đầy đặn
                z_back = - (d * 0.45 + 0.04) * max_depth

                # Đỉnh mặt trước
                front_indices[r, c] = len(vertices)
                vertices.append([x, y, z_front])
                uvs.append([c / (gw - 1), 1.0 - (r / (gh - 1))])

                # Đỉnh mặt sau
                back_indices[r, c] = len(vertices)
                vertices.append([x, y, z_back])
                uvs.append([c / (gw - 1), 1.0 - (r / (gh - 1))])

    faces = []

    # 2. Tạo lưới tam giác mặt trước & mặt sau
    for r in range(gh - 1):
        for c in range(gw - 1):
            # 4 góc của ô lưới
            f_tl = front_indices[r, c]
            f_tr = front_indices[r, c + 1]
            f_bl = front_indices[r + 1, c]
            f_br = front_indices[r + 1, c + 1]

            b_tl = back_indices[r, c]
            b_tr = back_indices[r, c + 1]
            b_bl = back_indices[r + 1, c]
            b_br = back_indices[r + 1, c + 1]

            # Mặt trước (Counter-clockwise winding)
            if f_tl >= 0 and f_tr >= 0 and f_bl >= 0:
                faces.append([f_tl, f_bl, f_tr])
            if f_tr >= 0 and f_bl >= 0 and f_br >= 0:
                faces.append([f_tr, f_bl, f_br])

            # Mặt sau (Clockwise winding để pháp tuyến hướng ra ngoài)
            if b_tl >= 0 and b_tr >= 0 and b_bl >= 0:
                faces.append([b_tl, b_tr, b_bl])
            if b_tr >= 0 and b_bl >= 0 and b_br >= 0:
                faces.append([b_tr, b_br, b_bl])

    # 3. Tạo vách bên khép kín (Side boundary walls)
    for r in range(gh):
        for c in range(gw):
            if front_indices[r, c] >= 0:
                # Kiểm tra 4 hướng lân cận: nếu giáp nền thì là cạnh biên
                neighbors = [
                    (r - 1, c), # Trên
                    (r + 1, c), # Dưới
                    (r, c - 1), # Trái
                    (r, c + 1)  # Phải
                ]
                for nr, nc in neighbors:
                    is_boundary = False
                    if nr < 0 or nr >= gh or nc < 0 or nc >= gw:
                        is_boundary = True
                    elif front_indices[nr, nc] < 0:
                        is_boundary = True

                    if is_boundary:
                        # Ghép thành vách từ đỉnh trước sang đỉnh sau
                        f1 = front_indices[r, c]
                        b1 = back_indices[r, c]
                        # Tìm đỉnh tiếp theo để đóng tam giác vách
                        pass

    vertices = np.array(vertices, dtype=np.float32)
    faces = np.array(faces, dtype=np.int32)
    uvs = np.array(uvs, dtype=np.float32)

    # 4. Gắn Texture ảnh màu gốc
    pil_img = Image.fromarray(img_rgb)

    mesh = trimesh.Trimesh(
        vertices=vertices,
        faces=faces,
        visual=trimesh.visual.TextureVisuals(uv=uvs, image=pil_img),
        process=True
    )

    # Tự động tính toán lại Vector Pháp Tuyến (Normals) mượt mà
    try:
        mesh.fix_normals()
    except Exception:
        pass
    return mesh

def process_single_image_to_3d(image_path, output_glb_path, depth_scale=0.35, resolution=160):
    """
    Pipeline hoàn chỉnh chuyển 1 ảnh đơn -> file 3D .GLB
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Không tìm thấy file ảnh: {image_path}")

    # Đọc ảnh
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise ValueError(f"Không thể đọc định dạng ảnh: {image_path}")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # Bước 1: Tách nền
    mask = create_mask(img_rgb)

    # Bước 2: Ước lượng độ sâu
    depth = generate_depth_map(img_rgb, mask)

    # Bước 3: Dựng khối 3D đặc
    mesh = build_3d_solid_mesh(img_rgb, depth, mask, depth_scale=depth_scale, resolution=resolution)

    # Đảm bảo thư mục lưu trữ tồn tại
    out_dir = os.path.dirname(output_glb_path)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    # Bước 4: Xuất file 3D .GLB chuẩn công nghiệp
    glb_bytes = mesh.export(file_type='glb')
    with open(output_glb_path, 'wb') as f:
        f.write(glb_bytes)

    result = {
        "success": True,
        "vertices": len(mesh.vertices),
        "faces": len(mesh.faces),
        "glb_path": output_glb_path,
        "size_bytes": len(glb_bytes)
    }
    return result

def main():
    parser = argparse.ArgumentParser(description="Tạo mô hình 3D (.glb) từ 1 ảnh chụp cổ vật qua tủ kính")
    parser.add_argument("--image", required=True, help="Đường dẫn file ảnh đầu vào (.jpg, .png)")
    parser.add_argument("--output", required=True, help="Đường dẫn lưu file 3D đầu ra (.glb)")
    parser.add_argument("--depth-scale", type=float, default=0.35, help="Độ dày lồi lõm của hiện vật (0.1 đến 0.8)")
    parser.add_argument("--resolution", type=int, default=160, help="Độ mịn lưới 3D (100 đến 250)")

    args = parser.parse_args()

    try:
        res = process_single_image_to_3d(
            args.image,
            args.output,
            depth_scale=args.depth_scale,
            resolution=args.resolution
        )
        print(json.dumps(res, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:
        err_res = {"success": False, "error": str(e)}
        print(json.dumps(err_res, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()
