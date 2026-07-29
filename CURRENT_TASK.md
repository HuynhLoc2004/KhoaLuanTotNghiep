# Công việc hiện tại

File này dành cho task đang hoạt động trên branch hiện tại. Khi bắt đầu feature, thay nội dung placeholder bằng task thực tế. Không dùng file này thay cho feature specification hoặc change history.

Thành viên vừa clone không mặc nhiên tiếp tục task trong file này. Hãy dùng `docs/NEXT_WORK.md` để chọn task `READY`.

## Git context

- Expected branch: `develop` — hiện chỉ chuẩn hóa tài liệu.
- Base branch: `develop`.
- Coding agent được phép commit/merge/push: Không.
- Last reviewed shared plan revision: `PLAN-0002`.

## Task

- Mã: DOC-GOVERNANCE-001
- Mục tiêu: Hoàn thiện trí nhớ vận hành và quy tắc làm việc cho AI/nhóm.
- Feature owner: `PROJECT_BRAIN.md`.
- Trạng thái: IMPLEMENTED, chờ nhóm review.

## Trong phạm vi

- Authority order, invariants, ADR baseline, contract/data catalog.
- Traceability matrix, Definition of Ready và handoff template.

## Ngoài phạm vi

- Khởi tạo source code ứng dụng.
- Cài dependency hoặc Docker.

## Acceptance criteria

- AI biết phải đọc gì trước khi code.
- Có quy tắc giải quyết mâu thuẫn và bảo toàn lịch sử.
- Có nơi sở hữu invariant, ADR, contract, data, traceability và handoff.
- Tất cả tài liệu mới được liên kết từ README/bộ não.

## Handoff status

Đã tạo baseline tài liệu; người dùng review. Task code tiếp theo dự kiến dùng branch `feature/project-foundation` và phải viết lại file này theo phạm vi foundation.
