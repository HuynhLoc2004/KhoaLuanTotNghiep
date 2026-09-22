#!/bin/sh
set -e

mkdir -p /etc/nginx/ssl /var/www/certbot

# Kiểm tra xem chứng chỉ Let's Encrypt đã được cấp chưa
LE_FULLCHAIN=$(find /etc/letsencrypt/live -name "fullchain.pem" 2>/dev/null | head -n 1)
LE_PRIVKEY=$(find /etc/letsencrypt/live -name "privkey.pem" 2>/dev/null | head -n 1)

if [ -n "$LE_FULLCHAIN" ] && [ -n "$LE_PRIVKEY" ] && [ -s "$LE_FULLCHAIN" ]; then
    echo "[SSL] Sử dụng chứng chỉ Let's Encrypt: $LE_FULLCHAIN"
    cp "$LE_FULLCHAIN" /etc/nginx/ssl/cert.pem
    cp "$LE_PRIVKEY" /etc/nginx/ssl/key.pem
else
    if [ ! -f /etc/nginx/ssl/cert.pem ]; then
        echo "[SSL] Tạo chứng chỉ SSL tự ký cho cổng 443..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/key.pem \
            -out /etc/nginx/ssl/cert.pem \
            -subj "/CN=103-178-233-206.sslip.io" 2>/dev/null
    fi
fi

# Tích hợp MIME types cho mô hình 3D (.glb, .gltf) vào hệ thống Nginx chuẩn
if [ -f /etc/nginx/mime.types ] && ! grep -q "model/gltf-binary" /etc/nginx/mime.types; then
    sed -i 's/}/    model\/gltf-binary glb;\n    model\/gltf+json gltf;\n}/' /etc/nginx/mime.types
fi

exec nginx -g "daemon off;"
