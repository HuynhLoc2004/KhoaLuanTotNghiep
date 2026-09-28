#!/usr/bin/env python3
"""
trellis_service.py - TRELLIS 3D Generation Service via Hugging Face Spaces
==========================================================================
Nhan duong dan anh tu CLI arg, goi TRELLIS Space qua gradio_client,
tai ve file .glb va luu vao duong dan dau ra chi dinh.

Cach dung:
    python trellis_service.py --image <input_image_path> --output <output_glb_path>

Output (stdout JSON):
    {"success": true, "glb_path": "/path/to/output.glb", "size_bytes": 123456}
    hoac
    {"success": false, "error": "Chi tiet loi..."}

Cai dat packages:
    pip install gradio_client>=1.3.0 pillow requests
"""

import sys
import os
import json
import shutil
import argparse
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------
TRELLIS_SPACES = [
    "trellis-community/TRELLIS",
    "JeffreyXiang/TRELLIS",
]


def log(msg: str):
    """In log ra stderr (khong lan vao JSON stdout cho Node.js doc)"""
    print(f"[TRELLIS Service] {msg}", file=sys.stderr, flush=True)


# Doc HuggingFace Access Token tu bien moi truong ACCCESS_TOKEN_HUGE_SPACE
# Token chi co quyen read - du de goi public Space API, khong can write
HF_TOKEN = (
    os.environ.get("ACCCESS_TOKEN_HUGE_SPACE") or
    os.environ.get("HF_TOKEN") or
    None
)

if HF_TOKEN:
    log(f"[OK] Da tim thay HuggingFace token (ACCCESS_TOKEN_HUGE_SPACE), do dai: {len(HF_TOKEN)} ky tu")
else:
    log("[WARN] Khong tim thay HuggingFace token, se goi anonymous (co the bi rate-limit)")

TRELLIS_TIMEOUT = int(os.environ.get("TRELLIS_TIMEOUT", "300"))


def load_gradio_client():
    """Nap gradio_client, neu chua cai thi tu cai"""
    try:
        from gradio_client import Client, handle_file
        return Client, handle_file
    except ImportError:
        log("gradio_client chua duoc cai. Dang tu cai dat...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gradio_client>=1.3.0", "-q"])
        from gradio_client import Client, handle_file
        return Client, handle_file


def connect_to_trellis():
    """
    Thu ket noi lan luot cac Space TRELLIS.
    Tra ve (client, handle_file) khi thanh cong, raise Exception neu tat ca that bai.
    """
    Client, handle_file = load_gradio_client()
    last_error = None
    for space_id in TRELLIS_SPACES:
        # Thu nhieu cach truyen token vi gradio_client thay doi API giua cac version
        token_kwargs_list = [
            {"hf_token": HF_TOKEN},   # gradio_client >= 1.0
            {"hf_token": HF_TOKEN},   # alias
        ]
        if not HF_TOKEN:
            token_kwargs_list = [{}]   # Khong co token thi goi anonymous

        for token_kwargs in token_kwargs_list:
            try:
                log(f"Dang ket noi toi Space: {space_id} ...")
                client = Client(space_id, **token_kwargs)
                log(f"[OK] Ket noi thanh cong toi {space_id}")
                return client, handle_file
            except TypeError as te:
                # Neu tham so hf_token khong duoc chap nhan, thu khong truyen token
                log(f"[WARN] Tham so token khong duoc chap nhan ({te}), thu ket noi anonymous...")
                try:
                    client = Client(space_id)
                    log(f"[OK] Ket noi thanh cong toi {space_id} (anonymous)")
                    return client, handle_file
                except Exception as e2:
                    log(f"[FAIL] Ket noi anonymous cung that bai: {e2}")
                    last_error = e2
                    break
            except Exception as e:
                log(f"[FAIL] Khong ket noi duoc toi {space_id}: {e}")
                last_error = e
                break

    raise RuntimeError(
        f"Khong the ket noi toi bat ky TRELLIS Space nao. "
        f"Kiem tra ket noi mang hoac them HF_TOKEN. Loi cuoi: {last_error}"
    )


def generate_3d_with_trellis(image_path: str, output_glb_path: str) -> dict:
    """
    Goi TRELLIS Space qua gradio_client de tao mo hinh 3D tu anh.

    Su dung endpoint /generate_and_extract_glb (1 buoc duy nhat):
      - Nhan anh dau vao
      - Tra ve file .glb hoan chinh
    """
    image_path = str(image_path)
    output_glb_path = str(output_glb_path)

    if not os.path.exists(image_path):
        return {"success": False, "error": f"Khong tim thay file anh: {image_path}"}

    try:
        client, handle_file = connect_to_trellis()
    except Exception as e:
        return {"success": False, "error": str(e)}

    try:
        log(f"Dang tao 3D tu anh: {os.path.basename(image_path)} ...")
        log(f"  Full path: {image_path}")
        log(f"  File ton tai: {os.path.exists(image_path)}")
        if os.path.exists(image_path):
            log(f"  File size: {os.path.getsize(image_path)} bytes")
        t0 = time.time()

        result = client.predict(
            image=handle_file(image_path),
            multiimages=[],
            seed=0,
            ss_guidance_strength=7.5,
            ss_sampling_steps=12,
            slat_guidance_strength=3.0,
            slat_sampling_steps=12,
            multiimage_algo="stochastic",
            mesh_simplify=0.95,
            texture_size=1024,
            api_name="/generate_and_extract_glb"
        )

        t1 = time.time()
        log(f"[OK] TRELLIS hoan tat sau {t1-t0:.1f}s. Result type: {type(result).__name__}")

        # Lay duong dan file .glb tu ket qua
        glb_source = None
        if isinstance(result, (list, tuple)):
            # Tim file .glb trong list ket qua
            for item in result:
                if isinstance(item, str) and item.endswith(".glb"):
                    glb_source = item
                    break
                elif isinstance(item, dict) and (item.get("path", "").endswith(".glb") or item.get("value", "").endswith(".glb")):
                    glb_source = item.get("path") or item.get("value")
                    break
            # Neu khong tim thay .glb, lay phan tu cuoi
            if not glb_source and len(result) > 0:
                glb_source = result[-1]
        elif isinstance(result, str):
            glb_source = result
        elif isinstance(result, dict):
            glb_source = result.get("value") or result.get("path")

        if not glb_source:
            return {
                "success": False,
                "error": f"TRELLIS khong tra ve duong dan file GLB hop le. Output: {str(result)[:300]}"
            }

        # glb_source co the la dict (Gradio FileData) hoac string
        if isinstance(glb_source, dict):
            glb_file_path = glb_source.get("path") or glb_source.get("value", "")
        else:
            glb_file_path = str(glb_source)

        if not glb_file_path or not os.path.exists(glb_file_path):
            return {
                "success": False,
                "error": f"File GLB tam khong ton tai tren dia: {glb_file_path}"
            }

        # Copy file GLB -> output path
        output_dir = os.path.dirname(output_glb_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        shutil.copy2(glb_file_path, output_glb_path)
        file_size = os.path.getsize(output_glb_path)
        total_time = time.time() - t0

        log(f"[SUCCESS] Tao mo hinh 3D thanh cong! Size: {file_size/1024/1024:.2f}MB, Time: {total_time:.1f}s")

        return {
            "success": True,
            "glb_path": output_glb_path,
            "size_bytes": file_size,
            "generation_time_seconds": round(total_time, 1),
            "engine": "TRELLIS-image-large (Hugging Face Spaces)"
        }

    except Exception as e:
        error_msg = str(e)
        import traceback
        log(f"[ERROR] Loi trong qua trinh tao 3D: {error_msg}")
        log(f"[ERROR] Traceback:\n{traceback.format_exc()}")

        if "queue" in error_msg.lower() or "too many" in error_msg.lower():
            friendly = "Hang doi TRELLIS dang day. Vui long thu lai sau vai phut."
        elif "sleeping" in error_msg.lower() or "timeout" in error_msg.lower():
            friendly = "TRELLIS Space dang ngu hoac qua tai. Vui long thu lai sau."
        elif "rate" in error_msg.lower() or "429" in error_msg:
            friendly = "Da vuot gioi han request HuggingFace. Them HF_TOKEN de tang gioi han."
        elif "invalid" in error_msg.lower() or "image" in error_msg.lower():
            friendly = "Anh dau vao khong hop le hoac khong dung dinh dang."
        else:
            friendly = f"Loi TRELLIS: {error_msg}"

        return {"success": False, "error": friendly, "raw_error": error_msg}



def main():
    parser = argparse.ArgumentParser(description="TRELLIS 3D Generation Service")
    parser.add_argument("--image", required=True, help="Duong dan file anh dau vao")
    parser.add_argument("--output", required=True, help="Duong dan file .glb dau ra")
    args = parser.parse_args()

    result = generate_3d_with_trellis(args.image, args.output)

    # In ket qua JSON ra stdout de Node.js doc
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
