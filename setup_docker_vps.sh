#!/usr/bin/env bash
# ==============================================================================
# SCRIPT CÀI ĐẶT DOCKER & KHỞI CHẠY HỆ THỐNG TOUR 360
# ==============================================================================
set -e

echo ">>> [1/4] Cập nhật Ubuntu & Cài đặt Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo apt-get update -y
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable docker
    sudo systemctl start docker
fi

echo ">>> [2/4] Mở tường lửa (Port 22, 80, 443)..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

echo ">>> [3/4] Build & Khởi động toàn bộ dịch vụ (MongoDB + Backend + Frontend)..."
docker compose down || true
docker compose up -d --build

echo ">>> [4/4] Kiểm tra các container đang chạy..."
docker compose ps

echo "=============================================================================="
echo "🎉 HỆ THỐNG DOCKER ĐÃ KHỞI CHẠY THÀNH CÔNG!"
echo "Truy cập ngay trên trình duyệt: http://$(curl -s ifconfig.me)"
echo "=============================================================================="
