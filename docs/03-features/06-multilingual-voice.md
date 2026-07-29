# Đa ngôn ngữ, text và voice

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| Translation/TTS/Player/Tests | PLANNED | Chưa khởi tạo code |

## Phạm vi

MVP hỗ trợ tiếng Việt và tiếng Anh; schema mở rộng cho ngôn ngữ khác. Nội dung chuyên môn phải được con người duyệt trước khi xuất bản.

## Flow nội dung

1. Bản gốc tiếng Việt được biên tập và duyệt.
2. Bản dịch do người dịch hoặc AI hỗ trợ tạo ở trạng thái draft.
3. Kiểm duyệt thuật ngữ, tên riêng, niên đại và cách đọc.
4. Tạo audio TTS hoặc upload giọng thật.
5. Publish theo từng locale; fallback về tiếng Việt nếu thiếu.

## Thuật toán/quy tắc

- Translation memory theo đoạn và glossary thuật ngữ.
- Cache TTS với hash `normalizedText + voice + speed + locale + engineVersion`.
- SSML điều khiển ngắt, ngày tháng và tên riêng.
- Audio loudness normalization; tạo caption/timestamp khi có thể.

## Ưu/nhược điểm

TTS mở rộng nhanh và rẻ hơn thu âm; cách đọc tên cổ có thể sai. Thu âm người thật giàu cảm xúc nhưng cập nhật chậm. Giải pháp phù hợp là hybrid: nội dung trọng điểm dùng giọng thật, nội dung dài/động dùng TTS đã duyệt.

## Trải nghiệm và accessibility

Player có play/pause, seek, tốc độ, transcript, autoplay mặc định tắt. Không chỉ dựa vào audio; mọi audio có text tương đương.

## Bảo mật/chi phí

API key TTS chỉ ở backend; quota theo vai trò; admin xem ước tính chi phí trước khi tạo hàng loạt; không tái tạo audio nếu hash không đổi.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | Hybrid giọng thật và TTS có kiểm duyệt | Cân bằng cảm xúc, tốc độ cập nhật và chi phí |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline đa ngôn ngữ và voice | Review tài liệu, chưa có code |
