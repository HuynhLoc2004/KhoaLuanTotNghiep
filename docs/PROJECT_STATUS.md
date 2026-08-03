# Trạng thái dự án

File này là ảnh chụp trạng thái hiện tại, không thay thế chi tiết trong từng feature. Cập nhật khi một feature/milestone đổi trạng thái; quyết định và change history chi tiết vẫn nằm trong file sở hữu chức năng.

## Trạng thái hiện tại

- Giai đoạn: Foundation implementation.
- Baseline tài liệu: v0.1.
- Code ứng dụng: foundation monorepo/tooling và các skeleton Web, Admin, API, AI, media worker, contracts, UI đã merge tại `3d8b971`.
- Môi trường Docker: local database infrastructure đã merge tại `847251c`; còn chờ Merge Memory Sync riêng.
- Feature/task: `TASK-FOUND-001` (`thanh`) `DONE`, đã `VERIFIED` và merge tại `3d8b971`; `TASK-INFRA-001` (`loc`) đã merge tại `847251c`, chờ đồng bộ shared memory trước khi chuyển `DONE`.
- Experience requirement: đã bổ sung immersive 3D/animation và CMS-driven presentation; chưa triển khai code.
- AI/project memory governance: IMPLEMENTED, chờ nhóm review; gồm invariants, ADR, contract/data catalog, traceability, current task và handoff.
- Two-person coordination protocol: IMPLEMENTED, chờ nhóm review; gồm task claim, write scope, collision và stale detection.
- Task switching protocol: IMPLEMENTED, chờ nhóm review; AI đề xuất push/merge theo mức hoàn thiện nhưng không tự thực hiện.
- Member identity protocol: IMPLEMENTED, chờ nhóm review; chat mới phải hỏi tên/Member ID trước, không suy luận từ Git hoặc dùng placeholder. Git author chỉ kiểm tra nhất quán sau xác nhận.
- Branch isolation protocol: IMPLEMENTED, chờ nhóm review; mỗi người làm branch riêng và dùng `develop` làm nguồn tích hợp.
- Git beginner assistance: IMPLEMENTED, chờ nhóm review; gồm clone, tracking, pull/fetch/merge và xử lý trạng thái bất thường.
- Cross-feature integration protocol: IMPLEMENTED ở mức plan; shared contracts thực tế sẽ được tạo trong Pha 1.
- Option Review & Plan Lock: IMPLEMENTED ở mức quy trình; lựa chọn quan trọng phải được người dùng chốt trước khi code.
- Progressive context loading: IMPLEMENTED; chat mới dùng AI Context/Router, chỉ đọc code theo write scope sau khi chọn task.
- Guided Execution Protocol: IMPLEMENTED; Codex hướng dẫn theo gate/checkpoint và dependency của plan.
- CODEBASE_OVERVIEW: IMPLEMENTED trong router; yêu cầu đọc src phải xác minh filesystem và phân loại CODE_CONFIRMED/DOCS_ONLY/DOCS_STALE.
- Creative Concept Protocol: IMPLEMENTED ở mức quy trình; ý tưởng mới phải được đề xuất concept, đánh giá và PLAN_LOCKED trước khi code.
- Shared implementation memory: IMPLEMENTED ở mức tài liệu; sau mỗi merge develop phải đồng bộ Implementation Index và UI Registry.
- Plan Publication & Sync: IMPLEMENTED ở mức quy trình; shared plan dùng PLAN_SNAPSHOT revision và phải được đưa lên remote develop.
- Feature Report Standard: IMPLEMENTED ở mức quy trình; mọi feature phải có Mermaid flow, explanation, technology, algorithm, auth, trade-offs, estimate và evidence.
- AI Experience & Documentation Quality Gate: PLAN_LOCKED ở mức tài liệu; cho phép nhiều công nghệ có trách nhiệm, bắt buộc dependency inventory, thematic motion, desktop/mobile performance evidence và quality-tier fallback. Automation bị chặn bởi foundation.
- Code, Secret & Configuration Quality Gate: PLAN_LOCKED ở mức tài liệu; bắt buộc clean-code review, typed config, server-only secrets, URL/provider configuration và evidence từ scan/test. Automation gộp vào `TASK-DOC-QUALITY-001` sau foundation.
- Database Query, Cache & Input Security Quality Gate: PLAN_LOCKED ở mức tài liệu; bắt buộc server validation, parameterized query/allowlist, evidence-based index, scoped cache/invalidation và response/log redaction. Automation chờ API/data foundation.
- Work Session & Feature Contribution Ledger: PLAN_LOCKED ở mức quy trình; hỏi lại danh tính sau 4 giờ/new context, lưu từng phiên/người/scope/test/handoff và feature lifecycle; chưa có implementation session vì source chưa khởi tạo.
- Project foundation: VERIFIED và merge tại `3d8b971`; root quality gate, 5 TypeScript package tests và 2 Python tests PASS theo task evidence. Fresh-clone độc lập và CI automation vẫn là giới hạn mở.
- Local infrastructure: VERIFIED và đã merge tại `847251c`; PostgreSQL/pgvector, MongoDB và Redis đều healthy trong runtime smoke, local env được ignore; còn chờ Merge Memory Sync riêng.
- Conflict-free task documentation: PLAN_LOCKED tại `PLAN-0017`; feature branch dùng `docs/work/<TASK-ID>.md`, shared status/index/catalog files chỉ sửa trên `develop`. PR foundation/infra hiện tại cần cleanup một lần trước merge.
- Living Timeline/Dòng thời gian sống: PLAN_LOCKED ở mức concept tại `docs/03-features/11-living-timeline.md`; một QR pipeline hỗ trợ free/guided modes, typed curator-approved Artifact Relationship và explained deterministic recommendation; QR chỉ mở 3D đã duyệt/fallback, chưa có code và BLOCKED bởi foundation/contracts/content/relation baseline.
- Search/Discovery: PLANNED; hybrid lexical/vector baseline, BLOCKED bởi foundation/API/data/CMS.
- Polyglot extension policy: IMPLEMENTED; runtime mới cần Option Review và bằng chứng.
- Indoor Location QR/Photo: PLANNED; QR là anchor, visual place recognition là bổ trợ có confidence/fallback.

## Milestone

| Milestone | Trạng thái | Tài liệu chính | Ghi chú |
|---|---|---|---|
| Pha 0 — Chuẩn hóa | IN_PROGRESS | `docs/00-product/`, `docs/01-architecture/` | Baseline và trí nhớ vận hành đã có, chờ nhóm review |
| Pha 1 — Nền tảng | IN_PROGRESS | `docs/06-devops/01-local-environment.md` | Monorepo/tooling foundation đã merge; local database infrastructure đã merge và chờ memory sync; auth chưa triển khai |
| Pha 2 — CMS + public content | PLANNED | `docs/03-features/01-admin-cms.md` | |
| Pha 3 — QR Tour + voice + narrative journey | PLANNED | `03-ai-tour-guide.md`, `06-multilingual-voice.md`, `11-living-timeline.md` | Living Timeline làm MVP 2D trước AI/3D |
| Pha 4 — Bản đồ 3D | PLANNED | `02-web-3d-navigation.md` | |
| Pha 5 — AI | PLANNED | `03-ai-tour-guide.md`, `04-artifact-recognition.md` | |
| Pha 6 — Digital Twin + dashboard | PLANNED | `05-digital-twin.md`, `08-dashboard-analytics.md` | |
| Pha 7 — Hardening | PLANNED | `docs/05-quality/` | |

## Việc tiếp theo được đề xuất

Task `READY` và phân công mới được quản lý tại `docs/NEXT_WORK.md`. Foundation đã hoàn tất; task kế tiếp chỉ được mở sau khi dependency và write scope trong registry được xác nhận.

## Blocker và câu hỏi mở

- Chưa có blocker kỹ thuật.
- Cần nhóm review baseline trước khi khóa kiến trúc Pha 1.

## Quy tắc cập nhật

- Agent chỉ ghi `IMPLEMENTED` sau khi code và test của agent hoàn tất.
- Chỉ nhóm/người dùng đổi thành `VERIFIED` sau review/test.
- Khi merge/release, người dùng có thể yêu cầu cập nhật commit/tag tham chiếu.
- Không ghi log chi tiết mọi file tại đây; liên kết đến feature/ADR tương ứng.
- Chức năng mới phải tự động có feature file owner và dòng trạng thái tại đây, không cần người dùng nhắc tạo Markdown.
- Estimate tổng quan chỉ tham chiếu feature file; không sao chép chi tiết để tránh hai nguồn sự thật.
- Thành viên mới không tự nhận task từ `CURRENT_TASK.md`; chỉ chọn task `READY` trong `docs/NEXT_WORK.md`.
