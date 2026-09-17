#!/usr/bin/env bash
# ==============================================================================
# SCRIPT CÀI ĐẶT DOCKER & KHỞI CHẠY HỆ THỐNG TOUR 360
# ==============================================================================
set -e

echo ">>> [1/4] Cập nhật Ubuntu & Cài đặt Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin || sudo apt-get install -y docker.io docker-compose
    sudo systemctl enable docker || true
    sudo systemctl start docker || true
fi

# Kiểm tra docker compose
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    sudo apt-get install -y docker-compose || true
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

echo ">>> [2/4] Mở tường lửa (Port 22, 80, 443)..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

echo ">>> [3/4] Build & Khởi động toàn bộ dịch vụ (MongoDB + Backend + Frontend)..."
$COMPOSE_CMD down || true
$COMPOSE_CMD up -d --build

echo ">>> [4/4] Kiểm tra các container đang chạy..."
$COMPOSE_CMD ps

echo "=============================================================================="
echo "🎉 HỆ THỐNG DOCKER ĐÃ KHỞI CHẠY THÀNH CÔNG!"
echo "Truy cập ngay trên trình duyệt: http://$(curl -s ifconfig.me)"
echo "=============================================================================="
