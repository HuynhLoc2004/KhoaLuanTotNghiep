# ====================================================================
# HƯỚNG DẪN CHẠY GOOGLE COLAB CHO TÁC VỤ 3D TRIPOSR BẢO TÀNG
# ====================================================================
#
# BƯỚC 1: Truy cập https://colab.research.google.com -> Tạo sổ tay mới (New Notebook)
# BƯỚC 2: Chọn Runtime -> Change runtime type -> Chọn "T4 GPU" -> Save.
#
# BƯỚC 3: Tạo 3 Ô Mã (Code Cell) và dán tương ứng các đoạn lệnh dưới đây:

# --------------------------------------------------------------------
# [Ô MÃ 1 - CÀI ĐẶT THƯ VIỆN & CLOUDFLARE]
# --------------------------------------------------------------------
"""
!nvidia-smi

print("[*] Đang cài đặt thư viện cần thiết...")
!pip install -q fastapi uvicorn requests trimesh rembg einops omegaconf PyMCubes huggingface_hub

print("[*] Đang tải mã nguồn TripoSR (tsr)...")
!rm -rf TripoSR tsr
!git clone -q https://github.com/VAST-AI-Research/TripoSR.git
!cp -r TripoSR/tsr ./

print("[*] Đang cài đặt Cloudflared Quick Tunnel...")
!wget -q -nc https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
!dpkg -i cloudflared-linux-amd64.deb > /dev/null 2>&1

print("\n[✓] HOÀN TẤT CÀI ĐẶT! Hãy chạy Ô Mã 2 tiếp theo.")
"""

# --------------------------------------------------------------------
# [Ô MÃ 2 - TẢI SERVER_FAST.PY TỰ ĐỘNG TỪ GITHUB]
# --------------------------------------------------------------------
"""
!wget -q -O server_fast.py https://raw.githubusercontent.com/HuynhLoc2004/KhoaLuanTotNghiep/main/stitching_worker/colab_server_fast.py
print("[✓] Đã tải thành công server_fast.py về Colab!")
!head -n 25 server_fast.py
"""

# --------------------------------------------------------------------
# [Ô MÃ 3 - KHỞI ĐỘNG SERVER T4 & LẤY ĐƯỜNG HẦM CLOUDFLARE]
# --------------------------------------------------------------------
"""
import subprocess
import time
import re
import os

# 1. Dọn dẹp tiến trình cũ nếu có
!pkill -f "uvicorn server_fast:app" > /dev/null 2>&1
!pkill -f "cloudflared tunnel" > /dev/null 2>&1
time.sleep(1)

# 2. Khởi động FastAPI server ở chế độ nền
print("[*] Đang khởi động FastAPI Server & Warm-up TripoSR vào GPU VRAM...")
server_log = open("server.log", "w")
server_proc = subprocess.Popen(
    ["uvicorn", "server_fast:app", "--host", "0.0.0.0", "--port", "8000"],
    stdout=server_log,
    stderr=subprocess.STDOUT
)

# 3. Chờ TripoSR nạp xong vào VRAM (~15 giây)
started = False
for _ in range(60):
    time.sleep(1)
    if os.path.exists("server.log"):
        with open("server.log", "r") as f:
            content = f.read()
            if "warm-up thành công" in content or "Application startup complete" in content or "Uvicorn running" in content:
                started = True
                break

if started:
    print("[✓] TripoSR đã nạp thành công vào GPU Tesla T4!")
else:
    print("[*] Server đang khởi động, tiếp tục mở Cloudflare Tunnel...")

# 4. Mở đường hầm Cloudflare Quick Tunnel
print("[*] Đang kết nối Cloudflare Quick Tunnel...")
tunnel_log = open("tunnel.log", "w")
tunnel_proc = subprocess.Popen(
    ["cloudflared", "tunnel", "--url", "http://127.0.0.1:8000", "--logfile", "tunnel.log"],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

# 5. Đọc URL trycloudflare.com
tunnel_url = None
for _ in range(30):
    time.sleep(1)
    if os.path.exists("tunnel.log"):
        with open("tunnel.log", "r") as f:
            t_content = f.read()
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", t_content)
            if match:
                tunnel_url = match.group(0)
                break

if tunnel_url:
    print("\n" + "="*65)
    print("🎉 MÁY CHỦ AI TRIPOSR ĐÃ SẴN SÀNG TRÊN CLOUD! 🎉")
    print(f"👉 ĐƯỜNG DẪN KẾT NỐI: {tunnel_url}")
    print("="*65)
    print("👉 CÁCH KẾT NỐI VỚI HỆ THỐNG BẢO TÀNG:")
    print("   1. Mở trang Quản trị Di vật (Admin Artifacts)")
    print("   2. Bấm nút 'AI Colab T4' trên thanh công cụ")
    print(f"   3. Dán URL: {tunnel_url}")
    print("   4. Bấm 'Lưu & Kiểm tra kết nối' -> Đèn xanh 🟢 bật sáng là thành công!")
    print("="*65 + "\n")
else:
    print("[!] Chưa lấy được URL Cloudflare. Hãy chạy lệnh !cat tunnel.log để kiểm tra.")
"""

# --------------------------------------------------------------------
# [Ô MÃ 4 (Tùy chọn) - THEO DÕI LOGS TIẾN TRÌNH KHI BẤM DỰNG 3D]
# --------------------------------------------------------------------
"""
!tail -f server.log
"""
