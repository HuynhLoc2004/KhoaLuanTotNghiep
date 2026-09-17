#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG TOUR 360 - BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH
# Automated Production Deployment Script for Ubuntu 22.04 / 24.04 LTS
# ==============================================================================
set -e

echo ">>> [1/7] Cập nhật hệ điều hành Ubuntu..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo ">>> [2/7] Cài đặt công cụ nền tảng & Python (OpenCV requirements)..."
sudo apt-get install -y curl git ufw nginx python3 python3-pip python3-venv libgl1 libglib2.0-0

echo ">>> [3/7] Cài đặt Node.js 20 LTS & PM2..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

echo ">>> [4/7] Cài đặt & Khởi động MongoDB..."
if ! command -v mongod &> /dev/null && ! command -v mongosh &> /dev/null; then
    sudo apt-get install -y mongodb || true
    if ! command -v mongod &> /dev/null; then
        # Cài MongoDB Community chính thức nếu gói apt mặc định không có
        curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
            sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        sudo apt-get update -y
        sudo apt-get install -y mongodb-org
    fi
fi
sudo systemctl enable mongod || sudo systemctl enable mongodb || true
sudo systemctl restart mongod || sudo systemctl restart mongodb || true

echo ">>> [5/7] Cài đặt thư viện Python (OpenCV Headless, NumPy)..."
cd stitching_worker
python3 -m pip install -r requirements.txt --break-system-packages || python3 -m pip install -r requirements.txt
cd ..

echo ">>> [6/7] Build & Khởi chạy Backend Node.js với PM2..."
cd backend
npm install
npm run build
pm2 delete museum-backend || true
pm2 start dist/server.js --name "museum-backend"
pm2 save
pm2 startup | tail -n 1 | sudo bash || true
cd ..

echo ">>> [7/7] Build Frontend & Cấu hình Nginx..."
cd frontend
npm install
npm run build
sudo mkdir -p /var/www/museum
sudo cp -r dist/* /var/www/museum/
cd ..

# Cấu hình Nginx Reverse Proxy
sudo tee /etc/nginx/sites-available/museum << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 100M;

    # Frontend Single Page App (Pannellum 360 WebGL)
    location / {
        root /var/www/museum;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Static Uploads / Stitched 360 Panoramas
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/museum /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Mở Firewall UFW
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

echo "=============================================================================="
echo "🎉 DEPLOY THÀNH CÔNG RỰC RỠ!"
echo "Truy cập ngay trên trình duyệt: http://$(curl -s ifconfig.me)"
echo "=============================================================================="
