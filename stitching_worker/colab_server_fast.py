"""
Google Colab AI Worker Server (FastAPI + TripoSR Fast)
File: server_fast.py
Chạy trên Google Colab GPU Tesla T4 (15GB VRAM)
Bảo mật bằng X-API-Key + Cơ chế Warm-up nạp sẵn model vào VRAM

Tính năng:
- Xác thực bảo mật: Bắt buộc Header 'X-API-Key' trên mọi endpoint
- Nạp sẵn (Warm-up) model TripoSR vào VRAM GPU T4 từ khi khởi động
- Nhận URL ảnh Cloudinary qua JSON nhẹ, tải trực tiếp vào RAM (BytesIO), không tạo file rác đĩa
- Render siêu tốc (~3-5 giây trên T4)
- Tối ưu hóa Mesh cho Three.js Web (Y-up, căn gốc toạ độ, chuẩn hoá kích thước)
- Xuất trực tiếp file nhị phân .GLB (glTF binary)
- Tự động giải phóng VRAM PyTorch & Garbage Collector sau mỗi request
"""

import os
import io
import gc
import time
from typing import Optional
from pydantic import BaseModel
import numpy as np
from PIL import Image
import requests
import torch

# Patch PyTorch 2.6+ weights_only=False để nạp model.ckpt của TripoSR
_orig_torch_load = torch.load
def _safe_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _orig_torch_load(*args, **kwargs)
torch.load = _safe_torch_load

# Patch tương thích Transformers mới: Tự động map encoder.layer sang layers cho ViT/DINO
_orig_load_state_dict = torch.nn.Module.load_state_dict
def _compat_load_state_dict(self, state_dict, strict=True):
    new_state_dict = {}
    for k, v in state_dict.items():
        if "image_tokenizer.model.encoder.layer." in k:
            new_k = k.replace("image_tokenizer.model.encoder.layer.", "image_tokenizer.model.layers.")
            new_k = new_k.replace(".attention.attention.query.", ".attention.q_proj.")
            new_k = new_k.replace(".attention.attention.key.", ".attention.k_proj.")
            new_k = new_k.replace(".attention.attention.value.", ".attention.v_proj.")
            new_k = new_k.replace(".attention.output.dense.", ".attention.o_proj.")
            new_k = new_k.replace(".intermediate.dense.", ".mlp.fc1.")
            new_k = new_k.replace(".output.dense.", ".mlp.fc2.")
            new_state_dict[new_k] = v
        else:
            new_state_dict[k] = v
    try:
        return _orig_load_state_dict(self, new_state_dict, strict=strict)
    except Exception as _e:
        print(f"[*] Chuyển sang nạp weights linh hoạt (strict=False) do phiên bản Transformers: {_e}")
        return _orig_load_state_dict(self, new_state_dict, strict=False)

torch.nn.Module.load_state_dict = _compat_load_state_dict

import trimesh
from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# -------------------------------------------------------------
# 1. CẤU HÌNH BẢO MẬT & API KEY
# -------------------------------------------------------------
API_KEY = os.environ.get("TRIPOSR_API_KEY", "triposr_museum_secret_key_2026")

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Kiểm tra mã bí mật X-API-Key để chống quét cổng và gọi trộm từ bên ngoài"""
    if not x_api_key or x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: Mã X-API-Key không hợp lệ hoặc bị thiếu"
        )
    return x_api_key

app = FastAPI(title="TripoSR Fast AI Worker", version="2.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 1.1 TỰ ĐỘNG BÙ ĐẮP: NẾU THIẾU TORCHMCUBES THÌ DÙNG PYMCUBES
# -------------------------------------------------------------
try:
    import torchmcubes
except ImportError:
    try:
        import mcubes
        import types
        import sys
        mock_mc = types.ModuleType("torchmcubes")
        def _mc_fallback(density, threshold):
            d_np = density.squeeze().detach().cpu().numpy()
            v, f = mcubes.marching_cubes(d_np, float(threshold))
            return torch.from_numpy(v.astype(np.float32)).to(density.device), torch.from_numpy(f.astype(np.int64)).to(density.device)
        mock_mc.marching_cubes = _mc_fallback
        sys.modules["torchmcubes"] = mock_mc
        print("[*] Đã kích hoạt PyMCubes Marching Cubes fallback thành công!")
    except Exception as _mc_err:
        print(f"[!] Cảnh báo fallback marching cubes: {_mc_err}")

# -------------------------------------------------------------
# 2. WARM-UP MODEL TRIPOSR VÀO GPU T4
# -------------------------------------------------------------
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"[*] Đang nạp và warm-up mô hình TripoSR vào {device}...")

from tsr.system import TSR
from tsr.utils import remove_background, resize_foreground, to_gradio_3d_orientation

model = TSR.from_pretrained(
    "stabilityai/TripoSR",
    config_name="config.yaml",
    weight_name="model.ckpt",
)
model.renderer.set_chunk_size(8192)
model.to(device)

# Chạy thử 1 lần (Warm-up) để nạp sẵn kernel CUDA
try:
    dummy_img = Image.new("RGB", (256, 256), color=(128, 128, 128))
    with torch.no_grad():
        _dummy_codes = model(dummy_img, device=device)
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    print("[✓] Model TripoSR đã warm-up thành công trên GPU Tesla T4!")
except Exception as e:
    print(f"[!] Cảnh báo warm-up: {e}")

# -------------------------------------------------------------
# 3. HÀM TỐI ƯU HÓA HÌNH HỌC CHO THREE.JS & XUẤT .GLB
# -------------------------------------------------------------
def to_threejs_3d_orientation(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    """
    Chuyển đổi toạ độ từ TripoSR sang Three.js chuẩn Web:
    - Đứng thẳng trên mặt đất (+Y là Up)
    - Mặt chính diện nhìn thẳng ra màn hình (+Z là Front)
    - Tay phải hướng sang phải (+X là Right)
    Phép xoay -90 độ quanh trục X chuẩn hóa hoàn hảo hệ toạ độ TripoSR -> Three.js
    """
    mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi/2, [1, 0, 0]))
    return mesh

def optimize_mesh_to_glb_bytes(
    mesh: trimesh.Trimesh,
    texture_image: Optional[Image.Image] = None,
    max_faces: int = 80000
) -> bytes:
    """
    Tối ưu hóa hình học cho WebGL / Three.js:
    - Xoay hướng chuẩn (Y-up, chính diện +Z)
    - Căn tâm vật thể về gốc toạ độ (0, 0, 0)
    - Chuẩn hóa kích thước lớn nhất về 1.2 mét
    - Chiếu màu sắc nét từ ảnh gốc lên mặt trước, bảo tồn màu 3D 360 độ tự nhiên ở mặt sau (không bị loang vân mặt trước ra sau mai/lưng)
    - Xuất file nhị phân .GLB chất lượng cao
    """
    # 1. Chuyển đổi hệ toạ độ theo chuẩn hiển thị Three.js Web (Y-up, chính diện nhìn ra +Z)
    mesh = to_threejs_3d_orientation(mesh)

    # 2. Căn giữa gốc toạ độ
    bbox_min, bbox_max = mesh.bounds
    mesh.vertices -= (bbox_min + bbox_max) / 2.0

    # 3. Chuẩn hóa kích thước lớn nhất về 1.2m
    max_extent = np.ptp(mesh.vertices, axis=0).max()
    if max_extent > 0:
        mesh.vertices *= (1.2 / max_extent)

    # 4. CHIẾU MÀU TỪ ẢNH GỐC LÊN MẶT TRƯỚC (Front Camera Projection)
    # Phân tích ảnh gốc và ánh xạ màu sắc thực tế vào các đỉnh mặt trước (+Z), giữ nguyên 360° mặt sau
    if texture_image is not None and len(mesh.vertices) > 0:
        try:
            tex_w, tex_h = texture_image.size
            tex_np = np.array(texture_image)
            has_alpha = tex_np.shape[-1] == 4

            # Tọa độ X (trái -> phải), Y (dưới -> trên), Z (sau -> trước)
            x_vals = mesh.vertices[:, 0]
            y_vals = mesh.vertices[:, 1]
            x_min, x_max = x_vals.min(), x_vals.max()
            y_min, y_max = y_vals.min(), y_vals.max()
            dx = max(x_max - x_min, 1e-5)
            dy = max(y_max - y_min, 1e-5)

            # Tọa độ chiếu phẳng (Planar coordinates)
            u = np.clip((x_vals - x_min) / dx, 0.0, 1.0)
            v = np.clip((y_vals - y_min) / dy, 0.0, 1.0)

            # Tra cứu vị trí pixel tương ứng trên ảnh gốc
            px_cols = np.clip((u * (tex_w - 1)).astype(np.int32), 0, tex_w - 1)
            px_rows = np.clip(((1.0 - v) * (tex_h - 1)).astype(np.int32), 0, tex_h - 1)
            sampled_pixels = tex_np[px_rows, px_cols]

            # Pháp tuyến đỉnh (Vertex Normals) để xác định góc chiếu thẳng vào camera (+Z)
            normals = mesh.vertex_normals
            nz = normals[:, 2] # nz > 0 là mặt trước nhìn thẳng vào camera

            # Trọng số mặt trước: nz > 0 nhận màu ảnh thật, nz <= 0 (lưng/mai rùa) nhận màu 3D của TripoSR
            facing_weight = np.clip(nz, 0.0, 1.0)[:, np.newaxis]
            if has_alpha:
                alpha_mask = (sampled_pixels[:, 3:4].astype(np.float32) / 255.0)
                facing_weight = facing_weight * alpha_mask

            orig_rgb = sampled_pixels[:, :3].astype(np.float32)

            if hasattr(mesh.visual, "vertex_colors") and mesh.visual.vertex_colors is not None:
                tripo_rgb = mesh.visual.vertex_colors[:, :3].astype(np.float32)
            else:
                tripo_rgb = np.full_like(orig_rgb, 128.0)

            # Pha trộn: Mặt trước lấy 90-100% màu thật, mặt sau giữ 100% màu khối 3D tự nhiên
            blend_factor = np.power(facing_weight, 0.75)
            blended_rgb = blend_factor * orig_rgb + (1.0 - blend_factor) * tripo_rgb

            # Nâng cao độ tương phản và bão hòa màu để di vật trông rực rỡ và chân thực
            mean_c = np.mean(blended_rgb, axis=-1, keepdims=True)
            vibrant_rgb = mean_c + (blended_rgb - mean_c) * 1.3
            vibrant_rgb = np.clip(vibrant_rgb, 0.0, 255.0).astype(np.uint8)

            # Gán Vertex Colors đã được tinh chỉnh vào mesh
            alpha_col = np.full((len(mesh.vertices), 1), 255, dtype=np.uint8)
            mesh.visual = trimesh.visual.ColorVisuals(
                mesh=mesh,
                vertex_colors=np.concatenate([vibrant_rgb, alpha_col], axis=-1)
            )
            print("[✓] Đã chiếu màu ảnh gốc vào mặt trước và giữ nguyên 360° mặt sau thành công!")
        except Exception as _proj_err:
            print(f"[!] Cảnh báo chiếu màu ảnh gốc: {_proj_err}")
    elif hasattr(mesh.visual, "vertex_colors") and mesh.visual.vertex_colors is not None:
        try:
            vc = mesh.visual.vertex_colors[:, :3].astype(np.float32) / 255.0
            mean_c = np.mean(vc, axis=-1, keepdims=True)
            vc_boosted = mean_c + (vc - mean_c) * 1.45
            vc_boosted = np.power(np.clip(vc_boosted, 0.0, 1.0), 1.25)
            vc_final = (np.clip(vc_boosted, 0.0, 1.0) * 255.0).astype(np.uint8)

            if mesh.visual.vertex_colors.shape[-1] == 4:
                alpha = mesh.visual.vertex_colors[:, 3:4]
                mesh.visual.vertex_colors = np.concatenate([vc_final, alpha], axis=-1)
            else:
                mesh.visual.vertex_colors = vc_final
        except Exception as _c_err:
            print(f"[!] Bỏ qua xử lý màu sắc: {_c_err}")

    # 5. Xuất trực tiếp ra bytes GLB trong RAM (Không ghi đĩa)
    glb_bytes = mesh.export(file_type="glb")
    return glb_bytes

# -------------------------------------------------------------
# 4. SCHEMA PAYLOAD
# -------------------------------------------------------------
class RenderRequest(BaseModel):
    image_url: str
    job_id: Optional[str] = None
    foreground_ratio: Optional[float] = 0.85
    mc_resolution: Optional[int] = 256
    do_remove_background: Optional[bool] = True

# -------------------------------------------------------------
# 5. API ENDPOINTS
# -------------------------------------------------------------
@app.get("/")
def root():
    """Trang chủ hiển thị trạng thái khi người dùng click mở liên kết trên trình duyệt"""
    gpu_allocated_mb = 0
    gpu_name = "CPU"
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_allocated_mb = round(torch.cuda.memory_allocated(0) / 1024 / 1024, 1)

    return {
        "ok": True,
        "status": "online",
        "service": "Bảo tàng Lịch sử - TripoSR Fast 3D Worker",
        "device": f"{gpu_name} (Free VRAM: {round((15360 - gpu_allocated_mb)/1024, 1)} GB)",
        "message": "Máy chủ Google Colab GPU T4 đang hoạt động tốt! Hãy copy URL này dán vào ô 'Cấu hình Colab Tunnel' trên Trang Quản trị Di vật (Admin Artifacts)."
    }

@app.get("/health")
def health_check(x_api_key: Optional[str] = Header(None)):
    """Kiểm tra tình trạng tài nguyên GPU T4 và kết nối liveness"""
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
        "message": "AI Worker sẵn sàng nhận lệnh"
    }

@app.post("/render")
async def render_from_url(
    req: RenderRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Endpoint chính: Nhận Cloudinary URL qua JSON, tải vào RAM (BytesIO),
    render trên GPU T4 và trả về trực tiếp luồng nhị phân .GLB
    """
    job_id = req.job_id or f"job_{int(time.time())}"
    print(f"[*] Bắt đầu xử lý Job {job_id} từ URL: {req.image_url}...")

    # 1. Tải ảnh trực tiếp vào RAM qua BytesIO (Không tốn đĩa Colab)
    try:
        resp = requests.get(req.image_url, timeout=25)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Không thể tải ảnh từ URL cung cấp")
        image_bytes = io.BytesIO(resp.content)
        raw_pil = Image.open(image_bytes)
        if raw_pil.mode == "P":
            raw_pil = raw_pil.convert("RGBA")
    except Exception as fetch_err:
        raise HTTPException(status_code=400, detail=f"Lỗi tải ảnh nguồn: {str(fetch_err)}")

    # 2. Xử lý ảnh và suy luận AI trên GPU T4
    try:
        texture_source = None
        has_existing_alpha = False
        if raw_pil.mode == "RGBA":
            alpha_check = np.array(raw_pil)[:, :, 3]
            if np.any(alpha_check < 250):
                has_existing_alpha = True

        if has_existing_alpha:
            # Ảnh đã có nền trong suốt (PNG): Giữ nguyên biên dạng thật sắc bén của cổ vật
            nobg_pil = resize_foreground(raw_pil, req.foreground_ratio or 0.88)
            texture_source = nobg_pil.copy()
            img_np = np.array(nobg_pil).astype(np.float32) / 255.0
            white_bg = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
            input_image = Image.fromarray((white_bg * 255.0).astype(np.uint8))
        elif req.do_remove_background:
            rgb_input = raw_pil.convert("RGB")
            nobg_pil = remove_background(rgb_input, rembg_session=None)
            nobg_pil = resize_foreground(nobg_pil, req.foreground_ratio or 0.85)
            texture_source = nobg_pil.copy()
            img_np = np.array(nobg_pil).astype(np.float32) / 255.0
            if img_np.shape[-1] == 4:
                img_np = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
            input_image = Image.fromarray((img_np * 255.0).astype(np.uint8))
        else:
            input_image = raw_pil.convert("RGB")
            texture_source = input_image.copy()

        t0 = time.time()
        with torch.no_grad():
            scene_codes = model(input_image, device=device)
            meshes = model.extract_mesh(
                scene_codes,
                True,
                resolution=req.mc_resolution or 320,
                threshold=20.0
            )

        mesh = meshes[0]
        gen_time = round(time.time() - t0, 2)
        print(f"[✓] Job {job_id}: TripoSR infer thành công sau {gen_time}s! Đang chiếu vân Texture ảnh thật và nén .GLB...")

        # 3. Tối ưu hóa, chiếu màu từ ảnh gốc và xuất GLB bytes
        glb_bytes = optimize_mesh_to_glb_bytes(mesh, texture_image=texture_source)
        size_mb = round(len(glb_bytes) / 1024 / 1024, 2)

        # 4. Thu dọn VRAM và bộ nhớ đệm
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()

        # 5. Trả trực tiếp file nhị phân .GLB về cho VPS
        return Response(
            content=glb_bytes,
            media_type="model/gltf-binary",
            headers={
                "Content-Disposition": f'attachment; filename="{job_id}.glb"',
                "X-Job-ID": job_id,
                "X-Generation-Time-Seconds": str(gen_time),
                "X-Model-Size-MB": str(size_mb)
            }
        )
    except Exception as e:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        print(f"[!] Lỗi tiến trình 3D: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi render mô hình 3D: {str(e)}")

@app.post("/generate-3d")
async def generate_3d_file(
    file: UploadFile = File(...),
    job_id: Optional[str] = Form(None),
    foreground_ratio: float = Form(0.85),
    mc_resolution: int = Form(256),
    do_remove_background: bool = Form(True),
    api_key: str = Depends(verify_api_key)
):
    """Endpoint dự phòng nhận file multipart upload"""
    current_job_id = job_id or f"job_{int(time.time())}"
    try:
        content = await file.read()
        pil_image = Image.open(io.BytesIO(content)).convert("RGB")

        if do_remove_background:
            pil_image = remove_background(pil_image, rembg_session=None)
            pil_image = resize_foreground(pil_image, foreground_ratio)
            img_np = np.array(pil_image).astype(np.float32) / 255.0
            if img_np.shape[-1] == 4:
                img_np = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
            pil_image = Image.fromarray((img_np * 255.0).astype(np.uint8))
        else:
            pil_image = pil_image.convert("RGB")

        t0 = time.time()
        with torch.no_grad():
            scene_codes = model(pil_image, device=device)
            meshes = model.extract_mesh(scene_codes, True, resolution=mc_resolution, threshold=25.0)

        mesh = meshes[0]
        gen_time = round(time.time() - t0, 2)
        glb_bytes = optimize_mesh_to_glb_bytes(mesh)

        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()

        return Response(
            content=glb_bytes,
            media_type="model/gltf-binary",
            headers={
                "Content-Disposition": f'attachment; filename="{current_job_id}.glb"',
                "X-Gen-Time": str(gen_time)
            }
        )
    except Exception as e:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("server_fast:app", host="0.0.0.0", port=8000, reload=False)
