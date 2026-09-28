"""
Google Colab AI Worker Server (FastAPI + TripoSR)
Chạy trên Google Colab GPU Tesla T4 (15GB VRAM)
Phơi cổng ra ngoài bằng Cloudflare Quick Tunnel (cloudflared)

Tính năng chính:
- Nhận ảnh qua multipart/form-data hoặc image_url từ Backend VPS
- Tự động tách nền (rembg) và căn giữa tỷ lệ đối tượng
- Chạy suy luận mô hình TripoSR trên GPU T4 (~3-5 giây)
- Trích xuất mesh và tối ưu hóa cho Web/Three.js (Y-up, căn gốc toạ độ, chuẩn hoá kích thước)
- Xuất trực tiếp định dạng nhị phân .GLB (chuẩn nén cho web Three.js)
- Tự động dọn dẹp file rác định kỳ (sau 15 phút) & giải phóng VRAM PyTorch
"""

import os
import gc
import time
import glob
import shutil
import threading
from typing import Optional
import numpy as np
from PIL import Image
import torch
import trimesh
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests

# Khởi tạo thư mục làm việc
WORKSPACE_DIR = "/content/workspace"
INPUTS_DIR = os.path.join(WORKSPACE_DIR, "inputs")
OUTPUTS_DIR = os.path.join(WORKSPACE_DIR, "outputs")

os.makedirs(INPUTS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Khởi tạo FastAPI
app = FastAPI(title="TripoSR 3D Generation Worker", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 1. LOAD MODEL TRIPOSR LÊN GPU T4
# -------------------------------------------------------------
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"[*] Đang tải mô hình TripoSR lên thiết bị: {device}...")

from tsr.system import TSR
from tsr.utils import remove_background, resize_foreground, to_gradio_3d_orientation

model = TSR.from_pretrained(
    "stabilityai/TripoSR",
    config_name="config.yaml",
    weight_name="model.ckpt",
)
model.renderer.set_chunk_size(8192)
model.to(device)
print("[✓] Mô hình TripoSR đã sẵn sàng trên GPU Tesla T4!")

# -------------------------------------------------------------
# 2. TIẾN TRÌNH DỌN DẸP RÁC TỰ ĐỘNG (BACKGROUND CLEANER)
# -------------------------------------------------------------
def cleanup_old_files(max_age_seconds: int = 900):
    """Xóa các file inputs và outputs cũ hơn 15 phút để bảo vệ ổ đĩa Colab"""
    while True:
        try:
            now = time.time()
            for folder in [INPUTS_DIR, OUTPUTS_DIR]:
                for root, dirs, files in os.walk(folder, topdown=False):
                    for name in files:
                        file_path = os.path.join(root, name)
                        if os.path.isfile(file_path):
                            if now - os.path.getmtime(file_path) > max_age_seconds:
                                try:
                                    os.remove(file_path)
                                except Exception:
                                    pass
                    for name in dirs:
                        dir_path = os.path.join(root, name)
                        if os.path.isdir(dir_path) and not os.listdir(dir_path):
                            try:
                                os.rmdir(dir_path)
                            except Exception:
                                pass
        except Exception as e:
            print(f"[Cleaner Warning]: {e}")
        time.sleep(300)  # Quét dọn mỗi 5 phút

cleaner_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleaner_thread.start()

# -------------------------------------------------------------
# 3. HÀM TỐI ƯU HÓA MESH THÀNH FILE .GLB CHUẨN THREE.JS
# -------------------------------------------------------------
def optimize_and_export_glb(mesh: trimesh.Trimesh, output_glb_path: str, max_faces: int = 80000) -> str:
    """
    Tối ưu hóa hình học cho WebGL / Three.js:
    - Xoay hướng chuẩn (Y-up, chính diện)
    - Căn tâm đối tượng về gốc toạ độ (0, 0, 0)
    - Chuẩn hóa kích thước hộp bao về tỷ lệ chuẩn
    - Giảm số lượng đa giác (Decimation) nếu lưới quá nặng (> 80k faces)
    - Xuất file nhị phân .GLB
    """
    # 1. Chuyển đổi hệ toạ độ theo chuẩn hiển thị TripoSR -> Three.js
    mesh = to_gradio_3d_orientation(mesh)

    # 2. Căn giữa gốc toạ độ (Center origin)
    bbox_min, bbox_max = mesh.bounds
    center = (bbox_min + bbox_max) / 2.0
    mesh.vertices -= center

    # 3. Chuẩn hóa kích thước lớn nhất về 1.2 mét (chuẩn tỷ lệ hiển thị di sản)
    max_extent = np.ptp(mesh.vertices, axis=0).max()
    if max_extent > 0:
        scale_factor = 1.2 / max_extent
        mesh.vertices *= scale_factor

    # 4. Tối ưu đa giác nếu quá nặng để tải mượt trên trình duyệt điện thoại/web
    if len(mesh.faces) > max_faces:
        try:
            print(f"[*] Đang tối ưu lưới từ {len(mesh.faces)} mặt xuống ~{max_faces} mặt...")
            mesh = mesh.simplify_quadric_decimation(face_count=max_faces)
        except Exception as sim_err:
            print(f"[!] Bỏ qua bước decimation: {sim_err}")

    # 5. Xuất file GLB (glTF Binary)
    mesh.export(output_glb_path, file_type="glb")
    return output_glb_path

# -------------------------------------------------------------
# 4. API ENDPOINTS
# -------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "service": "TripoSR AI 3D Worker",
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "status": "ready"
    }

@app.get("/health")
def health_check():
    """Kiểm tra tình trạng tài nguyên GPU T4 và trạng thái AI Worker"""
    gpu_allocated_mb = 0
    gpu_name = "CPU"
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_allocated_mb = round(torch.cuda.memory_allocated(0) / 1024 / 1024, 1)

    return {
        "ok": True,
        "status": "ready",
        "device": f"{gpu_name} (Free VRAM: {round((15360 - gpu_allocated_mb)/1024, 1)} GB)",
        "model": "VAST-AI-Research/TripoSR",
        "gpu_allocated_mb": gpu_allocated_mb,
        "message": "AI Worker sẵn sàng nhận yêu cầu dựng mô hình 3D"
    }

@app.post("/generate-3d")
async def generate_3d(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    job_id: Optional[str] = Form(None),
    foreground_ratio: float = Form(0.85),
    mc_resolution: int = Form(256),
    do_remove_background: bool = Form(True)
):
    """
    Sinh mô hình 3D từ ảnh và trả về trực tiếp file nhị phân .GLB
    """
    current_job_id = job_id or f"job_{int(time.time())}_{os.urandom(3).hex()}"
    input_image_path = os.path.join(INPUTS_DIR, f"{current_job_id}.png")
    job_output_dir = os.path.join(OUTPUTS_DIR, current_job_id)
    os.makedirs(job_output_dir, exist_ok=True)
    output_glb_path = os.path.join(job_output_dir, "mesh.glb")

    # 1. Nhận ảnh đầu vào
    if file and file.filename:
        with open(input_image_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    elif image_url:
        resp = requests.get(image_url, timeout=20)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Không thể tải ảnh từ URL cung cấp")
        with open(input_image_path, "wb") as f:
            f.write(resp.content)
    else:
        raise HTTPException(status_code=400, detail="Cần cung cấp file ảnh hoặc image_url")

    # 2. Xử lý ảnh đầu vào
    try:
        pil_image = Image.open(input_image_path).convert("RGB")
        print(f"[*] Bắt đầu xử lý Job {current_job_id} ({pil_image.size[0]}x{pil_image.size[1]})...")

        # 2.1 Tách nền nếu cần
        if do_remove_background:
            print("[*] Đang tách nền vật thể bằng rembg...")
            pil_image = remove_background(pil_image, rembg_session=None)
            pil_image = resize_foreground(pil_image, foreground_ratio)

        # 3. Suy luận mô hình TripoSR trên GPU T4
        t0 = time.time()
        with torch.no_grad():
            scene_codes = model(pil_image, device=device)
            # Trích xuất lưới Marching Cubes
            meshes = model.extract_mesh(scene_codes, resolution=mc_resolution, threshold=25.0)

        mesh = meshes[0]
        gen_time = round(time.time() - t0, 2)
        print(f"[✓] TripoSR đã sinh mesh thành công trong {gen_time}s! Đang xuất file .GLB...")

        # 4. Tối ưu hoá và lưu file .GLB
        optimize_and_export_glb(mesh, output_glb_path)
        file_size_mb = round(os.path.getsize(output_glb_path) / 1024 / 1024, 2)
        print(f"[✓] File GLB hoàn tất: {output_glb_path} ({file_size_mb} MB)")

        # 5. Giải phóng bộ nhớ VRAM PyTorch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()

        # 6. Trả file nhị phân về cho máy chủ VPS
        return FileResponse(
            path=output_glb_path,
            media_type="model/gltf-binary",
            filename=f"{current_job_id}.glb",
            headers={
                "X-Job-ID": current_job_id,
                "X-Generation-Time-Seconds": str(gen_time),
                "X-Model-Size-MB": str(file_size_mb)
            }
        )

    except Exception as e:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        print(f"[!] Lỗi tiến trình 3D: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo mô hình 3D: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
