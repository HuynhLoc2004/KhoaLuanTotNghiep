#!/bin/bash
set -e

DOMAIN="103-178-233-206.sslip.io"
EMAIL="huynhtanlocpp09@gmail.com"

echo "========================================================="
echo "  CẤU HÌNH HTTPS / SSL LET'S ENCRYPT CHO BẢO TÀNG 360  "
echo "  Tên miền: $DOMAIN"
echo "========================================================="

# 1. Cài đặt certbot nếu chưa có
if ! command -v certbot &> /dev/null; then
    echo "[1/4] Đang cài đặt Certbot..."
    apt-get update -y && apt-get install -y certbot
fi

# 2. Tạo thư mục webroot nếu chưa có
mkdir -p /var/lib/docker/volumes/khoaluantotnghiep_certbot_data/_data

# 3. Yêu cầu cấp chứng chỉ Let's Encrypt qua Webroot hoặc Standalone
echo "[2/4] Đang đăng ký chứng chỉ SSL từ Let's Encrypt..."
if certbot certonly --webroot -w /var/lib/docker/volumes/khoaluantotnghiep_certbot_data/_data -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --keep-until-expiring; then
    echo "✓ Đã cấp chứng chỉ thành công qua Webroot!"
else
    echo "Thử lại qua Standalone mode..."
    docker stop museum_frontend 2>/dev/null || true
    certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --keep-until-expiring
    docker start museum_frontend 2>/dev/null || true
fi

# 4. Khởi động lại container frontend để nhận chứng chỉ SSL mới
echo "[3/4] Cập nhật chứng chỉ vào Nginx Frontend..."
cd /root/KhoaLuanTotNghiep || cd /root/khoaluantotnghiep
docker compose restart frontend || docker-compose restart frontend

echo "[4/4] HOÀN TẤT!"
echo "Bạn có thể truy cập hệ thống bảo mật tại: https://$DOMAIN"
