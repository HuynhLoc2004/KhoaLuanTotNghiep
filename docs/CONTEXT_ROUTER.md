# Context Router

Mục tiêu: chỉ cho Codex đọc đúng tài liệu cần thiết, tránh tải toàn repo.

## Ba tầng context

### Tầng 1 — `OVERVIEW`

Dùng khi người dùng nói “đọc sơ qua”, “dự án này làm gì”, “nên làm gì tiếp”.

Đọc:

- `AI_CONTEXT.md`
- `PROJECT_STATUS.md`
- `NEXT_WORK.md`
- `TEAM.md`
- `PLAN_SNAPSHOT.md`

Không đọc source code, toàn bộ feature docs, toàn bộ ADR hoặc `PROJECT_BRAIN.md`.

### Tầng 2 — `FEATURE`

Dùng khi người dùng hỏi/thiết kế một chức năng. Đọc feature owner và tối đa các shared docs được router chỉ định. Chỉ mở reference được feature liên kết trực tiếp khi cần.

Không quét feature khác hoặc source code.

Trước khi đề xuất mới, đọc `IMPLEMENTATION_INDEX.md` và `04-design/02-ui-component-registry.md` để biết capability/pattern đã merge và cần tái sử dụng.

### Tầng 3 — `IMPLEMENTATION`

Dùng sau khi người dùng chọn task và đúng branch:

- `AGENTS.md`, `PROJECT_BRAIN.md`, `CURRENT_TASK.md`.
- Feature owner.
- Invariant, ADR, integration/contract được router chỉ định.
- Source code trong write scope, direct imports, migration và test liên quan.
- Implementation Index và UI Registry để chống duplicate/lệch phong cách.
- Plan Snapshot để chỉ đọc lại các owner docs thay đổi kể từ revision của current task.

Không recursive-scan toàn codebase nếu chưa có bằng chứng cần thiết.

### Chế độ đặc biệt — `CODEBASE_OVERVIEW`

Dùng khi người dùng nói rõ “đọc src/source/code xem dự án đang làm gì”.

1. Đọc compact context như `OVERVIEW`.
2. Kiểm tra source có thực sự tồn tại bằng danh sách file/thư mục.
3. Nếu chưa có source, báo bằng chứng đã kiểm tra; không nói chỉ vì tài liệu ghi vậy.
4. Nếu có source, đọc có chọn lọc:
   - Manifest/workspace/build config.
   - Entry point của từng app/service.
   - Router/module/feature registry.
   - Shared contract/schema.
   - Database schema/migration chính.
   - Một số module đại diện cần thiết để hiểu capability.
5. Không đọc toàn bộ component, test, asset, generated/vendor hoặc feature branch người khác.
6. Đối chiếu code và docs:
   - `CODE_CONFIRMED`: có bằng chứng source.
   - `DOCS_ONLY`: mới thấy trong plan, chưa thấy implementation.
   - `DOCS_STALE`: code đã khác trạng thái/mô tả tài liệu.
7. Chỉ báo cáo; không sửa code/docs nếu người dùng chưa yêu cầu.

## Định tuyến theo chủ đề

| Chủ đề | Feature owner | Shared docs bắt buộc khi implementation |
|---|---|---|
| CMS/Admin/page builder | `03-features/01-admin-cms.md` | UI design, API contract, data model, integration map, security |
| Web 3D/dẫn đường | `03-features/02-web-3d-navigation.md` | Digital Twin, UI design, integration map, performance |
| QR/AI Tour Guide/RAG | `03-features/03-ai-tour-guide.md` | Multilingual voice, API contract, integration map, security |
| Nhận diện hiện vật | `03-features/04-artifact-recognition.md` | Data catalog, API contract, integration map, security/testing |
| Digital Twin/quét 3D | `03-features/05-digital-twin.md` | Web 3D, data catalog, performance |
| Đa ngôn ngữ/TTS | `03-features/06-multilingual-voice.md` | AI Tour Guide, data model, security |
| Login/RBAC/history | `03-features/07-auth-user-history.md` | API contract, data model, invariants, security |
| Dashboard/analytics | `03-features/08-dashboard-analytics.md` | Data model, integration map, performance/privacy |
| Database/API/contracts | `02-data/01-data-model.md`, `02-data/02-api-contract.md` | Contract catalog, integration map, invariants |
| UI/animation/design | `04-design/01-ui-ux-design-system.md` | Admin CMS, performance, ADR-004 |
| Docker/Nginx/CI | `06-devops/01-local-environment.md` | Architecture, observability, security |
| Git/branch/teamwork | `07-delivery/07-git-playbook.md` | Collaboration, TEAM, NEXT_WORK |

Đường dẫn trong bảng tương đối với thư mục `docs/`.

## Định tuyến theo ý định

| Người dùng hỏi | Tầng | Hành vi |
|---|---|---|
| “Đọc sơ qua dự án” | OVERVIEW | Tóm tắt sản phẩm, trạng thái, task tiếp theo; không code |
| “Đọc src/source xem dự án làm gì” | CODEBASE_OVERVIEW | Xác minh source, đọc entry point/router/contracts có chọn lọc và đối chiếu docs |
| “Chức năng AI Guide hoạt động sao?” | FEATURE | Đọc AI Guide + voice; giải thích flow/thuật toán |
| “Nên dùng thuật toán nào?” | FEATURE | Option Review, 2–4 phương án; chưa code |
| “Triển khai AI Guide” | IMPLEMENTATION | Kiểm tra task/branch, đọc scoped docs/code |
| “Fix lỗi login” | IMPLEMENTATION | Đọc auth owner, change history, scoped auth code/test |
| “Review nhánh B” | IMPLEMENTATION đặc biệt | Chỉ sau xác nhận owner/handoff; đọc diff/scope, không toàn repo |

## Quy tắc mở rộng context

Chỉ đọc thêm khi:

- Feature owner liên kết trực tiếp tới contract/ADR cần thiết.
- Có conflict giữa docs và code.
- Test/migration/import trực tiếp dẫn tới module khác.
- Security/invariant bị ảnh hưởng.
- Integration gate cần xác minh producer/consumer.

Mỗi lần mở rộng, Codex nói ngắn gọn vì sao cần file đó.

## Mẫu báo cáo context

```text
Đã đọc:
- AI_CONTEXT.md
- PROJECT_STATUS.md
- NEXT_WORK.md

Chưa đọc:
- Source code
- Feature specs chi tiết

Lý do: bạn đang yêu cầu overview, chưa chọn task.
```

Khi bắt đầu feature, thay danh sách bằng feature owner và shared docs thực tế.

## Mẫu báo cáo CODEBASE_OVERVIEW

```text
CODE_CONFIRMED:
- Các app/service và capability có bằng chứng từ entry point/router.

DOCS_ONLY:
- Chức năng mới nằm trong plan, chưa thấy code.

DOCS_STALE:
- Điểm code và tài liệu không khớp.

Đã đọc:
- Manifest/config/entry point cụ thể.

Chưa đọc:
- Component/test/asset không cần cho overview.
```
