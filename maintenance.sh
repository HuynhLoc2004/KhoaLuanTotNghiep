#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG TOUR 360 - BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH
# Công cụ Quản lý Chế độ Bảo trì Hệ thống (System Maintenance CLI)
# ==============================================================================
set -e

GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

FLAG_DIR="maintenance_flag"
FLAG_FILE="$FLAG_DIR/maintenance.flag"
JSON_FILE="$FLAG_DIR/maintenance.json"

mkdir -p "$FLAG_DIR"

COMMAND="${1:-status}"
REASON="${2:-Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật cơ sở dữ liệu hiện vật và bảo trì định kỳ.}"
MINUTES="${3:-30}"

case "$COMMAND" in
    on|start|enable)
        echo -e "${AMBER}>>> Đang kích hoạt Chế độ Bảo trì Hệ thống...${NC}"

        # 1. Tạo cờ trên host
        touch "$FLAG_FILE"

        # 2. Ghi metadata JSON
        NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")
        cat > "$JSON_FILE" << EOF
{
  "enabled": true,
  "title": "Hệ Thống Đang Nâng Cấp & Bảo Trì",
  "message": "$REASON",
  "estimatedMinutes": $MINUTES,
  "updatedAt": "$NOW",
  "updatedBy": "VPS Administrator (CLI)"
}
EOF

        # 3. Đồng bộ vào Docker container Nginx nếu đang chạy
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "museum_frontend"; then
            docker exec museum_frontend touch /usr/share/nginx/html/maintenance.flag 2>/dev/null || true
            docker exec museum_frontend touch /var/www/maintenance/maintenance.flag 2>/dev/null || true
        fi

        # 4. Đồng bộ vào Nginx host nếu có
        if [ -d "/var/www/museum" ]; then
            sudo touch /var/www/museum/maintenance.flag 2>/dev/null || true
        fi

        echo -e "\n${GREEN}==============================================================================${NC}"
        echo -e "${GREEN}✓ ĐÃ BẬT CHẾ ĐỘ BẢO TRÌ HỆ THỐNG THÀNH CÔNG!${NC}"
        echo -e "Lý do: $REASON"
        echo -e "Thời gian ước tính: $MINUTES phút"
        echo -e "Khách tham quan truy cập website sẽ thấy trang thông báo bảo trì trang nhã."
        echo -e "Để tắt chế độ bảo trì, hãy chạy: ${CYAN}./maintenance.sh off${NC}"
        echo -e "${GREEN}==============================================================================${NC}"
        ;;

    off|stop|disable)
        echo -e "${CYAN}>>> Đang tắt Chế độ Bảo trì & Phục hồi hệ thống...${NC}"

        # 1. Xóa cờ trên host
        rm -f "$FLAG_FILE"

        # 2. Cập nhật JSON giữ nguyên cấu hình đã cài đặt, chỉ đổi enabled: false
        NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date +"%Y-%m-%dT%H:%M:%SZ")
        if [ -f "$JSON_FILE" ]; then
            sed -i 's/"enabled": true/"enabled": false/g' "$JSON_FILE" 2>/dev/null || true
        else
            cat > "$JSON_FILE" << EOF
{
  "enabled": false,
  "title": "Hệ Thống Đang Nâng Cấp & Bảo Trì",
  "message": "Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật cơ sở dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.",
  "estimatedMinutes": 30,
  "updatedAt": "$NOW",
  "updatedBy": "VPS Administrator (CLI)"
}
EOF
        fi

        # 3. Xóa cờ trong Docker container
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "museum_frontend"; then
            docker exec museum_frontend rm -f /usr/share/nginx/html/maintenance.flag 2>/dev/null || true
            docker exec museum_frontend rm -f /var/www/maintenance/maintenance.flag 2>/dev/null || true
        fi

        # 4. Xóa cờ trên Nginx host
        if [ -d "/var/www/museum" ]; then
            sudo rm -f /var/www/museum/maintenance.flag 2>/dev/null || true
        fi

        echo -e "\n${GREEN}==============================================================================${NC}"
        echo -e "${GREEN}✓ ĐÃ TẮT BẢO TRÌ - HỆ THỐNG ĐÃ TRỰC TUYẾN TRỞ LẠI!${NC}"
        echo -e "Tất cả các trình duyệt của khách đang mở trang bảo trì sẽ tự động tải lại."
        echo -e "Website chính: http://museumhcm.duckdns.org (hoặc http://$(curl -s ifconfig.me 2>/dev/null || echo '103.178.233.206'))"
        echo -e "${GREEN}==============================================================================${NC}"
        ;;

    status)
        echo -e "${CYAN}==============================================================================${NC}"
        echo -e "${CYAN}  TRẠNG THÁI BẢO TRÌ HỆ THỐNG                                                ${NC}"
        echo -e "${CYAN}==============================================================================${NC}"
        if [ -f "$FLAG_FILE" ]; then
            echo -e "Trạng thái: ${AMBER}ĐANG BẬT BẢO TRÌ (ACTIVE)${NC}"
            if [ -f "$JSON_FILE" ]; then
                echo "Thông tin chi tiết:"
                cat "$JSON_FILE"
            fi
            echo -e "\nLệnh tắt bảo trì: ${GREEN}./maintenance.sh off${NC}"
        else
            echo -e "Trạng thái: ${GREEN}BÌNH THƯỜNG / TRỰC TUYẾN (ONLINE)${NC}"
            echo -e "Lệnh bật bảo trì: ${AMBER}./maintenance.sh on \"Lý do\" [số phút]${NC}"
        fi
        echo -e "${CYAN}==============================================================================${NC}"
        ;;

    *)
        echo "Cách sử dụng:"
        echo "  ./maintenance.sh on [lý do] [số phút ước tính]   -> Bật bảo trì"
        echo "  ./maintenance.sh off                             -> Tắt bảo trì"
        echo "  ./maintenance.sh status                          -> Xem trạng thái"
        exit 1
        ;;
esac
