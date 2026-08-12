# API và hợp đồng tích hợp

## Quy ước

- Base path `/api/v1`.
- JSON camelCase; thời gian ISO-8601 UTC.
- Validate bằng Zod; sinh OpenAPI.
- Pagination cursor cho feed lớn, page/limit cho bảng admin nhỏ.
- Mọi lỗi có `{ code, message, details?, correlationId }`.
- Header `Accept-Language`, `Idempotency-Key`, `If-None-Match` được hỗ trợ đúng ngữ cảnh.
- Server luôn validate/normalize input, giới hạn pagination/filter/sort và dùng response DTO allowlist; không tin client validation.
- Filter/sort/include chỉ dùng field/operator đã công bố trong contract; không nhận raw SQL/Mongo/search DSL.

## Nhóm endpoint

- Public: `/pages`, `/menus`, `/banners`, `/artifacts`, `/exhibitions`, `/tours`, `/journeys`, `/maps`.
- Experience: `/qr/:token`, `/navigation/routes`, `/recognitions`, `/guide/sessions`, `/journey-progress` (server sync chỉ khi có auth/consent).
- User: `/me`, `/me/history`, `/me/favorites`, `/me/assets`.
- Admin: `/admin/content/*`, `/admin/media/*`, `/admin/publishing/*`, `/admin/users/*`.
- Jobs: `/jobs/:id`, `/jobs/:id/events` (SSE), `/jobs/:id/cancel`.
- Auth: `/auth/google`, `/auth/callback`, `/auth/refresh`, `/auth/logout`.

`/journeys` và Narrative Journey event/schema hiện chỉ là planning contract của `FEAT-TIMELINE-001`; chưa được coi là implementation contract cho đến khi schema nguồn trong `packages/contracts/` được tạo, review và accepted trên `develop`.

Living Timeline dùng allowlisted `exploreMode = FREE_EXPLORE | GUIDED_JOURNEY`. QR resolver không tự chọn mode: direct Scan/Map/Search là free; Start/Continue journey là guided. Hai mode dùng chung artifact DTO/resolver; chỉ guided mode được gửi narrative progress mutation.

Related artifact dùng `GET /artifacts/:id/related`, mặc định 6 và tối đa 12 kết quả. Response chỉ gồm relation đã duyệt và target đang publish, với `relationType`, localized `reason`, source refs và deterministic `rankReason`. QR/recognition chỉ mở model 3D đã duyệt hoặc media/text fallback; không tạo 3D đồng bộ trong request.

## Ví dụ tạo nhận diện

1. Client xin signed upload.
2. Upload thẳng Cloudinary, tránh file lớn đi qua API.
3. `POST /recognitions` với public ID và idempotency key.
4. API tạo job và trả `202 { jobId, status }`.
5. Client theo dõi SSE/polling.
6. Kết quả gồm top-k, confidence, model version và phương án fallback.

## Version và tương thích

- Breaking change tạo `/v2`; additive field không breaking.
- Event có `eventType`, `eventVersion`, `eventId`, `occurredAt`, `payload`.
- Client bỏ qua field chưa biết; server không tái sử dụng ý nghĩa field cũ.

## Bảo vệ

- Public read: IP/session rate limit và cache.
- Upload/AI: yêu cầu quota, signed upload, MIME/magic-byte scan.
- Admin mutation: RBAC, CSRF nếu dùng cookie, MFA khuyến nghị, audit.
- Không trả stack trace, internal path hoặc secret.
- Mọi DB/search value dùng parameter binding; dynamic identifier/operator ánh xạ từ allowlist server-side.
- Permission/ownership phải đúng ở cả cache hit và cache miss; không lọc dữ liệu nhạy cảm sau khi đã đọc rộng.
- Không serialize ORM entity/provider error trực tiếp; response/log không lộ SQL, schema hoặc query parameter nhạy cảm.
