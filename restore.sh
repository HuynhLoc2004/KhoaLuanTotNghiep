#!/usr/bin/env bash
# ==============================================================================
# BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH - TOUR 360 & DI SẢN SỐ
# Công cụ Khôi phục Cơ sở Dữ liệu Toàn diện (MongoDB & PostgreSQL Restore)
# ==============================================================================
set -e

GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

ARCHIVE_PATH="$1"

if [ -z "$ARCHIVE_PATH" ] || [ ! -f "$ARCHIVE_PATH" ]; then
    echo -e "${RED}Lỗi: Vui lòng chỉ định đường dẫn tệp sao lưu .tar.gz!${NC}"
    echo -e "Ví dụ: ${CYAN}./restore.sh backups/museum_backup_20261121_120000.tar.gz${NC}"
    exit 1
fi

TEMP_RESTORE="backups/temp_restore_$(date +%s)"
mkdir -p "$TEMP_RESTORE"

echo -e "${AMBER}>>> Đang giải nén tệp sao lưu: $ARCHIVE_PATH...${NC}"
tar -xzf "$ARCHIVE_PATH" -C "$TEMP_RESTORE"

# 1. Khôi phục MongoDB
if [ -f "$TEMP_RESTORE/mongodb_museum.archive" ]; then
    echo -e "${AMBER}[1/2] Đang khôi phục CSDL Di sản (MongoDB)...${NC}"
    docker exec -i museum_mongodb mongorestore --db museum --archive --drop < "$TEMP_RESTORE/mongodb_museum.archive"
    echo -e "${GREEN}✓ Đã khôi phục MongoDB thành công!${NC}"
fi

# 2. Khôi phục PostgreSQL
if [ -f "$TEMP_RESTORE/postgres_museum.sql" ]; then
    echo -e "${AMBER}[2/2] Đang khôi phục CSDL Nghiệp vụ (PostgreSQL)...${NC}"
    docker exec -i -e PGPASSWORD=change-me-postgres museum_postgres psql -U postgres -d museum < "$TEMP_RESTORE/postgres_museum.sql"
    echo -e "${GREEN}✓ Đã khôi phục PostgreSQL thành công!${NC}"
fi

rm -rf "$TEMP_RESTORE"

echo -e "\n${GREEN}==============================================================================${NC}"
echo -e "${GREEN}✓ KHÔI PHỤC TOÀN BỘ CƠ SỞ DỮ LIỆU BẢO TÀNG THÀNH CÔNG!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
