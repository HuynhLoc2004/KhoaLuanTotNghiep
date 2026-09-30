#!/usr/bin/env python3
"""
Script cứu hộ: Khôi phục mô hình 3D đám mây điểm có màu thực tế
từ kết quả COLMAP gần nhất mà không cần phải chạy lại 25 phút.
"""
import os
import glob
import shutil
import sys
import trimesh

ROOMS_3D_DIR = "/app/backend/public/uploads/rooms_3d"
if not os.path.exists(ROOMS_3D_DIR):
    ROOMS_3D_DIR = "backend/public/uploads/rooms_3d"

print("🔍 Đang tìm kiếm kết quả tính toán COLMAP trong thư mục tạm...")
ply_files = glob.glob("/tmp/colmap_mvs_*/points.ply")

if not ply_files:
    print("❌ Không tìm thấy file points.ply trong /tmp.")
    print("Có thể thư mục /tmp đã được dọn dẹp hoặc container vừa khởi động lại.")
    sys.exit(1)

latest_ply = max(ply_files, key=os.path.getmtime)
print(f"✅ Đã tìm thấy dữ liệu điểm 3D gần nhất: {latest_ply}")
print(f"📊 Dung lượng file điểm gốc: {os.path.getsize(latest_ply) / 1024 / 1024:.2f} MB")

# Tìm job GLB gần nhất trong rooms_3d hoặc dùng file chỉ định
target_glb_files = sorted(glob.glob(os.path.join(ROOMS_3D_DIR, "room_3d_sfm_*.glb")), key=os.path.getmtime, reverse=True)

if target_glb_files:
    target_glb = target_glb_files[0]
else:
    target_glb = os.path.join(ROOMS_3D_DIR, "room_3d_latest.glb")

target_ply = target_glb.replace(".glb", ".ply")

print(f"🚀 Đang xuất dữ liệu sang:")
print(f"   -> {target_ply}")
print(f"   -> {target_glb}")

# 1. Copy file PLY gốc giữ nguyên màu
shutil.copy2(latest_ply, target_ply)

# 2. Đóng gói Point Cloud sang GLB có màu vertex
try:
    pcd = trimesh.load(latest_ply)
    glb_data = trimesh.exchange.gltf.export_glb(pcd)
    with open(target_glb, "wb") as f:
        f.write(glb_data)
    print(f"🎉 THÀNH CÔNG! Đã tạo file GLB đám mây điểm ({len(glb_data) / 1024 / 1024:.2f} MB)")
    print(f"Bây giờ bạn chỉ cần F5 tải lại trang web để ngắm căn phòng 3D!")
except Exception as e:
    print(f"⚠️ Lỗi đóng gói GLB: {e}. File PLY đã sẵn sàng tại {target_ply}")
