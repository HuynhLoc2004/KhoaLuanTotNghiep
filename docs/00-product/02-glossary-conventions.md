# Thuật ngữ và quy ước

## Thuật ngữ

- Artifact: hiện vật.
- Exhibition: triển lãm/chuyên đề.
- Zone: khu vực hoặc phòng.
- POI: điểm quan tâm trên bản đồ.
- Digital Twin: bản sao số có hình học, metadata, phiên bản và lịch sử.
- CMS: hệ quản trị nội dung.
- PWA: web có khả năng cài đặt và dùng một phần offline.
- RAG: truy xuất ngữ cảnh rồi mới sinh câu trả lời.
- TTS/STT: chuyển text thành giọng nói/chuyển giọng nói thành text.

## Quy ước ID và thời gian

- PostgreSQL dùng UUID v7 nếu thư viện hỗ trợ, nếu không dùng UUID v4.
- MongoDB ghi `correlationId` và `userId` dạng chuỗi UUID để liên kết logic, không tạo foreign key xuyên database.
- Thời gian lưu UTC; giao diện hiển thị `Asia/Ho_Chi_Minh`.
- Slug không dùng làm khóa chính và có bảng redirect khi đổi slug.

## Trạng thái nội dung

`DRAFT -> IN_REVIEW -> APPROVED -> SCHEDULED/PUBLISHED -> ARCHIVED`

Chỉ `PUBLISHED` và đúng thời gian hiệu lực mới được API public trả về.

## Quy tắc tài liệu chức năng mới

Mỗi file phải có: mục tiêu, phạm vi, vai trò, flow, dữ liệu, API/event, thuật toán, lỗi/fallback, bảo mật, hiệu năng, kiểm thử, ưu/nhược điểm và tiêu chí nghiệm thu.
