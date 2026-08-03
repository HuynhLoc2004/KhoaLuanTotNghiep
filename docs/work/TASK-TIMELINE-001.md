# TASK-TIMELINE-001 — MVP Dòng thời gian sống (Living Timeline)

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `feature/TASK-TIMELINE-001`.
- Base/shared plan revision: `PLAN-0021`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Triển khai tính năng di sản cốt lõi "Dòng thời gian sống" (Living Timeline MVP) hỗ trợ 2 chế độ khám phá (`FREE_EXPLORE` và `GUIDED_JOURNEY`), hiển thị các mốc thời gian/nhân vật/sự kiện, liên kết các hiện vật bảo tàng cùng lý do kết nối lịch sử, cung cấp REST API endpoint và giao diện hiển thị 2D theo [11-living-timeline.md](../03-features/11-living-timeline.md).
- Owned paths: `packages/contracts/src/timeline/**`, `apps/web/src/timeline/**`, `apps/admin/src/timeline/**`, `services/api/src/routes/timeline.ts`, `docs/work/TASK-TIMELINE-001.md`.
- Explicitly excluded: `infra/**`, `.github/workflows/**`, shared status/coordination files (`README.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`).

## PLAN_LOCKED

- Selected Option: Phương án A (Modular End-to-End Vertical Slice: Contracts ➔ API Router ➔ 2D Interactive Timeline UI).
- Exploration Modes: `FREE_EXPLORE` (Khám phá tự do 2D) và `GUIDED_JOURNEY` (Hành trình tường thuật theo bước).
  1. `FREE_EXPLORE`: Khám phá tự do hiện vật theo dòng thời gian 2D, không bắt buộc thứ tự.
  2. `GUIDED_JOURNEY`: Khám phá theo tuyến hành trình tường thuật (Narrative Journey graph) có thứ tự node & câu chuyện dẫn dắt.
- Related Artifact Cards: Mỗi hiện vật trên timeline hiển thị mối liên kết (cùng triều đại/thời kỳ/văn hóa/nhân vật/sự kiện) kèm lý do kết nối đã được phê duyệt.
- API Endpoints:
  - `GET /api/v1/timeline/journeys`: Danh sách các hành trình dòng thời gian đã publish.
  - `GET /api/v1/timeline/journeys/:id`: Chi tiết narrative graph (nodes, edges, artifacts) của một hành trình.
  - `GET /api/v1/timeline/artifacts/:code/related`: Lấy danh sách hiện vật liên quan kèm lý do kết nối.
- Acceptance criteria:
  1. Shared Zod contracts cho Living Timeline được định nghĩa trong `@hcmc-museum/contracts`.
  2. API endpoints `/api/v1/timeline/*` trả về dữ liệu chuẩn Zod schema.
  3. Giao diện Web Shell hiển thị Timeline 2D hỗ trợ chuyển đổi chế độ `FREE_EXPLORE` và `GUIDED_JOURNEY`.
  4. Unit & Integration tests đạt 100% PASS across packages.

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T21:53:41+07:00 | 2026-08-03T21:57:20+07:00 | 2026-08-03T21:57:20+07:00 | IMPLEMENTED | Zod Contracts, Express REST API Router, Mode Switcher Pill Component, 2D Timeline Renderer, Web Shell Timeline Page | 28/28 tests PASS, build PASS | Người dùng review/verify & push PR |

## Implementation evidence

- Behavior/files:
  - `packages/contracts/src/timeline/schemas.ts`: `ExplorationModeSchema`, `NarrativeNodeSchema`, `NarrativeJourneySchema`, `RelatedArtifactSchema`.
  - `services/api/src/routes/timeline.ts`: `timelineRouter` phục vụ `/api/v1/timeline/journeys`, `/api/v1/timeline/journeys/:id` và `/api/v1/timeline/artifacts/:code/related`.
  - `packages/ui/src/timeline/renderer.ts`: `renderModeSwitcher`, `renderRelatedArtifactCard`, `renderLivingTimeline2D`.
  - `apps/web/src/timeline/page.ts`: `renderLivingTimelinePage` ghép nối Header, 2D Timeline, Related Cards và Footer.
  - Test suites: `packages/contracts/test/timeline.test.ts`, `packages/ui/test/timeline.test.ts`, `services/api/test/timeline.test.ts`, `apps/web/test/timeline.test.ts` (Total 28/28 tests PASS).
- Tests: `corepack pnpm -r run build` (PASS), `corepack pnpm -r run test` (PASS: 28/28 tests across workspace).
- Security/invariants: Filtering published journeys only, local-first progress.

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review & test).
- Feature commit/PR: TBD (Người dùng tự push/PR theo quy tắc).
- Merge status: NOT_MERGED.
