# Tài khoản, Google Login và lịch sử

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| Auth/RBAC/History/Tests | PLANNED | Chưa khởi tạo code |

## Flow đăng nhập Google

1. Client bắt đầu OIDC Authorization Code + PKCE.
2. Backend xác minh issuer, audience, nonce và state.
3. Tìm `auth_account(provider, providerSubject)`; không liên kết chỉ bằng email nếu chưa xác minh.
4. Tạo user hoặc liên kết có xác nhận.
5. Phát access token ngắn hạn; refresh token rotation, revoke khi reuse.

## Phân quyền

- `visitor`, `member`, `editor`, `reviewer`, `admin`, `super_admin`.
- Permission dạng `artifact:create`, `content:publish`, `user:manage`.
- Backend kiểm tra quyền; ẩn nút ở frontend chỉ là UX, không phải bảo mật.
- Có thể giới hạn editor theo exhibition/locale.

## Lịch sử người dùng

Lưu có consent: tour đã xem, QR đã quét, yêu thích, kết quả nhận diện, job 3D do user tạo. Dữ liệu binary ở Cloudinary; PostgreSQL giữ quyền sở hữu/trạng thái; event chi tiết ở Mongo.

## Khách không đăng nhập

Session ID ngẫu nhiên lưu cục bộ, không chứa PII. Khi đăng nhập, hỏi trước khi gộp lịch sử guest. Các chức năng cốt lõi như đọc/QR không bắt buộc tài khoản.

## Bảo mật

HttpOnly Secure SameSite cookie nếu cùng site; CSRF protection; password hash Argon2id nếu hỗ trợ tài khoản mật khẩu; MFA cho admin; session management và logout all devices.

## Nghiệm thu

- Login/logout/refresh/revoke hoạt động.
- User không truy cập được admin API dù sửa request.
- Lịch sử chỉ hiển thị đúng chủ sở hữu.
- Xóa tài khoản xử lý media, token và dữ liệu liên quan theo policy.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | OIDC Authorization Code + PKCE, backend kiểm tra RBAC | Giảm rủi ro token và không tin quyền từ client |

## Feature lifecycle và Contribution ledger

Áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`. Chưa có implementation session; không suy diễn contributor/timestamp từ plan.

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | Baseline docs | Nhóm | Feature plan |
| Claimed/Started/IMPLEMENTED/VERIFIED/Merged/Completed | Chưa có | — | — |

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| Chưa có | — | — | — | — | — | — | PLANNED | — | NOT RUN | Chờ task READY |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline auth, phân quyền và history | Review tài liệu, chưa có code |
