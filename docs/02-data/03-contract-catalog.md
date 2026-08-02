# Contract catalog

Đây là mục lục các hợp đồng dùng chung. Khi source code được khởi tạo, đường dẫn placeholder phải được thay bằng đường dẫn thật.

| Contract | Nguồn sự thật dự kiến | Consumer | Trạng thái |
|---|---|---|---|
| REST API | `packages/contracts/openapi.yaml` | Web, Admin, API, AI | PLANNED |
| DTO/validation | `packages/contracts/src/` | React, Express | PLANNED |
| Event schema | `packages/contracts/events/` | API, workers | PLANNED |
| CMS block schema | `packages/contracts/cms/` | Admin, API, Web renderer | PLANNED |
| Narrative Journey schema/API/event | `packages/contracts/journeys/` + OpenAPI/event catalog | CMS, Public Web, API, AI Guide, History, Analytics, Web 3D | PLANNED; gồm allowlisted `FREE_EXPLORE`/`GUIDED_JOURNEY`, chưa accepted implementation contract |
| Permission matrix | Tài liệu này + seed/migration | API, Admin | BASELINE |
| Error catalog | `packages/contracts/errors/` | Mọi client/service | PLANNED |
| Environment catalog | `.env.example` + DevOps docs | Mọi service | PLANNED |

## Permission baseline

| Permission | Visitor | Member | Editor | Reviewer | Admin |
|---|---:|---:|---:|---:|---:|
| `content:read_public` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `history:manage_own` | | ✓ | ✓ | ✓ | ✓ |
| `content:create` | | | ✓ | ✓ | ✓ |
| `content:submit_review` | | | ✓ | ✓ | ✓ |
| `content:approve` | | | | ✓ | ✓ |
| `content:publish` | | | | Theo phạm vi | ✓ |
| `user:manage` | | | | | ✓ |
| `system:configure` | | | | | ✓ |

Quyền thực tế được backend enforce và có thể giới hạn theo exhibition/locale.

## Quy tắc contract

- Breaking change cần version/deprecation.
- Schema thay đổi phải cập nhật producer, consumer, test và traceability.
- Field chưa rõ không được tự đặt khác nhau ở frontend/backend.
- Error có `code`, `message`, `details?`, `correlationId`.
- Mọi contract phải có một owner; consumer không được fork/copy schema thành nguồn riêng.
- Thay đổi dùng chung phải cập nhật `docs/01-architecture/03-integration-map.md` và thông báo task owner bị ảnh hưởng.
- Contract chưa accepted trên `develop` không được coi là ổn định chỉ vì đã tồn tại trong một feature branch.
