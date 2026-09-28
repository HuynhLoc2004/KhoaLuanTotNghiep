# ====================================================================
# HƯỚNG DẪN CHẠY GOOGLE COLAB CHO TÁC VỤ 3D TRIPOSR BẢO TÀNG
# ====================================================================
#
# BƯỚC 1: Truy cập https://colab.research.google.com -> Tạo sổ tay mới (New Notebook)
# BƯỚC 2: Chọn Runtime -> Change runtime type -> Chọn "T4 GPU" -> Save.
#
# BƯỚC 3: Dán đoạn mã ALL-IN-ONE dưới đây vào đúng 1 Ô DUY NHẤT và bấm Chạy (Run):

# --------------------------------------------------------------------
# [Ô MÃ TOÀN DIỆN - TỰ ĐỘNG CÀI ĐẶT & KHỞI ĐỘNG 1 BƯỚC DUY NHẤT]
# --------------------------------------------------------------------
"""
import subprocess
import shutil
import time
import re
import os
import sys

print("="*65)
print("🚀 ĐANG KHỞI TẠO MÔI TRƯỜNG AI TRIPOSR TRÊN TESLA T4...")
print("="*65)

# BƯỚC 1: KIỂM TRA & TỰ CÀI ĐẶT CÁC GÓI CÒN THIẾU
need_packages = False
try:
    import fastapi
    import uvicorn
    import trimesh
    import rembg
    import einops
    import omegaconf
    import mcubes
except ImportError:
    need_packages = True

if need_packages:
    print("[*] Đang cài đặt các thư viện AI (fastapi, uvicorn, trimesh, rembg, torchmcubes)...")
    !pip install -q fastapi uvicorn requests trimesh onnxruntime-gpu "rembg[gpu]" einops omegaconf PyMCubes huggingface_hub
    print("[✓] Thư viện AI đã sẵn sàng!")

if not os.path.exists("tsr"):
    print("[*] Đang tải mã nguồn TripoSR (tsr)...")
    !rm -rf TripoSR tsr
    !git clone -q https://github.com/VAST-AI-Research/TripoSR.git
    !cp -r TripoSR/tsr ./
    print("[✓] TripoSR tsr đã sẵn sàng!")

if not shutil.which("cloudflared"):
    print("[*] Đang cài đặt Cloudflared Quick Tunnel...")
    !wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    !dpkg -i cloudflared-linux-amd64.deb > /dev/null 2>&1
    print("[✓] Cloudflared đã sẵn sàng!")

# BƯỚC 2: TẢI SERVER_FAST.PY MỚI NHẤT TỪ GITHUB
print("[*] Đang cập nhật server_fast.py (thuật toán chiếu màu ảnh gốc)...")
!wget -q -O server_fast.py https://raw.githubusercontent.com/HuynhLoc2004/KhoaLuanTotNghiep/main/stitching_worker/colab_server_fast.py
print("[✓] server_fast.py đã cập nhật thành công!")

# BƯỚC 3: DỌN DẸP TIẾN TRÌNH CŨ
!pkill -f "uvicorn server_fast:app" > /dev/null 2>&1
!pkill -f "cloudflared tunnel" > /dev/null 2>&1
time.sleep(1)

# BƯỚC 4: KHỞI ĐỘNG FASTAPI VÀ WARM-UP MÔ HÌNH VÀO GPU VRAM
print("[*] Đang khởi động FastAPI Server & Warm-up TripoSR vào GPU Tesla T4...")
if os.path.exists("server.log"):
    os.remove("server.log")

server_log = open("server.log", "w")
server_proc = subprocess.Popen(
    ["uvicorn", "server_fast:app", "--host", "0.0.0.0", "--port", "8000"],
    stdout=server_log,
    stderr=subprocess.STDOUT
)

# Chờ TripoSR nạp xong vào VRAM và bắt lỗi nếu crash
started = False
for i in range(90):
    time.sleep(1)
    if server_proc.poll() is not None:
        print("\n[❌ LỖI]: Server Uvicorn bị dừng đột ngột! Chi tiết lỗi từ server.log:")
        with open("server.log", "r") as f:
            print(f.read())
        break
    if os.path.exists("server.log"):
        with open("server.log", "r") as f:
            c = f.read()
            if "warm-up thành công" in c or "Application startup complete" in c:
                started = True
                print("[✓] Model TripoSR đã nạp thành công vào GPU Tesla T4!")
                break

if not started:
    print("\n[❌ LỖI]: Quá thời gian khởi động server. Kiểm tra logs server.log:")
    if os.path.exists("server.log"):
        with open("server.log", "r") as f:
            print(f.read())
else:
    # BƯỚC 5: MỞ CLOUDFLARE QUICK TUNNEL
    print("[*] Đang kết nối Cloudflare Quick Tunnel...")
    if os.path.exists("tunnel.log"):
        os.remove("tunnel.log")

    tunnel_proc = subprocess.Popen(
        ["cloudflared", "tunnel", "--url", "http://127.0.0.1:8000", "--logfile", "tunnel.log"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

    tunnel_url = None
    for _ in range(35):
        time.sleep(1)
        if os.path.exists("tunnel.log"):
            with open("tunnel.log", "r") as f:
                t_content = f.read()
                m = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", t_content)
                if m:
                    tunnel_url = m.group(0)
                    break

    if tunnel_url:
        print("\n" + "="*65)
        print("🎉 MÁY CHỦ AI TRIPOSR ĐÃ SẴN SÀNG TRÊN CLOUD! 🎉")
        print(f"👉 ĐƯỜNG DẪN KẾT NỐI: {tunnel_url}")
        print("="*65)
        print("👉 CÁCH KẾT NỐI VỚI HỆ THỐNG BẢO TÀNG:")
        print("   1. Mở trang Quản trị Di vật (Admin Artifacts)")
        print("   2. Dán URL này vào ô 'Endpoint Cloudflare Quick Tunnel'")
        print("   3. Bấm 'Lưu & Kiểm tra kết nối' -> Đèn xanh 🟢 Online ngay lập tức!")
        print("="*65 + "\n")
    else:
        print("[!] Chưa lấy được URL Cloudflare. Hãy kiểm tra tunnel.log:")
        if os.path.exists("tunnel.log"):
            with open("tunnel.log", "r") as f:
                print(f.read())
"""
