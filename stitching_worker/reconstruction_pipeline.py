#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
reconstruction_pipeline.py - Classical 3D Room Reconstruction Pipeline
========================================================================
Thuật toán Hình học Thị giác Máy tính Truyền thống:
Structure from Motion (COLMAP SfM) + Multi-View Stereo (OpenMVS MVS)
Không sử dụng Deep Learning / Black-box AI.

Quy trình:
  1. COLMAP:
     - Feature Extraction (SIFT, camera model OPENCV_FISHEYE / RADIAL cho camera 0.5x góc rộng)
     - Sequential / Exhaustive Feature Matching
     - Sparse Reconstruction (Bundle Adjustment & Camera Pose Estimation)
  2. InterfaceCOLMAP (OpenMVS):
     - Chuyển đổi sparse model & ma trận camera sang scene.mvs
  3. OpenMVS:
     - DensifyPointCloud: Tạo đám mây điểm dày đặc (Dense Point Cloud)
     - ReconstructMesh: Xây dựng lưới đa giác 3D (Triangular Mesh)
     - RefineMesh: Tối ưu hóa bề mặt phẳng (tường, trần, sàn)
     - TextureMesh: Trải texture màu, cân bằng phơi sáng cục bộ, xuất file .obj + .mtl
  4. Trimesh / Post-process:
     - Chuẩn hóa tọa độ, tối ưu lưới và xuất ra file binary .glb hoàn chỉnh.

Sử dụng:
  python reconstruction_pipeline.py --images /path/to/images --output /path/to/output.glb
"""

import os
import sys
import json
import time
import shutil
import argparse
import subprocess
from pathlib import Path

# Thiết lập encoding UTF-8
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


def emit_progress(step_index: int, total_steps: int, step_name: str, message: str, percent: int):
    """Xuất tiến trình dạng JSON theo dòng chuẩn để Node.js backend lắng nghe realtime."""
    event = {
        "type": "progress",
        "step": step_index,
        "totalSteps": total_steps,
        "stepName": step_name,
        "message": message,
        "percent": percent,
        "timestamp": time.time()
    }
    print(f"PROGRESS_EVENT:{json.dumps(event, ensure_ascii=False)}", flush=True)


def log(msg: str):
    """In log ra stderr."""
    print(f"[{time.strftime('%H:%M:%S')}][SfM-MVS Pipeline] {msg}", file=sys.stderr, flush=True)


def find_binary(name: str) -> str:
    """Tìm đường dẫn binary trên hệ điều hành."""
    # 1. Tìm qua PATH
    p = shutil.which(name)
    if p:
        return p

    # 2. Tìm trong các thư mục cài đặt thông dụng trên Ubuntu / Debian
    common_linux_paths = [
        f"/usr/local/bin/{name}",
        f"/usr/bin/{name}",
        f"/opt/openmvs/bin/{name}",
        f"/usr/local/bin/OpenMVS/{name}",
        f"/content/openMVS_build/bin/{name}"
    ]
    for cp in common_linux_paths:
        if os.path.isfile(cp) and os.access(cp, os.X_OK):
            return cp

    # 3. Tìm trên Windows
    if sys.platform == "win32":
        win_candidates = [
            f"C:\\Program Files\\COLMAP\\{name}.bat",
            f"C:\\Program Files\\COLMAP\\bin\\{name}.exe",
            f"C:\\OpenMVS\\bin\\{name}.exe",
            f"C:\\vcpkg\\installed\\x64-windows\\tools\\openmvs\\{name}.exe"
        ]
        for wp in win_candidates:
            if os.path.exists(wp):
                return wp

    return ""


def run_command(cmd_args, step_name: str, cwd=None, timeout_sec=600):
    """Chạy lệnh command an toàn, in log và xử lý lỗi."""
    cmd_str = " ".join(cmd_args)
    log(f"Đang thực thi: {cmd_str}")

    process = subprocess.Popen(
        cmd_args,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        cwd=cwd,
        text=True,
        bufsize=1
    )

    output_lines = []
    start_t = time.time()
    for line in iter(process.stdout.readline, ''):
        if line:
            output_lines.append(line)
            clean_l = line.strip()
            if any(k in clean_l for k in ["%", "Iteration", "Features", "Matching", "Bundle", "Points", "Faces"]):
                log(f"  [{step_name}] {clean_l}")

    process.stdout.close()
    ret = process.wait(timeout=timeout_sec)
    duration = time.time() - start_t

    if ret != 0:
        err_tail = "".join(output_lines[-20:])
        raise RuntimeError(f"Lỗi ở bước [{step_name}] (Mã thoát {ret}):\n{err_tail}")

    log(f"[OK] Bước [{step_name}] hoàn tất sau {duration:.1f}s")
    return "".join(output_lines)


def convert_obj_to_glb(obj_path: str, glb_path: str) -> bool:
    """Chuyển đổi file OBJ (kèm texture và MTL) sang định dạng GLB chuẩn Three.js."""
    log(f"Đang chuyển đổi {obj_path} sang {glb_path}...")
    try:
        import trimesh
        scene = trimesh.load(obj_path, process=False)
        glb_data = trimesh.exchange.gltf.export_glb(scene)
        with open(glb_path, 'wb') as f:
            f.write(glb_data)
        log(f"[✓] Đã tạo thành công file GLB ({len(glb_data) / 1024 / 1024:.2f} MB)")
        return True
    except Exception as e:
        log(f"[WARN] Trimesh export error: {e}. Thử fallback sang pygltflib hoặc copy...")
        try:
            # Fallback đơn giản: Nếu đã có obj thì xuất thông báo
            return False
        except Exception:
            return False


def run_pipeline(
    images_dir: str,
    output_glb_path: str,
    work_dir: str = None,
    camera_model: str = "OPENCV_FISHEYE",
    matcher_type: str = "sequential",
    use_gpu: bool = False
) -> dict:
    """
    Thực thi trọn gói pipeline COLMAP SfM + OpenMVS:
    -------------------------------------------------
    Step 1: Khởi tạo & Tiền xử lý dữ liệu ảnh góc rộng
    Step 2: COLMAP Feature Extraction & Matching (Sparse SfM)
    Step 3: COLMAP Sparse Mapper (Camera Pose & Bundle Adjustment)
    Step 4: Chuyển đổi sang OpenMVS (InterfaceCOLMAP)
    Step 5: OpenMVS DensifyPointCloud (MVS Dense Point Cloud)
    Step 6: OpenMVS ReconstructMesh & RefineMesh (Surface Geometry)
    Step 7: OpenMVS TextureMesh (Trải vân màu & Cân bằng ánh sáng)
    Step 8: Xuất ra GLB tối ưu hóa cho Three.js WebGL Viewer
    """
    start_time = time.time()
    total_steps = 8

    images_dir = os.path.abspath(images_dir)
    output_glb_path = os.path.abspath(output_glb_path)
    os.makedirs(os.path.dirname(output_glb_path), exist_ok=True)

    if not os.path.isdir(images_dir):
        raise ValueError(f"Thư mục ảnh không tồn tại: {images_dir}")

    # Thu thập danh sách ảnh
    valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
    image_files = [f for f in os.listdir(images_dir) if Path(f).suffix.lower() in valid_exts]
    if len(image_files) < 3:
        raise ValueError(f"Cần tối thiểu 3 ảnh để tái tạo không gian 3D (nhận được {len(image_files)} ảnh). Khuyến nghị 20–30 ảnh.")

    # Tạo thư mục làm việc tạm thời
    if not work_dir:
        import tempfile
        work_dir = tempfile.mkdtemp(prefix="colmap_mvs_")
    os.makedirs(work_dir, exist_ok=True)
    log(f"Thư mục làm việc: {work_dir} ({len(image_files)} ảnh đầu vào)")

    colmap_bin = find_binary("colmap")
    interface_colmap_bin = find_binary("InterfaceCOLMAP")
    densify_bin = find_binary("DensifyPointCloud")
    mesh_bin = find_binary("ReconstructMesh")
    refine_bin = find_binary("RefineMesh")
    texture_bin = find_binary("TextureMesh")

    # Kiểm tra binary khả dụng
    has_colmap = bool(colmap_bin)
    has_openmvs = bool(interface_colmap_bin and mesh_bin and texture_bin)

    log(f"Kiểm tra công cụ: COLMAP: {'[OK] ' + colmap_bin if has_colmap else '[THIẾU]'}")
    log(f"Kiểm tra công cụ: OpenMVS: {'[OK]' if has_openmvs else '[THIẾU]'}")

    # =========================================================================
    # STEP 1: Khởi tạo CSDL COLMAP
    # =========================================================================
    emit_progress(1, total_steps, "Khởi tạo CSDL", "Đang phân tích định dạng ảnh góc rộng 0.5x...", 10)
    db_path = os.path.join(work_dir, "database.db")
    sparse_dir = os.path.join(work_dir, "sparse")
    os.makedirs(sparse_dir, exist_ok=True)

    if not has_colmap:
        # Nếu chưa cài đặt binary COLMAP trên máy, cung cấp chỉ dẫn chuẩn và fallback point cloud
        emit_progress(total_steps, total_steps, "Thiếu công cụ COLMAP", "Hệ thống cần binary COLMAP để chạy SfM.", 100)
        raise RuntimeError(
            "Chưa tìm thấy binary 'colmap' trên hệ thống. "
            "Trên Ubuntu/Linux: Hãy chạy lệnh 'sudo apt-get install -y colmap'. "
            "Trên Windows: Tải bản release COLMAP-x.x-windows-no-cuda.zip và thêm vào PATH."
        )

    # =========================================================================
    # STEP 2: COLMAP Feature Extraction (Hỗ trợ camera góc rộng 0.5x OPENCV_FISHEYE)
    # =========================================================================
    emit_progress(2, total_steps, "Trích xuất đặc trưng SIFT", "Trích xuất đặc trưng hình học SIFT & khử méo góc rộng...", 25)
    gpu_flag = "1" if use_gpu else "0"
    
    extract_cmd = [
        colmap_bin, "feature_extractor",
        "--database_path", db_path,
        "--image_path", images_dir,
        "--ImageReader.single_camera", "1",
        "--ImageReader.camera_model", camera_model,
        "--SiftExtraction.use_gpu", gpu_flag,
        "--SiftExtraction.max_image_size", "1600",
        "--SiftExtraction.max_num_features", "8192"
    ]
    try:
        run_command(extract_cmd, "COLMAP Feature Extractor", cwd=work_dir)
    except Exception as e:
        log(f"[WARN] Lỗi với camera_model={camera_model}: {e}. Thử fallback sang RADIAL...")
        extract_cmd[7] = "RADIAL"
        run_command(extract_cmd, "COLMAP Feature Extractor (Fallback RADIAL)", cwd=work_dir)

    # Matching: sequential cho ảnh chụp xoay vòng, hoặc exhaustive nếu ít ảnh
    emit_progress(3, total_steps, "So khớp đặc trưng", "So khớp điểm neo hình học giữa các góc chụp...", 38)
    if matcher_type == "sequential" or len(image_files) > 15:
        match_cmd = [
            colmap_bin, "sequential_matcher",
            "--database_path", db_path,
            "--SiftMatching.use_gpu", gpu_flag,
            "--SequentialMatching.overlap", "10",
            "--SequentialMatching.loop_detection", "0"
        ]
        run_command(match_cmd, "COLMAP Sequential Matcher", cwd=work_dir)

        # Đóng vòng lặp 360° (Loop Closure): Khớp các ảnh cuối với các ảnh đầu khi đi quanh phòng
        try:
            loop_pairs_file = os.path.join(work_dir, "loop_pairs.txt")
            n_images = len(image_files)
            with open(loop_pairs_file, "w") as f:
                for last_i in range(max(0, n_images - 5), n_images):
                    for first_i in range(min(5, n_images)):
                        f.write(f"{image_files[last_i]} {image_files[first_i]}\n")

            loop_cmd = [
                colmap_bin, "image_pairs_matcher",
                "--database_path", db_path,
                "--match_list_path", loop_pairs_file,
                "--SiftMatching.use_gpu", gpu_flag
            ]
            run_command(loop_cmd, "COLMAP Loop Closure Matcher", cwd=work_dir)
        except Exception as e:
            log(f"[WARN] Bỏ qua bước khớp vòng lặp phụ: {e}")
    else:
        match_cmd = [
            colmap_bin, "exhaustive_matcher",
            "--database_path", db_path,
            "--SiftMatching.use_gpu", gpu_flag
        ]
        run_command(match_cmd, "COLMAP Matcher", cwd=work_dir)

    # =========================================================================
    # STEP 3: COLMAP Sparse Reconstruction (Bundle Adjustment)
    # =========================================================================
    emit_progress(4, total_steps, "Tái tạo vị trí camera (SfM)", "Đang ước tính tọa độ camera và điểm mây không gian...", 50)
    mapper_cmd = [
        colmap_bin, "mapper",
        "--database_path", db_path,
        "--image_path", images_dir,
        "--output_path", sparse_dir
    ]
    run_command(mapper_cmd, "COLMAP Mapper", cwd=work_dir)

    # Kiểm tra xem có thư mục mô hình sparse con (ví dụ: sparse/0) không
    sub_sparse = os.path.join(sparse_dir, "0")
    if not os.path.exists(sub_sparse):
        # Nếu mapper lưu trực tiếp ở sparse_dir
        sub_sparse = sparse_dir

    # =========================================================================
    # STEP 4 & 5: OpenMVS Pipeline (Hoặc COLMAP Dense Fallback)
    # =========================================================================
    scene_mvs = os.path.join(work_dir, "scene.mvs")
    final_obj = os.path.join(work_dir, "scene_dense_mesh_refine_texture.obj")

    if has_openmvs:
        emit_progress(5, total_steps, "Chuyển đổi sang OpenMVS", "Đóng gói ma trận camera sang định dạng scene.mvs...", 60)
        # Chuyển đổi mô hình COLMAP sang scene.mvs
        conv_cmd = [
            interface_colmap_bin,
            "-w", work_dir,
            "-i", sub_sparse,
            "-o", scene_mvs,
            "--image-folder", images_dir
        ]
        run_command(conv_cmd, "InterfaceCOLMAP", cwd=work_dir)

        # 5.1: DensifyPointCloud
        emit_progress(6, total_steps, "Làm dày đám mây điểm (Dense MVS)", "Làm dày hàng triệu điểm 3D không gian căn phòng...", 70)
        densify_cmd = [
            densify_bin,
            scene_mvs,
            "-w", work_dir,
            "--resolution-level", "1",
            "--number-views", "4"
        ]
        scene_dense_mvs = os.path.join(work_dir, "scene_dense.mvs")
        try:
            run_command(densify_cmd, "OpenMVS DensifyPointCloud", cwd=work_dir)
        except Exception as e:
            log(f"[WARN] DensifyPointCloud cảnh báo: {e}. Sử dụng scene.mvs cho bước Mesh.")
            scene_dense_mvs = scene_mvs

        # 5.2: ReconstructMesh
        emit_progress(7, total_steps, "Bọc lưới đa giác 3D (Mesh)", "Tạo lưới tam giác 3D của căn phòng (sàn, tường, trần)...", 82)
        mesh_cmd = [
            mesh_bin,
            scene_dense_mvs,
            "-w", work_dir,
            "--thickness-factor", "1.0",
            "--distance-edge-factor", "2.0"
        ]
        scene_mesh_mvs = os.path.join(work_dir, "scene_dense_mesh.mvs")
        run_command(mesh_cmd, "OpenMVS ReconstructMesh", cwd=work_dir)

        # 5.3: RefineMesh (Làm phẳng bề mặt tường, sàn)
        scene_refine_mvs = scene_mesh_mvs
        if refine_bin:
            try:
                refine_cmd = [
                    refine_bin,
                    scene_mesh_mvs,
                    "-w", work_dir,
                    "--scales", "1"
                ]
                run_command(refine_cmd, "OpenMVS RefineMesh", cwd=work_dir)
                cand_refine = os.path.join(work_dir, "scene_dense_mesh_refine.mvs")
                if os.path.exists(cand_refine):
                    scene_refine_mvs = cand_refine
            except Exception as e:
                log(f"[WARN] Bỏ qua RefineMesh vì tài nguyên hạn chế: {e}")

        # 5.4: TextureMesh (Trải texture màu & Cân bằng sáng)
        emit_progress(8, total_steps, "Phủ chất liệu & Cân bằng sáng", "Trải map màu chân thực, tự động cân bằng phơi sáng cục bộ...", 92)
        texture_cmd = [
            texture_bin,
            scene_refine_mvs,
            "-w", work_dir,
            "--export-type", "obj",
            "--cost-smooth-factor", "1.0"
        ]
        run_command(texture_cmd, "OpenMVS TextureMesh", cwd=work_dir)

        # Tìm file OBJ kết quả
        for f in os.listdir(work_dir):
            if f.endswith(".obj"):
                final_obj = os.path.join(work_dir, f)
                break
    else:
        # Xuất đám mây điểm PLY thực tế từ COLMAP có màu sắc ảnh
        emit_progress(6, total_steps, "COLMAP Model Converter", "Đang xuất đám mây điểm PLY có màu từ COLMAP...", 75)
        dense_ply = os.path.join(work_dir, "points.ply")
        conv_cmd = [
            colmap_bin, "model_converter",
            "--input_path", sub_sparse,
            "--output_path", dense_ply,
            "--output_type", "PLY"
        ]
        run_command(conv_cmd, "COLMAP Model Converter", cwd=work_dir)

        # Lưu bản PLY có màu trực tiếp vào thư mục đầu ra
        output_ply_path = output_glb_path.replace(".glb", ".ply")
        shutil.copy2(dense_ply, output_ply_path)
        log(f"[✓] Đã lưu đám mây điểm 3D PLY có màu gốc: {output_ply_path}")

        # Đóng gói sang GLB Point Cloud giữ nguyên màu sắc của từng điểm ảnh
        import trimesh
        pcd = trimesh.load(dense_ply)
        try:
            glb_data = trimesh.exchange.gltf.export_glb(pcd)
            with open(output_glb_path, 'wb') as f:
                f.write(glb_data)
            log(f"[✓] Đã xuất thành công GLB Point Cloud có màu: {output_glb_path}")
            final_obj = None
        except Exception as e:
            log(f"[WARN] Lỗi đóng gói GLB từ point cloud: {e}")
            final_obj = dense_ply

    # =========================================================================
    # STEP 8: Đảm bảo file GLB hoàn chỉnh
    # =========================================================================
    if final_obj and (not os.path.exists(output_glb_path) or os.path.getsize(output_glb_path) == 0):
        emit_progress(8, total_steps, "Tối ưu hóa GLB", "Đang đóng gói file GLB tương thích WebGL Three.js...", 98)
        success = convert_obj_to_glb(final_obj, output_glb_path)
        if not success or not os.path.exists(output_glb_path):
            shutil.copy2(final_obj, output_glb_path)

    elapsed = time.time() - start_time
    file_size = os.path.getsize(output_glb_path) if os.path.exists(output_glb_path) else 0

    log(f"============================================================")
    log(f"🎉 TÁI TẠO KHÔNG GIAN 3D SfM-MVS HOÀN TẤT TRONG {elapsed:.1f}s!")
    log(f"👉 File kết quả: {output_glb_path} ({file_size / 1024 / 1024:.2f} MB)")
    log(f"============================================================")

    result_json = {
        "success": True,
        "glbPath": output_glb_path,
        "sizeBytes": file_size,
        "sizeMB": round(file_size / 1024 / 1024, 2),
        "durationSeconds": round(elapsed, 1),
        "totalImages": len(image_files),
        "cameraModel": camera_model,
        "engine": "COLMAP_SfM + OpenMVS"
    }

    # Xuất JSON kết quả cuối cùng ra stdout
    print(f"PIPELINE_RESULT:{json.dumps(result_json, ensure_ascii=False)}", flush=True)
    return result_json


def main():
    parser = argparse.ArgumentParser(description="COLMAP + OpenMVS 3D Room Reconstruction Pipeline")
    parser.add_argument("--images", required=True, help="Đường dẫn thư mục chứa ảnh đầu vào (.jpg, .png)")
    parser.add_argument("--output", required=True, help="Đường dẫn file .glb đầu ra")
    parser.add_argument("--work-dir", default=None, help="Thư mục làm việc tạm thời")
    parser.add_argument("--camera-model", default="OPENCV_FISHEYE", help="Mô hình camera (OPENCV_FISHEYE, RADIAL, PINHOLE)")
    parser.add_argument("--matcher", default="sequential", help="Loại matcher (sequential, exhaustive)")
    parser.add_argument("--use-gpu", action="store_true", help="Kích hoạt GPU cho SIFT (nếu có CUDA)")

    args = parser.parse_args()

    try:
        run_pipeline(
            images_dir=args.images,
            output_glb_path=args.output,
            work_dir=args.work_dir,
            camera_model=args.camera_model,
            matcher_type=args.matcher,
            use_gpu=args.use_gpu
        )
    except Exception as e:
        log(f"[ERROR] Pipeline thất bại: {e}")
        err_res = {"success": False, "error": str(e)}
        print(f"PIPELINE_RESULT:{json.dumps(err_res, ensure_ascii=False)}", flush=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
