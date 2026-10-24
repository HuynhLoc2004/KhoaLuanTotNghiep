#!/bin/bash
set -e

# Tên miền mặc định (có thể truyền tham số: bash scripts/setup-ssl.sh yourdomain.com)
DOMAIN="${1:-museumhcm.duckdns.org}"
EMAIL="huynhtanlocpp09@gmail.com"

echo "========================================================="
echo "  CẤU HÌNH HTTPS / SSL LET'S ENCRYPT CHO BẢO TÀNG 360  "
echo "  Tên miền đăng ký: $DOMAIN"
echo "  Email thông báo:  $EMAIL"
echo "========================================================="

# 1. Cài đặt certbot nếu chưa có
if ! command -v certbot &> /dev/null; then
    echo ">>> [1/4] Đang cài đặt Certbot trên VPS..."
    apt-get update -y && apt-get install -y certbot
else
    echo ">>> [1/4] Certbot đã sẵn sàng."
fi

# 2. Tạm dừng frontend để Certbot chạy Standalone trên Port 80 (độ tin cậy 100%)
echo ">>> [2/4] Tạm dừng Nginx Frontend để xác thực tên miền..."
docker stop museum_frontend 2>/dev/null || true

# 3. Yêu cầu cấp chứng chỉ Let's Encrypt
echo ">>> [3/4] Đang đăng ký chứng chỉ SSL chính thức từ Let's Encrypt..."
certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --keep-until-expiring

# 4. Khởi động lại container frontend để Nginx nạp chứng chỉ SSL mới
echo ">>> [4/4] Khởi động lại Nginx Frontend để kích hoạt HTTPS..."
docker start museum_frontend 2>/dev/null || (docker compose restart frontend 2>/dev/null || docker-compose restart frontend 2>/dev/null)

# 5. Cấu hình tự động gia hạn (Auto-renewal cron)
(crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "0 3 1 * * certbot renew --quiet && docker restart museum_frontend") | crontab -

echo "========================================================="
echo "🎉 CHỨNG CHỈ SSL ĐÃ ĐƯỢC CÀI ĐẶT THÀNH CÔNG!"
echo "Truy cập hệ thống an toàn tại:"
echo "👉 https://$DOMAIN"
echo "========================================================="
