#!/usr/bin/env bash
# ==============================================================================
# BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH - TOUR 360 & DI SẢN SỐ
# Công cụ Sao lưu Cơ sở Dữ liệu Toàn diện (MongoDB & PostgreSQL Backup)
# ==============================================================================
set -e

GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DIR="$BACKUP_DIR/temp_$TIMESTAMP"
ARCHIVE_NAME="museum_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$TEMP_DIR"

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}>>> ĐANG KHỞI TẠO BẢN SAO LƯU CƠ SỞ DỮ LIỆU BẢO TÀNG (${TIMESTAMP})...${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# 1. Sao lưu MongoDB (Di sản, Gian phòng 360, Cổ vật 3D, Cài đặt)
echo -e "\n${AMBER}[1/3] Đang sao lưu CSDL Di sản (MongoDB NoSQL)...${NC}"
if docker ps --format '{{.Names}}' | grep -q "museum_mongodb"; then
    docker exec museum_mongodb mongodump --db museum --archive > "$TEMP_DIR/mongodb_museum.archive"
    MONGO_SIZE=$(du -h "$TEMP_DIR/mongodb_museum.archive" | cut -f1)
    echo -e "${GREEN}✓ Đã xuất MongoDB thành công (Kích thước: $MONGO_SIZE)${NC}"
else
    echo -e "${RED}✗ Container museum_mongodb không hoạt động! Bỏ qua.${NC}"
fi

# 2. Sao lưu PostgreSQL (Vé tham quan, Đơn hàng PayOS, Users, Logs)
echo -e "\n${AMBER}[2/3] Đang sao lưu CSDL Nghiệp vụ & Vé (PostgreSQL 16)...${NC}"
if docker ps --format '{{.Names}}' | grep -q "museum_postgres"; then
    docker exec -e PGPASSWORD=change-me-postgres museum_postgres pg_dump -U postgres -d museum --clean --if-exists > "$TEMP_DIR/postgres_museum.sql"
    PG_SIZE=$(du -h "$TEMP_DIR/postgres_museum.sql" | cut -f1)
    echo -e "${GREEN}✓ Đã xuất PostgreSQL thành công (Kích thước: $PG_SIZE)${NC}"
else
    echo -e "${RED}✗ Container museum_postgres không hoạt động! Bỏ qua.${NC}"
fi

# 3. Ghi file Manifest thông tin bản sao lưu
cat > "$TEMP_DIR/manifest.json" << EOF
{
  "system": "Bảo tàng Lịch sử TP. Hồ Chí Minh - Tour 360",
  "backupTimestamp": "$TIMESTAMP",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "databases": {
    "mongodb": "museum",
    "postgresql": "museum"
  },
  "type": "Full Enterprise Snapshot"
}
EOF

# 4. Đóng gói nén tar.gz
echo -e "\n${AMBER}[3/3] Đang nén tệp sao lưu toàn diện...${NC}"
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$TEMP_DIR" .
rm -rf "$TEMP_DIR"

TOTAL_SIZE=$(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1)

# 5. Dọn dẹp các bản backup cũ hơn 14 ngày để tránh đầy ổ cứng VPS
find "$BACKUP_DIR" -name "museum_backup_*.tar.gz" -mtime +14 -delete 2>/dev/null || true

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN}✓ SAO LƯU DỮ LIỆU BẢO TÀNG HOÀN TẤT THÀNH CÔNG!${NC}"
echo -e "Tệp lưu trữ: ${CYAN}$BACKUP_DIR/$ARCHIVE_NAME${NC} (Dung lượng: ${GREEN}$TOTAL_SIZE${NC})"
echo -e "Bao gồm: CSDL Di sản MongoDB (Gian phòng 360, Cổ vật 3D) + CSDL PostgreSQL (Vé, Đơn hàng, Users)"
echo -e "Để khôi phục dữ liệu khi cần, hãy chạy: ${CYAN}./restore.sh $BACKUP_DIR/$ARCHIVE_NAME${NC}"
echo -e "${GREEN}==============================================================================${NC}"
