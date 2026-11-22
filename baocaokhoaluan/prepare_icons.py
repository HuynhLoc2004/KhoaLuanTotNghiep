# -*- coding: utf-8 -*-
"""
prepare_icons.py
Tách nền chuẩn xác cho các icon công nghệ từ ảnh tải lên của người dùng.
Đảm bảo giữ nguyên màu sắc sống động (Postgres xanh voi, PayOS xanh lá, Nginx xanh lục, Hugging Face vàng).
"""

import os
import cv2
import numpy as np
from PIL import Image

UPLOADED_DIR = r"C:\Users\HUYNH TAN LOC\.gemini\antigravity\brain\c9a48d8a-80fb-42de-8766-be88653eace8\.user_uploaded"
DEST_DIRS = [
    r"D:\KhoaluanTotNghiep\baocaokhoaluan\assets\icons",
    r"D:\KhoaluanTotNghiep\docs\diagram_assets"
]

for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)


def save_icon(img_arr, filename):
    im = Image.fromarray(img_arr)
    for d in DEST_DIRS:
        target = os.path.join(d, filename)
        im.save(target)
        print(f"-> Saved: {target} (shape: {img_arr.shape})")


def process_postgres():
    # media_1795294286548_f385afae.png
    p = os.path.join(UPLOADED_DIR, "media_1795294286548_f385afae.png")
    arr = np.array(Image.open(p).convert("RGBA"))
    
    # 1. Cắt bỏ viền đen ngoài cùng [34, 36, 42]
    dark_mask = (arr[:, :, 0] < 60) & (arr[:, :, 1] < 60) & (arr[:, :, 2] < 65)
    valid_rows = np.where(~np.all(dark_mask, axis=1))[0]
    valid_cols = np.where(~np.all(dark_mask, axis=0))[0]
    cropped = arr[valid_rows[0]:valid_rows[-1]+1, valid_cols[0]:valid_cols[-1]+1].copy()

    # 2. Xóa nền trắng bên ngoài bằng floodFill từ 4 góc
    h, w = cropped.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    bgr = cv2.cvtColor(cropped, cv2.COLOR_RGBA2BGR)
    for pt in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        cv2.floodFill(bgr, mask, pt, (0, 0, 0), (20, 20, 20), (20, 20, 20), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)

    outer_mask = (mask[1:-1, 1:-1] == 255)
    result = cropped.copy()
    result[outer_mask, 3] = 0
    save_icon(result, "icon_postgres.png")


def process_nginx():
    # media_1795319893054_6830c08d.png
    p = os.path.join(UPLOADED_DIR, "media_1795319893054_6830c08d.png")
    arr = np.array(Image.open(p).convert("RGBA"))
    h, w = arr.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGBA2BGR)
    for pt in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        cv2.floodFill(bgr, mask, pt, (0, 0, 0), (25, 25, 25), (25, 25, 25), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)

    outer_mask = (mask[1:-1, 1:-1] == 255)
    result = arr.copy()
    result[outer_mask, 3] = 0
    save_icon(result, "icon_nginx.png")


def process_payos():
    # media_1795294286544_9697d94a.png
    p = os.path.join(UPLOADED_DIR, "media_1795294286544_9697d94a.png")
    arr = np.array(Image.open(p).convert("RGBA"))
    h, w = arr.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGBA2BGR)
    for pt in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        cv2.floodFill(bgr, mask, pt, (0, 0, 0), (20, 20, 20), (20, 20, 20), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)

    outer_mask = (mask[1:-1, 1:-1] == 255)
    result = arr.copy()
    result[outer_mask, 3] = 0
    save_icon(result, "icon_payos.png")


def process_hf():
    # media_1795294448942_e42ddf92.png
    p = os.path.join(UPLOADED_DIR, "media_1795294448942_e42ddf92.png")
    arr = np.array(Image.open(p).convert("RGBA"))
    h, w = arr.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGBA2BGR)
    for pt in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        cv2.floodFill(bgr, mask, pt, (0, 0, 0), (20, 20, 20), (20, 20, 20), flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY)

    outer_mask = (mask[1:-1, 1:-1] == 255)
    result = arr.copy()
    result[outer_mask, 3] = 0
    save_icon(result, "icon_huggingface.png")


if __name__ == "__main__":
    process_postgres()
    process_nginx()
    process_payos()
    process_hf()
    print("=== TAT CA ICON DA DUOC TACH NEN VA CAP NHAT HOAN HAO ===")
