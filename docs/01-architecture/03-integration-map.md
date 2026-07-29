# Bản đồ tích hợp giữa các chức năng

## Mục tiêu

Hai thành viên làm feature branch riêng nhưng dùng cùng hợp đồng. File này cho Codex biết feature nào cung cấp dữ liệu, feature nào tiêu thụ và nơi chứa nguồn sự thật.

## Quy tắc

- Chi tiết nội bộ thuộc feature branch; contract dùng chung phải được chấp nhận trên `develop`.
- Không đọc code dang dở của feature khác để suy luận contract.
- Không tạo DTO/entity/event song song chỉ khác tên.
- Thay contract phải ghi producer, consumer, compatibility và deployment order.

## Integration matrix

| Producer/Owner | Consumer | Shared contract/data | Nguồn sự thật | Trạng thái |
|---|---|---|---|---|
| Admin CMS | Public Web/PWA | Page, section, menu, banner, theme/motion/scene config | CMS block schema + OpenAPI | PLANNED |
| Admin CMS | Search/RAG | Artifact/exhibition translation và publish status | PostgreSQL schema + content event | PLANNED |
| Auth API | Web/Admin/History | Session, user identity, role/permission | Auth OpenAPI + permission matrix | PLANNED |
| Media module | CMS/Web/AI/3D | MediaRef, signed upload, rights/verification | Media contract + data catalog | PLANNED |
| Tour module | QR Guide/Map/History | Tour, stop, zone, QR resolution | Tour OpenAPI/event | PLANNED |
| Map module | Web 3D/Tour | Floor, node, edge, POI, route | Map contract | PLANNED |
| Artifact module | Recognition/Guide/Viewer | Artifact summary/detail, locale, media, Digital Twin ref | Artifact contract | PLANNED |
| Recognition worker | Web/History/Dashboard | Job progress, top-k, confidence, model version | Recognition event/result schema | PLANNED |
| RAG/Guide service | Web/Analytics | Answer, citation, refusal reason, locale, TTS ref | Guide contract | PLANNED |
| Digital Twin pipeline | Viewer/CMS/Dashboard | Model version, review status, LOD/assets | Digital Twin contract | PLANNED |
| Interaction events | Dashboard | Event envelope, anonymous session, consent | Event schema | PLANNED |

## Shared semantic baseline

### ID

Nghiệp vụ dùng UUID; Mongo/event giữ UUID dạng chuỗi khi liên kết logic. Public slug/QR token không thay ID nội bộ.

### Content state

`DRAFT -> IN_REVIEW -> APPROVED -> SCHEDULED/PUBLISHED -> ARCHIVED`

Public consumer chỉ nhận `PUBLISHED` và đúng hiệu lực.

### Job state

Baseline: `QUEUED -> RUNNING -> SUCCEEDED/FAILED/CANCELLED`. Progress từ 0–100 chỉ là thông tin UX; trạng thái nghiệp vụ mới quyết định kết quả.

### Locale

Locale theo BCP 47 như `vi`, `en`; backend có fallback policy rõ, client không tự ghép bản dịch tùy ý.

### Media reference

Consumer nhận ID/public delivery metadata, không nhận Cloudinary secret hoặc tự tạo unsigned mutation URL.

### Error

`{ code, message, details?, correlationId }`; consumer dùng `code`, không parse câu `message`.

## Shared-contract change record

| Ngày | Contract | Thay đổi/version | Producer | Consumers | Compatibility/Migration | Owner confirmation |
|---|---|---|---|---|---|---|
| — | Chưa có implementation contract | Baseline planning | — | — | — | — |

## Integration readiness checklist

- Contract có owner và version.
- Producer/consumer cùng dùng một schema nguồn.
- Optional field/default/fallback được mô tả.
- Permission và error code thống nhất.
- Backward compatibility/deploy order rõ.
- Contract/integration test có owner.
- Task registry không có hai task cùng sửa nguồn contract.
