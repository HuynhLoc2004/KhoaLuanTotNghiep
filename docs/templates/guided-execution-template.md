# Mẫu hướng dẫn từng bước

## Roadmap ngắn

- Gate hiện tại:
- Các gate tiếp theo:
- Mục tiêu cuối của task:

Trước implementation phải có `PRE_CODE_PLAN_SYNC: PASS`: mọi thay đổi shared plan/task đã xuất hiện trên remote `develop`, collaborator đã pull và write scope không collision. Codex phải nhắc bước publish/pull này; xác nhận miệng hoặc plan chỉ tồn tại trên feature branch chưa đủ để qua gate. Khi plan/task thay đổi trong lúc làm, gate quay lại trạng thái pending cho phần phụ thuộc cho đến khi `develop` được cập nhật và collaborator pull lại.

Không liệt kê toàn bộ lệnh chi tiết cho các gate tương lai.

## Bước tiếp theo được khuyến nghị

### Mục tiêu

Một kết quả duy nhất, kiểm chứng được.

### Vì sao đây là bước tiếp theo

Dependency, trạng thái plan và lý do không nên làm bước khác trước.

### USER ACTION

Việc người dùng cần tự xác nhận/chạy. Nếu không có, ghi “Không”.

### CODEX ACTION

Việc Codex sẽ đọc, phân tích, sửa hoặc kiểm thử sau khi nhận kết quả.

### Kết quả mong đợi

Output, branch, file, trạng thái hoặc test result cụ thể.

### CHECKPOINT

Cách xác nhận PASS/FAIL.

### STOP IF

Điều kiện dừng: branch sai, dirty tree, conflict, thiếu quyền, test fail, contract chưa chốt hoặc output khác dự kiến.

### Docs impact

- Đọc:
- Cập nhật:
- Chưa cần đọc:

## Sau khi checkpoint PASS

Nêu tên gate tiếp theo bằng một câu; chưa triển khai trước.

## Quy tắc

- Một bước có thể gồm vài lệnh chỉ đọc/an toàn cùng mục tiêu.
- Pull, merge, migration, dependency install và quyết định kiến trúc phải có checkpoint riêng.
- Codex không nhận phần USER ACTION là đã hoàn thành nếu chưa có output/xác nhận.
- Không đánh dấu `VERIFIED`; chờ người dùng review.
