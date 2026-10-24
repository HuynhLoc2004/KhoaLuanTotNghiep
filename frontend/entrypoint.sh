#!/bin/sh
set -e

mkdir -p /etc/nginx/ssl /var/www/certbot

# Tên miền chính thức của hệ thống
DOMAIN="${DOMAIN:-museumhcm.duckdns.org}"

# Ưu tiên số 1: Chứng chỉ Let's Encrypt cho tên miền chính thức museumhcm.duckdns.org
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]; then
    echo "[SSL] Sử dụng chứng chỉ Let's Encrypt chính thức cho: $DOMAIN"
    cp -L "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/nginx/ssl/cert.pem
    cp -L "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/nginx/ssl/key.pem
else
    # Ưu tiên số 2: Tìm kiếm chứng chỉ Let's Encrypt khớp tên miền
    LE_FULLCHAIN=$(find /etc/letsencrypt/live -name "fullchain.pem" 2>/dev/null | grep -i "$DOMAIN" | head -n 1)
    if [ -z "$LE_FULLCHAIN" ]; then
        LE_FULLCHAIN=$(find /etc/letsencrypt/live -name "fullchain.pem" 2>/dev/null | head -n 1)
    fi

    if [ -n "$LE_FULLCHAIN" ]; then
        LE_DIR=$(dirname "$LE_FULLCHAIN")
        if [ -f "$LE_DIR/privkey.pem" ]; then
            echo "[SSL] Sử dụng chứng chỉ Let's Encrypt: $LE_DIR"
            cp -L "$LE_FULLCHAIN" /etc/nginx/ssl/cert.pem
            cp -L "$LE_DIR/privkey.pem" /etc/nginx/ssl/key.pem
        fi
    fi
fi

# Nếu vẫn chưa có chứng chỉ hợp lệ, tạo chứng chỉ dự phòng đúng tên miền $DOMAIN
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -s /etc/nginx/ssl/cert.pem ]; then
    echo "[SSL] Tạo chứng chỉ SSL dự phòng cho cổng 443 ($DOMAIN)..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/CN=$DOMAIN" 2>/dev/null
fi

# Tích hợp MIME types cho mô hình 3D (.glb, .gltf) vào hệ thống Nginx chuẩn
if [ -f /etc/nginx/mime.types ] && ! grep -q "model/gltf-binary" /etc/nginx/mime.types; then
    sed -i 's/}/    model\/gltf-binary glb;\n    model\/gltf+json gltf;\n}/' /etc/nginx/mime.types
fi

exec nginx -g "daemon off;"
