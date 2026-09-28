"""
Google Colab AI Worker Server (FastAPI + TripoSR Fast)
File: colab_server_fast.py
Chạy trên Google Colab GPU Tesla T4 (15GB VRAM)
Bảo mật bằng X-API-Key + Cơ chế Warm-up nạp sẵn model vào VRAM

Cải tiến v3.0:
- Tiền xử lý ảnh: UnsharpMask + Sharpness/Contrast enhance trước khi đưa vào TripoSR
- Chiếu màu kết hợp: Planar + Spherical projection blend thông minh theo góc pháp tuyến
- Histogram Matching: Điều chỉnh distribution màu output khớp hoàn toàn với ảnh gốc (không bị đậm/nhạt hơn)
- Dominant color blending cho mặt sau/khuất: giữ nhất quán mã màu, tránh tô màu lạ
- Taubin smoothing tăng lên 12 iterations cho bề mặt mịn hơn
- Gamma correction thay vì aggressive saturation boost
"""

import os
import io
import gc
import time
from typing import Optional
from pydantic import BaseModel
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
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

app = FastAPI(title="TripoSR Fast AI Worker", version="3.0")

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

# =============================================================
# HELPER FUNCTIONS - IMAGE PREPROCESSING & COLOR SCIENCE
# =============================================================

def sharpen_and_enhance_image(pil_img: Image.Image) -> Image.Image:
    """
    Tiền xử lý ảnh trước khi đưa vào TripoSR:
    - Unsharp Mask: Làm sắc nét các cạnh và chi tiết bề mặt
    - Tăng độ sắc nét tổng thể (Sharpness enhancer PIL)
    - Tăng nhẹ độ tương phản để vùng tối/sáng rõ hơn
    Giúp TripoSR nhận diện rõ hơn hình khối, cạnh cổ vật -> geometry sắc nét hơn
    """
    sharpened = pil_img.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=2))
    enhancer = ImageEnhance.Sharpness(sharpened)
    sharpened = enhancer.enhance(1.8)
    contrast_enhancer = ImageEnhance.Contrast(sharpened)
    sharpened = contrast_enhancer.enhance(1.15)
    return sharpened


def match_histogram_to_source(
    target_rgb: np.ndarray,
    source_rgb: np.ndarray,
    mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Histogram Matching: Điều chỉnh màu output mesh khớp distribution với ảnh gốc.
    Đây là kỹ thuật quan trọng để tránh mesh bị tối/sáng hơn ảnh gốc.

    Args:
        target_rgb: (N, 3) float32 0..255 - màu của mesh cần điều chỉnh
        source_rgb: (H, W, 3) uint8 - ảnh gốc làm tham chiếu
        mask: (H, W) bool - chỉ lấy pixel foreground
    Returns:
        matched_rgb: (N, 3) float32 0..255 đã được histogram matched
    """
    matched = target_rgb.copy()
    src = source_rgb.astype(np.float32)

    if mask is not None:
        flat_src = src[mask]
    else:
        brightness = src.mean(axis=-1)
        fg_mask = brightness < 240
        flat_src = src[fg_mask]

    if len(flat_src) < 100:
        flat_src = src.reshape(-1, src.shape[-1])

    for c in range(3):
        src_c = flat_src[:, c].flatten()
        tgt_c = matched[:, c]

        src_hist, _ = np.histogram(src_c, bins=256, range=(0, 256))
        src_cdf = np.cumsum(src_hist).astype(np.float64)
        src_cdf /= (src_cdf[-1] + 1e-8)

        tgt_hist, _ = np.histogram(tgt_c, bins=256, range=(0, 256))
        tgt_cdf = np.cumsum(tgt_hist).astype(np.float64)
        tgt_cdf /= (tgt_cdf[-1] + 1e-8)

        lut = np.zeros(256, dtype=np.float32)
        for i in range(256):
            idx = np.searchsorted(src_cdf, tgt_cdf[i])
            lut[i] = min(idx, 255)

        matched[:, c] = lut[np.clip(tgt_c.astype(np.int32), 0, 255)]

    return np.clip(matched, 0, 255)


def spherical_project_colors(
    vertices: np.ndarray,
    normals: np.ndarray,
    texture_img: Image.Image
) -> np.ndarray:
    """
    Spherical UV Projection: Chiếu màu từ ảnh lên mesh theo góc cầu.
    Tốt hơn planar projection vì bọc màu quanh góc cạnh đúng hơn.
    """
    tex_np = np.array(texture_img.convert("RGB")).astype(np.float32)
    h, w = tex_np.shape[:2]

    v = vertices - vertices.mean(axis=0)
    r = np.linalg.norm(v, axis=-1, keepdims=True) + 1e-8
    v_norm = v / r

    phi = np.arctan2(v_norm[:, 0], v_norm[:, 2])
    theta = np.arcsin(np.clip(v_norm[:, 1], -1.0, 1.0))

    u = (phi / (2 * np.pi) + 0.5)
    v_coord = (theta / np.pi + 0.5)

    px_col = np.clip((u * (w - 1)).astype(np.int32), 0, w - 1)
    px_row = np.clip(((1.0 - v_coord) * (h - 1)).astype(np.int32), 0, h - 1)

    return tex_np[px_row, px_col]


def planar_project_colors(
    vertices: np.ndarray,
    texture_img: Image.Image
) -> np.ndarray:
    """
    Planar Projection: Chiếu màu từ ảnh lên mặt phẳng chính diện.
    """
    tex_np = np.array(texture_img.convert("RGB")).astype(np.float32)
    h, w = tex_np.shape[:2]

    x_vals = vertices[:, 0]
    y_vals = vertices[:, 1]
    x_min, x_max = x_vals.min(), x_vals.max()
    y_min, y_max = y_vals.min(), y_vals.max()
    dx = max(x_max - x_min, 1e-5)
    dy = max(y_max - y_min, 1e-5)

    u = np.clip((x_vals - x_min) / dx, 0.0, 1.0)
    v = np.clip((y_vals - y_min) / dy, 0.0, 1.0)

    px_col = np.clip((u * (w - 1)).astype(np.int32), 0, w - 1)
    px_row = np.clip(((1.0 - v) * (h - 1)).astype(np.int32), 0, h - 1)

    return tex_np[px_row, px_col]


# -------------------------------------------------------------
# 3. HÀM CHUYỂN HỆ TOẠ ĐỘ
# -------------------------------------------------------------
def to_threejs_3d_orientation(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    """
    Chuyển đổi toạ độ từ TripoSR sang Three.js chuẩn Web:
    - Đứng thẳng trên mặt đất (+Y là Up)
    - Mặt chính diện nhìn thẳng ra màn hình (+Z là Front)
    - Tay phải hướng sang phải (+X là Right)
    """
    mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi/2, [1, 0, 0]))
    return mesh


# -------------------------------------------------------------
# 4. HÀM TỐI ƯU HÓA HÌNH HỌC CHO THREE.JS & XUẤT .GLB (v3.0)
# -------------------------------------------------------------
def optimize_mesh_to_glb_bytes(
    mesh: trimesh.Trimesh,
    texture_image: Optional[Image.Image] = None,
    max_faces: int = 80000
) -> bytes:
    """
    v3.0 - Tối ưu hóa hình học và màu sắc cải tiến:
    - Xoay hướng chuẩn (Y-up, chính diện +Z)
    - Xóa mảnh vụn floating, sửa pháp tuyến, vá lỗ hổng
    - Taubin smoothing 12 iterations
    - Kết hợp Planar + Spherical projection với trọng số theo góc pháp tuyến
    - Histogram Matching đảm bảo màu output trung thực so ảnh gốc
    - Dominant color blending cho mặt sau/khuất
    """
    # 1. Chuyển đổi hệ toạ độ
    mesh = to_threejs_3d_orientation(mesh)

    # 1.1 Xóa mảnh vụn floating
    try:
        comps = mesh.split(only_watertight=False)
        if len(comps) > 1:
            mesh = max(comps, key=lambda c: len(c.vertices))
            print(f"[*] Đã xóa {len(comps)-1} mảnh vụn floating")
    except Exception as e:
        print(f"[!] Split warning: {e}")

    # 1.2 Sửa pháp tuyến + vá lỗ hổng
    try:
        trimesh.repair.fix_normals(mesh)
        trimesh.repair.fix_inversion(mesh)
        trimesh.repair.fill_holes(mesh)
        print("[✓] Đã sửa pháp tuyến và vá lỗ hổng mesh")
    except Exception as e:
        print(f"[!] Repair warning: {e}")

    # 1.3 Taubin Smoothing 12 iterations (mượt mà hơn, giữ volume)
    try:
        mesh = trimesh.smoothing.filter_taubin(mesh, iterations=12)
        print("[✓] Taubin smoothing 12 iterations hoàn thành")
    except Exception as e:
        print(f"[!] Smoothing warning: {e}")

    # 2. Căn giữa gốc toạ độ
    bbox_min, bbox_max = mesh.bounds
    mesh.vertices -= (bbox_min + bbox_max) / 2.0

    # 3. Chuẩn hóa kích thước lớn nhất về 1.2m
    max_extent = np.ptp(mesh.vertices, axis=0).max()
    if max_extent > 0:
        mesh.vertices *= (1.2 / max_extent)

    # 4. CHIẾU MÀU NÂNG CAO (v3.0)
    if texture_image is not None and len(mesh.vertices) > 0:
        try:
            normals = mesh.vertex_normals
            nz = normals[:, 2]

            # === 4A: Planar projection (mặt trước) ===
            planar_colors = planar_project_colors(mesh.vertices, texture_image)

            # === 4B: Spherical projection (bao quanh toàn bộ) ===
            sphere_colors = spherical_project_colors(mesh.vertices, normals, texture_image)

            # === 4C: Trọng số kết hợp theo góc pháp tuyến ===
            front_weight = np.clip(nz, 0.0, 1.0)[:, np.newaxis]
            planar_w = np.power(front_weight, 0.5)  # sqrt -> smooth falloff
            sphere_w = 1.0 - planar_w
            proj_colors = planar_w * planar_colors + sphere_w * sphere_colors

            # Alpha mask từ ảnh nguồn (nếu RGBA)
            alpha_weight = np.ones((len(mesh.vertices), 1), dtype=np.float32)
            if texture_image.mode == "RGBA":
                tex_np_rgba = np.array(texture_image)
                x_vals = mesh.vertices[:, 0]
                y_vals = mesh.vertices[:, 1]
                x_min, x_max = x_vals.min(), x_vals.max()
                y_min, y_max = y_vals.min(), y_vals.max()
                u = np.clip((x_vals - x_min) / max(x_max - x_min, 1e-5), 0.0, 1.0)
                v = np.clip((y_vals - y_min) / max(y_max - y_min, 1e-5), 0.0, 1.0)
                px_c = np.clip((u * (tex_np_rgba.shape[1] - 1)).astype(np.int32), 0, tex_np_rgba.shape[1] - 1)
                px_r = np.clip(((1.0 - v) * (tex_np_rgba.shape[0] - 1)).astype(np.int32), 0, tex_np_rgba.shape[0] - 1)
                alpha_weight = (tex_np_rgba[px_r, px_c, 3:4].astype(np.float32) / 255.0)

            # Lấy màu gốc TripoSR
            if hasattr(mesh.visual, "vertex_colors") and mesh.visual.vertex_colors is not None:
                tripo_rgb = mesh.visual.vertex_colors[:, :3].astype(np.float32)
            else:
                tripo_rgb = np.full((len(mesh.vertices), 3), 128.0)

            # Blend: Alpha cao -> màu ảnh gốc, alpha thấp -> màu TripoSR
            img_blend_w = alpha_weight * (0.7 + 0.25 * front_weight)
            final_proj = img_blend_w * proj_colors + (1.0 - img_blend_w) * tripo_rgb

            # === 4D: Histogram Matching - màu output khớp ảnh gốc ===
            src_rgb_np = np.array(texture_image.convert("RGB"))
            fg_mask_2d = None
            if texture_image.mode == "RGBA":
                alpha_2d = np.array(texture_image)[:, :, 3]
                fg_mask_2d = alpha_2d > 30

            front_mask = nz > 0.1
            if front_mask.sum() > 50:
                matched_front = match_histogram_to_source(
                    final_proj[front_mask], src_rgb_np, mask=fg_mask_2d
                )
                match_strength = np.clip(nz[front_mask], 0.1, 1.0)[:, np.newaxis]
                final_proj[front_mask] = (
                    match_strength * matched_front +
                    (1.0 - match_strength) * final_proj[front_mask]
                )
                print(f"[✓] Histogram matching áp dụng cho {front_mask.sum()} vertices mặt trước")

            # Mặt sau: giữ nhất quán mã màu bằng dominant color
            back_mask = nz < -0.3
            if back_mask.sum() > 0:
                try:
                    src_flat = src_rgb_np[fg_mask_2d if fg_mask_2d is not None else np.ones(src_rgb_np.shape[:2], bool)]
                    dominant_rgb = np.median(src_flat, axis=0)
                    back_blend = 0.30 * dominant_rgb + 0.70 * tripo_rgb[back_mask]
                    final_proj[back_mask] = np.clip(back_blend, 0, 255)
                except Exception:
                    pass

            final_rgb = np.clip(final_proj, 0.0, 255.0).astype(np.uint8)
            alpha_col = np.full((len(mesh.vertices), 1), 255, dtype=np.uint8)
            mesh.visual = trimesh.visual.ColorVisuals(
                mesh=mesh,
                vertex_colors=np.concatenate([final_rgb, alpha_col], axis=-1)
            )
            print("[✓] v3.0: Chiếu màu Planar+Spherical+HistogramMatch thành công!")

        except Exception as _proj_err:
            import traceback
            print(f"[!] Lỗi chiếu màu nâng cao: {_proj_err}")
            traceback.print_exc()

    elif hasattr(mesh.visual, "vertex_colors") and mesh.visual.vertex_colors is not None:
        # Không có texture: gamma correction nhẹ, không méo màu
        try:
            vc = mesh.visual.vertex_colors[:, :3].astype(np.float32)
            vc_norm = vc / 255.0
            vc_gamma = np.power(np.clip(vc_norm, 0, 1), 0.9)  # gamma 0.9 = sáng nhẹ
            vc_final = (np.clip(vc_gamma, 0.0, 1.0) * 255.0).astype(np.uint8)
            if mesh.visual.vertex_colors.shape[-1] == 4:
                alpha = mesh.visual.vertex_colors[:, 3:4]
                mesh.visual.vertex_colors = np.concatenate([vc_final, alpha], axis=-1)
            else:
                mesh.visual.vertex_colors = vc_final
        except Exception as _c_err:
            print(f"[!] Bỏ qua xử lý màu sắc: {_c_err}")

    # 5. Xuất ra bytes GLB trong RAM
    glb_bytes = mesh.export(file_type="glb")
    return glb_bytes

# -------------------------------------------------------------
# 5. SCHEMA PAYLOAD
# -------------------------------------------------------------
class RenderRequest(BaseModel):
    image_url: str
    job_id: Optional[str] = None
    foreground_ratio: Optional[float] = 0.85
    mc_resolution: Optional[int] = 256
    do_remove_background: Optional[bool] = True

# -------------------------------------------------------------
# 6. API ENDPOINTS
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
        "version": "3.0",
        "service": "Bảo tàng Lịch sử - TripoSR Fast 3D Worker",
        "device": f"{gpu_name} (Free VRAM: {round((15360 - gpu_allocated_mb)/1024, 1)} GB)",
        "improvements": [
            "Image sharpening before TripoSR inference",
            "Planar + Spherical color projection blend",
            "Histogram color matching to source image",
            "12-iter Taubin smoothing",
            "Back-face dominant color blending"
        ],
        "message": "Máy chủ Google Colab GPU T4 đang hoạt động tốt!"
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
            texture_source = nobg_pil.copy()  # RGBA for precise alpha mask
            img_np = np.array(nobg_pil).astype(np.float32) / 255.0
            white_bg = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
            input_base = Image.fromarray((white_bg * 255.0).astype(np.uint8))
            input_image = sharpen_and_enhance_image(input_base)  # Sharpen before TripoSR
        elif req.do_remove_background:
            rgb_input = raw_pil.convert("RGB")
            nobg_pil = remove_background(rgb_input, rembg_session=None)
            nobg_pil = resize_foreground(nobg_pil, req.foreground_ratio or 0.85)
            texture_source = nobg_pil.copy()  # RGBA
            img_np = np.array(nobg_pil).astype(np.float32) / 255.0
            if img_np.shape[-1] == 4:
                img_np = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
            input_base = Image.fromarray((img_np * 255.0).astype(np.uint8))
            input_image = sharpen_and_enhance_image(input_base)  # Sharpen before TripoSR
        else:
            input_base = raw_pil.convert("RGB")
            texture_source = input_base.copy()
            input_image = sharpen_and_enhance_image(input_base)  # Sharpen before TripoSR

        print(f"[*] Ảnh đầu vào đã sharpen+enhance, kích thước: {input_image.size}")

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
        import traceback
        print(f"[!] Lỗi tiến trình 3D: {str(e)}")
        traceback.print_exc()
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

        pil_image = sharpen_and_enhance_image(pil_image)

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
