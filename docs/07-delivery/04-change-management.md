# Quy trình quản lý thay đổi

## Mục tiêu

Cho phép đề tài thay đổi dần mà vẫn biết yêu cầu nào ảnh hưởng UI, API, database, AI, hạ tầng và báo cáo.

## Quy trình

1. Mọi yêu cầu code/fix được tự động xem là documentation intake; tìm file owner hoặc tạo feature file từ template nếu chưa có.
2. Gán mã `FEAT-xxx`, owner, priority và trạng thái.
3. Làm impact analysis: persona, flow, API, schema, cache, quyền, chi phí và migration.
4. Cập nhật acceptance criteria trước khi code.
5. Nếu thay quyết định kiến trúc lớn, tạo ADR riêng trong `docs/01-architecture/adr/`.
6. Implement theo lát cắt dọc nhỏ, có migration và feature flag khi rủi ro.
7. Cập nhật OpenAPI, test, sơ đồ và báo cáo cùng pull request.
8. Cập nhật Implementation status, Decision log, Change history và estimate revision trong cùng lượt code.
9. Nếu có nhiều phương án đáng kể, hoàn tất Option Review và nhận `PLAN_LOCKED` trước khi triển khai.

## Trạng thái

`PROPOSED -> ANALYZED -> APPROVED -> IN_PROGRESS -> VERIFYING -> DONE`

`DEFERRED` dùng khi hợp lý nhưng chưa làm; `REJECTED` phải ghi lý do.

## Quy tắc version

- Database migration không sửa migration đã chạy ở máy khác; tạo migration mới.
- API breaking change cần version mới hoặc giai đoạn deprecation.
- Model AI, prompt, embedding và dataset đều có version độc lập.
- Feature file ghi người phụ trách và ngày cập nhật khi bắt đầu triển khai.
- Không xóa quyết định/plan cũ; đánh dấu `SUPERSEDED`/`DEFERRED` và ghi liên kết thay thế.
- File mới phải được thêm vào README và Project Status.

## Chọn file owner

- Một yêu cầu nhỏ thuộc flow hiện có: cập nhật feature hiện có.
- Một capability có persona/flow/API riêng: tạo feature file mới.
- Một thay đổi công nghệ xuyên hệ thống: ADR làm owner, feature ghi liên kết và ảnh hưởng.
- Một bug: ghi root cause/test ở feature sở hữu hành vi; quy tắc chung chỉ cập nhật nếu bài học áp dụng toàn hệ thống.

## Ước lượng

Ước lượng theo `Optimistic / Expected / Pessimistic`, person-day, dependency và mức tin cậy. Không tự hứa ngày hoàn thành khi chưa biết lịch làm việc. Khi scope đổi, giữ estimate cũ trong lịch sử và ghi revision.

## Plan lock

- `DESIGN_OPTIONS`: đang so sánh, chưa code phần phụ thuộc quyết định.
- `PLAN_LOCKED`: người dùng đã chọn, được phép triển khai đúng phương án.
- `SUPERSEDED`: có revision mới được xác nhận; giữ lịch sử.

Phát hiện mới trong lúc code không cho phép tự đổi plan. Ghi bằng chứng, tác động và xin xác nhận revision.

## Checklist impact analysis

- Có làm dữ liệu cũ không đọc được?
- Có làm cache cũ trả sai?
- Có cần quyền mới hoặc audit event?
- Có tăng bundle, số query hoặc chi phí AI/media?
- Có fallback cho thiết bị yếu, thiếu dữ liệu và provider lỗi?
- Có cần consent/retention mới?
- Thành viên nào bị ảnh hưởng và hợp đồng tích hợp nằm ở đâu?
