#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG TOUR 360 - BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH
# Script Cập Nhật Code / Build lại VPS với Chế Độ Bảo Trì Tự Động (Maintenance Mode)
# ==============================================================================
set -e

GREEN='\033[0;32m'
AMBER='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}  TIẾN TRÌNH CẬP NHẬT MÃ NGUỒN & KHỞI ĐỘNG LẠI HỆ THỐNG (VPS)                ${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# 1. KÍCH HOẠT CHẾ ĐỘ BẢO TRÌ NGAY LẬP TỨC
echo -e "\n${AMBER}>>> [1/5] Kích hoạt cờ bảo trì hệ thống (Maintenance Mode)...${NC}"

# Tạo cờ cho Nginx container nếu Docker đang chạy
if docker ps --format '{{.Names}}' | grep -q "museum_frontend"; then
    docker exec museum_frontend touch /usr/share/nginx/html/maintenance.flag 2>/dev/null || true
    echo "✓ Đã bật bảo trì trên Docker container (museum_frontend)"
fi

# Tạo cờ cho Nginx host nếu dùng Nginx trực tiếp
if [ -d "/var/www/museum" ]; then
    sudo touch /var/www/museum/maintenance.flag 2>/dev/null || true
    echo "✓ Đã bật bảo trì trên Nginx host (/var/www/museum/maintenance.flag)"
fi

# 2. KÉO MÃ NGUỒN MỚI NHẤT TỪ GIT
echo -e "\n${AMBER}>>> [2/5] Kéo mã nguồn mới nhất từ Git repository...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
echo "Nhánh hiện tại: $CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH" || git pull || true

# 3. BUILD VÀ KHỞI ĐỘNG DỊCH VỤ
echo -e "\n${AMBER}>>> [3/5] Tiến hành Build & Khởi động lại dịch vụ...${NC}"

COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

if [ -n "$COMPOSE_CMD" ] && [ -f "docker-compose.yml" ]; then
    echo "Phát hiện môi trường Docker. Đang thực thi: $COMPOSE_CMD up -d --build..."
    $COMPOSE_CMD up -d --build
    
    # Bật lại cờ bảo trì trong container mới vừa build xong (để đợi backend khởi động xong hoàn toàn)
    docker exec museum_frontend touch /usr/share/nginx/html/maintenance.flag 2>/dev/null || true
else
    echo "Phát hiện môi trường Nginx + PM2..."
    
    # Backend
    if [ -d "backend" ]; then
        echo "Building Backend..."
        cd backend
        npm install
        npm run build
        pm2 restart museum-backend || pm2 start dist/server.js --name "museum-backend"
        cd ..
    fi

    # Frontend
    if [ -d "frontend" ]; then
        echo "Building Frontend..."
        cd frontend
        npm install
        npm run build
        sudo mkdir -p /var/www/museum
        sudo cp -r dist/* /var/www/museum/
        # Đảm bảo cờ bảo trì vẫn giữ nguyên trong lúc chờ backend
        sudo touch /var/www/museum/maintenance.flag 2>/dev/null || true
        cd ..
    fi
fi

# 4. CHỜ BACKEND KHỞI ĐỘNG VÀ VƯỢT QUA HEALTH CHECK
echo -e "\n${AMBER}>>> [4/5] Đang kiểm tra tín hiệu hoạt động (Health Check)...${NC}"
MAX_RETRIES=40
COUNT=0
BACKEND_HEALTH_URL="http://127.0.0.1:3000/api/health"

until curl -s -f "$BACKEND_HEALTH_URL" > /dev/null || [ $COUNT -ge $MAX_RETRIES ]; do
    COUNT=$((COUNT + 1))
    echo "Chờ máy chủ API Backend sẵn sàng... ($COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $COUNT -lt $MAX_RETRIES ]; then
    echo -e "${GREEN}✓ Máy chủ Backend đã trực tuyến và phản hồi mã 200 OK!${NC}"
else
    echo -e "${AMBER}⚠ Hết thời gian chờ nhưng vẫn tiếp tục mở hệ thống để kiểm tra log.${NC}"
fi

# 5. TẮT CỜ BẢO TRÌ - PHỤC HỒI HOẠT ĐỘNG
echo -e "\n${AMBER}>>> [5/5] Gỡ bỏ cờ bảo trì & Phục hồi hệ thống...${NC}"

if docker ps --format '{{.Names}}' | grep -q "museum_frontend"; then
    docker exec museum_frontend rm -f /usr/share/nginx/html/maintenance.flag 2>/dev/null || true
    echo "✓ Đã gỡ bỏ cờ bảo trì Docker container"
fi

if [ -d "/var/www/museum" ]; then
    sudo rm -f /var/www/museum/maintenance.flag 2>/dev/null || true
    echo "✓ Đã gỡ bỏ cờ bảo trì Nginx host"
fi

PUBLIC_IP=$(curl -s ifconfig.me || echo "103.178.233.206")

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN}🎉 HỆ THỐNG ĐÃ NÂNG CẤP VÀ KHỞI ĐỘNG LẠI THÀNH CÔNG!${NC}"
echo -e "Trình duyệt của khách tham quan và admin sẽ tự động kết nối lại vào hệ thống."
echo -e "Địa chỉ truy cập: http://${PUBLIC_IP}"
echo -e "${GREEN}==============================================================================${NC}"
