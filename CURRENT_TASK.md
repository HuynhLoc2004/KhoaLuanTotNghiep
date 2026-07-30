# Công việc hiện tại

File này dành cho task đang hoạt động trên branch hiện tại. Khi bắt đầu feature, thay nội dung placeholder bằng task thực tế. Không dùng file này thay cho feature specification hoặc change history.

Thành viên vừa clone không mặc nhiên tiếp tục task trong file này. Hãy dùng `docs/NEXT_WORK.md` để chọn task `READY`.

## Git context

- Expected branch: `develop` — hiện chỉ chuẩn hóa tài liệu.
- Base branch: `develop`.
- Coding agent được phép commit/merge/push: Không.
- Last reviewed shared plan revision: `PLAN-0003`.

## Task

- Mã: DOC-GOVERNANCE-001
- Mục tiêu: Hoàn thiện trí nhớ vận hành và quy tắc làm việc cho AI/nhóm.
- Feature owner: `PROJECT_BRAIN.md`.
- Trạng thái: IMPLEMENTED, chờ nhóm review.

## Trong phạm vi

- Authority order, invariants, ADR baseline, contract/data catalog.
- Traceability matrix, Definition of Ready và handoff template.
- AI Experience & Documentation Quality Gate cho sáng tạo, dependency inventory và hiệu năng đa thiết bị.
- Code, Secret & Configuration Quality Gate cho clean code, typed config, URL/provider và credential safety.
- Database Query, Cache & Input Security Quality Gate cho server validation, injection prevention, index evidence và cache correctness.
- User-first identity gate: hỏi tên/Member ID trước, Git author chỉ kiểm tra sau xác nhận.
- Work Session & Feature Contribution Ledger cho identity recheck, attribution, timestamp và handoff.

## Ngoài phạm vi

- Khởi tạo source code ứng dụng.
- Cài dependency hoặc Docker.

## Acceptance criteria

- AI biết phải đọc gì trước khi code.
- Có quy tắc giải quyết mâu thuẫn và bảo toàn lịch sử.
- Có nơi sở hữu invariant, ADR, contract, data, traceability và handoff.
- Tất cả tài liệu mới được liên kết từ README/bộ não.
- UI/motion/3D có quality tiers, desktop/mobile evidence và technology inventory bắt buộc.
- Code/config có review evidence; secret không vào client/log/docs và environment-specific URL không hard-code.
- Data access có parameter binding/allowlist, query-plan/index evidence, scoped cache/invalidation và response/log redaction.
- Onboarding không gọi tên, suy luận danh tính từ Git hoặc dùng member placeholder trước câu trả lời của người dùng.
- Mỗi implementation session/người tiếp tục có row riêng; feature lifecycle giữ mốc bắt đầu, bàn giao, verification, merge và completion có evidence.

## Handoff status

Đã tạo baseline tài liệu, khóa các Quality Gate, user-first identity và Work Session Ledger tại `PLAN-0008`; người dùng review. Automation được theo dõi bởi `TASK-DOC-QUALITY-001` sau foundation/API/data tooling. Task code tiếp theo dự kiến dùng branch `feature/project-foundation` và phải viết lại file này theo phạm vi foundation.
