# AI nhận diện hiện vật

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| Dataset/Model/API/Tests | PLANNED | Chưa khởi tạo code |

## Mục tiêu

Người dùng chụp ảnh hiện vật, hệ thống đề xuất hiện vật phù hợp và hiển thị text, media, 3D cùng thuyết minh đa ngôn ngữ nếu có.

## Flow

1. Client hướng dẫn căn khung, kiểm tra blur/độ sáng cơ bản.
2. Upload trực tiếp bằng signed URL và xóa EXIF nhạy cảm.
3. Worker chuẩn hóa ảnh, sinh embedding.
4. Vector search trong tập ảnh hiện vật đã duyệt.
5. Kết hợp metadata vị trí/khu vực hiện tại để rerank.
6. Nếu confidence đạt ngưỡng, trả top-3; nếu thấp, yêu cầu ảnh khác hoặc tìm thủ công.
7. Người dùng xác nhận/sửa để tạo feedback cho đánh giá sau này.

## Thuật toán đề xuất

### Giai đoạn MVP: embedding retrieval

CLIP/SigLIP hoặc model tương đương tạo vector; cosine similarity tìm ảnh gần nhất bằng pgvector/FAISS. Rerank:

`score = 0.75 * visual + 0.15 * zonePrior + 0.10 * metadataMatch`

Trọng số phải được hiệu chỉnh bằng validation set, không coi là cố định.

Ưu điểm: cần ít dữ liệu hơn classifier, thêm hiện vật mới không retrain toàn bộ. Nhược điểm: dễ nhầm vật thể giống nhau và ảnh chụp khác góc.

### Giai đoạn sau: detection + metric learning

Dùng detector tách hiện vật khỏi nền, fine-tune metric learning bằng nhiều góc chụp. Chính xác hơn nhưng cần dataset gán nhãn và GPU.

## Đánh giá

- Chia train/validation/test theo hiện vật và điều kiện chụp, tránh leakage.
- Top-1, Top-3 accuracy, macro F1, false acceptance rate, latency p95.
- Calibration curve để chọn ngưỡng “không chắc”.
- Kiểm thử riêng hiện vật ngoài bảo tàng/không thuộc dataset.

## Fallback 3D

`3D approved -> viewer 3D`; nếu không có thì `360 spin/video`; tiếp theo `gallery ảnh`; cuối cùng `text + ảnh đại diện`. Không tạo 3D giả rồi trình bày như dữ liệu bảo tồn.

## Bảo mật

Giới hạn kích thước, magic byte, malware scan, signed upload, retention ảnh tạm, consent rõ ràng; không dùng ảnh người dùng để huấn luyện nếu chưa đồng ý.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | MVP dùng embedding retrieval + top-k/confidence | Cần ít dữ liệu và thêm hiện vật không phải retrain toàn bộ; có thể nhầm vật giống nhau |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline nhận diện hiện vật | Review tài liệu, chưa có code |
