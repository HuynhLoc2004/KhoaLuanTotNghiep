# Mobile AI Tour Guide và QR

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| QR/RAG/TTS/Tests | PLANNED | Chưa khởi tạo code |

## Mục tiêu

Khách quét QR tại khu vực để nghe lịch sử, nguồn gốc, câu chuyện hiện vật và đặt câu hỏi bằng ngôn ngữ đã chọn.

## Flow QR

1. Camera/PWA đọc QR chứa URL token ngẫu nhiên, không chứa dữ liệu nhạy cảm.
2. API resolve token sang zone/tour stop còn hiệu lực.
3. Trả nội dung đã xuất bản, audio có sẵn và gợi ý điểm tiếp theo.
4. Ghi event ẩn danh; nếu đăng nhập thì đồng bộ lịch sử theo consent.

## Flow hỏi đáp AI

1. Nhận câu hỏi text hoặc STT.
2. Phát hiện ngôn ngữ, moderation và chuẩn hóa truy vấn.
3. Hybrid retrieval: PostgreSQL full-text + vector similarity, filter theo artifact/zone/locale/status.
4. Rerank top-k, dựng context có giới hạn token.
5. LLM trả lời dựa trên nguồn, kèm liên kết hiện vật/nguồn.
6. TTS đọc câu trả lời; cache câu hỏi phổ biến sau khi chuẩn hóa.

## Thuật toán

- RAG phù hợp hơn fine-tune cho nội dung bảo tàng thường xuyên cập nhật.
- Hybrid search khắc phục vector search bỏ sót tên riêng/mã hiện vật.
- Reciprocal Rank Fusion hợp nhất thứ hạng lexical và semantic.
- Confidence/gating: không đủ nguồn thì nói chưa có dữ liệu, không bịa.
- Session memory tóm tắt có giới hạn; không đưa toàn bộ lịch sử vào prompt.

## Ưu/nhược điểm

- RAG cập nhật nhanh, có nguồn và chi phí huấn luyện thấp; phụ thuộc chất lượng chunk/metadata.
- Audio dựng sẵn nhanh và ổn định; TTS động linh hoạt nhưng tốn chi phí/độ trễ.
- STT tiện dụng nhưng môi trường bảo tàng ồn; luôn có text input.

## An toàn và hiệu năng

- Prompt injection defense: nội dung truy xuất là dữ liệu, không phải lệnh.
- Chỉ index nội dung đã duyệt; log PII tối thiểu.
- Timeout/circuit breaker, quota theo user/session, streaming response.
- Cache audio theo hash của text + voice + locale + version.

## Nghiệm thu

- QR mở đúng khu vực kể cả chưa đăng nhập.
- Trả lời có nguồn và từ chối khi không đủ bằng chứng.
- Có ít nhất tiếng Việt và tiếng Anh; audio có nút dừng/tốc độ/phụ đề.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | Hybrid RAG có citation, không đủ nguồn thì từ chối | Nội dung cập nhật được và giảm hallucination; phụ thuộc chất lượng retrieval |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline QR Tour và AI Guide | Review tài liệu, chưa có code |
