# Bảo mật và quyền riêng tư

## Mô hình đe dọa

Tài sản cần bảo vệ: tài khoản admin, nội dung chưa xuất bản, API key AI/Cloudinary, media private, dữ liệu người dùng và tính toàn vẹn của dữ liệu di sản.

Đe dọa chính: broken access control, injection, XSS, CSRF, upload độc hại, credential stuffing, spam AI, prompt injection, SSRF, dependency compromise và rò rỉ secret.

## Kiểm soát bắt buộc

- TLS, security headers/CSP, CORS allowlist, HSTS production.
- Zod validation, parameterized query/ORM, output encoding và sanitize rich text.
- RBAC/ownership check tại service layer; deny by default.
- Access token ngắn, refresh rotation, MFA admin, lockout/rate limit hợp lý.
- Upload signed, giới hạn MIME/kích thước, magic-byte, malware scan, random public ID.
- Egress allowlist cho worker nếu khả thi; chặn URL nội bộ để chống SSRF.
- Audit log bất biến ở cấp ứng dụng; cảnh báo thay quyền/publish/xóa.
- Dependency scan, secret scan, SAST trong CI.

## Secret

`.env` chỉ local và nằm trong `.gitignore`; commit `.env.example` không chứa giá trị. Production dùng secret manager/runtime secrets. Không log token, cookie, connection string hoặc prompt chứa PII.

Áp dụng thêm [Code, Secret & Configuration Quality Gate](04-code-configuration-quality-gate.md):

- Server secret không được đưa vào frontend/public environment, source map, fixture, tài liệu hoặc build artifact.
- Config loader phải validate schema và fail fast bằng lỗi đã redact.
- Không log nguyên request header, config object hoặc process environment.
- External origin/provider endpoint dùng typed config; user-supplied URL phải qua SSRF/redirect allowlist.
- Query/filter/operator từ input phải qua schema và allowlist; DB/search dùng parameter binding, không nối chuỗi.
- Response/cache/log phải giữ permission/ownership/publish boundary và không lộ SQL/schema/field nội bộ.

Chi tiết tại [Database Query, Cache & Input Security Quality Gate](05-database-query-cache-quality-gate.md).

## Rate limit

- Public read: token bucket theo IP + session, nới hơn khi cache hit.
- Login: theo IP + account identifier, chống enumeration.
- AI/upload: theo user, session, quota ngày và concurrency.
- Admin: giới hạn vừa phải, không làm hỏng thao tác batch hợp lệ.

## AI security

Tách system instruction khỏi retrieved content, đánh dấu nguồn không tin cậy, chỉ gọi tool allowlisted, validate output, không cho model tự publish. Nội dung AI sinh ra là draft và cần duyệt nếu trở thành nội dung chính thức.

## Checklist trước demo/deploy

- Không có secret trong Git history hiện tại.
- Frontend bundle/build artifact không chứa credential hoặc server-only configuration.
- Log/error mẫu đã được kiểm tra redaction.
- Seed admin không dùng mật khẩu mặc định production.
- Backup được restore thử.
- Test IDOR trên mọi endpoint theo ID.
- Log không chứa ảnh cá nhân/token.
- Có trang privacy/consent và cơ chế xóa dữ liệu.
