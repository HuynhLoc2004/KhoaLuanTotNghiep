# Idea Backlog

Kho tiếp nhận ý tưởng mới. Đây là chỉ mục, không thay feature specification. Chi tiết flow/thuật toán nằm trong feature owner và concept review.

## Trạng thái

- `PROPOSED`: mới ghi nhận.
- `EVALUATING`: đang so sánh concept.
- `PLAN_LOCKED`: đã được người dùng chọn.
- `IN_PROGRESS`: đang triển khai.
- `IMPLEMENTED`: đã code, chờ nhóm review.
- `VERIFIED`: nhóm đã test/review.
- `DEFERRED`: hợp lý nhưng chưa ưu tiên.
- `REJECTED`: không chọn, có lý do.

## Ideas

| Idea ID | Ý tưởng | Feature owner | Trạng thái | Concept/Decision | Confidence | Estimate | Task/Owner |
|---|---|---|---|---|---|---|---|
| IDEA-001 | Immersive 3D storytelling và animation có bản sắc | `docs/04-design/01-ui-ux-design-system.md` | PLAN_LOCKED | `docs/04-design/03-ai-experience-quality-gate.md`; `DEC-UX-QUALITY-001` | HIGH | Gate docs: <1 person-day; automation: 1–2 person-days sau foundation | `loc`; automation chưa nhận |

## Quy tắc

- Mọi ý tưởng mới được thêm một dòng trước/cùng lúc phân tích.
- Một idea có một feature owner; cross-feature impact dùng liên kết.
- Không đánh dấu `PLAN_LOCKED` khi người dùng chưa chọn.
- Không đánh dấu `VERIFIED` bởi Codex.
- Estimate thay đổi phải giữ revision trong concept/feature history.
- Ý tưởng bị loại không bị xóa; ghi lý do để tránh đề xuất lặp lại.

## Mẫu dòng mới

| Idea ID | Ý tưởng | Feature owner | Trạng thái | Concept/Decision | Confidence | Estimate | Task/Owner |
|---|---|---|---|---|---|---|---|
| IDEA-xxx | Giá trị người dùng, không chỉ tên hiệu ứng | path | PROPOSED | path/DEC-id | LOW/MEDIUM/HIGH | O/E/P | Chưa có |
