# OPTION-xxx — Đánh giá phương án

## Decision context

- Feature owner:
- Vấn đề cần quyết định:
- Ràng buộc:
- Invariants/contract liên quan:
- Decision owner:
- Trạng thái: DESIGN_OPTIONS

## Tiêu chí và trọng số

| Tiêu chí | Trọng số | Cách đo |
|---|---:|---|
| Phù hợp nghiệp vụ | | |
| Chất lượng/độ chính xác | | |
| Hiệu năng/scale | | |
| Độ phức tạp | | |
| Security/privacy | | |
| Chi phí | | |
| Bảo trì/mở rộng | | |

Tổng trọng số nên bằng 100. Trọng số là công cụ giải thích, không thay quyết định chuyên môn.

## Phương án A — Tên

### Flow/thuật toán

Input -> các bước -> output -> failure/fallback.

### Ưu điểm

- 

### Nhược điểm

- 

### Phù hợp và scale

- Mức phù hợp: LOW/MEDIUM/HIGH.
- 300–500 concurrent users:
- Đường mở rộng:

### Bảo mật, chi phí và dependency

- 

### Metric kiểm chứng

- 

## Phương án B — Tên

Lặp lại cùng cấu trúc. Thêm tối đa phương án C/D khi thực sự khả thi.

## Bảng so sánh

| Phương án | Điểm mạnh | Trade-off chính | Effort | Risk | Weighted score |
|---|---|---|---|---|---:|
| A | | | | | |
| B | | | | | |

## Khuyến nghị của Codex

- Phương án khuyến nghị:
- Lý do:
- Khi nào nên chọn phương án khác:
- Bằng chứng/nguồn chính thức cần xác minh:

## Quyết định của người dùng

- Chọn:
- Ngày:
- Điều kiện/fallback:
- Người xác nhận:
- Trạng thái sau xác nhận: PLAN_LOCKED

## Implementation lock

- Algorithm/library/model/version:
- Contract/schema:
- Threshold/config:
- Acceptance metrics:
- Điều kiện được mở lại quyết định:

Không code khác phần lock nếu chưa có Plan Revision được xác nhận.

## Plan revisions

| Ngày | Bằng chứng mới | Plan cũ | Đề xuất mới | Tác động | Xác nhận |
|---|---|---|---|---|---|
| | | | | | |
